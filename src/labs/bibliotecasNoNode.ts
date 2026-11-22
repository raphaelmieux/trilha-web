import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Biblioteca } from './paginaDeReact';

/**
 * As mesmas bibliotecas de `bibliotecasDoReact.ts`, lidas do disco e
 * postas dentro da página — o jsdom das travas não tem servidor de onde
 * baixá-las. Só as travas importam este arquivo.
 */
const exigir = createRequire(import.meta.url);
const raiz = exigir.resolve('typescript/package.json').replace(/typescript\/package\.json$/, '');
const ARQUIVOS: [string, string][] = [
  ['react.development.js', 'react/umd/react.development.js'],
  ['react-dom.development.js', 'react-dom/umd/react-dom.development.js'],
  ['router.umd.js', '@remix-run/router/dist/router.umd.js'],
  ['react-router.development.js', 'react-router/dist/umd/react-router.development.js'],
  ['react-router-dom.development.js', 'react-router-dom/dist/umd/react-router-dom.development.js'],
];

let cache: Biblioteca[] | null = null;
export function bibliotecasNoNode(): Biblioteca[] {
  cache ??= ARQUIVOS.map(([nome, caminho]) => ({
    nome,
    codigo: readFileSync(`${raiz}${caminho}`, 'utf8'),
  }));
  return cache;
}
