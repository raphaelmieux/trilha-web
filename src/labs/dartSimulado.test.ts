import { describe, it, expect } from 'vitest';
import { executarProgramaDart, linhasDeErro } from './dartSimulado';
import { cabecaDaExcecao, dartDisponivel, rodarNoDart } from './dartDeVerdade';

/*
  O simulador de Dart, conferido duas vezes.

  Cada caso diz o que o `dart` de verdade escreve: a saída inteira, ou a
  primeira linha do erro de compilação, ou o cabeçalho da exceção. O
  simulador tem de escrever o mesmo — e, no CI, o Dart oficial também, rodando
  o mesmo programa. Se os três discordam, a lição ensina a reconhecer uma
  mensagem que o computador do clube não vai mostrar.

  Os casos são os enganos que as lições mostram e os comportamentos que se
  erram escrevendo de cabeça: o `.0` do double, o `%` que nunca dá negativo,
  o iterável entre parênteses, o mapa sem aspas, o arredondamento que se
  afasta do zero.
*/

interface Caso {
  nome: string;
  fonte: string;
  entrada?: string[];
  /** A saída inteira, quando o programa roda até o fim. */
  saida?: string;
  /** A primeira linha do erro de compilação. */
  erro?: string;
  /** As duas primeiras linhas da exceção não tratada. */
  excecao?: string;
}

const main = (corpo: string) => `void main() {\n${corpo}\n}\n`;

const CASOS: Caso[] = [
  /* ── O que sai no terminal ── */
  { nome: 'double sempre com casa', fonte: main('  print(4 / 2);\n  print(7 / 2);\n  print(7 ~/ 2);\n  double d = 10;\n  print(d);'), saida: '2.0\n3.5\n3\n10.0\n' },
  { nome: 'resto nunca negativo', fonte: main('  print(-7 % 3);\n  print(7 % -3);\n  print(-7.5 % 2);'), saida: '2\n1\n0.5\n' },
  { nome: 'arredondamento', fonte: main('  print(2.5.round());\n  print((-2.5).round());\n  print(2.4.toInt());\n  print(3.7.floor());\n  print(3.2.ceil());'), saida: '3\n-3\n2\n3\n4\n' },
  { nome: 'casas fixas', fonte: main('  print(25 / 6);\n  print((25 / 6).toStringAsFixed(1));\n  print(10.toStringAsFixed(2));\n  print(0.1 + 0.2);'), saida: '4.166666666666667\n4.2\n10.00\n0.30000000000000004\n' },
  { nome: 'coleções', fonte: main("  var l = ['Ana', 'Bia'];\n  var m = {'Ana': 12, 'Bia': 11};\n  var s = {1, 2, 2, 3};\n  print(l);\n  print(m);\n  print(s);\n  print(l.map((x) => x.length));\n  print(m['Caio']);\n  print([]);\n  print(<String, int>{});"), saida: '[Ana, Bia]\n{Ana: 12, Bia: 11}\n{1, 2, 3}\n(3, 3)\nnull\n[]\n{}\n' },
  { nome: 'texto', fonte: main("  var s = 'Águia';\n  print(s.length);\n  print(s.toUpperCase());\n  print(s.substring(1, 3));\n  print('a,b,c'.split(','));\n  print('7'.padLeft(3, '0'));\n  print(s.contains('gu'));\n  print('ab' * 3);"), saida: '5\nÁGUIA\ngu\n[a, b, c]\n007\ntrue\nababab\n' },
  { nome: 'runtimeType', fonte: main("  print(12.runtimeType);\n  print(1.5.runtimeType);\n  print('a'.runtimeType);\n  print(true.runtimeType);\n  print([1, 2].runtimeType);"), saida: 'int\ndouble\nString\nbool\nList<int>\n' },
  { nome: 'classe sem toString', fonte: `class Ficha {}\n${main('  print(Ficha());')}`, saida: "Instance of 'Ficha'\n" },
  { nome: 'enum', fonte: `enum Classe { amigo, companheiro }\n${main('  print(Classe.amigo);\n  print(Classe.companheiro.name);\n  print(Classe.companheiro.index);\n  print(Classe.values);')}`, saida: 'Classe.amigo\ncompanheiro\n1\n[Classe.amigo, Classe.companheiro]\n' },
  { nome: 'ordenar e somar', fonte: main('  var l = [3, 1, 2];\n  l.sort();\n  print(l);\n  print(l.reduce((a, b) => a + b));\n  print(l.fold(10, (a, b) => a + b));\n  print(l.where((n) => n > 1).toList());\n  print(l.reversed);'), saida: '[1, 2, 3]\n6\n16\n[2, 3]\n(3, 2, 1)\n' },
  { nome: 'laço do for com função guardada', fonte: main('  var fs = <int Function()>[];\n  for (var i = 0; i < 3; i++) {\n    fs.add(() => i);\n  }\n  print(fs.map((f) => f()).toList());'), saida: '[0, 1, 2]\n' },
  { nome: 'leitura até acabar', fonte: `import 'dart:io';\n\n${main("  var total = 0;\n  while (true) {\n    String? linha = stdin.readLineSync();\n    if (linha == null) break;\n    total += int.parse(linha);\n  }\n  print('Total: $total');")}`, entrada: ['12', '30', '8'], saida: 'Total: 50\n' },
  { nome: 'stdout.write sem quebra', fonte: `import 'dart:io';\n\n${main("  stdout.write('a');\n  stdout.write('b');\n  stdout.writeln('c');")}`, saida: 'abc\n' },
  { nome: 'try e catch', fonte: main("  try {\n    throw FormatException('valor ruim');\n  } on FormatException catch (e) {\n    print(e.message);\n  } finally {\n    print('fim');\n  }\n  try {\n    throw Exception('x');\n  } catch (e) {\n    print(e);\n  }"), saida: 'valor ruim\nfim\nException: x\n' },

  /* ── O que o compilador recusa ── */
  { nome: 'texto num int', fonte: main("  int vagas = 'trinta';"), erro: "clube.dart:2:15: Error: A value of type 'String' can't be assigned to a variable of type 'int'." },
  { nome: 'nulo num tipo sem ?', fonte: main('  String apelido = null;'), erro: "clube.dart:2:20: Error: The value 'null' can't be assigned to a variable of type 'String' because 'String' is not nullable." },
  { nome: 'anulável num tipo sem ?', fonte: main("  String? apelido;\n  String nome = apelido;\n  print(nome);"), erro: "clube.dart:3:17: Error: A value of type 'String?' can't be assigned to a variable of type 'String' because 'String?' is nullable and 'String' isn't." },
  { nome: 'propriedade de anulável', fonte: `String? apelidoDe(String nome) => nome == 'Ana' ? 'Aninha' : null;\n\n${main("  var a = apelidoDe('Bia');\n  print(a.length);")}`, erro: "clube.dart:5:11: Error: Property 'length' cannot be accessed on 'String?' because it is potentially null." },
  { nome: 'método de anulável', fonte: `String? apelidoDe(String nome) => nome == 'Ana' ? 'Aninha' : null;\n\n${main("  var a = apelidoDe('Bia');\n  print(a.toUpperCase());")}`, erro: "clube.dart:5:11: Error: Method 'toUpperCase' cannot be called on 'String?' because it is potentially null." },
  { nome: 'conta com a leitura do mapa', fonte: main("  Map<String, int> idades = {'Ana': 12};\n  int a = idades['Ana'] + 1;\n  print(a);"), erro: "clube.dart:3:25: Error: Operator '+' cannot be called on 'int?' because it is potentially null." },
  { nome: 'ponto e vírgula esquecido', fonte: main("  print('a')"), erro: "clube.dart:2:12: Error: Expected ';' after this." },
  { nome: 'final reatribuído', fonte: main("  final unidade = 'Águia';\n  unidade = 'Falcão';\n  print(unidade);"), erro: "clube.dart:3:3: Error: Can't assign to the final variable 'unidade'." },
  { nome: 'nome que não existe', fonte: main('  print(total);'), erro: "clube.dart:2:9: Error: Undefined name 'total'." },
  { nome: 'método que a classe não tem', fonte: `class Unidade {\n  String nome;\n  Unidade(this.nome);\n}\n\n${main("  var u = Unidade('Águia');\n  u.somar(10);")}`, erro: "clube.dart:8:5: Error: The method 'somar' isn't defined for the class 'Unidade'." },
  { nome: 'campo que a classe não tem', fonte: `class Unidade {\n  String nome;\n  Unidade(this.nome);\n}\n\n${main("  var u = Unidade('Águia');\n  print(u.pontos);")}`, erro: "clube.dart:8:11: Error: The getter 'pontos' isn't defined for the class 'Unidade'." },
  { nome: 'filha sem chamar a mãe', fonte: `class Membro {\n  final String nome;\n  Membro(this.nome);\n}\n\nclass Diretor extends Membro {\n  Diretor();\n}\n\n${main("  print(Diretor());")}`, erro: "clube.dart:7:3: Error: The superclass, 'Membro', has no unnamed constructor that takes no arguments." },
  { nome: 'campo sem valor e sem construtor', fonte: `class Unidade {\n  String nome;\n}\n\n${main('  print(Unidade());')}`, erro: "clube.dart:2:10: Error: Field 'nome' should be initialized because its type 'String' doesn't allow null." },
  { nome: 'nomeado obrigatório esquecido', fonte: `String etiqueta({required String nome}) => nome;\n\n${main('  print(etiqueta());')}`, erro: "clube.dart:4:17: Error: Required named parameter 'nome' must be provided." },
  { nome: 'argumento a menos', fonte: `int dobro(int x) => x * 2;\n\n${main('  print(dobro());')}`, erro: 'clube.dart:4:14: Error: Too few positional arguments: 1 required, 0 given.' },
  { nome: 'argumento do tipo errado', fonte: `int dobro(int x) => x * 2;\n\n${main("  print(dobro('3'));")}`, erro: "clube.dart:4:15: Error: The argument type 'String' can't be assigned to the parameter type 'int'." },
  { nome: 'classe abstrata instanciada', fonte: `abstract class Membro {}\n\n${main('  print(Membro());')}`, erro: "clube.dart:4:9: Error: The class 'Membro' is abstract and can't be instantiated." },
  { nome: 'filha sem o método abstrato', fonte: `abstract class Membro {\n  String funcao();\n}\n\nclass Diretor extends Membro {}\n\n${main('  print(Diretor());')}`, erro: "clube.dart:5:7: Error: The non-abstract class 'Diretor' is missing implementations for these members:" },
  { nome: 'mapa no for-in', fonte: main("  var pontos = {'Águia': 80};\n  for (final p in pontos) {\n    print(p);\n  }"), erro: "clube.dart:3:19: Error: The type 'Map<String, int>' used in the 'for' loop must implement 'Iterable<dynamic>'." },
  { nome: 'devolver anulável', fonte: `String nomeDe(String? n) {\n  return n;\n}\n\n${main("  print(nomeDe('Ana'));")}`, erro: "clube.dart:2:10: Error: A value of type 'String?' can't be returned from a function with return type 'String' because 'String?' is nullable and 'String' isn't." },
  { nome: 'função sem return', fonte: `int dobro(int x) {\n  x * 2;\n}\n\n${main('  print(dobro(2));')}`, erro: "clube.dart:1:5: Error: A non-null value must be returned since the return type 'int' doesn't allow null." },
  { nome: 'nomeado sem padrão', fonte: `String etiqueta({String unidade}) => unidade;\n\n${main('  print(etiqueta());')}`, erro: "clube.dart:1:25: Error: The parameter 'unidade' can't have a value of 'null' because of its type 'String', but the implicit default value is 'null'." },
  { nome: 'sqrt sem import', fonte: main('  print(sqrt(81));'), erro: "clube.dart:2:9: Error: Method not found: 'sqrt'." },
  { nome: 'campo público não promove', fonte: `class Ficha {\n  String? apelido;\n}\n\n${main("  var f = Ficha();\n  if (f.apelido != null) {\n    print(f.apelido.length);\n  }")}`, erro: "clube.dart:8:21: Error: Property 'length' cannot be accessed on 'String?' because it is potentially null." },
  { nome: 'local usada antes de ter valor', fonte: main("  String nome;\n  print(nome);"), erro: "clube.dart:3:9: Error: Non-nullable variable 'nome' must be assigned before it can be used." },
  { nome: 'texto mais número', fonte: main("  print('Vagas: ' + 30);"), erro: "clube.dart:2:21: Error: The argument type 'int' can't be assigned to the parameter type 'String'." },

  /* ── O que para no meio ── */
  { nome: 'o ! no nulo', fonte: main("  String? s;\n  print(s!.length);"), excecao: 'Unhandled exception:\nNull check operator used on a null value' },
  { nome: 'posição que não existe', fonte: main('  var l = [1, 2, 3];\n  print(l[5]);'), excecao: 'Unhandled exception:\nRangeError (index): Invalid value: Not in inclusive range 0..2: 5' },
  { nome: 'exceção lançada', fonte: main("  throw Exception('sem vagas');"), excecao: 'Unhandled exception:\nException: sem vagas' },
  { nome: 'first numa lista vazia', fonte: main('  var l = <int>[];\n  print(l.first);'), excecao: 'Unhandled exception:\nBad state: No element' },
  { nome: 'int.parse de texto', fonte: main("  print(int.parse('doze'));"), excecao: 'Unhandled exception:\nFormatException: Invalid radix-10 number (at character 1)' },
];

function noSimulador(c: Caso) {
  return executarProgramaDart({ 'clube.dart': c.fonte }, 'clube.dart', c.entrada ?? []);
}

describe('o simulador de Dart', () => {
  it.each(CASOS.map(c => [c.nome, c] as const))('%s', (_, c) => {
    const r = noSimulador(c);
    if (c.saida !== undefined) {
      expect(r.erro).toBeNull();
      expect(r.saida).toBe(c.saida);
    } else if (c.erro !== undefined) {
      expect(r.saida).toBe('');
      expect(linhasDeErro(r.erro)[0]).toBe(c.erro);
    } else {
      expect(cabecaDaExcecao(r.erro ?? '')).toBe(c.excecao);
    }
  });

  it('com erro de compilação, nenhuma linha roda — nem as de antes do erro', () => {
    const r = executarProgramaDart({ 'clube.dart': main("  print('antes');\n  int x = 'a';") }, 'clube.dart');
    expect(r.saida).toBe('');
    expect(r.problemas).toHaveLength(1);
  });

  it('o erro mostra a linha do código e a seta embaixo do que está errado', () => {
    const r = executarProgramaDart({ 'clube.dart': main("  int vagas = 'trinta';") }, 'clube.dart');
    expect(r.erro).toBe([
      "clube.dart:2:15: Error: A value of type 'String' can't be assigned to a variable of type 'int'.",
      "  int vagas = 'trinta';",
      '              ^^^^^^^^',
    ].join('\n'));
  });

  it('o laço sem fim para, e não trava a página', () => {
    const r = executarProgramaDart({ 'clube.dart': main('  var i = 0;\n  while (true) {\n    i++;\n  }') }, 'clube.dart');
    expect(r.semFim).toBe(true);
  });

  it('a recursão sem fim vira Stack Overflow', () => {
    const r = executarProgramaDart({ 'clube.dart': `int f(int n) => f(n + 1);\n${main('  print(f(1));')}` }, 'clube.dart');
    expect(cabecaDaExcecao(r.erro ?? '')).toBe('Unhandled exception:\nStack Overflow');
  });

  it('o que o simulador não tem, ele diz que não tem — e não chama de erro do programa', () => {
    const r = executarProgramaDart({ 'clube.dart': `import 'dart:async';\n${main("  print('a');")}` }, 'clube.dart');
    expect(r.erro).toContain('Fora do simulador');
    expect(linhasDeErro(r.erro)).toEqual([]);
  });

  it('importa outro arquivo da pasta, e reclama do que não existe', () => {
    const ok = executarProgramaDart({
      'clube.dart': `import 'unidade.dart';\n${main("  print(Unidade('Águia').nome);")}`,
      'unidade.dart': 'class Unidade {\n  final String nome;\n  Unidade(this.nome);\n}\n',
    }, 'clube.dart');
    expect(ok.saida).toBe('Águia\n');
    const falta = executarProgramaDart({ 'clube.dart': `import 'unidade.dart';\n${main("  print('a');")}` }, 'clube.dart');
    expect(linhasDeErro(falta.erro)[0]).toBe("clube.dart:1:8: Error: Error when reading 'unidade.dart': No such file or directory");
  });
});

/*
  No CI o Dart oficial está instalado, e cada caso roda nele também. As
  diferenças saem numa anotação só, com todas juntas — o log de um job longo
  nem sempre se lê de onde se está, e a anotação a API de Checks devolve.
*/
describe('o Dart de verdade concorda com o simulador', () => {
  it('em todos os casos', () => {
    if (!dartDisponivel()) return;
    const diferencas: string[] = [];
    for (const c of CASOS) {
      const r = rodarNoDart({ 'clube.dart': c.fonte }, 'clube.dart', c.entrada ?? []);
      const obtido = c.saida !== undefined ? r.saida
        : c.erro !== undefined ? (linhasDeErro(r.erro)[0] ?? r.erro.split('\n')[0])
          : cabecaDaExcecao(r.erro);
      const esperado = c.saida ?? c.erro ?? c.excecao;
      if (obtido !== esperado) diferencas.push(`${c.nome}: esperado ${JSON.stringify(esperado)}, o dart deu ${JSON.stringify(obtido)}`);
    }
    if (diferencas.length) console.log(`::error title=Simulador de Dart::${diferencas.join('%0A')}`);
    expect(diferencas).toEqual([]);
  }, 600000);
});
