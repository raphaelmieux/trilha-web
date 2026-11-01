import { describe, expect, it } from 'vitest';
import { MODULOS_DA_IMAGEM_DIGITAL } from './imagemDigital';
import { QUESTOES_DA_IMAGEM_DIGITAL } from './questoesDaImagemDigital';
import type { TopicoDeVereda } from './veredas';
import { imagemDo, pixel, redimensionar, tamanhoImpresso, type Imagem } from '../labs/raster';
import { exportar, tamanhoEscrito } from '../labs/formatosDeImagem';
import { LARGURA_DA_FOTO } from '../labs/fotosDoClube';
import { estadoDepois, fotoLimpa } from '../labs/metasDaCcDg003';
import {
  ALTURA_DO_LAGO, CORRECAO_DO_LAGO, INCLINACAO_DO_LAGO, LARGURA_DO_EMBLEMA, LARGURA_DO_LAGO, RECORTE_DO_LAGO,
  TOLERANCIA_DO_PISO, fotoDoLago, lagoAjustado, lagoReto, miniaturaDoEmblema,
} from '../exemplos/fotosDeExemplo';
import { PIXEL_DA_PLACA, PIXEL_DO_CEU } from '../exemplos/roteiros/imagemDigital';

/*
  Os números que a teoria e as questões da CC-DG003 citam, conferidos contra o
  motor que o editor usa.

  É a trava de `exemplosDoDesenhoVetorial.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui ela pesa
  mais que nas outras de Design, porque esta vereda fala de quilobytes e de
  centímetros — números que mudam calados quando alguém mexe no grão da foto
  ou na tabela do JPG, e que quem estuda confere na própria tela.

  Os das telas saem das fotos de `src/exemplos/fotosDeExemplo.ts` e dos pontos
  que o roteiro clica: a cor que a lição escreve é a que o painel Info mostra
  na imagem ao lado dela.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_IMAGEM_DIGITAL.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? ''].join('\n');
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

const original = () => estadoDepois('formatos').pasta.find(a => a.original)!;
const otimizada = () => exportar(redimensionar(imagemDo(fotoLimpa()), 1200, 790), 'jpg', 'x', 75);

/* As fotos das telas: o lago e o emblema de `fotosDeExemplo.ts`, e não as do laboratório. */
const cor = (p: number[]) => `R ${p[0]}   G ${p[1]}   B ${p[2]}`;
const leitura = (img: Imagem, p: { x: number; y: number }) => cor(pixel(img, p.x, p.y));
const ajustado = () => lagoAjustado();
const paraATela = () => { const a = ajustado(); return Math.round((1080 * a.altura) / a.largura); };
const paraOSite = () => {
  const a = ajustado();
  return exportar(redimensionar(a, 1200, Math.round((1200 * a.altura) / a.largura)), 'jpg', 'x', 75);
};
const vezes = () => (LARGURA_DO_EMBLEMA / miniaturaDoEmblema().largura) ** 2;

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* Módulo 1: a foto do lago, em pixels, e o pixel do céu que o conta-gotas lê. */
  { onde: 'o-quadradinho (largura)', texto: () => textoDoTopico('o-quadradinho'), numero: () => `${LARGURA_DO_LAGO} pixels de largura e ${ALTURA_DO_LAGO} de altura` },
  { onde: 'o-quadradinho (total)', texto: () => textoDoTopico('o-quadradinho'), numero: () => `${milhar(LARGURA_DO_LAGO * ALTURA_DO_LAGO)} pixels` },
  { onde: 'o-quadradinho (céu)', texto: () => textoDoTopico('o-quadradinho'), numero: () => leitura(fotoDoLago(), PIXEL_DO_CEU) },
  /* A miniatura ampliada: quantos pixels cada um vira, e quantos são inventados. */
  { onde: 'ampliar-a-foto (miniatura)', texto: () => textoDoTopico('ampliar-a-foto'), numero: () => `**${miniaturaDoEmblema().largura} pixels**` },
  { onde: 'ampliar-a-foto (vezes)', texto: () => textoDoTopico('ampliar-a-foto'), numero: () => `vira **${vezes()}** depois` },
  { onde: 'ampliar-a-foto (inventados)', texto: () => textoDoTopico('ampliar-a-foto'), numero: () => `os outros ${vezes() - 1}` },
  /* Módulo 2: o ângulo e o recorte do lago. */
  { onde: 'o-horizonte', texto: () => textoDoTopico('o-horizonte'), numero: () => `inclinada ${cm(-INCLINACAO_DO_LAGO)} graus` },
  { onde: 'o-recorte (início)', texto: () => textoDoTopico('o-recorte'), numero: () => `**x ${RECORTE_DO_LAGO.x}, y ${RECORTE_DO_LAGO.y}**` },
  { onde: 'o-recorte (tamanho)', texto: () => textoDoTopico('o-recorte'), numero: () => `**${RECORTE_DO_LAGO.l} de largura e ${RECORTE_DO_LAGO.a} de altura**` },
  { onde: 'o-recorte (rodapé)', texto: () => textoDoTopico('o-recorte'), numero: () => `${lagoReto().largura} × ${lagoReto().altura} px` },
  /* Módulo 3: a placa antes e depois da correção, e a correção em si. */
  { onde: 'os-tres-ajustes (antes)', texto: () => textoDoTopico('os-tres-ajustes'), numero: () => leitura(lagoReto(), PIXEL_DA_PLACA) },
  { onde: 'os-tres-ajustes (depois)', texto: () => textoDoTopico('os-tres-ajustes'), numero: () => leitura(ajustado(), PIXEL_DA_PLACA) },
  {
    onde: 'os-tres-ajustes (correção)', texto: () => textoDoTopico('os-tres-ajustes'),
    numero: () => `Exposição **${cm(CORRECAO_DO_LAGO.exposicao)}**, Contraste **${CORRECAO_DO_LAGO.contraste}**, Temperatura **−${-CORRECAO_DO_LAGO.temperatura}**`,
  },
  /* Módulo 6: a tolerância que junta o piso em dois cliques. */
  { onde: 'tirar-o-fundo', texto: () => textoDoTopico('tirar-o-fundo'), numero: () => `tolerância **${TOLERANCIA_DO_PISO}**` },
  /* Módulo 7: centímetros no papel. */
  { onde: 'pontos-por-polegada (72)', texto: () => textoDoTopico('pontos-por-polegada'), numero: () => `**${cm(tamanhoImpresso({ largura: LARGURA_DO_LAGO, altura: 1, ppi: 72 }).l)} cm**` },
  { onde: 'pontos-por-polegada (300)', texto: () => textoDoTopico('pontos-por-polegada'), numero: () => `**${cm(tamanhoImpresso({ largura: LARGURA_DO_LAGO, altura: 1, ppi: 300 }).l)} cm**` },
  { onde: 'DG3-M7-Q2', texto: () => textoDaQuestao('DG3-M7-Q2'), numero: () => `dá ${cm(tamanhoImpresso({ largura: LARGURA_DA_FOTO, altura: 1, ppi: 300 }).l)} cm` },
  { onde: 'tela-e-papel (altura)', texto: () => textoDoTopico('tela-e-papel'), numero: () => `sozinha, ${paraATela()}` },
  { onde: 'tela-e-papel (pixels)', texto: () => textoDoTopico('tela-e-papel'), numero: () => `**${ajustado().largura} × ${ajustado().altura}**` },
  { onde: 'tela-e-papel (cm)', texto: () => textoDoTopico('tela-e-papel'), numero: () => { const t = tamanhoImpresso({ ...ajustado(), ppi: 240 }); return `**${cm(t.l)} × ${cm(t.a)} cm**`; } },
  /* Módulo 8: a mesma foto nos quatro formatos, a qualidade 5 e a do site. */
  ...(['tiff', 'png', 'jpg', 'webp'] as const).map(f => ({
    onde: `com-e-sem-perda (${f})`, texto: () => textoDoTopico(f === 'webp' ? 'cada-formato-o-seu' : 'com-e-sem-perda'),
    numero: () => `**${tamanhoEscrito(exportar(ajustado(), f, 'x').bytes)}**`,
  })),
  { onde: 'com-e-sem-perda (qualidade 5)', texto: () => textoDoTopico('com-e-sem-perda'), numero: () => `**${tamanhoEscrito(exportar(ajustado(), 'jpg', 'x', 5).bytes)}**` },
  { onde: 'cada-formato-o-seu (site)', texto: () => textoDoTopico('cada-formato-o-seu'), numero: () => `**${tamanhoEscrito(paraOSite().bytes)}**` },
  { onde: 'cada-formato-o-seu (antes)', texto: () => textoDoTopico('cada-formato-o-seu'), numero: () => `os ${tamanhoEscrito(exportar(ajustado(), 'jpg', 'x').bytes)} do JPG` },
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
