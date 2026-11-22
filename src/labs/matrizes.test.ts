import { describe, it, expect } from 'vitest';
import {
  type Bruto, type Planta, criarSessao, matrizDaFormula, mostrar, transporFormula,
  referenciasDe, nomeDaRef, valorDaCelula, valorDaFormula,
} from './formulas';

/*
  As matrizes dinâmicas: a fórmula que devolve uma tabela, e a tabela que
  derrama pela grade. Os resultados são os do Excel de hoje e do Planilhas
  Google — quem aprende aqui leva a fórmula para o computador do clube.
*/

const grade = (linhas: string[][]): Bruto => (l, c) => linhas[l]?.[c] ?? '';

/* A tabela inteira que a fórmula devolve, como ela apareceria derramada. */
const tabela = (linhas: string[][], formula: string) =>
  matrizDaFormula(grade(linhas), formula).map(l => l.map(v => mostrar(v)));
const ver = (linhas: string[][], formula: string) => mostrar(valorDaFormula(grade(linhas), formula));

/* A planta de uma grade escrita à mão: as fórmulas e o tamanho dela. */
function planta(linhas: string[][], extensao?: { linhas: number; colunas: number }): Planta {
  return {
    formulas: () => {
      const r: Array<[number, number]> = [];
      linhas.forEach((l, i) => l.forEach((t, j) => { if (t.trimStart().startsWith('=')) r.push([i, j]); }));
      return r;
    },
    extensao: () => extensao ?? { linhas: linhas.length, colunas: Math.max(...linhas.map(l => l.length)) },
  };
}

/* A grade calculada, como a tela a mostra. */
function tela(linhas: string[][], extensao?: { linhas: number; colunas: number }) {
  const s = criarSessao(grade(linhas), { planta: planta(linhas, extensao) });
  const e = extensao ?? { linhas: linhas.length, colunas: Math.max(...linhas.map(l => l.length)) };
  return Array.from({ length: e.linhas }, (_, l) => Array.from({ length: e.colunas }, (_, c) => mostrar(s.valor(l, c))));
}

const CLUBE = [
  ['Nome', 'Unidade', 'Idade', 'Diárias'],
  ['Ana', 'Falcão', '12', '3'],
  ['Bia', 'Águia', '10', '2'],
  ['Caio', 'Falcão', '14', '3'],
  ['Davi', 'Onça', '11', '1'],
  ['Eva', 'Águia', '13', '3'],
];

describe('a conta elemento a elemento', () => {
  it('coluna vezes coluna dá a coluna dos produtos', () => {
    expect(tabela(CLUBE, '=C2:C6*D2:D6')).toEqual([['36'], ['20'], ['42'], ['11'], ['39']]);
  });

  /* Um valor só se repete para todo lado: é o `=A2:A9*B1` de todo orçamento. */
  it('coluna vezes um valor multiplica a coluna inteira pelo mesmo valor', () => {
    expect(tabela(CLUBE, '=D2:D4*45')).toEqual([['135'], ['90'], ['135']]);
  });

  /* Uma coluna contra uma linha vira a tabela inteira — é a tabuada. */
  it('coluna contra linha estica as duas até formar uma tabela', () => {
    expect(tabela(CLUBE, '={1;2;3}*{1\\2\\3}')).toEqual([['1', '2', '3'], ['2', '4', '6'], ['3', '6', '9']]);
  });

  /*
    Tamanhos que não se esticam um no outro deixam #N/D onde um acaba antes do
    outro. Zero ali seria uma conta feita com um número que ninguém escreveu.
  */
  it('onde uma das duas acaba antes da outra é #N/D, e não zero', () => {
    expect(tabela(CLUBE, '=C2:C4+D2:D3')).toEqual([['15'], ['12'], ['#N/D']]);
  });

  it('comparação e junção de texto também vão linha a linha', () => {
    expect(tabela(CLUBE, '=B2:B4="Falcão"')).toEqual([['VERDADEIRO'], ['FALSO'], ['VERDADEIRO']]);
    expect(tabela(CLUBE, '=A2:A3&" ("&B2:B3&")"')).toEqual([['Ana (Falcão)'], ['Bia (Águia)']]);
  });

  /* A SOMA de uma conta de matriz é a soma ponderada sem coluna auxiliar. */
  it('a SOMA de uma conta de matriz soma o resultado inteiro', () => {
    expect(ver(CLUBE, '=SOMA(C2:C6*D2:D6)')).toBe('148');
    expect(ver(CLUBE, '=SOMA((B2:B6="Falcão")*D2:D6)')).toBe('6');
  });
});

describe('a constante de matriz', () => {
  /*
    No Brasil a vírgula é a casa decimal e o ponto e vírgula separa argumento,
    então a barra invertida separa as colunas — como no Excel e no Planilhas
    Google em português.
  */
  it('barra invertida separa colunas, ponto e vírgula separa linhas', () => {
    expect(tabela(CLUBE, '={1\\2\\3}')).toEqual([['1', '2', '3']]);
    expect(tabela(CLUBE, '={1;2;3}')).toEqual([['1'], ['2'], ['3']]);
    expect(tabela(CLUBE, '={"a"\\-1,5;VERDADEIRO\\0}')).toEqual([['a', '-1,50'], ['VERDADEIRO', '0']]);
  });

  it('linha de tamanho diferente das outras, ou referência dentro, é recusada', () => {
    expect(ver(CLUBE, '={1\\2;3}')).toBe('#NOME?');
    expect(ver(CLUBE, '={A1\\A2}')).toBe('#NOME?');
  });
});

describe('o derramamento', () => {
  it('a fórmula escrita numa célula ocupa as de baixo, que continuam vazias por dentro', () => {
    const g = [['=SEQUÊNCIA(3)', ''], ['', ''], ['', ''], ['', '']];
    expect(tela(g)).toEqual([['1', ''], ['2', ''], ['3', ''], ['', '']]);
  });

  /* É o 0 que todo mundo já viu e ninguém entendeu, e é por ele que `.:.` existe. */
  it('célula vazia na origem aparece como 0 no derramamento', () => {
    const g = [['5', '=A1:A3'], ['', ''], ['7', '']];
    expect(tela(g).map(l => l[1])).toEqual(['5', '0', '7']);
  });

  /*
    Escrever no caminho não apaga nada: tranca. A fórmula passa a dizer
    #DESPEJAR!, e volta a derramar quando o caminho fica livre.
  */
  it('qualquer coisa escrita no caminho tranca o derramamento em #DESPEJAR!', () => {
    const g = [['=SEQUÊNCIA(3)'], [''], ['x'], ['']];
    expect(tela(g).map(l => l[0])).toEqual(['#DESPEJAR!', '', 'x', '']);
  });

  it('o resultado que passa da borda da grade também não cai', () => {
    const g = [[''], ['=SEQUÊNCIA(5)'], [''], ['']];
    expect(tela(g)[1][0]).toBe('#DESPEJAR!');
  });

  /* A regra da ordem é nossa: quem começa antes, na ordem de leitura, fica com o lugar. */
  it('dois derramamentos no mesmo lugar: o que começa antes fica, o outro tranca', () => {
    /* B1 vem antes de A2 na ordem de leitura, e os dois querem B2. */
    const g = [['', '=SEQUÊNCIA(2)', ''], ['=SEQUÊNCIA(1;3;5)', '', ''], ['', '', '']];
    const t = tela(g);
    expect(t.map(l => l[1])).toEqual(['1', '2', '']);
    expect(t[1][0]).toBe('#DESPEJAR!');
  });

  it('a fórmula dentro do caminho de outra tranca a de antes', () => {
    const g = [['=SEQUÊNCIA(3;2)', ''], ['', ''], ['', '=SEQUÊNCIA(1;1;9)']];
    expect(tela(g)[0][0]).toBe('#DESPEJAR!');
    expect(tela(g)[2][1]).toBe('9');
  });

  it('A1# lê o derramamento inteiro, do tamanho que ele tiver', () => {
    const g = [['=SEQUÊNCIA(4)', '=SOMA(A1#)', '=A1#*10'], ['', '', ''], ['', '', ''], ['', '', '']];
    const t = tela(g);
    expect(t[0][1]).toBe('10');
    expect(t.map(l => l[2])).toEqual(['10', '20', '30', '40']);
  });

  it('A1# onde não há derramamento é #REF!; onde ele está trancado é #DESPEJAR!', () => {
    expect(tela([['5', '=A1#']])[0][1]).toBe('#REF!');
    const g = [['=SEQUÊNCIA(2)', '=SOMA(A1#)'], ['x', '']];
    expect(tela(g)[0][1]).toBe('#DESPEJAR!');
  });

  it('uma fórmula que lê o próprio derramamento é circular, e não um número qualquer', () => {
    const g = [['=SEQUÊNCIA(3)+A2'], [''], ['']];
    expect(tela(g)[0][0]).toBe('Ref. circular');
  });

  it('e lê sem problema o que está fora dele', () => {
    const g = [['=SEQUÊNCIA(2)+A4'], [''], [''], ['10']];
    expect(tela(g).map(l => l[0])).toEqual(['11', '12', '', '10']);
  });

  /*
    O resumo no alto de uma tabela derramada lê a tabela, e a tabela, para
    saber se cabe, pergunta pelo resumo — que começa antes dela. Não é ciclo:
    o tamanho do resumo não depende de a tabela caber. E a resposta não pode
    depender de qual célula a tela pediu primeiro.
  */
  it('o resumo derramado no alto lê a tabela derramada embaixo, em qualquer ordem', () => {
    const g = [['=FILTRO(A4#;A4#>5)'], [''], [''], ['=SEQUÊNCIA(5;1;3)'], [''], [''], [''], ['']];
    const esperado = ['6', '7', '', '3', '4', '5', '6', '7'];
    const s1 = criarSessao(grade(g), { planta: planta(g) });
    expect(esperado.map((_, l) => mostrar(s1.valor(l, 0)))).toEqual(esperado);
    const s2 = criarSessao(grade(g), { planta: planta(g) });
    const deBaixo = [7, 6, 5, 4, 3, 2, 1, 0].map(l => mostrar(s2.valor(l, 0))).reverse();
    expect(deBaixo).toEqual(esperado);
  });

  it('a sessão diz de que fórmula veio cada valor derramado, e o tamanho que ela pede', () => {
    const g = [['=SEQUÊNCIA(2;2)', '', ''], ['', '', ''], ['=SEQUÊNCIA(2)', '', ''], ['x', '', '']];
    const s = criarSessao(grade(g), { planta: planta(g) });
    expect(s.derramamento(1, 1)).toEqual({ linha: 0, coluna: 0, linhas: 2, colunas: 2, bloqueado: false });
    expect(s.derramamento(2, 0)).toEqual({ linha: 2, coluna: 0, linhas: 2, colunas: 1, bloqueado: true });
    expect(s.derramamento(0, 2)).toBeNull();
    expect(s.derramamento(3, 0)).toBeNull();
  });

  it('sem planta, a fórmula solta mostra o primeiro valor, e nada derrama', () => {
    const g = [['=SEQUÊNCIA(3)'], [''], ['']];
    expect(mostrar(valorDaCelula(grade(g), 0, 0))).toBe('1');
    expect(mostrar(valorDaCelula(grade(g), 1, 0))).toBe('');
  });
});

describe('a coluna inteira e a faixa aparada', () => {
  const g = [['Nome', ''], ['Ana', ''], ['Bia', ''], ['', ''], ['', ''], ['', '']];

  it('A:A vai até a borda da grade, com zero em cada linha vazia', () => {
    const h = [['Nome', '=A:A'], ['Ana', ''], ['Bia', ''], ['', '']];
    expect(tela(h).map(l => l[1])).toEqual(['Nome', 'Ana', 'Bia', '0']);
  });

  /* `.:.` apara as duas pontas, `:.` só o fim e `.:` só o começo: o ponto fica do lado aparado. */
  it('A:.A para onde o dado acaba', () => {
    expect(tabela(g, '=A:.A')).toEqual([['Nome'], ['Ana'], ['Bia']]);
    expect(tabela(g, '=A1:.A6')).toEqual([['Nome'], ['Ana'], ['Bia']]);
  });

  it('cada operador apara só o seu lado', () => {
    const h = [[''], ['x'], ['y'], ['']];
    expect(tabela(h, '=A1.:A4')).toEqual([['x'], ['y'], ['0']]);
    expect(tabela(h, '=A1:.A4')).toEqual([['0'], ['x'], ['y']]);
    expect(tabela(h, '=A1.:.A4')).toEqual([['x'], ['y']]);
  });

  it('APARARINTERVALO faz a mesma conta, e escolhe o que aparar', () => {
    const h = [['', '', ''], ['', 'x', ''], ['', '', '']];
    expect(tabela(h, '=APARARINTERVALO(A1:C3)')).toEqual([['x']]);
    expect(tabela(h, '=APARARINTERVALO(A1:C3;0;3)')).toEqual([['0'], ['x'], ['0']]);
  });

  /* Faixa toda vazia aparada não aponta para célula nenhuma; uma soma 0 ali pareceria verdadeira. */
  it('faixa toda vazia aparada é #REF!', () => {
    expect(ver([[''], ['']], '=SOMA(A1:.A2)')).toBe('#REF!');
  });

  it('a coluna inteira entra na SOMA, no CONT.SE e numa aba nomeada', () => {
    const k = [['12', 'a'], ['30', 'b'], ['x', 'a']];
    expect(ver(k, '=SOMA(A:A)')).toBe('42');
    expect(ver(k, '=CONT.SE(B:.B;"a")')).toBe('2');
  });
});

describe('PROCX', () => {
  /* O padrão é exato — o contrário do PROCV, e a razão de ele existir. */
  it('procura exato por padrão e devolve da coluna pedida, à esquerda inclusive', () => {
    expect(ver(CLUBE, '=PROCX("Caio";A2:A6;C2:C6)')).toBe('14');
    expect(ver(CLUBE, '=PROCX(13;C2:C6;A2:A6)')).toBe('Eva');
  });

  it('não achar é #N/D, a não ser que o quarto argumento diga o que mostrar', () => {
    expect(ver(CLUBE, '=PROCX("Zeca";A2:A6;C2:C6)')).toBe('#N/D');
    expect(ver(CLUBE, '=PROCX("Zeca";A2:A6;C2:C6;"não inscrito")')).toBe('não inscrito');
  });

  it('com várias colunas de retorno, devolve a linha inteira', () => {
    expect(tabela(CLUBE, '=PROCX("Bia";A2:A6;B2:D6)')).toEqual([['Águia', '10', '2']]);
  });

  /* Número não acha texto: é a mesma assimetria do número guardado como texto. */
  it('o número 12 não acha o texto "12"', () => {
    expect(ver([["'12", 'a']], '=PROCX(12;A1:A1;B1:B1)')).toBe('#N/D');
  });

  it('o próximo menor e o próximo maior não exigem lista em ordem', () => {
    const faixas = [['10', 'D'], ['0', 'F'], ['7', 'B'], ['5', 'C'], ['9', 'A']];
    expect(ver(faixas, '=PROCX(8;A1:A5;B1:B5;;-1)')).toBe('B');
    expect(ver(faixas, '=PROCX(8;A1:A5;B1:B5;;1)')).toBe('A');
    expect(ver(faixas, '=PROCX(11;A1:A5;B1:B5;;1)')).toBe('#N/D');
  });

  it('procura de trás para a frente acha a última ocorrência', () => {
    expect(ver(CLUBE, '=PROCX("Falcão";B2:B6;A2:A6;;0;-1)')).toBe('Caio');
    expect(ver(CLUBE, '=PROCX("Falcão";B2:B6;A2:A6)')).toBe('Ana');
  });

  /* A binária é binária de verdade: numa lista fora de ordem ela erra, como no Excel. */
  it('a pesquisa binária acerta na lista em ordem e pode errar fora dela', () => {
    const ordenada = [['1'], ['3'], ['5'], ['7'], ['9']];
    expect(ver(ordenada, '=CORRESPX(7;A1:A5;0;2)')).toBe('4');
    const fora = [['9'], ['1'], ['7'], ['3'], ['5']];
    expect(ver(fora, '=CORRESPX(9;A1:A5;0;2)')).toBe('#N/D');
    expect(ver(fora, '=CORRESPX(9;A1:A5)')).toBe('1');
  });

  it('o curinga existe só no modo 2, e o til escapa', () => {
    expect(ver(CLUBE, '=PROCX("C*";A2:A6;C2:C6;;2)')).toBe('14');
    expect(ver(CLUBE, '=PROCX("C*";A2:A6;C2:C6)')).toBe('#N/D');
    expect(ver([['a*b', '1'], ['axb', '2']], '=PROCX("a~*b";A1:A2;B1:B2;;2)')).toBe('1');
  });

  it('procurar uma coluna inteira de nomes devolve a coluna das respostas', () => {
    expect(tabela(CLUBE, '=PROCX(A2:A4;A2:A6;B2:B6)')).toEqual([['Falcão'], ['Águia'], ['Falcão']]);
  });
});

describe('CORRESP, CORRESPX e ÍNDICE', () => {
  it('ÍNDICE com CORRESP procura em qualquer coluna e devolve de qualquer outra', () => {
    expect(ver(CLUBE, '=ÍNDICE(A2:A6;CORRESP(11;C2:C6;0))')).toBe('Davi');
  });

  /*
    O padrão do CORRESP é aproximado, como o do PROCV: numa lista fora de
    ordem ele devolve uma posição plausível e errada. É a armadilha, e é por
    isso que o 0 se escreve.
  */
  it('CORRESP sem o 0 procura aproximado, e numa lista fora de ordem erra', () => {
    expect(ver(CLUBE, '=CORRESP(13;C2:C6;0)')).toBe('5');
    expect(ver(CLUBE, '=CORRESP(13;C2:C6)')).toBe('2');
  });

  it('CORRESPX é exato por padrão', () => {
    expect(ver(CLUBE, '=CORRESPX(13;C2:C6)')).toBe('5');
  });

  it('ÍNDICE com zero devolve a coluna ou a linha inteira, e fora da tabela é #REF!', () => {
    expect(tabela(CLUBE, '=ÍNDICE(A2:D3;0;2)')).toEqual([['Falcão'], ['Águia']]);
    expect(tabela(CLUBE, '=ÍNDICE(A2:D3;2;0)')).toEqual([['Bia', 'Águia', '10', '2']]);
    expect(ver(CLUBE, '=ÍNDICE(A2:D3;3;1)')).toBe('#REF!');
    expect(ver(CLUBE, '=ÍNDICE(A1:D1;3)')).toBe('Idade');
  });
});

describe('FILTRO', () => {
  it('devolve as linhas em que a condição é verdadeira', () => {
    expect(tabela(CLUBE, '=FILTRO(A2:C6;B2:B6="Águia")')).toEqual([['Bia', 'Águia', '10'], ['Eva', 'Águia', '13']]);
  });

  /* E e OU devolvem um valor só para a tabela inteira; multiplicar é o "e", somar é o "ou". */
  it('duas condições se juntam multiplicando, e não com E', () => {
    expect(tabela(CLUBE, '=FILTRO(A2:A6;(B2:B6="Falcão")*(C2:C6>12))')).toEqual([['Caio']]);
    expect(tabela(CLUBE, '=FILTRO(A2:A6;(B2:B6="Onça")+(C2:C6>13))')).toEqual([['Caio'], ['Davi']]);
    expect(ver(CLUBE, '=FILTRO(A2:B6;E(B2:B6="Falcão";C2:C6>12))')).toBe('#VALOR!');
  });

  it('ninguém passando é #CALC!, ou o que o terceiro argumento mandar mostrar', () => {
    expect(ver(CLUBE, '=FILTRO(A2:A6;C2:C6>20)')).toBe('#CALC!');
    expect(ver(CLUBE, '=FILTRO(A2:A6;C2:C6>20;"ninguém")')).toBe('ninguém');
  });

  it('condição de tamanho diferente da tabela é #VALOR!', () => {
    expect(ver(CLUBE, '=FILTRO(A2:A6;C2:C4>11)')).toBe('#VALOR!');
  });
});

describe('CLASSIFICAR, CLASSIFICARPOR e ÚNICO', () => {
  it('CLASSIFICAR ordena pela coluna pedida, nos dois sentidos', () => {
    expect(tabela(CLUBE, '=CLASSIFICAR(A2:C6;3)').map(l => l[0])).toEqual(['Bia', 'Davi', 'Ana', 'Eva', 'Caio']);
    expect(tabela(CLUBE, '=CLASSIFICAR(A2:C6;3;-1)').map(l => l[0])).toEqual(['Caio', 'Eva', 'Ana', 'Davi', 'Bia']);
  });

  /* Os três blocos da planilha: número, texto, lógico — e o vazio sempre no fim. */
  it('número antes de texto em ordem crescente, e o vazio no fim nos dois sentidos', () => {
    const m = [['b'], ['10'], [''], ['2'], ['a']];
    expect(tabela(m, '=CLASSIFICAR(A1:A5)')).toEqual([['2'], ['10'], ['a'], ['b'], ['0']]);
    expect(tabela(m, '=CLASSIFICAR(A1:A5;1;-1)')).toEqual([['b'], ['a'], ['10'], ['2'], ['0']]);
  });

  it('a ordem diferente de 1 e -1 é #VALOR!', () => {
    expect(ver(CLUBE, '=CLASSIFICAR(A2:C6;1;2)')).toBe('#VALOR!');
  });

  it('CLASSIFICARPOR ordena por uma coluna que não aparece, e a segunda desempata', () => {
    expect(tabela(CLUBE, '=CLASSIFICARPOR(A2:A6;C2:C6;1)')).toEqual([['Bia'], ['Davi'], ['Ana'], ['Eva'], ['Caio']]);
    expect(tabela(CLUBE, '=CLASSIFICARPOR(A2:A6;D2:D6;-1;C2:C6;1)')).toEqual([['Ana'], ['Eva'], ['Caio'], ['Bia'], ['Davi']]);
  });

  it('ÚNICO tira as repetições sem diferenciar maiúscula, na ordem em que aparecem', () => {
    const m = [['Falcão'], ['águia'], ['FALCÃO'], ['Águia'], ['Onça']];
    expect(tabela(m, '=ÚNICO(A1:A5)')).toEqual([['Falcão'], ['águia'], ['Onça']]);
    expect(tabela(m, '=ÚNICO(A1:A5;;VERDADEIRO)')).toEqual([['Onça']]);
  });

  it('ÚNICO compara a linha inteira', () => {
    expect(tabela(CLUBE, '=ÚNICO(B2:B6)')).toEqual([['Falcão'], ['Águia'], ['Onça']]);
    expect(ver(CLUBE, '=CONT.VALORES(ÚNICO(B2:B6))')).toBe('3');
  });
});

describe('as que montam e remontam tabelas', () => {
  it('SEQUÊNCIA numera linhas, colunas, começo e passo; zero linhas é #CALC!', () => {
    expect(tabela(CLUBE, '=SEQUÊNCIA(2;3;10;5)')).toEqual([['10', '15', '20'], ['25', '30', '35']]);
    expect(ver(CLUBE, '=SEQUÊNCIA(0)')).toBe('#CALC!');
  });

  it('TRANSPOR deita a coluna e levanta a linha', () => {
    expect(tabela(CLUBE, '=TRANSPOR(A1:C1)')).toEqual([['Nome'], ['Unidade'], ['Idade']]);
  });

  it('EMPILHARV completa a fileira curta com #N/D', () => {
    expect(tabela(CLUBE, '=EMPILHARV(A1:B1;{1\\2\\3})')).toEqual([['Nome', 'Unidade', '#N/D'], ['1', '2', '3']]);
    expect(tabela(CLUBE, '=EMPILHARH({1;2};{3;4})')).toEqual([['1', '3'], ['2', '4']]);
  });

  it('ESCOLHERCOLS e ESCOLHERLINS escolhem na ordem pedida, e o negativo conta do fim', () => {
    expect(tabela(CLUBE, '=ESCOLHERCOLS(A1:D2;-1;1)')).toEqual([['Diárias', 'Nome'], ['3', 'Ana']]);
    expect(tabela(CLUBE, '=ESCOLHERLINS(A1:A6;1;-1)')).toEqual([['Nome'], ['Eva']]);
    expect(ver(CLUBE, '=ESCOLHERCOLS(A1:D2;5)')).toBe('#VALOR!');
  });

  /* O que não é número dentro do SOMARPRODUTO vale zero: a conta passa por cima do cabeçalho. */
  it('SOMARPRODUTO soma os produtos, e tamanhos diferentes são #VALOR!', () => {
    expect(ver(CLUBE, '=SOMARPRODUTO(C2:C6;D2:D6)')).toBe('148');
    expect(ver(CLUBE, '=SOMARPRODUTO(C1:C6;D1:D6)')).toBe('148');
    expect(ver(CLUBE, '=SOMARPRODUTO(C2:C6;D2:D5)')).toBe('#VALOR!');
  });

  it('ARRAYFORMULA, do Planilhas Google, devolve o que recebe', () => {
    expect(tabela(CLUBE, '=ARRAYFORMULA(C2:C3*2)')).toEqual([['24'], ['20']]);
  });
});

describe('as funções de um valor só, aplicadas a cada elemento', () => {
  it('SE devolve a coluna das respostas', () => {
    expect(tabela(CLUBE, '=SE(C2:C4>=12;"maior";"menor")')).toEqual([['maior'], ['menor'], ['maior']]);
  });

  it('ANO de uma coluna de datas é a coluna dos anos', () => {
    expect(tabela([['15/07/2014'], ['02/03/2016']], '=ANO(A1:A2)')).toEqual([['2014'], ['2016']]);
  });

  it('PROCV procura uma coluna inteira de uma vez, e a tabela não se espalha', () => {
    expect(tabela(CLUBE, '=PROCV(A2:A3;A2:C6;3;FALSO)')).toEqual([['12'], ['10']]);
  });

  it('SEERRO troca só os elementos com erro', () => {
    expect(tabela([['4'], ['0'], ['2']], '=SEERRO(8/A1:A3;"-")')).toEqual([['2'], ['-'], ['4']]);
  });

  it('CONT.SE com uma lista de critérios conta cada um', () => {
    expect(tabela(CLUBE, '=CONT.SE(B2:B6;{"Falcão";"Águia";"Onça"})')).toEqual([['2'], ['2'], ['1']]);
  });

  /* O argumento em branco vale zero no Excel, e é por isso que esse PROCV procura exato. */
  it('argumento em branco vale zero, e o PROCV com ";)" no fim procura exato', () => {
    expect(ver(CLUBE, '=PROCV(13;C2:D6;2;)')).toBe('3');
  });
});

describe('copiar a fórmula', () => {
  it('a coluna inteira anda de lado e não anda para baixo', () => {
    expect(transporFormula('=SOMA(A:A)', 3, 1)).toBe('=SOMA(B:B)');
    expect(transporFormula('=SOMA($A:$A)', 3, 1)).toBe('=SOMA($A:$A)');
    expect(transporFormula('=A:.A', 0, 2)).toBe('=C:.C');
  });

  it('A1# e os operadores de aparar andam como referência', () => {
    expect(transporFormula('=SOMA(A1#)', 1, 1)).toBe('=SOMA(B2#)');
    expect(transporFormula('=A1.:.A9', 1, 0)).toBe('=A2.:.A10');
    expect(transporFormula('={1\\2;3\\4}*A1', 1, 0)).toBe('={1\\2;3\\4}*A2');
  });

  /* Sem a aba, a cópia de `=Respostas!E2` passava a ler a coluna E da própria aba. */
  it('a aba vai junto com a referência copiada', () => {
    expect(transporFormula('=Respostas!E2*2', 1, 0)).toBe('=Respostas!E3*2');
    expect(transporFormula('=SOMA(Dados!A2:B5)+Dados!C:.C', 1, 1)).toBe('=SOMA(Dados!B3:C6)+Dados!D:.D');
  });

  it('A1# conta como referência citada', () => {
    expect(referenciasDe('=SOMA(B2#)').map(nomeDaRef)).toEqual(['B2']);
  });
});
