import type { Module } from '../../types';

/*
 * AP041 módulo 1 — a história, e o relatório que o requisito 1 pede.
 *
 * A lição teórica existe por causa do laboratório que vem depois dela. O
 * requisito manda pesquisar e escrever 250 palavras; sem uma linha do tempo na
 * cabeça, "pesquisar a história dos computadores" vira copiar o primeiro
 * resultado da busca, que é exatamente o que a redação guiada existe para
 * evitar. Aqui o desbravador ganha o esqueleto — quem veio antes de quem, e por
 * quê — e a pesquisa dele passa a ter onde se apoiar.
 *
 * Os fatos abaixo são os mesmos que a Edge Function usa para conferir as
 * respostas da redação (supabase/functions/ai-gateway/redacao.ts). Divergir aqui
 * faria a lição ensinar uma data e o conferidor recusá-la.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Das contas na mão ao computador de bolso</h2>
<p class="mb-3">O computador não foi inventado de uma vez, por uma pessoa só. Ele
é o fim de uma fila de invenções que começou há milhares de anos, cada uma
resolvendo um problema que a anterior tinha deixado.</p>

<h3 class="font-bold mt-4 mb-2">Primeiro, o ábaco</h3>
<p class="mb-3">Muito antes de existir eletricidade, as pessoas já precisavam
contar coisas: sacos de trigo, dias, moedas. O <strong>ábaco</strong> — um
tabuleiro de contas que deslizam em varetas — foi usado na Mesopotâmia, na China
e em Roma, há milhares de anos.</p>
<p class="mb-3">Ele não calcula sozinho: quem calcula é a pessoa. O ábaco só
guarda o número enquanto ela pensa no próximo passo.</p>

<h3 class="font-bold mt-4 mb-2">Depois, as máquinas de engrenagem</h3>
<p class="mb-3">Em <strong>1642</strong>, um francês de dezenove anos chamado
<strong>Blaise Pascal</strong> construiu a <strong>Pascalina</strong> para ajudar
o pai, que passava noites somando impostos. Era uma caixa de engrenagens que
somava e subtraía sozinha.</p>
<p class="mb-3">Cerca de trinta anos depois, <strong>Leibniz</strong> fez uma
parecida que também multiplicava e dividia. Pela primeira vez, a conta acontecia
dentro da máquina.</p>

<h3 class="font-bold mt-4 mb-2">A ideia que faltava: seguir instruções</h3>
<p class="mb-3">A partir de <strong>1837</strong>, o inglês <strong>Charles
Babbage</strong> projetou a <strong>máquina analítica</strong>: ela não faria uma
conta só, faria a conta que mandassem, lida de cartões perfurados. É a ideia de
computador. Babbage morreu sem conseguir construí-la.</p>
<p class="mb-3">Em <strong>1843</strong>, <strong>Ada Lovelace</strong> escreveu
as instruções que essa máquina seguiria — o primeiro programa da história, feito
para um computador que ainda não existia. Por isso ela é chamada de primeira
programadora.</p>

<h3 class="font-bold mt-4 mb-2">Os gigantes de válvula</h3>
<p class="mb-3">A eletricidade fez a ideia virar máquina. O <strong>ENIAC</strong>,
de <strong>1946</strong>, pesava cerca de <strong>30 toneladas</strong>, tinha
perto de 18 mil válvulas e ocupava uma sala inteira. As válvulas esquentavam e
queimavam sem parar, e alguém tinha que trocá-las.</p>

<h3 class="font-bold mt-4 mb-2">O que encolheu tudo</h3>
<p class="mb-3">Em <strong>1947</strong> veio o <strong>transistor</strong>, que
faz o trabalho da válvula sendo minúsculo e sem esquentar. Em
<strong>1958</strong>, o <strong>circuito integrado</strong> juntou milhares de
transistores numa pastilha só — o chip. De sala inteira para a palma da mão.</p>

<h3 class="font-bold mt-4 mb-2">O computador entra em casa</h3>
<p class="mb-3">Até os anos 1970, computador era coisa de empresa e de
universidade. O <strong>Apple II</strong>, de <strong>1977</strong>, e o
<strong>IBM PC</strong>, de <strong>1981</strong>, mudaram isso: passaram a caber
numa mesa e a custar o que uma família conseguia pagar.</p>
<p class="mb-3">Hoje o computador mais usado do mundo cabe no bolso. O celular
que você conhece é milhões de vezes mais rápido que o ENIAC de 30 toneladas.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>O fio da história:</strong> primeiro a pessoa calculava e a máquina
  só guardava. Depois a máquina passou a calcular. Depois passou a seguir
  instruções. E então foi ficando menor, até caber no bolso.</p>
</div>
`;

export const modulo1: Module = {
  code: 'AP041.1',
  title: 'De onde vêm os computadores',
  description: 'A história das máquinas que calculam, do ábaco ao celular no seu bolso.',
  lessons: [
    {
      code: 'AP041.1-L1',
      title: 'A história das máquinas de calcular',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP041-1.1'],
      questions: [
        {
          id: 'AP041.1-L1-Q1', type: 'multiple_choice',
          prompt: 'Como as pessoas faziam contas antes de existir computador?',
          data: { options: [
            { id: 'a', text: 'Usavam o ábaco, com contas que deslizam em varetas.', correct: true },
            { id: 'b', text: 'Usavam calculadoras de bolso movidas a bateria pequena.',
              porque: 'A calculadora eletrônica é bem mais nova: veio depois dos primeiros computadores.' },
            { id: 'c', text: 'Não faziam contas grandes, porque ninguém sabia como fazer.',
              porque: 'Faziam, e algumas enormes: pirâmides e catedrais exigiram muito cálculo.' },
            { id: 'd', text: 'Esperavam a invenção do computador para poder calcular.',
              porque: 'O ábaco tem milhares de anos. A conta sempre foi feita — o que mudou foi a ferramenta.' },
          ]},
          explanation: 'O ábaco não calcula sozinho: ele guarda o número enquanto a pessoa pensa no próximo passo.',
        },
        {
          id: 'AP041.1-L1-Q2', type: 'multiple_choice',
          prompt: 'Quem construiu a Pascalina, e o que ela fazia?',
          data: { options: [
            { id: 'a', text: 'Charles Babbage, e ela guardava programas na memória.',
              porque: 'Babbage veio quase duzentos anos depois, e projetou outra máquina: a analítica.' },
            { id: 'b', text: 'Blaise Pascal, e ela somava e subtraía.', correct: true },
            { id: 'c', text: 'Ada Lovelace, e ela imprimia o resultado no papel.',
              porque: 'Ada Lovelace escreveu o primeiro programa, mas não construiu a Pascalina.' },
            { id: 'd', text: 'Gottfried Leibniz, e ela multiplicava e dividia.',
              porque: 'Leibniz fez outra calculadora, essa sim de multiplicar — e depois da Pascalina.' },
          ]},
          explanation: 'Pascal tinha dezenove anos e a construiu para ajudar o pai, que passava noites somando impostos.',
        },
        {
          id: 'AP041.1-L1-Q3', type: 'multiple_choice',
          prompt: 'Por que Ada Lovelace é chamada de primeira programadora?',
          data: { options: [
            { id: 'a', text: 'Porque construiu sozinha o primeiro computador que funcionou.',
              porque: 'Ela não construiu máquina nenhuma. O que ela fez foi escrever as instruções para uma.' },
            { id: 'b', text: 'Porque escreveu o primeiro programa feito para uma máquina.', correct: true },
            { id: 'c', text: 'Porque foi a primeira mulher a trabalhar com computadores modernos.',
              porque: 'Ela é bem anterior aos computadores modernos, e o título vem do programa que escreveu.' },
            { id: 'd', text: 'Porque inventou a linguagem que os computadores usam até hoje.',
              porque: 'As linguagens de hoje são muito posteriores. O feito dela foi o primeiro algoritmo.' },
          ]},
          explanation: 'Ela escreveu um programa para a máquina analítica, que nunca chegou a ser construída.',
        },
        {
          id: 'AP041.1-L1-Q4', type: 'true_false',
          prompt: 'Os primeiros computadores eletrônicos eram pequenos e cabiam em cima de uma mesa.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'O ENIAC pesava cerca de 30 toneladas e ocupava uma sala inteira, com quase 18 mil válvulas.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Caber numa mesa só foi possível depois do transistor e do circuito integrado.',
        },
        {
          id: 'AP041.1-L1-Q5', type: 'multiple_choice',
          prompt: 'O que fez os computadores ficarem menores?',
          data: { options: [
            { id: 'a', text: 'A invenção do transistor, que substituiu as válvulas.', correct: true },
            { id: 'b', text: 'A troca dos cabos por peças de plástico mais leves.',
              porque: 'O plástico não muda o tamanho do que faz a conta. Quem encolheu foi a peça que calcula.' },
            { id: 'c', text: 'A decisão das empresas de fabricar máquinas menores.',
              porque: 'Não foi decisão: antes do transistor, não havia como diminuir.' },
            { id: 'd', text: 'O uso de telas menores, que ocupavam menos espaço na mesa.',
              porque: 'A tela é só uma parte. O que ocupava a sala ficava dentro do gabinete.' },
          ]},
          explanation: 'O transistor faz o trabalho da válvula sendo minúsculo, e o circuito integrado juntou milhares deles numa pastilha.',
        },
        {
          id: 'AP041.1-L1-Q6', type: 'ordering',
          prompt: 'Ordene as invenções, da mais antiga para a mais nova.',
          data: {
            items: [
              /* Sem anos no enunciado: com eles na tela, ordenar seria ler
                 números, e não conhecer a história. */
              { id: 'a', text: 'O ábaco, de contas que deslizam, ajuda a pessoa a somar', order: 1 },
              { id: 'b', text: 'A Pascalina, de engrenagens, soma e subtrai sozinha', order: 2 },
              { id: 'c', text: 'O ENIAC ocupa uma sala inteira e funciona com válvulas', order: 3 },
              { id: 'd', text: 'O transistor substitui a válvula e encolhe as máquinas', order: 4 },
              { id: 'e', text: 'O computador pessoal chega à casa das famílias', order: 5 },
              { id: 'f', text: 'O celular põe um computador no bolso de cada um', order: 6 },
            ],
          },
          explanation: 'Primeiro a pessoa calculava, depois a máquina calculou, depois passou a seguir instruções — e então foi encolhendo.',
        },
      ],
    },
    {
      code: 'AP041.1-L2',
      title: 'Escrevendo sobre a história dos computadores',
      type: 'lab',
      content: '',
      requirementCodes: ['AP041-1.1'],
      labType: 'redacao_guiada',
    },
  ],
};
