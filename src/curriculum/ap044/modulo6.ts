import type { Module } from '../../types';

/*
 * AP044 módulo 6 — o requisito 9, num editor de apresentações.
 *
 * Sete itens, e o mesmo eixo da trilha inteira: descrever uma vez e deixar o
 * programa aplicar em toda parte. Modelo é isso para a aparência; layout é
 * isso para a posição das caixas.
 *
 * ── O erro que o layout evita ────────────────────────────────────────────
 * Quem não usa layout desenha caixa de texto à mão em cada slide. Vinte slides
 * depois, o título de cada um está num lugar ligeiramente diferente, e a
 * apresentação "pisca" a cada troca: o olho de quem assiste acompanha o título
 * subindo e descendo em vez de ler o que está escrito. O defeito é invisível
 * de dentro — cada slide, sozinho, parece certo.
 *
 * ── O vídeo é onde a apresentação quebra na hora H ───────────────────────
 * O item e) pede inserir um vídeo, e é o item que mais falha no dia da
 * apresentação. O arquivo fica no computador de quem montou; a apresentação
 * viaja no pen drive; no computador do clube o quadro do vídeo aparece preto
 * e ninguém entende por quê. Inserir **incorporando** põe o vídeo dentro do
 * arquivo; inserir por link deixa só o endereço. Os dois se chamam "inserir",
 * e a diferença só aparece longe de casa.
 *
 * ── E o PDF não é a apresentação ─────────────────────────────────────────
 * O item g) pede salvar em PDF, e é preciso dizer para que serve: o PDF abre
 * em qualquer lugar e mantém a aparência, mas é papel — o vídeo não toca, o
 * áudio não toca, a transição não acontece. É o formato de **entregar**, e não
 * o de apresentar. Levar só o PDF por segurança é chegar com a apresentação
 * pela metade.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">O slide não é o texto da fala</h2>
<p class="mb-3">A apresentação do culto jovem tem vinte slides, e em cada um há
um parágrafo inteiro escrito. Quem assiste faz uma coisa só: lê antes de você
falar, e para de ouvir. O slide é <strong>apoio</strong> — quem apresenta é
você.</p>

<h3 class="font-bold mt-4 mb-2">Modelo: escolher a aparência uma vez</h3>
<p class="mb-3">Um <strong>modelo</strong> (também chamado de <em>template</em>)
traz cor de fundo, tipo de letra, tamanhos e posições já combinados entre si.
Escolhendo um, os vinte slides nascem coerentes — e mudando o modelo depois,
mudam os vinte juntos.</p>
<p class="mb-3">É a mesma ideia do estilo no editor de texto: descrever uma vez,
aplicar em toda parte.</p>

<h3 class="font-bold mt-4 mb-2">Layout: o esqueleto de cada slide</h3>
<p class="mb-3">Dentro do modelo, cada slide tem um <strong>layout</strong>: só
título, título e conteúdo, dois conteúdos lado a lado, imagem com legenda. O
layout já traz as caixas nos lugares certos — você preenche, não desenha.</p>
<p class="mb-3">Desenhar caixa de texto à mão em cada slide parece dar no mesmo,
e não dá. Vinte slides depois, cada título está alguns milímetros deslocado do
anterior, e a apresentação <strong>pisca</strong> a cada troca: o olho de quem
assiste acompanha o título pulando em vez de ler. De dentro, cada slide parece
perfeito — o defeito só existe na sequência.</p>

<h3 class="font-bold mt-4 mb-2">Criar, duplicar, reorganizar, excluir</h3>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Duplicar</strong> um slide copia conteúdo e formatação. Serve para
uma série de slides parecidos — três versículos no mesmo desenho.</li>
<li><strong>Reorganizar</strong> se faz na tira lateral, arrastando. Mudar a
ordem é montar o raciocínio, e ela quase nunca sai certa de primeira.</li>
<li><strong>Excluir</strong> é o mais difícil: o slide que você gostou de fazer
e que não cabe na fala precisa sair.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Imagem: pelo canto, sempre</h3>
<p class="mb-3">Redimensionar puxando o <strong>canto</strong> mantém a
proporção. Puxando o <strong>lado</strong>, a imagem estica: as pessoas na foto
ficam magras ou gordas, e o emblema do clube deixa de ser o emblema do clube.</p>
<p class="mb-3">E imagem se organiza pelo alinhamento do programa, não pelo
olho: quatro fotos alinhadas por comando ficam alinhadas, quatro arrastadas
ficam quase.</p>

<h3 class="font-bold mt-4 mb-2">Vídeo e áudio: o que viaja junto</h3>
<p class="mb-3">Inserir um vídeo tem dois caminhos, e eles se parecem na hora de
clicar:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Incorporar</strong> põe o arquivo dentro da apresentação. O arquivo
fica pesado e funciona em qualquer computador.</li>
<li><strong>Vincular</strong> guarda só o endereço do arquivo. Fica leve, e no
computador do clube o quadro aparece preto.</li>
</ul>
<p class="mb-3">Vale igual para o áudio. E vale a regra do dia da apresentação:
o que não está dentro do arquivo pode não estar lá na hora.</p>

<h3 class="font-bold mt-4 mb-2">PDF: para entregar, não para apresentar</h3>
<p class="mb-3">Salvar em PDF congela a aparência: abre em qualquer aparelho,
com as letras certas, mesmo em máquina que não tenha o programa. Em troca, é
papel — o vídeo não toca, o áudio não toca, a transição não acontece.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>Leve os dois:</strong> a apresentação para
apresentar, o PDF para deixar com quem pediu. Levar só o PDF é chegar sem
metade do que você montou.</p>
</div>
`;

export const modulo6: Module = {
  code: 'AP044.6',
  title: 'A apresentação do clube',
  description: 'Modelo, layout, imagem pelo canto, vídeo que viaja junto — e o PDF, que é para entregar.',
  lessons: [
    {
      code: 'AP044.6-L1',
      title: 'Modelo, layout e o que viaja junto',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP044-9.1', 'AP044-9.2', 'AP044-9.4', 'AP044-9.5', 'AP044-9.6', 'AP044-9.7'],
      perguntas: 5,
      questions: [
        {
          id: 'AP044.6-L1-Q1', type: 'multiple_choice',
          prompt: 'Qual é a vantagem de começar a apresentação por um modelo (template)?',
          data: { options: [
            { id: 'a', text: 'Cores, letras e posições já vêm combinadas, e mudam nos vinte slides juntas.', correct: true },
            { id: 'b', text: 'O modelo escreve o conteúdo dos slides a partir do assunto informado.',
              porque: 'Modelo é aparência. O que vai escrito continua sendo escrito por quem apresenta.' },
            { id: 'c', text: 'Apresentação feita com modelo abre em qualquer programa, sem conversão.',
              porque: 'Isso depende do formato do arquivo, e não de haver modelo aplicado.' },
            { id: 'd', text: 'O modelo impede que alguém altere a formatação dos slides depois.',
              porque: 'Tudo continua editável: o modelo é ponto de partida, e não tranca.' },
          ]},
          explanation: 'É a mesma ideia do estilo no editor de texto, aplicada à apresentação inteira.',
        },
        {
          id: 'AP044.6-L1-Q2', type: 'multiple_choice',
          prompt: 'O que acontece com uma apresentação de vinte slides cujos títulos foram desenhados à mão, um por um?',
          data: { options: [
            { id: 'a', text: 'O título pula de lugar a cada troca de slide, e o olho acompanha o pulo.', correct: true },
            { id: 'b', text: 'O programa recusa a apresentação em tela cheia até que se aplique um layout.',
              porque: 'Ele apresenta normalmente. O defeito é de leitura, e nada o denuncia na tela.' },
            { id: 'c', text: 'Os títulos somem quando o arquivo é aberto em outro computador.',
              porque: 'Caixa de texto é conteúdo do slide e viaja com ele.' },
            { id: 'd', text: 'Nada muda, porque a diferença entre os dois caminhos é só de trabalho.',
              porque: 'A diferença aparece na sequência: cada slide parece certo, e o conjunto não fica.' },
          ]},
          explanation: 'É um defeito invisível de dentro: só existe quando os slides passam em sequência.',
        },
        {
          id: 'AP044.6-L1-Q3', type: 'multiple_choice',
          prompt: 'Você inseriu um vídeo, levou a apresentação no pen drive e no computador do clube o quadro do vídeo está preto. Qual é a causa mais provável?',
          data: { options: [
            { id: 'a', text: 'O vídeo foi vinculado, e só o endereço dele viajou no arquivo.', correct: true },
            { id: 'b', text: 'O pen drive corrompeu o vídeo ao copiar o arquivo da apresentação.',
              porque: 'Cópia com defeito costuma impedir a apresentação inteira de abrir, e não só o vídeo.' },
            { id: 'c', text: 'Vídeo em apresentação só funciona no computador em que foi inserido.',
              porque: 'Funciona em qualquer um — desde que o arquivo do vídeo esteja incorporado.' },
            { id: 'd', text: 'O computador do clube precisa estar conectado à internet para tocar vídeo.',
              porque: 'Vídeo incorporado toca sem internet nenhuma.' },
          ]},
          explanation: 'Incorporar põe o arquivo dentro. Vincular guarda só o caminho — que não existe na outra máquina.',
        },
        {
          id: 'AP044.6-L1-Q4', type: 'multiple_choice',
          prompt: 'Por que redimensionar uma imagem puxando pelo lado, e não pelo canto, é um erro?',
          data: { options: [
            { id: 'a', text: 'Porque a imagem estica, e as pessoas da foto ficam magras ou gordas.', correct: true },
            { id: 'b', text: 'Porque puxar pelo lado apaga a parte da imagem que ficou de fora.',
              porque: 'Isso é recortar, e é outra operação. Redimensionar não descarta nada.' },
            { id: 'c', text: 'Porque a imagem perde qualidade e fica com quadradinhos visíveis.',
              porque: 'Perda de qualidade acontece ao ampliar demais, pelos dois caminhos.' },
            { id: 'd', text: 'Porque a imagem deixa de acompanhar o slide se ele mudar de layout.',
              porque: 'Ela continua no slide, e o layout não a expulsa.' },
          ]},
          explanation: 'O canto mantém a proporção; o lado desmancha a forma sem avisar.',
        },
        {
          id: 'AP044.6-L1-Q5', type: 'true_false',
          prompt: 'Levar apenas o PDF da apresentação é seguro, porque nele tudo funciona igual.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso: no PDF o vídeo não toca, o áudio não toca e a transição não acontece. Ele mantém a aparência, e não o que se mexe.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'PDF é o formato de entregar. Para apresentar, leve a apresentação.',
        },
        {
          id: 'AP044.6-L1-Q6', type: 'multiple_choice',
          prompt: 'Quando faz sentido duplicar um slide em vez de criar um novo?',
          data: { options: [
            { id: 'a', text: 'Quando o próximo repete o desenho do anterior, mudando só o texto.', correct: true },
            { id: 'b', text: 'Sempre, porque criar slide novo obriga a reaplicar o modelo inteiro.',
              porque: 'Slide novo já nasce dentro do modelo: não há o que reaplicar.' },
            { id: 'c', text: 'Quando se quer que os dois slides mudem juntos daqui em diante.',
              porque: 'A cópia é independente: mexer num não mexe no outro.' },
            { id: 'd', text: 'Quando a apresentação passa de vinte slides e fica pesada demais.',
              porque: 'Duplicar aumenta o arquivo, e não o contrário.' },
          ]},
          explanation: 'Duplicar copia conteúdo e formatação — serve à série de slides parecidos.',
        },
        {
          id: 'AP044.6-L1-Q7', type: 'matching',
          prompt: 'Ligue cada coisa ao que ela decide na apresentação.',
          data: { pairs: [
            { left: 'Modelo', right: 'A aparência de todos os slides' },
            { left: 'Layout', right: 'Onde ficam as caixas de um slide' },
            { left: 'Incorporar o vídeo', right: 'Se ele toca em outra máquina' },
            { left: 'Salvar em PDF', right: 'Abrir em aparelho sem o programa' },
          ]},
          explanation: 'Aparência, posição, portabilidade do que se mexe, e portabilidade do que é papel.',
        },
        {
          id: 'AP044.6-L1-Q8', type: 'multiple_choice',
          prompt: 'Por que escrever um parágrafo inteiro em cada slide atrapalha a apresentação?',
          data: { options: [
            { id: 'a', text: 'Porque quem assiste lê antes de você falar e para de ouvir.', correct: true },
            { id: 'b', text: 'Porque o programa reduz a letra até o texto caber, e ninguém enxerga.',
              porque: 'A letra encolher é consequência, e ainda assim o problema principal é a atenção perdida.' },
            { id: 'c', text: 'Porque slides com muito texto não podem ser salvos em PDF.',
              porque: 'Podem, e ficam iguais. O formato não limita a quantidade de texto.' },
            { id: 'd', text: 'Porque o parágrafo impede que se insira imagem no mesmo slide.',
              porque: 'Cabem os dois no mesmo slide — layout de dois conteúdos existe para isso.' },
          ]},
          explanation: 'O slide é apoio. Quem apresenta é a pessoa.',
        },
      ],
    },
    {
      code: 'AP044.6-L2',
      title: 'Montando a apresentação do clube',
      type: 'lab',
      content: '',
      requirementCodes: [
        'AP044-9.1', 'AP044-9.2', 'AP044-9.3', 'AP044-9.4',
        'AP044-9.5', 'AP044-9.6', 'AP044-9.7',
      ],
      labType: 'apresentacao',
    },
  ],
};
