import type { Module } from '../../types';

/*
 * AP043 módulo 1 — os sete termos que o requisito 2 manda definir.
 *
 * Seis deles são peça: placa mãe, placa de vídeo, placa de som, as portas e a
 * fonte. O sétimo, banco de dados, não é — e o documento o pôs na mesma lista.
 * Fingir que ele encaixa ali seria ensinar errado; então ele ganha lição
 * própria, que começa dizendo que ele é o estranho da lista e termina
 * explicando por que a palavra aparece justamente aqui: num escritório, é a
 * ele que os computadores conectados costumam estar falando. É a ponte para o
 * requisito 7, no módulo 5.
 *
 * ── A armadilha destas definições ────────────────────────────────────────
 * Placa de vídeo e placa de som são, na esmagadora maioria das máquinas de
 * hoje, um pedaço da placa mãe — e não uma placa separada. Quem estuda por
 * lista decora "placa de vídeo: a placa que faz a imagem", abre um computador,
 * não acha nenhuma, e conclui que a máquina está incompleta. As duas lições
 * dizem isso na cara: a peça avulsa existe para quem precisa de mais, e a
 * ausência dela é o normal.
 *
 * ── E a fonte é a ponte com a AP042 ──────────────────────────────────────
 * O requisito 5 da AP042 pede saber proteger o computador de oscilações de
 * energia. A fonte é a peça que recebe o tranco primeiro, e dizer isso aqui é
 * o que liga uma trilha à outra em vez de repetir a lição anterior.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">A placa onde tudo se encaixa</h2>
<p class="mb-3">Abra um computador de mesa e a primeira coisa que se vê é uma
placa verde grande, ocupando quase todo o fundo da caixa. É a
<strong>placa mãe</strong>, e o nome descreve bem o que ela faz: todas as
outras peças se encaixam nela.</p>

<h3 class="font-bold mt-4 mb-2">Placa mãe: a cidade e as ruas</h3>
<p class="mb-3">O processador senta num soquete dela. Os pentes de memória
entram em fendas dela. O disco se liga por um cabo que sai dela. As portas USB
que você usa por fora são dela. Nada no computador conversa com nada sem
passar por aí.</p>
<p class="mb-3">Pense numa cidade: os bairros são as peças, e a placa mãe é o
conjunto de ruas que liga um ao outro. Uma peça sozinha não faz nada — é a
ligação que faz o computador existir.</p>
<p class="mb-3">Por isso ela é a peça que decide o que cabe na máquina. Um
processador novo demais não entra no soquete de uma placa mãe antiga, e um
pente de memória de outro tipo não entra na fenda. Quando alguém diz que "não
dá para atualizar esse computador", quase sempre está falando dela.</p>

<h3 class="font-bold mt-4 mb-2">Placa de vídeo: quem desenha a tela</h3>
<p class="mb-3">O computador calcula; o monitor mostra. Entre os dois existe a
<strong>placa de vídeo</strong>, que transforma o que foi calculado na imagem
que aparece na tela. É dela que sai o cabo que vai até o monitor.</p>
<p class="mb-3">Aqui vem a parte que confunde quase todo mundo: na maioria dos
computadores de hoje <strong>não existe uma placa de vídeo separada</strong>.
Ela vem dentro da placa mãe ou dentro do próprio processador — chama-se
<em>integrada</em>, e dá conta de estudar, navegar e assistir a vídeo.</p>
<p class="mb-3">A placa avulsa, aquela grande com ventoinhas, é a
<em>dedicada</em>. Ela existe para quem pede mais da imagem: jogos pesados,
edição de vídeo, desenho em três dimensões. Abrir um computador comum e não
achar nenhuma não significa que falta peça — significa que aquele computador
não precisava de uma.</p>

<h3 class="font-bold mt-4 mb-2">Placa de som: quem transforma em barulho</h3>
<p class="mb-3">A <strong>placa de som</strong> faz do outro lado o que a de
vídeo faz para a imagem: pega o sinal que o computador produziu e o transforma
em som para a caixa ou o fone. É nela que ficam as entradas redondas coloridas
— a verde para o fone, a rosa para o microfone.</p>
<p class="mb-3">E vale a mesma história: hoje ela quase sempre já vem na placa
mãe. A placa de som separada é coisa de quem grava música ou trabalha com
áudio, e precisa de um som mais limpo do que o do dia a dia.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>O que não muda:</strong> integrada ou separada, a
função é a mesma. Quem faz a imagem é a placa de vídeo, e quem faz o som é a
placa de som — mesmo quando as duas moram dentro de outra peça.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">O que dá para ver por fora</h2>
<p class="mb-3">As placas ficam escondidas. O que aparece na traseira e na
lateral da máquina são as <strong>portas</strong> — os buracos onde se
encaixam os cabos — e, atrás de tudo, a peça que traz a energia.</p>

<h3 class="font-bold mt-4 mb-2">VGA e HDMI: duas portas para o monitor</h3>
<p class="mb-3">As duas levam a imagem do computador até a tela. A diferença é
a idade, e ela muda o que cada uma consegue.</p>
<p class="mb-3">A <strong>VGA</strong> é a antiga: um conector azul, trapezoidal,
com quinze pinos e dois parafusinhos que se apertam com a mão. Ela leva
<strong>só imagem</strong>, e leva em sinal analógico — o que significa que a
imagem perde qualidade em telas grandes.</p>
<p class="mb-3">A <strong>HDMI</strong> é a de hoje: um conector chato e
achatado, sem parafuso, que entra pressionando. Ela leva <strong>imagem e som
pelo mesmo cabo</strong>, em sinal digital. É a mesma porta da sua televisão,
e é por isso que dá para ligar o computador nela com um cabo só.</p>
<p class="mb-3">Se você ligar o computador na TV pela VGA e o som não sair,
não há defeito nenhum: a VGA não carrega som, e nunca carregou.</p>

<h3 class="font-bold mt-4 mb-2">USB: a porta que serve para tudo</h3>
<p class="mb-3">A <strong>porta USB</strong> é a retangular em que se encaixa
o pen drive. E o mouse. E o teclado. E a impressora. E o cabo que carrega o
celular. Esse é o ponto: antes dela, cada aparelho tinha uma porta diferente, e
a sigla quer dizer justamente <em>barramento serial universal</em> — uma porta
para todos.</p>
<p class="mb-3">Ela faz duas coisas ao mesmo tempo: <strong>troca
informação</strong> e <strong>leva energia</strong>. É por isso que o celular
carrega ligado ao computador, e por isso que um pen drive não precisa de
tomada.</p>
<p class="mb-3">Elas têm gerações, e a cor de dentro entrega qual é: preta ou
branca é a mais antiga e mais lenta, azul é mais rápida. E têm formatos — a
retangular de sempre, e a USB-C, pequena e oval, que entra dos dois lados.</p>

<h3 class="font-bold mt-4 mb-2">Fonte de alimentação: a tradutora da tomada</h3>
<p class="mb-3">A tomada da parede entrega 127 ou 220 volts em corrente
alternada. Nenhuma peça do computador aguenta isso. A
<strong>fonte de alimentação</strong> é a caixa de metal com uma ventoinha,
no fundo do gabinete, que recebe a energia da tomada e a converte em corrente
contínua de baixa voltagem — 12, 5 e 3,3 volts —, que é o que as peças usam.</p>
<p class="mb-3">Dela saem os cabos que alimentam a placa mãe, o disco e a placa
de vídeo. É a única peça que toca a energia da rua.</p>
<p class="mb-3">E é por isso que ela é a primeira a morrer quando cai um raio
ou a energia oscila: o tranco chega nela antes de chegar em qualquer outra
coisa. Uma fonte boa protege o resto da máquina; uma fonte ruim leva a placa
mãe junto quando queima.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Lembra da Computação 2?</strong> Lá você aprendeu a
proteger o computador de oscilações de energia, com estabilizador e nobreak.
Agora você sabe o nome da peça que eles estão protegendo.</p>
</div>
`;

const conteudo_L3 = `
<h2 class="text-xl font-bold mb-3">O único da lista que não é peça</h2>
<p class="mb-3">Os seis termos anteriores são coisas que se pegam com a mão. O
sétimo não: <strong>banco de dados</strong> não é uma peça do computador, é
uma forma de guardar informação. Vale começar por aí, porque a lista pode dar
a impressão de que existe uma "placa de banco de dados" em algum lugar. Não
existe.</p>

<h3 class="font-bold mt-4 mb-2">Guardar organizado, para muita gente ao mesmo tempo</h3>
<p class="mb-3">Um <strong>banco de dados</strong> é um depósito de informação
organizado, guardado de um jeito que um programa consegue consultar, mudar e
proteger — e que muitas pessoas conseguem usar ao mesmo tempo sem se
atrapalhar.</p>
<p class="mb-3">A palavra-chave é <em>ao mesmo tempo</em>. Pense na lista de
presença da sua unidade numa planilha, num pen drive. Se dois conselheiros
quiserem anotar a chamada ao mesmo tempo, um vai salvar por cima do outro, e
uma das duas chamadas desaparece sem ninguém perceber.</p>
<p class="mb-3">Um banco de dados foi feito para isso não acontecer. Ele
controla quem escreve o quê, em que ordem, e não deixa duas gravações se
atropelarem.</p>

<h3 class="font-bold mt-4 mb-2">Você usa vários por dia</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Quando o clube consulta se você já tem uma especialidade, a resposta vem de um banco de dados.</li>
  <li>Quando você entra nesta plataforma, quem confere sua senha e guarda seu progresso é um.</li>
  <li>A lista de contatos do celular é um, pequenininho, dentro do aparelho.</li>
  <li>O caixa do mercado consulta um para saber o preço do que ele passou no leitor.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Por que essa palavra está numa lista de peças?</h3>
<p class="mb-3">Porque num escritório é isso que as máquinas conectadas
costumam estar acessando. Os computadores não estão ligados um no outro por
esporte: eles estão ligados para chegar num lugar onde a informação da empresa
mora, e esse lugar é um banco de dados, guardado num servidor.</p>
<p class="mb-3">Guarde essa ideia. Ela volta no módulo sobre redes.</p>
`;

export const modulo1: Module = {
  code: 'AP043.1',
  title: 'Por dentro da máquina',
  description: 'Placa mãe, placa de vídeo, placa de som, portas VGA, HDMI e USB, fonte de alimentação — e banco de dados, o estranho da lista.',
  lessons: [
    {
      code: 'AP043.1-L1',
      title: 'As três placas',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-2.1', 'AP043-2.2', 'AP043-2.3'],
      questions: [
        {
          id: 'AP043.1-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é a placa mãe?',
          data: { options: [
            { id: 'a', text: 'A placa em que todas as outras peças se encaixam e por onde elas conversam.', correct: true },
            { id: 'b', text: 'A peça que faz as contas do computador e decide o que cada programa vai executar.',
              porque: 'Isso é o processador. Ele senta num soquete da placa mãe, mas não é ela.' },
            { id: 'c', text: 'A peça onde ficam guardados os arquivos quando o computador está desligado.',
              porque: 'Isso é o armazenamento, o HD ou SSD. Ele se liga à placa mãe por um cabo.' },
            { id: 'd', text: 'A primeira placa que o fabricante monta, e que serve de molde para as outras.',
              porque: 'O nome não vem de ser a primeira: vem de todas as outras se encaixarem nela.' },
          ]},
          explanation: 'Nada no computador conversa com nada sem passar por ela. É a rua que liga os bairros.',
        },
        {
          id: 'AP043.1-L1-Q2', type: 'multiple_choice',
          prompt: 'Você abre um computador comum de escritório e não encontra nenhuma placa de vídeo. O que isso significa?',
          data: { options: [
            { id: 'a', text: 'Que o vídeo dele é integrado, e vem dentro da placa mãe ou do processador.', correct: true },
            { id: 'b', text: 'Que a placa foi retirada por alguém e o computador está funcionando incompleto.',
              porque: 'Sem nada gerando imagem não haveria imagem nenhuma na tela. Se aparece imagem, algo está fazendo esse trabalho.' },
            { id: 'c', text: 'Que aquele computador não consegue ligar um monitor e só funciona por acesso remoto.',
              porque: 'Ele liga monitor normalmente — a porta de vídeo dele sai direto da placa mãe.' },
            { id: 'd', text: 'Que o monitor daquele computador faz a conta da imagem sozinho, sem ajuda da máquina.',
              porque: 'O monitor só mostra o que recebe pronto. Quem calcula a imagem é sempre o computador.' },
          ]},
          explanation: 'Vídeo integrado é o normal hoje. A placa avulsa existe para quem pede mais da imagem.',
        },
        {
          id: 'AP043.1-L1-Q3', type: 'multiple_choice',
          prompt: 'Para que serve a placa de som?',
          data: { options: [
            { id: 'a', text: 'Para transformar o sinal do computador em som na caixa ou no fone.', correct: true },
            { id: 'b', text: 'Para deixar o computador mais silencioso, abafando o barulho das ventoinhas.',
              porque: 'Ventoinha é peça mecânica, e nenhuma placa a silencia. A placa de som produz som, não o reduz.' },
            { id: 'c', text: 'Para guardar as músicas do computador num lugar separado dos outros arquivos.',
              porque: 'Música fica no armazenamento, junto com o resto. A placa de som não guarda nada.' },
            { id: 'd', text: 'Para aumentar o volume máximo do computador além do que o sistema permite.',
              porque: 'Ela não estica limite nenhum: o que ela faz é converter o sinal em som, no volume pedido.' },
          ]},
          explanation: 'É o outro lado da placa de vídeo: uma faz a imagem sair, a outra faz o som sair.',
        },
        {
          id: 'AP043.1-L1-Q4', type: 'true_false',
          prompt: 'Todo computador precisa de uma placa de vídeo separada para mostrar imagem no monitor.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. A maioria dos computadores usa vídeo integrado, dentro da placa mãe ou do processador.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Precisa de algo que faça a imagem — e isso quase sempre já vem embutido.',
        },
        {
          id: 'AP043.1-L1-Q5', type: 'multiple_choice',
          prompt: 'Um processador novo não encaixa numa placa mãe antiga. Por quê?',
          data: { options: [
            { id: 'a', text: 'Porque o soquete da placa mãe tem um formato, e ele decide o que entra ali.', correct: true },
            { id: 'b', text: 'Porque processadores novos consomem menos energia do que placas antigas fornecem.',
              porque: 'O problema aparece antes da energia: a peça nem entra fisicamente no lugar.' },
            { id: 'c', text: 'Porque a placa mãe antiga precisa ser formatada antes de receber peça nova.',
              porque: 'Formatar é coisa de disco, e não de placa. A placa mãe não guarda arquivo do usuário.' },
            { id: 'd', text: 'Porque processador e placa mãe precisam ter sido comprados na mesma loja.',
              porque: 'Onde se compra não muda nada. O que muda é o formato do soquete e o que a placa reconhece.' },
          ]},
          explanation: 'É a placa mãe que decide o que cabe na máquina — e é por isso que ela limita a atualização.',
        },
        {
          id: 'AP043.1-L1-Q6', type: 'matching',
          prompt: 'Ligue cada placa ao trabalho que ela faz.',
          data: { pairs: [
            { left: 'Placa mãe', right: 'Liga todas as peças umas às outras' },
            { left: 'Placa de vídeo', right: 'Transforma o cálculo em imagem na tela' },
            { left: 'Placa de som', right: 'Transforma o sinal em som no fone' },
          ]},
          explanation: 'Uma liga, uma faz ver, uma faz ouvir.',
        },
      ],
    },
    {
      code: 'AP043.1-L2',
      title: 'As portas e a fonte',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP043-2.4', 'AP043-2.5', 'AP043-2.6'],
      questions: [
        {
          id: 'AP043.1-L2-Q1', type: 'multiple_choice',
          prompt: 'Qual é a diferença que mais importa entre a porta VGA e a HDMI?',
          data: { options: [
            { id: 'a', text: 'A HDMI leva imagem e som; a VGA leva só imagem.', correct: true },
            { id: 'b', text: 'A VGA serve para monitor e a HDMI serve apenas para televisão.',
              porque: 'HDMI é a porta padrão dos monitores de hoje. Ela serve para os dois.' },
            { id: 'c', text: 'A HDMI transporta energia para o monitor, dispensando o cabo da tomada.',
              porque: 'O monitor continua precisando da tomada. A HDMI leva sinal, e não energia para ligar aparelho.' },
            { id: 'd', text: 'A VGA é mais rápida, porque tem quinze pinos em vez de um conector achatado.',
              porque: 'Número de pinos não mede velocidade. A VGA é analógica e mais antiga, e perde para a HDMI.' },
          ]},
          explanation: 'É por isso que ligar o computador na TV pela VGA dá imagem sem som — e não é defeito.',
        },
        {
          id: 'AP043.1-L2-Q2', type: 'multiple_choice',
          prompt: 'Por que a porta USB é chamada de universal?',
          data: { options: [
            { id: 'a', text: 'Porque um mesmo formato de porta serve para aparelhos de todo tipo.', correct: true },
            { id: 'b', text: 'Porque ela existe em todos os países e usa a mesma voltagem em qualquer tomada.',
              porque: 'Ela nem chega perto da tomada. O nome fala dos aparelhos que ela atende, não de países.' },
            { id: 'c', text: 'Porque qualquer cabo do mundo encaixa nela, independentemente do formato do conector.',
              porque: 'O conector precisa ser USB. O que ela universalizou foi o tipo de aparelho, não o formato do plugue.' },
            { id: 'd', text: 'Porque foi a primeira porta a existir nos computadores, antes de todas as outras.',
              porque: 'Ela é bem posterior. Antes dela cada aparelho tinha a sua porta, e era esse o problema.' },
          ]},
          explanation: 'Pen drive, mouse, teclado, impressora e carregador de celular, tudo no mesmo buraco.',
        },
        {
          id: 'AP043.1-L2-Q3', type: 'multiple_choice',
          prompt: 'O que a fonte de alimentação faz?',
          data: { options: [
            { id: 'a', text: 'Converte a energia da tomada na voltagem baixa que as peças usam.', correct: true },
            { id: 'b', text: 'Guarda energia numa bateria interna para o computador não desligar na queda de luz.',
              porque: 'Quem guarda energia é o nobreak, que fica fora do computador. A fonte só converte.' },
            { id: 'c', text: 'Distribui os arquivos entre as peças, decidindo o que vai para a memória.',
              porque: 'Isso é trabalho do sistema e do processador. A fonte lida com energia, e não com informação.' },
            { id: 'd', text: 'Escolhe sozinha entre 127 e 220 volts para economizar energia na conta de luz.',
              porque: 'Algumas escolhem a voltagem, mas para funcionar, e não para economizar. Ela não reduz consumo.' },
          ]},
          explanation: '127 ou 220 volts entram; 12, 5 e 3,3 volts saem. É a única peça que toca a energia da rua.',
        },
        {
          id: 'AP043.1-L2-Q4', type: 'true_false',
          prompt: 'A porta USB troca informação e, ao mesmo tempo, leva energia ao aparelho ligado nela.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro. Ela faz as duas coisas — e é por isso que o celular carrega ligado ao computador.' },
          ]},
          explanation: 'Informação e energia pelo mesmo cabo. O pen drive não precisa de tomada por causa disso.',
        },
        {
          id: 'AP043.1-L2-Q5', type: 'multiple_choice',
          prompt: 'Caiu um raio perto de casa e o computador não liga mais. Qual peça costuma receber o tranco primeiro?',
          data: { options: [
            { id: 'a', text: 'A fonte de alimentação.', correct: true },
            { id: 'b', text: 'O monitor, porque é a peça que fica mais tempo acesa durante o uso.',
              porque: 'Tempo aceso não decide isso. O que decide é por onde a energia da rua entra, e ela entra pela fonte.' },
            { id: 'c', text: 'A memória RAM, porque ela é a peça mais sensível do computador inteiro.',
              porque: 'Ela é sensível, mas recebe energia já convertida. O tranco chega na fonte antes.' },
            { id: 'd', text: 'O teclado, porque é a peça que a pessoa está tocando na hora do susto.',
              porque: 'O teclado se liga por USB, com voltagem baixa. Ele não vê a energia da tomada.' },
          ]},
          explanation: 'É ela que está na porta de entrada. Estabilizador e nobreak existem para chegar antes dela.',
        },
        {
          id: 'AP043.1-L2-Q6', type: 'fill_blank',
          prompt: 'Complete: a porta ___ leva só imagem, e a porta ___ leva imagem e som pelo mesmo cabo.',
          data: { blanks: [
            { id: 'b1', answer: 'VGA', hint: 'É a azul, com dois parafusinhos.', aceitas: ['vga'] },
            { id: 'b2', answer: 'HDMI', hint: 'É a mesma da televisão.', aceitas: ['hdmi'] },
          ]},
          explanation: 'A antiga leva uma coisa; a de hoje leva as duas.',
        },
      ],
    },
    {
      code: 'AP043.1-L3',
      title: 'Banco de dados',
      type: 'theory',
      content: conteudo_L3,
      requirementCodes: ['AP043-2.7'],
      questions: [
        {
          id: 'AP043.1-L3-Q1', type: 'multiple_choice',
          prompt: 'O que é um banco de dados?',
          data: { options: [
            { id: 'a', text: 'Um depósito de informação organizado, que muitos podem consultar e mudar ao mesmo tempo.', correct: true },
            { id: 'b', text: 'Uma peça do computador que guarda os arquivos com mais segurança que o disco comum.',
              porque: 'Não é peça nenhuma. É a forma de organizar a informação, e ela mora dentro de um disco comum.' },
            { id: 'c', text: 'Uma pasta do sistema onde ficam os documentos importantes da empresa.',
              porque: 'Pasta guarda arquivos soltos. Banco de dados organiza a informação e controla quem escreve o quê.' },
            { id: 'd', text: 'Um lugar na internet onde se pagam contas e se movimenta dinheiro do clube.',
              porque: 'Isso é banco de dinheiro. A palavra é a mesma, e o assunto é outro.' },
          ]},
          explanation: 'O que o define não é onde ele mora: é ser organizado e aguentar muita gente ao mesmo tempo.',
        },
        {
          id: 'AP043.1-L3-Q2', type: 'multiple_choice',
          prompt: 'Dois conselheiros anotam a chamada da unidade na mesma planilha, no mesmo instante. O que acontece?',
          data: { options: [
            { id: 'a', text: 'Um salva por cima do outro, e uma das chamadas some sem aviso.', correct: true },
            { id: 'b', text: 'A planilha junta as duas anotações sozinha, porque foram feitas no mesmo momento.',
              porque: 'Ela não junta nada: cada um salva o arquivo inteiro como ele estava na sua tela.' },
            { id: 'c', text: 'A planilha avisa que há outra pessoa escrevendo e tranca o arquivo até ela terminar.',
              porque: 'Um arquivo comum num pen drive não sabe que existe outra pessoa. Quem sabe disso é um banco de dados.' },
            { id: 'd', text: 'Nada se perde, porque o computador guarda uma cópia de cada versão automaticamente.',
              porque: 'Isso é o que um backup faria, se existisse. Sozinho, o arquivo não guarda versão nenhuma.' },
          ]},
          explanation: 'Sumir sem aviso é o pior tipo de perda. É exatamente esse problema que o banco de dados resolve.',
        },
        {
          id: 'AP043.1-L3-Q3', type: 'true_false',
          prompt: 'Banco de dados é uma peça que se compra e se encaixa dentro do computador.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Ele é uma forma de guardar informação — não existe peça com esse nome.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É o único item da lista do requisito que não se pega com a mão.',
        },
        {
          id: 'AP043.1-L3-Q4', type: 'multiple_choice',
          prompt: 'Por que um escritório liga seus computadores em rede?',
          data: { options: [
            { id: 'a', text: 'Para que todos cheguem à mesma informação, guardada num lugar só.', correct: true },
            { id: 'b', text: 'Para que os computadores dividam a memória RAM uns dos outros quando faltar.',
              porque: 'Memória não se empresta pela rede: cada máquina usa a sua, e só a sua.' },
            { id: 'c', text: 'Para que a energia da tomada seja distribuída igualmente entre as máquinas.',
              porque: 'Rede leva informação, e não energia. Quem cuida da energia é a fonte de cada computador.' },
            { id: 'd', text: 'Para que todos os computadores liguem e desliguem no mesmo horário todo dia.',
              porque: 'Isso se resolve na configuração de cada máquina, e não é motivo para ligá-las entre si.' },
          ]},
          explanation: 'Esse lugar só costuma ser um banco de dados, num servidor — e é aí que a palavra encaixa nesta lista.',
        },
      ],
    },
  ],
};
