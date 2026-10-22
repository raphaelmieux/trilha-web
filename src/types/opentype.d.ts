/*
 * O pedaço do opentype.js que a plataforma usa, escrito à mão.
 *
 * A 2.0 não traz tipos, e os de @types/opentype.js descrevem a 1.x. Declarar
 * só o que `textoEmCurvas.ts` chama é declarar o que a trava de tipos confere
 * de verdade: um tipo emprestado de outra versão aprovaria uma chamada que a
 * versão instalada não tem.
 */
declare module 'opentype.js' {
  export interface ComandoDeCaminho {
    type: 'M' | 'L' | 'C' | 'Q' | 'Z';
    x?: number; y?: number;
    x1?: number; y1?: number;
    x2?: number; y2?: number;
  }
  export interface Glyph {
    advanceWidth?: number;
    getPath(x: number, y: number, fontSize: number): { commands: ComandoDeCaminho[] };
  }
  export interface Font {
    charToGlyph(c: string): Glyph;
    unitsPerEm: number;
    ascender: number;
    descender: number;
  }
  export function parse(buffer: ArrayBuffer): Font;
}
