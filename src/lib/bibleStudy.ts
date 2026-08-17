/**
 * Bible reference handling for the WebLab's requirement AP034-6.2:
 *
 *   "Usar um site de busca para encontrar um site de Bíblia on-line. Ir ao site,
 *    procurar pelo menos três diferentes textos da Bíblia em três versões
 *    diferentes, e mostrar seus resultados para o seu instrutor."
 *
 * Three *different* texts in three *different* versions is the whole exercise,
 * and neither half can be checked by counting boxes: "Fp 4:8" and
 * "Filipenses 4:8" are the same verse written two ways, and a student who types
 * the same version name with different capitalisation has not used two versions.
 * Both comparisons need the text parsed rather than compared as strings.
 */

export interface BibleReference {
  book: string;
  /** The canonical book name, for comparing "Fp" against "Filipenses". */
  canonical: string;
  chapter: number;
  verse: number;
}

/**
 * The 66 books with the abbreviations a Brazilian Pathfinder actually writes.
 *
 * Kept as a list rather than a free-text check because "procurar três textos da
 * Bíblia" is only demonstrated if what was typed is a Bible reference. Without
 * this, "Xyz 1:1" would pass.
 */
const BOOKS: { canonical: string; names: string[] }[] = [
  { canonical: 'Gênesis', names: ['genesis', 'gn', 'gen'] },
  { canonical: 'Êxodo', names: ['exodo', 'ex', 'exo'] },
  { canonical: 'Levítico', names: ['levitico', 'lv', 'lev'] },
  { canonical: 'Números', names: ['numeros', 'nm', 'num'] },
  { canonical: 'Deuteronômio', names: ['deuteronomio', 'dt', 'deut'] },
  { canonical: 'Josué', names: ['josue', 'js', 'jos'] },
  { canonical: 'Juízes', names: ['juizes', 'jz', 'jui'] },
  { canonical: 'Rute', names: ['rute', 'rt'] },
  { canonical: '1 Samuel', names: ['1samuel', '1sm', 'isamuel'] },
  { canonical: '2 Samuel', names: ['2samuel', '2sm', 'iisamuel'] },
  { canonical: '1 Reis', names: ['1reis', '1rs'] },
  { canonical: '2 Reis', names: ['2reis', '2rs'] },
  { canonical: '1 Crônicas', names: ['1cronicas', '1cr'] },
  { canonical: '2 Crônicas', names: ['2cronicas', '2cr'] },
  { canonical: 'Esdras', names: ['esdras', 'ed'] },
  { canonical: 'Neemias', names: ['neemias', 'ne'] },
  { canonical: 'Ester', names: ['ester', 'et'] },
  /* "Jó" and "João" both reduce to "jo" once accents are stripped, and João is
     what a Pathfinder means by it far more often. João is declared later and
     therefore wins the bare "jo"; Jó keeps "job". */
  { canonical: 'Jó', names: ['job'] },
  { canonical: 'Salmos', names: ['salmos', 'salmo', 'sl', 'sal'] },
  { canonical: 'Provérbios', names: ['proverbios', 'pv', 'prov'] },
  { canonical: 'Eclesiastes', names: ['eclesiastes', 'ec'] },
  { canonical: 'Cantares', names: ['cantares', 'canticos', 'ct'] },
  { canonical: 'Isaías', names: ['isaias', 'is'] },
  { canonical: 'Jeremias', names: ['jeremias', 'jr'] },
  { canonical: 'Lamentações', names: ['lamentacoes', 'lm'] },
  { canonical: 'Ezequiel', names: ['ezequiel', 'ez'] },
  { canonical: 'Daniel', names: ['daniel', 'dn'] },
  { canonical: 'Oseias', names: ['oseias', 'os'] },
  { canonical: 'Joel', names: ['joel', 'jl'] },
  { canonical: 'Amós', names: ['amos', 'am'] },
  { canonical: 'Obadias', names: ['obadias', 'ob'] },
  { canonical: 'Jonas', names: ['jonas', 'jn'] },
  { canonical: 'Miqueias', names: ['miqueias', 'mq'] },
  { canonical: 'Naum', names: ['naum', 'na'] },
  { canonical: 'Habacuque', names: ['habacuque', 'hc'] },
  { canonical: 'Sofonias', names: ['sofonias', 'sf'] },
  { canonical: 'Ageu', names: ['ageu', 'ag'] },
  { canonical: 'Zacarias', names: ['zacarias', 'zc'] },
  { canonical: 'Malaquias', names: ['malaquias', 'ml'] },
  { canonical: 'Mateus', names: ['mateus', 'mt'] },
  { canonical: 'Marcos', names: ['marcos', 'mc'] },
  { canonical: 'Lucas', names: ['lucas', 'lc'] },
  { canonical: 'João', names: ['joao', 'jo'] },
  { canonical: 'Atos', names: ['atos', 'at'] },
  { canonical: 'Romanos', names: ['romanos', 'rm'] },
  { canonical: '1 Coríntios', names: ['1corintios', '1co'] },
  { canonical: '2 Coríntios', names: ['2corintios', '2co'] },
  { canonical: 'Gálatas', names: ['galatas', 'gl'] },
  { canonical: 'Efésios', names: ['efesios', 'ef'] },
  { canonical: 'Filipenses', names: ['filipenses', 'fp', 'fil'] },
  { canonical: 'Colossenses', names: ['colossenses', 'cl'] },
  { canonical: '1 Tessalonicenses', names: ['1tessalonicenses', '1ts'] },
  { canonical: '2 Tessalonicenses', names: ['2tessalonicenses', '2ts'] },
  { canonical: '1 Timóteo', names: ['1timoteo', '1tm'] },
  { canonical: '2 Timóteo', names: ['2timoteo', '2tm'] },
  { canonical: 'Tito', names: ['tito', 'tt'] },
  { canonical: 'Filemom', names: ['filemom', 'fm'] },
  { canonical: 'Hebreus', names: ['hebreus', 'hb'] },
  { canonical: 'Tiago', names: ['tiago', 'tg'] },
  { canonical: '1 Pedro', names: ['1pedro', '1pe'] },
  { canonical: '2 Pedro', names: ['2pedro', '2pe'] },
  { canonical: '1 João', names: ['1joao', '1jo'] },
  { canonical: '2 João', names: ['2joao', '2jo'] },
  { canonical: '3 João', names: ['3joao', '3jo'] },
  { canonical: 'Judas', names: ['judas', 'jd'] },
  { canonical: 'Apocalipse', names: ['apocalipse', 'ap'] },
];

/** Strips accents and punctuation so "1 Coríntios" and "1co" compare equal. */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const BOOK_LOOKUP = new Map<string, string>();
for (const { canonical, names } of BOOKS) {
  BOOK_LOOKUP.set(normalise(canonical), canonical);
  for (const name of names) BOOK_LOOKUP.set(normalise(name), canonical);
}

/**
 * Reads "Filipenses 4:8", "Fp 4:8", "1 Coríntios 13:4" and the like.
 *
 * Returns null when the shape is wrong or the book is not in the canon, so an
 * invented reference cannot count towards the three the requirement asks for.
 */
export function parseReference(input: string): BibleReference | null {
  const text = input.trim();
  if (!text) return null;

  // Book name, then chapter, then verse — separated by : or , as people write it.
  const match = /^(.+?)\s*(\d{1,3})\s*[:.,]\s*(\d{1,3})/.exec(text);
  if (!match) return null;

  const [, rawBook, rawChapter, rawVerse] = match;
  const canonical = BOOK_LOOKUP.get(normalise(rawBook));
  if (!canonical) return null;

  const chapter = Number(rawChapter);
  const verse = Number(rawVerse);
  if (chapter < 1 || verse < 1) return null;

  return { book: rawBook.trim(), canonical, chapter, verse };
}

export function sameReference(a: BibleReference, b: BibleReference): boolean {
  return a.canonical === b.canonical && a.chapter === b.chapter && a.verse === b.verse;
}

/** How many genuinely different verses are among the given references. */
export function countDistinctReferences(inputs: string[]): number {
  const seen: BibleReference[] = [];
  for (const input of inputs) {
    const parsed = parseReference(input);
    if (!parsed) continue;
    if (!seen.some(other => sameReference(parsed, other))) seen.push(parsed);
  }
  return seen.length;
}

/**
 * Translations a Brazilian club is likely to meet. Offered as a list rather than
 * a free field so that "NVI" and "nvi " cannot be counted as two versions.
 */
export const BIBLE_VERSIONS = [
  { id: 'ACF', label: 'ACF — Almeida Corrigida Fiel' },
  { id: 'ARA', label: 'ARA — Almeida Revista e Atualizada' },
  { id: 'ARC', label: 'ARC — Almeida Revista e Corrigida' },
  { id: 'NVI', label: 'NVI — Nova Versão Internacional' },
  { id: 'NTLH', label: 'NTLH — Nova Tradução na Linguagem de Hoje' },
  { id: 'NAA', label: 'NAA — Nova Almeida Atualizada' },
  { id: 'KJA', label: 'KJA — King James Atualizada' },
] as const;

export function countDistinctVersions(versions: string[]): number {
  return new Set(versions.map(v => v.trim().toUpperCase()).filter(Boolean)).size;
}
