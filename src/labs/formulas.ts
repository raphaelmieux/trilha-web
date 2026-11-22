/**
 * O motor de fórmulas da planilha.
 *
 * ── Por que ele existe ─────────────────────────────────────────────────────
 * A planilha desta plataforma não calculava. `valorDe`, em `metasDaAp043.ts`,
 * entendia exatamente `=SOMA(A1:B2)` e `=MÉDIA(A1:B2)`, e devolvia `#NOME?`
 * para todo o resto; o laboratório da AP044 confere a fórmula do total por
 * **prefixo de texto**. Isso bastou enquanto o que se cobrava era ter escrito
 * a fórmula.
 *
 * A CC-ES003 cobra outra coisa. O requisito 7 manda achar, numa planilha
 * defeituosa, **um número armazenado como texto** — e isso só significa
 * alguma coisa se a `SOMA` de fato pular a célula e mostrar um total plausível
 * e errado. O 4.3 manda mostrar quando a referência absoluta é necessária, o
 * que só se entende arrastando a fórmula para baixo e vendo as relativas
 * andarem enquanto as travadas ficam. Nenhuma das duas se mede comparando
 * texto.
 *
 * ── E por que ele é um só ──────────────────────────────────────────────────
 * `valorDe` passou a chamar daqui. Dois avaliadores de fórmula na mesma base
 * é o defeito dos dois "Word" e dos dois "Explorador" outra vez: divergem no
 * primeiro ajuste, e aí a mesma fórmula dá dois resultados em duas lições.
 *
 * ── Matriz, e o derramamento ──────────────────────────────────────────────
 * Uma fórmula pode devolver uma tabela inteira — `=A3:A20*B3:B20`, `=FILTRO(...)`,
 * `=SEQUÊNCIA(5)` —, e ela **derrama**: o resultado ocupa as células abaixo e
 * à direita de onde foi escrita, como no Excel de hoje e no Planilhas Google.
 * Só a célula de cima à esquerda guarda a fórmula; as outras mostram o valor e
 * continuam vazias por dentro. É por isso que escrever em uma delas não apaga
 * nada: tranca o derramamento, e a fórmula passa a dizer `#DESPEJAR!`.
 *
 * Por dentro, a matriz é um tipo do motor e nunca sai dele: `valorDaCelula`
 * continua devolvendo um valor só, o da célula pedida. Quem quer saber de que
 * fórmula um valor derramado veio pergunta à sessão (`criarSessao`).
 *
 * ── O que ele não sabe ─────────────────────────────────────────────────────
 * Não há hora, e não há curinga (`*`, `?`) em critério de CONT.SE e SOMASE. É
 * deliberado: cada um é assunto de outra vereda, e função que existe pela
 * metade ensina errado com mais eficiência do que função que não existe. O
 * curinga existe só onde a fórmula o pede pelo nome — o modo 2 do PROCX e do
 * CORRESPX —, e ali ele está inteiro.
 */

/* ── Valores e erros ──────────────────────────────────────────────────────── */

/*
  Os nomes dos erros são os do Excel em português, porque é o que o
  desbravador vai ver na tela do clube. `circular` é a exceção, e está
  explicada onde ela é produzida.
*/
import { MAIOR_SERIE, diaDaSerie, serieDe, serieDeHoje, serieDoTexto, textoDaData } from './datas';

export type Erro = 'nome' | 'valor' | 'div0' | 'ref' | 'nd' | 'num' | 'circular' | 'despejar' | 'calc';

export const TEXTO_DO_ERRO: Record<Erro, string> = {
  nome: '#NOME?',
  valor: '#VALOR!',
  div0: '#DIV/0!',
  ref: '#REF!',
  nd: '#N/D',
  num: '#NÚM!',
  /*
    O Excel não tem erro de referência circular: ele recusa a fórmula numa
    caixa de diálogo e deixa **zero** na célula, com um aviso na barra de
    status que ninguém lê. Zero aqui seria o número plausível e errado que
    esta plataforma inteira existe para não mostrar — e quem digita `=A1` em
    A1 é justamente quem não faz ideia do que aconteceu. Então a célula diz o
    que houve.
  */
  circular: 'Ref. circular',
  /*
    A matriz não tem onde cair: alguma célula do caminho está preenchida, o
    resultado passa da borda da planilha, ou outro derramamento chegou antes.
    É o #SPILL! do Excel em inglês, e o nome em português é este mesmo.
  */
  despejar: '#DESPEJAR!',
  /*
    O cálculo não tem resposta para dar — o FILTRO que não achou ninguém, a
    SEQUÊNCIA de zero linhas. Não é zero nem vazio: uma lista vazia mostrada
    como célula em branco seria lida como "a fórmula não fez nada".
  */
  calc: '#CALC!',
};

export type Valor =
  | { tipo: 'numero'; n: number }
  | { tipo: 'texto'; t: string }
  | { tipo: 'logico'; b: boolean }
  | { tipo: 'vazio' }
  | { tipo: 'erro'; e: Erro };

export const num = (n: number): Valor => (Number.isFinite(n) ? { tipo: 'numero', n } : erro('num'));
export const txt = (t: string): Valor => ({ tipo: 'texto', t });
export const logico = (b: boolean): Valor => ({ tipo: 'logico', b });
export const VAZIO: Valor = { tipo: 'vazio' };
export const erro = (e: Erro): Valor => ({ tipo: 'erro', e });

export const ehErro = (v: Valor): v is { tipo: 'erro'; e: Erro } => v.tipo === 'erro';

/**
 * Uma tabela de valores, linha a linha — o que `=A1:B3` ou `=FILTRO(...)` devolve.
 *
 * Fica dentro do motor. Quem está do lado de fora pede uma célula e recebe um
 * `Valor`, porque é isso que uma célula mostra; a matriz só existe enquanto a
 * conta está sendo feita e no derramamento que ela produz.
 */
interface Matriz {
  linhas: number;
  colunas: number;
  vs: Valor[];
}

/** O que uma expressão devolve: um valor, ou uma tabela deles. */
type Res = Valor | Matriz;

const ehMatriz = (r: Res): r is Matriz => 'vs' in r;
const matriz = (linhas: number, colunas: number, vs: Valor[]): Matriz => ({ linhas, colunas, vs });
const em = (m: Matriz, i: number, j: number): Valor => m.vs[i * m.colunas + j];
const comoMatriz = (r: Res): Matriz => (ehMatriz(r) ? r : matriz(1, 1, [r]));

/*
  Matriz de uma célula só é um valor, e não uma tabela: `=A1:A1` mostra o que
  está em A1, e `=ÍNDICE(B2:B9;3)` devolve uma célula que se usa como qualquer
  outra. Sem esta volta, toda conta que passasse por uma matriz de um elemento
  sairia como tabela e derramaria sobre nada.
*/
const simplificar = (r: Res): Res => (ehMatriz(r) && r.linhas === 1 && r.colunas === 1 ? r.vs[0] : r);

/*
  Onde se espera um valor só e chega uma tabela, o resultado é #VALOR!, e não
  a primeira célula calada — devolvê-la faria a fórmula "funcionar" mostrando
  a conta de uma linha só.
*/
function escalar(r: Res): Valor {
  if (!ehMatriz(r)) return r;
  return r.linhas === 1 && r.colunas === 1 ? r.vs[0] : erro('valor');
}

/* ── Referências ──────────────────────────────────────────────────────────── */

export interface Ref {
  linha: number;
  coluna: number;
  /** O `$` antes do número: a linha não anda quando a fórmula é copiada. */
  linhaFixa: boolean;
  /** O `$` antes da letra: a coluna não anda quando a fórmula é copiada. */
  colunaFixa: boolean;
  /**
   * A aba de onde a referência lê, quando ela vem escrita antes do `!`.
   *
   * Ausente é "a aba desta célula", que é o que toda fórmula de uma planilha
   * só sempre foi. Ela existe porque o requisito 3 da CC-ES008 manda somar, na
   * aba de relatório, uma coluna que mora na aba de dados: sem isso a lição
   * pede uma fórmula que a própria planilha responde com #NOME?.
   */
  aba?: string;
}

/*
  A, B, ... Z, AA, AB. A planilha da AP043 tem doze colunas e
  `String.fromCharCode(65 + c)` bastava; uma base de orçamento passa de Z sem
  esforço, e a letra 27 sairia como `[`.
*/
export function nomeDaColuna(coluna: number): string {
  let n = coluna;
  let nome = '';
  do {
    nome = String.fromCharCode(65 + (n % 26)) + nome;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return nome;
}

export function colunaDoNome(nome: string): number {
  let n = 0;
  for (const letra of nome.toUpperCase()) n = n * 26 + (letra.charCodeAt(0) - 64);
  return n - 1;
}

export const nomeDaRef = (r: Ref) =>
  `${r.colunaFixa ? '$' : ''}${nomeDaColuna(r.coluna)}${r.linhaFixa ? '$' : ''}${r.linha + 1}`;

export const ref = (
  linha: number, coluna: number, linhaFixa = false, colunaFixa = false, aba?: string,
): Ref => ({ linha, coluna, linhaFixa, colunaFixa, aba });

/* ── O que está escrito vira valor ────────────────────────────────────────── */

/*
  Número em português: vírgula decimal e ponto de milhar, e o ponto exige
  exatamente três dígitos atrás dele. É por isso que `1.23` é **texto** e
  `1.234` é número — que é o que o Excel em português faz, e é a diferença que
  alguém descobre colando dado de um site americano.
*/
const NUMERO = /^-?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/;

/** O número que o texto representa, ou `null` quando ele não é número. */
export function numeroDoTexto(texto: string): number | null {
  const t = texto.trim();
  if (t === '' || !NUMERO.test(t)) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** É número o que a planilha consegue somar — e é ele que vai para a direita. */
export const ehNumero = (texto: string) => numeroDoTexto(texto) !== null;

export const ehFormula = (bruto: string) => bruto.trimStart().startsWith('=');

/**
 * O valor de uma célula que não é fórmula.
 *
 * ── O apóstrofo, que é o requisito 7 inteiro ─────────────────────────────
 * `'1620` é o gesto do Excel para dizer "isto é texto, não mexa". O apóstrofo
 * aparece na barra de fórmulas e **não** aparece na célula: o que se vê é
 * 1620, igualzinho ao vizinho. O que denuncia é o alinhamento — texto encosta
 * à esquerda — e a `CONT.NÚM`, que conta um a menos do que se esperava.
 *
 * Sem essa distinção, "número armazenado como texto" seria um enunciado sem
 * nada por trás: a `SOMA` somaria tudo e o defeito que a lição manda achar não
 * existiria na planilha.
 */
export function valorDoBruto(bruto: string): Valor {
  if (bruto === '') return VAZIO;
  if (bruto.startsWith("'")) return txt(bruto.slice(1));

  const t = bruto.trim();
  if (t === '') return txt(bruto);

  const n = numeroDoTexto(t);
  if (n !== null) return num(n);

  /* Data escrita é número por dentro, e é por isso que ela ordena e faz conta. */
  const serie = serieDoTexto(t);
  if (serie !== null) return num(serie);

  if (/^verdadeiro$/i.test(t)) return logico(true);
  if (/^falso$/i.test(t)) return logico(false);
  return txt(bruto);
}

/* ── O analisador ─────────────────────────────────────────────────────────── */

/** Uma coluna inteira, sem linha: as duas pontas de `A:A` ou de `$B:$D`. */
export interface RefDeColuna {
  coluna: number;
  fixa: boolean;
  aba?: string;
}

type Token =
  | { t: 'num'; v: number }
  | { t: 'txt'; v: string }
  | { t: 'ref'; v: Ref }
  /* `A3#`: o derramamento inteiro que começa em A3, do tamanho que ele tiver. */
  | { t: 'derr'; v: Ref }
  | { t: 'col'; v: RefDeColuna }
  | { t: 'nome'; v: string }
  | { t: 'op'; v: string }
  | { t: 'abre' }
  | { t: 'fecha' }
  | { t: 'sep' }
  /* `{` e `}` da constante de matriz, e a barra invertida que separa colunas nela. */
  | { t: 'chave'; v: '{' | '}' }
  | { t: 'barra' }
  | { t: 'refErro' };

class ErroDeSintaxe extends Error {}

/*
  O ponto depois da referência só é aceito quando ele abre um operador de
  aparar — `A3.:.A20` —, e por isso a lookahead o deixa passar seguido de `:`.
  Qualquer outro ponto continua fazendo de `A1.x` um nome, e não uma célula.
*/
const REF = /^(\$?)([A-Za-z]{1,2})(\$?)(\d{1,7})(?![A-Za-z0-9_])(?!\.(?!:))/;
/*
  A coluna inteira só existe como faixa: `A:A`, `B:.D`. Uma letra sozinha é
  nome de função ou é nada, e é o `:` logo depois que decide.
*/
const COLUNAS = /^(\$?)([A-Za-z]{1,2})(\.?:\.?)(\$?)([A-Za-z]{1,2})(?![A-Za-z0-9_(!.])/;
const NOME = /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9._]*/;
const LITERAL = /^(\d+(,\d+)?|,\d+)/;
/*
  Os três de aparar vêm antes do `:` sozinho, e o de duas pontas antes dos de
  uma: a busca para no primeiro que casa, e `.:.` também começa por `.:`.

  `.:.` apara as duas pontas, `:.` só o fim e `.:` só o começo — o ponto fica
  do lado que é aparado. São do Excel de 2025, e é o jeito de escrever "a
  coluna até onde houver dado" sem saber onde ela acaba.
*/
const OPERADORES = ['.:.', '.:', ':.', '<>', '<=', '>=', '=', '<', '>', '+', '-', '*', '/', '^', '&', ':'];
const FAIXA = ['.:.', '.:', ':.', ':'];

/* As duas pontas de uma coluna inteira, já como tokens, com a aba nas duas. */
function tokensDeColunas(m: RegExpExecArray, aba?: string): Token[] {
  const [, cifraA, letrasA, op, cifraB, letrasB] = m;
  return [
    { t: 'col', v: { coluna: colunaDoNome(letrasA), fixa: cifraA === '$', aba } },
    { t: 'op', v: op },
    { t: 'col', v: { coluna: colunaDoNome(letrasB), fixa: cifraB === '$', aba } },
  ];
}

/* A referência de célula, e o `#` de derramamento colado nela, se houver. */
function tokenDeRef(m: RegExpExecArray, depois: string, aba?: string): { token: Token; tamanho: number } {
  const [todo, cifraCol, letras, cifraLin, digitos] = m;
  const r = ref(Number(digitos) - 1, colunaDoNome(letras), cifraLin === '$', cifraCol === '$', aba);
  /* `A3#REF!` não existe; `A3#` seguido de qualquer outra coisa é derramamento. */
  if (depois.startsWith('#')) return { token: { t: 'derr', v: r }, tamanho: todo.length + 1 };
  return { token: { t: 'ref', v: r }, tamanho: todo.length };
}

function tokens(formula: string): Token[] {
  const saida: Token[] = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '"') {
      let texto = '';
      i++;
      for (;;) {
        if (i >= formula.length) throw new ErroDeSintaxe('aspas sem fim');
        if (formula[i] === '"') {
          if (formula[i + 1] === '"') { texto += '"'; i += 2; continue; }
          i++; break;
        }
        texto += formula[i++];
      }
      saida.push({ t: 'txt', v: texto });
      continue;
    }

    if (ch === '(') { saida.push({ t: 'abre' }); i++; continue; }
    if (ch === ')') { saida.push({ t: 'fecha' }); i++; continue; }
    if (ch === ';') { saida.push({ t: 'sep' }); i++; continue; }
    if (ch === '{' || ch === '}') { saida.push({ t: 'chave', v: ch }); i++; continue; }
    if (ch === '\\') { saida.push({ t: 'barra' }); i++; continue; }

    const resto = formula.slice(i);

    /*
      `#REF!` é o que a própria planilha escreve dentro da fórmula quando a
      cópia joga a referência para fora da grade. Ele é lido de volta como
      erro — senão a fórmula copiada viraria `#NOME?`, que manda procurar um
      nome de função errado que não existe.
    */
    if (resto.startsWith('#REF!')) { saida.push({ t: 'refErro' }); i += 5; continue; }

    const mCol = COLUNAS.exec(resto);
    if (mCol) {
      saida.push(...tokensDeColunas(mCol));
      i += mCol[0].length;
      continue;
    }

    const mRef = REF.exec(resto);
    if (mRef) {
      const { token, tamanho } = tokenDeRef(mRef, resto.slice(mRef[0].length));
      saida.push(token);
      i += tamanho;
      continue;
    }

    const mNome = NOME.exec(resto);
    if (mNome) {
      /*
        Nome seguido de `!` é aba, e não função: `Respostas!E2` lê a coluna E
        da aba Respostas. A distinção é feita aqui e não depois porque o mesmo
        `NOME` casa com `SOMA` — o que separa os dois é a exclamação.
      */
      const depois = resto.slice(mNome[0].length);
      const daAba = depois.startsWith('!') ? depois.slice(1) : null;
      const mColDaAba = daAba !== null ? COLUNAS.exec(daAba) : null;
      if (mColDaAba) {
        saida.push(...tokensDeColunas(mColDaAba, mNome[0]));
        i += mNome[0].length + 1 + mColDaAba[0].length;
        continue;
      }
      const mDaAba = daAba !== null ? REF.exec(daAba) : null;
      if (mDaAba) {
        const { token, tamanho } = tokenDeRef(mDaAba, daAba!.slice(mDaAba[0].length), mNome[0]);
        saida.push(token);
        i += mNome[0].length + 1 + tamanho;
        continue;
      }
      saida.push({ t: 'nome', v: mNome[0] });
      i += mNome[0].length;
      continue;
    }

    const mLit = LITERAL.exec(resto);
    if (mLit) { saida.push({ t: 'num', v: Number(mLit[0].replace(',', '.')) }); i += mLit[0].length; continue; }

    const op = OPERADORES.find(o => resto.startsWith(o));
    if (op) { saida.push({ t: 'op', v: op }); i += op.length; continue; }

    throw new ErroDeSintaxe(`não entendi ${ch}`);
  }
  return saida;
}

/** Que pontas vazias a faixa apara: o operador entre as duas referências diz. */
type Aparar = 'nada' | 'inicio' | 'fim' | 'ambos';
const APARAR_DO_OPERADOR: Record<string, Aparar> = { ':': 'nada', '.:': 'inicio', ':.': 'fim', '.:.': 'ambos' };

type No =
  | { k: 'num'; v: number }
  | { k: 'txt'; v: string }
  | { k: 'ref'; r: Ref }
  | { k: 'faixa'; a: Ref; b: Ref; aparar: Aparar }
  | { k: 'colunas'; a: RefDeColuna; b: RefDeColuna; aparar: Aparar }
  | { k: 'derramada'; r: Ref }
  | { k: 'matriz'; m: Matriz }
  | { k: 'erro'; e: Erro }
  | { k: 'chamada'; nome: string; args: No[] }
  | { k: 'bin'; op: string; a: No; b: No }
  | { k: 'neg'; a: No }
  /*
    O argumento deixado em branco, `=PROCV(A2;B:C;2;)`. O Excel o lê como zero
    — e é por isso que esse PROCV procura exato —, e as funções novas o leem
    como "use o padrão", que é o que ele quer dizer para elas.
  */
  | { k: 'omitido' }
  /* Um valor já calculado, posto no lugar de um argumento quando a função é
     aplicada a cada elemento de uma matriz. Nunca sai do analisador. */
  | { k: 'val'; v: Valor };

/*
  Precedência, de fora para dentro: comparação, concatenação, soma, produto,
  unário, potência.

  O unário fica **acima** da potência de propósito: no Excel `=-2^2` dá 4, e
  não −4. É uma das poucas coisas em que ele discorda da matemática da escola,
  e copiar a matemática aqui faria a planilha discordar da planilha.
*/
function analisar(ts: Token[]): No {
  let p = 0;
  const fim = () => p >= ts.length;
  const olhar = () => ts[p];
  const ehOp = (...ops: string[]) => !fim() && olhar().t === 'op' && ops.includes((olhar() as { v: string }).v);

  function comparacao(): No {
    let a = concatenacao();
    while (ehOp('=', '<>', '<', '<=', '>', '>=')) {
      const op = (ts[p++] as { v: string }).v;
      a = { k: 'bin', op, a, b: concatenacao() };
    }
    return a;
  }

  function concatenacao(): No {
    let a = aditivo();
    while (ehOp('&')) { p++; a = { k: 'bin', op: '&', a, b: aditivo() }; }
    return a;
  }

  function aditivo(): No {
    let a = multiplicativo();
    while (ehOp('+', '-')) {
      const op = (ts[p++] as { v: string }).v;
      a = { k: 'bin', op, a, b: multiplicativo() };
    }
    return a;
  }

  function multiplicativo(): No {
    let a = potencia();
    while (ehOp('*', '/')) {
      const op = (ts[p++] as { v: string }).v;
      a = { k: 'bin', op, a, b: potencia() };
    }
    return a;
  }

  /*
    A potência é associativa à direita, e a base dela já vem com o sinal
    colado: `=-2^2` é `(-2)^2`, que dá 4. Deixar o menos envolver a potência
    inteira daria −4 — a resposta da matemática da escola, e a errada aqui.
  */
  function potencia(): No {
    const a = unario();
    if (ehOp('^')) { p++; return { k: 'bin', op: '^', a, b: potencia() }; }
    return a;
  }

  function unario(): No {
    if (ehOp('-')) { p++; return { k: 'neg', a: unario() }; }
    if (ehOp('+')) { p++; return unario(); }
    return primario();
  }

  function primario(): No {
    if (fim()) throw new ErroDeSintaxe('fórmula incompleta');
    const t = ts[p++];

    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'txt') return { k: 'txt', v: t.v };
    if (t.t === 'refErro') return { k: 'erro', e: 'ref' };

    if (t.t === 'ref') {
      if (ehOp(...FAIXA)) {
        const aparar = APARAR_DO_OPERADOR[(ts[p++] as { v: string }).v];
        const b = ts[p++];
        if (!b || b.t !== 'ref') throw new ErroDeSintaxe('faixa sem fim');
        return { k: 'faixa', a: t.v, b: b.v, aparar };
      }
      return { k: 'ref', r: t.v };
    }

    if (t.t === 'col') {
      if (!ehOp(...FAIXA)) throw new ErroDeSintaxe('coluna sem faixa');
      const aparar = APARAR_DO_OPERADOR[(ts[p++] as { v: string }).v];
      const b = ts[p++];
      if (!b || b.t !== 'col') throw new ErroDeSintaxe('faixa sem fim');
      return { k: 'colunas', a: t.v, b: b.v, aparar };
    }

    if (t.t === 'derr') return { k: 'derramada', r: t.v };

    if (t.t === 'chave' && t.v === '{') return constante();

    if (t.t === 'abre') {
      const dentro = comparacao();
      if (fim() || ts[p].t !== 'fecha') throw new ErroDeSintaxe('parêntese sem fim');
      p++;
      return dentro;
    }

    if (t.t === 'nome') {
      /*
        VERDADEIRO e FALSO chegam como nome, e não como função: escritos sem
        parênteses eles são valores. Sem isto, `=SE(A1>10;VERDADEIRO;FALSO)`
        daria `#NOME?` — e é assim que se escreve a condição.
      */
      if (/^verdadeiro$/i.test(t.v) && !(!fim() && olhar().t === 'abre')) return { k: 'txt', v: '\u0001V' };
      if (/^falso$/i.test(t.v) && !(!fim() && olhar().t === 'abre')) return { k: 'txt', v: '\u0001F' };

      if (fim() || ts[p].t !== 'abre') throw new ErroDeSintaxe('nome solto');
      p++;
      const args: No[] = [];
      if (!fim() && ts[p].t === 'fecha') { p++; return { k: 'chamada', nome: t.v, args }; }
      for (;;) {
        /* Ponto e vírgula logo depois de outro, ou antes do parêntese: argumento em branco. */
        const vazio = !fim() && (ts[p].t === 'sep' || ts[p].t === 'fecha');
        args.push(vazio ? { k: 'omitido' } : comparacao());
        if (!fim() && ts[p].t === 'sep') { p++; continue; }
        break;
      }
      if (fim() || ts[p].t !== 'fecha') throw new ErroDeSintaxe('chamada sem fim');
      p++;
      return { k: 'chamada', nome: t.v, args };
    }

    throw new ErroDeSintaxe('não esperava isto aqui');
  }

  /*
    A constante de matriz: `{1\2\3}` é uma linha, `{1;2;3}` é uma coluna, e
    `{1\2;3\4}` são duas linhas de dois. A barra invertida separa colunas
    porque no Brasil a vírgula já é a casa decimal e o ponto e vírgula já
    separa argumentos — é o que o Excel e o Planilhas Google em português
    usam. Dentro dela só entra valor escrito, como lá: `{A1\A2}` é recusado.
  */
  function constante(): No {
    const linhas: Valor[][] = [[]];
    for (;;) {
      if (fim()) throw new ErroDeSintaxe('chave sem fim');
      let negativo = false;
      while (ehOp('-', '+')) { if ((ts[p++] as { v: string }).v === '-') negativo = !negativo; }
      const e = ts[p++];
      if (!e) throw new ErroDeSintaxe('chave sem fim');
      if (e.t === 'num') linhas[linhas.length - 1].push(num(negativo ? -e.v : e.v));
      else if (e.t === 'txt' && !negativo) linhas[linhas.length - 1].push(txt(e.v));
      else if (e.t === 'nome' && !negativo && /^(verdadeiro|falso)$/i.test(e.v)) {
        linhas[linhas.length - 1].push(logico(/^verdadeiro$/i.test(e.v)));
      } else throw new ErroDeSintaxe('constante de matriz só aceita valor escrito');

      const sep = ts[p++];
      if (!sep) throw new ErroDeSintaxe('chave sem fim');
      if (sep.t === 'barra') continue;
      if (sep.t === 'sep') { linhas.push([]); continue; }
      if (sep.t === 'chave' && sep.v === '}') break;
      throw new ErroDeSintaxe('separador de matriz');
    }
    const colunas = linhas[0].length;
    /* Linha mais curta que as outras não tem o que pôr no buraco: o Excel recusa. */
    if (linhas.some(l => l.length !== colunas)) throw new ErroDeSintaxe('linhas de tamanhos diferentes');
    return { k: 'matriz', m: matriz(linhas.length, colunas, linhas.flat()) };
  }

  const arvore = comparacao();
  if (!fim()) throw new ErroDeSintaxe('sobrou coisa no fim');
  return arvore;
}

/* ── Coerção ──────────────────────────────────────────────────────────────── */

/*
  Texto que parece número **vira** número numa conta, e **não** vira numa
  função de agregação. Não é inconsistência nossa: é o Excel, e é exatamente
  por isso que o número guardado como texto passa despercebido. `=D5+0` devolve
  1620 e parece que está tudo certo; `=SOMA(D2:D13)` pula a célula e o total
  fecha errado.
*/
function comoNumero(v: Valor): number | Valor {
  switch (v.tipo) {
    case 'numero': return v.n;
    case 'logico': return v.b ? 1 : 0;
    case 'vazio': return 0;
    case 'erro': return v;
    case 'texto': {
      /* "08/11/2026" entre aspas também vira número numa conta, como no Excel. */
      const n = numeroDoTexto(v.t) ?? serieDoTexto(v.t);
      return n === null ? erro('valor') : n;
    }
  }
}

/**
 * O número virando texto — que **não** é o número sendo mostrado.
 *
 * `mostrarNumero` arredonda para duas casas, e está certo: é o formato geral
 * da célula, e uma coluna de médias com quinze casas não se lê. Só que `&` e a
 * comparação de texto não estão mostrando nada — estão convertendo um valor
 * para poder juntá-lo ou ordená-lo, e ali o arredondamento **apaga dado em
 * silêncio**.
 *
 * O caso que descobriu isto é o idioma mais comum do `CONT.SE`:
 * `=CONT.SE(alturas;">="&B3)`, com B3 valendo 1,5235416666. Pelo caminho do
 * arredondamento o critério virava `">=1,52"`, e a conta passava a contar
 * também quem tem exatamente 1,52 — um número plausível e maior, numa vereda
 * cujo assunto é justamente esse. O Excel converte com a precisão que o número
 * tem, e não com a que a célula mostra.
 *
 * Quinze algarismos significativos é o que o Excel usa, e aparar aqui também
 * limpa o ruído de ponto flutuante: 1,5235416666666672 sai como
 * 1,5235416666666**7**, e não com a sujeira da última casa.
 */
function textoDoNumero(n: number): string {
  if (n === 0) return '0';
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toPrecision(15))).replace('.', ',');
}

function comoTexto(v: Valor): string {
  switch (v.tipo) {
    case 'texto': return v.t;
    case 'numero': return textoDoNumero(v.n);
    case 'logico': return v.b ? 'VERDADEIRO' : 'FALSO';
    case 'vazio': return '';
    case 'erro': return TEXTO_DO_ERRO[v.e];
  }
}

function comoCondicao(v: Valor): boolean | Valor {
  if (v.tipo === 'logico') return v.b;
  if (v.tipo === 'erro') return v;
  if (v.tipo === 'texto') {
    if (/^verdadeiro$/i.test(v.t)) return true;
    if (/^falso$/i.test(v.t)) return false;
    return erro('valor');
  }
  const n = comoNumero(v);
  return typeof n === 'number' ? n !== 0 : n;
}

/* ── Avaliação ────────────────────────────────────────────────────────────── */

/**
 * O que está escrito numa célula, cru — string vazia fora da grade.
 *
 * `aba` ausente é "a aba desta fórmula" — que é o que todo laboratório de uma
 * planilha só entrega. Quem tem pasta de trabalho entrega as duas, e é assim
 * que `Respostas!E2` acha o que ler.
 */
export type Bruto = (linha: number, coluna: number, aba?: string) => string;

/**
 * O que o motor precisa saber da planilha, além do que está escrito, para
 * derramar: onde estão as fórmulas e onde a grade acaba.
 *
 * As fórmulas, porque a célula vazia não sabe que tem um valor derramado
 * nela — quem sabe é a fórmula de cima à esquerda, e é preciso achá-la. A
 * borda, porque matriz que passa da última linha não tem onde cair, e porque
 * `A:A` vai até ela.
 *
 * Sem planta o motor calcula do mesmo jeito, mas nada derrama sobre célula
 * vazia — é o caso dos exemplos da teoria, que calculam uma fórmula solta.
 */
export interface Planta {
  /** As células com fórmula, na ordem de leitura. */
  formulas: (aba?: string) => ReadonlyArray<readonly [number, number]>;
  extensao: (aba?: string) => { linhas: number; colunas: number };
}

/* Até onde `A:A` vai quando ninguém disse onde a grade acaba. */
const LINHAS_SEM_PLANTA = 1000;

/*
  Por que um derramamento não aconteceu. `celula` é alguma coisa escrita no
  caminho, `borda` é a grade acabando, `outro` é um derramamento de antes
  ocupando o mesmo lugar, e `circular` é a fórmula lendo o próprio derramamento.
*/
type Bloqueio = null | 'celula' | 'borda' | 'outro' | 'circular';

interface Derrame {
  linha: number;
  coluna: number;
  m: Matriz;
  bloqueio: Bloqueio;
}

interface Ctx {
  bruto: Bruto;
  visitando: Set<string>;
  cache: Map<string, Valor>;
  /**
   * A aba da célula que está sendo avaliada **agora**, e não a de quem pediu.
   *
   * É o que faz `=G2` escrito em `Respostas!L2` ler `Respostas!G2` mesmo
   * quando quem mandou calcular foi uma fórmula da aba Cálculos. Sem isto a
   * referência sem aba resolvia contra a aba de **origem** da leitura: uma
   * coluna auxiliar lida de outra aba virava uma coluna de células vazias, e o
   * que se via era `#DIV/0!` numa conta certa — ou, pior, um `SOMA` devolvendo
   * zero com cara de total.
   */
  aba?: string;
  /**
   * A linha está escondida pelo filtro? Só o `SUBTOTAL` pergunta.
   *
   * Sem quem responda, nada está escondido — e `SUBTOTAL(109;...)` soma tudo,
   * que é o que ele faz numa planilha sem filtro.
   */
  escondida?: (linha: number, aba?: string) => boolean;
  planta?: Planta;
  /* O que cada fórmula devolveu, matriz inteira — `cache` guarda só a célula. */
  resultados: Map<string, Res>;
  derrames: Map<string, Derrame | 'escalar' | 'calculando'>;
  /*
    Células vazias lidas enquanto uma fórmula ainda estava sendo calculada, e
    que por isso não puderam perguntar a ela se estavam no derramamento dela.
    Se no fim estiverem, a fórmula leu o próprio resultado: é circular.
  */
  consultas: Map<string, Array<[number, number]>>;
  ancoras: Map<string, Array<readonly [number, number]>>;
  /*
    Ligado quando alguma leitura usou um derramamento que ainda estava sendo
    conferido — e por isso não se guarda nada do que dependeu dela. É um
    objeto, e não um booleano, porque o contexto é copiado a cada troca de aba
    e a cópia de um booleano não avisaria quem está acima.
  */
  provisorio: { ligado: boolean };
}

const chave = (l: number, c: number, aba?: string) => `${aba ?? ''}:${l}:${c}`;

function novoCtx(
  bruto: Bruto,
  opcoes: { aba?: string; escondida?: Ctx['escondida']; planta?: Planta } = {},
): Ctx {
  return {
    bruto, aba: opcoes.aba, escondida: opcoes.escondida, planta: opcoes.planta,
    visitando: new Set(), cache: new Map(), resultados: new Map(),
    derrames: new Map(), consultas: new Map(), ancoras: new Map(),
    provisorio: { ligado: false },
  };
}

/*
  A árvore de cada fórmula, guardada pelo texto. Uma grade redesenhada pede o
  valor de cada célula, e reanalisar a mesma fórmula a cada pedido era o custo
  que mais crescia com as matrizes: para saber se uma célula vazia recebe um
  derramamento, é preciso olhar as fórmulas acima e à esquerda dela.
*/
const ARVORES = new Map<string, No | null>();

function arvoreDe(corpo: string): No | null {
  const guardada = ARVORES.get(corpo);
  if (guardada !== undefined) return guardada;
  let a: No | null;
  try {
    a = analisar(tokens(corpo));
  } catch {
    a = null;
  }
  if (ARVORES.size > 5000) ARVORES.clear();
  ARVORES.set(corpo, a);
  return a;
}

/* O valor derramado numa célula: vazio na origem é 0 no destino, como no Excel. */
const derramado = (v: Valor): Valor => (v.tipo === 'vazio' ? num(0) : v);

const dentro = (l: number, c: number, m: Matriz, cl: number, cc: number) =>
  cl >= l && cl < l + m.linhas && cc >= c && cc < c + m.colunas;

function celula(ctx: Ctx, linha: number, coluna: number, aba?: string): Valor {
  /* Referência sem aba é "a aba desta célula", e a desta célula é a do
     contexto — não a de quem começou a leitura. */
  const alvo = aba ?? ctx.aba;
  const k = chave(linha, coluna, alvo);
  const guardado = ctx.cache.get(k);
  if (guardado) return guardado;

  const bruto = ctx.bruto(linha, coluna, alvo) ?? '';
  const antes = ctx.provisorio.ligado;
  ctx.provisorio.ligado = false;
  let v: Valor;
  if (!ehFormula(bruto)) {
    v = bruto === '' ? derramadoEm(ctx, linha, coluna, alvo) ?? VAZIO : valorDoBruto(bruto);
  } else {
    const r = resultado(ctx, linha, coluna, alvo);
    if (!ehMatriz(r)) v = r;
    else {
      const d = derrame(ctx, linha, coluna, alvo);
      if (d === 'calculando') {
        ctx.provisorio.ligado = true;
        v = derramado(r.vs[0]);
      } else if (d === 'escalar') v = erro('circular');
      else if (d.bloqueio) v = erro(d.bloqueio === 'circular' ? 'circular' : 'despejar');
      else v = derramado(r.vs[0]);
    }
  }
  if (!ctx.provisorio.ligado) ctx.cache.set(k, v);
  ctx.provisorio.ligado ||= antes;
  return v;
}

/** O que a fórmula escrita na célula devolve — valor ou matriz. */
function resultado(ctx: Ctx, linha: number, coluna: number, alvo?: string): Res {
  const k = chave(linha, coluna, alvo);
  const guardado = ctx.resultados.get(k);
  if (guardado) return guardado;

  /*
    A guarda de ciclo não é luxo: `=A1+1` escrito em A1 é um erro que qualquer
    um comete, e sem ela a aba do navegador trava numa recursão infinita —
    levando junto o trabalho da lição inteira.
  */
  if (ctx.visitando.has(k)) return erro('circular');

  const bruto = ctx.bruto(linha, coluna, alvo) ?? '';
  const antes = ctx.provisorio.ligado;
  ctx.provisorio.ligado = false;
  ctx.visitando.add(k);
  let r: Res;
  try {
    /* Os mapas seguem sendo os mesmos objetos: o que muda de mão é só qual
       aba as referências sem nome enxergam daqui para dentro. */
    r = simplificar(avaliarTexto({ ...ctx, aba: alvo }, bruto.trimStart().slice(1)));
  } finally {
    ctx.visitando.delete(k);
  }
  if (ehMatriz(r)) {
    const lidas = ctx.consultas.get(k);
    if (lidas?.some(([cl, cc]) => dentro(linha, coluna, r as Matriz, cl, cc))) r = erro('circular');
  }
  if (!ctx.provisorio.ligado) ctx.resultados.set(k, r);
  ctx.provisorio.ligado ||= antes;
  return r;
}

/**
 * Onde a matriz de uma fórmula cai, e se ela cabe.
 *
 * Ela não cabe quando alguma célula do caminho tem qualquer coisa escrita —
 * inclusive um espaço, inclusive uma fórmula que devolve vazio —, quando passa
 * da borda da grade, ou quando outro derramamento que começa **antes**, na
 * ordem de leitura, já ocupa parte do lugar. A regra da ordem é nossa: o Excel
 * decide pela ordem de cálculo, que ninguém vê, e uma regra que ninguém vê
 * faria a mesma planilha trancar ora uma fórmula, ora a outra.
 *
 * Trancado não apaga nada. O que estava escrito no caminho continua lá, e
 * a fórmula diz `#DESPEJAR!` até o caminho ficar livre.
 */
function derrame(ctx: Ctx, linha: number, coluna: number, aba?: string): Derrame | 'escalar' | 'calculando' {
  const k = chave(linha, coluna, aba);
  const guardado = ctx.derrames.get(k);
  if (guardado !== undefined) return guardado;

  const r = resultado(ctx, linha, coluna, aba);
  if (!ehMatriz(r)) {
    if (ctx.resultados.has(k)) ctx.derrames.set(k, 'escalar');
    return 'escalar';
  }
  /* O resultado pode ter saído provisório — então ele não está guardado, e o
     derramamento também não se guarda. Idem se a conferência do caminho
     contou com uma fórmula que ainda estava calculando. */
  const antes = ctx.provisorio.ligado;
  ctx.provisorio.ligado = !ctx.resultados.has(k);
  ctx.derrames.set(k, 'calculando');
  const d: Derrame = { linha, coluna, m: r, bloqueio: bloqueioDe(ctx, linha, coluna, r, aba) };
  if (ctx.provisorio.ligado) ctx.derrames.delete(k);
  else ctx.derrames.set(k, d);
  ctx.provisorio.ligado ||= antes;
  return d;
}

function bloqueioDe(ctx: Ctx, l: number, c: number, m: Matriz, aba?: string): Bloqueio {
  const l2 = l + m.linhas - 1;
  const c2 = c + m.colunas - 1;
  if (ctx.planta) {
    const e = ctx.planta.extensao(aba);
    if (l2 >= e.linhas || c2 >= e.colunas) return 'borda';
  }
  for (let i = l; i <= l2; i++) {
    for (let j = c; j <= c2; j++) {
      if ((i !== l || j !== c) && (ctx.bruto(i, j, aba) ?? '') !== '') return 'celula';
    }
  }
  for (const [al, ac] of ancorasDe(ctx, aba)) {
    if (al > l || (al === l && ac >= c) || ac > c2) continue;
    /*
      A fórmula de antes ainda está calculando — e foi ela que, lendo esta,
      trouxe a conta até aqui. O tamanho dela ainda não existe: conta-se como
      livre, e nada disto se guarda até ela terminar.
    */
    if (ctx.visitando.has(chave(al, ac, aba))) {
      ctx.provisorio.ligado = true;
      continue;
    }
    const outro = derrame(ctx, al, ac, aba);
    if (typeof outro === 'string' || outro.bloqueio) continue;
    const ol2 = al + outro.m.linhas - 1;
    const oc2 = ac + outro.m.colunas - 1;
    if (ol2 >= l && oc2 >= c && ac <= c2) return 'outro';
  }
  const lidas = ctx.consultas.get(chave(l, c, aba));
  if (lidas?.some(([cl, cc]) => dentro(l, c, m, cl, cc))) return 'circular';
  return null;
}

/*
  As fórmulas desta aba que podem devolver matriz — só elas derramam. Decidir
  pela árvore, e não calculando, é o que deixa `=B5` em A1 ler um derramamento
  que começa em B5 sem que o motor precise calcular A1 para saber se A1
  derrama sobre B5.
*/
function ancorasDe(ctx: Ctx, aba?: string): ReadonlyArray<readonly [number, number]> {
  const k = aba ?? '';
  const guardadas = ctx.ancoras.get(k);
  if (guardadas) return guardadas;
  const todas = ctx.planta ? ctx.planta.formulas(aba) : [];
  const ancoras = todas.filter(([l, c]) => {
    const a = arvoreDe((ctx.bruto(l, c, aba) ?? '').trimStart().slice(1));
    return a !== null && podeSerMatriz(a);
  });
  ctx.ancoras.set(k, ancoras);
  return ancoras;
}

/** O valor que algum derramamento põe nesta célula vazia, se algum puser. */
function derramadoEm(ctx: Ctx, l: number, c: number, aba?: string): Valor | null {
  for (const [al, ac] of ancorasDe(ctx, aba)) {
    if (al > l || ac > c || (al === l && ac === c)) continue;
    const ka = chave(al, ac, aba);
    if (ctx.visitando.has(ka)) {
      const lidas = ctx.consultas.get(ka) ?? [];
      lidas.push([l, c]);
      ctx.consultas.set(ka, lidas);
      continue;
    }
    /*
      A fórmula já calculou e está conferindo se cabe — e conferir pode ter
      vindo parar aqui, numa fórmula de cima que lê a de baixo, como o resumo
      `=FILTRO(B4#;...)` no alto de uma tabela derramada. O tamanho já se sabe;
      só não se sabe ainda se o caminho está livre. Lê-se como se estivesse, e
      nada do que dependeu disso é guardado: quando a conferência acabar, quem
      perguntar de novo recebe a resposta certa.
    */
    if (ctx.derrames.get(ka) === 'calculando') {
      const r = ctx.resultados.get(ka);
      if (r && ehMatriz(r) && dentro(al, ac, r, l, c)) {
        ctx.provisorio.ligado = true;
        return derramado(em(r, l - al, c - ac));
      }
      continue;
    }
    const d = derrame(ctx, al, ac, aba);
    if (typeof d === 'string' || d.bloqueio) continue;
    if (dentro(al, ac, d.m, l, c)) return derramado(em(d.m, l - al, c - ac));
  }
  return null;
}

function avaliarTexto(ctx: Ctx, corpo: string): Res {
  if (corpo.trim() === '') return VAZIO;
  const arvore = arvoreDe(corpo);
  return arvore === null ? erro('nome') : avaliarM(ctx, arvore);
}

/* ── Faixas: de onde vêm as matrizes que moram na grade ───────────────────── */

/** Uma faixa lida da grade: onde ela começa, de que aba, e o que há nela. */
interface Regiao {
  aba?: string;
  linha: number;
  coluna: number;
  m: Matriz;
}

const ehRegiao = (g: Regiao | Valor): g is Regiao => 'm' in g;

/* Os nós que apontam para um pedaço da grade, e não para um valor. */
const DE_FAIXA = new Set<No['k']>(['faixa', 'colunas', 'derramada']);

function lerRegiao(ctx: Ctx, aba: string | undefined, l1: number, l2: number, c1: number, c2: number): Matriz {
  const vs: Valor[] = [];
  for (let l = l1; l <= l2; l++) for (let c = c1; c <= c2; c++) vs.push(celula(ctx, l, c, aba));
  return matriz(l2 - l1 + 1, c2 - c1 + 1, vs);
}

/**
 * Tira as linhas e colunas vazias das pontas.
 *
 * `0` não apara, `1` apara o começo, `2` o fim e `3` os dois — os números da
 * APARARINTERVALO, que é a mesma conta dos operadores `.:` `:.` e `.:.`.
 * Vazia é a célula sem nada; o 0 que um derramamento pôs ali conta como dado.
 */
function apararMatriz(m: Matriz, linhas: number, colunas: number): { m: Matriz; dl: number; dc: number } | null {
  const linhaVazia = (i: number) => {
    for (let j = 0; j < m.colunas; j++) if (em(m, i, j).tipo !== 'vazio') return false;
    return true;
  };
  const colunaVazia = (j: number) => {
    for (let i = 0; i < m.linhas; i++) if (em(m, i, j).tipo !== 'vazio') return false;
    return true;
  };
  let l1 = 0;
  let l2 = m.linhas - 1;
  let c1 = 0;
  let c2 = m.colunas - 1;
  if (linhas & 1) while (l1 <= l2 && linhaVazia(l1)) l1++;
  if (linhas & 2) while (l2 >= l1 && linhaVazia(l2)) l2--;
  if (l1 > l2) return null;
  if (colunas & 1) while (c1 <= c2 && colunaVazia(c1)) c1++;
  if (colunas & 2) while (c2 >= c1 && colunaVazia(c2)) c2--;
  if (c1 > c2) return null;
  const vs: Valor[] = [];
  for (let i = l1; i <= l2; i++) for (let j = c1; j <= c2; j++) vs.push(em(m, i, j));
  return { m: matriz(l2 - l1 + 1, c2 - c1 + 1, vs), dl: l1, dc: c1 };
}

const MODO_DE_APARAR: Record<Aparar, number> = { nada: 0, inicio: 1, fim: 2, ambos: 3 };

/**
 * A região da grade para onde o nó aponta, já lida.
 *
 * Uma faixa aparada que não sobra nada é `#REF!`: ela não aponta para célula
 * nenhuma, e o Excel também recusa. Devolver vazio faria `=SOMA(A:.A)` de uma
 * coluna em branco parecer uma soma que deu zero de verdade.
 */
function regiaoDe(ctx: Ctx, no: No): Regiao | Valor {
  if (no.k === 'ref') {
    const aba = no.r.aba ?? ctx.aba;
    return { aba, linha: no.r.linha, coluna: no.r.coluna, m: lerRegiao(ctx, aba, no.r.linha, no.r.linha, no.r.coluna, no.r.coluna) };
  }

  if (no.k === 'derramada') {
    const aba = no.r.aba ?? ctx.aba;
    const { linha, coluna } = no.r;
    const bruto = ctx.bruto(linha, coluna, aba) ?? '';
    /* `A3#` só faz sentido onde A3 tem uma fórmula que devolve matriz. */
    if (!ehFormula(bruto)) return erro('ref');
    const r = resultado(ctx, linha, coluna, aba);
    if (!ehMatriz(r)) {
      if (ehErro(r)) return r;
      const a = arvoreDe(bruto.trimStart().slice(1));
      return a && podeSerMatriz(a) ? { aba, linha, coluna, m: matriz(1, 1, [r]) } : erro('ref');
    }
    const d = derrame(ctx, linha, coluna, aba);
    /* Ainda conferindo se cabe: lê-se o resultado, provisório, como em `derramadoEm`. */
    if (d === 'calculando') ctx.provisorio.ligado = true;
    else if (d === 'escalar') return erro('circular');
    else if (d.bloqueio) return erro(d.bloqueio === 'circular' ? 'circular' : 'despejar');
    return { aba, linha, coluna, m: matriz(r.linhas, r.colunas, r.vs.map(derramado)) };
  }

  if (no.k === 'faixa' || no.k === 'colunas') {
    let aba: string | undefined;
    let l1: number;
    let l2: number;
    let c1: number;
    let c2: number;
    if (no.k === 'faixa') {
      aba = no.a.aba ?? ctx.aba;
      l1 = Math.min(no.a.linha, no.b.linha);
      l2 = Math.max(no.a.linha, no.b.linha);
      c1 = Math.min(no.a.coluna, no.b.coluna);
      c2 = Math.max(no.a.coluna, no.b.coluna);
    } else {
      aba = no.a.aba ?? ctx.aba;
      l1 = 0;
      l2 = (ctx.planta?.extensao(aba).linhas ?? LINHAS_SEM_PLANTA) - 1;
      c1 = Math.min(no.a.coluna, no.b.coluna);
      c2 = Math.max(no.a.coluna, no.b.coluna);
      if (l2 < 0) return erro('ref');
    }
    const m = lerRegiao(ctx, aba, l1, l2, c1, c2);
    if (no.aparar === 'nada') return { aba, linha: l1, coluna: c1, m };
    const modo = MODO_DE_APARAR[no.aparar];
    const aparada = apararMatriz(m, modo, modo);
    if (!aparada) return erro('ref');
    return { aba, linha: l1 + aparada.dl, coluna: c1 + aparada.dc, m: aparada.m };
  }

  /* Matriz calculada não mora na grade: não tem linha nem coluna de origem. */
  const r = avaliarM(ctx, no);
  if (!ehMatriz(r) && ehErro(r)) return r;
  return { linha: -1, coluna: -1, m: comoMatriz(r) };
}

/* ── O avaliador ──────────────────────────────────────────────────────────── */

function avaliarM(ctx: Ctx, no: No): Res {
  switch (no.k) {
    case 'num': return num(no.v);
    case 'txt':
      if (no.v === '\u0001V') return logico(true);
      if (no.v === '\u0001F') return logico(false);
      return txt(no.v);
    case 'erro': return erro(no.e);
    case 'val': return no.v;
    case 'omitido': return VAZIO;
    case 'ref': return celula(ctx, no.r.linha, no.r.coluna, no.r.aba);
    case 'faixa':
    case 'colunas':
    case 'derramada': {
      const g = regiaoDe(ctx, no);
      return ehRegiao(g) ? g.m : g;
    }
    case 'matriz': return no.m;
    case 'neg': return mapear(avaliarM(ctx, no.a), v => {
      const a = comoNumero(v);
      return typeof a === 'number' ? num(-a) : a;
    });
    case 'bin': return binaria(ctx, no);
    case 'chamada': return chamadaM(ctx, no.nome, no.args);
  }
}

/** O valor de uma expressão onde só cabe um valor. */
const avaliar = (ctx: Ctx, no: No): Valor => escalar(avaliarM(ctx, no));

const mapear = (r: Res, f: (v: Valor) => Valor): Res =>
  (ehMatriz(r) ? matriz(r.linhas, r.colunas, r.vs.map(f)) : f(r));

/*
  O elemento (i, j) de uma matriz esticada até o tamanho da outra.

  É a regra do Excel: uma linha só se repete para baixo, uma coluna só se
  repete para a direita, e um valor só se repete para todo lado — é por isso
  que `=A2:A9*B1` multiplica a coluna inteira pela mesma célula. Fora disso,
  onde uma das duas acaba antes da outra, o que sobra é #N/D, e não zero: zero
  seria uma conta feita com um número que ninguém escreveu.
*/
function esticado(m: Matriz, i: number, j: number): Valor {
  const ii = m.linhas === 1 ? 0 : i;
  const jj = m.colunas === 1 ? 0 : j;
  return ii < m.linhas && jj < m.colunas ? em(m, ii, jj) : erro('nd');
}

function combinar(ms: Matriz[], f: (vs: Valor[]) => Valor): Matriz {
  const linhas = Math.max(...ms.map(m => m.linhas));
  const colunas = Math.max(...ms.map(m => m.colunas));
  const vs: Valor[] = [];
  for (let i = 0; i < linhas; i++) for (let j = 0; j < colunas; j++) vs.push(f(ms.map(m => esticado(m, i, j))));
  return matriz(linhas, colunas, vs);
}

function binaria(ctx: Ctx, no: { op: string; a: No; b: No }): Res {
  const ra = simplificar(avaliarM(ctx, no.a));
  const rb = simplificar(avaliarM(ctx, no.b));
  if (!ehMatriz(ra) && !ehMatriz(rb)) return binariaDeValores(no.op, ra, rb);
  return combinar([comoMatriz(ra), comoMatriz(rb)], ([a, b]) => binariaDeValores(no.op, a, b));
}

function binariaDeValores(op: string, va: Valor, vb: Valor): Valor {
  if (ehErro(va)) return va;
  if (ehErro(vb)) return vb;

  if (op === '&') return txt(comoTexto(va) + comoTexto(vb));

  if (['=', '<>', '<', '<=', '>', '>='].includes(op)) return comparar(op, va, vb);

  const a = comoNumero(va);
  if (typeof a !== 'number') return a;
  const b = comoNumero(vb);
  if (typeof b !== 'number') return b;

  switch (op) {
    case '+': return num(a + b);
    case '-': return num(a - b);
    case '*': return num(a * b);
    case '/': return b === 0 ? erro('div0') : num(a / b);
    case '^': return num(a ** b);
    default: return erro('nome');
  }
}

/*
  Número compara com número; o resto compara como texto, sem diferenciar
  maiúscula — que é o que a planilha faz, e é por isso que `="falcão"="FALCÃO"`
  é verdadeiro lá e seria falso em quase toda linguagem.
*/
function comparar(op: string, va: Valor, vb: Valor): Valor {
  const na = va.tipo === 'numero' ? va.n : (va.tipo === 'vazio' ? 0 : null);
  const nb = vb.tipo === 'numero' ? vb.n : (vb.tipo === 'vazio' ? 0 : null);

  let d: number;
  if (na !== null && nb !== null) d = na - nb;
  /*
    `localeCompare` com a ordem do português, e nunca `<` entre strings: o `<`
    compara unidades de UTF-16, onde `á` vale 225 e vem **depois** de `z`.
    Numa coluna de unidades do clube isso põe Águia atrás de Tucano, e é o
    PROCV aproximado que paga a conta — ele lê a coluna como ordenada e para
    na linha errada.

    `sensitivity: 'accent'` é o que a planilha faz: maiúscula não diferencia
    (`="falcão"="FALCÃO"` é verdadeiro), acento diferencia (`="falcao"="falcão"`
    é falso).
  */
  else d = comoTexto(va).localeCompare(comoTexto(vb), 'pt-BR', { sensitivity: 'accent' });

  switch (op) {
    case '=': return logico(d === 0);
    case '<>': return logico(d !== 0);
    case '<': return logico(d < 0);
    case '<=': return logico(d <= 0);
    case '>': return logico(d > 0);
    case '>=': return logico(d >= 0);
    default: return erro('nome');
  }
}

/* ── As funções ───────────────────────────────────────────────────────────── */

/*
  Os nomes vêm sem acento e sem ponto para que `MÉDIA`, `MEDIA`, `CONT.NÚM` e
  `CONT.NUM` cheguem ao mesmo lugar. Um desbravador que não achou o acento no
  teclado do celular não precisa de `#NOME?` para aprender fórmula.
*/
const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\./g, '').toUpperCase();

/**
 * Os números de uma lista de argumentos, para as funções de agregação.
 *
 * A regra é a do Excel, e é a que faz o requisito 7 existir: texto que chega
 * **de dentro de uma faixa** é ignorado; texto escrito **direto** no argumento
 * é convertido. `=SOMA(D2:D13)` pula o `'1620`; `=SOMA("1620")` soma 1620.
 */
function numerosDosArgs(ctx: Ctx, args: No[]): number[] | Valor {
  const saida: number[] = [];
  for (const arg of args) {
    if (arg.k === 'ref') {
      const v = celula(ctx, arg.r.linha, arg.r.coluna, arg.r.aba);
      if (ehErro(v)) return v;
      if (v.tipo === 'numero') saida.push(v.n);
      else if (v.tipo === 'logico') saida.push(v.b ? 1 : 0);
      continue;
    }
    /*
      Matriz calculada — `=SOMA(B2:B9*C2:C9)` — conta como faixa: o texto e o
      lógico que vierem dentro dela são ignorados, que é o que o Excel faz e é
      o que deixa a soma dos produtos sair certa numa coluna com cabeçalho.
    */
    const r = DE_FAIXA.has(arg.k) || podeSerMatriz(arg) ? avaliarM(ctx, arg) : null;
    if (r !== null && (ehMatriz(r) || DE_FAIXA.has(arg.k))) {
      for (const v of comoMatriz(r).vs) {
        if (ehErro(v)) return v;
        if (v.tipo === 'numero') saida.push(v.n);
      }
      continue;
    }
    const v = r ?? avaliar(ctx, arg);
    if (ehErro(v)) return v;
    if (v.tipo === 'vazio') continue;
    const n = comoNumero(v);
    if (typeof n !== 'number') return n;
    saida.push(n);
  }
  return saida;
}

/** Os valores de uma lista de argumentos, sem descartar nada. */
function valoresDosArgs(ctx: Ctx, args: No[]): Valor[] | Valor {
  const saida: Valor[] = [];
  for (const arg of args) {
    const r = avaliarM(ctx, arg);
    for (const v of comoMatriz(r).vs) {
      if (ehErro(v)) return v;
      saida.push(v);
    }
  }
  return saida;
}

/*
  O critério de CONT.SE e SOMASE: `">100"`, `"<>Falcão"`, `"Falcão"`.

  Curinga (`*`, `?`) não entra. Meia implementação de curinga é pior do que
  nenhuma: `"Fal*"` devolveria zero sem erro, e quem escreveu concluiria que
  não há nenhuma unidade começando por Fal.
*/
function testarCriterio(criterio: Valor, v: Valor): boolean {
  let op = '=';
  let alvo = criterio;

  if (criterio.tipo === 'texto') {
    const m = /^(<>|<=|>=|<|>|=)?\s*(.*)$/s.exec(criterio.t);
    if (m) {
      op = m[1] ?? '=';
      alvo = valorDoBruto(m[2].trim());
      if (alvo.tipo === 'vazio') alvo = txt('');
    }
  }

  const r = comparar(op, v, alvo);
  return r.tipo === 'logico' && r.b;
}

/**
 * A raiz da soma dos quadrados dos desvios, dividida pelo que se pedir.
 *
 * `divisor` é `n` para o desvio da população e `n - 1` para o da amostra — é
 * só nisso que os dois diferem, e escrevê-los como duas funções separadas
 * faria as duas divergirem na primeira correção, como os dois "Word".
 */
function desvio(ns: number[], divisor: number): Valor {
  if (divisor <= 0) return erro('div0');
  const media = ns.reduce((s, n) => s + n, 0) / ns.length;
  const soma = ns.reduce((s, n) => s + (n - media) ** 2, 0);
  return num(Math.sqrt(soma / divisor));
}

/**
 * O argumento de data de uma função: número, ou texto que escreve uma data.
 *
 * Data antes de 01/01/1900, ou depois de 31/12/9999, é `#NÚM!` — o número
 * existe, e o calendário do Excel não vai até lá.
 */
function serieDoArg(ctx: Ctx, arg: No): number | Valor {
  const n = comoNumero(avaliar(ctx, arg));
  if (typeof n !== 'number') return n;
  return n < 0 || n > MAIOR_SERIE ? erro('num') : n;
}

/** Quantos anos, meses ou dias completos separam duas datas, nas unidades do DATADIF. */
function datadif(a: number, b: number, unidade: string): number | null {
  const x = diaDaSerie(a);
  const y = diaDaSerie(b);
  const meses = (y.ano - x.ano) * 12 + (y.mes - x.mes) - (y.dia < x.dia ? 1 : 0);
  switch (unidade) {
    case 'D': return b - a;
    case 'M': return meses;
    case 'Y': return Math.floor(meses / 12);
    case 'YM': return meses % 12;
    case 'MD': {
      if (y.dia >= x.dia) return y.dia - x.dia;
      /* Os dias que sobram contam a partir do mesmo dia no mês anterior ao fim. */
      return b - serieDe(y.ano, y.mes - 1, x.dia);
    }
    case 'YD': {
      const aniversario = serieDe(y.ano, x.mes, x.dia);
      return aniversario <= b ? b - aniversario : b - serieDe(y.ano - 1, x.mes, x.dia);
    }
    default: return null;
  }
}

/* ── As funções de matriz ─────────────────────────────────────────────────── */

/** O argumento, ou o padrão quando ele não veio ou veio em branco. */
const presente = (args: No[], i: number) => args[i] !== undefined && args[i].k !== 'omitido';

function numeroOu(ctx: Ctx, args: No[], i: number, padrao: number): number | Valor {
  if (!presente(args, i)) return padrao;
  return comoNumero(avaliar(ctx, args[i]));
}

function logicoOu(ctx: Ctx, args: No[], i: number, padrao: boolean): boolean | Valor {
  if (!presente(args, i)) return padrao;
  return comoCondicao(avaliar(ctx, args[i]));
}

/** O argumento como tabela — um valor só vira tabela de uma célula. */
function matrizDoArg(ctx: Ctx, no: No): Matriz | Valor {
  const r = avaliarM(ctx, no);
  if (!ehMatriz(r) && ehErro(r)) return r;
  return comoMatriz(r);
}

/*
  Lista de procura é uma linha ou uma coluna. Uma tabela de duas dimensões não
  diz em que sentido procurar, e o Excel responde #VALOR! — que aqui também é
  melhor do que escolher um sentido calado.
*/
function vetorDoArg(ctx: Ctx, no: No): Valor[] | Valor {
  const m = matrizDoArg(ctx, no);
  if (!ehMatriz(m)) return m;
  if (m.linhas !== 1 && m.colunas !== 1) return erro('valor');
  return m.vs;
}

const linhaDe = (m: Matriz, i: number) => m.vs.slice(i * m.colunas, (i + 1) * m.colunas);
const colunaDe = (m: Matriz, j: number) => Array.from({ length: m.linhas }, (_, i) => em(m, i, j));
const transposta = (m: Matriz): Matriz => {
  const vs: Valor[] = [];
  for (let j = 0; j < m.colunas; j++) for (let i = 0; i < m.linhas; i++) vs.push(em(m, i, j));
  return matriz(m.colunas, m.linhas, vs);
};

/**
 * Como dois valores se ordenam, quando se ordenam.
 *
 * Número só se compara com número e texto com texto: é o que o PROCX e o
 * CORRESPX fazem, e é por isso que o número 5 não acha o texto "5" que alguém
 * colou de outro lugar — a mesma assimetria do número guardado como texto.
 * `null` quer dizer "não se comparam", e não "são diferentes".
 */
function sinal(a: Valor, b: Valor): number | null {
  if (a.tipo === 'numero' && b.tipo === 'numero') return Math.sign(a.n - b.n);
  if (a.tipo === 'texto' && b.tipo === 'texto') {
    return Math.sign(a.t.localeCompare(b.t, 'pt-BR', { sensitivity: 'accent' }));
  }
  if (a.tipo === 'logico' && b.tipo === 'logico') return Math.sign(Number(a.b) - Number(b.b));
  return null;
}

/*
  O curinga do modo 2: `*` é qualquer sequência, `?` é uma letra, e o til
  escapa os dois — `~*` é um asterisco de verdade. Maiúscula não diferencia e
  acento diferencia, que é a regra de comparação da planilha inteira.
*/
function casaCuringa(padrao: string, texto: string): boolean {
  const p = padrao.toLocaleLowerCase('pt-BR');
  const literal = (ch: string) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let re = '';
  for (let i = 0; i < p.length; i++) {
    const ch = p[i];
    if (ch === '~' && i + 1 < p.length) re += literal(p[++i]);
    else if (ch === '*') re += '[\\s\\S]*';
    else if (ch === '?') re += '[\\s\\S]';
    else re += literal(ch);
  }
  return new RegExp(`^${re}$`).test(texto.toLocaleLowerCase('pt-BR'));
}

/**
 * A posição do alvo na lista, nos modos do PROCX e do CORRESPX; -1 se não
 * achar.
 *
 * Correspondência: 0 exato, -1 exato ou o próximo menor, 1 exato ou o próximo
 * maior, 2 com curinga. Pesquisa: 1 do primeiro ao último, -1 do último ao
 * primeiro, 2 e -2 binária sobre a lista em ordem crescente e decrescente.
 *
 * A binária é binária de verdade: numa lista fora de ordem ela erra, como no
 * Excel. É o modo rápido para lista grande ordenada, e o preço dele é esse —
 * fazê-la acertar sempre esconderia o preço.
 */
function procurar(alvo: Valor, lista: Valor[], modoCorr: number, modoPesq: number): number | Valor {
  if (![0, -1, 1, 2].includes(modoCorr) || ![1, -1, 2, -2].includes(modoPesq)) return erro('valor');
  const n = lista.length;
  const igual = (v: Valor) => (modoCorr === 2 && alvo.tipo === 'texto' && v.tipo === 'texto'
    ? casaCuringa(alvo.t, v.t)
    : sinal(v, alvo) === 0);

  if (modoPesq === 2 || modoPesq === -2) {
    if (modoCorr === 2) return erro('valor');
    const crescente = modoPesq === 2;
    let lo = 0;
    let hi = n - 1;
    while (lo <= hi) {
      const meio = (lo + hi) >> 1;
      const d = sinal(lista[meio], alvo);
      if (d === 0) return meio;
      if (d === null) return erro('nd');
      if (crescente ? d < 0 : d > 0) lo = meio + 1;
      else hi = meio - 1;
    }
    /* Ao fim, `hi` é o último antes do alvo e `lo` o primeiro depois dele. */
    if (modoCorr === -1) {
      const i = crescente ? hi : lo;
      return i >= 0 && i < n ? i : -1;
    }
    if (modoCorr === 1) {
      const i = crescente ? lo : hi;
      return i >= 0 && i < n ? i : -1;
    }
    return -1;
  }

  const ordem = modoPesq === 1
    ? Array.from({ length: n }, (_, i) => i)
    : Array.from({ length: n }, (_, i) => n - 1 - i);
  for (const i of ordem) if (igual(lista[i])) return i;
  if (modoCorr !== -1 && modoCorr !== 1) return -1;

  let melhor = -1;
  for (const i of ordem) {
    const d = sinal(lista[i], alvo);
    if (d === null || d === 0 || d !== modoCorr) continue;
    if (melhor < 0) { melhor = i; continue; }
    /* Do lado pedido, o mais perto do alvo; empate fica com o primeiro achado. */
    const cmp = sinal(lista[i], lista[melhor]);
    if (cmp !== null && (modoCorr === -1 ? cmp > 0 : cmp < 0)) melhor = i;
  }
  return melhor;
}

/*
  A ordem do CLASSIFICAR: número, texto, lógico, nessa ordem em ordem
  crescente e invertida em decrescente — a regra dos três blocos que a
  planilha já usa para classificar a tabela, pelo motivo escrito lá. O erro e
  o vazio ficam no fim nos dois sentidos: vazio no topo de uma lista em ordem
  decrescente seria o primeiro colocado em branco.
*/
function compararParaClassificar(a: Valor, b: Valor, crescente: boolean): number {
  const bloco = (v: Valor) => ({ numero: 0, texto: 1, logico: 2, erro: 3, vazio: 4 }[v.tipo]);
  const ba = bloco(a);
  const bb = bloco(b);
  if (ba >= 3 || bb >= 3) return ba - bb;
  if (ba !== bb) return crescente ? ba - bb : bb - ba;
  const d = sinal(a, b) ?? 0;
  return crescente ? d : -d;
}

/* Linhas inteiras reordenadas — ou colunas, quando se ordena por coluna. */
function reordenar(m: Matriz, porColuna: boolean, chaves: Array<{ valores: Valor[]; crescente: boolean }>): Matriz {
  const n = porColuna ? m.colunas : m.linhas;
  const ordem = Array.from({ length: n }, (_, i) => i).sort((x, y) => {
    for (const k of chaves) {
      const d = compararParaClassificar(k.valores[x], k.valores[y], k.crescente);
      if (d !== 0) return d;
    }
    return x - y;
  });
  if (porColuna) return transposta(matriz(n, m.linhas, ordem.flatMap(j => colunaDe(m, j))));
  return matriz(n, m.colunas, ordem.flatMap(i => linhaDe(m, i)));
}

/*
  A chave com que ÚNICO compara: maiúscula não diferencia, acento diferencia,
  e o número 5 é diferente do texto "5" — as regras de `sinal`, escritas como
  texto para caber num mapa.
*/
function chaveDeUnico(v: Valor): string {
  switch (v.tipo) {
    case 'numero': return `n${v.n}`;
    case 'texto': return `t${v.t.toLocaleLowerCase('pt-BR')}`;
    case 'logico': return `l${v.b}`;
    case 'vazio': return 'v';
    case 'erro': return `e${v.e}`;
  }
}

/* Uma lista de matrizes empilhadas; o que falta para completar a fileira é #N/D. */
function empilhar(ms: Matriz[], vertical: boolean): Matriz {
  const ts = vertical ? ms : ms.map(transposta);
  const colunas = Math.max(...ts.map(m => m.colunas));
  const vs: Valor[] = [];
  let linhas = 0;
  for (const m of ts) {
    for (let i = 0; i < m.linhas; i++) {
      for (let j = 0; j < colunas; j++) vs.push(j < m.colunas ? em(m, i, j) : erro('nd'));
    }
    linhas += m.linhas;
  }
  const r = matriz(linhas, colunas, vs);
  return vertical ? r : transposta(r);
}

/*
  O teto do que uma função de matriz monta. A grade daqui é pequena, e uma
  SEQUÊNCIA de um milhão de linhas travaria a aba antes de descobrir que não
  tem onde cair.
*/
const LIMITE_DE_ELEMENTOS = 100_000;

type FuncaoDeMatriz = (ctx: Ctx, args: No[]) => Res;

const FUNCOES_DE_MATRIZ: Record<string, FuncaoDeMatriz> = {
  /*
    PROCX procura numa lista e devolve da outra, em qualquer direção — o PROCV
    só devolve à direita da coluna de procura. E o padrão é **exato**: o
    contrário do PROCV, e a razão de ele existir. Não achar é #N/D, a não ser
    que o quarto argumento diga o que mostrar.

    Se a lista de retorno tiver várias colunas, ele devolve a linha inteira, e
    ela derrama para a direita: é assim que um PROCX traz nome, unidade e
    telefone de uma vez.
  */
  PROCX: (ctx, args) => {
    if (args.length < 3 || args.length > 6) return erro('valor');
    const alvo = avaliar(ctx, args[0]);
    if (ehErro(alvo)) return alvo;
    const ml = matrizDoArg(ctx, args[1]);
    if (!ehMatriz(ml)) return ml;
    const mr = matrizDoArg(ctx, args[2]);
    if (!ehMatriz(mr)) return mr;
    if (ml.linhas !== 1 && ml.colunas !== 1) return erro('valor');
    /* A lista de procura em pé devolve a linha; deitada, a coluna. */
    const emColuna = ml.colunas === 1 && (ml.linhas > 1 || mr.linhas === 1);
    if (emColuna ? mr.linhas !== ml.linhas : mr.colunas !== ml.colunas) return erro('valor');
    const modoCorr = numeroOu(ctx, args, 4, 0);
    if (typeof modoCorr !== 'number') return modoCorr;
    const modoPesq = numeroOu(ctx, args, 5, 1);
    if (typeof modoPesq !== 'number') return modoPesq;
    const i = procurar(alvo, ml.vs, Math.trunc(modoCorr), Math.trunc(modoPesq));
    if (typeof i !== 'number') return i;
    if (i < 0) return presente(args, 3) ? avaliarM(ctx, args[3]) : erro('nd');
    return emColuna ? matriz(1, mr.colunas, linhaDe(mr, i)) : matriz(mr.linhas, 1, colunaDe(mr, i));
  },

  /*
    ÍNDICE devolve o que está na linha e na coluna pedidas. Zero numa das duas
    devolve a coluna ou a linha inteira, que derrama; numa lista de uma
    dimensão só, o segundo argumento já é a posição.
  */
  INDICE: (ctx, args) => {
    if (args.length < 2 || args.length > 3) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const nl = numeroOu(ctx, args, 1, 0);
    if (typeof nl !== 'number') return nl;
    let lin = Math.trunc(nl);
    let col: number;
    if (presente(args, 2)) {
      const nc = numeroOu(ctx, args, 2, 0);
      if (typeof nc !== 'number') return nc;
      col = Math.trunc(nc);
    } else if (m.linhas === 1) {
      col = lin;
      lin = 1;
    } else {
      col = m.colunas === 1 ? 1 : 0;
    }
    if (lin < 0 || col < 0) return erro('valor');
    if (lin > m.linhas || col > m.colunas) return erro('ref');
    if (lin === 0 && col === 0) return m;
    if (lin === 0) return matriz(m.linhas, 1, colunaDe(m, col - 1));
    if (col === 0) return matriz(1, m.colunas, linhaDe(m, lin - 1));
    return em(m, lin - 1, col - 1);
  },

  /*
    FILTRO devolve as linhas em que a condição é verdadeira — a condição é uma
    coluna do mesmo tamanho, quase sempre uma comparação como `C2:C40="Falcão"`.
    Para juntar duas condições, multiplica-se (e) ou soma-se (ou):
    `(C2:C40="Falcão")*(D2:D40>12)`. E/OU não servem aqui, porque devolvem um
    valor só para a tabela inteira.

    Ninguém passar é #CALC!, a não ser que o terceiro argumento diga o que
    mostrar: uma lista vazia que aparecesse como célula em branco seria lida
    como "a fórmula não fez nada".
  */
  FILTRO: (ctx, args) => {
    if (args.length < 2 || args.length > 3) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const inc = matrizDoArg(ctx, args[1]);
    if (!ehMatriz(inc)) return inc;
    let porLinha: boolean;
    if (inc.colunas === 1 && inc.linhas === m.linhas) porLinha = true;
    else if (inc.linhas === 1 && inc.colunas === m.colunas) porLinha = false;
    else return erro('valor');
    const ficam: number[] = [];
    for (let k = 0; k < inc.vs.length; k++) {
      const c = comoCondicao(inc.vs[k]);
      if (typeof c !== 'boolean') return c;
      if (c) ficam.push(k);
    }
    if (ficam.length === 0) return presente(args, 2) ? avaliarM(ctx, args[2]) : erro('calc');
    if (porLinha) return matriz(ficam.length, m.colunas, ficam.flatMap(i => linhaDe(m, i)));
    return transposta(matriz(ficam.length, m.linhas, ficam.flatMap(j => colunaDe(m, j))));
  },

  /*
    CLASSIFICAR devolve uma cópia em ordem e não mexe na tabela de origem —
    que é a diferença para o botão Classificar da faixa, que reordena os
    dados. A cópia se refaz sozinha quando a origem muda; a classificação do
    botão, não.
  */
  CLASSIFICAR: (ctx, args) => {
    if (args.length < 1 || args.length > 4) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const indice = numeroOu(ctx, args, 1, 1);
    if (typeof indice !== 'number') return indice;
    const ordem = numeroOu(ctx, args, 2, 1);
    if (typeof ordem !== 'number') return ordem;
    const porColuna = logicoOu(ctx, args, 3, false);
    if (typeof porColuna !== 'boolean') return porColuna;
    const k = Math.trunc(indice);
    if (ordem !== 1 && ordem !== -1) return erro('valor');
    if (k < 1 || k > (porColuna ? m.linhas : m.colunas)) return erro('valor');
    const valores = porColuna ? linhaDe(m, k - 1) : colunaDe(m, k - 1);
    return reordenar(m, porColuna, [{ valores, crescente: ordem === 1 }]);
  },

  /*
    CLASSIFICARPOR ordena por uma coluna que nem precisa aparecer no
    resultado — a lista de nomes em ordem de idade, sem a idade. As chaves vêm
    em pares, coluna e ordem, e a segunda desempata a primeira.
  */
  CLASSIFICARPOR: (ctx, args) => {
    if (args.length < 2) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const chaves: Array<{ valores: Valor[]; crescente: boolean }> = [];
    let porColuna: boolean | null = null;
    for (let i = 1; i < args.length; i += 2) {
      const por = matrizDoArg(ctx, args[i]);
      if (!ehMatriz(por)) return por;
      const essa = por.colunas === 1 && por.linhas === m.linhas ? false
        : por.linhas === 1 && por.colunas === m.colunas ? true : null;
      if (essa === null || (porColuna !== null && essa !== porColuna)) return erro('valor');
      porColuna = essa;
      const ordem = numeroOu(ctx, args, i + 1, 1);
      if (typeof ordem !== 'number') return ordem;
      if (ordem !== 1 && ordem !== -1) return erro('valor');
      chaves.push({ valores: por.vs, crescente: ordem === 1 });
    }
    return reordenar(m, porColuna ?? false, chaves);
  },

  /*
    ÚNICO tira as repetições, na ordem em que cada uma aparece primeiro. O
    terceiro argumento troca a pergunta — "quem aparece uma vez só" —, que é a
    pergunta de quem procura o inscrito que ninguém mais repetiu.
  */
  UNICO: (ctx, args) => {
    if (args.length < 1 || args.length > 3) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const porColuna = logicoOu(ctx, args, 1, false);
    if (typeof porColuna !== 'boolean') return porColuna;
    const umaVez = logicoOu(ctx, args, 2, false);
    if (typeof umaVez !== 'boolean') return umaVez;
    const base = porColuna ? transposta(m) : m;
    const quantas = new Map<string, number>();
    const chaves = Array.from({ length: base.linhas }, (_, i) => linhaDe(base, i).map(chaveDeUnico).join('\u0000'));
    for (const k of chaves) quantas.set(k, (quantas.get(k) ?? 0) + 1);
    const vistas = new Set<string>();
    const ficam: number[] = [];
    chaves.forEach((k, i) => {
      if (vistas.has(k)) return;
      vistas.add(k);
      if (!umaVez || quantas.get(k) === 1) ficam.push(i);
    });
    if (ficam.length === 0) return erro('calc');
    const r = matriz(ficam.length, base.colunas, ficam.flatMap(i => linhaDe(base, i)));
    return porColuna ? transposta(r) : r;
  },

  /* SEQUÊNCIA(linhas; colunas; início; passo) — a numeração que se arrastaria à mão. */
  SEQUENCIA: (ctx, args) => {
    if (args.length < 1 || args.length > 4) return erro('valor');
    const ns: number[] = [];
    for (const [i, padrao] of [[0, NaN], [1, 1], [2, 1], [3, 1]] as const) {
      if (i === 0 && !presente(args, 0)) return erro('valor');
      const n = numeroOu(ctx, args, i, padrao);
      if (typeof n !== 'number') return n;
      ns.push(n);
    }
    const linhas = Math.trunc(ns[0]);
    const colunas = Math.trunc(ns[1]);
    if (linhas < 1 || colunas < 1) return erro('calc');
    if (linhas * colunas > LIMITE_DE_ELEMENTOS) return erro('num');
    const vs: Valor[] = [];
    for (let k = 0; k < linhas * colunas; k++) vs.push(num(ns[2] + k * ns[3]));
    return matriz(linhas, colunas, vs);
  },

  TRANSPOR: (ctx, args) => {
    if (args.length !== 1) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    return ehMatriz(m) ? transposta(m) : m;
  },

  EMPILHARV: (ctx, args) => empilharArgs(ctx, args, true),
  EMPILHARH: (ctx, args) => empilharArgs(ctx, args, false),

  /* As colunas pedidas, na ordem pedida; número negativo conta do fim. */
  ESCOLHERCOLS: (ctx, args) => escolher(ctx, args, true),
  ESCOLHERLINS: (ctx, args) => escolher(ctx, args, false),

  /*
    APARARINTERVALO tira as linhas e colunas vazias das pontas — é a função
    por trás dos operadores `.:.`, `.:` e `:.`. Escrever `=A:A` derrama a
    coluna inteira, com zero em cada linha vazia até o fim da grade;
    `=APARARINTERVALO(A:A)`, ou `=A:.A`, para onde o dado acaba.
  */
  APARARINTERVALO: (ctx, args) => {
    if (args.length < 1 || args.length > 3) return erro('valor');
    const m = matrizDoArg(ctx, args[0]);
    if (!ehMatriz(m)) return m;
    const linhas = numeroOu(ctx, args, 1, 3);
    if (typeof linhas !== 'number') return linhas;
    const colunas = numeroOu(ctx, args, 2, 3);
    if (typeof colunas !== 'number') return colunas;
    if (![0, 1, 2, 3].includes(linhas) || ![0, 1, 2, 3].includes(colunas)) return erro('valor');
    const r = apararMatriz(m, linhas, colunas);
    return r ? r.m : erro('ref');
  },

  /*
    ARRAYFORMULA é do Planilhas Google: lá a conta só se faz em cada elemento
    quando a fórmula é embrulhada nela. Aqui toda fórmula já faz — como no
    Excel de hoje —, e ela só devolve o que recebe. Existe para que a fórmula
    copiada de uma planilha do Google funcione igual.
  */
  ARRAYFORMULA: (ctx, args) => (args.length === 1 ? avaliarM(ctx, args[0]) : erro('valor')),
};

function empilharArgs(ctx: Ctx, args: No[], vertical: boolean): Res {
  if (args.length === 0) return erro('valor');
  const ms: Matriz[] = [];
  for (const arg of args) {
    const m = matrizDoArg(ctx, arg);
    if (!ehMatriz(m)) return m;
    ms.push(m);
  }
  return empilhar(ms, vertical);
}

function escolher(ctx: Ctx, args: No[], colunas: boolean): Res {
  if (args.length < 2) return erro('valor');
  const m = matrizDoArg(ctx, args[0]);
  if (!ehMatriz(m)) return m;
  const total = colunas ? m.colunas : m.linhas;
  const posicoes: number[] = [];
  for (const arg of args.slice(1)) {
    const p = matrizDoArg(ctx, arg);
    if (!ehMatriz(p)) return p;
    for (const v of p.vs) {
      const n = comoNumero(v);
      if (typeof n !== 'number') return n;
      const k = Math.trunc(n);
      if (k === 0 || Math.abs(k) > total) return erro('valor');
      posicoes.push(k > 0 ? k - 1 : total + k);
    }
  }
  if (colunas) return transposta(matriz(posicoes.length, m.linhas, posicoes.flatMap(j => colunaDe(m, j))));
  return matriz(posicoes.length, m.colunas, posicoes.flatMap(i => linhaDe(m, i)));
}

/*
  As funções de um valor só que, recebendo uma matriz onde esperam um valor,
  se aplicam a cada elemento — `=ANO(B2:B40)` devolve a coluna dos anos, e
  `=SE(C2:C40>=12;"maior";"menor")` a coluna das respostas. A lista diz em
  quais argumentos: no PROCV o valor procurado e o índice se espalham, mas a
  tabela, que já é matriz, não.
*/
const ELEVAVEIS: Record<string, 'todos' | number[]> = {
  SE: 'todos', SEERRO: 'todos', NAO: 'todos', ARRED: 'todos',
  DATA: 'todos', DIA: 'todos', MES: 'todos', ANO: 'todos', DIAS: 'todos',
  DATADIF: 'todos', DIADASEMANA: 'todos',
  PROCV: [0, 2, 3], PROCX: [0], CORRESP: [0], CORRESPX: [0], INDICE: [1, 2],
  CONTSE: [1], SOMASE: [1],
};

const posicoesDe = (e: 'todos' | number[], n: number) =>
  (e === 'todos' ? Array.from({ length: n }, (_, i) => i) : e.filter(i => i < n));

/**
 * O nó pode devolver mais de um valor? Decidido pela forma, sem calcular.
 *
 * É o que diz quais fórmulas podem derramar sem ser preciso calculá-las, e
 * quando uma função de um valor só precisa se aplicar elemento a elemento.
 */
function podeSerMatriz(no: No): boolean {
  switch (no.k) {
    case 'faixa':
    case 'colunas':
    case 'derramada':
    case 'matriz':
      return true;
    case 'neg': return podeSerMatriz(no.a);
    case 'bin': return podeSerMatriz(no.a) || podeSerMatriz(no.b);
    case 'chamada': {
      const f = semAcento(no.nome);
      if (f in FUNCOES_DE_MATRIZ) return true;
      const e = ELEVAVEIS[f];
      return !!e && posicoesDe(e, no.args.length).some(i => podeSerMatriz(no.args[i]));
    }
    default: return false;
  }
}

function chamadaM(ctx: Ctx, nome: string, args: No[]): Res {
  const f = semAcento(nome);
  const deMatriz = FUNCOES_DE_MATRIZ[f];
  const chamar = (as: No[]): Res => (deMatriz ? deMatriz(ctx, as) : chamada(ctx, nome, as));

  const e = ELEVAVEIS[f];
  const elevadas = e ? posicoesDe(e, args.length).filter(i => podeSerMatriz(args[i])) : [];
  if (elevadas.length === 0) return chamar(args);

  const valores = new Map<number, Res>();
  for (const i of elevadas) valores.set(i, simplificar(avaliarM(ctx, args[i])));
  const comValores = (de: (r: Res) => Valor) =>
    args.map((a, i): No => (valores.has(i) ? { k: 'val', v: de(valores.get(i)!) } : a));

  const ms = [...valores.values()].filter(ehMatriz);
  if (ms.length === 0) return chamar(comValores(r => r as Valor));

  const linhas = Math.max(...ms.map(m => m.linhas));
  const colunas = Math.max(...ms.map(m => m.colunas));
  const vs: Valor[] = [];
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      const r = simplificar(chamar(comValores(v => (ehMatriz(v) ? esticado(v, i, j) : v))));
      /* Cada elemento devolvendo uma tabela daria tabela dentro de tabela, que a grade não tem como mostrar. */
      vs.push(ehMatriz(r) ? erro('calc') : r);
    }
  }
  return matriz(linhas, colunas, vs);
}

function chamada(ctx: Ctx, nome: string, args: No[]): Valor {
  const f = semAcento(nome);

  const agregar = (conta: (ns: number[]) => Valor, vazioDa: () => Valor): Valor => {
    const ns = numerosDosArgs(ctx, args);
    if (!Array.isArray(ns)) return ns;
    return ns.length === 0 ? vazioDa() : conta(ns);
  };

  switch (f) {
    /* A soma de nada é zero, como no Excel — a média de nada não é. */
    case 'SOMA': return agregar(ns => num(ns.reduce((s, n) => s + n, 0)), () => num(0));
    case 'MEDIA': return agregar(ns => num(ns.reduce((s, n) => s + n, 0) / ns.length), () => erro('div0'));
    case 'MAXIMO': return agregar(ns => num(Math.max(...ns)), () => num(0));
    case 'MINIMO': return agregar(ns => num(Math.min(...ns)), () => num(0));

    /*
      As medidas que a CC-ES009 pede, e as três dizem coisas diferentes sobre
      o mesmo conjunto — que é o requisito 3 inteiro.

      MED ordena e tira o do meio. Com um número par de valores ele é a média
      dos dois centrais, e não "o de baixo": num conjunto de 48 inscritos,
      pegar um dos dois daria uma mediana que existe na tabela e está errada,
      que é pior do que uma que não existe.
    */
    case 'MED': return agregar(ns => {
      const o = [...ns].sort((a, b) => a - b);
      const m = o.length >> 1;
      return num(o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2);
    }, () => erro('num'));

    /*
      MODO devolve **#N/D quando nada se repete**, que é o que o Excel faz, e
      é a metade da lição que um zero ou um "não há" apagaria: conjunto sem
      valor repetido não tem moda, e escrever um número ali afirmaria uma moda
      que não existe. Havendo empate, vale o primeiro a aparecer na ordem em
      que os valores foram lidos — também como no Excel.
    */
    /* `MODO.ÚNICO` é o nome que o Excel de hoje mostra na lista de funções, e
       `MODO` é o de compatibilidade — os dois funcionam lá. Aceitar só um
       devolveria `#NOME?` a quem digitou o nome que o próprio programa
       sugeriu, e ele concluiria que errou a fórmula. `semAcento` já tira o
       ponto, então os dois chegam aqui com a mesma cara. */
    case 'MODOUNICO':
    case 'MODO': return agregar(ns => {
      const quantas = new Map<number, number>();
      for (const n of ns) quantas.set(n, (quantas.get(n) ?? 0) + 1);
      let melhor = 0;
      for (const c of quantas.values()) melhor = Math.max(melhor, c);
      if (melhor < 2) return erro('nd');
      return num(ns.find(n => quantas.get(n) === melhor) as number);
    }, () => erro('nd'));

    /*
      Os dois desvios padrão, e a diferença entre eles é escolha de quem
      analisa, não detalhe de implementação.

      DESVPADP divide por n e responde sobre o conjunto **inteiro**;
      DESVPAD divide por n−1 e responde sobre uma **amostra** de algo maior.
      Na base da CC-ES009 estão todos os inscritos, então quem responde é o
      P — e em 48 valores os dois diferem por cerca de 1%, que é exatamente o
      número plausível e pouco errado de que esta vereda trata. Ter só um
      deles obrigaria a lição a não mencionar a escolha, e o desbravador
      levaria para o computador do clube uma fórmula que ele escolheu sem
      saber que estava escolhendo.

      DESVPAD de um valor só é #DIV/0!, e não zero: não há n−1 por onde
      dividir, e zero afirmaria que não há dispersão nenhuma. DESVPADP de um
      valor só é zero de verdade — um conjunto de um elemento não varia.
    */
    case 'DESVPADA':
    case 'DESVPAD': return agregar(ns => desvio(ns, ns.length - 1), () => erro('div0'));
    case 'DESVPADP': return agregar(ns => desvio(ns, ns.length), () => erro('div0'));

    /*
      As duas contagens, e a diferença entre elas é o que acha o número
      guardado como texto: CONT.NÚM conta o que a planilha entende como
      número, CONT.VALORES conta o que está preenchido. Doze linhas, `11` numa
      e `12` na outra, e o defeito tem endereço.
    */
    case 'CONTNUM': {
      const ns = numerosDosArgs(ctx, args.map(a => (a.k === 'ref' ? { k: 'faixa' as const, a: a.r, b: a.r, aparar: 'nada' as const } : a)));
      return Array.isArray(ns) ? num(ns.length) : ns;
    }
    case 'CONTVALORES': {
      const vs = valoresDosArgs(ctx, args);
      return Array.isArray(vs) ? num(vs.filter(v => v.tipo !== 'vazio').length) : vs;
    }

    /*
      SUBTOTAL é a SOMA que respeita o filtro, e é a lição inteira da AP044:
      com linha escondida, a célula do `=SOMA` e a barra de status deixam de
      bater, e só esta fórmula concorda com o que está à vista.

      O código diz qual conta: 1 média, 2 contagem de números, 3 contagem de
      preenchidas, 4 máximo, 5 mínimo, 9 soma — e o mesmo mais cem. No Excel
      a centena só muda para linha escondida **à mão**; a escondida pelo
      filtro sai das duas, e aqui não há outra. Outro SUBTOTAL dentro da
      faixa fica de fora, como lá: senão o total de grupo contaria duas vezes.
    */
    case 'SUBTOTAL': {
      if (args.length < 2) return erro('valor');
      const cod = comoNumero(avaliar(ctx, args[0]));
      if (typeof cod !== 'number') return cod;
      const tipo = Math.trunc(cod) % 100;
      const vs: Valor[] = [];
      for (const arg of args.slice(1)) {
        if (arg.k !== 'ref' && !DE_FAIXA.has(arg.k)) return erro('valor');
        const g = regiaoDe(ctx, arg);
        if (!ehRegiao(g)) return g;
        for (let i = 0; i < g.m.linhas; i++) {
          const l = g.linha + i;
          if (ctx.escondida?.(l, g.aba)) continue;
          for (let j = 0; j < g.m.colunas; j++) {
            if (/^\s*=\s*SUBTOTAL\s*\(/i.test(ctx.bruto(l, g.coluna + j, g.aba) ?? '')) continue;
            const v = em(g.m, i, j);
            if (ehErro(v)) return v;
            vs.push(v);
          }
        }
      }
      const ns = vs.flatMap(v => (v.tipo === 'numero' ? [v.n] : []));
      switch (tipo) {
        case 1: return ns.length ? num(ns.reduce((s, n) => s + n, 0) / ns.length) : erro('div0');
        case 2: return num(ns.length);
        case 3: return num(vs.filter(v => v.tipo !== 'vazio').length);
        case 4: return num(ns.length ? Math.max(...ns) : 0);
        case 5: return num(ns.length ? Math.min(...ns) : 0);
        case 9: return num(ns.reduce((s, n) => s + n, 0));
        default: return erro('valor');
      }
    }

    /*
      O intervalo do CONT.SE e do SOMASE tem de ser um pedaço da grade, como
      no Excel — `A2:A40`, `A:.A`, `D2#` —, e não uma conta: o critério se
      testa contra o que está escrito, e uma matriz calculada não está
      escrita em lugar nenhum.
    */
    case 'CONTSE': {
      if (args.length !== 2 || !DE_FAIXA.has(args[0].k)) return erro('valor');
      const criterio = avaliar(ctx, args[1]);
      if (ehErro(criterio)) return criterio;
      const g = regiaoDe(ctx, args[0]);
      if (!ehRegiao(g)) return g;
      return num(g.m.vs.filter(v => !ehErro(v) && testarCriterio(criterio, v)).length);
    }

    case 'SOMASE': {
      if (args.length < 2 || !DE_FAIXA.has(args[0].k)) return erro('valor');
      const criterio = avaliar(ctx, args[1]);
      if (ehErro(criterio)) return criterio;
      const g = regiaoDe(ctx, args[0]);
      if (!ehRegiao(g)) return g;
      const testadas = g.m.vs;
      let somadas = testadas;
      if (args[2] && DE_FAIXA.has(args[2].k)) {
        const gs = regiaoDe(ctx, args[2]);
        if (!ehRegiao(gs)) return gs;
        somadas = gs.m.vs;
      }
      let total = 0;
      testadas.forEach((v, i) => {
        if (ehErro(v) || !testarCriterio(criterio, v)) return;
        const alvo = somadas[i];
        if (alvo && alvo.tipo === 'numero') total += alvo.n;
      });
      return num(total);
    }

    case 'SE': {
      if (args.length < 2 || args.length > 3) return erro('valor');
      const cond = comoCondicao(avaliar(ctx, args[0]));
      if (typeof cond !== 'boolean') return cond;
      if (cond) return avaliar(ctx, args[1]);
      return args[2] ? avaliar(ctx, args[2]) : logico(false);
    }

    case 'E':
    case 'OU': {
      const vs = valoresDosArgs(ctx, args);
      if (!Array.isArray(vs)) return vs;
      if (vs.length === 0) return erro('valor');
      const conds: boolean[] = [];
      for (const v of vs) {
        const c = comoCondicao(v);
        if (typeof c !== 'boolean') return c;
        conds.push(c);
      }
      return logico(f === 'E' ? conds.every(Boolean) : conds.some(Boolean));
    }

    case 'NAO': {
      if (args.length !== 1) return erro('valor');
      const c = comoCondicao(avaliar(ctx, args[0]));
      return typeof c === 'boolean' ? logico(!c) : c;
    }

    case 'ARRED': {
      if (args.length !== 2) return erro('valor');
      const n = comoNumero(avaliar(ctx, args[0]));
      if (typeof n !== 'number') return n;
      const casas = comoNumero(avaliar(ctx, args[1]));
      if (typeof casas !== 'number') return casas;
      const f10 = 10 ** Math.trunc(casas);
      return num(Math.round(n * f10) / f10);
    }

    /*
      A família da regressão, que é o requisito 5 da CC-ES010 inteiro.

      **A ordem dos argumentos é a armadilha, e ela é do Excel.** CORREL é
      simétrica — trocar as duas faixas devolve o mesmo número, porque a
      correlação não tem lado. As outras três não são: INCLINAÇÃO,
      INTERCEPÇÃO e RQUAD recebem **o y primeiro**, e trocá-las devolve um
      número perfeitamente plausível da reta ao contrário. Quem escreve
      `=INCLINAÇÃO(idades; alturas)` pensando "idade explica altura" recebe a
      inclinação de idade sobre altura, que é outra reta, sem erro nenhum.

      Escrever as quatro com a mesma ordem "arrumaria" isso e ensinaria uma
      planilha que não existe — é a decisão do PROCV aproximado por padrão,
      logo abaixo, pelo motivo escrito lá.
    */
    case 'PEARSON':
    case 'CORREL': return comPares(ctx, args, 0, (ys, xs) => {
      const r = correlacao(ys, xs);
      return r === null ? erro('div0') : num(r);
    });

    /* Do y sobre o x: `ys` é o primeiro argumento nas três. */
    case 'INCLINACAO': return comPares(ctx, args, 0, (ys, xs) => {
      const a = ajuste(ys, xs);
      return a === null ? erro('div0') : num(a.inclinacao);
    });
    case 'INTERCEPCAO': return comPares(ctx, args, 0, (ys, xs) => {
      const a = ajuste(ys, xs);
      return a === null ? erro('div0') : num(a.intercepcao);
    });

    /*
      RQUAD é o quadrado de CORREL, e não uma conta à parte: duas
      implementações da mesma coisa divergiriam no primeiro ajuste, e a
      divergência apareceria como dois números plausíveis para a mesma
      qualidade de ajuste.
    */
    case 'RQUAD': return comPares(ctx, args, 0, (ys, xs) => {
      const r = correlacao(ys, xs);
      return r === null ? erro('div0') : num(r * r);
    });

    /*
      PREVISÃO recebe o x **antes** das duas faixas, e é por ela que o
      requisito 5.4 acontece: ela responde para qualquer x, inclusive muito
      fora do intervalo observado, e responde com a mesma cara de certeza.
      Recusar a extrapolação seria a plataforma protegendo de um erro que a
      planilha do clube não protege.

      `PREVISÃO.LINEAR` é o nome de hoje e `PREVISÃO` o de compatibilidade,
      como MODO.ÚNICO e MODO: os dois funcionam lá.
    */
    case 'PREVISAOLINEAR':
    case 'PREVISAO': {
      if (args.length !== 3) return erro('valor');
      const x = comoNumero(avaliar(ctx, args[0]));
      if (typeof x !== 'number') return x;
      return comPares(ctx, args, 1, (ys, xs) => {
        const a = ajuste(ys, xs);
        return a === null ? erro('div0') : num(a.intercepcao + a.inclinacao * x);
      });
    }

    case 'PROCV': return procv(ctx, args);

    /*
      As funções de data. Todas leem e devolvem número de série, porque é o que
      a data é — e quem escolhe se ele aparece como 08/11/2026 ou como 46334 é
      o formato da célula, e não a função.
    */
    case 'HOJE':
      return args.length === 0 ? num(serieDeHoje()) : erro('valor');

    /*
      DATA aceita mês 13 e dia 0, e devolve o que eles querem dizer: janeiro
      do ano seguinte, o último dia do mês anterior. É o jeito de somar meses
      que o Excel ensina, `=DATA(ANO(A2);MÊS(A2)+1;DIA(A2))`, e recusar o
      transbordo tiraria a única conta de mês que não precisa de DATAM.
    */
    case 'DATA': {
      if (args.length !== 3) return erro('valor');
      const ns = args.map(a => comoNumero(avaliar(ctx, a)));
      for (const n of ns) if (typeof n !== 'number') return n;
      const [anoEscrito, mes, dia] = (ns as number[]).map(Math.trunc);
      /* Ano de 0 a 1899 soma 1900, que é a regra do Excel para ano curto. */
      const ano = anoEscrito >= 0 && anoEscrito < 1900 ? anoEscrito + 1900 : anoEscrito;
      if (ano < 0 || ano > 9999) return erro('num');
      const serie = serieDe(ano, mes, dia);
      return serie < 1 || serie > MAIOR_SERIE ? erro('num') : num(serie);
    }

    case 'DIA':
    case 'MES':
    case 'ANO': {
      if (args.length !== 1) return erro('valor');
      const n = serieDoArg(ctx, args[0]);
      if (typeof n !== 'number') return n;
      const d = diaDaSerie(n);
      return num(f === 'DIA' ? d.dia : f === 'MES' ? d.mes : d.ano);
    }

    /*
      DIAS recebe o **fim primeiro**, e é a armadilha dela: =DIAS(A2;B2) com
      a saída em A2 e a volta em B2 dá −3, e não 3. DATADIF é o contrário —
      começo primeiro —, e as duas convivem no Excel assim, cada uma com a sua
      ordem. Arrumar uma para ficar igual à outra ensinaria uma planilha que
      não existe; é a decisão da INCLINAÇÃO, pelo motivo escrito lá.
    */
    case 'DIAS': {
      if (args.length !== 2) return erro('valor');
      const fim = serieDoArg(ctx, args[0]);
      if (typeof fim !== 'number') return fim;
      const inicio = serieDoArg(ctx, args[1]);
      if (typeof inicio !== 'number') return inicio;
      return num(Math.floor(fim) - Math.floor(inicio));
    }

    /*
      DATADIF não aparece na lista do Excel — ela é de compatibilidade, e a
      Microsoft a esconde —, e mesmo assim é a função que todo clube usa para
      a idade: =DATADIF(nascimento;HOJE();"Y"). Ela conta anos **completos**,
      que é o que idade quer dizer: quem faz aniversário amanhã ainda tem a
      idade de ontem. Subtrair os anos com ANO() erraria justamente essa
      pessoa, para mais, durante o ano inteiro até o aniversário.

      As unidades são letras do inglês mesmo no Excel em português — "Y" de
      ano, "M" de mês, "D" de dia —, e é a outra armadilha dela: quem escreve
      "A" pensando em ano recebe #NÚM!, como recebe lá. Começo depois do fim
      também é #NÚM!.
    */
    case 'DATADIF': {
      if (args.length !== 3) return erro('valor');
      const a = serieDoArg(ctx, args[0]);
      if (typeof a !== 'number') return a;
      const b = serieDoArg(ctx, args[1]);
      if (typeof b !== 'number') return b;
      const unidade = comoTexto(avaliar(ctx, args[2])).trim().toUpperCase();
      if (Math.floor(a) > Math.floor(b)) return erro('num');
      const r = datadif(Math.floor(a), Math.floor(b), unidade);
      return r === null ? erro('num') : num(r);
    }

    /*
      Domingo é 1 no tipo 1, que é o padrão — e segunda é 1 no tipo 2. A
      semana do clube começa no sábado de reunião para ninguém, e o Excel não
      tem tipo para isso; a lição que precisar escreve a conta.
    */
    case 'DIADASEMANA': {
      if (args.length < 1 || args.length > 2) return erro('valor');
      const n = serieDoArg(ctx, args[0]);
      if (typeof n !== 'number') return n;
      let tipo = 1;
      if (args[1]) {
        const t = comoNumero(avaliar(ctx, args[1]));
        if (typeof t !== 'number') return t;
        tipo = Math.trunc(t);
      }
      const semana = diaDaSerie(n).semana; // 0 = domingo
      if (tipo === 1) return num(semana + 1);
      if (tipo === 2) return num(semana === 0 ? 7 : semana);
      if (tipo === 3) return num(semana === 0 ? 6 : semana - 1);
      return erro('num');
    }

    /*
      SEERRO é o que se escreve em volta do PROCX e do CORRESP quando "não
      achei" tem uma resposta melhor do que #N/D. Ele engole **qualquer**
      erro, e é o perigo dele: um #REF! de uma fórmula quebrada some do mesmo
      jeito, e a coluna fica bonita e errada. O PROCX tem o argumento próprio
      para "não achei", que só pega esse caso.
    */
    case 'SEERRO': {
      if (args.length !== 2) return erro('valor');
      const v = avaliar(ctx, args[0]);
      return ehErro(v) ? avaliar(ctx, args[1]) : v;
    }

    /*
      CORRESP devolve a **posição**, e não o valor — é a metade do par
      ÍNDICE/CORRESP, que procura em qualquer coluna e devolve de qualquer
      outra, inclusive à esquerda, que é o que o PROCV não faz.

      O padrão do terceiro argumento é 1, aproximado, como o do PROCV e pelo
      mesmo motivo escrito lá: é o do Excel, e é a mesma armadilha. Sem o 0,
      numa lista fora de ordem, ele devolve uma posição plausível e errada.
    */
    case 'CORRESP': {
      if (args.length < 2 || args.length > 3) return erro('valor');
      const alvo = avaliar(ctx, args[0]);
      if (ehErro(alvo)) return alvo;
      const lista = vetorDoArg(ctx, args[1]);
      if (!Array.isArray(lista)) return lista;
      const tipo = numeroOu(ctx, args, 2, 1);
      if (typeof tipo !== 'number') return tipo;
      let achou = -1;
      for (let i = 0; i < lista.length; i++) {
        const d = sinal(lista[i], alvo);
        if (Math.trunc(tipo) === 0) {
          if (d === 0) { achou = i; break; }
        } else if (d !== null) {
          const ainda = tipo > 0 ? d <= 0 : d >= 0;
          if (ainda) achou = i;
          else break;
        }
      }
      return achou < 0 ? erro('nd') : num(achou + 1);
    }

    /*
      CORRESPX é o CORRESP de hoje: exato por padrão, procura de trás para
      frente se pedir, e diz "o próximo menor" ou "o próximo maior" sem exigir
      a lista ordenada.
    */
    case 'CORRESPX': {
      if (args.length < 2 || args.length > 4) return erro('valor');
      const alvo = avaliar(ctx, args[0]);
      if (ehErro(alvo)) return alvo;
      const lista = vetorDoArg(ctx, args[1]);
      if (!Array.isArray(lista)) return lista;
      const modoCorr = numeroOu(ctx, args, 2, 0);
      if (typeof modoCorr !== 'number') return modoCorr;
      const modoPesq = numeroOu(ctx, args, 3, 1);
      if (typeof modoPesq !== 'number') return modoPesq;
      const i = procurar(alvo, lista, Math.trunc(modoCorr), Math.trunc(modoPesq));
      if (typeof i !== 'number') return i;
      return i < 0 ? erro('nd') : num(i + 1);
    }

    /*
      SOMARPRODUTO multiplica elemento a elemento e soma tudo — é a soma
      ponderada, e é a conta que antes das matrizes dinâmicas fazia o que hoje
      se escreve `=SOMA(B2:B9*C2:C9)`. As matrizes têm de ter o mesmo tamanho,
      senão é #VALOR!: esticar uma coluna até o tamanho da outra multiplicaria
      por números que ninguém escreveu.

      O que não é número dentro delas vale zero, como no Excel — é o que deixa
      a conta passar por cima de um cabeçalho sem estourar.
    */
    case 'SOMARPRODUTO': {
      if (args.length === 0) return erro('valor');
      const ms: Matriz[] = [];
      for (const arg of args) {
        const m = matrizDoArg(ctx, arg);
        if (!ehMatriz(m)) return m;
        ms.push(m);
      }
      if (ms.some(m => m.linhas !== ms[0].linhas || m.colunas !== ms[0].colunas)) return erro('valor');
      let total = 0;
      for (let k = 0; k < ms[0].vs.length; k++) {
        let produto = 1;
        for (const m of ms) {
          const v = m.vs[k];
          if (ehErro(v)) return v;
          produto *= v.tipo === 'numero' ? v.n : 0;
        }
        total += produto;
      }
      return num(total);
    }

    /*
      Nome que a planilha não conhece é `#NOME?`, e não silêncio: é o erro que
      aparece quando se escreve SOMATORIO no lugar de SOMA, e ele tem de estar
      à vista para que a pessoa vá procurar a função certa.
    */
    default: return erro('nome');
  }
}

/**
 * Os pares (y, x) de duas faixas, alinhados por posição.
 *
 * O descarte é o do Excel e não é detalhe: o par **inteiro** cai quando
 * qualquer um dos dois lados não é número. Descartar só o lado vazio
 * desalinharia tudo o que vem depois — a altura da linha 7 passaria a ser
 * comparada com a idade da linha 8, e a correlação sairia um número plausível
 * sobre pares que não existem.
 *
 * Faixas de tamanhos diferentes são `#N/D`, e não o menor dos dois: cortar no
 * menor responderia sobre parte da base sem dizer que parte.
 */
function paresDe(ys: Valor[], xs: Valor[]): { ys: number[]; xs: number[] } | Valor {
  if (ys.length !== xs.length) return erro('nd');
  const py: number[] = [];
  const px: number[] = [];
  for (let i = 0; i < ys.length; i++) {
    const a = ys[i];
    const b = xs[i];
    if (ehErro(a)) return a;
    if (ehErro(b)) return b;
    if (a.tipo !== 'numero' || b.tipo !== 'numero') continue;
    py.push(a.n);
    px.push(b.n);
  }
  return { ys: py, xs: px };
}

/**
 * Lê as duas faixas a partir de `base` e entrega os pares à conta.
 *
 * `base` existe porque PREVISÃO põe o x na frente: as faixas dela são o
 * segundo e o terceiro argumentos, e as das outras quatro são o primeiro e o
 * segundo.
 */
function comPares(
  ctx: Ctx,
  args: No[],
  base: number,
  conta: (ys: number[], xs: number[]) => Valor,
): Valor {
  const a = args[base];
  const b = args[base + 1];
  if (args.length !== base + 2 || !a || !b) return erro('valor');
  /* Uma célula só não é série nenhuma: correlação de um ponto não existe. */
  if (!podeSerMatriz(a) || !podeSerMatriz(b)) return erro('valor');
  const ma = avaliarM(ctx, a);
  if (!ehMatriz(ma) && ehErro(ma)) return ma;
  const mb = avaliarM(ctx, b);
  if (!ehMatriz(mb) && ehErro(mb)) return mb;
  const pares = paresDe(comoMatriz(ma).vs, comoMatriz(mb).vs);
  /* `in` e não `ehErro`: o retorno não é um `Valor`, e um erro cabe nele. */
  if (!('ys' in pares)) return pares;
  return conta(pares.ys, pares.xs);
}

/**
 * Os desvios em relação à média, que é o que as três contas têm em comum.
 *
 * `null` quando não há par nenhum, o que é #DIV/0! nos três lugares que a
 * chamam — e não zero: zero afirmaria correlação nenhuma sobre dados que não
 * existem.
 */
function somasDosDesvios(ys: number[], xs: number[]): { sxx: number; syy: number; sxy: number } | null {
  const n = ys.length;
  if (n === 0) return null;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  return { sxx, syy, sxy };
}

/**
 * O r de Pearson. `null` quando um dos dois lados não varia — uma coluna de
 * valores iguais não tem como subir nem descer com a outra, e o Excel
 * responde #DIV/0! em vez de zero. Zero diria "não há relação", que é uma
 * afirmação sobre os dados; a recusa diz "não dá para perguntar isto aqui".
 */
function correlacao(ys: number[], xs: number[]): number | null {
  const s = somasDosDesvios(ys, xs);
  if (!s || s.sxx === 0 || s.syy === 0) return null;
  return s.sxy / Math.sqrt(s.sxx * s.syy);
}

/**
 * A reta de mínimos quadrados de y sobre x.
 *
 * Só o x precisa variar: uma coluna y constante dá uma reta horizontal, que é
 * uma resposta legítima (inclinação zero). É por isso que esta guarda não é a
 * de `correlacao`, embora as duas partam das mesmas somas.
 */
function ajuste(ys: number[], xs: number[]): { inclinacao: number; intercepcao: number } | null {
  const s = somasDosDesvios(ys, xs);
  if (!s || s.sxx === 0) return null;
  const n = ys.length;
  const my = ys.reduce((v, x) => v + x, 0) / n;
  const mx = xs.reduce((v, x) => v + x, 0) / n;
  const inclinacao = s.sxy / s.sxx;
  return { inclinacao, intercepcao: my - inclinacao * mx };
}

/**
 * PROCV, com o quarto argumento valendo VERDADEIRO quando não é escrito.
 *
 * Esse padrão é do Excel, e é a armadilha mais cara que a função tem: sem o
 * `FALSO`, ela procura **aproximado** e devolve com segurança o valor da linha
 * errada quando a tabela não está ordenada. Trocar o padrão aqui deixaria o
 * laboratório mais fácil e o computador do clube continuaria com o de lá.
 */
function procv(ctx: Ctx, args: No[]): Valor {
  if (args.length < 3 || args.length > 4) return erro('valor');
  const alvo = avaliar(ctx, args[0]);
  if (ehErro(alvo)) return alvo;

  /* A tabela pode ser faixa ou matriz calculada; uma célula só não é tabela. */
  if (!podeSerMatriz(args[1])) return erro('valor');
  const rt = avaliarM(ctx, args[1]);
  if (!ehMatriz(rt) && ehErro(rt)) return rt;
  const tabela = comoMatriz(rt);

  const indice = comoNumero(avaliar(ctx, args[2]));
  if (typeof indice !== 'number') return indice;

  const col = Math.trunc(indice);
  if (col < 1 || col > tabela.colunas) return erro('ref');

  let aproximado = true;
  if (args[3]) {
    const q = comoCondicao(avaliar(ctx, args[3]));
    if (typeof q !== 'boolean') return q;
    aproximado = q;
  }

  let achou = -1;
  for (let i = 0; i < tabela.linhas; i++) {
    const v = em(tabela, i, 0);
    if (ehErro(v)) return v;
    if (!aproximado) {
      const igual = comparar('=', v, alvo);
      if (igual.tipo === 'logico' && igual.b) { achou = i; break; }
    } else {
      const menorOuIgual = comparar('<=', v, alvo);
      if (menorOuIgual.tipo === 'logico' && menorOuIgual.b) achou = i;
      else break;
    }
  }

  if (achou < 0) return erro('nd');
  return em(tabela, achou, col - 1);
}

/* ── A porta de entrada ───────────────────────────────────────────────────── */

/** De que fórmula veio o valor de uma célula, e até onde ela derrama. */
export interface Derramamento {
  linha: number;
  coluna: number;
  /** O tamanho do resultado — o que ocupa, ou ocuparia se o caminho estivesse livre. */
  linhas: number;
  colunas: number;
  /** O caminho está ocupado e a fórmula mostra #DESPEJAR!. */
  bloqueado: boolean;
}

/**
 * Uma conversa com a planilha: as células calculadas aqui ficam lembradas
 * enquanto ela durar.
 *
 * A grade pede o valor de cada célula, uma por uma, e sem sessão cada pedido
 * recalcularia do zero as fórmulas de matriz da aba inteira — para saber se
 * uma célula vazia recebe um derramamento, é preciso calcular as fórmulas
 * acima e à esquerda dela. A sessão vale para **um** estado da planilha:
 * mudou uma célula, é outra sessão.
 */
export interface Sessao {
  valor: (linha: number, coluna: number, aba?: string) => Valor;
  /** O derramamento que começa nesta célula ou que passa por ela, se houver. */
  derramamento: (linha: number, coluna: number, aba?: string) => Derramamento | null;
}

export function criarSessao(
  bruto: Bruto,
  opcoes: { aba?: string; escondida?: (linha: number, aba?: string) => boolean; planta?: Planta } = {},
): Sessao {
  const ctx = novoCtx(bruto, opcoes);
  const info = (d: Derrame): Derramamento => ({
    linha: d.linha, coluna: d.coluna, linhas: d.m.linhas, colunas: d.m.colunas, bloqueado: d.bloqueio !== null,
  });
  return {
    valor: (linha, coluna, aba) => celula(ctx, linha, coluna, aba),
    derramamento: (linha, coluna, aba) => {
      const alvo = aba ?? ctx.aba;
      const escrito = ctx.bruto(linha, coluna, alvo) ?? '';
      if (ehFormula(escrito)) {
        celula(ctx, linha, coluna, alvo);
        const d = ctx.derrames.get(chave(linha, coluna, alvo));
        return d && typeof d !== 'string' ? info(d) : null;
      }
      if (escrito !== '') return null;
      for (const [al, ac] of ancorasDe(ctx, alvo)) {
        if (al > linha || ac > coluna) continue;
        const d = derrame(ctx, al, ac, alvo);
        if (typeof d === 'string' || d.bloqueio) continue;
        if (dentro(al, ac, d.m, linha, coluna)) return info(d);
      }
      return null;
    },
  };
}

/** O valor da célula, calculando a fórmula que houver nela. */
export function valorDaCelula(
  bruto: Bruto, linha: number, coluna: number, aba?: string,
  escondida?: (linha: number, aba?: string) => boolean,
  planta?: Planta,
): Valor {
  /*
    `aba` é o nome da aba desta célula, e quem o tem é a pasta de trabalho.
    Laboratório de uma planilha só não passa nada, e aí referência sem nome
    continua caindo na única aba que existe — que é o que o acessador já faz.
  */
  return celula(novoCtx(bruto, { aba, escondida, planta }), linha, coluna);
}

/**
 * O valor de uma fórmula solta, sem célula de origem — serve aos exemplos da
 * teoria. Matriz devolve o primeiro elemento, que é o que a célula dela
 * mostraria; `matrizDaFormula` devolve a tabela inteira.
 */
export function valorDaFormula(bruto: Bruto, formula: string): Valor {
  if (!ehFormula(formula)) return valorDoBruto(formula);
  const r = simplificar(avaliarTexto(novoCtx(bruto), formula.trimStart().slice(1)));
  return ehMatriz(r) ? derramado(r.vs[0]) : r;
}

/**
 * A tabela inteira que uma fórmula solta devolve, linha a linha, como ela
 * apareceria derramada — vazio vira 0. Um valor só vem como tabela de uma
 * célula.
 */
export function matrizDaFormula(bruto: Bruto, formula: string): Valor[][] {
  if (!ehFormula(formula)) return [[valorDoBruto(formula)]];
  const m = comoMatriz(simplificar(avaliarTexto(novoCtx(bruto), formula.trimStart().slice(1))));
  const vs = m.linhas * m.colunas > 1 ? m.vs.map(derramado) : m.vs;
  return Array.from({ length: m.linhas }, (_, i) => vs.slice(i * m.colunas, (i + 1) * m.colunas));
}

/* ── Mostrar ──────────────────────────────────────────────────────────────── */

const agrupar = (inteiro: string) => inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/*
  Duas casas no que não é inteiro.

  O formato Geral do Excel mostra o que couber na largura da coluna, e isso
  aqui daria uma planilha em que a mesma conta muda de cara quando alguém
  arrasta a borda de uma coluna. Duas casas é o que dinheiro pede — que é o
  assunto do orçamento do requisito 6 — e é o que a AP043 já mostrava.
*/
export function mostrarNumero(n: number): string {
  if (n === 0) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
}

/**
 * `data` é dd/mm/aaaa sobre o número de série. O número continua o mesmo — é
 * só o que a célula mostra que muda —, e é por isso que trocar o formato de
 * uma coluna de datas para Geral faz aparecer 46334, e não estraga nada.
 */
export type Formato = 'geral' | 'moeda' | 'inteiro' | 'porcentagem' | 'data';

export function mostrar(v: Valor, formato: Formato = 'geral'): string {
  if (v.tipo === 'erro') return TEXTO_DO_ERRO[v.e];
  if (v.tipo === 'vazio') return '';
  if (v.tipo === 'logico') return v.b ? 'VERDADEIRO' : 'FALSO';
  if (v.tipo === 'texto') return v.t;

  switch (formato) {
    case 'moeda': {
      const sinal = v.n < 0 ? '-' : '';
      const [inteiro, casas] = Math.abs(v.n).toFixed(2).split('.');
      return `${sinal}R$ ${agrupar(inteiro)},${casas}`;
    }
    case 'inteiro': return String(Math.round(v.n));
    case 'porcentagem': return `${mostrarNumero(v.n * 100)}%`;
    case 'geral': return mostrarNumero(v.n);
    /* Número negativo, ou além de 9999, não é data: o Excel enche de cerquilhas. */
    case 'data': return v.n < 0 || v.n > MAIOR_SERIE ? '########' : textoDaData(v.n);
  }
}

/* ── Transpor: o que a alça de preenchimento faz ──────────────────────────── */

/*
  A aba vai junto com a referência. Sem ela, copiar `=Respostas!E2` para a
  linha de baixo escrevia `=E3` — e a fórmula passava a ler a coluna E da aba
  em que está, com cara de cópia certa.
*/
const daAba = (aba?: string) => (aba ? `${aba}!` : '');

const textoDoToken = (t: Token): string => {
  switch (t.t) {
    case 'num': return String(t.v).replace('.', ',');
    case 'txt': return `"${t.v.replace(/"/g, '""')}"`;
    case 'ref': return daAba(t.v.aba) + nomeDaRef(t.v);
    case 'derr': return `${daAba(t.v.aba)}${nomeDaRef(t.v)}#`;
    /* Só a primeira ponta de `A:A` leva a aba, como só a primeira de `A1:B2` leva. */
    case 'col': return `${t.v.fixa ? '$' : ''}${nomeDaColuna(t.v.coluna)}`;
    case 'nome': return t.v.toUpperCase();
    case 'op': return t.v;
    case 'abre': return '(';
    case 'fecha': return ')';
    case 'sep': return ';';
    case 'chave': return t.v;
    case 'barra': return '\\';
    case 'refErro': return '#REF!';
  }
};

/**
 * A fórmula depois de copiada para `dLinha` linhas abaixo e `dColuna` colunas
 * à direita.
 *
 * É aqui que o `$` significa alguma coisa: a referência sem cifrão anda junto
 * com a fórmula, a travada fica. Sem arrastar e ver isso acontecer, "absoluta"
 * e "relativa" são duas palavras que se decoram e se trocam na prova.
 *
 * Referência empurrada para fora da grade vira `#REF!` **dentro do texto da
 * fórmula**, que é o que a planilha de verdade escreve — e é por isso que o
 * analisador sabe lê-lo de volta.
 */
export function transporFormula(formula: string, dLinha: number, dColuna: number): string {
  if (!ehFormula(formula)) return formula;
  const corpo = formula.trimStart().slice(1);

  let ts: Token[];
  try {
    ts = tokens(corpo);
  } catch {
    return formula;
  }

  const movidos = ts.map((t): Token => {
    if (t.t === 'col') {
      const coluna = t.v.fixa ? t.v.coluna : t.v.coluna + dColuna;
      if (coluna < 0) return { t: 'refErro' };
      return { t: 'col', v: { ...t.v, coluna } };
    }
    if (t.t !== 'ref' && t.t !== 'derr') return t;
    const linha = t.v.linhaFixa ? t.v.linha : t.v.linha + dLinha;
    const coluna = t.v.colunaFixa ? t.v.coluna : t.v.coluna + dColuna;
    if (linha < 0 || coluna < 0) return { t: 'refErro' };
    return { t: t.t, v: { ...t.v, linha, coluna } };
  });

  /* A coluna da segunda ponta de `Aba!A:B` não leva a aba de novo. */
  const segundaPonta = (i: number) => i >= 2 && movidos[i - 1].t === 'op' && movidos[i - 2].t === 'col';
  return `=${movidos.map((t, i) => (t.t === 'col' && !segundaPonta(i)
    ? daAba(t.v.aba) + textoDoToken(t)
    : textoDoToken(t))).join('')}`;
}

/** As referências citadas na fórmula — as soltas e as pontas de cada faixa. */
export function referenciasDe(formula: string): Ref[] {
  if (!ehFormula(formula)) return [];
  try {
    return tokens(formula.trimStart().slice(1))
      .filter((t): t is { t: 'ref' | 'derr'; v: Ref } => t.t === 'ref' || t.t === 'derr')
      .map(t => t.v);
  } catch {
    return [];
  }
}
