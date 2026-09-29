/**
 * O que cada lição da CC-ES009 cobra.
 *
 * Num arquivo só, como `metasDaCcEs008.ts` e os de antes dele. Os programas
 * são **dois** — a planilha, onde toda conta acontece, e a tela da plataforma,
 * onde acontece o que não é conta —, e o contexto é um: a base, a pasta de
 * trabalho e o que a pessoa concluiu viajam juntos porque a conclusão do
 * requisito 8 é sobre a planilha que ela acabou de montar.
 *
 * O registro mora **fora do teste**, como o de planilha, o de PDF, o de nuvem
 * e o de formulário: quem o lê é a tela, que monta a lição, **e** a trava, que
 * confere que nenhuma meta abre verde. Escrito só na trava, a tela repetiria a
 * escolha e as duas divergiriam na primeira lição nova, com a trava
 * continuando verde conferindo uma lição que a tela não abre.
 *
 * ── A base não é trabalho, é dado ────────────────────────────────────────
 * Em toda vereda de escritório até aqui, o que se abre é o que se conserta: o
 * documento chega mal formatado, a planilha chega bagunçada, o formulário
 * chega sem tipo. Aqui não. A base chega **fechada e arrumada** — a CC-ES008
 * já a arrumou —, e o que se produz é uma leitura dela. Mexer no dado para a
 * conta ficar melhor é exatamente o que o requisito 5.6 existe para nomear e
 * recusar, então toda meta olha para a **pasta de trabalho**, e nunca para a
 * base.
 *
 * ── A conta confere a fórmula e o resultado, nunca só um dos dois ────────
 * É a decisão da CC-ES003, e aqui ela carrega a vereda inteira. Conferindo só
 * o número, `=48` passa — está certo hoje e continua mostrando o número de
 * hoje amanhã, que é o terceiro defeito do requisito 7 de lá, o que não tem
 * pista nenhuma. Conferindo só o texto, `=MÉDIA(F3:F49)` passa: a função certa
 * sobre o intervalo errado devolve um número plausível e deixa um inscrito de
 * fora, que é o erro de planilha mais comum que existe.
 */

import { type Formulario, cabecalhoDe, linhasDe, respostasReais } from './formulario';
import {
  type Escala, type Natureza,
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE,
  CLASSIFICACAO, baseDoAcampamento, camposDaBase,
} from './baseDoAcampamento';
import type { Caderno, Planilha } from './planilha';
import {
  amplitude, colunaDe, desvioPadrao, media, mediana, moda,
} from './analiseDeDados';
import { abaDe, escritoEm, planilhaDe, usaFuncao } from './cadernoDoClube';
import { valorCalculado } from './planilha';
import { nomeDaColuna } from './formulas';

/* ── A forma de uma meta ──────────────────────────────────────────────────── */

export interface Meta {
  id: string;
  titulo: string;
  /** Por que isto importa. Uma ou duas frases, do jeito que se fala com alguém de dez anos. */
  detalhe: string;
  /** Onde, no programa, este gesto acontece. */
  onde: string;
  /** O passo a passo, para quem travar. Convite, e não despejo. */
  passos: string[];
  feita: (c: ContextoDaAnalise) => boolean;
}

/* ── O contexto ───────────────────────────────────────────────────────────── */

/** O que a pessoa marcou para uma coluna, no módulo 1. */
export interface Marcacao {
  natureza?: Natureza;
  escala?: Escala;
  naoAgrupa?: boolean;
}

export interface ContextoDaAnalise {
  /**
   * A base, fechada, e ela **não muda**.
   *
   * Não é economia de campo: é o assunto da vereda. A tentação de toda análise
   * é mexer no dado até a conta ficar bonita — apagar o veterano que puxa a
   * média, arredondar a altura esquisita —, e o requisito 5.6 manda decidir
   * por escrito o que fazer com cada valor estranho, e não sumir com ele. Uma
   * base editável faria a decisão escrita ser sobre uma base que já não
   * existe.
   */
  base: Formulario;
  caderno: Caderno;
  /**
   * A pasta de quando a lição abriu.
   *
   * É a mesma razão de a CC-ES001 carregar o disco de antes e de a CC-ES008
   * carregar o formulário de antes: saber o que **mudou** é outra pergunta que
   * saber o que está lá.
   */
  cadernoAntes: Caderno;
  /**
   * O que a pessoa viu, e que não deixa marca em célula nenhuma.
   *
   * É a família das quatro verificações do Explorador e das duas descobertas
   * do módulo 6 da CC-ES004: ver a conta se refazer, ver a moda não responder
   * sobre uma medida, ver a mesma pergunta dar duas respostas por unidade.
   * Nenhuma muda um byte, e todas são o que o requisito manda demonstrar.
   */
  descobertas: string[];
  /** Como a pessoa classificou cada coluna, no módulo 1. */
  marcacoes: Record<string, Marcacao>;
  /** O que ela escreveu: a justificativa do atípico, a conclusão, a defesa. */
  textos: Record<string, string>;
}

const viu = (c: ContextoDaAnalise, o: string) => c.descobertas.includes(o);

const aba = (c: ContextoDaAnalise, nome: string) => abaDe(c.caderno, nome);

/* ── A pasta de trabalho ──────────────────────────────────────────────────── */

export const ABA_RESPOSTAS = 'Respostas';
export const ABA_CALCULOS = 'Cálculos';

/** O cabeçalho é a linha 0; o primeiro registro é a 1. */
export const PRIMEIRA_LINHA = 1;

/**
 * A coluna de um campo na aba de respostas.
 *
 * Ela sai da ordem dos campos, e nunca de uma tabela escrita à mão: campo novo
 * no formulário empurra os seguintes, e uma letra fixa passaria a apontar para
 * a coluna do lado — com a fórmula continuando a devolver um número.
 *
 * O `+ 1` é o "Enviado em", que `cabecalhoDe` põe na frente de tudo.
 */
export function colunaDoCampo(campoId: string): number {
  const i = camposDaBase().findIndex(c => c.id === campoId);
  return i < 0 ? -1 : i + 1;
}

/** A faixa de uma coluna inteira, do primeiro ao último registro: `F2:F49`. */
export function faixaDoCampo(base: Formulario, campoId: string): string {
  const letra = nomeDaColuna(colunaDoCampo(campoId));
  const ultima = PRIMEIRA_LINHA + respostasReais(base).length;
  return `${letra}${PRIMEIRA_LINHA + 1}:${letra}${ultima}`;
}

/** As três colunas quantitativas de que a zona de cálculo trata. */
export const COLUNAS_MEDIDAS = [CAMPO_IDADE, CAMPO_ALTURA, CAMPO_ACAMPAMENTOS];

/**
 * As cinco medidas, na ordem em que a lição as apresenta.
 *
 * Centro primeiro, dispersão depois — a ordem dos requisitos 2.3 e 2.4, e a
 * ordem em que elas fazem sentido: não se fala de quanto os valores se
 * espalham antes de dizer em volta de quê.
 *
 * A amplitude pede **duas** funções porque ela é uma subtração, e não uma
 * função. A planilha desta vereda não tem `AMPLITUDE()`, e é decisão: escrever
 * `=MÁXIMO(...)-MÍNIMO(...)` é o que torna visível que ela é a distância entre
 * as pontas, que é a definição que o requisito 2.4 pede.
 */
export const MEDIDAS: { rotulo: string; funcoes: string[] }[] = [
  { rotulo: 'Média', funcoes: ['MÉDIA'] },
  { rotulo: 'Mediana', funcoes: ['MED'] },
  { rotulo: 'Moda', funcoes: ['MODO'] },
  { rotulo: 'Amplitude', funcoes: ['MÁXIMO', 'MÍNIMO'] },
  { rotulo: 'Desvio padrão', funcoes: ['DESVPADP'] },
];

/** A linha, na aba de cálculos, em que uma medida é pedida. */
export const linhaDaMedida = (rotulo: string) =>
  2 + MEDIDAS.findIndex(m => m.rotulo === rotulo);

/** A coluna, na aba de cálculos, em que uma variável é pedida. */
export const colunaDaMedida = (campoId: string) =>
  1 + COLUNAS_MEDIDAS.indexOf(campoId);

/**
 * A pasta como ela chega: a base numa aba, e a zona de cálculo rotulada na
 * outra.
 *
 * ── A base chega certa, e é a diferença desta vereda ─────────────────────
 * Na CC-ES008 a aba chegava misturada — título em cima do cabeçalho, TOTAL
 * embaixo dos registros — porque arrumá-la era a lição. Aqui ela chega como a
 * CC-ES008 a deixou. Começar mandando refazer aquilo ensinaria que o trabalho
 * da vereda anterior não conta.
 *
 * ── A estrutura vem rotulada; a conta, não ───────────────────────────────
 * É a decisão do módulo 3 da CC-ES003, escrita lá: uma zona de cálculo que
 * chegasse preenchida não mediria nada, e um "organize como achar melhor"
 * mediria gosto. Os rótulos do que se quer estão escritos, e as células ao
 * lado estão vazias.
 */
export function cadernoDaAnalise(base: Formulario): Caderno {
  return { planilhas: [abaDeRespostas(base), abaDeCalculos()], ativa: 0 };
}

function abaDeRespostas(base: Formulario): Planilha {
  const cabecalho = cabecalhoDe(base);
  const linhas = linhasDe(base);
  return planilhaDe(ABA_RESPOSTAS, [cabecalho, ...linhas], {
    tabela: { l1: 0, c1: 0, l2: linhas.length, c2: cabecalho.length - 1 },
    /* A primeira linha fica congelada: rolando quarenta e oito registros, uma
       coluna sem cabeçalho à vista é uma coluna que ninguém sabe qual é. */
    congeladas: 1,
  });
}

function abaDeCalculos(): Planilha {
  const campos = camposDaBase();
  const rotulo = (id: string) => campos.find(c => c.id === id)?.rotulo ?? id;
  return planilhaDe(ABA_CALCULOS, [
    ['Medidas da base'],
    ['', ...COLUNAS_MEDIDAS.map(rotulo)],
    ...MEDIDAS.map(m => [m.rotulo]),
  ]);
}

/* ── A conferência de uma conta ───────────────────────────────────────────── */

/**
 * O número que a medida devolve sobre a coluna de verdade, ou `null` quando
 * ela **não devolve número**.
 *
 * `null` não é ausência de resposta: é a resposta. A planilha responde `#N/D` a
 * uma moda que não existe, e uma célula com número ali estaria afirmando uma
 * moda que a coluna não tem.
 *
 * Nesta base as três colunas **têm** moda, e é melhor assim do que eu havia
 * suposto ao desenhá-la. A moda da altura é 1,58 m, e ela aparece **duas**
 * vezes em quarenta e oito: um número perfeitamente plausível que não descreve
 * ninguém. Fosse `#N/D`, a lição seria "a planilha avisa"; como é um número, a
 * lição é que ela **não avisa** — que é a matéria desta vereda inteira. Quem
 * denuncia é `repeticoesDaModa`, e a pergunta que ela responde é a que o
 * desbravador tem de aprender a fazer.
 */
export function esperadoDe(base: Formulario, campoId: string, rotulo: string): number | null {
  const v = colunaDe(base, campoId);
  switch (rotulo) {
    case 'Média': return media(v);
    case 'Mediana': return mediana(v);
    case 'Moda': return moda(v);
    case 'Amplitude': return amplitude(v);
    case 'Desvio padrão': return desvioPadrao(v);
    default: return null;
  }
}

/**
 * A célula chama estas funções **e** devolve este número.
 *
 * As duas metades não se substituem, e é a decisão da CC-ES003:
 *
 *   - conferindo só o resultado, `=48` passa. Está certo hoje e continua
 *     mostrando o número de hoje amanhã — é o total digitado à mão, que é o
 *     defeito sem pista nenhuma;
 *   - conferindo só o texto, `=MÉDIA(F3:F49)` passa. A função certa sobre o
 *     intervalo errado devolve um número plausível e deixa um inscrito de
 *     fora.
 */
function contaConfere(
  c: ContextoDaAnalise, linha: number, coluna: number, funcoes: string[], esperado: number | null,
): boolean {
  const p = aba(c, ABA_CALCULOS);
  if (!p) return false;
  const escrito = escritoEm(p, linha, coluna);
  if (!funcoes.every(f => usaFuncao(escrito, f))) return false;

  /*
    O valor sai de `valorCalculado` **com a pasta junto**, e não de `valorEm`.

    `valorEm` conhece uma aba só: o acessador dele ignora o nome que vem antes
    da exclamação, então `=MÉDIA(Respostas!F2:F49)` escrito na aba Cálculos
    resolve contra a **própria** aba Cálculos, que está vazia. O que ele
    devolve é `#DIV/0!` — a conta certa, escrita certa, reprovada por um
    avaliador que não sabe onde procurar. Toda lição desta vereda atravessa a
    aba, porque a base mora numa e o cálculo mora na outra.
  */
  const v = valorCalculado(p, linha, coluna, c.caderno);
  if (esperado === null) return v.tipo === 'erro';
  /*
    A comparação é por proximidade, e não por igualdade.

    O desvio padrão sai de uma raiz quadrada, e a média de quarenta e oito
    alturas sai de uma divisão: dois caminhos diferentes até o mesmo número
    devolvem bits diferentes na última casa. Igualdade exata reprovaria a
    conta certa, e a tarefa mediria sorte de arredondamento.
  */
  return v.tipo === 'numero' && Math.abs(v.n - esperado) < 1e-9;
}

/** Uma medida escrita para as três colunas, com fórmula e resultado conferindo. */
function medidaCompleta(c: ContextoDaAnalise, rotulo: string): boolean {
  const linha = linhaDaMedida(rotulo);
  const funcoes = MEDIDAS.find(m => m.rotulo === rotulo)?.funcoes ?? [];
  return COLUNAS_MEDIDAS.every(campo =>
    contaConfere(c, linha, colunaDaMedida(campo), funcoes, esperadoDe(c.base, campo, rotulo)));
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — O tipo de cada variável (requisitos 2.1, 2.2 e 5.1)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * ── Por que esta lição não acontece na planilha ──────────────────────────
 * Não há no Excel um botão que classifique uma variável. Classificar é
 * decidir, e o que a planilha ofereceria seria digitar a palavra numa célula —
 * o que mediria digitação e obrigaria a trava a comparar texto livre. A
 * moldura de programa existe para quando há um programa; aqui não há, e vestir
 * a lição de aplicativo seria fantasia sem ganho.
 */
export const METAS_DOS_TIPOS: Meta[] = [
  {
    id: 'toda-coluna-classificada',
    titulo: 'Cada uma das dez colunas com natureza e escala marcadas',
    detalhe: 'O requisito pede cada variável, e não as interessantes: a coluna que você vai deixar de lado também é uma.',
    onde: 'Na lista de colunas, nos dois primeiros botões de cada linha.',
    passos: [
      'Comece perguntando se a resposta daquela coluna entra em conta. Se somar duas não quer dizer nada, ela é qualitativa.',
      'Na qualitativa, veja se os valores têm ordem: PP, P, M, G e GG têm; Falcão e Águia não.',
      'Na quantitativa, veja se o número vem de contar ou de medir. Entre 2 e 3 acampamentos não existe nada; entre 1,52 m e 1,53 m existe 1,524 m.',
    ],
    feita: c => camposDaBase().every(campo => {
      const m = c.marcacoes[campo.id];
      return m?.natureza !== undefined && m?.escala !== undefined;
    }),
  },
  {
    id: 'classificacao-certa',
    titulo: 'E as dez certas',
    detalhe: 'Telefone parece número e é texto; idade parece medida e é contagem. O teste não é a cara do valor, é o que se faz com ele.',
    onde: 'Na mesma lista — a marcação fica gravada quando você escolhe.',
    passos: [
      'Qualitativa é o que nomeia; quantitativa é o que conta ou mede.',
      'Nominal é nome sem ordem; ordinal é nome com ordem.',
      'Discreta vem de contar e só dá inteiro; contínua vem de medir e cabe qualquer coisa entre dois valores.',
    ],
    feita: c => camposDaBase().every(campo => {
      const m = c.marcacoes[campo.id];
      const certo = CLASSIFICACAO[campo.id];
      return m?.natureza === certo.natureza && m?.escala === certo.escala;
    }),
  },
  {
    id: 'as-tres-que-nao-agrupam',
    titulo: 'As três colunas que não servem para agrupar, marcadas como tais',
    detalhe: 'Nome, e-mail e observação são qualitativas como a unidade — mas cada valor delas aparece uma vez só. Uma pizza de nomes tem quarenta e oito fatias iguais e não responde a nada.',
    onde: 'Na terceira marca de cada linha.',
    passos: [
      'Olhe a coluna e pergunte: quantas pessoas cabem dentro de um mesmo valor?',
      'Na unidade cabem oito; no nome cabe uma.',
      'Marque as que têm uma pessoa por valor — são elas que você não vai contar nem comparar.',
    ],
    feita: c => camposDaBase().every(campo =>
      Boolean(c.marcacoes[campo.id]?.naoAgrupa) === Boolean(CLASSIFICACAO[campo.id].naoAgrupa)),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — Centro e dispersão (requisitos 2.3, 2.4 e 5.2)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_QUE_A_MODA_NAO_SERVE = 'viu-que-a-moda-nao-serve-para-medida';

/**
 * Abaixo disto, a moda é um número que não descreve ninguém.
 *
 * Três repetições em quarenta e oito é menos de 7% da base. Não há corte
 * canônico na estatística para isto — o que há é a pergunta, e o corte existe
 * para a trava poder cobrar que a base de fato tenha o contraste: uma coluna
 * cuja moda se repete muito, e uma cuja moda se repete quase nada.
 */
export const REPETICOES_QUE_FAZEM_MODA = 4;
export const VIU_A_CONTA_SE_REFAZER = 'viu-a-conta-se-refazer';

export const METAS_DO_CENTRO: Meta[] = [
  {
    id: 'media-e-mediana',
    titulo: 'Média e mediana, nas três colunas',
    detalhe: 'São duas respostas diferentes para "qual é o valor típico", e numa das três colunas elas discordam muito. Calcular as duas é o que deixa isso à vista.',
    onde: 'Na aba Cálculos, nas células ao lado de cada rótulo.',
    passos: [
      'Clique na célula ao lado de Média, na coluna da Idade.',
      'Escreva =MÉDIA( e selecione a coluna da idade na aba Respostas, do primeiro registro ao último.',
      'Faça o mesmo com =MED( para a mediana.',
      'Arraste para o lado para repetir nas outras duas colunas — as referências andam junto.',
    ],
    feita: c => medidaCompleta(c, 'Média') && medidaCompleta(c, 'Mediana'),
  },
  {
    id: 'a-moda-das-tres',
    titulo: 'A moda das três, e reparar que uma delas não quer dizer nada',
    detalhe: 'A planilha devolve um número nas três, e num deles esse número descreve duas pessoas em quarenta e oito. Moda só significa alguma coisa quando o valor se repete bastante.',
    onde: 'Na linha da Moda, nas três colunas — e depois na aba Respostas.',
    passos: [
      'Escreva =MODO( para as três colunas. Saem três números, todos plausíveis.',
      'Agora conte, na aba Respostas, quantas pessoas têm exatamente a moda da idade — e quantas têm exatamente a moda da altura.',
      'Uma se repete dezenas de vezes; a outra, duas. A planilha não avisa a diferença: quem pergunta é você.',
    ],
    feita: c => medidaCompleta(c, 'Moda') && viu(c, VIU_QUE_A_MODA_NAO_SERVE),
  },
  {
    id: 'amplitude-e-desvio',
    titulo: 'Amplitude e desvio padrão, nas três colunas',
    detalhe: 'O centro diz em volta de quê; a dispersão diz o quanto se afasta. Duas turmas com a mesma média podem não ter nada a ver uma com a outra.',
    onde: 'Nas duas últimas linhas da aba Cálculos.',
    passos: [
      'A amplitude é a distância entre as pontas: =MÁXIMO(...) menos =MÍNIMO(...) da mesma coluna.',
      'O desvio padrão é =DESVPADP(...), com P no fim — a base é o clube inteiro, e não uma amostra dele.',
    ],
    feita: c => medidaCompleta(c, 'Amplitude') && medidaCompleta(c, 'Desvio padrão'),
  },
  {
    id: 'a-conta-se-refaz',
    titulo: 'Ver a conta se refazer quando um dado muda',
    detalhe: 'É o que separa uma fórmula de um número digitado: o número digitado está certo hoje e continua mostrando o de hoje amanhã.',
    onde: 'Na aba Respostas, mudando uma altura e voltando para Cálculos.',
    passos: [
      'Vá à aba Respostas e mude a altura de alguém.',
      'Volte à aba Cálculos e veja a média andar.',
      'A base volta ao que era sozinha: aqui ela é dado, e não rascunho.',
    ],
    feita: c => viu(c, VIU_A_CONTA_SE_REFAZER),
  },
];

/* ── O registro das lições ───────────────────────────────────────────────── */

export type ProgramaDaCcEs009 = 'planilha' | 'plataforma';

export type LicaoDaCcEs009 = 'tipos' | 'centro';

export interface LicaoDeAnalise {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs009;
  inicial: () => ContextoDaAnalise;
  metas: Meta[];
}

/** A pasta como ela chega, sem nada calculado. */
export function contextoInicial(): ContextoDaAnalise {
  const base = baseDoAcampamento();
  const caderno = cadernoDaAnalise(base);
  return { base, caderno, cadernoAntes: caderno, descobertas: [], marcacoes: {}, textos: {} };
}

/**
 * Cada lição parte de um **estado** da pasta.
 *
 * É o campo `documento` da CC-ES002, o `caderno` da CC-ES003 e a `pasta` da
 * CC-ES004, pelo motivo escrito nos três — e é um `Record` sobre a união, então
 * a lição nova não compila até alguém dizer de que estado ela parte e o que ela
 * cobra.
 */
export const LICOES_DA_CC_ES009: Record<LicaoDaCcEs009, LicaoDeAnalise> = {
  tipos: {
    programa: 'plataforma',
    inicial: contextoInicial,
    metas: METAS_DOS_TIPOS,
  },
  centro: {
    programa: 'planilha',
    inicial: contextoInicial,
    metas: METAS_DO_CENTRO,
  },
};
