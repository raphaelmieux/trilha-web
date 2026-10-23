/*
 * A imagem de pontos da CC-DG003, como conta.
 *
 * ── Por que um motor próprio, e não o canvas ─────────────────────────────
 * O canvas do navegador recorta, gira e exporta JPG sozinho, e a primeira
 * tentação é usá-lo. Mas as metas desta vereda medem pixel — o horizonte
 * nivelado, a placa branca que voltou a ser branca, a garrafa que sumiu sem
 * deixar um remendo chapado, o arquivo que encolheu sessenta por cento sem
 * perda que se perceba — e o jsdom não tem canvas: uma meta escrita sobre ele
 * não teria trava nenhuma. E o JPG do canvas é uma caixa preta: a lição que
 * manda **explicar** a compressão com perda precisa de uma compressão cujo
 * custo dê para mostrar.
 *
 * Então cada operação é uma função pura sobre um `Uint8ClampedArray`, e a tela
 * só pinta o resultado.
 *
 * ── O mapa da cena ───────────────────────────────────────────────────────
 * A foto é gerada a partir de uma cena descrita em coordenadas próprias, e
 * cada imagem carrega `mapa`: a transformação que leva um ponto da cena ao
 * pixel da imagem. Recortar, girar e redimensionar atualizam o mapa junto com
 * os pontos — é o mesmo cálculo, dos dois lados —, e é por ele que uma meta
 * acha a placa depois de alguém ter recortado a foto do jeito dele. Não é
 * informação que a tela mostre: é a mesma ideia do EXIF, que viaja com a foto
 * sem ser a foto.
 */

/* ── O modelo ────────────────────────────────────────────────────────────── */

/** Afim da cena para a imagem: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export interface Mapa { a: number; b: number; c: number; d: number; e: number; f: number }

export interface Imagem {
  largura: number;
  altura: number;
  /** RGBA, linha a linha. */
  px: Uint8ClampedArray;
  /** Pontos por polegada: não muda nenhum pixel, só o tamanho no papel. */
  ppi: number;
  mapa: Mapa;
}

export const MAPA_IDENTIDADE: Mapa = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export function novaImagem(largura: number, altura: number, ppi = 72, cor: [number, number, number, number] = [0, 0, 0, 0]): Imagem {
  const px = new Uint8ClampedArray(largura * altura * 4);
  if (cor.some(v => v !== 0)) {
    for (let i = 0; i < px.length; i += 4) { px[i] = cor[0]; px[i + 1] = cor[1]; px[i + 2] = cor[2]; px[i + 3] = cor[3]; }
  }
  return { largura, altura, px, ppi, mapa: MAPA_IDENTIDADE };
}

export const copiar = (img: Imagem): Imagem => ({ ...img, px: new Uint8ClampedArray(img.px) });

export function pixel(img: Imagem, x: number, y: number): [number, number, number, number] {
  const xi = Math.min(img.largura - 1, Math.max(0, Math.round(x)));
  const yi = Math.min(img.altura - 1, Math.max(0, Math.round(y)));
  const i = (yi * img.largura + xi) * 4;
  return [img.px[i], img.px[i + 1], img.px[i + 2], img.px[i + 3]];
}

/* ── O mapa ──────────────────────────────────────────────────────────────── */

/** Compõe: primeiro `m`, depois `n`. */
export const compor = (n: Mapa, m: Mapa): Mapa => ({
  a: n.a * m.a + n.c * m.b,
  b: n.b * m.a + n.d * m.b,
  c: n.a * m.c + n.c * m.d,
  d: n.b * m.c + n.d * m.d,
  e: n.a * m.e + n.c * m.f + n.e,
  f: n.b * m.e + n.d * m.f + n.f,
});

export const aplicarMapa = (m: Mapa, x: number, y: number): [number, number] =>
  [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];

/** Quanto a horizontal da cena está inclinada na imagem, em graus. */
export const inclinacao = (img: Imagem) => (Math.atan2(img.mapa.b, img.mapa.a) * 180) / Math.PI;

/** A caixa, na imagem, de um retângulo da cena. */
export function caixaNaImagem(img: Imagem, r: Retangulo): Retangulo {
  const cantos = [[r.x, r.y], [r.x + r.l, r.y], [r.x, r.y + r.a], [r.x + r.l, r.y + r.a]]
    .map(([x, y]) => aplicarMapa(img.mapa, x, y));
  const xs = cantos.map(c => c[0]); const ys = cantos.map(c => c[1]);
  const x = Math.min(...xs); const y = Math.min(...ys);
  return { x, y, l: Math.max(...xs) - x, a: Math.max(...ys) - y };
}

export interface Retangulo { x: number; y: number; l: number; a: number }

/* ── Luz: sRGB e linear ──────────────────────────────────────────────────── */

const PARA_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  PARA_LINEAR[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
export const linear = (v: number) => PARA_LINEAR[v];
export function paraSrgb(l: number): number {
  const c = l <= 0 ? 0 : l >= 1 ? 1 : l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
  return Math.round(c * 255);
}

/** Luminância percebida de 0 a 1, pelo peso de cada canal. */
export const luminancia = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

/* ── O acaso, repetível ──────────────────────────────────────────────────── */

export function sorteador(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruído de valor suave em grade: a textura da grama e da madeira. */
export function ruido(semente: number, passo: number) {
  const tamanho = 64;
  const r = sorteador(semente);
  const grade = new Float32Array(tamanho * tamanho).map(() => r());
  const em = (i: number, j: number) => grade[((j % tamanho + tamanho) % tamanho) * tamanho + ((i % tamanho + tamanho) % tamanho)];
  return (x: number, y: number) => {
    const gx = x / passo; const gy = y / passo;
    const i = Math.floor(gx); const j = Math.floor(gy);
    const fx = gx - i; const fy = gy - j;
    const sx = fx * fx * (3 - 2 * fx); const sy = fy * fy * (3 - 2 * fy);
    const top = em(i, j) * (1 - sx) + em(i + 1, j) * sx;
    const bot = em(i, j + 1) * (1 - sx) + em(i + 1, j + 1) * sx;
    return top * (1 - sy) + bot * sy;
  };
}

/* ── Amostrar ────────────────────────────────────────────────────────────── */

/** Bilinear, com fora da imagem transparente. Escreve em `saida[o..o+3]`. */
function amostrar(img: Imagem, x: number, y: number, saida: Uint8ClampedArray, o: number) {
  const x0 = Math.floor(x); const y0 = Math.floor(y);
  const fx = x - x0; const fy = y - y0;
  let r = 0; let g = 0; let b = 0; let a = 0;
  const w = img.largura; const h = img.altura; const p = img.px;
  for (let k = 0; k < 4; k++) {
    const xi = x0 + (k & 1); const yi = y0 + (k >> 1);
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) continue;
    const peso = ((k & 1) ? fx : 1 - fx) * ((k >> 1) ? fy : 1 - fy);
    const i = (yi * w + xi) * 4;
    const pa = p[i + 3] * peso;
    r += p[i] * pa; g += p[i + 1] * pa; b += p[i + 2] * pa; a += pa;
  }
  if (a <= 0) { saida[o] = 0; saida[o + 1] = 0; saida[o + 2] = 0; saida[o + 3] = 0; return; }
  saida[o] = r / a; saida[o + 1] = g / a; saida[o + 2] = b / a; saida[o + 3] = a;
}

/* ── Geometria: girar, recortar, redimensionar ───────────────────────────── */

/**
 * Gira em volta do centro, mantendo o tamanho. O que entra pelos cantos é
 * transparente — e é por isso que nivelar pede recortar depois: girar sem
 * recortar deixa quatro triângulos vazios, que no JPG viram quatro triângulos
 * brancos.
 */
export function girar(img: Imagem, graus: number): Imagem {
  if (graus === 0) return copiar(img);
  const t = (graus * Math.PI) / 180;
  const cos = Math.cos(t); const sin = Math.sin(t);
  const cx = img.largura / 2; const cy = img.altura / 2;
  const saida = new Uint8ClampedArray(img.px.length);
  for (let y = 0; y < img.altura; y++) {
    for (let x = 0; x < img.largura; x++) {
      // De onde vem este pixel: a rotação inversa.
      const dx = x + 0.5 - cx; const dy = y + 0.5 - cy;
      const sx = cos * dx + sin * dy + cx - 0.5;
      const sy = -sin * dx + cos * dy + cy - 0.5;
      amostrar(img, sx, sy, saida, (y * img.largura + x) * 4);
    }
  }
  const rot: Mapa = {
    a: cos, b: sin, c: -sin, d: cos,
    e: cx - cos * cx + sin * cy, f: cy - sin * cx - cos * cy,
  };
  return { ...img, px: saida, mapa: compor(rot, img.mapa) };
}

export function recortar(img: Imagem, r: Retangulo): Imagem {
  const x0 = Math.max(0, Math.round(r.x)); const y0 = Math.max(0, Math.round(r.y));
  const l = Math.max(1, Math.min(img.largura - x0, Math.round(r.l)));
  const a = Math.max(1, Math.min(img.altura - y0, Math.round(r.a)));
  const px = new Uint8ClampedArray(l * a * 4);
  for (let y = 0; y < a; y++) {
    const de = ((y0 + y) * img.largura + x0) * 4;
    px.set(img.px.subarray(de, de + l * 4), y * l * 4);
  }
  return { ...img, largura: l, altura: a, px, mapa: compor({ ...MAPA_IDENTIDADE, e: -x0, f: -y0 }, img.mapa) };
}

/**
 * Reamostrar para outro número de pixels. Diminuir faz média de cada área,
 * que é o que impede o serrilhado; aumentar interpola entre vizinhos, e é
 * aqui que a foto ampliada fica borrada: o pixel do meio é inventado pela
 * conta, e não visto pela câmera.
 */
export function redimensionar(img: Imagem, largura: number, altura: number): Imagem {
  const l = Math.max(1, Math.round(largura)); const a = Math.max(1, Math.round(altura));
  const px = new Uint8ClampedArray(l * a * 4);
  const ex = img.largura / l; const ey = img.altura / a;
  if (ex >= 1 && ey >= 1) {
    for (let y = 0; y < a; y++) {
      const ya = y * ey; const yb = Math.min(img.altura, (y + 1) * ey);
      for (let x = 0; x < l; x++) {
        const xa = x * ex; const xb = Math.min(img.largura, (x + 1) * ex);
        let r = 0; let g = 0; let b = 0; let al = 0; let n = 0;
        for (let yy = Math.floor(ya); yy < Math.ceil(yb); yy++) {
          for (let xx = Math.floor(xa); xx < Math.ceil(xb); xx++) {
            const i = (yy * img.largura + xx) * 4; const pa = img.px[i + 3];
            r += img.px[i] * pa; g += img.px[i + 1] * pa; b += img.px[i + 2] * pa; al += pa; n++;
          }
        }
        const o = (y * l + x) * 4;
        if (al > 0) { px[o] = r / al; px[o + 1] = g / al; px[o + 2] = b / al; }
        px[o + 3] = al / n;
      }
    }
  } else {
    for (let y = 0; y < a; y++) {
      for (let x = 0; x < l; x++) {
        amostrar(img, Math.min(img.largura - 1, (x + 0.5) * ex - 0.5), Math.min(img.altura - 1, (y + 0.5) * ey - 0.5), px, (y * l + x) * 4);
      }
    }
  }
  return { ...img, largura: l, altura: a, px, mapa: compor({ ...MAPA_IDENTIDADE, a: 1 / ex, d: 1 / ey }, img.mapa) };
}

/** Tamanho no papel, em centímetros, para os pixels e o ppi que a imagem tem. */
export const tamanhoImpresso = (img: Pick<Imagem, 'largura' | 'altura' | 'ppi'>) =>
  ({ l: (img.largura / img.ppi) * 2.54, a: (img.altura / img.ppi) * 2.54 });

/* ── Tom e cor ───────────────────────────────────────────────────────────── */

export interface Ajuste {
  /** Em pontos de exposição: +1 dobra a luz. */
  exposicao: number;
  /** De -100 a 100: afasta ou aproxima os tons do meio. */
  contraste: number;
  /** De -100 a 100: positivo esquenta (mais vermelho, menos azul). */
  temperatura: number;
}

export const AJUSTE_NEUTRO: Ajuste = { exposicao: 0, contraste: 0, temperatura: 0 };

/**
 * Exposição e temperatura multiplicam a luz em espaço linear, que é como a
 * câmera as faria; o contraste puxa os tons do meio em sRGB, que é como os
 * programas o fazem. Tudo vira três tabelas de 256 entradas.
 */
export function tabelasDoAjuste(aj: Ajuste): [Uint8ClampedArray, Uint8ClampedArray, Uint8ClampedArray] {
  const luz = 2 ** aj.exposicao;
  const quente = 2 ** ((aj.temperatura / 100) * 0.35);
  const k = 1 + aj.contraste / 100;
  const ganhos = [luz * quente, luz, luz / quente];
  return ganhos.map(gn => {
    const t = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
      const s = paraSrgb(linear(v) * gn) / 255;
      t[v] = Math.round((0.5 + (s - 0.5) * k) * 255);
    }
    return t;
  }) as [Uint8ClampedArray, Uint8ClampedArray, Uint8ClampedArray];
}

export function ajustar(img: Imagem, aj: Ajuste): Imagem {
  const [tr, tg, tb] = tabelasDoAjuste(aj);
  const px = new Uint8ClampedArray(img.px.length);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = tr[img.px[i]]; px[i + 1] = tg[img.px[i + 1]]; px[i + 2] = tb[img.px[i + 2]]; px[i + 3] = img.px[i + 3];
  }
  return { ...img, px };
}

/* ── Pincéis: carimbo e pintura ──────────────────────────────────────────── */

/** Peso do pincel macio: inteiro no miolo, descendo até zero na borda. */
const pesoDoPincel = (d: number, raio: number) => {
  if (d >= raio) return 0;
  const miolo = raio * 0.6;
  if (d <= miolo) return 1;
  const t = (d - miolo) / (raio - miolo);
  return 1 - t * t * (3 - 2 * t);
};

/**
 * O carimbo copia pixels de outro lugar da mesma foto. É assim que se apaga
 * uma garrafa da grama: a grama que fica ao lado tem textura, e a textura
 * copiada esconde o buraco. `origem` é o deslocamento até de onde se copia.
 */
export function carimbar(img: Imagem, centro: { x: number; y: number }, origem: { dx: number; dy: number }, raio: number): Imagem {
  const px = new Uint8ClampedArray(img.px);
  const x0 = Math.max(0, Math.floor(centro.x - raio)); const x1 = Math.min(img.largura - 1, Math.ceil(centro.x + raio));
  const y0 = Math.max(0, Math.floor(centro.y - raio)); const y1 = Math.min(img.altura - 1, Math.ceil(centro.y + raio));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = pesoDoPincel(Math.hypot(x - centro.x, y - centro.y), raio);
      if (p <= 0) continue;
      const sx = x + origem.dx; const sy = y + origem.dy;
      if (sx < 0 || sy < 0 || sx >= img.largura || sy >= img.altura) continue;
      const i = (y * img.largura + x) * 4; const j = (Math.round(sy) * img.largura + Math.round(sx)) * 4;
      for (let c = 0; c < 4; c++) px[i + c] = img.px[i + c] * (1 - p) + img.px[j + c] * p;
    }
  }
  return { ...img, px };
}

/** Pintar com uma cor só. Tampa, mas deixa o remendo chapado no meio da textura. */
export function pintar(img: Imagem, centro: { x: number; y: number }, cor: [number, number, number], raio: number): Imagem {
  const px = new Uint8ClampedArray(img.px);
  const x0 = Math.max(0, Math.floor(centro.x - raio)); const x1 = Math.min(img.largura - 1, Math.ceil(centro.x + raio));
  const y0 = Math.max(0, Math.floor(centro.y - raio)); const y1 = Math.min(img.altura - 1, Math.ceil(centro.y + raio));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = pesoDoPincel(Math.hypot(x - centro.x, y - centro.y), raio);
      if (p <= 0) continue;
      const i = (y * img.largura + x) * 4;
      for (let c = 0; c < 3; c++) px[i + c] = img.px[i + c] * (1 - p) + cor[c] * p;
      px[i + 3] = Math.max(img.px[i + 3], 255 * p);
    }
  }
  return { ...img, px };
}

/* ── Seleção e transparência ─────────────────────────────────────────────── */

/** 0 a 255 por pixel: quanto o pixel está dentro. */
export interface Mascara { largura: number; altura: number; v: Uint8ClampedArray }

export const mascaraCheia = (largura: number, altura: number, valor = 255): Mascara =>
  ({ largura, altura, v: new Uint8ClampedArray(largura * altura).fill(valor) });

const distanciaDeCor = (p: Uint8ClampedArray, i: number, r: number, g: number, b: number) =>
  Math.max(Math.abs(p[i] - r), Math.abs(p[i + 1] - g), Math.abs(p[i + 2] - b));

/**
 * A varinha: escolhe os pixels parecidos com o clicado, até `tolerancia` de
 * distância em qualquer canal. Contígua só alcança os que encostam um no outro
 * — é ela que separa o fundo da mesa do vermelho do lenço, mesmo que um canto
 * da madeira tenha o mesmo tom de um pedaço do bordado.
 */
export function selecionarPorCor(img: Imagem, x: number, y: number, tolerancia: number, contigua = true): Mascara {
  const m = mascaraCheia(img.largura, img.altura, 0);
  const xi = Math.round(x); const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= img.largura || yi >= img.altura) return m;
  const i0 = (yi * img.largura + xi) * 4;
  const [r, g, b] = [img.px[i0], img.px[i0 + 1], img.px[i0 + 2]];
  if (!contigua) {
    for (let k = 0; k < img.largura * img.altura; k++) if (distanciaDeCor(img.px, k * 4, r, g, b) <= tolerancia) m.v[k] = 255;
    return m;
  }
  const pilha = [yi * img.largura + xi];
  m.v[pilha[0]] = 255;
  while (pilha.length) {
    const k = pilha.pop()!;
    const kx = k % img.largura; const ky = (k - kx) / img.largura;
    const viz = [kx > 0 ? k - 1 : -1, kx < img.largura - 1 ? k + 1 : -1, ky > 0 ? k - img.largura : -1, ky < img.altura - 1 ? k + img.largura : -1];
    for (const n of viz) {
      if (n < 0 || m.v[n]) continue;
      if (distanciaDeCor(img.px, n * 4, r, g, b) <= tolerancia) { m.v[n] = 255; pilha.push(n); }
    }
  }
  return m;
}

export const somarMascaras = (a: Mascara, b: Mascara): Mascara =>
  ({ ...a, v: a.v.map((x, i) => Math.max(x, b.v[i])) });

export const inverterMascara = (m: Mascara): Mascara => ({ ...m, v: m.v.map(x => 255 - x) });

/** Excluir o que está selecionado: vira transparente, e não branco. */
export function apagarSelecao(img: Imagem, m: Mascara): Imagem {
  const px = new Uint8ClampedArray(img.px);
  for (let k = 0; k < m.v.length; k++) px[k * 4 + 3] = (px[k * 4 + 3] * (255 - m.v[k])) / 255;
  return { ...img, px };
}

/* ── Camadas ─────────────────────────────────────────────────────────────── */

export interface Camada {
  id: string;
  nome: string;
  imagem: Imagem;
  /** Branco mostra, preto esconde. Sem máscara, a camada aparece inteira. */
  mascara: Mascara | null;
  opacidade: number;
  visivel: boolean;
}

/** Empilha de baixo para cima, como a lista de camadas mostra de cima para baixo. */
export function achatar(camadas: Camada[]): Imagem {
  const base = camadas[0].imagem;
  const out = new Float32Array(base.largura * base.altura * 4);
  for (const c of camadas) {
    if (!c.visivel || c.opacidade <= 0) continue;
    const p = c.imagem.px;
    for (let k = 0; k < base.largura * base.altura; k++) {
      const i = k * 4;
      const a = (p[i + 3] / 255) * c.opacidade * (c.mascara ? c.mascara.v[k] / 255 : 1);
      if (a <= 0) continue;
      const ab = out[i + 3];
      const ao = a + ab * (1 - a);
      for (let ch = 0; ch < 3; ch++) out[i + ch] = (p[i + ch] * a + out[i + ch] * ab * (1 - a)) / ao;
      out[i + 3] = ao;
    }
  }
  const px = new Uint8ClampedArray(out.length);
  for (let i = 0; i < out.length; i += 4) {
    px[i] = out[i]; px[i + 1] = out[i + 1]; px[i + 2] = out[i + 2]; px[i + 3] = Math.round(out[i + 3] * 255);
  }
  return { ...base, px };
}

/* ── Medidas ─────────────────────────────────────────────────────────────── */

/** Média e desvio da luminância de uma região, contando só o que não é transparente. */
export function tonsDe(img: Imagem, r?: Retangulo) {
  const x0 = Math.max(0, Math.floor(r?.x ?? 0)); const y0 = Math.max(0, Math.floor(r?.y ?? 0));
  const x1 = Math.min(img.largura, Math.ceil(r ? r.x + r.l : img.largura));
  const y1 = Math.min(img.altura, Math.ceil(r ? r.y + r.a : img.altura));
  let s = 0; let s2 = 0; let n = 0; let rr = 0; let gg = 0; let bb = 0; let estouro = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.largura + x) * 4;
      if (img.px[i + 3] < 128) continue;
      const l = luminancia(img.px[i], img.px[i + 1], img.px[i + 2]);
      s += l; s2 += l * l; n++;
      rr += img.px[i]; gg += img.px[i + 1]; bb += img.px[i + 2];
      if (img.px[i] >= 254 || img.px[i + 1] >= 254 || img.px[i + 2] >= 254) estouro++;
    }
  }
  if (n === 0) return { media: 0, desvio: 0, r: 0, g: 0, b: 0, estourados: 0, n: 0 };
  const media = s / n;
  return {
    media, desvio: Math.sqrt(Math.max(0, s2 / n - media * media)),
    r: rr / n, g: gg / n, b: bb / n, estourados: estouro / n, n,
  };
}

/** Quantos pixels não são opacos: os cantos que sobraram de girar sem recortar. */
export function fracaoTransparente(img: Imagem): number {
  let n = 0;
  for (let i = 3; i < img.px.length; i += 4) if (img.px[i] < 250) n++;
  return n / (img.largura * img.altura);
}

/**
 * Semelhança estrutural da luminância, de 0 a 1, em janelas de 8. É a medida
 * de "perda que se percebe": ela olha a textura e as bordas de cada janela, e
 * não só a diferença de cor de cada pixel — duas fotos com a mesma média de
 * erro podem ter uma perda visível e outra não.
 */
export function semelhanca(a: Imagem, b: Imagem): number {
  if (a.largura !== b.largura || a.altura !== b.altura) throw new Error('As duas imagens precisam ter o mesmo tamanho.');
  const C1 = (0.01 * 255) ** 2; const C2 = (0.03 * 255) ** 2;
  const lum = (img: Imagem) => {
    const y = new Float32Array(img.largura * img.altura);
    for (let k = 0; k < y.length; k++) {
      const i = k * 4; const al = img.px[i + 3] / 255;
      y[k] = (0.2126 * img.px[i] + 0.7152 * img.px[i + 1] + 0.0722 * img.px[i + 2]) * al + 255 * (1 - al);
    }
    return y;
  };
  const ya = lum(a); const yb = lum(b);
  let soma = 0; let janelas = 0;
  for (let by = 0; by + 8 <= a.altura; by += 8) {
    for (let bx = 0; bx + 8 <= a.largura; bx += 8) {
      let ma = 0; let mb = 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const k = (by + y) * a.largura + bx + x; ma += ya[k]; mb += yb[k]; }
      ma /= 64; mb /= 64;
      let va = 0; let vb = 0; let cov = 0;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const k = (by + y) * a.largura + bx + x;
          const da = ya[k] - ma; const db = yb[k] - mb;
          va += da * da; vb += db * db; cov += da * db;
        }
      }
      va /= 63; vb /= 63; cov /= 63;
      soma += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      janelas++;
    }
  }
  return janelas ? soma / janelas : 1;
}

/* ── O documento: camadas, seleção e as operações que mexem em todas ────── */

/**
 * O que o editor tem aberto. Recortar, girar e redimensionar valem para a
 * imagem inteira — todas as camadas e todas as máscaras juntas —, senão a
 * máscara que escondia o céu passaria a esconder meio céu e meia serra
 * depois de um recorte, sem nada avisar.
 */
export interface Documento {
  nome: string;
  camadas: Camada[];
  /** A camada em que os pincéis e os ajustes agem. */
  ativa: string;
  /** O que a varinha escolheu; `null` é nada escolhido. */
  selecao: Mascara | null;
  /** Ajustes e pincéis agem na máscara da camada ativa, e não nos pontos dela. */
  naMascara: boolean;
}

export const documentoDe = (nome: string, img: Imagem): Documento => ({
  nome, camadas: [{ id: 'fundo', nome: 'Fundo', imagem: img, mascara: null, opacidade: 1, visivel: true }],
  ativa: 'fundo', selecao: null, naMascara: false,
});

export const camadaAtiva = (d: Documento) => d.camadas.find(c => c.id === d.ativa) ?? d.camadas[0];
export const imagemDo = (d: Documento) => achatar(d.camadas);
export const tamanhoDo = (d: Documento) => ({ largura: d.camadas[0].imagem.largura, altura: d.camadas[0].imagem.altura });

/** Máscara vira imagem cinza para passar pelas mesmas contas de geometria. */
const mascaraComoImagem = (m: Mascara, base: Imagem): Imagem => {
  const px = new Uint8ClampedArray(m.v.length * 4);
  for (let k = 0; k < m.v.length; k++) { px[k * 4] = m.v[k]; px[k * 4 + 1] = m.v[k]; px[k * 4 + 2] = m.v[k]; px[k * 4 + 3] = 255; }
  return { ...base, px };
};
const imagemComoMascara = (img: Imagem): Mascara => {
  const v = new Uint8ClampedArray(img.largura * img.altura);
  for (let k = 0; k < v.length; k++) v[k] = img.px[k * 4 + 3] < 128 ? 0 : img.px[k * 4];
  return { largura: img.largura, altura: img.altura, v };
};

function emTodas(d: Documento, f: (img: Imagem) => Imagem): Documento {
  const camadas = d.camadas.map(c => ({
    ...c,
    imagem: f(c.imagem),
    mascara: c.mascara ? imagemComoMascara(f(mascaraComoImagem(c.mascara, c.imagem))) : null,
  }));
  return { ...d, camadas, selecao: null };
}

export const girarDocumento = (d: Documento, graus: number) => emTodas(d, img => girar(img, graus));
export const recortarDocumento = (d: Documento, r: Retangulo) => emTodas(d, img => recortar(img, r));
export const redimensionarDocumento = (d: Documento, largura: number, altura: number) =>
  emTodas(d, img => redimensionar(img, largura, altura));
/** Mudar o ppi sem reamostrar: nenhum pixel muda, só o tamanho no papel. */
export const comPpi = (d: Documento, ppi: number): Documento =>
  ({ ...d, camadas: d.camadas.map(c => ({ ...c, imagem: { ...c.imagem, ppi } })) });

export function naCamadaAtiva(d: Documento, f: (img: Imagem) => Imagem): Documento {
  return { ...d, camadas: d.camadas.map(c => (c.id === d.ativa ? { ...c, imagem: f(c.imagem) } : c)) };
}

export function duplicarCamada(d: Documento, id: string): Documento {
  const c = camadaAtiva(d);
  const nova: Camada = { ...c, id, nome: `${c.nome} (cópia)`, imagem: copiar(c.imagem), mascara: c.mascara && { ...c.mascara, v: new Uint8ClampedArray(c.mascara.v) } };
  const i = d.camadas.findIndex(x => x.id === c.id);
  return { ...d, camadas: [...d.camadas.slice(0, i + 1), nova, ...d.camadas.slice(i + 1)], ativa: id };
}

/**
 * A máscara nasce da seleção, se houver uma — é como todo editor faz —, e
 * branca, se não houver: mostrando a camada inteira, que é o que ela já
 * mostrava antes de ganhar máscara.
 */
export function adicionarMascara(d: Documento): Documento {
  const c = camadaAtiva(d);
  if (c.mascara) return d;
  const { largura, altura } = c.imagem;
  const mascara = d.selecao ? { ...d.selecao, v: new Uint8ClampedArray(d.selecao.v) } : mascaraCheia(largura, altura);
  return {
    ...d, selecao: null, naMascara: true,
    camadas: d.camadas.map(x => (x.id === c.id ? { ...x, mascara } : x)),
  };
}

/** Pintar a máscara: branco mostra, preto esconde. */
export function pintarMascara(d: Documento, centro: { x: number; y: number }, valor: 0 | 255, raio: number): Documento {
  const c = camadaAtiva(d);
  if (!c.mascara) return d;
  const v = new Uint8ClampedArray(c.mascara.v);
  const { largura, altura } = c.mascara;
  for (let y = Math.max(0, Math.floor(centro.y - raio)); y <= Math.min(altura - 1, Math.ceil(centro.y + raio)); y++) {
    for (let x = Math.max(0, Math.floor(centro.x - raio)); x <= Math.min(largura - 1, Math.ceil(centro.x + raio)); x++) {
      const p = pesoDoPincel(Math.hypot(x - centro.x, y - centro.y), raio);
      if (p > 0) v[y * largura + x] = v[y * largura + x] * (1 - p) + valor * p;
    }
  }
  return { ...d, camadas: d.camadas.map(x => (x.id === c.id ? { ...x, mascara: { ...c.mascara!, v } } : x)) };
}

/** Juntar tudo numa camada só: o que se vê vira o que se tem. */
export const achatarDocumento = (d: Documento): Documento => ({ ...documentoDe(d.nome, imagemDo(d)) });
