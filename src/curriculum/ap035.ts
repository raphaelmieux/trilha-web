import type { Specialty, Question } from '../types';
import { shuffleArray } from '../lib/progress';

export function shuffleQuestionOptions(q: Question): Question {
  if (q.data.options) return { ...q, data: { ...q.data, options: shuffleArray(q.data.options) } };
  if (q.data.scenarios) return { ...q, data: { ...q.data, scenarios: shuffleArray(q.data.scenarios) } };
  return q;
}
export function shuffleAllQuestions(qs: Question[]): Question[] { return qs.map(shuffleQuestionOptions); }

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
      { id: 'b', text: 'Enviar e-mails entre servidores.' },
      { id: 'c', text: 'Compactar arquivos para download.' },
      { id: 'd', text: 'Proteger contra vírus de computador.' },
    ]},
    explanation: 'HTTP (HyperText Transfer Protocol) é o protocolo de comunicação da Web.',
  },
  {
    id: 'AP035.1-L1-Q2', type: 'multiple_choice',
    prompt: 'O que o HTTPS adiciona em relação ao HTTP?',
    data: { options: [
      { id: 'a', text: 'Criptografia TLS/SSL para proteger os dados em trânsito.', correct: true },
      { id: 'b', text: 'Maior velocidade de download.' },
      { id: 'c', text: 'Compressão de imagens automática.' },
      { id: 'd', text: 'Tradução de páginas.' },
    ]},
    explanation: 'HTTPS = HTTP + TLS/SSL. O cadeado no navegador indica conexão segura.',
  },
  {
    id: 'AP035.1-L1-Q3', type: 'multiple_choice',
    prompt: 'O que é um hyperlink (link)?',
    data: { options: [
      { id: 'a', text: 'Uma referência que liga um documento a outro recurso na web.', correct: true },
      { id: 'b', text: 'Um tipo de vírus.' },
      { id: 'c', text: 'Um protocolo de e-mail.' },
      { id: 'd', text: 'Um formato de imagem.' },
    ]},
    explanation: 'Hyperlinks conectam páginas, permitindo a navegação entre recursos da web.',
  },
  {
    id: 'AP035.1-L1-Q4', type: 'true_false',
    prompt: 'HTTP é um protocolo stateless — cada requisição é independente, sem memória de requisições anteriores.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
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
      { id: 'b', text: 'Verificar se o site carrega rápido.' },
      { id: 'c', text: 'Verificar se a página tem cores vibrantes.' },
      { id: 'd', text: 'Não é possível verificar; basta confiar.' },
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
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Cliente (Navegador)</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Servidor</th>
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
      { id: 'b', text: 'HTML é mais moderno que PHP.' },
      { id: 'c', text: 'PHP é apenas para design; HTML é para lógica.' },
      { id: 'd', text: 'São a mesma linguagem com nomes diferentes.' },
    ]},
    explanation: 'HTML estrutura a página no navegador; PHP gera conteúdo dinamicamente no servidor.',
  },
  {
    id: 'AP035.1-L2-Q2', type: 'multiple_choice',
    prompt: 'Onde o PHP é executado?',
    data: { options: [
      { id: 'a', text: 'No servidor, antes de enviar a página ao cliente.', correct: true },
      { id: 'b', text: 'No navegador do usuário.' },
      { id: 'c', text: 'No roteador de Internet.' },
      { id: 'd', text: 'No provedor de e-mail.' },
    ]},
    explanation: 'PHP roda no servidor. O usuário recebe apenas o HTML resultante, nunca o código PHP.',
  },
  {
    id: 'AP035.1-L2-Q3', type: 'true_false',
    prompt: 'HTML é uma linguagem de programação.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro' },
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
      { id: 'b', text: 'No navegador — o HTML verifica a senha localmente.' },
      { id: 'c', text: 'No roteador Wi-Fi.' },
      { id: 'd', text: 'No provedor de Internet (ISP).' },
    ]},
    explanation: 'A verificação de senha é lógica de servidor (PHP/Python/etc.), não de cliente (HTML).',
  },
  {
    id: 'AP035.1-L2-Q6', type: 'fill_blank',
    prompt: 'Complete: O usuário vê o código _____, mas nunca vê o código _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'HTML', hint: 'Linguagem de marcação visível no navegador' },
        { id: 'b2', answer: 'PHP', hint: 'Linguagem de programação executada no servidor' },
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
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Cor</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Hexadecimal</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Significado</th>
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
      { id: 'b', text: 'Pela velocidade da página.' },
      { id: 'c', text: 'Pelo tamanho da janela do navegador.' },
      { id: 'd', text: 'Pela cor do botão de atualizar.' },
    ]},
    explanation: 'O cadeado e https:// indicam que a conexão está criptografada com TLS.',
  },
  {
    id: 'AP035.1-L3-Q2', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor branca?',
    data: { options: [
      { id: 'a', text: 'var(--color-text)', correct: true },
      { id: 'b', text: 'var(--color-bg)' },
      { id: 'c', text: '#FF0000' },
      { id: 'd', text: '#00FF00' },
    ]},
    explanation: 'var(--color-text) = máximo de vermelho, verde e azul = branco. var(--color-bg) = preto.',
  },
  {
    id: 'AP035.1-L3-Q3', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor preta?',
    data: { options: [
      { id: 'a', text: 'var(--color-bg)', correct: true },
      { id: 'b', text: 'var(--color-text)' },
      { id: 'c', text: '#FF0000' },
      { id: 'd', text: '#0000FF' },
    ]},
    explanation: 'var(--color-bg) = ausência de vermelho, verde e azul = preto.',
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
        { left: 'var(--color-text)', right: 'Branco' },
        { left: 'var(--color-bg)', right: 'Preto' },
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
      { id: 'b', text: '#FF0000 — isso é vermelho, não azul.' },
      { id: 'c', text: '#00FF00 — isso é verde, não azul.' },
      { id: 'd', text: 'var(--color-text) — isso é branco, não azul.' },
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
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Parte</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Exemplo</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Função</th>
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
      { id: 'b', text: 'Um tipo de vírus.' },
      { id: 'c', text: 'Um programa de e-mail.' },
      { id: 'd', text: 'Um formato de imagem.' },
    ]},
    explanation: 'URL = Uniform Resource Locator. Ex: https://exemplo.com/pagina',
  },
  {
    id: 'AP035.1-L4-Q2', type: 'fill_blank',
    prompt: 'Na URL https://exemplo.com/pagina, identifique as partes.',
    data: {
      blanks: [
        { id: 'b1', answer: 'protocolo', hint: 'https' },
        { id: 'b2', answer: 'domínio', hint: 'exemplo.com' },
        { id: 'b3', answer: 'caminho', hint: '/pagina' },
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
      { id: 'b', text: 'Falso' },
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
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">Recurso</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">JPEG</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">PNG</th>
    <th class="text-left py-2" style="color: 'var(--color-text-dim)'">GIF</th>
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
      { id: 'b', text: 'PNG é animado e GIF não.' },
      { id: 'c', text: 'GIF é melhor para fotos; PNG é melhor para texto.' },
      { id: 'd', text: 'Não há diferença.' },
    ]},
    explanation: 'GIF: 256 cores + animação. PNG: milhões de cores + transparência, sem animação.',
  },
  {
    id: 'AP035.1-L5-Q2', type: 'multiple_choice',
    prompt: 'Qual é a principal característica do formato JPEG?',
    data: { options: [
      { id: 'a', text: 'Compressão com perda, ideal para fotografias com milhões de cores.', correct: true },
      { id: 'b', text: 'Suporte a transparência e animação.' },
      { id: 'c', text: 'Sem compressão, arquivo muito grande.' },
      { id: 'd', text: 'Apenas 256 cores.' },
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
    prompt: 'O formato PNG suporta transparência.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'PNG suporta transparência com canal alpha. JPEG não suporta.',
  },
  {
    id: 'AP035.1-L5-Q5', type: 'scenario',
    prompt: 'Você precisa salvar um logo com fundo transparente para usar em um site. Qual formato escolher?',
    data: { scenarios: [
      { id: 'a', text: 'PNG — suporta transparência e mantém qualidade sem perda.', correct: true },
      { id: 'b', text: 'JPEG — não suporta transparência, o fundo ficaria branco.' },
      { id: 'c', text: 'GIF — suporta transparência, mas apenas 256 cores, limitando a qualidade.' },
      { id: 'd', text: 'Qualquer um serve.' },
    ]},
    explanation: 'PNG é ideal para logos: transparência real + milhões de cores + sem perda.',
  },
  {
    id: 'AP035.1-L5-Q6', type: 'fill_blank',
    prompt: 'Complete: JPEG usa compressão com _____, enquanto PNG usa compressão sem _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'perda', hint: 'JPEG perde qualidade ao comprimir' },
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
      { id: 'b', text: 'Um tipo de vírus de computador.' },
      { id: 'c', text: 'Um navegador web.' },
      { id: 'd', text: 'Um formato de imagem.' },
    ]},
    explanation: 'IA é a capacidade de máquinas de aprender, raciocinar e executar tarefas que normalmente requerem inteligência humana.',
  },
  {
    id: 'AP035.6-L1-Q2', type: 'multiple_choice',
    prompt: 'Qual é um exemplo de IA generativa?',
    data: { options: [
      { id: 'a', text: 'ChatGPT, que gera texto a partir de prompts.', correct: true },
      { id: 'b', text: 'Um antivírus que remove vírus.' },
      { id: 'c', text: 'Um cabo de rede.' },
      { id: 'd', text: 'Um monitor de computador.' },
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
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Modelos de IA podem produzir respostas plausíveis, mas factualmente incorretas.',
  },
  {
    id: 'AP035.6-L1-Q5', type: 'scenario',
    prompt: 'Você usa uma IA generativa para escrever um trabalho escolar. O que você deve fazer antes de entregar?',
    data: { scenarios: [
      { id: 'a', text: 'Revisar todo o conteúdo gerado, verificar as informações e adicionar sua própria análise.', correct: true },
      { id: 'b', text: 'Entregar exatamente como a IA gerou, sem revisar.' },
      { id: 'c', text: 'Não usar IA para nada.' },
      { id: 'd', text: 'Esconder que usou IA, mesmo que perguntarem.' },
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

export const ap035: Specialty = {
  code: 'AP035',
  name: 'Internet, Avançado',
  level: 'advanced',
  description: 'Especialidade avançada sobre internet: HTTP, HTML, imagens, sites e inteligência artificial.',
  requirements: [
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
    { code: 'AP035-3.14', title: 'Página com tabela', description: 'Criar página completa.', type: 'practice' },
    { code: 'AP035-4.1', title: 'Imagens para Web', description: 'JPEG, PNG, botões e header.', type: 'practice' },
    { code: 'AP035-5.1', title: 'Site com quatro páginas', description: 'Site interligado e formulário.', type: 'practice' },
    { code: 'AP035-6.1', title: 'Inteligência Artificial', description: 'Conceitos de IA.', type: 'theory' },
    { code: 'AP035-7.1', title: 'Produção com IA', description: 'Texto, imagem e logo.', type: 'practice' },
  ],
  modules: [
    {
      code: 'AP035.1', title: 'Conceitos Avançados', description: 'HTTP, hyperlinks, HTML, PHP, URLs, imagens e cores.',
      lessons: [
        { code: 'AP035.1-L1', title: 'HTTP, HTTPS e Hyperlinks', type: 'theory', content: content_1L1, requirementCodes: ['AP035-2.1', 'AP035-2.2'], questions: rawQ_1L1 },
        { code: 'AP035.1-L2', title: 'HTML, PHP, Cliente e Servidor', type: 'theory', content: content_1L2, requirementCodes: ['AP035-2.3'], questions: rawQ_1L2 },
        { code: 'AP035.1-L3', title: 'Navegadores Seguros e Cores Hexadecimais', type: 'theory', content: content_1L3, requirementCodes: ['AP035-2.4'], questions: rawQ_1L3 },
        { code: 'AP035.1-L4', title: 'URL e Estrutura de Endereços', type: 'theory', content: content_1L4, requirementCodes: ['AP035-2.5'], questions: rawQ_1L4 },
        { code: 'AP035.1-L5', title: 'Formatos de Imagem: GIF, PNG e JPEG', type: 'theory', content: content_1L5, requirementCodes: ['AP035-2.6', 'AP035-2.7'], questions: rawQ_1L5 },
      ],
    },
    {
      code: 'AP035.2', title: 'HTML — CodeLab', description: 'Editor de código com testes.',
      lessons: [
        { code: 'AP035.2-L1', title: 'CodeLab — Editor HTML', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">CodeLab — Editor HTML</h2><p class="mb-3">Neste laboratório você vai escrever código HTML real e testá-lo automaticamente. O editor verifica se seu código contém todos os elementos HTML exigidos pela especialidade.</p><p class="mb-3">Elementos exigidos: <code style="color: var(--color-secondary)">&lt;html&gt;</code>, <code style="color: var(--color-secondary)">&lt;head&gt;</code>, <code style="color: var(--color-secondary)">&lt;body&gt;</code>, <code style="color: var(--color-secondary)">&lt;b&gt;</code>, <code style="color: var(--color-secondary)">&lt;i&gt;</code>, <code style="color: var(--color-secondary)">&lt;li&gt;</code>, <code style="color: var(--color-secondary)">&lt;a href&gt;</code>, <code style="color: var(--color-secondary)">&lt;p&gt;</code>, <code style="color: var(--color-secondary)">&lt;br&gt;</code>, <code style="color: var(--color-secondary)">&lt;img&gt;</code>, <code style="color: var(--color-secondary)">&lt;hr&gt;</code>, <code style="color: var(--color-secondary)">&lt;table&gt;</code>, <code style="color: var(--color-secondary)">&lt;tr&gt;</code>, <code style="color: var(--color-secondary)">&lt;td&gt;</code>.</p>', requirementCodes: ['AP035-3.1', 'AP035-3.2', 'AP035-3.3', 'AP035-3.4', 'AP035-3.5', 'AP035-3.6', 'AP035-3.7', 'AP035-3.8', 'AP035-3.9', 'AP035-3.10', 'AP035-3.11', 'AP035-3.12', 'AP035-3.13'], labType: 'code_lab' },
      ],
    },
    {
      code: 'AP035.3', title: 'Tabela e Página Visual', description: 'Página com tabela e elementos.',
      lessons: [
        { code: 'AP035.3-L1', title: 'Desafio: Página com Tabela', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">Desafio: Página com Tabela</h2><p class="mb-3">Agora que você praticou com os elementos individuais no CodeLab, crie uma página HTML completa que inclua uma tabela com dados reais. Use sua criatividade — pode ser uma tabela de horários, de produtos, de notas, etc.</p><p class="mb-3">Lembre-se de incluir: <code style="color: var(--color-secondary)">&lt;table&gt;</code>, <code style="color: var(--color-secondary)">&lt;tr&gt;</code> (linhas) e <code style="color: var(--color-secondary)">&lt;td&gt;</code> (células).</p>', requirementCodes: ['AP035-3.14'], labType: 'code_lab' },
      ],
    },
    {
      code: 'AP035.4', title: 'Imagens para Web', description: 'ImageLab: otimização de imagens.',
      lessons: [
        { code: 'AP035.4-L1', title: 'ImageLab — Otimização de Imagens', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">ImageLab — Otimização de Imagens</h2><p class="mb-3">Neste laboratório você vai criar diferentes tipos de imagens para web: uma imagem JPEG (para fotos), uma imagem PNG (para logos com transparência), um botão web e um header para site.</p><p class="mb-3">Cada tipo de imagem tem um propósito específico. Escolher o formato certo reduz o tamanho do arquivo e mantém a qualidade visual.</p>', requirementCodes: ['AP035-4.1'], labType: 'image_lab' },
      ],
    },
    {
      code: 'AP035.5', title: 'Site com Quatro Páginas', description: 'SiteLab: projeto de site.',
      lessons: [
        { code: 'AP035.5-L1', title: 'SiteLab — Projeto de Site', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">SiteLab — Projeto de Site</h2><p class="mb-3">Crie um site completo com quatro páginas interligadas: <strong>Início</strong>, <strong>Sobre</strong>, <strong>Contato</strong> e <strong>Galeria</strong>. Cada página deve ter navegação consistente (menu com links) e a página de contato deve incluir um formulário.</p><p class="mb-3">Use a tag <code style="color: var(--color-secondary)">&lt;a href="pagina.html"&gt;</code> para criar os links entre as páginas. O formulário deve usar <code style="color: var(--color-secondary)">&lt;form&gt;</code>, <code style="color: var(--color-secondary)">&lt;input&gt;</code> e <code style="color: var(--color-secondary)">&lt;button&gt;</code>.</p>', requirementCodes: ['AP035-5.1'], labType: 'site_lab' },
      ],
    },
    {
      code: 'AP035.6', title: 'Inteligência Artificial', description: 'Conceitos de IA.',
      lessons: [
        { code: 'AP035.6-L1', title: 'Inteligência Artificial — Conceitos', type: 'theory', content: content_6L1, requirementCodes: ['AP035-6.1'], questions: rawQ_6L1 },
      ],
    },
    {
      code: 'AP035.7', title: 'Produção com IA', description: 'AI Lab: texto, imagem e logo.',
      lessons: [
        { code: 'AP035.7-L1', title: 'AI Lab — Produção com IA', type: 'lab', content: '<h2 class="text-xl font-bold mb-3">AI Lab — Produção com IA</h2><p class="mb-3">Neste laboratório você vai usar IA generativa para criar conteúdo: gerar texto, gerar uma imagem e criar um logo para um clube. Depois, você vai avaliar criticamente os resultados.</p><p class="mb-3">Lembre-se: a IA é uma ferramenta. O conteúdo gerado deve ser revisado e melhorado por você. A IA pode cometer erros ou produzir conteúdo inadequado.</p>', requirementCodes: ['AP035-7.1'], labType: 'ai_lab' },
      ],
    },
    {
      code: 'AP035.F', title: 'Avaliação Final', description: 'Avaliação adaptativa avançada.',
      lessons: [
        { code: 'AP035.F-L1', title: 'Avaliação Final — Internet, Avançado', type: 'final', content: '', requirementCodes: [], labType: 'final_exam' },
      ],
    },
  ],
};
