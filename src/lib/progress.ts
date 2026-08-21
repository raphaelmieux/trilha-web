import { supabase } from './supabase';
import { evaluateBadges } from './gamification';
import type { RequirementStatus } from '../types';

export interface RequirementProgress {
  requirement_id: string;
  status: RequirementStatus;
  mastery_score: number;
  attempts: number;
  correct_count: number;
  total_questions: number;
  retention_passed: boolean;
  checkpoint_passed: boolean;
}

export type ProgressMap = Record<string, RequirementProgress>;

/**
 * Acerto mínimo para um requisito contar como cumprido.
 *
 * Era 80%, e uma lição de 8 questões exigia 7 acertos — 6 de 8 reprovava por
 * uma questão. Nas primeiras 42 conclusões registradas, 17 caíram em "a
 * recuperar", a maioria exatamente nessa borda. A 75%, 6 de 8 passa e 5 de 8
 * continua pendente.
 *
 * A prova final segue exigindo 80% (ver FinalExam): ela é o portão da
 * certificação, não a medida de um requisito isolado.
 */
export const LIMIAR_DOMINIO = 75;

export function calculateMastery(
  correct: number,
  total: number,
  retentionPassed: boolean,
  checkpointPassed: boolean
): { score: number; status: RequirementStatus } {
  if (total === 0) return { score: 0, status: 'not_started' };
  const score = Math.round((correct / total) * 100);
  if (score >= LIMIAR_DOMINIO) {
    if (retentionPassed && checkpointPassed) {
      return { score, status: 'completed' };
    }
    return { score, status: 'completed' };
  }
  if (correct > 0) {
    return { score, status: 'needs_review' };
  }
  return { score, status: 'learning' };
}

/**
 * Entre o que já estava gravado e o que a pessoa acabou de fazer, fica o melhor.
 *
 * O registro era substituído pelo resultado mais recente. Quem já tinha
 * concluído um requisito e revisitava a lição, indo pior na segunda vez, era
 * rebaixado — progresso conquistado sumia. Refazer uma lição só pode ajudar.
 *
 * Uma lição sem questões (`total` zero) não diz nada sobre domínio e por isso
 * não desloca o que já havia.
 */
export function melhorResultado(
  anterior: { correct: number; total: number },
  novo: { correct: number; total: number },
): { correct: number; total: number } {
  const taxa = (r: { correct: number; total: number }) => (r.total > 0 ? r.correct / r.total : -1);
  if (novo.total === 0) return anterior;
  if (anterior.total === 0) return novo;
  return taxa(novo) >= taxa(anterior) ? novo : anterior;
}

export function getModuleStatus(reqCodes: string[], progress: ProgressMap): RequirementStatus {
  if (reqCodes.length === 0) return 'not_started';
  const statuses = reqCodes.map(c => progress[c]?.status || 'not_started');
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'needs_review')) return 'needs_review';
  if (statuses.some(s => s === 'learning' || s === 'practicing' || s === 'demonstrated')) {
    return 'learning';
  }
  return 'not_started';
}

export function getLessonStatus(lesson: { type: string; requirementCodes: string[]; labType?: string }, progress: ProgressMap): RequirementStatus {
  if (lesson.type === 'final') {
    return 'not_started';
  }
  return getModuleStatus(lesson.requirementCodes, progress);
}

export function getProgressPercent(reqCodes: string[], progress: ProgressMap): number {
  if (reqCodes.length === 0) return 0;
  const completed = reqCodes.filter(c => progress[c]?.status === 'completed').length;
  return Math.round((completed / reqCodes.length) * 100);
}

/** O que a barra mostra: a parte cumprida e a parte em recuperação. */
export interface ProgressoDetalhado {
  /** % de requisitos concluídos — é este número que o relatório atesta. */
  concluido: number;
  /** % adicional de quem ficou abaixo do limiar, proporcional ao acerto. */
  parcial: number;
}

/**
 * Progresso em duas partes, para uma barra que não seja só 0% ou 100%.
 *
 * getProgressPercent conta apenas requisitos concluídos, e continua sendo o
 * número oficial. Só que uma lição inteira responde pelo mesmo questionário:
 * ou todos os seus requisitos passam do limiar, ou nenhum passa. A barra ficava
 * binária e não distinguia quem errou uma questão de quem não começou.
 *
 * Quem ficou abaixo do corte entra proporcionalmente ao que acertou na melhor
 * tentativa — 6 de 8 vale 0,75 de um requisito. Fica separado do cumprido, e
 * não somado a ele, porque são coisas diferentes: uma está certificada, a outra
 * é caminho andado.
 */
export function getProgressDetail(reqCodes: string[], progress: ProgressMap): ProgressoDetalhado {
  if (reqCodes.length === 0) return { concluido: 0, parcial: 0 };

  let cumpridos = 0;
  let emRecuperacao = 0;

  for (const code of reqCodes) {
    const r = progress[code];
    if (r?.status === 'completed') {
      cumpridos += 1;
    } else if (r && r.mastery_score > 0) {
      emRecuperacao += Math.min(100, r.mastery_score) / 100;
    }
  }

  const concluido = (cumpridos / reqCodes.length) * 100;
  /* Os dois trechos são desenhados um ao lado do outro, então a soma não pode
     ultrapassar a largura da barra. */
  const parcial = Math.min(100 - concluido, (emRecuperacao / reqCodes.length) * 100);

  return { concluido: Math.round(concluido), parcial: Math.round(parcial) };
}

export async function fetchRequirementProgress(userId: string): Promise<ProgressMap> {
  const { data, error } = await supabase
    .from('requirement_progress')
    .select(`
      requirement_id,
      status,
      mastery_score,
      attempts,
      correct_count,
      total_questions,
      retention_passed,
      checkpoint_passed,
      requirements!inner(code)
    `)
    .eq('user_id', userId);

  if (error || !data) return {};

  const map: ProgressMap = {};
  for (const row of data as any[]) {
    const code = row.requirements?.code;
    if (code) {
      map[code] = {
        requirement_id: row.requirement_id,
        status: row.status,
        mastery_score: row.mastery_score,
        attempts: row.attempts,
        correct_count: row.correct_count,
        total_questions: row.total_questions,
        retention_passed: row.retention_passed,
        checkpoint_passed: row.checkpoint_passed,
      };
    }
  }
  return map;
}

export async function upsertRequirementProgress(
  userId: string,
  requirementId: string,
  data: Partial<RequirementProgress>
): Promise<void> {
  const { error } = await supabase
    .from('requirement_progress')
    .upsert({
      user_id: userId,
      requirement_id: requirementId,
      status: data.status || 'learning',
      mastery_score: data.mastery_score || 0,
      attempts: data.attempts || 0,
      correct_count: data.correct_count || 0,
      total_questions: data.total_questions || 0,
      retention_passed: data.retention_passed || false,
      checkpoint_passed: data.checkpoint_passed || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,requirement_id' });

  if (error) console.error('upsertRequirementProgress error:', error);
  else evaluateBadges(userId).catch(() => {});
}

export async function logActivity(
  userId: string,
  eventType: string,
  metadata: Record<string, any> = {},
  requirementId?: string,
  entityType?: string,
  entityId?: string,
  curriculumVersion?: string
): Promise<void> {
  await supabase.from('activity_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata,
    requirement_id: requirementId,
    entity_type: entityType,
    entity_id: entityId,
    curriculum_version: curriculumVersion,
  });
}

export async function ensureEnrollment(userId: string, specialtyId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('specialty_id', specialtyId)
    .maybeSingle();
  if (!existing) {
    await supabase.from('enrollments').insert({
      user_id: userId,
      specialty_id: specialtyId,
      status: 'active',
      last_activity_date: new Date().toISOString().split('T')[0],
    });
  }
}

/* Uma atividade concluída vale isto, no total corrente e no evento datado. */
const XP_POR_ATIVIDADE = 10;

export async function updateEnrollmentActivity(userId: string, specialtyId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('specialty_id', specialtyId)
    .maybeSingle();
  if (existing) {
    const lastDate = existing.last_activity_date;
    let streak = existing.streak_days || 0;
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) streak += 1;
      else streak = 1;
    }
    await supabase
      .from('enrollments')
      .update({ xp: (existing.xp || 0) + XP_POR_ATIVIDADE, streak_days: streak, last_activity_date: today })
      .eq('id', existing.id);

    /*
      O mesmo XP, agora também como fato datado.
      enrollments.xp é um total corrente e não sabe dizer quando cada ponto foi
      ganho, então o ranking não conseguia responder "quanto esta semana?".
      Falhar aqui não pode desfazer a atividade da pessoa: o total acima já foi
      gravado, e o evento é material do ranking, não do progresso.
    */
    supabase
      .from('xp_events')
      .insert({ user_id: userId, specialty_id: specialtyId, amount: XP_POR_ATIVIDADE })
      .then(undefined, () => {});

    evaluateBadges(userId).catch(() => {});
  }
}

export async function getRequirementId(code: string): Promise<string | null> {
  const { data } = await supabase.from('requirements').select('id').eq('code', code).maybeSingle();
  return data?.id || null;
}

export async function getLessonId(lessonCode: string): Promise<string | null> {
  const { data } = await supabase.from('lessons').select('id').eq('code', lessonCode).maybeSingle();
  return data?.id || null;
}

export async function getSpecialtyId(code: string): Promise<string | null> {
  const { data } = await supabase.from('specialties').select('id').eq('code', code).maybeSingle();
  return data?.id || null;
}

export async function getSpecialtyIdForRequirement(reqCode: string): Promise<string | null> {
  const { data } = await supabase
    .from('requirements')
    .select('specialty_id')
    .eq('code', reqCode)
    .maybeSingle();
  return data?.specialty_id || null;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
