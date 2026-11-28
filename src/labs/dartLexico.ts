/**
 * O léxico do Dart da plataforma.
 *
 * Lê o texto e devolve as peças — palavras, números, textos, sinais —, cada
 * uma com o ponto do arquivo em que começa e em que termina. É desse ponto
 * que sai a linha e a coluna das mensagens de erro, e elas precisam bater
 * com as do `dart` de verdade: a pessoa lê "clube.dart:7:15" e vai à linha 7.
 *
 * O texto com interpolação (`'Olá, $nome'`) não vira uma peça só: vira as
 * partes fixas e, entre elas, as peças da expressão de dentro, já lidas. O
 * leitor de sintaxe as trata como uma expressão qualquer, e o erro de dentro
 * de um `${...}` aponta para a coluna certa.
 */

export type TipoDePeca = 'id' | 'chave' | 'int' | 'double' | 'texto' | 'sinal' | 'fim';

export interface Peca {
  t: TipoDePeca;
  /** O texto da peça como foi escrito; no texto com interpolação, vazio. */
  v: string;
  ini: number;
  fim: number;
  /** Só no texto: as partes fixas e as expressões de dentro. */
  partes?: (string | Peca[])[];
}

const CHAVES = new Set([
  'abstract', 'as', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default',
  'do', 'dynamic', 'else', 'enum', 'extends', 'false', 'final', 'finally', 'for', 'get', 'if',
  'implements', 'import', 'in', 'is', 'late', 'new', 'null', 'on', 'operator', 'required',
  'rethrow', 'return', 'set', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'var',
  'void', 'while', 'with', 'mixin', 'extension', 'factory', 'covariant', 'external', 'typedef',
  'library', 'part', 'export', 'show', 'hide', 'deferred', 'async', 'await', 'yield', 'sealed',
  'base', 'interface', 'when',
]);

/*
  As palavras que só são reservadas em certos lugares. `get`, `set`,
  `required`, `on`, `show` podem ser nome de variável no Dart, e uma variável
  chamada `on` é o tipo de coisa que alguém escreve sem saber.
*/
const CONTEXTUAIS = new Set([
  'abstract', 'as', 'dynamic', 'get', 'set', 'required', 'on', 'show', 'hide', 'deferred', 'async',
  'await', 'yield', 'late', 'factory', 'covariant', 'external', 'typedef', 'library', 'part',
  'export', 'implements', 'import', 'mixin', 'extension', 'operator', 'static', 'sealed', 'base',
  'interface', 'when',
]);

export const ehChaveReservada = (p: string) => CHAVES.has(p) && !CONTEXTUAIS.has(p);

/* Do mais longo para o mais curto: `~/=` antes de `~/`, `??=` antes de `??`. */
const SINAIS = [
  '>>>=', '...?', '~/=', '>>=', '<<=', '??=', '...', '?..',
  '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '~/', '=>', '<<', '?.', '??', '..',
  '+', '-', '*', '/', '%', '<', '>', '=', '!', '?', ':', ';', ',', '.', '(', ')', '[', ']', '{', '}',
  '@', '&', '|', '^', '~', '#',
];

export class ErroDeLeitura extends Error {
  constructor(public ini: number, public fim: number, mensagem: string) { super(mensagem); }
}

export function lerPecas(fonte: string): Peca[] {
  const pecas: Peca[] = [];
  let i = 0;
  const n = fonte.length;

  const pularBranco = () => {
    for (;;) {
      while (i < n && /\s/.test(fonte[i])) i++;
      if (fonte.startsWith('//', i)) {
        while (i < n && fonte[i] !== '\n') i++;
        continue;
      }
      if (fonte.startsWith('/*', i)) {
        /* O comentário de bloco do Dart se aninha, ao contrário do de C. */
        const ini = i;
        let nivel = 0;
        while (i < n) {
          if (fonte.startsWith('/*', i)) { nivel++; i += 2; continue; }
          if (fonte.startsWith('*/', i)) { nivel--; i += 2; if (nivel === 0) break; continue; }
          i++;
        }
        if (nivel > 0) throw new ErroDeLeitura(ini, ini + 2, 'Comment starting with \'/*\' must end with \'*/\'.');
        continue;
      }
      break;
    }
  };

  while (true) {
    pularBranco();
    if (i >= n) break;
    const c = fonte[i];
    const ini = i;

    if (c === 'r' && (fonte[i + 1] === '\'' || fonte[i + 1] === '"')) {
      i++;
      pecas.push(lerTexto(true, ini));
      continue;
    }
    if (c === '\'' || c === '"') {
      pecas.push(lerTexto(false, ini));
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(fonte[i + 1] ?? ''))) {
      if (c === '0' && (fonte[i + 1] === 'x' || fonte[i + 1] === 'X')) {
        i += 2;
        while (i < n && /[0-9a-fA-F_]/.test(fonte[i])) i++;
        pecas.push({ t: 'int', v: fonte.slice(ini, i), ini, fim: i });
        continue;
      }
      let ehDouble = false;
      while (i < n && /[0-9_]/.test(fonte[i])) i++;
      if (fonte[i] === '.' && /[0-9]/.test(fonte[i + 1] ?? '')) {
        ehDouble = true;
        i++;
        while (i < n && /[0-9_]/.test(fonte[i])) i++;
      }
      if ((fonte[i] === 'e' || fonte[i] === 'E') && /[0-9+-]/.test(fonte[i + 1] ?? '')) {
        ehDouble = true;
        i++;
        if (fonte[i] === '+' || fonte[i] === '-') i++;
        while (i < n && /[0-9]/.test(fonte[i])) i++;
      }
      pecas.push({ t: ehDouble ? 'double' : 'int', v: fonte.slice(ini, i), ini, fim: i });
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      while (i < n && /[A-Za-z0-9_$]/.test(fonte[i])) i++;
      const v = fonte.slice(ini, i);
      pecas.push({ t: CHAVES.has(v) ? 'chave' : 'id', v, ini, fim: i });
      continue;
    }
    const sinal = SINAIS.find(s => fonte.startsWith(s, i));
    if (!sinal) throw new ErroDeLeitura(i, i + 1, `The character '${c}' is not valid.`);
    i += sinal.length;
    pecas.push({ t: 'sinal', v: sinal, ini, fim: i });
  }
  pecas.push({ t: 'fim', v: '', ini: n, fim: n });
  return pecas;

  /*
    O texto. `bruto` é o r'...' — sem escape e sem interpolação, o jeito do
    Dart de escrever um caminho do Windows sem dobrar as barras.
  */
  function lerTexto(bruto: boolean, ini: number): Peca {
    const aspa = fonte[i];
    const triplo = fonte.startsWith(aspa.repeat(3), i);
    const fecho = triplo ? aspa.repeat(3) : aspa;
    i += fecho.length;
    const partes: (string | Peca[])[] = [];
    let atual = '';
    while (true) {
      if (i >= n || (!triplo && fonte[i] === '\n')) {
        throw new ErroDeLeitura(ini, ini + 1, 'String starting with ' + fecho + ' must end with ' + fecho + '.');
      }
      if (fonte.startsWith(fecho, i)) { i += fecho.length; break; }
      const ch = fonte[i];
      if (!bruto && ch === '\\') {
        const e = fonte[i + 1];
        i += 2;
        if (e === 'n') atual += '\n';
        else if (e === 't') atual += '\t';
        else if (e === 'r') atual += '\r';
        else if (e === 'b') atual += '\b';
        else if (e === 'f') atual += '\f';
        else if (e === 'v') atual += '\v';
        else if (e === 'u') {
          if (fonte[i] === '{') {
            const f = fonte.indexOf('}', i);
            atual += String.fromCodePoint(parseInt(fonte.slice(i + 1, f), 16));
            i = f + 1;
          } else {
            atual += String.fromCharCode(parseInt(fonte.slice(i, i + 4), 16));
            i += 4;
          }
        } else if (e === 'x') {
          atual += String.fromCharCode(parseInt(fonte.slice(i, i + 2), 16));
          i += 2;
        } else if (e === '\n') { /* nada: a barra no fim da linha some */ } else atual += e;
        continue;
      }
      if (!bruto && ch === '$') {
        if (fonte[i + 1] === '{') {
          if (atual || !partes.length) partes.push(atual);
          atual = '';
          const abre = i + 1;
          i += 2;
          /* Lê a expressão de dentro com o próprio léxico, até a chave que
             fecha — contando as que se abrem no meio, que um mapa literal
             dentro da interpolação abriria. */
          const dentro: Peca[] = [];
          let nivel = 0;
          while (true) {
            pularBranco();
            if (i >= n) throw new ErroDeLeitura(abre, abre + 1, 'Can\'t find \'}\' to match \'${\'.');
            if (fonte[i] === '}' && nivel === 0) { i++; break; }
            const antes = pecas.length;
            const pedaco = lerUmaPeca();
            if (pedaco.t === 'sinal' && pedaco.v === '{') nivel++;
            if (pedaco.t === 'sinal' && pedaco.v === '}') nivel--;
            dentro.push(pedaco);
            pecas.length = antes;
          }
          dentro.push({ t: 'fim', v: '', ini: i - 1, fim: i - 1 });
          partes.push(dentro);
          continue;
        }
        if (/[A-Za-z_]/.test(fonte[i + 1] ?? '')) {
          if (atual || !partes.length) partes.push(atual);
          atual = '';
          const s = i + 1;
          i++;
          while (i < n && /[A-Za-z0-9_]/.test(fonte[i])) i++;
          const v = fonte.slice(s, i);
          partes.push([
            { t: CHAVES.has(v) ? 'chave' : 'id', v, ini: s, fim: i },
            { t: 'fim', v: '', ini: i, fim: i },
          ]);
          continue;
        }
        throw new ErroDeLeitura(i, i + 1, 'A \'$\' has special meaning inside a string, and must be followed by an identifier or an expression in curly braces ({}).');
      }
      atual += ch;
      i++;
    }
    partes.push(atual);
    const soTexto = partes.every(p => typeof p === 'string');
    return {
      t: 'texto',
      v: soTexto ? (partes as string[]).join('') : '',
      ini,
      fim: i,
      partes: soTexto ? undefined : partes,
    };
  }

  /* Uma peça só, para a expressão de dentro de `${...}`. */
  function lerUmaPeca(): Peca {
    const c = fonte[i];
    const ini = i;
    if (c === '\'' || c === '"') return lerTexto(false, ini);
    if (/[0-9]/.test(c)) {
      while (i < n && /[0-9]/.test(fonte[i])) i++;
      let ehDouble = false;
      if (fonte[i] === '.' && /[0-9]/.test(fonte[i + 1] ?? '')) {
        ehDouble = true;
        i++;
        while (i < n && /[0-9]/.test(fonte[i])) i++;
      }
      return { t: ehDouble ? 'double' : 'int', v: fonte.slice(ini, i), ini, fim: i };
    }
    if (/[A-Za-z_$]/.test(c)) {
      while (i < n && /[A-Za-z0-9_$]/.test(fonte[i])) i++;
      const v = fonte.slice(ini, i);
      return { t: CHAVES.has(v) ? 'chave' : 'id', v, ini, fim: i };
    }
    const sinal = SINAIS.find(s => fonte.startsWith(s, i));
    if (!sinal) throw new ErroDeLeitura(i, i + 1, `The character '${c}' is not valid.`);
    i += sinal.length;
    return { t: 'sinal', v: sinal, ini, fim: i };
  }
}

/** A linha e a coluna (as duas começando em 1) de um ponto do arquivo. */
export function linhaEColuna(fonte: string, pos: number): { linha: number; coluna: number } {
  let linha = 1;
  let inicio = 0;
  for (let k = 0; k < pos && k < fonte.length; k++) {
    if (fonte[k] === '\n') { linha++; inicio = k + 1; }
  }
  return { linha, coluna: pos - inicio + 1 };
}
