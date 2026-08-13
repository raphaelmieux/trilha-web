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
