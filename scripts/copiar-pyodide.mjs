/*
 * Traz o Pyodide do node_modules para public/pyodide/, antes do dev e do build.
 *
 * ── Por que copiar, e não apontar para um CDN ────────────────────────────
 * A plataforma não depende de nenhum servidor de terceiro, e esta seria a
 * primeira dependência externa dela. O computador do clube costuma estar atrás
 * de um filtro de rede — e um CDN bloqueado não dá erro que alguém entenda:
 * dá um laboratório que não abre.
 *
 * ── Por que copiar, e não versionar ──────────────────────────────────────
 * São 12 MB de binário. Versioná-los engordaria todo clone do repositório para
 * sempre, e a versão já está fixada no package-lock — que é onde versão de
 * dependência se fixa. O `npm ci` do workflow instala, isto copia, e o Pages
 * serve do nosso próprio domínio.
 *
 * public/pyodide/ está no .gitignore justamente por isso.
 */

import { cp, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origem = join(raiz, 'node_modules', 'pyodide');
const destino = join(raiz, 'public', 'pyodide');

/*
  Só o que o navegador pede em tempo de execução.

  O pacote traz também mapas de fonte, tipos e duas páginas de console de
  exemplo. Copiar a pasta inteira levaria centenas de KB que ninguém baixa —
  e, pior, o `console.html`, uma página que executa código arbitrário e
  passaria a existir no nosso domínio.
*/
const ARQUIVOS = [
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

const existe = async (caminho) => {
  try { await stat(caminho); return true; } catch { return false; }
};

if (!await existe(origem)) {
  console.error('pyodide não está instalado. Rode `npm install` antes.');
  process.exit(1);
}

await mkdir(destino, { recursive: true });
for (const arquivo of ARQUIVOS) {
  await cp(join(origem, arquivo), join(destino, arquivo));
}
console.log(`pyodide: ${ARQUIVOS.length} arquivos em public/pyodide/`);
