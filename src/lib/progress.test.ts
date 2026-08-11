import { describe, it, expect } from 'vitest';
import { calculateMastery, getModuleStatus, getProgressPercent, shuffleArray, type ProgressMap } from './progress';

describe('calculateMastery', () => {
  it('returns not_started when total is 0', () => {
    const result = calculateMastery(0, 0, false, false);
    expect(result.status).toBe('not_started');
    expect(result.score).toBe(0);
  });

  it('returns completed when score >= 80 and retention + checkpoint passed', () => {
    const result = calculateMastery(8, 10, true, true);
    expect(result.status).toBe('completed');
    expect(result.score).toBe(80);
  });

  it('returns completed when score >= 80 even without retention/checkpoint (theory lessons)', () => {
    const result = calculateMastery(9, 10, false, false);
    expect(result.status).toBe('completed');
    expect(result.score).toBe(90);
  });

  it('returns needs_review when score < 80 and some correct', () => {
    const result = calculateMastery(5, 10, false, false);
    expect(result.status).toBe('needs_review');
    expect(result.score).toBe(50);
  });

  it('returns learning when no correct answers', () => {
    const result = calculateMastery(0, 10, false, false);
    expect(result.status).toBe('learning');
    expect(result.score).toBe(0);
  });
});

describe('getModuleStatus', () => {
  it('returns not_started for empty requirements', () => {
    expect(getModuleStatus([], {})).toBe('not_started');
  });

  it('returns completed when all requirements are completed', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'completed' } as any,
      'AP034.2': { status: 'completed' } as any,
    };
    expect(getModuleStatus(['AP034.1', 'AP034.2'], progress)).toBe('completed');
  });

  it('returns needs_review when any requirement needs review', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'completed' } as any,
      'AP034.2': { status: 'needs_review' } as any,
    };
    expect(getModuleStatus(['AP034.1', 'AP034.2'], progress)).toBe('needs_review');
  });

  it('returns learning when any requirement is in progress', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'learning' } as any,
    };
    expect(getModuleStatus(['AP034.1'], progress)).toBe('learning');
  });

  it('returns not_started when no requirements have progress', () => {
    expect(getModuleStatus(['AP034.1', 'AP034.2'], {})).toBe('not_started');
  });
});

describe('getProgressPercent', () => {
  it('returns 0 for empty requirements', () => {
    expect(getProgressPercent([], {})).toBe(0);
  });

  it('returns 0 when no requirements are completed', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'learning' } as any,
    };
    expect(getProgressPercent(['AP034.1'], progress)).toBe(0);
  });

  it('returns correct percentage for partial completion', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'completed' } as any,
      'AP034.2': { status: 'learning' } as any,
      'AP034.3': { status: 'completed' } as any,
      'AP034.4': { status: 'not_started' } as any,
    };
    expect(getProgressPercent(['AP034.1', 'AP034.2', 'AP034.3', 'AP034.4'], progress)).toBe(50);
  });

  it('returns 100 when all requirements are completed', () => {
    const progress: ProgressMap = {
      'AP034.1': { status: 'completed' } as any,
      'AP034.2': { status: 'completed' } as any,
    };
    expect(getProgressPercent(['AP034.1', 'AP034.2'], progress)).toBe(100);
  });
});

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(arr.length);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });
});
