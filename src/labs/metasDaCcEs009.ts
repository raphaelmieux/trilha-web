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

import { type Formulario, CAMPO_NOME, cabecalhoDe, linhasDe, respostasReais } from './formulario';
import {
  type Escala, type Natureza,
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE,
  CLASSIFICACAO, baseDoAcampamento, camposDaBase,
} from './baseDoAcampamento';
import type { Caderno, Planilha } from './planilha';
import {
  amplitude, colunaDe, desvioPadrao, media, mediana, moda, numerosDe,
} from './analiseDeDados';
import { abaDe, comAba, escritoEm, planilhaDe, usaFuncao } from './cadernoDoClube';
import { escrever, valorCalculado } from './planilha';
import { nomeDaColuna, referenciasDe } from './formulas';

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
  /**
   * Os blocos que a aba de cálculos desta lição traz.
   *
   * Eles moram no contexto e não numa constante porque cada lição monta a aba
   * dela: a conferência precisa saber em que linha um rótulo caiu, e a linha
   * depende do que veio antes. Um deslocamento escrito à mão erraria calado —
   * a fórmula iria para a célula do lado e a tarefa ficaria vermelha com a
   * conta certa na tela.
   */
  blocos: BlocoDeContas[];
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

export const ROTULO_RAZAO = 'Média ÷ mediana';
export const ROTULO_CHEGAM = 'Quantos chegam à média';
export const ROTULO_TOTAL = 'Quantos são ao todo';

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
export interface Conta {
  rotulo: string;
  /**
   * As funções que a fórmula tem de chamar.
   *
   * Vazia quando mais de um caminho serve — a razão entre média e mediana se
   * escreve dividindo as duas células de cima, que é a boa prática, ou
   * repetindo as duas funções, que também responde. Cobrar um dos dois mediria
   * ter adivinhado o nosso.
   */
  funcoes: string[];
  /** Quanto ela deve devolver, sobre esta coluna. */
  esperado: (base: Formulario, campoId: string) => number | null;
}

const daColuna = (f: (v: string[]) => number | null) =>
  (base: Formulario, campoId: string) => f(colunaDe(base, campoId));

export const CONTAS: Conta[] = [
  { rotulo: 'Média', funcoes: ['MÉDIA'], esperado: daColuna(media) },
  { rotulo: 'Mediana', funcoes: ['MED'], esperado: daColuna(mediana) },
  { rotulo: 'Moda', funcoes: ['MODO'], esperado: daColuna(moda) },
  { rotulo: 'Amplitude', funcoes: ['MÁXIMO', 'MÍNIMO'], esperado: daColuna(amplitude) },
  { rotulo: 'Desvio padrão', funcoes: ['DESVPADP'], esperado: daColuna(desvioPadrao) },

  {
    rotulo: ROTULO_RAZAO,
    funcoes: [],
    esperado: daColuna(v => {
      const md = mediana(v);
      const m = media(v);
      return m === null || md === null || md === 0 ? null : m / md;
    }),
  },
  {
    rotulo: ROTULO_CHEGAM,
    funcoes: ['CONT.SE'],
    esperado: daColuna(v => {
      const m = media(v);
      return m === null ? null : numerosDe(v).filter(n => n >= m).length;
    }),
  },
  { rotulo: ROTULO_TOTAL, funcoes: ['CONT.NÚM'], esperado: daColuna(v => numerosDe(v).length) },
];

export const contaDoRotulo = (rotulo: string) => CONTAS.find(c => c.rotulo === rotulo);

/** As cinco medidas do módulo 2, na ordem em que a lição as apresenta. */
export const MEDIDAS = CONTAS.slice(0, 5);

/* ── Os blocos da aba de cálculos ─────────────────────────────────────────── */

/**
 * Um bloco de contas: um título, o cabeçalho das três colunas, e uma linha por
 * rótulo.
 *
 * A aba não traz todos os blocos sempre. Cada lição monta a dela com os blocos
 * de que precisa, porque a de cima já deixou as contas dela escritas e a de
 * baixo ainda não existe: mostrar no módulo 2 os rótulos que só o módulo 3 vai
 * usar é pôr na tela a pergunta antes do assunto.
 */
export interface BlocoDeContas {
  titulo: string;
  rotulos: string[];
}

export const BLOCO_DAS_MEDIDAS: BlocoDeContas = {
  titulo: 'Medidas da base',
  rotulos: MEDIDAS.map(m => m.rotulo),
};

export const BLOCO_DO_ENGANO: BlocoDeContas = {
  titulo: 'Onde a média engana',
  rotulos: [ROTULO_RAZAO, ROTULO_CHEGAM, ROTULO_TOTAL],
};

/**
 * Em que linha um rótulo cai, dada a lista de blocos da aba.
 *
 * A conta era `2 + índice`, e bastava enquanto havia um bloco só. Com dois, a
 * posição de uma medida passa a depender do que veio antes — e um deslocamento
 * escrito à mão erraria **calado**: a fórmula iria para a célula do lado, a
 * conferência leria a célula vazia, e a tarefa ficaria vermelha com a conta
 * certa escrita na tela. É a mesma família do `describe.each` com as trilhas
 * escritas à mão.
 */
export function linhaDoRotulo(blocos: BlocoDeContas[], rotulo: string): number {
  let linha = 0;
  for (const b of blocos) {
    /* Título, cabeçalho, rótulos — e uma linha em branco antes do bloco
       seguinte, que é o que separa um do outro na tela. */
    const dentro = b.rotulos.indexOf(rotulo);
    if (dentro >= 0) return linha + 2 + dentro;
    linha += 2 + b.rotulos.length + 1;
  }
  return -1;
}

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
export function cadernoDaAnalise(base: Formulario, blocos: BlocoDeContas[] = [BLOCO_DAS_MEDIDAS]): Caderno {
  return { planilhas: [abaDeRespostas(base), abaDeCalculos(blocos)], ativa: 0 };
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

function abaDeCalculos(blocos: BlocoDeContas[]): Planilha {
  const campos = camposDaBase();
  const rotulo = (id: string) => campos.find(c => c.id === id)?.rotulo ?? id;
  const conteudo: string[][] = [];
  for (const b of blocos) {
    if (conteudo.length) conteudo.push([]);
    conteudo.push([b.titulo]);
    conteudo.push(['', ...COLUNAS_MEDIDAS.map(rotulo)]);
    for (const r of b.rotulos) conteudo.push([r]);
  }
  return planilhaDe(ABA_CALCULOS, conteudo);
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
  return contaDoRotulo(rotulo)?.esperado(base, campoId) ?? null;
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
  c: ContextoDaAnalise, rotulo: string, coluna: number, funcoes: string[], esperado: number | null,
): boolean {
  const p = aba(c, ABA_CALCULOS);
  if (!p) return false;
  const linha = linhaDoRotulo(c.blocos, rotulo);
  if (linha < 0) return false;
  const escrito = escritoEm(p, linha, coluna);
  if (!funcoes.every(f => usaFuncao(escrito, f))) return false;

  /*
    Fórmula que não aponta para lugar nenhum é um número digitado com um sinal
    de igual na frente.

    `=1,43` começa por igual, devolve o número certo, e não acompanha nada —
    é o terceiro defeito do requisito 7 da CC-ES003, o que não tem pista. E ele
    escapa da conferência de função sempre que a conta aceita mais de um
    caminho, como a razão entre média e mediana: ali não há função obrigatória
    para cobrar, e sem esta guarda a célula digitada passaria.
  */
  if (referenciasDe(escrito).length === 0) return false;

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

/** Uma conta escrita para as três colunas, com fórmula e resultado conferindo. */
function contaCompleta(c: ContextoDaAnalise, rotulo: string): boolean {
  const conta = contaDoRotulo(rotulo);
  if (!conta) return false;
  return COLUNAS_MEDIDAS.every(campo =>
    contaConfere(c, rotulo, colunaDaMedida(campo), conta.funcoes, conta.esperado(c.base, campo)));
}

/**
 * Os quarenta e oito registros continuam na aba.
 *
 * Viaja **conjugada** com cada meta que pede um gesto, e não como item da
 * lista: "a base continua inteira" é verdadeira no segundo zero, e item já
 * marcado ensina a não ler a lista. É a decisão de "sem alterar uma palavra do
 * texto" da CC-ES002.
 *
 * E ela tem dentes justamente aqui: o caminho rápido do módulo 3 é apagar os
 * três veteranos para a média "melhorar". O requisito 5.6 manda decidir por
 * escrito o que fazer com eles, e não sumir com eles.
 */
function baseIntacta(c: ContextoDaAnalise): boolean {
  const p = aba(c, ABA_RESPOSTAS);
  const antes = abaDe(c.cadernoAntes, ABA_RESPOSTAS);
  if (!p || !antes) return false;
  const coluna = colunaDoCampo(CAMPO_NOME);
  const nomes = (q: typeof p) => {
    const fora: string[] = [];
    for (let l = PRIMEIRA_LINHA; l < q.celulas.length; l++) {
      const v = escritoEm(q, l, coluna);
      if (v) fora.push(v);
    }
    return fora;
  };
  return nomes(p).join('\u0000') === nomes(antes).join('\u0000');
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
    feita: c => contaCompleta(c, 'Média') && contaCompleta(c, 'Mediana'),
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
    feita: c => contaCompleta(c, 'Moda') && viu(c, VIU_QUE_A_MODA_NAO_SERVE),
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
    feita: c => contaCompleta(c, 'Amplitude') && contaCompleta(c, 'Desvio padrão'),
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

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — Quando a média engana (requisito 3)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_A_COLUNA_QUE_ENGANA = 'viu-a-coluna-em-que-a-media-engana';

/**
 * ── Por que a lição é uma razão, e não uma contagem ──────────────────────
 * O caminho óbvio seria contar quantos ficam abaixo da média, e ele não
 * separa nada: na coluna de acampamentos são 29 dos 48, e na de idade são 26 —
 * as duas passam da metade, e a conta diria que a média engana nas duas.
 *
 * O que separa é a **distância entre a média e a mediana**. Na idade elas
 * ficam a 3% uma da outra; na altura, a menos de 1%; nos acampamentos, a
 * média fica **43% acima** da mediana. Uma razão perto de 1 diz que as duas
 * medidas concordam e qualquer uma descreve o conjunto; longe de 1 diz que
 * elas discordam, e aí escolher qual relatar é escolher o que a liderança vai
 * entender.
 *
 * Isso também é o que impede a lição de ensinar a regra errada. Se as três
 * colunas fossem assimétricas, o desbravador sairia daqui achando que a média
 * sempre mente — e aí ele não usaria mais a média, que é pior.
 */
export const METAS_DO_ENGANO: Meta[] = [
  {
    id: 'a-razao-entre-as-duas',
    titulo: 'A média dividida pela mediana, nas três colunas',
    detalhe: 'Perto de 1 quer dizer que as duas medidas concordam. Longe de 1 quer dizer que elas discordam — e aí uma delas está descrevendo mal.',
    onde: 'Na aba Cálculos, na linha "Média ÷ mediana".',
    passos: [
      'Você já tem a média e a mediana das três colunas escritas logo acima.',
      'Divida uma pela outra apontando para as duas células: algo como =B3/B4.',
      'Não escreva o número à mão — a conta precisa se refazer se o dado mudar.',
      'Compare os três resultados: dois ficam quase em 1, e um não.',
    ],
    feita: c => contaCompleta(c, ROTULO_RAZAO) && baseIntacta(c),
  },
  {
    id: 'quantos-chegam-a-media',
    titulo: 'Quantos desbravadores chegam à média, e quantos são ao todo',
    detalhe: 'Na coluna que engana, a média fica acima do que a maioria fez: ela descreve um clube que não é este.',
    onde: 'Nas duas últimas linhas da aba Cálculos.',
    passos: [
      'Use =CONT.SE( sobre a coluna, com o critério ">="&a célula da média.',
      'As aspas e o & são o jeito de dizer "maior ou igual ao que está naquela célula".',
      'Na linha de baixo, =CONT.NÚM( sobre a mesma coluna, para ter com o que comparar.',
    ],
    feita: c => contaCompleta(c, ROTULO_CHEGAM) && contaCompleta(c, ROTULO_TOTAL) && baseIntacta(c),
  },
  {
    id: 'viu-a-coluna-que-engana',
    titulo: 'Dizer em qual das três colunas a média descreve mal',
    detalhe: 'E é uma só. Nas outras duas a média está ótima — quem sai daqui achando que média sempre mente deixa de usar uma medida boa.',
    onde: 'Na pergunta abaixo da tabela.',
    passos: [
      'Olhe a linha da razão: duas colunas ficam quase em 1, e uma fica bem acima.',
      'Olhe a coluna que ficou acima na aba Respostas, ordenada, e veja quem está no fim dela.',
      'São três pessoas de verdade, e não erro de digitação: elas puxam a média e não mexem na mediana.',
    ],
    feita: c => viu(c, VIU_A_COLUNA_QUE_ENGANA),
  },
];

/* ── O registro das lições ───────────────────────────────────────────────── */

export type ProgramaDaCcEs009 = 'planilha' | 'plataforma';

export type LicaoDaCcEs009 = 'tipos' | 'centro' | 'engano';

export interface LicaoDeAnalise {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs009;
  inicial: () => ContextoDaAnalise;
  metas: Meta[];
}

/** A pasta como ela chega, sem nada calculado. */
export function contextoInicial(blocos: BlocoDeContas[] = [BLOCO_DAS_MEDIDAS]): ContextoDaAnalise {
  const base = baseDoAcampamento();
  const caderno = cadernoDaAnalise(base, blocos);
  return { base, caderno, cadernoAntes: caderno, blocos, descobertas: [], marcacoes: {}, textos: {} };
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
  engano: {
    programa: 'planilha',
    /* Parte do módulo 2 fechado: as cinco medidas já escritas, e o bloco novo
       vazio ao lado. Começar mandando refazer a lição anterior ensinaria que o
       trabalho anterior não conta — é o `caderno` da CC-ES003. */
    inicial: () => comAsMedidasEscritas(),
    metas: METAS_DO_ENGANO,
  },
};

/**
 * O contexto do módulo 3: as cinco medidas do módulo 2 já calculadas.
 *
 * As fórmulas são escritas de verdade, e não os valores carimbados: a razão
 * que o módulo 3 pede aponta para estas células, e uma célula com número
 * parado não se refaria se alguém mexesse na base. Solução que pula o meio do
 * caminho prova o fim e não prova o caminho — é o que deixou a lição de
 * assinar da CC-ES004 impossível de vencer.
 */
export function comAsMedidasEscritas(): ContextoDaAnalise {
  const c = contextoInicial([BLOCO_DAS_MEDIDAS, BLOCO_DO_ENGANO]);
  let p = abaDe(c.caderno, ABA_CALCULOS);
  for (const medida of MEDIDAS) {
    for (const campo of COLUNAS_MEDIDAS) {
      p = escrever(p, linhaDoRotulo(c.blocos, medida.rotulo), colunaDaMedida(campo),
        formulaDaMedida(medida, c.base, campo));
    }
  }
  const caderno = comAba(c.caderno, p);
  return { ...c, caderno, cadernoAntes: caderno };
}

/** A fórmula que uma medida pede sobre uma coluna, escrita como se escreve. */
export function formulaDaMedida(conta: Conta, base: Formulario, campoId: string): string {
  const faixa = `${ABA_RESPOSTAS}!${faixaDoCampo(base, campoId)}`;
  if (conta.funcoes.length === 2) return `=${conta.funcoes[0]}(${faixa})-${conta.funcoes[1]}(${faixa})`;
  return `=${conta.funcoes[0]}(${faixa})`;
}
