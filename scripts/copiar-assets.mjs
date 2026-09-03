/*
 * Traz para `public/` o que o Pyodide e o Scratch pedem em tempo de execução.
 *
 * ── Por que copiar, e não apontar para um CDN ────────────────────────────
 * A plataforma não depende de nenhum servidor de terceiro. O computador do
 * clube costuma estar atrás de um filtro de rede, e CDN bloqueado não dá erro
 * que alguém entenda: dá um laboratório que não abre.
 *
 * ── Por que copiar, e não versionar ──────────────────────────────────────
 * São dezenas de megabytes de binário. Versioná-los engordaria todo clone do
 * repositório para sempre, e a versão já está fixada no package-lock — que é
 * onde versão de dependência se fixa. O `npm ci` do workflow instala, isto
 * copia, e o Pages serve do nosso próprio domínio.
 *
 * `public/pyodide/` e `public/scratch/` estão no .gitignore por isso.
 */

import { cp, mkdir, stat, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const modulo = (nome) => join(raiz, 'node_modules', nome);
const publico = (nome) => join(raiz, 'public', nome);

const existe = async (caminho) => {
  try { await stat(caminho); return true; } catch { return false; }
};

async function copiar(de, para, itens) {
  if (!await existe(de)) {
    console.error(`dependência ausente em ${de}. Rode \`npm install\`.`);
    process.exit(1);
  }
  await rm(para, { recursive: true, force: true });
  await mkdir(para, { recursive: true });
  for (const item of itens) {
    if (await existe(join(de, item))) {
      await cp(join(de, item), join(para, item), { recursive: true });
    }
  }
}

/*
  Pyodide: só o que o navegador pede rodando.

  O pacote traz também mapas de fonte, tipos e duas páginas de console de
  exemplo. Copiar a pasta inteira levaria centenas de KB que ninguém baixa —
  e, pior, o `console.html`, uma página que executa código arbitrário e
  passaria a existir no nosso domínio.
*/
await copiar(modulo('pyodide'), publico('pyodide'), [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
]);

/*
  Scratch: tudo menos o pacote de código.

  `scratch-gui.js` fica de fora porque é o módulo que o Vite empacota — copiá-lo
  serviria a mesma coisa duas vezes, e são 18 MB.

  `static/assets` são 65 MB: a biblioteca de fantasias, cenários e sons. Sem
  ela o editor abre com todo ícone quebrado e a biblioteca vazia — um Scratch
  visivelmente pela metade. `static/blocks-media` são os ícones dentro dos
  próprios blocos, e `libraries/` é o índice que a biblioteca lê.
*/
await copiar(modulo('scratch-gui/dist'), publico('scratch'), [
  'static',
  'libraries',
  'chunks',
  'extension-worker.js',
  '30d09ba32a17082ef820b57d52d60b7b.hex',
]);

console.log('assets: public/pyodide/ e public/scratch/ prontos');
