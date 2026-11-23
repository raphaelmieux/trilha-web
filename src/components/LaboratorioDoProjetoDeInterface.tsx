import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CadernoDoProjetoDeInterface } from '../labs/cadernoDoProjetoDeInterface';
import { contextoDoCadernoDaCcFe007, metasDoCadernoDaCcFe007, type ContextoDaCcFe007Caderno } from '../labs/projetoDeInterface';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As duas lições da CC-FE007 que são tela da plataforma: a proposta e o
 * roteiro da apresentação.
 *
 * Elas não imitam programa nenhum, e por isso `imitaPrograma` é falso — a
 * decisão do caderno da CC006. As outras sete lições abrem nos laboratórios
 * de React, de publicação e de terminal, pelo caminho deles.
 */
export default function LaboratorioDoProjetoDeInterface({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'projeto-de-interface' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const [ctx, setCtx] = useState<ContextoDaCcFe007Caderno>(contextoDoCadernoDaCcFe007);
  const [vida, setVida] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const tarefas = useMemo(
    () => metasDoCadernoDaCcFe007(licao).map(m => ({ id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx) })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }} disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      <button onClick={() => { setCtx(contextoDoCadernoDaCcFe007()); setVida(v => v + 1); }}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa="projeto-de-interface" imitaPrograma={false} tarefas={tarefas} acoes={acoes} rodape={0}>
      {/* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */}
      <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
        <CadernoDoProjetoDeInterface key={vida} ctx={ctx} mudar={setCtx} licao={licao} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}
