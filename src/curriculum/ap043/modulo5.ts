import type { Module } from '../../types';

/*
 * AP043 módulo 5 — os requisitos 6 e 7, juntos.
 *
 * Cada um é uma pergunta só no documento, e uma pergunta não sustenta um
 * módulo. Ficam juntos porque falam da mesma coisa por dois ângulos: máquinas
 * que precisam se entender. Uma com a peça que se encaixa nela e com o arquivo
 * que recebe; outra com as máquinas do lado.
 *
 * ── Compatibilidade é a palavra que aparece depois do prejuízo ───────────
 * Ninguém procura "compatibilidade" antes de comprar. A palavra aparece quando
 * o cabo não entra, quando o documento abre desconfigurado, quando o aplicativo
 * diz que o aparelho não serve. Por isso a lição não começa pela definição:
 * começa pelas três situações, que o desbravador reconhece, e a definição vem
 * depois delas.
 *
 * ── E redes precisa fugir da sopa de siglas ──────────────────────────────
 * LAN, MAN, WAN, PAN é lista para decorar, e decorada não serve para nada. O
 * que separa uma da outra é só uma coisa — o tamanho da área coberta —, e é por
 * aí que a lição entra: primeiro como as máquinas se ligam de fato num
 * escritório, com fio e sem fio, e só depois o nome que se dá ao alcance.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Quando as coisas não se entendem</h2>
<p class="mb-3">Três cenas que todo mundo já viu:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>O cabo do carregador não entra no celular do primo.</li>
  <li>Você manda o trabalho para a secretária do clube e ela abre tudo desconfigurado.</li>
  <li>O aplicativo diz "seu aparelho não é compatível" e nem deixa instalar.</li>
</ul>
<p class="mb-3">As três são a mesma coisa com nomes diferentes:
<strong>compatibilidade</strong>. Compatível quer dizer que duas coisas
conseguem trabalhar juntas. Incompatível quer dizer que não conseguem — mesmo
que as duas funcionem muito bem separadas.</p>

<h3 class="font-bold mt-4 mb-2">Compatibilidade de equipamentos</h3>
<p class="mb-3">É a pergunta "esta peça funciona nesta máquina?". Ela tem dois
lados, e os dois precisam dar certo:</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>O encaixe físico.</strong> O processador precisa caber no soquete da placa mãe. O
  pente de memória, na fenda certa. O cabo USB-C não entra numa porta USB comum, e nenhuma força
  resolve isso.</li>
  <li><strong>O reconhecimento.</strong> A peça pode encaixar e mesmo assim não ser reconhecida,
  porque o sistema não sabe conversar com ela. É aí que entra o <em>driver</em>: o programinha que
  ensina o sistema a usar aquele modelo de impressora, de placa, de webcam.</li>
</ul>
<p class="mb-3">Impressora antiga que não tem driver para o Windows novo é o
caso clássico: a impressora funciona, o computador funciona, e os dois não se
falam.</p>

<h3 class="font-bold mt-4 mb-2">Compatibilidade de versões</h3>
<p class="mb-3">É a pergunta "este arquivo abre neste programa?". Programas
mudam com o tempo, e cada versão nova aprende coisas que a anterior não sabe
fazer.</p>
<p class="mb-3">Um programa novo quase sempre abre arquivo velho — isso se
chama <strong>retrocompatibilidade</strong>, e existe porque ninguém quer
perder o que já escreveu. O contrário é que costuma falhar: arquivo salvo num
programa novo, aberto num programa velho, aparece com formatação estranha, com
partes faltando, ou não abre.</p>
<p class="mb-3">O mesmo vale para sistema operacional. Um jogo que pede Windows
11 não roda no Windows 10 — não porque a máquina seja fraca, mas porque ele usa
recursos que a versão antiga não tem.</p>

<h3 class="font-bold mt-4 mb-2">O que fazer na prática</h3>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>Antes de comprar peça</strong>, confira o modelo da placa mãe e o que ela aceita.</li>
  <li><strong>Antes de mandar arquivo para alguém</strong>, pense no programa que a pessoa tem. Em
  caso de dúvida, mande em pdf: ele abre igual em qualquer lugar, e você já sabe fazer isso desde a
  Computação 2.</li>
  <li><strong>Quando algo não for reconhecido</strong>, procure o driver do modelo exato no site do
  fabricante, e não um "driver universal" qualquer.</li>
</ul>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Computadores ligados uns aos outros</h2>
<p class="mb-3">Num escritório, as máquinas não trabalham sozinhas. Elas
precisam da mesma planilha, da mesma impressora, do mesmo sistema. Uma
<strong>rede</strong> é o que permite isso: computadores ligados entre si para
trocar informação e dividir equipamento.</p>

<h3 class="font-bold mt-4 mb-2">Com fio</h3>
<p class="mb-3">O jeito clássico é o <strong>cabo de rede</strong>, aquele
parecido com o de telefone só que mais grosso, com um conector plástico que faz
clique — o RJ-45. Ele sai do computador e vai até um aparelho central, o
<strong>switch</strong>, que recebe o cabo de cada máquina e encaminha o que
chega para quem é.</p>
<p class="mb-3">Cabo dá trabalho para instalar e é o que ninguém vê, mas é
estável, rápido e não sofre com parede no caminho. Por isso escritório sério
continua usando.</p>

<h3 class="font-bold mt-4 mb-2">Sem fio</h3>
<p class="mb-3">O <strong>Wi-Fi</strong> faz a mesma ligação por ondas de
rádio. O aparelho que espalha o sinal é o <strong>roteador</strong>, ou, em
empresas grandes, vários <strong>pontos de acesso</strong> espalhados pelos
andares.</p>
<p class="mb-3">A vantagem é óbvia: ninguém precisa passar cabo, e o notebook
anda pela sala. O preço é a instabilidade — parede, distância e vizinho no
mesmo canal atrapalham.</p>

<h3 class="font-bold mt-4 mb-2">E quase sempre há um servidor</h3>
<p class="mb-3">Ligar máquinas entre si serve para chegar em algum lugar. Esse
lugar costuma ser um <strong>servidor</strong>: um computador que fica ligado o
tempo todo guardando os arquivos e o banco de dados da empresa. As outras
máquinas pedem, ele responde.</p>
<p class="mb-3">É a diferença entre cada um ter a sua planilha no seu
computador — e ninguém saber qual é a versão certa — e todos abrirem a mesma,
no mesmo lugar.</p>

<h3 class="font-bold mt-4 mb-2">Os tipos de rede</h3>
<p class="mb-3">Os nomes são siglas em inglês, e todas dizem a mesma coisa: o
<strong>tamanho da área</strong> que a rede cobre.</p>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li><strong>PAN</strong> — pessoal. Alguns metros, em volta de você. O fone Bluetooth ligado ao
  celular é uma PAN.</li>
  <li><strong>LAN</strong> — local. Um prédio, um andar, uma casa. A rede do escritório é uma LAN, e
  a da sua casa também.</li>
  <li><strong>WLAN</strong> — a LAN sem fio. É a mesma rede local, feita por Wi-Fi em vez de cabo.</li>
  <li><strong>MAN</strong> — metropolitana. Espalhada por uma cidade, ligando prédios de uma mesma
  organização em bairros diferentes.</li>
  <li><strong>WAN</strong> — ampla. Cobre cidades, estados, países. A internet é a maior WAN que
  existe.</li>
</ul>
<p class="mb-3">Repare que uma vive dentro da outra. Seu fone fala com o celular
numa PAN; o celular fala com o roteador numa WLAN; o roteador fala com o mundo
por uma WAN.</p>
`;

export const modulo5: Module = {
  code: 'AP043.5',
  title: 'Máquinas que precisam se entender',
  description: 'Compatibilidade de equipamentos e de versões, e como os computadores de um escritório se conectam.',
  lessons: [
    {
      code: 'AP043.5-L1',
      title: 'Compatibilidade',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP043-6.1'],
      questions: [
        {
          id: 'AP043.5-L1-Q1', type: 'multiple_choice',
          prompt: 'O que quer dizer que duas coisas são compatíveis?',
          data: { options: [
            { id: 'a', text: 'Que elas conseguem trabalhar juntas.', correct: true },
            { id: 'b', text: 'Que as duas foram fabricadas pela mesma empresa, no mesmo ano.',
              porque: 'Peças de fabricantes diferentes funcionam juntas o tempo todo, e do mesmo fabricante às vezes não.' },
            { id: 'c', text: 'Que as duas têm a mesma qualidade e custam mais ou menos o mesmo preço.',
              porque: 'Preço e qualidade não decidem encaixe. Peça cara pode não servir na sua máquina.' },
            { id: 'd', text: 'Que as duas funcionam bem, cada uma no seu lugar, sem depender uma da outra.',
              porque: 'É justamente o contrário: as duas podem funcionar muito bem separadas e não se entenderem juntas.' },
          ]},
          explanation: 'Incompatível não quer dizer estragado. Quer dizer que aquelas duas, juntas, não dão certo.',
        },
        {
          id: 'AP043.5-L1-Q2', type: 'multiple_choice',
          prompt: 'Uma impressora antiga encaixa na porta USB e o computador não a reconhece. O que está faltando?',
          data: { options: [
            { id: 'a', text: 'O driver: o programa que ensina o sistema a usar aquele modelo.', correct: true },
            { id: 'b', text: 'Um cabo USB mais novo, capaz de levar informação e energia ao mesmo tempo.',
              porque: 'Qualquer cabo USB faz as duas coisas. O encaixe deu certo — o problema está no reconhecimento.' },
            { id: 'c', text: 'Uma placa de impressão, que precisa ser instalada dentro do computador.',
              porque: 'Não existe placa de impressão. A impressora se liga por USB ou pela rede, e o resto é software.' },
            { id: 'd', text: 'Mais memória RAM, porque impressoras antigas consomem muito ao imprimir.',
              porque: 'Reconhecer um aparelho não depende de memória. Sem driver, ele não é reconhecido nem com 32 GB.' },
          ]},
          explanation: 'A impressora funciona, o computador funciona, e falta quem os apresente um ao outro.',
        },
        {
          id: 'AP043.5-L1-Q3', type: 'multiple_choice',
          prompt: 'O que é retrocompatibilidade?',
          data: { options: [
            { id: 'a', text: 'A capacidade de um programa novo abrir arquivos feitos em versões antigas.', correct: true },
            { id: 'b', text: 'A possibilidade de voltar um programa novo para a versão anterior quando não se gosta dele.',
              porque: 'Isso é desinstalar e reinstalar o antigo. Retrocompatibilidade fala de abrir arquivo, não de trocar programa.' },
            { id: 'c', text: 'A garantia de que um arquivo novo vai abrir corretamente num programa antigo.',
              porque: 'É esse o lado que costuma falhar. A garantia existe no sentido contrário.' },
            { id: 'd', text: 'A obrigação de todo programa aceitar arquivos de qualquer outro programa concorrente.',
              porque: 'Nenhum programa é obrigado a isso. A palavra fala das versões de um mesmo programa.' },
          ]},
          explanation: 'Ela existe porque ninguém quer perder o que já escreveu. O caminho inverso é que dá problema.',
        },
        {
          id: 'AP043.5-L1-Q4', type: 'true_false',
          prompt: 'Um jogo que exige Windows 11 não roda no Windows 10 apenas quando o computador é fraco.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', porque: 'É falso. Mesmo num computador potente ele não roda, porque usa recursos que a versão antiga não tem.' },
            { id: 'b', text: 'Falso', correct: true },
          ]},
          explanation: 'É compatibilidade de versão, e não de potência. Máquina forte com sistema antigo continua sem rodar.',
        },
        {
          id: 'AP043.5-L1-Q5', type: 'multiple_choice',
          prompt: 'Você precisa enviar um documento e não sabe qual versão do editor a outra pessoa tem. Qual é a saída mais segura?',
          data: { options: [
            { id: 'a', text: 'Enviar em pdf, que abre igual em qualquer lugar.', correct: true },
            { id: 'b', text: 'Enviar o arquivo compactado em zip, para que ele não se desconfigure no caminho.',
              porque: 'Compactar só reduz o tamanho. Ao descompactar, o arquivo continua sendo o mesmo, com o mesmo problema.' },
            { id: 'c', text: 'Enviar pela nuvem em vez do e-mail, porque assim a formatação é preservada.',
              porque: 'O meio de envio não muda o arquivo. Quem abre é o programa da outra pessoa, do mesmo jeito.' },
            { id: 'd', text: 'Enviar duas vezes, para que a pessoa compare as cópias e escolha a que abriu certo.',
              porque: 'As duas cópias são idênticas e vão abrir igual. Enviar de novo não resolve incompatibilidade.' },
          ]},
          explanation: 'Salvar em pdf você já aprendeu na Computação 2. Aqui aparece o motivo de isso ser útil.',
        },
      ],
    },
    {
      code: 'AP043.5-L2',
      title: 'Redes',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP043-7.1'],
      questions: [
        {
          id: 'AP043.5-L2-Q1', type: 'multiple_choice',
          prompt: 'Num escritório, para que serve ligar os computadores em rede com cabo?',
          data: { options: [
            { id: 'a', text: 'Para trocar informação e dividir equipamento, com uma ligação estável.', correct: true },
            { id: 'b', text: 'Para que um computador empreste processador ao outro quando estiver ocioso.',
              porque: 'Processador não se empresta pela rede comum. Cada máquina usa o seu.' },
            { id: 'c', text: 'Para que todos os computadores usem a mesma tomada e gastem menos energia.',
              porque: 'Cabo de rede leva informação, não energia. A tomada de cada máquina continua sendo a dela.' },
            { id: 'd', text: 'Para deixar a internet mais rápida do que a velocidade contratada pela empresa.',
              porque: 'A rede interna não aumenta o que vem da rua. Ela só distribui o que chega.' },
          ]},
          explanation: 'A mesma planilha, a mesma impressora, o mesmo sistema — é isso que a rede permite.',
        },
        {
          id: 'AP043.5-L2-Q2', type: 'matching',
          prompt: 'Ligue cada tipo de rede ao tamanho da área que ela cobre.',
          data: { pairs: [
            { left: 'PAN', right: 'Alguns metros, em volta de uma pessoa' },
            { left: 'LAN', right: 'Um prédio, um andar, uma casa' },
            { left: 'MAN', right: 'Uma cidade' },
            { left: 'WAN', right: 'Cidades, estados e países' },
          ]},
          explanation: 'Todas as siglas dizem a mesma coisa: o alcance. A internet é a maior WAN que existe.',
        },
        {
          id: 'AP043.5-L2-Q3', type: 'multiple_choice',
          prompt: 'Qual é a função do switch numa rede com cabo?',
          data: { options: [
            { id: 'a', text: 'Receber o cabo de cada máquina e encaminhar o que chega para quem é.', correct: true },
            { id: 'b', text: 'Transformar o sinal do cabo em sinal de rádio para os aparelhos sem fio.',
              porque: 'Quem faz isso é o roteador ou o ponto de acesso. O switch trabalha com cabo.' },
            { id: 'c', text: 'Guardar os arquivos que as máquinas da rede compartilham entre si.',
              porque: 'Guardar arquivo é papel do servidor. O switch só encaminha o que passa por ele.' },
            { id: 'd', text: 'Ligar e desligar as máquinas da rede num horário programado pela empresa.',
              porque: 'O nome lembra interruptor, mas ele não liga máquina nenhuma: ele encaminha informação.' },
          ]},
          explanation: 'É o aparelho central: todo cabo chega nele, e é ele que sabe para onde mandar cada coisa.',
        },
        {
          id: 'AP043.5-L2-Q4', type: 'multiple_choice',
          prompt: 'Por que uma empresa mantém um servidor na rede?',
          data: { options: [
            { id: 'a', text: 'Para que os arquivos fiquem num lugar só, e todos abram a mesma versão.', correct: true },
            { id: 'b', text: 'Para que os funcionários não precisem de computador próprio na mesa.',
              porque: 'Cada um continua com a sua máquina. O servidor guarda a informação, não substitui os computadores.' },
            { id: 'c', text: 'Para fazer a rede funcionar, já que sem ele os computadores não se enxergam.',
              porque: 'Uma rede funciona sem servidor. Ele existe para centralizar o que é de todos, não para criar a rede.' },
            { id: 'd', text: 'Para que a empresa possa dispensar o backup, porque o servidor nunca falha.',
              porque: 'Servidor falha como qualquer computador — e por guardar tudo, é o que mais precisa de backup.' },
          ]},
          explanation: 'É a diferença entre cada um ter a sua planilha, sem saber qual é a certa, e todos abrirem a mesma.',
        },
        {
          id: 'AP043.5-L2-Q5', type: 'true_false',
          prompt: 'A rede sem fio de uma casa e a rede com cabo de um escritório são, as duas, redes locais.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'As duas cobrem um prédio ou uma casa, e é o alcance que define a rede local — com fio ou sem.' },
          ]},
          explanation: 'A sem fio ganha a letra W na frente, de WLAN. O alcance, que é o que importa, continua sendo o mesmo.',
        },
        {
          id: 'AP043.5-L2-Q6', type: 'multiple_choice',
          prompt: 'Qual é a desvantagem do Wi-Fi em relação ao cabo, num escritório?',
          data: { options: [
            { id: 'a', text: 'É menos estável: parede, distância e outras redes por perto atrapalham o sinal.', correct: true },
            { id: 'b', text: 'Só permite ligar um computador de cada vez ao roteador da empresa.',
              porque: 'Um roteador atende muitos aparelhos ao mesmo tempo — é para isso que ele existe.' },
            { id: 'c', text: 'Não permite usar impressora, que precisa obrigatoriamente de cabo de rede.',
              porque: 'Impressora com Wi-Fi é comum, e imprime pela rede sem fio normalmente.' },
            { id: 'd', text: 'Exige que todos os computadores sejam da mesma marca para se conectarem.',
              porque: 'Wi-Fi é padrão aberto: aparelhos de marcas diferentes se conectam à mesma rede sem problema.' },
          ]},
          explanation: 'Por isso escritório sério continua passando cabo, mesmo tendo Wi-Fi para os notebooks.',
        },
      ],
    },
  ],
};
