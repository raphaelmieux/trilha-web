/**
 * O passo a passo de cada verificação de Dart.
 *
 * Pela regra das outras linguagens: o caminho, e nunca a resposta. Dizer que
 * o `??` dá um valor para o caso de nulo ensina; escrever a linha inteira
 * resolve o laboratório pela pessoa.
 */
export const PASSOS_DE_DART: Record<string, string[]> = {
  roda: [
    'Clique em Executar e leia o terminal.',
    'Se aparece "Error:", foi o compilador: nada rodou. A primeira linha diz o arquivo, a linha e a coluna; embaixo vem o código, com a seta no lugar.',
    'Conserte o primeiro erro e execute de novo — às vezes ele causa os outros.',
    'Se aparece "Unhandled exception:", o programa compilou e parou no meio: a segunda linha diz o que aconteceu.',
  ],
  saidaEsperada: [
    'Compare o terminal com o enunciado, linha por linha.',
    'Confira o texto exato: maiúsculas, acentos, dois-pontos e o espaço entre as palavras.',
    'Número com .0 no fim é double; sem, é int. A divisão com / sempre dá double; a com ~/ dá int.',
    'Se um número saiu diferente, o problema costuma estar na conta, e não no print.',
  ],
  saidaContem: [
    'Leia no enunciado quais frases precisam aparecer.',
    'Procure cada uma no terminal, escrita igual.',
    'Se uma faltou, ache o print que devia escrevê-la e confira se o programa passa por ele.',
  ],
  tipoExplicito: [
    'Escolha duas variáveis cujo tipo você quer deixar escrito.',
    'Escreva o tipo antes do nome: int, double, String, bool, List<String>.',
    'O valor do lado direito tem de caber no tipo — o compilador confere.',
  ],
  tipoInferido: [
    'Escolha duas variáveis cujo tipo é óbvio pelo valor.',
    'Declare com var (se muda) ou final (se não muda), sem o tipo.',
    'Elas precisam de valor inicial: é por ele que o compilador descobre o tipo.',
  ],
  interpolacao: [
    'Ache um texto montado com + entre pedaços.',
    'Troque por um texto só, com $nome no lugar da variável.',
    'Para uma conta ou um campo, use chaves: ${pessoa.nome} ou ${total * 2}.',
  ],
  tipoAnulavel: [
    'Pense num valor que pode faltar: um apelido, uma linha que não foi digitada.',
    'Declare o tipo com ? no fim: String? apelido;',
    'A partir daí o compilador obriga a tratar o caso de não haver nada.',
  ],
  usoSeguroDoNulo: [
    'Ache onde o valor anulável é usado.',
    'valor ?? \'padrão\' troca o nulo por um valor; objeto?.metodo() só chama se houver objeto.',
    'Ou teste antes: dentro de if (x != null) { ... } a variável local x deixa de ser anulável.',
  ],
  semExclamacao: [
    'Procure cada ! colado depois de um valor (o != de comparação não conta).',
    'O ! não trata o nulo: ele só manda o programa parar se o nulo aparecer.',
    'Troque por ?? com um valor que faça sentido, ou por um if que cuide do caso.',
  ],
  usaLista: ['Declare a lista entre colchetes, com o tipo dos itens: List<String> nomes = [\'Ana\'];'],
  usaMapa: ['Declare o mapa entre chaves, com chave e valor: Map<String, int> pontos = {\'Ana\': 10};'],
  usaConjunto: ['Declare o conjunto entre chaves, só com itens: Set<String> unidades = {\'Águia\'};', 'Repetir um item num conjunto não faz nada: ele já está lá.'],
  iteraColecao: [
    'Para fazer alguma coisa com cada item, use for (final item in colecao) { ... }.',
    'Ou chame forEach, map ou where na coleção, com uma função dentro.',
  ],
  funcaoPropria: [
    'Ache um pedaço do main que tem um nome só: "calcular a média", "montar a linha".',
    'Escreva a função fora do main: tipo de retorno, nome, parâmetros e corpo.',
    'Chame a função lá dentro, no lugar onde o pedaço estava.',
  ],
  classeCompleta: [
    'Escreva class Nome { } fora do main.',
    'Dentro: os campos com tipo, o construtor (Nome(this.campo1, this.campo2);) e um método que use os campos.',
    'No main, crie um objeto com Nome(...) e chame o método.',
  ],
  doisObjetos: [
    'Chame o construtor duas vezes, com valores diferentes.',
    'Guarde cada objeto numa variável — ou numa lista.',
  ],
  heranca: [
    'Escreva a classe filha com extends e o nome da mãe.',
    'O que a mãe tem, a filha já tem: escreva na filha só o que é dela.',
    'No main, crie um objeto da filha.',
  ],
  sobrescreve: [
    'Escolha um método da mãe que a filha faz de outro jeito.',
    'Escreva na filha um método com o mesmo nome e os mesmos parâmetros.',
    'Ponha @override na linha de cima: é o aviso de que ele substitui o da mãe.',
  ],
  chamaMae: [
    'A mãe precisa dos dados dela para existir: o construtor da filha tem de entregá-los.',
    'O jeito curto é super.nome no parâmetro: Filha(super.nome, this.extra);',
    'O jeito longo é : super(nome) depois dos parênteses do construtor.',
  ],
  importaArquivo: [
    'Abra o outro arquivo na lateral e confira o que ele tem.',
    'No alto do principal, escreva import com o nome do arquivo entre aspas e ponto e vírgula.',
    'Use a classe do outro arquivo no main — importar e não usar não demonstra nada.',
  ],
  usaBiblioteca: [
    'As bibliotecas do Dart se importam com dart: na frente: import \'dart:math\';',
    'dart:math traz max, min, sqrt e pi; dart:io traz stdin e stdout.',
    'Use alguma coisa da biblioteca no programa.',
  ],
  duasClassesRelacionadas: [
    'Pense em duas coisas do problema em que uma tem a outra: a unidade tem desbravadores.',
    'Escreva as duas classes, e ponha na que tem um campo do tipo da outra — List<Desbravador> membros.',
    'Use as duas no main.',
  ],
  leEntrada: [
    'No alto do arquivo: import \'dart:io\';',
    'stdin.readLineSync() devolve a próxima linha da entrada — e null quando ela acaba.',
    'Por isso o tipo dele é String?: trate o nulo antes de usar.',
  ],
};
