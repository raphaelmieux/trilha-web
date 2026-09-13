import { supabase } from './supabase';
import { getOpenSpecialties } from '../curriculum';
import { laboratorioDoEvento } from './atividade';
import { insigniasConquistadas, type ResumoDoDesbravador } from './insignias';
import { veredasConcluidas } from './veredas';
import {
  diaEmBrasilia, horaEmBrasilia, diaDaSemanaEmBrasilia,
  diasDeAtividade, melhorOfensiva,
} from './ofensiva';
import {
  anunciarConquistas,
  type ContextoDaConquista, type GatilhoDaConquista, type InsigniaConquistada,
} from './conquista';
import { classeCanonica, NIVEIS_DA_INSIGNIA } from './nivelDaInsignia';
import { umDe } from '../types';
import type { LabType } from '../types';
import type { Json } from '../types/database';

// Deliberately does not import from progress.ts (which will call evaluateBadges
// after every completion) to avoid a circular module dependency — this fetches its
// own small requirement-status map instead of reusing fetchRequirementProgress.
async function getCompletedRequirementCodes(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('requirement_progress')
    .select('status, requirements!inner(code)')
    .eq('user_id', userId)
    .eq('status', 'completed');

  return new Set((data ?? []).map(row => row.requirements.code));
}

/**
 * Reúne, numa passada, tudo o que as insígnias precisam saber.
 *
 * Cinco consultas, e nenhum campo novo: progresso por requisito, tentativas de
 * lição, eventos de atividade, matrículas e certificados já guardam tudo. Uma
 * insígnia que exigisse gravação nova deixaria de fora quem já usa a plataforma,
 * ou obrigaria a inventar histórico para essas pessoas.
 */
export async function montarResumo(userId: string): Promise<ResumoDoDesbravador> {
  const completed = await getCompletedRequirementCodes(userId);

  const [tentativas, eventos, matriculas, certificados] = await Promise.all([
    supabase.from('lesson_attempts').select('lesson_id, score, total, passed').eq('user_id', userId),
    supabase.from('activity_events').select('event_type, created_at, metadata, curriculum_version').eq('user_id', userId),
    supabase.from('enrollments').select('xp, streak_days').eq('user_id', userId),
    supabase.from('certifications').select('curriculum_code').eq('user_id', userId).eq('status', 'active'),
  ]);

  /* Lições distintas: refazer a mesma não conta duas vezes. */
  const aprovadas = (tentativas.data ?? []).filter(t => t.passed);
  const licoes = new Set(aprovadas.map(t => t.lesson_id as string));
  const perfeitas = new Set(
    aprovadas.filter(t => typeof t.total === 'number' && t.total > 0 && t.score === t.total)
      .map(t => t.lesson_id as string),
  );

  /*
    Os laboratórios saem dos eventos, e não das tentativas de lição: os
    laboratórios só passaram a registrar tentativa há pouco, e o histórico de
    quem usou a plataforma antes disso está todo nos eventos.
  */
  const laboratorios = new Set<LabType>();
  const dias = new Set<string>();
  const horas = new Set<number>();
  const diasDaSemana = new Set<number>();
  let provas = 0;

  for (const e of eventos.data ?? []) {
    const lab = laboratorioDoEvento(e);
    if (lab) laboratorios.add(lab);
    if (e.event_type === 'final_exam_completed') provas++;
    if (e.created_at) {
      /*
        O dia, a hora e o dia da semana são os de **Brasília**, e não os do
        relógio do aparelho.

        Eram `toDateString()`, `getHours()` e `getDay()`, que leem o fuso de
        quem está olhando. Quem abrisse a plataforma viajando, ou num
        computador com o fuso errado — coisa comum no computador do clube —,
        via a própria madrugada virar tarde e o domingo virar sábado, e as
        insígnias de horário premiavam a configuração do aparelho em vez do
        hábito da pessoa. Era também a terceira definição de "dia" na mesma
        base: aqui era o local, na ofensiva era UTC, e nenhuma das duas era
        esta.
      */
      dias.add(diaEmBrasilia(e.created_at as string));
      horas.add(horaEmBrasilia(e.created_at as string));
      diasDaSemana.add(diaDaSemanaEmBrasilia(e.created_at as string));
    }
  }

  /* A nota da prova está na metadata, e só é buscada quando há prova — a
     consulta acima já trouxe o suficiente para saber se vale perguntar. */
  let provasPerfeitas = 0;
  if (provas > 0) {
    const { data } = await supabase
      .from('activity_events').select('metadata')
      .eq('user_id', userId).eq('event_type', 'final_exam_completed');
    provasPerfeitas = (data ?? []).filter(e => {
      const m = e.metadata as { score?: number; total?: number } | null;
      return typeof m?.total === 'number' && m.total > 0 && m.score === m.total;
    }).length;
  }

  /* Módulos e trilhas concluídos vêm do currículo cruzado com os requisitos. */
  let modulos = 0;
  const trilhas: string[] = [];
  for (const spec of getOpenSpecialties()) {
    const reqCodes = spec.requirements.map(r => r.code);
    if (reqCodes.length > 0 && reqCodes.every(c => completed.has(c))) trilhas.push(spec.code);
    for (const m of spec.modules) {
      const codes = m.lessons.flatMap(l => l.requirementCodes);
      if (codes.length > 0 && codes.every(c => completed.has(c))) modulos++;
    }
  }

  return {
    requisitos: completed.size,
    licoes: licoes.size,
    licoesPerfeitas: perfeitas.size,
    modulos,
    trilhas,
    laboratorios,
    provas,
    provasPerfeitas,
    /*
      A maior sequência de sempre, derivada dos eventos.

      Saía de `max(enrollments.streak_days)`, que não é a maior de sempre:
      é a **corrente**, da trilha que estiver mais adiantada. Quem fizesse
      sete dias seguidos alternando duas trilhas nunca chegava a sete em
      nenhuma das duas matrículas, e a insígnia de sete dias não vinha.
    */
    melhorSequencia: melhorOfensiva(diasDeAtividade(eventos.data ?? [])),
    diasAtivos: dias.size,
    horas,
    diasDaSemana,
    xp: (matriculas.data ?? []).reduce((s, e) => s + (e.xp || 0), 0),
    certificados: (certificados.data ?? []).map(c => c.curriculum_code as string).filter(Boolean),
    /* Sai dos mesmos eventos já buscados acima: cada tópico lido e cada
       laboratório vencido é um evento, e a vereda está concluída quando todas
       as lições dela apareceram. */
    veredas: veredasConcluidas(eventos.data ?? []),
  };
}

// Called after every lesson/lab/exam completion and every streak update (see
// progress.ts). Re-evaluates the full badge catalog against fresh state and awards
// anything newly earned. Safe to call redundantly — already-earned badges are
// skipped, so calling this from two places per user action just means a couple of
// extra reads, never a duplicate award.
export async function evaluateBadges(
  userId: string,
  /*
    O que estava acontecendo quando esta avaliação foi disparada.

    Esta função pergunta "o que está verdadeiro agora?", e não "o que acabou
    de acontecer" — então ela não teria como saber, sozinha, qual ação fez a
    insígnia cair nem em que percurso a pessoa estava. Quem sabe isso é quem
    chama, e é por isso que o gatilho desce por parâmetro em vez de ser
    adivinhado depois.
  */
  gatilho?: GatilhoDaConquista,
): Promise<InsigniaConquistada[]> {
  const { data: catalog } = await supabase
    .from('badges')
    .select('id, code, name, description, icon, tier');
  if (!catalog || catalog.length === 0) return [];
  const porCodigo = new Map(catalog.map(b => [b.code as string, b]));

  const { data: earned } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
  const earnedIds = new Set((earned || []).map(e => e.badge_id as string));

  const resumo = await montarResumo(userId);

  /* Um código sem linha na tabela é ignorado sem erro: é o que permite escrever
     a insígnia no catálogo antes de a migration que a semeia ser aplicada. */
  const novas = insigniasConquistadas(resumo)
    .map(code => porCodigo.get(code))
    .filter((b): b is NonNullable<typeof b> => !!b && !earnedIds.has(b.id as string));

  if (novas.length === 0) return [];

  /* Só o que tem valor vai para o jsonb: um objeto com três chaves nulas
     ocuparia espaço para dizer exatamente o que `{}` já diz. */
  const contexto: ContextoDaConquista = Object.fromEntries(
    Object.entries(gatilho ?? {}).filter(([, v]) => !!v),
  );

  const { error } = await supabase.from('user_badges').insert(
    novas.map(b => ({ user_id: userId, badge_id: b.id as string, context: contexto as Json })),
  );
  /* Gravou? Então anuncia. Anunciar antes de gravar mostraria na tela uma
     conquista que o banco recusou — e ela sumiria no recarregar seguinte,
     sem nada explicando. */
  if (error) {
    console.error('evaluateBadges insert error:', error);
    return [];
  }

  const conquistadas: InsigniaConquistada[] = novas.map(b => ({
    id: b.id as string,
    code: b.code as string,
    name: b.name as string,
    description: b.description as string,
    icon: b.icon as string,
    tier: umDe(NIVEIS_DA_INSIGNIA, classeCanonica(b.tier as string) ?? '', 'amigo'),
    conquistadaEm: new Date().toISOString(),
    contexto,
  }));

  anunciarConquistas(conquistadas);
  return conquistadas;
}
