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

import {
  ANALISADOR, apararTraceback, erroDeSintaxeEmTexto, preparoDaAnalise,
  type NoDoEsboco, type SaidaDaAnalise,
} from './pythonAnalise';
import { preambuloDoProjeto, PASTA_DO_PROJETO } from './projetoDePython';
import {
  programaDoSql, programaQueCriaOArquivo, programaQueLeOArquivo,
  type EstadoDoBanco, type ExecucaoDeSql,
} from './sqlite';

interface Pyodide {
  runPython: (codigo: string) => unknown;
  setStdin: (opcoes: { stdin: () => string }) => void;
  setStdout: (opcoes: { batched: (texto: string) => void }) => void;
  setStderr: (opcoes: { batched: (texto: string) => void }) => void;
}

export type PedidoAoPython =
  /* `arquivos` é o que já existe na pasta do programa: o CSV que a lição
     entrega para ser lido, e o segundo arquivo-fonte que ele importa. Ausente
     nos laboratórios de um arquivo só, que é como a CC002 inteira funciona. */
  | {
    tipo: 'rodar'; codigo: string; entrada: string[]; arquivos?: Record<string, string>;
    /* O banco da CC005: gravado em arquivo na pasta antes de o programa rodar,
       e lido de volta depois, por uma conexão nova. */
    banco?: BancoNaPasta;
  }
  /* Um arquivo .sql executado sobre o banco da lição, que é refeito a cada vez. */
  | { tipo: 'sql'; semente: string; script: string }
  /* A análise vê o projeto inteiro: duas contas do requisito 8 — a função
     reaproveitada e as três funções — têm a definição num arquivo e as
     chamadas no outro, e cada metade sozinha responde "não". */
  | { tipo: 'analisar'; codigo: string; arquivo?: string; fontes?: Record<string, string> };

/** O arquivo de banco que mora na pasta do programa, e de que ele parte. */
export interface BancoNaPasta { arquivo: string; semente: string }

export type RespostaDoPython =
  | { tipo: 'pronto' }
  | { tipo: 'resultado'; saida: string; erro: string | null; banco?: EstadoDoBanco | null }
  | { tipo: 'sql'; execucao: ExecucaoDeSql }
  | { tipo: 'analise'; achados: Record<string, boolean>; erro: string | null;
    esboco: NoDoEsboco[]; chamadas: string[] }
  | { tipo: 'falha'; mensagem: string };

let pyodide: Pyodide | null = null;

async function carregar(): Promise<Pyodide> {
  if (pyodide) return pyodide;
  const base = import.meta.env.BASE_URL;
  const modulo = await import(/* @vite-ignore */ `${base}pyodide/pyodide.mjs`);
  pyodide = await modulo.loadPyodide({ indexURL: `${base}pyodide/` }) as Pyodide;
  return pyodide;
}

async function rodar(
  codigo: string, entrada: string[], arquivos?: Record<string, string>, banco?: BancoNaPasta,
): Promise<RespostaDoPython> {
  const py = await carregar();
  let saida = '';
  let i = 0;
  py.setStdin({ stdin: () => (i < entrada.length ? entrada[i++] : '') });
  py.setStdout({ batched: t => { saida += `${t}\n`; } });
  py.setStderr({ batched: t => { saida += `${t}\n`; } });
  try {
    /*
      A pasta é preparada dentro do mesmo `try`, e não antes dele.

      Um preâmbulo que estourasse fora daqui viraria falha do worker, e a tela
      diria "o ambiente Python não pôde ser carregado" — que é mentira, e manda
      procurar no lugar errado. Dentro, o erro chega como erro de execução,
      escrito no painel de saída onde a pessoa está olhando.
    */
    if (arquivos || banco) py.runPython(preambuloDoProjeto(arquivos ?? {}));
    if (banco) py.runPython(programaQueCriaOArquivo(`${PASTA_DO_PROJETO}/${banco.arquivo}`, banco.semente));
    py.runPython(codigo);
    return { tipo: 'resultado', saida, erro: null, banco: lerBanco(py, banco) };
  } catch (e) {
    /* O banco se lê mesmo quando o programa estoura: o que ele gravou antes do
       erro continua no arquivo, e é isso que a pessoa vai encontrar. */
    return {
      tipo: 'resultado', saida, erro: apararTraceback(String((e as Error)?.message ?? e)),
      banco: lerBanco(py, banco),
    };
  }
}

function lerBanco(py: Pyodide, banco?: BancoNaPasta): EstadoDoBanco | null | undefined {
  if (!banco) return undefined;
  try {
    return JSON.parse(py.runPython(programaQueLeOArquivo(`${PASTA_DO_PROJETO}/${banco.arquivo}`)) as string);
  } catch {
    /* Um arquivo que o programa corrompeu não é um banco: a verificação o lê
       como ausente, que é o que ele é para quem for abri-lo. */
    return null;
  }
}

async function sql(semente: string, script: string): Promise<RespostaDoPython> {
  const py = await carregar();
  return { tipo: 'sql', execucao: JSON.parse(py.runPython(programaDoSql(semente, script)) as string) };
}

async function analisar(
  codigo: string, arquivo = 'programa.py', fontes: Record<string, string> = {},
): Promise<RespostaDoPython> {
  const py = await carregar();
  try {
    py.runPython(preparoDaAnalise(codigo, arquivo, fontes));
    const bruto = py.runPython(ANALISADOR) as string;
    const saida = JSON.parse(bruto) as SaidaDaAnalise;
    /*
      Código que não compila não tem árvore, e isso não é falha do analisador:
      é o erro de sintaxe que o requisito 6 quer que a pessoa leia. Ele vem
      estruturado de propósito — o traceback que o Python monta ao redor da
      nossa chamada de `ast.parse` fala das linhas do nosso script, e apontá-lo
      diria "linha 73" num programa de duas linhas.
    */
    return saida.ok
      ? {
        tipo: 'analise', achados: saida.achados, erro: null,
        esboco: saida.esboco, chamadas: saida.chamadas,
      }
      : {
        tipo: 'analise', achados: {}, erro: erroDeSintaxeEmTexto(saida.erro),
        esboco: [], chamadas: [],
      };
  } catch (e) {
    /* Sobra o que o analisador não previu — e aí o traceback aparado é o
       melhor que se tem. */
    return {
      tipo: 'analise',
      achados: {},
      erro: apararTraceback(String((e as Error)?.message ?? e)),
      esboco: [],
      chamadas: [],
    };
  }
}

self.onmessage = async (ev: MessageEvent<PedidoAoPython>) => {
  const pedido = ev.data;
  try {
    const r = pedido.tipo === 'rodar'
      ? await rodar(pedido.codigo, pedido.entrada, pedido.arquivos, pedido.banco)
      : pedido.tipo === 'sql'
        ? await sql(pedido.semente, pedido.script)
        : await analisar(pedido.codigo, pedido.arquivo, pedido.fontes);
    (self as unknown as Worker).postMessage(r);
  } catch (e) {
    (self as unknown as Worker).postMessage({
      tipo: 'falha', mensagem: String((e as Error)?.message ?? e),
    } satisfies RespostaDoPython);
  }
};
