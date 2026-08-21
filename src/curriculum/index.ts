import type { Specialty } from '../types';
import { ap034 } from './ap034';
import { ap035 } from './ap035';
import { ap041 } from './ap041';

const specialties: Record<string, Specialty> = {
  AP034: ap034,
  AP035: ap035,
  AP041: ap041,
};

export function getSpecialty(code: string): Specialty | undefined {
  return specialties[code];
}

export function getAllSpecialties(): Specialty[] {
  return Object.values(specialties);
}

export { ap034, ap035, ap041 };

/** As trilhas que já dá para percorrer — as em construção ficam de fora. */
export function getOpenSpecialties(): Specialty[] {
  return getAllSpecialties().filter(s => !s.emConstrucao);
}
