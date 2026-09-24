import type { Module } from '../../types';

/*
 * AP045 módulo 2 — os sete termos do requisito 3.
 *
 * O documento pede definir usuário, programador, analista de sistemas, help
 * desk, hacker, hiperlink e World Wide Web (W3). Sete definições soltas
 * decoram mal; aqui elas se agrupam em duas lições por parentesco: primeiro
 * quem trabalha em volta de um sistema (do usuário ao help desk), depois o que
 * é próprio da rede (hacker, hiperlink, WWW) — que é também onde mora a
 * armadilha mais comum do assunto: confundir hacker com criminoso.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Quem faz o quê, em volta de um sistema</h2>
<p class="mb-3">Todo sistema de computador reúne gente com papéis diferentes.
Confundir um papel com outro é um erro comum — e é o que estes quatro termos
existem para desfazer.</p>

<h3 class="font-bold mt-4 mb-2">Usuário: quem usa</h3>
<p class="mb-3">O <strong>usuário</strong> é quem opera um sistema, programa ou
site sem precisar saber como ele foi construído por dentro. Você é usuário do
aplicativo de mensagens, do jogo, do banco pelo celular — usa o que já está
pronto, sem escrever uma linha de código.</p>

<h3 class="font-bold mt-4 mb-2">Programador: quem constrói</h3>
<p class="mb-3">O <strong>programador</strong> escreve o código que faz o
sistema funcionar — as instruções que o computador segue. É quem constrói o
que o usuário depois vai usar, numa linguagem de programação como Python ou
JavaScript.</p>

<h3 class="font-bold mt-4 mb-2">Analista de sistemas: quem planeja antes de construir</h3>
<p class="mb-3">Antes de o programador escrever a primeira linha, alguém
precisa entender o que o sistema tem que fazer, para quem, e como as partes
dele vão se encaixar. Esse é o trabalho do <strong>analista de
sistemas</strong>: estudar o problema, desenhar a solução em plano, e só então
passar para quem programa. Numa obra, é o papel do engenheiro que faz a
planta, não do pedreiro que assenta o tijolo.</p>

<h3 class="font-bold mt-4 mb-2">Help desk: quem ajuda quando trava</h3>
<p class="mb-3">O <strong>help desk</strong> (em português, algo como "balcão
de ajuda") é o serviço — ou a pessoa — que atende quem tem um problema técnico:
a impressora não funciona, a senha não entra, o programa trava. Você já ligou
para o suporte de um aplicativo ou de uma operadora? Falou com o help
desk.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A ordem em que se encontram:</strong> o analista
planeja, o programador constrói, o usuário usa — e quando algo trava, quem
resolve é o help desk.</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">A rede: quem se aproveita dela, e como ela se costura</h2>

<h3 class="font-bold mt-4 mb-2">Hacker: nem sempre é quem invade</h3>
<p class="mb-3">A palavra <strong>hacker</strong> é usada quase sempre como
sinônimo de "criminoso digital" — mas o sentido original é outro:
<strong>hacker</strong> é quem entende profundamente como um sistema funciona
por dentro, a ponto de encontrar formas de usá-lo (ou modificá-lo) que ninguém
previu. Isso pode ser usado para o bem — encontrar uma falha de segurança e
avisar a empresa, por exemplo — ou para o mal, invadindo sistemas sem
autorização. É por isso que existem os termos <strong>hacker ético</strong>
(também chamado de <em>white hat</em>, "chapéu branco"), contratado para
testar a segurança de propósito, e <strong>cracker</strong>, que é quem usa
esse conhecimento para invadir e prejudicar.</p>

<h3 class="font-bold mt-4 mb-2">Hiperlink: a costura da rede</h3>
<p class="mb-3">Um <strong>hiperlink</strong> (ou apenas "link") é um texto ou
imagem clicável que leva a outra página, outro trecho da mesma página, ou
outro arquivo. É o hiperlink que faz a internet ser uma <strong>rede</strong> —
sem ele, cada página seria uma ilha, sem caminho para chegar às outras.</p>

<h3 class="font-bold mt-4 mb-2">World Wide Web (WWW): o serviço das páginas</h3>
<p class="mb-3">A <strong>World Wide Web</strong> (também escrita
<strong>W3</strong> ou apenas "Web") é o serviço de páginas ligadas por
hiperlinks que roda sobre a internet. Não é a mesma coisa que "internet":
a internet é a rede de computadores conectados; a Web é um dos serviços que
funcionam sobre essa rede — o e-mail é outro serviço, que também usa a
internet sem ser a Web.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Não confunda:</strong> "hacker" não é sinônimo de
criminoso, e "internet" não é sinônimo de "Web". As duas confusões são das
mais comuns que existem sobre tecnologia.</p>
</div>
`;

export const modulo2: Module = {
  code: 'AP045.2',
  title: 'Sete palavras que todo mundo usa errado',
  description: 'Usuário, programador, analista de sistemas, help desk, hacker, hiperlink e World Wide Web — quem é quem, e o que cada termo não significa.',
  lessons: [
    {
      code: 'AP045.2-L1',
      title: 'Quem faz o quê, em volta de um sistema',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-3.1', 'AP045-3.2', 'AP045-3.3', 'AP045-3.4'],
      questions: [
        {
          id: 'AP045.2-L1-Q1', type: 'multiple_choice',
          prompt: 'O que define um usuário?',
          data: { options: [
            { id: 'a', text: 'Quem opera um sistema pronto, sem precisar saber como ele foi construído.', correct: true },
            { id: 'b', text: 'Quem escreve o código que faz um programa funcionar.',
              porque: 'Isso é o programador. O usuário opera o que já foi construído, sem escrever código.' },
            { id: 'c', text: 'Quem planeja a solução antes de qualquer linha de código ser escrita.',
              porque: 'Isso é o analista de sistemas. O usuário entra depois, quando o sistema já existe.' },
            { id: 'd', text: 'Quem atende o telefone quando um sistema apresenta problema.',
              porque: 'Isso é o help desk. O usuário é quem usa o sistema no dia a dia, com ou sem problema.' },
          ]},
          explanation: 'Você é usuário de todo aplicativo que abre sem ter escrito uma linha dele.',
        },
        {
          id: 'AP045.2-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a diferença entre o analista de sistemas e o programador?',
          data: { options: [
            { id: 'a', text: 'O analista planeja como o sistema deve funcionar; o programador escreve o código que o faz funcionar.', correct: true },
            { id: 'b', text: 'O analista escreve o código; o programador só usa o sistema depois de pronto.',
              porque: 'Está invertido: quem escreve o código é o programador. O analista trabalha antes disso, no plano.' },
            { id: 'c', text: 'Não há diferença: são dois nomes para o mesmo trabalho.',
              porque: 'São etapas diferentes: uma pensa o quê e como; a outra constrói o que foi pensado.' },
            { id: 'd', text: 'O analista atende quem liga com um problema técnico; o programador é quem planeja o sistema inteiro antes de codificar.',
              porque: 'Atender problema técnico é o help desk. O analista planeja, e não atende chamado — e quem planeja não é o programador.' },
          ]},
          explanation: 'Numa obra, é a diferença entre quem faz a planta e quem assenta o tijolo.',
        },
        {
          id: 'AP045.2-L1-Q3', type: 'true_false',
          prompt: 'Help desk é o serviço que ajuda quem está com um problema técnico, como uma senha que não entra ou uma impressora que não funciona.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: help desk é justamente o "balcão de ajuda" para esse tipo de problema.' },
          ]},
          explanation: 'Se você já ligou para o suporte técnico de um aplicativo, já falou com um help desk.',
        },
        {
          id: 'AP045.2-L1-Q4', type: 'scenario',
          prompt: 'O clube quer montar um sistema para controlar a presença dos desbravadores. Antes de qualquer código, alguém precisa entender o que o sistema tem que fazer e desenhar como as partes vão se encaixar. De quem é esse trabalho?',
          data: { scenarios: [
            { id: 'a', text: 'Do usuário, que vai abrir o sistema pronto e marcar a presença.',
              porque: 'O usuário entra depois, quando o sistema já existe. Aqui ainda não há nada construído.' },
            { id: 'b', text: 'Do analista de sistemas, que planeja a solução antes de o código ser escrito.', correct: true },
            { id: 'c', text: 'Do help desk, que só é chamado quando algo dá errado depois de pronto.',
              porque: 'O help desk resolve problema de sistema já em funcionamento — este ainda nem existe.' },
            { id: 'd', text: 'Do hacker, que descobre falhas de segurança em sistemas já prontos.',
              porque: 'Hacker entra na parte de segurança de um sistema existente, não no planejamento inicial dele.' },
          ]},
          explanation: 'Entender o problema e desenhar a solução antes de programar é o trabalho do analista de sistemas.',
        },
        {
          id: 'AP045.2-L1-Q5', type: 'multiple_choice',
          prompt: 'Você é usuário de um jogo de celular. O que isso quer dizer?',
          data: { options: [
            { id: 'a', text: 'Que você joga o jogo, sem precisar saber a linguagem em que ele foi programado.', correct: true },
            { id: 'b', text: 'Que você escreveu parte do código do jogo, mesmo sem ser o programador principal.',
              porque: 'Usuário não escreve código. Se você escrevesse parte do código, seria também programador.' },
            { id: 'c', text: 'Que você planejou como o jogo deveria funcionar antes de ele ser feito.',
              porque: 'Planejar antes de construir é o papel do analista de sistemas, não do usuário.' },
            { id: 'd', text: 'Que você trabalha no help desk da empresa que criou o jogo.',
              porque: 'Trabalhar no help desk é atender quem tem problema. Jogar o jogo é ser usuário dele.' },
          ]},
          explanation: 'Usar sem precisar entender o código por dentro é exatamente o papel do usuário.',
        },
        {
          id: 'AP045.2-L1-Q6', type: 'matching',
          prompt: 'Ligue cada papel à sua descrição.',
          data: { pairs: [
            { left: 'Usuário', right: 'Opera um sistema pronto, sem escrever código' },
            { left: 'Programador', right: 'Escreve o código que faz o sistema funcionar' },
            { left: 'Analista de sistemas', right: 'Planeja a solução antes de qualquer código' },
            { left: 'Help desk', right: 'Ajuda quem tem um problema técnico' },
          ]},
          explanation: 'Planejar, construir, usar e resolver problema — quatro papéis, quatro momentos diferentes de um mesmo sistema.',
        },
      ],
    },
    {
      code: 'AP045.2-L2',
      title: 'A rede: quem se aproveita dela, e como ela se costura',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP045-3.5', 'AP045-3.6', 'AP045-3.7'],
      questions: [
        {
          id: 'AP045.2-L2-Q1', type: 'multiple_choice',
          prompt: 'O que significa a palavra "hacker" no sentido original do termo?',
          data: { options: [
            { id: 'a', text: 'Quem entende tão profundamente um sistema que encontra usos para ele que ninguém previu.', correct: true },
            { id: 'b', text: 'Quem invade sistemas de computador sem autorização, sempre com intenção de prejudicar.',
              porque: 'Essa descrição é mais próxima de "cracker". O hacker, no sentido original, pode usar o conhecimento para o bem.' },
            { id: 'c', text: 'Quem trabalha no help desk resolvendo problemas técnicos dos usuários.',
              porque: 'Help desk é outro papel, de suporte. Hacker é sobre entender e explorar como um sistema funciona.' },
            { id: 'd', text: 'Quem escreve links que ligam uma página da internet a outra.',
              porque: 'Escrever links não define um hacker. O termo é sobre profundidade de conhecimento técnico.' },
          ]},
          explanation: 'O sentido original é sobre conhecimento profundo, não sobre crime — por isso existem os termos "hacker ético" e "cracker".',
        },
        {
          id: 'AP045.2-L2-Q2', type: 'multiple_choice',
          prompt: 'Uma empresa contrata alguém para tentar invadir o próprio sistema de propósito, e assim descobrir falhas antes que um criminoso as encontre. Como essa pessoa costuma ser chamada?',
          data: { options: [
            { id: 'a', text: 'Hacker ético (white hat), contratado para testar a segurança.', correct: true },
            { id: 'b', text: 'Cracker, porque ela está invadindo um sistema sem ter escrito o código dele.',
              porque: 'Cracker é quem invade para prejudicar, sem autorização. Aqui a empresa contratou e autorizou.' },
            { id: 'c', text: 'Usuário, porque ela está apenas usando o sistema como qualquer outra pessoa faria.',
              porque: 'Testar a segurança de propósito, buscando falhas, é bem diferente de usar o sistema normalmente.' },
            { id: 'd', text: 'Help desk, porque o trabalho dela é resolver um problema do sistema.',
              porque: 'Help desk resolve chamado de quem já tem um problema. Aqui a pessoa procura falhas de propósito.' },
          ]},
          explanation: '"Ético" e "white hat" marcam a diferença: mesmo conhecimento do hacker, mas com autorização e a favor da segurança.',
        },
        {
          id: 'AP045.2-L2-Q3', type: 'multiple_choice',
          prompt: 'O que é um hiperlink, e por que ele é essencial para a internet?',
          data: { options: [
            { id: 'a', text: 'É um texto ou imagem clicável que leva a outra página; sem ele, cada página seria uma ilha isolada.', correct: true },
            { id: 'b', text: 'É o nome técnico do cabo que liga o computador ao roteador da casa.',
              porque: 'Isso descreve um cabo de rede. Hiperlink é o que liga páginas entre si, não equipamentos.' },
            { id: 'c', text: 'É o programa que abre páginas da internet, como o navegador do computador.',
              porque: 'Isso é o navegador. O hiperlink é o que existe dentro de uma página, e o navegador segue quando se clica nele.' },
            { id: 'd', text: 'É a senha que protege uma página para que só pessoas autorizadas a vejam.',
              porque: 'Isso descreve autenticação, não hiperlink. O hiperlink é sobre navegar de uma página a outra.' },
          ]},
          explanation: 'É o hiperlink que costura páginas separadas numa rede — o próprio nome "World Wide Web" fala de uma teia.',
        },
        {
          id: 'AP045.2-L2-Q4', type: 'true_false',
          prompt: '"Internet" e "World Wide Web" (WWW) são duas palavras para a mesma coisa.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro', porque: 'São coisas diferentes: a internet é a rede de computadores; a Web é um dos serviços que rodam sobre ela, como o e-mail é outro.' },
          ]},
          explanation: 'E-mail e Web usam a mesma internet, mas são serviços diferentes dentro dela — sinal de que "internet" e "Web" não são sinônimos.',
        },
        {
          id: 'AP045.2-L2-Q5', type: 'multiple_choice',
          prompt: 'Por que dizer que alguém "é hacker" não é, por si só, uma acusação de crime?',
          data: { options: [
            { id: 'a', text: 'Porque o termo original descreve conhecimento técnico profundo, que pode ser usado tanto para proteger quanto para invadir.', correct: true },
            { id: 'b', text: 'Porque nenhum hacker jamais invadiu um sistema sem autorização em toda a história.',
              porque: 'Invasões sem autorização acontecem e são crime — o ponto é que "hacker" não se resume a isso.' },
            { id: 'c', text: 'Porque a palavra "hacker" é usada apenas para empresas, e nunca para pessoas.',
              porque: 'O termo descreve pessoas com certo tipo de conhecimento, e não empresas.' },
            { id: 'd', text: 'Porque quem invade sistemas ilegalmente deixou de ser chamado de hacker há muito tempo, e passou a receber outro nome qualquer.',
              porque: 'A palavra ainda é usada popularmente para quem invade — é aí que a confusão nasce, não porque ela tenha mudado de significado.' },
          ]},
          explanation: 'O que separa o uso do termo é a intenção e a autorização, não o conhecimento em si.',
        },
        {
          id: 'AP045.2-L2-Q6', type: 'matching',
          prompt: 'Ligue cada termo à ideia certa.',
          data: { pairs: [
            { left: 'Hacker', right: 'Conhecimento técnico profundo, que pode servir ao bem ou ao mal' },
            { left: 'Cracker', right: 'Usa o conhecimento técnico para invadir e prejudicar' },
            { left: 'Hiperlink', right: 'Texto ou imagem clicável que leva a outra página' },
            { left: 'World Wide Web', right: 'Serviço de páginas ligadas por hiperlinks, que roda sobre a internet' },
          ]},
          explanation: 'Hacker e cracker se distinguem pela intenção; hiperlink e Web se distinguem pela escala — um é o fio, o outro é a teia inteira.',
        },
      ],
    },
  ],
};
