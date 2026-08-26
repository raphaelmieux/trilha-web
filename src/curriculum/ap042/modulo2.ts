import type { Module } from '../../types';

/*
 * AP042 módulo 2 — o requisito 3, que pede sete demonstrações de formatação.
 *
 * O requisito não manda saber o que é uma margem: manda ajustar a margem. É
 * tarefa, e tarefa não se prova respondendo múltipla escolha — a pessoa pode
 * marcar a alternativa certa sobre o botão de negrito sem nunca ter apertado um.
 *
 * Por isso o módulo tem duas partes, e a segunda é que cumpre o requisito. A
 * teoria existe para a prática não virar caça ao botão: quem entra no
 * laboratório sabendo o que "justificado" faz procura o alinhamento certo; quem
 * entra sem saber clica nos quatro até um parecer diferente.
 *
 * A lição teórica insiste numa coisa que a barra de ferramentas esconde: quase
 * toda formatação vale para o que está selecionado. Não selecionar nada e
 * apertar negrito é o erro que todo mundo comete uma vez, e ele não dá erro
 * nenhum — simplesmente não acontece nada, e a pessoa conclui que o programa
 * está quebrado.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">O texto pronto e o texto entregue</h2>
<p class="mb-3">Escrever é a primeira metade. A segunda é deixar o texto com
cara de documento: margens certas, títulos que se destacam, parágrafos que dão
para ler sem cansar a vista.</p>
<p class="mb-3">Tudo isso se faz com a <strong>barra de ferramentas</strong>, a
fileira de botões no alto do programa. Vamos por partes.</p>

<h3 class="font-bold mt-4 mb-2">A regra que vale para quase tudo: selecionar primeiro</h3>
<p class="mb-3">Quase todo botão de formatação age sobre o que está
<strong>selecionado</strong> — o trecho que você marcou arrastando o mouse por
cima, e que fica com um fundo colorido.</p>
<p class="mb-3">Se nada estiver selecionado, apertar negrito não dá erro: não
acontece nada. É o engano mais comum de quem está começando, e a pessoa costuma
achar que o programa quebrou. Não quebrou — ela só não disse ao programa
<em>onde</em> aplicar.</p>

<h3 class="font-bold mt-4 mb-2">A folha: margens, tamanho e orientação</h3>
<p class="mb-3">Antes do texto vem a folha. Três coisas se ajustam nela:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Margens</strong> — a faixa em branco na volta do texto. Margem
  pequena cabe mais palavra por página; margem grande deixa a leitura mais
  leve e dá espaço para o professor escrever ao lado.</li>
  <li><strong>Tamanho do papel</strong> — no Brasil quase tudo é
  <strong>A4</strong>. Papel "Carta" é um pouco mais curto e mais largo, e é o
  padrão dos Estados Unidos. Escolher errado faz o texto sair cortado na
  impressora.</li>
  <li><strong>Orientação</strong> — <strong>retrato</strong> é a folha em pé,
  como num trabalho de escola. <strong>Paisagem</strong> é deitada, boa para
  tabela larga e para cartaz.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Copiar e colar</h3>
<p class="mb-3">São três passos, sempre na mesma ordem: <strong>selecionar</strong>
o trecho, <strong>copiar</strong> (Ctrl+C), ir até o lugar novo e
<strong>colar</strong> (Ctrl+V).</p>
<p class="mb-3">Copiar deixa o original onde está. <strong>Recortar</strong>
(Ctrl+X) é o primo que leva o trecho embora do lugar de origem — mesmo colar,
outra intenção.</p>

<h3 class="font-bold mt-4 mb-2">A letra: fonte, tamanho e destaque</h3>
<p class="mb-3">A <strong>fonte</strong> é o desenho da letra: Arial, Times New
Roman, Calibri. O <strong>tamanho</strong> vai em pontos — corpo de texto
costuma ficar entre 11 e 12, e título fica maior.</p>
<p class="mb-3">Para destacar há três botões, e cada um tem um uso:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Negrito</strong> engrossa a letra. Serve para o que precisa ser
  visto de longe: título, palavra-chave.</li>
  <li><em>Itálico</em> inclina a letra. Serve para nome de livro, palavra
  estrangeira e para dar ênfase leve.</li>
  <li><u>Sublinhado</u> risca embaixo. Use pouco: na tela, texto sublinhado
  parece link e a pessoa tenta clicar.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">O parágrafo: alinhamento e espaçamento</h3>
<p class="mb-3">O <strong>alinhamento</strong> diz para que lado o texto
encosta:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>À esquerda</strong> — o começo das linhas fica alinhado e o fim
  fica irregular. É o normal para quase tudo.</li>
  <li><strong>Centralizado</strong> — o texto fica no meio. Bom para título e
  para capa; ruim para parágrafo longo.</li>
  <li><strong>À direita</strong> — encosta no lado direito. Usa-se em data e
  em assinatura.</li>
  <li><strong>Justificado</strong> — encosta nos dois lados ao mesmo tempo, e
  o programa estica os espaços entre as palavras para isso. Deixa o bloco com
  cara de livro.</li>
</ul>
<p class="mb-3">O <strong>espaçamento</strong> é o ar do parágrafo: entre as
linhas (simples, 1,5, duplo) e antes e depois do bloco. Espaçamento 1,5 é o
mais pedido em trabalho escolar, porque cansa menos a vista.</p>

<h3 class="font-bold mt-4 mb-2">Listas: marcadores e numeração</h3>
<p class="mb-3"><strong>Marcadores</strong> são as bolinhas: servem para itens
em que a ordem não importa, como uma lista de material. <strong>Numeração</strong>
são os números: servem quando a ordem importa, como um passo a passo.</p>
<p class="mb-3">Escolher um pelo outro não é enfeite. Numerar uma lista de
compras sugere que existe uma ordem que não existe; pôr bolinha numa receita
esconde que o passo 3 vem depois do 2.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Se um botão parece não funcionar:</strong> olhe se há algo
  selecionado. Formatação sem seleção é ordem sem endereço.</p>
</div>
`;

export const modulo2: Module = {
  code: 'AP042.2',
  title: 'Escrever é só o começo',
  description: 'As ferramentas que transformam um texto solto em documento pronto para entregar.',
  lessons: [
    {
      code: 'AP042.2-L1',
      title: 'O que cada botão da barra faz',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP042-3.1', 'AP042-3.3', 'AP042-3.5', 'AP042-3.7'],
      questions: [
        {
          id: 'AP042.2-L1-Q1', type: 'multiple_choice',
          prompt: 'Você apertou o botão de negrito e nada mudou no texto. Qual é a explicação mais provável?',
          data: { options: [
            { id: 'a', text: 'Não havia nada selecionado quando você apertou.', correct: true },
            { id: 'b', text: 'O programa está com defeito e precisa ser fechado e aberto de novo.',
              porque: 'Quase sempre é a seleção. Fechar o programa dá trabalho e não resolve nada.' },
            { id: 'c', text: 'A fonte escolhida não aceita negrito, e por isso o botão ficou sem efeito.',
              porque: 'Isso existe, mas é raríssimo. Antes de culpar a fonte, olhe se há trecho marcado.' },
            { id: 'd', text: 'O documento foi aberto no modo de leitura, que impede qualquer alteração.',
              porque: 'No modo de leitura o botão nem aparece disponível — não é o caso de apertar e nada acontecer.' },
          ]},
          explanation: 'Formatação sem seleção é ordem sem endereço: o programa não sabe onde aplicar.',
        },
        {
          id: 'AP042.2-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre alinhamento justificado e alinhamento à esquerda?',
          data: { options: [
            { id: 'a', text: 'O justificado encosta nos dois lados; o esquerdo só no começo da linha.', correct: true },
            { id: 'b', text: 'O justificado centraliza o parágrafo inteiro no meio da folha, e o esquerdo não.',
              porque: 'Centralizar é outro botão. Justificado encosta nas duas bordas, e não no meio.' },
            { id: 'c', text: 'O justificado aumenta a letra até a linha ficar cheia de ponta a ponta.',
              porque: 'A letra não muda de tamanho. O que o programa estica é o espaço entre as palavras.' },
            { id: 'd', text: 'Não há diferença de verdade: os dois deixam o texto igual na hora de imprimir.',
              porque: 'A diferença aparece na borda direita, que fica reta no justificado e irregular no esquerdo.' },
          ]},
          explanation: 'Para encostar nos dois lados, o programa estica os espaços entre as palavras.',
        },
        {
          id: 'AP042.2-L1-Q3', type: 'multiple_choice',
          prompt: 'Quando se usa numeração em vez de marcadores?',
          data: { options: [
            { id: 'a', text: 'Quando a ordem dos itens importa, como num passo a passo.', correct: true },
            { id: 'b', text: 'Quando a lista tem mais de cinco itens e ficaria difícil de contar com bolinhas.',
              porque: 'O tamanho da lista não decide. O que decide é se existe uma ordem a respeitar.' },
            { id: 'c', text: 'Quando o texto vai ser impresso, porque bolinha some em impressora comum.',
              porque: 'Marcador imprime normalmente. A escolha é de sentido, não de impressão.' },
            { id: 'd', text: 'Quando o professor pede, e nas outras vezes tanto faz qual dos dois usar.',
              porque: 'Não tanto faz: numerar uma lista sem ordem sugere uma sequência que não existe.' },
          ]},
          explanation: 'Bolinha numa receita esconde que o passo 3 vem depois do 2.',
        },
        {
          id: 'AP042.2-L1-Q4', type: 'ordering',
          prompt: 'Ponha na ordem os passos para levar um trecho de texto para outro lugar do documento, sem apagá-lo do lugar de origem.',
          data: { items: [
            { id: 'i1', text: 'Selecionar o trecho, arrastando o mouse por cima', order: 1 },
            { id: 'i2', text: 'Copiar, com Ctrl+C ou pelo botão de copiar', order: 2 },
            { id: 'i3', text: 'Clicar no lugar novo, onde o trecho deve entrar', order: 3 },
            { id: 'i4', text: 'Colar, com Ctrl+V ou pelo botão de colar', order: 4 },
          ]},
          explanation: 'Copiar mantém o original onde está. Quem quer levar embora usa recortar, no lugar de copiar.',
        },
        {
          id: 'AP042.2-L1-Q5', type: 'true_false',
          prompt: 'Papel A4 e papel Carta são o mesmo tamanho, apenas com nomes diferentes em cada país.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. O Carta é mais curto e mais largo, e escolher errado corta o texto na impressão.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'No Brasil quase tudo é A4. O Carta é o padrão dos Estados Unidos, e tem outra medida.',
        },
        {
          id: 'AP042.2-L1-Q6', type: 'fill_blank',
          prompt: 'A folha em pé, como num trabalho de escola, chama-se orientação ___.',
          data: { blanks: [
            { id: 'b1', answer: 'retrato', hint: 'A outra é paisagem, com a folha deitada.', aceitas: ['em pé', 'vertical'] },
          ]},
          explanation: 'Retrato é a folha em pé; paisagem é deitada, boa para tabela larga e cartaz.',
        },
        {
          id: 'AP042.2-L1-Q7', type: 'matching',
          prompt: 'Ligue cada recurso ao uso que combina com ele.',
          data: { pairs: [
            { left: 'Negrito', right: 'Destacar um título' },
            { left: 'Itálico', right: 'Nome de livro ou palavra estrangeira' },
            { left: 'Alinhado à direita', right: 'Data e assinatura' },
            { left: 'Marcadores', right: 'Lista em que a ordem não importa' },
          ]},
          explanation: 'Cada recurso resolve um problema. Usar todos ao mesmo tempo não destaca nada.',
        },
      ],
    },
    {
      code: 'AP042.2-L2',
      title: 'Formatando um documento inteiro',
      type: 'lab',
      content: '',
      requirementCodes: [
        'AP042-3.1', 'AP042-3.2', 'AP042-3.3', 'AP042-3.4',
        'AP042-3.5', 'AP042-3.6', 'AP042-3.7',
      ],
      labType: 'formatacao_texto',
    },
  ],
};
