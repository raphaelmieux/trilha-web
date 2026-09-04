import { describe, it, expect } from 'vitest';
import { roteiroDeApresentacao, pilhasSemChapeu } from './roteiroDeApresentacao';
import type { Bloco, Ator, Projeto } from './blocos';

let n = 0;
const b = (tipo: Bloco['tipo'], resto: object = {}): Bloco =>
  ({ id: `t${(n += 1)}`, tipo, ...resto } as Bloco);

const ator = (id: string, nome: string, blocos: Bloco[][]): Ator => ({
  id, nome, fantasias: ['🐱'], x: 0, y: 0,
  pilhas: blocos.map((bs, i) => ({ id: `${id}-p${i}`, blocos: bs })),
});

const proj = (atores: Ator[], variaveis: Projeto['variaveis'] = []): Projeto =>
  ({ atores, variaveis });

describe('o roteiro descreve a pilha', () => {
  it('diz quando ela roda, pelo chapéu', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [
      [b('quandoBandeira'), b('mover', { passos: 10 })],
      [b('quandoTecla', { tecla: 'direita' }), b('mover', { passos: 10 })],
    ])]));
    expect(r).toHaveLength(2);
    expect(r[0].quando).toContain('bandeira verde');
    expect(r[1].quando).toContain('direita');
    expect(r[0].ator).toBe('Gato');
  });

  /*
    Pilha sem chapéu não roda nunca. Explicá-la mandaria a pessoa falar, na
    frente do examinador, de um trecho que ele não vai ver acontecer.
  */
  it('deixa de fora a pilha que não roda, e a conta à parte', () => {
    const p = proj([ator('gato', 'Gato', [[b('mover', { passos: 10 })]])]);
    expect(roteiroDeApresentacao(p)).toEqual([]);
    expect(pilhasSemChapeu(p)).toBe(1);
  });

  it('fala na primeira pessoa, que é como se apresenta em voz alta', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [
      [b('quandoBandeira'), b('diga', { texto: 'oi' })],
    ])]));
    expect(r[0].faz[0]).toBe('mostro o balão dizendo "oi"');
  });
});

describe('o que está dentro de um laço aparece recuado', () => {
  it('recua o corpo do container, e só ele', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [[
      b('quandoBandeira'),
      b('sempre', { corpo: [
        b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('mudeVariavel', { nome: 'placar', por: 1 })] }),
      ]}),
      b('pareTudo'),
    ]])]));
    const faz = r[0].faz;
    expect(faz[0]).toBe('fico repetindo o que está aqui dentro, sem parar, para vigiar o tempo todo');
    expect(faz[1].startsWith('  ')).toBe(true);
    expect(faz[2].startsWith('    ')).toBe(true);
    /* O que vem depois do laço volta à margem: ele não é repetido. */
    expect(faz[3]).toBe('encerro o jogo');
  });

  it('avisa quando o container está vazio, em vez de calar', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [[
      b('quandoBandeira'), b('repita', { vezes: 3, corpo: [] }),
    ]])]));
    expect(r[0].faz[1]).toContain('ainda não há nada aqui dentro');
  });
});

describe('a condição diz o nome do ator, e não o id', () => {
  it('traduz o id do outro para o nome que aparece na tela', () => {
    const r = roteiroDeApresentacao(proj([
      ator('gato', 'Gato', [[
        b('quandoBandeira'),
        b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('toqueSom')] }),
      ]]),
      ator('maca', 'Maçã', []),
    ]));
    expect(r[0].faz[0]).toContain('Maçã');
    expect(r[0].faz[0]).not.toContain('maca');
  });

  it('a borda é dita como borda do palco, e não como ator', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [[
      b('quandoBandeira'),
      b('se', { condicao: { tipo: 'tocando', quem: 'borda' }, corpo: [b('toqueSom')] }),
    ]])]));
    expect(r[0].faz[0]).toContain('a borda do palco');
  });
});

describe('o sinal do número vira a palavra certa', () => {
  it('passos negativos são andar para trás, e não "andar -10"', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [[
      b('quandoBandeira'), b('mover', { passos: -10 }), b('mudeVariavel', { nome: 'vidas', por: -1 }),
    ]])]));
    expect(r[0].faz[0]).toBe('ando 10 passos para trás');
    expect(r[0].faz[1]).toBe('tiro 1 de vidas');
  });

  it('o singular do segundo é respeitado', () => {
    const r = roteiroDeApresentacao(proj([ator('gato', 'Gato', [[
      b('quandoBandeira'), b('espere', { segundos: 1 }), b('espere', { segundos: 2 }),
    ]])]));
    expect(r[0].faz[0]).toContain('1 segundo antes');
    expect(r[0].faz[1]).toContain('2 segundos antes');
  });
});
