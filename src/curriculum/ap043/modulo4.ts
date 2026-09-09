import type { Module } from '../../types';

/*
 * AP043 módulo 4 — o requisito 5, as seis demonstrações numa planilha.
 *
 * A teoria aqui carrega uma ideia só, e é a que separa quem usa planilha de
 * quem usa planilha como tabela bonita: **a fórmula não guarda o resultado,
 * ela guarda a conta**. Quem digita 1620 na coluna Total tem um número que
 * envelhece calado; quem escreve =B3*C3 tem um total que se refaz sozinho.
 *
 * A segunda ideia, menor e igualmente cara, é o endereço da célula. B3 não é
 * enfeite do cabeçalho: é o nome pelo qual a fórmula alcança aquele valor. Sem
 * isso, =SOMA(B3:B5) é uma sequência de símbolos sem sentido, e a pessoa copia
 * do quadro sem saber o que está pedindo.
 *
 * O que é gesto — arrastar a borda da coluna, mesclar, alinhar — fica para o
 * laboratório. Gesto não se aprende lendo.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Toda célula tem endereço</h2>
<p class="mb-3">Uma planilha é uma grade. As colunas têm letra, as linhas têm
número, e o encontro dos dois é o <strong>endereço da célula</strong>: a
primeira coluna, terceira linha, é <strong>B3</strong>… não — é
<strong>A3</strong>. A letra vem antes.</p>
<p class="mb-3">Isso parece detalhe de cabeçalho e não é: o endereço é como a
fórmula alcança o valor. Sem ele, não há como somar nada.</p>
<p class="mb-3">Quando você seleciona uma célula, o endereço dela aparece numa
caixinha no canto esquerdo, logo acima da grade. É a <strong>caixa de
nome</strong>, e ela é a primeira coisa a olhar quando você se perde.</p>

<h3 class="font-bold mt-4 mb-2">A diferença entre o número e a conta</h3>
<p class="mb-3">Numa planilha de orçamento você pode escrever o total de duas
maneiras:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Digitando <strong>1620</strong> — você fez a conta na cabeça e guardou o resultado.</li>
  <li>Escrevendo <strong>=B3*C3</strong> — você guardou a conta, e o programa faz o resto.</li>
</ul>
<p class="mb-3">Nas duas a tela mostra 1620, e é por isso que a diferença passa
despercebida. Ela aparece quando alguma coisa muda: se um desbravador desistir e
os inscritos caírem de 12 para 11, o número digitado continua 1620, errado, sem
nenhum aviso. A fórmula se refaz sozinha.</p>
<p class="mb-3">Toda fórmula começa com <strong>=</strong>. É esse sinal que diz
ao programa "o que vem aqui não é texto, é conta".</p>

<h3 class="font-bold mt-4 mb-2">Intervalo: dois pontos querem dizer "até"</h3>
<p class="mb-3">Somar cinco células escrevendo <em>=B3+B4+B5+B6+B7</em>
funciona, e ninguém faz. Escreve-se o <strong>intervalo</strong>:
<strong>B3:B7</strong>, que se lê "de B3 até B7".</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>=SOMA(B3:B7)</strong> — soma tudo o que houver naquele pedaço da coluna.</li>
  <li><strong>=MÉDIA(B3:B7)</strong> — soma e divide pela quantidade de valores.</li>
</ul>
<p class="mb-3">As duas ignoram célula vazia e célula com texto: elas não viram
zero. Se virassem, a média despencaria e ninguém entenderia por quê.</p>

<h3 class="font-bold mt-4 mb-2">Aparência é a última etapa</h3>
<p class="mb-3">Ajustar largura de coluna, alinhar dentro da célula, mesclar o
título e pôr borda são coisas de acabamento — e elas se fazem depois que os
números estão certos. Formatar antes é enfeitar uma conta que ainda vai mudar.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Mesclar apaga.</strong> Ao mesclar várias células,
só o conteúdo da primeira sobrevive — o das outras é descartado, e o programa
avisa antes. Desfazer a mesclagem devolve as células vazias: o que foi apagado
não volta.</p>
</div>
`;

export const modulo4: Module = {
  code: 'AP043.4',
  title: 'A planilha eletrônica',
  description: 'Endereço de célula, fórmula, intervalo, e o acabamento que vem depois: tamanho, alinhamento, mesclagem e layout.',
  lessons: [
    {
      code: 'AP043.4-L1',
      title: 'A conta que se refaz sozinha',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-5.6'],
      perguntas: 6,
      questions: [
        {
          id: 'AP043.4-L1-Q1', type: 'multiple_choice',
          prompt: 'Qual é o endereço da célula na coluna C, linha 4?',
          data: { options: [
            { id: 'a', text: 'C4', correct: true },
            { id: 'b', text: '4C, porque a linha é sempre lida antes da coluna.',
              porque: 'A letra vem primeiro em toda planilha: coluna, depois linha.' },
            { id: 'c', text: 'C:4, com dois pontos separando a coluna da linha.',
              porque: 'Dois pontos significam intervalo, e não separação. C:4 pediria outra coisa.' },
            { id: 'd', text: 'Depende de onde a tabela começa dentro da planilha.',
              porque: 'O endereço vem dos cabeçalhos da grade, e não de onde os dados começam.' },
          ]},
          explanation: 'Letra da coluna, número da linha, sem espaço nem sinal no meio.',
        },
        {
          id: 'AP043.4-L1-Q2', type: 'multiple_choice',
          prompt: 'Por que escrever =B3*C3 é melhor do que digitar o resultado da multiplicação?',
          data: { options: [
            { id: 'a', text: 'Porque o resultado se refaz sozinho quando B3 ou C3 mudam.', correct: true },
            { id: 'b', text: 'Porque a fórmula ocupa menos espaço no arquivo do que um número.',
              porque: 'A diferença de tamanho é irrelevante, e não é por isso que se usa fórmula.' },
            { id: 'c', text: 'Porque números digitados não podem ser somados por outras fórmulas depois.',
              porque: 'Podem: a soma alcança qualquer célula com número, digitado ou calculado.' },
            { id: 'd', text: 'Porque a fórmula deixa o número alinhado à direita automaticamente.',
              porque: 'Todo número já sai alinhado à direita, digitado ou não. O ganho é outro.' },
          ]},
          explanation: 'Número digitado envelhece calado. É a pior espécie de erro: continua parecendo certo.',
        },
        {
          id: 'AP043.4-L1-Q3', type: 'multiple_choice',
          prompt: 'O que =SOMA(B3:B7) faz?',
          data: { options: [
            { id: 'a', text: 'Soma tudo o que houver de B3 até B7.', correct: true },
            { id: 'b', text: 'Soma apenas as duas células citadas, B3 e B7.',
              porque: 'Dois pontos querem dizer "até". Para somar só duas, escreve-se =B3+B7.' },
            { id: 'c', text: 'Soma B3 e B7 e divide o resultado pelo número de linhas do meio.',
              porque: 'Isso não é soma nem média. SOMA só soma o que está no intervalo.' },
            { id: 'd', text: 'Soma a coluna B inteira, ignorando os números escritos ao lado.',
              porque: 'O intervalo limita: só entra o que está entre as linhas 3 e 7.' },
          ]},
          explanation: 'B3:B7 é o intervalo. Sem ele, seria preciso escrever célula por célula.',
        },
        {
          id: 'AP043.4-L1-Q4', type: 'true_false',
          prompt: 'Numa média, as células vazias do intervalo são ignoradas e ficam de fora da conta.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro. Se virassem zero, a média cairia sem ninguém entender por quê.' },
          ]},
          explanation: 'Célula vazia e célula com texto ficam de fora da conta. Zero digitado, esse sim, entra.',
        },
        {
          id: 'AP043.4-L1-Q5', type: 'fill_blank',
          prompt: 'Complete: toda fórmula começa com o sinal ___, e a função que soma e divide pela quantidade chama-se ___.',
          data: { blanks: [
            { id: 'b1', answer: '=', hint: 'É um sinal só, e ele vem antes de tudo.', aceitas: ['igual', 'sinal de igual'] },
            { id: 'b2', answer: 'MÉDIA', hint: 'A outra função da lição soma e não divide.', aceitas: ['média', 'MEDIA', 'media'] },
          ]},
          explanation: 'O sinal de igual é o que separa conta de texto. Sem ele, =SOMA vira só uma palavra escrita.',
        },
        {
          id: 'AP043.4-L1-Q6', type: 'multiple_choice',
          prompt: 'Você mesclou quatro células que tinham texto em todas. O que acontece com o conteúdo?',
          data: { options: [
            { id: 'a', text: 'Só o da primeira sobrevive; o das outras é apagado.', correct: true },
            { id: 'b', text: 'Os quatro textos são juntados um depois do outro na célula mesclada.',
              porque: 'A planilha não junta textos ao mesclar. Ela mantém um e descarta o resto.' },
            { id: 'c', text: 'Nada se perde: os textos ficam guardados e voltam ao desfazer a mesclagem.',
              porque: 'Desfazer devolve as células, e elas voltam vazias. O que foi apagado não volta.' },
            { id: 'd', text: 'A mesclagem é recusada enquanto houver texto em mais de uma célula.',
              porque: 'Ela acontece: o programa avisa antes, e quem confirma perde o conteúdo.' },
          ]},
          explanation: 'O aviso que aparece antes não é formalidade — é a única chance de voltar atrás.',
        },
        {
          id: 'AP043.4-L1-Q7', type: 'multiple_choice',
          prompt: 'A planilha do acampamento mostra 1620 no total de uma unidade. Um desbravador desiste e os inscritos caem de 12 para 11, mas o total continua 1620. O que isso revela?',
          data: { options: [
            { id: 'a', text: 'Que aquele total foi digitado à mão, e não é uma fórmula.', correct: true },
            { id: 'b', text: 'Que a fórmula precisa ser atualizada apertando um botão de recalcular.',
              porque: 'Fórmula não espera botão: ela se refaz assim que a célula de origem muda. Se não mudou, não é fórmula.' },
            { id: 'c', text: 'Que a célula do total está mesclada, e mesclagem congela o valor.',
              porque: 'Mesclar muda a aparência da célula, e não o cálculo do que está dentro dela.' },
            { id: 'd', text: 'Que o número de inscritos foi escrito como texto, e por isso não entra na conta.',
              porque: 'Se fosse esse o caso, o total teria mudado para menos ao perder um valor — e não teria ficado parado.' },
          ]},
          explanation: 'Na tela os dois mostram 1620. A diferença só aparece quando algo muda — e é aí que o número digitado mente calado.',
        },
        {
          id: 'AP043.4-L1-Q8', type: 'multiple_choice',
          prompt: 'Numa coluna de sete células há cinco números, uma vazia e uma com a palavra "faltou". O que =MÉDIA daquele intervalo faz?',
          data: { options: [
            { id: 'a', text: 'Soma os cinco números e divide por cinco, ignorando as outras duas.', correct: true },
            { id: 'b', text: 'Soma os cinco números e divide por sete, contando as duas como zero.',
              porque: 'Se virassem zero, a média despencaria e ninguém entenderia por quê. Por isso elas ficam de fora.' },
            { id: 'c', text: 'Devolve erro, porque não se calcula média de um intervalo com texto dentro.',
              porque: 'Ela não reclama: simplesmente não conta o que não é número.' },
            { id: 'd', text: 'Ignora a célula vazia mas conta a palavra como zero, porque foi escrita.',
              porque: 'As duas recebem o mesmo tratamento: o que não é número não entra na conta.' },
          ]},
          explanation: 'Célula vazia e célula com texto não viram zero — elas ficam de fora, e a média divide pelo que existe.',
        },
        {
          id: 'AP043.4-L1-Q9', type: 'true_false',
          prompt: 'Vale a pena mesclar o título e pôr as bordas antes de conferir se os números da planilha estão certos.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro',
              porque: 'Aparência é acabamento, e vem depois: formatar antes é enfeitar uma conta que ainda vai mudar — e mesclar cedo ainda apaga conteúdo das células vizinhas.' },
          ]},
          explanation: 'Primeiro os números certos, depois a aparência. Mesclar apaga o que estava nas outras células.',
        },
      ],
    },
    {
      code: 'AP043.4-L2',
      title: 'Montando o orçamento do acampamento',
      type: 'lab',
      content: '',
      requirementCodes: ['AP043-5.1', 'AP043-5.2', 'AP043-5.3', 'AP043-5.4', 'AP043-5.5', 'AP043-5.6'],
      labType: 'planilha',
    },
  ],
};
