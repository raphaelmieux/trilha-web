/**
 * A folha de estilo **publicada**, composta uma vez por execução de teste.
 *
 * Três travas leem o que o Tailwind de fato gera, e não o arquivo de origem —
 * `marca.test.tsx`, `fundoDaPlataforma.test.ts` e `seletorDeCores.test.ts` —,
 * pela razão escrita nas três: quem pinta no navegador é a folha publicada, e
 * uma regra que exista só no `index.css` pode nunca chegar à tela.
 *
 * ── Por que ela mora num lugar só, e guardada ────────────────────────────
 * Compor a folha custa segundos, porque o Tailwind varre o `content` inteiro
 * para decidir o que gerar — então o custo **cresce com o repositório**. Cada
 * uma das três a compunha por conta própria, e a da marca a compunha duas
 * vezes, uma por `it`: no dia em que a CC-ES011 entrou, as duas passagens
 * encostaram no limite de cinco segundos de um `it` e a trava ficou vermelha
 * sem ninguém ter mexido na folha.
 *
 * Esse é o pior jeito de uma trava falhar, porque tem cara de acaso: passa
 * numa máquina e perde noutra, e ninguém desconfia do código. Aqui ela se
 * compõe uma vez por arquivo de teste, com um orçamento declarado — e o
 * orçamento é generoso de propósito: ele é de um passo de build, e não de uma
 * asserção.
 *
 * Este módulo é só de teste, e por isso ele não entra em tela nenhuma.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

/** O orçamento do `beforeAll` que compõe a folha, em milissegundos. */
export const ORCAMENTO_DA_FOLHA = 60_000;

const RAIZ = resolve(__dirname, '..', '..');

let composta: Promise<string> | null = null;

export function folhaPublicada(): Promise<string> {
  if (composta) return composta;
  const entrada = resolve(RAIZ, 'src/index.css');
  composta = postcss([tailwind({ config: resolve(RAIZ, 'tailwind.config.js') })])
    .process(readFileSync(entrada, 'utf8'), { from: entrada })
    .then(r => r.css);
  return composta;
}
