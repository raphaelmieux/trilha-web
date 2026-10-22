/**
 * A geometria do desenho vetorial: nó, alça, curva de Bézier, e as operações
 * que o editor faz com elas.
 *
 * ── Um caminho é uma lista de nós ────────────────────────────────────────
 * Cada nó é um ponto por onde a linha passa, e pode ter duas alças: a de
 * **entrada**, que puxa a curva que chega nele, e a de **saída**, que puxa a
 * que parte dele. Entre dois nós vizinhos a linha é uma curva de Bézier
 * cúbica — o nó de partida, a alça de saída dele, a alça de entrada do
 * seguinte e o nó seguinte. Sem alça nenhuma, a curva é uma reta.
 *
 * É o modelo de todo editor vetorial e do próprio SVG, e é por isso que ele é
 * este: o requisito 7 da CC-DG002 manda abrir o arquivo num editor de texto e
 * achar as coordenadas, e o que a pessoa encontra lá precisa ser o que ela
 * desenhou — um M, uns C e um Z, com os números dos nós dela.
 *
 * ── As alças moram em coordenada absoluta ────────────────────────────────
 * Relativas ao nó economizariam uma subtração por desenho, e custariam o que
 * importa: arrastar um nó levaria as alças junto por acidente da representação,
 * e não por decisão do editor. Aqui mover o nó move as alças porque `moverNo`
 * diz que move.
 */

import polygonClipping, { type MultiPolygon, type Polygon } from 'polygon-clipping';

export interface Ponto { x: number; y: number }

/** Canto quebra a direção; suave mantém as duas alças na mesma reta. */
export type TipoDeNo = 'canto' | 'suave';

export interface No extends Ponto {
  entrada: Ponto | null;
  saida: Ponto | null;
  tipo: TipoDeNo;
}

export interface Contorno {
  nos: No[];
  fechado: boolean;
}

/* ── A curva ──────────────────────────────────────────────────────────────── */

const lerp = (a: Ponto, b: Ponto, t: number): Ponto => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** O ponto da curva de Bézier cúbica no instante t, de 0 a 1. */
export function pontoNaBezier(p0: Ponto, c1: Ponto, c2: Ponto, p3: Ponto, t: number): Ponto {
  /* De Casteljau: três interpolações encaixadas. É a definição da curva, e é
     estável — a forma polinomial perde precisão perto das pontas. */
  const a = lerp(p0, c1, t);
  const b = lerp(c1, c2, t);
  const c = lerp(c2, p3, t);
  const d = lerp(a, b, t);
  const e = lerp(b, c, t);
  return lerp(d, e, t);
}

export interface Segmento { p0: Ponto; c1: Ponto; c2: Ponto; p3: Ponto; reto: boolean }

/** Os segmentos de um contorno, com o de fechamento quando ele é fechado. */
export function segmentosDe(c: Contorno): Segmento[] {
  const n = c.nos.length;
  const pares = c.fechado ? n : n - 1;
  const segs: Segmento[] = [];
  for (let i = 0; i < pares; i++) {
    const a = c.nos[i];
    const b = c.nos[(i + 1) % n];
    const c1 = a.saida ?? a;
    const c2 = b.entrada ?? b;
    segs.push({ p0: a, c1, c2, p3: b, reto: !a.saida && !b.entrada });
  }
  return segs;
}

/**
 * O contorno como uma linha quebrada de pontos.
 *
 * É o que as contas de área, de caixa e de booleana usam. Dezesseis passos
 * por curva bastam para o olho e para a medida: a diferença de área de um
 * círculo assim para o de verdade fica abaixo de meio por cento.
 */
export function achatar(c: Contorno, passos = 16): Ponto[] {
  const pts: Ponto[] = [];
  for (const s of segmentosDe(c)) {
    if (pts.length === 0) pts.push({ x: s.p0.x, y: s.p0.y });
    if (s.reto) { pts.push({ x: s.p3.x, y: s.p3.y }); continue; }
    for (let k = 1; k <= passos; k++) pts.push(pontoNaBezier(s.p0, s.c1, s.c2, s.p3, k / passos));
  }
  if (c.fechado && pts.length > 1) {
    const [a, b] = [pts[0], pts[pts.length - 1]];
    if (Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9) pts.pop();
  }
  return pts;
}

export interface Caixa { x: number; y: number; largura: number; altura: number }

export function caixaDosPontos(pts: Ponto[]): Caixa {
  if (pts.length === 0) return { x: 0, y: 0, largura: 0, altura: 0 };
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, largura: Math.max(...xs) - x, altura: Math.max(...ys) - y };
}

export const caixaDosContornos = (cs: Contorno[]) => caixaDosPontos(cs.flatMap(c => achatar(c)));

/** A área com sinal pela fórmula do cadarço: positiva num sentido, negativa no outro. */
export function areaComSinal(pts: Ponto[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/**
 * A área que a tinta cobre, pela regra par-ímpar: um furo dentro do contorno
 * de fora desconta.
 *
 * Par-ímpar, e não a soma dos módulos: a lua que sai de uma subtração tem o
 * furo desenhado como contorno, e somá-lo daria à lua a área do círculo
 * inteiro mais a do furo.
 */
export function areaPintada(cs: Contorno[]): number {
  const fechados = cs.filter(c => c.fechado).map(c => achatar(c));
  if (fechados.length === 0) return 0;
  const resultado = polygonClipping.xor(...fechados.map(p => [anel(p)] as Polygon) as [Polygon, ...Polygon[]]);
  return resultado.reduce((s, poli) => s + poli.reduce((t, a, i) => {
    const area = Math.abs(areaComSinal(a.map(([x, y]) => ({ x, y }))));
    return i === 0 ? t + area : t - area;
  }, 0), 0);
}

/* ── Formas primitivas como contorno ─────────────────────────────────────── */

/** A constante que faz quatro curvas cúbicas desenharem um círculo. */
export const K_DO_CIRCULO = 0.5522847498;

const canto = (x: number, y: number): No => ({ x, y, entrada: null, saida: null, tipo: 'canto' });

export function contornoDoRetangulo(x: number, y: number, l: number, a: number): Contorno {
  return { fechado: true, nos: [canto(x, y), canto(x + l, y), canto(x + l, y + a), canto(x, y + a)] };
}

export function contornoDaElipse(x: number, y: number, l: number, a: number): Contorno {
  const [cx, cy, rx, ry] = [x + l / 2, y + a / 2, l / 2, a / 2];
  const [kx, ky] = [rx * K_DO_CIRCULO, ry * K_DO_CIRCULO];
  const no = (px: number, py: number, ex: number, ey: number, sx: number, sy: number): No =>
    ({ x: px, y: py, entrada: { x: ex, y: ey }, saida: { x: sx, y: sy }, tipo: 'suave' });
  return {
    fechado: true,
    nos: [
      no(cx, cy - ry, cx - kx, cy - ry, cx + kx, cy - ry),
      no(cx + rx, cy, cx + rx, cy - ky, cx + rx, cy + ky),
      no(cx, cy + ry, cx + kx, cy + ry, cx - kx, cy + ry),
      no(cx - rx, cy, cx - rx, cy + ky, cx - rx, cy - ky),
    ],
  };
}

export function contornoDoPoligono(pts: Ponto[]): Contorno {
  return { fechado: true, nos: pts.map(p => canto(p.x, p.y)) };
}

/* ── Booleanas ────────────────────────────────────────────────────────────── */

export type Booleana = 'uniao' | 'subtracao' | 'intersecao';

const anel = (pts: Ponto[]): [number, number][] => {
  const a = pts.map(p => [p.x, p.y] as [number, number]);
  if (a.length > 0) a.push([a[0][0], a[0][1]]);
  return a;
};

/** O desenho como multipolígono, pela regra par-ímpar entre os próprios contornos. */
function comoMultipoligono(cs: Contorno[]): MultiPolygon {
  const fechados = cs.filter(c => c.fechado && c.nos.length >= 3).map(c => [anel(achatar(c))] as Polygon);
  if (fechados.length === 0) return [];
  return polygonClipping.xor(...(fechados as [Polygon, ...Polygon[]]));
}

/**
 * Tira os pontos que estão no meio de uma reta.
 *
 * O resultado de uma booleana sai achatado — dezesseis pontos por curva —, e
 * um quadrado subtraído de um retângulo sairia com os nós que ninguém pôs. É a
 * parte do "editar nós" que a pessoa encontraria entulhada. Só sai o ponto
 * que está **na** reta dos vizinhos, a menos de um décimo de pixel, para não
 * achatar uma curva de verdade.
 */
export function semPontosNaReta(pts: Ponto[], tolerancia = 0.1): Ponto[] {
  if (pts.length <= 3) return pts;
  const fica: Ponto[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[i];
    const c = pts[(i + 1) % pts.length];
    const cruz = (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
    const base = Math.hypot(c.x - a.x, c.y - a.y) || 1;
    if (Math.abs(cruz) / base > tolerancia) fica.push(b);
  }
  return fica.length >= 3 ? fica : pts;
}

/**
 * União, subtração e interseção de dois desenhos.
 *
 * A subtração tira **b** de **a**: a ordem importa, como em todo editor, e é
 * o objeto de baixo que perde o pedaço. O resultado é um caminho de nós de
 * canto: as curvas viram uma sucessão de retas curtas, o que é o que alguns
 * editores fazem e o que nenhum olho separa no tamanho em que a peça é vista.
 */
export function booleana(a: Contorno[], b: Contorno[], op: Booleana): Contorno[] {
  const [ma, mb] = [comoMultipoligono(a), comoMultipoligono(b)];
  const r = op === 'uniao' ? polygonClipping.union(ma, mb)
    : op === 'subtracao' ? polygonClipping.difference(ma, mb)
      : polygonClipping.intersection(ma, mb);
  return r.flatMap(poli => poli.map(aneis => {
    const pts = aneis.slice(0, -1).map(([x, y]) => ({ x: arred(x), y: arred(y) }));
    return contornoDoPoligono(semPontosNaReta(pts));
  }));
}

const arred = (n: number) => Math.round(n * 100) / 100;

/* ── Comparar desenhos ────────────────────────────────────────────────────── */

/**
 * Quanto dois desenhos coincidem: a área em comum sobre a área que os dois
 * cobrem juntos. Um é o mesmo desenho; zero é nenhum ponto em comum.
 *
 * É a medida com que se confere uma reprodução. Ela não pergunta quantos nós
 * a pessoa usou nem em que ordem desenhou — só se a forma que saiu é a pedida,
 * que é o que o examinador olha.
 */
export function coincidencia(a: Contorno[], b: Contorno[]): number {
  const [ma, mb] = [comoMultipoligono(a), comoMultipoligono(b)];
  if (ma.length === 0 || mb.length === 0) return 0;
  const area = (m: MultiPolygon) => m.reduce((s, poli) => s + poli.reduce((t, anelP, i) => {
    const v = Math.abs(areaComSinal(anelP.map(([x, y]) => ({ x, y }))));
    return i === 0 ? t + v : t - v;
  }, 0), 0);
  const uniao = area(polygonClipping.union(ma, mb));
  return uniao === 0 ? 0 : area(polygonClipping.intersection(ma, mb)) / uniao;
}

/**
 * O desenho levado para o canto, com a largura valendo um.
 *
 * Escala uniforme, a mesma nos dois eixos: é o que deixa comparar uma
 * reprodução feita em outro tamanho — e é o que faz a proporção errada
 * aparecer como forma diferente, em vez de ser corrigida pela comparação.
 */
export function normalizar(cs: Contorno[]): Contorno[] {
  const c = caixaDosContornos(cs);
  if (c.largura === 0) return cs;
  return escalar(transladar(cs, -c.x, -c.y), { x: 0, y: 0 }, 1 / c.largura, 1 / c.largura);
}

/* ── Os nós ───────────────────────────────────────────────────────────────── */

const somar = (p: Ponto, dx: number, dy: number): Ponto => ({ x: p.x + dx, y: p.y + dy });

/** Mover um nó leva as alças dele junto: é o que todo editor faz, e por decisão. */
export function moverNo(c: Contorno, i: number, x: number, y: number): Contorno {
  const n = c.nos[i];
  const [dx, dy] = [x - n.x, y - n.y];
  const nos = c.nos.map((m, j) => (j !== i ? m : {
    ...m, x, y,
    entrada: m.entrada && somar(m.entrada, dx, dy),
    saida: m.saida && somar(m.saida, dx, dy),
  }));
  return { ...c, nos };
}

/**
 * Mover uma alça.
 *
 * No nó suave a alça oposta gira junto para continuar na mesma reta — é o que
 * faz a curva passar pelo nó sem quina —, e guarda o próprio comprimento. No
 * nó de canto cada alça é solta.
 */
export function moverAlca(c: Contorno, i: number, qual: 'entrada' | 'saida', x: number, y: number): Contorno {
  const nos = c.nos.map((m, j) => {
    if (j !== i) return m;
    const outra = qual === 'entrada' ? 'saida' : 'entrada';
    const novo: No = { ...m, [qual]: { x, y } };
    const oposta = m[outra];
    if (m.tipo === 'suave' && oposta) {
      const comprimento = Math.hypot(oposta.x - m.x, oposta.y - m.y);
      const [vx, vy] = [m.x - x, m.y - y];
      const d = Math.hypot(vx, vy) || 1;
      novo[outra] = { x: m.x + (vx / d) * comprimento, y: m.y + (vy / d) * comprimento };
    }
    return novo;
  });
  return { ...c, nos };
}

/**
 * Trocar o tipo do nó.
 *
 * De canto para suave, as alças nascem na direção que liga o nó anterior ao
 * seguinte, com um terço da distância a cada vizinho — que é a curva mais
 * calma que passa por ali. De suave para canto as alças saem: o nó volta a
 * ser uma quina.
 */
export function trocarTipo(c: Contorno, i: number, tipo: TipoDeNo): Contorno {
  const n = c.nos.length;
  const nos = c.nos.map((m, j) => {
    if (j !== i) return m;
    if (tipo === 'canto') return { ...m, tipo, entrada: null, saida: null };
    const temAnterior = c.fechado || j > 0;
    const temSeguinte = c.fechado || j < n - 1;
    const ant = temAnterior ? c.nos[(j - 1 + n) % n] : m;
    const seg = temSeguinte ? c.nos[(j + 1) % n] : m;
    const [dx, dy] = [seg.x - ant.x, seg.y - ant.y];
    const d = Math.hypot(dx, dy) || 1;
    const [ux, uy] = [dx / d, dy / d];
    const la = Math.hypot(m.x - ant.x, m.y - ant.y) / 3;
    const ls = Math.hypot(seg.x - m.x, seg.y - m.y) / 3;
    return {
      ...m, tipo,
      entrada: temAnterior ? { x: m.x - ux * la, y: m.y - uy * la } : null,
      saida: temSeguinte ? { x: m.x + ux * ls, y: m.y + uy * ls } : null,
    };
  });
  return { ...c, nos };
}

export const transladar = (cs: Contorno[], dx: number, dy: number): Contorno[] => cs.map(c => ({
  ...c,
  nos: c.nos.map(n => ({
    ...n, x: n.x + dx, y: n.y + dy,
    entrada: n.entrada && somar(n.entrada, dx, dy),
    saida: n.saida && somar(n.saida, dx, dy),
  })),
}));

/** Escalar a partir de um ponto: é o que a alça de canto da caixa faz. */
export function escalar(cs: Contorno[], origem: Ponto, sx: number, sy: number): Contorno[] {
  const t = (p: Ponto): Ponto => ({ x: origem.x + (p.x - origem.x) * sx, y: origem.y + (p.y - origem.y) * sy });
  return cs.map(c => ({
    ...c,
    nos: c.nos.map(n => ({ ...n, ...t(n), entrada: n.entrada && t(n.entrada), saida: n.saida && t(n.saida) })),
  }));
}

/* ── O SVG, nos dois sentidos ────────────────────────────────────────────── */

const num = (n: number) => String(Math.round(n * 100) / 100);

/**
 * O atributo d de um caminho: M, L, C e Z, sempre absolutos.
 *
 * Absolutos de propósito. O requisito 7 manda achar as coordenadas de uma
 * forma no arquivo e mudá-las à mão; com comandos relativos, o número escrito
 * seria o deslocamento desde o nó anterior, e mudar um deles arrastaria todos
 * os seguintes — a pessoa mexeria num canto e veria a forma inteira andar.
 */
export function dDoContorno(c: Contorno): string {
  if (c.nos.length === 0) return '';
  const partes = [`M ${num(c.nos[0].x)} ${num(c.nos[0].y)}`];
  for (const s of segmentosDe(c)) {
    if (s.reto) {
      if (!(c.fechado && s.p3 === c.nos[0])) partes.push(`L ${num(s.p3.x)} ${num(s.p3.y)}`);
    } else {
      partes.push(`C ${num(s.c1.x)} ${num(s.c1.y)} ${num(s.c2.x)} ${num(s.c2.y)} ${num(s.p3.x)} ${num(s.p3.y)}`);
    }
  }
  if (c.fechado) partes.push('Z');
  return partes.join(' ');
}

export const dDosContornos = (cs: Contorno[]) => cs.map(dDoContorno).filter(Boolean).join(' ');

/**
 * Lê um atributo d de volta para contornos.
 *
 * Entende o que `dDoContorno` escreve — M, L, C, Z — e também H, V e as
 * minúsculas relativas, porque quem edita o arquivo à mão pode escrevê-las, e
 * um arquivo que o editor recusa ao reabrir ensinaria que mexer no SVG
 * estraga o desenho. Devolve `null` quando não entende, para a tela dizer o
 * que não entendeu em vez de abrir um desenho vazio.
 */
export function contornosDoD(d: string): Contorno[] | null {
  const fichas = d.match(/[MmLlHhVvCcZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!fichas) return null;
  const cs: Contorno[] = [];
  let atual: Contorno | null = null;
  let p: Ponto = { x: 0, y: 0 };
  let inicio: Ponto = { x: 0, y: 0 };
  let i = 0;
  let cmd = '';
  const ler = () => {
    const v = Number(fichas[i++]);
    if (!Number.isFinite(v)) throw new Error('número');
    return v;
  };
  const ehNumero = (f: string | undefined) => f !== undefined && !/^[A-Za-z]$/.test(f);
  try {
    while (i < fichas.length) {
      if (!ehNumero(fichas[i])) cmd = fichas[i++];
      else if (!cmd) return null;
      const rel = cmd === cmd.toLowerCase();
      const base = rel ? p : { x: 0, y: 0 };
      switch (cmd.toUpperCase()) {
        case 'M': {
          const q = { x: base.x + ler(), y: base.y + ler() };
          atual = { nos: [canto(q.x, q.y)], fechado: false };
          cs.push(atual);
          p = inicio = q;
          cmd = rel ? 'l' : 'L';
          break;
        }
        case 'L': case 'H': case 'V': {
          if (!atual) return null;
          const C = cmd.toUpperCase();
          const q = C === 'L' ? { x: base.x + ler(), y: base.y + ler() }
            : C === 'H' ? { x: (rel ? p.x : 0) + ler(), y: p.y } : { x: p.x, y: (rel ? p.y : 0) + ler() };
          atual.nos.push(canto(q.x, q.y));
          p = q;
          break;
        }
        case 'C': {
          if (!atual) return null;
          const c1 = { x: base.x + ler(), y: base.y + ler() };
          const c2 = { x: base.x + ler(), y: base.y + ler() };
          const q = { x: base.x + ler(), y: base.y + ler() };
          const anterior = atual.nos[atual.nos.length - 1];
          anterior.saida = c1;
          atual.nos.push({ x: q.x, y: q.y, entrada: c2, saida: null, tipo: 'canto' });
          p = q;
          break;
        }
        case 'Z': {
          if (!atual) return null;
          const ultimo = atual.nos[atual.nos.length - 1];
          /* O nó que repete o primeiro fecha o contorno, e não é nó novo: a
             entrada dele passa a ser a do primeiro. */
          if (atual.nos.length > 1 && Math.abs(ultimo.x - inicio.x) < 1e-6 && Math.abs(ultimo.y - inicio.y) < 1e-6) {
            atual.nos[0].entrada = ultimo.entrada;
            atual.nos.pop();
          }
          atual.fechado = true;
          p = inicio;
          atual = null;
          cmd = '';
          break;
        }
        default: return null;
      }
    }
  } catch {
    return null;
  }
  return cs.filter(c => c.nos.length > 0);
}
