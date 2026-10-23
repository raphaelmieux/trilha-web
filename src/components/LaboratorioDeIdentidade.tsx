import { useCallback, useMemo, useState } from 'react';
import { Layers, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign } from '../labs/editorDeDesign';
import { CadernoDaIdentidade } from '../labs/cadernoDaIdentidade';
import { LICOES_DA_CC_DG004, metasDa, type ContextoDaIdentidade } from '../labs/metasDaCcDg004';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As nove lições da CC-DG004, numa moldura só.
 *
 * Seis abrem o editor de design da CC-DG001 — o mesmo, com as ferramentas de
 * vetor da CC-DG002 e o copiar e colar que esta vereda trouxe para ele, porque
 * aplicar uma marca é levá-la de uma prancha a outra. Três são tela da
 * plataforma inteira: o conceito, os rascunhos e a defesa, que nenhum
 * programa de desenho tem onde guardar. É a regra do módulo 8 da CC-ES008.
 */

export default function LaboratorioDeIdentidade({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'identidade' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG004[licao];
  const naPlataforma = definicao.programa === 'plataforma';
  const [ctx, setCtx] = useState<ContextoDaIdentidade>(() => definicao.contexto());
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(naPlataforma);
  const [vida, setVida] = useState(0);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  }, []);
  const aoVer = useCallback((chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }
  )), []);

  const recomecar = () => {
    setCtx(definicao.contexto());
    setVida(v => v + 1);
    setNoCaderno(naPlataforma);
    setAviso('');
  };

  const tarefas = useMemo(
    () => metasDa(licao).map(m => ({ id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx) })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);
  const imita = !noCaderno;

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }} disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      {definicao.caderno && !naPlataforma && (
        <button onClick={() => setNoCaderno(v => !v)} className="btn-secondary text-sm w-full justify-center inline-flex items-center gap-1.5">
          {noCaderno ? <><Layers className="w-4 h-4" /> Voltar ao editor</> : <><NotebookPen className="w-4 h-4" /> Abrir o caderno</>}
        </button>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa={naPlataforma ? 'caderno-da-identidade' : 'editor-de-design'} imitaPrograma={imita}
      tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={imita ? 24 : 0}>
      {!naPlataforma && <style>{CSS_DO_EDITOR_DE_DESIGN}</style>}
      {noCaderno && (
        /* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */
        <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
          <CadernoDaIdentidade key={`c-${vida}`} ctx={ctx} mudar={setCtx} licao={licao} />
        </div>
      )}
      {/* O editor continua montado enquanto o caderno está à frente: o histórico
          do Ctrl+Z é dele. */}
      {!naPlataforma && (
        <div style={{ display: noCaderno ? 'none' : 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          <EditorDeDesign key={`e-${licao}-${vida}`} arte={ctx.arte} mudar={arte => setCtx(c => ({ ...c, arte }))}
            pranchaInicial={definicao.prancha} nomeDoArquivo="Marca da unidade Ipê" aoVer={aoVer} aoAvisar={avisar} />
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
