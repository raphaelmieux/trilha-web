import type * as TS from 'typescript';
import { paraDiagnostico, type Diagnostico, type ModuloTs, type Pasta } from './compiladorTs';

/**
 * O compilador da CC-FE006: os `.tsx` de quem estuda, verificados pelo
 * TypeScript de verdade com as declarações de verdade do React, e
 * transformados no JavaScript que a página roda.
 *
 * ── Faz o que o Vite e o editor fazem juntos ─────────────────────────────
 * Num projeto React criado pelo Vite, duas coisas leem o mesmo arquivo. O
 * editor verifica os tipos e sublinha o erro; o Vite arranca os tipos e
 * serve a página — **sem** esperar a verificação. Por isso a página roda com
 * erro de tipo, e é assim aqui: a lista de Problemas mostra o que o
 * compilador acha, e a prévia roda o que saiu. O que não roda é o arquivo
 * que nem se lê — o erro de sintaxe, que no Vite vira a tela vermelha por
 * cima da página.
 *
 * ── As declarações são as que o clube instala ────────────────────────────
 * `@types/react`, `@types/react-dom`, `csstype` e as do `react-router-dom`
 * vêm do mesmo `node_modules` que constrói a plataforma: a versão do React
 * que a página roda e a dos tipos que a verificam são a mesma. Quem as
 * entrega é quem chama — o worker, sob demanda; as travas, pelo disco —, e
 * este arquivo, como o `compiladorTs.ts`, não importa o `typescript`.
 *
 * ── O JSX vira `jsx()`, e não `React.createElement` ──────────────────────
 * É a transformação nova, a que o Vite usa: o arquivo não precisa de
 * `import React`. A página não tem o `react/jsx-runtime` — o React servido
 * é o de navegador, de um arquivo só —, e quem responde por ele é um
 * calço de três linhas em `paginaDeReact.runtime.js`, que repassa cada
 * chamada ao `createElement` com os filhos no lugar de sempre. É o que
 * mantém o aviso de chave da lista: o React de desenvolvimento só confere a
 * chave dos filhos que recebe como argumento.
 */

/** Os arquivos de declaração, pelo caminho em que o compilador os procura. */
export type Declaracoes = Record<string, string>;

/**
 * As declarações que um projeto React precisa, pelo caminho dentro do
 * `node_modules`. É a lista que o worker baixa e que as travas leem.
 */
export const ARQUIVOS_DE_DECLARACAO = [
  '@types/react/index.d.ts',
  '@types/react/global.d.ts',
  '@types/react/jsx-runtime.d.ts',
  '@types/react-dom/index.d.ts',
  '@types/react-dom/client.d.ts',
  '@types/prop-types/index.d.ts',
  'csstype/index.d.ts',
  'react-router-dom/dist/index.d.ts',
  'react-router-dom/dist/dom.d.ts',
  'react-router/dist/index.d.ts',
  'react-router/dist/lib/components.d.ts',
  'react-router/dist/lib/context.d.ts',
  'react-router/dist/lib/deprecations.d.ts',
  'react-router/dist/lib/hooks.d.ts',
  '@remix-run/router/dist/index.d.ts',
  '@remix-run/router/dist/history.d.ts',
  '@remix-run/router/dist/router.d.ts',
  '@remix-run/router/dist/utils.d.ts',
] as const;

/** Os pacotes que um `import` pode citar, e onde mora a declaração de cada um. */
const PACOTES: Record<string, string> = {
  react: '@types/react/index.d.ts',
  'react/jsx-runtime': '@types/react/jsx-runtime.d.ts',
  'react-dom': '@types/react-dom/index.d.ts',
  'react-dom/client': '@types/react-dom/client.d.ts',
  'prop-types': '@types/prop-types/index.d.ts',
  csstype: 'csstype/index.d.ts',
  'react-router-dom': 'react-router-dom/dist/index.d.ts',
  'react-router': 'react-router/dist/index.d.ts',
  '@remix-run/router': '@remix-run/router/dist/index.d.ts',
};

/** As bibliotecas padrão do projeto: as de um navegador moderno, com o DOM. */
export const LIBS_DO_REACT = ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'];

const RAIZ = '/projeto';
const NM = '/node_modules/';
const LIB = '/__lib/';
const absoluto = (nome: string) => `${RAIZ}/${nome.replace(/^\.\//, '')}`;
const relativo = (caminho: string) => caminho.startsWith(`${RAIZ}/`) ? caminho.slice(RAIZ.length + 1) : caminho;

/** É fonte de quem estuda? Os `.d.ts` não são — são declaração, e não geram nada. */
export const ehFonte = (nome: string) => /\.(tsx?|jsx?)$/.test(nome) && !nome.endsWith('.d.ts');

/** O módulo compilado: o JavaScript que a página roda e o mapa de volta ao `.tsx`. */
export interface ModuloCompilado { codigo: string; mapa: string | null }

export interface ResultadoDoReact {
  /** Tudo o que o compilador aponta nos arquivos de quem estuda, sintaxe incluída. */
  diagnosticos: Diagnostico[];
  /** Só os erros de sintaxe: com qualquer um deles, a página não roda. */
  sintaxe: Diagnostico[];
  /** Pelo nome do arquivo de origem — `App.tsx`, e não `App.js`. */
  modulos: Record<string, ModuloCompilado>;
}

function opcoes(ts: ModuloTs): TS.CompilerOptions {
  return {
    target: ts.ScriptTarget.ES2020,
    lib: LIBS_DO_REACT,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    sourceMap: true,
    types: [],
    noEmitOnError: false,
  };
}

/** Resolve um `import` como o empacotador resolveria: pacote pelo nome, arquivo pela pasta. */
function resolver(ts: ModuloTs, pedido: string, de: string, existe: (c: string) => boolean): TS.ResolvedModuleFull | undefined {
  if (pedido in PACOTES) {
    return { resolvedFileName: `${NM}${PACOTES[pedido]}`, extension: ts.Extension.Dts, isExternalLibraryImport: true };
  }
  if (!pedido.startsWith('.')) return undefined;
  const pasta = de.slice(0, de.lastIndexOf('/'));
  const partes = `${pasta}/${pedido}`.split('/');
  const pilha: string[] = [];
  for (const p of partes) {
    if (p === '.' || p === '') { if (pilha.length === 0) pilha.push(''); continue; }
    if (p === '..') pilha.pop();
    else pilha.push(p);
  }
  const base = pilha.join('/').replace(/\.(js|jsx)$/, '');
  for (const [ext, tipo] of [['.tsx', ts.Extension.Tsx], ['.ts', ts.Extension.Ts], ['.d.ts', ts.Extension.Dts], ['/index.tsx', ts.Extension.Tsx], ['/index.ts', ts.Extension.Ts], ['/index.d.ts', ts.Extension.Dts]] as const) {
    if (existe(base + ext)) return { resolvedFileName: base + ext, extension: tipo, isExternalLibraryImport: base.startsWith(NM) };
  }
  if (/\.(tsx?|d\.ts)$/.test(base) && existe(base)) {
    const ext = base.endsWith('.d.ts') ? ts.Extension.Dts : base.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts;
    return { resolvedFileName: base, extension: ext, isExternalLibraryImport: base.startsWith(NM) };
  }
  return undefined;
}

/**
 * Compila a pasta do projeto.
 *
 * `libs` traz as bibliotecas padrão que `LIBS_DO_REACT` puxa, e
 * `declaracoes` os arquivos de `ARQUIVOS_DE_DECLARACAO` — o compilador é
 * síncrono e não tem como ir buscá-los no meio.
 */
export function compilarReact(ts: ModuloTs, libs: Pasta, declaracoes: Declaracoes, pasta: Pasta): ResultadoDoReact {
  const o = opcoes(ts);
  const ler = (caminho: string): string | undefined => {
    if (caminho.startsWith(LIB)) return libs[caminho.slice(LIB.length)];
    if (caminho.startsWith(NM)) return declaracoes[caminho.slice(NM.length)];
    if (caminho.startsWith(`${RAIZ}/`)) return pasta[relativo(caminho)];
    return undefined;
  };
  const emitidos: Pasta = {};
  const host: TS.CompilerHost = {
    getSourceFile: (nome, versao) => {
      const texto = ler(nome);
      return texto === undefined ? undefined : ts.createSourceFile(nome, texto, versao, false, nome.endsWith('.tsx') ? ts.ScriptKind.TSX : undefined);
    },
    getDefaultLibFileName: () => `${LIB}${LIBS_DO_REACT[0]}`,
    getDefaultLibLocation: () => LIB.slice(0, -1),
    writeFile: (nome, texto) => { emitidos[relativo(nome)] = texto; },
    getCurrentDirectory: () => RAIZ,
    getCanonicalFileName: n => n,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: n => ler(n) !== undefined,
    readFile: n => ler(n),
    directoryExists: () => true,
    getDirectories: () => [],
    resolveModuleNames: (pedidos, de) => pedidos.map(p => resolver(ts, p, de, c => ler(c) !== undefined)),
  };
  const raizes = Object.keys(pasta).filter(n => /\.tsx?$/.test(n) && !n.endsWith('.d.ts')).map(absoluto);
  const programa = ts.createProgram(raizes, o, host);
  const doProjeto = (d: Diagnostico) => d.arquivo !== null && !d.arquivo.startsWith('/');
  const sintaxe = raizes.flatMap(r => {
    const sf = programa.getSourceFile(r);
    return sf ? programa.getSyntacticDiagnostics(sf).map(d => paraDiagnostico(ts, d)) : [];
  });
  const todos = ts.getPreEmitDiagnostics(programa).map(d => paraDiagnostico(ts, d));
  programa.emit();
  const modulos: Record<string, ModuloCompilado> = {};
  for (const fonte of Object.keys(pasta).filter(n => /\.tsx?$/.test(n) && !n.endsWith('.d.ts'))) {
    const js = fonte.replace(/\.tsx?$/, '.js');
    if (!(js in emitidos)) continue;
    modulos[fonte] = {
      codigo: emitidos[js].replace(/\n?\/\/# sourceMappingURL=.*$/, ''),
      mapa: emitidos[`${js}.map`] ?? null,
    };
  }
  /* A verificação também dá os de sintaxe; tirados os repetidos, sobra uma lista só. */
  const vistos = new Set<string>();
  const diagnosticos = [...sintaxe, ...todos].filter(doProjeto).filter(d => {
    const k = `${d.arquivo}:${d.linha}:${d.coluna}:${d.codigo}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
  return { diagnosticos, sintaxe: sintaxe.filter(doProjeto), modulos };
}
