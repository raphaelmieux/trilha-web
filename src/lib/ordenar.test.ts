import { describe, it, expect } from 'vitest';
import { posicaoAoArrastar } from './ordenar';

describe('posicaoAoArrastar', () => {
  it('cai depois de toda linha cujo meio ficou acima do ponteiro', () => {
    expect(posicaoAoArrastar([20, 70, 120], 0)).toBe(0);
    expect(posicaoAoArrastar([20, 70, 120], 71)).toBe(2);
    expect(posicaoAoArrastar([20, 70, 120], 500)).toBe(3);
  });

  /* Uma linha curta passando por uma alta. Perguntando "em cima de quem está o
     ponteiro", as duas trocariam de lugar a cada pixel; contando meios, trocar
     empurra a alta para longe do ponteiro, e voltar pede passar de novo pelo
     meio dela. */
  it('não treme quando as linhas têm alturas diferentes', () => {
    // Curta (0–40) antes da alta (48–148): meio da alta em 98.
    expect(posicaoAoArrastar([98], 99)).toBe(1);
    // Depois da troca a alta está em 0–100, meio em 50: o mesmo ponteiro fica.
    expect(posicaoAoArrastar([50], 99)).toBe(1);
    // E só volta passando do meio dela.
    expect(posicaoAoArrastar([50], 51)).toBe(1);
    expect(posicaoAoArrastar([50], 49)).toBe(0);
  });
});
