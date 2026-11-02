import { describe, it, expect } from 'vitest';
import { executarNode, type Pasta } from './nodeSimulado';
import { ouvirNoTeste, rodarNoNode } from './nodeDeVerdade';

/*
  O Node simulado, conferido contra o Node de verdade.

  O laboratório só ensina certo se escrever o que o terminal do clube vai
  escrever: a mesma saída, o mesmo erro, e a pasta como ela fica. Cada caso
  aqui roda nos dois e compara as três coisas — e os casos são os enganos que
  as lições mostram, porque é neles que uma imitação errada ensinaria errado.
*/

const CASOS: [string, Pasta][] = [
  ['console.log com vários valores, arranjo e objeto', {
    'programa.js': "const a = 1;\nlet b = 2;\nb = b + a;\nconsole.log('soma', b, [1, 2], { x: 'y' });\nconsole.log('%s tem %d anos', 'Ana', 12);\n",
  }],
  ['nome que não existe', { 'programa.js': "const total = 5;\nconsole.log(totl);\n" }],
  ['const reatribuída', { 'programa.js': 'const c = 1;\nc = 2;\n' }],
  ['erro de sintaxe', { 'programa.js': "console.log('antes');\nlet x = ;\n" }],
  ['ler sem utf8 mostra o Buffer', {
    'programa.js': "const fs = require('fs');\nconsole.log(fs.readFileSync('d.json'));\n", 'd.json': '[{"nome":"Ana"}]',
  }],
  ['gravar objeto sem stringify', { 'programa.js': "const fs = require('fs');\nfs.writeFileSync('x.json', { a: 1 });\n" }],
  ['arquivo que não existe', { 'programa.js': "import { readFileSync } from 'node:fs';\nreadFileSync('nao.json', 'utf8');\n" }],
  ['ler, mudar e gravar JSON com import', {
    'programa.js': "import { readFileSync, writeFileSync } from 'node:fs';\nconst d = JSON.parse(readFileSync('dados.json', 'utf8'));\nd.push({ nome: 'Caio', idade: 11 });\nwriteFileSync('dados.json', JSON.stringify(d, null, 2));\nconsole.log(d);\n",
    'dados.json': '[{"nome":"Ana","idade":12}]',
  }],
  ['import com e sem extensão', {
    'programa.js': "import soma, { dobro } from './util.js';\nimport * as tudo from './util.js';\nconsole.log(dobro(4), soma(1, 2), tudo);\n",
    'util.js': 'export const dobro = n => n * 2;\nexport default function soma(a, b) { return a + b; }\n',
  }],
  ['import sem a extensão', {
    'programa.js': "import { dobro } from './util';\nconsole.log(dobro(4));\n", 'util.js': 'export const dobro = n => n * 2;\n',
  }],
  ['require num arquivo com import', { 'programa.js': "import fs from 'fs';\nconsole.log(require('fs'));\n" }],
  ['require e await no topo', { 'programa.js': "const fs = require('fs');\nconst r = await Promise.resolve(1);\n" }],
  ['await no topo de um módulo', {
    'programa.js': "import fs from 'fs/promises';\nconst texto = await fs.readFile('d.json', 'utf8');\nconsole.log(JSON.parse(texto).length);\nawait new Promise(r => setTimeout(r, 200));\nconsole.log('depois');\n",
    'd.json': '[1,2,3]',
  }],
  ['import de binding é constante', {
    'programa.js': "import { x } from './util.js';\nconsole.log(x);\nx = 3;\n", 'util.js': 'export let x = 1;\n',
  }],
  ['import de JSON sem atributo', { 'programa.js': "import d from './d.json';\n", 'd.json': '{}' }],
  ['ordem do laço de eventos', {
    'programa.js': "const p = new Promise(ok => setTimeout(() => ok('pronto'), 100));\nconsole.log(p);\np.then(v => console.log(v));\nconsole.log('primeiro');\nsetTimeout(() => console.log('timer 0'), 0);\nPromise.resolve().then(() => console.log('micro'));\n",
  }],
  ['var no laço com setTimeout', {
    'programa.js': "for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i), 10);\nfor (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j), 20);\n",
  }],
  ['setInterval que se cancela', {
    'programa.js': "let n = 0;\nconst id = setInterval(() => { n++; console.log('tique', n); if (n === 3) clearInterval(id); }, 100);\n",
  }],
  ['try/catch em volta do await', {
    'programa.js': "async function busca() { await new Promise(r => setTimeout(r, 50)); throw new Error('servidor fora do ar'); }\nasync function main() { try { await busca(); } catch (e) { console.log('Deu erro:', e.message); } finally { console.log('fim'); } }\nmain();\n",
  }],
  ['rejeição sem tratamento', { 'programa.js': "async function f() { throw new Error('falhou na rede'); }\nf();\nconsole.log('antes');\n" }],
  ['throw de um erro', { 'programa.js': "throw new TypeError('nao pode');\n" }],
  ['seta como método', { 'programa.js': "const o = { nome: 'Ana', falar: () => 'Oi, ' + this.nome };\nconsole.log(o.falar());\n" }],
  ['método solto do objeto, num módulo', {
    'programa.js': "import fs from 'fs';\nconst o = { nome: 'Ana', falar() { return 'Oi, ' + this.nome; } };\nconst f = o.falar;\nconsole.log(f());\n",
  }],
  ['module.exports e exports', {
    'programa.js': "const u = require('./util');\nconsole.log(u);\n", 'util.js': "module.exports.nome = 'x';\nexports.idade = 3;\n",
  }],
  ['conversões e contas', {
    'programa.js': "console.log(typeof undefined, typeof null, 0.1 + 0.2, '5' + 3, '5' - 3, 10 / 3, [] + [], [1, 2, 3, 4, 5, 6, 7, 8]);\nconsole.log([10, 9, 1].sort(), 'é' < 'z', NaN === NaN);\n",
  }],
  ['erro dentro de função chamada por outra', { 'programa.js': 'function a() { b(); }\nfunction b() { null.x; }\na();\n' }],
  ['process.exit no meio', { 'programa.js': "console.log('um');\nprocess.exit(0);\nconsole.log('dois');\n" }],
];

describe('o Node simulado escreve o que o Node de verdade escreve', () => {
  it.each(CASOS)('%s', async (_, pasta) => {
    const simulado = await executarNode(pasta, 'programa.js', { ouvirRejeicoes: ouvirNoTeste });
    const deVerdade = rodarNoNode(pasta, 'programa.js');
    expect(simulado.saida).toBe(deVerdade.saida);
    /* Quando quem lança é uma função do próprio Node — o readFileSync que
       não acha o arquivo —, ele aponta a seta para dentro dele mesmo, numa
       linha de node:fs que ninguém escreveu. O simulado aponta para a linha
       do programa que chamou, que é onde está o engano; aí se compara só a
       mensagem. */
    const interno = (deVerdade.erro ?? '').startsWith('node:');
    const ultima = (t: string | null) => (t ?? '').split('\n\n').pop();
    if (interno) expect(ultima(simulado.erro)).toBe(ultima(deVerdade.erro));
    else expect(simulado.erro ?? '').toBe(deVerdade.erro ?? '');
    expect(simulado.pasta).toEqual(deVerdade.pasta);
  }, 30000);
});

describe('o que só o simulado precisa garantir', () => {
  it('o tempo é de mentira: esperar três segundos devolve na hora, e Date.now anda junto', async () => {
    const inicio = Date.now();
    const r = await executarNode({
      'programa.js': "const t0 = Date.now();\nsetTimeout(() => console.log(Date.now() - t0 >= 3000), 3000);\n",
    }, 'programa.js');
    expect(r.saida).toBe('true\n');
    expect(Date.now() - inicio).toBeLessThan(1500);
  });

  it('o setInterval que nunca para é encerrado, e não trava', async () => {
    const r = await executarNode({ 'programa.js': 'setInterval(() => {}, 10);\n' }, 'programa.js');
    expect(r.semFim).toBe(true);
  });

  it('a saída gigante é cortada, e o laço que a produz termina', async () => {
    const r = await executarNode({ 'programa.js': "while (true) console.log('de novo');\n" }, 'programa.js');
    expect(r.saida.length).toBeLessThan(21000);
    expect(r.saida).toContain('foi cortada');
  });

  it('a pasta de entrada não é tocada: cada execução começa do mesmo lugar', async () => {
    const pasta = { 'programa.js': "require('fs').writeFileSync('a.txt', 'novo');\n", 'a.txt': 'velho' };
    const r = await executarNode(pasta, 'programa.js');
    expect(r.pasta['a.txt']).toBe('novo');
    expect(pasta['a.txt']).toBe('velho');
  });

  it('o programa principal que não existe diz o nome que faltou', async () => {
    const r = await executarNode({}, 'programa.js');
    expect(r.erro).toContain("Cannot find module '/projeto/programa.js'");
  });
});
