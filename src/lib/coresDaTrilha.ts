import type { Specialty } from '../types';

/*
 * A cor de progresso de uma trilha, num lugar só.
 *
 * O sistema sempre teve a mesma intenção — trilha fundamental em vermelho, a
 * avançada em azul —, mas cada tela a escrevia à mão. A página da trilha decidia
 * com `specialty.code === 'AP034'`, e o painel repetia as cores literalmente em
 * cada card. Enquanto existiam duas trilhas, "é a AP034" e "é fundamental"
 * apontavam para a mesma coisa, e o atalho passava despercebido.
 *
 * Com a AP041 aberta as duas leituras se separaram: ela é fundamental, mas não é
 * a AP034 — e por isso aparecia vermelha no painel e azul na própria página,
 * porque cada tela respondia a uma pergunta diferente.
 *
 * `level` é a descrição do grau, e é exatamente o que a cor comunica. Aqui ele
 * volta a ser usado para o que é, e a trilha seguinte entra pintada sozinha.
 */

export interface CoresDaTrilha {
  /** O número do percentual, e o texto que acompanha a barra. */
  destaque: string;
  /** O preenchimento da barra de progresso. */
  gradiente: string;
  /** A borda do card quando o ponteiro passa por cima. */
  bordaAoPassar: string;
  /** O disco atrás do número do módulo em andamento. */
  fundoSuave: string;
}

const FUNDAMENTAL: CoresDaTrilha = {
  destaque: 'var(--color-primary)',
  gradiente: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
  bordaAoPassar: 'var(--color-primary-a50)',
  fundoSuave: 'var(--color-primary-a20)',
};

const AVANCADA: CoresDaTrilha = {
  destaque: 'var(--color-tertiary-light)',
  gradiente: 'linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary-light))',
  bordaAoPassar: 'var(--color-tertiary-a50)',
  fundoSuave: 'var(--color-tertiary-a20)',
};

export function coresDaTrilha(level: Specialty['level']): CoresDaTrilha {
  return level === 'advanced' ? AVANCADA : FUNDAMENTAL;
}

/**
 * A cor do percentual, que vira verde ao completar.
 *
 * Estava repetida em quatro telas, sempre como o mesmo ternário. Concluído é
 * verde em qualquer trilha: é o único estado que não depende do grau.
 */
export function corDoPercentual(level: Specialty['level'], percent: number): string {
  return percent === 100 ? 'var(--color-success)' : coresDaTrilha(level).destaque;
}
