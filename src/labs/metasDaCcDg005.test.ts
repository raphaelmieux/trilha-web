import { describe, expect, it } from 'vitest';
import {
  EXIGENCIAS, IMAGENS_NO_LUGAR, LICOES_DA_CC_DG005, estadoDepois, metasDa,
  type ContextoDaDiagramacao, type LicaoDaCcDg005,
} from './metasDaCcDg005';
import { coresForaDaGama, exportarPdf, type Documento } from './diagramacao';
import { HISTORIA_COMO_CHEGOU, quadrosDaMalha } from './boletimDoClube';

/*
  A trava de motor da CC-DG005: nenhuma meta abre verde, a solução de
  referência fecha todas, e os caminhos errados — os que alguém tomaria com
  pressa — continuam vermelhos.
*/

const LICOES = Object.keys(LICOES_DA_CC_DG005) as LicaoDaCcDg005[];
const feita = (licao: LicaoDaCcDg005, id: string, c: ContextoDaDiagramacao) => {
  const m = metasDa(licao).find(x => x.id === id);
  if (!m) throw new Error(`A meta ${id} sumiu da lição ${licao}.`);
  return m.feita(c);
};
const comDoc = (c: ContextoDaDiagramacao, f: (d: Documento) => Documento): ContextoDaDiagramacao => ({ ...c, documento: f(c.documento) });

describe('as sete lições da CC-DG005', () => {
  it.each(LICOES)('%s abre sem nenhuma meta cumprida', licao => {
    const c = LICOES_DA_CC_DG005[licao].contexto();
    expect(metasDa(licao).filter(m => m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it.each(LICOES)('%s fecha com a solução de referência', licao => {
    const c = estadoDepois(licao);
    expect(metasDa(licao).filter(m => !m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it.each(LICOES)('%s: toda meta tem passo a passo', licao => {
    for (const m of metasDa(licao)) expect(m.passos.length, m.id).toBeGreaterThan(0);
  });
});

describe('a malha', () => {
  const ref = estadoDepois('malha');
  const margens = (m: Partial<Documento['malha']['margens']>) =>
    comDoc(ref, d => ({ ...d, malha: { ...d.malha, margens: { ...d.malha.margens, ...m } } }));

  it('margem interna menor que a externa some na dobra', () => {
    expect(feita('malha', 'margens', margens({ interna: 12, externa: 16 }))).toBe(false);
  });

  it('margem de 8 mm é margem de guilhotina, e não de leitura', () => {
    expect(feita('malha', 'margens', margens({ base: 8 }))).toBe(false);
  });

  it('um milímetro de sangria não chega ao que o corte erra', () => {
    expect(feita('malha', 'sangria', comDoc(ref, d => ({ ...d, sangria: 1 })))).toBe(false);
  });

  it('uma coluna só não é malha de colunas, e medianiz de 1 mm cola as colunas', () => {
    expect(feita('malha', 'colunas', comDoc(ref, d => ({ ...d, malha: { ...d.malha, colunas: 1 } })))).toBe(false);
    expect(feita('malha', 'colunas', comDoc(ref, d => ({ ...d, malha: { ...d.malha, medianiz: 1 } })))).toBe(false);
  });
});

describe('os estilos', () => {
  const ref = estadoDepois('estilos');

  it('um parágrafo só ainda com a letra mudada à mão reprova', () => {
    const c = comDoc(ref, d => ({ ...d, historia: d.historia.map((p, i) => (i === 3 ? { ...p, direta: { corpo: 11 } } : p)) }));
    expect(feita('estilos', 'sem-formatacao-direta', c)).toBe(false);
  });

  it('limpar a formatação sem trocar o estilo do título que estava em Corpo não basta', () => {
    const c = comDoc(ref, d => ({
      ...d, historia: HISTORIA_COMO_CHEGOU.map(p => ({ id: p.id, papel: p.papel, estilo: p.estilo, texto: p.texto })),
    }));
    expect(feita('estilos', 'sem-formatacao-direta', c)).toBe(true);
    expect(feita('estilos', 'um-estilo-por-papel', c)).toBe(false);
  });

  it('pôr tudo no mesmo estilo deixa título e corpo iguais, e isso também reprova', () => {
    const c = comDoc(ref, d => ({ ...d, historia: d.historia.map(p => ({ ...p, estilo: 'corpo' })) }));
    expect(feita('estilos', 'um-estilo-por-papel', c)).toBe(false);
  });
});

describe('as imagens', () => {
  const ref = estadoDepois('imagens');
  const trocar = (id: string, f: Partial<typeof IMAGENS_NO_LUGAR[number]>) =>
    comDoc(ref, d => ({ ...d, imagens: d.imagens.map(i => (i.id === id ? { ...i, ...f } : i)) }));

  it('a capa parada na borda não sangra, nem a que sangra só por dois lados', () => {
    expect(feita('imagens', 'capa-sangra', trocar('img-capa', { x: 0, y: 0, largura: 148, altura: 210 }))).toBe(false);
    expect(feita('imagens', 'capa-sangra', trocar('img-capa', { x: -3, y: -3, largura: 151, altura: 213 }))).toBe(false);
  });

  it('a foto da unidade do tamanho da página sai abaixo de 240 ppi', () => {
    expect(feita('imagens', 'resolucao-de-impressao', trocar('img-unidade', { x: 16, largura: 119, altura: 89 }))).toBe(false);
  });

  it('apagar a foto que dava trabalho não resolve nada', () => {
    const c = comDoc(ref, d => ({ ...d, imagens: d.imagens.filter(i => i.imagem !== 'unidade') }));
    expect(feita('imagens', 'resolucao-de-impressao', c)).toBe(false);
    expect(feita('imagens', 'fotos-na-malha', c)).toBe(false);
    expect(feita('imagens', 'texto-cabe', c)).toBe(false);
  });

  it('a fogueira fora das guias não está na malha', () => {
    expect(feita('imagens', 'fotos-na-malha', trocar('img-fogueira', { x: 22 }))).toBe(false);
  });

  it('sem o sexto quadro, a foto em duas colunas deixa texto sobrando', () => {
    const c = comDoc(ref, d => ({ ...d, quadros: quadrosDaMalha(true) }));
    expect(feita('imagens', 'texto-cabe', c)).toBe(false);
  });
});

describe('as páginas', () => {
  const ref = estadoDepois('paginas');

  it('ligar o número automático e deixar os digitados dá dois números por página', () => {
    const c = comDoc(ref, d => ({ ...d, soltos: [...d.soltos, { id: 'n', pagina: 2, texto: '3', x: 70, y: 200, largura: 8, altura: 5, corpo: 8, peso: 400, cor: '#000000' }] }));
    expect(feita('paginas', 'numeracao-automatica', c)).toBe(false);
  });

  it('apagar os digitados sem ligar o automático deixa o boletim sem número', () => {
    const c = comDoc(ref, d => ({ ...d, mestre: { ...d.mestre, numero: false } }));
    expect(feita('paginas', 'numeracao-automatica', c)).toBe(false);
  });

  it('tirar a mestre de todas as páginas não é tirar só da capa', () => {
    const c = comDoc(ref, d => ({ ...d, paginas: d.paginas.map(p => ({ ...p, mestre: 'nenhuma' as const })) }));
    expect(feita('paginas', 'capa-sem-mestre', c)).toBe(false);
  });
});

describe('o PDF', () => {
  const ref = estadoDepois('exportar');

  it('o PDF em RGB, sem marcas e sem sangria não serve à gráfica', () => {
    const c = { ...ref, pdfs: [exportarPdf(ref.documento, 'b.pdf', { sangria: 0, marcasDeCorte: false, cor: 'rgb' })] };
    for (const id of ['pdf-com-sangria', 'pdf-com-marcas', 'pdf-em-cmyk']) expect(feita('exportar', id, c), id).toBe(false);
  });

  it('o PDF certo, exportado antes de uma mudança, ficou velho', () => {
    const c = comDoc(ref, d => ({ ...d, mestre: { ...d.mestre, cabecalho: 'Boletim de Inverno do Clube' } }));
    expect(feita('exportar', 'pdf-com-sangria', c)).toBe(false);
  });

  it('falar só da cor é meia explicação: a resolução ficou de fora', () => {
    const c = { ...ref, caderno: { ...ref.caderno, porQueRgb: 'A tela faz a cor com luz em RGB e o papel faz com tinta em CMYK, então o verde vivo da tela sai apagado e mais escuro no papel.' } };
    expect(feita('exportar', 'porque-rgb-nao-serve', c)).toBe(false);
  });

  it('marcas de corte num PDF sem sangria não valem', () => {
    const c = { ...ref, pdfs: [exportarPdf(ref.documento, 'b.pdf', { sangria: 0, marcasDeCorte: true, cor: 'cmyk' })] };
    expect(feita('exportar', 'pdf-com-marcas', c)).toBe(false);
  });
});

describe('a gráfica e a prova', () => {
  const grafica = estadoDepois('grafica');

  it('marcar todas as exigências, inclusive as que a gráfica não pede, não é ler a tabela', () => {
    const c = { ...grafica, caderno: { ...grafica.caderno, exigencias: EXIGENCIAS.map(e => e.id) } };
    expect(feita('grafica', 'leu-as-exigencias', c)).toBe(false);
  });

  it('capa no papel do miolo, e miolo no papel da capa, não servem', () => {
    const c = { ...grafica, caderno: { ...grafica.caderno, gramaturaCapa: 90, gramaturaMiolo: 250 } };
    expect(feita('grafica', 'escolheu-o-papel', c)).toBe(false);
    const grosso = { ...grafica, caderno: { ...grafica.caderno, gramaturaCapa: 250, gramaturaMiolo: 250 } };
    expect(feita('grafica', 'escolheu-o-papel', grosso)).toBe(false);
  });

  const prova = estadoDepois('prova');

  it('marcar todas as cores como diferentes não é olhar a prova', () => {
    const c = { ...prova, caderno: { ...prova.caderno, coresQueMudam: prova.documento.cores } };
    expect(feita('prova', 'apontou-as-cores', c)).toBe(false);
  });

  it('o boletim tem cores que mudam e cores que não mudam', () => {
    const fora = coresForaDaGama(prova.documento);
    expect(fora.length).toBeGreaterThan(0);
    expect(fora.length).toBeLessThan(prova.documento.cores.length);
  });
});
