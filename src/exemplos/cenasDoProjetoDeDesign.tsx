import { useState, type ComponentType } from 'react';
import { cena } from './cenasDeDesign';
import { CSS_DA_NUVEM } from '../labs/nuvem';
import { EntregaNaNuvem } from '../labs/entregaNaNuvem';
import {
  PASTA_DO_MUTIRAO, arteComAsDuasIdeias, arteComOPostEncolhido, arteComPecasSoltas, pastaDoMutirao,
  pastaDoMutiraoSeparada,
} from './mutiraoDoCorrego';
import type { Nuvem } from '../labs/arquivoCompartilhado';

/*
 * As cenas da CC-DG006. O projeto é o mutirão do córrego, e não o convite do
 * Acampamento das Famílias que o laboratório percorre: o motivo está em
 * `mutiraoDoCorrego.ts`. Foto e convite reaproveitam as cenas da CC-DG003 e
 * da CC-DG005 — a peça é outra, e o gesto é o mesmo.
 */

const nuvem = (fazer: () => Nuvem) => function CenaDaPasta() {
  const [n, setN] = useState(fazer);
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <style>{CSS_DA_NUVEM}</style>
      <EntregaNaNuvem nuvem={n} mudar={f => setN(f)} avisar={() => undefined} pastaDoProjeto={PASTA_DO_MUTIRAO} />
    </div>
  );
};

export const CENAS_DO_PROJETO_DE_DESIGN: Record<string, ComponentType> = {
  'mutirao-pecas': cena(arteComPecasSoltas(), 'Mutirão do Córrego'),
  'mutirao-duas-ideias': cena(arteComAsDuasIdeias(), 'Mutirão do Córrego', 'simbolo-tentativa'),
  'mutirao-post': cena(arteComOPostEncolhido(), 'Mutirão do Córrego', 'post'),
  'mutirao-pasta': nuvem(pastaDoMutirao),
  'mutirao-pasta-separada': nuvem(pastaDoMutiraoSeparada),
};
