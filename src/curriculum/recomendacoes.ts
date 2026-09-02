/**
 * Que veredas complementam cada trilha, e quais delas são indispensáveis.
 *
 * ── A diferença entre recomendar e travar ────────────────────────────────
 * Recomendar é barato e quase sempre certo: a vereda existe porque alguém
 * precisava daquilo, e dizer isso na hora certa poupa o desbravador de aprender
 * na marra. Travar é caro, e é a plataforma inventando um pré-requisito que o
 * documento oficial da especialidade não tem — quem avalia no clube não vai
 * cobrar a vereda, porque ela não está na ficha.
 *
 * Então trava só onde a trilha é impraticável sem a vereda: onde o requisito
 * oficial supõe um conhecimento que a trilha não ensina em lugar nenhum e a
 * vereda ensina inteiro.
 *
 * ── Por que a AP035 não trava atrás da vereda de HTML ────────────────────
 * Ela seria a candidata óbvia, e é justamente o contra-exemplo. A CC-FE001 saiu
 * da AP035 — e a AP035 continua tendo os requisitos 3.1 a 3.14, um por
 * elemento, com o HTML ensinado ali dentro. Travá-la atrás da vereda exigiria
 * um curso opcional que repete o conteúdo da própria trilha, para começar a
 * trilha. É recomendação forte, e nada além disso.
 *
 * ── E a trava só aponta para vereda aberta ───────────────────────────────
 * Vereda em construção tem zero lições, e "concluída" nunca fica verdadeiro
 * para ela: a trava seria permanente e ninguém entenderia por quê. É a mesma
 * armadilha do "zero de zero é tudo" que já apareceu no percentual das veredas,
 * e `recomendacoes.test.ts` a cobra.
 */

export interface RecomendacaoDeVereda {
  /** O `id` interno da vereda, e não o código da tela — o código pode mudar. */
  vereda: string;
  /** Uma frase: o que ela resolve nesta trilha. Aparece na tela. */
  porque: string;
  /**
   * A trilha não começa sem esta vereda concluída.
   *
   * Só onde o requisito oficial supõe um conhecimento que a trilha não ensina.
   * Sem isto, é recomendação: aparece em destaque e não impede nada.
   */
  essencial?: boolean;
}

export const VEREDAS_RECOMENDADAS: Record<string, RecomendacaoDeVereda[]> = {
  /* ── As que já têm conteúdo ── */

  AP035: [
    {
      vereda: 'html',
      porque: 'Os requisitos 3.1 a 3.14 pedem os elementos do HTML um por um. A vereda '
        + 'percorre todos com laboratório, e quem a faz antes chega aqui só conferindo.',
      /* Não é essencial de propósito: a AP035 ensina esse HTML. Ver o cabeçalho. */
    },
    {
      vereda: 'css',
      porque: 'O requisito 2.4 fala de cores em hexadecimal, e o site do requisito 5 fica '
        + 'legível de verdade quando se sabe dar aparência a ele.',
    },
  ],

  AP041: [
    {
      vereda: 'cc001',
      porque: 'Computação 1 apresenta o computador; a vereda mostra o que se manda ele fazer. '
        + 'Uma explica a máquina, a outra a ideia de programa — e as duas juntas se sustentam.',
    },
  ],

  AP042: [
    {
      vereda: 'cc001',
      porque: 'Depois de aprender a usar os programas dos outros, montar um próprio é o '
        + 'passo que mostra que software é coisa que gente escreve.',
    },
  ],

  /* ── As anunciadas, com a regra já escrita para quando abrirem ── */

  AP049: [
    {
      vereda: 'cc001',
      porque: 'Desenvolvimento de Software supõe que sequência, repetição, condição e '
        + 'variável já sejam vocabulário. A vereda é onde isso se aprende, e a trilha '
        + 'parte daí sem reensinar.',
      essencial: true,
    },
  ],

  AP052: [
    {
      vereda: 'cc001',
      porque: 'Programar uma placa é programar. Sem laço, condição e variável não há por '
        + 'onde começar, e a trilha não os ensina.',
      essencial: true,
    },
  ],

  AP063: [
    {
      vereda: 'html',
      porque: 'Web Designer supõe a página já sabida: a trilha trata de desenhar, e não de '
        + 'marcar o que cada pedaço é.',
      essencial: true,
    },
    {
      vereda: 'css',
      porque: 'É a linguagem com que se desenha uma página. Sem ela, a trilha não tem '
        + 'ferramenta para o que pede.',
      essencial: true,
    },
  ],

  AP064: [
    {
      vereda: 'html',
      porque: 'O avançado parte da página pronta. Marcação é o alicerce dela.',
      essencial: true,
    },
    {
      vereda: 'css',
      porque: 'Layout, tela pequena e aparência são todos CSS, e é aí que o avançado mora.',
      essencial: true,
    },
  ],
};
