import { describe, it, expect } from 'vitest';
import { contornoDosPixels } from './bordaDaArte';

/* Um quadrado de pixels com um disco opaco no meio: a borda vermelha por fora,
   o miolo azul por dentro. O overloque tem de seguir o disco e sair vermelho —
   a cor da beirada, e não a do miolo. */
function disco(lado: number, raio: number, borda: number): Uint8ClampedArray {
  const d = new Uint8ClampedArray(lado * lado * 4);
  const c = lado / 2;
  for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
    const r = Math.hypot(x - c, y - c);
    if (r > raio) continue;
    const k = (y * lado + x) * 4;
    const naBorda = r > raio - borda;
    d.set(naBorda ? [193, 53, 22, 255] : [20, 60, 200, 255], k);
  }
  return d;
}

describe('a borda lida da arte', () => {
  it('segue o contorno e pega a cor da beirada', () => {
    const b = contornoDosPixels(disco(200, 80, 10), 200)!;
    expect(b).not.toBeNull();
    expect(b.cor).toBe('#c13516');
    /* Todo ponto do contorno fica no raio do disco: 80 de 200 é 400 de 1000. */
    const pontos = [...b.contorno.matchAll(/([\d.]+) ([\d.]+)/g)].map(m => Math.hypot(+m[1] - 500, +m[2] - 500));
    expect(pontos.length).toBeGreaterThan(200);
    for (const r of pontos) expect(Math.abs(r - 400)).toBeLessThan(8);
  });

  it('sem nada opaco, não inventa contorno', () => {
    expect(contornoDosPixels(new Uint8ClampedArray(100 * 100 * 4), 100)).toBeNull();
  });
});
