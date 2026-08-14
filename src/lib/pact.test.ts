import { describe, it, expect } from 'vitest';
import {
  parseDurationMinutes, checkStatement, checkWeeklyBudget, checkDailyLimit,
  checkBudgetsAgree, checkSocialNetworks, checkSignature,
} from './pact';

describe('parseDurationMinutes', () => {
  it('reads hours written with the word', () => {
    expect(parseDurationMinutes('10 horas por semana')).toBe(600);
  });

  it('reads hours written with h', () => {
    expect(parseDurationMinutes('2h por dia')).toBe(120);
  });

  it('reads minutes', () => {
    expect(parseDurationMinutes('30 minutos por dia')).toBe(30);
  });

  it('reads the abbreviation', () => {
    expect(parseDurationMinutes('45 min')).toBe(45);
  });

  it('understands "meia hora"', () => {
    expect(parseDurationMinutes('meia hora por dia')).toBe(30);
  });

  it('adds hours and minutes written together', () => {
    expect(parseDurationMinutes('1 hora e 30 minutos')).toBe(90);
  });

  it('adds a bare trailing number as minutes', () => {
    expect(parseDurationMinutes('1 hora e 30')).toBe(90);
  });

  it('accepts a decimal with a comma, the way it is written in Portuguese', () => {
    expect(parseDurationMinutes('1,5 hora')).toBe(90);
  });

  it('refuses a bare number rather than guessing the unit', () => {
    // "10" could be ten hours a week or ten minutes a day. Guessing wrong would
    // silently approve a commitment the student did not make.
    expect(parseDurationMinutes('10')).toBeNull();
  });

  it('returns null when there is no duration at all', () => {
    expect(parseDurationMinutes('pouco tempo')).toBeNull();
  });
});

describe('checkStatement', () => {
  const placeholder = 'Ex: Nunca compartilhar meu endereço, telefone ou senha online';

  it('accepts a real sentence', () => {
    expect(checkStatement('Não vou passar meu endereço nem meu telefone para ninguém pela internet.', placeholder).ok).toBe(true);
  });

  it('rejects an empty box', () => {
    expect(checkStatement('   ', placeholder).ok).toBe(false);
  });

  it('rejects a single word', () => {
    const v = checkStatement('sim', placeholder);
    expect(v.ok).toBe(false);
    expect(v.message).toMatch(/caracteres/);
  });

  it('rejects the example copied back, even without the "Ex:" prefix', () => {
    const v = checkStatement('Nunca compartilhar meu endereço, telefone ou senha online', placeholder);
    expect(v.ok).toBe(false);
    expect(v.message).toMatch(/exemplo/i);
  });

  it('ignores differences in spacing and case when spotting the copy', () => {
    expect(checkStatement('  nunca  compartilhar meu endereço, telefone ou senha ONLINE ', placeholder).ok).toBe(false);
  });
});

describe('checkWeeklyBudget', () => {
  it('accepts a sensible weekly figure', () => {
    expect(checkWeeklyBudget('10 horas por semana').ok).toBe(true);
  });

  it('asks for a unit when none is given', () => {
    expect(checkWeeklyBudget('umas 10').ok).toBe(false);
  });

  it('rejects a figure so small it is not a plan', () => {
    expect(checkWeeklyBudget('10 minutos por semana').ok).toBe(false);
  });

  it('rejects a full working week', () => {
    expect(checkWeeklyBudget('50 horas por semana').ok).toBe(false);
  });
});

describe('checkDailyLimit', () => {
  it('accepts half an hour a day', () => {
    expect(checkDailyLimit('meia hora por dia').ok).toBe(true);
  });

  it('rejects a limit that is really a ban', () => {
    expect(checkDailyLimit('2 minutos').ok).toBe(false);
  });

  it('rejects five hours a day on social networks', () => {
    expect(checkDailyLimit('5 horas por dia').ok).toBe(false);
  });
});

describe('checkBudgetsAgree', () => {
  it('accepts limits that fit inside the weekly budget', () => {
    // 30 min/day = 3.5 h/week, inside 10 h.
    expect(checkBudgetsAgree('10 horas por semana', '30 minutos por dia').ok).toBe(true);
  });

  it('catches a daily limit that cannot fit in the week', () => {
    // 3 h/day = 21 h/week against a 10 h budget.
    const v = checkBudgetsAgree('10 horas por semana', '3 horas por dia');
    expect(v.ok).toBe(false);
    expect(v.message).toContain('21,0 h');
    expect(v.message).toContain('10,0 h');
  });

  it('accepts the exact boundary', () => {
    // 1 h/day = 7 h/week against a 7 h budget.
    expect(checkBudgetsAgree('7 horas por semana', '1 hora por dia').ok).toBe(true);
  });

  it('stays quiet when a clause has no number, so it does not double-report', () => {
    expect(checkBudgetsAgree('bastante', '30 minutos').ok).toBe(true);
  });
});

describe('checkSocialNetworks', () => {
  it('accepts none', () => {
    expect(checkSocialNetworks([]).ok).toBe(true);
  });

  it('accepts two', () => {
    expect(checkSocialNetworks(['WhatsApp', 'Instagram']).ok).toBe(true);
  });

  it('rejects three and says how many were chosen', () => {
    const v = checkSocialNetworks(['WhatsApp', 'Instagram', 'TikTok']);
    expect(v.ok).toBe(false);
    expect(v.message).toContain('3');
  });
});

describe('checkSignature', () => {
  it('accepts a full name', () => {
    expect(checkSignature('Ana Beatriz Souza').ok).toBe(true);
  });

  it('rejects a first name alone', () => {
    expect(checkSignature('Ana').ok).toBe(false);
  });

  it('rejects a keystroke', () => {
    expect(checkSignature('asdf').ok).toBe(false);
  });

  it('ignores extra spaces', () => {
    expect(checkSignature('  Ana   Souza  ').ok).toBe(true);
  });

  it('does not count a lone initial as a surname', () => {
    expect(checkSignature('Ana B').ok).toBe(false);
  });
});
