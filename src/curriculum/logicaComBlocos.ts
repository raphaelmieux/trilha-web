/*
 * A vereda CC001 Lógica com Scratch.
 *
 * ── Por onde ela começa ──────────────────────────────────────────────────
 * É a primeira vereda de todas, e a única que não supõe nada. Quem chega aqui
 * pode nunca ter escrito uma linha de nada — e sai sabendo o que são sequência,
 * repetição, condição, variável e evento, que é o vocabulário de todas as
 * outras. Python, JavaScript e C mudam a escrita; não mudam isto.
 *
 * ── A forma ──────────────────────────────────────────────────────────────
 * A mesma das outras veredas, de propósito: módulo com uma lição de teoria e
 * uma lição de fazer. Quem percorreu a de HTML não aprende uma segunda
 * gramática de percurso.
 *
 * ── O que muda ───────────────────────────────────────────────────────────
 * Duas coisas.
 *
 * A primeira é que o módulo 1 não tem laboratório: tem **redação**. O requisito
 * 1 do documento pede um relatório de 250 palavras sobre a origem da
 * programação em blocos, e isso não é laboratório nenhum — é o laboratório de
 * redação guiada que a plataforma já tem, o mesmo da AP034 e da AP041. O
 * requisito 3, que também pede texto, entra como uma das oito etapas dele.
 *
 * A segunda é que os laboratórios não escrevem texto: montam uma árvore de
 * blocos. O modelo deles não é uma string, é `projetoDeBlocos` — os
 * personagens no palco, e nenhuma pilha montada.
 *
 * ── O percurso, e por que nesta ordem ────────────────────────────────────
 * Cada módulo acrescenta exatamente uma ideia, e o laboratório dele cobra
 * exatamente essa ideia. O último cobra a vereda inteira, porque é o requisito
 * 5 — o jogo com placar, condição de vitória e dois personagens que interajam.
 *
 * A ordem é a de quem monta um jogo de verdade: primeiro o que se vê, depois o
 * que se controla, depois o que se repete, o que se decide, o que se conta, e
 * só então o jogo. Cada passo dá para testar sozinho antes do seguinte, que é a
 * única forma de não empilhar três erros e não saber qual é qual.
 */

import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_BLOCOS } from './questoesDeBlocos';
import { PROJETO_INICIAL } from '../labs/scratch/projetoInicial';

/*
  O palco de onde todo laboratório parte: dois personagens e nenhuma pilha.

  Os dois estão ali desde o primeiro módulo, e não só no último, porque quem
  monta um jogo escolhe o elenco antes do enredo — e porque o requisito 5 pede
  dois que interajam, o que se prepara vendo os dois no palco desde cedo.

  Nenhuma variável. O requisito 4.4 pede **criar** uma variável e alterar o
  valor dela; entregá-la pronta daria a primeira metade de graça, e a
  verificação passaria a medir só a segunda sem que nada na tela denunciasse.
  Quem cria é a pessoa, na paleta.

  Nenhuma pilha, em nenhum personagem. É a regra da casa e `veredas.test.ts` a
  cobra: laboratório que abre com verificação verde não ensina nada, e o erro é
  invisível de dentro porque o painel mostra tarefa concluída — que é
  exatamente o que se espera de um laboratório funcionando.
*/
const laboratorio = (
  id: string, titulo: string, resumo: string, verificacoes: string[],
) => ({
  id, tipo: 'laboratorio' as const, titulo, resumo,
  linguagem: 'scratch' as const,
  modelo: '', arquivo: 'jogo.sb3', projeto: 'jogo-do-clube',
  projetoDeScratch: PROJETO_INICIAL,
  verificacoes,
});

/* ────────────────────────────────────────────────────────────────────────
   Os capítulos de teoria
   ──────────────────────────────────────────────────────────────────────── */

const CAPITULOS: { id: string; titulo: string; resumo: string; topicos: TopicoDeVereda[] }[] = [
  {
    id: 'algoritmo',
    titulo: 'O algoritmo',
    resumo: 'O que é um algoritmo, por que a ordem importa, e de onde vieram os blocos.',
    topicos: [
      {
        id: 'o-que-e',
        titulo: 'Passos, em ordem',
        resumo: 'A definição, e por que ela não fala de computador.',
        explicacao: [
          'Um algoritmo é uma sequência finita de passos, em ordem, que leva de um ponto de partida a um resultado. Só isso.',
          'Repare no que a definição não diz: ela não fala de computador nenhum. Armar a barraca é um algoritmo. O caminho de casa até a igreja é um algoritmo. A receita do bolo da sua avó é um algoritmo, e é bem mais antiga que qualquer máquina.',
          'A palavra vem do nome de al-Khwarizmi, um matemático persa que viveu por volta do ano 800 e escreveu livros ensinando a calcular passo a passo. O nome dele atravessou mil e duzentos anos e virou o nome da coisa.',
        ],
        exemplo: `Trocar o pneu da bicicleta:
  1. soltar os freios
  2. tirar a roda
  3. tirar a câmara
  4. pôr a câmara nova
  5. pôr a roda
  6. apertar os freios`,
        exemploComo: 'texto',
        atencao: 'Algoritmo não é programa. O algoritmo é o plano; o programa é esse plano escrito numa linguagem que a máquina entende. Um algoritmo pode virar programa em Scratch, em Python ou em nenhum dos dois — e continua sendo um algoritmo.',
        marcas: ['algoritmo', 'sequência', 'al-Khwarizmi'],
      },
      {
        id: 'a-ordem',
        titulo: 'A ordem faz parte',
        resumo: 'Por que uma lista não é um algoritmo.',
        explicacao: [
          'Numa lista de compras a ordem não importa: comprar o arroz antes ou depois do feijão dá no mesmo. Num algoritmo, importa.',
          'Troque "asse por 40 minutos" com "misture a massa" e a receita para de funcionar. Os dois passos continuam lá, escritos e corretos, e o bolo não sai.',
          'É por isso que a sequência é a primeira das três estruturas que você vai aprender. Ela parece óbvia demais para ter nome — e é a que mais quebra programa quando alguém a monta de qualquer jeito.',
        ],
        exemplo: `Ordem errada:
  1. abrir o guarda-chuva
  2. sair de casa
  3. começar a chover

Ordem certa:
  1. começar a chover
  2. abrir o guarda-chuva
  3. sair de casa`,
        exemploComo: 'texto',
        atencao: 'Um passo pode estar certo e no lugar errado. Quando o programa faz quase o que você quer, olhe a ordem antes de mexer nos blocos: costuma ser ela.',
        marcas: ['ordem', 'sequência'],
      },
      {
        id: 'de-onde-vieram',
        titulo: 'De onde vieram os blocos',
        resumo: 'Papert, o Logo, e por que blocos em vez de texto.',
        explicacao: [
          'Em 1967, Seymour Papert, Wally Feurzeig e Cynthia Solomon criaram o Logo, a primeira linguagem feita para crianças. Papert tinha trabalhado com o psicólogo Jean Piaget e levou dali uma ideia: a criança aprende construindo. No livro Mindstorms, de 1980, ele escreveu que a criança deve programar o computador, e não ser programada por ele.',
          'O Logo era digitado. O que veio depois foi trocar o texto por peças que encaixam — e a diferença não é de aparência. Bloco só entra onde faz sentido, então o erro de sintaxe simplesmente não acontece: não há ponto e vírgula para esquecer nem palavra para escrever errado.',
          'O Scratch é de 2007, do grupo Lifelong Kindergarten do Media Lab do MIT, liderado por Mitchel Resnick. O nome vem do scratching dos DJs, a técnica de misturar e reaproveitar pedaços de música. É gratuito, e os projetos podem ser publicados para outras pessoas verem.',
        ],
        exemplo: `No Logo, digitado:
  para frente 100
  vire à direita 90

Em blocos, encaixado:
  [mova 100 passos]
  [gire 90 graus]`,
        exemploComo: 'blocos',
        atencao: 'Blocos não são uma linguagem de brinquedo. Sequência, repetição, condição, variável e evento são exatamente os mesmos em Python, em Java e em C. O que muda é a escrita — e é por isso que esta vereda vem antes das outras.',
        marcas: ['Logo', 'Papert', 'Scratch', 'Resnick'],
      },
    ],
  },

  {
    id: 'pilha',
    titulo: 'A primeira pilha',
    resumo: 'O palco, as coordenadas, o chapéu e a ordem de execução.',
    topicos: [
      {
        id: 'o-palco',
        titulo: 'O palco e as coordenadas',
        resumo: 'Onde as coisas ficam, e por que existe número negativo.',
        explicacao: [
          'O palco tem 480 de largura por 360 de altura, e a origem — o ponto x: 0 y: 0 — fica no meio dele, e não num canto.',
          'Isso quer dizer que x vai de -240, na beirada esquerda, até 240, na direita. E y vai de -180, embaixo, até 180, em cima. Metade das posições é negativa, e isso é normal.',
          'É o mesmo sistema do gráfico da aula de matemática, e é de propósito: quem entende um entende o outro.',
        ],
        exemplo: `x: -120  y: 0     à esquerda, na altura do meio
x: 0     y: 0     bem no centro
x: 240   y: 180   canto de cima, à direita`,
        exemploComo: 'texto',
        atencao: 'Vá para x: 0 y: 0 não é "voltar ao começo": é ir para o centro. Se o personagem começou em outro lugar, esse bloco o move para longe de onde ele estava.',
        marcas: ['x', 'y', 'palco'],
      },
      {
        id: 'o-chapeu',
        titulo: 'O chapéu diz quando',
        resumo: 'Sem ele, a pilha nunca roda.',
        explicacao: [
          'Os blocos de cima arredondado são os chapéus. Cada um responde a uma pergunta só: quando esta pilha começa?',
          'Quando a bandeira verde for clicada. Quando a tecla direita for pressionada. Quando este personagem for clicado. Cada pilha começa com um deles, e é ele que a liga.',
          'O chapéu não é um comando. Ele não move nada, não fala nada e não muda nada. Ele espera.',
        ],
        exemplo: `[quando a bandeira verde for clicada]
  [vá para x: -120 y: 0]
  [diga "vamos!"]`,
        exemploComo: 'blocos',
        atencao: 'Pilha sem chapéu não roda — nunca, de jeito nenhum. Ela fica bonita na tela, os blocos estão certos, e ao clicar em Começar não acontece nada. É o primeiro erro de todo mundo, e o mais difícil de enxergar justamente porque não há erro nenhum para ler.',
        marcas: ['chapéu', 'bandeira verde'],
      },
      {
        id: 'de-cima-para-baixo',
        titulo: 'De cima para baixo, e todos ao mesmo tempo',
        resumo: 'A pilha é sequência; as pilhas são simultâneas.',
        explicacao: [
          'Dentro de uma pilha, os blocos rodam de cima para baixo, um depois do outro. O desenho na tela é a ordem de execução — a sequência do módulo 1, virada na vertical.',
          'Mas pilhas diferentes rodam ao mesmo tempo. Se o gato e a maçã têm cada um a sua pilha de bandeira verde, as duas começam juntas: uma não espera a outra terminar.',
          'É o que permite um jogo existir. Se o segundo personagem só se mexesse depois que o primeiro acabasse, não haveria jogo nenhum — haveria um desenho animado.',
        ],
        exemplo: `No Gato:
[quando a bandeira verde for clicada]
  [vá para x: -120 y: 0]
  [diga "oi"]

Na Maçã:
[quando a bandeira verde for clicada]
  [vá para x: 120 y: 0]
  [diga "me pegue"]

As duas começam juntas: os dois falam ao mesmo tempo.`,
        exemploComo: 'blocos',
        atencao: 'Um mesmo personagem pode ter várias pilhas, e todas com o mesmo chapéu. Não há uma pilha "principal": clicar na bandeira verde dispara todas as pilhas de bandeira, de todos os personagens, de uma vez.',
        marcas: ['pilha', 'execução'],
      },
    ],
  },

  {
    id: 'eventos',
    titulo: 'Eventos',
    resumo: 'O que dispara um programa, e a diferença entre terminar e ficar de guarda.',
    topicos: [
      {
        id: 'o-evento',
        titulo: 'O que é um evento',
        resumo: 'Algo que vem de fora e faz o programa reagir.',
        explicacao: [
          'Um evento é algo que acontece de fora do programa e faz ele reagir: uma tecla pressionada, um clique, dois personagens que se encostam, o tempo passando.',
          'Programar com eventos é escrever respostas. Você não diz "primeiro o jogador anda, depois pula": você diz "quando a seta for pressionada, ande" e "quando o espaço for pressionado, pule". Quem decide a ordem é quem está jogando.',
          'Todo aplicativo que você usa funciona assim. O teclado do celular não sabe que letra você vai apertar — ele fica esperando, e responde.',
        ],
        exemplo: `[quando a tecla direita for pressionada]
  [mova 10 passos]

[quando a tecla esquerda for pressionada]
  [mova -10 passos]`,
        exemploComo: 'blocos',
        atencao: 'Mova -10 passos anda para trás. Não existe bloco separado para isso: o sinal negativo é a direção, e é o mesmo raciocínio das coordenadas negativas do palco.',
        marcas: ['evento', 'tecla'],
      },
      {
        id: 'terminar-ou-esperar',
        titulo: 'Terminar, ou ficar de guarda',
        resumo: 'Os dois tipos de programa, e como se distinguem na tela.',
        explicacao: [
          'Um programa que executa uma vez faz os passos dele na ordem e acaba. Depois do último bloco, não há mais nada acontecendo: ele terminou. É o caso de uma pilha que arruma o cenário e para.',
          'Um programa que fica esperando continua vivo sem fazer nada, até que algo aconteça — e então reage. Esse tipo se chama orientado a eventos, e é o que jogos, aplicativos e sites são.',
          'Na tela a diferença aparece em dois lugares: no chapéu que abre a pilha, e em haver ou não um laço "sempre" dentro dela.',
        ],
        exemplo: `Executa uma vez e acaba:
[quando a bandeira verde for clicada]
  [vá para x: -120 y: 0]
  [mude placar para 0]

Fica de guarda:
[quando a bandeira verde for clicada]
  [sempre]
    [se tocando em Maçã, então]
      [adicione 1 a placar]`,
        exemploComo: 'blocos',
        atencao: 'Os dois tipos convivem no mesmo projeto, e quase todo jogo usa os dois. Um não substitui o outro: um arruma as coisas, o outro vigia.',
        marcas: ['orientado a eventos', 'sempre'],
      },
      {
        id: 'aparencia-e-som',
        titulo: 'Responder também é aparecer',
        resumo: 'Trocar de fantasia e tocar som, em resposta a um evento.',
        explicacao: [
          'Um personagem tem fantasias: desenhos diferentes do mesmo personagem. O bloco "próxima fantasia" passa para o seguinte, e depois do último volta ao primeiro.',
          'Trocando de fantasia depressa, dentro de um laço, o personagem parece andar. É assim que a animação funciona, no Scratch e no cinema.',
          'Som é o mesmo raciocínio: um evento acontece, e o programa responde com algo que se ouve. É o que faz um jogo parecer que reage, em vez de apenas mudar.',
        ],
        exemplo: `[quando a tecla direita for pressionada]
  [mova 10 passos]
  [próxima fantasia]
  [toque o som]`,
        exemploComo: 'blocos',
        atencao: 'O requisito pede aparência ou som em resposta a um evento. "Próxima fantasia" solto numa pilha sem chapéu não responde a evento nenhum: ele nunca chega a acontecer.',
        marcas: ['fantasia', 'som'],
      },
    ],
  },

  {
    id: 'repeticao',
    titulo: 'A repetição',
    resumo: 'Os dois laços, o que muda entre eles, e o laço que repete o nada.',
    topicos: [
      {
        id: 'o-laco',
        titulo: 'O laço',
        resumo: 'Um bloco que executa de novo o que está dentro dele.',
        explicacao: [
          'Um laço é um bloco que executa de novo o que está dentro da boca dele. "Repita 10 vezes" faz dez voltas e sai.',
          'Ele não serve para digitar menos. Serve para que trocar dez por cem seja mudar um número — e não apagar dez blocos e encaixar cem.',
          'É a segunda das três estruturas. Com sequência e repetição já se escreve muita coisa; falta só decidir.',
        ],
        exemplo: `Sem laço, quatro blocos iguais:
[mova 10 passos]
[mova 10 passos]
[mova 10 passos]
[mova 10 passos]

Com laço, um número:
[repita 4 vezes]
  [mova 10 passos]`,
        exemploComo: 'blocos',
        atencao: 'O laço só repete o que está dentro da boca dele. Bloco encaixado embaixo do laço, e não dentro, roda uma vez só — e essa é a confusão mais comum de todas, porque na tela os dois lugares ficam quase colados.',
        marcas: ['repita', 'laço'],
      },
      {
        id: 'repita-e-sempre',
        titulo: 'Repita, e sempre',
        resumo: 'Quando cada um serve.',
        explicacao: [
          '"Repita 10 vezes" sabe quando parar: conta até dez e segue em frente. Use quando você souber o número de voltas — dar quatro passos, desenhar um quadrado, piscar três vezes.',
          '"Sempre" não para nunca. Ele gira até alguém encerrar o programa: o bloco "pare tudo", a bandeira vermelha, ou sair do laboratório.',
          'Use "sempre" para vigiar: perguntar, a cada instante, se algo aconteceu. É onde o "se" do próximo módulo vai morar.',
        ],
        exemplo: `Conta e sai:
[repita 4 vezes]
  [mova 10 passos]

Nunca sai sozinho:
[sempre]
  [se tocando em Maçã, então]
    [adicione 1 a placar]`,
        exemploComo: 'blocos',
        atencao: 'Blocos encaixados depois de um "sempre" nunca rodam. O laço não termina, então nada que venha abaixo dele chega a acontecer — e o bloco fica ali, visível e inútil.',
        marcas: ['sempre', 'repita'],
      },
      {
        id: 'laco-vazio',
        titulo: 'O laço que repete o nada',
        resumo: 'Ter o bloco não é usar a estrutura.',
        explicacao: [
          'Um "repita 10 vezes" sem nada dentro é um programa válido. Ele roda, conta até dez, não faz nada e segue. Nenhum aviso aparece.',
          'Isso é fácil de fazer sem querer: você arrasta o laço, se distrai, e ele fica lá. Na tela parece que o laço está no programa — e está, sem fazer nada.',
          'Por isso a verificação deste laboratório não pergunta se existe um laço. Ela pergunta se existe um laço com alguma coisa dentro. Arrastar o bloco é a parte fácil.',
        ],
        exemplo: `Isto não é um laço de verdade:
[repita 10 vezes]
  (vazio)

Isto é:
[repita 10 vezes]
  [mova 10 passos]
  [próxima fantasia]`,
        exemploComo: 'blocos',
        atencao: 'A mesma armadilha vale para o "se" do módulo seguinte, e para a variável do módulo depois dele. O que se cobra é sempre o que a estrutura faz, e nunca que ela esteja na tela.',
        marcas: ['laço vazio'],
      },
    ],
  },

  {
    id: 'condicao',
    titulo: 'A condição',
    resumo: 'A pergunta de sim ou não, os sensores, e por que ela mora dentro de um laço.',
    topicos: [
      {
        id: 'o-se',
        titulo: 'O bloco se',
        resumo: 'Uma pergunta que decide se algo acontece.',
        explicacao: [
          'Uma condição é uma pergunta de sim ou não. Se a resposta é sim, o que está dentro do "se" acontece. Se é não, o programa pula aquilo e segue.',
          'É a terceira estrutura, e a que faz o programa parecer que pensa. Sem ela, o programa faz sempre a mesma coisa, na mesma ordem, todas as vezes.',
          'A pergunta é feita no instante exato em que o bloco é executado. Nem antes, nem depois.',
        ],
        exemplo: `[se tocando em Maçã, então]
  [diga "peguei!"]
  [toque o som]`,
        exemploComo: 'blocos',
        atencao: 'O "se" pergunta uma vez, no momento em que roda. Ele não fica vigiando por conta própria: para isso ele precisa estar dentro de um laço, e é isso que o próximo tópico trata.',
        marcas: ['se', 'condição'],
      },
      {
        id: 'dentro-do-sempre',
        titulo: 'Por que o se mora dentro do sempre',
        resumo: 'O erro que produz um jogo que nunca marca ponto.',
        explicacao: [
          'Ponha um "se tocando na maçã" solto, logo abaixo da bandeira verde. Clique em Começar. Os dois se encostam durante o jogo, e nada acontece.',
          'Não há erro nenhum. O "se" fez a pergunta uma vez, no primeiro instante, quando os dois estavam longe. A resposta foi não, ele seguiu em frente, e a pilha acabou.',
          'Para vigiar alguma coisa, a pergunta precisa ser refeita a cada instante — e é isso que o "sempre" faz. Laço por fora, condição por dentro: é o par mais usado em toda a programação de jogos.',
        ],
        exemplo: `Pergunta uma vez e desiste:
[quando a bandeira verde for clicada]
  [se tocando em Maçã, então]
    [adicione 1 a placar]

Vigia o tempo todo:
[quando a bandeira verde for clicada]
  [sempre]
    [se tocando em Maçã, então]
      [adicione 1 a placar]`,
        exemploComo: 'blocos',
        atencao: 'Este é o defeito mais frustrante de quem começa, porque o programa está visivelmente certo: os blocos são os certos, na ordem certa. O que falta não é um bloco — é um bloco em volta.',
        marcas: ['sempre', 'se'],
      },
      {
        id: 'sensores',
        titulo: 'O que se pode perguntar',
        resumo: 'Tocando em quem, tecla pressionada, e a comparação.',
        explicacao: [
          '"Tocando em" pergunta se este personagem está encostando em alguém. Você escolhe em quem: outro personagem, ou a borda do palco.',
          'A borda não é um personagem: é a beirada da tela. Perguntar por ela serve para saber que se chegou ao limite — e não serve para o requisito de dois personagens que interajam, que pede que um pergunte pelo outro.',
          '"Variável maior que" compara o valor guardado com um número. É a pergunta que decide quando o jogo acabou, e por isso ela só aparece depois que você criar a primeira variável.',
        ],
        exemplo: `Pergunta pelo outro personagem:
[se tocando em Maçã, então]

Pergunta pela beirada do palco:
[se tocando na borda, então]

Compara com um número:
[se placar > 5, então]`,
        exemploComo: 'blocos',
        atencao: 'Tocar a borda é tocar o palco, e não o outro personagem. Trocar um pelo outro deixa o programa rodando e o requisito por cumprir, sem que nada apareça errado na tela.',
        marcas: ['tocando', 'borda', 'sensores'],
      },
    ],
  },

  {
    id: 'variavel',
    titulo: 'A variável',
    resumo: 'Guardar um valor que muda, os dois blocos que o alteram, e o placar.',
    topicos: [
      {
        id: 'o-que-guarda',
        titulo: 'Um lugar com nome',
        resumo: 'O que é uma variável, e por que ela tem nome.',
        explicacao: [
          'Uma variável é um lugar com nome onde o programa guarda um valor que pode mudar. Placar, vidas, tempo, nome do jogador.',
          'Ela tem nome porque é assim que o programa a encontra depois. Um número escrito dentro de um bloco fica preso ali; um número guardado numa variável pode ser lido e mudado de qualquer lugar do projeto.',
          'Você a cria na paleta, em Variáveis, e escolhe o nome. Escolha um que diga o que ela guarda: quem lê "placar" entende, quem lê "x2" não.',
        ],
        exemplo: `placar   guarda quantos pontos você fez
vidas    guarda quantas chances faltam
tempo    guarda quantos segundos restam`,
        exemploComo: 'texto',
        atencao: 'Criar a variável é metade do requisito. A outra metade é alterar o valor dela enquanto o programa roda — variável criada e nunca alterada não demonstra nada, e é exatamente o que a verificação recusa.',
        marcas: ['variável', 'placar'],
      },
      {
        id: 'defina-e-mude',
        titulo: 'Defina, e mude',
        resumo: 'Trocar o valor, ou somar ao que já havia.',
        explicacao: [
          '"Defina placar para 0" troca o valor: seja lá o que houvesse antes, agora é zero.',
          '"Mude placar em 1" soma ao que já havia: se o placar estava em 5, passa a 6. Somar 1 é o mais comum, mas dá para somar 10, ou -1 para tirar um ponto.',
          'Na prática, "mude ... para" vai na bandeira verde, para zerar tudo no começo, e "adicione ... a" vai dentro do jogo, marcando pontos. Recomeçar precisa recomeçar de verdade.',
        ],
        exemplo: `[quando a bandeira verde for clicada]
  [mude placar para 0]
  [sempre]
    [se tocando em Maçã, então]
      [adicione 1 a placar]`,
        exemploComo: 'blocos',
        atencao: 'Sem o "mude placar para 0" no começo, o segundo jogo continua do placar do primeiro. Ninguém nota na primeira partida — só na segunda, e aí parece que o jogo enlouqueceu.',
        marcas: ['mude para', 'adicione a', 'variável'],
      },
      {
        id: 'o-placar',
        titulo: 'O placar que sobe sozinho',
        resumo: 'Por que o "mude" precisa estar dentro de um "se".',
        explicacao: [
          'Ponha "adicione 1 a placar" dentro de um "sempre", mas fora de qualquer "se". Rode o jogo. O placar dispara: sobe centenas de pontos por segundo, sem que ninguém tenha feito nada.',
          'O bloco está funcionando perfeitamente. Ele soma toda vez que é executado, e dentro de um "sempre" ele é executado a cada volta.',
          'O que faz de um contador um placar é a condição em volta dele. Placar marca ponto por alguma coisa; sem o "se", ele marca ponto por existir.',
        ],
        exemplo: `Sobe o tempo todo:
[sempre]
  [adicione 1 a placar]

Marca ponto por alguma coisa:
[sempre]
  [se tocando em Maçã, então]
    [adicione 1 a placar]`,
        exemploComo: 'blocos',
        atencao: 'Mesmo com o "se" no lugar, encostar por um segundo pode render vários pontos: enquanto o encosto durar, a pergunta continua dando sim. É um comportamento real, e resolvê-lo — afastando a maçã depois do ponto — é o que faz o jogo ficar bom.',
        marcas: ['placar', 'contador'],
      },
    ],
  },

  {
    id: 'jogo',
    titulo: 'O jogo',
    resumo: 'Dois personagens que interagem, o fim de jogo, e explicar o que se fez.',
    topicos: [
      {
        id: 'dois-personagens',
        titulo: 'Dois que interagem',
        resumo: 'Existir junto não é interagir.',
        explicacao: [
          'O requisito pede dois personagens que interajam entre si. Dois personagens no palco, cada um com a sua pilha rodando, não interagem: rodam lado a lado sem nunca se notarem.',
          'A interação é a pergunta. Um "se tocando em", nomeando o outro, e alguma coisa acontecendo quando a resposta é sim.',
          'Basta um dos dois perguntar. Se o gato pergunta pela maçã, o encontro é percebido — não é preciso que a maçã também pergunte pelo gato.',
        ],
        exemplo: `Gato:
[quando a bandeira verde for clicada]
  [sempre]
    [se tocando em Maçã, então]
      [adicione 1 a placar]
      [toque o som]`,
        exemploComo: 'blocos',
        atencao: 'Se os dois personagens começarem em alturas muito diferentes e a seta só mudar o x, eles nunca se encontram. O programa está certo e o placar nunca sai do zero — e o defeito está na geometria, não nos blocos.',
        marcas: ['interação', 'tocando'],
      },
      {
        id: 'fim-de-jogo',
        titulo: 'Quando o jogo acaba',
        resumo: 'A comparação que decide vitória ou derrota.',
        explicacao: [
          'Um jogo sem fim não é um jogo: é um brinquedo. O que faz dele jogo é haver um jeito de ganhar, ou de perder.',
          'Quem decide isso é uma condição que compara a variável com um número: se o placar passar de 5, você venceu. Se as vidas chegarem a zero, acabou.',
          'A comparação precisa estar num lugar que a refaça sempre — dentro do mesmo "sempre" que vigia o resto. Perguntar uma vez, no começo, dá sempre a mesma resposta.',
        ],
        exemplo: `[sempre]
  [se tocando em Maçã, então]
    [adicione 1 a placar]
  [se placar > 5, então]
    [diga "você venceu!"]
    [pare tudo]`,
        exemploComo: 'blocos',
        atencao: 'Fechar a bandeira vermelha não é condição de vitória: é desistir, e funciona em qualquer projeto. O requisito pede uma condição escrita no programa.',
        marcas: ['pare tudo', 'vitória'],
      },
      {
        id: 'apresentar',
        titulo: 'Explicar o que se fez',
        resumo: 'O requisito 6, e por que ele é o mais difícil.',
        explicacao: [
          'O último requisito pede que você apresente o jogo ao examinador, explicando em voz alta a função de cada grupo de blocos.',
          'Não é ler os nomes dos blocos: ele está vendo a tela. O que ele não vê é a intenção — por que aquele "se" está dentro daquele "sempre", e o que aconteceria se não estivesse.',
          'É o requisito mais difícil, e o mais honesto: montar copiando é possível, explicar copiando não é. Quando você terminar o jogo, a plataforma escreve um roteiro do seu próprio projeto para você treinar.',
        ],
        exemplo: `"Esta pilha começa quando clico na bandeira verde.
 Ela zera o placar e depois entra num 'sempre',
 que fica perguntando se o gato encostou na maçã.
 Cada vez que encosta, soma um ponto.
 E quando o placar passa de cinco, o jogo para."`,
        exemploComo: 'texto',
        atencao: 'Treine em voz alta, e não só na cabeça. Explicar por dentro parece fácil até a primeira vez que se tenta em voz alta, na frente de alguém.',
        marcas: ['apresentação', 'requisito 6'],
      },
    ],
  },
];

const cap = (id: string) => CAPITULOS.find(c => c.id === id)!;

/* ────────────────────────────────────────────────────────────────────────
   Os módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DE_BLOCOS: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'O que é um algoritmo',
    resumo: 'Passos em ordem, a importância da ordem, e de onde veio a programação em blocos.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m1-teoria'],
        titulo: 'Passos, em ordem',
        resumo: 'A definição, o que ela não exige, e a história que levou aos blocos.',
        topicos: cap('algoritmo').topicos,
      },
      /*
        Aqui vai redação, e não laboratório.

        O requisito 1 pede um relatório de 250 palavras, e uma caixa de texto
        vazia pedindo isso a alguém de dez anos não é tarefa de escrita: é uma
        parede, e o que acontece na prática é copiar da primeira página que a
        busca devolver. O roteiro divide o relatório em oito perguntas curtas,
        cada uma com o que pesquisar, e junta no fim o que a pessoa escreveu.

        A sétima etapa carrega o requisito 3, que também pede texto — por isso
        ele não tem laboratório próprio em lugar nenhum desta vereda.
      */
      {
        id: 'm1-redacao', tipo: 'redacao',
        titulo: 'De onde vieram os blocos',
        resumo: 'O relatório do requisito 1, montado em oito perguntas curtas.',
        roteiro: 'CC001',
      },
    ],
  },

  {
    id: 'm2',
    titulo: 'A primeira pilha',
    resumo: 'O palco, as coordenadas com origem no meio, e o chapéu que liga tudo.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m2-teoria'],
        titulo: 'Onde as coisas ficam, e quando elas rodam',
        resumo: 'Coordenadas negativas, o bloco de chapéu, e pilhas que rodam juntas.',
        topicos: cap('pilha').topicos,
      },
      laboratorio(
        'm2-lab',
        'O gato se apresenta',
        'Monte a primeira pilha: bandeira verde, e algo acontecendo embaixo dela.',
        ['bandeira'],
      ),
    ],
  },

  {
    id: 'm3',
    titulo: 'Eventos',
    resumo: 'O teclado, a diferença entre terminar e ficar de guarda, e responder aparecendo.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m3-teoria'],
        titulo: 'O programa que espera',
        resumo: 'O que dispara uma pilha, os dois tipos de programa, e a fantasia que troca.',
        topicos: cap('eventos').topicos,
      },
      /* Requisitos 4.1 e 4.5 juntos: o documento pede aparência ou som **em
         resposta a um evento**, e é aqui que o evento é o assunto. */
      laboratorio(
        'm3-lab',
        'O gato obedece ao teclado',
        'Mova o gato com as setas, e faça ele mudar de fantasia ou tocar um som ao responder.',
        ['moverPorTecla', 'aparenciaOuSom'],
      ),
    ],
  },

  {
    id: 'm4',
    titulo: 'A repetição',
    resumo: 'Repita e sempre, quando cada um serve, e o laço que não repete nada.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m4-teoria'],
        titulo: 'Os dois laços',
        resumo: 'O que conta até parar, o que nunca para, e por que o laço vazio engana.',
        topicos: cap('repeticao').topicos,
      },
      laboratorio(
        'm4-lab',
        'O gato anda sozinho',
        'Ponha um laço para funcionar — com blocos dentro dele, que é o que faz dele um laço.',
        ['laco'],
      ),
    ],
  },

  {
    id: 'm5',
    titulo: 'A condição',
    resumo: 'A pergunta de sim ou não, e por que ela precisa de um laço em volta.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m5-teoria'],
        titulo: 'A pergunta que decide',
        resumo: 'O bloco se, o par sempre-mais-se, e o que dá para perguntar.',
        topicos: cap('condicao').topicos,
      },
      laboratorio(
        'm5-lab',
        'O gato percebe',
        'Faça o gato reagir a alguma coisa: um "se" com blocos dentro, vigiado por um laço.',
        ['condicional'],
      ),
    ],
  },

  {
    id: 'm6',
    titulo: 'A variável',
    resumo: 'Criar um lugar com nome, alterar o valor dele, e transformar isso num placar.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m6-teoria'],
        titulo: 'Guardar um valor que muda',
        resumo: 'Defina contra mude, e o contador que sobe sem que ninguém faça nada.',
        topicos: cap('variavel').topicos,
      },
      /* O placar entra junto da variável porque um sem o outro é meio
         requisito: o documento pede a variável alterada durante a execução, e
         o que a altera por um motivo é a condição em volta. */
      laboratorio(
        'm6-lab',
        'O primeiro placar',
        'Crie a variável, altere o valor dela durante o jogo, e ponha essa alteração dentro de um "se".',
        ['variavel', 'placar'],
      ),
    ],
  },

  {
    id: 'm7',
    titulo: 'O jogo',
    resumo: 'Dois personagens que se encontram, uma condição de vitória, e a apresentação.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DE_BLOCOS['m7-teoria'],
        titulo: 'Do projeto ao jogo',
        resumo: 'A interação entre os dois, o que encerra a partida, e como se explica o que se fez.',
        topicos: cap('jogo').topicos,
      },
      /*
        O último laboratório cobra a vereda inteira.

        É o requisito 5 — placar em variável, condição de vitória ou derrota, e
        dois personagens que interajam —, e junto vem tudo o que os módulos
        anteriores pediram, porque um jogo que perdeu o laço pelo caminho não é
        um jogo. Dez verificações, do chapéu ao fim de jogo.
      */
      laboratorio(
        'm7-lab',
        'O jogo do clube',
        'O jogo terminado: o gato move-se pelo teclado, encontra a maçã, marca ponto e vence.',
        [
          'bandeira', 'moverPorTecla', 'laco', 'condicional', 'variavel',
          'aparenciaOuSom', 'doisPersonagens', 'interacao', 'placar', 'fimDeJogo',
        ],
      ),
    ],
  },
];
