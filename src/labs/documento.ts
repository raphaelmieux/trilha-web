/**
 * O documento de texto, como os laboratórios de Word o guardam.
 *
 * ── Por que ele saiu do arquivo de metas ─────────────────────────────────
 * Ele morava em `metasDaAp044.ts`, misturado com o que aquele exercício cobra,
 * e saiu no dia em que a CC-ES002 precisou do mesmo documento — antes de a
 * cópia existir, e não depois. É a decisão de `word.tsx`, de `excel.tsx` e de
 * `explorer.tsx`, um nível abaixo: duas cópias do modelo divergem no primeiro
 * ajuste, e aí o mesmo "Word" passa a guardar duas coisas diferentes.
 *
 * O que ficou aqui é do **documento**: o que é um parágrafo, o que é um
 * estilo, o que o sumário lê. O que ficou lá é do **exercício**: de que
 * documento se parte e o que se cobra dele.
 *
 * ── O sumário guarda o que leu, e isso é do modelo ───────────────────────
 * `sumario` é uma lista gravada, e não uma conta feita na hora. Não é preguiça
 * de modelagem: é o comportamento do Word, e é a metade da lição que ninguém
 * conta — trocar um título depois de gerar deixa o sumário mostrando o texto
 * velho, e nada na tela avisa. Um modelo que recalculasse o sumário a cada
 * leitura apagaria a lição inteira, e o laboratório passaria a premiar um
 * cuidado que ele não teve como cobrar.
 *
 * ── A seção é um parâmetro, e não uma lista fechada ──────────────────────
 * Cada laboratório tem as seções do documento dele — a AP044 tem capa,
 * abertura e programação; a CC-ES002 terá outras. Deixar a lista aqui
 * obrigaria os dois a caber na mesma, e a alternativa preguiçosa seria trocar
 * tudo por `string`, o que devolveria o erro de digitar uma seção que não
 * existe. Com o parâmetro, cada lado declara a sua e continua conferido.
 */

import type { CSSProperties } from 'react';

/* ── Estilos ──────────────────────────────────────────────────────────────── */

/**
 * Os estilos de parágrafo que os laboratórios da plataforma desenham.
 *
 * A lista é do Word, e não de um exercício: cada laboratório oferece na galeria
 * dele os que a lição usa, e os outros continuam existindo no modelo. Foi assim
 * que a AP044 pôde ficar com quatro sem que a CC-ES002 tivesse de inventar
 * nomes novos para Título 3 e Legenda.
 *
 * Ênfase não está aqui: ela é estilo de **caractere**, vale para o trecho
 * selecionado e mora em `Trecho`. A diferença não é detalhe de implementação —
 * é a razão de Ênfase não entrar no sumário e Título 2 entrar.
 */
export type Estilo =
  | 'Normal'
  | 'Título 1'
  | 'Título 2'
  | 'Título 3'
  | 'Subtítulo'
  | 'Citação'
  | 'Legenda';

/** Os estilos que o sumário procura, e o nível que cada um rende. */
export const NIVEL_DO_TITULO: Partial<Record<Estilo, 1 | 2 | 3>> = {
  'Título 1': 1,
  'Título 2': 2,
  'Título 3': 3,
};

export const ehTitulo = (e: Estilo) => NIVEL_DO_TITULO[e] !== undefined;

export type Posicao = 'normal' | 'sobrescrito' | 'subscrito';
export type Realce = 'nenhum' | 'amarelo' | 'verde' | 'ciano' | 'rosa';

/* ── Aparência de cada estilo, com os números do Word ───────────────────────
   Título 1 é 16 pt azul #2F5496, Título 2 é 13 pt no mesmo azul, Citação é
   itálico recuado. Não são escolhas nossas: é o que a galeria de Estilos do
   Word aplica, e o desbravador precisa reconhecer o resultado lá.

   Ela mora junto da lista dos estilos, e não no laboratório, por dois motivos.
   O primeiro é o de sempre: dois laboratórios desenham a mesma galeria, e duas
   tabelas de aparência divergiriam no primeiro ajuste — o mesmo Título 1 sairia
   azul num e preto no outro. O segundo é que um estilo **é** o nome mais a
   aparência; separá-los deixaria a lista de nomes aqui e o que eles significam
   noutro arquivo, e acrescentar um estilo passaria a ser dois trabalhos, com o
   segundo fácil de esquecer.

   Nenhuma entrada usa a forma curta `margin`: misturar `margin` com
   `marginLeft` no mesmo objeto faz o React reclamar e, pior, deixa a ordem de
   aplicação decidir quem vence. Cada lado é escrito por extenso. */
export const APARENCIA_DO_ESTILO: Record<Estilo, CSSProperties> = {
  'Normal': {
    fontSize: 11, color: '#201F1E',
    marginTop: 0, marginBottom: 5, marginLeft: 0, marginRight: 0,
  },
  'Título 1': {
    fontSize: 16, color: '#2F5496', fontWeight: 400,
    marginTop: 10, marginBottom: 4, marginLeft: 0, marginRight: 0,
  },
  'Título 2': {
    fontSize: 13, color: '#2F5496', fontWeight: 600,
    marginTop: 8, marginBottom: 3, marginLeft: 0, marginRight: 0,
  },
  'Título 3': {
    fontSize: 12, color: '#1F3864', fontWeight: 600,
    marginTop: 6, marginBottom: 3, marginLeft: 0, marginRight: 0,
  },
  'Subtítulo': {
    fontSize: 13, color: '#5A5A5A', fontStyle: 'italic',
    marginTop: 2, marginBottom: 8, marginLeft: 0, marginRight: 0,
  },
  'Citação': {
    fontSize: 11, color: '#404040', fontStyle: 'italic',
    marginTop: 6, marginBottom: 6, marginLeft: 26, marginRight: 26,
  },
  'Legenda': {
    fontSize: 9, color: '#44546A', fontStyle: 'italic',
    marginTop: 2, marginBottom: 8, marginLeft: 0, marginRight: 0,
  },
};

/* ── As peças ─────────────────────────────────────────────────────────────── */

/**
 * Formatação direta: negrito, tamanho e cor postos no trecho, por cima do que
 * o estilo dele já diz.
 *
 * É o que o requisito 6 da CC-ES002 manda substituir por estilo, e por isso
 * precisa existir como estado — um documento em que ela não pudesse ser
 * representada não teria como chegar mal formatado, e o exercício inteiro
 * dependeria de acreditar num enunciado.
 *
 * Ela **vence** o estilo na hora de desenhar, como no Word. É essa precedência
 * que faz o documento mal formatado parecer pronto: os títulos estão em negrito
 * e grandes, só que continuam sendo parágrafos Normal — e o sumário, que lê
 * estilo e não aparência, sai vazio sem nada na tela explicando por quê.
 */
export interface Direta {
  negrito?: boolean;
  italico?: boolean;
  tamanho?: number;
  cor?: string;
}

/**
 * Um campo de numeração — o que `Referências › Inserir Legenda` insere.
 *
 * Ele não guarda o número: o número sai da **posição** entre os campos do
 * mesmo tipo, contada na hora de desenhar. É essa a diferença inteira do
 * requisito 4.3, e ela só existe se o modelo se recusar a guardar o número:
 * um campo que gravasse `'Figura 1'` seria texto digitado com outro nome, e
 * entrar uma figura no meio o deixaria dizendo 1 para sempre.
 */
export type Campo = 'figura' | 'tabela';

/** Como cada campo se lê na folha. */
export const NOME_DO_CAMPO: Record<Campo, string> = {
  figura: 'Figura',
  tabela: 'Tabela',
};

export interface Trecho {
  id: string;
  /**
   * O texto **digitado**. Num trecho que é campo ele fica vazio: o que se lê
   * ali é calculado, e guardar as duas coisas deixaria a folha mostrando uma e
   * a conferência lendo a outra.
   */
  texto: string;
  /** Quando presente, este trecho é um campo de numeração, e não texto. */
  campo?: Campo;
  /**
   * Quebra de linha **antes** deste trecho — o `Shift+Enter` do Word.
   *
   * Ela desce uma linha sem fechar o parágrafo, então mora dentro do bloco e
   * não entre blocos. É essa a diferença que o requisito 2.3 pede: três Enters
   * num endereço são três parágrafos, e ganham três vezes o espaçamento de
   * depois; duas quebras de linha são um parágrafo só, com as linhas coladas.
   *
   * Sem ela no modelo, o endereço só poderia ser escrito do jeito errado, e a
   * lição não teria o que consertar.
   */
  quebra?: boolean;
  /** Formatação direta, quando há. Ausente é o normal. */
  direta?: Direta;
  posicao: Posicao;
  realce: Realce;
  /** Estilo de caractere — o único é Ênfase, e é de propósito. */
  enfase: boolean;
  /**
   * Formatação direta que veio de fora e foi mantida na colagem.
   *
   * É o que "Manter Formatação Original" preserva e o que "Manter Somente
   * Texto" descarta: a fonte, o tamanho e a cor do lugar de origem, que não
   * são os do documento.
   */
  deFora?: boolean;
}

/**
 * O que todo bloco do corpo tem, seja ele parágrafo, tabela ou imagem.
 *
 * A quebra de página fica aqui e não no parágrafo porque `Ctrl+Enter` empurra
 * o que vier depois, e o que vem depois pode ser uma tabela. Deixá-la só no
 * parágrafo obrigaria quem quisesse a tabela na folha seguinte a pôr um
 * parágrafo vazio antes dela — que é exatamente o gesto que o módulo 2 existe
 * para desensinar.
 */
interface BlocoBase<S extends string> {
  id: string;
  secao: S;
  /**
   * Quebra de página antes deste bloco — `Ctrl+Enter`.
   *
   * É o que empurra texto para a folha seguinte sem os oito parágrafos vazios
   * que a teoria desaconselha. Os dois se parecem na tela do dia em que foram
   * escritos, e só um continua certo quando o texto de cima cresce.
   */
  quebraDePagina?: boolean;
}

export interface Paragrafo<S extends string = string> extends BlocoBase<S> {
  tipo: 'paragrafo';
  trechos: Trecho[];
  estilo: Estilo;
  /** Nota de rodapé pendurada neste parágrafo. */
  nota?: string;
}

/**
 * Os estilos da galeria de tabela, com os nomes do Word em português.
 *
 * `'Tabela com Grade'` é o que `Inserir › Tabela` aplica sozinho — a grade
 * crua, linha preta fina em tudo. Ela está na lista, e não fora dela, porque
 * é um estilo de verdade e não um estado de "sem estilo": tratá-la como
 * ausência obrigaria a folha a ter um desenho para o caso de não haver nenhum,
 * e aí a galeria passaria a ter quatro entradas em vez de três.
 */
export const ESTILOS_DE_TABELA = [
  'Tabela com Grade',
  'Tabela de Lista 3',
  'Tabela de Grade 4 — Ênfase 1',
] as const;

export type EstiloDeTabela = typeof ESTILOS_DE_TABELA[number];

/** O que `Inserir › Tabela` aplica sem ninguém escolher nada. */
export const ESTILO_PADRAO_DE_TABELA: EstiloDeTabela = 'Tabela com Grade';

export interface TabelaDoDoc<S extends string = string> extends BlocoBase<S> {
  tipo: 'tabela';
  /**
   * As células, linha a linha. Toda linha tem o mesmo número de células —
   * é o que `larguraDaTabela` confere, porque uma linha curta desenharia uma
   * tabela com buraco e nada estouraria.
   */
  linhas: string[][];
  /**
   * A primeira linha é cabeçalho.
   *
   * Não é enfeite: é ela que se repete no alto da folha seguinte quando a
   * tabela atravessa duas páginas. Uma tabela que muda de página sem cabeçalho
   * marcado vira, na segunda folha, uma tabela sem títulos de coluna — e quem
   * a lê não tem como saber o que é cada uma.
   */
  cabecalho: boolean;
  estilo: EstiloDeTabela;
}

/**
 * A disposição do texto em volta da imagem, com os seis nomes do Word.
 *
 * `'alinhada'` é como a imagem **nasce**: ela entra na linha como se fosse uma
 * letra gigante, empurrando o parágrafo inteiro. Os cinco outros a tiram da
 * linha — e só três deles arrumam o texto em volta dela, que é o que o
 * requisito 4.3 chama de ajustar ao texto.
 */
export type Disposicao =
  | 'alinhada'
  | 'quadrada'
  | 'proxima'
  | 'atras'
  | 'frente'
  | 'acima-e-abaixo';

export const NOMES_DA_DISPOSICAO: Record<Disposicao, string> = {
  alinhada: 'Alinhada com o Texto',
  quadrada: 'Quadrada',
  proxima: 'Próxima',
  atras: 'Atrás do Texto',
  frente: 'À Frente do Texto',
  'acima-e-abaixo': 'Acima e Abaixo',
};

/**
 * As disposições que de fato **arrumam o texto** em volta da imagem.
 *
 * Atrás e à frente não entram, e não é rigor nosso: elas fazem o texto
 * *ignorar* a imagem, que é o contrário de ajustá-la a ele. É a mesma
 * distinção do "abrir com" que não é "definir padrão" — dois comandos que se
 * parecem na hora de clicar e respondem a perguntas diferentes.
 */
export const DISPOSICOES_QUE_AJUSTAM: readonly Disposicao[] =
  ['quadrada', 'proxima', 'acima-e-abaixo'];

export interface ImagemDoDoc<S extends string = string> extends BlocoBase<S> {
  tipo: 'imagem';
  /** O nome do arquivo, que é o que o painel de informações mostra. */
  arquivo: string;
  /** O que a foto mostra. É isto que a folha desenha, já que não há foto. */
  descricao: string;
  disposicao: Disposicao;
}

/**
 * Um bloco do corpo do documento.
 *
 * Tabela e imagem **não são parágrafos**, e é por isso que elas são membros da
 * união em vez de campos pendurados num. No Word também não são: o cursor não
 * anda dentro delas como anda no texto, elas não têm estilo de parágrafo, e
 * elas convocam guias contextuais que o texto não convoca. Um `tabela?:` dentro
 * do parágrafo deixaria representável o parágrafo que é tabela **e** tem
 * trechos, que não existe — e cada leitor teria de lembrar qual dos dois vale.
 *
 * A legenda, sim, é parágrafo: no Word ela é um parágrafo de estilo Legenda com
 * um campo dentro. Pendurá-la na imagem tiraria dela o estilo, e com ele o
 * índice de figuras e a metade do requisito 4.3 que o módulo 1 já ensinou.
 */
export type Bloco<S extends string = string> =
  | Paragrafo<S>
  | TabelaDoDoc<S>
  | ImagemDoDoc<S>;

export const ehParagrafo = <S extends string>(b: Bloco<S>): b is Paragrafo<S> =>
  b.tipo === 'paragrafo';

export const ehTabela = <S extends string>(b: Bloco<S>): b is TabelaDoDoc<S> =>
  b.tipo === 'tabela';

export const ehImagem = <S extends string>(b: Bloco<S>): b is ImagemDoDoc<S> =>
  b.tipo === 'imagem';

/** Uma linha do sumário, como ela foi lida no momento em que ele foi gerado. */
export interface ItemDeSumario {
  texto: string;
  nivel: 1 | 2 | 3;
}

/**
 * O que a caixa "Modificar Estilo" do Word deixa mudar, e só isso.
 *
 * Não é `CSSProperties` de propósito: a caixa do Word oferece fonte, tamanho,
 * cor, negrito e itálico, e abrir a porta para qualquer propriedade CSS daria
 * ao laboratório poderes que o programa imitado não tem — que é a forma mais
 * rápida de a simulação ensinar um gesto que não existe.
 */
export interface AjusteDeEstilo {
  tamanho?: number;
  cor?: string;
  negrito?: boolean;
  italico?: boolean;
}

export interface Doc<S extends string = string> {
  blocos: Bloco<S>[];
  /**
   * As redefinições de estilo que moram **neste documento**.
   *
   * No Word o estilo é do documento, e não do programa: é por isso que mudar
   * Título 1 aqui não mexe no Título 1 de outro arquivo. Guardar as
   * redefinições num módulo global faria a plataforma inteira mudar de
   * aparência quando alguém mexesse num exercício — e faria o requisito 8
   * ("demonstrar que a alteração de um único estilo modifica o documento
   * inteiro") virar uma afirmação sobre o programa em vez de sobre o documento.
   */
  estilos?: Partial<Record<Estilo, AjusteDeEstilo>>;
  /**
   * A fonte do corpo do documento.
   *
   * Duas famílias, e não uma lista de nomes: o requisito 2.4 pede a distinção
   * entre serifada e sem serifa, e é ela que a decisão usa — "texto longo
   * impresso" contra "tela e título". Guardar "Times New Roman" como string
   * deixaria a trava conferindo um nome em vez da escolha, e qualquer fonte
   * nova pediria um novo `if`.
   */
  fonte?: 'serifada' | 'sem-serifa';
  /** Quantas colunas cada seção usa. Uma é o padrão do Word. */
  colunas: Record<S, number>;
  /**
   * O sumário, ou `null` enquanto ninguém mandou gerar.
   *
   * Ele guarda o que leu **na hora em que foi gerado**, pela razão escrita no
   * alto deste arquivo. Só "Atualizar Sumário" o alcança.
   */
  sumario: ItemDeSumario[] | null;
}

/* ── Montar ───────────────────────────────────────────────────────────────── */

export const trechoDe = (id: string, texto: string): Trecho =>
  ({ id, texto, posicao: 'normal', realce: 'nenhum', enfase: false });

/** Um trecho que é campo de numeração. O texto fica vazio de propósito. */
export const campoDe = (id: string, campo: Campo): Trecho =>
  ({ ...trechoDe(id, ''), campo });

export const blocoDe = <S extends string>(id: string, secao: S, trechos: Trecho[]): Paragrafo<S> =>
  ({ tipo: 'paragrafo', id, secao, trechos, estilo: 'Normal' });

export const linhaDe = <S extends string>(id: string, secao: S, texto: string): Paragrafo<S> =>
  blocoDe(id, secao, [trechoDe(`${id}-a`, texto)]);

/* ── Ler ──────────────────────────────────────────────────────────────────── */

/** Os parágrafos do documento, na ordem. Tabela e imagem não são parágrafos. */
export const paragrafos = <S extends string>(d: Doc<S>): Paragrafo<S>[] =>
  d.blocos.filter(ehParagrafo);

/**
 * O texto **digitado** de um bloco.
 *
 * Campo não entra: o que ele mostra é calculado, e somá-lo aqui faria o
 * "sem alterar uma palavra do texto" do requisito 6 acusar de edição uma
 * figura que entrou noutro lugar do documento.
 */
export const textoDoBloco = (b: Bloco<string>): string => {
  switch (b.tipo) {
    case 'paragrafo': return b.trechos.map(x => (x.campo ? '' : x.texto)).join('');
    /* As células, como o Word as copia: tabulação entre colunas, quebra entre
       linhas. É o mesmo texto que a conversão de tabela em texto devolveria. */
    case 'tabela': return b.linhas.map(l => l.join('\t')).join('\n');
    /* Imagem não tem texto. A legenda dela é outro bloco, e tem o próprio. */
    case 'imagem': return '';
    default: {
      const naoTratado: never = b;
      throw new Error(`bloco de tipo não tratado: ${JSON.stringify(naoTratado)}`);
    }
  }
};

/**
 * Todo o texto do documento, na ordem, sem formatação nenhuma.
 *
 * É com isto que se confere "sem alterar uma palavra do texto", que são as
 * palavras do requisito 6. A comparação é com o documento **de partida**, e não
 * com uma cópia feita no meio do caminho: quem apagasse um parágrafo e o
 * reescrevesse passaria por qualquer conferência que só olhasse para o estado
 * de agora.
 */
export const textoDoDoc = (d: Doc<string>) =>
  d.blocos.map(textoDoBloco).join('\n');

/**
 * Os parágrafos vazios — Enter apertado para empurrar texto.
 *
 * Ele olha só para parágrafos, e não para todo bloco sem texto: imagem não tem
 * texto nenhum, e contá-la aqui faria a meta do módulo 2 pedir que se apagasse
 * a foto para ficar verde.
 */
export const paragrafosVazios = <S extends string>(d: Doc<S>) =>
  paragrafos(d).filter(b => textoDoBloco(b).trim() === '');

/** As pilhas de nomes de fonte que cada família rende, com os nomes do Word. */
export const FONTES: Record<'serifada' | 'sem-serifa', string> = {
  serifada: 'Georgia, "Times New Roman", serif',
  'sem-serifa': 'Calibri, Arial, sans-serif',
};

/** Os parágrafos que ainda carregam formatação direta. */
export const comFormatacaoDireta = <S extends string>(d: Doc<S>) =>
  paragrafos(d).filter(b => b.trechos.some(x => x.direta && Object.keys(x.direta).length > 0));

/**
 * A aparência com que um estilo é desenhado **neste** documento: a do Word,
 * com a redefinição por cima quando existe.
 */
export function aparenciaDe(d: Doc<string>, e: Estilo): CSSProperties {
  const base = APARENCIA_DO_ESTILO[e];
  const ajuste = d.estilos?.[e];
  if (!ajuste) return base;
  return {
    ...base,
    ...(ajuste.tamanho !== undefined ? { fontSize: ajuste.tamanho } : {}),
    ...(ajuste.cor !== undefined ? { color: ajuste.cor } : {}),
    ...(ajuste.negrito !== undefined ? { fontWeight: ajuste.negrito ? 700 : 400 } : {}),
    ...(ajuste.italico !== undefined ? { fontStyle: ajuste.italico ? 'italic' : 'normal' } : {}),
  };
}

/** A aparência de um trecho: a do estilo do bloco, com a direta por cima. */
export function aparenciaDoTrecho(d: Doc<string>, b: Paragrafo<string>, x: Trecho): CSSProperties {
  const doEstilo = aparenciaDe(d, b.estilo);
  if (!x.direta) return doEstilo;
  const { negrito, italico, tamanho, cor } = x.direta;
  return {
    ...doEstilo,
    ...(tamanho !== undefined ? { fontSize: tamanho } : {}),
    ...(cor !== undefined ? { color: cor } : {}),
    ...(negrito !== undefined ? { fontWeight: negrito ? 700 : 400 } : {}),
    ...(italico !== undefined ? { fontStyle: italico ? 'italic' : 'normal' } : {}),
  };
}

/** Os títulos do documento, na ordem, como o sumário os leria agora. */
export function titulosDoDoc(d: Doc<string>): ItemDeSumario[] {
  return paragrafos(d)
    .filter(b => ehTitulo(b.estilo))
    .map(b => ({ texto: textoDoBloco(b), nivel: NIVEL_DO_TITULO[b.estilo]! }));
}

/* ── Os campos de numeração ───────────────────────────────────────────────── */

/**
 * Os trechos que são campo, na ordem do documento.
 *
 * A ordem é a do documento e não a de inserção, e é ela que faz a numeração
 * andar sozinha: entrar uma figura no meio muda a posição de todas as
 * seguintes, e nenhum campo precisou ser tocado.
 */
export function camposDoDoc(d: Doc<string>): { bloco: string; trecho: Trecho }[] {
  return paragrafos(d).flatMap(b =>
    b.trechos.filter(x => x.campo).map(x => ({ bloco: b.id, trecho: x })));
}

/**
 * O número que um campo mostra: a posição dele entre os campos **do mesmo
 * tipo**, contada na ordem do documento.
 *
 * Figura e tabela contam separado, como no Word — a Figura 1 e a Tabela 1
 * convivem, e uma série não empurra a outra.
 *
 * Devolve 0 para trecho que não é campo, e quem pergunta por um trecho que não
 * está no documento recebe 0 também: não há posição para contar.
 */
export function numeroDoCampo(d: Doc<string>, trechoId: string): number {
  const alvo = camposDoDoc(d).find(c => c.trecho.id === trechoId);
  if (!alvo) return 0;
  return camposDoDoc(d)
    .filter(c => c.trecho.campo === alvo.trecho.campo)
    .findIndex(c => c.trecho.id === trechoId) + 1;
}

/**
 * O que um trecho mostra na folha: o texto digitado, ou o campo resolvido.
 *
 * É a única leitura que a tela usa, e ela é separada de `textoDoBloco` de
 * propósito. As duas respondem a perguntas diferentes — uma é "o que se lê",
 * a outra é "o que foi digitado" —, e é justamente a distância entre elas que
 * este módulo ensina: a legenda digitada à mão responde a mesma coisa nas
 * duas, e é por isso que ela não se corrige sozinha.
 */
export function textoDoTrecho(d: Doc<string>, x: Trecho): string {
  if (!x.campo) return x.texto;
  return `${NOME_DO_CAMPO[x.campo]} ${numeroDoCampo(d, x.id)}`;
}

/** O que um parágrafo mostra na folha, com os campos já resolvidos. */
export const textoNaTela = (d: Doc<string>, b: Paragrafo<string>) =>
  b.trechos.map(x => textoDoTrecho(d, x)).join('');

/* ── Tabelas ──────────────────────────────────────────────────────────────── */

/**
 * Quantas colunas a tabela tem, medida pela linha mais larga.
 *
 * Ela existe para que a folha nunca desenhe uma tabela com buraco: uma linha
 * curta sai com uma célula a menos e a borda da direita sobe uma linha, sem
 * erro nenhum. Quem acrescenta linha ou coluna preenche por aqui.
 */
export const larguraDaTabela = (t: TabelaDoDoc<string>) =>
  t.linhas.reduce((maior, l) => Math.max(maior, l.length), 0);

/** A tabela é retangular: toda linha com o mesmo número de células. */
export const tabelaRetangular = (t: TabelaDoDoc<string>) =>
  t.linhas.every(l => l.length === larguraDaTabela(t));

/** O sumário existe e diz o que os títulos dizem hoje. */
export function sumarioAtualizado(d: Doc<string>): boolean {
  if (!d.sumario) return false;
  const agora = titulosDoDoc(d);
  if (agora.length !== d.sumario.length) return false;
  return agora.every((x, i) => x.texto === d.sumario![i].texto && x.nivel === d.sumario![i].nivel);
}

/* ── O botão Aa ───────────────────────────────────────────────────────────── */

/** Os cinco modos do botão Aa do Word, com os nomes que ele usa. */
export type ModoDeCaixa = 'frase' | 'minusculas' | 'maiusculas' | 'palavras' | 'alternar';

export const NOMES_DA_CAIXA: Record<ModoDeCaixa, string> = {
  frase: 'Primeira letra da frase em maiúscula.',
  minusculas: 'minúsculas',
  maiusculas: 'MAIÚSCULAS',
  palavras: 'Colocar Cada Palavra Em Maiúscula',
  alternar: 'aLTERNAR mAIÚSCULAS/mINÚSCULAS',
};

export function aplicarCaixa(texto: string, modo: ModoDeCaixa): string {
  switch (modo) {
    case 'minusculas': return texto.toLocaleLowerCase('pt-BR');
    case 'maiusculas': return texto.toLocaleUpperCase('pt-BR');
    case 'palavras':
      return texto.toLocaleLowerCase('pt-BR')
        .replace(/(^|\s)(\p{L})/gu, (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    case 'alternar':
      return [...texto].map(c => {
        const alto = c.toLocaleUpperCase('pt-BR');
        return c === alto ? c.toLocaleLowerCase('pt-BR') : alto;
      }).join('');
    case 'frase':
    default: {
      const baixo = texto.toLocaleLowerCase('pt-BR');
      return baixo.replace(/(^\s*|[.!?]\s+)(\p{L})/gu,
        (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    }
  }
}
