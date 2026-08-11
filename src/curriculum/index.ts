import type { Specialty } from '../types';
import { ap034 } from './ap034';
import { ap035 } from './ap035';

const specialties: Record<string, Specialty> = {
  AP034: ap034,
  AP035: ap035,
};

export function getSpecialty(code: string): Specialty | undefined {
  return specialties[code];
}

export function getAllSpecialties(): Specialty[] {
  return Object.values(specialties);
}

export { ap034, ap035 };
