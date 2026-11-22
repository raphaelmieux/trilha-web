import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ListChecks, Lock, RotateCcw, RotateCw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, StatusDaIde, AlternadorDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import {
  FONTE_DA_PAGINA, ehDaPagina, montarPagina,
  type Arquivos, type DetalhesDoElemento, type EntradaDoConsole, type MensagemDaPagina, type NoDaArvore,
  type Parada, type Passo, type RequisicaoDaPagina, type ResultadoDoCenario,
} from '../labs/paginaViva';
import { respostaDaBrasilApi } from '../labs/brasilApiGuardada';
import {
  LICOES_DA_CC_FE004, arquivosDoCenario, type ContextoDoDom, type DescobertasDoDom,
} from '../labs/metasDaCcFe004';
import { CSS_DAS_FERRAMENTAS, FerramentasDoNavegador, type GuiaDasFerramentas } from '../labs/ferramentasDoNavegador';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/**
 * O laboratório de DOM: o editor com os três arquivos, a página ao lado e as
 * ferramentas do navegador embaixo dela.
 *
 * ── A prévia é viva; a lista é da última conferência ─────────────────────
 * A página se refaz a cada pausa na digitação, como num servidor de
 * desenvolvimento, porque ver o clique responder é a lição inteira. As
 * tarefas, não: elas rodam cenários — cliques, digitação, a rede caída — em
 * páginas escondidas, e isso se faz no botão Conferir. É a regra do
 * laboratório de Python, "a lista mostra a última execução": mudou o código
 * depois de conferir, as tarefas dizem que precisam de outra conferência.
 *
 * As duas que leem o que a pessoa **viu** nas ferramentas — inspecionar um
 * elemento, passar por uma parada — andam sozinhas, porque são gesto, e não
 * resultado do código. É a família das descobertas da CC-ES004.
 *
 * ── Quem responde à página ───────────────────────────────────────────────
 * A página está numa origem opaca e pede por mensagem a resposta guardada da
 * BrasilAPI. Só se responde a quem é uma das nossas páginas — a prévia ou uma
 * das escondidas —, e a resposta vai para quem perguntou.
 */

const SANDBOX_DA_PREVIA = 'allow-scripts allow-forms allow-modals';
/* As escondidas não abrem `alert`: sem allow-modals ele volta na hora, em vez
   de parar a conferência com uma caixa na frente de quem estuda. */
const SANDBOX_DA_CONFERENCIA = 'allow-scripts allow-forms';

const responder = (alvo: MessageEventSource | null, id: number, url: string) => {
  (alvo as Window | null)?.postMessage({ fonte: FONTE_DA_PAGINA, tipo: 'resposta', id, resposta: respostaDaBrasilApi(url) }, '*');
};

const CORPO_GUARDADO = (url: string) => {
  const r = respostaDaBrasilApi(url);
  return r ? JSON.stringify(r.corpo, null, 2) : null;
};

const naoRespondeu = (): ResultadoDoCenario => ({
  leituras: {}, falhas: ['A página não respondeu — um laço que não termina segura a página inteira.'],
  recarregou: false, erros: [{ nivel: 'error', texto: 'A página não respondeu a tempo.', erro: true }],
  console: [], requisicoes: [], paradas: [],
});

export default function LaboratorioDeDom({ vereda, licao, userId, aoVencer, aoSair, rodarCenario }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'dom' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
  /**
   * Quem roda cada cenário da conferência. Na tela é a página escondida; na
   * trava que clica é o jsdom com a mesma página dentro, porque o jsdom não
   * roda o `srcdoc` de um `iframe` com sandbox. O que se conferem são os
   * mesmos cenários sobre a mesma página montada — só muda onde ela roda.
   */
  rodarCenario?: (html: string, passos: Passo[]) => Promise<ResultadoDoCenario>;
}) {
  const definicao = LICOES_DA_CC_FE004[licao.licao];
  const chave = `${vereda.code}-${licao.id}`;
  const metas = definicao.metas;

  const [arquivos, setArquivos] = useState<Arquivos>(() => {
    const g = lerRascunho<Arquivos>(userId, chave);
    const daPessoa = g?.conteudo && typeof g.conteudo === 'object' ? g.conteudo : {};
    const base = { ...definicao.arquivos };
    for (const nome of definicao.editaveis) if (typeof daPessoa[nome] === 'string') base[nome] = daPessoa[nome];
    return base;
  });
  const [aviso, setAviso] = useState(() =>
    lerRascunho(userId, chave) ? 'Seu código voltou como você deixou.' : '');
  const [aberto, setAberto] = useState(definicao.abre);
  const [vendo, setVendo] = useState<'codigo' | 'previa'>('codigo');
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const editaveis = useMemo(
    () => Object.fromEntries(definicao.editaveis.map(n => [n, arquivos[n]])),
    [definicao.editaveis, arquivos]);
  useRascunhoLocal(userId, chave, editaveis, !entregue);

  /* ── A prévia ────────────────────────────────────────────────────────── */

  const [daPrevia, setDaPrevia] = useState(arquivos);
  useEffect(() => {
    const t = setTimeout(() => setDaPrevia(arquivos), 450);
    return () => clearTimeout(t);
  }, [arquivos]);
  const [versao, setVersao] = useState(0);
  const [semConexao, setSemConexao] = useState(false);
  const [paradas, setParadas] = useState<number[]>([]);
  /* A conexão vale para a página que já está aberta, como no navegador; a
     página remontada nasce com ela. Por isso ela entra na página por ref, e
     não por dependência — trocá-la não recarrega nada. */
  const semConexaoRef = useRef(semConexao);
  semConexaoRef.current = semConexao;
  const pagina = useMemo(
    () => montarPagina(daPrevia, { offline: semConexaoRef.current, paradas, arquivoDasParadas: 'script.js' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `versao` remonta a página de propósito
    [daPrevia, paradas, versao]);

  const previa = useRef<HTMLIFrameElement>(null);
  const [arvore, setArvore] = useState<NoDaArvore | null>(null);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [detalhes, setDetalhes] = useState<DetalhesDoElemento | null>(null);
  const [escolhendo, setEscolhendo] = useState(false);
  const [entradas, setEntradas] = useState<EntradaDoConsole[]>([]);
  const [requisicoes, setRequisicoes] = useState<RequisicaoDaPagina[]>([]);
  const [passagens, setPassagens] = useState<Parada[]>([]);
  const [guia, setGuia] = useState<GuiaDasFerramentas>('console');
  const [descobertas, setDescobertas] = useState<DescobertasDoDom>({ inspecionados: [], paradas: [] });
  const recarregando = useRef(false);

  /* Página nova, painéis novos: o console e a rede do navegador também
     começam de novo a cada carregamento. */
  useEffect(() => {
    setArvore(null); setEscolhido(null); setDetalhes(null); setEscolhendo(false);
    setRequisicoes([]); setPassagens([]);
    setEntradas(recarregando.current ? [{ nivel: 'info', texto: 'Navegou para index.html' }] : []);
    recarregando.current = false;
  }, [pagina]);

  const paraAPrevia = useCallback((msg: Record<string, unknown>) => {
    previa.current?.contentWindow?.postMessage({ fonte: FONTE_DA_PAGINA, ...msg }, '*');
  }, []);

  /* ── As páginas escondidas da conferência ────────────────────────────── */

  const caixaEscondida = useRef<HTMLDivElement>(null);
  const escondidas = useRef(new Map<MessageEventSource, (m: MensagemDaPagina) => void>());

  const rodarEscondido = useCallback((html: string, passos: Passo[]) => new Promise<ResultadoDoCenario>(resolve => {
    const caixa = caixaEscondida.current;
    if (!caixa) { resolve(naoRespondeu()); return; }
    const f = document.createElement('iframe');
    f.setAttribute('sandbox', SANDBOX_DA_CONFERENCIA);
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('title', 'Conferência');
    f.tabIndex = -1;
    caixa.appendChild(f);
    const janela = f.contentWindow;
    let acabou = false;
    const fim = (r: ResultadoDoCenario) => {
      if (acabou) return;
      acabou = true;
      clearTimeout(prazo);
      if (janela) escondidas.current.delete(janela);
      f.remove();
      resolve(r);
    };
    const prazo = setTimeout(() => fim(naoRespondeu()), 10000);
    if (!janela) { fim(naoRespondeu()); return; }
    escondidas.current.set(janela, m => {
      if (m.tipo === 'pronta') janela.postMessage({ fonte: FONTE_DA_PAGINA, tipo: 'cenario', passos, vez: 1 }, '*');
      else if (m.tipo === 'resultado') fim(m.resultado);
    });
    f.srcdoc = html;
  }), []);

  /* ── O que as páginas dizem ──────────────────────────────────────────── */

  useEffect(() => {
    const ouvir = (e: MessageEvent) => {
      if (!ehDaPagina(e.data)) return;
      const m = e.data as MensagemDaPagina;
      const daPrevia = e.source !== null && e.source === previa.current?.contentWindow;
      const escondida = e.source ? escondidas.current.get(e.source) : undefined;
      if (!daPrevia && !escondida) return;
      if (m.tipo === 'pedido') { responder(e.source, m.id, m.url); return; }
      if (escondida) { escondida(m); return; }
      switch (m.tipo) {
        case 'pronta': case 'arvore': setArvore(m.arvore); break;
        case 'console': setEntradas(l => [...l, m.entrada].slice(-500)); break;
        case 'rede': setRequisicoes(l => (l.some(r => r.id === m.req.id) ? l.map(r => (r.id === m.req.id ? m.req : r)) : [...l, m.req])); break;
        case 'recarga':
          recarregando.current = true;
          setVersao(v => v + 1);
          break;
        case 'detalhes':
          setDetalhes(m.detalhes);
          if (m.detalhes) setDescobertas(d => ({ ...d, inspecionados: [...d.inspecionados, m.detalhes!] }));
          break;
        case 'escolhido':
          setArvore(m.arvore); setEscolhido(m.id); setDetalhes(m.detalhes); setEscolhendo(false); setGuia('elementos');
          if (m.detalhes) setDescobertas(d => ({ ...d, inspecionados: [...d.inspecionados, m.detalhes!] }));
          break;
        case 'parada':
          setPassagens(l => [...l, m.parada]);
          setDescobertas(d => ({ ...d, paradas: [...d.paradas, m.parada] }));
          break;
        default: break;
      }
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, []);

  /* ── A conferência ───────────────────────────────────────────────────── */

  const assinatura = JSON.stringify(arquivos);
  const [conferencia, setConferencia] = useState<{ assinatura: string; resultados: Record<string, ResultadoDoCenario> } | null>(null);
  const [conferindo, setConferindo] = useState(false);
  const velha = conferencia !== null && conferencia.assinatura !== assinatura;

  const conferir = useCallback(async () => {
    if (conferindo) return;
    setConferindo(true);
    setAviso('');
    const deAgora = arquivos;
    const resultados: Record<string, ResultadoDoCenario> = {};
    for (const c of definicao.cenarios) {
      resultados[c.id] = await (rodarCenario ?? rodarEscondido)(montarPagina(arquivosDoCenario(c, deAgora), { offline: c.offline }), c.passos);
    }
    setConferencia({ assinatura: JSON.stringify(deAgora), resultados });
    setConferindo(false);
  }, [conferindo, arquivos, definicao.cenarios, rodarEscondido, rodarCenario]);

  const ctx = useMemo<ContextoDoDom>(() => ({
    arquivos,
    cenarios: conferencia && !velha ? conferencia.resultados : null,
    descobertas,
  }), [arquivos, conferencia, velha, descobertas]);

  const tarefas = metas.map(m => {
    const feita = m.feita(ctx);
    return {
      id: m.id, titulo: m.titulo, passos: m.passos, feita,
      detalhe: feita ? undefined : velha ? 'O código mudou depois da última conferência. Clique em Conferir de novo.' : m.motivo?.(ctx),
    };
  });
  const faltam = tarefas.filter(t => !t.feita).length;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  const recomecar = () => {
    setArquivos({ ...definicao.arquivos });
    setConferencia(null);
    setParadas([]);
    setDescobertas({ inspecionados: [], paradas: [] });
    setAberto(definicao.abre);
    setAviso('');
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>A página passou em todas as tarefas.</p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={() => { void conferir(); }} disabled={conferindo}
        className="btn-primary w-full justify-center inline-flex items-center gap-1.5 disabled:opacity-50">
        <ListChecks className="w-4 h-4" /> {conferindo ? 'Conferindo…' : 'Conferir'}
      </button>
      <button onClick={entregar} disabled={faltam > 0 || salvando || conferindo}
        className="btn-ghost w-full justify-center disabled:opacity-50">
        {salvando ? 'Salvando…' : faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      <button onClick={recomecar} className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  const nomes = Object.keys(definicao.arquivos);
  const podeEscrever = definicao.editaveis.includes(aberto);
  const linguagem = aberto.endsWith('.css') ? 'css' : aberto.endsWith('.js') ? 'javascript' : 'html';
  const nomeDaLinguagem = linguagem === 'css' ? 'CSS' : linguagem === 'javascript' ? 'JavaScript' : 'HTML';

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={licao.titulo}
      programa="editor-de-codigo" tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={26}>
      <style>{CSS_IDE}</style>
      <style>{CSS_DAS_FERRAMENTAS}</style>
      <style>{CSS_DO_DOM}</style>
      <div className="ide">
        <CabecalhoDaIde arquivo={aberto} projeto={definicao.projeto} aoAvisar={setAviso} />
        <AlternadorDaIde vendo={vendo} aoTrocar={setVendo} />
        <div className="ide-corpo">
          <div className={`ide-lado-codigo dom-codigo${vendo === 'codigo' ? '' : ' escondido'}`}>
            <LateralDaIde projeto={definicao.projeto} arquivos={nomes.map(nome => ({ nome, problemas: 0 }))}
              atual={aberto} aoAbrir={setAberto} aoAvisar={setAviso} />
            <EditorDeCodigo codigo={arquivos[aberto] ?? ''} rotulo={aberto} linguagem={linguagem} somenteLeitura={!podeEscrever}
              aoMudar={texto => { if (podeEscrever) setArquivos(a => ({ ...a, [aberto]: texto })); }} />
          </div>
          <div className={`ide-lado-previa dom-lado${vendo === 'previa' ? '' : ' escondido'}`}>
            <div className="dom-navegador">
              <div className="ide-previa-barra">
                <button aria-label="Recarregar a página" onClick={() => setVersao(v => v + 1)} className="dom-recarregar">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <div className="ide-previa-url">
                  <Lock className="w-3 h-3 flex-none" />
                  <span className="truncate">localhost:5500/index.html</span>
                </div>
              </div>
              <iframe key={versao} ref={previa} srcDoc={pagina} sandbox={SANDBOX_DA_PREVIA} title="A página" />
            </div>
            <div className="dom-ferramentas">
              <FerramentasDoNavegador
                guia={guia} aoTrocarDeGuia={g => { setGuia(g); if (g === 'elementos') paraAPrevia({ tipo: 'arvore' }); }}
                arvore={arvore} escolhido={escolhido} detalhes={detalhes}
                aoEscolher={id => { setEscolhido(id); paraAPrevia({ tipo: 'realcar', id }); }}
                escolhendoNaPagina={escolhendo}
                aoAlternarSeletor={() => { const l = !escolhendo; setEscolhendo(l); paraAPrevia({ tipo: 'escolher', ligado: l }); }}
                console={entradas} aoLimparConsole={() => setEntradas([])}
                aoAvaliar={codigo => paraAPrevia({ tipo: 'avaliar', codigo })}
                requisicoes={requisicoes} semConexao={semConexao}
                aoMudarConexao={sem => { setSemConexao(sem); paraAPrevia({ tipo: 'offline', valor: sem }); }}
                respostaDe={CORPO_GUARDADO}
                script={arquivos['script.js'] ?? ''} nomeDoScript="script.js"
                paradas={paradas} aoMudarParadas={setParadas} passagens={passagens}
              />
            </div>
          </div>
        </div>
        <StatusDaIde problemas={faltam} linhas={contarLinhas(arquivos[aberto] ?? '')} aoAvisar={setAviso}
          linguagem={nomeDaLinguagem} somenteLeitura={!podeEscrever} />
      </div>
      <div ref={caixaEscondida} className="dom-escondidas" aria-hidden="true" />
    </LaboratorioEmTelaCheia>
  );
}

const CSS_DO_DOM = `
.dom-lado { flex-direction: column; border-left: 1px solid #1B1B1B; }
.dom-navegador { flex: 1; min-height: 140px; display: flex; flex-direction: column; }
.dom-navegador iframe { flex: 1; min-height: 0; width: 100%; border: 0; background: #FFFFFF; }
.dom-recarregar { background: none; border: 0; color: #CCCCCC; cursor: pointer; display: grid; place-items: center; }
.dom-ferramentas { height: 46%; min-height: 170px; flex: none; display: flex; }
.dom-ferramentas > * { flex: 1; min-width: 0; }
.dom-escondidas { position: fixed; left: -10000px; top: 0; width: 1024px; height: 768px; overflow: hidden; pointer-events: none; }
.dom-escondidas iframe { width: 1024px; height: 768px; border: 0; }
@media (max-width: 1023px) {
  .dom-lado { border-left: 0; }
}
`;
