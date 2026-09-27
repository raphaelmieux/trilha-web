/**
 * O que cada lição da CC-ES008 cobra.
 *
 * Num arquivo só, como `metasDaCcEs007.ts`, `metasDaCcEs006.ts` e
 * `metasDaCcEs005.ts`. Os programas são **três** — o construtor de
 * formulários, a planilha e o editor de texto simples do requisito 5.4 — e o
 * contexto é um: o formulário e a pasta de trabalho viajam juntos porque as
 * respostas de um **são** a base de dados do outro. Dois contextos separados
 * obrigariam a lição da importação a inventar de onde os dados vieram, que é
 * justamente o que esta vereda ensina a não fazer.
 *
 * O registro mora **fora do teste**, como o de planilha, o de PDF, o de nuvem e
 * o de comunicação: quem o lê é a tela, que monta a lição, **e** a trava, que
 * confere que nenhuma meta abre verde. Escrito só na trava, a tela repetiria a
 * escolha e as duas divergiriam na primeira lição nova, com a trava continuando
 * verde conferindo uma lição que a tela não abre.
 *
 * ── As metas de preservação são condição, e não item da lista ────────────
 * "As dezesseis respostas continuam lá", "a base não foi mexida" — as duas são
 * verdadeiras antes de alguém fazer qualquer coisa, e como item da lista
 * ensinariam a não ler a lista. Cada uma viaja conjugada com a meta que de fato
 * pede um gesto, de modo que o caminho rápido e errado deixa **aquela** meta
 * vermelha. É a decisão de "sem alterar uma palavra do texto" na CC-ES002.
 */

import {
  type Campo, type Formulario,
  CAMPO_DIARIAS, CAMPO_UNIDADE, ROTULO_DO_INSTANTE, UNIDADES,
  cabecalhoDe, campoPorId, camposComValidacao, camposObrigatorios,
  formularioDeInscricao, linhasDe, paraComparar, respostasReais, temOpcoes, tiposUsados,
} from './formulario';
import {
  type Caderno, type Faixa, type Planilha,
  ROTULO_VAZIO, resumoEmDia,
} from './planilha';
import { abaDe, escritoEm, planilhaDe } from './cadernoDoClube';

/* ── A forma de uma meta ──────────────────────────────────────────────────── */

export interface Meta {
  id: string;
  titulo: string;
  /** Por que isto importa. Uma ou duas frases, do jeito que se fala com alguém de dez anos. */
  detalhe: string;
  /** Onde, no programa, este gesto acontece. */
  onde: string;
  /** O passo a passo, para quem travar. Convite, e não despejo. */
  passos: string[];
  feita: (c: ContextoDeDados) => boolean;
}

/* ── O contexto ───────────────────────────────────────────────────────────── */

export interface ContextoDeDados {
  formulario: Formulario;
  /**
   * O formulário de quando a lição abriu.
   *
   * É a mesma razão de a CC-ES001 carregar o disco de agora e o de quando
   * abriu, e de a CC-ES005 carregar os dois cofres: saber o que **mudou** é
   * outra pergunta que saber o que está lá. Aqui ela responde à meta que
   * importa mais nesta vereda — as respostas que já estavam continuam lá? —,
   * porque apagar o que incomoda é o caminho rápido de toda lição daqui.
   */
  formularioAntes: Formulario;
  caderno: Caderno;
  cadernoAntes: Caderno;
  /**
   * O que a pessoa viu, e que não deixa marca em campo nenhum.
   *
   * É a família das quatro verificações do Explorador que só existem como
   * gesto: ver o formulário recusar o envio, ver o resumo relatar dez unidades
   * onde há seis, ver o grupo vazio. Nenhuma muda um byte, e todas são o que o
   * requisito manda demonstrar.
   */
  descobertas: string[];
}

const viu = (c: ContextoDeDados, o: string) => c.descobertas.includes(o);

/** As respostas que já estavam lá quando a lição abriu continuam todas lá. */
const respostasPreservadas = (c: ContextoDeDados): boolean => {
  const agora = new Set(respostasReais(c.formulario).map(r => r.id));
  return respostasReais(c.formularioAntes).every(r => agora.has(r.id));
};

/* ── A pasta de trabalho ──────────────────────────────────────────────────── */

export const ABA_RESPOSTAS = 'Respostas';
export const ABA_RELATORIO = 'Relatório';
export const ABA_AGENDA = 'Agenda';

export const LINHA_DO_CABECALHO_IMPORTADO = 1;

/**
 * A pasta de trabalho como ela chega do "Criar planilha".
 *
 * E ela chega **misturada**, que é o requisito 3 inteiro: quem importou
 * "arrumou" a aba — pôs um título em cima do cabeçalho e um TOTAL embaixo dos
 * registros. As duas coisas são de relatório, e dentro da base elas custam:
 * o título empurra o cabeçalho para a segunda linha, e o TOTAL entra em toda
 * conta como se fosse um décimo sétimo inscrito.
 *
 * Chegar limpa faria a lição do módulo 3 medir ter clicado em Importar.
 */
export function cadernoDeDados(respostas: Formulario): Caderno {
  const cabecalho = cabecalhoDe(respostas);
  const linhas = linhasDe(respostas);
  const total = linhas.reduce((s, l) => s + (Number(l[4]?.replace(',', '.')) || 0), 0);

  const conteudo: string[][] = [
    ['Inscrições do acampamento de inverno'],
    cabecalho,
    ...linhas,
    [],
    ['TOTAL', '', '', '', String(total)],
  ];

  return {
    planilhas: [
      planilhaDe(ABA_RESPOSTAS, conteudo, {
        /*
          A tabela declarada começa no título, e não no cabeçalho — que é o que
          quem importou deixou para trás, e é o que a lição manda consertar.
          Declará-la já no lugar certo entregaria metade do módulo 3.
        */
        tabela: { l1: 0, c1: 0, l2: 2 + linhas.length, c2: cabecalho.length - 1 },
      }),
      planilhaDe(ABA_RELATORIO, []),
    ],
    ativa: 0,
  };
}

/** A faixa que a tabela de respostas **deveria** ter: do cabeçalho ao último registro. */
export function faixaDaBase(c: ContextoDeDados): Faixa {
  const linhas = respostasReais(c.formulario).length;
  const colunas = cabecalhoDe(c.formulario).length;
  return { l1: 0, c1: 0, l2: linhas, c2: colunas - 1 };
}

const aba = (c: ContextoDeDados, nome: string) => abaDe(c.caderno, nome);

/** A primeira linha escrita de uma aba, sem contar as vazias. */
const primeiraLinhaEscrita = (p: Planilha): number =>
  p.celulas.findIndex(linha => linha.some(cel => cel.texto.trim() !== ''));

/** Quantas linhas de registro a aba de respostas tem, contadas do cabeçalho. */
function registrosNaAba(p: Planilha, colunas: number): string[][] {
  const inicio = primeiraLinhaEscrita(p);
  if (inicio < 0) return [];
  const fora: string[][] = [];
  for (let l = inicio + 1; l < p.celulas.length; l++) {
    const linha = Array.from({ length: colunas }, (_, c) => escritoEm(p, l, c));
    if (linha.every(v => !v)) break;
    fora.push(linha);
  }
  return fora;
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — Registro, campo e tipo (requisitos 2.1, 2.2 e 4)
   ──────────────────────────────────────────────────────────────────────── */

const campoDe = (c: ContextoDeDados, id: string): Campo | undefined =>
  campoPorId(c.formulario, id);

export const METAS_DOS_CAMPOS: Meta[] = [
  {
    id: 'tres-tipos',
    titulo: 'Três tipos de resposta diferentes no formulário',
    detalhe: 'O requisito conta tipos, e não campos: cinco perguntas de resposta curta são cinco campos e um tipo só.',
    onde: 'No menu de tipo dentro de cada cartão de pergunta.',
    passos: [
      'Clique no cartão da pergunta que você quer mudar.',
      'Abra o menu de tipo, à direita do rótulo.',
      'Escolha o tipo que combina com o que aquela pergunta pede.',
    ],
    feita: c => tiposUsados(c.formulario).length >= 3 && respostasPreservadas(c),
  },
  {
    id: 'unidade-em-lista',
    titulo: 'A unidade vem de uma lista, e não de texto livre',
    detalhe: 'Em texto livre cada família escreve a unidade como quiser — e foi assim que o Falcão virou quatro unidades diferentes.',
    onde: 'No cartão da pergunta "Unidade".',
    passos: [
      'Abra o menu de tipo no cartão da Unidade.',
      'Escolha Lista suspensa ou Múltipla escolha.',
      'Escreva as seis unidades do clube como opções.',
    ],
    feita: (c) => {
      const campo = campoDe(c, CAMPO_UNIDADE);
      if (!campo || !temOpcoes(campo.tipo)) return false;
      const opcoes = (campo.opcoes ?? []).map(paraComparar);
      return UNIDADES.every(u => opcoes.includes(paraComparar(u))) && respostasPreservadas(c);
    },
  },
  {
    id: 'diarias-numero',
    titulo: 'A quantidade de diárias é um número',
    detalhe: 'O tipo diz o que cabe na resposta. Quantidade que chega como texto não entra em conta nenhuma depois.',
    onde: 'No cartão da pergunta "Quantas diárias".',
    passos: [
      'Abra o menu de tipo no cartão das diárias.',
      'Escolha Número.',
    ],
    feita: c => campoDe(c, CAMPO_DIARIAS)?.tipo === 'numero' && respostasPreservadas(c),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — Obrigatório e validação (requisitos 2.4 e 4)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_A_RECUSA = 'viu-o-formulario-recusar';

export const METAS_DA_VALIDACAO: Meta[] = [
  {
    id: 'um-obrigatorio',
    titulo: 'Pelo menos um campo obrigatório',
    detalhe: 'Campo obrigatório é o que o formulário não deixa passar em branco daqui para a frente.',
    onde: 'No pé do cartão da pergunta, no interruptor "Obrigatório".',
    passos: [
      'Escolha a pergunta cuja resposta o clube não pode ficar sem.',
      'Ligue o interruptor "Obrigatório" no pé do cartão.',
    ],
    feita: c => camposObrigatorios(c.formulario).length >= 1 && respostasPreservadas(c),
  },
  {
    id: 'uma-validacao',
    titulo: 'Pelo menos um campo com validação que recusa de verdade',
    detalhe: 'Regra sem o número que ela precisa aceita tudo: "entre" com os dois campos em branco é "entre zero e zero".',
    onde: 'No menu de três pontos do cartão, em "Validação de resposta".',
    passos: [
      'Abra o menu de três pontos no pé do cartão.',
      'Escolha "Validação de resposta".',
      'Escolha a regra e escreva o que ela precisa saber.',
    ],
    feita: c => camposComValidacao(c.formulario).length >= 1 && respostasPreservadas(c),
  },
  {
    id: 'viu-a-recusa',
    titulo: 'Viu o formulário recusar uma resposta',
    detalhe: 'Interruptor que você liga e nunca vê agir é interruptor que pode não estar fazendo nada.',
    onde: 'Em Visualizar, respondendo como uma família responderia.',
    passos: [
      'Clique em Visualizar, no alto.',
      'Deixe o campo obrigatório em branco, ou escreva um e-mail sem arroba.',
      'Clique em Enviar e leia o que aparece embaixo do campo.',
    ],
    feita: c => viu(c, VIU_A_RECUSA),
  },
  {
    id: 'uma-resposta-nova',
    titulo: 'Uma resposta nova entrou pela porta da frente',
    detalhe: 'O formulário só está pronto quando uma resposta boa atravessa as regras que você acabou de escrever.',
    onde: 'Em Visualizar, com tudo preenchido do jeito que as regras pedem.',
    passos: [
      'Continue em Visualizar.',
      'Preencha tudo o que as regras pedem.',
      'Clique em Enviar — a contagem na aba Respostas sobe.',
    ],
    feita: c =>
      respostasReais(c.formulario).length > respostasReais(c.formularioAntes).length
      && respostasPreservadas(c),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — Base de dados e relatório (requisitos 3, 5.1 e 2.3)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DA_BASE: Meta[] = [
  {
    id: 'base-abre-no-cabecalho',
    titulo: 'A base começa no cabeçalho',
    detalhe: 'Título solto em cima empurra o cabeçalho para a segunda linha, e aí quem procura a primeira coluna acha o título.',
    onde: 'Na aba Respostas, na primeira linha da planilha.',
    passos: [
      'Clique na linha do título, acima do cabeçalho.',
      'Exclua a linha inteira, e não só o texto dela.',
      'Confira que "Enviado em" ficou na primeira linha.',
    ],
    feita: (c) => {
      const p = aba(c, ABA_RESPOSTAS);
      return escritoEm(p, 0, 0) === ROTULO_DO_INSTANTE && naBaseSoDado(c);
    },
  },
  {
    id: 'base-sem-total',
    titulo: 'Nenhum total dentro da base',
    detalhe: 'O TOTAL é uma linha como as outras para quem lê a tabela: ele entra na contagem como se fosse mais um inscrito.',
    onde: 'Na aba Respostas, abaixo do último registro.',
    passos: [
      'Ache a linha do TOTAL, embaixo dos registros.',
      'Exclua a linha.',
      'A conta dele vai para a aba Relatório, no próximo passo.',
    ],
    feita: (c) => {
      const p = aba(c, ABA_RESPOSTAS);
      const tem = p.celulas.some(linha =>
        linha.some(cel => paraComparar(cel.texto).startsWith('total')));
      return !tem && naBaseSoDado(c);
    },
  },
  {
    id: 'total-no-relatorio',
    titulo: 'O total mora na aba Relatório',
    detalhe: 'A base guarda o que foi coletado; o relatório mostra o que se conclui dela. São duas coisas, e por isso são duas abas.',
    onde: 'Na aba Relatório, no pé da janela.',
    passos: [
      'Clique na aba Relatório.',
      'Escreva um rótulo e a fórmula que soma a coluna de diárias da aba Respostas.',
    ],
    feita: (c) => {
      const r = aba(c, ABA_RELATORIO);
      return r.celulas.some(linha => linha.some(cel =>
        cel.texto.trimStart().startsWith('=') && cel.texto.includes(ABA_RESPOSTAS)));
    },
  },
  {
    id: 'faixa-da-tabela',
    titulo: 'A tabela declarada cobre o cabeçalho e os registros, e nada mais',
    detalhe: 'É essa faixa que o resumo e a ordenação leem. Sobrando o título ou o TOTAL dentro dela, eles entram na conta como se fossem respostas.',
    onde: 'Na aba Respostas, selecionando do cabeçalho até o último registro.',
    passos: [
      'Clique no cabeçalho e arraste até a última linha com dado.',
      'Confira que nada acima nem abaixo ficou dentro da seleção.',
    ],
    feita: (c) => {
      const p = aba(c, ABA_RESPOSTAS);
      const esperada = faixaDaBase(c);
      const f = p.tabela;
      return !!f
        && f.l1 === esperada.l1 && f.l2 === esperada.l2
        && f.c1 === esperada.c1 && f.c2 === esperada.c2
        && naBaseSoDado(c);
    },
  },
];

/**
 * A base continua sendo só dado: um cabeçalho e um registro por linha.
 *
 * É a condição conjugada das metas do módulo 3, e não um item da lista — ela é
 * verdadeira depois de cada conserto e nunca é o gesto. O que ela impede é o
 * caminho rápido: apagar as linhas que incomodam em vez de tirar as que não são
 * dado. Sem ela, excluir a base inteira deixaria três metas verdes de uma vez.
 */
function naBaseSoDado(c: ContextoDeDados): boolean {
  const p = aba(c, ABA_RESPOSTAS);
  const registros = registrosNaAba(p, cabecalhoDe(c.formulario).length);
  return registros.length >= respostasReais(c.formularioAntes).length;
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — O resumo (requisito 5.3)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_GRUPOS_DEMAIS = 'viu-dez-onde-ha-seis';
export const VIU_O_GRUPO_VAZIO = 'viu-o-grupo-vazio';

export const METAS_DO_RESUMO: Meta[] = [
  {
    id: 'criou-o-resumo',
    titulo: 'Um resumo por unidade, na aba Relatório',
    detalhe: 'Resumo é o que responde "quantos por unidade" sem você contar na mão.',
    onde: 'Na aba Relatório, no botão Tabela dinâmica.',
    passos: [
      'Selecione a tabela na aba Respostas.',
      'Clique em Tabela dinâmica.',
      'Ponha a Unidade nas linhas e a contagem nos valores.',
    ],
    feita: (c) => {
      const r = aba(c, ABA_RELATORIO);
      return !!r.resumo && r.resumo.origem.planilha === ABA_RESPOSTAS && baseIntocada(c);
    },
  },
  {
    id: 'viu-grupos-demais',
    titulo: 'Viu o resumo relatar mais unidades do que o clube tem',
    detalhe: 'O clube tem seis unidades. Se o resumo mostra mais, não é o clube que cresceu: é a mesma unidade escrita de jeitos diferentes.',
    onde: 'No resumo, na coluna de unidades.',
    passos: [
      'Conte as linhas do resumo.',
      'Compare com as seis unidades do clube.',
      'Olhe as que se parecem: elas são a mesma, escrita de outro jeito.',
    ],
    feita: c => viu(c, VIU_GRUPOS_DEMAIS) && baseIntocada(c),
  },
  {
    id: 'viu-o-grupo-vazio',
    titulo: 'Viu o grupo sem nome',
    detalhe: 'A linha escrita "(vazio)" é quem não respondeu aquela pergunta. Ela conta no total e não pertence a unidade nenhuma.',
    onde: 'No resumo, entre as outras linhas.',
    passos: [
      'Procure no resumo a linha escrita "(vazio)".',
      'Veja quantas respostas ela junta.',
    ],
    feita: c => viu(c, VIU_O_GRUPO_VAZIO) && baseIntocada(c),
  },
];

/**
 * A base não foi mexida.
 *
 * Condição conjugada das metas do módulo 4, pela razão de sempre: ela é
 * verdadeira no segundo zero. E aqui ela guarda uma coisa a mais — consertar a
 * grafia **agora** apagaria o que o resumo existe para mostrar, e as três metas
 * ficariam verdes sem ninguém ter visto nada. O conserto é o módulo 5.
 */
function baseIntocada(c: ContextoDeDados): boolean {
  const agora = aba(c, ABA_RESPOSTAS);
  const antes = abaDe(c.cadernoAntes, ABA_RESPOSTAS);
  const colunas = cabecalhoDe(c.formulario).length;
  const unidades = (p: Planilha) =>
    registrosNaAba(p, colunas).map(l => l[2]).filter(v => v !== '');
  return unidades(agora).join('\u0000') === unidades(antes).join('\u0000');
}

/* ── O registro das lições ───────────────────────────────────────────────── */

export type ProgramaDaCcEs008 = 'formulario' | 'planilha' | 'texto';

export type LicaoDaCcEs008 = 'campos' | 'validacao' | 'base' | 'resumo';

export interface LicaoDeDados {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs008;
  inicial: () => ContextoDeDados;
  metas: Meta[];
}

/** O contexto do módulo 1: o formulário como ele chega, e nenhuma planilha ainda. */
function doZero(formulario: Formulario): ContextoDeDados {
  return {
    formulario,
    formularioAntes: formulario,
    caderno: { planilhas: [planilhaDe(ABA_RESPOSTAS, []), planilhaDe(ABA_RELATORIO, [])], ativa: 0 },
    cadernoAntes: { planilhas: [planilhaDe(ABA_RESPOSTAS, []), planilhaDe(ABA_RELATORIO, [])], ativa: 0 },
    descobertas: [],
  };
}

/** E o dos módulos de planilha: a pasta já importada, misturada como ela chega. */
function comCaderno(formulario: Formulario): ContextoDeDados {
  const caderno = cadernoDeDados(formulario);
  return { ...doZero(formulario), caderno, cadernoAntes: caderno };
}

/**
 * Cada lição parte de um **estado** do formulário e da pasta.
 *
 * O módulo 2 recebe o formulário com os tipos já arrumados pelo módulo 1, e o
 * módulo 4 recebe a base já limpa pelo módulo 3. Começar a segunda lição
 * mandando refazer a primeira ensinaria que o trabalho anterior não conta — é o
 * campo `documento` da CC-ES002, o `caderno` da CC-ES003 e a `pasta` da
 * CC-ES004, pelo motivo escrito nos três.
 *
 * E é um `Record` sobre a união: a quinta lição não compila até alguém dizer de
 * que estado ela parte e o que ela cobra.
 */
export const LICOES_DA_CC_ES008: Record<LicaoDaCcEs008, LicaoDeDados> = {
  campos: {
    programa: 'formulario',
    inicial: () => doZero(FORMULARIO_COMO_CHEGA()),
    metas: METAS_DOS_CAMPOS,
  },
  validacao: {
    programa: 'formulario',
    inicial: () => doZero(comTiposArrumados(FORMULARIO_COMO_CHEGA())),
    metas: METAS_DA_VALIDACAO,
  },
  base: {
    programa: 'planilha',
    inicial: () => comCaderno(comTiposArrumados(FORMULARIO_COMO_CHEGA())),
    metas: METAS_DA_BASE,
  },
  resumo: {
    programa: 'planilha',
    inicial: () => {
      const c = comCaderno(comTiposArrumados(FORMULARIO_COMO_CHEGA()));
      const limpa = baseArrumada(c);
      return { ...c, caderno: limpa, cadernoAntes: limpa };
    },
    metas: METAS_DO_RESUMO,
  },
};

export const contextoDa = (l: LicaoDaCcEs008): ContextoDeDados =>
  LICOES_DA_CC_ES008[l].inicial();

/* ── Os estados de partida ───────────────────────────────────────────────── */

export const FORMULARIO_COMO_CHEGA = formularioDeInscricao;

/** O formulário depois do módulo 1: a unidade em lista e as diárias em número. */
export function comTiposArrumados(f: Formulario): Formulario {
  return {
    ...f,
    campos: f.campos.map((campo) => {
      if (campo.id === CAMPO_UNIDADE) {
        return { ...campo, tipo: 'lista' as const, opcoes: [...UNIDADES] };
      }
      if (campo.id === CAMPO_DIARIAS) return { ...campo, tipo: 'numero' as const };
      return campo;
    }),
  };
}

/** A pasta depois do módulo 3: sem título solto, sem total dentro, e com a faixa certa. */
export function baseArrumada(c: ContextoDeDados): Caderno {
  const cabecalho = cabecalhoDe(c.formulario);
  const linhas = linhasDe(c.formulario);
  const respostas = planilhaDe(ABA_RESPOSTAS, [cabecalho, ...linhas], {
    tabela: { l1: 0, c1: 0, l2: linhas.length, c2: cabecalho.length - 1 },
  });
  const total = linhas.reduce((s, l) => s + (Number(l[4]?.replace(',', '.')) || 0), 0);
  const relatorio = planilhaDe(ABA_RELATORIO, [
    ['Diárias somadas', `=SOMA(${ABA_RESPOSTAS}!E2:E${linhas.length + 1})`],
    ['', String(total)],
  ]);
  return { planilhas: [respostas, relatorio], ativa: 0 };
}

/** O rótulo com que o resumo do módulo 4 nasce, para a trava e a tela concordarem. */
export const GRUPOS_QUE_O_RESUMO_RELATA = (c: ContextoDeDados): string[] => {
  const r = aba(c, ABA_RELATORIO);
  return r.resumo ? r.resumo.retrato.map(l => l.rotulo) : [];
};

export const resumoDesatualizado = (c: ContextoDeDados): boolean => {
  const r = aba(c, ABA_RELATORIO);
  return !!r.resumo && !resumoEmDia(c.caderno, r.resumo);
};

export const temGrupoVazio = (c: ContextoDeDados): boolean =>
  GRUPOS_QUE_O_RESUMO_RELATA(c).includes(ROTULO_VAZIO);
