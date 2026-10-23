import { describe, expect, it } from 'vitest';
import {
  AJUSTE_DE_REFERENCIA, FRACAO_MAXIMA, LICOES_DA_CC_DG003, ORIGEM_DO_CARIMBO, RAIO_DO_CARIMBO, RECORTE_DE_REFERENCIA,
  arquivoDaCrua, arquivoDaEditada, estadoDepois, fotoAjustada, fotoCrua, fotoLimpa, fotoNivelada, metasDa,
  toquesNaGarrafa, type ContextoDaFoto, type LicaoDaCcDg003,
} from './metasDaCcDg003';
import {
  adicionarMascara, ajustar, apagarSelecao, caixaNaImagem, carimbar, comPpi, duplicarCamada, girarDocumento,
  imagemDo, naCamadaAtiva, pintar, recortarDocumento, redimensionar, redimensionarDocumento, selecionarPorCor,
  type Documento,
} from './raster';
import { BARRACA, GARRAFA, INCLINACAO_DA_CAMERA } from './fotosDoClube';
import { exportar } from './formatosDeImagem';

/*
  As metas da CC-DG003, pelo motor.

  Três coisas por lição: nenhuma abre verde, a solução de referência — escrita
  com as mesmas operações que a janela chama — fecha todas, e o caminho errado
  que a lição existe para mostrar reprova. Medir pixel custa: as fotos são
  geradas uma vez e guardadas, e as travas mais pesadas declaram o orçamento.
*/

const LICOES = Object.keys(LICOES_DA_CC_DG003) as LicaoDaCcDg003[];
const feitas = (licao: LicaoDaCcDg003, c: ContextoDaFoto) => metasDa(licao).filter(m => m.feita(c)).map(m => m.id);
const meta = (licao: LicaoDaCcDg003, id: string) => metasDa(licao).find(m => m.id === id)!;
const com = (licao: LicaoDaCcDg003, documento: Documento, extra: Partial<ContextoDaFoto> = {}): ContextoDaFoto =>
  ({ ...LICOES_DA_CC_DG003[licao].contexto(), documento, ...extra });

describe('cada lição da CC-DG003', () => {
  it.each(LICOES)('%s abre com todas as metas por fazer', licao => {
    expect(feitas(licao, LICOES_DA_CC_DG003[licao].contexto())).toEqual([]);
  }, 30000);

  it.each(LICOES)('%s fecha com a solução de referência', licao => {
    const c = estadoDepois(licao);
    expect(feitas(licao, c)).toEqual(metasDa(licao).map(m => m.id));
  }, 30000);

  it('toda meta tem passo a passo', () => {
    for (const l of LICOES) for (const m of metasDa(l)) expect(m.passos.length, `${l}/${m.id}`).toBeGreaterThan(0);
  });
});

describe('recortar e nivelar', () => {
  it('recortar sem girar não nivela', () => {
    const c = com('recortar', recortarDocumento(fotoCrua(), RECORTE_DE_REFERENCIA));
    expect(feitas('recortar', c)).toEqual(['barraca-inteira']);
  }, 20000);

  it('girar sem recortar deixa os cantos vazios', () => {
    const c = com('recortar', girarDocumento(fotoCrua(), -INCLINACAO_DA_CAMERA));
    expect(feitas('recortar', c)).toEqual(['nivelou']);
  }, 20000);

  it('girar para o lado errado dobra a inclinação', () => {
    const d = recortarDocumento(girarDocumento(fotoCrua(), INCLINACAO_DA_CAMERA), RECORTE_DE_REFERENCIA);
    expect(meta('recortar', 'nivelou').feita(com('recortar', d))).toBe(false);
  }, 20000);

  it('recorte que só raspa a borda deixa a ponta dos cantos', () => {
    const d = recortarDocumento(girarDocumento(fotoCrua(), -INCLINACAO_DA_CAMERA), { x: 20, y: 20, l: 1760, a: 1160 });
    expect(feitas('recortar', com('recortar', d))).toEqual(['nivelou', 'barraca-inteira']);
  }, 20000);

  it('recorte apertado demais corta a barraca', () => {
    const g = girarDocumento(fotoCrua(), -INCLINACAO_DA_CAMERA);
    const b = caixaNaImagem(imagemDo(g), BARRACA);
    const d = recortarDocumento(g, { x: b.x + 40, y: 200, l: 900, a: 700 });
    expect(meta('recortar', 'barraca-inteira').feita(com('recortar', d))).toBe(false);
    expect(meta('recortar', 'recortou-os-cantos').feita(com('recortar', d))).toBe(true);
  }, 20000);
});

describe('exposição, contraste e temperatura', () => {
  const so = (aj: Partial<typeof AJUSTE_DE_REFERENCIA>) =>
    com('ajustes', naCamadaAtiva(fotoNivelada(), img => ajustar(img, { exposicao: 0, contraste: 0, temperatura: 0, ...aj })));

  it('cada controle fecha a sua meta e só ela', () => {
    expect(feitas('ajustes', so({ exposicao: AJUSTE_DE_REFERENCIA.exposicao }))).toEqual(['exposicao']);
    expect(feitas('ajustes', so({ temperatura: AJUSTE_DE_REFERENCIA.temperatura }))).toEqual(['temperatura']);
  }, 20000);

  it('exposição demais estoura o branco e reprova a luz', () => {
    expect(meta('ajustes', 'exposicao').feita(so({ exposicao: 2, contraste: 30, temperatura: 40 }))).toBe(false);
  }, 20000);

  it('contraste demais estoura, mesmo com a luz no lugar', () => {
    expect(meta('ajustes', 'contraste').feita(so({ exposicao: 0.7, contraste: 80, temperatura: 40 }))).toBe(false);
  }, 20000);

  it('esquentar demais deixa a placa amarela', () => {
    expect(meta('ajustes', 'temperatura').feita(so({ exposicao: 0.7, contraste: 30, temperatura: 90 }))).toBe(false);
  }, 20000);
});

describe('tirar a garrafa', () => {
  it('pintar de verde tampa o azul e deixa o remendo liso', () => {
    const d = naCamadaAtiva(fotoAjustada(), img => toquesNaGarrafa(img).reduce((im, p) => pintar(im, p, [90, 150, 70], RAIO_DO_CARIMBO), img));
    expect(feitas('remover', com('remover', d))).toEqual(['garrafa-sumiu', 'resto-intacto']);
  }, 20000);

  it('carimbo com pincel enorme leva junto o que estava em volta', () => {
    const d = naCamadaAtiva(fotoAjustada(), img => {
      const g = caixaNaImagem(img, GARRAFA);
      return carimbar(img, { x: g.x + g.l / 2, y: g.y + g.a / 2 }, ORIGEM_DO_CARIMBO, 200);
    });
    const c = com('remover', d);
    expect(meta('remover', 'garrafa-sumiu').feita(c)).toBe(true);
    expect(meta('remover', 'resto-intacto').feita(c)).toBe(false);
  }, 20000);
});

describe('camadas e máscara', () => {
  it('clarear direto na camada de fundo é destrutivo', () => {
    const d = naCamadaAtiva(fotoLimpa(), img => ajustar(img, { exposicao: 0.8, contraste: 0, temperatura: 0 }));
    expect(feitas('camadas', com('camadas', d))).toEqual([]);
  }, 20000);

  it('duplicar e depois clarear a camada de baixo não protege nada', () => {
    const copia = duplicarCamada(fotoLimpa(), 'copia');
    const d = naCamadaAtiva({ ...copia, ativa: 'fundo' }, img => ajustar(img, { exposicao: 0.8, contraste: 0, temperatura: 0 }));
    expect(meta('camadas', 'duas-camadas').feita(com('camadas', d))).toBe(false);
  }, 20000);

  it('cópia clareada sem máscara clareia o céu junto', () => {
    const d = naCamadaAtiva(duplicarCamada(fotoLimpa(), 'copia'), img => ajustar(img, { exposicao: 0.8, contraste: 0, temperatura: 0 }));
    expect(feitas('camadas', com('camadas', d))).toEqual(['duas-camadas', 'barraca-mais-clara']);
  }, 20000);

  it('máscara sem seleção mostra tudo, e o céu clareia do mesmo jeito', () => {
    const d = adicionarMascara(naCamadaAtiva(duplicarCamada(fotoLimpa(), 'copia'), img => ajustar(img, { exposicao: 0.8, contraste: 0, temperatura: 0 })));
    expect(meta('camadas', 'mascara-no-ceu').feita(com('camadas', d))).toBe(false);
  }, 20000);
});

describe('o fundo transparente', () => {
  const recortado = (tolerancia: number) => {
    const c = LICOES_DA_CC_DG003.transparencia.contexto();
    const img = imagemDo(c.documento!);
    const sel = [[20, 20], [980, 20], [20, 780], [980, 780], [500, 760]]
      .map(([x, y]) => selecionarPorCor(img, x, y, tolerancia)).reduce((a, b) => ({ ...a, v: a.v.map((v, i) => Math.max(v, b.v[i])) }));
    return { c, d: naCamadaAtiva(c.documento!, im => apagarSelecao(im, sel)) };
  };

  it('exportar em JPG traz o fundo de volta, branco', () => {
    const { c, d } = recortado(36);
    const jpg = { ...exportar(imagemDo(d), 'jpg', 'escudo.jpg', 90), original: false };
    const ctx = { ...c, documento: d, pasta: [...c.pasta, jpg] };
    expect(feitas('transparencia', ctx)).toEqual(['fundo-transparente', 'escudo-inteiro']);
  }, 20000);

  it('tolerância alta demais leva a borda amarela junto com a mesa', () => {
    const { c, d } = recortado(90);
    expect(feitas('transparencia', { ...c, documento: d })).toEqual(['fundo-transparente']);
  }, 20000);
});

describe('tela e papel', () => {
  const ctx = LICOES_DA_CC_DG003.tamanhos.contexto;

  it('300 ppi com Reamostrar ligado inventa pixels, e não vale', () => {
    const c = ctx(); const d = c.documento!;
    const largura = Math.round(imagemDo(d).largura * 300 / 72 / 3);
    const inventada = imagemDo(comPpi(redimensionarDocumento(d, largura, Math.round(largura * 1080 / 1640)), 300));
    const f = { ...exportar(inventada, 'tiff', 'impressao.tif'), original: false };
    expect(meta('tamanhos', 'arquivo-de-impressao').feita({ ...c, pasta: [...c.pasta, f] })).toBe(false);
  }, 20000);

  it('a original exportada com outro nome não vale por arquivo de tela', () => {
    const c = ctx();
    const f = { ...exportar(imagemDo(c.documento!), 'jpg', 'tela.jpg', 85), original: false };
    expect(meta('tamanhos', 'arquivo-de-tela').feita({ ...c, pasta: [...c.pasta, f] })).toBe(false);
  }, 20000);
});

describe('compressão', () => {
  const original = () => arquivoDaEditada();
  const com8 = (nome: string, largura: number, q: number, formato: 'jpg' | 'png' = 'jpg') => {
    const c = LICOES_DA_CC_DG003.formatos.contexto();
    const o = original().imagem;
    const img = largura === o.largura ? o : redimensionar(o, largura, Math.round(largura * o.altura / o.largura));
    const f = { ...exportar(img, formato, nome, q), original: false };
    return { ...c, pasta: nome === original().nome ? [f] : [...c.pasta, f] };
  };

  it('qualidade 20 reduz muito e se vê', () => {
    const c = com8('web.jpg', 1200, 20);
    expect(meta('formatos', 'reduziu-sessenta').feita(c)).toBe(true);
    expect(meta('formatos', 'sem-perda-perceptivel').feita(c)).toBe(false);
  }, 20000);

  it('PNG não reduz uma foto', () => {
    const c = com8('web.png', 1640, 0, 'png');
    expect(c.pasta[1].bytes).toBeGreaterThan(original().bytes / FRACAO_MAXIMA);
    expect(meta('formatos', 'reduziu-sessenta').feita(c)).toBe(false);
  }, 20000);

  it('exportar com o nome da original escreve por cima dela', () => {
    const c = com8(original().nome, 1200, 75);
    expect(meta('formatos', 'reduziu-sessenta').feita(c)).toBe(true);
    expect(meta('formatos', 'original-guardado').feita(c)).toBe(false);
  }, 20000);

  it('miniatura de 300 pixels não é foto para a página', () => {
    expect(meta('formatos', 'reduziu-sessenta').feita(com8('mini.jpg', 300, 80))).toBe(false);
  }, 20000);
});

describe('direitos', () => {
  it('marcar todas as fontes não vale por escolher', () => {
    const c = estadoDepois('direitos');
    expect(meta('direitos', 'indicou-duas-fontes').feita({ ...c, caderno: { ...c.caderno, fontes: ['commons', 'openverse', 'busca'] } })).toBe(false);
  });

  it('o desenho do colega não é seu por ter chegado ao seu celular', () => {
    const c = estadoDepois('direitos');
    const errado = { ...c, caderno: { ...c.caderno, licencas: { ...c.caderno.licencas, 'desenho-colega': 'propria' as const } } };
    expect(meta('direitos', 'classificou-as-imagens').feita(errado)).toBe(false);
  });
});

describe('a edição completa', () => {
  it('exportar por cima da foto da câmera apaga o antes', () => {
    const c = estadoDepois('completa');
    const f = c.pasta.find(a => !a.original)!;
    const porCima = { ...c, pasta: [{ ...f, nome: arquivoDaCrua().nome }] };
    expect(meta('completa', 'exportou-sem-apagar').feita(porCima)).toBe(false);
  }, 30000);

  it('uma edição pela metade não fecha a lição', () => {
    const c = LICOES_DA_CC_DG003.completa.contexto();
    const meio = recortarDocumento(girarDocumento(c.documento!, -INCLINACAO_DA_CAMERA), RECORTE_DE_REFERENCIA);
    expect(feitas('completa', { ...c, documento: meio })).toEqual([]);
  }, 30000);
});
