/**
 * O modelo de uma apresentação: o slide, o layout, o modelo de design.
 *
 * Ele morava dentro de `apresentacaoDoClube.ts`, junto da apresentação de
 * partida e das sete tarefas do requisito 9 da AP044 — então o tipo de um
 * slide dependia das metas de um exercício. É o mesmo encaixe que `planilha.ts`
 * tinha com `metasDaAp043.ts`, e desceu pelo mesmo motivo, escrito lá: a
 * CC-ES011 é a vereda de Apresentações e precisa deste modelo, e descer
 * **antes** de a cópia existir é a decisão de `word.tsx`, `excel.tsx`,
 * `explorer.tsx`, `leitorDePdf.tsx` e `correio.tsx`.
 *
 * O que ficou em `apresentacaoDoClube.ts` é do **exercício**: de que
 * apresentação a AP044 parte e o que ela cobra.
 */

export type Modelo = 'branco' | 'madison' | 'facetas' | 'berlim';
export type Layout = 'titulo' | 'titulo-conteudo' | 'duas-partes' | 'so-titulo' | 'em-branco';
export type Midia = 'nenhuma' | 'vinculada' | 'incorporada';

export interface Imagem {
  id: string;
  legenda: string;
  /** Largura em por cento do slide. A altura sai da proporção, sempre. */
  largura: number;
}

export interface Slide {
  id: string;
  titulo: string;
  /** Os tópicos do corpo. Slide de título não tem nenhum. */
  topicos: string[];
  layout: Layout;
  imagens: Imagem[];
  /** As imagens foram alinhadas pelo comando, e não arrastadas pelo olho. */
  imagensAlinhadas: boolean;
  video: Midia;
  audio: Midia;
}

export interface Apresentacao {
  modelo: Modelo;
  slides: Slide[];
  /** Os slides exportados em PDF, ou `null` enquanto ninguém exportou. */
  pdf: string[] | null;
}

export const NOMES_DOS_MODELOS: Record<Modelo, string> = {
  branco: 'Apresentação em Branco',
  madison: 'Madison',
  facetas: 'Facetas',
  berlim: 'Berlim',
};

export const NOMES_DOS_LAYOUTS: Record<Layout, string> = {
  'titulo': 'Slide de Título',
  'titulo-conteudo': 'Título e Conteúdo',
  'duas-partes': 'Duas Partes de Conteúdo',
  'so-titulo': 'Somente Título',
  'em-branco': 'Em Branco',
};

/**
 * O que cada modelo de design pinta, que é o que muda em todos os slides de
 * uma vez.
 *
 * Madison, Facetas e Berlim são os nomes dos modelos do PowerPoint, e o que
 * eles fazem é o que o slide mestre faz — então a tabela é do programa, e não
 * de um exercício. Ela mora aqui, e não em `powerpoint.tsx`, porque é dado:
 * arquivo que exporta componente e constante junto perde o recarregamento
 * rápido, e foi o próprio lint que apontou — a mesma divisão de
 * `capturaDoScanner.ts` com `digitalizador.tsx`.
 */
export const CORES_DO_MODELO: Record<Modelo, {
  fundo: string; titulo: string; texto: string; faixa: string;
}> = {
  branco: { fundo: '#FFFFFF', titulo: '#262626', texto: '#404040', faixa: 'transparent' },
  madison: { fundo: '#F4F1EA', titulo: '#7B3F00', texto: '#3D3128', faixa: '#C9A227' },
  facetas: { fundo: '#FFFFFF', titulo: '#1F6F63', texto: '#2E4A45', faixa: '#7FBFA8' },
  berlim: { fundo: '#1B1B1B', titulo: '#FFFFFF', texto: '#D6D6D6', faixa: '#E8562A' },
};

export type CoresDoModelo = (typeof CORES_DO_MODELO)[Modelo];

export const umSlide = (a: Apresentacao, id: string) => a.slides.find(s => s.id === id);

/** Um slide sem título e sem nada dentro — o que sobra de um Ctrl+M sem querer. */
export const vazio = (s: Slide) =>
  !s.titulo.trim() && s.topicos.length === 0 && s.imagens.length === 0
  && s.video === 'nenhuma' && s.audio === 'nenhuma';
