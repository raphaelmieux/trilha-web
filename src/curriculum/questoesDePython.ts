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
  ],
};
