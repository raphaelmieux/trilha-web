import type { Question } from '../types';

/*
 * As questões das lições de teoria da CC-ES006 Trabalho Compartilhado.
 *
 * ── O que elas medem ──────────────────────────────────────────────────────
 * A definição vale uma vez. Depois dela vêm consequência, discriminação e
 * diagnóstico — e nesta vereda o diagnóstico carrega quase tudo, porque a
 * matéria inteira é feita de telas que parecem certas: o arquivo restrito que
 * a pasta abriu, a caixa que mostra três papéis certos e um link escancarado,
 * o histórico que ninguém abre por medo de perder o de cima, a cópia em
 * conflito parada na pasta com nome quase igual ao do original.
 *
 * ── E há um segundo eixo: o que parece a mesma coisa e não é ──────────────
 * Dar edição e dar a conta. Resolver e apagar. Editar e sugerir. Compartilhar
 * o vínculo e mandar o anexo. Edição simultânea e conflito. Cada par tem uma
 * questão que obriga a separá-los, porque confundi-los é o que custa caro
 * depois — e nenhum deles dá erro no dia em que se confunde.
 *
 * Toda alternativa errada diz por que está errada, no campo porque, e a certa
 * não carrega motivo nenhum: o porquê tem lugar próprio, o explanation. E nada
 * de crase nem de asterisco — a questão vai para o QuestionRenderer, que
 * imprime texto puro.
 */

export const QUESTOES_DO_COMPARTILHADO: Record<string, Question[]> = {
  /* ──────────────────────────────────────────────────────────────────────
     Módulo 1 — Anexo ou vínculo (requisito 3)
     ────────────────────────────────────────────────────────────────────── */
  'm1-teoria': [
    {
      id: 'ES6-M1-Q1', type: 'multiple_choice',
      prompt: 'O que sai quando você manda um arquivo por anexo?',
      data: { options: [
        { id: 'a', text: 'Uma cópia solta, que passa a ser de quem recebeu.', correct: true },
        { id: 'b', text: 'O mesmo arquivo, com mais uma pessoa dentro dele.', porque: 'Isso é o vínculo. O anexo produz um segundo arquivo, que a partir dali vive a vida dele.' },
        { id: 'c', text: 'Um atalho que abre o arquivo original.', porque: 'Atalho aponta para o original e acompanha as mudanças. O anexo não aponta para nada.' },
        { id: 'd', text: 'Um convite para a pessoa pedir acesso.', porque: 'Convite é o que o vínculo manda. O anexo já entrega o conteúdo, sem pedir nada a ninguém.' },
      ]},
      explanation: 'A cópia não se religa ao original. É isso que a torna uma cópia, e é de onde saem os dois problemas que o requisito 3 manda apontar.',
    },
    {
      id: 'ES6-M1-Q2', type: 'multiple_choice',
      prompt: 'Você mandou a lista por anexo hoje de manhã e escreveu mais dois itens à tarde. O que a outra pessoa tem?',
      data: { options: [
        { id: 'a', text: 'A lista de manhã, sem os dois itens.', correct: true },
        { id: 'b', text: 'A lista completa, porque o arquivo se atualiza sozinho.', porque: 'Só o vínculo se atualiza. O anexo é um arquivo separado desde o segundo em que saiu.' },
        { id: 'c', text: 'Um aviso de que a lista mudou.', porque: 'Nada avisa. Esse silêncio é o que faz as duas versões conviverem por semanas sem ninguém notar.' },
        { id: 'd', text: 'A lista completa, se ela abrir o anexo de novo.', porque: 'Abrir de novo abre o mesmo arquivo de antes, que continua sendo o de manhã.' },
      ]},
      explanation: 'Em pouco tempo há duas versões e ninguém sabe qual vale — e nenhuma das duas está errada, que é o que faz a confusão durar.',
    },
    {
      id: 'ES6-M1-Q3', type: 'multiple_choice',
      prompt: 'Você tirou o acesso de alguém ao arquivo compartilhado. E a cópia que essa pessoa recebeu por anexo no mês passado?',
      data: { options: [
        { id: 'a', text: 'Continua com ela.', correct: true },
        { id: 'b', text: 'Some junto, porque o acesso foi retirado.', porque: 'A retirada alcança o original. A cópia é outro arquivo, na nuvem dela, e nada do que você faça a alcança.' },
        { id: 'c', text: 'Para de abrir e pede a senha.', porque: 'Nenhum anexo pede senha depois de recebido. Ele é um arquivo comum no computador de quem recebeu.' },
        { id: 'd', text: 'Vira somente leitura.', porque: 'O arquivo é dela. Ela edita, renomeia e reenvia o quanto quiser.' },
      ]},
      explanation: 'É o segundo problema do requisito 3, e é a mesma lição de que tirar o acesso não apaga a senha da memória de quem saiu.',
    },
    {
      id: 'ES6-M1-Q4', type: 'multiple_choice',
      prompt: 'Quando mandar o anexo é a escolha certa?',
      data: { options: [
        { id: 'a', text: 'Quando o documento está pronto e não vai mudar mais.', correct: true },
        { id: 'b', text: 'Quando a pessoa precisa escrever no documento junto com você.', porque: 'Duas pessoas escrevendo em duas cópias produzem duas versões, e alguém vai ter de juntá-las à mão.' },
        { id: 'c', text: 'Quando o arquivo é grande.', porque: 'Arquivo grande é justamente o pior caso do anexo: ele viaja inteiro e ocupa espaço em cada caixa de entrada.' },
        { id: 'd', text: 'Quando são muitas pessoas.', porque: 'Muitas pessoas viram muitas cópias, e cada uma pode começar a escrever na sua.' },
      ]},
      explanation: 'A ficha assinada, o recibo, o PDF do ano passado: coisa que não muda mais não tem o que acompanhar.',
    },
    {
      id: 'ES6-M1-Q5', type: 'multiple_choice',
      prompt: 'Qual destes é o sinal, na pasta, de que alguém andou mandando anexo?',
      data: { options: [
        { id: 'a', text: 'Arquivos com nomes quase iguais e datas diferentes.', correct: true },
        { id: 'b', text: 'Um arquivo com muita gente na lista de acesso.', porque: 'Isso é o contrário: é o vínculo funcionando, com um arquivo só e várias pessoas dentro.' },
        { id: 'c', text: 'Um arquivo que ninguém abriu há meses.', porque: 'Arquivo parado é arquivo parado. Ele não diz nada sobre como foi distribuído.' },
        { id: 'd', text: 'Uma pasta com muitos arquivos.', porque: 'Pasta cheia pode ser só uma pasta organizada. O que denuncia é a semelhança entre os nomes.' },
      ]},
      explanation: 'lista-final, lista-final-2, lista-final-revisada: é o retrato de um documento que virou quatro.',
    },
    {
      id: 'ES6-M1-Q6', type: 'true_false',
      prompt: 'Uma cópia recém-mandada por anexo diz exatamente a mesma coisa que o original.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ela é cópia fiel no segundo em que sai. A divergência só nasce quando alguém escreve de um dos lados.' },
      ]},
      explanation: 'E é por isso que ela parece inofensiva no dia em que se manda: a divergência não existe ainda, e só aparece quando alguém escreve de um dos lados.',
    },
    {
      id: 'ES6-M1-Q7', type: 'multiple_choice',
      prompt: 'O clube manda a circular do acampamento por anexo para sessenta famílias e descobre um erro na data. O que acontece?',
      data: { options: [
        { id: 'a', text: 'As sessenta cópias continuam com a data errada.', correct: true },
        { id: 'b', text: 'Basta corrigir o original que todas se corrigem.', porque: 'Nenhuma das sessenta aponta para o original. Corrigi-lo corrige um arquivo: o seu.' },
        { id: 'c', text: 'O sistema avisa quem já baixou.', porque: 'Não existe esse aviso. Depois de enviado, o anexo está fora do alcance de quem mandou.' },
        { id: 'd', text: 'As cópias ficam bloqueadas até alguém aprovar.', porque: 'Anexo recebido é arquivo comum. Nada o bloqueia.' },
      ]},
      explanation: 'Com o vínculo, corrigir o original corrige o que as sessenta famílias abrem. É a diferença inteira entre os dois gestos.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 2 — Os três níveis de permissão (requisitos 2.2 e 4.1)
     ────────────────────────────────────────────────────────────────────── */
  'm2-teoria': [
    {
      id: 'ES6-M2-Q1', type: 'multiple_choice',
      prompt: 'O que a permissão de comentário deixa fazer que a de leitura não deixa?',
      data: { options: [
        { id: 'a', text: 'Escrever observações na margem e propor alterações.', correct: true },
        { id: 'b', text: 'Mudar o texto do documento.', porque: 'Isso é edição. O que o comentarista escreve no texto vira sugestão e espera alguém aceitar.' },
        { id: 'c', text: 'Compartilhar o arquivo com mais gente.', porque: 'Compartilhar é de quem edita ou de quem é dono, e não de quem comenta.' },
        { id: 'd', text: 'Baixar uma cópia do arquivo.', porque: 'Baixar é coisa que até o leitor faz. Não é aí que os dois níveis se separam.' },
      ]},
      explanation: 'É o nível de quem revisa: opina sobre tudo e não muda nada sem passar por alguém.',
    },
    {
      id: 'ES6-M2-Q2', type: 'multiple_choice',
      prompt: 'Alguém com permissão de comentário digita no meio de uma frase do documento. O que acontece com o texto?',
      data: { options: [
        { id: 'a', text: 'Ele continua igual, e o que foi escrito vira uma sugestão.', correct: true },
        { id: 'b', text: 'Ele muda, e o dono recebe um aviso.', porque: 'Se mudasse, a permissão de comentário seria a de edição com outro nome.' },
        { id: 'c', text: 'O programa recusa a digitação e não escreve nada.', porque: 'Recusar em silêncio ensinaria que o editor está quebrado. Ele aceita, e transforma no que aquele nível permite.' },
        { id: 'd', text: 'O texto muda só para essa pessoa.', porque: 'Não existem duas versões do mesmo documento na nuvem. A sugestão fica visível para todo mundo.' },
      ]},
      explanation: 'Quem não sabe disso acha que editou, fecha o documento e vai embora — e a correção fica esperando alguém aceitar.',
    },
    {
      id: 'ES6-M2-Q3', type: 'multiple_choice',
      prompt: 'A Cleide só vai ler a lista no portão, no dia. Que nível ela precisa?',
      data: { options: [
        { id: 'a', text: 'Leitura.', correct: true },
        { id: 'b', text: 'Edição, para o caso de ela precisar corrigir alguma coisa.', porque: 'Dar edição por precaução é como se apaga uma linha sem querer. Quem precisar corrigir pede.' },
        { id: 'c', text: 'Comentário, para ela poder avisar se faltar algo.', porque: 'Ela pode avisar pelo telefone. Dar o nível pelo que talvez aconteça é o que enche a lista de gente com poder demais.' },
        { id: 'd', text: 'Propriedade, porque ela é quem fica com a lista no dia.', porque: 'Propriedade é de quem responde pelo arquivo, e não de quem o usa num dia.' },
      ]},
      explanation: 'O nível sai do que a pessoa vai fazer, e não do quanto se confia nela. As duas coisas se confundem muito, e só uma delas é uma regra.',
    },
    {
      id: 'ES6-M2-Q4', type: 'multiple_choice',
      prompt: 'Você deu os três níveis certos às três pessoas e deixou o acesso geral em "qualquer pessoa com o link pode editar". O que vale?',
      data: { options: [
        { id: 'a', text: 'Qualquer pessoa com o endereço edita o arquivo.', correct: true },
        { id: 'b', text: 'Os três níveis, porque eles são mais específicos.', porque: 'O acesso geral não disputa com a lista: ele abre uma segunda porta, que não olha a lista nenhuma.' },
        { id: 'c', text: 'O nível mais baixo dos três, por segurança.', porque: 'A nuvem não escolhe o mais fechado. Cada caminho de acesso vale por si.' },
        { id: 'd', text: 'Nada muda, porque ninguém tem o endereço.', porque: 'Endereço circula por mensagem, por captura de tela e por encaminhamento. É a coisa mais fácil de vazar que existe.' },
      ]},
      explanation: 'A caixa continua mostrando os três nomes com os três papéis certos ao lado, do jeito que você os deixou. O que mudou é que eles não valem nada.',
    },
    {
      id: 'ES6-M2-Q5', type: 'multiple_choice',
      prompt: 'O que o editor pode fazer e o dono não precisa autorizar?',
      data: { options: [
        { id: 'a', text: 'Compartilhar o arquivo com mais gente.', correct: true },
        { id: 'b', text: 'Apagar o arquivo para todo mundo.', porque: 'Apagar de vez é de quem é dono. O editor tira da vista dele, e não da dos outros.' },
        { id: 'c', text: 'Passar a propriedade para outra pessoa.', porque: 'Só quem é dono entrega a propriedade, e é justamente isso que separa dono de editor.' },
        { id: 'd', text: 'Impedir que o dono edite.', porque: 'Dono não se tranca fora do próprio arquivo. Nenhum nível faz isso.' },
      ]},
      explanation: 'É a razão de a lista de acesso crescer sozinha: qualquer editor pode convidar, e quase ninguém revisa a lista depois.',
    },
    {
      id: 'ES6-M2-Q6', type: 'true_false',
      prompt: 'Quem tem permissão de leitura consegue baixar uma cópia do arquivo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Baixar é coisa que o nível de leitura permite: o que ele controla é quem abre o original, e não o que acontece depois.' },
      ]},
      explanation: 'E a cópia baixada é dela para sempre, como o anexo do módulo 1. Permissão de leitura controla quem abre o original, e não o que acontece depois.',
    },
    {
      id: 'ES6-M2-Q7', type: 'ordering', prompt: 'Ordene os três níveis do que menos deixa fazer para o que mais deixa.',
      data: { items: [
        { id: 'a', text: 'Leitura', order: 1 },
        { id: 'b', text: 'Comentário', order: 2 },
        { id: 'c', text: 'Edição', order: 3 },
      ]},
      explanation: 'Quando dois caminhos de acesso discordam, vale o mais permissivo dos dois — e é essa ordem que decide qual é ele.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 3 — A pasta manda no que está dentro (requisito 5)
     ────────────────────────────────────────────────────────────────────── */
  'm3-teoria': [
    {
      id: 'ES6-M3-Q1', type: 'multiple_choice',
      prompt: 'Você compartilhou uma pasta com alguém. O que essa pessoa alcança?',
      data: { options: [
        { id: 'a', text: 'Tudo que está dentro, e o que for posto lá depois.', correct: true },
        { id: 'b', text: 'Só os arquivos que já estavam lá no momento de compartilhar.', porque: 'A permissão fica na pasta, e não numa lista de arquivos tirada naquele instante. O que entra depois entra debaixo dela.' },
        { id: 'c', text: 'Só a pasta, e cada arquivo precisa ser liberado à parte.', porque: 'Se fosse assim, compartilhar pasta não pouparia trabalho nenhum, que é a única razão de existir.' },
        { id: 'd', text: 'Nada, até ela pedir acesso a cada arquivo.', porque: 'Nenhum pedido é necessário: ela abre a pasta e abre o que está dentro.' },
      ]},
      explanation: 'É o que torna a pasta compartilhada cômoda, e é o mesmo motivo de ela ser perigosa: arrastar um arquivo para dentro dela é publicá-lo.',
    },
    {
      id: 'ES6-M3-Q2', type: 'multiple_choice',
      prompt: 'Um arquivo cuja caixa diz "restrito" está dentro de uma pasta compartilhada com o clube inteiro. Quem abre esse arquivo?',
      data: { options: [
        { id: 'a', text: 'O clube inteiro.', correct: true },
        { id: 'b', text: 'Ninguém além do dono, porque o arquivo é mais específico.', porque: 'A nuvem não escolhe o mais fechado dos dois: ela soma os caminhos e vale o mais permissivo.' },
        { id: 'c', text: 'Ninguém, porque as duas permissões se anulam.', porque: 'Permissões não se anulam. Se anulassem, um arquivo dentro de uma pasta compartilhada seria ilegível para todo mundo.' },
        { id: 'd', text: 'Só quem tiver o endereço direto do arquivo.', porque: 'Quem entra pela pasta chega ao arquivo navegando, sem endereço nenhum.' },
      ]},
      explanation: 'A caixa dele continua dizendo "restrito". Nada estoura, nada avisa, e o arquivo está aberto porque alguém o arrastou para a pasta errada.',
    },
    {
      id: 'ES6-M3-Q3', type: 'multiple_choice',
      prompt: 'A ficha médica das crianças está aberta pela pasta. Qual gesto de fato a fecha?',
      data: { options: [
        { id: 'a', text: 'Mover a ficha para fora daquela pasta.', correct: true },
        { id: 'b', text: 'Tirar o nome de cada pessoa da caixa da ficha.', porque: 'Não há nome nenhum na caixa dela: quem entra, entra pela pasta. Tirar dali não tira nada.' },
        { id: 'c', text: 'Marcar a ficha como restrita.', porque: 'Ela já está marcada assim, e continua aberta. A marca do arquivo perde para a permissão da pasta.' },
        { id: 'd', text: 'Renomear a ficha para um nome que ninguém procuraria.', porque: 'Esconder pelo nome é contar com ninguém olhar a pasta. Quem entra nela vê a lista inteira.' },
      ]},
      explanation: 'Quem não move, não fecha. E fechar a pasta inteira tiraria do clube o lugar onde ele trabalha.',
    },
    {
      id: 'ES6-M3-Q4', type: 'multiple_choice',
      prompt: 'Onde a nuvem mostra que três pessoas entram num arquivo pela pasta de cima?',
      data: { options: [
        { id: 'a', text: 'Numa linha recolhida dentro da caixa de compartilhar.', correct: true },
        { id: 'b', text: 'Numa coluna da lista de arquivos.', porque: 'A lista mostra nome, dono e data. O acesso efetivo não aparece em lista nenhuma, e é por isso que ninguém o vê.' },
        { id: 'c', text: 'Num aviso na hora de abrir o arquivo.', porque: 'Nenhuma nuvem avisa isso ao abrir. O arquivo abre igual para quem tem acesso próprio e para quem herdou.' },
        { id: 'd', text: 'Em lugar nenhum: só o dono consegue saber.', porque: 'A informação existe e está à mão de quem abrir a caixa. O problema é que ela chega recolhida, e quase ninguém a abre.' },
      ]},
      explanation: 'Uma linha com uma seta, dizendo quantas pessoas são. Está lá, e ninguém clica — que é a diferença entre uma informação existir e ser lida.',
    },
    {
      id: 'ES6-M3-Q5', type: 'multiple_choice',
      prompt: 'A Cleide é leitora da pasta. Você dá a ela edição num arquivo lá dentro. O que vale para esse arquivo?',
      data: { options: [
        { id: 'a', text: 'Edição.', correct: true },
        { id: 'b', text: 'Leitura, porque a pasta manda.', porque: 'A regra não é "a pasta sempre": é o mais permissivo dos dois, e aqui o mais permissivo é o do arquivo.' },
        { id: 'c', text: 'Leitura, e a edição só valeria se a pasta inteira fosse liberada.', porque: 'A permissão do arquivo vale por si. Ela não precisa da pasta para existir.' },
        { id: 'd', text: 'Nenhum dos dois: permissões que discordam travam o arquivo.', porque: 'Nada trava. A nuvem resolve o desacordo escolhendo a mais permissiva, sempre.' },
      ]},
      explanation: 'A mesma regra que abre a ficha médica é a que deixa você liberar uma pessoa num arquivo só. É uma regra, e não duas.',
    },
    {
      id: 'ES6-M3-Q6', type: 'true_false',
      prompt: 'Mover um arquivo para dentro de uma pasta compartilhada muda quem consegue abrir esse arquivo.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'A permissão da pasta alcança o que está dentro dela, inclusive o que for posto lá depois de compartilhada.' },
      ]},
      explanation: 'E o gesto é arrastar, que é o gesto mais casual que existe. Arrastar um arquivo é uma decisão de permissão sem cara de decisão nenhuma.',
    },
    {
      id: 'ES6-M3-Q7', type: 'multiple_choice',
      prompt: 'Qual é a vantagem de compartilhar a pasta em vez de cada arquivo?',
      data: { options: [
        { id: 'a', text: 'O que entrar depois já nasce compartilhado.', correct: true },
        { id: 'b', text: 'Ela guarda quem abriu cada arquivo.', porque: 'Quem abriu é outra coisa, e nem toda nuvem registra. A pasta cuida de permissão, e não de histórico de leitura.' },
        { id: 'c', text: 'Os arquivos dentro dela ficam mais protegidos.', porque: 'É o contrário: eles ficam mais abertos, porque herdam a permissão dela.' },
        { id: 'd', text: 'Ela avisa quando alguém entra.', porque: 'Pasta compartilhada não notifica entrada. Ela só decide quem pode entrar.' },
      ]},
      explanation: 'É a comodidade inteira, e é o risco inteiro. As duas coisas são a mesma propriedade vista de dois lados.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 4 — Escrever ao mesmo tempo (requisitos 2.1 e 4.2)
     ────────────────────────────────────────────────────────────────────── */
  'm4-teoria': [
    {
      id: 'ES6-M4-Q1', type: 'multiple_choice',
      prompt: 'O que é edição simultânea?',
      data: { options: [
        { id: 'a', text: 'Duas pessoas escrevendo no mesmo arquivo ao mesmo tempo.', correct: true },
        { id: 'b', text: 'Duas pessoas com o arquivo aberto, uma esperando a outra sair.', porque: 'Isso é o arquivo travado, que é como funcionava antes da nuvem. A espera é justamente o que a edição simultânea elimina.' },
        { id: 'c', text: 'Duas cópias sendo juntadas no fim do dia.', porque: 'Juntar cópias é o que se faz quando não há edição simultânea, e é onde o trabalho se perde.' },
        { id: 'd', text: 'Uma pessoa escrevendo e a outra vendo pela tela compartilhada.', porque: 'Ver a tela de alguém não é escrever. Só uma pessoa está editando ali.' },
      ]},
      explanation: 'As duas edições entram na mesma hora, e nada precisa ser resolvido depois.',
    },
    {
      id: 'ES6-M4-Q2', type: 'multiple_choice',
      prompt: 'Você está escrevendo no parágrafo 3 e a Marta escreve no parágrafo 7. O que acontece?',
      data: { options: [
        { id: 'a', text: 'As duas escritas entram.', correct: true },
        { id: 'b', text: 'A última a salvar sobrescreve a outra.', porque: 'Isso é o comportamento de arquivo em disco. Na nuvem cada edição entra onde foi feita.' },
        { id: 'c', text: 'O programa avisa que há conflito.', porque: 'Não há conflito nenhum: o documento é um só e as duas pessoas estão dentro dele.' },
        { id: 'd', text: 'A escrita da Marta fica esperando você fechar.', porque: 'Ninguém espera ninguém. Esperar é o que a edição simultânea existe para acabar.' },
      ]},
      explanation: 'É o contrário do arquivo no pen drive, em que a segunda pessoa a salvar apaga o trabalho da primeira sem nada avisar.',
    },
    {
      id: 'ES6-M4-Q3', type: 'multiple_choice',
      prompt: 'O que as bolhas com as iniciais, no alto do editor, dizem?',
      data: { options: [
        { id: 'a', text: 'Quem está com o documento aberto agora.', correct: true },
        { id: 'b', text: 'Quem tem permissão de abrir o documento.', porque: 'Quem tem permissão está na caixa de compartilhar. A bolha é sobre este instante.' },
        { id: 'c', text: 'Quem já escreveu alguma vez no documento.', porque: 'Isso é o histórico de versões. A bolha some quando a pessoa fecha a aba.' },
        { id: 'd', text: 'Quem foi convidado e ainda não respondeu.', porque: 'Convite pendente não aparece ali. A bolha só existe para quem está dentro.' },
      ]},
      explanation: 'Elas somem quando a pessoa fecha o documento, e é isso que as separa da lista de acesso e do histórico.',
    },
    {
      id: 'ES6-M4-Q4', type: 'multiple_choice',
      prompt: 'Qual destas é a diferença entre edição simultânea e conflito de edição?',
      data: { options: [
        { id: 'a', text: 'A simultânea é no arquivo da nuvem; o conflito, no sincronizado.', correct: true },
        { id: 'b', text: 'A simultânea é de texto; o conflito é de planilha.', porque: 'O tipo do arquivo não decide nada. O que decide é se as duas pessoas estavam no mesmo arquivo ou em duas cópias locais.' },
        { id: 'c', text: 'A simultânea é de duas pessoas; o conflito, de três ou mais.', porque: 'Duas pessoas bastam para o conflito, e bastam para a edição simultânea. O número não é a diferença.' },
        { id: 'd', text: 'A simultânea precisa de internet e o conflito acontece sem ela.', porque: 'As duas acontecem com internet. O conflito nasce justamente quando a internet volta e as duas versões sobem.' },
      ]},
      explanation: 'No navegador o documento é um só e não há o que conflitar. Na pasta que sincroniza com o computador há duas cópias, e a volta da internet junta as duas.',
    },
    {
      id: 'ES6-M4-Q5', type: 'multiple_choice',
      prompt: 'Três pessoas vão escrever a escala do acampamento hoje à noite. Qual arranjo evita retrabalho?',
      data: { options: [
        { id: 'a', text: 'Um documento na nuvem, com as três dentro.', correct: true },
        { id: 'b', text: 'Cada uma escreve a parte dela e manda por anexo no fim.', porque: 'Alguém vai ter de juntar três arquivos à mão, e é nessa junção que uma parte se perde.' },
        { id: 'c', text: 'Uma escreve e as outras duas mandam correções por mensagem.', porque: 'Isso põe uma pessoa digitando o que as outras duas pensaram, e é o gargalo que a nuvem existe para tirar.' },
        { id: 'd', text: 'Um arquivo no pen drive, passado de mão em mão.', porque: 'Passar de mão em mão é editar em fila, e quem está no fim espera a noite inteira.' },
      ]},
      explanation: 'O requisito 8 pede exatamente isto, e pede a prova no histórico: três pessoas dentro do mesmo arquivo, cada uma com o nome dela gravado.',
    },
    {
      id: 'ES6-M4-Q6', type: 'true_false',
      prompt: 'Na edição simultânea é preciso salvar o documento para as outras pessoas verem o que você escreveu.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'Não existe botão de salvar: o que se digita já está gravado, e as outras pessoas veem na hora.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'Não há botão de salvar: o que se digita já está gravado. É por isso que o histórico de versões existe — ele é o único jeito de voltar atrás.',
    },
    {
      id: 'ES6-M4-Q7', type: 'multiple_choice',
      prompt: 'O que o cursor colorido com o nome de alguém, no meio do texto, mostra?',
      data: { options: [
        { id: 'a', text: 'Onde essa pessoa está escrevendo neste momento.', correct: true },
        { id: 'b', text: 'Um trecho que essa pessoa escreveu antes.', porque: 'Quem mostra o que cada um escreveu é o histórico. O cursor é sobre agora.' },
        { id: 'c', text: 'Um comentário que ela deixou ali.', porque: 'Comentário aparece na margem, num balão, e continua lá depois de a pessoa sair.' },
        { id: 'd', text: 'Uma parte do texto que ela travou para si.', porque: 'Nada se trava na edição simultânea. Você pode escrever no mesmo parágrafo em que ela está.' },
      ]},
      explanation: 'Ele some assim que a pessoa fecha o documento, como a bolha. É informação sobre este instante, e não sobre o arquivo.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 5 — Comentar e resolver (requisito 4.3)
     ────────────────────────────────────────────────────────────────────── */
  'm5-teoria': [
    {
      id: 'ES6-M5-Q1', type: 'multiple_choice',
      prompt: 'Para que serve um comentário num documento compartilhado?',
      data: { options: [
        { id: 'a', text: 'Dizer alguma coisa sobre o texto sem mexer no texto.', correct: true },
        { id: 'b', text: 'Corrigir o texto de um jeito que dá para desfazer.', porque: 'Corrigir com volta é a sugestão. O comentário não toca no texto de jeito nenhum.' },
        { id: 'c', text: 'Deixar um lembrete que só você vê.', porque: 'Comentário é da conversa: todo mundo que abre o documento o lê.' },
        { id: 'd', text: 'Marcar o documento como revisado.', porque: 'Não existe essa marca. Documento revisado é documento cujos comentários foram resolvidos.' },
      ]},
      explanation: 'A conversa fica presa ao trecho de que ela fala, e é isso que a separa de um recado por mensagem — que ninguém sabe a que parte se referia.',
    },
    {
      id: 'ES6-M5-Q2', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre resolver e apagar um comentário?',
      data: { options: [
        { id: 'a', text: 'O resolvido continua guardado; o apagado não volta.', correct: true },
        { id: 'b', text: 'Nenhuma: os dois somem da margem.', porque: 'Os dois somem da margem, e é justamente por isso que se confundem. O que muda é o que sobra atrás.' },
        { id: 'c', text: 'Resolver é do dono; apagar é de quem escreveu.', porque: 'Quem escreveu pode resolver e apagar o próprio. O que separa os dois não é quem clica.' },
        { id: 'd', text: 'Resolver marca como lido; apagar marca como recusado.', porque: 'Nenhum dos dois grava opinião. Resolver diz que o assunto se encerrou, e o apagado deixa de existir.' },
      ]},
      explanation: 'É a mesma distinção do módulo 5 da CC-ES002. Documento que se arquiva precisa do que foi discutido, e apagar joga isso fora.',
    },
    {
      id: 'ES6-M5-Q3', type: 'multiple_choice',
      prompt: 'A Marta deixou uma pergunta num comentário. Você concorda com ela. O que fazer?',
      data: { options: [
        { id: 'a', text: 'Responder e então resolver.', correct: true },
        { id: 'b', text: 'Resolver, já que você concorda.', porque: 'Ela perguntou. Fechar o assunto sem dizer nada deixa quem perguntou achando que ninguém leu.' },
        { id: 'c', text: 'Apagar, porque o assunto acabou.', porque: 'Apagar joga fora a pergunta e a decisão que ela provocou, que é o que alguém vai procurar daqui a seis meses.' },
        { id: 'd', text: 'Deixar aberto, para ela mesma resolver.', porque: 'Quem pergunta espera resposta, não espera resolver o próprio comentário sem ter sido respondido.' },
      ]},
      explanation: 'Resolver é um clique e responder não. É essa diferença de esforço que faz tanta gente só resolver.',
    },
    {
      id: 'ES6-M5-Q4', type: 'multiple_choice',
      prompt: 'Você rejeitou uma alteração que alguém propôs. O que ainda falta?',
      data: { options: [
        { id: 'a', text: 'Dizer por quê.', correct: true },
        { id: 'b', text: 'Nada: rejeitar já responde.', porque: 'Quem propôs vê a proposta sumir e não sabe se você discordou ou se nem viu. As duas coisas ficam iguais na tela dela.' },
        { id: 'c', text: 'Avisar o dono do arquivo.', porque: 'O dono não precisa ser avisado de cada rejeição. Quem precisa saber é quem propôs.' },
        { id: 'd', text: 'Apagar o comentário que acompanhava a proposta.', porque: 'Apagar tira do documento a explicação de por que aquilo foi discutido.' },
      ]},
      explanation: 'Rejeitar em silêncio devolve o documento com a proposta sumida — e quem revisou achando que você não viu.',
    },
    {
      id: 'ES6-M5-Q5', type: 'multiple_choice',
      prompt: 'Onde o comentário aparece no documento?',
      data: { options: [
        { id: 'a', text: 'Numa margem ao lado do papel, presa ao trecho.', correct: true },
        { id: 'b', text: 'Dentro do texto, num parágrafo próprio.', porque: 'Se ficasse dentro, ele sairia na impressão e empurraria o texto — que é justamente o que o comentário não faz.' },
        { id: 'c', text: 'Num arquivo separado, ao lado do documento.', porque: 'Comentário em arquivo separado é recado por mensagem: ninguém sabe a que trecho ele se referia.' },
        { id: 'd', text: 'No fim do documento, como nota de rodapé.', porque: 'Nota de rodapé é conteúdo do documento e sai no papel. Comentário é conversa sobre ele.' },
      ]},
      explanation: 'Fora do papel, e por isso ele não sai na impressão nem muda a paginação. É a mesma decisão da margem de revisão da CC-ES002.',
    },
    {
      id: 'ES6-M5-Q6', type: 'true_false',
      prompt: 'Comentário resolvido some da margem de quem só está lendo o documento.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ele some da margem e continua guardado, e é isso que o separa do comentário apagado.' },
      ]},
      explanation: 'E continua achável para quem procurar. É o que deixa o documento limpo sem jogar a conversa fora.',
    },
    {
      id: 'ES6-M5-Q7', type: 'multiple_choice',
      prompt: 'Qual destes é o melhor comentário de revisão?',
      data: { options: [
        { id: 'a', text: '"A data aqui diz 17 e no parágrafo 4 diz 19. Qual vale?"', correct: true },
        { id: 'b', text: '"Isto aqui está errado, precisa ser revisto com calma."', porque: 'Quem lê não sabe o que está errado nem o que fazer. O comentário vira uma segunda pergunta.' },
        { id: 'c', text: '"Arrumar."', porque: 'Uma palavra não diz o que arrumar, e daqui a uma semana nem quem escreveu vai lembrar.' },
        { id: 'd', text: '"Não gostei muito desta parte, acho que dá para melhorar."', porque: 'Gosto não é revisão. Quem recebe não tem o que fazer com isso.' },
      ]},
      explanation: 'Ele nomeia o que viu e devolve uma pergunta que dá para responder. Comentário bom é o que quem recebe consegue resolver sem perguntar de volta.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 6 — Sugerir, aceitar e rejeitar (requisito 4.4)
     ────────────────────────────────────────────────────────────────────── */
  'm6-teoria': [
    {
      id: 'ES6-M6-Q1', type: 'multiple_choice',
      prompt: 'O que o modo de sugestão faz com o que você digita?',
      data: { options: [
        { id: 'a', text: 'Transforma em proposta, que espera alguém aceitar.', correct: true },
        { id: 'b', text: 'Escreve no documento e avisa o dono.', porque: 'Se escrevesse, seria o modo de edição com um aviso em cima.' },
        { id: 'c', text: 'Guarda num rascunho que só você vê.', porque: 'A proposta é visível para todo mundo que abre o documento. É isso que a torna uma proposta.' },
        { id: 'd', text: 'Escreve num comentário na margem.', porque: 'Comentário fala sobre o texto. A sugestão é o texto novo em si, pronto para entrar.' },
      ]},
      explanation: 'É a marca de revisão do Word vista de outro ângulo: até alguém aceitar, o documento continua dizendo o que dizia.',
    },
    {
      id: 'ES6-M6-Q2', type: 'multiple_choice',
      prompt: 'O que acontece quando alguém aceita uma sugestão de inserir texto?',
      data: { options: [
        { id: 'a', text: 'A marca sai e o texto fica.', correct: true },
        { id: 'b', text: 'A marca fica e o texto entra em outra cor.', porque: 'Marca aceita deixa de existir. Se ficasse, o documento acumularia marcas para sempre.' },
        { id: 'c', text: 'O texto entra e vira um comentário resolvido.', porque: 'Sugestão e comentário são coisas separadas, e aceitar uma não cria a outra.' },
        { id: 'd', text: 'O texto entra e quem sugeriu vira editor.', porque: 'Aceitar uma proposta não muda a permissão de ninguém. São duas decisões diferentes.' },
      ]},
      explanation: 'E rejeitar faz o espelho: o que foi proposto nunca existiu, e o que estava riscado volta inteiro.',
    },
    {
      id: 'ES6-M6-Q3', type: 'multiple_choice',
      prompt: 'Quem consegue aceitar uma sugestão?',
      data: { options: [
        { id: 'a', text: 'Quem tem permissão de edição.', correct: true },
        { id: 'b', text: 'Quem propôs.', porque: 'Se quem propõe pudesse aceitar, o modo de sugestão seria edição com dois cliques em vez de um.' },
        { id: 'c', text: 'Qualquer pessoa com o link.', porque: 'Quem entra por link sem permissão de edição não aceita nada: o nível dele decide, e não o caminho.' },
        { id: 'd', text: 'Só o dono do arquivo.', porque: 'O editor aceita e rejeita. Isso é parte do que a permissão de edição significa.' },
      ]},
      explanation: 'É por isso que os dois níveis existem: quem comenta propõe, e quem edita decide. Separar os dois é a razão inteira do modo de sugestão.',
    },
    {
      id: 'ES6-M6-Q4', type: 'multiple_choice',
      prompt: 'Você abriu o documento de outra pessoa como comentarista e digitou uma correção. Depois fechou. O que ficou no documento?',
      data: { options: [
        { id: 'a', text: 'Uma sugestão esperando alguém aceitar.', correct: true },
        { id: 'b', text: 'A correção aplicada no texto.', porque: 'Comentarista não muda o texto. Foi por isso que o dono escolheu esse nível.' },
        { id: 'c', text: 'Nada: o que você digitou foi descartado ao fechar.', porque: 'Nada se perde. A proposta fica gravada no documento, com o seu nome.' },
        { id: 'd', text: 'Um comentário na margem com o texto que você escreveu.', porque: 'A sugestão aparece no lugar do texto, e não como observação sobre ele.' },
      ]},
      explanation: 'Quem não sabe disso vai embora achando que corrigiu — e a correção fica parada até alguém abrir o documento e olhar a margem.',
    },
    {
      id: 'ES6-M6-Q5', type: 'multiple_choice',
      prompt: 'Quando o modo de sugestão é a escolha certa mesmo no seu próprio documento?',
      data: { options: [
        { id: 'a', text: 'Quando a mudança precisa ser vista pela equipe antes de valer.', correct: true },
        { id: 'b', text: 'Quando você não tem certeza de que quer fazer a mudança.', porque: 'Para isso serve desfazer, que é mais rápido e não deixa marca para ninguém resolver.' },
        { id: 'c', text: 'Quando o documento é longo.', porque: 'O tamanho não muda nada. O que muda é se alguém precisa ver a proposta antes.' },
        { id: 'd', text: 'Quando você quer guardar o texto antigo.', porque: 'Quem guarda o texto antigo é o histórico de versões, e ele guarda sempre, sem ninguém pedir.' },
      ]},
      explanation: 'Trocar um valor combinado em reunião, mexer numa data que outra pessoa checou: a proposta obriga a decisão a passar por quem precisa decidir.',
    },
    {
      id: 'ES6-M6-Q6', type: 'true_false',
      prompt: 'Uma sugestão de apagar deixa o texto na tela, riscado, até alguém decidir.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'O texto riscado continua na tela até alguém decidir, e volta inteiro se a sugestão for rejeitada.' },
      ]},
      explanation: 'E se for rejeitada ele volta inteiro. Nada do que a sugestão faz é definitivo antes da decisão.',
    },
    {
      id: 'ES6-M6-Q7', type: 'multiple_choice',
      prompt: 'Um documento chegou com dezoito sugestões e o botão "Aceitar todas". Por que não usá-lo?',
      data: { options: [
        { id: 'a', text: 'Porque entre as dezoito pode haver uma errada.', correct: true },
        { id: 'b', text: 'Porque ele não funciona com sugestões de pessoas diferentes.', porque: 'Ele funciona com todas. O problema não é técnico.' },
        { id: 'c', text: 'Porque ele apaga o histórico do documento.', porque: 'O histórico continua inteiro. Aceitar tudo é uma edição como qualquer outra.' },
        { id: 'd', text: 'Porque ele precisa de permissão do dono.', porque: 'Qualquer editor o usa, e é justamente essa facilidade que o torna perigoso.' },
      ]},
      explanation: 'Ele existe porque um programa tem todos os comandos. Quem o usa num documento que não leu entrega uma correção errada com a assinatura dele.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 7 — O histórico de versões (requisitos 2.3 e 4.5)
     ────────────────────────────────────────────────────────────────────── */
  'm7-teoria': [
    {
      id: 'ES6-M7-Q1', type: 'multiple_choice',
      prompt: 'O que o histórico de versões guarda?',
      data: { options: [
        { id: 'a', text: 'Como o documento estava, e quem escreveu.', correct: true },
        { id: 'b', text: 'Uma lista de quem abriu o documento.', porque: 'Abrir não entra. Se entrasse, "produzimos juntos" seria verdade para quem só deu uma olhada.' },
        { id: 'c', text: 'Só a versão de ontem e a de hoje.', porque: 'Ele guarda muito mais do que duas. É isso que permite voltar a uma semana atrás.' },
        { id: 'd', text: 'Os comentários que já foram resolvidos.', porque: 'Comentário resolvido fica com o comentário, e não no histórico de versões.' },
      ]},
      explanation: 'É a prova que o requisito 8 pede: quem escreveu aparece, quem só leu não.',
    },
    {
      id: 'ES6-M7-Q2', type: 'multiple_choice',
      prompt: 'Você restaurou a versão de três dias atrás. O que acontece com o que foi escrito depois?',
      data: { options: [
        { id: 'a', text: 'Continua no histórico.', correct: true },
        { id: 'b', text: 'É apagado.', porque: 'Restaurar não destrói nada: ela acrescenta uma versão nova, igual à antiga, no topo da lista.' },
        { id: 'c', text: 'Vira uma cópia separada na pasta.', porque: 'Nenhum arquivo novo aparece. Tudo continua dentro do mesmo histórico.' },
        { id: 'd', text: 'Fica marcado como sugestão para revisar.', porque: 'Restaurar não cria sugestão nenhuma. São dois mecanismos diferentes.' },
      ]},
      explanation: 'É a metade da lição que decide se alguém usa o recurso: quem acha que restaurar destrói o que veio depois nunca restaura, e refaz o trabalho à mão.',
    },
    {
      id: 'ES6-M7-Q3', type: 'multiple_choice',
      prompt: 'Alguém apagou sem querer um parágrafo importante e salvou. Qual é o caminho mais rápido?',
      data: { options: [
        { id: 'a', text: 'Abrir o histórico e restaurar a versão anterior.', correct: true },
        { id: 'b', text: 'Reescrever o parágrafo de memória.', porque: 'Reescrever de memória devolve um parágrafo parecido, e não o que estava lá. Números e datas se perdem assim.' },
        { id: 'c', text: 'Procurar um anexo antigo na caixa de e-mail.', porque: 'O anexo, se existir, é de outra data e não tem as mudanças que vieram depois.' },
        { id: 'd', text: 'Pedir a alguém que ainda esteja com o documento aberto.', porque: 'Quem está com ele aberto vê a mesma versão de agora, já sem o parágrafo.' },
      ]},
      explanation: 'E dá para copiar só o parágrafo da versão antiga, sem restaurar o documento inteiro — que é o caminho que quase ninguém descobre.',
    },
    {
      id: 'ES6-M7-Q4', type: 'multiple_choice',
      prompt: 'Você restaurou uma versão. Como o histórico registra isso?',
      data: { options: [
        { id: 'a', text: 'Com uma versão nova, no seu nome.', correct: true },
        { id: 'b', text: 'Sem registrar nada, porque restaurar não é escrever.', porque: 'Restaurar muda o documento para todo mundo. Se não ficasse registrado, ninguém saberia amanhã quem desfez aquilo.' },
        { id: 'c', text: 'No nome de quem escreveu a versão restaurada.', porque: 'Quem restaurou foi você. Pôr o nome dela diria que ela mexeu no documento hoje.' },
        { id: 'd', text: 'Apagando as versões entre a restaurada e a de agora.', porque: 'Nada é apagado. Elas continuam todas na lista.' },
      ]},
      explanation: 'Restaurar é uma edição, e no dia seguinte a pergunta vai ser quem desfez aquilo.',
    },
    {
      id: 'ES6-M7-Q5', type: 'multiple_choice',
      prompt: 'Três pessoas dizem que escreveram o relatório. Como comprovar a participação de cada uma?',
      data: { options: [
        { id: 'a', text: 'Pelo histórico, que nomeia quem escreveu cada versão.', correct: true },
        { id: 'b', text: 'Pela lista de acesso do arquivo.', porque: 'A lista diz quem podia entrar. Poder entrar e ter escrito são coisas diferentes.' },
        { id: 'c', text: 'Pelos comentários que cada uma deixou.', porque: 'Comentário é opinião sobre o texto. Dá para comentar sem escrever uma linha.' },
        { id: 'd', text: 'Pela data em que cada uma abriu o documento.', porque: 'Abrir não é participar, e a nuvem nem sempre guarda quem abriu.' },
      ]},
      explanation: 'E é por isso que colar o texto das outras duas não funciona: o histórico sai com um nome só.',
    },
    {
      id: 'ES6-M7-Q6', type: 'true_false',
      prompt: 'Dá para dar nome a uma versão do histórico, como "versão entregue à liderança".',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Dar nome a uma versão é o que separa as duas ou três que importam de cem salvas automáticas.' },
      ]},
      explanation: 'É o que separa as duas ou três versões que importam de cem salvas automáticas — e é o que faz alguém achar a certa daqui a um ano.',
    },
    {
      id: 'ES6-M7-Q7', type: 'multiple_choice',
      prompt: 'Por que o histórico existe mesmo num editor que salva sozinho?',
      data: { options: [
        { id: 'a', text: 'Porque não existe um "não salvar" para recusar o erro.', correct: true },
        { id: 'b', text: 'Para economizar espaço, guardando só as diferenças.', porque: 'Ele ocupa mais espaço, e não menos. Guardar várias versões custa.' },
        { id: 'c', text: 'Para o documento poder ser lido sem internet.', porque: 'Ler sem internet é outra coisa, e o histórico não ajuda nisso.' },
        { id: 'd', text: 'Para avisar quando alguém edita.', porque: 'Aviso de edição é notificação. O histórico não avisa: ele guarda.' },
      ]},
      explanation: 'No editor de disco, fechar sem salvar desfaz a besteira. Na nuvem a besteira já está gravada, e o histórico é o único caminho de volta.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 8 — O conflito de edição (requisitos 2.4 e 6)
     ────────────────────────────────────────────────────────────────────── */
  'm8-teoria': [
    {
      id: 'ES6-M8-Q1', type: 'multiple_choice',
      prompt: 'Onde nasce um conflito de edição?',
      data: { options: [
        { id: 'a', text: 'Num arquivo que sincroniza com a pasta do computador.', correct: true },
        { id: 'b', text: 'Num documento aberto por duas pessoas no navegador.', porque: 'Ali é edição simultânea: as duas escritas entram no mesmo arquivo e não há o que resolver.' },
        { id: 'c', text: 'Num arquivo compartilhado com muita gente.', porque: 'O número de pessoas não provoca conflito. O que provoca é haver duas cópias locais.' },
        { id: 'd', text: 'Num arquivo grande demais para a nuvem.', porque: 'Tamanho não tem relação nenhuma com conflito.' },
      ]},
      explanation: 'Alguém edita sem internet, a internet volta, e as duas versões chegam ao servidor ao mesmo tempo.',
    },
    {
      id: 'ES6-M8-Q2', type: 'multiple_choice',
      prompt: 'O que a nuvem faz quando duas versões do mesmo arquivo chegam?',
      data: { options: [
        { id: 'a', text: 'Guarda as duas, e uma delas vira um arquivo ao lado.', correct: true },
        { id: 'b', text: 'Fica com a mais recente.', porque: 'Ficar com a mais recente jogaria fora o trabalho de alguém sem avisar, que é justamente o que ela evita.' },
        { id: 'c', text: 'Junta as duas automaticamente.', porque: 'Juntar texto automaticamente produziria frases que ninguém escreveu. A nuvem não tenta adivinhar.' },
        { id: 'd', text: 'Recusa as duas e pede para escolher.', porque: 'Nada é recusado: as duas já estão gravadas quando alguém percebe.' },
      ]},
      explanation: 'O nome dela traz "cópia em conflito de" e o nome de quem a provocou. Ela fica na mesma pasta do original.',
    },
    {
      id: 'ES6-M8-Q3', type: 'multiple_choice',
      prompt: 'Por que a cópia em conflito é perigosa mesmo sem nada ter sido apagado?',
      data: { options: [
        { id: 'a', text: 'Porque ninguém a abre, e o trabalho dentro dela para ali.', correct: true },
        { id: 'b', text: 'Porque ela ocupa espaço na nuvem.', porque: 'Espaço é o menor dos problemas. O que se perde é o conteúdo que ninguém leu.' },
        { id: 'c', text: 'Porque ela some sozinha depois de alguns dias.', porque: 'Ela fica na pasta indefinidamente, com nome quase igual ao do original.' },
        { id: 'd', text: 'Porque ela sobrescreve o original na próxima sincronização.', porque: 'Ela é um arquivo separado e não toca no original. É por isso que passa despercebida.' },
      ]},
      explanation: 'O trabalho não se perde por ser sobrescrito: se perde por ficar num arquivo que ninguém abre, na mesma pasta, com nome quase igual.',
    },
    {
      id: 'ES6-M8-Q4', type: 'multiple_choice',
      prompt: 'Resolver um conflito exige o quê?',
      data: { options: [
        { id: 'a', text: 'Juntar o que há nas duas e tirar a cópia da pasta.', correct: true },
        { id: 'b', text: 'Apagar a cópia em conflito.', porque: 'Apagar sem juntar joga fora o que a outra pessoa escreveu, que é o que o conflito existia para não deixar acontecer.' },
        { id: 'c', text: 'Renomear a cópia para um nome mais claro.', porque: 'Renomear deixa os dois arquivos na pasta, e o problema era justamente haver dois.' },
        { id: 'd', text: 'Restaurar o original para antes do conflito.', porque: 'Isso joga fora o que as duas pessoas escreveram, e não só o de uma.' },
      ]},
      explanation: 'As duas metades são necessárias. Juntar sem apagar deixa um arquivo quase igual, que alguém vai abrir por engano no mês que vem.',
    },
    {
      id: 'ES6-M8-Q5', type: 'multiple_choice',
      prompt: 'Como evitar conflitos numa equipe que trabalha em vários lugares?',
      data: { options: [
        { id: 'a', text: 'Editando no navegador em vez da pasta sincronizada.', correct: true },
        { id: 'b', text: 'Combinando que só uma pessoa edita por vez.', porque: 'Editar em fila é o que a nuvem veio acabar, e a combinação fura no primeiro dia corrido.' },
        { id: 'c', text: 'Salvando com nomes diferentes.', porque: 'Isso produz de propósito o que o conflito produz por acidente: vários arquivos parecidos.' },
        { id: 'd', text: 'Desligando a sincronização de todo mundo.', porque: 'Sem sincronização ninguém trabalha sem internet, e o arquivo deixa de estar no computador de quem precisa.' },
      ]},
      explanation: 'No navegador o documento é um só e as edições entram juntas. O conflito é uma propriedade da cópia local, e não da nuvem.',
    },
    {
      id: 'ES6-M8-Q6', type: 'true_false',
      prompt: 'Uma cópia em conflito aparece na mesma pasta do arquivo original.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', correct: true },
        { id: 'f', text: 'Falso', porque: 'Ela nasce ao lado do original, na mesma pasta, com o nome dele mais "cópia em conflito de".' },
      ]},
      explanation: 'Com o nome do original mais "cópia em conflito de" e o nome de quem a provocou. É a semelhança dos nomes que faz ninguém reparar.',
    },
    {
      id: 'ES6-M8-Q7', type: 'ordering',
      prompt: 'Ordene o que acontece num conflito de edição, do começo ao fim.',
      data: { items: [
        { id: 'a', text: 'As duas pessoas abrem o mesmo arquivo na pasta sincronizada', order: 1 },
        { id: 'b', text: 'Uma delas perde a internet e continua escrevendo', order: 2 },
        { id: 'c', text: 'A internet volta e as duas versões sobem', order: 3 },
        { id: 'd', text: 'A nuvem guarda as duas, e uma vira cópia em conflito', order: 4 },
        { id: 'e', text: 'Alguém junta o que há nas duas e tira a cópia da pasta', order: 5 },
      ]},
      explanation: 'O passo que quase sempre falta é o último, e ele não avisa: a pasta fica com os dois arquivos e a vida segue.',
    },
  ],

  /* ──────────────────────────────────────────────────────────────────────
     Módulo 9 — O dono, e o combinado da equipe (requisitos 2.5, 4.6 e 7)
     ────────────────────────────────────────────────────────────────────── */
  'm9-teoria': [
    {
      id: 'ES6-M9-Q1', type: 'multiple_choice',
      prompt: 'Qual é a diferença entre ser dono de um arquivo e ter permissão de editá-lo?',
      data: { options: [
        { id: 'a', text: 'O arquivo vive na conta do dono, e some com ela.', correct: true },
        { id: 'b', text: 'Nenhuma: o dono é só o primeiro editor da lista.', porque: 'Se fosse só isso, tirar o dono da lista bastaria. O arquivo está guardado na conta dele.' },
        { id: 'c', text: 'O dono é quem editou por último.', porque: 'Quem editou por último aparece no histórico. Propriedade não muda com edição.' },
        { id: 'd', text: 'O dono é quem tem o arquivo no computador.', porque: 'Ter uma cópia local não dá propriedade de nada. O original continua na conta de quem é dono.' },
      ]},
      explanation: 'Dar permissão de editar a mais três pessoas não muda nada aqui. No dia em que a conta do dono for desligada, os arquivos vão junto.',
    },
    {
      id: 'ES6-M9-Q2', type: 'multiple_choice',
      prompt: 'A secretária do clube é dona de quase todos os arquivos e vai sair no fim do ano. O que fazer antes?',
      data: { options: [
        { id: 'a', text: 'Transferir a propriedade dos arquivos para quem fica.', correct: true },
        { id: 'b', text: 'Dar permissão de edição a toda a diretoria.', porque: 'Edição não é propriedade. Com a conta dela desligada, todos os editores ficam sem arquivo nenhum para editar.' },
        { id: 'c', text: 'Baixar cópias de tudo.', porque: 'Cópias baixadas viram anexos soltos, com os dois problemas do módulo 1 e sem histórico nenhum.' },
        { id: 'd', text: 'Mover tudo para uma pasta compartilhada.', porque: 'Mover muda a pasta, e não o dono. Os arquivos continuam na conta dela.' },
      ]},
      explanation: 'É a quarta pergunta do combinado de trabalho, e a que sempre fica de fora — porque ela só custa caro um ano depois.',
    },
    {
      id: 'ES6-M9-Q3', type: 'multiple_choice',
      prompt: 'Você transferiu a propriedade de um arquivo seu para o Ronaldo. O que acontece com o seu acesso?',
      data: { options: [
        { id: 'a', text: 'Você continua na lista, como editor.', correct: true },
        { id: 'b', text: 'Você perde o acesso.', porque: 'Perder acesso ao transferir faria ninguém transferir nunca, e é exatamente o medo que trava esse gesto.' },
        { id: 'c', text: 'Você vira leitor.', porque: 'O dono anterior não é rebaixado. Ele continua podendo trabalhar no arquivo.' },
        { id: 'd', text: 'Você continua dono junto com ele.', porque: 'Dono é um só. Dois donos seriam a mesma coisa que dois editores, e a distinção sumiria.' },
      ]},
      explanation: 'Transferir não é perder. Quem acha que é, nunca transfere — e o clube fica com tudo na conta de uma pessoa.',
    },
    {
      id: 'ES6-M9-Q4', type: 'multiple_choice',
      prompt: 'O que um combinado de trabalho de equipe precisa responder?',
      data: { options: [
        { id: 'a', text: 'Onde os arquivos ficam, como se chamam, de quem são e quem fica com eles.', correct: true },
        { id: 'b', text: 'Quais programas a equipe usa e em que versão de cada um.', porque: 'Programa muda e o combinado continua valendo. O que ele fixa é onde as coisas ficam e de quem elas são.' },
        { id: 'c', text: 'Quantas horas cada pessoa trabalha e em que dias da semana.', porque: 'Isso é escala de trabalho, e não combinado de arquivos.' },
        { id: 'd', text: 'A senha de cada conta da equipe.', porque: 'Senha nunca entra num documento compartilhado. Ela mora num cofre, que é assunto da CC-ES005.' },
      ]},
      explanation: 'São as quatro perguntas do requisito 7, e a última é a que ninguém escreve — porque ela fala de um dia que ainda não chegou.',
    },
    {
      id: 'ES6-M9-Q5', type: 'multiple_choice',
      prompt: 'Por que o combinado precisa dizer como os arquivos são nomeados?',
      data: { options: [
        { id: 'a', text: 'Porque sem padrão cada pessoa inventa o dela, e nada ordena.', correct: true },
        { id: 'b', text: 'Porque a nuvem exige nomes parecidos.', porque: 'A nuvem aceita qualquer nome. Quem precisa do padrão são as pessoas.' },
        { id: 'c', text: 'Porque nomes longos ocupam mais espaço.', porque: 'O tamanho do nome não muda o tamanho do arquivo em nada que se perceba.' },
        { id: 'd', text: 'Porque o programa não abre arquivos com acento.', porque: 'Acento abre normalmente. Não é disso que o padrão trata.' },
      ]},
      explanation: 'É o mesmo padrão da CC-ES001: data na frente, assunto no meio, versão no fim. O que muda aqui é que ele passa a valer para mais de uma pessoa.',
    },
    {
      id: 'ES6-M9-Q6', type: 'true_false',
      prompt: 'Um arquivo cujo dono saiu da equipe continua disponível para quem tinha permissão de edição.',
      data: { options: [
        { id: 'v', text: 'Verdadeiro', porque: 'A conta do dono some e o arquivo vai junto, por mais gente que tivesse permissão de edição.' },
        { id: 'f', text: 'Falso', correct: true },
      ]},
      explanation: 'A conta some e o arquivo vai junto, por mais gente que tivesse acesso até o dia anterior. É a razão de o requisito 4.6 existir como demonstração.',
    },
    {
      id: 'ES6-M9-Q7', type: 'multiple_choice',
      prompt: 'Qual é o melhor lugar para guardar o combinado de trabalho da equipe?',
      data: { options: [
        { id: 'a', text: 'Na pasta da equipe, com a propriedade de quem fica.', correct: true },
        { id: 'b', text: 'Na nuvem pessoal de quem escreveu.', porque: 'É o combinado prometendo uma coisa e fazendo outra: ele some no dia em que essa pessoa sair.' },
        { id: 'c', text: 'Num grupo de mensagens, fixado no alto.', porque: 'Mensagem fixada some na troca de grupo e não tem histórico de versões nem permissão.' },
        { id: 'd', text: 'Impresso, na pasta de documentos da secretaria.', porque: 'Papel não se atualiza, e o combinado muda toda vez que a equipe muda.' },
      ]},
      explanation: 'O combinado que responde onde os arquivos ficam precisa estar no lugar que ele mesmo indica. Guardá-lo em outro lugar é a primeira exceção à própria regra.',
    },
  ],
};
