import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-MB001 Dart.
 *
 * A definição vale uma vez; depois vêm consequência, discriminação e
 * diagnóstico. Aqui o diagnóstico tem um sabor que as veredas anteriores não
 * tinham: boa parte dos enganos do Dart nem chega a rodar — o compilador os
 * recusa —, e a pergunta que vale é "o que o compilador vai dizer, e por quê?".
 *
 * Toda alternativa errada diz por que está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum. Nada de crase nem de asterisco: a questão
 * vai para o `QuestionRenderer`, que imprime texto puro.
 */

export const QUESTOES_DE_DART: Record<string, Question[]> = {
  /* ── Módulo 1 — O primeiro programa ── */
  'm1-teoria': [
    {
      id: 'DT-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é compilação?',
      data: { options: [
        { id: 'a', text: 'Traduzir o programa inteiro para a máquina antes de executá-lo.', correct: true },
        { id: 'b', text: 'Executar o programa linha por linha, parando no primeiro erro.', porque: 'Isso é o que o Python faz ao interpretar. Na compilação, a tradução e a conferência acontecem antes de qualquer linha rodar.' },
        { id: 'c', text: 'Juntar vários arquivos de texto num arquivo só para enviar.', porque: 'Juntar arquivos é compactar ou empacotar. Compilar é traduzir o código para que a máquina o execute.' },
        { id: 'd', text: 'Apagar os comentários para o programa ocupar menos espaço.', porque: 'Os comentários somem na tradução, mas esse não é o propósito. Compilar é traduzir e conferir o programa todo antes de rodar.' },
      ]},
      explanation: 'No caminho da tradução o compilador confere o programa, e um erro de tipo impede a tradução inteira.',
    },
    {
      id: 'DT-M1-Q2', type: 'scenario',
      prompt: 'Um programa em Dart tem um print certo na linha 2 e um erro de tipo na linha 3. Ao rodar, o que aparece no terminal?',
      data: { scenarios: [
        { id: 'a', text: 'Só o erro do compilador, sem nenhum print.', correct: true },
        { id: 'b', text: 'O print da linha 2, e depois o erro da linha 3.', porque: 'Isso aconteceria no Python, que roda linha por linha. No Dart o compilador recusa o programa todo antes de a linha 2 rodar.' },
        { id: 'c', text: 'Todos os prints, e o erro só no fim.', porque: 'O erro de compilação não espera o programa terminar: ele impede o programa de começar.' },
        { id: 'd', text: 'Nada, porque o Dart ignora a linha com erro.', porque: 'O Dart não ignora erro de tipo. Ele o mostra com o arquivo, a linha e a coluna.' },
      ]},
      explanation: 'É a diferença que o primeiro laboratório mostra: com o compilador na frente, ou o programa todo está certo, ou nada roda.',
    },
    {
      id: 'DT-M1-Q3', type: 'multiple_choice',
      prompt: 'Qual é uma diferença entre o Dart e o JavaScript?',
      data: { options: [
        { id: 'a', text: 'O Dart separa int e double.', correct: true },
        { id: 'b', text: 'O Dart usa recuo para marcar os blocos.', porque: 'O Dart usa chaves, como o JavaScript. Quem marca bloco pelo recuo é o Python.' },
        { id: 'c', text: 'O Dart não tem funções, só classes.', porque: 'O Dart tem funções soltas, e todo programa começa por uma delas, a main.' },
        { id: 'd', text: 'O Dart não aceita comentários com //.', porque: 'O Dart usa // para comentário, exatamente como o JavaScript.' },
      ]},
      explanation: 'A outra diferença grande é a conferência de tipos antes de rodar: o Dart recusa o que o JavaScript converteria calado.',
    },
    {
      id: 'DT-M1-Q4', type: 'scenario',
      prompt: 'No Dart, 7 / 2 dá 3.5. Para obter só a parte inteira, 3, o que se escreve?',
      data: { scenarios: [
        { id: 'a', text: '7 ~/ 2', correct: true },
        { id: 'b', text: '7 // 2', porque: 'No Dart, // começa um comentário. A divisão inteira que no Python era // aqui é ~/.' },
        { id: 'c', text: '7 % 2', porque: 'O % dá o resto da divisão, que aqui é 1, e não a parte inteira.' },
        { id: 'd', text: 'int(7 / 2)', porque: 'Essa forma é do Python. No Dart a conversão seria (7 / 2).toInt(), e o caminho direto é o ~/.' },
      ]},
      explanation: 'A barra sempre dá double, mesmo quando a divisão é exata: 4 / 2 dá 2.0.',
    },
    {
      id: 'DT-M1-Q5', type: 'true_false',
      prompt: 'No Dart, o recuo das linhas é o que diz quais instruções ficam dentro de um if.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Quem diz são as chaves. O recuo ajuda quem lê, mas uma linha recuada fora das chaves roda fora do if.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É uma das diferenças com o Python: lá o bloco é o recuo; aqui são as chaves.',
    },
    {
      id: 'DT-M1-Q6', type: 'true_false',
      prompt: 'Todo programa em Dart começa a rodar pela função main.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem uma main o programa nem tem por onde começar. O dart run procura essa função no arquivo.' },
      ]},
      explanation: 'No Python o arquivo rodava de cima para baixo; no Dart, o que roda é o que a main chama.',
    },
    {
      id: 'DT-M1-Q7', type: 'matching',
      prompt: 'Ligue cada característica à linguagem que a tem, entre as três.',
      data: { pairs: [
        { left: 'Bloco marcado pelo recuo', right: 'Python' },
        { left: '"5" + 3 dá "53"', right: 'JavaScript' },
        { left: 'Erro de tipo recusado antes de rodar', right: 'Dart' },
      ]},
      explanation: 'São as diferenças que o requisito 3 pede: duas com cada linguagem, e as que mais pesam são as de tipo.',
    },
  ],

  /* ── Módulo 2 — Variáveis e tipos ── */
  'm2-teoria': [
    {
      id: 'DT-M2-Q1', type: 'multiple_choice',
      prompt: 'Depois de var nome = "Ana"; o que acontece com nome = 12; na linha seguinte?',
      data: { options: [
        { id: 'a', text: 'O compilador recusa: nome é String.', correct: true },
        { id: 'b', text: 'nome passa a valer 12, porque foi declarada com var.', porque: 'Isso é o let do JavaScript. No Dart o var descobre o tipo uma vez, pelo valor inicial, e o tipo não muda mais.' },
        { id: 'c', text: 'nome passa a valer "12", convertido para texto.', porque: 'O Dart não converte calado. Um int numa variável String é recusado antes de rodar.' },
        { id: 'd', text: 'O programa roda e para na linha com uma exceção.', porque: 'Erro de tipo no Dart nem chega a rodar: o compilador o recusa antes de o programa começar.' },
      ]},
      explanation: 'Inferido não quer dizer solto: o tipo é descoberto pelo valor, e fica.',
    },
    {
      id: 'DT-M2-Q2', type: 'scenario',
      prompt: 'O nome de quem se inscreveu é digitado uma vez e não muda mais. Como declarar a variável?',
      data: { scenarios: [
        { id: 'a', text: 'Com final.', correct: true },
        { id: 'b', text: 'Com const.', porque: 'const exige um valor conhecido antes de rodar, escrito no código. Um nome digitado só existe com o programa rodando.' },
        { id: 'c', text: 'Com var.', porque: 'var funciona, mas permite mudar o valor depois, que é justamente o que não deve acontecer aqui.' },
        { id: 'd', text: 'Com dynamic.', porque: 'dynamic desliga a conferência de tipo. O problema aqui não é o tipo, e sim impedir que o valor mude.' },
      ]},
      explanation: 'final recebe valor uma vez, quando o programa já está rodando; const precisa do valor escrito no próprio código.',
    },
    {
      id: 'DT-M2-Q3', type: 'multiple_choice',
      prompt: 'Qual destas declarações o compilador recusa?',
      data: { options: [
        { id: 'a', text: 'int metade = 2.5;', correct: true },
        { id: 'b', text: 'double preco = 10;', porque: 'Um inteiro escrito cabe num double: preco passa a valer 10.0.' },
        { id: 'c', text: 'var total = 0;', porque: 'É uma declaração comum: total é inferido como int, valendo zero.' },
        { id: 'd', text: 'final ok = true;', porque: 'ok é inferido como bool e recebe valor uma vez, como todo final.' },
      ]},
      explanation: 'O inteiro cabe no double, mas o double não cabe no int: as casas depois do ponto se perderiam.',
    },
    {
      id: 'DT-M2-Q4', type: 'scenario',
      prompt: 'Com int inscritos = 25; o que print("Grupos: ${inscritos ~/ 4}") escreve?',
      data: { scenarios: [
        { id: 'a', text: 'Grupos: 6', correct: true },
        { id: 'b', text: 'Grupos: 6.25', porque: 'O ~/ é a divisão inteira: ele descarta a parte depois do ponto e devolve um int.' },
        { id: 'c', text: 'Grupos: ${inscritos ~/ 4}', porque: 'Dentro das aspas, cifrão com chaves é interpolação: o Dart calcula a conta e põe o resultado no texto.' },
        { id: 'd', text: 'Grupos: 6.0', porque: 'O ~/ devolve int, e int se escreve sem o .0. Quem dá double é a divisão com /.' },
      ]},
      explanation: 'O cifrão com chaves põe o resultado de uma expressão dentro do texto; sem chaves, ele serve para um nome de variável só.',
    },
    {
      id: 'DT-M2-Q5', type: 'true_false',
      prompt: 'Uma variável declarada com var pode receber depois um valor de outro tipo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O var descobre o tipo uma vez, pelo valor inicial, e o compilador recusa um valor de outro tipo depois.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a diferença do let do JavaScript: lá o tipo mora no valor; aqui, na variável.',
    },
    {
      id: 'DT-M2-Q6', type: 'true_false',
      prompt: 'Tentar dar outro valor a uma variável final faz o compilador recusar o programa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'final recebe valor uma vez só. A segunda atribuição é recusada com Can\'t assign to the final variable.' },
      ]},
      explanation: 'A regra prática é começar com final e trocar por var só quando o valor precisar mudar.',
    },
    {
      id: 'DT-M2-Q7', type: 'matching',
      prompt: 'Ligue cada valor ao tipo que o Dart infere para ele.',
      data: { pairs: [
        { left: '12', right: 'int' },
        { left: '1.52', right: 'double' },
        { left: '\'Águia\'', right: 'String' },
        { left: 'true', right: 'bool' },
      ]},
      explanation: 'É pelo valor inicial que o var descobre o tipo, e o runtimeType mostra o que ficou.',
    },
  ],

  /* ── Módulo 3 — Nulo seguro ── */
  'm3-teoria': [
    {
      id: 'DT-M3-Q1', type: 'multiple_choice',
      prompt: 'O que quer dizer nulo seguro, no Dart?',
      data: { options: [
        { id: 'a', text: 'Um tipo sem ? nunca é nulo, e o compilador garante.', correct: true },
        { id: 'b', text: 'Toda variável começa com um valor padrão, e nunca é nula.', porque: 'Variáveis com ? começam nulas. O que o Dart garante é que um tipo sem ? nunca recebe nulo.' },
        { id: 'c', text: 'O programa troca qualquer nulo por um texto vazio.', porque: 'O Dart não troca nada sozinho. Ele obriga quem escreve a decidir o que fazer com o nulo.' },
        { id: 'd', text: 'O nulo é proibido em todo programa escrito em Dart.', porque: 'O nulo existe, e se declara com ?. O que muda é que ele só aparece onde foi declarado.' },
      ]},
      explanation: 'Quem pode faltar se declara com ?, e o compilador obriga a tratar o caso de faltar antes de rodar.',
    },
    {
      id: 'DT-M3-Q2', type: 'scenario',
      prompt: 'Uma variável String? apelido pode estar vazia. Como escrever o apelido, ou "sem apelido" quando não houver?',
      data: { scenarios: [
        { id: 'a', text: 'apelido ?? "sem apelido"', correct: true },
        { id: 'b', text: 'apelido! ou "sem apelido"', porque: 'O ! não oferece alternativa: se apelido for nulo, o programa para. E "ou" não é operador no Dart.' },
        { id: 'c', text: 'apelido?.length', porque: 'Isso daria o tamanho do apelido, ou nulo, e não o texto que se queria escrever.' },
        { id: 'd', text: 'apelido == "sem apelido"', porque: 'Isso compara os dois textos e devolve true ou false, sem escrever apelido nenhum.' },
      ]},
      explanation: 'O ?? usa o valor da esquerda quando ele existe, e o da direita quando é nulo.',
    },
    {
      id: 'DT-M3-Q3', type: 'scenario',
      prompt: 'O compilador mostra: Property \'length\' cannot be accessed on \'String?\' because it is potentially null. O que ele está dizendo?',
      data: { scenarios: [
        { id: 'a', text: 'Ali o valor ainda pode ser nulo.', correct: true },
        { id: 'b', text: 'O tipo String não tem a propriedade length.', porque: 'String tem length. O problema é o ?, que diz que o valor pode nem existir.' },
        { id: 'c', text: 'O programa rodou e encontrou um nulo naquela linha.', porque: 'É um erro de compilação: nada rodou. O compilador avisa que pode haver nulo, antes de saber se há.' },
        { id: 'd', text: 'A variável foi declarada duas vezes no mesmo bloco.', porque: 'Declaração repetida tem outra mensagem. Esta fala de um valor que pode ser nulo.' },
      ]},
      explanation: 'A dica embaixo sugere o ?., mas muitas vezes o certo é testar antes com if, e deixar a promoção fazer o resto.',
    },
    {
      id: 'DT-M3-Q4', type: 'multiple_choice',
      prompt: 'O que acontece quando o ! encontra um valor nulo com o programa rodando?',
      data: { options: [
        { id: 'a', text: 'O programa para com uma exceção.', correct: true },
        { id: 'b', text: 'O compilador recusa o programa antes de rodar.', porque: 'O ! cala o compilador: ele passa a confiar. O problema só aparece rodando, quando o nulo chega.' },
        { id: 'c', text: 'O valor é trocado por zero ou por texto vazio.', porque: 'O ! não troca nada. Ele promete que o valor existe, e se a promessa falha, o programa para.' },
        { id: 'd', text: 'A linha é pulada e o programa continua.', porque: 'Nenhuma linha é pulada. O programa termina ali, com Null check operator used on a null value.' },
      ]},
      explanation: 'O ! não trata o nulo: promete que ele não vai aparecer. Quase sempre há um jeito melhor, com ?? ou com um if.',
    },
    {
      id: 'DT-M3-Q5', type: 'true_false',
      prompt: 'Dentro de if (nome != null) { ... }, uma variável local String? nome pode ser usada como String.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É a promoção: o compilador sabe que ali dentro há nome, e trata a variável local como String.' },
      ]},
      explanation: 'A promoção vale para variável local e parâmetro. Campo público de classe não é promovido.',
    },
    {
      id: 'DT-M3-Q6', type: 'true_false',
      prompt: 'Num mapa Map<String, int>, ler idades["Ana"] devolve um valor do tipo int.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A chave pode não existir no mapa, e então o resultado é nulo. Por isso o tipo da leitura é int?.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Somar 1 direto em idades["Ana"] é recusado: antes é preciso decidir o que fazer quando a chave falta.',
    },
    {
      id: 'DT-M3-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece com String? apelido; print(apelido ?? "visitante");',
      data: { items: [
        { id: 'a', text: 'apelido é declarada sem valor, e começa nula', order: 1 },
        { id: 'b', text: 'O ?? olha o lado esquerdo e o encontra nulo', order: 2 },
        { id: 'c', text: 'O ?? usa o texto da direita', order: 3 },
        { id: 'd', text: 'O print escreve visitante', order: 4 },
      ]},
      explanation: 'Uma variável com ? e sem valor inicial começa nula; o ?? decide na hora o que usar.',
    },
  ],

  /* ── Módulo 4 — Funções e coleções ── */
  'm4-teoria': [
    {
      id: 'DT-M4-Q1', type: 'multiple_choice',
      prompt: 'Em double media(List<int> notas), o que diz a palavra double?',
      data: { options: [
        { id: 'a', text: 'O tipo do valor que a função devolve.', correct: true },
        { id: 'b', text: 'O tipo de cada nota que a função recebe.', porque: 'As notas são int, como diz o List<int>. O double antes do nome é o que volta.' },
        { id: 'c', text: 'Que a função deve ser chamada duas vezes.', porque: 'double é o tipo dos números com casas. Não tem relação com quantas vezes se chama a função.' },
        { id: 'd', text: 'Que a função pode devolver um valor nulo.', porque: 'Para poder devolver nulo o tipo teria ?: double?. Sem ele, a função sempre devolve um número.' },
      ]},
      explanation: 'O tipo antes do nome é o do retorno, e void quando a função não devolve nada.',
    },
    {
      id: 'DT-M4-Q2', type: 'scenario',
      prompt: 'Uma função tem o parâmetro {required String nome}. Como chamá-la?',
      data: { scenarios: [
        { id: 'a', text: 'etiqueta(nome: "Caio")', correct: true },
        { id: 'b', text: 'etiqueta("Caio")', porque: 'Parâmetro entre chaves é nomeado: quem chama escreve o nome dele antes do valor.' },
        { id: 'c', text: 'etiqueta()', porque: 'Com required, o parâmetro é obrigatório, e chamar sem ele é recusado pelo compilador.' },
        { id: 'd', text: 'etiqueta(required: "Caio")', porque: 'required é uma palavra da declaração. Na chamada vai o nome do parâmetro, nome.' },
      ]},
      explanation: 'Com nome na chamada, a ordem dos parâmetros nomeados deixa de importar.',
    },
    {
      id: 'DT-M4-Q3', type: 'multiple_choice',
      prompt: 'Que coleção guardar para saber quem esteve na reunião, sem contar ninguém duas vezes?',
      data: { options: [
        { id: 'a', text: 'Um Set<String>.', correct: true },
        { id: 'b', text: 'Uma List<String>.', porque: 'A lista aceita repetição: quem foi marcado duas vezes aparece duas vezes.' },
        { id: 'c', text: 'Um Map<String, String>.', porque: 'Um mapa liga chave a valor. Aqui não há valor nenhum para ligar a cada nome.' },
        { id: 'd', text: 'Uma String com os nomes.', porque: 'Num texto não há como impedir repetição, e contar as pessoas dá trabalho.' },
      ]},
      explanation: 'O conjunto não guarda repetição: acrescentar quem já está lá não muda nada.',
    },
    {
      id: 'DT-M4-Q4', type: 'scenario',
      prompt: 'Um programa tenta percorrer um mapa com for (final x in pontos), e o compilador recusa. Qual é o conserto?',
      data: { scenarios: [
        { id: 'a', text: 'Percorrer pontos.entries, ou as chaves, ou os valores.', correct: true },
        { id: 'b', text: 'Trocar o final por var no for.', porque: 'O problema não é a variável do laço, e sim o mapa, que não é uma sequência.' },
        { id: 'c', text: 'Converter o mapa em texto antes do laço.', porque: 'Percorrer um texto passa letra por letra, e não pelos pares do mapa.' },
        { id: 'd', text: 'Pôr um ! depois de pontos.', porque: 'O ! trata de nulo, e pontos não é nulo. O mapa só não é algo que o for-in percorra.' },
      ]},
      explanation: 'O mapa obriga a escolher o que percorrer: entries dá cada par, com key e value.',
    },
    {
      id: 'DT-M4-Q5', type: 'true_false',
      prompt: 'lista.where((n) => n > 5) devolve uma nova List com os itens maiores que 5.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O where devolve um iterável, que se escreve entre parênteses. Para ter uma List, é preciso chamar toList().' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'where e map devolvem iteráveis: print mostra (6, 7), e toList() mostra [6, 7].',
    },
    {
      id: 'DT-M4-Q6', type: 'true_false',
      prompt: 'Um parâmetro nomeado de tipo sem ?, sem required e sem valor padrão é recusado pelo compilador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Sem required e sem padrão, ele ficaria nulo quando ninguém o passasse, e o tipo sem ? não aceita nulo.' },
      ]},
      explanation: 'As três saídas são: required, um valor padrão, ou o tipo com ?.',
    },
    {
      id: 'DT-M4-Q7', type: 'matching',
      prompt: 'Ligue cada coleção à forma como ela é escrita.',
      data: { pairs: [
        { left: 'List', right: '[\'Ana\', \'Bia\']' },
        { left: 'Set', right: '{\'Ana\', \'Bia\'}' },
        { left: 'Map', right: '{\'Ana\': 12}' },
      ]},
      explanation: 'Set e Map usam chaves; o que os distingue são os dois-pontos entre chave e valor.',
    },
  ],

  /* ── Módulo 5 — Classes e objetos ── */
  'm5-teoria': [
    {
      id: 'DT-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre classe e objeto?',
      data: { options: [
        { id: 'a', text: 'A classe é o molde; o objeto, uma coisa feita com ele.', correct: true },
        { id: 'b', text: 'A classe guarda os dados; o objeto guarda os métodos.', porque: 'Os dois vão juntos: a classe descreve dados e métodos, e cada objeto tem os seus dados e sabe fazer o que os métodos dizem.' },
        { id: 'c', text: 'Classe é a palavra do Dart; objeto, a do Python.', porque: 'As duas linguagens têm classes e objetos, com o mesmo sentido.' },
        { id: 'd', text: 'A classe roda primeiro e o objeto depois.', porque: 'Classe não roda: ela descreve. O que roda é o código que cria objetos e chama os métodos deles.' },
      ]},
      explanation: 'É a ficha de inscrição: a ficha em branco é a classe, e cada ficha preenchida é um objeto.',
    },
    {
      id: 'DT-M5-Q2', type: 'scenario',
      prompt: 'Duas fichas foram criadas com Desbravador("Ana", 10) e Desbravador("Bia", 11). O aniversário da Ana muda a idade da Bia?',
      data: { scenarios: [
        { id: 'a', text: 'Não: cada objeto tem os seus campos.', correct: true },
        { id: 'b', text: 'Sim: as duas vêm da mesma classe.', porque: 'A classe é o molde. Cada objeto feito com ele guarda os próprios valores.' },
        { id: 'c', text: 'Sim, se a idade for declarada com final.', porque: 'final impede mudar o campo, e mesmo assim cada objeto continuaria com o seu.' },
        { id: 'd', text: 'Depende da ordem em que foram criadas.', porque: 'A ordem não liga um objeto ao outro. Cada chamada ao construtor faz um objeto novo e independente.' },
      ]},
      explanation: 'Dois objetos da mesma classe têm os mesmos campos e valores diferentes.',
    },
    {
      id: 'DT-M5-Q3', type: 'multiple_choice',
      prompt: 'O que faz Desbravador(this.nome, this.idade); dentro da classe?',
      data: { options: [
        { id: 'a', text: 'Cria o construtor que preenche os dois campos.', correct: true },
        { id: 'b', text: 'Cria dois objetos, um com nome e outro com idade.', porque: 'Um construtor cria um objeto por chamada. Este recebe dois valores e os põe nos dois campos do mesmo objeto.' },
        { id: 'c', text: 'Declara dois campos novos chamados this.', porque: 'this é o objeto que está sendo criado. this.nome é o campo nome dele.' },
        { id: 'd', text: 'Chama o método nome e o método idade.', porque: 'Não há chamada nenhuma ali: é a forma curta de passar cada parâmetro direto para o campo.' },
      ]},
      explanation: 'Cada parâmetro com this. vai direto para o campo de mesmo nome.',
    },
    {
      id: 'DT-M5-Q4', type: 'scenario',
      prompt: 'O print de um objeto mostra Instance of \'Unidade\'. O que fazer para ele mostrar o nome e os pontos?',
      data: { scenarios: [
        { id: 'a', text: 'Sobrescrever o toString da classe.', correct: true },
        { id: 'b', text: 'Trocar o print por um return.', porque: 'O return devolve um valor de uma função. Quem decide como o objeto se escreve é o toString.' },
        { id: 'c', text: 'Declarar os campos com final.', porque: 'final impede mudar os campos, e não muda como o objeto aparece no print.' },
        { id: 'd', text: 'Criar o objeto com const.', porque: 'const não muda o texto do objeto. Sem toString próprio, ele continua sendo Instance of.' },
      ]},
      explanation: 'O print e a interpolação usam o mesmo método, toString.',
    },
    {
      id: 'DT-M5-Q5', type: 'true_false',
      prompt: 'Um getter, como bool get lider => pontos >= 100;, se lê sem parênteses, como um campo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É justamente o que distingue o getter: aguia.lider, sem parênteses, recalculado a cada leitura.' },
      ]},
      explanation: 'O getter é um campo calculado: ninguém precisa lembrar de atualizar um valor guardado.',
    },
    {
      id: 'DT-M5-Q6', type: 'true_false',
      prompt: 'Uma classe só pode ter um construtor.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Pode ter vários, cada um com nome: Inscricao.visitante(this.nome) ao lado do construtor principal.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O construtor com nome serve a um jeito diferente de criar o mesmo tipo de objeto.',
    },
    {
      id: 'DT-M5-Q7', type: 'matching',
      prompt: 'Ligue cada parte da classe ao que ela é.',
      data: { pairs: [
        { left: 'String nome;', right: 'Atributo' },
        { left: 'Unidade(this.nome);', right: 'Construtor' },
        { left: 'void somar(int p) { ... }', right: 'Método' },
        { left: 'bool get lider => ...', right: 'Getter' },
      ]},
      explanation: 'Atributos são os dados; construtor cria; método faz; getter calcula.',
    },
  ],

  /* ── Módulo 6 — Herança ── */
  'm6-teoria': [
    {
      id: 'DT-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é herança?',
      data: { options: [
        { id: 'a', text: 'Escrever uma classe a partir de outra, recebendo o que ela tem.', correct: true },
        { id: 'b', text: 'Copiar e colar o código de uma classe em outra.', porque: 'Copiar duplica o código, e as duas cópias divergem. Na herança a filha usa o que a mãe tem, sem cópia.' },
        { id: 'c', text: 'Guardar um objeto dentro de um campo de outro.', porque: 'Isso é composição, a relação "tem um". Herança é a relação "é um".' },
        { id: 'd', text: 'Passar os valores de um objeto para outro novo.', porque: 'Herança é entre classes, e não entre objetos. É a classe filha que recebe campos e métodos da mãe.' },
      ]},
      explanation: 'class Conselheiro extends Membro: o conselheiro é um membro, e além disso tem uma unidade.',
    },
    {
      id: 'DT-M6-Q2', type: 'scenario',
      prompt: 'Ao escrever class Diretor extends Membro, o compilador mostra: The superclass, \'Membro\', has no unnamed constructor that takes no arguments. O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'O construtor de Diretor entregar à mãe o que ela pede.', correct: true },
        { id: 'b', text: 'Apagar o construtor de Membro.', porque: 'Membro precisa do nome para existir. O conserto é a filha entregá-lo, com super.nome ou super(nome).' },
        { id: 'c', text: 'Trocar extends por implements.', porque: 'O problema não é a palavra da herança, e sim o construtor da filha, que não chama o da mãe.' },
        { id: 'd', text: 'Pôr @override no construtor do Diretor.', porque: '@override é para método que substitui o da mãe. Construtor não se sobrescreve.' },
      ]},
      explanation: 'O jeito curto é Diretor(super.nome); o longo, Diretor(String nome) : super(nome).',
    },
    {
      id: 'DT-M6-Q3', type: 'multiple_choice',
      prompt: 'Dentro de um método sobrescrito, o que faz super.apresentar()?',
      data: { options: [
        { id: 'a', text: 'Chama a versão do método que está na mãe.', correct: true },
        { id: 'b', text: 'Chama o próprio método de novo, sem fim.', porque: 'Chamar a si mesmo seria apresentar(). O super vai direto para a versão da classe mãe.' },
        { id: 'c', text: 'Cria um objeto novo da classe mãe.', porque: 'Nenhum objeto é criado: o mesmo objeto usa o método da mãe.' },
        { id: 'd', text: 'Apaga o método da mãe para os objetos da filha.', porque: 'Nada é apagado. A filha substitui o método para ela e pode continuar usando o da mãe por super.' },
      ]},
      explanation: 'É o jeito de acrescentar ao que a mãe faz sem copiar o que ela já fazia.',
    },
    {
      id: 'DT-M6-Q4', type: 'scenario',
      prompt: 'Uma List<Membro> guarda um Desbravador e um Diretor, e cada um sobrescreve funcao(). Ao percorrer a lista chamando funcao(), qual versão roda?',
      data: { scenarios: [
        { id: 'a', text: 'A de cada objeto: a do Desbravador e a do Diretor.', correct: true },
        { id: 'b', text: 'Sempre a de Membro, porque a lista é de Membro.', porque: 'A lista diz o que cabe nela, e não qual método roda. Cada objeto responde pela própria classe.' },
        { id: 'c', text: 'Nenhuma: o compilador recusa a lista com duas classes.', porque: 'As duas são filhas de Membro, e por isso cabem numa List<Membro>.' },
        { id: 'd', text: 'Só a do primeiro objeto, para os dois.', porque: 'Cada objeto é independente, e cada um usa o método da sua classe.' },
      ]},
      explanation: 'É o polimorfismo, e é o que o Flutter faz com cada pedaço da tela.',
    },
    {
      id: 'DT-M6-Q5', type: 'true_false',
      prompt: 'Uma classe abstrata pode ser instanciada diretamente, como qualquer outra.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O compilador recusa: The class is abstract and can\'t be instantiated. Ela existe para as filhas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A abstrata descreve o que toda filha precisa ter, e pode deixar métodos sem corpo para cada filha escrever.',
    },
    {
      id: 'DT-M6-Q6', type: 'true_false',
      prompt: 'Um objeto da classe filha cabe numa variável do tipo da classe mãe.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A filha é a mãe e mais alguma coisa, então cabe onde a mãe cabe: Membro m = Conselheiro(...) é aceito.' },
      ]},
      explanation: 'O contrário não vale: nem todo membro é conselheiro.',
    },
    {
      id: 'DT-M6-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece ao criar Conselheiro("Tio Márcio", "Falcão") com Conselheiro(super.nome, this.unidade).',
      data: { items: [
        { id: 'a', text: 'Os dois valores chegam ao construtor do Conselheiro', order: 1 },
        { id: 'b', text: 'A unidade vai para o campo do Conselheiro', order: 2 },
        { id: 'c', text: 'O nome é entregue ao construtor de Membro', order: 3 },
        { id: 'd', text: 'O objeto fica pronto, com nome e unidade', order: 4 },
      ]},
      explanation: 'O super.nome no parâmetro é o caminho curto do nome até o construtor da mãe.',
    },
  ],

  /* ── Módulo 7 — Pacotes ── */
  'm7-teoria': [
    {
      id: 'DT-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é um pacote, no Dart?',
      data: { options: [
        { id: 'a', text: 'Uma pasta de código com um pubspec.yaml.', correct: true },
        { id: 'b', text: 'Um arquivo .dart com mais de uma classe.', porque: 'Um arquivo .dart é uma biblioteca. O pacote é a pasta inteira, descrita pelo pubspec.yaml.' },
        { id: 'c', text: 'O programa já compilado, pronto para instalar.', porque: 'O compilado é um executável. Pacote é código, com nome, versão e dependências.' },
        { id: 'd', text: 'A pasta onde o Dart guarda os arquivos apagados.', porque: 'Não há relação com arquivos apagados. Pacote é a unidade de código que se publica e se usa.' },
      ]},
      explanation: 'Seu programa é um pacote, e as bibliotecas que outras pessoas publicam no pub.dev também.',
    },
    {
      id: 'DT-M7-Q2', type: 'scenario',
      prompt: 'Um programa usa sqrt(81) e o compilador mostra Method not found: \'sqrt\'. O que falta?',
      data: { scenarios: [
        { id: 'a', text: 'import \'dart:math\'; no alto do arquivo.', correct: true },
        { id: 'b', text: 'Instalar um pacote do pub.dev.', porque: 'sqrt vem junto com o Dart, na biblioteca dart:math. Basta importá-la.' },
        { id: 'c', text: 'Escrever Math.sqrt, como no JavaScript.', porque: 'No Dart a função é sqrt mesmo, solta, e só existe no arquivo que importou dart:math.' },
        { id: 'd', text: 'Declarar 81 como double.', porque: 'sqrt aceita int, e devolve double. O erro diz que o nome não foi achado.' },
      ]},
      explanation: 'Só dart:core entra sozinho. As outras bibliotecas do Dart se importam com dart: na frente.',
    },
    {
      id: 'DT-M7-Q3', type: 'multiple_choice',
      prompt: 'O que faz import \'unidade.dart\'; no alto do arquivo principal?',
      data: { options: [
        { id: 'a', text: 'Traz para ele o que o arquivo unidade.dart declara.', correct: true },
        { id: 'b', text: 'Roda o main do arquivo unidade.dart antes do principal.', porque: 'O import não roda nada: ele torna visível o que o outro arquivo declara.' },
        { id: 'c', text: 'Baixa o arquivo unidade.dart da internet.', porque: 'Import de arquivo pelo nome procura ao lado do principal, na mesma pasta.' },
        { id: 'd', text: 'Copia o texto de unidade.dart para dentro do principal.', porque: 'Nada é copiado. Os dois continuam separados, e o principal passa a enxergar o outro.' },
      ]},
      explanation: 'O que começa com sublinhado continua privado do arquivo em que foi escrito.',
    },
    {
      id: 'DT-M7-Q4', type: 'scenario',
      prompt: 'Antes de adicionar um pacote do pub.dev ao programa do clube, o que vale olhar?',
      data: { scenarios: [
        { id: 'a', text: 'Quem publica, a última versão e quantos o usam.', correct: true },
        { id: 'b', text: 'Só se o nome combina com o que se procura.', porque: 'Nome parecido é a armadilha clássica: quem publica pacote falso escolhe nomes que se confundem com os de verdade.' },
        { id: 'c', text: 'Nada: tudo o que está no pub.dev foi conferido.', porque: 'Qualquer pessoa publica no pub.dev. É o mesmo cuidado do pip na CC004.' },
        { id: 'd', text: 'Se o pacote tem a palavra Dart no nome.', porque: 'O nome não diz nada sobre a confiança. O histórico do pacote diz.' },
      ]},
      explanation: 'Um pacote passa a rodar dentro do seu programa: confie nele como confiaria em quem o escreveu.',
    },
    {
      id: 'DT-M7-Q5', type: 'true_false',
      prompt: 'A biblioteca dart:core, com print, List e String, precisa ser importada em todo arquivo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'dart:core entra sozinha em todo arquivo. As outras, como dart:math, é que precisam de import.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É por isso que print funciona sem import nenhum.',
    },
    {
      id: 'DT-M7-Q6', type: 'true_false',
      prompt: 'O comando dart pub add acrescenta a dependência ao pubspec.yaml e baixa o pacote.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É exatamente o que ele faz. Depois, o pacote se usa com import \'package:...\'.' },
      ]},
      explanation: 'Escrever à mão no pubspec.yaml também funciona, seguido de dart pub get.',
    },
    {
      id: 'DT-M7-Q7', type: 'matching',
      prompt: 'Ligue cada import ao que ele traz.',
      data: { pairs: [
        { left: 'import \'dart:math\';', right: 'max, min, sqrt e pi' },
        { left: 'import \'dart:io\';', right: 'stdin e stdout' },
        { left: 'import \'unidade.dart\';', right: 'A classe que você escreveu' },
        { left: 'import \'package:intl/intl.dart\';', right: 'Um pacote do pub.dev' },
      ]},
      explanation: 'dart: é do próprio Dart; package: é de um pacote; o nome sozinho é um arquivo seu.',
    },
  ],

  /* ── Módulo 8 — Objetos na linha de comando ── */
  'm8-teoria': [
    {
      id: 'DT-M8-Q1', type: 'multiple_choice',
      prompt: 'O que é programação orientada a objetos?',
      data: { options: [
        { id: 'a', text: 'Organizar o programa em objetos que juntam dados e comportamento.', correct: true },
        { id: 'b', text: 'Escrever o programa inteiro dentro de uma classe só.', porque: 'Uma classe só seria o oposto: a ideia é cada tipo de coisa ter a sua classe, com os seus dados.' },
        { id: 'c', text: 'Usar apenas funções que recebem e devolvem objetos prontos.', porque: 'Funções soltas mexendo em dados de longe é justamente o que a orientação a objetos troca.' },
        { id: 'd', text: 'Desenhar o programa com objetos gráficos na tela.', porque: 'Objeto aqui é um valor no programa, e não um desenho. Uma lista de inscritos também se organiza em objetos.' },
      ]},
      explanation: 'Em vez de uma lista solta e uma função que mexe nela de longe, há uma Unidade que guarda os membros e sabe acrescentar um.',
    },
    {
      id: 'DT-M8-Q2', type: 'scenario',
      prompt: 'Uma tela tem dois botões, Salvar e Sair, e cada um conta os próprios toques. Por que fazer de cada botão um objeto?',
      data: { scenarios: [
        { id: 'a', text: 'Cada um guarda o seu estado, e tocar um não mexe no outro.', correct: true },
        { id: 'b', text: 'Porque objeto é mais rápido do que variável.', porque: 'Velocidade não é o motivo. O ganho é cada botão guardar e cuidar do que é dele.' },
        { id: 'c', text: 'Porque assim os dois compartilham a mesma contagem.', porque: 'É o contrário: cada objeto tem a sua contagem, e é isso que separa os dois botões.' },
        { id: 'd', text: 'Porque botão não pode ser criado sem uma classe abstrata.', porque: 'Abstrata não é exigência. O motivo é juntar estado e comportamento de cada botão num lugar só.' },
      ]},
      explanation: 'É por isso que o Flutter é todo feito de classes: cada pedaço da tela é um objeto com o seu estado.',
    },
    {
      id: 'DT-M8-Q3', type: 'multiple_choice',
      prompt: 'Um desbravador conquista várias especialidades. Como as duas classes se relacionam?',
      data: { options: [
        { id: 'a', text: 'Desbravador guarda uma lista de Especialidade.', correct: true },
        { id: 'b', text: 'Desbravador herda de Especialidade.', porque: 'Herança é "é um". O desbravador não é uma especialidade: ele tem várias.' },
        { id: 'c', text: 'Especialidade herda de Desbravador.', porque: 'Uma especialidade não é um desbravador. A relação certa é "tem um": composição.' },
        { id: 'd', text: 'As duas não precisam se relacionar.', porque: 'Sem relação, o programa não teria como saber quem conquistou o quê.' },
      ]},
      explanation: 'A pergunta "tem um" ou "é um" decide entre composição e herança.',
    },
    {
      id: 'DT-M8-Q4', type: 'scenario',
      prompt: 'Um programa lê linhas com stdin.readLineSync() até a entrada acabar. Como ele sabe que acabou?',
      data: { scenarios: [
        { id: 'a', text: 'A leitura devolve null.', correct: true },
        { id: 'b', text: 'A leitura devolve um texto vazio.', porque: 'Texto vazio é uma linha em branco, que pode vir no meio. O fim da entrada é null.' },
        { id: 'c', text: 'O programa conta as linhas antes de ler.', porque: 'Não há como saber antes quantas linhas virão. É o null que avisa o fim.' },
        { id: 'd', text: 'Uma exceção é lançada no fim.', porque: 'Nenhuma exceção: readLineSync devolve null, e por isso o tipo dele é String?.' },
      ]},
      explanation: 'O laço clássico é while (true), com break quando a linha vier nula.',
    },
    {
      id: 'DT-M8-Q5', type: 'true_false',
      prompt: 'O tipo devolvido por stdin.readLineSync() é String?, porque a entrada pode ter acabado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É String? justamente por isso: quando a entrada acaba, não há linha para devolver.' },
      ]},
      explanation: 'Todo programa de linha de comando em Dart começa tratando esse nulo.',
    },
    {
      id: 'DT-M8-Q6', type: 'true_false',
      prompt: 'Herança é sempre melhor do que composição, porque reaproveita mais código.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Herança no lugar errado prende as duas classes. Quando a relação é "tem um", o certo é composição.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Cada uma serve a uma relação: herança para "é um", composição para "tem um".',
    },
    {
      id: 'DT-M8-Q7', type: 'ordering',
      prompt: 'Ordene uma volta do laço que lê "Ana;Nós e Amarras" da entrada.',
      data: { items: [
        { id: 'a', text: 'readLineSync devolve a linha digitada', order: 1 },
        { id: 'b', text: 'O programa confere que ela não é nula', order: 2 },
        { id: 'c', text: 'split(";") separa o nome e a especialidade', order: 3 },
        { id: 'd', text: 'O desbravador acrescenta a especialidade à lista dele', order: 4 },
      ]},
      explanation: 'Quando a linha vier nula, o laço termina e o relatório é escrito.',
    },
  ],
};
