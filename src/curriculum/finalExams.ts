import type { Question } from '../types';
import { shuffleArray } from '../lib/progress';

function shuffleOptions(q: Question): Question {
  if (q.data.options) return { ...q, data: { ...q.data, options: shuffleArray(q.data.options) } };
  if (q.data.scenarios) return { ...q, data: { ...q.data, scenarios: shuffleArray(q.data.scenarios) } };
  return q;
}
function shuffleAll(qs: Question[]): Question[] { return qs.map(shuffleOptions); }

const rawAp034Final: Question[] = [
  {
    id: 'AP034-F-Q1', type: 'multiple_choice',
    prompt: 'A Internet é melhor definida como:',
    data: { options: [
      { id: 'a', text: 'Uma rede global de computadores interconectados que trocam dados por protocolos padronizados.', correct: true },
      { id: 'b', text: 'Um programa de navegação instalado no computador, usado para abrir sites, vídeos e mensagens de correio.' },
      { id: 'c', text: 'Um site de busca que reúne e organiza todo o conteúdo publicado no mundo.' },
      { id: 'd', text: 'Um único cabo submarino que liga os continentes e por onde passam todos os dados.' },
    ]},
    explanation: 'A Internet é uma rede de redes, interconectada globalmente por protocolos como TCP/IP.',
  },
  {
    id: 'AP034-F-Q2', type: 'multiple_choice',
    prompt: 'A World Wide Web (WWW) é:',
    data: { options: [
      { id: 'a', text: 'Um serviço que funciona sobre a Internet, permitindo acessar páginas por navegadores.', correct: true },
      { id: 'b', text: 'O mesmo que a Internet, apenas com outro nome, já que as duas nasceram juntas.' },
      { id: 'c', text: 'Um protocolo de e-mail que entrega mensagens entre os servidores de correio.' },
      { id: 'd', text: 'Um antivírus que acompanha o navegador e examina cada página desconhecida antes de exibi-la.' },
    ]},
    explanation: 'A WWW é um dos serviços da Internet, como e-mail e FTP. Não é sinônimo de Internet.',
  },
  {
    id: 'AP034-F-Q3', type: 'multiple_choice',
    prompt: 'Fazer um "download" significa:',
    data: { options: [
      { id: 'a', text: 'Transferir um arquivo de um servidor remoto para o seu computador.', correct: true },
      { id: 'b', text: 'Enviar um arquivo guardado no seu computador para um servidor na Internet.' },
      { id: 'c', text: 'Apagar um arquivo do computador em definitivo, sem passar pela lixeira.' },
      { id: 'd', text: 'Comprimir um arquivo para que ele ocupe menos espaço no disco do computador.' },
    ]},
    explanation: 'Download = baixar/receber. Upload = enviar.',
  },
  {
    id: 'AP034-F-Q4', type: 'true_false',
    prompt: 'O e-mail é um sistema de troca de mensagens digitais que funciona sobre a Internet.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'E-mail (correio eletrônico) é um dos serviços mais antigos da Internet.',
  },
  {
    id: 'AP034-F-Q5', type: 'multiple_choice',
    prompt: 'Vírus de computador e malware são:',
    data: { options: [
      { id: 'a', text: 'Vírus é um tipo de malware; malware é o termo genérico para qualquer software malicioso.', correct: true },
      { id: 'b', text: 'Termos sinônimos, sem qualquer distinção técnica ou prática entre um e outro.' },
      { id: 'c', text: 'Malware é o programa que protege a máquina, e vírus é o que tenta invadi-la.' },
      { id: 'd', text: 'Vírus atinge apenas mensagens de e-mail, enquanto malware atinge apenas os sites que a pessoa visita.' },
    ]},
    explanation: 'Malware é o guarda-chuva: vírus, worms, trojans, spyware e ransomware são todos malware.',
  },
  {
    id: 'AP034-F-Q6', type: 'multiple_choice',
    prompt: 'Qual protocolo baixa e-mails removendo-os do servidor?',
    data: { options: [
      { id: 'a', text: 'POP3', correct: true },
      { id: 'b', text: 'IMAP' },
      { id: 'c', text: 'SMTP' },
      { id: 'd', text: 'HTTP' },
    ]},
    explanation: 'POP3 baixa e remove. IMAP sincroniza. SMTP envia. HTTP é web.',
  },
  {
    id: 'AP034-F-Q7', type: 'multiple_choice',
    prompt: 'Qual é a principal vantagem do IMAP sobre o POP3?',
    data: { options: [
      { id: 'a', text: 'Mantém as mesmas mensagens e pastas sincronizadas em todos os dispositivos usados.', correct: true },
      { id: 'b', text: 'É mais rápido para enviar mensagens, porque abre uma conexão direta com o aparelho de quem recebe.' },
      { id: 'c', text: 'Dispensa a senha, porque a autenticação fica guardada no próprio servidor.' },
      { id: 'd', text: 'Compacta os anexos automaticamente, reduzindo o espaço da caixa de entrada.' },
    ]},
    explanation: 'IMAP mantém as mensagens no servidor, permitindo sincronização entre dispositivos.',
  },
  {
    id: 'AP034-F-Q8', type: 'multiple_choice',
    prompt: 'O que é streaming de mídia?',
    data: { options: [
      { id: 'a', text: 'Transmissão contínua de áudio/vídeo pela Internet, permitindo assistir enquanto carrega.', correct: true },
      { id: 'b', text: 'Baixar o arquivo inteiro no aparelho antes de começar a assistir ou ouvir.' },
      { id: 'c', text: 'Um tipo de vírus que se instala junto com os arquivos de música e de vídeo baixados da rede.' },
      { id: 'd', text: 'Um formato de compactação de vídeo que encolhe o arquivo antes do envio.' },
    ]},
    explanation: 'Streaming entrega conteúdo em tempo real, sem precisar baixar o arquivo inteiro.',
  },
  {
    id: 'AP034-F-Q9', type: 'ordering',
    prompt: 'Ordene as fases da infecção por vírus de computador, da entrada à consequência.',
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
    id: 'AP034-F-Q9b', type: 'ordering',
    prompt: 'Ordene os passos para enviar um e-mail com anexo.',
    data: {
      items: [
        { id: 'a', text: 'Abrir o cliente de e-mail e clicar em "Escrever"', order: 1 },
        { id: 'b', text: 'Digitar o endereço do destinatário', order: 2 },
        { id: 'c', text: 'Escrever o assunto e a mensagem', order: 3 },
        { id: 'd', text: 'Anexar o arquivo desejado', order: 4 },
        { id: 'e', text: 'Clicar em "Enviar"', order: 5 },
      ],
    },
    explanation: 'Abrir → Digitar destinatário → Escrever mensagem → Anexar arquivo → Enviar.',
  },
  {
    id: 'AP034-F-Q10', type: 'matching',
    prompt: 'Associe cada termo à sua definição correta.',
    data: {
      pairs: [
        { left: 'Internet', right: 'Rede global de computadores interconectados' },
        { left: 'WWW', right: 'Serviço de páginas web acessadas por navegador' },
        { left: 'Download', right: 'Transferir arquivo do servidor para o computador' },
        { left: 'Upload', right: 'Transferir arquivo do computador para o servidor' },
        { left: 'Vírus', right: 'Programa malicioso que se replica e causa danos' },
        { left: 'Antivírus', right: 'Programa que detecta e remove ameaças' },
        { left: 'E-mail', right: 'Sistema de troca de mensagens digitais' },
      ],
    },
    explanation: 'Cada termo tem uma função específica no ecossistema da Internet.',
  },
  {
    id: 'AP034-F-Q11', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre navegação segura.',
    data: {
      blanks: [
        { id: 'b1', answer: 'antivírus', hint: 'Programa que protege contra software malicioso' },
        { id: 'b2', answer: 'download', hint: 'Ação de baixar um arquivo da Internet' },
        { id: 'b3', answer: 'phishing', hint: 'Golpe que tenta enganar o usuário por e-mail ou site falso' },
      ],
    },
    explanation: 'Antivírus protege, download é baixar arquivos, phishing é enganar o usuário para roubar dados.',
  },
  {
    id: 'AP034-F-Q11b', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre protocolos de e-mail.',
    data: {
      blanks: [
        { id: 'b1', answer: 'POP3', hint: 'Protocolo que baixa e-mails removendo do servidor' },
        { id: 'b2', answer: 'IMAP', hint: 'Protocolo que sincroniza e-mails entre dispositivos' },
        { id: 'b3', answer: 'SMTP', hint: 'Protocolo usado para enviar e-mails' },
      ],
    },
    explanation: 'POP3 baixa e remove, IMAP sincroniza, SMTP envia mensagens.',
  },
  {
    id: 'AP034-F-Q12', type: 'scenario',
    prompt: 'Você recebe um e-mail de um remetente desconhecido com o assunto "URGENTE: Sua conta será bloqueada!" e um link para clicar. O que você deve fazer?',
    data: {
      scenarios: [
        { id: 'a', text: 'Não clicar no link, não responder, excluir o e-mail e avisar um responsável.', correct: true },
        { id: 'b', text: 'Clicar no link para conferir se a conta está mesmo bloqueada antes de decidir.' },
        { id: 'c', text: 'Responder ao remetente pedindo mais informações sobre o suposto bloqueio.' },
        { id: 'd', text: 'Encaminhar a mensagem para todos os amigos, para avisá-los do mesmo risco.' },
      ],
    },
    explanation: 'E-mails com urgência e links suspeitos são clássicos de phishing. Nunca clique; avise um adulto.',
  },
  {
    id: 'AP034-F-Q13', type: 'scenario',
    prompt: 'Um amigo virtual pede seu endereço e telefone para te enviar um presente. O que você faz?',
    data: {
      scenarios: [
        { id: 'a', text: 'Não revelar informações pessoais e conversar com um responsável sobre o pedido.', correct: true },
        { id: 'b', text: 'Enviar o endereço completo, já que a pessoa foi gentil e se ofereceu para mandar um presente.' },
        { id: 'c', text: 'Enviar apenas o telefone, que revela menos sobre você do que o endereço.' },
        { id: 'd', text: 'Marcar um encontro em lugar movimentado para receber o presente em mãos.' },
      ],
    },
    explanation: 'O Pacto de Uso Consciente diz: nunca revelar informações pessoais desnecessárias. Pessoas online podem não ser quem afirmam ser.',
  },
  {
    id: 'AP034-F-Q13b', type: 'scenario',
    prompt: 'Você está navegando na Internet e um pop-up aparece dizendo que seu computador está infectado e você precisa baixar um "antivírus" urgente. O que você faz?',
    data: {
      scenarios: [
        { id: 'a', text: 'Fechar o pop-up, não baixar nada e verificar com o antivírus já instalado no computador.', correct: true },
        { id: 'b', text: 'Baixar na hora o antivírus indicado no aviso, para proteger o computador.' },
        { id: 'c', text: 'Clicar no aviso para ver mais informações sobre a infecção detectada.' },
        { id: 'd', text: 'Compartilhar o link do aviso com os amigos, para que todos possam se proteger da mesma ameaça.' },
      ],
    },
    explanation: 'Pop-ups de "antivírus" são frequentemente malware disfarçado. Use apenas antivírus confiável e instalado pelo responsável.',
  },
  {
    id: 'AP034-F-Q14', type: 'multiple_choice',
    prompt: 'Segundo Filipenses 4:8, devemos pensar em tudo o que é:',
    data: { options: [
      { id: 'a', text: 'Verdadeiro, honesto, justo, puro, amável e de boa fama.', correct: true },
      { id: 'b', text: 'Em tudo o que for rápido, barato de obter e sempre moderno.' },
      { id: 'c', text: 'Em tudo o que for popular, famoso e capaz de render lucro.' },
      { id: 'd', text: 'Em tudo o que for secreto, reservado e conhecido por poucos.' },
    ]},
    explanation: 'Filipenses 4:8 orienta a mente para o que é verdadeiro, puro e amável — aplicável ao uso da Internet.',
  },
  {
    id: 'AP034-F-Q15', type: 'multiple_choice',
    prompt: 'Por que é importante atualizar o antivírus regularmente?',
    data: { options: [
      { id: 'a', text: 'Novos vírus surgem diariamente; sem atualização, o antivírus não os reconhece.', correct: true },
      { id: 'b', text: 'Para acelerar a conexão de Internet, que fica mais lenta com o tempo.' },
      { id: 'c', text: 'Para liberar espaço no disco, já que a base antiga de ameaças ocupa bastante memória.' },
      { id: 'd', text: 'Para traduzir automaticamente as páginas escritas em outros idiomas.' },
    ]},
    explanation: 'A base de assinaturas de ameaças precisa estar atualizada para detectar vírus novos.',
  },
  {
    id: 'AP034-F-Q16', type: 'multiple_choice',
    prompt: 'Qual protocolo é usado para enviar e-mails?',
    data: { options: [
      { id: 'a', text: 'SMTP', correct: true },
      { id: 'b', text: 'POP3' },
      { id: 'c', text: 'HTTP' },
      { id: 'd', text: 'FTP' },
    ]},
    explanation: 'SMTP (Simple Mail Transfer Protocol) é o protocolo de envio. POP3 e IMAP são de recebimento.',
  },
  {
    id: 'AP034-F-Q17', type: 'true_false',
    prompt: 'O webmail permite acessar e-mails pelo navegador sem instalar nenhum programa.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Webmail (Gmail, Outlook.com) é acessado pelo navegador. As mensagens ficam no servidor.',
  },
  {
    id: 'AP034-F-Q18', type: 'scenario',
    prompt: 'Você está navegando e um pop-up aparece dizendo: "Seu computador está infectado! Baixe este antivírus agora!" O que você faz?',
    data: { scenarios: [
      { id: 'a', text: 'Fechar o pop-up, não baixar nada e verificar com o antivírus já instalado.', correct: true },
      { id: 'b', text: 'Baixar imediatamente o antivírus indicado no aviso, antes que a infecção se espalhe.' },
      { id: 'c', text: 'Clicar no pop-up para ver mais informações.' },
      { id: 'd', text: 'Compartilhar o link com os amigos para que eles verifiquem também.' },
    ]},
    explanation: 'Pop-ups de "antivírus" são frequentemente malware disfarçado.',
  },
  {
    id: 'AP034-F-Q19', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre navegação segura.',
    data: {
      blanks: [
        { id: 'b1', answer: 'HTTPS', hint: 'Protocolo seguro (sigla)' },
        { id: 'b2', answer: 'cadeado', hint: 'Ícone que indica conexão segura' },
      ],
    },
    explanation: 'HTTPS e o cadeado na barra de endereço indicam conexão criptografada.',
  },
  {
    id: 'AP034-F-Q20', type: 'matching',
    prompt: 'Associe cada figura histórica à sua contribuição.',
    data: {
      pairs: [
        { left: 'Tim Berners-Lee', right: 'Criou a WWW' },
        { left: 'Vint Cerf e Bob Kahn', right: 'Criaram o TCP/IP' },
        { left: 'ARPANET', right: 'Primeira rede de larga escala (1969)' },
        { left: 'Marc Andreessen', right: 'Criou o navegador Mosaic' },
      ],
    },
    explanation: 'Cada figura teve um papel crucial na história da Internet.',
  },
  {
    id: 'AP034-F-Q21', type: 'multiple_choice',
    prompt: 'Segundo o Pacto de Uso Consciente, quantas redes sociais devemos selecionar no máximo?',
    data: { options: [
      { id: 'a', text: 'Duas', correct: true },
      { id: 'b', text: 'Cinco' },
      { id: 'c', text: 'Quantas quiser' },
      { id: 'd', text: 'Nenhuma' },
    ]},
    explanation: 'O Pacto recomenda no máximo duas redes sociais para reduzir riscos.',
  },
  {
    id: 'AP034-F-Q22', type: 'true_false',
    prompt: 'Um worm se espalha pela rede sem precisar de um arquivo hospedeiro, ao contrário do vírus.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Worms se replicam automaticamente pela rede. Vírus precisam de um arquivo hospedeiro.',
  },
];

const rawAp035Final: Question[] = [
  {
    id: 'AP035-F-Q1', type: 'multiple_choice',
    prompt: 'Qual é a função do protocolo HTTP?',
    data: { options: [
      { id: 'a', text: 'Transferir dados entre cliente e servidor na World Wide Web.', correct: true },
      { id: 'b', text: 'Enviar mensagens de e-mail entre os servidores de correio da rede.' },
      { id: 'c', text: 'Compactar arquivos para que o download fique mais rápido.' },
      { id: 'd', text: 'Proteger o computador contra vírus enquanto se navega na web.' },
    ]},
    explanation: 'HTTP é o protocolo fundamental da comunicação web.',
  },
  {
    id: 'AP035-F-Q2', type: 'multiple_choice',
    prompt: 'O que o HTTPS adiciona ao HTTP?',
    data: { options: [
      { id: 'a', text: 'Criptografia TLS/SSL para proteger os dados em trânsito.', correct: true },
      { id: 'b', text: 'Maior velocidade de carregamento, por usar conexão dedicada.' },
      { id: 'c', text: 'Compressão das imagens da página, para carregar mais rápido.' },
      { id: 'd', text: 'Tradução automática das páginas para o idioma do visitante.' },
    ]},
    explanation: 'HTTPS = HTTP + TLS/SSL. O cadeado no navegador indica conexão segura.',
  },
  {
    id: 'AP035-F-Q3', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre HTML e PHP?',
    data: { options: [
      { id: 'a', text: 'HTML é marcação executada no cliente; PHP é programação executada no servidor.', correct: true },
      { id: 'b', text: 'HTML é mais moderno e veio para substituir o PHP nos sites atuais, por rodar no navegador.' },
      { id: 'c', text: 'PHP cuida do design da página e HTML cuida da lógica do programa.' },
      { id: 'd', text: 'São a mesma linguagem, com dois nomes por razões históricas.' },
    ]},
    explanation: 'HTML estrutura a página no navegador; PHP gera conteúdo dinamicamente no servidor.',
  },
  {
    id: 'AP035-F-Q4', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor preta?',
    data: { options: [
      { id: 'a', text: 'var(--color-bg)', correct: true },
      { id: 'b', text: 'var(--color-text)' },
      { id: 'c', text: '#FF0000' },
      { id: 'd', text: '#00FF00' },
    ]},
    explanation: 'var(--color-bg) = ausência de vermelho, verde e azul = preto.',
  },
  {
    id: 'AP035-F-Q5', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre GIF e PNG?',
    data: { options: [
      { id: 'a', text: 'GIF suporta animação e 256 cores; PNG suporta transparência e mais cores, sem animação.', correct: true },
      { id: 'b', text: 'PNG aceita animação e GIF não, por isso PNG substituiu o GIF.' },
      { id: 'c', text: 'GIF é o formato indicado para fotografias, e PNG serve melhor para textos e desenhos simples.' },
      { id: 'd', text: 'Não há diferença prática: os dois guardam a imagem do mesmo jeito.' },
    ]},
    explanation: 'GIF: 256 cores + animação. PNG: milhões de cores + transparência, sem animação.',
  },
  {
    id: 'AP035-F-Q6', type: 'ordering',
    prompt: 'Ordene as etapas de carregamento de uma página web.',
    data: {
      items: [
        { id: 'a', text: 'O usuário digita a URL no navegador', order: 1 },
        { id: 'b', text: 'O navegador resolve o domínio via DNS', order: 2 },
        { id: 'c', text: 'O navegador envia requisição HTTP ao servidor', order: 3 },
        { id: 'd', text: 'O servidor responde com HTML e recursos', order: 4 },
        { id: 'e', text: 'O navegador renderiza a página para o usuário', order: 5 },
      ],
    },
    explanation: 'URL → DNS → HTTP → Resposta → Renderização.',
  },
  {
    id: 'AP035-F-Q7', type: 'matching',
    prompt: 'Associe cada elemento HTML à sua função.',
    data: {
      pairs: [
        { left: '<html>', right: 'Elemento raiz da página' },
        { left: '<head>', right: 'Metadados e título da página' },
        { left: '<body>', right: 'Conteúdo visível da página' },
        { left: '<a href>', right: 'Cria um hyperlink' },
        { left: '<img>', right: 'Exibe uma imagem' },
        { left: '<table>', right: 'Cria uma tabela' },
      ],
    },
    explanation: 'Cada elemento HTML tem uma função semântica específica na estrutura da página.',
  },
  {
    id: 'AP035-F-Q8', type: 'fill_blank',
    prompt: 'Complete as lacunas sobre estrutura de URL.',
    data: {
      blanks: [
        { id: 'b1', answer: 'https', hint: 'Protocolo seguro' },
        { id: 'b2', answer: 'domínio', hint: 'exemplo.com' },
        { id: 'b3', answer: 'caminho', hint: '/pagina/sobre' },
      ],
    },
    explanation: 'URL: protocolo://domínio/caminho. Ex: https://exemplo.com/pagina',
  },
  {
    id: 'AP035-F-Q9', type: 'multiple_choice',
    prompt: 'Qual é a principal característica do JPEG?',
    data: { options: [
      { id: 'a', text: 'Compressão com perda, ideal para fotografias.', correct: true },
      { id: 'b', text: 'Guarda transparência e animação, como fazem o PNG e o GIF.' },
      { id: 'c', text: 'Não usa compressão, e por isso gera arquivos grandes.' },
      { id: 'd', text: 'Trabalha com apenas 256 cores, o que limita fotografias.' },
    ]},
    explanation: 'JPEG usa compressão com perda, reduzindo o tamanho de fotos.',
  },
  {
    id: 'AP035-F-Q10', type: 'multiple_choice',
    prompt: 'O que é Inteligência Artificial generativa?',
    data: { options: [
      { id: 'a', text: 'Sistemas que criam novo conteúdo (texto, imagem, código) a partir de instruções.', correct: true },
      { id: 'b', text: 'Um antivírus que encontra e remove ameaças sozinho, sem que ninguém precise autorizar.' },
      { id: 'c', text: 'Um cabo de rede de alta velocidade usado entre servidores.' },
      { id: 'd', text: 'Um formato de imagem que guarda mais cores que o JPEG.' },
    ]},
    explanation: 'IA generativa produz conteúdo original, como ChatGPT para texto ou DALL-E para imagens.',
  },
  {
    id: 'AP035-F-Q11', type: 'scenario',
    prompt: 'Você precisa criar um site com 4 páginas interligadas. Qual é a melhor abordagem?',
    data: {
      scenarios: [
        { id: 'a', text: 'Criar 4 arquivos HTML separados, cada um com links <a href> apontando para as outras páginas.', correct: true },
        { id: 'b', text: 'Reunir todo o conteúdo numa única página bem longa, sem nenhum link interno entre as partes.' },
        { id: 'c', text: 'Criar quatro páginas separadas e informar os endereços de cada uma.' },
        { id: 'd', text: 'Montar tudo com imagens, sem escrever HTML, e publicar as imagens.' },
      ],
    },
    explanation: 'Um site multi-página usa arquivos HTML separados com hyperlinks <a href> conectando-os.',
  },
  {
    id: 'AP035-F-Q12', type: 'multiple_choice',
    prompt: 'Como você exibe uma imagem em HTML?',
    data: { options: [
      { id: 'a', text: '<img src="foto.jpg" alt="descrição">', correct: true },
      { id: 'b', text: '<image src="foto.jpg" descricao="foto">' },
      { id: 'c', text: '<img href="foto.jpg">' },
      { id: 'd', text: '<picture="foto.jpg">' },
    ]},
    explanation: 'O elemento <img> usa o atributo src para o caminho e alt para a descrição.',
  },
  {
    id: 'AP035-F-Q13', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre cliente e servidor?',
    data: { options: [
      { id: 'a', text: 'Cliente é o navegador do usuário; servidor é o computador que hospeda e processa o site.', correct: true },
      { id: 'b', text: 'Cliente e servidor são a mesma coisa, com nomes trocados conforme a empresa.' },
      { id: 'c', text: 'Cliente é a parte física da máquina, e servidor é o nome do programa que roda dentro dela.' },
      { id: 'd', text: 'Servidor é a pessoa que acessa a página e cliente é a empresa que a publicou.' },
    ]},
    explanation: 'Cliente (navegador) faz requisições; servidor processa e responde com HTML.',
  },
  {
    id: 'AP035-F-Q14', type: 'true_false',
    prompt: 'O PHP é executado no navegador do usuário.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'PHP é executado no SERVIDOR. O usuário recebe apenas o HTML resultante.',
  },
  {
    id: 'AP035-F-Q15', type: 'scenario',
    prompt: 'Você quer criar um logo com fundo transparente para um site. Qual formato de imagem escolher?',
    data: { scenarios: [
      { id: 'a', text: 'PNG — suporta transparência e mantém qualidade sem perda.', correct: true },
      { id: 'b', text: 'JPEG — não suporta transparência.' },
      { id: 'c', text: 'GIF, porque guarda transparência, ainda que limitado a 256 cores.' },
      { id: 'd', text: 'BMP — formato não web.' },
    ]},
    explanation: 'PNG é ideal para logos: transparência + milhões de cores + sem perda.',
  },
  {
    id: 'AP035-F-Q16', type: 'fill_blank',
    prompt: 'Complete: Na cor #FF0000, FF é vermelho _____, 00 é verde _____, e 00 é azul _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'máximo', hint: 'FF = valor máximo' },
        { id: 'b2', answer: 'nenhum', hint: '00 = ausência' },
        { id: 'b3', answer: 'nenhum', hint: '00 = ausência' },
      ],
    },
    explanation: '#FF0000 = vermelho máximo, sem verde nem azul = vermelho puro.',
  },
  {
    id: 'AP035-F-Q17', type: 'matching',
    prompt: 'Associe cada formato de imagem à sua característica.',
    data: {
      pairs: [
        { left: 'JPEG', right: 'Compressão com perda, ideal para fotos' },
        { left: 'PNG', right: 'Transparência e compressão sem perda' },
        { left: 'GIF', right: 'Animação e apenas 256 cores' },
      ],
    },
    explanation: 'Cada formato é otimizado para um tipo de conteúdo visual.',
  },
  {
    id: 'AP035-F-Q18', type: 'multiple_choice',
    prompt: 'O que é IA generativa?',
    data: { options: [
      { id: 'a', text: 'Sistemas que criam novo conteúdo (texto, imagem, código) a partir de instruções.', correct: true },
      { id: 'b', text: 'Um antivírus que encontra e remove as ameaças sozinho, sem nunca pedir confirmação.' },
      { id: 'c', text: 'Um cabo de rede de alta velocidade usado para ligar servidores entre si.' },
      { id: 'd', text: 'Um formato de imagem capaz de guardar mais cores e transparência.' },
    ]},
    explanation: 'IA generativa produz conteúdo original, como ChatGPT para texto ou DALL-E para imagens.',
  },
  {
    id: 'AP035-F-Q19', type: 'true_false',
    prompt: 'A IA pode produzir informações incorretas, conhecidas como alucinações.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso' },
    ]},
    explanation: 'Modelos de IA podem gerar respostas plausíveis, mas factualmente incorretas.',
  },
  {
    id: 'AP035-F-Q20', type: 'ordering',
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
  {
    id: 'AP035-F-Q21', type: 'scenario',
    prompt: 'Você usa IA para gerar um texto para um trabalho. O que deve fazer antes de entregar?',
    data: { scenarios: [
      { id: 'a', text: 'Revisar todo o conteúdo, verificar as informações e adicionar sua própria análise.', correct: true },
      { id: 'b', text: 'Entregar exatamente como a ferramenta gerou, sem ler nem revisar antes.' },
      { id: 'c', text: 'Não usar inteligência artificial em etapa alguma do trabalho, por simples precaução.' },
      { id: 'd', text: 'Esconder que usou a ferramenta, mesmo se alguém perguntar diretamente.' },
    ]},
    explanation: 'A IA é uma ferramenta. O conteúdo deve ser revisado com pensamento crítico.',
  },
  {
    id: 'AP035-F-Q22', type: 'multiple_choice',
    prompt: 'Qual elemento HTML cria um hyperlink?',
    data: { options: [
      { id: 'a', text: '<a href="url">texto</a>', correct: true },
      { id: 'b', text: '<link>texto</link>' },
      { id: 'c', text: '<href="url">texto</href>' },
      { id: 'd', text: '<url>texto</url>' },
    ]},
    explanation: 'A tag <a> com atributo href cria links entre páginas.',
  },
];

export function getFinalExamQuestions(specialtyCode: string): Question[] {
  const raw = specialtyCode === 'AP034' ? rawAp034Final : rawAp035Final;
  return shuffleAll(raw);
}
