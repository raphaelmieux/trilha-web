import type { PedidoAoPython, RespostaDoPython } from './pythonWorker';

/**
 * O lado da página: liga o worker, manda um pedido, e o mata quando ele não volta.
 *
 * ── O prazo é a única defesa contra o `while` sem fim ────────────────────
 * O requisito 5.5 pede um laço `while`, e o primeiro `while` de todo mundo é um
 * que não termina. Não há como perguntar ao Python se ele vai parar — é o
 * problema da parada, e não tem resposta. O que dá para fazer é contar o tempo
 * e encerrar o worker, que é a razão de haver um worker.
 *
 * Encerrar mata o Pyodide junto, então a próxima execução recarrega — uns
 * segundos. É caro, e é raro: acontece uma vez, a pessoa entende o que fez, e
 * corrige.
 */

/** Quanto um programa pode demorar antes de ser encerrado. */
export const PRAZO_MS = 8000;

/** O que se dá a mais na primeira execução, para os 12 MB do Pyodide subirem. */
export const PRAZO_DE_CARGA_MS = 30000;

/** Quanto texto a saída pode ter antes de ser cortada. */
const MAX_SAIDA = 20000;

export interface ResultadoDeExecucao {
  saida: string;
  erro: string | null;
  /** Ligado quando o prazo acabou e o worker foi encerrado. */
  semFim: boolean;
}

export interface Analise {
  achados: Record<string, boolean>;
  erro: string | null;
}

/*
  O aviso de saída sem fim é escrito aqui, e não no worker.

  Quem descobre que o programa não terminou é este lado — o worker, por
  definição, ainda está dentro do laço e não tem como contar nada.

  O número de segundos vem do prazo que de fato foi usado, e não de uma
  constante: na primeira execução o prazo é maior, porque cobre a carga do
  Pyodide junto, e um aviso dizendo "8 segundos" depois de trinta e oito seria
  a plataforma mentindo sobre o que acabou de fazer.
*/
const avisoSemFim = (prazo: number) =>
  'O programa não terminou sozinho e foi encerrado depois de '
  + `${Math.round(prazo / 1000)} segundos.\n\n`
  + 'Quase sempre é um laço "while" cuja condição nunca fica falsa — confira se '
  + 'algo dentro dele muda a variável que a condição testa.';

export class Python {
  private worker: Worker | null = null;
  private ocupado = false;
  /*
    Se o Pyodide já está carregado neste worker.

    Era um argumento de quem chamava, e isso é uma armadilha: quem chama não
    tem como saber, e errar para menos dá um prazo de 38 segundos a um laço sem
    fim — a aba não trava, mas quem escreveu espera meio minuto olhando para
    nada. Quem sabe é esta classe, que é a dona do worker.

    Volta a `false` ao encerrar, porque encerrar mata o Pyodide junto.
  */
  private carregado = false;

  /** O prazo desta chamada: generoso enquanto o Pyodide ainda não subiu. */
  private prazo() {
    return this.carregado ? PRAZO_MS : PRAZO_MS + PRAZO_DE_CARGA_MS;
  }

  /** Liga o worker, se ainda não estiver ligado. */
  private ligar(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'module' });
    }
    return this.worker;
  }

  /** Mata o worker: é o que interrompe um programa que não termina. */
  encerrar() {
    this.worker?.terminate();
    this.worker = null;
    this.ocupado = false;
    this.carregado = false;
  }

  private pedir(pedido: PedidoAoPython, prazo: number): Promise<RespostaDoPython> {
    if (this.ocupado) return Promise.resolve({ tipo: 'falha', mensagem: 'Já há um programa rodando.' });
    this.ocupado = true;

    const worker = this.ligar();
    return new Promise(resolve => {
      const relogio = setTimeout(() => {
        limpar();
        /* Sem worker não há como interromper só o programa: o que se encerra é
           o processo inteiro, e o Pyodide vai junto. */
        this.encerrar();
        resolve({ tipo: 'falha', mensagem: 'prazo' });
      }, prazo);

      const limpar = () => {
        clearTimeout(relogio);
        worker.removeEventListener('message', aoResponder);
        worker.removeEventListener('error', aoFalhar);
        this.ocupado = false;
      };

      const aoResponder = (ev: MessageEvent<RespostaDoPython>) => {
        limpar();
        /* Resposta que chega é prova de que o Pyodide subiu: da próxima vez o
           prazo é só o do programa. */
        this.carregado = true;
        resolve(ev.data);
      };
      const aoFalhar = (ev: ErrorEvent) => {
        limpar();
        this.encerrar();
        resolve({ tipo: 'falha', mensagem: ev.message || 'O ambiente Python não pôde ser carregado.' });
      };

      worker.addEventListener('message', aoResponder);
      worker.addEventListener('error', aoFalhar);
      worker.postMessage(pedido);
    });
  }

  /**
   * Roda o programa com as linhas de entrada dadas.
   *
   * O prazo cobre a primeira carga do Pyodide junto — são uns 12 MB e alguns
   * segundos na primeira vez —, por isso ele é generoso na estreia.
   */
  async rodar(codigo: string, entrada: string[]): Promise<ResultadoDeExecucao> {
    const prazo = this.prazo();
    const r = await this.pedir({ tipo: 'rodar', codigo, entrada }, prazo);
    if (r.tipo === 'resultado') {
      return { saida: cortar(r.saida), erro: r.erro, semFim: false };
    }
    if (r.tipo === 'falha' && r.mensagem === 'prazo') {
      return { saida: '', erro: avisoSemFim(prazo), semFim: true };
    }
    return {
      saida: '',
      erro: r.tipo === 'falha' ? r.mensagem : 'Resposta inesperada do ambiente Python.',
      semFim: false,
    };
  }

  /** Lê a estrutura do programa pelo `ast` do próprio Python. */
  async analisar(codigo: string): Promise<Analise> {
    const prazo = this.prazo();
    const r = await this.pedir({ tipo: 'analisar', codigo }, prazo);
    if (r.tipo === 'analise') return { achados: r.achados, erro: r.erro };
    if (r.tipo === 'falha' && r.mensagem === 'prazo') {
      return { achados: {}, erro: avisoSemFim(prazo) };
    }
    return { achados: {}, erro: r.tipo === 'falha' ? r.mensagem : 'Resposta inesperada.' };
  }
}

/*
  `print` dentro de um laço grande enche a memória da página antes de o prazo
  acabar. Cortar preserva o começo, que é onde o programa ainda estava certo.
*/
export function cortar(saida: string): string {
  if (saida.length <= MAX_SAIDA) return saida;
  return `${saida.slice(0, MAX_SAIDA)}\n\n[… saída cortada: o programa escreveu demais]`;
}
