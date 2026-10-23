import { describe, expect, it } from 'vitest';
import { MODULOS_DA_DIAGRAMACAO } from './diagramacaoEImpressao';
import { QUESTOES_DA_DIAGRAMACAO } from './questoesDaDiagramacao';
import type { TopicoDeVereda } from './veredas';
import { foraDaGama } from '../labs/design';
import {
  SANGRIA_DA_GRAFICA, colunasDa, imagemDe, naMalha, ppiEfetivo, sangraPor, type QuadroDeImagem,
} from '../labs/diagramacao';
import { CORES_DO_BOLETIM, ESTILOS, IMAGENS_COMO_CHEGARAM, MALHA_FEITA, boletim } from '../labs/boletimDoClube';
import { CAPA_ACEITA, IMAGENS_NO_LUGAR, MIOLO_ACEITO } from '../labs/metasDaCcDg005';

/*
  Os números que a teoria e as questões da CC-DG005 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDaIdentidadeVisual.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui o que
  pesa são os milímetros — a coluna de 57, a capa que sangra 3 de cada lado —
  e os dois ppi da foto da unidade, que são a lição de resolução inteira.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_DIAGRAMACAO.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_DIAGRAMACAO)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const doc = () => boletim({ malha: MALHA_FEITA, sangria: SANGRIA_DA_GRAFICA });
const quadro = (lista: QuadroDeImagem[], imagem: string) => lista.find(q => q.imagem === imagem)!;
const ppi = (q: QuadroDeImagem) => `${Math.round(ppiEfetivo(doc(), q))} ppi`;
const decimal = (n: number) => n.toLocaleString('pt-BR');
const estilo = (id: string) => ESTILOS.find(e => e.id === id)!;
const corpoEEntrelinha = (id: string) => `${decimal(estilo(id).corpo)}/${decimal(estilo(id).entrelinha)}`;
const larguraDaColuna = () => `${Math.round(colunasDa(doc(), 1)[0].largura)} mm`;
const m = MALHA_FEITA.margens;

const capa = quadro(IMAGENS_NO_LUGAR, 'capa');
const fogueira = quadro(IMAGENS_NO_LUGAR, 'fogueira');
const unidadeGrande = quadro(IMAGENS_COMO_CHEGARAM, 'unidade');
const unidadeNaColuna = quadro(IMAGENS_NO_LUGAR, 'unidade');

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* A malha do boletim. */
  { onde: 'malha (margens)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `${m.topo} em cima, ${m.base} embaixo, ${m.interna} interna, ${m.externa} externa` },
  { onde: 'malha (colunas)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `Colunas:    ${MALHA_FEITA.colunas}` },
  { onde: 'malha (medianiz)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `Medianiz:   ${MALHA_FEITA.medianiz} mm` },
  { onde: 'malha (coluna)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `Cada coluna fica com ${larguraDaColuna()}` },
  { onde: 'DG5-M1-Q2', texto: () => textoDaQuestao('DG5-M1-Q2'), numero: () => `${MALHA_FEITA.medianiz} mm` },
  { onde: 'DG5-M1-Q4', texto: () => textoDaQuestao('DG5-M1-Q4'), numero: () => `${m.interna} mm por dentro e ${m.externa} por fora` },
  /* A capa que sangra. */
  { onde: 'margem-e-sangria (capa)', texto: () => textoDoTopico('margem-e-sangria'), numero: () => `X ${capa.x}, Y ${capa.y}, ${capa.largura} × ${capa.altura} mm` },
  { onde: 'DG5-M1-Q3', texto: () => textoDaQuestao('DG5-M1-Q3'), numero: () => `X ${capa.x} e ${capa.largura} mm` },
  { onde: 'marcas-de-corte (sangria)', texto: () => textoDoTopico('marcas-de-corte'), numero: () => `Sangria:         ${SANGRIA_DA_GRAFICA} mm` },
  /* Os estilos. */
  { onde: 'estilos (título)', texto: () => textoDoTopico('estilos-de-paragrafo'), numero: () => `${estilo('titulo').familia}, negrito, ${corpoEEntrelinha('titulo')}` },
  { onde: 'estilos (corpo)', texto: () => textoDoTopico('estilos-de-paragrafo'), numero: () => `${estilo('corpo').familia}, ${corpoEEntrelinha('corpo')}` },
  { onde: 'estilos (legenda)', texto: () => textoDoTopico('estilos-de-paragrafo'), numero: () => `${estilo('legenda').familia}, ${corpoEEntrelinha('legenda')}` },
  { onde: 'DG5-M2-Q2', texto: () => textoDaQuestao('DG5-M2-Q2'), numero: () => corpoEEntrelinha('corpo') },
  /* A fogueira nas duas colunas. */
  { onde: 'imagem-na-malha', texto: () => textoDoTopico('imagem-na-malha'), numero: () => `X ${fogueira.x} mm, largura ${fogueira.largura} mm` },
  /* Os dois ppi da foto da unidade. */
  { onde: 'resolucao (pixels)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => { const i = imagemDe(doc(), 'unidade')!; return `${i.largura} × ${i.altura} pixels`; } },
  { onde: 'resolucao (grande)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `${unidadeGrande.largura} mm:  ${ppi(unidadeGrande)}` },
  { onde: 'resolucao (coluna)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `${unidadeNaColuna.largura} mm:            ${ppi(unidadeNaColuna)}` },
  { onde: 'resolucao (prosa, grande)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => ppi(unidadeGrande) },
  { onde: 'resolucao (prosa, coluna)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => ppi(unidadeNaColuna) },
  { onde: 'DG5-M3-Q2 (grande)', texto: () => textoDaQuestao('DG5-M3-Q2'), numero: () => ppi(unidadeGrande) },
  { onde: 'DG5-M3-Q2 (coluna)', texto: () => textoDaQuestao('DG5-M3-Q2'), numero: () => ppi(unidadeNaColuna) },
  { onde: 'DG5-M3-Q6 (grande)', texto: () => textoDaQuestao('DG5-M3-Q6'), numero: () => ppi(unidadeGrande) },
  { onde: 'DG5-M3-Q6 (coluna)', texto: () => textoDaQuestao('DG5-M3-Q6'), numero: () => ppi(unidadeNaColuna) },
  /* As cores da prova. */
  ...CORES_DO_BOLETIM.filter(foraDaGama).map(cor => ({
    onde: `DG5-M7-Q2 (${cor})`, texto: () => textoDaQuestao('DG5-M7-Q2'), numero: () => cor,
  })),
];

describe('os números que a CC-DG005 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(20);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a capa da teoria sangra de verdade, e a fogueira cai nas guias', () => {
    const s = sangraPor(doc(), capa);
    expect(Object.values(s).every(Boolean), JSON.stringify(s)).toBe(true);
    expect(naMalha(doc(), fogueira)).toBe(true);
    expect(naMalha(doc(), unidadeNaColuna)).toBe(true);
  });

  it('a foto grande fica abaixo do que a gráfica aceita, e a da coluna acima', () => {
    expect(ppiEfetivo(doc(), unidadeGrande)).toBeLessThan(240);
    expect(ppiEfetivo(doc(), unidadeNaColuna)).toBeGreaterThan(240);
  });

  it('a prova diz "perde o brilho" exatamente nas cores fora da gama', () => {
    const texto = textoDoTopico('prova-de-impressao');
    for (const cor of CORES_DO_BOLETIM) {
      const linha = texto.split('\n').find(l => l.includes(cor));
      expect(linha, `a prova não lista ${cor}`).toBeTruthy();
      expect(linha!.includes('perde o brilho'), `${cor}: ${linha}`).toBe(foraDaGama(cor));
      expect(linha!.includes('igual'), `${cor}: ${linha}`).toBe(!foraDaGama(cor));
    }
  });

  it('a capa e o miolo da teoria estão nas gramaturas que as metas aceitam', () => {
    const texto = textoDoTopico('gramatura');
    const capaG = Number(texto.match(/Capa:\s+\S+ (\d+) g/)![1]);
    const mioloG = Number(texto.match(/Miolo:\s+\S+ (\d+) g/)![1]);
    expect(CAPA_ACEITA).toContain(capaG);
    expect(MIOLO_ACEITO).toContain(mioloG);
    expect(textoDaQuestao('DG5-M6-Q2')).toContain(`${capaG} g/m²`);
  });
});
