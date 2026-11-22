import type { Pasta, ResultadoDaCompilacao } from './compiladorTs';
import type { AnaliseDeTs } from './analiseTs';
import type { PedidoAoCompilador, RespostaDoCompilador } from './typescriptWorker';

/**
 * O lado da página do compilador: um worker que fica vivo, e uma fila de
 * pedidos.
 *
 * Quem digita depressa pede uma compilação por pausa, e as respostas chegam
 * em ordem. Só a resposta do último pedido interessa à tela; as outras são
 * descartadas por quem pediu, comparando o id.
 */
export class CompiladorNoNavegador {
  private worker: Worker | null = null;
  private proximo = 1;
  private esperando = new Map<number, (r: RespostaDoCompilador) => void>();

  private ligar(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(new URL('./typescriptWorker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<RespostaDoCompilador>) => {
      const r = this.esperando.get(ev.data.id);
      this.esperando.delete(ev.data.id);
      r?.(ev.data);
    };
    this.worker = w;
    return w;
  }

  compilar(pasta: Pasta): Promise<{ compilacao: ResultadoDaCompilacao; analise: Record<string, AnaliseDeTs>; versao: string }> {
    const w = this.ligar();
    const id = this.proximo++;
    return new Promise(resolve => {
      this.esperando.set(id, r => resolve(r));
      const pedido: PedidoAoCompilador = { id, pasta };
      w.postMessage(pedido);
    });
  }

  encerrar() {
    this.worker?.terminate();
    this.worker = null;
    this.esperando.clear();
  }
}
