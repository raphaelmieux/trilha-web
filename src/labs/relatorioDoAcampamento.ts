import {
  linhaDe, trechoDe, campoDe, textoDoBloco, textoDoDoc, paragrafos,
  ehTabela, ehImagem, larguraDaTabela,
  ESTILO_PADRAO_DE_TABELA, DISPOSICOES_QUE_AJUSTAM,
  type Doc as DocDoWord, type Bloco as BlocoDoWord,
  type Paragrafo as ParagrafoDoWord, type TabelaDoDoc, type ImagemDoDoc,
} from './documento';

/*
  O relatório do acampamento: o documento em que tudo o que devia ser recurso
  foi feito à mão.

  ── O terceiro engano da vereda, e por que ele é diferente ───────────────
  O módulo 1 chega formatado à mão e parece pronto. O módulo 2 chega com o
  Enter usado como régua, e também parece pronto. Este **não** parece pronto,
  e é de propósito: a lista de inscritos foi alinhada com Tab e sai torta na
  primeira linha em que um nome é comprido. Depois de dois documentos cujo
  defeito era invisível, um cuja falha se vê na primeira olhada é a variação
  que faltava — e ela é honesta, porque é exatamente o que acontece quando o
  arquivo abre noutro computador, com outra fonte.

  O que continua invisível é o resto. A legenda da foto do mastro foi
  **digitada**: ela diz "Figura 1" porque no dia em que alguém a escreveu ela
  era a Figura 1. Entre uma figura antes dela e nada muda — e aí o documento
  tem duas Figura 1, sem erro nenhum e sem nada na tela explicando.

  ── Por que a legenda tem de ser campo ───────────────────────────────────
  É a mesma família do sumário que guarda o que leu, e da numeração de página
  que o módulo 4 vai cobrar: o que o editor calcula, ele recalcula. Um
  laboratório que aceitasse "Figura 2" digitada à mão mediria ter escrito duas
  palavras, e entregaria ao clube um relatório que erra na primeira revisão.

  O sombreado cinza do campo — que é do Word, e não nosso — é o que deixa isso
  visível sem clicar em nada: a legenda que se numera sozinha tem fundo, a
  digitada não tem.
*/

export type Secao = 'cabeca' | 'quem' | 'lista' | 'noite' | 'encerramento';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;
export type Paragrafo = ParagrafoDoWord<Secao>;

const linha = (id: string, secao: Secao, texto: string): Paragrafo =>
  linhaDe(id, secao, texto);

const titulo = (id: string, secao: Secao, texto: string, nivel: 'Título 1' | 'Título 2'): Paragrafo =>
  ({ ...linhaDe(id, secao, texto), estilo: nivel });

/**
 * Uma linha da lista de inscritos, alinhada com tabulação.
 *
 * É assim que ela chega da secretaria, e é o defeito do requisito 4.2: no
 * computador de quem digitou, com aquela fonte e aquele tamanho, as colunas
 * ficaram retas. Um nome comprido a mais e a coluna do meio anda; outra fonte
 * e ela anda também. Tabela não faz isso porque a coluna é uma coisa de
 * verdade, e não um espaço maior.
 */
const naTabulacao = (id: string, celulas: string[]): Paragrafo =>
  linhaDe(id, 'lista', celulas.join('\t'));

/** As colunas da lista como a secretaria a entregou. */
export const COLUNAS_DA_LISTA = ['Nome', 'Unidade', 'Pagamento'];

/**
 * A coluna que não vai para o relatório.
 *
 * O relatório é lido na reunião e fica no mural; quem pagou e quem não pagou
 * é assunto da tesouraria com a família, e não do mural. É um motivo de
 * documento, e não uma regra de programa — que é o que faz o gesto "excluir
 * coluna" ter razão de ser em vez de ser um botão a apertar.
 */
export const COLUNA_A_TIRAR = 'Pagamento';

/**
 * As linhas da lista. "Maria Eduarda Sampaio" é comprida de propósito: é ela
 * que desalinha a tabulação, e sem alguém assim o defeito não apareceria.
 */
export const INSCRITOS_NA_LISTA = [
  ['Ana Clara Ribeiro', 'Falcão', 'pago'],
  ['Maria Eduarda Sampaio', 'Falcão', 'pendente'],
  ['João Pedro Nunes', 'Tigre', 'pago'],
  ['Samuel Andrade', 'Águia', 'pago'],
];

/** Quem chegou depois de a lista ser fechada, e precisa entrar numa linha nova. */
export const INSCRITA_QUE_FALTA = ['Rute Almeida', 'Tigre'];

/** A foto que o desbravador vai inserir. */
export const FOTO_DA_FOGUEIRA = {
  arquivo: 'fogueira-sabado.jpg',
  descricao: 'A fogueira na noite de sábado',
  secao: 'noite' as Secao,
};

/** A foto que já está no documento, com a legenda digitada à mão. */
export const FOTO_DO_MASTRO = {
  arquivo: 'bandeira-falcao.jpg',
  descricao: 'A bandeira da Unidade Falcão no mastro',
};

/** O id da legenda que chega digitada — é ela que não se renumera. */
export const LEGENDA_DIGITADA = 'leg-mastro';

/**
 * O relatório como ele chega.
 *
 * Os estilos de título já estão aplicados: o módulo 1 é que cobra isso, e
 * repetir a mesma tarefa aqui mediria de novo o que já foi medido. O que
 * falta neste é o que **entra no meio do texto**.
 */
export const RELATORIO_INICIAL: Doc = {
  blocos: [
    titulo('titulo', 'cabeca', 'Relatório do Acampamento de Inverno', 'Título 1'),
    linha('abertura', 'cabeca', 'O clube acampou de 20 a 22 de junho no sítio da regional, em Sobradinho. Este relatório vai para o mural e para a pasta da secretaria.'),

    titulo('h-quem', 'quem', 'Quem foi', 'Título 2'),
    linha('quem-1', 'quem', 'Foram quarenta e nove pessoas entre desbravadores, conselheiros e diretoria. A lista de inscritos por unidade, como a secretaria a entregou, está abaixo.'),

    /* A lista, alinhada com Tab. Na tela ela já sai torta — e é isso que a
       torna a única falha visível dos três documentos da vereda. */
    naTabulacao('lista-0', COLUNAS_DA_LISTA),
    ...INSCRITOS_NA_LISTA.map((celulas, i) => naTabulacao(`lista-${i + 1}`, celulas)),

    titulo('h-noite', 'noite', 'A noite de sábado', 'Título 2'),
    /* O parágrafo em que a foto da fogueira entra. A tarefa diz para clicar
       nele, e a foto entra logo abaixo — que é onde o texto fala dela. */
    linha('noite-1', 'noite', 'A fogueira foi acesa às 19h, depois do culto. Cada unidade levou uma música, e a de encerramento foi cantada por todo mundo de pé, em roda.'),
    linha('noite-2', 'noite', 'O silêncio foi às 22h30, e quase todas as barracas cumpriram.'),

    titulo('h-fim', 'encerramento', 'O encerramento', 'Título 2'),
    linha('fim-1', 'encerramento', 'No domingo de manhã cada unidade desmontou a própria barraca e hasteou a bandeira pela última vez antes da saída.'),
    {
      tipo: 'imagem', id: 'img-mastro', secao: 'encerramento',
      arquivo: FOTO_DO_MASTRO.arquivo,
      descricao: FOTO_DO_MASTRO.descricao,
      /* Esta já chega arrumada: a lição não é consertá-la, é reparar que a
         legenda dela mente. Uma segunda imagem mal disposta faria a tarefa da
         disposição ter duas respostas, e a tarefa não saberia de qual falava. */
      disposicao: 'quadrada',
    },
    {
      /* A legenda digitada. Ela diz "Figura 1" porque era verdade quando
         alguém a escreveu — e continua dizendo depois de deixar de ser. */
      ...linhaDe(LEGENDA_DIGITADA, 'encerramento' as Secao,
        `Figura 1 — ${FOTO_DO_MASTRO.descricao}.`),
      estilo: 'Legenda' as const,
    },
    linha('fim-2', 'encerramento', 'A saída foi ao meio-dia, com o sítio entregue limpo e a lenha da fogueira apagada e molhada, conferida por dois conselheiros.'),
  ],
  colunas: { cabeca: 1, quem: 1, lista: 1, noite: 1, encerramento: 1 },
  sumario: null,
};

/** O texto do relatório como ele chegou. */
export const TEXTO_ORIGINAL = textoDoDoc(RELATORIO_INICIAL);

/* ── Ler o documento ──────────────────────────────────────────────────────── */

/** A tabela de inscritos, se ela já existe. */
export const tabelaDaLista = (d: Doc): TabelaDoDoc<Secao> | null =>
  d.blocos.filter(ehTabela).find(b => b.secao === 'lista') ?? null;

/** Os parágrafos da lista que ainda estão alinhados com tabulação. */
export const linhasNaTabulacao = (d: Doc): Paragrafo[] =>
  paragrafos(d).filter(b => b.secao === 'lista' && textoDoBloco(b).includes('\t'));

/** A foto da fogueira, se ela já foi inserida. */
export const fotoDaFogueira = (d: Doc): ImagemDoDoc<Secao> | null =>
  d.blocos.filter(ehImagem).find(b => b.arquivo === FOTO_DA_FOGUEIRA.arquivo) ?? null;

/** Todos os parágrafos de estilo Legenda, na ordem do documento. */
export const legendasDoDoc = (d: Doc): Paragrafo[] =>
  paragrafos(d).filter(b => b.estilo === 'Legenda');

/** Uma legenda é de verdade quando ela carrega um campo de figura. */
export const legendaEhCampo = (b: Paragrafo): boolean =>
  b.trechos.some(x => x.campo === 'figura');

/**
 * Monta a legenda como `Referências › Inserir Legenda` a monta: o campo, e
 * depois o texto que a pessoa escreve ao lado dele.
 *
 * O campo vem **primeiro** e guarda texto nenhum. É o que faz a numeração ser
 * do documento e não do parágrafo — e é por isso que converter a legenda
 * digitada muda o número dela na hora, sem ninguém tocar nela.
 */
export const legendaDeFigura = (id: string, secao: Secao, descricao: string): Paragrafo => ({
  ...linhaDe(id, secao, ''),
  estilo: 'Legenda' as const,
  trechos: [campoDe(`${id}-n`, 'figura'), trechoDe(`${id}-t`, ` — ${descricao}.`)],
});

/* ── As metas ─────────────────────────────────────────────────────────────── */

export interface MetaDoRelatorio {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na faixa de opções, isso se resolve. */
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

export const METAS_DO_RELATORIO: MetaDoRelatorio[] = [
  {
    id: 'tabela',
    titulo: 'Transformar a lista alinhada com Tab numa tabela',
    detalhe: 'A lista foi alinhada apertando Tab, e por isso ela sai torta assim que um nome é '
      + 'comprido demais. Tabulação é espaço; coluna de tabela é coluna. Converta a lista inteira.',
    onde: 'Inserir › Tabela › Converter Texto em Tabela',
    passos: [
      'Clique numa das linhas da lista de inscritos.',
      'Abra a guia Inserir e o botão Tabela.',
      'Escolha "Converter Texto em Tabela" — o separador é a tabulação, que é o que está lá.',
      'Repare no que muda: as colunas param de depender do tamanho do nome.',
    ],
    feita: d => tabelaDaLista(d) !== null && linhasNaTabulacao(d).length === 0,
  },
  {
    id: 'formatar',
    titulo: 'Formatar a tabela: cabeçalho marcado e estilo da galeria',
    detalhe: 'São as duas metades de formatar uma tabela. Marcar a primeira linha como cabeçalho é '
      + 'o que a faz se repetir no alto da página seguinte quando a tabela atravessa duas. E o estilo '
      + 'sai da galeria, e não de pintar célula por célula — é o módulo 1 um nível acima.',
    onde: 'Layout da Tabela › Linha de Cabeçalho, e Design da Tabela › galeria',
    passos: [
      'Clique dentro da tabela: as duas guias contextuais aparecem no fim da fileira.',
      'Em Layout da Tabela, ligue "Linha de Cabeçalho".',
      'Em Design da Tabela, escolha um estilo da galeria que não seja a grade crua com que ela nasceu.',
      'Se as guias sumiram, o cursor saiu da tabela — elas são contextuais, e é assim que o Word faz.',
    ],
    feita: (d) => {
      const t = tabelaDaLista(d);
      return !!t && t.cabecalho && t.estilo !== ESTILO_PADRAO_DE_TABELA;
    },
  },
  {
    id: 'linhas-e-colunas',
    titulo: 'Acrescentar a inscrita que faltou e tirar a coluna do pagamento',
    detalhe: `Rute Almeida chegou no sábado de manhã, depois de a lista ser fechada. E a coluna `
      + `"${COLUNA_A_TIRAR}" não vai para o mural: quem pagou e quem não pagou é assunto da `
      + `tesouraria com a família. Apagar o conteúdo das células não tira a coluna — deixa a coluna vazia lá.`,
    onde: 'Layout da Tabela › Inserir Abaixo e Excluir › Colunas',
    passos: [
      'Clique na última linha da tabela e use Layout da Tabela › Inserir Abaixo.',
      'Escreva o nome e a unidade de quem faltava na linha nova.',
      `Clique numa célula da coluna "${COLUNA_A_TIRAR}" e use Excluir › Colunas.`,
      'Repare na diferença: Delete nas células esvazia, Excluir › Colunas tira.',
    ],
    feita: (d) => {
      const t = tabelaDaLista(d);
      if (!t) return false;
      const semPagamento = !t.linhas[0]?.some(c => c.trim() === COLUNA_A_TIRAR);
      const temAQueFaltava = t.linhas
        .some(l => l[0]?.trim().toLocaleLowerCase('pt-BR') === INSCRITA_QUE_FALTA[0].toLocaleLowerCase('pt-BR'));
      return semPagamento && temAQueFaltava;
    },
  },
  {
    id: 'imagem',
    titulo: 'Inserir a foto da fogueira onde o texto fala dela',
    detalhe: 'A foto entra na seção que conta a noite de sábado, e não no fim do documento. Imagem '
      + 'longe do parágrafo que a explica obriga quem lê a procurar de qual das coisas ela é.',
    onde: 'Inserir › Ilustrações › Imagem',
    passos: [
      'Clique no parágrafo que conta a fogueira, na seção "A noite de sábado".',
      'Abra a guia Inserir e escolha Imagem.',
      `Escolha "${FOTO_DA_FOGUEIRA.arquivo}".`,
    ],
    feita: d => fotoDaFogueira(d)?.secao === FOTO_DA_FOGUEIRA.secao,
  },
  {
    id: 'disposicao',
    titulo: 'Ajustar a foto ao texto',
    detalhe: 'Inserida, a imagem nasce alinhada com o texto: ela é uma letra gigante e empurra a linha '
      + 'inteira. Escolha uma disposição que **arrume** o texto em volta dela — quadrada, próxima ou '
      + 'acima e abaixo. Atrás e à frente não arrumam nada: elas fazem o texto ignorar a imagem.',
    onde: 'Formato da Imagem › Dispor Texto',
    passos: [
      'Clique na foto que você inseriu.',
      'Abra a guia Formato da Imagem e o botão Dispor Texto.',
      'Experimente as seis e olhe o que cada uma faz com o texto em volta.',
      'Fique com uma das três que contornam a imagem.',
    ],
    feita: (d) => {
      const foto = fotoDaFogueira(d);
      return !!foto && DISPOSICOES_QUE_AJUSTAM.includes(foto.disposicao);
    },
  },
  {
    id: 'legendas',
    titulo: 'Legendar as duas figuras por campo',
    detalhe: 'A legenda do mastro foi digitada, e por isso ela continua dizendo "Figura 1" agora que '
      + 'há uma figura antes dela — o documento tem duas Figura 1, e nada avisa. Legenda é campo: '
      + 'insira a da foto nova por Inserir Legenda e refaça a velha do mesmo jeito. O fundo cinza é '
      + 'o Word dizendo qual das duas se numera sozinha.',
    onde: 'Referências › Legendas › Inserir Legenda',
    passos: [
      'Clique na foto que você inseriu e use Referências › Inserir Legenda.',
      'Escreva o que a foto mostra. O "Figura 1" da frente não se digita: ele já vem, e é campo.',
      'Agora olhe a legenda do mastro, mais abaixo: ela também diz "Figura 1".',
      'Apague-a, clique na foto do mastro e insira a legenda dela pelo mesmo caminho.',
      'Repare no número: ele virou 2 sozinho, porque agora há uma figura antes.',
    ],
    feita: (d) => {
      const legendas = legendasDoDoc(d);
      /* Duas, e as duas por campo. Sem exigir que existam, "todas são campo"
         seria verdade num documento sem legenda nenhuma — que é a armadilha do
         "zero link não é zero link quebrado" aplicada a esta tarefa. */
      return legendas.length === 2 && legendas.every(legendaEhCampo);
    },
  },
];

export const metaDaVez = (d: Doc) =>
  METAS_DO_RELATORIO.find(m => !m.feita(d)) ?? null;

export {
  textoDoBloco, textoDoDoc, paragrafos, larguraDaTabela,
  ehTabela, ehImagem,
};
