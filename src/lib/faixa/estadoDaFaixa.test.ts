import { describe, it, expect } from 'vitest';
import { certificadoDaPeca, estadoDaPeca } from './estadoDaFaixa';

const cert = (curriculum_code: string, status: 'active' | 'revoked', issued_at = '2026-10-01T00:00:00Z') =>
  ({ curriculum_code, status, issued_at });

describe('o estado de uma peça da Faixa', () => {
  const tem = new Set(['ap034_complete', 'lab_web_lab']);

  it('acende pela insígnia, e só por ela', () => {
    expect(estadoDaPeca({ insignia: 'lab_web_lab' }, tem, [])).toBe('cheia');
    expect(estadoDaPeca({ insignia: 'lab_code_lab' }, tem, [])).toBe('vazia');
    /* O laboratório previsto não tem insígnia ainda: o lugar existe e fica vazio. */
    expect(estadoDaPeca({}, tem, [])).toBe('vazia');
  });

  /* D6: o documento revogado apaga a peça, sem tirá-la do lugar — a insígnia
     não se perde, e o Token.Web() não pode aparecer como se valesse. */
  it('apaga a peça cujo Token.Web() foi revogado', () => {
    const p = { insignia: 'ap034_complete', token: 'AP034' };
    expect(estadoDaPeca(p, tem, [cert('AP034', 'revoked')])).toBe('revogada');
    expect(estadoDaPeca(p, tem, [cert('AP034', 'revoked'), cert('AP034', 'active')])).toBe('cheia');
    expect(estadoDaPeca(p, tem, [])).toBe('cheia');
  });

  it('o clique abre o ativo, ou o revogado mais recente', () => {
    const lista = [cert('AP034', 'revoked', '2026-01-01T00:00:00Z'), cert('AP034', 'revoked', '2026-05-01T00:00:00Z')];
    expect(certificadoDaPeca({ token: 'AP034' }, lista)?.issued_at).toBe('2026-05-01T00:00:00Z');
    expect(certificadoDaPeca({ token: 'AP034' }, [...lista, cert('AP034', 'active')])?.status).toBe('active');
    expect(certificadoDaPeca({}, lista)).toBeUndefined();
  });
});
