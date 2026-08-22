/*
 * A cor do progresso — do estado, e nunca da trilha.
 *
 * Este arquivo já nasceu uma vez errado. A primeira versão pintava a trilha pelo
 * grau: fundamental em vermelho, avançada em azul. Resolvia a incoerência de
 * antes — em que a AP041 aparecia vermelha no painel e azul na própria página —
 * mas criava outra, e mais visível: o painel mostrava três barras lado a lado,
 * uma verde, uma azul e uma vermelha, todas dizendo a mesma coisa. Quem olha
 * conclui que a cor significa alguma coisa sobre o andamento, e ela não
 * significava: era só qual especialidade estava embaixo.
 *
 * Agora a cor responde a uma pergunta só: em que ponto este progresso está. A
 * mesma resposta dá a mesma cor em qualquer trilha, em qualquer tela.
 *
 *   em andamento → a cor da marca
 *   concluído    → verde
 *   a recuperar  → âmbar, desenhado pela própria ProgressBar
 *
 * O preenchimento da barra é sempre o mesmo gradiente: quem troca para o verde
 * ao chegar em 100% é a ProgressBar, num lugar só. Aqui fica o que ela não
 * decide — o número do percentual, a borda do card e o disco do módulo.
 */

export interface CoresDoProgresso {
  /** O número do percentual, ao lado da barra. */
  destaque: string;
  /** O preenchimento da barra enquanto não chega ao fim. */
  gradiente: string;
  /** A borda do card quando o ponteiro passa por cima. */
  bordaAoPassar: string;
  /** O disco atrás do número do módulo em andamento. */
  fundoSuave: string;
}

const EM_ANDAMENTO: CoresDoProgresso = {
  destaque: 'var(--color-primary)',
  gradiente: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
  bordaAoPassar: 'var(--color-primary-a50)',
  fundoSuave: 'var(--color-primary-a20)',
};

const CONCLUIDO: CoresDoProgresso = {
  destaque: 'var(--color-success)',
  gradiente: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))',
  bordaAoPassar: 'var(--color-primary-a50)',
  fundoSuave: 'var(--color-success-a20)',
};

/**
 * As cores de um progresso, pelo ponto em que ele está.
 *
 * Recebe o percentual, e não a trilha: é essa assinatura que impede uma tela de
 * voltar a colorir por especialidade sem que alguém perceba.
 */
export function coresDoProgresso(percent: number): CoresDoProgresso {
  return percent >= 100 ? CONCLUIDO : EM_ANDAMENTO;
}

/** A cor do número do percentual — verde ao completar, cor da marca antes. */
export function corDoPercentual(percent: number): string {
  return coresDoProgresso(percent).destaque;
}
