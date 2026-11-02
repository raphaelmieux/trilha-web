import { planilhaDe, type Caderno, type Planilha } from '../labs/planilha';
import { comCelulas } from '../labs/cadernoDoClube';

/**
 * O título mesclado por cima da tabela e em negrito. É a zona de
 * apresentação feita do jeito que a teoria ensina — e, sem isso, a célula A1
 * cortaria o título na largura da coluna dos nomes.
 */
const comTitulo = (p: Planilha, colunas: number): Planilha =>
  comCelulas(p, (cel, l, c) => (l === 0 && c === 0 ? { ...cel, span: colunas, negrito: true } : cel));

/*
 * A pasta de trabalho da excursão de outubro: a planilha que as telas da
 * CC-ES003 percorrem.
 *
 * ── Por que outra planilha ───────────────────────────────────────────────
 * O laboratório abre a pasta do Acampamento de Inverno (`cadernoDoClube`), e
 * quase tudo nela é resposta de alguma lição: a diária de 45, os doze
 * inscritos e o total que eles somam, a tabela de conselheiros fora de ordem
 * e o "Tia Rute" que o PROCV aproximado devolve para a Onça, os três defeitos
 * da aba Conferir. Fotografar o gesto ali seria pôr o gabarito na teoria — a
 * decisão do notebook da unidade Tucano da CC-ES001 e do guia da caminhada da
 * CC-DG005.
 *
 * Aqui é outro evento (a excursão à cachoeira, de um dia), outra conta (a
 * refeição a 18, e não a diária), outra procura (a unidade dá o ônibus, e não
 * o conselheiro) e outra lista. `exemplosDePlanilha.test.ts` confere o que as
 * legendas afirmam contra esta pasta, pelo mesmo motor que responde ao
 * desbravador, e reprova se as duas pastas passarem a dividir um nome, um
 * valor de referência ou um par da tabela de procura.
 */

export const VALOR_DA_REFEICAO = 18;

export interface Participante {
  nome: string;
  unidade: string;
  refeicoes: number;
}

/*
  Dez participantes, com duas, três e quatro refeições. Com todo mundo no
  mesmo número, média, máximo e mínimo dariam a mesma resposta, e a tela da
  função não mostraria a diferença entre elas.
*/
export const PARTICIPANTES: Participante[] = [
  { nome: 'Alice Moreira', unidade: 'Tucano', refeicoes: 4 },
  { nome: 'Benício Prado', unidade: 'Falcão', refeicoes: 4 },
  { nome: 'Cecília Farias', unidade: 'Arara', refeicoes: 2 },
  { nome: 'Davi Lacerda', unidade: 'Onça', refeicoes: 4 },
  { nome: 'Elisa Cardoso', unidade: 'Tucano', refeicoes: 3 },
  { nome: 'Fábio Teles', unidade: 'Águia', refeicoes: 4 },
  { nome: 'Giovana Queiroz', unidade: 'Jaguar', refeicoes: 2 },
  { nome: 'Henrique Paiva', unidade: 'Falcão', refeicoes: 4 },
  { nome: 'Íris Antunes', unidade: 'Arara', refeicoes: 4 },
  { nome: 'Júlio Brandão', unidade: 'Onça', refeicoes: 3 },
];

/*
  A tabela dos ônibus, na ordem em que a secretaria a escreveu: por ônibus, e
  não por unidade. É assim que toda tabela digitada à mão fica, e é o que faz
  o PROCV sem o quarto argumento errar — ele lê a primeira coluna como se ela
  estivesse em ordem alfabética.
*/
export const ONIBUS: [string, string][] = [
  ['Tucano', 'Ônibus 1'],
  ['Arara', 'Ônibus 1'],
  ['Falcão', 'Ônibus 2'],
  ['Águia', 'Ônibus 2'],
  ['Onça', 'Ônibus 3'],
  ['Jaguar', 'Ônibus 3'],
];

/* ── A aba da excursão: as três zonas ─────────────────────────────────────── */

export const ROTULOS_DOS_CALCULOS = [
  'Total arrecadado', 'Média de refeições', 'Maior', 'Menor', 'Quantos foram',
] as const;

/** Onde cada participante mora na aba: linha 3 é o primeiro, linha 12 o último. */
export const PRIMEIRA_LINHA = 3;
export const ULTIMA_LINHA = PRIMEIRA_LINHA + PARTICIPANTES.length - 1;

/**
 * A aba como chega: o título, o bloco de dados, a calha vazia na coluna E e a
 * zona de cálculos na F, com os resultados por escrever.
 *
 * `larguraDosNomes` existe para a tela de tamanho: estreita, a coluna corta os
 * nomes, que é o que se conserta com dois cliques na borda.
 */
export function abaDaExcursao(larguraDosNomes = 132): Planilha {
  const conteudo: string[][] = [
    ['Excursão à cachoeira — outubro', '', '', '', '', 'Cálculos'],
    ['Nome', 'Unidade', 'Refeições', 'Pago'],
    ...PARTICIPANTES.map(p => [p.nome, p.unidade, String(p.refeicoes), String(p.refeicoes * VALOR_DA_REFEICAO)]),
  ];
  ROTULOS_DOS_CALCULOS.forEach((rotulo, i) => { conteudo[1 + i][5] = rotulo; });
  const p = comTitulo(planilhaDe('Excursão', conteudo, {
    tabela: { l1: 1, c1: 0, l2: ULTIMA_LINHA - 1, c2: 3 },
  }), 4);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? larguraDosNomes : c === 5 ? 130 : w)) };
}

/* ── A aba do lanche: fórmula, relativa e absoluta ────────────────────────── */

export const LINHA_DO_PRIMEIRO_LANCHE = 4;

/**
 * O valor da refeição mora em B1, e a coluna C diz quanto cada um paga.
 * `preenchida` traz a coluna já calculada com `=B4*B$1`; vazia, ela espera a
 * fórmula que a tela de referência relativa escreve.
 */
export function abaDoLanche(preenchida: boolean): Planilha {
  const p = planilhaDe('Lanche', [
    ['Valor da refeição', String(VALOR_DA_REFEICAO)],
    [],
    ['Nome', 'Refeições', 'A pagar'],
    ...PARTICIPANTES.map((p, i) => [
      p.nome, String(p.refeicoes),
      preenchida ? `=B${LINHA_DO_PRIMEIRO_LANCHE + i}*B$1` : '',
    ]),
  ]);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? 132 : w)) };
}

/* ── A aba dos ônibus: condicional e procura ──────────────────────────────── */

/** A coluna G e H guardam a tabela de procura, travada com cifrões. */
export const TABELA_DOS_ONIBUS = '$G$2:$H$7';

export function abaDosOnibus(exata: boolean): Planilha {
  const conteudo: string[][] = [
    ['Nome', 'Unidade', 'Refeições', 'Ônibus', 'Dia inteiro?', '', 'Unidade', 'Ônibus'],
    ...PARTICIPANTES.map((p, i) => {
      const l = i + 2;
      return [
        p.nome, p.unidade, String(p.refeicoes),
        exata ? `=PROCV(B${l};${TABELA_DOS_ONIBUS};2;FALSO)` : `=PROCV(B${l};${TABELA_DOS_ONIBUS};2)`,
        `=SE(C${l}>=4;"Sim";"Não")`,
      ];
    }),
  ];
  ONIBUS.forEach(([unidade, onibus], i) => {
    conteudo[1 + i][6] = unidade;
    conteudo[1 + i][7] = onibus;
  });
  const p = planilhaDe('Ônibus', conteudo);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? 132 : w)) };
}

/* ── A aba da chamada: longa o bastante para o cabeçalho sumir ao rolar ───── */

const PRIMEIROS = [
  'Amanda', 'Bernardo', 'Clara', 'Diego', 'Estela', 'Francisco', 'Helena', 'Igor', 'Joana',
  'Kauã', 'Luana', 'Murilo', 'Nina', 'Otávio', 'Paula',
];
const SOBRENOMES = ['Ribas', 'Siqueira', 'Valença'];
const UNIDADES = ['Tucano', 'Falcão', 'Arara', 'Onça', 'Águia', 'Jaguar'];

/** Quarenta e cinco nomes: mais do que cabe numa tela de notebook. */
export const CHAMADA = SOBRENOMES.flatMap((s, j) => PRIMEIROS.map((n, i) => ({
  nome: `${n} ${s}`,
  unidade: UNIDADES[(i + j * 2) % UNIDADES.length],
  presencas: 6 + ((i * 5 + j * 3) % 7),
})));

export function abaDaChamada(): Planilha {
  const p = comTitulo(planilhaDe('Chamada', [
    ['Chamada do segundo semestre'],
    ['Nome', 'Unidade', 'Presenças'],
    ...CHAMADA.map(c => [c.nome, c.unidade, String(c.presencas)]),
  ], { tabela: { l1: 1, c1: 0, l2: CHAMADA.length + 1, c2: 2 } }), 3);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? 132 : w)) };
}

/* ── A aba do orçamento: duas entradas e nenhum total digitado ────────────── */

export const CATEGORIAS = ['Ônibus', 'Lanche', 'Entrada do parque', 'Primeiros socorros'];
export const MESES = ['Agosto', 'Setembro', 'Outubro'];
export const GASTOS: number[][] = [
  [0, 600, 900],
  [0, 120, 240],
  [0, 0, 150],
  [85, 40, 0],
];

export function abaDoOrcamento(): Planilha {
  const conteudo: string[][] = [
    ['Orçamento da excursão'],
    ['Categoria', ...MESES, 'Total', '', 'Para onde foi', 'Total'],
    ...CATEGORIAS.map((nome, i) => {
      const l = i + 3;
      return [nome, ...GASTOS[i].map(String), `=SOMA(B${l}:D${l})`, '', nome, `=E${l}`];
    }),
    ['Total', '=SOMA(B3:B6)', '=SOMA(C3:C6)', '=SOMA(D3:D6)', '=SOMA(E3:E6)'],
  ];
  const p = comTitulo(planilhaDe('Orçamento', conteudo), 5);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 || c === 6 ? 132 : w)) };
}

/* ── A aba de conferir: três defeitos e as duas contagens ─────────────────── */

/** Quem tem o pagamento guardado como texto, e a linha dele. */
export const PAGO_COMO_TEXTO = 4;
export const LINHA_DO_TOTAL = ULTIMA_LINHA + 2;

export function abaDeConferir(): Planilha {
  const conteudo: string[][] = [
    ['Conferência da excursão', '', '', '', '', 'Números em Pago', '=CONT.NÚM(D3:D12)'],
    ['Nome', 'Unidade', 'Refeições', 'Pago', '', 'Células preenchidas', '=CONT.VALORES(D3:D12)'],
    ...PARTICIPANTES.map(p => [p.nome, p.unidade, String(p.refeicoes), String(p.refeicoes * VALOR_DA_REFEICAO)]),
  ];
  const quem = PAGO_COMO_TEXTO - PRIMEIRA_LINHA;
  conteudo[PAGO_COMO_TEXTO - 1][3] = `'${PARTICIPANTES[quem].refeicoes * VALOR_DA_REFEICAO}`;
  conteudo[LINHA_DO_TOTAL - 1] = ['Total pago', '', '', '=SOMA(#REF!)'];
  conteudo[LINHA_DO_TOTAL] = ['Total de refeições', '', String(totalDeRefeicoes())];
  const p = comTitulo(planilhaDe('Conferir', conteudo, {
    tabela: { l1: 1, c1: 0, l2: ULTIMA_LINHA - 1, c2: 3 },
  }), 4);
  return { ...p, larguras: p.larguras.map((w, c) => (c === 0 ? 132 : c === 5 ? 150 : w)) };
}

export const totalDeRefeicoes = () => PARTICIPANTES.reduce((s, p) => s + p.refeicoes, 0);

/* ── A pasta ──────────────────────────────────────────────────────────────── */

export const ABAS_DA_EXCURSAO = ['Excursão', 'Lanche', 'Ônibus', 'Chamada', 'Orçamento', 'Conferir'] as const;
type Aba = (typeof ABAS_DA_EXCURSAO)[number];

export interface Estado {
  aba: Aba;
  larguraDosNomes?: number;
  lanchePreenchido?: boolean;
  procuraExata?: boolean;
}

/** A pasta inteira, com a aba pedida à frente e cada aba no estado que a tela quer. */
export function pastaDaExcursao({ aba, larguraDosNomes, lanchePreenchido = true, procuraExata = true }: Estado): Caderno {
  return {
    planilhas: [
      abaDaExcursao(larguraDosNomes), abaDoLanche(lanchePreenchido), abaDosOnibus(procuraExata),
      abaDaChamada(), abaDoOrcamento(), abaDeConferir(),
    ],
    ativa: ABAS_DA_EXCURSAO.indexOf(aba),
  };
}
