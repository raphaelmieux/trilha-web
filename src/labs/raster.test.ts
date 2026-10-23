import { describe, expect, it } from 'vitest';
import {
  achatar, adicionarMascara, ajustar, apagarSelecao, carimbar, documentoDe, duplicarCamada, girar, girarDocumento,
  imagemDo, inclinacao, linear, novaImagem, pintar, pixel, recortar, recortarDocumento, redimensionar, selecionarPorCor,
  semelhanca, tonsDe, tamanhoImpresso, comPpi, type Imagem,
} from './raster';
import { bytesDoPng, exportar, FRACAO_DO_WEBP } from './formatosDeImagem';
import { cenaDoAcampamento, fotoDoAcampamento, INCLINACAO_DA_CAMERA, LINHA_DO_CHAO } from './fotosDoClube';

/*
  O motor da imagem de pontos e os quatro formatos, com as premissas que as
  lições da CC-DG003 contam como verdade. Igualar uma delas não estoura nada —
  um JPG que não perdesse nada deixaria o requisito 2.3 sem o que mostrar —,
  e por isso cada uma tem trava.
*/

const xadrez = (lado = 16): Imagem => {
  const img = novaImagem(lado, lado, 72, [0, 0, 0, 255]);
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
    if ((x + y) % 2) { const i = (y * lado + x) * 4; img.px[i] = img.px[i + 1] = img.px[i + 2] = 255; }
  }
  return img;
};

describe('geometria', () => {
  it('girar a foto torta põe o chão na mesma altura dos dois lados', () => {
    const chao = (img: Imagem, x: number) => {
      for (let y = 300; y < img.altura; y++) { const [r, g, b] = pixel(img, x, y); if (g > b + 15 && g > r + 20) return y; }
      return -1;
    };
    const torta = fotoDoAcampamento();
    expect(Math.abs(chao(torta, 80) - chao(torta, 1650))).toBeGreaterThan(50);
    const reta = girar(torta, -INCLINACAO_DA_CAMERA);
    expect(Math.abs(chao(reta, 80) - chao(reta, 1650))).toBeLessThanOrEqual(2);
    expect(Math.abs(chao(reta, 1650) - LINHA_DO_CHAO)).toBeLessThanOrEqual(3);
    expect(inclinacao(reta)).toBeCloseTo(0, 6);
  }, 20000);

  it('girar abre cantos transparentes, e não brancos', () => {
    const g = girar(novaImagem(100, 60, 72, [10, 20, 30, 255]), 10);
    expect(pixel(g, 0, 0)[3]).toBe(0);
    expect(pixel(g, 50, 30)).toEqual([10, 20, 30, 255]);
  });

  it('recortar leva o mapa junto', () => {
    const r = recortar(cenaDoAcampamento(), { x: 100, y: 50, l: 400, a: 300 });
    expect(r.mapa.e).toBe(-100);
    expect(r.mapa.f).toBe(-50);
    expect([r.largura, r.altura]).toEqual([400, 300]);
  }, 20000);

  it('diminuir faz média, e aumentar inventa o meio-termo', () => {
    const pequena = redimensionar(xadrez(), 8, 8);
    expect(pixel(pequena, 3, 3)[0]).toBeGreaterThan(110);
    expect(pixel(pequena, 3, 3)[0]).toBeLessThan(145);
    const grande = redimensionar(xadrez(4), 16, 16);
    const cinzas = Array.from({ length: 16 }, (_, x) => pixel(grande, x, 6)[0]).filter(v => v > 30 && v < 225);
    expect(cinzas.length).toBeGreaterThan(4);
  });

  it('mudar o ppi não muda pixel nenhum, só o tamanho no papel', () => {
    const d = documentoDe('f', novaImagem(1800, 1200, 72));
    const e = comPpi(d, 300);
    expect(imagemDo(e).largura).toBe(1800);
    expect(tamanhoImpresso(imagemDo(e)).l).toBeCloseTo(15.24, 2);
    expect(tamanhoImpresso(imagemDo(d)).l).toBeCloseTo(63.5, 1);
  });
});

describe('tom e cor', () => {
  it('um ponto de exposição dobra a luz', () => {
    const img = novaImagem(1, 1, 72, [60, 60, 60, 255]);
    const mais = ajustar(img, { exposicao: 1, contraste: 0, temperatura: 0 });
    expect(linear(pixel(mais, 0, 0)[0]) / linear(60)).toBeCloseTo(2, 1);
  });

  it('esquentar sobe o vermelho e baixa o azul', () => {
    const [r, g, b] = pixel(ajustar(novaImagem(1, 1, 72, [128, 128, 128, 255]), { exposicao: 0, contraste: 0, temperatura: 50 }), 0, 0);
    expect(r).toBeGreaterThan(g);
    expect(b).toBeLessThan(g);
  });

  it('contraste espalha os tons a partir do meio', () => {
    const img = novaImagem(2, 1, 72, [100, 100, 100, 255]);
    img.px.set([160, 160, 160, 255], 4);
    const c = ajustar(img, { exposicao: 0, contraste: 50, temperatura: 0 });
    expect(pixel(c, 1, 0)[0] - pixel(c, 0, 0)[0]).toBeGreaterThan(80);
  });
});

describe('pincéis e seleção', () => {
  it('o carimbo copia textura; o pincel pinta liso', () => {
    const img = xadrez(64);
    const carimbo = carimbar(img, { x: 20, y: 20 }, { dx: 31, dy: 0 }, 8);
    const pincel = pintar(img, { x: 20, y: 20 }, [128, 128, 128], 8);
    const desvio = (i: Imagem) => tonsDe(i, { x: 17, y: 17, l: 6, a: 6 }).desvio;
    expect(desvio(carimbo)).toBeGreaterThan(0.3);
    expect(desvio(pincel)).toBeLessThan(0.05);
  });

  it('a varinha contígua não pula para o mesmo tom do outro lado de uma barreira', () => {
    const img = novaImagem(30, 10, 72, [200, 200, 200, 255]);
    for (let y = 0; y < 10; y++) img.px.set([0, 0, 0, 255], (y * 30 + 15) * 4);
    const contigua = selecionarPorCor(img, 2, 2, 10);
    const toda = selecionarPorCor(img, 2, 2, 10, false);
    expect(contigua.v[5 * 30 + 25]).toBe(0);
    expect(toda.v[5 * 30 + 25]).toBe(255);
  });

  it('excluir a seleção deixa transparente, e não branco', () => {
    const img = novaImagem(4, 4, 72, [50, 60, 70, 255]);
    const sem = apagarSelecao(img, selecionarPorCor(img, 0, 0, 5));
    expect(pixel(sem, 1, 1)[3]).toBe(0);
  });
});

describe('camadas', () => {
  it('a máscara preta esconde a camada de cima', () => {
    const d = documentoDe('f', novaImagem(4, 4, 72, [0, 0, 0, 255]));
    const copia = duplicarCamada(d, 'c');
    const clara = { ...copia, camadas: copia.camadas.map(c => (c.id === 'c' ? { ...c, imagem: novaImagem(4, 4, 72, [255, 255, 255, 255]) } : c)) };
    const metade = selecionarPorCor(novaImagem(4, 4, 72, [9, 9, 9, 255]), 0, 0, 0);
    metade.v.fill(0, 8);
    const com = adicionarMascara({ ...clara, selecao: metade });
    const vista = achatar(com.camadas);
    expect(pixel(vista, 0, 0)[0]).toBe(255);
    expect(pixel(vista, 0, 3)[0]).toBe(0);
  });

  it('girar e recortar o documento levam a máscara junto', () => {
    const d = adicionarMascara(duplicarCamada(documentoDe('f', novaImagem(100, 60, 72, [1, 2, 3, 255])), 'c'));
    const g = recortarDocumento(girarDocumento(d, 5), { x: 10, y: 10, l: 50, a: 30 });
    const m = g.camadas[1].mascara!;
    expect([m.largura, m.altura]).toEqual([50, 30]);
  });
});

describe('os formatos', () => {
  const cena = () => cenaDoAcampamento();

  it('o JPG perde: a foto que volta não é a que foi', () => {
    const c = cena(); const j = exportar(c, 'jpg', 'f.jpg', 85);
    expect(semelhanca(c, j.imagem)).toBeLessThan(1);
  }, 20000);

  it('o PNG volta idêntico, e uma foto em PNG pesa muito mais que em JPG', () => {
    const c = cena(); const p = exportar(c, 'png', 'f.png'); const j = exportar(c, 'jpg', 'f.jpg', 85);
    expect(p.imagem.px.every((v, i) => v === c.px[i])).toBe(true);
    expect(p.bytes).toBeGreaterThan(j.bytes * 5);
  }, 20000);

  it('o PNG de um desenho liso pesa pouco perto do de uma foto do mesmo tamanho', () => {
    const liso = novaImagem(1800, 1200, 72, [20, 90, 60, 255]);
    expect(bytesDoPng(liso, 3)).toBeLessThan(bytesDoPng(cena(), 3) / 50);
  }, 20000);

  it('o JPG joga fora o canal de transparência; PNG, WEBP e TIFF guardam', () => {
    const img = apagarSelecao(novaImagem(32, 32, 72, [200, 30, 40, 255]), selecionarPorCor(novaImagem(32, 32, 72, [1, 1, 1, 255]), 0, 0, 0));
    expect(pixel(exportar(img, 'jpg', 'a.jpg').imagem, 5, 5)).toEqual([255, 255, 255, 255]);
    for (const f of ['png', 'webp', 'tiff'] as const) expect(pixel(exportar(img, f, `a.${f}`).imagem, 5, 5)[3]).toBe(0);
  });

  it('qualidade menor pesa menos e perde mais', () => {
    const c = cena(); const alta = exportar(c, 'jpg', 'a', 90); const baixa = exportar(c, 'jpg', 'b', 30);
    expect(baixa.bytes).toBeLessThan(alta.bytes);
    expect(semelhanca(c, baixa.imagem)).toBeLessThan(semelhanca(c, alta.imagem));
  }, 20000);

  it('o WEBP custa menos que o JPG na mesma qualidade, e o TIFF é o maior', () => {
    expect(FRACAO_DO_WEBP).toBeLessThan(1);
    const c = cena();
    const j = exportar(c, 'jpg', 'a', 80); const w = exportar(c, 'webp', 'a', 80); const t = exportar(c, 'tiff', 'a'); const p = exportar(c, 'png', 'a');
    expect(w.bytes).toBeLessThan(j.bytes);
    expect(t.bytes).toBeGreaterThan(p.bytes);
  }, 20000);
});
