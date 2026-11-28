import { describe, it, expect } from 'vitest';
import { lerPrograma } from './dartSimulado';
import { analisarProgramaDart } from './dartAnalise';

/*
  O que a análise acha num programa de Dart — e, de propósito, os casos que
  quase passam. Pedir uso, e não a palavra: a classe que ninguém instancia,
  o ? declarado e nunca tratado, o "sem !" num programa sem nulo nenhum.
*/

const achados = (fonte: string, extras: Record<string, string> = {}) => {
  const lido = lerPrograma({ 'clube.dart': fonte, ...extras }, 'clube.dart');
  expect(lido.problemas).toEqual([]);
  return analisarProgramaDart(lido.arvores);
};

describe('a análise de Dart', () => {
  it('tipo escrito e inferido contam duas declarações de cada', () => {
    expect(achados("void main() { int a = 1; String b = 'x'; var c = 2; final d = 3; }").tipoExplicito).toBe(true);
    const um = achados("void main() { int a = 1; var c = 2; }");
    expect(um.tipoExplicito).toBe(false);
    expect(um.tipoInferido).toBe(false);
  });

  it('"sem !" num programa sem nulo nenhum não vale', () => {
    const r = achados("void main() { print('a'); }");
    expect(r.semExclamacao).toBe(false);
    expect(achados("void main() { String? a; print(a ?? 'b'); }").semExclamacao).toBe(true);
    expect(achados("void main() { String? a; print(a ?? 'b'); print(a!); }").semExclamacao).toBe(false);
  });

  it('classe que ninguém instancia não demonstra nada', () => {
    const fonte = 'class D {\n  String n;\n  D(this.n);\n  void falar() { print(n); }\n}\n';
    expect(achados(`${fonte}void main() {}`).classeCompleta).toBe(false);
    expect(achados(`${fonte}void main() { D('a').falar(); }`).classeCompleta).toBe(true);
  });

  it('a classe só com toString não tem método', () => {
    const fonte = "class D {\n  String n;\n  D(this.n);\n  @override\n  String toString() => n;\n}\nvoid main() { print(D('a')); }";
    expect(achados(fonte).classeCompleta).toBe(false);
  });

  it('herança pede a filha instanciada, e o @override pede um método da mãe', () => {
    const base = "class M {\n  final String n;\n  M(this.n);\n  String f() => n;\n}\nclass F extends M {\n  F(super.n);\n  @override\n  String f() => 'x';\n}\n";
    const r = achados(`${base}void main() { print(F('a').f()); }`);
    expect(r.heranca && r.sobrescreve && r.chamaMae).toBe(true);
    expect(achados(`${base}void main() {}`).heranca).toBe(false);
    const semMetodoDaMae = "class M {\n  M();\n}\nclass F extends M {\n  @override\n  String g() => 'x';\n}\nvoid main() { print(F().g()); }";
    expect(achados(semMetodoDaMae).sobrescreve).toBe(false);
  });

  it('duas classes soltas não se relacionam; uma guardando a outra, sim', () => {
    const soltas = "class A {}\nclass B {}\nvoid main() { print(A()); print(B()); }";
    expect(achados(soltas).duasClassesRelacionadas).toBe(false);
    const juntas = "class E {}\nclass D {\n  final List<E> es = [];\n}\nvoid main() { print(D()); }";
    expect(achados(juntas).duasClassesRelacionadas).toBe(true);
  });

  it('importar o arquivo e não usar nada dele não conta', () => {
    const unidade = { 'unidade.dart': 'class Unidade {}\n' };
    expect(achados("import 'unidade.dart';\nvoid main() {}", unidade).importaArquivo).toBe(false);
    expect(achados("import 'unidade.dart';\nvoid main() { print(Unidade()); }", unidade).importaArquivo).toBe(true);
  });

  it('a biblioteca importada precisa ser usada', () => {
    expect(achados("import 'dart:math';\nvoid main() {}").usaBiblioteca).toBe(false);
    expect(achados("import 'dart:math';\nvoid main() { print(max(1, 2)); }").usaBiblioteca).toBe(true);
    expect(achados("import 'dart:math';\nvoid main() { print([1, 2].reduce(max)); }").usaBiblioteca).toBe(true);
  });
});
