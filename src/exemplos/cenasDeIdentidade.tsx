import type { ComponentType } from 'react';
import { cena } from './cenasDeDesign';
import {
  arteDaAssinatura, arteDaPaletaDoBuriti, arteDaProtecao, arteDasAplicacoesDoBuriti, arteDasPecas, arteDoManualDoBuriti,
} from './marcaDoBuriti';

/*
 * As cenas da CC-DG004, no editor de design. A marca é a da unidade Buriti,
 * e não a da Ipê que o laboratório constrói: o motivo está em
 * `marcaDoBuriti.ts`.
 */

export const CENAS_DE_IDENTIDADE: Record<string, ComponentType> = {
  'buriti-pecas': cena(arteDasPecas(), 'marca-buriti'),
  'buriti-assinatura': cena(arteDaAssinatura(), 'marca-buriti'),
  'buriti-paleta': cena(arteDaPaletaDoBuriti(), 'marca-buriti'),
  'buriti-protecao': cena(arteDaProtecao(), 'manual-buriti'),
  'buriti-aplicacoes': cena(arteDasAplicacoesDoBuriti(), 'marca-buriti'),
  'buriti-manual': cena(arteDoManualDoBuriti(), 'manual-buriti'),
  'buriti-incorretos': cena(arteDoManualDoBuriti(), 'manual-buriti', 'manual-4'),
};
