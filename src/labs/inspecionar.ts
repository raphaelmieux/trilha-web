/**
 * Como o `console.log` do Node escreve um valor.
 *
 * ── Por que imitar, e não usar o do navegador ────────────────────────────
 * O `console.log` do navegador não devolve texto nenhum: ele desenha uma
 * árvore clicável no painel do desenvolvedor. O do Node escreve uma linha —
 * `{ nome: 'Ana', idade: 12 }`, com aspas simples no texto e espaço dentro das
 * chaves —, e é essa linha que a pessoa vai ver no terminal do clube. Um
 * laboratório que escrevesse `{"nome":"Ana","idade":12}` estaria ensinando a
 * reconhecer uma saída que o programa dela nunca vai produzir.
 *
 * As regras são as de `util.inspect` com os padrões que o `console.log` usa:
 * profundidade 2, linha de 80 colunas, e as três camadas mais internas
 * juntas numa linha quando cabem. Os arranjos com mais de seis números se
 * arrumam em colunas, como lá. `exemplosDeJavascript.test.ts` roda cada
 * exemplo da teoria no Node de verdade e compara com o que sai daqui — é essa
 * trava que diz se a imitação continua fiel.
 *
 * ── O que fica de fora ───────────────────────────────────────────────────
 * Cor, e a promessa já resolvida: o Node consulta o estado interno dela, que
 * o JavaScript não alcança, e aqui toda promessa sai `<pending>`. É o caso
 * que importa — esquecer o `await` e imprimir a promessa é o engano que a
 * lição de assíncrono existe para mostrar, e nele ela está mesmo pendente.
 */

const LARGURA = 80;
const PROFUNDIDADE = 2;
const COMPACTO = 3;
const MAX_ITENS = 100;

/* Um valor que sabe se escrever: o Buffer da pasta simulada usa isto. */
export const COMO_SE_ESCREVE = Symbol('comoSeEscreve');

/* Os espaços de módulo, que o Node chama de `[Module: null prototype]`. */
const MODULOS = new WeakSet<object>();
export function marcarComoModulo(o: object) { MODULOS.add(o); }

interface Ctx {
  nivel: number;
  profundidadeAtual: number;
  vistos: unknown[];
  circulares: Map<unknown, number>;
}

const NOME_SIMPLES = /^[a-zA-Z_][a-zA-Z_0-9]*$/;

/** O texto entre aspas, como o Node escolhe: simples, senão duplas, senão crase. */
export function citar(s: string): string {
  let aspa = "'";
  if (s.includes("'")) {
    if (!s.includes('"')) aspa = '"';
    else if (!s.includes('`') && !s.includes('${')) aspa = '`';
  }
  let fora = '';
  for (const c of s) {
    if (c === aspa) fora += `\\${c}`;
    else if (c === '\\') fora += '\\\\';
    else if (c === '\n') fora += '\\n';
    else if (c === '\t') fora += '\\t';
    else if (c === '\r') fora += '\\r';
    else if (c === '\b') fora += '\\b';
    else if (c === '\f') fora += '\\f';
    else if (c === '\v') fora += '\\v';
    else if (c.charCodeAt(0) < 0x20 || c.charCodeAt(0) === 0x7f) {
      fora += `\\x${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`;
    } else fora += c;
  }
  return aspa + fora + aspa;
}

function numero(n: number): string {
  return Object.is(n, -0) ? '-0' : String(n);
}

type QualquerFuncao = ((...a: unknown[]) => unknown) & { name: string };

function nomeDaFuncao(f: QualquerFuncao): string {
  const fonte = Function.prototype.toString.call(f);
  const ehClasse = /^class\b/.test(fonte);
  if (ehClasse) {
    const pai = Object.getPrototypeOf(f);
    const extende = pai && pai !== Function.prototype && pai.name ? ` extends ${pai.name}` : '';
    return `[class ${f.name || '(anonymous)'}${extende}]`;
  }
  const tipo = f.constructor?.name === 'AsyncFunction' ? 'AsyncFunction'
    : f.constructor?.name === 'GeneratorFunction' ? 'GeneratorFunction'
      : f.constructor?.name === 'AsyncGeneratorFunction' ? 'AsyncGeneratorFunction'
        : 'Function';
  return f.name ? `[${tipo}: ${f.name}]` : `[${tipo} (anonymous)]`;
}

function chave(k: string | symbol): string {
  if (typeof k === 'symbol') return `[${k.toString()}]`;
  return NOME_SIMPLES.test(k) ? k : citar(k);
}

/** Arruma muitos itens curtos em colunas, como o `groupArrayElements` do Node. */
function emColunas(ctx: Ctx, saida: string[], valor: unknown[] | undefined): string[] {
  let total = 0;
  let maior = 0;
  const separador = 2;
  const n = saida.length - (valor && valor.length > MAX_ITENS ? 1 : 0);
  const larguras: number[] = [];
  for (let i = 0; i < n; i++) {
    const l = saida[i].length;
    larguras.push(l);
    total += l + separador;
    if (maior < l) maior = l;
  }
  const maiorComSep = maior + separador;
  if (maiorComSep * 3 + ctx.nivel < LARGURA
    && (total / maiorComSep > 5 || maior <= 6)) {
    const vies = Math.sqrt(maiorComSep - total / saida.length);
    const maiorComVies = Math.max(maiorComSep - 3 - vies, 1);
    const colunas = Math.min(
      Math.round(Math.sqrt(2.5 * maiorComVies * n) / maiorComVies),
      Math.floor((LARGURA - ctx.nivel) / maiorComSep),
      COMPACTO * 4,
      15,
    );
    if (colunas <= 1) return saida;
    const linhas: string[] = [];
    const larguraDaColuna: number[] = [];
    for (let i = 0; i < colunas; i++) {
      let l = 0;
      for (let j = i; j < saida.length; j += colunas) if (larguras[j] > l) l = larguras[j];
      larguraDaColuna.push(l + separador);
    }
    const soNumeros = valor !== undefined
      && valor.slice(0, saida.length).every(v => typeof v === 'number' || typeof v === 'bigint');
    for (let i = 0; i < n; i += colunas) {
      const ate = Math.min(i + colunas, n);
      let linha = '';
      let j = i;
      for (; j < ate - 1; j++) {
        const pedaco = `${saida[j]}, `;
        linha += soNumeros
          ? pedaco.padStart(larguraDaColuna[j - i], ' ')
          : pedaco.padEnd(larguraDaColuna[j - i], ' ');
      }
      linha += soNumeros
        ? saida[j].padStart(larguraDaColuna[j - i] - separador, ' ')
        : saida[j];
      linhas.push(linha);
    }
    if (n < saida.length) linhas.push(saida[n]);
    return linhas;
  }
  return saida;
}

function juntar(ctx: Ctx, saida: string[], base: string, chaves: [string, string],
  ehArranjo: boolean, valor: unknown[] | undefined, nivelDoValor: number): string {
  const entradas = saida.length;
  if (ehArranjo && entradas > 6) saida = emColunas(ctx, saida, valor);
  if (ctx.profundidadeAtual - nivelDoValor < COMPACTO && entradas === saida.length) {
    const inicio = saida.length + ctx.nivel + chaves[0].length + base.length + 10;
    const total = saida.reduce((s, e) => s + e.length, inicio + saida.length);
    if (total <= LARGURA && !base.includes('\n')) {
      const junto = saida.join(', ');
      if (!junto.includes('\n')) {
        return `${base ? `${base} ` : ''}${chaves[0]} ${junto} ${chaves[1]}`;
      }
    }
  }
  const recuo = `\n${' '.repeat(ctx.nivel)}`;
  return `${base ? `${base} ` : ''}${chaves[0]}${recuo}  ${saida.join(`,${recuo}  `)}${recuo}${chaves[1]}`;
}

function valorEm(ctx: Ctx, v: unknown, nivel: number, dentro: boolean): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  switch (typeof v) {
    case 'string': return dentro ? citar(v) : v;
    case 'number': return numero(v);
    case 'bigint': return `${v}n`;
    case 'boolean': return String(v);
    case 'symbol': return v.toString();
    default: break;
  }
  const o = v as Record<string | symbol, unknown>;
  const proprio = (o as { [COMO_SE_ESCREVE]?: () => string })[COMO_SE_ESCREVE];
  if (typeof proprio === 'function') return proprio.call(o);

  if (ctx.vistos.includes(v)) {
    if (!ctx.circulares.has(v)) ctx.circulares.set(v, ctx.circulares.size + 1);
    return `[Circular *${ctx.circulares.get(v)}]`;
  }

  if (typeof v === 'function') {
    const nome = nomeDaFuncao(v as QualquerFuncao);
    const ks = Object.keys(v);
    if (ks.length === 0) return nome;
    return objetoComPropriedades(ctx, v, nivel, nome, ks);
  }

  if (v instanceof Date) return Number.isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
  if (v instanceof RegExp) return v.toString();
  if (v instanceof Error) {
    const cabeca = `${v.name}: ${v.message}`;
    return dentro ? `[${cabeca}]` : cabeca;
  }
  if (v instanceof Promise) return 'Promise { <pending> }';

  if (nivel > PROFUNDIDADE) {
    if (Array.isArray(v)) return '[Array]';
    const nome = nomeDoConstrutor(v);
    return nome === null ? '[Object: null prototype]' : `[${nome}]`;
  }

  ctx.vistos.push(v);
  const nivelAntes = ctx.nivel;
  ctx.profundidadeAtual = nivel;
  let texto: string;
  try {
    if (Array.isArray(v)) texto = arranjo(ctx, v, nivel);
    else if (v instanceof Map) texto = mapa(ctx, v, nivel);
    else if (v instanceof Set) texto = conjunto(ctx, v, nivel);
    else {
      const nome = nomeDoConstrutor(v);
      const base = MODULOS.has(v) ? '[Module: null prototype]'
        : nome === null ? '[Object: null prototype]' : nome === 'Object' ? '' : nome;
      texto = objetoComPropriedades(ctx, v, nivel, base, Object.keys(v));
    }
  } finally {
    ctx.vistos.pop();
    ctx.nivel = nivelAntes;
  }
  const ref = ctx.circulares.get(v);
  return ref !== undefined ? `<ref *${ref}> ${texto}` : texto;
}

function nomeDoConstrutor(v: object): string | null {
  const proto = Object.getPrototypeOf(v);
  if (proto === null) return null;
  return (proto.constructor && proto.constructor.name) || 'Object';
}

function itens(ctx: Ctx, pares: [string, unknown][], nivel: number): string[] {
  ctx.nivel += 2;
  const saida = pares.map(([k, val]) => `${k}: ${valorEm(ctx, val, nivel + 1, true)}`);
  ctx.nivel -= 2;
  return saida;
}

function objetoComPropriedades(ctx: Ctx, v: object, nivel: number, base: string, ks: string[]): string {
  const o = v as Record<string, unknown>;
  const pares: [string, unknown][] = [];
  const getters: string[] = [];
  for (const k of ks) {
    const d = Object.getOwnPropertyDescriptor(o, k);
    if (d && (d.get || d.set)) getters.push(`${chave(k)}: [${d.get && d.set ? 'Getter/Setter' : d.get ? 'Getter' : 'Setter'}]`);
    else pares.push([chave(k), o[k]]);
  }
  for (const s of Object.getOwnPropertySymbols(o)) {
    if (Object.getOwnPropertyDescriptor(o, s)?.enumerable) pares.push([chave(s), o[s as unknown as string]]);
  }
  const saida = [...itens(ctx, pares, nivel), ...getters];
  if (saida.length === 0) {
    if (typeof v === 'function') return base;
    return base ? `${base} {}` : '{}';
  }
  return juntar(ctx, saida, base, ['{', '}'], false, undefined, nivel);
}

function arranjo(ctx: Ctx, v: unknown[], nivel: number): string {
  const saida: string[] = [];
  ctx.nivel += 2;
  const ate = Math.min(v.length, MAX_ITENS);
  let vazios = 0;
  const fechaVazios = () => {
    if (vazios) saida.push(`<${vazios} empty item${vazios > 1 ? 's' : ''}>`);
    vazios = 0;
  };
  for (let i = 0; i < ate; i++) {
    if (!Object.prototype.hasOwnProperty.call(v, i)) { vazios++; continue; }
    fechaVazios();
    saida.push(valorEm(ctx, v[i], nivel + 1, true));
  }
  fechaVazios();
  if (v.length > MAX_ITENS) {
    const resto = v.length - MAX_ITENS;
    saida.push(`... ${resto} more item${resto > 1 ? 's' : ''}`);
  }
  const extras = Object.keys(v).filter(k => !/^\d+$/.test(k));
  for (const k of extras) saida.push(`${chave(k)}: ${valorEm(ctx, (v as unknown as Record<string, unknown>)[k], nivel + 1, true)}`);
  ctx.nivel -= 2;
  const nome = nomeDoConstrutor(v);
  const base = nome && nome !== 'Array' ? `${nome}(${v.length})` : '';
  if (saida.length === 0) return base ? `${base} []` : '[]';
  return juntar(ctx, saida, base, ['[', ']'], true, v, nivel);
}

function mapa(ctx: Ctx, v: Map<unknown, unknown>, nivel: number): string {
  ctx.nivel += 2;
  const saida = [...v].map(([k, val]) =>
    `${valorEm(ctx, k, nivel + 1, true)} => ${valorEm(ctx, val, nivel + 1, true)}`);
  ctx.nivel -= 2;
  const base = `Map(${v.size})`;
  if (!saida.length) return `${base} {}`;
  return juntar(ctx, saida, base, ['{', '}'], false, undefined, nivel);
}

function conjunto(ctx: Ctx, v: Set<unknown>, nivel: number): string {
  ctx.nivel += 2;
  const saida = [...v].map(val => valorEm(ctx, val, nivel + 1, true));
  ctx.nivel -= 2;
  const base = `Set(${v.size})`;
  if (!saida.length) return `${base} {}`;
  return juntar(ctx, saida, base, ['{', '}'], true, [...v], nivel);
}

/** Um valor como o `util.inspect` o escreve: texto entre aspas, como dentro de um objeto. */
export function inspecionar(v: unknown): string {
  return valorEm({ nivel: 0, profundidadeAtual: 0, vistos: [], circulares: new Map() }, v, 0, true);
}

/**
 * Uma linha do `console.log`, com os argumentos separados por espaço.
 *
 * Texto solto sai sem aspas — é o que ninguém estranha —, e o primeiro texto
 * entende `%s`, `%d`, `%i`, `%f`, `%j`, `%o`, `%O` e `%%`, como no Node.
 */
export function formatarLinha(args: unknown[]): string {
  if (args.length === 0) return '';
  const solto = (v: unknown) => valorEm({ nivel: 0, profundidadeAtual: 0, vistos: [], circulares: new Map() }, v, 0, false);
  let resto = args;
  let saida = '';
  if (typeof args[0] === 'string' && args.length > 1 && args[0].includes('%')) {
    let i = 1;
    const modelo = args[0];
    let j = 0;
    while (j < modelo.length) {
      const c = modelo[j];
      if (c === '%' && j + 1 < modelo.length) {
        const f = modelo[j + 1];
        if (f === '%') { saida += '%'; j += 2; continue; }
        if ('sdifjoOc'.includes(f) && i < args.length) {
          const a = args[i++];
          if (f === 's') saida += typeof a === 'string' ? a : typeof a === 'bigint' ? `${a}n` : (typeof a === 'object' && a !== null) ? inspecionar(a) : numeroOuTexto(a);
          else if (f === 'd' || f === 'i') {
            const n = typeof a === 'bigint' ? a : Number(a);
            saida += typeof n === 'bigint' ? `${n}n` : numero(f === 'i' ? Math.trunc(n) : n);
          } else if (f === 'f') saida += numero(Number.parseFloat(String(a)));
          else if (f === 'j') saida += JSON.stringify(a);
          else if (f === 'c') { /* CSS não existe no terminal */ } else saida += inspecionar(a);
          j += 2;
          continue;
        }
      }
      saida += c;
      j += 1;
    }
    resto = args.slice(i);
    for (const a of resto) saida += ` ${solto(a)}`;
    return saida;
  }
  return resto.map(solto).join(' ');
}

function numeroOuTexto(a: unknown): string {
  return typeof a === 'number' ? numero(a) : String(a);
}
