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
import { compilarReact, LIBS_DO_REACT, type Declaracoes, type ResultadoDoReact } from './compiladorReact';
import { analisarReact, type AnaliseDeReact } from './analiseReact';

/** `react` é o projeto da CC-FE006, que o Vite serviria; sem ele, o `tsc` da CC-FE005. */
export interface PedidoAoCompilador { id: number; pasta: Pasta; modo?: 'tsc' | 'react' }
export interface RespostaDoCompilador {
  id: number;
  compilacao: ResultadoDaCompilacao;
  analise: Record<string, AnaliseDeTs>;
  versao: string;
}
export interface RespostaDoReact {
  id: number;
  react: ResultadoDoReact;
  analise: Record<string, AnaliseDeReact>;
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

/* As declarações do React e do roteador, baixadas na primeira compilação de
   um projeto da CC-FE006 — quem só abre a CC-FE005 nunca as busca. A lista
   é a de `ARQUIVOS_DE_DECLARACAO`, escrita aqui por extenso porque o
   empacotador só entende caminhos literais; `compiladorReact.test.ts`
   confere as duas. */
const DECLARACOES = import.meta.glob([
  '../../node_modules/@types/react/index.d.ts',
  '../../node_modules/@types/react/global.d.ts',
  '../../node_modules/@types/react/jsx-runtime.d.ts',
  '../../node_modules/@types/react-dom/index.d.ts',
  '../../node_modules/@types/react-dom/client.d.ts',
  '../../node_modules/@types/prop-types/index.d.ts',
  '../../node_modules/csstype/index.d.ts',
  '../../node_modules/react-router-dom/dist/index.d.ts',
  '../../node_modules/react-router-dom/dist/dom.d.ts',
  '../../node_modules/react-router/dist/index.d.ts',
  '../../node_modules/react-router/dist/lib/components.d.ts',
  '../../node_modules/react-router/dist/lib/context.d.ts',
  '../../node_modules/react-router/dist/lib/deprecations.d.ts',
  '../../node_modules/react-router/dist/lib/hooks.d.ts',
  '../../node_modules/@remix-run/router/dist/index.d.ts',
  '../../node_modules/@remix-run/router/dist/history.d.ts',
  '../../node_modules/@remix-run/router/dist/router.d.ts',
  '../../node_modules/@remix-run/router/dist/utils.d.ts',
], { query: '?raw', import: 'default' });
let declaracoes: Promise<Declaracoes> | null = null;
const carregarDeclaracoes = () => {
  declaracoes ??= (async () => Object.fromEntries(await Promise.all(Object.entries(DECLARACOES)
    .map(async ([caminho, carregar]) => [caminho.replace('../../node_modules/', ''), (await carregar()) as string]))))();
  return declaracoes;
};

const lerLib = async (nome: string): Promise<string | null> => {
  if (nome in libsCarregadas) return libsCarregadas[nome];
  const carregador = LIBS[`../../node_modules/typescript/lib/${nome}`];
  if (!carregador) return null;
  libsCarregadas[nome] = (await carregador()) as string;
  return libsCarregadas[nome];
};

self.onmessage = async (ev: MessageEvent<PedidoAoCompilador>) => {
  const { id, pasta, modo } = ev.data;
  const ts = await carregar();
  if (modo === 'react') {
    const [libs, decl] = await Promise.all([libsNecessarias(LIBS_DO_REACT, lerLib), carregarDeclaracoes()]);
    const react = compilarReact(ts, libs, decl, pasta);
    const analise = Object.fromEntries(Object.entries(pasta)
      .filter(([n]) => /\.tsx?$/.test(n) && !n.endsWith('.d.ts'))
      .map(([n, t]) => [n, analisarReact(ts, t, n)]));
    const resposta: RespostaDoReact = { id, react, analise, versao: ts.version };
    self.postMessage(resposta);
    return;
  }
  const libs = await libsNecessarias(libsDaPasta(ts, pasta), lerLib);
  const compilacao = compilarPasta(ts, libs, pasta);
  const analise = Object.fromEntries(Object.entries(pasta)
    .filter(([n]) => n.endsWith('.ts') && !n.endsWith('.d.ts'))
    .map(([n, t]) => [n, analisarTs(ts, t, n)]));
  const resposta: RespostaDoCompilador = { id, compilacao, analise, versao: ts.version };
  self.postMessage(resposta);
};
