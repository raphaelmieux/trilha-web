import { describe, it, expect } from 'vitest';
import {
  parseReference, sameReference, countDistinctReferences, countDistinctVersions,
} from './bibleStudy';

describe('parseReference', () => {
  it('reads a full book name', () => {
    expect(parseReference('Filipenses 4:8')).toMatchObject({ canonical: 'Filipenses', chapter: 4, verse: 8 });
  });

  it('reads the abbreviation', () => {
    expect(parseReference('Fp 4:8')).toMatchObject({ canonical: 'Filipenses', chapter: 4, verse: 8 });
  });

  it('reads a numbered book', () => {
    expect(parseReference('1 Coríntios 13:4')).toMatchObject({ canonical: '1 Coríntios', chapter: 13, verse: 4 });
  });

  it('ignores accents and case', () => {
    expect(parseReference('salmos 23:1')).toMatchObject({ canonical: 'Salmos' });
    expect(parseReference('SALMOS 23:1')).toMatchObject({ canonical: 'Salmos' });
  });

  it('accepts a comma or a dot between chapter and verse', () => {
    expect(parseReference('Salmos 23,1')).toMatchObject({ chapter: 23, verse: 1 });
    expect(parseReference('Salmos 23.1')).toMatchObject({ chapter: 23, verse: 1 });
  });

  it('rejects a book that is not in the canon', () => {
    // Without this, an invented reference would count towards the three.
    expect(parseReference('Xyz 1:1')).toBeNull();
  });

  it('rejects a reference with no verse', () => {
    expect(parseReference('Filipenses 4')).toBeNull();
  });

  it('rejects an empty input', () => {
    expect(parseReference('   ')).toBeNull();
  });

  it('rejects chapter or verse zero', () => {
    expect(parseReference('Salmos 0:1')).toBeNull();
    expect(parseReference('Salmos 1:0')).toBeNull();
  });

  it('resolves the bare "jo" to João, which is what it usually means', () => {
    expect(parseReference('Jo 3:16')?.canonical).toBe('João');
  });

  it('still resolves Jó through its own abbreviation', () => {
    expect(parseReference('Job 1:1')?.canonical).toBe('Jó');
  });
});

describe('sameReference', () => {
  it('treats the abbreviation and the full name as the same verse', () => {
    const a = parseReference('Fp 4:8')!;
    const b = parseReference('Filipenses 4:8')!;
    expect(sameReference(a, b)).toBe(true);
  });

  it('separates different verses of the same chapter', () => {
    expect(sameReference(parseReference('Fp 4:8')!, parseReference('Fp 4:13')!)).toBe(false);
  });
});

describe('countDistinctReferences', () => {
  it('counts three different verses', () => {
    expect(countDistinctReferences(['Filipenses 4:8', 'Salmos 23:1', 'João 3:16'])).toBe(3);
  });

  it('does not count the same verse written two ways', () => {
    // This is the whole point: "três diferentes textos da Bíblia".
    expect(countDistinctReferences(['Filipenses 4:8', 'Fp 4:8', 'Salmos 23:1'])).toBe(2);
  });

  it('ignores entries it cannot parse', () => {
    expect(countDistinctReferences(['Filipenses 4:8', 'qualquer coisa', ''])).toBe(1);
  });

  it('returns zero for nothing usable', () => {
    expect(countDistinctReferences(['', 'abc'])).toBe(0);
  });
});

describe('countDistinctVersions', () => {
  it('counts three different translations', () => {
    expect(countDistinctVersions(['NVI', 'ACF', 'NTLH'])).toBe(3);
  });

  it('does not count the same version typed differently', () => {
    expect(countDistinctVersions(['NVI', 'nvi ', ' Nvi'])).toBe(1);
  });

  it('ignores blanks', () => {
    expect(countDistinctVersions(['NVI', '', '  '])).toBe(1);
  });
});
