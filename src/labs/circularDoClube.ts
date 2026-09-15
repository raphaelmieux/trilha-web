import {
  linhaDe, textoDoBloco, textoDoDoc, paragrafosVazios,
  type Doc as DocDoWord, type Bloco as BlocoDoWord,
} from './documento';

/*
  A circular do módulo 2: o documento em que alguém usou o Enter como régua.

  ── Por que ele também parece pronto ─────────────────────────────────────
  É o mesmo engano do relatório do módulo 1, com outra causa. Aqui não há
  formatação direta nenhuma: o problema é **estrutural**, e por isso ainda
  mais invisível. Cinco parágrafos vazios empurram a assinatura para o pé da
  folha, e o endereço do clube foi escrito com três Enters. Na tela do dia em
  que foi escrito, isso está impecável.

  O que denuncia é o que a teoria diz e a lição faz acontecer: acrescente uma
  frase no meio e o empurrão vai parar no lugar errado. Foi para isso que a
  meta `cresceu` existe — ela **insere** o parágrafo que o documento real
  ganharia na revisão seguinte, e aí os cinco Enters deixam de empurrar até
  onde empurravam.

  ── E por que o botão de marcas precisa funcionar ────────────────────────
  A teoria escreve que, com as marcas desligadas, o Enter e o Shift+Enter são
  invisíveis "e o documento erra calado". Um laboratório sobre essa diferença
  em que ninguém pudesse ver a diferença cometeria, na própria tela, o defeito
  que a lição existe para nomear. Ligar as marcas é a primeira meta.
*/

export type Secao = 'cabeca' | 'corpo' | 'endereco' | 'assinatura';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;

const linha = (id: string, secao: Secao, texto: string): Bloco =>
  linhaDe(id, secao, texto);

/** Um parágrafo vazio: o Enter apertado para empurrar. */
const vazio = (id: string, secao: Secao): Bloco => linhaDe(id, secao, '');

/**
 * A circular como ela chega.
 *
 * O endereço vem como **três parágrafos** — é o defeito do requisito 2.3, e ele
 * se vê pelos vãos entre as linhas. Os cinco vazios antes da assinatura são o
 * outro. E a fonte não está escolhida: o documento é para ser impresso e
 * entregue em papel, e ninguém decidiu nada sobre isso.
 */
export const CIRCULAR_INICIAL: Doc = {
  blocos: [
    linha('titulo', 'cabeca', 'Circular às famílias — Acampamento de Inverno'),
    linha('ab-1', 'corpo', 'Prezadas famílias, o clube realizará o acampamento de inverno no fim de semana de 20 a 22 de junho, no sítio da regional. A saída é na sexta às 18h, da igreja, e o retorno é no domingo por volta das 12h.'),
    linha('ab-2', 'corpo', 'A ficha de autorização segue anexa e precisa voltar assinada até 10 de junho. Sem ela o desbravador não embarca — é exigência do seguro, e não do clube.'),
    linha('ab-3', 'corpo', 'A contribuição é de sessenta reais por desbravador, e cobre transporte e alimentação. Quem precisar de ajuda deve falar com a liderança da unidade; ninguém fica de fora por dinheiro.'),

    /* O endereço, escrito com Enter. São três parágrafos, e os vãos aparecem. */
    linha('end-1', 'endereco', 'Sítio Recanto da Regional'),
    linha('end-2', 'endereco', 'Rodovia DF-128, km 9'),
    linha('end-3', 'endereco', 'Sobradinho, DF'),

    /* Os cinco Enters que empurram a assinatura para o pé da folha. */
    vazio('v1', 'assinatura'),
    vazio('v2', 'assinatura'),
    vazio('v3', 'assinatura'),
    vazio('v4', 'assinatura'),
    vazio('v5', 'assinatura'),

    /* Uma linha só, e não duas coladas: dois trechos sem quebra saem grudados
       na tela — "PioneirosSobradinho" —, porque é exatamente isso que um
       parágrafo sem quebra de linha faz. E com quebra ela chegaria com a
       resposta do endereço desenhada dentro do próprio documento. */
    linha('assina', 'assinatura', 'Diretoria do Clube de Desbravadores Pioneiros — Sobradinho, 2 de junho de 2026'),
  ],
  colunas: { cabeca: 1, corpo: 1, endereco: 1, assinatura: 1 },
  sumario: null,
};

/** O parágrafo que a revisão seguinte acrescenta — e que desarruma o empurrão. */
export const PARAGRAFO_QUE_CHEGA = {
  id: 'ab-4',
  secao: 'corpo' as Secao,
  texto: 'Levem agasalho: a mínima prevista para o sábado é de seis graus, e a '
    + 'programação da noite é ao ar livre.',
};

export const TEXTO_ORIGINAL = textoDoDoc(CIRCULAR_INICIAL);

/** Os três parágrafos que deviam ser um só, com quebras de linha entre eles. */
export const IDS_DO_ENDERECO = ['end-1', 'end-2', 'end-3'];

/* ── As metas ─────────────────────────────────────────────────────────────── */

/** O que o laboratório registra e que não deixa marca no documento. */
export interface GestosDaCircular {
  /** As marcas de parágrafo estão ligadas. */
  marcas: boolean;
  /** O parágrafo da revisão já foi acrescentado. */
  cresceu: boolean;
}

export const gestosVazios = (): GestosDaCircular => ({ marcas: false, cresceu: false });

export interface ContextoDaCircular {
  doc: Doc;
  gestos: GestosDaCircular;
}

export interface MetaDaCircular {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaCircular) => boolean;
}

const um = (d: Doc, id: string) => d.blocos.find(b => b.id === id);

/** O endereço virou um parágrafo só, com as três linhas dentro dele. */
export function enderecoNumBlocoSo(d: Doc): boolean {
  const doEndereco = d.blocos.filter(b => b.secao === 'endereco');
  if (doEndereco.length !== 1) return false;
  const [b] = doEndereco;
  /* Três linhas lógicas, e as duas de baixo entrando por quebra — não basta
     ter um bloco só: colar as três num texto corrido perderia as linhas. */
  return b.trechos.length === 3 && b.trechos.slice(1).every(x => x.quebra === true);
}

export const METAS_DA_CIRCULAR: MetaDaCircular[] = [
  {
    id: 'marcas',
    titulo: 'Ligar as marcas de parágrafo',
    detalhe: 'O Enter e a quebra de linha são invisíveis com elas desligadas — e é por isso '
      + 'que um documento errado desse jeito passa por certo. Ligue antes de consertar qualquer coisa.',
    onde: 'Início › Parágrafo › Mostrar Tudo',
    passos: [
      'Na guia Início, no grupo Parágrafo, clique no botão com o símbolo ¶.',
      'Repare no que apareceu: um ¶ no fim de cada parágrafo, e cinco ¶ sozinhos antes da assinatura.',
    ],
    feita: c => c.gestos.marcas,
  },
  {
    id: 'endereco',
    titulo: 'Juntar o endereço num parágrafo só',
    detalhe: 'As três linhas do endereço são três parágrafos, e é por isso que há vão entre elas. '
      + 'Um endereço é uma coisa só com três linhas dentro — isso é quebra de linha, não Enter.',
    onde: 'Início › Parágrafo (Shift+Enter)',
    passos: [
      'Clique no fim da linha "Sítio Recanto da Regional".',
      'Apague o ¶ que está ali e ponha uma quebra de linha no lugar, com Shift+Enter.',
      'Repita entre a segunda e a terceira linha.',
      'Com as marcas ligadas, a seta virada ↵ aparece no lugar do ¶ — são as duas coisas diferentes que a lição separa.',
    ],
    feita: c => enderecoNumBlocoSo(c.doc),
  },
  {
    id: 'cresceu',
    titulo: 'Acrescentar o parágrafo que a revisão pediu',
    detalhe: 'A liderança pediu um aviso sobre o frio. Acrescente-o e olhe o que acontece com a '
      + 'assinatura: os cinco Enters continuam empurrando o mesmo tanto, e o tanto certo mudou.',
    onde: 'no corpo da circular',
    passos: [
      'Clique no fim do terceiro parágrafo do corpo.',
      'Use o botão "Acrescentar o parágrafo da revisão", que é o que a liderança mandou incluir.',
      'Veja onde a assinatura foi parar.',
    ],
    feita: c => c.gestos.cresceu,
  },
  {
    id: 'quebra',
    titulo: 'Trocar os Enters vazios por uma quebra de página',
    detalhe: 'Cinco parágrafos vazios empurram o que estiver embaixo, e só enquanto o texto de cima '
      + 'não mudar. Quebra de página empurra para a folha seguinte e continua certa depois.',
    onde: 'Inserir › Quebra de Página (Ctrl+Enter)',
    passos: [
      'Apague os cinco parágrafos vazios — com as marcas ligadas eles são os cinco ¶ sozinhos.',
      'Clique no parágrafo da assinatura.',
      'Ponha uma quebra de página antes dele, por Ctrl+Enter ou por Inserir › Quebra de Página.',
    ],
    feita: c => paragrafosVazios(c.doc).length === 0
      && !!um(c.doc, 'assina')?.quebraDePagina,
  },
  {
    id: 'fonte',
    titulo: 'Escolher a fonte pelo lugar em que o texto vai ser lido',
    detalhe: 'Esta circular vai impressa e entregue em papel, para ser lida inteira. '
      + 'Quem decide a fonte é onde o texto vai ser lido, e não o gosto de quem escreve.',
    onde: 'Início › Fonte',
    passos: [
      'Na guia Início, no grupo Fonte, abra a lista de famílias.',
      'Escolha uma serifada — Georgia ou Times New Roman —, que é a de texto longo no papel.',
    ],
    feita: c => c.doc.fonte === 'serifada',
  },
];

export const metaDaVez = (c: ContextoDaCircular) =>
  METAS_DA_CIRCULAR.find(m => !m.feita(c)) ?? null;

export { textoDoBloco, textoDoDoc, paragrafosVazios };
