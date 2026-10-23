import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'opentype.js';
import { ARQUIVO_DA_FONTE, contornosDoTexto, podeConverter, textoEmCaminho } from './textoEmCurvas';
import { alturaDoTexto, type Texto } from './design';
import { areaPintada, caixaDosContornos } from './vetor';

/* O mesmo arquivo que a tela baixa, lido do disco: a trava confere a fonte que
   vai para o ar, e não uma parecida. */
const bytes = readFileSync(`public/${ARQUIVO_DA_FONTE}`);
const fonte = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);

const texto = (extra: Partial<Texto> = {}): Texto => ({
  id: 't', nome: 'Nome do clube', tipo: 'texto', texto: 'PIONEIROS', x: 40, y: 100, largura: 400,
  familia: 'Space Mono', peso: 700, corpo: 40, entrelinha: 1.2, cor: '#1B4D3E', alinhamento: 'esquerda', ...extra,
});

describe('converter texto em curvas', () => {
  it('só converte a fonte cujo arquivo a plataforma tem', () => {
    expect(podeConverter(texto())).toBe(true);
    expect(podeConverter(texto({ familia: 'Arial' }))).toBe(false);
  });

  it('o O tem furo: dois contornos, e a área desconta o miolo', () => {
    const o = contornosDoTexto(fonte, texto({ texto: 'O' }));
    expect(o).toHaveLength(2);
    const so = areaPintada([o[0]]);
    expect(areaPintada(o)).toBeLessThan(so);
  });

  it('as letras ficam dentro da caixa que o texto ocupava', () => {
    const t = texto();
    const c = caixaDosContornos(contornosDoTexto(fonte, t));
    expect(c.x).toBeGreaterThanOrEqual(t.x - 1);
    expect(c.y).toBeGreaterThanOrEqual(t.y - 1);
    expect(c.y + c.altura).toBeLessThanOrEqual(t.y + alturaDoTexto(t) + 1);
    /* Nove letras de uma monoespaçada de 0,6 em: perto de 216 de largura. */
    expect(c.largura).toBeGreaterThan(190);
    expect(c.largura).toBeLessThan(230);
  });

  it('o caminho leva a cor e o nome, e não leva traço', () => {
    const c = textoEmCaminho(fonte, texto());
    expect(c.preenchimento).toBe('#1B4D3E');
    expect(c.nome).toBe('Nome do clube');
    expect(c.traco).toBeNull();
    expect(c.contornos.every(k => k.fechado)).toBe(true);
  });

  it('centrado fica no meio da caixa', () => {
    const t = texto({ alinhamento: 'centro' });
    const c = caixaDosContornos(contornosDoTexto(fonte, t));
    expect(Math.abs(c.x + c.largura / 2 - (t.x + t.largura / 2))).toBeLessThan(6);
  });
});
