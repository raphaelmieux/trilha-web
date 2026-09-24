import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES007 Comunicação e Agenda.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de telas que parecem certas: a mensagem que chegou
 * a cinquenta pessoas com cinquenta endereços à mostra, o convite que ficou
 * "aguardando" para sempre num endereço errado, a resposta automática que
 * responde em março, a grade de horários com um espaço em branco que não quer
 * dizer livre.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * Cópia e cópia oculta. Lista de distribuição e privacidade. Arquivar e
 * excluir. A data da viagem e o prazo da resposta. Cancelar uma ocorrência e
 * cancelar a série. Compartilhar a tela e compartilhar uma janela. Cada par
 * tem uma questão que obriga a separá-los, porque confundi-los é o que custa
 * caro depois — e nenhum deles dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 */

export const QUESTOES_DA_COMUNICACAO: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — Cópia oculta (requisitos 2.1 e 3)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES7-M1-Q1', type: 'multiple_choice',
      prompt: 'O que a cópia oculta faz que a cópia comum não faz?',
      data: { options: [
        { id: 'a', text: 'Esconde os endereços de quem está nela.', correct: true },
        { id: 'b', text: 'Manda a mensagem depois dos outros.', porque: 'A entrega é a mesma e na mesma hora. O que muda é o que aparece escrito na mensagem.' },
        { id: 'c', text: 'Impede que a pessoa responda.', porque: 'Quem está em cópia oculta responde normalmente — e se responder a todos, entrega que estava ali.' },
        { id: 'd', text: 'Guarda a mensagem sem enviar.', porque: 'Isso é o rascunho. A cópia oculta envia como qualquer outra.' },
      ]},
      explanation: 'Quem recebe em Cco vê a mensagem e não vê a lista. Quem está no Para e no Cc vê todo mundo que está nos dois.',
    },
    {
      id: 'ES7-M1-Q2', type: 'multiple_choice',
      prompt: 'Você mandou um aviso para cinquenta famílias no campo Cc. O que cada família recebeu junto?',
      data: { options: [
        { id: 'a', text: 'O endereço das outras quarenta e nove.', correct: true },
        { id: 'b', text: 'Só a mensagem, porque o Cc não aparece.', porque: 'O Cc aparece inteiro para todo mundo. O campo que não aparece é o Cco.' },
        { id: 'd', text: 'Um aviso de que a lista é grande.', porque: 'Nenhum correio avisa nada. A mensagem sai igualzinha a uma mandada para uma pessoa só.' },
        { id: 'c', text: 'O nome das famílias, sem os endereços.', porque: 'O endereço vai inteiro, e é ele que identifica a pessoa e serve para escrever a ela.' },
      ]},
      explanation: 'São cinquenta pessoas com uma lista de endereços que ninguém autorizou a passar adiante — e não há como desfazer.',
    },
    {
      id: 'ES7-M1-Q3', type: 'multiple_choice',
      prompt: 'Por que pôr os quatro da direção em cópia oculta seria errado?',
      data: { options: [
        { id: 'a', text: 'Eles precisam responder uns aos outros.', correct: true },
        { id: 'b', text: 'Porque o Cco só funciona com listas grandes.', porque: 'O Cco funciona com qualquer número. O que decide é quem deve ver quem, e não quantos são.' },
        { id: 'c', text: 'Porque a mensagem chegaria na caixa de spam.', porque: 'A cópia oculta não muda para onde a mensagem vai. Ela muda o que aparece escrito.' },
        { id: 'd', text: 'Porque eles não receberiam a mensagem.', porque: 'Quem está em cópia oculta recebe normalmente. O que ele não faz é aparecer.' },
      ]},
      explanation: 'Cco protege quem não devia aparecer. Entre quem trabalha junto, ele esconde a conversa: ninguém alcança quem não aparece.',
    },
    {
      id: 'ES7-M1-Q4', type: 'true_false',
      prompt: 'Uma mensagem com uma pessoa no Cco e cinquenta no Para está protegendo os endereços.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O campo estar preenchido não quer dizer nada. As cinquenta do Para se veem todas.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O que se mede não é se o campo foi usado: é quantos endereços cada pessoa consegue ler quando abre a mensagem.',
    },
    {
      id: 'ES7-M1-Q5', type: 'multiple_choice',
      prompt: 'Qual destas é a razão certa para pôr alguém no Cc, e não no Para?',
      data: { options: [
        { id: 'a', text: 'Ela só precisa ficar sabendo.', correct: true },
        { id: 'b', text: 'Ela é a pessoa mais importante da lista.', porque: 'Os campos não marcam hierarquia. Eles marcam quem age e quem acompanha.' },
        { id: 'c', text: 'O endereço dela não pode aparecer.', porque: 'Isso é o Cco. O Cc aparece para todo mundo, como o Para.' },
        { id: 'd', text: 'A mensagem é longa demais para ela.', porque: 'Todo mundo recebe a mensagem inteira, esteja em que campo estiver.' },
      ]},
      explanation: 'Para é de quem precisa fazer alguma coisa. Cc é de quem acompanha. A diferença poupa o tempo de quem lê.',
    },
    {
      id: 'ES7-M1-Q6', type: 'multiple_choice',
      prompt: 'Alguém em cópia oculta clicou em Responder a todos. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Todo mundo descobre que ele estava lá.', correct: true },
        { id: 'b', text: 'A resposta volta só para quem enviou.', porque: 'Responder a todos vai para todos os visíveis. Quem responde assim se revela.' },
        { id: 'c', text: 'O correio bloqueia a resposta.', porque: 'Nada é bloqueado. O correio manda, e é aí que a surpresa acontece.' },
        { id: 'd', text: 'A resposta chega sem remetente.', porque: 'Toda mensagem leva quem a escreveu. É o endereço dele que vai denunciar a presença.' },
      ]},
      explanation: 'É a única maneira de a cópia oculta virar pública, e ela acontece bastante — por isso Cco não serve para esconder gente de uma conversa.',
    },
    {
      id: 'ES7-M1-Q7', type: 'multiple_choice',
      prompt: 'Chegou uma mensagem de outro clube com trinta e quatro secretarias no Cc. O que você já perdeu?',
      data: { options: [
        { id: 'a', text: 'Seu endereço foi para trinta e três estranhos.', correct: true },
        { id: 'b', text: 'Nada, porque você não mandou a mensagem.', porque: 'O estrago não é de quem manda: é de quem está na lista. E você está.' },
        { id: 'c', text: 'Nada, porque o campo Cc é público por sua própria natureza.', porque: 'Ser visível é o que o Cc faz; usá-lo com uma lista de desconhecidos é a falha de privacidade.' },
        { id: 'd', text: 'O direito de responder à mensagem.', porque: 'Responder continua funcionando. O que se perdeu foi o controle sobre o próprio endereço.' },
      ]},
      explanation: 'Ninguém fez por mal, e é exatamente por isso que o requisito manda explicar: quem escolhe o campo decide pela privacidade de todo mundo na lista.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — A mensagem que se entende (requisitos 2.2, 2.3 e 4.1)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES7-M2-Q1', type: 'multiple_choice',
      prompt: 'Para que serve o assunto de uma mensagem?',
      data: { options: [
        { id: 'a', text: 'Dizer do que ela trata, hoje e em seis meses.', correct: true },
        { id: 'b', text: 'Resumir em uma linha a mensagem inteira que vem abaixo.', porque: 'Resumo é outra coisa. O assunto identifica: ele precisa distinguir esta mensagem das outras mil.' },
        { id: 'c', text: 'Avisar o quanto ela é urgente.', porque: 'Urgência se diz no texto, com um prazo. Assunto escrito "Urgente" não diz do que se trata.' },
        { id: 'd', text: 'Escolher em que pasta ela vai cair.', porque: 'Quem escolhe a pasta é quem recebe, ou uma regra que ele criou. O assunto não organiza nada sozinho.' },
      ]},
      explanation: 'Quem vai procurar por esta mensagem em dezembro vai digitar uma palavra. O assunto existe para que essa palavra esteja nele.',
    },
    {
      id: 'ES7-M2-Q2', type: 'multiple_choice',
      prompt: 'Num clube que se reúne toda semana, por que "Reunião" é um assunto ruim?',
      data: { options: [
        { id: 'a', text: 'Ele não distingue esta mensagem das outras.', correct: true },
        { id: 'b', text: 'Ele é curto demais para o correio aceitar.', porque: 'Qualquer correio aceita um assunto de uma palavra, e até nenhum.' },
        { id: 'c', text: 'Ele soa informal para quem recebe.', porque: 'O problema não é o tom. É que daqui a um ano há quarenta mensagens com esse mesmo assunto.' },
        { id: 'd', text: 'Ele faz a mensagem cair no spam.', porque: 'Assunto genérico não manda mensagem para o spam. Ele só a torna impossível de achar.' },
      ]},
      explanation: 'Um assunto informativo é o que a pessoa vai procurar depois. Quarenta mensagens escritas "Reunião" são quarenta mensagens perdidas.',
    },
    {
      id: 'ES7-M2-Q3', type: 'multiple_choice',
      prompt: 'Qual destas frases é um pedido?',
      data: { options: [
        { id: 'a', text: 'Peço que me confirmem o número até quarta.', correct: true },
        { id: 'b', text: 'Seria bom se alguém pudesse confirmar o número.', porque: 'Não há quem nem quando. Todo mundo lê, e todo mundo entende que é com outra pessoa.' },
        { id: 'c', text: 'Estamos precisando do número dos inscritos.', porque: 'Isso informa uma necessidade. Ninguém foi encarregado de nada e nenhuma data foi dada.' },
        { id: 'd', text: 'O número dos inscritos ainda não chegou.', porque: 'Isso é um relato. Ele descreve o problema sem pedir a solução a ninguém.' },
      ]},
      explanation: 'Um pedido diz quem faz e até quando. Sem as duas coisas ele é uma frase simpática que ninguém atende hoje.',
    },
    {
      id: 'ES7-M2-Q4', type: 'multiple_choice',
      prompt: 'A mensagem diz que a saída é dia 3 de julho e pede o número dos inscritos. Ela tem prazo?',
      data: { options: [
        { id: 'a', text: 'Não: a data da viagem não é a data da resposta.', correct: true },
        { id: 'b', text: 'Tem: o dia 3 serve de prazo.', porque: 'O dia 3 é quando o ônibus sai. Quem responder no dia 2 respondeu tarde demais para fechar a reserva.' },
        { id: 'c', text: 'Tem, porque toda mensagem com data tem prazo.', porque: 'Data e prazo são coisas diferentes. Uma diz quando o fato acontece, a outra quando a resposta é esperada.' },
        { id: 'd', text: 'Não, porque nenhuma data foi escrita.', porque: 'Uma data foi escrita. O problema é que ela responde a outra pergunta.' },
      ]},
      explanation: 'É o erro mais comum de quem escreve com pressa: citar a data do evento e achar que pediu resposta para ela.',
    },
    {
      id: 'ES7-M2-Q5', type: 'multiple_choice',
      prompt: 'O que uma assinatura de mensagem precisa dizer?',
      data: { options: [
        { id: 'a', text: 'Quem é você e como falar com você.', correct: true },
        { id: 'b', text: 'Um versículo e uma saudação.', porque: 'Pode ter, e não é isso que ela existe para fazer. Quem recebe precisa saber a quem está respondendo.' },
        { id: 'c', text: 'O assunto da mensagem, repetido.', porque: 'O assunto já está no alto. A assinatura responde a outra pergunta: quem está falando.' },
        { id: 'd', text: 'A data em que a mensagem foi escrita.', porque: 'A data o correio já carimba sozinho, e com hora.' },
      ]},
      explanation: 'Nome e função no clube. "Marina" assina; "Marina Duarte, secretaria do clube" diz com que autoridade o pedido foi feito.',
    },
    {
      id: 'ES7-M2-Q6', type: 'ordering',
      prompt: 'Ordene as partes de uma mensagem formal, do começo ao fim.',
      data: { items: [
        { id: 'a', text: 'Assunto que diz do que se trata', order: 1 },
        { id: 'b', text: 'Saudação a quem vai ler', order: 2 },
        { id: 'c', text: 'O pedido, com o prazo junto', order: 3 },
        { id: 'd', text: 'Assinatura com nome e função', order: 4 },
      ]},
      explanation: 'A ordem não é capricho: quem lê decide se abre pelo assunto, e decide se responde pelo pedido.',
    },
    {
      id: 'ES7-M2-Q7', type: 'multiple_choice',
      prompt: 'Você reescreveu a mensagem e ela ficou ótima — mas a data da saída sumiu. O que aconteceu?',
      data: { options: [
        { id: 'a', text: 'A data sumiu da única mensagem que a tinha.', correct: true },
        { id: 'b', text: 'Nada: quem quiser saber a data pode perguntar.', porque: 'Quinze pessoas perguntando a mesma coisa na véspera é o que a mensagem existia para evitar.' },
        { id: 'c', text: 'Nada: a data está no calendário.', porque: 'Se estiver, ótimo. A mensagem foi escrita justamente para quem não abre o calendário.' },
        { id: 'd', text: 'A mensagem ficou mais clara sem ela.', porque: 'Ficou mais curta. Clareza é dizer o necessário, e a data da saída é necessária.' },
      ]},
      explanation: 'Arrumar a forma não pode custar o conteúdo. É o mesmo cuidado de consertar a formatação de um documento sem alterar uma palavra do texto.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — O arquivo pesado (requisito 4.2)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES7-M3-Q1', type: 'multiple_choice',
      prompt: 'Por que um provedor recusa anexos acima de um certo tamanho?',
      data: { options: [
        { id: 'a', text: 'O anexo é copiado na caixa de cada um.', correct: true },
        { id: 'b', text: 'Porque arquivos grandes costumam ter vírus.', porque: 'Tamanho não diz nada sobre conteúdo. Um arquivo de 2 KB pode ser perigoso e um de 200 MB não.' },
        { id: 'c', text: 'Porque a internet não aguenta o tráfego.', porque: 'A rede aguenta bem mais do que isso. O que pesa é a multiplicação por destinatário na caixa de cada um.' },
        { id: 'd', text: 'Porque o formato zip não é permitido.', porque: 'Zip é permitido. O limite é de tamanho, e vale para qualquer formato.' },
      ]},
      explanation: 'Mandar 180 MB para quarenta pessoas são 7,2 GB guardados, e não 180 MB. O limite existe por isso.',
    },
    {
      id: 'ES7-M3-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre mandar o anexo e mandar o vínculo?',
      data: { options: [
        { id: 'a', text: 'O anexo vira um arquivo novo; o vínculo aponta para o seu.', correct: true },
        { id: 'b', text: 'O vínculo só funciona para quem tem conta no mesmo serviço.', porque: 'Depende do acesso que você der. Um vínculo aberto funciona para qualquer pessoa.' },
        { id: 'c', text: 'O anexo chega mais rápido.', porque: 'O vínculo chega mais rápido, porque a mensagem fica leve. O anexo é que leva o peso junto.' },
        { id: 'd', text: 'O vínculo expira depois de sete dias.', porque: 'Nenhum dos dois expira sozinho. Quem decide até quando o vínculo vale é quem o criou.' },
      ]},
      explanation: 'Com o vínculo continua existindo um arquivo só. Corrigir o original corrige o que todo mundo abre.',
    },
    {
      id: 'ES7-M3-Q3', type: 'multiple_choice',
      prompt: 'Você mandou o vínculo e ninguém conseguiu abrir. O que provavelmente aconteceu?',
      data: { options: [
        { id: 'a', text: 'O arquivo continua restrito a você.', correct: true },
        { id: 'b', text: 'O vínculo foi copiado errado.', porque: 'Acontece, e o sintoma é outro: página não encontrada, e não um pedido de acesso.' },
        { id: 'c', text: 'O correio bloqueou o endereço do vínculo.', porque: 'Correio não bloqueia vínculo de arquivo. Ele entrega o texto como qualquer outro.' },
        { id: 'd', text: 'O arquivo é pesado demais para abrir.', porque: 'Peso atrapalha o download, não a permissão. A tela que aparece é a de pedir acesso.' },
      ]},
      explanation: 'É a metade que ninguém conta: quem clica cai em "solicitar acesso", e o pedido espera numa caixa que você não lê. O anexo grande pelo menos volta com erro.',
    },
    {
      id: 'ES7-M3-Q4', type: 'true_false',
      prompt: 'Mandar o vínculo em vez do anexo é sempre a escolha certa.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O anexo é melhor quando o documento está pronto e não muda mais: a ficha assinada, o recibo, o PDF do ano passado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O vínculo serve ao que ainda vai mudar e ao que é pesado. O anexo serve ao que está fechado e precisa chegar inteiro, para sempre.',
    },
    {
      id: 'ES7-M3-Q5', type: 'multiple_choice',
      prompt: 'Você manda por anexo a circular com a data errada para sessenta famílias. O que custa consertar?',
      data: { options: [
        { id: 'a', text: 'Sessenta cópias erradas, já entregues.', correct: true },
        { id: 'b', text: 'Nada: basta corrigir o arquivo original.', porque: 'O original não alcança o que já saiu. Cada família tem a cópia de quando você mandou.' },
        { id: 'c', text: 'Só reenviar para quem reclamar.', porque: 'Quem não reclamar continua com a data errada, e é esse o problema: ninguém sabe que está errada.' },
        { id: 'd', text: 'Pedir ao provedor para cancelar o envio.', porque: 'O que saiu não volta. Cancelar envio só funciona nos primeiros segundos, e só no seu correio.' },
      ]},
      explanation: 'Com o vínculo, corrigir o original corrige o que as sessenta abrem. É a diferença entre um conserto e sessenta.',
    },
    {
      id: 'ES7-M3-Q6', type: 'multiple_choice',
      prompt: 'O que você precisa conferir depois de inserir um vínculo numa mensagem?',
      data: { options: [
        { id: 'a', text: 'Quem consegue abri-lo.', correct: true },
        { id: 'b', text: 'Se o arquivo cabe no limite de anexo.', porque: 'Vínculo não ocupa espaço na mensagem. O limite de anexo não vale para ele.' },
        { id: 'c', text: 'Se o destinatário usa o mesmo programa.', porque: 'O vínculo abre no navegador. Não é preciso ter programa nenhum instalado.' },
        { id: 'd', text: 'Se o assunto cita o nome do arquivo.', porque: 'Ajuda a achar depois, e não é o que decide se a pessoa consegue ver o arquivo.' },
      ]},
      explanation: 'O vínculo nasce restrito na maioria dos serviços. Mandar sem abrir o acesso é mandar uma porta trancada.',
    },
    {
      id: 'ES7-M3-Q7', type: 'multiple_choice',
      prompt: 'Como se justifica, a quem recebe, ter mandado o vínculo?',
      data: { options: [
        { id: 'a', text: 'Dizendo o tamanho e onde o arquivo mora.', correct: true },
        { id: 'b', text: 'Pedindo desculpas pelo incômodo.', porque: 'Não há incômodo a desculpar. O vínculo é mais leve para quem recebe do que o anexo.' },
        { id: 'c', text: 'Não é preciso justificar nada.', porque: 'Quem espera um anexo e recebe um endereço estranha. Uma linha resolve.' },
        { id: 'd', text: 'Reenviando o anexo depois, por garantia.', porque: 'Isso traz de volta todo o peso e ainda cria uma segunda cópia para divergir da primeira.' },
      ]},
      explanation: 'Uma linha basta: são 180 MB de fotos, estão na pasta do clube, e o vínculo abre para qualquer um que o tenha.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — A caixa que se usa (requisito 4.3)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES7-M4-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre arquivar e excluir?',
      data: { options: [
        { id: 'a', text: 'O arquivado continua aparecendo na busca.', correct: true },
        { id: 'b', text: 'O arquivado volta para a entrada depois de um mês.', porque: 'Ele fica onde está até alguém mexer. O que volta sozinho é quando chega uma resposta.' },
        { id: 'c', text: 'O excluído fica guardado para sempre na lixeira.', porque: 'A lixeira esvazia sozinha, normalmente em trinta dias. Depois disso não há mais nada.' },
        { id: 'd', text: 'Os dois fazem a mesma coisa com nomes diferentes.', porque: 'A busca separa os dois: ela lê o arquivado e não lê a lixeira.' },
      ]},
      explanation: 'É essa assimetria que torna arquivar seguro e excluir não. Quem não sabe disso nunca tira nada da entrada.',
    },
    {
      id: 'ES7-M4-Q2', type: 'multiple_choice',
      prompt: 'O que deve ficar na caixa de entrada?',
      data: { options: [
        { id: 'a', text: 'O que ainda espera alguma coisa de você.', correct: true },
        { id: 'b', text: 'O que chegou nos últimos sete dias.', porque: 'Idade não diz nada sobre pendência. Uma mensagem de ontem pode estar resolvida e uma de março, não.' },
        { id: 'c', text: 'O que você ainda não leu.', porque: 'Ler não resolve. E há muita coisa lida que continua esperando providência sua.' },
        { id: 'd', text: 'O que veio de pessoas importantes.', porque: 'Quem escreveu não decide se há trabalho a fazer. O que a mensagem pede é que decide.' },
      ]},
      explanation: 'A caixa de entrada é uma lista de pendências. Tudo o que não é pendência atrapalha quem procura as que são.',
    },
    {
      id: 'ES7-M4-Q3', type: 'multiple_choice',
      prompt: 'Você arquivou todas as mensagens de uma vez e a entrada ficou limpa. O que deu errado?',
      data: { options: [
        { id: 'a', text: 'O que precisava de você saiu junto.', correct: true },
        { id: 'b', text: 'Nada: entrada vazia é o objetivo.', porque: 'O objetivo é a entrada só com pendências. Vazia por atacado, ela para de dizer qualquer coisa.' },
        { id: 'c', text: 'As mensagens foram perdidas.', porque: 'Arquivar não perde nada. O problema é outro: você deixou de ver o que tinha de fazer.' },
        { id: 'd', text: 'O correio vai reclamar do arquivamento em massa.', porque: 'Nenhum correio reclama. Ele faz o que foi mandado, calado.' },
      ]},
      explanation: 'Arrumar é decidir uma a uma. Esvaziar de uma vez é a versão rápida de não ter arrumado nada.',
    },
    {
      id: 'ES7-M4-Q4', type: 'true_false',
      prompt: 'Marcar uma mensagem como lida é o mesmo que tê-la resolvido.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ler é saber o que a mensagem pede. Resolver é fazer o que ela pede, e as duas coisas acontecem em momentos diferentes.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A caixa de quem confunde as duas fica cheia de mensagens lidas que ninguém atendeu, e todas parecem tratadas.',
    },
    {
      id: 'ES7-M4-Q5', type: 'multiple_choice',
      prompt: 'Por que excluir para limpar a caixa é um mau hábito?',
      data: { options: [
        { id: 'a', text: 'A busca deixa de achar o que foi excluído.', correct: true },
        { id: 'b', text: 'Porque excluir não libera espaço nenhum na conta.', porque: 'Excluir libera espaço. O problema não é o espaço, é o que você não vai conseguir achar em novembro.' },
        { id: 'c', text: 'Porque quem mandou é avisado.', porque: 'Ninguém é avisado do que você faz com a mensagem depois de recebê-la.' },
        { id: 'd', text: 'Porque a lixeira nunca esvazia.', porque: 'Ela esvazia sozinha, e é justamente aí que o recibo que você ia precisar some de vez.' },
      ]},
      explanation: 'Arquivar custa o mesmo clique e não fecha nenhuma porta. Excluir é para o que você tem certeza de que nunca mais vai procurar.',
    },
    {
      id: 'ES7-M4-Q6', type: 'multiple_choice',
      prompt: 'Uma mensagem diz apenas "Recebi, obrigada!". Onde ela vai?',
      data: { options: [
        { id: 'a', text: 'Para as arquivadas.', correct: true },
        { id: 'b', text: 'Fica na entrada, porque toda mensagem merece resposta.', porque: 'Responder "de nada" é uma interrupção a mais na caixa de quem agradeceu.' },
        { id: 'c', text: 'Para a lixeira, porque não diz nada.', porque: 'Ela diz uma coisa útil: a lista chegou. Vale guardar, e guardar é arquivar.' },
        { id: 'd', text: 'Para uma pasta de agradecimentos.', porque: 'Pasta por tipo de sentimento não ajuda a achar nada. A busca acha melhor do que qualquer pasta.' },
      ]},
      explanation: 'Ela confirma um fato e não pede nada. É o caso exemplar do que sai da entrada e continua guardado.',
    },
    {
      id: 'ES7-M4-Q7', type: 'multiple_choice',
      prompt: 'Como você acha, em dezembro, a confirmação do salão que arquivou em junho?',
      data: { options: [
        { id: 'a', text: 'Procurando por uma palavra que esteja nela.', correct: true },
        { id: 'b', text: 'Abrindo as arquivadas e rolando até junho.', porque: 'Funciona e leva muito mais tempo. A busca existe para isso, e é o que torna arquivar seguro.' },
        { id: 'c', text: 'Pedindo à igreja que reenvie.', porque: 'A mensagem está com você. Pedir de novo é o que se faz quando não se confia na própria caixa.' },
        { id: 'd', text: 'Não acha: arquivar tira da conta.', porque: 'Arquivar tira só da entrada. A mensagem continua na conta e continua na busca.' },
      ]},
      explanation: 'Isso é o que separa arquivar de excluir, e é a razão de não ter medo de tirar coisas da entrada.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — A lista da unidade (requisitos 2.4 e 4.4)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES7-M5-Q1', type: 'multiple_choice',
      prompt: 'O que é uma lista de distribuição?',
      data: { options: [
        { id: 'a', text: 'Um apelido para um conjunto de endereços.', correct: true },
        { id: 'b', text: 'Uma pasta onde as mensagens do grupo ficam.', porque: 'Pasta guarda o que chegou. A lista serve para enviar, e não para arquivar.' },
        { id: 'c', text: 'Um endereço que esconde quem está dentro.', porque: 'Na entrega ela abre nos endereços de todo mundo. Quem esconde é o Cco.' },
        { id: 'd', text: 'Um grupo de conversa como os do celular.', porque: 'Grupo de conversa tem lugar próprio e histórico. A lista é só um atalho de digitação.' },
      ]},
      explanation: 'Escrever o endereço da lista num campo é escrever os endereços de todos os membros naquele campo.',
    },
    {
      id: 'ES7-M5-Q2', type: 'multiple_choice',
      prompt: 'Por que uma lista no campo Para não protege os endereços?',
      data: { options: [
        { id: 'a', text: 'Na entrega ela abre nos endereços de todo mundo.', correct: true },
        { id: 'b', text: 'Porque listas são públicas no servidor.', porque: 'A lista pode ser sua e de mais ninguém. O que a entrega abre é o conteúdo dela naquela mensagem.' },
        { id: 'c', text: 'Porque o nome da lista aparece no assunto.', porque: 'O nome não aparece no assunto. O que aparece, no campo, é a lista de endereços já aberta.' },
        { id: 'd', text: 'Ela protege os endereços: é para isso que listas existem.', porque: 'Listas existem para poupar digitação e esquecimento. Privacidade é outro campo: o Cco.' },
      ]},
      explanation: 'As duas encurtam a digitação, e por isso se confundem. Só uma delas esconde alguém.',
    },
    {
      id: 'ES7-M5-Q3', type: 'multiple_choice',
      prompt: 'Alguém saiu do clube e continua na lista da unidade. O que acontece?',
      data: { options: [
        { id: 'a', text: 'Ele recebe a conversa interna da unidade.', correct: true },
        { id: 'b', text: 'As mensagens para ele voltam com erro de entrega.', porque: 'O endereço dele continua existindo. Nada volta, e é isso que faz o problema durar.' },
        { id: 'c', text: 'O correio tira o endereço sozinho.', porque: 'Nenhum correio sabe quem saiu do clube. Só quem cuida da lista sabe.' },
        { id: 'd', text: 'Nada, porque ele não vai abrir.', porque: 'Abrir ou não é escolha dele. O que saiu do seu lado foi a conversa da unidade, para fora dela.' },
      ]},
      explanation: 'Uma lista que ninguém revisa manda escala, endereço e telefone de criança para quem não está mais no clube.',
    },
    {
      id: 'ES7-M5-Q4', type: 'multiple_choice',
      prompt: 'Alguém entrou na unidade e não foi posto na lista. Como isso aparece?',
      data: { options: [
        { id: 'a', text: 'Não aparece: ele simplesmente não recebe.', correct: true },
        { id: 'b', text: 'Ele recebe uma cópia atrasada.', porque: 'Quem não está na lista não recebe nada, nem atrasado.' },
        { id: 'c', text: 'O conselheiro é avisado da falta.', porque: 'A lista não sabe quem devia estar nela. Só quem cuida dela sabe.' },
        { id: 'd', text: 'A mensagem volta com erro de entrega.', porque: 'Não há erro: a mensagem foi entregue a todos os que estavam na lista.' },
      ]},
      explanation: 'Esquecer de tirar e esquecer de pôr são erros diferentes, e nenhum dos dois avisa. Por isso se confere os dois.',
    },
    {
      id: 'ES7-M5-Q5', type: 'true_false',
      prompt: 'Uma lista de distribuição é o lugar certo para mandar uma mensagem às cinquenta famílias.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Ela poupa a digitação e entrega tudo — inclusive o endereço de cada família para as outras quarenta e nove.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Para as famílias, o campo é o Cco. A lista serve quando quem está dentro se conhece e vai conversar entre si — como uma unidade.',
    },
    {
      id: 'ES7-M5-Q6', type: 'multiple_choice',
      prompt: 'Qual é a vantagem de mandar pela lista da unidade em vez de digitar os cinco endereços?',
      data: { options: [
        { id: 'a', text: 'Ninguém é esquecido nem digitado errado.', correct: true },
        { id: 'b', text: 'A mensagem chega mais rápido.', porque: 'A entrega é igual. O que muda é o que você escreve e o que pode errar escrevendo.' },
        { id: 'c', text: 'Os endereços ficam escondidos.', porque: 'Eles aparecem, porque a lista abre na entrega. Quem esconde é o Cco.' },
        { id: 'd', text: 'A unidade recebe em um grupo separado.', porque: 'Cada pessoa recebe na caixa dela, como qualquer mensagem. A lista não cria lugar nenhum.' },
      ]},
      explanation: 'Um endereço errado é uma pessoa sem a escala. Uma lista revisada resolve isso uma vez, e não a cada mensagem.',
    },
    {
      id: 'ES7-M5-Q7', type: 'multiple_choice',
      prompt: 'Quando uma lista de distribuição precisa ser revisada?',
      data: { options: [
        { id: 'a', text: 'Toda vez que alguém entra ou sai.', correct: true },
        { id: 'b', text: 'Quando alguém reclamar de não receber.', porque: 'Quem não recebe costuma não saber que devia. A reclamação chega meses depois, se chegar.' },
        { id: 'c', text: 'No fim do ano, junto com a prestação de contas.', porque: 'Uma vez por ano deixa onze meses de mensagens indo para o lugar errado.' },
        { id: 'd', text: 'Nunca: o correio cuida disso.', porque: 'O correio não sabe quem está na unidade. Quem sabe é quem cuida dela.' },
      ]},
      explanation: 'A lista não avisa quando envelhece. Ela continua entregando, certinha, para as pessoas de antes.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Quando você não está (requisito 4.5)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES7-M6-Q1', type: 'multiple_choice',
      prompt: 'Para que serve uma resposta automática de ausência?',
      data: { options: [
        { id: 'a', text: 'Avisar quem escreveu que não haverá resposta.', correct: true },
        { id: 'b', text: 'Guardar as mensagens na caixa até você voltar.', porque: 'As mensagens chegam normalmente. A resposta só avisa; ela não segura nada.' },
        { id: 'c', text: 'Impedir que mensagens novas cheguem.', porque: 'Nada é impedido. A caixa recebe tudo, e você lê quando voltar.' },
        { id: 'd', text: 'Encaminhar as mensagens a outra pessoa.', porque: 'Encaminhamento é outro recurso. A resposta automática só responde.' },
      ]},
      explanation: 'Quem escreve e não recebe nada fica esperando. A resposta automática existe para essa pessoa, e não para você.',
    },
    {
      id: 'ES7-M6-Q2', type: 'multiple_choice',
      prompt: 'O que falta numa resposta automática que diz apenas "Estou fora até dia 25"?',
      data: { options: [
        { id: 'a', text: 'A quem recorrer enquanto isso.', correct: true },
        { id: 'b', text: 'A data exata em que você saiu de férias.', porque: 'Quem escreveu quer saber quando será atendido, e não quando você viajou.' },
        { id: 'c', text: 'Um pedido de desculpas.', porque: 'Desculpa não resolve o problema de quem precisa de uma resposta hoje.' },
        { id: 'd', text: 'O motivo da ausência.', porque: 'O motivo é seu. E contar demais é justamente o outro erro desta lição.' },
      ]},
      explanation: 'Sem um nome e um endereço, ela informa que não vai haver resposta e nada mais. Quem escreveu continua parado.',
    },
    {
      id: 'ES7-M6-Q3', type: 'multiple_choice',
      prompt: 'Por que não escrever "estou viajando com a família de 10 a 25" na resposta automática?',
      data: { options: [
        { id: 'a', text: 'Ela responde a qualquer pessoa que escrever.', correct: true },
        { id: 'b', text: 'Porque é informação demais para uma mensagem curta.', porque: 'O problema não é o tamanho. É que essa frase diz que a casa está vazia, e diz a desconhecidos.' },
        { id: 'c', text: 'Porque o correio pode marcar como spam.', porque: 'Nada é marcado como spam por isso. O risco é de outra natureza.' },
        { id: 'd', text: 'Porque ninguém precisa saber de férias.', porque: 'Não é sobre privacidade de férias. É sobre dizer, a quem quer que escreva, que não há ninguém em casa.' },
      ]},
      explanation: 'É a única mensagem que você escreve para todo mundo, inclusive para quem escreveu no escuro. "Estou fora da secretaria" basta.',
    },
    {
      id: 'ES7-M6-Q4', type: 'multiple_choice',
      prompt: 'O que acontece com uma resposta automática sem data de fim?',
      data: { options: [
        { id: 'a', text: 'Ela responde depois que você voltou.', correct: true },
        { id: 'b', text: 'Ela se desliga sozinha em trinta dias.', porque: 'Nada se desliga sozinho. Ela vai até alguém desligá-la.' },
        { id: 'c', text: 'Ela nunca chega a ser ligada.', porque: 'Ela liga e funciona. O problema é que não para.' },
        { id: 'd', text: 'O correio pede a data antes de salvar.', porque: 'A maioria aceita sem fim, e é justamente por isso que o erro é tão comum.' },
      ]},
      explanation: 'Em março ela ainda diz que você está de férias, e quem escreve conclui que a secretaria do clube parou de funcionar.',
    },
    {
      id: 'ES7-M6-Q5', type: 'multiple_choice',
      prompt: 'Por que responder só a quem está nos contatos?',
      data: { options: [
        { id: 'a', text: 'Responder confirma que o endereço existe e é lido.', correct: true },
        { id: 'b', text: 'Para economizar mensagens enviadas.', porque: 'Não há limite que isso economize. A razão é o que a resposta conta a quem não devia saber.' },
        { id: 'c', text: 'Porque desconhecidos não merecem resposta.', porque: 'Não é sobre merecimento. Quem escreveu no escuro não estava esperando resposta — estava testando.' },
        { id: 'd', text: 'Porque o correio cobra por resposta automática.', porque: 'Nenhum correio cobra por isso.' },
      ]},
      explanation: 'Quem atira endereços no escuro quer saber quais respondem. A resposta automática responde a semana inteira, sozinha.',
    },
    {
      id: 'ES7-M6-Q6', type: 'true_false',
      prompt: 'A resposta automática manda uma mensagem para cada mensagem que chega.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Os correios respondem uma vez por pessoa, e não uma por mensagem — senão duas respostas automáticas conversariam para sempre.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Uma por remetente, normalmente por alguns dias. É o que impede duas caixas de férias de ficarem se respondendo até o fim do mês.',
    },
    {
      id: 'ES7-M6-Q7', type: 'multiple_choice',
      prompt: 'Qual destes textos serve bem como resposta de ausência do clube?',
      data: { options: [
        { id: 'a', text: 'Estou fora da secretaria até 25/07. Para o acampamento, fale com tesouraria@clubepioneiros.org.br.', correct: true },
        { id: 'b', text: 'Estou de férias com a família em Porto Seguro até o dia 25/07. Volto a responder as mensagens depois disso.', porque: 'Ela conta que a casa está vazia, e não diz a quem recorrer. Erra nas duas pontas.' },
        { id: 'c', text: 'Não estou disponível no momento. Retorno em breve, assim que possível.', porque: 'Não diz até quando nem com quem falar. Quem escreveu fica sabendo tanto quanto antes.' },
        { id: 'd', text: 'Retornarei assim que possível. Obrigada desde já pela compreensão de todos.', porque: 'Educada e vazia: sem data e sem encaminhamento, ela não muda nada para quem precisa de resposta.' },
      ]},
      explanation: 'Diz até quando, diz com quem falar, e não conta nada sobre a sua casa. É tudo o que ela precisa fazer.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — O evento que as pessoas acham (requisitos 2.5 e 5.1)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES7-M7-Q1', type: 'multiple_choice',
      prompt: 'O que é um fuso horário?',
      data: { options: [
        { id: 'a', text: 'A faixa que acerta o relógio do mesmo jeito.', correct: true },
        { id: 'b', text: 'A diferença de horas entre dois países vizinhos.', porque: 'A diferença é o resultado de comparar dois fusos. O fuso em si é a regra de cada lugar.' },
        { id: 'c', text: 'O horário de verão de uma região.', porque: 'O horário de verão é um ajuste temporário dentro de um fuso, e nem todo fuso tem.' },
        { id: 'd', text: 'A hora que o computador mostra na tela.', porque: 'A tela mostra a hora do fuso configurado. Trocar o fuso troca a hora mostrada, e não o instante.' },
      ]},
      explanation: 'Um evento não tem "um horário": tem um instante, e cada pessoa lê esse instante no relógio dela.',
    },
    {
      id: 'ES7-M7-Q2', type: 'multiple_choice',
      prompt: 'Você combinou 15h com alguém em Rio Branco e criou o evento no fuso de Brasília. O que ele vê?',
      data: { options: [
        { id: 'a', text: '13h na agenda dele.', correct: true },
        { id: 'b', text: '15h, porque a agenda converte sozinha.', porque: 'Ela converte — e converte o instante que você gravou, que não é o que vocês combinaram.' },
        { id: 'c', text: '17h na agenda dele.', porque: 'Rio Branco está atrás de Brasília, e não à frente. Ele vê menos, e não mais.' },
        { id: 'd', text: 'Um aviso de que o fuso está errado.', porque: 'Nenhuma agenda avisa. As duas concordam, e as duas mostram horas diferentes.' },
      ]},
      explanation: 'Nada estoura: as duas agendas estão certas, os dois convites estão certos, e ele entra duas horas antes de a reunião existir.',
    },
    {
      id: 'ES7-M7-Q3', type: 'multiple_choice',
      prompt: 'Escrever "15h, horário do Acre" na descrição do evento resolve?',
      data: { options: [
        { id: 'a', text: 'Não: a agenda continua mostrando o horário errado.', correct: true },
        { id: 'b', text: 'Resolve: quem lê a descrição entende.', porque: 'Quem lê a descrição entende. Quem só olha o horário no calendário, que é quase todo mundo, não.' },
        { id: 'c', text: 'Resolve: a agenda lê a descrição e corrige.', porque: 'Nenhuma agenda lê a descrição. O fuso é um campo, e só ele muda o horário.' },
        { id: 'd', text: 'Não, porque a descrição não aparece no convite.', porque: 'Ela aparece. O problema é outro: ela discorda do horário que está ao lado.' },
      ]},
      explanation: 'A descrição fica certa, o campo fica errado, e quem lê confia no calendário — que é o que o calendário existe para ser.',
    },
    {
      id: 'ES7-M7-Q4', type: 'multiple_choice',
      prompt: 'O que um evento sem local provoca?',
      data: { options: [
        { id: 'a', text: 'Metade do clube num lugar e metade em outro.', correct: true },
        { id: 'b', text: 'Um erro na hora de salvar.', porque: 'Nenhuma agenda exige local. O evento salva, aparece e parece completo.' },
        { id: 'c', text: 'O evento não aparece na agenda dos convidados.', porque: 'Ele aparece inteiro, com título e hora. É o que faz ninguém desconfiar.' },
        { id: 'd', text: 'Um aviso aos convidados.', porque: 'Ninguém é avisado. As pessoas descobrem na hora, por telefone.' },
      ]},
      explanation: 'O evento fica bonito e incompleto. Quem já sabe onde é não repara na falta, e quem não sabe descobre às sete da noite.',
    },
    {
      id: 'ES7-M7-Q5', type: 'multiple_choice',
      prompt: 'O que vale a pena escrever na descrição de um evento do clube?',
      data: { options: [
        { id: 'a', text: 'O que levar e o que vai acontecer.', correct: true },
        { id: 'b', text: 'O horário, repetido por segurança.', porque: 'O horário já é um campo. Repeti-lo cria duas fontes que podem discordar quando o evento mudar.' },
        { id: 'c', text: 'O nome de todos os convidados.', porque: 'A lista de convidados é um campo próprio, e ela se atualiza sozinha quando alguém entra ou sai.' },
        { id: 'd', text: 'Nada: a descrição é opcional.', porque: 'É opcional e é o que responde às perguntas que chegariam uma a uma na véspera.' },
      ]},
      explanation: 'Mochila, cantil, autorização assinada. A descrição é onde cabe o que o título não comporta e o clube precisa saber.',
    },
    {
      id: 'ES7-M7-Q6', type: 'true_false',
      prompt: 'Escrever o deslocamento do fuso à mão, como menos três, é tão seguro quanto escolher o fuso pelo nome.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O deslocamento muda quando um país adota ou abandona o horário de verão, e o nome do fuso acompanha essa mudança sozinho.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'O Brasil acabou com o horário de verão em 2019, e propostas de trazê-lo de volta aparecem. Um menos três escrito à mão erraria calado quatro meses por ano.',
    },
    {
      id: 'ES7-M7-Q7', type: 'multiple_choice',
      prompt: 'O que um convite de calendário faz que uma mensagem com a data não faz?',
      data: { options: [
        { id: 'a', text: 'Ele entra na agenda de quem recebe.', correct: true },
        { id: 'b', text: 'Ele garante que a pessoa vai.', porque: 'Ninguém é obrigado a nada. O convite pede resposta, e a resposta pode ser não.' },
        { id: 'c', text: 'Ele avisa por mensagem também.', porque: 'Alguns avisam e outros não, e isso é configuração de cada pessoa. O que o convite faz sempre é entrar na agenda.' },
        { id: 'd', text: 'Ele impede que a pessoa marque outra coisa na hora.', porque: 'Ela pode marcar o que quiser. O que a agenda faz é mostrar o choque, se ele existir.' },
      ]},
      explanation: 'Uma mensagem com a data pede que a pessoa copie para a agenda dela. O convite já está lá, com local, horário e um lugar para responder.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O convite e a resposta (requisitos 2.6 e 5.2)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES7-M8-Q1', type: 'multiple_choice',
      prompt: 'Na lista de convidados, o que "aguardando" quer dizer?',
      data: { options: [
        { id: 'a', text: 'Que não veio resposta, por qualquer motivo.', correct: true },
        { id: 'b', text: 'Que a pessoa vai, mas não confirmou.', porque: 'Não há como saber. Ler "aguardando" como sim é o erro que esvazia reuniões.' },
        { id: 'c', text: 'Que o convite ainda não foi enviado.', porque: 'Ele foi enviado no instante em que o evento foi salvo. O que falta é a resposta.' },
        { id: 'd', text: 'Que a pessoa recusou sem escrever nada.', porque: 'Recusar é um botão e aparece como não. Aguardando é a ausência de qualquer clique.' },
      ]},
      explanation: 'A mesma palavra cobre quem não viu, quem viu e não decidiu, e quem nunca recebeu. É por isso que o requisito diz acompanhar.',
    },
    {
      id: 'ES7-M8-Q2', type: 'multiple_choice',
      prompt: 'Um convite foi mandado para um endereço com uma letra errada. Como isso aparece?',
      data: { options: [
        { id: 'a', text: 'Como "aguardando", igual a quem não decidiu.', correct: true },
        { id: 'b', text: 'Como um erro de entrega, escrito em vermelho.', porque: 'Às vezes volta um aviso, e ele chega na sua caixa — não na lista de convidados, que continua dizendo aguardando.' },
        { id: 'c', text: 'O convidado some da lista.', porque: 'Ele fica na lista com o endereço errado, que é o que faz ninguém reparar.' },
        { id: 'd', text: 'A agenda corrige o endereço sozinha.', porque: 'Nenhuma agenda adivinha o endereço certo. Ela manda para o que foi escrito.' },
      ]},
      explanation: 'É o caso que parece o mais comum de todos e é o único que nunca vai mudar sozinho. Quem acompanha olha os endereços, letra por letra.',
    },
    {
      id: 'ES7-M8-Q3', type: 'multiple_choice',
      prompt: 'Reenviar o convite para o mesmo endereço errado resolve?',
      data: { options: [
        { id: 'a', text: 'Não: ele vai para o mesmo lugar nenhum.', correct: true },
        { id: 'b', text: 'Resolve: o segundo envio costuma passar.', porque: 'Não é questão de sorte. O endereço não existe, e não vai existir na segunda tentativa.' },
        { id: 'c', text: 'Resolve, porque a agenda tenta outros endereços.', porque: 'Ela não tenta nada. Manda para o que está escrito, e pronto.' },
        { id: 'd', text: 'Não, porque reenviar não é permitido.', porque: 'É permitido. O problema é que não adianta.' },
      ]},
      explanation: 'O conserto é trocar o endereço. Depois disso ele volta a aparecer como aguardando — agora porque de fato ainda não respondeu.',
    },
    {
      id: 'ES7-M8-Q4', type: 'multiple_choice',
      prompt: 'Dois convidados continuam sem responder na véspera. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Escrever a eles perguntando.', correct: true },
        { id: 'b', text: 'Contar com a presença dos dois.', porque: 'É o que a maioria faz, e é por isso que reuniões começam com metade das cadeiras vazias.' },
        { id: 'c', text: 'Tirar os dois da lista de convidados.', porque: 'Tirar quem não respondeu é decidir por ele que não vem. E ele deixa de receber qualquer mudança.' },
        { id: 'd', text: 'Reenviar o convite pela terceira vez.', porque: 'Quem não respondeu ao primeiro costuma não responder ao terceiro. Uma pergunta direta funciona melhor.' },
      ]},
      explanation: 'Ninguém deixa de responder por mal: convite é fácil de fechar sem clicar. Uma linha perguntando resolve o que três convites não resolvem.',
    },
    {
      id: 'ES7-M8-Q5', type: 'multiple_choice',
      prompt: 'Você mudou o horário de um evento com dez convidados. O que acontece com eles?',
      data: { options: [
        { id: 'a', text: 'A agenda de cada um muda, e eles são avisados.', correct: true },
        { id: 'b', text: 'Nada: eles ficam com o horário antigo.', porque: 'Quem aceitou o convite tem o evento ligado ao seu. Mudar o seu muda o deles.' },
        { id: 'c', text: 'O evento é apagado da agenda deles.', porque: 'Mudar não apaga. Só uma exclusão apaga, e ela também avisa.' },
        { id: 'd', text: 'Eles precisam abrir e aceitar o convite de novo.', porque: 'A resposta anterior continua valendo. Muitos calendários pedem reconfirmação, e mesmo assim o horário já mudou.' },
      ]},
      explanation: 'É a vantagem do convite sobre a mensagem com a data: um conserto alcança dez agendas. Quem copiou para um papel continua com o horário de antes.',
    },
    {
      id: 'ES7-M8-Q6', type: 'true_false',
      prompt: 'Quem respondeu "talvez" a um convite está contado entre os presentes.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Talvez é uma resposta própria, e existe justamente para não ser lida nem como sim nem como não.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Quem marcou talvez avisou que não sabe. Contar como sim é a mesma leitura otimista que transforma "aguardando" em presença garantida.',
    },
    {
      id: 'ES7-M8-Q7', type: 'matching',
      prompt: 'Ligue cada resposta ao que ela diz a quem organizou.',
      data: { pairs: [
        { left: 'Sim', right: 'Ela vai, e contou com a data' },
        { left: 'Não', right: 'Ela não vai, e já decidiu' },
        { left: 'Talvez', right: 'Ela viu e ainda não sabe' },
        { left: 'Aguardando', right: 'Não veio clique nenhum, por qualquer motivo' },
      ]},
      explanation: 'Três delas são decisões. A quarta é a ausência de decisão — e é a única que pode esconder um convite que nunca chegou.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — O que se repete (requisito 5.3)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES7-M9-Q1', type: 'multiple_choice',
      prompt: 'O que um evento recorrente poupa?',
      data: { options: [
        { id: 'a', text: 'Criar o mesmo evento quarenta vezes.', correct: true },
        { id: 'b', text: 'Convidar as mesmas pessoas toda semana.', porque: 'A lista de convidados viaja junto em qualquer evento, recorrente ou não.' },
        { id: 'c', text: 'Escolher o local de novo a cada mês.', porque: 'O local é um campo do evento, e ele já se repete com ele. O que a recorrência poupa é o evento inteiro.' },
        { id: 'd', text: 'Avisar quando a reunião muda.', porque: 'O aviso sai de qualquer alteração. A recorrência não tem nada a ver com isso.' },
      ]},
      explanation: 'Uma reunião semanal são cinquenta e duas por ano. A recorrência é o que faz caber em um evento.',
    },
    {
      id: 'ES7-M9-Q2', type: 'multiple_choice',
      prompt: 'O que acontece com uma série sem data de fim?',
      data: { options: [
        { id: 'a', text: 'Ela se repete indefinidamente.', correct: true },
        { id: 'b', text: 'Ela para no fim do ano corrente.', porque: 'Nada para no fim do ano. A agenda simplesmente continua desenhando a reunião.' },
        { id: 'c', text: 'Ela se repete cinquenta vezes e para.', porque: 'Não há limite de repetições. Sem fim declarado, não há onde parar.' },
        { id: 'd', text: 'A agenda pede a data antes de salvar.', porque: 'A maioria oferece "para sempre" e aceita. É por isso que tanta gente tem reuniões marcadas em 2075.' },
      ]},
      explanation: 'Um fim declarado é uma linha, e é o que obriga alguém a olhar a série de novo quando o semestre acabar.',
    },
    {
      id: 'ES7-M9-Q3', type: 'multiple_choice',
      prompt: 'A caixa de excluir um evento de uma série oferece três opções. Qual delas cancela só o sábado do acampamento?',
      data: { options: [
        { id: 'a', text: 'Este evento.', correct: true },
        { id: 'b', text: 'Este e os seguintes.', porque: 'Essa corta a série a partir dali. Os sábados depois do acampamento sumiriam junto.' },
        { id: 'c', text: 'Todos os eventos.', porque: 'Essa apaga o ano inteiro, inclusive o que já aconteceu. E não pergunta de novo.' },
        { id: 'd', text: 'Qualquer uma: as três fazem o mesmo.', porque: 'Elas fazem três coisas bem diferentes, e vêm escritas em letra do mesmo tamanho.' },
      ]},
      explanation: 'As três estão escritas do mesmo jeito, sem nenhuma destacada, e é por isso que tanta gente apaga um ano para desmarcar um sábado.',
    },
    {
      id: 'ES7-M9-Q4', type: 'multiple_choice',
      prompt: 'A reunião passa a ser às 15h a partir de agosto. Qual opção você escolhe?',
      data: { options: [
        { id: 'a', text: 'Este e os seguintes.', correct: true },
        { id: 'b', text: 'Todos os eventos.', porque: 'Ela reescreveria também junho e julho, que aconteceram às 14h. O histórico passaria a mentir.' },
        { id: 'c', text: 'Este evento.', porque: 'Ela mudaria um sábado só, e os seguintes continuariam às 14h.' },
        { id: 'd', text: 'Nenhuma: é preciso criar outra série.', porque: 'Dá para fazer assim, e é mais trabalho — a opção existe justamente para não precisar.' },
      ]},
      explanation: 'Ela corta a série na data escolhida e abre outra dali em diante. O que ficou para trás continua intacto.',
    },
    {
      id: 'ES7-M9-Q5', type: 'true_false',
      prompt: 'Cancelar uma ocorrência de uma série apaga a série inteira.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Só a opção "todos os eventos" apaga a série. "Este evento" tira uma ocorrência e deixa as outras de pé.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A série continua, com um buraco no dia escolhido. É o que se quer quando o clube está no acampamento naquele sábado.',
    },
    {
      id: 'ES7-M9-Q6', type: 'multiple_choice',
      prompt: 'Como se percebe que alguém apagou a série inteira por engano?',
      data: { options: [
        { id: 'a', text: 'Quando ninguém aparece no sábado seguinte.', correct: true },
        { id: 'b', text: 'Pela mensagem de erro da agenda.', porque: 'Não há erro nenhum. A exclusão foi pedida e a agenda obedeceu.' },
        { id: 'c', text: 'Pelo aviso de exclusão que fica na tela.', porque: 'O aviso some em segundos, e some da tela de quem apagou — não da agenda dos outros.' },
        { id: 'd', text: 'Pela lixeira da agenda.', porque: 'Só se alguém for olhar. E ninguém olha a lixeira da agenda procurando o que não sabe que sumiu.' },
      ]},
      explanation: 'Nada avisa, e o que sumiu sumiu da agenda de todo mundo ao mesmo tempo. É o mesmo silêncio de todas as outras lições desta vereda.',
    },
    {
      id: 'ES7-M9-Q7', type: 'multiple_choice',
      prompt: 'Você mudou o local de um sábado só. O que acontece na semana seguinte?',
      data: { options: [
        { id: 'a', text: 'Ela volta ao local da série.', correct: true },
        { id: 'b', text: 'Ela fica no local novo também.', porque: 'A mudança valeu para aquela ocorrência. A série continua com o local dela.' },
        { id: 'c', text: 'A série inteira muda de local.', porque: 'Isso aconteceria com "todos os eventos". Mudar uma ocorrência mexe só nela.' },
        { id: 'd', text: 'A agenda apaga a ocorrência alterada.', porque: 'Ela fica, separada da série. Nenhuma alteração apaga nada.' },
      ]},
      explanation: 'A ocorrência alterada se solta da série. A partir daí, mudanças na série não a alcançam mais — e essa é a parte que surpreende.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 10 — O calendário do clube (requisitos 5.4 e 5.5)
     ────────────────────────────────────────────────────────────────────── */
  'm10-teoria': [
    {
      id: 'ES7-M10-Q1', type: 'multiple_choice',
      prompt: 'O que o nível "ver apenas livre/ocupado" mostra?',
      data: { options: [
        { id: 'a', text: 'Que o horário está tomado, e nada além.', correct: true },
        { id: 'b', text: 'O título dos eventos, sem a descrição.', porque: 'Esse é o nível de ver os detalhes. Livre/ocupado não mostra título nenhum.' },
        { id: 'c', text: 'Só os eventos marcados como públicos.', porque: 'Ele mostra todos os horários ocupados, e não mostra o conteúdo de nenhum.' },
        { id: 'd', text: 'Nada: é o mesmo que não compartilhar.', porque: 'É bem diferente: com ele, quem quer marcar hora com você consegue ver quando você pode.' },
      ]},
      explanation: 'É o nível de quem precisa marcar hora com você e não tem nada que ver com o que você faz. A maioria das pessoas cabe aqui.',
    },
    {
      id: 'ES7-M10-Q2', type: 'multiple_choice',
      prompt: 'Qual é o risco de dar "fazer alterações" a trinta pessoas?',
      data: { options: [
        { id: 'a', text: 'Qualquer uma delas pode apagar o acampamento.', correct: true },
        { id: 'b', text: 'O calendário fica lento.', porque: 'O número de pessoas não pesa. O que pesa é o que cada uma pode fazer.' },
        { id: 'c', text: 'Elas passam a receber todos os avisos.', porque: 'Aviso é configuração de cada um, e não consequência do nível.' },
        { id: 'd', text: 'Nenhum: alterar é só para quem foi convidado.', porque: 'Alterar é alterar. Quem tem o nível mexe em qualquer evento do calendário.' },
      ]},
      explanation: 'Ninguém apaga de propósito. Apaga arrastando sem querer — e o evento some da agenda de todo mundo ao mesmo tempo.',
    },
    {
      id: 'ES7-M10-Q3', type: 'multiple_choice',
      prompt: 'O que um calendário público entrega além dos horários?',
      data: { options: [
        { id: 'a', text: 'A descrição de cada evento.', correct: true },
        { id: 'b', text: 'A lista de quem tem acesso.', porque: 'A lista de acesso não é publicada. O que vai junto é o conteúdo dos eventos.' },
        { id: 'c', text: 'O endereço de quem criou os eventos.', porque: 'Isso não é publicado. A descrição, sim — e é lá que costuma estar o telefone de alguém.' },
        { id: 'd', text: 'Nada além: só os horários.', porque: 'A descrição vai inteira, para qualquer pessoa e para os buscadores.' },
      ]},
      explanation: 'A descrição é onde se escreve o telefone de quem abre o salão. Publicar o calendário publica isso também.',
    },
    {
      id: 'ES7-M10-Q4', type: 'multiple_choice',
      prompt: 'Na grade de disponibilidade, o que quer dizer um espaço em branco?',
      data: { options: [
        { id: 'a', text: 'Depende: pode ser livre ou desconhecido.', correct: true },
        { id: 'b', text: 'Que a pessoa está livre.', porque: 'Só se ela tiver compartilhado a agenda. Quem não compartilhou aparece do mesmo jeito.' },
        { id: 'c', text: 'Que a pessoa não foi convidada.', porque: 'Ela está na grade porque foi convidada. O branco fala do horário, e não do convite.' },
        { id: 'd', text: 'Que a agenda dela está vazia naquele dia.', porque: 'Pode estar cheia e não compartilhada. A grade mostra o que conseguiu consultar.' },
      ]},
      explanation: 'A grade responde sobre as agendas que ela conseguiu consultar, e não sobre a vida das pessoas. Livre e desconhecido cabem no mesmo branco.',
    },
    {
      id: 'ES7-M10-Q5', type: 'multiple_choice',
      prompt: 'A grade diz que todos estão livres às 12h. O que ainda falta fazer?',
      data: { options: [
        { id: 'a', text: 'Perguntar a quem não compartilha a agenda.', correct: true },
        { id: 'b', text: 'Nada: a grade já respondeu.', porque: 'Ela respondeu sobre quem compartilhou. Quem não compartilhou não entrou na conta.' },
        { id: 'c', text: 'Conferir se a sala da secretaria está livre.', porque: 'Vale conferir, e é outra pergunta. Esta é sobre as pessoas.' },
        { id: 'd', text: 'Esperar as confirmações do convite chegarem.', porque: 'O convite vem depois. A pergunta aqui é se dá para marcar naquele horário.' },
      ]},
      explanation: 'A maioria das pessoas não tem o trabalho na agenda do clube. Perguntar é o gesto que a grade não substitui.',
    },
    {
      id: 'ES7-M10-Q6', type: 'true_false',
      prompt: 'Compartilhar o calendário do clube é dar a mesma permissão a todo mundo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Cada pessoa recebe o nível que o trabalho dela pede: quem organiza altera, quem participa vê, quem só precisa marcar hora vê livre/ocupado.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Os níveis não formam uma escada de confiança. Eles dizem o que cada pessoa faz com o calendário.',
    },
    {
      id: 'ES7-M10-Q7', type: 'matching',
      prompt: 'Ligue cada pessoa ao nível que o trabalho dela pede.',
      data: { pairs: [
        { left: 'Quem organiza os eventos do clube', right: 'Fazer alterações' },
        { left: 'O conselheiro que participa de tudo', right: 'Ver todos os detalhes' },
        { left: 'A família que quer marcar uma conversa', right: 'Ver apenas livre/ocupado' },
        { left: 'Quem vai dar acesso a outras pessoas', right: 'Fazer alterações e gerenciar compartilhamento' },
      ]},
      explanation: 'Só o último nível se propaga: quem o tem pode dar acesso a mais gente, inclusive tirar o seu.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 11 — A reunião a distância (requisito 6)
     ────────────────────────────────────────────────────────────────────── */
  'm11-teoria': [
    {
      id: 'ES7-M11-Q1', type: 'multiple_choice',
      prompt: 'Onde o vínculo de uma reunião a distância deve ficar?',
      data: { options: [
        { id: 'a', text: 'No evento do calendário.', correct: true },
        { id: 'b', text: 'Numa mensagem mandada na véspera.', porque: 'A mensagem se perde na conversa. Cinco minutos antes, ninguém acha.' },
        { id: 'c', text: 'No grupo de conversa do clube.', porque: 'Funciona e some rápido: qualquer conversa empurra o vínculo para cima.' },
        { id: 'd', text: 'Na descrição de um evento anterior.', porque: 'Quem procura olha o evento de hoje, e não o da semana passada.' },
      ]},
      explanation: 'No evento ele está onde a pessoa vai olhar na hora, que é o calendário dela — e ele viaja com o convite, para todo mundo.',
    },
    {
      id: 'ES7-M11-Q2', type: 'multiple_choice',
      prompt: 'Você falou dois minutos com o microfone fechado. O que os outros ouviram?',
      data: { options: [
        { id: 'a', text: 'Nada.', correct: true },
        { id: 'b', text: 'A fala abafada.', porque: 'Fechado é fechado. Não sai som nenhum, nem baixo.' },
        { id: 'c', text: 'O começo, até o programa avisar.', porque: 'O aviso é para você, na sua tela. Do outro lado não chegou nem o começo.' },
        { id: 'd', text: 'Tudo, porque o programa abre o microfone sozinho.', porque: 'Nenhum programa abre o microfone por conta própria. Seria o contrário do que se espera dele.' },
      ]},
      explanation: 'E abrir o microfone depois não faz ninguém ouvir o que já foi dito. O aviso está na tela o tempo todo, e todo mundo faz isso assim mesmo.',
    },
    {
      id: 'ES7-M11-Q3', type: 'multiple_choice',
      prompt: 'Qual é o risco de compartilhar a tela inteira?',
      data: { options: [
        { id: 'a', text: 'As notificações que chegarem vão junto.', correct: true },
        { id: 'b', text: 'A imagem fica mais lenta.', porque: 'A diferença de desempenho é pequena e não é o que decide entre as duas.' },
        { id: 'c', text: 'Ninguém consegue ver o que você mostra.', porque: 'Todo mundo vê. O problema é ver demais.' },
        { id: 'd', text: 'O programa pede sua senha.', porque: 'Não pede nada. O sistema só pergunta o que compartilhar, uma vez.' },
      ]},
      explanation: 'Na sua máquina a notificação aparece no canto e some. Você não tem como saber que catorze pessoas leram o que chegou.',
    },
    {
      id: 'ES7-M11-Q4', type: 'multiple_choice',
      prompt: 'E qual é o risco de compartilhar só uma janela?',
      data: { options: [
        { id: 'a', text: 'Trocar de janela deixa a sala na antiga.', correct: true },
        { id: 'b', text: 'A janela some quando você a minimiza.', porque: 'Muitos programas continuam enviando a última imagem. Some ou congela — nos dois casos a sala não acompanha.' },
        { id: 'c', text: 'Só uma pessoa consegue ver por vez.', porque: 'Todo mundo vê a mesma coisa. O que muda é o que está sendo enviado.' },
        { id: 'd', text: 'Nenhum: janela é sempre melhor.', porque: 'Ela é melhor para uma coisa só. Quando você precisa mostrar várias, a tela inteira é o caminho.' },
      ]},
      explanation: 'Você explica uma coisa e a sala olha outra. Nenhuma das duas escolhas é sempre certa, e é por isso que o requisito pede a demonstração.',
    },
    {
      id: 'ES7-M11-Q5', type: 'multiple_choice',
      prompt: 'Você mostrou um vídeo e ninguém ouviu nada. O que faltou?',
      data: { options: [
        { id: 'a', text: 'Compartilhar a guia, com o áudio marcado.', correct: true },
        { id: 'b', text: 'Aumentar o volume do seu computador.', porque: 'O volume é do seu alto-falante. O que vai para a sala é outra coisa.' },
        { id: 'c', text: 'Pedir que eles aumentem o volume.', porque: 'Não há o que aumentar do lado deles: o som não foi enviado.' },
        { id: 'd', text: 'Usar fone de ouvido.', porque: 'Fone resolve eco e microfonia, e não tem nada a ver com o áudio do que se compartilha.' },
      ]},
      explanation: 'Só a guia leva som, e só com a caixa marcada. Pela janela do navegador chega a imagem e o silêncio.',
    },
    {
      id: 'ES7-M11-Q6', type: 'true_false',
      prompt: 'Quem conduz a reunião percebe na hora que alguém está esperando para entrar.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O pedido aparece por alguns segundos e some, e quem conduz costuma estar olhando o que está apresentando.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'É assim que alguém fica quinze minutos do lado de fora de uma reunião que está acontecendo. Vale conferir a sala de espera de vez em quando.',
    },
    {
      id: 'ES7-M11-Q7', type: 'multiple_choice',
      prompt: 'O que você confere antes de começar a apresentar?',
      data: { options: [
        { id: 'a', text: 'O que está aberto na tela a ser mostrada.', correct: true },
        { id: 'b', text: 'Se a câmera está ligada e bem enquadrada.', porque: 'Vale ligar, e não é o que decide o que a sala vai ver de errado.' },
        { id: 'c', text: 'Se todos já entraram.', porque: 'Ajuda, e não evita o que este cuidado evita.' },
        { id: 'd', text: 'Se a reunião está sendo gravada.', porque: 'Importa saber, e é outra pergunta. Esta é sobre o que vai aparecer na tela.' },
      ]},
      explanation: 'Fechar a conversa, silenciar as notificações e deixar aberto só o que precisa ser visto. É o único cuidado que não dá para tomar depois.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 12 — A pauta e a ata (requisitos 7 e 8)
     ────────────────────────────────────────────────────────────────────── */
  'm12-teoria': [
    {
      id: 'ES7-M12-Q1', type: 'multiple_choice',
      prompt: 'Para que serve mandar a pauta antes da reunião?',
      data: { options: [
        { id: 'a', text: 'Para quem vai participar poder se preparar.', correct: true },
        { id: 'b', text: 'Para provar que a reunião foi convocada.', porque: 'A convocação é o convite. A pauta responde a outra pergunta: o que vai ser tratado.' },
        { id: 'c', text: 'Para encurtar a reunião.', porque: 'Ela costuma encurtar, e isso é consequência. A razão é que ninguém chega sem saber do que se trata.' },
        { id: 'd', text: 'Para registrar o que foi decidido.', porque: 'Isso é a ata, e ela vem depois. A pauta é a lista do que ainda vai ser discutido.' },
      ]},
      explanation: 'Quem vai levar a prestação de contas precisa saber disso antes, e não na hora. É a única razão de mandar antes.',
    },
    {
      id: 'ES7-M12-Q2', type: 'multiple_choice',
      prompt: 'Qual destes textos é uma pauta?',
      data: { options: [
        { id: 'a', text: 'Uma lista de três ou quatro assuntos, em ordem.', correct: true },
        { id: 'b', text: 'Um parágrafo dizendo que haverá reunião.', porque: 'Isso é a convocação. Ninguém fica sabendo o que preparar.' },
        { id: 'c', text: 'O resumo do que foi decidido na reunião passada.', porque: 'Isso é a ata anterior. Vale anexar, e não substitui a pauta de hoje.' },
        { id: 'd', text: 'A lista de quem foi convidado.', porque: 'Quem vem é uma coisa; o que vai ser tratado é outra.' },
      ]},
      explanation: 'Lista, e não parágrafo. "Vamos falar do acampamento e de mais umas coisas" não deixa ninguém preparar nada.',
    },
    {
      id: 'ES7-M12-Q3', type: 'multiple_choice',
      prompt: 'O que uma decisão de ata precisa ter para servir de alguma coisa?',
      data: { options: [
        { id: 'a', text: 'Quem faz e até quando.', correct: true },
        { id: 'b', text: 'A justificativa de quem propôs.', porque: 'Ajuda a lembrar o porquê, e não faz ninguém executar nada.' },
        { id: 'c', text: 'O número de votos a favor.', porque: 'Registra como se chegou à decisão. Não diz quem vai fazer o que foi decidido.' },
        { id: 'd', text: 'A hora em que foi decidida.', porque: 'É detalhe de registro. Não muda nada para quem vai executar.' },
      ]},
      explanation: '"Ficou combinado que alguém vai ver o som" é a mesma frase de "seria bom se alguém pudesse levar o som", escrita um mês depois.',
    },
    {
      id: 'ES7-M12-Q4', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre a pauta e a ata?',
      data: { options: [
        { id: 'a', text: 'A pauta olha para a frente; a ata, para trás.', correct: true },
        { id: 'b', text: 'A pauta é informal e a ata é oficial.', porque: 'As duas são documentos do clube. O que muda é o momento e o conteúdo.' },
        { id: 'c', text: 'A pauta vai por mensagem e a ata é lida em voz alta.', porque: 'As duas costumam ir por mensagem, e as duas são distribuídas a quem participou.' },
        { id: 'd', text: 'A ata substitui a pauta na reunião seguinte.', porque: 'Cada reunião tem a sua pauta. A ata da anterior é um anexo útil, e não a pauta de hoje.' },
      ]},
      explanation: 'Uma é escrita antes e olha para a frente; a outra é escrita depois e responde por trás. As duas vão para as mesmas pessoas.',
    },
    {
      id: 'ES7-M12-Q5', type: 'true_false',
      prompt: 'Uma ata que registra toda a discussão é melhor do que uma que registra só as decisões.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'O que alguém vai procurar dali a dois meses é o que ficou combinado, e não quem disse o quê.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A ata existe para ser lida depois. Quanto mais discussão ela guarda, mais fundo ficam as decisões que alguém precisa cumprir.',
    },
    {
      id: 'ES7-M12-Q6', type: 'multiple_choice',
      prompt: 'O que o examinador vê quando abre a sua caixa de entrada organizada?',
      data: { options: [
        { id: 'a', text: 'Só o que ainda espera alguma coisa de você.', correct: true },
        { id: 'b', text: 'Uma caixa vazia.', porque: 'Vazia quer dizer que nada está pendente, ou que tudo foi varrido de uma vez. As duas coisas se parecem.' },
        { id: 'c', text: 'As mensagens dos últimos trinta dias.', porque: 'Idade não organiza nada. O que decide é se a mensagem pede alguma coisa.' },
        { id: 'd', text: 'As mensagens separadas por pastas de assunto.', porque: 'Pastas ajudam alguns, e a busca acha melhor. O que se apresenta é a entrada, e o critério dela é pendência.' },
      ]},
      explanation: 'Uma caixa organizada não é uma caixa vazia: é uma em que o que está lá está lá por um motivo.',
    },
    {
      id: 'ES7-M12-Q7', type: 'multiple_choice',
      prompt: 'O que quer dizer um mês planejado no calendário do clube?',
      data: { options: [
        { id: 'a', text: 'Que dá para ler o mês sem perguntar nada.', correct: true },
        { id: 'b', text: 'Que todos os dias do mês têm evento.', porque: 'Clube nenhum se reúne todo dia. O que importa é que o que existe esteja lá.' },
        { id: 'c', text: 'Que o mês foi fechado e não muda mais.', porque: 'Calendário de clube muda o tempo todo. Planejado não quer dizer congelado.' },
        { id: 'd', text: 'Que os eventos foram aprovados pela direção.', porque: 'Aprovação é outra coisa. Aqui a pergunta é se o mês está escrito.' },
      ]},
      explanation: 'As reuniões semanais, o que é daquele mês, com local e horário. É o que o requisito 8 manda apresentar.',
    },
  ],
};
