/**
 * O que todo laboratório recebe da página da lição.
 *
 * Escrito num lugar só porque o título já divergiu uma vez: cada laboratório
 * carregava o próprio nome escrito à mão — "SiteLab — Site com quatro páginas"
 * dentro da lição "Montando um site de quatro páginas" —, e quem estudava via
 * dois nomes para a mesma coisa. Agora o nome desce do currículo, e a
 * divergência não tem por onde voltar.
 */
export interface PropsDeLaboratorio {
  /** Código da trilha, para o caminho de volta e para gravar o progresso. */
  specialtyCode: string;
  /** Qual lição é esta — o laboratório registra a própria conclusão. */
  lessonCode: string;
  /** O nome da lição, como o currículo o escreve. É este que vai na tela. */
  lessonTitle: string;
  requirementCodes: string[];
  userId: string;
}
