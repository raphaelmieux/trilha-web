import { describe, it, expect } from 'vitest';
import { instrumentar, linhaDaParada, linhasComParada, montarPagina } from './paginaViva';
import { rodarNoJsdom } from './paginaNoJsdom';

const PAGINA = `<!doctype html>
<html><head><link rel="stylesheet" href="estilo.css"><script src="script.js" defer></script></head>
<body><p id="p">x</p><button id="b">ir</button></body></html>`;

describe('a página montada', () => {
  it('põe a folha e o script onde a pessoa os pôs, e o bastidor antes de tudo', () => {
    const html = montarPagina({ 'index.html': PAGINA, 'estilo.css': 'p { color: red; }', 'script.js': 'let a = 1;' });
    const bastidor = html.indexOf('data-trilha-interno');
    const folha = html.indexOf('<style data-trilha-arquivo="estilo.css">');
    const script = html.indexOf('<script data-trilha-arquivo="script.js"');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(bastidor).toBeGreaterThan(0);
    expect(bastidor).toBeLessThan(folha);
    expect(folha).toBeLessThan(script);
    /* O defer continua: é ele que deixa o script do <head> achar a página. */
    expect(html.slice(script, html.indexOf('>', script))).toMatch(/defer/);
    expect(html).toContain('p { color: red; }');
  });

  it('não troca o que não é da pasta', () => {
    const html = montarPagina({ 'index.html': '<head><script src="https://cdn.exemplo/x.js"></script><link rel="icon" href="estilo.css"></head>', 'estilo.css': 'x' });
    expect(html).toContain('src="https://cdn.exemplo/x.js"');
    expect(html).toContain('<link rel="icon" href="estilo.css">');
  });

  it('o erro aponta a linha do script.js, e não a da página montada', async () => {
    const r = await rodarNoJsdom({
      'index.html': PAGINA, 'estilo.css': '',
      'script.js': "const p = document.querySelector('#p');\n\ndocument.querySelector('#nada').textContent = 'x';\n",
    }, []);
    expect(r.erros).toEqual([expect.objectContaining({
      texto: "Uncaught TypeError: Cannot set properties of null (setting 'textContent')",
      arquivo: 'script.js', linha: 3,
    })]);
  });

  it('o console mostra o valor como o navegador mostra', async () => {
    const r = await rodarNoJsdom({
      'index.html': PAGINA, 'estilo.css': '',
      'script.js': "console.log('texto', 3, [1, 'a'], { nome: 'Ana' }, document.querySelector('#p'), document.querySelectorAll('button'));",
    }, []);
    expect(r.console.map(c => c.texto)).toEqual(["texto 3 (2) [1, 'a'] {nome: 'Ana'} <p#p> NodeList(1) [button#b]"]);
  });
});

describe('as paradas', () => {
  const CODIGO = `let total = 0;
const campo = 3;

function somar(pontos) {
  const dobro = pontos * 2;
  total = total + dobro;
  return total;
}

somar(campo);
somar(4);
`;

  it('só ficam em linha que começa instrução, e escorregam para a próxima', () => {
    expect(linhasComParada(CODIGO)).toEqual([1, 2, 5, 6, 7, 10, 11]);
    expect(linhaDaParada(CODIGO, 3)).toBe(5);
    expect(linhaDaParada(CODIGO, 8)).toBe(10);
    expect(linhaDaParada(CODIGO, 12)).toBeNull();
  });

  it('a instrumentação não muda o número de linha de nada', () => {
    const { codigo, efetivas } = instrumentar(CODIGO, [6, 3]);
    expect(efetivas).toEqual([5, 6]);
    expect(codigo.split('\n')).toHaveLength(CODIGO.split('\n').length);
    expect(codigo.split('\n')[8]).toBe(CODIGO.split('\n')[8]);
  });

  it('anota cada passagem com o que se enxerga dali, e o let de antes da declaração não estoura', async () => {
    const r = await rodarNoJsdom({
      'index.html': PAGINA, 'estilo.css': '',
      'script.js': `${CODIGO}let depois = 1;\n`,
    }, [], { paradas: [5] });
    expect(r.erros).toEqual([]);
    expect(r.paradas.map(p => p.vez)).toEqual([1, 2]);
    const primeira = Object.fromEntries(r.paradas[0].variaveis.map(v => [v.nome, v.valor]));
    expect(primeira).toMatchObject({ total: '0', campo: '3', pontos: '3', dobro: '<não iniciada>', depois: '<não iniciada>' });
    expect(Object.fromEntries(r.paradas[1].variaveis.map(v => [v.nome, v.valor]))).toMatchObject({ total: '6', pontos: '4' });
  });

  it('arquivo que não se lê não ganha parada nenhuma — o erro dele aparece ao rodar', () => {
    expect(linhasComParada('let = ;')).toEqual([]);
    expect(instrumentar('let = ;', [1])).toEqual({ codigo: 'let = ;', efetivas: [] });
  });
});
