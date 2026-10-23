import {
  AJUSTE_NEUTRO, ajustar, aplicarMapa, novaImagem, ruido, sorteador,
  type Ajuste, type Imagem, type Mapa, type Retangulo,
} from './raster';

/*
 * As fotos da CC-DG003, geradas a partir de cenas descritas.
 *
 * ── Por que gerar, e não baixar uma foto ─────────────────────────────────
 * Uma foto de verdade não diz onde está a placa branca, nem que a garrafa é a
 * única coisa azul do chão. As metas precisam saber — para medir se a placa
 * voltou a ser branca, se a garrafa sumiu, se o horizonte ficou reto —, e uma
 * cena descrita sabe, pelo `mapa` que cada imagem carrega. E uma foto de
 * verdade traria junto a pergunta do requisito 6: de quem ela é. Esta é do
 * próprio clube, como as peças da CC-DG001.
 *
 * ── E ela chega estragada, de propósito ──────────────────────────────────
 * Torta, escura, fria e sem contraste, com uma garrafa no chão: é como a foto
 * do celular sai na barraca às seis da tarde, e é cada um desses defeitos que
 * uma lição conserta. Uma foto que chegasse boa abriria as metas verdes.
 */

/* ── A cena do acampamento ───────────────────────────────────────────────── */

/** 1800 por 1200: 15 por 10 centímetros a 300 ppi, o tamanho de uma foto de álbum. */
export const LARGURA_DA_FOTO = 1800;
export const ALTURA_DA_FOTO = 1200;
/** A câmera saiu torta: é este o ângulo que nivelar desfaz. */
export const INCLINACAO_DA_CAMERA = 3.5;
/** O que a câmera fez com a luz, e o que as lições de ajuste desfazem. */
export const DEFEITO_DA_CAMERA: Ajuste = { exposicao: -0.9, contraste: -30, temperatura: -55 };

/** A linha onde a grama encontra a serra, na cena. */
export const LINHA_DO_CHAO = 700;

/** Em coordenadas da cena. */
export const BARRACA: Retangulo = { x: 700, y: 470, l: 400, a: 390 };
export const PLACA: Retangulo = { x: 1320, y: 600, l: 140, a: 100 };
export const GARRAFA: Retangulo = { x: 1180, y: 900, l: 36, a: 92 };
/** Um pedaço de céu e um de grama, longe de tudo, para conferir que nada mais mudou. */
export const CEU: Retangulo = { x: 200, y: 80, l: 400, a: 160 };
export const GRAMA: Retangulo = { x: 1300, y: 950, l: 260, a: 160 };

/*
 * O grão do sensor, em níveis de 0 a 255. Pouco, de propósito: com 6 a
 * medida de semelhança passava a medir se o JPG apagou o grão — o que ele
 * sempre faz — e qualidade 90 e qualidade 20 saíam quase iguais nela.
 */
const GRAO = 2;
const BRANCO_DA_PLACA: [number, number, number] = [236, 236, 232];

const dentroDoTriangulo = (x: number, y: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => {
  const s = (ax - cx) * (y - cy) - (ay - cy) * (x - cx);
  const t = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  if ((s < 0) !== (t < 0) && s !== 0 && t !== 0) return false;
  const d = (cx - bx) * (y - by) - (cy - by) * (x - bx);
  return d === 0 || (d < 0) === (s + t <= 0);
};

const dentro = (x: number, y: number, r: Retangulo) => x >= r.x && x < r.x + r.l && y >= r.y && y < r.y + r.a;

/** A cor da cena num ponto qualquer: o mundo é infinito, a foto é que tem borda. */
function corDaCena(
  x: number, y: number,
  grama: (x: number, y: number) => number, fina: (x: number, y: number) => number,
  nuvem: (x: number, y: number) => number,
): [number, number, number] {
  const cume = 520 + 60 * Math.sin(x / 170) + 35 * Math.sin(x / 63 + 1);
  // A garrafa, a placa e a barraca vêm antes do fundo, na ordem de quem está na frente.
  if (dentro(x, y, GARRAFA)) {
    if (y < GARRAFA.y + 12) return [235, 235, 240];
    const brilho = x < GARRAFA.x + 10 ? 40 : 0;
    return [60 + brilho, 135 + brilho, 210];
  }
  if (dentro(x, y, PLACA)) return BRANCO_DA_PLACA;
  if (x >= 1385 && x < 1395 && y >= 700 && y < 860) return [95, 65, 40];
  if (dentroDoTriangulo(x, y, 900, 620, 850, 860, 950, 860)) return [120, 50, 25];
  if (dentroDoTriangulo(x, y, 900, 470, 700, 860, 1100, 860)) {
    const sombra = x > 900 ? -25 : 0;
    return [228 + sombra, 112 + sombra, 40 + sombra / 2];
  }
  // A árvore: tronco e copa.
  if (x >= 290 && x < 320 && y >= 560 && y < 820) return [85, 60, 40];
  if ((x - 305) ** 2 + (y - 520) ** 2 < 120 ** 2) {
    const n = fina(x, y);
    return [40 + 30 * n, 95 + 40 * n, 45 + 20 * n];
  }
  if (y >= LINHA_DO_CHAO) {
    const n = grama(x, y) * 0.6 + fina(x, y) * 0.4;
    const perto = (y - LINHA_DO_CHAO) / 900;
    return [60 + 40 * n - 10 * perto, 125 + 45 * n - 15 * perto, 50 + 25 * n];
  }
  if (y >= cume) {
    const n = grama(x * 0.5, y);
    return [70 + 18 * n, 92 + 20 * n, 108 + 15 * n];
  }
  const t = Math.max(0, Math.min(1, y / cume));
  const nv = Math.max(0, nuvem(x, y) - 0.55) * 2.2;
  const r = 110 + 80 * t; const g = 160 + 55 * t; const b = 215 + 20 * t;
  return [r + (245 - r) * nv, g + (245 - g) * nv, b + (248 - b) * nv];
}

function fotografar(largura: number, altura: number, mapa: Mapa, cor: (x: number, y: number) => [number, number, number], semente: number): Imagem {
  const img = { ...novaImagem(largura, altura, 72), mapa };
  // O inverso do mapa: de cada pixel da foto até o ponto da cena que ele viu.
  const det = mapa.a * mapa.d - mapa.b * mapa.c;
  const inv = { a: mapa.d / det, b: -mapa.b / det, c: -mapa.c / det, d: mapa.a / det };
  const r = sorteador(semente);
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const dx = x + 0.5 - mapa.e; const dy = y + 0.5 - mapa.f;
      const sx = inv.a * dx + inv.c * dy; const sy = inv.b * dx + inv.d * dy;
      const [cr, cg, cb] = cor(sx, sy);
      const grao = (r() - 0.5) * GRAO;
      const i = (y * largura + x) * 4;
      img.px[i] = cr + grao; img.px[i + 1] = cg + grao; img.px[i + 2] = cb + grao; img.px[i + 3] = 255;
    }
  }
  return img;
}

/** A câmera torta: gira a cena em volta do centro da foto. */
function mapaDaCamera(largura: number, altura: number, graus: number): Mapa {
  const t = (graus * Math.PI) / 180;
  const cos = Math.cos(t); const sin = Math.sin(t);
  const cx = largura / 2; const cy = altura / 2;
  return { a: cos, b: sin, c: -sin, d: cos, e: cx - cos * cx + sin * cy, f: cy - sin * cx - cos * cy };
}

let cenaGuardada: Imagem | null = null;

/** A cena como ela é, sem a câmera: reta, com a luz certa. */
export function cenaDoAcampamento(): Imagem {
  if (!cenaGuardada) {
    const grama = ruido(11, 40); const fina = ruido(23, 6); const nuvem = ruido(37, 120);
    cenaGuardada = fotografar(LARGURA_DA_FOTO, ALTURA_DA_FOTO, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      (x, y) => corDaCena(x, y, grama, fina, nuvem), 5);
  }
  return { ...cenaGuardada, px: new Uint8ClampedArray(cenaGuardada.px) };
}

let fotoGuardada: Imagem | null = null;

/** A foto como o celular a entregou. */
export function fotoDoAcampamento(): Imagem {
  if (!fotoGuardada) {
    const grama = ruido(11, 40); const fina = ruido(23, 6); const nuvem = ruido(37, 120);
    const torta = fotografar(LARGURA_DA_FOTO, ALTURA_DA_FOTO, mapaDaCamera(LARGURA_DA_FOTO, ALTURA_DA_FOTO, INCLINACAO_DA_CAMERA),
      (x, y) => corDaCena(x, y, grama, fina, nuvem), 7);
    fotoGuardada = ajustar(torta, DEFEITO_DA_CAMERA);
  }
  return { ...fotoGuardada, px: new Uint8ClampedArray(fotoGuardada.px) };
}

/* ── O lenço do clube, sobre a mesa ──────────────────────────────────────── */

export const LARGURA_DO_LENCO = 1000;
export const ALTURA_DO_LENCO = 800;

/** O escudo bordado: um retângulo com a ponta de baixo em triângulo. */
export const ESCUDO = { x: 330, y: 170, l: 340, a: 300, ponta: 170 };

export function dentroDoEscudo(x: number, y: number): boolean {
  const e = ESCUDO;
  if (x < e.x || x >= e.x + e.l || y < e.y) return false;
  if (y < e.y + e.a) return true;
  return dentroDoTriangulo(x, y, e.x, e.y + e.a, e.x + e.l, e.y + e.a, e.x + e.l / 2, e.y + e.a + e.ponta);
}

/** A borda do escudo, onde uma tolerância de cor qualquer erra para um lado ou para o outro. */
export function naBordaDoEscudo(x: number, y: number, folga = 4): boolean {
  const d = dentroDoEscudo(x, y);
  for (const [dx, dy] of [[folga, 0], [-folga, 0], [0, folga], [0, -folga]]) if (dentroDoEscudo(x + dx, y + dy) !== d) return true;
  return false;
}

function corDoLenco(x: number, y: number, veio: (x: number, y: number) => number, fina: (x: number, y: number) => number): [number, number, number] {
  if (dentroDoEscudo(x, y)) {
    const e = ESCUDO;
    const borda = x < e.x + 18 || x >= e.x + e.l - 18 || y < e.y + 18 || naBordaDoEscudo(x, y, 18);
    if (borda) return [242, 196, 46];
    // A estrela do centro, em branco: é um terceiro tom dentro do escudo, e quem
    // escolhe o escudo pela cor precisa somar os três.
    const cx = e.x + e.l / 2; const cy = e.y + 150;
    const ang = Math.atan2(y - cy, x - cx); const raio = Math.hypot(x - cx, y - cy);
    const ponta = 70 * (0.55 + 0.45 * Math.cos(5 * ang + Math.PI / 2));
    if (raio < ponta) return [238, 232, 220];
    return [176, 30, 42];
  }
  // A mesa: veio da madeira e a luz da janela vindo da direita.
  const n = veio(x * 0.25, y * 3) * 0.7 + fina(x, y) * 0.3;
  const luz = 0.75 + 0.35 * (x / LARGURA_DO_LENCO);
  return [(140 + 40 * n) * luz, (100 + 30 * n) * luz, (62 + 20 * n) * luz];
}

let lencoGuardado: Imagem | null = null;

export function fotoDoLenco(): Imagem {
  if (!lencoGuardado) {
    const veio = ruido(41, 30); const fina = ruido(43, 5);
    lencoGuardado = fotografar(LARGURA_DO_LENCO, ALTURA_DO_LENCO, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      (x, y) => corDoLenco(x, y, veio, fina), 13);
  }
  return { ...lencoGuardado, px: new Uint8ClampedArray(lencoGuardado.px) };
}

/* ── Medidas da cena ─────────────────────────────────────────────────────── */

/** O ponto da imagem onde está um ponto da cena. */
export const naImagem = (img: Imagem, x: number, y: number) => aplicarMapa(img.mapa, x, y);

export { AJUSTE_NEUTRO };
