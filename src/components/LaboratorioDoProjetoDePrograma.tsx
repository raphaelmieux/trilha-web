import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CadernoDoProjetoDePrograma } from '../labs/cadernoDoProjetoDePrograma';
import { contextoInicial, metasDaCc006, type ContextoDaCc006 } from '../labs/metasDaCc006';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As três lições da CC006 que são tela da plataforma.
 *
 * Elas não imitam programa nenhum, e por isso `imitaPrograma` é falso: a
 * moldura não avisa sobre tela pequena e pinta o fundo da plataforma. As
 * outras seis lições abrem nos laboratórios de Python e de terminal, pelo
 * caminho deles.
 */
export default function LaboratorioDoProjetoDePrograma({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'projeto-de-programa' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const [ctx, setCtx] = useState<ContextoDaCc006>(contextoInicial);
  const [vida, setVida] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const tarefas = useMemo(
    () => metasDaCc006(licao).map(m => ({ id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx) })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }} disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      <button onClick={() => { setCtx(contextoInicial()); setVida(v => v + 1); }}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa="projeto-de-programa" imitaPrograma={false} tarefas={tarefas} acoes={acoes} rodape={0}>
      {/* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */}
      <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
        <CadernoDoProjetoDePrograma key={vida} ctx={ctx} mudar={setCtx} licao={licao} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}
