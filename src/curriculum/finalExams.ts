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
      { id: 'b', text: 'Um programa de navegação instalado no computador, usado para abrir sites, vídeos e mensagens de correio.', porque: 'Isso é o navegador. Ele é a janela; a Internet é a rede que existe do outro lado dela.' },
      { id: 'c', text: 'Um site de busca que reúne e organiza todo o conteúdo publicado no mundo.', porque: 'Isso é o buscador. Ele encontra o que está na Internet, mas não é a Internet.' },
      { id: 'd', text: 'Um único cabo submarino que liga os continentes e por onde passam todos os dados.', porque: 'Os cabos são o meio físico, e são muitos. A Internet é o que acontece sobre eles: máquinas conversando por regras comuns.' },
    ]},
    explanation: 'A Internet é uma rede de redes, interconectada globalmente por protocolos como TCP/IP.',
  },
  {
    id: 'AP034-F-Q2', type: 'multiple_choice',
    prompt: 'A World Wide Web (WWW) é:',
    data: { options: [
      { id: 'a', text: 'Um serviço que funciona sobre a Internet, permitindo acessar páginas por navegadores.', correct: true },
      { id: 'b', text: 'O mesmo que a Internet, apenas com outro nome, já que as duas nasceram juntas.', porque: 'E-mail e streaming usam a Internet sem passar pela Web — sinal de que são camadas diferentes.' },
      { id: 'c', text: 'Um protocolo de e-mail que entrega mensagens entre os servidores de correio.', porque: 'Isso descreve o SMTP. A Web é o serviço das páginas, e o e-mail é outro serviço, ao lado dela.' },
      { id: 'd', text: 'Um antivírus que acompanha o navegador e examina cada página desconhecida antes de exibi-la.', porque: 'Antivírus é proteção. A Web é o conjunto de páginas ligadas entre si e o meio de acessá-las.' },
    ]},
    explanation: 'A WWW é um dos serviços da Internet, como e-mail e FTP. Não é sinônimo de Internet.',
  },
  {
    id: 'AP034-F-Q3', type: 'multiple_choice',
    prompt: 'Fazer um "download" significa:',
    data: { options: [
      { id: 'a', text: 'Transferir um arquivo de um servidor remoto para o seu computador.', correct: true },
      { id: 'b', text: 'Enviar um arquivo guardado no seu computador para um servidor na Internet.', porque: 'Isso é upload, o caminho contrário. Baixar é trazer para o seu computador.' },
      { id: 'c', text: 'Apagar um arquivo do computador em definitivo, sem passar pela lixeira.', porque: 'Apagar não transfere nada. Download é receber.' },
      { id: 'd', text: 'Comprimir um arquivo para que ele ocupe menos espaço no disco do computador.', porque: 'Comprimir muda o tamanho do arquivo onde ele já está. Download é movê-lo de outra máquina até a sua.' },
    ]},
    explanation: 'Download = baixar/receber. Upload = enviar.',
  },
  {
    id: 'AP034-F-Q4', type: 'true_false',
    prompt: 'O e-mail é um sistema de troca de mensagens digitais que funciona sobre a Internet.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. O e-mail é um dos serviços mais antigos da Internet — anterior à própria Web.' },
    ]},
    explanation: 'E-mail (correio eletrônico) é um dos serviços mais antigos da Internet.',
  },
  {
    id: 'AP034-F-Q5', type: 'multiple_choice',
    prompt: 'Vírus de computador e malware são:',
    data: { options: [
      { id: 'a', text: 'Vírus é um tipo de malware; malware é o termo genérico para qualquer software malicioso.', correct: true },
      { id: 'b', text: 'Termos sinônimos, sem qualquer distinção técnica ou prática entre um e outro.', porque: 'Não são: todo vírus é malware, mas worm e ransomware também são, e não são vírus.' },
      { id: 'c', text: 'Malware é o programa que protege a máquina, e vírus é o que tenta invadi-la.', porque: 'Está invertido. Malware é o que ataca; quem protege é o antivírus.' },
      { id: 'd', text: 'Vírus atinge apenas mensagens de e-mail, enquanto malware atinge apenas os sites que a pessoa visita.', porque: 'Nenhum dos dois se limita a um canal. Chegam por anexo, download, pendrive ou site.' },
    ]},
    explanation: 'Malware é o guarda-chuva: vírus, worms, trojans, spyware e ransomware são todos malware.',
  },
  {
    id: 'AP034-F-Q6', type: 'multiple_choice',
    prompt: 'Qual protocolo baixa e-mails removendo-os do servidor?',
    data: { options: [
      { id: 'a', text: 'POP3', correct: true },
      { id: 'b', text: 'IMAP', porque: 'IMAP deixa as mensagens no servidor, para que todos os aparelhos vejam as mesmas. A pergunta é por quem as remove.' },
      { id: 'c', text: 'SMTP', porque: 'SMTP é o caminho de saída: envia mensagens, não as busca no servidor.' },
      { id: 'd', text: 'HTTP', porque: 'HTTP é o protocolo das páginas web, não do correio eletrônico.' },
    ]},
    explanation: 'POP3 baixa e remove. IMAP sincroniza. SMTP envia. HTTP é web.',
  },
  {
    id: 'AP034-F-Q7', type: 'multiple_choice',
    prompt: 'Qual é a principal vantagem do IMAP sobre o POP3?',
    data: { options: [
      { id: 'a', text: 'Mantém as mesmas mensagens e pastas sincronizadas em todos os dispositivos usados.', correct: true },
      { id: 'b', text: 'É mais rápido para enviar mensagens, porque abre uma conexão direta com o aparelho de quem recebe.', porque: 'Nenhum dos dois envia — quem envia é o SMTP. IMAP e POP3 servem para receber.' },
      { id: 'c', text: 'Dispensa a senha, porque a autenticação fica guardada no próprio servidor.', porque: 'IMAP exige senha como qualquer outro. Guardá-la no aparelho é comodidade do programa, não do protocolo.' },
      { id: 'd', text: 'Compacta os anexos automaticamente, reduzindo o espaço da caixa de entrada.', porque: 'Nenhum dos dois mexe no tamanho dos anexos. A vantagem do IMAP é a sincronização.' },
    ]},
    explanation: 'IMAP mantém as mensagens no servidor, permitindo sincronização entre dispositivos.',
  },
  {
    id: 'AP034-F-Q8', type: 'multiple_choice',
    prompt: 'O que é streaming de mídia?',
    data: { options: [
      { id: 'a', text: 'Transmissão contínua de áudio/vídeo pela Internet, permitindo assistir enquanto carrega.', correct: true },
      { id: 'b', text: 'Baixar o arquivo inteiro no aparelho antes de começar a assistir ou ouvir.', porque: 'Isso é download comum, e é o oposto de streaming: no streaming se assiste enquanto o vídeo ainda chega.' },
      { id: 'c', text: 'Um tipo de vírus que se instala junto com os arquivos de música e de vídeo baixados da rede.', porque: 'Streaming é forma de entrega, não ameaça. Netflix e YouTube funcionam assim.' },
      { id: 'd', text: 'Um formato de compactação de vídeo que encolhe o arquivo antes do envio.', porque: 'Compactação encolhe o arquivo. Streaming é sobre como ele chega: aos poucos, enquanto toca.' },
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
        { id: 'b', text: 'Clicar no link para conferir se a conta está mesmo bloqueada antes de decidir.', porque: 'É o clique que o golpe quer. Se houver dúvida sobre a conta, procure o serviço pelo caminho de sempre, não por esse link.' },
        { id: 'c', text: 'Responder ao remetente pedindo mais informações sobre o suposto bloqueio.', porque: 'Responder confirma que o endereço existe e é lido, o que costuma render mais mensagens do mesmo tipo.' },
        { id: 'd', text: 'Encaminhar a mensagem para todos os amigos, para avisá-los do mesmo risco.', porque: 'Espalha o link do golpe. Se quiser avisar, conte o que houve sem repassar a mensagem.' },
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
        { id: 'b', text: 'Enviar o endereço completo, já que a pessoa foi gentil e se ofereceu para mandar um presente.', porque: 'Gentileza é justamente o que se usa para ganhar confiança. Presente prometido é um pedido de dados disfarçado.' },
        { id: 'c', text: 'Enviar apenas o telefone, que revela menos sobre você do que o endereço.', porque: 'O telefone já identifica você e permite chegar ao resto. Não é uma versão segura de entregar o endereço.' },
        { id: 'd', text: 'Marcar um encontro em lugar movimentado para receber o presente em mãos.', porque: 'Lugar movimentado ajuda, mas encontrar sozinho quem se conheceu pela Internet não é decisão para tomar por conta própria.' },
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
        { id: 'b', text: 'Baixar na hora o antivírus indicado no aviso, para proteger o computador.', porque: 'O aviso é a própria ameaça: quem baixa instala o problema que o aviso dizia existir.' },
        { id: 'c', text: 'Clicar no aviso para ver mais informações sobre a infecção detectada.', porque: 'Qualquer clique no aviso já pode iniciar a instalação. Ele não é uma janela de informação.' },
        { id: 'd', text: 'Compartilhar o link do aviso com os amigos, para que todos possam se proteger da mesma ameaça.', porque: 'Repassar o link leva o golpe adiante, com a sua recomendação junto.' },
      ],
    },
    explanation: 'Pop-ups de "antivírus" são frequentemente malware disfarçado. Use apenas antivírus confiável e instalado pelo responsável.',
  },
  {
    id: 'AP034-F-Q14', type: 'multiple_choice',
    prompt: 'Segundo Filipenses 4:8, devemos pensar em tudo o que é:',
    data: { options: [
      { id: 'a', text: 'Verdadeiro, honesto, justo, puro, amável e de boa fama.', correct: true },
      { id: 'b', text: 'Em tudo o que for rápido, barato de obter e sempre moderno.', porque: 'Rapidez e preço não estão na lista. O texto trata do caráter daquilo em que se pensa.' },
      { id: 'c', text: 'Em tudo o que for popular, famoso e capaz de render lucro.', porque: 'Filipenses 4:8 não fala em fama nem lucro. A lista é sobre o que é verdadeiro, honesto, justo, puro e amável.' },
      { id: 'd', text: 'Em tudo o que for secreto, reservado e conhecido por poucos.', porque: 'O texto aponta o contrário: aquilo que é de boa fama, que suporta ser conhecido.' },
    ]},
    explanation: 'Filipenses 4:8 orienta a mente para o que é verdadeiro, puro e amável — aplicável ao uso da Internet.',
  },
  {
    id: 'AP034-F-Q15', type: 'multiple_choice',
    prompt: 'Por que é importante atualizar o antivírus regularmente?',
    data: { options: [
      { id: 'a', text: 'Novos vírus surgem diariamente; sem atualização, o antivírus não os reconhece.', correct: true },
      { id: 'b', text: 'Para acelerar a conexão de Internet, que fica mais lenta com o tempo.', porque: 'Antivírus não mexe na velocidade da conexão. O que a atualização traz é reconhecer o que é novo.' },
      { id: 'c', text: 'Para liberar espaço no disco, já que a base antiga de ameaças ocupa bastante memória.', porque: 'A base de ameaças cresce a cada atualização, não encolhe.' },
      { id: 'd', text: 'Para traduzir automaticamente as páginas escritas em outros idiomas.', porque: 'Tradução é recurso do navegador, sem relação com antivírus.' },
    ]},
    explanation: 'A base de assinaturas de ameaças precisa estar atualizada para detectar vírus novos.',
  },
  {
    id: 'AP034-F-Q16', type: 'multiple_choice',
    prompt: 'Qual protocolo é usado para enviar e-mails?',
    data: { options: [
      { id: 'a', text: 'SMTP', correct: true },
      { id: 'b', text: 'POP3', porque: 'POP3 é de recebimento: traz as mensagens do servidor para o aparelho.' },
      { id: 'c', text: 'HTTP', porque: 'HTTP é o protocolo das páginas web, não do correio.' },
      { id: 'd', text: 'FTP', porque: 'FTP transfere arquivos entre computadores e não tem relação com e-mail.' },
    ]},
    explanation: 'SMTP (Simple Mail Transfer Protocol) é o protocolo de envio. POP3 e IMAP são de recebimento.',
  },
  {
    id: 'AP034-F-Q17', type: 'true_false',
    prompt: 'O webmail permite acessar e-mails pelo navegador sem instalar nenhum programa.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'Permite sim: o webmail roda dentro do navegador, e é por isso que dá para ler e-mail em qualquer computador.' },
    ]},
    explanation: 'Webmail (Gmail, Outlook.com) é acessado pelo navegador. As mensagens ficam no servidor.',
  },
  {
    id: 'AP034-F-Q18', type: 'scenario',
    prompt: 'Você está navegando e um pop-up aparece dizendo: "Seu computador está infectado! Baixe este antivírus agora!" O que você faz?',
    data: { scenarios: [
      { id: 'a', text: 'Fechar o pop-up, não baixar nada e verificar com o antivírus já instalado.', correct: true },
      { id: 'b', text: 'Baixar imediatamente o antivírus indicado no aviso, antes que a infecção se espalhe.', porque: 'O programa oferecido é a ameaça. A urgência existe para você agir antes de pensar.' },
      { id: 'c', text: 'Clicar no pop-up para ver mais informações.', porque: 'O clique já pode iniciar a instalação. O aviso não é uma janela informativa: é a isca.' },
      { id: 'd', text: 'Compartilhar o link com os amigos para que eles verifiquem também.', porque: 'Repassar leva o golpe adiante com a sua recomendação junto.' },
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
      { id: 'b', text: 'Cinco', porque: 'O número combinado no pacto é menor. A ideia é caber na sua atenção, não na sua curiosidade.' },
      { id: 'c', text: 'Quantas quiser', porque: 'O pacto propõe escolher poucas e cuidar delas. Estar em todas dispersa a atenção e amplia a exposição.' },
      { id: 'd', text: 'Nenhuma', porque: 'O pacto não proíbe redes sociais. Ele propõe usá-las com escolha e limite.' },
    ]},
    explanation: 'O Pacto recomenda no máximo duas redes sociais para reduzir riscos.',
  },
  {
    id: 'AP034-F-Q22', type: 'true_false',
    prompt: 'Um worm se espalha pela rede sem precisar de um arquivo hospedeiro, ao contrário do vírus.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro, e é a diferença entre os dois: o vírus precisa se alojar num arquivo, o worm caminha sozinho pela rede.' },
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
      { id: 'b', text: 'Enviar mensagens de e-mail entre os servidores de correio da rede.', porque: 'Isso é o SMTP. O HTTP carrega páginas; o correio tem protocolos próprios.' },
      { id: 'c', text: 'Compactar arquivos para que o download fique mais rápido.', porque: 'Compressão existe na web, mas é recurso opcional dentro do HTTP — não a função dele.' },
      { id: 'd', text: 'Proteger o computador contra vírus enquanto se navega na web.', porque: 'O HTTP não protege nada por si. Quem cifra a conversa é o HTTPS; quem examina arquivos é o antivírus.' },
    ]},
    explanation: 'HTTP é o protocolo fundamental da comunicação web.',
  },
  {
    id: 'AP035-F-Q2', type: 'multiple_choice',
    prompt: 'O que o HTTPS adiciona ao HTTP?',
    data: { options: [
      { id: 'a', text: 'Criptografia TLS/SSL para proteger os dados em trânsito.', correct: true },
      { id: 'b', text: 'Maior velocidade de carregamento, por usar conexão dedicada.', porque: 'Não é sobre velocidade. O S acrescenta sigilo: embaralha os dados para quem estiver no caminho.' },
      { id: 'c', text: 'Compressão das imagens da página, para carregar mais rápido.', porque: 'Compressão é outra coisa e independe do S. O que o HTTPS acrescenta é proteção do que trafega.' },
      { id: 'd', text: 'Tradução automática das páginas para o idioma do visitante.', porque: 'Tradução é recurso do navegador. O HTTPS não olha o conteúdo — existe justamente para que ninguém olhe.' },
    ]},
    explanation: 'HTTPS = HTTP + TLS/SSL. O cadeado no navegador indica conexão segura.',
  },
  {
    id: 'AP035-F-Q3', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre HTML e PHP?',
    data: { options: [
      { id: 'a', text: 'HTML é marcação executada no cliente; PHP é programação executada no servidor.', correct: true },
      { id: 'b', text: 'HTML é mais moderno e veio para substituir o PHP nos sites atuais, por rodar no navegador.', porque: 'O HTML é mais antigo que o PHP, e um não substitui o outro: trabalham em lugares diferentes.' },
      { id: 'c', text: 'PHP cuida do design da página e HTML cuida da lógica do programa.', porque: 'Está invertido. Quem descreve a aparência é o HTML, com o CSS; o PHP calcula, no servidor.' },
      { id: 'd', text: 'São a mesma linguagem, com dois nomes por razões históricas.', porque: 'São distintas, e rodam em máquinas distintas: o HTML no navegador, o PHP no servidor.' },
    ]},
    explanation: 'HTML estrutura a página no navegador; PHP gera conteúdo dinamicamente no servidor.',
  },
  {
    id: 'AP035-F-Q4', type: 'multiple_choice',
    prompt: 'Qual é o formato hexadecimal da cor preta?',
    data: { options: [
      { id: 'a', text: '#000000', correct: true },
      { id: 'b', text: '#FFFFFF', porque: 'Isso é branco: os três canais no máximo. Preto é a ausência dos três.' },
      { id: 'c', text: '#FF0000', porque: 'Isso é vermelho puro. Preto é #000000, sem nenhuma cor acesa.' },
      { id: 'd', text: '#00FF00', porque: 'Isso é verde puro. Preto não tem canal algum aceso.' },
    ]},
    explanation: '#000000 = ausência de vermelho, verde e azul = preto.',
  },
  {
    id: 'AP035-F-Q5', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre GIF e PNG?',
    data: { options: [
      { id: 'a', text: 'GIF suporta animação e 256 cores; PNG suporta transparência e mais cores, sem animação.', correct: true },
      { id: 'b', text: 'PNG aceita animação e GIF não, por isso PNG substituiu o GIF.', porque: 'Também invertido: quem anima é o GIF. O PNG comum guarda imagem parada.' },
      { id: 'c', text: 'GIF é o formato indicado para fotografias, e PNG serve melhor para textos e desenhos simples.', porque: 'Invertido: o GIF tem só 256 cores, o que arruína uma foto. Ele serve para desenhos e animações curtas.' },
      { id: 'd', text: 'Não há diferença prática: os dois guardam a imagem do mesmo jeito.', porque: 'Há, e ela decide a escolha: animação de um lado, transparência e milhões de cores do outro.' },
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
      { id: 'b', text: 'Guarda transparência e animação, como fazem o PNG e o GIF.', porque: 'Isso descreve PNG e GIF. O JPEG não faz nem uma coisa nem outra.' },
      { id: 'c', text: 'Não usa compressão, e por isso gera arquivos grandes.', porque: 'O JPEG comprime bastante — é por isso que uma foto cabe em poucos KB. O preço é perder detalhe.' },
      { id: 'd', text: 'Trabalha com apenas 256 cores, o que limita fotografias.', porque: 'Isso é o GIF. O JPEG lida com milhões de cores, que é o que uma fotografia exige.' },
    ]},
    explanation: 'JPEG usa compressão com perda, reduzindo o tamanho de fotos.',
  },
  {
    id: 'AP035-F-Q10', type: 'multiple_choice',
    prompt: 'O que é Inteligência Artificial generativa?',
    data: { options: [
      { id: 'a', text: 'Sistemas que criam novo conteúdo (texto, imagem, código) a partir de instruções.', correct: true },
      { id: 'b', text: 'Um antivírus que encontra e remove ameaças sozinho, sem que ninguém precise autorizar.', porque: 'Antivírus compara com uma lista de ameaças conhecidas. Generativa é a IA que cria algo novo.' },
      { id: 'c', text: 'Um cabo de rede de alta velocidade usado entre servidores.', porque: 'Cabo é equipamento. IA generativa é software que produz texto, imagem ou código.' },
      { id: 'd', text: 'Um formato de imagem que guarda mais cores que o JPEG.', porque: 'Formato é um jeito de guardar figura pronta. A IA generativa cria a figura que ainda não existia.' },
    ]},
    explanation: 'IA generativa produz conteúdo original, como ChatGPT para texto ou DALL-E para imagens.',
  },
  {
    id: 'AP035-F-Q11', type: 'scenario',
    prompt: 'Você precisa criar um site com 4 páginas interligadas. Qual é a melhor abordagem?',
    data: {
      scenarios: [
        { id: 'a', text: 'Criar 4 arquivos HTML separados, cada um com links <a href> apontando para as outras páginas.', correct: true },
        { id: 'b', text: 'Reunir todo o conteúdo numa única página bem longa, sem nenhum link interno entre as partes.', porque: 'Aí não são quatro páginas: é uma só, muito longa, e o visitante perde a noção de onde está.' },
        { id: 'c', text: 'Criar quatro páginas separadas e informar os endereços de cada uma.', porque: 'Sem link, quem chega numa página não tem como ir às outras. Interligar é justamente o que se pediu.' },
        { id: 'd', text: 'Montar tudo com imagens, sem escrever HTML, e publicar as imagens.', porque: 'A página vira um bloco: o texto não pode ser copiado nem lido por leitor de tela, e a busca não o encontra.' },
      ],
    },
    explanation: 'Um site multi-página usa arquivos HTML separados com hyperlinks <a href> conectando-os.',
  },
  {
    id: 'AP035-F-Q12', type: 'multiple_choice',
    prompt: 'Como você exibe uma imagem em HTML?',
    data: { options: [
      { id: 'a', text: '<img src="foto.jpg" alt="descrição">', correct: true },
      { id: 'b', text: '<image src="foto.jpg" descricao="foto">', porque: 'A tag chama-se img, e não image. Parece razoável, mas o navegador não a reconhece.' },
      { id: 'c', text: '<img href="foto.jpg">', porque: 'A tag está certa, o atributo não: href aponta destino de link. A origem da imagem é o src.' },
      { id: 'd', text: '<picture="foto.jpg">', porque: 'Não existe atributo solto assim. Toda tag tem nome e depois os atributos, no formato nome="valor".' },
    ]},
    explanation: 'O elemento <img> usa o atributo src para o caminho e alt para a descrição.',
  },
  {
    id: 'AP035-F-Q13', type: 'multiple_choice',
    prompt: 'Qual é a diferença entre cliente e servidor?',
    data: { options: [
      { id: 'a', text: 'Cliente é o navegador do usuário; servidor é o computador que hospeda e processa o site.', correct: true },
      { id: 'b', text: 'Cliente e servidor são a mesma coisa, com nomes trocados conforme a empresa.', porque: 'São papéis opostos numa mesma conversa: um pede, o outro responde.' },
      { id: 'c', text: 'Cliente é a parte física da máquina, e servidor é o nome do programa que roda dentro dela.', porque: 'Nada a ver com físico e lógico. Cliente é quem pede a página; servidor é quem a entrega.' },
      { id: 'd', text: 'Servidor é a pessoa que acessa a página e cliente é a empresa que a publicou.', porque: 'Está invertido: quem acessa é o cliente. Servidor é a máquina que hospeda o site.' },
    ]},
    explanation: 'Cliente (navegador) faz requisições; servidor processa e responde com HTML.',
  },
  {
    id: 'AP035-F-Q14', type: 'true_false',
    prompt: 'O PHP é executado no navegador do usuário.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. O PHP roda no servidor e o navegador recebe apenas o HTML que ele produziu — nunca o código.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'PHP é executado no SERVIDOR. O usuário recebe apenas o HTML resultante.',
  },
  {
    id: 'AP035-F-Q15', type: 'scenario',
    prompt: 'Você quer criar um logo com fundo transparente para um site. Qual formato de imagem escolher?',
    data: { scenarios: [
      { id: 'a', text: 'PNG — suporta transparência e mantém qualidade sem perda.', correct: true },
      { id: 'b', text: 'JPEG — não suporta transparência.', porque: 'O JPEG não guarda transparência: o fundo do logo sairia branco, como um retângulo sobre a página.' },
      { id: 'c', text: 'GIF, porque guarda transparência, ainda que limitado a 256 cores.', porque: 'Guarda, mas com 256 cores e bordas duras. Um logo com degradê fica serrilhado.' },
      { id: 'd', text: 'BMP — formato não web.', porque: 'O BMP praticamente não é usado na web: gera arquivos enormes por não comprimir.' },
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
      { id: 'b', text: 'Um antivírus que encontra e remove as ameaças sozinho, sem nunca pedir confirmação.', porque: 'Antivírus reconhece ameaças de uma lista. Gerar é produzir algo que não estava em lista alguma.' },
      { id: 'c', text: 'Um cabo de rede de alta velocidade usado para ligar servidores entre si.', porque: 'Cabo é equipamento. IA generativa é software que produz conteúdo novo.' },
      { id: 'd', text: 'Um formato de imagem capaz de guardar mais cores e transparência.', porque: 'Formato guarda figura pronta. A IA generativa cria o que ainda não existia.' },
    ]},
    explanation: 'IA generativa produz conteúdo original, como ChatGPT para texto ou DALL-E para imagens.',
  },
  {
    id: 'AP035-F-Q19', type: 'true_false',
    prompt: 'A IA pode produzir informações incorretas, conhecidas como alucinações.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. A IA pode afirmar com segurança algo que não existe — por isso se confere antes de usar.' },
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
      { id: 'b', text: 'Entregar exatamente como a ferramenta gerou, sem ler nem revisar antes.', porque: 'O texto pode trazer erro ou invenção. Entregar sem ler transfere a você a responsabilidade por algo que não conferiu.' },
      { id: 'c', text: 'Não usar inteligência artificial em etapa alguma do trabalho, por simples precaução.', porque: 'Usar não é o problema — usar sem revisar é. A ferramenta ajuda a começar; a checagem continua sua.' },
      { id: 'd', text: 'Esconder que usou a ferramenta, mesmo se alguém perguntar diretamente.', porque: 'Omitir quando perguntam é mentir sobre como o trabalho foi feito. Dizer que usou não tira o mérito de quem revisou.' },
    ]},
    explanation: 'A IA é uma ferramenta. O conteúdo deve ser revisado com pensamento crítico.',
  },
  {
    id: 'AP035-F-Q22', type: 'multiple_choice',
    prompt: 'Qual elemento HTML cria um hyperlink?',
    data: { options: [
      { id: 'a', text: '<a href="url">texto</a>', correct: true },
      { id: 'b', text: '<link>texto</link>', porque: 'A tag link existe, mas serve para ligar a página a arquivos como o CSS — e não aparece na tela.' },
      { id: 'c', text: '<href="url">texto</href>', porque: 'href é atributo, não tag. Ele precisa estar dentro de <a>, que é quem cria o link.' },
      { id: 'd', text: '<url>texto</url>', porque: 'Não existe tag url em HTML. O endereço vai num atributo, não no nome da tag.' },
    ]},
    explanation: 'A tag <a> com atributo href cria links entre páginas.',
  },
];

export function getFinalExamQuestions(specialtyCode: string): Question[] {
  const raw = specialtyCode === 'AP034' ? rawAp034Final : rawAp035Final;
  return shuffleAll(raw);
}
