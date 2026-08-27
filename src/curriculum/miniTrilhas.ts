import { SINTAXE_HTML } from './sintaxeHtml';

/*
 * As mini-trilhas.
 *
 * ── O que é uma mini-trilha ──────────────────────────────────────────────
 * É o material curto que nasce de uma trilha completa e passa a valer
 * sozinho. A sintaxe do HTML saiu da AP035 porque quem escreve HTML precisa
 * dela, tenha ou não feito a especialidade de Internet — e prendê-la ali
 * significava que só quem estivesse naquela trilha a encontraria.
 *
 * Ela não tem requisito oficial, não dá nota e não entra no percentual de
 * trilha nenhuma. Entra como bônus: uma coisa a mais que o desbravador fez,
 * com insígnia própria e uma linha no relatório.
 *
 * ── Onde ela aparece ─────────────────────────────────────────────────────
 * Numa seção própria na página inicial, a última — depois das trilhas, porque
 * é do lado delas que a pessoa está indo. E por cima do editor, dentro dos
 * laboratórios que precisam dela, pelo ícone de livro.
 *
 * ── Para acrescentar a próxima ───────────────────────────────────────────
 * Escreva o conteúdo num arquivo como `sintaxeHtml.ts`, acrescente a entrada
 * em MINI_TRILHAS com o próximo código MT, e semeie a linha da insígnia numa
 * migration nova — `mini_<id>`. Nada mais: a tela sai daqui, e o teste cobra
 * a linha do catálogo.
 */

export interface TopicoDeMiniTrilha {
  id: string;
  titulo: string;
  /** Uma frase: o que se aprende aqui. Aparece na lista de tópicos. */
  resumo: string;
  /** Dois ou três parágrafos curtos. Frase curta, exemplo do dia a dia. */
  explicacao: string[];
  /** O exemplo. Roda de verdade no quadro do resultado, quando a trilha mostra um. */
  exemplo: string;
  /** O engano que este tópico costuma produzir. Aparece em destaque. */
  atencao?: string;
  /** As marcas que o tópico cobre — é por aqui que se procura. */
  marcas: string[];
}

export interface CapituloDeMiniTrilha {
  id: string;
  titulo: string;
  resumo: string;
  topicos: TopicoDeMiniTrilha[];
}

export interface MiniTrilha {
  /** Vai na rota: /mini-trilha/html. */
  id: string;
  /** O código curto. Nomeia a arte, e nomeará o certificado. */
  codigo: string;
  titulo: string;
  resumo: string;
  /** A trilha completa de onde ela saiu. Só para dizer de onde veio. */
  origem: string;
  /**
   * O quadro do resultado roda o exemplo como HTML. Uma mini-trilha cujos
   * exemplos não sejam HTML — de planilha, de linha de comando — desliga isto
   * e mostra só o código, em vez de fingir que executa.
   */
  mostraResultado: boolean;
  capitulos: CapituloDeMiniTrilha[];
}

export const MINI_TRILHAS: MiniTrilha[] = [
  {
    id: 'html',
    codigo: 'MT01',
    titulo: 'Sintaxe do HTML',
    resumo: 'Do que é uma tag até um site de quatro páginas. Cada exemplo roda ao lado.',
    origem: 'AP035',
    mostraResultado: true,
    capitulos: SINTAXE_HTML,
  },
];

export function getMiniTrilha(id: string | undefined): MiniTrilha | undefined {
  return MINI_TRILHAS.find(t => t.id === id);
}

/** Os tópicos de uma mini-trilha, na ordem em que se lê. */
export function topicosDaMiniTrilha(trilha: MiniTrilha) {
  return trilha.capitulos.flatMap(c =>
    c.topicos.map(t => ({ ...t, capitulo: c.titulo, capituloId: c.id })));
}

/**
 * A insígnia de cada mini-trilha.
 *
 * Como a das trilhas completas: o código sai do id, e a próxima mini-trilha
 * entra sozinha. O que continua sendo à mão é semear a linha na tabela —
 * insígnia que não existe lá é ignorada sem erro e sem prêmio.
 */
export function codigoDaInsigniaDaMiniTrilha(id: string): string {
  return `mini_${id}`;
}
