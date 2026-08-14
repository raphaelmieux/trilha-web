// @vitest-environment jsdom
// Scoped to this file rather than set globally: these are the only tests that
// need a DOM (the validator parses markup), and jsdom is markedly slower to boot
// than the default node environment the other suites run in.
import { describe, it, expect } from 'vitest';
import { validateHtml, validateSiteLinks, stripComments } from './htmlValidator';

const check = (source: string, id: string) => validateHtml(source, [id])[0];

describe('stripComments', () => {
  it('removes commented-out markup', () => {
    expect(stripComments('<p>a</p><!-- <img src="x"> -->')).toBe('<p>a</p>');
  });

  it('removes multi-line comments', () => {
    expect(stripComments('a<!--\n<table>\n-->b')).toBe('ab');
  });
});

describe('the exploit the old substring checks allowed', () => {
  // This is the whole reason this module exists: the previous implementation was
  // `code.includes('<img')`, so a single comment scored full marks.
  const cheat = `<!-- <html <head <body <b> <i> <li> <a href <p> <br <img <hr <table <tr <td -->`;

  it('rejects every element when they only appear inside a comment', () => {
    const ids = ['html', 'head', 'body', 'bold', 'italic', 'listItem', 'link',
      'paragraph', 'lineBreak', 'image', 'horizontalRule', 'table', 'tableRow', 'tableCell'];
    const results = validateHtml(cheat, ids);
    expect(results.every(r => !r.passed)).toBe(true);
  });

  it('rejects tags written as escaped text rather than markup', () => {
    expect(check('&lt;img src="a.png" alt="a"&gt;', 'image').passed).toBe(false);
  });
});

describe('structural checks', () => {
  it('accepts html/head/body only when actually written', () => {
    // DOMParser synthesises html/head/body for any input, so a source-level check
    // is required — otherwise a bare fragment would pass.
    expect(check('só um texto solto', 'body').passed).toBe(false);
    expect(check('<html><head></head><body></body></html>', 'body').passed).toBe(true);
  });

  it('requires a non-empty title inside head', () => {
    expect(check('<head><title></title></head>', 'title').passed).toBe(false);
    expect(check('<head><title>Meu site</title></head>', 'title').passed).toBe(true);
  });

  it('rejects empty inline elements', () => {
    expect(check('<b></b>', 'bold').passed).toBe(false);
    expect(check('<b>forte</b>', 'bold').passed).toBe(true);
  });
});

describe('listItem', () => {
  it('rejects an <li> outside a list', () => {
    const r = check('<li>item</li>', 'listItem');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('<ul>');
  });

  it('accepts an <li> inside <ul> or <ol>', () => {
    expect(check('<ul><li>item</li></ul>', 'listItem').passed).toBe(true);
    expect(check('<ol><li>item</li></ol>', 'listItem').passed).toBe(true);
  });
});

describe('link', () => {
  it('rejects an anchor with no href', () => {
    expect(check('<a>clique</a>', 'link').passed).toBe(false);
  });

  it('rejects an anchor with an empty href', () => {
    expect(check('<a href="  ">clique</a>', 'link').passed).toBe(false);
  });

  it('rejects an anchor with no clickable text', () => {
    expect(check('<a href="x.html"></a>', 'link').passed).toBe(false);
  });

  it('accepts a complete anchor', () => {
    expect(check('<a href="x.html">clique</a>', 'link').passed).toBe(true);
  });
});

describe('image', () => {
  it('rejects an image with no src', () => {
    expect(check('<img alt="foto">', 'image').passed).toBe(false);
  });

  it('rejects an image with no alt, and says why', () => {
    const r = check('<img src="foto.jpg">', 'image');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('alt');
  });

  it('accepts an accessible image', () => {
    expect(check('<img src="foto.jpg" alt="Acampamento">', 'image').passed).toBe(true);
  });
});

describe('table', () => {
  it('does not credit a <tr> the parser inserted on the student behalf', () => {
    // The HTML5 parsing algorithm wraps a stray <td> in <tbody><tr>, so the DOM
    // contains a <tr> the student never typed. Requirement AP035-3.12 is about
    // knowing that element, so the row check must consult the source too.
    const source = '<table><td>x</td></table>';
    const repaired = new DOMParser().parseFromString(source, 'text/html');
    expect(repaired.querySelectorAll('table tr').length).toBe(1); // parser repaired it

    expect(check(source, 'tableRow').passed).toBe(false);
    // The cell itself was genuinely written, and each requirement is scored on its
    // own element — the missing <tr> is penalised by the row check alone.
    expect(check(source, 'tableCell').passed).toBe(true);
  });

  it('rejects empty cells', () => {
    expect(check('<table><tr><td></td></tr></table>', 'tableCell').passed).toBe(false);
  });

  it('accepts a well-formed cell', () => {
    expect(check('<table><tr><td>valor</td></tr></table>', 'tableCell').passed).toBe(true);
  });

  it('requires a real grid, not a single cell', () => {
    expect(check('<table><tr><td>a</td></tr></table>', 'tableGrid').passed).toBe(false);
    const grid = '<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>';
    expect(check(grid, 'tableGrid').passed).toBe(true);
  });
});

describe('form', () => {
  it('rejects a form without a field', () => {
    expect(check('<form><button>Enviar</button></form>', 'form').passed).toBe(false);
  });

  it('rejects a form without a submit control', () => {
    expect(check('<form><input name="n"></form>', 'form').passed).toBe(false);
  });

  it('accepts a form with a field and a button', () => {
    expect(check('<form><input name="n"><button>Enviar</button></form>', 'form').passed).toBe(true);
  });
});

describe('validateSiteLinks', () => {
  const page = (filename: string, links: string[] = []) => ({
    filename,
    content: `<html><body>${links.map(l => `<a href="${l}">ir</a>`).join('')}</body></html>`,
  });

  it('flags a page nothing links to', () => {
    const pages = [
      page('index.html', ['sobre.html']),
      page('sobre.html', ['index.html']),
      page('contato.html', ['index.html']),
    ];
    const r = validateSiteLinks(pages).find(x => x.id === 'interlinked')!;
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('contato.html');
  });

  it('passes when every page is reachable', () => {
    const pages = [
      page('index.html', ['sobre.html', 'contato.html']),
      page('sobre.html', ['index.html']),
      page('contato.html', ['index.html']),
    ];
    expect(validateSiteLinks(pages).find(x => x.id === 'interlinked')!.passed).toBe(true);
  });

  it('ignores anchors and query strings when matching targets', () => {
    const pages = [
      page('index.html', ['sobre.html#topo']),
      page('sobre.html', ['index.html?x=1']),
    ];
    const results = validateSiteLinks(pages);
    expect(results.find(x => x.id === 'interlinked')!.passed).toBe(true);
    expect(results.find(x => x.id === 'noBrokenLinks')!.passed).toBe(true);
  });

  it('detects a link to a page that does not exist', () => {
    const pages = [page('index.html', ['fantasma.html']), page('sobre.html', ['index.html'])];
    const r = validateSiteLinks(pages).find(x => x.id === 'noBrokenLinks')!;
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('fantasma.html');
  });

  it('does not treat external links as broken', () => {
    const pages = [
      page('index.html', ['https://adventistas.org', 'sobre.html']),
      page('sobre.html', ['index.html']),
    ];
    expect(validateSiteLinks(pages).find(x => x.id === 'noBrokenLinks')!.passed).toBe(true);
  });
});

describe('table challenge (AP035-3.14)', () => {
  const IDS = ['pageComplete', 'tableStructure', 'tableHeader', 'tableSize',
    'tableFilled', 'tableCaption', 'tableOwnContent'];

  const page = (body: string) => `<!DOCTYPE html>
<html><head><title>Escala</title></head><body>${body}</body></html>`;

  const good = page(`
    <h2>Escala da Unidade Falcão</h2>
    <table>
      <caption>Quem abre o programa em cada sábado</caption>
      <tr><th>Sábado</th><th>Responsável</th><th>Tarefa</th></tr>
      <tr><td>03/05</td><td>Ana</td><td>Oração</td></tr>
      <tr><td>10/05</td><td>Bruno</td><td>Louvor</td></tr>
      <tr><td>17/05</td><td>Carla</td><td>Bandeirim</td></tr>
    </table>`);

  const run = (html: string) => validateHtml(html, IDS);
  const failing = (html: string) => run(html).filter(r => !r.passed).map(r => r.id);

  it('accepts a finished table page', () => {
    expect(failing(good)).toEqual([]);
  });

  it('rejects the starter with the example cells left in place', () => {
    // The one way to satisfy every structural check without deciding anything.
    const starter = page(`
      <h2>Escala</h2>
      <table>
        <caption>Trocar por uma descrição da sua tabela</caption>
        <tr><th>Coluna 1</th><th>Coluna 2</th><th>Coluna 3</th></tr>
        <tr><td>Dado 1</td><td>Dado 2</td><td>Dado 3</td></tr>
      </table>`);
    expect(failing(starter)).toContain('tableOwnContent');
  });

  it('does not accept the sixteen-element checklist as a table page', () => {
    // A page with one <td> passes the other lab and must not pass this one.
    const minimal = page('<table><tr><td>x</td></tr></table>');
    const failed = failing(minimal);
    expect(failed).toContain('tableHeader');
    expect(failed).toContain('tableSize');
  });

  it('requires three named columns, not one', () => {
    const oneHeader = page(`<h2>t</h2><table>
      <tr><th>Nome</th></tr><tr><td>Ana</td></tr>
      <tr><td>Bruno</td></tr><tr><td>Carla</td></tr></table>`);
    expect(failing(oneHeader)).toContain('tableHeader');
  });

  it('counts data rows, ignoring the header row', () => {
    const twoRows = page(`<h2>t</h2><table>
      <tr><th>A</th><th>B</th><th>C</th></tr>
      <tr><td>1</td><td>2</td><td>3</td></tr>
      <tr><td>4</td><td>5</td><td>6</td></tr></table>`);
    const size = run(twoRows).find(r => r.id === 'tableSize')!;
    expect(size.passed).toBe(false);
    expect(size.detail).toContain('2 linhas');
  });

  it('rejects an empty cell and says how many', () => {
    const withGap = good.replace('<td>Oração</td>', '<td>  </td>');
    const filled = run(withGap).find(r => r.id === 'tableFilled')!;
    expect(filled.passed).toBe(false);
    expect(filled.detail).toContain('1 célula');
  });

  it('accepts a heading instead of a caption', () => {
    const noCaption = good.replace(/<caption>.*<\/caption>/, '');
    expect(run(noCaption).find(r => r.id === 'tableCaption')!.passed).toBe(true);
  });

  it('rejects a table with neither caption nor heading', () => {
    const bare = good.replace(/<caption>.*<\/caption>/, '').replace(/<h2>.*<\/h2>/, '');
    expect(run(bare).find(r => r.id === 'tableCaption')!.passed).toBe(false);
  });

  it('requires the page scaffolding around the table', () => {
    const fragment = '<table><tr><th>A</th><th>B</th><th>C</th></tr></table>';
    expect(failing(fragment)).toContain('pageComplete');
  });

  it('requires a filled <title>', () => {
    const noTitle = good.replace('<title>Escala</title>', '<title></title>');
    const complete = run(noTitle).find(r => r.id === 'pageComplete')!;
    expect(complete.passed).toBe(false);
    expect(complete.detail).toMatch(/title/);
  });

  it('is not fooled by a table that exists only inside a comment', () => {
    const commented = page('<h2>t</h2><!-- <table><tr><th>A</th></tr></table> -->');
    expect(failing(commented)).toContain('tableStructure');
  });
});
