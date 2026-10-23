/**
 * O motor da diagramação: a página, a malha, o texto que corre de quadro em
 * quadro, a imagem posta na malha, a página-mestre e o PDF que vai para a
 * gráfica.
 *
 * ── Tudo em milímetros ───────────────────────────────────────────────────
 * O papel se mede em milímetros e a letra em pontos, como em todo programa
 * de diagramação: é a unidade que a gráfica fala. A tela converte na hora de
 * desenhar, e só ela.
 *
 * ── O texto quebra pelo modelo ───────────────────────────────────────────
 * Como em `design.ts`: a quantidade de linhas sai da largura média do
 * caractere de cada família, e não do navegador. Deixar o navegador quebrar
 * daria um texto que cabe na tela e transborda na conta — o aviso de texto
 * excedente acenderia sobre uma página visivelmente cheia, ou o contrário.
 *
 * ── O que a página tem e o que ela herda ─────────────────────────────────
 * O número da página e o cabeçalho corrente moram na **página-mestre**, e a
 * página os herda. Um número digitado na página é texto: ele não muda quando
 * uma página entra no meio, e o boletim sai com dois "3". É a diferença entre
 * campo e número digitado da CC-ES002, do outro lado.
 */

import { FAMILIAS, foraDaGama, type Familia } from './design';

export type Mm = number;

export const PONTO_EM_MM = 25.4 / 72;
export const MM_POR_POLEGADA = 25.4;

/* ── O documento ─────────────────────────────────────────────────────────── */

export interface Margens { topo: Mm; base: Mm; interna: Mm; externa: Mm }

export interface Malha {
  margens: Margens;
  colunas: number;
  /** O vão entre duas colunas. */
  medianiz: Mm;
}

export interface EstiloDeParagrafo {
  id: string;
  nome: string;
  familia: Familia;
  /** Em pontos, como a gráfica fala. */
  corpo: number;
  /** Em pontos: 13 sobre um corpo 10 é a entrelinha "10/13". */
  entrelinha: number;
  peso: 400 | 700;
  /** O espaço antes do parágrafo, em milímetros. */
  espacoAntes: Mm;
}

/** O que o parágrafo é no texto — título, corpo ou legenda. Declarado, e não adivinhado. */
export type Papel = 'titulo' | 'corpo' | 'legenda';

export type FormatacaoDireta = Partial<Pick<EstiloDeParagrafo, 'familia' | 'corpo' | 'entrelinha' | 'peso'>>;

export interface Paragrafo {
  id: string;
  papel: Papel;
  estilo: string;
  texto: string;
  /** O que alguém aplicou à mão por cima do estilo — e que vence o estilo, como no Word. */
  direta?: FormatacaoDireta;
}

/** Um retângulo na página, em milímetros a partir do canto do papel cortado. */
export interface Retangulo { x: Mm; y: Mm; largura: Mm; altura: Mm }

export interface QuadroDeTexto extends Retangulo {
  id: string;
  pagina: number;
  /** A ordem no encadeamento: o texto corre do menor para o maior. */
  ordem: number;
}

export interface Imagem {
  id: string;
  nome: string;
  largura: number;
  altura: number;
  modo: 'rgb' | 'cmyk';
}

export interface QuadroDeImagem extends Retangulo {
  id: string;
  pagina: number;
  imagem: string;
}

/** Um texto solto, fora da história: o nome do boletim na capa, uma chamada. */
export interface TextoSolto extends Retangulo {
  id: string;
  pagina: number;
  texto: string;
  corpo: number;
  peso: 400 | 700;
  cor: string;
}

export interface Mestre {
  numero: boolean;
  /** O título corrente: o que se repete no alto de cada página. */
  cabecalho: string;
}

export interface Pagina {
  id: string;
  /** A capa não leva a mestre: nem número nem cabeçalho. */
  mestre: 'A' | 'nenhuma';
}

export interface Documento {
  nome: string;
  formato: { largura: Mm; altura: Mm };
  malha: Malha;
  /** A sangria do documento, que a diagramação reserva fora do papel. */
  sangria: Mm;
  estilos: EstiloDeParagrafo[];
  historia: Paragrafo[];
  quadros: QuadroDeTexto[];
  imagens: QuadroDeImagem[];
  soltos: TextoSolto[];
  biblioteca: Imagem[];
  paginas: Pagina[];
  mestre: Mestre;
  /** As cores do documento, em RGB — como chegam de quem desenhou na tela. */
  cores: string[];
}

/* ── A malha ─────────────────────────────────────────────────────────────── */

/**
 * As margens de uma página, já com interna e externa no lado certo.
 *
 * A página ímpar é a da direita, e a interna dela fica à esquerda — junto da
 * dobra. Na par é o contrário. Trocar os lados não estoura nada e a revista
 * sai com o texto colado na dobra em metade das páginas.
 */
export function margensDa(d: Documento, pagina: number): { esquerda: Mm; direita: Mm; topo: Mm; base: Mm } {
  const m = d.malha.margens;
  const impar = (pagina + 1) % 2 === 1;
  return impar
    ? { esquerda: m.interna, direita: m.externa, topo: m.topo, base: m.base }
    : { esquerda: m.externa, direita: m.interna, topo: m.topo, base: m.base };
}

/** As colunas de uma página, da esquerda para a direita. */
export function colunasDa(d: Documento, pagina: number): { x: Mm; largura: Mm }[] {
  const m = margensDa(d, pagina);
  const util = d.formato.largura - m.esquerda - m.direita;
  const n = Math.max(1, d.malha.colunas);
  const largura = (util - d.malha.medianiz * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: m.esquerda + i * (largura + d.malha.medianiz), largura }));
}

/** As guias verticais da página: as margens e as bordas de cada coluna. */
export function guiasVerticais(d: Documento, pagina: number): Mm[] {
  return [...new Set(colunasDa(d, pagina).flatMap(c => [c.x, c.x + c.largura]).map(v => Math.round(v * 100) / 100))];
}

/** A tolerância de encaixe numa guia: meio milímetro, que é o que a mão erra arrastando. */
export const ENCAIXE = 0.5;

const pertoDe = (v: Mm, alvos: Mm[]) => alvos.some(a => Math.abs(a - v) <= ENCAIXE);

/** Sangra pela esquerda, pela direita, por cima ou por baixo. */
export function sangraPor(d: Documento, r: Retangulo) {
  return {
    esquerda: r.x <= -d.sangria + 0.01,
    direita: r.x + r.largura >= d.formato.largura + d.sangria - 0.01,
    topo: r.y <= -d.sangria + 0.01,
    base: r.y + r.altura >= d.formato.altura + d.sangria - 0.01,
  };
}

/**
 * O lado que encosta na borda do papel sem passar dela.
 *
 * É o defeito clássico da impressão: a guilhotina nunca corta exatamente na
 * linha, e a imagem que para na borda deixa um fio branco do lado que o corte
 * errou. Quem encosta tem de sangrar.
 */
export function encostaSemSangrar(d: Documento, r: Retangulo): boolean {
  const s = sangraPor(d, r);
  const enc = {
    esquerda: Math.abs(r.x) <= ENCAIXE,
    direita: Math.abs(r.x + r.largura - d.formato.largura) <= ENCAIXE,
    topo: Math.abs(r.y) <= ENCAIXE,
    base: Math.abs(r.y + r.altura - d.formato.altura) <= ENCAIXE,
  };
  return (enc.esquerda && !s.esquerda) || (enc.direita && !s.direita) || (enc.topo && !s.topo) || (enc.base && !s.base);
}

/**
 * A imagem respeita a malha: cada borda horizontal cai numa guia ou sangra.
 *
 * Só as bordas laterais se conferem. A malha desta vereda é de colunas, e é
 * nelas que o olho mede a ordem da página; a altura da imagem segue a foto, e
 * exigir que ela também caísse numa linha de base pediria uma malha de linhas
 * que o requisito 4.1 não manda montar.
 */
export function naMalha(d: Documento, q: QuadroDeImagem): boolean {
  const guias = guiasVerticais(d, q.pagina);
  const s = sangraPor(d, q);
  const esquerda = s.esquerda || pertoDe(q.x, guias);
  const direita = s.direita || pertoDe(q.x + q.largura, guias);
  return esquerda && direita && !encostaSemSangrar(d, q);
}

const cruza = (a: Retangulo, b: Retangulo) =>
  a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;

/** A imagem que cobre um quadro de texto: o texto continua lá, debaixo da foto. */
export const cobreTexto = (d: Documento, q: QuadroDeImagem) =>
  d.quadros.some(t => t.pagina === q.pagina && cruza(t, q));

/* ── Estilos ─────────────────────────────────────────────────────────────── */

export const estiloDe = (d: Documento, id: string) => d.estilos.find(e => e.id === id);

/** O estilo com a formatação direta por cima: é o que se desenha. */
export function efetivo(d: Documento, p: Paragrafo): EstiloDeParagrafo {
  const base = estiloDe(d, p.estilo) ?? d.estilos[0];
  return { ...base, ...(p.direta ?? {}) };
}

export const temFormatacaoDireta = (p: Paragrafo) => !!p.direta && Object.keys(p.direta).length > 0;

/**
 * Cada papel do texto usa um estilo só, e nenhum parágrafo tem formatação
 * direta. É a definição de "estilos consistentes ao longo das páginas": o
 * terceiro título com outro estilo, ou com o corpo mudado à mão, é o que faz
 * a página 3 parecer de outra revista.
 */
export function estilosConsistentes(d: Documento): boolean {
  if (d.historia.some(temFormatacaoDireta)) return false;
  const porPapel = new Map<Papel, Set<string>>();
  for (const p of d.historia) porPapel.set(p.papel, (porPapel.get(p.papel) ?? new Set()).add(p.estilo));
  return [...porPapel.values()].every(s => s.size === 1);
}

/* ── O texto corre ───────────────────────────────────────────────────────── */

const larguraDoCaractere = (e: EstiloDeParagrafo) =>
  e.corpo * PONTO_EM_MM * FAMILIAS[e.familia].largura * (e.peso === 700 ? 1.07 : 1);

/** As linhas em que o parágrafo quebra, num quadro desta largura. */
export function linhasDoParagrafo(d: Documento, p: Paragrafo, largura: Mm): string[] {
  const e = efetivo(d, p);
  const cabem = Math.max(1, Math.floor(largura / larguraDoCaractere(e)));
  const palavras = p.texto.split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = '';
  for (const w of palavras) {
    const tentativa = atual ? `${atual} ${w}` : w;
    if (tentativa.length > cabem && atual) { linhas.push(atual); atual = w; } else atual = tentativa;
  }
  linhas.push(atual);
  return linhas;
}

/** O espaço que o texto deixa em volta de uma imagem que ele contorna. */
export const CONTORNO = 2;

/**
 * As faixas do quadro que uma imagem ocupa, em altura a partir do topo dele.
 *
 * O texto pula a imagem — o contorno "acima e abaixo" que todo programa de
 * diagramação oferece. Sem contorno, a imagem cobriria as linhas e elas
 * continuariam lá embaixo, contadas como postas: o texto sumiria sem nenhum
 * aviso de excedente, que é a forma mais calada de perder um parágrafo.
 */
export function contornosNo(d: Documento, q: QuadroDeTexto): [Mm, Mm][] {
  return d.imagens
    .filter(i => i.pagina === q.pagina && i.x < q.x + q.largura - 1 && q.x < i.x + i.largura - 1)
    .map(i => [i.y - q.y - CONTORNO, i.y + i.altura - q.y + CONTORNO] as [Mm, Mm])
    .filter(([a, b]) => b > 0 && a < q.altura)
    .sort((a, b) => a[0] - b[0]);
}

const depoisDosContornos = (y: Mm, h: Mm, faixas: [Mm, Mm][]) => {
  let yy = y;
  for (const [a, b] of faixas) if (yy < b && yy + h > a) yy = b;
  return yy;
};

export interface LinhaPosta { paragrafo: string; texto: string; y: Mm; altura: Mm; primeira: boolean }
export interface Fluxo { porQuadro: Record<string, LinhaPosta[]>; excesso: number }

/**
 * O texto correndo pelos quadros, na ordem do encadeamento.
 *
 * Linha a linha: um parágrafo pode começar num quadro e terminar no
 * seguinte, que é o que todo programa de diagramação faz. O espaço antes do
 * parágrafo some no topo de um quadro — no alto da coluna ele só empurraria a
 * primeira linha para baixo. O que não cabe em quadro nenhum é **excesso**, e
 * o número de linhas dele é o que o programa avisa.
 */
export function fluxo(d: Documento): Fluxo {
  const quadros = [...d.quadros].sort((a, b) => a.ordem - b.ordem);
  const porQuadro: Record<string, LinhaPosta[]> = Object.fromEntries(quadros.map(q => [q.id, []]));
  let qi = 0;
  let y = 0;
  let excesso = 0;
  for (const p of d.historia) {
    const e = efetivo(d, p);
    const alturaDaLinha = e.entrelinha * PONTO_EM_MM;
    let primeira = true;
    let restantes: string[] | null = null;
    while (true) {
      const q = quadros[qi];
      if (!q) {
        excesso += (restantes ?? linhasDoParagrafo(d, p, quadros[quadros.length - 1]?.largura ?? 60)).length;
        break;
      }
      const linhas: string[] = restantes ?? linhasDoParagrafo(d, p, q.largura);
      const antes = primeira && y > 0 ? e.espacoAntes : 0;
      const bloqueios = contornosNo(d, q);
      let i = 0;
      let yy = y + antes;
      while (i < linhas.length) {
        yy = depoisDosContornos(yy, alturaDaLinha, bloqueios);
        if (yy + alturaDaLinha > q.altura + 0.01) break;
        porQuadro[q.id].push({ paragrafo: p.id, texto: linhas[i], y: yy, altura: alturaDaLinha, primeira: primeira && i === 0 });
        yy += alturaDaLinha;
        i++;
      }
      if (i >= linhas.length) { y = yy; break; }
      restantes = linhas.slice(i);
      if (i > 0) primeira = false;
      qi++;
      y = 0;
    }
  }
  return { porQuadro, excesso };
}

/* ── A página-mestre ─────────────────────────────────────────────────────── */

/** O número que a página mostra — o da posição dela, e só se ela leva a mestre. */
export function numeroDaPagina(d: Documento, pagina: number): string | null {
  return d.mestre.numero && d.paginas[pagina]?.mestre === 'A' ? String(pagina + 1) : null;
}

export function cabecalhoDaPagina(d: Documento, pagina: number): string | null {
  return d.mestre.cabecalho.trim() && d.paginas[pagina]?.mestre === 'A' ? d.mestre.cabecalho.trim() : null;
}

/**
 * Número digitado numa página: um texto solto que é só algarismos. Ele
 * acerta o dia em que foi digitado e erra no dia em que uma página entra no
 * meio — e nada avisa.
 */
export const numerosDigitados = (d: Documento) => d.soltos.filter(s => /^\s*\d{1,3}\s*$/.test(s.texto));

/* ── Imagens ─────────────────────────────────────────────────────────────── */

export const imagemDe = (d: Documento, id: string) => d.biblioteca.find(i => i.id === id);

/**
 * A resolução que a imagem tem no tamanho em que foi posta.
 *
 * Ela não é a da câmera: uma foto de 1800 pixels posta com 15 centímetros tem
 * 305 ppi, e a mesma foto posta com 30 tem 152. É a conta que a CC-DG003
 * ensinou, aplicada à página — e é por ela que a gráfica recusa arquivo.
 */
export function ppiEfetivo(d: Documento, q: QuadroDeImagem): number {
  const img = imagemDe(d, q.imagem);
  if (!img) return 0;
  /* A imagem preenche o quadro sem distorcer: a escala é a maior das duas, e
     o que sobra é cortado pela borda do quadro. */
  const escala = Math.max(q.largura / img.largura, q.altura / img.altura);
  return MM_POR_POLEGADA / escala;
}

export const PPI_DE_IMPRESSAO = 240;

/* ── Cor ─────────────────────────────────────────────────────────────────── */

/** As cores do documento que a tinta não alcança: o que a prova de impressão denuncia. */
export const coresForaDaGama = (d: Documento) => d.cores.filter(foraDaGama);

/* ── O PDF ───────────────────────────────────────────────────────────────── */

export interface OpcoesDoPdf {
  sangria: Mm;
  marcasDeCorte: boolean;
  cor: 'rgb' | 'cmyk';
}

export const OPCOES_PADRAO: OpcoesDoPdf = { sangria: 0, marcasDeCorte: false, cor: 'rgb' };

export interface Pdf {
  nome: string;
  opcoes: OpcoesDoPdf;
  /** O documento de quando foi exportado: o PDF é um retrato, e congela. */
  retrato: string;
}

/** A impressão digital do documento, para saber se o PDF ainda é dele. */
export const retratoDe = (d: Documento) => JSON.stringify([d.malha, d.sangria, d.estilos, d.historia, d.quadros, d.imagens, d.soltos, d.paginas, d.mestre]);

export const exportarPdf = (d: Documento, nome: string, opcoes: OpcoesDoPdf): Pdf => ({ nome, opcoes, retrato: retratoDe(d) });

export const SANGRIA_DA_GRAFICA = 3;

/**
 * O PDF serve para a gráfica: sangria de pelo menos 3 mm, marcas de corte,
 * cor em CMYK — e tirado do documento como ele está agora.
 *
 * A sangria do PDF só existe se o documento tiver algo nela: exportar com 3
 * mm de sangria um boletim em que a foto da capa para na borda do papel sai
 * com 3 mm de branco em volta, que é exatamente o fio branco que a sangria
 * existe para evitar.
 */
export function pdfParaGrafica(d: Documento, pdf: Pdf): { sangria: boolean; marcas: boolean; cmyk: boolean; atual: boolean } {
  return {
    sangria: pdf.opcoes.sangria >= SANGRIA_DA_GRAFICA && d.sangria >= SANGRIA_DA_GRAFICA,
    marcas: pdf.opcoes.marcasDeCorte,
    cmyk: pdf.opcoes.cor === 'cmyk',
    atual: pdf.retrato === retratoDe(d),
  };
}
