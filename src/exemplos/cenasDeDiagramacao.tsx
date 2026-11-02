import { useState, type ComponentType } from 'react';
import { CSS_DO_DIAGRAMADOR, Diagramador } from '../labs/diagramador';
import type { Documento } from '../labs/diagramacao';
import {
  guia, guiaComLoboGrande, guiaComNumerosDigitados, guiaComTextoColado, guiaSemFotos, guiaSemMalha, guiaSemSangria,
} from './guiaDaCaminhada';

/*
 * As cenas da CC-DG005, no diagramador. O documento é o guia da caminhada, e
 * não o boletim de inverno que o laboratório monta: o motivo está em
 * `guiaDaCaminhada.ts`.
 *
 * `exportar` liga o Exportar PDF, que a janela só mostra quando há quem
 * receba o arquivo — é a regra do laboratório, e a cena a segue.
 */
const cena = (fazer: () => Documento, pagina = 0, exportar = false) => function CenaDaDiagramacao() {
  const [documento, mudar] = useState(fazer);
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <style>{CSS_DO_DIAGRAMADOR}</style>
      <Diagramador documento={documento} mudar={mudar} paginaInicial={pagina}
        aoExportar={exportar ? () => undefined : undefined} />
    </div>
  );
};

export const CENAS_DE_DIAGRAMACAO: Record<string, ComponentType> = {
  'guia-sem-malha': cena(guiaSemMalha, 1),
  'guia-sem-sangria': cena(guiaSemSangria, 0),
  'guia-pronto': cena(guia, 1),
  'guia-pronto-p3': cena(guia, 2),
  'guia-pronto-p4': cena(guia, 3),
  'guia-texto-colado': cena(guiaComTextoColado, 1),
  'guia-sem-fotos': cena(guiaSemFotos, 1),
  'guia-lobo-grande': cena(guiaComLoboGrande, 2),
  'guia-numeros-digitados': cena(guiaComNumerosDigitados, 1),
  'guia-exportar': cena(guia, 0, true),
};
