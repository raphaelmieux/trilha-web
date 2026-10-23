/**
 * As contas da identidade visual: o que faz uma marca ser a mesma marca em
 * toda peça, e o que a estraga.
 *
 * ── A marca se reconhece pelo nome ───────────────────────────────────────
 * Assinatura é o símbolo junto do logotipo, e na prancha ela é um grupo que
 * carrega o texto do logotipo e pelo menos uma forma. Reconhecer pela forma
 * — comparar silhuetas — falharia justamente nos usos incorretos, que são
 * a marca deformada; reconhecer pelo id falharia em toda cópia colada, que
 * ganha id novo. O nome é o que o olho usa também.
 *
 * ── Usos incorretos são medidas, e não rótulos ───────────────────────────
 * O manual precisa ilustrar três usos incorretos, e cada um se confere pelo
 * que ele faz com a marca: o símbolo esticado muda a proporção, a cor de fora
 * não está na paleta, o fundo errado derruba o contraste, a fonte trocada
 * muda o logotipo, e o objeto encostado invade a área de proteção. Um rótulo
 * escrito "uso incorreto" embaixo de uma marca intacta não ilustra nada.
 */

import {
  achatarObjetos, caixaDe, tintasDe,
  type Arte, type Caixa, type Grupo, type Objeto, type Prancha, type Texto,
} from './design';
import { contrastRatio, hexToRgb, relativeLuminance } from '../lib/imageTools';

/* ── Achar a marca ───────────────────────────────────────────────────────── */

const normal = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const ehSimbolo = (o: Objeto) => o.tipo === 'retangulo' || o.tipo === 'elipse' || o.tipo === 'caminho';

/** O texto do logotipo dentro do grupo, se ele estiver lá. */
export function logotipoDe(g: Grupo, nome: string): Texto | null {
  return achatarObjetos(g.filhos).find((o): o is Texto => o.tipo === 'texto' && normal(o.texto) === normal(nome)) ?? null;
}

/** As formas do símbolo: tudo o que o grupo pinta e não é letra. */
export const simboloDe = (g: Grupo): Objeto[] => achatarObjetos(g.filhos).filter(ehSimbolo);

export const ehMarca = (o: Objeto, nome: string): o is Grupo =>
  o.tipo === 'grupo' && !!logotipoDe(o, nome) && simboloDe(o).length > 0;

/**
 * As marcas da prancha, as de fora primeiro: um grupo que tenha uma marca
 * dentro é uma peça, e não a marca — a assinatura num cartaz agrupado com o
 * título continua sendo a assinatura.
 */
export function marcasNa(p: Prancha, nome: string): Grupo[] {
  const achadas: Grupo[] = [];
  const procurar = (os: Objeto[]) => {
    for (const o of os) {
      if (o.tipo !== 'grupo') continue;
      const dentro = achatarObjetos(o.filhos).some(f => ehMarca(f, nome));
      if (ehMarca(o, nome) && !dentro) achadas.push(o);
      else procurar(o.filhos);
    }
  };
  procurar(p.objetos);
  return achadas;
}

/* ── Cor ─────────────────────────────────────────────────────────────────── */

const luminancia = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgb ? relativeLuminance(rgb) : 0;
};

const centro = (c: Caixa) => ({ x: c.x + c.largura / 2, y: c.y + c.altura / 2 });
const contem = (c: Caixa, x: number, y: number) => x >= c.x && x <= c.x + c.largura && y >= c.y && y <= c.y + c.altura;

/**
 * As cores que estão atrás da marca: a do que estiver mais acima na pilha e
 * contiver o centro dela, ou o fundo da prancha. É a regra de
 * `fundosDoTexto`, aplicada ao grupo — a foto devolve os dois tons, porque a
 * marca passa pelos dois.
 */
export function fundosDaMarca(p: Prancha, g: Grupo): string[] {
  const { x, y } = centro(caixaDe(g));
  const pintados = achatarObjetos(p.objetos);
  const dentro = new Set(achatarObjetos([g]).map(o => o.id));
  const indice = pintados.findIndex(o => o.id === g.id);
  for (let i = indice - 1; i >= 0; i--) {
    const o = pintados[i];
    if (dentro.has(o.id) || o.tipo === 'texto' || o.tipo === 'grupo' || o.tipo === 'referencia') continue;
    if (!contem(caixaDe(o), x, y)) continue;
    if (o.tipo === 'caminho') {
      if (!o.preenchimento) continue;
      return [o.preenchimento];
    }
    return o.tipo === 'foto' ? [...o.tons] : [o.preenchimento];
  }
  return [p.fundo];
}

/** O pior contraste entre uma tinta da marca e o que está atrás dela. */
export function contrasteDaMarca(p: Prancha, g: Grupo): number {
  const fundos = fundosDaMarca(p, g);
  return Math.min(...tintasDe(g).flatMap(t => fundos.map(f => contrastRatio(t, f))));
}

/**
 * O contraste que uma marca pede. É a régua do texto grande, e não a do
 * texto corrido: a assinatura se lê de uma vez, como um título, e pedir
 * 4,5:1 reprovaria o verde do clube sobre o branco, que é a versão colorida
 * de quase toda marca.
 */
export const CONTRASTE_DA_MARCA = 3;

export const marcaSeLe = (p: Prancha, g: Grupo) => contrasteDaMarca(p, g) >= CONTRASTE_DA_MARCA;

/* ── As três versões ─────────────────────────────────────────────────────── */

/** Colorida: duas tintas ou mais, e lida contra o fundo. */
export const ehColorida = (p: Prancha, g: Grupo) => tintasDe(g).length >= 2 && marcaSeLe(p, g);

/**
 * Monocromática: uma tinta só, e lida contra o fundo.
 *
 * Uma tinta, e não "preto": a versão de uma cor é a que vai no carimbo, na
 * gravação a laser e no fax, e qualquer cor que se leia serve. O que ela
 * prova é que a marca não depende de duas cores para existir.
 */
export const ehMonocromatica = (p: Prancha, g: Grupo) => tintasDe(g).length === 1 && marcaSeLe(p, g);

/**
 * Negativa: uma tinta só, **mais clara** que o fundo. É a marca em branco
 * sobre a cor escura — a camiseta verde, o fundo de foto à noite.
 *
 * A tinta mais clara que o fundo, e não "a tinta branca": a negativa sobre o
 * verde do clube pode sair em amarelo-claro e continua sendo negativa.
 */
export function ehNegativa(p: Prancha, g: Grupo): boolean {
  const tintas = tintasDe(g);
  if (tintas.length !== 1 || !marcaSeLe(p, g)) return false;
  return fundosDaMarca(p, g).every(f => luminancia(tintas[0]) > luminancia(f));
}

/* ── Paleta e tipografia ─────────────────────────────────────────────────── */

/** As cores da identidade: as da paleta do arquivo, em minúsculas. */
export const coresDaIdentidade = (a: Arte): string[] =>
  [...new Set(Object.values(a.paleta).filter((c): c is string => !!c).map(c => c.toLowerCase()))];

/**
 * Preto e branco valem em qualquer identidade: são as tintas da versão
 * monocromática e da negativa quando ninguém escolheu outra, e nenhum manual
 * proíbe a marca em preto num documento impresso em preto.
 */
const NEUTRAS = ['#000000', '#ffffff'];

export const tintasForaDaPaleta = (a: Arte, g: Grupo): string[] => {
  const permitidas = new Set([...coresDaIdentidade(a), ...NEUTRAS]);
  return tintasDe(g).filter(t => !permitidas.has(t));
};

/** As famílias de letra que a prancha usa, sem repetição. */
export const familiasDa = (p: Prancha) =>
  [...new Set(achatarObjetos(p.objetos).filter((o): o is Texto => o.tipo === 'texto').map(t => t.familia))];

/* ── Proporção, área de proteção e tamanho mínimo ────────────────────────── */

const caixaDasFormas = (os: Objeto[]): Caixa => {
  const cs = os.map(caixaDe);
  const x = Math.min(...cs.map(c => c.x));
  const y = Math.min(...cs.map(c => c.y));
  return { x, y, largura: Math.max(...cs.map(c => c.x + c.largura)) - x, altura: Math.max(...cs.map(c => c.y + c.altura)) - y };
};

/** Largura sobre altura do símbolo — a conta que acusa o esticado. */
export function proporcaoDoSimbolo(g: Grupo): number {
  const c = caixaDasFormas(simboloDe(g));
  return c.altura > 0 ? c.largura / c.altura : 0;
}

/**
 * Quanto a proporção pode variar antes de virar distorção. Quatro por cento
 * é o que a mão erra ao escalar puxando o canto sem segurar o Shift; menos que
 * isso o olho não acusa, e mais ele acusa.
 */
export const TOLERANCIA_DA_PROPORCAO = 0.04;

export const distorcida = (g: Grupo, mestre: Grupo) =>
  Math.abs(proporcaoDoSimbolo(g) / proporcaoDoSimbolo(mestre) - 1) > TOLERANCIA_DA_PROPORCAO;

/**
 * A área de proteção, em fração da **altura do símbolo** — que é a medida
 * que todo manual usa, porque ela acompanha a marca em qualquer tamanho.
 * Um número em pixels serviria a um tamanho só.
 */
export function areaDeProtecao(g: Grupo, fracao: number): Caixa {
  const m = caixaDasFormas(simboloDe(g)).altura * fracao;
  const c = caixaDe(g);
  return { x: c.x - m, y: c.y - m, largura: c.largura + 2 * m, altura: c.altura + 2 * m };
}

const cobre = (fora: Caixa, dentro: Caixa) =>
  fora.x <= dentro.x && fora.y <= dentro.y
  && fora.x + fora.largura >= dentro.x + dentro.largura && fora.y + fora.altura >= dentro.y + dentro.altura;

const cruza = (a: Caixa, b: Caixa) =>
  a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;

/**
 * O que invade a área de proteção: todo objeto que entra nela sem cobri-la
 * inteira. O que cobre a área toda é **fundo** — a cor da camiseta, a foto do
 * post —, e a marca pousa nele; o que entra pela metade é vizinho
 * encostado, e é isso que a área existe para impedir. A beirada da peça
 * também conta: marca encostada na borda do crachá é marca sem respiro.
 */
export function invasoes(p: Prancha, g: Grupo, fracao: number): string[] {
  const area = areaDeProtecao(g, fracao);
  const dentro = new Set(achatarObjetos([g]).map(o => o.id));
  const quem = p.objetos
    .filter(o => !dentro.has(o.id) && o.tipo !== 'referencia')
    .filter(o => cruza(caixaDe(o), area) && !cobre(caixaDe(o), area))
    .map(o => o.id);
  const naPeca = area.x >= 0 && area.y >= 0 && area.x + area.largura <= p.largura && area.y + area.altura <= p.altura;
  return naPeca ? quem : [...quem, 'borda'];
}

/**
 * A menor letra que se lê, em pixels. Abaixo de sete o desenho da letra vira
 * mancha em qualquer tela, e no papel ela some na textura do papel.
 */
export const LETRA_MINIMA = 7;
/** O menor traço de símbolo que ainda se vê inteiro: um pixel e meio. */
export const DETALHE_MINIMO = 1.5;

/**
 * A largura mínima em que a assinatura ainda funciona, medida.
 *
 * É a maior das duas contas: a largura em que o logotipo chega a sete
 * pixels, e a largura em que a parte mais fina do símbolo chega a um pixel e
 * meio. A primeira costuma mandar — letra some antes de forma —, e é por
 * isso que muita marca tem uma versão reduzida, só o símbolo, para o que é
 * menor que isso.
 */
export function larguraMinimaMedida(g: Grupo, nome: string): number {
  const logo = logotipoDe(g, nome);
  const pelaLetra = logo ? (LETRA_MINIMA / logo.corpo) * g.largura : 0;
  const finos = simboloDe(g).map(o => Math.min(o.largura, caixaDe(o).altura)).filter(v => v > 0);
  const peloDetalhe = finos.length ? (DETALHE_MINIMO / Math.min(...finos)) * g.largura : 0;
  return Math.ceil(Math.max(pelaLetra, peloDetalhe));
}

/**
 * O tamanho mínimo declarado é honesto quando não fica abaixo do medido — aí
 * ele permitiria uma marca ilegível — nem passa do dobro dele: um mínimo
 * folgado demais proíbe a marca no crachá e no ícone, onde ela cabia.
 */
export const minimoHonesto = (declarado: number, medido: number) => declarado >= medido && declarado <= 2 * medido;

/* ── Os usos incorretos ──────────────────────────────────────────────────── */

export type Defeito = 'distorcida' | 'cor-fora' | 'sem-contraste' | 'fonte-trocada' | 'sem-protecao';

export const NOME_DO_DEFEITO: Record<Defeito, string> = {
  'distorcida': 'Símbolo esticado ou achatado',
  'cor-fora': 'Cor fora da paleta',
  'sem-contraste': 'Fundo que não deixa ler',
  'fonte-trocada': 'Logotipo em outra letra',
  'sem-protecao': 'Vizinho dentro da área de proteção',
};

export interface Regras {
  nome: string;
  mestre: Grupo;
  protecao: number;
}

/**
 * O que está errado nesta aplicação da marca, medido contra a assinatura mestra.
 *
 * `vizinhasPermitidas` são ids que não contam como invasão: na página de usos
 * incorretos de um manual as marcas ficam lado a lado, e cada uma invadiria a
 * área da outra — todo exemplo ganharia de graça o defeito da proteção, e
 * três ilustrações valeriam por quatro defeitos sem ninguém ter ilustrado o
 * quarto.
 */
export function defeitosDe(a: Arte, p: Prancha, g: Grupo, r: Regras, vizinhasPermitidas: string[] = []): Defeito[] {
  const d: Defeito[] = [];
  if (distorcida(g, r.mestre)) d.push('distorcida');
  if (tintasForaDaPaleta(a, g).length > 0) d.push('cor-fora');
  if (!marcaSeLe(p, g)) d.push('sem-contraste');
  const logo = logotipoDe(g, r.nome);
  const doMestre = logotipoDe(r.mestre, r.nome);
  if (logo && doMestre && logo.familia !== doMestre.familia) d.push('fonte-trocada');
  if (invasoes(p, g, r.protecao).some(id => !vizinhasPermitidas.includes(id))) d.push('sem-protecao');
  return d;
}
