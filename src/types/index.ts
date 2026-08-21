export type RequirementStatus =
  | 'not_started'
  | 'learning'
  | 'practicing'
  | 'needs_review'
  | 'demonstrated'
  | 'completed'
  | 'blocked';

export type LessonType = 'theory' | 'quiz' | 'lab' | 'checkpoint' | 'final';

export type LabType =
  | 'text_editor'
  | 'pact_builder'
  | 'prerequisite'
  | 'threat_lab'
  | 'web_lab'
  | 'mail_lab'
  | 'filipenses'
  | 'code_lab'
  | 'table_challenge'
  | 'image_lab'
  | 'site_lab'
  | 'ai_lab'
  | 'final_exam';

export interface Requirement {
  code: string;
  title: string;
  description: string;
  type: 'theory' | 'practice' | 'mixed';
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'ordering' | 'fill_blank' | 'scenario';
  prompt: string;
  data: QuestionData;
  explanation?: string;
}

export interface QuestionData {
  options?: { id: string; text: string; correct?: boolean }[];
  scenarios?: { id: string; text: string; correct?: boolean }[];
  pairs?: { left: string; right: string }[];
  items?: { id: string; text: string; order: number }[];
  blanks?: { id: string; answer: string; hint?: string }[];
}

export interface Lesson {
  code: string;
  title: string;
  type: LessonType;
  content: string;
  requirementCodes: string[];
  questions?: Question[];
  labType?: LabType;
}

export interface Module {
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Specialty {
  code: string;
  name: string;
  level: 'fundamental' | 'advanced';
  description: string;
  requirements: Requirement[];
  modules: Module[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  username?: string;
  club?: string;
  /* From clubes.adventistas.org. Null when the club was typed by hand — the
     admin screen uses that to tell a validated club from an unverified one. */
  club_code?: string | null;
  club_city?: string | null;
  club_association?: string | null;
  unit?: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  is_admin: boolean;
  avatar_url?: string | null;
}

// Non-sensitive projection of UserProfile, backed by the `public_profiles` view.
// Never carries email/is_admin — those are only ever readable by the row's owner.
export interface PublicProfile {
  id: string;
  display_name: string;
  username?: string;
  club?: string;
  /* From clubes.adventistas.org. Null when the club was typed by hand — the
     admin screen uses that to tell a validated club from an unverified one. */
  club_code?: string | null;
  club_city?: string | null;
  club_association?: string | null;
  unit?: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  avatar_url?: string | null;
}

export interface Certification {
  id: string;
  code: string;
  hash: string;
  level: 'fundamental' | 'advanced';
  curriculum_code: string;
  curriculum_version: string;
  status: 'active' | 'revoked';
  issued_at: string;
  user_id: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

/* As janelas do ranking. Os valores são os que a função leaderboard() espera. */
export const LEADERBOARD_PERIODS = [
  { value: 'dia',    label: 'Diário'      },
  { value: 'semana', label: 'Semanal'     },
  { value: 'mes',    label: 'Mensal'      },
  { value: 'tudo',   label: 'Geral' },
] as const;

export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number]['value'];

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  avatar_url: string | null;
  /* Nulos quando a pessoa não marcou "mostrar meu clube": a linha continua,
     só o clube some. */
  club: string | null;
  club_city: string | null;
  total_xp: number;
  best_streak: number;
  badge_count: number;
}

export function getPublicName(profile: Pick<UserProfile | PublicProfile, 'display_name' | 'public_name_form'>): string {
  switch (profile.public_name_form) {
    case 'full': return profile.display_name;
    case 'first': return profile.display_name.split(' ')[0];
    case 'initials':
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase();
    case 'anonymous': return 'Anônimo';
  }
}
