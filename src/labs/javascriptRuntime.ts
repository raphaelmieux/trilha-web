import type { Pasta, ResultadoDoNode } from './nodeSimulado';
import type { PedidoAoNode } from './javascriptWorker';

/**
 * O lado da página: liga um worker, manda o programa, e o mata quando ele não
 * volta.
 *
 * O prazo é a única defesa contra o laço sem fim, pelo motivo escrito no
 * `pythonRuntime`: não há como perguntar a um programa se ele vai parar. Aqui
 * ele é curto, porque não há carga nenhuma a esperar — o JavaScript já está
 * no navegador — e porque o relógio dos temporizadores é de mentira: um
 * programa que pede para esperar três segundos devolve na hora.
 */

/** Quanto um programa pode demorar antes de ser encerrado. */
export const PRAZO_DO_NODE_MS = 5000;

const avisoSemFim = () =>
  `O programa não terminou sozinho e foi encerrado depois de ${PRAZO_DO_NODE_MS / 1000} segundos.\n\n`
  + 'Quase sempre é um laço — "while", ou um "for" — cuja condição nunca fica falsa: '
  + 'confira se algo dentro dele muda a variável que a condição testa.';

export class NodeNoNavegador {
  private worker: Worker | null = null;

  /** Mata o worker da execução em curso, se houver uma. */
  encerrar() {
    this.worker?.terminate();
    this.worker = null;
  }

  rodar(pasta: Pasta, principal: string): Promise<ResultadoDoNode> {
    this.encerrar();
    const worker = new Worker(new URL('./javascriptWorker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    return new Promise(resolve => {
      const terminar = (r: ResultadoDoNode) => {
        clearTimeout(relogio);
        worker.terminate();
        if (this.worker === worker) this.worker = null;
        resolve(r);
      };
      const relogio = setTimeout(
        () => terminar({ saida: '', erro: avisoSemFim(), semFim: true, pasta }),
        PRAZO_DO_NODE_MS,
      );
      worker.onmessage = (ev: MessageEvent<ResultadoDoNode>) => terminar(ev.data);
      worker.onerror = ev => {
        ev.preventDefault();
        terminar({ saida: '', erro: `O programa não pôde ser executado: ${ev.message}`, semFim: false, pasta });
      };
      const pedido: PedidoAoNode = { pasta, principal };
      worker.postMessage(pedido);
    });
  }
}
