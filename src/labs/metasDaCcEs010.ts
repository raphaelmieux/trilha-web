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
import { type Caderno, type Planilha, escrever } from './planilha';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE, baseDoAcampamento, camposDaBase,
} from './baseDoAcampamento';
import {
  type BlocoDeContas,
  ABA_CALCULOS, ABA_RESPOSTAS, cadernoDaAnalise, colunaDoCampo, faixaDoCampo,
  linhaConfere, linhaDoRotulo,
} from './metasDaCcEs009';
import { colunaDe, correlacaoDe } from './analiseDeDados';
import { abaDe, comAba } from './cadernoDoClube';
import { nomeDaColuna } from './formulas';
import {
  type FormaDeEnviesar,
  COLETAS, POPULACOES, populacaoCerta,
} from './amostraDoClube';

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
  /** O que ela escreveu, por chave. */
  textos: Record<string, string>;
}

/* ── Atalhos de leitura ───────────────────────────────────────────────────── */

const classificada = (c: ContextoDaEstatistica, id: string) => c.classificacoes[id] !== undefined;

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
    feita: c => linhaConfere(c.caderno, c.blocos, c.base, PAR_DO_MODULO_2.rotulo),
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

/* ── O registro ───────────────────────────────────────────────────────────── */

export type ProgramaDaCcEs010 = 'planilha' | 'plataforma';

/*
  A união cresce com as lições. A décima não compila até alguém dizer de que
  estado ela parte e o que ela cobra, que é a decisão do `Record` sobre a união
  da CC-ES003 e da CC-ES008: com um ternário ou um `if` em escada, a lição nova
  cairia calada na primeira.
*/
export type LicaoDaCcEs010 = 'amostra' | 'correlacao';

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
    textos: {},
  };
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
};

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
};

const rotuloDoCampo = (campoId: string) =>
  camposDaBase().find(c => c.id === campoId)?.rotulo ?? campoId;

/** As populações que a tela oferece, na ordem em que ela as desenha. */
export const POPULACOES_DA_LICAO = POPULACOES;
