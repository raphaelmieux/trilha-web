import { semente, type GrupoDaFaixa, type PecaDaFaixa, type UnidadeDaFaixa, type Zona } from './catalogoDaFaixa';

/*
  O empacotador da Faixa: onde cada unidade se prende no tecido.

  ── Peça a peça, e não unidade a unidade ─────────────────────────────────────
  Cada unidade — uma peça com os seus satélites, um cacho de escada, um
  Mestrado, um tema de curiosidades — procura o lugar mais à esquerda do grupo
  dela em que nenhuma das suas **peças** toque peça de outra unidade. Uma elipse
  em volta da unidade inteira deixaria buracos do tamanho do anel de
  satélites; peça a peça, o anel de uma vereda se encaixa no vão do anel da
  vizinha, como pins presos à mão.

  ── O mesmo para todo mundo ─────────────────────────────────────────────────
  A altura de cada unidade é sorteada a partir da chave dela, com semente fixa:
  a Faixa sai igual em todo navegador, e nenhuma peça muda de lugar quando
  outra é conquistada — o que se conquista acende, e não se move.

  ── Função pura ──────────────────────────────────────────────────────────────
  Nada aqui sabe de tela. `empacotarFaixa.test.ts` confere que nenhuma peça
  toca outra, que toda peça do catálogo tem um lugar só e que o resultado não
  muda de uma chamada para a outra.
*/

/** A altura de desenho da Faixa; a tela escala daqui. */
export const ALTURA_DA_FAIXA = 520;
const MARGEM = 28;
/** A folga mínima entre duas peças de unidades diferentes. */
export const FOLGA = 12;
const BALDE = 160;
const INICIO = 40;

export interface PecaPosta extends PecaDaFaixa {
  /** Centro, em pixels de desenho. */
  x: number;
  y: number;
  giro: number;
  unidade: string;
  zona: Zona;
}

export interface TrechoDaFaixa {
  nome: string;
  zona: Zona;
  de: number;
  ate: number;
}

export interface FaixaEmpacotada {
  pecas: PecaPosta[];
  /** Um trecho por grupo, para a régua. */
  trechos: TrechoDaFaixa[];
  largura: number;
  altura: number;
}

interface Ocupada { x: number; y: number; rx: number; ry: number; respiro: number }

class Tecido {
  private baldes = new Map<number, Ocupada[]>();

  cabe(x: number, y: number, rx: number, ry: number, respiro: number): boolean {
    const b0 = Math.floor((x - rx - 200) / BALDE), b1 = Math.floor((x + rx + 200) / BALDE);
    for (let b = b0; b <= b1; b++) for (const p of this.baldes.get(b) ?? []) {
      const folga = FOLGA + Math.max(respiro, p.respiro);
      const dx = x - p.x, dy = y - p.y, sx = rx + p.rx + folga, sy = ry + p.ry + folga;
      if (Math.abs(dx) >= sx || Math.abs(dy) >= sy) continue;
      if ((dx * dx) / (sx * sx) + (dy * dy) / (sy * sy) < 1) return false;
    }
    return true;
  }

  guardar(o: Ocupada) {
    const b = Math.floor(o.x / BALDE);
    const lista = this.baldes.get(b) ?? [];
    lista.push(o);
    this.baldes.set(b, lista);
  }
}

/** O lugar mais à esquerda, a partir de `piso`, em que a unidade inteira cabe. */
function prender(tecido: Tecido, u: UnidadeDaFaixa, piso: number): { x: number; y: number; direita: number } {
  const sorte = semente(u.chave);
  const respiro = u.respiro ?? 0;
  const formas = u.pecas.map(p => ({ dx: p.dx, dy: p.dy, rx: p.w / 2, ry: p.h / 2 }));
  const topo = Math.min(...formas.map(f => f.dy - f.ry));
  const base = Math.max(...formas.map(f => f.dy + f.ry));
  const esquerda = Math.min(...formas.map(f => f.dx - f.rx));
  const direitaDaUnidade = Math.max(...formas.map(f => f.dx + f.rx));
  const min = MARGEM - topo, max = ALTURA_DA_FAIXA - MARGEM - base;
  const alturas = max <= min
    ? [(min + max) / 2]
    : Array.from({ length: 18 }, (_, i) => min + (max - min) * (i + sorte() * 0.8) / 18).sort(() => sorte() - 0.5);
  for (let x = piso - esquerda; ; x += 5) {
    for (const y of alturas) {
      if (formas.every(f => tecido.cabe(x + f.dx, y + f.dy, f.rx, f.ry, respiro))) {
        for (const f of formas) tecido.guardar({ x: x + f.dx, y: y + f.dy, rx: f.rx, ry: f.ry, respiro });
        return { x, y, direita: x + direitaDaUnidade };
      }
    }
  }
}

/**
 * Prende os grupos, um depois do outro. Cada grupo começa um pouco antes de o
 * anterior terminar (`encaixe`), para as bordas se encaixarem como numa faixa
 * costurada à mão; o Mestrado procura lugar a partir do fim da família, que é
 * o grupo que ele fecha.
 */
export function empacotarFaixa(grupos: GrupoDaFaixa[]): FaixaEmpacotada {
  const tecido = new Tecido();
  const pecas: PecaPosta[] = [];
  const trechos: TrechoDaFaixa[] = [];
  let fronteira = INICIO;
  for (const g of grupos) {
    const piso = Math.max(INICIO, fronteira - g.encaixe);
    let fim = fronteira;
    for (const u of g.unidades) {
      const { x, y, direita } = prender(tecido, u, u.fecha ? Math.max(piso, fim - 260) : piso);
      for (const p of u.pecas) {
        const { dx, dy, ...resto } = p;
        pecas.push({ ...resto, x: x + dx, y: y + dy, unidade: u.chave, zona: g.zona });
      }
      fim = Math.max(fim, direita);
    }
    trechos.push({ nome: g.nome, zona: g.zona, de: piso, ate: fim });
    fronteira = fim + (g.folgaDepois ?? 0);
  }
  return { pecas, trechos, largura: Math.ceil(fronteira + 60), altura: ALTURA_DA_FAIXA };
}
