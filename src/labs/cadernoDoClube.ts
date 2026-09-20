/**
 * A pasta de trabalho da CC-ES003: um arquivo só, sete lições.
 *
 * ── Por que uma pasta, e não sete planilhas ──────────────────────────────
 * É o arranjo do `discoDoClube()` da CC-ES001 e do terminal da CC003, e vale o
 * que está escrito nos dois: quem abre o módulo 6 reencontra as abas que o
 * módulo 1 organizou, e sete arquivos diferentes ensinariam que cada exercício
 * acontece numa planilha de mentira. O clube tem **uma** planilha do
 * acampamento, e é nela que tudo acontece.
 *
 * ── Por que o ponto de partida vem da lição, e não daqui ─────────────────
 * Cada módulo parte de um estado diferente da mesma pasta: o módulo 1 recebe a
 * aba de inscrições bagunçada e o módulo 2 recebe a mesma aba já arrumada,
 * senão a segunda lição começaria mandando refazer a primeira. É o mesmo
 * campo `documento` da CC-ES002, pelo mesmo motivo escrito lá: `tipo:
 * 'planilha'` sozinho implicaria **uma** planilha, e o segundo laboratório
 * abriria o do primeiro.
 *
 * O que mora aqui é o que as sete têm em comum — os inscritos, as unidades, o
 * valor da diária e as peças de montar aba. O que cada lição cobra mora no
 * arquivo dela.
 */

import {
  type Caderno, type Celula, type Faixa, type Planilha,
  vazia, refazerMesclagens, LARGURA_PADRAO, ALTURA_PADRAO,
  COLUNAS_DA_GRADE, LINHAS_DA_GRADE,
} from './planilha';
import { mostrar, valorDaCelula, type Valor } from './formulas';

/* ── Os dados do clube ────────────────────────────────────────────────────── */

export const VALOR_DA_DIARIA = 45;

export interface Inscrito {
  nome: string;
  unidade: string;
  diarias: number;
}

/*
  Doze inscritos, e três deles com duas diárias em vez de três.

  A variação não é enfeite: com todo mundo em três, `MÁXIMO` e `MÍNIMO` dariam
  o mesmo número e a `MÉDIA` daria exatamente três — as quatro funções do
  requisito 4.2 responderiam a mesma coisa, e a lição que as separa não teria
  o que separar.
*/
export const INSCRITOS: Inscrito[] = [
  { nome: 'Ana Beatriz Rocha', unidade: 'Águia', diarias: 3 },
  { nome: 'Bruno Alves', unidade: 'Falcão', diarias: 3 },
  { nome: 'Carla Mendes', unidade: 'Tucano', diarias: 2 },
  { nome: 'Daniel Rocha', unidade: 'Falcão', diarias: 3 },
  { nome: 'Eduarda Lima', unidade: 'Arara', diarias: 3 },
  { nome: 'Felipe Souza', unidade: 'Jaguar', diarias: 2 },
  { nome: 'Gabriela Nunes', unidade: 'Águia', diarias: 3 },
  { nome: 'Heitor Dias', unidade: 'Onça', diarias: 3 },
  { nome: 'Isabela Pires', unidade: 'Tucano', diarias: 3 },
  { nome: 'João Vitor Barros', unidade: 'Jaguar', diarias: 3 },
  { nome: 'Larissa Gomes', unidade: 'Arara', diarias: 2 },
  { nome: 'Miguel Torres', unidade: 'Onça', diarias: 3 },
];

/*
  A tabela de conselheiros **não** está em ordem alfabética, e é de propósito.

  Ela está na ordem em que o clube escreve as unidades, que é a ordem em que
  elas foram fundadas — e é assim que toda tabela digitada à mão fica. O
  requisito 4.5 depende disso: o PROCV sem o quarto argumento procura
  aproximado, lê a coluna como se estivesse ordenada, e nesta aqui erra de
  dois jeitos diferentes. Procurando "Águia" ele para na primeira linha e
  devolve `#N/D`; procurando "Onça" ele devolve **Tia Rute**, que é da Águia —
  um nome plausível, sem erro nenhum na tela.

  Com a tabela ordenada, o `FALSO` pareceria não fazer diferença, e a lição
  seria sobre um argumento que ninguém precisa escrever.
*/
export const CONSELHEIROS: [string, string][] = [
  ['Falcão', 'Tio Samuel'],
  ['Águia', 'Tia Rute'],
  ['Tucano', 'Tia Joana'],
  ['Arara', 'Tio Márcio'],
  ['Jaguar', 'Tia Priscila'],
  ['Onça', 'Tio Edson'],
];

export const TOTAL_DE_DIARIAS = INSCRITOS.reduce((s, i) => s + i.diarias, 0);
export const TOTAL_ARRECADADO = TOTAL_DE_DIARIAS * VALOR_DA_DIARIA;

/* ── Peças de montar aba ──────────────────────────────────────────────────── */

/** A grade de uma aba, com o conteúdo escrito a partir de A1. */
export function planilhaDe(nome: string, conteudo: string[][], extras: Partial<Planilha> = {}): Planilha {
  return {
    celulas: Array.from({ length: LINHAS_DA_GRADE }, (_, l) =>
      Array.from({ length: COLUNAS_DA_GRADE }, (_, c) => vazia(conteudo[l]?.[c] ?? ''))),
    larguras: new Array(COLUNAS_DA_GRADE).fill(LARGURA_PADRAO),
    alturas: new Array(LINHAS_DA_GRADE).fill(ALTURA_PADRAO),
    layout: 'nenhum',
    nome,
    tabela: null,
    congeladas: 0,
    filtro: null,
    ordenacao: null,
    regras: [],
    grafico: null,
    ...extras,
  };
}

/** Aplica uma mudança célula a célula, sem tocar no resto da grade. */
export function comCelulas(p: Planilha, mudar: (cel: Celula, l: number, c: number) => Celula): Planilha {
  return { ...p, celulas: refazerMesclagens(p.celulas.map((linha, l) => linha.map((cel, c) => mudar(cel, l, c)))) };
}

/** O valor calculado de uma célula desta aba. */
export const valorEm = (p: Planilha, l: number, c: number): Valor =>
  valorDaCelula((li, ci) => p.celulas[li]?.[ci]?.texto ?? '', l, c);

/** O que a célula mostra na tela. */
export const mostradoEm = (p: Planilha, l: number, c: number) => mostrar(valorEm(p, l, c), p.celulas[l]?.[c]?.formato ?? 'geral');

/** O texto escrito na célula, sem espaço em volta. */
export const escritoEm = (p: Planilha, l: number, c: number) => (p.celulas[l]?.[c]?.texto ?? '').trim();

/** A célula guarda uma fórmula que chama esta função. */
export function usaFuncao(texto: string, nome: string): boolean {
  const limpo = texto.trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const alvo = nome.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  /*
    A busca é por "nome seguido de parêntese", e não por conter o nome.
    `SOMA` dentro de `SOMASE` casaria, e a tarefa da soma ficaria verde com uma
    fórmula que soma condicionalmente — um número plausível a mais.
  */
  return new RegExp(`(^|[^A-Z.])${alvo.replace('.', '\\.')}\\s*\\(`).test(limpo);
}

/** Toda célula da faixa, em ordem de leitura. */
export function celulasDaFaixa(p: Planilha, f: Faixa): { l: number; c: number; cel: Celula }[] {
  const saida: { l: number; c: number; cel: Celula }[] = [];
  for (let l = Math.min(f.l1, f.l2); l <= Math.max(f.l1, f.l2); l++)
    for (let c = Math.min(f.c1, f.c2); c <= Math.max(f.c1, f.c2); c++)
      saida.push({ l, c, cel: p.celulas[l]?.[c] ?? vazia() });
  return saida;
}

/* ── As abas ──────────────────────────────────────────────────────────────── */

export const LINHA_DO_TITULO = 0;
export const LINHA_DO_CABECALHO = 1;
export const PRIMEIRA_LINHA_DE_DADO = 2;
export const ULTIMA_LINHA_DE_DADO = PRIMEIRA_LINHA_DE_DADO + INSCRITOS.length - 1;

/** A faixa que a planilha reconhece como tabela dos inscritos: cabeçalho e dados. */
export const TABELA_DOS_INSCRITOS: Faixa = {
  l1: LINHA_DO_CABECALHO, c1: 0, l2: ULTIMA_LINHA_DE_DADO, c2: 3,
};

/*
  As três zonas da aba de inscrições, e por que elas vêm rotuladas.

  O requisito 3 pede explicar por que uma planilha bem construída separa o dado
  bruto do cálculo e da apresentação. Um exercício que pedisse "organize como
  achar melhor" mediria gosto; um que desse a planilha já separada não mediria
  nada. Então a estrutura vem escrita — `Cálculos` sobre a coluna F, com os
  rótulos do que se quer — e o que a lição cobra é **pôr cada coisa na zona
  dela**, que é a decisão que o requisito nomeia.

  A coluna E fica vazia de propósito: é a calha que separa o bloco de dados do
  bloco de contas. Sem ela as duas tabelas se encostam e a planilha passa a ter
  uma tabela só — e aí ordenar os dados levaria os cálculos junto.
*/
export const COLUNA_DOS_CALCULOS = 5;
export const ROTULOS_DOS_CALCULOS = [
  'Total arrecadado',
  'Média de diárias',
  'Maior número de diárias',
  'Menor número de diárias',
  'Quantos inscritos',
] as const;
export const PRIMEIRA_LINHA_DE_CALCULO = 1;

/** A aba de inscrições arrumada: dado bruto no bloco, zona de cálculos ao lado. */
export function abaDeInscricoes(): Planilha {
  const conteudo: string[][] = [
    ['Inscrições — Acampamento de Inverno 2026'],
    ['Nome', 'Unidade', 'Diárias', 'Valor'],
    /* Cada linha traz a fórmula da **própria** linha. Escrever a mesma em
       todas mostraria o valor do primeiro inscrito doze vezes, com doze
       números plausíveis e iguais — e a coluna pareceria certa. */
    ...INSCRITOS.map((i, n) => [
      i.nome, i.unidade, String(i.diarias),
      `=C${PRIMEIRA_LINHA_DE_DADO + n + 1}*${VALOR_DA_DIARIA}`,
    ]),
  ];
  conteudo[0][COLUNA_DOS_CALCULOS] = 'Cálculos';
  ROTULOS_DOS_CALCULOS.forEach((rotulo, i) => {
    const linha = PRIMEIRA_LINHA_DE_CALCULO + i;
    conteudo[linha] = conteudo[linha] ?? [];
    conteudo[linha][COLUNA_DOS_CALCULOS] = rotulo;
  });
  return planilhaDe('Inscrições', conteudo, { tabela: TABELA_DOS_INSCRITOS });
}

/**
 * A aba de inscrições como o módulo 1 a deixa: colunas com tamanho, título
 * mesclado e centralizado, cabeçalho em negrito.
 *
 * O módulo 2 parte **daqui**, e não da versão bagunçada: começar a segunda
 * lição mandando refazer a primeira ensinaria que o trabalho anterior não
 * conta. É a razão de o ponto de partida vir da lição e não da pasta.
 */
export function abaDeInscricoesArrumada(): Planilha {
  const larguraQueCabe = INSCRITOS.reduce((a, i) => Math.max(a, i.nome.length), 0) * 7 + 10;
  const p = comCelulas(abaDeInscricoes(), (cel, l, c) => {
    if (l === LINHA_DO_TITULO && c === 0) return { ...cel, span: 4, h: 'centro', v: 'meio' };
    if (l === LINHA_DO_CABECALHO && c <= 3) return { ...cel, negrito: true, h: 'centro' };
    return cel;
  });
  return {
    ...p,
    larguras: p.larguras.map((w, c) => (c === 0 ? larguraQueCabe : w)),
    alturas: p.alturas.map((h, l) => (l === LINHA_DO_TITULO ? ALTURA_PADRAO + 14 : h)),
  };
}

/** A aba de custos: o valor da diária mora numa célula só, e é ela que o `$` trava. */
export function abaDeCustos(): Planilha {
  return planilhaDe('Custos', [
    ['Valor da diária', String(VALOR_DA_DIARIA)],
    [],
    ['Nome', 'Diárias', 'A pagar'],
    ...INSCRITOS.map(i => [i.nome, String(i.diarias)]),
  ]);
}

/** A aba de unidades: a tabela de procura e as duas colunas a preencher. */
export function abaDeUnidades(): Planilha {
  const conteudo: string[][] = [
    ['Nome', 'Unidade', 'Diárias', 'Conselheiro', 'Almoça no domingo?', '', 'Unidade', 'Conselheiro'],
    ...INSCRITOS.map(i => [i.nome, i.unidade, String(i.diarias)]),
  ];
  CONSELHEIROS.forEach(([unidade, conselheiro], i) => {
    conteudo[1 + i][6] = unidade;
    conteudo[1 + i][7] = conselheiro;
  });
  return planilhaDe('Unidades', conteudo);
}

/** A aba de orçamento: as categorias e os três meses, sem nenhum total. */
export const CATEGORIAS = ['Alimentação', 'Transporte', 'Material', 'Premiação'];
export const MESES = ['Março', 'Abril', 'Maio'];
export const GASTOS: number[][] = [
  [820, 910, 1180],
  [430, 430, 610],
  [260, 140, 95],
  [0, 0, 340],
];

export function abaDeOrcamento(): Planilha {
  return planilhaDe('Orçamento', [
    ['Orçamento do acampamento'],
    ['Categoria', ...MESES, 'Total'],
    ...CATEGORIAS.map((nome, i) => [nome, ...GASTOS[i].map(String)]),
    ['Total'],
  ]);
}

/*
  A aba de conferência, com exatamente três defeitos e nenhum a mais.

  Três é o que o requisito 7 pede, e um quarto defeito acidental tornaria a
  lição impossível de fechar sem que nada na tela explicasse por quê — que é
  pior do que um laboratório que abre resolvido. `planilhaDefeituosa.test.ts`
  confere que são três, e quais.
*/
export const LINHA_DO_TEXTO_DISFARCADO = 5;
export const LINHA_DO_TOTAL_CONFERIR = 15;

export function abaDeConferencia(): Planilha {
  const conteudo: string[][] = [
    ['Conferência da tesouraria'],
    ['Nome', 'Unidade', 'Diárias', 'Valor'],
    ...INSCRITOS.map(i => [i.nome, i.unidade, String(i.diarias), String(i.diarias * VALOR_DA_DIARIA)]),
  ];
  /* 1. O número guardado como texto: o apóstrofo não aparece na célula. */
  conteudo[LINHA_DO_TEXTO_DISFARCADO][3] = `'${INSCRITOS[LINHA_DO_TEXTO_DISFARCADO - PRIMEIRA_LINHA_DE_DADO].diarias * VALOR_DA_DIARIA}`;

  conteudo[LINHA_DO_TOTAL_CONFERIR] = [
    'Total arrecadado', '', '',
    /* 2. A fórmula quebrada: alguém excluiu uma coluna e a planilha escreveu
          `#REF!` dentro da própria fórmula, que é o que ela faz de verdade. */
    '=SOMA(#REF!)',
  ];
  /* 3. O total digitado à mão: plausível, parado, e errado no dia seguinte. */
  conteudo[LINHA_DO_TOTAL_CONFERIR + 1] = ['Total de diárias', '', String(TOTAL_DE_DIARIAS)];

  return planilhaDe('Conferir', conteudo, {
    tabela: { l1: LINHA_DO_CABECALHO, c1: 0, l2: ULTIMA_LINHA_DE_DADO, c2: 3 },
  });
}

/**
 * A pasta de trabalho inteira, com a aba pedida à frente.
 *
 * Toda lição enxerga as cinco abas, e não só a sua: é uma planilha do clube, e
 * a fileira de abas é a peça que mais diz isso. Esconder as outras faria cada
 * lição parecer um arquivo diferente, que é justamente o que esta decisão
 * evita.
 */
export function cadernoDoClube(ativa = 0): Caderno {
  return {
    planilhas: [abaDeInscricoes(), abaDeCustos(), abaDeUnidades(), abaDeOrcamento(), abaDeConferencia()],
    ativa,
  };
}

export const ABAS = ['Inscrições', 'Custos', 'Unidades', 'Orçamento', 'Conferir'] as const;
export const indiceDaAba = (nome: (typeof ABAS)[number]) => ABAS.indexOf(nome);

/* ── O que uma lição cobra ────────────────────────────────────────────────── */

/**
 * Uma tarefa de laboratório da CC-ES003.
 *
 * `feita` recebe a **pasta inteira**, e não a aba da vez, por duas razões. A
 * tarefa continua valendo depois de a pessoa trocar de aba — senão trocar de
 * aba apagaria o progresso da lista, sem nada explicando. E a lição do
 * orçamento fala de duas coisas que moram em lugares diferentes da mesma
 * pasta.
 */
export interface MetaDaPlanilha {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na janela do Excel, o caminho até esta tarefa começa. */
  onde: string;
  passos: string[];
  feita: (cad: Caderno) => boolean;
}

/** A aba com este nome, ou uma vazia — nunca `undefined`, para a meta não estourar. */
export const abaDe = (cad: Caderno, nome: string): Planilha =>
  cad.planilhas.find(p => p.nome === nome) ?? planilhaDe(nome, []);

/** Troca a aba de nome igual pela versão dada. */
export const comAba = (cad: Caderno, p: Planilha): Caderno =>
  ({ ...cad, planilhas: cad.planilhas.map(q => (q.nome === p.nome ? p : q)) });
