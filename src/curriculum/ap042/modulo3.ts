import type { Module } from '../../types';

/*
 * AP042 módulo 3 — o requisito 4, que pede saber avaliar cinco informações
 * antes de comprar um computador.
 *
 * "Avaliar" é o verbo do requisito, e ele muda o que a lição precisa ensinar.
 * Saber que RAM é memória de trabalho é a AP041; aqui a pergunta é outra: 8 GB
 * é pouco ou muito? A resposta honesta é "depende do que você vai fazer", e é
 * essa dependência que a lição ensina, com faixas concretas em vez de adjetivo.
 *
 * Os números envelhecem, e isso está assumido: as faixas aqui são as de hoje, e
 * a lição diz em voz alta que elas sobem com o tempo. O que não envelhece é o
 * método — comparar com o uso pretendido, e desconfiar do número que aparece
 * grande e sozinho no anúncio.
 *
 * A armadilha do módulo é a que mais custa dinheiro de verdade: confundir
 * memória com armazenamento. As duas se medem em GB, aparecem lado a lado no
 * anúncio, e a loja não faz questão de esclarecer.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Dois números em GB, e eles não são a mesma coisa</h2>
<p class="mb-3">Todo anúncio de computador traz pelo menos dois números medidos
em <strong>GB</strong>: a memória e o armazenamento. Confundir os dois é o erro
mais caro de quem compra sem entender — e é fácil de cometer, porque a loja
escreve os dois com a mesma unidade, um do lado do outro.</p>

<h3 class="font-bold mt-4 mb-2">Memória RAM: a mesa de trabalho</h3>
<p class="mb-3">A <strong>memória RAM</strong> é onde o computador põe o que
está usando <em>agora</em>. Pense numa mesa: quanto maior, mais cadernos abertos
cabem ao mesmo tempo.</p>
<p class="mb-3">Quando a RAM enche, o computador não desiste — ele começa a
guardar coisa no disco, que é muito mais lento, e tudo fica arrastado. É esse o
travamento de quem abre vinte abas no navegador.</p>
<p class="mb-3">Como avaliar, hoje:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>4 GB</strong> — só para tarefas bem leves. Vai apertar.</li>
  <li><strong>8 GB</strong> — o mínimo confortável para estudo e internet.</li>
  <li><strong>16 GB</strong> — sobra para edição de vídeo e jogos.</li>
</ul>
<p class="mb-3">Esses números sobem com os anos. O que não muda é a pergunta:
quanta coisa você pretende deixar aberta ao mesmo tempo?</p>

<h3 class="font-bold mt-4 mb-2">Armazenamento: o armário</h3>
<p class="mb-3">O <strong>armazenamento</strong> é onde ficam seus arquivos
quando o computador está desligado — fotos, trabalhos, programas. Se a RAM é a
mesa, ele é o armário atrás dela.</p>
<p class="mb-3">Aqui a escolha é entre dois tipos, e ela pesa mais do que o
tamanho:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>HD</strong> — tem disco que gira e uma agulha que lê, como um
  toca-discos. É barato e vem com bastante espaço, mas é lento e não gosta de
  tranco: derrubar um notebook com HD ligado pode acabar com ele.</li>
  <li><strong>SSD</strong> — não tem peça que se mexe: guarda tudo em chips. É
  muito mais rápido, silencioso, gasta menos bateria e aguenta melhor um
  esbarrão. Custa mais caro por GB.</li>
</ul>
<p class="mb-3">A diferença que se sente é no ligar: um computador com SSD
liga em segundos, e o mesmo computador com HD leva um minuto ou mais. Para quem
usa no dia a dia, trocar HD por SSD costuma mudar mais a experiência do que
dobrar qualquer outro número.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Como não confundir:</strong> a RAM esvazia quando você desliga; o
  armazenamento continua cheio. Se o número some ao apagar a máquina, é
  memória.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Quem faz as contas, e onde você olha o dia inteiro</h2>

<h3 class="font-bold mt-4 mb-2">O tipo do processador</h3>
<p class="mb-3">O <strong>processador</strong> é a peça que faz as contas — o
cérebro da máquina. Os nomes vêm em família, e a família diz mais do que
parece:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Intel</strong> chama os seus de Core i3, i5, i7 e i9.</li>
  <li><strong>AMD</strong> chama os seus de Ryzen 3, 5, 7 e 9.</li>
</ul>
<p class="mb-3">Nos dois casos, o número maior indica um processador mais
forte: um i3 dá conta de escrever e navegar; um i7 é para edição e jogo
pesado.</p>
<p class="mb-3">Há uma segunda parte no nome que quase ninguém olha e que
importa muito: a <strong>geração</strong>. Um "Core i5 de 12ª geração" é bem
mais novo e mais rápido que um "Core i5 de 4ª geração", apesar de os dois serem
i5. Loja que anuncia só "i5", sem dizer a geração, costuma estar vendendo
máquina antiga.</p>

<h3 class="font-bold mt-4 mb-2">A velocidade do processador</h3>
<p class="mb-3">A <strong>velocidade</strong> aparece em
<strong>GHz</strong> — gigahertz. Ela conta quantos bilhões de operações o
processador faz por segundo. Hoje um computador comum fica entre 2 e 4 GHz.</p>
<p class="mb-3">Só que velocidade sozinha engana. Duas coisas mudam o
resultado:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Os núcleos</strong> — um processador de 4 núcleos é como ter
  quatro pessoas trabalhando em vez de uma. Ele faz mais coisas ao mesmo tempo,
  mesmo com o mesmo GHz.</li>
  <li><strong>A geração</strong> — um processador novo faz mais trabalho a cada
  ciclo. Por isso um chip novo de 2,5 GHz pode ser mais rápido que um antigo de
  3,5 GHz.</li>
</ul>
<p class="mb-3">É por isso que comparar só o GHz de dois computadores diferentes
leva à escolha errada.</p>

<h3 class="font-bold mt-4 mb-2">O tipo de monitor</h3>
<p class="mb-3">O <strong>monitor</strong> é onde você olha por horas, e três
coisas se avaliam nele:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Tamanho</strong>, em polegadas, medido na diagonal. Entre 15 e 24
  cobre quase todo uso comum.</li>
  <li><strong>Resolução</strong> — quantos pontinhos formam a imagem. Full HD
  (1920 × 1080) é o padrão de hoje; HD (1366 × 768) é o mínimo, e já mostra
  menos coisa na tela de uma vez.</li>
  <li><strong>Tipo de painel</strong> — o <strong>IPS</strong> mostra cores
  fiéis e continua visível quando você olha de lado. O <strong>TN</strong> é
  mais barato e desbota quando visto de ângulo.</li>
</ul>
<p class="mb-3">Tela grande com resolução baixa não é vantagem: a imagem só
fica maior e mais borrada, e não cabe mais coisa nela.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Na hora de comparar dois anúncios:</strong> nenhum número decide
  sozinho. Olhe o conjunto — memória, tipo de armazenamento, processador com
  geração e resolução da tela — e compare com o que você vai fazer na
  máquina.</p>
</div>
`;

export const modulo3: Module = {
  code: 'AP042.3',
  title: 'Antes de gastar o dinheiro',
  description: 'Como ler a ficha técnica de um computador e saber o que aquilo significa na prática.',
  lessons: [
    {
      code: 'AP042.3-L1',
      title: 'Memória e espaço não são a mesma coisa',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP042-4.1', 'AP042-4.2'],
      questions: [
        {
          id: 'AP042.3-L1-Q1', type: 'multiple_choice',
          prompt: 'Um computador trava sempre que você abre muitas abas e programas ao mesmo tempo. Qual peça está faltando?',
          data: { options: [
            { id: 'a', text: 'Memória RAM, que é onde fica o que está aberto agora.', correct: true },
            { id: 'b', text: 'Espaço de armazenamento, porque o disco cheio não deixa abrir mais nada.',
              porque: 'Disco cheio atrapalha salvar arquivo. Quem segura o que está aberto agora é a RAM.' },
            { id: 'c', text: 'Um monitor maior, já que com mais tela cabe mais janela aberta ao mesmo tempo.',
              porque: 'A tela muda o que você enxerga, não o que a máquina consegue manter aberto.' },
            { id: 'd', text: 'Internet mais rápida, porque cada aba fica esperando a página terminar de chegar.',
              porque: 'A internet lenta demora a carregar, mas não é ela que faz a máquina inteira travar.' },
          ]},
          explanation: 'Quando a RAM enche, o computador passa a usar o disco como apoio — e o disco é muito mais lento.',
        },
        {
          id: 'AP042.3-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença prática entre um HD e um SSD?',
          data: { options: [
            { id: 'a', text: 'O SSD não tem peça que se mexe, e por isso é bem mais rápido.', correct: true },
            { id: 'b', text: 'O SSD guarda mais arquivos, porque cada chip dele cabe mais que um disco inteiro.',
              porque: 'É o contrário: por GB, o HD costuma oferecer mais espaço pelo mesmo preço.' },
            { id: 'c', text: 'O HD guarda arquivos e o SSD guarda apenas o sistema operacional da máquina.',
              porque: 'Os dois guardam qualquer arquivo. A diferença está em como guardam, e na velocidade.' },
            { id: 'd', text: 'O HD só existe em computador de mesa, e o SSD só existe em notebook novo.',
              porque: 'Os dois tipos existem nos dois formatos. Muitos computadores de mesa já vêm com SSD.' },
          ]},
          explanation: 'O HD tem disco girando e agulha lendo; o SSD guarda tudo em chips. Sem peça em movimento, sobra velocidade.',
        },
        {
          id: 'AP042.3-L1-Q3', type: 'true_false',
          prompt: 'Tudo o que está na memória RAM some quando o computador é desligado.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro, e é por isso que existe o aviso de salvar antes de fechar.' },
          ]},
          explanation: 'É a regra que separa as duas: se o conteúdo some ao desligar, aquilo é memória, e não armazenamento.',
        },
        {
          id: 'AP042.3-L1-Q4', type: 'scenario',
          prompt: 'Dois notebooks custam o mesmo. Um tem 8 GB de RAM e HD de 1 TB; o outro tem 8 GB de RAM e SSD de 256 GB. Vão ser usados para trabalho de escola e internet. Qual escolher?',
          data: { scenarios: [
            { id: 'a', text: 'O do SSD, porque a máquina inteira responde mais rápido.', correct: true },
            { id: 'b', text: 'O do HD, porque 1 TB é quatro vezes mais espaço e espaço nunca é demais.',
              porque: 'Trabalho de escola ocupa pouco. Espaço que não vai ser usado não compensa a lentidão diária.' },
            { id: 'c', text: 'Tanto faz: os dois têm a mesma memória RAM, e é ela que decide a velocidade.',
              porque: 'A RAM empatou, então quem desempata é o armazenamento — e aí a diferença é grande.' },
            { id: 'd', text: 'O do HD, e depois é só comprar mais memória RAM para compensar a lentidão dele.',
              porque: 'Mais RAM não acelera o disco. São coisas diferentes, e o gargalo aqui é o disco.' },
          ]},
          explanation: 'Com SSD o computador liga em segundos e abre programas na hora. É a mudança que mais se sente no dia a dia.',
        },
        {
          id: 'AP042.3-L1-Q5', type: 'fill_blank',
          prompt: 'A memória que o computador usa para o que está aberto agora chama-se memória ___.',
          data: { blanks: [
            { id: 'b1', answer: 'RAM', hint: 'É a "mesa de trabalho" da máquina.', aceitas: ['ram', 'memória de acesso aleatório'] },
          ]},
          explanation: 'Quanto maior a mesa, mais cadernos abertos cabem ao mesmo tempo.',
        },
      ],
    },
    {
      code: 'AP042.3-L2',
      title: 'O processador e a tela',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP042-4.3', 'AP042-4.4', 'AP042-4.5'],
      questions: [
        {
          id: 'AP042.3-L2-Q1', type: 'multiple_choice',
          prompt: 'Num anúncio aparece "Core i5", sem dizer mais nada. O que ainda falta saber?',
          data: { options: [
            { id: 'a', text: 'A geração, que diz se o processador é novo ou antigo.', correct: true },
            { id: 'b', text: 'A marca do computador, porque o mesmo i5 rende diferente em cada fabricante.',
              porque: 'A marca da máquina muda pouco aqui. O que muda muito é a geração daquele i5.' },
            { id: 'c', text: 'A cor do gabinete, que indica a linha do produto e ajuda a saber o preço.',
              porque: 'Cor não diz nada sobre desempenho. É escolha de aparência.' },
            { id: 'd', text: 'Nada mais: dizer i5 já descreve o processador por completo para quem compra.',
              porque: 'Um i5 antigo e um i5 novo têm desempenho bem diferente, e o anúncio omite justamente isso.' },
          ]},
          explanation: 'Um i5 de 12ª geração é muito mais rápido que um i5 de 4ª. Anúncio que esconde a geração costuma esconder idade.',
        },
        {
          id: 'AP042.3-L2-Q2', type: 'multiple_choice',
          prompt: 'Por que comparar apenas o GHz de dois computadores leva à escolha errada?',
          data: { options: [
            { id: 'a', text: 'Porque núcleos e geração mudam o resultado tanto quanto a velocidade.', correct: true },
            { id: 'b', text: 'Porque o GHz anunciado é inventado pela loja e nunca corresponde ao real.',
              porque: 'O número é real. O problema não é ele mentir, é ele não contar a história inteira.' },
            { id: 'c', text: 'Porque o GHz mede a memória do computador, e não a velocidade do processador.',
              porque: 'GHz mede mesmo a velocidade do processador. Memória se mede em GB.' },
            { id: 'd', text: 'Porque a velocidade muda o tempo todo conforme a temperatura da sala onde ele está.',
              porque: 'A temperatura influencia um pouco, mas não é por isso que a comparação falha.' },
          ]},
          explanation: 'Um chip novo de 2,5 GHz pode ser mais rápido que um antigo de 3,5 GHz: ele faz mais trabalho a cada ciclo.',
        },
        {
          id: 'AP042.3-L2-Q3', type: 'multiple_choice',
          prompt: 'O que a resolução de um monitor informa?',
          data: { options: [
            { id: 'a', text: 'Quantos pontinhos formam a imagem na tela.', correct: true },
            { id: 'b', text: 'O tamanho da tela em polegadas, medido de um canto ao outro na diagonal.',
              porque: 'Isso é o tamanho, e é outro número. Tela grande pode ter resolução baixa.' },
            { id: 'c', text: 'Quantas vezes por segundo a imagem inteira é trocada por uma nova.',
              porque: 'Isso é a taxa de atualização, medida em Hz. Resolução conta pontos, não trocas.' },
            { id: 'd', text: 'Quanto a tela consegue ficar clara em ambiente com muita luz entrando pela janela.',
              porque: 'Isso é o brilho, medido em nits. A resolução não fala de luz.' },
          ]},
          explanation: 'Full HD é 1920 × 1080 pontos. Mais pontos significa mais coisa cabendo na tela, e não só imagem maior.',
        },
        {
          id: 'AP042.3-L2-Q4', type: 'true_false',
          prompt: 'Uma tela grande com resolução baixa mostra mais conteúdo do que uma tela menor com resolução alta.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Quem decide quanto cabe é a quantidade de pontos, e não o tamanho do vidro.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Aumentar a tela sem aumentar os pontos só deixa a mesma imagem maior e mais borrada.',
        },
        {
          id: 'AP042.3-L2-Q5', type: 'matching',
          prompt: 'Ligue cada informação da ficha técnica ao que ela responde.',
          data: { pairs: [
            { left: 'GB de RAM', right: 'Quanto cabe aberto ao mesmo tempo' },
            { left: 'HD ou SSD', right: 'Quão rápido a máquina abre as coisas' },
            { left: 'Geração do processador', right: 'Se o chip é novo ou antigo' },
            { left: 'Painel IPS ou TN', right: 'Se a cor some ao olhar de lado' },
          ]},
          explanation: 'Nenhum número decide sozinho: avaliar é olhar o conjunto e comparar com o uso pretendido.',
        },
      ],
    },
  ],
};
