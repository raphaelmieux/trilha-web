/**
 * As três famílias de erro, e a classificação que o requisito 6 pede.
 *
 * ── Por que classificar, e não só consertar ──────────────────────────────
 * O requisito 6 da CC002 pede identificar, corrigir **e classificar** os erros
 * de um programa. As três coisas são uma só habilidade vista de três lados, e a
 * do meio é a única que o computador já faz por você: o Python aponta a linha
 * do erro de sintaxe e escreve o traceback do erro de execução. Ele não escreve
 * nada sobre o erro de lógica — e é justamente o de lógica que vai custar caro
 * a vida inteira.
 *
 * Classificar é o que obriga a olhar **quando** o erro apareceu, e é por aí que
 * se acha o de lógica: ele é o que sobra depois que o programa rodou até o fim
 * sem reclamar de nada.
 *
 * ── O que não se faz aqui ────────────────────────────────────────────────
 * Nada nesta lista diz onde a falha está nem como consertá-la. O sintoma é o
 * que se vê acontecer; achar a linha é o laboratório. Uma lista que dissesse
 * "linha 7, troque = por ==" seria o gabarito com outro nome, e o painel
 * abriria resolvido — o defeito que já custou caro duas vezes aqui.
 */

/** As três famílias, pela hora em que cada uma aparece. */
export type CategoriaDeFalha = 'sintaxe' | 'execucao' | 'logica';

export const ORDEM_DAS_CATEGORIAS: CategoriaDeFalha[] = ['sintaxe', 'execucao', 'logica'];

export interface Categoria {
  nome: string;
  /** Quando ela aparece — é isto que separa as três. */
  quando: string;
  /** O que se vê na tela quando é esta. */
  comoSeVe: string;
  /**
   * O que teria acontecido se fosse esta — a frase que volta para quem
   * classificou errado.
   *
   * Ela não diz qual é a certa: manda olhar a evidência que já está na tela.
   * Dizer a resposta transformaria três botões em três tentativas, e quem
   * chutasse até acertar teria a tarefa verde sem ter entendido nada.
   */
  desmentido: string;
}

export const CATEGORIAS: Record<CategoriaDeFalha, Categoria> = {
  sintaxe: {
    nome: 'Erro de sintaxe',
    quando: 'Antes de rodar',
    comoSeVe: 'O Python recusa o arquivo e aponta a linha. Nada acontece — nem a primeira linha do programa chega a rodar.',
    desmentido: 'Se fosse de sintaxe, o Python teria recusado o arquivo e nenhuma linha teria saído. Confira se o programa chegou a escrever alguma coisa antes de falhar.',
  },
  execucao: {
    nome: 'Erro de execução',
    quando: 'No meio do caminho',
    comoSeVe: 'O programa começa, escreve o que já tinha para escrever, e para no meio com uma mensagem de erro.',
    desmentido: 'Se fosse de execução, o programa teria parado no meio e deixado uma mensagem de erro. Confira se apareceu mensagem, e se ele chegou ao fim.',
  },
  logica: {
    nome: 'Erro de lógica',
    quando: 'Nunca — e é isso que o torna o pior',
    comoSeVe: 'O programa roda até o fim sem reclamar de nada. Só a resposta é que está errada.',
    desmentido: 'Se fosse de lógica, o programa teria ido até o fim sem mensagem nenhuma. Confira se o Python reclamou de alguma coisa.',
  },
};

/**
 * Uma falha plantada no programa da lição.
 *
 * O `sintoma` é o que a pessoa vê acontecer, escrito como ela veria — e não
 * como quem plantou a falha sabe que ela é. "A idade sai sempre como texto" é
 * sintoma; "falta um int() na linha 4" é gabarito.
 */
export interface FalhaPlantada {
  id: string;
  sintoma: string;
  categoria: CategoriaDeFalha;
}

/** O que a pessoa marcou até agora. `null` é o que ainda não foi respondido. */
export type Classificacao = Record<string, CategoriaDeFalha | null>;

/**
 * O painel abre com tudo por responder.
 *
 * Não é detalhe: um painel que abrisse com a primeira já marcada entregaria
 * uma resposta e deixaria a tarefa a um passo do verde. É a mesma regra do
 * modelo dos outros laboratórios — o que vem de fábrica é o que ninguém fez.
 */
export const classificacaoInicial = (falhas: FalhaPlantada[]): Classificacao =>
  Object.fromEntries(falhas.map(f => [f.id, null]));

export interface ConferenciaDeFalha {
  id: string;
  sintoma: string;
  /** O que a pessoa marcou, ou `null` enquanto não marcou nada. */
  marcada: CategoriaDeFalha | null;
  certa: boolean;
  /** Por que a marcada não serve. Só existe quando há uma marcada e ela erra. */
  recado?: string;
}

/** Confere falha por falha, sem dizer qual é a certa. */
export function conferirClassificacao(
  falhas: FalhaPlantada[],
  escolhas: Classificacao,
): ConferenciaDeFalha[] {
  return falhas.map(f => {
    const marcada = escolhas[f.id] ?? null;
    const certa = marcada === f.categoria;
    return {
      id: f.id,
      sintoma: f.sintoma,
      marcada,
      certa,
      recado: marcada && !certa ? CATEGORIAS[marcada].desmentido : undefined,
    };
  });
}

/**
 * O resumo que a verificação da lista de tarefas usa.
 *
 * `zero de zero não é tudo`: uma lição sem falha nenhuma escrita não tem o que
 * classificar, e "todas certas" seria verdade por vacuidade — a mesma armadilha
 * do "sem links quebrados" numa página sem link. Sem falhas, `completa` é
 * falsa, e o motivo fica escrito.
 */
export function resumoDaClassificacao(falhas: FalhaPlantada[], escolhas: Classificacao): {
  completa: boolean;
  detalhe?: string;
} {
  if (falhas.length === 0) {
    return { completa: false, detalhe: 'Esta lição não descreve falha nenhuma para classificar.' };
  }
  const conferidas = conferirClassificacao(falhas, escolhas);
  const semResposta = conferidas.filter(c => c.marcada === null).length;
  if (semResposta > 0) {
    return {
      completa: false,
      detalhe: semResposta === conferidas.length
        ? `Classifique as ${conferidas.length} falhas no painel de Problemas.`
        : `Ainda faltam ${semResposta} de ${conferidas.length} por classificar.`,
    };
  }
  const erradas = conferidas.filter(c => !c.certa).length;
  if (erradas > 0) {
    return {
      completa: false,
      /* Diz quantas, e não quais: quais está no painel, com o recado ao lado
         de cada uma. Repetir aqui faria a lista de tarefas competir com o
         painel, e as duas dizendo metade. */
      detalhe: erradas === 1
        ? 'Uma das classificações não fecha com o que aconteceu. O painel diz qual.'
        : `${erradas} classificações não fecham com o que aconteceu. O painel diz quais.`,
    };
  }
  return { completa: true };
}
