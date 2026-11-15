// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { gruposDaFaixa } from './catalogoDaFaixa';
import { empacotarFaixa } from './empacotarFaixa';
import {
  FILEIRAS, fileirasDaFaixa, enderecosDaArte, extensaoDaPeca, marcacaoDoPano, nomeDeArquivo, svgDaFileira,
} from './exportarFaixa';

const faixa = empacotarFaixa(gruposDaFaixa());

describe('a Faixa dobrada em fileiras', () => {
  const fileiras = fileirasDaFaixa(faixa);

  it('vai de ponta a ponta, e cada peça sai numa fileira só', () => {
    expect(fileiras).toHaveLength(FILEIRAS);
    expect(fileiras[0].de).toBe(0);
    expect(fileiras[fileiras.length - 1].ate).toBe(faixa.largura);
    const vezes = new Map<string, number>();
    for (const f of fileiras) for (const id of f.pecas) vezes.set(id, (vezes.get(id) ?? 0) + 1);
    expect(vezes.size).toBe(faixa.pecas.length);
    expect([...vezes.values()].every(n => n === 1)).toBe(true);
  });

  /* Um patch cortado ao meio sairia metade no fim de uma fileira e metade no
     começo da outra. */
  it('não parte peça nenhuma na beira da fileira', () => {
    const porId = new Map(faixa.pecas.map(p => [p.id, p]));
    const partidas = fileiras.flatMap(f => [...f.pecas].filter(id => {
      const [a, b] = extensaoDaPeca(porId.get(id)!);
      return Math.max(a, 0) < f.de || Math.min(b, faixa.largura) > f.ate;
    }));
    expect(partidas).toEqual([]);
  });

  it('não separa um patch dos satélites dele', () => {
    const fileiraDe = new Map(fileiras.flatMap((f, i) => [...f.pecas].map(id => [id, i] as const)));
    const separadas = faixa.pecas.filter(p => faixa.pecas.some(q => q.unidade === p.unidade && fileiraDe.get(q.id) !== fileiraDe.get(p.id)));
    expect(separadas.map(p => p.id)).toEqual([]);
  });

  it('deixa as fileiras parecidas, sem degrau na imagem', () => {
    const media = faixa.largura / FILEIRAS;
    for (const f of fileiras) expect(Math.abs(f.ate - f.de - media) / media).toBeLessThan(0.3);
  });
});

describe('a marcação que vai para dentro da imagem', () => {
  const montar = () => {
    const pano = document.createElement('div');
    pano.className = 'fx-pano';
    pano.style.transform = 'scale(0.4)';
    pano.innerHTML = `
      <button type="button" class="fx-peca fx-patch fx-cheia" style="left: 10px" tabindex="0" aria-label="AP034">
        <span class="fx-arte" style="--src: url(&quot;/trilha-web/assets/specialties/AP034.png&quot;)"></span>
      </button>
      <button type="button" class="fx-peca fx-pin-curioso fx-cheia" style="left: 90px">
        <img src="/trilha-web/assets/pins/fim_da_planilha.png" alt="">
      </button>
      <button type="button" class="fx-peca fx-pin fx-vazia" style="left: 200px"><svg><polygon class="fx-giz" points="0,0 1,1"/></svg></button>`;
    return pano;
  };

  it('acha toda arte citada, na imagem e no --src', () => {
    expect(enderecosDaArte(montar()).sort()).toEqual([
      '/trilha-web/assets/pins/fim_da_planilha.png',
      '/trilha-web/assets/specialties/AP034.png',
    ]);
  });

  it('desenha só as peças da fileira', () => {
    const pano = montar();
    pano.querySelectorAll('button').forEach((b, i) => b.setAttribute('data-peca', `p${i}`));
    const xml = marcacaoDoPano(pano, new Map(), new Set(['p1']));
    expect(xml).toContain('fx-pin-curioso');
    expect(xml).not.toContain('fx-patch');
    expect(xml).not.toContain('fx-pin fx-vazia');
  });

  it('embute a arte, troca o botão por div e tira a escala da tela', () => {
    const arte = new Map([
      ['/trilha-web/assets/specialties/AP034.png', 'data:image/png;base64,AAA'],
      ['/trilha-web/assets/pins/fim_da_planilha.png', 'data:image/png;base64,BBB'],
    ]);
    const xml = marcacaoDoPano(montar(), arte);
    expect(xml).not.toContain('/trilha-web/assets/');
    expect(xml).toContain('data:image/png;base64,AAA');
    expect(xml).toContain('data:image/png;base64,BBB');
    expect(xml).not.toMatch(/<button/);
    expect(xml).toMatch(/class="fx-peca fx-patch fx-cheia"/);
    expect(xml).not.toContain('scale(0.4)');
  });

  /* O SVG é XML: um caractere fora do lugar e a imagem sai vazia, sem erro. */
  it('sai como SVG que um analisador de XML aceita', () => {
    const xml = marcacaoDoPano(montar(), new Map());
    const svg = svgDaFileira(xml, 'data:font/woff2;base64,CCC', faixa.largura, faixa.altura, 100, 3300);
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.documentElement.getAttribute('viewBox')).toBe(`100 0 3200 ${faixa.altura}`);
    expect(svg).toContain('.fx-patch .fx-arte');
  });
});

describe('o nome do arquivo', () => {
  it('sai sem acento e sem espaço', () => {
    expect(nomeDeArquivo('João Antônio')).toBe('joao-antonio');
    expect(nomeDeArquivo('  ')).toBe('desbravador');
  });
});
