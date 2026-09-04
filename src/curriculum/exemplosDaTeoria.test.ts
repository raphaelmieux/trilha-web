// @vitest-environment jsdom
// Precisa de DOM: o que se confere aqui é se o seletor da lição encontra
// alguém na marcação de exemplo, e quem sabe casar seletor é o navegador.
import { describe, it, expect } from 'vitest';
import { VEREDAS } from './veredas';
import { lerFolha } from '../lib/cssValidator';
import type { TopicoDeVereda } from './veredas';

/*
  O quadro "e a página fica assim" tem de mostrar alguma coisa.

  `exemploMarcacao` é a página em que a regra da lição cai, e ela é escrita à
  mão, tópico a tópico. Errar aqui não estoura nada: o quadro abre branco, ou
  abre com a página intacta, e o desbravador conclui que a regra que acabou de
  ler não faz nada. É a mesma armadilha do "sem links quebrados" passando numa
  página sem link nenhum — o vazio satisfazendo a promessa.

  E é a mesma regra que o validador da vereda já cobra de quem estuda: seletor
  que não casa com a página é CSS que não pinta nada. Seria estranho reprovar o
  desbravador por isso e deixar passar na lição que o ensina.
*/

const topicos = (): [string, TopicoDeVereda][] => VEREDAS.flatMap(v =>
  v.modulos
    .flatMap(m => m.licoes)
    .flatMap(l => (l.tipo === 'teoria' ? l.topicos : []))
    .map(t => [`${v.code}/${t.id}`, t] as [string, TopicoDeVereda]));

const comMarcacao = () => topicos().filter(([, t]) => !!t.exemploMarcacao);

/* O estado não existe numa página parada: `a:hover` é o `a`, e o que se confere
   é se o elemento está lá. */
const semPseudo = (seletor: string) => seletor
  .split(',')
  .map(s => s.replace(/::?[a-z-]+(\([^)]*\))?/gi, '').trim())
  .filter(Boolean);

const paginaDe = (marcacao: string) =>
  new DOMParser().parseFromString(`<!DOCTYPE html><html><body>${marcacao}</body></html>`, 'text/html');

describe('a marcação de exemplo dos tópicos', () => {
  it('há tópicos com marcação para conferir', () => {
    expect(comMarcacao().length).toBeGreaterThan(0);
  });

  /* Só o ramo de CSS lê o campo. Num tópico de HTML, de blocos ou de texto ele
     seria escrito, revisado, e ignorado em silêncio. */
  it('só tópico de CSS traz marcação', () => {
    const fora = comMarcacao().filter(([, t]) => t.exemploComo !== 'css').map(([n]) => n);
    expect(fora).toEqual([]);
  });

  it('a marcação tem elemento — página vazia não mostra regra nenhuma', () => {
    const vazias = comMarcacao()
      .filter(([, t]) => paginaDe(t.exemploMarcacao ?? '').body.children.length === 0)
      .map(([n]) => n);
    expect(vazias).toEqual([]);
  });

  /*
    O caso que motivou a trava: um seletor renomeado no exemplo e não na
    marcação, ou a marcação copiada do tópico vizinho. As duas caixas continuam
    aparecendo, e a da direita mostra a página sem a menor diferença.
  */
  it('todo seletor da lição encontra alguém na marcação', () => {
    const orfaos: string[] = [];
    for (const [nome, t] of comMarcacao()) {
      const pagina = paginaDe(t.exemploMarcacao ?? '');
      for (const regra of lerFolha(t.exemplo)) {
        for (const seletor of semPseudo(regra.seletor)) {
          if (!pagina.querySelector(seletor)) orfaos.push(`${nome}: ${seletor}`);
        }
      }
    }
    expect(orfaos).toEqual([]);
  });

  /* Uma folha que o analisador descarta inteira não pinta nada, e o quadro sai
     igual à página crua — sem nada dizendo por quê. */
  it('a folha do exemplo tem ao menos uma regra que o navegador aceita', () => {
    const mudas = comMarcacao().filter(([, t]) => lerFolha(t.exemplo).length === 0).map(([n]) => n);
    expect(mudas).toEqual([]);
  });
});
