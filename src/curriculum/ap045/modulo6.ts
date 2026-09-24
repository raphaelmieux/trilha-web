import type { Module } from '../../types';

/*
 * AP045 módulo 6 — requisitos 8 e 9.
 *
 * O documento pede citar três sistemas operacionais e suas semelhanças e
 * diferenças (requisito 8) e explicar o que é catfishing e como se proteger
 * dele (requisito 9). O segundo é o único requisito de segurança pessoal da
 * trilha, e por isso puxa a mesma cautela de `questoesDeContas.ts`: metade do
 * estrago de uma lição de segurança é ensinar a desconfiar de tudo. A lição
 * ensina a reconhecer sinais concretos, não a suspeitar de qualquer conversa
 * nova.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Três sistemas operacionais, o mesmo trabalho, jeitos diferentes</h2>
<p class="mb-3">Você já sabe, de Computação 1, que <strong>sistema
operacional</strong> é o programa que gerencia todos os outros e faz a ponte
entre você e o hardware. Nenhum computador ou celular funciona sem um. Três
exemplos comuns são o <strong>Windows</strong>, o <strong>macOS</strong> e o
<strong>Linux</strong>.</p>

<h3 class="font-bold mt-4 mb-2">O que os três têm em comum</h3>
<p class="mb-3">Os três fazem o mesmo trabalho básico: gerenciam a memória, os
arquivos, os programas abertos e a comunicação com as peças do computador
(teclado, tela, disco). Os três também têm uma interface gráfica — janelas,
ícones, um ponteiro de mouse — em vez de obrigar a pessoa a digitar comandos
de texto o tempo todo.</p>

<h3 class="font-bold mt-4 mb-2">Windows: o mais usado em computadores pessoais</h3>
<p class="mb-3">O <strong>Windows</strong>, da Microsoft, é o sistema
operacional mais instalado em computadores de mesa e notebooks no mundo. Roda
em máquinas de muitos fabricantes diferentes — Dell, Lenovo, Acer — e tem o
maior catálogo de programas e jogos disponíveis.</p>

<h3 class="font-bold mt-4 mb-2">macOS: o da Apple, só para o hardware da Apple</h3>
<p class="mb-3">O <strong>macOS</strong> só roda oficialmente em computadores
fabricados pela própria <strong>Apple</strong>, os Mac. É conhecido pela
integração entre hardware e software — como os dois são feitos pela mesma
empresa, costumam funcionar de forma bem ajustada um ao outro — e é comum em
áreas como design e edição de vídeo.</p>

<h3 class="font-bold mt-4 mb-2">Linux: gratuito e de código aberto</h3>
<p class="mb-3">O <strong>Linux</strong> não é um sistema único, e sim uma
base sobre a qual várias "distribuições" são construídas — Ubuntu, Fedora,
Mint, entre muitas outras. Sua marca registrada é ser
<strong>gratuito</strong> e de <strong>código aberto</strong>: qualquer pessoa
pode ver, estudar e até modificar o código que o faz funcionar. É muito usado
em servidores (os computadores que hospedam sites e serviços na internet) e
por quem gosta de personalizar o sistema em detalhe.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>A diferença que mais pesa na prática:</strong> em
que tipo de hardware cada um roda (Windows em muitas marcas, macOS só na
Apple, Linux em quase qualquer máquina), e quem controla o código por trás
dele (empresas fechadas, no caso do Windows e do macOS; comunidade aberta, no
caso do Linux).</p>
</div>
`;

const conteudo_L2 = `
<h2 class="text-xl font-bold mb-3">Catfishing: quando o perfil não é quem diz ser</h2>
<p class="mb-3"><strong>Catfishing</strong> é a criação de um perfil falso nas
redes sociais ou em aplicativos, usando fotos e informações que não são da
pessoa de verdade, para enganar quem conversa com ela — seja para conseguir
dinheiro, informações pessoais, ou simplesmente para viver uma identidade que
não é a própria.</p>

<h3 class="font-bold mt-4 mb-2">Sinais que valem atenção — sem virar desconfiança de tudo</h3>
<p class="mb-3">A maioria das pessoas com quem você conversa online é quem diz
ser. Desconfiar de toda conversa nova ensinaria a evitar a internet inteira, o
que não é o objetivo aqui — o objetivo é reconhecer sinais concretos quando
eles aparecem:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li>A pessoa <strong>nunca</strong> aceita fazer uma chamada de vídeo, mesmo
depois de meses de conversa, sempre com uma desculpa nova.</li>
<li>As fotos do perfil parecem tiradas por um fotógrafo profissional, ou têm
uma qualidade "boa demais" para fotos comuns do dia a dia.</li>
<li>A história de vida muda em detalhes de uma conversa para outra — a
profissão, a cidade, a idade.</li>
<li>A relação evolui muito rápido, e logo vêm pedidos de dinheiro, de dados
pessoais (como número de documento) ou de fotos íntimas.</li>
<li>O perfil é muito recente, com poucos amigos ou seguidores, e quase nenhuma
publicação antiga.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Como se proteger</h3>
<p class="mb-3">Algumas formas simples de reduzir o risco:</p>
<ul class="list-disc pl-5 mb-3 space-y-1">
<li><strong>Busca reversa de imagem:</strong> salvar a foto do perfil e
procurá-la num buscador de imagens. Se a mesma foto aparecer associada a outro
nome, ou a um banco de fotos de internet, é sinal de alerta.</li>
<li><strong>Pedir uma chamada de vídeo</strong> continua sendo um dos testes
mais simples — é muito difícil fingir ser outra pessoa ao vivo, na frente da
câmera.</li>
<li><strong>Nunca enviar dinheiro</strong> a alguém que você só conhece pela
internet, por mais urgente que a história pareça.</li>
<li><strong>Conversar com alguém de confiança</strong> sobre a relação, antes
de tomar qualquer decisão importante por causa dela.</li>
</ul>

<div class="p-3 rounded-lg mt-4" style="background: rgba(234,179,8,.12)">
<p class="text-sm"><strong>Nenhum sinal sozinho prova nada</strong> — uma
pessoa real também pode ter timidez de fazer vídeo, por exemplo. O que conta é
a soma de vários sinais, e o bom senso de pausar antes de confiar dinheiro ou
dados pessoais a alguém que você só conhece pela tela.</p>
</div>
`;

export const modulo6: Module = {
  code: 'AP045.6',
  title: 'O sistema que você escolhe, e o perfil que engana',
  description: 'Windows, macOS e Linux lado a lado — e os sinais que denunciam um perfil falso antes que ele custe caro.',
  lessons: [
    {
      code: 'AP045.6-L1',
      title: 'Três sistemas operacionais, o mesmo trabalho, jeitos diferentes',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-8.1'],
      questions: [
        {
          id: 'AP045.6-L1-Q1', type: 'multiple_choice',
          prompt: 'O que Windows, macOS e Linux têm em comum, apesar das diferenças entre eles?',
          data: { options: [
            { id: 'a', text: 'Os três gerenciam a memória, os arquivos e a comunicação com o hardware, e têm interface gráfica.', correct: true },
            { id: 'b', text: 'Os três rodam oficialmente em qualquer marca de computador, sem exceção.',
              porque: 'O macOS só roda oficialmente em computadores da própria Apple — essa é justamente uma diferença entre eles.' },
            { id: 'c', text: 'Os três são gratuitos e de código aberto, sem custo nenhum de licença.',
              porque: 'Só o Linux tem essa característica marcante. Windows e macOS são de código fechado e costumam ter custo.' },
            { id: 'd', text: 'Os três obrigam o usuário a digitar comandos de texto para tudo o tempo todo, sem oferecer interface gráfica nenhuma.',
              porque: 'É o contrário: os três oferecem interface gráfica, com janelas e ícones, em vez de exigir só linha de comando.' },
          ]},
          explanation: 'O trabalho básico de um sistema operacional é o mesmo nos três — o que muda é quem controla o código e em que hardware ele roda.',
        },
        {
          id: 'AP045.6-L1-Q2', type: 'multiple_choice',
          prompt: 'Qual é a principal diferença entre o macOS e o Windows quanto ao hardware em que rodam?',
          data: { options: [
            { id: 'a', text: 'O macOS só roda oficialmente em computadores da Apple; o Windows roda em máquinas de muitos fabricantes diferentes.', correct: true },
            { id: 'b', text: 'O Windows só roda em computadores da Apple; o macOS roda em qualquer marca.',
              porque: 'Está invertido: é o macOS que é exclusivo da Apple, e o Windows que roda em muitas marcas.' },
            { id: 'c', text: 'Os dois só rodam exatamente nas mesmas máquinas, sem nenhuma diferença de hardware entre eles.',
              porque: 'Há uma diferença real: o macOS é exclusivo do hardware da Apple, e o Windows não é.' },
            { id: 'd', text: 'Nenhum dos dois roda em computador de mesa, funcionando somente em notebooks portáteis de qualquer marca.',
              porque: 'Os dois rodam tanto em computadores de mesa quanto em notebooks — a diferença é sobre fabricante, não sobre formato.' },
          ]},
          explanation: 'A Apple fabrica o hardware e o software juntos; a Microsoft licencia o Windows para fabricantes diferentes.',
        },
        {
          id: 'AP045.6-L1-Q3', type: 'true_false',
          prompt: 'Linux é o nome de um único sistema operacional, igual em toda máquina que o usa.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro', porque: 'É falso: Linux é uma base sobre a qual várias "distribuições" diferentes são construídas, como Ubuntu, Fedora e Mint.' },
          ]},
          explanation: 'Ao contrário do Windows e do macOS, o Linux existe em várias versões (distribuições) montadas por grupos diferentes.',
        },
        {
          id: 'AP045.6-L1-Q4', type: 'multiple_choice',
          prompt: 'O que torna o Linux diferente do Windows e do macOS, além de rodar em qualquer hardware?',
          data: { options: [
            { id: 'a', text: 'Ele é gratuito e de código aberto: qualquer pessoa pode ver e modificar o código que o faz funcionar.', correct: true },
            { id: 'b', text: 'Ele é o único dos três sistemas operacionais que tem interface gráfica com janelas e ícones na tela.',
              porque: 'Os três têm interface gráfica — essa não é uma característica exclusiva do Linux.' },
            { id: 'c', text: 'Ele é o único dos três sistemas operacionais usado em computadores de mesa e em notebooks portáteis.',
              porque: 'Windows e macOS também são usados em computadores de mesa e notebooks — a diferença não está aí.' },
            { id: 'd', text: 'Ele é o único que precisa de conexão com a internet para ligar.',
              porque: 'Nenhum dos três sistemas operacionais precisa de internet só para ligar o computador.' },
          ]},
          explanation: 'Código aberto quer dizer que a comunidade, e não só uma empresa, pode estudar e modificar como o sistema funciona.',
        },
        {
          id: 'AP045.6-L1-Q5', type: 'multiple_choice',
          prompt: 'Por que o Linux é muito usado em servidores — os computadores que hospedam sites na internet?',
          data: { options: [
            { id: 'a', text: 'Porque é gratuito e permite bastante personalização, características valorizadas em quem administra muitos servidores.', correct: true },
            { id: 'b', text: 'Porque é o único sistema operacional capaz de se conectar à internet.',
              porque: 'Os três sistemas conectam à internet normalmente — essa não é uma exclusividade do Linux.' },
            { id: 'c', text: 'Porque servidores nunca podem usar sistemas operacionais fabricados por empresas, por lei ou por norma técnica.',
              porque: 'Servidores podem rodar Windows ou outros sistemas de empresas — a escolha do Linux é por outras vantagens, não por proibição.' },
            { id: 'd', text: 'Porque o Linux só existe numa versão feita para servidor, e nunca em versão para computador pessoal de casa.',
              porque: 'Há distribuições de Linux feitas justamente para uso pessoal, como o Ubuntu Desktop.' },
          ]},
          explanation: 'Gratuidade e personalização pesam quando se administra dezenas ou centenas de máquinas ao mesmo tempo.',
        },
      ],
    },
    {
      code: 'AP045.6-L2',
      title: 'Catfishing: quando o perfil não é quem diz ser',
      type: 'theory',
      content: conteudo_L2,
      requirementCodes: ['AP045-9.1'],
      questions: [
        {
          id: 'AP045.6-L2-Q1', type: 'multiple_choice',
          prompt: 'O que é catfishing?',
          data: { options: [
            { id: 'a', text: 'A criação de um perfil falso, com fotos e informações que não são da pessoa de verdade, para enganar quem conversa com ela.', correct: true },
            { id: 'b', text: 'Um programa de computador que rouba a senha de contas de redes sociais sem a pessoa perceber nada.',
              porque: 'Isso descreve outro tipo de ataque, ligado a roubo de senha. Catfishing é sobre uma identidade falsa numa conversa.' },
            { id: 'c', text: 'Um vírus que se espalha por mensagens de aplicativos de conversa.',
              porque: 'Catfishing não é um programa nem um vírus — é o uso de uma identidade falsa por uma pessoa numa conversa.' },
            { id: 'd', text: 'O nome dado a qualquer perfil de qualquer rede social que usa um apelido qualquer em vez de usar o próprio nome real e verdadeiro.',
              porque: 'Usar apelido não é, por si só, catfishing — o que caracteriza o catfishing é fingir ser outra pessoa, com fotos e histórias que não são reais.' },
          ]},
          explanation: 'O nome vem de um documentário sobre esse tipo de engano, e passou a nomear a prática inteira.',
        },
        {
          id: 'AP045.6-L2-Q2', type: 'multiple_choice',
          prompt: 'Qual desses é um sinal que vale atenção sobre um possível catfishing?',
          data: { options: [
            { id: 'a', text: 'A pessoa sempre arruma uma desculpa nova para nunca fazer uma chamada de vídeo.', correct: true },
            { id: 'b', text: 'A pessoa demora algumas horas para responder mensagens, por causa do trabalho.',
              porque: 'Demorar para responder é comum a qualquer pessoa ocupada, e não é, por si só, sinal de perfil falso.' },
            { id: 'c', text: 'A pessoa tem poucos seguidores porque acabou de criar o perfil da rede social há um mês, por vontade própria.',
              porque: 'Um perfil recente por escolha pessoal, sozinho, não é prova de nada — o alerta soma vários sinais, não um isolado sem contexto.' },
            { id: 'd', text: 'A pessoa prefere conversar por mensagem de texto a fazer ligação de voz.',
              porque: 'Preferir texto a ligação é só um estilo de comunicação, comum a muita gente real.' },
          ]},
          explanation: 'Evitar sistematicamente a chamada de vídeo, com desculpas variadas ao longo do tempo, é um dos sinais mais consistentes.',
        },
        {
          id: 'AP045.6-L2-Q3', type: 'multiple_choice',
          prompt: 'O que a busca reversa de imagem ajuda a descobrir sobre um perfil suspeito?',
          data: { options: [
            { id: 'a', text: 'Se a mesma foto do perfil aparece associada a outro nome, ou a um banco de fotos de internet.', correct: true },
            { id: 'b', text: 'Se a pessoa mora perto ou longe de você, pela localização da foto.',
              porque: 'Busca reversa não revela localização — ela procura onde mais aquela mesma imagem já foi usada na internet.' },
            { id: 'c', text: 'Se a pessoa está online no momento em que você faz a busca.',
              porque: 'Isso é status de conexão do aplicativo, e não tem relação com buscar a origem de uma imagem.' },
            { id: 'd', text: 'A senha da conta da pessoa que enviou a foto.',
              porque: 'Busca reversa de imagem não revela senha nenhuma — ela só procura onde a mesma imagem já apareceu.' },
          ]},
          explanation: 'Se a foto "da pessoa" aparece associada a um nome diferente em outro lugar da internet, é um forte sinal de alerta.',
        },
        {
          id: 'AP045.6-L2-Q4', type: 'true_false',
          prompt: 'Um sinal isolado, como timidez para fazer chamada de vídeo, já prova sozinho que um perfil é falso.',
          data: { options: [
            { id: 'a', text: 'Falso', correct: true },
            { id: 'b', text: 'Verdadeiro', porque: 'É falso: uma pessoa real também pode ter timidez de fazer vídeo. O que pesa é a soma de vários sinais, não um sozinho.' },
          ]},
          explanation: 'Tratar um único sinal como prova definitiva ensinaria a desconfiar de gente real por um motivo bobo — o que se busca é o conjunto.',
        },
        {
          id: 'AP045.6-L2-Q5', type: 'scenario',
          prompt: 'Uma pessoa que você conhece só pela internet, há poucas semanas, diz estar numa emergência e pede que você envie dinheiro para ajudar. O que fazer?',
          data: { scenarios: [
            { id: 'a', text: 'Não enviar dinheiro, e conversar com alguém de confiança sobre a situação antes de qualquer decisão.', correct: true },
            { id: 'b', text: 'Enviar o dinheiro rapidamente, já que uma emergência não pode esperar.',
              porque: 'É exatamente esse tipo de urgência fabricada que costuma preceder um golpe — nunca enviar dinheiro é a orientação de segurança.' },
            { id: 'c', text: 'Pedir a senha da rede social da pessoa para confirmar que ela é real.',
              porque: 'Pedir senha não confirma identidade nenhuma, e ainda ensinaria a pedir informação sensível, que é o oposto de proteger-se.' },
            { id: 'd', text: 'Ignorar totalmente a mensagem e nunca mais conversar com a pessoa de novo, mesmo sem checar absolutamente nada antes.',
              porque: 'Não é preciso cortar contato sem investigar: dá para pedir uma chamada de vídeo ou conversar com alguém de confiança antes de decidir.' },
          ]},
          explanation: 'Pedido de dinheiro somado a urgência é um padrão clássico — pausar e buscar uma segunda opinião é a defesa mais simples.',
        },
      ],
    },
  ],
};
