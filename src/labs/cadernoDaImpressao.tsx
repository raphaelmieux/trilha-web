import {
  EXIGENCIAS, GRAMATURAS, PALAVRAS_DA_DESCRICAO, PALAVRAS_DO_PORQUE, PALAVRAS_DO_RELATO,
  type CadernoDaImpressao, type ContextoDaDiagramacao, type LicaoDaCcDg005,
} from './metasDaCcDg005';

/**
 * O caderno da CC-DG005: o que o programa de diagramação não tem onde
 * guardar.
 *
 * Três lições escrevem nele. A do PDF explica por que RGB e baixa resolução
 * não servem. A da gráfica é a lição inteira: a tabela de serviços de uma
 * gráfica, para ler o que ela exige do arquivo e escolher o papel — o
 * requisito 5 manda consultar uma de verdade, e esta é para aprender a ler
 * antes. A da prova compara as cores da tela com as que vão sair no papel.
 */

export interface PropsDoCadernoDaImpressao {
  ctx: ContextoDaDiagramacao;
  mudar: (f: (c: ContextoDaDiagramacao) => ContextoDaDiagramacao) => void;
  licao: LicaoDaCcDg005;
}

const contar = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function Escrita({ id, titulo, ajuda, valor, minimo, mudar }: {
  id: string; titulo: string; ajuda: string; valor: string; minimo: number; mudar: (v: string) => void;
}) {
  const n = contar(valor);
  return (
    <div className="card p-4">
      <label className="block text-sm font-semibold mb-1" htmlFor={id}>{titulo}</label>
      <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</p>
      <textarea id={id} className="input-field text-sm w-full" rows={5} value={valor} onChange={e => mudar(e.target.value)} />
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {n === 1 ? 'palavra' : 'palavras'} · mínimo {minimo}</span>
    </div>
  );
}

/** A tabela de serviços da gráfica, como ela aparece no site dela. */
function TabelaDaGrafica() {
  return (
    <div className="card p-4 text-sm space-y-2">
      <h3 className="font-semibold">Gráfica Cerrado — tabela de serviços</h3>
      <p><strong>Boletim A5 grampeado</strong>, capa 4 cores e miolo 4 cores, a partir de 50 exemplares.</p>
      <p><strong>Papéis:</strong> capa em couché 250 g/m² ou 300 g/m²; miolo em offset 75 ou 90 g/m², ou couché 120 g/m².</p>
      <p><strong>Como enviar o arquivo:</strong> um PDF único, com as cores em CMYK, 3 mm de sangria em volta de cada página e marcas de corte. As imagens precisam ter 300 ppi no tamanho em que vão ser impressas, e as fontes devem estar incorporadas ao PDF ou convertidas em curvas.</p>
      <p style={{ color: 'var(--color-text-muted)' }}>Não abrimos arquivos de editor de texto. Arquivos em RGB são convertidos aqui, e as cores podem mudar.</p>
    </div>
  );
}

export function CadernoDaImpressao({ ctx, mudar, licao }: PropsDoCadernoDaImpressao) {
  const cad = ctx.caderno;
  const mudarCaderno = (f: (c: CadernoDaImpressao) => CadernoDaImpressao) => mudar(c => ({ ...c, caderno: f(c.caderno) }));

  if (licao === 'exportar') {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">Tela não é papel</h2>
        <Escrita id="porque-rgb" titulo="Por que um arquivo em RGB e com baixa resolução não serve para impressão" minimo={PALAVRAS_DO_PORQUE}
          ajuda="Fale de onde vem a cor da tela e a do papel, e do que acontece com uma foto de site impressa grande."
          valor={cad.porQueRgb} mudar={v => mudarCaderno(c => ({ ...c, porQueRgb: v }))} />
      </div>
    );
  }

  if (licao === 'grafica') {
    const marcar = (id: string, sim: boolean) =>
      mudarCaderno(c => ({ ...c, exigencias: sim ? [...new Set([...c.exigencias, id])] : c.exigencias.filter(x => x !== id) }));
    const gramatura = (campo: 'gramaturaCapa' | 'gramaturaMiolo', v: string) =>
      mudarCaderno(c => ({ ...c, [campo]: v === '' ? null : Number(v) }));
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold">O que a gráfica pede</h2>
        <TabelaDaGrafica />
        <fieldset className="card p-4">
          <legend className="text-sm font-semibold px-1">O que ela exige do arquivo</legend>
          <div className="flex flex-col gap-2 mt-1">
            {EXIGENCIAS.map(e => (
              <label key={e.id} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cad.exigencias.includes(e.id)} onChange={ev => marcar(e.id, ev.target.checked)} />
                {e.texto}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="card p-4 grid gap-3 sm:grid-cols-2">
          {(['gramaturaCapa', 'gramaturaMiolo'] as const).map(campo => (
            <label key={campo} className="text-sm font-semibold flex flex-col gap-1">
              {campo === 'gramaturaCapa' ? 'Papel da capa' : 'Papel do miolo'}
              <select className="input-field text-sm" aria-label={campo === 'gramaturaCapa' ? 'Papel da capa' : 'Papel do miolo'}
                value={cad[campo] ?? ''} onChange={e => gramatura(campo, e.target.value)}>
                <option value="">Escolha…</option>
                {GRAMATURAS.map(g => <option key={g} value={g}>{g} g/m²</option>)}
              </select>
            </label>
          ))}
        </div>
        <Escrita id="descricao" titulo="As exigências, por escrito" minimo={PALAVRAS_DA_DESCRICAO}
          ajuda="Como se fosse para quem vai preparar o próximo boletim: o que a gráfica pede, e por quê."
          valor={cad.descricao} mudar={v => mudarCaderno(c => ({ ...c, descricao: v }))} />
      </div>
    );
  }

  /* A prova de cores. */
  const alternar = (cor: string, sim: boolean) =>
    mudarCaderno(c => ({ ...c, coresQueMudam: sim ? [...new Set([...c.coresQueMudam, cor])] : c.coresQueMudam.filter(x => x !== cor) }));
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">A tela e o papel</h2>
      <fieldset className="card p-4">
        <legend className="text-sm font-semibold px-1">As cores do boletim que mudam na prova</legend>
        <div className="flex flex-col gap-2 mt-1">
          {ctx.documento.cores.map(cor => (
            <label key={cor} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cad.coresQueMudam.includes(cor)} onChange={e => alternar(cor, e.target.checked)} />
              <span aria-hidden="true" style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: cor }} />
              {cor}
            </label>
          ))}
        </div>
      </fieldset>
      <Escrita id="relato" titulo="O que mudou, e por quê" minimo={PALAVRAS_DO_RELATO}
        ajuda="Quais cores perderam o brilho, e por que a tela mostra cores que a tinta não alcança. Depois de imprimir de verdade, compare de novo."
        valor={cad.relato} mudar={v => mudarCaderno(c => ({ ...c, relato: v }))} />
    </div>
  );
}
