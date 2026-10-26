import { useRef, useState } from 'react';
import { KeyRound, Link2, Plus, Spline, Table2, Trash2, Workflow } from 'lucide-react';
import {
  CARDINALIDADES, TIPOS_DE_COLUNA, mudarColuna, mudarLigacao, mudarTabela, novaColuna, novaLigacao, novaTabela,
  removerColuna, removerLigacao, removerTabela, tabelaPorId,
  type Cardinalidade, type Diagrama, type LigacaoDoDiagrama, type TabelaDoDiagrama, type TipoDeColuna,
} from './diagramaDeTabelas';

/**
 * O modelador de tabelas do módulo 6 da CC005.
 *
 * ── Um arranjo, e não uma marca ──────────────────────────────────────────
 * O desbravador pode desenhar o diagrama no dbdiagram, no draw.io ou no
 * modelador que vem junto do banco, e o que os três têm em comum é este
 * arranjo: as tabelas como caixas numa prancha, a chave marcada com uma
 * chave, as ligações como linhas com o pé de galinha no lado muitos, e as
 * propriedades do que está selecionado ao lado. É a decisão de `ide.tsx`.
 *
 * ── A janela não julga o diagrama ────────────────────────────────────────
 * Nenhum modelador de verdade pinta de vermelho a ligação que discorda da
 * coluna: ele desenha o que se mandou desenhar. Pintar aqui poria na tela a
 * resposta da tarefa de cardinalidade — é a regra do painel de Problemas do
 * Python e da régua de status do Word. Quem confere é a lista de tarefas.
 *
 * ── A posição das caixas é da tela ───────────────────────────────────────
 * Arrastar uma tabela muda onde ela aparece e nada mais: o modelo não guarda
 * posição, porque o que o requisito pede são as tabelas, as chaves e as
 * ligações, e um diagrama arrumado de outro jeito continua sendo o mesmo.
 */

const LARGURA = 210;
const ALTURA_DO_TOPO = 32;
const ALTURA_DA_LINHA = 24;

type Selecao = { tipo: 'tabela'; id: string } | { tipo: 'ligacao'; id: string } | null;
type Ponto = { x: number; y: number };

const alturaDe = (t: TabelaDoDiagrama) => ALTURA_DO_TOPO + Math.max(1, t.colunas.length) * ALTURA_DA_LINHA + 6;

/** Onde a caixa cai antes de alguém arrastá-la: três por fileira. */
function posicaoInicial(i: number): Ponto {
  return { x: 24 + (i % 3) * (LARGURA + 110), y: 24 + Math.floor(i / 3) * 240 };
}

export function ModeladorDeTabelas({ diagrama, mudar }: {
  diagrama: Diagrama;
  mudar: (d: Diagrama) => void;
}) {
  const [selecao, setSelecao] = useState<Selecao>(null);
  const [posicoes, setPosicoes] = useState<Record<string, Ponto>>({});
  const arrasto = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const posicao = (t: TabelaDoDiagrama) => posicoes[t.id] ?? posicaoInicial(diagrama.tabelas.indexOf(t));
  const largura = Math.max(800, ...diagrama.tabelas.map(t => posicao(t).x + LARGURA + 40));
  const altura = Math.max(520, ...diagrama.tabelas.map(t => posicao(t).y + alturaDe(t) + 40));

  const criarTabela = () => {
    const d = novaTabela(diagrama);
    mudar(d);
    setSelecao({ tipo: 'tabela', id: d.tabelas[d.tabelas.length - 1].id });
  };
  const criarLigacao = () => {
    if (diagrama.tabelas.length < 2) return;
    const de = selecao?.tipo === 'tabela' ? selecao.id : diagrama.tabelas[0].id;
    const para = diagrama.tabelas.find(t => t.id !== de)!.id;
    const d = novaLigacao(diagrama, de, para);
    mudar(d);
    setSelecao({ tipo: 'ligacao', id: d.ligacoes[d.ligacoes.length - 1].id });
  };
  const excluir = () => {
    if (!selecao) return;
    mudar(selecao.tipo === 'tabela' ? removerTabela(diagrama, selecao.id) : removerLigacao(diagrama, selecao.id));
    setSelecao(null);
  };

  const tabelaSelecionada = selecao?.tipo === 'tabela' ? tabelaPorId(diagrama, selecao.id) : undefined;
  const ligacaoSelecionada = selecao?.tipo === 'ligacao' ? diagrama.ligacoes.find(l => l.id === selecao.id) : undefined;

  return (
    <div className="md">
      <div className="md-titulo">
        <Workflow className="w-4 h-4" style={{ color: '#3B7DD8' }} />
        <span className="truncate">clube — Diagrama de tabelas</span>
      </div>
      <div className="md-barra" role="toolbar" aria-label="Ferramentas do diagrama">
        <button onClick={criarTabela}><Table2 className="w-4 h-4" /> Nova tabela</button>
        <button onClick={criarLigacao} disabled={diagrama.tabelas.length < 2}><Spline className="w-4 h-4" /> Nova ligação</button>
        <button onClick={excluir} disabled={!selecao}><Trash2 className="w-4 h-4" /> Excluir</button>
      </div>

      <div className="md-corpo">
        <nav className="md-lista" aria-label="Elementos do diagrama">
          <p className="md-rotulo">Tabelas</p>
          {diagrama.tabelas.map(t => (
            <button key={t.id} className="md-item" aria-current={selecao?.tipo === 'tabela' && selecao.id === t.id}
              onClick={() => setSelecao({ tipo: 'tabela', id: t.id })}>
              <Table2 className="w-3.5 h-3.5 flex-none" /> <span className="truncate">{t.nome || '(sem nome)'}</span>
            </button>
          ))}
          <p className="md-rotulo">Ligações</p>
          {diagrama.ligacoes.length === 0 && <p className="md-nada">Nenhuma ligação.</p>}
          {diagrama.ligacoes.map(l => (
            <button key={l.id} className="md-item" aria-current={selecao?.tipo === 'ligacao' && selecao.id === l.id}
              onClick={() => setSelecao({ tipo: 'ligacao', id: l.id })}>
              <Spline className="w-3.5 h-3.5 flex-none" />
              <span className="truncate">{nomeDe(diagrama, l.de)} {l.cardinalidade} {nomeDe(diagrama, l.para)}</span>
            </button>
          ))}
        </nav>

        <div className="md-prancha-rolo">
          <div className="md-prancha" style={{ width: largura, height: altura }}
            onPointerMove={e => {
              const a = arrasto.current;
              if (!a) return;
              const caixa = e.currentTarget.getBoundingClientRect();
              setPosicoes(p => ({ ...p, [a.id]: { x: Math.max(0, e.clientX - caixa.left - a.dx), y: Math.max(0, e.clientY - caixa.top - a.dy) } }));
            }}
            onPointerUp={() => { arrasto.current = null; }}
            onClick={e => { if (e.target === e.currentTarget) setSelecao(null); }}>
            <svg className="md-linhas" width={largura} height={altura} aria-hidden="true">
              {diagrama.ligacoes.map(l => {
                /* Duas ligações entre as mesmas tabelas correm lado a lado, e
                   não uma em cima da outra: sobrepostas, a segunda some e as
                   marcas das pontas viram um borrão. */
                const par = (x: LigacaoDoDiagrama) => [x.de, x.para].sort().join('|');
                const irmas = diagrama.ligacoes.filter(x => par(x) === par(l));
                const desvio = (irmas.indexOf(l) - (irmas.length - 1) / 2) * 14;
                return (
                  <LinhaDaLigacao key={l.id} l={l} diagrama={diagrama} posicao={posicao} desvio={desvio}
                    selecionada={selecao?.tipo === 'ligacao' && selecao.id === l.id} />
                );
              })}
            </svg>
            {diagrama.tabelas.map(t => {
              const p = posicao(t);
              return (
                <div key={t.id} className={selecao?.tipo === 'tabela' && selecao.id === t.id ? 'md-caixa md-caixa-viva' : 'md-caixa'}
                  style={{ left: p.x, top: p.y, width: LARGURA }}
                  onClick={() => setSelecao({ tipo: 'tabela', id: t.id })}>
                  <div className="md-caixa-topo"
                    onPointerDown={e => {
                      const caixa = (e.currentTarget.parentElement!.parentElement as HTMLElement).getBoundingClientRect();
                      arrasto.current = { id: t.id, dx: e.clientX - caixa.left - p.x, dy: e.clientY - caixa.top - p.y };
                    }}>
                    {t.nome || '(sem nome)'}
                  </div>
                  {t.colunas.length === 0 && <div className="md-coluna md-nada">sem colunas</div>}
                  {t.colunas.map(c => (
                    <div key={c.id} className="md-coluna">
                      {c.chave
                        ? <KeyRound className="w-3 h-3 flex-none" style={{ color: '#B8860B' }} aria-label="chave primária" />
                        : c.referencia ? <Link2 className="w-3 h-3 flex-none" style={{ color: '#3B7DD8' }} aria-label="chave estrangeira" />
                          : <span className="md-sem-icone" />}
                      <span className="md-coluna-nome">{c.nome || '(sem nome)'}</span>
                      <span className="md-coluna-tipo">{c.tipo}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="md-propriedades" aria-label="Propriedades">
          {tabelaSelecionada && <PropriedadesDaTabela t={tabelaSelecionada} diagrama={diagrama} mudar={mudar} />}
          {ligacaoSelecionada && <PropriedadesDaLigacao l={ligacaoSelecionada} diagrama={diagrama} mudar={mudar} />}
          {!tabelaSelecionada && !ligacaoSelecionada && (
            <p className="md-nada">Clique numa tabela ou numa ligação para ver as propriedades dela.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

const nomeDe = (d: Diagrama, id: string) => tabelaPorId(d, id)?.nome || '(sem nome)';

function PropriedadesDaTabela({ t, diagrama, mudar }: { t: TabelaDoDiagrama; diagrama: Diagrama; mudar: (d: Diagrama) => void }) {
  return (
    <div className="md-form">
      <p className="md-rotulo">Tabela</p>
      <label className="md-campo">
        <span>Nome</span>
        <input value={t.nome} onChange={e => mudar(mudarTabela(diagrama, t.id, x => ({ ...x, nome: e.target.value })))} />
      </label>
      <p className="md-rotulo">Colunas</p>
      {t.colunas.map(c => (
        <fieldset key={c.id} className="md-coluna-form">
          <legend className="md-escondido">Coluna {c.nome}</legend>
          <input aria-label="Nome da coluna" value={c.nome}
            onChange={e => mudar(mudarColuna(diagrama, t.id, c.id, x => ({ ...x, nome: e.target.value })))} />
          <select aria-label={`Tipo de ${c.nome}`} value={c.tipo}
            onChange={e => mudar(mudarColuna(diagrama, t.id, c.id, x => ({ ...x, tipo: e.target.value as TipoDeColuna })))}>
            {TIPOS_DE_COLUNA.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          <label className="md-marca">
            <input type="checkbox" checked={c.chave}
              onChange={e => mudar(mudarColuna(diagrama, t.id, c.id, x => ({ ...x, chave: e.target.checked })))} />
            Chave
          </label>
          <select aria-label={`${c.nome} aponta para`} value={c.referencia ?? ''}
            onChange={e => mudar(mudarColuna(diagrama, t.id, c.id, x => ({ ...x, referencia: e.target.value || undefined })))}>
            <option value="">não aponta</option>
            {diagrama.tabelas.filter(o => o.id !== t.id).map(o => <option key={o.id} value={o.id}>aponta para {o.nome}</option>)}
          </select>
          <button className="md-remover" aria-label={`Remover a coluna ${c.nome}`}
            onClick={() => mudar(removerColuna(diagrama, t.id, c.id))}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </fieldset>
      ))}
      <button className="md-mais" onClick={() => mudar(novaColuna(diagrama, t.id))}><Plus className="w-3.5 h-3.5" /> Coluna</button>
    </div>
  );
}

function PropriedadesDaLigacao({ l, diagrama, mudar }: { l: LigacaoDoDiagrama; diagrama: Diagrama; mudar: (d: Diagrama) => void }) {
  const opcoes = diagrama.tabelas.map(t => <option key={t.id} value={t.id}>{t.nome || '(sem nome)'}</option>);
  return (
    <div className="md-form">
      <p className="md-rotulo">Ligação</p>
      <label className="md-campo">
        <span>De</span>
        <select value={l.de} onChange={e => mudar(mudarLigacao(diagrama, l.id, x => ({ ...x, de: e.target.value })))}>{opcoes}</select>
      </label>
      <label className="md-campo">
        <span>Cardinalidade</span>
        <select value={l.cardinalidade}
          onChange={e => mudar(mudarLigacao(diagrama, l.id, x => ({ ...x, cardinalidade: e.target.value as Cardinalidade })))}>
          {CARDINALIDADES.map(c => <option key={c} value={c}>{TEXTO_DA_CARDINALIDADE[c]}</option>)}
        </select>
      </label>
      <label className="md-campo">
        <span>Para</span>
        <select value={l.para} onChange={e => mudar(mudarLigacao(diagrama, l.id, x => ({ ...x, para: e.target.value })))}>{opcoes}</select>
      </label>
      <p className="md-nota">Lida de cima para baixo: um {nomeDe(diagrama, l.de)} para {l.cardinalidade === '1:1' ? 'um' : 'muitos'} {nomeDe(diagrama, l.para)}{l.cardinalidade === 'N:N' ? ', e muitos para muitos' : ''}.</p>
    </div>
  );
}

const TEXTO_DA_CARDINALIDADE: Record<Cardinalidade, string> = {
  '1:N': '1:N — um para muitos',
  '1:1': '1:1 — um para um',
  'N:N': 'N:N — muitos para muitos',
};

/**
 * A linha entre duas caixas, com a marca de cada ponta.
 *
 * Um traço atravessado é "um"; o pé de galinha, três traços abertos, é
 * "muitos" — a notação que todo modelador usa. E a ponta leva também o 1 ou o
 * N escrito: a forma sozinha é o que a lição ensina a ler, e quem ainda não
 * sabe lê-la tem a letra ao lado. É forma **e** cor, pela razão da insígnia.
 */
function LinhaDaLigacao({ l, diagrama, posicao, selecionada, desvio }: {
  l: LigacaoDoDiagrama; diagrama: Diagrama; posicao: (t: TabelaDoDiagrama) => Ponto; selecionada: boolean;
  /** Quanto afastar a linha da do lado, quando duas ligam as mesmas tabelas. */
  desvio: number;
}) {
  const a = tabelaPorId(diagrama, l.de);
  const b = tabelaPorId(diagrama, l.para);
  if (!a || !b || a === b) return null;
  const pa = posicao(a);
  const pb = posicao(b);
  const ca = { x: pa.x + LARGURA / 2, y: pa.y + alturaDe(a) / 2 };
  const cb = { x: pb.x + LARGURA / 2, y: pb.y + alturaDe(b) / 2 };
  const deLado = Math.abs(cb.x - ca.x) > LARGURA * 0.75;
  const ini = deLado
    ? { x: cb.x > ca.x ? pa.x + LARGURA : pa.x, y: ca.y + desvio }
    : { x: ca.x + desvio, y: cb.y > ca.y ? pa.y + alturaDe(a) : pa.y };
  const fim = deLado
    ? { x: cb.x > ca.x ? pb.x : pb.x + LARGURA, y: cb.y + desvio }
    : { x: cb.x + desvio, y: cb.y > ca.y ? pb.y : pb.y + alturaDe(b) };
  const muitosEm = { de: l.cardinalidade === 'N:N', para: l.cardinalidade !== '1:1' };
  const cor = selecionada ? '#D9480F' : '#4A5568';
  return (
    <g stroke={cor} strokeWidth={selecionada ? 2.2 : 1.6} fill="none">
      <line x1={ini.x} y1={ini.y} x2={fim.x} y2={fim.y} />
      <Ponta em={ini} longe={fim} muitos={muitosEm.de} cor={cor} />
      <Ponta em={fim} longe={ini} muitos={muitosEm.para} cor={cor} />
    </g>
  );
}

function Ponta({ em, longe, muitos, cor }: { em: Ponto; longe: Ponto; muitos: boolean; cor: string }) {
  const d = Math.hypot(longe.x - em.x, longe.y - em.y) || 1;
  const ux = (longe.x - em.x) / d;
  const uy = (longe.y - em.y) / d;
  const px = -uy;
  const py = ux;
  const ponto = (ao: number, de: number) => `${em.x + ux * ao + px * de},${em.y + uy * ao + py * de}`;
  return (
    <>
      {muitos
        ? <polyline points={`${ponto(0, -8)} ${ponto(12, 0)} ${ponto(0, 8)}`} />
        : <line x1={em.x + ux * 10 + px * -7} y1={em.y + uy * 10 + py * -7} x2={em.x + ux * 10 + px * 7} y2={em.y + uy * 10 + py * 7} />}
      {muitos && <line x1={em.x} y1={em.y} x2={em.x + ux * 12} y2={em.y + uy * 12} />}
      <text x={em.x + ux * 22 + px * 12} y={em.y + uy * 22 + py * 12 + 4} fill={cor} stroke="none"
        fontSize="12" fontWeight="700" textAnchor="middle">{muitos ? 'N' : '1'}</text>
    </>
  );
}

/* Clara, como a prancha de todo modelador: as caixas são papel sobre mesa. */
export const CSS_DO_MODELADOR = `
.md { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #F3F4F6; color: #1F2937;
  font-family: 'Segoe UI', system-ui, Roboto, sans-serif; }
.md-titulo { flex: none; height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px;
  background: #FFFFFF; border-bottom: 1px solid #D1D5DB; font-size: 12.5px; color: #1F2937; }
.md-barra { flex: none; display: flex; gap: 6px; padding: 6px 8px; background: #FFFFFF; border-bottom: 1px solid #D1D5DB;
  overflow-x: auto; }
.md-barra button { display: inline-flex; align-items: center; gap: 5px; border: 1px solid #C7CDD6; border-radius: 4px;
  background: #FFFFFF; color: #1F2937; padding: 5px 10px; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.md-barra button:hover { background: #EEF2F7; }
.md-barra button:disabled { color: #8A93A0; background: #F3F4F6; cursor: default; }
.md-corpo { flex: 1; min-height: 0; display: flex; }
.md-lista { width: 190px; flex: none; overflow: auto; background: #FFFFFF; border-right: 1px solid #D1D5DB; padding: 6px 0; }
.md-rotulo { margin: 8px 10px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #4B5563; }
.md-item { width: 100%; display: flex; align-items: center; gap: 6px; border: 0; background: none; color: #1F2937;
  padding: 4px 10px; font-size: 12.5px; cursor: pointer; text-align: left; }
.md-item:hover { background: #EEF2F7; }
.md-item[aria-current="true"] { background: #DBE7F7; }
.md-nada { margin: 4px 10px; font-size: 12px; color: #4B5563; }
.md-prancha-rolo { flex: 1; min-width: 0; overflow: auto; }
.md-prancha { position: relative; background-color: #F3F4F6;
  background-image: radial-gradient(#D1D5DB 1px, transparent 1px); background-size: 16px 16px; }
.md-linhas { position: absolute; left: 0; top: 0; pointer-events: none; }
.md-caixa { position: absolute; background: #FFFFFF; border: 1px solid #9CA3AF; border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,.12); font-size: 12.5px; cursor: default; }
.md-caixa-viva { border-color: #D9480F; box-shadow: 0 0 0 2px rgba(217,72,15,.25); }
.md-caixa-topo { height: 32px; display: flex; align-items: center; padding: 0 10px; background: #2F4F7F; color: #FFFFFF;
  font-weight: 700; border-radius: 5px 5px 0 0; cursor: grab; touch-action: none; }
.md-coluna { height: 24px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border-top: 1px solid #EEF0F3; }
.md-sem-icone { width: 12px; flex: none; }
.md-coluna-nome { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1F2937; }
.md-coluna-tipo { font-size: 11px; color: #4B5563; }
.md-propriedades { width: 290px; flex: none; overflow: auto; background: #FFFFFF; border-left: 1px solid #D1D5DB; padding: 6px 10px 16px; }
.md-form { display: flex; flex-direction: column; gap: 6px; }
.md-campo { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #374151; }
.md-campo input, .md-campo select, .md-coluna-form input, .md-coluna-form select { border: 1px solid #C7CDD6; border-radius: 4px;
  padding: 4px 6px; font-size: 12.5px; color: #1F2937; background: #FFFFFF; min-width: 0; }
.md-coluna-form { display: grid; grid-template-columns: 1fr 86px; gap: 4px; align-items: center; margin: 0; padding: 6px;
  border: 1px solid #E5E7EB; border-radius: 4px; }
.md-escondido { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.md-marca { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #374151; }
.md-remover { justify-self: end; border: 1px solid #C7CDD6; border-radius: 4px; background: #FFFFFF; color: #9B2C2C;
  padding: 3px 6px; cursor: pointer; }
.md-mais { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #C7CDD6;
  border-radius: 4px; background: #FFFFFF; color: #1F2937; padding: 4px 10px; font-size: 12.5px; cursor: pointer; }
.md-nota { margin: 4px 0 0; font-size: 12px; color: #374151; line-height: 1.45; }

/*
  No celular a prancha fica em cima, com rolagem própria, e a lista e as
  propriedades descem inteiras: sem as propriedades não há como marcar a chave
  nem dizer a cardinalidade, que são o requisito inteiro.
*/
@media (max-width: 860px) {
  .md-corpo { flex-direction: column; overflow: auto; }
  .md-prancha-rolo { flex: none; height: 360px; }
  .md-lista, .md-propriedades { width: 100%; border: 0; border-top: 1px solid #D1D5DB; }
  .md-lista { order: 2; }
  .md-propriedades { order: 3; }
}
`;
