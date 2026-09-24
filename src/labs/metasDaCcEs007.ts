/**
 * O que cada uma das doze lições da CC-ES007 cobra.
 *
 * Num arquivo só, como `metasDaCcEs006.ts` e `metasDaCcEs005.ts`. O que muda
 * aqui é que os programas são **três** — o correio, o calendário e a sala de
 * reunião —, e mesmo assim o contexto é um: a caixa, a agenda e a sala viajam
 * juntas porque o clube é um só, e uma lição que precisasse da agenda para
 * conferir a caixa não teria onde pegá-la.
 *
 * O registro mora **fora do teste**, como o de planilha, o de PDF e o de
 * nuvem: quem o lê é a tela, que monta a lição, **e** a trava, que confere que
 * nenhuma meta abre verde. Escrito só na trava, a tela repetiria a escolha e
 * as duas divergiriam na primeira lição nova, com a trava continuando verde
 * conferindo uma lição que a tela não abre.
 */

import {
  type Caixa, type Mensagem, type Rascunho,
  AGUIA, CONSELHEIROS_DO_CLUBE, DIRECAO, DIRETOR, FALCAO, FALCAO_HOJE, FAMILIAS,
  LIMITE_DE_ANEXO, TESOURARIA, VOCE,
  assinaturaDizQuemEVoce, assuntoNomeiaAMateria, assuntoVago, buscar, caixaDoClube,
  contaDemais, decisoesComDono, dizComQuemFalar, enderecosQueCadaUmVe, itensDaPauta,
  naPasta, pedidoComPrazo, quemRecebe, temFim, temSaudacao,
} from './correspondencia';
import {
  type Agenda, type Evento,
  CALENDARIO_DO_CLUBE, CONVIDADOS_DA_REUNIAO, DIAS_DE_UM_MES_PLANEJADO, DIA_DA_REUNIAO,
  FUSO_DE_BRASILIA, FUSO_DO_ACRE, GRADE, JULHO, MARCIO_SO_DEPOIS_DE,
  agendaDoClube, criarEvento, diasPlanejados, eventoDe, horaPara, naoChegaram,
  ocorrencias, quemPodeApagar, serieTemFim, temDescricao, temLocal,
} from './agenda';
import {
  type Reuniao,
  PLANILHA, VIDEO,
  escolheuATelaInteira, mostrouComSom, mostrouSemATelaInteira, naEspera, naoOuviram,
  reuniaoDoConselho,
} from './reuniaoRemota';

/* ── O que uma meta é ─────────────────────────────────────────────────────── */

export interface Meta {
  id: string;
  titulo: string;
  /** Por que isto importa. Uma ou duas frases, do jeito que se fala com alguém de dez anos. */
  detalhe: string;
  /** Onde, no programa, este gesto acontece. */
  onde: string;
  /** O passo a passo, para quem travar. Convite, e não despejo. */
  passos: string[];
  feita: (c: ContextoDaComunicacao) => boolean;
}

/* ── O contexto ───────────────────────────────────────────────────────────── */

export interface ContextoDaComunicacao {
  caixa: Caixa;
  /**
   * A caixa de quando a lição abriu.
   *
   * É a mesma razão de a CC-ES001 carregar o disco de agora e o de quando
   * abriu, e de a CC-ES005 carregar os dois cofres: saber o que **mudou** é
   * outra pergunta que saber o que está lá, e algumas metas só respondem à
   * primeira.
   */
  caixaAntes: Caixa;
  agenda: Agenda;
  reuniao: Reuniao;
  /**
   * O que a pessoa viu, e que não deixa marca em campo nenhum.
   *
   * É a família das quatro verificações do Explorador que só existem como
   * gesto, e das duas descobertas do módulo 6 da CC-ES004: ver trinta e três
   * endereços de estranhos numa mensagem que chegou, ver o anexo voltar, ver
   * "aguardando" cobrindo duas coisas diferentes. Nenhuma muda um byte, e
   * todas são o que o requisito manda demonstrar.
   */
  descobertas: string[];
}

const viu = (c: ContextoDaComunicacao, o: string) => c.descobertas.includes(o);
const enviadas = (c: ContextoDaComunicacao) => naPasta(c.caixa, 'enviadas');
const alguma = (c: ContextoDaComunicacao, f: (m: Mensagem) => boolean) => enviadas(c).some(f);
const naEntrada = (c: ContextoDaComunicacao) => naPasta(c.caixa, 'entrada');
const evt = (c: ContextoDaComunicacao, id: string) => eventoDe(c.agenda, id);

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — Cópia oculta (requisitos 2.1 e 3)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_O_VAZAMENTO = 'viu-os-trinta-e-tres';

const paraAsFamilias = (c: ContextoDaComunicacao, m: Mensagem) => {
  const recebem = new Set(quemRecebe(c.caixa, m));
  return FAMILIAS.every(f => recebem.has(f.endereco));
};

export const METAS_DA_COPIA_OCULTA: Meta[] = [
  {
    id: 'viu-os-trinta-e-tres',
    titulo: 'Abrir a mensagem do Clube Alvorada e contar quantos endereços estão à mostra',
    detalhe: 'Trinta e três secretarias que você não conhece estão lendo o seu endereço, '
      + 'e você está lendo o delas. Ninguém fez por mal — foi um campo escolhido errado.',
    onde: 'Correio › Caixa de entrada › Datas do campori regional de 2027',
    passos: [
      'Abra a mensagem do Clube Alvorada.',
      'Olhe a linha do Cc: são trinta e quatro clubes.',
      'Esse é o estrago de que o requisito 3 fala, acontecendo na sua caixa.',
    ],
    feita: c => viu(c, VIU_O_VAZAMENTO),
  },
  {
    id: 'aviso-sem-vazar',
    titulo: 'Mandar o aviso do acampamento às 52 famílias sem nenhuma ver a outra',
    detalhe: 'Elas não se conhecem e nunca combinaram trocar endereço. No Para ou no Cc, '
      + 'cada família recebe a lista das outras 51 — e não há como desfazer.',
    onde: 'Correio › Escrever › Cco',
    passos: [
      'Clique em Escrever.',
      'Abra o campo Cco, ao lado de Cc.',
      'Traga as 52 famílias para ele — e deixe o Para e o Cc vazios.',
      'Escreva o aviso e mande.',
    ],
    /*
      Não basta o Cco ter alguém: o que se mede é o vazamento **não ter
      acontecido**. Uma mensagem com uma família no Cco e 51 no Para tem o
      campo preenchido e entregou tudo. É a decisão da AP044, e aqui ela vale
      pela conta de quantos endereços cada um lê.
    */
    feita: c => alguma(c, m => paraAsFamilias(c, m) && enderecosQueCadaUmVe(c.caixa, m) === 0),
  },
  {
    id: 'conversa-em-copia-aberta',
    titulo: 'Perguntar à direção sobre o ônibus com os quatro se vendo',
    detalhe: 'Aqui o Cco seria o erro: eles precisam responder uns aos outros. '
      + 'Escondido, ninguém alcança quem não aparece — e quem responde a todos de dentro '
      + 'do Cco entrega que estava ali.',
    onde: 'Correio › Escrever › Para',
    passos: [
      'Escreva uma mensagem nova para a direção.',
      'Ponha os quatro no Para (ou no Cc): eles vão conversar entre si.',
      'Cco protege quem não devia aparecer. Entre quem trabalha junto, ele esconde a conversa.',
    ],
    /*
      A conta é "todos se veem", e não "o Cco está vazio": uma mensagem com os
      quatro no Para e uma quinta pessoa oculta continua sendo a conversa certa
      para os quatro. O que a tarefa mede é que ninguém da direção ficou
      invisível para os outros três.
    */
    feita: c => alguma(c, m => {
      const visiveis = new Set([...m.para, ...m.cc]);
      return DIRECAO.every(d => visiveis.has(d.endereco));
    }),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — A mensagem que se entende (requisitos 2.2, 2.3 e 4.1)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * O rascunho de onde a lição parte, escrito do jeito que se escreve com pressa.
 *
 * Ele chega **errado de propósito** nas quatro coisas que o requisito 4.1 pede:
 * assunto que não distingue nada num clube que se reúne toda semana, nenhuma
 * saudação, um desejo no lugar de um pedido, e sem assinatura. Nada nele está
 * *errado* — é uma mensagem simpática, que qualquer pessoa entende hoje, e
 * que ninguém atende.
 */
export const RASCUNHO_DO_ONIBUS: Rascunho = {
  para: CONSELHEIROS_DO_CLUBE.map(c => c.endereco),
  cc: [],
  cco: [],
  assunto: 'Reunião',
  corpo: 'A gente precisa fechar o número de quem vai no ônibus do acampamento. '
    + 'A saída é dia 3 de julho às 6h da Igreja Central.\n\n'
    + 'Seria bom se alguém pudesse me passar o número da unidade.',
  anexos: [],
  vinculos: [],
};

/** As palavras pelas quais alguém vai procurar esta mensagem daqui a seis meses. */
export const PALAVRAS_DO_ASSUNTO = ['ônibus', 'onibus', 'transporte', 'acampamento'];

/**
 * Os três fatos que a reescrita não pode perder.
 *
 * É a irmã do "sem alterar uma palavra do texto" da CC-ES002: o atalho mais
 * rápido para deixar a lista verde é apagar tudo e escrever quatro linhas
 * novas — que num clube de verdade é como a data do ônibus some da única
 * mensagem que a tinha. Ela é **condição**, e não tarefa: é verdadeira no
 * segundo zero, e como item da lista ensinaria a não ler a lista.
 */
export const FATOS_DO_ONIBUS = ['3 de julho', '6h', 'Igreja Central'];

const guardaOsFatos = (m: Mensagem) =>
  FATOS_DO_ONIBUS.every(f => m.corpo.toLowerCase().includes(f.toLowerCase()));

const aosConselheiros = (c: ContextoDaComunicacao, m: Mensagem) => {
  const recebem = new Set(quemRecebe(c.caixa, m));
  return CONSELHEIROS_DO_CLUBE.every(x => recebem.has(x.endereco));
};

const mensagemDoOnibus = (c: ContextoDaComunicacao) =>
  enviadas(c).filter(m => aosConselheiros(c, m) && guardaOsFatos(m));

export const METAS_DA_MENSAGEM: Meta[] = [
  {
    id: 'assunto-que-se-acha',
    titulo: 'Trocar o assunto por um que se ache daqui a seis meses',
    detalhe: 'Num clube que se reúne toda semana, "Reunião" não distingue nada. '
      + 'Quem procurar por "ônibus" em dezembro tem de cair nesta mensagem.',
    onde: 'Correio › a mensagem aberta › campo Assunto',
    passos: [
      'Volte ao rascunho que está aberto.',
      'Troque o assunto por um que diga do que a mensagem trata.',
      'Pense em quem vai procurar por ela depois, e não em quem vai abri-la hoje.',
    ],
    feita: c => mensagemDoOnibus(c).some(m =>
      !assuntoVago(m.assunto) && assuntoNomeiaAMateria(m.assunto, PALAVRAS_DO_ASSUNTO)),
  },
  {
    id: 'com-saudacao',
    titulo: 'Abrir com uma saudação',
    detalhe: 'Uma mensagem formal que começa direto no assunto soa como ordem. '
      + 'Uma linha basta, e ela é para quem lê — não para quem escreve.',
    onde: 'Correio › a mensagem aberta › primeira linha do texto',
    passos: [
      'Escreva uma saudação na primeira linha: "Prezados conselheiros," serve.',
      'Depois dela, pule uma linha antes do assunto.',
    ],
    feita: c => mensagemDoOnibus(c).some(m => temSaudacao(m.corpo)),
  },
  {
    id: 'pedido-com-prazo',
    titulo: 'Pedir o que você precisa, dizendo até quando',
    detalhe: '"Seria bom se alguém pudesse" não pede nada a ninguém: não há quem, '
      + 'não há quando, e o número não chega. E o prazo tem de estar junto do pedido — '
      + 'a data da viagem não é a data da resposta.',
    onde: 'Correio › a mensagem aberta › corpo',
    passos: [
      'Escreva o pedido com um verbo de pedir: "peço que", "confirmem", "me mandem".',
      'Diga até quando, na mesma frase: "até quarta", "até dia 30".',
      'Repare que a data da saída não serve de prazo: ela não é a data da resposta.',
    ],
    feita: c => mensagemDoOnibus(c).some(m => pedidoComPrazo(m.corpo)),
  },
  {
    id: 'assinada',
    titulo: 'Assinar dizendo quem é você no clube',
    detalhe: '"Marina" assina. "Marina Duarte — Secretaria do Clube Pioneiros" diz a quem '
      + 'responder e com que autoridade o pedido foi feito, que é a diferença entre uma '
      + 'mensagem atendida e uma que fica esperando alguém perguntar quem escreveu.',
    onde: 'Correio › Configurações › Geral › Assinatura',
    passos: [
      'Abra as Configurações, na engrenagem.',
      'Na aba Geral, escreva a assinatura: nome e função no clube.',
      'Volte e mande a mensagem: ela sai com a assinatura no fim.',
    ],
    /* Configurar não basta: a assinatura precisa ter saído numa mensagem. Uma
       assinatura escrita e nunca usada não demonstra nada. */
    feita: c => assinaturaDizQuemEVoce(c.caixa.assinatura)
      && mensagemDoOnibus(c).some(m => m.assinada),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — O arquivo pesado (requisito 4.2)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_O_ANEXO_VOLTAR = 'viu-o-anexo-voltar';
export const FOTOS = { nome: 'fotos-do-acampamento.zip', mb: 180 };

export const METAS_DO_ARQUIVO_PESADO: Meta[] = [
  {
    id: 'viu-o-anexo-voltar',
    titulo: 'Tentar anexar as fotos e ver o correio recusar',
    detalhe: `São 180 MB, e o provedor aceita ${LIMITE_DE_ANEXO}. `
      + 'Tentar é o único jeito de descobrir por que o anexo não serve — e é o que o '
      + 'requisito 4.2 manda justificar.',
    onde: 'Correio › Escrever › Anexar',
    passos: [
      'Escreva uma mensagem nova para as famílias.',
      'Clique em Anexar e escolha as fotos do acampamento.',
      'Tente enviar: o correio recusa, e diz por quê.',
    ],
    feita: c => viu(c, VIU_O_ANEXO_VOLTAR),
  },
  {
    id: 'mandou-por-vinculo',
    titulo: 'Mandar o vínculo em vez do arquivo',
    detalhe: 'O vínculo não pesa nada, por mais gente que receba. E existe um arquivo só: '
      + 'corrigir o original corrige o que todo mundo abre.',
    onde: 'Correio › Escrever › Inserir vínculo',
    passos: [
      'Tire o anexo da mensagem.',
      'Clique em Inserir vínculo e escolha as fotos.',
      'Agora a mensagem pesa o mesmo que qualquer outra.',
    ],
    feita: c => alguma(c, m => m.vinculos.length > 0 && m.anexos.length === 0),
  },
  {
    id: 'o-vinculo-abre',
    titulo: 'Deixar o vínculo aberto para quem vai recebê-lo',
    detalhe: 'Um vínculo que a pessoa não abre troca um problema barulhento por um quieto: '
      + 'ela clica, cai numa tela de "solicitar acesso", e o pedido espera numa caixa que '
      + 'você não lê. O anexo grande pelo menos volta com erro.',
    onde: 'Correio › na mensagem › o vínculo › Mudar quem abre',
    passos: [
      'No vínculo que você inseriu, clique em Mudar quem abre.',
      'Deixe que qualquer pessoa com o vínculo consiga abrir.',
      'Sem isso, as 52 famílias clicam e não veem nada.',
    ],
    feita: c => alguma(c, m => m.vinculos.some(v => v.quemAbre !== 'so-voce')),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — A caixa que se usa (requisito 4.3)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Quais mensagens pedem alguma coisa de quem lê, e quais não pedem.
 *
 * As duas listas moram **aqui**, e não no modelo: um campo `pedeAcao` na
 * mensagem seria a resposta impressa na tela, que é a mesma decisão do `emUso`
 * que a CC-ES005 recusou. Quem sabe é a meta; o programa mostra a mensagem e
 * quem decide é quem está estudando.
 *
 * `metasDaCcEs007.test.ts` cobra que as duas juntas cubram a caixa inteira:
 * mensagem nova sem classificação reprova ali, do jeito que `ofensiva.test.ts`
 * cobra que todo evento esteja de um dos dois lados.
 */
export const PEDEM_ACAO = ['inscritos', 'autorizacao', 'escala-falcao'];
export const NAO_PEDEM_NADA = ['mural', 'salao', 'boletim', 'obrigada', 'senha', 'regional'];

export const ACHOU_NA_BUSCA = 'achou-na-busca';

export const METAS_DA_CAIXA: Meta[] = [
  {
    id: 'arquivou-o-que-nao-pede-nada',
    titulo: 'Arquivar as seis que não pedem nada de você',
    detalhe: 'A escala já está no mural, o salão está confirmado, a Tia Rute agradeceu. '
      + 'Nenhuma delas espera resposta: o lugar delas não é a caixa de entrada.',
    onde: 'Correio › abra a mensagem › Arquivar',
    passos: [
      'Abra cada mensagem e pergunte: isto espera alguma coisa de mim?',
      'Se não espera, clique em Arquivar.',
      'Arquivar não apaga: a mensagem continua guardada e continua na busca.',
    ],
    /*
      Três coisas juntas, e as duas últimas são **condições**: elas são
      verdadeiras no segundo zero, e como itens da lista ensinariam a não ler a
      lista. Conjugadas aqui, o caminho rápido e errado — esvaziar a entrada,
      ou mandar tudo para a lixeira — deixa **esta** meta vermelha, que é a que
      pede o gesto.
    */
    feita: c => NAO_PEDEM_NADA.every(id =>
      naPasta(c.caixa, 'arquivadas').some(m => m.id === id))
      && PEDEM_ACAO.every(id => naEntrada(c).some(m => m.id === id))
      && naPasta(c.caixa, 'lixeira').length === 0,
  },
  {
    id: 'achou-na-busca',
    titulo: 'Achar na busca uma das que você arquivou',
    detalhe: 'É por isso que arquivar é seguro e excluir não é. Quem acha que tirar da '
      + 'entrada é perder passa três anos com quatro mil mensagens nela.',
    onde: 'Correio › a caixa de pesquisa, no alto',
    passos: [
      'Escreva na busca uma palavra da mensagem que você arquivou — "salão", por exemplo.',
      'Ela aparece, mesmo tendo saído da caixa de entrada.',
      'Experimente procurar por uma que tenha ido para a lixeira: essa não aparece.',
    ],
    feita: c => viu(c, ACHOU_NA_BUSCA),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — A lista da unidade (requisitos 2.4 e 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const membrosDa = (c: ContextoDaComunicacao, id: string) =>
  c.caixa.listas.find(l => l.id === id)?.membros ?? [];

export const METAS_DA_LISTA: Meta[] = [
  {
    id: 'tirou-quem-saiu',
    titulo: 'Tirar da lista do Falcão quem saiu do clube',
    detalhe: 'O Daniel saiu em fevereiro e continua recebendo a conversa interna da '
      + 'unidade. Nada dá erro: as mensagens chegam, certinhas, na caixa de quem não '
      + 'está mais aqui.',
    onde: 'Correio › Configurações › Listas › Unidade Falcão',
    passos: [
      'Abra as Configurações e vá na aba Listas.',
      'Abra a Unidade Falcão e confira quem está nela.',
      'Tire quem não está mais na unidade.',
    ],
    feita: c => !membrosDa(c, 'falcao').includes('daniel'),
  },
  {
    id: 'pos-quem-entrou',
    titulo: 'Pôr na lista quem entrou',
    detalhe: 'A Helena entrou em março e não está nela. Ela não recebe nada, não reclama '
      + 'de nada — e ninguém percebe, porque não falta nada na tela de ninguém.',
    onde: 'Correio › Configurações › Listas › Unidade Falcão',
    passos: [
      'Na Unidade Falcão, acrescente quem entrou depois.',
      'Esquecer de tirar e esquecer de pôr são dois erros diferentes: confira os dois.',
    ],
    feita: c => membrosDa(c, 'falcao').includes('helena'),
  },
  {
    id: 'criou-a-lista-da-aguia',
    titulo: 'Criar a lista da unidade Águia',
    detalhe: 'Uma lista é um apelido para um conjunto de endereços. Ela poupa digitação e '
      + 'poupa o erro de esquecer alguém — mas não esconde ninguém: na entrega ela abre '
      + 'nos endereços de todo mundo.',
    onde: 'Correio › Configurações › Listas › Nova lista',
    passos: [
      'Na aba Listas, clique em Nova lista.',
      'Dê um nome e um endereço a ela.',
      'Ponha os quatro da unidade Águia dentro.',
    ],
    feita: c => c.caixa.listas.some(l => l.id !== 'falcao'
      && AGUIA.every(a => l.membros.includes(a.id))),
  },
  {
    id: 'mandou-pela-lista',
    titulo: 'Mandar a escala de cozinha pela lista do Falcão',
    detalhe: 'Um endereço só, e chegam os cinco. E como eles se conhecem e vão conversar '
      + 'sobre isso, a lista no Para está certa aqui — o que ela não faz é esconder '
      + 'endereço de ninguém.',
    onde: 'Correio › Escrever › Para › o endereço da lista',
    passos: [
      'Escreva uma mensagem com a escala de cozinha da Falcão.',
      'No Para, escreva o endereço da lista, e não os cinco endereços.',
      'Repare em quem recebeu: a lista abriu nos cinco.',
    ],
    feita: c => alguma(c, m => {
      const recebem = new Set(quemRecebe(c.caixa, m));
      const atuais = FALCAO.filter(f => FALCAO_HOJE.includes(f.id));
      return atuais.every(f => recebem.has(f.endereco))
        && m.para.some(p => c.caixa.listas.some(l => l.endereco === p));
    }),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — Quando você não está (requisito 4.5)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DA_AUSENCIA: Meta[] = [
  {
    id: 'ligou-com-fim',
    titulo: 'Ligar a resposta automática com data de começo e de fim',
    detalhe: 'Sem data de fim ela responde em março que você está de férias, e quem escreve '
      + 'conclui que a secretaria do clube parou de funcionar. Não estoura nada: a resposta '
      + 'continua saindo, correta e velha.',
    onde: 'Correio › Configurações › Resposta automática',
    passos: [
      'Abra as Configurações e vá na aba Resposta automática.',
      'Ligue, e escolha o primeiro e o último dia.',
      'Escreva o que quem escrever vai receber.',
    ],
    /*
      A guarda de não contar demais é **condição**, e não tarefa: ela é
      verdadeira no segundo zero — um texto vazio não conta nada — e como item
      da lista abriria verde. Conjugada aqui, quem escrever que a família
      inteira vai viajar deixa **esta** meta vermelha, que é a que pede o gesto.
    */
    feita: c => c.caixa.ausencia.ligada && temFim(c.caixa.ausencia)
      && !contaDemais(c.caixa.ausencia),
  },
  {
    id: 'diz-com-quem-falar',
    titulo: 'Dizer a quem recorrer enquanto você não está',
    detalhe: 'Uma resposta que só diz "estou fora" informa que não vai haver resposta e '
      + 'nada mais: quem escreveu continua esperando do mesmo jeito. Um endereço resolve.',
    onde: 'Correio › Configurações › Resposta automática › o texto',
    passos: [
      'No texto, diga com quem falar: "para o acampamento, fale com a tesouraria".',
      'Escreva o endereço dessa pessoa, e não só o nome — nome sem endereço manda procurar.',
    ],
    feita: c => dizComQuemFalar(c.caixa.ausencia),
  },
  {
    id: 'so-para-quem-o-clube-conhece',
    titulo: 'Responder só a quem já está nos seus contatos',
    detalhe: 'Quem manda mensagem no escuro quer saber se o endereço existe e se tem gente '
      + 'lendo. Responder automaticamente conta as duas coisas — e é o que a resposta de '
      + 'ausência faz a semana inteira, sozinha.',
    onde: 'Correio › Configurações › Resposta automática › a caixinha',
    passos: [
      'Marque a opção de responder só a quem está nos contatos.',
      'O clube continua sendo atendido; quem atirou no escuro não recebe confirmação nenhuma.',
    ],
    feita: c => c.caixa.ausencia.soParaContatos,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — O evento que as pessoas acham (requisitos 2.5 e 5.1)
   ──────────────────────────────────────────────────────────────────────── */

export const EVENTO_REGIONAL = 'regional';

/** Quem foi combinado às 15h **do horário dele**, que é onde ele mora. */
export const COORDENADOR_DO_ACRE = 'coordenacao@clubeamazonia.org.br';
export const HORA_COMBINADA = '15:00';

const regional = (c: ContextoDaComunicacao) =>
  c.agenda.eventos.find(e => e.id === EVENTO_REGIONAL
    || e.titulo.toLowerCase().includes('regional'));

export const METAS_DO_EVENTO: Meta[] = [
  {
    id: 'criou-com-local',
    titulo: 'Criar a reunião regional dizendo onde ela é',
    detalhe: 'Um evento sem local não dá erro: ele aparece na agenda de todo mundo, com '
      + 'hora e título. Metade vai para a igreja e metade para a escola, e às sete alguém '
      + 'começa a telefonar.',
    onde: 'Calendário › Criar › Local',
    passos: [
      'Clique em Criar e dê um título à reunião regional.',
      'Preencha o local: o nome do lugar, e não só "reunião".',
    ],
    feita: c => { const e = regional(c); return !!e && temLocal(e); },
  },
  {
    id: 'com-descricao',
    titulo: 'Escrever na descrição o que não cabe no título',
    detalhe: 'O que vai ser tratado, o que levar, quem procurar. É o campo que responde às '
      + 'perguntas que chegariam por mensagem uma a uma, na véspera.',
    onde: 'Calendário › o evento › Descrição',
    passos: [
      'Escreva duas ou três linhas de descrição.',
      'Diga o que a pessoa precisa saber antes de chegar.',
    ],
    feita: c => { const e = regional(c); return !!e && temDescricao(e); },
  },
  {
    id: 'no-fuso-de-quem-combinou',
    titulo: 'Deixar o coordenador do Acre lendo 15h na agenda dele',
    detalhe: 'Vocês combinaram 15h no horário dele. Criado no fuso de Brasília, o evento '
      + 'chega às 13h na agenda dele — sem erro nenhum, com as duas agendas concordando, '
      + 'e ele entra duas horas antes de a reunião existir.',
    onde: 'Calendário › o evento › Fuso horário',
    passos: [
      'Abra o campo de fuso horário do evento.',
      'Escolha o fuso de quem combinou o horário, e não o seu.',
      'Escrever "15h, horário do Acre" na descrição não muda a agenda de ninguém.',
    ],
    feita: c => { const e = regional(c); return !!e && horaPara(e, FUSO_DO_ACRE) === HORA_COMBINADA; },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 8 — O convite e a resposta (requisitos 2.6 e 5.2)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_QUE_AGUARDANDO_NAO_E_SIM = 'viu-que-aguardando-nao-e-sim';
export const ENDERECO_ERRADO = 'tio.samuel@exmplo.com';
export const CONSELHO_DE_JULHO = 'conselho-julho';

/** O evento do módulo 8: a reunião do conselho de julho, com o convite errado. */
export const reuniaoComConviteErrado = (): Evento => ({
  id: CONSELHO_DE_JULHO,
  titulo: 'Reunião do conselho — julho',
  local: 'Sala da secretaria',
  descricao: 'Fechamento do acampamento, prestação de contas e escala do segundo semestre.',
  dia: '2026-07-28', inicio: '19:30', fim: '21:00',
  fuso: FUSO_DE_BRASILIA,
  calendario: CALENDARIO_DO_CLUBE,
  convidados: [
    { endereco: DIRETOR, resposta: 'sim' },
    { endereco: TESOURARIA, resposta: 'nao' },
    { endereco: 'aguia@clubepioneiros.org.br', resposta: 'talvez' },
    { endereco: 'tucano@clubepioneiros.org.br', resposta: 'aguardando' },
    /* O endereço tem uma letra a menos, e na tela isto é "aguardando" — do
       jeito que é "aguardando" quem recebeu e não decidiu. */
    { endereco: ENDERECO_ERRADO, resposta: 'aguardando', naoChegou: true },
  ],
});

export const METAS_DOS_CONVITES: Meta[] = [
  {
    id: 'viu-que-aguardando-nao-e-sim',
    titulo: 'Olhar as respostas e ver que "aguardando" não quer dizer uma coisa só',
    detalhe: 'Dois estão aguardando. Um viu e não decidiu; o outro nunca recebeu nada — '
      + 'e os dois aparecem com a mesma palavra. É por isso que o requisito diz '
      + 'acompanhar, e não enviar.',
    onde: 'Calendário › a reunião do conselho › Convidados',
    passos: [
      'Abra a reunião do conselho de julho.',
      'Leia a lista de convidados e as respostas.',
      'Olhe os endereços de quem está aguardando, letra por letra.',
    ],
    feita: c => viu(c, VIU_QUE_AGUARDANDO_NAO_E_SIM),
  },
  {
    id: 'consertou-o-endereco-errado',
    titulo: 'Consertar o endereço que tem uma letra a menos',
    detalhe: 'Reenviar para o mesmo endereço errado não muda nada. E o Tio Samuel vai '
      + 'continuar sem saber da reunião até alguém falar com ele no sábado.',
    onde: 'Calendário › a reunião › o convidado › trocar o endereço',
    passos: [
      'Ache o convidado cujo endereço está escrito errado.',
      'Troque pelo endereço certo dele.',
      'Ele volta a aparecer como aguardando — agora porque ainda não respondeu.',
    ],
    feita: c => {
      const e = evt(c, CONSELHO_DE_JULHO);
      if (!e) return false;
      const recebem = e.convidados.map(x => x.endereco);
      return naoChegaram(e).length === 0
        && recebem.includes('falcao@clubepioneiros.org.br')
        && !recebem.includes(ENDERECO_ERRADO);
    },
  },
  {
    id: 'cobrou-quem-nao-respondeu',
    titulo: 'Escrever a quem ainda não respondeu',
    detalhe: 'Ninguém responde convite por esquecimento, e quem organiza costuma ler '
      + '"aguardando" como "vai". A reunião começa com metade das cadeiras vazias e '
      + 'ninguém entende por quê.',
    onde: 'Correio › Escrever',
    passos: [
      'Volte ao correio e escreva a quem está aguardando.',
      'Uma linha basta: a reunião é dia 28, você consegue vir?',
    ],
    feita: c => alguma(c, m => {
      const e = evt(c, CONSELHO_DE_JULHO);
      if (!e) return false;
      const faltam = e.convidados.filter(x => x.resposta === 'aguardando' && !x.naoChegou);
      const recebem = new Set(quemRecebe(c.caixa, m));
      return faltam.length > 0 && faltam.every(x => recebem.has(x.endereco));
    }),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 9 — O que se repete (requisito 5.3, e o mês do requisito 8)
   ──────────────────────────────────────────────────────────────────────── */

export const SABADO_DO_ACAMPAMENTO = '2026-07-04';

const serieSemanal = (c: ContextoDaComunicacao) =>
  c.agenda.eventos.find(e => e.repete?.cada === 'semana'
    && e.calendario === CALENDARIO_DO_CLUBE);

export const METAS_DA_RECORRENCIA: Meta[] = [
  {
    id: 'criou-a-serie-com-fim',
    titulo: 'Criar a reunião de sábado que se repete, com data de fim',
    detalhe: 'O calendário oferece "para sempre", e é o que quase todo mundo aceita — '
      + 'e aí a reunião de sábado do clube chega a 2075. Um fim declarado é uma linha, '
      + 'e é o que obriga alguém a olhar a série de novo no fim do ano.',
    onde: 'Calendário › Criar › Repetir',
    passos: [
      'Crie a reunião de sábado do clube.',
      'Em Repetir, escolha toda semana.',
      'Diga até quando: o fim do semestre, o fim do ano.',
    ],
    feita: c => { const e = serieSemanal(c); return !!e && serieTemFim(e); },
  },
  {
    id: 'desmarcou-so-o-sabado-do-acampamento',
    titulo: 'Desmarcar o sábado do acampamento sem apagar a série',
    detalhe: 'No dia 4 o clube está no acampamento, e não tem reunião. A caixa oferece '
      + 'três opções em letra do mesmo tamanho, e "todos os eventos" apaga o ano inteiro '
      + 'sem perguntar de novo.',
    onde: 'Calendário › o sábado 4 de julho › Excluir › Este evento',
    passos: [
      'Abra a reunião do sábado 4 de julho.',
      'Mande excluir.',
      'Na caixa que abrir, escolha "Este evento" — e leia as outras duas antes.',
    ],
    /*
      Duas coisas, e a segunda é **condição**: a série continuar de pé é
      verdadeira no segundo zero, e como item da lista abriria verde. Conjugada
      aqui, escolher "todos os eventos" deixa **esta** meta vermelha, que é a
      que pede o gesto.
    */
    feita: c => {
      const e = serieSemanal(c);
      if (!e) return false;
      const dias = ocorrencias(e, JULHO.de, JULHO.ate);
      return !dias.includes(SABADO_DO_ACAMPAMENTO) && dias.length >= 3;
    },
  },
  {
    id: 'o-mes-esta-planejado',
    titulo: 'Deixar julho inteiro no calendário do clube',
    detalhe: 'É o que o examinador vai abrir. Os sábados, a saída do acampamento e a '
      + 'reunião do conselho do mês — um mês planejado é o mês que alguém consegue ler '
      + 'sem perguntar nada a você.',
    onde: 'Calendário › julho de 2026',
    passos: [
      'Vá para julho e veja o que já está lá.',
      'Faltam duas coisas que todo mundo sabe de cor e ninguém escreveu: a volta '
      + 'do acampamento, no domingo, e a reunião do conselho do mês.',
      `Um mês planejado é pelo menos ${DIAS_DE_UM_MES_PLANEJADO} dias com alguma coisa.`,
    ],
    feita: c => diasPlanejados(c.agenda, CALENDARIO_DO_CLUBE, JULHO.de, JULHO.ate).length
      >= DIAS_DE_UM_MES_PLANEJADO,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 10 — O calendário do clube (requisitos 5.4 e 5.5)
   ──────────────────────────────────────────────────────────────────────── */

export const OLHOU_A_GRADE = 'olhou-a-grade';
export const PERGUNTOU_A_QUEM_NAO_COMPARTILHA = 'perguntou-ao-marcio';
/**
 * O id com que a solução de referência cria a reunião dos conselheiros.
 *
 * A meta **não** o exige: o calendário dá um id novo a cada evento criado, e
 * exigi-lo deixaria a lição impossível de fechar pela tela. Ele existe para o
 * teste ter como pegar o evento de volta e mexer nele.
 */
export const REUNIAO_DOS_CONSELHEIROS = 'conselheiros';

const calendarioDoClube = (c: ContextoDaComunicacao) =>
  c.agenda.calendarios.find(x => x.id === CALENDARIO_DO_CLUBE);

export const METAS_DO_CALENDARIO: Meta[] = [
  {
    id: 'cada-um-no-nivel-do-trabalho-dele',
    titulo: 'Dar a cada um o nível do trabalho dele',
    detalhe: 'A direção organiza: precisa poder mudar. Os conselheiros participam: '
      + 'precisam ver os detalhes. Não é uma escada de confiança — é o que cada um '
      + 'faz com o calendário.',
    onde: 'Calendário › o calendário do clube › Compartilhar',
    passos: [
      'Abra as opções do calendário do clube, na lateral.',
      'Acrescente a direção com "Fazer alterações".',
      'Acrescente os conselheiros com "Ver todos os detalhes".',
      'Leia, embaixo de cada um, o que aquele nível não deixa fazer.',
    ],
    /*
      A guarda de quem pode apagar o acampamento é **condição**: ela é
      verdadeira no segundo zero, quando ninguém tem acesso nenhum. Conjugada
      aqui, o atalho errado — dar "fazer alterações" a todo mundo, que resolve
      a reclamação de que ninguém consegue marcar nada — deixa **esta** meta
      vermelha, que é a que pede o gesto.
    */
    feita: c => {
      const cal = calendarioDoClube(c);
      if (!cal) return false;
      const nivel = (quem: string) => cal.acessos.find(a => a.quem === quem)?.nivel;
      const direcao = DIRECAO.slice(0, 2).every(d => nivel(d.endereco) === 'alterar');
      const conselheiros = CONSELHEIROS_DO_CLUBE
        .every(x => nivel(x.endereco) === 'ver-detalhes');
      return direcao && conselheiros && quemPodeApagar(cal).length <= 3;
    },
  },
  {
    id: 'olhou-a-grade',
    titulo: 'Olhar a grade de horários antes de marcar',
    detalhe: 'Marcar por cima do compromisso de alguém custa mais do que perguntar: '
      + 'a pessoa aceita por educação e não vem, e ninguém sabe por quê.',
    onde: 'Calendário › Criar › Ver a disponibilidade',
    passos: [
      'Comece a marcar a reunião dos conselheiros.',
      'Antes de escolher a hora, abra a grade de disponibilidade.',
      'Cada faixa pintada é um compromisso que já existe.',
    ],
    feita: c => viu(c, OLHOU_A_GRADE),
  },
  {
    id: 'perguntou-a-quem-nao-compartilha',
    titulo: 'Perguntar ao Tio Márcio, que a grade não consegue ver',
    detalhe: 'A agenda dele não está compartilhada com você, e na grade isso é um espaço '
      + 'em branco — igualzinho ao de quem está livre. A grade responde sobre as agendas '
      + 'que ela conseguiu consultar, e não sobre a vida das pessoas.',
    onde: 'Calendário › a grade › a linha hachurada',
    passos: [
      'Repare na linha hachurada da grade: ela não é "livre", é "não sei".',
      'Use o botão de perguntar a ele.',
      'Ele trabalha, e o trabalho dele não está em calendário nenhum que você veja.',
    ],
    feita: c => viu(c, PERGUNTOU_A_QUEM_NAO_COMPARTILHA),
  },
  {
    id: 'marcou-quando-todos-podem',
    titulo: 'Marcar num horário em que os quatro podem',
    detalhe: 'A primeira janela que a grade oferece é justamente a que ele não pode — '
      + 'e ela parece completa, porque a pessoa que falta é a que ela não viu.',
    onde: 'Calendário › a grade › escolher a faixa',
    passos: [
      'Escolha uma faixa em que ninguém visível está ocupado.',
      `E que sirva para o Tio Márcio, que só pode depois das ${MARCIO_SO_DEPOIS_DE}.`,
      'Confirme e mande os convites.',
    ],
    /*
      A conta procura pelo **dia**, e não por um id fixo.

      O calendário dá um id novo a cada evento criado, como todo calendário
      faz — então uma meta que exigisse `id === 'conselheiros'` nunca fecharia
      pela tela, por mais certo que fosse o horário. Foi a trava que clica que
      achou isso: o motor fechava a lista e a janela não.

      É a mesma decisão de `regional`, no módulo 7, que procura pelo título.
    */
    feita: c => c.agenda.eventos.some(e => {
      if (e.calendario !== CALENDARIO_DO_CLUBE || e.dia !== DIA_DA_REUNIAO) return false;
      if (e.inicio < MARCIO_SO_DEPOIS_DE) return false;
      if (e.inicio >= GRADE.ate) return false;
      return !CONVIDADOS_DA_REUNIAO.some(p => p.compartilha
        && p.ocupado.some(b => b.dia === e.dia && b.inicio < e.fim && b.fim > e.inicio));
    }),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 11 — A reunião a distância (requisito 6)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_O_MICROFONE_FECHADO = 'viu-o-microfone-fechado';

export const METAS_DA_REUNIAO: Meta[] = [
  {
    id: 'agendou-com-o-vinculo',
    titulo: 'Pôr o vínculo da sala no evento da reunião',
    detalhe: 'O vínculo mandado por mensagem se perde na conversa; no evento, ele está '
      + 'onde a pessoa vai olhar na hora — que é o calendário dela, cinco minutos antes.',
    onde: 'Calendário › o evento › Adicionar reunião',
    passos: [
      'Abra o evento da reunião do conselho.',
      'Acrescente o vínculo da sala a distância.',
      'Ele passa a viajar com o convite, para todo mundo.',
    ],
    feita: c => c.agenda.eventos.some(e => !!e.linkDaReuniao),
  },
  {
    id: 'viu-o-microfone-fechado',
    titulo: 'Falar com o microfone fechado, e ver que ninguém ouviu',
    detalhe: 'O aviso está na tela o tempo todo, e todo mundo fala dois minutos assim '
      + 'mesmo. Saber que ele avisa não é a mesma coisa que reparar nele.',
    onde: 'Sala › a barra de baixo › o microfone',
    passos: [
      'Entre na sala.',
      'Fale alguma coisa antes de abrir o microfone.',
      'Repare que abrir depois não faz ninguém ouvir o que já foi dito.',
    ],
    feita: c => naoOuviram(c.reuniao).length > 0 && viu(c, VIU_O_MICROFONE_FECHADO),
  },
  {
    id: 'admitiu-quem-esperava',
    titulo: 'Admitir quem ficou na sala de espera',
    detalhe: 'A Tia Joana entrou pelo celular da irmã, sem conta do clube. O pedido dela '
      + 'aparece por alguns segundos — e quem conduz está olhando o que está apresentando.',
    onde: 'Sala › o pedido, no alto do palco',
    passos: [
      'Repare no aviso de que alguém quer entrar.',
      'Clique em Admitir.',
    ],
    feita: c => naEspera(c.reuniao).length === 0,
  },
  {
    id: 'apresentou-sem-vazar',
    titulo: 'Mostrar a planilha sem entregar a mensagem que chegou',
    detalhe: 'A tela inteira leva tudo o que aparecer nela, inclusive a notificação da '
      + 'tesouraria sobre o dinheiro de uma família. Na sua máquina ela aparece no canto '
      + 'e some; catorze pessoas leram.',
    onde: 'Sala › Apresentar agora › Uma janela',
    passos: [
      'Clique em Apresentar agora.',
      'Leia o que cada uma das três abas leva junto.',
      'Escolha a janela da planilha, e não a tela inteira.',
    ],
    /*
      As duas contas são **históricas**, e não sobre o que a sala está vendo
      agora: só uma apresentação acontece por vez, e medidas pelo estado atual
      esta meta e a do vídeo se excluiriam — a lista nunca fecharia. É o
      defeito que a lição de assinar da CC-ES004 teve, e desta vez ele apareceu
      antes de alguém clicar.

      E a escolha da tela inteira **fica registrada**: o que vazou vazou, do
      jeito que uma mensagem enviada não volta. A meta não trava por causa
      dela — travar deixaria a lição impossível de fechar —, ela mede a
      escolha: mostrar a planilha pela tela inteira não fecha esta tarefa
      nunca, por mais vezes que se repita.
    */
    feita: c => mostrouSemATelaInteira(c.reuniao, PLANILHA)
      && !escolheuATelaInteira(c.reuniao),
  },
  {
    id: 'mostrou-o-video-com-som',
    titulo: 'Mostrar o vídeo do campori com o som',
    detalhe: 'Pela janela do navegador o vídeo chega mudo, e ninguém avisa: a imagem roda, '
      + 'todo mundo olha, e você descobre no fim. Só a guia leva o som, e só com a caixa '
      + 'marcada.',
    onde: 'Sala › Apresentar agora › Uma guia › Compartilhar também o áudio',
    passos: [
      'Apresente de novo, agora escolhendo a guia do vídeo.',
      'Marque a caixa de compartilhar o áudio.',
      'Sem ela, a sala vê o vídeo e não ouve nada.',
    ],
    feita: c => mostrouComSom(c.reuniao, VIDEO),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 12 — A pauta e a ata (requisito 7, e a caixa do requisito 8)
   ──────────────────────────────────────────────────────────────────────── */

export const ITENS_MINIMOS_DA_PAUTA = 3;
export const DECISOES_MINIMAS_DA_ATA = 2;

/** As duas mensagens que chegaram desde a arrumação do módulo 4. */
export const CHEGARAM_DEPOIS: Mensagem[] = [
  {
    id: 'onibus-confirmado',
    de: 'contato@viacaoplanalto.com.br', deNome: 'Viação Planalto',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Confirmação da reserva do ônibus — 3 de julho',
    corpo: 'Reserva confirmada para 3 de julho, saída às 6h. Nada mais é necessário da sua parte.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-24', pasta: 'entrada', lida: false,
  },
  {
    id: 'faltam-dois',
    de: TESOURARIA, deNome: 'Tio Nelson (tesouraria)',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Faltam duas diárias para fechar',
    corpo: 'Ainda faltam duas diárias para fechar a conta do acampamento. '
      + 'Consegue me dizer até sexta quem são?',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-24', pasta: 'entrada', lida: false,
  },
];

export const PEDEM_ACAO_DEPOIS = ['faltam-dois'];
export const NAO_PEDEM_NADA_DEPOIS = ['onibus-confirmado'];

/** Os nomes que uma decisão da ata pode ter como dono. */
export const NOMES_DO_CONSELHO = [
  'Ricardo', 'Cláudia', 'Claudia', 'Nelson', 'Samuel', 'Rute', 'Joana', 'Márcio', 'Marcio',
  'Priscila', 'Edson',
];

const aosParticipantes = (c: ContextoDaComunicacao, m: Mensagem) => {
  const recebem = new Set(quemRecebe(c.caixa, m));
  return DIRECAO.slice(0, 3).every(d => recebem.has(d.endereco));
};

/**
 * A caixa continua arrumada.
 *
 * Condição, e não tarefa: ela é quase verdadeira quando a lição abre — duas
 * mensagens chegaram desde a arrumação do módulo 4 —, e como item da lista
 * ensinaria a não ler a lista. Conjugada nas duas metas que pedem gesto, quem
 * mandar a pauta e a ata sem cuidar da caixa deixa **as duas** vermelhas.
 */
const caixaArrumada = (c: ContextoDaComunicacao) => {
  const pedem = [...PEDEM_ACAO, ...PEDEM_ACAO_DEPOIS];
  const naoPedem = [...NAO_PEDEM_NADA, ...NAO_PEDEM_NADA_DEPOIS];
  return naoPedem.every(id => !naEntrada(c).some(m => m.id === id))
    && pedem.every(id => naEntrada(c).some(m => m.id === id))
    && naPasta(c.caixa, 'lixeira').length === 0;
};

export const METAS_DA_PAUTA: Meta[] = [
  {
    id: 'mandou-a-pauta-antes',
    titulo: 'Mandar a pauta aos participantes antes da reunião',
    detalhe: 'Uma pauta é uma lista: três ou quatro assuntos, na ordem em que vão ser '
      + 'tratados. Um parágrafo dizendo "vamos falar do acampamento e de mais umas coisas" '
      + 'não deixa ninguém preparar nada, que é a única razão de mandar antes.',
    onde: 'Correio › Escrever › para a direção',
    passos: [
      'Escreva a pauta como lista: um item por linha, começando com traço ou número.',
      `Ponha pelo menos ${ITENS_MINIMOS_DA_PAUTA} assuntos.`,
      'Mande para quem vai estar na reunião.',
      'E deixe a caixa de entrada só com o que ainda pede alguma coisa de você.',
    ],
    feita: c => caixaArrumada(c)
      && alguma(c, m => aosParticipantes(c, m)
        && itensDaPauta(m.corpo).length >= ITENS_MINIMOS_DA_PAUTA),
  },
  {
    id: 'mandou-a-ata-com-dono-e-prazo',
    titulo: 'Mandar a ata com quem faz cada coisa e até quando',
    detalhe: '"Ficou combinado que alguém vai ver o som" é a mesma frase de "seria bom se '
      + 'alguém pudesse levar o som", escrita um mês depois: ninguém vê o som, e a ata '
      + 'registrou que a reunião aconteceu e mais nada.',
    onde: 'Correio › Escrever › para a direção',
    passos: [
      'Escreva a ata com as decisões, uma por linha.',
      'Em cada uma, diga quem faz e até quando.',
      `São pelo menos ${DECISOES_MINIMAS_DA_ATA} decisões com dono e prazo.`,
      'Mande para os mesmos participantes.',
    ],
    feita: c => caixaArrumada(c)
      && alguma(c, m => aosParticipantes(c, m)
        && decisoesComDono(m.corpo, NOMES_DO_CONSELHO).length >= DECISOES_MINIMAS_DA_ATA),
  },
];

/* ── O registro das doze lições ───────────────────────────────────────────── */

export type LicaoDaCcEs007 =
  | 'cco' | 'mensagem' | 'pesado' | 'caixa' | 'lista' | 'ausencia'
  | 'evento' | 'convites' | 'recorrente' | 'calendario' | 'reuniao' | 'pauta';

export type ProgramaDaLicao = 'correio' | 'calendario' | 'sala';

export interface LicaoDaComunicacao {
  /** Em qual dos três programas esta lição acontece. */
  programa: ProgramaDaLicao;
  /** De que estado a lição parte. */
  inicial: () => ContextoDaComunicacao;
  /** O rascunho já aberto na janelinha de escrever, quando a lição começa com um. */
  rascunho?: Rascunho;
  metas: Meta[];
}

const doZero = (): ContextoDaComunicacao => {
  const caixa = caixaDoClube();
  return { caixa, caixaAntes: caixa, agenda: agendaDoClube(), reuniao: reuniaoDoConselho(), descobertas: [] };
};

const comEvento = (e: Evento) => (): ContextoDaComunicacao => {
  const c = doZero();
  return { ...c, agenda: criarEvento(c.agenda, e) };
};

/** A série de sábado e a saída, que é o que os módulos anteriores deixaram. */
const SERIE_DE_SABADO = (): Evento => ({
  id: 'sabado',
  titulo: 'Reunião do clube',
  local: 'Igreja Central — salão',
  descricao: 'Reunião semanal: unidades, especialidades e ordem unida. Levar o lenço.',
  dia: '2026-06-27', inicio: '14:00', fim: '17:00',
  fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE,
  convidados: [],
  repete: { cada: 'semana', ate: '2026-12-19', pulados: [SABADO_DO_ACAMPAMENTO] },
});

export const LICOES_DA_CC_ES007: Record<LicaoDaCcEs007, LicaoDaComunicacao> = {
  cco: { programa: 'correio', inicial: doZero, metas: METAS_DA_COPIA_OCULTA },
  mensagem: {
    programa: 'correio', inicial: doZero,
    rascunho: RASCUNHO_DO_ONIBUS, metas: METAS_DA_MENSAGEM,
  },
  pesado: { programa: 'correio', inicial: doZero, metas: METAS_DO_ARQUIVO_PESADO },
  caixa: { programa: 'correio', inicial: doZero, metas: METAS_DA_CAIXA },
  lista: { programa: 'correio', inicial: doZero, metas: METAS_DA_LISTA },
  ausencia: { programa: 'correio', inicial: doZero, metas: METAS_DA_AUSENCIA },
  evento: { programa: 'calendario', inicial: doZero, metas: METAS_DO_EVENTO },
  convites: {
    programa: 'calendario', inicial: comEvento(reuniaoComConviteErrado()),
    metas: METAS_DOS_CONVITES,
  },
  recorrente: { programa: 'calendario', inicial: doZero, metas: METAS_DA_RECORRENCIA },
  calendario: {
    programa: 'calendario', inicial: comEvento(SERIE_DE_SABADO()), metas: METAS_DO_CALENDARIO,
  },
  reuniao: {
    programa: 'sala', inicial: comEvento(reuniaoComConviteErrado()), metas: METAS_DA_REUNIAO,
  },
  /*
    O módulo 12 parte da caixa **já arrumada** pelo módulo 4, com duas
    mensagens que chegaram depois. Começar mandando refazer a arrumação
    ensinaria que o trabalho anterior não conta — é o campo `documento` da
    CC-ES002 e o `caderno` da CC-ES003 outra vez.
  */
  pauta: {
    programa: 'correio',
    inicial: () => {
      const c = doZero();
      const arrumada: Caixa = {
        ...c.caixa,
        mensagens: [
          ...c.caixa.mensagens.map(m => (NAO_PEDEM_NADA.includes(m.id)
            ? { ...m, pasta: 'arquivadas' as const, lida: true } : m)),
          ...CHEGARAM_DEPOIS.map(m => ({ ...m })),
        ],
      };
      return {
        ...c, caixa: arrumada, caixaAntes: arrumada,
        agenda: criarEvento(c.agenda, SERIE_DE_SABADO()),
      };
    },
    metas: METAS_DA_PAUTA,
  },
};

/** O contexto de partida de uma lição. */
export const contextoInicial = (l: LicaoDaCcEs007): ContextoDaComunicacao =>
  LICOES_DA_CC_ES007[l].inicial();

/** Uma palavra que aparece numa das arquivadas, para a busca do módulo 4 ter o que achar. */
export const PALAVRA_DA_BUSCA = 'salão';

export const buscarNaCaixa = (c: ContextoDaComunicacao, termo: string) =>
  buscar(c.caixa, termo);
