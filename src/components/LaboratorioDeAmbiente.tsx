import { useEffect, useState } from 'react';
import { CheckCircle2, Globe, FileText, Terminal, Package, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_WINDOWS } from '../labs/windows';
import {
  JanelaNavegador, JanelaInstalador, JanelaNotas, JanelaPrompt,
} from '../labs/janelasDoPython';
import {
  estadoInicial, validarAmbiente, TITULO_DA_JANELA, PROGRAMA_DA_LICAO,
  type EstadoDoAmbiente, type Janela, type Origem, type Instalacao,
  type CheckResult,
} from '../labs/ambientePython';
import { PASSOS_DO_AMBIENTE } from '../labs/passosDoAmbiente';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório em que o Python é instalado num computador simulado.
 *
 * ── Área de trabalho, e não sanfona ──────────────────────────────────────
 * São quatro programas — navegador, instalador, Bloco de Notas e prompt — e
 * empilhá-los em cartões faria um acordeão que não existe em computador nenhum.
 * O que existe é área de trabalho, com janelas por cima e barra de tarefas
 * embaixo. É a mesma escolha do laboratório de compactar da AP042, e é por isso
 * que os dois passam o mesmo `programa`: quem dispensou o aviso de tela pequena
 * num não precisa dispensá-lo no outro.
 *
 * ── A janela abre maximizada ─────────────────────────────────────────────
 * Não é simplificação: num computador de clube, e mais ainda num celular, é
 * assim que se usa. Minimizar devolve a área de trabalho, com os atalhos —
 * é o gesto que o desbravador já conhece, e é o que faz a barra de tarefas
 * significar alguma coisa.
 */

const ICONES: Record<Janela, React.ReactNode> = {
  navegador: <Globe className="w-5 h-5" />,
  instalador: <Package className="w-5 h-5" />,
  notas: <FileText className="w-5 h-5" />,
  prompt: <Terminal className="w-5 h-5" />,
};

/* O instalador só existe depois de baixado — é ele que chega pelo download, e
   não um programa que o computador já tinha. */
const NA_BARRA: Janela[] = ['navegador', 'notas', 'prompt'];

export default function LaboratorioDeAmbiente({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'ambiente' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const [estado, setEstado] = useState<EstadoDoAmbiente>(estadoInicial);
  const [foco, setFoco] = useState<Janela | null>(null);
  const [abertas, setAbertas] = useState<Janela[]>([]);
  const [texto, setTexto] = useState('');
  const [baixando, setBaixando] = useState<number | null>(null);
  const [aviso, setAviso] = useState('');
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const resultados: CheckResult[] = validarAmbiente(estado, licao.verificacoes);
  const passaram = resultados.filter(r => r.passed).length;
  const tudoPassa = passaram === resultados.length && resultados.length > 0;

  const abrir = (j: Janela) => {
    setFoco(j);
    setAbertas(a => (a.includes(j) ? a : [...a, j]));
  };
  const fecharJanela = (j: Janela) => {
    setFoco(null);
    setAbertas(a => a.filter(x => x !== j));
  };

  /* O download anda sozinho. Sem isto, "baixar" seria um clique que já entrega
     o arquivo, e o que se reconhece depois é justamente a espera. */
  useEffect(() => {
    if (baixando === null) return;
    if (baixando >= 100) {
      setEstado(e => ({ ...e, baixadoDe: 'oficial' }));
      setBaixando(null);
      return;
    }
    const t = setTimeout(() => setBaixando(p => (p ?? 0) + 10), 110);
    return () => clearTimeout(t);
  }, [baixando]);

  const escolherResultado = (origem: Origem) => {
    if (origem !== 'agregador') return;
    /*
      O site que junta programas não recusa nada: ele baixa. O que ele entrega é
      um instalador acompanhado, e é isso que a verificação vai apontar — não um
      bloqueio nosso dizendo "não clique aí". Errar aqui é de graça, e é o único
      lugar onde vai ser.
    */
    setEstado(e => ({ ...e, baixadoDe: 'agregador' }));
    setAviso('O download veio de um site que junta programas. Repare no endereço: python.org é o único oficial.');
  };

  const instalar = (escolhas: Instalacao) => {
    setEstado(e => ({ ...e, instalado: escolhas }));
    setAviso(escolhas.noPath
      ? 'Python instalado, com o PATH marcado.'
      : 'Python instalado. A caixa do PATH ficou desmarcada — o prompt vai reclamar.');
  };

  const salvar = (nome: string, conteudo: string) => {
    setEstado(e => ({ ...e, documentos: { ...e.documentos, [nome]: conteudo } }));
    setAviso(`Salvo em Documentos como "${nome}".`);
  };

  const recomecar = () => {
    setEstado(estadoInicial());
    setAbertas([]); setFoco(null); setTexto(''); setBaixando(null);
    setAviso('Computador recomeçado do zero.');
  };

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          O Python está instalado e o programa rodou a partir do arquivo.
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS_DO_AMBIENTE[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!tudoPassa || salvando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…' : tudoPassa ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={recomecar}
        className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  const janelaDoFoco = () => {
    if (foco === 'navegador') {
      return (
        <JanelaNavegador
          aviso={estado.baixadoDe === 'agregador' ? 'Este download veio de um site que junta programas. Baixe de python.org.' : null}
          baixando={baixando}
          baixado={estado.baixadoDe !== null}
          aoEscolher={escolherResultado}
          aoBaixar={() => setBaixando(0)}
          aoAbrirBaixado={() => abrir('instalador')}
          aoMinimizar={() => setFoco(null)}
          aoFechar={() => fecharJanela('navegador')}
        />
      );
    }
    if (foco === 'instalador') {
      return (
        <JanelaInstalador
          jaInstalado={estado.instalado}
          aoInstalar={instalar}
          aoMinimizar={() => setFoco(null)}
          aoFechar={() => fecharJanela('instalador')}
        />
      );
    }
    if (foco === 'notas') {
      return (
        <JanelaNotas
          texto={texto}
          aoEscrever={setTexto}
          aoSalvar={salvar}
          aoMinimizar={() => setFoco(null)}
          aoFechar={() => fecharJanela('notas')}
        />
      );
    }
    if (foco === 'prompt') {
      return (
        <JanelaPrompt
          estado={estado}
          aoMudar={setEstado}
          aoMinimizar={() => setFoco(null)}
          aoFechar={() => fecharJanela('prompt')}
        />
      );
    }
    return null;
  };

  /* O instalador entra na barra só depois de baixado, como um programa que
     acabou de chegar pelo navegador. */
  const naBarra: Janela[] = estado.baixadoDe ? [...NA_BARRA, 'instalador'] : NA_BARRA;

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="area-de-trabalho"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      /* A barra de tarefas tem 46 px e é do computador imitado: a cápsula da
         plataforma sobe para não cair em cima dela. */
      rodape={46}
    >
      <style>{CSS_WINDOWS}</style>
      <div className="win-mesa">
        <div className="win-area">
          {/* Os atalhos da área de trabalho, que é o que se vê quando nada está
              aberto — e o outro caminho para abrir cada programa. */}
          <div className="flex flex-col gap-4 p-4" style={{ width: 92 }}>
            {naBarra.map(j => (
              <button key={j} onClick={() => abrir(j)}
                className="flex flex-col items-center gap-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFF' }}>
                <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.6))' }}>{ICONES[j]}</span>
                <span style={{ fontSize: 11, textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,.8)' }}>
                  {TITULO_DA_JANELA[j]}
                </span>
              </button>
            ))}
          </div>

          {foco && (
            <div className="win-janela cheia">
              {janelaDoFoco()}
            </div>
          )}
        </div>

        <div className="win-tarefas">
          {naBarra.map(j => (
            <button key={j} onClick={() => (foco === j ? setFoco(null) : abrir(j))}
              className={abertas.includes(j) ? 'aberta' : ''}
              title={TITULO_DA_JANELA[j]} aria-label={TITULO_DA_JANELA[j]}>
              {ICONES[j]}
            </button>
          ))}
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/** O programa que a lição manda copiar para o Bloco de Notas. */
export { PROGRAMA_DA_LICAO };
