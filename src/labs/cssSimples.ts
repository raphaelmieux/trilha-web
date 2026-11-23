/**
 * As regras de uma folha de estilo, lidas sem navegador.
 *
 * A lição de responsividade da CC-FE007 pergunta à folha o que ela diz para
 * cada largura de tela, e essa pergunta precisa da mesma resposta no
 * Chromium da prévia e no jsdom das travas. O jsdom não avalia `@media`
 * nenhum, e o motor de estilo dele descarta as propriedades que não conhece,
 * `grid-template-columns` entre elas — a trava aprovaria uma folha que o
 * navegador desenha de outro jeito, ou recusaria uma certa. As folhas das
 * lições são simples, e um leitor pequeno as lê inteiras: regras, blocos de
 * `@media` com as regras de dentro, e o resto ignorado.
 */

export interface RegraDeCss {
  /** A condição do `@media` em volta, como escrita; `null` fora de um. */
  midia: string | null;
  seletores: string[];
  propriedades: Record<string, string>;
}

function lerDeclaracoes(texto: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const d of texto.split(';')) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const nome = d.slice(0, i).trim().toLowerCase();
    const valor = d.slice(i + 1).trim().replace(/\s*!important$/i, '');
    if (nome && valor) props[nome] = valor;
  }
  return props;
}

/** O índice da chave que fecha a aberta em `inicio`. */
function fechamento(css: string, inicio: number): number {
  let fundo = 0;
  for (let i = inicio; i < css.length; i++) {
    if (css[i] === '{') fundo++;
    else if (css[i] === '}') { fundo--; if (fundo === 0) return i; }
  }
  return css.length;
}

function lerBloco(css: string, midia: string | null, saida: RegraDeCss[]) {
  let i = 0;
  while (i < css.length) {
    const abre = css.indexOf('{', i);
    const ponto = css.indexOf(';', i);
    if (abre < 0) return;
    const cabeca = css.slice(i, abre).trim();
    /* Um @import ou @charset sem bloco: pula até o ponto e vírgula. */
    if (cabeca.startsWith('@') && ponto >= 0 && ponto < abre && !/^@media/i.test(css.slice(i, ponto).trim())) {
      i = ponto + 1;
      continue;
    }
    const fecha = fechamento(css, abre);
    const miolo = css.slice(abre + 1, fecha);
    if (/^@media\b/i.test(cabeca)) {
      lerBloco(miolo, cabeca.replace(/^@media\s*/i, '').trim(), saida);
    } else if (!cabeca.startsWith('@')) {
      saida.push({ midia, seletores: cabeca.split(',').map(s => s.trim()).filter(Boolean), propriedades: lerDeclaracoes(miolo) });
    }
    i = fecha + 1;
  }
}

export function regrasDoCss(css: string): RegraDeCss[] {
  const saida: RegraDeCss[] = [];
  lerBloco(css.replace(/\/\*[\s\S]*?\*\//g, ''), null, saida);
  return saida;
}

/** A largura em que a condição vale: `(max-width: 700px)` é até 700; `(min-width: 701px)` é de 701 em diante. */
export function faixaDaMidia(midia: string): { min: number; max: number } {
  const max = /max-width\s*:\s*(\d+(?:\.\d+)?)px/i.exec(midia);
  const min = /min-width\s*:\s*(\d+(?:\.\d+)?)px/i.exec(midia);
  return { min: min ? Number(min[1]) : 0, max: max ? Number(max[1]) : Infinity };
}

/** As regras que valem numa tela desta largura, na ordem da folha. */
export const regrasNaLargura = (regras: RegraDeCss[], largura: number) => regras.filter(r => {
  if (r.midia === null) return true;
  if (!/width/i.test(r.midia)) return false;
  const f = faixaDaMidia(r.midia);
  return largura >= f.min && largura <= f.max;
});

/** O valor de uma propriedade para um seletor numa largura: a última regra que o diz vence. */
export function valorNaLargura(regras: RegraDeCss[], largura: number, seletor: string, propriedade: string): string | null {
  let valor: string | null = null;
  for (const r of regrasNaLargura(regras, largura)) {
    if (r.seletores.includes(seletor) && propriedade in r.propriedades) valor = r.propriedades[propriedade];
  }
  return valor;
}

/** Quantas colunas um `grid-template-columns` faz: `repeat(3, 1fr)` são 3, `1fr 2fr` são 2, `none` é 1. */
export function colunasDoGrid(valor: string | null): number {
  if (!valor || valor === 'none') return 1;
  const rep = /^repeat\(\s*(\d+)\s*,/i.exec(valor.trim());
  if (rep) return Number(rep[1]);
  if (/auto-fit|auto-fill/i.test(valor)) return 0;
  return valor.trim().split(/\s+(?![^(]*\))/).length;
}
