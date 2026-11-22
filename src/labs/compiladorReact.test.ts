import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ARQUIVOS_DE_DECLARACAO } from './compiladorReact';
import { compilarReactNoNode } from './compiladorReactNoNode';
import { linhaOriginal } from './mapaDeFontes';
import { entradaDoProjeto, linhaNoArquivo, montarPaginaDeReact } from './paginaDeReact';
import { MAIN_DO_VITE } from './metasDaCcFe006';

/*
  O compilador da CC-FE006 e a página que ele monta.
*/

const MAIN = MAIN_DO_VITE;
const HTML = '<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>';

describe('o compilador de React', () => {
  it('a lista de declarações do worker é a mesma de ARQUIVOS_DE_DECLARACAO', () => {
    const worker = readFileSync(new URL('./typescriptWorker.ts', import.meta.url), 'utf8');
    const doWorker = [...worker.matchAll(/'\.\.\/\.\.\/node_modules\/([^']+\.d\.ts)'/g)].map(m => m[1]).filter(n => !n.startsWith('typescript/'));
    expect(doWorker.length).toBeGreaterThan(10);
    expect([...doWorker].sort()).toEqual([...ARQUIVOS_DE_DECLARACAO].sort());
  });

  it('verifica com os tipos do React: a propriedade de tipo errado e o class aparecem', async () => {
    const r = await compilarReactNoNode({
      'main.tsx': MAIN,
      'App.tsx': `function Cartao({ nome }: { nome: string }) {\n  return <p>{nome}</p>;\n}\nexport default function App() {\n  return <div class="x"><Cartao nome={3} /></div>;\n}\n`,
    });
    expect(r.diagnosticos.map(d => d.codigo)).toEqual([2322, 2322]);
    expect(r.diagnosticos[0].mensagem).toMatch(/className/);
    expect(r.sintaxe).toEqual([]);
  }, 30000);

  it('erro de tipo não segura a página — o Vite também não segura', async () => {
    const r = await compilarReactNoNode({ 'main.tsx': MAIN, 'App.tsx': 'export default function App() { const n: string = 3; return <p>{n}</p>; }\n' });
    expect(r.diagnosticos).toHaveLength(1);
    expect(r.modulos['App.tsx'].codigo).toContain('jsx_runtime_1.jsx');
  }, 30000);

  it('erro de sintaxe vira a tela vermelha, e nada do projeto roda', async () => {
    const r = await compilarReactNoNode({ 'main.tsx': MAIN, 'App.tsx': 'export default function App() {\n  return <p>oi</div>;\n}\n' });
    expect(r.sintaxe[0]).toMatchObject({ arquivo: 'App.tsx', linha: 2 });
    const html = montarPaginaDeReact({ 'index.html': HTML }, r, { bibliotecas: [] });
    expect(html).toContain('[plugin:vite:esbuild]');
    expect(html).not.toContain('__trilhaIniciar');
  }, 30000);

  it('a linha do erro volta ao .tsx pelo mapa de fontes', async () => {
    const app = 'export default function App() {\n  return (\n    <ul>\n      <li>a</li>\n      <li>b</li>\n    </ul>\n  );\n}\nexport const x = 1;\n';
    const r = await compilarReactNoNode({ 'main.tsx': MAIN, 'App.tsx': app });
    const gerado = r.modulos['App.tsx'].codigo.split('\n');
    const linhaDoX = gerado.findIndex(l => /exports\.x = 1/.test(l)) + 1;
    expect(linhaOriginal(r.modulos['App.tsx'].mapa, linhaDoX)).toBe(9);
    expect(linhaNoArquivo(r, 'App.tsx', linhaDoX)).toBe(9);
    expect(linhaNoArquivo(r, 'react-dom.development.js', 40)).toBe(40);
  }, 30000);
});

describe('a página de React', () => {
  it('a entrada é a que o index.html chama, sem a barra do começo', () => {
    expect(entradaDoProjeto(HTML)).toBe('main.tsx');
    expect(entradaDoProjeto('<script type="module" src="./src/index.tsx"></script>')).toBe('src/index.tsx');
  });

  it('o script do index.html vira as bibliotecas, o carregador e os módulos, nessa ordem', async () => {
    const r = await compilarReactNoNode({ 'main.tsx': MAIN, 'App.tsx': 'export default function App() { return <p>oi</p>; }\n' });
    const html = montarPaginaDeReact({ 'index.html': HTML }, r, { bibliotecas: [{ nome: 'react.development.js', src: 'https://x.test/react.js' }] });
    const i = (s: string) => html.indexOf(s);
    expect(i('https://x.test/react.js')).toBeGreaterThan(0);
    expect(i('https://x.test/react.js')).toBeLessThan(i('__trilhaDefinir = function'));
    expect(i('__trilhaDefinir = function')).toBeLessThan(i('data-trilha-tipo="module"'));
    expect(i('data-trilha-tipo="module"')).toBeLessThan(i('__trilhaIniciar("main.tsx")'));
    expect(html).toContain('<base data-trilha-interno href="about:srcdoc">');
    expect(html).toContain('"bibliotecas":{"https://x.test/react.js":"react.development.js"}');
  }, 30000);
});
