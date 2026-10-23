import { useCallback, useMemo, useState } from 'react';
import { Image as IconeDeImagem, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_EDITOR_DE_FOTO, EditorDeFoto } from '../labs/editorDeFoto';
import { CadernoDaFoto } from '../labs/cadernoDaFoto';
import { documentoDe, imagemDo } from '../labs/raster';
import { LICOES_DA_CC_DG003, metasDa, type ContextoDaFoto } from '../labs/metasDaCcDg003';
import type { ArquivoDeImagem } from '../labs/formatosDeImagem';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As dez lições da CC-DG003, numa moldura só.
 *
 * Nove abrem o editor de foto, e uma — a dos direitos de imagem — é tela da
 * plataforma inteira: o requisito 6 é a decisão de antes de baixar, e não há
 * programa de foto que a guarde. É a regra do módulo 8 da CC-ES008.
 *
 * A pasta é do laboratório: o que se exporta cai nela, e exportar com o nome
 * de um arquivo que já está lá escreve por cima dele, como em todo sistema. É
 * isso que torna verdadeira a tarefa de guardar o original.
 */

export default function LaboratorioDeFoto({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'foto' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG003[licao];
  const [ctx, setCtx] = useState<ContextoDaFoto>(() => definicao.contexto());
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(definicao.programa === 'plataforma');
  const [vida, setVida] = useState(0);
  /* O antes é a foto como a lição a entregou: é contra ela que o antes e
     depois compara, e não contra o último passo. */
  const antes = useMemo(() => { const d0 = definicao.contexto().documento; return d0 ? imagemDo(d0) : undefined; }, [definicao]);

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  }, []);
  const aoVer = useCallback((chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }
  )), []);
  const aoExportar = useCallback((a: ArquivoDeImagem) => setCtx(c => ({
    ...c, pasta: [...c.pasta.filter(x => x.nome !== a.nome), { ...a, original: false }],
  })), []);
  const aoAbrir = useCallback((nome: string) => setCtx(c => {
    const a = c.pasta.find(x => x.nome === nome);
    return a ? { ...c, documento: documentoDe(a.nome, { ...a.imagem, px: new Uint8ClampedArray(a.imagem.px) }) } : c;
  }), []);

  const recomecar = () => {
    setCtx(definicao.contexto());
    setVida(v => v + 1);
    setNoCaderno(definicao.programa === 'plataforma');
    setAviso('');
  };

  const tarefas = useMemo(
    () => metasDa(licao).map(m => ({ id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx) })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);
  const imita = definicao.programa === 'foto' && !noCaderno;

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }} disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      {definicao.caderno && definicao.programa === 'foto' && (
        <button onClick={() => setNoCaderno(v => !v)} className="btn-secondary text-sm w-full justify-center inline-flex items-center gap-1.5">
          {noCaderno ? <><IconeDeImagem className="w-4 h-4" /> Voltar ao editor</> : <><NotebookPen className="w-4 h-4" /> Abrir o caderno</>}
        </button>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa="editor-de-foto" imitaPrograma={imita} tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={imita ? 26 : 0}>
      <style>{CSS_DO_EDITOR_DE_FOTO}</style>
      {noCaderno && (
        /* O fim da lista sobe acima da cápsula da plataforma, que mora no canto de baixo. */
        <div className="p-4 sm:p-6 pb-24 overflow-auto h-full">
          <CadernoDaFoto key={`c-${vida}`} ctx={ctx} mudar={setCtx} licao={licao} />
        </div>
      )}
      {/* O editor continua montado enquanto o caderno está à frente: o histórico
          do Ctrl+Z é dele. O arranjo vai no style, e não em classe da folha:
          ela só entra junto com o editor. */}
      {ctx.documento && (
        <div style={{ display: noCaderno ? 'none' : 'flex', flex: 1, minHeight: 0, flexDirection: 'column', position: 'relative' }}>
          <EditorDeFoto key={`e-${licao}-${vida}`} documento={ctx.documento}
            mudar={documento => setCtx(c => ({ ...c, documento }))}
            pasta={ctx.pasta} aoAbrir={ctx.pasta.length ? aoAbrir : undefined} aoExportar={aoExportar}
            antes={licao === 'completa' ? antes : undefined} aoVer={aoVer} aoAvisar={avisar} />
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
