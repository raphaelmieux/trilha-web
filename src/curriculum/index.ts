import { ORDEM_DOS_NIVEIS, type Specialty } from '../types';
import { ap034 } from './ap034';
import { ap035 } from './ap035';
import { ap041 } from './ap041';
import { ap042 } from './ap042';
import { ap043 } from './ap043';
import { ap044 } from './ap044';
import { ap045 } from './ap045';
import { ap049, ap052, ap063, ap064, hm079, hm090 } from './anunciadas';

const specialties: Record<string, Specialty> = {
  AP034: ap034,
  AP035: ap035,
  AP041: ap041,
  AP042: ap042,
  AP043: ap043,
  AP044: ap044,
  AP045: ap045,
  AP049: ap049,
  AP052: ap052,
  AP063: ap063,
  AP064: ap064,
  HM079: hm079,
  HM090: hm090,
};

export function getSpecialty(code: string): Specialty | undefined {
  return specialties[code];
}

export function getAllSpecialties(): Specialty[] {
  return Object.values(specialties);
}

export { ap034, ap035, ap041, ap042, ap043, ap044, ap045, ap049, ap052, ap063, ap064, hm079, hm090 };

/** As trilhas que já dá para percorrer — as em construção ficam de fora. */
export function getOpenSpecialties(): Specialty[] {
  return getAllSpecialties().filter(s => !s.emConstrucao);
}

/*
  O nome com que um grupo de trilhas aparece na tela, quando não é o da família.

  A família de HM079 e HM090 é "Artes e Habilidades Manuais", a área da
  classificação oficial, e no painel ela se lê "Fina Arte" — o mesmo nome do
  Mestrado que fecha a família (`NOME_DO_MESTRADO`, em `lib/mestrados.ts`),
  para que o grupo e o prêmio dele se leiam como uma coisa só.

  Só o rótulo muda. A família é identidade — o código do Mestrado sai dela
  (`slugDaFamilia`) —, e trocá-la no registro mudaria o código do Mestrado e
  tiraria do banco o `mestrado_artes_e_habilidades_manuais` já semeado.
*/
const NOME_DO_GRUPO: Record<string, string> = {
  'Artes e Habilidades Manuais': 'Fina Arte',
};

export const nomeDoGrupo = (familia: string) => NOME_DO_GRUPO[familia] ?? familia;

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

  return [...porFamilia.entries()].map(([familia, trilhas]) => ({
    nome: nomeDoGrupo(familia),
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
