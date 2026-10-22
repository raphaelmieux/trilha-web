import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { DesenhoDaPrancha, FiltrosDeVisao } from './editorDeDesign';
import { FAMILIAS, NOME_DA_CLASSIFICACAO, NOME_DO_PAPEL, PAPEIS, textos, umObjeto, umaPrancha, type Papel } from './design';
import { FOLHETO, NOME_DA_CLASSE, PECAS_DA_ANALISE, type Classe, type PecaDaAnalise } from './arteDoClube';
import {
  NOME_DO_PRINCIPIO, PALAVRAS_DA_COR_SOZINHA, PALAVRAS_DA_JUSTIFICATIVA, PALAVRAS_DA_NOTA,
  PALAVRAS_DO_PAR, PRINCIPIOS, PRINCIPIO_COM_ARTIGO,
  type AnaliseDaPeca, type ContextoDoDesign, type LicaoDaCcDg001, type NotaDoPrincipio, type Principio,
} from './metasDaCcDg001';

/**
 * As telas da CC-DG001 que são da plataforma, e não do editor.
 *
 * A análise do módulo 6 e o caderno dos módulos 4, 5 e 8. Nenhum editor de
 * design tem onde escrever "por que esta cor" nem "o título some aqui", e pôr
 * um campo assim dentro da janela seria pôr coisa nossa dentro do programa
 * imitado — que é o contrário do que a moldura existe para fazer. É o caderno
 * da CC-ES009 outra vez.
 *
 * A peça da análise é desenhada pelo mesmo `DesenhoDaPrancha` do editor:
 * "o título some na foto" precisa ser verdade nas duas telas.
 */

export interface PropsDaTelaDeDesign {
  ctx: ContextoDoDesign;
  mudar: (f: (c: ContextoDoDesign) => ContextoDoDesign) => void;
  licao: LicaoDaCcDg001;
}

const contarPalavras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function Contador({ texto, minimo }: { texto: string; minimo: number }) {
  const n = contarPalavras(texto);
  return (
    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
      {n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}
    </span>
  );
}

/* ── A análise das três peças ─────────────────────────────────────────────── */

export function AnaliseDasPecas({ ctx, mudar }: PropsDaTelaDeDesign) {
  const [peca, setPeca] = useState<PecaDaAnalise>(PECAS_DA_ANALISE[0]);
  const [apontando, setApontando] = useState<Principio | null>(null);
  const p = umaPrancha(ctx.arte, peca)!;
  const a = ctx.analise[peca];

  const mudarAnalise = (f: (x: AnaliseDaPeca) => AnaliseDaPeca) =>
    mudar(c => ({ ...c, analise: { ...c.analise, [peca]: f(c.analise[peca]) } }));
  const mudarNota = (pr: Principio, muda: Partial<NotaDoPrincipio>) =>
    mudarAnalise(x => ({ ...x, notas: { ...x.notas, [pr]: { ...x.notas[pr], ...muda } } }));

  /* A peça cabe numa coluna de 340 pixels, no computador e no celular. */
  const escala = 340 / p.largura;

  return (
    <div className="max-w-5xl mx-auto">
      <FiltrosDeVisao />
      <h2 className="text-lg font-semibold mb-1">Análise de três peças</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Para cada peça: diga se ela é bem resolvida, mal resolvida ou de qualidade discutível, e analise
        hierarquia, contraste e alinhamento — apontando, na peça, onde você vê cada um.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Peças">
        {PECAS_DA_ANALISE.map(id => (
          <button key={id} type="button" role="tab" aria-selected={id === peca}
            className={id === peca ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
            onClick={() => { setPeca(id); setApontando(null); }}>
            {umaPrancha(ctx.arte, id)!.nome}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-none">
          {apontando && (
            <p className="text-sm mb-2" role="status">
              Clique no elemento da peça em que você vê {PRINCIPIO_COM_ARTIGO[apontando]}.
            </p>
          )}
          <DesenhoDaPrancha
            prancha={p} escala={escala}
            selecionados={apontando && a.notas[apontando].elemento ? [a.notas[apontando].elemento!] : []}
            aoApertar={apontando ? id => { mudarNota(apontando, { elemento: id }); setApontando(null); } : undefined}
            rotulo={`Peça: ${p.nome}`}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <fieldset className="card p-4">
            <legend className="text-sm font-semibold px-1">Classificação</legend>
            <div className="flex flex-wrap gap-3 mt-1">
              {(['bem', 'mal', 'discutivel'] as Classe[]).map(c => (
                <label key={c} className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name={`classe-${peca}`} checked={a.classe === c}
                    onChange={() => mudarAnalise(x => ({ ...x, classe: c }))} />
                  {NOME_DA_CLASSE[c]}
                </label>
              ))}
            </div>
          </fieldset>

          {PRINCIPIOS.map(pr => {
            const n = a.notas[pr];
            const apontado = n.elemento ? umObjeto(p, n.elemento) : undefined;
            return (
              <fieldset key={pr} className="card p-4" aria-label={NOME_DO_PRINCIPIO[pr]}>
                <legend className="text-sm font-semibold px-1">{NOME_DO_PRINCIPIO[pr]}</legend>
                <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
                  {(['funciona', 'falha'] as const).map(v => (
                    <button key={v} type="button" aria-pressed={n.veredito === v}
                      className={n.veredito === v ? 'btn-primary text-xs py-1.5' : 'btn-secondary text-xs py-1.5'}
                      onClick={() => mudarNota(pr, { veredito: v })}>
                      {v === 'funciona' ? 'Funciona' : 'Falha'}
                    </button>
                  ))}
                  <button type="button" aria-pressed={apontando === pr}
                    className="btn-secondary text-xs py-1.5 inline-flex items-center gap-1"
                    onClick={() => setApontando(apontando === pr ? null : pr)}>
                    <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                    {apontando === pr ? 'Cancelar' : `Apontar na peça`}
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {apontado ? `Apontado: ${apontado.nome}` : 'Nada apontado'}
                  </span>
                </div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }} htmlFor={`nota-${peca}-${pr}`}>
                  O que você viu
                </label>
                <textarea id={`nota-${peca}-${pr}`} className="input-field text-sm w-full" rows={2} value={n.texto}
                  onChange={e => mudarNota(pr, { texto: e.target.value })} />
                <Contador texto={n.texto} minimo={PALAVRAS_DA_NOTA} />
              </fieldset>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── O caderno ────────────────────────────────────────────────────────────── */

/**
 * O caderno das três lições que escrevem.
 *
 * Cada lição vê só o que é dela: o porquê das cores no módulo 4, o par de
 * famílias no 5 e a cor sozinha no 8. Mostrar os três campos em todas
 * prometeria trabalho que a lição não pede.
 */
export function CadernoDeDesign({ ctx, mudar, licao }: PropsDaTelaDeDesign) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: ContextoDoDesign['caderno']) => ContextoDoDesign['caderno']) =>
    mudar(c => ({ ...c, caderno: f(c.caderno) }));

  if (licao === 'cor') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Por que cada cor</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Uma frase para cada cor da paleta: o papel dela na peça, e por que ela e não outra.
        </p>
        {PAPEIS.map((papel: Papel) => {
          const hex = ctx.arte.paleta[papel];
          return (
            <div key={papel} className="card p-4">
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" htmlFor={`cor-${papel}`}>
                <span className="inline-block w-5 h-5 rounded border border-white/20" style={{ background: hex ?? 'transparent' }} aria-hidden="true" />
                {NOME_DO_PAPEL[papel]} {hex && <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>{hex}</span>}
              </label>
              <textarea id={`cor-${papel}`} className="input-field text-sm w-full" rows={2}
                value={cad.porQueDaCor[papel]}
                onChange={e => mudarCaderno(c => ({ ...c, porQueDaCor: { ...c.porQueDaCor, [papel]: e.target.value } }))} />
              <Contador texto={cad.porQueDaCor[papel]} minimo={PALAVRAS_DA_JUSTIFICATIVA} />
            </div>
          );
        })}
      </div>
    );
  }

  if (licao === 'tipografia') {
    const folheto = umaPrancha(ctx.arte, FOLHETO);
    const familias = folheto ? [...new Set(textos(folheto).map(t => t.familia))] : [];
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Por que as duas funcionam juntas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No folheto agora: {familias.map(f => `${f} (${NOME_DA_CLASSIFICACAO[FAMILIAS[f].classificacao].toLowerCase()})`).join(', ')}.
        </p>
        <div className="card p-4">
          <label className="block text-sm font-semibold mb-2" htmlFor="par-tipografico">A explicação</label>
          <textarea id="par-tipografico" className="input-field text-sm w-full" rows={5} value={cad.parTipografico}
            onChange={e => mudarCaderno(c => ({ ...c, parTipografico: e.target.value }))} />
          <Contador texto={cad.parTipografico} minimo={PALAVRAS_DO_PAR} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A cor que não carrega sozinha</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Escreva o que você viu na simulação, e por que a informação essencial não pode depender só da cor.
      </p>
      <div className="card p-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="cor-sozinha">A explicação</label>
        <textarea id="cor-sozinha" className="input-field text-sm w-full" rows={5} value={cad.corSozinha}
          onChange={e => mudarCaderno(c => ({ ...c, corSozinha: e.target.value }))} />
        <Contador texto={cad.corSozinha} minimo={PALAVRAS_DA_COR_SOZINHA} />
      </div>
    </div>
  );
}
