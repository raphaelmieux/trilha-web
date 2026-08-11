import { supabase } from './supabase';
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

export function calculateMastery(
  correct: number,
  total: number,
  retentionPassed: boolean,
  checkpointPassed: boolean
): { score: number; status: RequirementStatus } {
  if (total === 0) return { score: 0, status: 'not_started' };
  const score = Math.round((correct / total) * 100);
  if (score >= 80) {
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
      .update({ xp: (existing.xp || 0) + 10, streak_days: streak, last_activity_date: today })
      .eq('id', existing.id);
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
