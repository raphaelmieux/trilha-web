import type { Module } from '../../types';

/*
 * AP041 módulo 2 — as sete definições do requisito 2.
 *
 * Cada módulo da AP041 mora no seu arquivo. A AP034 guarda tudo num só, com mil
 * e duzentas linhas, e achar uma questão lá dentro custa caro; com cinco módulos
 * de conteúdo pela frente, separar sai mais barato desde o começo.
 *
 * Linguagem para dez anos: frase curta, comparação com coisa que a criança já
 * conhece, e nada de termo técnico sem explicação ao lado.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Hardware e Software</h2>
<p class="mb-3">Todo computador tem duas partes que trabalham juntas. Uma você
consegue pegar com a mão. A outra, não.</p>

<h3 class="font-bold mt-4 mb-2">Hardware: o que dá para tocar</h3>
<p class="mb-3"><strong>Hardware</strong> é tudo que é físico no computador. O
teclado, o mouse, a tela, os cabos, as peças de dentro. Se você pode segurar,
derrubar ou empoeirar, é hardware.</p>
<p class="mb-3">A palavra vem do inglês: <em>hard</em> quer dizer duro. Coisa dura,
de verdade, que ocupa lugar.</p>

<h3 class="font-bold mt-4 mb-2">Software: as instruções</h3>
<p class="mb-3"><strong>Software</strong> são os programas — as instruções que
dizem ao hardware o que fazer. O jogo, o navegador, o aplicativo de mensagens.
Você vê na tela, mas não consegue pegar.</p>
<p class="mb-3"><em>Soft</em> quer dizer mole. É a parte que muda fácil: dá para
instalar, apagar e atualizar sem trocar peça nenhuma.</p>

<h3 class="font-bold mt-4 mb-2">Um precisa do outro</h3>
<p class="mb-3">Computador sem software é como um violão que ninguém toca: está
tudo lá, mas não sai música. E software sem hardware não tem onde funcionar — é
uma receita sem cozinha.</p>
<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>Para nunca mais esquecer:</strong> se cair no seu pé e doer, é
  hardware. Se você só apaga e instala de novo, é software.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Sistema operacional e drivers</h2>
<p class="mb-3">Você liga o computador e ele já sabe mostrar a tela, ouvir o
teclado e abrir seus arquivos. Quem organiza tudo isso tem nome.</p>

<h3 class="font-bold mt-4 mb-2">Sistema operacional: quem manda na casa</h3>
<p class="mb-3">O <strong>sistema operacional</strong> é o programa principal do
computador. Ele começa a funcionar assim que a máquina liga e cuida de tudo:
divide a memória entre os programas, guarda os arquivos em pastas, e faz o
teclado, a tela e a impressora conversarem com quem precisa delas.</p>
<p class="mb-3">Windows, Linux, macOS e Android são sistemas operacionais. O seu
celular também tem um.</p>
<p class="mb-3">Pense num maestro de orquestra: ele não toca nenhum instrumento,
mas sem ele cada músico começaria na hora que quisesse.</p>

<h3 class="font-bold mt-4 mb-2">Driver: o tradutor de cada peça</h3>
<p class="mb-3">Existem milhares de modelos de impressora, e cada um funciona de
um jeito. O sistema operacional não pode conhecer todos. Então cada peça traz
junto um <strong>driver</strong>: um programinha que ensina o sistema a conversar
com aquele modelo.</p>
<p class="mb-3">É o tradutor entre os dois. Sem o driver certo, você espeta a
impressora e o computador vê que tem algo ali — mas não sabe pedir para imprimir.</p>
<div class="p-3 rounded-lg mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p><strong>A diferença:</strong> o sistema operacional é um só e cuida da
  máquina inteira. Driver é um para cada peça, e só entende daquela peça.</p>
</div>
`;

const conteudo_L3 = `
<h2 class="text-xl font-bold mb-3">Onde as coisas ficam guardadas</h2>
<p class="mb-3">O computador guarda informação em lugares diferentes, e cada um
serve para uma coisa. Confundir os três é o erro mais comum de quem está
começando.</p>

<h3 class="font-bold mt-4 mb-2">HD e SSD: o armário</h3>
<p class="mb-3">O <strong>disco rígido (HD)</strong> e o <strong>SSD</strong>
guardam seus arquivos — fotos, trabalhos, jogos, o próprio sistema operacional.
O que está ali continua ali com a máquina desligada, igual a roupa dentro do
armário.</p>
<p class="mb-3">A diferença entre os dois: o HD tem discos que giram lá dentro,
como um toca-discos, e por isso é mais lento e se estraga se cair. O SSD não tem
peça que se mexe — é mais rápido, mais silencioso e aguenta melhor tranco. Por
isso os computadores novos vêm com SSD.</p>

<h3 class="font-bold mt-4 mb-2">Memória RAM: a mesa de trabalho</h3>
<p class="mb-3">A <strong>memória RAM</strong> é onde fica o que está sendo usado
agora. Ao abrir um jogo, ele sai do armário e vai para a mesa, porque na mesa
tudo fica à mão e o computador trabalha muito mais rápido.</p>
<p class="mb-3">Só que a mesa esvazia quando a luz apaga: <strong>tudo o que
estava na RAM some ao desligar</strong>. É por isso que salvar antes de desligar
importa tanto — salvar é justamente guardar da mesa para o armário.</p>
<p class="mb-3">Mais RAM significa mesa maior: dá para deixar mais coisas abertas
ao mesmo tempo sem o computador travar.</p>

<h3 class="font-bold mt-4 mb-2">Memória ROM: o bilhete colado</h3>
<p class="mb-3">A <strong>memória ROM</strong> guarda as instruções que o
computador lê no instante em que liga, antes mesmo do sistema operacional
começar. Ela vem gravada de fábrica e não se apaga quando a energia acaba.</p>
<p class="mb-3">ROM quer dizer memória <em>somente de leitura</em>: dá para ler,
mas não para escrever por cima no dia a dia. É o bilhete colado na porta com o
passo a passo de como acordar.</p>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Onde</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Guarda o quê</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Ao desligar</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">HD ou SSD</td><td class="py-2">Seus arquivos e programas</td><td class="py-2">Continua tudo lá</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">RAM</td><td class="py-2">O que está aberto agora</td><td class="py-2">Some</td>
  </tr>
  <tr>
    <td class="py-2">ROM</td><td class="py-2">Como ligar a máquina</td><td class="py-2">Continua lá</td>
  </tr>
</table>
`;

export const modulo2: Module = {
  code: 'AP041.2',
  title: 'O que está por dentro',
  description: 'Hardware, software, sistema operacional, drivers e os tipos de memória.',
  lessons: [
    {
      code: 'AP041.2-L1',
      title: 'Hardware e Software',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP041-2.1', 'AP041-2.2'],
      questions: [
        {
          id: 'AP041.2-L1-Q1', type: 'multiple_choice',
          prompt: 'O que é hardware?',
          data: { options: [
            { id: 'a', text: 'Tudo que é físico no computador: as peças que dá para pegar com a mão.', correct: true },
            { id: 'b', text: 'Os programas instalados na máquina, como o navegador e os jogos que aparecem na tela.',
              porque: 'Isso é software. Hardware é a parte que ocupa lugar no mundo — teclado, tela, cabos.' },
            { id: 'c', text: 'A parte do computador mais difícil de aprender a usar.',
              porque: '"Hard" aqui quer dizer duro, no sentido de físico. Não tem relação com ser difícil.' },
            { id: 'd', text: 'A memória que guarda os arquivos quando a máquina está desligada.',
              porque: 'Isso é o HD ou o SSD, que são apenas uma peça. Hardware é o conjunto de todas elas.' },
          ]},
          explanation: 'Hardware é a parte física. Se cai no pé e dói, é hardware.',
        },
        {
          id: 'AP041.2-L1-Q2', type: 'multiple_choice',
          prompt: 'O que é software?',
          data: { options: [
            { id: 'a', text: 'As peças de dentro do gabinete, que ficam escondidas atrás da tampa.',
              porque: 'Escondida ou à vista, peça é hardware. Software não tem peça nenhuma.' },
            { id: 'b', text: 'Os programas: as instruções que dizem ao computador o que fazer.', correct: true },
            { id: 'c', text: 'Os arquivos que você cria, como fotos, trabalhos da escola e músicas baixadas.',
              porque: 'Arquivo é o que o programa cria ou abre. Software é o programa em si.' },
            { id: 'd', text: 'A parte macia do computador, feita de borracha para não machucar.',
              porque: '"Soft" quer dizer mole no sentido de fácil de mudar: instala, apaga, atualiza — sem trocar peça.' },
          ]},
          explanation: 'Software são as instruções. Você vê o resultado na tela, mas não consegue pegar.',
        },
        {
          id: 'AP041.2-L1-Q3', type: 'true_false',
          prompt: 'Um computador com todas as peças, mas sem nenhum programa instalado, funciona normalmente.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'Sem programa nenhum a máquina liga e para: não há o que mostrar nem o que fazer. Falta quem dê as ordens.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Hardware sem software é violão que ninguém toca: está tudo lá e não sai música.',
        },
        {
          id: 'AP041.2-L1-Q4', type: 'scenario',
          prompt: 'Seu primo aponta para o mouse e diz: "isso aqui é software". Como você explica?',
          data: { scenarios: [
            { id: 'a', text: 'O mouse é hardware, porque é uma peça física; software é o programa que faz a setinha andar na tela.', correct: true },
            { id: 'b', text: 'Ele está certo, porque o mouse precisa de um programa para funcionar e por isso conta como software.',
              porque: 'Quase toda peça precisa de programa, e isso não a transforma em programa. O mouse continua sendo objeto.' },
            { id: 'c', text: 'Os dois nomes servem para qualquer parte do computador, e cada pessoa escolhe o que prefere dizer.',
              porque: 'Não são intercambiáveis: um nomeia o que é físico e o outro o que é instrução.' },
            { id: 'd', text: 'Ele está certo, já que o mouse é pequeno e leve, e as coisas leves entram na categoria de software.',
              porque: 'Tamanho e peso não decidem nada. O que decide é existir como objeto ou como instrução.' },
          ]},
          explanation: 'Mouse é objeto: hardware. O programa que interpreta o movimento é software.',
        },
      ],
    },

    {
      code: 'AP041.2-L2',
      title: 'Sistema operacional e drivers',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP041-2.3', 'AP041-2.4'],
      questions: [
        {
          id: 'AP041.2-L2-Q1', type: 'multiple_choice',
          prompt: 'O que é um sistema operacional?',
          data: { options: [
            { id: 'a', text: 'Um programa antivírus que fica ligado o tempo todo protegendo a máquina de ameaças.',
              porque: 'Antivírus é um programa entre muitos, e roda dentro do sistema operacional — não é ele.' },
            { id: 'b', text: 'O programa principal, que organiza a memória, os arquivos e faz as peças conversarem com os programas.', correct: true },
            { id: 'c', text: 'O programa que abre páginas da internet e guarda os endereços favoritos de quem usa.',
              porque: 'Isso é o navegador. Ele é apenas um dos programas que o sistema operacional coloca para rodar.' },
            { id: 'd', text: 'A peça de dentro do computador que faz as contas e comanda todas as outras peças.',
              porque: 'Isso é a CPU, e ela é hardware. O sistema operacional é software: instruções, não peça.' },
          ]},
          explanation: 'Windows, Linux, macOS e Android são sistemas operacionais. Cada celular também tem o seu.',
        },
        {
          id: 'AP041.2-L2-Q2', type: 'multiple_choice',
          prompt: 'Para que serve um driver?',
          data: { options: [
            { id: 'a', text: 'Para ensinar o sistema operacional a conversar com um modelo específico de peça.', correct: true },
            { id: 'b', text: 'Para guardar os arquivos com segurança, criando uma cópia sempre que algo é salvo.',
              porque: 'Isso é backup, e é outra coisa. Driver não guarda arquivo nenhum.' },
            { id: 'c', text: 'Para deixar o computador mais rápido, liberando a memória que os programas não usam.',
              porque: 'Quem administra a memória é o sistema operacional. O driver só cuida da conversa com uma peça.' },
            { id: 'd', text: 'Para dirigir o computador de longe, permitindo usar a máquina de outro lugar da casa.',
              porque: 'Driver vem de "dirigir" no sentido de comandar uma peça, e não de acesso a distância.' },
          ]},
          explanation: 'Existem milhares de modelos de impressora. O driver é o tradutor entre o sistema e aquele modelo.',
        },
        {
          id: 'AP041.2-L2-Q3', type: 'scenario',
          prompt: 'Você espeta uma impressora nova no computador. Ele avisa que encontrou o aparelho, mas não consegue imprimir. O que está faltando?',
          data: { scenarios: [
            { id: 'a', text: 'O driver daquela impressora, que ensina o sistema a dar as ordens que aquele modelo entende.', correct: true },
            { id: 'b', text: 'Mais memória RAM, porque imprimir exige bastante espaço aberto para processar a página.',
              porque: 'Uma página não pesa quase nada. O computador reconheceu o aparelho e não sabe falar com ele.' },
            { id: 'c', text: 'Um sistema operacional diferente, já que nem todos conseguem trabalhar com impressoras.',
              porque: 'Todos os sistemas imprimem. O que muda de um modelo para outro é o driver.' },
            { id: 'd', text: 'Trocar o cabo por um mais novo, porque cabo velho transmite dados pela metade.',
              porque: 'Se fosse o cabo, o computador nem teria reconhecido a impressora. Ele viu o aparelho.' },
          ]},
          explanation: 'Reconhecer é uma coisa; saber pedir é outra. Quem ensina a pedir é o driver.',
        },
        {
          id: 'AP041.2-L2-Q4', type: 'true_false',
          prompt: 'Um mesmo driver serve para qualquer impressora, de qualquer marca.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'Cada modelo funciona de um jeito. O driver é feito para aquele modelo, e é justamente por isso que ele existe.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'Sistema operacional é um só para a máquina inteira. Driver é um para cada peça.',
        },
      ],
    },

    {
      code: 'AP041.2-L3',
      title: 'HD, SSD, RAM e ROM',
      type: 'theory',
      content: conteudo_L3,
      requirementCodes: ['AP041-2.5', 'AP041-2.6', 'AP041-2.7'],
      questions: [
        {
          id: 'AP041.2-L3-Q1', type: 'multiple_choice',
          prompt: 'Para que servem o HD e o SSD?',
          data: { options: [
            { id: 'a', text: 'Para deixar aberto o que está sendo usado agora, e esvaziar assim que a máquina desliga.',
              porque: 'Isso é a RAM. HD e SSD guardam de verdade: o que está lá continua lá depois de desligar.' },
            { id: 'b', text: 'Para guardar seus arquivos e programas, inclusive com o computador desligado.', correct: true },
            { id: 'c', text: 'Para guardar as instruções de fábrica que o computador lê no instante em que é ligado.',
              porque: 'Isso é a ROM. Ela é pequena e traz só o necessário para acordar a máquina.' },
            { id: 'd', text: 'Para fazer as contas e decidir o que cada programa deve executar em seguida.',
              porque: 'Isso é a CPU. HD e SSD não calculam nada: eles guardam.' },
          ]},
          explanation: 'HD e SSD são o armário: o que se guarda ali continua ali.',
        },
        {
          id: 'AP041.2-L3-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre HD e SSD?',
          data: { options: [
            { id: 'a', text: 'O HD tem discos que giram por dentro, e o SSD não tem peça que se mexa — por isso é mais rápido.', correct: true },
            { id: 'b', text: 'O HD guarda arquivos e o SSD guarda apenas programas, por causa do jeito como cada um grava.',
              porque: 'Os dois guardam qualquer coisa. A diferença está em como gravam, não no que aceitam.' },
            { id: 'c', text: 'O SSD perde tudo quando o computador desliga, e o HD é o único que mantém os arquivos.',
              porque: 'Os dois mantêm. Quem perde tudo ao desligar é a RAM.' },
            { id: 'd', text: 'O HD é mais novo e veio para substituir o SSD nos computadores lançados recentemente.',
              porque: 'É o contrário: o HD é mais antigo, e os computadores novos vêm com SSD.' },
          ]},
          explanation: 'Sem peça girando, o SSD é mais rápido, mais silencioso e aguenta melhor um tranco.',
        },
        {
          id: 'AP041.2-L3-Q3', type: 'multiple_choice',
          prompt: 'O que a memória RAM faz?',
          data: { options: [
            { id: 'a', text: 'Guarda para sempre tudo o que você salva, mesmo depois de a máquina ser desligada.',
              porque: 'Ao contrário: a RAM esvazia quando a energia acaba. Quem guarda para depois é o HD ou o SSD.' },
            { id: 'b', text: 'Mantém à mão o que está aberto agora, para o computador trabalhar mais rápido.', correct: true },
            { id: 'c', text: 'Guarda as instruções que a máquina lê ao ligar, gravadas de fábrica e sem poder mudar.',
              porque: 'Isso é a ROM. A RAM é o oposto: muda o tempo todo enquanto o computador está ligado.' },
            { id: 'd', text: 'Liga o computador à internet e distribui a conexão para os outros aparelhos da casa.',
              porque: 'Isso é o roteador. RAM é memória, e não tem relação com rede.' },
          ]},
          explanation: 'A RAM é a mesa de trabalho: tudo à mão, e vazia quando a luz apaga.',
        },
        {
          id: 'AP041.2-L3-Q4', type: 'true_false',
          prompt: 'O que está na memória RAM continua lá depois de desligar o computador.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro',
              porque: 'A RAM só se mantém com energia. Por isso salvar antes de desligar importa: salvar é passar da mesa para o armário.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É exatamente por isso que um trabalho não salvo se perde quando falta luz.',
        },
        {
          id: 'AP041.2-L3-Q5', type: 'multiple_choice',
          prompt: 'O que a memória ROM guarda?',
          data: { options: [
            { id: 'a', text: 'Os arquivos e as fotos da pessoa, organizados nas pastas que ela mesma criou.',
              porque: 'Isso vai para o HD ou o SSD. A ROM é pequena e não guarda arquivo de usuário.' },
            { id: 'b', text: 'As instruções gravadas de fábrica que o computador lê assim que é ligado.', correct: true },
            { id: 'c', text: 'O que está aberto no momento, para poder ser trocado a qualquer instante pelo sistema.',
              porque: 'Isso é a RAM. ROM quer dizer memória somente de leitura: não se escreve por cima no dia a dia.' },
            { id: 'd', text: 'As páginas visitadas na internet, para que abram mais rápido na próxima visita.',
              porque: 'Isso é o cache do navegador, guardado no disco. A ROM nada tem a ver com internet.' },
          ]},
          explanation: 'ROM é o bilhete colado na porta com o passo a passo de como acordar.',
        },
        {
          id: 'AP041.2-L3-Q6', type: 'matching',
          prompt: 'Ligue cada memória ao que ela faz.',
          data: { pairs: [
            { left: 'HD ou SSD', right: 'Guarda seus arquivos, mesmo desligado' },
            { left: 'RAM', right: 'Segura o que está aberto agora, e esvazia ao desligar' },
            { left: 'ROM', right: 'Traz de fábrica as instruções para ligar a máquina' },
          ]},
          explanation: 'Armário, mesa de trabalho e bilhete colado na porta.',
        },
      ],
    },
  ],
};
