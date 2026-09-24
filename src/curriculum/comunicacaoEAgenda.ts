import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DA_COMUNICACAO } from './questoesDaComunicacao';

/*
 * A vereda CC-ES007 Comunicação e Agenda.
 *
 * ── O que ela é ─────────────────────────────────────────────────────────
 * Um clube funciona por duas coisas: mensagens que as pessoas entendem e um
 * calendário em que elas confiam. Quando qualquer das duas falha, ninguém
 * percebe de imediato — a mensagem foi entregue, o evento está na agenda, e o
 * estrago aparece na véspera, com metade do clube no lugar errado.
 *
 * ── Por que ela exige a CC-ES005 ────────────────────────────────────────
 * Está no requisito 1, e a razão é a resposta automática de ausência: ela é a
 * única mensagem que você escreve para **quem quer que escreva**, inclusive
 * para quem atirou no escuro. Quem não sabe o que é uma conta e o que se conta
 * a desconhecidos escreve nela que a casa está vazia.
 *
 * ── E o que carrega esta vereda é o que não dá erro ─────────────────────
 * Cinquenta endereços entregues a cinquenta pessoas: a mensagem chegou. Um
 * convite num endereço errado: a lista diz "aguardando", igual a quem não
 * decidiu. Um evento criado no fuso de Brasília para quem combinou no do
 * Acre: as duas agendas concordam, e a pessoa entra duas horas antes. Uma
 * resposta automática sem data de fim: ela responde em março, correta e
 * velha. Uma lista de unidade que ninguém revisa: ela entrega, certinha, para
 * as pessoas de antes.
 *
 * Nenhuma dessas telas parece errada, e é essa a matéria.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/* ── Módulo 1 — Cópia oculta (requisitos 2.1 e 3) ─────────────────────────── */

const COPIA_OCULTA: TopicoDeVereda[] = [
  t(
    'os-tres-campos',
    'Três campos, três coisas diferentes',
    'Para, Cc e Cco não são três lugares para o mesmo endereço.',
    [
      'Toda mensagem tem três campos de destinatário, e eles não são o mesmo campo repetido. Para é de quem precisa fazer alguma coisa — responder, providenciar, decidir. Cc é de quem só precisa ficar sabendo. Cco é de quem precisa receber sem aparecer.',
      'Quem está no Para e no Cc aparece para todo mundo. Cada pessoa que abre a mensagem lê a lista inteira dos dois campos, com os endereços completos.',
      'Quem está no Cco recebe e não aparece. Nem para os outros do Cco, nem para quem está no Para. Só quem enviou sabe quem estava ali.',
      'A escolha do campo não é uma formalidade: ela decide quem vai ler o endereço de quem. E essa decisão não é sua — é das pessoas cujos endereços você está entregando.',
    ],
    `A mesma mensagem, dois campos

No Cc, com 50 famílias:
  Cada família recebe e lê:
    familia01@..., familia02@..., familia03@... (as 49 outras)

No Cco, com as mesmas 50:
  Cada família recebe e lê:
    (nada: só a mensagem)`,
    'Não existe desfazer. Depois que a mensagem saiu com os endereços à mostra, cinquenta pessoas têm a lista, e qualquer uma delas pode encaminhá-la.',
    ['Para', 'Cc', 'Cco', 'endereço visível'],
  ),
  t(
    'quando-cco-e-errado',
    'E quando a cópia oculta é a escolha errada',
    'Entre quem trabalha junto, ela esconde a conversa.',
    [
      'O Cco protege quem não devia aparecer: pessoas que não se conhecem e nunca combinaram trocar endereço. As cinquenta famílias do clube são exatamente esse caso.',
      'Quatro pessoas da direção discutindo o ônibus não são. Elas precisam responder umas às outras — e ninguém responde a quem não consegue ver. Pôr uma delas no Cco a tira da conversa sem que ninguém perceba.',
      'E há o outro lado: se quem está no Cco clicar em Responder a todos, a resposta vai para os visíveis e entrega que havia alguém escondido ali. É constrangedor, e é a única maneira de a cópia oculta virar pública.',
      'A regra não é "use Cco em listas grandes". É: quem precisa conversar aparece; quem só precisa receber, e não se conhece, fica oculto.',
    ],
    `Quem vê quem

Aviso às famílias          →  ninguém precisa ver ninguém  →  Cco
Pergunta à direção         →  os quatro vão se responder   →  Para
Aviso a uma unidade        →  eles se conhecem             →  Para
Convite a clubes da região →  não se conhecem              →  Cco`,
    'Um endereço a mais no Cco é inofensivo. Um a menos, numa conversa em que ele precisava responder, é uma pessoa deixada de fora sem saber.',
    ['conversa', 'responder a todos', 'quem precisa ver'],
  ),
];

/* ── Módulo 2 — A mensagem que se entende (requisitos 2.2, 2.3 e 4.1) ─────── */

const A_MENSAGEM: TopicoDeVereda[] = [
  t(
    'o-assunto',
    'O assunto é para depois',
    'Ele não resume: ele identifica.',
    [
      'Quem abre a mensagem hoje entende qualquer assunto, porque acabou de receber. O assunto não é para essa pessoa. Ele é para quem vai procurar a mensagem em dezembro.',
      'Num clube que se reúne toda semana, "Reunião" é o assunto mais inútil que existe: daqui a um ano há quarenta mensagens escritas assim, e nenhuma delas se distingue das outras.',
      'Um assunto informativo contém a palavra pela qual alguém vai procurar. Ônibus. Acampamento. Autorização. Tesouraria. Se a palavra estiver ali, a busca acha.',
      'E a data ajuda quando o assunto se repete: "Pauta do conselho de 28 de julho" se distingue de "Pauta do conselho de 30 de agosto" sem ninguém abrir nenhuma das duas.',
    ],
    `Assuntos da mesma mensagem

  Reunião                                          ruim
  Aviso importante                                 ruim
  Confirmação do ônibus do acampamento             bom
  Ônibus do acampamento — resposta até quarta      melhor`,
    '"Urgente" e "Importante" não dizem do que se trata. Quem recebe dez desses por semana para de notar a palavra, e continua sem saber o assunto.',
    ['assunto', 'busca', 'seis meses depois'],
  ),
  t(
    'pedido-saudacao-assinatura',
    'A saudação, o pedido e a assinatura',
    'Três partes, e a do meio é a que costuma faltar.',
    [
      'Uma mensagem formal abre com uma saudação. Uma linha basta, e ela é para quem lê: começar direto no assunto soa como ordem.',
      'Depois vem o pedido, e é aqui que quase toda mensagem falha. "Seria bom se alguém pudesse levar o som" não pede nada a ninguém: não há quem, não há quando, e ninguém leva o som. Um pedido diz o que você precisa e até quando.',
      'Cuidado com o prazo: a data da viagem não é a data da resposta. Uma mensagem que diz "a saída é dia 3" e pede o número dos inscritos não pediu nada para quarta — e quem responder no dia 2 respondeu tarde demais.',
      'E a assinatura diz quem é você no clube. "Marina" assina; "Marina Duarte, secretaria do Clube Pioneiros" diz a quem responder e com que autoridade o pedido foi feito.',
    ],
    `O mesmo pedido, duas vezes

Sem pedido:
  Seria bom se alguém pudesse me passar o número da unidade.
  → ninguém foi encarregado, e ninguém responde

Com pedido:
  Peço que me confirmem o número da unidade até quarta.
  → tem quem, tem o quê, tem quando`,
    'Arrumar a forma não pode custar o conteúdo: reescrever a mensagem e perder a data da saída é como a única mensagem que tinha a informação deixa de tê-la.',
    ['saudação', 'pedido', 'prazo', 'assinatura'],
  ),
];

/* ── Módulo 3 — O arquivo pesado (requisito 4.2) ──────────────────────────── */

const O_ARQUIVO_PESADO: TopicoDeVereda[] = [
  t(
    'o-peso-multiplica',
    'O anexo é copiado para cada caixa',
    'E por isso o provedor recusa os grandes.',
    [
      'Um anexo não viaja uma vez: ele é copiado para a caixa de cada pessoa que recebe. Cento e oitenta megabytes mandados a quarenta famílias são sete gigabytes guardados, e não cento e oitenta.',
      'Por isso todo provedor tem um limite — normalmente vinte e cinco megabytes. Acima dele a mensagem nem sai: volta com um aviso dizendo que o anexo é grande demais.',
      'O vínculo faz o contrário. A mensagem leva um endereço, que não pesa nada, e o arquivo continua num lugar só. Quarenta pessoas abrindo o mesmo arquivo é um arquivo, e não quarenta.',
      'E há um ganho a mais: corrigir o original corrige o que todo mundo abre. Com o anexo, uma circular com a data errada são sessenta cópias erradas já entregues.',
    ],
    `180 MB, dois jeitos

Por anexo, para 40 famílias:
  40 caixas × 180 MB = 7,2 GB  → e o provedor recusa antes disso

Por vínculo, para 40 famílias:
  1 arquivo × 180 MB = 180 MB  → e a mensagem pesa alguns bytes`,
    'O anexo continua sendo a escolha certa para o que está pronto e não muda mais: a ficha assinada, o recibo, o PDF do ano passado. Ele chega inteiro e fica.',
    ['limite de anexo', 'vínculo', 'peso por caixa'],
  ),
  t(
    'o-vinculo-que-ninguem-abre',
    'O vínculo que ninguém consegue abrir',
    'Trocar um problema barulhento por um quieto.',
    [
      'Na maioria dos serviços, um arquivo nasce restrito: só quem o criou abre. Mandar o vínculo sem mexer nisso é mandar uma porta trancada.',
      'E o sintoma é silencioso. A pessoa clica, cai numa tela de "solicitar acesso", e o pedido fica esperando numa caixa que você não costuma ler. Ninguém volta a escrever para avisar.',
      'O anexo grande, pelo menos, volta com erro: você sabe na hora que não chegou. O vínculo fechado não avisa nada — para você, ele foi entregue.',
      'Então são dois cuidados, e não um: mandar o vínculo, e abrir o acesso para quem vai recebê-lo. Um sem o outro é meio caminho.',
    ],
    `Depois de inserir o vínculo

  Fotos do acampamento
  Só você consegue abrir        ← as 40 famílias clicam e não veem nada

  Fotos do acampamento
  Qualquer pessoa com o vínculo ← chega`,
    'Uma linha na mensagem resolve a estranheza de quem esperava um anexo: são 180 MB de fotos, estão na pasta do clube, e o vínculo abre para qualquer um.',
    ['quem abre', 'solicitar acesso', 'justificar a escolha'],
  ),
];

/* ── Módulo 4 — A caixa que se usa (requisito 4.3) ────────────────────────── */

const A_CAIXA: TopicoDeVereda[] = [
  t(
    'arquivar-nao-e-excluir',
    'Arquivar não é excluir',
    'E a busca é a diferença inteira.',
    [
      'Arquivar tira a mensagem da caixa de entrada e guarda. Ela continua na conta, continua aparecendo na busca, e volta para a entrada se alguém responder a ela.',
      'Excluir manda para a lixeira, que esvazia sozinha depois de algumas semanas. Passado isso, não há mais nada — nem na busca.',
      'É essa assimetria que torna arquivar seguro. Quem não sabe disso acredita que tirar da entrada é perder, e por isso nunca tira nada: a caixa chega a quatro mil mensagens e para de servir para qualquer coisa.',
      'Excluir é para o que você tem certeza de que nunca mais vai procurar. Para todo o resto, arquivar custa o mesmo clique e não fecha nenhuma porta.',
    ],
    `Onde cada uma vai parar

  Arquivada  →  sai da entrada  →  a busca acha
  Excluída   →  vai à lixeira   →  a busca não lê a lixeira
                                 →  e a lixeira esvazia sozinha`,
    'O recibo da tesouraria que você excluiu em junho some de vez em julho, e você vai precisar dele em novembro. Arquivar teria custado o mesmo clique.',
    ['arquivar', 'excluir', 'busca', 'lixeira'],
  ),
  t(
    'a-entrada-e-uma-lista',
    'A caixa de entrada é uma lista de pendências',
    'O que não pede nada de você não é pendência.',
    [
      'A caixa de entrada só serve para alguma coisa se o que está nela estiver lá por um motivo. O critério não é a idade da mensagem, nem quem a mandou, nem se você já leu.',
      'O critério é uma pergunta só: isto espera alguma coisa de mim? Se espera, fica. Se não espera, sai — arquivada, e não excluída.',
      '"Recebi, obrigada!" não espera nada. "A escala já está no mural" não espera nada. "Preciso do número até quarta" espera, e precisa ficar à vista.',
      'E ler não é resolver. A caixa de quem confunde as duas fica cheia de mensagens lidas que ninguém atendeu, e todas elas parecem tratadas.',
    ],
    `A entrada depois de arrumada

  Número final de inscritos       ← a direção espera o total
  Falta a autorização da Gabriela ← a tesouraria espera você falar com a mãe
  Escala de cozinha da Falcão     ← o conselheiro espera a divisão dos dias

  (o resto foi arquivado, e continua na busca)`,
    'Arrumar é decidir uma a uma. Arquivar tudo de uma vez deixa a entrada limpa e leva junto o que precisava de você — é a versão rápida de não ter arrumado nada.',
    ['pendência', 'entrada', 'decidir uma a uma'],
  ),
];

/* ── Módulo 5 — A lista da unidade (requisitos 2.4 e 4.4) ─────────────────── */

const A_LISTA: TopicoDeVereda[] = [
  t(
    'o-que-uma-lista-e',
    'Uma lista é um apelido',
    'E apelido não esconde ninguém.',
    [
      'Uma lista de distribuição é um endereço que guarda outros endereços. Escrever o endereço da lista num campo é escrever os endereços de todos os membros naquele campo.',
      'Ela poupa duas coisas: a digitação e o esquecimento. Cinco endereços digitados à mão são cinco chances de errar uma letra, e uma letra errada é uma pessoa sem a escala.',
      'O que ela não faz é proteger. Na hora da entrega, a lista abre nos endereços de quem está dentro — e quem recebe lê todos eles, como se tivessem sido digitados um a um.',
      'É por isso que lista e cópia oculta se confundem: as duas encurtam a digitação. Só uma delas esconde alguém, e não é a lista.',
    ],
    `O que chega quando se manda para a lista

  Para: unidade.falcao@clubepioneiros.org.br

  ...e cada um dos cinco recebe:
  Para: bruno@..., helena@..., lucas@..., sofia@..., tiago@...`,
    'Para uma unidade isso está certo: eles se conhecem e vão conversar entre si. Para cinquenta famílias que não se conhecem, o campo continua sendo o Cco.',
    ['lista de distribuição', 'apelido', 'abre na entrega'],
  ),
  t(
    'a-lista-envelhece',
    'A lista envelhece em dois sentidos',
    'E nenhum dos dois avisa.',
    [
      'Quem sai do clube continua na lista até alguém tirá-lo. Ele segue recebendo a conversa interna da unidade: escala, endereço, telefone de criança. Nada volta com erro, porque o endereço dele continua existindo.',
      'Quem entra não está nela até alguém pôr. Ele não recebe nada, não reclama de nada, e ninguém percebe — porque não falta nada na tela de ninguém.',
      'São dois erros diferentes, e conferir um não confere o outro. Por isso se olha a lista inteira, e não só quem foi lembrado na hora.',
      'A hora de revisar é toda vez que alguém entra ou sai. Uma vez por ano deixa onze meses de mensagens indo para o lugar errado.',
    ],
    `A lista da Falcão, hoje e de verdade

  Na lista:   Bruno, Daniel, Lucas, Sofia, Tiago
  Na unidade: Bruno, Helena, Lucas, Sofia, Tiago

  Daniel saiu em fevereiro e continua recebendo tudo.
  Helena entrou em março e não recebeu nada ainda.`,
    'A lista não sabe quem está na unidade. Ela continua entregando, certinha, para as pessoas de antes — e é essa correção aparente que faz o problema durar.',
    ['revisar', 'quem saiu', 'quem entrou'],
  ),
];

/* ── Módulo 6 — Quando você não está (requisito 4.5) ──────────────────────── */

const A_AUSENCIA: TopicoDeVereda[] = [
  t(
    'para-quem-ela-e',
    'A resposta automática é para quem escreveu',
    'E não para você.',
    [
      'Quem escreve e não recebe nada fica esperando. A resposta automática existe para essa pessoa: ela avisa que não haverá resposta agora e diz o que fazer enquanto isso.',
      'Uma que diz apenas "estou fora até dia 25" faz só metade. Quem escreveu passa a saber que não será atendido, e continua sem saber a quem recorrer.',
      'A outra metade é um nome e um endereço: "para o acampamento, fale com a tesouraria" mais o endereço dela. Nome sem endereço manda a pessoa procurar.',
      'E ela precisa de data de fim. Sem isso, continua respondendo em março que você está de férias, correta e velha — e quem escreve conclui que a secretaria do clube parou de funcionar.',
    ],
    `Duas respostas de ausência

  Estou fora até dia 25. Volto depois.
  → quem escreveu continua parado

  Estou fora da secretaria até 25/07. Para o acampamento,
  fale com tesouraria@clubepioneiros.org.br.
  → quem escreveu sabe o que fazer hoje`,
    'A resposta automática manda uma mensagem por pessoa, e não uma por mensagem. É o que impede duas caixas de férias de ficarem se respondendo até o fim do mês.',
    ['data de fim', 'a quem recorrer', 'uma por pessoa'],
  ),
  t(
    'o-que-nao-contar',
    'O que não escrever nela',
    'Ela responde a quem quer que escreva.',
    [
      'Esta é a única mensagem que você escreve sem saber para quem. Ela responde ao clube, às famílias, e também a quem atirou o seu endereço no escuro.',
      'Por isso "estou viajando com a família de 10 a 25" é uma frase cara: ela diz, a desconhecidos, que a casa está vazia e por quanto tempo. "Estou fora da secretaria" diz o que interessa e não diz isso.',
      'E há a opção de responder só a quem está nos seus contatos. Ela existe porque responder confirma duas coisas a quem atirou no escuro: que o endereço existe e que tem alguém lendo.',
      'Com ela ligada, o clube continua sendo atendido e quem não é conhecido não recebe confirmação nenhuma. É um clique, e ele muda quem fica sabendo da sua ausência.',
    ],
    `A mesma ausência, dita de dois jeitos

  Estou de férias com a família até 25/07.
  → conta que não há ninguém em casa, para qualquer um

  Estou fora da secretaria até 25/07.
  → conta o que quem escreveu precisa saber`,
    'O motivo da ausência é seu. O que a resposta precisa dizer é até quando e com quem falar — nada além disso ajuda quem escreveu.',
    ['só para contatos', 'casa vazia', 'confirmar o endereço'],
  ),
];

/* ── Módulo 7 — O evento que as pessoas acham (requisitos 2.5 e 5.1) ──────── */

const O_EVENTO: TopicoDeVereda[] = [
  t(
    'local-horario-descricao',
    'Local, horário e descrição',
    'O evento sem local não dá erro nenhum.',
    [
      'Um evento sem local salva, aparece na agenda de todo mundo com título e hora, e parece completo. Quem já sabe onde é não repara na falta; quem não sabe descobre às sete da noite, por telefone.',
      'A descrição é onde cabe o que o título não comporta: o que levar, o que vai acontecer, quem procurar na chegada. São as perguntas que chegariam uma a uma na véspera, respondidas de uma vez.',
      'O horário quer as duas pontas. Um evento sem hora de fim ocupa o resto do dia na agenda de quem aceitou, e todo mundo depois dele parece ocupado.',
      'E o título é o que aparece na grade do mês, num espaço de poucas palavras. "Reunião" ali é tão inútil quanto no assunto de uma mensagem.',
    ],
    `O mesmo evento, duas vezes

  Reunião
  sábado, 14h

  Reunião do clube — unidades e ordem unida
  sábado, 14h às 17h · Igreja Central, salão
  Levar o lenço. A Falcão cozinha neste sábado.`,
    'A descrição viaja com o convite para todo mundo. Se o calendário for publicado na web, ela viaja para qualquer pessoa — e é lá que costuma estar o telefone de alguém.',
    ['local', 'descrição', 'hora de fim'],
  ),
  t(
    'o-fuso',
    'O fuso horário, e por que ele erra calado',
    'Um evento não tem uma hora: tem um instante.',
    [
      'Um fuso horário é a faixa do planeta que acerta o relógio do mesmo jeito. Um evento não guarda "15h": ele guarda um instante, e cada pessoa lê esse instante no relógio dela.',
      'Isso funciona sozinho quando todo mundo está no mesmo fuso. Quando não está, quem cria o evento decide em que fuso as horas que ele digitou devem ser lidas.',
      'Combinar 15h com alguém em Rio Branco e criar o evento no fuso de Brasília põe a pessoa às 13h na agenda dela. Nada estoura: as duas agendas concordam, os dois convites estão certos, e ela entra duas horas antes.',
      'E escrever "15h, horário do Acre" na descrição não muda nada. A descrição fica certa, o campo fica errado, e quem lê confia no calendário — que é o que o calendário existe para ser.',
    ],
    `O mesmo instante, dois relógios

  Evento criado às 15h no fuso de Brasília
    em Brasília   → 15h
    em Rio Branco → 13h

  Evento criado às 15h no fuso do Acre
    em Rio Branco → 15h
    em Brasília   → 17h`,
    'O fuso se escolhe pelo nome da cidade, e nunca escrevendo o deslocamento à mão. O Brasil acabou com o horário de verão em 2019, e propostas de trazê-lo de volta aparecem.',
    ['fuso horário', 'instante', 'o campo, não a descrição'],
  ),
];

/* ── Módulo 8 — O convite e a resposta (requisitos 2.6 e 5.2) ─────────────── */

const O_CONVITE: TopicoDeVereda[] = [
  t(
    'o-que-um-convite-faz',
    'O convite entra na agenda de quem recebe',
    'A mensagem com a data pede que a pessoa copie.',
    [
      'Um convite de calendário é um evento que chega na agenda da outra pessoa — com local, horário, descrição e um lugar para ela responder.',
      'Uma mensagem dizendo "a reunião é dia 28 às 19h30" depende de quem recebe copiar aquilo para algum lugar. Muita gente não copia, e descobre na véspera.',
      'E o convite tem uma vantagem que só aparece quando alguma coisa muda: mudar o horário do evento muda a agenda de todos os convidados, e avisa cada um. Quem anotou num papel continua com o horário de antes.',
      'Em troca, o convite pede uma resposta. E é no acompanhamento dessa resposta que está a metade difícil.',
    ],
    `As quatro respostas possíveis

  Sim        → vai, e contou com a data
  Não        → não vai, e já decidiu
  Talvez     → viu e ainda não sabe
  Aguardando → não veio clique nenhum`,
    'Quem respondeu talvez avisou que não sabe. Contar como presente é a mesma leitura otimista que transforma "aguardando" em presença garantida.',
    ['convite', 'resposta', 'mudança avisa'],
  ),
  t(
    'aguardando-nao-e-sim',
    '"Aguardando" cobre duas coisas diferentes',
    'E uma delas nunca vai mudar.',
    [
      'A lista de convidados mostra "aguardando" para quem não clicou em nada. Isso cobre quem não viu a mensagem, quem viu e ainda não decidiu — e quem nunca recebeu coisa nenhuma.',
      'O terceiro caso acontece quando o endereço está errado por uma letra. O convite foi para um endereço que não existe, e na lista isso é exatamente igual a quem está pensando.',
      'Reenviar não adianta: vai para o mesmo lugar nenhum. O conserto é olhar os endereços de quem está aguardando, letra por letra, e corrigir.',
      'Para os outros dois casos, o conserto é perguntar. Ninguém deixa de responder por mal — convite é fácil de fechar sem clicar —, e uma linha perguntando resolve o que três convites não resolvem.',
    ],
    `A lista de convidados, na véspera

  Tio Ricardo      sim
  Tio Nelson       não
  Tia Rute         talvez
  Tia Joana        aguardando   ← viu e não decidiu
  tio.samuel@...   aguardando   ← o endereço tem uma letra a menos`,
    'Ler "aguardando" como "vai" é o que faz reuniões começarem com metade das cadeiras vazias, e ninguém entender por quê.',
    ['aguardando', 'endereço errado', 'acompanhar'],
  ),
];

/* ── Módulo 9 — O que se repete (requisito 5.3) ───────────────────────────── */

const O_QUE_SE_REPETE: TopicoDeVereda[] = [
  t(
    'a-serie',
    'Uma reunião semanal é um evento, e não cinquenta',
    'Desde que ela tenha data de fim.',
    [
      'A recorrência existe para não criar o mesmo evento quarenta vezes. Uma reunião de sábado são cinquenta e duas por ano, e a série é o que faz caber em um evento só.',
      'O calendário oferece "para sempre", e é o que quase todo mundo aceita. A partir daí a reunião de sábado do clube chega a 2075, e ninguém nunca mais olha para ela.',
      'Um fim declarado é uma linha, e é o que obriga alguém a rever a série quando o semestre acabar — que é justamente quando ela costuma mudar de horário ou de lugar.',
      'O fim pode ser generoso: dezembro, o fim do ano letivo, a data do campori. O que não pode é não existir.',
    ],
    `A mesma reunião de sábado

  Repetir toda semana                    → chega a 2075
  Repetir toda semana até 19/12/2026     → alguém a revê em dezembro`,
    'Série sem fim não dá erro. Ela simplesmente continua desenhando a reunião todo sábado, para sempre, na agenda de todo mundo que aceitou o convite.',
    ['recorrência', 'data de fim', 'série'],
  ),
  t(
    'as-tres-opcoes',
    'As três opções da caixa de excluir',
    'Escritas em letra do mesmo tamanho.',
    [
      'Quando você manda excluir um evento que faz parte de uma série, o calendário abre uma caixa com três opções: este evento, este e os seguintes, todos os eventos.',
      'Este evento tira uma ocorrência e deixa a série de pé. É o que se quer quando o clube está no acampamento naquele sábado.',
      'Este e os seguintes corta a série na data escolhida. É o que se quer quando a reunião muda de horário a partir de agosto: junho e julho continuam como aconteceram.',
      'Todos os eventos apaga a série inteira, inclusive o que já passou. E não pergunta de novo. Nenhuma das três vem destacada, e é por isso que tanta gente apaga um ano para desmarcar um sábado.',
    ],
    `Desmarcar o sábado do acampamento

  Este evento           → some só o sábado 4 de julho
  Este e os seguintes   → somem 4, 11, 18, 25 e o resto do ano
  Todos os eventos      → some o ano inteiro, e o que já passou`,
    'Nada avisa quando a escolha foi a errada. O que sumiu sumiu da agenda de todo mundo ao mesmo tempo, e só se percebe quando ninguém aparece no sábado seguinte.',
    ['este evento', 'este e os seguintes', 'todos os eventos'],
  ),
];

/* ── Módulo 10 — O calendário do clube (requisitos 5.4 e 5.5) ─────────────── */

const O_CALENDARIO_DO_CLUBE: TopicoDeVereda[] = [
  t(
    'os-quatro-niveis',
    'Quatro níveis, e não quatro graus de confiança',
    'Cada um diz o que a pessoa faz com o calendário.',
    [
      'Ver apenas livre/ocupado mostra que o horário está tomado, e nada além: nem título, nem local, nem descrição. É o nível de quem precisa marcar hora com você e não tem nada que ver com o que você faz.',
      'Ver todos os detalhes mostra o conteúdo dos eventos e não deixa mexer em nada. É o nível de quem participa.',
      'Fazer alterações deixa criar, mudar e apagar qualquer evento. É o nível de quem organiza — e é o que põe o acampamento ao alcance de quem o tiver.',
      'Fazer alterações e gerenciar compartilhamento é o único que se propaga: quem o tem pode dar acesso a mais gente, e pode tirar o seu.',
    ],
    `A quem dar cada nível

  A direção, que organiza          → fazer alterações
  Os conselheiros, que participam  → ver todos os detalhes
  As famílias, que marcam conversa → ver apenas livre/ocupado`,
    'Dar "fazer alterações" a todo mundo resolve a reclamação de que ninguém consegue marcar nada, e põe o acampamento ao alcance de trinta pessoas. Ninguém apaga de propósito: apaga arrastando.',
    ['livre/ocupado', 'ver detalhes', 'alterar', 'gerenciar'],
  ),
  t(
    'a-grade-responde-o-que-consultou',
    'A grade de disponibilidade responde sobre o que ela viu',
    'Livre e desconhecido cabem no mesmo branco.',
    [
      'Antes de marcar um compromisso com várias pessoas, o calendário mostra uma grade com os horários de cada uma. Onde há faixa pintada, alguém está ocupado.',
      'Mas a grade só sabe das agendas que foram compartilhadas com você. Quem não compartilhou aparece sem informação — e sem informação, numa grade, parece exatamente igual a livre.',
      'A maioria das pessoas não tem o trabalho na agenda do clube. Elas parecem livres a semana inteira, e não estão.',
      'Então a grade encurta o trabalho e não o termina: ela diz quem certamente não pode, e não diz quem pode. Para o resto, pergunta-se.',
    ],
    `A grade das quatro pessoas, na quinta-feira

  Tio Samuel   ██ ocupado 14h-15h30
  Tia Rute     ██ ocupado 16h-18h
  Tia Joana    ██ ocupado 9h-12h
  Tio Márcio   ▨▨ sem acesso à agenda  ← não é livre: é "não sei"`,
    'Publicar o calendário na web entrega os horários e a descrição de cada evento, para qualquer pessoa e para os buscadores. A descrição é onde costuma estar o telefone de alguém.',
    ['disponibilidade', 'sem acesso', 'perguntar'],
  ),
];

/* ── Módulo 11 — A reunião a distância (requisito 6) ──────────────────────── */

const A_REUNIAO: TopicoDeVereda[] = [
  t(
    'conduzir',
    'Conduzir uma reunião a distância',
    'O vínculo mora no evento, e o microfone engana.',
    [
      'O vínculo da sala mora no evento do calendário, e não numa mensagem. Na mensagem ele se perde na conversa; no evento, ele está onde a pessoa vai olhar cinco minutos antes — e viaja com o convite, para todo mundo.',
      'Quem conduz entra antes e confere a sala de espera. Quem não tem conta da organização cai nela, e o pedido aparece por alguns segundos — enquanto quem conduz está olhando o que está apresentando.',
      'E o microfone. Todo programa mostra que ele está fechado, e todo mundo fala dois minutos assim mesmo. Não sai som nenhum, e abrir depois não faz ninguém ouvir o que já foi dito.',
      'O aviso estar na tela não impede nada. O que ajuda é o hábito: olhar o ícone antes da primeira frase.',
    ],
    `Antes de começar

  1. O vínculo está no evento?
  2. Alguém está na sala de espera?
  3. O microfone está aberto?
  4. O que está aberto na tela que você vai mostrar?`,
    'O passo 4 é o único que não dá para tomar depois. Fechar a conversa e silenciar as notificações antes de apresentar é mais fácil do que explicar o que apareceu.',
    ['vínculo no evento', 'sala de espera', 'microfone'],
  ),
  t(
    'compartilhar-a-tela',
    'Compartilhar a tela inteira ou uma janela',
    'Nenhuma das duas é sempre certa.',
    [
      'A tela inteira leva tudo o que aparecer nela, inclusive as notificações que chegarem enquanto você apresenta. Na sua máquina a notificação aparece no canto e some — você não tem como saber que catorze pessoas leram.',
      'Uma janela leva só aquela janela, e continua levando só ela depois que você trocar de programa. A sala fica olhando uma planilha parada enquanto você explica outra coisa.',
      'Uma guia do navegador é a única que consegue levar o som junto, e mesmo assim só com a caixa marcada. Compartilhar o vídeo pela janela do navegador entrega a imagem e o silêncio.',
      'A escolha depende do que você vai mostrar: uma coisa só, pela janela; várias, pela tela inteira — depois de fechar o que não pode aparecer.',
    ],
    `O que cada escolha leva junto

  Tela inteira  →  tudo, inclusive as notificações
  Uma janela    →  só ela, mesmo depois de você trocar de programa
  Uma guia      →  só ela, e é a única que leva o som`,
    'Na sua tela as três parecem a mesma coisa depois que a apresentação começa. A diferença aparece do outro lado, e ninguém do outro lado avisa.',
    ['tela inteira', 'janela', 'guia com áudio'],
  ),
];

/* ── Módulo 12 — A pauta e a ata (requisitos 7 e 8) ───────────────────────── */

const A_PAUTA_E_A_ATA: TopicoDeVereda[] = [
  t(
    'a-pauta',
    'A pauta é uma lista, e vai antes',
    'Para quem vai participar poder se preparar.',
    [
      'A pauta é a lista dos assuntos que vão ser tratados, na ordem em que vão ser tratados. Três ou quatro itens bastam.',
      'Ela vai antes da reunião porque é a única razão de existir: quem vai levar a prestação de contas precisa saber disso antes, e não na hora.',
      'Um parágrafo dizendo "vamos falar do acampamento e de mais umas coisas" não é pauta. Ninguém consegue preparar nada com isso, e a reunião começa com todo mundo descobrindo o assunto junto.',
      'Ela costuma encurtar a reunião, e isso é consequência. A razão é outra: ninguém chega sem saber do que se trata.',
    ],
    `Uma pauta de verdade

  Pauta da reunião do conselho de 28 de julho

  1. Prestação de contas do acampamento
  2. Escala do segundo semestre
  3. Compra do material da ordem unida`,
    'A pauta vai para quem vai estar na reunião, e o convite do calendário é um bom lugar para ela: na descrição do evento, ela chega junto com o horário.',
    ['pauta', 'antes', 'lista de assuntos'],
  ),
  t(
    'a-ata',
    'A ata registra decisões, com dono e prazo',
    'Sem as duas coisas, ela registra que a reunião aconteceu.',
    [
      'A ata é escrita depois e responde por trás: o que ficou decidido. Ela não precisa guardar a discussão — quanto mais discussão ela guarda, mais fundo ficam as decisões que alguém vai precisar cumprir.',
      'Cada decisão precisa de duas coisas: quem faz e até quando. "Ficou combinado que alguém vai ver o som" é a mesma frase de "seria bom se alguém pudesse levar o som", escrita um mês depois.',
      'Com dono e prazo, a ata vira uma lista de compromissos que a próxima reunião confere. Sem eles, ela vira um documento que ninguém abre.',
      'E ela vai para as mesmas pessoas que receberam a pauta. Quem faltou precisa dela ainda mais do que quem foi.',
    ],
    `Duas atas do mesmo conselho

  Ficou combinado que alguém vai ver o material da ordem unida.
  → ninguém vê o material

  Tio Nelson fecha a prestação de contas até dia 5.
  Tia Cláudia monta a escala do semestre até sexta.
  → a próxima reunião confere duas linhas`,
    'O requisito 8 pede que você mostre a caixa de entrada organizada e o calendário do clube com um mês planejado. Nenhum dos dois se arruma na véspera.',
    ['ata', 'dono', 'prazo', 'distribuir'],
  ),
];

/* ── Os doze módulos ──────────────────────────────────────────────────────── */

export const MODULOS_DA_COMUNICACAO: ModuloDeVereda[] = [
  {
    id: 'm1',
    titulo: 'Cópia oculta',
    resumo: 'Três campos, três decisões — e a que entrega cinquenta endereços a cinquenta pessoas.',
    licoes: [
      {
        id: 'm1-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m1-teoria'],
        perguntas: 4,
        titulo: 'Quem vê quem numa mensagem',
        resumo: 'Para, Cc e Cco não são três lugares para o mesmo endereço.',
        topicos: COPIA_OCULTA,
      },
      {
        id: 'm1-lab', tipo: 'comunicacao', licao: 'cco',
        titulo: 'Avisando as famílias sem entregar os endereços',
        resumo: 'E perguntando à direção com os quatro se vendo.',
        verificacoes: ['viu-os-trinta-e-tres', 'aviso-sem-vazar', 'conversa-em-copia-aberta'],
      },
    ],
  },
  {
    id: 'm2',
    titulo: 'A mensagem que se entende',
    resumo: 'Assunto que se acha, pedido que se atende, assinatura que diz quem pediu.',
    licoes: [
      {
        id: 'm2-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m2-teoria'],
        perguntas: 4,
        titulo: 'O assunto é para daqui a seis meses',
        resumo: 'E o pedido precisa dizer quem faz e até quando.',
        topicos: A_MENSAGEM,
      },
      {
        id: 'm2-lab', tipo: 'comunicacao', licao: 'mensagem',
        titulo: 'Arrumando a mensagem do ônibus',
        resumo: 'Sem perder a data, a hora e o lugar que só ela tinha.',
        verificacoes: ['assunto-que-se-acha', 'com-saudacao', 'pedido-com-prazo', 'assinada'],
      },
    ],
  },
  {
    id: 'm3',
    titulo: 'O arquivo pesado',
    resumo: 'Por que o anexo volta, e o que o vínculo cobra em troca.',
    licoes: [
      {
        id: 'm3-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m3-teoria'],
        perguntas: 4,
        titulo: 'Cento e oitenta megabytes, quarenta vezes',
        resumo: 'E o vínculo fechado, que ninguém consegue abrir.',
        topicos: O_ARQUIVO_PESADO,
      },
      {
        id: 'm3-lab', tipo: 'comunicacao', licao: 'pesado',
        titulo: 'Mandando as fotos do acampamento',
        resumo: 'Ver o anexo voltar, e abrir o vínculo para quem recebe.',
        verificacoes: ['viu-o-anexo-voltar', 'mandou-por-vinculo', 'o-vinculo-abre'],
      },
    ],
  },
  {
    id: 'm4',
    titulo: 'A caixa que se usa',
    resumo: 'Arquivar não é excluir, e a entrada é uma lista de pendências.',
    licoes: [
      {
        id: 'm4-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m4-teoria'],
        perguntas: 4,
        titulo: 'O que fica na caixa de entrada',
        resumo: 'E por que a busca é o que torna arquivar seguro.',
        topicos: A_CAIXA,
      },
      {
        id: 'm4-lab', tipo: 'comunicacao', licao: 'caixa',
        titulo: 'Deixando na entrada só o que pede alguma coisa',
        resumo: 'Seis arquivadas, três de pé, e a busca achando o que saiu.',
        verificacoes: ['arquivou-o-que-nao-pede-nada', 'achou-na-busca'],
      },
    ],
  },
  {
    id: 'm5',
    titulo: 'A lista da unidade',
    resumo: 'Um apelido para vários endereços — que envelhece em dois sentidos.',
    licoes: [
      {
        id: 'm5-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m5-teoria'],
        perguntas: 4,
        titulo: 'O apelido que não esconde ninguém',
        resumo: 'Lista poupa digitação; quem protege endereço é o Cco.',
        topicos: A_LISTA,
      },
      {
        id: 'm5-lab', tipo: 'comunicacao', licao: 'lista',
        titulo: 'Consertando a do Falcão e criando a da Águia',
        resumo: 'Quem saiu, quem entrou, e uma mensagem por um endereço só.',
        verificacoes: ['tirou-quem-saiu', 'pos-quem-entrou', 'criou-a-lista-da-aguia', 'mandou-pela-lista'],
      },
    ],
  },
  {
    id: 'm6',
    titulo: 'Quando você não está',
    resumo: 'A resposta automática é para quem escreveu, e responde a qualquer um.',
    licoes: [
      {
        id: 'm6-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m6-teoria'],
        perguntas: 4,
        titulo: 'Até quando, com quem falar, e o que não contar',
        resumo: 'Três campos, e dois deles ninguém preenche.',
        topicos: A_AUSENCIA,
      },
      {
        id: 'm6-lab', tipo: 'comunicacao', licao: 'ausencia',
        titulo: 'Configurando a ausência das férias',
        resumo: 'Com data de fim, com encaminhamento, e sem dizer que a casa está vazia.',
        verificacoes: ['ligou-com-fim', 'diz-com-quem-falar', 'so-para-quem-o-clube-conhece'],
      },
    ],
  },
  {
    id: 'm7',
    titulo: 'O evento que as pessoas acham',
    resumo: 'Local, horário, descrição — e o fuso, que erra sem avisar ninguém.',
    licoes: [
      {
        id: 'm7-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m7-teoria'],
        perguntas: 4,
        titulo: 'Um evento não tem uma hora: tem um instante',
        resumo: 'E escrever o fuso na descrição não muda a agenda de ninguém.',
        topicos: O_EVENTO,
      },
      {
        id: 'm7-lab', tipo: 'comunicacao', licao: 'evento',
        titulo: 'Marcando a reunião regional',
        resumo: 'Com quem está no Acre lendo o horário que vocês combinaram.',
        verificacoes: ['criou-com-local', 'com-descricao', 'no-fuso-de-quem-combinou'],
      },
    ],
  },
  {
    id: 'm8',
    titulo: 'O convite e a resposta',
    resumo: '"Aguardando" cobre duas coisas, e uma delas nunca vai mudar sozinha.',
    licoes: [
      {
        id: 'm8-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m8-teoria'],
        perguntas: 4,
        titulo: 'Convidar é fácil; acompanhar é o requisito',
        resumo: 'O convite que nunca chegou parece o de quem não decidiu.',
        topicos: O_CONVITE,
      },
      {
        id: 'm8-lab', tipo: 'comunicacao', licao: 'convites',
        titulo: 'Acompanhando as respostas do conselho',
        resumo: 'Achar o endereço com uma letra a menos, e cobrar quem falta.',
        verificacoes: ['viu-que-aguardando-nao-e-sim', 'consertou-o-endereco-errado', 'cobrou-quem-nao-respondeu'],
      },
    ],
  },
  {
    id: 'm9',
    titulo: 'O que se repete',
    resumo: 'Uma reunião semanal é um evento — e três opções em letra do mesmo tamanho.',
    licoes: [
      {
        id: 'm9-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m9-teoria'],
        perguntas: 4,
        titulo: 'A série, o fim declarado e a caixa de excluir',
        resumo: 'Este evento, este e os seguintes, todos os eventos.',
        topicos: O_QUE_SE_REPETE,
      },
      {
        id: 'm9-lab', tipo: 'comunicacao', licao: 'recorrente',
        titulo: 'Montando os sábados e planejando julho',
        resumo: 'Desmarcar o sábado do acampamento sem apagar o ano.',
        verificacoes: ['criou-a-serie-com-fim', 'desmarcou-so-o-sabado-do-acampamento', 'o-mes-esta-planejado'],
      },
    ],
  },
  {
    id: 'm10',
    titulo: 'O calendário do clube',
    resumo: 'Quatro níveis de acesso, e uma grade que responde só sobre o que consultou.',
    licoes: [
      {
        id: 'm10-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m10-teoria'],
        perguntas: 4,
        titulo: 'Quem pode ver e quem pode apagar',
        resumo: 'E por que um espaço em branco na grade não quer dizer livre.',
        topicos: O_CALENDARIO_DO_CLUBE,
      },
      {
        id: 'm10-lab', tipo: 'comunicacao', licao: 'calendario',
        titulo: 'Abrindo o calendário para o clube',
        resumo: 'Cada um no nível do trabalho dele, e a reunião num horário que serve.',
        verificacoes: ['cada-um-no-nivel-do-trabalho-dele', 'olhou-a-grade', 'perguntou-a-quem-nao-compartilha', 'marcou-quando-todos-podem'],
      },
    ],
  },
  {
    id: 'm11',
    titulo: 'A reunião a distância',
    resumo: 'O microfone fechado, a notificação que vaza e o vídeo que chega mudo.',
    licoes: [
      {
        id: 'm11-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m11-teoria'],
        perguntas: 4,
        titulo: 'Conduzir, e escolher o que mostrar',
        resumo: 'Tela inteira, janela ou guia — e o que cada uma leva junto.',
        topicos: A_REUNIAO,
      },
      {
        id: 'm11-lab', tipo: 'comunicacao', licao: 'reuniao',
        titulo: 'Conduzindo a reunião do conselho',
        resumo: 'Admitir quem espera, mostrar a planilha e o vídeo com o som.',
        verificacoes: ['agendou-com-o-vinculo', 'viu-o-microfone-fechado', 'admitiu-quem-esperava', 'apresentou-sem-vazar', 'mostrou-o-video-com-som'],
      },
    ],
  },
  {
    id: 'm12',
    titulo: 'A pauta e a ata',
    resumo: 'A lista que vai antes e as decisões com dono e prazo que vão depois.',
    licoes: [
      {
        id: 'm12-teoria', tipo: 'teoria',
        questoes: QUESTOES_DA_COMUNICACAO['m12-teoria'],
        perguntas: 4,
        titulo: 'O que se escreve antes e o que se escreve depois',
        resumo: 'E o que o examinador vê quando abre a sua caixa.',
        topicos: A_PAUTA_E_A_ATA,
      },
      {
        id: 'm12-lab', tipo: 'comunicacao', licao: 'pauta',
        titulo: 'Distribuindo a pauta e a ata do conselho',
        resumo: 'Com a caixa de entrada só com o que ainda pede alguma coisa.',
        verificacoes: ['mandou-a-pauta-antes', 'mandou-a-ata-com-dono-e-prazo'],
      },
    ],
  },
];
