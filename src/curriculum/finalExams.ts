import type { Question } from '../types';
import { sortearCobrindo, quantasPerguntar } from '../lib/questoes';

const rawAp034Final: Question[] = [
  {
    id: 'AP034-F-Q1', type: 'multiple_choice',
    requisitos: ['AP034-1.1'],
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
    requisitos: ['AP034-1.2'],
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
    requisitos: ['AP034-1.3'],
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
    requisitos: ['AP034-1.6'],
    prompt: 'O e-mail é um sistema de troca de mensagens digitais que funciona sobre a Internet.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. O e-mail é um dos serviços mais antigos da Internet — anterior à própria Web.' },
    ]},
    explanation: 'E-mail (correio eletrônico) é um dos serviços mais antigos da Internet.',
  },
  {
    id: 'AP034-F-Q5', type: 'multiple_choice',
    requisitos: ['AP034-1.7'],
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
    requisitos: ['AP034-2.1'],
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
    requisitos: ['AP034-2.1'],
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
    requisitos: ['AP034-2.3'],
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
    requisitos: ['AP034-4.1', 'AP034-4.3', 'AP034-4.4'],
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
    requisitos: ['AP034-7.1'],
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
    requisitos: ['AP034-1.1', 'AP034-1.2', 'AP034-1.3', 'AP034-1.4', 'AP034-1.6', 'AP034-1.7', 'AP034-2.5'],
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
    requisitos: ['AP034-1.3', 'AP034-2.5', 'AP034-4.1'],
    /* O enunciado era o mesmo da Q19, palavra por palavra. As lacunas sempre
       foram outras; quem fazia a prova é que via a mesma pergunta duas vezes. */
    prompt: 'Complete as lacunas sobre as ameaças e a defesa.',
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
    requisitos: ['AP034-2.1'],
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
    requisitos: ['AP034-4.1', 'AP034-7.4'],
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
    requisitos: ['AP034-5.1', 'AP034-5.2'],
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
    requisitos: ['AP034-4.1'],
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
    requisitos: ['AP034-8.1'],
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
    requisitos: ['AP034-4.2'],
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
    requisitos: ['AP034-2.1'],
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
    requisitos: ['AP034-2.1'],
    prompt: 'O webmail permite acessar e-mails pelo navegador sem instalar nenhum programa.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'Permite sim: o webmail roda dentro do navegador, e é por isso que dá para ler e-mail em qualquer computador.' },
    ]},
    explanation: 'Webmail (Gmail, Outlook.com) é acessado pelo navegador. As mensagens ficam no servidor.',
  },
  {
    id: 'AP034-F-Q18', type: 'scenario',
    requisitos: ['AP034-4.1'],
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
    requisitos: ['AP034-2.2'],
    prompt: 'Complete as lacunas sobre o que mostra que a conexão é segura.',
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
    requisitos: ['AP034-3.1'],
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
    requisitos: ['AP034-5.8'],
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
    requisitos: ['AP034-1.7'],
    prompt: 'Um worm se espalha pela rede sem precisar de um arquivo hospedeiro, ao contrário do vírus.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro, e é a diferença entre os dois: o vírus precisa se alojar num arquivo, o worm caminha sozinho pela rede.' },
    ]},
    explanation: 'Worms se replicam automaticamente pela rede. Vírus precisam de um arquivo hospedeiro.',
  },
  {
    id: 'AP034-F-Q23', type: 'multiple_choice',
    requisitos: ['AP034-1.5'],
    prompt: 'O clube trocou a empresa que hospeda o site, e o endereço continuou o mesmo. O que mudou?',
    data: { options: [
      { id: 'a', text: 'O servidor onde as páginas ficam guardadas.', correct: true },
      { id: 'b', text: 'O site inteiro, porque cada empresa hospeda um site diferente.', porque: 'Os arquivos são os mesmos, copiados para outra máquina. Um site não deixa de ser ele por mudar de casa.' },
      { id: 'c', text: 'O endereço, que passou a apontar para outro lugar da web.', porque: 'O endereço continuou o mesmo. O que mudou foi a máquina para a qual ele aponta.' },
      { id: 'd', text: 'Nada: hospedagem é outro nome para o endereço do site.', porque: 'São coisas separadas. O endereço é o nome; a hospedagem é a máquina que guarda as páginas e as entrega.' },
    ]},
    explanation: 'O site é o conjunto de páginas; o servidor é a máquina que as guarda. Trocar de servidor sem trocar de endereço é como mudar de casa sem mudar de nome.',
  },
  {
    id: 'AP034-F-Q24', type: 'multiple_choice',
    requisitos: ['AP034-2.4'],
    prompt: 'Um site saiu do ar ontem e o buscador ainda o mostra na lista de resultados. Por quê?',
    data: { options: [
      { id: 'a', text: 'O buscador responde pelo índice que montou antes.', correct: true },
      { id: 'b', text: 'O buscador visita cada site no instante em que alguém pesquisa.', porque: 'A resposta levaria minutos se fosse assim. Ele consulta um índice já pronto, montado com antecedência.' },
      { id: 'c', text: 'O navegador guardou a página e a mostra no lugar do buscador.', porque: 'O navegador guarda o que você já visitou. A lista de resultados veio do buscador, e não dele.' },
      { id: 'd', text: 'O site continua no ar, e quem está sem acesso é quem pesquisou.', porque: 'O enunciado diz que ele saiu do ar. O resultado que sobrou é do índice, e não do site.' },
    ]},
    explanation: 'O buscador não procura na hora: ele responde a partir do que indexou antes. É por isso que um resultado pode levar a uma página que já não existe.',
  },
  {
    id: 'AP034-F-Q25', type: 'multiple_choice',
    requisitos: ['AP034-5.0'],
    prompt: 'Entre os recursos que uma família pode ligar, qual protege sem olhar o conteúdo de nada?',
    data: { options: [
      { id: 'a', text: 'O limite de horário, que desliga a internet na hora combinada.', correct: true },
      { id: 'b', text: 'A busca segura, que esconde os resultados impróprios.', porque: 'Ela decide pelo conteúdo de cada resultado — e é justamente por isso que erra nos dois sentidos.' },
      { id: 'c', text: 'O bloqueio de páginas adultas, ligado no roteador da casa.', porque: 'Ele examina o endereço e a categoria de cada página. É conteúdo que ele está olhando.' },
      { id: 'd', text: 'O controle da loja, que barra a instalação de aplicativos.', porque: 'Ele olha a classificação do aplicativo, que também é conteúdo. O que ele não olha é o relógio.' },
    ]},
    explanation: 'O filtro por horário é o mais simples e um dos mais eficazes justamente por não depender de julgar nada: ele conta o tempo, e tempo não tem como ser interpretado errado.',
  },
];

const rawAp035Final: Question[] = [
  {
    id: 'AP035-F-Q1', type: 'multiple_choice',
    requisitos: ['AP035-2.1'],
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
    requisitos: ['AP035-2.1', 'AP035-2.4'],
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
    requisitos: ['AP035-2.3'],
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
    requisitos: ['AP035-2.4'],
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
    requisitos: ['AP035-2.6'],
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
    requisitos: ['AP035-2.1', 'AP035-2.5'],
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
    requisitos: ['AP035-3.1', 'AP035-3.2', 'AP035-3.3', 'AP035-3.6', 'AP035-3.9', 'AP035-3.11'],
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
    requisitos: ['AP035-2.5'],
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
    requisitos: ['AP035-2.7'],
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
    requisitos: ['AP035-7.1'],
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
    requisitos: ['AP035-6.1'],
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
    requisitos: ['AP035-3.9'],
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
    requisitos: ['AP035-2.3'],
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
    requisitos: ['AP035-2.3'],
    prompt: 'O PHP é executado no navegador do usuário.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. O PHP roda no servidor e o navegador recebe apenas o HTML que ele produziu — nunca o código.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'PHP é executado no SERVIDOR. O usuário recebe apenas o HTML resultante.',
  },
  {
    id: 'AP035-F-Q15', type: 'scenario',
    requisitos: ['AP035-2.6', 'AP035-5.1'],
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
    requisitos: ['AP035-2.4'],
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
    requisitos: ['AP035-2.6', 'AP035-2.7'],
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
    /* Era a definição de IA generativa outra vez, com as mesmas alternativas
       da Q10 e a mesma explicação — a prova cobrava duas vezes a mesma coisa.
       A definição vale uma vez; esta agora mede o entendimento dela, no
       engano que mais custa caro: achar que o assistente procura a resposta
       em algum lugar, em vez de montá-la. */
    id: 'AP035-F-Q18', type: 'multiple_choice',
    requisitos: ['AP035-7.1'],
    prompt: 'Você faz a mesma pergunta duas vezes ao assistente de IA e recebe duas respostas diferentes. Por quê?',
    data: { options: [
      { id: 'a', text: 'Ele monta a resposta pedaço por pedaço, escolhendo entre continuações prováveis, em vez de buscar uma resposta guardada.', correct: true },
      { id: 'b', text: 'Porque entre uma pergunta e outra a Internet mudou, e ele leu uma página nova sobre o assunto.', porque: 'Ele não sai lendo a Internet a cada pergunta. A diferença vem de como a resposta é montada, e não de o mundo ter mudado em dez segundos.' },
      { id: 'c', text: 'Porque a primeira resposta estava errada e ele percebeu sozinho, corrigindo na segunda vez.', porque: 'Ele não sabe qual das duas está certa: as duas saíram do mesmo jeito. Conferir continua sendo trabalho de quem perguntou.' },
      { id: 'd', text: 'Porque cada resposta vem de um site diferente, e ele mostra o que achou em cada um deles.', porque: 'Resposta de IA generativa não é recorte de site. Ela é escrita na hora, e é por isso que ela pode inventar o que nenhum site diz.' },
    ]},
    explanation: 'O modelo escreve a resposta na hora, escolhendo a cada passo entre continuações prováveis. Por isso a mesma pergunta rende textos diferentes — e por isso o que ele diz precisa ser conferido.',
  },
  {
    id: 'AP035-F-Q19', type: 'true_false',
    requisitos: ['AP035-7.1'],
    prompt: 'A IA pode produzir informações incorretas, conhecidas como alucinações.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. A IA pode afirmar com segurança algo que não existe — por isso se confere antes de usar.' },
    ]},
    explanation: 'Modelos de IA podem gerar respostas plausíveis, mas factualmente incorretas.',
  },
  {
    id: 'AP035-F-Q20', type: 'ordering',
    requisitos: ['AP035-7.1'],
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
    requisitos: ['AP035-8.1'],
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
    requisitos: ['AP035-2.2', 'AP035-3.6'],
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
    requisitos: ['AP041-1.1'],
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
    requisitos: ['AP041-1.1'],
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
    requisitos: ['AP041-1.1'],
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
    requisitos: ['AP041-2.1'],
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
    requisitos: ['AP041-2.2'],
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
    requisitos: ['AP041-2.3'],
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
    requisitos: ['AP041-2.4'],
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
    requisitos: ['AP041-2.6', 'AP041-2.7'],
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
    requisitos: ['AP041-2.5'],
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
    requisitos: ['AP041-2.6'],
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
    requisitos: ['AP041-2.5', 'AP041-2.6', 'AP041-2.7'],
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
    requisitos: ['AP041-4.1', 'AP041-4.2', 'AP041-4.5'],
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
    requisitos: ['AP041-4.4', 'AP041-4.5'],
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
    requisitos: ['AP041-4.6'],
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
    requisitos: ['AP041-4.8'],
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
    requisitos: ['AP041-3.2'],
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
    requisitos: ['AP041-3.1'],
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
    requisitos: ['AP041-5.6'],
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
    requisitos: ['AP041-2.1', 'AP041-2.2'],
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
    requisitos: ['AP041-4.3'],
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
    requisitos: ['AP041-4.7'],
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
    requisitos: ['AP041-4.9'],
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
    requisitos: ['AP041-3.3'],
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
    requisitos: ['AP041-3.3'],
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
    requisitos: ['AP041-3.1'],
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
    requisitos: ['AP041-5.2'],
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
    requisitos: ['AP041-5.5'],
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

  Trinta e seis questões, das quais quinze são sorteadas. Ela cobre todos os
  requisitos da trilha menos o primeiro, que é cumprido pelo bloqueio e não tem
  o que perguntar.

  Metade delas não pergunta a definição: pergunta a consequência. "O que é um
  estabilizador" mede memória; "a luz pisca quando ligam o chuveiro, o que
  resolve" mede se a pessoa sabe usar o que aprendeu. A trilha inteira foi
  escrita assim, e a prova que a fecha não podia ser mais fácil que as lições.

  ── Por que ela cresceu ──────────────────────────────────────────────────
  Eram dezenove questões para dezenove requisitos, e o sorteio pedia quinze:
  quase toda vaga estava comprometida com a cobertura, e duas tentativas
  voltavam quase iguais — trinta e um conjuntos distintos em quinhentos
  sorteios. Com dezessete questões novas são quinhentos em quinhentos.

  Quatro requisitos não tinham pergunta nenhuma: a folha (margens, papel e
  orientação), o tamanho da fonte, o espaçamento do parágrafo e compactar. Duas
  das novas resolvem os quatro de uma vez — uma liga cada ajuste ao que ele
  muda no documento, a outra liga cada tarefa do último módulo ao programa onde
  ela acontece, que é o que aquele laboratório de fato ensina. Questão que mede
  vários requisitos cobre mais gastando uma vaga só: é por isso que o piso do
  sorteio caiu de treze para onze enquanto a prova passou a cobrar mais.
*/
const rawAp042Final: Question[] = [
  {
    id: 'AP042-F-Q1', type: 'multiple_choice',
    requisitos: ['AP042-2.1', 'AP042-2.2'],
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
    requisitos: ['AP042-2.6'],
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
    requisitos: ['AP042-2.3', 'AP042-2.4', 'AP042-2.5', 'AP042-2.6'],
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
    requisitos: ['AP042-2.3'],
    prompt: 'O "micro" de microcomputador quer dizer que ele é do tamanho de uma caixa de fósforos.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. O "micro" compara com os computadores que ocupavam salas inteiras.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Quando ele apareceu, um computador que cabia numa escrivaninha era espantosamente pequeno.',
  },
  {
    id: 'AP042-F-Q5', type: 'multiple_choice',
    requisitos: ['AP042-3.5'],
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
    requisitos: ['AP042-3.4'],
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
    requisitos: ['AP042-3.2'],
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
    requisitos: ['AP042-3.7'],
    prompt: 'Numa lista em que a ordem dos itens importa, como um passo a passo, usam-se ___ em vez de marcadores.',
    data: { blanks: [
      { id: 'b1', answer: 'números', hint: 'É o outro botão de lista, ao lado do de bolinhas.', aceitas: ['numeração', 'numeros', 'numeracao', 'lista numerada'] },
    ]},
    explanation: 'Bolinha numa receita esconde que o passo 3 vem depois do 2.',
  },
  {
    id: 'AP042-F-Q9', type: 'multiple_choice',
    requisitos: ['AP042-4.1'],
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
    requisitos: ['AP042-4.2'],
    prompt: 'Trocar um HD por um SSD costuma mudar mais o dia a dia do que dobrar a capacidade do disco.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Com SSD a máquina liga em segundos; espaço a mais só serve se ele estiver faltando.' },
    ]},
    explanation: 'O SSD não tem peça em movimento, e é isso que dá a diferença de velocidade que se sente ao ligar.',
  },
  {
    id: 'AP042-F-Q11', type: 'multiple_choice',
    requisitos: ['AP042-4.3', 'AP042-4.4'],
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
    requisitos: ['AP042-4.1', 'AP042-4.2'],
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
    requisitos: ['AP042-5.1'],
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
    requisitos: ['AP042-5.1'],
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
    requisitos: ['AP042-5.1'],
    prompt: 'Durante uma tempestade com raios, desligar o computador no botão já basta para protegê-lo.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. Espetado na tomada ele continua ligado à fiação, que é por onde o raio chega.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Tire da tomada o cabo de força e também o de internet: o raio entra pelos dois.',
  },
  {
    id: 'AP042-F-Q16', type: 'multiple_choice',
    requisitos: ['AP042-6.3'],
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
    requisitos: ['AP042-6.2'],
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
    requisitos: ['AP042-6.4'],
    prompt: 'Você vai imprimir 3 cópias de um relatório de 4 páginas para entregar a três pessoas. Esqueceu de marcar "agrupado". O que sai da impressora?',
    data: { scenarios: [
      { id: 'a', text: 'As três páginas 1 juntas, depois as três páginas 2, e assim por diante.', correct: true },
      { id: 'b', text: 'Apenas uma cópia, porque sem o agrupamento a impressora ignora a quantidade pedida.', porque: 'A quantidade é obedecida. O que muda é a ordem em que as folhas saem.' },
      { id: 'c', text: 'As três cópias completas e em ordem, porque agrupar serve só para grampear no fim.', porque: 'É justamente o contrário: agrupado é o que faz cada cópia sair inteira e em ordem.' },
      { id: 'd', text: 'Uma cópia em ordem e as outras duas embaralhadas, misturando as páginas de cada uma.', porque: 'Não é aleatório: sem agrupar, a impressora vai página por página, do começo ao fim.' },
    ]},
    explanation: 'Dá o mesmo papel e a mesma tinta — mas alguém vai separar tudo à mão depois.',
  },
  {
    id: 'AP042-F-Q19', type: 'multiple_choice',
    requisitos: ['AP042-4.5'],
    prompt: 'Três desbravadores vão assistir a um vídeo no mesmo monitor, sentados lado a lado. Que característica da tela mais pesa aqui?',
    data: { options: [
      { id: 'a', text: 'O tipo de painel, porque de lado o IPS mantém a cor.', correct: true },
      { id: 'b', text: 'O tamanho em polegadas, para que todos enxerguem de longe.', porque: 'Ajuda a enxergar, e não resolve o ângulo: numa tela TN grande as cores continuam desbotando para quem está de lado.' },
      { id: 'c', text: 'A resolução, que define quantos pontos formam a imagem.', porque: 'Ela decide o detalhe da imagem, e é a mesma vista de qualquer ângulo.' },
      { id: 'd', text: 'O brilho, medido em nits, que vence a luz da sala.', porque: 'O brilho resolve o reflexo da janela. Quem falha ao se olhar de lado é o painel.' },
    ]},
    explanation: 'Tamanho, resolução e painel são três coisas diferentes, e o painel é a que quase ninguém olha — até assistir a algo em três pessoas.',
  },
  {
    id: 'AP042-F-Q20', type: 'matching',
    requisitos: ['AP042-3.1', 'AP042-3.3', 'AP042-3.5', 'AP042-3.6'],
    prompt: 'Ligue cada ajuste ao que ele muda no documento.',
    data: { pairs: [
      { left: 'Margens', right: 'A faixa em branco na volta do texto' },
      { left: 'Orientação', right: 'A folha em pé, ou deitada para caber tabela larga' },
      { left: 'Tamanho da fonte', right: 'A altura da letra, contada em pontos' },
      { left: 'Alinhamento', right: 'O lado em que as linhas do parágrafo encostam' },
      { left: 'Espaçamento', right: 'O ar entre uma linha e a de baixo' },
    ]},
    explanation: 'São cinco botões da mesma barra, e cada um mexe numa coisa diferente: a folha, a letra e o parágrafo.',
  },
  {
    id: 'AP042-F-Q21', type: 'matching',
    requisitos: ['AP042-6.1', 'AP042-6.2', 'AP042-6.3', 'AP042-6.4'],
    prompt: 'Ligue cada tarefa ao lugar do Windows onde ela acontece.',
    data: { pairs: [
      { left: 'Compactar uma pasta', right: 'No Explorador, pelo botão direito em cima dela' },
      { left: 'Transformar o relatório em pdf', right: 'No próprio editor de texto, em Salvar como' },
      { left: 'Tirar um programa do computador', right: 'Nas Configurações do Windows' },
      { left: 'Escolher quantas cópias sairão', right: 'Na caixa de impressão, antes de mandar imprimir' },
    ]},
    explanation: 'Boa parte do que há para aprender nestas quatro é justamente em qual programa cada uma mora — nenhuma delas está onde a intuição procura primeiro.',
  },
  {
    id: 'AP042-F-Q22', type: 'scenario',
    requisitos: ['AP042-6.1'],
    prompt: 'Você compactou a pasta com as fotos do acampamento e o arquivo novo apareceu do lado. O que aconteceu com a pasta original?',
    data: { scenarios: [
      { id: 'a', text: 'Continua onde estava, inteira.', correct: true },
      { id: 'b', text: 'Foi apagada, que é o objetivo de compactar.', porque: 'Apagar é escolha à parte, e a caixinha que faz isso vem desmarcada.' },
      { id: 'c', text: 'Foi movida para dentro do arquivo compactado.', porque: 'O conteúdo foi copiado para dentro dele. A pasta de origem não saiu do lugar.' },
      { id: 'd', text: 'Encolheu pela metade, junto com o arquivo novo.', porque: 'Quem encolhe é o arquivo novo. A pasta continua ocupando o que ocupava.' },
    ]},
    explanation: 'Compactar não é apagar: no fim existem os dois. Liberar espaço é um segundo passo, e é decisão de quem compactou.',
  },
  {
    id: 'AP042-F-Q23', type: 'scenario',
    requisitos: ['AP042-2.1'],
    prompt: 'Sua tia quer um aparelho só para escrever e-mail e navegar, e pede o mais barato que preste. O que cabe melhor?',
    data: { scenarios: [
      { id: 'a', text: 'Um netbook, feito para esse tipo de tarefa.', correct: true },
      { id: 'b', text: 'Um notebook potente, que dura mais tempo sem ficar velho.', porque: 'Ele dá conta, e ela pagaria por uma potência que as tarefas dela nunca vão pedir.' },
      { id: 'c', text: 'Um microcomputador de mesa, que custa menos que os portáteis.', porque: 'Pode custar menos, mas fica preso a uma mesa — e ela não pediu isso.' },
      { id: 'd', text: 'Um servidor usado, que costuma sair barato de segunda mão.', porque: 'Servidor é feito para atender outras máquinas, e nem tela costuma ter.' },
    ]},
    explanation: 'Escolher aparelho é casar a tarefa com a máquina. Potência que não se usa é dinheiro parado.',
  },
  {
    id: 'AP042-F-Q24', type: 'multiple_choice',
    requisitos: ['AP042-2.2'],
    prompt: 'O que um notebook traz junto que um microcomputador de mesa não traz?',
    data: { options: [
      { id: 'a', text: 'Tela, teclado e bateria no mesmo corpo.', correct: true },
      { id: 'b', text: 'A capacidade de rodar programas de escritório.', porque: 'Os dois rodam os mesmos programas. O que muda é o formato, e não o que cabe dentro.' },
      { id: 'c', text: 'Acesso à internet sem fio, que o de mesa não tem.', porque: 'Computador de mesa também se liga ao Wi-Fi, e muitos já vêm preparados de fábrica.' },
      { id: 'd', text: 'Um processador de família diferente da dos de mesa.', porque: 'As famílias são as mesmas: Core e Ryzen aparecem nos dois.' },
    ]},
    explanation: 'É a mesma máquina numa embalagem que anda junto — e é a bateria que a faz funcionar longe da tomada.',
  },
  {
    id: 'AP042-F-Q25', type: 'true_false',
    requisitos: ['AP042-2.4'],
    prompt: 'Um tablet é um computador, mesmo não tendo teclado preso a ele.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'Ele calcula, guarda arquivo e roda programa como os outros. O teclado é acessório, e não a definição.' },
    ]},
    explanation: 'Todos os aparelhos deste requisito são computadores. O que muda entre eles é o tamanho, a potência e para que cada um foi feito.',
  },
  {
    id: 'AP042-F-Q26', type: 'multiple_choice',
    requisitos: ['AP042-2.5'],
    prompt: 'O que separa um smartphone de um tablet pequeno?',
    data: { options: [
      { id: 'a', text: 'O chip, que o liga à rede da operadora.', correct: true },
      { id: 'b', text: 'O tamanho da tela, que no smartphone é sempre menor.', porque: 'Há celular maior que tablet pequeno. O tamanho não separa os dois com segurança.' },
      { id: 'c', text: 'A tela de tocar, que só o smartphone tem.', porque: 'Os dois são de tocar. Foi essa tela que aproximou as duas categorias.' },
      { id: 'd', text: 'A capacidade de instalar aplicativos da loja.', porque: 'Tablet instala aplicativo da mesma loja, e muitas vezes o mesmo aplicativo.' },
    ]},
    explanation: 'Cabe na mão e tem chip de telefone: é isso que faz dele um smartphone, e não a tela nem os aplicativos.',
  },
  {
    id: 'AP042-F-Q27', type: 'fill_blank',
    requisitos: ['AP042-3.2'],
    prompt: 'Complete os atalhos, escrevendo só a letra de cada um: copiar é Ctrl+___, colar é Ctrl+___, e o que leva o trecho embora do lugar de origem é Ctrl+___.',
    data: {
      blanks: [
        { id: 'b1', answer: 'C', hint: 'Deixa o original onde está e guarda uma cópia' },
        { id: 'b2', answer: 'V', hint: 'Põe no lugar novo o que foi guardado' },
        { id: 'b3', answer: 'X', hint: 'Recortar — o trecho sai de onde estava' },
      ],
    },
    explanation: 'Copiar e recortar terminam do mesmo jeito na tela: o trecho aparece no lugar novo. A diferença está em ele continuar, ou não, no lugar antigo.',
  },
  {
    id: 'AP042-F-Q28', type: 'multiple_choice',
    requisitos: ['AP042-3.4'],
    prompt: 'Por que se recomenda usar pouco o sublinhado num texto que vai ser lido na tela?',
    data: { options: [
      { id: 'a', text: 'Porque texto sublinhado parece link, e a pessoa tenta clicar.', correct: true },
      { id: 'b', text: 'Porque ele deixa o arquivo mais pesado que o negrito.', porque: 'Nenhum dos três muda o tamanho do arquivo de forma perceptível.' },
      { id: 'c', text: 'Porque alguns programas não conseguem mostrar sublinhado.', porque: 'Todos mostram. O problema não é técnico: é o que o leitor entende ao ver.' },
      { id: 'd', text: 'Porque ele só funciona quando o texto é impresso.', porque: 'Ele aparece na tela igual. É justamente ali que ele se confunde com link.' },
    ]},
    explanation: 'Negrito para o que precisa ser visto de longe, itálico para ênfase leve, e sublinhado com parcimônia — na tela ele carrega um significado que você não pediu.',
  },
  {
    id: 'AP042-F-Q29', type: 'multiple_choice',
    requisitos: ['AP042-3.5'],
    prompt: 'Numa carta, que alinhamento se costuma dar à data e à assinatura?',
    data: { options: [
      { id: 'a', text: 'À direita.', correct: true },
      { id: 'b', text: 'Justificado, como o corpo da carta.', porque: 'Justificar estica os espaços de uma linha cheia. Numa linha curta o resultado fica esquisito.' },
      { id: 'c', text: 'Centralizado, para que fiquem em destaque.', porque: 'Centralizado é de título e de capa. Data e assinatura têm lugar próprio, na direita.' },
      { id: 'd', text: 'À esquerda, que é o alinhamento normal do texto.', porque: 'É o normal do corpo do texto, e é justamente por isso que a data se destaca do outro lado.' },
    ]},
    explanation: 'Cada alinhamento tem o seu uso, e o da direita quase só aparece nesses dois lugares.',
  },
  {
    id: 'AP042-F-Q30', type: 'true_false',
    requisitos: ['AP042-3.7'],
    prompt: 'Pôr bolinhas numa receita, em vez de números, esconde que o passo 3 vem depois do 2.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'A bolinha diz que a ordem não importa. Numa receita ela importa, e é o número que informa isso.' },
    ]},
    explanation: 'Escolher marcador ou numeração não é enfeite: é dizer ao leitor se a ordem faz parte do conteúdo.',
  },
  {
    id: 'AP042-F-Q31', type: 'multiple_choice',
    requisitos: ['AP042-4.3'],
    prompt: 'Entre um Core i3 e um Core i7 da mesma geração, o que o número maior indica?',
    data: { options: [
      { id: 'a', text: 'Um processador mais forte, para trabalho mais pesado.', correct: true },
      { id: 'b', text: 'Um processador mais novo, lançado depois do outro.', porque: 'Quem diz a idade é a geração, e não o número da família: existe i3 novo e i7 antigo.' },
      { id: 'c', text: 'Uma quantidade maior de memória vindo junto com ele.', porque: 'Memória é outra peça, comprada à parte. O nome do processador não fala dela.' },
      { id: 'd', text: 'Um consumo de energia menor, por ser mais eficiente.', porque: 'Costuma ser o contrário: mais potência costuma pedir mais energia.' },
    ]},
    explanation: 'A família diz a força: i3 e Ryzen 3 dão conta de escrever e navegar; i7 e Ryzen 7 são para edição e jogo pesado.',
  },
  {
    id: 'AP042-F-Q32', type: 'multiple_choice',
    requisitos: ['AP042-4.4'],
    prompt: 'Por que comparar dois computadores só pelos gigahertz leva à escolha errada?',
    data: { options: [
      { id: 'a', text: 'Porque os núcleos e a geração também mudam o resultado.', correct: true },
      { id: 'b', text: 'Porque o número de gigahertz muda conforme o programa aberto.', porque: 'Ele varia um pouco na prática, mas o anunciado é fixo. O que engana é ele não contar a história toda.' },
      { id: 'c', text: 'Porque os fabricantes não medem os gigahertz do mesmo jeito.', porque: 'A medida é a mesma para todos. O que difere é quanto trabalho cada chip faz em cada ciclo.' },
      { id: 'd', text: 'Porque gigahertz mede a memória, e não o processador.', porque: 'Mede o processador: são bilhões de operações por segundo. Memória se mede em gigabytes.' },
    ]},
    explanation: 'Um chip novo de 2,5 GHz pode ser mais rápido que um antigo de 3,5 GHz — e quatro núcleos são quatro pessoas trabalhando em vez de uma.',
  },
  {
    id: 'AP042-F-Q33', type: 'multiple_choice',
    requisitos: ['AP042-4.5'],
    prompt: 'Duas telas custam o mesmo: uma de 27 polegadas em HD e uma de 24 em Full HD. Qual mostra mais coisa de uma vez?',
    data: { options: [
      { id: 'a', text: 'A de 24 polegadas, que tem mais pontos.', correct: true },
      { id: 'b', text: 'A de 27 polegadas, porque tela maior cabe mais.', porque: 'Tela maior com menos pontos mostra a mesma coisa, só que maior e mais borrada.' },
      { id: 'c', text: 'As duas mostram o mesmo, mudando só o tamanho.', porque: 'O que cabe na tela é decidido pelos pontos, e uma tem mais que a outra.' },
      { id: 'd', text: 'Depende do tipo de painel de cada uma delas.', porque: 'O painel decide a cor e o ângulo de visão. Quanto cabe é a resolução.' },
    ]},
    explanation: 'Tamanho e resolução são dois números diferentes. Aumentar a tela sem aumentar os pontos só deixa a mesma imagem maior.',
  },
  {
    id: 'AP042-F-Q34', type: 'scenario',
    requisitos: ['AP042-6.3'],
    prompt: 'Alguém arrastou o atalho do programa para a lixeira e disse que desinstalou. O que aconteceu de verdade?',
    data: { scenarios: [
      { id: 'a', text: 'O programa continua instalado, e só o atalho sumiu.', correct: true },
      { id: 'b', text: 'O programa foi removido, e a lixeira guarda a cópia dele.', porque: 'A lixeira guardou um apontador de poucos bytes. O programa nunca esteve ali.' },
      { id: 'c', text: 'O programa saiu do menu Iniciar, mas os arquivos ficaram.', porque: 'O menu Iniciar continua com ele. Nada além daquele ícone foi tocado.' },
      { id: 'd', text: 'Nada: a lixeira recusa atalhos de programas instalados.', porque: 'Ela aceita, e é isso que faz o engano parecer que funcionou.' },
    ]},
    explanation: 'Atalho é um apontador, e apagá-lo apaga o apontador. É o engano que mais entope máquina de clube — o programa fica, ocupando disco, sem ninguém achar.',
  },
  {
    id: 'AP042-F-Q35', type: 'multiple_choice',
    requisitos: ['AP042-6.2'],
    prompt: 'Você terminou o relatório e apertou Salvar. Ele virou pdf?',
    data: { options: [
      { id: 'a', text: 'Não: Salvar guarda no formato em que ele já estava.', correct: true },
      { id: 'b', text: 'Sim, porque hoje os editores salvam em pdf por padrão.', porque: 'O padrão continua sendo o formato do próprio editor. Pdf é uma escolha, e ela se faz na hora de salvar.' },
      { id: 'c', text: 'Sim, desde que o arquivo nunca tenha sido salvo antes.', porque: 'A primeira vez pergunta o nome e o lugar, e não troca o formato sozinha.' },
      { id: 'd', text: 'Não, e para virar pdf é preciso um programa à parte.', porque: 'O próprio editor faz: é uma opção de formato em Salvar como, ou em Exportar.' },
    ]},
    explanation: 'Vira pdf quem troca o formato. Apertar Salvar depois de escrever mantém tudo como estava — e é o que faz muita gente jurar que exportou.',
  },
  {
    id: 'AP042-F-Q36', type: 'multiple_choice',
    requisitos: ['AP042-6.4'],
    prompt: 'Na caixa de impressão você marcou duas páginas por folha. O que sai da impressora?',
    data: { options: [
      { id: 'a', text: 'Cada folha com duas páginas do documento, lado a lado.', correct: true },
      { id: 'b', text: 'Somente as duas primeiras páginas do documento.', porque: 'Escolher quais páginas sair é outro campo. Este só muda quantas cabem em cada folha.' },
      { id: 'c', text: 'Duas cópias do documento inteiro, uma após a outra.', porque: 'Quantidade de cópias é outro campo, ao lado do botão de imprimir.' },
      { id: 'd', text: 'O documento impresso dos dois lados de cada folha.', porque: 'Isso é frente e verso, e é uma opção diferente — dá para usar as duas juntas.' },
    ]},
    explanation: 'É o ajuste que mais economiza papel, e o que mais confunde: ele não escolhe páginas nem cópias, só reparte a folha.',
  },
];

/*
  A prova da AP043.

  Trinta e quatro questões, das quais dezesseis são sorteadas. Ela não repete
  os enunciados das lições de propósito: quem só decorou a pergunta da lição
  não reconhece a mesma matéria vestida de outro jeito, e é justamente essa
  diferença que a prova precisa medir.

  As definições do requisito 2 aparecem aqui pela consequência, e não pela
  definição: a lição já perguntou o que é a fonte de alimentação, e a prova
  pergunta qual peça o raio encontra primeiro.

  ── Por que ela era o dobro do tamanho que precisava ─────────────────────
  Eram vinte questões para dezenove requisitos, e o sorteio pedia dezesseis: a
  cobertura consumia quase todas as vagas, e as poucas sobras eram os únicos
  lugares onde duas tentativas podiam diferir. Na prática, quem refizesse a
  prova reencontrava quase a mesma. Catorze questões novas resolvem isso pelo
  lado certo — mais lugares de onde escolher, e não menos matéria cobrada: hoje
  são quase quinhentos conjuntos distintos em quinhentos sorteios.

  Três delas cobrem, de uma vez, o que a prova nunca tinha perguntado: largura
  de coluna, alinhamento na célula e estilo de tabela numa; inserir coluna e o
  intervalo da fórmula noutra; e as quatro perguntas do sistema — memória,
  detalhes do arquivo, print da tela e relógio — na terceira. Questão que mede
  vários requisitos cobre mais gastando uma vaga só, e é por isso que o piso do
  sorteio caiu mesmo com a prova cobrindo mais coisa.
*/
const rawAp043Final: Question[] = [
  {
    id: 'AP043-F-Q1', type: 'multiple_choice',
    requisitos: ['AP043-2.1'],
    prompt: 'Um técnico diz que o computador do clube "não dá para atualizar". Qual peça costuma estar por trás dessa limitação?',
    data: { options: [
      { id: 'a', text: 'A placa mãe, cujos soquetes e fendas decidem o que encaixa.', correct: true },
      { id: 'b', text: 'A fonte de alimentação, que não consegue converter energia para peças novas.', porque: 'Fonte fraca se troca por outra. O que trava a atualização é o que sequer encaixa.' },
      { id: 'c', text: 'O monitor, que precisa ser trocado junto com qualquer peça interna.', porque: 'Monitor é aparelho à parte, e não limita o que entra dentro do gabinete.' },
      { id: 'd', text: 'O sistema operacional, que impede a instalação de peças mais recentes.', porque: 'Sistema não impede encaixe. Ele pode faltar driver, e isso é outro problema.' },
    ]},
    explanation: 'É ela que decide o que cabe: processador novo não entra em soquete antigo.',
  },
  {
    id: 'AP043-F-Q2', type: 'multiple_choice',
    requisitos: ['AP043-2.2'],
    prompt: 'Um computador de escritório mostra imagem no monitor e não tem nenhuma placa de vídeo avulsa dentro dele. O que se conclui?',
    data: { options: [
      { id: 'a', text: 'Que o vídeo dele é integrado à placa mãe ou ao processador.', correct: true },
      { id: 'b', text: 'Que o monitor está gerando a imagem por conta própria.', porque: 'Monitor só mostra o que recebe pronto. Quem calcula a imagem é sempre o computador.' },
      { id: 'c', text: 'Que alguém retirou a placa e o computador ficou incompleto.', porque: 'Sem nada gerando imagem não haveria imagem. Se ela aparece, alguma coisa faz esse trabalho.' },
      { id: 'd', text: 'Que aquele modelo só funciona ligado a uma televisão pela porta HDMI.', porque: 'A porta de vídeo sai da placa mãe e serve monitor e televisão igualmente.' },
    ]},
    explanation: 'Vídeo integrado é o normal. A placa avulsa existe para quem pede mais da imagem.',
  },
  {
    id: 'AP043-F-Q3', type: 'multiple_choice',
    requisitos: ['AP043-2.3', 'AP043-2.4'],
    prompt: 'Você liga o computador na televisão por um cabo VGA e a imagem aparece, mas não sai som nenhum. Qual é a explicação?',
    data: { options: [
      { id: 'a', text: 'A VGA leva só imagem: som pede outro cabo, ou a HDMI.', correct: true },
      { id: 'b', text: 'O cabo VGA está com defeito e precisa ser trocado por outro igual.', porque: 'Um cabo bom faria o mesmo: a VGA não transporta áudio em nenhuma circunstância.' },
      { id: 'c', text: 'A televisão precisa ser configurada para aceitar som vindo do computador.', porque: 'Não há som chegando para ser aceito. Nenhuma configuração cria o que o cabo não leva.' },
      { id: 'd', text: 'A placa de som do computador está desligada e precisa ser ativada.', porque: 'Ela está funcionando: o som sairia normalmente por um fone ou caixa ligados ao computador.' },
    ]},
    explanation: 'Não é defeito de ninguém — é o que essa porta faz desde sempre.',
  },
  {
    id: 'AP043-F-Q4', type: 'true_false',
    requisitos: ['AP043-2.5'],
    prompt: 'A porta USB serve a aparelhos de tipos muito diferentes usando o mesmo formato de conector.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Pen drive, mouse, teclado, impressora e carregador usam a mesma porta — daí o nome universal.' },
    ]},
    explanation: 'Antes dela, cada aparelho tinha uma porta própria. Era esse o problema que ela resolveu.',
  },
  {
    id: 'AP043-F-Q5', type: 'multiple_choice',
    requisitos: ['AP043-2.6'],
    prompt: 'Depois de um raio, o computador não liga mais. Qual peça recebeu o tranco antes de todas as outras?',
    data: { options: [
      { id: 'a', text: 'A fonte de alimentação.', correct: true },
      { id: 'b', text: 'A placa de vídeo, por ser a peça que mais consome energia da máquina.', porque: 'Consumo não decide a ordem. Decide por onde a energia da rua entra — e ela entra pela fonte.' },
      { id: 'c', text: 'O processador, por ser a peça mais cara e mais sensível do computador.', porque: 'Ele recebe energia já convertida. O tranco chega na fonte primeiro.' },
      { id: 'd', text: 'O disco de armazenamento, onde ficam guardados todos os arquivos.', porque: 'O disco também recebe energia já convertida pela fonte.' },
    ]},
    explanation: 'É ela que está na porta de entrada. Estabilizador e nobreak existem para chegar antes dela.',
  },
  {
    id: 'AP043-F-Q6', type: 'multiple_choice',
    requisitos: ['AP043-2.7'],
    prompt: 'Duas pessoas precisam registrar informação no mesmo lugar, ao mesmo tempo, sem que uma apague o trabalho da outra. Que recurso foi feito para isso?',
    data: { options: [
      { id: 'a', text: 'Um banco de dados.', correct: true },
      { id: 'b', text: 'Uma pasta compartilhada na rede, com o arquivo dentro dela.', porque: 'A pasta não coordena nada: cada um salva o arquivo inteiro, e o último salva por cima.' },
      { id: 'c', text: 'Um pen drive passado de uma pessoa para a outra.', porque: 'Isso resolve o revezamento, e não o "ao mesmo tempo" que a pergunta descreve.' },
      { id: 'd', text: 'Uma impressora de rede que registra tudo o que passa por ela.', porque: 'Impressora imprime. Ela não guarda nem organiza informação para consulta.' },
    ]},
    explanation: 'Controlar quem escreve o quê, e em que ordem, é exatamente o que ele existe para fazer.',
  },
  {
    id: 'AP043-F-Q7', type: 'multiple_choice',
    requisitos: ['AP043-3.1'],
    prompt: 'Qual destas situações é a única que conta como backup de verdade?',
    data: { options: [
      { id: 'a', text: 'O trabalho copiado para um pen drive guardado na gaveta.', correct: true },
      { id: 'b', text: 'O trabalho salvo numa segunda pasta dentro do mesmo computador.', porque: 'Se o computador se perde, as duas cópias vão junto. O que protege é estar fora dele.' },
      { id: 'c', text: 'O trabalho salvo duas vezes com nomes diferentes, na mesma pasta.', porque: 'São dois arquivos correndo exatamente o mesmo risco, lado a lado.' },
      { id: 'd', text: 'O trabalho aberto no computador e deixado sem fechar, para não se perder.', porque: 'Arquivo aberto não é cópia nenhuma — e some igual se a máquina desligar.' },
    ]},
    explanation: 'A pergunta que decide: se este computador sumisse agora, a cópia sumiria junto?',
  },
  {
    id: 'AP043-F-Q8', type: 'ordering',
    requisitos: ['AP043-3.1'],
    prompt: 'Ponha as mídias de backup na ordem em que se tornaram comuns, da mais antiga para a mais recente.',
    data: { items: [
      { id: 'i1', text: 'Disquete', order: 1 },
      { id: 'i2', text: 'CD gravável', order: 2 },
      { id: 'i3', text: 'Pen drive', order: 3 },
      { id: 'i4', text: 'Nuvem', order: 4 },
    ]},
    explanation: 'A ideia é a mesma desde o começo: pôr a cópia em outro lugar. O que mudou foi o lugar.',
  },
  {
    id: 'AP043-F-Q9', type: 'true_false',
    requisitos: ['AP043-3.1'],
    prompt: 'A maior vantagem do backup de hoje sobre o de antigamente é poder acontecer sozinho, sem depender de alguém lembrar.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É verdadeiro. Backup dava trabalho e por isso quase ninguém fazia; a cópia automática mudou isso.' },
    ]},
    explanation: 'Quando deixou de pedir memória humana, ele passou a acontecer.',
  },
  {
    id: 'AP043-F-Q10', type: 'multiple_choice',
    requisitos: ['AP043-4.1'],
    prompt: 'Você inseriu uma tabela no documento e agora precisa acrescentar uma coluna. Onde procurar esse comando?',
    data: { options: [
      { id: 'a', text: 'Numa guia que só aparece quando o cursor está dentro da tabela.', correct: true },
      { id: 'b', text: 'No mesmo botão da guia Inserir que criou a tabela.', porque: 'Aquele botão cria tabela nova. Cuidar da existente é papel das guias contextuais.' },
      { id: 'c', text: 'Na guia Layout, junto das margens e da orientação do papel.', porque: 'Ali fica o layout da folha inteira, e não o da tabela.' },
      { id: 'd', text: 'Em lugar nenhum: é preciso refazer a tabela com o tamanho certo.', porque: 'Acrescentar coluna é comando comum, e existe justamente para evitar isso.' },
    ]},
    explanation: 'Guia contextual: aparece com o contexto e some quando o cursor sai.',
  },
  {
    id: 'AP043-F-Q11', type: 'multiple_choice',
    requisitos: ['AP043-4.2'],
    prompt: 'A foto que você inseriu ocupou a linha inteira e empurrou o parágrafo para baixo. Qual ajuste faz o texto contorná-la?',
    data: { options: [
      { id: 'a', text: 'Trocar a quebra de texto para quadrada.', correct: true },
      { id: 'b', text: 'Reduzir a foto até ela caber ao lado do parágrafo.', porque: 'Menor, ela continuaria alinhada com o texto e ocupando a própria linha.' },
      { id: 'c', text: 'Centralizar o parágrafo para ele se ajustar ao redor da imagem.', porque: 'Alinhar move o texto dentro da linha dele; a imagem continua tomando a linha toda.' },
      { id: 'd', text: 'Recortar a foto num programa de imagem antes de inseri-la de novo.', porque: 'O comportamento é da inserção, e não do arquivo: ela entraria igual.' },
    ]},
    explanation: 'Ela entra como se fosse uma letra gigante — a quebra de texto é o que muda isso.',
  },
  {
    id: 'AP043-F-Q12', type: 'true_false',
    requisitos: ['AP043-4.3', 'AP043-4.4'],
    prompt: 'Digitar o número 1 no rodapé produz o mesmo resultado que inserir a numeração de páginas.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'É falso. O rodapé se repete igual: a segunda página também mostraria 1.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Numeração é campo, e campo se recalcula. Número digitado fica onde foi posto.',
  },
  {
    id: 'AP043-F-Q13', type: 'multiple_choice',
    requisitos: ['AP043-5.6'],
    prompt: 'Na planilha do clube, a coluna Total foi preenchida com números digitados à mão. Um desbravador desiste e o número de inscritos cai. O que acontece?',
    data: { options: [
      { id: 'a', text: 'O total continua o mesmo, errado, e nada avisa.', correct: true },
      { id: 'b', text: 'A planilha marca a célula de vermelho, indicando que o valor ficou desatualizado.', porque: 'Ela não tem como saber que o número era um total: para ela é só um número.' },
      { id: 'c', text: 'O total é recalculado, porque a planilha refaz todas as contas ao salvar.', porque: 'Ela refaz fórmulas. Número digitado não é fórmula, e não há conta guardada ali.' },
      { id: 'd', text: 'A planilha pede confirmação antes de aceitar a mudança na coluna de inscritos.', porque: 'Nenhuma confirmação é pedida: mudar um número é a coisa mais comum que se faz numa planilha.' },
    ]},
    explanation: 'É a pior espécie de erro: continua parecendo certo. A fórmula é o que evita isso.',
  },
  {
    id: 'AP043-F-Q14', type: 'multiple_choice',
    requisitos: ['AP043-5.6'],
    prompt: 'O que a escrita B3:B7 significa dentro de uma fórmula?',
    data: { options: [
      { id: 'a', text: 'Todas as células de B3 até B7.', correct: true },
      { id: 'b', text: 'As duas células B3 e B7, e nenhuma outra.', porque: 'Para somar só duas, escreve-se =B3+B7. Dois pontos querem dizer "até".' },
      { id: 'c', text: 'A célula B3 dividida pelo valor guardado em B7.', porque: 'Divisão se escreve com barra. Os dois pontos formam intervalo.' },
      { id: 'd', text: 'A coluna B inteira, da primeira à última linha da planilha.', porque: 'Os números limitam: só entra o que está entre as linhas 3 e 7.' },
    ]},
    explanation: 'É o intervalo. Sem ele seria preciso escrever célula por célula.',
  },
  {
    id: 'AP043-F-Q15', type: 'multiple_choice',
    requisitos: ['AP043-5.3'],
    prompt: 'Você mesclou quatro células que tinham texto em todas elas. Depois desfez a mesclagem. O que encontra?',
    data: { options: [
      { id: 'a', text: 'As quatro células de volta, com só o primeiro texto preenchido.', correct: true },
      { id: 'b', text: 'As quatro células com os textos originais de cada uma.', porque: 'O que foi apagado na mesclagem não volta ao desfazer: só a primeira sobreviveu.' },
      { id: 'c', text: 'Uma única célula, porque desfazer mesclagem não é possível.', porque: 'É possível, e é comando próprio. O que não volta é o conteúdo descartado.' },
      { id: 'd', text: 'As quatro células todas vazias, porque a mesclagem apagou tudo.', porque: 'A primeira sempre sobrevive — é justamente a única que a mesclagem mantém.' },
    ]},
    explanation: 'O aviso que aparece antes de mesclar é a única chance de voltar atrás.',
  },
  {
    id: 'AP043-F-Q16', type: 'multiple_choice',
    requisitos: ['AP043-6.1'],
    prompt: 'Você mandou um documento para a secretaria do clube e ele chegou com a formatação toda embaralhada. Qual é a causa mais provável?',
    data: { options: [
      { id: 'a', text: 'O programa de lá é de uma versão mais antiga que a sua.', correct: true },
      { id: 'b', text: 'O arquivo se corrompeu durante o envio pelo e-mail.', porque: 'Arquivo corrompido normalmente não abre, em vez de abrir desarrumado.' },
      { id: 'c', text: 'O computador de lá tem menos memória do que o seu.', porque: 'Memória afeta velocidade, e não como o documento é interpretado.' },
      { id: 'd', text: 'A impressora de lá não é compatível com o tipo de papel do documento.', porque: 'A formatação já sai errada na tela, antes de qualquer impressão.' },
    ]},
    explanation: 'Programa novo abre arquivo velho; o caminho inverso é o que costuma falhar. Em pdf, o problema não existe.',
  },
  {
    id: 'AP043-F-Q17', type: 'matching',
    requisitos: ['AP043-7.1'],
    prompt: 'Ligue cada tipo de rede ao alcance que ele cobre.',
    data: { pairs: [
      { left: 'PAN', right: 'Alguns metros, em volta de uma pessoa' },
      { left: 'LAN', right: 'Um prédio ou uma casa' },
      { left: 'MAN', right: 'Uma cidade' },
      { left: 'WAN', right: 'Cidades, estados e países' },
    ]},
    explanation: 'Todas as siglas dizem a mesma coisa: o tamanho da área. A internet é a maior WAN.',
  },
  {
    id: 'AP043-F-Q18', type: 'multiple_choice',
    requisitos: ['AP043-7.1'],
    prompt: 'Num escritório com rede a cabo, qual aparelho recebe o cabo de cada máquina e encaminha o que chega para o destino certo?',
    data: { options: [
      { id: 'a', text: 'O switch.', correct: true },
      { id: 'b', text: 'O servidor, que centraliza tudo o que passa pela rede.', porque: 'Servidor guarda arquivos e responde pedidos. Quem encaminha o tráfego é outro aparelho.' },
      { id: 'c', text: 'O roteador sem fio, que distribui o sinal pelos andares.', porque: 'Ele cuida da parte sem fio. Na rede a cabo, quem faz esse papel é outro.' },
      { id: 'd', text: 'A fonte de alimentação de cada computador.', porque: 'Ela cuida de energia, e não de informação: não sabe nada sobre a rede.' },
    ]},
    explanation: 'Todo cabo chega nele, e é ele que sabe para onde mandar cada coisa.',
  },
  {
    id: 'AP043-F-Q19', type: 'multiple_choice',
    requisitos: ['AP043-8.1'],
    prompt: 'Alguém pergunta quanta memória o computador do clube tem. Onde está essa resposta?',
    data: { options: [
      { id: 'a', text: 'Em Configurações, na página Sistema › Sobre.', correct: true },
      { id: 'b', text: 'No Explorador, na tela que mostra o espaço livre dos discos.', porque: 'Ali aparece armazenamento. Memória e processador não estão nessa tela.' },
      { id: 'c', text: 'Nas propriedades de qualquer arquivo guardado na máquina.', porque: 'Propriedades falam do arquivo — tamanho, local, datas —, e não das peças do computador.' },
      { id: 'd', text: 'Na Ferramenta de Captura, junto das informações do sistema.', porque: 'Ela serve para capturar a tela, e não informa nada sobre a máquina.' },
    ]},
    explanation: 'É a tela que responde "esse computador aguenta?" — e ela não fica no Explorador.',
  },
  {
    id: 'AP043-F-Q20', type: 'multiple_choice',
    requisitos: ['AP043-8.3'],
    prompt: 'Você arrasta um documento da pasta compartilhada do clube para a área de trabalho. Qual é a consequência?',
    data: { options: [
      { id: 'a', text: 'O documento sai da pasta e some para quem a usa.', correct: true },
      { id: 'b', text: 'Um atalho é criado, e o documento permanece na pasta.', porque: 'Atalho vem de Enviar para › Área de Trabalho (criar atalho). Arrastar não cria atalho.' },
      { id: 'c', text: 'Uma cópia é feita, ficando um documento em cada lugar.', porque: 'Copiar acontece entre discos diferentes. Dentro do mesmo disco, arrastar move.' },
      { id: 'd', text: 'Nada muda, porque a área de trabalho recusa documentos de outras pastas.', porque: 'Ela aceita qualquer arquivo — e é por isso que o engano passa despercebido.' },
    ]},
    explanation: 'Numa pasta compartilhada, mover é fazer o documento sumir para todo mundo.',
  },
  {
    id: 'AP043-F-Q21', type: 'matching',
    requisitos: ['AP043-5.1', 'AP043-5.2', 'AP043-5.3', 'AP043-5.5'],
    prompt: 'Ligue cada acabamento da planilha ao que ele resolve.',
    data: { pairs: [
      { left: 'Largura da coluna', right: 'O texto que aparecia cortado passa a caber' },
      { left: 'Alinhamento na célula', right: 'O conteúdo se posiciona no lado e na altura escolhidos' },
      { left: 'Mesclar células', right: 'Várias viram uma, para o título ficar por cima de todas' },
      { left: 'Estilo de tabela pronto', right: 'Cores e bordas de uma vez, sem formatar célula por célula' },
    ]},
    explanation: 'Acabamento se faz depois que os números estão certos — formatar antes é enfeitar uma conta que ainda vai mudar.',
  },
  {
    id: 'AP043-F-Q22', type: 'scenario',
    requisitos: ['AP043-5.4', 'AP043-5.6'],
    prompt: 'A célula B9 da sua planilha soma B3:B7. Você insere uma coluna nova à esquerda de B, e os dados que estavam ali passam para C. O que acontece com a fórmula?',
    data: { scenarios: [
      { id: 'a', text: 'Ela se ajusta sozinha e continua somando as mesmas células.', correct: true },
      { id: 'b', text: 'Ela continua escrita B3:B7, e passa a somar a coluna nova.', porque: 'O programa acompanha o deslocamento: quem foi empurrado leva a fórmula junto, e o intervalo é reescrito.' },
      { id: 'c', text: 'Ela quebra, e a célula passa a mostrar um aviso de erro.', porque: 'Inserir coluna não quebra fórmula nenhuma. Erro apareceria se as células somadas fossem apagadas.' },
      { id: 'd', text: 'Ela some, e é preciso escrevê-la de novo do zero.', porque: 'A fórmula continua onde estava. O que muda é o endereço a que ela se refere.' },
    ]},
    explanation: 'A fórmula guarda a conta, e não o resultado — e o endereço dentro dela acompanha as células quando elas mudam de lugar.',
  },
  {
    id: 'AP043-F-Q23', type: 'matching',
    requisitos: ['AP043-8.1', 'AP043-8.2', 'AP043-8.4', 'AP043-8.5'],
    prompt: 'Ligue cada pergunta ao lugar onde o Windows guarda a resposta.',
    data: { pairs: [
      { left: 'Quanta memória a máquina tem', right: 'Configurações, em Sistema e depois Sobre' },
      { left: 'O tamanho exato do arquivo em bytes', right: 'Propriedades, pelo botão direito no próprio arquivo' },
      { left: 'A hora do computador está errada', right: 'Configurações, em Hora e idioma' },
      { left: 'Capturar o que está aparecendo na tela', right: 'A tecla Print Screen, ou a Ferramenta de Captura' },
    ]},
    explanation: 'São lugares diferentes para perguntas parecidas: o que é da máquina, o que é do arquivo, o que é do relógio e o que é da tela. E capturar não é salvar — a imagem fica na memória até alguém colá-la em algum lugar.',
  },
  {
    id: 'AP043-F-Q24', type: 'scenario',
    requisitos: ['AP043-2.1', 'AP043-6.1'],
    prompt: 'Você comprou um pente de memória e ele não entra na fenda da placa, por mais que empurre. O que isso indica?',
    data: { scenarios: [
      { id: 'a', text: 'Que o pente é de um tipo que aquela placa mãe não aceita.', correct: true },
      { id: 'b', text: 'Que a fenda está suja e precisa de uma limpeza antes.', porque: 'Sujeira atrapalha o contato, e não o encaixe. Pente do tipo certo entra mesmo numa fenda empoeirada.' },
      { id: 'c', text: 'Que falta instalar o driver do pente antes de encaixá-lo.', porque: 'Memória não tem driver, e nenhum programa muda o formato de um encaixe.' },
      { id: 'd', text: 'Que o pente veio queimado, e por isso não entra.', porque: 'Peça queimada encaixa igual. Ela só deixa de funcionar depois de a máquina ser ligada.' },
    ]},
    explanation: 'Compatibilidade tem dois lados, e o primeiro é o encaixe físico. Quem decide o que cabe na máquina é a placa mãe, e nenhuma força resolve um soquete que não é aquele.',
  },
  {
    id: 'AP043-F-Q25', type: 'multiple_choice',
    requisitos: ['AP043-2.2'],
    prompt: 'Para que serve a placa de vídeo dedicada, aquela grande e com ventoinhas?',
    data: { options: [
      { id: 'a', text: 'Para quem pede mais da imagem: jogo pesado, edição, três dimensões.', correct: true },
      { id: 'b', text: 'Para que o computador consiga mostrar qualquer imagem no monitor.', porque: 'A integrada já faz isso, e é o que a maioria das máquinas de hoje tem.' },
      { id: 'c', text: 'Para ligar mais de um monitor, coisa que a integrada não permite.', porque: 'Muitas integradas ligam dois monitores. O que a dedicada dá é potência, e não quantidade de saídas.' },
      { id: 'd', text: 'Para substituir a placa mãe nos computadores mais antigos.', porque: 'Nada substitui a placa mãe: é nela que a própria placa de vídeo se encaixa.' },
    ]},
    explanation: 'Abrir um computador comum e não achar placa de vídeo não é falta de peça: é sinal de que aquela máquina não precisava de uma.',
  },
  {
    id: 'AP043-F-Q26', type: 'multiple_choice',
    requisitos: ['AP043-2.3'],
    prompt: 'As entradas redondas coloridas, a verde do fone e a rosa do microfone, são de que peça?',
    data: { options: [
      { id: 'a', text: 'Da placa de som.', correct: true },
      { id: 'b', text: 'Da placa mãe, já que hoje o som costuma vir integrado nela.', porque: 'Integrada é onde ela mora, e não o que ela é: a função continua sendo da placa de som.' },
      { id: 'c', text: 'Da placa de vídeo, que leva imagem e som para a tela.', porque: 'Quando a imagem leva som junto, é pela HDMI. Entrada redonda de fone é outra coisa.' },
      { id: 'd', text: 'Da fonte de alimentação, que é onde ficam os conectores.', porque: 'A fonte só lida com energia. Nada do que se ouve passa por ela.' },
    ]},
    explanation: 'Integrada ou separada, a função não muda: quem transforma o sinal do computador em som é a placa de som.',
  },
  {
    id: 'AP043-F-Q27', type: 'fill_blank',
    requisitos: ['AP043-2.4'],
    prompt: 'Complete as lacunas sobre as duas portas que levam a imagem até a tela.',
    data: {
      blanks: [
        { id: 'b1', answer: 'VGA', hint: 'Conector azul e trapezoidal, com dois parafusinhos — leva só imagem' },
        { id: 'b2', answer: 'HDMI', hint: 'Conector chato e sem parafuso — leva imagem e som pelo mesmo cabo' },
      ],
    },
    explanation: 'A diferença entre as duas é a idade, e é ela que explica o som: a VGA é analógica e nunca carregou áudio.',
  },
  {
    id: 'AP043-F-Q28', type: 'multiple_choice',
    requisitos: ['AP043-2.5'],
    prompt: 'Por que um celular carrega quando está ligado ao computador por um cabo USB?',
    data: { options: [
      { id: 'a', text: 'Porque a USB leva energia junto com a informação.', correct: true },
      { id: 'b', text: 'Porque o computador reconhece o celular e então libera a corrente.', porque: 'A energia sai da porta reconhecendo ou não o aparelho: um ventilador de USB gira sem ser reconhecido por nada.' },
      { id: 'c', text: 'Porque o cabo do celular tem uma bateria pequena por dentro.', porque: 'O cabo apenas conduz. Quem fornece a energia é a porta do computador.' },
      { id: 'd', text: 'Porque isso é coisa da USB-C, e as outras USB não fazem.', porque: 'Toda USB leva energia. A USB-C leva mais, e é essa a diferença entre elas.' },
    ]},
    explanation: 'Trocar informação e levar energia ao mesmo tempo é o que faz a USB servir ao pen drive, ao mouse e ao carregador com um formato só.',
  },
  {
    id: 'AP043-F-Q29', type: 'fill_blank',
    requisitos: ['AP043-2.6'],
    prompt: 'Complete: a tomada da parede entrega corrente _____, e a fonte a converte em corrente _____, de baixa voltagem.',
    data: {
      blanks: [
        { id: 'b1', answer: 'alternada', aceitas: ['alternada (AC)', 'AC'], hint: 'O tipo de corrente que vem da rua, em 127 ou 220 volts' },
        { id: 'b2', answer: 'contínua', aceitas: ['continua', 'contínua (DC)', 'DC'], hint: 'O tipo que as peças usam, em 12, 5 e 3,3 volts' },
      ],
    },
    explanation: 'Nenhuma peça do computador aguenta a voltagem da tomada. A fonte é a tradutora entre as duas, e a única peça que toca a energia da rua.',
  },
  {
    id: 'AP043-F-Q30', type: 'true_false',
    requisitos: ['AP043-2.7'],
    prompt: 'Uma planilha guardada numa pasta compartilhada já é um banco de dados.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', porque: 'Ela é um arquivo: quem abre primeiro trava, e duas pessoas escrevendo ao mesmo tempo uma apaga a outra. O banco de dados existe justamente para isso não acontecer.' },
      { id: 'b', text: 'Falso', correct: true },
    ]},
    explanation: 'Compartilhar o arquivo resolve onde ele fica. Escrever ao mesmo tempo, sem uma pessoa atropelar a outra, é outro problema — e é o que o banco de dados resolve.',
  },
  {
    id: 'AP043-F-Q31', type: 'scenario',
    requisitos: ['AP043-4.1'],
    prompt: 'Você vai pôr a escala dos sábados no relatório, em linhas e colunas. Por onde se começa?',
    data: { scenarios: [
      { id: 'a', text: 'Pela guia Inserir, onde nasce tudo o que não é parágrafo.', correct: true },
      { id: 'b', text: 'Pela guia Layout da Tabela, que reúne os comandos de tabela.', porque: 'Ela só aparece depois que a tabela existe, e só com o cursor dentro dela.' },
      { id: 'c', text: 'Digitando os dados e alinhando as colunas com a tecla Tab.', porque: 'Isso desalinha no primeiro texto mais comprido. Linha e coluna de verdade pedem uma tabela.' },
      { id: 'd', text: 'Pela guia Página Inicial, onde ficam os comandos de formatar.', porque: 'Ali se muda a aparência do que já existe. Acrescentar uma peça nova é sempre em Inserir.' },
    ]},
    explanation: 'Tabela, imagem, cabeçalho e número de página são peças que não são parágrafo, e todas moram na mesma guia.',
  },
  {
    id: 'AP043-F-Q32', type: 'true_false',
    requisitos: ['AP043-4.2'],
    prompt: 'Ao ser inserida, a foto entra alinhada com o texto, como se fosse uma letra gigante.',
    data: { options: [
      { id: 'a', text: 'Verdadeiro', correct: true },
      { id: 'b', text: 'Falso', porque: 'É o padrão, e não defeito: por isso ela empurra o parágrafo para baixo até alguém trocar a quebra de texto.' },
    ]},
    explanation: 'O programa a trata como um caractere do parágrafo. Fazer o texto contornar a foto é escolher outra quebra de texto.',
  },
  {
    id: 'AP043-F-Q33', type: 'multiple_choice',
    requisitos: ['AP043-4.3', 'AP043-4.4'],
    prompt: 'Você escreveu o nome do clube no cabeçalho da primeira página do relatório. Em quantas páginas ele vai aparecer?',
    data: { options: [
      { id: 'a', text: 'Em todas, sem ninguém repetir nada.', correct: true },
      { id: 'b', text: 'Só na primeira, que é onde ele chegou a ser digitado.', porque: 'O cabeçalho não pertence à página: pertence ao documento, e é por isso que se repete.' },
      { id: 'c', text: 'Em todas, desde que o documento tenha numeração de páginas.', porque: 'Uma coisa não depende da outra: cabeçalho e numeração se inserem separados.' },
      { id: 'd', text: 'Em nenhuma, enquanto o documento não for impresso.', porque: 'Ele aparece na tela também, na área própria, no alto de cada página.' },
    ]},
    explanation: 'Escrever uma vez e valer para o documento inteiro é o que o cabeçalho e o rodapé oferecem — e a numeração se apoia nisso, contando as páginas sozinha.',
  },
  {
    id: 'AP043-F-Q34', type: 'multiple_choice',
    requisitos: ['AP043-8.3'],
    prompt: 'Na área de trabalho, como se reconhece que um ícone é atalho, e não o arquivo em si?',
    data: { options: [
      { id: 'a', text: 'Pela setinha no canto inferior esquerdo do ícone.', correct: true },
      { id: 'b', text: 'Pelo nome, que sempre termina com a palavra Atalho.', porque: 'O sistema sugere esse nome, e qualquer pessoa pode renomear. A setinha continua lá.' },
      { id: 'c', text: 'Pelo tamanho: o ícone de atalho é menor que os outros.', porque: 'O tamanho é o mesmo. O que muda é a setinha desenhada por cima dele.' },
      { id: 'd', text: 'Não dá para saber sem abrir as propriedades do ícone.', porque: 'Dá, e é para isso que a setinha existe: para se reconhecer de longe.' },
    ]},
    explanation: 'Apagar um atalho não apaga o arquivo. Confundir os dois é o que faz alguém achar que perdeu o trabalho — ou que não perdeu, quando perdeu.',
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
  AP043: rawAp043Final,
};

/*
  Quantas questões cada prova final sorteia do reservatório dela.

  Fora daqui, a prova pergunta tudo o que está escrito — que é o que ela sempre
  fez. Entra uma linha aqui quando a prova ganha as extras, e a partir daí duas
  pessoas deixam de ver a mesma prova.
*/
const PERGUNTAS_POR_PROVA: Record<string, number | undefined> = {
  AP034: 21,   /* de 25 */
  AP035: 18,   /* de 22 */
  AP041: 23,   /* de 27 */
  AP042: 15,   /* de 18 */
  AP043: 16,   /* de 20 */
};

/*
  A margem já foi pequena por precaução, e não é mais.

  Enquanto nenhuma questão dizia que requisito media, sortear pouco era abrir
  buraco às cegas: alguns requisitos têm uma questão só, e a prova podia sair
  sem tocar neles. A defesa possível era deixar pouco de fora.

  Agora cada questão declara os seus em `requisitos`, e `sortearCobrindo` monta
  primeiro o conjunto que cobre tudo, depois completa ao acaso. O piso deixou
  de ser um palpite e passou a ser um número: `minimoParaCobrir` diz quantas
  questões a prova precisa perguntar, e `qualidade.test.ts` reprova quem
  sortear menos que isso.

  Os números abaixo continuam onde estavam, com a folga que cada um tem sobre
  esse piso — AP034 6, AP035 8, AP041 5, AP042 2, AP043 nenhuma. Encolhê-los é
  decisão de quem cuida da trilha, e não consequência automática desta
  mudança: menos questões é cada acerto valendo mais, e o limiar de 75% mede
  outra coisa numa prova de doze e numa de vinte e uma.

  A AP043 é o caso a olhar primeiro: ela tem vinte questões para dezenove
  requisitos, então as dezesseis que ela sorteia já estão todas comprometidas
  com a cobertura, e duas tentativas só diferem onde há mais de uma questão
  para o mesmo requisito. Quem quiser variedade ali escreve questão nova, e
  não mexe neste número.
*/

export function getFinalExamQuestions(specialtyCode: string): Question[] {
  return sortearCobrindo(PROVAS[specialtyCode] ?? [], PERGUNTAS_POR_PROVA[specialtyCode]);
}

/*
  O reservatório inteiro, sem sorteio — para os testes, e só para eles.

  `qualidade.test.ts` procura enunciado repetido e resposta certa repetida
  dentro da mesma prova. Lendo pelo sorteio, ele passaria a examinar um
  subconjunto diferente a cada execução: duas questões iguais escapariam
  enquanto o sorteio não trouxesse as duas juntas, e a build ficaria vermelha
  num dia qualquer, sem ninguém ter mexido em nada. Trava que reprova por sorte
  não é trava.
*/
export function todasAsQuestoesDaProva(specialtyCode: string): Question[] {
  return PROVAS[specialtyCode] ?? [];
}

/** Quantas questões a prova sorteia — o reservatório inteiro, quando não há linha. */
export function quantasAProvaPergunta(specialtyCode: string): number {
  return quantasPerguntar(PROVAS[specialtyCode] ?? [], PERGUNTAS_POR_PROVA[specialtyCode]);
}
