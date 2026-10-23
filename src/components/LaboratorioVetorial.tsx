import { useCallback, useMemo, useState } from 'react';
import { FileText, Layers, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign, type ArquivoExportado } from '../labs/editorDeDesign';
import { BarraDeTarefas, BlocoDeNotas, CSS_DO_BLOCO_DE_NOTAS } from '../labs/blocoDeNotas';
import { CadernoVetorial } from '../labs/cadernoVetorial';
import {
  LICOES_DA_CC_DG002, metasDa,
  type ArquivoNaPasta, type ContextoVetorial, type ProgramaDaLicao,
} from '../labs/metasDaCcDg002';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As nove lições da CC-DG002, numa moldura só.
 *
 * ── O mesmo editor da CC-DG001, e um segundo programa na última lição ────
 * Oito lições abrem só o editor de design. A nona abre também o editor de
 * texto, porque o requisito 7 manda abrir o SVG nele: dois programas abertos
 * querem dizer barra de tarefas, que é a regra do laboratório de compactar da
 * AP041, escrita lá.
 *
 * ── A pasta é do laboratório ─────────────────────────────────────────────
 * O que o editor exporta cai em `arquivos`, e é de lá que o editor de texto
 * abre e o de desenho reabre. Os dois programas leem a mesma pasta: o arquivo
 * salvo num é o que o outro abre, e é essa travessia que mostra o efeito da
 * coordenada mudada à mão.
 */

type Tela = 'design' | 'texto';

const PROGRAMAS = [
  { id: 'design' as const, nome: 'Editor de design', icone: Layers },
  { id: 'texto' as const, nome: 'Editor de texto', icone: FileText },
];

/** A régua do editor, e a barra de tarefas quando ela existe. */
const RODAPE: Record<ProgramaDaLicao, number> = { 'design': 24, 'design-e-texto': 54 };

export default function LaboratorioVetorial({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'vetorial' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG002[licao];
  const [ctx, setCtx] = useState<ContextoVetorial>(() => definicao.contexto);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(false);
  const [tela, setTela] = useState<Tela>('design');
  const [abertoNoTexto, setAbertoNoTexto] = useState<string | null>(null);
  const [vida, setVida] = useState(0);

  const programa = definicao.programa;
  const imita = !noCaderno;

  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  }, []);

  /* Toda chave que o editor avisa vira descoberta: as metas desta vereda
     pedem a chave exata — o zoom de 800% no emblema, os tamanhos do ícone, o
     SVG reaberto —, e a lista as guarda uma vez cada. */
  const aoVer = useCallback((chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }
  )), []);

  /* Exportar de novo com o mesmo nome escreve por cima, como em todo sistema:
     o que se tinha mexido à mão no arquivo some, e o exportado passa a ser o
     de agora. */
  const aoExportar = useCallback((a: ArquivoExportado) => setCtx(c => ({
    ...c,
    arquivos: [...c.arquivos.filter(x => x.nome !== a.nome), { ...a, exportado: a.conteudo } satisfies ArquivoNaPasta],
  })), []);

  const salvarTexto = (nome: string, conteudo: string) => setCtx(c => ({
    ...c, arquivos: c.arquivos.map(a => (a.nome === nome ? { ...a, conteudo } : a)),
  }));

  const recomecar = () => {
    setCtx(definicao.contexto);
    setVida(v => v + 1);
    setNoCaderno(false);
    setTela('design');
    setAbertoNoTexto(null);
    setAviso('');
  };

  const tarefas = useMemo(
    () => metasDa(licao).map(m => ({
      id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx),
    })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);

  const textos = ctx.arquivos.filter(a => a.tipo === 'svg');
  const aberto = textos.find(a => a.nome === abertoNoTexto) ?? null;

  const acoes = (
    <div className="flex flex-col gap-2">
      <button
        onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }}
        disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50"
      >
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      {definicao.caderno && (
        <button onClick={() => setNoCaderno(v => !v)}
          className="btn-secondary text-sm w-full justify-center inline-flex items-center gap-1.5">
          {noCaderno
            ? <><Layers className="w-4 h-4" /> Voltar ao editor</>
            : <><NotebookPen className="w-4 h-4" /> Abrir o caderno</>}
        </button>
      )}
      <button onClick={recomecar}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={daLicao.titulo}
      programa="editor-de-design"
      imitaPrograma={imita}
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={imita ? RODAPE[programa] : 0}
    >
      <style>{CSS_DO_EDITOR_DE_DESIGN}</style>
      {programa === 'design-e-texto' && <style>{CSS_DO_BLOCO_DE_NOTAS}</style>}
      {noCaderno && (
        <div className="p-4 sm:p-6 overflow-auto h-full">
          <CadernoVetorial key={`c-${vida}`} ctx={ctx} mudar={f => setCtx(f)} licao={licao} />
        </div>
      )}
      {/* O editor continua montado enquanto o caderno ou o editor de texto
          estão à frente: o histórico do Ctrl+Z é dele. */}
      {/* A área e o palco levam o arranjo no style, e não nas classes do Bloco de
          Notas: a folha dele só entra na lição que o abre, e sem ela as oito
          outras desenhariam o editor sem altura nenhuma. */}
      <div style={{ display: noCaderno ? 'none' : 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: tela === 'design' ? 'contents' : 'none' }}>
            <EditorDeDesign key={`e-${licao}-${vida}`} arte={ctx.arte}
              mudar={arte => setCtx(c => ({ ...c, arte }))}
              pranchaInicial={definicao.prancha} nomeDoArquivo="Desenho vetorial do clube"
              aoVer={aoVer} aoAvisar={avisar} aoExportar={aoExportar}
              svgsParaReabrir={textos.map(a => ({ nome: a.nome, conteudo: a.conteudo }))} />
          </div>
          {programa === 'design-e-texto' && tela === 'texto' && (
            <BlocoDeNotas aberto={aberto ? { nome: aberto.nome, conteudo: aberto.conteudo } : null}
              naPasta={textos.map(a => ({ nome: a.nome, conteudo: a.conteudo }))}
              aoAbrir={setAbertoNoTexto} aoSalvar={salvarTexto} pasta="Desenhos" />
          )}
        </div>
        {programa === 'design-e-texto' && <BarraDeTarefas programas={PROGRAMAS} atual={tela} aoTrocar={setTela} />}
      </div>
    </LaboratorioEmTelaCheia>
  );
}
