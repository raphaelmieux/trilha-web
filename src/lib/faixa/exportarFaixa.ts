import { CSS_DA_FAIXA } from '../../components/faixa/cssDaFaixa';
import { MARCAS, PARENTESES, VERMELHO_DA_MARCA } from '../marca';
import type { FaixaEmpacotada, PecaPosta } from './empacotarFaixa';

/*
  A Faixa em PDF, para guardar, mostrar e imprimir.

  ── O desenho é o da tela, e não um segundo ──────────────────────────────
  A Faixa é desenhada em DOM e CSS: o patch é a arte numa máscara, com os
  fios em `mix-blend-mode` por cima e sombra em `drop-shadow`. Redesenhá-la
  num canvas seria escrever cada material duas vezes, e as duas cópias
  divergiriam no primeiro ajuste — a imagem baixada mostraria uma Faixa que
  a tela não mostra. O html2canvas, que viria de graça com o jsPDF, também
  não serve: ele não entende máscara nem mistura, e o patch sairia um
  retângulo.

  Então o PNG sai da própria marcação: o pano é copiado para dentro de um
  `foreignObject` de SVG, com a folha da Faixa (`CSS_DA_FAIXA`) e cada arte
  embutida como `data:`, e o navegador o pinta num canvas do jeito que pinta
  a página. Embutir não é opcional: uma imagem SVG não busca nada fora dela,
  e uma arte que ficasse como endereço sairia em branco.

  ── Dobrada em fileiras ──────────────────────────────────────────────────
  A Faixa inteira tem vinte e cinco vezes a altura em largura. Uma imagem
  assim não cabe em tela nenhuma e, no celular, vira uma linha verde. Ela sai
  dobrada em fileiras, como se guarda uma faixa de verdade, e nenhuma peça é
  partida na dobra: um patch cortado ao meio sairia metade no fim de uma
  fileira e metade no começo da outra.
*/

/** Quantas fileiras: 13 mil por 520 vira cerca de 3 200 por 2 100. */
export const FILEIRAS = 4;

/** A folga em volta de cada peça, para a sombra não sair cortada na beira da fileira. */
const FOLGA_DA_DOBRA = 10;

/** O trecho horizontal que uma peça ocupa, já girada. */
export function extensaoDaPeca(p: Pick<PecaPosta, 'x' | 'w' | 'h' | 'giro'>): [number, number] {
  const r = (p.giro * Math.PI) / 180;
  const meia = (Math.abs(p.w * Math.cos(r)) + Math.abs(p.h * Math.sin(r))) / 2;
  return [p.x - meia - FOLGA_DA_DOBRA, p.x + meia + FOLGA_DA_DOBRA];
}

export interface Fileira {
  /** A janela da fileira no pano. */
  de: number;
  ate: number;
  /** As peças que saem nela. */
  pecas: Set<string>;
}

/**
 * As fileiras da Faixa dobrada.
 *
 * A dobra não é uma linha reta: nas veredas os anéis se encaixam nos vãos dos
 * vizinhos, e não há reta que passe por ali sem partir alguém. Então cada
 * unidade — o patch com os satélites dele, a vereda com os laboratórios —
 * vai inteira para a fileira em que o centro dela cai, e cada fileira desenha
 * só as suas peças. A janela de uma fileira pode avançar sobre a da vizinha,
 * e o que é da vizinha ali simplesmente não está.
 */
export function fileirasDaFaixa(faixa: Pick<FaixaEmpacotada, 'pecas' | 'largura'>, quantas = FILEIRAS): Fileira[] {
  const porUnidade = new Map<string, PecaPosta[]>();
  for (const p of faixa.pecas) porUnidade.set(p.unidade, [...(porUnidade.get(p.unidade) ?? []), p]);
  const fileiras = Array.from({ length: quantas }, () => ({ de: Infinity, ate: -Infinity, pecas: new Set<string>() }));
  for (const pecas of porUnidade.values()) {
    const centro = pecas.reduce((s, p) => s + p.x, 0) / pecas.length;
    const k = Math.min(quantas - 1, Math.max(0, Math.floor((centro / faixa.largura) * quantas)));
    for (const p of pecas) {
      const [a, b] = extensaoDaPeca(p);
      fileiras[k].pecas.add(p.id);
      fileiras[k].de = Math.min(fileiras[k].de, a);
      fileiras[k].ate = Math.max(fileiras[k].ate, b);
    }
  }
  return fileiras.filter(f => f.pecas.size > 0).map((f, i, todas) => ({
    pecas: f.pecas,
    /* As pontas da Faixa ficam com a margem do pano, e não com a da peça. */
    de: i === 0 ? 0 : Math.max(0, Math.floor(f.de)),
    ate: i === todas.length - 1 ? faixa.largura : Math.min(faixa.largura, Math.ceil(f.ate)),
  }));
}

/** Os endereços de arte que a marcação cita, nas imagens e no `--src`. */
export function enderecosDaArte(pano: Element): string[] {
  const achados = new Set<string>();
  pano.querySelectorAll('img[src]').forEach(img => achados.add(img.getAttribute('src')!));
  pano.querySelectorAll('[style]').forEach(el => {
    for (const m of (el.getAttribute('style') ?? '').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) achados.add(m[1]);
  });
  return [...achados].filter(u => !u.startsWith('data:'));
}

/**
 * A marcação do pano, pronta para ir dentro de um SVG.
 *
 * O botão vira `div`: dentro de uma imagem nada se clica, e o botão traz o
 * estilo do navegador (borda, fundo cinza) que a folha da plataforma apaga e
 * a imagem não carrega. A escala da tela sai, porque a imagem tem a dela.
 */
export function marcacaoDoPano(pano: Element, arte: Map<string, string>, so?: Set<string>): string {
  const copia = pano.cloneNode(true) as HTMLElement;
  copia.style.transform = 'none';
  if (so) copia.querySelectorAll('[data-peca]').forEach(el => { if (!so.has(el.getAttribute('data-peca')!)) el.remove(); });
  copia.querySelectorAll('button').forEach(b => {
    const d = b.ownerDocument.createElement('div');
    d.className = b.className;
    d.setAttribute('style', b.getAttribute('style') ?? '');
    while (b.firstChild) d.appendChild(b.firstChild);
    b.replaceWith(d);
  });
  let xml = new XMLSerializer().serializeToString(copia);
  /* Do mais comprido para o mais curto, para um endereço que é começo de
     outro não ser trocado dentro dele. */
  for (const [url, dado] of [...arte].sort((a, b) => b[0].length - a[0].length)) xml = xml.split(url).join(dado);
  return xml;
}

/** O SVG de uma fileira: o pano inteiro, visto pela janela de `de` a `ate`. */
export function svgDaFileira(pano: string, fonte: string | null, largura: number, altura: number, de: number, ate: number): string {
  const css = `
${fonte ? `@font-face { font-family: 'Space Mono'; font-weight: 700; src: url(${fonte}) format('woff2'); }` : ''}
*, *::before, *::after { box-sizing: border-box; }
.fx { position: relative; display: block; width: ${largura}px; height: ${altura}px; font-family: system-ui, sans-serif; color: #fff; }
${CSS_DA_FAIXA}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ate - de}" height="${altura}" viewBox="${de} 0 ${ate - de} ${altura}">`
    + `<foreignObject x="0" y="0" width="${largura}" height="${altura}">`
    /* A folha vai em CDATA: o SVG é XML, e um `&` ou um `<` escrito um dia
       num seletor ou num comentário a quebraria — e a imagem sairia vazia. */
    + `<div xmlns="http://www.w3.org/1999/xhtml" class="fx"><style><![CDATA[${css.replace(/]]>/g, '')}]]></style>${pano}</div>`
    + '</foreignObject></svg>';
}

/** O nome no arquivo: sem acento, sem espaço, sem o que um sistema recusa. */
export function nomeDeArquivo(nome: string): string {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'desbravador';
}

/** Um arquivo como `data:`, ou nada se ele não vier — a peça sai sem arte, e não a Faixa inteira. */
async function comoDado(url: string): Promise<string | null> {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    const blob = await resposta.blob();
    return await new Promise<string>((ok, falha) => {
      const leitor = new FileReader();
      leitor.onload = () => ok(leitor.result as string);
      leitor.onerror = () => falha(leitor.error);
      leitor.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function carregar(svg: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  return img;
}

const ESPACO = 28;
const RODAPE = 120;
const FUNDO = '#0b1a11';

/*
  Por que PDF, e não PNG.

  O tecido é textura fina em toda a superfície, e textura é o que o PNG não
  comprime: a Faixa inteira, com nitidez para ler os códigos dos patches, deu
  quinze megabytes em PNG e quatro em JPEG da mesma qualidade visível — medido
  no Chromium. O PDF leva o JPEG, e a imagem dobrada tem quase a proporção de
  uma folha A4 deitada: sai pronta para imprimir, que é o que um clube faz com
  o que quer pendurar.
*/

/**
 * Pinta a Faixa dobrada num canvas.
 *
 * A escala é a maior que cabe em 15 milhões de pixels: o Safari recusa canvas
 * acima de 16,7 milhões calado, e devolve uma imagem vazia.
 */
export async function desenharFaixa(pano: HTMLElement, faixa: FaixaEmpacotada, legenda: { nome: string; contagem: string; data: string }): Promise<HTMLCanvasElement> {
  const base = import.meta.env.BASE_URL;
  const urls = enderecosDaArte(pano);
  const [fonte, ...dados] = await Promise.all([comoDado(`${base}assets/fonts/space-mono-700.woff2`), ...urls.map(comoDado)]);
  const arte = new Map(urls.flatMap((u, i) => (dados[i] ? [[u, dados[i]!] as [string, string]] : [])));
  const fileiras = fileirasDaFaixa(faixa);
  const larguraMaior = Math.max(...fileiras.map(f => f.ate - f.de));
  const largura = larguraMaior + ESPACO * 2;
  const altura = ESPACO + fileiras.length * (faixa.altura + ESPACO) + RODAPE;
  const escala = Math.min(2, Math.sqrt(15_000_000 / (largura * altura)));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(largura * escala);
  canvas.height = Math.round(altura * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Este navegador não deixou desenhar a imagem.');
  ctx.scale(escala, escala);

  const pintar = async () => {
    ctx.fillStyle = FUNDO;
    ctx.fillRect(0, 0, largura, altura);
    for (const [i, { de, ate, pecas }] of fileiras.entries()) {
      const img = await carregar(svgDaFileira(marcacaoDoPano(pano, arte, pecas), fonte, faixa.largura, faixa.altura, de, ate));
      ctx.drawImage(img, ESPACO, ESPACO + i * (faixa.altura + ESPACO), ate - de, faixa.altura);
    }
    desenharLegenda(ctx, legenda, ESPACO, altura - RODAPE / 2, largura - ESPACO);
  };
  await pintar();
  /* O Safari pinta a imagem de dentro do foreignObject só na segunda vez em
     que a decodifica; na primeira, as artes saem em branco. Pintar duas vezes
     custa um instante e não muda nada nos outros navegadores. */
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await pintar();

  return canvas;
}

/** A Faixa num PDF de uma folha A4 deitada, com o tecido até a beira. */
export async function pdfDaFaixa(pano: HTMLElement, faixa: FaixaEmpacotada, legenda: { nome: string; contagem: string; data: string }): Promise<Blob> {
  const canvas = await desenharFaixa(pano, faixa, legenda);
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const [lp, ap] = [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  doc.setFillColor(FUNDO);
  doc.rect(0, 0, lp, ap, 'F');
  const r = Math.min(lp / canvas.width, ap / canvas.height);
  const [w, h] = [canvas.width * r, canvas.height * r];
  doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', (lp - w) / 2, (ap - h) / 2, w, h);
  doc.setProperties({ title: legenda.nome, creator: MARCAS.plataforma.nome });
  return doc.output('blob');
}

/** O nome e a contagem à esquerda; a marca e a data à direita. */
function desenharLegenda(ctx: CanvasRenderingContext2D, l: { nome: string; contagem: string; data: string }, esquerda: number, meio: number, direita: number) {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 44px system-ui, sans-serif';
  ctx.fillText(l.nome, esquerda, meio - 18);
  ctx.fillStyle = 'rgba(236, 232, 214, .78)';
  ctx.font = '400 28px system-ui, sans-serif';
  ctx.fillText(l.contagem, esquerda, meio + 26);

  /* A marca com os parênteses no vermelho dela, como em toda parte. */
  const { miolo } = MARCAS.plataforma;
  ctx.font = "700 40px 'Space Mono', ui-monospace, monospace";
  const lp = ctx.measureText(PARENTESES).width;
  const lm = ctx.measureText(miolo).width;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(miolo, direita - lm - lp, meio - 18);
  ctx.fillStyle = `rgb(${VERMELHO_DA_MARCA.join(',')})`;
  ctx.fillText(PARENTESES, direita - lp, meio - 18);
  ctx.fillStyle = 'rgba(236, 232, 214, .78)';
  ctx.font = '400 28px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(l.data, direita, meio + 26);
}
