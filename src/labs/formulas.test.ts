import { describe, it, expect } from 'vitest';
import {
  type Bruto, valorDaCelula, valorDaFormula, valorDoBruto, mostrar, mostrarNumero,
  transporFormula, referenciasDe, nomeDaColuna, colunaDoNome, nomeDaRef, ref,
  ehNumero, numeroDoTexto, TEXTO_DO_ERRO,
} from './formulas';

const grade = (linhas: string[][]): Bruto => (l, c) => linhas[l]?.[c] ?? '';
const ver = (linhas: string[][], formula: string) => mostrar(valorDaFormula(grade(linhas), formula));

/*
  A planilha do clube, com o defeito dentro: o total do Tucano foi colado de
  um site e chegou com apóstrofo. Ele aparece na tela igual aos outros dois.
*/
const CLUBE = [
  ['Unidade', 'Inscritos', 'Diárias', 'Total'],
  ['Falcão', '12', '3', '1620'],
  ['Águia', '9', '3', '1215'],
  ['Tucano', '11', '3', "'1485"],
];

describe('o número guardado como texto', () => {
  /*
    O requisito 7 inteiro depende disto. Se a SOMA somasse os três, "número
    armazenado como texto" seria um enunciado sem nada por trás: a planilha
    defeituosa não teria defeito nenhum, e a lição mandaria procurar o que não
    existe.
  */
  it('não entra na SOMA, e o total fecha plausível e errado', () => {
    expect(ver(CLUBE, '=SOMA(D2:D4)')).toBe('2835');
    expect(ver(CLUBE, '=SOMA(D2:D4)')).not.toBe('4320');
  });

  it('some da CONT.NÚM e continua na CONT.VALORES, que é como se acha', () => {
    expect(ver(CLUBE, '=CONT.NÚM(D2:D4)')).toBe('2');
    expect(ver(CLUBE, '=CONT.VALORES(D2:D4)')).toBe('3');
  });

  /*
    E numa conta ele **funciona**, porque o Excel converte texto numérico em
    operador aritmético. É por isso que o defeito passa despercebido: quem
    confere uma célula por vez não vê nada de errado.
  */
  it('mas soma normalmente quando alguém escreve =D4+0 para conferir', () => {
    expect(ver(CLUBE, '=D4+0')).toBe('1485');
  });

  it('e o apóstrofo não aparece no que a célula mostra', () => {
    expect(mostrar(valorDoBruto("'1485"))).toBe('1485');
    expect(valorDoBruto("'1485").tipo).toBe('texto');
    expect(valorDoBruto('1485').tipo).toBe('numero');
  });

  /*
    Texto escrito direto no argumento **é** convertido; texto que vem de dentro
    de uma faixa é ignorado. A assimetria é do Excel, e é ela que esconde o
    defeito: as duas regras juntas fazem a planilha parecer coerente.
  */
  it('texto direto no argumento entra na conta, e texto vindo de faixa não', () => {
    expect(ver(CLUBE, '=SOMA("1485";0)')).toBe('1485');
    expect(ver(CLUBE, '=SOMA(D4:D4)')).toBe('0');
  });
});

describe('as funções de agregação', () => {
  it('somam, tiram média, e acham o maior e o menor', () => {
    expect(ver(CLUBE, '=SOMA(B2:B4)')).toBe('32');
    expect(ver(CLUBE, '=MÉDIA(B2:B4)')).toBe('10,67');
    expect(ver(CLUBE, '=MÁXIMO(B2:B4)')).toBe('12');
    expect(ver(CLUBE, '=MÍNIMO(B2:B4)')).toBe('9');
  });

  it('aceitam o nome sem acento, que é o que sai do teclado do celular', () => {
    expect(ver(CLUBE, '=MEDIA(B2:B4)')).toBe('10,67');
    expect(ver(CLUBE, '=CONT.NUM(D2:D4)')).toBe('2');
  });

  /*
    A soma de nada é zero — é a conta. A média de nada é divisão por zero, e
    devolver zero aqui afirmaria que a média de coisa nenhuma é zero, que é um
    número plausível para uma pergunta sem resposta.
  */
  it('a soma de faixa vazia é zero, e a média de faixa vazia é #DIV/0!', () => {
    expect(ver(CLUBE, '=SOMA(F1:F9)')).toBe('0');
    expect(ver(CLUBE, '=MÉDIA(F1:F9)')).toBe('#DIV/0!');
  });

  it('o cabeçalho de texto não entra na conta da coluna', () => {
    expect(ver(CLUBE, '=SOMA(B1:B4)')).toBe('32');
  });

  it('CONT.SE e SOMASE leem o critério escrito como na caixa do Excel', () => {
    expect(ver(CLUBE, '=CONT.SE(B2:B4;">10")')).toBe('2');
    expect(ver(CLUBE, '=CONT.SE(A2:A4;"Falcão")')).toBe('1');
    expect(ver(CLUBE, '=CONT.SE(A2:A4;"<>Falcão")')).toBe('2');
    expect(ver(CLUBE, '=SOMASE(A2:A4;"Águia";B2:B4)')).toBe('9');
  });
});

describe('a condição e a procura', () => {
  it('SE escolhe um dos dois lados', () => {
    expect(ver(CLUBE, '=SE(B2>10;"cheia";"cabe mais")')).toBe('cheia');
    expect(ver(CLUBE, '=SE(B3>10;"cheia";"cabe mais")')).toBe('cabe mais');
  });

  it('VERDADEIRO e FALSO se escrevem sem parênteses, como na fórmula de verdade', () => {
    expect(ver(CLUBE, '=SE(B2>10;VERDADEIRO;FALSO)')).toBe('VERDADEIRO');
    expect(ver(CLUBE, '=E(B2>10;B3>10)')).toBe('FALSO');
    expect(ver(CLUBE, '=OU(B2>10;B3>10)')).toBe('VERDADEIRO');
  });

  it('PROCV acha a linha e devolve a coluna pedida', () => {
    expect(ver(CLUBE, '=PROCV("Águia";A2:D4;2;FALSO)')).toBe('9');
    expect(ver(CLUBE, '=PROCV("Jaguar";A2:D4;2;FALSO)')).toBe('#N/D');
    expect(ver(CLUBE, '=PROCV("Águia";A2:D4;9;FALSO)')).toBe('#REF!');
  });

  /*
    O quarto argumento vale VERDADEIRO quando não se escreve nada, e é o
    padrão do Excel. Numa tabela fora de ordem — que é toda tabela que alguém
    digitou — isso devolve **a linha errada com toda a confiança**, sem erro
    nenhum. Trocar o padrão aqui deixaria o laboratório mais fácil e o
    computador do clube continuaria com o de lá.
  */
  it('e sem o quarto argumento ele procura aproximado, e devolve outra unidade', () => {
    /*
      A coluna de unidades não está em ordem alfabética — nenhuma tabela que
      alguém digitou está. O PROCV aproximado lê como se estivesse e para na
      linha errada: perguntado por Falcão, ele devolve com toda a confiança os
      9 inscritos da Águia. Nenhum erro na tela.
    */
    expect(ver(CLUBE, '=PROCV("Falcão";A2:D4;2)')).toBe('9');
    expect(ver(CLUBE, '=PROCV("Falcão";A2:D4;2;FALSO)')).toBe('12');

    /* E acerta o Tucano por acaso, porque ele é o último — o que é pior: o
       defeito aparece em algumas linhas e não em outras. */
    expect(ver(CLUBE, '=PROCV("Tucano";A2:D4;2)')).toBe('11');

    /* Quem não existe sai com um número, em vez de #N/D. */
    expect(ver(CLUBE, '=PROCV("Jaguar";A2:D4;2)')).toBe('9');
    expect(ver(CLUBE, '=PROCV("Jaguar";A2:D4;2;FALSO)')).toBe('#N/D');
  });

  /*
    A ordem é a do português, e não a do UTF-16: `<` entre strings põe `Águia`
    atrás de `Tucano`, porque `á` vale 225 e `z` vale 122. Com a ordem errada,
    o PROCV aproximado para na primeira linha e devolve sempre a mesma.
  */
  it('e a ordem das palavras é a do dicionário, com acento no lugar certo', () => {
    expect(ver(CLUBE, '="Águia"<"Falcão"')).toBe('VERDADEIRO');
    expect(ver(CLUBE, '="Águia"<"Zebra"')).toBe('VERDADEIRO');
    expect(ver(CLUBE, '="falcao"="falcão"')).toBe('FALSO');
  });
});

describe('a aritmética', () => {
  it('faz as quatro contas e respeita a precedência', () => {
    expect(ver(CLUBE, '=2+3*4')).toBe('14');
    expect(ver(CLUBE, '=(2+3)*4')).toBe('20');
    expect(ver(CLUBE, '=B2*C2*45')).toBe('1620');
  });

  /*
    `=-2^2` dá 4 no Excel, e não −4: o menos unário liga mais forte que a
    potência. É uma das poucas coisas em que a planilha discorda da matemática
    da escola, e copiar a escola aqui faria a plataforma discordar do programa
    que ela imita.
  */
  it('o menos unário liga mais forte que a potência, como no Excel', () => {
    expect(ver(CLUBE, '=-2^2')).toBe('4');
    expect(ver(CLUBE, '=0-2^2')).toBe('-4');
  });

  it('dividir por zero é erro à vista, e não infinito nem zero', () => {
    expect(ver(CLUBE, '=B2/0')).toBe('#DIV/0!');
  });

  it('o & junta texto, e número virado texto sai como se lê', () => {
    expect(ver(CLUBE, '=A2&" tem "&B2&" inscritos"')).toBe('Falcão tem 12 inscritos');
  });

  it('compara texto sem diferenciar maiúscula, como a planilha faz', () => {
    expect(ver(CLUBE, '="falcão"="FALCÃO"')).toBe('VERDADEIRO');
  });

  it('célula vazia vale zero numa conta e não conta como preenchida', () => {
    expect(ver(CLUBE, '=F1+10')).toBe('10');
    expect(ver(CLUBE, '=CONT.VALORES(F1:F9)')).toBe('0');
  });
});

describe('os erros', () => {
  it('nome de função errado vira #NOME?, e não zero', () => {
    expect(ver(CLUBE, '=SOMATORIO(B2:B4)')).toBe('#NOME?');
  });

  it('fórmula que não fecha o parêntese também é #NOME?, e não estoura', () => {
    expect(ver(CLUBE, '=SOMA(B2:B4')).toBe('#NOME?');
    expect(ver(CLUBE, '=*')).toBe('#NOME?');
  });

  /*
    Erro não se dilui na conta seguinte: ele sobe. Uma soma que ignorasse a
    célula com erro devolveria um total a menos, sem nada na tela dizendo que
    faltou alguém.
  */
  it('o erro de uma célula sobe para quem depende dela', () => {
    const g = [['=1/0', '5'], ['=A1+B1', '']];
    expect(ver(g, '=A2')).toBe('#DIV/0!');
    expect(ver(g, '=SOMA(A1:B1)')).toBe('#DIV/0!');
  });

  it('texto que não é número derruba a conta em #VALOR!', () => {
    expect(ver(CLUBE, '=A2+1')).toBe('#VALOR!');
  });

  /*
    Faixa onde se espera um valor é erro. Devolver a primeira célula calada
    faria `=A1:A5*2` mostrar a conta de uma linha só, com cara de estar certa.
  */
  it('faixa usada como valor é #VALOR!, e não a primeira célula', () => {
    expect(ver(CLUBE, '=B2:B4+1')).toBe('#VALOR!');
  });
});

describe('a referência circular', () => {
  /*
    `=A1+1` escrito em A1 é o erro de digitação mais comum que existe numa
    planilha. Sem guarda, ele trava a aba do navegador numa recursão infinita
    e leva junto o trabalho da lição inteira — que é um estrago muito maior do
    que a fórmula errada.
  */
  it('não trava, e diz o que houve', () => {
    const g = [['=A1+1']];
    expect(ver(g, '=A1')).toBe('Ref. circular');
  });

  it('nem quando o laço passa por três células', () => {
    expect(mostrar(valorDaCelula(grade([['=B1', '=C1', '=A1']]), 0, 0))).toBe('Ref. circular');
  });

  it('e uma célula sã ao lado do laço continua respondendo', () => {
    expect(ver([['=A1', '7']], '=B1+1')).toBe('8');
  });
});

describe('o número em português', () => {
  it('a vírgula é decimal e o ponto é milhar', () => {
    expect(numeroDoTexto('1.234,50')).toBe(1234.5);
    expect(numeroDoTexto('12,5')).toBe(12.5);
    expect(numeroDoTexto('-3')).toBe(-3);
  });

  /*
    `1.23` é texto, porque o ponto de milhar pede três dígitos atrás dele. É o
    que o Excel em português faz, e é a diferença que alguém descobre colando
    dado de um site americano: a coluna inteira chega encostada à esquerda.
  */
  it('e um ponto com dois dígitos atrás não é número nenhum', () => {
    expect(numeroDoTexto('1.23')).toBeNull();
    expect(ehNumero('1.23')).toBe(false);
    expect(ehNumero('1.234')).toBe(true);
  });

  it('o que se mostra tem duas casas quando não é inteiro', () => {
    expect(mostrarNumero(1620)).toBe('1620');
    expect(mostrarNumero(10 + 2 / 3)).toBe('10,67');
    expect(mostrarNumero(0)).toBe('0');
  });

  it('e o formato de moeda agrupa o milhar', () => {
    expect(mostrar({ tipo: 'numero', n: 4320 }, 'moeda')).toBe('R$ 4.320,00');
    expect(mostrar({ tipo: 'numero', n: -12.5 }, 'moeda')).toBe('-R$ 12,50');
    expect(mostrar({ tipo: 'numero', n: 0.25 }, 'porcentagem')).toBe('25%');
  });
});

describe('a coluna tem nome, e ele passa de Z', () => {
  it('vai e volta', () => {
    expect(nomeDaColuna(0)).toBe('A');
    expect(nomeDaColuna(25)).toBe('Z');
    expect(nomeDaColuna(26)).toBe('AA');
    expect(nomeDaColuna(27)).toBe('AB');
    [0, 1, 25, 26, 27, 51, 52, 700].forEach(c => expect(colunaDoNome(nomeDaColuna(c))).toBe(c));
  });

  it('e o cifrão viaja com o nome', () => {
    expect(nomeDaRef(ref(0, 0))).toBe('A1');
    expect(nomeDaRef(ref(4, 2, true, true))).toBe('$C$5');
    expect(nomeDaRef(ref(4, 2, true, false))).toBe('C$5');
    expect(nomeDaRef(ref(4, 2, false, true))).toBe('$C5');
  });
});

describe('arrastar a fórmula para baixo', () => {
  /*
    É o requisito 4.3 inteiro: a relativa anda junto, a travada fica. Sem
    arrastar e ver isso acontecer, "absoluta" e "relativa" são duas palavras
    que se decoram e se trocam na prova.
  */
  it('a referência relativa anda e a absoluta fica', () => {
    expect(transporFormula('=B2*C2', 1, 0)).toBe('=B3*C3');
    expect(transporFormula('=B2*$C$2', 1, 0)).toBe('=B3*$C$2');
    expect(transporFormula('=B2*C$2', 1, 0)).toBe('=B3*C$2');
    expect(transporFormula('=B2*$C2', 0, 1)).toBe('=C2*$C2');
  });

  it('a faixa anda inteira, ponta a ponta', () => {
    expect(transporFormula('=SOMA(B2:B4)', 2, 0)).toBe('=SOMA(B4:B6)');
    expect(transporFormula('=SOMA($B$2:$B$4)', 2, 0)).toBe('=SOMA($B$2:$B$4)');
  });

  /*
    Fora da grade a planilha escreve `#REF!` dentro do texto da fórmula, e é
    por isso que o analisador sabe lê-lo de volta: sem isso a fórmula copiada
    viraria `#NOME?`, mandando procurar um nome de função que ninguém escreveu.
  */
  it('empurrada para fora da grade, ela vira #REF! por escrito', () => {
    expect(transporFormula('=A1+B1', 0, -1)).toBe('=#REF!+A1');
    expect(ver(CLUBE, '=#REF!+1')).toBe('#REF!');
  });

  it('o texto entre aspas não é referência, e não anda', () => {
    expect(transporFormula('=SE(A1>0;"A1 positivo";"não")', 1, 0)).toBe('=SE(A2>0;"A1 positivo";"não")');
  });

  it('e o que não é fórmula volta como veio', () => {
    expect(transporFormula('1620', 3, 3)).toBe('1620');
    expect(transporFormula('=SOMA(', 1, 0)).toBe('=SOMA(');
  });

  it('as referências citadas se leem sem avaliar nada', () => {
    expect(referenciasDe('=SOMA(B2:B4)+$D$1').map(nomeDaRef)).toEqual(['B2', 'B4', '$D$1']);
    expect(referenciasDe('12')).toEqual([]);
  });
});

describe('a fórmula guarda a conta, e não o resultado', () => {
  it('o valor se refaz quando a célula de origem muda', () => {
    const antes = [['12'], ['=A1*2']];
    expect(mostrar(valorDaCelula(grade(antes), 1, 0))).toBe('24');
    const depois = [['5'], ['=A1*2']];
    expect(mostrar(valorDaCelula(grade(depois), 1, 0))).toBe('10');
  });

  it('e a cadeia de fórmulas resolve de ponta a ponta', () => {
    const g = [['2'], ['=A1*3'], ['=A2+1'], ['=SOMA(A1:A3)']];
    expect(mostrar(valorDaCelula(grade(g), 3, 0))).toBe('15');
  });
});

describe('todo erro tem texto próprio', () => {
  it('e nenhum deles é vazio nem repetido', () => {
    const textos = Object.values(TEXTO_DO_ERRO);
    expect(textos.length).toBeGreaterThan(0);
    expect(textos.every(t => t.trim() !== '')).toBe(true);
    expect(new Set(textos).size).toBe(textos.length);
  });
});
