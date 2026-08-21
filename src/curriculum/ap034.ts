import type { Specialty, Question } from '../types';
import { shuffleArray } from '../lib/progress';

export function shuffleQuestionOptions(q: Question): Question {
  if (q.data.options) return { ...q, data: { ...q.data, options: shuffleArray(q.data.options) } };
  if (q.data.scenarios) return { ...q, data: { ...q.data, scenarios: shuffleArray(q.data.scenarios) } };
  return q;
}
export function shuffleAllQuestions(questions: Question[]): Question[] {
  return questions.map(shuffleQuestionOptions);
}

// ═══════════════════════════════════════════════════════════
// MODULE 1 — CONCEITOS FUNDAMENTAIS
// ═══════════════════════════════════════════════════════════

const content_L1 = `
<h2 class="text-xl font-bold mb-3">O que é a Internet?</h2>
<p class="mb-3">A <strong>Internet</strong> é uma rede global de computadores interconectados que trocam dados usando protocolos padronizados. Ela não pertence a nenhuma empresa ou governo — é uma infraestrutura colaborativa que conecta bilhões de dispositivos em todo o planeta.</p>

<h3 class="font-bold mt-4 mb-2">Características principais:</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Rede de redes:</strong> A Internet conecta milhares de redes menores (de casas, escolas, empresas, governos) em uma única rede global.</li>
  <li><strong>Protocolos padronizados:</strong> TCP/IP é o conjunto de protocolos que permite que dispositivos diferentes conversem entre si.</li>
  <li><strong>Descentralizada:</strong> Não há um único computador central que controle tudo. Se um servidor cai, outros assumem o tráfego.</li>
  <li><strong>Acesso global:</strong> Qualquer pessoa com uma conexão pode acessar a mesma informação, independentemente de onde esteja.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Internet vs. World Wide Web (WWW)</h3>
<p class="mb-3">Muitas pessoas confundem Internet com WWW, mas são coisas diferentes:</p>
<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Internet</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">WWW</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">Infraestrutura física e lógica de rede</td>
    <td class="py-2">Serviço que roda sobre a Internet</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">Cabos, servidores, protocolos TCP/IP</td>
    <td class="py-2">Páginas web, HTML, navegadores</td>
  </tr>
  <tr>
    <td class="py-2">Existiu antes da WWW (ARPANET, 1969)</td>
    <td class="py-2">Criada em 1989 por Tim Berners-Lee</td>
  </tr>
</table>
<p class="mb-3">Analogia: A Internet é como o sistema de rodovias; a WWW é como um dos serviços que usa essas rodovias (ônibus). Outros serviços que usam a Internet incluem e-mail, FTP, streaming de jogos, etc.</p>

<h3 class="font-bold mt-4 mb-2">Como a Internet funciona?</h3>
<ol class="list-decimal list-inside space-y-1 mb-3">
  <li>Seu dispositivo se conecta a um <strong>roteador</strong> (em casa, na escola ou via operadora).</li>
  <li>O roteador se conecta a um <strong>Provedor de Serviços de Internet (ISP)</strong>.</li>
  <li>O ISP conecta seu tráfego a redes maiores, até chegar ao servidor de destino.</li>
  <li>Os dados viajam em <strong>pacotes</strong> — pequenos fragmentos que se reagrupam no destino.</li>
  <li>O protocolo <strong>TCP/IP</strong> garante que os pacotes cheguem na ordem correta.</li>
</ol>
`;

const rawQuestions_L1: Question[] = [
  {
    id: 'AP034.1-L1-Q1', type: 'multiple_choice',
    prompt: 'O que é a Internet?',
    data: { options: [
      { id: 'a', text: 'Uma rede global de computadores interconectados que trocam dados usando protocolos padronizados.', correct: true },
      { id: 'b', text: 'Um único site, mantido por uma organização, onde as pessoas acessam páginas.' },
      { id: 'c', text: 'Um programa instalado no computador que serve para navegar entre páginas web e que precisa ser atualizado a cada nova página criada.' },
      { id: 'd', text: 'Um cabo de fibra óptica que liga os continentes e transporta todos os dados.' },
    ]},
    explanation: 'A Internet é uma rede de redes — bilhões de dispositivos conectados globalmente.',
  },
  {
    id: 'AP034.1-L1-Q2', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre Internet e World Wide Web (WWW)?',
    data: { options: [
      { id: 'a', text: 'A WWW é um serviço que funciona sobre a Internet; a Internet é a infraestrutura de rede.', correct: true },
      { id: 'b', text: 'São a mesma coisa, com dois nomes que a imprensa usa sem distinção.' },
      { id: 'c', text: 'A Internet é um site de acesso mantido pelas operadoras, e a WWW é o navegador que cada pessoa instala para abrir esse site.' },
      { id: 'd', text: 'A WWW é uma versão mais rápida da Internet, criada para trocar páginas.' },
    ]},
    explanation: 'A WWW (Web) é apenas um dos muitos serviços que rodam sobre a infraestrutura da Internet.',
  },
  {
    id: 'AP034.1-L1-Q3', type: 'true_false',
    prompt: 'A World Wide Web foi criada por Tim Berners-Lee em 1989.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Tim Berners-Lee propôs a WWW no CERN em 1989 e a tornou disponível em 1991.',
  },
  {
    id: 'AP034.1-L1-Q4', type: 'multiple_choice',
    prompt: 'Qual protocolo é o conjunto de regras que permite que dispositivos diferentes se comuniquem na Internet?',
    data: { options: [
      { id: 'a', text: 'TCP/IP', correct: true },
      { id: 'b', text: 'HTML' },
      { id: 'c', text: 'POP3' },
      { id: 'd', text: 'JPEG' },
    ]},
    explanation: 'TCP/IP é o protocolo fundamental da Internet. HTML é linguagem de marcação, POP3 é e-mail, JPEG é imagem.',
  },
  {
    id: 'AP034.1-L1-Q5', type: 'multiple_choice',
    prompt: 'Por que a Internet é considerada descentralizada?',
    data: { options: [
      { id: 'a', text: 'Porque não há um único computador central que controle tudo; se um servidor cai, outros assumem.', correct: true },
      { id: 'b', text: 'Porque cada pessoa mantém em casa o próprio servidor, guardando ali os seus dados e os de quem se conecta a ela.' },
      { id: 'c', text: 'Porque a Internet dispensa servidores: os aparelhos conversam direto.' },
      { id: 'd', text: 'Porque uma única empresa controla a rede inteira e decide o que circula.' },
    ]},
    explanation: 'A descentralização torna a Internet resiliente — não há ponto único de falha.',
  },
  {
    id: 'AP034.1-L1-Q6', type: 'matching',
    prompt: 'Associe cada conceito à sua definição.',
    data: {
      pairs: [
        { left: 'Internet', right: 'Rede global de computadores interconectados' },
        { left: 'WWW', right: 'Serviço de páginas web sobre a Internet' },
        { left: 'TCP/IP', right: 'Protocolo de comunicação padronizado' },
        { left: 'ISP', right: 'Provedor de Serviços de Internet' },
        { left: 'Roteador', right: 'Dispositivo que direciona tráfego de rede' },
      ],
    },
    explanation: 'Cada componente tem um papel específico no funcionamento da Internet.',
  },
  {
    id: 'AP034.1-L1-Q7', type: 'scenario',
    prompt: 'Seu amigo diz: "A Internet e a Web são a mesma coisa." Como você corrige essa afirmação?',
    data: { scenarios: [
      { id: 'a', text: 'A Internet é a infraestrutura de rede; a Web é um dos serviços que rodam sobre ela, como e-mail e FTP.', correct: true },
      { id: 'b', text: 'Ele está certo: os dois termos nomeiam exatamente a mesma tecnologia.' },
      { id: 'c', text: 'A Web é a infraestrutura de cabos e antenas, e a Internet é apenas um dos serviços que funcionam em cima dessa estrutura.' },
      { id: 'd', text: 'Nenhum dos dois tem relação: foram criados por equipes independentes.' },
    ]},
    explanation: 'Internet = rodovia. Web = um dos veículos que usa a rodovia.',
  },
  {
    id: 'AP034.1-L1-Q8', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre a estrutura da Internet.',
    data: {
      blanks: [
        { id: 'b1', answer: 'roteador', aceitas: ['router', 'modem roteador'], hint: 'Dispositivo que conecta sua casa à Internet' },
        { id: 'b2', answer: 'ISP', aceitas: ['provedor', 'provedor de acesso', 'provedor de internet'], hint: 'Empresa que fornece acesso à Internet (sigla de 3 letras)' },
        { id: 'b3', answer: 'pacotes', aceitas: ['pacotes de dados'], hint: 'Pequenos fragmentos de dados que viajam pela rede' },
      ],
    },
    explanation: 'Dispositivo → roteador → ISP → backbone. Dados viajam em pacotes que se reagrupam no destino.',
  },
];

const content_L2 = `
<h2 class="text-xl font-bold mb-3">Download e Upload</h2>
<p class="mb-3">O <strong>download</strong> e o <strong>upload</strong> são as duas direções fundamentais de transferência de dados na Internet. Tudo o que você faz online envolve uma dessas duas operações.</p>

<h3 class="font-bold mt-4 mb-2">Download (Baixar)</h3>
<p class="mb-3">Transferir um arquivo ou dados de um servidor remoto para o seu computador ou dispositivo.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Baixar um aplicativo da loja (Google Play, App Store)</li>
  <li>Salvar uma foto que você recebeu por e-mail</li>
  <li>Assistir a um vídeo no YouTube (streaming é download contínuo)</li>
  <li>Baixar um documento PDF de um site</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Upload (Enviar)</h3>
<p class="mb-3">Transferir um arquivo ou dados do seu computador para um servidor remoto.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Enviar uma foto para o Instagram ou Facebook</li>
  <li>Anexar um arquivo em um e-mail</li>
  <li>Publicar um vídeo no YouTube</li>
  <li>Salvar um documento no Google Drive</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Analogia dos pacotes</h3>
<p class="mb-3">Imagine que você está montando um quebra-cabeça. Cada peça é enviada separadamente (pacotes de dados) e, no destino, elas se encaixam para formar a imagem completa. O download recebe as peças; o upload envia as peças.</p>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Download</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Upload</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)">
    <td class="py-2">Servidor → Seu dispositivo</td>
    <td class="py-2">Seu dispositivo → Servidor</td>
  </tr>
  <tr>
    <td class="py-2">Receber/baixar dados</td>
    <td class="py-2">Enviar/subir dados</td>
  </tr>
</table>
`;

const rawQuestions_L2: Question[] = [
  {
    id: 'AP034.1-L2-Q1', type: 'multiple_choice',
    prompt: 'O que significa fazer um "download"?',
    data: { options: [
      { id: 'a', text: 'Transferir um arquivo de um servidor remoto para o seu computador.', correct: true },
      { id: 'b', text: 'Enviar um arquivo do seu computador para um servidor na Internet.' },
      { id: 'c', text: 'Apagar um arquivo do computador para liberar espaço em disco.' },
      { id: 'd', text: 'Compartilhar um arquivo anexando-o a uma mensagem de e-mail.' },
    ]},
    explanation: 'Download = receber/baixar dados de um servidor remoto para o seu dispositivo.',
  },
  {
    id: 'AP034.1-L2-Q2', type: 'multiple_choice',
    prompt: 'O que significa fazer um "upload"?',
    data: { options: [
      { id: 'a', text: 'Enviar um arquivo do seu computador para um servidor remoto.', correct: true },
      { id: 'b', text: 'Baixar um arquivo da Internet para guardá-lo no seu aparelho.' },
      { id: 'c', text: 'Formatar o disco rígido antes de gravar arquivos novos.' },
      { id: 'd', text: 'Atualizar o sistema operacional para a versão mais recente.' },
    ]},
    explanation: 'Upload = enviar dados do seu dispositivo para um servidor remoto.',
  },
  {
    id: 'AP034.1-L2-Q3', type: 'true_false',
    prompt: 'Assistir a um vídeo no YouTube envolve apenas upload, não download.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Streaming é uma forma de download contínuo — você recebe os dados do vídeo do servidor.',
  },
  {
    id: 'AP034.1-L2-Q4', type: 'scenario',
    prompt: 'Você tira uma foto e a publica no Instagram. Que tipo de transferência de dados ocorre?',
    data: { scenarios: [
      { id: 'a', text: 'Upload — você está enviando a foto do seu dispositivo para o servidor do Instagram.', correct: true },
      { id: 'b', text: 'Download, porque a foto sai do aplicativo e chega ao seu aparelho.' },
      { id: 'c', text: 'Nenhum dos dois, porque a foto continua guardada só no seu telefone.' },
      { id: 'd', text: 'Os dois ao mesmo tempo, embora só o download seja contado pela operadora.' },
    ]},
    explanation: 'Publicar conteúdo = enviar dados do seu dispositivo para um servidor = upload.',
  },
  {
    id: 'AP034.1-L2-Q5', type: 'matching',
    prompt: 'Associe cada ação à direção da transferência (download ou upload).',
    data: {
      pairs: [
        { left: 'Baixar um PDF', right: 'Download' },
        { left: 'Enviar foto por e-mail', right: 'Upload' },
        { left: 'Assistir Netflix', right: 'Download' },
        { left: 'Postar vídeo no YouTube', right: 'Upload' },
        { left: 'Baixar app da loja', right: 'Download' },
      ],
    },
    explanation: 'Receber = download. Enviar = upload.',
  },
  {
    id: 'AP034.1-L2-Q6', type: 'fill_blank',
    prompt: 'Complete: Quando você baixa um arquivo, os dados vão do _____ para o _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'servidor', aceitas: ['servidor web', 'host'], hint: 'De onde vem o arquivo' },
        { id: 'b2', answer: 'computador', aceitas: ['máquina', 'PC', 'dispositivo'], hint: 'Para onde vai o arquivo (ou dispositivo)' },
      ],
    },
    explanation: 'Download: servidor → computador. Upload: computador → servidor.',
  },
];

const content_L3 = `
<h2 class="text-xl font-bold mb-3">Website, E-mail e Vírus</h2>

<h3 class="font-bold mt-4 mb-2">Website (Site)</h3>
<p class="mb-3">Um <strong>website</strong> (ou site) é um conjunto de páginas web relacionadas, hospedadas em um servidor e acessíveis por um endereço (URL). Cada página é um arquivo escrito em HTML que o navegador interpreta e exibe.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Página web:</strong> Um único documento HTML acessível por uma URL.</li>
  <li><strong>Website:</strong> Conjunto de páginas interligadas sob o mesmo domínio.</li>
  <li><strong>Servidor web:</strong> Computador que armazena o site e o envia para quem o visita.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">E-mail (Correio Eletrônico)</h3>
<p class="mb-3">O <strong>e-mail</strong> é um sistema de troca de mensagens digitais entre usuários através de redes de computadores. É um dos serviços mais antigos e utilizados da Internet.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Endereço de e-mail:</strong> Formato: usuario@dominio.com</li>
  <li><strong>Protocolos:</strong> SMTP (envio), POP3/IMAP (recebimento)</li>
  <li><strong>Anexo:</strong> Arquivo enviado junto com a mensagem</li>
  <li><strong>Webmail:</strong> Acessar e-mail pelo navegador (Gmail, Outlook)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Vírus de Computador e Malware</h3>
<p class="mb-3">Um <strong>vírus de computador</strong> é um programa malicioso que se replica inserindo cópias de si mesmo em outros programas ou arquivos. <strong>Malware</strong> (de "malicious software") é o termo genérico para qualquer software malicioso.</p>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Tipo</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Descrição</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Vírus</strong></td><td class="py-2">Se replica anexando-se a arquivos executáveis</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Worm</strong></td><td class="py-2">Se espalha pela rede sem precisar de arquivo hospedeiro</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Trojan</strong></td><td class="py-2">Disfarça-se de programa legítimo</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Spyware</strong></td><td class="py-2">Espia a atividade do usuário sem consentimento</td></tr>
  <tr><td class="py-2"><strong>Ransomware</strong></td><td class="py-2">Criptografa arquivos e exige resgate</td></tr>
</table>

<p class="mb-3">Analogia: Vírus é como um resfriado — precisa de um "hospedeiro" (arquivo) para se espalhar. Worm é como uma infestação — se espalha sozinho pela rede.</p>
`;

const rawQuestions_L3: Question[] = [
  {
    id: 'AP034.1-L3-Q1', type: 'multiple_choice',
    prompt: 'O que é um website (site)?',
    data: { options: [
      { id: 'a', text: 'Um conjunto de páginas web relacionadas, hospedadas em um servidor e acessíveis por um endereço.', correct: true },
      { id: 'b', text: 'Um programa antivírus que examina os arquivos recebidos pela rede e apaga os que considerar suspeitos antes de abri-los.' },
      { id: 'c', text: 'Um tipo de vírus de computador que se espalha por mensagens.' },
      { id: 'd', text: 'Um cabo de rede que liga o computador ao equipamento do provedor.' },
    ]},
    explanation: 'Um site é um conjunto de páginas web interligadas, acessíveis por um domínio (URL).',
  },
  {
    id: 'AP034.1-L3-Q2', type: 'multiple_choice',
    prompt: 'O que é o e-mail?',
    data: { options: [
      { id: 'a', text: 'Um sistema de troca de mensagens digitais entre usuários através de redes de computadores.', correct: true },
      { id: 'b', text: 'Um tipo de site de busca que reúne endereços de outras páginas.' },
      { id: 'c', text: 'Um programa de edição de imagens usado para preparar fotos antes de publicá-las, ajustando tamanho, cor e nitidez.' },
      { id: 'd', text: 'Um formato de compactação que junta vários arquivos num só.' },
    ]},
    explanation: 'E-mail (correio eletrônico) é um serviço para enviar e receber mensagens digitais.',
  },
  {
    id: 'AP034.1-L3-Q3', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre vírus de computador e malware?',
    data: { options: [
      { id: 'a', text: 'Vírus é um tipo específico de malware; malware é o termo genérico para qualquer software malicioso.', correct: true },
      { id: 'b', text: 'Malware é o nome do programa de proteção instalado na máquina, e vírus é o software que tenta contornar essa proteção.' },
      { id: 'c', text: 'São exatamente a mesma coisa: dois nomes para o mesmo problema.' },
      { id: 'd', text: 'Vírus atinge somente mensagens de e-mail e malware somente sites visitados.' },
    ]},
    explanation: 'Malware é o termo guarda-chuva: vírus, worms, trojans, spyware e ransomware são todos tipos de malware.',
  },
  {
    id: 'AP034.1-L3-Q4', type: 'matching',
    prompt: 'Associe cada tipo de malware à sua descrição.',
    data: {
      pairs: [
        { left: 'Vírus', right: 'Se replica anexando-se a arquivos' },
        { left: 'Worm', right: 'Se espalha pela rede sem hospedeiro' },
        { left: 'Trojan', right: 'Disfarça-se de programa legítimo' },
        { left: 'Spyware', right: 'Espia a atividade do usuário' },
        { left: 'Ransomware', right: 'Criptografa arquivos e exige resgate' },
      ],
    },
    explanation: 'Cada tipo de malware tem um comportamento distinto de infecção e dano.',
  },
  {
    id: 'AP034.1-L3-Q5', type: 'true_false',
    prompt: 'Um website precisa estar hospedado em um servidor para ser acessível pela Internet.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Sim — o servidor armazena os arquivos do site e os envia para os visitantes.',
  },
  {
    id: 'AP034.1-L3-Q6', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre e-mail.',
    data: {
      blanks: [
        { id: 'b1', answer: 'SMTP', hint: 'Protocolo usado para enviar e-mails (sigla)' },
        { id: 'b2', answer: 'webmail', aceitas: ['web mail', 'e-mail pelo navegador'], hint: 'Acessar e-mail pelo navegador (ex: Gmail)' },
      ],
    },
    explanation: 'SMTP envia mensagens. Webmail é o acesso pelo navegador sem programa instalado.',
  },
  {
    id: 'AP034.1-L3-Q7', type: 'scenario',
    prompt: 'Você baixa um programa que parece ser um antivírus gratuito, mas ele começa a criptografar seus arquivos e pede pagamento. Que tipo de malware é?',
    data: { scenarios: [
      { id: 'a', text: 'Ransomware — criptografa arquivos e exige resgate.', correct: true },
      { id: 'b', text: 'Spyware — apenas espia sua atividade.' },
      { id: 'c', text: 'Vírus — se replica em arquivos executáveis.' },
      { id: 'd', text: 'Não é malware, é um antivírus legítimo.' },
    ]},
    explanation: 'Ransomware sequestra dados por criptografia e exige pagamento para liberá-los.',
  },
];

// ═══════════════════════════════════════════════════════════
// MODULE 2 — SERVIÇOS E FERRAMENTAS
// ═══════════════════════════════════════════════════════════

const content_2L1 = `
<h2 class="text-xl font-bold mb-3">Webmail, POP3 e IMAP</h2>
<p class="mb-3">Existem três formas principais de acessar e gerenciar seus e-mails: <strong>Webmail</strong>, <strong>POP3</strong> e <strong>IMAP</strong>. Cada um tem características distintas.</p>

<h3 class="font-bold mt-4 mb-2">Webmail</h3>
<p class="mb-3">Acessa o e-mail diretamente pelo navegador, sem precisar instalar nenhum programa. As mensagens ficam no servidor.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Exemplos: Gmail, Outlook.com, Yahoo Mail</li>
  <li>Vantagem: acessa de qualquer dispositivo com navegador</li>
  <li>Desvantagem: precisa de conexão com a Internet para ler</li>
</ul>

<h3 class="font-bold mt-4 mb-2">POP3 (Post Office Protocol v3)</h3>
<p class="mb-3">Baixa as mensagens do servidor para o seu computador e, por padrão, <strong>remove-as do servidor</strong>.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Vantagem: libera espaço no servidor; lê offline depois de baixar</li>
  <li>Desvantagem: não sincroniza entre dispositivos — se baixar no PC, não verá no celular</li>
</ul>

<h3 class="font-bold mt-4 mb-2">IMAP (Internet Message Access Protocol)</h3>
<p class="mb-3">Sincroniza as mensagens entre o servidor e todos os seus dispositivos. As mensagens <strong>permanecem no servidor</strong>.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Vantagem: mesma caixa em todos os dispositivos; marcações de lido/não-lido sincronizam</li>
  <li>Desvantagem: precisa de conexão para acessar; ocupa espaço no servidor</li>
</ul>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Recurso</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Webmail</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">POP3</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">IMAP</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Mensagens no servidor</td><td class="py-2">Sim</td><td class="py-2">Não (remove)</td><td class="py-2">Sim</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Sincroniza dispositivos</td><td class="py-2">Sim</td><td class="py-2">Não</td><td class="py-2">Sim</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Precisa de navegador</td><td class="py-2">Sim</td><td class="py-2">Não</td><td class="py-2">Não</td></tr>
  <tr><td class="py-2">Leitura offline</td><td class="py-2">Não</td><td class="py-2">Sim</td><td class="py-2">Parcial</td></tr>
</table>
`;

const rawQuestions_2L1: Question[] = [
  {
    id: 'AP034.2-L1-Q1', type: 'multiple_choice',
    prompt: 'Qual protocolo permite baixar e-mails do servidor para o cliente, removendo-os do servidor?',
    data: { options: [
      { id: 'a', text: 'POP3', correct: true },
      { id: 'b', text: 'IMAP' },
      { id: 'c', text: 'HTTP' },
      { id: 'd', text: 'SMTP' },
    ]},
    explanation: 'POP3 baixa e remove do servidor. IMAP sincroniza pastas. SMTP envia. HTTP é web.',
  },
  {
    id: 'AP034.2-L1-Q2', type: 'multiple_choice',
    prompt: 'Qual é a principal vantagem do IMAP sobre o POP3?',
    data: { options: [
      { id: 'a', text: 'Permite acessar e sincronizar as mesmas mensagens de múltiplos dispositivos.', correct: true },
      { id: 'b', text: 'É mais rápido para enviar mensagens, por manter conexão sempre aberta.' },
      { id: 'c', text: 'Dispensa senha, porque a autenticação fica salva no próprio servidor.' },
      { id: 'd', text: 'Compacta os anexos sozinho, poupando espaço na caixa de entrada.' },
    ]},
    explanation: 'IMAP mantém as mensagens no servidor, permitindo sincronização entre dispositivos.',
  },
  {
    id: 'AP034.2-L1-Q3', type: 'multiple_choice',
    prompt: 'Qual protocolo é usado para ENVIAR e-mails?',
    data: { options: [
      { id: 'a', text: 'SMTP', correct: true },
      { id: 'b', text: 'POP3' },
      { id: 'c', text: 'IMAP' },
      { id: 'd', text: 'FTP' },
    ]},
    explanation: 'SMTP (Simple Mail Transfer Protocol) é o protocolo de envio. POP3 e IMAP são de recebimento.',
  },
  {
    id: 'AP034.2-L1-Q4', type: 'true_false',
    prompt: 'O webmail permite acessar e-mails pelo navegador sem instalar nenhum programa.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Webmail (Gmail, Outlook.com) é acessado pelo navegador. As mensagens ficam no servidor.',
  },
  {
    id: 'AP034.2-L1-Q5', type: 'scenario',
    prompt: 'Você quer ler seus e-mails no celular E no computador, mantendo tudo sincronizado (se ler no celular, marca como lido no PC também). Qual protocolo escolher?',
    data: { scenarios: [
      { id: 'a', text: 'IMAP — sincroniza as mensagens entre todos os dispositivos.', correct: true },
      { id: 'b', text: 'POP3 — baixa e remove do servidor, então cada dispositivo tem sua própria cópia.' },
      { id: 'c', text: 'SMTP — é o protocolo de envio, não de recebimento.' },
      { id: 'd', text: 'HTTP — é o protocolo da web, não de e-mail.' },
    ]},
    explanation: 'IMAP mantém tudo no servidor e sincroniza entre dispositivos. POP3 não sincroniza.',
  },
  {
    id: 'AP034.2-L1-Q6', type: 'matching',
    prompt: 'Associe cada protocolo/serviço à sua função.',
    data: {
      pairs: [
        { left: 'SMTP', right: 'Enviar e-mails' },
        { left: 'POP3', right: 'Baixar e-mails (remove do servidor)' },
        { left: 'IMAP', right: 'Sincronizar e-mails entre dispositivos' },
        { left: 'Webmail', right: 'Acessar e-mail pelo navegador' },
      ],
    },
    explanation: 'Cada protocolo tem uma função específica no ecossistema de e-mail.',
  },
  {
    id: 'AP034.2-L1-Q7', type: 'fill_blank',
    prompt: 'Complete: POP3 _____ as mensagens do servidor, enquanto IMAP as _____ no servidor.',
    data: {
      blanks: [
        { id: 'b1', answer: 'remove', aceitas: ['apaga', 'exclui', 'deleta', 'retira'], hint: 'O que POP3 faz com as mensagens após baixar' },
        { id: 'b2', answer: 'mantém', aceitas: ['conserva', 'guarda', 'preserva', 'deixa'], hint: 'O que IMAP faz com as mensagens (sinônimo de preservar)' },
      ],
    },
    explanation: 'POP3 remove as mensagens do servidor após baixar. IMAP as mantém para sincronização.',
  },
];

const content_2L2 = `
<h2 class="text-xl font-bold mb-3">Navegador, Streaming, Busca e Antivírus</h2>

<h3 class="font-bold mt-4 mb-2">Navegador Web (Browser)</h3>
<p class="mb-3">Um <strong>navegador web</strong> é um programa que permite acessar, renderizar e interagir com páginas da World Wide Web. Ele interpreta HTML, CSS e JavaScript para exibir páginas.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Exemplos: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari</li>
  <li>Função: traduzir código (HTML/CSS/JS) em uma página visual e interativa</li>
  <li>Recursos: favoritos, histórico, abas, extensões, modo anônimo</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Streaming de Mídia</h3>
<p class="mb-3"><strong>Streaming</strong> é a transmissão contínua de áudio ou vídeo pela Internet, permitindo assistir/ouvir enquanto o conteúdo carrega — sem precisar baixar o arquivo completo primeiro.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Exemplos: YouTube, Netflix, Spotify, Twitch</li>
  <li>Vantagem: consumo imediato, sem esperar o download completo</li>
  <li>Como funciona: o servidor envia os dados em pequenos fragmentos contínuos (buffer)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Site de Busca (Motor de Busca)</h3>
<p class="mb-3">Um <strong>site de busca</strong> é um sistema que indexa bilhões de páginas da web e permite encontrar informações por palavras-chave.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Exemplos: Google, Bing, DuckDuckGo</li>
  <li>Como funciona: rastreadores (crawlers) visitam páginas e criam um índice; ao buscar, o motor consulta o índice</li>
  <li>Resultados são ordenados por relevância (algoritmo do motor)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Antivírus</h3>
<p class="mb-3">Um <strong>antivírus</strong> é um programa que detecta, previne e remove software malicioso (malware) do computador.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Exemplos: Windows Defender, Avast, Kaspersky, Norton</li>
  <li>Função: escanear arquivos em busca de assinaturas de vírus conhecidas</li>
  <li><strong>Atualização é essencial:</strong> novos vírus surgem diariamente; sem atualizar a base de dados, o antivírus não reconhece ameaças novas</li>
  <li>Proteção em tempo real: monitora arquivos que são abertos, baixados ou executados</li>
</ul>
`;

const rawQuestions_2L2: Question[] = [
  {
    id: 'AP034.2-L2-Q1', type: 'multiple_choice',
    prompt: 'O que é um navegador web (browser)?',
    data: { options: [
      { id: 'a', text: 'Um programa que permite acessar, renderizar e interagir com páginas da World Wide Web.', correct: true },
      { id: 'b', text: 'Um dispositivo físico que liga o computador à rede da operadora.' },
      { id: 'c', text: 'Um protocolo de transferência de arquivos entre servidores distantes, usado quando o arquivo é grande demais para o e-mail.' },
      { id: 'd', text: 'Um sistema que procura vírus automaticamente nos arquivos recebidos.' },
    ]},
    explanation: 'Navegadores como Chrome, Firefox e Edge interpretam HTML/CSS/JS para exibir páginas web.',
  },
  {
    id: 'AP034.2-L2-Q2', type: 'multiple_choice',
    prompt: 'O que é streaming de mídia?',
    data: { options: [
      { id: 'a', text: 'Transmissão contínua de áudio ou vídeo pela Internet, permitindo assistir enquanto carrega.', correct: true },
      { id: 'b', text: 'Baixar o arquivo inteiro no aparelho antes de poder começar a assistir, o que exige espaço livre igual ao tamanho do vídeo.' },
      { id: 'c', text: 'Um tipo de vírus que contamina arquivos de música e de vídeo.' },
      { id: 'd', text: 'Um formato de compactação que reduz o tamanho de imagens e vídeos.' },
    ]},
    explanation: 'Streaming entrega o conteúdo em tempo real, sem precisar baixar o arquivo inteiro primeiro.',
  },
  {
    id: 'AP034.2-L2-Q3', type: 'multiple_choice',
    prompt: 'O que é um site de busca (motor de busca)?',
    data: { options: [
      { id: 'a', text: 'Um sistema que indexa páginas da web e permite encontrar informações por palavras-chave.', correct: true },
      { id: 'b', text: 'Um site de vendas que reúne produtos de várias lojas diferentes.' },
      { id: 'c', text: 'Um programa de e-mail que organiza as mensagens recebidas em pastas e avisa quando chega algo de um remetente conhecido.' },
      { id: 'd', text: 'Um antivírus que verifica cada página antes de ela ser exibida.' },
    ]},
    explanation: 'Sites como Google e Bing indexam bilhões de páginas e retornam resultados por relevância.',
  },
  {
    id: 'AP034.2-L2-Q4', type: 'multiple_choice',
    prompt: 'Por que é importante ter um antivírus atualizado?',
    data: { options: [
      { id: 'a', text: 'Para detectar e remover novas ameaças que ainda não eram conhecidas.', correct: true },
      { id: 'b', text: 'Para acelerar a conexão com a Internet, que perde velocidade com o uso.' },
      { id: 'c', text: 'Para compactar os arquivos guardados e economizar espaço em disco.' },
      { id: 'd', text: 'Para traduzir sozinho as páginas escritas em outros idiomas.' },
    ]},
    explanation: 'Novos vírus surgem diariamente; a atualização permite reconhecer as ameaças mais recentes.',
  },
  {
    id: 'AP034.2-L2-Q5', type: 'true_false',
    prompt: 'O streaming exige que você baixe o arquivo completo do vídeo antes de começar a assistir.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Streaming permite assistir enquanto carrega — não precisa baixar o arquivo completo.',
  },
  {
    id: 'AP034.2-L2-Q6', type: 'matching',
    prompt: 'Associe cada ferramenta à sua função.',
    data: {
      pairs: [
        { left: 'Navegador', right: 'Acessar e renderizar páginas web' },
        { left: 'Streaming', right: 'Transmitir áudio/vídeo em tempo real' },
        { left: 'Motor de busca', right: 'Encontrar informações por palavras-chave' },
        { left: 'Antivírus', right: 'Detectar e remover software malicioso' },
      ],
    },
    explanation: 'Cada ferramenta tem um propósito específico no uso seguro e eficiente da Internet.',
  },
  {
    id: 'AP034.2-L2-Q7', type: 'scenario',
    prompt: 'Você precisa encontrar informações sobre o planeta Marte para um trabalho escolar. Qual é a melhor abordagem?',
    data: { scenarios: [
      { id: 'a', text: 'Usar um motor de busca como o Google, digitando "planeta Marte" como palavra-chave.', correct: true },
      { id: 'b', text: 'Enviar um e-mail a todos os amigos perguntando o que sabem sobre Marte e reunir depois as respostas que chegarem.' },
      { id: 'c', text: 'Baixar todos os sites da rede e procurar a resposta um por um.' },
      { id: 'd', text: 'Instalar um antivírus e aguardar que ele localize a informação.' },
    ]},
    explanation: 'Motores de busca indexam bilhões de páginas e retornam resultados relevantes por palavras-chave.',
  },
  {
    id: 'AP034.2-L2-Q8', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre antivírus.',
    data: {
      blanks: [
        { id: 'b1', answer: 'assinaturas', aceitas: ['assinações', 'assinatura de vírus'], hint: 'Padrões que o antivírus guarda para reconhecer cada ameaça' },
        { id: 'b2', answer: 'tempo real', aceitas: ['em tempo real'], hint: 'Tipo de proteção que monitora arquivos continuamente (2 palavras)' },
      ],
    },
    explanation: 'O antivírus usa assinaturas para reconhecer ameaças e proteção em tempo real para monitorar continuamente.',
  },
];

// ═══════════════════════════════════════════════════════════
// MODULE 3 — HISTÓRIA DA INTERNET
// ═══════════════════════════════════════════════════════════

const content_3L1 = `
<h2 class="text-xl font-bold mb-3">Linha do Tempo da Internet</h2>
<p class="mb-3">A Internet não surgiu do dia para a noite. Ela é o resultado de décadas de desenvolvimento científico e tecnológico.</p>

<h3 class="font-bold mt-4 mb-2">1969 — ARPANET</h3>
<p class="mb-3">A <strong>ARPANET</strong> (Advanced Research Projects Agency Network) foi a primeira rede de computadores de larga escala, criada pelo Departamento de Defesa dos EUA. Conectou quatro universidades e usou o protocolo NCP, predecessor do TCP/IP.</p>

<h3 class="font-bold mt-4 mb-2">1983 — TCP/IP</h3>
<p class="mb-3">Em 1º de janeiro de 1983, a ARPANET adotou o protocolo <strong>TCP/IP</strong>, criado por Vint Cerf e Bob Kahn. Este é considerado o "nascimento" da Internet moderna, pois TCP/IP permitiu que redes diferentes se interconectassem.</p>

<h3 class="font-bold mt-4 mb-2">1989-1991 — World Wide Web</h3>
<p class="mb-3"><strong>Tim Berners-Lee</strong>, trabalhando no <strong>CERN</strong> (Organização Europeia para a Pesquisa Nuclear), propôs a World Wide Web em 1989. Em 1991, o primeiro site foi publicado. A WWW tornou a Internet acessível para pessoas comuns, não apenas cientistas.</p>

<h3 class="font-bold mt-4 mb-2">1993 — Navegador Mosaic</h3>
<p class="mb-3">O <strong>Mosaic</strong>, desenvolvido por Marc Andreessen, foi o primeiro navegador gráfico popular. Tornou a Web visual e fácil de usar, popularizando a Internet entre o público geral.</p>

<h3 class="font-bold mt-4 mb-2">1998 — Google</h3>
<p class="mb-3">Larry Page e Sergey Brin fundaram o <strong>Google</strong>, revolucionando a busca na web com o algoritmo PageRank, que ordena resultados por relevância.</p>

<h3 class="font-bold mt-4 mb-2">2004+ — Redes Sociais</h3>
<p class="mb-3">O lançamento do <strong>Facebook</strong> em 2004 marcou a popularização das redes sociais. YouTube (2005), Twitter (2006) e Instagram (2010) seguiram, transformando a Internet em uma plataforma social.</p>

<h3 class="font-bold mt-4 mb-2">2010s — Mobile e Nuvem</h3>
<p class="mb-3">A popularização dos smartphones tornou a Internet ubíqua. Serviços em nuvem (AWS, Google Cloud) permitiram que aplicativos escalassem globalmente.</p>

<h3 class="font-bold mt-4 mb-2">2020s — IA Generativa</h3>
<p class="mb-3">O surgimento de modelos de IA generativa (ChatGPT, DALL-E) marcou uma nova era, onde a Internet não apenas conecta pessoas, mas também gera conteúdo.</p>
`;

const rawQuestions_3L1: Question[] = [
  {
    id: 'AP034.3-L1-Q1', type: 'ordering',
    prompt: 'Ordene os eventos da história da Internet do mais antigo ao mais recente.',
    data: {
      items: [
        /* Os anos saíram do enunciado de propósito: com eles na tela, ordenar
           era ler números, não saber a história. */
        { id: 'a', text: 'Criação da ARPANET, a rede que ligou as primeiras universidades', order: 1 },
        { id: 'b', text: 'Adoção do TCP/IP como protocolo único da rede', order: 2 },
        { id: 'c', text: 'Criação da WWW por Tim Berners-Lee, no CERN', order: 3 },
        { id: 'd', text: 'Lançamento do Google, que reorganizou a busca na web', order: 4 },
        { id: 'e', text: 'Popularização das redes sociais e do conteúdo feito por usuários', order: 5 },
      ],
    },
    explanation: 'ARPANET (1969) → TCP/IP (1983) → WWW (1989) → Google (1998) → redes sociais (2004+). Cada marco construiu sobre o anterior: primeiro a rede física, depois a língua comum entre as máquinas, depois as páginas ligadas entre si, depois como encontrá-las, e por fim as pessoas publicando nelas.',
  },
  {
    id: 'AP034.3-L1-Q2', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre a história da Internet.',
    data: {
      blanks: [
        { id: 'b1', answer: 'ARPANET', hint: 'Rede precursora da Internet, criada em 1969' },
        { id: 'b2', answer: 'Tim Berners-Lee', aceitas: ['Tim Berners Lee', 'Berners-Lee', 'Berners Lee'], hint: 'Criador da World Wide Web' },
        { id: 'b3', answer: 'CERN', hint: 'Instituição onde a WWW foi desenvolvida' },
      ],
    },
    explanation: 'ARPANET foi a rede precursora; Tim Berners-Lee criou a WWW no CERN em 1989/1991.',
  },
  {
    id: 'AP034.3-L1-Q3', type: 'multiple_choice',
    prompt: 'Quem criou o protocolo TCP/IP?',
    data: { options: [
      { id: 'a', text: 'Vint Cerf e Bob Kahn', correct: true },
      { id: 'b', text: 'Tim Berners-Lee' },
      { id: 'c', text: 'Larry Page e Sergey Brin' },
      { id: 'd', text: 'Marc Andreessen' },
    ]},
    explanation: 'Vint Cerf e Bob Kahn projetaram o TCP/IP nos anos 70, fundamental para a Internet moderna.',
  },
  {
    id: 'AP034.3-L1-Q4', type: 'multiple_choice',
    prompt: 'Qual foi o primeiro navegador web gráfico popular?',
    data: { options: [
      { id: 'a', text: 'Mosaic (1993)', correct: true },
      { id: 'b', text: 'Google Chrome (2008)' },
      { id: 'c', text: 'Internet Explorer (1995)' },
      { id: 'd', text: 'Firefox (2004)' },
    ]},
    explanation: 'Mosaic, desenvolvido por Marc Andreessen, foi o primeiro navegador gráfico popular.',
  },
  {
    id: 'AP034.3-L1-Q5', type: 'matching',
    prompt: 'Associe cada pessoa/organização à sua contribuição.',
    data: {
      pairs: [
        { left: 'Tim Berners-Lee', right: 'Criou a WWW no CERN (1989)' },
        { left: 'Vint Cerf e Bob Kahn', right: 'Criaram o TCP/IP' },
        { left: 'Larry Page e Sergey Brin', right: 'Fundaram o Google (1998)' },
        { left: 'Marc Andreessen', right: 'Criou o navegador Mosaic (1993)' },
        { left: 'ARPANET', right: 'Primeira rede de larga escala (1969)' },
      ],
    },
    explanation: 'Cada figura teve um papel crucial na evolução da Internet.',
  },
  {
    id: 'AP034.3-L1-Q6', type: 'true_false',
    prompt: 'A World Wide Web foi criada antes da ARPANET.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'ARPANET (1969) veio 20 anos antes da WWW (1989). A WWW roda sobre a Internet criada pela ARPANET.',
  },
  {
    id: 'AP034.3-L1-Q7', type: 'scenario',
    prompt: 'Alguém diz: "A Internet e a Web nasceram juntas em 1989." Como você corrige?',
    data: { scenarios: [
      { id: 'a', text: 'A Internet começou em 1969 com a ARPANET; a Web foi criada em 1989 como um serviço sobre a Internet.', correct: true },
      { id: 'b', text: 'Está correto: as duas foram criadas na mesma época, pela mesma equipe e para resolver o mesmo problema de comunicação.' },
      { id: 'c', text: 'A Web veio primeiro, e a Internet surgiu depois para dar suporte a ela.' },
      { id: 'd', text: 'As duas foram criadas pela mesma empresa que hoje mantém o buscador.' },
    ]},
    explanation: 'Internet (1969, ARPANET) → TCP/IP (1983) → WWW (1989). A Web é um serviço da Internet.',
  },
];

// ═══════════════════════════════════════════════════════════
// MODULE 4 — ANTIVÍRUS E AMEAÇAS
// ═══════════════════════════════════════════════════════════

const content_4L1 = `
<h2 class="text-xl font-bold mb-3">Ameaças Online e Proteção</h2>

<h3 class="font-bold mt-4 mb-2">Formas comuns de receber ameaças</h3>
<p class="mb-3">Existem várias vias pelas quais seu computador pode ser infectado:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>E-mails com anexos infectados:</strong> Abrir um anexo de remetente desconhecido pode executar malware.</li>
  <li><strong>Downloads de sites não confiáveis:</strong> Baixar arquivos de fontes suspeitas pode trazer vírus ocultos.</li>
  <li><strong>Pendrives e mídias removíveis:</strong> Dispositivos USB infectados podem espalhar malware ao serem conectados.</li>
  <li><strong>Pop-ups maliciosos:</strong> Cliques em pop-ups podem redirecionar para sites de download de malware.</li>
  <li><strong>Phishing:</strong> E-mails ou sites falsos que enganam o usuário para revelar senhas e dados pessoais.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Por que atualizar o antivírus?</h3>
<p class="mb-3">Novos vírus são criados <strong>diariamente</strong> — milhares deles. O antivírus funciona comparando arquivos com uma <strong>base de assinaturas</strong> de ameaças conhecidas. Sem atualização, ele só reconhece ameaças antigas e fica cego para as novas.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Atualizações baixam novas assinaturas de vírus recentemente descobertos</li>
  <li>Algumas atualizações incluem heurística melhorada (detectar comportamento suspeito)</li>
  <li>Recomenda-se: atualização automática diária + verificação completa semanal</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Como um computador desprotegido dissemina vírus</h3>
<p class="mb-3">Um computador sem antivírus ou com antivírus desatualizado pode:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Enviar cópias do vírus automaticamente para todos os contatos de e-mail</li>
  <li>Infectar outros dispositivos na mesma rede (Wi-Fi, LAN)</li>
  <li>Transformar-se em um "zumbi" que participa de ataques DDoS sem o dono saber</li>
  <li>Espalhar malware via pendrives conectados</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Prejuízos causados por vírus</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Perda de dados:</strong> Arquivos apagados ou corrompidos</li>
  <li><strong>Roubo de senhas:</strong> Spyware captura credenciais digitadas</li>
  <li><strong>Lentidão:</strong> O sistema fica lento por recursos consumidos pelo malware</li>
  <li><strong>Dano ao sistema:</strong> Sistema operacional pode ficar inutilizável</li>
  <li><strong>Roubo de identidade:</strong> Dados pessoais são coletados para fraude</li>
  <li><strong>Sequestro de arquivos:</strong> Ransomware criptografa tudo e exige resgate</li>
</ul>
`;

const rawQuestions_4L1: Question[] = [
  {
    id: 'AP034.4-L1-Q1', type: 'multiple_choice',
    prompt: 'Quais são formas comuns de receber ameaças online?',
    data: { options: [
      { id: 'a', text: 'E-mails com anexos infectados, downloads de sites não confiáveis e pendrives contaminados.', correct: true },
      { id: 'b', text: 'Apenas navegando em sites conhecidos e de aparência confiável.' },
      { id: 'c', text: 'Desligando o computador à noite, já que nenhum programa consegue se instalar com a máquina fora da tomada.' },
      { id: 'd', text: 'Usando senhas longas, que impedem qualquer programa de entrar.' },
    ]},
    explanation: 'As principais vias de infecção são anexos de e-mail, downloads suspeitos e mídias removíveis.',
  },
  {
    id: 'AP034.4-L1-Q2', type: 'multiple_choice',
    prompt: 'Por que a atualização do antivírus é essencial?',
    data: { options: [
      { id: 'a', text: 'Novos vírus são criados diariamente; sem atualização, o antivírus não os reconhece.', correct: true },
      { id: 'b', text: 'Para melhorar a velocidade da Internet, que vai caindo conforme o antivírus acumula registros de verificação.' },
      { id: 'c', text: 'Para liberar espaço no disco ocupado pela base antiga de ameaças.' },
      { id: 'd', text: 'Para atualizar o navegador junto com o restante do sistema.' },
    ]},
    explanation: 'A base de dados de assinaturas precisa estar atualizada para identificar ameaças recentes.',
  },
  {
    id: 'AP034.4-L1-Q3', type: 'multiple_choice',
    prompt: 'Como um computador desprotegido pode disseminar vírus?',
    data: { options: [
      { id: 'a', text: 'Enviando cópias do vírus automaticamente para contatos da rede e dispositivos conectados.', correct: true },
      { id: 'b', text: 'Desligando-se sozinho sempre que a máquina fica ociosa.' },
      { id: 'c', text: 'Formatando o disco rígido assim que o computador é ligado.' },
      { id: 'd', text: 'Aumentando o volume do som, abrindo janelas de propaganda e trocando a página inicial do navegador sozinho.' },
    ]},
    explanation: 'Vírus e worms se replicam automaticamente, infectando outros dispositivos na mesma rede.',
  },
  {
    id: 'AP034.4-L1-Q4', type: 'multiple_choice',
    prompt: 'Quais são alguns prejuízos causados por vírus de computador?',
    data: { options: [
      { id: 'a', text: 'Perda de dados, roubo de senhas, lentidão, dano ao sistema e comprometimento de informações pessoais.', correct: true },
      { id: 'b', text: 'Apenas melhoria de desempenho, já que o vírus organiza os arquivos.' },
      { id: 'c', text: 'Aumento da velocidade da Internet, já que o vírus encerra os programas em segundo plano para usar a máquina.' },
      { id: 'd', text: 'Nenhum prejuízo real, porque os antivírus atuais bloqueiam tudo sozinhos.' },
    ]},
    explanation: 'Vírus podem apagar arquivos, roubar dados, tornar o sistema lento e até inutilizar o computador.',
  },
  {
    id: 'AP034.4-L1-Q5', type: 'matching',
    prompt: 'Associe cada tipo de ameaça à sua descrição.',
    data: {
      pairs: [
        { left: 'Phishing', right: 'Engana o usuário para revelar dados' },
        { left: 'Ransomware', right: 'Criptografa arquivos e exige resgate' },
        { left: 'Spyware', right: 'Espia a atividade sem consentimento' },
        { left: 'Worm', right: 'Se espalha pela rede automaticamente' },
        { left: 'Trojan', right: 'Disfarça-se de programa legítimo' },
      ],
    },
    explanation: 'Cada tipo de ameaça tem um mecanismo de ataque diferente.',
  },
  {
    id: 'AP034.4-L1-Q6', type: 'scenario',
    prompt: 'Você recebe um e-mail de "seu banco" pedindo para clicar num link e digitar sua senha "por segurança". O que fazer?',
    data: { scenarios: [
      { id: 'a', text: 'Não clicar. É phishing — bancos nunca pedem senhas por e-mail. Excluir e avisar um responsável.', correct: true },
      { id: 'b', text: 'Clicar e digitar a senha, já que a mensagem tem a aparência de oficial.' },
      { id: 'c', text: 'Responder ao remetente informando a senha para resolver logo o problema.' },
      { id: 'd', text: 'Encaminhar aos amigos para que eles confiram se receberam o mesmo aviso.' },
    ]},
    explanation: 'Phishing usa urgência e aparência oficial para enganar. Bancos nunca pedem senhas por e-mail.',
  },
  {
    id: 'AP034.4-L1-Q7', type: 'ordering',
    prompt: 'Ordene as etapas de uma infecção por vírus, da entrada ao dano.',
    data: {
      items: [
        { id: 'a', text: 'O usuário abre um anexo infectado ou visita um site malicioso', order: 1 },
        { id: 'b', text: 'O vírus é executado no computador', order: 2 },
        { id: 'c', text: 'O vírus se replica e se espalha', order: 3 },
        { id: 'd', text: 'O sistema sofre lentidão, perda de dados ou roubo de informações', order: 4 },
      ],
    },
    explanation: 'A sequência é: entrada → execução → replicação → dano.',
  },
  {
    id: 'AP034.4-L1-Q8', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre proteção.',
    data: {
      blanks: [
        { id: 'b1', answer: 'antivírus', aceitas: ['anti-vírus', 'programa antivírus'], hint: 'Programa que protege contra malware' },
        { id: 'b2', answer: 'phishing', hint: 'Golpe que engana o usuário por e-mail ou site falso' },
        { id: 'b3', answer: 'atualização', aceitas: ['atualizações', 'update'], hint: 'Ação essencial para que o antivírus reconheça novas ameaças' },
      ],
    },
    explanation: 'Antivírus protege, phishing é o golpe, e a atualização mantém a proteção eficaz.',
  },
  {
    id: 'AP034.4-L1-Q9', type: 'true_false',
    prompt: 'Um pendrive conectado a um computador infectado pode espalhar o vírus para outros computadores.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Mídias removíveis são uma das vias mais comuns de propagação de vírus entre computadores.',
  },
];

// ═══════════════════════════════════════════════════════════
// MODULE 5 — FILTROS E PACTO DE USO
// ═══════════════════════════════════════════════════════════

const content_5L1 = `
<h2 class="text-xl font-bold mb-3">Pacto de Uso Consciente da Internet</h2>
<p class="mb-3">O <strong>Pacto de Uso Consciente</strong> é um compromisso pessoal que cada desbravador faz com si mesmo, sua família e Deus para usar a Internet de forma segura, responsável e edificante.</p>

<h3 class="font-bold mt-4 mb-2">Os 9 compromissos do Pacto:</h3>
<ol class="list-decimal list-inside space-y-2 mb-3">
  <li><strong>Não revelar informações pessoais desnecessárias</strong> — nunca compartilhar endereço, telefone, senha ou dados familiares online.</li>
  <li><strong>Pessoas online podem não ser quem afirmam ser</strong> — nem todos na Internet são confiáveis; desconfie de estranhos.</li>
  <li><strong>Nunca encontrar um amigo virtual sem responsável</strong> — se for se encontrar, sempre com um adulto responsável presente.</li>
  <li><strong>Não responder a contatos suspeitos</strong> — ignore mensagens de desconhecidos; não clique em links suspeitos.</li>
  <li><strong>Pedir ajuda ao perceber algo anormal</strong> — se algo parecer estranho ou ameaçador, interrompa e avise um adulto.</li>
  <li><strong>Estabelecer tempo semanal de uso</strong> — definir um limite de horas por semana para usar a Internet.</li>
  <li><strong>Definir sites aceitáveis e inaceitáveis</strong> — combinar com os pais quais sites são apropriados e quais não são.</li>
  <li><strong>Selecionar no máximo duas redes sociais</strong> — limitar a presença em redes sociais para reduzir riscos.</li>
  <li><strong>Definir limite diário para redes sociais</strong> — estabelecer um tempo máximo por dia para acessar redes sociais.</li>
</ol>

<h3 class="font-bold mt-4 mb-2">Princípio bíblico: Filipenses 4:8</h3>
<p class="mb-3">O Pacto se baseia no princípio de Filipenses 4:8: devemos pensar em tudo o que é <strong>verdadeiro, honesto, justo, puro, amável e de boa fama</strong>. Isso se aplica ao que vemos, ouvimos e compartilhamos na Internet.</p>
`;

// ═══════════════════════════════════════════════════════════
// MODULE 6 — NAVEGAÇÃO E PESQUISA
// ═══════════════════════════════════════════════════════════

const content_6L1 = `
<h2 class="text-xl font-bold mb-3">Navegação e Pesquisa na Internet</h2>
<p class="mb-3">Navegar é usar um <strong>navegador</strong> para chegar a uma página. Antes de clicar em qualquer coisa, vale aprender a ler o endereço — é ele que diz para onde você está indo de verdade.</p>

<h3 class="font-bold mt-4 mb-2">As quatro partes de um endereço</h3>
<p class="mb-2">Em <code>https://www.bibliaonline.com.br/acf/fp/4?versiculo=8</code>:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>https://</strong> — o protocolo. O "s" é de seguro: a conversa vai criptografada. Sem ele, qualquer pessoa na mesma rede lê o que você digitar.</li>
  <li><strong>www.bibliaonline.com.br</strong> — o nome do site. O que importa é a última parte antes do domínio de topo: <em>bibliaonline</em>.</li>
  <li><strong>/acf/fp/4</strong> — o caminho, isto é, qual página dentro do site.</li>
  <li><strong>?versiculo=8</strong> — a consulta, os dados que a página recebe.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Como reconhecer um impostor</h3>
<p class="mb-2">Golpes por e-mail funcionam porque o endereço parece certo de relance. Três sinais denunciam:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>A marca no lugar errado.</strong> Em <code>bancodobrasil.acesso-cliente.net</code> o site de verdade é <em>acesso-cliente.net</em>. O nome que vale é o que vem logo antes do domínio de topo, nunca o que vem antes dele.</li>
  <li><strong>Um número no lugar do nome.</strong> Nenhum serviço sério pede login em <code>https://192.168.0.15</code>.</li>
  <li><strong>Letras de outro alfabeto.</strong> Um "а" cirílico é idêntico ao nosso "a" na tela, e transforma um endereço conhecido em outro completamente diferente.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Pesquisar com precisão</h3>
<p class="mb-2">Palavras soltas devolvem milhares de páginas. Três operadores reduzem isso a poucas:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><code>"tudo o que é verdadeiro"</code> — as aspas prendem a expressão exata, nessa ordem.</li>
  <li><code>site:bibliaonline.com.br</code> — procura só dentro daquele site.</li>
  <li><code>-venda</code> — o sinal de menos descarta as páginas que trazem aquela palavra.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Downloads: olhe a última extensão</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Conteúdo</strong> (.pdf, .jpg, .mp3): abre num leitor e não roda sozinho.</li>
  <li><strong>Programa</strong> (.exe, .msi, .apk): roda no seu computador e pode fazer o que quiser lá dentro. Só do site oficial de quem o fez.</li>
  <li><strong>Pacote</strong> (.zip, .rar): só dá para saber o que tem dentro depois de abrir.</li>
  <li><strong>O disfarce mais comum:</strong> <code>biblia-completa.pdf.exe</code>. Como o Windows esconde a última extensão, na tela aparece só "biblia-completa.pdf" — mas é um programa.</li>
</ul>
`;

// ═══════════════════════════════════════════════════════════
// MODULE 7 — E-MAIL
// ═══════════════════════════════════════════════════════════

const content_7L1 = `
<h2 class="text-xl font-bold mb-3">E-mail: Envio, Recebimento, Anexos e Segurança</h2>

<h3 class="font-bold mt-4 mb-2">Como funciona o e-mail</h3>
<p class="mb-3">O e-mail funciona como o correio tradicional, mas digital. Cada pessoa tem um endereço único (ex: joao@exemplo.com). As mensagens viajam pela Internet usando protocolos padronizados.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>SMTP</strong> envia a mensagem do seu cliente para o servidor</li>
  <li>O servidor do remetente entrega ao servidor do destinatário</li>
  <li><strong>POP3 ou IMAP</strong> permite ao destinatário ler a mensagem</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Anexos</h3>
<p class="mb-3">Você pode enviar arquivos junto com a mensagem — fotos, documentos, PDFs. Cuidado:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Não abra anexos de remetentes desconhecidos</li>
  <li>Verifique a extensão (.exe, .scr, .bat podem ser malware)</li>
  <li>Alguns provedores limitam o tamanho do anexo (ex: 25MB)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Segurança de e-mail</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Phishing:</strong> E-mails falsos que parecem oficiais para roubar senhas</li>
  <li><strong>Spam:</strong> Mensagens não solicitadas em massa</li>
  <li><strong>Regra de ouro:</strong> Se parece urgente demais e pede para clicar em algo, desconfie</li>
  <li><strong>Senhas fortes:</strong> Use senhas longas e únicas para seu e-mail</li>
  <li><strong>Verificação em 2 etapas:</strong> Adicione uma camada extra de segurança</li>
</ul>
`;

// ═══════════════════════════════════════════════════════════
// MODULE 8 — FILIPENSES 4:8
// ═══════════════════════════════════════════════════════════

const content_8L1 = `
<h2 class="text-xl font-bold mb-3">Filipenses 4:8</h2>
<blockquote class="border-l-4 pl-4 mb-4 italic" style="border-color: var(--color-primary); color: var(--color-text-soft)">
  "Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se alguma virtude há, se algum louvor existe, nisso pensai."
  <br /><span class="text-sm mt-1 block" style="color: var(--color-text-dim)">— Filipenses 4:8</span>
</blockquote>

<h3 class="font-bold mt-4 mb-2">Aplicação à Internet</h3>
<p class="mb-3">Este versículo é um filtro para tudo o que consumimos online. Antes de clicar, assistir, ler ou compartilhar, pergunte-se:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>É verdadeiro?</strong> A informação é factual e verificável?</li>
  <li><strong>É honesto?</strong> Não há engano ou manipulação?</li>
  <li><strong>É justo?</strong> Respeita e inclui, ou discrimina?</li>
  <li><strong>É puro?</strong> O conteúdo é apropriado e edificante?</li>
  <li><strong>É amável?</strong> Promove bondade ou crueldade?</li>
  <li><strong>É de boa fama?</strong> A fonte é confiável e respeitada?</li>
</ul>
<p class="mb-3">Se a resposta for "não" para qualquer uma dessas perguntas, o conteúdo não merece sua atenção. O Pacto de Uso Consciente é a aplicação prática de Filipenses 4:8 ao uso da Internet.</p>
`;

// ═══════════════════════════════════════════════════════════
// SPECIALTY DEFINITION
// ═══════════════════════════════════════════════════════════

/* AP034-5.0 — o requisito 5 abre perguntando "de que forma os filtros de
   conteúdo podem proteger a sua família?" antes das nove cláusulas do pacto.
   Nunca tinha código nem lição: era a única parte do documento que a plataforma
   simplesmente não ensinava. */
const content_5L0 = `
<h2 class="text-xl font-bold mb-3">Filtros de conteúdo: o que fazem e o que não fazem</h2>
<p class="mb-3">Um filtro de conteúdo é um programa que fica entre a família e a internet, decidindo o que passa. Ele pode viver no roteador de casa, no celular, no navegador ou na conta da criança — e cada lugar protege de um jeito diferente.</p>

<h3 class="font-bold mt-4 mb-2">Os quatro tipos que uma família encontra</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>No roteador</strong> — vale para todos os aparelhos da casa de uma vez, inclusive os das visitas. Não acompanha o celular quando ele sai com o plano de dados.</li>
  <li><strong>No aparelho</strong> — segue o celular para onde ele for, mas precisa ser configurado em cada um.</li>
  <li><strong>Na conta</strong> — o modo restrito do YouTube, a busca segura do buscador, o controle da loja de aplicativos. Vale onde aquela conta estiver.</li>
  <li><strong>No horário</strong> — não filtra o conteúdo, filtra o tempo: desliga a internet às 22h, por exemplo. É o mais simples e um dos mais eficazes.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">O que eles protegem de verdade</h3>
<p class="mb-3">Filtros são bons em três coisas: barrar páginas de conteúdo adulto e violento; impedir instalação de programas sem autorização; e limitar o tempo de uso. Nas três, funcionam porque a decisão é tomada <strong>antes</strong> de a criança precisar decidir sozinha, num momento de curiosidade ou de pressão.</p>

<h3 class="font-bold mt-4 mb-2">O que eles não conseguem fazer</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Não leem intenção.</strong> Um filtro não distingue um trabalho escolar sobre drogas de uma busca por drogas. Ele erra nos dois sentidos: barra o que era legítimo e deixa passar o que não era.</li>
  <li><strong>Não protegem de gente.</strong> A maior parte dos riscos para um adolescente vem de conversas — alguém pedindo foto, marcando encontro, oferecendo dinheiro. Nenhum filtro bloqueia isso.</li>
  <li><strong>Não sobrevivem à casa do amigo.</strong> Nem ao wi-fi da escola, nem ao celular emprestado.</li>
</ul>

<div class="rounded-lg p-4 mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p class="font-bold mb-1" style="color: var(--color-secondary)">Por isso vem o pacto</p>
  <p>O filtro cuida do que dá para automatizar; o combinado cuida do resto. Um sem o outro deixa buraco: filtro sozinho vira gato e rato, e regra sozinha depende de a criança lembrar dela justamente quando não quer lembrar. É por isso que o requisito pede as duas coisas na mesma frase.</p>
</div>
`;

const rawQuestions_5L0: Question[] = [
  {
    id: 'AP034.5-L0-Q1', type: 'multiple_choice',
    prompt: 'Qual proteção um filtro de conteúdo NÃO consegue oferecer?',
    data: { options: [
      { id: 'a', text: 'Impedir que um desconhecido peça fotos ao seu filho pelo chat.', correct: true },
      { id: 'b', text: 'Bloquear páginas de conteúdo adulto.' },
      { id: 'c', text: 'Desligar a internet depois de um horário combinado.' },
      { id: 'd', text: 'Impedir a instalação de programas sem autorização.' },
    ]},
    explanation: 'Filtros barram conteúdo, não conversas. O risco que vem de pessoas é justamente o que o pacto de uso trata.',
  },
  {
    id: 'AP034.5-L0-Q2', type: 'multiple_choice',
    prompt: 'Por que um filtro instalado no roteador não basta?',
    data: { options: [
      { id: 'a', text: 'Porque ele não acompanha o celular quando sai de casa com o plano de dados.', correct: true },
      { id: 'b', text: 'Porque os roteadores domésticos não oferecem esse tipo de recurso.' },
      { id: 'c', text: 'Porque o filtro torna a conexão mais lenta para toda a casa.' },
      { id: 'd', text: 'Porque o recurso só funciona em computadores de modelos antigos.' },
    ]},
    explanation: 'O filtro do roteador vale para tudo o que passa por ele — e só. Fora de casa, é preciso o filtro do próprio aparelho ou da conta.',
  },
  {
    id: 'AP034.5-L0-Q3', type: 'multiple_choice',
    prompt: 'Qual é a relação entre o filtro e o pacto de uso da internet?',
    data: { options: [
      { id: 'a', text: 'Um cuida do que dá para automatizar; o outro cuida do que depende de decisão.', correct: true },
      { id: 'b', text: 'O pacto passa a substituir o filtro assim que a criança cresce.' },
      { id: 'c', text: 'São a mesma coisa, apenas com nomes diferentes conforme o aparelho.' },
      { id: 'd', text: 'O filtro só entra em vigor se o pacto tiver sido assinado em cartório.' },
    ]},
    explanation: 'Filtro sozinho vira gato e rato; regra sozinha depende de lembrar dela na hora errada. O requisito pede os dois na mesma frase.',
  },
];

export const ap034: Specialty = {
  code: 'AP034',
  name: 'Internet',
  level: 'fundamental',
  description: 'Especialidade fundamental sobre internet, serviços, navegação, segurança e uso consciente.',
  requirements: [
    { code: 'AP034-1.1', title: 'Internet', description: 'Definir internet e diferenciá-la de website e WWW.', type: 'theory' },
    { code: 'AP034-1.2', title: 'World Wide Web ou W3', description: 'Explicar a WWW como serviço da internet.', type: 'theory' },
    { code: 'AP034-1.3', title: 'Download', description: 'Definir download.', type: 'theory' },
    { code: 'AP034-1.4', title: 'Upload', description: 'Definir upload.', type: 'theory' },
    { code: 'AP034-1.5', title: 'Website ou site', description: 'Definir website.', type: 'theory' },
    { code: 'AP034-1.6', title: 'E-mail', description: 'Definir e-mail.', type: 'theory' },
    { code: 'AP034-1.7', title: 'Vírus', description: 'Definir vírus e diferenciar de malware.', type: 'theory' },
    { code: 'AP034-2.1', title: 'Webmail, POP3 e IMAP', description: 'Comparar webmail, POP3 e IMAP.', type: 'theory' },
    { code: 'AP034-2.2', title: 'Navegador web', description: 'Explicar o que é um navegador.', type: 'theory' },
    { code: 'AP034-2.3', title: 'Streaming de mídia', description: 'Explicar streaming.', type: 'theory' },
    { code: 'AP034-2.4', title: 'Site de busca', description: 'Explicar site de busca.', type: 'theory' },
    { code: 'AP034-2.5', title: 'Antivírus', description: 'Explicar antivírus.', type: 'theory' },
    { code: 'AP034-3.1', title: 'História da Internet', description: 'Escrever história da internet (250-300 palavras).', type: 'mixed' },
    { code: 'AP034-4.1', title: 'Formas de receber ameaças', description: 'Identificar formas de receber ameaças.', type: 'theory' },
    { code: 'AP034-4.2', title: 'Atualização do antivírus', description: 'Explicar a importância de atualizar o antivírus.', type: 'theory' },
    { code: 'AP034-4.3', title: 'Compartilhamento por computador desprotegido', description: 'Explicar propagação.', type: 'theory' },
    { code: 'AP034-4.4', title: 'Prejuízos', description: 'Listar prejuízos causados por vírus.', type: 'theory' },
    { code: 'AP034-5.0', title: 'Filtros de conteúdo', description: 'Explicar de que forma os filtros de conteúdo podem proteger a família.', type: 'theory' },
    { code: 'AP034-5.1', title: 'Pacto - Não revelar informações', description: 'Nunca revelar informações pessoais desnecessárias.', type: 'practice' },
    { code: 'AP034-5.2', title: 'Pacto - Pessoas online', description: 'Pessoas online podem não ser quem afirmam ser.', type: 'practice' },
    { code: 'AP034-5.3', title: 'Pacto - Encontro presencial', description: 'Nunca encontrar amigo virtual sem responsável.', type: 'practice' },
    { code: 'AP034-5.4', title: 'Pacto - Contatos suspeitos', description: 'Não responder a contatos suspeitos.', type: 'practice' },
    { code: 'AP034-5.5', title: 'Pacto - Pedir ajuda', description: 'Interromper e procurar ajuda ao perceber algo anormal.', type: 'practice' },
    { code: 'AP034-5.6', title: 'Pacto - Tempo semanal', description: 'Estabelecer tempo semanal de uso.', type: 'practice' },
    { code: 'AP034-5.7', title: 'Pacto - Sites aceitáveis', description: 'Definir sites aceitáveis e inaceitáveis.', type: 'practice' },
    { code: 'AP034-5.8', title: 'Pacto - Redes sociais', description: 'Selecionar no máximo duas redes sociais.', type: 'practice' },
    { code: 'AP034-5.9', title: 'Pacto - Limite diário', description: 'Definir limite diário para redes sociais.', type: 'practice' },
    { code: 'AP034-6.1', title: 'Visitar três sites', description: 'Visitar três sites diferentes e registrar a primeira página de cada um.', type: 'practice' },
    { code: 'AP034-6.2', title: 'Pesquisa bíblica', description: 'Encontrar uma Bíblia on-line por busca e localizar três textos em três versões diferentes.', type: 'practice' },
    { code: 'AP034-6.3', title: 'Download de arquivo', description: 'Fazer o download de um arquivo.', type: 'practice' },
    { code: 'AP034-7.1', title: 'Escrever e enviar um e-mail', description: 'Redigir e enviar uma mensagem completa, com destinatário, assunto e corpo.', type: 'practice' },
    { code: 'AP034-7.2', title: 'Receber e abrir um e-mail', description: 'Receber mensagens e abri-las para leitura.', type: 'practice' },
    { code: 'AP034-7.3', title: 'Baixar e abrir um anexo', description: 'Fazer o download de um anexo recebido e abri-lo.', type: 'practice' },
    { code: 'AP034-7.4', title: 'Segurança no e-mail', description: 'Aplicar princípios de segurança ao enviar, receber e abrir e-mails.', type: 'practice' },
    { code: 'AP034-8.1', title: 'Filipenses 4:8', description: 'Aprender e aplicar Filipenses 4:8.', type: 'mixed' },
  ],
  modules: [
    {
      code: 'AP034.1', title: 'Conceitos Fundamentais',
      description: 'Internet, WWW, download, upload, website, e-mail e vírus.',
      lessons: [
        { code: 'AP034.1-L1', title: 'O que é a Internet', type: 'theory', content: content_L1, requirementCodes: ['AP034-1.1', 'AP034-1.2'], questions: rawQuestions_L1 },
        { code: 'AP034.1-L2', title: 'Download e Upload', type: 'theory', content: content_L2, requirementCodes: ['AP034-1.3', 'AP034-1.4'], questions: rawQuestions_L2 },
        { code: 'AP034.1-L3', title: 'Website, E-mail e Vírus', type: 'theory', content: content_L3, requirementCodes: ['AP034-1.5', 'AP034-1.6', 'AP034-1.7'], questions: rawQuestions_L3 },
      ],
    },
    {
      code: 'AP034.2', title: 'Serviços e Ferramentas',
      description: 'Webmail, POP3, IMAP, navegador, streaming, busca e antivírus.',
      lessons: [
        { code: 'AP034.2-L1', title: 'Webmail, POP3 e IMAP', type: 'theory', content: content_2L1, requirementCodes: ['AP034-2.1'], questions: rawQuestions_2L1 },
        { code: 'AP034.2-L2', title: 'Navegador, Streaming, Busca e Antivírus', type: 'theory', content: content_2L2, requirementCodes: ['AP034-2.2', 'AP034-2.3', 'AP034-2.4', 'AP034-2.5'], questions: rawQuestions_2L2 },
      ],
    },
    {
      code: 'AP034.3', title: 'História da Internet',
      description: 'Linha do tempo e produção de texto.',
      lessons: [
        { code: 'AP034.3-L1', title: 'Linha do Tempo da Internet', type: 'theory', content: content_3L1, requirementCodes: ['AP034-3.1'], questions: rawQuestions_3L1 },
        { code: 'AP034.3-L2', title: 'Editor de Texto: História da Internet', type: 'lab', content: '', requirementCodes: ['AP034-3.1'], labType: 'text_editor' },
      ],
    },
    {
      code: 'AP034.4', title: 'Antivírus e Ameaças',
      description: 'Formas de ameaças, atualização, propagação e prejuízos.',
      lessons: [
        { code: 'AP034.4-L1', title: 'Ameaças e Proteção', type: 'theory', content: content_4L1, requirementCodes: ['AP034-4.1', 'AP034-4.2', 'AP034-4.3', 'AP034-4.4'], questions: rawQuestions_4L1 },
        { code: 'AP034.4-L2', title: 'Laboratório de Ameaças e Antivírus', type: 'lab', content: '', requirementCodes: ['AP034-4.1', 'AP034-4.2', 'AP034-4.3', 'AP034-4.4'], labType: 'threat_lab' },
      ],
    },
    {
      code: 'AP034.5', title: 'Meu Compromisso Digital',
      description: 'O acordo pessoal de uso da internet, cláusula por cláusula.',
      lessons: [
        { code: 'AP034.5-L0', title: 'Filtros de Conteúdo', type: 'theory', content: content_5L0, requirementCodes: ['AP034-5.0'], questions: rawQuestions_5L0 },
        { code: 'AP034.5-L1', title: 'Meu Compromisso Digital', type: 'lab', content: content_5L1, requirementCodes: ['AP034-5.1', 'AP034-5.2', 'AP034-5.3', 'AP034-5.4', 'AP034-5.5', 'AP034-5.6', 'AP034-5.7', 'AP034-5.8', 'AP034-5.9'], labType: 'pact_builder' },
      ],
    },
    {
      code: 'AP034.6', title: 'Navegação e Pesquisa',
      description: 'WebLab: simulação de navegador.',
      lessons: [
        { code: 'AP034.6-L1', title: 'WebLab - Navegação e Pesquisa', type: 'lab', content: content_6L1, requirementCodes: ['AP034-6.1', 'AP034-6.2', 'AP034-6.3'], labType: 'web_lab' },
      ],
    },
    {
      code: 'AP034.7', title: 'E-mail',
      description: 'MailLab: simulação de e-mail.',
      lessons: [
        { code: 'AP034.7-L1', title: 'MailLab - E-mail e Segurança', type: 'lab', content: content_7L1, requirementCodes: ['AP034-7.1', 'AP034-7.2', 'AP034-7.3', 'AP034-7.4'], labType: 'mail_lab' },
      ],
    },
    {
      code: 'AP034.8', title: 'Filipenses 4:8',
      description: 'Aprendizado e aplicação do princípio.',
      lessons: [
        { code: 'AP034.8-L1', title: 'Filipenses 4:8', type: 'lab', content: content_8L1, requirementCodes: ['AP034-8.1'], labType: 'filipenses' },
      ],
    },
    {
      code: 'AP034.F', title: 'Avaliação Final',
      description: 'Avaliação adaptativa.',
      lessons: [
        { code: 'AP034.F-L1', title: 'Avaliação Final — Internet', type: 'final', content: '', requirementCodes: [], labType: 'final_exam' },
      ],
    },
  ],
};
