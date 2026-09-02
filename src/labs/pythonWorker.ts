/// <reference lib="webworker" />

/**
 * O Python roda aqui, e não na thread da página.
 *
 * ── Porque `while` existe ────────────────────────────────────────────────
 * O requisito 5.5 pede um laço `while`, e o primeiro `while` de todo mundo é
 * um que não termina. Na thread principal isso trava a aba: a pessoa perde o
 * que escreveu e não entende o que houve. Num worker, basta encerrar o worker —
 * o programa morre, a página continua viva, e dá para dizer o que aconteceu.
 *
 * ── A entrada vem inteira, antes de começar ──────────────────────────────
 * `input()` é síncrono, e um worker não consegue esperar por uma digitação na
 * página sem SharedArrayBuffer — que exige cabeçalhos COOP/COEP que o GitHub
 * Pages não deixa definir. Então as linhas de entrada são informadas antes, num
 * campo próprio, e `input()` as consome uma a uma.
 *
 * Não é remendo: é como todo juiz de código online funciona, e é o que se faz
 * ao testar um programa de verdade — decidir as entradas antes e ver a saída.
 *
 * ── E o Pyodide é nosso ──────────────────────────────────────────────────
 * Carregado de `public/pyodide/`, servido pelo mesmo domínio do aplicativo.
 * Nenhum CDN: computador de clube costuma estar atrás de filtro, e CDN
 * bloqueado não dá erro que alguém entenda.
 */

import { ANALISADOR, apararTraceback } from './pythonAnalise';

interface Pyodide {
  runPython: (codigo: string) => unknown;
  setStdin: (opcoes: { stdin: () => string }) => void;
  setStdout: (opcoes: { batched: (texto: string) => void }) => void;
  setStderr: (opcoes: { batched: (texto: string) => void }) => void;
}

export type PedidoAoPython =
  | { tipo: 'rodar'; codigo: string; entrada: string[] }
  | { tipo: 'analisar'; codigo: string };

export type RespostaDoPython =
  | { tipo: 'pronto' }
  | { tipo: 'resultado'; saida: string; erro: string | null }
  | { tipo: 'analise'; achados: Record<string, boolean>; erro: string | null }
  | { tipo: 'falha'; mensagem: string };

let pyodide: Pyodide | null = null;

async function carregar(): Promise<Pyodide> {
  if (pyodide) return pyodide;
  const base = import.meta.env.BASE_URL;
  const modulo = await import(/* @vite-ignore */ `${base}pyodide/pyodide.mjs`);
  pyodide = await modulo.loadPyodide({ indexURL: `${base}pyodide/` }) as Pyodide;
  return pyodide;
}

async function rodar(codigo: string, entrada: string[]): Promise<RespostaDoPython> {
  const py = await carregar();
  let saida = '';
  let i = 0;
  py.setStdin({ stdin: () => (i < entrada.length ? entrada[i++] : '') });
  py.setStdout({ batched: t => { saida += `${t}\n`; } });
  py.setStderr({ batched: t => { saida += `${t}\n`; } });
  try {
    py.runPython(codigo);
    return { tipo: 'resultado', saida, erro: null };
  } catch (e) {
    return { tipo: 'resultado', saida, erro: apararTraceback(String((e as Error)?.message ?? e)) };
  }
}

async function analisar(codigo: string): Promise<RespostaDoPython> {
  const py = await carregar();
  try {
    py.runPython(`_fonte = ${JSON.stringify(codigo)}`);
    const bruto = py.runPython(ANALISADOR) as string;
    return { tipo: 'analise', achados: JSON.parse(bruto), erro: null };
  } catch (e) {
    /* Código que não compila não tem árvore, e isso não é falha do analisador:
       é o erro de sintaxe que o requisito 6 quer que a pessoa leia. */
    return {
      tipo: 'analise',
      achados: {},
      erro: apararTraceback(String((e as Error)?.message ?? e)),
    };
  }
}

self.onmessage = async (ev: MessageEvent<PedidoAoPython>) => {
  const pedido = ev.data;
  try {
    const r = pedido.tipo === 'rodar'
      ? await rodar(pedido.codigo, pedido.entrada)
      : await analisar(pedido.codigo);
    (self as unknown as Worker).postMessage(r);
  } catch (e) {
    (self as unknown as Worker).postMessage({
      tipo: 'falha', mensagem: String((e as Error)?.message ?? e),
    } satisfies RespostaDoPython);
  }
};
