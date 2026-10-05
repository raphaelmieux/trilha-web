/**
 * O que cada lição da CC-ES010 cobra.
 *
 * Num arquivo só, como os de antes dele. Os programas são **dois** — a
 * planilha, onde toda conta acontece, e a tela da plataforma, onde acontece o
 * que não é conta —, e o contexto é um: a base, a pasta de trabalho e o que a
 * pessoa concluiu viajam juntos porque a defesa do requisito 9 é sobre a
 * análise que ela acabou de fazer.
 *
 * O registro mora **fora do teste**, como o de planilha, o de PDF, o de nuvem,
 * o de formulário e o da CC-ES009: quem o lê é a tela, que monta a lição,
 * **e** a trava, que confere que nenhuma meta abre verde. Escrito só na trava,
 * a tela repetiria a escolha e as duas divergiriam na primeira lição nova, com
 * a trava continuando verde conferindo uma lição que a tela não abre.
 *
 * ── A base é a mesma, e continua não sendo trabalho ──────────────────────
 * O requisito 1 pede a CC-ES009 concluída, e a base é a de lá — fechada e
 * arrumada. Uma base nova aqui faria a exigência do requisito 1 virar enfeite:
 * o desbravador analisaria um dado numa vereda e outro na seguinte, e a única
 * coisa que a CC-ES009 teria ensinado seria clicar.
 *
 * E ela carrega esta vereda inteira sem nada novo. **Altura × acampamentos dá
 * r = 0,62** — quem é mais alto já foi a mais acampamentos —, e as duas coisas
 * são puxadas pela **idade**, que está na coluna ao lado (r = 0,91 e 0,72). É
 * a correlação espúria que o requisito 3 pede, real e computada pelo próprio
 * desbravador, com a variável escondida ao alcance da mão — e muito melhor do
 * que um caso publicado que ele teria de aceitar de fé.
 *
 * ── O que "dado próprio" quer dizer no requisito 6 ───────────────────────
 * A mesma base, com o desbravador **escolhendo o par de colunas**. O que o
 * requisito mede não é a mecânica — o requisito 5 já mediu — e sim o
 * raciocínio escrito: o que a relação sugere, que outras explicações cabem no
 * mesmo padrão, e qual dado a mais decidiria entre elas. Esse raciocínio só
 * existe sobre um par que a pessoa escolheu, e é por isso que a escolha é
 * dela.
 *
 * ── E a máquina da pasta de trabalho é importada, não reescrita ──────────
 * `cadernoDaAnalise`, `BlocoDeContas`, `colunaDoCampo` e `faixaDoCampo` vêm de
 * `metasDaCcEs009.ts`. É a decisão de `metasDaCcEs004` importar `moldeDoNome`
 * da CC-ES001 em vez de reescrevê-lo, e a de a própria CC-ES009 importar
 * `planilhaDe` do caderno da CC-ES003: uma fonte, e não uma trava conferindo
 * duas. A regra de **extrair antes de a cópia existir** é das janelas —
 * `word.tsx`, `excel.tsx`, `explorer.tsx` —, que divergem à vista; para conta
 * pura, o que esta casa faz é importar.
 */

import type { Formulario } from './formulario';
import { type Caderno, type Planilha, escrever, valorCalculado } from './planilha';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE, baseDoAcampamento, camposDaBase,
} from './baseDoAcampamento';
import { CAMPO_DIARIAS } from './formulario';
import {
  type BlocoDeContas,
  ABA_CALCULOS, ABA_RESPOSTAS, cadernoDaAnalise, colunaDoCampo, faixaDoCampo,
  assinaturaDaBase, linhaConfere, linhaDoRotulo,
} from './metasDaCcEs009';
import {
  type Aleatorio,
  cercaDe, colunaDe, correlacaoDe, inclinacaoDe, intercepcaoDe, previsaoDe, rquadDe,
  sortearEntreGrupos,
} from './analiseDeDados';
import { abaDe, comAba, escritoEm, usaFuncao } from './cadernoDoClube';
import { nomeDaColuna, referenciasDe } from './formulas';
import {
  type FormaDeEnviesar,
  COLETAS, POPULACOES, populacaoCerta,
} from './amostraDoClube';
import {
  CAMPO_DA_MEDIDA, CAMPO_DO_GRUPO, GRUPO_A, GRUPO_B,
  LEITURAS_DO_ACASO, PROVIDENCIAS, SORTEIOS_MINIMOS,
  leituraDoAcasoCerta, providenciasQueAumentam,
} from './acasoEntreGrupos';
import {
  type GrauDeConfianca, type PesoDoAchado,
  ACHADOS, GRAUS, grauCoerente,
} from './confiancaNaConclusao';

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
  feita: (c: ContextoDaEstatistica) => boolean;
}

/* ── O contexto ───────────────────────────────────────────────────────────── */

/**
 * Como a pessoa classificou uma coleta.
 *
 * `'honesta'` é um valor, e não a ausência de valor: "não classifiquei ainda"
 * e "classifiquei como honesta" são duas coisas, e colapsá-las faria a meta de
 * "toda coleta classificada" fechar sozinha com a lista em branco — que é o
 * "zero link não é zero link quebrado" aplicado a uma classificação.
 */
export type ClassificacaoDaColeta = FormaDeEnviesar | 'honesta';

export interface ContextoDaEstatistica {
  /**
   * A base, fechada, e ela **não muda**.
   *
   * É a decisão da CC-ES009, e aqui ela pesa mais: o requisito 7 manda refazer
   * a análise **excluindo** os valores atípicos e comparar os dois resultados.
   * Isso é uma segunda leitura, e não uma edição — uma base editável faria a
   * comparação ser entre a análise de agora e uma base que já não existe.
   */
  base: Formulario;
  caderno: Caderno;
  /** A pasta de quando a lição abriu. Saber o que **mudou** é outra pergunta. */
  cadernoAntes: Caderno;
  blocos: BlocoDeContas[];
  descobertas: string[];
  /** Módulo 1: o que a pessoa marcou para cada coleta, por id. */
  classificacoes: Record<string, ClassificacaoDaColeta | undefined>;
  /** Módulo 1: de que população ela disse que a base é amostra. */
  populacao?: string;
  /** Módulo 2: que leitura ela deu ao valor de r. */
  leituraDeR?: string;
  /** Módulo 3: que par ela apontou como espúrio. */
  parApontado?: string;
  /** Módulo 3: que coluna ela disse que explica os dois lados dele. */
  colunaEscondida?: string;
  /** Módulo 4: qual das duas colunas do par ela disse que é a independente. */
  independente?: string;
  /** Módulo 6: qual par ela disse que a reta descreve pior. */
  piorAjuste?: string;
  /**
   * Módulo 7: o par que ela **escolheu** olhar.
   *
   * É o requisito 6 — "aplicar a regressão a dado próprio" —, e "próprio" aqui
   * quer dizer escolhido por ela. A mecânica o requisito 5 já mediu; o que
   * este mede é o raciocínio escrito, e raciocínio só existe sobre um par que
   * alguém escolheu.
   */
  parEscolhido?: { x: string; y: string };
  /**
   * Módulo 9: as diferenças que os embaralhos dela produziram, acumuladas.
   *
   * As diferenças, e não um par de contadores: a frequência e "chegou na real
   * alguma vez?" saem as duas daqui, e dois números guardados ao lado seriam
   * segunda fonte para o que esta lista já diz. É o registro do que a pessoa
   * de fato viu.
   */
  sorteios: number[];
  /** Módulo 9: que leitura ela deu ao resultado do embaralho. */
  leituraDoAcaso?: string;
  /** Módulo 9: que providências ela escolheu, por id. */
  providencias: string[];
  /** Módulo 10: como ela classificou cada achado, por id. */
  pesos: Record<string, PesoDoAchado | undefined>;
  /** Módulo 10: o grau de confiança que ela declarou. */
  grau?: GrauDeConfianca;
  /** O que ela escreveu, por chave. */
  textos: Record<string, string>;
}

/* ── Atalhos de leitura ───────────────────────────────────────────────────── */

const classificada = (c: ContextoDaEstatistica, id: string) => c.classificacoes[id] !== undefined;

const texto = (c: ContextoDaEstatistica, chave: string) => (c.textos[chave] ?? '').trim();

/**
 * A linha da aba de cálculos confere: a função que o bloco declara, uma
 * referência de verdade, e o resultado.
 *
 * As três contas moram em `linhaConfere`, na CC-ES009, e o atalho existe para
 * que as nove metas que a chamam digam o que estão perguntando em vez de
 * repetir quatro argumentos — a decisão que `metasDaCcEs009` tomou do lado
 * dele quando esta vereda precisou da mesma regra.
 */
const linhaCompleta = (c: ContextoDaEstatistica, rotulo: string) =>
  linhaConfere(c.caderno, c.blocos, c.base, rotulo);

/**
 * Uma frase escrita, e não duas palavras.
 *
 * A plataforma não lê português, então o que ela pode cobrar é que haja frase.
 * É a conta dos campos escritos da CC-ES009, e o piso é o que separa "não
 * serve" de uma explicação.
 */
const frasePropria = (t: string) => t.length >= 60;

/**
 * Uma frase escrita **e com número dentro**, e são duas contas diferentes de
 * propósito.
 *
 * Esta vale onde o que se explica **é** um número que está na tela: o risco da
 * extrapolação, que sem citar o intervalo ou o valor absurdo é uma explicação
 * de nada em particular; e o que a relação sugere, que sem o r é uma opinião.
 *
 * E ela **não** vale nos outros dois campos do requisito 6. "Que outra
 * explicação cabe no mesmo padrão" e "que dado decidiria entre elas" são
 * histórias de causa, e são qualitativas por natureza — a resposta certa pode
 * não ter um único algarismo. Cobrar número ali reprovaria o certo, que é a
 * trava medindo vocabulário em vez de papel.
 */
const frasePropriaComNumero = (t: string) => frasePropria(t) && /\d/.test(t);

/** O que a coleta **é**, na forma em que a pessoa a marca. */
const certaPara = (forma: FormaDeEnviesar | null): ClassificacaoDaColeta =>
  (forma === null ? 'honesta' : forma);

/* ── Módulo 1: de quem a base fala ────────────────────────────────────────── */

/*
  Três metas, e a divisão é a do módulo 1 da CC-ES009 pelo mesmo motivo: "toda
  coleta classificada" vermelha diz "continue"; "classificação certa" vermelha
  diz "uma delas está errada". São recados diferentes, e uma meta só daria o
  segundo recado a quem ainda está no meio do caminho.
*/
export const METAS_DA_AMOSTRA: Meta[] = [
  {
    id: 'a-populacao',
    titulo: 'Dizer de que população a base é amostra',
    detalhe:
      'Os quarenta e oito que responderam são a amostra. A população é de quem '
      + 'a conclusão vai falar — e é com ela que a liderança vai decidir alguma '
      + 'coisa.',
    onde: 'Na tela da lição, no bloco "De quem esta base fala".',
    passos: [
      'Leia as três opções.',
      'Pergunte de cada uma: a base teria como falar deste grupo?',
      'Escolha a que a conclusão vai usar, e não a que está na tabela.',
    ],
    feita: c => c.populacao === populacaoCerta(),
  },
  {
    id: 'toda-coleta-classificada',
    titulo: 'Classificar as quatro coletas',
    detalhe:
      'Inclusive a que está certa. Deixar uma de fora é deixar de decidir sobre '
      + 'ela, e decidir é o exercício.',
    onde: 'Na tela da lição, um seletor em cada coleta.',
    passos: [
      'Leia como cada coleta aconteceu.',
      'Para cada uma, pergunte quem não teve como responder.',
      'Marque a forma, ou marque que ela não torceu a amostra.',
    ],
    feita: c => COLETAS.every(co => classificada(c, co.id)),
  },
  {
    id: 'classificacao-certa',
    titulo: 'Acertar a forma de cada uma',
    detalhe:
      'Três torceram a amostra, cada uma por um caminho diferente, e uma não '
      + 'torceu. Dizer que todas torceram é tão errado quanto dizer que nenhuma '
      + 'torceu: o que se aprende é olhar por onde ela torceu, e não desconfiar '
      + 'de tudo.',
    onde: 'Na tela da lição, nos mesmos seletores.',
    passos: [
      'Uma delas não alcançou parte do clube — essa gente nunca foi perguntada.',
      'Uma delas só ouviu quem já estava ali.',
      'Numa delas ninguém ficou de fora, e ainda assim a resposta saiu torcida: '
        + 'olhe como a pergunta foi escrita.',
      'E uma delas falou com o clube inteiro.',
    ],
    /*
      Conjunto **igual**, e não conjunto que contém: exigir só que as torcidas
      estivessem marcadas deixaria "marque a mesma forma em todas" passar com
      louvor. É a decisão da análise das mensagens da CC-ES005.
    */
    feita: c => COLETAS.every(co => c.classificacoes[co.id] === certaPara(co.forma)),
  },
];

/* ── Os pares que esta vereda correlaciona ────────────────────────────────── */

/**
 * Um par de colunas, e o que ele tem a dizer.
 *
 * Os três pares da base não são três exemplos do mesmo exercício: eles são o
 * requisito 3 inteiro desenhado em números. Dois deles têm leitura causal
 * defensável — criança mais velha é mais alta, e mais tempo no clube dá mais
 * acampamentos —, e o terceiro **não tem nenhuma**, porque é o produto dos
 * dois primeiros.
 */
export interface ParDeColunas {
  id: string;
  rotulo: string;
  /** No eixo horizontal, quando o par vira dispersão. */
  x: string;
  /** No eixo vertical. */
  y: string;
  /**
   * Se a relação é **espúria**: nenhuma das duas mexe na outra, e as duas são
   * puxadas por uma terceira.
   */
  espuria?: true;
  /** A coluna que explica as duas, quando há uma. */
  escondida?: string;
}

export const PARES: ParDeColunas[] = [
  {
    id: 'idade-altura',
    rotulo: 'Idade × Altura',
    x: CAMPO_IDADE,
    y: CAMPO_ALTURA,
  },
  {
    id: 'idade-acampamentos',
    rotulo: 'Idade × Acampamentos',
    x: CAMPO_IDADE,
    y: CAMPO_ACAMPAMENTOS,
  },
  {
    /*
      O par do requisito 3. r = 0,62 — quem é mais alto já foi a mais
      acampamentos —, e nenhuma das duas mexe na outra: crescer não leva
      ninguém a acampar, e acampar não faz ninguém crescer. Quem explica as
      duas é a **idade**, que está na coluna ao lado com r = 0,91 e 0,72.

      É correlação espúria de verdade, computada pelo próprio desbravador nos
      dados do clube dele, com a variável escondida ao alcance da mão — e vale
      mais do que um caso publicado que ele teria de aceitar de fé.
    */
    id: 'altura-acampamentos',
    rotulo: 'Altura × Acampamentos',
    x: CAMPO_ALTURA,
    y: CAMPO_ACAMPAMENTOS,
    espuria: true,
    escondida: CAMPO_IDADE,
  },
];

export const parDe = (id: string) => PARES.find(p => p.id === id);

/** O par espúrio. Exatamente um é. */
export const parEspurio = () => PARES.find(p => p.espuria)!;

/** O r de um par, pelo mesmo motor que a fórmula do desbravador chama. */
export const rDoPar = (base: Formulario, par: ParDeColunas) =>
  correlacaoDe(colunaDe(base, par.x), colunaDe(base, par.y));

export const COL_R = 'r';

/**
 * O bloco da correlação na aba de cálculos.
 *
 * Uma coluna só — o `r` —, e uma linha por par que a lição põe à mesa. O
 * módulo 2 recebe um par; o módulo 3 recebe os três, porque o que ele manda
 * ver é a comparação entre eles.
 */
export function blocoDosPares(pares: ParDeColunas[]): BlocoDeContas {
  return {
    titulo: 'Correlação entre duas colunas',
    rotulos: pares.map(p => p.rotulo),
    colunas: [COL_R],
    funcoes: () => ['CORREL'],
    esperado: (base, linha) => {
      const par = pares.find(p => p.rotulo === linha);
      return par ? rDoPar(base, par) : null;
    },
  };
}

/* ── Módulo 2: a correlação ───────────────────────────────────────────────── */

/**
 * O que o valor de r diz, e as três leituras erradas.
 *
 * O requisito 5.2 pede calcular **e interpretar**, então a interpretação é
 * gesto e não prosa. As erradas erram por motivos identificáveis: uma troca o
 * sinal, uma chama de fraco o que está perto de 1, e uma nega a relação.
 *
 * O que elas **não** fazem é oferecer a leitura causal. Para idade × altura ela
 * seria defensável — criança mais velha é mais alta —, e uma alternativa
 * defensável marcada como errada ensinaria o contrário do requisito 3. A
 * causalidade é o assunto do módulo 3, com o par em que ela não se sustenta.
 */
export interface LeituraDeR {
  id: string;
  frase: string;
  certa?: true;
}

export const LEITURAS_DE_R: LeituraDeR[] = [
  {
    id: 'sobem-juntas',
    frase: 'Quando uma sobe, a outra sobe — e quase sempre, não só às vezes.',
    certa: true,
  },
  {
    id: 'fraca',
    frase: 'Quando uma sobe a outra sobe, mas é uma relação fraca.',
  },
  {
    id: 'desce',
    frase: 'Quando uma sobe, a outra desce.',
  },
  {
    id: 'nenhuma',
    frase: 'Não há relação entre as duas.',
  },
];

export const leituraCerta = () => LEITURAS_DE_R.find(l => l.certa)!.id;

/** O par que o módulo 2 usa: o mais forte da base, e o de leitura mais limpa. */
export const PAR_DO_MODULO_2 = PARES[0];

const faixaNaBase = (base: Formulario, campoId: string) =>
  `${ABA_RESPOSTAS}!${faixaDoCampo(base, campoId)}`;

/** A fórmula do r de um par, escrita como quem a escreve na célula. */
export const formulaDoR = (base: Formulario, par: ParDeColunas) =>
  `=CORREL(${faixaNaBase(base, par.x)};${faixaNaBase(base, par.y)})`;

const letraDo = (campoId: string) => nomeDaColuna(colunaDoCampo(campoId));

export const METAS_DA_CORRELACAO: Meta[] = [
  {
    id: 'a-dispersao',
    titulo: 'Desenhar a dispersão entre as duas colunas',
    detalhe:
      'A dispersão é o único gráfico em que os dois eixos são medidas: cada '
      + 'ponto é uma pessoa, e a nuvem mostra se as duas coisas andam juntas. '
      + 'Ela é a mesma nuvem em qualquer ordem da tabela.',
    onde: 'Na aba Respostas, com as duas colunas selecionadas, em Inserir → Dispersão.',
    passos: [
      `Selecione a coluna ${letraDo(PAR_DO_MODULO_2.x)} e a coluna `
        + `${letraDo(PAR_DO_MODULO_2.y)} na aba ${ABA_RESPOSTAS}.`,
      'Em Inserir, escolha Dispersão.',
      'Escreva o que cada eixo é: gráfico sem eixo identificado não afirma nada.',
    ],
    feita: c => dispersaoFeita(c, PAR_DO_MODULO_2),
  },
  {
    id: 'o-coeficiente',
    titulo: 'Calcular o coeficiente de correlação',
    detalhe:
      'A nuvem mostra; o número mede. Entre −1 e 1, e quanto mais longe de '
      + 'zero, mais as duas andam juntas.',
    onde: 'Na aba Cálculos, na célula ao lado de ' + PAR_DO_MODULO_2.rotulo + '.',
    passos: [
      'Clique na célula ao lado do rótulo, na coluna r.',
      `Escreva =CORREL( e selecione a coluna ${letraDo(PAR_DO_MODULO_2.x)} na aba `
        + `${ABA_RESPOSTAS}, do primeiro registro ao último.`,
      `Ponto e vírgula, e depois a coluna ${letraDo(PAR_DO_MODULO_2.y)} do mesmo jeito.`,
      'Nesta função a ordem das duas faixas não importa: a correlação não tem lado.',
    ],
    feita: c => linhaCompleta(c, PAR_DO_MODULO_2.rotulo),
  },
  {
    id: 'interpretou-o-valor',
    titulo: 'Dizer o que esse número quer dizer',
    detalhe:
      'Um número sozinho não é leitura. O sinal diz se as duas sobem juntas ou '
      + 'se uma desce quando a outra sobe; a distância até zero diz o quanto '
      + 'isso acontece.',
    onde: 'Na tela da lição, no bloco "O que este r diz".',
    passos: [
      'Olhe o sinal: ele é positivo ou negativo?',
      'Olhe a distância até 1: este valor está perto ou longe?',
      'Escolha a frase que descreve as duas coisas.',
    ],
    feita: c => c.leituraDeR === leituraCerta(),
  },
];

/**
 * A dispersão do par, desenhada e com os dois eixos escritos.
 *
 * O tipo **e** a faixa, e não só a existência do gráfico: uma dispersão sobre
 * duas colunas que não são essas desenha uma nuvem perfeitamente plausível de
 * outra pergunta. E os eixos entram aqui porque o requisito 5.1 pede o gráfico
 * **entre duas variáveis** — sem dizer quais são, o desenho não afirma nada.
 */
function dispersaoFeita(c: ContextoDaEstatistica, par: ParDeColunas): boolean {
  const p = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS);
  const g = p?.grafico;
  if (!g || g.tipo !== 'dispersao') return false;
  if (g.eixoX.trim() === '' || g.eixoY.trim() === '') return false;
  const cx = colunaDoCampo(par.x);
  const cy = colunaDoCampo(par.y);
  const esq = Math.min(g.faixa.c1, g.faixa.c2);
  const dir = Math.max(g.faixa.c1, g.faixa.c2);
  /* A faixa tem de cobrir as duas colunas do par, com o x à esquerda: na
     dispersão a primeira coluna é o eixo horizontal, e trocá-las desenha a
     nuvem espelhada — que é outra pergunta com a mesma cara. */
  if (esq !== Math.min(cx, cy) || dir !== Math.max(cx, cy)) return false;
  const topo = Math.min(g.faixa.l1, g.faixa.l2);
  const base = Math.max(g.faixa.l1, g.faixa.l2);
  /* E tem de cobrir os registros todos: uma faixa com uma linha de menos
     desenha a nuvem quase igual, sem um ponto que ninguém procura. */
  return topo <= 1 && base >= c.base.respostas.length;
}

/* ── Módulo 3: correlação não é causa ─────────────────────────────────────── */

/**
 * As colunas que podem ser a terceira variável.
 *
 * As quantitativas da base, e não só as duas do par: oferecer só as que sobram
 * do par reduziria a escolha a uma moeda. Diárias está aqui porque ela é
 * quantitativa e **não** explica nada — é a candidata que convida a olhar o
 * número em vez de chutar.
 */
export const CANDIDATAS_A_ESCONDIDA = [
  CAMPO_IDADE, CAMPO_ALTURA, CAMPO_ACAMPAMENTOS, CAMPO_DIARIAS,
];

export const METAS_DA_ESPURIA: Meta[] = [
  {
    id: 'as-tres-correlacoes',
    titulo: 'Calcular o r dos três pares',
    detalhe:
      'Um r sozinho não diz se a relação é de causa. Três, lado a lado, dizem '
      + 'muito: é comparando que se vê qual delas sobra sem explicação própria.',
    onde: 'Na aba Cálculos, nas três linhas do bloco de correlação.',
    passos: [
      'Escreva =CORREL( para cada um dos três pares, como no módulo anterior.',
      'Deixe os três à vista ao mesmo tempo — é a comparação que ensina, e não '
        + 'cada número sozinho.',
    ],
    feita: c => PARES.every(par => linhaCompleta(c, par.rotulo)),
  },
  {
    id: 'achou-a-espuria',
    titulo: 'Apontar o par em que nenhuma das duas mexe na outra',
    detalhe:
      'Em dois dos três pares dá para contar uma história de causa que se '
      + 'sustenta. Num deles, não: pense no que teria de acontecer para uma '
      + 'mexer na outra, e veja que não acontece em nenhum dos dois sentidos.',
    onde: 'Na tela da lição, no bloco "Qual destas três não é causa".',
    passos: [
      'Para cada par, tente a frase "se eu aumentasse esta, a outra mudaria?".',
      'Faça a pergunta nos dois sentidos: a de cima mexe na de baixo? E ao contrário?',
      'Num dos três, as duas respostas são não — e o r continua alto.',
    ],
    feita: c => c.parApontado === parEspurio().id,
  },
  {
    id: 'nomeou-a-escondida',
    titulo: 'Nomear a coluna que explica os dois lados',
    detalhe:
      'Correlação sem causa quase nunca é coincidência: costuma haver uma '
      + 'terceira coisa puxando as duas. Ela está na base, numa coluna ao lado.',
    onde: 'Na tela da lição, no bloco "Quem explica as duas".',
    passos: [
      'Olhe os outros dois r que você acabou de calcular.',
      'Uma das colunas aparece nos dois, e com r mais alto do que o do par espúrio.',
      'É ela: as duas coisas do par sobem porque **essa** sobe.',
    ],
    /*
      Apontar a coluna é uma escolha entre quatro, e a prova está na tela: os
      outros dois r, que a primeira meta já exigiu, mostram a idade ligada às
      duas pontas com força maior do que elas têm entre si. A meta não refaz
      esse raciocínio — ela cobra o nome, com a evidência já calculada ao lado.
    */
    feita: c => c.colunaEscondida === parEspurio().escondida,
  },
];

/* ── Módulo 4: a reta ─────────────────────────────────────────────────────── */

export const ROTULO_INCLINACAO = 'Inclinação da reta';
export const ROTULO_INTERCEPCAO = 'Onde ela corta o eixo';

/**
 * O bloco da reta: duas linhas, uma coluna.
 *
 * A ordem dos argumentos é a do Excel, e é a lição: `INCLINAÇÃO` e
 * `INTERCEPÇÃO` recebem **o y primeiro**. Quem escrever ao contrário recebe a
 * reta de x sobre y — outro número, igualmente plausível, sem erro nenhum.
 */
export function blocoDaReta(par: ParDeColunas): BlocoDeContas {
  return {
    titulo: `A reta de ${par.rotulo}`,
    rotulos: [ROTULO_INCLINACAO, ROTULO_INTERCEPCAO],
    colunas: ['Valor'],
    funcoes: linha => [linha === ROTULO_INCLINACAO ? 'INCLINAÇÃO' : 'INTERCEPÇÃO'],
    esperado: (base, linha) => {
      const ys = colunaDe(base, par.y);
      const xs = colunaDe(base, par.x);
      return linha === ROTULO_INCLINACAO ? inclinacaoDe(ys, xs) : intercepcaoDe(ys, xs);
    },
  };
}

/** A fórmula da reta, com o y na frente — como se escreve na célula. */
export const formulaDaReta = (base: Formulario, par: ParDeColunas, funcao: string) =>
  `=${funcao}(${faixaNaBase(base, par.y)};${faixaNaBase(base, par.x)})`;

/**
 * Qual das duas colunas do par **explica** a outra.
 *
 * É o requisito 2.4, e no par do módulo 4 ele tem resposta: a idade explica a
 * altura, e não o contrário — ninguém fica mais velho por ter crescido. É o
 * único par da base em que a direção é clara nos dois sentidos da pergunta, e
 * é por isso que é este que a lição usa.
 */
export const independenteCerta = () => PAR_DO_MODULO_2.x;

export const METAS_DA_RETA: Meta[] = [
  {
    id: 'qual-eixo-e-qual',
    titulo: 'Dizer qual das duas explica a outra',
    detalhe:
      'A que explica vai no eixo horizontal; a que é explicada, no vertical. '
      + 'Trocar as duas desenha uma reta que responde a outra pergunta.',
    onde: 'Na tela da lição, no bloco "Quem explica quem".',
    passos: [
      'Faça a pergunta nos dois sentidos, como no módulo anterior.',
      'Uma das duas respostas é absurda — e é isso que decide a direção.',
    ],
    feita: c => c.independente === independenteCerta(),
  },
  {
    id: 'a-linha-de-tendencia',
    titulo: 'Traçar a linha de tendência na dispersão',
    detalhe:
      'Ela é a reta que passa o mais perto possível de todos os pontos ao '
      + 'mesmo tempo. Não passa por cima de nenhum, e é isso que a torna útil: '
      + 'ela resume a nuvem inteira.',
    onde: 'No gráfico, em Elementos do Gráfico → Linha de Tendência.',
    passos: [
      'Clique no gráfico de dispersão.',
      'Abra Elementos do Gráfico e marque Linha de Tendência.',
      'A reta aparece tracejada, por baixo dos pontos.',
    ],
    feita: c => tendenciaNoGrafico(c) === 'tracada' || tendenciaNoGrafico(c) === 'com-equacao',
  },
  {
    id: 'a-equacao',
    titulo: 'Obter a equação da reta',
    detalhe:
      'Ver a reta e saber a conta dela são duas coisas, e no programa são duas '
      + 'caixas. A equação é o que deixa você prever um valor sem medir o '
      + 'gráfico com a régua.',
    onde: 'No gráfico, marcando Exibir Equação — e na aba Cálculos, nas duas linhas da reta.',
    passos: [
      'No mesmo menu do gráfico, marque Exibir Equação.',
      `Na aba Cálculos, escreva =INCLINAÇÃO( e selecione **primeiro** a coluna `
        + `${letraDo(PAR_DO_MODULO_2.y)}, que é a explicada, e depois a coluna `
        + `${letraDo(PAR_DO_MODULO_2.x)}.`,
      'Faça o mesmo com =INTERCEPÇÃO(, na mesma ordem.',
      'Esta ordem não é detalhe: ao contrário, as duas devolvem a reta de x '
        + 'sobre y — outro número, com a mesma cara de certo.',
    ],
    feita: c => tendenciaNoGrafico(c) === 'com-equacao'
      && linhaCompleta(c, ROTULO_INCLINACAO)
      && linhaCompleta(c, ROTULO_INTERCEPCAO),
  },
];

/**
 * Em que pé está a linha de tendência do gráfico.
 *
 * Três estados e não dois, porque no Excel são **duas caixas**: dá para ver a
 * reta e nunca ler a equação dela, que é o que quase todo mundo faz. Colapsar
 * os dois apagaria uma das duas metades do requisito 5.3.
 */
function tendenciaNoGrafico(c: ContextoDaEstatistica): 'sem' | 'tracada' | 'com-equacao' {
  const g = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)?.grafico;
  if (!g || g.tipo !== 'dispersao' || !g.tendencia) return 'sem';
  return g.equacao ? 'com-equacao' : 'tracada';
}

/* ── Módulo 5: prever, e o risco de extrapolar ────────────────────────────── */

/**
 * As duas idades que a lição manda prever, e por que são estas duas.
 *
 * A base vai de dez a quinze anos. Treze está **dentro**, e a reta responde
 * 1,57 m — plausível, e é a previsão que serve para alguma coisa. Vinte e
 * cinco está muito **fora**, e a reta responde 2,58 m com a mesma cara de
 * certeza: mais alto do que qualquer pessoa que já viveu.
 *
 * É o requisito 5.4 inteiro, e ele não se explica com um número discreto: a
 * previsão de dezesseis anos sairia em 1,83 m, que é alto e possível, e quem
 * a visse concluiria que a reta funciona fora do intervalo. O absurdo tem de
 * ser absurdo.
 */
export const CHAVE_RISCO = 'risco-da-extrapolacao';

export const IDADE_DENTRO = 13;
export const IDADE_FORA = 25;

export const rotuloDaPrevisao = (idade: number) => `Previsão para ${idade} anos`;

export function blocoDasPrevisoes(par: ParDeColunas, idades: number[]): BlocoDeContas {
  return {
    titulo: 'O que a reta prevê',
    rotulos: idades.map(rotuloDaPrevisao),
    colunas: ['Altura prevista'],
    funcoes: () => ['PREVISÃO'],
    esperado: (base, linha) => {
      const idade = idades.find(i => rotuloDaPrevisao(i) === linha);
      if (idade === undefined) return null;
      return previsaoDe(idade, colunaDe(base, par.y), colunaDe(base, par.x));
    },
  };
}

export const formulaDaPrevisao = (base: Formulario, par: ParDeColunas, x: number) =>
  `=PREVISÃO(${x};${faixaNaBase(base, par.y)};${faixaNaBase(base, par.x)})`;

export const METAS_DA_PREVISAO: Meta[] = [
  {
    id: 'previu-dentro',
    titulo: `Prever a altura de alguém de ${IDADE_DENTRO} anos`,
    detalhe:
      'A reta serve para isso: dar um palpite para um valor que você não '
      + 'mediu. Dentro do intervalo que a base cobre, o palpite tem no que se '
      + 'apoiar — há gente de verdade em volta dele.',
    onde: 'Na aba Cálculos, na primeira linha das previsões.',
    passos: [
      `Escreva =PREVISÃO(${IDADE_DENTRO}; e depois as duas faixas, o y primeiro.`,
      'É a mesma ordem da inclinação: a explicada antes da que explica.',
    ],
    feita: c => linhaCompleta(c, rotuloDaPrevisao(IDADE_DENTRO)),
  },
  {
    id: 'previu-muito-fora',
    titulo: `E a de alguém de ${IDADE_FORA}`,
    detalhe:
      'A base vai de dez a quinze anos. Vinte e cinco está muito fora dela — e '
      + 'a planilha vai responder de qualquer jeito, sem avisar nada.',
    onde: 'Na aba Cálculos, na segunda linha das previsões.',
    passos: [
      `A mesma fórmula, trocando ${IDADE_DENTRO} por ${IDADE_FORA}.`,
      'Olhe o número que saiu. Compare com a altura da pessoa mais alta que você conhece.',
    ],
    feita: c => linhaCompleta(c, rotuloDaPrevisao(IDADE_FORA)),
  },
  {
    id: 'escreveu-o-risco',
    titulo: 'Escrever por que o segundo número não serve',
    detalhe:
      'A conta está certa e a resposta é absurda. Dizer por quê é o que separa '
      + 'quem usa a reta de quem obedece a ela.',
    onde: 'No caderno da análise, no campo do risco.',
    passos: [
      'Diga até onde vai o intervalo que a base cobre.',
      'Diga o que a reta não tem fora dele: ninguém medido ali para dizer se '
        + 'ela continua valendo.',
      'Cite o número que ela devolveu — é ele que mostra o tamanho do problema.',
    ],
    /*
      Texto escrito, com um dígito dentro. É a conta de "respondida com o dado"
      da CC-ES009: uma explicação do risco que não cita nem o intervalo nem o
      número absurdo é uma explicação de nada em particular — e um campo de
      texto sem conta nenhuma fecharia com "não serve".
    */
    feita: c => frasePropriaComNumero(texto(c, CHAVE_RISCO)),
  },
];

/* ── Módulo 6: a qualidade do ajuste ──────────────────────────────────────── */

export const COL_R2 = 'r²';

export function blocoDoAjuste(pares: ParDeColunas[]): BlocoDeContas {
  return {
    titulo: 'Quanto a reta explica',
    rotulos: pares.map(p => p.rotulo),
    colunas: [COL_R2],
    funcoes: () => ['RQUAD'],
    esperado: (base, linha) => {
      const par = pares.find(p => p.rotulo === linha);
      return par ? rquadDe(colunaDe(base, par.y), colunaDe(base, par.x)) : null;
    },
  };
}

export const formulaDoAjuste = (base: Formulario, par: ParDeColunas) =>
  `=RQUAD(${faixaNaBase(base, par.y)};${faixaNaBase(base, par.x)})`;

/**
 * O par que a reta descreve pior, calculado e não escrito à mão.
 *
 * **Comparativo, e não um corte.** Não há limiar oficial de r² — inventar um e
 * apresentá-lo como fato ensinaria uma precisão que a estatística não tem.
 * O que a lição pergunta é *qual dos três* a reta descreve pior, que é uma
 * pergunta com resposta e sem limiar nenhum.
 */
export function piorAjusteDa(base: Formulario): ParDeColunas {
  let pior = PARES[0];
  let menor = Number.POSITIVE_INFINITY;
  for (const par of PARES) {
    const r2 = rquadDe(colunaDe(base, par.y), colunaDe(base, par.x));
    if (r2 !== null && r2 < menor) {
      menor = r2;
      pior = par;
    }
  }
  return pior;
}

export const METAS_DO_AJUSTE: Meta[] = [
  {
    id: 'o-r-quadrado-dos-tres',
    titulo: 'Calcular quanto a reta explica, nos três pares',
    detalhe:
      'O r² vai de 0 a 1 e diz que parte do vaivém de uma coluna a reta dá '
      + 'conta de explicar. O resto é tudo o que ela não sabe.',
    onde: 'Na aba Cálculos, nas três linhas do bloco de ajuste.',
    passos: [
      'Escreva =RQUAD( com as duas faixas, o y primeiro, como nas outras.',
      'Aqui a ordem não muda a resposta — o r² é simétrico —, mas manter o '
        + 'hábito evita errar nas duas em que ela muda.',
      'Faça os três, para poder comparar.',
    ],
    feita: c => PARES.every(par => linhaCompleta(c, par.rotulo)),
  },
  {
    id: 'achou-o-pior-ajuste',
    titulo: 'Apontar o par que a reta descreve pior',
    detalhe:
      'Não existe número a partir do qual o ajuste "passa": o que existe é '
      + 'comparar, e olhar a nuvem. Num dos três a reta passa longe de muita '
      + 'gente, e o r² diz isso antes de você medir nada.',
    onde: 'No caderno da análise, no bloco "Onde a reta descreve pior".',
    passos: [
      'Compare os três r² que você acabou de calcular.',
      'Volte ao gráfico daquele par e olhe o quanto os pontos se espalham em '
        + 'volta da reta.',
      'Os dois dizem a mesma coisa — e é por isso que o número não substitui a '
        + 'olhada.',
    ],
    feita: c => c.piorAjuste === piorAjusteDa(c.base).id,
  },
];

/* ── Módulo 7: a regressão no par que você escolheu ───────────────────────── */

export const ROTULO_ESCOLHIDO = 'O par que eu escolhi';

/** As colunas entre as quais o desbravador pode escolher o par dele. */
export const COLUNAS_PARA_ESCOLHER = [
  CAMPO_IDADE, CAMPO_ALTURA, CAMPO_ACAMPAMENTOS, CAMPO_DIARIAS,
];

/**
 * O bloco do par escolhido: uma linha, e o que ela espera **não se sabe aqui**.
 *
 * `BlocoDeContas.esperado` recebe a base e o rótulo, e não o contexto — então
 * ele não tem como saber que par a pessoa escolheu. Devolver `null` seria dizer
 * "esta célula deve dar erro", que é outra coisa.
 *
 * Por isso esta meta não passa por `linhaConfere`: ela lê a célula escrita e
 * confere contra a escolha. A disciplina continua a mesma — **a função e o
 * resultado**, e uma referência de verdade —, e o comentário existe para que
 * ninguém a "arrume" para dentro do caminho comum e perca a conta do par.
 */
export const blocoDoEscolhido = (): BlocoDeContas => ({
  titulo: 'A relação que eu quis olhar',
  rotulos: [ROTULO_ESCOLHIDO],
  colunas: [COL_R],
  funcoes: () => ['CORREL'],
  /* Nunca lido por meta nenhuma: ver o comentário acima. */
  esperado: () => null,
});

export const CHAVE_SUGERE = 'o-que-sugere';
export const CHAVE_OUTRA = 'outra-explicacao';
export const CHAVE_DADO = 'dado-que-decidiria';

/** A célula do r do par escolhido, como ela está escrita. */
function escritoNoEscolhido(c: ContextoDaEstatistica): string {
  const linha = linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO);
  if (linha < 0) return '';
  return escritoEm(abaDe(c.caderno, ABA_CALCULOS), linha, 1);
}

/**
 * O r do par escolhido, calculado e conferindo.
 *
 * Confere as três coisas que o caminho comum confere, e por isso: a **função**,
 * porque é ela que a lição ensina; a **referência**, porque `=0,62` começa por
 * igual e não acompanha nada; e o **resultado**, contra o par que a pessoa
 * disse ter escolhido — sem isso, a fórmula de um par e a escolha de outro
 * fechariam a meta juntas.
 */
function rDoEscolhidoConfere(c: ContextoDaEstatistica): boolean {
  const par = c.parEscolhido;
  if (!par || par.x === par.y) return false;
  const escrito = escritoNoEscolhido(c);
  if (!usaFuncao(escrito, 'CORREL')) return false;
  /*
    A guarda da referência fica, e hoje ela é inalcançável **por causa da de
    cima**: um `CORREL` que chegue ao número certo tem de ler as duas colunas,
    e ler coluna é referenciar. A mutação que a apaga não derruba teste nenhum,
    e é assim que se sabe.

    Ela não sai por isso. Em `contaConfere`, que é o caminho comum das outras
    seis lições, `funcoes` pode vir vazia — é o caso da razão entre média e
    mediana, onde não há função a cobrar e o `=1,43` digitado só é pego aqui.
    Duas das três contas aqui e três lá fariam quem lê perguntar qual lição
    perdeu a sua, e é a decisão do `requisitos` separado em
    `ConquistasNasVeredas`: dois nomes para o mesmo número hoje, e a escolha à
    vista em vez de escondida numa linha com cara de erro de digitação.

    O dia em que `formulas.ts` aceitar faixa escrita à mão — `{1;2;3}` —, ela
    volta a ter o que pegar sozinha.
  */
  if (referenciasDe(escrito).length === 0) return false;
  const esperado = correlacaoDe(colunaDe(c.base, par.x), colunaDe(c.base, par.y));
  if (esperado === null) return false;
  const linha = linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO);
  const v = valorCalculado(abaDe(c.caderno, ABA_CALCULOS), linha, 1, c.caderno);
  return v.tipo === 'numero' && Math.abs(v.n - esperado) < 1e-9;
}

export const METAS_DO_ESCOLHIDO: Meta[] = [
  {
    id: 'escolheu-e-calculou',
    titulo: 'Escolher duas colunas e medir a relação entre elas',
    detalhe:
      'Agora é você que decide o que olhar. Escolha duas colunas da base e '
      + 'calcule o r delas — o resto desta lição é sobre o que você vai dizer '
      + 'a respeito desse número.',
    onde: 'Na tela da lição, escolhendo as duas colunas; e na aba Cálculos, na linha do par.',
    passos: [
      'Escolha as duas colunas no alto da tela.',
      'Na aba Cálculos, escreva =CORREL( com as faixas das duas que você escolheu.',
      'Pode ser um par que as lições anteriores não usaram — a ideia é olhar '
        + 'uma relação que ninguém te apontou.',
    ],
    feita: rDoEscolhidoConfere,
  },
  {
    id: 'disse-o-que-sugere',
    titulo: 'Escrever o que a relação sugere',
    detalhe:
      'O número não fala. Diga em palavras o que ele está sugerindo sobre as '
      + 'duas colunas que você escolheu.',
    onde: 'No caderno da análise, no primeiro campo.',
    passos: [
      'Diga se as duas andam juntas ou em sentidos contrários.',
      'Diga o quanto — e use o r que você calculou para dizer isso.',
    ],
    feita: c => frasePropriaComNumero(texto(c, CHAVE_SUGERE)),
  },
  {
    id: 'disse-outra-explicacao',
    titulo: 'Escrever outra explicação possível para o mesmo padrão',
    detalhe:
      'Esta é a metade que o módulo 3 preparou: o mesmo padrão quase sempre '
      + 'aceita mais de uma história. Pense numa que não seja "uma causa a '
      + 'outra".',
    onde: 'No caderno da análise, no segundo campo.',
    passos: [
      'Pense se há uma terceira coisa que puxaria as duas.',
      'Pense se a direção poderia ser a contrária da que parece.',
      'Pense se o padrão poderia vir de quem respondeu, e não do que foi medido.',
    ],
    /*
      Diferente do primeiro campo, e não só preenchida. Repetir o mesmo texto
      nos dois é o sinal de que um dos dois não foi pensado — é a decisão dos
      dois campos do requisito 5.6 da CC-ES009 e das duas justificativas dos
      valores atípicos de lá.
    */
    feita: c => frasePropria(texto(c, CHAVE_OUTRA))
      && texto(c, CHAVE_OUTRA) !== texto(c, CHAVE_SUGERE),
  },
  {
    id: 'disse-que-dado-decidiria',
    titulo: 'Escrever que dado a mais decidiria entre as duas',
    detalhe:
      'Duas explicações para o mesmo padrão não se resolvem discutindo: '
      + 'resolvem-se medindo mais uma coisa. Qual?',
    onde: 'No caderno da análise, no terceiro campo.',
    passos: [
      'Olhe as duas histórias que você escreveu.',
      'Pergunte: que número eu teria de ter para saber qual das duas é?',
      'Pode ser uma coluna que a base não tem — e aí a resposta honesta é que '
        + 'esta base não decide.',
    ],
    feita: c => frasePropria(texto(c, CHAVE_DADO))
      && texto(c, CHAVE_DADO) !== texto(c, CHAVE_OUTRA)
      && texto(c, CHAVE_DADO) !== texto(c, CHAVE_SUGERE),
  },
];

/* ── Módulo 8: refazer sem os atípicos ────────────────────────────────────── */

export const ROTULO_INCL_TODOS = 'Inclinação com todos';
export const ROTULO_INCL_SEM = 'Inclinação sem o atípico';
export const ROTULO_R2_TODOS = 'r² com todos';
export const ROTULO_R2_SEM = 'r² sem o atípico';

const FUNCAO_DA_EXCLUSAO: Record<string, string> = {
  [ROTULO_INCL_TODOS]: 'INCLINAÇÃO',
  [ROTULO_INCL_SEM]: 'INCLINAÇÃO',
  [ROTULO_R2_TODOS]: 'RQUAD',
  [ROTULO_R2_SEM]: 'RQUAD',
};

export const DESCOBERTA_FILTRO = 'esconder-nao-exclui';
export const CHAVE_EFEITO = 'efeito-da-exclusao';

/**
 * A coluna livre ao lado da base, onde a cópia sem o atípico cabe.
 *
 * Ela sai do número de campos, e não de um 11 escrito à mão: campo novo na
 * base empurraria a auxiliar para cima de um dado, e `assinaturaDaBase` — que
 * lê de zero até `camposDaBase().length` — passaria a acusar mexida na base
 * por causa de uma coluna de trabalho.
 */
export const COLUNA_AUXILIAR = camposDaBase().length + 1;

/** A faixa da coluna auxiliar, do jeito que ela se escreve na fórmula. */
export const faixaAuxiliar = (base: Formulario) => {
  const letra = nomeDaColuna(COLUNA_AUXILIAR);
  const linhas = base.respostas.length;
  return `${ABA_RESPOSTAS}!${letra}2:${letra}${linhas + 1}`;
};

/**
 * As linhas que a cerca de Tukey deixa de fora, em qualquer das duas colunas
 * do par.
 *
 * Nas **duas**, e não só na dependente: um valor absurdo de idade estragaria a
 * reta do mesmo jeito, e olhar um lado só deixaria metade dos atípicos dentro
 * da conta que a lição manda refazer sem eles.
 */
export function linhasAtipicasDoPar(base: Formulario, par: ParDeColunas): number[] {
  const colunas = [colunaDe(base, par.x), colunaDe(base, par.y)];
  const cercas = colunas.map(cercaDe);
  const fora: number[] = [];
  for (let i = 0; i < colunas[0].length; i++) {
    const atipica = colunas.some((col, k) => {
      const cerca = cercas[k];
      if (!cerca) return false;
      const n = Number(String(col[i]).replace(',', '.'));
      return Number.isFinite(n) && (n < cerca.piso || n > cerca.teto);
    });
    if (atipica) fora.push(i);
  }
  return fora;
}

/** O par de colunas sem as linhas atípicas, na ordem em que a base as traz. */
export function semAtipicos(base: Formulario, par: ParDeColunas) {
  const fora = new Set(linhasAtipicasDoPar(base, par));
  const x = colunaDe(base, par.x);
  const y = colunaDe(base, par.y);
  const xs: string[] = [];
  const ys: string[] = [];
  for (let i = 0; i < x.length; i++) {
    if (fora.has(i)) continue;
    xs.push(x[i]);
    ys.push(y[i]);
  }
  return { xs, ys };
}

/**
 * O bloco da comparação: quatro linhas, e as duas de cima chegam escritas.
 *
 * "Comparar os dois resultados" é o requisito 7 com todas as letras, e
 * comparação precisa dos dois lados à vista — num bloco, e não em duas telas.
 * As de cima vêm prontas porque os módulos 4 e 6 as produziram: começar
 * mandando refazê-las ensinaria que o trabalho anterior não conta.
 *
 * E é por isso que meta nenhuma lê as duas de cima sozinhas. Elas estão certas
 * no segundo zero, e uma meta sobre elas abriria verde.
 */
export function blocoDaExclusao(par: ParDeColunas): BlocoDeContas {
  return {
    titulo: `A reta de ${par.rotulo}, com e sem`,
    rotulos: [ROTULO_INCL_TODOS, ROTULO_INCL_SEM, ROTULO_R2_TODOS, ROTULO_R2_SEM],
    colunas: ['Valor'],
    funcoes: linha => [FUNCAO_DA_EXCLUSAO[linha]],
    esperado: (base, linha) => {
      const ys = colunaDe(base, par.y);
      const xs = colunaDe(base, par.x);
      const sem = semAtipicos(base, par);
      switch (linha) {
        case ROTULO_INCL_TODOS: return inclinacaoDe(ys, xs);
        case ROTULO_INCL_SEM: return inclinacaoDe(sem.ys, sem.xs);
        case ROTULO_R2_TODOS: return rquadDe(ys, xs);
        case ROTULO_R2_SEM: return rquadDe(sem.ys, sem.xs);
        default: return null;
      }
    },
  };
}

/**
 * A fórmula de "sem o atípico": a coluna auxiliar no lugar do y.
 *
 * `INCLINAÇÃO` e `RQUAD` recebem o y primeiro, como na lição do módulo 4 — e
 * aqui o y é a cópia sem o atípico. O x continua a coluna inteira: o par cai
 * inteiro quando falta um número de qualquer um dos dois lados, então apagar
 * um lado é apagar o par. É a regra de `paresDe`, e é a do Excel.
 */
export const formulaSemAtipico = (base: Formulario, par: ParDeColunas, funcao: string) =>
  `=${funcao}(${faixaAuxiliar(base)};${faixaNaBase(base, par.x)})`;

/**
 * A coluna auxiliar montada: a coluna do y copiada, menos as linhas atípicas.
 *
 * É o gesto que a lição ensina — copiar a coluna para um lado livre e limpar a
 * célula da linha que a cerca apontou. Ela mora na aba da base, que é onde uma
 * coluna de trabalho mora numa planilha de verdade, e **fora** da região que
 * `assinaturaDaBase` lê: coluna de trabalho não é mexer no dado.
 */
export function comColunaAuxiliar(
  c: ContextoDaEstatistica, par: ParDeColunas,
): ContextoDaEstatistica {
  const fora = new Set(linhasAtipicasDoPar(c.base, par));
  const letra = nomeDaColuna(colunaDoCampo(par.y));
  let resp = abaDe(c.caderno, ABA_RESPOSTAS);
  for (let i = 0; i < c.base.respostas.length; i++) {
    resp = escrever(resp, i + 1, COLUNA_AUXILIAR, fora.has(i) ? '' : `=${letra}${i + 2}`);
  }
  return { ...c, caderno: comAba(c.caderno, resp) };
}

/**
 * A base continua inteira, e aqui isto não é zelo: é a trava do atalho.
 *
 * Apagar a linha do atípico e escrever a fórmula da faixa inteira devolve
 * exatamente o número "sem" — com a fórmula parecendo a de "com todos". A
 * comparação do requisito 7 deixaria de existir, e as duas linhas de cima
 * passariam a falar de uma base que já não está lá. É `assinaturaDaBase` da
 * CC-ES009, que lê a região da base como **conjunto**: classificar não
 * aparece, porque ordem de linha não é dado, e apagar, digitar por cima e
 * limpar aparecem os três.
 */
function baseInteira(c: ContextoDaEstatistica): boolean {
  const agora = abaDe(c.caderno, ABA_RESPOSTAS);
  const antes = abaDe(c.cadernoAntes, ABA_RESPOSTAS);
  if (!agora || !antes) return false;
  return assinaturaDaBase(agora) === assinaturaDaBase(antes);
}

/*
  A letra da coluna sai de `colunaDoCampo`, e não escrita à mão.

  Ela já saiu errada uma vez: o passo dizia `=F2` e a altura é a **G** — campo
  novo na base move a letra, e um passo a passo que nomeia a coluna errada
  manda o desbravador copiar a coluna errada e conferir o número contra ela.
*/
const LETRA_DO_Y = nomeDaColuna(colunaDoCampo(PAR_DO_MODULO_2.y));

export const METAS_DA_EXCLUSAO: Meta[] = [
  {
    id: 'viu-que-esconder-nao-exclui',
    titulo: 'Descobrir que esconder a linha não a tira da conta',
    detalhe:
      'O primeiro jeito que todo mundo tenta é o filtro. Filtre a coluna da '
      + 'altura e olhe a inclinação de cima: ela não se move. Filtro é de '
      + 'tela — a linha escondida continua na conta.',
    onde: 'Na aba Respostas, na setinha de filtro da coluna da altura.',
    passos: [
      'Clique na setinha de filtro da coluna Altura e escolha um valor só.',
      'A tela passa a mostrar quase nada — e a linha "Inclinação com todos", '
        + 'na aba Cálculos, continua exatamente no mesmo número.',
      'É a mesma coisa que a SOMA faz na CC-ES003: a linha escondida continua '
        + 'lá. E é por isso que excluir de verdade pede outro caminho.',
    ],
    feita: c => c.descobertas.includes(DESCOBERTA_FILTRO),
  },
  {
    id: 'refez-a-reta-sem-o-atipico',
    titulo: 'Refazer a inclinação sem o valor atípico',
    detalhe:
      'Agora exclua de verdade: uma cópia da coluna numa coluna livre, sem o '
      + 'valor que a cerca apontou, e a inclinação sobre ela.',
    onde: 'Na aba Respostas, numa coluna livre; e na aba Cálculos, na linha "sem o atípico".',
    passos: [
      `Na aba Respostas, numa coluna vazia à direita, escreva =${LETRA_DO_Y}2 `
        + 'e arraste até a última linha.',
      'Limpe a célula da linha do valor atípico, e **só** a dela.',
      'Na aba Cálculos, escreva =INCLINAÇÃO( com a coluna nova e a coluna da '
        + 'idade inteira.',
      'Você só apaga um dos dois lados: o par cai inteiro quando falta um '
        + 'número de qualquer um deles, e é assim que a planilha de verdade '
        + 'faz.',
      'Quem quiser que a conta sobreviva a uma base que muda escreve '
        + `=SE(E(${LETRA_DO_Y}2>=1,135;${LETRA_DO_Y}2<=1,915);${LETRA_DO_Y}2;"") `
        + `no lugar de =${LETRA_DO_Y}2.`,
    ],
    feita: c => baseInteira(c) && linhaCompleta(c, ROTULO_INCL_SEM),
  },
  {
    id: 'refez-o-ajuste-sem-o-atipico',
    titulo: 'Refazer o r² sem o valor atípico',
    detalhe:
      'A inclinação diz o que a reta afirma; o r² diz quanto se pode confiar '
      + 'nela. Os dois precisam ser refeitos, senão a comparação fica só com '
      + 'metade.',
    onde: 'Na aba Cálculos, na linha "r² sem o atípico".',
    passos: [
      'Use a mesma coluna nova que você acabou de montar.',
      'Escreva =RQUAD( com ela e com a coluna da idade.',
      'Compare com o r² de cima antes de seguir.',
    ],
    feita: c => baseInteira(c) && linhaCompleta(c, ROTULO_R2_SEM),
  },
  {
    id: 'relatou-o-efeito',
    titulo: 'Relatar o efeito da exclusão sobre a conclusão',
    detalhe:
      'Esta é a metade que o requisito cobra: não é excluir, é dizer o que a '
      + 'exclusão fez. Olhe os quatro números e escreva se a conclusão mudou, '
      + 'e o quanto.',
    onde: 'No caderno da análise.',
    passos: [
      'Compare as duas inclinações: o que a reta afirma mudou muito?',
      'Compare os dois r²: a reta passou a descrever melhor?',
      'Diga as duas coisas na mesma frase, com os números.',
      'E diga quem é a pessoa que saiu da conta: ela é do clube, e continua '
        + 'sendo.',
    ],
    feita: c => frasePropriaComNumero(texto(c, CHAVE_EFEITO)),
  },
];

/* ── Módulo 9: o acaso entre dois grupos ──────────────────────────────────── */

export const CHAVE_ACASO = 'por-que-pode-ser-acaso';

/**
 * A diferença que a base de verdade mostra entre as duas unidades.
 *
 * Sai do **mesmo** `sortearEntreGrupos` que o desbravador aciona, com zero
 * embaralhos: uma segunda conta da diferença real aqui divergiria da dele no
 * primeiro ajuste, e a divergência apareceria como uma meta que não fecha com
 * a tela mostrando o número certo.
 */
export const diferencaReal = (base: Formulario) => sortearEntreGrupos(
  base, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, GRUPO_A, GRUPO_B, 0,
).real;

export const METAS_DO_ACASO: Meta[] = [
  {
    id: 'embaralhou-e-viu-acontecer',
    titulo: 'Embaralhar quem é de qual unidade e ver a diferença aparecer',
    detalhe:
      'Nada muda na base: os números continuam os mesmos, e só quem é de qual '
      + 'unidade é sorteado de novo. Embaralhe algumas levas e olhe quantas '
      + 'vezes a diferença chega ao tamanho da de verdade.',
    onde: 'Na tela da lição, no botão de embaralhar.',
    passos: [
      'Embaralhe uma leva e olhe a lista de diferenças que saiu.',
      'Embaralhe outra: uma leva só deixa você ler "aconteceu" ou "não '
        + 'aconteceu", e o que há para ler é uma frequência.',
      'Conte quantas chegaram no tamanho da diferença de verdade.',
    ],
    /*
      Duas contas, e nenhuma substitui a outra. **Quantos** embaralhos, porque
      um sorteio não é frequência; e **ter chegado** na diferença real ao
      menos uma vez, porque é isso que a lição manda ver acontecer — e ler
      sobre o acaso não é a mesma coisa que vê-lo chegar lá.
    */
    feita: c => c.sorteios.length >= SORTEIOS_MINIMOS
      && c.sorteios.some(d => d >= diferencaReal(c.base) - 1e-9),
  },
  {
    id: 'leu-o-que-o-embaralho-diz',
    titulo: 'Dizer o que esse resultado significa',
    detalhe:
      'O número que saiu do embaralho responde a uma pergunta bem específica, '
      + 'e três das quatro frases abaixo respondem a outra.',
    onde: 'Na tela da lição, nas quatro leituras.',
    passos: [
      'Olhe a frequência que você obteve.',
      'Pergunte de que ela é a frequência: do sorteio, ou das unidades?',
      'Uma das quatro fala do sorteio. As outras três falam de coisas que o '
        + 'embaralho não mediu.',
    ],
    feita: c => c.leituraDoAcaso === leituraDoAcasoCerta(),
  },
  {
    id: 'escreveu-por-que-pode-ser-acaso',
    titulo: 'Escrever por que uma diferença entre dois grupos pode ser do acaso',
    detalhe:
      'Com as suas palavras, e com o número que você obteve. Esta é a metade '
      + 'do requisito que a escolha de cima não cobre: explicar.',
    onde: 'No caderno da análise.',
    passos: [
      'Diga quantas pessoas tem cada um dos dois grupos.',
      'Diga o que você viu o embaralho fazer, com a frequência.',
      'Diga o que isso tira da conclusão que alguém levaria para a reunião.',
    ],
    feita: c => frasePropriaComNumero(texto(c, CHAVE_ACASO)),
  },
  {
    id: 'escolheu-as-tres-providencias',
    titulo: 'Escolher as três providências que aumentariam a confiança',
    detalhe:
      'São sete na lista, e quatro delas só parecem aumentar. Nenhuma das '
      + 'quatro é bobagem — todas são coisas que se fazem de boa fé achando '
      + 'que ajudam.',
    onde: 'Na tela da lição, na lista de providências.',
    passos: [
      'De cada uma, pergunte: isto acrescenta dado, ou arruma o que já tenho?',
      'Uma delas é o módulo 8 desta vereda aparecendo de novo.',
      'Outra é conferir a aritmética, que já estava certa.',
    ],
    /*
      Conjunto **igual**, e não conjunto que contém: exigir só que as três
      certas estejam marcadas deixaria "marque todas as sete" passar com
      louvor. É a conta dos indícios da CC-ES005, pelo motivo escrito lá.
    */
    feita: (c) => {
      const certas = providenciasQueAumentam();
      const marcadas = new Set(c.providencias);
      return marcadas.size === certas.length && certas.every(id => marcadas.has(id));
    },
  },
];

/* ── Módulo 10: o grau de confiança declarado ─────────────────────────────── */

export const CHAVE_RAZOES = 'razoes-do-grau';

export const METAS_DA_CONFIANCA: Meta[] = [
  /*
    A divisão em duas é a do módulo 1, pelo motivo escrito lá: "todo achado
    classificado" vermelha diz "continue", e "classificação certa" vermelha diz
    "volte e releia um deles". Uma meta só diria as duas coisas com a mesma cor.
  */
  {
    id: 'classificou-todos-os-achados',
    titulo: 'Dizer, de cada achado, se ele sustenta ou se ele limita',
    detalhe:
      'A apresentação completa é a dos oito. Toda apresentação de dados do '
      + 'mundo abre com o que sustenta e deixa os limites para a pergunta que '
      + 'talvez não venha.',
    onde: 'Na tela da lição, em cada achado.',
    passos: [
      'Leia o achado e pergunte: isto é um número a meu favor, ou é um aviso '
        + 'de até onde eu posso ir?',
      'Nenhum dos oito é enfeite — cada um saiu de um módulo que você fez.',
      'Classifique os oito antes de olhar o grau: é a classificação que decide '
        + 'quais graus sobram.',
    ],
    feita: c => ACHADOS.every(a => c.pesos[a.id] !== undefined),
  },
  {
    id: 'as-classificacoes-certas',
    titulo: 'E acertar as oito',
    detalhe:
      'Sete se classificam na primeira olhada. O oitavo é o r² que subiu de '
      + '0,83 para 0,94 quando você tirou o valor atípico — e a leitura '
      + 'natural dele é a errada.',
    onde: 'Nos mesmos oito achados.',
    passos: [
      'Um ajuste que melhorou parece sustento, e é limite: o que subiu foi a '
        + 'confiança aparente, não o acerto.',
      'O mesmo resultado do módulo 8 aparece duas vezes na lista, uma de cada '
        + 'lado — de propósito, porque um resultado tem os dois.',
      'Amostra, causa, extrapolação e acaso limitam. Força da relação, direção '
        + 'clara e conclusão que não depende de uma pessoa sustentam.',
    ],
    feita: c => ACHADOS.every(a => c.pesos[a.id] === a.peso),
  },
  {
    id: 'declarou-um-grau-que-se-sustenta',
    titulo: 'Declarar o grau de confiança, e um que os seus achados sustentem',
    detalhe:
      'É o requisito com todas as letras: declarar **expressamente** de quanto '
      + 'você confia. Dois dos quatro graus esta análise não sustenta, e o '
      + 'cartão de cada um diz a que ele compromete você.',
    onde: 'Na tela da lição, nos quatro graus.',
    passos: [
      '"Alta" só se sustenta se nenhum achado estiver limitando — e você '
        + 'acabou de nomear cinco que limitam.',
      '"Nenhuma" só se sustenta se nada estiver sustentando, e aí não haveria '
        + 'o que apresentar.',
      'Entre as outras duas, a escolha é sua: a plataforma não tem como dizer '
        + 'qual, e fingir que tem seria ela respondendo no seu lugar.',
    ],
    feita: c => c.grau !== undefined && grauCoerente(c.grau),
  },
  {
    id: 'escreveu-as-razoes',
    titulo: 'Escrever as razões dessa avaliação',
    detalhe:
      'O grau sozinho é uma palavra. As razões são o que o examinador vai '
      + 'ouvir, e elas saem dos seus achados — com os números deles.',
    onde: 'No caderno da análise.',
    passos: [
      'Diga o que sustenta a sua conclusão, com o número.',
      'Diga o que a limita, com o número.',
      'Diga, por causa dos dois, por que o grau é esse e não o de cima.',
    ],
    feita: c => frasePropriaComNumero(texto(c, CHAVE_RAZOES)),
  },
];

/* ── O registro ───────────────────────────────────────────────────────────── */

export type ProgramaDaCcEs010 = 'planilha' | 'plataforma';

/*
  A união cresce com as lições. A décima não compila até alguém dizer de que
  estado ela parte e o que ela cobra, que é a decisão do `Record` sobre a união
  da CC-ES003 e da CC-ES008: com um ternário ou um `if` em escada, a lição nova
  cairia calada na primeira.
*/
export type LicaoDaCcEs010 =
  | 'amostra' | 'correlacao' | 'espuria' | 'reta' | 'prever' | 'ajuste'
  | 'escolhido'
  | 'exclusao'
  | 'acaso'
  | 'confianca';

export interface LicaoDeEstatistica {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs010;
  inicial: () => ContextoDaEstatistica;
  metas: Meta[];
}

/** A pasta como ela chega, sem nada calculado. */
export function contextoInicial(
  blocos: BlocoDeContas[] = [blocoDosPares([PAR_DO_MODULO_2])],
): ContextoDaEstatistica {
  const base = baseDoAcampamento();
  const caderno = cadernoDaAnalise(base, blocos);
  return {
    base,
    caderno,
    cadernoAntes: caderno,
    blocos,
    descobertas: [],
    classificacoes: {},
    sorteios: [],
    providencias: [],
    pesos: {},
    textos: {},
  };
}

/**
 * A pasta com a dispersão do módulo 2 já desenhada.
 *
 * O módulo 4 parte dela: a lição anterior a desenhou, e começar mandando
 * refazê-la ensinaria que o trabalho anterior não conta. Ela chega **sem** a
 * linha de tendência, que é o que esta lição pede.
 */
function comDispersaoPronta(c: ContextoDaEstatistica): ContextoDaEstatistica {
  const par = PAR_DO_MODULO_2;
  const r = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)!;
  const cx = colunaDoCampo(par.x);
  const cy = colunaDoCampo(par.y);
  const comGrafico: Planilha = {
    ...r,
    grafico: {
      tipo: 'dispersao',
      titulo: par.rotulo,
      eixoX: rotuloDoCampo(par.x),
      eixoY: rotuloDoCampo(par.y),
      faixa: {
        l1: 1, c1: Math.min(cx, cy), l2: c.base.respostas.length, c2: Math.max(cx, cy),
      },
    },
  };
  /*
    Os **dois** campos, e não só o de agora.

    `cadernoAntes` é a pasta de quando a lição abriu, e é contra ela que "o que
    mudou?" se mede. Mexendo só em `caderno`, a dispersão que a lição **entrega**
    contaria como trabalho de quem abriu — e a trava de "a pasta de quando abriu
    é a mesma pasta" pegou isto na primeira execução.
  */
  const caderno = comAba(c.caderno, comGrafico);
  return { ...c, caderno, cadernoAntes: caderno };
}

/**
 * A pasta com a reta e o ajuste do par do módulo 2 **já calculados**.
 *
 * O módulo 8 compara, e comparação precisa dos dois lados. As duas linhas de
 * cima são o que os módulos 4 e 6 produziram, e refazê-las aqui ensinaria que
 * o trabalho anterior não conta — é o campo `documento` da CC-ES002 e o
 * `caderno` da CC-ES003.
 *
 * Os **dois** campos da pasta, como em `comDispersaoPronta`: mexendo só em
 * `caderno`, o que a lição entrega contaria como trabalho de quem abriu.
 */
function comRetaEAjustePronto(c: ContextoDaEstatistica): ContextoDaEstatistica {
  const par = PAR_DO_MODULO_2;
  let calc = abaDe(c.caderno, ABA_CALCULOS);
  calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INCL_TODOS), 1,
    formulaDaReta(c.base, par, 'INCLINAÇÃO'));
  calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_R2_TODOS), 1,
    formulaDoAjuste(c.base, par));
  const caderno = comAba(c.caderno, calc);
  return { ...c, caderno, cadernoAntes: caderno };
}

export const LICOES_DA_CC_ES010: Record<LicaoDaCcEs010, LicaoDeEstatistica> = {
  amostra: {
    /*
      Tela da plataforma, e não planilha: não há botão de planilha nenhuma que
      classifique uma coleta. O que ela ofereceria é digitar a palavra numa
      célula, que mede digitação.
    */
    programa: 'plataforma',
    inicial: contextoInicial,
    metas: METAS_DA_AMOSTRA,
  },
  correlacao: {
    programa: 'planilha',
    /* Um par na aba de cálculos, e não os três: o módulo 3 é que compara, e
       três linhas aqui prometeriam trabalho que esta lição não pede — a regra
       do `aoBuscar` do Explorador. */
    inicial: () => contextoInicial([blocoDosPares([PAR_DO_MODULO_2])]),
    metas: METAS_DA_CORRELACAO,
  },
  espuria: {
    programa: 'planilha',
    /* Os três pares, porque o que esta lição manda ver é a comparação entre
       eles — e não cada número sozinho. */
    inicial: () => contextoInicial([blocoDosPares(PARES)]),
    metas: METAS_DA_ESPURIA,
  },
  reta: {
    programa: 'planilha',
    /*
      Parte com a dispersão **já desenhada**, porque o módulo 2 a desenhou:
      começar mandando refazê-la ensinaria que o trabalho anterior não conta.
      É o campo `documento` da CC-ES002 e o `caderno` da CC-ES003.
    */
    inicial: () => comDispersaoPronta(contextoInicial([blocoDaReta(PAR_DO_MODULO_2)])),
    metas: METAS_DA_RETA,
  },
  prever: {
    programa: 'planilha',
    inicial: () => contextoInicial(
      [blocoDasPrevisoes(PAR_DO_MODULO_2, [IDADE_DENTRO, IDADE_FORA])],
    ),
    metas: METAS_DA_PREVISAO,
  },
  ajuste: {
    programa: 'planilha',
    inicial: () => contextoInicial([blocoDoAjuste(PARES)]),
    metas: METAS_DO_AJUSTE,
  },
  escolhido: {
    programa: 'planilha',
    inicial: () => contextoInicial([blocoDoEscolhido()]),
    metas: METAS_DO_ESCOLHIDO,
  },
  exclusao: {
    programa: 'planilha',
    inicial: () => comRetaEAjustePronto(
      contextoInicial([blocoDaExclusao(PAR_DO_MODULO_2)]),
    ),
    metas: METAS_DA_EXCLUSAO,
  },
  acaso: {
    /*
      Tela da plataforma, e não planilha. Embaralhar rótulos deixando as
      medidas onde estão é, numa planilha, ordenar **só** a coluna da chave —
      o gesto que a CC-ES003 existe para proibir e que `ordenar` recusa de
      propósito. A lição teria de ensinar o errado para mostrar o certo.
    */
    programa: 'plataforma',
    inicial: contextoInicial,
    metas: METAS_DO_ACASO,
  },
  confianca: {
    /* Tela da plataforma: não há botão de planilha nenhuma que declare grau de
       confiança, e o que ela ofereceria é digitar a palavra numa célula. */
    programa: 'plataforma',
    inicial: contextoInicial,
    metas: METAS_DA_CONFIANCA,
  },
};

/**
 * Um sorteio reprodutível, para a solução de referência não depender de sorte.
 *
 * `sortearEntreGrupos` recebe o sorteio por parâmetro justamente por isto: com
 * `Math.random`, a trava de "a solução fecha" passaria a falhar sozinha nas
 * vezes em que nenhum dos cinquenta embaralhos chegasse na diferença real —
 * uma vez em duas mil e quinhentas nesta base. "Flake" é o que ensina a
 * reexecutar em vez de ler.
 *
 * E a semente fixa tem um efeito que é desejado: se a base mudar de um jeito
 * que torne a diferença real inalcançável pelo acaso, esta solução deixa de
 * fechar — que é a falha certa, porque a lição inteira passaria a ensinar uma
 * coisa que a base não mostra mais.
 */
function aleatorioSemeado(semente: number): Aleatorio {
  let s = semente;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** A solução de referência de cada lição, para a trava provar que ela fecha. */
export const SOLUCOES_DA_CC_ES010: Record<
  LicaoDaCcEs010, (c: ContextoDaEstatistica) => ContextoDaEstatistica
> = {
  amostra: c => ({
    ...c,
    populacao: populacaoCerta(),
    classificacoes: Object.fromEntries(COLETAS.map(co => [co.id, certaPara(co.forma)])),
  }),
  /*
    Escrita como quem faz a lição direito: a fórmula de verdade, na aba de
    verdade, com a faixa de verdade, e a planilha calculando. Carimbar o valor
    à mão provaria o fim e não provaria o caminho — foi assim que a lição de
    assinar da CC-ES004 chegou impossível de vencer com a trava de motor
    passando.
  */
  correlacao: (c) => {
    const par = PAR_DO_MODULO_2;
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, par.rotulo),
      1,
      formulaDoR(c.base, par),
    );
    const respostas = abaDe(c.caderno, ABA_RESPOSTAS);
    const cx = colunaDoCampo(par.x);
    const cy = colunaDoCampo(par.y);
    const comGrafico: Planilha = {
      ...respostas,
      grafico: {
        tipo: 'dispersao',
        titulo: par.rotulo,
        eixoX: rotuloDoCampo(par.x),
        eixoY: rotuloDoCampo(par.y),
        faixa: {
          l1: 1,
          c1: Math.min(cx, cy),
          l2: c.base.respostas.length,
          c2: Math.max(cx, cy),
        },
      },
    };
    return {
      ...c,
      caderno: comAba(comAba(c.caderno, calc), comGrafico),
      leituraDeR: leituraCerta(),
    };
  },
  reta: (c) => {
    const par = PAR_DO_MODULO_2;
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INCLINACAO), 1,
      formulaDaReta(c.base, par, 'INCLINAÇÃO'));
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INTERCEPCAO), 1,
      formulaDaReta(c.base, par, 'INTERCEPÇÃO'));
    const r = c.caderno.planilhas.find(x => x.nome === ABA_RESPOSTAS)!;
    const comReta: Planilha = {
      ...r,
      grafico: { ...r.grafico!, tendencia: true, equacao: true },
    };
    return {
      ...c,
      caderno: comAba(comAba(c.caderno, calc), comReta),
      independente: independenteCerta(),
    };
  },
  prever: (c) => {
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    for (const idade of [IDADE_DENTRO, IDADE_FORA]) {
      calc = escrever(calc, linhaDoRotulo(c.blocos, rotuloDaPrevisao(idade)), 1,
        formulaDaPrevisao(c.base, PAR_DO_MODULO_2, idade));
    }
    return {
      ...c,
      caderno: comAba(c.caderno, calc),
      textos: {
        ...c.textos,
        [CHAVE_RISCO]:
          'A base só tem gente de 10 a 15 anos. Fora desse intervalo a reta '
          + 'nunca foi testada: ninguém de 25 anos foi medido para dizer se ela '
          + 'continua valendo. Ela respondeu 2,58 m, que é mais alto do que '
          + 'qualquer pessoa que já viveu — a conta está certa e a resposta não '
          + 'serve.',
      },
    };
  },
  ajuste: (c) => {
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    for (const par of PARES) {
      calc = escrever(calc, linhaDoRotulo(c.blocos, par.rotulo), 1,
        formulaDoAjuste(c.base, par));
    }
    return {
      ...c,
      caderno: comAba(c.caderno, calc),
      piorAjuste: piorAjusteDa(c.base).id,
    };
  },
  escolhido: (c) => {
    /*
      A solução escolhe um par que as lições anteriores **não** usaram: o
      exercício é olhar uma relação que ninguém apontou, e repetir o par do
      módulo 2 provaria o gesto e não a escolha.
    */
    const par = { x: CAMPO_IDADE, y: CAMPO_DIARIAS };
    const calc = escrever(
      abaDe(c.caderno, ABA_CALCULOS),
      linhaDoRotulo(c.blocos, ROTULO_ESCOLHIDO),
      1,
      `=CORREL(${faixaNaBase(c.base, par.x)};${faixaNaBase(c.base, par.y)})`,
    );
    return {
      ...c,
      caderno: comAba(c.caderno, calc),
      parEscolhido: par,
      textos: {
        ...c.textos,
        [CHAVE_SUGERE]:
          'O r entre idade e diárias deu 0,33, que é baixo: quem é mais velho '
          + 'tende a dormir um pouco mais noites no acampamento, mas muito '
          + 'pouco — a relação existe e é fraca.',
        [CHAVE_OUTRA]:
          'Pode não ser a idade. Talvez quem mora longe durma todas as noites '
          + 'e quem mora perto vá e volte, e os que moram longe sejam por acaso '
          + 'os mais velhos. A distância explicaria as duas coisas sem a idade '
          + 'causar nada.',
        [CHAVE_DADO]:
          'Precisaria da distância entre a casa de cada um e o lugar do '
          + 'acampamento. Com ela eu olharia se a relação entre idade e diárias '
          + 'continua de pé dentro de quem mora igualmente longe. Esta base não '
          + 'tem essa coluna, então ela não decide.',
      },
    };
  },
  exclusao: (c) => {
    /*
      A solução faz o caminho inteiro, e não o fim dele: monta a coluna
      auxiliar, escreve as duas contas sobre ela, e **passa pela descoberta do
      filtro**. Solução que pula o meio prova o fim e não prova o caminho — é
      a lição que a CC-ES004 pagou para aprender na lição de assinar.
    */
    const par = PAR_DO_MODULO_2;
    const comAuxiliar = comColunaAuxiliar(c, par);
    let calc = abaDe(comAuxiliar.caderno, ABA_CALCULOS);
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_INCL_SEM), 1,
      formulaSemAtipico(c.base, par, 'INCLINAÇÃO'));
    calc = escrever(calc, linhaDoRotulo(c.blocos, ROTULO_R2_SEM), 1,
      formulaSemAtipico(c.base, par, 'RQUAD'));
    return {
      ...comAuxiliar,
      caderno: comAba(comAuxiliar.caderno, calc),
      descobertas: [...c.descobertas, DESCOBERTA_FILTRO],
      textos: {
        ...c.textos,
        [CHAVE_EFEITO]:
          'Tirar o valor atípico quase não mudou o que a reta afirma: ela '
          + 'dizia 8,4 centímetros por ano de idade e passou a dizer 8,0, e a '
          + 'altura prevista para 13 anos andou meio centímetro. O que mudou '
          + 'foi o r², que subiu de 0,83 para 0,94 — a reta passou a parecer '
          + 'muito mais certa sem ter ficado mais certa. E quem saiu da conta '
          + 'é o desbravador de 11 anos com 1,05 m, que é do clube e continua '
          + 'sendo.',
      },
    };
  },
  acaso: (c) => {
    const { sorteadas } = sortearEntreGrupos(
      c.base, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, GRUPO_A, GRUPO_B,
      SORTEIOS_MINIMOS, aleatorioSemeado(20261004),
    );
    return {
      ...c,
      sorteios: sorteadas,
      leituraDoAcaso: leituraDoAcasoCerta(),
      providencias: providenciasQueAumentam(),
      textos: {
        ...c.textos,
        [CHAVE_ACASO]:
          'A Arara tem 7 inscritos e a Águia tem 8, e com grupos desse tamanho '
          + 'trocar duas pessoas de lado já muda a média. Embaralhando quem é '
          + 'de qual unidade, sem mexer em nenhum número, uma diferença tão '
          + 'grande quanto a de verdade (2,59 acampamentos) apareceu cerca de '
          + 'uma vez em sete. Então 4,71 contra 2,13 não autoriza dizer que a '
          + 'Arara acampa mais: a diferença existe e não distingue as '
          + 'unidades.',
      },
    };
  },
  confianca: (c) => {
    const pesos: Record<string, PesoDoAchado> = {};
    for (const a of ACHADOS) pesos[a.id] = a.peso;
    return {
      ...c,
      pesos,
      /*
        "Média" e não "baixa", e a escolha é defensável: a relação entre idade
        e altura é forte, sobrevive à exclusão do atípico e tem direção clara.
        O que ela não é é livre de limites, e é por isso que não é "alta".
      */
      grau: 'media',
      textos: {
        ...c.textos,
        [CHAVE_RAZOES]:
          'Confio de forma média. A favor: o r entre idade e altura é 0,91, o '
          + 'r² é 0,83, a direção é clara e tirar o valor atípico não mudou o '
          + 'que a reta afirma (8,4 contra 8,0 centímetros por ano). Contra: a '
          + 'base veio de um formulário divulgado no grupo do clube, então ela '
          + 'não é o clube; a relação entre altura e acampamentos é explicada '
          + 'pela idade e não por si; a reta prevê 2,58 m aos 25 anos, que é '
          + 'extrapolação; e a diferença entre Arara e Águia aparece por '
          + 'sorteio uma vez em sete. Não é "alta" porque esses quatro limites '
          + 'existem e eu sei nomeá-los.',
      },
    };
  },
  espuria: (c) => {
    let calc = abaDe(c.caderno, ABA_CALCULOS);
    for (const par of PARES) {
      calc = escrever(calc, linhaDoRotulo(c.blocos, par.rotulo), 1, formulaDoR(c.base, par));
    }
    const espurio = parEspurio();
    return {
      ...c,
      caderno: comAba(c.caderno, calc),
      parApontado: espurio.id,
      colunaEscondida: espurio.escondida,
    };
  },
};

export const rotuloDoCampo = (campoId: string) =>
  camposDaBase().find(c => c.id === campoId)?.rotulo ?? campoId;

/** As populações que a tela oferece, na ordem em que ela as desenha. */
export const POPULACOES_DA_LICAO = POPULACOES;

/** As quatro leituras do embaralho, na ordem em que a tela as desenha. */
export const LEITURAS_DO_ACASO_DA_LICAO = LEITURAS_DO_ACASO;

/** As sete providências, na ordem em que a tela as desenha. */
export const PROVIDENCIAS_DA_LICAO = PROVIDENCIAS;

/** Os oito achados e os quatro graus, na ordem em que a tela os desenha. */
export const ACHADOS_DA_LICAO = ACHADOS;
export const GRAUS_DA_LICAO = GRAUS;
