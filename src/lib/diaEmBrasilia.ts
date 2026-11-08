/**
 * O dia civil de Brasília, sozinho num arquivo.
 *
 * Ele mora em `ofensiva.ts`, que é dona da definição de "hoje" na plataforma —
 * e continua sendo reexportado de lá. Saiu para cá porque a planilha precisa
 * do mesmo relógio para o `HOJE()`, e `ofensiva.ts` importa a descrição das
 * atividades, que importa o currículo inteiro: a função de duas linhas
 * levaria junto, para dentro do motor de fórmulas, todas as trilhas e veredas.
 * É a decisão do `limiarDeDominio.ts`, pelo motivo escrito lá.
 */

/*
  O fuso é o de Brasília, e ele é dito pelo nome — não por "-3".

  O Brasil acabou com o horário de verão em 2019, então hoje o deslocamento é
  fixo. "Hoje" é a palavra importante: propostas de trazê-lo de volta aparecem
  de tempos em tempos, e no dia em que uma passar, um `-3` escrito à mão erra
  em silêncio durante quatro meses por ano — a virada do dia cairia às 23h e a
  ofensiva de quem estuda à noite quebraria sem nada na tela dizendo por quê.
  `Intl` lê a base de fusos do próprio navegador, que é atualizada por quem
  cuida disso.
*/
export const FUSO_DE_BRASILIA = 'America/Sao_Paulo';

const FORMATO_DO_DIA = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO_DE_BRASILIA,
  year: 'numeric', month: '2-digit', day: '2-digit',
});

/**
 * O dia civil em Brasília, como 'AAAA-MM-DD'.
 *
 * Era `new Date().toISOString().split('T')[0]`, que é o dia em **UTC**: a
 * virada acontecia às 21h de Brasília. Duas consequências, as duas invisíveis
 * de dentro. Quem estudasse às 20h e de novo às 22h ganhava +1 por dois
 * exercícios da mesma noite; e quem estuda só à noite — que é quando o clube
 * se reúne — vivia um dia à frente do calendário, então a comparação com
 * "ontem" caía sempre no lugar errado.
 *
 * Os pedaços são montados um a um em vez de se pedir uma data pronta a algum
 * `locale`: formato de locale é escolha de quem mantém o navegador, e já
 * mudou; a ordem dos campos aqui é nossa.
 */
export function diaEmBrasilia(instante: Date | string | number = new Date()): string {
  const d = instante instanceof Date ? instante : new Date(instante);
  if (Number.isNaN(d.getTime())) return '';
  const p = Object.fromEntries(
    FORMATO_DO_DIA.formatToParts(d).map(({ type, value }) => [type, value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}
