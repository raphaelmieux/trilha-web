import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleX, Lock, Monitor, Play, RotateCcw, Smartphone } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, EditorDeCodigo } from '../labs/ide';
import { FONTE_DA_PAGINA, ehDaPagina, type EntradaDoConsole, type MensagemDaPagina } from '../labs/paginaViva';
import { respostaDaBrasilApi } from '../labs/brasilApiGuardada';
import type { ResultadoDoReact } from '../labs/compiladorReact';
import {
  DONO, EDITAVEIS_DO_REPOSITORIO, ENDERECO_DO_SITE, METAS_DA_HOSPEDAGEM, REPOSITORIO, contextoDaHospedagem,
  fontesDoSite, paginaDoSite, rodarAEsteira, type ContextoDaHospedagem, type FonteDoPages,
} from '../labs/hospedagem';
import type { AmbienteDoReact } from './LaboratorioDeReact';
import { CompiladorNoNavegador } from '../labs/typescriptRuntime';
import { BIBLIOTECAS_DO_REACT } from '../labs/bibliotecasDoReact';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/**
 * A publicação da agenda: o site do repositório, com o código, as execuções
 * da esteira e a configuração do Pages, e numa guia ao lado o site publicado.
 *
 * ── A tela é o site do repositório, e não um painel da plataforma ────────
 * É onde a publicação acontece de verdade: edita-se o arquivo no editor do
 * site, confirma-se a alteração, a esteira roda sozinha, e o registro dela
 * diz o que deu errado. O que não se imita é a marca — a janela tem o arranjo
 * de qualquer serviço de repositório, e as palavras são as do GitHub em
 * português, que é o que o desbravador vai encontrar.
 *
 * ── O site publicado é a página viva ─────────────────────────────────────
 * Quando a publicação funciona, a guia do site é a agenda rodando, a mesma
 * página da CC-FE006. Quando não funciona, é a página **em branco** com o 404
 * no console — que é o que de fato se vê, e o que faz a armadilha custar.
 */

const SANDBOX = 'allow-scripts allow-forms allow-modals';
type Guia = 'codigo' | 'acoes' | 'configuracoes' | 'site';

let compiladorPadrao: CompiladorNoNavegador | null = null;
const AMBIENTE_PADRAO: AmbienteDoReact = {
  compilar: pasta => {
    compiladorPadrao ??= new CompiladorNoNavegador();
    return compiladorPadrao.compilarReact(pasta);
  },
  bibliotecas: BIBLIOTECAS_DO_REACT,
};

const linguagemDe = (nome: string) => (nome.endsWith('.css') ? 'css' : nome.endsWith('.json') ? 'json' : /\.(tsx?|ya?ml)$/.test(nome) ? 'typescript' : 'html');

export default function LaboratorioDeHospedagem({ vereda, licao, aoVencer, aoSair, ambiente = AMBIENTE_PADRAO }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'hospedagem' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
  ambiente?: AmbienteDoReact;
}) {
  const [ctx, setCtx] = useState<ContextoDaHospedagem>(contextoDaHospedagem);
  const [rascunho, setRascunho] = useState(ctx.repositorio);
  const [aberto, setAberto] = useState('CartaoDeEvento.tsx');
  const [mensagem, setMensagem] = useState('');
  const [guia, setGuia] = useState<Guia>('configuracoes');
  const [execucao, setExecucao] = useState<number | null>(null);
  const [rodando, setRodando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const compilados = useRef(new Map<number, ResultadoDoReact>());
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  /* ── A esteira ───────────────────────────────────────────────────────── */

  const rodar = useCallback(async (repo: ContextoDaHospedagem['repositorio'], fonte: FonteDoPages, msg: string) => {
    if (fonte === 'nenhuma') return;
    setRodando(true);
    const fontes = fontesDoSite(repo);
    const { react } = await ambiente.compilar(fontes);
    /* O número sai do contexto de agora, fora do atualizador: efeito dentro
       do atualizador de um estado pode rodar duas vezes, ou nenhuma. Os
       botões que disparam a esteira ficam desligados enquanto ela roda, e por
       isso duas execuções não disputam o mesmo número. */
    const id = ctxRef.current.publicacoes.length + 1;
    compilados.current.set(id, react);
    const p = rodarAEsteira(id, msg, repo, fonte, fonte === 'acoes' ? react.diagnosticos : []);
    setCtx(c => ({ ...c, publicacoes: [...c.publicacoes, p] }));
    setExecucao(id);
    setRodando(false);
  }, [ambiente]);

  const confirmar = async () => {
    const msg = mensagem.trim() || `Atualiza ${aberto}`;
    const repo = { ...rascunho };
    setCtx(c => ({ ...c, repositorio: repo }));
    setMensagem('');
    setAviso(ctx.fonte === 'acoes' ? 'Alteração confirmada. A esteira começou a rodar — acompanhe em Ações.' : 'Alteração confirmada no ramo main.');
    if (ctx.fonte !== 'nenhuma') await rodar(repo, ctx.fonte, msg);
  };

  const mudarFonte = async (fonte: FonteDoPages) => {
    setCtx(c => ({ ...c, fonte }));
    if (fonte !== 'nenhuma') await rodar(ctx.repositorio, fonte, fonte === 'acoes' ? 'Liga o Pages pela esteira' : 'pages build and deployment');
  };

  /* ── O site publicado ────────────────────────────────────────────────── */

  const publicadas = ctx.publicacoes.filter(p => p.ok);
  const ultima = publicadas[publicadas.length - 1];
  const [celular, setCelular] = useState(false);
  const [endereco, setEndereco] = useState('');
  const [digitado, setDigitado] = useState<string | null>(null);
  const [consoleDoSite, setConsoleDoSite] = useState<EntradaDoConsole[]>([]);
  const [versao, setVersao] = useState(0);
  const site = useMemo(
    () => (ultima ? paginaDoSite(ultima, compilados.current.get(ultima.id) ?? null, ambiente.bibliotecas) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `versao` recarrega o site de propósito
    [ultima, ambiente.bibliotecas, versao]);
  const quadro = useRef<HTMLIFrameElement>(null);
  const idDoSite = useRef<number | null>(null);
  idDoSite.current = ultima?.id ?? null;

  const visitar = useCallback((hash: string) => {
    const id = idDoSite.current;
    if (id === null) return;
    setEndereco(hash);
    setCtx(c => ({ ...c, visitas: [...c.visitas, { publicacao: id, endereco: hash }] }));
  }, []);

  useEffect(() => { setConsoleDoSite([]); setEndereco(''); }, [site]);

  useEffect(() => {
    const ouvir = (e: MessageEvent) => {
      if (!ehDaPagina(e.data) || e.source !== quadro.current?.contentWindow) return;
      const m = e.data as MensagemDaPagina;
      if (m.tipo === 'pedido') {
        (e.source as Window).postMessage({ fonte: FONTE_DA_PAGINA, tipo: 'resposta', id: m.id, resposta: respostaDaBrasilApi(m.url) }, '*');
      } else if (m.tipo === 'pronta') visitar('');
      else if (m.tipo === 'endereco') visitar(m.hash);
      else if (m.tipo === 'console') setConsoleDoSite(l => [...l, m.entrada].slice(-100));
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }, [visitar]);

  const irPara = (texto: string) => {
    const hash = texto.includes('#') ? `#${texto.split('#')[1]}` : '';
    quadro.current?.contentWindow?.postMessage({ fonte: FONTE_DA_PAGINA, tipo: 'ir', hash }, '*');
    visitar(hash);
  };

  /* ── As tarefas ──────────────────────────────────────────────────────── */

  const tarefas = METAS_DA_HOSPEDAGEM.map(m => {
    const feita = m.feita(ctx);
    return { id: m.id, titulo: m.titulo, passos: m.passos, feita, detalhe: feita ? undefined : m.motivo(ctx) };
  });
  const faltam = tarefas.filter(t => !t.feita).length;

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }} disabled={faltam > 0 || salvando}
        className="btn-primary w-full justify-center disabled:opacity-50">
        {salvando ? 'Salvando…' : faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      <button onClick={() => {
        const c = contextoDaHospedagem();
        compilados.current.clear();
        setCtx(c); setRascunho(c.repositorio); setExecucao(null); setGuia('configuracoes'); setAviso('');
      }} className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  const nomes = Object.keys(ctx.repositorio);
  const podeEscrever = EDITAVEIS_DO_REPOSITORIO.includes(aberto);
  const mudado = nomes.filter(n => rascunho[n] !== ctx.repositorio[n]);
  const selecionada = ctx.publicacoes.find(p => p.id === execucao) ?? ctx.publicacoes[ctx.publicacoes.length - 1];

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={licao.titulo}
      programa="site-do-repositorio" tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={0}>
      <style>{CSS_IDE}</style>
      <style>{CSS_DA_HOSPEDAGEM}</style>
      <div className="hp">
        <div className="hp-topo">
          <span className="hp-repo"><span className="hp-dono">{DONO}</span> / <strong>{REPOSITORIO}</strong></span>
          <nav className="hp-guias" role="tablist" aria-label="Guias do repositório">
            {([['codigo', 'Código'], ['acoes', 'Ações'], ['configuracoes', 'Configurações']] as const).map(([id, nome]) => (
              <button key={id} role="tab" aria-selected={guia === id} className="hp-guia" onClick={() => setGuia(id)}>{nome}</button>
            ))}
            <button role="tab" aria-selected={guia === 'site'} className="hp-guia hp-guia-site" onClick={() => setGuia('site')}>
              Site publicado
            </button>
          </nav>
        </div>

        {guia === 'codigo' && (
          <div className="hp-codigo">
            <ul className="hp-arquivos" aria-label="Arquivos do repositório">
              {nomes.map(n => (
                <li key={n}>
                  <button className={`hp-arquivo${n === aberto ? ' atual' : ''}`} onClick={() => setAberto(n)}>
                    {n}{mudado.includes(n) ? ' •' : ''}
                  </button>
                </li>
              ))}
            </ul>
            <div className="hp-editor">
              <div className="hp-caminho">{REPOSITORIO} / {aberto}{!podeEscrever && <span className="hp-so-leitura"> — só de leitura nesta lição</span>}</div>
              <div className="ide hp-ide">
                <EditorDeCodigo codigo={rascunho[aberto] ?? ''} rotulo={aberto} linguagem={linguagemDe(aberto)} somenteLeitura={!podeEscrever}
                  aoMudar={t => { if (podeEscrever) setRascunho(r => ({ ...r, [aberto]: t })); }} />
              </div>
              <div className="hp-commit">
                <input aria-label="Mensagem da alteração" placeholder={`Atualiza ${aberto}`} value={mensagem} onChange={e => setMensagem(e.target.value)} />
                <button className="hp-verde" disabled={mudado.length === 0 || rodando} onClick={() => { void confirmar(); }}>
                  Confirmar alterações{mudado.length ? ` (${mudado.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        {guia === 'acoes' && (
          <div className="hp-acoes">
            <ul className="hp-execucoes" aria-label="Execuções">
              {ctx.publicacoes.length === 0 && <li className="hp-vazio">Nenhuma execução ainda.</li>}
              {[...ctx.publicacoes].reverse().map(p => (
                <li key={p.id}>
                  <button className={`hp-execucao${selecionada?.id === p.id ? ' atual' : ''}`} onClick={() => setExecucao(p.id)}>
                    {p.ok ? <CheckCircle2 className="w-4 h-4 hp-ok" aria-label="passou" /> : <CircleX className="w-4 h-4 hp-falhou" aria-label="falhou" />}
                    <span>#{p.id} {p.mensagem}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="hp-registro">
              {selecionada && (
                <>
                  <div className="hp-registro-topo">
                    <strong>{selecionada.fonte === 'ramo' ? 'pages build and deployment' : 'Publicar no Pages'}</strong> · #{selecionada.id}
                    <button disabled={rodando || ctx.fonte === 'nenhuma'} onClick={() => { void rodar(ctx.repositorio, ctx.fonte, 'Executar de novo'); }}>
                      <Play className="w-3.5 h-3.5" /> Executar de novo
                    </button>
                  </div>
                  <pre aria-label="Registro da execução">{selecionada.log.join('\n')}</pre>
                </>
              )}
              {rodando && <p className="hp-vazio">A esteira está rodando…</p>}
            </div>
          </div>
        )}

        {guia === 'configuracoes' && (
          <div className="hp-config">
            <h2>Pages</h2>
            <p>O GitHub Pages publica um site a partir deste repositório.</p>
            <fieldset>
              <legend>Origem</legend>
              {([
                ['nenhuma', 'Nenhuma', 'O Pages fica desligado.'],
                ['ramo', 'Publicar a partir de um ramo', 'Os arquivos do ramo main, pasta / (raiz), como estão.'],
                ['acoes', 'GitHub Actions', 'Uma esteira constrói o site e publica o resultado.'],
              ] as const).map(([id, nome, oQue]) => (
                <label key={id} className="hp-opcao">
                  <input type="radio" name="origem" checked={ctx.fonte === id} disabled={rodando} onChange={() => { void mudarFonte(id); }} />
                  <span><strong>{nome}</strong><br /><small>{oQue}</small></span>
                </label>
              ))}
            </fieldset>
            {ultima && <p className="hp-no-ar">Seu site está no ar em <button className="hp-link" onClick={() => setGuia('site')}>{ENDERECO_DO_SITE}</button></p>}
          </div>
        )}

        {guia === 'site' && (
          <div className="hp-site">
            <div className="hp-barra">
              <button aria-label="Recarregar" onClick={() => setVersao(v => v + 1)}>⟳</button>
              <form className="hp-url" onSubmit={e => { e.preventDefault(); if (digitado !== null) irPara(digitado); setDigitado(null); }}>
                <Lock className="w-3 h-3 flex-none" />
                <input aria-label="Endereço do site" value={digitado ?? `${ENDERECO_DO_SITE}${endereco}`} spellCheck={false}
                  onChange={e => setDigitado(e.target.value)} onBlur={() => setDigitado(null)} />
              </form>
              <button aria-label={celular ? 'Ver como no computador' : 'Ver como no celular'} title={celular ? 'Computador' : 'Celular'}
                onClick={() => setCelular(c => !c)}>
                {celular ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </button>
            </div>
            <div className={`hp-moldura${celular ? ' celular' : ''}`}>
              {site
                ? <iframe key={`${ultima?.id}-${versao}`} ref={quadro} srcDoc={site} sandbox={SANDBOX} title="O site publicado" />
                : <div className="hp-404"><strong>404</strong><p>Não há um site do GitHub Pages neste endereço.</p></div>}
            </div>
            <div className="hp-console" aria-label="Console do site">
              <div className="hp-console-topo">Console</div>
              {consoleDoSite.length === 0 && <p className="hp-vazio">Nada no console.</p>}
              {consoleDoSite.map((e, i) => <p key={i} className={e.nivel === 'error' ? 'hp-erro' : undefined}>{e.texto}</p>)}
            </div>
          </div>
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_DA_HOSPEDAGEM = `
.hp { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #FFFFFF; color: #1F2328;
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif; font-size: 14px; }
.hp h2 { color: #1F2328; font-size: 20px; margin: 0 0 6px; }
.hp-topo { flex: none; padding: 12px 16px 0; background: #F6F8FA; border-bottom: 1px solid #D0D7DE; }
.hp-repo { font-size: 18px; color: #0969DA; }
.hp-dono { font-weight: 400; }
.hp-guias { display: flex; gap: 4px; margin-top: 10px; flex-wrap: wrap; }
.hp-guia { background: none; border: 0; border-bottom: 2px solid transparent; padding: 8px 12px; color: #1F2328; cursor: pointer; font: inherit; }
.hp-guia[aria-selected="true"] { border-bottom-color: #FD8C73; font-weight: 600; }
.hp-guia-site { margin-left: auto; color: #0969DA; }
.hp-codigo { flex: 1; min-height: 0; display: flex; }
.hp-arquivos { width: 220px; flex: none; list-style: none; margin: 0; padding: 8px; overflow: auto; border-right: 1px solid #D0D7DE; }
.hp-arquivo { width: 100%; text-align: left; background: none; border: 0; padding: 5px 8px; border-radius: 6px; cursor: pointer; font: inherit; color: #1F2328; }
.hp-arquivo.atual { background: #DDF4FF; }
.hp-editor { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.hp-caminho { padding: 8px 12px; border-bottom: 1px solid #D0D7DE; color: #59636E; }
.hp-so-leitura { color: #9A6700; }
.hp-ide { flex: 1; min-height: 0; }
.hp-commit { flex: none; display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid #D0D7DE; background: #F6F8FA; }
.hp-commit input { flex: 1; min-width: 0; font: inherit; padding: 5px 10px; border: 1px solid #D0D7DE; border-radius: 6px; color: #1F2328; background: #FFFFFF; }
.hp-verde { background: #1F883D; color: #FFFFFF; border: 0; border-radius: 6px; padding: 6px 14px; font: inherit; font-weight: 600; cursor: pointer; }
.hp-verde:disabled { background: #94D3A2; cursor: default; }
.hp-acoes { flex: 1; min-height: 0; display: flex; }
.hp-execucoes { width: 300px; flex: none; list-style: none; margin: 0; padding: 8px; overflow: auto; border-right: 1px solid #D0D7DE; }
.hp-execucao { width: 100%; display: flex; gap: 8px; align-items: center; text-align: left; background: none; border: 0; padding: 7px 8px; border-radius: 6px; cursor: pointer; font: inherit; color: #1F2328; }
.hp-execucao.atual { background: #F6F8FA; font-weight: 600; }
.hp-ok { color: #1A7F37; flex: none; }
.hp-falhou { color: #CF222E; flex: none; }
.hp-registro { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 10px 12px; gap: 8px; }
.hp-registro-topo { display: flex; align-items: center; gap: 8px; }
.hp-registro-topo button { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; font: inherit; padding: 4px 10px;
  border: 1px solid #D0D7DE; border-radius: 6px; background: #F6F8FA; color: #1F2328; cursor: pointer; }
.hp-registro pre { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 10px 12px; background: #161B22; color: #E6EDF3;
  border-radius: 6px; font: 12.5px/1.55 ui-monospace, Consolas, monospace; white-space: pre-wrap; }
.hp-vazio { color: #59636E; padding: 4px 8px; margin: 0; }
.hp-config { flex: 1; overflow: auto; padding: 16px 20px; max-width: 720px; }
.hp-config p { color: #59636E; }
.hp-config fieldset { border: 1px solid #D0D7DE; border-radius: 6px; padding: 10px 14px; }
.hp-config legend { font-weight: 600; padding: 0 4px; }
.hp-opcao { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; cursor: pointer; }
.hp-opcao small { color: #59636E; }
.hp-no-ar { background: #DAFBE1; border: 1px solid #4AC26B; border-radius: 6px; padding: 10px 12px; color: #1F2328 !important; }
.hp-link { background: none; border: 0; padding: 0; color: #0969DA; text-decoration: underline; cursor: pointer; font: inherit; }
.hp-site { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #DEE1E6; }
.hp-barra { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #F1F3F4; border-bottom: 1px solid #D0D7DE; }
.hp-barra > button { background: none; border: 0; cursor: pointer; color: #3C4043; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font-size: 16px; }
.hp-url { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; margin: 0; padding: 5px 12px; background: #FFFFFF; border-radius: 16px; color: #3C4043; }
.hp-url input { flex: 1; min-width: 0; border: 0; outline: none; font: 13px system-ui, sans-serif; color: #1F2328; background: transparent; }
.hp-moldura { flex: 1; min-height: 0; display: flex; justify-content: center; padding: 0; }
.hp-moldura iframe { flex: 1; width: 100%; border: 0; background: #FFFFFF; }
.hp-moldura.celular { padding: 12px 0; }
.hp-moldura.celular iframe { flex: none; width: 375px; border: 10px solid #202124; border-radius: 24px; }
.hp-404 { flex: 1; display: grid; place-content: center; text-align: center; background: #FFFFFF; color: #1F2328; }
.hp-404 strong { font-size: 64px; color: #59636E; }
.hp-console { flex: none; height: 120px; overflow: auto; background: #FFFFFF; border-top: 1px solid #D0D7DE; font: 12px ui-monospace, Consolas, monospace; }
.hp-console-topo { padding: 4px 10px; background: #F1F3F4; color: #3C4043; font-family: system-ui, sans-serif; }
.hp-console p { margin: 0; padding: 3px 10px; border-bottom: 1px solid #F1F3F4; color: #1F2328; }
.hp-console .hp-erro { background: #FCE8E6; color: #A50E0E; }
@media (max-width: 767px) {
  .hp-codigo, .hp-acoes { flex-direction: column; }
  .hp-arquivos, .hp-execucoes { width: auto; max-height: 30%; border-right: 0; border-bottom: 1px solid #D0D7DE; }
  .hp-moldura.celular iframe { width: 100%; border: 0; border-radius: 0; }
}
`;
