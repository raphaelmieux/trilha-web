/**
 * Minimal RFC 4180-style CSV serialiser.
 *
 * Defaults to ";" because these files are opened in Excel on pt-BR machines,
 * where the list separator is a semicolon and a comma-separated file lands
 * entirely in column A.
 */
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  separator = ';',
): string {
  const escapeCell = (value: string | number | null | undefined): string => {
    const text = value === null || value === undefined ? '' : String(value);
    // Quote when the cell could otherwise break the row, and double any quotes
    // inside it, which is how CSV escapes a literal quote character.
    const needsQuoting = text.includes(separator) || text.includes('"')
      || text.includes('\n') || text.includes('\r');
    return needsQuoting ? `"${text.replace(/"/g, '""')}"` : text;
  };

  return [headers, ...rows]
    .map(row => row.map(escapeCell).join(separator))
    .join('\r\n');
}

/**
 * Byte order mark, built from its code point rather than pasted as a literal
 * U+FEFF character: the literal is invisible in a diff and trivially stripped by
 * an editor or formatter without anyone noticing it went missing.
 */
export const UTF8_BOM = String.fromCharCode(0xFEFF);

/**
 * Triggers a browser download of `content` as a UTF-8 CSV file.
 *
 * The BOM is required, not decorative: without it Excel reads the file as ANSI
 * and mangles every accented character — "Nível" becomes "NÃ­vel" and "Falcão"
 * becomes "FalcÃ£o".
 */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([UTF8_BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads back what `toCsv` writes.
 *
 * It exists because the CC-ES008 needs the round trip, and because a second
 * reader written elsewhere would diverge from this writer on the first
 * adjustment — the two-"Word" defect, appearing as a row whose columns are
 * shifted by one and whose values are all plausible.
 *
 * The naive `line.split(separator)` is the whole reason the writer quotes: a
 * cell holding the separator — which is every "caixas de seleção" answer in
 * that vereda's form, joined with "; " — would break into two, shifting every
 * later column on that row. The file still opens, and nothing says anything.
 *
 * Quotes are only special when they open a cell, which is what RFC 4180 says
 * and what a spreadsheet does: an inch mark in the middle of a cell (`5" de
 * chuva`) is a literal, and a parser that treated it as an opening quote would
 * swallow the rest of the row.
 */
export function fromCsv(content: string, separator = ';'): string[][] {
  const text = content.startsWith(UTF8_BOM) ? content.slice(1) : content;
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  let abriuCitado = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; continue; }
        quoted = false;
        continue;
      }
      cell += ch;
      continue;
    }

    if (ch === '"' && cell === '' && !abriuCitado) {
      quoted = true;
      abriuCitado = true;
      continue;
    }
    if (ch === separator) {
      row.push(cell); cell = ''; abriuCitado = false; continue;
    }
    if (ch === '\r') continue;
    if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; abriuCitado = false; continue;
    }
    cell += ch;
  }

  // A última célula não tem separador nem quebra atrás dela. Descartá-la por
  // isso perderia a última linha inteira de todo arquivo que não termina em
  // quebra — que é o que `toCsv` produz.
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
