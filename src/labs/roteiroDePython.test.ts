import { describe, it, expect } from 'vitest';
import { roteiroDePython, funcoesQueNaoRodam } from './roteiroDePython';
import type { NoDoEsboco } from './pythonAnalise';
import boletim from './fixtures/boletimDaUnidade.json';

/*
  O esboço do `boletimDaUnidade` não foi escrito à mão: saiu do próprio
  analisador, rodado sobre um programa de quarenta linhas parecido com o que o
  requisito 7 pede — funções, entrada convertida, laço com contagem, cadeia de
  if/elif/else, while com saída e impressão no fim.

  Fixture inventada testaria o que eu imaginei que o `ast` devolve. Esta testa o
  que ele devolve.
*/

const esboco = boletim.esboco as NoDoEsboco[];
const chamadas = boletim.chamadas as string[];
const roteiro = roteiroDePython(esboco, chamadas);
const linhas = roteiro.flatMap(t => t.faz);
const recuo = (l: string) => (l.length - l.trimStart().length) / 2;

describe('o recorte do programa', () => {
  it('separa cada função do corpo que corre de cima para baixo', () => {
    expect(roteiro.map(t => t.titulo)).toEqual([
      'A função media(notas)',
      'A função conceito(nota)',
      'A função resumo(quantos, aprovados)',
      'O programa, de cima para baixo',
    ]);
  });

  it('a função diz que só roda quando alguém a chama', () => {
    expect(roteiro[0].quando).toBe('Roda quando o programa chama media(notas).');
  });

  /*
    Função escrita e nunca chamada não roda — a mesma verdade da pilha sem
    chapéu na vereda de blocos. Explicá-la como se rodasse é justamente o que
    faria a pessoa passar vergonha na frente do examinador.
  */
  it('função que ninguém chama diz que nunca roda', () => {
    const [so] = roteiroDePython(esboco.filter(n => n.tipo === 'funcao'), []);
    expect(so.quando).toContain('Nunca roda');
    expect(so.quando).not.toContain('chama media');
  });

  it('e a conta delas é a que a tela mostra', () => {
    expect(funcoesQueNaoRodam(esboco, chamadas)).toBe(0);
    expect(funcoesQueNaoRodam(esboco, [])).toBe(3);
    /* Uma só chamada não salva as outras duas. */
    expect(funcoesQueNaoRodam(esboco, ['media'])).toBe(2);
  });

  /* Programa que só define funções não tem corpo, e uma parte vazia rotulada
     "o programa" prometeria um trecho que não existe. */
  it('programa sem corpo não ganha uma parte vazia', () => {
    const so = roteiroDePython(esboco.filter(n => n.tipo === 'funcao'), chamadas);
    expect(so.every(t => t.titulo.startsWith('A função'))).toBe(true);
    expect(so.map(t => t.titulo)).not.toContain('O programa, de cima para baixo');
  });
});

describe('o que cada frase diz', () => {
  it('fala na primeira pessoa, porque é para dizer em voz alta', () => {
    /* "Este laço soma as notas" se lê; "eu somo as notas" se fala. */
    expect(linhas.some(l => l.includes('somo 1 em aprovados'))).toBe(true);
    expect(linhas.some(l => /^\s*(guardo|mostro|pergunto|repito|percorro|chamo|devolvo)/.test(l))).toBe(true);
  });

  /* A primeira armadilha de todo mundo: input() devolve texto, e somar dois
     textos junta em vez de somar. A frase diz isso onde acontece. */
  it('avisa que a leitura sem conversão chega como texto', () => {
    const semConversao = linhas.find(l => l.includes('em nome'));
    expect(semConversao).toContain('chega como texto');
    expect(linhas.find(l => l.includes('em quantos'))).toContain('número inteiro');
    expect(linhas.find(l => l.includes('em nota'))).toContain('casas decimais');
  });

  /* `x = x + 1` e `x += 1` são a mesma operação escrita de dois jeitos, e quem
     escreveu a forma longa vai apresentar "somo 1", não "guardo x + 1 em x". */
  it('diz a mesma frase para as duas formas de somar em si mesmo', () => {
    expect(linhas.some(l => l.trim() === 'somo 1 em tentativas')).toBe(true);
    expect(linhas.some(l => l.includes('guardo tentativas + 1'))).toBe(false);
  });

  it('o while avisa que alguma coisa precisa fazer a condição virar falsa', () => {
    const w = linhas.find(l => l.includes('fico repetindo enquanto'));
    expect(w).toContain('virar falso');
  });

  /*
    Descreve, e não julga. Quem diz se o programa está bom é a lista de tarefas,
    que já cobra as estruturas e a saída. Um roteiro que também opinasse falaria
    em voz de professor no momento em que a pessoa acabou de vencer.

    A conferência é sobre **as palavras da plataforma**, e não sobre a linha
    inteira: a linha traz junto o código de quem escreveu, e uma variável
    chamada `faltaram` faria a trava acusar a plataforma de uma palavra que ela
    não disse. Por isso o esboço aqui é neutro — um nó de cada tipo, com nomes
    que não dizem nada.
  */
  it('nenhuma frase da plataforma julga o programa', () => {
    const neutro: NoDoEsboco[] = [
      { tipo: 'importa', linha: 1, valor: 'import xx' },
      { tipo: 'atribuicao', linha: 2, nome: 'aa', valor: '1' },
      { tipo: 'atribuicao', linha: 3, nome: 'bb', valor: '[]' },
      { tipo: 'entrada', linha: 4, nome: 'cc', pergunta: 'oi', converte: 'int' },
      { tipo: 'entrada', linha: 5, nome: 'dd', pergunta: '', converte: '' },
      { tipo: 'acumula', linha: 6, nome: 'aa', op: 'Add', valor: '1' },
      { tipo: 'acumula', linha: 7, nome: 'aa', op: 'Sub', valor: '1' },
      { tipo: 'saida', linha: 8, valor: 'aa' },
      { tipo: 'chamada', linha: 9, valor: 'xx.yy()' },
      { tipo: 'para', linha: 10, alvo: 'ii', sobre: 'range(2)', vezes: 2, corpo: [] },
      { tipo: 'enquanto', linha: 11, condicao: 'aa < 2', corpo: [{ tipo: 'sai', linha: 12 }] },
      { tipo: 'se', linha: 13, condicao: 'aa > 1', corpo: [{ tipo: 'pula', linha: 14 }], senao: [] },
      { tipo: 'funcao', linha: 15, nome: 'ff', parametros: ['gg'], corpo: [{ tipo: 'retorno', linha: 16, valor: 'gg' }] },
      { tipo: 'nada', linha: 17 },
      { tipo: 'fundo', linha: 0 },
    ];
    const ditas = roteiroDePython(neutro, ['ff']).flatMap(t => [t.titulo, t.quando, ...t.faz]);
    const juizo = /\b(errad|falta|deveria|melhor|ruim|incorret|problema|parab)/i;
    expect(ditas.filter(l => juizo.test(l))).toEqual([]);
  });
});

describe('o recuo conta o aninhamento', () => {
  it('o que está dentro do laço é dito recuado', () => {
    const i = linhas.findIndex(l => l.includes('repito 3 vezes'));
    expect(recuo(linhas[i])).toBe(0);
    expect(recuo(linhas[i + 1])).toBe(1);
  });

  /*
    O elif é um if dentro do else do anterior, e a árvore o mostra encaixado.
    Falado, ele não é encaixado: é a próxima pergunta da mesma série. Uma escada
    de degraus faria a pessoa dizer em voz alta a coisa errada sobre o próprio
    programa.
  */
  it('a cadeia de elif fica toda no mesmo nível', () => {
    /* A da função `conceito`, que é a cadeia inteira sem nada em volta. */
    const faz = roteiro.find(t => t.titulo.startsWith('A função conceito'))?.faz ?? [];
    const se = faz.findIndex(l => l.includes('nota >= 9'));
    const senao = faz.findIndex(l => l.includes('senão, pergunto se'));
    const fim = faz.findIndex(l => l.includes('nenhuma das respostas'));
    expect([se, senao, fim].every(i => i >= 0)).toBe(true);
    expect(recuo(faz[senao])).toBe(recuo(faz[se]));
    expect(recuo(faz[fim])).toBe(recuo(faz[se]));
  });

  /* E o mesmo vale quando a cadeia está dentro de um laço: o que sobe um nível
     é o corpo, e não a série de perguntas. */
  it('a cadeia dentro de um laço acompanha o laço, e não escada', () => {
    const faz = roteiro.find(t => t.titulo.startsWith('O programa'))?.faz ?? [];
    const se = faz.findIndex(l => l.includes('nota >= 8'));
    const senao = faz.findIndex(l => l.includes('senão, pergunto se nota >= MINIMO'));
    expect(recuo(faz[se])).toBe(1);
    expect(recuo(faz[senao])).toBe(1);
  });

  it('o se de duas pontas fala do lado que não é o sim', () => {
    const so: NoDoEsboco[] = [{
      tipo: 'se', linha: 1, condicao: 'idade >= 10',
      corpo: [{ tipo: 'saida', linha: 2, valor: "'pode'" }],
      senao: [{ tipo: 'saida', linha: 4, valor: "'ainda não'" }],
    }];
    const faz = roteiroDePython(so).flatMap(t => t.faz);
    expect(faz.some(l => l.includes('quando a resposta é não'))).toBe(true);
  });
});

describe('o vazio se diz vazio', () => {
  it('bloco sem nada dentro é anunciado, e não some', () => {
    const so: NoDoEsboco[] = [{ tipo: 'para', linha: 1, alvo: 'i', sobre: 'range(3)', vezes: 3, corpo: [] }];
    const faz = roteiroDePython(so).flatMap(t => t.faz);
    expect(faz[1]).toContain('ainda não há nada aqui dentro');
  });

  /* Esboço vazio devolve roteiro vazio, e não um trecho em branco: um cartão
     rotulado "o programa" sem uma linha dentro é a mesma promessa não cumprida
     de sempre. */
  it('programa vazio não gera trecho nenhum', () => {
    expect(roteiroDePython([])).toEqual([]);
  });
});
