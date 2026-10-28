/*
 * Fotografa as telas que as lições de teoria mostram.
 *
 *     node scripts/capturar-exemplos.mjs              todas
 *     node scripts/capturar-exemplos.mjs CC-ES002     só uma vereda
 *     node scripts/capturar-exemplos.mjs estilo       só um tópico
 *
 * Sobe o servidor de desenvolvimento, abre `exemplos.html#<cena>` no Chromium,
 * segue o roteiro de `src/exemplos/roteiros.ts` e grava cada foto em
 * `public/assets/exemplos/<vereda>/<tópico>-<n>.png`.
 *
 * ── Por que não roda no CI ───────────────────────────────────────────────
 * As imagens vão versionadas, como a arte dos emblemas: o Pages serve o que
 * está no repositório, e refazer centenas de capturas a cada push deixaria o
 * deploy dependendo de um navegador. O que o CI confere é que toda imagem que
 * uma lição cita existe e que nenhuma sobra — `telasDasLicoes.test.ts`.
 *
 * Precisa do Playwright com o Chromium instalados; nas sessões da nuvem eles
 * já vêm.
 */

import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(import.meta.url)('playwright');
const filtro = process.argv[2];
const PORTA = 5199;

const servidor = await createServer({
  root: raiz, logLevel: 'error',
  server: { port: PORTA, strictPort: true, hmr: false },
});
await servidor.listen();
const { ROTEIROS, imagensDoRoteiro } = await servidor.ssrLoadModule('/src/exemplos/roteiros.ts');

const escolhidos = ROTEIROS.filter(r => !filtro || r.vereda === filtro || r.topico === filtro);
if (!escolhidos.length) {
  console.error(`Nenhum roteiro para "${filtro}".`);
  await servidor.close();
  process.exit(1);
}

/* O círculo do destaque. Desenhado por cima da página, e não por CSS da
   janela, para não mexer no layout que está sendo fotografado. */
const DESTACAR = (grupos) => {
  for (const grupo of grupos) {
    const caixas = grupo.map(el => el.getBoundingClientRect());
    const esq = Math.min(...caixas.map(c => c.left));
    const topo = Math.min(...caixas.map(c => c.top));
    const dir = Math.max(...caixas.map(c => c.right));
    const baixo = Math.max(...caixas.map(c => c.bottom));
    const d = document.createElement('div');
    d.setAttribute('data-destaque', '');
    Object.assign(d.style, {
      position: 'fixed', left: `${esq - 5}px`, top: `${topo - 5}px`,
      width: `${dir - esq + 10}px`, height: `${baixo - topo + 10}px`,
      border: '3px solid #E8112D', borderRadius: '8px', zIndex: '2147483647',
      boxShadow: '0 0 0 3px rgba(255,255,255,.85), 0 2px 12px rgba(0,0,0,.35)',
      pointerEvents: 'none',
    });
    document.body.appendChild(d);
  }
};

const navegador = await chromium.launch();
let erros = 0;

for (const r of escolhidos) {
  const pasta = join(raiz, 'public', 'assets', 'exemplos', r.vereda);
  await mkdir(pasta, { recursive: true });
  /* As fotos antigas do tópico saem antes: um roteiro que encolheu de quatro
     para três passos deixaria a quarta para trás, e a trava a acusaria de
     sobra sem que ninguém soubesse de onde veio. */
  for (const f of await readdir(pasta)) {
    if (f.startsWith(`${r.topico}-`) && /^\d+\.png$/.test(f.slice(r.topico.length + 1))) {
      await rm(join(pasta, f));
    }
  }

  const pagina = await navegador.newPage({
    viewport: { width: r.largura ?? 1280, height: r.altura ?? 720 },
    deviceScaleFactor: 1,
  });
  const problemas = [];
  pagina.on('pageerror', e => problemas.push(e.message));
  try {
    await pagina.goto(`http://localhost:${PORTA}/trilha-web/exemplos.html#${encodeURIComponent(r.cena)}`);
    await pagina.waitForSelector(`[data-cena="${r.cena}"]`, { state: 'attached', timeout: 60_000 });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(600);

    const nomes = imagensDoRoteiro(r);
    let n = 0;
    for (const a of r.acoes) {
      if ('clicar' in a) {
        const alvo = pagina.locator(a.clicar).first();
        if (a.duplo) await alvo.dblclick();
        else await alvo.click({ button: a.direito ? 'right' : 'left', modifiers: a.com ? [a.com] : [] });
      } else if ('digitar' in a) {
        await pagina.keyboard.type(a.digitar, { delay: 5 });
      } else if ('tecla' in a) {
        await pagina.keyboard.press(a.tecla);
      } else if ('escolher' in a) {
        await pagina.locator(a.escolher).first().selectOption(a.valor);
      } else if ('rolarAte' in a) {
        await pagina.locator(a.rolarAte).first().evaluate(el => el.scrollIntoView({ block: 'start' }));
      } else if ('apontar' in a) {
        await pagina.locator(a.apontar).first().hover();
      } else if ('ponto' in a) {
        /* Um ponto dado em fração da caixa do elemento: é como a caneta se
           mede, contra a prancha, e não contra a tela. */
        const caixa = await pagina.locator(a.ponto).first().boundingBox();
        const xy = ([fx, fy]) => [caixa.x + fx * caixa.width, caixa.y + fy * caixa.height];
        const [x, y] = xy(a.em);
        await pagina.mouse.move(x, y);
        await pagina.mouse.down();
        if (a.ate) {
          const [x2, y2] = xy(a.ate);
          await pagina.mouse.move(x2, y2, { steps: 8 });
        }
        await pagina.mouse.up();
      } else if ('selecionar' in a) {
        const alvo = pagina.locator(a.selecionar).first();
        await alvo.click();
        await alvo.evaluate((el, texto) => {
          /* Num campo de texto a seleção é do campo, e não do documento. */
          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            const i = el.value.indexOf(texto);
            if (i < 0) throw new Error(`"${texto}" não está no campo`);
            el.setSelectionRange(i, i + texto.length);
            return;
          }
          const andar = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          for (let no = andar.nextNode(); no; no = andar.nextNode()) {
            const i = no.data.indexOf(texto);
            if (i < 0) continue;
            const faixa = document.createRange();
            faixa.setStart(no, i);
            faixa.setEnd(no, i + texto.length);
            const sel = getSelection();
            sel.removeAllRanges();
            sel.addRange(faixa);
            document.dispatchEvent(new Event('selectionchange'));
            return;
          }
          throw new Error(`"${texto}" não está em ${el.outerHTML.slice(0, 80)}`);
        }, a.texto);
      } else if ('selecionarBlocos' in a) {
        const [de, ate] = a.selecionarBlocos;
        await pagina.locator(de).first().click();
        await pagina.evaluate(([sDe, sAte]) => {
          const inicio = document.querySelector(sDe);
          const fim = document.querySelector(sAte);
          const faixa = document.createRange();
          faixa.setStart(inicio, 0);
          faixa.setEnd(fim, fim.childNodes.length);
          const sel = getSelection();
          sel.removeAllRanges();
          sel.addRange(faixa);
          document.dispatchEvent(new Event('selectionchange'));
        }, [de, ate]);
      } else if ('foto' in a) {
        await pagina.waitForTimeout(250);
        if (a.destaque) {
          /* Cada item é um círculo; um item que é lista vira um círculo só em
             volta de todos — quatro parágrafos vazios seguidos são uma coisa. */
          const lista = Array.isArray(a.destaque) ? a.destaque : [a.destaque];
          const grupos = [];
          for (const item of lista) {
            const grupo = [];
            for (const s of Array.isArray(item) ? item : [item]) {
              grupo.push(await pagina.locator(s).first().elementHandle());
            }
            grupos.push(grupo);
          }
          await pagina.evaluate(DESTACAR, grupos);
        }
        await pagina.screenshot({ path: join(raiz, 'public', 'assets', 'exemplos', nomes[n]) });
        await pagina.evaluate(() => document.querySelectorAll('[data-destaque]').forEach(d => d.remove()));
        n++;
      }
      await pagina.waitForTimeout(120);
    }
    if (problemas.length) throw new Error(problemas.join('\n'));
    console.log(`✓ ${r.vereda} ${r.topico} — ${n} tela(s)`);
  } catch (e) {
    erros++;
    console.error(`✗ ${r.vereda} ${r.topico}: ${e.message}`);
  }
  await pagina.close();
}

await navegador.close();
await servidor.close();
process.exit(erros ? 1 : 0);
