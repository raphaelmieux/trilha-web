import type { Module } from '../../types';

/*
 * AP041 módulo 3 — a função de cada uma das nove peças do requisito 4.
 *
 * O documento oficial pede as nove numa lista solta: teclado, mouse, monitor,
 * impressora, scanner, CPU, cabos, modem e roteador. Decoradas assim, uma a uma,
 * elas não se sustentam por muito tempo na cabeça de ninguém.
 *
 * As lições reagrupam a lista pelo ciclo entrada → processamento → saída, e
 * deixam modem e roteador por último, juntos, porque confundir os dois é o erro
 * mais comum do assunto. Cada peça continua tendo o seu requisito; muda só a
 * ordem em que aparecem, que passa a ter um motivo.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">As peças que levam coisas para dentro</h2>
<p class="mb-3">O computador faz sempre a mesma sequência: recebe alguma coisa,
pensa no que fazer com ela e devolve um resultado. Entrada, processamento e
saída — e cada peça da máquina trabalha em uma dessas três etapas.</p>
<p class="mb-3">Esta lição é sobre a primeira: as peças de <strong>entrada</strong>,
que levam informação de fora para dentro do computador.</p>

<h3 class="font-bold mt-4 mb-2">Teclado: mandar letras e comandos</h3>
<p class="mb-3">O <strong>teclado</strong> envia ao computador as letras, os
números e os comandos que você digita. Cada tecla apertada vira um sinal que a
máquina entende.</p>
<p class="mb-3">Ele também dá ordens sem escrever nada: o Enter confirma, o Esc
cancela, e Ctrl+C copia o que está selecionado.</p>

<h3 class="font-bold mt-4 mb-2">Mouse: apontar e escolher</h3>
<p class="mb-3">O <strong>mouse</strong> move a setinha pela tela, e o clique diz
"é este aqui". Ele não escreve: aponta, escolhe, arrasta e abre.</p>
<p class="mb-3">Antes do mouse, tudo era feito digitando o nome de cada comando.
Poder apontar para o que se quer foi o que deixou o computador fácil o bastante
para qualquer pessoa usar.</p>

<h3 class="font-bold mt-4 mb-2">Scanner: copiar o papel para dentro</h3>
<p class="mb-3">O <strong>scanner</strong> olha para uma folha — um desenho, uma
foto, um documento — e cria no computador um arquivo com aquela imagem. É uma
máquina de fotocópia que, em vez de cuspir outra folha, devolve um arquivo.</p>
<p class="mb-3">O papel original não muda em nada: continua na sua mão do mesmo
jeito. O que o scanner faz é uma cópia digital dele.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>O que os três têm em comum:</strong> digitar, clicar e digitalizar
  são três jeitos de dizer ao computador "olha o que eu estou te dando". Nenhum
  deles mostra resultado — isso é da próxima lição.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">As peças que mostram o resultado</h2>
<p class="mb-3">Depois de receber e pensar, o computador precisa devolver alguma
coisa. As peças de <strong>saída</strong> entregam esse resultado a você — uma
em luz, na tela; a outra em tinta, no papel.</p>

<h3 class="font-bold mt-4 mb-2">Monitor: o resultado em luz</h3>
<p class="mb-3">O <strong>monitor</strong> mostra em imagem o que está
acontecendo: o texto que você digita, o site que abriu, o jogo rodando. Sem ele
o computador continuaria funcionando — você é que não veria nada.</p>
<p class="mb-3">A tela é feita de milhões de pontinhos coloridos, os
<em>pixels</em>. Quanto mais pixels, mais detalhe cabe na imagem.</p>
<p class="mb-3">Cuidado com uma confusão comum: no computador de mesa, o monitor
é só a tela. O computador mesmo está no gabinete, ao lado.</p>

<h3 class="font-bold mt-4 mb-2">Impressora: o resultado em tinta</h3>
<p class="mb-3">A <strong>impressora</strong> pega um arquivo que está no
computador e o passa para o papel. Serve para o que precisa sair da tela: o
trabalho da escola, uma foto para a parede, o cartaz do clube.</p>
<p class="mb-3">Ela imprime exatamente o que recebe. Se o texto foi enviado com
erro, o erro sai impresso junto — conferir antes economiza papel e tinta.</p>

<h3 class="font-bold mt-4 mb-2">A impressora e o scanner são opostos</h3>
<p class="mb-3">Repare no caminho de cada um. O scanner vai do <strong>papel para
o arquivo</strong>; a impressora vai do <strong>arquivo para o papel</strong>. Um
é a volta do outro.</p>
<p class="mb-3">Por isso existem aparelhos que fazem as duas coisas, as
multifuncionais: são um scanner e uma impressora na mesma caixa.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Para não esquecer:</strong> entrou pelo teclado, pelo mouse ou pelo
  scanner. Saiu pelo monitor ou pela impressora.</p>
</div>
`;

const conteudo_L3 = `
<h2 class="text-xl font-bold mb-3">Quem decide e quem transporta</h2>
<p class="mb-3">Você já viu o que entra e o que sai. Falta o meio do caminho: a
peça que pensa, e o que liga uma peça à outra para que consigam trabalhar juntas.</p>

<h3 class="font-bold mt-4 mb-2">CPU: o cérebro da máquina</h3>
<p class="mb-3">A <strong>CPU</strong> é a unidade central de processamento — o
cérebro do computador. É ela que faz as contas e decide o que acontece em
seguida: abrir a janela, somar os números, desenhar o próximo quadro do jogo.</p>
<p class="mb-3">Tudo passa por ela. Você aperta uma tecla: a CPU recebe o sinal,
descobre que letra é e manda o monitor desenhá-la. Isso acontece bilhões de vezes
por segundo, e é por isso que parece instantâneo.</p>
<p class="mb-3">Ela é uma pastilha pequena, do tamanho de um selo, encaixada na
placa de dentro do gabinete. Muita gente chama o gabinete inteiro de "CPU" — mas
a CPU mesmo é só aquela pastilha lá dentro.</p>

<h3 class="font-bold mt-4 mb-2">Cabos: as veias do computador</h3>
<p class="mb-3">Os <strong>cabos</strong> levam duas coisas de um ponto a outro:
<strong>energia</strong>, para a peça funcionar, e <strong>informação</strong>,
para ela saber o que fazer.</p>
<p class="mb-3">O cabo da tomada traz energia. O que vai do gabinete ao monitor
leva a imagem. O do mouse leva para dentro o movimento que você fez. Cada um tem
o seu encaixe, feito para entrar de um jeito só.</p>
<p class="mb-3">Quando alguma coisa para de funcionar sem motivo aparente, o cabo
solto é a primeira suspeita — e a mais fácil de resolver.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>A dupla:</strong> a CPU decide, e o cabo entrega a decisão. Ordem
  que não chega até a peça é o mesmo que ordem nenhuma.</p>
</div>
`;

const conteudo_L4 = `
<h2 class="text-xl font-bold mb-3">Como a internet entra em casa</h2>
<p class="mb-3">A internet não está dentro do seu computador: ela vem de fora, por
um cabo da rua. Duas peças fazem esse sinal chegar até você, e o trabalho de cada
uma é bem diferente.</p>

<h3 class="font-bold mt-4 mb-2">Modem: a porta de entrada</h3>
<p class="mb-3">O <strong>modem</strong> recebe o sinal da operadora e o traduz
para algo que os aparelhos da casa entendem. É a porta por onde a internet entra
— e também por onde sai tudo o que você envia.</p>
<p class="mb-3">Sem modem, o cabo da rua chega à parede e para ali. É como a carta
que chega ao portão e não tem quem leve para dentro.</p>

<h3 class="font-bold mt-4 mb-2">Roteador: quem reparte</h3>
<p class="mb-3">O sinal entrou, mas em casa tem um computador, dois celulares e a
televisão querendo usar ao mesmo tempo. O <strong>roteador</strong> reparte essa
internet entre todos e, o mais importante, lembra quem pediu o quê — para
entregar cada resposta ao aparelho certo.</p>
<p class="mb-3">É ele também que cria a rede Wi-Fi, por onde os aparelhos se ligam
sem fio nenhum.</p>
<p class="mb-3">Repartir não é multiplicar: a velocidade continua sendo a que foi
contratada. Com muita gente baixando ao mesmo tempo, cada um fica com um pedaço
menor.</p>

<h3 class="font-bold mt-4 mb-2">Duas funções, quase sempre numa caixa só</h3>
<p class="mb-3">Na maioria das casas a operadora instala uma caixinha única, que
é modem e roteador ao mesmo tempo. Isso não faz deles a mesma coisa: são duas
tarefas diferentes acontecendo dentro do mesmo aparelho.</p>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Peça</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">O que faz</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Conversa com</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">Modem</td><td class="py-2">Traz o sinal da rua para dentro</td><td class="py-2">A operadora</td>
  </tr>
  <tr>
    <td class="py-2">Roteador</td><td class="py-2">Reparte o sinal que já chegou</td><td class="py-2">Os aparelhos da casa</td>
  </tr>
</table>
`;

export const modulo3: Module = {
  code: 'AP041.3',
  title: 'As peças e o que cada uma faz',
  description: 'Teclado, mouse, monitor, impressora, scanner, CPU, cabos, modem e roteador.',
  lessons: [
    {
      code: 'AP041.3-L1',
      title: 'Levar para dentro: teclado, mouse e scanner',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP041-4.1', 'AP041-4.2', 'AP041-4.5'],
      questions: [
        {
          id: 'AP041.3-L1-Q1', type: 'multiple_choice',
          prompt: 'Qual é a função do teclado?',
          data: { options: [
            { id: 'a', text: 'Enviar letras, números e comandos para dentro do computador.', correct: true },
            { id: 'b', text: 'Mostrar na tela aquilo que o computador terminou de fazer.',
              porque: 'Isso é o monitor. O teclado leva informação para dentro; o monitor traz o resultado para fora.' },
            { id: 'c', text: 'Guardar os textos digitados para abrir de novo mais tarde.',
              porque: 'Guardar é tarefa do HD ou do SSD. O teclado envia o que você digita e não retém nada.' },
            { id: 'd', text: 'Ligar o computador à internet por meio do cabo de rede.',
              porque: 'Isso é o modem com o roteador. O teclado não tem relação nenhuma com rede.' },
          ]},
          explanation: 'Cada tecla apertada vira um sinal que entra na máquina — inclusive as que não escrevem, como Enter e Esc.',
        },
        {
          id: 'AP041.3-L1-Q2', type: 'multiple_choice',
          prompt: 'O que o mouse faz?',
          data: { options: [
            { id: 'a', text: 'Escreve as palavras que aparecem dentro dos programas abertos.',
              porque: 'Escrever é com o teclado. O mouse aponta e escolhe, mas não digita letra nenhuma.' },
            { id: 'b', text: 'Aponta um lugar na tela e clica para escolher o que está ali.', correct: true },
            { id: 'c', text: 'Aumenta a velocidade do computador quando ele está travando.',
              porque: 'Velocidade vem da CPU e da memória RAM. Mexer o mouse não acelera coisa alguma.' },
            { id: 'd', text: 'Copia para o computador uma foto de papel colocada sobre ele.',
              porque: 'Isso é o scanner. O mouse não enxerga nada: só informa para onde você o moveu.' },
          ]},
          explanation: 'Poder apontar para o que se quer foi o que deixou o computador fácil o bastante para qualquer pessoa usar.',
        },
        {
          id: 'AP041.3-L1-Q3', type: 'multiple_choice',
          prompt: 'Para que serve o scanner?',
          data: { options: [
            { id: 'a', text: 'Passar para o papel um arquivo que está dentro do computador.',
              porque: 'Esse é o caminho da impressora, que é o contrário: do arquivo para o papel.' },
            { id: 'b', text: 'Procurar vírus escondidos nos arquivos guardados na máquina.',
              porque: 'Isso é o antivírus, que é software. O scanner é peça, e o que ele faz é copiar papel.' },
            { id: 'c', text: 'Transformar em arquivo digital um papel, uma foto ou um desenho.', correct: true },
            { id: 'd', text: 'Guardar cópias dos documentos importantes fora do computador.',
              porque: 'Guardar cópia fora é o pen drive ou a nuvem. O scanner cria o arquivo, mas não o guarda.' },
          ]},
          explanation: 'É uma fotocopiadora que, em vez de cuspir outra folha, devolve um arquivo — e o papel original continua igual.',
        },
        {
          id: 'AP041.3-L1-Q4', type: 'true_false',
          prompt: 'Teclado, mouse e scanner são aparelhos de entrada: os três levam informação para dentro do computador.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso',
              porque: 'É verdadeiro. Digitar, clicar e digitalizar são três jeitos de a informação entrar; sair é tarefa do monitor e da impressora.' },
          ]},
          explanation: 'Entrada, processamento e saída: os três são a primeira etapa desse ciclo.',
        },
        {
          id: 'AP041.3-L1-Q5', type: 'matching',
          prompt: 'Ligue cada aparelho ao jeito como ele leva informação para dentro.',
          data: { pairs: [
            { left: 'Teclado', right: 'Manda letras, números e comandos' },
            { left: 'Mouse', right: 'Aponta e escolhe o que está na tela' },
            { left: 'Scanner', right: 'Copia para dentro o que está no papel' },
          ]},
          explanation: 'Três portas de entrada diferentes, cada uma para um tipo de informação.',
        },
        {
          id: 'AP041.3-L1-Q6', type: 'scenario',
          prompt: 'A Marta tem uma foto antiga da avó, só em papel, e quer guardá-la no computador. Que aparelho resolve isso?',
          data: { scenarios: [
            { id: 'a', text: 'O scanner, que lê o papel e transforma a imagem em arquivo.', correct: true },
            { id: 'b', text: 'A impressora, que passa a foto do papel para dentro da máquina.',
              porque: 'A impressora faz o caminho contrário: tira de dentro e põe no papel.' },
            { id: 'c', text: 'O monitor, que mostra a foto assim que ela for encostada nele.',
              porque: 'O monitor só exibe o que o computador já tem. Ele não enxerga nada.' },
            { id: 'd', text: 'O teclado, digitando a descrição da foto letra por letra.',
              porque: 'Isso guardaria um texto sobre a foto, e não a foto. A imagem continuaria só no papel.' },
          ]},
          explanation: 'Scanner é o olho do computador: ele lê o que existe no mundo e devolve como arquivo.',
        },
        {
          id: 'AP041.3-L1-Q7', type: 'multiple_choice',
          prompt: 'O que teclado, mouse e scanner têm em comum?',
          data: { options: [
            { id: 'a', text: 'Os três levam alguma informação para dentro da máquina.', correct: true },
            { id: 'b', text: 'Os três mostram para a pessoa o que a máquina produziu.',
              porque: 'Quem mostra é a saída, como o monitor. Estes três fazem o caminho de entrada.' },
            { id: 'c', text: 'Os três precisam estar ligados na tomada para funcionar.',
              porque: 'Mouse e teclado costumam se alimentar pelo próprio cabo do computador, ou por pilha.' },
            { id: 'd', text: 'Os três guardam o que foi feito para consultar mais tarde.',
              porque: 'Nenhum deles guarda nada: entregam ao computador e o computador é quem guarda.' },
          ]},
          explanation: 'Entrada é tudo que leva informação para dentro. Muda o jeito — letra, movimento, imagem —, mas a direção é a mesma.',
        },
        {
          id: 'AP041.3-L1-Q8', type: 'true_false',
          prompt: 'O scanner serve para imprimir em papel uma cópia do documento que está no computador.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'Isso é a impressora. O scanner faz o contrário: pega o que está no papel e leva para dentro.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Muita gente troca os dois porque vivem na mesma caixa. Scanner lê o papel; impressora escreve nele.',
        },
      ],
    },

    {
      code: 'AP041.3-L2',
      title: 'Mostrar para fora: monitor e impressora',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP041-4.3', 'AP041-4.4'],
      questions: [
        {
          id: 'AP041.3-L2-Q1', type: 'multiple_choice',
          prompt: 'Qual é a função do monitor?',
          data: { options: [
            { id: 'a', text: 'Processar as contas que os programas abertos precisam fazer.',
              porque: 'Quem faz as contas é a CPU. O monitor apenas exibe o resultado que ela já calculou.' },
            { id: 'b', text: 'Mostrar em imagem aquilo que o computador está fazendo.', correct: true },
            { id: 'c', text: 'Guardar as imagens e os vídeos que aparecem durante o uso.',
              porque: 'Guardar é com o HD ou o SSD. Saiu da tela, o monitor não fica com nada.' },
            { id: 'd', text: 'Receber os cliques que a pessoa dá em cima dos programas.',
              porque: 'Receber clique é do mouse — ou da tela sensível ao toque, que é um caso à parte.' },
          ]},
          explanation: 'Sem monitor o computador continua funcionando; você é que não vê o que ele está fazendo.',
        },
        {
          id: 'AP041.3-L2-Q2', type: 'multiple_choice',
          prompt: 'O que a impressora faz?',
          data: { options: [
            { id: 'a', text: 'Traz para o computador aquilo que está escrito no papel.',
              porque: 'Esse é o scanner. A impressora vai no sentido contrário: do arquivo para a folha.' },
            { id: 'b', text: 'Mostra na tela o documento antes de ele ser salvo em disco.',
              porque: 'Mostrar na tela é do monitor. A impressora só entrega em papel.' },
            { id: 'c', text: 'Passa para o papel um arquivo que está no computador.', correct: true },
            { id: 'd', text: 'Corrige os erros de escrita antes de o texto acabar saindo.',
              porque: 'Corrigir é tarefa do programa de texto. A impressora imprime o que receber, erro e tudo.' },
          ]},
          explanation: 'Ela imprime exatamente o que recebe — conferir antes economiza papel e tinta.',
        },
        {
          id: 'AP041.3-L2-Q3', type: 'scenario',
          prompt: 'A Ana digitalizou o desenho dela e depois imprimiu uma cópia para a avó. O que aconteceu em cada passo?',
          data: { scenarios: [
            { id: 'a', text: 'Os dois passos fizeram a mesma coisa, porque scanner e impressora trabalham do mesmo jeito.',
              porque: 'Trabalham em sentidos opostos: um é papel para arquivo, o outro é arquivo para papel.' },
            { id: 'b', text: 'Digitalizar levou o desenho do papel para dentro, e imprimir devolveu ele ao papel.', correct: true },
            { id: 'c', text: 'Digitalizar imprimiu o desenho, e imprimir guardou uma cópia dele no computador.',
              porque: 'Está trocado. Quem imprime é a impressora, e guardar não é tarefa de nenhum dos dois.' },
            { id: 'd', text: 'Digitalizar apagou o desenho do papel, e imprimir criou um desenho novo do zero.',
              porque: 'Digitalizar não apaga nada: o papel original continua igualzinho depois de escaneado.' },
          ]},
          explanation: 'Scanner e impressora são o mesmo caminho em sentidos opostos. Por isso cabem os dois numa multifuncional.',
        },
        {
          id: 'AP041.3-L2-Q4', type: 'true_false',
          prompt: 'O monitor e a impressora são aparelhos de saída: os dois entregam um resultado que o computador já produziu.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso',
              porque: 'É verdadeiro. Um entrega o resultado em luz na tela e o outro em tinta no papel, mas os dois entregam para fora.' },
          ]},
          explanation: 'Entrou pelo teclado, pelo mouse ou pelo scanner; saiu pelo monitor ou pela impressora.',
        },
        {
          id: 'AP041.3-L2-Q5', type: 'scenario',
          prompt: 'O Téo terminou o trabalho de geografia e a professora pediu para entregar em papel. O que ele usa?',
          data: { scenarios: [
            { id: 'a', text: 'A impressora, que põe no papel o que está no arquivo.', correct: true },
            { id: 'b', text: 'O scanner, que passa o trabalho da tela para a folha.',
              porque: 'O scanner faz o contrário: lê o papel e leva para dentro do computador.' },
            { id: 'c', text: 'O monitor, deixando o trabalho aberto para a professora ver.',
              porque: 'Isso mostra na tela, mas não entrega nada em papel, que foi o que ela pediu.' },
            { id: 'd', text: 'O teclado, digitando de novo o trabalho inteiro numa folha.',
              porque: 'O teclado leva letras para dentro da máquina. Ele não escreve em papel nenhum.' },
          ]},
          explanation: 'Monitor e impressora são as duas saídas: uma mostra por um tempo, a outra entrega para levar embora.',
        },
        {
          id: 'AP041.3-L2-Q6', type: 'multiple_choice',
          prompt: 'Por que o monitor e a impressora são chamados de aparelhos de saída?',
          data: { options: [
            { id: 'a', text: 'Porque entregam para fora o que a máquina já produziu.', correct: true },
            { id: 'b', text: 'Porque ficam do lado de fora do gabinete, e não dentro dele.',
              porque: 'O teclado também fica do lado de fora, e é entrada. O que decide é a direção da informação.' },
            { id: 'c', text: 'Porque são os últimos aparelhos a serem ligados na tomada.',
              porque: 'A ordem de ligar não tem nada a ver. Entrada e saída falam do caminho da informação.' },
            { id: 'd', text: 'Porque só funcionam depois que o computador termina de ligar.',
              porque: 'O monitor mostra a máquina ligando, desde o primeiro instante. Não é isso que os define.' },
          ]},
          explanation: 'Entrada leva para dentro, saída traz para fora. É a direção que dá nome, e não o lugar do aparelho.',
        },
        {
          id: 'AP041.3-L2-Q7', type: 'matching',
          prompt: 'Ligue cada aparelho ao caminho que a informação faz nele.',
          data: { pairs: [
            { left: 'Teclado', right: 'Da pessoa para dentro do computador' },
            { left: 'Monitor', right: 'De dentro do computador para os olhos' },
            { left: 'Scanner', right: 'Do papel para dentro do computador' },
            { left: 'Impressora', right: 'De dentro do computador para o papel' },
          ]},
          explanation: 'Dois pares que se espelham: scanner e impressora fazem o mesmo trajeto em sentidos opostos.',
        },
      ],
    },

    {
      code: 'AP041.3-L3',
      title: 'O cérebro e as veias: CPU e cabos',
      type: 'theory',
      content: conteudo_L3,
      requirementCodes: ['AP041-4.6', 'AP041-4.7'],
      questions: [
        {
          id: 'AP041.3-L3-Q1', type: 'multiple_choice',
          prompt: 'Qual é a função da CPU?',
          data: { options: [
            { id: 'a', text: 'Guardar os arquivos e os programas de forma permanente.',
              porque: 'Guardar é com o HD ou o SSD. A CPU trabalha com a informação, mas não fica com ela.' },
            { id: 'b', text: 'Mostrar o resultado das operações para quem está usando.',
              porque: 'Mostrar é do monitor. A CPU calcula, e outra peça exibe o que ela calculou.' },
            { id: 'c', text: 'Fazer as contas e comandar o que cada peça deve fazer.', correct: true },
            { id: 'd', text: 'Ligar o computador aos outros aparelhos da casa por rede.',
              porque: 'Isso é o roteador. A CPU trabalha dentro da máquina e não cuida de rede.' },
          ]},
          explanation: 'CPU quer dizer unidade central de processamento: é o cérebro, e tudo passa por ela.',
        },
        {
          id: 'AP041.3-L3-Q2', type: 'multiple_choice',
          prompt: 'Para que servem os cabos de um computador?',
          data: { options: [
            { id: 'a', text: 'Segurar as peças no lugar para que elas não se soltem.',
              porque: 'Quem prende é o parafuso e o encaixe. Cabo serve para transportar, não para segurar.' },
            { id: 'b', text: 'Fazer as contas que os programas pedem enquanto rodam.',
              porque: 'Quem calcula é a CPU. O cabo só carrega o sinal de um lado para o outro.' },
            { id: 'c', text: 'Guardar informação enquanto o computador está desligado.',
              porque: 'Guardar é do HD ou do SSD. Um cabo desligado não fica com nada dentro dele.' },
            { id: 'd', text: 'Levar energia e informação de uma peça até a outra.', correct: true },
          ]},
          explanation: 'Duas coisas viajam por eles: energia, para a peça funcionar, e informação, para ela saber o que fazer.',
        },
        {
          id: 'AP041.3-L3-Q3', type: 'scenario',
          prompt: 'O computador do João trava toda vez que ele abre muitos programas ao mesmo tempo. Quais peças estão sendo exigidas?',
          data: { scenarios: [
            { id: 'a', text: 'O monitor, que precisa desenhar mais janelas do que consegue mostrar de uma vez.',
              porque: 'O monitor só exibe. Ele mostra a mesma quantidade de pixels com uma janela ou com dez.' },
            { id: 'b', text: 'A CPU, que tem mais contas para dar conta, e a RAM, onde tudo o que está aberto fica.', correct: true },
            { id: 'c', text: 'Os cabos, que ficam sobrecarregados de tanta informação passando ao mesmo tempo.',
              porque: 'Cabo não engarrafa assim. O aperto está em quem calcula e em onde as coisas ficam abertas.' },
            { id: 'd', text: 'O teclado e o mouse, que precisam mandar comandos para vários programas de uma vez.',
              porque: 'Eles mandam um comando por vez, para a janela que está na frente — e isso não pesa nada.' },
          ]},
          explanation: 'Travar com muita coisa aberta é sinal de CPU ocupada demais ou de RAM cheia — as duas peças do meio do caminho.',
        },
        {
          id: 'AP041.3-L3-Q4', type: 'fill_blank',
          prompt: 'Complete: a peça que faz as contas e comanda as outras é a _____; quem leva energia e sinal de uma peça à outra é o _____.',
          data: {
            blanks: [
              { id: 'b1', answer: 'CPU', aceitas: ['cpu', 'processador'], hint: 'O cérebro da máquina' },
              { id: 'b2', answer: 'cabo', aceitas: ['cabos', 'fio', 'fios'], hint: 'Liga uma peça à outra' },
            ],
          },
          explanation: 'A CPU decide, e o cabo entrega a decisão. Ordem que não chega até a peça é o mesmo que ordem nenhuma.',
        },
        {
          id: 'AP041.3-L3-Q5', type: 'multiple_choice',
          prompt: 'Por que a CPU é chamada de cérebro do computador?',
          data: { options: [
            { id: 'a', text: 'Porque faz as contas e manda nas outras peças.', correct: true },
            { id: 'b', text: 'Porque é a peça maior e mais pesada de todas elas.',
              porque: 'A CPU é pequena, do tamanho de uma tampinha. O apelido vem do que ela faz.' },
            { id: 'c', text: 'Porque é nela que ficam guardados todos os arquivos.',
              porque: 'Guardar é trabalho do disco. A CPU trabalha com o que chega e passa adiante.' },
            { id: 'd', text: 'Porque é a única peça que fica ligada na tomada.',
              porque: 'A máquina inteira recebe energia. E não é a tomada que faz dela o cérebro.' },
          ]},
          explanation: 'Cérebro porque decide: toda tecla apertada e todo pixel na tela passaram por uma decisão dela.',
        },
        {
          id: 'AP041.3-L3-Q6', type: 'scenario',
          prompt: 'O computador do clube liga, faz barulho e acende a luzinha, mas a tela fica preta. Qual é a primeira coisa a conferir?',
          data: { scenarios: [
            { id: 'a', text: 'Se o cabo que liga o monitor à máquina está bem encaixado.', correct: true },
            { id: 'b', text: 'Se a memória ROM foi apagada quando o computador desligou.',
              porque: 'A ROM não se apaga. E se ela falhasse, a máquina nem chegaria a fazer barulho.' },
            { id: 'c', text: 'Se o teclado está com alguma tecla presa por causa de migalha.',
              porque: 'Tecla presa atrapalha o que se digita, e não faz a tela ficar preta.' },
            { id: 'd', text: 'Se o programa que estava aberto ontem foi fechado direito.',
              porque: 'A máquina ligando e a tela apagada é sinal de caminho interrompido, não de programa.' },
          ]},
          explanation: 'A máquina está funcionando: o que faltou foi o sinal chegar até a tela. Cabo solto é a causa mais comum, e a mais fácil de resolver.',
        },
        {
          id: 'AP041.3-L3-Q7', type: 'true_false',
          prompt: 'Os cabos de um computador servem só para levar energia elétrica.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'Muitos levam informação: o cabo do monitor carrega a imagem, e o de rede carrega os dados.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Há cabo de energia e cabo de sinal. Os dois ligam peças, mas um leva força e o outro leva conversa.',
        },
      ],
    },

    {
      code: 'AP041.3-L4',
      title: 'Chegar até a internet: modem e roteador',
      type: 'theory',
      content: conteudo_L4,
      requirementCodes: ['AP041-4.8', 'AP041-4.9'],
      questions: [
        {
          id: 'AP041.3-L4-Q1', type: 'multiple_choice',
          prompt: 'Qual é a função do modem?',
          data: { options: [
            { id: 'a', text: 'Dividir a internet entre os aparelhos que estão na casa.',
              porque: 'Isso é o roteador. O modem traz o sinal; repartir vem depois, e é outro trabalho.' },
            { id: 'b', text: 'Trazer o sinal da internet da rua para dentro de casa.', correct: true },
            { id: 'c', text: 'Guardar as páginas visitadas para que abram mais rápido.',
              porque: 'Isso é o cache do navegador, que é software. O modem não guarda página nenhuma.' },
            { id: 'd', text: 'Proteger a casa dos vírus que chegam pela internet.',
              porque: 'Proteger é do antivírus e do firewall. O modem só faz o sinal entrar e sair.' },
          ]},
          explanation: 'Sem modem, o cabo da rua chega à parede e para ali — como a carta que fica no portão.',
        },
        {
          id: 'AP041.3-L4-Q2', type: 'multiple_choice',
          prompt: 'O que o roteador faz?',
          data: { options: [
            { id: 'a', text: 'Traz o sinal da internet da rua até a casa, pelo cabo da operadora.',
              porque: 'Isso é o modem. O roteador só entra em ação depois, quando o sinal já chegou.' },
            { id: 'b', text: 'Aumenta a velocidade contratada, deixando a internet mais rápida.',
              porque: 'A velocidade é a que foi contratada. O roteador reparte o que chega, e não cria mais.' },
            { id: 'c', text: 'Reparte a internet e manda cada resposta ao aparelho certo.', correct: true },
            { id: 'd', text: 'Guarda os sites visitados por todos os aparelhos ligados a ele.',
              porque: 'O roteador encaminha, não arquiva conteúdo. O histórico fica no navegador de cada um.' },
          ]},
          explanation: 'O trabalho difícil dele é lembrar quem pediu o quê, para entregar cada resposta a quem pediu.',
        },
        {
          id: 'AP041.3-L4-Q3', type: 'true_false',
          prompt: 'Um mesmo aparelho pode ser modem e roteador ao mesmo tempo.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso',
              porque: 'É verdadeiro. A caixinha que a operadora instala costuma juntar os dois, mas continuam sendo duas funções diferentes.' },
          ]},
          explanation: 'Caber na mesma caixa não faz deles a mesma coisa: são duas tarefas dentro de um aparelho só.',
        },
        {
          id: 'AP041.3-L4-Q4', type: 'ordering',
          prompt: 'Ordene o caminho que um vídeo percorre até aparecer no celular de quem está em casa.',
          data: {
            items: [
              { id: 'a', text: 'O sinal chega à casa pelo cabo da operadora, vindo da rua', order: 1 },
              { id: 'b', text: 'O modem traduz esse sinal para algo que a rede de casa entende', order: 2 },
              { id: 'c', text: 'O roteador reparte o sinal e o envia ao aparelho que pediu', order: 3 },
              { id: 'd', text: 'O celular recebe os dados e o vídeo começa a rodar na tela', order: 4 },
            ],
          },
          explanation: 'Rua, modem, roteador, aparelho. O modem traz de fora; o roteador distribui lá dentro.',
        },
        {
          id: 'AP041.3-L4-Q5', type: 'scenario',
          prompt: 'A internet caiu na casa da Bia. O técnico disse que o aparelho que traz o sinal da rua queimou. Qual peça precisa ser trocada?',
          data: { scenarios: [
            { id: 'a', text: 'O roteador, que é quem faz o sinal chegar da rua até dentro da casa.',
              porque: 'O roteador fica depois do modem: reparte o sinal que já chegou, e não vai buscá-lo.' },
            { id: 'b', text: 'A CPU do computador, já que é ela que comanda tudo o que a máquina faz.',
              porque: 'A CPU trabalha dentro do computador. A internet cai igual, mesmo com a CPU perfeita.' },
            { id: 'c', text: 'O modem, que recebe o sinal da operadora e o entrega à rede de casa.', correct: true },
            { id: 'd', text: 'O monitor, porque sem ele não dá para ver se as páginas estão abrindo.',
              porque: 'Sem monitor você não enxerga, mas o sinal continua chegando. O problema não é de exibição.' },
          ]},
          explanation: 'Quem faz a ponte com a rua é o modem. O roteador só trabalha com o que já entrou.',
        },
        {
          id: 'AP041.3-L4-Q6', type: 'scenario',
          prompt: 'Na sala, o Wi-Fi funciona bem. No quarto do fundo, quase não pega. A internet da casa está com problema?',
          data: { scenarios: [
            { id: 'a', text: 'Não: o sinal chega, e o alcance do roteador é que não vai longe.', correct: true },
            { id: 'b', text: 'Sim: o modem parou de receber o sinal que vem da rua.',
              porque: 'Se o modem tivesse parado, a sala também ficaria sem internet. O sinal está entrando.' },
            { id: 'c', text: 'Sim: a operadora deve ter cortado parte do sinal contratado.',
              porque: 'Corte de sinal atinge a casa inteira, e não um cômodo só. Isto é distância.' },
            { id: 'd', text: 'Não: o celular do quarto é que deve estar com defeito no aparelho.',
              porque: 'Qualquer aparelho perde sinal naquele ponto. O problema é o alcance, não o telefone.' },
          ]},
          explanation: 'O sinal do roteador enfraquece com a distância e com as paredes no caminho. Ele reparte bem, mas só até onde alcança.',
        },
        {
          id: 'AP041.3-L4-Q7', type: 'multiple_choice',
          prompt: 'O que o roteador faz que o modem não faz?',
          data: { options: [
            { id: 'a', text: 'Reparte a mesma internet entre vários aparelhos da casa.', correct: true },
            { id: 'b', text: 'Traz o sinal da rua para dentro, vindo da operadora.',
              porque: 'Esse é justamente o trabalho do modem. O roteador só mexe no que já entrou.' },
            { id: 'c', text: 'Guarda as páginas visitadas para abrir mais depressa.',
              porque: 'Quem guarda página aberta há pouco é o navegador, no próprio aparelho.' },
            { id: 'd', text: 'Aumenta a velocidade contratada junto com a operadora.',
              porque: 'A velocidade é a que foi contratada. O roteador divide o que existe, não cria mais.' },
          ]},
          explanation: 'Modem é a porta da rua; roteador é o corredor que leva a cada quarto.',
        },
        {
          id: 'AP041.3-L4-Q8', type: 'matching',
          prompt: 'Ligue cada peça ao trabalho dela.',
          data: { pairs: [
            { left: 'Modem', right: 'Recebe o sinal que vem da rua' },
            { left: 'Roteador', right: 'Reparte o sinal entre os aparelhos' },
            { left: 'Cabo de rede', right: 'Liga um aparelho sem depender do Wi-Fi' },
            { left: 'CPU', right: 'Faz as contas dentro do computador' },
          ]},
          explanation: 'Os três primeiros levam a informação até a máquina; o quarto é quem trabalha com ela depois que chega.',
        },
      ],
    },
  ],
};
