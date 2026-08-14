/**
 * Structural validation of student HTML.
 *
 * The previous CodeLab/SiteLab checks were substring searches — `code.includes('<img')`
 * — which pass on text that is not markup at all. A student could write
 *
 *     <!-- <html <head <body <b> <i> <li> <a href <p> <br <img <hr <table <tr <td -->
 *
 * and score 14/14 without producing a single element. Worse, they teach nothing:
 * `<img` matches even when the tag has no src and no alt.
 *
 * These checks parse the markup into a real document and interrogate the tree, so
 * they assess what the requirement actually asks for: an <li> inside a list, an
 * <a> with a usable href, an <img> that is accessible, a <td> inside a <tr>.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  /** Shown when the check fails, explaining precisely what is missing. */
  detail?: string;
}

export interface CheckSpec {
  id: string;
  label: string;
  hint: string;
  run: (doc: Document, source: string) => { passed: boolean; detail?: string };
}

/**
 * Strips comments before analysis. Anything inside <!-- --> is not markup, and
 * leaving it in would let commented-out tags satisfy the source-level checks.
 */
export function stripComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * html/head/body need a source-level check rather than a DOM one: DOMParser
 * synthesises all three even for a bare text fragment, so `doc.querySelector('body')`
 * is always truthy and would pass for a student who wrote nothing at all.
 */
function writtenInSource(source: string, tag: string): boolean {
  return new RegExp(`<${tag}(\\s|>)`, 'i').test(stripComments(source));
}

function hasText(el: Element | null): boolean {
  return !!el && el.textContent!.trim().length > 0;
}

/** Elements the student actually wrote, ignoring ones the parser inserted. */
function query(doc: Document, selector: string): Element[] {
  return [...doc.querySelectorAll(selector)];
}

export const CHECKS: Record<string, CheckSpec> = {
  html: {
    id: 'html', label: '<html>', hint: 'Elemento raiz da página',
    run: (_doc, source) => ({
      passed: writtenInSource(source, 'html'),
      detail: 'Escreva a tag <html> envolvendo toda a página.',
    }),
  },
  head: {
    id: 'head', label: '<head>', hint: 'Cabeçalho com metadados',
    run: (_doc, source) => ({
      passed: writtenInSource(source, 'head'),
      detail: 'Escreva a seção <head>, onde ficam o título e os metadados.',
    }),
  },
  body: {
    id: 'body', label: '<body>', hint: 'Corpo visível da página',
    run: (_doc, source) => ({
      passed: writtenInSource(source, 'body'),
      detail: 'Escreva a seção <body>, onde fica o conteúdo visível.',
    }),
  },
  title: {
    id: 'title', label: '<title>', hint: 'Título da página, dentro do <head>',
    run: (doc) => {
      const title = doc.querySelector('head > title');
      if (!title) return { passed: false, detail: 'Falta <title> dentro do <head>.' };
      if (!hasText(title)) return { passed: false, detail: 'O <title> está vazio — escreva o nome da página.' };
      return { passed: true };
    },
  },
  bold: {
    id: 'bold', label: '<b>', hint: 'Texto em negrito',
    run: (doc) => {
      const els = query(doc, 'b');
      if (els.length === 0) return { passed: false, detail: 'Nenhum <b> encontrado.' };
      if (!els.some(hasText)) return { passed: false, detail: 'O <b> está vazio — coloque um texto dentro dele.' };
      return { passed: true };
    },
  },
  italic: {
    id: 'italic', label: '<i>', hint: 'Texto em itálico',
    run: (doc) => {
      const els = query(doc, 'i');
      if (els.length === 0) return { passed: false, detail: 'Nenhum <i> encontrado.' };
      if (!els.some(hasText)) return { passed: false, detail: 'O <i> está vazio — coloque um texto dentro dele.' };
      return { passed: true };
    },
  },
  listItem: {
    id: 'listItem', label: '<li> em lista', hint: 'Item dentro de <ul> ou <ol>',
    run: (doc) => {
      const items = query(doc, 'li');
      if (items.length === 0) return { passed: false, detail: 'Nenhum <li> encontrado.' };
      const inList = items.filter(li => li.parentElement && /^(ul|ol)$/i.test(li.parentElement.tagName));
      if (inList.length === 0) {
        return { passed: false, detail: 'O <li> precisa estar dentro de uma lista <ul> ou <ol>.' };
      }
      if (!inList.some(hasText)) return { passed: false, detail: 'Os itens da lista estão vazios.' };
      return { passed: true };
    },
  },
  link: {
    id: 'link', label: '<a href>', hint: 'Link com endereço e texto',
    run: (doc) => {
      const links = query(doc, 'a');
      if (links.length === 0) return { passed: false, detail: 'Nenhum <a> encontrado.' };
      const withHref = links.filter(a => (a.getAttribute('href') || '').trim().length > 0);
      if (withHref.length === 0) return { passed: false, detail: 'O <a> precisa do atributo href com um endereço.' };
      if (!withHref.some(hasText)) return { passed: false, detail: 'O link precisa de um texto clicável entre <a> e </a>.' };
      return { passed: true };
    },
  },
  paragraph: {
    id: 'paragraph', label: '<p>', hint: 'Parágrafo com texto',
    run: (doc) => {
      const els = query(doc, 'p');
      if (els.length === 0) return { passed: false, detail: 'Nenhum <p> encontrado.' };
      if (!els.some(hasText)) return { passed: false, detail: 'O parágrafo está vazio.' };
      return { passed: true };
    },
  },
  lineBreak: {
    id: 'lineBreak', label: '<br>', hint: 'Quebra de linha',
    run: (doc) => ({
      passed: query(doc, 'br').length > 0,
      detail: 'Nenhum <br> encontrado.',
    }),
  },
  image: {
    id: 'image', label: '<img> com src e alt', hint: 'Imagem com endereço e texto alternativo',
    run: (doc) => {
      const imgs = query(doc, 'img');
      if (imgs.length === 0) return { passed: false, detail: 'Nenhum <img> encontrado.' };
      const withSrc = imgs.filter(i => (i.getAttribute('src') || '').trim().length > 0);
      if (withSrc.length === 0) return { passed: false, detail: 'O <img> precisa do atributo src com o endereço da imagem.' };
      const withAlt = withSrc.filter(i => (i.getAttribute('alt') || '').trim().length > 0);
      if (withAlt.length === 0) {
        return {
          passed: false,
          detail: 'Falta o atributo alt. Ele descreve a imagem para quem não pode vê-la e é exigido pelo requisito.',
        };
      }
      return { passed: true };
    },
  },
  horizontalRule: {
    id: 'horizontalRule', label: '<hr>', hint: 'Linha horizontal',
    run: (doc) => ({
      passed: query(doc, 'hr').length > 0,
      detail: 'Nenhum <hr> encontrado.',
    }),
  },
  table: {
    id: 'table', label: '<table>', hint: 'Tabela',
    run: (doc) => ({
      passed: query(doc, 'table').length > 0,
      detail: 'Nenhuma <table> encontrada.',
    }),
  },
  // Table checks deliberately consult the source as well as the tree. The HTML5
  // parsing algorithm repairs tables: given `<table><td>x</td></table>` the browser
  // silently inserts <tbody><tr>, so a DOM-only check would report that the student
  // wrote a <tr> they never typed. Requirements AP035-3.12 and 3.13 are about
  // knowing those elements, so both the markup and the resulting structure count.
  tableRow: {
    id: 'tableRow', label: '<tr> na tabela', hint: 'Linha escrita dentro da tabela',
    run: (doc, source) => {
      if (!writtenInSource(source, 'tr')) {
        return { passed: false, detail: 'Escreva a tag <tr> para criar a linha da tabela.' };
      }
      if (query(doc, 'table tr').length === 0) {
        return { passed: false, detail: 'O <tr> precisa estar dentro de uma <table>.' };
      }
      return { passed: true };
    },
  },
  tableCell: {
    id: 'tableCell', label: '<td> na linha', hint: 'Célula dentro de <tr>, com conteúdo',
    run: (doc, source) => {
      if (!writtenInSource(source, 'td')) {
        return { passed: false, detail: 'Escreva a tag <td> para criar a célula.' };
      }
      const cells = query(doc, 'table tr td');
      if (cells.length === 0) return { passed: false, detail: 'Nenhum <td> dentro de um <tr>.' };
      if (!cells.some(hasText)) return { passed: false, detail: 'As células da tabela estão vazias.' };
      return { passed: true };
    },
  },
  tableGrid: {
    id: 'tableGrid', label: 'Tabela com 2+ linhas e 2+ colunas', hint: 'Uma tabela de verdade, não uma única célula',
    run: (doc) => {
      const tables = query(doc, 'table');
      for (const t of tables) {
        const rows = [...t.querySelectorAll('tr')];
        if (rows.length < 2) continue;
        const widest = Math.max(...rows.map(r => r.querySelectorAll('td, th').length));
        if (widest >= 2) return { passed: true };
      }
      return { passed: false, detail: 'A tabela precisa de pelo menos 2 linhas e 2 colunas.' };
    },
  },
  heading: {
    id: 'heading', label: 'Título (<h1>…<h6>)', hint: 'Um título para a página',
    run: (doc) => {
      const hs = query(doc, 'h1, h2, h3, h4, h5, h6');
      if (hs.length === 0) return { passed: false, detail: 'Nenhum título <h1>…<h6> encontrado.' };
      if (!hs.some(hasText)) return { passed: false, detail: 'O título está vazio.' };
      return { passed: true };
    },
  },
  form: {
    id: 'form', label: '<form> com campo e botão', hint: 'Formulário funcional',
    run: (doc) => {
      const forms = query(doc, 'form');
      if (forms.length === 0) return { passed: false, detail: 'Nenhum <form> encontrado.' };
      for (const f of forms) {
        const hasInput = f.querySelector('input, textarea, select');
        const hasButton = f.querySelector('button, input[type="submit"]');
        if (hasInput && hasButton) return { passed: true };
      }
      return { passed: false, detail: 'O formulário precisa de pelo menos um campo (<input>) e um botão de envio.' };
    },
  },
};

/**
 * Requirement AP035-3.14 — "criar página completa" with a table.
 *
 * These live apart from CHECKS because they judge a finished artefact rather
 * than the presence of an element. The element-by-element lab (AP035.2-L1)
 * already proves the student can write a `<td>`; repeating those same sixteen
 * checks here — which is what the curriculum did, pointing both lessons at the
 * identical CodeLab — proves nothing new. What is new is whether they can build
 * a table that holds real information: a header row, a shape worth tabulating,
 * no empty cells, and content that is theirs.
 */
export const TABLE_CHALLENGE_CHECKS: Record<string, CheckSpec> = {
  tableStructure: {
    id: 'tableStructure', label: 'Uma tabela completa', hint: 'A página tem uma <table> com linhas e células',
    run: (doc) => {
      const table = doc.querySelector('table');
      if (!table) return { passed: false, detail: 'Ainda não há nenhuma <table> na página.' };
      if (table.querySelectorAll('tr').length === 0) {
        return { passed: false, detail: 'A tabela existe mas não tem nenhuma linha <tr>.' };
      }
      return { passed: true };
    },
  },

  tableHeader: {
    id: 'tableHeader', label: 'Linha de cabeçalho com <th>', hint: 'A primeira linha nomeia as colunas',
    run: (doc) => {
      const headers = doc.querySelectorAll('table th');
      if (headers.length === 0) {
        return { passed: false, detail: 'Use <th> na primeira linha. É o que diz ao leitor — e ao leitor de tela — o que cada coluna significa.' };
      }
      if (headers.length < 3) {
        return { passed: false, detail: `Há ${headers.length} ${headers.length === 1 ? 'cabeçalho' : 'cabeçalhos'}. A tabela precisa de pelo menos 3 colunas nomeadas.` };
      }
      return { passed: true };
    },
  },

  tableSize: {
    id: 'tableSize', label: 'Ao menos 3 colunas e 3 linhas de dados', hint: 'Uma tabela de verdade, não um exemplo mínimo',
    run: (doc) => {
      const table = doc.querySelector('table');
      if (!table) return { passed: false, detail: 'Ainda não há tabela.' };
      const rows = [...table.querySelectorAll('tr')];
      const dataRows = rows.filter(r => r.querySelectorAll('td').length > 0);
      const widest = Math.max(0, ...rows.map(r => r.querySelectorAll('td, th').length));
      if (dataRows.length < 3 || widest < 3) {
        return {
          passed: false,
          detail: `Agora são ${dataRows.length} ${dataRows.length === 1 ? 'linha' : 'linhas'} de dados e ${widest} ${widest === 1 ? 'coluna' : 'colunas'}. Faltam ${Math.max(0, 3 - dataRows.length)} linhas e ${Math.max(0, 3 - widest)} colunas.`,
        };
      }
      return { passed: true };
    },
  },

  tableFilled: {
    id: 'tableFilled', label: 'Nenhuma célula vazia', hint: 'Toda célula carrega informação',
    run: (doc) => {
      const cells = [...doc.querySelectorAll('table td, table th')];
      if (cells.length === 0) return { passed: false, detail: 'Ainda não há células.' };
      const empty = cells.filter(c => c.textContent!.trim().length === 0).length;
      if (empty > 0) {
        return { passed: false, detail: `${empty} ${empty === 1 ? 'célula está vazia' : 'células estão vazias'}. Preencha ou remova.` };
      }
      return { passed: true };
    },
  },

  tableCaption: {
    id: 'tableCaption', label: 'A tabela diz do que trata', hint: 'Um <caption> ou um título antes dela',
    run: (doc) => {
      const caption = doc.querySelector('table caption');
      if (hasText(caption)) return { passed: true };
      const heading = [...doc.querySelectorAll('h1, h2, h3')].some(h => hasText(h));
      if (heading) return { passed: true };
      return { passed: false, detail: 'Acrescente <caption>Do que é esta tabela</caption> logo depois de <table>, ou um título <h2> antes dela.' };
    },
  },

  tableOwnContent: {
    id: 'tableOwnContent', label: 'Os dados são seus', hint: 'A tabela não é a do exemplo',
    run: (doc) => {
      const text = [...doc.querySelectorAll('table td')]
        .map(c => c.textContent!.trim().toLowerCase())
        .join('|');
      if (!text) return { passed: false, detail: 'Ainda não há dados nas células.' };
      // The starter ships one filled row so the student can see the shape; leaving
      // it untouched is the one way to pass every other check without deciding
      // anything, so it is checked for by name.
      const starter = ['coluna 1', 'coluna 2', 'coluna 3', 'dado 1', 'dado 2', 'dado 3'];
      const untouched = starter.filter(s => text.includes(s)).length;
      if (untouched >= 3) {
        return { passed: false, detail: 'Essas são as células de exemplo. Troque por dados de verdade — a escala da unidade, os hinos do trimestre, o que você quiser tabelar.' };
      }
      return { passed: true };
    },
  },

  pageComplete: {
    id: 'pageComplete', label: 'Página completa em volta da tabela', hint: '<html>, <head> com <title> e <body>',
    run: (doc, source) => {
      const missing = ['html', 'head', 'body'].filter(tag => !writtenInSource(source, tag));
      if (missing.length > 0) {
        return { passed: false, detail: `Faltam os elementos: ${missing.map(t => `<${t}>`).join(', ')}.` };
      }
      if (!hasText(doc.querySelector('title'))) {
        return { passed: false, detail: 'A página precisa de um <title> preenchido dentro de <head>.' };
      }
      return { passed: true };
    },
  },
};

/** Parses once and runs every requested check against the same document. */
export function validateHtml(source: string, checkIds: string[]): CheckResult[] {
  const doc = new DOMParser().parseFromString(source, 'text/html');
  const registry = { ...CHECKS, ...TABLE_CHALLENGE_CHECKS };
  return checkIds.map(id => {
    const spec = registry[id];
    if (!spec) throw new Error(`Unknown HTML check: ${id}`);
    const { passed, detail } = spec.run(doc, source);
    return { id: spec.id, label: spec.label, hint: spec.hint, passed, detail: passed ? undefined : detail };
  });
}

/**
 * Cross-page checks for a multi-page site: every page must be reachable from the
 * others, which is the actual point of requirement AP035-5.1 ("site interligado").
 */
export function validateSiteLinks(pages: { filename: string; content: string }[]): CheckResult[] {
  const names = pages.map(p => p.filename.toLowerCase());
  const results: CheckResult[] = [];

  const linkTargetsOf = (content: string): string[] => {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    return [...doc.querySelectorAll('a[href]')]
      .map(a => (a.getAttribute('href') || '').trim().toLowerCase())
      // strip anchors and query strings so "sobre.html#topo" still counts
      .map(h => h.split('#')[0].split('?')[0])
      .filter(Boolean);
  };

  const unreachable = pages.filter(target => {
    if (pages.length < 2) return false;
    return !pages.some(other =>
      other.filename !== target.filename &&
      linkTargetsOf(other.content).includes(target.filename.toLowerCase())
    );
  });

  results.push({
    id: 'interlinked',
    label: 'Páginas interligadas',
    hint: 'Cada página deve ser alcançável por um link de outra',
    passed: unreachable.length === 0,
    detail: unreachable.length > 0
      ? `Sem link apontando para: ${unreachable.map(p => p.filename).join(', ')}.`
      : undefined,
  });

  const broken = pages.flatMap(p =>
    linkTargetsOf(p.content)
      .filter(h => !/^(https?:|mailto:|tel:)/.test(h))
      .filter(h => !names.includes(h))
      .map(h => `${p.filename} → ${h}`)
  );

  results.push({
    id: 'noBrokenLinks',
    label: 'Sem links quebrados',
    hint: 'Links internos devem apontar para páginas existentes',
    passed: broken.length === 0,
    detail: broken.length > 0 ? `Link para página inexistente: ${broken.join('; ')}.` : undefined,
  });

  return results;
}
