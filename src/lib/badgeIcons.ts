import type { Badge } from '../types';
import { CLASSES, NIVEIS_DA_INSIGNIA } from './nivelDaInsignia';
import {
  ALTURA, LARGURA, formaDaClasse, encaixeDoGlifo, corDoGlifo,
} from './formaDaInsignia';

/**
 * Badge icons as drawable artwork.
 *
 * The report is generated with jsPDF, which draws text and images — it cannot
 * mount a React component, so the lucide icons the app shows on screen are
 * unavailable to it. Rather than describe the badges in words and drop the
 * artwork, the icon geometry is kept here and rasterised through a canvas, so
 * the printed report carries the same symbols the student earned.
 *
 * The path data is lucide-react v0.400.0 (ISC licence), copied verbatim from the
 * package so the two renderings cannot drift apart in shape.
 */

/** SVG child elements for each icon, in a 24×24 viewBox. */
export const ICON_SHAPES: Record<string, string> = {
  footprints: [
    '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>',
    '<path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>',
    '<path d="M16 17h4"/>',
    '<path d="M4 13h4"/>',
  ].join(''),
  layers: [
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>',
    '<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>',
    '<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  ].join(''),
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  trophy: [
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>',
    '<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>',
    '<path d="M4 22h16"/>',
    '<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>',
    '<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>',
    '<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  ].join(''),
  star:
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  award: [
    '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>',
    '<circle cx="12" cy="8" r="6"/>',
  ].join(''),
  /*
    Estes dois são os mesmos de `MarcaDaLicao`, e o nome deles diz isso.

    A insígnia de laboratório vinha com o `Beaker` — a proveta reta — enquanto
    o módulo de laboratório é marcado pelo `FlaskConical`, o erlenmeyer. Dois
    desenhos para a mesma coisa, e nada dizia qual valia: quem via a insígnia
    na estante não a ligava ao módulo que a rendeu. O mesmo vale para a lição,
    que não tinha desenho nenhum e usava a pilha de camadas dos módulos.

    Por isso o nome aqui é `lab` e `theory`, e não `flask` e `book`: o que se
    escolhe é "o ícone do laboratório", e o desenho vem atrás. Trocar o desenho
    de um dos lados um dia é trocar nos dois.
  */
  lab: [
    '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>',
    '<path d="M6.453 15h11.094"/>',
    '<path d="M8.5 2h7"/>',
  ].join(''),
  theory: [
    '<path d="M12 5v16"/>',
    '<path d="M20.001 19A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2z"/>',
  ].join(''),
  clock: ['<circle cx="12" cy="12" r="10"/>','<polyline points="12 6 12 12 16 14"/>'].join(''),
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  calendar: ['<path d="M8 2v4"/>','<path d="M16 2v4"/>','<rect width="18" height="18" x="3" y="4" rx="2"/>','<path d="M3 10h18"/>'].join(''),
  /*
    Os três últimos chegaram com as sete classes: cada família de conquista
    passou a ter escada própria, e Avaliações, Nota máxima e Veredas estavam
    pegando emprestado o troféu, a estrela e as pegadas — duas colisões na
    mesma estante. Saíram do mesmo lucide que os outros onze, e não de desenho
    novo: um traço de outra mão ao lado de onze do mesmo autor destoa, e
    destoa de um jeito que só se percebe com a estante montada.
  */
  exam: [
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>',
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    '<path d="m9 14 2 2 4-4"/>',
  ].join(''),
  bullseye: [
    '<circle cx="12" cy="12" r="10"/>',
    '<circle cx="12" cy="12" r="6"/>',
    '<circle cx="12" cy="12" r="2"/>',
  ].join(''),
  route: [
    '<circle cx="6" cy="19" r="3"/>',
    '<path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>',
    '<circle cx="18" cy="5" r="3"/>',
  ].join(''),
};

/*
  Quanto de raio a tinta de cada desenho de fato ocupa, na caixa de 24.

  Os catorze variam de 10,00 a 12,81 — 28% —, então escalar todos pelo mesmo
  fator os deixa com tamanhos visivelmente diferentes dentro da insígnia. Cada
  um é normalizado por este número até o raio comum, e é isso que faz "o mesmo
  tamanho em cada insígnia" ser verdade na tela e não só na fórmula.

  Os valores saem de amostrar cada traçado ponto a ponto e medir o mais
  distante do centro — `formaDaInsignia.test.ts` refaz a conta e reprova se um
  ícone for trocado sem o número acompanhar.
*/
export const RAIO_DA_TINTA: Record<string, number> = {
  award: 11.01,
  bullseye: 10.00,
  calendar: 12.63,
  clock: 10.00,
  exam: 12.00,
  flame: 10.00,
  footprints: 12.00,
  lab: 12.00,
  layers: 11.49,
  route: 12.22,
  star: 10.93,
  theory: 12.63,
  trophy: 12.81,
  zap: 10.11,
};

/*
  A cor e o nome de cada classe moram em `nivelDaInsignia.ts`, que não sabe
  desenhar nada — é TypeScript puro, como `marca.ts`, porque quem desenha no
  papel é o jsPDF e ele não lê folha de estilo. Reexportados aqui para quem já
  importava daqui.
*/
export const TIER_COLORS: Record<Badge['tier'], string> =
  Object.fromEntries(
    NIVEIS_DA_INSIGNIA.map(n => [n, CLASSES[n].cor]),
  ) as Record<Badge['tier'], string>;

export const TIER_LABELS: Record<Badge['tier'], string> =
  Object.fromEntries(
    NIVEIS_DA_INSIGNIA.map(n => [n, CLASSES[n].nome]),
  ) as Record<Badge['tier'], string>;

/*
  Os nomes que o banco ainda pode trazer, e o que eles querem dizer hoje.

  A coluna `badges.icon` é semeada por migration, e a migration sai no mesmo
  push que o frontend — em paralelo, não em ordem. Durante essa janela a tela
  nova recebe o nome velho, e sem esta tabela a insígnia de laboratório cairia
  na medalha genérica bem no dia da mudança. Vale também para o banco de quem
  restaurou um dump antigo.
*/
const APELIDOS: Record<string, string> = {
  beaker: 'lab',
  book: 'theory',
};

/** O nome de hoje para um ícone, seja qual for o nome com que ele chegou. */
export function iconeCanonico(nome: string): string {
  return APELIDOS[nome] ?? nome;
}

/** Falls back to the award medal for a badge whose icon name is unknown. */
export function iconShape(name: string): string {
  return ICON_SHAPES[iconeCanonico(name)] ?? ICON_SHAPES.award;
}

export function hasIcon(name: string): boolean {
  return iconeCanonico(name) in ICON_SHAPES;
}

/**
 * Builds the icon as a standalone SVG document: a filled disc in the tier colour
 * at low opacity, a ring, and the glyph stroked on top — the same composition
 * the on-screen badge uses.
 */
export function badgeIconSvg(icon: string, tier: Badge['tier']): string {
  const cor = CLASSES[tier].cor;
  const forma = formaDaClasse(tier);
  const encaixe = encaixeDoGlifo(forma, RAIO_DA_TINTA[iconeCanonico(icon)] ?? 12);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}"`,
    ` width="${Math.round((96 * LARGURA) / ALTURA)}" height="96">`,
    `<polygon points="${forma.pontos}" fill="${cor}"/>`,
    `<g transform="${encaixe.transform}" fill="none" stroke="${corDoGlifo(cor)}"`,
    ` stroke-width="${encaixe.traco.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">`,
    iconShape(icon),
    '</g></svg>',
  ].join('');
}

/**
 * Rasterises the icon to a PNG data URL for jsPDF.
 *
 * Goes through a blob URL rather than a base64 `data:` URI: an inline SVG data
 * URI has to be percent-encoded, and the path data here contains characters that
 * silently break the image load when they are not.
 */
export function renderBadgeIconPng(icon: string, tier: Badge['tier'], size = 96): Promise<string> {
  const svg = badgeIconSvg(icon, tier);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Não foi possível desenhar o ícone da conquista "${icon}".`));
    };
    image.src = url;
  });
}
