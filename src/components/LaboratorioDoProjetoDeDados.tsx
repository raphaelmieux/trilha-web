import { useMemo, useState } from 'react';
import { NotebookPen, RotateCcw, Table2 } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_EXCEL } from '../labs/excel';
import { CSS_DA_NUVEM } from '../labs/nuvem';
import {
  LICOES_DA_CC_ES013, contextoDe, metasDa,
  type ContextoDoProjetoDeDados, type LicaoDaCcEs013, type ProgramaDaLicao,
} from '../labs/metasDaCcEs013';
import { AnaliseNoExcel, type PropsDaSuperficieDeDados } from '../labs/dadosNaPlanilha';
import {
  CadernoDaAnaliseDeDados, ConclusaoDoRelatorio, DiarioDeLimpeza, FichaDaBaseDeDados,
  PropostaDosDados, RoteiroDaApresentacao,
} from '../labs/dadosNaPlataforma';
import { EntregaDosDados } from '../labs/dadosNaNuvem';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As onze lições da CC-ES013, numa moldura só.
 *
 * ── Três programas, e o caderno ao lado da planilha ──────────────────────
 * A planilha, a nuvem e a tela da plataforma, que é a decisão da CC-ES012: uma
 * superfície por arquivo da janela que ela veste, e aqui só o que é da
 * **moldura** — o estado do projeto, a lista de tarefas, o aviso e o despacho.
 *
 * Cinco das seis lições de planilha têm trabalho fora dela: o diário de
 * limpeza nas duas de limpeza, e o caderno da análise nas três de conta.
 * Nenhum programa de planilha tem onde guardar "por que esta linha saiu", e é
 * o arranjo do caderno da CC-ES009: a travessia mora no painel de tarefas, onde
 * as coisas da plataforma já moram, e existe nos dois sentidos. O painel do
 * módulo 8 não tem caderno, e por isso não oferece a travessia — um botão que
 * abrisse uma folha em branco prometeria trabalho que a lição não pede.
 *
 * ── O despacho é um `Record` ─────────────────────────────────────────────
 * A décima segunda lição não compila até alguém dizer em que tela ela abre e
 * se tem caderno. É a decisão do despacho da CC-ES012, pelo motivo escrito lá.
 */

type Superficie = (p: PropsDaSuperficieDeDados & { licao: LicaoDaCcEs013 }) => JSX.Element;

const SUPERFICIE: Record<LicaoDaCcEs013, Superficie> = {
  proposta: PropostaDosDados,
  base: FichaDaBaseDeDados,
  grafia: AnaliseNoExcel,
  numeros: AnaliseNoExcel,
  descritivas: AnaliseNoExcel,
  grupos: AnaliseNoExcel,
  relacao: AnaliseNoExcel,
  painel: AnaliseNoExcel,
  conclusao: ConclusaoDoRelatorio,
  apresentacao: RoteiroDaApresentacao,
  entrega: EntregaDosDados,
};

/** O caderno que a lição tem ao lado do programa, quando tem. */
const CADERNO: Record<LicaoDaCcEs013, { tela: Superficie; nome: string } | null> = {
  proposta: null,
  base: null,
  grafia: { tela: DiarioDeLimpeza, nome: 'o diário de limpeza' },
  numeros: { tela: DiarioDeLimpeza, nome: 'o diário de limpeza' },
  descritivas: { tela: CadernoDaAnaliseDeDados, nome: 'o caderno da análise' },
  grupos: { tela: CadernoDaAnaliseDeDados, nome: 'o caderno da análise' },
  relacao: { tela: CadernoDaAnaliseDeDados, nome: 'o caderno da análise' },
  painel: null,
  conclusao: null,
  apresentacao: null,
  entrega: null,
};

/**
 * O nome do programa imitado, para a lembrança do aviso de tela pequena.
 *
 * Os mesmos nomes das outras veredas — `excel`, `nuvem` —, porque a lembrança
 * é por programa: quem dispensou o aviso no Excel da CC-ES009 não é avisado de
 * novo aqui.
 */
const PROGRAMA_IMITADO: Record<ProgramaDaLicao, string> = {
  excel: 'excel',
  nuvem: 'nuvem',
  plataforma: 'projeto-de-dados',
};

const FOLHA: Record<ProgramaDaLicao, string> = {
  excel: CSS_EXCEL,
  nuvem: CSS_DA_NUVEM,
  plataforma: '',
};

/** A régua de status do Excel, que a cápsula de tarefas sobe para não cobrir. */
const RODAPE: Record<ProgramaDaLicao, number> = { excel: 28, nuvem: 0, plataforma: 0 };

export default function LaboratorioDoProjetoDeDados({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'projeto-de-dados' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const [ctx, setCtx] = useState<ContextoDoProjetoDeDados>(
    () => contextoDe(LICOES_DA_CC_ES013[licao].projeto),
  );
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [noCaderno, setNoCaderno] = useState(false);
  /* A conta de remontagens, pelo motivo escrito na CC-ES012: recomeçar troca o
     projeto por baixo da planilha, e o histórico do Ctrl+Z não pode sobreviver
     a isso. */
  const [vida, setVida] = useState(0);

  const programa = LICOES_DA_CC_ES013[licao].programa;
  const caderno = CADERNO[licao];
  const imita = !(noCaderno && caderno) && programa !== 'plataforma';

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  const mudar = (f: (c: ContextoDoProjetoDeDados) => ContextoDoProjetoDeDados) => setCtx(f);

  const recomecar = () => {
    setCtx(contextoDe(LICOES_DA_CC_ES013[licao].projeto));
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
      {caderno && (
        <button onClick={() => setNoCaderno(v => !v)}
          className="btn-secondary text-sm w-full justify-center inline-flex items-center gap-1.5">
          {noCaderno
            ? <><Table2 className="w-4 h-4" /> Voltar à planilha</>
            : <><NotebookPen className="w-4 h-4" /> Abrir {caderno.nome}</>}
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
      {FOLHA[programa] !== '' && <style>{FOLHA[programa]}</style>}
      {/*
        A planilha continua montada enquanto o caderno está aberto, escondida:
        o histórico do Ctrl+Z é dela, e desmontá-la para mostrar o caderno
        jogaria fora o que a pessoa podia desfazer ao voltar.
      */}
      {caderno && noCaderno && (
        <Rolavel>
          <caderno.tela key={`c-${licao}-${vida}`} ctx={ctx} mudar={mudar} avisar={avisar} licao={licao} />
        </Rolavel>
      )}
      <div style={{ display: noCaderno && caderno ? 'none' : 'contents' }}>
        {programa === 'plataforma' ? (
          <Rolavel>
            <SuperficieDaLicao Tela={SUPERFICIE[licao]} key={`${licao}-${vida}`}
              ctx={ctx} mudar={mudar} avisar={avisar} licao={licao} />
          </Rolavel>
        ) : (
          <SuperficieDaLicao Tela={SUPERFICIE[licao]} key={`${licao}-${vida}`}
            ctx={ctx} mudar={mudar} avisar={avisar} licao={licao} />
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/* A tela da plataforma rola dentro da moldura, que é de altura fixa: é o
   arranjo do caderno da CC-ES009. Sem isto, a ficha da base e o roteiro saíam
   cortados embaixo, com o botão de enviar fora do alcance. */
function Rolavel({ children }: { children: React.ReactNode }) {
  return <div className="p-4 sm:p-6 overflow-auto h-full">{children}</div>;
}

function SuperficieDaLicao({ Tela, ...props }: PropsDaSuperficieDeDados & { licao: LicaoDaCcEs013; Tela: Superficie }) {
  return <Tela {...props} />;
}
