/// <reference lib="webworker" />

/**
 * O compilador da CC-FE005 roda aqui.
 *
 * Por dois motivos. O pacote do TypeScript tem nove megabytes, e só quem
 * abre um laboratório desta vereda precisa dele: o worker o importa na
 * primeira compilação, e o resto da plataforma nunca o baixa. E compilar
 * leva de dezenas a centenas de milissegundos, que na thread da página
 * travariam a digitação a cada pausa.
 *
 * Ao contrário do worker do Node, este fica vivo entre as compilações: é
 * ele que guarda o compilador carregado, e recarregar nove megabytes a cada
 * tecla seria o editor inteiro esperando.
 */

import { compilarPasta, emPortugues, libsDaPasta, libsNecessarias, type ModuloTs, type Pasta } from './compiladorTs';
import { analisarTs, type AnaliseDeTs } from './analiseTs';
import type { ResultadoDaCompilacao } from './compiladorTs';

export interface PedidoAoCompilador { id: number; pasta: Pasta }
export interface RespostaDoCompilador {
  id: number;
  compilacao: ResultadoDaCompilacao;
  analise: Record<string, AnaliseDeTs>;
  versao: string;
}

/* As bibliotecas padrão, uma por arquivo, cada uma baixada quando alguma
   compilação pedir. São as do mesmo pacote: a versão do compilador e a das
   declarações não podem divergir. */
const LIBS = import.meta.glob('../../node_modules/typescript/lib/lib.*.d.ts', { query: '?raw', import: 'default' });
const libsCarregadas: Pasta = {};

let compilador: Promise<ModuloTs> | null = null;
const carregar = () => {
  compilador ??= (async () => {
    const [mod, mensagens] = await Promise.all([
      import('typescript'),
      import('typescript/lib/pt-br/diagnosticMessages.generated.json'),
    ]);
    const ts = ((mod as unknown as { default?: ModuloTs }).default ?? mod) as ModuloTs;
    emPortugues(ts, (mensagens as { default?: unknown }).default ?? mensagens);
    return ts;
  })();
  return compilador;
};

const lerLib = async (nome: string): Promise<string | null> => {
  if (nome in libsCarregadas) return libsCarregadas[nome];
  const carregador = LIBS[`../../node_modules/typescript/lib/${nome}`];
  if (!carregador) return null;
  libsCarregadas[nome] = (await carregador()) as string;
  return libsCarregadas[nome];
};

self.onmessage = async (ev: MessageEvent<PedidoAoCompilador>) => {
  const { id, pasta } = ev.data;
  const ts = await carregar();
  const libs = await libsNecessarias(libsDaPasta(ts, pasta), lerLib);
  const compilacao = compilarPasta(ts, libs, pasta);
  const analise = Object.fromEntries(Object.entries(pasta)
    .filter(([n]) => n.endsWith('.ts') && !n.endsWith('.d.ts'))
    .map(([n, t]) => [n, analisarTs(ts, t, n)]));
  const resposta: RespostaDoCompilador = { id, compilacao, analise, versao: ts.version };
  self.postMessage(resposta);
};
