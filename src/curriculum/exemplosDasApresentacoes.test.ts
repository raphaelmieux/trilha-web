import { describe, expect, it } from 'vitest';
import { MODULOS_DAS_APRESENTACOES } from './apresentacoes';
import type { TopicoDeVereda } from './veredas';
import {
  compactarImagem, palavrasDoSlide, pesoEmMegabytes, pixelsQueAProjecaoPede, textoDaApresentacao,
  type Apresentacao,
} from '../labs/apresentacao';
import { PARTIDA_DA_LICAO, type LicaoDaCcEs011 } from '../labs/metasDaCcEs011';
import { contrastRatio } from '../lib/imageTools';
import {
  AZUL_DO_CARTAZ, AZUL_LEGIVEL, CUSTOS_DAS_PORTAS_HOJE, CUSTOS_DIGITADOS_DAS_PORTAS, ESTADOS_DAS_PORTAS,
  PORTAS_COM_LAYOUT, PORTAS_COM_MESTRE, PORTAS_CORTADA, PORTAS_LEGIVEL, IMAGENS_DAS_PORTAS,
  LARANJA_DO_CARTAZ, LARANJA_LEGIVEL,
} from '../exemplos/diaDePortasAbertas';

/*
  O que as telas da CC-ES011 afirmam, conferido pelos motores da apresentação.

  É a trava de `exemplosDosDados.test.ts`, pelo motivo escrito lá: a **conta**
  se faz aqui, sobre o Dia de Portas Abertas que as telas fotografam, e a
  **afirmação** se lê da legenda. Mudar o Portas Abertas sem refazer as telas reprova,
  porque a imagem continuaria mostrando a antiga.

  E a última parte reprova se o Portas Abertas passar a dividir um título ou um tópico
  com a apresentação do acampamento, em qualquer dos estados das lições.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DAS_APRESENTACOES.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

const razao = (cor: string, a: Apresentacao) =>
  contrastRatio(cor, a.mestre.corDoFundo).toFixed(2).replace('.', ',');
const mb = (a: Apresentacao) => pesoEmMegabytes(a).toFixed(1).replace('.', ',');
const slide = (a: Apresentacao, id: string) => a.slides.find(s => s.id === id)!;
const comFoto = (a: Apresentacao, arquivo: string): Apresentacao => {
  const f = IMAGENS_DAS_PORTAS.find(i => i.arquivo === arquivo)!;
  return {
    ...a,
    slides: a.slides.map(s => (s.id !== 'f9' ? s : {
      ...s,
      imagens: s.imagens.map(i => ({ ...i, legenda: arquivo, pixelsLargura: f.px, pixelsAltura: f.py })),
    })),
  };
};

describe('as telas da CC-ES011 contam o Portas Abertas que fotografam', () => {
  it('vinte tópicos ensinam um gesto, e a justificativa do corte fica em prosa', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(20);
    expect(topicos().find(t => t.id === 'justificar-por-escrito')?.telas).toBeUndefined();
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('o laranja e o azul do cartaz não se leem, e escurecidos passam', () => {
    expect(razao(LARANJA_DO_CARTAZ, PORTAS_COM_MESTRE)).toBe('2,45');
    expect(razao(AZUL_DO_CARTAZ, PORTAS_COM_MESTRE)).toBe('2,92');
    expect(razao(LARANJA_LEGIVEL, PORTAS_LEGIVEL)).toBe('5,68');
    expect(razao(AZUL_LEGIVEL, PORTAS_LEGIVEL)).toBe('7,05');
    expect(textoDoTopico('o-que-e-contraste')).toMatch(/2,45:1[\s\S]*2,92:1/);
    expect(textoDoTopico('escurecer-nao-e-desistir')).toMatch(/5,68:1[\s\S]*7,05:1/);
  });

  it('o mestre chega com título 40 e corpo 32', () => {
    expect([PORTAS_COM_LAYOUT.mestre.tamanhoDoTitulo, PORTAS_COM_LAYOUT.mestre.tamanhoDoCorpo]).toEqual([40, 32]);
    expect(textoDoTopico('o-que-e-hierarquia-visual')).toContain('Título a 40 e corpo a 32');
  });

  it('as caixas à mão de Data e local e de Como funciona estão a 12% e a 7%', () => {
    const y = (id: string) => slide(PORTAS_COM_MESTRE, id).caixas.find(c => c.papel === 'titulo')!.y;
    expect([y('f3'), y('f4')]).toEqual([12, 7]);
    expect(textoDoTopico('o-defeito-so-existe-na-sequencia')).toMatch(/12%[\s\S]*7%/);
  });

  it('Como funciona conta 40 palavras, e as três etiquetas contam 14', () => {
    expect(palavrasDoSlide(slide(PORTAS_COM_LAYOUT, 'f4'))).toBe(40);
    const enxuto = { ...slide(PORTAS_COM_LAYOUT, 'f4'), topicos: ['Barracas: das 9h ao meio-dia', 'Passaporte na entrada', 'Um carimbo por barraca'] };
    expect(palavrasDoSlide(enxuto)).toBe(14);
    expect(textoDoTopico('topico-nao-e-frase')).toMatch(/40 palavras[\s\S]*14 palavras/);
  });

  it('a foto de 640 a 80% pede 1536; a original pesa 3,5 MB, e a 150 ppi fica com 1600 e 0,6 MB', () => {
    expect(pixelsQueAProjecaoPede(80)).toBe(1536);
    const original = comFoto(PORTAS_LEGIVEL, 'portas-abertas-2025-original.jpg');
    expect(mb(original)).toBe('3,5');
    expect(palavrasDoSlide(slide(original, 'f9'))).toBe(7);
    expect(textoDoTopico('compactar-e-destrutivo')).toContain('7 palavras');
    const compactada = compactarImagem(slide(original, 'f9').imagens[0], 150);
    expect(compactada.pixelsLargura).toBe(1600);
    const depois = { ...original, slides: original.slides.map(s => (s.id === 'f9' ? { ...s, imagens: [compactada] } : s)) };
    expect(mb(depois)).toBe('0,6');
    expect(textoDoTopico('resolucao-e-para-a-projecao')).toContain('1536');
    expect(textoDoTopico('compactar-e-destrutivo')).toMatch(/3,5 MB[\s\S]*1600[\s\S]*0,6 MB/);
  });

  it('o slide dos custos diz 270 e a planilha diz 315', () => {
    const soma = (c: { valor: number }[]) => c.reduce((t, x) => t + x.valor, 0);
    expect(soma(CUSTOS_DIGITADOS_DAS_PORTAS)).toBe(270);
    expect(soma(CUSTOS_DAS_PORTAS_HOJE)).toBe(315);
    expect(textoDoTopico('o-grafico-vem-da-planilha')).toMatch(/270[\s\S]*315/);
  });

  it('cortado, o Portas Abertas tem oito slides; Data e local projeta 15 palavras e As barracas, 27', () => {
    expect(PORTAS_CORTADA.slides).toHaveLength(8);
    expect(palavrasDoSlide(slide(PORTAS_CORTADA, 'f3'))).toBe(15);
    expect(palavrasDoSlide(slide(PORTAS_CORTADA, 'f5'))).toBe(27);
    expect(slide(PORTAS_CORTADA, 'f5').topicos).toHaveLength(6);
    expect(mb(PORTAS_CORTADA)).toBe('1,2');
    const semAFoto = { ...PORTAS_CORTADA, slides: PORTAS_CORTADA.slides.filter(s => s.id !== 'f9') };
    expect(mb(semAFoto)).toBe('0,7');
    expect(textoDoTopico('o-orcamento-de-cinco-minutos')).toContain('15 palavras');
    expect(textoDoTopico('o-pdf-congela')).toMatch(/Slides 7[\s\S]*0,7 MB[\s\S]*criado com 8 slides/);
  });
});

describe('o Portas Abertas não é a apresentação do acampamento', () => {
  const LICOES: LicaoDaCcEs011[] = ['mestre', 'layout', 'hierarquia', 'contraste', 'erros', 'imagens', 'grafico', 'notas', 'corte', 'cinco-minutos'];
  const linhas = (a: Apresentacao) => textoDaApresentacao(a).split('\n').map(x => x.trim()).filter(x => x.length > 3);

  it('nenhum título ou tópico coincide, em estado nenhum', () => {
    const doLab = new Set(LICOES.flatMap(l => linhas(PARTIDA_DA_LICAO[l]().ap)));
    const doEvento = Object.values(ESTADOS_DAS_PORTAS).flatMap(linhas);
    expect(doEvento.length).toBeGreaterThan(40);
    expect([...new Set(doEvento.filter(x => doLab.has(x)))]).toEqual([]);
  });

  it('a teoria não cita a apresentação do acampamento', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = ['Chácara', 'Recanto', 'ouro', 'camisa', 'dezenove horas', '2,42', '3,48', 'Ônibus',
      'saco de dormir', 'Saco de dormir', 'O que levar'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
