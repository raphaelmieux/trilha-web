/**
 * O conjunto documental do Dia de Portas Abertas, que a teoria da CC-ES012
 * fotografa.
 *
 * ── Por que outro conjunto ───────────────────────────────────────────────
 * O laboratório monta o conjunto da Feira de Especialidades, e cada conserto
 * dele é a resposta de uma lição: a seção que aponta para as outras peças, a
 * pergunta partida em duas, o total virando fórmula, as pastas renomeadas, o
 * acesso que sobrou de março. Fotografar o gesto na feira seria pôr o gabarito
 * na teoria.
 *
 * O Dia de Portas Abertas é o domingo de agosto em que o clube recebe a
 * vizinhança — o mesmo evento da apresentação que a CC-ES011 fotografa, e é de
 * propósito: o clube é um só, e um evento de exemplo que já tem data, lugar e
 * cartaz não precisa ser inventado de novo. Ele **não** reaproveita evento de
 * laboratório de vereda nenhuma, que é a regra escrita no CLAUDE.md.
 *
 * ── A forma é a da feira, e o conteúdo não ───────────────────────────────
 * Os ids das pastas, das peças e dos números são os da feira, porque eles são
 * o encaixe das janelas e das contas — `acessosForaDaFuncao` procura a pasta
 * da tesouraria pelo id, `vincular` procura o número pelo id. O que a tela
 * mostra é outro: o regulamento, as barracas, as pessoas que respondem, os
 * nomes das pastas, quem ficou com acesso a mais e onde, os números.
 * `exemplosDoProjetoDocumental.test.ts` reprova se uma linha do regulamento,
 * uma resposta ou um nome de pasta passar a coincidir com a feira.
 */

import { mestreDoModelo, type Apresentacao, type Slide } from '../labs/apresentacao';
import { type ArquivoDaNuvem, type Nuvem } from '../labs/arquivoCompartilhado';
import { titulosDoDoc, type Bloco, type Doc, type Estilo, type Trecho } from '../labs/documento';
import { type Campo, type Formulario, type Resposta } from '../labs/formulario';
import { planilhaDe, type Caderno } from '../labs/planilha';
import {
  ARQUIVO_DA_APRESENTACAO, ARQUIVO_DO_CONTROLE, ARQUIVO_DO_REGULAMENTO,
  BLOCO_DAS_UNIDADES, BLOCO_DO_CUSTO, CAMPO_QUANTOS, CAMPO_RESPONSAVEL,
  CAMPO_UNIDADE_E_ESPECIALIDADE, EQUIPE_DA_FEIRA, LINHA_DAS_UNIDADES, LINHA_DO_CUSTO,
  LINHA_DOS_DESBRAVADORES, PASTA_DA_DIVULGACAO, PASTA_DA_SECRETARIA, PASTA_DA_TESOURARIA,
  PASTA_RAIZ, PASTAS_DA_FEIRA,
} from '../labs/projetoDaFeira';
import {
  INSTRUCOES_EM_BRANCO, NOME_DA_ABA_DE_CONTROLE, NOME_DA_ABA_DE_RESPOSTAS,
  importarRespostas, type IdentidadeDoProjeto, type NumeroNoConjunto, type ProjetoDocumental,
} from '../labs/projetoDocumental';
import {
  comContasSobreAsRespostas, comFormularioArrumado, comTotalEmFormula, contextoDe,
  type ContextoDoProjeto, type ConteudoDoConjunto, type LicaoDaCcEs012,
} from '../labs/metasDaCcEs012';
import { LARANJA_LEGIVEL } from './diaDePortasAbertas';

/* ── A identidade ─────────────────────────────────────────────────────────── */

/** O laranja do cartaz, na versão que se lê — o mesmo que a CC-ES011 mede. */
export const IDENTIDADE_DAS_PORTAS: IdentidadeDoProjeto = {
  fonteDosTitulos: 'Georgia',
  fonteDoCorpo: 'Calibri',
  cor: LARANJA_LEGIVEL,
};

/* ── O regulamento ────────────────────────────────────────────────────────── */

const t = (id: string, texto: string): Trecho =>
  ({ id, texto, posicao: 'normal', realce: 'nenhum', enfase: false });

const par = (id: string, secao: string, estilo: Estilo, texto: string): Bloco<string> =>
  ({ id, secao, tipo: 'paragrafo', estilo, trechos: [t(`${id}-a`, texto)] });

/** O número de barracas digitado no regulamento, e o valor do material. */
export const BARRACAS_DIGITADAS = 3;
export const MATERIAL_POR_BARRACA = 45;

const BLOCOS_DO_REGULAMENTO: Bloco<string>[] = [
  par('b-titulo', 'abertura', 'Título 1', 'Regulamento do Dia de Portas Abertas'),
  par('b-sub', 'abertura', 'Subtítulo', 'Domingo, 23 de agosto, na Escola Monteiro Lobato'),

  par('b-h1', 'apresentacao', 'Título 1', 'Para que serve o domingo'),
  par('b-ap1', 'apresentacao', 'Normal',
    'É a manhã em que o clube recebe a vizinhança, e cada unidade cuida de uma '
    + 'barraca que mostra o que ela aprendeu no ano.'),

  par('b-h2', 'inscricoes', 'Título 1', 'Inscrição das barracas'),
  par('b-in1', 'inscricoes', 'Normal',
    'Cada unidade inscreve uma barraca e diz quantos voluntários ficam nela.'),
  {
    id: BLOCO_DAS_UNIDADES, secao: 'inscricoes', tipo: 'paragrafo', estilo: 'Normal',
    trechos: [
      t('b-unidades-a', 'Até agora, '),
      t('b-unidades-n', String(BARRACAS_DIGITADAS)),
      t('b-unidades-b', ' barracas estão confirmadas.'),
    ],
  },

  par('b-h3', 'feira', 'Título 1', 'Como funciona a manhã'),
  par('b-fe1', 'feira', 'Normal',
    'As barracas abrem às 9h e fecham ao meio-dia. Cada uma tem uma mesa e um cartaz.'),
  {
    id: BLOCO_DO_CUSTO, secao: 'feira', tipo: 'paragrafo', estilo: 'Normal',
    trechos: [
      t('b-custo-a', 'Cada barraca recebe R$ '),
      t('b-custo-n', String(MATERIAL_POR_BARRACA)),
      t('b-custo-b', ' para o material.'),
    ],
  },

  par('b-h4', 'avaliacao', 'Título 1', 'O passaporte'),
  par('b-av1', 'avaliacao', 'Normal',
    'Quem visita ganha um carimbo em cada barraca, e quem junta todos leva um '
    + 'marcador de página feito pelas unidades.'),

  par('b-h5', 'datas', 'Título 1', 'Prazos'),
  par('b-da1', 'datas', 'Normal',
    'As inscrições fecham no primeiro sábado de agosto. O material sai na semana '
    + 'anterior ao domingo.'),
];

const semSumario: Doc<string> = {
  blocos: BLOCOS_DO_REGULAMENTO,
  colunas: { abertura: 1, apresentacao: 1, inscricoes: 1, feira: 1, avaliacao: 1, datas: 1 },
  sumario: [],
};

export const REGULAMENTO_DAS_PORTAS: Doc<string> = {
  ...semSumario, sumario: titulosDoDoc(semSumario),
};

/** A seção que aponta para as outras peças, como se escreve neste conjunto. */
export const MAPA_DAS_PORTAS: Bloco<string>[] = [
  par('b-h-mapa', 'datas', 'Título 1', 'Onde estão as outras peças'),
  par('b-mapa', 'datas', 'Normal',
    'A inscrição de barraca é um formulário, e o link dele vai no grupo dos '
    + 'conselheiros. As respostas caem na planilha de controle, na pasta da '
    + 'tesouraria, e é dela que saem os números deste regulamento. A '
    + 'apresentação fica na pasta da divulgação, e o dossiê em PDF junta este '
    + 'regulamento e a apresentação para a vizinhança.'),
];

/* ── O formulário ─────────────────────────────────────────────────────────── */

/** As unidades que inscreveram barraca, e quem as acompanha. */
export const BARRACAS: { unidade: string; barraca: string; quantos: number; responsavel: string }[] = [
  { unidade: 'Arara', barraca: 'Ordem unida', quantos: 4, responsavel: 'Tio Gilmar' },
  { unidade: 'Jaguar', barraca: 'Mapa e bússola', quantos: 6, responsavel: 'Tia Selma' },
  { unidade: 'Sabiá', barraca: 'Pioneiria', quantos: 5, responsavel: 'Tio Dário' },
  { unidade: 'Tucano', barraca: 'Insetos do cerrado', quantos: 3, responsavel: 'Tia Lurdes' },
  { unidade: 'Coruja', barraca: 'Contar histórias', quantos: 5, responsavel: 'Tio Caio' },
];

export const FORMULARIO_DAS_PORTAS: Formulario = {
  titulo: 'Inscrição de barraca — Portas Abertas',
  descricao: 'Uma barraca por unidade. As inscrições fecham no primeiro sábado de agosto.',
  aceitandoRespostas: true,
  campos: [
    {
      id: CAMPO_UNIDADE_E_ESPECIALIDADE, rotulo: 'Unidade e barraca',
      tipo: 'texto-curto', obrigatorio: true, pessoal: false,
    },
    {
      id: CAMPO_QUANTOS, rotulo: 'Quantos voluntários ficam na barraca',
      tipo: 'texto-curto', obrigatorio: true, pessoal: false,
    },
    {
      id: CAMPO_RESPONSAVEL, rotulo: 'Conselheiro que acompanha',
      tipo: 'texto-curto', obrigatorio: true, pessoal: true,
    },
  ],
  respostas: [],
};

/**
 * Como as respostas chegam pelo formulário de antes: a quantidade escrita do
 * jeito que se fala nas duas primeiras, que é o que a `SOMA` pula.
 */
export const RESPOSTAS_DAS_PORTAS: Resposta[] = BARRACAS.map((b, n) => ({
  id: `r${n + 1}`,
  em: `2026-07-${String(18 + n * 2).padStart(2, '0')}T19:${String(30 + n * 4).padStart(2, '0')}`,
  valores: {
    [CAMPO_UNIDADE_E_ESPECIALIDADE]: `${b.unidade} — ${b.barraca}`,
    [CAMPO_QUANTOS]: n === 0 ? 'quatro' : n === 1 ? 'uns 6' : String(b.quantos),
    [CAMPO_RESPONSAVEL]: b.responsavel,
  },
}));

const CAMPOS_ARRUMADOS_DAS_PORTAS: Campo[] = [
  { id: 'unidade', rotulo: 'Unidade', tipo: 'lista', obrigatorio: true, pessoal: false,
    opcoes: BARRACAS.map(b => b.unidade) },
  { id: 'especialidade', rotulo: 'Barraca', tipo: 'texto-curto', obrigatorio: true, pessoal: false },
  { id: CAMPO_QUANTOS, rotulo: 'Quantos voluntários ficam na barraca', tipo: 'numero', obrigatorio: true, pessoal: false },
  { id: CAMPO_RESPONSAVEL, rotulo: 'Conselheiro que acompanha', tipo: 'texto-curto', obrigatorio: true, pessoal: true },
];

const RESPOSTAS_ARRUMADAS_DAS_PORTAS: Resposta[] = RESPOSTAS_DAS_PORTAS.map((r, n) => ({
  ...r,
  valores: {
    unidade: BARRACAS[n].unidade,
    especialidade: BARRACAS[n].barraca,
    [CAMPO_QUANTOS]: String(BARRACAS[n].quantos),
    [CAMPO_RESPONSAVEL]: BARRACAS[n].responsavel,
  },
}));

/* ── A planilha de controle ───────────────────────────────────────────────── */

/** O total digitado: três barracas a 45, de quando a planilha foi feita. */
export const TOTAL_DIGITADO = BARRACAS_DIGITADAS * MATERIAL_POR_BARRACA;

export const CONTROLE_DAS_PORTAS: Caderno = {
  ativa: 1,
  planilhas: [
    planilhaDe(NOME_DA_ABA_DE_RESPOSTAS, []),
    planilhaDe(NOME_DA_ABA_DE_CONTROLE, [
      ['Controle do Dia de Portas Abertas'],
      [],
      ['Barracas inscritas', String(BARRACAS_DIGITADAS)],
      ['Voluntários nas barracas', '14'],
      ['Material por barraca', String(MATERIAL_POR_BARRACA)],
      ['Total de material', String(TOTAL_DIGITADO)],
    ], { tabela: { l1: 2, c1: 0, l2: 5, c2: 1 } }),
  ],
};

/* ── A apresentação ───────────────────────────────────────────────────────── */

export const GRAFICO_DAS_PORTAS = 'g-barracas';

const slide = (id: string, titulo: string, topicos: string[], extra: Partial<Slide> = {}): Slide => ({
  id, titulo, topicos, layout: 'titulo-conteudo', imagens: [], imagensAlinhadas: true,
  video: 'nenhuma', audio: 'nenhuma', notas: '', caixas: [], ...extra,
});

export const APRESENTACAO_DAS_PORTAS: Apresentacao = {
  modelo: 'branco',
  mestre: mestreDoModelo('branco'),
  slides: [
    slide('p1', 'Dia de Portas Abertas', ['Domingo, 23 de agosto, 9h', 'Escola Monteiro Lobato'],
      { layout: 'titulo' }),
    slide('p2', 'O que acontece', [
      'Cada unidade cuida de uma barraca',
      'Quem visita leva um passaporte',
      'Quem junta os carimbos ganha um marcador',
    ]),
    slide('p3', 'Barracas confirmadas', [], {
      grafico: {
        id: GRAFICO_DAS_PORTAS,
        /* Colado como figura no dia em que três unidades tinham respondido. */
        como: 'imagem',
        planilha: NOME_DA_ABA_DE_CONTROLE,
        retrato: BARRACAS.slice(0, 3).map(b => ({ rotulo: b.unidade, valor: b.quantos })),
      },
    }),
    slide('p4', 'Como inscrever a barraca', [
      'A unidade escolhe o tema',
      'Quem acompanha a unidade manda o formulário',
      'Inscrições até o primeiro sábado de agosto',
    ]),
  ],
  pdf: null,
};

/* ── A nuvem ──────────────────────────────────────────────────────────────── */

const pasta = (id: string, nome: string, extra: Partial<ArquivoDaNuvem> = {}): ArquivoDaNuvem =>
  ({ id, nome, tipo: 'pasta', dono: 'voce', acessos: [], versoes: [], ...extra });

/** Os nomes como chegam: quatro moldes, nenhum com data e versão. */
export const PASTAS_COMO_CHEGAM: Record<string, string> = {
  [PASTA_RAIZ]: 'Portas Abertas',
  [PASTA_DA_SECRETARIA]: 'textos portas',
  [PASTA_DA_TESOURARIA]: 'GASTOS PORTAS ABERTAS',
  [PASTA_DA_DIVULGACAO]: 'divulga_final_2',
};

/** E no molde da CC-ES001: um só, com data e versão. */
export const PASTAS_NO_PADRAO: Record<string, string> = {
  [PASTA_RAIZ]: 'evento-portas-abertas-2026-07-14-v01',
  [PASTA_DA_SECRETARIA]: 'secretaria-portas-abertas-2026-07-14-v01',
  [PASTA_DA_TESOURARIA]: 'tesouraria-portas-abertas-2026-07-14-v01',
  [PASTA_DA_DIVULGACAO]: 'divulgacao-portas-abertas-2026-07-14-v01',
};

/**
 * A nuvem do Dia de Portas Abertas.
 *
 * O acesso que sobrou é outro que o da feira: aqui é a Cleide, da secretaria,
 * que ficou editora da pasta da tesouraria quando foi conferir um recibo. E a
 * pasta da divulgação está sem o conselho, que é quem a faz.
 */
export const NUVEM_DAS_PORTAS: Nuvem = {
  arquivos: [
    pasta(PASTA_RAIZ, PASTAS_COMO_CHEGAM[PASTA_RAIZ], {
      acessos: [{ quem: 'lideranca', papel: 'leitor' }],
    }),
    pasta(PASTA_DA_SECRETARIA, PASTAS_COMO_CHEGAM[PASTA_DA_SECRETARIA], {
      pasta: PASTA_RAIZ,
      acessos: [{ quem: 'cleide', papel: 'editor' }, { quem: 'lideranca', papel: 'leitor' }],
    }),
    pasta(PASTA_DA_TESOURARIA, PASTAS_COMO_CHEGAM[PASTA_DA_TESOURARIA], {
      pasta: PASTA_RAIZ,
      acessos: [
        { quem: 'marta', papel: 'editor' },
        { quem: 'cleide', papel: 'editor' },
        { quem: 'lideranca', papel: 'leitor' },
      ],
    }),
    pasta(PASTA_DA_DIVULGACAO, PASTAS_COMO_CHEGAM[PASTA_DA_DIVULGACAO], {
      pasta: PASTA_RAIZ,
      acessos: [{ quem: 'lideranca', papel: 'leitor' }],
    }),
    {
      id: ARQUIVO_DO_REGULAMENTO, nome: 'regulamento-portas-abertas-2026-07-14-v02',
      tipo: 'documento', dono: 'voce', pasta: PASTA_DA_SECRETARIA, acessos: [],
      versoes: [{ id: 'v1', quando: '2026-07-14', porQuem: ['voce'] }],
    },
    {
      id: ARQUIVO_DO_CONTROLE, nome: 'controle-portas-abertas-2026-07-14-v01',
      tipo: 'planilha', dono: 'voce', pasta: PASTA_DA_TESOURARIA,
      acessos: [{ quem: 'marta', papel: 'editor' }],
      versoes: [{ id: 'v1', quando: '2026-07-14', porQuem: ['voce'] }],
    },
    {
      id: ARQUIVO_DA_APRESENTACAO, nome: 'portas-divulgacao-2026-07-16-v01',
      tipo: 'documento', dono: 'voce', pasta: PASTA_DA_DIVULGACAO, acessos: [],
      versoes: [{ id: 'v1', quando: '2026-07-16', porQuem: ['voce'] }],
    },
  ],
};

/* ── Os números ───────────────────────────────────────────────────────────── */

const NUMEROS_DAS_PORTAS: NumeroNoConjunto[] = [
  {
    id: 'n-unidades', peca: 'documento', alvo: BLOCO_DAS_UNIDADES, trecho: 'b-unidades-n',
    como: 'digitado', retrato: BARRACAS_DIGITADAS,
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DAS_UNIDADES, coluna: 1 },
  },
  {
    id: 'n-custo', peca: 'documento', alvo: BLOCO_DO_CUSTO, trecho: 'b-custo-n',
    como: 'digitado', retrato: MATERIAL_POR_BARRACA,
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DO_CUSTO, coluna: 1 },
  },
  {
    id: 'n-estandes', peca: 'apresentacao', alvo: GRAFICO_DAS_PORTAS, como: 'imagem', retrato: 14,
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DOS_DESBRAVADORES, coluna: 1 },
  },
];

/* ── O conjunto ───────────────────────────────────────────────────────────── */

export const PORTAS_COMO_CHEGAM: ProjetoDocumental = {
  proposta: { necessidade: '', paraQuem: '', pecas: [], pronto: '', aprovadaEm: '2026-07-13' },
  identidade: IDENTIDADE_DAS_PORTAS,
  documento: REGULAMENTO_DAS_PORTAS,
  controle: CONTROLE_DAS_PORTAS,
  formulario: FORMULARIO_DAS_PORTAS,
  apresentacao: APRESENTACAO_DAS_PORTAS,
  dossie: null,
  numeros: NUMEROS_DAS_PORTAS,
  nuvem: NUVEM_DAS_PORTAS,
  equipe: EQUIPE_DA_FEIRA,
  pastas: PASTAS_DA_FEIRA,
  instrucoes: INSTRUCOES_EM_BRANCO,
  minutosDaDemonstracao: null,
};

export const CONTEUDO_DAS_PORTAS: ConteudoDoConjunto = {
  arquivos: {
    regulamento: 'regulamento-portas-abertas-2026-07-14-v02',
    controle: 'controle-portas-abertas-2026-07-14-v01',
    apresentacao: 'portas-divulgacao-2026-07-16-v01',
  },
  grafico: GRAFICO_DAS_PORTAS,
  nomeDoGrafico: 'Gráfico das barracas',
  blocosDoMapa: MAPA_DAS_PORTAS,
  camposArrumados: CAMPOS_ARRUMADOS_DAS_PORTAS,
  respostasArrumadas: RESPOSTAS_ARRUMADAS_DAS_PORTAS,
  retratoVinculado: BARRACAS.map(b => ({ rotulo: b.unidade, valor: b.quantos })),
  nomesDasPastas: PASTAS_NO_PADRAO,
  raiz: PASTA_RAIZ,
  pdfs: {
    regulamento: 'regulamento-portas-abertas-2026-08-01-v01',
    apresentacao: 'portas-divulgacao-2026-08-01-v01',
    controle: 'controle-portas-abertas-2026-08-01-v01',
    dossie: 'dossie-portas-abertas-2026-08-01-v01',
  },
};

/* ── Os estados que as telas fotografam ───────────────────────────────────── */

/** O formulário já partido, com as respostas dentro e a planilha calculando. */
const COM_FORMULARIO: ProjetoDocumental = {
  ...PORTAS_COMO_CHEGAM,
  controle: comTotalEmFormula(PORTAS_COMO_CHEGAM.controle),
  formulario: comFormularioArrumado(PORTAS_COMO_CHEGAM.formulario, CONTEUDO_DAS_PORTAS, IDENTIDADE_DAS_PORTAS),
};

/** As respostas importadas, e as contas da aba Controle lendo delas. */
const COM_RESPOSTAS: ProjetoDocumental = (() => {
  const importado = importarRespostas(COM_FORMULARIO);
  return { ...importado, controle: comContasSobreAsRespostas(importado.controle) };
})();

/** O formulário com as respostas de antes, para a lição de trocar o tipo. */
const COM_RESPOSTAS_DE_ANTES: ProjetoDocumental = {
  ...PORTAS_COMO_CHEGAM,
  formulario: { ...FORMULARIO_DAS_PORTAS, respostas: RESPOSTAS_DAS_PORTAS },
};

export type EstadoDasPortas =
  | 'regulamento' | 'controle' | 'formulario' | 'importar' | 'divulgacao'
  | 'dossie' | 'repositorio' | 'instrucoes';

/**
 * De que estado cada cena parte e em que lição ela abre.
 *
 * A lição diz a janela — `LICOES_DA_CC_ES012` escolhe o programa por ela —,
 * e o estado diz o que há dentro. É o par da CC-ES011.
 */
export const CENAS_DAS_PORTAS: Record<EstadoDasPortas, { licao: LicaoDaCcEs012; p: ProjetoDocumental }> = {
  regulamento: { licao: 'documento', p: PORTAS_COMO_CHEGAM },
  controle: { licao: 'planilha', p: PORTAS_COMO_CHEGAM },
  formulario: { licao: 'formulario', p: COM_RESPOSTAS_DE_ANTES },
  importar: { licao: 'importar', p: COM_FORMULARIO },
  divulgacao: { licao: 'apresentacao', p: COM_RESPOSTAS },
  dossie: { licao: 'dossie', p: COM_RESPOSTAS },
  repositorio: { licao: 'repositorio', p: COM_RESPOSTAS },
  instrucoes: { licao: 'instrucoes', p: COM_RESPOSTAS },
};

export const nasPortas = (estado: EstadoDasPortas): { inicial: () => ContextoDoProjeto; conjunto: ConteudoDoConjunto } => ({
  inicial: () => contextoDe(CENAS_DAS_PORTAS[estado].p),
  conjunto: CONTEUDO_DAS_PORTAS,
});
