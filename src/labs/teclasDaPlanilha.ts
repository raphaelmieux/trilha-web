/**
 * As regras do teclado e do apontar do Excel, puras.
 *
 * Moram fora de `gradeDoExcel.ts` pela razão de `selecao.ts` no Explorador:
 * cada uma erra calado se escrita do jeito óbvio, e uma função pura se testa
 * sem montar grade nenhuma.
 *
 *   · Ctrl+seta para na **borda do bloco de dados**, e não na borda da grade:
 *     de dentro de uma coluna cheia ela vai até a última célula preenchida; de
 *     uma célula vazia, até a próxima preenchida. É assim que se chega ao fim
 *     de uma tabela de sessenta linhas sem rolar;
 *   · apontar só acontece onde a fórmula espera uma referência — logo depois
 *     de `=`, de um operador, de `(` ou de `;`. Depois de um número, clicar
 *     noutra célula é sair da edição, como no Excel;
 *   · F4 gira a referência em quatro passos, e não liga e desliga: `A1`,
 *     `$A$1`, `A$1`, `$A1`. O cifrão da linha sozinho é o que a CC-ES003 cobra
 *     ao arrastar para baixo, e um botão de dois estados nunca o produziria.
 */

import { type Direcao, type Faixa, type Planilha, nomeDaCelula } from './planilha';

const temConteudo = (p: Planilha, l: number, c: number) => (p.celulas[l]?.[c]?.texto ?? '').trim() !== '';

/** Ctrl+seta: a borda do bloco de dados na direção, ou a borda da grade. */
export function saltar(p: Planilha, f: Faixa, direcao: Direcao, estendendo = false): Faixa {
  const dl = direcao === 'cima' ? -1 : direcao === 'baixo' ? 1 : 0;
  const dc = direcao === 'esquerda' ? -1 : direcao === 'direita' ? 1 : 0;
  const linhas = p.celulas.length;
  const colunas = p.celulas[0]?.length ?? 0;
  const dentro = (l: number, c: number) => l >= 0 && c >= 0 && l < linhas && c < colunas;
  let l = estendendo ? f.l2 : f.l1;
  let c = estendendo ? f.c2 : f.c1;
  if (!dentro(l + dl, c + dc)) return estendendo ? { ...f, l2: l, c2: c } : { l1: l, c1: c, l2: l, c2: c };
  if (temConteudo(p, l, c) && temConteudo(p, l + dl, c + dc)) {
    /* Dentro do bloco: anda até a última preenchida. */
    while (dentro(l + dl, c + dc) && temConteudo(p, l + dl, c + dc)) { l += dl; c += dc; }
  } else {
    /* Na borda do bloco, ou no vazio: anda até a próxima preenchida, ou até
       a borda da grade se não houver nenhuma. */
    l += dl; c += dc;
    while (dentro(l + dl, c + dc) && !temConteudo(p, l, c)) { l += dl; c += dc; }
  }
  return estendendo ? { ...f, l2: l, c2: c } : { l1: l, c1: c, l2: l, c2: c };
}

/** Ctrl+End: a última linha e a última coluna que têm alguma coisa. */
export function ultimaUsada(p: Planilha): { l: number; c: number } {
  let l = 0;
  let c = 0;
  p.celulas.forEach((linha, i) => linha.forEach((cel, j) => {
    if (cel.texto.trim() !== '') { l = Math.max(l, i); c = Math.max(c, j); }
  }));
  return { l, c };
}

/** Ctrl+A: o bloco de dados em volta da célula; numa célula isolada, a grade inteira. */
export function regiaoAtual(p: Planilha, l0: number, c0: number): Faixa {
  const linhas = p.celulas.length;
  const colunas = p.celulas[0]?.length ?? 0;
  if (!temConteudo(p, l0, c0)) return { l1: 0, c1: 0, l2: linhas - 1, c2: colunas - 1 };
  let topo = l0, base = l0, esq = c0, dir = c0;
  /* Cresce enquanto houver alguma célula preenchida encostada na borda —
     inclusive na diagonal, que é como o Excel acha a "região atual". */
  let cresceu = true;
  const algoNaLinha = (l: number, de: number, ate: number) => {
    for (let c = de; c <= ate; c++) if (temConteudo(p, l, c)) return true;
    return false;
  };
  const algoNaColuna = (c: number, de: number, ate: number) => {
    for (let l = de; l <= ate; l++) if (temConteudo(p, l, c)) return true;
    return false;
  };
  while (cresceu) {
    cresceu = false;
    const e = Math.max(0, esq - 1), d = Math.min(colunas - 1, dir + 1);
    if (topo > 0 && algoNaLinha(topo - 1, e, d)) { topo--; cresceu = true; }
    if (base < linhas - 1 && algoNaLinha(base + 1, e, d)) { base++; cresceu = true; }
    const t = Math.max(0, topo - 1), b = Math.min(linhas - 1, base + 1);
    if (esq > 0 && algoNaColuna(esq - 1, t, b)) { esq--; cresceu = true; }
    if (dir < colunas - 1 && algoNaColuna(dir + 1, t, b)) { dir++; cresceu = true; }
  }
  if (topo === base && esq === dir) return { l1: 0, c1: 0, l2: linhas - 1, c2: colunas - 1 };
  return { l1: topo, c1: esq, l2: base, c2: dir };
}

/* ── Apontar ─────────────────────────────────────────────────────────────── */

/** Os caracteres depois dos quais a fórmula espera uma referência. */
const ESPERA_REFERENCIA = /[=+\-*/^(;:,<>&]\s*$/;

/** A fórmula, como está, aceita uma referência apontada no fim? */
export const podeApontar = (texto: string) => texto.startsWith('=') && ESPERA_REFERENCIA.test(texto);

/** O nome da célula ou da faixa apontada, com o canto de cima à esquerda primeiro. */
export function nomeApontado(f: Faixa): string {
  const topo = Math.min(f.l1, f.l2), base = Math.max(f.l1, f.l2);
  const esq = Math.min(f.c1, f.c2), dir = Math.max(f.c1, f.c2);
  const a = nomeDaCelula(topo, esq);
  return topo === base && esq === dir ? a : `${a}:${nomeDaCelula(base, dir)}`;
}

/* ── F4 ──────────────────────────────────────────────────────────────────── */

const REFERENCIA = /(\$?)([A-Z]{1,3})(\$?)(\d+)/g;

/**
 * F4: gira os cifrões da referência que está no cursor (ou logo antes dele).
 *
 * Devolve o texto novo e onde o cursor fica — no fim da referência, como no
 * Excel, para um segundo F4 girar a mesma. Sem referência ali, nada muda.
 */
export function alternarAncoragem(texto: string, cursor: number): { texto: string; cursor: number } {
  if (!texto.startsWith('=')) return { texto, cursor };
  for (const m of texto.matchAll(REFERENCIA)) {
    const ini = m.index ?? 0;
    const fim = ini + m[0].length;
    if (cursor < ini || cursor > fim) continue;
    /* Letra ou número colado antes é parte de outro nome: só gira o que
       começa num separador. */
    const antes = texto[ini - 1];
    if (antes && /[A-Za-z0-9_.]/.test(antes)) continue;
    /* Seguida de parêntese é chamada de função, e não referência: LOG10(. */
    if (texto[fim] === '(' || (texto[fim] && /[A-Za-z0-9_]/.test(texto[fim]))) continue;
    const [, dc, col, dl, lin] = m;
    /* A1 → $A$1 → A$1 → $A1 → A1. Um cifrão só é ambíguo, e quem desfaz a
       ambiguidade é de que lado ele está. */
    let novoDc: string, novoDl: string;
    if (!dc && !dl) [novoDc, novoDl] = ['$', '$'];
    else if (dc && dl) [novoDc, novoDl] = ['', '$'];
    else if (dl) [novoDc, novoDl] = ['$', ''];
    else [novoDc, novoDl] = ['', ''];
    const ref = `${novoDc}${col}${novoDl}${lin}`;
    return { texto: texto.slice(0, ini) + ref + texto.slice(fim), cursor: ini + ref.length };
  }
  return { texto, cursor };
}

/* ── As cores das referências ────────────────────────────────────────────── */

/** As cores com que o Excel pinta cada referência de uma fórmula em edição. */
export const CORES_DAS_REFERENCIAS = ['#4472C4', '#C0504D', '#9B57A0', '#4BACC6', '#F79646', '#2E8B57'];

const colunaDoNome = (letras: string) =>
  [...letras].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

/**
 * As faixas que uma fórmula em edição cita, cada uma com a sua cor.
 *
 * As de outra aba ficam de fora — elas não estão na grade à vista, e
 * pintá-las aqui marcaria células que a fórmula não lê. A mesma faixa citada
 * duas vezes leva a mesma cor, como no Excel.
 */
export function referenciasDaFormula(texto: string): { faixa: Faixa; cor: string }[] {
  if (!texto.startsWith('=')) return [];
  const achadas: { faixa: Faixa; cor: string; chave: string }[] = [];
  const re = /(!)?(\$?[A-Z]{1,3}\$?\d+)(?::(\$?[A-Z]{1,3}\$?\d+))?/g;
  for (const m of texto.matchAll(re)) {
    const ini = m.index ?? 0;
    const antes = texto[ini - 1];
    const depois = texto[ini + m[0].length];
    if (m[1] || (antes && /[A-Za-z0-9_.!]/.test(antes)) || depois === '(' || (depois && /[A-Za-z0-9_]/.test(depois))) continue;
    const ponto = (s: string) => {
      const r = /\$?([A-Z]{1,3})\$?(\d+)/.exec(s)!;
      return { l: Number(r[2]) - 1, c: colunaDoNome(r[1]) };
    };
    const a = ponto(m[2]);
    const b = m[3] ? ponto(m[3]) : a;
    const faixa = { l1: a.l, c1: a.c, l2: b.l, c2: b.c };
    const chave = `${a.l},${a.c},${b.l},${b.c}`;
    const repetida = achadas.find(x => x.chave === chave);
    const cor = repetida?.cor ?? CORES_DAS_REFERENCIAS[new Set(achadas.map(x => x.chave)).size % CORES_DAS_REFERENCIAS.length];
    achadas.push({ faixa, cor, chave });
  }
  return achadas.map(({ faixa, cor }) => ({ faixa, cor }));
}
