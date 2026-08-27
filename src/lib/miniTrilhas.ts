import { supabase } from './supabase';
import { logActivity } from './progress';
import {
  MINI_TRILHAS, topicosDaMiniTrilha, type MiniTrilha,
} from '../curriculum/miniTrilhas';
import { objeto, type EventoDeAtividade } from './atividade';

/*
 * O que a plataforma guarda sobre a leitura de uma mini-trilha.
 *
 * ── Nenhuma tabela nova ──────────────────────────────────────────────────
 * Cada tópico lido vira um evento em `activity_events`, que é onde as
 * insígnias já procuram tudo. Uma tabela nova obrigaria a inventar histórico
 * para quem já usa o aplicativo, e a regra do catálogo de insígnias é
 * justamente essa: todo critério sai do que já é guardado.
 *
 * ── Por que no servidor, e não no navegador ──────────────────────────────
 * O rascunho de código fica no navegador porque é rascunho — some na entrega.
 * A leitura, não: quem lê metade no celular e metade no computador do clube
 * nunca chegaria ao fim se cada aparelho contasse a sua metade. E o clube
 * costuma ter um computador só, então o progresso não pode morar nele.
 *
 * ── O evento por tópico não vai para o mural ─────────────────────────────
 * Vinte e dois tópicos dariam vinte e duas linhas em "Atividade Recente", e
 * o mural viraria o registro de rolagem de página de alguém. Quem aparece lá
 * é `mini_trilha_completed`, uma vez. Os dois convivem: o de tópico conta o
 * progresso, o de conclusão conta a história.
 */

export const EVENTO_TOPICO = 'mini_trilha_topico';
export const EVENTO_CONCLUSAO = 'mini_trilha_completed';

/** Os tópicos já lidos, por mini-trilha. */
export type LeituraDeMiniTrilhas = Record<string, Set<string>>;

/** Monta o mapa de leitura a partir dos eventos que já se tem em mãos. */
export function leituraDosEventos(eventos: EventoDeAtividade[]): LeituraDeMiniTrilhas {
  const lido: LeituraDeMiniTrilhas = {};
  for (const e of eventos) {
    if (e.event_type !== EVENTO_TOPICO) continue;
    const m = objeto(e.metadata);
    const trilha = typeof m.trilha === 'string' ? m.trilha : null;
    const topico = typeof m.topico === 'string' ? m.topico : null;
    if (!trilha || !topico) continue;
    (lido[trilha] ??= new Set()).add(topico);
  }
  return lido;
}

/**
 * Quais mini-trilhas foram percorridas até o fim.
 *
 * Conta tópicos distintos contra o que a trilha tem hoje. Acrescentar um
 * tópico a uma mini-trilha já concluída a reabre para quem a terminou — e
 * isso é o certo: existe material novo que essa pessoa não leu. A insígnia
 * já conquistada não se perde, porque insígnia não se perde.
 */
export function miniTrilhasConcluidas(eventos: EventoDeAtividade[]): string[] {
  const lido = leituraDosEventos(eventos);
  return MINI_TRILHAS
    .filter(t => (lido[t.id]?.size ?? 0) >= topicosDaMiniTrilha(t).length)
    .map(t => t.id);
}

/** Quantos tópicos de cada mini-trilha já foram lidos, para a barra de progresso. */
export function progressoDasMiniTrilhas(eventos: EventoDeAtividade[]): Record<string, number> {
  const lido = leituraDosEventos(eventos);
  return Object.fromEntries(MINI_TRILHAS.map(t => [t.id, lido[t.id]?.size ?? 0]));
}

/** Busca só os eventos de mini-trilha de alguém. */
export async function buscarLeitura(userId: string): Promise<EventoDeAtividade[]> {
  const { data } = await supabase
    .from('activity_events')
    .select('event_type, metadata, created_at')
    .eq('user_id', userId)
    .in('event_type', [EVENTO_TOPICO, EVENTO_CONCLUSAO]);
  return (data ?? []) as EventoDeAtividade[];
}

/**
 * Grava que um tópico foi lido, e a conclusão quando ele for o último.
 *
 * `jaLidos` é o que a tela já sabe: sem isso, reabrir um tópico gravaria de
 * novo, e a contagem de "quantos li" viraria "quantas vezes cliquei".
 */
export async function registrarTopicoLido(
  userId: string,
  trilha: MiniTrilha,
  topicoId: string,
  jaLidos: Set<string>,
): Promise<boolean> {
  if (jaLidos.has(topicoId)) return false;
  await logActivity(userId, EVENTO_TOPICO, { trilha: trilha.id, topico: topicoId });

  const agora = new Set(jaLidos).add(topicoId);
  if (agora.size >= topicosDaMiniTrilha(trilha).length) {
    await logActivity(userId, EVENTO_CONCLUSAO, {
      trilha: trilha.id, codigo: trilha.codigo, topicos: agora.size,
    });
  }
  return true;
}
