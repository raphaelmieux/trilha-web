import { useState } from 'react';
import { CSS_DO_EDITOR_DE_DESIGN, DesenhoDaPrancha } from './editorDeDesign';
import {
  MINUTOS_DA_APRESENTACAO, PALAVRAS_DA_ALTERACAO, PALAVRAS_DA_DEMANDA, PALAVRAS_DO_MOTIVO, PARTES_DA_FALA,
  PECAS_DO_PROJETO, enviarParaAprovacao, minutosDo, palavrasDe, versoesDoArquivo,
  type Leitura, type PecaDoProjeto,
} from './projetoDeDesign';
import { HOJE, IMAGENS_DO_PROJETO, RESPONDENTES } from './acampamentoDasFamilias';
import type { CadernoDoProjeto, ContextoDoProjetoDeDesign, LicaoDaCcDg006 } from './metasDaCcDg006';
import type { Licenca } from './metasDaCcDg003';

/**
 * O caderno da CC-DG006: o que o projeto tem que nenhum programa de design
 * guarda.
 *
 * Cinco lições escrevem nele. A proposta e a apresentação são o caderno
 * inteiro; a origem das imagens fica ao lado do editor de foto; e o processo
 * e o retorno leem o arquivo de design — as versões descartadas são pranchas
 * dele, e a mudança que o público pediu se faz no post. O que se escreve
 * aqui é o que se diz ao examinador, e por isso nada daqui julga: o caderno
 * mostra o que se pediu, e a lista de tarefas diz se está feito.
 */

export interface PropsDoCadernoDoProjeto {
  ctx: ContextoDoProjetoDeDesign;
  mudar: (f: (c: ContextoDoProjetoDeDesign) => ContextoDoProjetoDeDesign) => void;
  licao: LicaoDaCcDg006;
}

const NOME_DA_LICENCA: Record<Licenca, string> = {
  propria: 'Própria, ou do clube com autorização',
  livre: 'Licença livre',
  protegida: 'Protegida: não pode usar',
};

const NOME_DA_LEITURA: Record<Leitura, string> = {
  mudar: 'Pede mudança',
  manter: 'Fica como está',
};

function Escrita({ id, titulo, ajuda, valor, minimo, mudar, linhas = 4 }: {
  id: string; titulo: string; ajuda?: string; valor: string; minimo: number; mudar: (v: string) => void; linhas?: number;
}) {
  const n = palavrasDe(valor).length;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold" htmlFor={id}>{titulo}</label>
      {ajuda && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</p>}
      <textarea id={id} className="input-field text-sm w-full" rows={linhas} value={valor} onChange={e => mudar(e.target.value)} />
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}</span>
    </div>
  );
}

export function CadernoDoProjetoDeDesign({ ctx, mudar, licao }: PropsDoCadernoDoProjeto) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: CadernoDoProjeto) => CadernoDoProjeto) => mudar(c => ({ ...c, caderno: f(c.caderno) }));

  switch (licao) {
    case 'proposta': return <Proposta ctx={ctx} mudar={mudar} />;
    case 'imagens': return <Origens cad={cad} mudarCaderno={mudarCaderno} />;
    case 'processo': return <Processo ctx={ctx} mudarCaderno={mudarCaderno} />;
    case 'retorno': return <Retorno cad={cad} mudarCaderno={mudarCaderno} />;
    case 'apresentacao': return <Apresentacao cad={cad} mudarCaderno={mudarCaderno} />;
    default: return null;
  }
}

/* ── A proposta ───────────────────────────────────────────────────────────── */

function Proposta({ ctx, mudar }: Pick<PropsDoCadernoDoProjeto, 'ctx' | 'mudar'>) {
  const p = ctx.proposta;
  const editar = (parcial: Partial<typeof p>) => mudar(c => ({ ...c, proposta: { ...c.proposta, ...parcial } }));
  const alternar = (id: PecaDoProjeto, sim: boolean) =>
    editar({ pecas: sim ? [...new Set([...p.pecas, id])] : p.pecas.filter(x => x !== id) });
  const [produzindo, setProduzindo] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A proposta</h2>
      <div className="card p-4 space-y-4">
        <Escrita id="demanda" titulo="A demanda de comunicação" minimo={PALAVRAS_DA_DEMANDA}
          ajuda="O que o clube precisa que alguém fique sabendo, e o que acontece hoje porque ninguém fica."
          valor={p.demanda} mudar={v => editar({ demanda: v })} linhas={3} />
        <label className="flex flex-col gap-1 text-sm font-semibold">
          O público
          <input className="input-field text-sm font-normal" aria-label="O público" value={p.publico}
            onChange={e => editar({ publico: e.target.value })} placeholder="Quem precisa ficar sabendo, e de que idade" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Onde a peça digital vai circular
          <input className="input-field text-sm font-normal" aria-label="Onde a peça digital vai circular" value={p.meio}
            onChange={e => editar({ meio: e.target.value })} />
        </label>
        <fieldset>
          <legend className="text-sm font-semibold mb-1">As peças</legend>
          <div className="flex flex-col gap-1.5">
            {PECAS_DO_PROJETO.map(x => (
              <label key={x.id} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.pecas.includes(x.id)} onChange={e => alternar(x.id, e.target.checked)} />
                {x.nome}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm" onClick={() => mudar(c => ({ ...c, proposta: enviarParaAprovacao(c.proposta, HOJE) }))}>
            Enviar para aprovação
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => {
            setProduzindo(true);
            if (!p.aprovadaEm) mudar(c => ({ ...c, comecouAntes: true }));
          }}>
            Começar a produzir
          </button>
        </div>
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
      {produzindo && (
        <div className="card p-4 text-sm" role="status">
          {ctx.comecouAntes
            ? 'A produção começou antes da aprovação. Se o examinador pedir outra coisa, o que já foi feito vai para o lixo — e ele recebe um projeto que não pode mais mudar.'
            : 'Produção liberada: a proposta já tinha voltado aprovada.'}
        </div>
      )}
    </div>
  );
}

/* ── As origens das imagens ───────────────────────────────────────────────── */

function Origens({ cad, mudarCaderno }: { cad: CadernoDoProjeto; mudarCaderno: (f: (c: CadernoDoProjeto) => CadernoDoProjeto) => void }) {
  const mudarOrigem = (id: string, parcial: Partial<CadernoDoProjeto['origens'][string]>) => mudarCaderno(c => ({
    ...c, origens: { ...c.origens, [id]: { ...(c.origens[id] ?? { licenca: null, autor: '' }), ...parcial } },
  }));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">De onde vem cada imagem</h2>
      {IMAGENS_DO_PROJETO.map(i => {
        const d = cad.origens[i.id];
        return (
          <div key={i.id} className="card p-4 space-y-2">
            <p className="text-sm font-semibold">{i.nome}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Veio de: {i.fonte}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select className="input-field text-sm" aria-label={`Licença de ${i.nome}`} value={d?.licenca ?? ''}
                onChange={e => mudarOrigem(i.id, { licenca: (e.target.value || null) as Licenca | null })}>
                <option value="">De quem é?</option>
                {(Object.keys(NOME_DA_LICENCA) as Licenca[]).map(l => <option key={l} value={l}>{NOME_DA_LICENCA[l]}</option>)}
              </select>
              <input className="input-field text-sm" aria-label={`Autor de ${i.nome}`} placeholder="Quem fez"
                value={d?.autor ?? ''} onChange={e => mudarOrigem(i.id, { autor: e.target.value })} />
            </div>
          </div>
        );
      })}
      <div className="card p-4">
        <Escrita id="credito" titulo="O crédito da fogueira" minimo={4}
          ajuda="Como ele vai sair no convite: quem fez, e a licença."
          valor={cad.credito} mudar={v => mudarCaderno(c => ({ ...c, credito: v }))} linhas={2} />
      </div>
    </div>
  );
}

/* ── O processo ───────────────────────────────────────────────────────────── */

function Processo({ ctx, mudarCaderno }: { ctx: ContextoDoProjetoDeDesign; mudarCaderno: (f: (c: CadernoDoProjeto) => CadernoDoProjeto) => void }) {
  const cad = ctx.caderno;
  const [ideia, setIdeia] = useState('');
  const versoes = versoesDoArquivo(ctx.arte);
  const mudarVersao = (id: string, parcial: Partial<CadernoDoProjeto['versoes'][string]>) => mudarCaderno(c => ({
    ...c, versoes: { ...c.versoes, [id]: { ...(c.versoes[id] ?? { descartada: false, motivo: '' }), ...parcial } },
  }));
  const registrar = () => {
    if (!ideia.trim()) return;
    mudarCaderno(c => ({ ...c, rascunhos: [...c.rascunhos, { ideia: ideia.trim() }] }));
    setIdeia('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* As versões são desenhadas pelo mesmo código que as desenha no editor. */}
      <style>{CSS_DO_EDITOR_DE_DESIGN}</style>
      <h2 className="text-lg font-semibold">O processo</h2>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Rascunhos à mão</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          {cad.rascunhos.map((r, i) => <li key={i}>{r.ideia}</li>)}
        </ol>
        <div className="flex gap-2">
          <input className="input-field text-sm flex-1" aria-label="Ideia do rascunho" placeholder="A ideia deste rascunho, em poucas palavras"
            value={ideia} onChange={e => setIdeia(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') registrar(); }} />
          <button type="button" className="btn-secondary text-sm" disabled={!ideia.trim()} onClick={registrar}>Registrar</button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Versões do arquivo</h3>
        {versoes.map(v => {
          const d = cad.versoes[v.id];
          const lado = 140;
          return (
            <div key={v.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <div style={{ flex: 'none' }}>
                <DesenhoDaPrancha prancha={v} escala={lado / Math.max(v.largura, v.altura)} rotulo={`Versão ${v.nome}`} />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold">{v.nome}</p>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!d?.descartada} aria-label={`Descartada: ${v.nome}`}
                    onChange={e => mudarVersao(v.id, { descartada: e.target.checked })} />
                  Descartada
                </label>
                <Escrita id={`motivo-${v.id}`} titulo="Por que foi descartada" minimo={PALAVRAS_DO_MOTIVO}
                  valor={d?.motivo ?? ''} mudar={m => mudarVersao(v.id, { motivo: m })} linhas={2} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── O retorno ────────────────────────────────────────────────────────────── */

function Retorno({ cad, mudarCaderno }: { cad: CadernoDoProjeto; mudarCaderno: (f: (c: CadernoDoProjeto) => CadernoDoProjeto) => void }) {
  const alternar = (id: string, sim: boolean) =>
    mudarCaderno(c => ({ ...c, doPublico: sim ? [...new Set([...c.doPublico, id])] : c.doPublico.filter(x => x !== id) }));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">O retorno</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Sete pessoas viram o post e responderam. O requisito pede cinco do público da proposta.
      </p>
      {RESPONDENTES.map(r => (
        <div key={r.id} className="card p-4 space-y-2">
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={cad.doPublico.includes(r.id)} aria-label={`Do público: ${r.nome}`}
              onChange={e => alternar(r.id, e.target.checked)} />
            {r.nome}, {r.quem}
          </label>
          <p className="text-sm">“{r.comentario}”</p>
          {cad.doPublico.includes(r.id) && (
            <select className="input-field text-sm" aria-label={`Leitura de ${r.nome}`} value={cad.leitura[r.id] ?? ''}
              onChange={e => mudarCaderno(c => ({ ...c, leitura: { ...c.leitura, [r.id]: e.target.value as Leitura } }))}>
              <option value="">O que este retorno pede?</option>
              {(Object.keys(NOME_DA_LEITURA) as Leitura[]).map(l => <option key={l} value={l}>{NOME_DA_LEITURA[l]}</option>)}
            </select>
          )}
        </div>
      ))}
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">A mudança feita</h3>
        <select className="input-field text-sm" aria-label="Retorno que motivou a mudança" value={cad.alteracao.respondente}
          onChange={e => mudarCaderno(c => ({ ...c, alteracao: { ...c.alteracao, respondente: e.target.value } }))}>
          <option value="">Qual retorno?</option>
          {RESPONDENTES.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
        <Escrita id="o-que-mudou" titulo="O que mudou, e por quê" minimo={PALAVRAS_DA_ALTERACAO}
          valor={cad.alteracao.oQueMudou} mudar={v => mudarCaderno(c => ({ ...c, alteracao: { ...c.alteracao, oQueMudou: v } }))} linhas={3} />
      </div>
    </div>
  );
}

/* ── A apresentação ───────────────────────────────────────────────────────── */

function Apresentacao({ cad, mudarCaderno }: { cad: CadernoDoProjeto; mudarCaderno: (f: (c: CadernoDoProjeto) => CadernoDoProjeto) => void }) {
  const total = minutosDo(cad.roteiro);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Quinze minutos</h2>
      <div className="card p-4 space-y-2">
        {PARTES_DA_FALA.map(p => (
          <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{p.nome}</span>
            <input type="number" min={0} max={15} className="input-field text-sm" style={{ width: 80 }}
              aria-label={`Minutos: ${p.nome}`} value={cad.roteiro[p.id] ?? ''}
              onChange={e => {
                const v = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                mudarCaderno(c => ({ ...c, roteiro: { ...c.roteiro, [p.id]: v } }));
              }} />
          </label>
        ))}
        <p className="text-sm font-semibold" style={{ color: total > MINUTOS_DA_APRESENTACAO ? 'var(--color-warning)' : undefined }}>
          Total: {total} de {MINUTOS_DA_APRESENTACAO} minutos
        </p>
      </div>
      <label className="card p-4 inline-flex items-center gap-2 text-sm w-full">
        <input type="checkbox" checked={cad.levaImpressa}
          onChange={e => mudarCaderno(c => ({ ...c, levaImpressa: e.target.checked }))} />
        Levo a peça impressa, do PDF da gráfica
      </label>
    </div>
  );
}
