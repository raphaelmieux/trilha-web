/**
 * Validation for the personal internet commitment (AP034-5.1 … 5.9).
 *
 * The old builder accepted any non-empty string in every clause, so a single
 * character in each box completed nine requirements at once. Worse, two of the
 * clauses ask for numbers — a weekly budget and a daily limit — and nothing
 * checked that the two agreed with each other. A student could promise ten hours
 * a week and three hours a day and the lab would congratulate them.
 *
 * These functions are pure so the rules can be tested rather than trusted.
 */

/**
 * Reads a duration out of ordinary Portuguese, in minutes.
 *
 * Students write "2h por dia", "meia hora", "30 min", "1 hora e 30". Demanding a
 * number in a fixed format would be a form-filling exercise, not a commitment,
 * so this accepts what they actually write and returns null only when there is
 * no duration in the text at all.
 */
export function parseDurationMinutes(text: string): number | null {
  const clean = text.toLowerCase().replace(',', '.');
  if (/\bmeia\s+hora\b/.test(clean)) return 30;

  let minutes = 0;
  let found = false;

  const hours = /(\d+(?:\.\d+)?)\s*(?:h\b|hs\b|hora)/g;
  for (const m of clean.matchAll(hours)) {
    minutes += parseFloat(m[1]) * 60;
    found = true;
  }

  const mins = /(\d+(?:\.\d+)?)\s*(?:min|minuto)/g;
  for (const m of clean.matchAll(mins)) {
    minutes += parseFloat(m[1]);
    found = true;
  }

  // "1 hora e 30" — a bare number trailing an hour figure means minutes.
  // The \b after the digits is load-bearing: without it the engine backtracks to
  // a single digit of "30 minutos", whose next character satisfies the negative
  // lookahead, and adds 3 minutes on top of the 30 already counted.
  const trailing = /(\d+(?:\.\d+)?)\s*(?:h\b|hs\b|horas?)\s*e\s*(\d+)\b(?!\s*(?:h|hs|hora|min|minuto))/.exec(clean);
  if (trailing) { minutes += parseFloat(trailing[2]); found = true; }

  if (!found) {
    // A lone number with no unit: read it as hours for a week, minutes for a day
    // is ambiguous, so refuse instead of guessing wrong.
    return null;
  }
  return Math.round(minutes);
}

export interface ClauseVerdict { ok: boolean; message?: string }

/** Free-text clauses: a real sentence, not a word and not the example. */
export function checkStatement(text: string, placeholder: string, minLength = 25): ClauseVerdict {
  const value = text.trim();
  if (value.length === 0) return { ok: false, message: 'Ainda em branco.' };
  if (value.length < minLength) {
    return { ok: false, message: `Escreva um pouco mais — ${value.length} de ${minLength} caracteres. Um compromisso precisa dizer o que você vai fazer.` };
  }
  const normalise = (s: string) => s.toLowerCase().replace(/^ex:\s*/, '').replace(/\s+/g, ' ').trim();
  if (normalise(value) === normalise(placeholder)) {
    return { ok: false, message: 'Esse é o exemplo. Escreva o seu próprio compromisso, com as suas palavras.' };
  }
  return { ok: true };
}

export const WEEKLY_MIN_MINUTES = 30;
export const WEEKLY_MAX_MINUTES = 40 * 60;
export const DAILY_MIN_MINUTES = 5;
export const DAILY_MAX_MINUTES = 4 * 60;

export function checkWeeklyBudget(text: string): ClauseVerdict {
  const minutes = parseDurationMinutes(text);
  if (minutes === null) {
    return { ok: false, message: 'Diga quanto tempo, com a unidade — por exemplo "10 horas por semana".' };
  }
  if (minutes < WEEKLY_MIN_MINUTES) {
    return { ok: false, message: 'Menos de meia hora por semana não é um plano realista de uso.' };
  }
  if (minutes > WEEKLY_MAX_MINUTES) {
    return { ok: false, message: 'Mais de 40 horas por semana é uma jornada de trabalho. Reveja o número.' };
  }
  return { ok: true };
}

export function checkDailyLimit(text: string): ClauseVerdict {
  const minutes = parseDurationMinutes(text);
  if (minutes === null) {
    return { ok: false, message: 'Diga quanto tempo, com a unidade — por exemplo "30 minutos por dia".' };
  }
  if (minutes < DAILY_MIN_MINUTES) {
    return { ok: false, message: 'Menos de 5 minutos por dia não é um limite, é uma proibição. Escolha um número que você consiga cumprir.' };
  }
  if (minutes > DAILY_MAX_MINUTES) {
    return { ok: false, message: 'Mais de 4 horas por dia só em redes sociais é muito. Reveja o número.' };
  }
  return { ok: true };
}

/**
 * The two time clauses have to agree.
 *
 * This is the check the old builder was missing, and the one that turns the
 * exercise into arithmetic the student has to face: seven days of the daily
 * limit cannot exceed the weekly budget.
 */
export function checkBudgetsAgree(weeklyText: string, dailyText: string): ClauseVerdict {
  const weekly = parseDurationMinutes(weeklyText);
  const daily = parseDurationMinutes(dailyText);
  if (weekly === null || daily === null) return { ok: true }; // each clause reports its own problem
  if (daily * 7 > weekly) {
    const dailyHours = (daily * 7 / 60).toFixed(1).replace('.', ',');
    const weeklyHours = (weekly / 60).toFixed(1).replace('.', ',');
    return {
      ok: false,
      message: `As duas contas não fecham: ${dailyHours} h por semana só de redes sociais não cabem em ${weeklyHours} h de internet no total. Ajuste um dos dois.`,
    };
  }
  return { ok: true };
}

export const MAX_SOCIAL_NETWORKS = 2;

export function checkSocialNetworks(chosen: string[]): ClauseVerdict {
  if (chosen.length > MAX_SOCIAL_NETWORKS) {
    return { ok: false, message: `O compromisso é de no máximo ${MAX_SOCIAL_NETWORKS}. Você escolheu ${chosen.length}.` };
  }
  return { ok: true };
}

/** The signature has to look like a person's name, not a keystroke. */
export function checkSignature(name: string): ClauseVerdict {
  const value = name.trim().replace(/\s+/g, ' ');
  if (!value) return { ok: false, message: 'Assine com o seu nome.' };
  const parts = value.split(' ').filter(p => p.length >= 2);
  if (parts.length < 2) {
    return { ok: false, message: 'Escreva o nome completo — nome e sobrenome.' };
  }
  return { ok: true };
}
