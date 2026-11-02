/// <reference lib="webworker" />

/**
 * O programa de JavaScript roda aqui, e não na thread da página.
 *
 * Pela razão do worker do Python: o primeiro `while` de todo mundo não
 * termina, e na thread da página isso congela a aba e leva junto o que a
 * pessoa escreveu. Aqui, quem não volta é encerrado pelo prazo, e a página
 * continua viva para dizer o que aconteceu.
 *
 * Um worker por execução, ao contrário do Python: não há doze megabytes para
 * carregar, e começar limpo é o que garante que uma variável global criada
 * numa execução não apareça na seguinte.
 */

import { executarNode, type Pasta, type ResultadoDoNode } from './nodeSimulado';

export interface PedidoAoNode { pasta: Pasta; principal: string }

self.onmessage = async (ev: MessageEvent<PedidoAoNode>) => {
  const { pasta, principal } = ev.data;
  const resultado: ResultadoDoNode = await executarNode(pasta, principal, {
    ouvirRejeicoes: aoRejeitar => {
      const h = (e: PromiseRejectionEvent) => { e.preventDefault(); aoRejeitar(e.reason); };
      self.addEventListener('unhandledrejection', h);
      return () => self.removeEventListener('unhandledrejection', h);
    },
  });
  self.postMessage(resultado);
};
