import type { Question } from '../types';

/*
 * As questões das lições de teoria da vereda de Python.
 *
 * A definição vale uma vez, e as outras medem entendimento: consequência,
 * discriminação entre o que se confunde, e diagnóstico. Em Python o diagnóstico
 * é o que mais rende, porque a linguagem tem duas naturezas — a que reclama alto
 * e para o programa, e a que não reclama nada e devolve o número errado. Saber
 * de qual das duas se trata é metade do trabalho de consertar.
 *
 * Toda alternativa errada diz **por que** está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum — é o que `qualidade.test.ts` cobra.
 */

export const QUESTOES_DE_PYTHON: Record<string, Question[]> = {
  'm1-teoria': [
    {
      id: 'PY-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é o interpretador do Python?',
      data: { options: [
        { id: 'a', text: 'O programa que lê o seu arquivo .py e faz o que está escrito nele.', correct: true },
        { id: 'b', text: 'O editor onde você digita o programa.', porque: 'O editor só guarda o texto. Dá para escrever Python no Bloco de Notas, que não interpreta nada.' },
        { id: 'c', text: 'O site onde os programas em Python ficam publicados.', porque: 'Não há site nenhum no meio: o arquivo fica no seu computador e roda nele.' },
        { id: 'd', text: 'A parte do programa que mostra o resultado na tela.', porque: 'Quem mostra é o print(), e ele é uma instrução dentro do programa — não é quem executa o programa.' },
      ]},
      explanation: 'Escrever e executar são dois momentos: o editor guarda o texto, o interpretador o executa.',
    },
    {
      id: 'PY-M1-Q2', type: 'multiple_choice',
      prompt: 'No Scratch não existe erro de sintaxe. Por quê?',
      data: { options: [
        { id: 'a', text: 'O bloco só encaixa onde faz sentido, então não dá para escrever algo malformado.', correct: true },
        { id: 'b', text: 'O Scratch corrige sozinho o que está errado antes de rodar.', porque: 'Ele não corrige nada. Um programa em blocos pode estar completamente errado na lógica e rodar assim mesmo.' },
        { id: 'c', text: 'Porque projetos em Scratch são pequenos demais para dar erro.', porque: 'Há projetos enormes em Scratch. O tamanho não tem relação com a existência de erro de sintaxe.' },
        { id: 'd', text: 'Porque o Scratch avisa em voz alta quando um bloco está no lugar errado.', porque: 'Nada avisa. Bloco no lugar errado é a fonte de vários defeitos, e todos silenciosos.' },
      ]},
      explanation: 'A forma da peça é a sintaxe. Escrevendo, essa garantia acaba — e a linguagem passa a recusar o que não entende.',
    },
    {
      id: 'PY-M1-Q3', type: 'true_false',
      prompt: 'Em Python, Nome e nome são a mesma variável.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A linguagem distingue maiúscula de minúscula. As duas são variáveis diferentes, e usar uma esperando a outra dá NameError.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Maiúscula conta. É por isso que Print(...) não funciona: o nome da função é print, tudo minúsculo.',
    },
    {
      id: 'PY-M1-Q4', type: 'ordering',
      prompt: 'Ordene o que acontece entre escrever e ver o resultado.',
      data: { items: [
        { id: 'a', text: 'Você digita o programa no editor', order: 1 },
        { id: 'b', text: 'Você salva o arquivo com o nome terminando em .py', order: 2 },
        { id: 'c', text: 'Você pede ao interpretador que leia esse arquivo', order: 3 },
        { id: 'd', text: 'O interpretador executa linha por linha e o resultado aparece', order: 4 },
      ]},
      explanation: 'Salvar não executa nada. É o passo esquecido em "consertei e continua igual": o interpretador lê o disco, não a tela.',
    },
    {
      id: 'PY-M1-Q5', type: 'scenario',
      prompt: 'Você achou o erro, corrigiu a linha no editor e pediu para rodar de novo. A mesma mensagem apareceu, apontando a mesma linha. O que aconteceu?',
      data: { scenarios: [
        { id: 'a', text: 'O arquivo não foi salvo: o interpretador leu o que está no disco.', correct: true },
        { id: 'b', text: 'O Python guardou a versão antiga em memória e precisa ser reiniciado.', porque: 'Ele lê o arquivo do zero a cada execução. Não há versão guardada de antes.' },
        { id: 'c', text: 'A correção estava certa, mas o erro só some depois de rodar duas vezes.', porque: 'Erro corrigido some na execução seguinte. Não existe atraso de uma rodada.' },
        { id: 'd', text: 'O editor precisa fechar o arquivo para que a mudança valha.', porque: 'Basta salvar. Fechar o arquivo salva junto, e é por isso que às vezes parece que foi fechar que resolveu.' },
      ]},
      explanation: 'Escrever e executar são dois momentos. O interpretador lê o que está gravado, e não o que está na tela do editor — é a causa mais comum de "consertei e continua igual".',
    },
    {
      id: 'PY-M1-Q6', type: 'multiple_choice',
      prompt: 'Um programa em Python é, no disco, o quê?',
      data: { options: [
        { id: 'a', text: 'Um arquivo de texto terminado em .py.', correct: true },
        { id: 'b', text: 'Um programa executável, pronto para abrir com dois cliques.', porque: 'Executável é o resultado de outras linguagens. O arquivo .py continua sendo texto, e quem o executa é o interpretador.' },
        { id: 'c', text: 'Um arquivo que só o editor de código consegue abrir.', porque: 'Ele abre até no Bloco de Notas: é texto puro, sem formato próprio.' },
        { id: 'd', text: 'Um projeto com várias pastas, criadas na instalação.', porque: 'Um programa pequeno cabe num arquivo só. Pastas aparecem quando o projeto cresce, e não por exigência da linguagem.' },
      ]},
      explanation: 'Nada de especial: texto, gravado em disco. É o interpretador que lhe dá vida, lendo-o de cima para baixo, uma linha por vez.',
    },
    {
      id: 'PY-M1-Q7', type: 'true_false',
      prompt: 'A linha que começa com # é lida pelo Python e muda o que o programa faz.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O que vem depois do # é comentário: o Python pula a linha inteira. Ela existe para quem lê o código.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Comentário serve para explicar por que algo está ali. Repetir o que o código já diz só faz o arquivo crescer.',
    },
  ],

  'm2-teoria': [
    {
      id: 'PY-M2-Q1', type: 'multiple_choice',
      prompt: 'O que faz a linha placar = placar + 1?',
      data: { options: [
        { id: 'a', text: 'Calcula o valor atual mais um e guarda o resultado de volta em placar.', correct: true },
        { id: 'b', text: 'Pergunta se placar é igual a placar mais um.', porque: 'Um sinal de igual guarda; quem pergunta são dois. A pergunta seria placar == placar + 1, e a resposta seria sempre não.' },
        { id: 'c', text: 'Dá erro, porque a variável aparece dos dois lados.', porque: 'É uma linha comum e válida: o Python calcula a direita primeiro, e só depois guarda na esquerda.' },
        { id: 'd', text: 'Cria uma segunda variável chamada placar.', porque: 'O nome é o mesmo, então é a mesma variável. Ela apenas passa a guardar outro valor.' },
      ]},
      explanation: 'O igual é uma ordem, não uma pergunta: "guarde à esquerda o que está à direita".',
    },
    {
      id: 'PY-M2-Q2', type: 'multiple_choice',
      prompt: 'Um programa faz print("12" + "3"). O que aparece na tela?',
      data: { options: [
        { id: 'a', text: '123', correct: true },
        { id: 'b', text: '15', porque: 'Seriam 15 se os dois fossem números. Entre aspas eles são texto, e somar texto junta em vez de somar.' },
        { id: 'c', text: 'Um erro, porque não dá para somar texto.', porque: 'Somar dois textos é permitido e não dá erro nenhum — é justamente por isso que a armadilha é difícil de ver.' },
        { id: 'd', text: '"12" + "3", exatamente como está escrito.', porque: 'O que está fora das aspas é código e é executado. Só o que está dentro das aspas é mostrado como texto.' },
      ]},
      explanation: 'Aspas mudam tudo. Quando um número sai estranho, a primeira pergunta é se ele é número mesmo.',
    },
    {
      id: 'PY-M2-Q3', type: 'multiple_choice',
      prompt: 'Você quer guardar a altura 1,58 numa variável. Como se escreve em Python?',
      data: { options: [
        { id: 'a', text: 'altura = 1.58', correct: true },
        { id: 'b', text: 'altura = 1,58', porque: 'A vírgula não é casa decimal para o Python: ele lê dois valores separados. A altura vira um par, e a conta seguinte sai errada sem avisar.' },
        { id: 'c', text: 'altura = "1.58"', porque: 'Entre aspas vira texto. Ele aparece igual na tela e não serve para conta nenhuma.' },
        { id: 'd', text: 'float altura = 1.58', porque: 'Em Python não se declara o tipo antes do nome. O tipo vem do valor que se guarda.' },
      ]},
      explanation: 'Casa decimal é ponto. É a diferença de escrita que mais custa caro para quem escreve em português.',
    },
    {
      id: 'PY-M2-Q4', type: 'matching',
      prompt: 'Ligue cada valor ao tipo dele.',
      data: { pairs: [
        { left: '12', right: 'int — número inteiro' },
        { left: '1.75', right: 'float — número com casas decimais' },
        { left: '"Ana"', right: 'str — texto' },
        { left: 'True', right: 'bool — verdadeiro ou falso' },
      ]},
      explanation: 'Quatro tipos bastam para a vereda inteira. O que decide não é como o valor aparece na tela, é como ele foi escrito.',
    },
    {
      id: 'PY-M2-Q5', type: 'scenario',
      prompt: 'O programa para na primeira linha que usa total e mostra NameError. A linha parece certa. O que procurar?',
      data: { scenarios: [
        { id: 'a', text: 'Um lugar antes dela guardando algo em total — que não existe.', correct: true },
        { id: 'b', text: 'Um erro de conta na expressão, que o Python não conseguiu calcular.', porque: 'Conta impossível dá outra mensagem. NameError fala de nome, e diz que aquele nome nunca foi definido.' },
        { id: 'c', text: 'O tipo de total, que precisa ser declarado antes do primeiro uso.', porque: 'Python não pede declaração de tipo. O que falta é guardar um valor, e não anunciar qual será.' },
        { id: 'd', text: 'Um recuo a mais na linha, que a tirou do bloco certo.', porque: 'Recuo errado dá erro de sintaxe ou muda o que roda. Aqui o Python chegou a executar e não encontrou o nome.' },
      ]},
      explanation: 'O Python não supõe zero para o que não existe: ele avisa. E o aviso quase sempre aponta para uma linha de atribuição esquecida, ou para o nome escrito de dois jeitos diferentes.',
    },
    {
      id: 'PY-M2-Q6', type: 'multiple_choice',
      prompt: 'O programa guardou altura = 1,58 e não deu erro nenhum, mas as contas com altura saem estranhas. O que foi guardado ali?',
      data: { options: [
        { id: 'a', text: 'Dois valores separados por vírgula, e não um número decimal.', correct: true },
        { id: 'b', text: 'O número 158, porque a vírgula foi descartada na leitura.', porque: 'Nada é descartado. A vírgula separa valores em Python, e o resultado deixa de ser um número só.' },
        { id: 'c', text: 'O texto "1,58", que depois falha em qualquer conta.', porque: 'Texto exigiria aspas. Sem elas, a vírgula continua sendo separador.' },
        { id: 'd', text: 'O número 1.58, porque o Python aceita as duas escritas.', porque: 'Ele aceita só o ponto como casa decimal. A vírgula tem outro papel na linguagem.' },
      ]},
      explanation: 'A casa decimal é ponto. Escrever com vírgula não estoura na hora — estoura numa conta mais adiante, que é bem pior de achar.',
    },
    {
      id: 'PY-M2-Q7', type: 'true_false',
      prompt: 'Somar "12" e "3", com aspas nos dois, dá erro e o programa para.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Somar textos junta os dois: sai "123", sem mensagem nenhuma, e o programa segue com um número errado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É o defeito silencioso desta vereda: nada acusa. Quando um número sair estranho, a primeira pergunta é se aquilo é número mesmo.',
    },
  ],

  'm3-teoria': [
    {
      id: 'PY-M3-Q1', type: 'multiple_choice',
      prompt: 'Alguém digita 12 quando o programa executa idade = input("Idade: "). O que fica guardado em idade?',
      data: { options: [
        { id: 'a', text: 'O texto "12".', correct: true },
        { id: 'b', text: 'O número 12.', porque: 'input() sempre devolve texto, mesmo quando o que se digitou parece número. Para virar número é preciso converter com int().' },
        { id: 'c', text: 'Nada: input() só mostra a pergunta.', porque: 'input() mostra a pergunta e devolve o que foi digitado. É justamente esse valor de retorno que se guarda.' },
        { id: 'd', text: 'Depende: número se for número, texto se for texto.', porque: 'Não depende de nada. O tipo devolvido por input() é sempre texto, e é isso que o torna previsível.' },
      ]},
      explanation: 'input() devolve texto, sempre. É a origem da maior parte das contas erradas de quem começa.',
    },
    {
      id: 'PY-M3-Q2', type: 'multiple_choice',
      prompt: 'Por que print("Pontos: " + 15) dá erro e print("Pontos:", 15) funciona?',
      data: { options: [
        { id: 'a', text: 'O mais exige que os dois lados sejam do mesmo tipo; a vírgula aceita tipos diferentes.', correct: true },
        { id: 'b', text: 'Porque print() não aceita números, só texto.', porque: 'print() aceita números sem problema. O erro está na soma entre texto e número, antes de o print receber qualquer coisa.' },
        { id: 'c', text: 'Porque faltam aspas em volta do 15.', porque: 'Com aspas funcionaria, mas a versão com vírgula funciona sem elas — logo, aspas não é a explicação.' },
        { id: 'd', text: 'Porque a vírgula converte tudo para texto antes de somar.', porque: 'A vírgula não soma nada: ela passa dois valores separados para o print, que os escreve com um espaço entre eles.' },
      ]},
      explanation: 'Vírgula separa argumentos; mais soma valores. A mensagem do erro é TypeError, e o nome já diz o assunto.',
    },
    {
      id: 'PY-M3-Q3', type: 'true_false',
      prompt: 'Em Python, o recuo à esquerda é apenas estético: o programa roda igual sem ele.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Em Python o recuo é a sintaxe: é ele que diz o que está dentro do bloco. Sem recuo, o programa nem chega a rodar — dá IndentationError.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que no Scratch era a boca do bloco, aqui é o espaço à esquerda.',
    },
    {
      id: 'PY-M3-Q4', type: 'multiple_choice',
      prompt: 'Você quer ler a idade e somar 1. Qual linha faz isso certo?',
      data: { options: [
        { id: 'a', text: 'idade = int(input("Idade: "))', correct: true },
        { id: 'b', text: 'idade = input("Idade: ")', porque: 'Lê certo, mas o que chega é texto. Somar 1 a texto dá TypeError na linha seguinte.' },
        { id: 'c', text: 'idade = int("Idade: ")', porque: 'Isto tenta converter a própria pergunta em número, e para o programa com ValueError. Ninguém chega a digitar nada.' },
        { id: 'd', text: 'int(idade) = input("Idade: ")', porque: 'O lado esquerdo do igual tem de ser um nome. Uma conversão ali é erro de sintaxe.' },
      ]},
      explanation: 'Lê-se de dentro para fora: primeiro input pergunta, depois int converte o que voltou.',
    },
    {
      id: 'PY-M3-Q5', type: 'multiple_choice',
      prompt: 'Alguém digitou "doze" onde o programa esperava um número, e ele parou com ValueError. Como se deve entender isso?',
      data: { options: [
        { id: 'a', text: 'O programa recusou um dado que não serve, em vez de calcular errado.', correct: true },
        { id: 'b', text: 'É um defeito do programa: ele deveria aceitar o número por extenso.', porque: 'Converter palavra em número é outro trabalho, e ninguém o pediu. Parar ali é o comportamento correto.' },
        { id: 'c', text: 'É um erro de sintaxe, e o programa nem chegou a rodar.', porque: 'Ele rodou até a linha da conversão. Erro de sintaxe apareceria antes de qualquer linha executar.' },
        { id: 'd', text: 'A conversão falhou porque o texto estava entre aspas.', porque: 'Tudo o que vem do teclado é texto. O que a conversão recusa é o conteúdo, e não as aspas.' },
      ]},
      explanation: 'Recusar é melhor do que seguir com um valor sem sentido. Um programa que continua com dado ruim erra silenciosamente, mais adiante e longe da causa.',
    },
    {
      id: 'PY-M3-Q6', type: 'scenario',
      prompt: 'Dentro de um for você escreveu duas linhas: a primeira com quatro espaços à esquerda e a segunda com dois. O que o Python faz?',
      data: { scenarios: [
        { id: 'a', text: 'Recusa o arquivo com IndentationError, antes de rodar qualquer coisa.', correct: true },
        { id: 'b', text: 'Roda as duas, porque qualquer recuo indica que estão dentro do laço.', porque: 'O que decide não é haver recuo: é as linhas do mesmo bloco terem o mesmo recuo.' },
        { id: 'c', text: 'Roda só a primeira, e a segunda fica fora do laço.', porque: 'Fosse assim, o programa rodaria com um comportamento diferente do escrito. Ele nem chega a começar.' },
        { id: 'd', text: 'Ajusta a segunda linha ao recuo da primeira e segue.', porque: 'O Python não corrige recuo. Ele recusa o arquivo e diz onde a conta não fechou.' },
      ]},
      explanation: 'Em Python o recuo é a estrutura, e não a aparência. Ser chato aqui é o que garante que o desenho na tela seja a estrutura de verdade.',
    },
    {
      id: 'PY-M3-Q7', type: 'true_false',
      prompt: 'Escrever idade = input("Idade: ") e logo depois idade + 1 funciona quando a pessoa digita um número.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O input devolve texto mesmo quando se digita 12. Somar 1 a um texto para o programa: é preciso converter antes, com int().' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O input sempre devolve texto. Quando o que se pede é número, a conversão vem junto: int(input("Idade: ")), lido de dentro para fora.',
    },
  ],

  'm4-teoria': [
    {
      id: 'PY-M4-Q1', type: 'multiple_choice',
      prompt: 'Qual é o resultado de 10 // 3?',
      data: { options: [
        { id: 'a', text: '3', correct: true },
        { id: 'b', text: '3.3333333333333335', porque: 'Esse é o resultado de 10 / 3, com uma barra. Duas barras jogam fora a parte decimal.' },
        { id: 'c', text: '1', porque: '1 é o resto da divisão, que se obtém com 10 % 3. As duas barras dão o quociente inteiro.' },
        { id: 'd', text: '3.0', porque: 'O resultado de // entre dois inteiros é inteiro, sem o ponto zero. Quem devolve decimal é a barra única.' },
      ]},
      explanation: 'Três divisões, três respostas: / dá decimal, // dá a parte inteira, % dá o resto.',
    },
    {
      id: 'PY-M4-Q2', type: 'multiple_choice',
      prompt: 'Como se pergunta se um número guardado em n é par?',
      data: { options: [
        { id: 'a', text: 'n % 2 == 0', correct: true },
        { id: 'b', text: 'n / 2 == 0', porque: 'Isso pergunta se o número dividido por dois dá zero, o que só acontece quando n é zero.' },
        { id: 'c', text: 'n // 2 == 0', porque: 'Isso pergunta se a metade inteira é zero, o que é verdade para 0 e 1 apenas.' },
        { id: 'd', text: 'n % 2 = 0', porque: 'Um igual guarda, e do lado esquerdo há uma conta e não um nome — é erro de sintaxe. A pergunta precisa de dois iguais.' },
      ]},
      explanation: 'Par é o que sobra zero ao dividir por dois. O resto é o operador mais útil que parece inútil.',
    },
    {
      id: 'PY-M4-Q3', type: 'multiple_choice',
      prompt: 'Em Python, escrever if nota = 7: produz o quê?',
      data: { options: [
        { id: 'a', text: 'Erro de sintaxe: o programa não chega a rodar.', correct: true },
        { id: 'b', text: 'Guarda 7 em nota e entra no if.', porque: 'É o que acontece em outras linguagens, e é exatamente o desastre que o Python evita ao recusar a linha.' },
        { id: 'c', text: 'Nada: a linha é ignorada em silêncio.', porque: 'Python não ignora linhas. Ou ele entende, ou recusa o arquivo inteiro dizendo onde parou.' },
        { id: 'd', text: 'Erro de execução, no momento em que o if é alcançado.', porque: 'Erro de sintaxe aparece antes de qualquer linha rodar. Se fosse de execução, o programa teria escrito o que vinha antes.' },
      ]},
      explanation: 'Aqui recusar é um favor: em várias linguagens essa linha é aceita e destrói a lógica em silêncio.',
    },
    {
      id: 'PY-M4-Q4', type: 'true_false',
      prompt: 'O resultado de uma comparação como nota >= 6 é um valor que pode ser guardado numa variável.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A comparação devolve True ou False, que são valores como qualquer outro: dá para guardar, imprimir e comparar de novo.' },
      ]},
      explanation: 'É o tipo bool. Comparação não é uma construção especial: é uma conta cujo resultado é verdadeiro ou falso.',
    },
    {
      id: 'PY-M4-Q5', type: 'scenario',
      prompt: 'O programa divide 10 por 2 para dizer quantas barracas serão montadas e escreve na tela "5.0 barracas". Como corrigir?',
      data: { scenarios: [
        { id: 'a', text: 'Usar a divisão que descarta a parte decimal, com duas barras.', correct: true },
        { id: 'b', text: 'Nada: 5.0 e 5 são o mesmo número, e a tela pode mostrar assim.', porque: 'São o mesmo valor e não a mesma leitura. Ninguém monta 5.0 barracas, e o número na tela é o que se lê.' },
        { id: 'c', text: 'Multiplicar por 1 depois da divisão, para voltar a inteiro.', porque: 'Multiplicar por um não muda o tipo: continua decimal, agora com uma conta a mais.' },
        { id: 'd', text: 'Trocar a divisão pelo resto, que devolve inteiro.', porque: 'O resto devolve o que sobra da divisão, e não o resultado dela. Aqui daria zero.' },
      ]},
      explanation: 'A divisão com uma barra devolve decimal mesmo quando a conta é exata. Para contagem de coisas, é a de duas barras que se quer.',
    },
    {
      id: 'PY-M4-Q6', type: 'multiple_choice',
      prompt: 'Por que comparar decimais com dois sinais de igual costuma dar resposta inesperada?',
      data: { options: [
        { id: 'a', text: 'Porque o computador guarda decimais por aproximação.', correct: true },
        { id: 'b', text: 'Porque a comparação de igualdade só funciona com números inteiros.', porque: 'Ela funciona com decimais também. O problema é o valor guardado não ser exatamente o que se escreveu.' },
        { id: 'c', text: 'Porque decimais são guardados como texto e comparados letra por letra.', porque: 'Texto e decimal são tipos diferentes. Comparação de texto é outra coisa, e essa sim é letra por letra.' },
        { id: 'd', text: 'Porque o Python arredonda os dois lados antes de comparar.', porque: 'Ele não arredonda nada. Compara os valores como estão guardados, aproximação e tudo.' },
      ]},
      explanation: 'Somar um décimo com dois décimos não dá exatamente três décimos para a máquina. Com decimal, prefira maior-ou-igual e menor-ou-igual.',
    },
    {
      id: 'PY-M4-Q7', type: 'true_false',
      prompt: 'Comparar "ana" com "Ana" usando dois sinais de igual responde que são iguais.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A comparação é caractere por caractere, e maiúscula e minúscula são caracteres diferentes.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a mesma sensibilidade a maiúsculas do nome das variáveis. Quem compara nome digitado precisa acertar isso antes, ou aceitar as duas formas de propósito.',
    },
  ],

  'm5-teoria': [
    {
      id: 'PY-M5-Q1', type: 'multiple_choice',
      prompt: 'Qual a diferença entre usar elif e escrever vários if seguidos?',
      data: { options: [
        { id: 'a', text: 'No elif, o primeiro que der sim encerra a série; com if separados, todos são perguntados.', correct: true },
        { id: 'b', text: 'Nenhuma: elif é só uma forma mais curta de escrever if.', porque: 'A diferença é de comportamento, e não de escrita. Com if separados, mais de um bloco pode rodar na mesma passada.' },
        { id: 'c', text: 'elif roda mais rápido, mas o resultado é o mesmo.', porque: 'O resultado pode ser diferente, e é aí que está o assunto. Velocidade não é o ponto.' },
        { id: 'd', text: 'elif só pode ser usado uma vez; if pode ser repetido.', porque: 'Dá para encadear quantos elif forem precisos, um atrás do outro.' },
      ]},
      explanation: 'Uma série de elif escolhe um caminho entre vários; if soltos são perguntas independentes.',
    },
    {
      id: 'PY-M5-Q2', type: 'multiple_choice',
      prompt: 'Um programa testa if nota >= 6: "bom" e depois elif nota >= 9: "excelente". Quem tira 9 recebe o quê?',
      data: { options: [
        { id: 'a', text: 'Recebe "bom", e "excelente" nunca acontece.', correct: true },
        { id: 'b', text: 'Recebe "excelente", porque é a condição mais específica.', porque: 'O Python não escolhe a mais específica: ele pergunta na ordem e para no primeiro sim. 9 já satisfaz o primeiro teste.' },
        { id: 'c', text: 'Recebe os dois, um depois do outro.', porque: 'Numa série de elif só um bloco roda. Receber os dois exigiria dois if independentes.' },
        { id: 'd', text: 'Dá erro, porque as duas condições se sobrepõem.', porque: 'Condições que se sobrepõem são comuns e não dão erro nenhum — é justamente por isso que a ordem errada passa despercebida.' },
      ]},
      explanation: 'A ordem faz parte da lógica: o mais restritivo primeiro, o mais largo depois.',
    },
    {
      id: 'PY-M5-Q3', type: 'multiple_choice',
      prompt: 'Você quer aceitar idades de 10 a 15. Qual linha faz isso?',
      data: { options: [
        { id: 'a', text: 'if 10 <= idade <= 15:', correct: true },
        { id: 'b', text: 'if idade >= 10 or 15:', porque: 'O lado direito do or é só o número 15, que o Python considera verdadeiro — a condição inteira passa a ser sempre verdadeira.' },
        { id: 'c', text: 'if idade >= 10 or idade <= 15:', porque: 'Com or, qualquer idade satisfaz um dos dois lados. Aceita 3 e aceita 90. O que se quer aqui é and.' },
        { id: 'd', text: 'if idade == 10 and idade == 15:', porque: 'Nenhum número é 10 e 15 ao mesmo tempo, então essa condição nunca é verdadeira.' },
      ]},
      explanation: 'Cada lado de um and ou or precisa ser uma comparação inteira. A cadeia 10 <= idade <= 15 diz a mesma coisa e lê melhor.',
    },
    {
      id: 'PY-M5-Q4', type: 'true_false',
      prompt: 'Um if cujo bloco contém apenas pass cumpre o requisito de usar uma estrutura condicional.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A palavra-chave está na tela e nada é decidido: é o laço vazio da CC001 com outro nome. A verificação exige um corpo que faça alguma coisa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que se cobra é sempre o que a estrutura faz, e nunca que ela esteja escrita.',
    },
    {
      id: 'PY-M5-Q5', type: 'scenario',
      prompt: 'Você quis aceitar idades de 10 a 15 e escreveu if idade >= 10 or 15. Todo mundo passou, inclusive quem tem 40. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'O Python lê o 15 sozinho, e um número solto vale como verdadeiro.', correct: true },
        { id: 'b', text: 'O or aceita qualquer idade porque basta um lado ser verdadeiro.', porque: 'Essa é a regra do or, e ela está certa. O defeito é o segundo lado não ser uma comparação: ele é sempre verdadeiro.' },
        { id: 'c', text: 'Faltou converter a idade para número antes de comparar.', porque: 'Sem conversão a comparação daria erro de tipo. Aqui ela roda e sempre responde sim.' },
        { id: 'd', text: 'O and é que serve para faixas, e o or nunca funciona com números.', porque: 'O or funciona bem quando os dois lados são comparações. Trocar por and sem escrever a segunda comparação repetiria o erro.' },
      ]},
      explanation: 'Cada lado precisa ser uma comparação inteira. O que se queria escrever é 10 <= idade <= 15 — que lê como se escreveria à mão.',
    },
    {
      id: 'PY-M5-Q6', type: 'multiple_choice',
      prompt: 'Por que a pergunta mais restritiva vem primeiro numa série de elif?',
      data: { options: [
        { id: 'a', text: 'Porque o primeiro que der sim encerra a série, e os de baixo nem são olhados.', correct: true },
        { id: 'b', text: 'Porque o Python exige que as condições estejam em ordem decrescente.', porque: 'Ele aceita qualquer ordem, e é justamente por isso que a ordem errada não estoura.' },
        { id: 'c', text: 'Porque a última condição da série é a que sempre vence.', porque: 'É o contrário: quem vence é a primeira que der sim. As seguintes nem chegam a ser perguntadas.' },
        { id: 'd', text: 'Porque o else precisa vir logo depois da condição mais larga.', porque: 'O else fecha a série de qualquer jeito. O que decide o resultado é a ordem das perguntas antes dele.' },
      ]},
      explanation: 'Com a faixa larga em cima, a estreita nunca acontece: quem tirou nove entra no "bom" e "excelente" some. O programa roda, sem erro nenhum, e a nota mais alta desaparece.',
    },
    {
      id: 'PY-M5-Q7', type: 'true_false',
      prompt: 'Trocar uma série de elif por vários if seguidos dá sempre o mesmo resultado.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Com if independentes, todos são perguntados e mais de um pode rodar. A série de elif para no primeiro sim.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Numa série de faixas que se sobrepõem, os if soltos imprimem duas respostas para a mesma nota. É a diferença entre caminhos alternativos e perguntas independentes.',
    },
  ],

  'm6-teoria': [
    {
      id: 'PY-M6-Q1', type: 'multiple_choice',
      prompt: 'Quantas voltas dá for i in range(4):, e quanto vale i na última?',
      data: { options: [
        { id: 'a', text: 'Quatro voltas, e na última i vale 3.', correct: true },
        { id: 'b', text: 'Quatro voltas, e na última i vale 4.', porque: 'range para antes do número dado. O 4 nunca chega a ser usado — a última volta é com 3.' },
        { id: 'c', text: 'Cinco voltas, de 0 a 4.', porque: 'Seriam cinco se o 4 entrasse. range(4) produz 0, 1, 2 e 3: quatro valores.' },
        { id: 'd', text: 'Três voltas, de 1 a 3.', porque: 'A contagem começa em zero, e não em um. Para começar em 1 seria range(1, 5).' },
      ]},
      explanation: 'Contar a partir de zero é a convenção de quase toda a programação, e o erro de contagem mais comum que existe.',
    },
    {
      id: 'PY-M6-Q2', type: 'multiple_choice',
      prompt: 'Em que situação o while é a escolha certa, e o for não serve bem?',
      data: { options: [
        { id: 'a', text: 'Quando não se sabe de antemão quantas voltas serão precisas.', correct: true },
        { id: 'b', text: 'Quando o número de voltas é grande.', porque: 'Tamanho não muda a escolha: for percorre um milhão de itens tão bem quanto três.' },
        { id: 'c', text: 'Quando é preciso usar a variável do laço dentro do bloco.', porque: 'O for também dá uma variável a cada volta — é justamente o que o item entre for e in faz.' },
        { id: 'd', text: 'Quando o bloco precisa de mais de uma linha.', porque: 'Os dois aceitam blocos de qualquer tamanho. O número de linhas não decide nada.' },
      ]},
      explanation: 'A pergunta é "quantas vezes?". Se dá para responder antes de começar, é for; se a resposta é "até que…", é while.',
    },
    {
      id: 'PY-M6-Q3', type: 'true_false',
      prompt: 'Um while cuja condição nunca fica falsa continua rodando até alguém encerrar o programa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Nada faz o laço parar sozinho. No laboratório a plataforma encerra depois de alguns segundos; no computador do clube, a janela trava.' },
      ]},
      explanation: 'Quem tem de fazer a condição virar falsa é alguma coisa dentro do bloco. É a responsabilidade que o for não tem.',
    },
    {
      id: 'PY-M6-Q4', type: 'ordering',
      prompt: 'Ordene o que o Python faz a cada volta de um while.',
      data: { items: [
        { id: 'a', text: 'Confere a condição', order: 1 },
        { id: 'b', text: 'Se a resposta for verdadeira, executa o bloco de dentro', order: 2 },
        { id: 'c', text: 'Chegando ao fim do bloco, volta para o topo do while', order: 3 },
        { id: 'd', text: 'Quando a condição responde falso, segue na primeira linha depois do laço', order: 4 },
      ]},
      explanation: 'A condição é conferida antes de cada volta. Se já começar falsa, o bloco não roda nenhuma vez.',
    },
    {
      id: 'PY-M6-Q5', type: 'scenario',
      prompt: 'Você escreveu um while com um contador e o laboratório encerrou o programa dizendo que ele não parava. O contador está declarado antes do laço. O que faltou?',
      data: { scenarios: [
        { id: 'a', text: 'Somar ao contador dentro do bloco, para a condição virar falsa.', correct: true },
        { id: 'b', text: 'Declarar o contador dentro do laço, em vez de antes de ele começar.', porque: 'Declarado dentro, ele voltaria ao valor inicial a cada volta — e o laço nunca terminaria do mesmo jeito.' },
        { id: 'c', text: 'Um break no fim do bloco, que todo while exige.', porque: 'O break serve para sair antes da hora. Um while bem escrito termina pela própria condição.' },
        { id: 'd', text: 'Trocar a comparação por uma de igualdade exata.', porque: 'Igualdade exata é mais frágil ainda: se o contador passar do valor sem tocá-lo, o laço nunca para.' },
      ]},
      explanation: 'É a responsabilidade que o while tem e o for não: alguma coisa dentro do bloco precisa aproximar a condição do falso. Esquecer de somar o contador é o modo mais comum de não fazer isso.',
    },
    {
      id: 'PY-M6-Q6', type: 'multiple_choice',
      prompt: 'Um for percorre range(1, 5). Quantas voltas dá, e qual é o último valor?',
      data: { options: [
        { id: 'a', text: 'Quatro voltas, terminando em 4.', correct: true },
        { id: 'b', text: 'Cinco voltas, terminando em 5.', porque: 'O segundo número é onde a contagem para, e ele não entra. A série vai de 1 a 4.' },
        { id: 'c', text: 'Quatro voltas, terminando em 3.', porque: 'Terminaria em 3 se a contagem começasse em zero. Aqui o primeiro número diz onde começar: em 1.' },
        { id: 'd', text: 'Cinco voltas, terminando em 4.', porque: 'De 1 a 4 são quatro números, e o laço dá uma volta por número.' },
      ]},
      explanation: 'Com dois números, o primeiro entra e o segundo não. Com um número só, a contagem começa em zero — e é aí que mora o erro de contagem mais comum que existe.',
    },
    {
      id: 'PY-M6-Q7', type: 'true_false',
      prompt: 'Um while cuja condição já começa falsa roda o bloco uma vez antes de conferir.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele confere antes de cada volta, inclusive a primeira. Começando falsa, o bloco não roda nenhuma vez.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A pergunta vem antes do bloco. É por isso que um while pode terminar sem nunca ter executado nada — e às vezes é exatamente o que se quer.',
    },
  ],

  'm7-teoria': [
    {
      id: 'PY-M7-Q1', type: 'multiple_choice',
      prompt: 'O programa escreve as duas primeiras linhas e para com uma mensagem. De que família é esse erro?',
      data: { options: [
        { id: 'a', text: 'De execução.', correct: true },
        { id: 'b', text: 'De sintaxe.', porque: 'Se fosse de sintaxe, o Python teria recusado o arquivo e nenhuma linha teria saído — nem a primeira.' },
        { id: 'c', text: 'De lógica.', porque: 'Erro de lógica não interrompe nada: o programa vai até o fim sem mensagem, e só a resposta está errada.' },
        { id: 'd', text: 'De digitação, que é uma quarta família.', porque: 'Digitar errado é a causa, e não a família. Conforme o que se digitou, ela cai em sintaxe, execução ou lógica.' },
      ]},
      explanation: 'O que separa as três é quando o erro aparece: antes de rodar, no meio, ou nunca.',
    },
    {
      id: 'PY-M7-Q2', type: 'multiple_choice',
      prompt: 'Por que o erro de lógica é considerado o mais perigoso dos três?',
      data: { options: [
        { id: 'a', text: 'Porque nada o acusa: o programa roda até o fim e devolve uma resposta errada com toda a confiança.', correct: true },
        { id: 'b', text: 'Porque ele impede o programa de rodar.', porque: 'Quem impede o programa de rodar é o erro de sintaxe. O de lógica deixa tudo rodar.' },
        { id: 'c', text: 'Porque só aparece em programas grandes.', porque: 'Um programa de cinco linhas pode ter erro de lógica: basta dividir pelo número errado.' },
        { id: 'd', text: 'Porque a mensagem dele é difícil de entender.', porque: 'Não há mensagem nenhuma, e é exatamente isso que o torna difícil.' },
      ]},
      explanation: 'É o único que nenhuma ferramenta aponta — e o único que continua na sua vida profissional inteira.',
    },
    {
      id: 'PY-M7-Q3', type: 'multiple_choice',
      prompt: 'Numa mensagem de erro do Python, onde está o nome do erro?',
      data: { options: [
        { id: 'a', text: 'Na última linha.', correct: true },
        { id: 'b', text: 'Na primeira linha, logo depois de "Traceback".', porque: 'A primeira linha só anuncia que vem um rastro. O nome do erro fecha a mensagem, embaixo.' },
        { id: 'c', text: 'No meio, junto do número da linha.', porque: 'Ali está o caminho até o ponto da falha: o arquivo e a linha. O que aconteceu vem depois.' },
        { id: 'd', text: 'Não aparece: é preciso deduzir pelo trecho de código mostrado.', porque: 'O Python nomeia o erro explicitamente — ZeroDivisionError, ValueError, NameError — e é esse nome que orienta a busca.' },
      ]},
      explanation: 'Lê-se de baixo para cima: a última linha diz o quê, a de cima diz onde.',
    },
    {
      id: 'PY-M7-Q4', type: 'multiple_choice',
      prompt: 'Você suspeita de um erro de lógica e não há mensagem nenhuma. Qual é o primeiro passo?',
      data: { options: [
        { id: 'a', text: 'Pôr print no meio do programa mostrando quanto vale cada variável naquele ponto.', correct: true },
        { id: 'b', text: 'Reescrever o programa do zero, com outro raciocínio.', porque: 'Reescrever sem saber onde estava o erro costuma reintroduzi-lo, e joga fora a parte que funcionava.' },
        { id: 'c', text: 'Trocar as linhas de lugar até o resultado ficar certo.', porque: 'Acertar por tentativa produz um programa que ninguém entende, e que volta a errar na próxima entrada diferente.' },
        { id: 'd', text: 'Rodar de novo: às vezes o resultado sai certo na segunda vez.', porque: 'O mesmo programa com a mesma entrada dá o mesmo resultado, sempre. Não há acaso a esperar.' },
      ]},
      explanation: 'Sem mensagem, a pista se fabrica. O erro está no primeiro ponto em que o valor mostrado diverge do esperado.',
    },
    {
      id: 'PY-M7-Q5', type: 'scenario',
      prompt: 'O programa lê três notas e mostra a média. Ele roda até o fim, sem mensagem nenhuma, e a média sai sempre maior do que deveria. Qual é a primeira coisa a fazer?',
      data: { scenarios: [
        { id: 'a', text: 'Pôr um print no meio, mostrando a soma e a quantidade antes da divisão.', correct: true },
        { id: 'b', text: 'Reescrever o programa do começo, com outro jeito de calcular.', porque: 'Reescrever costuma reproduzir o mesmo engano, agora escondido em outro lugar. Primeiro se descobre onde o valor desanda.' },
        { id: 'c', text: 'Procurar o nome do erro na última linha da mensagem.', porque: 'Não há mensagem: o programa rodou até o fim. É isso que caracteriza o erro de lógica.' },
        { id: 'd', text: 'Conferir o recuo do bloco, que pode ter tirado uma linha do laço.', porque: 'Vale olhar depois, mas às cegas. O print diz em que ponto o valor deixou de bater, e é ele que aponta onde olhar.' },
      ]},
      explanation: 'Sem pista, a pista se fabrica. O primeiro ponto em que o mostrado diverge do esperado é onde o erro está — e não onde o resultado errado apareceu.',
    },
    {
      id: 'PY-M7-Q6', type: 'multiple_choice',
      prompt: 'O programa escreveu três linhas e parou com uma mensagem. Que família de erro é essa, e como se sabe?',
      data: { options: [
        { id: 'a', text: 'De execução: ele chegou a rodar, e parou no meio.', correct: true },
        { id: 'b', text: 'De sintaxe: o Python encontrou algo que não entendeu.', porque: 'Erro de sintaxe é recusa do arquivo inteiro: nenhuma linha teria saído, nem a primeira.' },
        { id: 'c', text: 'De lógica: o resultado não é o esperado.', porque: 'O erro de lógica não para o programa nem mostra mensagem. É justamente por isso que ele é o perigoso.' },
        { id: 'd', text: 'Não dá para saber sem ler o nome do erro na mensagem.', porque: 'O nome diz qual erro é. A família já se sabe pelo momento: rodou um pouco e parou.' },
      ]},
      explanation: 'A família se descobre pelo quando: antes de qualquer linha sair é sintaxe; no meio é execução; nunca é lógica. É o que a classificação do painel de Problemas cobra.',
    },
    {
      id: 'PY-M7-Q7', type: 'true_false',
      prompt: 'Numa mensagem de erro do Python, a primeira linha é a que nomeia o erro.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A mensagem se lê de baixo para cima: o nome do erro está na última linha, e o caminho até ele vem acima.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Última linha diz o quê; a de cima diz onde, com o arquivo e o número da linha. Ler o fim primeiro é o hábito que resolve a maior parte dos problemas sozinho.',
    },
  ],

  'm8-teoria': [
    {
      id: 'PY-M8-Q1', type: 'multiple_choice',
      prompt: 'Quais são as três partes que quase todo programa pequeno tem, nessa ordem?',
      data: { options: [
        { id: 'a', text: 'Recebe alguma coisa, faz alguma coisa com ela, mostra o resultado.', correct: true },
        { id: 'b', text: 'Declara as variáveis, define as funções, chama as funções.', porque: 'Isso descreve uma organização possível do código, e não o que o programa faz para quem o usa.' },
        { id: 'c', text: 'Abre o arquivo, lê o arquivo, fecha o arquivo.', porque: 'É o roteiro de um programa que mexe em arquivos — um caso particular, e não a forma geral.' },
        { id: 'd', text: 'Testa, corrige e publica.', porque: 'Isso é o ciclo de trabalho de quem programa, e não a estrutura do programa em si.' },
      ]},
      explanation: 'Entrada, processamento e saída. Decidir as três antes de escrever poupa a maior parte do retrabalho.',
    },
    {
      id: 'PY-M8-Q2', type: 'multiple_choice',
      prompt: 'O que um bom comentário explica?',
      data: { options: [
        { id: 'a', text: 'Por que aquilo está ali, e o que aconteceria sem.', correct: true },
        { id: 'b', text: 'O que a linha faz, em português.', porque: 'A linha já diz o que faz. Repetir isso em português só faz o arquivo crescer, e envelhece mal quando o código muda.' },
        { id: 'c', text: 'Quem escreveu a linha e quando.', porque: 'Isso é trabalho do sistema de versões, que guarda autor e data de cada linha sem sujar o código.' },
        { id: 'd', text: 'O nome de cada variável usada abaixo.', porque: 'Se o nome precisa ser explicado, o nome está ruim — trocá-lo resolve melhor do que comentá-lo.' },
      ]},
      explanation: 'Nome bom substitui comentário; comentário bom guarda a decisão que o código não consegue mostrar.',
    },
    {
      id: 'PY-M8-Q3', type: 'true_false',
      prompt: 'Num programa de quarenta linhas, linhas em branco e linhas só de comentário contam para o total.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito é de programa. Quarenta comentários não fazem um programa de quarenta linhas, e a verificação conta só as linhas com código.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Um programa com entrada, uma decisão de três caminhos e um laço já passa das quarenta linhas de código.',
    },
    {
      id: 'PY-M8-Q4', type: 'multiple_choice',
      prompt: 'Na apresentação ao examinador, o que ele precisa ouvir de você?',
      data: { options: [
        { id: 'a', text: 'A intenção: por que cada parte está ali, e o que aconteceria se não estivesse.', correct: true },
        { id: 'b', text: 'A leitura em voz alta de cada linha do programa.', porque: 'Ele está vendo a tela e sabe ler. O que ele não vê é o motivo de cada escolha.' },
        { id: 'c', text: 'A lista dos comandos do Python que você usou.', porque: 'Nomear comandos não mostra entendimento: dá para nomeá-los sem saber o que fazem no seu programa.' },
        { id: 'd', text: 'Quanto tempo você levou para escrever.', porque: 'O tempo não diz nada sobre o programa nem sobre o que você aprendeu escrevendo-o.' },
      ]},
      explanation: 'É o requisito mais difícil e o mais honesto: escrever copiando é possível, explicar copiando não é.',
    },
    {
      id: 'PY-M8-Q5', type: 'scenario',
      prompt: 'Você descreveu o programa em três linhas de português e a segunda ficou assim: "calcula a média, monta a escala do mês e envia o aviso". O que isso indica?',
      data: { scenarios: [
        { id: 'a', text: 'Que ele faz mais de uma coisa, e vale separá-lo.', correct: true },
        { id: 'b', text: 'Que o programa está bem planejado, por já prever tudo o que precisa.', porque: 'Prever muito não é planejar bem. Três assuntos numa parte só ficam difíceis de escrever, de conferir e de explicar.' },
        { id: 'c', text: 'Que faltou detalhar mais, escrevendo cada passo da conta.', porque: 'O plano é curto de propósito. O problema aqui não é falta de detalhe: são assuntos demais.' },
        { id: 'd', text: 'Que a descrição deveria estar em Python, e não em português.', porque: 'O plano existe justamente para vir antes do código, em palavras que se pensam mais rápido.' },
      ]},
      explanation: 'Entrada, processamento e saída em três linhas é a medida. Quando o meio não cabe numa linha, ele costuma ser dois programas esperando para nascer.',
    },
    {
      id: 'PY-M8-Q6', type: 'multiple_choice',
      prompt: 'Qual destes comentários acrescenta alguma coisa ao programa?',
      data: { options: [
        { id: 'a', text: 'Dizer por que o desconto só vale acima de dez inscritos.', correct: true },
        { id: 'b', text: 'Dizer que a linha seguinte soma um ao contador.', porque: 'O código já diz isso, e com mais precisão. Repetir o que está escrito só faz o arquivo crescer.' },
        { id: 'c', text: 'Dizer o nome da variável que está sendo criada ali.', porque: 'O nome está na própria linha. Se ele não bastar, o que falta é um nome melhor, e não um comentário.' },
        { id: 'd', text: 'Dizer que o bloco abaixo é um laço que repete.', porque: 'A palavra que abre o bloco já diz isso. Comentário que traduz a sintaxe ensina menos do que a sintaxe.' },
      ]},
      explanation: 'Comentário explica o porquê, e não o quê. A regra que sobra é essa: se o código já responde, o comentário está ocupando espaço.',
    },
    {
      id: 'PY-M8-Q7', type: 'true_false',
      prompt: 'Escolher um assunto que você conhece torna o programa mais fácil de conferir.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Quem conhece o assunto sabe qual deveria ser a resposta — e é assim que se percebe um erro de lógica, que nenhuma ferramenta aponta.' },
      ]},
      explanation: 'A chamada da unidade, o placar do jogo do clube, quanto falta para o acampamento: em qualquer deles você reconhece um resultado errado de imediato.',
    },
  ],
};
