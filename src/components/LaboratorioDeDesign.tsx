import { useCallback, useMemo, useState } from 'react';
import { Layers, NotebookPen, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_DO_EDITOR_DE_DESIGN, EditorDeDesign } from '../labs/editorDeDesign';
import { AnaliseDasPecas, CadernoDeDesign, type PropsDaTelaDeDesign } from '../labs/designNaPlataforma';
import { ESCALA } from '../labs/arteDoClube';
import {
  CHAVE_DA_PROVA, CHAVE_SEM_COR, LICOES_DA_CC_DG001, chaveDaMedida, metasDa,
  type ContextoDoDesign, type LicaoDaCcDg001, type ProgramaDaLicao,
} from '../labs/metasDaCcDg001';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As oito lições da CC-DG001, numa moldura só.
 *
 * ── O editor, e o caderno ao lado ────────────────────────────────────────
 * Sete lições abrem o editor de design, e uma — a análise — é tela da
 * plataforma inteira. Três das sete têm trabalho que nenhum editor guarda: o
 * porquê de cada cor, o par de famílias e a cor que não carrega sozinha. É o
 * arranjo do caderno da CC-ES009 e da CC-ES013: a travessia mora no painel de
 * tarefas, onde as coisas da plataforma já moram, e só existe nas lições que
 * têm caderno.
 *
 * ── O que a janela viu, e o que conta ────────────────────────────────────
 * O editor avisa o que aconteceu — a prova de impressão ligada, a simulação
 * de visão numa prancha, um texto medido — e é aqui que se decide o que vira
 * descoberta. A simulação conta só na escala da cantina e só na deuteranopia,
 * porque é isso que a tarefa pede; tons de cinza mostram outra coisa.
 */

/** O nome do programa imitado, para a lembrança do aviso de tela pequena. */
const PROGRAMA_IMITADO: Record<ProgramaDaLicao, string> = {
  design: 'editor-de-design',
  plataforma: 'fundamentos-visuais',
};

/** A régua de status do editor, que a cápsula de tarefas sobe para não cobrir. */
const RODAPE: Record<ProgramaDaLicao, number> = { design: 24, plataforma: 0 };

/**
 * A tela de cada lição que não abre o editor.
 *
 * Parcial, porque só a análise é da plataforma; a trava de clique monta toda
 * lição com `programa: 'plataforma'`, e uma nona lição sem tela reprova lá em
 * vez de abrir em branco.
 */
const TELA_DA_PLATAFORMA: Partial<Record<LicaoDaCcDg001, (p: PropsDaTelaDeDesign) => JSX.Element>> = {
  analise: AnaliseDasPecas,
};

export default function LaboratorioDeDesign({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'design' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const definicao = LICOES_DA_CC_DG001[licao];
  const [ctx, setCtx] = useState<ContextoDoDesign>(() => definicao.contexto);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(false);
  /* A conta de remontagens: recomeçar troca o arquivo por baixo do editor, e o
     histórico do Ctrl+Z dele não pode sobreviver a isso. */
  const [vida, setVida] = useState(0);

  const programa = definicao.programa;
  const imita = programa === 'design' && !noCaderno;

  const mudar = (f: (c: ContextoDoDesign) => ContextoDoDesign) => setCtx(f);

  /** Uma descoberta, uma vez: o mesmo objeto de volta quando ela já está lá. */
  const descobrir = useCallback((chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }
  )), []);

  const aoVer = useCallback((chave: string) => {
    if (chave.startsWith('prova:')) descobrir(CHAVE_DA_PROVA);
    if (chave === `visao:deuteranopia:${ESCALA}`) descobrir(CHAVE_SEM_COR);
  }, [descobrir]);

  const aoMedir = useCallback((prancha: string, texto: string) => descobrir(chaveDaMedida(prancha, texto)), [descobrir]);

  const recomecar = () => {
    setCtx(definicao.contexto);
    setVida(v => v + 1);
    setNoCaderno(false);
    setAviso('');
  };

  const tarefas = useMemo(
    () => metasDa(licao).map(m => ({
      id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx),
    })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);

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
      programa={PROGRAMA_IMITADO[programa]}
      imitaPrograma={imita}
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={imita ? RODAPE[programa] : 0}
    >
      {programa === 'design' && <style>{CSS_DO_EDITOR_DE_DESIGN}</style>}
      {noCaderno && (
        <Rolavel><CadernoDeDesign key={`c-${vida}`} ctx={ctx} mudar={mudar} licao={licao} /></Rolavel>
      )}
      {/*
        O editor continua montado enquanto o caderno está aberto, escondido: o
        histórico do Ctrl+Z é dele, e desmontá-lo jogaria fora o que a pessoa
        podia desfazer ao voltar.
      */}
      {programa === 'design' ? (
        <div style={{ display: noCaderno ? 'none' : 'contents' }}>
          <EditorDeDesign key={`e-${licao}-${vida}`} arte={ctx.arte}
            mudar={arte => setCtx(c => ({ ...c, arte }))}
            pranchaInicial={definicao.prancha} aoVer={aoVer} aoMedir={aoMedir} />
        </div>
      ) : (
        <Rolavel>
          <TelaDaPlataforma licao={licao} ctx={ctx} mudar={mudar} key={`p-${vida}`} />
        </Rolavel>
      )}
    </LaboratorioEmTelaCheia>
  );
}

function TelaDaPlataforma(props: PropsDaTelaDeDesign) {
  const Tela = TELA_DA_PLATAFORMA[props.licao];
  if (!Tela) throw new Error(`a lição ${props.licao} não tem tela da plataforma`);
  return <Tela {...props} />;
}

/* A tela da plataforma rola dentro da moldura, que é de altura fixa: é o
   arranjo do caderno da CC-ES009. */
function Rolavel({ children }: { children: React.ReactNode }) {
  return <div className="p-4 sm:p-6 overflow-auto h-full">{children}</div>;
}

