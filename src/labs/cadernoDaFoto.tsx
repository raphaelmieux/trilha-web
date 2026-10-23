import {
  FONTES_DE_IMAGEM, IMAGENS_DO_REQUISITO_6, PALAVRAS_DO_PORQUE, USOS_DE_FORMATO,
  type CadernoDaFoto, type ContextoDaFoto, type LicaoDaCcDg003, type Licenca,
} from './metasDaCcDg003';
import { NOME_DO_FORMATO, type Formato } from './formatosDeImagem';

/**
 * O caderno da CC-DG003: o que nenhum editor de foto tem onde guardar.
 *
 * Quatro lições escrevem nele — por que a foto ampliada borra, a diferença
 * entre o arquivo de tela e o de papel, o formato de cada uso do clube, e de
 * quem é cada imagem. A última é a lição inteira, porque o requisito 6 não
 * tem gesto de programa nenhum: é a decisão antes de baixar.
 */

const contar = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const NOME_DA_LICENCA: Record<Licenca, string> = { propria: 'Sua', livre: 'Licença livre', protegida: 'Protegida' };

function Texto({ id, titulo, ajuda, valor, mudar }: { id: string; titulo: string; ajuda: string; valor: string; mudar: (v: string) => void }) {
  const n = contar(valor);
  return (
    <div className="card p-4">
      <label className="block text-sm font-semibold mb-1" htmlFor={id}>{titulo}</label>
      <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</p>
      <textarea id={id} className="input-field text-sm w-full" rows={4} value={valor} onChange={e => mudar(e.target.value)} />
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {PALAVRAS_DO_PORQUE}</span>
    </div>
  );
}

export function CadernoDaFoto({ ctx, mudar, licao }: {
  ctx: ContextoDaFoto;
  mudar: (f: (c: ContextoDaFoto) => ContextoDaFoto) => void;
  licao: LicaoDaCcDg003;
}) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: CadernoDaFoto) => CadernoDaFoto) => mudar(c => ({ ...c, caderno: f(c.caderno) }));

  if (licao === 'pixels') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Por que a foto borra</h2>
        <Texto id="por-que-borra" titulo="A explicação" valor={cad.porQueBorra}
          ajuda="O que a foto guarda, o que um vetor guarda, e o que acontece com cada um quando se amplia."
          mudar={v => mudarCaderno(c => ({ ...c, porQueBorra: v }))} />
      </div>
    );
  }

  if (licao === 'tamanhos') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Tela e papel</h2>
        <Texto id="tela-e-papel" titulo="A diferença entre os dois arquivos" valor={cad.telaEPapel}
          ajuda="Quantos pixels cada um tem, para que serve o ppi, e por que a tela o ignora."
          mudar={v => mudarCaderno(c => ({ ...c, telaEPapel: v }))} />
      </div>
    );
  }

  if (licao === 'formatos') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Um formato para cada uso</h2>
        {USOS_DE_FORMATO.map(u => (
          <div key={u.id} className="card p-4">
            <label className="block text-sm font-semibold mb-2" htmlFor={`formato-${u.id}`}>{u.texto}</label>
            <select id={`formato-${u.id}`} className="input-field text-sm" value={cad.formatos[u.id] ?? ''}
              onChange={e => mudarCaderno(c => ({ ...c, formatos: { ...c.formatos, [u.id]: (e.target.value || undefined) as Formato | undefined } }))}>
              <option value="">Escolha…</option>
              {(['jpg', 'png', 'webp', 'tiff'] as Formato[]).map(f => <option key={f} value={f}>{NOME_DO_FORMATO[f]}</option>)}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">De quem é cada imagem</h2>
      {IMAGENS_DO_REQUISITO_6.map(i => (
        <fieldset key={i.id} className="card p-4">
          <legend className="text-sm font-semibold px-1">{i.texto}</legend>
          <div className="flex flex-wrap gap-4 mt-1">
            {(['propria', 'livre', 'protegida'] as Licenca[]).map(l => (
              <label key={l} className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name={`licenca-${i.id}`} checked={cad.licencas[i.id] === l}
                  onChange={() => mudarCaderno(c => ({ ...c, licencas: { ...c.licencas, [i.id]: l } }))} />
                {NOME_DA_LICENCA[l]}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset className="card p-4">
        <legend className="text-sm font-semibold px-1">Onde procurar imagens de uso permitido</legend>
        <div className="flex flex-col gap-2 mt-1">
          {FONTES_DE_IMAGEM.map(f => (
            <label key={f.id} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cad.fontes.includes(f.id)}
                onChange={e => mudarCaderno(c => ({ ...c, fontes: e.target.checked ? [...c.fontes, f.id] : c.fontes.filter(x => x !== f.id) }))} />
              {f.texto}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="card p-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="credito">O crédito da foto do tucano, como vai embaixo dela no cartaz</label>
        <input id="credito" className="input-field text-sm w-full" value={cad.credito} onChange={e => mudarCaderno(c => ({ ...c, credito: e.target.value }))} />
      </div>
    </div>
  );
}
