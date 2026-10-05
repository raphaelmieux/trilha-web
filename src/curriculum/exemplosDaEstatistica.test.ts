import { describe, expect, it } from 'vitest';
import { MODULOS_DA_ESTATISTICA } from './analiseEstatistica';
import { QUESTOES_DA_ESTATISTICA } from './questoesDaEstatistica';
import type { TopicoDeVereda } from './veredas';
import { CAMPO_ACAMPAMENTOS, baseDoAcampamento } from '../labs/baseDoAcampamento';
import { CAMPO_DIARIAS, respostasReais } from '../labs/formulario';
import {
  colunaDe, correlacaoDe, inclinacaoDe, intercepcaoDe, maximo, minimo,
  previsaoDe, rquadDe, sortearEntreGrupos,
} from '../labs/analiseDeDados';
import {
  CAMPO_DA_MEDIDA, CAMPO_DO_GRUPO, GRUPO_A, GRUPO_B,
} from '../labs/acasoEntreGrupos';
import { PAR_DO_MODULO_2, linhasAtipicasDoPar, semAtipicos } from '../labs/metasDaCcEs010';
import { mostrarNumero } from '../labs/formulas';

/*
  Os números que a teoria da CC-ES010 cita, conferidos contra a base.

  ── Por que esta trava existe ────────────────────────────────────────────
  É a de `exemplosDePython.test.ts`, de `exemplosDePlanilha.test.ts` e de
  `exemplosDaAnalise.test.ts` pela quarta vez, e pelo mesmo motivo escrito nas
  três: escrever de cabeça o que uma conta devolve erra por pouco e com
  frequência, nada estoura, e quem confere a **própria** planilha contra uma
  lição errada conclui que a planilha dele é que está errada.

  Aqui a superfície é a maior das quatro. O r de 0,91 aparece na teoria do
  módulo 2, na do 10 e em quatro questões; a inclinação de 8,4 centímetros por
  ano aparece na teoria do 4, na do 8 e na do 10; a previsão de 2,58 m aparece
  em três módulos. Mexer num inscrito muda todas, e nenhuma delas reclamaria.

  ── A divisão é a de `exemplosDePlanilha` ────────────────────────────────
  A **conta** se declara aqui, e a **afirmação** se lê da lição. Assim o
  número que o desbravador lê nunca é o número que o teste escreveu: ele sai
  de `baseDoAcampamento()` pelo mesmo motor que responde na planilha, e a
  lição só é aprovada se o citar.

  O que ela **não** faz é ler o texto procurando números soltos. Isso seria
  máquina frágil que um dia para de achar o que procura e aprova tudo calada.
  Por isso cada afirmação é declarada, e a guarda contra o vazio é dupla: a
  tabela tem piso, e toda entrada dela precisa ser encontrada.
*/

const BASE = baseDoAcampamento();
const TOTAL = respostasReais(BASE).length;

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_ESTATISTICA.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** Tudo o que um tópico escreve, junto: explicação, exemplo e aviso. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

/** Tudo o que uma questão escreve: enunciado, alternativas e explicação. */
function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_ESTATISTICA)) {
    const q = qs.find(x => x.id === id);
    if (!q) continue;
    const opcoes = (q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']);
    return [q.prompt, ...opcoes, q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

/** Um número como a plataforma o mostra: duas casas, vírgula decimal. */
const num = (n: number | null) => mostrarNumero(n ?? Number.NaN);

/*
  Um número como a **prosa** o escreve, sem casa forçada.

  A menor altura da base é 1,05, e `mostrarNumero` a devolveria assim mesmo —
  mas `minimo` devolve o valor cru, com ponto. Onde o número só se lê no
  texto, a forma é a do texto.
*/
const numDaProsa = (n: number | string | null) => String(n ?? Number.NaN).replace('.', ',');

/*
  A inclinação em **centímetros por ano**, com uma casa — que é como a prosa a
  escreve.

  A célula mostra 0,08 metro por ano, e nenhuma lição diz isso: ninguém fala
  de crescer oito centésimos de metro. Duas casas dariam 8,39, que também não
  é como se fala. É a decisão da cerca de Tukey na CC-ES009: onde o número só
  se lê na prosa, a forma é a da prosa — e a precisão escolhida pela lição faz
  parte da afirmação que esta trava confere.
*/
const cm = (metros: number | null) =>
  ((metros ?? Number.NaN) * 100).toFixed(1).replace('.', ',');

const coluna = (campo: string) => colunaDe(BASE, campo);

const par = PAR_DO_MODULO_2;
const alturas = () => coluna(par.y);
const idades = () => coluna(par.x);

interface Afirmacao {
  /** Onde ela está escrita: o id de um tópico ou o de uma questão. */
  onde: string;
  /** O que a lição precisa citar, calculado da base. */
  valor: () => string;
  /** O que é este número, para a mensagem de falha. */
  oQue: string;
  /**
   * Quantas vezes, no mínimo, aquele lugar escreve este número.
   *
   * Sem ela a trava confere que o número aparece **em algum lugar** do
   * tópico, e um tópico que o escreve duas vezes — na explicação e no exemplo
   * — sobrevive a um erro de digitação em uma das duas. A mutação mostrou
   * isso: trocar "r = 0,91" por "0,89" na explicação não derrubava nada,
   * porque o desenho do exemplo continuava com o certo.
   *
   * É um **piso**, e não uma contagem exata: acrescentar uma menção a mais é
   * legítimo e não reprova, e apagar uma reprova — que é a falha certa.
   */
  vezes?: number;
}

const quantasVezes = (texto: string, agulha: string) =>
  texto.split(agulha).length - 1;

/*
  As afirmações, uma por número que a lição escreve.

  Toda entrada aqui é uma conta sobre `baseDoAcampamento()`. Nenhuma repete um
  número literal: onde a lição diz "0,91", esta tabela diz
  `correlacaoDe(idades, alturas)`, e as duas só concordam enquanto a base for
  a que a lição descreve.
*/
const AFIRMACOES: Afirmacao[] = [
  /* ── Módulo 1: de quem a base fala ── */
  {
    onde: 'populacao-e-amostra', oQue: 'a média dos acampamentos', vezes: 5,
    valor: () => num(mediaDe(CAMPO_ACAMPAMENTOS)),
  },

  /* ── Módulo 2: a correlação ── */
  {
    onde: 'o-coeficiente', oQue: 'o r de idade e altura', vezes: 5,
    valor: () => num(correlacaoDe(idades(), alturas())),
  },
  {
    onde: 'o-coeficiente', oQue: 'o r de idade e acampamentos',
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'o-coeficiente', oQue: 'o r de altura e acampamentos',
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'a-dispersao', oQue: 'a menor altura da base',
    valor: () => numDaProsa(minimo(alturas())),
  },
  {
    onde: 'ES10-M2-Q3', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(idades(), alturas())),
  },
  {
    onde: 'ES10-M2-Q6', oQue: 'o r de idade e acampamentos',
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'ES10-M2-Q6', oQue: 'o r de altura e acampamentos',
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },

  /* ── Módulo 3: correlação não é causa ── */
  {
    onde: 'a-espuria-desta-base', oQue: 'o r do par espúrio', vezes: 2,
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'a-espuria-desta-base', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(idades(), alturas())),
  },
  {
    onde: 'tres-explicacoes', oQue: 'o r do par espúrio', vezes: 2,
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'como-se-testa', oQue: 'o r do par espúrio',
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'ES10-M3-Q2', oQue: 'o r do par espúrio', vezes: 2,
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },

  /* ── Módulo 4: a reta ── */
  {
    onde: 'a-equacao-e-a-ordem', oQue: 'a inclinação da reta', vezes: 3,
    valor: () => num(inclinacaoDe(alturas(), idades())),
  },
  {
    onde: 'a-equacao-e-a-ordem', oQue: 'a intercepção da reta', vezes: 4,
    valor: () => num(intercepcaoDe(alturas(), idades())),
  },
  {
    onde: 'a-equacao-e-a-ordem', oQue: 'a inclinação com as faixas trocadas',
    valor: () => num(inclinacaoDe(idades(), alturas())),
  },
  {
    onde: 'ES10-M4-Q4', oQue: 'a intercepção da reta',
    valor: () => num(intercepcaoDe(alturas(), idades())),
  },

  /* ── Módulo 5: prever e extrapolar ── */
  {
    onde: 'prever-com-a-equacao', oQue: 'a previsão para a menor idade da base',
    valor: () => num(previsaoDe(Number(minimo(idades())), alturas(), idades())),
  },
  {
    onde: 'prever-com-a-equacao', oQue: 'a previsão para a maior idade da base',
    valor: () => num(previsaoDe(Number(maximo(idades())), alturas(), idades())),
  },
  {
    onde: 'extrapolar', oQue: 'a previsão para vinte e cinco anos', vezes: 3,
    valor: () => num(previsaoDe(25, alturas(), idades())),
  },
  {
    onde: 'extrapolar', oQue: 'a previsão para dezesseis anos', vezes: 2,
    valor: () => num(previsaoDe(16, alturas(), idades())),
  },
  {
    onde: 'ES10-M5-Q1', oQue: 'a previsão para vinte e cinco anos', vezes: 2,
    valor: () => num(previsaoDe(25, alturas(), idades())),
  },
  {
    onde: 'ES10-M5-Q2', oQue: 'a previsão para dezesseis anos',
    valor: () => num(previsaoDe(16, alturas(), idades())),
  },

  /* ── Módulo 6: a qualidade do ajuste ── */
  {
    onde: 'o-r-quadrado', oQue: 'o r² de idade e altura', vezes: 2,
    valor: () => num(rquadDe(alturas(), idades())),
  },
  {
    onde: 'o-r-quadrado', oQue: 'o r² de idade e acampamentos',
    valor: () => num(rquadDe(coluna(CAMPO_ACAMPAMENTOS), idades())),
  },
  {
    onde: 'o-r-quadrado', oQue: 'o r² do par espúrio', vezes: 2,
    valor: () => num(rquadDe(coluna(CAMPO_ACAMPAMENTOS), alturas())),
  },
  {
    onde: 'ES10-M6-Q4', oQue: 'o r² de idade e altura',
    valor: () => num(rquadDe(alturas(), idades())),
  },
  {
    onde: 'ES10-M6-Q5', oQue: 'o r² do par espúrio', vezes: 2,
    valor: () => num(rquadDe(coluna(CAMPO_ACAMPAMENTOS), alturas())),
  },

  /* ── Módulo 7: dado próprio ── */
  {
    onde: 'escolher-o-que-olhar', oQue: 'o r de idade e diárias', vezes: 3,
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_DIARIAS))),
  },
  {
    onde: 'as-tres-perguntas', oQue: 'o r de idade e diárias', vezes: 2,
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_DIARIAS))),
  },
  {
    onde: 'ES10-M7-Q1', oQue: 'o r de idade e diárias', vezes: 4,
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_DIARIAS))),
  },

  /* ── Módulo 8: sem os atípicos ── */
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o valor atípico da altura',
    valor: () => numDaProsa(minimo(alturas())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'a inclinação com todos, em centímetros', vezes: 2,
    valor: () => cm(inclinacaoDe(alturas(), idades())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'a inclinação sem o atípico, em centímetros', vezes: 2,
    valor: () => cm(inclinacaoDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o r² com todos', vezes: 2,
    valor: () => num(rquadDe(alturas(), idades())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o r² sem o atípico', vezes: 3,
    valor: () => num(rquadDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'ES10-M8-Q4', oQue: 'o r² sem o atípico',
    valor: () => num(rquadDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'ES10-M8-Q5', oQue: 'a inclinação sem o atípico, em centímetros',
    valor: () => cm(inclinacaoDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },

  /* ── Módulo 9: o acaso ── */
  {
    onde: 'o-embaralho', oQue: 'a diferença real entre as duas unidades', vezes: 3,
    valor: () => num(diferencaDosGrupos()),
  },
  {
    onde: 'ES10-M9-Q3', oQue: 'a diferença real entre as duas unidades',
    valor: () => num(diferencaDosGrupos()),
  },

  /* ── Módulo 10: o grau de confiança ── */
  {
    onde: 'a-analise-completa', oQue: 'o r de idade e altura', vezes: 2,
    valor: () => num(correlacaoDe(idades(), alturas())),
  },
  {
    onde: 'a-analise-completa', oQue: 'o r² com todos', vezes: 3,
    valor: () => num(rquadDe(alturas(), idades())),
  },
  {
    onde: 'a-analise-completa', oQue: 'o r² sem o atípico', vezes: 2,
    valor: () => num(rquadDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'a-analise-completa', oQue: 'a previsão para vinte e cinco anos',
    valor: () => num(previsaoDe(25, alturas(), idades())),
  },
  {
    onde: 'ES10-M10-Q2', oQue: 'o r² sem o atípico',
    valor: () => num(rquadDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'ES10-M10-Q3', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(idades(), alturas())),
  },
];

function mediaDe(campo: string): number | null {
  const ns = coluna(campo).map(v => Number(String(v).replace(',', '.'))).filter(Number.isFinite);
  return ns.length === 0 ? null : ns.reduce((a, b) => a + b, 0) / ns.length;
}

function diferencaDosGrupos(): number {
  return sortearEntreGrupos(
    BASE, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, GRUPO_A, GRUPO_B, 0,
  ).real;
}

const ehQuestao = (onde: string) => onde.startsWith('ES10-');

const textoDe = (onde: string) => (ehQuestao(onde) ? textoDaQuestao(onde) : textoDoTopico(onde));

describe('os números da teoria saem da base', () => {
  /*
    A guarda contra o vazio, em dois lados. Uma tabela esvaziada deixaria a
    trava verde por não ter conferido nada, e uma entrada que apontasse para
    um tópico apagado estouraria em `textoDoTopico` em vez de passar calada.
  */
  it('a tabela de afirmações cobre a vereda inteira', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(35);
    const onde = new Set(AFIRMACOES.map(a => a.onde));
    expect(onde.size, 'as afirmações estão todas no mesmo lugar').toBeGreaterThanOrEqual(20);
  });

  it.each(AFIRMACOES.map(a => [`${a.onde} — ${a.oQue}`, a] as const))(
    '%s',
    (_nome, a) => {
      const esperado = a.valor();
      expect(esperado, `${a.onde}: ${a.oQue} não é um número`).not.toContain('NaN');
      const texto = textoDe(a.onde);
      expect(
        texto,
        `${a.onde} não cita ${a.oQue}, que a base diz ser ${esperado}`,
      ).toContain(esperado);
      const minimo = a.vezes ?? 1;
      expect(
        quantasVezes(texto, esperado),
        `${a.onde} escrevia ${a.oQue} (${esperado}) ${minimo} vezes e agora escreve menos`,
      ).toBeGreaterThanOrEqual(minimo);
    },
  );
});

/*
  E as premissas que a vereda inteira depende.

  Cada uma é uma propriedade da base sem a qual uma lição passa a ensinar
  sobre um caso que não existe — e nenhuma delas reclamaria sozinha, porque
  todas as contas continuariam certas. É a decisão da foto de papel que pesa
  mais que a página digitada na CC-ES004.
*/
describe('a base sustenta o que a teoria afirma sobre ela', () => {
  it('o par do módulo 2 é forte, e o espúrio é moderado', () => {
    /* Se o espúrio fosse fraco, ninguém o levaria a sério e o módulo 3 não
       teria caso: a lição existe porque o número é grande o bastante para
       alguém concluir dele. */
    expect(Math.abs(correlacaoDe(idades(), alturas())!)).toBeGreaterThan(0.7);
    const espurio = Math.abs(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))!);
    expect(espurio).toBeGreaterThan(0.4);
    expect(espurio).toBeLessThan(0.7);
  });

  it('a idade tem correlação mais forte com as duas do que elas entre si', () => {
    /* É o que torna a terceira coluna a explicação plausível. Se a idade
       tivesse correlação fraca com uma das duas, a lição estaria apontando
       uma variável escondida que não explica nada. */
    const espurio = Math.abs(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))!);
    expect(Math.abs(correlacaoDe(idades(), alturas())!)).toBeGreaterThan(espurio);
    expect(Math.abs(correlacaoDe(idades(), coluna(CAMPO_ACAMPAMENTOS))!)).toBeGreaterThan(espurio);
  });

  it('a extrapolação distante é absurda, e a próxima é plausível', () => {
    /* As duas metades do requisito 5.4: o absurdo tem de ser absurdo, e o
       perigoso tem de passar por bom. Com a reta mais plana, 2,58 m viraria
       um número possível e a lição perderia o exemplo que se vê. */
    expect(previsaoDe(25, alturas(), idades())!).toBeGreaterThan(2.3);
    const logoAcima = previsaoDe(Number(maximo(idades())) + 1, alturas(), idades())!;
    expect(logoAcima).toBeGreaterThan(Number(maximo(alturas())));
    expect(logoAcima).toBeLessThan(2);
  });

  it('há exatamente um valor atípico no par, e tirá-lo mexe pouco na reta', () => {
    /* A lição do módulo 8 afirma as duas coisas: que a conclusão quase não
       muda e que o ajuste salta. Numa base em que a exclusão virasse a reta,
       a lição diria o contrário do que os números mostram. */
    expect(linhasAtipicasDoPar(BASE, par)).toHaveLength(1);
    const sem = semAtipicos(BASE, par);
    const comTodos = inclinacaoDe(alturas(), idades())!;
    const semEle = inclinacaoDe(sem.ys, sem.xs)!;
    expect(Math.abs(semEle - comTodos) / comTodos).toBeLessThan(0.1);
    expect(rquadDe(sem.ys, sem.xs)! - rquadDe(alturas(), idades())!).toBeGreaterThan(0.05);
  });

  it('as colunas de medida são quatro, e o par do módulo 7 não é nenhum dos três', () => {
    /* O módulo 7 pede um par que as lições não usaram. Com três colunas só,
       todos os pares já teriam sido apontados e "escolher" não teria o que
       escolher. */
    const r = correlacaoDe(idades(), coluna(CAMPO_DIARIAS));
    expect(r).not.toBeNull();
    expect(Math.abs(r!)).toBeGreaterThan(0.2);
    expect(Math.abs(r!)).toBeLessThan(0.5);
  });

  it('a base tem as quarenta e oito respostas de que a teoria fala', () => {
    expect(TOTAL).toBe(48);
  });
});
