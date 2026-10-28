import { describe, it, expect } from 'vitest';
import { planilhaDe } from './planilha';
import {
  alternarAncoragem, podeApontar, referenciasDaFormula, regiaoAtual, saltar, ultimaUsada,
} from './teclasDaPlanilha';

/*
  As regras do teclado do Excel, cada uma com o caminho óbvio que erra calado.
*/

const p = planilhaDe('Teste', [
  ['Unidade', 'Inscritos', '', ''],
  ['Falcão', '12', '', ''],
  ['Águia', '9', '', ''],
  ['', '', '', ''],
  ['', '', '', 'nota'],
]);
const em = (l: number, c: number) => ({ l1: l, c1: c, l2: l, c2: c });

describe('Ctrl+seta', () => {
  it('de dentro do bloco, para na última preenchida', () => {
    expect(saltar(p, em(0, 0), 'baixo')).toEqual(em(2, 0));
  });
  it('da borda do bloco, salta o vazio até a próxima preenchida ou a borda da grade', () => {
    expect(saltar(p, em(2, 0), 'baixo').l1).toBe(p.celulas.length - 1);
    expect(saltar(p, em(3, 3), 'baixo')).toEqual(em(4, 3));
  });
  it('com Shift estende, e a âncora fica', () => {
    expect(saltar(p, em(0, 0), 'direita', true)).toEqual({ l1: 0, c1: 0, l2: 0, c2: 1 });
  });
});

describe('Ctrl+End e Ctrl+A', () => {
  it('Ctrl+End vai à última linha e à última coluna usadas, ainda que em células diferentes', () => {
    expect(ultimaUsada(p)).toEqual({ l: 4, c: 3 });
  });
  it('Ctrl+A pega o bloco em volta, e a grade inteira numa célula vazia', () => {
    expect(regiaoAtual(p, 1, 1)).toEqual({ l1: 0, c1: 0, l2: 2, c2: 1 });
    const tudo = regiaoAtual(p, 3, 2);
    expect(tudo.l2).toBe(p.celulas.length - 1);
  });
});

describe('apontar', () => {
  it('só onde a fórmula espera uma referência', () => {
    expect(podeApontar('=')).toBe(true);
    expect(podeApontar('=SOMA(')).toBe(true);
    expect(podeApontar('=A1+')).toBe(true);
    expect(podeApontar('=A1')).toBe(false);
    expect(podeApontar('=12')).toBe(false);
    expect(podeApontar('Falcão+')).toBe(false);
  });
});

describe('F4', () => {
  it('gira em quatro passos a referência em que o cursor está', () => {
    const passos = ['=SOMA(B2)'];
    let t = passos[0];
    for (let i = 0; i < 4; i++) { t = alternarAncoragem(t, 7).texto; passos.push(t); }
    expect(passos).toEqual(['=SOMA(B2)', '=SOMA($B$2)', '=SOMA(B$2)', '=SOMA($B2)', '=SOMA(B2)']);
  });
  /* LOG10 tem cara de referência — letras e número — e é nome de função. */
  it('não gira o que é nome de função, nem texto que não é fórmula', () => {
    expect(alternarAncoragem('=LOG10(A1)', 3).texto).toBe('=LOG10(A1)');
    expect(alternarAncoragem('B2', 2).texto).toBe('B2');
  });
});

describe('as cores das referências', () => {
  it('uma cor por faixa, a mesma para a repetida, e nada para outra aba', () => {
    const r = referenciasDaFormula('=SOMA(B2:B5)+B2+Custos!A1+B2:B5');
    expect(r).toHaveLength(3);
    expect(r[0].faixa).toEqual({ l1: 1, c1: 1, l2: 4, c2: 1 });
    expect(r[2].cor).toBe(r[0].cor);
    expect(r[1].cor).not.toBe(r[0].cor);
  });
});
