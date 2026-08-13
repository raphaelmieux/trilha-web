import { describe, it, expect } from 'vitest';
import { buildSpecialtyNarrative, buildClosingParagraph } from './reportNarrative';
import type { Specialty, Certification } from '../types';
import type { ProgressMap } from './progress';

const specialty: Specialty = {
  code: 'AP034',
  name: 'Internet',
  level: 'fundamental',
  description: 'Especialidade fundamental sobre internet.',
  requirements: [
    { code: 'R1', title: 'Internet', description: 'Definir internet e diferenciá-la de website.', type: 'theory' },
    { code: 'R2', title: 'Elemento', description: 'Elemento html.', type: 'practice' },
    { code: 'R3', title: 'Imagens', description: 'JPEG, PNG, botões e header.', type: 'practice' },
    { code: 'R4', title: 'Sigilo', description: 'Nunca revelar informações pessoais.', type: 'practice' },
  ],
  modules: [
    {
      code: 'M1',
      title: 'Conceitos',
      description: 'WebLab: simulação de navegador.',
      lessons: [
        { code: 'L1', title: 'Aula 1', type: 'theory', content: '', requirementCodes: ['R1', 'R2'] },
        { code: 'L2', title: 'Aula 2', type: 'theory', content: '', requirementCodes: ['R3', 'R4'] },
      ],
    },
  ],
};

const progressFor = (codes: string[]): ProgressMap =>
  Object.fromEntries(codes.map(c => [c, {
    requirement_id: c, status: 'completed' as const, mastery_score: 100,
    attempts: 1, correct_count: 1, total_questions: 1,
    retention_passed: true, checkpoint_passed: true,
  }]));

const cert: Certification = {
  id: 'c1', code: 'TW-AAAA-BBBB', hash: 'h', level: 'fundamental',
  curriculum_code: 'AP034', curriculum_version: '1.0', status: 'active',
  issued_at: '2026-08-13T12:00:00Z', user_id: 'u1',
};

describe('buildSpecialtyNarrative', () => {
  it('keeps CamelCase product names intact instead of lowercasing them', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1']), [], 'Ana');
    // "WebLab" must not become "webLab" when spliced mid-sentence
    expect(n.modules[0].paragraph).toContain('WebLab: simulação de navegador');
    expect(n.modules[0].paragraph).not.toContain('webLab');
  });

  it('keeps acronyms intact', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R3']), [], 'Ana');
    expect(n.modules[0].paragraph).toContain('JPEG, PNG');
    expect(n.modules[0].paragraph).not.toContain('jPEG');
  });

  it('lowercases ordinary sentences so they read inside a clause', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1']), [], 'Ana');
    expect(n.modules[0].paragraph).toContain('definir internet');
  });

  it('separates action requirements from bare topic requirements', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1', 'R2']), [], 'Ana');
    const p = n.modules[0].paragraph;
    // R1 is an action ("Definir..."), R2 is a topic ("Elemento html")
    expect(p).toContain('ser capaz de: definir internet');
    expect(p).toContain('Domina ainda os seguintes conteúdos: elemento html');
  });

  it('keeps the topic-only clause in the gerund so it agrees with "demonstrou"', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R2', 'R3']), [], 'Ana');
    const p = n.modules[0].paragraph;
    expect(p).toContain('abrangendo os seguintes conteúdos');
    // "demonstrou ... abrange" would be a verb-agreement error
    expect(p).not.toMatch(/requisitos?, abrange /);
  });

  it('treats a negated infinitive as an action', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R4']), [], 'Ana');
    expect(n.modules[0].paragraph).toContain('ser capaz de: nunca revelar');
  });

  it('reports full completion and lists the certificate when present', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1', 'R2', 'R3', 'R4']), [cert], 'Ana');
    expect(n.percent).toBe(100);
    expect(n.opening).toContain('integralidade dos 4 requisitos');
    expect(n.certification).toContain('TW-AAAA-BBBB');
    expect(n.pending).toBeNull();
  });

  it('lists pending requirements when the trail is unfinished', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1']), [], 'Ana');
    expect(n.percent).toBe(25);
    expect(n.pending).toContain('elemento html');
    expect(n.certification).toBeNull();
  });

  it('flags a finished curriculum that still lacks the final exam', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1', 'R2', 'R3', 'R4']), [], 'Ana');
    expect(n.certification).toContain('ainda não foi emitido');
  });

  it('describes an untouched specialty without inventing progress', () => {
    const n = buildSpecialtyNarrative(specialty, {}, [], 'Ana');
    expect(n.started).toBe(false);
    expect(n.modules).toHaveLength(0);
    expect(n.opening).toContain('ainda não registrou');
  });

  it('ignores certifications belonging to the other level', () => {
    const advanced = { ...cert, level: 'advanced' as const };
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1']), [advanced], 'Ana');
    expect(n.certificate).toBeNull();
  });

  it('ignores revoked certifications', () => {
    const revoked = { ...cert, status: 'revoked' as const };
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1', 'R2', 'R3', 'R4']), [revoked], 'Ana');
    expect(n.certificate).toBeNull();
  });
});

describe('buildClosingParagraph', () => {
  it('states full certification when every specialty is certified', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1', 'R2', 'R3', 'R4']), [cert], 'Ana');
    const text = buildClosingParagraph([n], 'Ana', 4, 92);
    expect(text).toContain('Ana');
    expect(text).toContain('92%');
    expect(text).toContain('4 atividades avaliadas');
  });

  it('omits performance stats when nothing was graded yet', () => {
    const n = buildSpecialtyNarrative(specialty, {}, [], 'Ana');
    const text = buildClosingParagraph([n], 'Ana', 0, 0);
    expect(text).not.toContain('aproveitamento médio');
    expect(text).toContain('em percurso');
  });

  it('uses the singular form for a single graded activity', () => {
    const n = buildSpecialtyNarrative(specialty, progressFor(['R1']), [], 'Ana');
    const text = buildClosingParagraph([n], 'Ana', 1, 80);
    expect(text).toContain('1 atividade avaliada');
  });
});
