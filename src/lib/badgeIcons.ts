import type { Badge } from '../types';

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
const ICON_SHAPES: Record<string, string> = {
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
};

/**
 * Tier colours as literals.
 *
 * The app's rule is to read colours from CSS custom properties, and the on-screen
 * badge does. Canvas and PDF have no access to the cascade, so the value has to
 * exist as a number somewhere; keeping the single copy here — and having the
 * component import it — is better than letting a hex in a PDF drift away from a
 * variable in a stylesheet. Gold is --color-secondary.
 */
export const TIER_COLORS: Record<Badge['tier'], string> = {
  bronze: '#c17f45',
  silver: '#b0b0b4',
  gold: '#F5A623',
};

export const TIER_LABELS: Record<Badge['tier'], string> = {
  bronze: 'bronze',
  silver: 'prata',
  gold: 'ouro',
};

/** Falls back to the award medal for a badge whose icon name is unknown. */
export function iconShape(name: string): string {
  return ICON_SHAPES[name] ?? ICON_SHAPES.award;
}

export function hasIcon(name: string): boolean {
  return name in ICON_SHAPES;
}

/**
 * Builds the icon as a standalone SVG document: a filled disc in the tier colour
 * at low opacity, a ring, and the glyph stroked on top — the same composition
 * the on-screen badge uses.
 */
export function badgeIconSvg(icon: string, tier: Badge['tier']): string {
  const colour = TIER_COLORS[tier];
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96">',
    `<circle cx="12" cy="12" r="11.4" fill="${colour}" fill-opacity="0.16" stroke="${colour}" stroke-opacity="0.45" stroke-width="0.8"/>`,
    `<g transform="translate(12 12) scale(0.62) translate(-12 -12)"`,
    ` fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
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
