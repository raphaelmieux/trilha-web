import { describe, expect, it } from 'vitest';
import { MODULOS_DA_DIAGRAMACAO } from './diagramacaoEImpressao';
import { QUESTOES_DA_DIAGRAMACAO } from './questoesDaDiagramacao';
import type { TopicoDeVereda } from './veredas';
import { foraDaGama } from '../labs/design';
import {
  SANGRIA_DA_GRAFICA, colunasDa, fluxo, imagemDe, naMalha, ppiEfetivo, sangraPor, type QuadroDeImagem,
} from '../labs/diagramacao';
import { CORES_DO_BOLETIM, ESTILOS, IMAGENS_COMO_CHEGARAM, MALHA_FEITA, boletim } from '../labs/boletimDoClube';
import { CAPA_ACEITA, IMAGENS_NO_LUGAR, MIOLO_ACEITO } from '../labs/metasDaCcDg005';
import {
  CAPA_SANGRANDO, CORES_DO_GUIA, ESTILOS_DO_GUIA, IPE_NAS_DUAS, LOBO_NAS_DUAS, LOBO_NAS_TRES, MALHA_DO_GUIA,
  guia, guiaSemFotos, quadrosDoGuia,
} from '../exemplos/guiaDaCaminhada';

/*
  Os números que a teoria e as questões da CC-DG005 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDaIdentidadeVisual.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição.

  São dois documentos, de propósito. A teoria mostra o guia da caminhada,
  porque o boletim é o que o laboratório monta e os números dele são respostas;
  as questões continuam falando do boletim, e são conferidas contra ele. A
  última trava reprova se os dois passarem a dividir uma malha, um par de ppi
  ou uma cor — aí a teoria voltaria a mostrar o gabarito.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_DIAGRAMACAO.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** O que a lição diz: a prosa e o que as telas dizem em legenda e descrição. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_DIAGRAMACAO)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const decimal = (n: number) => n.toLocaleString('pt-BR');
/** O sinal de menos tipográfico, que é o que a prosa escreve. */
const comSinal = (n: number) => (n < 0 ? `−${-n}` : String(n));

/* ── O boletim, que as questões citam ── */

const doc = () => boletim({ malha: MALHA_FEITA, sangria: SANGRIA_DA_GRAFICA });
const quadro = (lista: QuadroDeImagem[], imagem: string) => lista.find(q => q.imagem === imagem)!;
const ppi = (d: ReturnType<typeof doc>, q: QuadroDeImagem) => `${Math.round(ppiEfetivo(d, q))} ppi`;
const estilo = (id: string) => ESTILOS.find(e => e.id === id)!;
const corpoEEntrelinha = (id: string) => `${decimal(estilo(id).corpo)}/${decimal(estilo(id).entrelinha)}`;
const m = MALHA_FEITA.margens;
const capa = quadro(IMAGENS_NO_LUGAR, 'capa');
const unidadeGrande = quadro(IMAGENS_COMO_CHEGARAM, 'unidade');
const unidadeNaColuna = quadro(IMAGENS_NO_LUGAR, 'unidade');

/* ── O guia, que a teoria mostra ── */

const g = MALHA_DO_GUIA.margens;
const estiloDoGuia = (id: string) => ESTILOS_DO_GUIA.find(e => e.id === id)!;
const doGuia = (id: string) => `${decimal(estiloDoGuia(id).corpo)}/${decimal(estiloDoGuia(id).entrelinha)}`;
const colunaDoGuia = colunasDa(guia(), 1)[0];
const terceiraDaP3 = colunasDa(guia(), 2)[2];
const comIpe = () => guia({ quadros: quadrosDoGuia(true), imagens: [CAPA_SANGRANDO, IPE_NAS_DUAS] });
const lobo = imagemDe(guia(), 'lobo')!;

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* As questões, sobre o boletim. */
  { onde: 'DG5-M1-Q2', texto: () => textoDaQuestao('DG5-M1-Q2'), numero: () => `${MALHA_FEITA.medianiz} mm` },
  { onde: 'DG5-M1-Q4', texto: () => textoDaQuestao('DG5-M1-Q4'), numero: () => `${m.interna} mm por dentro e ${m.externa} por fora` },
  { onde: 'DG5-M1-Q3', texto: () => textoDaQuestao('DG5-M1-Q3'), numero: () => `X ${capa.x} e ${capa.largura} mm` },
  { onde: 'DG5-M2-Q2', texto: () => textoDaQuestao('DG5-M2-Q2'), numero: () => corpoEEntrelinha('corpo') },
  { onde: 'DG5-M3-Q2 (grande)', texto: () => textoDaQuestao('DG5-M3-Q2'), numero: () => ppi(doc(), unidadeGrande) },
  { onde: 'DG5-M3-Q2 (coluna)', texto: () => textoDaQuestao('DG5-M3-Q2'), numero: () => ppi(doc(), unidadeNaColuna) },
  { onde: 'DG5-M3-Q6 (grande)', texto: () => textoDaQuestao('DG5-M3-Q6'), numero: () => ppi(doc(), unidadeGrande) },
  { onde: 'DG5-M3-Q6 (coluna)', texto: () => textoDaQuestao('DG5-M3-Q6'), numero: () => ppi(doc(), unidadeNaColuna) },
  ...CORES_DO_BOLETIM.filter(foraDaGama).map(cor => ({
    onde: `DG5-M7-Q2 (${cor})`, texto: () => textoDaQuestao('DG5-M7-Q2'), numero: () => cor,
  })),

  /* A teoria, sobre o guia. */
  { onde: 'malha (margens)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `${g.topo} mm em cima, ${g.base} embaixo, ${g.interna} de margem interna, ${g.externa} de externa, ${MALHA_DO_GUIA.colunas} colunas e medianiz de ${MALHA_DO_GUIA.medianiz} mm` },
  { onde: 'malha (colunas)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `três colunas de ${decimal(colunaDoGuia.largura)} mm` },
  { onde: 'malha (quadro)', texto: () => textoDoTopico('malha-de-diagramacao'), numero: () => `X ${colunaDoGuia.x} mm e largura ${decimal(colunaDoGuia.largura)} mm` },
  { onde: 'sangria (capa)', texto: () => textoDoTopico('margem-e-sangria'), numero: () => `X ${comSinal(CAPA_SANGRANDO.x)}, Y ${comSinal(CAPA_SANGRANDO.y)}, largura ${CAPA_SANGRANDO.largura} e altura ${CAPA_SANGRANDO.altura} mm` },
  { onde: 'sangria (3 mm)', texto: () => textoDoTopico('margem-e-sangria'), numero: () => `${SANGRIA_DA_GRAFICA} mm fora do papel` },
  { onde: 'estilos (corpo)', texto: () => textoDoTopico('estilos-de-paragrafo'), numero: () => `${estiloDoGuia('corpo').familia} ${doGuia('corpo')}` },
  { onde: 'estilos (título)', texto: () => textoDoTopico('estilos-de-paragrafo'), numero: () => `${estiloDoGuia('titulo').familia} em negrito, ${doGuia('titulo')}` },
  { onde: 'imagem (duas colunas)', texto: () => textoDoTopico('imagem-na-malha'), numero: () => `duas colunas são ${IPE_NAS_DUAS.largura} mm: ${decimal(colunaDoGuia.largura)} de cada uma mais os ${MALHA_DO_GUIA.medianiz} da medianiz` },
  { onde: 'imagem (ipê)', texto: () => textoDoTopico('imagem-na-malha'), numero: () => `X ${IPE_NAS_DUAS.x} e largura ${IPE_NAS_DUAS.largura} mm` },
  { onde: 'imagem (excedente)', texto: () => textoDoTopico('imagem-na-malha'), numero: () => `Texto excedente: ${fluxo(comIpe()).excesso} linhas` },
  { onde: 'imagem (quadro novo)', texto: () => textoDoTopico('imagem-na-malha'), numero: () => `X ${terceiraDaP3.x} mm` },
  { onde: 'resolução (pixels)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `${lobo.largura} × ${lobo.altura} pixels` },
  { onde: 'resolução (três colunas)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `**${ppi(guia(), LOBO_NAS_TRES)}** atravessando as três colunas do guia, com ${LOBO_NAS_TRES.largura} mm` },
  { onde: 'resolução (duas colunas)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `**${ppi(guia(), LOBO_NAS_DUAS)}** em duas colunas, com ${LOBO_NAS_DUAS.largura} mm` },
  { onde: 'resolução (painel)', texto: () => textoDoTopico('resolucao-de-impressao'), numero: () => `ppi efetivo: ${Math.round(ppiEfetivo(guia(), LOBO_NAS_TRES))}` },
  { onde: 'rgb (600 pixels)', texto: () => textoDoTopico('rgb-e-cmyk'), numero: () => `600 pixels de largura enche a tela de um celular e, impressa a 300 ppi, cobre só ${Math.round((600 / 300) * 2.54)} cm` },
  { onde: 'pdf (sangria)', texto: () => textoDoTopico('marcas-de-corte'), numero: () => `sangria de ${SANGRIA_DA_GRAFICA} mm em volta` },
];

/** Os nomes que a prova dá às cores do guia, na ordem da faixa. */
const NOMES_DAS_CORES: Record<string, string> = {
  '#2E7D32': 'verde-escuro', '#6D4C41': 'marrom', '#FFB300': 'âmbar', '#00C853': 'verde vivo', '#263238': 'quase preto',
};

describe('os números que a CC-DG005 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(25);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a capa do guia sangra de verdade, e as fotos caem nas guias', () => {
    const s = sangraPor(guia(), CAPA_SANGRANDO);
    expect(Object.values(s).every(Boolean), JSON.stringify(s)).toBe(true);
    for (const q of [IPE_NAS_DUAS, LOBO_NAS_TRES, LOBO_NAS_DUAS]) expect(naMalha(guia(), q), q.id).toBe(true);
  });

  it('sem fotos o texto do guia cabe; com o ipê sobra, e o quadro da página 3 o recebe', () => {
    expect(fluxo(guiaSemFotos()).excesso).toBe(0);
    expect(fluxo(comIpe()).excesso).toBeGreaterThan(0);
    expect(fluxo(guia({ imagens: [CAPA_SANGRANDO, IPE_NAS_DUAS] })).excesso).toBe(0);
  });

  it('o lobo-guará grande fica abaixo do que a gráfica aceita, e em duas colunas acima', () => {
    expect(ppiEfetivo(guia(), LOBO_NAS_TRES)).toBeLessThan(240);
    expect(ppiEfetivo(guia(), LOBO_NAS_DUAS)).toBeGreaterThan(240);
    expect(LOBO_NAS_DUAS.altura).toBeCloseTo(LOBO_NAS_DUAS.largura * lobo.altura / lobo.largura, 5);
  });

  it('a prova diz que mudam exatamente as cores do guia fora da gama', () => {
    expect(Object.keys(NOMES_DAS_CORES)).toEqual(CORES_DO_GUIA);
    const texto = textoDoTopico('prova-de-impressao');
    const mudam = CORES_DO_GUIA.filter(foraDaGama).map(c => NOMES_DAS_CORES[c]);
    const ficam = CORES_DO_GUIA.filter(c => !foraDaGama(c)).map(c => NOMES_DAS_CORES[c]);
    expect(mudam.length).toBeGreaterThan(0);
    expect(texto).toContain(`o ${mudam.map(n => `**${n}**`).join(' e o ')} mudam`);
    expect(texto).toContain(`o ${ficam.slice(0, -1).join(', o ')} e o ${ficam[ficam.length - 1]} ficam iguais`);
  });

  it('as gramaturas da teoria são as que a lição da gráfica aceita', () => {
    const texto = textoDoTopico('gramatura');
    expect(texto).toContain(`**capa** precisa aguentar a mochila e o manuseio: ${CAPA_ACEITA.join(' ou ')} g/m²`);
    expect(texto).toContain(`${MIOLO_ACEITO[0]}, ${MIOLO_ACEITO[1]} ou um couché de ${MIOLO_ACEITO[2]} g/m²`);
    const capaDaQuestao = Number(textoDaQuestao('DG5-M6-Q2').match(/(\d+) g\/m²/)![1]);
    expect(CAPA_ACEITA).toContain(capaDaQuestao);
  });

  it('a foto do boletim que as questões citam fica abaixo do aceito grande, e acima na coluna', () => {
    expect(ppiEfetivo(doc(), unidadeGrande)).toBeLessThan(240);
    expect(ppiEfetivo(doc(), unidadeNaColuna)).toBeGreaterThan(240);
  });
});

describe('o guia das telas não é o boletim do laboratório', () => {
  it('outra malha, em toda margem, nas colunas e na medianiz', () => {
    for (const k of ['topo', 'base', 'interna', 'externa'] as const) expect(g[k], k).not.toBe(m[k]);
    expect(MALHA_DO_GUIA.colunas).not.toBe(MALHA_FEITA.colunas);
    expect(MALHA_DO_GUIA.medianiz).not.toBe(MALHA_FEITA.medianiz);
    expect(colunaDoGuia.largura).not.toBeCloseTo(colunasDa(doc(), 1)[0].largura, 0);
  });

  it('outros estilos', () => {
    for (const id of ['titulo', 'corpo', 'legenda']) {
      expect(doGuia(id), id).not.toBe(corpoEEntrelinha(id));
    }
  });

  it('outros ppi, outra capa e nenhuma cor em comum', () => {
    const doBoletim = [unidadeGrande, unidadeNaColuna].map(q => Math.round(ppiEfetivo(doc(), q)));
    for (const q of [LOBO_NAS_TRES, LOBO_NAS_DUAS]) expect(doBoletim).not.toContain(Math.round(ppiEfetivo(guia(), q)));
    expect([CAPA_SANGRANDO.largura, CAPA_SANGRANDO.altura]).toEqual([capa.largura, capa.altura]);
    expect(CAPA_SANGRANDO.imagem).not.toBe(capa.imagem);
    expect(CORES_DO_GUIA.filter(c => CORES_DO_BOLETIM.includes(c))).toEqual([]);
  });
});
