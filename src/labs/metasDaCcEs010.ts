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
import type { Caderno } from './planilha';
import { baseDoAcampamento } from './baseDoAcampamento';
import {
  type BlocoDeContas,
  BLOCO_DAS_MEDIDAS, cadernoDaAnalise,
} from './metasDaCcEs009';
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

/* ── O registro ───────────────────────────────────────────────────────────── */

export type ProgramaDaCcEs010 = 'planilha' | 'plataforma';

/*
  A união cresce com as lições. A décima não compila até alguém dizer de que
  estado ela parte e o que ela cobra, que é a decisão do `Record` sobre a união
  da CC-ES003 e da CC-ES008: com um ternário ou um `if` em escada, a lição nova
  cairia calada na primeira.
*/
export type LicaoDaCcEs010 = 'amostra';

export interface LicaoDeEstatistica {
  /** Em que programa a lição **começa**. Um gesto pode levar ao outro. */
  programa: ProgramaDaCcEs010;
  inicial: () => ContextoDaEstatistica;
  metas: Meta[];
}

/** A pasta como ela chega, sem nada calculado. */
export function contextoInicial(
  blocos: BlocoDeContas[] = [BLOCO_DAS_MEDIDAS],
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
};

/** As populações que a tela oferece, na ordem em que ela as desenha. */
export const POPULACOES_DA_LICAO = POPULACOES;
