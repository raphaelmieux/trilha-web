import type { Module } from '../../types';

/*
 * AP042 módulo 4 — o requisito 5, que é uma pergunta só: como proteger o
 * computador de oscilações de energia?
 *
 * Um requisito curto tenta virar uma lição curta, e aqui isso seria um erro. A
 * resposta que a maioria dá — "usar filtro de linha" — está errada, e errada de
 * um jeito caro: o filtro é o aparelho mais vendido, o mais barato e o que menos
 * protege. Quem sai daqui repetindo a resposta popular fica pior do que quem não
 * sabia, porque agora tem confiança.
 *
 * Então a lição separa três aparelhos que se parecem na prateleira e fazem
 * coisas diferentes, e dedica espaço ao que nenhum deles resolve: o raio. A
 * única proteção contra raio é tirar da tomada, e isso é conselho que se segue
 * de graça — que é o critério deste projeto para conselho útil.
 *
 * O exemplo do chuveiro não é enfeite: é a oscilação que a criança de dez anos
 * já viu acontecer, com a luz piscando quando alguém liga o chuveiro. Partir
 * dali é partir de algo que ela sabe que existe.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">A luz piscou — e o computador sentiu</h2>
<p class="mb-3">Você já viu a lâmpada dar uma piscada quando alguém liga o
chuveiro? Isso é a energia <strong>oscilando</strong>: por um instante, chega
menos do que deveria. A lâmpada avisa piscando. O computador não avisa nada —
ele só vai durando menos.</p>

<h3 class="font-bold mt-4 mb-2">Os três tipos de problema</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Queda</strong> — chega menos energia do que o aparelho precisa.
  É a piscada do chuveiro. Repetida, vai desgastando a fonte por dentro.</li>
  <li><strong>Pico</strong> — chega muito mais, de uma vez. Vem quando a
  energia volta depois de um apagão, ou quando cai um raio perto. É o que
  queima na hora.</li>
  <li><strong>Corte</strong> — acaba a energia. O computador desliga no meio do
  que estava fazendo, e o que não tinha sido salvo se perde.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Três aparelhos que se parecem e não fazem o mesmo</h3>
<p class="mb-3">Na loja eles ficam na mesma prateleira, e é fácil comprar o
errado achando que está resolvido.</p>

<h4 class="font-bold mt-3 mb-1">Filtro de linha</h4>
<p class="mb-3">É a régua com várias tomadas. A maioria só serve para
<strong>aumentar o número de tomadas</strong> — não protege de nada. Os que têm
proteção de verdade trazem escrito "protetor contra surtos" e aguentam picos
pequenos. Contra queda de energia, nenhum deles faz nada.</p>

<h4 class="font-bold mt-3 mb-1">Estabilizador</h4>
<p class="mb-3">Recebe energia irregular e entrega energia
<strong>estável</strong>. Quando chega de menos, ele completa; quando chega de
mais, ele segura. Resolve a piscada do chuveiro — mas se a energia acabar, ele
também apaga.</p>

<h4 class="font-bold mt-3 mb-1">Nobreak</h4>
<p class="mb-3">É um estabilizador <strong>com bateria dentro</strong>. Faz
tudo o que o estabilizador faz e, quando a energia acaba, continua alimentando o
computador por alguns minutos. Não é para você continuar trabalhando: é para
<strong>salvar o arquivo e desligar direito</strong>. É o mais caro dos três, e
o único que protege contra o corte.</p>

<h3 class="font-bold mt-4 mb-2">O raio: o que nenhum deles resolve</h3>
<p class="mb-3">Um raio que cai perto manda pela fiação muito mais energia do
que qualquer um desses aparelhos aguenta. E ele não entra só pela tomada:
entra também pelo cabo de internet e pelo cabo da antena.</p>
<p class="mb-3">A única proteção que funciona de verdade é
<strong>tirar da tomada</strong> durante a tempestade — o cabo de força e
também o cabo de internet. Aparelho desligado no botão, mas ainda espetado,
continua ligado à fiação e continua em risco.</p>

<h3 class="font-bold mt-4 mb-2">Hábitos que ajudam de graça</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Não dividir a tomada do computador com chuveiro, ferro ou micro-ondas:
  são eles que puxam muita energia de uma vez.</li>
  <li>Nada de "benjamim" com aparelho puxado em cima de aparelho: a fiação
  esquenta e vira risco de incêndio.</li>
  <li>Salvar o trabalho de vez em quando. Nenhum aparelho protege o arquivo
  que só existia na memória.</li>
</ul>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Resumo em uma linha:</strong> filtro de linha dá tomada,
  estabilizador acerta a energia que oscila, nobreak segura quando ela acaba —
  e contra raio, tirar da tomada.</p>
</div>
`;

export const modulo4: Module = {
  code: 'AP042.4',
  title: 'A energia que chega pela tomada',
  description: 'Por que luz oscilando estraga computador, e o que fica entre a tomada e a máquina.',
  lessons: [
    {
      code: 'AP042.4-L1',
      title: 'Quando a luz pisca e o computador sente',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP042-5.1'],
      questions: [
        {
          id: 'AP042.4-L1-Q1', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre um estabilizador e um nobreak?',
          data: { options: [
            { id: 'a', text: 'O nobreak tem bateria e segura o computador quando a energia acaba.', correct: true },
            { id: 'b', text: 'O estabilizador é para computador de mesa e o nobreak é para notebook.',
              porque: 'Os dois servem para qualquer máquina. O notebook, aliás, já tem bateria própria.' },
            { id: 'c', text: 'O estabilizador protege contra raio, e o nobreak protege só contra queda.',
              porque: 'Nenhum dos dois protege contra raio de verdade. Contra raio é tirar da tomada.' },
            { id: 'd', text: 'Não há diferença de função: mudam só o preço e a marca que fabricou cada um.',
              porque: 'A diferença é grande: a bateria do nobreak é o que segura a máquina no apagão.' },
          ]},
          explanation: 'O nobreak faz tudo o que o estabilizador faz, e ainda dá minutos para salvar e desligar direito.',
        },
        {
          id: 'AP042.4-L1-Q2', type: 'multiple_choice',
          prompt: 'Um filtro de linha comum, desses com várias tomadas, protege o computador de quê?',
          data: { options: [
            { id: 'a', text: 'De quase nada: a maioria só aumenta o número de tomadas.', correct: true },
            { id: 'b', text: 'De queda de energia, mantendo a máquina ligada por alguns minutos.',
              porque: 'Manter ligado só o nobreak faz, porque só ele tem bateria dentro.' },
            { id: 'c', text: 'De raio, porque ele desliga sozinho assim que sente a descarga chegando.',
              porque: 'Contra raio nenhum aparelho de tomada resolve. A proteção é desligar da tomada.' },
            { id: 'd', text: 'De toda oscilação, entregando sempre a mesma energia certinha para a máquina.',
              porque: 'Isso é o estabilizador. O filtro comum entrega o que chega, do jeito que chega.' },
          ]},
          explanation: 'Só os que trazem escrito "protetor contra surtos" aguentam picos pequenos — e nem esses seguram queda.',
        },
        {
          id: 'AP042.4-L1-Q3', type: 'true_false',
          prompt: 'Durante uma tempestade com raios, a proteção mais segura é tirar o computador da tomada.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro. Um raio manda pela fiação muito mais do que qualquer protetor aguenta.' },
          ]},
          explanation: 'E não só o cabo de força: o raio entra também pelo cabo de internet e pelo da antena.',
        },
        {
          id: 'AP042.4-L1-Q4', type: 'scenario',
          prompt: 'Na casa do Lucas, a luz pisca toda vez que alguém liga o chuveiro, e o computador dele já desligou sozinho duas vezes por causa disso. Ele tem pouco dinheiro. O que resolve o problema dele?',
          data: { scenarios: [
            { id: 'a', text: 'Um estabilizador entre a tomada e o computador.', correct: true },
            { id: 'b', text: 'Um filtro de linha novo, dos que têm mais tomadas e cabo mais grosso.',
              porque: 'Mais tomadas não acertam a energia que chega. A piscada continuaria igual.' },
            { id: 'c', text: 'Trocar a fonte do computador por uma mais forte, que aguente mais energia.',
              porque: 'Fonte mais forte não conserta energia irregular: ela recebe o mesmo problema.' },
            { id: 'd', text: 'Deixar o computador sempre desligado quando alguém estiver tomando banho em casa.',
              porque: 'Funciona, mas é a família inteira mudando de rotina por causa da máquina.' },
          ]},
          explanation: 'A piscada do chuveiro é queda de energia, e é exatamente o que o estabilizador corrige.',
        },
        {
          id: 'AP042.4-L1-Q5', type: 'true_false',
          prompt: 'Um computador desligado no botão, mas ainda espetado na tomada, está protegido de um pico de energia.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Espetado, ele continua ligado à fiação — e é pela fiação que o pico chega.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Desligar no botão não corta o caminho da energia. Só tirar da tomada corta.',
        },
        {
          id: 'AP042.4-L1-Q6', type: 'matching',
          prompt: 'Ligue cada aparelho ao que ele resolve.',
          data: { pairs: [
            { left: 'Filtro de linha', right: 'Aumentar o número de tomadas' },
            { left: 'Estabilizador', right: 'Corrigir a energia que oscila' },
            { left: 'Nobreak', right: 'Segurar a máquina no apagão' },
            { left: 'Tirar da tomada', right: 'Proteger de raio na tempestade' },
          ]},
          explanation: 'Eles ficam na mesma prateleira e resolvem problemas diferentes. Comprar o errado é gastar sem proteger.',
        },
      ],
    },
  ],
};
