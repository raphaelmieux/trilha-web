/**
 * Navigation, search and download analysis for the WebLab.
 *
 * Requirement AP034-6.1 asks the student to navigate, to search for a biblical
 * subject, and to download a file. The old lab simulated all three: five buttons
 * that set a string, a search that returned a hard-coded list, and a "download"
 * that pushed a filename into an array. Nothing was parsed and nothing was
 * produced, so the lab could not tell a student who understood an address from
 * one who clicked in order.
 *
 * Everything here is real parsing — the browser's own URL parser for addresses,
 * a proper tokeniser for search queries, filename analysis for downloads — so
 * the lab's verdicts can be tested, and a wrong answer is wrong for a reason it
 * can state.
 */

/* ── Addresses ───────────────────────────────────────────────────────────── */

export interface Address {
  valid: boolean;
  error?: string;
  scheme: string;
  hostname: string;
  subdomain: string;
  /** The registrable label: "bibliaonline" in "www.bibliaonline.com.br". */
  domain: string;
  /** The public suffix: "com.br". */
  tld: string;
  path: string;
  query: [string, string][];
  fragment: string;
  secure: boolean;
}

/**
 * A cut-down public suffix list.
 *
 * The real list has thousands of entries and changes constantly; loading it
 * would add a megabyte to a page that runs on club phones. These are the
 * two-part suffixes a Brazilian Pathfinder actually meets. Anything not listed
 * falls back to the last label, which is right for .com, .org, .net and .br
 * addresses without a second level.
 */
const MULTI_PART_SUFFIXES = [
  'com.br', 'org.br', 'net.br', 'gov.br', 'edu.br', 'mil.br', 'art.br', 'adv.br',
  'blog.br', 'eco.br', 'esp.br', 'ind.br', 'inf.br', 'rec.br', 'srv.br', 'tv.br',
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'com.ar', 'com.mx', 'co.jp',
];

/** Splits a hostname into subdomain, registrable label and public suffix. */
export function splitHostname(hostname: string): { subdomain: string; domain: string; tld: string } {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const suffix = MULTI_PART_SUFFIXES.find(s => host.endsWith(`.${s}`));
  if (suffix) {
    const head = host.slice(0, -(suffix.length + 1));
    const labels = head.split('.');
    return { subdomain: labels.slice(0, -1).join('.'), domain: labels[labels.length - 1] ?? '', tld: suffix };
  }
  const labels = host.split('.');
  if (labels.length <= 1) return { subdomain: '', domain: host, tld: '' };
  return {
    subdomain: labels.slice(0, -2).join('.'),
    domain: labels[labels.length - 2],
    tld: labels[labels.length - 1],
  };
}

const EMPTY: Address = {
  valid: false, scheme: '', hostname: '', subdomain: '', domain: '', tld: '',
  path: '', query: [], fragment: '', secure: false,
};

/**
 * Parses an address with the browser's own URL parser — the same one that runs
 * when the student types into a real address bar, so the dissection shown in
 * the lab is what actually happens, not an approximation.
 */
export function parseAddress(input: string): Address {
  const text = input.trim();
  if (!text) return { ...EMPTY, error: 'Digite um endereço.' };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    return { ...EMPTY, error: 'Falta o protocolo no começo — https:// ou http://.' };
  }
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ...EMPTY, error: 'Endereço inválido.' };
  }
  if (!url.hostname) return { ...EMPTY, error: 'Falta o nome do site.' };

  const { subdomain, domain, tld } = splitHostname(url.hostname);
  return {
    valid: true,
    scheme: url.protocol.replace(':', ''),
    hostname: url.hostname,
    subdomain, domain, tld,
    path: url.pathname,
    query: [...url.searchParams.entries()],
    fragment: url.hash.replace('#', ''),
    secure: url.protocol === 'https:',
  };
}

/* ── Is this address safe to type a password into? ───────────────────────── */

export type RiskLevel = 'seguro' | 'atencao' | 'perigoso';

export interface SafetyFinding { code: string; level: RiskLevel; message: string }

export interface SafetyVerdict { level: RiskLevel; findings: SafetyFinding[] }

/**
 * Names impostors copy. Kept short and explicit on purpose: a longer list would
 * start flagging honest sites, and a lab that cries wolf teaches students to
 * ignore it.
 */
const BRANDS = [
  'bancodobrasil', 'caixa', 'bradesco', 'itau', 'santander', 'nubank',
  'mercadolivre', 'mercadopago', 'paypal', 'correios', 'receitafederal',
  'google', 'gmail', 'youtube', 'whatsapp', 'instagram', 'facebook',
  'netflix', 'microsoft', 'apple', 'steam',
];

const strip = (s: string) => s.replace(/[^a-z0-9]/g, '');

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Decides whether an address is safe to hand a password to, and says why.
 *
 * The rules are the ones that actually catch phishing aimed at families: no
 * encryption, a bare IP address instead of a name, a name written in another
 * alphabet to imitate latin letters, and — the common one — a real brand name
 * placed anywhere in the address except where it counts, which is the
 * registrable domain right before the suffix.
 */
export function assessAddress(input: string): SafetyVerdict {
  const address = parseAddress(input);
  if (!address.valid) {
    return { level: 'perigoso', findings: [{ code: 'invalido', level: 'perigoso', message: address.error ?? 'Endereço inválido.' }] };
  }

  const findings: SafetyFinding[] = [];

  if (!address.secure) {
    findings.push({
      code: 'sem-https', level: 'perigoso',
      message: 'A conexão é http://, sem criptografia. Tudo o que for digitado viaja em texto aberto e pode ser lido por quem estiver na mesma rede.',
    });
  }

  if (IPV4.test(address.hostname)) {
    findings.push({
      code: 'ip-cru', level: 'perigoso',
      message: 'O endereço é um número de máquina, não um nome. Nenhum banco ou serviço sério pede login por um endereço assim.',
    });
  }

  if (address.hostname.includes('xn--')) {
    findings.push({
      code: 'punycode', level: 'perigoso',
      message: 'O nome usa letras de outro alfabeto desenhadas para parecer latinas — é o truque de escrever "аpple" com um "а" cirílico.',
    });
  }

  const hostFlat = strip(address.hostname);
  const domainFlat = strip(address.domain);
  const brand = BRANDS.find(b => hostFlat.includes(b));
  if (brand && domainFlat !== brand) {
    findings.push({
      code: 'marca-fora-do-dominio', level: 'perigoso',
      message: `O nome "${brand}" aparece no endereço, mas o site de verdade é "${address.domain}.${address.tld}" — o que vale é o nome logo antes do ponto final, não o que vem antes dele.`,
    });
  }

  if (findings.length === 0) {
    findings.push({
      code: 'ok', level: 'seguro',
      message: `Conexão https e domínio próprio: ${address.domain}.${address.tld}. O cadeado garante que ninguém no caminho leu o que você enviou.`,
    });
  }

  const level: RiskLevel = findings.some(f => f.level === 'perigoso') ? 'perigoso'
    : findings.some(f => f.level === 'atencao') ? 'atencao'
      : 'seguro';
  return { level, findings };
}

/* ── Search queries ──────────────────────────────────────────────────────── */

export interface QueryAnalysis {
  raw: string;
  /** Text between double quotes — searched as an exact phrase. */
  phrases: string[];
  /** Values of site: — restricts results to one site. */
  sites: string[];
  /** Values of filetype: — restricts results to one kind of file. */
  fileTypes: string[];
  /** Words prefixed with a minus sign — removed from the results. */
  exclusions: string[];
  /** Everything else: the plain words. */
  terms: string[];
}

/**
 * Splits a query the way a search engine does: quoted phrases stay whole,
 * `operador:valor` pairs are pulled out, a leading minus marks an exclusion.
 */
export function analyzeQuery(raw: string): QueryAnalysis {
  const out: QueryAnalysis = { raw, phrases: [], sites: [], fileTypes: [], exclusions: [], terms: [] };

  // Tokenise, keeping quoted runs together.
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of raw) {
    if (char === '"') { inQuotes = !inQuotes; current += char; continue; }
    if (/\s/.test(char) && !inQuotes) {
      if (current) tokens.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);

  for (const token of tokens) {
    const negated = token.startsWith('-') && token.length > 1;
    const body = negated ? token.slice(1) : token;
    const unquoted = body.replace(/^"|"$/g, '');

    const operator = /^(site|filetype):(.+)$/i.exec(body);
    if (operator) {
      const [, name, value] = operator;
      const clean = value.replace(/^"|"$/g, '').replace(/^\./, '');
      if (!clean) continue;
      if (name.toLowerCase() === 'site') out.sites.push(clean.toLowerCase());
      else out.fileTypes.push(clean.toLowerCase());
      continue;
    }

    if (negated) { if (unquoted) out.exclusions.push(unquoted); continue; }

    // A phrase needs both quotes and more than one word to mean anything.
    if (/^".*"$/.test(body) && unquoted.trim().includes(' ')) {
      out.phrases.push(unquoted.trim());
      continue;
    }

    if (unquoted) out.terms.push(unquoted);
  }

  return out;
}

/** Builds a search URL with strict safe search on — these are children's accounts. */
export function buildSearchUrl(query: string): string {
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&kp=1`;
}

/* ── Downloads ───────────────────────────────────────────────────────────── */

export interface DownloadVerdict {
  name: string;
  /** Every extension in the name, in order: ["pdf", "exe"] for "estudo.pdf.exe". */
  extensions: string[];
  finalExtension: string;
  /** True when an earlier extension disguises the real one. */
  disguised: boolean;
  level: RiskLevel;
  message: string;
}

const EXECUTABLE = ['exe', 'scr', 'bat', 'cmd', 'com', 'msi', 'vbs', 'jar', 'apk', 'ps1', 'hta', 'pif', 'reg', 'lnk'];
const MACRO = ['docm', 'xlsm', 'pptm'];
const ARCHIVE = ['zip', 'rar', '7z', 'iso'];
const DOCUMENT = ['pdf', 'txt', 'rtf', 'odt', 'docx', 'xlsx', 'pptx', 'csv', 'epub'];
const MEDIA = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp3', 'mp4', 'wav', 'ogg', 'avi'];

/**
 * Judges a download by its filename.
 *
 * The disguised-extension case is the one worth teaching: Windows hides known
 * extensions by default, so "estudo-biblico.pdf.exe" arrives on screen looking
 * exactly like "estudo-biblico.pdf", with a program icon most people never
 * check.
 */
export function assessDownload(filename: string): DownloadVerdict {
  const name = filename.trim();
  const parts = name.split('.');
  const extensions = parts.length > 1 ? parts.slice(1).map(p => p.toLowerCase()) : [];
  const finalExtension = extensions[extensions.length - 1] ?? '';
  const known = [...EXECUTABLE, ...MACRO, ...ARCHIVE, ...DOCUMENT, ...MEDIA];
  const disguised = extensions.length > 1
    && EXECUTABLE.includes(finalExtension)
    && known.includes(extensions[extensions.length - 2]);

  if (disguised) {
    return {
      name, extensions, finalExtension, disguised, level: 'perigoso',
      message: `O nome termina em .${finalExtension}: é um programa. O ".${extensions[extensions.length - 2]}" antes dele está ali só para enganar — o Windows costuma esconder a última extensão.`,
    };
  }
  if (EXECUTABLE.includes(finalExtension)) {
    return {
      name, extensions, finalExtension, disguised, level: 'perigoso',
      message: `.${finalExtension} é um programa que roda no seu computador. Só instale programas do site oficial de quem os fez.`,
    };
  }
  if (MACRO.includes(finalExtension)) {
    return {
      name, extensions, finalExtension, disguised, level: 'atencao',
      message: `.${finalExtension} é um documento que pode carregar macros — pequenos programas embutidos. Abra, mas não habilite as macros.`,
    };
  }
  if (ARCHIVE.includes(finalExtension)) {
    return {
      name, extensions, finalExtension, disguised, level: 'atencao',
      message: `.${finalExtension} é um pacote: só dá para saber o que tem dentro depois de abrir. Confira o conteúdo antes de executar qualquer coisa.`,
    };
  }
  if (DOCUMENT.includes(finalExtension) || MEDIA.includes(finalExtension)) {
    return {
      name, extensions, finalExtension, disguised, level: 'seguro',
      message: `.${finalExtension} é um arquivo de conteúdo: abre num leitor, não roda sozinho no sistema.`,
    };
  }
  return {
    name, extensions, finalExtension, disguised, level: 'atencao',
    message: finalExtension
      ? `Extensão .${finalExtension} desconhecida. Na dúvida, não abra.`
      : 'O arquivo não tem extensão. Não dá para saber o que ele é.',
  };
}
