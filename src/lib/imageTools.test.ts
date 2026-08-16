import { describe, it, expect } from 'vitest';
import {
  calculateResize,
  formatBytes,
  recommendFormat,
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  isWebSafe,
  nearestWebSafe,
} from './imageTools';

describe('calculateResize', () => {
  it('scales a wide image down to the limit and keeps the aspect ratio', () => {
    expect(calculateResize(4000, 3000, 1200)).toEqual({ width: 1200, height: 900 });
  });

  it('keeps the aspect ratio on a 16:9 image', () => {
    expect(calculateResize(1920, 1080, 800)).toEqual({ width: 800, height: 450 });
  });

  it('never enlarges: a small image comes back untouched', () => {
    expect(calculateResize(500, 400, 1200)).toEqual({ width: 500, height: 400 });
  });

  it('leaves an image already at the limit alone', () => {
    expect(calculateResize(1200, 800, 1200)).toEqual({ width: 1200, height: 800 });
  });

  it('rounds the height instead of producing a fractional pixel', () => {
    const { height } = calculateResize(1000, 333, 300);
    expect(Number.isInteger(height)).toBe(true);
    expect(height).toBe(100);
  });

  it('never produces a zero-height canvas from an extreme panorama', () => {
    // 8000x20 scaled to 100 wide is 0.25px tall; a zero-height canvas throws.
    expect(calculateResize(8000, 20, 100).height).toBe(1);
  });

  it('returns zeroes for a degenerate image instead of dividing by zero', () => {
    expect(calculateResize(0, 0, 1200)).toEqual({ width: 0, height: 0 });
  });
});

describe('formatBytes', () => {
  it('shows raw bytes below 1 KB', () => {
    expect(formatBytes(840)).toBe('840 B');
  });

  it('shows one decimal for small KB values', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('drops the decimal once past 10 KB, where it stops being informative', () => {
    expect(formatBytes(45 * 1024)).toBe('45 KB');
  });

  it('switches to MB past 1024 KB', () => {
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB');
  });
});

describe('recommendFormat', () => {
  it('demands PNG when there is transparency, however large the file', () => {
    const r = recommendFormat(true, 10_000, 900_000);
    expect(r.format).toBe('png');
    expect(r.reason).toMatch(/transparência/i);
  });

  it('recommends JPEG for an opaque image it compresses better', () => {
    const r = recommendFormat(false, 120_000, 900_000);
    expect(r.format).toBe('jpeg');
  });

  it('states the real saving rather than a generic claim', () => {
    // 250 KB against 1000 KB is a 75% saving.
    expect(recommendFormat(false, 250, 1000).reason).toContain('75%');
  });

  it('recommends PNG when PNG actually came out smaller', () => {
    const r = recommendFormat(false, 90_000, 40_000);
    expect(r.format).toBe('png');
  });
});

describe('hexToRgb', () => {
  it('parses six-digit hex', () => {
    expect(hexToRgb('#C13516')).toEqual({ r: 193, g: 53, b: 22 });
  });

  it('expands three-digit shorthand', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('accepts a value without the leading hash', () => {
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('rejects anything that is not a hex colour', () => {
    expect(hexToRgb('vermelho')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
    expect(hexToRgb('#gggggg')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it('weights green above red above blue, as the eye does', () => {
    const red = relativeLuminance({ r: 255, g: 0, b: 0 });
    const green = relativeLuminance({ r: 0, g: 255, b: 0 });
    const blue = relativeLuminance({ r: 0, g: 0, b: 255 });
    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });
});

describe('contrastRatio', () => {
  it('gives 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
  });

  it('gives 1:1 for a colour against itself', () => {
    expect(contrastRatio('#C13516', '#C13516')).toBeCloseTo(1, 5);
  });

  it('does not depend on the order of the arguments', () => {
    expect(contrastRatio('#C13516', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#C13516'), 5);
  });

  it('fails white text on the brand amber, which really is unreadable', () => {
    // #F5A623 is light; white on it lands near 2:1, well under the 4.5:1 bar.
    expect(contrastRatio('#F5A623', '#ffffff')).toBeLessThan(4.5);
  });

  it('passes black text on the brand amber', () => {
    expect(contrastRatio('#F5A623', '#000000')).toBeGreaterThan(4.5);
  });

  it('returns 1 for an unparseable colour, so a typo can never score as passing', () => {
    expect(contrastRatio('nope', '#ffffff')).toBe(1);
  });
});

describe('web-safe colours', () => {
  it('accepts a colour built only from the six steps', () => {
    expect(isWebSafe('#33CC99')).toBe(true);
    expect(isWebSafe('#000000')).toBe(true);
    expect(isWebSafe('#FFFFFF')).toBe(true);
  });

  it('rejects a colour with any channel off the steps', () => {
    // The brand red: 193 is not one of 0, 51, 102, 153, 204, 255.
    expect(isWebSafe('#C13516')).toBe(false);
  });

  it('rejects an unparseable value rather than treating it as safe', () => {
    expect(isWebSafe('verde')).toBe(false);
  });

  it('snaps each channel to its nearest step', () => {
    // 193 -> 204, 53 -> 51, 22 -> 0.
    expect(nearestWebSafe('#C13516')).toBe('#CC3300');
  });

  it('leaves an already-safe colour untouched', () => {
    expect(nearestWebSafe('#33CC99')).toBe('#33CC99');
  });

  it('always produces a colour that passes the check', () => {
    for (const hex of ['#123456', '#abcdef', '#7f7f7f', '#010101', '#fefefe']) {
      expect(isWebSafe(nearestWebSafe(hex))).toBe(true);
    }
  });

  it('rounds the midpoint upward consistently rather than at random', () => {
    // 25 sits between 0 and 51; the reducer keeps the first strictly-closer
    // step, so ties resolve to the lower one. Pinned so it cannot drift.
    expect(nearestWebSafe('#191919')).toBe('#000000');
  });

  it('falls back to black for a value it cannot read', () => {
    expect(nearestWebSafe('nada')).toBe('#000000');
  });
});
