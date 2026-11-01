import {
  ajustar, apagarSelecao, girar, recortar, redimensionar, ruido, selecionarPorCor, somarMascaras, type Ajuste, type Imagem, type Retangulo,
} from '../labs/raster';
import { dentroDoTriangulo, fotografar, mapaDaCamera } from '../labs/fotosDoClube';

/*
 * As fotos das telas da CC-DG003.
 *
 * São outras que as do laboratório, pelo motivo de sempre: o acampamento e o
 * lenço chegam com defeitos cujo conserto é a tarefa — a inclinação exata, o
 * recorte, a cor da placa depois do ajuste —, e mostrar o gesto naquela foto
 * seria escrever a resposta na teoria. O lago e o emblema chegam com os
 * mesmos tipos de defeito, em outra medida: torta para o outro lado, quente
 * em vez de fria, um cone esquecido em vez da garrafa.
 *
 * Mesmo tamanho de câmera, 1800 por 1200, porque é o celular do clube — e é
 * isso que deixa as contas de centímetro que a teoria cita valerem para as
 * duas fotos. Os números que a lição cita saem daqui, e
 * `exemplosDaImagemDigital.test.ts` os confere.
 */

export const LARGURA_DO_LAGO = 1800;
export const ALTURA_DO_LAGO = 1200;
export const INCLINACAO_DO_LAGO = -2.5;
export const DEFEITO_DO_LAGO: Ajuste = { exposicao: -0.8, contraste: -28, temperatura: 50 };

export const ORLA = 700;
export const MARGEM = 860;
export const PLACA_DO_LAGO: Retangulo = { x: 300, y: 600, l: 160, a: 90 };
export const CANOA: Retangulo = { x: 1020, y: 760, l: 320, a: 46 };
export const CONE: Retangulo = { x: 1430, y: 960, l: 56, a: 90 };
/** O recorte que tira os cantos vazios do lago endireitado, com a canoa e a placa dentro. */
export const RECORTE_DO_LAGO: Retangulo = { x: 60, y: 50, l: 1680, a: 1100 };

const dentro = (x: number, y: number, r: Retangulo) => x >= r.x && x < r.x + r.l && y >= r.y && y < r.y + r.a;

function corDoLago(
  x: number, y: number,
  grama: (x: number, y: number) => number, fina: (x: number, y: number) => number, onda: (x: number, y: number) => number,
): [number, number, number] {
  // O cone esquecido, a placa e a canoa vêm antes do fundo.
  if (dentroDoTriangulo(x, y, CONE.x + CONE.l / 2, CONE.y, CONE.x, CONE.y + CONE.a, CONE.x + CONE.l, CONE.y + CONE.a)) {
    const faixa = y > CONE.y + 40 && y < CONE.y + 56;
    return faixa ? [240, 240, 236] : [235, 110, 30];
  }
  if (dentro(x, y, PLACA_DO_LAGO)) return [236, 236, 232];
  if (x >= 372 && x < 388 && y >= 690 && y < 860) return [95, 65, 40];
  if (dentro(x, y, CANOA)) {
    const meio = CANOA.x + CANOA.l / 2;
    const casco = Math.abs(x - meio) / (CANOA.l / 2);
    if (y > CANOA.y + CANOA.a * (0.35 + 0.65 * casco * casco)) return [190, 40, 35];
  }
  // A árvore da margem.
  if (x >= 1610 && x < 1640 && y >= 620 && y < 880) return [85, 60, 40];
  if ((x - 1625) ** 2 + (y - 560) ** 2 < 110 ** 2) {
    const n = fina(x, y);
    return [45 + 30 * n, 100 + 40 * n, 50 + 20 * n];
  }
  if (y >= MARGEM) {
    const n = grama(x, y) * 0.6 + fina(x, y) * 0.4;
    return [70 + 40 * n, 130 + 45 * n, 55 + 25 * n];
  }
  if (y >= ORLA) {
    const n = onda(x, y * 4);
    return [40 + 25 * n, 95 + 30 * n, 140 + 35 * n];
  }
  const cume = 560 + 50 * Math.sin(x / 210) + 30 * Math.sin(x / 71 + 2);
  if (y >= cume) {
    const n = grama(x * 0.5, y);
    return [65 + 18 * n, 95 + 20 * n, 80 + 15 * n];
  }
  const t = Math.max(0, Math.min(1, y / cume));
  return [120 + 70 * t, 165 + 50 * t, 220 + 20 * t];
}

let lagoGuardado: Imagem | null = null;

/** A foto do lago como o celular a entregou: torta, escura, sem contraste e quente demais. */
export function fotoDoLago(): Imagem {
  if (!lagoGuardado) {
    const grama = ruido(51, 40); const fina = ruido(53, 6); const onda = ruido(57, 25);
    const torta = fotografar(LARGURA_DO_LAGO, ALTURA_DO_LAGO, mapaDaCamera(LARGURA_DO_LAGO, ALTURA_DO_LAGO, INCLINACAO_DO_LAGO),
      (x, y) => corDoLago(x, y, grama, fina, onda), 17);
    lagoGuardado = ajustar(torta, DEFEITO_DO_LAGO);
  }
  return { ...lagoGuardado, px: new Uint8ClampedArray(lagoGuardado.px) };
}

/* ── O emblema da unidade, sobre o piso ──────────────────────────────────── */

export const LARGURA_DO_EMBLEMA = 1000;
export const ALTURA_DO_EMBLEMA = 800;
export const CENTRO_DO_EMBLEMA = { x: 500, y: 400, raio: 260 };

function corDoEmblema(x: number, y: number, piso: (x: number, y: number) => number): [number, number, number] {
  const { x: cx, y: cy, raio } = CENTRO_DO_EMBLEMA;
  const d = Math.hypot(x - cx, y - cy);
  if (d < raio) {
    if (d > raio - 22) return [242, 196, 46];
    // O pinheiro do meio: três andares e o tronco, em branco.
    if (x >= cx - 14 && x < cx + 14 && y >= cy + 110 && y < cy + 170) return [238, 232, 220];
    for (const [topo, base, meia] of [[cy - 170, cy - 40, 80], [cy - 100, cy + 40, 110], [cy - 30, cy + 115, 140]]) {
      if (dentroDoTriangulo(x, y, cx, topo, cx - meia, base, cx + meia, base)) return [238, 232, 220];
    }
    return [30, 110, 70];
  }
  // O piso de cimento, com o grão dele e a luz da janela vindo da esquerda.
  const n = piso(x, y);
  const luz = 1.05 - 0.25 * (x / LARGURA_DO_EMBLEMA);
  return [(150 + 30 * n) * luz, (148 + 30 * n) * luz, (142 + 28 * n) * luz];
}

let emblemaGuardado: Imagem | null = null;

export function fotoDoEmblema(): Imagem {
  if (!emblemaGuardado) {
    const piso = ruido(61, 4);
    emblemaGuardado = fotografar(LARGURA_DO_EMBLEMA, ALTURA_DO_EMBLEMA, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      (x, y) => corDoEmblema(x, y, piso), 19);
  }
  return { ...emblemaGuardado, px: new Uint8ClampedArray(emblemaGuardado.px) };
}

/** A miniatura que alguém mandou por mensagem: o emblema com 200 pixels de largura. */
export const miniaturaDoEmblema = (): Imagem => redimensionar(fotoDoEmblema(), 200, 160);


/* ── Os estados da foto do lago, um por lição ────────────────────────────── */

/** O ajuste que devolve a luz: o contrário do defeito, número por número. */
export const CORRECAO_DO_LAGO: Ajuste = { exposicao: 0.8, contraste: 28, temperatura: -50 };

export const lagoReto = (): Imagem => recortar(girar(fotoDoLago(), -INCLINACAO_DO_LAGO), RECORTE_DO_LAGO);
export const lagoAjustado = (): Imagem => ajustar(lagoReto(), CORRECAO_DO_LAGO);

/* ── O emblema sem o piso ────────────────────────────────────────────────── */

/** A tolerância da varinha nas telas, e os dois cliques que juntam o piso: a luz da janela o divide em faixas. */
export const TOLERANCIA_DO_PISO = 28;
export const CLIQUES_NO_PISO: { x: number; y: number }[] = [{ x: 60, y: 60 }, { x: 500, y: 60 }];

export function emblemaSemPiso(): Imagem {
  const img = fotoDoEmblema();
  const sel = CLIQUES_NO_PISO.map(p => selecionarPorCor(img, p.x, p.y, TOLERANCIA_DO_PISO)).reduce(somarMascaras);
  return apagarSelecao(img, sel);
}
