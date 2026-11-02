import { useState } from 'react';
import { X } from 'lucide-react';
import { palavrasDe } from './projetoDeDesign';
import {
  DECISOES_DO_PROJETO, HOJE_DA_PROPOSTA, LEMBRANCAS_DO_CAMINHO, MINUTOS_DA_APRESENTACAO, O_QUE_DEMONSTRAR,
  PALAVRAS_DA_ALTERNATIVA, PALAVRAS_DA_JUSTIFICATIVA, PALAVRAS_DA_SOLUCAO, PALAVRAS_DO_PROBLEMA,
  PALAVRAS_DO_PROBLEMA_NO_DIARIO, PALAVRAS_DO_QUE_APARECEU, PARTES_DA_APRESENTACAO,
  enviarParaAprovacao, minutosDoRoteiro, operacoesDe,
  type ContextoDaCc006, type DecisaoDoProjeto, type LicaoDaCc006, type RegistroDoDiario,
} from './metasDaCc006';

/**
 * O caderno da CC006: a proposta, o diário de bordo e o roteiro da
 * apresentação.
 *
 * Nada daqui julga. O caderno mostra o que se pediu e conta palavras, e quem
 * diz se está feito é a lista de tarefas — a regra do caderno da CC-DG006,
 * pelo motivo escrito lá. A única voz que devolve alguma coisa é a do
 * examinador, ao receber a proposta, porque é isso que ele faz de verdade.
 */

export interface PropsDoCadernoDoProjetoDePrograma {
  ctx: ContextoDaCc006;
  mudar: (f: (c: ContextoDaCc006) => ContextoDaCc006) => void;
  licao: LicaoDaCc006;
}

function Contagem({ valor, minimo }: { valor: string; minimo: number }) {
  const n = palavrasDe(valor).length;
  return <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}</span>;
}

function Escrita({ id, titulo, ajuda, valor, minimo, mudar, linhas = 3 }: {
  id: string; titulo: string; ajuda?: string; valor: string; minimo: number; mudar: (v: string) => void; linhas?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold" htmlFor={id}>{titulo}</label>
      {ajuda && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</p>}
      <textarea id={id} className="input-field text-sm w-full" rows={linhas} value={valor} onChange={e => mudar(e.target.value)} />
      <Contagem valor={valor} minimo={minimo} />
    </div>
  );
}

export function CadernoDoProjetoDePrograma({ ctx, mudar, licao }: PropsDoCadernoDoProjetoDePrograma) {
  switch (licao) {
    case 'proposta': return <Proposta ctx={ctx} mudar={mudar} />;
    case 'diario': return <Diario ctx={ctx} mudar={mudar} />;
    case 'apresentacao': return <Apresentacao ctx={ctx} mudar={mudar} />;
    default: {
      const naoTratada: never = licao;
      throw new Error(`lição sem caderno: ${naoTratada}`);
    }
  }
}

/* ── A proposta ───────────────────────────────────────────────────────────── */

type Props = Omit<PropsDoCadernoDoProjetoDePrograma, 'licao'>;

const NOME_DA_OPERACAO = { criar: 'cadastrar', consultar: 'consultar', alterar: 'alterar', remover: 'remover' } as const;

function Proposta({ ctx, mudar }: Props) {
  const p = ctx.proposta;
  const editar = (parcial: Partial<typeof p>) => mudar(c => ({ ...c, proposta: { ...c.proposta, ...parcial } }));
  const [nova, setNova] = useState('');
  const [programando, setProgramando] = useState(false);

  const acrescentar = () => {
    const texto = nova.trim();
    if (!texto) return;
    editar({ funcionalidades: [...p.funcionalidades, texto] });
    setNova('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A proposta do almoxarifado</h2>
      <div className="card p-4 text-sm space-y-2">
        <p>
          O material do clube — barracas, lanternas, cordas, panelas — fica anotado num caderno no armário. Ninguém sabe
          ao certo quanto há de cada coisa, e a lista nunca está em dia quando o acampamento chega.
        </p>
        <p>O programa desta vereda é o que resolve isso. Antes de escrever uma linha, o examinador precisa aprovar a proposta.</p>
      </div>

      <div className="card p-4 space-y-4">
        <Escrita id="problema" titulo="O problema a resolver" minimo={PALAVRAS_DO_PROBLEMA}
          ajuda="O que acontece hoje, e por que isso atrapalha o clube."
          valor={p.problema} mudar={v => editar({ problema: v })} />
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Quem vai usar
          <input className="input-field text-sm font-normal" aria-label="Quem vai usar" value={p.usuario}
            onChange={e => editar({ usuario: e.target.value })} placeholder="Quem vai abrir o programa, e para quê" />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-semibold">As funcionalidades</p>
          {p.funcionalidades.length === 0
            ? <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma ainda.</p>
            : (
              <ul className="space-y-1">
                {p.funcionalidades.map((f, i) => {
                  const ops = operacoesDe(f);
                  return (
                    <li key={`${i}-${f}`} className="flex items-start gap-2 text-sm">
                      <span className="flex-1">{f}</span>
                      {ops.length > 0 && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ops.map(o => NOME_DA_OPERACAO[o]).join(', ')}</span>
                      )}
                      <button type="button" className="btn-secondary text-xs px-2 py-1" aria-label={`Tirar: ${f}`}
                        onClick={() => editar({ funcionalidades: p.funcionalidades.filter((_, j) => j !== i) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          <div className="flex gap-2">
            <input className="input-field text-sm flex-1" aria-label="Nova funcionalidade" value={nova}
              onChange={e => setNova(e.target.value)} placeholder="Ex.: Cadastrar um material com o nome e a quantidade"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); acrescentar(); } }} />
            <button type="button" className="btn-secondary text-sm" onClick={acrescentar}>Acrescentar</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm"
            onClick={() => mudar(c => ({ ...c, proposta: enviarParaAprovacao(c.proposta, HOJE_DA_PROPOSTA) }))}>
            Enviar para aprovação
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={() => {
            setProgramando(true);
            if (!p.aprovadaEm) mudar(c => ({ ...c, comecouAntes: true }));
          }}>
            Começar a programar
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
      {programando && (
        <div className="card p-4 text-sm" role="status">
          {ctx.comecouAntes
            ? 'A programação começou antes da aprovação. Se o examinador pedir outra coisa, o código já escrito vai para o lixo — e ele recebe um projeto que não pode mais mudar.'
            : 'Programação liberada: a proposta já tinha voltado aprovada.'}
        </div>
      )}
    </div>
  );
}

/* ── O diário de bordo ────────────────────────────────────────────────────── */

function Diario({ ctx, mudar }: Props) {
  const editar = (i: number, parcial: Partial<RegistroDoDiario>) => mudar(c => ({
    ...c, diario: c.diario.map((r, j) => (j === i ? { ...r, ...parcial } : r)),
  }));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">O diário de bordo</h2>
      <div className="card p-4 text-sm space-y-2">
        <p className="font-semibold">O que aconteceu no caminho</p>
        <ul className="list-disc pl-5 space-y-1">
          {LEMBRANCAS_DO_CAMINHO.map(l => <li key={l}>{l}</li>)}
        </ul>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          São lembranças, e não respostas. O diário pede os três que mais pesaram, contados por você.
        </p>
      </div>
      {ctx.diario.map((r, i) => (
        <div key={i} className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Problema {i + 1}</h3>
          <Escrita id={`problema-${i}`} titulo="O problema" minimo={PALAVRAS_DO_PROBLEMA_NO_DIARIO}
            valor={r.problema} mudar={v => editar(i, { problema: v })} />
          <Escrita id={`apareceu-${i}`} titulo="Como ele apareceu na tela" minimo={PALAVRAS_DO_QUE_APARECEU}
            valor={r.comoApareceu} mudar={v => editar(i, { comoApareceu: v })} linhas={2} />
          <Escrita id={`solucao-${i}`} titulo="A solução, e por que resolveu" minimo={PALAVRAS_DA_SOLUCAO}
            valor={r.solucao} mudar={v => editar(i, { solucao: v })} />
        </div>
      ))}
    </div>
  );
}

/* ── O roteiro da apresentação ────────────────────────────────────────────── */

function Apresentacao({ ctx, mudar }: Props) {
  const total = minutosDoRoteiro(ctx.roteiro);
  const d = ctx.decisao;
  const editarDecisao = (parcial: Partial<typeof d>) => mudar(c => ({ ...c, decisao: { ...c.decisao, ...parcial } }));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Os quinze minutos</h2>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">O roteiro</h3>
        {PARTES_DA_APRESENTACAO.map(p => (
          <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{p.nome}</span>
            <span className="inline-flex items-center gap-1">
              <input type="number" min={0} max={MINUTOS_DA_APRESENTACAO} className="input-field text-sm w-20"
                aria-label={`Minutos: ${p.nome}`} value={ctx.roteiro[p.id] ?? ''}
                onChange={e => {
                  const n = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  mudar(c => ({ ...c, roteiro: { ...c.roteiro, [p.id]: n } }));
                }} />
              min
            </span>
          </label>
        ))}
        <p className="text-sm" role="status">Total: {total} de {MINUTOS_DA_APRESENTACAO} minutos.</p>
      </div>

      {/* Grupo com título, e não fieldset: a legenda de um fieldset se desenha
          sobre a borda do cartão, cortando a linha no meio. */}
      <div className="card p-4" role="group" aria-labelledby="o-que-mostrar">
        <h3 id="o-que-mostrar" className="text-sm font-semibold mb-2">O que mostrar rodando</h3>
        <div className="flex flex-col gap-1.5">
          {O_QUE_DEMONSTRAR.map(x => (
            <label key={x.id} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={ctx.demonstrar.includes(x.id)}
                onChange={e => mudar(c => ({
                  ...c,
                  demonstrar: e.target.checked ? [...new Set([...c.demonstrar, x.id])] : c.demonstrar.filter(y => y !== x.id),
                }))} />
              {x.nome}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold">A decisão técnica</h3>
        <select className="input-field text-sm w-full" aria-label="Decisão técnica" value={d.escolhida ?? ''}
          onChange={e => editarDecisao({ escolhida: (e.target.value || null) as DecisaoDoProjeto | null })}>
          <option value="">Qual decisão você vai justificar?</option>
          {DECISOES_DO_PROJETO.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
        </select>
        <Escrita id="alternativa" titulo="Qual era a outra opção, e o que se perderia com ela" minimo={PALAVRAS_DA_ALTERNATIVA}
          valor={d.alternativa} mudar={v => editarDecisao({ alternativa: v })} linhas={2} />
        <Escrita id="porque" titulo="Por que esta, com um exemplo do programa" minimo={PALAVRAS_DA_JUSTIFICATIVA}
          valor={d.porque} mudar={v => editarDecisao({ porque: v })} linhas={4} />
      </div>
    </div>
  );
}
