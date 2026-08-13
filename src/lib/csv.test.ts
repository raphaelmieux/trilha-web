import { describe, it, expect } from 'vitest';
import { toCsv, UTF8_BOM } from './csv';

describe('UTF8_BOM', () => {
  // Regression guard: an earlier version embedded the BOM as a literal U+FEFF
  // character, which was silently lost on write, so exported files opened in
  // Excel with mangled accents.
  it('is exactly one U+FEFF code point', () => {
    expect(UTF8_BOM).toHaveLength(1);
    expect(UTF8_BOM.charCodeAt(0)).toBe(0xFEFF);
  });
});

describe('toCsv', () => {
  it('writes a header row followed by data rows', () => {
    expect(toCsv(['Nome', 'Clube'], [['Ana', 'Pioneiros']]))
      .toBe('Nome;Clube\r\nAna;Pioneiros');
  });

  it('quotes cells containing the separator', () => {
    expect(toCsv(['Nome'], [['Silva; Ana']]))
      .toBe('Nome\r\n"Silva; Ana"');
  });

  it('escapes embedded quotes by doubling them', () => {
    expect(toCsv(['Apelido'], [['Ana "Aninha"']]))
      .toBe('Apelido\r\n"Ana ""Aninha"""');
  });

  it('quotes cells containing newlines so the row is not split', () => {
    expect(toCsv(['Obs'], [['linha1\nlinha2']]))
      .toBe('Obs\r\n"linha1\nlinha2"');
  });

  it('renders null and undefined as empty cells rather than "null"', () => {
    expect(toCsv(['A', 'B'], [[null, undefined]])).toBe('A;B\r\n;');
  });

  it('keeps numbers unquoted', () => {
    expect(toCsv(['N'], [[42]])).toBe('N\r\n42');
  });

  it('supports a comma separator and quotes accordingly', () => {
    expect(toCsv(['A'], [['x,y']], ',')).toBe('A\r\n"x,y"');
    // a semicolon is harmless when the separator is a comma
    expect(toCsv(['A'], [['x;y']], ',')).toBe('A\r\nx;y');
  });

  it('handles an empty row set', () => {
    expect(toCsv(['Nome'], [])).toBe('Nome');
  });
});
