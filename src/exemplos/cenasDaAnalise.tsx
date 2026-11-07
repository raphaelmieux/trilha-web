import type { ComponentType } from 'react';
import LaboratorioDaAnalise from '../components/LaboratorioDaAnalise';
import { VEREDAS, type LicaoDeVereda } from '../curriculum/veredas';
import {
  BLOCO_DAS_MEDIDAS, blocoDaAdesao, blocoDaComparacao, blocoDasClasses, blocoDasUnidades,
  comAsMedidasEscritas, contextoInicial, type ContextoDaAnalise, type LicaoDaCcEs009,
} from '../labs/metasDaCcEs009';
import { ARQUIVO_DO_CAMPORI, baseDoCampori } from './camporiDePrimavera';

/*
 * As cenas da CC-ES009. A base é a inscrição do Campori de Primavera, e não a
 * do acampamento de inverno que o laboratório analisa: o motivo está em
 * `camporiDePrimavera.ts`. A moldura é a do laboratório; a lição de cada cena
 * escolhe as abas, e a base vem de `outra`.
 */

const vereda = VEREDAS.find(v => v.id === 'cc-es009')!;
const nada = () => {};

const licaoDaAnalise = (licao: LicaoDaCcEs009) => vereda.modulos
  .flatMap(m => m.licoes)
  .find((l): l is Extract<LicaoDeVereda, { tipo: 'analise' }> => l.tipo === 'analise' && l.licao === licao)!;

const cena = (licao: LicaoDaCcEs009, inicial: () => ContextoDaAnalise) => function CenaDoCampori() {
  return (
    <LaboratorioDaAnalise vereda={vereda} licao={licaoDaAnalise(licao)} aoVencer={nada} aoSair={nada}
      outra={{ inicial, arquivo: ARQUIVO_DO_CAMPORI }} />
  );
};

const b = baseDoCampori;

export const CENAS_DA_ANALISE: Record<string, ComponentType> = {
  'campori-centro': cena('centro', () => contextoInicial([BLOCO_DAS_MEDIDAS], false, false, b())),
  'campori-medidas': cena('engano', () => comAsMedidasEscritas(b())),
  'campori-frequencias': cena('frequencias',
    () => contextoInicial([blocoDasUnidades(b()), blocoDasClasses(b())], false, false, b())),
  'campori-comparacao': cena('comparacao', () => contextoInicial([blocoDaComparacao(b())], false, false, b())),
  'campori-adesao': cena('adesao', () => contextoInicial([blocoDaAdesao(b())], true, false, b())),
  'campori-graficos': cena('graficos', () => contextoInicial([BLOCO_DAS_MEDIDAS], false, true, b())),
};
