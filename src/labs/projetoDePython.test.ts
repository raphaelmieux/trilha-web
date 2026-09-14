import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { preambuloDoProjeto, PASTA_DO_PROJETO } from './projetoDePython';

/*
  A pasta em que o programa roda, conferida rodando.

  ── Por que estas quatro, e não outras ───────────────────────────────────
  Todas nasceram do mesmo lugar: o worker é **um só** e o Pyodide vive entre
  execuções. Quem escreve a lição pensa numa execução; quem usa o laboratório
  faz dezenas, uma atrás da outra, no mesmo processo. Tudo o que sobra de uma
  chega à seguinte.

  As quatro falham em silêncio, que é o que as torna caras:

  1. O módulo importado fica em `sys.modules`. Editar o segundo arquivo-fonte e
     mandar rodar de novo executaria a versão anterior dele, sem nada na tela
     dizendo isso — e quem está aprendendo a dividir um programa concluiria que
     dividir não funciona.

  2. O arquivo gravado numa execução sobrevive à seguinte. Um programa que
     grava errado, é corrigido para não gravar mais nada e roda de novo passaria
     na verificação por causa do que a primeira execução deixou. É o
     "laboratório que abre resolvido" em outra roupa.

  3. Os imports do preâmbulo cairiam no espaço de nomes de quem estuda. Um
     programa que esquecesse o `import json` funcionaria aqui e estouraria no
     computador do clube — o pior dos dois lugares para descobrir.

  4. E o sistema de arquivos do Pyodide recusa remover o diretório de trabalho
     atual. Como a execução anterior deixou o processo dentro da pasta, a
     primeira execução funcionava e a **segunda** estourava com "Resource
     busy". Este é o que já aconteceu: a trava dos laboratórios o pegou, e esta
     aqui existe para ele não voltar pela porta dos fundos.
*/

interface Py {
  runPython: (c: string) => unknown;
  setStdout: (o: { batched: (t: string) => void }) => void;
  setStderr: (o: { batched: (t: string) => void }) => void;
}

let py: Py;

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const dir = require.resolve('pyodide/package.json').replace(/package\.json$/, '');
  const { loadPyodide } = await import(`${dir}pyodide.mjs`);
  py = await loadPyodide({ indexURL: dir }) as Py;
}, 120000);

/** Uma execução do laboratório: prepara a pasta e roda o programa. */
function executar(arquivos: Record<string, string>, programa: string) {
  let saida = '';
  py.setStdout({ batched: t => { saida += `${t}\n`; } });
  py.setStderr({ batched: t => { saida += `${t}\n`; } });
  py.runPython(preambuloDoProjeto(arquivos));
  py.runPython(programa);
  return saida.trimEnd();
}

describe('a pasta do projeto', () => {
  it('escreve os arquivos e deixa o programa lê-los', () => {
    expect(executar(
      { 'dados.txt': 'Falcão\nPantera\n' },
      'print(open("dados.txt", encoding="utf-8").read().strip())',
    )).toBe('Falcão\nPantera');
  });

  it('faz o import achar o arquivo ao lado', () => {
    expect(executar(
      { 'chamada.py': 'def contar(nomes):\n    return len(nomes)\n' },
      'from chamada import contar\nprint(contar(["Ana", "Tiago"]))',
    )).toBe('2');
  });

  /*
    O de número 1: o módulo editado vale a partir da próxima execução.
  */
  it('relê o arquivo importado quando ele muda entre execuções', () => {
    executar({ 'chamada.py': 'def quantos():\n    return 1\n' },
      'from chamada import quantos\nprint(quantos())');

    expect(executar(
      { 'chamada.py': 'def quantos():\n    return 99\n' },
      'from chamada import quantos\nprint(quantos())',
    ), 'a execução seguinte usou a versão anterior do arquivo importado').toBe('99');
  });

  /*
    O de número 4, e o que de fato aconteceu: só a **segunda** execução o
    mostra, porque é ela que tenta apagar a pasta de onde o processo já está.
  */
  it('roda duas vezes seguidas, com o processo dentro da pasta', () => {
    executar({ 'dados.txt': 'primeira\n' }, 'print(open("dados.txt", encoding="utf-8").read().strip())');
    expect(
      () => executar({ 'dados.txt': 'segunda\n' }, 'print(open("dados.txt", encoding="utf-8").read().strip())'),
      'a segunda execução não conseguiu refazer a pasta',
    ).not.toThrow();
  });

  /* O de número 2: o disco começa igual todas as vezes. */
  it('não deixa para a execução seguinte o arquivo que a anterior gravou', () => {
    executar({}, 'open("sobra.txt", "w", encoding="utf-8").write("da primeira")');
    expect(executar({}, 'import os\nprint(os.path.exists("sobra.txt"))')).toBe('False');
  });

  /* O de número 3: o que o preâmbulo importa não vale para quem estuda. */
  it('não empresta ao programa os módulos que ele mesmo importou', () => {
    expect(executar({}, 'print("json" in dir(), "shutil" in dir(), "importlib" in dir())'))
      .toBe('False False False');
  });

  /* E não deixa o nome da própria função para trás, que apareceria num dir(). */
  it('não deixa rastro de si mesmo no espaço de nomes', () => {
    expect(executar({}, 'print("_preparar_o_projeto" in dir())')).toBe('False');
  });

  /*
    Nome que sobe de pasta escreveria por cima do Python do navegador, e o
    estrago só apareceria na execução seguinte — longe da causa.
  */
  it('recusa nome de arquivo que saia da pasta', () => {
    expect(() => executar({ '../fora.py': 'x = 1' }, 'pass')).toThrow(/fora da pasta/);
  });

  it('é a pasta que os caminhos relativos usam', () => {
    expect(executar({}, 'import os\nprint(os.getcwd())')).toBe(PASTA_DO_PROJETO);
  });
});
