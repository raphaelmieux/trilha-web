import { describe, expect, it } from 'vitest';
import { MODULOS_DA_ANALISE } from './analiseDeDados';
import { QUESTOES_DA_ANALISE } from './questoesDaAnalise';
import type { TopicoDeVereda } from './veredas';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE,
  ELENCO, adesaoPorUnidade, baseDoAcampamento, porSemana,
} from '../labs/baseDoAcampamento';
import {
  amplitude, cercaDe, classesDe, colunaDe, desvioPadrao, frequenciasDe,
  media, mediana, medidaPorGrupo, moda, numerosDe, repeticoesDaModa,
} from '../labs/analiseDeDados';
import { CAMPO_UNIDADE, respostasReais } from '../labs/formulario';
import { mostrarNumero } from '../labs/formulas';

/*
  Os números que a teoria da CC-ES009 cita, conferidos contra a base.

  ── Por que esta trava existe ────────────────────────────────────────────
  É a mesma de `exemplosDePython.test.ts` e de `exemplosDePlanilha.test.ts`,
  pelo mesmo motivo escrito nas duas: escrever de cabeça o que uma conta
  devolve erra por pouco e com frequência, nada estoura, e quem confere a
  **própria** planilha contra uma lição errada conclui que a planilha dele é
  que está errada.

  E aqui a superfície é maior do que nas duas: esta vereda inteira fala de
  números de uma base concreta. A média da idade aparece na teoria do módulo
  2, na do 3 e em três questões; a taxa do Falcão aparece na teoria do 6 e em
  duas questões do 11. Mexer num inscrito muda todas, e nenhuma delas
  reclamaria.

  ── A divisão é a de `exemplosDePlanilha` ────────────────────────────────
  A **conta** se declara aqui, e a **afirmação** se lê da lição. Assim o
  número que o desbravador lê nunca é o número que o teste escreveu: ele sai
  de `baseDoAcampamento()` pelo mesmo motor que responde na planilha, e a
  lição só é aprovada se o citar.

  O que ela **não** faz é ler o texto procurando números soltos. Isso seria
  máquina frágil que um dia para de achar o que procura e aprova tudo calada
  — a armadilha do "zero link não é zero link quebrado" aplicada à própria
  trava. Por isso cada afirmação é declarada, e a guarda contra o vazio é
  dupla: a tabela tem piso, e toda entrada dela precisa ser encontrada.
*/

const BASE = baseDoAcampamento();
const TOTAL = respostasReais(BASE).length;

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_ANALISE.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** Tudo o que um tópico escreve, junto: explicação, exemplo e aviso. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

/** Tudo o que uma questão escreve: enunciado, alternativas e explicação. */
function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_ANALISE)) {
    const q = qs.find(x => x.id === id);
    if (!q) continue;
    const opcoes = (q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']);
    const pares = (q.data.pairs ?? []).flatMap(p => [p.left, p.right]);
    return [q.prompt, ...opcoes, ...pares, q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

/** Um número como a plataforma o mostra: duas casas, vírgula decimal. */
const num = (n: number | null) => mostrarNumero(n ?? Number.NaN);

/*
  Uma taxa como a tabela de adesão a mostra.

  `null` é a taxa de uma unidade sem membro nenhum, e ela não existe nesta
  base. Ele vira NaN de propósito: a asserção abaixo reprova a afirmação cujo
  número não é número, em vez de procurar a palavra "null" no texto da lição.
*/
const pct = (n: number | null) => `${mostrarNumero((n ?? Number.NaN) * 100)}%`;

/*
  Um número como a **prosa** o escreve, sem casa forçada.

  A cerca não aparece em célula nenhuma: ela é conceito da lição, calculada
  por `cercaDe` e escrita no texto. Onde o número é um resultado que o
  desbravador vai comparar com o que está na tela dele, a forma canônica é a
  da plataforma — `mostrarNumero`, com duas casas. Onde ele só se lê, é a da
  prosa, e cobrar "18,50" ali obrigaria a lição a escrever um zero que
  ninguém escreve.
*/
const numDaProsa = (n: number | null) => String(n ?? Number.NaN).replace('.', ',');

/** O maior de uma lista que pode trazer buracos. */
const maiorDe = (ns: (number | null)[]) => Math.max(...ns.map(n => n ?? Number.NaN));
const menorDe = (ns: (number | null)[]) => Math.min(...ns.map(n => n ?? Number.NaN));

const coluna = (campo: string) => colunaDe(BASE, campo);

interface Afirmacao {
  /** Onde ela está escrita: o id de um tópico ou o de uma questão. */
  onde: string;
  /** O que a lição precisa citar, calculado da base. */
  valor: () => string;
  /** O que é este número, para a mensagem de falha. */
  oQue: string;
}

/*
  As afirmações, uma por número que a lição escreve.

  Toda entrada aqui é uma conta sobre `baseDoAcampamento()`. Nenhuma repete
  um número literal: onde a lição diz "12,40", esta tabela diz
  `media(coluna(idade))`, e as duas só concordam enquanto a base for a que a
  lição descreve.
*/
const AFIRMACOES: Afirmacao[] = [
  /* ── Módulo 2: centro e dispersão ── */
  { onde: 'media-mediana-moda', oQue: 'a média da idade', valor: () => num(media(coluna(CAMPO_IDADE))) },
  { onde: 'media-mediana-moda', oQue: 'quantas vezes a moda da idade aparece', valor: () => String(repeticoesDaModa(coluna(CAMPO_IDADE))) },
  { onde: 'amplitude-e-desvio', oQue: 'o desvio padrão da idade', valor: () => num(desvioPadrao(coluna(CAMPO_IDADE))) },
  { onde: 'amplitude-e-desvio', oQue: 'a amplitude da altura', valor: () => num(amplitude(coluna(CAMPO_ALTURA))) },
  { onde: 'amplitude-e-desvio', oQue: 'a mediana da altura', valor: () => num(mediana(coluna(CAMPO_ALTURA))) },
  { onde: 'amplitude-e-desvio', oQue: 'o desvio padrão dos acampamentos', valor: () => num(desvioPadrao(coluna(CAMPO_ACAMPAMENTOS))) },
  { onde: 'amplitude-e-desvio', oQue: 'a amplitude dos acampamentos', valor: () => num(amplitude(coluna(CAMPO_ACAMPAMENTOS))) },
  { onde: 'a-moda-nao-avisa', oQue: 'a moda da altura', valor: () => num(moda(coluna(CAMPO_ALTURA))) },
  { onde: 'a-moda-nao-avisa', oQue: 'quantas vezes a moda da altura aparece', valor: () => String(repeticoesDaModa(coluna(CAMPO_ALTURA))) },

  /* ── Módulo 3: quando a média engana ── */
  { onde: 'a-media-e-a-ponta', oQue: 'a média dos acampamentos', valor: () => num(media(coluna(CAMPO_ACAMPAMENTOS))) },
  {
    onde: 'a-media-e-a-ponta',
    oQue: 'quantos fizeram dois acampamentos ou menos',
    valor: () => String(numerosDe(coluna(CAMPO_ACAMPAMENTOS)).filter(n => n <= 2).length),
  },
  {
    onde: 'a-razao-entre-as-duas',
    oQue: 'quantos chegam à média de idade',
    valor: () => String(numerosDe(coluna(CAMPO_IDADE)).filter(n => n >= media(coluna(CAMPO_IDADE))!).length),
  },
  {
    onde: 'a-razao-entre-as-duas',
    oQue: 'quantos chegam à média de acampamentos',
    valor: () => String(numerosDe(coluna(CAMPO_ACAMPAMENTOS)).filter(n => n >= media(coluna(CAMPO_ACAMPAMENTOS))!).length),
  },
  {
    onde: 'a-razao-entre-as-duas',
    oQue: 'a razão média ÷ mediana dos acampamentos',
    valor: () => num(media(coluna(CAMPO_ACAMPAMENTOS))! / mediana(coluna(CAMPO_ACAMPAMENTOS))!),
  },

  /* ── Módulo 4: distribuição de frequências ── */
  {
    onde: 'frequencia-absoluta-relativa-acumulada',
    oQue: 'a frequência da maior unidade',
    valor: () => String(frequenciasDe(coluna(CAMPO_UNIDADE))[0].absoluta),
  },
  {
    onde: 'frequencia-absoluta-relativa-acumulada',
    oQue: 'a frequência relativa da maior unidade',
    valor: () => pct(frequenciasDe(coluna(CAMPO_UNIDADE))[0].relativa),
  },
  {
    onde: 'frequencia-absoluta-relativa-acumulada',
    oQue: 'o total, que a última acumulada tem de bater',
    valor: () => String(TOTAL),
  },
  {
    onde: 'classe',
    oQue: 'a frequência da classe mais cheia da altura',
    valor: () => {
      const cs = classesDe(coluna(CAMPO_ALTURA), 0.1);
      return String(Math.max(...cs.map(c => c.absoluta)));
    },
  },

  /* ── Módulo 5: comparar grupos ── */
  {
    onde: 'comparar-grupos',
    oQue: 'a média de acampamentos da unidade mais experiente',
    valor: () => {
      const m = medidaPorGrupo(BASE, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
      return num(maiorDe([...m.values()]));
    },
  },
  {
    onde: 'o-resumo-e-uma-segunda-leitura',
    oQue: 'a mesma média, citada dos dois lados da conferência',
    valor: () => {
      const m = medidaPorGrupo(BASE, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
      return num(maiorDe([...m.values()]));
    },
  },

  /* ── Módulo 6: taxa e número absoluto ── */
  {
    onde: 'taxa-e-uma-divisao',
    oQue: 'a taxa de adesão da unidade que mobilizou melhor',
    valor: () => pct(maiorDe(adesaoPorUnidade(BASE).map(a => a.taxa))),
  },
  {
    onde: 'taxa-e-uma-divisao',
    oQue: 'quantos membros o clube tem ao todo',
    valor: () => String(ELENCO.reduce((s, u) => s + u.membros, 0)),
  },
  {
    onde: 'as-duas-ordenam-ao-contrario',
    oQue: 'a taxa da unidade com mais ausentes',
    valor: () => {
      const linhas = adesaoPorUnidade(BASE);
      const pior = linhas.reduce((a, b) => (b.fora > a.fora ? b : a));
      return pct(pior.taxa);
    },
  },

  /* ── Módulo 7: valores atípicos ── */
  {
    onde: 'o-que-e-um-valor-atipico',
    oQue: 'a cerca de cima da idade',
    valor: () => numDaProsa(cercaDe(coluna(CAMPO_IDADE))!.teto),
  },
  {
    onde: 'duas-naturezas-de-atipico',
    oQue: 'o maior número de acampamentos da base',
    valor: () => String(Math.max(...numerosDe(coluna(CAMPO_ACAMPAMENTOS)))),
  },

  /* ── Módulo 8: o gráfico que responde ── */
  {
    onde: 'tres-perguntas-tres-desenhos',
    oQue: 'as inscrições da primeira semana',
    valor: () => String(porSemana(BASE)[0].inscricoes),
  },
  {
    onde: 'tres-perguntas-tres-desenhos',
    oQue: 'as inscrições da última semana',
    valor: () => String(porSemana(BASE)[porSemana(BASE).length - 1].inscricoes),
  },

  /* ── As questões, que citam os mesmos números ── */
  { onde: 'ES9-M2-Q2', oQue: 'o desvio padrão dos acampamentos', valor: () => num(desvioPadrao(coluna(CAMPO_ACAMPAMENTOS))) },
  { onde: 'ES9-M2-Q2', oQue: 'a média dos acampamentos', valor: () => num(media(coluna(CAMPO_ACAMPAMENTOS))) },
  { onde: 'ES9-M2-Q3', oQue: 'a moda da altura', valor: () => num(moda(coluna(CAMPO_ALTURA))) },
  { onde: 'ES9-M3-Q3', oQue: 'quantos chegam à média de acampamentos', valor: () => String(numerosDe(coluna(CAMPO_ACAMPAMENTOS)).filter(n => n >= media(coluna(CAMPO_ACAMPAMENTOS))!).length) },
  { onde: 'ES9-M6-Q2', oQue: 'a melhor taxa de adesão', valor: () => pct(maiorDe(adesaoPorUnidade(BASE).map(a => a.taxa))) },
  {
    onde: 'ES9-M6-Q2',
    oQue: 'a pior taxa de adesão',
    valor: () => pct(menorDe(adesaoPorUnidade(BASE).map(a => a.taxa))),
  },
  { onde: 'ES9-M11-Q1', oQue: 'a melhor taxa de adesão', valor: () => pct(maiorDe(adesaoPorUnidade(BASE).map(a => a.taxa))) },
  { onde: 'ES9-M11-Q2', oQue: 'a média dos acampamentos', valor: () => num(media(coluna(CAMPO_ACAMPAMENTOS))) },
  { onde: 'ES9-M11-Q2', oQue: 'quantos fizeram dois acampamentos ou menos', valor: () => String(numerosDe(coluna(CAMPO_ACAMPAMENTOS)).filter(n => n <= 2).length) },
];

const ehQuestao = (onde: string) => onde.startsWith('ES9-');

const textoDe = (onde: string) => (ehQuestao(onde) ? textoDaQuestao(onde) : textoDoTopico(onde));

describe('os números da teoria saem da base', () => {
  /*
    A guarda contra o vazio, em dois lados. Uma tabela esvaziada deixaria a
    trava verde por não ter conferido nada, e uma entrada que apontasse para
    um tópico apagado estouraria em `textoDoTopico` em vez de passar calada.
  */
  it('a tabela de afirmações cobre a vereda inteira', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(25);
    const onde = new Set(AFIRMACOES.map(a => a.onde));
    expect(onde.size, 'as afirmações estão todas no mesmo lugar').toBeGreaterThanOrEqual(15);
  });

  it.each(AFIRMACOES.map(a => [`${a.onde} — ${a.oQue}`, a] as const))(
    '%s',
    (_nome, a) => {
      const esperado = a.valor();
      expect(esperado, `${a.onde}: ${a.oQue} não é um número`).not.toContain('NaN');
      expect(
        textoDe(a.onde),
        `${a.onde} não cita ${a.oQue}, que a base diz ser ${esperado}`,
      ).toContain(esperado);
    },
  );
});

/*
  E o contraste que a vereda inteira depende: a moda da idade descreve gente,
  a da altura não.

  Se as duas se repetissem parecido, o módulo 2 perderia o assunto e a lição
  seria sobre um número que sempre serve. É premissa da base, e não um
  detalhe de redação — por isso ela tem trava própria, como a foto de papel
  que pesa mais que a página digitada na CC-ES004.
*/
describe('a base sustenta o que a teoria afirma sobre ela', () => {
  it('a moda da idade descreve muita gente, e a da altura quase ninguém', () => {
    expect(repeticoesDaModa(coluna(CAMPO_IDADE))).toBeGreaterThanOrEqual(10);
    expect(repeticoesDaModa(coluna(CAMPO_ALTURA))).toBeLessThanOrEqual(2);
  });

  it('a média engana numa coluna só, e as outras duas concordam com a mediana', () => {
    const razao = (campo: string) => media(coluna(campo))! / mediana(coluna(campo))!;
    expect(razao(CAMPO_ACAMPAMENTOS)).toBeGreaterThan(1.25);
    expect(Math.abs(razao(CAMPO_IDADE) - 1)).toBeLessThan(0.1);
    expect(Math.abs(razao(CAMPO_ALTURA) - 1)).toBeLessThan(0.1);
  });

  it('a unidade com mais ausentes é a de melhor taxa, que é o requisito 4 inteiro', () => {
    const linhas = adesaoPorUnidade(BASE);
    const maisFora = linhas.reduce((a, b) => (b.fora > a.fora ? b : a));
    const melhor = linhas.reduce((a, b) => ((b.taxa ?? -1) > (a.taxa ?? -1) ? b : a));
    expect(maisFora.unidade).toBe(melhor.unidade);
    /* E ela é a única com aquele número de ausentes: empatada, "a que mais
       deixou de fora" deixaria de ser uma unidade e a lição não teria caso. */
    expect(linhas.filter(l => l.fora === maisFora.fora)).toHaveLength(1);
  });

  it('a maior unidade não é a mais experiente, que é a lição do módulo 5', () => {
    const medias = medidaPorGrupo(BASE, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
    const frequencias = frequenciasDe(coluna(CAMPO_UNIDADE));
    const maior = frequencias.reduce((a, b) => (b.absoluta > a.absoluta ? b : a)).rotulo;
    const experiente = [...medias.entries()]
      .reduce((a, b) => ((b[1] ?? -1) > (a[1] ?? -1) ? b : a))[0];
    expect(maior).not.toBe(experiente);
  });
});
