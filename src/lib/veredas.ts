import { supabase } from './supabase';
import { logActivity } from './progress';
import {
  VEREDAS, licoesDaVereda, type Vereda, type LicaoDeVereda,
} from '../curriculum/veredas';
import { objeto, type EventoDeAtividade } from './atividade';

/*
 * O que a plataforma guarda sobre o percurso de uma vereda.
 *
 * ── Nenhuma tabela nova ──────────────────────────────────────────────────
 * Cada tópico lido e cada laboratório vencido viram eventos em
 * `activity_events`, que é onde as insígnias já procuram tudo. Uma tabela
 * nova obrigaria a inventar histórico para quem já usa o aplicativo, e a
 * regra do catálogo de insígnias é justamente essa: todo critério sai do que
 * já é guardado.
 *
 * ── Por que no servidor, e não no navegador ──────────────────────────────
 * O rascunho de código fica no navegador porque é rascunho — some na entrega.
 * O percurso, não: quem lê metade no celular e metade no computador do clube
 * nunca chegaria ao fim se cada aparelho contasse a sua metade. E o clube
 * costuma ter um computador só, então o progresso não pode morar nele.
 *
 * ── O evento por tópico não vai para o mural ─────────────────────────────
 * Vinte e dois tópicos dariam vinte e duas linhas em "Atividade Recente", e
 * o mural viraria o registro de rolagem de página de alguém. Quem aparece lá
 * é o laboratório vencido e a vereda concluída.
 */

export const EVENTO_TOPICO = 'vereda_topico';
export const EVENTO_LABORATORIO = 'vereda_laboratorio';
export const EVENTO_TEORIA = 'vereda_teoria';
export const EVENTO_CONCLUSAO = 'vereda_completed';

/*
  Os nomes antigos continuam sendo lidos.

  A vereda se chamava mini-trilha por uma hora, e nessa hora houve quem lesse.
  Apagar o que essa pessoa fez para arrumar um nome seria cobrar dela o preço
  de uma decisão nossa. Grava-se o nome novo; leem-se os dois.
*/
const EVENTOS_DE_TOPICO = [EVENTO_TOPICO, 'mini_trilha_topico'];
const EVENTOS_DE_CONCLUSAO = [EVENTO_CONCLUSAO, 'mini_trilha_completed'];
const TODOS_OS_EVENTOS = [
  ...EVENTOS_DE_TOPICO, EVENTO_TEORIA, EVENTO_LABORATORIO, ...EVENTOS_DE_CONCLUSAO,
];

/** O que já foi vencido em cada vereda. */
export interface PercursoDeVereda {
  /** Lições vencidas, de qualquer tipo: teoria respondida, laboratório feito. */
  licoes: Set<string>;
  /*
    Tópicos abertos, do tempo em que abrir bastava para vencer a teoria.

    Não são mais gravados — a teoria agora se vence respondendo, como toda
    lição de teoria da plataforma. Continuam sendo lidos para que quem
    percorreu a vereda sob a regra antiga não perca o que fez: uma decisão
    nossa não se cobra de quem já andou.
  */
  topicos: Set<string>;
}

export type PercursoDasVeredas = Record<string, PercursoDeVereda>;

export const percursoVazio = (): PercursoDeVereda => ({ licoes: new Set(), topicos: new Set() });

/** Monta o percurso a partir dos eventos que já se tem em mãos. */
export function percursoDosEventos(eventos: EventoDeAtividade[]): PercursoDasVeredas {
  const feito: PercursoDasVeredas = {};
  for (const e of eventos) {
    const m = objeto(e.metadata);
    const vereda = typeof m.vereda === 'string' ? m.vereda
      : typeof m.trilha === 'string' ? m.trilha : null;
    if (!vereda) continue;

    if (EVENTOS_DE_TOPICO.includes(e.event_type)) {
      const topico = typeof m.topico === 'string' ? m.topico : null;
      if (topico) (feito[vereda] ??= percursoVazio()).topicos.add(topico);
    } else if (e.event_type === EVENTO_LABORATORIO || e.event_type === EVENTO_TEORIA) {
      const licao = typeof m.licao === 'string' ? m.licao : null;
      if (licao) (feito[vereda] ??= percursoVazio()).licoes.add(licao);
    }
  }
  return feito;
}

/**
 * Uma lição está vencida?
 *
 * O evento dela basta, para os dois tipos. A teoria aceita também o registro
 * antigo — todos os tópicos abertos —, que é o que quem percorreu a vereda
 * antes das questões tem gravado. Nada novo entra por esse caminho: o evento
 * de tópico deixou de ser escrito.
 */
export function licaoVencida(licao: LicaoDeVereda, feito: PercursoDeVereda | undefined): boolean {
  if (!feito) return false;
  if (feito.licoes.has(licao.id)) return true;
  return licao.tipo === 'teoria' && licao.topicos.every(t => feito.topicos.has(t.id));
}

/** Quantas lições de uma vereda já foram vencidas. */
export function licoesVencidas(vereda: Vereda, feito: PercursoDeVereda | undefined): number {
  return licoesDaVereda(vereda).filter(l => licaoVencida(l, feito)).length;
}

/**
 * Quais veredas foram percorridas até o fim.
 *
 * Toda lição vencida — a teoria lida e o laboratório feito. Acrescentar uma
 * lição a uma vereda já concluída a reabre para quem a terminou, e isso é o
 * certo: existe material novo que essa pessoa não viu. A insígnia já
 * conquistada não se perde, porque insígnia não se perde.
 */
export function veredasConcluidas(eventos: EventoDeAtividade[]): string[] {
  const percurso = percursoDosEventos(eventos);
  return VEREDAS
    .filter(v => licoesVencidas(v, percurso[v.id]) === licoesDaVereda(v).length)
    .map(v => v.id);
}

/** Busca só os eventos de vereda de alguém. */
export async function buscarPercurso(userId: string): Promise<EventoDeAtividade[]> {
  const { data } = await supabase
    .from('activity_events')
    .select('event_type, metadata, created_at')
    .eq('user_id', userId)
    .in('event_type', TODOS_OS_EVENTOS);
  return (data ?? []) as EventoDeAtividade[];
}

/**
 * Grava a lição vencida, e a conclusão quando ela for a última.
 *
 * `feito` é o que a tela já sabe: sem isso, entregar a mesma lição duas vezes
 * gravaria duas, e a contagem de "quanto venci" viraria "quantas vezes cliquei".
 */
export async function registrarLicaoVencida(
  userId: string,
  vereda: Vereda,
  licao: LicaoDeVereda,
  feito: PercursoDeVereda,
): Promise<boolean> {
  if (licaoVencida(licao, feito)) return false;

  const evento = licao.tipo === 'teoria' ? EVENTO_TEORIA : EVENTO_LABORATORIO;
  await logActivity(userId, evento, { vereda: vereda.id, licao: licao.id });

  const depois: PercursoDeVereda = {
    licoes: new Set(feito.licoes).add(licao.id),
    topicos: feito.topicos,
  };
  if (licoesVencidas(vereda, depois) === licoesDaVereda(vereda).length) {
    await logActivity(userId, EVENTO_CONCLUSAO, {
      vereda: vereda.id, codigo: vereda.codigo, licoes: licoesDaVereda(vereda).length,
    });
  }
  return true;
}
