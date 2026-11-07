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
import type { Formulario } from '../labs/formulario';
import { GRUPOS_DA_TEORIA, IDADES_DA_TEORIA, baseDoCampori } from '../exemplos/camporiDePrimavera';

/*
  Os números que a teoria e as questões da CC-ES010 citam, conferidos contra a
  base de onde cada um sai.

  As **questões** falam da inscrição do acampamento de inverno, que é a base
  do laboratório, e são conferidas contra ela. A **teoria** fala da inscrição
  do Campori de Primavera (`src/exemplos/camporiDePrimavera.ts`), que é a que
  as telas fotografam: os números do acampamento são as respostas das lições,
  e a teoria que os citasse entregaria o gabarito.

  ── Por que esta trava existe ────────────────────────────────────────────
  É a de `exemplosDePython.test.ts`, de `exemplosDePlanilha.test.ts` e de
  `exemplosDaAnalise.test.ts` pela quarta vez, e pelo mesmo motivo escrito nas
  três: escrever de cabeça o que uma conta devolve erra por pouco e com
  frequência, nada estoura, e quem confere a **própria** planilha contra uma
  lição errada conclui que a planilha dele é que está errada.

  Aqui a superfície é a maior das quatro. O r de idade e altura aparece na
  teoria de quatro módulos e em várias questões; a inclinação, a previsão fora
  do intervalo e o r² antes e depois da exclusão aparecem em três módulos cada.
  Mexer num inscrito muda todas, e nenhuma delas reclamaria.

  ── A divisão é a de `exemplosDePlanilha` ────────────────────────────────
  A **conta** se declara aqui, e a **afirmação** se lê da lição. Assim o
  número que o desbravador lê nunca é o número que o teste escreveu: ele sai
  da base pelo mesmo motor que responde na planilha, e a lição só é aprovada
  se o citar.

  O que ela **não** faz é ler o texto procurando números soltos. Isso seria
  máquina frágil que um dia para de achar o que procura e aprova tudo calada.
  Por isso cada afirmação é declarada, e a guarda contra o vazio é dupla: a
  tabela tem piso, e toda entrada dela precisa ser encontrada.
*/

const BASE = baseDoAcampamento();
const TOTAL = respostasReais(BASE).length;
const CAMPORI = baseDoCampori();
const TOTAL_DO_CAMPORI = respostasReais(CAMPORI).length;

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_ESTATISTICA.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** Tudo o que um tópico escreve, junto: explicação, aviso e as telas. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [
    t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '',
    ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao]),
  ].join('\n');
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

  A menor altura da base, e `mostrarNumero` a devolveria assim mesmo — mas
  `minimo` devolve o valor cru, com ponto. Onde o número só se lê no texto, a
  forma é a do texto.
*/
const numDaProsa = (n: number | string | null) => String(n ?? Number.NaN).replace('.', ',');

/*
  A inclinação em **centímetros por ano**, com uma casa — que é como a prosa a
  escreve.

  A célula mostra metros por ano com duas casas, e nenhuma lição fala assim:
  ninguém diz que cresceu sete centésimos de metro. É a decisão da cerca de
  Tukey na CC-ES009: onde o número só se lê na prosa, a forma é a da prosa — e
  a precisão escolhida pela lição faz parte da afirmação que esta trava
  confere.
*/
const cm = (metros: number | null) =>
  ((metros ?? Number.NaN) * 100).toFixed(1).replace('.', ',');

/*
  Os números que a teoria escreve por extenso. Uma tabela pequena, e não um
  conversor: um conversor errado aprovaria o texto errado com a mesma cara.
*/
const EXTENSO: Record<number, string> = {
  12: 'doze', 15: 'quinze', 24: 'vinte e quatro', 42: 'quarenta e dois',
};
const extenso = (n: number) => EXTENSO[n] ?? `(${n} sem extenso na tabela)`;

/*
  A equação como o gráfico a escreve: uma casa em cada número. É o formato do
  eixo de `DesenhoDoGrafico`, que `desenhoDoGrafico.test.tsx` confere contra o
  motor; aqui o que se confere é que a teoria cita a equação que a tela mostra.
*/
const umaCasa = (n: number | null) => (n ?? Number.NaN).toFixed(1).replace('.', ',');

const coluna = (campo: string) => colunaDe(BASE, campo);

const par = PAR_DO_MODULO_2;
const alturas = () => coluna(par.y);
const idades = () => coluna(par.x);

/* As mesmas contas, sobre o campori, que é a base da teoria. */
const doCampori = (campo: string) => colunaDe(CAMPORI, campo);
const cAlturas = () => doCampori(par.y);
const cIdades = () => doCampori(par.x);
const cSem = () => semAtipicos(CAMPORI, par);
const [IDADE_DENTRO_DA_TEORIA, IDADE_FORA_DA_TEORIA] = IDADES_DA_TEORIA;

function mediaNaUnidade(base: Formulario, unidade: string): number {
  const ns = respostasReais(base)
    .filter(r => r.valores[CAMPO_DO_GRUPO] === unidade)
    .map(r => Number(String(r.valores[CAMPO_DA_MEDIDA]).replace(',', '.')));
  return ns.reduce((a, b) => a + b, 0) / ns.length;
}

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
   * tópico, e um tópico que o escreve duas vezes — na explicação e na legenda
   * da tela — sobrevive a um erro de digitação em uma das duas. A mutação
   * mostrou isso: trocar o r na explicação não derrubava nada, porque o resto
   * do tópico continuava com o certo.
   *
   * É um **piso**, e não uma contagem exata: acrescentar uma menção a mais é
   * legítimo e não reprova, e apagar uma reprova — que é a falha certa.
   */
  vezes?: number;
}

const quantasVezes = (texto: string, agulha: string) =>
  texto.split(agulha).length - 1;

/*
  As afirmações da teoria, uma por número que ela escreve, todas sobre o
  campori. Nenhuma repete um número literal: onde a lição diz o r, esta tabela
  diz `correlacaoDe(idades, alturas)`, e as duas só concordam enquanto a base
  for a que a lição descreve.
*/
const DA_TEORIA: Afirmacao[] = [
  /* ── Módulo 1: de quem a base fala ── */
  {
    onde: 'populacao-e-amostra', oQue: 'quantos se inscreveram', vezes: 2,
    valor: () => extenso(TOTAL_DO_CAMPORI),
  },

  /* ── Módulo 2: a correlação ── */
  {
    onde: 'a-dispersao', oQue: 'quantos pontos a nuvem tem',
    valor: () => extenso(TOTAL_DO_CAMPORI),
  },
  {
    onde: 'o-coeficiente', oQue: 'o r de idade e altura', vezes: 4,
    valor: () => num(correlacaoDe(cIdades(), cAlturas())),
  },
  {
    onde: 'o-que-o-r-nao-diz', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(cIdades(), cAlturas())),
  },
  {
    onde: 'o-que-o-r-nao-diz', oQue: 'a menor altura da base',
    valor: () => numDaProsa(minimo(cAlturas())),
  },

  /* ── Módulo 3: correlação não é causa ── */
  {
    onde: 'a-espuria-desta-base', oQue: 'o r de idade e altura', vezes: 3,
    valor: () => num(correlacaoDe(cIdades(), cAlturas())),
  },
  {
    onde: 'a-espuria-desta-base', oQue: 'o r de idade e acampamentos', vezes: 3,
    valor: () => num(correlacaoDe(cIdades(), doCampori(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'a-espuria-desta-base', oQue: 'o r do par espúrio', vezes: 3,
    valor: () => num(correlacaoDe(cAlturas(), doCampori(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'como-se-testa', oQue: 'quantos inscritos têm treze anos',
    valor: () => extenso(cIdades().filter(i => i === '13').length),
  },
  {
    onde: 'como-se-testa', oQue: 'quantos se inscreveram',
    valor: () => extenso(TOTAL_DO_CAMPORI),
  },

  /* ── Módulo 4: a reta ── */
  {
    onde: 'a-linha-de-tendencia', oQue: 'a equação que o gráfico escreve', vezes: 3,
    valor: () => `y = ${umaCasa(inclinacaoDe(cAlturas(), cIdades()))}x + ${umaCasa(intercepcaoDe(cAlturas(), cIdades()))}`,
  },
  {
    onde: 'a-equacao-e-a-ordem', oQue: 'a inclinação da reta', vezes: 3,
    valor: () => num(inclinacaoDe(cAlturas(), cIdades())),
  },
  {
    onde: 'a-equacao-e-a-ordem', oQue: 'a intercepção da reta', vezes: 4,
    valor: () => num(intercepcaoDe(cAlturas(), cIdades())),
  },

  /* ── Módulo 5: prever e extrapolar ── */
  {
    onde: 'prever-com-a-equacao', oQue: 'a previsão para a idade de dentro', vezes: 4,
    valor: () => num(previsaoDe(IDADE_DENTRO_DA_TEORIA, cAlturas(), cIdades())),
  },
  {
    onde: 'extrapolar', oQue: 'a previsão para a idade de fora', vezes: 3,
    valor: () => num(previsaoDe(IDADE_FORA_DA_TEORIA, cAlturas(), cIdades())),
  },
  {
    onde: 'extrapolar', oQue: 'a previsão para a idade de dentro', vezes: 2,
    valor: () => num(previsaoDe(IDADE_DENTRO_DA_TEORIA, cAlturas(), cIdades())),
  },
  {
    onde: 'extrapolar', oQue: 'a previsão para dezesseis anos',
    valor: () => num(previsaoDe(16, cAlturas(), cIdades())),
  },
  {
    onde: 'extrapolar', oQue: 'a maior idade da base',
    valor: () => extenso(Number(maximo(cIdades()))),
  },

  /* ── Módulo 6: a qualidade do ajuste ── */
  {
    onde: 'o-r-quadrado', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(cIdades(), cAlturas())),
  },
  {
    onde: 'o-r-quadrado', oQue: 'o r² de idade e altura', vezes: 4,
    valor: () => num(rquadDe(cAlturas(), cIdades())),
  },
  {
    onde: 'o-r-quadrado', oQue: 'o r² de idade e acampamentos', vezes: 3,
    valor: () => num(rquadDe(doCampori(CAMPO_ACAMPAMENTOS), cIdades())),
  },
  {
    onde: 'o-r-quadrado', oQue: 'o r² do par espúrio', vezes: 4,
    valor: () => num(rquadDe(doCampori(CAMPO_ACAMPAMENTOS), cAlturas())),
  },
  {
    onde: 'quando-a-reta-nao-serve', oQue: 'o r² do par espúrio',
    valor: () => num(rquadDe(doCampori(CAMPO_ACAMPAMENTOS), cAlturas())),
  },

  /* ── Módulo 7: dado próprio ── */
  {
    onde: 'escolher-o-que-olhar', oQue: 'o r de idade e diárias', vezes: 4,
    valor: () => num(correlacaoDe(cIdades(), doCampori(CAMPO_DIARIAS))),
  },
  {
    onde: 'as-tres-perguntas', oQue: 'o r de acampamentos e diárias',
    valor: () => num(correlacaoDe(doCampori(CAMPO_ACAMPAMENTOS), doCampori(CAMPO_DIARIAS))),
  },

  /* ── Módulo 8: sem os atípicos ── */
  {
    onde: 'excluir-sem-apagar', oQue: 'a inclinação com todos', vezes: 2,
    valor: () => num(inclinacaoDe(cAlturas(), cIdades())),
  },
  {
    onde: 'excluir-sem-apagar', oQue: 'o valor atípico da altura',
    valor: () => numDaProsa(minimo(cAlturas())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o valor atípico da altura', vezes: 2,
    valor: () => numDaProsa(minimo(cAlturas())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'a inclinação com todos, em centímetros',
    valor: () => cm(inclinacaoDe(cAlturas(), cIdades())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'a inclinação sem o atípico, em centímetros',
    valor: () => cm(inclinacaoDe(cSem().ys, cSem().xs)),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'a inclinação sem o atípico, como a célula mostra', vezes: 3,
    valor: () => num(inclinacaoDe(cSem().ys, cSem().xs)),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o r² com todos', vezes: 3,
    valor: () => num(rquadDe(cAlturas(), cIdades())),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'o r² sem o atípico', vezes: 3,
    valor: () => num(rquadDe(cSem().ys, cSem().xs)),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'quantos pontos o ajuste ganhou',
    valor: () => extenso(Math.round((rquadDe(cSem().ys, cSem().xs)! - rquadDe(cAlturas(), cIdades())!) * 100)),
  },
  {
    onde: 'o-que-a-exclusao-faz', oQue: 'quantos se inscreveram',
    valor: () => extenso(TOTAL_DO_CAMPORI),
  },

  /* ── Módulo 9: o acaso ── */
  {
    onde: 'o-embaralho', oQue: 'a diferença real entre as duas unidades', vezes: 3,
    valor: () => num(diferencaDosGrupos(CAMPORI, GRUPOS_DA_TEORIA)),
  },
  {
    onde: 'o-embaralho', oQue: 'a média da unidade mais experiente',
    valor: () => num(mediaNaUnidade(CAMPORI, GRUPOS_DA_TEORIA[1])),
  },
  {
    onde: 'o-embaralho', oQue: 'a média da outra unidade',
    valor: () => num(mediaNaUnidade(CAMPORI, GRUPOS_DA_TEORIA[0])),
  },
  {
    onde: 'o-que-o-numero-nao-diz', oQue: 'a diferença real entre as duas unidades',
    valor: () => num(diferencaDosGrupos(CAMPORI, GRUPOS_DA_TEORIA)),
  },
  {
    onde: 'tres-providencias', oQue: 'a média da unidade mais experiente', vezes: 2,
    valor: () => num(mediaNaUnidade(CAMPORI, GRUPOS_DA_TEORIA[1])),
  },
  {
    onde: 'tres-providencias', oQue: 'a média da outra unidade',
    valor: () => num(mediaNaUnidade(CAMPORI, GRUPOS_DA_TEORIA[0])),
  },
  {
    onde: 'tres-providencias', oQue: 'quantos pares seis unidades formam',
    valor: () => extenso((6 * 5) / 2),
  },

  /* ── Módulo 10: o grau de confiança ── */
  {
    onde: 'a-analise-completa', oQue: 'o r de idade e altura',
    valor: () => num(correlacaoDe(cIdades(), cAlturas())),
  },
  {
    onde: 'a-analise-completa', oQue: 'o r² com todos',
    valor: () => num(rquadDe(cAlturas(), cIdades())),
  },
  {
    onde: 'a-analise-completa', oQue: 'o r² sem o atípico',
    valor: () => num(rquadDe(cSem().ys, cSem().xs)),
  },
  {
    onde: 'a-analise-completa', oQue: 'a previsão para a idade de fora',
    valor: () => num(previsaoDe(IDADE_FORA_DA_TEORIA, cAlturas(), cIdades())),
  },
];

/*
  As afirmações das questões, sobre o acampamento do laboratório: elas são
  conferidas contra a base que a lição analisa, porque é dela que falam.
*/
const DAS_QUESTOES: Afirmacao[] = [
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
  {
    onde: 'ES10-M3-Q2', oQue: 'o r do par espúrio', vezes: 2,
    valor: () => num(correlacaoDe(alturas(), coluna(CAMPO_ACAMPAMENTOS))),
  },
  {
    onde: 'ES10-M4-Q4', oQue: 'a intercepção da reta',
    valor: () => num(intercepcaoDe(alturas(), idades())),
  },
  {
    onde: 'ES10-M5-Q1', oQue: 'a previsão para vinte e cinco anos', vezes: 2,
    valor: () => num(previsaoDe(25, alturas(), idades())),
  },
  {
    onde: 'ES10-M5-Q2', oQue: 'a previsão para dezesseis anos',
    valor: () => num(previsaoDe(16, alturas(), idades())),
  },
  {
    onde: 'ES10-M6-Q4', oQue: 'o r² de idade e altura',
    valor: () => num(rquadDe(alturas(), idades())),
  },
  {
    onde: 'ES10-M6-Q5', oQue: 'o r² do par espúrio', vezes: 2,
    valor: () => num(rquadDe(coluna(CAMPO_ACAMPAMENTOS), alturas())),
  },
  {
    onde: 'ES10-M7-Q1', oQue: 'o r de idade e diárias', vezes: 4,
    valor: () => num(correlacaoDe(idades(), coluna(CAMPO_DIARIAS))),
  },
  {
    onde: 'ES10-M8-Q4', oQue: 'o r² sem o atípico',
    valor: () => num(rquadDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'ES10-M8-Q5', oQue: 'a inclinação sem o atípico, em centímetros',
    valor: () => cm(inclinacaoDe(semAtipicos(BASE, par).ys, semAtipicos(BASE, par).xs)),
  },
  {
    onde: 'ES10-M9-Q3', oQue: 'a diferença real entre as duas unidades',
    valor: () => num(diferencaDosGrupos(BASE, [GRUPO_A, GRUPO_B])),
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

const AFIRMACOES = [...DA_TEORIA, ...DAS_QUESTOES];

function diferencaDosGrupos(base: Formulario, [a, b]: readonly [string, string]): number {
  return sortearEntreGrupos(base, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, a, b, 0).real;
}

const ehQuestao = (onde: string) => onde.startsWith('ES10-');

const textoDe = (onde: string) => (ehQuestao(onde) ? textoDaQuestao(onde) : textoDoTopico(onde));

describe('os números da teoria e das questões saem da base de cada uma', () => {
  /*
    A guarda contra o vazio, em dois lados. Uma tabela esvaziada deixaria a
    trava verde por não ter conferido nada, e uma entrada que apontasse para
    um tópico apagado estouraria em `textoDoTopico` em vez de passar calada.
  */
  it('as tabelas de afirmações cobrem a vereda inteira', () => {
    expect(DA_TEORIA.length).toBeGreaterThanOrEqual(40);
    expect(new Set(DA_TEORIA.map(a => a.onde)).size, 'a teoria inteira').toBeGreaterThanOrEqual(20);
    expect(DAS_QUESTOES.length).toBeGreaterThanOrEqual(15);
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
  E as premissas de que a vereda inteira depende, nas duas bases.

  Cada uma é uma propriedade da base sem a qual uma lição passa a ensinar
  sobre um caso que não existe — e nenhuma delas reclamaria sozinha, porque
  todas as contas continuariam certas. É a decisão da foto de papel que pesa
  mais que a página digitada na CC-ES004. As que valem para o laboratório
  valem para a teoria também: a teoria ensina o mesmo, com outros números.
*/
const AS_DUAS = [['o acampamento', BASE], ['o campori', CAMPORI]] as const;

describe.each(AS_DUAS)('%s sustenta o que a vereda afirma sobre ele', (_nome, base) => {
  const col = (campo: string) => colunaDe(base, campo);
  const alt = () => col(par.y);
  const ida = () => col(par.x);

  it('o par do módulo 2 é forte, e o espúrio é moderado', () => {
    /* Se o espúrio fosse fraco, ninguém o levaria a sério e o módulo 3 não
       teria caso: a lição existe porque o número é grande o bastante para
       alguém concluir dele. */
    expect(Math.abs(correlacaoDe(ida(), alt())!)).toBeGreaterThan(0.7);
    const espurio = Math.abs(correlacaoDe(alt(), col(CAMPO_ACAMPAMENTOS))!);
    expect(espurio).toBeGreaterThan(0.4);
    expect(espurio).toBeLessThan(0.7);
  });

  it('a idade tem correlação mais forte com as duas do que elas entre si', () => {
    /* É o que torna a terceira coluna a explicação plausível. Se a idade
       tivesse correlação fraca com uma das duas, a lição estaria apontando
       uma variável escondida que não explica nada. */
    const espurio = Math.abs(correlacaoDe(alt(), col(CAMPO_ACAMPAMENTOS))!);
    expect(Math.abs(correlacaoDe(ida(), alt())!)).toBeGreaterThan(espurio);
    expect(Math.abs(correlacaoDe(ida(), col(CAMPO_ACAMPAMENTOS))!)).toBeGreaterThan(espurio);
  });

  it('o ajuste piora do par da idade para o espúrio, que é o pior', () => {
    const r2 = (y: string, x: string) => rquadDe(col(y), col(x))!;
    expect(r2(par.y, par.x)).toBeGreaterThan(r2(CAMPO_ACAMPAMENTOS, par.x));
    expect(r2(CAMPO_ACAMPAMENTOS, par.x)).toBeGreaterThan(r2(CAMPO_ACAMPAMENTOS, par.y));
  });

  it('a extrapolação logo acima é plausível', () => {
    /* A metade do requisito 5.4 que passa por boa: um ano além da maior idade
       dá uma altura que alguém teria, e por isso ninguém desconfia. */
    const logoAcima = previsaoDe(Number(maximo(ida())) + 1, alt(), ida())!;
    expect(logoAcima).toBeGreaterThan(Number(maximo(alt())));
    expect(logoAcima).toBeLessThan(2);
  });

  it('há exatamente um valor atípico no par, e tirá-lo mexe pouco na reta', () => {
    /* A lição do módulo 8 afirma as duas coisas: que a conclusão quase não
       muda e que o ajuste salta. Numa base em que a exclusão virasse a reta,
       a lição diria o contrário do que os números mostram. */
    expect(linhasAtipicasDoPar(base, par)).toHaveLength(1);
    const sem = semAtipicos(base, par);
    const comTodos = inclinacaoDe(alt(), ida())!;
    const semEle = inclinacaoDe(sem.ys, sem.xs)!;
    expect(Math.abs(semEle - comTodos) / comTodos).toBeLessThan(0.1);
    expect(rquadDe(sem.ys, sem.xs)! - rquadDe(alt(), ida())!).toBeGreaterThan(0.05);
  });
});

describe('cada base, no que só ela afirma', () => {
  it('a extrapolação distante é absurda nas duas', () => {
    /* Com a reta mais plana, a altura prevista viraria um número possível e a
       lição perderia o exemplo que se vê. */
    expect(previsaoDe(25, alturas(), idades())!).toBeGreaterThan(2.3);
    expect(previsaoDe(IDADE_FORA_DA_TEORIA, cAlturas(), cIdades())!).toBeGreaterThan(2.1);
    expect(IDADE_DENTRO_DA_TEORIA).toBeGreaterThanOrEqual(Number(minimo(cIdades())));
    expect(IDADE_DENTRO_DA_TEORIA).toBeLessThanOrEqual(Number(maximo(cIdades())));
  });

  it('no laboratório, o par do módulo 7 é uma relação fraca que existe', () => {
    /* A questão do módulo 7 fala de uma relação fraca, e não de nenhuma: com
       r perto de zero a alternativa certa dela estaria errada. */
    const r = correlacaoDe(idades(), coluna(CAMPO_DIARIAS));
    expect(Math.abs(r!)).toBeGreaterThan(0.2);
    expect(Math.abs(r!)).toBeLessThan(0.5);
  });

  it('no campori, o par que a teoria escolhe não anda junto', () => {
    /* A teoria diz que idade e diárias "não andam juntas"; com um r moderado a
       frase estaria errada. */
    expect(Math.abs(correlacaoDe(cIdades(), doCampori(CAMPO_DIARIAS))!)).toBeLessThan(0.1);
  });

  it('o atípico do campori é a digitação trocada que a teoria descreve', () => {
    const [linha] = linhasAtipicasDoPar(CAMPORI, par);
    const r = respostasReais(CAMPORI)[linha];
    expect(r.valores[par.y]).toBe('1,16');
    expect(r.valores[par.x]).toBe('13');
    expect(linha + 2, 'a linha da planilha que a tela mostra vazia').toBe(19);
  });

  it('no campori, o embaralho alcança a diferença real cerca de uma vez em dez', () => {
    /* A teoria diz "cerca de uma vez em dez". O sorteio é semeado, e a conta
       usa muitos embaralhos, para a frequência ser a da base e não a da sorte
       desta execução. */
    let s = 11;
    const aleatorio = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    const [a, b] = GRUPOS_DA_TEORIA;
    const r = sortearEntreGrupos(CAMPORI, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, a, b, 4000, aleatorio);
    const f = r.sorteadas.filter(d => d >= r.real - 1e-9).length / r.sorteadas.length;
    expect(f).toBeGreaterThan(1 / 14);
    expect(f).toBeLessThan(1 / 7.5);
    /* E a unidade mais experiente é a que a teoria nomeia como tal. */
    expect(mediaNaUnidade(CAMPORI, b)).toBeGreaterThan(mediaNaUnidade(CAMPORI, a));
  });

  it('as duas bases têm o tamanho de que cada texto fala', () => {
    expect(TOTAL).toBe(48);
    expect(TOTAL_DO_CAMPORI).toBe(42);
  });
});

describe('o campori não é o acampamento do laboratório', () => {
  it('a teoria fotografa outras unidades e outras idades', () => {
    expect(GRUPOS_DA_TEORIA).not.toEqual([GRUPO_A, GRUPO_B]);
    expect([...IDADES_DA_TEORIA]).not.toContain(13);
    expect([...IDADES_DA_TEORIA]).not.toContain(25);
  });

  it('a teoria não cita os números nem as pessoas do acampamento', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = [
      '0,91', '0,72', '2,58', '0,83', '0,94', '1,05', '4,71', '2,13', '2,59', '2,85',
      '0,33', '0,25', '0,14', '0,51', '0,38', '1,32', '1,57', '1,74', '1,83', '0,08', '0,48',
      '8,4', '8,0', 'uma vez em sete', 'quarenta e oito', 'Águia',
    ];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });

  it('doze tópicos ensinam um gesto na planilha, e nenhum guarda o quadro de texto', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(12);
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });
});
