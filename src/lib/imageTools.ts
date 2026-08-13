/**
 * Image handling for the ImageLab.
 *
 * Requirement AP035-4.1 is practical — "JPEG, PNG, botões e header" — but the lab
 * used to be four multiple-choice questions in which no image was ever produced or
 * even opened. These helpers let the student resize a real file, export it as both
 * JPEG and PNG, and compare the actual byte counts, which is the only way the
 * format trade-off becomes concrete rather than memorised.
 *
 * Everything runs in the browser. The images are pictures of children at club
 * events, so nothing is uploaded anywhere: the file goes from the file input to a
 * canvas and back out as a download.
 */

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Scales an image down to fit `maxWidth`, preserving aspect ratio. Images are
 * never scaled up: enlarging a small photo adds bytes without adding detail.
 */
export function calculateResize(width: number, height: number, maxWidth: number): Dimensions {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  if (width <= maxWidth) return { width, height };
  const ratio = maxWidth / width;
  return { width: maxWidth, height: Math.max(1, Math.round(height * ratio)) };
}

/** Human-readable file size. Web budgets are discussed in KB, so KB is the floor. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export type ImageFormat = 'jpeg' | 'png';

/**
 * Which format the student *should* pick, and why. Transparency is decisive:
 * JPEG cannot store an alpha channel at all, so a logo exported as JPEG comes
 * back with a solid box behind it regardless of file size.
 */
export function recommendFormat(hasAlpha: boolean, jpegBytes: number, pngBytes: number): {
  format: ImageFormat;
  reason: string;
} {
  if (hasAlpha) {
    return {
      format: 'png',
      reason: 'A imagem tem áreas transparentes. JPEG não guarda transparência — ela viraria um fundo sólido.',
    };
  }
  if (jpegBytes < pngBytes) {
    const saved = Math.round((1 - jpegBytes / pngBytes) * 100);
    return {
      format: 'jpeg',
      reason: `Sem transparência e com muitas cores, o JPEG ficou ${saved}% menor que o PNG — a página carrega mais rápido.`,
    };
  }
  return {
    format: 'png',
    reason: 'Nesta imagem, com poucas cores e áreas chapadas, o PNG ficou menor e ainda não perde qualidade.',
  };
}

/* ── Colour, for the button and header stages ────────────────────────────── */

export interface Rgb { r: number; g: number; b: number }

/** Parses "#rgb" or "#rrggbb". Returns null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, '');
  const full = value.length === 3
    ? value.split('').map(c => c + c).join('')
    : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast between two colours, 1 (identical) to 21 (black on white).
 *
 * This is the check that makes the button and header stages real work rather
 * than colour-picking: a student can produce a button that looks fine on their
 * bright phone and is unreadable on a projector at club. WCAG AA asks 4.5:1 for
 * normal text and 3:1 for large text, which is the bar used here.
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return 1;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/** Loads a user-selected file into an <img>, via an object URL that is revoked after. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível abrir a imagem.')); };
    img.src = url;
  });
}

/**
 * Accepts a canvas as well as an <img>: the sample photograph is drawn rather
 * than loaded from a file, and it has to travel through the same resize path as
 * a student's own picture or the comparison would not be honest.
 */
export type ImageSource = HTMLImageElement | HTMLCanvasElement;

/** Intrinsic pixel size of either source. */
export function sourceSize(src: ImageSource): Dimensions {
  return src instanceof HTMLCanvasElement
    ? { width: src.width, height: src.height }
    : { width: src.naturalWidth, height: src.naturalHeight };
}

export function drawResized(img: ImageSource, dims: Dimensions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, dims.width, dims.height);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Falha ao exportar a imagem.')),
      `image/${format}`,
      format === 'jpeg' ? quality : undefined,
    );
  });
}

/** True if any pixel is not fully opaque. Sampled, since a full scan of a large canvas is slow. */
export function hasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 100));
  for (let y = 0; y < height; y += step) {
    const row = ctx.getImageData(0, y, width, 1).data;
    for (let x = 3; x < row.length; x += 4 * step) {
      if (row[x] < 255) return true;
    }
  }
  return false;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * A stand-in photograph, for students who have no picture at hand.
 *
 * Not decoration: the JPEG-versus-PNG comparison only means anything on a
 * continuous-tone image, so this draws smooth sky and hill gradients plus grain
 * — thousands of distinct colours and no flat areas, exactly the case PNG
 * compresses badly and JPEG compresses well. A flat illustration would have
 * taught the opposite lesson.
 */
export function drawSamplePhoto(width = 1600, height = 1067): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
  sky.addColorStop(0, '#12224d');
  sky.addColorStop(0.45, '#8e4a63');
  sky.addColorStop(0.78, '#e08a4a');
  sky.addColorStop(1, '#f7d08a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Sun, with a soft halo — a radial gradient nothing can quantise cheaply.
  const sunX = width * 0.68;
  const sunY = height * 0.6;
  const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.28);
  halo.addColorStop(0, 'rgba(255, 244, 214, 0.95)');
  halo.addColorStop(0.18, 'rgba(255, 214, 150, 0.55)');
  halo.addColorStop(1, 'rgba(255, 190, 120, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  // Receding hills: each one lighter and hazier than the last.
  const hills: [number, string][] = [
    [0.62, '#5d4463'], [0.71, '#42324e'], [0.82, '#2a2038'], [0.93, '#161226'],
  ];
  for (const [base, colour] of hills) {
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * base);
    for (let x = 0; x <= width; x += width / 60) {
      const wave = Math.sin(x / (width / 6) + base * 9) * height * 0.035
        + Math.sin(x / (width / 17) + base * 3) * height * 0.018;
      ctx.lineTo(x, height * base + wave);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
  }

  // Grain. Real photographs carry sensor noise, and it is the main reason a
  // photo saved as PNG balloons: lossless compression has to store every speck.
  const grain = ctx.getImageData(0, 0, width, height);
  const px = grain.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    px[i] = Math.max(0, Math.min(255, px[i] + n));
    px[i + 1] = Math.max(0, Math.min(255, px[i + 1] + n));
    px[i + 2] = Math.max(0, Math.min(255, px[i + 2] + n));
  }
  ctx.putImageData(grain, 0, 0);
  return canvas;
}

export type LogoShape = 'circulo' | 'escudo' | 'hexagono';

/**
 * Draws an emblem on a transparent canvas.
 *
 * The background is deliberately left empty. Exported as PNG the shape floats
 * over whatever is behind it; exported as JPEG the same drawing comes back
 * sitting in a black rectangle, because JPEG has no alpha channel and the
 * undefined pixels collapse to zero. That side-by-side is the lesson.
 */
export function drawLogo(opts: {
  text: string; shape: LogoShape; fill: string; fg: string; size?: number;
}): HTMLCanvasElement {
  const { text, shape, fill, fg, size = 512 } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const r = size * 0.44;

  ctx.beginPath();
  if (shape === 'circulo') {
    ctx.arc(c, c, r, 0, Math.PI * 2);
  } else if (shape === 'hexagono') {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const x = c + r * Math.cos(a);
      const y = c + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    const top = c - r;
    const bottom = c + r;
    ctx.moveTo(c - r * 0.82, top + r * 0.12);
    ctx.lineTo(c + r * 0.82, top + r * 0.12);
    ctx.lineTo(c + r * 0.82, c + r * 0.28);
    ctx.quadraticCurveTo(c + r * 0.7, bottom, c, bottom);
    ctx.quadraticCurveTo(c - r * 0.7, bottom, c - r * 0.82, c + r * 0.28);
    ctx.closePath();
  }
  ctx.fillStyle = fill;
  ctx.fill();

  const label = text.trim().toUpperCase();
  if (label) {
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shrink to fit: three initials must not spill past the shape's edge.
    let fontSize = size * (label.length <= 2 ? 0.38 : label.length <= 4 ? 0.26 : 0.17);
    ctx.font = `bold ${Math.round(fontSize)}px Helvetica, Arial, sans-serif`;
    const maxWidth = r * 1.4;
    while (ctx.measureText(label).width > maxWidth && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `bold ${Math.round(fontSize)}px Helvetica, Arial, sans-serif`;
    }
    ctx.fillText(label, c, c + (shape === 'escudo' ? -size * 0.02 : 0));
  }
  return canvas;
}

/** Draws a web button with transparent corners, so PNG vs JPEG has a visible consequence. */
export function drawButton(opts: {
  label: string; width: number; height: number;
  bg: string; fg: string; radius: number;
}): HTMLCanvasElement {
  const { label, width, height, bg, fg, radius } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.beginPath();
  const r = Math.min(radius, height / 2);
  ctx.moveTo(r, 0);
  ctx.arcTo(width, 0, width, height, r);
  ctx.arcTo(width, height, 0, height, r);
  ctx.arcTo(0, height, 0, 0, r);
  ctx.arcTo(0, 0, width, 0, r);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.fillStyle = fg;
  ctx.font = `bold ${Math.round(height * 0.36)}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, width / 2, height / 2 + 1);
  return canvas;
}

/** Draws a site header/banner at a fixed aspect ratio. */
export function drawHeader(opts: {
  title: string; subtitle: string; width: number; height: number;
  from: string; to: string; fg: string;
}): HTMLCanvasElement {
  const { title, subtitle, width, height, from, to, fg } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(height * 0.26)}px Helvetica, Arial, sans-serif`;
  ctx.fillText(title, width / 2, height * 0.42);
  ctx.font = `${Math.round(height * 0.13)}px Helvetica, Arial, sans-serif`;
  ctx.globalAlpha = 0.9;
  ctx.fillText(subtitle, width / 2, height * 0.66);
  return canvas;
}
