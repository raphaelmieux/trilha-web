import { diaEmBrasilia } from '../lib/diaEmBrasilia';

/**
 * As datas da planilha, como o Excel as guarda: um número.
 *
 * Data no Excel é a quantidade de dias desde 30/12/1899 — 08/11/2026 é 46334 —
 * e o que a célula mostra é só o formato por cima desse número. É isso que deixa
 * fazer conta com data: o dia seguinte é `+1`, a diferença entre duas é a
 * subtração, ordenar é ordenar números. E é isso que a pessoa precisa ver uma
 * vez para não estranhar o dia em que uma data aparece como 46334 numa coluna
 * de formato Geral: não é defeito, é o que a data é por dentro.
 *
 * Guardar a data como texto daria a planilha que parece certa e não conta
 * nada — a coluna de nascimentos que não ordena, a `SOMA` que pula, a idade que
 * sai `#VALOR!`. É o número guardado como texto da CC-ES003, só que com barras.
 *
 * ── O dia 29/02/1900 que não existiu ─────────────────────────────────────
 * O Excel conta 1 em 01/01/1900 e conta também um 29/02/1900 — herança de um
 * programa antigo que ele imitava. Para datas de março de 1900 em diante isso
 * é o mesmo que contar a partir de 30/12/1899, e é a faixa que um clube usa.
 * Antes de março o erro vem junto, de propósito: é ali que cai o número
 * pequeno escrito numa célula que tem formato de data, e o Excel mostra 5
 * como 05/01/1900. Mostrar 04/01/1900, que é o dia certo, faria a planilha
 * discordar do programa justamente no caso que a pessoa vai encontrar.
 */

const UM_DIA = 86_400_000;
const ORIGEM = Date.UTC(1899, 11, 30);

/** O maior número que o Excel aceita como data: 31/12/9999. */
export const MAIOR_SERIE = 2_958_465;

/** O primeiro número que é contado a partir de 30/12/1899: 01/03/1900. */
const MARCO_DE_1900 = 61;

/** O número de série de um dia do calendário. Mês e dia transbordam, como no `DATA` do Excel. */
export function serieDe(ano: number, mes: number, dia: number): number {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(ano, mes - 1, dia);
  const n = Math.round((d.getTime() - ORIGEM) / UM_DIA);
  return n < MARCO_DE_1900 ? n - 1 : n;
}

/**
 * O dia do calendário de um número de série. A parte depois da vírgula é hora,
 * e não conta aqui. O dia da semana é o do Excel — o número de série mais
 * seis, de sete em sete —, que é o de verdade de março de 1900 em diante.
 */
export function diaDaSerie(serie: number): { ano: number; mes: number; dia: number; semana: number } {
  const n = Math.floor(serie);
  const semana = ((n + 6) % 7 + 7) % 7;
  if (n === MARCO_DE_1900 - 1) return { ano: 1900, mes: 2, dia: 29, semana };
  const d = new Date(ORIGEM + (n < MARCO_DE_1900 ? n + 1 : n) * UM_DIA);
  return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate(), semana };
}

const dois = (n: number) => String(n).padStart(2, '0');

/** A data como o Excel em português a mostra: dd/mm/aaaa. */
export function textoDaData(serie: number): string {
  const { ano, mes, dia } = diaDaSerie(serie);
  return `${dois(dia)}/${dois(mes)}/${ano}`;
}

/** O número de série de hoje, em Brasília — o mesmo relógio da ofensiva. */
export function serieDeHoje(): number {
  const [ano, mes, dia] = diaEmBrasilia().split('-').map(Number);
  return serieDe(ano, mes, dia);
}

/*
  O que se digita e vira data.

  Dia, mês e ano com barra ou hífen, que é como se escreve uma data no Brasil, e
  também o AAAA-MM-DD que sai de sistema e de formulário. Ano de dois dígitos
  segue a regra do Excel — de 00 a 29 é 2000 e poucos, de 30 a 99 é 1900 e
  poucos —, e sem ano vale o ano de hoje, que é o que o Excel faz quando alguém
  escreve 15/07.

  E o dia tem de existir. 31/02/2026 continua **texto**, e é o Excel quem decide
  assim: virar 03/03 calado seria a planilha inventando uma data que ninguém
  escreveu.
*/
const DIA_MES_ANO = /^(\d{1,2})([/-])(\d{1,2})(?:\2(\d{2}|\d{4}))?$/;
const ANO_MES_DIA = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

function existe(ano: number, mes: number, dia: number): boolean {
  if (mes < 1 || mes > 12 || dia < 1 || ano < 1900 || ano > 9999) return false;
  return diaDaSerie(serieDe(ano, mes, dia)).dia === dia;
}

/** O número de série que o texto escreve, ou `null` quando ele não é uma data. */
export function serieDoTexto(texto: string): number | null {
  const t = texto.trim();
  let ano: number;
  let mes: number;
  let dia: number;
  const iso = ANO_MES_DIA.exec(t);
  if (iso) {
    [ano, mes, dia] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  } else {
    const m = DIA_MES_ANO.exec(t);
    if (!m) return null;
    dia = Number(m[1]);
    mes = Number(m[3]);
    if (m[4] === undefined) ano = diaDaSerie(serieDeHoje()).ano;
    else if (m[4].length === 2) ano = Number(m[4]) + (Number(m[4]) < 30 ? 2000 : 1900);
    else ano = Number(m[4]);
  }
  return existe(ano, mes, dia) ? serieDe(ano, mes, dia) : null;
}

/** O texto é uma data que a planilha reconhece? */
export const ehData = (texto: string) => serieDoTexto(texto) !== null;

/**
 * A data como fica escrita depois de confirmada.
 *
 * O Excel completa o que se digitou: 15/7 vira 15/07/2026 na barra de
 * fórmulas, e 1/3/26 vira 01/03/2026. Guardar o que foi digitado deixaria
 * 15/07 mudando de ano sozinho no réveillon, e quem abrisse a planilha no ano
 * seguinte veria outra data na mesma célula.
 */
export function dataCompleta(texto: string): string | null {
  const s = serieDoTexto(texto);
  return s === null ? null : textoDaData(s);
}
