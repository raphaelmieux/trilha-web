import { describe, expect, it } from 'vitest';
import {
  agrupadoPor, amplitude, atipicosDe, cercaDe, classesDe, colunaDe, desvioPadrao,
  frequenciasDe, maximo, media, medidaDa, medidaPorGrupo, mediana, minimo, moda,
  correlacaoDe, inclinacaoDe, intercepcaoDe, numerosDe, previsaoDe,
  repeticoesDaModa, rquadDe, sortearEntreGrupos, taxa,
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

  it('e quando existe, quantas vezes ela se repete é outra pergunta', () => {
    /*
      A planilha responde a moda e não responde isto — e sem isto a moda de
      uma coluna de medidas sai como um número perfeitamente plausível que
      descreve duas pessoas. `MODO` não tem como avisar; quem pergunta é quem
      descobre.
    */
    expect(repeticoesDaModa(['1', '2', '2', '3'])).toBe(2);
    expect(repeticoesDaModa(['5', '5', '5', '5', '1'])).toBe(4);
    expect(repeticoesDaModa([])).toBe(0);
    /* Coluna sem número nenhum não tem moda, e não tem repetição zero por
       acaso: não há o que contar. */
    expect(repeticoesDaModa(['a', 'b'])).toBe(0);
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

/*
  ── A correlação vem do mesmo motor ────────────────────────────────────────

  O número que a trava espera e o que a fórmula do desbravador devolve são a
  mesma `CORREL`. Dois avaliadores na mesma base seriam os dois "Word" outra
  vez, com a divergência aparecendo como número plausível — a pior forma de
  aparecer.
*/
describe('a correlação entre duas colunas', () => {
  it('é 1 numa reta perfeita e −1 na reta que desce', () => {
    expect(correlacaoDe(['1', '2', '3', '4'], ['3', '5', '7', '9'])).toBe(1);
    expect(correlacaoDe(['1', '2', '3', '4'], ['9', '7', '5', '3'])).toBe(-1);
  });

  /*
    Simétrica: a correlação não tem lado. É o que a separa da inclinação, e é
    por isso que trocar as duas faixas nela não muda nada.

    Disto segue que trocar a ordem dentro de `correlacaoDe` é uma mutação
    **equivalente**: ela não muda resposta nenhuma, e nenhuma trava pode pegá-la.
    O teste diz isso em vez de caçá-la, como o `melhorTaxa` da CC-ES009 — e o
    que se fixa aqui é a simetria, que é a propriedade de verdade. Quem um dia
    quiser "consertar" aquela ordem lê esta asserção e descobre que não há o
    que consertar.
  */
  it('não muda quando as duas colunas trocam de lugar', () => {
    const a = ['13', '12', '14', '11'];
    const b = ['1,58', '1,51', '1,62', '1,44'];
    expect(correlacaoDe(b, a)).toBe(correlacaoDe(a, b));
  });

  /*
    E ela herda do motor o que o motor ignora, que é o que separa este caminho
    de um `Number(v)` escrito à mão: número com ponto é texto em planilha
    pt-BR, e o par cai **inteiro** quando um dos lados não é número.
  */
  it('descarta o par inteiro quando um lado não é número para a planilha', () => {
    /* `1.5` com ponto é texto aqui, então o par (2; 1.5) cai e sobram três
       pontos — que continuam na reta. */
    expect(correlacaoDe(['1', '2', '3', '4'], ['3', '1.5', '7', '9'])).toBe(1);
  });

  it('recusa em vez de devolver zero quando não dá para perguntar', () => {
    /* Coluna que não varia: `#DIV/0!` no motor, `null` aqui. Zero diria "não
       há relação", que é uma afirmação sobre os dados. */
    expect(correlacaoDe(['1', '2', '3'], ['5', '5', '5'])).toBeNull();
    /* Tamanhos diferentes: `#N/D`. Cortar no menor responderia sobre parte dos
       pares sem dizer que parte. */
    expect(correlacaoDe(['1', '2', '3'], ['3', '5'])).toBeNull();
    expect(correlacaoDe([], [])).toBeNull();
  });
});

/*
  ── A reta, e a ordem dos argumentos ──────────────────────────────────────

  `CORREL` é simétrica; `INCLINAÇÃO` e `INTERCEPÇÃO` não são. É a armadilha que
  o motor guarda de propósito, e um ajudante que a "arrumasse" por dentro seria
  o lugar perfeito para ela se perder.
*/
describe('a reta de y sobre x', () => {
  /* y = 2x + 1, exata. */
  const xs = ['1', '2', '3', '4'];
  const ys = ['3', '5', '7', '9'];

  it('devolve a inclinação e a intercepção da reta', () => {
    expect(inclinacaoDe(ys, xs)).toBe(2);
    expect(intercepcaoDe(ys, xs)).toBe(1);
  });

  /*
    E trocar a ordem devolve **outra reta**, não a mesma. É o que separa estas
    duas da correlação, e é por isso que os parâmetros se chamam `ys` e `xs`:
    quem chama não tem de lembrar a ordem, ela está escrita.
  */
  it('trocar a ordem devolve a reta ao contrário, e as duas são plausíveis', () => {
    /* x sobre y: 1/2 e −0,5 — nenhuma das duas parece errada. */
    expect(inclinacaoDe(xs, ys)).toBe(0.5);
    expect(inclinacaoDe(xs, ys)).not.toBe(inclinacaoDe(ys, xs));
    expect(intercepcaoDe(xs, ys)).toBe(-0.5);
  });

  it('x que não varia não tem reta, e isso é null e não zero', () => {
    /* Zero afirmaria uma reta horizontal, que é uma resposta sobre os dados;
       a recusa diz que não dá para ajustar reta nenhuma. */
    expect(inclinacaoDe(['1', '2', '3'], ['5', '5', '5'])).toBeNull();
    /* Mas y constante **tem** reta, e ela é horizontal: a guarda é do x. */
    expect(inclinacaoDe(['5', '5', '5'], ['1', '2', '3'])).toBe(0);
  });
});

/*
  ── A qualidade do ajuste, e a previsão que responde a qualquer x ─────────
*/
describe('o ajuste e a previsão', () => {
  const xs = ['1', '2', '3', '4'];
  const ys = ['3', '5', '7', '9'];

  it('o r² é o quadrado do r, e não uma conta à parte', () => {
    /* Duas implementações da mesma coisa divergiriam no primeiro ajuste, e a
       divergência sairia como dois números plausíveis para a mesma qualidade
       de ajuste. */
    const tortos = ['2', '3', '7', '8'];
    const r = correlacaoDe(tortos, xs)!;
    expect(rquadDe(tortos, xs)).toBeCloseTo(r * r, 12);
    expect(rquadDe(ys, xs)).toBe(1);
  });

  it('prevê dentro do intervalo observado', () => {
    /* y = 2x + 1 em x = 2,5. */
    expect(previsaoDe(2.5, ys, xs)).toBe(6);
  });

  /*
    ── O requisito 5.4 inteiro ────────────────────────────────────────────

    Ela responde para **qualquer** x, inclusive muito fora do observado, e
    responde com a mesma cara de certeza. Uma guarda que recusasse o x de fora
    seria a plataforma protegendo de um erro que a planilha do clube não
    protege — e apagaria a lição, que é justamente ver o número absurdo sair
    sem aviso nenhum.
  */
  it('responde igual para um x muito fora do observado', () => {
    /* O observado vai de 1 a 4. Em 100 ela responde 201, sem reclamar. */
    expect(previsaoDe(100, ys, xs)).toBe(201);
    expect(previsaoDe(-50, ys, xs)).toBe(-99);
  });

  it('não tem reta para prever quando o x não varia', () => {
    expect(previsaoDe(2, ['1', '2', '3'], ['5', '5', '5'])).toBeNull();
    expect(previsaoDe(2, [], [])).toBeNull();
  });
});

/*
  ── O acaso entre dois grupos ──────────────────────────────────────────────

  É o requisito 8 da CC-ES010, e ele pede isso **sem cálculo formal**: não há
  teste de hipótese, há sortear de novo quem é de qual unidade e olhar uma
  diferença tão grande quanto a real aparecer sem que um único dado tenha
  mudado.
*/
describe('o embaralhamento dos grupos', () => {
  /*
    Um sorteio determinado **e que varia**: um gerador congruente de três
    linhas. `() => 0` seria determinado e produziria a mesma permutação trinta
    vezes, o que deixaria toda asserção abaixo falar de um sorteio só.
  */
  const sorteioDe = (semente: number) => {
    let x = semente;
    return () => {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x / 2147483648;
    };
  };

  /*
    As diferenças que **cabem** nos tamanhos de grupo deste formulário: A com
    dois e B com três, sobre os cinco valores. São dez repartições, e esta
    lista sai enumerada em vez de escrita à mão para continuar valendo se o
    formulário de teste mudar.
  */
  const possiveis = (): number[] => {
    const vs = [2, 4, 10, 20, 30];
    const fora: number[] = [];
    for (let i = 0; i < vs.length; i++) {
      for (let j = i + 1; j < vs.length; j++) {
        const a = (vs[i] + vs[j]) / 2;
        const resto = vs.filter((_, k) => k !== i && k !== j);
        const b = resto.reduce((t, v) => t + v, 0) / resto.length;
        fora.push(Math.abs(a - b));
      }
    }
    return fora;
  };

  it('mede a diferença de verdade a partir dos rótulos como eles estão', () => {
    /* A = (2+4)/2 = 3; B = (10+20+30)/3 = 20. */
    const s = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 0, sorteioDe(1));
    expect(s.real).toBe(17);
    expect(s.sorteadas).toEqual([]);
    expect(s.tantoOuMais).toBe(0);
  });

  /*
    ── A asserção que pega o defeito ────────────────────────────────────────

    Sortear rótulos **novos** — um nome ao acaso por linha — mudaria o tamanho
    dos grupos junto, e a diferença passaria a variar por dois motivos ao mesmo
    tempo: numa base de sete contra oito, a conta deixaria de responder "e se
    fossem outras sete pessoas?" e passaria a responder "e se fossem outras
    sete pessoas, ou cinco, ou onze?".

    Com a permuta, A continua com dois e B com três em todo sorteio, e por isso
    **toda** diferença sorteada tem de ser uma das dez que esses tamanhos
    permitem. Tamanho trocado produz valores fora da lista.
  */
  it('permuta os rótulos, mantendo o tamanho de cada grupo', () => {
    const s = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 60, sorteioDe(7));
    expect(s.sorteadas).toHaveLength(60);
    const cabem = possiveis();
    for (const d of s.sorteadas) {
      expect(cabem.some(c => Math.abs(c - d) < 1e-9), `${d} não cabe nos tamanhos dos grupos`).toBe(true);
    }
    /* E ele de fato varia: sessenta sorteios de uma permuta que não permutasse
       dariam um valor só, e a asserção de cima passaria. */
    expect(new Set(s.sorteadas.map(d => d.toFixed(6))).size).toBeGreaterThan(1);
  });

  /*
    Em módulo, porque "tão grande quanto" é sobre tamanho. Um sorteio que põe
    B na frente por dezessete é tão surpreendente quanto um que põe A, e contar
    só os do mesmo sinal responderia metade da pergunta — dando a metade que
    faz o acaso parecer mais raro do que é.
  */
  it('conta a diferença em módulo, e não só as do mesmo sinal', () => {
    const aB = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 40, sorteioDe(3));
    const bA = sortearEntreGrupos(formulario, 'grupo', 'valor', 'B', 'A', 40, sorteioDe(3));
    expect(bA.real).toBe(aB.real);
    expect(bA.tantoOuMais).toBe(aB.tantoOuMais);
    expect(bA.sorteadas).toEqual(aB.sorteadas);
  });

  it('o sorteio entra por parâmetro, para a trava não depender de sorte', () => {
    /* Mesma semente, mesmas diferenças. Com `Math.random` escrito dentro da
       função isto seria impossível de afirmar, e a trava da base de verdade
       falharia sozinha uma vez em sete. */
    const um = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 20, sorteioDe(99));
    const dois = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 20, sorteioDe(99));
    expect(dois.sorteadas).toEqual(um.sorteadas);
  });

  it('a real conta como "tão grande quanto", apesar do ponto flutuante', () => {
    /*
      As duas médias passam pelo motor de fórmula e voltam em ponto flutuante:
      o sorteio que recai exatamente na repartição de verdade sai
      2,5892857142857135 contra 2,589285714285714, e um `>=` cru o deixaria de
      fora sem nada explicando — fazendo o acaso parecer mais raro do que é,
      de um em cada tantos.
    */
    const s = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'B', 200, sorteioDe(5));
    const naReal = s.sorteadas.filter(d => Math.abs(d - s.real) < 1e-9).length;
    expect(naReal).toBeGreaterThan(0);
    expect(s.tantoOuMais).toBeGreaterThanOrEqual(naReal);
  });

  it('grupo que o sorteio deixou vazio não vira diferença enorme', () => {
    /* `C` não existe no formulário: a média de nada é erro, e um sorteio que
       não achou ninguém num dos lados não diz nada sobre tamanho de diferença.
       Devolver `NaN` ou a média do outro lado poria um número plausível na
       nuvem que a tela desenha. */
    const s = sortearEntreGrupos(formulario, 'grupo', 'valor', 'A', 'C', 5, sorteioDe(2));
    expect(s.real).toBe(0);
    for (const d of s.sorteadas) expect(d).toBe(0);
  });
});
