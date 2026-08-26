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

/* ── Web-safe colours (AP035-5.2) ─────────────────────────────────────────
 *
 * The requirement asks the student to know web-safe colours "and when to use
 * them", which deserves an honest answer rather than a rule to obey. The 216
 * colours were a workaround for displays that could only show 256 at once: a
 * colour outside the set was dithered into a speckled approximation, and the
 * set was the intersection of the Windows and Mac system palettes. No screen
 * sold today has that limit.
 *
 * What survives is the reason behind it. GIF and indexed PNG still store a
 * palette, and a smaller palette means a smaller file — which is exactly the
 * budget the same requirement imposes. Snapping to six values per channel is
 * the crudest version of that idea, and it is why the lab uses it here.
 */
const WEB_SAFE_STEPS = [0x00, 0x33, 0x66, 0x99, 0xcc, 0xff];

export function isWebSafe(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return [rgb.r, rgb.g, rgb.b].every(channel => WEB_SAFE_STEPS.includes(channel));
}

/** Snaps each channel to the nearest of the six web-safe values. */
export function nearestWebSafe(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const snap = (channel: number) => WEB_SAFE_STEPS.reduce(
    (best, step) => Math.abs(step - channel) < Math.abs(best - channel) ? step : best,
  );
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(channel => snap(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
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

/* ── O material de desenho: formas, símbolos e fontes ─────────────────────
 *
 * Um logo de clube não é uma sigla dentro de um círculo. É uma figura — o
 * pinheiro, a fogueira, o Cruzeiro do Sul — e é ela que a pessoa reconhece de
 * longe. Sem esse repertório aqui, o laboratório vira escolha de cor, e o
 * desbravador sai sem ter desenhado nada.
 *
 * Tudo é caminho de canvas, não imagem: assim a figura acompanha a cor
 * escolhida, cresce sem borrar e não acrescenta um único byte de download.
 */

export type LogoShape = 'circulo' | 'escudo' | 'hexagono' | 'losango' | 'estrela' | 'quadrado';

export const NOME_DA_FORMA: Record<LogoShape, string> = {
  escudo: 'Escudo', circulo: 'Círculo', hexagono: 'Hexágono',
  losango: 'Losango', estrela: 'Estrela', quadrado: 'Quadrado',
};

export type Simbolo =
  | 'nenhum' | 'arvore' | 'montanha' | 'chama' | 'bussola' | 'barraca'
  | 'pegada' | 'aguia' | 'lobo' | 'cruzeiro' | 'ursa';

export const NOME_DO_SIMBOLO: Record<Simbolo, string> = {
  nenhum: 'Sem figura', arvore: 'Pinheiro', montanha: 'Montanha', chama: 'Fogueira',
  bussola: 'Bússola', barraca: 'Barraca', pegada: 'Pegada', aguia: 'Águia',
  lobo: 'Lobo', cruzeiro: 'Cruzeiro do Sul', ursa: 'Ursa Maior',
};

export type FonteDeDesenho =
  | 'sem-serifa' | 'serifada' | 'estreita' | 'pesada' | 'monoespacada' | 'redonda';

/**
 * Pilhas de fonte, não fontes.
 *
 * Nada aqui é baixado: são as famílias que já existem em Windows, Mac, Android
 * e Linux, cada uma com substituta ao lado. Uma fonte que o navegador não tem
 * não avisa — ele desenha com outra, e o logo que a pessoa baixou fica
 * diferente do que ela viu. Por isso cada pilha termina numa família genérica.
 */
export const PILHA_DA_FONTE: Record<FonteDeDesenho, string> = {
  'sem-serifa': 'Helvetica, Arial, sans-serif',
  serifada: 'Georgia, "Times New Roman", serif',
  estreita: '"Arial Narrow", "Liberation Sans Narrow", Arial, sans-serif',
  pesada: 'Impact, "Arial Black", Haettenschweiler, sans-serif',
  monoespacada: '"Courier New", Courier, monospace',
  redonda: '"Trebuchet MS", Verdana, Geneva, sans-serif',
};

export const NOME_DA_FONTE: Record<FonteDeDesenho, string> = {
  'sem-serifa': 'Sem serifa', serifada: 'Serifada', estreita: 'Estreita',
  pesada: 'Pesada', monoespacada: 'Monoespaçada', redonda: 'Arredondada',
};

/** Caminho de uma estrela de n pontas, usado na forma e nas constelações. */
function caminhoDeEstrela(
  ctx: CanvasRenderingContext2D, cx: number, cy: number,
  raio: number, pontas = 5, interno = 0.42,
): void {
  ctx.beginPath();
  for (let i = 0; i < pontas * 2; i++) {
    const r = i % 2 === 0 ? raio : raio * interno;
    const a = (Math.PI / pontas) * i - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Desenha uma figura centrada em (cx, cy), dentro de uma caixa de `tamanho`.
 *
 * As coordenadas de cada figura são frações de meia-caixa — de -1 a 1 nos dois
 * eixos —, então a mesma figura serve ao logo de 128 px e ao header de 1600.
 */
export function desenharSimbolo(
  ctx: CanvasRenderingContext2D, simbolo: Simbolo,
  cx: number, cy: number, tamanho: number, cor: string,
): void {
  if (simbolo === 'nenhum') return;
  const u = tamanho / 2;
  const x = (f: number) => cx + f * u;
  const y = (f: number) => cy + f * u;

  ctx.save();
  ctx.fillStyle = cor;
  ctx.strokeStyle = cor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (simbolo === 'arvore') {
    ctx.beginPath();
    ctx.moveTo(x(0), y(-0.98));
    ctx.lineTo(x(0.44), y(-0.3)); ctx.lineTo(x(0.2), y(-0.3));
    ctx.lineTo(x(0.62), y(0.18)); ctx.lineTo(x(0.3), y(0.18));
    ctx.lineTo(x(0.78), y(0.62)); ctx.lineTo(x(-0.78), y(0.62));
    ctx.lineTo(x(-0.3), y(0.18)); ctx.lineTo(x(-0.62), y(0.18));
    ctx.lineTo(x(-0.2), y(-0.3)); ctx.lineTo(x(-0.44), y(-0.3));
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x(-0.11), y(0.62), u * 0.22, u * 0.36);
  } else if (simbolo === 'montanha') {
    ctx.beginPath();
    ctx.moveTo(x(-1), y(0.68));
    ctx.lineTo(x(-0.32), y(-0.56));
    ctx.lineTo(x(-0.02), y(-0.02));
    ctx.lineTo(x(0.26), y(-0.34));
    ctx.lineTo(x(1), y(0.68));
    ctx.closePath();
    ctx.fill();
  } else if (simbolo === 'chama') {
    ctx.beginPath();
    ctx.moveTo(x(0), y(-0.96));
    ctx.bezierCurveTo(x(0.64), y(-0.32), x(0.54), y(0.1), x(0.22), y(0.4));
    ctx.bezierCurveTo(x(0.36), y(0.02), x(0.12), y(-0.12), x(0.05), y(-0.36));
    ctx.bezierCurveTo(x(-0.05), y(-0.06), x(-0.5), y(-0.06), x(-0.32), y(0.4));
    ctx.bezierCurveTo(x(-0.64), y(0.08), x(-0.44), y(-0.34), x(0), y(-0.96));
    ctx.closePath();
    ctx.fill();
    // As achas cruzadas: é o que separa fogueira de gota d'água virada.
    ctx.lineWidth = u * 0.15;
    ctx.beginPath(); ctx.moveTo(x(-0.82), y(0.88)); ctx.lineTo(x(0.82), y(0.56)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x(-0.82), y(0.56)); ctx.lineTo(x(0.82), y(0.88)); ctx.stroke();
  } else if (simbolo === 'bussola') {
    ctx.lineWidth = u * 0.13;
    ctx.beginPath(); ctx.arc(cx, cy, u * 0.9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x(0), y(-0.62)); ctx.lineTo(x(0.26), y(0.08)); ctx.lineTo(x(-0.26), y(0.08));
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(x(0), y(0.62)); ctx.lineTo(x(0.26), y(-0.08)); ctx.lineTo(x(-0.26), y(-0.08));
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (simbolo === 'barraca') {
    // Um vértice só, com a porta recortada de baixo: separar as duas abas no
    // alto faz a figura virar duas velas de barco.
    ctx.beginPath();
    ctx.moveTo(x(0), y(-0.88));
    ctx.lineTo(x(0.98), y(0.58));
    ctx.lineTo(x(0.3), y(0.58));
    ctx.lineTo(x(0), y(-0.08));
    ctx.lineTo(x(-0.3), y(0.58));
    ctx.lineTo(x(-0.98), y(0.58));
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = u * 0.1;
    ctx.beginPath(); ctx.moveTo(x(-1), y(0.82)); ctx.lineTo(x(1), y(0.82)); ctx.stroke();
  } else if (simbolo === 'pegada') {
    ctx.beginPath();
    ctx.ellipse(x(0), y(0.44), u * 0.56, u * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    const dedos: [number, number, number, number, number][] = [
      [-0.68, -0.16, 0.2, 0.29, -0.38],
      [-0.25, -0.62, 0.2, 0.29, -0.13],
      [0.25, -0.62, 0.2, 0.29, 0.13],
      [0.68, -0.16, 0.2, 0.29, 0.38],
    ];
    for (const [fx, fy, rx, ry, giro] of dedos) {
      ctx.beginPath();
      ctx.ellipse(x(fx), y(fy), u * rx, u * ry, giro, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (simbolo === 'aguia') {
    // Cabeça acima da linha das asas, e cauda abaixo dela. Sem essas duas
    // saliências a silhueta fecha num arco e a ave vira morcego.
    for (const lado of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x(lado * 0.06), y(-0.3));
      ctx.bezierCurveTo(x(lado * 0.45), y(-0.96), x(lado * 0.86), y(-0.92), x(lado * 0.99), y(-0.64));
      ctx.bezierCurveTo(x(lado * 0.78), y(-0.58), x(lado * 0.6), y(-0.32), x(lado * 0.5), y(0));
      ctx.bezierCurveTo(x(lado * 0.38), y(-0.26), x(lado * 0.24), y(-0.3), x(lado * 0.06), y(-0.12));
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(x(-0.12), y(-0.36));
    ctx.lineTo(x(0.12), y(-0.36));
    ctx.lineTo(x(0.15), y(0.3));
    ctx.lineTo(x(0), y(0.64));
    ctx.lineTo(x(-0.15), y(0.3));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.arc(x(0), y(-0.5), u * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x(0.11), y(-0.59)); ctx.lineTo(x(0.4), y(-0.49)); ctx.lineTo(x(0.11), y(-0.39));
    ctx.closePath(); ctx.fill();
  } else if (simbolo === 'lobo') {
    ctx.beginPath();
    ctx.moveTo(x(-0.66), y(-0.92));
    ctx.lineTo(x(-0.36), y(-0.26));
    ctx.lineTo(x(0.36), y(-0.26));
    ctx.lineTo(x(0.66), y(-0.92));
    ctx.lineTo(x(0.76), y(-0.06));
    ctx.lineTo(x(0.46), y(0.4));
    ctx.lineTo(x(0.14), y(0.56));
    ctx.lineTo(x(0.04), y(0.96));
    ctx.lineTo(x(-0.22), y(0.58));
    ctx.lineTo(x(-0.5), y(0.36));
    ctx.lineTo(x(-0.76), y(-0.06));
    ctx.closePath();
    ctx.fill();
  } else if (simbolo === 'cruzeiro' || simbolo === 'ursa') {
    // Constelações: as ligações primeiro, mais apagadas, e as estrelas por cima.
    // No céu não há linha nenhuma — ela é o desenho que a gente põe para achar.
    const estrelas: [number, number, number][] = simbolo === 'cruzeiro'
      ? [[0.08, -0.9, 0.17], [-0.08, 0.9, 0.21], [-0.78, 0.1, 0.18],
        [0.74, -0.04, 0.15], [-0.3, 0.42, 0.09]]
      : [[-0.9, -0.34, 0.15], [-0.86, 0.3, 0.14], [-0.34, 0.44, 0.13],
        [-0.28, -0.02, 0.11], [0.16, -0.16, 0.14], [0.56, -0.06, 0.13],
        [0.96, -0.46, 0.15]];
    const ligacoes: number[][] = simbolo === 'cruzeiro'
      ? [[0, 1], [2, 3]]
      : [[0, 1, 2, 3, 0], [3, 4, 5, 6]];
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = u * 0.045;
    for (const caminho of ligacoes) {
      ctx.beginPath();
      caminho.forEach((i, passo) => {
        const [fx, fy] = estrelas[i];
        if (passo === 0) ctx.moveTo(x(fx), y(fy)); else ctx.lineTo(x(fx), y(fy));
      });
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const [fx, fy, r] of estrelas) {
      caminhoDeEstrela(ctx, x(fx), y(fy), u * r);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Encolhe a fonte até o texto caber em `maxLargura`. Devolve o tamanho usado. */
function ajustarFonte(
  ctx: CanvasRenderingContext2D, texto: string,
  inicial: number, maxLargura: number, pilha: string, peso = 'bold',
): number {
  let corpo = inicial;
  ctx.font = `${peso} ${Math.round(corpo)}px ${pilha}`;
  while (ctx.measureText(texto).width > maxLargura && corpo > 8) {
    corpo -= 2;
    ctx.font = `${peso} ${Math.round(corpo)}px ${pilha}`;
  }
  return corpo;
}

/**
 * Draws an emblem on a transparent canvas.
 *
 * The background is deliberately left empty by default. Exported as PNG the shape
 * floats over whatever is behind it; flattened onto white — the `background`
 * option — the same drawing comes back sitting in a box, which is exactly what
 * happens to a logo saved as JPEG. That side-by-side is the lesson, and it only
 * works if the student can produce the wrong one on purpose.
 */
export function drawLogo(opts: {
  text: string; shape: LogoShape; fill: string; fg: string; size?: number;
  symbol?: Simbolo; font?: FonteDeDesenho; background?: 'transparente' | 'branco';
}): HTMLCanvasElement {
  const {
    text, shape, fill, fg, size = 512,
    symbol = 'nenhum', font = 'sem-serifa', background = 'transparente',
  } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const r = size * 0.44;

  if (background === 'branco') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
  }

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
  } else if (shape === 'losango') {
    ctx.moveTo(c, c - r);
    ctx.lineTo(c + r * 0.86, c);
    ctx.lineTo(c, c + r);
    ctx.lineTo(c - r * 0.86, c);
    ctx.closePath();
  } else if (shape === 'estrela') {
    caminhoDeEstrela(ctx, c, c, r, 5, 0.5);
  } else if (shape === 'quadrado') {
    const lado = r * 1.78;
    const canto = lado * 0.2;
    const e = c - lado / 2;
    const d = c + lado / 2;
    ctx.moveTo(e + canto, e);
    ctx.arcTo(d, e, d, d, canto);
    ctx.arcTo(d, d, e, d, canto);
    ctx.arcTo(e, d, e, e, canto);
    ctx.arcTo(e, e, d, e, canto);
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
  const pilha = PILHA_DA_FONTE[font];
  const desvio = shape === 'escudo' ? -size * 0.03 : 0;
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (symbol !== 'nenhum' && label) {
    // Figura em cima, nome embaixo: a ordem de qualquer emblema de clube.
    desenharSimbolo(ctx, symbol, c, c - size * 0.13 + desvio, size * 0.42, fg);
    ajustarFonte(ctx, label, size * 0.15, r * 1.36, pilha);
    ctx.fillText(label, c, c + size * 0.24 + desvio);
  } else if (symbol !== 'nenhum') {
    desenharSimbolo(ctx, symbol, c, c + desvio, size * 0.62, fg);
  } else if (label) {
    // Encolhe para caber: três iniciais não podem transbordar a forma.
    const inicial = size * (label.length <= 2 ? 0.38 : label.length <= 4 ? 0.26 : 0.17);
    ajustarFonte(ctx, label, inicial, r * 1.4, pilha);
    ctx.fillText(label, c, c + desvio);
  }
  return canvas;
}

/** Draws a web button with transparent corners, so PNG vs JPEG has a visible consequence. */
export function drawButton(opts: {
  label: string; width: number; height: number;
  bg: string; fg: string; radius: number; font?: FonteDeDesenho;
}): HTMLCanvasElement {
  const { label, width, height, bg, fg, radius, font = 'sem-serifa' } = opts;
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
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ajustarFonte(ctx, label, height * 0.36, width - height * 0.6, PILHA_DA_FONTE[font]);
  ctx.fillText(label, width / 2, height / 2 + 1);
  return canvas;
}

/** Draws a site header/banner at a fixed aspect ratio. */
export function drawHeader(opts: {
  title: string; subtitle: string; width: number; height: number;
  from: string; to: string; fg: string;
  symbol?: Simbolo; font?: FonteDeDesenho;
}): HTMLCanvasElement {
  const {
    title, subtitle, width, height, from, to, fg,
    symbol = 'nenhum', font = 'sem-serifa',
  } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const pilha = PILHA_DA_FONTE[font];
  const comFigura = symbol !== 'nenhum';
  if (comFigura) desenharSimbolo(ctx, symbol, height * 0.62, height * 0.5, height * 0.62, fg);

  // Com figura o texto encosta nela à esquerda; sem figura, fica centrado. O
  // header centrado com um brasão largado num canto é o erro clássico.
  const eixo = comFigura ? height * 1.12 : width / 2;
  const espaco = comFigura ? width - eixo - height * 0.3 : width * 0.9;
  ctx.fillStyle = fg;
  ctx.textAlign = comFigura ? 'left' : 'center';
  ctx.textBaseline = 'middle';

  ajustarFonte(ctx, title, height * 0.26, espaco, pilha);
  ctx.fillText(title, eixo, height * 0.42);
  ajustarFonte(ctx, subtitle, height * 0.13, espaco, pilha, 'normal');
  ctx.globalAlpha = 0.9;
  ctx.fillText(subtitle, eixo, height * 0.66);
  return canvas;
}
