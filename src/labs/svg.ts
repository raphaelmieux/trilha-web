/**
 * O arquivo SVG da prancha, escrito e lido de volta.
 *
 * ── Escrito para ser lido por gente ──────────────────────────────────────
 * O requisito 7 da CC-DG002 manda abrir o SVG num editor de texto, achar as
 * coordenadas de uma forma, mudá-las à mão e ver o efeito. Então o arquivo é
 * escrito como uma pessoa o escreveria: um elemento por linha, recuado dentro
 * do grupo, com o `id` que a lista de camadas mostra e coordenadas absolutas
 * de duas casas no máximo. Um arquivo de uma linha só, com seis casas
 * decimais, estaria certo e não ensinaria nada.
 *
 * ── E lido de volta pelo mesmo editor ────────────────────────────────────
 * Salvar no editor de texto e reabrir no de desenho é a metade do requisito
 * que mostra o efeito. O leitor entende o que o escritor escreve, e devolve um
 * erro com o lugar quando não entende — abrir o desenho vazio ensinaria que
 * mexer no arquivo o estraga, e o certo é saber **onde** se errou.
 *
 * ── A referência não sai ─────────────────────────────────────────────────
 * O logotipo que o examinador entregou é guia, e não desenho de quem estuda:
 * exportá-lo poria no arquivo a imagem de outra pessoa como se fosse parte do
 * trabalho.
 */

import {
  EXTREMIDADE_NO_SVG, LISTA_DE_FAMILIAS, alturaDaLinha, comCaixaRefeita, linhasDoTexto,
  type Extremidade, type Familia, type Objeto, type Prancha, type Texto, type Traco,
} from './design';
import { contornosDoD, dDosContornos } from './vetor';

const num = (n: number) => String(Math.round(n * 100) / 100);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Onde fica a linha de base da primeira linha, a partir do topo da caixa do texto. */
const baseDaPrimeira = (t: Texto) => (alturaDaLinha(t) - t.corpo) / 2 + t.corpo * 0.8;

const atributosDoTraco = (t: Traco | null | undefined) => (t
  ? ` stroke="${t.cor}" stroke-width="${num(t.espessura)}" stroke-linecap="${EXTREMIDADE_NO_SVG[t.extremidade]}" stroke-linejoin="round"`
  : '');

function elemento(o: Objeto, recuo: string): string[] {
  const id = ` id="${esc(o.id)}" data-nome="${esc(o.nome)}"`;
  switch (o.tipo) {
    case 'retangulo':
      return [`${recuo}<rect${id} x="${num(o.x)}" y="${num(o.y)}" width="${num(o.largura)}" height="${num(o.altura)}" fill="${o.preenchimento}"${atributosDoTraco(o.traco)}/>`];
    case 'elipse':
      return [`${recuo}<ellipse${id} cx="${num(o.x + o.largura / 2)}" cy="${num(o.y + o.altura / 2)}" rx="${num(o.largura / 2)}" ry="${num(o.altura / 2)}" fill="${o.preenchimento}"${atributosDoTraco(o.traco)}/>`];
    case 'caminho':
      return [`${recuo}<path${id} d="${dDosContornos(o.contornos)}" fill="${o.preenchimento ?? 'none'}" fill-rule="evenodd"${atributosDoTraco(o.traco)}/>`];
    case 'foto':
      return [`${recuo}<rect${id} data-foto="${o.motivo}" x="${num(o.x)}" y="${num(o.y)}" width="${num(o.largura)}" height="${num(o.altura)}" fill="${o.tons[0]}"/>`];
    case 'texto': {
      const ancora = o.alinhamento === 'esquerda' ? 'start' : o.alinhamento === 'direita' ? 'end' : 'middle';
      const x = o.alinhamento === 'esquerda' ? o.x : o.alinhamento === 'direita' ? o.x + o.largura : o.x + o.largura / 2;
      const y = o.y + baseDaPrimeira(o);
      const linhas = linhasDoTexto(o).map((l, i) =>
        `${recuo}  <tspan x="${num(x)}" y="${num(y + i * alturaDaLinha(o))}">${esc(l)}</tspan>`);
      return [
        `${recuo}<text${id} x="${num(x)}" y="${num(y)}" data-largura="${num(o.largura)}" data-entrelinha="${o.entrelinha}" font-family="${esc(o.familia)}" font-size="${num(o.corpo)}" font-weight="${o.peso}" fill="${o.cor}" text-anchor="${ancora}">`,
        ...linhas,
        `${recuo}</text>`,
      ];
    }
    case 'grupo':
      return [`${recuo}<g${id}>`, ...o.filhos.flatMap(f => elemento(f, `${recuo}  `)), `${recuo}</g>`];
    case 'referencia':
      return [];
  }
}

export function svgDaPrancha(p: Prancha): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${p.largura}" height="${p.altura}" viewBox="0 0 ${p.largura} ${p.altura}">`,
    `  <rect id="fundo" x="0" y="0" width="${p.largura}" height="${p.altura}" fill="${p.fundo}"/>`,
    ...p.objetos.flatMap(o => elemento(o, '  ')),
    '</svg>',
    '',
  ].join('\n');
}

/* ── A leitura ───────────────────────────────────────────────────────────── */

export type Leitura = { prancha: Prancha } | { erro: string };

class ErroDeLeitura extends Error {}

const DE_SVG: Record<string, Extremidade> = { butt: 'reta', round: 'redonda', square: 'quadrada' };

/**
 * Lê o SVG de volta para a prancha.
 *
 * A referência da prancha anterior volta para o lugar dela — o arquivo não a
 * carrega, e reabrir sem ela tiraria o guia de quem ainda está desenhando.
 */
export function pranchaDoSvg(texto: string, anterior: Prancha): Leitura {
  const doc = new DOMParser().parseFromString(texto, 'image/svg+xml');
  const falha = doc.getElementsByTagName('parsererror')[0];
  if (falha) {
    return { erro: 'O arquivo tem um erro de escrita: alguma marca não fecha, ou falta uma aspa. O desenho não foi reaberto.' };
  }
  const raiz = doc.documentElement;
  if (raiz.tagName !== 'svg') return { erro: 'Isto não é um arquivo SVG: ele não começa por <svg>.' };

  const numero = (el: Element, nome: string): number => {
    const bruto = el.getAttribute(nome);
    const v = Number(bruto);
    if (bruto === null || bruto.trim() === '' || !Number.isFinite(v)) {
      throw new ErroDeLeitura(`O ${nome} de "${el.getAttribute('id') ?? el.tagName}" não é um número: "${bruto ?? ''}".`);
    }
    return v;
  };
  const cor = (el: Element, nome: string) => {
    const v = el.getAttribute(nome);
    return v && /^#[0-9a-f]{6}$/i.test(v) ? v.toUpperCase() : null;
  };
  const traco = (el: Element): Traco | null => {
    const c = cor(el, 'stroke');
    if (!c) return null;
    return {
      cor: c,
      espessura: el.hasAttribute('stroke-width') ? numero(el, 'stroke-width') : 1,
      extremidade: DE_SVG[el.getAttribute('stroke-linecap') ?? 'butt'] ?? 'reta',
    };
  };
  const base = (el: Element, prefixo: string, i: number) => ({
    id: el.getAttribute('id') ?? `${prefixo}-${i + 1}`,
    nome: el.getAttribute('data-nome') ?? el.getAttribute('id') ?? `${prefixo} ${i + 1}`,
  });

  let fundo = anterior.fundo;
  const ler = (el: Element, i: number): Objeto | null => {
    switch (el.tagName) {
      case 'rect': {
        if (el.getAttribute('id') === 'fundo') { fundo = cor(el, 'fill') ?? fundo; return null; }
        return {
          ...base(el, 'retangulo', i), tipo: 'retangulo',
          x: numero(el, 'x'), y: numero(el, 'y'), largura: numero(el, 'width'), altura: numero(el, 'height'),
          preenchimento: cor(el, 'fill') ?? '#000000', traco: traco(el),
        };
      }
      case 'ellipse': case 'circle': {
        const [rx, ry] = el.tagName === 'circle' ? [numero(el, 'r'), numero(el, 'r')] : [numero(el, 'rx'), numero(el, 'ry')];
        return {
          ...base(el, 'elipse', i), tipo: 'elipse',
          x: numero(el, 'cx') - rx, y: numero(el, 'cy') - ry, largura: 2 * rx, altura: 2 * ry,
          preenchimento: cor(el, 'fill') ?? '#000000', traco: traco(el),
        };
      }
      case 'path': {
        const contornos = contornosDoD(el.getAttribute('d') ?? '');
        if (!contornos) {
          throw new ErroDeLeitura(`O d de "${el.getAttribute('id') ?? 'path'}" tem um comando que este editor não entende.`);
        }
        return comCaixaRefeita({
          ...base(el, 'caminho', i), tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0,
          contornos, preenchimento: cor(el, 'fill'), traco: traco(el),
        });
      }
      case 'text': {
        const familia = (LISTA_DE_FAMILIAS.find(f => f === el.getAttribute('font-family')) ?? 'Arial') as Familia;
        const corpo = numero(el, 'font-size');
        const entrelinha = el.hasAttribute('data-entrelinha') ? numero(el, 'data-entrelinha') : 1.4;
        const largura = el.hasAttribute('data-largura') ? numero(el, 'data-largura') : 400;
        const ancora = el.getAttribute('text-anchor');
        const alinhamento = ancora === 'end' ? 'direita' : ancora === 'middle' ? 'centro' : 'esquerda';
        const linhas = [...el.getElementsByTagName('tspan')].map(t => t.textContent ?? '');
        const ax = numero(el, 'x');
        const t: Texto = {
          ...base(el, 'texto', i), tipo: 'texto',
          texto: linhas.length ? linhas.join(' ') : el.textContent?.trim() ?? '',
          familia, peso: el.getAttribute('font-weight') === '700' ? 700 : 400, corpo, entrelinha,
          cor: cor(el, 'fill') ?? '#000000', alinhamento, largura,
          x: alinhamento === 'esquerda' ? ax : alinhamento === 'direita' ? ax - largura : ax - largura / 2,
          y: 0,
        };
        return { ...t, y: numero(el, 'y') - baseDaPrimeira(t) };
      }
      case 'g': {
        const filhos = [...el.children].map(ler).filter((o): o is Objeto => !!o);
        if (filhos.length === 0) return null;
        return comCaixaRefeita({ ...base(el, 'grupo', i), tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0, filhos });
      }
      default:
        return null;
    }
  };

  try {
    const objetos = [...raiz.children].map(ler).filter((o): o is Objeto => !!o);
    const referencias = anterior.objetos.filter(o => o.tipo === 'referencia');
    return {
      prancha: {
        ...anterior,
        largura: raiz.hasAttribute('width') ? numero(raiz, 'width') : anterior.largura,
        altura: raiz.hasAttribute('height') ? numero(raiz, 'height') : anterior.altura,
        fundo,
        objetos: [...referencias, ...objetos],
      },
    };
  } catch (e) {
    if (e instanceof ErroDeLeitura) return { erro: e.message };
    throw e;
  }
}
