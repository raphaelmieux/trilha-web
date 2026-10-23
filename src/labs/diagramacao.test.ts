import { describe, expect, it } from 'vitest';
import {
  colunasDa, encostaSemSangrar, estilosConsistentes, exportarPdf, fluxo, guiasVerticais, margensDa, naMalha,
  numeroDaPagina, numerosDigitados, pdfParaGrafica, ppiEfetivo,
  type Documento, type QuadroDeImagem,
} from './diagramacao';
import { HISTORIA_ARRUMADA, HISTORIA_COMO_CHEGOU, MALHA_FEITA, boletim, quadrosDaMalha } from './boletimDoClube';

/*
  As premissas do motor de diagramação, medidas no boletim do clube. As metas
  da CC-DG005 dependem de cada uma — a foto que encosta sem sangrar, o texto
  que a foto empurra para fora, o número que muda sozinho — e uma premissa
  que mudasse calada tiraria a razão de existir da lição dela.
*/

const feito = (parcial: Partial<Documento> = {}) =>
  boletim({ malha: MALHA_FEITA, sangria: 3, historia: HISTORIA_ARRUMADA, ...parcial });

describe('a malha', () => {
  it('a margem interna fica do lado da dobra, que troca de lado a cada página', () => {
    const d = feito();
    expect(margensDa(d, 0).esquerda).toBe(MALHA_FEITA.margens.interna);
    expect(margensDa(d, 1).direita).toBe(MALHA_FEITA.margens.interna);
    expect(margensDa(d, 1).esquerda).toBe(MALHA_FEITA.margens.externa);
  });

  it('duas colunas e a medianiz ocupam exatamente a área entre as margens', () => {
    const d = feito();
    const [a, b] = colunasDa(d, 1);
    const m = margensDa(d, 1);
    expect(b.x - (a.x + a.largura)).toBeCloseTo(MALHA_FEITA.medianiz, 5);
    expect(b.x + b.largura).toBeCloseTo(d.formato.largura - m.direita, 5);
    expect(guiasVerticais(d, 1)).toHaveLength(4);
  });
});

describe('as imagens na malha e na sangria', () => {
  const d = feito();
  const q = (x: number, largura: number, extra: Partial<QuadroDeImagem> = {}): QuadroDeImagem =>
    ({ id: 'i', pagina: 1, imagem: 'fogueira', x, y: 30, largura, altura: 40, ...extra });

  it('a foto de uma coluna, nas guias, está na malha; deslocada meio centímetro, não', () => {
    const [col] = colunasDa(d, 1);
    expect(naMalha(d, q(col.x, col.largura))).toBe(true);
    expect(naMalha(d, q(col.x + 5, col.largura))).toBe(false);
  });

  it('a capa que para na borda do papel encosta sem sangrar; a que passa 3 mm, sangra', () => {
    const capa = { id: 'c', pagina: 0, imagem: 'capa', x: 0, y: 0, largura: 148, altura: 210 };
    expect(encostaSemSangrar(d, capa)).toBe(true);
    const sangrada = { ...capa, x: -3, y: -3, largura: 154, altura: 216 };
    expect(encostaSemSangrar(d, sangrada)).toBe(false);
    expect(naMalha(d, sangrada)).toBe(true);
  });

  it('sem sangria no documento, encostar e sangrar são a mesma coisa — por isso a sangria vem antes', () => {
    const sem = { ...d, sangria: 0 };
    expect(encostaSemSangrar(sem, { x: 0, y: 0, largura: 148, altura: 210 })).toBe(false);
  });

  it('a resolução depende do tamanho em que a foto foi posta', () => {
    const pequena = q(16, 57, { imagem: 'unidade', altura: 42.75 });
    const grande = q(13, 119, { imagem: 'unidade', altura: 89 });
    expect(ppiEfetivo(d, pequena)).toBeGreaterThanOrEqual(240);
    expect(ppiEfetivo(d, grande)).toBeLessThan(240);
  });
});

describe('o texto corre', () => {
  it('a foto em duas colunas empurra o texto para fora de cinco quadros, e seis quadros o recebem', () => {
    const fogueira: QuadroDeImagem = { id: 'f', pagina: 1, imagem: 'fogueira', x: 13, y: 23, largura: 119, altura: 79.3 };
    expect(fluxo(feito()).excesso).toBe(0);
    expect(fluxo(feito({ imagens: [fogueira] })).excesso).toBeGreaterThan(5);
    expect(fluxo(feito({ imagens: [fogueira], quadros: quadrosDaMalha(false) })).excesso).toBe(0);
  });

  it('o texto contorna a foto: nenhuma linha posta debaixo dela', () => {
    const fogueira: QuadroDeImagem = { id: 'f', pagina: 1, imagem: 'fogueira', x: 13, y: 23, largura: 119, altura: 79.3 };
    const d = feito({ imagens: [fogueira], quadros: quadrosDaMalha(false) });
    const q = d.quadros.find(x => x.pagina === 1)!;
    for (const l of fluxo(d).porQuadro[q.id]) {
      const topo = q.y + l.y;
      expect(topo + l.altura <= fogueira.y || topo >= fogueira.y + fogueira.altura).toBe(true);
    }
  });

  it('a matéria como chegou tem formatação direta e um título no estilo errado', () => {
    expect(estilosConsistentes({ ...feito(), historia: HISTORIA_COMO_CHEGOU })).toBe(false);
    expect(estilosConsistentes(feito())).toBe(true);
  });
});

describe('a página-mestre', () => {
  it('o número sai da posição da página, e a capa sem mestre não tem número', () => {
    const d = feito({ mestre: { numero: true, cabecalho: 'Boletim de Inverno' }, paginas: [
      { id: 'p1', mestre: 'nenhuma' }, { id: 'p2', mestre: 'A' }, { id: 'p3', mestre: 'A' }, { id: 'p4', mestre: 'A' },
    ] });
    expect([0, 1, 2, 3].map(i => numeroDaPagina(d, i))).toEqual([null, '2', '3', '4']);
  });

  it('os números digitados no pé das páginas são achados', () => {
    expect(numerosDigitados(feito()).map(s => s.texto)).toEqual(['2', '3', '4']);
  });
});

describe('o PDF', () => {
  it('congela: mexer no documento depois de exportar deixa o PDF velho', () => {
    const d = feito();
    const pdf = exportarPdf(d, 'boletim.pdf', { sangria: 3, marcasDeCorte: true, cor: 'cmyk' });
    expect(pdfParaGrafica(d, pdf)).toEqual({ sangria: true, marcas: true, cmyk: true, atual: true });
    const mexido = { ...d, mestre: { ...d.mestre, cabecalho: 'Outro' } };
    expect(pdfParaGrafica(mexido, pdf).atual).toBe(false);
  });

  it('a sangria do PDF não vale se o documento não reservou nenhuma', () => {
    const d = feito({ sangria: 0 });
    expect(pdfParaGrafica(d, exportarPdf(d, 'b.pdf', { sangria: 3, marcasDeCorte: true, cor: 'cmyk' })).sangria).toBe(false);
  });
});
