/**
 * O passo a passo de cada verificação de Python.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada. É
 * convite, não despejo: quem está achando sozinho tem o direito de achar
 * sozinho.
 *
 * O que se escreve aqui é o caminho, e nunca a resposta. Dizer "escreva
 * `while n > 0:`" resolve o laboratório pela pessoa; dizer onde o `while` mora
 * e o que ele precisa ter para terminar ensina o que a lição queria ensinar.
 */
export const PASSOS_DE_PYTHON: Record<string, string[]> = {
  roda: [
    'Clique em Executar e leia o painel de saída.',
    'Se houver erro, comece pela última linha da mensagem: é ela que diz o tipo do problema.',
    'A linha acima dela diz em que linha do seu programa aconteceu — o número está ali.',
    'Erro de sintaxe aparece antes de o programa rodar; erro de execução aparece no meio dele.',
  ],
  saidaEsperada: [
    'Compare o painel de saída com o que o enunciado pede, linha por linha.',
    'Confira a ordem: um print fora de lugar muda tudo, e o programa não acusa nada.',
    'Confira o texto exato, inclusive maiúsculas e acentos.',
    'Se a diferença for num número, o problema costuma estar na conta, e não no print.',
  ],
  classificouAsFalhas: [
    'A pergunta não é onde o erro está: é quando ele apareceu.',
    'Erro de sintaxe aparece antes de qualquer coisa rodar — o Python recusa o arquivo e nenhuma linha sai.',
    'Erro de execução aparece no meio: o programa escreve o que já tinha para escrever e para com uma mensagem.',
    'Erro de lógica não aparece nunca. O programa vai até o fim, sem reclamar, e a resposta é que está errada.',
    'Se ficou em dúvida entre dois, releia o sintoma e pergunte: o Python chegou a reclamar?',
  ],
  leEExibe: [
    'Use input() para pedir um dado. O que estiver entre parênteses aparece antes do cursor.',
    'input() sempre devolve texto. Para fazer conta, converta: int(input(...)) ou float(input(...)).',
    'Use print() para mostrar o resultado.',
    'O campo de entrada, ao lado, é de onde o input() vai ler — uma linha por chamada.',
  ],
  tipoInteiro: [
    'Um número inteiro é escrito sem casas decimais: idade = 12.',
    'Vindo do teclado, ele precisa ser convertido: idade = int(input("Idade: ")).',
  ],
  tipoDecimal: [
    'Em Python a casa decimal é ponto, e não vírgula: altura = 1.75.',
    'Vindo do teclado: altura = float(input("Altura: ")).',
  ],
  tipoTexto: [
    'Texto vai entre aspas: nome = "Raphael". Aspas simples ou duplas, desde que a que abre feche.',
    'O que input() devolve já é texto — atribuí-lo a uma variável também conta.',
  ],
  tipoBooleano: [
    'São dois valores só: True e False.',
    'A primeira letra é maiúscula. Escrito true, o Python entende um nome de variável que não existe.',
  ],
  operadorAritmetico: [
    'São +, -, *, / e também % para o resto e ** para a potência.',
    'A divisão / devolve decimal mesmo quando dá exato: 10 / 2 é 5.0.',
    'Para divisão inteira, use //.',
  ],
  operadorComparacao: [
    'São ==, !=, <, >, <= e >=.',
    'Um sinal de igual atribui; dois comparam. É o engano mais comum, e o Python acusa: um erro de sintaxe dentro do if.',
  ],
  condicionalCompleto: [
    'O conjunto é if, depois elif, depois else — nessa ordem.',
    'O elif só é testado quando o if deu falso; o else vale quando nenhum dos dois deu certo.',
    'Cada um precisa ter algo dentro. Um ramo com só "pass" não faz nada.',
    'Repare nos dois-pontos no fim da linha e no recuo do que vem embaixo: em Python o recuo é a estrutura.',
  ],
  lacoFor: [
    'O for percorre uma sequência: for i in range(5): repete cinco vezes, com i valendo 0, 1, 2, 3 e 4.',
    'Também percorre texto e lista: for letra in nome:',
    'O que se repete é o que está recuado embaixo dele.',
  ],
  lacoWhile: [
    'O while repete enquanto a condição for verdadeira: while n > 0:',
    'Alguma coisa dentro dele precisa mudar a variável que a condição testa — senão ele nunca para.',
    'Um while que não termina é encerrado depois de alguns segundos, e o painel avisa.',
  ],
  quarentaLinhas: [
    'Linha em branco e linha só de comentário não contam: o requisito é de programa.',
    'Se está curto, o caminho não é encher — é o programa fazer mais: pedir mais dados, tratar mais casos, mostrar um resumo no fim.',
  ],
};
