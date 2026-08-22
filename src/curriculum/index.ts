import { ORDEM_DOS_NIVEIS, type Specialty } from '../types';
import { ap034 } from './ap034';
import { ap035 } from './ap035';
import { ap041 } from './ap041';
import { ap042, ap043, ap044, ap045 } from './anunciadas';

const specialties: Record<string, Specialty> = {
  AP034: ap034,
  AP035: ap035,
  AP041: ap041,
  AP042: ap042,
  AP043: ap043,
  AP044: ap044,
  AP045: ap045,
};

export function getSpecialty(code: string): Specialty | undefined {
  return specialties[code];
}

export function getAllSpecialties(): Specialty[] {
  return Object.values(specialties);
}

export { ap034, ap035, ap041, ap042, ap043, ap044, ap045 };

/** As trilhas que já dá para percorrer — as em construção ficam de fora. */
export function getOpenSpecialties(): Specialty[] {
  return getAllSpecialties().filter(s => !s.emConstrucao);
}

/**
 * As trilhas agrupadas por assunto, cada família na ordem dos níveis.
 *
 * O painel listava duas trilhas escritas à mão. Com a família Computação inteira
 * são sete, e serão mais: uma parede de cards em ordem de código esconde o
 * percurso que existe dentro de cada assunto — que Computação 1 vem antes da 2,
 * e que a Internet Avançado continua a Internet.
 *
 * As famílias saem na ordem em que aparecem no currículo, e não em ordem
 * alfabética: quem escreve o currículo escolhe o que vem primeiro.
 */
export function getFamilias(): { nome: string; trilhas: Specialty[] }[] {
  const porFamilia = new Map<string, Specialty[]>();
  for (const s of getAllSpecialties()) {
    porFamilia.set(s.familia, [...(porFamilia.get(s.familia) ?? []), s]);
  }

  return [...porFamilia.entries()].map(([nome, trilhas]) => ({
    nome,
    trilhas: [...trilhas].sort((a, b) => {
      const nivel = ORDEM_DOS_NIVEIS.indexOf(a.level) - ORDEM_DOS_NIVEIS.indexOf(b.level);
      return nivel || a.code.localeCompare(b.code);
    }),
  }));
}

/**
 * A trilha exigida antes desta já foi concluída?
 *
 * Sem pré-requisito, está sempre liberada. É esta função — e não um módulo
 * dentro da trilha avançada — que cumpre o requisito de "ter concluído a
 * especialidade anterior": a plataforma já sabe a resposta.
 */
export function preRequisitoCumprido(
  s: Specialty,
  concluiu: (code: string) => boolean,
): boolean {
  return !s.preRequisito || concluiu(s.preRequisito);
}
