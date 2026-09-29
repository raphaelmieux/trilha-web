/**
 * As contas da CC-ES009, sobre uma coluna de respostas.
 *
 * ── Elas não são um segundo motor ────────────────────────────────────────
 * `MÉDIA`, `MED`, `MODO`, `DESVPADP`, `MÁXIMO` e `MÍNIMO` já existem, em
 * `formulas.ts`, e é com elas que o desbravador responde na grade. Escrevê-las
 * de novo aqui seria a plataforma tendo dois "Excel" outra vez — e a
 * divergência apareceria como **número plausível**, que é a pior forma de
 * aparecer: a lição diria uma média e a planilha mostraria outra, as duas com
 * cara de certas, e quem estuda concluiria que errou a fórmula.
 *
 * Então `medidaDa` monta uma coluna de mentira e pergunta ao motor de verdade.
 * O custo é uma linha por medida; o que se ganha é que lição e laboratório não
 * têm como discordar.
 *
 * ── O que não vem de lá ──────────────────────────────────────────────────
 * Contar não é calcular: a distribuição de frequências (requisito 5.3) e a
 * cerca do valor atípico (requisito 5.6) são feitas aqui. Contar quantas vezes
 * um valor aparece não tem duas respostas possíveis, então não há divergência
 * plausível a temer. O quartil tem — há mais de um jeito de calculá-lo, e eles
 * discordam —, e por isso `cercaDe` diz qual usa.
 */

import {
  type Bruto, type Valor,
  ehErro, numeroDoTexto, valorDaFormula,
} from './formulas';
import { type Formulario, respostasReais, valorDa } from './formulario';

/* ── As medidas ───────────────────────────────────────────────────────────── */

/**
 * O que a função da planilha devolve sobre esta coluna.
 *
 * A coluna vira as células A1:An de uma aba que não existe em lugar nenhum, e
 * quem responde é `valorDaFormula` — o mesmo caminho de toda célula da grade.
 * Vazio devolve `#DIV/0!` nas médias e zero nas somas, como no Excel, porque é
 * o motor que decide isso e não este arquivo.
 */
export function medidaDa(valores: string[], funcao: string): Valor {
  if (valores.length === 0) return valorDaFormula(() => '', `=${funcao}(A1:A1)`);
  const bruto: Bruto = (linha, coluna) => (coluna === 0 ? valores[linha] ?? '' : '');
  return valorDaFormula(bruto, `=${funcao}(A1:A${valores.length})`);
}

/** O número que a medida devolveu, ou `null` quando ela não devolveu número. */
export function numeroDaMedida(v: Valor): number | null {
  return v.tipo === 'numero' ? v.n : null;
}

const medida = (valores: string[], funcao: string) => numeroDaMedida(medidaDa(valores, funcao));

export const media = (valores: string[]) => medida(valores, 'MÉDIA');
export const mediana = (valores: string[]) => medida(valores, 'MED');
export const maximo = (valores: string[]) => medida(valores, 'MÁXIMO');
export const minimo = (valores: string[]) => medida(valores, 'MÍNIMO');

/**
 * A moda, que **não existe** quando nada se repete.
 *
 * O motor devolve `#N/D` nesse caso, como o Excel, e aqui isso vira `null`.
 * Devolver um número — o primeiro, o menor — afirmaria uma moda que o conjunto
 * não tem, e plausivelmente: o número sairia de dentro da coluna.
 */
export const moda = (valores: string[]) => medida(valores, 'MODO');

/**
 * Quantas vezes o valor mais repetido aparece.
 *
 * É o que diz se a moda **quer dizer alguma coisa**. Numa coluna de idades ela
 * sai onze vezes em quarenta e oito, e "a idade típica do clube é doze" é uma
 * frase verdadeira. Numa coluna de alturas medidas ela sai **duas** vezes, e
 * "a altura típica do clube é 1,58 m" é uma frase sobre duas pessoas — um
 * número perfeitamente plausível que não descreve ninguém.
 *
 * A planilha não tem como dizer isso: `MODO` devolve 1,58 e pronto. Quem
 * pergunta quantas vezes é quem descobre que a resposta não serve, e é por
 * isso que esta conta existe.
 */
export function repeticoesDaModa(valores: string[]): number {
  const conta = new Map<number, number>();
  for (const n of numerosDe(valores)) conta.set(n, (conta.get(n) ?? 0) + 1);
  return conta.size === 0 ? 0 : Math.max(...conta.values());
}

/**
 * O desvio padrão **populacional**, e a escolha é do requisito 5.
 *
 * A base é toda a inscrição do acampamento, e não uma amostra dela: não há
 * ninguém fora de quem se queira inferir. `DESVPAD` divide por n−1 e responde
 * sobre uma amostra; `DESVPADP` divide por n e responde sobre o conjunto
 * inteiro. Sobre 48 valores os dois ficam a cerca de 1% um do outro — o
 * número plausível e ligeiramente errado de sempre.
 */
export const desvioPadrao = (valores: string[]) => medida(valores, 'DESVPADP');

/**
 * A distância entre o maior e o menor.
 *
 * Coluna sem número nenhum não tem amplitude, e aqui ela **diverge da
 * planilha** de propósito: `=MÁXIMO(A1:A10)-MÍNIMO(A1:A10)` sobre uma faixa
 * vazia mostra **0** no Excel, e o motor faz o mesmo porque é o Excel que ele
 * imita. Só que zero ali não quer dizer "todos iguais": quer dizer que não
 * havia ninguém. Numa célula isso é uma convenção que o desbravador vai
 * encontrar de novo no computador do clube; numa frase escrita pela plataforma
 * seria a afirmação de que a turma inteira tem a mesma altura — o número
 * plausível de sempre, agora produzido por nós.
 */
export function amplitude(valores: string[]): number | null {
  if (numerosDe(valores).length === 0) return null;
  const alto = maximo(valores);
  const baixo = minimo(valores);
  return alto === null || baixo === null ? null : alto - baixo;
}

/** Quantos da coluna a planilha lê como número. */
export function numerosDe(valores: string[]): number[] {
  const fora: number[] = [];
  for (const v of valores) {
    const n = numeroDoTexto(v);
    if (n !== null) fora.push(n);
  }
  return fora;
}

/* ── Distribuição de frequências ──────────────────────────────────────────── */

export interface LinhaDeFrequencia {
  rotulo: string;
  absoluta: number;
  /** Em partes de um, e não em por cento: quem formata é a tela. */
  relativa: number;
  /** A absoluta somada com todas as anteriores. */
  acumulada: number;
}

/**
 * Quantas vezes cada valor aparece.
 *
 * ── A ordem é a da variável, e nunca a da frequência ─────────────────────
 * Ordenar uma distribuição pela contagem apaga justamente o que ela serve para
 * mostrar: a **forma**. Numa coluna de idades ordenada por frequência não se vê
 * que o clube é mais novo no meio; numa de tamanhos de camiseta ordenada por
 * frequência, PP e GG podem cair lado a lado, e a única coisa que faz a
 * camiseta ser ordinal — poder dizer "maior que" — some da tabela.
 *
 * Quando a variável tem ordem própria, ela vem em `ordem` e a tabela a segue,
 * **inclusive nos valores que não apareceram**: uma categoria com zero é
 * informação, e a tabela em que ela não aparece afirma que ela não existe. É o
 * mesmo defeito que o gráfico de pizza tinha ao pular a categoria de valor
 * zero. Sem `ordem`, o que manda é a ordem numérica para número e a alfabética
 * para texto — porque é preciso mandar alguma coisa, e a ordem de chegada
 * mudaria a tabela sem que o dado mudasse.
 */
export function frequenciasDe(valores: string[], ordem?: string[]): LinhaDeFrequencia[] {
  const preenchidos = valores.filter(v => v.trim() !== '');
  const conta = new Map<string, number>();
  for (const v of preenchidos) conta.set(v, (conta.get(v) ?? 0) + 1);

  const rotulos = ordem
    ? [...ordem, ...[...conta.keys()].filter(v => !ordem.includes(v))]
    : [...conta.keys()].sort(comparar);

  let acumulada = 0;
  return rotulos.map(rotulo => {
    const absoluta = conta.get(rotulo) ?? 0;
    acumulada += absoluta;
    return {
      rotulo,
      absoluta,
      relativa: preenchidos.length === 0 ? 0 : absoluta / preenchidos.length,
      acumulada,
    };
  });
}

/*
  Número por tamanho, texto por ordem alfabética de pt-BR.

  `<` entre strings compara UTF-16, e aí "Águia" cairia depois de "Tucano" —
  é a mesma armadilha que `formulas.ts` documenta na comparação de texto, e a
  resposta é a mesma: `localeCompare` em pt-BR.
*/
function comparar(a: string, b: string): number {
  const na = numeroDoTexto(a);
  const nb = numeroDoTexto(b);
  if (na !== null && nb !== null) return na - nb;
  return a.localeCompare(b, 'pt-BR');
}

export interface Classe extends LinhaDeFrequencia {
  /** Fechado embaixo. */
  piso: number;
  /** Aberto em cima, senão um valor na fronteira cairia em duas classes. */
  teto: number;
}

/**
 * A distribuição de uma variável **contínua**, que é por classes.
 *
 * Contar valor a valor uma coluna de alturas devolve quase uma linha por
 * pessoa — quarenta e oito linhas de "1" —, que é uma lista com outro nome.
 * Medida não se conta, se agrupa.
 *
 * A classe é fechada embaixo e **aberta em cima**: 1,40 entra na classe que
 * começa em 1,40, e não na que termina nela. Fechar os dois lados faria o
 * valor de fronteira ser contado duas vezes, e a soma das frequências passaria
 * do total sem nada estourar.
 */
export function classesDe(valores: string[], largura: number, inicio?: number): Classe[] {
  if (largura <= 0) return [];
  const ns = numerosDe(valores);
  if (ns.length === 0) return [];

  const base = redondo(inicio ?? Math.floor(semRuido(Math.min(...ns) / largura)) * largura);
  const fronteira = (i: number) => redondo(base + largura * i);

  /*
    Em que classe um valor cai sai de uma divisão, e **nunca** de compará-lo
    com a fronteira.

    `1,3 + 0,1` não é `1,4` em binário: é 1,4000000000000001. Uma classe que
    fosse "de 1,3 até menos que 1,3 + 0,1" aceitaria o 1,4 — o valor de
    fronteira cairia na classe que deveria terminar nele. E nada estoura: as
    frequências continuam somando o total, a tabela continua bonita, e uma das
    classes tem uma pessoa a mais do que devia.

    `(1,4 − 1,3) / 0,1` dá 0,9999999999999998, que a um bilionésimo de 1 é 1.
    Tirado o ruído, o piso é o `Math.floor` dele — e a classe fica fechada
    embaixo e aberta em cima sem depender de igualdade binária.

    A fronteira também é arredondada, porque `piso` e `teto` saem daqui para
    quem comparar: a soma crua devolveria 1,4000000000000001 e o rótulo da tela
    mentiria sem nenhuma conta estar errada.
  */
  const indiceDa = (n: number) => Math.floor(semRuido((n - base) / largura));
  const quantas = Math.max(1, indiceDa(Math.max(...ns)) + 1);

  let acumulada = 0;
  return Array.from({ length: quantas }, (_, i) => {
    const absoluta = ns.filter(n => indiceDa(n) === i).length;
    acumulada += absoluta;
    return {
      piso: fronteira(i),
      teto: fronteira(i + 1),
      rotulo: `${texto(fronteira(i))} a ${texto(fronteira(i + 1))}`,
      absoluta,
      relativa: absoluta / ns.length,
      acumulada,
    };
  });
}

/** Encosta no inteiro o que está a menos de um bilionésimo dele. */
const semRuido = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x);

const redondo = (n: number) => Number(n.toFixed(10));

const texto = (n: number) => String(Number(n.toFixed(4))).replace('.', ',');

/* ── Valores atípicos ─────────────────────────────────────────────────────── */

export interface Cerca {
  q1: number;
  q3: number;
  /** O que fica entre o primeiro e o terceiro quartil: a metade do meio. */
  iqr: number;
  piso: number;
  teto: number;
}

/**
 * A cerca de Tukey: um quartil e meio para cada lado da metade do meio.
 *
 * ── Qual quartil, porque há mais de um ───────────────────────────────────
 * Este é o quartil por interpolação linear sobre `(n−1)·p`, que é o que o
 * `QUARTIL.INC` do Excel e o padrão do numpy fazem. Existem outros — há pelo
 * menos nove definições publicadas —, e sobre 48 valores eles discordam na
 * segunda casa. Discordar na segunda casa é exatamente o bastante para um
 * valor entrar ou sair da cerca, e nada avisar. Por isso a escolha está
 * escrita aqui, e não subentendida.
 *
 * A planilha desta vereda **não** tem `QUARTIL`, e é decisão: o requisito 2.4
 * nomeia amplitude e desvio padrão, e quartil é matéria da CC-ES010. Quem
 * procura valor atípico aqui ordena a coluna e olha as pontas, que é o que se
 * faz. A cerca é a conferência, e mora deste lado.
 */
export function cercaDe(valores: string[]): Cerca | null {
  const ns = numerosDe(valores).sort((a, b) => a - b);
  if (ns.length < 4) return null;

  const quartil = (p: number) => {
    const posicao = (ns.length - 1) * p;
    const baixo = Math.floor(posicao);
    const alto = Math.ceil(posicao);
    return ns[baixo] + (ns[alto] - ns[baixo]) * (posicao - baixo);
  };

  const q1 = quartil(0.25);
  const q3 = quartil(0.75);
  const iqr = q3 - q1;

  /*
    Metade do meio com um valor só **não tem cerca**, e devolver uma de
    largura zero é pior do que não devolver nenhuma.

    Na coluna de diárias, trinta e sete das quarenta e oito respostas dizem 3:
    o primeiro e o terceiro quartil valem 3, o intervalo é zero, e a cerca
    fecha em [3, 3]. A conta então acusa onze valores atípicos — todo mundo que
    pediu uma ou duas diárias —, e nenhum deles é atípico: eles são a minoria,
    que é outra coisa. A lista sairia com onze nomes plausíveis e o desbravador
    passaria a decidir o que fazer com gente que não tem nada de estranho.

    Quem não tem espalhamento não responde a uma pergunta sobre espalhamento.
    `null` diz isso; zero diria que conferiu.
  */
  if (iqr === 0) return null;

  return { q1, q3, iqr, piso: q1 - 1.5 * iqr, teto: q3 + 1.5 * iqr };
}

/** Os valores que ficam fora da cerca, na ordem em que a coluna os traz. */
export function atipicosDe(valores: string[]): number[] {
  const cerca = cercaDe(valores);
  if (!cerca) return [];
  return numerosDe(valores).filter(n => n < cerca.piso || n > cerca.teto);
}

/* ── Taxa e número absoluto ───────────────────────────────────────────────── */

/**
 * A parte dividida pelo todo, em partes de um.
 *
 * Todo zero devolve `null`, e não zero: uma unidade sem nenhum membro não tem
 * taxa de adesão **nenhuma**, e escrever 0% ali afirmaria que ninguém dela se
 * inscreveu — o que é uma frase sobre gente que não existe. É o "zero link não
 * é zero link quebrado" numa divisão.
 */
export function taxa(parte: number, total: number): number | null {
  return total === 0 ? null : parte / total;
}

/* ── Sobre a base inteira ─────────────────────────────────────────────────── */

/** A coluna de um campo, como o formulário a guardou. */
export function colunaDe(base: Formulario, campoId: string): string[] {
  return respostasReais(base).map(r => valorDa(r, campoId));
}

/** As respostas repartidas pelo valor de um campo. */
export function agrupadoPor(base: Formulario, campoId: string): Map<string, string[]> {
  const fora = new Map<string, string[]>();
  for (const r of respostasReais(base)) {
    const chave = valorDa(r, campoId);
    fora.set(chave, [...(fora.get(chave) ?? []), r.id]);
  }
  return fora;
}

/**
 * Uma medida de um campo, dentro de cada grupo de outro.
 *
 * É o requisito 5.4 — comparar dois ou mais grupos internos à base — e é o que
 * a tabela dinâmica do requisito 5.5 resume. Os dois caminhos chegam ao mesmo
 * número de propósito: o resumo da planilha não pode discordar da conta.
 */
export function medidaPorGrupo(
  base: Formulario, campoDoGrupo: string, campoDaMedida: string, funcao: string,
): Map<string, number | null> {
  const linhas = respostasReais(base);
  const fora = new Map<string, number | null>();
  for (const [grupo, ids] of agrupadoPor(base, campoDoGrupo)) {
    const dentro = new Set(ids);
    const valores = linhas.filter(r => dentro.has(r.id)).map(r => valorDa(r, campoDaMedida));
    const v = medidaDa(valores, funcao);
    fora.set(grupo, ehErro(v) ? null : numeroDaMedida(v));
  }
  return fora;
}
