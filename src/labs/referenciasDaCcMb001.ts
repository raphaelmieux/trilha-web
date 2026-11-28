/**
 * As soluções de referência dos laboratórios da CC-MB001.
 *
 * Moram fora do currículo — gabarito no currículo fica a um import de
 * distância da tela — e fora dos testes, porque duas travas as usam: a que
 * roda o motor (`laboratoriosDeDart.test.ts`, que no CI as roda também no
 * Dart de verdade) e a que clica (`LaboratorioDeDart.test.tsx`). Escritas
 * duas vezes, as duas divergiriam no primeiro ajuste.
 */
export const SOLUCOES_DE_DART: Record<string, Record<string, string>> = {
  'm1-lab': {
    'clube.dart': `void main() {
  print('Acampamento de Inverno');
  int vagas = 30;
  double diaria = 45.5;
  print('Vagas: $vagas');
  print('Diária: $diaria reais');
}
`,
  },
  'm2-lab': {
    'clube.dart': `void main() {
  String nome = 'Davi Souza';
  int idade = 13;
  final unidade = 'Falcão';
  double mensalidade = 12.5;
  var emDia = true;
  print('Nome: $nome');
  print('Idade: $idade anos');
  print('Unidade: $unidade');
  print('Mensalidade: $mensalidade reais');
  print('Três meses: \${mensalidade * 3} reais');
  print('Em dia: $emDia');
}
`,
  },
  'm3-lab': {
    'clube.dart': `import 'dart:io';

String saudacao(String apelido) {
  return 'Olá, \${apelido.toUpperCase()}!';
}

void main() {
  for (var i = 0; i < 3; i++) {
    String? lido = stdin.readLineSync();
    print(saudacao(lido ?? 'visitante'));
  }
}
`,
  },
  'm4-lab': {
    'clube.dart': `int pontosDeHoje(Map<String, int> pontos, String nome) {
  return (pontos[nome] ?? 0) + 1;
}

void main() {
  List<String> marcados = ['Ana', 'Bia', 'Caio', 'Davi', 'Bia'];
  Map<String, int> pontos = {'Ana': 4, 'Bia': 6, 'Caio': 2, 'Davi': 5};
  var presentes = marcados.toSet();
  print('Presentes: \${presentes.length}');
  for (final nome in presentes) {
    print('$nome: \${pontosDeHoje(pontos, nome)} pontos');
  }
}
`,
  },
  'm5-lab': {
    'clube.dart': `class Desbravador {
  String nome;
  int idade;
  String unidade;

  Desbravador(this.nome, this.idade, this.unidade);

  String apresentar() => 'Sou $nome, tenho $idade anos e sou da unidade $unidade.';

  void aniversario() {
    idade++;
  }
}

void main() {
  var ana = Desbravador('Ana', 12, 'Águia');
  var caio = Desbravador('Caio', 13, 'Falcão');
  print(ana.apresentar());
  print(caio.apresentar());
  ana.aniversario();
  print('A \${ana.nome} fez aniversário: agora tem \${ana.idade} anos.');
}
`,
  },
  'm6-lab': {
    'clube.dart': `class Membro {
  final String nome;

  Membro(this.nome);

  String apresentar() => 'Sou $nome';
}

class Desbravadora extends Membro {
  final String unidade;

  Desbravadora(super.nome, this.unidade);

  @override
  String apresentar() => '\${super.apresentar()}, desbravadora da unidade $unidade.';
}

class Conselheiro extends Membro {
  final String unidade;

  Conselheiro(String nome, this.unidade) : super(nome);

  @override
  String apresentar() => '\${super.apresentar()}, conselheiro da unidade $unidade.';
}

void main() {
  List<Membro> clube = [Desbravadora('Ana', 'Águia'), Conselheiro('Tio Márcio', 'Falcão')];
  for (final m in clube) {
    print(m.apresentar());
  }
}
`,
  },
  'm7-lab': {
    'clube.dart': `import 'dart:math';
import 'unidade.dart';

void main() {
  var aguia = Unidade('Águia', [12, 14, 11, 13]);
  print('Unidade \${aguia.nome}');
  print('Mais velho: \${aguia.idades.reduce(max)} anos');
  print('Média: \${aguia.media()} anos');
}
`,
    'unidade.dart': `class Unidade {
  final String nome;
  final List<int> idades;

  Unidade(this.nome, this.idades);

  double media() => idades.reduce((a, b) => a + b) / idades.length;
}
`,
  },
  'm8-lab': {
    'clube.dart': `import 'dart:io';

class Especialidade {
  final String nome;
  Especialidade(this.nome);
}

class Desbravador {
  final String nome;
  final List<Especialidade> especialidades = [];

  Desbravador(this.nome);

  void conquistar(Especialidade e) => especialidades.add(e);

  String resumo() {
    var n = especialidades.length;
    return '$nome: $n \${n == 1 ? 'especialidade' : 'especialidades'}';
  }
}

void main() {
  var clube = <String, Desbravador>{};
  var total = 0;
  while (true) {
    String? linha = stdin.readLineSync();
    if (linha == null) break;
    var partes = linha.split(';');
    var d = clube.putIfAbsent(partes[0], () => Desbravador(partes[0]));
    d.conquistar(Especialidade(partes[1]));
    total++;
  }
  for (final d in clube.values) {
    print(d.resumo());
  }
  print('Total: $total conquistas');
}
`,
  },
};

