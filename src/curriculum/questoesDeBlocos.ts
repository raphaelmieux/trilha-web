import type { Question } from '../types';

/*
 * As questões das lições de teoria da vereda CC001.
 *
 * O requisito 2 do documento pede a definição de seis termos: algoritmo,
 * sequência, repetição, condição, variável e evento. Cada um recebe uma
 * questão de definição, uma só, e no módulo em que o assunto é ensinado — a
 * definição vale uma vez na prova inteira, e repeti-la faria a nota dizer menos
 * do que diz.
 *
 * As outras medem entendimento. Em blocos o que mais rende é o **diagnóstico**,
 * e por um motivo que é o oposto do CSS: aqui nada some em silêncio, tudo roda.
 * O programa errado executa lindamente e faz a coisa errada — o placar que sobe
 * sozinho, o `se` que pergunta uma vez e nunca mais, a tecla que dispara uma
 * pilha em que nada se move. Quem sabe ler esses sintomas sabe programar; quem
 * só sabe arrastar o bloco, não.
 *
 * Toda alternativa errada diz **por que** está errada, no campo `porque`, e a
 * certa não carrega motivo nenhum — é o que `qualidade.test.ts` cobra.
 */

export const QUESTOES_DE_BLOCOS: Record<string, Question[]> = {
  'm1-teoria': [
    {
      id: 'BLK-M1-Q1', type: 'multiple_choice',
      prompt: 'O que é um algoritmo?',
      data: { options: [
        { id: 'a', text: 'Uma sequência finita de passos, em ordem, que leva a um resultado.', correct: true },
        { id: 'b', text: 'Um programa de computador escrito numa linguagem qualquer.', porque: 'O programa é o algoritmo já escrito para a máquina. O algoritmo é o plano, e existe antes de qualquer linguagem.' },
        { id: 'c', text: 'Uma conta matemática difícil que o computador resolve rápido.', porque: 'Muito algoritmo não tem conta nenhuma. Amarrar o cadarço é um algoritmo, e não tem número dentro.' },
        { id: 'd', text: 'O nome técnico do conjunto de blocos coloridos do Scratch.', porque: 'Os blocos são uma forma de escrever algoritmos. O algoritmo existe sem eles, e existia muito antes deles.' },
      ]},
      explanation: 'Passos, em ordem, com começo e fim. A palavra vem de al-Khwarizmi, matemático persa do século IX.',
    },
    {
      id: 'BLK-M1-Q2', type: 'multiple_choice',
      prompt: 'O que é uma sequência, em programação?',
      data: { options: [
        { id: 'a', text: 'A execução de um passo depois do outro, na ordem escrita.', correct: true },
        { id: 'b', text: 'A repetição do mesmo passo várias vezes seguidas.', porque: 'Isso é repetição, que é outro conceito. A sequência é a ordem; a repetição é quantas vezes.' },
        { id: 'c', text: 'A lista de todos os blocos que existem na paleta.', porque: 'A paleta é o catálogo do que se pode usar. A sequência é a ordem do que foi montado.' },
        { id: 'd', text: 'A escolha entre dois caminhos possíveis dentro do programa.', porque: 'Escolher caminho é condição. Sequência não escolhe nada: ela segue reto.' },
      ]},
      explanation: 'Sequência é a mais simples das três estruturas, e a que sustenta as outras duas.',
    },
    {
      id: 'BLK-M1-Q3', type: 'multiple_choice',
      prompt: 'Numa receita de bolo, você troca "asse por 40 minutos" de lugar com "misture a massa". A receita continua valendo?',
      data: { options: [
        { id: 'a', text: 'Não: a ordem faz parte do algoritmo.', correct: true },
        { id: 'b', text: 'Sim, porque os dois passos continuam presentes na receita.', porque: 'Estar presente não basta. Assar antes de misturar produz outra coisa — ou coisa nenhuma.' },
        { id: 'c', text: 'Sim, desde que o tempo total de preparo continue o mesmo.', porque: 'O tempo é o mesmo e o resultado não. O que mudou foi a ordem, e é justamente ela que se quebrou.' },
        { id: 'd', text: 'Depende do forno: em forno elétrico a ordem dos passos não importa.', porque: 'Nenhum forno assa massa que ainda não foi misturada. O equipamento não muda a lógica da receita.' },
      ]},
      explanation: 'Trocar dois passos de lugar pode mudar o resultado ou impedi-lo. É o que separa uma lista de um algoritmo.',
    },
    {
      id: 'BLK-M1-Q4', type: 'true_false',
      prompt: 'Um algoritmo só existe quando há um computador para executá-lo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Algoritmo é o plano, e não a máquina. Amarrar o cadarço, armar a barraca e o caminho de casa até a igreja são algoritmos sem computador nenhum.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O computador é um executor possível, não o único. Algoritmos existem há milhares de anos.',
    },
  ],

  'm2-teoria': [
    {
      id: 'BLK-M2-Q1', type: 'multiple_choice',
      prompt: 'Para que serve o bloco de chapéu no alto de uma pilha?',
      data: { options: [
        { id: 'a', text: 'Dizer quando aquela pilha deve começar a rodar.', correct: true },
        { id: 'b', text: 'Dar nome à pilha, para separá-la das outras na tela.', porque: 'Ele não nomeia nada. Duas pilhas podem começar com o mesmo chapéu e rodam as duas.' },
        { id: 'c', text: 'Marcar de que ator aquela pilha é.', porque: 'Quem diz isso é a aba do ator em que a pilha está, e não o chapéu.' },
        { id: 'd', text: 'Guardar o primeiro comando, que roda antes de todos os outros.', porque: 'O chapéu não é um comando: ele não move, não fala e não muda nada. Ele espera.' },
      ]},
      explanation: 'Bandeira verde, tecla pressionada, ator clicado: cada chapéu é um "quando".',
    },
    {
      id: 'BLK-M2-Q2', type: 'multiple_choice',
      prompt: 'Você montou uma pilha bonita, clicou na bandeira verde e nada aconteceu. A pilha não tem chapéu nenhum. Por quê?',
      data: { options: [
        { id: 'a', text: 'Sem chapéu, nada diz quando a pilha roda — e ela nunca roda.', correct: true },
        { id: 'b', text: 'Os blocos foram encaixados na ordem errada dentro da pilha.', porque: 'A ordem só importa depois que a pilha começa. Esta nem começou.' },
        { id: 'c', text: 'Falta salvar o projeto antes de a bandeira verde funcionar.', porque: 'O palco roda o que está montado agora. Salvar guarda o trabalho, não o liga.' },
        { id: 'd', text: 'A bandeira verde só roda a pilha do primeiro ator da lista.', porque: 'Ela dispara todas as pilhas de bandeira, de todos os atores, ao mesmo tempo.' },
      ]},
      explanation: 'É o erro mais comum de quem começa: a pilha existe, está certa, e ninguém a chama.',
    },
    {
      id: 'BLK-M2-Q3', type: 'multiple_choice',
      prompt: 'No palco, o ponto x: 0 y: 0 fica onde?',
      data: { options: [
        { id: 'a', text: 'No centro do palco.', correct: true },
        { id: 'b', text: 'No canto superior esquerdo do palco.', porque: 'É onde fica em muitos programas de desenho, e não aqui. Este palco tem a origem no meio, como um gráfico.' },
        { id: 'c', text: 'No canto inferior esquerdo, como num gráfico de matemática.', porque: 'O eixo y sobe como no gráfico, mas a origem não está no canto: está no centro, e por isso existe x negativo.' },
        { id: 'd', text: 'Onde o ator estiver quando o projeto for aberto.', porque: 'A origem é fixa. O ator é que tem posição, e ela se mede a partir dela.' },
      ]},
      explanation: 'Origem no meio, x de -240 a 240 e y de -180 a 180. É por isso que existem coordenadas negativas.',
    },
    {
      id: 'BLK-M2-Q4', type: 'true_false',
      prompt: 'Numa pilha, os blocos são executados de cima para baixo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A pilha é lida na ordem em que foi montada, do chapéu para baixo. É a sequência desenhada na vertical.' },
      ]},
      explanation: 'A pilha é a sequência: o desenho na tela é a ordem de execução.',
    },
  ],

  'm3-teoria': [
    {
      id: 'BLK-M3-Q1', type: 'multiple_choice',
      prompt: 'O que é um evento, em programação?',
      data: { options: [
        { id: 'a', text: 'Algo que acontece de fora e faz o programa reagir.', correct: true },
        { id: 'b', text: 'Um erro que interrompe o programa no meio da execução.', porque: 'Isso é uma falha. Evento é normal e esperado: a tecla, o clique, o encontro de dois atores.' },
        { id: 'c', text: 'Cada passo que o programa dá enquanto está rodando.', porque: 'Os passos são a execução. O evento é o que a dispara, e vem de fora dela.' },
        { id: 'd', text: 'O momento em que o programa termina e devolve o resultado.', porque: 'Esse é o fim da execução. O evento normalmente é o começo dela.' },
      ]},
      explanation: 'Tecla, clique, toque, tempo. O programa fica de guarda e responde quando o evento chega.',
    },
    {
      id: 'BLK-M3-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre um programa que executa uma vez do início ao fim e um que fica esperando o usuário?',
      data: { options: [
        { id: 'a', text: 'O primeiro termina depois do último passo; o segundo continua vivo, reagindo a eventos.', correct: true },
        { id: 'b', text: 'O primeiro é mais rápido, porque não precisa esperar ninguém digitar nada.', porque: 'Velocidade não é a diferença. Um programa que espera pode ser rapidíssimo a cada reação.' },
        { id: 'c', text: 'O primeiro roda no computador e o segundo só funciona no celular.', porque: 'Os dois tipos rodam em qualquer aparelho. O que muda é como o programa é escrito, não onde roda.' },
        { id: 'd', text: 'O primeiro usa blocos e o segundo precisa de uma linguagem digitada.', porque: 'Os dois se escrevem em blocos, e os dois em texto. A diferença é de comportamento, não de formato.' },
      ]},
      explanation: 'Jogos, aplicativos e sites são do segundo tipo. Chama-se programa orientado a eventos.',
    },
    {
      id: 'BLK-M3-Q3', type: 'multiple_choice',
      prompt: 'A pilha começa com "quando a tecla direita for pressionada" e traz um bloco "diga Olá" embaixo. Você segura a seta e o ator não sai do lugar. O que falta?',
      data: { options: [
        { id: 'a', text: 'Um bloco de movimento: a pilha dispara, mas nada nela move.', correct: true },
        { id: 'b', text: 'Trocar o chapéu, porque tecla de seta não dispara pilha nenhuma.', porque: 'A seta dispara sim — a prova é o balão de fala aparecendo. O chapéu está fazendo o trabalho dele.' },
        { id: 'c', text: 'Um laço "sempre" em volta, sem o qual nenhum bloco tem efeito.', porque: 'Os blocos têm efeito sem laço. O "diga" está funcionando, e não há laço nenhum ali.' },
        { id: 'd', text: 'Clicar antes na bandeira verde, que é o único chapéu que liga o projeto.', porque: 'O chapéu de tecla vale sozinho enquanto o palco roda. E se nada rodasse, o balão também não apareceria.' },
      ]},
      explanation: 'O sintoma diz onde olhar: o balão apareceu, então a pilha rodou. O que falta está dentro dela.',
    },
    {
      id: 'BLK-M3-Q4', type: 'true_false',
      prompt: 'O mesmo projeto pode ter, ao mesmo tempo, uma pilha que roda uma vez e para e outra que fica esperando o jogador.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É o arranjo mais comum de todos: uma pilha arruma o cenário e termina, e as outras ficam de guarda esperando o teclado.' },
      ]},
      explanation: 'Os dois tipos convivem, e quase todo jogo usa os dois.',
    },
  ],

  'm4-teoria': [
    {
      id: 'BLK-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é uma repetição, ou laço?',
      data: { options: [
        { id: 'a', text: 'Um bloco que executa de novo o que está dentro dele.', correct: true },
        { id: 'b', text: 'Escrever o mesmo comando várias vezes seguidas na pilha.', porque: 'Isso é copiar e colar. O laço é justamente o que evita essa cópia — e o que permite repetir sem saber quantas vezes.' },
        { id: 'c', text: 'Um comando que faz o ator voltar para onde começou.', porque: 'Voltar ao começo é o bloco "vá para". O laço repete, e o que ele repete é escolha de quem monta.' },
        { id: 'd', text: 'A parte do programa que roda depois que todo o resto terminou.', porque: 'O laço roda onde está, na ordem da pilha. Ele não espera o resto acabar.' },
      ]},
      explanation: '"Repita 10 vezes" e "sempre" são as duas formas. O que muda é quando param.',
    },
    {
      id: 'BLK-M4-Q2', type: 'multiple_choice',
      prompt: 'Você quer que o ator ande 4 passos. Por que usar "repita 4 vezes" em vez de encaixar quatro blocos de mover?',
      data: { options: [
        { id: 'a', text: 'Para trocar 4 por 40 mudando um número só.', correct: true },
        { id: 'b', text: 'Porque quatro blocos iguais seguidos causam erro no programa.', porque: 'Não causam erro nenhum: funcionam. O problema é o custo de mudar depois, e não a correção.' },
        { id: 'c', text: 'Porque o laço faz o ator andar mais rápido que os blocos soltos.', porque: 'A velocidade é a mesma. O laço organiza o programa, não acelera nada.' },
        { id: 'd', text: 'Porque o Scratch não deixa encaixar o mesmo bloco duas vezes na pilha.', porque: 'Deixa, sim. Nada impede quatro blocos iguais — o que se ganha com o laço é outra coisa.' },
      ]},
      explanation: 'O laço não é atalho de digitação: é o que deixa o programa mudar sem ser reescrito.',
    },
    {
      id: 'BLK-M4-Q3', type: 'multiple_choice',
      prompt: 'Um "repita 10 vezes" está na pilha, sem nada dentro. O que acontece quando o programa roda?',
      data: { options: [
        { id: 'a', text: 'Ele repete dez vezes o nada, e o programa segue em frente.', correct: true },
        { id: 'b', text: 'O programa trava, porque um laço vazio nunca termina.', porque: 'Quem pode não terminar é o "sempre". O "repita 10" conta até dez e sai, com ou sem conteúdo.' },
        { id: 'c', text: 'O Scratch avisa que o laço está vazio e pede para preenchê-lo.', porque: 'Ele não avisa. O laço vazio é um programa válido, e é por isso que o erro passa despercebido.' },
        { id: 'd', text: 'Os blocos que vierem depois do laço são repetidos no lugar.', porque: 'O laço só repete o que está dentro da boca dele. O que vem depois roda uma vez, normalmente.' },
      ]},
      explanation: 'Arrastar o bloco é a parte fácil. O laço só ensina alguma coisa quando tem o que repetir dentro.',
    },
    {
      id: 'BLK-M4-Q4', type: 'true_false',
      prompt: 'O bloco "sempre" para sozinho depois de um número grande de voltas.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele não para sozinho nunca. Quem o encerra é o bloco "pare todos", o botão vermelho de parar ou o fim do projeto.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É a diferença entre os dois laços: "repita" tem conta para terminar, "sempre" não tem.',
    },
  ],

  'm5-teoria': [
    {
      id: 'BLK-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é uma condição?',
      data: { options: [
        { id: 'a', text: 'Uma pergunta de sim ou não que decide se algo vai acontecer.', correct: true },
        { id: 'b', text: 'Uma ordem que o programa executa sempre que chega nela.', porque: 'Isso é um comando comum. A condição pode não fazer nada, e é justamente essa a graça dela.' },
        { id: 'c', text: 'O valor guardado numa variável enquanto o jogo roda.', porque: 'Esse valor é o conteúdo da variável. A condição pode consultá-lo, mas não é ele.' },
        { id: 'd', text: 'A lista de tudo o que precisa estar pronto para o projeto rodar.', porque: 'O projeto roda com o que houver. Condição é uma pergunta feita durante a execução, não um requisito antes dela.' },
      ]},
      explanation: 'Se a resposta é sim, o que está dentro do "se" acontece. Se é não, o programa pula e segue.',
    },
    {
      id: 'BLK-M5-Q2', type: 'multiple_choice',
      prompt: 'Você pôs um "se tocando em Maçã? então" solto na pilha, logo abaixo da bandeira verde. Os dois se encostam durante o jogo e nada acontece. Por quê?',
      data: { options: [
        { id: 'a', text: 'O "se" perguntou uma vez, no começo, e nunca mais.', correct: true },
        { id: 'b', text: 'O sensor de toque só funciona depois que o ator se move.', porque: 'O sensor responde a qualquer momento. O problema é que ninguém o consultou na hora do encontro.' },
        { id: 'c', text: 'Falta um segundo "se" no outro ator para o toque valer.', porque: 'Um lado basta para perceber o encontro. Dois "se" teriam o mesmo problema deste, e duas vezes.' },
        { id: 'd', text: 'O "se" precisa estar sempre dentro de um "repita" com número.', porque: 'Não precisa ser "repita": o "sempre" é o que serve aqui. O que falta é alguém perguntando de novo.' },
      ]},
      explanation: 'Condição pergunta no instante em que é executada. Para vigiar algo, ela precisa morar dentro de um laço.',
    },
    {
      id: 'BLK-M5-Q3', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre "tocando na borda" e "tocando na maçã"?',
      data: { options: [
        { id: 'a', text: 'A borda é a beirada do palco; a maçã é outro ator.', correct: true },
        { id: 'b', text: 'A borda vale para qualquer ator e a maçã só para o que a criou.', porque: 'Qualquer ator pode perguntar por qualquer outro. Não há dono da pergunta.' },
        { id: 'c', text: 'A borda é uma pergunta de posição e a maçã é uma pergunta de cor.', porque: 'As duas são perguntas de encosto. Cor é outro sensor, que não está em jogo aqui.' },
        { id: 'd', text: 'Nenhuma: as duas perguntam se o ator chegou ao limite do palco.', porque: 'A maçã pode estar no meio do palco. Encostar nela não tem nada a ver com chegar ao limite.' },
      ]},
      explanation: 'É a distinção que o requisito 5 cobra: os dois atores precisam interagir entre si, e não com o cenário.',
    },
    {
      id: 'BLK-M5-Q4', type: 'true_false',
      prompt: 'Um bloco "se" sem nada dentro da boca ainda decide alguma coisa no programa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ele faz a pergunta e, seja qual for a resposta, não executa nada. Decidir entre nada e nada não é decidir.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O bloco na tela não é a estrutura funcionando. O que se cobra é o que ele faz, e não que ele esteja lá.',
    },
  ],

  'm6-teoria': [
    {
      id: 'BLK-M6-Q1', type: 'multiple_choice',
      prompt: 'O que é uma variável?',
      data: { options: [
        { id: 'a', text: 'Um lugar com nome onde o programa guarda um valor que pode mudar.', correct: true },
        { id: 'b', text: 'Um número que o programador escolhe e escreve dentro do bloco.', porque: 'Esse número é fixo: está escrito ali e não muda. O que faz a variável ser variável é poder mudar durante a execução.' },
        { id: 'c', text: 'Um bloco que só existe enquanto o jogo está rodando.', porque: 'A variável é criada antes e continua existindo depois. O que muda durante o jogo é o valor dela.' },
        { id: 'd', text: 'A parte do programa que pode ser diferente em cada computador.', porque: 'O programa é o mesmo em todo lugar. Variável é sobre guardar valor, não sobre variar de máquina para máquina.' },
      ]},
      explanation: 'Placar, vidas, tempo, nome do jogador. Tem nome, tem valor, e o valor muda.',
    },
    {
      id: 'BLK-M6-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre "defina placar para 0" e "mude placar em 1"?',
      data: { options: [
        { id: 'a', text: 'O primeiro troca o valor; o segundo soma ao que já havia.', correct: true },
        { id: 'b', text: 'O primeiro cria a variável e o segundo apenas a utiliza depois.', porque: 'Criar é outra coisa, feita fora da pilha. Os dois blocos supõem a variável já existindo.' },
        { id: 'c', text: 'O primeiro vale para números e o segundo para qualquer tipo de valor.', porque: 'É quase o contrário: somar só faz sentido com número. Trocar aceita qualquer valor.' },
        { id: 'd', text: 'Não há diferença: os dois escrevem um valor novo na variável.', porque: 'Com o placar em 5, "defina para 1" deixa 1 e "mude em 1" deixa 6. A diferença aparece na primeira vez que se usa.' },
      ]},
      explanation: '"Defina" é usado no começo, para zerar. "Mude" é o que faz o placar subir durante o jogo.',
    },
    {
      id: 'BLK-M6-Q3', type: 'multiple_choice',
      prompt: 'O "mude placar em 1" está dentro de um "sempre", mas fora de qualquer "se". O que se vê no jogo?',
      data: { options: [
        { id: 'a', text: 'O placar sobe sem parar, sem que ninguém tenha feito nada.', correct: true },
        { id: 'b', text: 'O placar sobe uma vez e depois fica parado no mesmo número.', porque: 'Dentro do "sempre" ele roda a cada volta. Subir uma vez só é o que aconteceria fora do laço.' },
        { id: 'c', text: 'O placar não muda, porque falta a condição que autoriza a soma.', porque: 'O bloco não precisa de autorização: ele soma sempre que é executado. A condição é o que a gente quer, e não o que ele exige.' },
        { id: 'd', text: 'O placar sobe apenas quando os dois atores se encostam.', porque: 'Isso exigiria um "se tocando" em volta. Sem ele, o toque não tem participação nenhuma.' },
      ]},
      explanation: 'Um placar assim não marca ponto por alguma coisa: marca ponto por existir. O que faz dele placar é estar dentro de um "se".',
    },
    {
      id: 'BLK-M6-Q4', type: 'true_false',
      prompt: 'Criar a variável já cumpre o requisito de "criar uma variável e alterar seu valor durante a execução".',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O requisito tem duas metades, e a segunda é a que importa: o valor precisa mudar enquanto o programa roda. Variável criada e nunca alterada não demonstra nada.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Leia o requisito inteiro: criar e também alterar. É a alteração que mostra para que a variável serve.',
    },
  ],

  'm7-teoria': [
    {
      id: 'BLK-M7-Q1', type: 'multiple_choice',
      prompt: 'O que decide, dentro do programa, que o jogo acabou?',
      data: { options: [
        { id: 'a', text: 'Um "se" que compara a variável com um número.', correct: true },
        { id: 'b', text: 'O bloco "pare todos" encaixado no fim da pilha principal.', porque: '"Pare todos" executa o fim, e não o decide: sem uma pergunta antes dele, ele para na primeira passada.' },
        { id: 'c', text: 'O momento em que o "sempre" termina a última volta dele.', porque: 'O "sempre" não tem última volta. Ele gira até alguém encerrar o programa.' },
        { id: 'd', text: 'O jogador clicando no botão vermelho de parar quando quiser sair.', porque: 'Isso é desistir, e funciona em qualquer projeto. O requisito pede uma condição de vitória ou derrota escrita no programa.' },
      ]},
      explanation: 'Placar maior que 5, vidas menores que 1, tempo esgotado: é a comparação que decide.',
    },
    {
      id: 'BLK-M7-Q2', type: 'ordering',
      prompt: 'Ponha em ordem os passos de quem monta um jogo de pegar frutas, do primeiro ao último.',
      data: { items: [
        { id: 'p1', text: 'Pôr os dois atores no palco e escolher onde cada um começa.', order: 1 },
        { id: 'p2', text: 'Fazer o jogador se mover com as setas do teclado.', order: 2 },
        { id: 'p3', text: 'Criar a variável do placar e zerá-la na bandeira verde.', order: 3 },
        { id: 'p4', text: 'Somar um ponto dentro de um "se tocando", vigiado por um "sempre".', order: 4 },
        { id: 'p5', text: 'Comparar o placar com um número para anunciar a vitória.', order: 5 },
      ]},
      explanation: 'Primeiro o que se vê, depois o que se controla, e só então o que se conta. Cada passo dá para testar sozinho antes do seguinte.',
    },
    {
      id: 'BLK-M7-Q3', type: 'multiple_choice',
      prompt: 'Na apresentação ao examinador, o que se espera que você diga sobre cada grupo de blocos?',
      data: { options: [
        { id: 'a', text: 'Que trabalho aquele grupo faz no jogo, e por que ele está ali.', correct: true },
        { id: 'b', text: 'O nome de cada bloco, lido em voz alta na ordem da pilha.', porque: 'Ler os nomes é descrever a tela, que o examinador já está vendo. O que ele não vê é a intenção.' },
        { id: 'c', text: 'Quanto tempo você levou para montar aquela parte do projeto.', porque: 'O tempo gasto não explica o programa. O requisito pede a função de cada grupo.' },
        { id: 'd', text: 'De que tutorial ou vídeo você tirou aquele trecho de código.', porque: 'A origem não é o pedido. E se você não souber explicar o que o trecho faz, ele não conta como seu.' },
      ]},
      explanation: 'O requisito 6 pede a função de cada grupo. Saber explicar é o que separa montar de entender.',
    },
    {
      id: 'BLK-M7-Q4', type: 'true_false',
      prompt: 'Para que dois atores interajam, basta que os dois existam no palco e tenham alguma pilha rodando.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Existir e rodar não é interagir. Sem uma condição em que um pergunta pelo outro, os dois rodam lado a lado sem nunca se notarem.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A interação é a pergunta: um "se tocando" que nomeia o outro ator, e faz algo quando a resposta é sim.',
    },
  ],
};
