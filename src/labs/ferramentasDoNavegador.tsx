import { useMemo, useState, type ReactNode } from 'react';
import { Ban, ChevronDown, ChevronRight, MousePointer2 } from 'lucide-react';
import { realcarLinhasJavascript } from './realce';
import { linhaDaParada, linhasComParada } from './paginaViva';
import type { DetalhesDoElemento, EntradaDoConsole, NoDaArvore, Parada, RequisicaoDaPagina } from './paginaViva';

/**
 * As ferramentas do navegador, embaixo da prévia: Elementos, Console, Rede e
 * Fontes.
 *
 * Não imitam marca nenhuma, pela regra do editor de código: o desbravador vai
 * encontrar as do Chrome, as do Firefox ou as do Edge, e o que as três têm em
 * comum é o arranjo — as quatro guias, com estes nomes, nesta ordem. É ele que
 * se desenha aqui.
 *
 * Nenhuma peça guarda o que a página disse. A árvore, as linhas do console, os
 * pedidos e as passagens pelas paradas chegam de fora, e quem os guarda é o
 * laboratório, que é quem fala com a página. Guardam só o que é da tela: que
 * guia está aberta, que nó está recolhido, que pedido está escolhido.
 */

export type GuiaDasFerramentas = 'elementos' | 'console' | 'rede' | 'fontes';

const GUIAS: { id: GuiaDasFerramentas; nome: string }[] = [
  { id: 'elementos', nome: 'Elementos' },
  { id: 'console', nome: 'Console' },
  { id: 'rede', nome: 'Rede' },
  { id: 'fontes', nome: 'Fontes' },
];

export interface PropsDasFerramentas {
  guia: GuiaDasFerramentas;
  aoTrocarDeGuia: (g: GuiaDasFerramentas) => void;

  arvore: NoDaArvore | null;
  escolhido: number | null;
  detalhes: DetalhesDoElemento | null;
  aoEscolher: (id: number) => void;
  escolhendoNaPagina: boolean;
  aoAlternarSeletor: () => void;

  console: EntradaDoConsole[];
  aoLimparConsole: () => void;
  aoAvaliar: (codigo: string) => void;

  requisicoes: RequisicaoDaPagina[];
  semConexao: boolean;
  aoMudarConexao: (sem: boolean) => void;
  /** O corpo da resposta, quando ele está guardado — o da rede de verdade não passa por aqui. */
  respostaDe: (url: string) => string | null;

  script: string;
  nomeDoScript: string;
  paradas: number[];
  aoMudarParadas: (linhas: number[]) => void;
  passagens: Parada[];
  /**
   * As guias que esta página oferece. Sem ela, as quatro. A CC-FE006 não
   * oferece Fontes: a parada dela escreveria no JavaScript gerado, e a linha
   * que a pessoa escolheu é a do `.tsx`.
   */
  guias?: GuiaDasFerramentas[];
}

export function FerramentasDoNavegador(p: PropsDasFerramentas) {
  const erros = p.console.filter(e => e.nivel === 'error').length;
  return (
    <div className="fn">
      <div className="fn-guias" role="tablist" aria-label="Ferramentas do navegador">
        {/* Em toda guia, como no navegador: escolher na página é o caminho
            mais curto até a guia Elementos, e quem está no Console não deveria
            precisar abri-la antes. */}
        <button className={`fn-seletor${p.escolhendoNaPagina ? ' ligado' : ''}`} onClick={p.aoAlternarSeletor}
          title="Escolha um elemento da página para inspecioná-lo" aria-pressed={p.escolhendoNaPagina}>
          <MousePointer2 className="w-3.5 h-3.5" />
        </button>
        {GUIAS.filter(g => !p.guias || p.guias.includes(g.id)).map(g => (
          <button key={g.id} role="tab" aria-selected={p.guia === g.id} className="fn-guia" onClick={() => p.aoTrocarDeGuia(g.id)}>
            {g.nome}
            {g.id === 'console' && erros > 0 && <span className="fn-contagem" aria-label={`${erros} erros`}>{erros}</span>}
          </button>
        ))}
      </div>
      <div className="fn-corpo">
        {p.guia === 'elementos' && <Elementos {...p} />}
        {p.guia === 'console' && <Console {...p} />}
        {p.guia === 'rede' && <Rede {...p} />}
        {p.guia === 'fontes' && <Fontes {...p} />}
      </div>
    </div>
  );
}

/* ── Elementos ───────────────────────────────────────────────────────── */

function abertoPorPadrao(no: NoDaArvore, fundo: number) {
  return no.tag !== 'head' && fundo < 4;
}

function Atributos({ atributos }: { atributos?: [string, string][] }) {
  return (
    <>
      {(atributos ?? []).map(([n, v]) => (
        <span key={n}> <span className="fn-attr">{n}</span>=<span className="fn-val">"{v}"</span></span>
      ))}
    </>
  );
}

function NoDaArvoreDesenhado({ no, fundo, escolhido, aoEscolher, trocados, alternar }: {
  no: NoDaArvore; fundo: number; escolhido: number | null; aoEscolher: (id: number) => void;
  trocados: Set<number>; alternar: (id: number) => void;
}): ReactNode {
  if (no.texto !== undefined) {
    return <div className="fn-linha" style={{ paddingLeft: 14 + fundo * 12 }}><span className="fn-texto">"{no.texto}"</span></div>;
  }
  const filhos = no.filhos ?? [];
  /* Um filho só, de texto curto, cabe na mesma linha — é como o painel do
     navegador desenha um <h1>Título</h1>. */
  const emLinha = filhos.length === 1 && filhos[0].texto !== undefined && filhos[0].texto.length <= 60;
  const recolhivel = filhos.length > 0 && !emLinha;
  const aberto = recolhivel && (abertoPorPadrao(no, fundo) !== trocados.has(no.id));
  const vazias = ['meta', 'link', 'input', 'br', 'img', 'hr'];
  return (
    <>
      <div className={`fn-linha${escolhido === no.id ? ' escolhida' : ''}`} style={{ paddingLeft: 2 + fundo * 12 }}
        onClick={() => aoEscolher(no.id)}>
        {recolhivel ? (
          <button className="fn-seta" aria-label={aberto ? 'Recolher' : 'Expandir'} aria-expanded={aberto}
            onClick={e => { e.stopPropagation(); alternar(no.id); }}>
            {aberto ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="fn-seta" />}
        <span className="fn-tag">&lt;{no.tag}</span><Atributos atributos={no.atributos} /><span className="fn-tag">&gt;</span>
        {emLinha && <><span className="fn-texto">{filhos[0].texto}</span><span className="fn-tag">&lt;/{no.tag}&gt;</span></>}
        {recolhivel && !aberto && <><span className="fn-reticencias">…</span><span className="fn-tag">&lt;/{no.tag}&gt;</span></>}
        {!recolhivel && !emLinha && !vazias.includes(no.tag ?? '') && <span className="fn-tag">&lt;/{no.tag}&gt;</span>}
      </div>
      {aberto && filhos.map(f => (
        <NoDaArvoreDesenhado key={f.id} no={f} fundo={fundo + 1} escolhido={escolhido} aoEscolher={aoEscolher}
          trocados={trocados} alternar={alternar} />
      ))}
      {aberto && <div className="fn-linha" style={{ paddingLeft: 14 + fundo * 12 }}><span className="fn-tag">&lt;/{no.tag}&gt;</span></div>}
    </>
  );
}

function Elementos(p: PropsDasFerramentas) {
  const [trocados, setTrocados] = useState<Set<number>>(new Set());
  const alternar = (id: number) => setTrocados(t => {
    const n = new Set(t);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  if (!p.arvore) return <p className="fn-vazio">A página ainda está abrindo.</p>;
  return (
    <div className="fn-elementos">
      <div className="fn-arvore" aria-label="Árvore da página">
        <NoDaArvoreDesenhado no={p.arvore} fundo={0} escolhido={p.escolhido} aoEscolher={p.aoEscolher}
          trocados={trocados} alternar={alternar} />
      </div>
      <div className="fn-estilos" aria-label="Estilos calculados">
        {p.detalhes ? (
          <>
            <p className="fn-titulo">{p.detalhes.nome}</p>
            <p className="fn-caixa">{p.detalhes.largura} × {p.detalhes.altura}</p>
            <table>
              <tbody>
                {Object.entries(p.detalhes.estilos).map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        ) : <p className="fn-vazio">Escolha um elemento na árvore para ver os estilos calculados dele.</p>}
      </div>
    </div>
  );
}

/* ── Console ─────────────────────────────────────────────────────────── */

function Console(p: PropsDasFerramentas) {
  const [codigo, setCodigo] = useState('');
  return (
    <div className="fn-console">
      <div className="fn-barra">
        <button onClick={p.aoLimparConsole} title="Limpar o console" aria-label="Limpar o console"><Ban className="w-3.5 h-3.5" /></button>
      </div>
      <div className="fn-linhas" aria-live="polite">
        {p.console.length === 0 && <p className="fn-vazio">Nada escrito ainda. O que o script mandar com console.log aparece aqui.</p>}
        {p.console.map((e, i) => (
          <div key={i} className={`fn-entrada fn-${e.nivel}`}>
            <span className="fn-mensagem">{e.nivel === 'eco' ? '› ' : e.nivel === 'resultado' ? '‹ ' : ''}{e.texto}</span>
            {e.arquivo && <span className="fn-onde">{e.arquivo}{e.linha ? `:${e.linha}` : ''}</span>}
          </div>
        ))}
      </div>
      <form className="fn-prompt" onSubmit={ev => { ev.preventDefault(); if (codigo.trim()) { p.aoAvaliar(codigo); setCodigo(''); } }}>
        <span aria-hidden>›</span>
        <input value={codigo} onChange={ev => setCodigo(ev.target.value)} aria-label="Escrever no console"
          spellCheck={false} autoComplete="off" />
      </form>
    </div>
  );
}

/* ── Rede ────────────────────────────────────────────────────────────── */

const nomeDoPedido = (url: string) => {
  try { const u = new URL(url); return u.pathname.split('/').filter(Boolean).pop() || u.hostname; } catch { return url; }
};

function Rede(p: PropsDasFerramentas) {
  const [aberto, setAberto] = useState<number | null>(null);
  const req = p.requisicoes.find(r => r.id === aberto) ?? null;
  const corpo = req ? p.respostaDe(req.url) : null;
  return (
    <div className="fn-rede">
      <div className="fn-barra">
        <label>
          <select value={p.semConexao ? 'sem' : 'livre'} onChange={e => p.aoMudarConexao(e.target.value === 'sem')}
            aria-label="Limitação da rede">
            <option value="livre">Sem limitação</option>
            <option value="sem">Sem conexão</option>
          </select>
        </label>
      </div>
      <div className="fn-rede-corpo">
        <table className="fn-pedidos">
          <thead><tr><th scope="col">Nome</th><th scope="col">Status</th><th scope="col">Tipo</th><th scope="col">Tamanho</th></tr></thead>
          <tbody>
            {p.requisicoes.length === 0 && <tr><td colSpan={4} className="fn-vazio">Nenhum pedido ainda. Os pedidos que o script fizer com fetch aparecem aqui.</td></tr>}
            {p.requisicoes.map(r => (
              <tr key={r.id} className={`${r.estado === 'falha' || (r.status ?? 0) >= 400 ? 'falhou' : ''}${aberto === r.id ? ' escolhida' : ''}`}
                onClick={() => setAberto(r.id)}>
                <td title={r.url}>{nomeDoPedido(r.url)}</td>
                <td>{r.estado === 'pendente' ? '(pendente)' : r.estado === 'falha' ? '(falhou)' : r.status}</td>
                <td>fetch</td>
                <td>{r.origem === 'cache' ? '(cache)' : r.origem === 'rede' ? '—' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {req && (
          <div className="fn-detalhe">
            <p><b>URL:</b> {req.url}</p>
            <p><b>Método:</b> {req.metodo}</p>
            <p><b>Status:</b> {req.estado === 'falha' ? req.erro : req.status ?? 'pendente'}</p>
            {corpo !== null && <pre>{corpo}</pre>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Fontes ──────────────────────────────────────────────────────────── */

function Fontes(p: PropsDasFerramentas) {
  const linhas = useMemo(() => realcarLinhasJavascript(p.script), [p.script]);
  const validas = useMemo(() => new Set(linhasComParada(p.script)), [p.script]);
  /* Sem escolha, mostra a passagem mais nova: é a que acabou de acontecer,
     no clique que a pessoa acabou de dar. */
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const passagens = p.passagens.filter(x => p.paradas.includes(x.linha));
  const vista = Math.min(escolhida ?? passagens.length - 1, passagens.length - 1);
  const atual = passagens[vista] ?? null;

  const alternar = (n: number) => {
    const efetiva = linhaDaParada(p.script, n);
    if (efetiva === null) return;
    p.aoMudarParadas(p.paradas.includes(efetiva) ? p.paradas.filter(x => x !== efetiva) : [...p.paradas, efetiva].sort((a, b) => a - b));
  };

  return (
    <div className="fn-fontes">
      <div className="fn-codigo" aria-label={`Código de ${p.nomeDoScript}`}>
        {linhas.map((html, i) => {
          const n = i + 1;
          const comParada = p.paradas.includes(n);
          return (
            <div key={n} className={`fn-cod-linha${atual?.linha === n ? ' parou' : ''}`}>
              <button className={`fn-num${comParada ? ' com-parada' : ''}${validas.has(n) ? '' : ' sem-instrucao'}`}
                onClick={() => alternar(n)} aria-pressed={comParada}
                aria-label={comParada ? `Tirar a parada da linha ${n}` : `Pôr uma parada na linha ${n}`}>{n}</button>
              <code dangerouslySetInnerHTML={{ __html: html || ' ' }} />
            </div>
          );
        })}
      </div>
      <div className="fn-escopo" aria-label="Paradas">
        <p className="fn-titulo">Paradas</p>
        {p.paradas.length === 0 && <p className="fn-vazio">Clique no número de uma linha para pôr uma parada nela.</p>}
        {p.paradas.length > 0 && passagens.length === 0 && (
          <p className="fn-vazio">Parada na linha {p.paradas.join(', ')}. Use a página para o programa passar por ela.</p>
        )}
        {atual && (
          <>
            <p className="fn-passou">
              Passou pela linha {atual.linha} — {vista + 1} de {passagens.length}
            </p>
            <div className="fn-nav">
              <button disabled={vista === 0} onClick={() => setEscolhida(Math.max(0, vista - 1))}>Anterior</button>
              <button disabled={vista >= passagens.length - 1} onClick={() => setEscolhida(vista + 1)}>Próxima</button>
            </div>
            <p className="fn-nota">O programa já seguiu. Assim estavam as variáveis quando ele passou por aqui.</p>
            <table>
              <tbody>
                {atual.variaveis.map(v => (
                  <tr key={v.nome}><th scope="row">{v.nome}</th><td className={`fn-v-${v.tipo}`}>{v.valor}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export const CSS_DAS_FERRAMENTAS = `
.fn { display: flex; flex-direction: column; min-height: 0; height: 100%; background: #202124; color: #E8EAED;
  font-family: system-ui, sans-serif; font-size: 12px; border-top: 1px solid #3C4043; }
.fn-guias { flex: none; display: flex; align-items: stretch; background: #292A2D; border-bottom: 1px solid #3C4043; overflow-x: auto; }
.fn-guia { padding: 6px 12px; background: none; border: 0; border-bottom: 2px solid transparent; color: #BDC1C6;
  cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; font-size: 12px; }
.fn-guia[aria-selected="true"] { color: #E8EAED; border-bottom-color: #8AB4F8; }
.fn-contagem { background: #F28B82; color: #202124; border-radius: 8px; padding: 0 5px; font-size: 10px; font-weight: 700; }
.fn-seletor { padding: 0 9px; background: none; border: 0; color: #BDC1C6; cursor: pointer; border-right: 1px solid #3C4043; }
.fn-seletor.ligado { color: #8AB4F8; }
.fn-corpo { flex: 1; min-height: 0; overflow: hidden; display: flex; }
.fn-corpo > * { flex: 1; min-width: 0; }
.fn-vazio { color: #9AA0A6; padding: 8px; margin: 0; }
.fn-titulo { margin: 0 0 4px; font-weight: 700; color: #E8EAED; }
.fn-barra { flex: none; display: flex; gap: 6px; align-items: center; padding: 3px 6px; border-bottom: 1px solid #3C4043; }
.fn-barra button, .fn-barra select { background: #303134; color: #E8EAED; border: 1px solid #5F6368; border-radius: 3px;
  padding: 2px 6px; font-size: 12px; cursor: pointer; }

.fn-elementos, .fn-fontes, .fn-rede-corpo { display: flex; min-height: 0; height: 100%; }
.fn-arvore { flex: 1; min-width: 0; overflow: auto; padding: 4px 0;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; }
.fn-linha { white-space: nowrap; cursor: default; line-height: 18px; padding-right: 8px; display: flex; align-items: center; }
.fn-linha:hover { background: #303134; }
.fn-linha.escolhida { background: #394457; }
.fn-seta { width: 14px; height: 14px; flex: none; display: inline-grid; place-items: center; background: none; border: 0;
  color: #9AA0A6; padding: 0; cursor: pointer; }
.fn-tag { color: #5DB0D7; }
.fn-attr { color: #9BBBDC; }
.fn-val { color: #F29766; }
.fn-texto { color: #E8EAED; }
.fn-reticencias { color: #9AA0A6; padding: 0 2px; }
.fn-estilos { width: 40%; max-width: 280px; flex: none; overflow: auto; padding: 6px 8px; border-left: 1px solid #3C4043; }
.fn-caixa { margin: 0 0 6px; color: #9AA0A6; font-family: ui-monospace, monospace; }
.fn-estilos table, .fn-escopo table { border-collapse: collapse; width: 100%; font-family: ui-monospace, monospace; }
.fn-estilos th, .fn-escopo th { text-align: left; color: #9BBBDC; font-weight: normal; padding: 1px 8px 1px 0; vertical-align: top; white-space: nowrap; }
.fn-estilos td, .fn-escopo td { color: #E8EAED; padding: 1px 0; word-break: break-word; }

.fn-console { display: flex; flex-direction: column; min-height: 0; height: 100%; }
.fn-linhas { flex: 1; min-height: 0; overflow: auto; font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; }
.fn-entrada { display: flex; gap: 8px; padding: 2px 8px; border-bottom: 1px solid #2E3134; white-space: pre-wrap; word-break: break-word; }
.fn-mensagem { flex: 1; min-width: 0; }
.fn-onde { flex: none; color: #9AA0A6; text-decoration: underline; }
.fn-error { background: #4E3534; color: #F28B82; border-bottom-color: #603A38; }
.fn-warn { background: #413C26; color: #FDD663; }
.fn-eco { color: #9AA0A6; }
.fn-resultado { color: #C3D4EA; }
.fn-prompt { flex: none; display: flex; align-items: center; gap: 6px; padding: 3px 8px; border-top: 1px solid #3C4043;
  font-family: ui-monospace, monospace; color: #8AB4F8; }
.fn-prompt input { flex: 1; min-width: 0; background: transparent; border: 0; color: #E8EAED; font: inherit; outline: none; }

.fn-rede { display: flex; flex-direction: column; min-height: 0; height: 100%; }
.fn-pedidos { flex: 1; min-width: 0; border-collapse: collapse; align-self: flex-start; }
.fn-pedidos th { text-align: left; font-weight: normal; color: #9AA0A6; padding: 3px 8px; border-bottom: 1px solid #3C4043; }
.fn-pedidos td { padding: 3px 8px; border-bottom: 1px solid #2E3134; white-space: nowrap; cursor: pointer; }
.fn-pedidos tr.falhou td { color: #F28B82; }
.fn-pedidos tr.escolhida td { background: #394457; }
.fn-detalhe { width: 50%; flex: none; overflow: auto; padding: 6px 8px; border-left: 1px solid #3C4043; }
.fn-detalhe p { margin: 0 0 3px; word-break: break-all; }
.fn-detalhe pre { margin: 6px 0 0; white-space: pre-wrap; word-break: break-word; color: #C3D4EA;
  font-family: ui-monospace, monospace; font-size: 11.5px; }

.fn-codigo { flex: 1; min-width: 0; overflow: auto; padding: 4px 0; font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  background: #1E1E1E; }
.fn-cod-linha { display: flex; line-height: 18px; white-space: pre; }
.fn-cod-linha.parou { background: #3B3A1E; }
.fn-num { width: 40px; flex: none; text-align: right; padding: 0 8px 0 0; background: none; border: 0; color: #6E7681;
  font: inherit; cursor: pointer; position: relative; }
.fn-num.sem-instrucao { color: #4A5059; }
.fn-num.com-parada { color: #FFFFFF; background: #1A73E8; clip-path: polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%); }
.fn-cod-linha code { padding-left: 8px; color: #D4D4D4; }
.fn-escopo { width: 40%; max-width: 300px; flex: none; overflow: auto; padding: 6px 8px; border-left: 1px solid #3C4043; }
.fn-passou { margin: 0 0 4px; color: #FDD663; }
.fn-nav { display: flex; gap: 6px; margin-bottom: 6px; }
.fn-nav button { background: #303134; color: #E8EAED; border: 1px solid #5F6368; border-radius: 3px; padding: 2px 8px; cursor: pointer; font-size: 12px; }
.fn-nav button:disabled { opacity: .45; cursor: default; }
.fn-nota { margin: 0 0 6px; color: #9AA0A6; line-height: 1.4; }
.fn-v-string { color: #F29766; }
.fn-v-number, .fn-v-boolean { color: #9980FF; }
.fn-v-tdz, .fn-v-undefined { color: #9AA0A6; }

@media (max-width: 700px) {
  .fn-elementos, .fn-fontes, .fn-rede-corpo { flex-direction: column; }
  .fn-estilos, .fn-escopo, .fn-detalhe { width: auto; max-width: none; border-left: 0; border-top: 1px solid #3C4043; max-height: 45%; }
}
`;
