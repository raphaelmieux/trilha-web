import {
  linhaDe, textoDoBloco, paragrafos, fonteDoCorpo, PAGINA_PADRAO,
  type Doc as DocDoWord, type Paragrafo, type Trecho,
} from './documento';
import { marcaEfetiva, type Marca } from './edicao';

/*
  AP042 requisito 3 — o documento e as sete demonstrações de formatação.

  ── O documento chega com a folha errada e sem formatação nenhuma ───────
  Papel Carta, deitado, com margem estreita; tudo em Calibri 11, alinhado à
  esquerda, sem lista. É assim que chega o arquivo que alguém digitou às
  pressas, e é por isso que cada tarefa abre vermelha: nada do que o
  requisito pede está feito, e `metasDaAp042.test.ts` confere isso.

  ── As tarefas leem o texto, e não o id do parágrafo ─────────────────────
  Com cursor de verdade, o desbravador pode apagar um parágrafo e escrevê-lo
  de novo, ou partir um em dois sem querer. Uma meta presa ao id deixaria de
  achar o título no primeiro Enter fora do lugar; a que procura pela frase
  continua achando enquanto a frase estiver lá.

  ── O nome do livro, e não o parágrafo inteiro ──────────────────────────
  A tarefa de itálico pedia o parágrafo que cita o livro. No Word, quem
  aprende itálico aprende para isso: título de obra vai em itálico, e o resto
  da frase não. Pedir o nome do livro obriga a selecionar um pedaço da linha,
  que é o gesto que um parágrafo escolhido inteiro nunca exercitou.
*/

export type Secao = 'texto';
export type Doc = DocDoWord<Secao>;

const linha = (id: string, texto: string) => linhaDe<Secao>(id, 'texto', texto);

export const NOME_DO_CLUBE = 'Clube de Desbravadores Pioneiros';
export const NOME_DO_LIVRO = 'O Maior Discurso de Cristo';

export const DOC_DA_FORMATACAO: Doc = {
  blocos: [
    linha('clube', NOME_DO_CLUBE),
    linha('titulo', 'Relatório do acampamento da Unidade Falcão'),
    linha('p1', 'A nossa unidade passou três dias no acampamento regional, com outras onze unidades. Montamos a barraca no sábado de manhã, cozinhamos as três refeições do domingo e participamos da caminhada de doze quilômetros na segunda-feira, antes de desmontar tudo.'),
    linha('p2', `Nas noites, o estudo foi do livro ${NOME_DO_LIVRO}, e cada unidade apresentou uma parte para as outras. A nossa ficou com o trecho sobre a mansidão.`),
    linha('rot-mat', 'Material que cada um levou:'),
    linha('m1', 'Saco de dormir e isolante'),
    linha('m2', 'Lanterna com pilha de reserva'),
    linha('m3', 'Prato, caneca e talher'),
    linha('rot-pas', 'Como montamos a barraca, na ordem:'),
    linha('s1', 'Escolher o terreno mais alto e sem pedra'),
    linha('s2', 'Estender a lona e prender as estacas'),
    linha('s3', 'Levantar as varetas e esticar as cordas'),
    linha('ass', 'Curitiba, 12 de outubro'),
  ],
  colunas: { texto: 1 },
  sumario: null,
  pagina: { papel: 'Carta', orientacao: 'paisagem', margens: 'estreita' },
};

/* As frases que identificam cada parte. Curtas, e do começo do parágrafo,
   para sobreviverem a quem corrige uma palavra no meio. */
const TITULO = 'Relatório do acampamento';
const CORPO = ['A nossa unidade passou', 'Nas noites, o estudo'];
const MATERIAIS = ['Saco de dormir', 'Lanterna com pilha', 'Prato, caneca'];
const PASSOS = ['Escolher o terreno', 'Estender a lona', 'Levantar as varetas'];
const DATA = 'Curitiba, 12 de outubro';

export const acharParagrafo = (d: Doc, frase: string): Paragrafo<Secao> | null =>
  paragrafos(d).find(b => textoDoBloco(b).includes(frase)) ?? null;

const todos = (d: Doc, frases: string[]) => {
  const achados = frases.map(f => acharParagrafo(d, f));
  return achados.every(Boolean) ? (achados as Paragrafo<Secao>[]) : null;
};

/** Cada caractere com o trecho de onde ele veio. */
function caracteres(b: Paragrafo<Secao>): { c: string; x: Trecho }[] {
  return b.trechos.flatMap(x => (x.campo ? [] : [...x.texto].map(c => ({ c, x }))));
}

/** Todo caractere visível de `frase` (ou do parágrafo inteiro) tem a marca? */
function comMarca(d: Doc, b: Paragrafo<Secao>, m: Marca, frase?: string): boolean {
  const cs = caracteres(b);
  const texto = cs.map(k => k.c).join('');
  const de = frase ? texto.indexOf(frase) : 0;
  if (de < 0) return false;
  const ate = frase ? de + frase.length : texto.length;
  const alvo = cs.slice(de, ate).filter(k => k.c.trim() !== '');
  return alvo.length > 0 && alvo.every(k => marcaEfetiva(d, b, k.x, m));
}

/** Todo trecho com letra do parágrafo responde que sim. */
const cadaTrecho = (b: Paragrafo<Secao>, f: (x: Trecho) => boolean) => {
  const comTexto = b.trechos.filter(x => x.texto.trim() !== '');
  return comTexto.length > 0 && comTexto.every(f);
};

const naoVazios = (d: Doc) => paragrafos(d).filter(b => textoDoBloco(b).trim() !== '');

export interface ContextoDaFormatacao {
  doc: Doc;
  /** Colou alguma coisa no documento — pelo Ctrl+V ou pelo botão. */
  colou: boolean;
}

export interface MetaDaFormatacao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaFormatacao) => boolean;
}

export const METAS_DA_FORMATACAO: MetaDaFormatacao[] = [
  {
    id: 'folha',
    titulo: 'Acertar a folha',
    detalhe: 'Deixe o papel em A4, na orientação retrato e com margens normais. O documento chegou com a folha errada.',
    onde: 'Layout › Configurar Página',
    passos: [
      'Clique na guia Layout.',
      'Em Tamanho, escolha A4.',
      'Em Orientação, escolha Retrato — a folha fica em pé.',
      'Em Margens, escolha Normal. Repare na régua mudando junto.',
    ],
    feita: ({ doc }) => {
      const p = doc.pagina ?? PAGINA_PADRAO;
      return p.papel === 'A4' && p.orientacao === 'retrato' && p.margens === 'normal';
    },
  },
  {
    id: 'copiar',
    titulo: 'Copiar e colar',
    detalhe: 'O nome do clube precisa aparecer também no fim, embaixo da data. Copie a primeira linha e cole numa linha nova depois da data.',
    onde: 'Início › Área de Transferência — ou Ctrl+C e Ctrl+V',
    passos: [
      'Selecione a primeira linha, com o nome do clube: arraste por cima dela, ou clique três vezes.',
      'Aperte Ctrl+C, ou o botão Copiar.',
      'Clique no fim da data, a última linha, e aperte Enter para abrir uma linha nova.',
      'Aperte Ctrl+V, ou o botão Colar.',
    ],
    feita: ({ doc, colou }) => {
      const linhas = naoVazios(doc).map(b => textoDoBloco(b).trim());
      return colou
        && linhas.filter(t => t === NOME_DO_CLUBE).length >= 2
        && linhas[linhas.length - 1] === NOME_DO_CLUBE
        && linhas[linhas.length - 2] === DATA;
    },
  },
  {
    id: 'fonte',
    titulo: 'Trocar a fonte e o tamanho',
    detalhe: 'O título tem que se destacar: escolha outra fonte para ele e um tamanho de 18 ou mais.',
    onde: 'Início › Fonte',
    passos: [
      'Selecione o título inteiro, a segunda linha.',
      'Na caixa de fonte, onde está escrito Calibri, escolha outra.',
      'Na caixa de tamanho, ao lado, escolha 18 ou mais — ou digite o número e aperte Enter.',
    ],
    feita: ({ doc }) => {
      const t = acharParagrafo(doc, TITULO);
      return !!t && cadaTrecho(t, x =>
        !!x.direta?.fonte && x.direta.fonte !== fonteDoCorpo(doc) && (x.direta.tamanho ?? 11) >= 18);
    },
  },
  {
    id: 'destaque',
    titulo: 'Usar negrito, itálico e sublinhado',
    detalhe: `Título em negrito. O nome do livro — ${NOME_DO_LIVRO} — em itálico, e só ele. A data sublinhada.`,
    onde: 'Início › Fonte — ou Ctrl+N, Ctrl+I e Ctrl+S',
    passos: [
      'Selecione o título e aperte Negrito (Ctrl+N).',
      'Selecione só o nome do livro, no segundo parágrafo, e aperte Itálico (Ctrl+I).',
      'Selecione a data, na última linha, e aperte Sublinhado (Ctrl+S).',
      'Dica: dois cliques selecionam uma palavra; com Shift e as setas a seleção cresce letra por letra.',
    ],
    feita: ({ doc }) => {
      const t = acharParagrafo(doc, TITULO);
      const p2 = acharParagrafo(doc, NOME_DO_LIVRO);
      const data = acharParagrafo(doc, DATA);
      return !!t && !!p2 && !!data
        && comMarca(doc, t, 'negrito')
        && comMarca(doc, p2, 'italico', NOME_DO_LIVRO)
        /* "E só ele": itálico no parágrafo inteiro também deixaria o nome em
           itálico, e é justamente o que a tarefa não pede. */
        && !comMarca(doc, p2, 'italico', 'Nas noites')
        && comMarca(doc, data, 'sublinhado', DATA);
    },
  },
  {
    id: 'alinhar',
    titulo: 'Alinhar cada parte',
    detalhe: 'Título centralizado, os dois parágrafos do corpo justificados e a data alinhada à direita.',
    onde: 'Início › Parágrafo — ou Ctrl+E, Ctrl+J e Ctrl+G',
    passos: [
      'Clique em qualquer ponto do título e aperte Centralizar (Ctrl+E). O alinhamento vale para o parágrafo inteiro.',
      'Selecione os dois parágrafos do corpo e aperte Justificar (Ctrl+J).',
      'Clique na data e aperte Alinhar à Direita (Ctrl+G).',
    ],
    feita: ({ doc }) => {
      const t = acharParagrafo(doc, TITULO);
      const corpo = todos(doc, CORPO);
      const data = acharParagrafo(doc, DATA);
      return t?.formato?.alinhamento === 'centro'
        && !!corpo && corpo.every(b => b.formato?.alinhamento === 'justificado')
        && data?.formato?.alinhamento === 'direita';
    },
  },
  {
    id: 'espacar',
    titulo: 'Ajustar o espaçamento',
    detalhe: 'Os dois parágrafos do corpo com espaçamento entre linhas de 1,5, que é o pedido em trabalho escolar.',
    onde: 'Início › Parágrafo › Espaçamento de Linha e Parágrafo',
    passos: [
      'Selecione os dois parágrafos do corpo.',
      'No grupo Parágrafo, abra o botão de espaçamento — as setas para cima e para baixo.',
      'Escolha 1,5.',
    ],
    feita: ({ doc }) => {
      const corpo = todos(doc, CORPO);
      return !!corpo && corpo.every(b => b.formato?.entrelinha === 1.5);
    },
  },
  {
    id: 'listas',
    titulo: 'Usar marcadores e numeração',
    detalhe: 'O material vira lista com marcadores — a ordem não importa. A montagem da barraca vira lista numerada, porque ali a ordem importa.',
    onde: 'Início › Parágrafo',
    passos: [
      'Selecione as três linhas do material e aperte Marcadores.',
      'Selecione as três linhas da montagem e aperte Numeração.',
      'Repare: o número é do Word, e não digitado. Apague uma linha do meio e ele se refaz sozinho.',
    ],
    feita: ({ doc }) => {
      const mat = todos(doc, MATERIAIS);
      const pas = todos(doc, PASSOS);
      return !!mat && mat.every(b => b.formato?.lista === 'marcadores')
        && !!pas && pas.every(b => b.formato?.lista === 'numeracao');
    },
  },
];
