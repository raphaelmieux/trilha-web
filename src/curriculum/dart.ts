/*
 * A vereda CC-MB001 Dart.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC004. Quem chega aqui já escreve Python com funções, classes e
 * arquivos, e — se seguiu a recomendação do documento — já viu tipos na
 * CC-FE005. A vereda não ensina laço nem função de novo: ensina o que o Dart
 * tem de diferente, e o que a vereda seguinte, de Flutter, vai pedir dele
 * em toda tela — classe, herança e o nulo tratado antes de rodar.
 *
 * ── O compilador na frente ───────────────────────────────────────────────
 * É a primeira linguagem compilada das veredas, e o requisito 2.1 manda
 * definir compilação. Por isso o laboratório mostra o que a CC004 nunca
 * mostrou: com um erro de tipo na linha 9, as linhas 1 a 8 também não
 * rodam. O primeiro laboratório começa justamente com um programa que não
 * compila.
 *
 * ── O motor ──────────────────────────────────────────────────────────────
 * Não existe compilador de Dart que rode no navegador — o DartPad compila
 * num servidor. O laboratório roda num simulador escrito para a plataforma
 * (`dartSimulado.ts`), com as mensagens de erro do `dart run` de verdade, e
 * o CI confere cada exemplo e cada solução de referência contra o Dart
 * oficial. Ele cobre o pedaço da linguagem que a vereda ensina; o que fica
 * de fora ele recusa dizendo que é limite do simulador, e não erro do
 * programa.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * A do documento, com as definições espalhadas no módulo em que fazem
 * sentido: compilação e as diferenças com JavaScript e Python abrem (2.1 e
 * 3); variáveis (4.1); nulo seguro (2.2 e 4.5); funções e coleções (4.4);
 * classe e objeto (2.3 e 4.2); herança (2.4 e 4.3); pacotes (2.5); e o
 * programa de linha de comando, com a orientação a objetos explicada (5 e
 * 6).
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_DART } from './questoesDeDart';

const CAPITULOS: { id: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'primeiro',
    topicos: [
      {
        id: 'o-que-e-dart',
        titulo: 'O que é o Dart',
        resumo: 'A linguagem do Flutter, com cara de JavaScript e tipos de verdade.',
        explicacao: [
          'O **Dart** é a linguagem criada pelo Google para escrever aplicativos. É nela que se escreve em **Flutter**, que monta o mesmo aplicativo para Android e para iPhone — o assunto da próxima vereda.',
          'Todo programa em Dart começa pela função `main`. O terminal roda o arquivo com `dart run clube.dart`, e o que o `print` recebe aparece na tela, uma linha por chamada.',
          'Quem leu JavaScript vai reconhecer a forma: chaves em volta dos blocos, ponto e vírgula no fim de cada instrução, `//` para comentário. O que muda está por dentro, e é o resto desta vereda.',
        ],
        exemplo: `void main() {
  print('Boa noite, desbravador!');
  print('Unidades: 6');
  print(2 + 3);
}`,
        exemploComo: 'dart',
        exemploSaida: `Boa noite, desbravador!
Unidades: 6
5`,
        marcas: ['dart', 'main', 'print', 'dart run'],
      },
      {
        id: 'compilacao',
        titulo: 'Compilação',
        resumo: 'O programa inteiro é conferido e traduzido antes de a primeira linha rodar.',
        explicacao: [
          '**Compilação** é traduzir o programa inteiro para a linguagem da máquina **antes** de executá-lo. No caminho, o compilador confere o programa — e, se achar um erro, não traduz nada.',
          'É a diferença que se vê no terminal. No Python, um erro na linha 3 deixava as linhas 1 e 2 rodarem antes de parar. No Dart, um erro de tipo na linha 3 impede o programa **todo**: nenhum `print` acontece, nem os de antes do erro.',
          'O ganho é descobrir o engano na sua mesa, e não na mão de quem usa o aplicativo. A mensagem diz o arquivo, a linha e a coluna — `clube.dart:3:15` —, e embaixo mostra o código com uma seta no ponto exato.',
        ],
        exemplo: `void main() {
  print('Bom dia, clube!');
  int vagas = 'trinta';
  print(vagas);
}`,
        exemploComo: 'dart',
        exemploSaida: `clube.dart:3:15: Error: A value of type 'String' can't be assigned to a variable of type 'int'.
  int vagas = 'trinta';
              ^^^^^^^^`,
        atencao: 'Repare que "Bom dia, clube!" não apareceu, mesmo estando antes do erro. Com o compilador na frente, ou o programa todo está certo, ou nada roda.',
        marcas: ['compilação', 'compilador', 'erro de compilação'],
      },
      {
        id: 'diferencas',
        titulo: 'Dart, JavaScript e Python',
        resumo: 'Duas diferenças com cada um, e as duas que mais pesam são de tipo.',
        explicacao: [
          'Com o **JavaScript**: o Dart tem **tipos conferidos antes de rodar** — a variável `int` só aceita número inteiro, e o compilador recusa o resto —, enquanto o JavaScript deixa `"5" + 3` virar `"53"` sem reclamar. E o Dart separa **`int` e `double`**, onde o JavaScript tem um tipo só para todos os números.',
          'Com o **Python**: o Dart marca o bloco com **chaves e ponto e vírgula**, e não com o recuo — o recuo ajuda quem lê, mas não muda o que roda. E o Dart é **compilado**: o Python descobre o erro de tipo quando chega na linha, o Dart antes de começar.',
          'A divisão mostra as duas coisas de uma vez: `7 / 2` dá `3.5`, um `double`, e `7 ~/ 2` dá `3`, um `int`. No Python a segunda era `//`.',
        ],
        exemplo: `void main() {
  var media = 7 / 2;
  var inteiro = 7 ~/ 2;
  print(media);
  print(inteiro);
  print(4 / 2);
}`,
        exemploComo: 'dart',
        exemploSaida: `3.5
3
2.0`,
        marcas: ['javascript', 'python', 'tipagem estática', 'int', 'double'],
      },
    ],
  },
  {
    id: 'variaveis',
    topicos: [
      {
        id: 'escrito-e-inferido',
        titulo: 'Tipo escrito e tipo inferido',
        resumo: 'Com o tipo na frente, ou com var, que descobre o tipo pelo valor.',
        explicacao: [
          'Uma variável pode ser declarada com o **tipo escrito**: `int idade = 12;`. Ou com **`var`**, e aí o compilador **infere** o tipo pelo valor inicial: `var nome = \'Ana\';` cria uma variável do tipo `String`.',
          'Inferido não quer dizer solto. Depois de `var nome = \'Ana\';`, a variável é `String` para sempre, e `nome = 12;` é recusado — é o oposto do JavaScript, onde `let` aceita qualquer coisa depois.',
          'Quando usar cada um: o tipo escrito diz a quem lê o que se espera ali, e serve onde o valor inicial não deixa isso claro; o `var` evita repetir o óbvio. O `runtimeType` mostra o tipo que ficou.',
        ],
        exemplo: `void main() {
  int idade = 12;
  var nome = 'Ana';
  var altura = 1.52;
  print(idade.runtimeType);
  print(nome.runtimeType);
  print(altura.runtimeType);
}`,
        exemploComo: 'dart',
        exemploSaida: `int
String
double`,
        marcas: ['var', 'tipo explícito', 'inferência', 'runtimeType'],
      },
      {
        id: 'var-final-const',
        titulo: 'var, final e const',
        resumo: 'O que muda, o que se escreve uma vez, e o que já se sabe antes de rodar.',
        explicacao: [
          '`var` é para o que muda: um contador, um total. `final` é para o que recebe valor **uma vez** e não muda mais — o nome de quem se inscreveu. Tentar dar outro valor a um `final` é recusado com "Can\'t assign to the final variable".',
          '`const` é mais rígido: o valor precisa ser conhecido **antes de rodar**, escrito no próprio código, como `const vagas = 30;`. Um valor que só aparece rodando — a linha que alguém digitou — pode ser `final`, mas não `const`.',
          'A regra prática: comece com `final`, e troque por `var` só se precisar mudar. É o mesmo conselho do `const` no JavaScript, pelo mesmo motivo: o valor que não muda é um a menos para vigiar.',
        ],
        exemplo: `void main() {
  final unidade = 'Águia';
  const meta = 100;
  var pontos = 60;
  pontos = pontos + 25;
  print('$unidade: $pontos de $meta pontos');
}`,
        exemploComo: 'dart',
        exemploSaida: 'Águia: 85 de 100 pontos',
        marcas: ['var', 'final', 'const'],
      },
      {
        id: 'tipos-basicos',
        titulo: 'int, double, String e bool',
        resumo: 'Os quatro tipos do dia a dia, e o texto montado com $.',
        explicacao: [
          '`int` é número inteiro, `double` é número com casas, `String` é texto, `bool` é `true` ou `false`. Um inteiro escrito cabe num `double` — `double preco = 10;` vale 10.0 —, mas o contrário não: `int x = 2.5;` é recusado.',
          'A **interpolação** põe um valor dentro do texto: `\'$nome\'` usa a variável, e `\'${conta}\'` usa o resultado de uma expressão — um campo, uma conta, um método. É o jeito de montar texto no Dart; o `+` entre pedaços funciona, mas só com texto dos dois lados.',
          'Para mostrar um `double` com casas fixas, `toStringAsFixed(1)` devolve o texto já arredondado.',
        ],
        exemplo: `void main() {
  int inscritos = 25;
  int barracas = 6;
  double porBarraca = inscritos / barracas;
  print('Por barraca: \${porBarraca.toStringAsFixed(1)}');
  print('Grupos de 4: \${inscritos ~/ 4}');
  bool lotado = inscritos >= 30;
  print('Lotado? $lotado');
}`,
        exemploComo: 'dart',
        exemploSaida: `Por barraca: 4.2
Grupos de 4: 6
Lotado? false`,
        marcas: ['int', 'double', 'String', 'bool', 'interpolação'],
      },
    ],
  },
  {
    id: 'nulo',
    topicos: [
      {
        id: 'o-nulo',
        titulo: 'O nulo, e o nulo seguro',
        resumo: 'Um tipo sem ? nunca é nulo, e o compilador garante.',
        explicacao: [
          '`null` quer dizer "não há valor aqui": o apelido que ninguém deu, a linha que não foi digitada. Em muita linguagem qualquer variável pode ser nula, e o programa só descobre ao tentar usá-la — é o erro mais comum da história da programação.',
          '**Nulo seguro** é a regra do Dart: um tipo sem `?` **nunca** é nulo. `String nome` sempre tem texto, e o compilador recusa qualquer caminho que ponha `null` ali. Quem pode faltar se declara com `?`: `String? apelido`.',
          'O ganho é que o erro aparece na sua mesa. Em vez de o aplicativo fechar sozinho no telefone de alguém, o compilador aponta a linha antes de rodar — e obriga a decidir o que fazer quando o valor não existe.',
        ],
        exemplo: `void main() {
  String apelido = null;
  print(apelido);
}`,
        exemploComo: 'dart',
        exemploSaida: `clube.dart:2:20: Error: The value 'null' can't be assigned to a variable of type 'String' because 'String' is not nullable.
  String apelido = null;
                   ^^^^`,
        marcas: ['null', 'nulo seguro', 'null safety', 'tipo anulável'],
      },
      {
        id: 'operadores-do-nulo',
        titulo: '?, ??, ?. e o !',
        resumo: 'Declarar, trocar por um padrão, chamar só se houver — e o perigoso.',
        explicacao: [
          '`String?` declara que pode faltar. `apelido ?? \'sem apelido\'` usa o apelido se houver, e o texto da direita se não houver. `apelido?.length` só pergunta o tamanho se houver apelido — senão o resultado é `null`, sem erro.',
          'Atribuir um valor de verdade a uma variável local anulável **promove** a variável: depois de `apelido = \'Tigrão\';`, o compilador sabe que ela tem texto, e `apelido.length` passa.',
          'O `!` diz ao compilador "confie em mim, não é nulo". Ele não trata nada: se for nulo, o programa **para** na hora, com "Null check operator used on a null value". Quase sempre há um jeito melhor — o `??` ou um `if`.',
        ],
        exemplo: `void main() {
  String? apelido;
  print(apelido ?? 'sem apelido');
  print(apelido?.length);
  apelido = 'Tigrão';
  print(apelido.length);
}`,
        exemploComo: 'dart',
        exemploSaida: `sem apelido
null
6`,
        atencao: 'O ! não é um jeito de tratar o nulo: é um jeito de prometer que ele não vai aparecer. Se a promessa falhar, o programa fecha.',
        marcas: ['??', '?.', '!', 'promoção'],
      },
      {
        id: 'promocao',
        titulo: 'Testar antes, e a promoção',
        resumo: 'Dentro do if que testou, a variável deixa de ser anulável.',
        explicacao: [
          'Depois de `if (nome == null) return 0;`, o resto da função só roda quando há nome — e o compilador **sabe disso**. A variável é **promovida** de `String?` para `String`, e `nome.length` passa sem `?` nem `!`.',
          'A promoção vale para variável local e parâmetro. Um **campo público** de uma classe não é promovido: entre o teste e o uso, outro pedaço do programa poderia ter mudado o campo, e o compilador não arrisca. A saída é copiar o campo para uma variável local antes de testar.',
          'Ler o erro ajuda: "Property \'length\' cannot be accessed on \'String?\' because it is potentially null" quer dizer "aqui ainda pode ser nulo". A dica embaixo sugere o `?.`, mas às vezes o certo é um teste antes.',
        ],
        exemplo: `int letras(String? nome) {
  if (nome == null) {
    return 0;
  }
  return nome.length;
}

void main() {
  print(letras('Bia'));
  print(letras(null));
}`,
        exemploComo: 'dart',
        exemploSaida: `3
0`,
        marcas: ['promoção', 'if', 'parâmetro anulável'],
      },
    ],
  },
  {
    id: 'colecoes',
    topicos: [
      {
        id: 'funcoes',
        titulo: 'Funções com tipo',
        resumo: 'O tipo do que volta antes do nome, e os parâmetros com nome.',
        explicacao: [
          'A função diz **o tipo do que devolve** antes do nome — `double media(List<int> notas)` — e `void` quando não devolve nada. Os parâmetros também têm tipo, e o compilador confere cada chamada.',
          'Parâmetros entre chaves são **nomeados**: quem chama escreve o nome, `etiqueta(nome: \'Caio\')`. Com `required`, são obrigatórios; com `= valor`, ganham um padrão. Sem nenhum dos dois, um nomeado de tipo sem `?` é recusado — ele ficaria nulo quando ninguém o passasse.',
          'Função de uma linha só pode usar `=>`: `int dobro(int x) => x * 2;`.',
        ],
        exemplo: `double media(List<int> notas) {
  var soma = 0;
  for (final n in notas) {
    soma += n;
  }
  return soma / notas.length;
}

String etiqueta({required String nome, String unidade = 'sem unidade'}) => '$nome ($unidade)';

void main() {
  print(media([8, 7, 9]));
  print(etiqueta(nome: 'Caio', unidade: 'Pantera'));
  print(etiqueta(nome: 'Lia'));
}`,
        exemploComo: 'dart',
        exemploSaida: `8.0
Caio (Pantera)
Lia (sem unidade)`,
        marcas: ['função', 'parâmetro nomeado', 'required', '=>'],
      },
      {
        id: 'lista-conjunto-mapa',
        titulo: 'List, Set e Map',
        resumo: 'Em ordem, sem repetir, e de chave para valor.',
        explicacao: [
          '**`List`** guarda itens em ordem, entre colchetes, e aceita repetição. **`Set`** guarda sem repetir e sem ordem garantida para quem lê, entre chaves. **`Map`** liga cada **chave** a um **valor**, também entre chaves, com dois-pontos no meio.',
          'O tipo dos itens vai entre `< >`: `List<String>`, `Set<int>`, `Map<String, int>`. É o que impede de pôr um número numa lista de nomes.',
          'Ler uma chave que o mapa não tem devolve `null` — e por isso `idades[\'Ana\']` é do tipo `int?`, e não `int`. É o nulo seguro de novo: o compilador obriga a decidir o que fazer quando a chave não existe.',
        ],
        exemplo: `void main() {
  List<String> marcados = ['Ana', 'Bia', 'Ana', 'Caio'];
  Set<String> presentes = marcados.toSet();
  Map<String, int> idades = {'Ana': 12, 'Bia': 11};
  idades['Caio'] = 13;
  print(marcados.length);
  print(presentes);
  print(idades);
  print(idades['Davi']);
}`,
        exemploComo: 'dart',
        exemploSaida: `4
{Ana, Bia, Caio}
{Ana: 12, Bia: 11, Caio: 13}
null`,
        marcas: ['List', 'Set', 'Map', 'coleção'],
      },
      {
        id: 'percorrer',
        titulo: 'Percorrer uma coleção',
        resumo: 'for-in, e os métodos que recebem uma função.',
        explicacao: [
          '`for (final nome in lista)` passa por cada item, na ordem. Num mapa, percorra `entries`: cada uma tem `key` e `value`.',
          'Os métodos recebem uma função: `where` escolhe os itens que passam no teste, `map` transforma cada um, `forEach` faz alguma coisa com cada um. `where` e `map` devolvem um **iterável**, que se escreve entre parênteses; `toList()` o transforma em lista.',
          'O mapa em si não se percorre com for-in — o compilador recusa, porque ele não é uma sequência. É preciso escolher: as chaves, os valores ou as entradas.',
        ],
        exemplo: `void main() {
  var pontos = {'Águia': 80, 'Falcão': 85, 'Tucano': 65};
  for (final e in pontos.entries) {
    print('\${e.key}: \${e.value}');
  }
  var acima = pontos.entries.where((e) => e.value >= 80).map((e) => e.key);
  print(acima);
  print(acima.toList());
}`,
        exemploComo: 'dart',
        exemploSaida: `Águia: 80
Falcão: 85
Tucano: 65
(Águia, Falcão)
[Águia, Falcão]`,
        marcas: ['for-in', 'where', 'map', 'forEach', 'entries'],
      },
    ],
  },
  {
    id: 'classes',
    topicos: [
      {
        id: 'classe-e-objeto',
        titulo: 'Classe e objeto',
        resumo: 'A classe é o molde; o objeto é cada ficha feita com ele.',
        explicacao: [
          'Uma **classe** descreve um tipo de coisa: que dados ela guarda (os **atributos**, ou campos) e o que ela sabe fazer (os **métodos**). Um **objeto** é uma coisa concreta feita a partir da classe, com os seus próprios valores.',
          'É a ficha de inscrição: a ficha em branco é a classe, com os campos nome e idade; cada ficha preenchida é um objeto. Duas fichas têm os mesmos campos e valores diferentes.',
          'O **construtor** é o que cria o objeto. `Desbravador(this.nome, this.idade);` é a forma curta: cada parâmetro com `this.` vai direto para o campo de mesmo nome.',
        ],
        exemplo: `class Desbravador {
  String nome;
  int idade;

  Desbravador(this.nome, this.idade);

  String classe() => idade <= 10 ? 'Amigo' : 'Companheiro';
}

void main() {
  var ana = Desbravador('Ana', 10);
  var bia = Desbravador('Bia', 11);
  print('\${ana.nome}: \${ana.classe()}');
  print('\${bia.nome}: \${bia.classe()}');
}`,
        exemploComo: 'dart',
        exemploSaida: `Ana: Amigo
Bia: Companheiro`,
        marcas: ['classe', 'objeto', 'atributo', 'método', 'construtor'],
      },
      {
        id: 'construtores',
        titulo: 'Construtores',
        resumo: 'Com nome nos parâmetros, com valor padrão, e mais de um por classe.',
        explicacao: [
          'O construtor aceita parâmetros nomeados, como uma função: `Inscricao({required this.nome, this.pagou = false})`. Quem cria escreve o nome de cada um, e a ordem deixa de importar.',
          'Campo `final` recebe valor uma vez, no construtor, e não muda mais. Se um construtor esquecer de dar valor a um campo `final` ou de tipo sem `?`, o compilador recusa — o objeto nasceria pela metade.',
          'Uma classe pode ter mais de um construtor, cada um com nome: `Inscricao.visitante(this.nome)`. A parte depois dos dois-pontos, a **lista de inicialização**, dá valor aos campos que o construtor não recebe como parâmetro.',
        ],
        exemplo: `class Inscricao {
  final String nome;
  final String unidade;
  final bool pagou;

  Inscricao({required this.nome, required this.unidade, this.pagou = false});

  Inscricao.visitante(this.nome) : unidade = 'visitante', pagou = true;
}

void main() {
  var a = Inscricao(nome: 'Davi', unidade: 'Falcão');
  var b = Inscricao.visitante('Rute');
  print('\${a.nome} \${a.unidade} \${a.pagou}');
  print('\${b.nome} \${b.unidade} \${b.pagou}');
}`,
        exemploComo: 'dart',
        exemploSaida: `Davi Falcão false
Rute visitante true`,
        marcas: ['construtor', 'construtor nomeado', 'final', 'lista de inicialização'],
      },
      {
        id: 'metodos',
        titulo: 'Métodos, getters e toString',
        resumo: 'O que o objeto faz, o que ele calcula, e como ele se escreve.',
        explicacao: [
          'Um método pode mudar os campos do próprio objeto: `somar(60)` aumenta os pontos daquela unidade, e não os das outras.',
          'Um **getter** é um campo calculado: `bool get lider => pontos >= 100;` se lê como campo, `aguia.lider`, sem parênteses, e é recalculado a cada leitura.',
          'O `print` de um objeto escreve "Instance of \'Unidade\'", que não diz nada. Sobrescrever **`toString`** escolhe o texto — e a interpolação usa o mesmo método.',
        ],
        exemplo: `class Unidade {
  final String nome;
  int pontos = 0;

  Unidade(this.nome);

  void somar(int p) {
    pontos += p;
  }

  bool get lider => pontos >= 100;

  @override
  String toString() => 'Unidade $nome ($pontos pontos)';
}

void main() {
  var aguia = Unidade('Águia');
  aguia.somar(60);
  aguia.somar(50);
  print(aguia);
  print(aguia.lider);
}`,
        exemploComo: 'dart',
        exemploSaida: `Unidade Águia (110 pontos)
true`,
        marcas: ['método', 'getter', 'toString'],
      },
    ],
  },
  {
    id: 'heranca',
    topicos: [
      {
        id: 'herdar',
        titulo: 'Herança',
        resumo: 'A classe filha recebe o que a mãe tem, e acrescenta o que é dela.',
        explicacao: [
          '**Herança** é escrever uma classe a partir de outra: `class Conselheiro extends Membro`. A filha já tem os campos e os métodos da mãe, e escreve só o que é dela — o conselheiro é um membro, e além disso tem uma unidade.',
          'O construtor da filha precisa entregar à mãe o que ela pede. O jeito curto é `super.nome` no parâmetro; o jeito longo, `: super(nome)` depois dos parênteses.',
          'Esquecer isso dá um erro que assusta e é simples: "The superclass, \'Membro\', has no unnamed constructor that takes no arguments" — a mãe precisa de um nome, e ninguém o entregou.',
        ],
        exemplo: `class Membro {
  final String nome;
  Membro(this.nome);
  String apresentar() => 'Sou $nome.';
}

class Conselheiro extends Membro {
  final String unidade;
  Conselheiro(super.nome, this.unidade);
}

void main() {
  var tio = Conselheiro('Tio Márcio', 'Falcão');
  print(tio.apresentar());
  print(tio.unidade);
}`,
        exemploComo: 'dart',
        exemploSaida: `Sou Tio Márcio.
Falcão`,
        marcas: ['herança', 'extends', 'super'],
      },
      {
        id: 'sobrescrever',
        titulo: 'Sobrescrever um método',
        resumo: 'A filha faz do jeito dela, e pode chamar o jeito da mãe.',
        explicacao: [
          'Quando a filha escreve um método com o mesmo nome do da mãe, o dela vale para os objetos dela: é **sobrescrever**. O `@override` na linha de cima avisa quem lê que aquilo substitui o da mãe.',
          'Dentro do método sobrescrito, `super.apresentar()` chama a versão da mãe — o jeito de acrescentar sem copiar o que ela já fazia.',
          'Os parâmetros e o tipo de retorno precisam combinar com os do método da mãe: quem tem um objeto da filha na mão precisa poder chamá-lo do mesmo jeito.',
        ],
        exemplo: `class Membro {
  final String nome;
  Membro(this.nome);
  String apresentar() => 'Sou $nome.';
}

class Desbravador extends Membro {
  final String classe;
  Desbravador(super.nome, this.classe);

  @override
  String apresentar() => '\${super.apresentar()} Estou na classe $classe.';
}

void main() {
  print(Desbravador('Ana', 'Amigo').apresentar());
}`,
        exemploComo: 'dart',
        exemploSaida: 'Sou Ana. Estou na classe Amigo.',
        marcas: ['@override', 'sobrescrever', 'super'],
      },
      {
        id: 'polimorfismo',
        titulo: 'Muitas filhas numa lista só',
        resumo: 'Uma List<Membro> guarda desbravadores e diretores, e cada um responde do seu jeito.',
        explicacao: [
          'Um objeto da filha **é** um objeto da mãe, e cabe onde ela cabe: uma `List<Membro>` guarda desbravadores e diretores juntos. Ao percorrer, cada um responde pelo **seu** método — é o que se chama polimorfismo.',
          'Uma classe **abstrata** é uma mãe que não se instancia sozinha: `abstract class Membro` com o método `funcao()` sem corpo obriga cada filha a escrevê-lo. Esquecer numa filha é recusado pelo compilador.',
          'É o que o Flutter faz o tempo todo: todo botão, texto e tela é uma filha de `Widget`, e o aplicativo percorre a árvore pedindo a cada um que se desenhe.',
        ],
        exemplo: `abstract class Membro {
  final String nome;
  Membro(this.nome);
  String funcao();
}

class Desbravador extends Membro {
  Desbravador(super.nome);
  @override
  String funcao() => 'participa das atividades';
}

class Diretor extends Membro {
  Diretor(super.nome);
  @override
  String funcao() => 'coordena o clube';
}

void main() {
  List<Membro> clube = [Desbravador('Bia'), Diretor('Ronaldo')];
  for (final m in clube) {
    print('\${m.nome} \${m.funcao()}');
  }
}`,
        exemploComo: 'dart',
        exemploSaida: `Bia participa das atividades
Ronaldo coordena o clube`,
        marcas: ['polimorfismo', 'abstract', 'classe abstrata'],
      },
    ],
  },
  {
    id: 'pacotes',
    topicos: [
      {
        id: 'bibliotecas',
        titulo: 'As bibliotecas do Dart',
        resumo: 'O que vem junto com a linguagem, e se importa com dart:.',
        explicacao: [
          'O Dart traz bibliotecas prontas. `dart:core` — com `print`, `List`, `String` — entra sozinho em todo arquivo. As outras se importam no alto: `import \'dart:math\';` traz `max`, `min`, `sqrt` e `pi`; `import \'dart:io\';` traz o terminal, com `stdin` e `stdout`.',
          'Usar `sqrt` sem o import é recusado com "Method not found" — o nome existe, mas não neste arquivo.',
          'Com `as`, os nomes da biblioteca ganham um prefixo: `import \'dart:math\' as math;` e depois `math.max(a, b)`. Serve quando dois lugares usam o mesmo nome.',
        ],
        exemplo: `import 'dart:math';

void main() {
  print(max(12, 15));
  print(sqrt(81));
  print(pi.toStringAsFixed(2));
}`,
        exemploComo: 'dart',
        exemploSaida: `15
9.0
3.14`,
        marcas: ['import', 'dart:math', 'dart:io', 'biblioteca'],
      },
      {
        id: 'seus-arquivos',
        titulo: 'Os seus arquivos',
        resumo: 'Cada classe no seu arquivo, e o import trazendo de um para o outro.',
        explicacao: [
          'Um programa que cresce se divide em arquivos. Cada arquivo `.dart` é uma **biblioteca**, e `import \'unidade.dart\';` traz para o arquivo de cima tudo o que o outro declara.',
          'O que começa com sublinhado é **privado** do arquivo: `_contador` só se enxerga dentro de onde foi escrito. É o jeito do Dart de esconder o que é detalhe.',
          'Num projeto de verdade, o principal fica em `bin/` e as classes em `lib/`, e o import usa o nome do pacote. No laboratório os arquivos ficam lado a lado, e o import é pelo nome do arquivo.',
        ],
        exemplo: `clube/
  pubspec.yaml        o pacote: nome e dependências
  bin/
    clube.dart        o main
  lib/
    unidade.dart      class Unidade
    desbravador.dart  class Desbravador`,
        exemploComo: 'texto',
        marcas: ['import', 'arquivo', 'biblioteca', 'privado'],
      },
      {
        id: 'pacotes',
        titulo: 'Pacotes e o pub',
        resumo: 'Uma pasta com pubspec.yaml é um pacote, e o pub.dev guarda os dos outros.',
        explicacao: [
          '**Pacote** é uma pasta de código com um arquivo `pubspec.yaml`, que diz o nome dela, a versão do Dart que ela pede e de quais outros pacotes ela depende. Seu programa é um pacote; as bibliotecas que outras pessoas publicam também são.',
          'O **pub.dev** é onde os pacotes do Dart e do Flutter são publicados. `dart pub add intl` acrescenta a dependência ao `pubspec.yaml` e baixa o pacote; depois, `import \'package:intl/intl.dart\';` o usa.',
          'Antes de adicionar um pacote, olhe quem publica, quando foi a última versão e quantos projetos o usam — é o mesmo cuidado do `pip` na CC004: nem tudo o que está publicado é confiável.',
        ],
        exemplo: `name: clube
description: O controle de especialidades do clube.
version: 1.0.0

environment:
  sdk: ^3.5.0

dependencies:
  intl: ^0.19.0`,
        exemploComo: 'texto',
        marcas: ['pacote', 'pubspec.yaml', 'pub.dev', 'dependência'],
      },
    ],
  },
  {
    id: 'programa',
    topicos: [
      {
        id: 'por-que-objetos',
        titulo: 'Orientação a objetos, e por que as telas são feitas dela',
        resumo: 'Cada pedaço da tela é um objeto que guarda o próprio estado.',
        explicacao: [
          '**Programação orientada a objetos** é organizar o programa em objetos que juntam dados e o que se faz com eles. Em vez de uma lista de nomes solta e uma função que mexe nela de longe, há uma `Unidade` que guarda os membros e sabe acrescentar um.',
          'Uma tela de aplicativo se encaixa nisso naturalmente: ela é feita de pedaços — botão, campo, lista —, e cada pedaço tem **o seu estado** (o texto digitado, quantas vezes foi tocado) e **o seu comportamento** (o que fazer no toque). Dois botões são dois objetos da mesma classe, cada um com o seu.',
          'É por isso que o Flutter é todo feito de classes: um botão novo é um objeto novo, e mudar um não mexe no outro. A herança deixa cada tipo de botão aproveitar o que todo botão já sabe fazer.',
        ],
        exemplo: `class Botao {
  final String rotulo;
  int toques = 0;

  Botao(this.rotulo);

  void tocar() {
    toques++;
    print('$rotulo: $toques toque(s)');
  }
}

void main() {
  var salvar = Botao('Salvar');
  var sair = Botao('Sair');
  salvar.tocar();
  salvar.tocar();
  sair.tocar();
}`,
        exemploComo: 'dart',
        exemploSaida: `Salvar: 1 toque(s)
Salvar: 2 toque(s)
Sair: 1 toque(s)`,
        marcas: ['orientação a objetos', 'estado', 'interface', 'widget'],
      },
      {
        id: 'relacoes',
        titulo: 'Classes que se relacionam',
        resumo: 'Uma guarda a outra — "tem um" —, ou herda dela — "é um".',
        explicacao: [
          'Duas classes se relacionam de dois jeitos. **Composição**: uma guarda a outra num campo — o desbravador **tem** especialidades, então `Desbravador` tem uma `List<Especialidade>`. **Herança**: uma é a outra — o conselheiro **é** um membro.',
          'A pergunta "tem um" ou "é um" decide qual usar. Um desbravador não é uma especialidade; ele tem várias. Usar herança no lugar errado prende as duas classes de um jeito que dói depois.',
          'Na composição, cada objeto cuida do que é dele: a especialidade sabe o próprio nome; o desbravador sabe quais conquistou e quantas são.',
        ],
        exemplo: `class Especialidade {
  final String nome;
  Especialidade(this.nome);
}

class Desbravador {
  final String nome;
  final List<Especialidade> especialidades = [];

  Desbravador(this.nome);

  void conquistar(Especialidade e) => especialidades.add(e);
}

void main() {
  var ana = Desbravador('Ana');
  ana.conquistar(Especialidade('Nós e Amarras'));
  ana.conquistar(Especialidade('Primeiros Socorros'));
  print('\${ana.nome}: \${ana.especialidades.length} especialidades');
  print(ana.especialidades.map((e) => e.nome).join(', '));
}`,
        exemploComo: 'dart',
        exemploSaida: `Ana: 2 especialidades
Nós e Amarras, Primeiros Socorros`,
        marcas: ['composição', 'herança', 'tem um', 'é um'],
      },
      {
        id: 'linha-de-comando',
        titulo: 'Um programa de linha de comando',
        resumo: 'Ler do teclado até a entrada acabar, e responder no terminal.',
        explicacao: [
          'Um programa de linha de comando conversa pelo terminal: lê o que se digita e escreve a resposta. `stdin.readLineSync()`, de `dart:io`, lê uma linha — e devolve `null` quando a entrada acaba. Por isso o tipo dele é `String?`.',
          'O laço clássico lê até o nulo: `while (true)`, uma linha por volta, e `break` quando ela vier nula. Cada linha costuma trazer campos separados — `Ana;Nós e Amarras` —, e `split(\';\')` os separa.',
          'Pronto, o programa vira um executável com `dart compile exe bin/clube.dart`: um arquivo que roda em qualquer computador igual ao seu, sem precisar do Dart instalado.',
        ],
        exemplo: `import 'dart:io';

void main() {
  var total = 0;
  while (true) {
    String? linha = stdin.readLineSync();
    if (linha == null) break;
    total += int.parse(linha);
  }
  print('Total: $total');
}`,
        exemploComo: 'dart',
        exemploEntrada: ['12', '30', '8'],
        exemploSaida: 'Total: 50',
        marcas: ['linha de comando', 'stdin', 'readLineSync', 'dart compile'],
      },
    ],
  },
];

const cap = (id: string) => {
  const c = CAPITULOS.find(x => x.id === id);
  if (!c) throw new Error(`Capítulo de Dart inexistente: ${id}`);
  return c.topicos;
};

export const MODULOS_DE_DART: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O primeiro programa',
    resumo: 'O Dart, o compilador que vem antes, e o que muda do JavaScript e do Python.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m1-teoria'],
        perguntas: 4,
        titulo: 'Compilação, e o Dart ao lado das outras',
        resumo: 'main, print, compilar antes de rodar, e duas diferenças com cada linguagem.',
        topicos: cap('primeiro'),
      },
      {
        id: 'm1-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'O programa que não compila',
        resumo: 'Ler o erro do compilador, consertar, e completar a saída.',
        arquivo: 'clube.dart',
        projeto: 'ficha',
        verificacoes: ['roda', 'saidaEsperada'],
        saidaEsperada: `Acampamento de Inverno
Vagas: 30
Diária: 45.5 reais`,
        modelo: `// O programa que não compila
//
// Este programa não roda: o compilador recusa uma linha antes de qualquer
// print acontecer — até o da primeira linha, que está certo. Execute, leia o
// erro no terminal (o arquivo, a linha e a coluna, e a seta embaixo),
// conserte, e faça o programa escrever exatamente:
//
//     Acampamento de Inverno
//     Vagas: 30
//     Diária: 45.5 reais

void main() {
  print('Acampamento de Inverno');
  int vagas = '30';
  double diaria = 45.5;
  print('Vagas: $vagas');
}
`,
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Variáveis e tipos',
    resumo: 'Tipo escrito ou inferido, var, final e const, e os quatro tipos do dia a dia.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m2-teoria'],
        perguntas: 4,
        titulo: 'Variáveis com tipo',
        resumo: 'O tipo na frente ou descoberto pelo valor — e, nos dois casos, fixo.',
        topicos: cap('variaveis'),
      },
      {
        id: 'm2-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'A ficha de inscrição',
        resumo: 'Declarar com tipo escrito e com tipo inferido, e montar o texto com $.',
        arquivo: 'clube.dart',
        projeto: 'ficha',
        verificacoes: ['saidaEsperada', 'tipoExplicito', 'tipoInferido', 'interpolacao'],
        saidaEsperada: `Nome: Davi Souza
Idade: 13 anos
Unidade: Falcão
Mensalidade: 12.5 reais
Três meses: 37.5 reais
Em dia: true`,
        modelo: `// A ficha de inscrição
//
// O Davi Souza, de 13 anos, se inscreveu na unidade Falcão. A mensalidade é
// de 12,5 reais, e ele está em dia.
//
// Declare as variáveis da ficha — pelo menos duas com o tipo escrito na
// frente (int, double, String, bool) e pelo menos duas com var ou final, sem
// tipo. Calcule o valor de três meses com uma conta, e não digitando 37.5.
// Monte cada linha com interpolação ($nome, \${conta}).
//
// A saída tem de ser exatamente:
//
//     Nome: Davi Souza
//     Idade: 13 anos
//     Unidade: Falcão
//     Mensalidade: 12.5 reais
//     Três meses: 37.5 reais
//     Em dia: true

void main() {
}
`,
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'Nulo seguro',
    resumo: 'O tipo com ?, os operadores que tratam o nulo, e por que o ! é o último recurso.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m3-teoria'],
        perguntas: 4,
        titulo: 'O nulo tratado antes de rodar',
        resumo: 'String e String?, ??, ?., a promoção dentro do if, e o perigo do !.',
        topicos: cap('nulo'),
      },
      {
        id: 'm3-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'Os apelidos do terminal',
        resumo: 'Um programa que lê do teclado e não compila: tratar o nulo de verdade, sem !.',
        arquivo: 'clube.dart',
        projeto: 'apelidos',
        verificacoes: ['roda', 'saidaEsperada', 'tipoAnulavel', 'usoSeguroDoNulo', 'semExclamacao'],
        entradaPadrao: ['Tigrão', 'Aninha'],
        saidaEsperada: `Olá, TIGRÃO!
Olá, ANINHA!
Olá, VISITANTE!`,
        modelo: `import 'dart:io';

// Os apelidos do terminal
//
// A secretaria digita o apelido dos três primeiros inscritos. O
// readLineSync() devolve a linha digitada — ou null, quando a entrada acaba
// antes. Na entrada de teste, ao lado, só há dois apelidos.
//
// O programa não compila. Conserte tratando o nulo de verdade, sem usar o !:
// guarde a linha lida numa variável de tipo anulável (com ?), e quem não
// tiver apelido digitado é recebido como "visitante". A saída tem de ser
// exatamente:
//
//     Olá, TIGRÃO!
//     Olá, ANINHA!
//     Olá, VISITANTE!

String saudacao(String apelido) {
  return 'Olá, \${apelido.toUpperCase()}!';
}

void main() {
  for (var i = 0; i < 3; i++) {
    String apelido = stdin.readLineSync();
    print(saudacao(apelido));
  }
}
`,
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Funções e coleções',
    resumo: 'Funções com tipo, List, Set e Map, e o jeito de percorrer cada uma.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m4-teoria'],
        perguntas: 4,
        titulo: 'Funções, listas, conjuntos e mapas',
        resumo: 'Parâmetros nomeados, os três tipos de coleção, e for-in, where e map.',
        topicos: cap('colecoes'),
      },
      {
        id: 'm4-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'A chamada da reunião',
        resumo: 'Uma lista, um mapa, uma função e um laço que não repete ninguém.',
        arquivo: 'clube.dart',
        projeto: 'chamada',
        verificacoes: ['saidaEsperada', 'usaLista', 'usaMapa', 'iteraColecao', 'funcaoPropria'],
        saidaEsperada: `Presentes: 4
Ana: 5 pontos
Bia: 7 pontos
Caio: 3 pontos
Davi: 6 pontos`,
        modelo: `// A chamada da reunião
//
// Presentes marcados no sábado, nesta ordem: Ana, Bia, Caio, Davi e Bia de
// novo — a Bia foi marcada duas vezes.
// Pontos de presença acumulados até hoje: Ana 4, Bia 6, Caio 2, Davi 5.
//
// Escreva:
//   - uma lista com os presentes, como foram marcados (com a Bia repetida);
//   - um mapa com os pontos de cada um;
//   - uma função, fora do main, que recebe o mapa e um nome e devolve os
//     pontos dele somados com 1, pela presença de hoje;
// e percorra os presentes sem repetir ninguém, escrevendo exatamente:
//
//     Presentes: 4
//     Ana: 5 pontos
//     Bia: 7 pontos
//     Caio: 3 pontos
//     Davi: 6 pontos
//
// Lembre: ler uma chave de um mapa devolve um valor que pode ser nulo.

void main() {
}
`,
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Classes e objetos',
    resumo: 'A classe como molde, o objeto como ficha, e o construtor que a preenche.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m5-teoria'],
        perguntas: 4,
        titulo: 'Classe, objeto e construtor',
        resumo: 'Atributos, métodos, construtores com nome, getters e toString.',
        topicos: cap('classes'),
      },
      {
        id: 'm5-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'A ficha do desbravador',
        resumo: 'Uma classe com atributos, construtor e método — e duas fichas feitas com ela.',
        arquivo: 'clube.dart',
        projeto: 'fichas',
        verificacoes: ['saidaEsperada', 'classeCompleta', 'doisObjetos'],
        saidaEsperada: `Sou Ana, tenho 12 anos e sou da unidade Águia.
Sou Caio, tenho 13 anos e sou da unidade Falcão.
A Ana fez aniversário: agora tem 13 anos.`,
        modelo: `// A ficha do desbravador
//
// Escreva a classe Desbravador, com nome, idade e unidade, um construtor e
// dois métodos: apresentar(), que devolve o texto de apresentação, e
// aniversario(), que aumenta a idade em 1.
//
// No main, crie a Ana (12 anos, Águia) e o Caio (13 anos, Falcão), escreva a
// apresentação dos dois, chame o aniversário da Ana e escreva a última
// linha. A saída tem de ser exatamente:
//
//     Sou Ana, tenho 12 anos e sou da unidade Águia.
//     Sou Caio, tenho 13 anos e sou da unidade Falcão.
//     A Ana fez aniversário: agora tem 13 anos.

void main() {
}
`,
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Herança',
    resumo: 'A filha que recebe o que a mãe tem, sobrescreve o que faz diferente, e cabe onde a mãe cabe.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m6-teoria'],
        perguntas: 4,
        titulo: 'Herança e sobrescrita',
        resumo: 'extends, super, @override, classe abstrata e uma lista com várias filhas.',
        topicos: cap('heranca'),
      },
      {
        id: 'm6-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'Os membros do clube',
        resumo: 'Duas filhas de Membro, cada uma se apresentando do seu jeito.',
        arquivo: 'clube.dart',
        projeto: 'membros',
        verificacoes: ['saidaEsperada', 'heranca', 'sobrescreve', 'chamaMae'],
        saidaEsperada: `Sou Ana, desbravadora da unidade Águia.
Sou Tio Márcio, conselheiro da unidade Falcão.`,
        modelo: `// Os membros do clube
//
// A classe Membro já está escrita. Escreva duas classes que herdam dela:
//
//   - Desbravadora, com a unidade, que se apresenta como
//     "Sou <nome>, desbravadora da unidade <unidade>.";
//   - Conselheiro, com a unidade, que se apresenta como
//     "Sou <nome>, conselheiro da unidade <unidade>.".
//
// As duas sobrescrevem apresentar(), com @override, e aproveitam o
// "Sou <nome>" da mãe chamando super.apresentar(). O construtor de cada uma
// entrega o nome para o construtor da mãe.
//
// No main, ponha a Ana (Águia) e o Tio Márcio (Falcão) numa List<Membro> e
// percorra a lista. A saída tem de ser exatamente:
//
//     Sou Ana, desbravadora da unidade Águia.
//     Sou Tio Márcio, conselheiro da unidade Falcão.

class Membro {
  final String nome;

  Membro(this.nome);

  String apresentar() => 'Sou $nome';
}

void main() {
}
`,
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'Pacotes',
    resumo: 'As bibliotecas do Dart, os seus arquivos e os pacotes do pub.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m7-teoria'],
        perguntas: 4,
        titulo: 'Bibliotecas e pacotes',
        resumo: 'import de dart:, de um arquivo seu e de package:, e o pubspec.yaml.',
        topicos: cap('pacotes'),
      },
      {
        id: 'm7-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'Dividir em arquivos',
        resumo: 'A classe num arquivo, o main no outro, e uma biblioteca do Dart no meio.',
        arquivo: 'clube.dart',
        projeto: 'unidade',
        arquivosDoProjeto: [{
          nome: 'unidade.dart',
          editavel: true,
          modelo: `// unidade.dart
//
// Escreva aqui a classe Unidade: o nome e a lista das idades dos membros.
`,
        }],
        verificacoes: ['saidaEsperada', 'importaArquivo', 'usaBiblioteca'],
        saidaEsperada: `Unidade Águia
Mais velho: 14 anos
Média: 12.5 anos`,
        modelo: `// Dividir em arquivos
//
// A unidade Águia tem quatro membros, com 12, 14, 11 e 13 anos.
//
// Escreva a classe Unidade no arquivo unidade.dart, aqui do lado, e use-a
// neste arquivo com import. Para achar o mais velho, use o max da biblioteca
// dart:math. A saída tem de ser exatamente:
//
//     Unidade Águia
//     Mais velho: 14 anos
//     Média: 12.5 anos

void main() {
}
`,
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'Objetos na linha de comando',
    resumo: 'Por que as telas são feitas de objetos, e um programa com duas classes que se relacionam.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_DART['m8-teoria'],
        perguntas: 4,
        titulo: 'Orientação a objetos e o programa inteiro',
        resumo: 'Estado e comportamento juntos, composição e herança, e ler do teclado até acabar.',
        topicos: cap('programa'),
      },
      {
        id: 'm8-lab', tipo: 'laboratorio', linguagem: 'dart',
        titulo: 'O controle de especialidades',
        resumo: 'Ler as conquistas do terminal e montar o relatório com duas classes que se relacionam.',
        arquivo: 'clube.dart',
        projeto: 'especialidades',
        /* Sem "roda": o modelo é um main vazio, que roda — seria tarefa verde de
           graça. Quem dá dente é a saída combinada. */
        verificacoes: ['saidaContem', 'duasClassesRelacionadas', 'leEntrada', 'usoSeguroDoNulo', 'semExclamacao'],
        entradaPadrao: ['Ana;Nós e Amarras', 'Caio;Primeiros Socorros', 'Ana;Primeiros Socorros', 'Bia;Arte de Acampar', 'Ana;Arte de Acampar'],
        saidaContem: ['Ana: 3 especialidades', 'Caio: 1 especialidade', 'Bia: 1 especialidade', 'Total: 5 conquistas'],
        modelo: `import 'dart:io';

// O controle de especialidades
//
// Cada linha da entrada é uma conquista: o nome do desbravador e o nome da
// especialidade, separados por ponto e vírgula — "Ana;Nós e Amarras".
//
// Escreva um programa de linha de comando que leia as linhas até a entrada
// acabar e mostre quantas especialidades cada um conquistou. Use duas
// classes que se relacionem — um desbravador que guarda as especialidades
// dele, por exemplo —, e trate o nulo do readLineSync sem usar o !.
//
// A saída precisa trazer, escritas assim:
//
//     Ana: 3 especialidades
//     Caio: 1 especialidade
//     Bia: 1 especialidade
//     Total: 5 conquistas
//
// (repare no singular quando é uma só). O resto da saída é com você.

void main() {
}
`,
      },
    ],
  },
];
