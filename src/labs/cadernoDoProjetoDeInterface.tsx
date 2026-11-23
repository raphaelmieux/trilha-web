import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { palavrasDe } from './projetoDeDesign';
import {
  APARELHOS, BLOCOS_DO_RASCUNHO, HOJE_DA_PROPOSTA_DA_AGENDA, MINUTOS_DA_APRESENTACAO_DA_AGENDA, NO_CELULAR,
  PALAVRAS_DO_OBJETIVO, PALAVRAS_DO_PLANO_B, PALAVRAS_DO_QUE_A_TELA_MOSTRA, PARTES_DA_APRESENTACAO_DA_AGENDA,
  enviarPropostaDeInterface, minutosDoRoteiroDaAgenda,
  type BlocoDoRascunho, type ContextoDaCcFe007Caderno, type LicaoDoCadernoDaCcFe007, type TelaDoMapa,
} from './projetoDeInterface';

/**
 * O caderno da CC-FE007: a proposta, com o mapa de telas e o rascunho, e o
 * roteiro da apresentação.
 *
 * Nada daqui julga, pela regra do caderno da CC006: o caderno mostra o que se
 * pediu e conta palavras, e quem diz se está feito é a lista de tarefas. A
 * única voz que devolve alguma coisa é a do examinador, ao receber a
 * proposta.
 *
 * O rascunho se desenha ao lado da lista de blocos, num celular de giz: é o
 * papel em que se faz isto de verdade, e o desenho é o que deixa ver que a
 * tela está de cabeça para baixo ou que o menu sumiu.
 */

export interface PropsDoCadernoDoProjetoDeInterface {
  ctx: ContextoDaCcFe007Caderno;
  mudar: (f: (c: ContextoDaCcFe007Caderno) => ContextoDaCcFe007Caderno) => void;
  licao: LicaoDoCadernoDaCcFe007;
}

function Contagem({ valor, minimo }: { valor: string; minimo: number }) {
  const n = palavrasDe(valor).length;
  return <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}</span>;
}

export function CadernoDoProjetoDeInterface({ ctx, mudar, licao }: PropsDoCadernoDoProjetoDeInterface) {
  switch (licao) {
    case 'proposta': return <Proposta ctx={ctx} mudar={mudar} />;
    case 'apresentacao': return <Apresentacao ctx={ctx} mudar={mudar} />;
    default: {
      const naoTratada: never = licao;
      throw new Error(`lição sem caderno: ${naoTratada}`);
    }
  }
}

type Props = Omit<PropsDoCadernoDoProjetoDeInterface, 'licao'>;

const NOME_DO_BLOCO = Object.fromEntries(BLOCOS_DO_RASCUNHO.map(b => [b.id, b.nome])) as Record<BlocoDoRascunho, string>;

/* ── A proposta ───────────────────────────────────────────────────────────── */

function Proposta({ ctx, mudar }: Props) {
  const p = ctx.proposta;
  const editar = (parcial: Partial<typeof p>) => mudar(c => ({ ...c, proposta: { ...c.proposta, ...parcial } }));
  const editarTela = (id: string, f: (t: TelaDoMapa) => TelaDoMapa) =>
    mudar(c => ({ ...c, proposta: { ...c.proposta, telas: c.proposta.telas.map(t => (t.id === id ? f(t) : t)) } }));
  const [nome, setNome] = useState('');
  const [programando, setProgramando] = useState(false);

  const acrescentar = () => {
    const texto = nome.trim();
    if (!texto) return;
    mudar(c => {
      const id = `t${c.proposta.telas.reduce((m, t) => Math.max(m, Number(t.id.slice(1)) || 0), 0) + 1}`;
      return { ...c, proposta: { ...c.proposta, telas: [...c.proposta.telas, { id, nome: texto, mostra: '', leva: [], rascunho: [] }] } };
    });
    setNome('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A proposta da agenda</h2>
      <div className="card p-4 text-sm space-y-2">
        <p>
          Os avisos do clube chegam pelo grupo de mensagens e se perdem entre as fotos do último acampamento. A
          agenda desta vereda junta os próximos eventos num endereço só, que abre no celular.
        </p>
        <p>Antes de escrever uma linha, o examinador precisa aprovar a proposta: o objetivo, o público, o mapa de telas e o rascunho.</p>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="objetivo">O objetivo da aplicação</label>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>O que ela resolve, e o que muda para quem a usa.</p>
          <textarea id="objetivo" className="input-field text-sm w-full" rows={3} value={p.objetivo} onChange={e => editar({ objetivo: e.target.value })} />
          <Contagem valor={p.objetivo} minimo={PALAVRAS_DO_OBJETIVO} />
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          O público-alvo
          <input className="input-field text-sm font-normal" aria-label="O público-alvo" value={p.publico}
            onChange={e => editar({ publico: e.target.value })} placeholder="Quem vai abrir a aplicação" />
        </label>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">O mapa de telas</h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          A primeira tela é a de entrada. Em cada uma, marque as telas a que ela leva.
        </p>
        {p.telas.length === 0 && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma tela ainda.</p>}
        {p.telas.map((t, i) => (
          <div key={t.id} className="cf7-tela" aria-label={`Tela ${t.nome}`}>
            <div className="flex items-center gap-2">
              <strong className="text-sm flex-1">{i === 0 ? 'Entrada · ' : ''}{t.nome}</strong>
              <button type="button" className="btn-secondary text-xs px-2 py-1" aria-label={`Tirar a tela ${t.nome}`}
                onClick={() => mudar(c => ({
                  ...c,
                  proposta: {
                    ...c.proposta,
                    telas: c.proposta.telas.filter(x => x.id !== t.id).map(x => ({ ...x, leva: x.leva.filter(y => y !== t.id) })),
                  },
                }))}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <label className="flex flex-col gap-1 text-xs">
              O que ela mostra
              <input className="input-field text-sm" aria-label={`O que a tela ${t.nome} mostra`} value={t.mostra}
                onChange={e => editarTela(t.id, x => ({ ...x, mostra: e.target.value }))} />
              <Contagem valor={t.mostra} minimo={PALAVRAS_DO_QUE_A_TELA_MOSTRA} />
            </label>
            {p.telas.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 text-xs" role="group" aria-label={`Telas a que ${t.nome} leva`}>
                <span>Leva a:</span>
                {p.telas.filter(x => x.id !== t.id).map(x => (
                  <label key={x.id} className="inline-flex items-center gap-1">
                    <input type="checkbox" checked={t.leva.includes(x.id)}
                      onChange={e => editarTela(t.id, y => ({ ...y, leva: e.target.checked ? [...y.leva, x.id] : y.leva.filter(z => z !== x.id) }))} />
                    {x.nome}
                  </label>
                ))}
              </div>
            )}
            <Rascunho tela={t} mudar={r => editarTela(t.id, x => ({ ...x, rascunho: r }))} />
          </div>
        ))}
        <div className="flex gap-2">
          <input className="input-field text-sm flex-1" aria-label="Nome da nova tela" value={nome} placeholder="Ex.: Eventos"
            onChange={e => setNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); acrescentar(); } }} />
          <button type="button" className="btn-secondary text-sm" onClick={acrescentar}>Acrescentar tela</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-sm"
          onClick={() => mudar(c => ({ ...c, proposta: enviarPropostaDeInterface(c.proposta, HOJE_DA_PROPOSTA_DA_AGENDA) }))}>
          Enviar para aprovação
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => {
          setProgramando(true);
          if (!p.aprovadaEm) mudar(c => ({ ...c, comecouAntes: true }));
        }}>
          Começar a programar
        </button>
      </div>

      {p.devolvida && (
        <div className="card p-4 text-sm" role="status">
          <p className="font-semibold mb-1">O examinador devolveu a proposta</p>
          <p>{p.devolvida}</p>
        </div>
      )}
      {p.aprovadaEm && (
        <div className="card p-4 text-sm" role="status">
          <p className="font-semibold">Proposta aprovada em {p.aprovadaEm.split('-').reverse().join('/')}.</p>
        </div>
      )}
      {programando && (
        <div className="card p-4 text-sm" role="status">
          {ctx.comecouAntes
            ? 'A programação começou antes da aprovação. Se o examinador pedir outra tela, ou tirar uma, o código já escrito vai para o lixo.'
            : 'Programação liberada: a proposta já tinha voltado aprovada.'}
        </div>
      )}
      <style>{CSS_DO_CADERNO}</style>
    </div>
  );
}

/** O rascunho de uma tela: a lista de blocos, e o desenho dela num celular de giz. */
function Rascunho({ tela, mudar }: { tela: TelaDoMapa; mudar: (r: BlocoDoRascunho[]) => void }) {
  const r = tela.rascunho;
  const trocar = (i: number, j: number) => {
    const novo = [...r];
    [novo[i], novo[j]] = [novo[j], novo[i]];
    mudar(novo);
  };
  return (
    <div className="cf7-rascunho">
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-xs font-semibold">O rascunho, de cima para baixo</p>
        <ol className="space-y-1" aria-label={`Rascunho da tela ${tela.nome}`}>
          {r.map((b, i) => (
            <li key={`${i}-${b}`} className="flex items-center gap-1 text-xs">
              <span className="flex-1">{NOME_DO_BLOCO[b]}</span>
              <button type="button" className="cf7-mini" aria-label={`Subir ${NOME_DO_BLOCO[b]}`} disabled={i === 0} onClick={() => trocar(i, i - 1)}><ArrowUp className="w-3 h-3" /></button>
              <button type="button" className="cf7-mini" aria-label={`Descer ${NOME_DO_BLOCO[b]}`} disabled={i === r.length - 1} onClick={() => trocar(i, i + 1)}><ArrowDown className="w-3 h-3" /></button>
              <button type="button" className="cf7-mini" aria-label={`Tirar ${NOME_DO_BLOCO[b]}`} onClick={() => mudar(r.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-1" role="group" aria-label={`Blocos para a tela ${tela.nome}`}>
          {BLOCOS_DO_RASCUNHO.map(b => (
            <button key={b.id} type="button" className="cf7-bloco" onClick={() => mudar([...r, b.id])}>
              <Plus className="w-3 h-3" /> {b.nome}
            </button>
          ))}
        </div>
      </div>
      <div className="cf7-giz" aria-hidden="true">
        {r.length === 0 && <span className="cf7-vazio">tela vazia</span>}
        {r.map((b, i) => <div key={`${i}-${b}`} className={`cf7-g cf7-g-${b}`}>{b === 'menu' ? '≡ menu' : b === 'botao' ? 'botão' : b === 'erro' ? '⚠ erro' : b === 'carregando' ? '…' : ''}</div>)}
      </div>
    </div>
  );
}

/* ── O roteiro da apresentação ────────────────────────────────────────────── */

function Apresentacao({ ctx, mudar }: Props) {
  const total = minutosDoRoteiroDaAgenda(ctx.roteiro);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Os quinze minutos</h2>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">O roteiro</h3>
        {PARTES_DA_APRESENTACAO_DA_AGENDA.map(p => (
          <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{p.nome}</span>
            <span className="inline-flex items-center gap-1">
              <input type="number" min={0} max={MINUTOS_DA_APRESENTACAO_DA_AGENDA} className="input-field text-sm w-20"
                aria-label={`Minutos: ${p.nome}`} value={ctx.roteiro[p.id] ?? ''}
                onChange={e => {
                  const n = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  mudar(c => ({ ...c, roteiro: { ...c.roteiro, [p.id]: n } }));
                }} />
              min
            </span>
          </label>
        ))}
        <p className="text-sm" role="status">Total: {total} de {MINUTOS_DA_APRESENTACAO_DA_AGENDA} minutos.</p>
      </div>

      <div className="card p-4" role="group" aria-labelledby="no-celular">
        <h3 id="no-celular" className="text-sm font-semibold mb-2">O que mostrar no celular</h3>
        <div className="flex flex-col gap-1.5">
          {NO_CELULAR.map(x => (
            <label key={x.id} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ctx.noCelular.includes(x.id)}
                onChange={e => mudar(c => ({
                  ...c,
                  noCelular: e.target.checked ? [...new Set([...c.noCelular, x.id])] : c.noCelular.filter(y => y !== x.id),
                }))} />
              {x.nome}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-3" role="group" aria-labelledby="aparelho">
        <h3 id="aparelho" className="text-sm font-semibold">Em que aparelho</h3>
        <div className="flex flex-col gap-1.5">
          {APARELHOS.map(x => (
            <label key={x.id} className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="aparelho" checked={ctx.aparelho === x.id} onChange={() => mudar(c => ({ ...c, aparelho: x.id }))} />
              {x.nome}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="plano-b">Se a internet da sala não funcionar</label>
          <textarea id="plano-b" className="input-field text-sm w-full" rows={2} value={ctx.planoB}
            onChange={e => { const v = e.target.value; mudar(c => ({ ...c, planoB: v })); }} />
          <Contagem valor={ctx.planoB} minimo={PALAVRAS_DO_PLANO_B} />
        </div>
      </div>
    </div>
  );
}

const CSS_DO_CADERNO = `
.cf7-tela { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: 10px; }
.cf7-rascunho { display: flex; gap: 12px; align-items: flex-start; }
.cf7-mini { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: var(--color-bg-hover); color: inherit; }
.cf7-mini:disabled { opacity: 0.35; }
.cf7-bloco { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; padding: 3px 7px; border-radius: 999px;
  border: 1px dashed var(--color-border); color: inherit; background: none; }
.cf7-giz { flex: none; width: 96px; min-height: 170px; padding: 8px 6px; display: flex; flex-direction: column; gap: 4px;
  border: 2px solid rgba(255, 255, 255, 0.7); border-radius: 14px; }
.cf7-vazio { font-size: 10px; opacity: 0.6; margin: auto; }
.cf7-g { border: 1.5px solid rgba(255, 255, 255, 0.7); border-radius: 3px; font-size: 9px; line-height: 1; padding: 2px; text-align: center; }
.cf7-g-cabecalho { height: 14px; background: rgba(255, 255, 255, 0.15); }
.cf7-g-menu { height: 12px; }
.cf7-g-titulo { height: 8px; width: 60%; }
.cf7-g-texto { height: 18px; border-style: dotted; }
.cf7-g-lista { height: 36px; background: repeating-linear-gradient(rgba(255, 255, 255, 0.2) 0 9px, transparent 9px 12px); }
.cf7-g-botao { height: 12px; width: 50%; border-radius: 8px; }
.cf7-g-imagem { height: 30px; background: linear-gradient(to top right, transparent 48%, rgba(255, 255, 255, 0.7) 50%, transparent 52%); }
.cf7-g-campo { height: 12px; border-radius: 6px; }
.cf7-g-carregando { height: 10px; border-style: dashed; }
.cf7-g-erro { height: 12px; border-color: #F28B82; color: #F28B82; }
@media (max-width: 520px) { .cf7-rascunho { flex-direction: column; } }
`;
