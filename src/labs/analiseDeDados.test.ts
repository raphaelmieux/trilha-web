import { describe, expect, it } from 'vitest';
import {
  agrupadoPor, amplitude, atipicosDe, cercaDe, classesDe, colunaDe, desvioPadrao,
  frequenciasDe, maximo, media, medidaDa, medidaPorGrupo, mediana, minimo, moda,
  numerosDe, taxa,
} from './analiseDeDados';
import { ehErro } from './formulas';
import type { Formulario, Resposta } from './formulario';

describe('as medidas vêm do motor da planilha', () => {
  /*
    Não basta que os números batam: eles batem numa coluna limpa por qualquer
    conta escrita de qualquer jeito. O que separa o motor de um segundo
    avaliador é **o que cada um ignora**, e é sobre isso que estas três
    asserções perguntam.

    `1.5` é número escrito com ponto, que em planilha pt-BR é texto — é a
    armadilha da CC-ES003 e a do módulo 5 da CC-ES008. `'30` é o apóstrofo, que
    é o requisito 7 da CC-ES003 inteiro. Célula em branco não é zero. Um
    `Number(v)` escrito aqui devolveria outro número nos três casos, e os três
    seriam plausíveis.
  */
  it('pula o número escrito com ponto, que a planilha lê como texto', () => {
    expect(media(['10', '20', '1.5'])).toBe(15);
    expect(numerosDe(['10', '20', '1.5'])).toEqual([10, 20]);
  });

  it('pula o número guardado com apóstrofo', () => {
    expect(media(['10', '20', "'30"])).toBe(15);
  });

  it('pula a célula em branco em vez de contá-la como zero', () => {
    expect(media(['10', '20', ''])).toBe(15);
  });

  it('lê a vírgula como separador decimal', () => {
    expect(media(['1,5', '2,5'])).toBe(2);
  });

  it('devolve o erro do motor sobre coluna sem número nenhum', () => {
    /* Média de nada é `#DIV/0!` no Excel, e escrever zero aqui afirmaria uma
       média sobre gente que não existe. Quem decide isso é o motor. */
    expect(ehErro(medidaDa([], 'MÉDIA'))).toBe(true);
    expect(media([])).toBeNull();
    expect(media(['a', 'b'])).toBeNull();
  });
});

describe('centro', () => {
  it('a mediana de contagem par é a média das duas do meio', () => {
    /* Escolher uma das duas devolve uma mediana **que existe na tabela** e é
       errada, que é pior do que uma que não aparece em linha nenhuma. */
    expect(mediana(['1', '2', '3', '4'])).toBe(2.5);
    expect(mediana(['1', '2', '3'])).toBe(2);
  });

  it('a moda não existe quando nada se repete', () => {
    expect(moda(['1', '2', '3'])).toBeNull();
    expect(moda(['1', '2', '2', '3'])).toBe(2);
  });

  it('a média sobe com o valor extremo e a mediana não', () => {
    /* É o requisito 3 em duas linhas: as duas medidas respondem sobre o mesmo
       conjunto e discordam, e quem escolhe qual relatar escolhe o que a
       liderança vai entender. */
    const sem = ['1', '2', '2', '3'];
    const com = ['1', '2', '2', '3', '40'];
    expect(mediana(sem)).toBe(2);
    expect(mediana(com)).toBe(2);
    expect(media(com)!).toBeGreaterThan(media(sem)! * 3);
  });
});

describe('dispersão', () => {
  it('o desvio padrão divide por n, e não por n−1', () => {
    /*
      A base da vereda é toda a inscrição, e não uma amostra dela. Os dois
      números ficam perto o bastante para ninguém desconfiar: aqui são 2 e
      2,138. Trocar `DESVPADP` por `DESVPAD` não estoura nada — muda a segunda
      casa de toda conta da vereda.
    */
    const vs = ['2', '4', '4', '4', '5', '5', '7', '9'];
    expect(desvioPadrao(vs)).toBe(2);
  });

  it('a amplitude é a distância entre as pontas', () => {
    expect(amplitude(['3', '10', '7'])).toBe(7);
    expect(maximo(['3', '10', '7'])).toBe(10);
    expect(minimo(['3', '10', '7'])).toBe(3);
    expect(amplitude([])).toBeNull();
  });
});

describe('distribuição de frequências', () => {
  it('a ordem é a da variável, e não a da contagem', () => {
    /*
      Ordenar pela contagem apaga a forma, que é o que a distribuição serve
      para mostrar. E numa variável ordinal ela apaga a ordem: GG poderia cair
      ao lado de PP, e a única coisa que faz a camiseta ser ordinal sumiria da
      tabela.
    */
    const linhas = frequenciasDe(['G', 'PP', 'G', 'M', 'G'], ['PP', 'P', 'M', 'G', 'GG']);
    expect(linhas.map(l => l.rotulo)).toEqual(['PP', 'P', 'M', 'G', 'GG']);
    expect(linhas.map(l => l.absoluta)).toEqual([1, 0, 1, 3, 0]);
  });

  it('a categoria que ninguém escolheu aparece com zero', () => {
    /* Tabela em que a categoria vazia não aparece afirma que ela não existe —
       é o defeito que a pizza tinha ao pular a fatia de valor zero. */
    const linhas = frequenciasDe(['A'], ['A', 'B']);
    expect(linhas).toHaveLength(2);
    expect(linhas[1]).toMatchObject({ rotulo: 'B', absoluta: 0 });
  });

  it('sem ordem declarada, número vai por tamanho e texto por ordem de pt-BR', () => {
    /* `<` entre strings compara UTF-16: "10" viria antes de "9", e "Águia"
       depois de "Tucano". É a armadilha que `formulas.ts` já documenta na
       comparação de texto. */
    expect(frequenciasDe(['10', '9', '10']).map(l => l.rotulo)).toEqual(['9', '10']);
    expect(frequenciasDe(['Tucano', 'Águia']).map(l => l.rotulo)).toEqual(['Águia', 'Tucano']);
  });

  it('a acumulada soma as anteriores e fecha no total', () => {
    const linhas = frequenciasDe(['a', 'b', 'b', 'c']);
    expect(linhas.map(l => l.acumulada)).toEqual([1, 3, 4]);
    expect(linhas[linhas.length - 1].acumulada).toBe(4);
    expect(linhas.reduce((s, l) => s + l.relativa, 0)).toBeCloseTo(1, 10);
  });

  it('não conta o que veio em branco', () => {
    expect(frequenciasDe(['a', '', '  ', 'a'])).toEqual([
      { rotulo: 'a', absoluta: 2, relativa: 1, acumulada: 2 },
    ]);
  });
});

describe('as classes de uma variável contínua', () => {
  it('são fechadas embaixo e abertas em cima', () => {
    /*
      1,40 entra na classe que **começa** em 1,40. Fechar os dois lados faria o
      valor de fronteira ser contado duas vezes, e a soma das frequências
      passaria do total sem nada estourar.
    */
    const cs = classesDe(['1,30', '1,40', '1,49'], 0.1, 1.3);
    expect(cs.map(c => c.absoluta)).toEqual([1, 2]);
    expect(cs[0]).toMatchObject({ piso: 1.3, teto: 1.4 });
  });

  it('não perdem nem repetem ninguém', () => {
    const vs = ['1,05', '1,28', '1,50', '1,50', '1,79'];
    const cs = classesDe(vs, 0.1);
    expect(cs.reduce((s, c) => s + c.absoluta, 0)).toBe(5);
    expect(cs[cs.length - 1].absoluta).toBeGreaterThan(0);
  });

  it('o rótulo da última classe não carrega o erro de ponto flutuante', () => {
    /*
      Somar a largura classe a classe acumula erro: com 0,1 somado quarenta
      vezes, a última classe começaria em 1,7999999999 e o rótulo da tela
      mentiria sem nenhuma conta estar errada. A conta é `piso + largura × i`.
    */
    const cs = classesDe(['1,00', '1,85'], 0.1, 1);
    expect(cs[cs.length - 1].rotulo).toBe('1,8 a 1,9');
    expect(cs.every(c => c.rotulo.length < 12)).toBe(true);
  });

  it('recusam largura que não reparte nada', () => {
    expect(classesDe(['1', '2'], 0)).toEqual([]);
    expect(classesDe([], 0.1)).toEqual([]);
  });
});

describe('a cerca do valor atípico', () => {
  it('acha o que está longe demais das duas pontas', () => {
    const vs = ['1', '2', '3', '4', '5', '6', '7', '8', '40'];
    expect(atipicosDe(vs)).toEqual([40]);
  });

  it('não devolve cerca quando a metade do meio é um valor só', () => {
    /*
      Trinta e sete respostas iguais e onze diferentes dão intervalo
      interquartil zero: a cerca fecharia em [3, 3] e chamaria de atípico todo
      mundo que não pediu três diárias. Eles são a **minoria**, que é outra
      coisa — e a lista sairia com onze nomes plausíveis para o desbravador
      decidir o que fazer com gente que não tem nada de estranho.
    */
    const vs = [...new Array(37).fill('3'), ...new Array(8).fill('2'), '1', '1', '1'];
    expect(cercaDe(vs)).toBeNull();
    expect(atipicosDe(vs)).toEqual([]);
  });

  it('não devolve cerca sobre coluna curta demais', () => {
    expect(cercaDe(['1', '2', '3'])).toBeNull();
  });

  it('usa o quartil por interpolação linear, que é o do Excel', () => {
    /*
      Há pelo menos nove definições publicadas de quartil, e elas discordam na
      segunda casa — o bastante para um valor entrar ou sair da cerca sem nada
      avisar. Esta é a `QUARTIL.INC`: posição `(n−1)·p`, interpolando entre os
      dois vizinhos.
    */
    const cerca = cercaDe(['1', '2', '3', '4', '5'])!;
    expect(cerca.q1).toBe(2);
    expect(cerca.q3).toBe(4);
    expect(cerca.iqr).toBe(2);
    expect(cerca.piso).toBe(-1);
    expect(cerca.teto).toBe(7);
  });
});

describe('taxa', () => {
  it('é a parte sobre o todo', () => {
    expect(taxa(13, 16)).toBeCloseTo(0.8125, 10);
  });

  it('não existe quando não há todo', () => {
    /* Zero por cento afirmaria que ninguém de uma unidade sem membro nenhum se
       inscreveu — uma frase sobre gente que não existe. */
    expect(taxa(0, 0)).toBeNull();
  });
});

/* ── Sobre um formulário ──────────────────────────────────────────────────── */

const resposta = (id: string, grupo: string, valor: string): Resposta =>
  ({ id, em: `2026-06-0${id.slice(-1)}T10:00`, valores: { grupo, valor } });

const formulario: Formulario = {
  titulo: 'x',
  descricao: '',
  aceitandoRespostas: false,
  campos: [
    { id: 'grupo', rotulo: 'Grupo', tipo: 'texto-curto', obrigatorio: true, pessoal: false },
    { id: 'valor', rotulo: 'Valor', tipo: 'numero', obrigatorio: true, pessoal: false },
  ],
  respostas: [
    resposta('r1', 'A', '2'),
    resposta('r2', 'A', '4'),
    resposta('r3', 'B', '10'),
    resposta('r4', 'B', '20'),
    resposta('r5', 'B', '30'),
  ],
};

describe('sobre a base inteira', () => {
  it('a coluna sai na ordem das respostas', () => {
    expect(colunaDe(formulario, 'valor')).toEqual(['2', '4', '10', '20', '30']);
  });

  it('agrupa pelo valor de um campo', () => {
    expect(agrupadoPor(formulario, 'grupo')).toEqual(new Map([
      ['A', ['r1', 'r2']],
      ['B', ['r3', 'r4', 'r5']],
    ]));
  });

  it('a medida por grupo é a medida dentro de cada grupo, e não a do total', () => {
    /*
      É o requisito 5.4, e o erro que ele evita é o resumo que repete o total
      em toda linha — uma tabela plausível em que todas as unidades têm a média
      do clube.
    */
    expect(medidaPorGrupo(formulario, 'grupo', 'valor', 'MÉDIA')).toEqual(new Map([
      ['A', 3],
      ['B', 20],
    ]));
    expect(media(colunaDe(formulario, 'valor'))).toBe(13.2);
  });

  it('grupo sem número devolve nada, e não zero', () => {
    const semNumero = {
      ...formulario,
      respostas: [...formulario.respostas, resposta('r6', 'C', 'não sei')],
    };
    expect(medidaPorGrupo(semNumero, 'grupo', 'valor', 'MÉDIA').get('C')).toBeNull();
  });
});
