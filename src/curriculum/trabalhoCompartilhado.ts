import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_COMPARTILHADO } from './questoesDoCompartilhado';

/*
 * A vereda CC-ES006 Trabalho Compartilhado.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * Nenhum documento do clube é de uma pessoa só. A escala das unidades, o
 * combinado do acampamento, a lista de materiais, a ata da reunião: todos
 * passam por três ou quatro mãos antes de valer. O que muda entre um clube
 * que trabalha junto e um que se atrapalha o ano inteiro não é esforço — é
 * saber quatro ou cinco coisas sobre como um arquivo compartilhado funciona.
 *
 * ── Por que ela exige duas veredas ──────────────────────────────────────
 * Está escrito no requisito 1, e é a primeira vereda com duas: a CC-ES002,
 * porque o documento daqui é o documento de lá — os mesmos trechos, os mesmos
 * comentários, as mesmas marcas de revisão; e a CC-ES005, porque compartilhar
 * é decidir quem entra, e quem não sabe o que é uma conta não tem o que
 * decidir.
 *
 * ── E o que carrega esta vereda é o que parece resolvido ────────────────
 * Dar permissão de editar parece dar a conta; não dá — quando o dono sai, os
 * arquivos vão com ele. Marcar um arquivo como restrito dentro de uma pasta
 * compartilhada parece restringi-lo; não restringe. Mandar o anexo parece a
 * mesma coisa que mandar o vínculo; é, no dia em que se manda. E restaurar uma
 * versão antiga parece apagar as novas; não apaga, e é por medo disso que
 * ninguém restaura.
 *
 * Nenhuma das quatro dá erro em lugar nenhum. A pasta abre, os arquivos abrem,
 * e todo mundo acha o que procura — que é a mesma razão da CC-ES004 e da
 * CC-ES005, com outro assunto.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ────────────────────────────────────────────────────────────────────────
   Módulo 1 — Anexo ou vínculo (requisito 3)
   ──────────────────────────────────────────────────────────────────────── */

const ANEXO_OU_VINCULO: TopicoDeVereda[] = [
  t(
    'o-que-o-anexo-produz',
    'O anexo produz um segundo arquivo',
    'E ele passa a ser de quem recebeu.',
    [
      'Mandar um arquivo por anexo é o gesto mais natural que existe: você escolhe o arquivo, clica em enviar, e ele chega. Não há nada de errado nisso — o que quase ninguém repara é no que foi enviado.',
      'O que saiu não foi o seu arquivo. Foi uma cópia dele, do jeito que ele estava naquele segundo. A partir daí são dois arquivos: o seu, na sua nuvem, e o dela, no computador dela.',
      'Os dois começam idênticos, e é por isso que o anexo parece inofensivo. A diferença só aparece quando alguém escreve — e aí não há nada ligando um ao outro para avisar.',
      'Compartilhar o vínculo faz o contrário: continua existindo um arquivo só, e a outra pessoa entra nele. Quem abre lê o que está escrito agora, e não o que estava escrito no dia em que alguém mandou.',
    ],
    `O mesmo arquivo, mandado de dois jeitos

Por anexo:
  a sua lista  →  [cópia]  →  a lista dela
  Você escreve na sua. A dela continua igual.

Por vínculo:
  a sua lista  ←  ela entra aqui
  Você escreve. Ela vê, na hora em que abrir.`,
    'O anexo é a escolha certa quando o documento está pronto e não muda mais: a ficha assinada, o recibo, o PDF do ano passado.',
    ['anexo', 'vínculo', 'cópia'],
  ),
  t(
    'os-dois-problemas',
    'Os dois problemas do anexo',
    'As versões que discordam, e a cópia que não se tira mais.',
    [
      'O primeiro é o que todo clube já viveu: em pouco tempo há duas versões da mesma lista, e ninguém sabe qual vale. Nenhuma das duas está errada — é isso que faz a confusão durar semanas.',
      'O sinal, na pasta, são nomes quase iguais com datas diferentes: lista-final, lista-final-2, lista-final-revisada. Cada um deles foi alguém tentando resolver isso sozinho.',
      'O segundo é mais quieto. Quem recebeu um anexo fica com ele para sempre. Você pode tirar o acesso dessa pessoa ao arquivo compartilhado; a cópia continua na nuvem dela, e nada do que você faça a alcança.',
      'É a mesma lição de que tirar o acesso de alguém a um cofre de senhas não faz essa pessoa esquecer as senhas que ela decorou. O gesto de retirar alcança o original, e só ele.',
    ],
    `A pasta de um clube que manda anexo

  circular-acampamento.docx            12 de junho
  circular-acampamento-final.docx      14 de junho
  circular-acampamento-final2.docx     14 de junho
  circular-acampamento-corrigida.docx  15 de junho

Qual delas foi para as famílias? Ninguém sabe.`,
    'Se a circular sair por anexo para sessenta famílias e a data estiver errada, são sessenta cópias erradas. Com o vínculo, corrigir o original corrige o que as sessenta abrem.',
    ['duas versões', 'tirar o acesso', 'cópia solta'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 2 — Os três níveis de permissão (requisitos 2.2 e 4.1)
   ──────────────────────────────────────────────────────────────────────── */

const OS_TRES_NIVEIS: TopicoDeVereda[] = [
  t(
    'os-tres',
    'Leitura, comentário e edição',
    'Três coisas diferentes, e não três graus de confiança.',
    [
      'Quem tem leitura abre o arquivo e baixa uma cópia dele. Nada do que essa pessoa fizer chega ao documento.',
      'Quem tem comentário faz tudo isso, mais duas coisas: escreve observações na margem e propõe alterações. O que ele escreve no texto não muda o texto — vira proposta, e espera alguém aceitar.',
      'Quem tem edição escreve direto, aceita e rejeita propostas, e convida mais gente. É por isso que a lista de acesso de um arquivo cresce sozinha: qualquer editor pode convidar, e quase ninguém revisa a lista depois.',
      'O que separa os três não é o quanto se confia na pessoa: é o que ela vai fazer. A Cleide, que só vai ler a lista no portão no dia, precisa de leitura — não porque se confie menos nela, mas porque ler é o que ela vai fazer.',
    ],
    `O que cada nível não deixa fazer

Leitura       não escreve, não comenta, não sugere.
Comentário    não muda o texto: o que escrever vira sugestão.
Edição        não apaga o arquivo para todos nem passa a
              propriedade dele — isso é de quem é dono.`,
    'Dar edição "por precaução" é como se apaga uma linha sem querer. Quem precisar corrigir alguma coisa pede, e leva dez segundos.',
    ['leitura', 'comentário', 'edição'],
  ),
  t(
    'o-acesso-geral',
    'O acesso geral é outra porta',
    'E ela não olha a lista de ninguém.',
    [
      'Além da lista de pessoas, toda nuvem tem um segundo ajuste, que costuma se chamar acesso geral: restrito, ou qualquer pessoa com o link.',
      'Ele não disputa com a lista — ele abre uma porta ao lado. Com o link aberto para editar, os três níveis que você acabou de escolher continuam escritos na caixa, certinhos, e não valem nada: quem tiver o endereço entra e escreve.',
      'E endereço é a coisa mais fácil de vazar que existe. Ele circula por mensagem, por captura de tela, por encaminhamento — e ninguém precisa invadir nada para ter um.',
      '"Qualquer pessoa com o link" tem lugar: um documento que se quer público, uma inscrição que qualquer família preenche. O que ele não pode é ser o jeito de não ter de escrever três endereços.',
    ],
    `A caixa depois de tudo escolhido

Pessoas com acesso
  Marta      Editor
  Ronaldo    Comentarista
  Cleide     Leitor

Acesso geral
  Qualquer pessoa com o link   Editor   ←  isto anula os três`,
    'A caixa continua mostrando os três papéis do jeito que você os deixou. Nada nela diz que eles deixaram de valer.',
    ['acesso geral', 'link', 'restrito'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 3 — A pasta manda no que está dentro (requisito 5)
   ──────────────────────────────────────────────────────────────────────── */

const A_PASTA_MANDA: TopicoDeVereda[] = [
  t(
    'a-heranca',
    'A permissão da pasta alcança o que está dentro',
    'Inclusive o que for posto lá depois.',
    [
      'Compartilhar pasta é o que se faz quando são muitos arquivos, e é a coisa mais prática que a nuvem tem. Quem recebe a pasta recebe tudo que está dentro — hoje e amanhã.',
      'O "e amanhã" é a metade que quase ninguém pensa. Arrastar um arquivo para dentro de uma pasta compartilhada é publicá-lo para todo mundo que tem aquela pasta, e arrastar é o gesto mais casual que existe.',
      'Quando a permissão da pasta e a do arquivo discordam, vence a **mais permissiva**. A nuvem não escolhe a mais fechada: ela soma os caminhos e fica com o que deixa mais.',
      'O efeito é o que ninguém espera: um arquivo marcado como restrito, dentro de uma pasta compartilhada com o clube inteiro, **não está restrito**. A caixa dele continua dizendo que está.',
    ],
    `Clube Pioneiros            compartilhada com 3 pessoas
  └── Acampamento de julho
        └── Fichas médicas 2026    "Restrito"

A caixa da ficha diz: nenhuma pessoa convidada.
Quem abre a ficha: as três.`,
    'Tirar o nome de cada pessoa da caixa do arquivo não fecha nada, porque não há nome nenhum lá: quem entra, entra pela pasta. Quem não move, não fecha.',
    ['herança', 'pasta compartilhada', 'mais permissiva'],
  ),
  t(
    'onde-isso-aparece',
    'A nuvem mostra isso, recolhido',
    'E é por isso que ninguém vê.',
    [
      'A informação existe. Na caixa de compartilhar de um arquivo herdado há uma linha dizendo quantas pessoas entram por uma pasta, com uma seta para abrir.',
      'Ninguém clica nessa seta. E a lista de arquivos — que é onde se passa o dia — não diz nada: ela mostra nome, dono e data, e o acesso efetivo não aparece em coluna nenhuma.',
      'Então o gesto que o requisito 5 manda demonstrar é esse: abrir a caixa de um arquivo que está dentro de uma pasta compartilhada e ler quem entra por ela. Uma vez que se sabe que a linha existe, ela é fácil.',
      'O conserto de um arquivo que não devia estar aberto é **movê-lo**, e não fechar a pasta: a pasta é onde o clube trabalha, e fechá-la resolve um problema criando outro.',
    ],
    `A linha que quase ninguém abre

  Pessoas com acesso
    Marta (proprietária)

  › 3 pessoas têm acesso pela pasta Clube Pioneiros

Clicando na seta, aparecem os nomes e o papel de cada um.`,
    'Nome completo e dado de saúde de criança num arquivo cuja caixa diz que ninguém foi convidado. Nada estourou, nada avisou.',
    ['caixa de compartilhar', 'mover', 'acesso efetivo'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 4 — Escrever ao mesmo tempo (requisitos 2.1 e 4.2)
   ──────────────────────────────────────────────────────────────────────── */

const ESCREVER_JUNTO: TopicoDeVereda[] = [
  t(
    'edicao-simultanea',
    'Duas pessoas, um arquivo, ao mesmo tempo',
    'E nenhuma esperando a outra sair.',
    [
      'Edição simultânea é duas ou mais pessoas escrevendo no mesmo arquivo ao mesmo tempo. As duas escritas entram, cada uma onde foi feita, e não há nada para resolver depois.',
      'É o contrário do arquivo no pen drive, que passa de mão em mão: lá, a segunda pessoa a salvar apaga o trabalho da primeira, sem nada avisar.',
      'Não há botão de salvar. O que se digita já está gravado — e é justamente por isso que o histórico de versões existe, porque não há um "fechar sem salvar" para recusar uma besteira.',
      'Quem está dentro aparece nas bolhas do alto, com as iniciais, e o cursor de cada pessoa aparece no meio do texto, com o nome dela. As duas coisas somem quando a pessoa fecha: elas falam deste instante, e não do arquivo.',
    ],
    `O que cada coisa da tela diz

Bolhas no alto         quem está com o documento aberto agora
Cursor colorido        onde essa pessoa está escrevendo
Lista de acesso        quem pode abrir, esteja aqui ou não
Histórico de versões   quem já escreveu, algum dia`,
    'Três coisas parecidas que respondem perguntas diferentes: agora, pode, e já escreveu. Confundi-las é o que faz alguém achar que "todo mundo participou" olhando a lista de acesso.',
    ['edição simultânea', 'bolhas', 'cursor'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 5 — Comentar e resolver (requisito 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const COMENTAR: TopicoDeVereda[] = [
  t(
    'o-comentario',
    'Dizer algo sobre o texto sem mexer no texto',
    'E preso ao trecho de que se está falando.',
    [
      'O comentário vive numa margem ao lado do papel, e não dentro dele. É por isso que ele não sai na impressão e não empurra o texto — as duas coisas que fariam um comentário atrapalhar.',
      'E ele fica preso ao trecho de que fala. É essa a diferença entre comentar e mandar um recado por mensagem: no recado, ninguém sabe a que parte do documento ele se referia.',
      'Comentário bom nomeia o que se viu e devolve uma pergunta que dá para responder. "A data aqui diz 17 e no parágrafo 4 diz 19, qual vale?" é revisão. "Isto está errado" é uma segunda pergunta.',
      'A conversa continua no balão: quem escreveu responde, e a decisão fica guardada junto do trecho que a provocou. Daqui a seis meses é ali que alguém vai procurar por que a data ficou sendo 19.',
    ],
    `Onde o comentário fica

  ┌─────────────────────────┐   ┌──────────────────┐
  │  A saída é no dia 17    │←──│ Marta            │
  │  de julho, sexta-feira. │   │ E no parágrafo 4 │
  │                         │   │ diz 19. Qual é?  │
  └─────────────────────────┘   └──────────────────┘
        o papel                     a margem`,
    'Ele fica fora do papel de propósito: dentro, sairia na impressão e mudaria a paginação do documento.',
    ['comentário', 'margem', 'responder'],
  ),
  t(
    'resolver-nao-e-apagar',
    'Resolver não é apagar',
    'Os dois somem da margem, e é aí que se confundem.',
    [
      'Resolver diz que o assunto se encerrou: o balão sai da vista de quem só lê, e continua guardado para quem procurar.',
      'Apagar faz o comentário deixar de existir. A pergunta e a decisão que ela provocou vão junto — e é isso que alguém vai procurar no ano que vem.',
      'Resolver é um clique, e responder não. É essa diferença de esforço que faz tanta gente só resolver — e quem perguntou fica achando que ninguém leu.',
      'Vale para o outro lado também: rejeitar uma proposta em silêncio devolve o documento com a proposta sumida, e quem propôs não sabe se você discordou ou se nem viu. As duas coisas ficam iguais na tela dela.',
    ],
    `Os dois botões do balão, e o que sobra atrás

Resolver   o balão sai da margem     a conversa fica guardada
Excluir    o balão sai da margem     não há o que procurar depois`,
    'Antes de resolver uma pergunta, responda. Fechar o assunto sem dizer nada a quem perguntou é a versão em conversa de "zero link não é zero link quebrado".',
    ['resolver', 'excluir', 'responder'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 6 — Sugerir, aceitar e rejeitar (requisito 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const SUGERIR: TopicoDeVereda[] = [
  t(
    'modo-de-sugestao',
    'O modo de sugestão',
    'O que se digita vira proposta, e espera alguém decidir.',
    [
      'No editor de navegador há um seletor no canto direito da barra: Edição, Sugestão, Visualização. É ele que decide o que acontece com o que você digita.',
      'Em modo de Sugestão o documento continua dizendo o que dizia. O que você escreveu aparece marcado, com o seu nome, e fica esperando. Aceitar tira a marca e deixa o texto; rejeitar faz o contrário — o que foi proposto nunca existiu, e o que estava riscado volta inteiro.',
      'Quem tem permissão de comentário está sempre nesse modo, queira ou não. Digitar no documento de outra pessoa não muda o texto dela: vira proposta. Quem não sabe disso fecha o documento achando que corrigiu.',
      'E aceitar é de quem tem edição. Se quem propõe pudesse aceitar, o modo de sugestão seria edição com dois cliques — a separação entre propor e decidir é a razão inteira de ele existir.',
    ],
    `O mesmo gesto, nos três modos

Edição          você digita   →  o texto muda
Sugestão        você digita   →  vira proposta marcada
Visualização    você digita   →  não acontece nada`,
    'O seletor fica escondido no canto da barra, e é por isso que o requisito 4.4 manda demonstrá-lo: quem nunca o procurou não sabe que ele existe.',
    ['modo de sugestão', 'aceitar', 'rejeitar'],
  ),
  t(
    'aceitar-todas',
    'O botão que aceita todas',
    'Ele existe, e usá-lo sem ler é assinar o que não se leu.',
    [
      'Um documento pode voltar com dezoito sugestões, e há um botão que aceita as dezoito de uma vez. Ele existe porque um programa tem todos os comandos.',
      'Entre as dezoito pode haver uma errada. Quem aceita tudo sem ler entrega o documento com a correção errada dentro, e a assinatura de quem aceitou.',
      'O caminho é percorrer uma a uma. É mais lento, e é o único que mostra cada proposta antes de ela valer — que é justamente o que o modo de sugestão existe para permitir.',
      'Rejeitar uma proposta pede uma palavra junto. Sem ela, quem propôs vê a proposta sumir e não sabe por quê.',
    ],
    `O que o botão grosso faz

Aceitar todas   →  18 propostas entram, inclusive a errada
Uma a uma       →  18 decisões, e você viu cada uma`,
    'É o mesmo par do Substituir Tudo da CC-ES002: o botão rápido está lá, e a lição é saber quando ele não serve.',
    ['aceitar todas', 'rejeitar', 'revisar'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 7 — O histórico de versões (requisitos 2.3 e 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const O_HISTORICO: TopicoDeVereda[] = [
  t(
    'o-que-ele-guarda',
    'Como o documento estava, e quem escreveu',
    'Ler não entra. Escrever, sim.',
    [
      'O histórico guarda o documento inteiro em cada momento, e ao lado de cada versão os nomes de quem escreveu nela.',
      'Quem só abriu não entra, e é de propósito: um histórico que contasse leitura deixaria "produzimos juntos" verdadeiro para quem só deu uma olhada — e deixaria também para o caso que de fato acontece, o de uma pessoa colar o texto das outras duas e o histórico dizer um nome só.',
      'É por isso que ele é a prova que o requisito 8 pede. Três pessoas escreveram o relatório: o histórico nomeia as três, em versões diferentes, e não há como fabricar isso depois.',
      'Dá para dar nome a uma versão — "versão entregue à liderança" —, e é o que separa as duas ou três que importam de cem salvas automáticas.',
    ],
    `O painel de versões

  5 de julho, 20:15  (versão atual)
    ● Você
  3 de julho, 09:40
    ● Marta   ● Ronaldo
  1 de julho, 20:12
    ● Marta`,
    'Colar o texto das outras duas pessoas produz um histórico com um nome só. O requisito 8 pede a participação de cada uma, e é aqui que ela aparece ou não.',
    ['histórico', 'versão', 'quem escreveu'],
  ),
  t(
    'restaurar-nao-apaga',
    'Restaurar não apaga o que veio depois',
    'Ela acrescenta uma versão.',
    [
      'Restaurar uma versão antiga não destrói as novas: a nuvem grava uma versão nova, igual à antiga, no topo da lista. Tudo continua lá.',
      'Esta é a metade da lição que decide se alguém usa o recurso. Quem acha que restaurar destrói o que veio depois nunca restaura — prefere refazer o trabalho à mão, e perde a tarde.',
      'E quem restaura entra no histórico, porque restaurar é uma edição: ela muda o documento para todo mundo, e no dia seguinte a pergunta vai ser quem desfez aquilo.',
      'Nem sempre é preciso restaurar o documento inteiro. Dá para abrir a versão antiga, copiar só o parágrafo que sumiu e colar no de hoje — que é o caminho que quase ninguém descobre.',
    ],
    `Antes e depois de restaurar a versão de 3 de julho

antes                        depois
  8 de julho  (atual)          hoje  (atual, restaurada)
  3 de julho                   8 de julho
  1 de julho                   3 de julho
                               1 de julho`,
    'Num editor que salva sozinho não existe "fechar sem salvar". A besteira já está gravada, e o histórico é o único caminho de volta.',
    ['restaurar', 'não apaga', 'versão nova'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 8 — O conflito de edição (requisitos 2.4 e 6)
   ──────────────────────────────────────────────────────────────────────── */

const O_CONFLITO: TopicoDeVereda[] = [
  t(
    'onde-ele-nasce',
    'O conflito é do arquivo sincronizado',
    'No navegador não existe conflito nenhum.',
    [
      'Num documento aberto no navegador as duas edições entram no mesmo arquivo, e não há o que conflitar. Isso é edição simultânea, e é o módulo 4.',
      'O conflito é de outra coisa: da pasta que sincroniza com o computador, aquela que põe os arquivos da nuvem dentro de uma pasta do Windows e os sobe sozinha.',
      'Alguém abre o arquivo por ali e perde a internet. Continua escrevendo — o arquivo está no computador dela. Quando a internet volta, a versão dela sobe, e a sua também já subiu.',
      'A nuvem não escolhe entre as duas: ela **guarda as duas**. A segunda vira um arquivo ao lado, com "(cópia em conflito de Fulano)" no nome, na mesma pasta do original.',
    ],
    `A pasta depois do conflito

  Escala das unidades.docx
  Escala das unidades (cópia em conflito de Marta).docx

Os dois abrem. Os dois têm texto. Nenhum dos dois é o certo.`,
    'Guardar as duas é o comportamento generoso: ficar com a mais recente jogaria fora o trabalho de alguém sem avisar. O preço é que alguém precisa juntá-las.',
    ['conflito', 'sincronizado', 'cópia em conflito'],
  ),
  t(
    'como-se-resolve',
    'Resolver pede as duas metades',
    'Juntar, e tirar a cópia da frente.',
    [
      'Apagar a cópia sem juntar joga fora o que a outra pessoa escreveu — que é exatamente o que o conflito existia para não deixar acontecer.',
      'E juntar sem apagar a cópia deixa na pasta um arquivo quase igual, com nome quase igual, que alguém vai abrir por engano no mês que vem e trabalhar nele.',
      'É por isso que o trabalho se perde num conflito sem nada ter sido apagado: ele fica num arquivo que ninguém abre. O problema não é destruição, é abandono.',
      'O jeito de não ter conflito é não trabalhar pela pasta sincronizada quando mais de uma pessoa vai escrever. No navegador o documento é um só, e o conflito é uma propriedade da cópia local.',
    ],
    `Os dois caminhos errados, e o certo

  apagar a cópia            →  perde-se o que ela escreveu
  deixar as duas na pasta   →  alguém trabalha na errada
  juntar e tirar a cópia    →  um arquivo, com tudo dentro`,
    'A cópia em conflito costuma ir para a lixeira, e não sumir: ela fica lá trinta dias, caso alguém perceba que faltou alguma coisa na junção.',
    ['juntar', 'lixeira', 'resolver'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Módulo 9 — O dono, e o combinado da equipe (requisitos 2.5, 4.6, 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

const O_DONO_E_O_COMBINADO: TopicoDeVereda[] = [
  t(
    'dono-nao-e-editor',
    'Ser dono não é ter permissão de editar',
    'O arquivo vive na conta do dono, e some com ela.',
    [
      'Todo arquivo da nuvem tem um dono, e é **um só**. É na conta dele que o arquivo está guardado, por mais gente que tenha acesso.',
      'Dar permissão de editar a mais três pessoas não muda nada nisso. No dia em que a conta do dono for desligada — a pessoa saiu do clube, trocou de e-mail, a conta da escola dela expirou —, os arquivos vão junto, com todo mundo tendo tido acesso até a véspera.',
      'Passar a propriedade é um gesto separado, e fica escondido: no seletor de papel daquela pessoa, junto de Leitor, Comentarista e Editor, há uma opção de transferir propriedade.',
      'E transferir não é perder. Quem entrega a propriedade continua na lista, como editor — numa nuvem de verdade o dono anterior não some. Quem acha que perde, nunca transfere, e o clube fica com tudo na conta de uma pessoa.',
    ],
    `O que acontece quando a conta do dono é desligada

  Escala das unidades      dono: Marta
    Você      Editor
    Ronaldo   Editor
    Cleide    Leitor

  A conta da Marta sai  →  o arquivo sai junto, para os quatro.`,
    'É a conta mais fácil de fazer e a mais fácil de esquecer: quantos arquivos do clube estão na conta pessoal de uma pessoa só?',
    ['proprietário', 'transferir propriedade', 'conta'],
  ),
  t(
    'o-combinado',
    'O combinado de trabalho da equipe',
    'Quatro perguntas, e a última é a que ninguém escreve.',
    [
      'Onde ficam os arquivos. Não "na nuvem": em que pasta, de quem, dentro de que estrutura. Arquivo solto na nuvem de uma pessoa é arquivo que some com ela.',
      'Como eles são nomeados. É o mesmo padrão da vereda de arquivos — data na frente, assunto no meio, versão no fim —, e o que muda aqui é que ele passa a valer para mais de uma pessoa. Sem padrão, cada uma inventa o dela e nada ordena.',
      'Quem detém cada permissão. Quem edita, quem comenta, quem lê — e por quê, para que a próxima diretoria não tenha de adivinhar.',
      'E o que acontece quando alguém deixa a equipe. Esta é a que fica de fora, porque fala de um dia que ainda não chegou — e é a que custa caro quando chega. A resposta dela é a propriedade passando para quem fica, antes de a conta ser desligada.',
    ],
    `As quatro perguntas, e onde o combinado mora

  1. Onde ficam os arquivos?
  2. Como são nomeados?
  3. Quem detém cada permissão?
  4. O que acontece quando alguém sai?

  O combinado fica na pasta que ele mesmo indica —
  e com a propriedade de quem fica.`,
    'Guardar o combinado na nuvem pessoal de quem o escreveu é a primeira exceção à própria regra dele: no dia em que essa pessoa sair, ele some junto.',
    ['combinado', 'padrão de nome', 'quem fica'],
  ),
];

/* ────────────────────────────────────────────────────────────────────────
   Os nove módulos
   ──────────────────────────────────────────────────────────────────────── */

export const MODULOS_DO_COMPARTILHADO: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Anexo ou vínculo',
    resumo: 'O que sai quando se manda um anexo, e os dois problemas que isso cria.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m1-teoria'],
        perguntas: 4,
        titulo: 'O anexo produz um segundo arquivo',
        resumo: 'E ele é de quem recebeu, para sempre.',
        topicos: ANEXO_OU_VINCULO,
      },
      {
        id: 'm1-lab', tipo: 'nuvem', licao: 'anexo',
        titulo: 'Mandando a lista dos dois jeitos',
        resumo: 'A cópia que fica para trás, e o vínculo que é um arquivo só.',
        verificacoes: ['mandou-anexo', 'as-duas-discordam', 'a-copia-nao-volta', 'vinculo-para-ronaldo'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'Os três níveis de permissão',
    resumo: 'Leitura, comentário e edição — e o acesso geral, que é outra porta.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m2-teoria'],
        perguntas: 4,
        titulo: 'Três coisas, e não três graus de confiança',
        resumo: 'O que cada nível não deixa fazer, que é o que os separa.',
        topicos: OS_TRES_NIVEIS,
      },
      {
        id: 'm2-lab', tipo: 'nuvem', licao: 'niveis',
        titulo: 'Dando a cada um o nível do trabalho dele',
        resumo: 'Três níveis distintos no mesmo documento, e o link fechado.',
        verificacoes: ['tres-distintos', 'cada-um-o-seu', 'viu-o-que-nao-deixa'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'A pasta manda no que está dentro',
    resumo: 'Como a permissão de uma pasta alcança os arquivos dela, e vence a deles.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m3-teoria'],
        perguntas: 4,
        titulo: 'O arquivo restrito que está aberto',
        resumo: 'Vence a permissão mais permissiva, e a caixa do arquivo não diz isso.',
        topicos: A_PASTA_MANDA,
      },
      {
        id: 'm3-lab', tipo: 'nuvem', licao: 'pasta',
        titulo: 'Compartilhando a pasta, e achando o que ela abriu',
        resumo: 'A ficha médica que três pessoas leem sem terem sido convidadas.',
        verificacoes: ['compartilhou-a-pasta', 'viu-alcancar', 'viu-quem-ja-entrava', 'tirou-a-ficha-de-la'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'Escrever ao mesmo tempo',
    resumo: 'Duas pessoas no mesmo arquivo, sem uma esperar a outra sair.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m4-teoria'],
        perguntas: 4,
        titulo: 'As duas edições entram',
        resumo: 'E as bolhas, o cursor, a lista e o histórico respondem perguntas diferentes.',
        topicos: ESCREVER_JUNTO,
      },
      {
        id: 'm4-lab', tipo: 'nuvem', licao: 'juntos',
        titulo: 'Escrevendo a escala junto com a Marta',
        resumo: 'A sua linha, a dela, e o histórico nomeando os dois.',
        verificacoes: ['voce-escreveu', 'marta-escreveu', 'historico-diz-os-dois', 'viu-quem-esta-junto'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'Comentar e resolver',
    resumo: 'Dizer algo sobre o texto sem mexer nele, e fechar o assunto sem calar ninguém.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m5-teoria'],
        perguntas: 4,
        titulo: 'Resolver não é apagar',
        resumo: 'E resolver sem responder fecha o assunto sem dizer nada a quem perguntou.',
        topicos: COMENTAR,
      },
      {
        id: 'm5-lab', tipo: 'nuvem', licao: 'comentarios',
        titulo: 'Respondendo a Marta, e deixando o seu',
        resumo: 'A pergunta dela respondida antes de resolvida, e uma observação sua.',
        verificacoes: ['respondeu-a-marta', 'resolveu-o-dela', 'comentou-no-seu'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Sugerir, aceitar e rejeitar',
    resumo: 'O modo em que o que se digita vira proposta, e quem decide por ela.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m6-teoria'],
        perguntas: 4,
        titulo: 'Propor não é escrever',
        resumo: 'Quem comenta está sempre nesse modo, e quem não sabe acha que editou.',
        topicos: SUGERIR,
      },
      {
        id: 'm6-lab', tipo: 'nuvem', licao: 'sugestao',
        titulo: 'Propondo duas, aceitando uma e rejeitando a outra',
        resumo: 'E vendo o que acontece ao digitar no documento de quem não deu edição.',
        verificacoes: [
          'viu-o-comentarista-nao-editar', 'propos-em-sugestao', 'aceitou-uma', 'rejeitou-a-outra',
        ],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'O histórico de versões',
    resumo: 'Como o documento estava, quem escreveu, e por que restaurar não apaga nada.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m7-teoria'],
        perguntas: 4,
        titulo: 'Restaurar acrescenta, e não apaga',
        resumo: 'É a metade que decide se alguém usa o recurso ou refaz o trabalho à mão.',
        topicos: O_HISTORICO,
      },
      {
        id: 'm7-lab', tipo: 'nuvem', licao: 'historico',
        titulo: 'Achando na ata o parágrafo que sumiu',
        resumo: 'A versão que ainda tinha as decisões, restaurada sem perder a de cima.',
        verificacoes: ['achou-a-versao', 'restaurou', 'o-historico-diz-quem'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'O conflito de edição',
    resumo: 'O que acontece quando duas versões do mesmo arquivo sincronizado sobem juntas.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m8-teoria'],
        perguntas: 4,
        titulo: 'A nuvem guarda as duas',
        resumo: 'E o trabalho se perde num arquivo que ninguém abre, com nome quase igual.',
        topicos: O_CONFLITO,
      },
      {
        id: 'm8-lab', tipo: 'nuvem', licao: 'conflito',
        titulo: 'Provocando o conflito e resolvendo',
        resumo: 'Juntar o que há nas duas, e só então tirar a cópia da pasta.',
        verificacoes: ['provocou', 'achou-a-copia', 'juntou', 'tirou-a-copia'],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'O dono, e o combinado da equipe',
    resumo: 'Por que dar edição não é dar a conta, e o que a equipe precisa deixar escrito.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DO_COMPARTILHADO['m9-teoria'],
        perguntas: 4,
        titulo: 'O arquivo vive na conta do dono',
        resumo: 'E as quatro perguntas do combinado, com a que ninguém escreve no fim.',
        topicos: O_DONO_E_O_COMBINADO,
      },
      {
        id: 'm9-lab', tipo: 'nuvem', licao: 'combinado',
        titulo: 'Escrevendo o combinado, a seis mãos',
        resumo: 'As quatro respostas, os três nomes no histórico, e a propriedade de quem fica.',
        verificacoes: ['quatro-respostas', 'tres-maos', 'guardou-na-pasta', 'passou-a-propriedade'],
      },
    ],
  },
];
