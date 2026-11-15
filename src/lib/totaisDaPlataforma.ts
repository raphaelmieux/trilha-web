import { getAllSpecialties } from '../curriculum';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { LABORATORIOS_PREVISTOS, laboratoriosDaVereda, tiposDeLaboratorioDaTrilha } from '../curriculum/laboratoriosPrevistos';
import { xpMaximo } from './xp';
import type { ResumoDoDesbravador } from './insignias';

/*
  Quanto a plataforma tem, de cada coisa que as escadas contam.

  O sétimo degrau de cada escada que conta conteúdo é "tudo": todas as
  lições, todos os módulos, todo o XP. Ele só pode ser alcançado quando nada
  mais estiver anunciado — a Faixa fecha no fim da plataforma escrita, e não
  no fim do que existe hoje. Antes disso, alcançar o total de hoje daria o
  topo a quem fez só o que estava aberto, e o topo deixaria de dizer "tudo".

  Os totais saem do registro, e não de números escritos à mão: a trilha que
  abrir entra na conta sozinha. A vereda anunciada entra pelo número de
  laboratórios previstos — um módulo de vereda é uma teoria e um laboratório.
*/

/** Nenhuma trilha nem vereda ainda anunciada: a plataforma está toda escrita. */
export function nadaAnunciado(): boolean {
  return getAllSpecialties().every(t => !t.emConstrucao) && VEREDAS.every(v => !v.emConstrucao);
}

const modulosDeVereda = () => VEREDAS.reduce((s, v) => s + laboratoriosDaVereda(v), 0);
const licoesDeVereda = () => VEREDAS.reduce((s, v) => s + (v.emConstrucao ? laboratoriosDaVereda(v) * 2 : licoesDaVereda(v).length), 0);
const teoriasDeVereda = () => VEREDAS.reduce((s, v) => s + (v.emConstrucao ? laboratoriosDaVereda(v) : licoesDaVereda(v).filter(l => l.tipo === 'teoria').length), 0);

export const TOTAIS = {
  /** Requisitos oficiais de trilha, mais as lições de vereda, que contam como requisito. */
  requisitos: () => getAllSpecialties().reduce((s, t) => s + t.requirements.length, 0) + licoesDeVereda(),
  licoes: () => getAllSpecialties().reduce((s, t) => s + t.modules.flatMap(m => m.lessons).length, 0) + licoesDeVereda(),
  modulos: () => getAllSpecialties().reduce((s, t) => s + t.modules.length, 0) + modulosDeVereda(),
  laboratorios: () => getAllSpecialties().reduce((s, t) => s + (t.emConstrucao ? LABORATORIOS_PREVISTOS[t.code] ?? 0 : tiposDeLaboratorioDaTrilha(t).length), 0),
  /** As lições que têm questão a acertar: as de trilha que não são laboratório, e a teoria das veredas. */
  semerro: () => getAllSpecialties().reduce((s, t) => s + t.modules.flatMap(m => m.lessons).filter(l => !l.labType).length, 0) + teoriasDeVereda(),
  /** Um Token.Web() por trilha, por vereda, e o do ME006. */
  tokens: () => getAllSpecialties().length + VEREDAS.length + 1,
  xp: () => xpMaximo().total,
} as const;

/** Concluiu todas as trilhas e todas as veredas da plataforma. */
export function tudoConcluido(r: Pick<ResumoDoDesbravador, 'trilhas' | 'veredas'>): boolean {
  return nadaAnunciado()
    && getAllSpecialties().every(t => r.trilhas.includes(t.code))
    && VEREDAS.every(v => r.veredas.includes(v.id));
}
