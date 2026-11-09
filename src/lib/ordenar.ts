/*
 * Para onde vai a peça que está sendo arrastada numa lista em pé.
 *
 * Recebe o centro vertical de cada uma das OUTRAS linhas, na ordem da tela, e
 * a altura do ponteiro. A peça cai depois de toda linha cujo centro já ficou
 * acima do ponteiro.
 *
 * Contar centros, e não perguntar "em cima de quem o ponteiro está", é o que
 * impede a lista de tremer quando as linhas têm alturas diferentes: com a
 * pergunta, a peça curta passa por cima de uma linha alta, troca de lugar com
 * ela, e o ponteiro continua dentro da alta — que troca de volta, e assim por
 * diante a cada pixel. Com os centros, trocar de lugar empurra a vizinha para
 * longe do ponteiro, e voltar exige passar de novo pelo meio dela.
 */
export function posicaoAoArrastar(centrosDosOutros: number[], y: number): number {
  return centrosDosOutros.filter(c => c < y).length;
}
