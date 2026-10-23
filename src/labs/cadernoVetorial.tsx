import {
  PALAVRAS_DA_DIFERENCA, PALAVRAS_DO_PORQUE, USOS,
  type ContextoVetorial, type LicaoDaCcDg002, type Tipo,
} from './metasDaCcDg002';

/**
 * O caderno da CC-DG002: o que nenhum editor de desenho tem onde guardar.
 *
 * Duas lições escrevem: a primeira classifica seis usos do clube e explica a
 * diferença entre vetor e pontos, e a sexta explica quando converter texto em
 * curvas. Cada uma vê só o que é dela — o arranjo do caderno da CC-DG001, pelo
 * motivo escrito lá.
 */

export interface PropsDoCadernoVetorial {
  ctx: ContextoVetorial;
  mudar: (f: (c: ContextoVetorial) => ContextoVetorial) => void;
  licao: LicaoDaCcDg002;
}

const contar = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function Contador({ texto, minimo }: { texto: string; minimo: number }) {
  const n = contar(texto);
  return (
    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
      {n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}
    </span>
  );
}

const NOME_DO_TIPO: Record<Tipo, string> = { vetor: 'Vetor', pontos: 'Imagem de pontos' };

export function CadernoVetorial({ ctx, mudar, licao }: PropsDoCadernoVetorial) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: ContextoVetorial['caderno']) => ContextoVetorial['caderno']) =>
    mudar(c => ({ ...c, caderno: f(c.caderno) }));

  if (licao === 'texto-em-curvas') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Quando converter texto em curvas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Para quem vai o arquivo, e o que acontece do lado de lá se a fonte não estiver instalada.
        </p>
        <div className="card p-4">
          <label className="block text-sm font-semibold mb-2" htmlFor="porque-converter">A explicação</label>
          <textarea id="porque-converter" className="input-field text-sm w-full" rows={5} value={cad.porQueConverter}
            onChange={e => mudarCaderno(c => ({ ...c, porQueConverter: e.target.value }))} />
          <Contador texto={cad.porQueConverter} minimo={PALAVRAS_DO_PORQUE} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Vetor ou imagem de pontos</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Para cada uso do clube, o tipo de imagem que serve.
      </p>
      {USOS.map(u => (
        <fieldset key={u.id} className="card p-4">
          <legend className="text-sm font-semibold px-1">{u.texto}</legend>
          <div className="flex flex-wrap gap-4 mt-1">
            {(['vetor', 'pontos'] as Tipo[]).map(t => (
              <label key={t} className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name={`uso-${u.id}`} checked={cad.usos[u.id] === t}
                  onChange={() => mudarCaderno(c => ({ ...c, usos: { ...c.usos, [u.id]: t } }))} />
                {NOME_DO_TIPO[t]}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="card p-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="diferenca">A diferença, com as suas palavras</label>
        <textarea id="diferenca" className="input-field text-sm w-full" rows={4} value={cad.diferenca}
          onChange={e => mudarCaderno(c => ({ ...c, diferenca: e.target.value }))} />
        <Contador texto={cad.diferenca} minimo={PALAVRAS_DA_DIFERENCA} />
      </div>
    </div>
  );
}
