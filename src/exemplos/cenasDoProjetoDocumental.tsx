import type { ComponentType } from 'react';
import LaboratorioDoProjeto from '../components/LaboratorioDoProjeto';
import { VEREDAS, type LicaoDeVereda } from '../curriculum/veredas';
import { CENAS_DAS_PORTAS, nasPortas, type EstadoDasPortas } from './conjuntoDasPortas';

/*
 * As cenas da CC-ES012. O conjunto é o do Dia de Portas Abertas, e não o da
 * feira que o laboratório monta: o motivo está em `conjuntoDasPortas.ts`. A
 * moldura é a do laboratório, e a lição de cada cena só escolhe a janela —
 * o que há dentro dela vem de `outra`.
 */

const vereda = VEREDAS.find(v => v.id === 'cc-es012')!;
const nada = () => {};

const licaoDoProjeto = (licao: string) => vereda.modulos
  .flatMap(m => m.licoes)
  .find((l): l is Extract<LicaoDeVereda, { tipo: 'projeto' }> => l.tipo === 'projeto' && l.licao === licao)!;

const cena = (estado: EstadoDasPortas) => function CenaDasPortas() {
  return (
    <LaboratorioDoProjeto vereda={vereda} licao={licaoDoProjeto(CENAS_DAS_PORTAS[estado].licao)}
      aoVencer={nada} aoSair={nada} outra={nasPortas(estado)} />
  );
};

export const CENAS_DO_PROJETO_DOCUMENTAL: Record<string, ComponentType> = Object.fromEntries(
  (Object.keys(CENAS_DAS_PORTAS) as EstadoDasPortas[]).map(e => [`conjunto-${e}`, cena(e)]),
);
