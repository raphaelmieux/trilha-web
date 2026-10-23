import {
  PALAVRAS_DA_DEFESA, PALAVRAS_DA_IDEIA, PALAVRAS_DO_CONCEITO, PALAVRAS_DO_DESCARTE, PALAVRAS_DO_ENSINO,
  PALAVRAS_DO_PORQUE, PALAVRAS_DO_PUBLICO,
  type CadernoDaIdentidade, type ContextoDaIdentidade, type LicaoDaCcDg004,
} from './metasDaCcDg004';

/**
 * O caderno de projeto da CC-DG004: o que o editor de desenho não tem onde
 * guardar.
 *
 * O conceito, os dez rascunhos feitos à mão e a defesa são tela da
 * plataforma inteira — nenhum programa de desenho tem um lugar para "por que
 * o rascunho 6 ficou para trás", e é exatamente isso que o examinador
 * pergunta. As lições de versões e de proteção usam o caderno para o que se
 * escreve ao lado do desenho. Cada lição vê só o que é dela, que é o arranjo
 * do caderno da CC-DG001.
 */

export interface PropsDoCadernoDaIdentidade {
  ctx: ContextoDaIdentidade;
  mudar: (f: (c: ContextoDaIdentidade) => ContextoDaIdentidade) => void;
  licao: LicaoDaCcDg004;
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

function Escrita({ id, titulo, ajuda, valor, minimo, linhas = 4, mudar }: {
  id: string; titulo: string; ajuda?: string; valor: string; minimo: number; linhas?: number; mudar: (v: string) => void;
}) {
  return (
    <div className="card p-4">
      <label className="block text-sm font-semibold mb-1" htmlFor={id}>{titulo}</label>
      {ajuda && <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</p>}
      <textarea id={id} className="input-field text-sm w-full" rows={linhas} value={valor} onChange={e => mudar(e.target.value)} />
      <Contador texto={valor} minimo={minimo} />
    </div>
  );
}

/** Um número que pode estar em branco: o campo vazio é "não declarado", e não zero. */
const numeroOuNada = (v: string): number | null => {
  const n = Number(v.replace(',', '.'));
  return v.trim() === '' || Number.isNaN(n) ? null : n;
};

export function CadernoDaIdentidade({ ctx, mudar, licao }: PropsDoCadernoDaIdentidade) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: CadernoDaIdentidade) => CadernoDaIdentidade) => mudar(c => ({ ...c, caderno: f(c.caderno) }));

  if (licao === 'conceito') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">O conceito da marca da unidade Ipê</h2>
        <Escrita id="o-que-comunica" titulo="O que a marca deve comunicar" minimo={PALAVRAS_DO_CONCEITO}
          ajuda="O que a unidade é, e o que quem olha a marca deve sentir antes de ler qualquer palavra."
          valor={cad.oQueComunica} mudar={v => mudarCaderno(c => ({ ...c, oQueComunica: v }))} />
        <Escrita id="a-quem" titulo="A quem ela fala" minimo={PALAVRAS_DO_PUBLICO} linhas={2}
          ajuda="Quem vai ver a marca primeiro, e com que idade."
          valor={cad.aQuem} mudar={v => mudarCaderno(c => ({ ...c, aQuem: v }))} />
        <fieldset className="card p-4">
          <legend className="text-sm font-semibold px-1">Três palavras</legend>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Elas vão decidir cada escolha daqui para a frente: a forma, a cor e a letra.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {cad.palavras.map((p, i) => (
              <input key={i} className="input-field text-sm" aria-label={`Palavra ${i + 1}`} value={p}
                onChange={e => mudarCaderno(c => {
                  const palavras = [...c.palavras] as CadernoDaIdentidade['palavras'];
                  palavras[i] = e.target.value;
                  return { ...c, palavras };
                })} />
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  if (licao === 'rascunhos') {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Os dez rascunhos</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Desenhe no papel, rápido, sem apagar nenhum. Aqui fica o registro: a ideia de cada um, qual seguiu, e por que os outros não.
        </p>
        {cad.rascunhos.map((r, i) => {
          const seguiu = cad.escolhido === i;
          return (
            <fieldset key={i} className="card p-4" aria-label={`Rascunho ${i + 1}`}>
              <legend className="text-sm font-semibold px-1">Rascunho {i + 1}</legend>
              <label className="block text-xs mb-1" htmlFor={`ideia-${i}`}>A ideia ({PALAVRAS_DA_IDEIA} palavras ou mais)</label>
              <input id={`ideia-${i}`} className="input-field text-sm w-full" value={r.ideia}
                onChange={e => mudarCaderno(c => ({ ...c, rascunhos: c.rascunhos.map((x, j) => (j === i ? { ...x, ideia: e.target.value } : x)) }))} />
              <label className="inline-flex items-center gap-2 text-sm mt-2">
                <input type="radio" name="escolhido" checked={seguiu}
                  onChange={() => mudarCaderno(c => ({ ...c, escolhido: i }))} />
                Seguir com este
              </label>
              {!seguiu && (
                <>
                  <label className="block text-xs mt-2 mb-1" htmlFor={`porque-nao-${i}`}>Por que não ({PALAVRAS_DO_DESCARTE} palavras ou mais)</label>
                  <input id={`porque-nao-${i}`} className="input-field text-sm w-full" value={r.porQueNao}
                    onChange={e => mudarCaderno(c => ({ ...c, rascunhos: c.rascunhos.map((x, j) => (j === i ? { ...x, porQueNao: e.target.value } : x)) }))} />
                </>
              )}
            </fieldset>
          );
        })}
      </div>
    );
  }

  if (licao === 'versoes') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Uma cor só, e pequena</h2>
        <Escrita id="porque-uma-cor" titulo="Por que a marca precisa funcionar numa cor só e em tamanho reduzido" minimo={PALAVRAS_DO_PORQUE}
          ajuda="Pense onde ela vai parar: carimbo, bordado, cópia em preto e branco, o ícone do grupo da unidade."
          valor={cad.porQueUmaCor} mudar={v => mudarCaderno(c => ({ ...c, porQueUmaCor: v }))} />
      </div>
    );
  }

  if (licao === 'protecao') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Área de proteção e tamanho mínimo</h2>
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="protecao">Área de proteção, em fração da altura do símbolo</label>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>0,5 quer dizer meia altura do símbolo de espaço vazio em volta da assinatura, nos quatro lados.</p>
          <input id="protecao" className="input-field text-sm" inputMode="decimal" defaultValue={cad.protecao === null ? '' : String(cad.protecao).replace('.', ',')}
            onChange={e => { const v = numeroOuNada(e.target.value); mudarCaderno(c => ({ ...c, protecao: v })); }} />
        </div>
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="minimo">Tamanho mínimo: a menor largura da assinatura, em pixels</label>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>A largura em que a letra do logotipo ainda se lê. Teste na prancha Tamanho mínimo antes de escrever.</p>
          <input id="minimo" className="input-field text-sm" inputMode="numeric" defaultValue={cad.minimo === null ? '' : String(cad.minimo)}
            onChange={e => { const v = numeroOuNada(e.target.value); mudarCaderno(c => ({ ...c, minimo: v })); }} />
        </div>
      </div>
    );
  }

  /* A defesa: o requisito 7, escrito antes de ser falado. */
  const descartaveis = cad.rascunhos.map((r, i) => ({ r, i })).filter(({ i }) => i !== cad.escolhido);
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A defesa diante do examinador</h2>
      <div className="card p-4 text-sm space-y-1">
        <p><strong>O conceito:</strong> {cad.oQueComunica}</p>
        <p><strong>A quem:</strong> {cad.aQuem}</p>
        <p><strong>As três palavras:</strong> {cad.palavras.join(', ')}</p>
      </div>
      <Escrita id="defesa" titulo="A defesa do conceito" minimo={PALAVRAS_DA_DEFESA} linhas={6}
        ajuda="Mostre onde cada palavra do conceito aparece no desenho: na forma, na cor e na letra."
        valor={cad.defesa} mudar={v => mudarCaderno(c => ({ ...c, defesa: v }))} />
      <div className="card p-4 space-y-2">
        <label className="block text-sm font-semibold" htmlFor="descarte">O descarte que mais ensinou</label>
        <select id="descarte" className="input-field text-sm w-full" value={cad.descarteContado ?? ''}
          onChange={e => { const v = e.target.value === '' ? null : Number(e.target.value); mudarCaderno(c => ({ ...c, descarteContado: v })); }}>
          <option value="">Escolha um rascunho que ficou para trás</option>
          {descartaveis.map(({ r, i }) => <option key={i} value={i}>Rascunho {i + 1}: {r.ideia}</option>)}
        </select>
        <textarea aria-label="O que o descarte ensinou" className="input-field text-sm w-full" rows={4} value={cad.oQueODescarteEnsinou}
          onChange={e => mudarCaderno(c => ({ ...c, oQueODescarteEnsinou: e.target.value }))} />
        <Contador texto={cad.oQueODescarteEnsinou} minimo={PALAVRAS_DO_ENSINO} />
      </div>
    </div>
  );
}
