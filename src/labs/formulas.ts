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
 * ── O que ele não sabe ─────────────────────────────────────────────────────
 * Não há data, não há hora, não há matriz e não há curinga (`*`, `?`) em
 * critério. É deliberado: cada um deles é assunto de outra vereda, e função
 * que existe pela metade ensina errado com mais eficiência do que função que
 * não existe.
 */

/* ── Valores e erros ──────────────────────────────────────────────────────── */

/*
  Os nomes dos erros são os do Excel em português, porque é o que o
  desbravador vai ver na tela do clube. `circular` é a exceção, e está
  explicada onde ela é produzida.
*/
export type Erro = 'nome' | 'valor' | 'div0' | 'ref' | 'nd' | 'num' | 'circular';

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

/* ── Referências ──────────────────────────────────────────────────────────── */

export interface Ref {
  linha: number;
  coluna: number;
  /** O `$` antes do número: a linha não anda quando a fórmula é copiada. */
  linhaFixa: boolean;
  /** O `$` antes da letra: a coluna não anda quando a fórmula é copiada. */
  colunaFixa: boolean;
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

export const ref = (linha: number, coluna: number, linhaFixa = false, colunaFixa = false): Ref =>
  ({ linha, coluna, linhaFixa, colunaFixa });

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

  if (/^verdadeiro$/i.test(t)) return logico(true);
  if (/^falso$/i.test(t)) return logico(false);
  return txt(bruto);
}

/* ── O analisador ─────────────────────────────────────────────────────────── */

type Token =
  | { t: 'num'; v: number }
  | { t: 'txt'; v: string }
  | { t: 'ref'; v: Ref }
  | { t: 'nome'; v: string }
  | { t: 'op'; v: string }
  | { t: 'abre' }
  | { t: 'fecha' }
  | { t: 'sep' }
  | { t: 'refErro' };

class ErroDeSintaxe extends Error {}

const REF = /^(\$?)([A-Za-z]{1,2})(\$?)(\d{1,7})(?![A-Za-z0-9._])/;
const NOME = /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9._]*/;
const LITERAL = /^(\d+(,\d+)?|,\d+)/;
const OPERADORES = ['<>', '<=', '>=', '=', '<', '>', '+', '-', '*', '/', '^', '&', ':'];

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

    const resto = formula.slice(i);

    /*
      `#REF!` é o que a própria planilha escreve dentro da fórmula quando a
      cópia joga a referência para fora da grade. Ele é lido de volta como
      erro — senão a fórmula copiada viraria `#NOME?`, que manda procurar um
      nome de função errado que não existe.
    */
    if (resto.startsWith('#REF!')) { saida.push({ t: 'refErro' }); i += 5; continue; }

    const mRef = REF.exec(resto);
    if (mRef) {
      const [todo, cifraCol, letras, cifraLin, digitos] = mRef;
      saida.push({ t: 'ref', v: ref(Number(digitos) - 1, colunaDoNome(letras), cifraLin === '$', cifraCol === '$') });
      i += todo.length;
      continue;
    }

    const mNome = NOME.exec(resto);
    if (mNome) { saida.push({ t: 'nome', v: mNome[0] }); i += mNome[0].length; continue; }

    const mLit = LITERAL.exec(resto);
    if (mLit) { saida.push({ t: 'num', v: Number(mLit[0].replace(',', '.')) }); i += mLit[0].length; continue; }

    const op = OPERADORES.find(o => resto.startsWith(o));
    if (op) { saida.push({ t: 'op', v: op }); i += op.length; continue; }

    throw new ErroDeSintaxe(`não entendi ${ch}`);
  }
  return saida;
}

type No =
  | { k: 'num'; v: number }
  | { k: 'txt'; v: string }
  | { k: 'ref'; r: Ref }
  | { k: 'faixa'; a: Ref; b: Ref }
  | { k: 'erro'; e: Erro }
  | { k: 'chamada'; nome: string; args: No[] }
  | { k: 'bin'; op: string; a: No; b: No }
  | { k: 'neg'; a: No };

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
      if (ehOp(':')) {
        p++;
        const b = ts[p++];
        if (!b || b.t !== 'ref') throw new ErroDeSintaxe('faixa sem fim');
        return { k: 'faixa', a: t.v, b: b.v };
      }
      return { k: 'ref', r: t.v };
    }

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
        args.push(comparacao());
        if (!fim() && ts[p].t === 'sep') { p++; continue; }
        break;
      }
      if (fim() || ts[p].t !== 'fecha') throw new ErroDeSintaxe('chamada sem fim');
      p++;
      return { k: 'chamada', nome: t.v, args };
    }

    throw new ErroDeSintaxe('não esperava isto aqui');
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
      const n = numeroDoTexto(v.t);
      return n === null ? erro('valor') : n;
    }
  }
}

function comoTexto(v: Valor): string {
  switch (v.tipo) {
    case 'texto': return v.t;
    case 'numero': return mostrarNumero(v.n);
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

/** O que está escrito na célula — string vazia fora da grade. */
export type Bruto = (linha: number, coluna: number) => string;

interface Ctx {
  bruto: Bruto;
  visitando: Set<string>;
  cache: Map<string, Valor>;
}

const chave = (l: number, c: number) => `${l}:${c}`;

function celula(ctx: Ctx, linha: number, coluna: number): Valor {
  const k = chave(linha, coluna);
  const guardado = ctx.cache.get(k);
  if (guardado) return guardado;

  /*
    A guarda de ciclo não é luxo: `=A1+1` escrito em A1 é um erro que qualquer
    um comete, e sem ela a aba do navegador trava numa recursão infinita —
    levando junto o trabalho da lição inteira.
  */
  if (ctx.visitando.has(k)) return erro('circular');

  const bruto = ctx.bruto(linha, coluna) ?? '';
  if (!ehFormula(bruto)) {
    const v = valorDoBruto(bruto);
    ctx.cache.set(k, v);
    return v;
  }

  ctx.visitando.add(k);
  let v: Valor;
  try {
    v = avaliarTexto(ctx, bruto.trimStart().slice(1));
  } finally {
    ctx.visitando.delete(k);
  }
  ctx.cache.set(k, v);
  return v;
}

function avaliarTexto(ctx: Ctx, corpo: string): Valor {
  if (corpo.trim() === '') return VAZIO;
  let arvore: No;
  try {
    arvore = analisar(tokens(corpo));
  } catch {
    return erro('nome');
  }
  return avaliar(ctx, arvore);
}

/** Os valores de uma faixa, célula a célula, na ordem de leitura. */
function daFaixa(ctx: Ctx, a: Ref, b: Ref): Valor[] {
  const saida: Valor[] = [];
  const l1 = Math.min(a.linha, b.linha);
  const l2 = Math.max(a.linha, b.linha);
  const c1 = Math.min(a.coluna, b.coluna);
  const c2 = Math.max(a.coluna, b.coluna);
  for (let l = l1; l <= l2; l++) for (let c = c1; c <= c2; c++) saida.push(celula(ctx, l, c));
  return saida;
}

function avaliar(ctx: Ctx, no: No): Valor {
  switch (no.k) {
    case 'num': return num(no.v);
    case 'txt':
      if (no.v === '\u0001V') return logico(true);
      if (no.v === '\u0001F') return logico(false);
      return txt(no.v);
    case 'erro': return erro(no.e);
    case 'ref': return celula(ctx, no.r.linha, no.r.coluna);
    /*
      Faixa usada onde se espera um valor — `=A1:A5+1` — é erro no Excel, e
      devolver a primeira célula calada faria a fórmula "funcionar" mostrando
      a conta de uma linha só.
    */
    case 'faixa': return erro('valor');
    case 'neg': {
      const a = comoNumero(avaliar(ctx, no.a));
      return typeof a === 'number' ? num(-a) : a;
    }
    case 'bin': return binaria(ctx, no);
    case 'chamada': return chamada(ctx, no.nome, no.args);
  }
}

function binaria(ctx: Ctx, no: { op: string; a: No; b: No }): Valor {
  const va = avaliar(ctx, no.a);
  const vb = avaliar(ctx, no.b);
  if (ehErro(va)) return va;
  if (ehErro(vb)) return vb;

  if (no.op === '&') return txt(comoTexto(va) + comoTexto(vb));

  if (['=', '<>', '<', '<=', '>', '>='].includes(no.op)) return comparar(no.op, va, vb);

  const a = comoNumero(va);
  if (typeof a !== 'number') return a;
  const b = comoNumero(vb);
  if (typeof b !== 'number') return b;

  switch (no.op) {
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
    if (arg.k === 'faixa' || arg.k === 'ref') {
      const valores = arg.k === 'faixa' ? daFaixa(ctx, arg.a, arg.b) : [celula(ctx, arg.r.linha, arg.r.coluna)];
      for (const v of valores) {
        if (ehErro(v)) return v;
        if (v.tipo === 'numero') saida.push(v.n);
        else if (v.tipo === 'logico' && arg.k === 'ref') saida.push(v.b ? 1 : 0);
      }
      continue;
    }
    const v = avaliar(ctx, arg);
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
    if (arg.k === 'faixa') {
      for (const v of daFaixa(ctx, arg.a, arg.b)) {
        if (ehErro(v)) return v;
        saida.push(v);
      }
      continue;
    }
    const v = avaliar(ctx, arg);
    if (ehErro(v)) return v;
    saida.push(v);
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
      As duas contagens, e a diferença entre elas é o que acha o número
      guardado como texto: CONT.NÚM conta o que a planilha entende como
      número, CONT.VALORES conta o que está preenchido. Doze linhas, `11` numa
      e `12` na outra, e o defeito tem endereço.
    */
    case 'CONTNUM': {
      const ns = numerosDosArgs(ctx, args.map(a => (a.k === 'ref' ? { k: 'faixa' as const, a: a.r, b: a.r } : a)));
      return Array.isArray(ns) ? num(ns.length) : ns;
    }
    case 'CONTVALORES': {
      const vs = valoresDosArgs(ctx, args);
      return Array.isArray(vs) ? num(vs.filter(v => v.tipo !== 'vazio').length) : vs;
    }

    case 'CONTSE': {
      if (args.length !== 2 || args[0].k !== 'faixa') return erro('valor');
      const criterio = avaliar(ctx, args[1]);
      if (ehErro(criterio)) return criterio;
      const vs = daFaixa(ctx, args[0].a, args[0].b);
      return num(vs.filter(v => !ehErro(v) && testarCriterio(criterio, v)).length);
    }

    case 'SOMASE': {
      if (args.length < 2 || args[0].k !== 'faixa') return erro('valor');
      const criterio = avaliar(ctx, args[1]);
      if (ehErro(criterio)) return criterio;
      const testadas = daFaixa(ctx, args[0].a, args[0].b);
      const somadas = args[2] && args[2].k === 'faixa' ? daFaixa(ctx, args[2].a, args[2].b) : testadas;
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

    case 'PROCV': return procv(ctx, args);

    /*
      Nome que a planilha não conhece é `#NOME?`, e não silêncio: é o erro que
      aparece quando se escreve SOMATORIO no lugar de SOMA, e ele tem de estar
      à vista para que a pessoa vá procurar a função certa.
    */
    default: return erro('nome');
  }
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

  const faixa = args[1];
  if (faixa.k !== 'faixa') return erro('valor');

  const indice = comoNumero(avaliar(ctx, args[2]));
  if (typeof indice !== 'number') return indice;

  const l1 = Math.min(faixa.a.linha, faixa.b.linha);
  const l2 = Math.max(faixa.a.linha, faixa.b.linha);
  const c1 = Math.min(faixa.a.coluna, faixa.b.coluna);
  const c2 = Math.max(faixa.a.coluna, faixa.b.coluna);

  const col = Math.trunc(indice);
  if (col < 1 || c1 + col - 1 > c2) return erro('ref');

  let aproximado = true;
  if (args[3]) {
    const q = comoCondicao(avaliar(ctx, args[3]));
    if (typeof q !== 'boolean') return q;
    aproximado = q;
  }

  let achou = -1;
  for (let l = l1; l <= l2; l++) {
    const v = celula(ctx, l, c1);
    if (ehErro(v)) return v;
    if (!aproximado) {
      const igual = comparar('=', v, alvo);
      if (igual.tipo === 'logico' && igual.b) { achou = l; break; }
    } else {
      const menorOuIgual = comparar('<=', v, alvo);
      if (menorOuIgual.tipo === 'logico' && menorOuIgual.b) achou = l;
      else break;
    }
  }

  if (achou < 0) return erro('nd');
  return celula(ctx, achou, c1 + col - 1);
}

/* ── A porta de entrada ───────────────────────────────────────────────────── */

/** O valor da célula, calculando a fórmula que houver nela. */
export function valorDaCelula(bruto: Bruto, linha: number, coluna: number): Valor {
  return celula({ bruto, visitando: new Set(), cache: new Map() }, linha, coluna);
}

/** O valor de uma fórmula solta, sem célula de origem — serve aos exemplos da teoria. */
export function valorDaFormula(bruto: Bruto, formula: string): Valor {
  const ctx: Ctx = { bruto, visitando: new Set(), cache: new Map() };
  return ehFormula(formula) ? avaliarTexto(ctx, formula.trimStart().slice(1)) : valorDoBruto(formula);
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

export type Formato = 'geral' | 'moeda' | 'inteiro' | 'porcentagem';

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
  }
}

/* ── Transpor: o que a alça de preenchimento faz ──────────────────────────── */

const textoDoToken = (t: Token): string => {
  switch (t.t) {
    case 'num': return String(t.v).replace('.', ',');
    case 'txt': return `"${t.v.replace(/"/g, '""')}"`;
    case 'ref': return nomeDaRef(t.v);
    case 'nome': return t.v.toUpperCase();
    case 'op': return t.v;
    case 'abre': return '(';
    case 'fecha': return ')';
    case 'sep': return ';';
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
    if (t.t !== 'ref') return t;
    const linha = t.v.linhaFixa ? t.v.linha : t.v.linha + dLinha;
    const coluna = t.v.colunaFixa ? t.v.coluna : t.v.coluna + dColuna;
    if (linha < 0 || coluna < 0) return { t: 'refErro' };
    return { t: 'ref', v: { ...t.v, linha, coluna } };
  });

  return `=${movidos.map(textoDoToken).join('')}`;
}

/** As referências citadas na fórmula — as soltas e as pontas de cada faixa. */
export function referenciasDe(formula: string): Ref[] {
  if (!ehFormula(formula)) return [];
  try {
    return tokens(formula.trimStart().slice(1))
      .filter((t): t is { t: 'ref'; v: Ref } => t.t === 'ref')
      .map(t => t.v);
  } catch {
    return [];
  }
}
