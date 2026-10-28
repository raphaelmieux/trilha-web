/*
 * Os roteiros das telas que as lições de teoria mostram.
 *
 * ── O que é um roteiro ───────────────────────────────────────────────────
 * Uma cena (`cenas.tsx`) abre um laboratório com um arquivo de exemplo; o
 * roteiro diz o que fazer nele — clicar, digitar, escolher — e em que momento
 * fotografar. Cada `foto` vira um arquivo em
 * `public/assets/exemplos/<vereda>/<tópico>-<n>.png`, na ordem em que aparece,
 * e o tópico da lição declara as mesmas telas em `telas`, com a legenda de cada
 * uma. `telasDasLicoes.test.ts` confere que as duas listas batem.
 *
 * ── Por que roteiro, e não imagem solta ──────────────────────────────────
 * As janelas mudam: um botão troca de grupo, a faixa ganha um comando. Imagem
 * guardada sem receita fica mostrando o programa de seis meses atrás, e
 * referência que diverge do laboratório é pior do que referência nenhuma —
 * a lição apontaria para um botão que a pessoa não encontra. Com a receita no
 * repositório, refazer todas é um comando:
 *
 *     node scripts/capturar-exemplos.mjs            (todas)
 *     node scripts/capturar-exemplos.mjs CC-ES002   (uma vereda)
 *     node scripts/capturar-exemplos.mjs estilo     (um tópico)
 *
 * Os seletores são os do Playwright — `text=`, `role=`, CSS —, e o roteiro é
 * só dado: nada aqui importa tela, para o teste poder lê-lo sem montar nada.
 */

import { ROTEIROS_DO_EDITOR } from './roteiros/editorDeTexto';
import { ROTEIROS_DOS_FUNDAMENTOS } from './roteiros/fundamentosVisuais';

export type Acao =
  /**
   * Clica. `direito` abre o menu de contexto; `duplo` dá dois cliques; `com`
   * segura uma tecla junto — Shift soma à seleção, como em todo editor.
   */
  | { clicar: string; direito?: boolean; duplo?: boolean; com?: 'Shift' | 'Control' }
  /** Digita no que estiver com o foco, tecla por tecla. */
  | { digitar: string }
  /** Aperta uma tecla ou combinação: `Enter`, `Shift+Enter`, `Control+z`. */
  | { tecla: string }
  /** Escolhe uma opção numa caixa de seleção. */
  | { escolher: string; valor: string }
  /** Seleciona, dentro do elemento, o primeiro trecho com este texto. */
  | { selecionar: string; texto: string }
  /** Seleciona do começo do primeiro elemento ao fim do segundo. */
  | { selecionarBlocos: [string, string] }
  /** Rola a janela até o elemento ficar no alto da tela. */
  | { rolarAte: string }
  /** Passa o ponteiro por cima, para a dica ou o destino do link aparecer. */
  | { apontar: string }
  /**
   * Fotografa a tela. `destaque` circula o que a legenda manda olhar — o botão
   * a apertar, a marca que apareceu —, como faz todo tutorial de programa. Um
   * item que é lista vira um círculo só em volta de todos os elementos dela.
   */
  | { foto: true; destaque?: string | (string | string[])[] };

export interface Roteiro {
  /** O código da vereda, que é também a pasta das imagens. */
  vereda: string;
  /** O id do tópico, que é também o começo do nome de cada imagem. */
  topico: string;
  /** A cena de `cenas.tsx`. */
  cena: string;
  /** A tela em que se fotografa. Padrão: 1280 × 720, a tela de notebook mais comum — numa mais estreita a fileira de guias corta as contextuais, que são justamente o assunto de mais de um tópico. */
  largura?: number;
  altura?: number;
  acoes: Acao[];
}

export const ROTEIROS: Roteiro[] = [
  ...ROTEIROS_DO_EDITOR,
  ...ROTEIROS_DOS_FUNDAMENTOS,
];

/** Os nomes das imagens que um roteiro produz, na ordem. */
export const imagensDoRoteiro = (r: Roteiro): string[] =>
  r.acoes.filter(a => 'foto' in a).map((_, i) => `${r.vereda}/${r.topico}-${i + 1}.png`);
