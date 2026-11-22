import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { libsNecessarias, type Pasta } from './compiladorTs';
import { ARQUIVOS_DE_DECLARACAO, LIBS_DO_REACT, compilarReact, type Declaracoes, type ResultadoDoReact } from './compiladorReact';
import { ts } from './compiladorNoNode';

/**
 * O compilador da CC-FE006 para as travas: o mesmo `compilarReact` da tela,
 * com as bibliotecas e as declarações lidas do `node_modules` — as mesmas
 * que o worker baixa.
 *
 * Só as travas importam este arquivo.
 */
const exigir = createRequire(import.meta.url);
const PASTA_DAS_LIBS = exigir.resolve('typescript/lib/lib.es5.d.ts').replace(/lib\.es5\.d\.ts$/, '');
const RAIZ_DOS_PACOTES = exigir.resolve('typescript/package.json').replace(/typescript\/package\.json$/, '');

let libs: Pasta | null = null;
let declaracoes: Declaracoes | null = null;

async function carregar(): Promise<{ libs: Pasta; declaracoes: Declaracoes }> {
  libs ??= await libsNecessarias(LIBS_DO_REACT, async nome => {
    const c = `${PASTA_DAS_LIBS}${nome}`;
    return existsSync(c) ? readFileSync(c, 'utf8') : null;
  });
  declaracoes ??= Object.fromEntries(ARQUIVOS_DE_DECLARACAO.map(n => [n, readFileSync(`${RAIZ_DOS_PACOTES}${n}`, 'utf8')]));
  return { libs, declaracoes };
}

export async function compilarReactNoNode(pasta: Pasta): Promise<ResultadoDoReact> {
  const c = await carregar();
  return compilarReact(ts, c.libs, c.declaracoes, pasta);
}

export { ts };
