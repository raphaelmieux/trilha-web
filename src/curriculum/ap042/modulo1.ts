import type { Module } from '../../types';

/*
 * AP042 módulo 1 — os seis termos que o requisito 2 manda definir.
 *
 * Definir seis aparelhos parecidos é mais difícil do que parece: netbook e
 * notebook diferem por tamanho e potência, tablet e smartphone por tamanho e
 * pouco mais, e "microcomputador" é a palavra que quase ninguém usa para a
 * máquina que todo mundo conhece. Uma lição só, com os seis emendados, viraria
 * uma lista para decorar.
 *
 * Então a divisão é pela pergunta que separa de verdade: dá para levar no
 * caminho, ou fica parado? É essa a distinção que o desbravador já usa sem saber
 * o nome dela, e a partir dela as outras cabem.
 *
 * O servidor é o único que ele nunca viu, e por isso é o que mais precisa de um
 * exemplo do dia a dia: o vídeo que ele assiste sai de um, e é isso que faz a
 * palavra parar de ser abstrata.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Computador também é o que cabe na mochila</h2>
<p class="mb-3">Quando alguém diz "computador", quase todo mundo pensa numa
mesa com tela, teclado e uma caixa embaixo. Mas o celular no seu bolso é um
computador, e o tablet da sala também. O que muda entre eles é o
<strong>tamanho</strong>, a <strong>potência</strong> e o
<strong>que cada um foi feito para fazer</strong>.</p>

<h3 class="font-bold mt-4 mb-2">Notebook: o computador que fecha</h3>
<p class="mb-3">O <strong>notebook</strong> é um computador completo que fecha
como um caderno — daí o nome. Tela, teclado, bateria e todas as peças vêm numa
peça só, e ele faz tudo o que um computador de mesa faz: escrever trabalho,
editar vídeo, jogar.</p>
<p class="mb-3">A troca é o preço e o calor: encaixar tudo naquele espaço custa
mais caro e esquenta mais do que a mesma potência espalhada numa caixa grande.</p>

<h3 class="font-bold mt-4 mb-2">Netbook: o irmão menor e mais fraco</h3>
<p class="mb-3">O <strong>netbook</strong> parece um notebook pequeno, e é
quase isso: tela de umas 10 ou 11 polegadas, leve, bateria que dura bastante e
preço baixo. A diferença que importa não é o tamanho — é a
<strong>potência</strong>.</p>
<p class="mb-3">Ele foi feito para tarefas leves: navegar, escrever, assistir
aula. Pedir edição de vídeo a um netbook é pedir o que ele não tem. O nome vem
de "net", rede: nasceu para ficar na internet, e pouco mais.</p>

<h3 class="font-bold mt-4 mb-2">Tablet: a tela que você toca</h3>
<p class="mb-3">O <strong>tablet</strong> é uma tela sensível ao toque, sem
teclado preso a ela. Você mexe com o dedo, e o teclado, quando precisa, aparece
na própria tela ou se conecta por fora.</p>
<p class="mb-3">É ótimo para ler, desenhar, assistir e usar aplicativos. Para
escrever muito, ele perde para qualquer teclado de verdade — e é por isso que
ele não substituiu o notebook na hora do trabalho escolar.</p>

<h3 class="font-bold mt-4 mb-2">Smartphone: o computador que também é telefone</h3>
<p class="mb-3">O <strong>smartphone</strong> é um telefone celular que virou
computador. Ele faz ligação, mas isso hoje é a menor parte: ele tira foto, abre
site, roda aplicativo, mostra mapa e guarda seus arquivos.</p>
<p class="mb-3">A diferença para o tablet é quase só o tamanho e o chip de
telefone. Um smartphone cabe na mão e vai a todo lugar; é o computador mais
usado do mundo, e provavelmente o primeiro que você usou na vida.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>O jeito de não confundir:</strong> notebook e netbook têm teclado
  preso e fecham; a diferença entre os dois é a potência. Tablet e smartphone
  são tela de tocar; a diferença entre os dois é o tamanho e o chip de
  telefone.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Os que ficam parados, e por que isso é uma vantagem</h2>
<p class="mb-3">Nem todo computador precisa andar. E quando ele não precisa,
ganha coisas que nenhum aparelho de bolso consegue ter: espaço para peças
grandes, ar circulando e energia à vontade.</p>

<h3 class="font-bold mt-4 mb-2">Microcomputador: o computador de mesa</h3>
<p class="mb-3">O <strong>microcomputador</strong> é o computador pessoal de
mesa — aquele com gabinete, monitor, teclado e mouse separados. É o nome
técnico do que a maioria chama de "PC" ou "computador de mesa".</p>
<p class="mb-3">O "micro" não quer dizer minúsculo: quer dizer que ele é
pequeno <em>comparado aos computadores que vieram antes</em>, os que ocupavam
salas inteiras. Quando ele apareceu, um computador que cabia numa escrivaninha
era espantosamente pequeno.</p>
<p class="mb-3">Por ficar parado, ele é o mais fácil de consertar e de
melhorar: dá para abrir, trocar uma peça e fechar. Num notebook, quase tudo
vem colado ou soldado.</p>

<h3 class="font-bold mt-4 mb-2">Servidor: o computador que atende os outros</h3>
<p class="mb-3">O <strong>servidor</strong> é um computador que fica ligado
para <strong>servir</strong> outros computadores. Ele não tem alguém sentado na
frente dele: fica num prédio próprio, num armário com muitos iguais, esperando
pedidos e respondendo.</p>
<p class="mb-3">Você usa servidores o dia inteiro sem ver nenhum. Quando você
abre um vídeo, algum servidor manda aquele vídeo para a sua tela. Quando você
manda uma mensagem, um servidor a guarda até a outra pessoa abrir o
aplicativo. Quando você entra nesta trilha, um servidor devolve o seu
progresso.</p>
<p class="mb-3">O que ele tem de diferente não é ser mais bonito, é ser
<strong>confiável</strong>: fica ligado o ano inteiro, tem peças repetidas para
o caso de uma falhar e costuma ter duas fontes de energia. Um servidor que
desliga derruba todo mundo que dependia dele.</p>

<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>A pergunta que separa os dois:</strong> para quem esta máquina
  trabalha? O microcomputador trabalha para a pessoa sentada nele. O servidor
  trabalha para outras máquinas, que pedem coisas a ele pela rede.</p>
</div>
`;

export const modulo1: Module = {
  code: 'AP042.1',
  title: 'Cada computador tem um corpo',
  description: 'Netbook, notebook, microcomputador, tablet, smartphone e servidor — e o que muda de um para o outro.',
  lessons: [
    {
      code: 'AP042.1-L1',
      title: 'Os computadores que você carrega',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP042-2.1', 'AP042-2.2', 'AP042-2.4', 'AP042-2.5'],
      questions: [
        {
          id: 'AP042.1-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é um notebook?',
          data: { options: [
            { id: 'a', text: 'Um computador completo que fecha como um caderno.', correct: true },
            { id: 'b', text: 'Um caderno digital que só serve para escrever anotações de aula.',
              porque: 'O nome vem do formato, não do uso. Ele roda os mesmos programas de um computador de mesa.' },
            { id: 'c', text: 'Uma tela de tocar com o teclado desenhado dentro dela.',
              porque: 'Isso é o tablet. O notebook tem teclado de verdade, preso à tela por uma dobradiça.' },
            { id: 'd', text: 'Um computador de mesa vendido com monitor, teclado e mouse na mesma caixa.',
              porque: 'Nesse caso as peças continuam separadas. No notebook elas são uma peça só, que fecha.' },
          ]},
          explanation: 'Tela, teclado, bateria e peças vêm numa peça só — e ela fecha, que é o que dá o nome.',
        },
        {
          id: 'AP042.1-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença que mais importa entre um netbook e um notebook?',
          data: { options: [
            { id: 'a', text: 'O netbook tem menos potência: foi feito para tarefas leves.', correct: true },
            { id: 'b', text: 'O netbook não se conecta à internet, e o notebook se conecta.',
              porque: 'É o contrário do nome dele: "net" é rede. Conectar-se é justamente o que ele nasceu para fazer.' },
            { id: 'c', text: 'O netbook é só a tela, e o teclado dele é vendido à parte pelo fabricante.',
              porque: 'Isso descreve um tablet com teclado. O netbook já vem com o teclado preso, como o notebook.' },
            { id: 'd', text: 'O netbook funciona sem bateria, ligado direto na tomada o tempo todo.',
              porque: 'A bateria dele costuma durar mais que a de um notebook, e não menos.' },
          ]},
          explanation: 'Os dois fecham e têm teclado. O que separa é a potência, e não o formato.',
        },
        {
          id: 'AP042.1-L1-Q3', type: 'multiple_choice',
          prompt: 'O que define um tablet?',
          data: { options: [
            { id: 'a', text: 'Uma tela sensível ao toque, sem teclado preso a ela.', correct: true },
            { id: 'b', text: 'Um computador de mesa de tela pequena, feito para caber em cozinha e quarto.',
              porque: 'Tablet não fica parado numa mesa: ele é feito para ser levado e usado na mão.' },
            { id: 'c', text: 'Um celular grande, que faz ligação e cabe no bolso de uma calça comum.',
              porque: 'O tablet não cabe no bolso, e a maioria deles não tem chip para fazer ligação.' },
            { id: 'd', text: 'Um leitor de livros que só abre texto, sem rodar aplicativo nenhum.',
              porque: 'Isso descreve um leitor de livros digitais. O tablet roda aplicativos como um computador.' },
          ]},
          explanation: 'O dedo é o mouse. Quando precisa de teclado, ele aparece na tela ou se conecta por fora.',
        },
        {
          id: 'AP042.1-L1-Q4', type: 'multiple_choice',
          prompt: 'Por que o smartphone é chamado de computador, e não só de telefone?',
          data: { options: [
            { id: 'a', text: 'Porque ele roda programas, abre sites e guarda arquivos.', correct: true },
            { id: 'b', text: 'Porque ele custa caro, e computador é tudo o que custa caro hoje em dia.',
              porque: 'Preço não define o que a máquina é. Um netbook barato é computador do mesmo jeito.' },
            { id: 'c', text: 'Porque ele tem tela colorida, e telefones antigos tinham tela pequena e sem cor.',
              porque: 'A tela mudou, mas o que faz dele computador é o que ele executa, não o que ele mostra.' },
            { id: 'd', text: 'Porque ele se conecta à internet, e só computadores conseguem fazer isso.',
              porque: 'Muita coisa se conecta à internet hoje — televisão, campainha, geladeira — sem ser computador.' },
          ]},
          explanation: 'Fazer ligação virou a menor parte do que ele faz. O resto é trabalho de computador.',
        },
        {
          id: 'AP042.1-L1-Q5', type: 'true_false',
          prompt: 'Um netbook é indicado para quem precisa editar vídeos pesados todos os dias.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Editar vídeo pede potência, que é exatamente o que o netbook não tem.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Netbook foi feito para tarefas leves. Para vídeo, ele trava — e a culpa não é de quem usa.',
        },
        {
          id: 'AP042.1-L1-Q6', type: 'matching',
          prompt: 'Ligue cada aparelho ao que o descreve melhor.',
          data: { pairs: [
            { left: 'Notebook', right: 'Fecha como caderno e faz tudo' },
            { left: 'Netbook', right: 'Pequeno, barato e para tarefas leves' },
            { left: 'Tablet', right: 'Tela de tocar, sem teclado preso' },
            { left: 'Smartphone', right: 'Cabe na mão e tem chip de telefone' },
          ]},
          explanation: 'Os quatro são computadores. O que muda é o tamanho, a potência e para que foram feitos.',
        },
      ],
    },
    {
      code: 'AP042.1-L2',
      title: 'Os que ficam parados no lugar',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP042-2.3', 'AP042-2.6'],
      questions: [
        {
          id: 'AP042.1-L2-Q1', type: 'multiple_choice',
          prompt: 'O que é um microcomputador?',
          data: { options: [
            { id: 'a', text: 'O computador pessoal de mesa, com gabinete, monitor, teclado e mouse.', correct: true },
            { id: 'b', text: 'Um computador em miniatura, do tamanho de uma caixa de fósforos.',
              porque: 'O "micro" compara com os computadores de sala inteira que vieram antes, e não com uma caixa de fósforos.' },
            { id: 'c', text: 'Qualquer computador com menos memória do que um celular moderno tem hoje.',
              porque: 'Não é medida de memória: é o formato de máquina, o computador pessoal de mesa.' },
            { id: 'd', text: 'A peça de dentro do computador que faz as contas, também chamada de processador.',
              porque: 'Isso é o microprocessador, uma peça. O microcomputador é a máquina inteira.' },
          ]},
          explanation: 'É o nome técnico do que quase todo mundo chama de PC ou computador de mesa.',
        },
        {
          id: 'AP042.1-L2-Q2', type: 'multiple_choice',
          prompt: 'O que faz de um computador um servidor?',
          data: { options: [
            { id: 'a', text: 'Ele fica ligado atendendo pedidos de outras máquinas pela rede.', correct: true },
            { id: 'b', text: 'Ele é o computador mais caro e mais rápido que a empresa conseguiu comprar.',
              porque: 'Servidor não se define por preço. O que importa é para quem ele trabalha.' },
            { id: 'c', text: 'Ele tem uma tela grande e um teclado especial para o técnico responsável.',
              porque: 'Servidor costuma nem ter tela: ninguém senta na frente dele para trabalhar.' },
            { id: 'd', text: 'Ele guarda uma cópia de segurança dos arquivos de quem trabalha ali perto.',
              porque: 'Guardar cópia é uma das tarefas que um servidor pode ter, mas não é o que o define.' },
          ]},
          explanation: 'A pergunta que resolve: para quem esta máquina trabalha? O servidor trabalha para outras máquinas.',
        },
        {
          id: 'AP042.1-L2-Q3', type: 'multiple_choice',
          prompt: 'Por que um servidor costuma ter peças repetidas e duas fontes de energia?',
          data: { options: [
            { id: 'a', text: 'Para continuar funcionando se uma delas falhar.', correct: true },
            { id: 'b', text: 'Para ficar mais rápido, já que duas fontes entregam o dobro de velocidade.',
              porque: 'Fonte entrega energia, não velocidade. A segunda existe para o caso de a primeira parar.' },
            { id: 'c', text: 'Para gastar menos energia elétrica no fim do mês, dividindo o consumo em duas.',
              porque: 'Duas fontes não gastam menos: a segunda fica de reserva, esperando precisar.' },
            { id: 'd', text: 'Porque o servidor é montado com peças de sobra que já estavam no armário.',
              porque: 'É o contrário: as peças repetidas são escolhidas de propósito, e custam caro.' },
          ]},
          explanation: 'Um servidor que desliga derruba todo mundo que dependia dele. Por isso ele é feito para não desligar.',
        },
        {
          id: 'AP042.1-L2-Q4', type: 'true_false',
          prompt: 'Toda vez que você assiste a um vídeo na internet, um servidor está enviando esse vídeo para a sua tela.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro. O vídeo está guardado em alguma máquina, e ela o entrega quando você pede.' },
          ]},
          explanation: 'Você usa servidores o dia inteiro sem ver nenhum. É esse o trabalho deles.',
        },
        {
          id: 'AP042.1-L2-Q5', type: 'scenario',
          prompt: 'A secretaria do clube vai comprar uma máquina para ficar na sala, guardando as fichas dos desbravadores e imprimindo relatórios. Ninguém vai levá-la para casa. O que faz mais sentido?',
          data: { scenarios: [
            { id: 'a', text: 'Um microcomputador de mesa.', correct: true },
            { id: 'b', text: 'Um netbook, porque é o mais barato de todos e cabe em qualquer canto da sala.',
              porque: 'Barato resolve hoje. Como a máquina não vai sair da sala, o de mesa dá mais potência pelo mesmo dinheiro.' },
            { id: 'c', text: 'Um tablet, porque a tela de tocar é mais fácil para quem tem pouca prática.',
              porque: 'Digitar relatório em tela de vidro cansa. Onde há mesa, o teclado de verdade ganha.' },
            { id: 'd', text: 'Um servidor, porque ele foi feito para guardar os dados de muita gente ao mesmo tempo.',
              porque: 'Servidor atende outras máquinas pela rede. Aqui há uma pessoa sentada, usando a máquina diretamente.' },
          ]},
          explanation: 'Máquina que não anda ganha em potência, preço e facilidade de consertar.',
        },
      ],
    },
  ],
};
