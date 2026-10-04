/**
 * De quem a base fala, e de quem ela não fala.
 *
 * É o módulo 1 da CC-ES010, e ele cobre os requisitos 2.1, 2.2 e 4: população e
 * amostra, amostra representativa e enviesada, e três formas pelas quais uma
 * coleta produz amostra enviesada — **ao menos uma delas comum em pesquisas
 * feitas dentro do próprio clube**, que é o que o requisito pede com todas as
 * letras.
 *
 * ── Por que não acontece na planilha ─────────────────────────────────────
 * Não há botão de planilha nenhuma que diga de que população uma tabela é
 * amostra. Isso é decisão, e o que uma planilha ofereceria é digitar a palavra
 * numa célula — que mediria digitação e obrigaria a trava a comparar texto
 * livre. É a decisão do módulo 1 da CC-ES009, pelo motivo escrito lá: a
 * moldura existe para quando há um programa; aqui não há.
 *
 * ── A coleta que interessa é a nossa ─────────────────────────────────────
 * A parte desconfortável do requisito 4 é que a base desta vereda **veio de
 * uma coleta enviesada**. O formulário da CC-ES008 foi divulgado onde o clube
 * divulga as coisas, e quem não estava ali não entrou — então os quarenta e
 * oito não são o clube, são quem respondeu. Uma lição que descrevesse três
 * coletas de mentira e deixasse a nossa de fora ensinaria a enxergar viés em
 * pesquisa alheia, que é a metade fácil.
 */

/* ── As coletas que a lição põe à mesa ────────────────────────────────────── */

/**
 * Como uma coleta estraga a amostra.
 *
 * São os três mecanismos que o requisito 4 pede, e eles têm nome porque
 * "enviesada" sozinho não ensina nada: o que faz alguém reconhecer o viés na
 * pesquisa seguinte é saber **por onde** a amostra torceu.
 */
export type FormaDeEnviesar =
  /** Parte do grupo nunca foi alcançada pela pergunta. */
  | 'nao-alcancou'
  /** Só respondeu quem já estava presente, ou quem se interessou pelo assunto. */
  | 'quem-se-apresentou'
  /** A pergunta foi escrita de um jeito que puxa a resposta. */
  | 'pergunta-que-puxa';

export const NOME_DA_FORMA: Record<FormaDeEnviesar, string> = {
  'nao-alcancou': 'Não alcançou todo mundo',
  'quem-se-apresentou': 'Respondeu quem se apresentou',
  'pergunta-que-puxa': 'A pergunta puxou a resposta',
};

export interface Coleta {
  id: string;
  /** Como ela aconteceu, escrito como o clube contaria. */
  descricao: string;
  /**
   * A forma pela qual ela torceu a amostra, ou `null` quando ela **não**
   * torceu.
   *
   * O `null` não é enfeite, e é a decisão da caixa de correio da CC-ES005: sem
   * uma coleta honesta na lista, "marque todas como enviesadas" é a resposta
   * certa, e o que a lição ensinaria é desconfiar de toda pesquisa — que é
   * inútil, porque ninguém decide nada assim e todo mundo volta a acreditar
   * em tudo na semana seguinte.
   */
  forma: FormaDeEnviesar | null;
  /**
   * Quem ficou de fora, ou entrou demais. É o que a tela mostra depois de a
   * pessoa classificar, e nunca antes: dito antes, a classificação vira
   * leitura.
   */
  quemFicaDeFora: string;
  /** Se ela é a do próprio clube. Exatamente uma é. */
  doClube?: true;
}

/**
 * As quatro coletas, e por que são estas quatro.
 *
 * Três torcidas, uma honesta, e as três torcem por mecanismos **diferentes**:
 * com duas do mesmo tipo, acertar as duas seria acertar uma, e o requisito
 * pede três formas.
 */
export const COLETAS: Coleta[] = [
  {
    id: 'whatsapp',
    descricao:
      'O formulário de inscrição do acampamento foi divulgado no grupo de '
      + 'WhatsApp do clube, e ficou aberto por duas semanas.',
    forma: 'nao-alcancou',
    quemFicaDeFora:
      'Quem não está no grupo: quem trocou de número, quem entrou no clube '
      + 'neste mês e as famílias que não usam o aplicativo. Eles não '
      + 'responderam "não" — eles nunca foram perguntados.',
    doClube: true,
  },
  {
    id: 'sabado',
    descricao:
      'Para saber o que o clube achou do último acampamento, a diretoria '
      + 'perguntou no sábado de manhã, para quem estava no salão.',
    forma: 'quem-se-apresentou',
    quemFicaDeFora:
      'Quem faltou naquele sábado — e quem falta tem motivo, às vezes o '
      + 'mesmo motivo que faria a resposta ser diferente.',
  },
  {
    id: 'pergunta',
    descricao:
      'A pergunta do formulário era: "Você concorda que o acampamento de '
      + 'inverno foi o melhor dos últimos anos?"',
    forma: 'pergunta-que-puxa',
    quemFicaDeFora:
      'Ninguém fica de fora, e é por isso que esta é diferente: a amostra '
      + 'está inteira e as respostas estão torcidas. Quem tinha dúvida '
      + 'concorda, porque a pergunta já disse qual é a resposta esperada.',
  },
  {
    id: 'lista',
    descricao:
      'A secretaria leu a lista de todos os membros do clube, ligou para '
      + 'cada família e registrou a resposta de todas elas.',
    /*
      A honesta. Ela não é "a melhor pesquisa possível" — é a que não torce a
      amostra, que é outra coisa: o esforço dela é enorme e um clube real quase
      nunca faz. Pôr aqui uma coleta perfeita e barata ensinaria que basta
      querer.
    */
    forma: null,
    quemFicaDeFora:
      'Ninguém. Falou-se com o clube inteiro, então isto não é amostra: é a '
      + 'população. É também o trabalho que quase ninguém tem tempo de fazer, '
      + 'e é por isso que amostra existe.',
  },
];

export const coletaDe = (id: string) => COLETAS.find(c => c.id === id);

/** As que torceram a amostra. */
export const coletasEnviesadas = () => COLETAS.filter(c => c.forma !== null);

/* ── De que população a base é amostra ────────────────────────────────────── */

export interface Populacao {
  id: string;
  rotulo: string;
  /** Por que ela é, ou não é, a população desta base. */
  porque: string;
  certa?: true;
}

/**
 * As três candidatas, e a distinção é o requisito 2.1 inteiro.
 *
 * A errada de baixo é a que mais engana: os quarenta e oito **são** a base, e
 * chamá-los de população é o erro que faz alguém concluir coisas sobre o clube
 * a partir de quem respondeu. A de cima é o outro lado — a base não fala do
 * Brasil, e nada nela autoriza isso.
 */
export const POPULACOES: Populacao[] = [
  {
    id: 'clube',
    rotulo: 'Os desbravadores do clube',
    porque:
      'É deles que a base tenta falar, e é com eles que a conclusão vai ser '
      + 'usada. Os quarenta e oito que responderam são a amostra; o clube é a '
      + 'população.',
    certa: true,
  },
  {
    id: 'inscritos',
    rotulo: 'Os quarenta e oito que se inscreveram',
    porque:
      'Esses são a **amostra**. Chamá-los de população é o erro que faz '
      + 'alguém dizer "no clube, a média é de dois acampamentos" quando o que '
      + 'se mediu foi quem respondeu ao formulário.',
  },
  {
    id: 'brasil',
    rotulo: 'Todos os desbravadores do Brasil',
    porque:
      'A base não tem como falar deles: ela saiu de um clube só, e um clube '
      + 'não foi sorteado entre os do país. Nada na tabela autoriza essa '
      + 'conclusão.',
  },
];

export const populacaoCerta = () => POPULACOES.find(p => p.certa)!.id;
