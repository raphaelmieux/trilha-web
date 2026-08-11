import { describe, it, expect } from 'vitest';
import { ap034, ap035 } from './index';
import { getFinalExamQuestions } from './finalExams';

describe('AP034 curriculum', () => {
  it('has 29 requirements', () => {
    expect(ap034.requirements).toHaveLength(29);
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
  it('has 25 requirements', () => {
    expect(ap035.requirements).toHaveLength(25);
  });

  it('has 8 modules', () => {
    expect(ap035.modules).toHaveLength(8);
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
