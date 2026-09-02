import { describe, it, expect } from 'vitest';
import { inserirDepois, inserirDentro, remover, mover, alterar, contem } from './blocosEdicao';
import type { Bloco } from './blocos';

/*
  As operações da árvore são as únicas partes do editor que podem corromper o
  projeto — inserir dentro do bloco errado, perder um ramo ao remover. Elas se
  testam sem montar tela nenhuma, e é por isso que moram fora dela.
*/

let n = 0;
const b = (tipo: Bloco['tipo'], resto: object = {}, id?: string): Bloco =>
  ({ id: id ?? `t${(n += 1)}`, tipo, ...resto } as Bloco);

const pilha = (): Bloco[] => [
  b('quandoBandeira', {}, 'chapeu'),
  b('mover', { passos: 10 }, 'm1'),
  b('sempre', { corpo: [
    b('mover', { passos: 1 }, 'm2'),
    b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('diga', { texto: 'oi' }, 'd1')] }, 'se1'),
  ]}, 'sempre1'),
];

const ids = (blocos: Bloco[]): string[] =>
  blocos.flatMap(x => [x.id, ...(('corpo' in x) ? ids(x.corpo as Bloco[]) : [])]);

describe('inserir', () => {
  it('põe o bloco logo depois do escolhido, no nível de cima', () => {
    const r = inserirDepois(pilha(), 'm1', b('diga', { texto: 'novo' }, 'novo'));
    expect(ids(r).slice(0, 3)).toEqual(['chapeu', 'm1', 'novo']);
  });

  /* O caso que o arrasto erra: pôr o bloco *dentro* do laço, e não embaixo. */
  it('acha o bloco em qualquer profundidade', () => {
    const r = inserirDepois(pilha(), 'm2', b('diga', { texto: 'novo' }, 'novo'));
    const sempre = r.find(x => x.id === 'sempre1')!;
    expect(ids([sempre])).toEqual(['sempre1', 'm2', 'novo', 'se1', 'd1']);
  });

  it('põe no fim do corpo de um container', () => {
    const r = inserirDentro(pilha(), 'se1', b('toqueSom', {}, 'som'));
    expect(ids(r)).toContain('som');
    const sempre = r.find(x => x.id === 'sempre1') as Extract<Bloco, { corpo: Bloco[] }>;
    const se = sempre.corpo.find(x => x.id === 'se1') as Extract<Bloco, { corpo: Bloco[] }>;
    expect(se.corpo.map(x => x.id)).toEqual(['d1', 'som']);
  });

  it('inserir dentro de um container vazio funciona', () => {
    const base = [b('quandoBandeira', {}, 'c'), b('repita', { vezes: 3, corpo: [] }, 'r')];
    const r = inserirDentro(base, 'r', b('mover', { passos: 1 }, 'novo'));
    const rep = r.find(x => x.id === 'r') as Extract<Bloco, { corpo: Bloco[] }>;
    expect(rep.corpo.map(x => x.id)).toEqual(['novo']);
  });
});

describe('remover', () => {
  it('leva junto o que estava dentro', () => {
    /* No Scratch, arrastar um `repita` para o lixo leva o corpo. Preservar os
       filhos os despejaria soltos na pilha, mudando o programa. */
    const r = remover(pilha(), 'sempre1');
    expect(ids(r)).toEqual(['chapeu', 'm1']);
  });

  it('remove um bloco de dentro sem tocar nos vizinhos', () => {
    const r = remover(pilha(), 'd1');
    expect(contem(r, 'd1')).toBe(false);
    expect(contem(r, 'se1')).toBe(true);
    expect(contem(r, 'm2')).toBe(true);
  });
});

describe('mover', () => {
  it('troca com o vizinho de baixo', () => {
    const r = mover(pilha(), 'm1', 1);
    expect(r.map(x => x.id)).toEqual(['chapeu', 'sempre1', 'm1']);
  });

  /* Um chapéu fora do topo deixaria a pilha sem gatilho, e morta em silêncio. */
  it('não tira o chapéu do topo', () => {
    expect(mover(pilha(), 'm1', -1).map(x => x.id)).toEqual(['chapeu', 'm1', 'sempre1']);
    expect(mover(pilha(), 'chapeu', 1).map(x => x.id)).toEqual(['chapeu', 'm1', 'sempre1']);
  });

  it('não passa do fim da lista', () => {
    expect(mover(pilha(), 'sempre1', 1).map(x => x.id)).toEqual(['chapeu', 'm1', 'sempre1']);
  });

  /* Subir não tira o bloco de dentro do laço: um movimento que às vezes muda o
     aninhamento é um movimento que ninguém consegue prever. */
  it('move só entre irmãos, dentro do container', () => {
    const r = mover(pilha(), 'se1', -1);
    const sempre = r.find(x => x.id === 'sempre1') as Extract<Bloco, { corpo: Bloco[] }>;
    expect(sempre.corpo.map(x => x.id)).toEqual(['se1', 'm2']);
  });
});

describe('alterar', () => {
  it('muda o campo do bloco em qualquer profundidade', () => {
    const r = alterar(pilha(), 'm2', { passos: 99 });
    const sempre = r.find(x => x.id === 'sempre1') as Extract<Bloco, { corpo: Bloco[] }>;
    expect((sempre.corpo[0] as Extract<Bloco, { tipo: 'mover' }>).passos).toBe(99);
  });

  it('devolve uma árvore nova, sem mutar a de entrada', () => {
    const antes = pilha();
    const copia = JSON.stringify(antes);
    alterar(antes, 'm1', { passos: 77 });
    expect(JSON.stringify(antes)).toBe(copia);
  });
});
