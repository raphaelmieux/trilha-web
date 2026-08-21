import { describe, it, expect } from 'vitest';
import { calculateMastery, getModuleStatus, getProgressPercent, shuffleArray, type ProgressMap, melhorResultado, getProgressDetail } from './progress';

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


/*
  A queixa que originou estes testes: "termino a lição e o progresso não fica
  registrado". Ele ficava — mas o resultado mais recente substituía o anterior,
  então revisitar uma lição e ir pior rebaixava um requisito já concluído.
*/
describe('melhorResultado', () => {
  it('mantém o resultado antigo quando o novo é pior', () => {
    expect(melhorResultado({ correct: 8, total: 8 }, { correct: 5, total: 8 }))
      .toEqual({ correct: 8, total: 8 });
  });

  it('adota o novo quando ele é melhor', () => {
    expect(melhorResultado({ correct: 6, total: 8 }, { correct: 8, total: 8 }))
      .toEqual({ correct: 8, total: 8 });
  });

  it('adota o novo quando empatam, para atualizar a data do registro', () => {
    expect(melhorResultado({ correct: 6, total: 8 }, { correct: 3, total: 4 }))
      .toEqual({ correct: 3, total: 4 });
  });

  it('compara proporção, e não número bruto de acertos', () => {
    // 5/5 vale mais que 6/10, embora 6 seja maior que 5.
    expect(melhorResultado({ correct: 6, total: 10 }, { correct: 5, total: 5 }))
      .toEqual({ correct: 5, total: 5 });
  });

  it('uma lição sem questões não desloca o que já havia', () => {
    expect(melhorResultado({ correct: 7, total: 8 }, { correct: 0, total: 0 }))
      .toEqual({ correct: 7, total: 8 });
  });

  it('aceita o primeiro resultado quando não havia nada', () => {
    expect(melhorResultado({ correct: 0, total: 0 }, { correct: 2, total: 8 }))
      .toEqual({ correct: 2, total: 8 });
  });

  it('refazer e acertar tudo leva o requisito a concluído', () => {
    const antes = melhorResultado({ correct: 0, total: 0 }, { correct: 6, total: 8 });
    expect(calculateMastery(antes.correct, antes.total, false, false).status).toBe('needs_review');
    const depois = melhorResultado(antes, { correct: 8, total: 8 });
    expect(calculateMastery(depois.correct, depois.total, false, false).status).toBe('completed');
  });
});


/*
  A barra da trilha era 0% ou 100% e nada entre os dois: como uma lição inteira
  responde pelo mesmo questionário, ou todos os seus requisitos passam dos 80%
  ou nenhum passa. Quem errava uma questão via exatamente o mesmo que quem nunca
  tinha aberto a lição.
*/
describe('getProgressDetail', () => {
  const req = (status: string, mastery: number) =>
    ({ status, mastery_score: mastery } as any);

  it('separa o cumprido do que está a recuperar', () => {
    const d = getProgressDetail(['A', 'B'], {
      A: req('completed', 100),
      B: req('needs_review', 75),
    });
    expect(d).toEqual({ concluido: 50, parcial: 38 });   // 0,75 de 2 requisitos
  });

  it('mostra a porcentagem de acerto quando nada foi concluído', () => {
    const d = getProgressDetail(['A', 'B', 'C'], {
      A: req('needs_review', 75), B: req('needs_review', 75), C: req('needs_review', 75),
    });
    expect(d.concluido).toBe(0);
    expect(d.parcial).toBe(75);
  });

  it('distingue quem errou uma questão de quem não começou', () => {
    const quaseLa = getProgressDetail(['A'], { A: req('needs_review', 75) });
    const intocado = getProgressDetail(['A'], {});
    expect(quaseLa.parcial).toBe(75);
    expect(intocado).toEqual({ concluido: 0, parcial: 0 });
  });

  it('nunca ultrapassa a largura da barra', () => {
    const d = getProgressDetail(['A', 'B'], {
      A: req('completed', 100),
      B: req('completed', 100),
    });
    expect(d.concluido + d.parcial).toBeLessThanOrEqual(100);
    expect(d).toEqual({ concluido: 100, parcial: 0 });
  });

  it('ignora requisito sem tentativa alguma', () => {
    const d = getProgressDetail(['A', 'B'], { A: req('learning', 0) });
    expect(d).toEqual({ concluido: 0, parcial: 0 });
  });

  it('devolve zeros para uma lista vazia', () => {
    expect(getProgressDetail([], {})).toEqual({ concluido: 0, parcial: 0 });
  });
});
