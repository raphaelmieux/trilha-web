import type { ComponentType } from 'react';
import LaboratorioDaEstatistica from '../components/LaboratorioDaEstatistica';
import { VEREDAS, type LicaoDeVereda } from '../curriculum/veredas';
import {
  PARES, PAR_DO_MODULO_2, blocoDaExclusao, blocoDaReta, blocoDasPrevisoes, blocoDoAjuste,
  blocoDoEscolhido, blocoDosPares, comColunaAuxiliar, comDispersaoPronta, comRetaEAjustePronto,
  contextoInicial, type ContextoDaEstatistica, type LicaoDaCcEs010,
} from '../labs/metasDaCcEs010';
import {
  ARQUIVO_DO_CAMPORI, GRUPOS_DA_TEORIA, IDADES_DA_TEORIA, baseDoCampori,
} from './camporiDePrimavera';

/*
 * As cenas da CC-ES010. A base é a inscrição do Campori de Primavera, e não a
 * do acampamento de inverno que o laboratório analisa — os números dele são
 * as respostas das lições, e o motivo está em `camporiDePrimavera.ts`.
 *
 * As idades da previsão e as duas unidades do embaralho também são outras: a
 * lição prevê para 13 e 25 anos e embaralha a Arara com a Águia, e a teoria
 * que mostrasse as mesmas perguntas mostraria o caminho do gabarito.
 */

const vereda = VEREDAS.find(v => v.id === 'cc-es010')!;
const nada = () => {};

const licaoDaEstatistica = (licao: LicaoDaCcEs010) => vereda.modulos
  .flatMap(m => m.licoes)
  .find((l): l is Extract<LicaoDeVereda, { tipo: 'estatistica' }> => l.tipo === 'estatistica' && l.licao === licao)!;

const cena = (licao: LicaoDaCcEs010, inicial: () => ContextoDaEstatistica) => function CenaDoCampori() {
  return (
    <LaboratorioDaEstatistica vereda={vereda} licao={licaoDaEstatistica(licao)} aoVencer={nada} aoSair={nada}
      outra={{ inicial, arquivo: ARQUIVO_DO_CAMPORI, grupos: GRUPOS_DA_TEORIA }} />
  );
};

const b = baseDoCampori;
const PAR = PAR_DO_MODULO_2;

export const CENAS_DA_ESTATISTICA: Record<string, ComponentType> = {
  'estatistica-correlacao': cena('correlacao', () => contextoInicial([blocoDosPares([PAR])], b())),
  'estatistica-pares': cena('espuria', () => contextoInicial([blocoDosPares(PARES)], b())),
  'estatistica-reta': cena('reta', () => comDispersaoPronta(contextoInicial([blocoDaReta(PAR)], b()))),
  'estatistica-prever': cena('prever',
    () => contextoInicial([blocoDasPrevisoes(PAR, [...IDADES_DA_TEORIA])], b())),
  'estatistica-ajuste': cena('ajuste', () => contextoInicial([blocoDoAjuste(PARES)], b())),
  'estatistica-escolhido': cena('escolhido', () => contextoInicial([blocoDoEscolhido()], b())),
  'estatistica-exclusao': cena('exclusao',
    () => comRetaEAjustePronto(contextoInicial([blocoDaExclusao(PAR)], b()))),
  'estatistica-auxiliar': cena('exclusao',
    () => comColunaAuxiliar(comRetaEAjustePronto(contextoInicial([blocoDaExclusao(PAR)], b())), PAR)),
  'estatistica-acaso': cena('acaso', () => contextoInicial(undefined, b())),
};
