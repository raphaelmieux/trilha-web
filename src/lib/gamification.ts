import { supabase } from './supabase';
import { getOpenSpecialties } from '../curriculum';
import { LABORATORIO_DO_EVENTO } from './atividade';
import { insigniasConquistadas, type ResumoDoDesbravador } from './insignias';
import type { LabType } from '../types';

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
    supabase.from('activity_events').select('event_type, created_at').eq('user_id', userId),
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
    const lab = LABORATORIO_DO_EVENTO[e.event_type as string];
    if (lab) laboratorios.add(lab);
    if (e.event_type === 'final_exam_completed') provas++;
    if (e.created_at) {
      const d = new Date(e.created_at as string);
      dias.add(d.toDateString());
      horas.add(d.getHours());
      diasDaSemana.add(d.getDay());
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
    melhorSequencia: (matriculas.data ?? []).reduce((max, e) => Math.max(max, e.streak_days || 0), 0),
    diasAtivos: dias.size,
    horas,
    diasDaSemana,
    xp: (matriculas.data ?? []).reduce((s, e) => s + (e.xp || 0), 0),
    certificados: (certificados.data ?? []).map(c => c.curriculum_code as string).filter(Boolean),
  };
}

// Called after every lesson/lab/exam completion and every streak update (see
// progress.ts). Re-evaluates the full badge catalog against fresh state and awards
// anything newly earned. Safe to call redundantly — already-earned badges are
// skipped, so calling this from two places per user action just means a couple of
// extra reads, never a duplicate award.
export async function evaluateBadges(userId: string): Promise<void> {
  const { data: catalog } = await supabase.from('badges').select('id, code');
  if (!catalog || catalog.length === 0) return;
  const codeToId = new Map(catalog.map(b => [b.code as string, b.id as string]));

  const { data: earned } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
  const earnedIds = new Set((earned || []).map(e => e.badge_id as string));

  const resumo = await montarResumo(userId);

  /* Um código sem linha na tabela é ignorado sem erro: é o que permite escrever
     a insígnia no catálogo antes de a migration que a semeia ser aplicada. */
  const newRows = insigniasConquistadas(resumo)
    .map(code => codeToId.get(code))
    .filter((id): id is string => !!id && !earnedIds.has(id))
    .map(badge_id => ({ user_id: userId, badge_id }));

  if (newRows.length === 0) return;
  await supabase.from('user_badges').insert(newRows);
}
