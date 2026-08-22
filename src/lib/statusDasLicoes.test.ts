import { describe, it, expect } from 'vitest';
import { statusDasLicoes } from './progress';
import type { ProgressMap } from './progress';

/*
  Concluir a lição teórica marcava o laboratório ao lado como feito.

  As duas cobrem o mesmo requisito oficial — na AP041, a teoria de história e a
  redação cobrem o 1.1; na AP034 isso acontece em cinco requisitos. Enquanto o
  estado da lição era deduzido do requisito, não havia como distinguir uma da
  outra: a contagem de lições andava de duas em duas e o desbravador via como
  concluído um laboratório em que nunca entrou.
*/

const feito = (codes: string[]): ProgressMap =>
  Object.fromEntries(codes.map(c => [c, { status: 'completed', mastery_score: 100 } as never]));

const teoria = { code: 'M1-L1', type: 'theory', requirementCodes: ['R1'] };
const lab = { code: 'M1-L2', type: 'lab', requirementCodes: ['R1'] };
const sozinha = { code: 'M2-L1', type: 'theory', requirementCodes: ['R2'] };
const prova = { code: 'M.F-L1', type: 'final', requirementCodes: [] };

describe('duas lições que dividem o mesmo requisito', () => {
  const licoes = [teoria, lab, sozinha];

  it('não dá o laboratório por feito quando só a teoria foi concluída', () => {
    const s = statusDasLicoes(licoes, feito(['R1']), new Set(['M1-L1']));
    expect(s['M1-L1']).toBe('completed');
    expect(s['M1-L2']).not.toBe('completed');
  });

  /* "Em andamento" e não "não iniciada": o requisito andou, e dizer que nada
     aconteceu seria tão falso quanto dizer que tudo aconteceu. */
  it('mostra o laboratório em andamento, já que o requisito avançou', () => {
    const s = statusDasLicoes(licoes, feito(['R1']), new Set(['M1-L1']));
    expect(s['M1-L2']).toBe('learning');
  });

  it('dá cada uma por feita quando as duas foram concluídas', () => {
    const s = statusDasLicoes(licoes, feito(['R1']), new Set(['M1-L1', 'M1-L2']));
    expect(s['M1-L1']).toBe('completed');
    expect(s['M1-L2']).toBe('completed');
  });

  it('dá o laboratório por feito mesmo sem a teoria', () => {
    const s = statusDasLicoes(licoes, feito(['R1']), new Set(['M1-L2']));
    expect(s['M1-L2']).toBe('completed');
    expect(s['M1-L1']).toBe('learning');
  });
});

describe('a lição que é dona do requisito sozinha', () => {
  /*
    O histórico de quem concluiu trilhas antes de os laboratórios registrarem a
    própria conclusão. Sem registro de lição, mas com o requisito cumprido e
    ninguém mais podendo tê-lo cumprido, a conclusão continua valendo.
  */
  it('continua contando pelo requisito, sem registro de lição', () => {
    const s = statusDasLicoes([teoria, lab, sozinha], feito(['R2']), new Set());
    expect(s['M2-L1']).toBe('completed');
  });

  it('não inventa conclusão quando o requisito não avançou', () => {
    const s = statusDasLicoes([teoria, lab, sozinha], {}, new Set());
    expect(s['M2-L1']).toBe('not_started');
  });
});

describe('a prova final', () => {
  it('nunca conta como lição do percurso', () => {
    const s = statusDasLicoes([teoria, lab, prova], feito(['R1']), new Set(['M.F-L1']));
    expect(s['M.F-L1']).toBe('not_started');
  });
});

describe('a contagem que a trilha mostra', () => {
  it('anda de uma em uma, e não de duas em duas', () => {
    const licoes = [teoria, lab, sozinha];
    const contar = (feitas: Set<string>, p: ProgressMap) =>
      licoes.filter(l => statusDasLicoes(licoes, p, feitas)[l.code] === 'completed').length;

    expect(contar(new Set(), {})).toBe(0);
    expect(contar(new Set(['M1-L1']), feito(['R1']))).toBe(1);
    expect(contar(new Set(['M1-L1', 'M1-L2']), feito(['R1']))).toBe(2);
    expect(contar(new Set(['M1-L1', 'M1-L2', 'M2-L1']), feito(['R1', 'R2']))).toBe(3);
  });
});
