// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { pranchaDoSvg, svgDaPrancha } from './svg';
import { agrupar, emCaminho, textos, umObjeto, type Prancha } from './design';
import { contornoDaElipse } from './vetor';

const PRANCHA: Prancha = {
  id: 'p', nome: 'Ícone', largura: 256, altura: 256, fundo: '#FFFFFF',
  objetos: [
    { id: 'referencia', nome: 'Modelo', tipo: 'referencia', x: 0, y: 0, largura: 100, altura: 100,
      contornos: [contornoDaElipse(0, 0, 100, 100)], opacidade: 0.3 },
    { id: 'chao', nome: 'Chão', tipo: 'retangulo', x: 20, y: 200, largura: 216, altura: 16, preenchimento: '#1B4D3E',
      traco: { cor: '#000000', espessura: 4, extremidade: 'redonda' } },
    { id: 'sol', nome: 'Sol', tipo: 'elipse', x: 160, y: 20, largura: 60, altura: 60, preenchimento: '#F2C14E' },
    emCaminho({ id: 'barraca', nome: 'Barraca', tipo: 'elipse', x: 40, y: 80, largura: 120, altura: 120, preenchimento: '#C13516' })!,
    { id: 'nome', nome: 'Nome', tipo: 'texto', texto: 'PIONEIROS', x: 28, y: 220, largura: 200,
      familia: 'Space Mono', peso: 700, corpo: 20, entrelinha: 1.2, cor: '#1F2A24', alinhamento: 'centro' },
  ],
};

describe('o SVG da prancha', () => {
  it('é legível: um elemento por linha, com o id da camada e números curtos', () => {
    const svg = svgDaPrancha(PRANCHA);
    expect(svg).toContain('<rect id="chao" data-nome="Chão" x="20" y="200" width="216" height="16"');
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('<ellipse id="sol" data-nome="Sol" cx="190" cy="50" rx="30" ry="30"');
    expect(svg).toMatch(/<path id="barraca" data-nome="Barraca" d="M 100 80 C /);
    expect(svg).not.toMatch(/\d\.\d{3}/);
  });

  it('não leva a referência do examinador', () => {
    expect(svgDaPrancha(PRANCHA)).not.toContain('referencia');
  });

  it('vai e volta sem mudar o desenho', () => {
    const lida = pranchaDoSvg(svgDaPrancha(PRANCHA), PRANCHA);
    expect('prancha' in lida).toBe(true);
    if (!('prancha' in lida)) return;
    expect(svgDaPrancha(lida.prancha)).toBe(svgDaPrancha(PRANCHA));
    expect(umObjeto(lida.prancha, 'referencia')).toBeDefined();
    expect(textos(lida.prancha)[0].texto).toBe('PIONEIROS');
  });

  it('mudar o x do retângulo no arquivo move o retângulo', () => {
    const svg = svgDaPrancha(PRANCHA).replace('<rect id="chao" data-nome="Chão" x="20"', '<rect id="chao" data-nome="Chão" x="60"');
    const lida = pranchaDoSvg(svg, PRANCHA);
    if (!('prancha' in lida)) throw new Error(lida.erro);
    expect(umObjeto(lida.prancha, 'chao')!.x).toBe(60);
  });

  it('mudar um número do d move só aquele nó', () => {
    const svg = svgDaPrancha(PRANCHA).replace('d="M 100 80', 'd="M 100 40');
    const lida = pranchaDoSvg(svg, PRANCHA);
    if (!('prancha' in lida)) throw new Error(lida.erro);
    const b = umObjeto(lida.prancha, 'barraca')!;
    expect(b.tipo === 'caminho' && b.contornos[0].nos[0].y).toBe(40);
    expect(b.y).toBe(40);
  });

  it('grupo vai e volta, com os filhos dentro', () => {
    const comGrupo = agrupar(PRANCHA, ['chao', 'sol'], 'paisagem', 'Paisagem');
    const svg = svgDaPrancha(comGrupo);
    expect(svg).toContain('<g id="paisagem" data-nome="Paisagem">');
    const lida = pranchaDoSvg(svg, comGrupo);
    if (!('prancha' in lida)) throw new Error(lida.erro);
    expect(svgDaPrancha(lida.prancha)).toBe(svg);
  });

  it('diz onde errou, em vez de abrir vazio', () => {
    const quebrado = svgDaPrancha(PRANCHA).replace('x="20"', 'x="vinte"');
    expect(pranchaDoSvg(quebrado, PRANCHA)).toEqual({ erro: expect.stringContaining('"chao"') });
    expect(pranchaDoSvg(svgDaPrancha(PRANCHA).replace('</svg>', ''), PRANCHA))
      .toEqual({ erro: expect.stringContaining('erro de escrita') });
    expect(pranchaDoSvg(svgDaPrancha(PRANCHA).replace(/d="M [^"]*"/, 'd="M 10 10 A 5 5 0 0 1 20 20"'), PRANCHA))
      .toEqual({ erro: expect.stringContaining('não entende') });
  });
});
