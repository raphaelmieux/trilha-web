/**
 * Os tipos do Dart da plataforma, para o analisador.
 *
 * O analisador existe por causa do requisito 4.5: no Dart, `String nome =
 * apelido;` com `apelido` anulável não roda — o compilador recusa antes. Uma
 * simulação que deixasse rodar e estourasse depois ensinaria o nulo seguro do
 * JavaScript, que é o contrário do que a vereda mostra.
 *
 * A regra do analisador é **errar só quando sabe**: um tipo que ele não
 * conhece vira `dynamic`, e `dynamic` não gera erro nenhum. Recusar um
 * programa certo é pior do que deixar passar um errado — o errado ainda
 * estoura ao rodar, e o certo recusado não tem conserto que a pessoa consiga
 * achar.
 */

export type Tipo =
  | { k: 'dyn' }
  | { k: 'void' }
  | { k: 'nulo' }
  | { k: 'nunca' }
  | { k: 'cls'; nome: string; args: Tipo[]; q: boolean }
  | { k: 'fn'; ret: Tipo; params: Tipo[]; q: boolean };

export const DYN: Tipo = { k: 'dyn' };
export const VOID: Tipo = { k: 'void' };
export const NULO: Tipo = { k: 'nulo' };
export const NUNCA: Tipo = { k: 'nunca' };
export const cls = (nome: string, args: Tipo[] = [], q = false): Tipo => ({ k: 'cls', nome, args, q });
export const INT = cls('int');
export const DOUBLE = cls('double');
export const NUM = cls('num');
export const STRING = cls('String');
export const BOOL = cls('bool');
export const OBJECT = cls('Object');
export const lista = (e: Tipo) => cls('List', [e]);
export const mapa = (k: Tipo, v: Tipo) => cls('Map', [k, v]);
export const conjunto = (e: Tipo) => cls('Set', [e]);
export const iteravel = (e: Tipo) => cls('Iterable', [e]);

export function anulavel(t: Tipo): Tipo {
  if (t.k === 'cls' || t.k === 'fn') return t.q ? t : { ...t, q: true };
  if (t.k === 'nunca') return NULO;
  return t;
}

export function semNulo(t: Tipo): Tipo {
  if (t.k === 'cls' || t.k === 'fn') return t.q ? { ...t, q: false } : t;
  if (t.k === 'nulo') return NUNCA;
  return t;
}

/** Pode ser nulo? `dynamic` pode, mas não gera erro — quem pergunta decide. */
export const ehAnulavel = (t: Tipo) => t.k === 'nulo' || ((t.k === 'cls' || t.k === 'fn') && t.q);

/** O tipo escrito como o `dart` o escreve nas mensagens. */
export function nomeDoTipo(t: Tipo): string {
  switch (t.k) {
    case 'dyn': return 'dynamic';
    case 'void': return 'void';
    case 'nulo': return 'Null';
    case 'nunca': return 'Never';
    case 'fn': {
      const s = `${nomeDoTipo(t.ret)} Function(${t.params.map(nomeDoTipo).join(', ')})`;
      return t.q ? `${s}?` : s;
    }
    case 'cls': {
      const s = t.args.length ? `${t.nome}<${t.args.map(nomeDoTipo).join(', ')}>` : t.nome;
      return t.q ? `${s}?` : s;
    }
  }
}

export function mesmoTipo(a: Tipo, b: Tipo): boolean {
  if (a.k !== b.k) return false;
  if (a.k === 'cls' && b.k === 'cls') {
    return a.nome === b.nome && a.q === b.q && a.args.length === b.args.length && a.args.every((x, i) => mesmoTipo(x, b.args[i]));
  }
  if (a.k === 'fn' && b.k === 'fn') {
    return a.q === b.q && mesmoTipo(a.ret, b.ret) && a.params.length === b.params.length && a.params.every((x, i) => mesmoTipo(x, b.params[i]));
  }
  return true;
}

/**
 * Quem é mãe de quem, para as classes da linguagem e as do programa. As do
 * programa entram por `registrarMae`, a cada análise.
 */
const MAES_DO_NUCLEO: Record<string, (args: Tipo[]) => Tipo | null> = {
  Object: () => null,
  num: () => OBJECT,
  int: () => NUM,
  double: () => NUM,
  String: () => OBJECT,
  bool: () => OBJECT,
  Null: () => OBJECT,
  Iterable: () => OBJECT,
  List: a => iteravel(a[0] ?? DYN),
  Set: a => iteravel(a[0] ?? DYN),
  Map: () => OBJECT,
  MapEntry: () => OBJECT,
  Function: () => OBJECT,
  Type: () => OBJECT,
  Enum: () => OBJECT,
  Exception: () => OBJECT,
  FormatException: () => cls('Exception'),
  Error: () => OBJECT,
  StateError: () => cls('Error'),
  RangeError: () => cls('ArgumentError'),
  ArgumentError: () => cls('Error'),
  UnsupportedError: () => cls('Error'),
  TypeError: () => cls('Error'),
  Comparable: () => OBJECT,
  Stdin: () => OBJECT,
  Stdout: () => OBJECT,
  StackTrace: () => OBJECT,
  Pattern: () => OBJECT,
};

export const NOMES_DO_NUCLEO = new Set(Object.keys(MAES_DO_NUCLEO));

export interface Hierarquia {
  /** A mãe de uma classe do programa, ou de um enum (`Enum`). */
  maeDe(nome: string): string | null;
  existe(nome: string): boolean;
}

function mae(t: Extract<Tipo, { k: 'cls' }>, h: Hierarquia): Tipo | null {
  const doNucleo = MAES_DO_NUCLEO[t.nome];
  if (doNucleo) return doNucleo(t.args);
  const m = h.maeDe(t.nome);
  return m ? cls(m) : OBJECT;
}

/** As mães de um tipo, dele mesmo até `Object`. */
export function ancestrais(t: Extract<Tipo, { k: 'cls' }>, h: Hierarquia): Extract<Tipo, { k: 'cls' }>[] {
  const r: Extract<Tipo, { k: 'cls' }>[] = [];
  let atual: Tipo | null = { ...t, q: false };
  let guarda = 0;
  while (atual && atual.k === 'cls' && guarda++ < 50) {
    r.push(atual);
    atual = mae(atual, h);
  }
  return r;
}

/** `a` é subtipo de `b`? */
export function subtipo(a: Tipo, b: Tipo, h: Hierarquia): boolean {
  if (b.k === 'dyn' || b.k === 'void') return true;
  if (a.k === 'nunca') return true;
  if (a.k === 'dyn') return b.k === 'cls' && b.nome === 'Object' && b.q;
  if (a.k === 'void') return false;
  if (b.k === 'cls' && b.nome === 'Object' && b.q) return true;
  if (a.k === 'nulo') return ehAnulavel(b) || (b.k === 'cls' && b.nome === 'Null');
  if (b.k === 'nulo' || b.k === 'nunca') return false;
  if (ehAnulavel(a) && !ehAnulavel(b)) return false;
  if (a.k === 'fn') {
    if (b.k === 'cls') return b.nome === 'Function' || b.nome === 'Object';
    return mesmoTipo({ ...a, q: false }, { ...b, q: false }) || (b.k === 'fn' && b.params.length === a.params.length && subtipo(a.ret, b.ret, h));
  }
  if (b.k === 'fn') return false;
  if (a.k !== 'cls' || b.k !== 'cls') return false;
  for (const x of ancestrais(a, h)) {
    if (x.nome === b.nome) {
      if (!b.args.length || !x.args.length) return true;
      return x.args.length === b.args.length && x.args.every((y, i) => subtipo(y, b.args[i], h));
    }
  }
  return false;
}

/** Pode ser atribuído? É o subtipo, mais o `dynamic`, que se aceita calado. */
export function atribuivel(a: Tipo, b: Tipo, h: Hierarquia): boolean {
  if (a.k === 'dyn') return true;
  return subtipo(a, b, h);
}

/**
 * O menor tipo que cabe os dois — o tipo de `cond ? a : b` e de uma lista
 * com `[1, 2.5]`. A conta do Dart é mais fina; esta acerta os casos que a
 * vereda usa e, no resto, sobe para `Object`, que é o que a do Dart também
 * faz quando não acha nada em comum.
 */
export function menorComum(a: Tipo, b: Tipo, h: Hierarquia): Tipo {
  if (a.k === 'nunca') return b;
  if (b.k === 'nunca') return a;
  if (a.k === 'dyn' || b.k === 'dyn') return DYN;
  if (a.k === 'void' || b.k === 'void') return VOID;
  if (a.k === 'nulo') return anulavel(b);
  if (b.k === 'nulo') return anulavel(a);
  const q = ehAnulavel(a) || ehAnulavel(b);
  const sa = semNulo(a);
  const sb = semNulo(b);
  if (subtipo(sa, sb, h)) return q ? anulavel(sb) : sb;
  if (subtipo(sb, sa, h)) return q ? anulavel(sa) : sa;
  if (sa.k === 'cls' && sb.k === 'cls') {
    const deB = ancestrais(sb, h);
    for (const x of ancestrais(sa, h)) {
      if (x.nome === 'Object') break;
      const y = deB.find(z => z.nome === x.nome);
      if (y) {
        const args = x.args.map((arg, i) => (y.args[i] ? menorComum(arg, y.args[i], h) : arg));
        return cls(x.nome, args, q);
      }
    }
  }
  return cls('Object', [], q);
}

export const ehNumerico = (t: Tipo) => t.k === 'cls' && !t.q && (t.nome === 'int' || t.nome === 'double' || t.nome === 'num');

/** O tipo dos elementos de um iterável, ou `dynamic` quando não se sabe. */
export function elementoDe(t: Tipo, h: Hierarquia): Tipo {
  if (t.k !== 'cls') return DYN;
  const it = ancestrais(t, h).find(x => x.nome === 'Iterable');
  return it?.args[0] ?? DYN;
}

/*
  Os nomes que cada tipo do núcleo tem de verdade. Servem para separar o
  erro de digitação — `lista.lenght`, que o `dart` recusa — do método que
  existe e o simulador não implementou, que ele recusa dizendo isso. Sem esta
  lista, as duas coisas sairiam com a mesma mensagem, e uma delas mentiria.
*/
const DE_OBJECT = ['toString', 'hashCode', 'runtimeType', 'noSuchMethod'];
const DE_ITERABLE = [
  'iterator', 'cast', 'followedBy', 'map', 'where', 'whereType', 'expand', 'contains', 'forEach', 'reduce',
  'fold', 'every', 'join', 'any', 'toList', 'toSet', 'length', 'isEmpty', 'isNotEmpty', 'take', 'takeWhile',
  'skip', 'skipWhile', 'first', 'last', 'single', 'firstWhere', 'lastWhere', 'singleWhere', 'elementAt',
  'firstOrNull', 'lastOrNull', 'singleOrNull', 'elementAtOrNull', 'indexed', 'nonNulls',
];
export const MEMBROS_REAIS: Record<string, string[]> = {
  Object: DE_OBJECT,
  int: [...DE_OBJECT, 'isEven', 'isOdd', 'bitLength', 'toUnsigned', 'toSigned', 'abs', 'sign', 'round', 'floor',
    'ceil', 'truncate', 'roundToDouble', 'floorToDouble', 'ceilToDouble', 'truncateToDouble', 'toString',
    'toRadixString', 'gcd', 'modPow', 'modInverse', 'isNaN', 'isNegative', 'isInfinite', 'isFinite', 'remainder',
    'compareTo', 'clamp', 'toInt', 'toDouble', 'toStringAsFixed', 'toStringAsExponential', 'toStringAsPrecision'],
  double: [...DE_OBJECT, 'remainder', 'abs', 'sign', 'round', 'floor', 'ceil', 'truncate', 'roundToDouble',
    'floorToDouble', 'ceilToDouble', 'truncateToDouble', 'isNaN', 'isNegative', 'isInfinite', 'isFinite',
    'compareTo', 'clamp', 'toInt', 'toDouble', 'toStringAsFixed', 'toStringAsExponential', 'toStringAsPrecision'],
  num: [...DE_OBJECT, 'remainder', 'abs', 'sign', 'round', 'floor', 'ceil', 'truncate', 'roundToDouble',
    'floorToDouble', 'ceilToDouble', 'truncateToDouble', 'isNaN', 'isNegative', 'isInfinite', 'isFinite',
    'compareTo', 'clamp', 'toInt', 'toDouble', 'toStringAsFixed', 'toStringAsExponential', 'toStringAsPrecision'],
  String: [...DE_OBJECT, 'codeUnitAt', 'length', 'endsWith', 'startsWith', 'indexOf', 'lastIndexOf', 'isEmpty',
    'isNotEmpty', 'substring', 'trim', 'trimLeft', 'trimRight', 'padLeft', 'padRight', 'contains', 'replaceFirst',
    'replaceFirstMapped', 'replaceAll', 'replaceAllMapped', 'replaceRange', 'split', 'splitMapJoin', 'codeUnits',
    'runes', 'toLowerCase', 'toUpperCase', 'compareTo', 'allMatches', 'matchAsPrefix'],
  bool: [...DE_OBJECT],
  Iterable: [...DE_OBJECT, ...DE_ITERABLE],
  List: [...DE_OBJECT, ...DE_ITERABLE, 'add', 'addAll', 'reversed', 'sort', 'shuffle', 'indexOf', 'indexWhere',
    'lastIndexWhere', 'lastIndexOf', 'clear', 'insert', 'insertAll', 'setAll', 'remove', 'removeAt', 'removeLast',
    'removeWhere', 'retainWhere', 'sublist', 'getRange', 'setRange', 'removeRange', 'fillRange', 'replaceRange',
    'asMap', 'first', 'last'],
  Set: [...DE_OBJECT, ...DE_ITERABLE, 'add', 'addAll', 'remove', 'lookup', 'removeAll', 'retainAll', 'removeWhere',
    'retainWhere', 'containsAll', 'intersection', 'union', 'difference', 'clear', 'toSet'],
  Map: [...DE_OBJECT, 'cast', 'containsValue', 'containsKey', 'entries', 'map', 'addEntries', 'update', 'updateAll',
    'removeWhere', 'putIfAbsent', 'addAll', 'remove', 'clear', 'forEach', 'keys', 'values', 'length', 'isEmpty',
    'isNotEmpty'],
  MapEntry: [...DE_OBJECT, 'key', 'value'],
};
