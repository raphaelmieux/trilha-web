/**
 * Os três gráficos enganosos **reais** do requisito 7 da CC-ES009.
 *
 * ── Por que eles levaram tanto tempo para existir ───────────────────────
 * O requisito manda analisar três gráficos enganosos **reais** e apontar, em
 * cada um, o recurso usado para distorcer a leitura. Isso não se escreve de
 * cabeça: analisar um gráfico que alguém publicou exige ter visto o gráfico, e
 * inventar três casos daria uma lição sobre exemplos que não existem — numa
 * vereda cuja matéria é desconfiar do que lhe mostram. O módulo ficou de fora
 * até os três estarem conferidos contra as fontes primárias, e é por isso que
 * o id da vereda saltava de `m8` para `m10`.
 *
 * ── Por que os gráficos são **reconstruídos**, e não as imagens ─────────
 * A plataforma é AGPL-3.0-only, e isso vale para toda peça que entra nela:
 * imagem de jornal e de emissora é obra de terceiro, e embuti-la não é
 * compatível. O que se embute são os **números**, que são fato e não obra — e
 * eles vêm da fonte primária, não do recorte que alguém publicou.
 *
 * E isso é melhor do que a imagem. Com os números aqui dentro, o laboratório
 * desenha o gráfico torto **e** o honesto a partir deles: o desbravador vê os
 * dois saírem do mesmo dado, que é exatamente o que a lição quer mostrar. Uma
 * captura de tela mostraria só o torto.
 *
 * ── E o que torna cada caso utilizável é a fonte primária ───────────────
 * Em todos os três, o número conferido veio de quem o produziu — IBGE pelo
 * IPCA, o painel do Ministério da Saúde pela série diária, os boletins das
 * secretarias estaduais pelas mortes por estado — e não do veículo que
 * publicou o gráfico. No primeiro caso isso mudou um número: as críticas ao
 * gráfico da GloboNews escreveram 5,92% para 2010, e o IBGE diz **5,91%**. A
 * lição cita o do IBGE, e o caso é também a aula sobre ir à fonte.
 */

/* ── O recurso usado para distorcer ───────────────────────────────────────── */

/**
 * Os quatro recursos que o requisito nomeia.
 *
 * São quatro e os casos são três, e é o enunciado: "entre eixo truncado,
 * escala inadequada, base incomparável ou recorte conveniente do período". O
 * quarto fica como alternativa errada plausível em cada caso — tirá-lo da
 * lista deixaria a escolha entre três, e cada acerto valeria menos.
 */
export type RecursoDeDistorcao =
  /** O eixo não começa em zero, e a diferença desenhada não é a diferença medida. */
  | 'eixo-truncado'
  /** O tamanho do desenho não corresponde ao número que ele representa. */
  | 'escala-inadequada'
  /** Compara-se coisa que não se compara: grupos de tamanhos diferentes, medidas diferentes. */
  | 'base-incomparavel'
  /** Mostra-se o pedaço do tempo que convém, e o resto fica de fora. */
  | 'recorte-do-periodo';

export const NOME_DO_RECURSO: Record<RecursoDeDistorcao, string> = {
  'eixo-truncado': 'Eixo truncado',
  'escala-inadequada': 'Escala inadequada',
  'base-incomparavel': 'Base incomparável',
  'recorte-do-periodo': 'Recorte conveniente do período',
};

export const O_QUE_O_RECURSO_FAZ: Record<RecursoDeDistorcao, string> = {
  'eixo-truncado':
    'O eixo começa num valor qualquer em vez de zero, e uma diferença pequena '
    + 'vira um paredão. Os números escritos estão certos; o que engana é a '
    + 'altura.',
  'escala-inadequada':
    'O tamanho do desenho não corresponde ao número. Duas barras de valores '
    + 'iguais saem de alturas diferentes, ou a maior fica menor que a menor.',
  'base-incomparavel':
    'Comparam-se coisas que não se comparam — grupos de tamanhos muito '
    + 'diferentes, ou medidas de naturezas diferentes na mesma escala.',
  'recorte-do-periodo':
    'Mostra-se o pedaço do tempo que convém. Cada número do recorte é '
    + 'verdadeiro, e o que ficou de fora é o que mudava a leitura.',
};

/* ── Os números, e de onde cada um veio ───────────────────────────────────── */

/** Uma barra do gráfico, com o valor de verdade e a altura que foi desenhada. */
export interface BarraDoCaso {
  rotulo: string;
  /** O número que a fonte primária diz. */
  valor: number;
  /**
   * A altura relativa com que a barra **foi desenhada**, de 0 a 1, quando ela
   * discorda do valor.
   *
   * Ausente quer dizer "desenhada em proporção ao valor". Ela existe porque no
   * caso da escala inadequada o desenho não lê o número, e sem guardar as duas
   * coisas o laboratório não teria como mostrar o torto ao lado do honesto.
   */
  alturaDesenhada?: number;
  /** Se esta é a barra em que o desbravador deve reparar. */
  emFoco?: true;
  /**
   * Quantos habitantes aquele grupo tem, quando a barra é de um grupo.
   *
   * Ela existe porque sem ela a afirmação do caso da base incomparável seria
   * prosa que nenhuma trava confere: "São Paulo é o último por habitante" sai
   * de uma divisão, e a divisão precisa do divisor. Com ela aqui, a trava
   * recalcula a ordem em vez de acreditar no texto — é a divisão de
   * `exemplosDaAnalise`, com a conta declarada e a afirmação lida da lição.
   */
  habitantes?: number;
}

export interface CasoEnganoso {
  id: string;
  /** Quem publicou, com as palavras de quem o procura depois. */
  veiculo: string;
  /** Quando. */
  quando: string;
  /** O que o gráfico mostrava, escrito como a legenda dele diria. */
  titulo: string;
  /** A unidade do eixo vertical, para o desenho e para a leitura. */
  unidade: string;
  /** De onde vieram os números daqui — a fonte **primária**, e não o veículo. */
  fonte: string;
  barras: BarraDoCaso[];
  /** O recurso usado. Exatamente um por caso. */
  recurso: RecursoDeDistorcao;
  /**
   * O que a leitura torta faz alguém concluir.
   *
   * Ela aparece **antes** da classificação, porque é a isca: o desbravador lê
   * a conclusão plausível e precisa achar o que a sustenta. O que não aparece
   * antes é o `porque` — esse é a resposta.
   */
  oQueParece: string;
  /** Por que aquele recurso é o que está ali. Lido **depois** da escolha. */
  porque: string;
  /** O que o mesmo dado mostra quando desenhado honestamente. */
  honesto: string;
  /** Se o próprio veículo reconheceu o erro, e como. */
  errata?: string;
}

/**
 * Os três casos.
 *
 * Três recursos diferentes de propósito: com dois casos do mesmo tipo, acertar
 * os dois seria acertar um, e o requisito pede apontar o recurso **em cada
 * um**. É a decisão das três coletas da CC-ES010.
 */
export const CASOS_ENGANOSOS: CasoEnganoso[] = [
  {
    id: 'ipca-globonews',
    veiculo: 'GloboNews, no programa Conta Corrente',
    quando: '10 de janeiro de 2014',
    titulo: 'A inflação do ano, medida pelo IPCA',
    unidade: '%',
    fonte: 'IBGE, SIDRA tabela 1737, IPCA — variação acumulada no ano',
    /*
      As alturas desenhadas são as proporções em que as barras apareceram na
      tela, e não uma reconstrução precisa de pixels: o que o caso exige é que
      a de 2013 saia mais alta que a de 2011 e que a de 2010, e é isso que
      elas fazem. O valor de cada barra, esse, é o do IBGE.
    */
    barras: [
      { rotulo: '2009', valor: 4.31, alturaDesenhada: 0.34 },
      { rotulo: '2010', valor: 5.91, alturaDesenhada: 0.52 },
      { rotulo: '2011', valor: 6.50, alturaDesenhada: 0.68 },
      { rotulo: '2012', valor: 5.84, alturaDesenhada: 0.60 },
      { rotulo: '2013', valor: 5.91, alturaDesenhada: 1.00, emFoco: true },
    ],
    recurso: 'escala-inadequada',
    oQueParece:
      'Que a inflação de 2013 foi a maior dos cinco anos — mais alta até do '
      + 'que a de 2011.',
    porque:
      'As alturas não estão lendo os números. A barra de 2013 vale 5,91% e saiu '
      + 'mais alta que a de 2011, que vale 6,50%. E saiu mais alta que a de '
      + '2010, que vale **exatamente o mesmo**: 5,91%. Dois números iguais em '
      + 'duas alturas diferentes é a prova de que a altura não veio do número.',
    honesto:
      'Desenhadas em proporção, a barra de 2011 é a mais alta (6,50%) e as de '
      + '2010 e 2013 ficam do mesmo tamanho, porque são o mesmo número. A '
      + 'inflação de 2013 não foi a maior do período: foi a terceira, empatada '
      + 'com a de 2010.',
    errata:
      'A própria emissora reconheceu: disse que "houve um erro no gráfico de '
      + 'barra do indicador, apesar de os números estarem corretos", e exibiu '
      + 'o gráfico certo no programa seguinte, em 13 de janeiro de 2014.',
  },
  {
    id: 'covid-24-horas',
    veiculo: 'Ministério da Saúde, no painel covid.saude.gov.br',
    quando: '5 a 8 de junho de 2020',
    titulo: 'Mortes por covid-19 no Brasil',
    unidade: 'mortes',
    fonte: 'Série diária do próprio painel do Ministério da Saúde',
    /*
      Duas barras, e é o caso inteiro: o que o painel mostrou e o que ele
      deixou de mostrar. A primeira é verdadeira — foi o número das últimas
      vinte e quatro horas —, e é a mesma série que dá a segunda.
    */
    barras: [
      { rotulo: 'Últimas 24 horas', valor: 904, emFoco: true },
      { rotulo: 'Total até aquele dia', valor: 35930 },
    ],
    recurso: 'recorte-do-periodo',
    oQueParece:
      'Que a epidemia era um problema de centenas de mortes, e não de dezenas '
      + 'de milhares.',
    porque:
      'O painel parou de publicar os números acumulados e passou a destacar só '
      + 'os das últimas vinte e quatro horas. As 904 mortes do dia 8 de junho '
      + 'são verdadeiras; o que saiu da tela foram as 35.930 que já havia. É o '
      + 'mesmo dado, com o pedaço do tempo que convém.',
    honesto:
      'A mesma série, inteira, mostra 35.930 mortes acumuladas até 8 de junho '
      + 'de 2020 — quase quarenta vezes o número do dia. E mostra a subida: '
      + '31.199 em 4 de junho, 32.548 em 5, 34.021 em 6, 35.026 em 7.',
    errata:
      'O Supremo Tribunal Federal determinou que o ministério voltasse a '
      + 'divulgar os dados acumulados em até 48 horas, e eles voltaram.',
  },
  {
    id: 'mortes-por-estado',
    veiculo: 'O ranking de mortes por estado, publicado pelo painel do '
      + 'Ministério da Saúde e repetido pela imprensa',
    quando: '8 de junho de 2020',
    titulo: 'Mortes por covid-19, por estado',
    unidade: 'mortes',
    fonte:
      'Boletins das secretarias estaduais de saúde para as mortes, e '
      + 'estimativas de população do IBGE para 2020',
    /*
      Os seis primeiros do ranking absoluto, que é o que um gráfico de jornal
      mostra. A população de cada um é do IBGE, e está aqui para que a conta
      por habitante seja refeita e não acreditada.
    */
    barras: [
      { rotulo: 'SP', valor: 9188, habitantes: 46289333, emFoco: true },
      { rotulo: 'RJ', valor: 6781, habitantes: 17366189 },
      { rotulo: 'CE', valor: 4192, habitantes: 9187103 },
      { rotulo: 'PA', valor: 3835, habitantes: 8690745 },
      { rotulo: 'PE', valor: 3350, habitantes: 9616621 },
      { rotulo: 'AM', valor: 2271, habitantes: 4207714 },
    ],
    recurso: 'base-incomparavel',
    oQueParece:
      'Que São Paulo era, de longe, o estado mais atingido do país — quatro '
      + 'vezes o Amazonas.',
    porque:
      'São Paulo tem 46,3 milhões de habitantes e o Amazonas tem 4,2 milhões. '
      + 'Comparar as mortes de um com as do outro em número absoluto é '
      + 'comparar grupos de tamanhos muito diferentes: São Paulo encabeça todo '
      + 'gráfico absoluto deste país porque é onde vive mais gente.',
    honesto:
      'Por 100 mil habitantes, São Paulo é o **último** dos seis que o gráfico '
      + 'mostra, com 19,85. O Amazonas é o primeiro, com 53,97 — 2,72 vezes a '
      + 'taxa de São Paulo, com um quarto das mortes dele.',
  },
];

export const casoDe = (id: string) => CASOS_ENGANOSOS.find(c => c.id === id);

/** Os recursos que a lição oferece, na ordem em que a tela os desenha. */
export const RECURSOS = Object.keys(NOME_DO_RECURSO) as RecursoDeDistorcao[];

/**
 * A altura relativa com que uma barra foi **desenhada**.
 *
 * Quem não declara `alturaDesenhada` foi desenhada em proporção ao valor, e é
 * o caso de dois dos três: o engano deles não está na altura. Devolver sempre
 * a proporção do valor apagaria o caso da escala inadequada, que é o único em
 * que o desenho discorda do número.
 */
export function alturaTorta(caso: CasoEnganoso, barra: BarraDoCaso): number {
  if (barra.alturaDesenhada !== undefined) return barra.alturaDesenhada;
  return barra.valor / maiorValor(caso);
}

/** A altura que a barra teria se o desenho lesse o número. */
export const alturaHonesta = (caso: CasoEnganoso, barra: BarraDoCaso) =>
  barra.valor / maiorValor(caso);

export const maiorValor = (caso: CasoEnganoso) =>
  Math.max(...caso.barras.map(b => b.valor));

/** A barra em que o desbravador deve reparar. Exatamente uma por caso. */
export const emFoco = (caso: CasoEnganoso) => caso.barras.find(b => b.emFoco)!;

/**
 * A taxa por cem mil habitantes de uma barra, quando ela é de um grupo.
 *
 * `null` quando a barra não é de um grupo — e as barras dos outros dois casos
 * não são: a inflação de um ano e as mortes de um dia não têm habitantes. A
 * tela só oferece o desenho por habitante onde a conta existe, e devolver zero
 * aqui poria uma barra de altura nenhuma ao lado das outras, com cara de
 * resposta.
 */
export const porCemMil = (barra: BarraDoCaso) =>
  (barra.habitantes === undefined ? null : barra.valor / barra.habitantes * 1e5);

/** Se o caso tem como ser redesenhado por habitante. */
export const temPopulacao = (caso: CasoEnganoso) =>
  caso.barras.every(b => b.habitantes !== undefined);
