import { useCallback, useMemo, useState } from 'react';
import { LayoutTemplate, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_DIAGRAMADOR, Diagramador } from '../labs/diagramador';
import { CadernoDaImpressao } from '../labs/cadernoDaImpressao';
import { LICOES_DA_CC_DG005, metasDa, type ContextoDaDiagramacao } from '../labs/metasDaCcDg005';
import type { Pdf } from '../labs/diagramacao';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As sete lições da CC-DG005, numa moldura só.
 *
 * Seis abrem o programa de diagramação, sobre o mesmo boletim de inverno do
 * clube. A da gráfica é tela da plataforma inteira: ler a tabela de serviços
 * de uma gráfica e escolher o papel não acontece em programa nenhum — é a
 * regra do módulo 8 da CC-ES008.
 *
 * Os PDFs exportados ficam no laboratório, e não na janela: é o laboratório
 * que responde se o arquivo que sairia para a gráfica é o certo.
 */

export default function LaboratorioDeDiagramacao({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'diagramacao' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG005[licao];
  const naPlataforma = definicao.programa === 'plataforma';
  const [ctx, setCtx] = useState<ContextoDaDiagramacao>(() => definicao.contexto());
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
  const aoExportar = useCallback((pdf: Pdf) => setCtx(c => ({ ...c, pdfs: [...c.pdfs.filter(p => p.nome !== pdf.nome), pdf] })), []);

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
          {noCaderno ? <><LayoutTemplate className="w-4 h-4" /> Voltar ao diagramador</> : <><NotebookPen className="w-4 h-4" /> Abrir o caderno</>}
        </button>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa={naPlataforma ? 'caderno-da-impressao' : 'diagramador'} imitaPrograma={imita}
      tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={imita ? 24 : 0}>
      {!naPlataforma && <style>{CSS_DO_DIAGRAMADOR}</style>}
      {noCaderno && (
        /* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */
        <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
          <CadernoDaImpressao key={`c-${vida}`} ctx={ctx} mudar={setCtx} licao={licao} />
        </div>
      )}
      {/* O diagramador continua montado enquanto o caderno está à frente: o
          histórico do Ctrl+Z é dele. */}
      {!naPlataforma && (
        <div style={{ display: noCaderno ? 'none' : 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          <Diagramador key={`d-${licao}-${vida}`} documento={ctx.documento} mudar={documento => setCtx(c => ({ ...c, documento }))}
            paginaInicial={definicao.pagina} aoVer={aoVer} aoAvisar={avisar}
            aoExportar={licao === 'exportar' ? aoExportar : undefined} />
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
