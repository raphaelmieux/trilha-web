import { type Imagem } from './raster';

/*
 * Os quatro formatos do requisito 2.5, como conta.
 *
 * ── O JPG é um JPG de verdade, em miniatura ─────────────────────────────
 * Blocos de 8 por 8, a transformada do cosseno, a tabela de quantização do
 * padrão escalada pela qualidade, e a cor guardada em metade da resolução
 * (4:2:0). O que ele joga fora é o que um JPG joga fora, e a foto que volta é
 * a que um JPG devolveria — com os blocos aparecendo quando a qualidade cai.
 * Só o tamanho é estimado, e não escrito byte a byte: a codificação de
 * Huffman é contada pelo comprimento médio de cada código, e não montada.
 *
 * ── O resto é premissa, e cada uma tem trava ────────────────────────────
 * O WEBP com perda é o mesmo corte, com a previsão melhor que o formato tem:
 * custa uma fração do JPG na mesma qualidade, e guarda transparência. O PNG
 * não perde nada, e o tamanho sai da entropia do que sobra depois do filtro
 * de Paeth — a mesma previsão que o PNG faz. O TIFF guarda os pontos como
 * estão.
 */

export type Formato = 'jpg' | 'png' | 'webp' | 'tiff';

export const NOME_DO_FORMATO: Record<Formato, string> = { jpg: 'JPG', png: 'PNG', webp: 'WEBP', tiff: 'TIFF' };

/** Quem perde, quem guarda transparência. */
export const COM_PERDA: Record<Formato, boolean> = { jpg: true, png: false, webp: true, tiff: false };
export const GUARDA_TRANSPARENCIA: Record<Formato, boolean> = { jpg: false, png: true, webp: true, tiff: true };

/** O que o WEBP custa perto do JPG na mesma qualidade. */
export const FRACAO_DO_WEBP = 0.7;

export interface ArquivoDeImagem {
  nome: string;
  formato: Formato;
  /** De 1 a 100, nos formatos com perda. */
  qualidade: number | null;
  bytes: number;
  /** A imagem como quem abrir o arquivo vai vê-la. */
  imagem: Imagem;
}

/* ── A transformada ──────────────────────────────────────────────────────── */

const COS = new Float64Array(64);
for (let u = 0; u < 8; u++) {
  for (let x = 0; x < 8; x++) {
    COS[u * 8 + x] = (u === 0 ? Math.SQRT1_2 : 1) * 0.5 * Math.cos(((2 * x + 1) * u * Math.PI) / 16);
  }
}

function dct(bloco: Float64Array, saida: Float64Array, tmp: Float64Array) {
  for (let y = 0; y < 8; y++) {
    for (let u = 0; u < 8; u++) {
      let s = 0;
      for (let x = 0; x < 8; x++) s += COS[u * 8 + x] * bloco[y * 8 + x];
      tmp[y * 8 + u] = s;
    }
  }
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let s = 0;
      for (let y = 0; y < 8; y++) s += COS[v * 8 + y] * tmp[y * 8 + u];
      saida[v * 8 + u] = s;
    }
  }
}

function idct(coef: Float64Array, saida: Float64Array, tmp: Float64Array) {
  for (let v = 0; v < 8; v++) {
    for (let x = 0; x < 8; x++) {
      let s = 0;
      for (let u = 0; u < 8; u++) s += COS[u * 8 + x] * coef[v * 8 + u];
      tmp[v * 8 + x] = s;
    }
  }
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let s = 0;
      for (let v = 0; v < 8; v++) s += COS[v * 8 + y] * tmp[v * 8 + x];
      saida[y * 8 + x] = s;
    }
  }
}

/* As tabelas do anexo K do padrão: o olho perdoa mais erro nas frequências
   altas, e mais na cor do que na luz. */
const Q_LUZ = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
const Q_COR = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

export function tabelaNaQualidade(base: number[], qualidade: number): Float64Array {
  const q = Math.min(100, Math.max(1, Math.round(qualidade)));
  const escala = q < 50 ? 5000 / q : 200 - 2 * q;
  return Float64Array.from(base, b => Math.min(255, Math.max(1, Math.floor((b * escala + 50) / 100))));
}

/** Bits de um coeficiente: o tamanho do número mais um código de Huffman médio. */
const categoria = (c: number) => (c === 0 ? 0 : 32 - Math.clz32(Math.abs(c)));

/**
 * Comprime e descomprime um plano: devolve os bits estimados e escreve de
 * volta o que quem abrir o arquivo vai ver.
 */
function plano(valores: Float32Array, largura: number, altura: number, q: Float64Array): number {
  const bloco = new Float64Array(64); const coef = new Float64Array(64);
  const tmp = new Float64Array(64); const volta = new Float64Array(64);
  let bits = 0; let dcAnterior = 0;
  for (let by = 0; by < altura; by += 8) {
    for (let bx = 0; bx < largura; bx += 8) {
      for (let y = 0; y < 8; y++) {
        const yy = Math.min(altura - 1, by + y);
        for (let x = 0; x < 8; x++) bloco[y * 8 + x] = valores[yy * largura + Math.min(largura - 1, bx + x)] - 128;
      }
      dct(bloco, coef, tmp);
      let corrida = 0;
      for (let k = 0; k < 64; k++) {
        const c = Math.round(coef[k] / q[k]);
        coef[k] = c * q[k];
        if (k === 0) { bits += 3 + categoria(c - dcAnterior); dcAnterior = c; continue; }
        if (c === 0) { corrida++; continue; }
        bits += 4 + Math.floor(corrida / 16) * 11 + categoria(c);
        corrida = 0;
      }
      bits += 4;
      idct(coef, volta, tmp);
      for (let y = 0; y < 8 && by + y < altura; y++) {
        for (let x = 0; x < 8 && bx + x < largura; x++) valores[(by + y) * largura + bx + x] = volta[y * 8 + x] + 128;
      }
    }
  }
  return bits;
}

/** O corte de um JPG: devolve a imagem que volta e os bytes que ela custa. */
function cortarComoJpg(img: Imagem, qualidade: number, manterTransparencia: boolean): { imagem: Imagem; bytes: number } {
  const w = img.largura; const h = img.altura;
  const Y = new Float32Array(w * h);
  const cw = Math.ceil(w / 2); const ch = Math.ceil(h / 2);
  const Cb = new Float32Array(cw * ch); const Cr = new Float32Array(cw * ch); const nC = new Float32Array(cw * ch);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Sem canal de transparência, o que era transparente é composto sobre branco.
      const a = manterTransparencia ? 1 : img.px[i + 3] / 255;
      const r = img.px[i] * a + 255 * (1 - a); const g = img.px[i + 1] * a + 255 * (1 - a); const b = img.px[i + 2] * a + 255 * (1 - a);
      Y[y * w + x] = 0.299 * r + 0.587 * g + 0.114 * b;
      const k = (y >> 1) * cw + (x >> 1);
      Cb[k] += 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      Cr[k] += 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      nC[k]++;
    }
  }
  for (let k = 0; k < Cb.length; k++) { Cb[k] /= nC[k]; Cr[k] /= nC[k]; }
  let bits = plano(Y, w, h, tabelaNaQualidade(Q_LUZ, qualidade));
  bits += plano(Cb, cw, ch, tabelaNaQualidade(Q_COR, qualidade));
  bits += plano(Cr, cw, ch, tabelaNaQualidade(Q_COR, qualidade));
  const px = new Uint8ClampedArray(img.px.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; const k = (y >> 1) * cw + (x >> 1);
      const yy = Y[y * w + x]; const cb = Cb[k] - 128; const cr = Cr[k] - 128;
      px[i] = yy + 1.402 * cr; px[i + 1] = yy - 0.344136 * cb - 0.714136 * cr; px[i + 2] = yy + 1.772 * cb;
      px[i + 3] = manterTransparencia ? img.px[i + 3] : 255;
    }
  }
  return { imagem: { ...img, px }, bytes: Math.round(bits / 8) };
}

/* ── O sem perda ─────────────────────────────────────────────────────────── */

const paeth = (a: number, b: number, c: number) => {
  const p = a + b - c;
  const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/**
 * Bytes de um PNG: a entropia do que sobra depois de prever cada byte pelos
 * vizinhos. Onde a imagem é lisa, sobra zero, e sequência de zeros quase não
 * custa — é por isso que o PNG de um desenho é pequeno e o de uma foto é
 * enorme. `canais` é 3 sem transparência e 4 com.
 */
export function bytesDoPng(img: Imagem, canais: 3 | 4): number {
  const w = img.largura; const h = img.altura; const p = img.px;
  const freq = new Float64Array(256); let total = 0; let corrida = 0; let corridas = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < canais; c++) {
        const i = (y * w + x) * 4 + c;
        const a = x > 0 ? p[i - 4] : 0; const b = y > 0 ? p[i - w * 4] : 0; const d = x > 0 && y > 0 ? p[i - w * 4 - 4] : 0;
        const r = (p[i] - paeth(a, b, d) + 256) & 255;
        if (r === 0) { corrida++; if (corrida >= 8) continue; } else { if (corrida >= 8) corridas++; corrida = 0; }
        freq[r]++; total++;
      }
    }
  }
  let bits = 0;
  for (let v = 0; v < 256; v++) if (freq[v] > 0) bits -= freq[v] * Math.log2(freq[v] / total);
  return Math.round(bits / 8 + corridas * 2 + 800);
}

/* ── Exportar ────────────────────────────────────────────────────────────── */

/** O cabeçalho que todo arquivo leva: dimensões, perfil de cor, ppi. */
const CABECALHO = 600;

export function exportar(img: Imagem, formato: Formato, nome: string, qualidade = 85): ArquivoDeImagem {
  const temTransparencia = img.px.some((v, i) => i % 4 === 3 && v < 255);
  if (formato === 'jpg') {
    const { imagem, bytes } = cortarComoJpg(img, qualidade, false);
    return { nome, formato, qualidade, bytes: bytes + CABECALHO, imagem };
  }
  if (formato === 'webp') {
    const { imagem, bytes } = cortarComoJpg(img, qualidade, true);
    const alfa = temTransparencia ? bytesDoPng(img, 4) - bytesDoPng(img, 3) : 0;
    return { nome, formato, qualidade, bytes: Math.round(bytes * FRACAO_DO_WEBP) + Math.max(0, alfa) + CABECALHO, imagem };
  }
  const imagem = { ...img, px: new Uint8ClampedArray(img.px) };
  if (formato === 'png') return { nome, formato, qualidade: null, bytes: bytesDoPng(img, temTransparencia ? 4 : 3), imagem };
  return { nome, formato, qualidade: null, bytes: img.largura * img.altura * (temTransparencia ? 4 : 3) + CABECALHO * 2, imagem };
}

/** Como o explorador de arquivos escreve o tamanho. */
export function tamanhoEscrito(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024).toLocaleString('pt-BR')} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}
