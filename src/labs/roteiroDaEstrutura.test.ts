import { describe, it, expect } from 'vitest';
import { roteiroDaEstrutura, profundidade } from './roteiroDaEstrutura';
import { DOCUMENTOS, type No } from './arquivos';

/*
  O roteiro da apresentação (requisito 9).

  ── O que a trava mede é a palavra da plataforma ────────────────────────
  Vale o que está escrito para o roteiro de Python: o texto cita os nomes que
  a pessoa escolheu, então uma pasta chamada "Melhores fotos" faria a trava do
  "descreve, e não julga" acusar a plataforma de uma palavra que ela não
  disse. Por isso a árvore de teste é neutra — nomes que não dizem nada.
*/

const AGORA = Date.UTC(2026, 8, 14);

const pasta = (id: string, nome: string, paiId: string | null): No =>
  ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: AGORA });
const arq = (id: string, nome: string, paiId: string): No =>
  ({ id, nome, tipo: 'arquivo', paiId, tamanhoKb: 10, modificadoEm: AGORA });

/*
  Projeto
    Primeira      → dois arquivos
    Segunda
      Terceira    → um arquivo
*/
const ARVORE: No[] = [
  pasta(DOCUMENTOS, 'Documentos', null),
  pasta('p', 'Projeto', DOCUMENTOS),
  pasta('a', 'Primeira', 'p'),
  arq('a1', 'um.txt', 'a'),
  arq('a2', 'dois.txt', 'a'),
  pasta('b', 'Segunda', 'p'),
  pasta('c', 'Terceira', 'b'),
  arq('c1', 'tres.txt', 'c'),
];

const texto = (arvore: No[], raiz: string) =>
  roteiroDaEstrutura(arvore, raiz).map(f => f.texto).join(' ');

describe('o roteiro da estrutura', () => {
  it('abre dizendo o caminho inteiro até a raiz do projeto', () => {
    expect(texto(ARVORE, 'p')).toContain('Documentos › Projeto');
  });

  it('nomeia cada pasta e o nível em que ela está', () => {
    const falas = roteiroDaEstrutura(ARVORE, 'p');
    const niveis = new Map(falas.map(f => [f.texto, f.nivel]));
    const acha = (nome: string) => [...niveis].find(([t]) => t.includes(nome));

    expect(acha('Primeira')?.[1]).toBe(1);
    expect(acha('Segunda')?.[1]).toBe(1);
    expect(acha('Terceira')?.[1]).toBe(2);
  });

  it('não lê os arquivos um por um', () => {
    /* O que se apresenta é a estrutura. Ler os nomes dos arquivos viraria um
       inventário — que é justamente o que a organização em pastas existe para
       não precisar. */
    const t = texto(ARVORE, 'p');
    for (const nome of ['um.txt', 'dois.txt', 'tres.txt']) {
      expect(t, `o roteiro leu ${nome} em voz alta`).not.toContain(nome);
    }
  });

  it('conta o que há dentro em palavras de gente', () => {
    const t = texto(ARVORE, 'p');
    expect(t).toContain('2 arquivos');
    /* "5 itens" é o que o computador diria; o roteiro é para falar. */
    expect(t).not.toContain('itens');
  });

  it('diz que a pasta só de subpastas divide, e não que ela guarda', () => {
    /* Uma pasta que só tem subpastas é divisão; uma que só tem arquivo é onde
       o trabalho mora. A mesma frase para as duas faria a pessoa dizer a
       mesma coisa sobre coisas diferentes. */
    const fala = roteiroDaEstrutura(ARVORE, 'p')
      .find(f => f.texto.includes('Segunda'))!.texto;
    expect(fala).toContain('divide');
  });

  it('fala em primeira pessoa, porque é para falar', () => {
    expect(texto(ARVORE, 'p')).toMatch(/\bComecei\b/);
  });

  it('descreve, e não julga', () => {
    const t = texto(ARVORE, 'p').toLowerCase();
    for (const juizo of ['bem organizad', 'mal organizad', 'deveria', 'errad', 'melhor', 'ruim']) {
      expect(t, `o roteiro julgou: "${juizo}"`).not.toContain(juizo);
    }
  });

  it('fecha com a pergunta, e não com a resposta', () => {
    /* A lógica é de quem organizou. Escrever uma resposta plausível aqui
       entregaria o gabarito da metade do requisito que não é de clicar. */
    const falas = roteiroDaEstrutura(ARVORE, 'p');
    expect(falas[falas.length - 1].texto).toContain('explique por que');
  });

  it('não escreve nada para uma pasta que não existe', () => {
    expect(roteiroDaEstrutura(ARVORE, 'nao-existe')).toEqual([]);
  });

  it('diz quando a pasta ainda está vazia', () => {
    const vazia = [pasta(DOCUMENTOS, 'Documentos', null), pasta('v', 'Vazia', DOCUMENTOS)];
    expect(texto(vazia, 'v')).toContain('ainda está vazia');
  });
});

describe('a profundidade', () => {
  it('conta a própria pasta como o primeiro nível', () => {
    expect(profundidade(ARVORE, 'c')).toBe(1);
    expect(profundidade(ARVORE, 'b')).toBe(2);
    expect(profundidade(ARVORE, 'p')).toBe(3);
  });

  it('mede o ramo mais fundo, e não o primeiro', () => {
    /* "Primeira" tem um nível e "Segunda" tem dois: um `Math.max` trocado por
       um `[0]` diria que o projeto tem dois níveis e reprovaria quem montou
       os três. */
    expect(profundidade(ARVORE, 'p')).toBe(3);
  });

  it('não conta arquivo como nível', () => {
    expect(profundidade(ARVORE, 'a')).toBe(1);
  });
});
