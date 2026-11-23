import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ListChecks, Lock, RotateCcw, RotateCw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, StatusDaIde, AlternadorDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import {
  FONTE_DA_PAGINA, ehDaPagina,
  type Arquivos, type DetalhesDoElemento, type EntradaDoConsole, type MensagemDaPagina, type NoDaArvore,
  type Passo, type RequisicaoDaPagina, type ResultadoDoCenario,
} from '../labs/paginaViva';
import { linhaNoArquivo, montarPaginaDeReact, type Biblioteca } from '../labs/paginaDeReact';
import type { ResultadoDoReact } from '../labs/compiladorReact';
import type { AnaliseDeReact } from '../labs/analiseReact';
import { respostaDaBrasilApi } from '../labs/brasilApiGuardada';
import { arquivosDoCenario, type ContextoDoReact } from '../labs/metasDaCcFe006';
import { LICOES_DE_REACT } from '../labs/licoesDeReact';
import { CSS_DAS_FERRAMENTAS, FerramentasDoNavegador, type GuiaDasFerramentas } from '../labs/ferramentasDoNavegador';
import { CompiladorNoNavegador } from '../labs/typescriptRuntime';
import { BIBLIOTECAS_DO_REACT } from '../labs/bibliotecasDoReact';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/**
 * O laboratório de React: o editor com os arquivos do projeto e o painel de
 * Problemas embaixo dele, a página ao lado e as ferramentas do navegador
 * embaixo dela.
 *
 * ── É o `npm run dev` ────────────────────────────────────────────────────
 * A cada pausa na digitação o projeto se compila de novo e a página se
 * refaz, como o Vite faz. O painel de Problemas é o editor sublinhando; a
 * página roda **mesmo com** erro de tipo, porque o Vite não espera a
 * verificação — só o erro de sintaxe a segura, com a tela vermelha por cima.
 *
 * As tarefas rodam no botão Conferir, em páginas escondidas, como na
 * CC-FE004: mudou o código depois de conferir, elas pedem outra conferência.
 *
 * ── O endereço ───────────────────────────────────────────────────────────
 * A barra mostra o pedaço depois do `#`, que é onde o `HashRouter` guarda a
 * tela, e aceita um endereço digitado — é por ela que se chega a uma rota
 * sem link nenhum, como quem cola um endereço que recebeu.
 */

const SANDBOX_DA_PREVIA = 'allow-scripts allow-forms allow-modals';
const SANDBOX_DA_CONFERENCIA = 'allow-scripts allow-forms';

export interface AmbienteDoReact {
  compilar: (pasta: Arquivos) => Promise<{ react: ResultadoDoReact; analise: Record<string, AnaliseDeReact> }>;
  bibliotecas: Biblioteca[];
  /**
   * Quem roda cada cenário da conferência. Na tela é a página escondida; na
   * trava que clica é o jsdom com a mesma página dentro, porque o jsdom não
   * roda o `srcdoc` de um `iframe` com sandbox.
   */
  rodarCenario?: (html: string, passos: Passo[]) => Promise<ResultadoDoCenario>;
}

let compiladorPadrao: CompiladorNoNavegador | null = null;
const AMBIENTE_PADRAO: AmbienteDoReact = {
  compilar: pasta => {
    compiladorPadrao ??= new CompiladorNoNavegador();
    return compiladorPadrao.compilarReact(pasta);
  },
  bibliotecas: BIBLIOTECAS_DO_REACT,
};

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

const linguagemDe = (nome: string) => (nome.endsWith('.css') ? 'css' : /\.tsx?$/.test(nome) ? 'typescript' : 'html');
const NOME_DA_LINGUAGEM: Record<string, string> = { css: 'CSS', typescript: 'TypeScript JSX', html: 'HTML' };
const GUIAS: GuiaDasFerramentas[] = ['elementos', 'console', 'rede'];

interface Compilado { assinatura: string; react: ResultadoDoReact; analise: Record<string, AnaliseDeReact> }

export default function LaboratorioDeReact({ vereda, licao, userId, aoVencer, aoSair, ambiente = AMBIENTE_PADRAO }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'react' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
  ambiente?: AmbienteDoReact;
}) {
  const definicao = LICOES_DE_REACT[licao.licao];
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

  /* ── A compilação, a cada pausa ─────────────────────────────────────── */

  const assinatura = JSON.stringify(arquivos);
  const [compilado, setCompilado] = useState<Compilado | null>(null);
  useEffect(() => {
    let vivo = true;
    const deAgora = arquivos;
    const t = setTimeout(() => {
      void ambiente.compilar(deAgora).then(r => {
        if (vivo) setCompilado({ assinatura: JSON.stringify(deAgora), react: r.react, analise: r.analise });
      });
    }, 450);
    return () => { vivo = false; clearTimeout(t); };
  }, [arquivos, ambiente]);
  const emDia = compilado !== null && compilado.assinatura === assinatura;

  /* ── A prévia: a última compilação que chegou ───────────────────────── */

  const [versao, setVersao] = useState(0);
  const [semConexao, setSemConexao] = useState(false);
  const semConexaoRef = useRef(semConexao);
  semConexaoRef.current = semConexao;
  const pagina = useMemo(() => {
    if (!compilado) return null;
    return montarPaginaDeReact(JSON.parse(compilado.assinatura) as Arquivos, compilado.react,
      { offline: semConexaoRef.current, bibliotecas: ambiente.bibliotecas });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `versao` remonta a página de propósito
  }, [compilado, versao, ambiente.bibliotecas]);
  /* Quem traduz a linha do console é a compilação que gerou a página. */
  const compiladoDaPrevia = useRef<ResultadoDoReact | null>(null);
  compiladoDaPrevia.current = compilado?.react ?? null;

  const previa = useRef<HTMLIFrameElement>(null);
  const [arvore, setArvore] = useState<NoDaArvore | null>(null);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [detalhes, setDetalhes] = useState<DetalhesDoElemento | null>(null);
  const [escolhendo, setEscolhendo] = useState(false);
  const [entradas, setEntradas] = useState<EntradaDoConsole[]>([]);
  const [requisicoes, setRequisicoes] = useState<RequisicaoDaPagina[]>([]);
  const [guia, setGuia] = useState<GuiaDasFerramentas>('console');
  const [endereco, setEndereco] = useState('');
  const [digitado, setDigitado] = useState<string | null>(null);
  const recarregando = useRef(false);

  useEffect(() => {
    setArvore(null); setEscolhido(null); setDetalhes(null); setEscolhendo(false);
    setRequisicoes([]); setEndereco('');
    setEntradas(recarregando.current ? [{ nivel: 'info', texto: 'Navegou para localhost:5173' }] : []);
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
    const prazo = setTimeout(() => fim(naoRespondeu()), 15000);
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
        case 'console': {
          const c = compiladoDaPrevia.current;
          const linha = linhaNoArquivo(c, m.entrada.arquivo, m.entrada.linha);
          /* A pilha de componentes que o React escreve no aviso — "at App
             (App.tsx:12:27)" — também aponta o JavaScript gerado. */
          const texto = m.entrada.texto.replace(/([\w./-]+\.tsx?):(\d+):(\d+)/g,
            (_, arq: string, l: string) => `${arq}:${linhaNoArquivo(c, arq, Number(l))}`);
          setEntradas(l => [...l, { ...m.entrada, texto, linha }].slice(-500));
          break;
        }
        case 'rede': setRequisicoes(l => (l.some(r => r.id === m.req.id) ? l.map(r => (r.id === m.req.id ? m.req : r)) : [...l, m.req])); break;
        case 'recarga':
          recarregando.current = true;
          setVersao(v => v + 1);
          break;
        case 'endereco': setEndereco(m.hash); break;
        case 'detalhes': setDetalhes(m.detalhes); break;
        case 'escolhido':
          setArvore(m.arvore); setEscolhido(m.id); setDetalhes(m.detalhes); setEscolhendo(false); setGuia('elementos');
          break;
        default: break;
      }
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, []);

  /* ── A conferência ───────────────────────────────────────────────────── */

  const [conferencia, setConferencia] = useState<{ assinatura: string; resultados: Record<string, ResultadoDoCenario> } | null>(null);
  const [conferindo, setConferindo] = useState(false);
  const velha = conferencia !== null && conferencia.assinatura !== assinatura;

  const conferir = useCallback(async () => {
    if (conferindo) return;
    setConferindo(true);
    setAviso('');
    const deAgora = arquivos;
    const resultados: Record<string, ResultadoDoCenario> = {};
    const compilacoes = new Map<string, ResultadoDoReact>();
    for (const c of definicao.cenarios) {
      const deles = arquivosDoCenario(c, deAgora);
      const k = JSON.stringify(deles);
      if (!compilacoes.has(k)) compilacoes.set(k, (await ambiente.compilar(deles)).react);
      const html = montarPaginaDeReact(deles, compilacoes.get(k)!, { offline: c.offline, bibliotecas: ambiente.bibliotecas });
      resultados[c.id] = await (ambiente.rodarCenario ?? rodarEscondido)(html, c.passos);
    }
    setConferencia({ assinatura: JSON.stringify(deAgora), resultados });
    setConferindo(false);
  }, [conferindo, arquivos, definicao.cenarios, ambiente, rodarEscondido]);

  const ctx = useMemo<ContextoDoReact>(() => ({
    arquivos,
    compilacao: emDia ? compilado!.react : null,
    analise: emDia ? compilado!.analise : null,
    cenarios: conferencia && !velha ? conferencia.resultados : null,
  }), [arquivos, emDia, compilado, conferencia, velha]);

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
  const linguagem = linguagemDe(aberto);
  const diagnosticos = emDia ? compilado!.react.diagnosticos : [];
  const problemasDe = (nome: string) => diagnosticos.filter(d => d.arquivo === nome).length;

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={licao.titulo}
      programa="editor-de-codigo" tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={26}>
      <style>{CSS_IDE}</style>
      <style>{CSS_DAS_FERRAMENTAS}</style>
      <style>{CSS_DO_REACT}</style>
      <div className="ide">
        <CabecalhoDaIde arquivo={aberto} projeto={definicao.projeto} aoAvisar={setAviso} />
        <AlternadorDaIde vendo={vendo} aoTrocar={setVendo} />
        <div className="ide-corpo">
          <div className={`ide-lado-codigo rx-codigo${vendo === 'codigo' ? '' : ' escondido'}`}>
            <LateralDaIde projeto={definicao.projeto} arquivos={nomes.map(nome => ({ nome, problemas: problemasDe(nome) }))}
              atual={aberto} aoAbrir={setAberto} aoAvisar={setAviso} />
            <div className="rx-centro">
              {!podeEscrever && <p className="rx-pronto">Este arquivo chega pronto — só de leitura.</p>}
              <EditorDeCodigo codigo={arquivos[aberto] ?? ''} rotulo={aberto} linguagem={linguagem} somenteLeitura={!podeEscrever}
                aoMudar={texto => { if (podeEscrever) setArquivos(a => ({ ...a, [aberto]: texto })); }} />
              <div className="rx-problemas" role="region" aria-label="Problemas">
                <div className="rx-rotulo">Problemas{emDia ? ` (${diagnosticos.length})` : ''}</div>
                <ul>
                  {!emDia && <li className="rx-nada">O compilador está lendo o projeto…</li>}
                  {emDia && diagnosticos.length === 0 && <li className="rx-nada">Nenhum problema no projeto.</li>}
                  {diagnosticos.map((d, i) => (
                    <li key={i}>
                      <button className="rx-problema" onClick={() => { if (d.arquivo && d.arquivo in arquivos) setAberto(d.arquivo); }}>
                        <span className="rx-x" aria-hidden="true">⊗</span>
                        <span className="rx-msg">{d.mensagem} <span className="rx-cod">ts({d.codigo})</span></span>
                        {d.arquivo && <span className="rx-onde">{d.arquivo}{d.linha ? ` [${d.linha}, ${d.coluna}]` : ''}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className={`ide-lado-previa rx-lado${vendo === 'previa' ? '' : ' escondido'}`}>
            <div className="rx-navegador">
              <div className="ide-previa-barra">
                <button aria-label="Recarregar a página" onClick={() => setVersao(v => v + 1)} className="rx-recarregar">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <form className="ide-previa-url rx-url" onSubmit={e => {
                  e.preventDefault();
                  if (digitado !== null) {
                    const hash = digitado.replace(/^.*?(#|$)/, '#').replace(/^#$/, '');
                    paraAPrevia({ tipo: 'ir', hash });
                  }
                  setDigitado(null);
                }}>
                  <Lock className="w-3 h-3 flex-none" />
                  <span className="rx-origem">localhost:5173/</span>
                  <input aria-label="Endereço da página" value={digitado ?? endereco} spellCheck={false}
                    onChange={e => setDigitado(e.target.value)} onBlur={() => setDigitado(null)} />
                </form>
              </div>
              {pagina
                ? <iframe key={versao} ref={previa} srcDoc={pagina} sandbox={SANDBOX_DA_PREVIA} title="A página" />
                : <div className="rx-esperando">Compilando o projeto…</div>}
            </div>
            <div className="rx-ferramentas">
              <FerramentasDoNavegador
                guias={GUIAS}
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
                script="" nomeDoScript="" paradas={[]} aoMudarParadas={() => {}} passagens={[]}
              />
            </div>
          </div>
        </div>
        <StatusDaIde problemas={diagnosticos.length} linhas={contarLinhas(arquivos[aberto] ?? '')} aoAvisar={setAviso}
          linguagem={NOME_DA_LINGUAGEM[linguagem]} somenteLeitura={!podeEscrever} />
      </div>
      <div ref={caixaEscondida} className="rx-escondidas" aria-hidden="true" />
    </LaboratorioEmTelaCheia>
  );
}

const CSS_DO_REACT = `
.rx-centro { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.rx-centro > .ide-codigo { flex: 1; min-height: 0; }
.rx-pronto { margin: 0; padding: 4px 10px; font-size: 11px; background: #2A2F3A; color: #E0C98A; }
.rx-problemas { height: 112px; flex: none; overflow: auto; border-top: 1px solid #2A2F3A; background: #181A1F; }
.rx-problemas ul { list-style: none; margin: 0; padding: 0 0 6px; }
.rx-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #8B93A7; padding: 6px 10px 4px; }
.rx-problema { width: 100%; display: flex; gap: 8px; align-items: baseline; text-align: left; background: none; border: 0;
  padding: 3px 10px; color: #D7DCE6; font-size: 12px; cursor: pointer; }
.rx-problema:hover, .rx-problema:focus-visible { background: #2A2F3A; }
.rx-x { color: #F2A099; flex: none; }
.rx-msg { flex: 1; min-width: 0; white-space: pre-wrap; }
.rx-cod, .rx-onde { color: #8B93A7; }
.rx-onde { flex: none; }
.rx-nada { color: #8B93A7; font-size: 12px; padding: 2px 10px; }
.rx-lado { flex-direction: column; border-left: 1px solid #1B1B1B; }
.rx-navegador { flex: 1; min-height: 140px; display: flex; flex-direction: column; }
.rx-navegador iframe { flex: 1; min-height: 0; width: 100%; border: 0; background: #FFFFFF; }
.rx-esperando { flex: 1; display: grid; place-items: center; background: #FFFFFF; color: #5F6368; font-size: 13px; }
.rx-recarregar { background: none; border: 0; color: #CCCCCC; cursor: pointer; display: grid; place-items: center; }
.rx-url { margin: 0; }
.rx-origem { flex: none; }
.rx-url input { flex: 1; min-width: 0; background: transparent; border: 0; color: inherit; font: inherit; padding: 0; outline: none; }
.rx-ferramentas { height: 46%; min-height: 170px; flex: none; display: flex; }
.rx-ferramentas > * { flex: 1; min-width: 0; }
.rx-escondidas { position: fixed; left: -10000px; top: 0; width: 1024px; height: 768px; overflow: hidden; pointer-events: none; }
.rx-escondidas iframe { width: 1024px; height: 768px; border: 0; }
@media (max-width: 1023px) {
  .rx-lado { border-left: 0; }
  .rx-problemas { height: 88px; }
}
`;
