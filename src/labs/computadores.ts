/**
 * Os computadores em que o terminal abre.
 *
 * Um `Record` sobre a união, pela razão do despacho de três telas do Word: o
 * terceiro computador não compila até alguém dizer de onde ele parte. Quem lê
 * esta tabela é o laboratório, que monta a lição, **e** a trava de "abre sem
 * nada feito" — escrita só no teste, a tela repetiria a escolha e as duas
 * divergiriam no primeiro computador novo.
 */

import { maquinaInicial, type Maquina } from './terminal';
import { computadorDoReadme, computadorDoVersionamento } from './repositorioDoAlmoxarifado';

export type ComputadorDoTerminal = 'clube' | 'almoxarifado-versionamento' | 'almoxarifado-readme';

export const COMPUTADORES: Record<ComputadorDoTerminal, () => Maquina> = {
  clube: maquinaInicial,
  'almoxarifado-versionamento': computadorDoVersionamento,
  'almoxarifado-readme': computadorDoReadme,
};

export const computadorDaLicao = (licao: { computador?: ComputadorDoTerminal }): Maquina =>
  COMPUTADORES[licao.computador ?? 'clube']();
