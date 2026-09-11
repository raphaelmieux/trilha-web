/**
 * O que o laboratório de correio da AP044 cobra, e de onde parte.
 *
 * Modelo e critério fora do componente, pela razão de sempre.
 *
 * ── O requisito 11, e o que ele tem de diferente do da AP034 ─────────────
 * A AP034 tem um laboratório de correio, e ele ensina a **receber**: reconhecer
 * golpe, conferir remetente, desconfiar de anexo. Este ensina a **enviar**, que
 * é o lado em que o desbravador de doze anos faz estrago sem nenhum golpista
 * envolvido.
 *
 * ── Cco não é "o terceiro campo" ─────────────────────────────────────────
 * Sessenta endereços no campo Para entregam o e-mail de sessenta famílias a
 * sessenta pessoas. Ninguém autorizou, ninguém foi avisado, e não há como
 * desfazer. Por isso a tarefa do Cco não é "usar o campo": é **a lista grande
 * estar nele**, e o laboratório mostra, na hora de enviar, o que cada família
 * vai ver.
 *
 * E enviar errado não é bloqueado. A simulação que vira muro no primeiro
 * desvio ensina a andar no trilho; esta deixa enviar, mostra o estrago e
 * deixa a tarefa vermelha — que é o que a vida faz, tirando a parte de deixar
 * refazer.
 */

export interface Mensagem {
  id: string;
  de: string;
  deNome: string;
  assunto: string;
  corpo: string;
  /** Está na caixa de entrada; arquivar tira daqui sem apagar. */
  arquivada: boolean;
}

export interface Enviada {
  para: string[];
  cc: string[];
  cco: string[];
  assunto: string;
  corpo: string;
  anexos: string[];
  /** A assinatura configurada entrou no fim da mensagem. */
  comAssinatura: boolean;
  origem: 'novo' | 'resposta' | 'encaminhamento';
  /** Encaminhar leva a conversa inteira embaixo. */
  historico?: string;
}

export interface Correio {
  caixa: Mensagem[];
  enviadas: Enviada[];
  /** O texto que entra sozinho no fim de toda mensagem, ou vazio. */
  assinatura: string;
}

/** As sessenta famílias do clube, que é o que não pode aparecer no Para. */
export const FAMILIAS: string[] = Array.from({ length: 60 }, (_, i) =>
  `familia${String(i + 1).padStart(2, '0')}@exemplo.com`);

export const DIRETOR = 'diretor@clubepioneiros.org.br';
export const SECRETARIA = 'secretaria@clubepioneiros.org.br';

export const ANEXOS_DISPONIVEIS = [
  'autorizacao-acampamento.pdf',
  'lista-do-que-levar.pdf',
  'foto-do-ano-passado.jpg',
];

export const CAIXA_INICIAL: Mensagem[] = [
  {
    id: 'm1', de: SECRETARIA, deNome: 'Secretaria do Clube',
    assunto: 'Confirmação do ônibus',
    corpo: 'O ônibus está confirmado para sexta às 6h, saindo da igreja. Precisamos do número final de inscritos até quarta.',
    arquivada: false,
  },
  {
    id: 'm2', de: DIRETOR, deNome: 'Direção do Clube',
    assunto: 'Escala das unidades — já resolvido',
    corpo: 'A escala saiu e está afixada no mural. Obrigado a todos que ajudaram.',
    arquivada: false,
  },
  {
    id: 'm3', de: 'tesouraria@clubepioneiros.org.br', deNome: 'Tesouraria',
    assunto: 'Valor das diárias',
    corpo: 'A diária ficou em R$ 45. Quem for pagar em duas vezes precisa avisar até o dia 20.',
    arquivada: false,
  },
];

export const CORREIO_INICIAL: Correio = {
  caixa: CAIXA_INICIAL,
  enviadas: [],
  assinatura: '',
};

/** As mensagens que a caixa de entrada mostra: arquivar tira daqui. */
export const naCaixaDeEntrada = (c: Correio) => c.caixa.filter(m => !m.arquivada);

/** Quantos endereços a mensagem mostra a quem a recebe. */
export const enderecosVisiveis = (e: Enviada) => [...e.para, ...e.cc];

export interface MetaDoCorreio {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: Correio) => boolean;
}

/* Uma lista grande é o que o Cco existe para proteger. Três é o bastante para
   deixar de ser "avisar uma pessoa" e virar "avisar um grupo". */
const LISTA_GRANDE = 3;

const alguma = (c: Correio, f: (e: Enviada) => boolean) => c.enviadas.some(f);

export const METAS_DO_CORREIO: MetaDoCorreio[] = [
  {
    id: 'para',
    titulo: 'Pôr no Para quem precisa agir',
    detalhe: 'O aviso do acampamento é dirigido à secretaria, que vai fechar a lista. Ela vai no Para — o campo de quem responde ou toma providência.',
    onde: 'Escrever › campo Para',
    passos: [
      'Clique em Escrever.',
      `No campo Para, escreva ${SECRETARIA}.`,
      'Para é de quem precisa agir. Quem só acompanha vai no Cc.',
    ],
    feita: c => alguma(c, e => e.para.length >= 1),
  },
  {
    id: 'copia',
    titulo: 'Pôr o diretor em cópia',
    detalhe: 'Ele não precisa fazer nada, só ficar sabendo. É exatamente o que o Cc quer dizer, e todo mundo vê quem está ali.',
    onde: 'Escrever › Cc',
    passos: [
      'Clique em Cc, ao lado do campo Para.',
      `Escreva ${DIRETOR}.`,
      'Cc mostra a lista a todos — e é para isso mesmo que ele serve aqui.',
    ],
    feita: c => alguma(c, e => e.cc.length >= 1),
  },
  {
    id: 'oculta',
    titulo: 'Pôr as sessenta famílias em cópia oculta',
    detalhe: 'Elas não se conhecem e não combinaram trocar endereço. No Para ou no Cc, cada família recebe a lista das outras cinquenta e nove — e não há como desfazer.',
    onde: 'Escrever › Cco',
    passos: [
      'Clique em Cco, ao lado de Cc.',
      'Use o botão da lista do clube para trazer as sessenta famílias.',
      'Antes de enviar, confira a prévia: ela mostra o que cada família vai ver.',
    ],
    /*
      Não basta o Cco ter alguém: a lista grande precisa estar **nele**.

      Uma mensagem com uma família no Cco e cinquenta e nove no Para tem o campo
      preenchido e vazou tudo. O que a tarefa mede é o vazamento não ter
      acontecido.
    */
    feita: c => alguma(c, e => e.cco.length >= LISTA_GRANDE
      && enderecosVisiveis(e).length < LISTA_GRANDE),
  },
  {
    id: 'anexo',
    titulo: 'Anexar a autorização',
    detalhe: 'O arquivo viaja junto com a mensagem. Confira o que você anexou antes de enviar: anexar a versão errada é tão comum quanto esquecer de anexar.',
    onde: 'Escrever › Anexar arquivo',
    passos: [
      'Na barra de baixo da janela de escrever, clique no clipe.',
      'Escolha a autorização do acampamento.',
      'O nome do arquivo aparece embaixo do texto — confira se é esse mesmo.',
    ],
    feita: c => alguma(c, e => e.anexos.length >= 1),
  },
  {
    id: 'assinatura',
    titulo: 'Personalizar a assinatura',
    detalhe: 'Nome, função no clube e contato, que entram sozinhos no fim de toda mensagem. Ela poupa digitação e diz a quem recebe quem é você.',
    onde: 'Configurações › Assinatura',
    passos: [
      'Abra as Configurações, na engrenagem.',
      'Escreva a assinatura: nome, função no clube e contato.',
      'Volte e escreva uma mensagem: ela já vem com a assinatura no fim.',
    ],
    /* Configurar não basta: a assinatura precisa ter saído numa mensagem. Uma
       assinatura escrita e nunca usada não demonstra nada. */
    feita: c => c.assinatura.trim().length >= 10 && alguma(c, e => e.comAssinatura),
  },
  {
    id: 'enviar',
    titulo: 'Enviar a mensagem',
    detalhe: 'Antes do clique: conferi os campos, reli o que vai embaixo, e o anexo é mesmo esse? O que sai não volta.',
    onde: 'Escrever › Enviar',
    passos: [
      'Releia os campos e o texto.',
      'Clique em Enviar.',
      'A mensagem vai para Enviados, e de lá não sai.',
    ],
    feita: c => c.enviadas.length >= 1,
  },
  {
    id: 'arquivar',
    titulo: 'Arquivar uma mensagem resolvida',
    detalhe: 'A da escala já está resolvida. Arquivar tira da caixa de entrada e guarda — a mensagem continua existindo e continua aparecendo na busca. Excluir é outra coisa.',
    onde: 'Na mensagem › Arquivar',
    passos: [
      'Abra a mensagem sobre a escala das unidades.',
      'Clique em Arquivar, no alto.',
      'Ela sai da caixa de entrada e continua guardada — não foi para a lixeira.',
    ],
    feita: c => c.caixa.some(m => m.arquivada),
  },
  {
    id: 'responder',
    titulo: 'Responder a quem escreveu',
    detalhe: 'Responder volta só para quem escreveu. Numa lista de duzentos, "combinado, obrigado!" para todos são duzentas interrupções.',
    onde: 'Na mensagem › Responder',
    passos: [
      'Abra a mensagem da secretaria sobre o ônibus.',
      'Clique em Responder.',
      'O campo Para já vem preenchido com quem escreveu — só com ele.',
    ],
    feita: c => alguma(c, e => e.origem === 'resposta' && e.corpo.trim().length >= 5),
  },
  {
    id: 'encaminhar',
    titulo: 'Encaminhar, e reler o que vai embaixo',
    detalhe: 'Encaminhar leva tudo o que está embaixo — a conversa inteira, inclusive o trecho que você não releu. É o jeito mais comum de mostrar a alguém uma coisa que não era para ela.',
    onde: 'Na mensagem › Encaminhar',
    passos: [
      'Abra a mensagem da tesouraria sobre as diárias.',
      'Clique em Encaminhar e escolha para quem.',
      'Repare no que vem embaixo do seu texto: é a mensagem inteira, e ela vai junto.',
    ],
    feita: c => alguma(c, e => e.origem === 'encaminhamento' && e.para.length >= 1),
  },
];
