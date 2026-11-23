import { describe, it, expect } from 'vitest';
import { MODULOS_DE_REACT } from './react';
import { MODULOS_DO_PROJETO_DE_INTERFACE } from './projetoDeInterface';
import type { TopicoDeVereda } from './veredas';
import { compilarReactNoNode } from '../labs/compiladorReactNoNode';
import { montarPaginaDeReact } from '../labs/paginaDeReact';
import { bibliotecasNoNode } from '../labs/bibliotecasNoNode';
import { rodarPaginaNoJsdom } from '../labs/paginaNoJsdom';
import { MAIN_DO_VITE } from '../labs/metasDaCcFe006';

/*
  Cada exemplo de React da teoria, compilado e rodado como o laboratório
  roda: o mesmo compilador, o mesmo React de desenvolvimento, a mesma página.

  O quadro ao lado do exemplo diz o que a página mostra, uma linha por
  título, parágrafo, item e botão. Escrever isso de cabeça erra por pouco e
  com frequência — e quem compara a própria tela com um exemplo errado
  conclui que a tela dele é que está errada. Esta trava confere linha por
  linha, e confere também que o exemplo compila sem nenhum problema e roda
  sem aviso do React: o exemplo da teoria não pode ensinar o que o
  laboratório recusa.
*/

const MAIN_COM_ROTAS = MAIN_DO_VITE
  .replace("import App from './App';", "import { HashRouter } from 'react-router-dom';\nimport App from './App';")
  .replace('    <App />', '    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>\n      <App />\n    </HashRouter>');

const HTML = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>';

const topicos: TopicoDeVereda[] = [...MODULOS_DE_REACT, ...MODULOS_DO_PROJETO_DE_INTERFACE].flatMap(m => m.licoes)
  .flatMap(l => (l.tipo === 'teoria' ? l.topicos : []));
const comExemplo = topicos.filter(t => t.exemploComo === 'react' && t.exemplo !== undefined);

describe('os exemplos de React da teoria', () => {
  it('há exemplos para conferir, e todo exemplo de React declara o que a página mostra', () => {
    expect(comExemplo.length).toBeGreaterThanOrEqual(12);
    for (const t of comExemplo) expect(t.exemploSaida, t.id).toBeDefined();
  });

  it.each(comExemplo.map(t => [t.id, t] as const))('%s mostra o que o quadro diz', async (_, t) => {
    const arquivos = {
      'index.html': HTML,
      'main.tsx': /react-router-dom/.test(t.exemplo!) ? MAIN_COM_ROTAS : MAIN_DO_VITE,
      'App.tsx': t.exemplo!,
    };
    const c = await compilarReactNoNode(arquivos);
    expect(c.diagnosticos, t.id).toEqual([]);
    const r = await rodarPaginaNoJsdom(montarPaginaDeReact(arquivos, c, { bibliotecas: bibliotecasNoNode() }), [
      { acao: 'esperar' },
      { acao: 'ler', chave: 'linhas', seletor: '#root h1, #root h2, #root h3, #root p, #root li, #root button', como: 'textos' },
    ], 'about:srcdoc');
    expect(r.erros, t.id).toEqual([]);
    expect(r.console.filter(e => e.nivel === 'error').map(e => e.texto), t.id).toEqual([]);
    expect((r.leituras.linhas as string[]).join('\n')).toBe(t.exemploSaida);
  }, 30000);
});
