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

import {
  type Formulario, CAMPO_UNIDADE,
  cabecalhoDe, linhasDe, respostasReais, valorDa,
} from './formulario';
import {
  type Escala, type Natureza,
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE, ELENCO, UNIDADES_DO_CLUBE,
  ATIPICOS, CLASSIFICACAO, adesaoPorUnidade, baseDoAcampamento, camposDaBase, porSemana,
} from './baseDoAcampamento';
import type { Caderno, Faixa, Planilha, TipoDeGrafico } from './planilha';
import {
  amplitude, classesDe, colunaDe, desvioPadrao, frequenciasDe,
  media, mediana, medidaPorGrupo, moda, numerosDe,
} from './analiseDeDados';
import { abaDe, comAba, escritoEm, planilhaDe, usaFuncao } from './cadernoDoClube';
import { escrever, resumoEmDia, valorCalculado } from './planilha';
import { mostrarNumero, nomeDaColuna, numeroDoTexto, referenciasDe } from './formulas';

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

/**
 * O que se faz com um valor das pontas.
 *
 * `normal` é a resposta certa na maioria das vezes, e é o ponto: estar no
 * extremo não é ser atípico. A coluna de idade tem seis pontas e nenhum
 * atípico — alguém tem de ser o mais novo.
 */
export type Julgamento = 'normal' | 'mantem' | 'exclui';

/**
 * O que se faz com uma contestação do examinador.
 *
 * As duas são respostas legítimas, e é isso que o requisito 9 pede: defender
 * **com os dados** quando eles bastam, e reconhecer o limite quando não. Quem
 * defende tudo não entendeu a análise; quem reconhece tudo não confia nela.
 */
export type Veredito = 'defendo' | 'reconheco';

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
  /**
   * O que ela decidiu sobre cada valor das pontas, no módulo 7.
   *
   * A chave é campo e valor, e não campo e pessoa: o que se julga é **o
   * número**. Duas pessoas com a mesma altura estranha são o mesmo caso, e
   * pedir a decisão duas vezes ensinaria que ela é sobre gente.
   */
  julgamentos: Record<string, Julgamento>;
  /**
   * As colunas de que a pergunta do módulo 10 trata.
   *
   * É o que torna "a pergunta se responde com esta base" uma coisa
   * conferível. A plataforma não sabe ler a pergunta; sabe ver que ela aponta
   * para colunas que existem e que dá para agrupar ou contar. Uma pergunta
   * cujo único campo é o nome não se responde com quarenta e oito nomes
   * diferentes.
   */
  colunasDaPergunta: string[];
  /** O que ela decidiu sobre cada contestação do examinador, no módulo 11. */
  vereditos: Record<string, Veredito>;
  /** O que ela escreveu: a justificativa do atípico, a conclusão, a defesa. */
  textos: Record<string, string>;
}

const viu = (c: ContextoDaAnalise, o: string) => c.descobertas.includes(o);

const texto = (c: ContextoDaAnalise, chave: string) => (c.textos[chave] ?? '').trim();

const aba = (c: ContextoDaAnalise, nome: string) => abaDe(c.caderno, nome);

/* ── A pasta de trabalho ──────────────────────────────────────────────────── */

export const ABA_RESPOSTAS = 'Respostas';
export const ABA_CALCULOS = 'Cálculos';

/**
 * A aba do elenco: quantos desbravadores cada unidade tem.
 *
 * Ela **não sai do formulário**, e é essa a razão de existir: o formulário só
 * sabe de quem se inscreveu. Quantos são ao todo vem da secretaria do clube,
 * que é de onde vem na vida — e sem esse denominador o requisito 4 não tem
 * como acontecer, porque taxa é uma divisão.
 */
export const ABA_UNIDADES = 'Unidades';

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
/**
 * Um bloco de contas: um título, uma fileira de cabeçalhos, e uma linha por
 * rótulo.
 *
 * ── Por que ele carrega as próprias colunas ──────────────────────────────
 * O primeiro bloco tinha as três colunas de medida e mais nada, e bastava
 * enquanto todo bloco fosse medida × variável. A distribuição de frequências
 * do requisito 5.3 não é: as linhas dela são **categorias** — as seis unidades,
 * as classes de altura — e as colunas são frequência, frequência relativa e
 * acumulada.
 *
 * Duas máquinas para "qual célula, o que ela deve devolver, e ela confere?"
 * seriam a divergência de sempre, e aqui ela sairia como número plausível. Uma
 * só, com o bloco dizendo a forma dele.
 *
 * A aba não traz todos os blocos sempre: cada lição monta a dela com os de que
 * precisa, porque a de cima já deixou as contas dela escritas e a de baixo
 * ainda não existe. Mostrar no módulo 2 os rótulos que só o módulo 4 vai usar é
 * pôr na tela a pergunta antes do assunto.
 */
export interface BlocoDeContas {
  titulo: string;
  /** Os rótulos das linhas. */
  rotulos: string[];
  /** Os cabeçalhos das colunas. */
  colunas: string[];
  /** As funções que a célula desta linha e desta coluna tem de chamar. */
  funcoes: (linha: string, coluna: string) => string[];
  /** Quanto ela deve devolver, ou `null` quando ela deve devolver erro. */
  esperado: (base: Formulario, linha: string, coluna: string) => number | null;
}

/** Os rótulos das três colunas de medida, como a aba os escreve. */
export function colunasDeMedida(): string[] {
  const campos = camposDaBase();
  return COLUNAS_MEDIDAS.map(id => campos.find(c => c.id === id)?.rotulo ?? id);
}

/** O campo que um cabeçalho de coluna de medida designa. */
const campoDaColuna = (cabecalho: string) =>
  COLUNAS_MEDIDAS[colunasDeMedida().indexOf(cabecalho)];

const blocoDeMedida = (titulo: string, rotulos: string[]): BlocoDeContas => ({
  titulo,
  rotulos,
  colunas: colunasDeMedida(),
  funcoes: linha => contaDoRotulo(linha)?.funcoes ?? [],
  esperado: (base, linha, coluna) =>
    contaDoRotulo(linha)?.esperado(base, campoDaColuna(coluna)) ?? null,
});

export const BLOCO_DAS_MEDIDAS = blocoDeMedida('Medidas da base', MEDIDAS.map(m => m.rotulo));

export const BLOCO_DO_ENGANO = blocoDeMedida(
  'Onde a média engana', [ROTULO_RAZAO, ROTULO_CHEGAM, ROTULO_TOTAL]);

/* ── Os blocos de distribuição de frequências (requisito 5.3) ─────────────── */

export const COL_FREQUENCIA = 'Frequência';
export const COL_RELATIVA = 'Frequência relativa';
export const COL_ACUMULADA = 'Acumulada';

const COLUNAS_DE_FREQUENCIA = [COL_FREQUENCIA, COL_RELATIVA, COL_ACUMULADA];

/**
 * A largura das classes de altura.
 *
 * Dez centímetros dá oito classes sobre uma amplitude de setenta e quatro —
 * o bastante para a forma aparecer e pouco o bastante para caber na tela.
 * Uma classe por centímetro devolveria quase uma linha por pessoa, que é a
 * lista com outro nome; uma de meio metro devolveria duas linhas, que não
 * mostra forma nenhuma.
 */
export const LARGURA_DA_CLASSE = 0.1;

/**
 * Um bloco de frequências, sobre uma coluna.
 *
 * É função, e não constante, porque as linhas dele saem **do dado**: as seis
 * unidades vêm do clube e as classes de altura vêm da amplitude medida. Um
 * bloco escrito à mão passaria a discordar da base no dia em que alguém
 * mudasse uma altura, e discordaria em silêncio — a conferência leria a linha
 * de uma classe que não existe mais e devolveria vermelho com a conta certa na
 * tela.
 */
function blocoDeFrequencia(
  titulo: string,
  linhas: { rotulo: string; absoluta: number; relativa: number; acumulada: number }[],
): BlocoDeContas {
  const por = new Map(linhas.map(l => [l.rotulo, l]));
  return {
    titulo,
    rotulos: linhas.map(l => l.rotulo),
    colunas: COLUNAS_DE_FREQUENCIA,
    /*
      Só a frequência tem função obrigatória. A relativa é uma divisão e a
      acumulada é uma soma — as duas se escrevem de mais de um jeito, e cobrar
      um deles mediria ter adivinhado o nosso. O que continua valendo para as
      três é a guarda de referência: célula que não aponta para lugar nenhum é
      número digitado com um sinal de igual na frente.
    */
    funcoes: (_linha, coluna) => (coluna === COL_FREQUENCIA ? ['CONT.SE'] : []),
    esperado: (_base, linha, coluna) => {
      const l = por.get(linha);
      if (!l) return null;
      if (coluna === COL_FREQUENCIA) return l.absoluta;
      if (coluna === COL_RELATIVA) return l.relativa;
      return l.acumulada;
    },
  };
}

/** A distribuição das seis unidades: contagem de uma variável qualitativa. */
export function blocoDasUnidades(base: Formulario): BlocoDeContas {
  return blocoDeFrequencia(
    'Distribuição por unidade',
    frequenciasDe(colunaDe(base, CAMPO_UNIDADE), UNIDADES_DO_CLUBE),
  );
}

/**
 * A distribuição da altura: uma variável **contínua**, que se agrupa em
 * classes.
 *
 * Contar valor a valor uma coluna de alturas devolve quase uma linha por
 * pessoa — quarenta e oito linhas de "1", que é uma lista com outro nome.
 * Medida não se conta, se agrupa: é aqui que a classificação do módulo 1
 * passa a valer alguma coisa.
 *
 * A contagem por classe é `CONT.SE` duas vezes — quantos abaixo do teto menos
 * quantos abaixo do piso —, que é como se faz sem `CONT.SES`. A classe é
 * fechada embaixo e **aberta em cima**: `<teto` e não `<=teto`, senão o valor
 * de fronteira entraria em duas classes e a soma passaria do total sem nada
 * estourar.
 */
export function blocoDasClasses(base: Formulario): BlocoDeContas {
  return blocoDeFrequencia(
    'Distribuição da altura, por classe',
    classesDe(colunaDe(base, CAMPO_ALTURA), LARGURA_DA_CLASSE),
  );
}

/* ── As três perguntas e os três gráficos (requisito 6) ──────────────────── */

export interface PerguntaComGrafico {
  /** A aba em que ela mora. */
  aba: string;
  /** A pergunta, como a liderança a faria. */
  pergunta: string;
  /** O tipo que a responde, e só ele. */
  tipo: TipoDeGrafico;
  /** A chave do campo em que a justificativa é escrita. */
  chave: string;
  /** O conteúdo com que a aba chega: cabeçalho e uma linha por categoria. */
  dados: (base: Formulario) => string[][];
}

/**
 * Três perguntas sobre a mesma base, e o gráfico que responde a cada uma.
 *
 * ── O que o requisito pede é a escolha, e não a conta ────────────────────
 * "Escolher e produzir o gráfico adequado a três perguntas distintas". O dado
 * de cada aba chega escrito, porque ele já foi produzido: a composição é a
 * distribuição do módulo 4, a comparação é a tabela do módulo 5, e a chegada
 * por semana é o que a secretaria do clube apurou. Mandar refazer as contas
 * aqui mediria de novo o que já foi medido, e a chegada por semana nem se
 * refaz — esta planilha não tem função de data, e é assim que uma planilha de
 * clube de verdade costuma estar.
 *
 * ── E os três tipos não são intercambiáveis ──────────────────────────────
 * A pizza responde **de que o todo é feito**, e só faz sentido quando as
 * partes somam o todo. As colunas respondem **quem é maior**, e servem a
 * qualquer conjunto de categorias. A linha responde **o que mudou ao longo do
 * tempo**, e ligar duas categorias com um traço afirma que uma virou a outra.
 *
 * Desenhados errado, os três não dão erro nenhum: a pizza das médias por
 * unidade soma 17,1 e mostra fatias perfeitamente plausíveis de um todo que
 * não existe.
 */
export const PERGUNTAS_DO_GRAFICO: PerguntaComGrafico[] = [
  {
    aba: 'Composição',
    pergunta: 'De que unidades o acampamento é feito?',
    tipo: 'pizza',
    chave: 'por-que-pizza',
    dados: base => [
      ['Unidade', 'Inscritos'],
      ...frequenciasDe(colunaDe(base, CAMPO_UNIDADE), UNIDADES_DO_CLUBE)
        .map(l => [l.rotulo, String(l.absoluta)]),
    ],
  },
  {
    aba: 'Comparação',
    pergunta: 'Qual unidade já foi a mais acampamentos?',
    tipo: 'colunas',
    chave: 'por-que-colunas',
    dados: base => {
      const medias = medidaPorGrupo(base, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
      return [
        ['Unidade', 'Média de acampamentos'],
        ...UNIDADES_DO_CLUBE.map(u => [u, mostrarNumero(medias.get(u) ?? 0)]),
      ];
    },
  },
  {
    aba: 'Evolução',
    pergunta: 'Como as inscrições chegaram ao longo do prazo?',
    tipo: 'linha',
    chave: 'por-que-linha',
    dados: base => [
      ['Semana', 'Inscrições'],
      ...porSemana(base).map(s => [s.rotulo, String(s.inscricoes)]),
    ],
  },
];

function abaDaPergunta(p: PerguntaComGrafico, base: Formulario): Planilha {
  const conteudo = p.dados(base);
  return planilhaDe(p.aba, conteudo, {
    tabela: { l1: 0, c1: 0, l2: conteudo.length - 1, c2: 1 },
  });
}

/** A faixa que o gráfico daquela aba tem de ler: do cabeçalho ao fim. */
export function faixaDoGrafico(p: PerguntaComGrafico, base: Formulario): Faixa {
  return { l1: 0, c1: 0, l2: p.dados(base).length - 1, c2: 1 };
}

/* ── Os valores das pontas (requisitos 2.5 e 5.6) ────────────────────────── */

export interface Candidato {
  campo: string;
  /** O valor como a coluna o guarda. */
  valor: string;
  /** Quantas pessoas têm exatamente este valor. */
  quantos: number;
  /** De qual ponta da coluna ele veio. */
  ponta: 'alto' | 'baixo';
}

/** Quantos valores distintos de cada ponta a lição põe à mesa. */
export const PONTAS_POR_COLUNA = 3;

export const chaveDoCandidato = (campo: string, valor: string) => `${campo}:${valor}`;

/**
 * Os valores das pontas de cada coluna quantitativa.
 *
 * ── Por que as pontas, e não os atípicos ─────────────────────────────────
 * Pôr à mesa só os quatro atípicos seria entregar a resposta: a tarefa
 * passaria a ser decidir o que fazer com valores que alguém já apontou, e o
 * requisito 5.6 manda **identificar** antes de decidir.
 *
 * O que se põe à mesa são os três maiores e os três menores valores distintos
 * de cada coluna — dezoito ao todo, dos quais quatro são atípicos. A coluna de
 * idade contribui com seis pontas e nenhum atípico, e é isso que faz a lição:
 * alguém tem de ser o mais novo do clube, e isso não o torna estranho.
 *
 * Distintos, e não as três maiores linhas: seis desbravadores têm quinze anos,
 * e "as três maiores" devolveria quinze três vezes.
 */
export function candidatosDasPontas(base: Formulario): Candidato[] {
  const fora: Candidato[] = [];
  for (const campo of COLUNAS_MEDIDAS) {
    const valores = colunaDe(base, campo);
    const contagem = new Map<number, number>();
    for (const n of numerosDe(valores)) contagem.set(n, (contagem.get(n) ?? 0) + 1);
    const distintos = [...contagem.keys()].sort((a, b) => a - b);

    const escrever = (n: number, ponta: 'alto' | 'baixo') => {
      /* O valor volta como a coluna o guarda, e não como o número o imprime:
         1,05 na planilha é "1,05", e um "1.05" aqui não casaria com nada. */
      const texto = valores.find(v => numeroDoTexto(v) === n) ?? String(n);
      fora.push({ campo, valor: texto, quantos: contagem.get(n) ?? 0, ponta });
    };
    distintos.slice(0, PONTAS_POR_COLUNA).forEach(n => escrever(n, 'baixo'));
    distintos.slice(-PONTAS_POR_COLUNA).reverse().forEach(n => escrever(n, 'alto'));
  }
  return fora;
}

/**
 * O que cada candidato é, de verdade.
 *
 * Sai de `ATIPICOS`, que declara a **decisão**, cruzado com o valor que a
 * resposta daquele id guarda. A cerca de Tukey já confere, em
 * `baseDoAcampamento.test.ts`, que a lista declarada é exatamente a que a
 * conta acusa — então aqui não há segunda fonte, há a mesma lida por chave.
 */
export function julgamentoCerto(base: Formulario, campo: string, valor: string): Julgamento {
  for (const a of ATIPICOS) {
    if (a.campo !== campo) continue;
    const r = respostasReais(base).find(x => x.id === a.resposta);
    if (r && valorDa(r, campo) === valor) return a.mantem ? 'mantem' : 'exclui';
  }
  return 'normal';
}

/* ── O bloco da adesão (requisitos 2.6 e 4) ──────────────────────────────── */

export const COL_MEMBROS = 'Membros';
export const COL_FORA = 'Ficaram de fora';
export const COL_TAXA = 'Taxa de adesão';

/**
 * As duas leituras da mesma coisa, lado a lado — o requisito 4 inteiro.
 *
 * `Ficaram de fora` é o **número absoluto**: quantas vagas o acampamento
 * perdeu naquela unidade. `Taxa de adesão` é a **taxa**: que parte da unidade
 * de fato veio. As duas saem do mesmo par de números e nenhuma está errada.
 *
 * O que elas fazem é responder a perguntas diferentes — e nesta base elas
 * ordenam ao contrário. O Falcão tem o maior número de ausentes **e** a melhor
 * taxa: quem ordena pela coluna de ausentes conclui que é a unidade que mais
 * deixa gente para trás, e quem divide conclui o contrário. Só uma das duas
 * responde "qual conselheiro mobilizou melhor a unidade dele", que é a
 * pergunta que a lição faz.
 *
 * Nenhuma das duas colunas tem função obrigatória: a subtração e a divisão se
 * escrevem de um jeito só, e não há nome de função para cobrar. Quem segura é
 * a guarda de referência — célula que não aponta para lugar nenhum é número
 * digitado — mais o valor.
 */
export function blocoDaAdesao(base: Formulario): BlocoDeContas {
  const adesao = new Map(adesaoPorUnidade(base).map(a => [a.unidade, a]));
  return {
    titulo: 'Adesão por unidade',
    rotulos: [...UNIDADES_DO_CLUBE],
    colunas: [COL_MEMBROS, COL_INSCRITOS, COL_FORA, COL_TAXA],
    funcoes: (_linha, coluna) => (coluna === COL_INSCRITOS ? ['CONT.SE'] : []),
    esperado: (_base, linha, coluna) => {
      const a = adesao.get(linha);
      if (!a) return null;
      if (coluna === COL_MEMBROS) return a.membros;
      if (coluna === COL_INSCRITOS) return a.inscritos;
      if (coluna === COL_FORA) return a.fora;
      return a.taxa;
    },
  };
}

/** A unidade que mais deixou gente de fora, em número absoluto. */
export const maisAusentes = (base: Formulario) =>
  [...adesaoPorUnidade(base)].sort((a, b) => b.fora - a.fora)[0].unidade;

/** A unidade que levou a maior parte da própria gente. */
export const melhorTaxa = (base: Formulario) =>
  [...adesaoPorUnidade(base)].sort((a, b) => (b.taxa ?? 0) - (a.taxa ?? 0))[0].unidade;

/* ── O bloco de comparação entre grupos (requisitos 5.4 e 5.5) ───────────── */

export const COL_INSCRITOS = 'Inscritos';
export const COL_MEDIA_ACAMPAMENTOS = 'Média de acampamentos';
export const COL_MEDIA_IDADE = 'Média de idade';

/**
 * As seis unidades, lado a lado.
 *
 * ── Por que a média por grupo sai de duas funções ────────────────────────
 * Esta planilha não tem `MÉDIASE`, e é o que toda planilha antiga não tem: a
 * média de um grupo se escreve como `SOMASE` dividido por `CONT.SE`. Não é
 * limitação a contornar — é o idioma, e quem o aprende sabe montar a média de
 * qualquer recorte, inclusive os que nenhuma função pronta cobre.
 *
 * O denominador pode apontar para a célula de Inscritos, que a pessoa acabou
 * de calcular na coluna ao lado, e é a melhor prática: por isso só o `SOMASE` é
 * cobrado. Exigir as duas reprovaria quem escreveu a fórmula melhor.
 */
export function blocoDaComparacao(base: Formulario): BlocoDeContas {
  const inscritos = medidaPorGrupo(base, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'CONT.NÚM');
  const acampamentos = medidaPorGrupo(base, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
  const idades = medidaPorGrupo(base, CAMPO_UNIDADE, CAMPO_IDADE, 'MÉDIA');
  return {
    titulo: 'Comparação entre as unidades',
    rotulos: [...UNIDADES_DO_CLUBE],
    colunas: [COL_INSCRITOS, COL_MEDIA_ACAMPAMENTOS, COL_MEDIA_IDADE],
    funcoes: (_linha, coluna) => (coluna === COL_INSCRITOS ? ['CONT.SE'] : ['SOMASE']),
    esperado: (_base, linha, coluna) => {
      if (coluna === COL_INSCRITOS) return inscritos.get(linha) ?? null;
      if (coluna === COL_MEDIA_ACAMPAMENTOS) return acampamentos.get(linha) ?? null;
      return idades.get(linha) ?? null;
    },
  };
}

/**
 * A unidade cuja gente já foi a mais acampamentos.
 *
 * Sai da conta, e não de uma constante: com o nome escrito à mão, uma mudança
 * na base deixaria a resposta certa reprovando e a errada passando, sem nada
 * acusar.
 */
export function unidadeMaisExperiente(base: Formulario): string {
  const medias = medidaPorGrupo(base, CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS, 'MÉDIA');
  return [...medias.entries()].sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0][0];
}

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

/** O bloco a que um rótulo pertence. */
export const blocoDoRotulo = (blocos: BlocoDeContas[], rotulo: string) =>
  blocos.find(b => b.rotulos.includes(rotulo));

/** A coluna, dentro de um bloco, em que um cabeçalho está. */
export const colunaDoBloco = (bloco: BlocoDeContas, cabecalho: string) =>
  1 + bloco.colunas.indexOf(cabecalho);

/** A coluna, na aba de cálculos, em que uma variável de medida é pedida. */
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
export function cadernoDaAnalise(
  base: Formulario,
  blocos: BlocoDeContas[] = [BLOCO_DAS_MEDIDAS],
  comElenco = false,
  comPerguntas = false,
): Caderno {
  const planilhas = [abaDeRespostas(base), abaDeCalculos(blocos)];
  /* A aba do elenco só aparece na lição que precisa dela: uma aba a mais na
     tela é uma pergunta a mais, e o módulo 2 não tem o que fazer com ela. */
  if (comElenco) planilhas.push(abaDoElenco());
  if (comPerguntas) for (const p of PERGUNTAS_DO_GRAFICO) planilhas.push(abaDaPergunta(p, base));
  return { planilhas, ativa: 0 };
}

function abaDoElenco(): Planilha {
  const conteudo = [
    ['Unidade', 'Membros', 'Conselheiro'],
    ...ELENCO.map(u => [u.nome, String(u.membros), u.conselheiro]),
  ];
  return planilhaDe(ABA_UNIDADES, conteudo, {
    tabela: { l1: 0, c1: 0, l2: ELENCO.length, c2: 2 },
  });
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
  const conteudo: string[][] = [];
  for (const b of blocos) {
    if (conteudo.length) conteudo.push([]);
    conteudo.push([b.titulo]);
    conteudo.push(['', ...b.colunas]);
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

/**
 * Uma linha do bloco escrita **inteira**, com fórmula e resultado conferindo
 * em cada coluna.
 *
 * Ela percorre as colunas do bloco, e não uma lista fixa: o bloco de medidas
 * tem três, o de frequências tem outras três, e o próximo terá as dele.
 */
function linhaCompleta(c: ContextoDaAnalise, rotulo: string): boolean {
  const bloco = blocoDoRotulo(c.blocos, rotulo);
  if (!bloco) return false;
  return bloco.colunas.every(coluna =>
    contaConfere(c, rotulo, colunaDoBloco(bloco, coluna),
      bloco.funcoes(rotulo, coluna), bloco.esperado(c.base, rotulo, coluna)));
}

/** Todas as linhas de um bloco, escritas. */
const blocoCompleto = (c: ContextoDaAnalise, bloco: BlocoDeContas) =>
  bloco.rotulos.every(r => linhaCompleta(c, r));

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
/**
 * O que a região de dados da aba de respostas contém, como assinatura.
 *
 * ── Ela é exportada porque a tela precisa da mesma conta ────────────────
 * A meta pergunta "a base continua inteira?" e a tela pergunta "o dado acabou
 * de mudar?" — são a mesma leitura, de dois lados. Duas cópias divergiriam no
 * primeiro ajuste, e a divergência apareceria como uma tarefa que não fecha
 * com a planilha certa na tela.
 *
 * ── As linhas entram como conjunto, e não em ordem ──────────────────────
 * Classificar é o gesto que duas lições mandam fazer: "ordene a coluna na aba
 * Respostas e olhe as duas pontas". Ordenar leva a linha inteira — nenhum
 * registro muda, só a ordem deles —, e comparando em ordem quem seguisse o
 * passo a passo via duas tarefas ficarem vermelhas por ter feito exatamente o
 * que a lição pediu. Ordem de linha não é dado.
 *
 * O que continua aparecendo é o que mexe no dado: apagar uma linha muda
 * quantas há, digitar por cima troca uma linha por outra que não existia, e
 * limpar uma célula esvazia um campo.
 */
export function assinaturaDaBase(p: Planilha): string {
  const linhas: string[] = [];
  for (let l = PRIMEIRA_LINHA; l < p.celulas.length; l++) {
    const campos: string[] = [];
    for (let col = 0; col <= camposDaBase().length; col++) campos.push(escritoEm(p, l, col));
    linhas.push(campos.join('\u0000'));
  }
  return linhas.sort().join('\u0001');
}

function baseIntacta(c: ContextoDaAnalise): boolean {
  const p = aba(c, ABA_RESPOSTAS);
  const antes = abaDe(c.cadernoAntes, ABA_RESPOSTAS);
  if (!p || !antes) return false;

  /*
    A região inteira, e não só a coluna de nomes: olhando um campo só, apagar
    um nome reprovava e apagar a idade de alguém passava — e as duas mexem no
    dado de que toda conta da lição depende. "A base não foi mexida" quer dizer
    a base, e quem a lê é `assinaturaDaBase`, que a tela também lê.
  */
  return assinaturaDaBase(p) === assinaturaDaBase(antes);
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
    feita: c => linhaCompleta(c, 'Média') && linhaCompleta(c, 'Mediana'),
  },
  {
    id: 'a-moda-das-tres',
    titulo: 'A moda das três, e reparar que uma delas não quer dizer nada',
    detalhe: 'A planilha devolve um número nas três, e num deles esse número descreve duas pessoas em quarenta e oito. Moda só significa alguma coisa quando o valor se repete bastante.',
    onde: 'Na linha da Moda, nas três colunas — e depois no filtro da aba Respostas.',
    passos: [
      'Escreva =MODO( para as três colunas. Saem três números, todos plausíveis.',
      'Agora conte quantas pessoas têm exatamente cada um: na aba Respostas, ligue o Filtro na guia Dados, abra a setinha da coluna e escolha o valor da moda.',
      'A régua de baixo diz quantos registros sobraram. Faça com a idade e faça com a altura.',
      'Uma se repete dezenas de vezes; a outra, duas. A planilha não avisa a diferença: quem pergunta é você.',
    ],
    feita: c => linhaCompleta(c, 'Moda') && viu(c, VIU_QUE_A_MODA_NAO_SERVE),
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
    feita: c => linhaCompleta(c, 'Amplitude') && linhaCompleta(c, 'Desvio padrão'),
  },
  {
    id: 'a-conta-se-refaz',
    titulo: 'Ver a conta se refazer quando um dado muda',
    detalhe: 'É o que separa uma fórmula de um número digitado: o número digitado está certo hoje e continua mostrando o de hoje amanhã.',
    onde: 'Na aba Respostas, mudando uma altura e voltando para Cálculos.',
    passos: [
      'Vá à aba Respostas e mude a altura de alguém.',
      'Volte à aba Cálculos e veja a média andar.',
      'Depois aperte Ctrl+Z para devolver o dado ao que era: a base é dado, e quatro lições desta vereda cobram ela inteira.',
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
    feita: c => linhaCompleta(c, ROTULO_RAZAO) && baseIntacta(c),
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
    feita: c => linhaCompleta(c, ROTULO_CHEGAM) && linhaCompleta(c, ROTULO_TOTAL) && baseIntacta(c),
  },
  {
    id: 'viu-a-coluna-que-engana',
    titulo: 'Dizer em qual das três colunas a média descreve mal',
    detalhe: 'E é uma só. Nas outras duas a média está ótima — quem sai daqui achando que média sempre mente deixa de usar uma medida boa.',
    onde: 'No caderno da análise, na pergunta de três alternativas.',
    passos: [
      'Olhe a linha da razão: duas colunas ficam quase em 1, e uma fica bem acima.',
      'Olhe a coluna que ficou acima na aba Respostas, ordenada, e veja quem está no fim dela.',
      'São três pessoas de verdade, e não erro de digitação: elas puxam a média e não mexem na mediana.',
    ],
    feita: c => viu(c, VIU_A_COLUNA_QUE_ENGANA),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — Distribuição de frequências (requisito 5.3)
   ──────────────────────────────────────────────────────────────────────── */

export const VIU_QUE_MEDIDA_NAO_SE_CONTA = 'viu-que-medida-nao-se-conta-valor-a-valor';

/**
 * ── As duas distribuições não são a mesma lição duas vezes ───────────────
 * A da unidade conta **categorias**: seis linhas, uma por unidade, e cada
 * resposta cai numa delas. A da altura não pode: contar valor a valor devolve
 * quase uma linha por pessoa — quarenta e oito linhas de "1", que é a lista
 * com outro nome.
 *
 * É aqui que a classificação do módulo 1 passa a valer alguma coisa. Quem
 * marcou a altura como contínua já sabe por que ela precisa de classes; quem
 * marcou errado descobre agora, contando.
 */
export const METAS_DAS_FREQUENCIAS: Meta[] = [
  {
    id: 'frequencia-por-unidade',
    titulo: 'Quantos de cada unidade, em número, em parte do todo e acumulado',
    detalhe: 'A frequência diz quantos; a relativa diz que parte do clube eles são; a acumulada diz quantos já foram contados até ali.',
    onde: 'Na aba Cálculos, no bloco "Distribuição por unidade".',
    passos: [
      'Na coluna Frequência, use =CONT.SE( sobre a coluna de unidade da aba Respostas, com o nome da unidade como critério.',
      'Na relativa, divida a frequência pelo total — e aponte para a célula do total, não digite 48.',
      'Na acumulada, some a frequência desta linha com a acumulada da linha de cima.',
      'A última acumulada tem de dar o total: é assim que você confere a tabela inteira.',
    ],
    feita: c => {
      const bloco = c.blocos.find(b => b.titulo.startsWith('Distribuição por unidade'));
      return Boolean(bloco) && blocoCompleto(c, bloco!) && baseIntacta(c);
    },
  },
  {
    id: 'frequencia-da-altura-por-classe',
    titulo: 'A altura distribuída em classes de dez centímetros',
    detalhe: 'Medida não se conta valor a valor: quarenta e oito alturas dariam quarenta e oito linhas de um. Agrupar é o que faz a forma aparecer.',
    onde: 'No bloco "Distribuição da altura, por classe".',
    passos: [
      'Cada classe vai de um piso até um teto, fechada embaixo e aberta em cima.',
      'Conte com dois =CONT.SE(: quantos estão abaixo do teto, menos quantos estão abaixo do piso.',
      'Aberta em cima importa: com <= nos dois lados, quem está exatamente na fronteira entraria em duas classes e a soma passaria do total.',
      'Confira pela acumulada da última classe — ela tem de bater com o total.',
    ],
    feita: c => {
      const bloco = c.blocos.find(b => b.titulo.startsWith('Distribuição da altura'));
      return Boolean(bloco) && blocoCompleto(c, bloco!) && baseIntacta(c);
    },
  },
  {
    id: 'viu-por-que-a-altura-precisa-de-classe',
    titulo: 'Dizer por que a altura precisou de classes e a unidade não',
    detalhe: 'É a diferença que você marcou no módulo 1, agora fazendo diferença: uma se conta, a outra se mede.',
    onde: 'No caderno da análise, na pergunta de quatro alternativas.',
    passos: [
      'Olhe a coluna da unidade: seis valores diferentes em quarenta e oito respostas.',
      'Olhe a coluna da altura: quase uma altura diferente por pessoa.',
      'Uma tabela com quarenta e oito linhas de "1" não mostra forma nenhuma — e forma é o que uma distribuição serve para mostrar.',
    ],
    feita: c => viu(c, VIU_QUE_MEDIDA_NAO_SE_CONTA),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — Comparar grupos, e o resumo que confere (requisitos 5.4 e 5.5)
   ──────────────────────────────────────────────────────────────────────── */

export const CHAVE_MAIS_EXPERIENTE = 'unidade-mais-experiente';

/**
 * O resumo do requisito 5.5 lê a mesma coisa que a conta do 5.4, e os dois
 * **têm** de concordar.
 *
 * É o par que dá sentido à tabela dinâmica: ela não é um jeito mais bonito de
 * mostrar o que já se sabe, é uma segunda leitura do mesmo dado. Discordando,
 * uma das duas está errada — e é aí que se aprende a desconfiar do resumo que
 * chegou pronto na reunião.
 *
 * A conferência é por proximidade, e não por igualdade: a média sai de uma
 * divisão dos dois lados, e dois caminhos até o mesmo número devolvem bits
 * diferentes na última casa.
 */
function resumoConfere(c: ContextoDaAnalise): boolean {
  const respostas = aba(c, ABA_RESPOSTAS);
  const t = respostas?.resumo;
  if (!respostas || !t) return false;

  /*
    Ele tem de ler a aba de respostas, agrupar por unidade e resumir os
    acampamentos **por média**.

    A conferência é da configuração, e não dos números que ele mostra. Ela já
    foi dos números uma vez, comparados com a base — e isso é comparar o
    resumo com uma coisa que ele nunca leu: um resumo pode estar
    desatualizado e mesmo assim bater com a base, se a pessoa mexeu na aba e
    não atualizou. Somar em vez de tirar média devolve um número plausível
    sobre outra pergunta, e resumir a idade no lugar dos acampamentos também.
  */
  if (t.origem.planilha !== ABA_RESPOSTAS) return false;
  if (t.linha !== colunaDoCampo(CAMPO_UNIDADE)) return false;
  if (t.valor.coluna !== colunaDoCampo(CAMPO_ACAMPAMENTOS)) return false;
  if (t.valor.como !== 'media') return false;

  /*
    E em dia: retrato velho mostra o que a aba era. É o defeito que a CC-ES008
    nomeia — o resumo continua relatando o erro depois de consertado —, e aqui
    ele volta pelo outro lado, com o número continuando plausível.
  */
  return resumoEmDia(c.caderno, t);
}

export const METAS_DA_COMPARACAO: Meta[] = [
  {
    id: 'comparacao-entre-unidades',
    titulo: 'As seis unidades lado a lado: quantos, quanta experiência, que idade',
    detalhe: 'Comparar grupos é o que transforma uma lista de quarenta e oito pessoas em alguma coisa que a liderança consegue ler.',
    onde: 'Na aba Cálculos, no bloco "Comparação entre as unidades".',
    passos: [
      'Em Inscritos, =CONT.SE( sobre a coluna de unidade, com o nome da unidade como critério.',
      'Esta planilha não tem MÉDIASE: a média de um grupo é =SOMASE( dividido pela contagem.',
      'No SOMASE, a primeira faixa é a das unidades, o critério é o nome, e a terceira faixa é a coluna que você quer somar.',
      'Para dividir, aponte para a célula de Inscritos que você acabou de calcular ao lado.',
    ],
    feita: c => {
      const bloco = c.blocos.find(b => b.titulo.startsWith('Comparação entre'));
      return Boolean(bloco) && blocoCompleto(c, bloco!) && baseIntacta(c);
    },
  },
  {
    id: 'resumo-que-confere',
    titulo: 'Uma tabela dinâmica da mesma comparação, e ela bate com a sua conta',
    detalhe: 'O resumo não é um jeito mais bonito de mostrar o que você já sabe: é uma segunda leitura do mesmo dado. Se as duas discordarem, uma está errada.',
    onde: 'Na aba Respostas, em Inserir e depois Tabela Dinâmica.',
    passos: [
      'Escolha a coluna de unidade para as linhas do resumo.',
      'Escolha a coluna de acampamentos para o valor, resumido por média.',
      'Compare linha por linha com o bloco que você calculou na aba Cálculos.',
      'Se alguma não bater, é porque uma das duas está lendo coisa diferente — e vale a pena achar qual.',
    ],
    feita: c => resumoConfere(c) && baseIntacta(c),
  },
  {
    id: 'a-unidade-mais-experiente',
    titulo: 'Dizer qual unidade já foi a mais acampamentos, em média',
    detalhe: 'E repare que não é a maior. Contar quantos são responde uma pergunta; tirar a média responde outra.',
    onde: 'No caderno da análise, escolhendo entre as seis unidades.',
    passos: [
      'Olhe a coluna de média de acampamentos, e não a de inscritos.',
      'A unidade com mais gente não é a com mais experiência — são perguntas diferentes.',
      'É a mesma diferença que o módulo seguinte vai levar adiante: número absoluto e taxa.',
    ],
    feita: c => (c.textos[CHAVE_MAIS_EXPERIENTE] ?? '').trim() === unidadeMaisExperiente(c.base),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — Taxa e número absoluto (requisitos 2.6 e 4)
   ──────────────────────────────────────────────────────────────────────── */

export const CHAVE_MOBILIZOU_MELHOR = 'unidade-que-mobilizou-melhor';
export const VIU_AS_DUAS_LEITURAS = 'viu-as-duas-leituras-da-mesma-coisa';

/**
 * ── O caso está armado na base, e não no enunciado ───────────────────────
 * O Falcão tem dezesseis membros e treze inscritos: **três** ausentes contra
 * dois de todas as outras, e ao mesmo tempo a melhor taxa das seis. Quem
 * ordena pela coluna de ausentes conclui que é a unidade que mais deixa gente
 * para trás; quem divide conclui o contrário, e é o contrário que é verdade.
 *
 * Nenhuma das duas colunas está errada. Elas respondem a perguntas diferentes,
 * e só uma responde à pergunta que foi feita — que é exatamente o que o
 * requisito 4 manda demonstrar, e não explicar.
 */
export const METAS_DA_ADESAO: Meta[] = [
  {
    id: 'adesao-por-unidade',
    titulo: 'Quantos ficaram de fora, e que parte da unidade veio',
    detalhe: 'O formulário só sabe de quem se inscreveu. Quantos são ao todo vem da secretaria do clube — e sem esse número não há taxa, porque taxa é uma divisão.',
    onde: 'Na aba Cálculos, no bloco "Adesão por unidade", com a aba Unidades ao lado.',
    passos: [
      'Em Membros, aponte para a aba Unidades — não digite o número, que ele muda quando alguém entra no clube.',
      'Em Inscritos, =CONT.SE( sobre a coluna de unidade da aba Respostas.',
      'Ficaram de fora é membros menos inscritos.',
      'A taxa é inscritos dividido por membros. Deixe como número entre zero e um; quem transforma em porcentagem é o formato.',
    ],
    feita: c => {
      const bloco = c.blocos.find(b => b.titulo.startsWith('Adesão por unidade'));
      return Boolean(bloco) && blocoCompleto(c, bloco!) && baseIntacta(c);
    },
  },
  {
    id: 'viu-as-duas-leituras',
    titulo: 'Reparar que as duas colunas ordenam ao contrário',
    detalhe: 'A unidade com mais ausentes é a mesma com a melhor taxa. As duas contas estão certas — e levam a conclusões opostas.',
    onde: 'Na aba Cálculos, clicando no maior número de cada uma das duas colunas.',
    passos: [
      'Ache o maior número da coluna "Ficaram de fora" e clique nele.',
      'Agora ache o maior número da coluna "Taxa de adesão" e clique nele também.',
      'É a mesma linha. Ela é a maior unidade do clube: três de dezesseis é menos que dois de oito.',
    ],
    feita: c => viu(c, VIU_AS_DUAS_LEITURAS),
  },
  {
    id: 'qual-mobilizou-melhor',
    titulo: 'Responder qual conselheiro mobilizou melhor a unidade dele',
    detalhe: 'Esta é a pergunta, e só uma das duas colunas responde a ela. A outra responde quantas vagas o acampamento perdeu — que também importa, e para outra coisa.',
    onde: 'No caderno da análise, escolhendo entre as seis unidades.',
    passos: [
      'Mobilizar bem é levar a maior parte da própria gente, e isso é a taxa.',
      'O número absoluto responde outra coisa: quantas vagas ficaram vazias.',
      'Quem compra comida quer o número absoluto; quem elogia o conselheiro quer a taxa.',
    ],
    feita: c => (c.textos[CHAVE_MOBILIZOU_MELHOR] ?? '').trim() === melhorTaxa(c.base),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — Valores atípicos (requisitos 2.5 e 5.6)
   ──────────────────────────────────────────────────────────────────────── */

export const CHAVE_POR_QUE_FICA = 'por-que-o-veterano-fica';
export const CHAVE_POR_QUE_SAI = 'por-que-a-altura-sai';

/** O mínimo que uma justificativa escrita precisa ter para ser uma. */
export const LETRAS_DA_JUSTIFICATIVA = 40;

/**
 * ── Os dois atípicos são de naturezas opostas, e é isso que faz a lição ──
 * Três veteranos com doze, catorze e dezoito acampamentos são **gente**. Estão
 * longe do resto porque estão mesmo, e apagá-los para a média "melhorar" é
 * apagar a parte mais interessante do clube — que é a coisa mais comum que se
 * faz com um valor atípico.
 *
 * Uma altura de 1,05 m é **digitação**: o 1,50 com os algarismos trocados. Não
 * é ninguém de 1,05 m, e ela sai da análise da altura. Sair não é apagar a
 * linha: o Davi continua inscrito, com camiseta P e três diárias.
 *
 * Uma base com atípico de um tipo só faria "decidir com justificativa" virar
 * "apagar o que está longe", que é a regra errada e a mais fácil de aprender.
 *
 * ── E a maioria das pontas é normal ──────────────────────────────────────
 * Dezoito valores à mesa e quatro atípicos. A coluna de idade dá seis pontas e
 * nenhum: alguém tem de ser o mais novo do clube, e isso não o torna estranho.
 * Sem esse lado, a lição seria "o que está no extremo é suspeito".
 */
export const METAS_DOS_ATIPICOS: Meta[] = [
  {
    id: 'toda-ponta-julgada',
    titulo: 'Um veredito para cada valor das pontas',
    detalhe: 'São os três maiores e os três menores de cada coluna. A maioria é gente comum — alguém tem de ser o mais novo.',
    onde: 'No caderno da análise, na lista de valores das pontas.',
    passos: [
      'Ordene a coluna na aba Respostas e olhe as duas pontas.',
      'Para cada valor, pergunte: isto é uma pessoa possível?',
      'Quinze anos é possível. Um metro e cinco num desbravador de onze, não.',
    ],
    feita: c => candidatosDasPontas(c.base).every(k =>
      c.julgamentos[chaveDoCandidato(k.campo, k.valor)] !== undefined),
  },
  {
    id: 'os-vereditos-certos',
    titulo: 'E os dezoito certos',
    detalhe: 'Estar no extremo não é ser atípico, e ser atípico não quer dizer sair. São três perguntas diferentes.',
    onde: 'Na mesma lista.',
    passos: [
      'Normal: o valor é possível, só está na ponta.',
      'Fica: é estranho e é verdadeiro — some à análise e relate a mediana ao lado da média.',
      'Sai: é estranho porque está errado, e o que se tira é a célula, não a pessoa.',
    ],
    feita: c => candidatosDasPontas(c.base).every(k =>
      c.julgamentos[chaveDoCandidato(k.campo, k.valor)]
        === julgamentoCerto(c.base, k.campo, k.valor)),
  },
  {
    id: 'as-duas-justificativas',
    titulo: 'Escrever por que um fica e por que o outro sai',
    detalhe: 'O requisito pede a decisão por escrito, e as duas razões são opostas: uma é sobre gente de verdade, a outra é sobre um dedo que escorregou.',
    onde: 'No caderno da análise, nos dois campos de texto abaixo da lista.',
    passos: [
      'No que fica: diga por que você acredita que o número é verdadeiro.',
      'No que sai: diga o que você acha que aconteceu, e o que você faria para confirmar.',
      'As duas razões não podem ser a mesma frase — se forem, uma das duas decisões não foi pensada.',
    ],
    feita: c => {
      const fica = texto(c, CHAVE_POR_QUE_FICA);
      const sai = texto(c, CHAVE_POR_QUE_SAI);
      return fica.length >= LETRAS_DA_JUSTIFICATIVA
        && sai.length >= LETRAS_DA_JUSTIFICATIVA
        /* A mesma frase nos dois campos é não ter pensado na diferença, que é
           a lição inteira. */
        && fica !== sai;
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 8 — O gráfico que responde à pergunta (requisito 6)
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Um gráfico desenhado, do tipo certo e sobre a faixa certa.
 *
 * Os eixos **não** entram aqui, e é decisão: quem cobra os nomes dos eixos é a
 * meta ao lado, e escrever a mesma exigência nos dois lugares obrigaria as
 * duas a concordarem para sempre. Uma cobra que o desenho responda à
 * pergunta; a outra, que quem olhar saiba do que ele fala. São duas coisas, e
 * a lista mostra as duas.
 */
function graficoConfere(c: ContextoDaAnalise, p: PerguntaComGrafico): boolean {
  const aba = c.caderno.planilhas.find(q => q.nome === p.aba);
  const g = aba?.grafico;
  if (!g) return false;
  if (g.tipo !== p.tipo) return false;

  const esperada = faixaDoGrafico(p, c.base);
  return g.faixa.l1 === esperada.l1 && g.faixa.l2 === esperada.l2
    && g.faixa.c1 === esperada.c1 && g.faixa.c2 === esperada.c2;
}

export const METAS_DOS_GRAFICOS: Meta[] = [
  {
    id: 'os-tres-graficos',
    titulo: 'Um gráfico em cada aba, do tipo que responde àquela pergunta',
    detalhe: 'Os três tipos desenham sem erro sobre qualquer dado. O que muda é se o desenho responde ou não à pergunta que está escrita no alto da aba.',
    onde: 'Em cada uma das três abas, selecionando as duas colunas e indo em Inserir, Gráfico.',
    passos: [
      'A pergunta de cada aba está no caderno da análise, e a caixa do gráfico a repete quando você a abre naquela aba. Leia antes de escolher o tipo.',
      'Selecione a coluna dos rótulos e a dos números, do cabeçalho até a última linha, antes de abrir a caixa.',
      'De que o todo é feito? É pizza — e ela só serve quando as partes somam o todo.',
      'Quem é maior? São colunas.',
      'O que mudou ao longo do tempo? É linha — e ligar duas unidades com um traço afirmaria que uma virou a outra.',
    ],
    feita: c => PERGUNTAS_DO_GRAFICO.every(p => graficoConfere(c, p)),
  },
  {
    id: 'os-eixos-escritos',
    titulo: 'Os dois eixos de cada gráfico com nome',
    detalhe: 'Gráfico sem eixo identificado não afirma nada: quem olha vê barras de altura diferente e não sabe do quê.',
    onde: 'Na caixa do gráfico, nos campos de eixo.',
    passos: [
      'O eixo de baixo diz o que cada fatia ou coluna é.',
      'O de lado diz em que unidade o número está — pessoas, acampamentos, inscrições.',
      'Numa pizza não há eixo desenhado, e mesmo assim os dois nomes dizem o que ela mostra.',
    ],
    feita: c => PERGUNTAS_DO_GRAFICO.every(p => {
      const g = c.caderno.planilhas.find(q => q.nome === p.aba)?.grafico;
      return Boolean(g?.eixoX.trim()) && Boolean(g?.eixoY.trim());
    }),
  },
  {
    id: 'as-tres-justificativas',
    titulo: 'Escrever por que cada tipo responde à sua pergunta',
    detalhe: 'O requisito pede a escolha justificada, e as três razões são diferentes — se a mesma frase serve para os três, uma delas não foi pensada.',
    onde: 'No caderno da análise, nos três campos de texto.',
    passos: [
      'Diga o que aquela pergunta quer saber, e por que aquele desenho mostra isso.',
      'Diga também o que outro tipo mostraria de errado ali.',
      'Três perguntas diferentes pedem três razões diferentes.',
    ],
    feita: c => {
      const escritas = PERGUNTAS_DO_GRAFICO.map(p => texto(c, p.chave));
      return escritas.every(t => t.length >= LETRAS_DA_JUSTIFICATIVA)
        && new Set(escritas).size === escritas.length;
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 10 — A pergunta, a resposta e o que os dados não dizem (requisito 8)
   ──────────────────────────────────────────────────────────────────────── */

export const CHAVE_PERGUNTA = 'a-pergunta';
export const CHAVE_RESPOSTA = 'a-resposta';
export const CHAVE_CONCLUSAO = 'a-conclusao';
export const CHAVE_LIMITES = 'o-que-os-dados-nao-dizem';

/**
 * "No máximo uma página" em caracteres.
 *
 * Uma página escrita à mão, com a letra de quem tem doze anos, tem em torno de
 * duas mil e quinhentas letras. O corte existe porque o requisito o pede — e
 * porque conclusão que não cabe numa página é a que não decidiu o que dizer.
 */
export const LETRAS_DA_PAGINA = 2600;

/**
 * ── Por que esta lição é tela da plataforma ──────────────────────────────
 * Formular a pergunta, respondê-la e dizer o que os dados não permitem
 * afirmar não é gesto de programa nenhum. A planilha já foi usada nos oito
 * módulos anteriores; o que falta é escrever, e vestir isso de aplicativo
 * seria fantasia sem ganho.
 *
 * ── E "o que os dados não dizem" é campo próprio ─────────────────────────
 * O requisito o pede separado, e é a metade que não se escreve sozinha: quem
 * acabou de achar um número quer contar o que ele mostra, não o que ele não
 * mostra. Junto da conclusão, ele sairia como uma frase de rodapé; em campo
 * próprio, ele é uma pergunta que precisa de resposta.
 */
export const METAS_DA_CONCLUSAO: Meta[] = [
  {
    id: 'uma-pergunta-que-a-base-responde',
    titulo: 'Uma pergunta sua, e as colunas de que ela trata',
    detalhe: 'A pergunta é sua — mas ela tem de se responder com esta base. Marcar as colunas é o que mostra que ela se responde.',
    onde: 'No campo da pergunta, e na lista de colunas abaixo dele.',
    passos: [
      'Escreva a pergunta como você a faria para a liderança, terminando com sinal de interrogação.',
      'Marque as colunas que a respondem: se você quer comparar unidades, é a de unidade mais a do que você vai medir.',
      'Nome, e-mail e observação não respondem pergunta nenhuma: cada valor delas aparece uma vez só.',
    ],
    feita: c => {
      const pergunta = texto(c, CHAVE_PERGUNTA);
      if (pergunta.length < LETRAS_DA_JUSTIFICATIVA || !pergunta.includes('?')) return false;
      if (c.colunasDaPergunta.length === 0) return false;
      /* Toda coluna marcada existe, e pelo menos uma delas dá para agrupar ou
         contar: uma pergunta só sobre a coluna de nomes não se responde. */
      const campos = camposDaBase().map(x => x.id);
      if (!c.colunasDaPergunta.every(id => campos.includes(id))) return false;
      return c.colunasDaPergunta.some(id => !CLASSIFICACAO[id].naoAgrupa);
    },
  },
  {
    id: 'respondida-com-os-dados',
    titulo: 'A resposta, com o número que a sustenta',
    detalhe: 'Responder com os dados quer dizer com número. Sem ele, a resposta é uma opinião sobre uma base que você passou oito módulos montando.',
    onde: 'No campo da resposta.',
    passos: [
      'Diga o que a base responde, e traga o número junto.',
      'Se a pergunta compara grupos, traga os dois números — um sozinho não compara nada.',
      'O número sai da aba Cálculos, e não de memória.',
    ],
    feita: c => {
      const resposta = texto(c, CHAVE_RESPOSTA);
      /* Um algarismo em algum lugar: é o mínimo que "respondê-la com os
         dados" pode significar sem a plataforma tentar ler português. */
      return resposta.length >= LETRAS_DA_JUSTIFICATIVA && /\d/.test(resposta);
    },
  },
  {
    id: 'a-conclusao-em-uma-pagina',
    titulo: 'A conclusão, em no máximo uma página',
    detalhe: 'O limite é do requisito, e ele ajuda: conclusão que não cabe numa página é a que ainda não decidiu o que dizer.',
    onde: 'No campo da conclusão.',
    passos: [
      'Comece pela resposta, e não pelo caminho que levou até ela.',
      'Traga os números que importam, e só eles.',
      'Se passar de uma página, corte o que não muda a decisão de quem vai ler.',
    ],
    feita: c => {
      const conclusao = texto(c, CHAVE_CONCLUSAO);
      return conclusao.length >= LETRAS_DA_JUSTIFICATIVA * 3
        && conclusao.length <= LETRAS_DA_PAGINA;
    },
  },
  {
    id: 'o-que-os-dados-nao-dizem',
    titulo: 'E o que esta base não permite afirmar',
    detalhe: 'É a metade que não se escreve sozinha: quem acabou de achar um número quer contar o que ele mostra, não o que ele não mostra.',
    onde: 'No último campo, separado da conclusão de propósito.',
    passos: [
      'Pergunte: o que alguém poderia concluir disto que a base não sustenta?',
      'A base diz quem se inscreveu. Ela não diz por quê, nem o que teria acontecido de outro jeito.',
      'Ela também não compara este clube com nenhum outro: não há outro clube dentro dela.',
    ],
    feita: c => {
      const limites = texto(c, CHAVE_LIMITES);
      return limites.length >= LETRAS_DA_JUSTIFICATIVA
        /* A mesma frase nos dois campos é não ter separado as duas coisas. */
        && limites !== texto(c, CHAVE_CONCLUSAO);
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 11 — A defesa diante do examinador (requisito 9)
   ──────────────────────────────────────────────────────────────────────── */

export interface Contestacao {
  id: string;
  /** O que o examinador diz, com as palavras dele. */
  texto: string;
  /**
   * Os dados bastam para responder isto.
   *
   * `true` quer dizer que a base tem o número que desfaz a objeção; `false`,
   * que ela não tem como responder — e aí reconhecer o limite é a resposta
   * certa, e não uma derrota.
   */
  defensavel: boolean;
}

/**
 * O que o examinador contesta.
 *
 * ── As duas espécies têm de existir ──────────────────────────────────────
 * Duas objeções que os dados desfazem, e duas que eles não alcançam. Só
 * defensáveis ensinariam que analista bom rebate tudo; só limites
 * ensinariam que a base não serve para nada. O requisito 9 pede as duas
 * respostas, e a lição só as pede se as duas couberem.
 *
 * ── As defensáveis têm número na base ────────────────────────────────────
 * Cada uma se desfaz com um número que o desbravador já calculou: a taxa de
 * adesão do Falcão, a mediana dos acampamentos. "Defender com os dados" tem
 * de ser possível, senão a única saída honesta seria reconhecer.
 *
 * ── E os limites não são sobre falta de dado, são sobre outra pergunta ───
 * A base não diz **por que** ninguém se inscreveu, e não diz o que teria
 * acontecido se o prazo fosse outro. Não é uma coluna que falta: é uma
 * pergunta que a base não foi feita para responder, e é isso que se reconhece.
 */
export const CONTESTACOES: Contestacao[] = [
  {
    id: 'falcao-leva-menos',
    texto: 'O Falcão é a unidade que menos leva gente ao acampamento — ficaram três de fora, mais do que qualquer outra.',
    defensavel: true,
  },
  {
    id: 'clube-experiente',
    texto: 'A média do clube é de quase três acampamentos por desbravador, então este é um clube de gente experiente.',
    defensavel: true,
  },
  {
    id: 'conselheiro-melhor',
    texto: 'As unidades com mais experiência têm conselheiros melhores. Está nos seus números.',
    defensavel: false,
  },
  {
    id: 'prazo-mais-cedo',
    texto: 'Se a inscrição tivesse aberto um mês mais cedo, teriam vindo mais desbravadores.',
    defensavel: false,
  },
];

export const chaveDaResposta = (id: string) => `resposta-${id}`;

export const METAS_DA_DEFESA: Meta[] = [
  {
    id: 'toda-contestacao-respondida',
    titulo: 'Um veredito e uma resposta para cada contestação',
    detalhe: 'Defender e reconhecer são as duas respostas certas. O que não é resposta é ficar quieto.',
    onde: 'Em cada cartão do examinador, no par de botões e no campo de texto.',
    passos: [
      'Leia a contestação e pergunte: a base tem o número que desfaz isto?',
      'Se tem, defenda — e traga o número.',
      'Se não tem, reconheça o limite. Reconhecer não é perder: é dizer até onde a sua análise vai.',
    ],
    feita: c => CONTESTACOES.every(o =>
      c.vereditos[o.id] !== undefined
      && texto(c, chaveDaResposta(o.id)).length >= LETRAS_DA_JUSTIFICATIVA),
  },
  {
    id: 'os-vereditos-certos',
    titulo: 'E os quatro vereditos certos',
    detalhe: 'Duas se desfazem com os seus números. Duas não — e não porque falta uma coluna, mas porque são perguntas que esta base não foi feita para responder.',
    onde: 'Nos mesmos cartões.',
    passos: [
      'A taxa de adesão do Falcão está na sua tabela: use-a.',
      'A mediana dos acampamentos está na aba Cálculos: use-a.',
      'Sobre o trabalho do conselheiro a base não tem coluna nenhuma — e nem teria como ter.',
      'Sobre o que teria acontecido com outro prazo, nenhuma base tem: ela registra o que houve.',
    ],
    feita: c => CONTESTACOES.every(o =>
      c.vereditos[o.id] === (o.defensavel ? 'defendo' : 'reconheco')),
  },
  {
    id: 'defendida-com-numero',
    titulo: 'E as duas que você defendeu, defendidas com número',
    detalhe: 'Defender com os dados quer dizer com os dados. Uma defesa sem número é a mesma opinião do examinador, do outro lado.',
    onde: 'Nos campos de texto das que você marcou como defensáveis.',
    passos: [
      'Traga o número que desfaz a objeção, e não a sua impressão sobre ela.',
      'Na do Falcão, a taxa; na do clube experiente, a mediana ao lado da média.',
      'Quem reconhece o limite não precisa de número: precisa dizer o que falta.',
    ],
    feita: c => CONTESTACOES.filter(o => o.defensavel).every(o =>
      /\d/.test(texto(c, chaveDaResposta(o.id)))),
  },
];

/* ── O registro das lições ───────────────────────────────────────────────── */

export type ProgramaDaCcEs009 = 'planilha' | 'plataforma';

export type LicaoDaCcEs009 =
  | 'tipos' | 'centro' | 'engano' | 'frequencias' | 'comparacao' | 'adesao'
  | 'atipicos' | 'graficos' | 'conclusao' | 'defesa';

export interface LicaoDeAnalise {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs009;
  inicial: () => ContextoDaAnalise;
  metas: Meta[];
}

/** A pasta como ela chega, sem nada calculado. */
export function contextoInicial(
  blocos: BlocoDeContas[] = [BLOCO_DAS_MEDIDAS],
  comElenco = false,
  comPerguntas = false,
): ContextoDaAnalise {
  const base = baseDoAcampamento();
  const caderno = cadernoDaAnalise(base, blocos, comElenco, comPerguntas);
  return {
    base, caderno, cadernoAntes: caderno, blocos,
    descobertas: [], marcacoes: {}, julgamentos: {},
    colunasDaPergunta: [], vereditos: {}, textos: {},
  };
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
  frequencias: {
    programa: 'planilha',
    /* Parte com os dois blocos de distribuição vazios, e **sem** os blocos dos
       módulos 2 e 3: as contas de lá já foram feitas e não se refazem aqui.
       Trazê-las de volta vazias mandaria refazer a lição anterior. */
    inicial: () => contextoInicial([blocoDasUnidades(baseDoAcampamento()), blocoDasClasses(baseDoAcampamento())]),
    metas: METAS_DAS_FREQUENCIAS,
  },
  comparacao: {
    programa: 'planilha',
    inicial: () => contextoInicial([blocoDaComparacao(baseDoAcampamento())]),
    metas: METAS_DA_COMPARACAO,
  },
  adesao: {
    programa: 'planilha',
    inicial: () => contextoInicial([blocoDaAdesao(baseDoAcampamento())], true),
    metas: METAS_DA_ADESAO,
  },
  atipicos: {
    programa: 'planilha',
    /* Parte com as medidas escritas: as pontas de cada coluna são o MÁXIMO e o
       MÍNIMO que o módulo 2 já calculou, e refazê-los aqui mandaria refazer a
       lição anterior. */
    inicial: () => comAsMedidasEscritas(),
    metas: METAS_DOS_ATIPICOS,
  },
  graficos: {
    programa: 'planilha',
    /* As três abas chegam com o dado escrito e sem gráfico nenhum: o que o
       requisito 6 pede é a **escolha**, e refazer as contas dos módulos 4 e 5
       mediria de novo o que já foi medido. */
    inicial: () => contextoInicial([BLOCO_DAS_MEDIDAS], false, true),
    metas: METAS_DOS_GRAFICOS,
  },
  conclusao: {
    programa: 'plataforma',
    /* Parte da pasta com as medidas escritas: a resposta do requisito 8 cita
       números, e eles saem da aba Cálculos que os módulos anteriores
       montaram — não de memória. */
    inicial: () => comAsMedidasEscritas(),
    metas: METAS_DA_CONCLUSAO,
  },
  defesa: {
    programa: 'plataforma',
    inicial: () => comAsMedidasEscritas(),
    metas: METAS_DA_DEFESA,
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
