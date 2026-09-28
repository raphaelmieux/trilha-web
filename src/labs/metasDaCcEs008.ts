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
  CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_UNIDADE, ROTULO_DO_INSTANTE, UNIDADES,
  cabecalhoDe, campoPorId, camposComValidacao, camposObrigatorios, comCampo,
  formularioDeInscricao, linhasDe, paraComparar, respostasReais, temOpcoes, tiposUsados,
} from './formulario';
import {
  type Caderno, type Faixa, type Planilha,
  type TabelaDinamica,
  ROTULO_VAZIO, atualizarResumo, resumir, resumoEmDia, valorCalculado,
} from './planilha';
import { LISTA_DO_CLUBE } from './metasDaAp044';
import { toCsv } from '../lib/csv';
import { abaDe, comAba, escritoEm, planilhaDe } from './cadernoDoClube';

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
  /**
   * O CSV exportado, como texto.
   *
   * Ele mora no contexto e não num campo da planilha porque o arquivo **saiu**
   * dela: a partir da exportação ele é outra coisa, que não se refaz quando a
   * planilha muda. É o retrato do PDF da CC-ES004 e o do sumário do Word, na
   * terceira roupa — e é isso que o requisito 5.4 manda abrir no editor.
   */
  csv: string | null;
  /** As perguntas que a pessoa marcou como dado pessoal, no módulo 8. */
  pessoaisMarcados: string[];
  /** Os cuidados que ela escolheu. */
  cuidadosEscolhidos: string[];
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
/**
 * O relatório ordenado tem aba própria.
 *
 * Vinte e cinco linhas mais cabeçalho não cabem embaixo do resumo numa grade de
 * vinte e seis — e foi assim que descobri, com a solução de referência perdendo
 * as últimas pessoas em silêncio. Mas o motivo de ficar assim é outro, e melhor:
 * uma aba por artefato é o requisito 3 desta vereda aplicado a ela mesma.
 */
export const ABA_AGENDA_ORDENADA = 'Agenda em ordem';

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

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — Consertar o preenchimento (requisito 5.2)
   ──────────────────────────────────────────────────────────────────────── */

const COLUNA_DA_UNIDADE = 2;
const COLUNA_DAS_DIARIAS = 4;

/** O que a coluna de unidades tem de escrito, registro a registro. */
const unidadesNaBase = (c: ContextoDeDados): string[] =>
  registrosNaAba(aba(c, ABA_RESPOSTAS), cabecalhoDe(c.formulario).length)
    .map(l => l[COLUNA_DA_UNIDADE]);

export const METAS_DO_CONSERTO: Meta[] = [
  {
    id: 'uma-grafia-por-unidade',
    titulo: 'Cada unidade escrita de um jeito só',
    detalhe: 'O Falcão está escrito de quatro jeitos e a Águia de dois. Para quem lê a tabela, são seis unidades diferentes.',
    onde: 'Na aba Respostas, na coluna Unidade.',
    passos: [
      'Olhe a coluna Unidade e ache as que se parecem.',
      'Escreva todas do mesmo jeito que a lista do formulário escreve.',
      'Repare no espaço atrás: ele não se vê, e conta como outra grafia.',
    ],
    feita: (c) => {
      const escritas = unidadesNaBase(c).filter(v => v.trim());
      if (!escritas.length) return false;
      const certas = new Set(UNIDADES);
      return escritas.every(v => certas.has(v)) && registrosPreservados(c);
    },
  },
  {
    id: 'sem-branco-na-unidade',
    titulo: 'Ninguém sem unidade',
    detalhe: 'A linha sem unidade é a que o resumo chama de "(vazio)". Ela conta no total e não pertence a unidade nenhuma.',
    onde: 'Na aba Respostas, na linha que está em branco.',
    passos: [
      'Ache a linha cuja Unidade está vazia.',
      'Descubra de que unidade a pessoa é e escreva.',
      'Apagar a linha não vale: você perderia um inscrito.',
    ],
    feita: c => unidadesNaBase(c).every(v => v.trim() !== '') && registrosPreservados(c),
  },
  {
    id: 'diarias-sao-numero',
    titulo: 'Toda diária é número para a planilha',
    detalhe: 'Duas famílias escreveram com ponto, e aqui o separador decimal é a vírgula: aquilo é texto, e a soma pula.',
    onde: 'Na aba Respostas, na coluna Diárias.',
    passos: [
      'Olhe a coluna Diárias: as que estão encostadas à esquerda são texto.',
      'Troque o ponto pela vírgula.',
      'Confira a soma na aba Relatório: ela sobe.',
    ],
    feita: (c) => {
      const p = aba(c, ABA_RESPOSTAS);
      const registros = registrosNaAba(p, cabecalhoDe(c.formulario).length);
      if (!registros.length) return false;
      const todas = registros.every((_, i) =>
        valorCalculado(p, i + 1, COLUNA_DAS_DIARIAS).tipo === 'numero');
      return todas && registrosPreservados(c);
    },
  },
  {
    id: 'resumo-com-uma-linha-por-unidade',
    titulo: 'O resumo com uma linha por unidade, e nenhuma sem nome',
    detalhe: 'Tabela dinâmica não se refaz sozinha: ela guarda o que leu. Depois de consertar, ela continua relatando o erro até alguém mandar atualizar.',
    onde: 'Na aba Relatório, no botão Atualizar.',
    passos: [
      'Volte à aba Relatório e olhe o resumo: ele continua com as unidades de antes.',
      'Clique em Atualizar.',
      'Conte as linhas: agora são as seis unidades do clube, e nenhuma "(vazio)".',
    ],
    /*
      "O resumo está em dia" abriria **verde**: o módulo 4 acabou de montá-lo, e
      um retrato recém-tirado sempre confere com a origem. O que só é verdade
      depois de consertar **e** atualizar é ele relatar uma linha por unidade —
      atualizar sem consertar continua dando dez, e consertar sem atualizar deixa
      o retrato com as dez de antes. A conta exige os dois, e nenhum dos dois
      sozinho a fecha.
    */
    feita: (c) => {
      const r = aba(c, ABA_RELATORIO);
      if (!r.resumo) return false;
      const rotulos = r.resumo.retrato.map(l => l.rotulo);
      /*
        Só os rótulos, e não também `resumoEmDia`: a conta dele era **código
        morto** aqui. Um retrato com as seis unidades e nada mais só existe
        depois de consertar e atualizar, e nessa altura ele está em dia por
        construção — a mutação que apagou a chamada não derrubou teste nenhum,
        que foi como ela apareceu. É a decisão da célula vazia na formatação
        condicional da CC-ES003.
      */
      return rotulos.length === UNIDADES.length
        && rotulos.every(x => UNIDADES.includes(x))
        && registrosPreservados(c);
    },
  },
];

/**
 * Os registros que estavam na base continuam todos lá.
 *
 * Condição conjugada de cada meta do módulo 5, e a mais necessária desta
 * vereda: o caminho rápido de toda inconsistência é **apagar a linha**. Apagar
 * as quatro grafias esquisitas deixa a coluna impecável e o clube com doze
 * inscritos, e apagar a linha sem unidade resolve o grupo vazio perdendo um
 * desbravador. É "arrumar não é apagar" da CC-ES003, aplicado a quatro metas de
 * uma vez.
 */
function registrosPreservados(c: ContextoDeDados): boolean {
  const colunas = cabecalhoDe(c.formulario).length;
  const antes = registrosNaAba(abaDe(c.cadernoAntes, ABA_RESPOSTAS), colunas);
  const agora = registrosNaAba(aba(c, ABA_RESPOSTAS), colunas);
  if (agora.length < antes.length) return false;
  // E são as mesmas pessoas: trocar um nome por outro manteria a contagem.
  const nomes = new Set(agora.map(l => l[1]));
  return antes.every(l => nomes.has(l[1]));
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — CSV (requisitos 2.5 e 5.4)
   ──────────────────────────────────────────────────────────────────────── */

export const ABRIU_O_CSV = 'abriu-o-csv-no-editor';
export const VIU_AS_ASPAS = 'viu-as-aspas-em-volta-da-celula';

export const NOME_DO_CSV = 'inscricoes-2026-07-03-v01.csv';

export const METAS_DO_CSV: Meta[] = [
  {
    id: 'exportou',
    titulo: 'A base exportada em CSV',
    detalhe: 'CSV é a planilha sem planilha: só o texto, sem cor, sem fórmula e sem aba.',
    onde: 'Na planilha, em Salvar como, escolhendo CSV.',
    passos: [
      'Abra Salvar como.',
      'Escolha CSV e confirme.',
    ],
    feita: c => c.csv !== null,
  },
  {
    id: 'abriu-no-editor',
    titulo: 'O arquivo aberto no editor de texto',
    detalhe: 'É no editor de texto que se vê o que o CSV de fato é. A planilha esconde isso de propósito.',
    onde: 'No editor de texto simples, com o arquivo exportado.',
    passos: [
      'Abra o arquivo exportado no editor de texto.',
      'Leia a primeira linha: ela é o cabeçalho.',
      'Veja o que separa uma coluna da outra.',
    ],
    feita: c => viu(c, ABRIU_O_CSV) && c.csv !== null,
  },
  {
    id: 'fez-a-aspa-aparecer',
    titulo: 'Uma resposta com ponto e vírgula dentro, e o que o arquivo faz com ela',
    detalhe: 'O ponto e vírgula é o que separa as colunas. Quando ele aparece dentro de uma resposta, o arquivo põe aspas em volta dela — senão a linha inteira desandaria.',
    onde: 'Na aba Respostas, numa observação; depois exporte de novo.',
    passos: [
      'Escreva numa observação duas coisas separadas por ponto e vírgula.',
      'Exporte de novo em CSV.',
      'Abra no editor: aquela resposta está entre aspas.',
    ],
    feita: c => viu(c, VIU_AS_ASPAS) && (c.csv ?? '').includes('"'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — A agenda e o relatório ordenado (requisito 6)
   ──────────────────────────────────────────────────────────────────────── */

export const CABECALHO_DA_AGENDA = ['Nome', 'Telefone', 'Endereço', 'E-mail'] as const;

/**
 * A ordem em que as famílias entraram no clube.
 *
 * `LISTA_DO_CLUBE` está em ordem alfabética, e agenda que chega ordenada deixa
 * "gerar relatório ordenado" sem nada para ordenar — é a mesma razão pela qual a
 * tabela de procura da CC-ES003 não está em ordem alfabética: é assim que fica
 * toda lista digitada à mão, uma linha por vez, conforme as pessoas chegam.
 *
 * As pessoas continuam vindo de uma fonte só: o que se declara aqui é a
 * **ordem**, que é um dado sobre o clube, e não uma segunda cópia da lista.
 */
export const ORDEM_DE_ENTRADA = [
  7, 0, 19, 3, 11, 24, 5, 16, 1, 22, 9, 14, 2, 20, 8, 17, 4, 12, 23, 6, 15, 10, 21, 13, 18,
];

export const AGENDA_DO_CLUBE = (): string[][] =>
  ORDEM_DE_ENTRADA.map(i => LISTA_DO_CLUBE[i]).filter(Boolean);

const registrosDaAgenda = (c: ContextoDeDados): string[][] =>
  registrosNaAba(aba(c, ABA_AGENDA), CABECALHO_DA_AGENDA.length);

/** As linhas do relatório, lidas de onde ele foi montado. */
const linhasDoRelatorioDaAgenda = (c: ContextoDeDados): string[][] => {
  const r = aba(c, ABA_AGENDA_ORDENADA);
  const inicio = r.celulas.findIndex(linha => escritoTexto(linha) === CABECALHO_DA_AGENDA[0]);
  if (inicio < 0) return [];
  const fora: string[][] = [];
  for (let l = inicio + 1; l < r.celulas.length; l++) {
    const linha = Array.from({ length: CABECALHO_DA_AGENDA.length }, (_, col) => escritoEm(r, l, col));
    if (linha.every(v => !v)) break;
    fora.push(linha);
  }
  return fora;
};

const escritoTexto = (linha: { texto: string }[]) => (linha[0]?.texto ?? '').trim();

export const METAS_DA_AGENDA_DO_CLUBE: Meta[] = [
  {
    id: 'relatorio-ordenado',
    titulo: 'Um relatório com as vinte e cinco pessoas em ordem de nome',
    detalhe: 'A agenda guarda as pessoas na ordem em que entraram. O relatório é outra coisa: é a mesma gente numa ordem que serve para procurar.',
    onde: 'Na aba Agenda em ordem, no pé da janela.',
    passos: [
      'Copie o cabeçalho e as linhas da aba Agenda para a aba Agenda em ordem.',
      'Ordene pela coluna Nome, de A a Z.',
      'Confira que as vinte e cinco continuam lá.',
    ],
    feita: (c) => {
      const linhas = linhasDoRelatorioDaAgenda(c);
      if (linhas.length < AGENDA_DO_CLUBE().length) return false;
      const nomes = linhas.map(l => l[0]);
      const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      return nomes.join('\u0000') === ordenados.join('\u0000') && agendaNaOrdemDeEntrada(c);
    },
  },
  {
    id: 'linha-inteira',
    titulo: 'Cada pessoa com o telefone dela',
    detalhe: 'Ordenar só a coluna do nome embaralha o cadastro: o nome de um fica ao lado do telefone de outro, e nada avisa.',
    onde: 'Na aba Agenda em ordem, comparando uma linha com a da Agenda.',
    passos: [
      'Escolha uma pessoa no relatório.',
      'Ache a mesma pessoa na aba Agenda.',
      'Confira que o telefone, o endereço e o e-mail são os mesmos.',
    ],
    feita: (c) => {
      const daAgenda = new Map(AGENDA_DO_CLUBE().map(l => [l[0], l.join('\u0000')]));
      const linhas = linhasDoRelatorioDaAgenda(c);
      if (!linhas.length) return false;
      return linhas.every(l => daAgenda.get(l[0]) === l.join('\u0000'))
        && agendaNaOrdemDeEntrada(c);
    },
  },
];

/**
 * A agenda continua na ordem em que as famílias entraram.
 *
 * Condição conjugada das duas metas, e o caminho rápido que ela fecha é o mais
 * tentador de todos: ordenar a **própria** agenda em vez de produzir um
 * relatório. A lista sai em ordem alfabética, parece resolvido, e o que se
 * perdeu foi a ordem de entrada — que não tem cópia em lugar nenhum e não
 * volta. É o requisito 3 desta vereda caindo em cima do requisito 6: a base
 * guarda o que foi coletado, e quem muda de forma é o relatório.
 */
function agendaNaOrdemDeEntrada(c: ContextoDeDados): boolean {
  const esperada = AGENDA_DO_CLUBE().map(l => l[0]);
  const agora = registrosDaAgenda(c).map(l => l[0]);
  return agora.join('\u0000') === esperada.join('\u0000');
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 8 — Dado pessoal e a entrega (requisitos 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Este módulo é **tela da plataforma**, e não um programa imitado.
 *
 * Classificar e escolher não são gestos que o Google Forms ou o Excel tenham:
 * marcar "isto é dado pessoal" ao lado de uma pergunta é recurso que nenhum dos
 * dois oferece, e inventá-lo dentro da janela seria pôr coisa nossa dentro do
 * programa imitado — o contrário do que a moldura existe para fazer. O CLAUDE.md
 * já nomeia a saída: laboratório que não imita nada continua sendo tela da
 * plataforma, e ordenar, classificar e escrever são exatamente esses.
 */

export interface Cuidado {
  id: string;
  texto: string;
  certo: boolean;
  /** Por que a errada é errada. Só as erradas o têm, como nas alternativas das provas. */
  porque?: string;
}

/**
 * Os cuidados da guarda e do descarte, e as três que parecem cuidado e não são.
 *
 * As erradas não são bobagens: são as três coisas que alguém responderia de
 * primeira porque **soam** prudentes. Trocar a senha todo mês é higiene de conta
 * e não diz nada sobre onde este dado está; pôr senha no arquivo é a crença que
 * o requisito 7 da CC-ES004 existe para desfazer — quem sabe a senha salva sem
 * ela, e o arquivo circula aberto; e guardar tudo para sempre é o contrário de
 * descarte, vestido de precaução.
 */
export const CUIDADOS: Cuidado[] = [
  {
    id: 'so-quem-precisa',
    texto: 'Só quem precisa dos dados tem acesso à planilha — e lembrar que a pasta compartilhada abre o que está dentro dela.',
    certo: true,
  },
  {
    id: 'tira-a-copia',
    texto: 'Quando o trabalho acaba, o arquivo exportado sai da pasta de downloads, e da lixeira também.',
    certo: true,
  },
  {
    id: 'prazo-para-a-base',
    texto: 'A base tem prazo: acabado o acampamento, o que não serve mais se apaga.',
    certo: true,
  },
  {
    id: 'senha-todo-mes',
    texto: 'Trocar a senha da conta do clube todo mês.',
    certo: false,
    porque: 'É higiene da conta, e não cuidado com este dado: ele continua onde está, com quem já tem acesso.',
  },
  {
    id: 'senha-no-arquivo',
    texto: 'Pôr uma senha no arquivo da planilha.',
    certo: false,
    porque: 'Quem sabe a senha salva sem ela, e a partir daí o arquivo circula aberto. É o "não permitir copiar" da CC-ES004: pedido, e não trava.',
  },
  {
    id: 'guardar-para-sempre',
    texto: 'Guardar uma cópia de tudo para sempre, por segurança.',
    certo: false,
    porque: 'O requisito pede cuidado no descarte. Guardar para sempre é o contrário disso, e cada cópia é mais um lugar de onde o dado pode sair.',
  },
];

export const CUIDADOS_CERTOS = CUIDADOS.filter(x => x.certo).map(x => x.id);

export const METAS_DA_ENTREGA: Meta[] = [
  {
    id: 'classificou-os-pessoais',
    titulo: 'Marcou quais das perguntas coletam dado pessoal',
    detalhe: 'Dado pessoal é o que aponta para uma pessoa: o nome dela, como falar com ela, o que ela come. A unidade não aponta para ninguém.',
    onde: 'Na lista de perguntas, marcando uma por uma.',
    passos: [
      'Leia cada pergunta e pense: isto aponta para uma pessoa?',
      'Marque as que apontam.',
      'Marcar todas não vale: aí você não classificou, só marcou.',
    ],
    feita: (c) => {
      const esperados = c.formulario.campos.filter(x => x.pessoal).map(x => x.id).sort();
      const marcados = [...c.pessoaisMarcados].sort();
      /*
        Conjunto **igual**, e não conjunto que contém: exigir só que os
        verdadeiros estejam marcados deixaria "marque todas" passar com louvor,
        que é a decisão dos indícios da CC-ES005.
      */
      return esperados.join('\u0000') === marcados.join('\u0000') && aEntregaEstaDePe(c);
    },
  },
  {
    id: 'tres-cuidados',
    titulo: 'Escolheu três cuidados com a guarda e o descarte',
    detalhe: 'Três, e não quatro: escolher tudo não é escolher. E as três têm de ser cuidado com este dado, e não com a conta.',
    onde: 'Na lista de cuidados, abaixo das perguntas.',
    passos: [
      'Leia os seis e escolha três.',
      'Pergunte de cada um: isto muda onde este dado está, ou quem o alcança?',
    ],
    feita: (c) => {
      const escolhidos = [...c.cuidadosEscolhidos].sort();
      return escolhidos.join('\u0000') === [...CUIDADOS_CERTOS].sort().join('\u0000')
        && aEntregaEstaDePe(c);
    },
  },
  {
    id: 'descartou-a-copia',
    titulo: 'A cópia exportada saiu da pasta de downloads',
    detalhe: 'O CSV que você exportou é a base inteira em texto puro, sem senha e sem dono. Enquanto ele está lá, o descarte não aconteceu.',
    onde: 'Na pasta de downloads, no arquivo exportado.',
    passos: [
      'Ache o arquivo que você exportou.',
      'Apague, e apague da lixeira também.',
    ],
    feita: c => c.csv === null && aEntregaEstaDePe(c),
  },
];

/**
 * Os três artefatos do requisito 8 continuam de pé.
 *
 * Condição conjugada das três metas, e não item da lista: os três já estão
 * prontos quando o módulo 8 abre — foram os sete módulos anteriores que os
 * fizeram —, então como item ela abriria verde e ensinaria a não ler a lista.
 *
 * É a decisão do módulo 6 da CC-ES002, pelo motivo escrito lá: o que o requisito
 * 8 pede é a **entrega**, e garantir que as peças estão no lugar é trabalho da
 * trava do repositório, não de uma tarefa. O que ela impede aqui é o caminho
 * rápido do descarte: apagar a planilha junto com a cópia. O dado tem prazo, e o
 * prazo não é hoje — o relatório ainda vai ser entregue ao examinador.
 */
function aEntregaEstaDePe(c: ContextoDeDados): boolean {
  const formularioPronto = tiposUsados(c.formulario).length >= 3
    && camposObrigatorios(c.formulario).length >= 1
    && camposComValidacao(c.formulario).length >= 1
    && respostasReais(c.formulario).length >= 15;
  const base = registrosNaAba(aba(c, ABA_RESPOSTAS), cabecalhoDe(c.formulario).length);
  const temResumo = !!aba(c, ABA_RELATORIO).resumo;
  const temAgendaOrdenada = registrosNaAba(aba(c, ABA_AGENDA_ORDENADA), CABECALHO_DA_AGENDA.length)
    .length >= AGENDA_DO_CLUBE().length;
  return formularioPronto && base.length >= 15 && temResumo && temAgendaOrdenada;
}

/* ── O registro das lições ───────────────────────────────────────────────── */

export type ProgramaDaCcEs008 = 'formulario' | 'planilha' | 'texto' | 'plataforma';

export type LicaoDaCcEs008 =
  | 'campos' | 'validacao' | 'base' | 'resumo' | 'conserto' | 'csv' | 'agenda' | 'entrega';

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
    csv: null,
    pessoaisMarcados: [],
    cuidadosEscolhidos: [],
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
  conserto: {
    programa: 'planilha',
    inicial: () => comResumoMontado(),
    metas: METAS_DO_CONSERTO,
  },
  csv: {
    programa: 'planilha',
    inicial: () => {
      const c = comResumoMontado();
      return { ...c, caderno: baseConsertada(c), cadernoAntes: baseConsertada(c) };
    },
    metas: METAS_DO_CSV,
  },
  agenda: {
    programa: 'planilha',
    inicial: () => {
      const c = comResumoMontado();
      const limpa = baseConsertada(c);
      const comAgenda: Caderno = {
        planilhas: [
          ...limpa.planilhas,
          planilhaDe(ABA_AGENDA_ORDENADA, []),
          planilhaDe(ABA_AGENDA, [[...CABECALHO_DA_AGENDA], ...AGENDA_DO_CLUBE()], {
            tabela: {
              l1: 0, c1: 0,
              l2: AGENDA_DO_CLUBE().length, c2: CABECALHO_DA_AGENDA.length - 1,
            },
          }),
        ],
        ativa: 3,
      };
      return { ...c, caderno: comAgenda, cadernoAntes: comAgenda };
    },
    metas: METAS_DA_AGENDA_DO_CLUBE,
  },
  /*
    O módulo 8 parte do fim do módulo 7, com a cópia exportada ainda na pasta de
    downloads: os três artefatos estão prontos, e é por isso que a entrega é
    condição conjugada e não item da lista.
  */
  entrega: {
    programa: 'plataforma',
    inicial: () => {
      const c = LICOES_DA_CC_ES008.agenda.inicial();
      const comRelatorio: Caderno = comAba(c.caderno,
        planilhaDe(ABA_AGENDA_ORDENADA, [
          [...CABECALHO_DA_AGENDA],
          ...[...AGENDA_DO_CLUBE()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')),
        ]));
      const comValidacao = comCampo(c.formulario, CAMPO_EMAIL,
        x => ({ ...x, obrigatorio: true, validacao: { tipo: 'email' } }));
      const pronto = { ...c, formulario: comValidacao, caderno: comRelatorio, cadernoAntes: comRelatorio };
      return { ...pronto, csv: csvDaBase(pronto) };
    },
    metas: METAS_DA_ENTREGA,
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

/**
 * A pasta do módulo 5: a base limpa pelo módulo 3 **e** o resumo já montado.
 *
 * O resumo tem de chegar pronto, porque a lição do conserto é sobre o que ele
 * relata: quem chega no módulo 5 já viu dez unidades onde há seis, no módulo 4.
 * Montá-lo de novo aqui mediria de novo o que já foi medido.
 */
function comResumoMontado(): ContextoDeDados {
  const c = comCaderno(comTiposArrumados(FORMULARIO_COMO_CHEGA()));
  const limpa = baseArrumada(c);
  const base = abaDe(limpa, ABA_RESPOSTAS);
  const colunas = cabecalhoDe(c.formulario).length;
  const t: TabelaDinamica = {
    em: { l: 3, c: 0 },
    origem: {
      planilha: ABA_RESPOSTAS,
      faixa: { l1: 0, c1: 0, l2: respostasReais(c.formulario).length, c2: colunas - 1 },
    },
    linha: COLUNA_DA_UNIDADE,
    valor: { coluna: COLUNA_DAS_DIARIAS, como: 'contagem' },
    retrato: [],
  };
  const comRetrato: Caderno = comAba(limpa, {
    ...abaDe(limpa, ABA_RELATORIO),
    resumo: { ...t, retrato: resumir(base, t) },
  });
  return { ...c, caderno: comRetrato, cadernoAntes: comRetrato };
}

/**
 * A base depois do módulo 5: uma grafia por unidade, ninguém sem unidade, e
 * toda diária lida como número — com o resumo atualizado.
 *
 * A unidade que faltava sai de quem a pessoa é, e não de um chute: a Eduarda é
 * do Tucano, e é isso que a secretária descobre ligando para a família.
 */
export function baseConsertada(c: ContextoDeDados): Caderno {
  const certa = (v: string) => UNIDADES.find(u => paraComparar(u) === paraComparar(v)) ?? v;
  const base = abaDe(c.caderno, ABA_RESPOSTAS);
  /*
    A última linha **com dado**, e não a última da grade.
    Preencher a coluna inteira escreve a unidade nas linhas vazias de baixo, e
    cada uma delas passa a contar como registro — com tudo o mais em branco. É a
    faixa que passa da última linha com dado, da CC-ES003, e foi a trava de
    "a solução fecha a lista" quem a pegou aqui.
  */
  const ultima = registrosNaAba(base, cabecalhoDe(c.formulario).length).length;
  const arrumada = planilhaDe(ABA_RESPOSTAS, base.celulas.map((linha, l) => linha.map((cel, col) => {
    if (l === 0 || l > ultima) return cel.texto;
    if (col === COLUNA_DA_UNIDADE) return cel.texto.trim() ? certa(cel.texto) : UNIDADE_DA_EDUARDA;
    if (col === COLUNA_DAS_DIARIAS) return cel.texto.replace('.', ',');
    return cel.texto;
  })), { tabela: base.tabela });

  const comBase = comAba(c.caderno, arrumada);
  const relatorio = abaDe(comBase, ABA_RELATORIO);
  return relatorio.resumo
    ? comAba(comBase, { ...relatorio, resumo: atualizarResumo(comBase, relatorio.resumo) })
    : comBase;
}

/**
 * O CSV que a base exporta.
 *
 * Mora aqui, e não na tela nem na trava: a tela exporta e a trava confere o que
 * foi exportado, e dois exportadores divergiriam no primeiro ajuste — com a
 * divergência aparecendo como uma aspa que a tela põe e a trava não espera. É a
 * decisão de `formulas.ts` ser um motor só.
 *
 * E ele sai por `toCsv`, que é o mesmo escritor da plataforma, com o ponto e
 * vírgula que uma máquina pt-BR usa. Um segundo escritor aqui seria a mesma
 * coisa em outra roupa.
 */
export function csvDaBase(c: ContextoDeDados): string {
  const p = aba(c, ABA_RESPOSTAS);
  const colunas = cabecalhoDe(c.formulario).length;
  const inicio = primeiraLinhaEscrita(p);
  const cabecalho = Array.from({ length: colunas }, (_, col) => escritoEm(p, Math.max(inicio, 0), col));
  return toCsv(cabecalho, registrosNaAba(p, colunas));
}

/** De que unidade é quem deixou o campo em branco. O clube sabe; a planilha não. */
export const UNIDADE_DA_EDUARDA = 'Tucano';

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
