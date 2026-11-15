/*
  Os eventos que as simulações gravam só para as curiosidades.

  Moram num arquivo sem importação nenhuma de propósito: quem grava é o
  laboratório, e `curiosidades.ts` — que lê os eventos — importa o currículo
  inteiro, que importa os laboratórios. Importar as regras para saber o nome
  do evento fecharia o laço de ESM que devolve `undefined` calado.

  Nenhum deles é módulo vencido nem passo de lição: não fazem a ofensiva
  andar, não rendem XP e não aparecem no mural de Atividade Recente — "Menu
  de contexto aberto" dez vezes seguidas empurraria para fora o que a pessoa
  de fato fez.
*/
export const EVENTOS_DAS_CURIOSIDADES = {
  referencia: 'referencia_consultada',
  atalho: 'atalho_usado',
  menu: 'menu_de_contexto_aberto',
  tokenBaixado: 'token_baixado',
  tokenImpresso: 'token_impresso',
  relatorio: 'relatorio_gerado',
  verificacao: 'token_verificado',
  segredo: 'segredo_achado',
} as const;

export type CuriosidadeGravada = keyof typeof EVENTOS_DAS_CURIOSIDADES;

/** Os nomes gravados, para quem precisa deixá-los de fora de uma consulta. */
export const NOMES_DOS_EVENTOS_DAS_CURIOSIDADES: readonly string[] = Object.values(EVENTOS_DAS_CURIOSIDADES);
