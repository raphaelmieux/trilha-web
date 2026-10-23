import { useCallback, useMemo, useState } from 'react';
import { AppWindow, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign } from '../labs/editorDeDesign';
import { CSS_DO_EDITOR_DE_FOTO, EditorDeFoto } from '../labs/editorDeFoto';
import { CSS_DO_DIAGRAMADOR, Diagramador } from '../labs/diagramador';
import { CSS_DA_NUVEM } from '../labs/nuvem';
import { EntregaNaNuvem } from '../labs/entregaNaNuvem';
import { CadernoDoProjetoDeDesign } from '../labs/cadernoDoProjetoDeDesign';
import { documentoDe } from '../labs/raster';
import {
  LICOES_DA_CC_DG006, metasDa, type ContextoDoProjetoDeDesign, type ProgramaDaLicao,
} from '../labs/metasDaCcDg006';
import type { ArquivoDeImagem } from '../labs/formatosDeImagem';
import type { Pdf } from '../labs/diagramacao';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As nove lições da CC-DG006, numa moldura só.
 *
 * ── Cinco telas, nenhuma nova ────────────────────────────────────────────
 * O projeto abre as janelas das veredas que o requisito 1 exige antes dele:
 * o editor de design da CC-DG001, com o vetor da CC-DG002; o editor de foto
 * da CC-DG003; o programa de diagramação da CC-DG005; e a nuvem da CC-ES006.
 * Nenhuma ganhou cópia — elas recebem o estado do projeto e devolvem o que
 * mudou. O que mora aqui é o que é da moldura: o estado do projeto, a lista
 * de tarefas, o aviso e o despacho.
 *
 * ── Os nomes de programa são os das outras veredas ───────────────────────
 * A lembrança do aviso de tela pequena é por programa imitado, e é a decisão
 * da CC-ES012: quem dispensou o aviso no editor de design da CC-DG001 não é
 * avisado de novo aqui.
 */

const PROGRAMA_IMITADO: Record<ProgramaDaLicao, string> = {
  design: 'editor-de-design',
  foto: 'editor-de-foto',
  diagramador: 'diagramador',
  nuvem: 'nuvem',
  plataforma: 'projeto-de-design',
};

const FOLHA: Record<ProgramaDaLicao, string> = {
  design: CSS_DO_EDITOR_DE_DESIGN,
  foto: CSS_DO_EDITOR_DE_FOTO,
  diagramador: CSS_DO_DIAGRAMADOR,
  nuvem: CSS_DA_NUVEM,
  plataforma: '',
};

/** A régua de status de cada programa, que a cápsula de tarefas sobe para não cobrir. */
const RODAPE: Record<ProgramaDaLicao, number> = { design: 24, foto: 26, diagramador: 24, nuvem: 0, plataforma: 0 };

export default function LaboratorioDoProjetoDeDesign({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'projeto-de-design' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG006[licao];
  const programa = definicao.programa;
  const naPlataforma = programa === 'plataforma';
  const abreNoCaderno = naPlataforma || !!definicao.abreNoCaderno;
  const [ctx, setCtx] = useState<ContextoDoProjetoDeDesign>(() => definicao.contexto());
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(abreNoCaderno);
  const [vida, setVida] = useState(0);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  }, []);
  const aoVer = useCallback((chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }
  )), []);
  /* Exportar com o nome de um arquivo que já está na pasta escreve por cima
     dele, como em todo sistema — é o que torna verdadeira a tarefa de guardar
     o original. */
  const aoExportarFoto = useCallback((a: ArquivoDeImagem) => setCtx(c => ({
    ...c, pasta: [...c.pasta.filter(x => x.nome !== a.nome), { ...a, original: false }],
  })), []);
  const aoAbrirFoto = useCallback((nome: string) => setCtx(c => {
    const a = c.pasta.find(x => x.nome === nome);
    return a ? { ...c, foto: documentoDe(a.nome, { ...a.imagem, px: new Uint8ClampedArray(a.imagem.px) }) } : c;
  }), []);
  const aoExportarPdf = useCallback((pdf: Pdf) => setCtx(c => ({ ...c, pdfs: [...c.pdfs.filter(p => p.nome !== pdf.nome), pdf] })), []);

  const recomecar = () => {
    setCtx(definicao.contexto());
    setVida(v => v + 1);
    setNoCaderno(abreNoCaderno);
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
          {noCaderno ? <><AppWindow className="w-4 h-4" /> Voltar ao programa</> : <><NotebookPen className="w-4 h-4" /> Abrir o caderno</>}
        </button>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  /* O programa continua montado enquanto o caderno está à frente: o
     histórico do Ctrl+Z é dele. */
  const visivel = { display: noCaderno ? 'none' : 'flex', flex: 1, minHeight: 0, flexDirection: 'column' as const, position: 'relative' as const };

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa={noCaderno ? PROGRAMA_IMITADO.plataforma : PROGRAMA_IMITADO[programa]} imitaPrograma={imita}
      tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={imita ? RODAPE[programa] : 0}>
      {FOLHA[programa] && <style>{FOLHA[programa]}</style>}
      {noCaderno && (
        /* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */
        <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
          <CadernoDoProjetoDeDesign key={`c-${vida}`} ctx={ctx} mudar={setCtx} licao={licao} />
        </div>
      )}
      {programa === 'design' && (
        <div style={visivel}>
          <EditorDeDesign key={`e-${licao}-${vida}`} arte={ctx.arte} mudar={arte => setCtx(c => ({ ...c, arte }))}
            pranchaInicial={definicao.prancha!} nomeDoArquivo="Acampamento das Famílias" aoVer={aoVer} aoAvisar={avisar} />
        </div>
      )}
      {programa === 'foto' && (
        <div style={visivel}>
          <EditorDeFoto key={`f-${licao}-${vida}`} documento={ctx.foto} mudar={foto => setCtx(c => ({ ...c, foto }))}
            pasta={ctx.pasta} aoAbrir={aoAbrirFoto} aoExportar={aoExportarFoto} aoVer={aoVer} aoAvisar={avisar} />
        </div>
      )}
      {programa === 'diagramador' && (
        <div style={visivel}>
          <Diagramador key={`d-${licao}-${vida}`} documento={ctx.convite} mudar={convite => setCtx(c => ({ ...c, convite }))}
            aoVer={aoVer} aoAvisar={avisar} aoExportar={aoExportarPdf} />
        </div>
      )}
      {programa === 'nuvem' && (
        <div style={visivel}>
          <EntregaNaNuvem key={`n-${vida}`} nuvem={ctx.nuvem} mudar={f => setCtx(c => ({ ...c, nuvem: f(c.nuvem) }))} avisar={avisar} />
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
