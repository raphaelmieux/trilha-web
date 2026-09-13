import type { Badge } from '../types';

/*
  O que a plataforma sabe sobre uma insígnia conquistada, e por onde isso viaja.

  ── O que se guarda, e o que se deriva ────────────────────────────────────
  A regra é a mesma de sempre aqui: guarda-se o que **só aquele instante
  sabia**, e deriva-se todo o resto.

  `evaluateBadges` reavalia o catálogo inteiro contra o estado atual — ela não
  recebe "o que acabou de acontecer", ela pergunta "o que está verdadeiro
  agora?". Depois que a linha é gravada, nada no banco sabe dizer **qual ação**
  fez aquela insígnia cair, nem em que percurso a pessoa estava. Isso é
  conhecimento do momento, e por isso é gravado.

  O contrário também vale: a família da insígnia, o critério dela, a classe e
  o ícone **não** vão para cá. Estão no catálogo em código, e guardar de novo
  seria a segunda cópia que diverge no primeiro ajuste.

  ── Onde isso mora ────────────────────────────────────────────────────────
  Em `user_badges.context`, que é `jsonb NOT NULL DEFAULT '{}'` desde a
  migration original e nunca foi escrito nem lido por ninguém. Nenhuma coluna
  nova, nenhuma migration: a prateleira já estava lá, vazia.

  ── E o que já está na estante de todo mundo ──────────────────────────────
  Fica com `{}`, que é o que sempre esteve. A tela **não inventa**: ela mostra
  o feito, que se deriva do catálogo, e a data, que sempre existiu em
  `awarded_at` — e cala sobre o percurso quando não sabe. É o mesmo padrão do
  `umDe`: o lado que reivindica menos.
*/

/** O que estava acontecendo quando a insígnia caiu. Tudo opcional de propósito. */
export interface ContextoDaConquista {
  /** O `event_type` da ação — 'lesson_completed', 'agenda_concluida'… */
  evento?: string;
  /** O código da trilha ou da vereda: 'AP044', 'CC002'. */
  percurso?: string;
  /** O código da lição, quando a ação foi uma lição. */
  licao?: string;
}

/** O gatilho que `evaluateBadges` recebe de quem a chama. */
export type GatilhoDaConquista = ContextoDaConquista;

/** Uma insígnia com o que a linha de `user_badges` sabe sobre ela. */
export interface InsigniaConquistada extends Badge {
  /** Quando caiu. Sempre existe — é `user_badges.awarded_at`. */
  conquistadaEm?: string;
  contexto?: ContextoDaConquista;
}

/*
  ── O canal de `lib` para a tela ──────────────────────────────────────────

  `evaluateBadges` devolvia `void`, e é essa a razão técnica de ninguém saber
  em tempo real que ganhou alguma coisa: a insígnia era gravada e o assunto
  morria ali. A pessoa só descobria navegando até a estante, dias depois,
  sem nada ligando o prêmio ao que ela tinha feito para merecê-lo.

  Ela é chamada de dentro de `progress.ts`, em dois lugares, os dois
  `.catch(() => {})` — fogo e esquece, fora de qualquer componente. Passar um
  callback até lá obrigaria toda tela que conclui alguma coisa a carregar um
  parâmetro que não é dela. Um publicador com um assinante resolve sem tocar
  em chamada nenhuma.

  Sem dependência nova: são dez linhas, e o que elas fazem é o que um emissor
  de eventos faz.
*/
type Assinante = (conquistas: InsigniaConquistada[]) => void;

const assinantes = new Set<Assinante>();

/** Escuta as conquistas. Devolve como parar de escutar. */
export function ouvirConquistas(assinante: Assinante): () => void {
  assinantes.add(assinante);
  return () => { assinantes.delete(assinante); };
}

/**
 * Anuncia o que acabou de ser conquistado.
 *
 * Um assinante que estoure não pode derrubar quem gravou a conquista: a
 * insígnia já está no banco, e uma falha ao desenhar o aviso não é motivo
 * para a chamada que a concedeu falhar.
 */
export function anunciarConquistas(conquistas: InsigniaConquistada[]): void {
  if (conquistas.length === 0) return;
  for (const assinante of assinantes) {
    try {
      assinante(conquistas);
    } catch (erro) {
      console.error('assinante de conquista falhou:', erro);
    }
  }
}
