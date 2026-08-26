import type { Question } from '../types';
import { embaralharQuestoes } from '../lib/questoes';

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

/*
  A prova final da AP041.

  Cobre os cinco blocos do documento oficial na proporção em que eles pesam na
  trilha: história, as sete definições, os cuidados, as nove peças e o trabalho
  com pastas. Nada aqui pede data decorada — o requisito 1 pede pesquisar e
  escrever, e isso é avaliado na redação guiada, não numa alternativa.
*/
const rawAp041Final: Question[] = [
  {
    id: 'AP041-F-Q1', type: 'multiple_choice',
    prompt: 'O ábaco serve para:',
    data: { options: [
      { id: 'a', text: 'Ajudar a pessoa a guardar números enquanto ela mesma calcula.', correct: true },
      { id: 'b', text: 'Fazer a conta sozinho, sem ninguém precisar acompanhar nada.',
        porque: 'Quem calcula no ábaco é a pessoa. Máquina que calcula sozinha só veio com a Pascalina.' },
      { id: 'c', text: 'Guardar arquivos e textos escritos, como um caderno de anotações.',
        porque: 'Ele não guarda texto: representa números, com contas que deslizam em varetas.' },
      { id: 'd', text: 'Medir o tempo que uma tarefa demora, parecido com um relógio.',
        porque: 'Ábaco não mede tempo. O que ele representa é quantidade.' },
    ]},
    explanation: 'O ábaco é um apoio para a memória de quem calcula, e não uma máquina de calcular.',
  },
  {
    id: 'AP041-F-Q2', type: 'multiple_choice',
    prompt: 'A máquina analítica de Charles Babbage é importante porque:',
    data: { options: [
      { id: 'a', text: 'Foi o primeiro computador a ser vendido para o público em geral, nas lojas.',
        porque: 'Ela nunca chegou a ser construída. Vender ao público aconteceu mais de um século depois.' },
      { id: 'b', text: 'Seria a primeira máquina a seguir instruções, e não uma conta só.', correct: true },
      { id: 'c', text: 'Substituiu o ábaco nas escolas e nos comércios daquela época.',
        porque: 'Ela não saiu do papel, então não substituiu coisa alguma.' },
      { id: 'd', text: 'Foi construída por Ada Lovelace, que também a programou depois.',
        porque: 'Ada Lovelace escreveu o programa; o projeto era de Babbage, e ninguém a construiu.' },
    ]},
    explanation: 'É a ideia de computador: uma máquina que faz a conta que mandarem, e não uma só.',
  },
  {
    id: 'AP041-F-Q3', type: 'ordering',
    prompt: 'Ordene as invenções, da mais antiga para a mais nova.',
    data: {
      items: [
        { id: 'a', text: 'O ábaco ajuda a contar, com contas que deslizam em varetas', order: 1 },
        { id: 'b', text: 'A Pascalina soma e subtrai por meio de engrenagens', order: 2 },
        { id: 'c', text: 'O ENIAC funciona com válvulas e ocupa uma sala inteira', order: 3 },
        { id: 'd', text: 'O transistor toma o lugar da válvula e encolhe as máquinas', order: 4 },
        { id: 'e', text: 'O computador pessoal chega à casa das famílias', order: 5 },
      ],
    },
    explanation: 'Primeiro a pessoa calculava, depois a máquina calculou, depois ela seguiu instruções — e então encolheu.',
  },
  {
    id: 'AP041-F-Q4', type: 'multiple_choice',
    prompt: 'Hardware é:',
    data: { options: [
      { id: 'a', text: 'A parte física do computador, que dá para pegar com a mão.', correct: true },
      { id: 'b', text: 'O conjunto dos programas instalados na máquina pelo usuário.',
        porque: 'Isso é software. Hardware ocupa lugar no mundo: teclado, tela, cabos.' },
      { id: 'c', text: 'A parte mais difícil de aprender a usar num computador novo.',
        porque: '"Hard" aqui é duro no sentido de físico, e não de difícil.' },
      { id: 'd', text: 'A memória onde ficam guardados os arquivos quando desligado.',
        porque: 'Isso é o HD ou o SSD, que são só uma peça. Hardware é o conjunto delas.' },
    ]},
    explanation: 'Se cai no seu pé e dói, é hardware.',
  },
  {
    id: 'AP041-F-Q5', type: 'multiple_choice',
    prompt: 'Software é:',
    data: { options: [
      { id: 'a', text: 'As peças de dentro do gabinete, escondidas atrás da tampa.',
        porque: 'Isso é hardware. Software não tem peça: são instruções.' },
      { id: 'b', text: 'Os programas: as instruções que dizem à máquina o que fazer.', correct: true },
      { id: 'c', text: 'Os arquivos que a pessoa cria, como fotos e trabalhos da escola.',
        porque: 'Arquivo é o que o programa abre ou produz. O programa em si é o software.' },
      { id: 'd', text: 'A parte macia do computador, feita para não machucar quem usa.',
        porque: '"Soft" quer dizer que muda fácil: instala, apaga e atualiza sem trocar peça.' },
    ]},
    explanation: 'Se você apaga e instala de novo sem trocar peça nenhuma, é software.',
  },
  {
    id: 'AP041-F-Q6', type: 'multiple_choice',
    prompt: 'O sistema operacional é:',
    data: { options: [
      { id: 'a', text: 'O programa principal, que organiza memória, arquivos e peças.', correct: true },
      { id: 'b', text: 'O programa que abre páginas da internet e guarda os favoritos.',
        porque: 'Isso é o navegador, e ele roda dentro do sistema operacional.' },
      { id: 'c', text: 'A peça que faz as contas e comanda as outras peças da máquina.',
        porque: 'Isso é a CPU, que é hardware. O sistema operacional é software.' },
      { id: 'd', text: 'O antivírus que fica ligado protegendo a máquina o tempo todo.',
        porque: 'Antivírus é um programa entre muitos, e também roda dentro do sistema.' },
    ]},
    explanation: 'Windows, Linux, macOS e Android são sistemas operacionais — e o celular também tem o seu.',
  },
  {
    id: 'AP041-F-Q7', type: 'multiple_choice',
    prompt: 'Para que serve um driver?',
    data: { options: [
      { id: 'a', text: 'Para deixar a máquina mais rápida, liberando memória parada.',
        porque: 'Driver não acelera nada: ele traduz. Quem cuida da memória é o sistema.' },
      { id: 'b', text: 'Para ensinar o sistema a conversar com um modelo de peça.', correct: true },
      { id: 'c', text: 'Para guardar cópia dos arquivos toda vez que algo é salvo.',
        porque: 'Isso é cópia de segurança. Driver não guarda arquivo nenhum.' },
      { id: 'd', text: 'Para dirigir o computador de longe, de outro lugar da casa.',
        porque: 'Apesar do nome, driver não tem relação com dirigir à distância.' },
    ]},
    explanation: 'Existem milhares de modelos de impressora; o driver é o tradutor de cada um.',
  },
  {
    id: 'AP041-F-Q8', type: 'fill_blank',
    prompt: 'Complete: a memória que esvazia ao desligar é a _____, e a que já vem gravada de fábrica com as instruções para ligar é a _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'RAM', aceitas: ['ram', 'memória RAM', 'memoria RAM'], hint: 'A mesa de trabalho' },
        { id: 'b2', answer: 'ROM', aceitas: ['rom', 'memória ROM', 'memoria ROM'], hint: 'O bilhete colado na porta' },
      ],
    },
    explanation: 'RAM é a mesa, que esvazia quando a luz apaga. ROM é o bilhete colado, gravado de fábrica.',
  },
  {
    id: 'AP041-F-Q9', type: 'multiple_choice',
    prompt: 'A principal diferença entre o HD e o SSD é que:',
    data: { options: [
      { id: 'a', text: 'O HD tem discos que giram, e o SSD não tem peça que se mexa.', correct: true },
      { id: 'b', text: 'O HD guarda arquivos e o SSD guarda apenas os programas do sistema.',
        porque: 'Os dois guardam de tudo. A diferença está em como gravam.' },
      { id: 'c', text: 'O SSD perde tudo ao desligar, e só o HD mantém os arquivos.',
        porque: 'Os dois mantêm. Quem perde tudo ao desligar é a RAM.' },
      { id: 'd', text: 'O HD é mais novo e veio para substituir o SSD nas máquinas atuais.',
        porque: 'É o contrário: o HD é mais antigo, e os computadores novos vêm com SSD.' },
    ]},
    explanation: 'Sem peça girando, o SSD é mais rápido, mais silencioso e aguenta melhor um tranco.',
  },
  {
    id: 'AP041-F-Q10', type: 'true_false',
    prompt: 'Tudo o que está na memória RAM continua guardado depois de o computador ser desligado.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro',
        porque: 'A RAM só se mantém com energia. Salvar é justamente passar o que está nela para o disco.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'É por isso que um trabalho não salvo se perde quando falta luz.',
  },
  {
    id: 'AP041-F-Q11', type: 'matching',
    prompt: 'Ligue cada memória ao que ela guarda.',
    data: { pairs: [
      { left: 'HD ou SSD', right: 'Seus arquivos e programas, mesmo desligado' },
      { left: 'RAM', right: 'O que está aberto agora, e esvazia ao desligar' },
      { left: 'ROM', right: 'As instruções de fábrica para a máquina ligar' },
    ]},
    explanation: 'Armário, mesa de trabalho e bilhete colado na porta.',
  },
  {
    id: 'AP041-F-Q12', type: 'multiple_choice',
    prompt: 'Teclado, mouse e scanner têm em comum que:',
    data: { options: [
      { id: 'a', text: 'Levam informação de fora para dentro do computador.', correct: true },
      { id: 'b', text: 'Mostram para a pessoa o resultado do que a máquina fez.',
        porque: 'Isso é saída, e é trabalho do monitor e da impressora.' },
      { id: 'c', text: 'Guardam os dados enquanto a máquina estiver desligada.',
        porque: 'Guardar é do HD ou do SSD. Nenhum dos três retém nada.' },
      { id: 'd', text: 'Fazem as contas que os programas abertos vão precisar.',
        porque: 'Quem calcula é a CPU. Os três apenas levam informação para dentro.' },
    ]},
    explanation: 'Digitar, clicar e digitalizar são três jeitos de a informação entrar.',
  },
  {
    id: 'AP041-F-Q13', type: 'multiple_choice',
    prompt: 'A impressora e o scanner:',
    data: { options: [
      { id: 'a', text: 'Fazem o mesmo trabalho, apenas com nomes diferentes.',
        porque: 'Trabalham em sentidos opostos, e por isso não se substituem.' },
      { id: 'b', text: 'Vão em sentidos opostos: um leva ao papel, o outro traz dele.', correct: true },
      { id: 'c', text: 'São os dois aparelhos de entrada, que trazem coisas de fora.',
        porque: 'O scanner é de entrada; a impressora é de saída.' },
      { id: 'd', text: 'Precisam estar sempre ligados um no outro para funcionarem bem.',
        porque: 'São independentes. Só na multifuncional vêm dentro da mesma caixa.' },
    ]},
    explanation: 'O scanner vai do papel para o arquivo; a impressora, do arquivo para o papel.',
  },
  {
    id: 'AP041-F-Q14', type: 'multiple_choice',
    prompt: 'A CPU é responsável por:',
    data: { options: [
      { id: 'a', text: 'Guardar de forma permanente os arquivos e os programas.',
        porque: 'Guardar é do HD ou do SSD. A CPU trabalha com a informação, mas não fica com ela.' },
      { id: 'b', text: 'Fazer as contas e comandar o que cada peça deve fazer.', correct: true },
      { id: 'c', text: 'Mostrar na tela o resultado das operações para o usuário.',
        porque: 'Mostrar é do monitor. A CPU calcula, e outra peça exibe.' },
      { id: 'd', text: 'Repartir a internet entre os aparelhos ligados na casa.',
        porque: 'Isso é o roteador. A CPU trabalha dentro da máquina.' },
    ]},
    explanation: 'CPU quer dizer unidade central de processamento: é o cérebro, e tudo passa por ela.',
  },
  {
    id: 'AP041-F-Q15', type: 'scenario',
    prompt: 'A internet caiu em casa. O técnico diz que o aparelho que traz o sinal da rua queimou. O que precisa ser trocado?',
    data: { scenarios: [
      { id: 'a', text: 'O roteador, que é quem busca o sinal lá na rua e o traz para dentro.',
        porque: 'O roteador fica depois: ele reparte o sinal que já chegou, e não vai buscá-lo.' },
      { id: 'b', text: 'O modem, que recebe o sinal da operadora e o entrega à casa.', correct: true },
      { id: 'c', text: 'A CPU, já que é ela que comanda tudo o que a máquina faz.',
        porque: 'A CPU trabalha dentro do computador. A internet cai igual com a CPU perfeita.' },
      { id: 'd', text: 'O monitor, porque sem ele não dá para ver as páginas abrindo.',
        porque: 'Sem monitor você não enxerga, mas o sinal continua chegando.' },
    ]},
    explanation: 'Quem faz a ponte com a rua é o modem. O roteador só trabalha com o que já entrou.',
  },
  {
    id: 'AP041-F-Q16', type: 'multiple_choice',
    prompt: 'Manutenção preventiva quer dizer:',
    data: { options: [
      { id: 'a', text: 'Cuidar da máquina antes que ela apresente problema.', correct: true },
      { id: 'b', text: 'Consertar a máquina assim que ela parar de funcionar.',
        porque: 'Isso é corretiva. Preventiva acontece enquanto ainda está tudo bem.' },
      { id: 'c', text: 'Trocar todas as peças por peças novas uma vez por ano.',
        porque: 'Trocar peça boa é desperdício. Prevenir é limpar, atualizar e copiar.' },
      { id: 'd', text: 'Deixar o computador desligado o máximo de tempo possível.',
        porque: 'Não usar não é cuidar. Máquina parada também junta poeira.' },
    ]},
    explanation: 'É a mesma ideia de escovar os dentes: escova-se para não doer, e não porque já dói.',
  },
  {
    id: 'AP041-F-Q17', type: 'true_false',
    prompt: 'Antes de limpar o computador, ele deve estar desligado.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso',
        porque: 'É verdadeiro. Limpar ligado arrisca choque, curto-circuito e apertar teclas sem querer.' },
    ]},
    explanation: 'E o produto de limpeza vai no pano, nunca direto na tela.',
  },
  {
    id: 'AP041-F-Q18', type: 'scenario',
    prompt: 'A Bia baixou trinta fotos do acampamento e elas estão todas soltas na área de trabalho. O que resolve melhor?',
    data: { scenarios: [
      { id: 'a', text: 'Criar uma pasta chamada Acampamento e mover as fotos para dentro.', correct: true },
      { id: 'b', text: 'Renomear as trinta fotos, uma por uma, com o nome do acampamento.',
        porque: 'Renomear ajuda a achar, mas elas continuam espalhadas pela área de trabalho.' },
      { id: 'c', text: 'Apagar as que não ficaram boas e deixar o resto onde já estava.',
        porque: 'Apagar diminui a bagunça, mas não organiza o que sobrou.' },
      { id: 'd', text: 'Deixar como está e usar a busca do sistema toda vez que precisar.',
        porque: 'A busca acha uma foto por vez. Uma pasta mantém as trinta juntas.' },
    ]},
    explanation: 'Pasta é o que mantém junto o que pertence junto — e é o que o requisito 5 pede na prática.',
  },
  {
    id: 'AP041-F-Q19', type: 'fill_blank',
    prompt: 'Complete: o que dá para pegar com a mão é o _____; os programas, que não se pegam, são o _____.',
    data: {
      blanks: [
        { id: 'b1', answer: 'hardware', aceitas: ['Hardware'], hint: 'A parte física' },
        { id: 'b2', answer: 'software', aceitas: ['Software'], hint: 'As instruções' },
      ],
    },
    explanation: 'Um precisa do outro: computador sem software é violão que ninguém toca.',
  },
  {
    id: 'AP041-F-Q20', type: 'multiple_choice',
    prompt: 'Qual é a função do monitor?',
    data: { options: [
      { id: 'a', text: 'Mostrar o que o computador está fazendo naquele momento.', correct: true },
      { id: 'b', text: 'Guardar as imagens e os textos que foram abertos nele.', porque: 'O monitor não guarda nada: apagou a tela, não sobrou imagem. Quem guarda é o disco.' },
      { id: 'c', text: 'Enviar para o computador o que a pessoa desenha nele.', porque: 'Isso seria entrada. O monitor comum só exibe o que já foi calculado.' },
      { id: 'd', text: 'Fazer as contas necessárias para desenhar cada figura.', porque: 'As contas são da CPU e da placa de vídeo. O monitor recebe pronto e acende os pontos.' },
    ]},
    explanation: 'Monitor é saída: ele entrega aos olhos o que a máquina já resolveu por dentro.',
  },
  {
    id: 'AP041-F-Q21', type: 'multiple_choice',
    prompt: 'Para que servem os cabos de um computador?',
    data: { options: [
      { id: 'a', text: 'Levar energia e também sinal de uma peça até a outra.', correct: true },
      { id: 'b', text: 'Levar apenas energia elétrica da tomada até o aparelho.', porque: 'Muitos levam informação: o cabo do monitor carrega a imagem, e o de rede carrega os dados.' },
      { id: 'c', text: 'Segurar as peças no lugar para elas não se soltarem.', porque: 'Quem prende peça é parafuso e encaixe. O cabo serve para ligar, não para sustentar.' },
      { id: 'd', text: 'Guardar os arquivos enquanto eles passam de uma peça a outra.', porque: 'Nada fica guardado num cabo: ele é caminho de passagem, e não depósito.' },
    ]},
    explanation: 'Há cabo de força e cabo de sinal. Um leva energia; o outro leva conversa entre as peças.',
  },
  {
    id: 'AP041-F-Q22', type: 'multiple_choice',
    prompt: 'O que faz o roteador?',
    data: { options: [
      { id: 'a', text: 'Reparte a internet entre os aparelhos da casa.', correct: true },
      { id: 'b', text: 'Traz o sinal da operadora da rua para dentro.', porque: 'Esse é o modem. O roteador trabalha com o sinal que já entrou na casa.' },
      { id: 'c', text: 'Aumenta a velocidade que foi contratada na operadora.', porque: 'A velocidade é a contratada. O roteador divide o que existe, sem criar mais.' },
      { id: 'd', text: 'Guarda as páginas visitadas por quem usa a rede.', porque: 'O roteador encaminha e não arquiva. O histórico fica no navegador de cada um.' },
    ]},
    explanation: 'Modem é a porta da rua; roteador é o corredor que leva a cada quarto.',
  },
  {
    id: 'AP041-F-Q23', type: 'ordering',
    prompt: 'Ordene os passos de desligar o computador do jeito certo.',
    data: {
      items: [
        { id: 'a', text: 'Salvar o trabalho e fechar os programas abertos', order: 1 },
        { id: 'b', text: 'Abrir o menu do sistema e escolher Desligar', order: 2 },
        { id: 'c', text: 'Esperar a tela apagar sozinha, sem apertar nada', order: 3 },
        { id: 'd', text: 'Só então, se for preciso, tirar da tomada', order: 4 },
      ],
    },
    explanation: 'Cada passo dá tempo ao seguinte. Pular um é pedir que o sistema pare no meio de uma gravação.',
  },
  {
    id: 'AP041-F-Q24', type: 'multiple_choice',
    prompt: 'Por que se desliga o computador pelo menu, e não segurando o botão?',
    data: { options: [
      { id: 'a', text: 'Para o sistema fechar os arquivos e gravar o que faltava.', correct: true },
      { id: 'b', text: 'Para o botão de ligar não estragar de tanto ser apertado.', porque: 'O botão aguenta bem. Quem sofre é o que estava sendo gravado quando a energia sumiu.' },
      { id: 'c', text: 'Para a máquina não fazer barulho ao apagar de uma vez só.', porque: 'Barulho não é o problema. O risco é o arquivo aberto ficar corrompido.' },
      { id: 'd', text: 'Para gastar menos energia elétrica ao desligar o aparelho.', porque: 'O consumo é o mesmo. O que muda é a máquina ter ou não tempo de se despedir.' },
    ]},
    explanation: 'Segurar o botão corta a energia na força — é recurso de emergência, para quando a máquina travou de vez.',
  },
  {
    id: 'AP041-F-Q25', type: 'scenario',
    prompt: 'O Davi usa o notebook em cima do edredom e reclama que ele esquenta. Qual é o motivo?',
    data: { scenarios: [
      { id: 'a', text: 'As saídas de ar ficam embaixo, e o tecido tapa todas elas.', correct: true },
      { id: 'b', text: 'A bateria esquenta sempre que o aparelho sai da tomada.', porque: 'A bateria esquenta um pouco, e esquentaria igual na mesa. O tecido é que muda tudo.' },
      { id: 'c', text: 'O quarto costuma ser mais quente do que a sala da casa.', porque: 'A temperatura ajuda pouco. O que prende o calor é o ar que não consegue sair.' },
      { id: 'd', text: 'Notebook esquenta assim mesmo, e não há o que se fazer.', porque: 'Há: numa superfície dura e plana o ar circula, e a máquina trabalha bem mais fria.' },
    ]},
    explanation: 'Mesa, chão de madeira, uma tábua — qualquer superfície dura resolve. O que não pode é tecido tapando a saída do ar.',
  },
  {
    id: 'AP041-F-Q26', type: 'scenario',
    prompt: 'O Téo quer a mesma pasta em dois lugares: na área de trabalho e no pen drive. O que ele faz?',
    data: { scenarios: [
      { id: 'a', text: 'Copia a pasta, porque copiar deixa uma em cada lugar.', correct: true },
      { id: 'b', text: 'Move a pasta, porque mover leva ela para os dois lugares.', porque: 'Mover tira de onde estava. Ele ficaria com uma só, agora no pen drive.' },
      { id: 'c', text: 'Renomeia a pasta, porque o nome novo cria outra igual.', porque: 'Renomear só troca o nome. Continua sendo a mesma pasta, num lugar só.' },
      { id: 'd', text: 'Cria um atalho, porque o atalho é uma segunda cópia.', porque: 'Atalho é só um caminho até a pasta. Sem o original, ele não abre nada.' },
    ]},
    explanation: 'Copiar duplica; mover transporta; o atalho aponta. Três coisas parecidas na tela e bem diferentes no resultado.',
  },
  {
    id: 'AP041-F-Q27', type: 'true_false',
    prompt: 'Esvaziar a lixeira apaga os arquivos de vez, e depois não dá mais para arrastá-los de volta.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Enquanto está na lixeira dá para restaurar; depois de esvaziada, não.' },
    ]},
    explanation: 'A lixeira é a última chance de mudar de ideia. Por isso vale conferir o que há nela antes de esvaziar.',
  },
];

/*
  A prova da AP042.

  Dezoito questões, cobrindo os cinco requisitos que têm matéria — o primeiro é
  cumprido pelo bloqueio da trilha, e não há o que perguntar sobre ele.

  Metade delas não pergunta a definição: pergunta a consequência. "O que é um
  estabilizador" mede memória; "a luz pisca quando ligam o chuveiro, o que
  resolve" mede se a pessoa sabe usar o que aprendeu. A trilha inteira foi
  escrita assim, e a prova que a fecha não podia ser mais fácil que as lições.
*/
const rawAp042Final: Question[] = [
  {
    id: 'AP042-F-Q1', type: 'multiple_choice',
    prompt: 'Qual é a diferença que mais importa entre um netbook e um notebook?',
    data: { options: [
      { id: 'a', text: 'O netbook tem menos potência e foi feito para tarefas leves.', correct: true },
      { id: 'b', text: 'O netbook não tem teclado próprio: ele usa um teclado que aparece na tela.', porque: 'Isso descreve o tablet. Os dois têm teclado preso e fecham como caderno.' },
      { id: 'c', text: 'O netbook não se liga à internet, e é por isso que ele custa bem mais barato.', porque: 'É o contrário do nome dele: "net" é rede, e ficar na internet é para o que ele nasceu.' },
      { id: 'd', text: 'O netbook só funciona ligado na tomada, porque não tem bateria instalada de fábrica.', porque: 'Ele tem bateria, e costuma durar mais que a de um notebook comum.' },
    ]},
    explanation: 'Os dois fecham e têm teclado. O que separa é a potência: netbook é para navegar, escrever e assistir.',
  },
  {
    id: 'AP042-F-Q2', type: 'multiple_choice',
    prompt: 'O que faz de um computador um servidor?',
    data: { options: [
      { id: 'a', text: 'Ele fica ligado atendendo pedidos de outras máquinas pela rede.', correct: true },
      { id: 'b', text: 'Ele tem a maior quantidade de memória e o processador mais caro do escritório.', porque: 'Servidor não se define por ficha técnica, e sim por para quem ele trabalha.' },
      { id: 'c', text: 'Ele guarda os arquivos de quem trabalha ali, funcionando como um armário digital.', porque: 'Guardar arquivo é uma das tarefas possíveis, mas não é o que define um servidor.' },
      { id: 'd', text: 'Ele fica trancado numa sala refrigerada, longe de quem possa mexer nele sem permissão.', porque: 'A sala refrigerada é consequência de ele ficar sempre ligado, não a definição dele.' },
    ]},
    explanation: 'A pergunta que resolve é sempre a mesma: para quem esta máquina trabalha?',
  },
  {
    id: 'AP042-F-Q3', type: 'matching',
    prompt: 'Ligue cada aparelho à descrição que cabe nele.',
    data: { pairs: [
      { left: 'Microcomputador', right: 'Computador de mesa, com gabinete separado' },
      { left: 'Tablet', right: 'Tela de tocar, sem teclado preso' },
      { left: 'Smartphone', right: 'Cabe na mão e tem chip de telefone' },
      { left: 'Servidor', right: 'Fica ligado atendendo outras máquinas' },
    ]},
    explanation: 'Todos são computadores. O que muda é o tamanho, a potência e para que cada um foi feito.',
  },
  {
    id: 'AP042-F-Q4', type: 'true_false',
    prompt: 'O "micro" de microcomputador quer dizer que ele é do tamanho de uma caixa de fósforos.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. O "micro" compara com os computadores que ocupavam salas inteiras.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Quando ele apareceu, um computador que cabia numa escrivaninha era espantosamente pequeno.',
  },
  {
    id: 'AP042-F-Q5', type: 'multiple_choice',
    prompt: 'Você selecionou um parágrafo e apertou o botão de justificar. O que acontece com ele?',
    data: { options: [
      { id: 'a', text: 'As linhas passam a encostar nos dois lados da margem.', correct: true },
      { id: 'b', text: 'O parágrafo vai para o meio da folha, com espaço igual dos dois lados.', porque: 'Isso é centralizar. Justificado encosta nas bordas, e não fica no meio.' },
      { id: 'c', text: 'A letra aumenta até a linha ficar completa de uma margem à outra.', porque: 'A letra não muda de tamanho: o que o programa estica é o espaço entre as palavras.' },
      { id: 'd', text: 'As linhas ficam com o mesmo número de palavras, uma embaixo da outra.', porque: 'O número de palavras por linha continua variando. O que fica reto é a borda direita.' },
    ]},
    explanation: 'Para encostar nos dois lados, o programa estica os espaços entre as palavras.',
  },
  {
    id: 'AP042-F-Q6', type: 'multiple_choice',
    prompt: 'Você apertou o botão de negrito e o texto não mudou. Qual é a primeira coisa a conferir?',
    data: { options: [
      { id: 'a', text: 'Se havia algum trecho selecionado na hora do clique.', correct: true },
      { id: 'b', text: 'Se o documento foi salvo depois da última alteração feita no texto.', porque: 'Salvar guarda o que já mudou. Não é o que impede a mudança de acontecer.' },
      { id: 'c', text: 'Se a impressora está ligada, porque sem ela o programa bloqueia a formatação.', porque: 'Impressora não tem relação nenhuma com formatar texto na tela.' },
      { id: 'd', text: 'Se o computador tem memória suficiente para aplicar o efeito no documento.', porque: 'Negrito não pesa. Se a máquina liga e abre o texto, ela dá conta disso.' },
    ]},
    explanation: 'Formatação sem seleção é ordem sem endereço: o programa não sabe onde aplicar.',
  },
  {
    id: 'AP042-F-Q7', type: 'ordering',
    prompt: 'Ponha na ordem os passos para levar um trecho para outro lugar do documento, mantendo o original onde está.',
    data: { items: [
      { id: 'i1', text: 'Selecionar o trecho', order: 1 },
      { id: 'i2', text: 'Apertar Copiar', order: 2 },
      { id: 'i3', text: 'Clicar no lugar de destino', order: 3 },
      { id: 'i4', text: 'Apertar Colar', order: 4 },
    ]},
    explanation: 'Quem quer levar embora, em vez de duplicar, troca copiar por recortar. O resto é igual.',
  },
  {
    id: 'AP042-F-Q8', type: 'fill_blank',
    prompt: 'Numa lista em que a ordem dos itens importa, como um passo a passo, usam-se ___ em vez de marcadores.',
    data: { blanks: [
      { id: 'b1', answer: 'números', hint: 'É o outro botão de lista, ao lado do de bolinhas.', aceitas: ['numeração', 'numeros', 'numeracao', 'lista numerada'] },
    ]},
    explanation: 'Bolinha numa receita esconde que o passo 3 vem depois do 2.',
  },
  {
    id: 'AP042-F-Q9', type: 'multiple_choice',
    prompt: 'Um computador trava quando muitos programas ficam abertos ao mesmo tempo. O que precisa aumentar?',
    data: { options: [
      { id: 'a', text: 'A memória RAM.', correct: true },
      { id: 'b', text: 'O espaço de armazenamento, comprando um disco maior para caber mais coisa.', porque: 'Disco maior guarda mais arquivos. Não muda quanto cabe aberto ao mesmo tempo.' },
      { id: 'c', text: 'A velocidade da internet, para as páginas terminarem de carregar mais rápido.', porque: 'Internet lenta demora a carregar, mas não trava a máquina inteira.' },
      { id: 'd', text: 'A resolução do monitor, que com mais pontos consegue mostrar mais janelas juntas.', porque: 'A tela muda o que você enxerga, não o que a máquina consegue manter aberto.' },
    ]},
    explanation: 'Quando a RAM enche, o computador passa a usar o disco como apoio — e o disco é muito mais lento.',
  },
  {
    id: 'AP042-F-Q10', type: 'true_false',
    prompt: 'Trocar um HD por um SSD costuma mudar mais o dia a dia do que dobrar a capacidade do disco.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Com SSD a máquina liga em segundos; espaço a mais só serve se ele estiver faltando.' },
    ]},
    explanation: 'O SSD não tem peça em movimento, e é isso que dá a diferença de velocidade que se sente ao ligar.',
  },
  {
    id: 'AP042-F-Q11', type: 'multiple_choice',
    prompt: 'Num anúncio aparece só "Intel Core i5". Que informação importante está faltando?',
    data: { options: [
      { id: 'a', text: 'A geração do processador.', correct: true },
      { id: 'b', text: 'O nome do fabricante do computador em que esse processador foi instalado.', porque: 'A marca da máquina muda pouco o desempenho. A geração do chip muda muito.' },
      { id: 'c', text: 'A quantidade de memória RAM, que é a peça que faz as contas na máquina.', porque: 'RAM realmente falta no anúncio, mas quem faz as contas é o processador, não ela.' },
      { id: 'd', text: 'O sistema operacional que vem instalado de fábrica junto com a máquina.', porque: 'É bom saber, mas não é o que está faltando para avaliar o processador.' },
    ]},
    explanation: 'Um i5 de geração nova é muito mais rápido que um i5 antigo. Anúncio que esconde a geração costuma esconder idade.',
  },
  {
    id: 'AP042-F-Q12', type: 'scenario',
    prompt: 'A Ana vai comprar um notebook para estudar e assistir aula. Dois modelos custam igual: um tem 4 GB de RAM com SSD, o outro tem 16 GB de RAM com HD. Qual é o problema de olhar só o número maior?',
    data: { scenarios: [
      { id: 'a', text: 'Os 4 GB vão apertar, mas o HD deixa a máquina lenta o tempo todo.', correct: true },
      { id: 'b', text: 'Não há problema nenhum: 16 GB é mais que 4 GB, e mais memória é sempre melhor.', porque: 'Os dois números falam de coisas diferentes. Aqui um deles vem junto com um disco lento.' },
      { id: 'c', text: 'O de 4 GB não vai conseguir abrir o navegador, porque hoje nenhum site abre com tão pouco.', porque: 'Abre, sim — vai apertar com muitas abas, que é diferente de não funcionar.' },
      { id: 'd', text: 'O de 16 GB é melhor de qualquer jeito, já que dá para trocar o HD por um SSD depois.', porque: 'Dá para trocar, e isso é gasto novo. A pergunta é qual leva mais longe pelo mesmo dinheiro hoje.' },
    ]},
    explanation: 'Avaliar é olhar o conjunto: memória, tipo de disco, processador e tela, comparados com o uso pretendido.',
  },
  {
    id: 'AP042-F-Q13', type: 'multiple_choice',
    prompt: 'A energia da casa oscila e a lâmpada pisca sempre que ligam o chuveiro. O que resolve isso para o computador?',
    data: { options: [
      { id: 'a', text: 'Um estabilizador, que entrega energia constante à máquina.', correct: true },
      { id: 'b', text: 'Um filtro de linha com várias tomadas, para dividir melhor a energia da casa.', porque: 'Filtro comum só aumenta o número de tomadas: a piscada continuaria igual.' },
      { id: 'c', text: 'Uma extensão mais longa, ligando o computador numa tomada de outro cômodo.', porque: 'A oscilação é da instalação inteira. Mudar de tomada não muda a energia que chega.' },
      { id: 'd', text: 'Trocar a fonte do computador por uma de potência maior, que aguente mais carga.', porque: 'Fonte maior recebe a mesma energia irregular. Ela não conserta o que chega.' },
    ]},
    explanation: 'A piscada é queda de energia, e corrigir queda é exatamente o trabalho do estabilizador.',
  },
  {
    id: 'AP042-F-Q14', type: 'multiple_choice',
    prompt: 'O que um nobreak faz e um estabilizador não faz?',
    data: { options: [
      { id: 'a', text: 'Mantém a máquina ligada por alguns minutos quando a energia acaba.', correct: true },
      { id: 'b', text: 'Deixa o computador mais rápido, porque entrega energia limpa e sem interrupção.', porque: 'Energia estável protege a máquina, mas não acelera nada.' },
      { id: 'c', text: 'Protege contra raio, cortando a energia assim que a descarga chega pela fiação.', porque: 'Contra raio o que funciona é tirar da tomada. Nenhum dos dois dá conta.' },
      { id: 'd', text: 'Aumenta o número de tomadas disponíveis, funcionando como uma régua de energia.', porque: 'Isso é o filtro de linha. O nobreak tem tomadas, mas não é para isso que ele existe.' },
    ]},
    explanation: 'A bateria é a diferença — e ela existe para você salvar o arquivo e desligar direito, não para continuar trabalhando.',
  },
  {
    id: 'AP042-F-Q15', type: 'true_false',
    prompt: 'Durante uma tempestade com raios, desligar o computador no botão já basta para protegê-lo.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. Espetado na tomada ele continua ligado à fiação, que é por onde o raio chega.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Tire da tomada o cabo de força e também o de internet: o raio entra pelos dois.',
  },
  {
    id: 'AP042-F-Q16', type: 'multiple_choice',
    prompt: 'Qual é o jeito certo de tirar um programa do computador?',
    data: { options: [
      { id: 'a', text: 'Abrir as configurações do sistema e mandar desinstalar o programa.', correct: true },
      { id: 'b', text: 'Arrastar o atalho da área de trabalho para a lixeira e depois esvaziá-la.', porque: 'Isso apaga o atalho. O programa continua instalado, ocupando o mesmo espaço.' },
      { id: 'c', text: 'Apagar a pasta do programa dentro da pasta de Arquivos de Programas do sistema.', porque: 'Tira os arquivos principais e deixa registros, atalhos e configurações espalhados.' },
      { id: 'd', text: 'Instalar por cima uma versão mais nova, que substitui a antiga e libera o espaço.', porque: 'Isso atualiza o programa. Ele continua na máquina, e era justamente o que se queria tirar.' },
    ]},
    explanation: 'O desinstalador desfaz o que a instalação fez. Qualquer outro caminho deixa sobra pelo sistema.',
  },
  {
    id: 'AP042-F-Q17', type: 'multiple_choice',
    prompt: 'Por que exportar um relatório em pdf antes de mandar para outra pessoa?',
    data: { options: [
      { id: 'a', text: 'Porque ele chega com a formatação que você deixou, em qualquer computador.', correct: true },
      { id: 'b', text: 'Porque o pdf ocupa sempre menos espaço do que qualquer documento de texto.', porque: 'Nem sempre: pdf com muita imagem pode ficar maior que o documento original.' },
      { id: 'c', text: 'Porque só o pdf pode ser enviado como anexo em mensagem de correio eletrônico.', porque: 'Qualquer arquivo vai como anexo. O motivo do pdf é outro.' },
      { id: 'd', text: 'Porque o pdf corrige sozinho os erros de digitação antes de gerar o arquivo final.', porque: 'Nenhum formato corrige texto. Exportar só congela o documento como ele está.' },
    ]},
    explanation: 'Margem, fonte e quebra de página ficam travadas — e ninguém muda o texto sem querer.',
  },
  {
    id: 'AP042-F-Q18', type: 'scenario',
    prompt: 'Você vai imprimir 3 cópias de um relatório de 4 páginas para entregar a três pessoas. Esqueceu de marcar "agrupado". O que sai da impressora?',
    data: { scenarios: [
      { id: 'a', text: 'As três páginas 1 juntas, depois as três páginas 2, e assim por diante.', correct: true },
      { id: 'b', text: 'Apenas uma cópia, porque sem o agrupamento a impressora ignora a quantidade pedida.', porque: 'A quantidade é obedecida. O que muda é a ordem em que as folhas saem.' },
      { id: 'c', text: 'As três cópias completas e em ordem, porque agrupar serve só para grampear no fim.', porque: 'É justamente o contrário: agrupado é o que faz cada cópia sair inteira e em ordem.' },
      { id: 'd', text: 'Uma cópia em ordem e as outras duas embaralhadas, misturando as páginas de cada uma.', porque: 'Não é aleatório: sem agrupar, a impressora vai página por página, do começo ao fim.' },
    ]},
    explanation: 'Dá o mesmo papel e a mesma tinta — mas alguém vai separar tudo à mão depois.',
  },
];

/*
  Qual prova vai para qual trilha.

  Era um ternário: a AP034 recebia a dela, e *qualquer outro código* recebia a
  da AP035 — inclusive uma trilha que ainda não tivesse prova nenhuma. A AP041
  teria estreado aplicando a prova de Internet, Avançado aos desbravadores dela,
  e nada no sistema de tipos denunciaria isso. O mapa explícito não tem esse
  ramo calado: código sem prova devolve vazio, e há teste exigindo que toda
  trilha com módulo final tenha a sua.
*/
const PROVAS: Record<string, Question[]> = {
  AP034: rawAp034Final,
  AP035: rawAp035Final,
  AP041: rawAp041Final,
  AP042: rawAp042Final,
};

export function getFinalExamQuestions(specialtyCode: string): Question[] {
  return embaralharQuestoes(PROVAS[specialtyCode] ?? []);
}
