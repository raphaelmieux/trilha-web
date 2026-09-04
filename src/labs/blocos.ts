/**
 * O modelo de um projeto de blocos, e o catálogo de blocos que existem.
 *
 * ── Por que um editor nosso, e não o Scratch embutido ────────────────────
 * A vereda cobra "demonstrar um laço", "criar uma variável e alterá-la durante
 * a execução", "dois atores que interajam". Nada disso se confere de fora
 * do Scratch: embutido num iframe, ele é uma caixa fechada, e o laboratório
 * cairia em "clicou em salvar, então passou" — que é o laboratório que abre
 * resolvido, escrito de outro jeito.
 *
 * Sendo nosso o modelo do projeto, a verificação olha a árvore de blocos e
 * responde à pergunta que o documento faz. É a mesma escolha do validador de
 * CSS: analisar o que foi construído, e não procurar texto.
 *
 * ── E imita o Scratch de propósito ───────────────────────────────────────
 * A regra da casa é que editor de código não imita marca, porque o desbravador
 * pode encontrar qualquer editor. Scratch não é assim: ele é *aquele* programa,
 * como o Word e o Explorador. Então as categorias, as cores e o arranjo são os
 * dele — é o que a pessoa vai reconhecer ao abrir o Scratch de verdade.
 *
 * ── A pilha é uma lista, e não uma tela livre ────────────────────────────
 * No Scratch os blocos ficam soltos numa área e se encaixam por arrasto. Aqui
 * cada script é uma coluna: clicar na paleta acrescenta ao fim, e a ordem se
 * muda arrastando ou pelas setas. O desenho é o mesmo — blocos coloridos
 * empilhados —, e some o que no celular não funciona: arrastar num canvas com
 * o dedo, que é onde o Scratch mais machuca quem não tem computador.
 */

/** A tecla que um chapéu ou um sensor observa. São as do Scratch. */
export type Tecla = 'direita' | 'esquerda' | 'cima' | 'baixo' | 'espaço';

export const TECLAS: Tecla[] = ['direita', 'esquerda', 'cima', 'baixo', 'espaço'];

/** O que uma condição pergunta. Toda pergunta é sobre o estado de agora. */
export type Condicao =
  /** Este ator está encostando em quem? `borda` é a beirada do palco. */
  | { tipo: 'tocando'; quem: string }
  | { tipo: 'teclaPressionada'; tecla: Tecla }
  | { tipo: 'variavelMaiorQue'; nome: string; valor: number };

/**
 * Um bloco.
 *
 * Os três primeiros são chapéus: começam uma pilha e dizem quando ela roda.
 * `repita`, `sempre` e `se` carregam outros blocos dentro — é o que o Scratch
 * desenha como um C.
 */
export type Bloco =
  | { id: string; tipo: 'quandoBandeira' }
  | { id: string; tipo: 'quandoTecla'; tecla: Tecla }
  | { id: string; tipo: 'quandoClicado' }
  | { id: string; tipo: 'mover'; passos: number }
  | { id: string; tipo: 'subir'; passos: number }
  | { id: string; tipo: 'irPara'; x: number; y: number }
  | { id: string; tipo: 'proximaFantasia' }
  | { id: string; tipo: 'diga'; texto: string }
  | { id: string; tipo: 'toqueSom' }
  | { id: string; tipo: 'espere'; segundos: number }
  | { id: string; tipo: 'repita'; vezes: number; corpo: Bloco[] }
  | { id: string; tipo: 'sempre'; corpo: Bloco[] }
  | { id: string; tipo: 'se'; condicao: Condicao; corpo: Bloco[] }
  | { id: string; tipo: 'definaVariavel'; nome: string; valor: number }
  | { id: string; tipo: 'mudeVariavel'; nome: string; por: number }
  | { id: string; tipo: 'pareTudo' };

export type TipoDeBloco = Bloco['tipo'];

/** Uma pilha de blocos. A primeira posição é sempre um chapéu. */
export interface Pilha {
  id: string;
  blocos: Bloco[];
}

export interface Ator {
  id: string;
  nome: string;
  /** Os fantasias, como emoji: trocar de fantasia troca o desenho na tela. */
  fantasias: string[];
  x: number;
  y: number;
  pilhas: Pilha[];
}

export interface Projeto {
  atores: Ator[];
  /** As variáveis do projeto, com o valor inicial que elas têm ao começar. */
  variaveis: { nome: string; valor: number }[];
}

/*
  O palco tem o tamanho do palco do Scratch, e a origem no meio.

  480×360 com (0,0) no centro é o sistema que o Scratch usa, e é o que a pessoa
  vai reencontrar. Traduzir para "canto superior esquerdo" aqui pouparia uma
  conta e ensinaria coordenada errada.
*/
export const PALCO = { largura: 480, altura: 360 };

/** As categorias, na ordem e nas cores do Scratch. */
export const CATEGORIAS = [
  { id: 'movimento', nome: 'Movimento', cor: '#4C97FF' },
  { id: 'aparencia', nome: 'Aparência', cor: '#9966FF' },
  { id: 'som', nome: 'Som', cor: '#CF63CF' },
  { id: 'eventos', nome: 'Eventos', cor: '#FFBF00' },
  { id: 'controle', nome: 'Controle', cor: '#FFAB19' },
  { id: 'sensores', nome: 'Sensores', cor: '#5CB1D6' },
  { id: 'variaveis', nome: 'Variáveis', cor: '#FF8C1A' },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]['id'];

/** A que categoria cada bloco pertence — é dela que sai a cor. */
export const CATEGORIA_DO_BLOCO: Record<TipoDeBloco, Categoria> = {
  quandoBandeira: 'eventos',
  quandoTecla: 'eventos',
  quandoClicado: 'eventos',
  mover: 'movimento',
  subir: 'movimento',
  irPara: 'movimento',
  proximaFantasia: 'aparencia',
  diga: 'aparencia',
  toqueSom: 'som',
  espere: 'controle',
  repita: 'controle',
  sempre: 'controle',
  se: 'controle',
  definaVariavel: 'variaveis',
  mudeVariavel: 'variaveis',
  pareTudo: 'controle',
};

export const corDoBloco = (tipo: TipoDeBloco): string =>
  CATEGORIAS.find(c => c.id === CATEGORIA_DO_BLOCO[tipo])!.cor;

/** Os chapéus — os únicos que podem abrir uma pilha. */
export const CHAPEUS: TipoDeBloco[] = ['quandoBandeira', 'quandoTecla', 'quandoClicado'];

export const ehChapeu = (b: Bloco) => CHAPEUS.includes(b.tipo);

/** Os que carregam outros dentro. */
export const ehContainer = (b: Bloco): b is Extract<Bloco, { corpo: Bloco[] }> =>
  b.tipo === 'repita' || b.tipo === 'sempre' || b.tipo === 'se';

/**
 * O texto do bloco, palavra por palavra como o Scratch pt-BR o escreve.
 *
 * ── Por que aqui, e não na tela ──────────────────────────────────────────
 * A verificação também precisa dele: a lista de tarefas cita o bloco pelo nome
 * que a pessoa vê, e dois textos diferentes para o mesmo bloco mandariam
 * procurar uma coisa que não existe.
 *
 * ── Por que exatamente estas palavras ────────────────────────────────────
 * Este editor é a reserva do Scratch embutido, e a lição é a mesma nos dois.
 * Uma reserva que chamasse os blocos de outro jeito faria o desbravador
 * procurar na paleta do Scratch de verdade um bloco que não está lá — que é o
 * mesmo defeito de errar a cor da categoria, só que nas palavras.
 *
 * A fonte é `scratch-l10n`, o arquivo de tradução do próprio MIT, e
 * `blocos.test.ts` confere cada linha daqui contra ele. Foi assim que se
 * descobriu que "defina placar para 0" e "mude placar em 1" não existem: são
 * "mude placar para 0" e "adicione 1 a placar".
 */
export function textoDoBloco(b: Bloco): string {
  switch (b.tipo) {
    /* O %1 do bloco é o desenho da bandeira verde, e não a palavra. */
    case 'quandoBandeira': return `quando ${BANDEIRA} for clicado`;
    case 'quandoTecla': return `quando a tecla ${b.tecla} for pressionada`;
    case 'quandoClicado': return 'quando este ator for clicado';
    case 'mover': return `mova ${b.passos} passos`;
    /* Não existe "suba": subir é somar em y, e é assim que o bloco se chama. */
    case 'subir': return `adicione ${b.passos} a y`;
    case 'irPara': return `vá para x: ${b.x} y: ${b.y}`;
    case 'proximaFantasia': return 'próxima fantasia';
    case 'diga': return `diga ${b.texto}`;
    case 'toqueSom': return 'toque o som Miau';
    case 'espere': return `espere ${b.segundos} seg`;
    case 'repita': return `repita ${b.vezes} vezes`;
    case 'sempre': return 'sempre';
    case 'se': return `se ${textoDaCondicao(b.condicao)} então`;
    /* "defina X para" e "mude X em" eram invenção nossa: no Scratch quem troca
       o valor é "mude ... para", e quem soma é "adicione ... a". Os nomes são
       quase trocados em relação ao que a intuição sugere, e é justamente por
       isso que inventar outros custava caro. */
    case 'definaVariavel': return `mude ${b.nome} para ${b.valor}`;
    case 'mudeVariavel': return `adicione ${b.por} a ${b.nome}`;
    case 'pareTudo': return 'pare todos';
  }
}

/** O desenho da bandeira verde, que no bloco ocupa o lugar de uma palavra. */
export const BANDEIRA = '⚑';

export function textoDaCondicao(c: Condicao): string {
  switch (c.tipo) {
    /* Os sensores terminam em interrogação: eles são a pergunta. */
    case 'tocando': return `tocando em ${c.quem}?`;
    case 'teclaPressionada': return `tecla ${c.tecla} pressionada?`;
    case 'variavelMaiorQue': return `${c.nome} > ${c.valor}`;
  }
}

/** Percorre a árvore inteira de um projeto, entrando nos containers. */
export function todosOsBlocos(projeto: Projeto): Bloco[] {
  const saida: Bloco[] = [];
  const descer = (blocos: Bloco[]) => {
    for (const b of blocos) {
      saida.push(b);
      if (ehContainer(b)) descer(b.corpo);
    }
  };
  for (const p of projeto.atores) for (const pilha of p.pilhas) descer(pilha.blocos);
  return saida;
}

/** Um id novo, curto o bastante para caber no rascunho. */
let contador = 0;
export const novoId = (prefixo = 'b') => `${prefixo}${(contador += 1).toString(36)}`;
