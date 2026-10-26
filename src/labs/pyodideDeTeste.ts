import { createRequire } from 'node:module';

/**
 * O Python das travas, carregado do mesmo pacote que o navegador serve.
 *
 * Só as travas importam isto — o worker carrega de `public/pyodide/`. Quem
 * roda aqui é o mesmo CPython, então o que passa aqui passa lá.
 */
export interface PyodideDeTeste {
  runPython: (codigo: string) => unknown;
  setStdin: (o: { stdin: () => string }) => void;
  setStdout: (o: { batched: (t: string) => void }) => void;
  setStderr: (o: { batched: (t: string) => void }) => void;
}

export async function carregarPyodide(): Promise<PyodideDeTeste> {
  const require = createRequire(import.meta.url);
  const dir = require.resolve('pyodide/package.json').replace(/package\.json$/, '');
  const { loadPyodide } = await import(/* @vite-ignore */ `${dir}pyodide.mjs`);
  return await loadPyodide({ indexURL: dir }) as PyodideDeTeste;
}
