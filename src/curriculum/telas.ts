import type { TelaDoExemplo } from './veredas';

/**
 * As telas de um tópico, na ordem em que o roteiro as fotografa.
 *
 * O nome de cada imagem sai do código da vereda, do id do tópico e da posição,
 * e não é escrito à mão: é o mesmo nome que `scripts/capturar-exemplos.mjs`
 * grava, e uma lista escrita à mão divergiria do disco no primeiro passo
 * acrescentado no meio. Cada par é a legenda — o que o passo mostra — e a
 * descrição — o que está na imagem, para quem não a vê.
 *
 * Mora fora de `veredas.ts` de propósito: os arquivos de conteúdo são
 * importados por ela, e uma função importada de lá na volta fecharia um laço
 * de ESM que devolve `undefined` no meio da inicialização, calado.
 */
export const telasDoTopico = (
  vereda: string,
  topico: string,
  passos: [legenda: string, descricao: string][],
): TelaDoExemplo[] =>
  passos.map(([legenda, descricao], i) => ({
    imagem: `${vereda}/${topico}-${i + 1}.png`, legenda, descricao,
  }));
