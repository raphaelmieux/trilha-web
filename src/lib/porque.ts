import type { Question } from '../types';

/**
 * Por que a alternativa escolhida estava errada.
 *
 * Devolve vazio quando a resposta está certa, quando a questão não é de
 * escolha única, ou quando aquela alternativa ainda não tem o motivo escrito —
 * nesses casos a tela cai na explicação geral da questão, que é o que sempre
 * houve.
 */
export function porqueDaEscolha(question: Question, answer: unknown): string {
  if (typeof answer !== 'string') return '';
  const alternativas = question.data.options ?? question.data.scenarios;
  if (!alternativas) return '';

  const escolhida = alternativas.find(o => o.id === answer);
  if (!escolhida || escolhida.correct) return '';
  return escolhida.porque ?? '';
}
