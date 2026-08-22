import { supabase } from './supabase';
import { getOpenSpecialties } from '../curriculum';

// Deliberately does not import from progress.ts (which will call evaluateBadges
// after every completion) to avoid a circular module dependency — this fetches its
// own small requirement-status map instead of reusing fetchRequirementProgress.
async function getCompletedRequirementCodes(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('requirement_progress')
    .select('status, requirements!inner(code)')
    .eq('user_id', userId)
    .eq('status', 'completed');

  return new Set((data as any[] | null)?.map(row => row.requirements?.code).filter(Boolean) || []);
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

  const completed = await getCompletedRequirementCodes(userId);
  const eligible = new Set<string>();

  if (completed.size >= 1) eligible.add('first_step');

  /*
    Toda trilha aberta, e não um par escrito à mão.

    A lista era ['AP034', 'AP035']. Concluir Computação 1 não dava insígnia
    nenhuma, e os módulos dela não contavam para a de módulo concluído — a
    trilha inteira terminava sem nada acontecer. O código da insígnia sai do
    código da trilha, então a próxima entra sozinha; falta só semeá-la na tabela
    `badges`, e uma insígnia que não existe lá é ignorada sem erro.
  */
  for (const spec of getOpenSpecialties()) {
    const reqCodes = spec.requirements.map(r => r.code);
    if (reqCodes.length > 0 && reqCodes.every(c => completed.has(c))) {
      eligible.add(`${spec.code.toLowerCase()}_complete`);
    }

    const hasCompletedModule = spec.modules.some(module => {
      const modCodes = module.lessons.flatMap(l => l.requirementCodes);
      return modCodes.length > 0 && modCodes.every(c => completed.has(c));
    });
    if (hasCompletedModule) eligible.add('module_complete');
  }

  const { data: enrollments } = await supabase.from('enrollments').select('streak_days').eq('user_id', userId);
  const bestStreak = (enrollments || []).reduce((max, e) => Math.max(max, e.streak_days || 0), 0);
  if (bestStreak >= 3) eligible.add('streak_3');
  if (bestStreak >= 7) eligible.add('streak_7');
  if (bestStreak >= 30) eligible.add('streak_30');

  const { data: examEvents } = await supabase
    .from('activity_events')
    .select('metadata')
    .eq('user_id', userId)
    .eq('event_type', 'final_exam_completed');
  const hasPerfectExam = (examEvents || []).some(e => {
    const total = e.metadata?.total;
    return typeof total === 'number' && total > 0 && e.metadata?.score === total;
  });
  if (hasPerfectExam) eligible.add('perfect_exam');

  const newRows = [...eligible]
    .map(code => codeToId.get(code))
    .filter((id): id is string => !!id && !earnedIds.has(id))
    .map(badge_id => ({ user_id: userId, badge_id }));

  if (newRows.length === 0) return;
  await supabase.from('user_badges').insert(newRows);
}
