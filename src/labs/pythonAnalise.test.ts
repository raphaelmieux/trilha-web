import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import {
  apararTraceback, erroDeSintaxeEmTexto, ANALISADOR, type SaidaDaAnalise,
} from './pythonAnalise';

/*
  O analisador roda contra o Python de verdade, e não contra uma imitação dele.

  É a lição que o validador de CSS deixou: lá, a lista de nomes exatos passava
  no jsdom e reprovava no Chromium, porque quem expande a forma curta é o motor.
  Aqui o motor é o CPython, o mesmo binário que o navegador carrega — então um
  teste em node é fiel, e vale a pena pagar os segundos de carga por ele.
*/

interface Py { runPython: (c: string) => unknown }
let py: Py;

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const dir = require.resolve('pyodide/package.json').replace(/package\.json$/, '');
  const { loadPyodide } = await import(`${dir}pyodide.mjs`);
  py = await loadPyodide({ indexURL: dir }) as Py;
}, 120_000);

const rodarAnalise = (fonte: string): SaidaDaAnalise => {
  py.runPython(`_fonte = ${JSON.stringify(fonte)}`);
  return JSON.parse(py.runPython(ANALISADOR) as string);
};

const analisar = (fonte: string): Record<string, boolean> => {
  const r = rodarAnalise(fonte);
  if (!r.ok) throw new Error(`não compilou: ${r.erro.msg}`);
  return r.achados;
};

describe('o analisador lê a árvore, e não o texto', () => {
  /*
    É a razão de existir do analisador. Busca de texto acharia todas estas
    palavras — e nenhuma delas é a estrutura que a palavra nomeia.
  */
  it('não confunde comentário, string e nome de variável com estrutura', () => {
    const a = analisar([
      '# aqui eu ia usar um while e um for',
      'texto = "while True: for x in y"',
      'while_ativo = False',
      'print(texto)',
    ].join('\n'));
    expect(a.lacoWhile).toBe(false);
    expect(a.lacoFor).toBe(false);
  });

  it('acha o for e o while de verdade', () => {
    const a = analisar([
      'for i in range(3):',
      '    print(i)',
      'n = 3',
      'while n > 0:',
      '    n = n - 1',
    ].join('\n'));
    expect(a.lacoFor).toBe(true);
    expect(a.lacoWhile).toBe(true);
  });

  /* A armadilha do vazio, a mesma dos blocos: a palavra-chave sem corpo. */
  it('recusa o laço cujo corpo é só pass', () => {
    const a = analisar('while True:\n    pass\nfor i in range(2):\n    pass');
    expect(a.lacoWhile).toBe(false);
    expect(a.lacoFor).toBe(false);
  });
});

describe('os quatro tipos', () => {
  it('reconhece literais de cada tipo', () => {
    const a = analisar([
      'idade = 12',
      'altura = 1.75',
      'nome = "Raphael"',
      'inscrito = True',
    ].join('\n'));
    expect(a.tipoInteiro).toBe(true);
    expect(a.tipoDecimal).toBe(true);
    expect(a.tipoTexto).toBe(true);
    expect(a.tipoBooleano).toBe(true);
  });

  /*
    True é um int em Python, e `isinstance(True, int)` é verdadeiro. Se o bool
    fosse testado depois do int, todo booleano contaria como inteiro — e um
    programa com um True e nenhum número passaria na verificação de inteiro.
  */
  it('não conta True como inteiro', () => {
    const a = analisar('inscrito = True');
    expect(a.tipoBooleano).toBe(true);
    expect(a.tipoInteiro).toBe(false);
  });

  it('aceita o tipo vindo da conversão da entrada', () => {
    const a = analisar('idade = int(input("Idade: "))\naltura = float(input("Altura: "))');
    expect(a.tipoInteiro).toBe(true);
    expect(a.tipoDecimal).toBe(true);
  });
});

describe('o condicional completo', () => {
  it('exige if, elif e else, os três com corpo', () => {
    expect(analisar('x = 1\nif x > 0:\n    print("a")').condicionalCompleto).toBe(false);
    expect(analisar('x = 1\nif x > 0:\n    print("a")\nelse:\n    print("b")').condicionalCompleto).toBe(false);

    const completo = analisar([
      'x = 1',
      'if x > 0:',
      '    print("positivo")',
      'elif x < 0:',
      '    print("negativo")',
      'else:',
      '    print("zero")',
    ].join('\n'));
    expect(completo.condicionalCompleto).toBe(true);
  });

  it('recusa o conjunto em que algum ramo só tem pass', () => {
    const a = analisar('x = 1\nif x > 0:\n    print("a")\nelif x < 0:\n    pass\nelse:\n    print("c")');
    expect(a.condicionalCompleto).toBe(false);
  });
});

describe('as contas, as comparações e a entrada', () => {
  it('vê a conta e a comparação', () => {
    const a = analisar('soma = 2 + 3\nmaior = soma > 4');
    expect(a.operadorAritmetico).toBe(true);
    expect(a.operadorComparacao).toBe(true);
  });

  it('leEExibe pede os dois, e não um só', () => {
    expect(analisar('print("oi")').leEExibe).toBe(false);
    expect(analisar('nome = input()').leEExibe).toBe(false);
    expect(analisar('nome = input()\nprint(nome)').leEExibe).toBe(true);
  });
});

describe('o traceback aparado', () => {
  /*
    As mensagens abaixo são as que o Pyodide realmente produziu — copiadas de
    uma execução, e não escritas de memória.
  */
  it('deixa só a linha do programa e o nome do erro', () => {
    const bruto = 'Traceback (most recent call last):\n'
      + '  File "/lib/python314.zip/_pyodide/_base.py", line 523, in eval_code\n'
      + '    .run(globals, locals)\n     ~~~^^^^^^^^^^^^^^^^^\n'
      + '  File "/lib/python314.zip/_pyodide/_base.py", line 357, in run\n'
      + '    coroutine = eval(self.code, globals, locals)\n'
      + '  File "<exec>", line 3, in <module>\n'
      + 'IndexError: list index out of range\n';
    const limpo = apararTraceback(bruto);
    expect(limpo).toBe('  File "programa.py", line 3, in <module>\nIndexError: list index out of range');
    expect(limpo).not.toContain('_pyodide');
    expect(limpo).not.toContain('eval_code');
  });

  it('preserva o trecho e o circunflexo do erro de sintaxe', () => {
    const bruto = 'Traceback (most recent call last):\n'
      + '  File "/lib/python314.zip/_pyodide/_base.py", line 149, in _parse_and_compile_gen\n'
      + '    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)\n'
      + '  File "<exec>", line 1\n'
      + '    for i in range(3)\n'
      + '                     ^\n'
      + "SyntaxError: expected ':'\n";
    const limpo = apararTraceback(bruto);
    expect(limpo).toContain('File "programa.py", line 1');
    expect(limpo).toContain('for i in range(3)');
    expect(limpo).toContain('^');
    expect(limpo).toContain("SyntaxError: expected ':'");
    expect(limpo).not.toContain('_pyodide');
  });

  it('não some com o erro quando não há quadro do programa', () => {
    expect(apararTraceback('MemoryError')).toBe('MemoryError');
  });
});

describe('o erro de sintaxe é o da pessoa, e não o nosso', () => {
  /*
    Este é o defeito que só apareceu dirigindo no navegador. O analisador chama
    `ast.parse` dentro de um script nosso, então o traceback que o Python monta
    fala das linhas DESSE script: a tela dizia "line 73" num programa de duas
    linhas. Errar a linha é pior do que não dizer nada — manda procurar onde
    não há o que achar, e o requisito 6 é justamente ler essa mensagem.
  */
  it('devolve a linha do programa, e não a do analisador', () => {
    const r = rodarAnalise('x = 1\nfor i in range(3)\n    print(i)');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro.linha).toBe(2);
    expect(r.erro.msg).toContain(':');
    expect(r.erro.trecho.trim()).toBe('for i in range(3)');
  });

  it('escreve a mensagem como o Python escreveria', () => {
    const r = rodarAnalise('for i in range(3)\n    print(i)');
    if (r.ok) throw new Error('deveria ter falhado');
    const texto = erroDeSintaxeEmTexto(r.erro);
    expect(texto).toContain('File "programa.py", line 1');
    expect(texto).toContain('for i in range(3)');
    expect(texto).toContain('^');
    expect(texto).toContain('SyntaxError:');
    /* Nada do analisador aparece. */
    expect(texto).not.toContain('analisar');
    expect(texto).not.toContain('ast.parse');
  });

  it('o analisador em si compila — ele mesmo é código Python', () => {
    /* Um `\\n` escrito dentro do template literal do TypeScript vira quebra de
       linha antes de chegar ao Python, e quebra dentro de aspas simples é erro
       de sintaxe aqui dentro. Já aconteceu. */
    expect(() => rodarAnalise('x = 1')).not.toThrow();
  });
});

describe('input() atribuído é uma variável de texto', () => {
  /* O passo a passo diz isso a quem trava, e o analisador não contava —
     as duas metades da plataforma discordavam sobre a mesma regra. */
  it('conta como tipoTexto', () => {
    expect(analisar('nome = input("Nome: ")').tipoTexto).toBe(true);
  });

  it('mas int(input()) continua sendo inteiro, e não texto', () => {
    const a = analisar('idade = int(input("Idade: "))');
    expect(a.tipoInteiro).toBe(true);
    expect(a.tipoTexto).toBe(false);
  });
});
