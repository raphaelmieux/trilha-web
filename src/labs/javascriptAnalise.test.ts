import { describe, it, expect } from 'vitest';
import { analisarJavascript, type IdDaAnalise } from './javascriptAnalise';

/*
  Cada conta da análise com o caso que passa e o caso que quase passa.

  O caso que quase passa é o que importa: a palavra escrita sem o uso. Função
  declarada e nunca chamada, let que nunca muda, método de seta que não tem
  this, reduce sem valor inicial — todos têm a palavra, e nenhum é o que a
  tarefa pede.
*/

const tem = (codigo: string, id: IdDaAnalise) => analisarJavascript({ 'programa.js': codigo }).achados[id];

describe('a análise do programa', () => {
  it.each<[IdDaAnalise, string, string]>([
    ['semVar', 'const a = 1;\nlet b = 2;', 'const a = 1;\nvar b = 2;'],
    ['letEConst', 'const a = 1;\nlet t = 0;\nt += a;', 'const a = 1;\nlet t = 0;\nconsole.log(t);'],
    ['igualdadeEstrita', "if (a === 1) {}\nif (b !== 2) {}", "if (a === 1) {}\nif (b == 2) {}"],
    ['seSenao', 'if (a) { f(); } else { g(); }', 'if (a) { f(); } else { }'],
    ['laco', 'for (const x of l) { f(x); }', 'for (const x of l) {}'],
    ['funcaoNomeada', 'function f() { return 1; }\nf();', 'function f() { return 1; }'],
    ['funcaoDeSeta', 'const f = x => x * 2;\nf(2);', 'const f = x => x * 2;'],
    ['usaMap', 'l.map(x => x * 2);', 'l.map;'],
    ['usaFilter', 'l.filter(x => x > 2);', 'l.filter();'],
    ['usaReduce', 'l.reduce((s, x) => s + x, 0);', 'l.reduce((s, x) => s + x);'],
    ['objetoComMetodo',
      'const u = { nome: "A", n: [], resumo() { return this.nome; } };\nu.resumo();',
      'const u = { nome: "A", n: [], resumo: () => this.nome };\nu.resumo();'],
    ['promessaPropria', 'const e = ms => new Promise(r => setTimeout(r, ms));', 'const e = new Promise(() => {});'],
    ['asyncAwait', 'async function f() { await g(); }', 'async function f() { g(); }'],
    ['trataErroDaPromessa',
      'async function f() { try { await g(); } catch (e) { console.log(e.message); } }',
      'async function f() { try { await g(); } catch (e) { } }'],
    ['leArquivo', "readFileSync('a.json', 'utf8');", "const readFileSync = 1;"],
    ['gravaArquivo', "writeFileSync('a.json', t);", "writeFileSync('a.json');"],
    ['jsonParse', 'JSON.parse(t);', 'parse(t);'],
    ['jsonStringify', 'JSON.stringify(o);', 'String(o);'],
    ['tresFuncoes',
      'function a() { return 1; }\nconst b = () => 2;\nfunction c() { return a() + b(); }\nc();',
      'function a() { return 1; }\nconst b = () => 2;\nfunction c() { return 3; }\nc();'],
  ])('%s', (id, passa, quase) => {
    expect(tem(passa, id)).toBe(true);
    expect(tem(quase, id)).toBe(false);
  });

  it('o método com this é contado mesmo quando o this aparece dentro de uma seta do método', () => {
    expect(tem('const u = { nome: "A", m: [1], listar() { this.m.forEach(x => console.log(this.nome, x)); } };\nu.listar();', 'objetoComMetodo')).toBe(true);
  });

  it('lê módulo e script, e diz qual arquivo não se lê', () => {
    expect(analisarJavascript({ 'a.js': "import fs from 'fs';\nconst x = 1;" }).ilegiveis).toEqual([]);
    expect(analisarJavascript({ 'a.js': 'let x = ;' }).ilegiveis).toEqual(['a.js']);
  });

  it('a função definida num arquivo e chamada no outro conta como chamada', () => {
    const r = analisarJavascript({
      'programa.js': "import { a, b, c } from './util.js';\na(); b(); c();",
      'util.js': 'export function a() { return 1; }\nexport const b = () => 2;\nexport function c() { return 3; }',
    });
    expect(r.achados.tresFuncoes).toBe(true);
  });
});
