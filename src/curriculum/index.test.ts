import { describe, it, expect } from 'vitest';
import { ap034, ap035, ap041, getAllSpecialties } from './index';
import { getFinalExamQuestions } from './finalExams';

describe('AP034 curriculum', () => {
  it('has the 35 requirements of the official AP034 sheet', () => {
    expect(ap034.requirements).toHaveLength(35);
  });

  it('has 9 modules', () => {
    expect(ap034.modules).toHaveLength(9);
  });

  it('has a final exam module', () => {
    const finalMod = ap034.modules.find(m => m.code === 'AP034.F');
    expect(finalMod).toBeDefined();
    expect(finalMod!.lessons[0].labType).toBe('final_exam');
  });

  it('all theory lessons have questions', () => {
    for (const module of ap034.modules) {
      for (const lesson of module.lessons) {
        if (lesson.type === 'theory') {
          expect(lesson.questions).toBeDefined();
          expect(lesson.questions!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all multiple choice questions have exactly one correct answer', () => {
    for (const module of ap034.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.questions) continue;
        for (const q of lesson.questions) {
          if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'scenario') {
            const opts = q.data.options || q.data.scenarios || [];
            const correctCount = opts.filter(o => o.correct).length;
            expect(correctCount).toBe(1);
          }
        }
      }
    }
  });
});

describe('AP035 curriculum', () => {
  it('has the 31 requirements of the official AP035 sheet', () => {
    expect(ap035.requirements).toHaveLength(31);
  });

  it('has 9 modules, counting the prerequisite gate', () => {
    expect(ap035.modules).toHaveLength(9);
  });
});

describe('AP041 curriculum', () => {
  it('has the 26 requirements of the official AP041 sheet', () => {
    expect(ap041.requirements).toHaveLength(26);
  });

  it('has 5 content modules plus the final exam', () => {
    expect(ap041.modules).toHaveLength(6);
  });

  it('is open, not under construction', () => {
    expect(ap041.emConstrucao).toBeFalsy();
  });

  /* Uma trilha aberta com módulo vazio é pior do que uma trilha anunciada:
     o desbravador entra, não encontra nada e não sabe se é erro dele. */
  it('leaves no module without lessons', () => {
    const vazios = ap041.modules.filter(m => m.lessons.length === 0).map(m => m.code);
    expect(vazios).toEqual([]);
  });

  it('gives every theory lesson its questions', () => {
    for (const m of ap041.modules) {
      for (const l of m.lessons) {
        if (l.type !== 'theory') continue;
        expect(l.questions, l.code).toBeDefined();
        expect(l.questions!.length, l.code).toBeGreaterThan(0);
      }
    }
  });
});

describe('Final exam questions', () => {
  it('AP034 final has at least 15 questions', () => {
    const qs = getFinalExamQuestions('AP034');
    expect(qs.length).toBeGreaterThanOrEqual(15);
  });

  it('AP035 final has at least 12 questions', () => {
    const qs = getFinalExamQuestions('AP035');
    expect(qs.length).toBeGreaterThanOrEqual(12);
  });

  it('AP034 final has diverse question types', () => {
    const qs = getFinalExamQuestions('AP034');
    const types = new Set(qs.map(q => q.type));
    expect(types.has('multiple_choice')).toBe(true);
    expect(types.has('true_false')).toBe(true);
    expect(types.has('ordering')).toBe(true);
    expect(types.has('matching')).toBe(true);
    expect(types.has('fill_blank')).toBe(true);
    expect(types.has('scenario')).toBe(true);
  });

  it('AP035 final has diverse question types', () => {
    const qs = getFinalExamQuestions('AP035');
    const types = new Set(qs.map(q => q.type));
    expect(types.has('multiple_choice')).toBe(true);
    expect(types.has('ordering')).toBe(true);
    expect(types.has('matching')).toBe(true);
    expect(types.has('fill_blank')).toBe(true);
    expect(types.has('scenario')).toBe(true);
  });

  it('AP041 final has at least 15 questions', () => {
    expect(getFinalExamQuestions('AP041').length).toBeGreaterThanOrEqual(15);
  });

  it('AP041 final has diverse question types', () => {
    const types = new Set(getFinalExamQuestions('AP041').map(q => q.type));
    for (const t of ['multiple_choice', 'true_false', 'ordering', 'matching', 'fill_blank', 'scenario']) {
      expect(types.has(t as never), t).toBe(true);
    }
  });

  /*
    A trava do despacho da prova.

    getFinalExamQuestions era um ternário: AP034 recebia a dela e qualquer
    outro código recebia a da AP035 — uma trilha sem prova aplicaria a prova
    de outra especialidade, calada. Aqui a pergunta é feita ao contrário:
    toda trilha que tem módulo de avaliação final precisa ter questões.
  */
  it('gives every trail with a final module its own exam', () => {
    const semProva = getAllSpecialties()
      .filter(s => s.modules.some(m => m.lessons.some(l => l.labType === 'final_exam')))
      .filter(s => getFinalExamQuestions(s.code).length === 0)
      .map(s => s.code);
    expect(semProva).toEqual([]);
  });

  /* Duas trilhas não podem compartilhar a mesma prova: foi o que o ternário
     fazia, e nada no sistema de tipos denunciava. */
  it('never hands two trails the same questions', () => {
    const ids = ['AP034', 'AP035', 'AP041']
      .map(c => getFinalExamQuestions(c).map(q => q.id).sort().join('|'));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all final exam questions have explanations', () => {
    const qs034 = getFinalExamQuestions('AP034');
    for (const q of qs034) {
      expect(q.explanation).toBeDefined();
      expect(q.explanation!.length).toBeGreaterThan(10);
    }
    const qs035 = getFinalExamQuestions('AP035');
    for (const q of qs035) {
      expect(q.explanation).toBeDefined();
      expect(q.explanation!.length).toBeGreaterThan(10);
    }
  });
});

/**
 * Structural invariants, checked for both specialties.
 *
 * These exist because two separate lessons were found pointing at the same lab
 * component: AP034's "Laboratório de Cenários de Segurança" rendered the pact
 * builder, and AP035's table challenge rendered the element-by-element CodeLab.
 * In both cases a student met an identical screen twice and the second visit
 * assessed nothing, while a requirement went uncovered in practice. Nothing in
 * the type system prevents that — it is a data mistake — so it is checked here.
 */
describe.each([
  ['AP034', ap034],
  ['AP035', ap035],
  ['AP041', ap041],
])('%s structure', (code, specialty) => {
  const lessons = specialty.modules.flatMap(m => m.lessons);

  it('gives every lesson a unique code', () => {
    const codes = lessons.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('gives every module a unique code', () => {
    const codes = specialty.modules.map(m => m.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('never cites a requirement that does not exist', () => {
    const known = new Set(specialty.requirements.map(r => r.code));
    const unknown = lessons.flatMap(l => l.requirementCodes ?? []).filter(rc => !known.has(rc));
    expect(unknown).toEqual([]);
  });

  it('covers every requirement with at least one lesson', () => {
    const covered = new Set(lessons.flatMap(l => l.requirementCodes ?? []));
    const orphans = specialty.requirements.map(r => r.code).filter(rc => !covered.has(rc));
    expect(orphans).toEqual([]);
  });

  it('gives every lab lesson a labType', () => {
    const missing = lessons.filter(l => l.type === 'lab' && !l.labType).map(l => l.code);
    expect(missing).toEqual([]);
  });

  it('never points two lessons at the same lab', () => {
    const byLab = new Map<string, string[]>();
    for (const l of lessons) {
      if (!l.labType) continue;
      byLab.set(l.labType, [...(byLab.get(l.labType) ?? []), l.code]);
    }
    const shared = [...byLab.entries()]
      .filter(([, ls]) => ls.length > 1)
      .map(([lab, ls]) => `${lab}: ${ls.join(', ')}`);
    expect(shared).toEqual([]);
  });

  it(`names the specialty ${code}`, () => {
    expect(specialty.code).toBe(code);
  });
});
