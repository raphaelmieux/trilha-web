/**
 * O roteiro da fala, lido da apresentação.
 *
 * O requisito 6 pede apresentar oralmente em cinco minutos, e isso acontece
 * fora do aplicativo: a plataforma não confere nada da fala. O que ela faz é
 * **preparar** — lê a estrutura e escreve, em português, o que cada slide faz,
 * para a pessoa treinar com a **própria** apresentação na frente. É o que
 * `roteiroDePython.ts` e `roteiroDaEstrutura.ts` fazem dos lados deles, pelo
 * motivo escrito nos dois: escrever copiando é possível, explicar copiando não
 * é.
 *
 * ── Primeira pessoa, porque é para falar ─────────────────────────────────
 * "Este slide traz a data" se lê; "eu digo a data" se fala. A distinção é a
 * mesma do roteiro de Python, e é ela que faz o roteiro servir de ensaio em
 * vez de servir de descrição.
 *
 * ── E ele descreve, sem julgar ───────────────────────────────────────────
 * Ele não diz que um slide tem texto demais, nem que o outro está bom. Quem
 * julga é a lista de tarefas, que é da plataforma; o roteiro é a leitura do
 * que está ali. É a trava do roteiro de Python e da régua de status do Word,
 * e um roteiro que opinasse poria na nossa tela a resposta que o módulo 10
 * existe para a pessoa descobrir no ensaio.
 */

import { palavrasDoSlide, type Apresentacao, type Slide } from './apresentacao';

export interface FalaDoSlide {
  /** O slide de que ela fala. */
  slide: string;
  /** Em que posição ele está, para a pessoa se achar na sequência. */
  numero: number;
  /** A frase, em primeira pessoa. */
  frase: string;
  /** Quanto tempo esta parte leva, em segundos, no ritmo de quem explica. */
  segundos: number;
}

/** Quantas palavras por minuto quem explica para uma sala fala. */
export const PALAVRAS_POR_MINUTO = 130;

const quantas = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/**
 * O papel de um slide na sequência, que é o que decide a frase.
 *
 * Primeiro, último e meio: é a única divisão que a estrutura dá, e é a que
 * importa para quem vai falar — a abertura e o fecho são as duas partes que se
 * ensaiam separadas.
 */
function papelDoSlide(i: number, total: number): 'abertura' | 'fecho' | 'meio' {
  if (i === 0) return 'abertura';
  if (i === total - 1) return 'fecho';
  return 'meio';
}

function fraseDoSlide(s: Slide, papel: ReturnType<typeof papelDoSlide>): string {
  const titulo = s.titulo.trim();
  const partes: string[] = [];

  if (papel === 'abertura') {
    partes.push(titulo
      ? `Abro apresentando o ${titulo.toLowerCase()}`
      : 'Abro me apresentando');
  } else if (papel === 'fecho') {
    partes.push(titulo ? `Fecho com ${titulo.toLowerCase()}` : 'Fecho abrindo para perguntas');
  } else {
    partes.push(titulo ? `Falo de ${titulo.toLowerCase()}` : 'Falo deste slide');
  }

  if (s.topicos.length === 1) {
    partes.push(`e digo uma coisa só: ${s.topicos[0].trim()}`);
  } else if (s.topicos.length > 1) {
    partes.push(`e passo por ${s.topicos.length} pontos, começando por "${s.topicos[0].trim()}"`);
  }

  if (s.imagens.length === 1) partes.push('mostrando a foto ao lado');
  else if (s.imagens.length > 1) partes.push(`mostrando as ${s.imagens.length} fotos`);

  if (s.grafico) partes.push('e aponto o gráfico enquanto falo');

  /*
    E a nota entra como **lembrete**, e não como texto a ler.

    Ela é o que se fala a mais, e um roteiro que a transcrevesse viraria o
    teleprompter que a nota existe para dispensar.
  */
  if (s.notas.trim() !== '') {
    partes.push(`— a nota me lembra de ${primeiraOracao(s.notas)}`);
  }

  return `${partes.join(', ').replace(', —', ' —')}.`;
}

/** A primeira oração da nota, em minúscula, para caber no meio da frase. */
function primeiraOracao(nota: string): string {
  const limpa = nota.trim().replace(/\s+/g, ' ');
  const corte = limpa.search(/[.,;:]/);
  const trecho = corte > 10 ? limpa.slice(0, corte) : limpa;
  return trecho.charAt(0).toLowerCase() + trecho.slice(1);
}

/** O roteiro inteiro, um bloco por slide. */
export function roteiroDaApresentacao(a: Apresentacao): FalaDoSlide[] {
  return a.slides.map((s, i) => {
    const papel = papelDoSlide(i, a.slides.length);
    const palavras = palavrasDoSlide(s) + quantas(s.notas);
    return {
      slide: s.id,
      numero: i + 1,
      frase: fraseDoSlide(s, papel),
      segundos: Math.round((palavras / PALAVRAS_POR_MINUTO) * 60),
    };
  });
}

/** O tempo total que o roteiro soma, escrito como a pessoa leria. */
export function tempoEscrito(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}
