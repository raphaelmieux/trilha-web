import type { ComponentType } from 'react';
import LaboratorioDoProjetoDeDados from '../components/LaboratorioDoProjetoDeDados';
import { VEREDAS, type LicaoDeVereda } from '../curriculum/veredas';
import { PROJETO_INICIAL, contextoDe, type LicaoDaCcEs013 } from '../labs/metasDaCcEs013';
import {
  ARQUIVO_DA_ANALISE_DO_SONO, NUVEM_DO_SONO, cadernoDoSono, type EstadoDoSono,
} from './telaESono';

/*
 * As cenas da CC-ES013. A base é a do tempo de tela e do sono, e não a chamada
 * do semestre que o laboratório limpa: o motivo está em `telaESono.ts`. A
 * moldura é a do laboratório; a lição de cada cena só escolhe a janela, e a
 * pasta de trabalho e a nuvem vêm de `outra`.
 */

const vereda = VEREDAS.find(v => v.id === 'cc-es013')!;
const nada = () => {};

const licaoDoProjeto = (licao: LicaoDaCcEs013) => vereda.modulos
  .flatMap(m => m.licoes)
  .find((l): l is Extract<LicaoDeVereda, { tipo: 'projeto-de-dados' }> =>
    l.tipo === 'projeto-de-dados' && l.licao === licao)!;

const cena = (licao: LicaoDaCcEs013, estado: EstadoDoSono) => function CenaDoSono() {
  return (
    <LaboratorioDoProjetoDeDados vereda={vereda} licao={licaoDoProjeto(licao)}
      aoVencer={nada} aoSair={nada}
      outra={{
        inicial: () => contextoDe({ ...PROJETO_INICIAL, caderno: cadernoDoSono(estado), nuvem: NUVEM_DO_SONO }),
        arquivo: ARQUIVO_DA_ANALISE_DO_SONO,
      }} />
  );
};

export const CENAS_DO_PROJETO_DE_DADOS: Record<string, ComponentType> = {
  'sono-bruta': cena('grafia', 'bruta'),
  'sono-copia': cena('grafia', 'com-copia'),
  'sono-grafia': cena('numeros', 'grafia'),
  'sono-impossiveis': cena('numeros', 'impossiveis'),
  'sono-tratada': cena('relacao', 'tratada'),
  'sono-calculos': cena('descritivas', 'calculos'),
  'sono-grupos': cena('grupos', 'grupos'),
  'sono-entrega': cena('entrega', 'tratada'),
};
