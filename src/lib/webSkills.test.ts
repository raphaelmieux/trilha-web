import { describe, it, expect } from 'vitest';
import {
  splitHostname, parseAddress, assessAddress,
  analyzeQuery, buildSearchUrl, assessDownload,
} from './webSkills';

describe('splitHostname', () => {
  it('handles a Brazilian two-part suffix', () => {
    expect(splitHostname('www.bibliaonline.com.br')).toEqual({
      subdomain: 'www', domain: 'bibliaonline', tld: 'com.br',
    });
  });

  it('handles a single-part suffix', () => {
    expect(splitHostname('pt.wikipedia.org')).toEqual({
      subdomain: 'pt', domain: 'wikipedia', tld: 'org',
    });
  });

  it('keeps a multi-level subdomain whole', () => {
    expect(splitHostname('a.b.exemplo.com.br').subdomain).toBe('a.b');
  });

  it('reports no subdomain when there is none', () => {
    expect(splitHostname('adventistas.org')).toEqual({
      subdomain: '', domain: 'adventistas', tld: 'org',
    });
  });

  it('does not mistake .br alone for com.br', () => {
    expect(splitHostname('exemplo.br')).toEqual({ subdomain: '', domain: 'exemplo', tld: 'br' });
  });

  it('survives a trailing dot', () => {
    expect(splitHostname('exemplo.com.').tld).toBe('com');
  });
});

describe('parseAddress', () => {
  it('dissects a full address', () => {
    const a = parseAddress('https://www.bibliaonline.com.br/nvi/fp/4/8?destaque=1#versiculo');
    expect(a.valid).toBe(true);
    expect(a.scheme).toBe('https');
    expect(a.secure).toBe(true);
    expect(a.subdomain).toBe('www');
    expect(a.domain).toBe('bibliaonline');
    expect(a.tld).toBe('com.br');
    expect(a.path).toBe('/nvi/fp/4/8');
    expect(a.query).toEqual([['destaque', '1']]);
    expect(a.fragment).toBe('versiculo');
  });

  it('marks http as not secure without rejecting it', () => {
    const a = parseAddress('http://exemplo.com');
    expect(a.valid).toBe(true);
    expect(a.secure).toBe(false);
  });

  it('asks for the protocol rather than guessing one', () => {
    // Silently prepending https:// would teach the student that the protocol is
    // optional, which is exactly the habit that hides an http:// login page.
    const a = parseAddress('bibliaonline.com.br');
    expect(a.valid).toBe(false);
    expect(a.error).toMatch(/protocolo/i);
  });

  it('rejects an empty input', () => {
    expect(parseAddress('   ').valid).toBe(false);
  });

  it('rejects a protocol with nothing after it', () => {
    expect(parseAddress('https://').valid).toBe(false);
  });

  it('reads several query parameters', () => {
    expect(parseAddress('https://x.com/b?q=fé&n=2').query).toEqual([['q', 'fé'], ['n', '2']]);
  });

  it('reports the root path as "/"', () => {
    expect(parseAddress('https://exemplo.com').path).toBe('/');
  });
});

describe('assessAddress', () => {
  it('approves a plain https site', () => {
    const v = assessAddress('https://www.bibliaonline.com.br/nvi/fp/4');
    expect(v.level).toBe('seguro');
  });

  it('condemns http for a login', () => {
    const v = assessAddress('http://banco.exemplo.com/login');
    expect(v.level).toBe('perigoso');
    expect(v.findings.some(f => f.code === 'sem-https')).toBe(true);
  });

  it('condemns a bare IP address', () => {
    const v = assessAddress('https://192.168.10.44/entrar');
    expect(v.findings.some(f => f.code === 'ip-cru')).toBe(true);
  });

  it('condemns a lookalike written in another alphabet', () => {
    // The first character is a Cyrillic "а" (U+0430), not a latin "a". The URL
    // parser converts the host to punycode, which is what gives the trick away.
    const v = assessAddress('https://аpple.com/entrar');
    expect(v.findings.some(f => f.code === 'punycode')).toBe(true);
  });

  it('condemns a host already written in punycode', () => {
    expect(assessAddress('https://xn--80ak6aa92e.com').findings.some(f => f.code === 'punycode')).toBe(true);
  });

  it('rejects an impossible punycode host outright', () => {
    // "xn--gogle-9va" does not decode; the URL parser refuses it, and refusing
    // is the right answer — there is nothing safe about an address the browser
    // itself cannot resolve.
    expect(assessAddress('https://xn--gogle-9va.com').level).toBe('perigoso');
  });

  it('catches a brand parked in the subdomain of someone else', () => {
    const v = assessAddress('https://bancodobrasil.seguro-login.net/entrar');
    const finding = v.findings.find(f => f.code === 'marca-fora-do-dominio');
    expect(finding).toBeDefined();
    expect(finding!.message).toContain('seguro-login.net');
  });

  it('catches a brand glued to extra words in the domain', () => {
    const v = assessAddress('https://nubank-seguranca.com');
    expect(v.findings.some(f => f.code === 'marca-fora-do-dominio')).toBe(true);
  });

  it('does not flag the brand on its own real domain', () => {
    expect(assessAddress('https://www.nubank.com.br/login').level).toBe('seguro');
  });

  it('does not flag a hyphenated spelling of the brand itself', () => {
    // "banco-do-brasil.com.br" is the brand with hyphens, not an impostor;
    // flagging it would be the lab crying wolf.
    expect(assessAddress('https://banco-do-brasil.com.br').level).toBe('seguro');
  });

  it('treats an unparseable address as dangerous rather than unknown', () => {
    expect(assessAddress('bibliaonline.com.br').level).toBe('perigoso');
  });

  it('reports every problem, not just the first', () => {
    const v = assessAddress('http://itau.login-seguro.net');
    expect(v.findings.map(f => f.code).sort()).toEqual(['marca-fora-do-dominio', 'sem-https']);
  });
});

describe('analyzeQuery', () => {
  it('separates a quoted phrase from the plain words', () => {
    const q = analyzeQuery('"tudo o que é verdadeiro" estudo');
    expect(q.phrases).toEqual(['tudo o que é verdadeiro']);
    expect(q.terms).toEqual(['estudo']);
  });

  it('reads a site restriction', () => {
    expect(analyzeQuery('filipenses site:bibliaonline.com.br').sites).toEqual(['bibliaonline.com.br']);
  });

  it('reads a filetype restriction and drops a leading dot', () => {
    expect(analyzeQuery('estudo filetype:.pdf').fileTypes).toEqual(['pdf']);
  });

  it('reads an exclusion', () => {
    const q = analyzeQuery('filipenses -comentário');
    expect(q.exclusions).toEqual(['comentário']);
    expect(q.terms).toEqual(['filipenses']);
  });

  it('does not treat a lone hyphen as an exclusion', () => {
    expect(analyzeQuery('bíblia - estudo').exclusions).toEqual([]);
  });

  it('does not count a single quoted word as a phrase', () => {
    // "fé" in quotes changes nothing a search engine does; calling it a phrase
    // would let a student pass the phrase check without learning it.
    const q = analyzeQuery('"fé" esperança');
    expect(q.phrases).toEqual([]);
    expect(q.terms).toEqual(['fé', 'esperança']);
  });

  it('keeps spaces inside a quoted phrase instead of splitting on them', () => {
    expect(analyzeQuery('a "b c d" e').phrases).toEqual(['b c d']);
  });

  it('handles a full query with every operator at once', () => {
    const q = analyzeQuery('"paz de Deus" filipenses site:bibliaonline.com.br filetype:pdf -venda');
    expect(q.phrases).toEqual(['paz de Deus']);
    expect(q.terms).toEqual(['filipenses']);
    expect(q.sites).toEqual(['bibliaonline.com.br']);
    expect(q.fileTypes).toEqual(['pdf']);
    expect(q.exclusions).toEqual(['venda']);
  });

  it('ignores an operator with no value', () => {
    expect(analyzeQuery('bíblia site:').sites).toEqual([]);
  });

  it('returns everything empty for an empty query', () => {
    const q = analyzeQuery('');
    expect(q.phrases.length + q.terms.length + q.sites.length + q.exclusions.length).toBe(0);
  });
});

describe('buildSearchUrl', () => {
  it('encodes the query and keeps safe search on', () => {
    const url = buildSearchUrl('"paz de Deus" site:bibliaonline.com.br');
    expect(url).toContain('kp=1');
    expect(url).toContain(encodeURIComponent('"paz de Deus" site:bibliaonline.com.br'));
  });

  it('produces a parseable address', () => {
    expect(parseAddress(buildSearchUrl('bíblia')).valid).toBe(true);
  });
});

describe('assessDownload', () => {
  it('approves a PDF', () => {
    const v = assessDownload('estudo-filipenses.pdf');
    expect(v.level).toBe('seguro');
    expect(v.finalExtension).toBe('pdf');
  });

  it('approves an image', () => {
    expect(assessDownload('foto-do-clube.jpg').level).toBe('seguro');
  });

  it('condemns an executable', () => {
    expect(assessDownload('instalador.exe').level).toBe('perigoso');
  });

  it('condemns a disguised executable and says so', () => {
    const v = assessDownload('estudo-biblico.pdf.exe');
    expect(v.level).toBe('perigoso');
    expect(v.disguised).toBe(true);
    expect(v.extensions).toEqual(['pdf', 'exe']);
    expect(v.message).toMatch(/enganar/);
  });

  it('does not call a versioned filename disguised', () => {
    // "relatorio.v2.pdf" has two extensions but the last one is harmless.
    const v = assessDownload('relatorio.v2.pdf');
    expect(v.disguised).toBe(false);
    expect(v.level).toBe('seguro');
  });

  it('warns about an archive without condemning it', () => {
    expect(assessDownload('fotos-do-acampamento.zip').level).toBe('atencao');
  });

  it('warns about a macro-enabled document', () => {
    expect(assessDownload('planilha.xlsm').level).toBe('atencao');
  });

  it('warns when there is no extension at all', () => {
    const v = assessDownload('arquivo');
    expect(v.level).toBe('atencao');
    expect(v.extensions).toEqual([]);
  });

  it('ignores the case of the extension', () => {
    expect(assessDownload('VIRUS.EXE').level).toBe('perigoso');
  });
});
