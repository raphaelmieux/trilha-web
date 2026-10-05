/**
 * O conjunto documental da Feira de Especialidades: a necessidade real do
 * clube que a CC-ES012 atende, e as cinco peças como elas chegam.
 *
 * ── Por que a feira, e não o acampamento ─────────────────────────────────
 * O acampamento já é o assunto de três veredas — o caderno da CC-ES003, o
 * dossiê da CC-ES004, a apresentação da CC-ES011. Usá-lo aqui obrigaria a
 * escolher entre reaproveitar aquelas peças, e aí as lições refariam o que
 * aquelas veredas já mediram, ou inventar um **segundo** acampamento, e aí o
 * clube passaria a ter dois. A feira é outra atividade do mesmo clube, do
 * tamanho que o requisito pede: cinco peças, nenhuma delas sobrando.
 *
 * ── As peças chegam quase prontas, e é de propósito ──────────────────────
 * Produzi-las é o que as veredas do requisito 1 mediram, uma a uma, e repetir
 * a tarefa aqui mediria de novo o que já foi medido — é a decisão do módulo 6
 * da CC-ES004, escrita lá. O que falta em cada peça é **o que a faz parte de
 * um conjunto**:
 *
 * - o documento está escrito, com estilos e sumário, e não carrega a
 *   identidade nem diz onde estão as outras quatro peças;
 * - a planilha calcula, e calcula sobre números digitados à mão;
 * - o formulário coleta, e coleta num formato que a planilha não consegue ler
 *   sem alguém redigitar;
 * - a apresentação está montada, e o gráfico dela é uma figura colada;
 * - o dossiê não existe.
 *
 * Nenhuma dessas faltas aparece olhando a peça sozinha. Todas as cinco abrem
 * bonitas, imprimem certo e não dão erro nenhum — que é exatamente o que
 * torna um conjunto de cinco arquivos soltos indistinguível de um conjunto.
 */

import {
  type Apresentacao, type Slide, mestreDoModelo,
} from './apresentacao';
import {
  type ArquivoDaNuvem, type Nuvem, type Pessoa,
} from './arquivoCompartilhado';
import {
  type Bloco, type Doc, type Estilo, type Trecho,
} from './documento';
import { type Campo, type Formulario, type Resposta } from './formulario';
import { type Caderno, planilhaDe } from './planilha';
import {
  type IdentidadeDoProjeto, type NaEquipe, type NumeroNoConjunto,
  type PastaDoProjeto, type ProjetoDocumental, type Proposta,
  INSTRUCOES_EM_BRANCO, NOME_DA_ABA_DE_CONTROLE, NOME_DA_ABA_DE_RESPOSTAS,
} from './projetoDocumental';

/* ── A identidade do conjunto ─────────────────────────────────────────────── */

/**
 * O verde da camisa, na versão que se lê.
 *
 * É o `VERDE_LEGIVEL` da CC-ES011 — 8,12:1 sobre o branco —, e está escrito
 * aqui como constante própria e não importado de lá: aquele arquivo é a
 * apresentação do acampamento, e um conjunto documental não deve depender do
 * conteúdo de outra vereda para saber a própria cor. O número medido é o
 * mesmo porque a camisa é a mesma.
 */
export const VERDE_DA_FEIRA = '#0E5C2C';

export const IDENTIDADE_DA_FEIRA: IdentidadeDoProjeto = {
  fonteDosTitulos: 'Georgia',
  fonteDoCorpo: 'Calibri',
  cor: VERDE_DA_FEIRA,
};

/* ── A proposta, como ela chega: em branco ────────────────────────────────── */

/**
 * A necessidade que o clube tem, nas palavras de quem vive ela.
 *
 * Ela não entra na `Proposta` de partida — escrever a proposta **é** o módulo
 * 1, e entregá-la escrita faria a primeira lição abrir cumprida. Ela mora aqui
 * porque é o enunciado: é o que a lição conta antes de pedir a proposta.
 */
export const NECESSIDADE_DO_CLUBE =
  'A feira de especialidades acontece todo agosto, e todo agosto a secretaria '
  + 'recomeça do zero: o regulamento num arquivo que alguém tem no computador, '
  + 'as inscrições num papel que circula na reunião, as contas numa planilha '
  + 'que ninguém acha, e a divulgação feita na semana da feira. Até a quinta '
  + 'antes, ninguém sabe quantas unidades se inscreveram.';

export const PROPOSTA_DA_FEIRA: Proposta = {
  necessidade: '', paraQuem: '', pecas: [], pronto: '', aprovadaEm: null,
};

/* ── A equipe, e a função de cada um ──────────────────────────────────────── */

/**
 * Quem faz a feira, e com que chapéu.
 *
 * São os cinco nomes do `Autor` da CC-ES002, que são os mesmos da nuvem da
 * CC-ES006 — pelo motivo escrito lá: quem compartilhou o arquivo e quem
 * assinou a marca de revisão precisam ser a **mesma** pessoa, senão a margem
 * do documento passa a citar gente que não está na lista de acesso.
 *
 * `lideranca` é diretoria porque é o que ela é na CC-ES002: um papel, e não
 * uma pessoa. Aqui isso cai bem — é a diretoria que aprova a proposta e é
 * para ela que as instruções do requisito 7 são escritas.
 */
export const EQUIPE_DA_FEIRA: NaEquipe[] = [
  { quem: 'voce', funcao: 'secretaria' },
  { quem: 'cleide', funcao: 'secretaria' },
  { quem: 'marta', funcao: 'tesouraria' },
  { quem: 'ronaldo', funcao: 'conselho' },
  { quem: 'lideranca', funcao: 'diretoria' },
];

/* ── O regulamento ────────────────────────────────────────────────────────── */

export type SecaoDoRegulamento =
  | 'abertura' | 'apresentacao' | 'inscricoes' | 'feira' | 'avaliacao' | 'datas';

const t = (id: string, texto: string, extra: Partial<Trecho> = {}): Trecho =>
  ({ id, texto, posicao: 'normal', realce: 'nenhum', enfase: false, ...extra });

const par = (
  id: string, secao: SecaoDoRegulamento, estilo: Estilo, texto: string,
): Bloco<SecaoDoRegulamento> =>
  ({ id, secao, tipo: 'paragrafo', estilo, trechos: [t(`${id}-a`, texto)] });

/** O id do parágrafo que cita o número de unidades inscritas. */
export const BLOCO_DAS_UNIDADES = 'b-unidades';
/** O id do parágrafo que cita o custo de material por unidade. */
export const BLOCO_DO_CUSTO = 'b-custo';

/**
 * O regulamento como a secretaria o deixou no ano passado.
 *
 * Escrito por inteiro, com os cinco títulos em estilo de título e o sumário
 * gerado — porque formatar com estilos e gerar sumário é o que a CC-ES002
 * mediu. O que ele não tem: a identidade do conjunto, uma seção dizendo onde
 * estão as outras quatro peças, e dois números que vieram digitados.
 */
export const REGULAMENTO_INICIAL: Doc<SecaoDoRegulamento> = {
  blocos: [
    par('b-titulo', 'abertura', 'Título 1', 'Regulamento da Feira de Especialidades'),
    par('b-sub', 'abertura', 'Subtítulo', 'Clube de Desbravadores Pioneiros de Sobradinho'),

    par('b-h1', 'apresentacao', 'Título 1', 'Apresentação'),
    par('b-ap1', 'apresentacao', 'Normal',
      'A feira de especialidades é a tarde em que cada unidade monta um estande '
      + 'e ensina ao clube inteiro uma especialidade que ela estudou no ano.'),
    par('b-ap2', 'apresentacao', 'Normal',
      'Ela acontece no salão da igreja, num sábado de agosto, e é aberta às '
      + 'famílias e à igreja.'),

    par('b-h2', 'inscricoes', 'Título 1', 'Inscrições'),
    par('b-in1', 'inscricoes', 'Normal',
      'Cada unidade escolhe uma especialidade e inscreve a quantidade de '
      + 'desbravadores que vai montar o estande.'),
    {
      id: BLOCO_DAS_UNIDADES, secao: 'inscricoes', tipo: 'paragrafo', estilo: 'Normal',
      trechos: [
        t('b-unidades-a', 'Até o fechamento das inscrições, '),
        /* O número digitado. Ele é o alvo do vínculo do requisito 8, e chega
           como a secretaria o deixou: certo no dia em que foi escrito. */
        t('b-unidades-n', '4'),
        t('b-unidades-b', ' unidades confirmaram presença.'),
      ],
    },

    par('b-h3', 'feira', 'Título 1', 'Como funciona a feira'),
    par('b-fe1', 'feira', 'Normal',
      'Cada estande tem uma mesa, um painel e vinte minutos para apresentar. '
      + 'A ordem é sorteada na reunião anterior.'),
    {
      id: BLOCO_DO_CUSTO, secao: 'feira', tipo: 'paragrafo', estilo: 'Normal',
      trechos: [
        t('b-custo-a', 'O clube repassa a cada unidade R$ '),
        t('b-custo-n', '60'),
        t('b-custo-b', ' para o material do estande.'),
      ],
    },

    par('b-h4', 'avaliacao', 'Título 1', 'Avaliação'),
    par('b-av1', 'avaliacao', 'Normal',
      'Três conselheiros convidados dão nota ao estande pelo que ele ensina, e '
      + 'não pelo enfeite. A nota não vale prêmio: vale conversa depois.'),

    par('b-h5', 'datas', 'Título 1', 'Datas'),
    par('b-da1', 'datas', 'Normal',
      'As inscrições abrem na primeira reunião de julho e fecham na última. A '
      + 'feira é no terceiro sábado de agosto, às 14h.'),
  ],
  colunas: {
    abertura: 1, apresentacao: 1, inscricoes: 1, feira: 1, avaliacao: 1, datas: 1,
  },
  /* O sumário gerado com os cinco títulos de hoje. Ele guarda o que leu, pela
     razão escrita na CC-ES002 — então a seção que o módulo 2 acrescenta o
     deixa velho, e atualizá-lo viaja conjugado com a meta daquela seção. */
  sumario: [
    { texto: 'Regulamento da Feira de Especialidades', nivel: 1, pagina: 1 },
    { texto: 'Apresentação', nivel: 1, pagina: 1 },
    { texto: 'Inscrições', nivel: 1, pagina: 1 },
    { texto: 'Como funciona a feira', nivel: 1, pagina: 1 },
    { texto: 'Avaliação', nivel: 1, pagina: 2 },
    { texto: 'Datas', nivel: 1, pagina: 2 },
  ],
};

/* ── O formulário de inscrição ────────────────────────────────────────────── */

export const CAMPO_UNIDADE_E_ESPECIALIDADE = 'unidade-e-especialidade';
export const CAMPO_QUANTOS = 'quantos';
export const CAMPO_RESPONSAVEL = 'responsavel';

/**
 * O formulário como alguém da secretaria o montou — sem olhar a planilha.
 *
 * Dois defeitos, e os dois só aparecem na hora de importar:
 *
 * - **unidade e especialidade num campo só.** "Falcão — Nós e amarras" é uma
 *   resposta, e a planilha precisa das duas coisas em colunas separadas para
 *   contar por unidade. Quem importa assim tem de abrir cada linha e partir o
 *   texto à mão, que é a redigitação que o requisito 4 proíbe;
 * - **quantidade como texto curto.** Chega `'cinco'`, chega `'5 ou 6'`, chega
 *   `'4'`. A `SOMA` pula os dois primeiros e fecha a conta com um número
 *   plausível e menor, sem reclamar — é o requisito 7 da CC-ES003 nascendo de
 *   um campo mal escolhido em vez de um apóstrofo.
 */
export const FORMULARIO_INICIAL: Formulario = {
  titulo: 'Inscrição da Feira de Especialidades',
  descricao: 'Uma inscrição por unidade. As inscrições fecham na última reunião de julho.',
  aceitandoRespostas: true,
  campos: [
    {
      id: CAMPO_UNIDADE_E_ESPECIALIDADE,
      rotulo: 'Unidade e especialidade',
      tipo: 'texto-curto', obrigatorio: true, pessoal: false,
    },
    {
      id: CAMPO_QUANTOS,
      rotulo: 'Quantos desbravadores montam o estande',
      tipo: 'texto-curto', obrigatorio: true, pessoal: false,
    },
    {
      id: CAMPO_RESPONSAVEL,
      rotulo: 'Conselheiro responsável',
      tipo: 'texto-curto', obrigatorio: true, pessoal: true,
    },
  ],
  respostas: [],
};

/** As unidades do clube que se inscrevem, e a especialidade de cada uma. */
export const INSCRICOES_DA_FEIRA: { unidade: string; especialidade: string; quantos: number; responsavel: string }[] = [
  { unidade: 'Falcão', especialidade: 'Nós e amarras', quantos: 6, responsavel: 'Tio Márcio' },
  { unidade: 'Águia', especialidade: 'Primeiros socorros', quantos: 5, responsavel: 'Tia Rute' },
  { unidade: 'Onça', especialidade: 'Culinária', quantos: 7, responsavel: 'Tio Vasco' },
  { unidade: 'Tucano', especialidade: 'Astronomia', quantos: 4, responsavel: 'Tia Alda' },
  { unidade: 'Pantera', especialidade: 'Computação', quantos: 6, responsavel: 'Tio Edson' },
  { unidade: 'Lobo', especialidade: 'Modelagem', quantos: 5, responsavel: 'Tia Neide' },
];

/**
 * As respostas que chegaram pelo formulário mal desenhado.
 *
 * As duas primeiras trazem a quantidade escrita de um jeito que a `SOMA` não
 * lê, porque é o que de fato chega num campo de texto curto: quem responde
 * escreve como fala. Consertar isto é trocar o **tipo do campo**, e não o que
 * as pessoas escreveram.
 */
export const RESPOSTAS_DA_FEIRA: Resposta[] = INSCRICOES_DA_FEIRA.map((i, n) => ({
  id: `r${n + 1}`,
  em: `2026-07-${String(5 + n * 4).padStart(2, '0')}T20:${String(10 + n).padStart(2, '0')}`,
  valores: {
    [CAMPO_UNIDADE_E_ESPECIALIDADE]: `${i.unidade} — ${i.especialidade}`,
    [CAMPO_QUANTOS]: n === 0 ? 'seis' : n === 1 ? '5 ou 6' : String(i.quantos),
    [CAMPO_RESPONSAVEL]: i.responsavel,
  },
}));

/** O formulário depois de arrumado: quatro campos, com os tipos que a planilha lê. */
export const CAMPOS_ARRUMADOS: Campo[] = [
  { id: 'unidade', rotulo: 'Unidade', tipo: 'lista', obrigatorio: true, pessoal: false,
    opcoes: INSCRICOES_DA_FEIRA.map(i => i.unidade) },
  { id: 'especialidade', rotulo: 'Especialidade', tipo: 'texto-curto', obrigatorio: true, pessoal: false },
  { id: CAMPO_QUANTOS, rotulo: 'Quantos desbravadores montam o estande', tipo: 'numero', obrigatorio: true, pessoal: false },
  { id: CAMPO_RESPONSAVEL, rotulo: 'Conselheiro responsável', tipo: 'texto-curto', obrigatorio: true, pessoal: true },
];

/* ── A planilha de controle ───────────────────────────────────────────────── */

export const CUSTO_POR_UNIDADE = 60;

/**
 * A pasta de trabalho como a tesouraria a deixou.
 *
 * A aba `Respostas` existe e está **vazia**, porque é onde o formulário vai
 * desembocar e ela precisa existir antes para as fórmulas terem onde apontar.
 * A aba `Controle` calcula — e calcula sobre números digitados: o `4` do total
 * de unidades é de quando ela foi feita, e o `240` é `=4*60` escrito à mão.
 *
 * Nada ali está errado hoje, e é esse o ponto. No ano que vem, com seis
 * unidades, as duas células continuam dizendo 4 e 240.
 */
export const CONTROLE_INICIAL: Caderno = {
  ativa: 1,
  planilhas: [
    planilhaDe(NOME_DA_ABA_DE_RESPOSTAS, []),
    planilhaDe(NOME_DA_ABA_DE_CONTROLE, [
      ['Controle da Feira de Especialidades'],
      [],
      ['Unidades inscritas', '4'],
      ['Desbravadores nos estandes', '22'],
      ['Material por unidade', String(CUSTO_POR_UNIDADE)],
      ['Total de material', '240'],
    ], { tabela: { l1: 2, c1: 0, l2: 5, c2: 1 } }),
  ],
};

/** A linha da aba de controle em que cada conta mora. */
export const LINHA_DAS_UNIDADES = 2;
export const LINHA_DOS_DESBRAVADORES = 3;
export const LINHA_DO_CUSTO = 4;
export const LINHA_DO_TOTAL = 5;

/* ── A apresentação de divulgação ─────────────────────────────────────────── */

const slide = (
  id: string, titulo: string, topicos: string[], extra: Partial<Slide> = {},
): Slide => ({
  id, titulo, topicos, layout: 'titulo-conteudo', imagens: [], imagensAlinhadas: true,
  video: 'nenhuma', audio: 'nenhuma', notas: '', caixas: [], ...extra,
});

/** O id do gráfico que devia vir da planilha de controle. */
export const GRAFICO_DA_FEIRA = 'g-estandes';

/**
 * A apresentação como ela foi usada no culto jovem.
 *
 * Montada, com layout e sem formatação direta sobrando — porque montar uma
 * apresentação é o que a CC-ES011 mediu. O que falta: o mestre não tem a
 * identidade do conjunto, e o gráfico dos estandes é uma **figura colada**,
 * que mostra o retrato de quando alguém o copiou.
 */
export const APRESENTACAO_INICIAL: Apresentacao = {
  modelo: 'branco',
  mestre: mestreDoModelo('branco'),
  slides: [
    slide('s1', 'Feira de Especialidades', ['Terceiro sábado de agosto, 14h', 'Salão da igreja'],
      { layout: 'titulo' }),
    slide('s2', 'O que é', [
      'Cada unidade monta um estande',
      'Ensina ao clube uma especialidade que estudou',
      'Aberta às famílias e à igreja',
    ]),
    slide('s3', 'Quem já se inscreveu', [], {
      grafico: {
        id: GRAFICO_DA_FEIRA,
        /* Figura colada: o retrato de quatro unidades, para sempre. */
        como: 'imagem',
        planilha: NOME_DA_ABA_DE_CONTROLE,
        retrato: [
          { rotulo: 'Falcão', valor: 6 }, { rotulo: 'Águia', valor: 5 },
          { rotulo: 'Onça', valor: 7 }, { rotulo: 'Tucano', valor: 4 },
        ],
      },
    }),
    slide('s4', 'Como participar', [
      'A unidade escolhe a especialidade',
      'O conselheiro preenche a inscrição',
      'As inscrições fecham na última reunião de julho',
    ]),
  ],
  pdf: null,
};

/* ── O repositório ────────────────────────────────────────────────────────── */

export const PASTA_RAIZ = 'pasta-feira';
export const PASTA_DA_SECRETARIA = 'pasta-secretaria';
export const PASTA_DA_TESOURARIA = 'pasta-tesouraria';
export const PASTA_DA_DIVULGACAO = 'pasta-divulgacao';

export const ARQUIVO_DO_REGULAMENTO = 'arq-regulamento';
export const ARQUIVO_DO_CONTROLE = 'arq-controle';
export const ARQUIVO_DA_APRESENTACAO = 'arq-apresentacao';

/**
 * As pastas do projeto e a função que cada uma serve.
 *
 * A raiz é da diretoria com papel de leitor: quem dirige o clube precisa
 * **achar** o conjunto, e não editar as peças. Exigir editor na raiz daria à
 * diretoria acesso de escrita a tudo por herança, que é o contrário do que
 * "por função" quer dizer.
 */
export const PASTAS_DA_FEIRA: PastaDoProjeto[] = [
  { id: PASTA_RAIZ, funcao: 'diretoria', minimo: 'leitor' },
  { id: PASTA_DA_SECRETARIA, funcao: 'secretaria', minimo: 'editor' },
  { id: PASTA_DA_TESOURARIA, funcao: 'tesouraria', minimo: 'editor' },
  { id: PASTA_DA_DIVULGACAO, funcao: 'conselho', minimo: 'editor' },
];

const pasta = (
  id: string, nome: string, extra: Partial<ArquivoDaNuvem> = {},
): ArquivoDaNuvem =>
  ({ id, nome, tipo: 'pasta', dono: 'voce', acessos: [], versoes: [], ...extra });

/**
 * A nuvem como ela chega.
 *
 * Três coisas estão fora do lugar, e nenhuma delas aparece olhando a tela:
 *
 * - **os nomes não seguem um molde só.** Três pastas em três moldes
 *   diferentes, e nenhuma com data e versão — é o padrão da CC-ES001 que o
 *   requisito 5 manda usar, e sem ele a pasta do ano que vem fica ao lado da
 *   deste sem ordem nenhuma;
 * - **o acesso foi dado pessoa por pessoa, na hora em que alguém pediu.** O
 *   Ronaldo, que é do conselho, ficou editor da pasta da tesouraria porque
 *   precisou ver uma nota fiscal em março;
 * - **toda peça é sua.** O dono é quem some com a conta, e três peças de um
 *   conjunto do clube na conta de uma pessoa é o conjunto inteiro saindo do
 *   clube no dia em que essa pessoa sai.
 */
export const NUVEM_DA_FEIRA: Nuvem = {
  arquivos: [
    pasta(PASTA_RAIZ, 'Feira', {
      acessos: [{ quem: 'lideranca', papel: 'leitor' }],
    }),
    pasta(PASTA_DA_SECRETARIA, 'documentos_feira', {
      pasta: PASTA_RAIZ,
      acessos: [
        { quem: 'cleide', papel: 'editor' },
        { quem: 'lideranca', papel: 'leitor' },
      ],
    }),
    pasta(PASTA_DA_TESOURARIA, 'CONTAS DA FEIRA 2026', {
      pasta: PASTA_RAIZ,
      acessos: [
        { quem: 'marta', papel: 'editor' },
        /* O acesso que sobrou de março. Ninguém o tirou, e ninguém notou. */
        { quem: 'ronaldo', papel: 'editor' },
        { quem: 'lideranca', papel: 'leitor' },
      ],
    }),
    pasta(PASTA_DA_DIVULGACAO, 'divulgacao-v2-final', {
      pasta: PASTA_RAIZ,
      acessos: [{ quem: 'lideranca', papel: 'leitor' }],
    }),
    {
      id: ARQUIVO_DO_REGULAMENTO,
      nome: 'regulamento-da-feira-2026-07-02-v03',
      tipo: 'documento', dono: 'voce', pasta: PASTA_DA_SECRETARIA,
      acessos: [{ quem: 'cleide', papel: 'editor' }],
      /* Uma versão só, escrita por você: o requisito 6 pede colaboração
         comprovada pelo histórico, e um histórico de um autor não comprova. */
      versoes: [{ id: 'v1', quando: '2026-07-02', porQuem: ['voce'] }],
    },
    {
      id: ARQUIVO_DO_CONTROLE,
      nome: 'controle-da-feira-2026-07-02-v01',
      tipo: 'planilha', dono: 'voce', pasta: PASTA_DA_TESOURARIA,
      acessos: [{ quem: 'marta', papel: 'editor' }, { quem: 'ronaldo', papel: 'editor' }],
      versoes: [{ id: 'v1', quando: '2026-07-02', porQuem: ['voce'] }],
    },
    {
      id: ARQUIVO_DA_APRESENTACAO,
      nome: 'feira-divulgacao-2026-07-04-v02',
      tipo: 'documento', dono: 'voce', pasta: PASTA_DA_DIVULGACAO,
      acessos: [],
      versoes: [{ id: 'v1', quando: '2026-07-04', porQuem: ['voce'] }],
    },
  ],
};

/* ── Os números do conjunto ───────────────────────────────────────────────── */

/**
 * Os três números que vivem fora da planilha e deviam vir dela.
 *
 * Dois no regulamento, digitados, e um na apresentação, colado como figura.
 * O dossiê não entra: ele é PDF, e um PDF congela — é a CC-ES004, e é
 * justamente por isso que ele é a peça que o requisito 8 **não** propaga.
 */
export const NUMEROS_DA_FEIRA: NumeroNoConjunto[] = [
  {
    id: 'n-unidades', peca: 'documento', alvo: BLOCO_DAS_UNIDADES, como: 'digitado',
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DAS_UNIDADES, coluna: 1 },
    retrato: 4,
  },
  {
    id: 'n-custo', peca: 'documento', alvo: BLOCO_DO_CUSTO, como: 'digitado',
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DO_CUSTO, coluna: 1 },
    retrato: CUSTO_POR_UNIDADE,
  },
  {
    id: 'n-estandes', peca: 'apresentacao', alvo: GRAFICO_DA_FEIRA, como: 'imagem',
    de: { planilha: NOME_DA_ABA_DE_CONTROLE, linha: LINHA_DOS_DESBRAVADORES, coluna: 1 },
    retrato: 22,
  },
];

/* ── O conjunto, como ele chega ───────────────────────────────────────────── */

export const PROJETO_DA_FEIRA: ProjetoDocumental = {
  proposta: PROPOSTA_DA_FEIRA,
  identidade: IDENTIDADE_DA_FEIRA,
  documento: REGULAMENTO_INICIAL,
  controle: CONTROLE_INICIAL,
  formulario: FORMULARIO_INICIAL,
  apresentacao: APRESENTACAO_INICIAL,
  dossie: null,
  numeros: NUMEROS_DA_FEIRA,
  nuvem: NUVEM_DA_FEIRA,
  equipe: EQUIPE_DA_FEIRA,
  pastas: PASTAS_DA_FEIRA,
  instrucoes: INSTRUCOES_EM_BRANCO,
  minutosDaDemonstracao: null,
};

/** Quem não é você, para as metas de colaboração. */
export const OUTRA_PESSOA: Pessoa = 'cleide';
