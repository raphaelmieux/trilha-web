import { describe, it, expect } from 'vitest';
import { parse } from 'acorn';
import { VEREDAS, licoesDaVereda, type TopicoDeVereda } from './veredas';
import { arquivosDoExemplo } from '../labs/paginaViva';
import { rodarNoJsdom } from '../labs/paginaNoJsdom';

/*
  Os exemplos de DOM da teoria, conferidos rodando na página viva.

  É a trava de `exemplosDeJavascript.test.ts`, com a página no lugar do
  terminal: o exemplo é a marcação do tópico com o script dele, montada pelo
  mesmo `arquivosDoExemplo` que a lição usa, e rodada no jsdom com o mesmo
  bastidor da prévia. O que se cobra é que nenhum exemplo dê erro — um
  seletor que não acha alguém da marcação estoura com "Cannot read
  properties of null", que é o defeito mais provável de um exemplo escrito à
  mão — e que o console diga o que o tópico declara.

  O console aqui é o do navegador, e não o do Node: `(3) [72, 38, 55]` e
  `<li>` são como ele escreve, e são o que a pessoa vê embaixo do exemplo.
*/

const topicos: [string, TopicoDeVereda][] = VEREDAS
  .flatMap(v => licoesDaVereda(v).map(l => [v, l] as const))
  .flatMap(([v, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [`${v.code} · ${t.id}`, t] as [string, TopicoDeVereda]) : []))
  .filter(([, t]) => t.exemploComo === 'dom' && t.exemplo !== undefined);

describe('os exemplos de DOM da teoria', () => {
  it('existem — a lista vazia aprovaria tudo sem conferir nada', () => {
    expect(topicos.length).toBeGreaterThanOrEqual(30);
  });

  it.each(topicos)('%s se lê', (_, t) => {
    expect(() => parse(t.exemplo ?? '', { ecmaVersion: 'latest', sourceType: 'script' })).not.toThrow();
  });

  it.each(topicos)('%s roda sem erro e escreve o que a lição diz', async (_, t) => {
    const r = await rodarNoJsdom(arquivosDoExemplo(t.exemploMarcacao ?? '', t.exemplo ?? ''), [{ acao: 'esperar' }]);
    expect(r.erros.map(e => e.texto)).toEqual([]);
    const escrito = r.console.filter(e => e.nivel === 'log').map(e => e.texto).join('\n');
    expect(escrito).toBe(t.exemploSaida ?? '');
  }, 20000);
});
