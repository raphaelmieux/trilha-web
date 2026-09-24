import type { Module } from '../../types';

/*
 * AP045 módulo 3 — as quatro impressoras do requisito 4.
 *
 * O documento pede saber a diferença e a aplicação de cada uma: matricial,
 * laser, plotter e jato de tinta. Elas não competem pelo mesmo trabalho — cada
 * uma resolve um problema que as outras três não resolvem bem —, e é por aí
 * que a lição as organiza: não "qual é melhor", mas "para que serve cada
 * uma".
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Quatro impressoras, quatro trabalhos diferentes</h2>
<p class="mb-3">Perguntar "qual impressora é a melhor?" é como perguntar "qual
ferramenta é a melhor?" — depende do que se vai fazer. As quatro impressoras
abaixo continuam sendo fabricadas hoje porque cada uma resolve um problema que
as outras não resolvem bem.</p>

<h3 class="font-bold mt-4 mb-2">Matricial: a que imprime em várias vias de uma vez</h3>
<p class="mb-3">A impressora <strong>matricial</strong> imprime batendo uma
agulha contra uma fita de tinta, formando cada letra com uma matriz de
pontinhos — daí o nome. É barulhenta, a qualidade é baixa e ela só imprime em
preto (ou na cor da fita). Mas ela tem um talento que nenhuma das outras três
tem: como bate de verdade no papel, ela consegue imprimir em
<strong>papel-carbono</strong>, gerando várias vias (cópias) de um formulário
numa tacada só. Por isso ainda é comum em notas fiscais, boletos bancários e
formulários que precisam de segunda via na hora.</p>

<h3 class="font-bold mt-4 mb-2">Jato de tinta: a de casa, para foto e cor</h3>
<p class="mb-3">A impressora <strong>jato de tinta</strong> borrifa gotinhas
minúsculas de tinta líquida sobre o papel. É a mais comum em casa: custa pouco
para comprar, imprime bem em cores e é a melhor opção para foto, por causa da
qualidade da cor. Em compensação, os cartuchos de tinta custam caro para o
volume que rendem, e a tinta pode borrar se o papel estiver úmido.</p>

<h3 class="font-bold mt-4 mb-2">Laser: a do escritório, rápida e em volume</h3>
<p class="mb-3">A impressora <strong>laser</strong> usa um feixe de laser para
"desenhar" a imagem num cilindro carregado eletricamente, que atrai um pó fino
chamado <strong>toner</strong> e o transfere para o papel, fixado depois por
calor. É mais rápida que a jato de tinta, o custo por página é mais baixo em
grandes volumes, e o texto sai nítido — por isso é a escolha comum de
escritórios que imprimem centenas de páginas por dia. Em compensação, ela
costuma ser mais cara para comprar, e a impressão em cor de boa qualidade
custa mais que a preto e branco.</p>

<h3 class="font-bold mt-4 mb-2">Plotter: a que imprime do tamanho de uma planta baixa</h3>
<p class="mb-3">A <strong>plotter</strong> não imprime folha A4: ela é feita
para imprimir em <strong>tamanhos grandes</strong> — plantas de arquitetura,
banners, cartazes, mapas — usando um cabeçote que se move sobre um rolo largo
de papel. Alguns modelos mais antigos desenhavam de verdade, movendo uma
caneta sobre o papel; os modelos de hoje costumam usar jato de tinta em escala
grande. O que a define não é a tecnologia de impressão, e sim o
<strong>tamanho</strong> que ela consegue imprimir de uma vez.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>Quem escolhe qual:</strong> via em papel-carbono
pede matricial; foto em casa pede jato de tinta; volume de texto no escritório
pede laser; planta ou banner grande pede plotter.</p>
</div>
`;

export const modulo3: Module = {
  code: 'AP045.3',
  title: 'A impressora certa para cada trabalho',
  description: 'Matricial, jato de tinta, laser e plotter: o que cada uma faz bem, e onde ela é a escolha certa.',
  lessons: [
    {
      code: 'AP045.3-L1',
      title: 'Quatro impressoras, quatro trabalhos diferentes',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-4.1', 'AP045-4.2', 'AP045-4.3', 'AP045-4.4'],
      questions: [
        {
          id: 'AP045.3-L1-Q1', type: 'multiple_choice',
          prompt: 'Por que a impressora matricial ainda é usada para notas fiscais e boletos com segunda via?',
          data: { options: [
            { id: 'a', text: 'Porque ela bate de verdade no papel, o que permite imprimir várias vias com papel-carbono de uma vez.', correct: true },
            { id: 'b', text: 'Porque ela imprime fotos em cores muito mais vivas e nítidas do que qualquer outra impressora do mercado.',
              porque: 'A matricial imprime só em preto (ou na cor da fita) — é a jato de tinta que se destaca em cor.' },
            { id: 'c', text: 'Porque ela é a mais silenciosa entre as quatro impressoras.',
              porque: 'É o oposto: a matricial é a mais barulhenta, por bater a agulha contra a fita.' },
            { id: 'd', text: 'Porque ela imprime em tamanhos grandes, como plantas e banners.',
              porque: 'Imprimir em tamanho grande é o forte da plotter, não da matricial.' },
          ]},
          explanation: 'Nenhuma das outras três bate fisicamente no papel — e é justamente o impacto que atravessa o papel-carbono.',
        },
        {
          id: 'AP045.3-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual impressora costuma ser a escolha mais comum para imprimir fotos em casa, por causa da qualidade da cor?',
          data: { options: [
            { id: 'a', text: 'A jato de tinta.', correct: true },
            { id: 'b', text: 'A matricial.',
              porque: 'A matricial imprime só em preto ou na cor da fita, longe da qualidade necessária para foto.' },
            { id: 'c', text: 'A plotter.',
              porque: 'A plotter é feita para tamanhos grandes, como plantas e banners, e não é a escolha comum de casa.' },
            { id: 'd', text: 'Nenhuma das quatro imprime foto com boa qualidade de cor.',
              porque: 'A jato de tinta é reconhecida justamente por imprimir foto com boa qualidade de cor.' },
          ]},
          explanation: 'A tinta líquida da jato de tinta reproduz cores e gradientes melhor do que o toner da laser.',
        },
        {
          id: 'AP045.3-L1-Q3', type: 'multiple_choice',
          prompt: 'Um escritório imprime centenas de páginas de texto por dia e precisa de velocidade e custo baixo por página. Qual impressora atende melhor a essa necessidade?',
          data: { options: [
            { id: 'a', text: 'A laser.', correct: true },
            { id: 'b', text: 'A jato de tinta.',
              porque: 'A jato de tinta tem custo de cartucho mais alto por página, o que pesa num volume grande de impressão.' },
            { id: 'c', text: 'A matricial.',
              porque: 'A matricial é lenta e de baixa qualidade — ela se justifica pela via em papel-carbono, não pelo volume de texto.' },
            { id: 'd', text: 'A plotter.',
              porque: 'A plotter imprime em tamanhos grandes, como plantas; não é pensada para volume de páginas comuns.' },
          ]},
          explanation: 'A laser é mais rápida e mais barata por página em grande volume — por isso domina escritórios.',
        },
        {
          id: 'AP045.3-L1-Q4', type: 'true_false',
          prompt: 'O que define a plotter é a tecnologia usada para imprimir, e não o tamanho do papel.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro', porque: 'É o contrário: modelos antigos de plotter desenhavam com caneta, e os de hoje usam jato de tinta — o que não muda é o tamanho grande do papel que ela imprime.' },
          ]},
          explanation: 'A plotter é definida pelo tamanho — planta, banner, mapa —, não por uma tecnologia de impressão única.',
        },
        {
          id: 'AP045.3-L1-Q5', type: 'multiple_choice',
          prompt: 'Um escritório de arquitetura precisa imprimir a planta de uma casa em tamanho grande, para pendurar na parede da obra. Qual impressora resolve isso?',
          data: { options: [
            { id: 'a', text: 'A plotter, feita para imprimir em tamanhos grandes.', correct: true },
            { id: 'b', text: 'A matricial, por ser a que bate diretamente no papel.',
              porque: 'Bater no papel serve para vias com papel-carbono, e não tem relação com imprimir em tamanho grande.' },
            { id: 'c', text: 'A jato de tinta comum de casa, ajustando o zoom do documento.',
              porque: 'Uma jato de tinta comum de casa imprime folhas do tamanho de A4, não do tamanho de uma planta baixa.' },
            { id: 'd', text: 'A laser, porque ela é a mais rápida entre as quatro.',
              porque: 'Velocidade não resolve tamanho: a laser comum também imprime em folhas do tamanho de A4.' },
          ]},
          explanation: 'O que a planta baixa exige é tamanho de papel, e é isso que separa a plotter das outras três.',
        },
        {
          id: 'AP045.3-L1-Q6', type: 'matching',
          prompt: 'Ligue cada impressora ao trabalho em que ela se destaca.',
          data: { pairs: [
            { left: 'Matricial', right: 'Nota fiscal ou boleto com várias vias em papel-carbono' },
            { left: 'Jato de tinta', right: 'Foto em casa, com boa qualidade de cor' },
            { left: 'Laser', right: 'Grande volume de texto num escritório, rápido e barato por página' },
            { left: 'Plotter', right: 'Planta baixa, banner ou mapa em tamanho grande' },
          ]},
          explanation: 'Cada uma resolve um problema que as outras três não resolvem tão bem — não existe uma "melhor" sozinha.',
        },
        {
          id: 'AP045.3-L1-Q7', type: 'multiple_choice',
          prompt: 'Por que a impressora matricial costuma ser mais barulhenta que as outras três?',
          data: { options: [
            { id: 'a', text: 'Porque ela forma cada letra batendo uma agulha física contra uma fita de tinta.', correct: true },
            { id: 'b', text: 'Porque ela usa um motor a laser muito mais potente que as demais.',
              porque: 'Laser é a tecnologia de outra impressora, e não é o que causa o barulho da matricial.' },
            { id: 'c', text: 'Porque o cabeçote dela se move numa velocidade muito maior que o das outras.',
              porque: 'O barulho vem do impacto da agulha, e não simplesmente da velocidade do movimento.' },
            { id: 'd', text: 'Porque ela precisa esquentar o papel antes de imprimir, como a laser faz com o toner.',
              porque: 'Esquentar para fixar é uma etapa da impressora laser, não da matricial.' },
          ]},
          explanation: 'É o mesmo impacto que faz o barulho e que permite atravessar o papel-carbono para gerar cópias.',
        },
      ],
    },
  ],
};
