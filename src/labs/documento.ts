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

export interface Trecho {
  id: string;
  texto: string;
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

export interface Bloco<S extends string = string> {
  id: string;
  trechos: Trecho[];
  /**
   * Quebra de página antes deste parágrafo — `Ctrl+Enter`.
   *
   * É o que empurra texto para a folha seguinte sem os oito parágrafos vazios
   * que a teoria desaconselha. Os dois se parecem na tela do dia em que foram
   * escritos, e só um continua certo quando o texto de cima cresce.
   */
  quebraDePagina?: boolean;
  estilo: Estilo;
  secao: S;
  /** Nota de rodapé pendurada neste parágrafo. */
  nota?: string;
}

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

export const blocoDe = <S extends string>(id: string, secao: S, trechos: Trecho[]): Bloco<S> =>
  ({ id, secao, trechos, estilo: 'Normal' });

export const linhaDe = <S extends string>(id: string, secao: S, texto: string): Bloco<S> =>
  blocoDe(id, secao, [trechoDe(`${id}-a`, texto)]);

/* ── Ler ──────────────────────────────────────────────────────────────────── */

export const textoDoBloco = (b: Bloco<string>) => b.trechos.map(x => x.texto).join('');

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

/** Os parágrafos vazios — Enter apertado para empurrar texto. */
export const paragrafosVazios = (d: Doc<string>) =>
  d.blocos.filter(b => textoDoBloco(b).trim() === '');

/** As pilhas de nomes de fonte que cada família rende, com os nomes do Word. */
export const FONTES: Record<'serifada' | 'sem-serifa', string> = {
  serifada: 'Georgia, "Times New Roman", serif',
  'sem-serifa': 'Calibri, Arial, sans-serif',
};

/** Os trechos que ainda carregam formatação direta. */
export const comFormatacaoDireta = (d: Doc<string>) =>
  d.blocos.filter(b => b.trechos.some(x => x.direta && Object.keys(x.direta).length > 0));

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
export function aparenciaDoTrecho(d: Doc<string>, b: Bloco<string>, x: Trecho): CSSProperties {
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
  return d.blocos
    .filter(b => ehTitulo(b.estilo))
    .map(b => ({ texto: textoDoBloco(b), nivel: NIVEL_DO_TITULO[b.estilo]! }));
}

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
