import { describe, it, expect } from 'vitest';
import { formatWithOptions } from 'node:util';
import { formatarLinha } from './inspecionar';

/*
  O `console.log` imitado, conferido contra o `util.format` do próprio Node,
  que é o que o `console.log` de verdade chama. Os valores são os que as
  lições imprimem — e as formas que mudam de linha, que são onde uma imitação
  de memória erraria primeiro: os arranjos de mais de seis números, que o Node
  arruma em colunas, e o objeto que passa de oitenta colunas.
*/

class Ponto { x = 1; y = 2; }
const circular: Record<string, unknown> = { a: 1 };
circular.eu = circular;

const VALORES: [string, unknown[]][] = [
  ['números e texto solto', ['soma', 3, -0, 0.1 + 0.2, 10n]],
  ['arranjo curto', [[1, 2, 3]]],
  ['arranjo de sete números', [[1, 2, 3, 4, 5, 6, 7]]],
  ['arranjo longo de números', [Array.from({ length: 30 }, (_, i) => i * 13)]],
  ['arranjo de textos', [['Águia', 'Onça', 'Tucano', 'Falcão', 'Lobo', 'Pantera', 'Leão']]],
  ['objeto simples', [{ nome: 'Ana', idade: 12 }]],
  ['chaves que pedem aspas', [{ 'a-b': 1, 2: 'x', ok: true }]],
  ['vazios', [[], {}, '']],
  ['arranjo de objetos', [[{ nome: 'Ana', idade: 12 }, { nome: 'Bia', idade: 11 }]]],
  ['profundidade', [{ a: { b: { c: { d: 1 } } } }]],
  ['aspas dentro do texto', [["it's"], ['diz "oi"']]],
  ['nulos', [null, undefined, [undefined, null]]],
  ['funções', [function soma() {}, () => 1, async function f() {}, class A {}]],
  ['instância de classe', [new Ponto()]],
  ['Map e Set', [new Map([['a', 1]]), new Set([1, 2])]],
  ['objeto que passa da linha', [{ lista: [1, 2, 3], dono: { nome: 'Tio Márcio', unidades: ['Águia', 'Onça'] } }]],
  ['doze objetos', [Array.from({ length: 12 }, (_, i) => ({ id: i, nome: `Desbravador ${i}` }))]],
  ['circular', [circular]],
  ['método', [{ soma(a: number, b: number) { return a + b; }, total: 3 }]],
  ['data e expressão regular', [new Date(0), /a+/g]],
  ['formato com %', ['%s tem %d anos e %i irmãos (%j)', 'Ana', 12.5, 2.9, { a: 1 }]],
  ['mais de cem itens', [Array.from({ length: 105 }, () => 0)]],
];

describe('o console.log imitado escreve como o do Node', () => {
  it.each(VALORES)('%s', (_, args) => {
    expect(formatarLinha(args)).toBe(formatWithOptions({}, ...args));
  });
});
