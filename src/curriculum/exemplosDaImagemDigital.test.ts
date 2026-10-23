import { describe, expect, it } from 'vitest';
import { MODULOS_DA_IMAGEM_DIGITAL } from './imagemDigital';
import { QUESTOES_DA_IMAGEM_DIGITAL } from './questoesDaImagemDigital';
import type { TopicoDeVereda } from './veredas';
import { caixaNaImagem, imagemDo, pixel, redimensionar, tamanhoImpresso, type Imagem } from '../labs/raster';
import { exportar, tamanhoEscrito } from '../labs/formatosDeImagem';
import {
  ALTURA_DA_FOTO, INCLINACAO_DA_CAMERA, LARGURA_DA_FOTO, PLACA, fotoDoLenco,
} from '../labs/fotosDoClube';
import {
  LICOES_DA_CC_DG003, RECORTE_DE_REFERENCIA, estadoDepois, fotoCrua, fotoLimpa,
} from '../labs/metasDaCcDg003';

/*
  Os números que a teoria e as questões da CC-DG003 citam, conferidos contra o
  motor que o editor usa.

  É a trava de `exemplosDoDesenhoVetorial.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui ela pesa
  mais que nas outras de Design, porque esta vereda fala de quilobytes e de
  centímetros — números que mudam calados quando alguém mexe no grão da foto
  ou na tabela do JPG, e que quem estuda confere na própria tela.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_IMAGEM_DIGITAL.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_IMAGEM_DIGITAL)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const cm = (x: number) => x.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const milhar = (x: number) => x.toLocaleString('pt-BR');

/* A média de cor no miolo da placa, que é como o conta-gotas de uma área a leria. */
function corDaPlaca(img: Imagem): number[] {
  const b = caixaNaImagem(img, PLACA);
  let r = 0, g = 0, a = 0, n = 0;
  for (let y = Math.round(b.y + b.a * 0.25); y < b.y + b.a * 0.75; y++) {
    for (let x = Math.round(b.x + b.l * 0.25); x < b.x + b.l * 0.75; x++) {
      const p = pixel(img, x, y);
      r += p[0]; g += p[1]; a += p[2]; n++;
    }
  }
  return [r / n, g / n, a / n].map(Math.round);
}

const crua = () => imagemDo(fotoCrua());
const original = () => estadoDepois('formatos').pasta.find(a => a.original)!;
const otimizada = () => exportar(redimensionar(imagemDo(fotoLimpa()), 1200, 790), 'jpg', 'x', 75);
const editada = () => imagemDo(fotoLimpa());

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* Módulo 1: a foto do celular, em pixels, e um pixel do céu. */
  { onde: 'o-quadradinho (largura)', texto: () => textoDoTopico('o-quadradinho'), numero: () => `${LARGURA_DA_FOTO} pixels de largura e ${ALTURA_DA_FOTO} de altura` },
  { onde: 'o-quadradinho (total)', texto: () => textoDoTopico('o-quadradinho'), numero: () => `${milhar(LARGURA_DA_FOTO * ALTURA_DA_FOTO)} pixels` },
  { onde: 'o-quadradinho (céu)', texto: () => textoDoTopico('o-quadradinho'), numero: () => { const p = pixel(crua(), 300, 100); return `R ${p[0]}   G ${p[1]}   B ${p[2]}`; } },
  /* Módulo 2: o ângulo e o recorte de referência. */
  { onde: 'o-horizonte', texto: () => textoDoTopico('o-horizonte'), numero: () => `inclinada ${cm(INCLINACAO_DA_CAMERA)} graus` },
  { onde: 'o-recorte', texto: () => textoDoTopico('o-recorte'), numero: () => { const r = RECORTE_DE_REFERENCIA; return `x ${r.x}, y ${r.y}, largura ${r.l}, altura ${r.a}`; } },
  /* Módulo 3: a placa antes e depois do ajuste de referência. */
  { onde: 'os-tres-ajustes (antes)', texto: () => textoDoTopico('os-tres-ajustes'), numero: () => { const c = corDaPlaca(imagemDo(LICOES_DA_CC_DG003.ajustes.contexto().documento!)); return `R ${c[0]}   G ${c[1]}   B ${c[2]}`; } },
  { onde: 'os-tres-ajustes (depois)', texto: () => textoDoTopico('os-tres-ajustes'), numero: () => { const c = corDaPlaca(imagemDo(estadoDepois('ajustes').documento!)); return `R ${c[0]}   G ${c[1]}   B ${c[2]}`; } },
  /* Módulo 6: o lenço recortado, em PNG e em JPG. */
  { onde: 'tirar-o-fundo (PNG)', texto: () => textoDoTopico('tirar-o-fundo'), numero: () => tamanhoEscrito(exportar(fotoDoLenco(), 'png', 'x').bytes) },
  { onde: 'tirar-o-fundo (JPG)', texto: () => textoDoTopico('tirar-o-fundo'), numero: () => tamanhoEscrito(exportar(fotoDoLenco(), 'jpg', 'x').bytes) },
  /* Módulo 7: centímetros no papel. */
  { onde: 'pontos-por-polegada (72)', texto: () => textoDoTopico('pontos-por-polegada'), numero: () => `${cm(tamanhoImpresso({ largura: LARGURA_DA_FOTO, altura: 1, ppi: 72 }).l)} cm` },
  { onde: 'pontos-por-polegada (300)', texto: () => textoDoTopico('pontos-por-polegada'), numero: () => `${cm(tamanhoImpresso({ largura: LARGURA_DA_FOTO, altura: 1, ppi: 300 }).l)} cm` },
  { onde: 'DG3-M7-Q2', texto: () => textoDaQuestao('DG3-M7-Q2'), numero: () => `dá ${cm(tamanhoImpresso({ largura: LARGURA_DA_FOTO, altura: 1, ppi: 300 }).l)} cm` },
  { onde: 'tela-e-papel (pixels)', texto: () => textoDoTopico('tela-e-papel'), numero: () => `${editada().largura} × ${editada().altura}` },
  { onde: 'tela-e-papel (cm)', texto: () => textoDoTopico('tela-e-papel'), numero: () => { const t = tamanhoImpresso({ ...editada(), ppi: 240 }); return `${cm(t.l)} × ${cm(t.a)} cm`; } },
  /* Módulo 8: a mesma foto nos quatro formatos, e a otimizada. */
  ...(['tiff', 'png', 'jpg', 'webp'] as const).map(f => ({
    onde: `com-e-sem-perda (${f})`, texto: () => textoDoTopico('com-e-sem-perda'), numero: () => tamanhoEscrito(exportar(crua(), f, 'x').bytes),
  })),
  { onde: 'cada-formato-o-seu (original)', texto: () => textoDoTopico('cada-formato-o-seu'), numero: () => tamanhoEscrito(original().bytes) },
  { onde: 'cada-formato-o-seu (otimizada)', texto: () => textoDoTopico('cada-formato-o-seu'), numero: () => tamanhoEscrito(otimizada().bytes) },
];

describe('os números que a CC-DG003 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(15);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a otimizada da lição passa mesmo dos sessenta por cento', () => {
    expect(otimizada().bytes / original().bytes).toBeLessThan(0.4);
  });
});
