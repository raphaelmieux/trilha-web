/**
 * A reunião a distância da CC-ES007, e o que ela deixa acontecer.
 *
 * O requisito 6 pede agendar e **conduzir** uma reunião, demonstrando o
 * compartilhamento de tela. Agendar é o calendário; conduzir é isto. E
 * conduzir só significa alguma coisa se as três coisas que dão errado numa
 * reunião de verdade puderem dar errado aqui:
 *
 * **O microfone desligado.** Todo programa mostra que ele está, e todo mundo
 * fala dois minutos assim mesmo. Uma simulação que não deixasse isso acontecer
 * apagaria o gesto — e o que ela ensinaria é que o programa avisa a tempo,
 * que é exatamente o que não acontece.
 *
 * **A tela inteira e a janela não são a mesma escolha, e nenhuma das duas é
 * sempre certa.** Compartilhar a tela inteira mostra a notificação que chega
 * por cima do slide, com a mensagem particular dentro. Compartilhar uma janela
 * e depois trocar de programa deixa todo mundo olhando a janela parada
 * enquanto você explica outra coisa. A decisão é do requisito, e por isso as
 * duas existem e as duas custam.
 *
 * **E o som da guia não vai junto sozinho.** O vídeo roda, a imagem chega, e
 * ninguém ouve nada — a caixa que resolve isso está na mesma tela e ninguém a
 * marca.
 */

export type OQueCompartilhar = 'tela-inteira' | 'janela' | 'guia';

export const NOME_DO_COMPARTILHAMENTO: Record<OQueCompartilhar, string> = {
  'tela-inteira': 'A tela inteira',
  janela: 'Uma janela',
  guia: 'Uma guia do navegador',
};

/** O que cada escolha entrega junto, que é o que decide entre elas. */
export const OQUE_A_ESCOLHA_LEVA_JUNTO: Record<OQueCompartilhar, string> = {
  'tela-inteira': 'Leva tudo o que aparecer na sua tela, inclusive as notificações '
    + 'que chegarem enquanto você estiver compartilhando.',
  janela: 'Leva só essa janela — e continua levando só ela se você trocar de programa, '
    + 'que é quando todo mundo fica olhando uma tela parada.',
  guia: 'Leva só essa guia. É a única que consegue levar o som junto.',
};

export interface Participante {
  endereco: string;
  nome: string;
  estado: 'na-sala' | 'na-espera' | 'fora';
  microfone: boolean;
}

export interface Compartilhamento {
  oQue: OQueCompartilhar;
  /** A janela ou guia escolhida. Na tela inteira ele não quer dizer nada. */
  alvo: string;
  /** O som da guia vai junto. Só a guia consegue. */
  comSom: boolean;
}

export interface Notificacao {
  de: string;
  texto: string;
}

export interface Fala {
  texto: string;
  /** O microfone estava aberto quando ela saiu. */
  ouviram: boolean;
}

export interface Reuniao {
  link: string;
  /**
   * Quem entra sem esperar.
   *
   * Com `so-do-clube`, quem não tem conta no clube cai na sala de espera — e
   * quem está conduzindo não vê, porque a aba está atrás do que ele está
   * mostrando. A pessoa fica quinze minutos olhando "aguardando o anfitrião".
   */
  quemEntra: 'qualquer-um-com-o-link' | 'so-do-clube';
  naSala: boolean;
  seuMicrofone: boolean;
  suaCamera: boolean;
  participantes: Participante[];
  compartilhando?: Compartilhamento;
  /**
   * Tudo o que você já apresentou nesta reunião.
   *
   * Sem ela, "mostrou a planilha" e "mostrou o vídeo" se excluiriam: só uma
   * apresentação está acontecendo por vez, e a lista nunca fecharia. É o
   * defeito que a lição de assinar da CC-ES004 teve, e desta vez ele foi
   * achado antes de alguém clicar.
   *
   * E é o registro que faz "apresentou sem vazar" medir a **escolha**: quem
   * escolheu a tela inteira uma vez fica com a escolha na lista, do jeito que
   * uma mensagem enviada fica em Enviados.
   */
  apresentacoes: Compartilhamento[];
  /** O que está na frente na **sua** máquina agora. */
  emFoco: string;
  /** As notificações que chegaram desde que a reunião começou. */
  notificacoes: Notificacao[];
  falas: Fala[];
}

/*
  A sala **não** guarda descobertas.

  O que a pessoa viu acontecer é dela, e não da reunião: quem guarda isso é o
  contexto da lição, que é o mesmo para os três programas desta vereda. Um
  segundo campo aqui seria segunda fonte para a mesma coisa, e duas fontes
  divergem no primeiro ajuste — foi o que a trava das metas achou, com a
  solução de referência anotando de um lado e a meta lendo do outro.
*/

/* ── As janelas da sua máquina ────────────────────────────────────────────── */

export const PLANILHA = 'Orçamento do acampamento — Excel';
export const VIDEO = 'Vídeo do campori do ano passado — navegador';
export const CONVERSA = 'Mensagens';

export const JANELAS = [PLANILHA, CONVERSA];
export const GUIAS = [VIDEO];

/* ── O que os outros veem ─────────────────────────────────────────────────── */

/**
 * O que a sala está vendo agora.
 *
 * `undefined` é ninguém compartilhando. A tela inteira mostra o que **está em
 * foco**, que muda quando você troca de programa; a janela e a guia mostram o
 * alvo escolhido, e continuam mostrando ele depois que você foi olhar outra
 * coisa. As duas frases parecem a mesma até alguém trocar de janela.
 */
export function oQueASalaVe(r: Reuniao): string | undefined {
  if (!r.compartilhando) return undefined;
  return r.compartilhando.oQue === 'tela-inteira' ? r.emFoco : r.compartilhando.alvo;
}

/**
 * As notificações que a sala leu junto.
 *
 * Só a tela inteira as entrega — e é a única metade do requisito 6 que não se
 * descobre olhando a tela: na sua máquina a notificação aparece no canto e
 * some, e você não tem como saber que catorze pessoas leram a mensagem que a
 * tesouraria acabou de mandar.
 */
export const notificacoesQueVazaram = (r: Reuniao): Notificacao[] =>
  r.compartilhando?.oQue === 'tela-inteira' ? r.notificacoes : [];

/**
 * A sala está ouvindo o som do que você mostra?
 *
 * Duas condições, e é a segunda que ninguém conhece: só a guia leva o som, e
 * mesmo ela só leva com a caixa marcada. Compartilhar o vídeo pela janela do
 * navegador entrega a imagem e o silêncio.
 */
export const aSalaOuveOSom = (r: Reuniao): boolean =>
  !!r.compartilhando && r.compartilhando.oQue === 'guia' && r.compartilhando.comSom;

/**
 * Você está mostrando uma coisa e olhando outra.
 *
 * Não é erro: é o que acontece quando alguém compartilha a janela da planilha
 * e vai procurar o arquivo no Explorador. A sala fica na planilha parada,
 * ouvindo a explicação de uma tela que ela não está vendo.
 */
export const mostrandoOutraCoisa = (r: Reuniao): boolean => {
  const vendo = oQueASalaVe(r);
  return vendo !== undefined && vendo !== r.emFoco;
};

/* ── Conduzir ─────────────────────────────────────────────────────────────── */

export const entrar = (r: Reuniao): Reuniao => ({ ...r, naSala: true });

export const abrirMicrofone = (r: Reuniao, aberto: boolean): Reuniao =>
  ({ ...r, seuMicrofone: aberto });

export const abrirCamera = (r: Reuniao, aberta: boolean): Reuniao =>
  ({ ...r, suaCamera: aberta });

/**
 * Falar.
 *
 * A fala sai com o microfone do momento em que ela saiu, e não com o de agora:
 * abrir o microfone depois não faz ninguém ouvir o que já foi dito. É o que o
 * requisito 6 quer dizer por conduzir — e é o único jeito de a lição mostrar
 * que o aviso na tela não impede nada.
 */
export const falar = (r: Reuniao, texto: string): Reuniao =>
  ({ ...r, falas: [...r.falas, { texto, ouviram: r.seuMicrofone }] });

export const naoOuviram = (r: Reuniao): Fala[] => r.falas.filter(f => !f.ouviram);

export const compartilhar = (r: Reuniao, c: Compartilhamento): Reuniao =>
  ({ ...r, compartilhando: c, apresentacoes: [...r.apresentacoes, c] });

/** Você já apresentou este alvo sem ser pela tela inteira? */
export const mostrouSemATelaInteira = (r: Reuniao, alvo: string): boolean =>
  r.apresentacoes.some(a => a.alvo === alvo && a.oQue !== 'tela-inteira');

/** Você já mostrou este alvo com o som indo junto? */
export const mostrouComSom = (r: Reuniao, alvo: string): boolean =>
  r.apresentacoes.some(a => a.alvo === alvo && a.oQue === 'guia' && a.comSom);

/**
 * A tela inteira já foi escolhida alguma vez nesta reunião.
 *
 * O que vazou vazou: a notificação foi lida por catorze pessoas e não há como
 * desfazer, do jeito que uma mensagem enviada não volta. A lista não trava por
 * causa disso — travar deixaria a lição impossível de fechar, que é pior do
 * que uma que abre resolvida —, mas a escolha fica registrada, e é dela que a
 * meta fala.
 */
export const escolheuATelaInteira = (r: Reuniao): boolean =>
  r.apresentacoes.some(a => a.oQue === 'tela-inteira');

export const pararDeCompartilhar = (r: Reuniao): Reuniao =>
  ({ ...r, compartilhando: undefined });

export const focar = (r: Reuniao, janela: string): Reuniao => ({ ...r, emFoco: janela });

/**
 * Admitir quem está na sala de espera.
 *
 * Quem conduz é quem admite, e quem conduz é quem está compartilhando a tela —
 * então a aba com o pedido fica atrás do que ele está mostrando. É por isso
 * que a sala de espera existe aqui: para alguém ficar do lado de fora enquanto
 * a reunião acontece.
 */
export const admitir = (r: Reuniao, endereco: string): Reuniao => ({
  ...r,
  participantes: r.participantes.map(p =>
    (p.endereco === endereco && p.estado === 'na-espera' ? { ...p, estado: 'na-sala' } : p)),
});

export const naEspera = (r: Reuniao): Participante[] =>
  r.participantes.filter(p => p.estado === 'na-espera');

export const naSala = (r: Reuniao): Participante[] =>
  r.participantes.filter(p => p.estado === 'na-sala');

/* ── A sala do clube ──────────────────────────────────────────────────────── */

export const LINK_DA_REUNIAO = 'https://reuniao.exemplo.com/clube-pioneiros-conselho';

/**
 * A mensagem que chega no meio da reunião.
 *
 * Ela não é constrangedora de propósito: é da tesouraria, sobre dinheiro de
 * família, e é exatamente o tipo de coisa que chega no meio de uma reunião.
 * Uma mensagem inventada para ser vexatória ensinaria a rir; esta ensina que
 * a tela inteira entrega o que estiver lá, seja o que for.
 */
export const MENSAGEM_QUE_CHEGA: Notificacao = {
  de: 'Tio Nelson (tesouraria)',
  texto: 'A mãe da Gabriela pediu para parcelar a diária dela em três vezes. Pode ser?',
};

export function reuniaoDoConselho(): Reuniao {
  return {
    link: LINK_DA_REUNIAO,
    quemEntra: 'so-do-clube',
    naSala: false,
    seuMicrofone: false,
    suaCamera: false,
    participantes: [
      { endereco: 'diretor@clubepioneiros.org.br', nome: 'Tio Ricardo (direção)', estado: 'na-sala', microfone: true },
      { endereco: 'direcao.associada@clubepioneiros.org.br', nome: 'Tia Cláudia (direção associada)', estado: 'na-sala', microfone: false },
      { endereco: 'falcao@clubepioneiros.org.br', nome: 'Tio Samuel (Falcão)', estado: 'na-sala', microfone: false },
      /*
        A Tia Joana entra pelo celular da irmã, sem conta no clube — e por isso
        cai na sala de espera. É o caso de todo mundo que não usa o correio do
        clube, que num clube de verdade é quase todo mundo.
      */
      { endereco: 'tucano@clubepioneiros.org.br', nome: 'Tia Joana (Tucano)', estado: 'na-espera', microfone: false },
      /*
        O Tio Márcio foi convidado e não veio — está no trabalho, que é o mesmo
        motivo de a agenda dele não estar compartilhada. Ele existe aqui para a
        guarda de `admitir` ter um caso: admitir alcança a sala de espera, e
        quem está fora continua fora. Sem ele, a guarda seria código que nenhum
        teste exercita, e apagá-la não derrubaria nada.
      */
      { endereco: 'arara@clubepioneiros.org.br', nome: 'Tio Márcio (Arara)', estado: 'fora', microfone: false },
    ],
    compartilhando: undefined,
    apresentacoes: [],
    emFoco: PLANILHA,
    notificacoes: [MENSAGEM_QUE_CHEGA],
    falas: [],
  };
}
