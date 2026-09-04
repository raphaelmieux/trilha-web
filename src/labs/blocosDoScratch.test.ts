import { describe, it, expect } from 'vitest';
import {
  lerExemploDeBlocos, categoriaDoBloco, ehChapeu, temBloco, COR_DA_CATEGORIA,
} from './blocosDoScratch';
import { VEREDAS } from '../curriculum/veredas';

/*
  A cor é a categoria, e a categoria é onde o bloco mora na paleta.

  Errar a cor aqui não é um detalhe estético: manda o desbravador procurar na
  gaveta errada do Scratch de verdade, e ele perde o tempo dele achando que o
  bloco não existe. Por isso o que não se reconhece sai cinza — cinza diz "não
  sei", e uma cor qualquer diria uma coisa falsa com toda a confiança.
*/

describe('a categoria sai do que o bloco diz', () => {
  it('reconhece as categorias que a vereda usa', () => {
    expect(categoriaDoBloco('quando ⚑ for clicado')).toBe('eventos');
    expect(categoriaDoBloco('mova 10 passos')).toBe('movimento');
    expect(categoriaDoBloco('vá para x: -120 y: 0')).toBe('movimento');
    expect(categoriaDoBloco('diga "vamos!"')).toBe('aparencia');
    expect(categoriaDoBloco('próxima fantasia')).toBe('aparencia');
    expect(categoriaDoBloco('toque o som miau')).toBe('som');
    expect(categoriaDoBloco('sempre')).toBe('controle');
    expect(categoriaDoBloco('repita 10 vezes')).toBe('controle');
    expect(categoriaDoBloco('tocando em Maca?')).toBe('sensores');
  });

  /*
    O caso que obriga a lista a ter ordem: as duas frases começam com a mesma
    palavra, e são gavetas diferentes.
  */
  it('separa "mude x" de "mude placar", que começam igual', () => {
    expect(categoriaDoBloco('mude x para 0')).toBe('movimento');
    expect(categoriaDoBloco('mude placar para 0')).toBe('variaveis');
    expect(categoriaDoBloco('adicione 10 a x')).toBe('movimento');
    expect(categoriaDoBloco('adicione 1 a placar')).toBe('variaveis');
  });

  it('o acento não muda a resposta', () => {
    expect(categoriaDoBloco('va para x: 0 y: 0')).toBe('movimento');
    expect(categoriaDoBloco('proxima fantasia')).toBe('aparencia');
  });

  it('o que não se reconhece sai cinza, e não de uma cor qualquer', () => {
    expect(categoriaDoBloco('faça um bolo de fubá')).toBe('desconhecida');
    expect(COR_DA_CATEGORIA.desconhecida).not.toBe(COR_DA_CATEGORIA.movimento);
  });

  it('só o chapéu é chapéu', () => {
    expect(ehChapeu('quando ⚑ for clicado')).toBe(true);
    expect(ehChapeu('quando a tecla espaço for pressionada')).toBe(true);
    expect(ehChapeu('mova 10 passos')).toBe(false);
  });
});

describe('a leitura do exemplo', () => {
  it('separa bloco de texto, e guarda o recuo', () => {
    const linhas = lerExemploDeBlocos([
      'Em blocos, encaixado:',
      '[quando ⚑ for clicado]',
      '  [vá para x: -120 y: 0]',
      '',
      '    [diga "oi"]',
    ].join('\n'));

    expect(linhas[0]).toEqual({ tipo: 'texto', texto: 'Em blocos, encaixado:' });
    expect(linhas[1]).toMatchObject({ tipo: 'bloco', recuo: 0, chapeu: true, categoria: 'eventos' });
    expect(linhas[2]).toMatchObject({ tipo: 'bloco', recuo: 1, categoria: 'movimento' });
    expect(linhas[3]).toEqual({ tipo: 'vazia' });
    expect(linhas[4]).toMatchObject({ tipo: 'bloco', recuo: 2, categoria: 'aparencia' });
  });

  /* O algoritmo da bicicleta não tem bloco nenhum, e não pode ganhar forma de
     bloco só por estar numa vereda de blocos. */
  it('texto puro continua texto', () => {
    const linhas = lerExemploDeBlocos('Trocar o pneu:\n  1. soltar os freios');
    expect(linhas.every(l => l.tipo !== 'bloco')).toBe(true);
    expect(temBloco('Trocar o pneu:\n  1. soltar os freios')).toBe(false);
  });
});

/*
  A trava que fecha o assunto: todo bloco escrito nas lições da CC001 precisa
  cair numa categoria conhecida. Um bloco novo escrito com outra palavra sairia
  cinza no meio de uma pilha colorida — e ninguém repara nisso relendo o texto
  da lição, que é onde ele foi escrito.
*/
describe('os exemplos da CC001', () => {
  const cc001 = VEREDAS.find(v => v.code === 'CC001');
  const topicos = (cc001?.modulos ?? [])
    .flatMap(m => m.licoes)
    .flatMap(l => (l.tipo === 'teoria' ? l.topicos : []));

  it('a vereda tem tópicos para conferir', () => {
    expect(topicos.length).toBeGreaterThan(0);
  });

  /*
    Duas pilhas lado a lado não cabem: o desenho é uma coluna, e uma linha com
    dois blocos viraria um bloco só com o texto dos dois. A lição se escreve
    uma pilha embaixo da outra, com o nome do ator em cima de cada uma —
    que é também como o Scratch mostra, já que ali se troca de ator para ver o
    programa dele.
  */
  it('nenhuma linha junta dois blocos', () => {
    const juntas = topicos.flatMap(t => t.exemplo.split('\n'))
      .filter(l => (l.match(/\[/g) ?? []).length > 1);
    expect(juntas).toEqual([]);
  });

  /*
    Bloco com comentário colado na mesma linha não é bloco nem anotação: a linha
    inteira cai como texto e o desbravador lê `[repita 4 vezes] conta e sai`
    escrito com colchete e tudo. A anotação vai na linha de cima.
  */
  it('nenhuma linha mistura bloco e comentário', () => {
    const misturadas = topicos.flatMap(t => t.exemplo.split('\n'))
      .filter(l => /\]\s*\S/.test(l));
    expect(misturadas).toEqual([]);
  });

  it('nenhum bloco escrito nas lições sai sem categoria', () => {
    const cinzas = topicos.flatMap(t => lerExemploDeBlocos(t.exemplo))
      .filter(l => l.tipo === 'bloco' && l.categoria === 'desconhecida')
      .map(l => (l.tipo === 'bloco' ? l.texto : ''));
    expect([...new Set(cinzas)]).toEqual([]);
  });
});

/*
  O rótulo tem de bater com o que o exemplo é.

  `exemploComo` é escrito à mão, e um rótulo errado não estoura: ele desenha a
  coisa errada com toda a confiança — um algoritmo em português dentro de uma
  pilha de blocos coloridos, ou uma pilha de blocos passando pelo realce de
  HTML, que foi exatamente o defeito que este trabalho veio consertar.
*/
describe('o rótulo do exemplo diz a verdade sobre ele', () => {
  const topicosDe = (code: string) => (VEREDAS.find(v => v.code === code)?.modulos ?? [])
    .flatMap(m => m.licoes)
    .flatMap(l => (l.tipo === 'teoria' ? l.topicos : []));

  it('todo exemplo com blocos está rotulado como blocos', () => {
    const errados = [...topicosDe('CC001'), ...topicosDe('CC-FE002'), ...topicosDe('CC-FE001')]
      .filter(t => temBloco(t.exemplo) && t.exemploComo !== 'blocos')
      .map(t => t.id);
    expect(errados).toEqual([]);
  });

  it('nenhum exemplo rotulado como blocos está sem blocos', () => {
    const vazios = [...topicosDe('CC001'), ...topicosDe('CC-FE002'), ...topicosDe('CC-FE001')]
      .filter(t => t.exemploComo === 'blocos' && !temBloco(t.exemplo))
      .map(t => t.id);
    expect(vazios).toEqual([]);
  });

  /* A CC001 é de blocos: nenhum exemplo dela é HTML, e deixar um sem rótulo o
     faria cair no padrão `'html'` — que é como o defeito começou. */
  it('nenhum tópico da CC001 cai no padrão de HTML', () => {
    const semRotulo = topicosDe('CC001').filter(t => !t.exemploComo).map(t => t.id);
    expect(semRotulo).toEqual([]);
    expect(topicosDe('CC001').every(t => t.exemploComo === 'blocos' || t.exemploComo === 'texto')).toBe(true);
  });

  it('nenhum tópico da CC-FE002 cai no padrão de HTML sem ser HTML de verdade', () => {
    const errados = topicosDe('CC-FE002')
      .filter(t => (t.exemploComo ?? 'html') === 'html' && !t.exemplo.trim().startsWith('<'))
      .map(t => t.id);
    expect(errados).toEqual([]);
  });
});
