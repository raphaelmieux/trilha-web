import { describe, it, expect } from 'vitest';
import { parse } from 'acorn';
import { VEREDAS, licoesDaVereda, type TopicoDeVereda } from './veredas';
import { executarNode } from '../labs/nodeSimulado';
import { ouvirNoTeste, rodarNoNode } from '../labs/nodeDeVerdade';

/*
  Os exemplos de JavaScript da teoria, conferidos rodando — duas vezes.

  É a trava de `exemplosDePython.test.ts`, pelo motivo escrito lá: escrever
  de cabeça o que um programa escreve erra por pouco e com frequência, e quem
  confere o próprio programa contra um exemplo errado conclui que o **seu**
  programa é que está errado. Aqui o erro mais provável nem é de conta: é de
  forma — `[ 1, 2 ]` com espaço dentro dos colchetes, `'Ana'` com aspas
  simples dentro do objeto —, que é como o Node escreve e como ninguém digita.

  Cada exemplo roda no Node simulado, que é o que o laboratório usa, **e** no
  Node de verdade, que é o que o computador do clube vai usar. Os três —
  o texto da lição, o laboratório e o terminal — precisam dizer o mesmo.
*/

const topicos: [string, TopicoDeVereda][] = VEREDAS
  .flatMap(v => licoesDaVereda(v).map(l => [v, l] as const))
  .flatMap(([v, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [`${v.code} · ${t.id}`, t] as [string, TopicoDeVereda]) : []))
  .filter(([, t]) => t.exemploComo === 'javascript');

describe('os exemplos de JavaScript da teoria', () => {
  it('existem — a lista vazia aprovaria tudo sem conferir nada', () => {
    expect(topicos.length).toBeGreaterThanOrEqual(30);
  });

  it.each(topicos)('%s se lê', (_, t) => {
    const lido = (tipo: 'script' | 'module') => {
      try { parse(t.exemplo ?? '', { ecmaVersion: 'latest', sourceType: tipo }); return true; } catch { return false; }
    };
    expect(lido('script') || lido('module')).toBe(true);
  });

  const comSaida = topicos.filter(([, t]) => t.exemploSaida !== undefined);
  it.each(comSaida)('%s escreve o que a lição diz, no simulado e no Node', async (_, t) => {
    const pasta = { 'programa.js': t.exemplo ?? '' };
    const esperado = `${t.exemploSaida}\n`;
    const simulado = await executarNode(pasta, 'programa.js', { ouvirRejeicoes: ouvirNoTeste });
    expect(simulado.erro).toBeNull();
    expect(simulado.saida).toBe(esperado);
    expect(rodarNoNode(pasta, 'programa.js').saida).toBe(esperado);
  }, 30000);
});
