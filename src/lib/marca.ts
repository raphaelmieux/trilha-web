/**
 * A marca da plataforma, e a regra de como ela se escreve.
 *
 * O nome é `Trilha.Web()`, em Space Mono Bold, e **os parênteses são
 * vermelhos**. Não é enfeite: são eles que dizem que o nome é uma chamada de
 * função, e não uma frase com pontuação sobrando.
 *
 * Isto aqui é TypeScript puro, sem React, de propósito. A marca aparece na
 * tela — onde quem desenha é o CSS — e também dentro dos PDFs que a plataforma
 * gera, onde quem desenha é o jsPDF, que não sabe o que é uma folha de estilo.
 * Os dois precisam do mesmo nome e da mesma cor, e duas cópias divergem no
 * primeiro ajuste: bastaria alguém renomear de um lado para a plataforma passar
 * a mostrar duas marcas diferentes, uma delas em papel entregue ao clube.
 */

/** O nome inteiro. É o que se lê em voz alta e o que vai para `aria-label`. */
export const NOME = 'Trilha.Web()';

/** Os dois pedaços que a regra distingue. Concatenados, são `NOME`. */
export const MIOLO = 'Trilha.Web';
export const PARENTESES = '()';

/**
 * O vermelho da marca em RGB, para o jsPDF.
 *
 * Na tela quem responde é `var(--color-primary)`, e é de lá que este número
 * sai: #C13516. O PDF não tem custom property nenhuma, então o valor precisa
 * ser escrito — e `marca.test.ts` confere que ele continua igual ao token do
 * `index.css`, porque um vermelho que se muda num lugar só é a divergência que
 * este arquivo existe para evitar.
 */
export const VERMELHO_DA_MARCA: [number, number, number] = [193, 53, 22];

/** Um pedaço de texto, e se ele é ou não parte vermelha da marca. */
export type PedacoDaMarca = { texto: string; daMarca: boolean };

/**
 * Parte uma frase nos pedaços que a marca colore.
 *
 * Devolve a frase inteira num pedaço só quando o nome não aparece nela, então é
 * seguro passar qualquer texto. Quem chama desenha cada pedaço com a cor que o
 * `daMarca` pede.
 */
export function partirNaMarca(texto: string): PedacoDaMarca[] {
  const pedacos: PedacoDaMarca[] = [];
  const entre = texto.split(NOME);

  entre.forEach((trecho, i) => {
    if (i > 0) {
      pedacos.push({ texto: MIOLO, daMarca: false });
      pedacos.push({ texto: PARENTESES, daMarca: true });
    }
    if (trecho) pedacos.push({ texto: trecho, daMarca: false });
  });

  return pedacos;
}
