import type { Specialty, Question } from '../types';


// ═══════════════════════════════════════════════════════════
// MODULE 1 — CONCEITOS AVANÇADOS
// ═══════════════════════════════════════════════════════════

const content_1L1 = `
<h2 class="text-xl font-bold mb-3">HTTP, HTTPS e Hyperlinks</h2>

<h3 class="font-bold mt-4 mb-2">HTTP (HyperText Transfer Protocol)</h3>
<p class="mb-3">O <strong>HTTP</strong> é o protocolo de comunicação da World Wide Web. Ele define como o cliente (navegador) envia requisições e como o servidor responde com os dados da página.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Cliente → Servidor:</strong> "Quero a página X" (requisição GET)</li>
  <li><strong>Servidor → Cliente:</strong> "Aqui está o HTML da página X" (resposta 200 OK)</li>
  <li>É um protocolo <strong>stateless</strong> — cada requisição é independente, sem memória de requisições anteriores</li>
  <li>Usa portas lógicas: HTTP na porta 80, HTTPS na porta 443</li>
</ul>

<h3 class="font-bold mt-4 mb-2">HTTPS (HTTP Secure)</h3>
<p class="mb-3">O <strong>HTTPS</strong> adiciona uma camada de criptografia <strong>TLS/SSL</strong> sobre o HTTP. Os dados viajam criptografados entre cliente e servidor, impedindo interceptação.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Cadeado na barra de endereço:</strong> indica conexão segura</li>
  <li><strong>Certificado digital:</strong> o servidor prova sua identidade</li>
  <li><strong>Proteção contra interceptação:</strong> senhas, dados pessoais e transações não podem ser lidos por terceiros</li>
  <li>Essencial para sites de banco, lojas e qualquer página com login</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Hyperlink (Link)</h3>
<p class="mb-3">Um <strong>hyperlink</strong> (ou simplesmente link) é uma referência que liga um documento a outro recurso na web. É o que torna a Web uma "teia" de documentos interconectados.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Em HTML, criado com a tag <code style="color: var(--color-secondary)">&lt;a href="url"&gt;texto&lt;/a&gt;</code></li>
  <li>Pode apontar para: outra página, uma seção da mesma página, um arquivo, um e-mail</li>
  <li>Links externos: apontam para outro domínio (ex: de meu site para o Google)</li>
  <li>Links internos: apontam para páginas dentro do mesmo site</li>
</ul>
`;

const rawQ_1L1: Question[] = [
  {
    id: 'AP035.1-L1-Q1', type: 'multiple_choice',
    prompt: 'Qual é a função do protocolo HTTP?',
    data: { options: [
      { id: 'a', text: 'Transferir dados entre cliente e servidor na World Wide Web.', correct: true },
      { id: 'b', text: 'Enviar mensagens de correio entre os servidores da rede.', porque: 'Isso é o SMTP. O HTTP carrega páginas; correio eletrônico tem protocolos próprios.' },
      { id: 'c', text: 'Compactar os arquivos para que o download termine antes.', porque: 'Compactação existe na web, mas é um recurso opcional dentro do HTTP — não a função dele.' },
      { id: 'd', text: 'Proteger o computador contra vírus durante a navegação.', porque: 'O HTTP não protege nada por si. Quem cifra a conversa é o HTTPS, e quem examina arquivos é o antivírus.' },
    ]},
    explanation: 'HTTP (HyperText Transfer Protocol) é o protocolo de comunicação da Web.',
  },
  {
    id: 'AP035.1-L1-Q2', type: 'multiple_choice',
    prompt: 'O que o HTTPS adiciona em relação ao HTTP?',
    data: { options: [
      { id: 'a', text: 'Criptografia TLS/SSL para proteger os dados em trânsito.', correct: true },
      { id: 'b', text: 'Maior velocidade de download, por usar uma via reservada.', porque: 'Não é sobre velocidade. O HTTPS embaralha os dados no caminho para que ninguém no meio consiga lê-los.' },
      { id: 'c', text: 'Compressão automática das imagens antes de enviá-las.', porque: 'Compressão é outra coisa e independe do S. O que o HTTPS acrescenta é o sigilo do que trafega.' },
      { id: 'd', text: 'Tradução das páginas para o idioma de quem acessa.', porque: 'Tradução é recurso do navegador. O HTTPS não olha o conteúdo — ele existe justamente para que ninguém olhe.' },
    ]},
    explanation: 'HTTPS = HTTP + TLS/SSL. O cadeado no navegador indica conexão segura.',
  },
  {
    id: 'AP035.1-L1-Q3', type: 'multiple_choice',
    prompt: 'O que é um hyperlink (link)?',
    data: { options: [
      { id: 'a', text: 'Uma referência que liga um documento a outro recurso na web.', correct: true },
      { id: 'b', text: 'Um tipo de vírus que se espalha ao abrir uma página.', porque: 'Link é um caminho para outro conteúdo. Pode levar a um site perigoso, mas o link em si não é a ameaça.' },
      { id: 'c', text: 'Um protocolo que entrega e-mails entre servidores.', porque: 'Isso é o SMTP. Link não transporta nada: ele aponta para onde algo está.' },
      { id: 'd', text: 'Um formato de imagem usado em páginas da web, capaz de guardar mais cores que os demais.', porque: 'Uma imagem pode ser um link, mas não é isso que define um. Link é a ligação entre um ponto e outro.' },
    ]},
    explanation: 'Hyperlinks conectam páginas, permitindo a navegação entre recursos da web.',
  },
  {
    id: 'AP035.1-L1-Q4', type: 'true_false',
    prompt: 'HTTP é um protocolo stateless — cada requisição é independente, sem memória de requisições anteriores.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Cada requisição HTTP chega sem lembrança das anteriores — por isso existem cookies e sessões, para dar essa memória.' },
    ]},
    explanation: 'HTTP não mantém estado entre requisições. Cookies e sessões são usados para contornar isso.',
  },
  {
    id: 'AP035.1-L1-Q5', type: 'fill_blank',
    prompt: 'Complete: HTTPS usa a porta _____, enquanto HTTP usa a porta _____.',
    data: {
      blanks: [
        { id: 'b1', answer: '443', hint: 'Porta padrão do HTTPS' },
        { id: 'b2', answer: '80', hint: 'Porta padrão do HTTP' },
      ],
    },
    explanation: 'HTTP usa a porta 80; HTTPS usa a porta 443 por padrão.',
  },
  {
    id: 'AP035.1-L1-Q6', type: 'scenario',
    prompt: 'Você está prestes a digitar sua senha em um site de banco. Como verifica se a conexão é segura?',
    data: { scenarios: [
      { id: 'a', text: 'Verificar se há um cadeado na barra de endereço e se a URL começa com https://', correct: true },
      { id: 'b', text: 'Verificar se o site carrega com rapidez ao ser aberto.', porque: 'Velocidade não diz nada sobre segurança. Uma página falsa pode carregar mais rápido que a verdadeira.' },
      { id: 'c', text: 'Verificar se a página tem visual bem-acabado e cores firmes.', porque: 'Aparência se copia com facilidade. Sites falsos costumam ser cópias fiéis dos verdadeiros.' },
      { id: 'd', text: 'Não há como verificar isso pelo navegador, de modo que resta confiar no endereço digitado.', porque: 'Há sim: o cadeado e o https:// na barra são exatamente esse sinal, e o navegador os mostra em toda página.' },
    ]},
    explanation: 'O cadeado e https:// indicam criptografia TLS ativa, protegendo seus dados.',
  },
  {
    id: 'AP035.1-L1-Q7', type: 'matching',
    prompt: 'Associe cada conceito à sua definição.',
    data: {
      pairs: [
        { left: 'HTTP', right: 'Protocolo de transferência de hipertexto' },
        { left: 'HTTPS', right: 'HTTP com criptografia TLS/SSL' },
        { left: 'Hyperlink', right: 'Referência que liga documentos na web' },
        { left: 'TLS/SSL', right: 'Protocolo de criptografia' },
      ],
    },
    explanation: 'Cada conceito tem um papel na comunicação segura da Web.',
  },
];

const content_1L2 = `
<h2 class="text-xl font-bold mb-3">HTML, PHP, Cliente e Servidor</h2>

<h3 class="font-bold mt-4 mb-2">HTML — Linguagem de Marcação</h3>
<p class="mb-3"><strong>HTML</strong> (HyperText Markup Language) é a linguagem de marcação que estrutura o conteúdo de páginas web. É interpretada pelo <strong>navegador (cliente)</strong> — não é uma linguagem de programação, mas sim de marcação.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Define a estrutura: títulos, parágrafos, listas, tabelas, imagens, links</li>
  <li>Executado no cliente (navegador do usuário)</li>
  <li>Estático: o conteúdo não muda a menos que o código seja editado</li>
</ul>

<h3 class="font-bold mt-4 mb-2">PHP — Linguagem de Programação</h3>
<p class="mb-3"><strong>PHP</strong> (Hypertext Preprocessor) é uma linguagem de programação executada no <strong>servidor</strong>. Ela gera HTML dinamicamente — o usuário nunca vê o código PHP, apenas o HTML resultante.</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Executado no servidor antes de enviar a página ao cliente</li>
  <li>Permite conteúdo dinâmico: login, carrinho de compras, fórum</li>
  <li>Pode acessar bancos de dados (MySQL, PostgreSQL)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Cliente vs. Servidor</h3>
<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Cliente (Navegador)</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Servidor</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Executa HTML, CSS, JavaScript</td><td class="py-2">Executa PHP, Python, Node.js</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Estático após o carregamento</td><td class="py-2">Gera conteúdo dinâmico</td></tr>
  <tr><td class="py-2">O usuário vê o código</td><td class="py-2">O usuário NUNCA vê o código PHP</td></tr>
</table>
`;

const rawQ_1L2: Question[] = [
  {
    id: 'AP035.1-L2-Q1', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre HTML e PHP?',
    data: { options: [
      { id: 'a', text: 'HTML é linguagem de marcação executada no cliente; PHP é linguagem de programação executada no servidor.', correct: true },
      { id: 'b', text: 'HTML é mais moderno e veio substituir o PHP nos sites atuais, por rodar direto no navegador sem precisar de servidor.', porque: 'O HTML é mais antigo que o PHP, e um não substitui o outro: fazem trabalhos diferentes, no cliente e no servidor.' },
      { id: 'c', text: 'PHP cuida apenas da aparência da página, e HTML cuida da lógica e dos cálculos que ela precisa fazer.', porque: 'Está invertido. Quem descreve a aparência é o HTML, com o CSS; o PHP calcula e decide, no servidor.' },
      { id: 'd', text: 'São a mesma linguagem, com nomes distintos por razões históricas.', porque: 'São linguagens distintas, e rodam em máquinas distintas: o HTML no seu navegador, o PHP no servidor.' },
    ]},
    explanation: 'HTML estrutura a página no navegador; PHP gera conteúdo dinamicamente no servidor.',
  },
  {
    id: 'AP035.1-L2-Q2', type: 'multiple_choice',
    prompt: 'Onde o PHP é executado?',
    data: { options: [
      { id: 'a', text: 'No servidor, antes de enviar a página ao cliente.', correct: true },
      { id: 'b', text: 'No navegador de quem acessa a página.', porque: 'O navegador nunca vê o PHP. Ele recebe apenas o HTML que o PHP produziu.' },
      { id: 'c', text: 'No roteador que leva a página da operadora até dentro da casa.', porque: 'O roteador só encaminha dados. Ele não executa programa de página nenhuma.' },
      { id: 'd', text: 'No provedor que entrega as mensagens.', porque: 'O provedor transporta o tráfego. Quem roda o código é o servidor onde o site está hospedado.' },
    ]},
    explanation: 'PHP roda no servidor. O usuário recebe apenas o HTML resultante, nunca o código PHP.',
  },
  {
    id: 'AP035.1-L2-Q3', type: 'true_false',
    prompt: 'HTML é uma linguagem de programação.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'HTML descreve a estrutura da página — não tem condição, repetição nem cálculo. Marcação e programação são coisas diferentes.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'HTML é linguagem de MARCAÇÃO, não de programação. Ela estrutura conteúdo, não executa lógica.',
  },
  {
    id: 'AP035.1-L2-Q4', type: 'matching',
    prompt: 'Associe cada tecnologia ao seu ambiente de execução.',
    data: {
      pairs: [
        { left: 'HTML', right: 'Cliente (navegador)' },
        { left: 'PHP', right: 'Servidor' },
        { left: 'CSS', right: 'Cliente (navegador)' },
        { left: 'MySQL', right: 'Servidor (banco de dados)' },
      ],
    },
    explanation: 'HTML/CSS/JS rodam no cliente. PHP e MySQL rodam no servidor.',
  },
  {
    id: 'AP035.1-L2-Q5', type: 'scenario',
    prompt: 'Você acessa uma página de login. Digita sua senha e clica em "Entrar". A página verifica sua senha em um banco de dados e mostra "Bem-vindo". Onde a verificação da senha acontece?',
    data: { scenarios: [
      { id: 'a', text: 'No servidor — a senha é enviada ao servidor, que a verifica no banco de dados e responde.', correct: true },
      { id: 'b', text: 'No navegador, porque o próprio HTML compara a senha digitada com a que está guardada na página.', porque: 'Se a senha correta estivesse na página, qualquer pessoa a leria no código-fonte. Por isso a conferência é no servidor.' },
      { id: 'c', text: 'No roteador Wi-Fi, que examina tudo o que passa por ele antes de liberar o acesso.', porque: 'O roteador encaminha pacotes e não conhece o banco de dados do site.' },
      { id: 'd', text: 'No provedor de Internet, que intermedia todo o tráfego.', porque: 'O provedor leva os dados até o servidor. Quem confere a senha é o site, no destino.' },
    ]},
    explanation: 'A verificação de senha é lógica de servidor (PHP/Python/etc.), não de cliente (HTML).',
  },
  {
    id: 'AP035.1-L2-Q6', type: 'fill_blank',
    prompt: 'Complete: O usuário vê o código _____, mas nunca vê o código _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'HTML', aceitas: ['html'], hint: 'Linguagem de marcação visível no navegador' },
        { id: 'b2', answer: 'PHP', aceitas: ['php'], hint: 'Linguagem de programação executada no servidor' },
      ],
    },
    explanation: 'O navegador recebe apenas HTML. O PHP é processado no servidor antes.',
  },
];

const content_1L3 = `
<h2 class="text-xl font-bold mb-3">Navegadores Seguros e Cores Hexadecimais</h2>

<h3 class="font-bold mt-4 mb-2">Identificando conexões seguras</h3>
<p class="mb-3">Um navegador seguro exibe indicadores visuais quando a conexão é criptografada:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Cadeado fechado</strong> na barra de endereço</li>
  <li><strong>https://</strong> no início da URL (não apenas http://)</li>
  <li>Alguns navegadores mostram o nome da organização ao clicar no cadeado</li>
  <li>Ausência de avisos de "Conexão não segura"</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Cores Hexadecimais</h3>
<p class="mb-3">Na web, as cores são frequentemente representadas em <strong>hexadecimal</strong> — um sistema de base 16 que usa os dígitos 0-9 e as letras A-F.</p>
<p class="mb-3">O formato é <code style="color: var(--color-secondary)">#RRGGBB</code>, onde:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>RR</strong> = quantidade de vermelho (00 a FF)</li>
  <li><strong>GG</strong> = quantidade de verde (00 a FF)</li>
  <li><strong>BB</strong> = quantidade de azul (00 a FF)</li>
</ul>
<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Cor</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Hexadecimal</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Significado</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2" style="color: var(--color-text)">Branco</td><td class="py-2">var(--color-text)</td><td class="py-2">Máximo de R, G e B</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2" style="color: var(--color-bg)">Preto</td><td class="py-2">var(--color-bg)</td><td class="py-2">Ausência de cor</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2" style="color: #FF0000">Vermelho</td><td class="py-2">#FF0000</td><td class="py-2">Apenas vermelho máximo</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2" style="color: #00FF00">Verde</td><td class="py-2">#00FF00</td><td class="py-2">Apenas verde máximo</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2" style="color: #0000FF">Azul</td><td class="py-2">#0000FF</td><td class="py-2">Apenas azul máximo</td></tr>
  <tr><td class="py-2" style="color: #FFFF00">Amarelo</td><td class="py-2">#FFFF00</td><td class="py-2">Vermelho + Verde</td></tr>
</table>
`;

const rawQ_1L3: Question[] = [
  {
    id: 'AP035.1-L3-Q1', type: 'multiple_choice',
    prompt: 'Como identificar se um navegador está em conexão segura?',
    data: { options: [
      { id: 'a', text: 'Pelo cadeado na barra de endereço e pelo prefixo https:// na URL.', correct: true },
      { id: 'b', text: 'Pela velocidade com que a página termina de carregar por completo no navegador.', porque: 'Velocidade não tem relação com segurança. O sinal é o cadeado e o https:// no endereço.' },
      { id: 'c', text: 'Pelo tamanho da janela em que o navegador foi aberto.', porque: 'O tamanho da janela é escolha sua e não diz nada sobre a conexão.' },
      { id: 'd', text: 'Pela cor que o botão de atualizar assume na barra.', porque: 'O botão de atualizar não muda de cor conforme a segurança. Quem indica é o cadeado.' },
    ]},
    explanation: 'O cadeado e https:// indicam que a conexão está criptografada com TLS.',
  },
  {
    id: 'AP035.1-L3-Q2', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor branca?',
    data: { options: [
      { id: 'a', text: '#FFFFFF', correct: true },
      { id: 'b', text: '#000000', porque: 'Isso é preto: zero de vermelho, zero de verde, zero de azul. Branco é o oposto.' },
      { id: 'c', text: '#FF0000', porque: 'Isso é vermelho puro. Branco precisa dos três canais no máximo, não de um só.' },
      { id: 'd', text: '#00FF00', porque: 'Isso é verde puro. Só há branco quando os três canais estão no máximo.' },
    ]},
    explanation: '#FFFFFF = máximo de vermelho, verde e azul = branco. #000000 = preto.',
  },
  {
    id: 'AP035.1-L3-Q3', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor preta?',
    data: { options: [
      { id: 'a', text: '#000000', correct: true },
      { id: 'b', text: '#FFFFFF', porque: 'Isso é branco: os três canais no máximo. Preto é a ausência dos três.' },
      { id: 'c', text: '#FF0000', porque: 'Isso é vermelho puro. Preto não tem canal algum aceso.' },
      { id: 'd', text: '#0000FF', porque: 'Isso é azul puro. Preto é #000000, sem nenhuma cor.' },
    ]},
    explanation: '#000000 = ausência de vermelho, verde e azul = preto.',
  },
  {
    id: 'AP035.1-L3-Q4', type: 'fill_blank',
    prompt: 'No formato #RRGGBB, RR representa _____, GG representa _____, e BB representa _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'vermelho', hint: 'R = Red' },
        { id: 'b2', answer: 'verde', hint: 'G = Green' },
        { id: 'b3', answer: 'azul', hint: 'B = Blue' },
      ],
    },
    explanation: 'RGB = Red, Green, Blue. Cada par vai de 00 (nenhum) a FF (máximo).',
  },
  {
    id: 'AP035.1-L3-Q5', type: 'matching',
    prompt: 'Associe cada cor ao seu código hexadecimal.',
    data: {
      pairs: [
        { left: '#FF0000', right: 'Vermelho' },
        { left: '#00FF00', right: 'Verde' },
        { left: '#0000FF', right: 'Azul' },
        { left: '#FFFFFF', right: 'Branco' },
        { left: '#000000', right: 'Preto' },
        { left: '#FFFF00', right: 'Amarelo' },
      ],
    },
    explanation: 'Cada par hex define uma cor: FF = máximo, 00 = nenhum.',
  },
  {
    id: 'AP035.1-L3-Q6', type: 'scenario',
    prompt: 'Você quer criar um botão com fundo azul puro. Qual código hexadecimal usa?',
    data: { scenarios: [
      { id: 'a', text: '#0000FF — azul máximo, sem vermelho nem verde.', correct: true },
      { id: 'b', text: '#FF0000 — isso é vermelho, não azul.', porque: 'Aqui o vermelho está no máximo e o azul, em zero. É o contrário do que se pede.' },
      { id: 'c', text: '#00FF00 — isso é verde, não azul.', porque: 'Aqui quem está no máximo é o verde. O azul é o terceiro par, e ele está zerado.' },
      { id: 'd', text: '#FFFFFF — isso é branco, não azul.', porque: 'Os três canais no máximo dão branco. Azul puro precisa só do último aceso.' },
    ]},
    explanation: 'Azul puro = #0000FF (00 vermelho, 00 verde, FF azul).',
  },
];

const content_1L4 = `
<h2 class="text-xl font-bold mb-3">URL e Estrutura de Endereços</h2>
<p class="mb-3">A <strong>URL</strong> (Uniform Resource Locator) é o endereço que identifica um recurso na Internet. É como o CEP de uma casa — cada página tem um endereço único.</p>

<h3 class="font-bold mt-4 mb-2">Anatomia de uma URL</h3>
<pre style="color: var(--color-secondary); background: var(--color-bg-input); padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;">https://www.exemplo.com/pagina/sobre?param=valor</pre>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Parte</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Exemplo</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">Função</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Protocolo</strong></td><td class="py-2">https://</td><td class="py-2">Como os dados são transferidos</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Subdomínio</strong></td><td class="py-2">www.</td><td class="py-2">Subdivisão do domínio (opcional)</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Dominío</strong></td><td class="py-2">exemplo.com</td><td class="py-2">Nome do site registrado</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2"><strong>Caminho</strong></td><td class="py-2">/pagina/sobre</td><td class="py-2">Local do recurso no servidor</td></tr>
  <tr><td class="py-2"><strong>Query</strong></td><td class="py-2">?param=valor</td><td class="py-2">Parâmetros adicionais (opcional)</td></tr>
</table>
`;

const rawQ_1L4: Question[] = [
  {
    id: 'AP035.1-L4-Q1', type: 'multiple_choice',
    prompt: 'O que é uma URL?',
    data: { options: [
      { id: 'a', text: 'Um endereço que identifica um recurso na Internet, composto por protocolo, domínio e caminho.', correct: true },
      { id: 'b', text: 'Um tipo de vírus que se espalha ao abrir uma página.', porque: 'URL é um endereço. Ela pode levar a um site perigoso, mas por si só é apenas a indicação de onde algo está.' },
      { id: 'c', text: 'A lista de endereços que a pessoa guarda no navegador para voltar a eles depois.', porque: 'Isso são os favoritos. Eles guardam o que você já conhece; o buscador acha o que você ainda não conhece.' },
      { id: 'd', text: 'Um formato de imagem que guarda mais cores que os demais.', porque: 'Uma URL pode apontar para uma imagem, mas não é a imagem: é o caminho até ela.' },
    ]},
    explanation: 'URL = Uniform Resource Locator. Ex: https://exemplo.com/pagina',
  },
  {
    id: 'AP035.1-L4-Q2', type: 'fill_blank',
    prompt: 'Na URL https://exemplo.com/pagina, identifique as partes.',
    data: {
      blanks: [
        { id: 'b1', answer: 'protocolo', aceitas: ['esquema'], hint: 'https' },
        { id: 'b2', answer: 'domínio', aceitas: ['host', 'nome de domínio'], hint: 'exemplo.com' },
        { id: 'b3', answer: 'caminho', aceitas: ['path', 'rota'], hint: '/pagina' },
      ],
    },
    explanation: 'A URL é composta por protocolo (https), domínio (exemplo.com) e caminho (/pagina).',
  },
  {
    id: 'AP035.1-L4-Q3', type: 'matching',
    prompt: 'Associe cada parte da URL à sua função.',
    data: {
      pairs: [
        { left: 'Protocolo', right: 'Define como os dados são transferidos' },
        { left: 'Domínio', right: 'Nome registrado do site' },
        { left: 'Caminho', right: 'Local do recurso no servidor' },
        { left: 'Query string', right: 'Parâmetros adicionais' },
      ],
    },
    explanation: 'Cada parte da URL tem uma função específica.',
  },
  {
    id: 'AP035.1-L4-Q4', type: 'ordering',
    prompt: 'Ordene as partes de uma URL da esquerda para a direita.',
    data: {
      items: [
        { id: 'a', text: 'Protocolo (https://)', order: 1 },
        { id: 'b', text: 'Subdomínio (www.)', order: 2 },
        { id: 'c', text: 'Domínio (exemplo.com)', order: 3 },
        { id: 'd', text: 'Caminho (/pagina)', order: 4 },
      ],
    },
    explanation: 'A ordem é: protocolo → subdomínio → domínio → caminho.',
  },
  {
    id: 'AP035.1-L4-Q5', type: 'true_false',
    prompt: 'A parte "https://" em uma URL indica o protocolo de transferência.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. O que vem antes de :// é sempre o protocolo — https, http, ftp, mailto.' },
    ]},
    explanation: 'Sim — o protocolo (http ou https) é a primeira parte da URL.',
  },
];

const content_1L5 = `
<h2 class="text-xl font-bold mb-3">Formatos de Imagem: GIF, PNG e JPEG</h2>
<p class="mb-3">Existem três formatos de imagem principais para a web. Cada um tem características que o tornam adequado para diferentes situações.</p>

<h3 class="font-bold mt-4 mb-2">JPEG (Joint Photographic Experts Group)</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Compressão com perda</strong> — reduz o tamanho do arquivo, mas perde alguma qualidade</li>
  <li>Ideal para <strong>fotografias</strong> com milhões de cores e gradientes</li>
  <li>Não suporta transparência nem animação</li>
  <li>Arquivos menores que PNG para fotos</li>
</ul>

<h3 class="font-bold mt-4 mb-2">PNG (Portable Network Graphics)</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Compressão sem perda</strong> — mantém toda a qualidade original</li>
  <li>Suporta <strong>transparência</strong> (fundo transparente)</li>
  <li>Ideal para <strong>logos, ícones, gráficos</strong> com poucas cores</li>
  <li>Não suporta animação</li>
  <li>Arquivos maiores que JPEG para fotos</li>
</ul>

<h3 class="font-bold mt-4 mb-2">GIF (Graphics Interchange Format)</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Suporta <strong>animação</strong> (múltiplos frames)</li>
  <li>Apenas <strong>256 cores</strong> (paleta limitada)</li>
  <li>Suporta transparência binária (pixel transparente ou não, sem semi-transparência)</li>
  <li>Ideal para <strong>animações curtas</strong> e memes</li>
  <li>Não adequado para fotografias (poucas cores)</li>
</ul>

<table class="w-full border-collapse mb-3 text-sm">
  <tr style="border-bottom: 1px solid var(--color-border)">
    <th class="text-left py-2" style="color: var(--color-text-dim)">Recurso</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">JPEG</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">PNG</th>
    <th class="text-left py-2" style="color: var(--color-text-dim)">GIF</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Compressão</td><td class="py-2">Com perda</td><td class="py-2">Sem perda</td><td class="py-2">Sem perda</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Cores</td><td class="py-2">Milhões</td><td class="py-2">Milhões</td><td class="py-2">256</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Transparência</td><td class="py-2">Não</td><td class="py-2">Sim</td><td class="py-2">Sim (binária)</td></tr>
  <tr style="border-bottom: 1px solid var(--color-bg-hover)"><td class="py-2">Animação</td><td class="py-2">Não</td><td class="py-2">Não</td><td class="py-2">Sim</td></tr>
  <tr><td class="py-2">Melhor para</td><td class="py-2">Fotos</td><td class="py-2">Logos, ícones</td><td class="py-2">Animações curtas</td></tr>
</table>
`;

const rawQ_1L5: Question[] = [
  {
    id: 'AP035.1-L5-Q1', type: 'multiple_choice',
    prompt: 'Qual é a principal diferença entre GIF e PNG?',
    data: { options: [
      { id: 'a', text: 'GIF suporta animação e 256 cores; PNG suporta transparência e mais cores, mas sem animação.', correct: true },
      { id: 'b', text: 'PNG aceita animação e o GIF não, e por isso o PNG acabou substituindo o GIF na web.', porque: 'Está invertido: quem anima é o GIF. O PNG comum guarda uma imagem parada.' },
      { id: 'c', text: 'GIF é o formato indicado para fotografias, e PNG serve melhor para textos e desenhos com poucas cores.', porque: 'Também invertido. GIF só tem 256 cores, o que arruína uma foto; ele serve bem para desenhos e animações curtas.' },
      { id: 'd', text: 'Não há diferença prática entre os dois: ambos guardam a mesma imagem do mesmo jeito.', porque: 'Há, e ela decide a escolha: animação de um lado, transparência e milhões de cores do outro.' },
    ]},
    explanation: 'GIF: 256 cores + animação. PNG: milhões de cores + transparência, sem animação.',
  },
  {
    id: 'AP035.1-L5-Q2', type: 'multiple_choice',
    prompt: 'Qual é a principal característica do formato JPEG?',
    data: { options: [
      { id: 'a', text: 'Compressão com perda, ideal para fotografias com milhões de cores.', correct: true },
      { id: 'b', text: 'Guarda transparência e animação, do mesmo modo que o PNG e o GIF fazem.', porque: 'Isso descreve PNG e GIF. O JPEG não faz nem uma coisa nem outra — ele foi feito para fotografia.' },
      { id: 'c', text: 'Não aplica compressão alguma, e por isso gera arquivos bem grandes.', porque: 'O JPEG comprime bastante, e é por isso que uma foto cabe em poucos KB. O preço é perder um pouco de detalhe.' },
      { id: 'd', text: 'Trabalha com apenas 256 cores, o que o torna ruim para fotografias.', porque: 'Isso é o GIF. O JPEG lida com milhões de cores, que é o que uma fotografia exige.' },
    ]},
    explanation: 'JPEG usa compressão com perda, reduzindo o tamanho do arquivo de fotos.',
  },
  {
    id: 'AP035.1-L5-Q3', type: 'matching',
    prompt: 'Associe cada formato de imagem à sua melhor aplicação.',
    data: {
      pairs: [
        { left: 'JPEG', right: 'Fotografias com milhões de cores' },
        { left: 'PNG', right: 'Logos e ícones com transparência' },
        { left: 'GIF', right: 'Animações curtas com 256 cores' },
      ],
    },
    explanation: 'Cada formato é otimizado para um tipo de conteúdo.',
  },
  {
    id: 'AP035.1-L5-Q4', type: 'true_false',
    prompt: 'O formato JPEG suporta transparência.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'Não suporta. Onde a imagem deveria ser vazada, o JPEG grava branco. Para fundo transparente, use PNG.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Falso. O JPEG não guarda transparência: onde a imagem deveria ser vazada, ele grava branco. Quem precisa de fundo transparente usa PNG, que tem canal alpha.',
  },
  {
    id: 'AP035.1-L5-Q5', type: 'scenario',
    prompt: 'Você precisa salvar um logo com fundo transparente para usar em um site. Qual formato escolher?',
    data: { scenarios: [
      { id: 'a', text: 'PNG — suporta transparência e mantém qualidade sem perda.', correct: true },
      { id: 'b', text: 'JPEG — não suporta transparência, o fundo ficaria branco.', porque: 'O JPEG não guarda transparência: o fundo do logo sairia branco, aparecendo como um retângulo sobre a página.' },
      { id: 'c', text: 'GIF — suporta transparência, mas apenas 256 cores, limitando a qualidade.', porque: 'O GIF até guarda transparência, mas com 256 cores e bordas duras — um logo com degradê fica serrilhado.' },
      { id: 'd', text: 'Qualquer um serve.', porque: 'Não serve: dos três, só o PNG entrega transparência com qualidade. A escolha muda o resultado na tela.' },
    ]},
    explanation: 'PNG é ideal para logos: transparência real + milhões de cores + sem perda.',
  },
  {
    id: 'AP035.1-L5-Q6', type: 'fill_blank',
    prompt: 'Complete: JPEG usa compressão com _____, enquanto PNG usa compressão sem _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'perda', aceitas: ['perdas'], hint: 'JPEG perde qualidade ao comprimir' },
        { id: 'b2', answer: 'perda', hint: 'PNG não perde qualidade' },
      ],
    },
    explanation: 'JPEG = com perda (menor arquivo, menos qualidade). PNG = sem perda (maior arquivo, qualidade total).',
  },
];

// ═══════════════════════════════════════════════════════════
// MODULE 6 — INTELIGÊNCIA ARTIFICIAL
// ═══════════════════════════════════════════════════════════

const content_6L1 = `
<h2 class="text-xl font-bold mb-3">Inteligência Artificial</h2>
<p class="mb-3">A <strong>Inteligência Artificial (IA)</strong> é a capacidade de máquinas e sistemas de simular inteligência humana — aprender, raciocinar, tomar decisões e executar tarefas que normalmente requerem inteligência humana.</p>

<h3 class="font-bold mt-4 mb-2">Tipos de IA</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>IA Estreita (Narrow AI):</strong> Especializada em uma tarefa específica (ex: reconhecimento facial, xadrez, tradução)</li>
  <li><strong>IA Generativa:</strong> Cria novo conteúdo (texto, imagem, código) a partir de instruções (prompts). Ex: ChatGPT, DALL-E</li>
  <li><strong>IA Geral (AGI):</strong> Hipotética — capaz de qualquer tarefa intelectual humana (ainda não existe)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Como a IA aprende</h3>
<p class="mb-3">A IA aprende com <strong>dados</strong>. Quanto mais dados de qualidade, melhor o modelo. O processo é:</p>
<ol class="list-decimal list-inside space-y-1 mb-3">
  <li><strong>Treinamento:</strong> O modelo analisa milhões de exemplos</li>
  <li><strong>Padrões:</strong> Identifica padrões nos dados</li>
  <li><strong>Previsão/Geração:</strong> Usa os padrões para responder ou criar</li>
</ol>

<h3 class="font-bold mt-4 mb-2">Aplicações da IA</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>Assistentes virtuais (Siri, Alexa, Google Assistant)</li>
  <li>Recomendações (Netflix, YouTube, Spotify)</li>
  <li>Tradução automática (Google Translate)</li>
  <li>Reconhecimento de imagem (diagnóstico médico, segurança)</li>
  <li>Geração de texto, imagem e código (ChatGPT, DALL-E, Copilot)</li>
</ul>

<h3 class="font-bold mt-4 mb-2">Considerações éticas</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li>A IA pode gerar informações incorretas (alucinações)</li>
  <li>Pode reproduzir vieses presentes nos dados de treinamento</li>
  <li>O conteúdo gerado por IA deve ser revisado por humanos</li>
  <li>É uma ferramenta, não um substituto para pensamento crítico</li>
</ul>
`;

const rawQ_6L1: Question[] = [
  {
    id: 'AP035.6-L1-Q1', type: 'multiple_choice',
    prompt: 'O que é Inteligência Artificial (IA)?',
    data: { options: [
      { id: 'a', text: 'Sistemas que simulam inteligência humana, aprendendo com dados para realizar tarefas.', correct: true },
      { id: 'b', text: 'O endereço que se digita na barra do navegador para chegar a um conteúdo.', porque: 'Isso é a URL, o endereço. O site é o que se encontra ao seguir esse endereço.' },
      { id: 'c', text: 'Um navegador web criado para abrir páginas com mais rapidez.', porque: 'Navegador é programa que abre páginas. IA é a capacidade de aprender com dados e decidir a partir deles.' },
      { id: 'd', text: 'Um formato de imagem usado em páginas da web, capaz de guardar mais cores que os demais.', porque: 'Formato de imagem é um jeito de guardar figura. IA não é arquivo: é sistema que aprende.' },
    ]},
    explanation: 'IA é a capacidade de máquinas de aprender, raciocinar e executar tarefas que normalmente requerem inteligência humana.',
  },
  {
    id: 'AP035.6-L1-Q2', type: 'multiple_choice',
    prompt: 'Qual é um exemplo de IA generativa?',
    data: { options: [
      { id: 'a', text: 'ChatGPT, que gera texto a partir de prompts.', correct: true },
      { id: 'b', text: 'Um antivírus que encontra e remove ameaças sozinho.', porque: 'Antivírus compara com uma lista de ameaças conhecidas. Generativa é a IA que cria algo novo.' },
      { id: 'c', text: 'O computador ligado o tempo todo que guarda as páginas e as entrega a quem pede.', porque: 'Isso é o servidor. Ele hospeda o site, mas não é o site.' },
      { id: 'd', text: 'Um monitor de alta definição usado para edição.', porque: 'Monitor é equipamento, não programa. IA generativa é software que produz texto, imagem ou código.' },
    ]},
    explanation: 'IA generativa cria novo conteúdo (texto, imagem, código) a partir de instruções.',
  },
  {
    id: 'AP035.6-L1-Q3', type: 'matching',
    prompt: 'Associe cada tipo de IA à sua descrição.',
    data: {
      pairs: [
        { left: 'IA Estreita', right: 'Especializada em uma tarefa específica' },
        { left: 'IA Generativa', right: 'Cria novo conteúdo a partir de instruções' },
        { left: 'IA Geral (AGI)', right: 'Capaz de qualquer tarefa intelectual (hipotética)' },
      ],
    },
    explanation: 'A IA atual é "estreita" ou "generativa". A AGI ainda não existe.',
  },
  {
    id: 'AP035.6-L1-Q4', type: 'true_false',
    prompt: 'A IA pode gerar informações incorretas, conhecidas como alucinações.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. A IA pode afirmar com segurança algo que não existe — daí o nome alucinação. Por isso se confere antes de usar.' },
    ]},
    explanation: 'Modelos de IA podem produzir respostas plausíveis, mas factualmente incorretas.',
  },
  {
    id: 'AP035.6-L1-Q5', type: 'scenario',
    prompt: 'Você usa uma IA generativa para escrever um trabalho escolar. O que você deve fazer antes de entregar?',
    data: { scenarios: [
      { id: 'a', text: 'Revisar todo o conteúdo gerado, verificar as informações e adicionar sua própria análise.', correct: true },
      { id: 'b', text: 'Entregar exatamente como a ferramenta gerou, sem revisar nada.', porque: 'O texto pode conter erro de fato ou invenção. Entregar sem ler transfere a você a responsabilidade por algo que não conferiu.' },
      { id: 'c', text: 'Não usar inteligência artificial em nenhuma etapa do trabalho.', porque: 'Usar não é o problema — usar sem revisar é. A ferramenta ajuda a começar; a checagem e a análise continuam suas.' },
      { id: 'd', text: 'Esconder o uso da ferramenta, mesmo se alguém perguntar diretamente.', porque: 'Omitir quando perguntam é mentir sobre como o trabalho foi feito. Dizer que usou não tira o mérito de quem revisou e completou.' },
    ]},
    explanation: 'A IA é uma ferramenta. O conteúdo deve ser revisado e complementado com pensamento crítico.',
  },
  {
    id: 'AP035.6-L1-Q6', type: 'fill_blank',
    prompt: 'Complete: A IA aprende com _____. Quanto mais _____ de qualidade, melhor o modelo.',
    data: {
      blanks: [
        { id: 'b1', answer: 'dados', hint: 'A IA precisa disso para aprender' },
        { id: 'b2', answer: 'dados', hint: 'Mesma resposta — qualidade é essencial' },
      ],
    },
    explanation: 'Dados são o combustível da IA. Sem dados de qualidade, o modelo não aprende bem.',
  },
  {
    id: 'AP035.6-L1-Q7', type: 'ordering',
    prompt: 'Ordene as etapas de aprendizado de um modelo de IA.',
    data: {
      items: [
        { id: 'a', text: 'O modelo analisa milhões de exemplos (treinamento)', order: 1 },
        { id: 'b', text: 'O modelo identifica padrões nos dados', order: 2 },
        { id: 'c', text: 'O modelo usa os padrões para responder ou criar', order: 3 },
      ],
    },
    explanation: 'Treinamento → Padrões → Previsão/Geração.',
  },
];

// ═══════════════════════════════════════════════════════════
// SPECIALTY DEFINITION
// ═══════════════════════════════════════════════════════════

/* AP035-5.1 — "Gráficos para a web e ser capaz de explicar o processo utilizado
   para baixá-los rapidamente." O requisito pede a *explicação do processo*, não
   só o resultado, então a lição percorre as três decisões que compõem esse
   processo e o quiz cobra cada uma. */
const content_graficos = `
<h2 class="text-xl font-bold mb-3">Gráficos que carregam rápido</h2>
<p class="mb-3">Uma imagem bonita que demora dez segundos para aparecer é uma imagem ruim. Quem abre o site do clube pelo celular, no plano de dados, desiste antes. Deixar um gráfico leve não é sorte: é um processo com três decisões.</p>

<h3 class="font-bold mt-4 mb-2">1. Escolher o formato pelo conteúdo</h3>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Fotografia</strong> — milhões de cores, nenhuma área chapada: <strong>JPEG</strong>. Ele descarta detalhe que o olho não percebe e ganha muito espaço com isso.</li>
  <li><strong>Logo, ícone, desenho com poucas cores</strong> — <strong>PNG</strong> ou <strong>GIF</strong>. Guardam áreas de cor sólida quase de graça e preservam bordas nítidas.</li>
  <li><strong>Precisa de transparência</strong> — só <strong>PNG</strong> ou <strong>GIF</strong>. O JPEG não tem canal alfa; a área transparente vira fundo sólido.</li>
</ul>

<h3 class="font-bold mt-4 mb-2">2. Reduzir para o tamanho em que a imagem aparece</h3>
<p class="mb-3">Uma foto de celular chega com 3000 px de largura. Se ela aparece num espaço de 600 px, os outros 2400 px foram baixados para nada. <strong>Redimensionar antes de publicar</strong> é o passo que mais economiza — costuma cortar mais de 90% do arquivo sozinho.</p>

<h3 class="font-bold mt-4 mb-2">3. Comprimir até o limite do aceitável</h3>
<p class="mb-3">No JPEG dá para escolher a qualidade. Entre 70% e 85% quase ninguém vê diferença, e o arquivo cai à metade. No PNG, reduzir a paleta de cores tem efeito parecido. Vale sempre conferir o resultado: compressão demais aparece como manchas ao redor de texto e bordas.</p>

<h3 class="font-bold mt-4 mb-2">O que o navegador faz com isso</h3>
<p class="mb-3">O navegador baixa várias imagens ao mesmo tempo, mas cada uma ocupa parte da banda disponível. Quanto menor cada arquivo, mais cedo a página inteira fica pronta. Por isso a soma importa: dez imagens de 15 KB pesam menos que uma de 200 KB, e a página com dez aparece antes.</p>

<div class="rounded-lg p-4 mb-3" style="background-color: var(--color-secondary-a08); border: 1px solid var(--color-secondary-a20)">
  <p class="font-bold mb-1" style="color: var(--color-secondary)">A regra prática</p>
  <p>Escolha o formato pelo conteúdo, reduza para o tamanho de exibição e comprima até pouco antes de estragar. Nessa ordem — comprimir uma imagem grande demais é otimizar o desperdício.</p>
</div>
`;

const rawQ_graficos: Question[] = [
  {
    id: 'AP035.4-L0-Q1', type: 'multiple_choice',
    prompt: 'Dos três passos do processo, qual costuma reduzir mais o tamanho do arquivo?',
    data: { options: [
      { id: 'a', text: 'Redimensionar a imagem para o tamanho em que ela aparece na página.', correct: true },
      { id: 'b', text: 'Trocar o nome do arquivo por um mais curto antes de publicá-lo no servidor.', porque: 'O nome não ocupa espaço mensurável. O que pesa é a quantidade de pixels e a compressão.' },
      { id: 'c', text: 'Aumentar a qualidade do JPEG para 100% antes de enviar.', porque: 'Isso aumenta o arquivo, não reduz. Qualidade alta significa jogar fora menos informação.' },
      { id: 'd', text: 'Publicar a imagem numa pasta separada do restante do site.', porque: 'A pasta é organização e não muda um byte do arquivo.' },
    ]},
    explanation: 'Uma foto de 3000 px exibida em 600 px desperdiça quase todos os pixels baixados. Redimensionar corta mais de 90% antes de qualquer compressão.',
  },
  {
    id: 'AP035.4-L0-Q2', type: 'multiple_choice',
    prompt: 'Você tem um logo com fundo transparente. Qual formato serve?',
    data: { options: [
      { id: 'a', text: 'PNG, porque o JPEG não guarda transparência.', correct: true },
      { id: 'b', text: 'JPEG, porque é sempre o menor.', porque: 'Nem sempre é o menor, e o problema aqui é outro: o JPEG não guarda transparência.' },
      { id: 'c', text: 'Tanto faz: os três guardam transparência.', porque: 'Não guardam: o JPEG não tem transparência. Só o PNG e o GIF têm, e o GIF com limitações.' },
      { id: 'd', text: 'JPEG com qualidade 100%.', porque: 'Qualidade máxima não cria transparência. O formato simplesmente não prevê esse recurso.' },
    ]},
    explanation: 'O JPEG não tem canal alfa. Salvo nele, o fundo transparente vira uma cor sólida — normalmente preto ou branco.',
  },
  {
    id: 'AP035.4-L0-Q3', type: 'multiple_choice',
    prompt: 'Por que dez imagens de 15 KB carregam antes de uma única de 200 KB?',
    data: { options: [
      { id: 'a', text: 'Porque a soma dos bytes é menor e a banda é dividida entre downloads paralelos.', correct: true },
      { id: 'b', text: 'Porque o navegador ignora as imagens de tamanho reduzido.', porque: 'O navegador carrega todas. Nenhuma imagem é descartada por ser pequena.' },
      { id: 'c', text: 'Porque imagens pequenas demais não atravessam a rede inteira.', porque: 'Tamanho não impede a viagem. Arquivos de qualquer tamanho trafegam igual.' },
      { id: 'd', text: 'Porque o servidor prioriza o envio dos arquivos de nome mais curto.', porque: 'O servidor não olha o nome para decidir a ordem. O que pesa é o total de bytes e os downloads em paralelo.' },
    ]},
    explanation: '150 KB no total contra 200 KB, e o navegador baixa várias em paralelo. O que decide o tempo é a soma dos bytes.',
  },
];

export const ap035: Specialty = {
  code: 'AP035',
  name: 'Internet, Avançado',
  level: 'advanced',
  description: 'Especialidade avançada sobre internet: HTTP, HTML, imagens, sites e inteligência artificial.',
  requirements: [
    { code: 'AP035-1.1', title: 'Especialidade de Internet', description: 'Ter concluído a especialidade AP034 — Internet.', type: 'practice' },
    { code: 'AP035-2.1', title: 'HTTP', description: 'Explicar HTTP e HTTPS.', type: 'theory' },
    { code: 'AP035-2.2', title: 'Hyperlink', description: 'Explicar hyperlink.', type: 'theory' },
    { code: 'AP035-2.3', title: 'HTML e PHP', description: 'Diferenciar HTML e PHP.', type: 'theory' },
    { code: 'AP035-2.4', title: 'Navegadores seguros e cores hexadecimais', description: 'HTTPS, certificados e cores hex.', type: 'theory' },
    { code: 'AP035-2.5', title: 'URL', description: 'Estrutura de URL.', type: 'theory' },
    { code: 'AP035-2.6', title: 'GIF e PNG', description: 'Diferenciar GIF e PNG.', type: 'theory' },
    { code: 'AP035-2.7', title: 'JPEG', description: 'Explicar JPEG.', type: 'theory' },
    { code: 'AP035-3.1', title: '<html>', description: 'Elemento html.', type: 'practice' },
    { code: 'AP035-3.2', title: '<head>', description: 'Elemento head.', type: 'practice' },
    { code: 'AP035-3.3', title: '<body>', description: 'Elemento body.', type: 'practice' },
    { code: 'AP035-3.4', title: '<b>', description: 'Elemento b.', type: 'practice' },
    { code: 'AP035-3.5', title: '<i> e <li>', description: 'Elementos i e li.', type: 'practice' },
    { code: 'AP035-3.6', title: '<a href>', description: 'Elemento a com href.', type: 'practice' },
    { code: 'AP035-3.7', title: '<p>', description: 'Elemento p.', type: 'practice' },
    { code: 'AP035-3.8', title: '<br>', description: 'Elemento br.', type: 'practice' },
    { code: 'AP035-3.9', title: '<img>', description: 'Elemento img com src e alt.', type: 'practice' },
    { code: 'AP035-3.10', title: '<hr>', description: 'Elemento hr.', type: 'practice' },
    { code: 'AP035-3.11', title: '<table>', description: 'Elemento table.', type: 'practice' },
    { code: 'AP035-3.12', title: '<tr>', description: 'Elemento tr.', type: 'practice' },
    { code: 'AP035-3.13', title: '<td>', description: 'Elemento td.', type: 'practice' },
    { code: 'AP035-4.1', title: 'Tabela simples completa', description: 'Tabela com texto, gráfico, regra horizontal e link, texto colorido em hexadecimal e título maior.', type: 'practice' },
    { code: 'AP035-5.1', title: 'Gráficos para a web', description: 'Explicar o processo que faz os gráficos de um site serem baixados rapidamente.', type: 'theory' },
    { code: 'AP035-5.2', title: 'Imagens leves, botões e header', description: 'Um JPG e um GIF/PNG abaixo de 15 KB, cinco botões de navegação e um header.', type: 'practice' },
    { code: 'AP035-6.1', title: 'Site interligado de quatro páginas', description: 'Site de quatro páginas interligadas, com boas-vindas que indique a razão do site e traga uma imagem.', type: 'practice' },
    { code: 'AP035-6.2', title: 'Página de fotos', description: 'Página mostrando atividades e eventos vividos pelo desbravador ou seu grupo.', type: 'practice' },
    { code: 'AP035-6.3', title: 'Livro de visitas ou contato', description: 'Página onde visitantes deixam registro ou endereço de e-mail.', type: 'practice' },
    { code: 'AP035-7.1', title: 'Inteligência artificial', description: 'Explicar o que é IA e quais são os benefícios e os problemas do seu uso.', type: 'theory' },
    { code: 'AP035-8.1', title: 'Texto produzido com IA', description: 'Produzir com IA um texto sobre a importância do Clube de Desbravadores.', type: 'practice' },
    { code: 'AP035-8.2', title: 'Imagem produzida com IA', description: 'Produzir com IA uma imagem do Clube de Desbravadores acampando.', type: 'practice' },
    { code: 'AP035-8.3', title: 'Logo produzido com IA', description: 'Produzir com IA um logo usando o nome do Clube.', type: 'practice' },
  ],
  modules: [
    {
      code: 'AP035.0', title: 'Antes de começar', description: 'A trilha de Internet concluída é a porta de entrada desta.',
      lessons: [
        { code: 'AP035.0-L1', title: 'Pré-requisito: especialidade de Internet', type: 'lab', content: '', requirementCodes: ['AP035-1.1'], labType: 'prerequisite' },
      ],
    },
    {
      code: 'AP035.1', title: 'Como a página chega até você', description: 'Endereços, protocolos e o que acontece entre o clique e a tela.',
      lessons: [
        { code: 'AP035.1-L1', title: 'HTTP, HTTPS e Hyperlinks', type: 'theory', content: content_1L1, requirementCodes: ['AP035-2.1', 'AP035-2.2'], questions: rawQ_1L1 },
        { code: 'AP035.1-L2', title: 'HTML, PHP, Cliente e Servidor', type: 'theory', content: content_1L2, requirementCodes: ['AP035-2.3'], questions: rawQ_1L2 },
        { code: 'AP035.1-L3', title: 'Navegadores Seguros e Cores Hexadecimais', type: 'theory', content: content_1L3, requirementCodes: ['AP035-2.4'], questions: rawQ_1L3 },
        { code: 'AP035.1-L4', title: 'URL e Estrutura de Endereços', type: 'theory', content: content_1L4, requirementCodes: ['AP035-2.5'], questions: rawQ_1L4 },
        { code: 'AP035.1-L5', title: 'Formatos de Imagem: GIF, PNG e JPEG', type: 'theory', content: content_1L5, requirementCodes: ['AP035-2.6', 'AP035-2.7'], questions: rawQ_1L5 },
      ],
    },
    {
      code: 'AP035.2', title: 'Escrever a própria página', description: 'As etiquetas do HTML, escritas à mão e conferidas na hora.',
      lessons: [
        { code: 'AP035.2-L1', title: 'CodeLab — Editor HTML', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">CodeLab — Editor HTML</h2><p class="mb-3">Neste laboratório você vai escrever código HTML real e testá-lo automaticamente. O editor verifica se seu código contém todos os elementos HTML exigidos pela especialidade.</p><p class="mb-3">Elementos exigidos: <code style="color: var(--color-secondary)">&lt;html&gt;</code>, <code style="color: var(--color-secondary)">&lt;head&gt;</code>, <code style="color: var(--color-secondary)">&lt;body&gt;</code>, <code style="color: var(--color-secondary)">&lt;b&gt;</code>, <code style="color: var(--color-secondary)">&lt;i&gt;</code>, <code style="color: var(--color-secondary)">&lt;li&gt;</code>, <code style="color: var(--color-secondary)">&lt;a href&gt;</code>, <code style="color: var(--color-secondary)">&lt;p&gt;</code>, <code style="color: var(--color-secondary)">&lt;br&gt;</code>, <code style="color: var(--color-secondary)">&lt;img&gt;</code>, <code style="color: var(--color-secondary)">&lt;hr&gt;</code>, <code style="color: var(--color-secondary)">&lt;table&gt;</code>, <code style="color: var(--color-secondary)">&lt;tr&gt;</code>, <code style="color: var(--color-secondary)">&lt;td&gt;</code>.</p>', requirementCodes: ['AP035-3.1', 'AP035-3.2', 'AP035-3.3', 'AP035-3.4', 'AP035-3.5', 'AP035-3.6', 'AP035-3.7', 'AP035-3.8', 'AP035-3.9', 'AP035-3.10', 'AP035-3.11', 'AP035-3.12', 'AP035-3.13'], labType: 'code_lab' },
      ],
    },
    {
      code: 'AP035.3', title: 'Organizar em tabela', description: 'Pôr informação em linhas e colunas, e deixar a página apresentável.',
      lessons: [
        { code: 'AP035.3-L1', title: 'Desafio: Página com Tabela', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">Desafio: Página com Tabela</h2><p class="mb-3">Agora que você praticou com os elementos individuais no CodeLab, crie uma página HTML completa que inclua uma tabela com dados reais. Use sua criatividade — pode ser uma tabela de horários, de produtos, de notas, etc.</p><p class="mb-3">Lembre-se de incluir: <code style="color: var(--color-secondary)">&lt;table&gt;</code>, <code style="color: var(--color-secondary)">&lt;tr&gt;</code> (linhas) e <code style="color: var(--color-secondary)">&lt;td&gt;</code> (células).</p>', requirementCodes: ['AP035-4.1'], labType: 'table_challenge' },
      ],
    },
    {
      code: 'AP035.4', title: 'Imagens que carregam rápido', description: 'Escolher o formato certo e o tamanho que não faz ninguém esperar.',
      lessons: [
        { code: 'AP035.4-L0', title: 'Gráficos que carregam rápido', type: 'theory', content: content_graficos, requirementCodes: ['AP035-5.1'], questions: rawQ_graficos },
        { code: 'AP035.4-L1', title: 'ImageLab — Otimização de Imagens', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">ImageLab — Otimização de Imagens</h2><p class="mb-3">Neste laboratório você vai produzir quatro imagens de verdade: uma fotografia otimizada em JPEG, um logo em PNG com fundo transparente, um botão e um header. Ao final, os quatro arquivos ficam salvos no seu dispositivo.</p><p class="mb-3">Escolher o formato certo é o que decide se a página abre rápido ou trava no 3G do acampamento. O JPEG descarta detalhe que o olho não percebe e vence em fotografias; o PNG guarda cada pixel e é o único que guarda transparência — sem ele, o logo do clube viaja dentro de uma caixa branca.</p><p class="mb-3">Cada etapa já vem preenchida com um defeito de propósito. Descubra qual é e corrija: as verificações medem os pixels e os bytes que você gerou, não a resposta que você escolheu.</p>', requirementCodes: ['AP035-5.2'], labType: 'image_lab' },
      ],
    },
    {
      code: 'AP035.5', title: 'Um site de verdade', description: 'Quatro páginas ligadas entre si, do começo ao fim.',
      lessons: [
        { code: 'AP035.5-L1', title: 'SiteLab — Projeto de Site', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">SiteLab — Projeto de Site</h2><p class="mb-3">Crie um site completo com quatro páginas interligadas: <strong>Início</strong>, <strong>Sobre</strong>, <strong>Contato</strong> e <strong>Galeria</strong>. Cada página deve ter navegação consistente (menu com links) e a página de contato deve incluir um formulário.</p><p class="mb-3">Use a tag <code style="color: var(--color-secondary)">&lt;a href="pagina.html"&gt;</code> para criar os links entre as páginas. O formulário deve usar <code style="color: var(--color-secondary)">&lt;form&gt;</code>, <code style="color: var(--color-secondary)">&lt;input&gt;</code> e <code style="color: var(--color-secondary)">&lt;button&gt;</code>.</p>', requirementCodes: ['AP035-6.1', 'AP035-6.2', 'AP035-6.3'], labType: 'site_lab' },
      ],
    },
    {
      code: 'AP035.6', title: 'O que a IA faz, e o que não faz', description: 'Como essas ferramentas funcionam por dentro, e onde elas erram.',
      lessons: [
        { code: 'AP035.6-L1', title: 'Inteligência Artificial — Conceitos', type: 'theory', content: content_6L1, requirementCodes: ['AP035-7.1'], questions: rawQ_6L1 },
      ],
    },
    {
      code: 'AP035.7', title: 'Pedir bem, e conferir', description: 'Montar um pedido peça por peça, e julgar o que voltou.',
      lessons: [
        { code: 'AP035.7-L1', title: 'AI Lab — Produção com IA', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">AI Lab — Produção com IA</h2><p class="mb-3">Neste laboratório você vai usar IA generativa para criar conteúdo: gerar texto, gerar uma imagem e criar um logo para um clube. Depois, você vai avaliar criticamente os resultados.</p><p class="mb-3">Lembre-se: a IA é uma ferramenta. O conteúdo gerado deve ser revisado e melhorado por você. A IA pode cometer erros ou produzir conteúdo inadequado.</p>', requirementCodes: ['AP035-8.1', 'AP035-8.2', 'AP035-8.3'], labType: 'ai_lab' },
      ],
    },
    {
      code: 'AP035.F', title: 'Avaliação Final', description: 'A prova que fecha a trilha, com questões de todos os requisitos.',
      lessons: [
        { code: 'AP035.F-L1', title: 'Avaliação Final — Internet, Avançado', type: 'final', content: '', requirementCodes: [], labType: 'final_exam' },
      ],
    },
  ],
};
