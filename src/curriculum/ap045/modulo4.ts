import type { Module } from '../../types';

/*
 * AP045 módulo 4 — o requisito 5: explicar, com 1 e 0, como a informação
 * circula entre periféricos e a CPU, e montar um diagrama.
 *
 * É um requisito "apresentar ao examinador" sem dizer essas palavras: entender
 * a ideia é o que a plataforma consegue medir; montar o diagrama de verdade é
 * o que se demonstra fora daqui, com papel e lápis ou um programa de desenho.
 * A lição dá o vocabulário e o roteiro para esse diagrama — a mesma forma da
 * AP041.4, que ensinava o que apresentar ao examinador sem substituir a
 * apresentação.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Tudo dentro do computador é 1 e 0</h2>
<p class="mb-3">Você já sabe, de Computação 4, que a menor informação que um
computador guarda é o <strong>bit</strong> — vale 0 ou 1, ligado ou desligado.
Esta lição é sobre outra coisa: como essa sequência de 1 e 0
<strong>viaja</strong> entre as peças do computador para virar uma letra na
tela ou um som no alto-falante.</p>

<h3 class="font-bold mt-4 mb-2">Por que binário, e não outra base</h3>
<p class="mb-3">Um circuito eletrônico distingue com facilidade dois estados —
tem corrente passando, ou não tem. Ele teria muito mais dificuldade em
distinguir de forma confiável dez níveis diferentes de voltagem, por exemplo.
Por isso o computador representa tudo em <strong>binário</strong> (base 2):
cada 1 é "tem corrente", cada 0 é "não tem". Uma letra, um número, uma cor de
pixel — tudo vira, no fundo, uma sequência de 1 e 0.</p>

<h3 class="font-bold mt-4 mb-2">O caminho de um toque de tecla</h3>
<p class="mb-3">Pense no que acontece quando você aperta a tecla "A" no
teclado:</p>
<ol class="list-decimal pl-5 mb-3 space-y-1">
<li>O <strong>teclado</strong> (um periférico de entrada) detecta a tecla
apertada e converte esse toque num código binário — uma sequência específica
de 1 e 0 que representa "A".</li>
<li>Esse código viaja por um <strong>cabo ou sinal sem fio</strong> até a
<strong>CPU</strong> (o processador), que é quem interpreta o código e decide
o que fazer com ele — nesse caso, mandar desenhar a letra "A" na tela.</li>
<li>A CPU manda essa instrução, também em binário, para a
<strong>memória RAM</strong>, que guarda a informação enquanto ela está sendo
usada, e para a <strong>placa de vídeo</strong>, que sabe transformar o código
em pixels acesos.</li>
<li>O <strong>monitor</strong> (um periférico de saída) recebe o sinal da
placa de vídeo e acende os pixels certos para você ver a letra "A" na
tela.</li>
</ol>
<p class="mb-3">Entrada → processamento → saída: é o mesmo ciclo de sempre, só
que agora você sabe o que trafega entre as peças — código binário, o tempo
todo.</p>

<h3 class="font-bold mt-4 mb-2">Como montar o diagrama</h3>
<p class="mb-3">Um diagrama que mostra esse caminho tem, no mínimo, estas
peças: um periférico de <strong>entrada</strong> (teclado, mouse ou scanner),
uma seta com "01000001" (ou outro código binário de exemplo) indo até a
<strong>CPU</strong>, a CPU ligada à <strong>memória RAM</strong>, e uma seta
saindo até um periférico de <strong>saída</strong> (monitor, impressora ou
caixa de som). Desenhe as setas na direção em que a informação viaja, e escreva
ao lado de cada seta que tipo de informação está passando ali — um código
binário representando a tecla, e depois um código binário representando o
pixel a acender.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A ideia central para o diagrama:</strong> entrada
vira código binário → CPU processa o código → saída transforma o resultado de
volta em algo que a pessoa percebe (letra, som, imagem).</p>
</div>
`;

export const modulo4: Module = {
  code: 'AP045.4',
  title: 'Como a informação circula, em 1 e 0',
  description: 'O caminho binário entre um periférico e a CPU — e o diagrama que mostra esse caminho.',
  lessons: [
    {
      code: 'AP045.4-L1',
      title: 'Do teclado à tela, em código binário',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-5.1'],
      questions: [
        {
          id: 'AP045.4-L1-Q1', type: 'multiple_choice',
          prompt: 'Por que o computador representa tudo em código binário (1 e 0), e não em uma base com mais números?',
          data: { options: [
            { id: 'a', text: 'Porque um circuito eletrônico distingue com facilidade só dois estados: tem corrente, ou não tem.', correct: true },
            { id: 'b', text: 'Porque o binário ocupa menos espaço em disco do que qualquer outra forma de contar.',
              porque: 'O motivo não é o espaço em disco: é que o circuito eletrônico distingue dois estados com confiabilidade.' },
            { id: 'c', text: 'Porque os primeiros computadores do mundo foram construídos bem antes de existir o sistema decimal de contagem.',
              porque: 'O sistema decimal é muito mais antigo que qualquer computador. A escolha do binário é sobre o circuito, não sobre a história da matemática.' },
            { id: 'd', text: 'Porque o teclado só consegue enviar duas teclas de cada vez para o processador.',
              porque: 'Não é sobre quantas teclas o teclado envia: é sobre como o circuito elétrico representa informação de forma confiável.' },
          ]},
          explanation: 'Distinguir "tem corrente" de "não tem corrente" é muito mais confiável do que distinguir dez níveis diferentes de voltagem.',
        },
        {
          id: 'AP045.4-L1-Q2', type: 'multiple_choice',
          prompt: 'Ao apertar a tecla "A", o que o teclado faz primeiro?',
          data: { options: [
            { id: 'a', text: 'Converte o toque da tecla num código binário e envia esse código até a CPU.', correct: true },
            { id: 'b', text: 'Desenha diretamente a letra "A" na tela, sem passar pela CPU.',
              porque: 'Desenhar na tela é trabalho da placa de vídeo e do monitor, depois que a CPU processa o código.' },
            { id: 'c', text: 'Guarda a letra "A" na memória RAM antes de a CPU saber que a tecla foi apertada.',
              porque: 'A ordem é ao contrário: o código vai primeiro até a CPU, que então decide o que mandar guardar.' },
            { id: 'd', text: 'Envia um som para a caixa de som avisando que uma tecla foi apertada.',
              porque: 'O teclado não se comunica com a caixa de som — ele envia o código da tecla para a CPU processar.' },
            ]},
          explanation: 'O teclado é um periférico de entrada: sua tarefa é converter o toque físico num código que a CPU entenda.',
        },
        {
          id: 'AP045.4-L1-Q3', type: 'multiple_choice',
          prompt: 'No caminho do teclado até a tela, qual é o papel da CPU?',
          data: { options: [
            { id: 'a', text: 'Interpretar o código binário recebido e decidir o que fazer com ele, como mandar desenhar uma letra.', correct: true },
            { id: 'b', text: 'Acender fisicamente os pixels do monitor para formar a letra.',
              porque: 'Acender os pixels é o trabalho da placa de vídeo e do monitor, depois que a CPU já processou a instrução.' },
            { id: 'c', text: 'Detectar qual tecla física foi apertada no teclado.',
              porque: 'Detectar a tecla apertada é trabalho do próprio teclado, que já envia o código pronto para a CPU.' },
            { id: 'd', text: 'Guardar permanentemente a letra digitada no disco, mesmo depois de o computador ser desligado por completo.',
              porque: 'Guardar permanentemente é trabalho do disco (HD ou SSD). A CPU processa; ela não é onde os dados ficam guardados.' },
          ]},
          explanation: 'A CPU é quem interpreta o código binário que chega e decide a próxima instrução — inclusive mandar desenhar algo na tela.',
        },
        {
          id: 'AP045.4-L1-Q4', type: 'ordering',
          prompt: 'Ordene os passos do caminho de uma tecla apertada até a letra aparecer na tela.',
          data: { items: [
            { id: 'a', text: 'O teclado converte o toque da tecla num código binário', order: 1 },
            { id: 'b', text: 'O código viaja até a CPU, que o interpreta', order: 2 },
            { id: 'c', text: 'A CPU manda a instrução para a placa de vídeo', order: 3 },
            { id: 'd', text: 'O monitor acende os pixels certos para mostrar a letra', order: 4 },
          ]},
          explanation: 'É o ciclo de entrada, processamento e saída — com código binário passando por cada etapa.',
        },
        {
          id: 'AP045.4-L1-Q5', type: 'multiple_choice',
          prompt: 'Um diagrama do caminho da informação, para este requisito, precisa mostrar pelo menos que peças?',
          data: { options: [
            { id: 'a', text: 'Um periférico de entrada, a CPU, a memória RAM e um periférico de saída, ligados por setas com código binário.', correct: true },
            { id: 'b', text: 'Só o teclado e o monitor, sem nenhuma peça entre os dois.',
              porque: 'Sem a CPU e a memória no meio, o diagrama esconde justamente o processamento que a lição explica.' },
            { id: 'c', text: 'Só a CPU sozinha, porque é ela quem faz todo o trabalho.',
              porque: 'A CPU processa, mas sem entrada nem saída o diagrama não mostra caminho nenhum — só uma peça isolada.' },
            { id: 'd', text: 'A impressora, o scanner e o disco rígido, sozinhos, sem nenhuma seta indicando entrada nem saída de dados.',
              porque: 'Essas três peças por si só não formam um caminho de entrada até saída, que é o que o diagrama precisa mostrar.' },
          ]},
          explanation: 'Entrada, processamento e saída — e as setas entre eles marcadas com o código binário que viaja ali.',
        },
        {
          id: 'AP045.4-L1-Q6', type: 'true_false',
          prompt: 'No exemplo do teclado, o mesmo tipo de informação — código binário — trafega em toda etapa do caminho, do teclado até o monitor.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: da tecla apertada até o pixel aceso, tudo o que viaja entre as peças é código binário — só o que ele representa muda.' },
          ]},
          explanation: 'O que muda de etapa a etapa é o que o código representa (uma tecla, depois um pixel) — não a forma binária dele.',
        },
      ],
    },
  ],
};
