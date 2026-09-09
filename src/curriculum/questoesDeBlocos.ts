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
    {
      id: 'BLK-M1-Q5', type: 'scenario',
      prompt: 'Você escreveu o passo a passo para chegar do portão do clube até a secretaria e passou a folha para outra pessoa seguir. Ela chegou num lugar errado. O que isso mostra?',
      data: { scenarios: [
        { id: 'a', text: 'Algum passo faltou ou ficou fora de ordem no que você escreveu.', correct: true },
        { id: 'b', text: 'Que a pessoa não entendeu, e o algoritmo estava certo.', porque: 'Quem executa segue o que está escrito. Passo que só existia na sua cabeça não chegou até ela.' },
        { id: 'c', text: 'Que caminho de prédio não pode ser escrito como algoritmo.', porque: 'Pode, e é um dos exemplos clássicos: passos finitos, em ordem, levando a um resultado.' },
        { id: 'd', text: 'Que faltou um computador para executar direito o passo a passo.', porque: 'Algoritmo não depende de máquina. A definição não fala de computador nenhum.' },
      ]},
      explanation: 'Testar um algoritmo é entregá-lo a quem não sabe o que você quis dizer. O que estiver implícito some no caminho — e é exatamente o que acontece com a máquina.',
    },
    {
      id: 'BLK-M1-Q6', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre um algoritmo e um programa?',
      data: { options: [
        { id: 'a', text: 'O algoritmo é o plano; o programa é o plano escrito para a máquina.', correct: true },
        { id: 'b', text: 'O algoritmo é curto e o programa é longo, com muitos passos.', porque: 'O tamanho não separa os dois. Há algoritmos longos e programas de três linhas.' },
        { id: 'c', text: 'O algoritmo é feito de blocos e o programa é digitado em texto.', porque: 'Blocos e texto são duas formas de escrever programa. O algoritmo existe antes de escolher qual delas usar.' },
        { id: 'd', text: 'São a mesma coisa, com nomes diferentes conforme quem fala.', porque: 'O mesmo algoritmo vira programa em Scratch, em Python ou em nenhum dos dois — e continua existindo.' },
      ]},
      explanation: 'A receita da sua avó é um algoritmo e nunca virou programa. É por isso que os dois nomes existem: um é a ideia dos passos, o outro é a ideia entregue à máquina.',
    },
    {
      id: 'BLK-M1-Q7', type: 'true_false',
      prompt: 'Programar em blocos evita o erro de sintaxe porque o bloco só encaixa onde faz sentido.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É essa a diferença que os blocos trouxeram: não há ponto e vírgula para esquecer nem palavra para escrever errado. O erro de lógica, esse continua possível.' },
      ]},
      explanation: 'Encaixe errado não acontece; ordem errada acontece o tempo todo. Os blocos tiram um tipo de erro do caminho para deixar o outro à vista.',
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
    {
      id: 'BLK-M2-Q5', type: 'scenario',
      prompt: 'O ator começa o jogo no canto esquerdo. Você encaixou "vá para x: 0 y: 0" logo abaixo do chapéu para reiniciar a posição, e ele passou a nascer no meio do palco. Por quê?',
      data: { scenarios: [
        { id: 'a', text: 'x: 0 y: 0 é o centro do palco, e não o lugar onde o ator estava.', correct: true },
        { id: 'b', text: 'O bloco só funciona com números positivos, e zerou tudo.', porque: 'Ele aceita negativos: metade do palco tem coordenada negativa. O ponto pedido é que era o centro.' },
        { id: 'c', text: 'O palco mudou de tamanho ao rodar e levou o ator junto.', porque: 'O palco tem sempre 480 por 360. Quem mudou de lugar foi o ator, obedecendo ao bloco.' },
        { id: 'd', text: 'O chapéu apaga a posição anterior antes de qualquer bloco rodar.', porque: 'O chapéu não muda nada: ele só espera o momento de começar.' },
      ]},
      explanation: 'Para nascer no canto esquerdo, o bloco precisa dizer aquele canto — algo como x: -180 y: 0. O centro é um lugar como outro qualquer, e não o começo.',
    },
    {
      id: 'BLK-M2-Q6', type: 'multiple_choice',
      prompt: 'O gato e a maçã têm, cada um, uma pilha começando por "quando ⚑ for clicado". O que acontece ao clicar na bandeira?',
      data: { options: [
        { id: 'a', text: 'As duas pilhas começam juntas, sem uma esperar a outra.', correct: true },
        { id: 'b', text: 'Roda a pilha do gato, e a da maçã só depois que ela terminar.', porque: 'Uma pilha esperando a outra faria um desenho animado, e não um jogo: nada poderia acontecer ao mesmo tempo.' },
        { id: 'c', text: 'Roda apenas a pilha do ator selecionado na lista de baixo.', porque: 'A seleção decide o que você edita, e não o que roda. A bandeira dispara todas as pilhas de bandeira.' },
        { id: 'd', text: 'O Scratch avisa que há duas pilhas com o mesmo chapéu.', porque: 'Repetir o chapéu é normal e não é erro. Um mesmo ator pode ter várias pilhas de bandeira.' },
      ]},
      explanation: 'Dentro de uma pilha, um bloco depois do outro; entre pilhas, todas ao mesmo tempo. É essa simultaneidade que permite dois personagens agirem no mesmo instante.',
    },
    {
      id: 'BLK-M2-Q7', type: 'true_false',
      prompt: 'Um bloco de chapéu também executa alguma ação — ele move o ator para a posição inicial antes de a pilha começar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O chapéu só espera o momento de disparar. Nada se move sem um bloco embaixo dele pedindo.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem posiciona é o bloco de movimento que você encaixa. O chapéu responde a uma pergunta só: quando esta pilha começa?',
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
    {
      id: 'BLK-M3-Q5', type: 'multiple_choice',
      prompt: 'Você quer que o ator ande para a esquerda quando a seta esquerda for pressionada. Qual bloco encaixar embaixo desse chapéu?',
      data: { options: [
        { id: 'a', text: '"mova -10 passos": o sinal negativo é a direção.', correct: true },
        { id: 'b', text: 'Um bloco de andar para trás, na gaveta de Movimento.', porque: 'Esse bloco não existe. O mesmo "mova" serve para os dois lados, conforme o sinal do número.' },
        { id: 'c', text: '"mova 10 passos", que anda para o lado do chapéu escolhido.', porque: 'O bloco não olha o chapéu. Com um número positivo ele anda para a direita, seja qual for a tecla.' },
        { id: 'd', text: '"vá para x: -10 y: 0", que leva o ator para a esquerda.', porque: 'Esse bloco leva a um ponto fixo do palco, e não dez passos adiante. Segurar a tecla não moveria mais nada.' },
      ]},
      explanation: 'É o mesmo raciocínio das coordenadas negativas do palco: o sinal diz o sentido. Um bloco só, e dois caminhos.',
    },
    {
      id: 'BLK-M3-Q6', type: 'scenario',
      prompt: 'Duas pilhas do seu projeto: uma arruma o cenário quando a bandeira é clicada e acaba; a outra fica vigiando o encontro dos atores. O examinador pergunta se isso é um erro.',
      data: { scenarios: [
        { id: 'a', text: 'Não é: quase todo jogo tem os dois tipos, e um não substitui o outro.', correct: true },
        { id: 'b', text: 'É: um projeto deve ter só um tipo de pilha, para não confundir.', porque: 'Se houvesse um tipo só, ou nada ficaria de guarda ou nada seria arrumado no começo.' },
        { id: 'c', text: 'É: a pilha que acaba deveria ter um "sempre" para não parar.', porque: 'Arrumar o cenário é trabalho de uma vez. Um laço ali refaria a arrumação sem fim.' },
        { id: 'd', text: 'Não é, porque a segunda pilha na verdade também termina sozinha.', porque: 'Uma pilha com "sempre" não termina: ela fica viva esperando, e é o que faz dela vigia.' },
      ]},
      explanation: 'Uma arruma, a outra vigia. A diferença aparece em dois lugares na tela: o chapéu que abre a pilha, e haver ou não um "sempre" dentro dela.',
    },
    {
      id: 'BLK-M3-Q7', type: 'true_false',
      prompt: 'Um bloco "próxima fantasia" solto na área de scripts, sem chapéu acima, cumpre o requisito de responder a um evento.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Pilha sem chapéu nunca executa. O requisito pede resposta a um evento, e ali não há evento nem resposta.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O requisito tem duas partes ligadas: algo acontece, e o ator responde. Sem o chapéu, a segunda parte nunca chega a rodar.',
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
    {
      id: 'BLK-M4-Q5', type: 'scenario',
      prompt: 'Você quis que o ator desse quatro passos e depois dissesse "cheguei". Ele deu os quatro passos e disse "cheguei" quatro vezes. O que houve?',
      data: { scenarios: [
        { id: 'a', text: 'O bloco de falar ficou dentro da boca do laço, e não embaixo dele.', correct: true },
        { id: 'b', text: 'O laço repete tudo o que vier depois dele até o fim da pilha.', porque: 'Ele repete só o que está dentro da boca. O que fica encaixado abaixo roda uma vez, depois que o laço termina.' },
        { id: 'c', text: 'O bloco de falar precisa de um "espere" para não repetir.', porque: 'Sem repetição não haveria o que esperar. O bloco repetiu porque estava dentro do laço.' },
        { id: 'd', text: 'O laço rodou quatro vezes por engano; o certo seria uma.', porque: 'Quatro voltas é o que você pediu, e os quatro passos saíram certos. O que estava no lugar errado era a fala.' },
      ]},
      explanation: 'Dentro da boca e embaixo do laço são dois lugares diferentes, e na tela eles ficam quase colados. Quando algo acontece vezes demais, olhe onde o bloco encaixou.',
    },
    {
      id: 'BLK-M4-Q6', type: 'multiple_choice',
      prompt: 'Você encaixou um bloco logo abaixo de um "sempre" e ele nunca acontece. Por quê?',
      data: { options: [
        { id: 'a', text: 'O "sempre" não termina, então nada depois dele chega a rodar.', correct: true },
        { id: 'b', text: 'Blocos abaixo de um laço só rodam se houver um chapéu novo.', porque: 'Chapéu abre pilha. O problema aqui é o laço anterior nunca devolver a vez.' },
        { id: 'c', text: 'O bloco precisa estar dentro da boca do "sempre" para existir.', porque: 'Dentro da boca ele rodaria a cada volta, que é outro comportamento. Abaixo ele é válido — só inalcançável.' },
        { id: 'd', text: 'O Scratch descarta blocos soltos no fim de uma pilha.', porque: 'Ele não descarta nada. O bloco está lá, visível, e nunca é alcançado.' },
      ]},
      explanation: 'O "sempre" gira até alguém encerrar o programa. Quem escreve um encerramento para depois dele precisa pôr a decisão dentro do laço.',
    },
    {
      id: 'BLK-M4-Q7', type: 'true_false',
      prompt: 'A verificação do laboratório aceita um laço vazio, porque a estrutura está montada na tela.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela pergunta se existe laço com alguma coisa dentro. Arrastar o bloco é a parte fácil; usar a estrutura é o que se cobra.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Um laço vazio roda, conta e não faz nada — sem aviso nenhum. A mesma armadilha vale para o "se" e para a variável dos módulos seguintes.',
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
      prompt: 'Qual é a diferença entre "tocando em borda?" e "tocando em Maçã?"?',
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
    {
      id: 'BLK-M5-Q5', type: 'multiple_choice',
      prompt: 'Por que o bloco "tocando em Maçã?" tem forma de losango e termina em interrogação?',
      data: { options: [
        { id: 'a', text: 'Porque é uma pergunta, e só o que é pergunta encaixa no buraco do "se".', correct: true },
        { id: 'b', text: 'Porque ele pertence à categoria de Sensores, que usa essa forma.', porque: 'A categoria explica a cor, e não o formato. O losango existe para dizer que aquilo responde sim ou não.' },
        { id: 'c', text: 'Porque ele é o único bloco que pode aparecer dentro de um laço.', porque: 'Qualquer bloco entra num laço. O que o losango decide é onde ele encaixa: no buraco de uma condição.' },
        { id: 'd', text: 'Porque a forma indica que ele executa mais devagar que os outros.', porque: 'Formato não tem relação com velocidade. Ele diz que tipo de coisa o bloco devolve.' },
      ]},
      explanation: 'A forma do bloco é a gramática dos blocos: encaixe redondo é valor, losango é sim ou não, e é por isso que não dá para escrever a condição no lugar errado.',
    },
    {
      id: 'BLK-M5-Q6', type: 'scenario',
      prompt: 'O requisito pede dois atores que interajam. Você montou "se tocando em borda? então" dentro de um "sempre", e o programa roda direitinho. O requisito foi cumprido?',
      data: { scenarios: [
        { id: 'a', text: 'Não: a borda é a beirada do palco, e não o outro ator.', correct: true },
        { id: 'b', text: 'Sim, porque o ator está encostando em alguma coisa do palco.', porque: 'Encostar na beirada não é encontrar ninguém. O requisito pede que um ator perceba o outro.' },
        { id: 'c', text: 'Sim, desde que o segundo ator também tenha uma pilha rodando.', porque: 'Os dois podem ter pilhas e nunca se perceberem. A interação exige que um pergunte pelo outro.' },
        { id: 'd', text: 'Não, porque a condição precisa estar fora do laço para valer.', porque: 'Dentro do laço é o lugar certo. O que está errado é por quem a pergunta pergunta.' },
      ]},
      explanation: 'É o defeito que não aparece: o programa roda, a condição funciona, e o requisito continua por cumprir. Trocar "borda" pelo nome do outro ator é a correção inteira.',
    },
    {
      id: 'BLK-M5-Q7', type: 'true_false',
      prompt: 'Um "se" dentro de um "sempre" refaz a pergunta a cada volta do laço.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'É exatamente o que o par faz: o laço devolve a vez ao "se" continuamente, e é assim que o programa vigia alguma coisa.' },
      ]},
      explanation: 'O "se" pergunta no instante em que roda, e mais nada. Quem o faz perguntar de novo é o laço em volta — laço por fora, condição por dentro.',
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
      prompt: 'Qual é a diferença entre "mude placar para 0" e "adicione 1 a placar"?',
      data: { options: [
        { id: 'a', text: 'O primeiro troca o valor; o segundo soma ao que já havia.', correct: true },
        { id: 'b', text: 'O primeiro cria a variável e o segundo apenas a utiliza depois.', porque: 'Criar é outra coisa, feita fora da pilha. Os dois blocos supõem a variável já existindo.' },
        { id: 'c', text: 'O primeiro vale para números e o segundo para qualquer tipo de valor.', porque: 'É quase o contrário: somar só faz sentido com número. Trocar aceita qualquer valor.' },
        { id: 'd', text: 'Não há diferença: os dois escrevem um valor novo na variável.', porque: 'Com o placar em 5, "mude para 1" deixa 1 e "adicione 1" deixa 6. A diferença aparece na primeira vez que se usa.' },
      ]},
      explanation: '"Mude ... para" é usado no começo, para zerar. "Adicione ... a" é o que faz o placar subir durante o jogo. Os nomes quase se invertem em relação ao que a intuição sugere, e é por isso que vale ler o bloco na paleta antes de arrastar.',
    },
    {
      id: 'BLK-M6-Q3', type: 'multiple_choice',
      prompt: 'O "adicione 1 a placar" está dentro de um "sempre", mas fora de qualquer "se". O que se vê no jogo?',
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
    {
      id: 'BLK-M6-Q5', type: 'scenario',
      prompt: 'Na primeira partida o placar terminou em 8. Na segunda, o jogo começou marcando 8 e foi subindo dali. O que falta na pilha da bandeira?',
      data: { scenarios: [
        { id: 'a', text: 'Um "mude placar para 0" antes do laço, para zerar no começo.', correct: true },
        { id: 'b', text: 'Um "adicione 0 a placar", que devolve a contagem ao início.', porque: 'Somar zero deixa tudo como estava. Quem apaga o valor anterior é o bloco que troca, não o que soma.' },
        { id: 'c', text: 'Nada: a variável se apaga sozinha ao clicar de novo na bandeira.', porque: 'Ela guarda o valor até alguém trocá-lo. É por isso que o segundo jogo herda o placar do primeiro.' },
        { id: 'd', text: 'Apagar a variável no fim da partida e criá-la de novo depois.', porque: 'Criar e apagar variável é coisa da paleta, e não do programa rodando. O que se faz durante o jogo é trocar o valor.' },
      ]},
      explanation: 'Ninguém percebe na primeira partida — só na segunda, e aí parece que o jogo enlouqueceu. Recomeçar precisa recomeçar de verdade.',
    },
    {
      id: 'BLK-M6-Q6', type: 'multiple_choice',
      prompt: 'Por que guardar os pontos numa variável, em vez de escrever o número direto dentro do bloco?',
      data: { options: [
        { id: 'a', text: 'Porque o valor guardado pode ser lido e mudado de qualquer lugar do projeto.', correct: true },
        { id: 'b', text: 'Porque número escrito dentro do bloco não aparece no palco.', porque: 'Ele aparece se algum bloco o mostrar. O que ele não faz é mudar enquanto o jogo acontece.' },
        { id: 'c', text: 'Porque a variável faz a conta sozinha a cada volta do laço.', porque: 'Ela não calcula nada. Quem soma é o bloco que você encaixa; ela apenas guarda o resultado.' },
        { id: 'd', text: 'Porque o Scratch não aceita números soltos dentro dos blocos.', porque: 'Aceita, e eles são usados o tempo todo — em "mova 10 passos", por exemplo.' },
      ]},
      explanation: 'Um número digitado dentro de um bloco fica preso ali. Guardado com nome, ele pode subir num canto do projeto e ser comparado noutro — que é o que um placar precisa.',
    },
    {
      id: 'BLK-M6-Q7', type: 'true_false',
      prompt: 'Com o "adicione 1 a placar" dentro do "se", encostar por um segundo rende sempre exatamente um ponto.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Enquanto o encosto durar, a pergunta continua dando sim a cada volta — e o ponto é somado de novo em cada uma delas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É comportamento real, e não defeito da plataforma. Resolvê-lo — afastando a maçã logo depois do ponto — é o que faz o jogo ficar bom.',
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
    {
      id: 'BLK-M7-Q5', type: 'scenario',
      prompt: 'O gato pergunta "tocando em Maçã?" dentro de um "sempre", o programa roda, e o placar nunca sai do zero. A maçã está no alto do palco e a seta só muda o x do gato.',
      data: { scenarios: [
        { id: 'a', text: 'Eles nunca se encostam: o defeito está na geometria, não nos blocos.', correct: true },
        { id: 'b', text: 'Falta a maçã perguntar pelo gato para o encontro ser percebido.', porque: 'Basta um dos dois perguntar. Aqui a pergunta existe e está no lugar certo — o encontro é que não acontece.' },
        { id: 'c', text: 'O "tocando em" não funciona entre atores de tamanhos diferentes.', porque: 'O tamanho não influi: ele responde quando os desenhos se sobrepõem, quaisquer que sejam.' },
        { id: 'd', text: 'O placar precisa ser zerado depois da soma, e não antes.', porque: 'Zerar depois apagaria o ponto recém-marcado. O placar aqui não chega a subir nenhuma vez.' },
      ]},
      explanation: 'Programa certo e jogo que não funciona é quase sempre isto: a condição nunca chega a ser verdadeira. Antes de refazer os blocos, arraste os atores para perto e veja se o placar reage.',
    },
    {
      id: 'BLK-M7-Q6', type: 'multiple_choice',
      prompt: 'Onde a comparação "placar > 5" precisa ficar para decidir o fim do jogo?',
      data: { options: [
        { id: 'a', text: 'Dentro do mesmo "sempre" que vigia o resto do jogo.', correct: true },
        { id: 'b', text: 'Logo abaixo do chapéu, antes do laço começar.', porque: 'Ali ela pergunta uma vez, com o placar ainda em zero, e a resposta é sempre não.' },
        { id: 'c', text: 'Encaixada depois do "sempre", no fim da pilha.', porque: 'Nada depois de um "sempre" chega a rodar: o laço não termina.' },
        { id: 'd', text: 'Numa pilha própria, sem chapéu, ao lado das outras.', porque: 'Pilha sem chapéu nunca executa. A comparação ficaria na tela sem nunca ser feita.' },
      ]},
      explanation: 'O placar muda o tempo todo, então a pergunta precisa ser refeita o tempo todo. É o mesmo motivo pelo qual o "se" do encontro mora dentro do laço.',
    },
    {
      id: 'BLK-M7-Q7', type: 'true_false',
      prompt: 'Parar o projeto pelo botão vermelho conta como a condição de vitória que o requisito pede.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O botão vermelho funciona em qualquer projeto, até no que não tem jogo nenhum. O requisito pede uma condição escrita no programa.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Desistir não é ganhar. O que transforma o brinquedo em jogo é haver, dentro do programa, um jeito de vencer ou de perder.',
    },
  ],
};
