import { parse } from 'acorn';
import { COMO_SE_ESCREVE, formatarLinha, marcarComoModulo } from './inspecionar';
import { corpoParaMensagem, formatoDe, traduzirModulo, type Formato } from './esm';

/**
 * Um `node programa.js`, dentro do navegador.
 *
 * ── Quem executa é o JavaScript do próprio navegador ─────────────────────
 * A CC002 precisou de doze megabytes de Pyodide porque o navegador não fala
 * Python. JavaScript ele fala: o motor que roda o programa aqui é o mesmo V8
 * do Node no Chrome, e as mensagens de erro saem dele, com as mesmas
 * palavras. O que o navegador não tem é o que o Node põe em volta do
 * programa — o `console.log` que escreve texto, o `require`, a pasta em disco
 * e o `process` —, e é só isso que este arquivo monta.
 *
 * ── Uma pasta de mentira, refeita a cada execução ────────────────────────
 * O `fs` lê e grava num objeto que começa igual aos arquivos da lição e é
 * devolvido no fim. É o arranjo da pasta do Python da CC004, pelo motivo
 * escrito lá: arquivo gravado numa execução que sobrevivesse à seguinte
 * deixaria passar um programa que já parou de gravar.
 *
 * ── O relógio é de mentira também ────────────────────────────────────────
 * `setTimeout` não espera de verdade: ele entra numa fila ordenada por
 * horário, e a fila anda quando o programa termina a parte síncrona e as
 * promessas se assentam. Um programa que espera três segundos devolve na
 * hora, na mesma ordem em que o Node devolveria — e `Date.now()` anda junto,
 * para quem medir o tempo ver os três segundos que pediu. Sem isso, a lição
 * de assíncrono seria uma lição de paciência, e a trava que roda os exemplos
 * levaria minutos.
 *
 * ── E roda igual no teste ────────────────────────────────────────────────
 * Nada aqui toca `self` nem `window`: o worker chama `executarNode`, e as
 * travas também. É o que deixa `exemplosDeJavascript.test.ts` conferir cada
 * exemplo da teoria contra o Node de verdade sem subir navegador nenhum.
 */

/** Os arquivos da pasta, pelo nome. A pasta é plana: é o que as lições usam. */
export type Pasta = Record<string, string>;

export interface ResultadoDoNode {
  /** O que o programa escreveu, `console.error` incluído, na ordem em que saiu. */
  saida: string;
  /** A mensagem de erro, como o Node a escreve no terminal. */
  erro: string | null;
  /** O prazo acabou, ou a fila de temporizadores não esvaziou nunca. */
  semFim: boolean;
  /** A pasta depois do programa. */
  pasta: Pasta;
}

/* Quanto texto a saída pode ter. Um `while (true)` com `console.log` dentro
   enche a memória antes de o prazo acabar; cortar aqui é o que deixa o prazo
   chegar. */
const MAX_SAIDA = 20000;

/* Quantos temporizadores a fila atende antes de desistir. Um `setInterval`
   sem `clearInterval` nunca esvazia a fila, e ele não trava a página — gira
   no relógio de mentira —, então quem o encerra é esta conta, e não o prazo. */
const MAX_TEMPORIZADORES = 5000;

/** O nome da pasta, para as mensagens que o Node escreve com o caminho. */
export const RAIZ = '/projeto';

/*
  A linha em que o programa começa, dentro da função que o embrulha.

  `new Function` monta `function anonymous(...)\n) {\n` antes do corpo, e o
  número de linhas desse cabeçalho é do motor. Em vez de supor dois, mede-se
  uma vez: uma linha que lança na primeira linha diz quantas o cabeçalho
  ocupa. Num navegador que não escreva o nome do arquivo no rastro, a medida
  falha e o erro sai sem número de linha — que é melhor do que com o número
  errado.
*/
const DESLOCAMENTO = (() => {
  try {
    new Function('throw new Error("medida")\n//# sourceURL=medida.js')();
  } catch (e) {
    const m = /medida\.js:(\d+)/.exec(String((e as Error).stack));
    if (m) return Number(m[1]) - 1;
  }
  return null;
})();

const PARAMETROS = [
  'exports', 'require', 'module', '__filename', '__dirname',
  'console', 'process', 'setTimeout', 'clearTimeout', 'setInterval',
  'clearInterval', 'setImmediate', 'Buffer', 'Date',
];

/** O sinal de `process.exit`: atravessa o programa até o fim, e não é erro. */
class Saida { constructor(public codigo: number) {} }
/** O sinal de saída grande demais: também atravessa tudo. */
class Transbordou {}

/** Um Buffer pequeno: o bastante para o `readFileSync` sem codificação. */
class BufferSimulado {
  readonly bytes: Uint8Array;
  constructor(bytes: Uint8Array) { this.bytes = bytes; }
  get length() { return this.bytes.length; }
  toString(codificacao?: string) {
    if (codificacao && !/^utf-?8$/i.test(codificacao)) return Array.from(this.bytes, b => String.fromCharCode(b)).join('');
    return new TextDecoder().decode(this.bytes);
  }
  toJSON() { return { type: 'Buffer', data: Array.from(this.bytes) }; }
  /* O Node escreve os primeiros cinquenta bytes em hexadecimal: é o que se vê
     ao esquecer o 'utf8', e é por isso que vale imitar. */
  [COMO_SE_ESCREVE]() {
    const mostra = Array.from(this.bytes.slice(0, 50), b => b.toString(16).padStart(2, '0')).join(' ');
    const resto = this.bytes.length > 50 ? ` ... ${this.bytes.length - 50} more bytes` : '';
    return `<Buffer${mostra ? ` ${mostra}` : ''}${resto}>`;
  }
  static from(v: unknown) {
    if (v instanceof BufferSimulado) return new BufferSimulado(v.bytes.slice());
    if (Array.isArray(v)) return new BufferSimulado(Uint8Array.from(v as number[]));
    return new BufferSimulado(new TextEncoder().encode(String(v)));
  }
  static isBuffer(v: unknown) { return v instanceof BufferSimulado; }
}

function erroDoSistema(codigo: 'ENOENT' | 'EISDIR', operacao: string, caminho: string): Error {
  const texto = codigo === 'ENOENT' ? 'no such file or directory' : 'illegal operation on a directory';
  const e = new Error(`${codigo}: ${texto}, ${operacao} '${caminho}'`) as Error & Record<string, unknown>;
  e.errno = codigo === 'ENOENT' ? -2 : -21;
  e.code = codigo;
  e.syscall = operacao;
  e.path = caminho;
  return e;
}

/** O erro do Node para o dado que não é texto, que é o de quem esqueceu o `JSON.stringify`. */
function erroDeTipoDoDado(dado: unknown): Error {
  const recebido = dado === null ? 'Received null'
    : dado === undefined ? 'Received undefined'
      : typeof dado === 'object'
        ? `Received ${Array.isArray(dado) ? 'an instance of Array' : `an instance of ${Object.getPrototypeOf(dado)?.constructor?.name ?? 'Object'}`}`
        : `Received type ${typeof dado} (${String(dado)})`;
  const e = new TypeError(
    `The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. ${recebido}`,
  ) as TypeError & { code: string };
  e.code = 'ERR_INVALID_ARG_TYPE';
  return e;
}

function nomeNaPasta(caminho: unknown): string {
  let c = String(caminho).replace(/\\/g, '/');
  if (c.startsWith(`${RAIZ}/`)) c = c.slice(RAIZ.length + 1);
  while (c.startsWith('./')) c = c.slice(2);
  return c;
}

function textoDoDado(dado: unknown): string {
  if (typeof dado === 'string') return dado;
  if (dado instanceof BufferSimulado) return dado.toString();
  if (dado instanceof Uint8Array) return new TextDecoder().decode(dado);
  throw erroDeTipoDoDado(dado);
}

function codificacaoDe(opcoes: unknown): string | undefined {
  if (typeof opcoes === 'string') return opcoes;
  if (opcoes && typeof opcoes === 'object' && 'encoding' in opcoes) {
    const e = (opcoes as { encoding?: unknown }).encoding;
    return typeof e === 'string' ? e : undefined;
  }
  return undefined;
}

interface Temporizador {
  id: number;
  quando: number;
  fn: (...a: unknown[]) => void;
  args: unknown[];
  intervalo: number | null;
}

/**
 * Onde o ambiente avisa de promessa rejeitada sem ninguém para tratar.
 *
 * No worker é o evento `unhandledrejection` de `self`; num teste, o do
 * `process`. O motor não sabe qual dos dois é — recebe a função que liga e
 * devolve a que desliga.
 */
export type OuvirRejeicoes = (aoRejeitar: (motivo: unknown) => void) => () => void;

/** Um passo do laço de eventos: deixa as promessas pendentes se assentarem. */
function assentar(): Promise<void> {
  if (typeof MessageChannel !== 'undefined') {
    return new Promise(resolve => {
      const canal = new MessageChannel();
      canal.port1.onmessage = () => { canal.port1.close(); resolve(); };
      canal.port2.postMessage(null);
    });
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Executa `principal` como o `node` executaria, e devolve o que saiu.
 *
 * Um laço sem fim na parte síncrona não volta nunca — é o worker que o
 * encerra, pelo prazo. Aqui dentro só se protege o que é possível proteger:
 * saída grande demais e fila de temporizadores que não esvazia.
 */
export async function executarNode(pastaInicial: Pasta, principal: string, opcoes: {
  ouvirRejeicoes?: OuvirRejeicoes;
} = {}): Promise<ResultadoDoNode> {
  const pasta: Pasta = { ...pastaInicial };
  let saida = '';
  let transbordou = false;
  let erro: string | null = null;
  let semFim = false;
  let encerrado = false;

  const escrever = (texto: string) => {
    if (transbordou) throw new Transbordou();
    if (saida.length + texto.length > MAX_SAIDA) {
      saida += texto.slice(0, Math.max(0, MAX_SAIDA - saida.length));
      /* Quase sempre é o laço sem fim com um console.log dentro: ele enche a
         saída antes de o prazo acabar, e dizer só "cortada" deixaria a pessoa
         achando que o defeito é o tamanho. */
      saida += '\n… (a saída passou de 20.000 caracteres e foi cortada aqui. Se a mesma linha '
        + 'se repete sem parar, é quase sempre um laço cuja condição nunca fica falsa.)\n';
      transbordou = true;
      throw new Transbordou();
    }
    saida += texto;
  };

  /* ── O relógio ── */
  const inicioReal = Date.now();
  let agora = 0;
  let proximoId = 1;
  const fila: Temporizador[] = [];
  const agendar = (fn: unknown, ms: unknown, args: unknown[], repete: boolean) => {
    if (typeof fn !== 'function') {
      const e = new TypeError(`The "callback" argument must be of type function. Received ${fn === undefined ? 'undefined' : `type ${typeof fn}`}`) as TypeError & { code: string };
      e.code = 'ERR_INVALID_ARG_TYPE';
      throw e;
    }
    /* O Node trata 0, negativo e o que não é número como 1 milissegundo. */
    const n = Number(ms);
    const espera = Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), 2147483647) : 1;
    const t: Temporizador = { id: proximoId++, quando: agora + espera, fn: fn as Temporizador['fn'], args, intervalo: repete ? espera : null };
    fila.push(t);
    return { id: t.id, ref() { return this; }, unref() { return this; }, hasRef: () => true, [Symbol.toPrimitive]: () => t.id };
  };
  const cancelar = (alvo: unknown) => {
    const id = typeof alvo === 'object' && alvo !== null ? (alvo as { id: number }).id : Number(alvo);
    const i = fila.findIndex(t => t.id === id);
    if (i >= 0) fila.splice(i, 1);
  };

  const DataReal = Date;
  class DataDoPrograma extends DataReal {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(inicioReal + agora);
      else super(...(args as []));
    }
    static now() { return inicioReal + agora; }
  }

  /* ── O console ── */
  const linha = (...args: unknown[]) => escrever(`${formatarLinha(args)}\n`);
  const consoleDoNode = {
    log: linha, info: linha, debug: linha, error: linha, warn: linha, trace: linha,
    table: linha, dir: (v: unknown) => linha(v),
    group: linha, groupEnd: () => {}, time: () => {}, timeEnd: () => {}, count: () => {},
    assert: (cond: unknown, ...args: unknown[]) => { if (!cond) linha('Assertion failed', ...args); },
  };

  /* ── O processo ── */
  const processo = {
    argv: ['/usr/local/bin/node', `${RAIZ}/${principal}`],
    env: { LANG: 'pt_BR.UTF-8' } as Record<string, string>,
    platform: 'linux',
    version: 'v22.0.0',
    versions: { node: '22.0.0' },
    exitCode: undefined as number | undefined,
    cwd: () => RAIZ,
    exit: (codigo?: number) => { throw new Saida(codigo ?? 0); },
    stdout: { write: (s: unknown) => { escrever(String(s)); return true; } },
    stderr: { write: (s: unknown) => { escrever(String(s)); return true; } },
    on: () => processo,
    nextTick: (fn: (...a: unknown[]) => void, ...args: unknown[]) => { queueMicrotask(() => fn(...args)); },
  };

  /* ── A pasta ── */
  const ler = (caminho: unknown, opcoesDeLeitura?: unknown) => {
    const nome = nomeNaPasta(caminho);
    if (nome === '' || nome === '.') throw erroDoSistema('EISDIR', 'read', String(caminho));
    if (!(nome in pasta)) throw erroDoSistema('ENOENT', 'open', String(caminho));
    const cod = codificacaoDe(opcoesDeLeitura);
    return cod ? pasta[nome] : new BufferSimulado(new TextEncoder().encode(pasta[nome]));
  };
  const gravar = (caminho: unknown, dado: unknown) => {
    const texto = textoDoDado(dado);
    const nome = nomeNaPasta(caminho);
    if (nome.includes('/')) throw erroDoSistema('ENOENT', 'open', String(caminho));
    pasta[nome] = texto;
  };
  const acrescentar = (caminho: unknown, dado: unknown) => {
    const nome = nomeNaPasta(caminho);
    gravar(caminho, (pasta[nome] ?? '') + textoDoDado(dado));
  };
  const listar = () => Object.keys(pasta).sort();
  const apagar = (caminho: unknown) => {
    const nome = nomeNaPasta(caminho);
    if (!(nome in pasta)) throw erroDoSistema('ENOENT', 'unlink', String(caminho));
    delete pasta[nome];
  };
  /* A versão de promessa assenta depois do que já estava na fila de promessas,
     como uma leitura de disco de verdade — nunca na mesma volta. */
  const prometer = <T>(f: () => T) => new Promise<T>((resolve, reject) => {
    queueMicrotask(() => { try { resolve(f()); } catch (e) { reject(e); } });
  });
  const fsPromessas = {
    readFile: (c: unknown, o?: unknown) => prometer(() => ler(c, o)),
    writeFile: (c: unknown, d: unknown) => prometer(() => { gravar(c, d); }),
    appendFile: (c: unknown, d: unknown) => prometer(() => { acrescentar(c, d); }),
    readdir: () => prometer(listar),
    unlink: (c: unknown) => prometer(() => { apagar(c); }),
    access: (c: unknown) => prometer(() => { if (!(nomeNaPasta(c) in pasta)) throw erroDoSistema('ENOENT', 'access', String(c)); }),
  };
  /* O estilo antigo, de função de retorno: ela é chamada numa volta seguinte do
     laço, e um erro vai no primeiro argumento — nunca lançado. */
  const comRetorno = (f: (...a: unknown[]) => unknown) => (...args: unknown[]) => {
    const cb = args.pop();
    if (typeof cb !== 'function') throw erroDeTipoDoDado(cb);
    agendar(() => {
      let r: unknown;
      try { r = f(...args); } catch (e) { (cb as (...a: unknown[]) => void)(e); return; }
      (cb as (...a: unknown[]) => void)(null, r);
    }, 0, [], false);
  };
  const fs = {
    readFileSync: ler,
    writeFileSync: gravar,
    appendFileSync: acrescentar,
    existsSync: (c: unknown) => { const n = nomeNaPasta(c); return n === '' || n === '.' || n in pasta; },
    readdirSync: listar,
    unlinkSync: apagar,
    mkdirSync: () => undefined,
    readFile: comRetorno(ler),
    writeFile: comRetorno(gravar),
    appendFile: comRetorno(acrescentar),
    readdir: comRetorno(listar),
    promises: fsPromessas,
  };
  const caminho = {
    sep: '/',
    join: (...p: unknown[]) => p.map(String).join('/').replace(/\/+/g, '/').replace(/(^|\/)\.\//g, '$1'),
    resolve: (...p: unknown[]) => `${RAIZ}/${nomeNaPasta(p.map(String).join('/'))}`,
    basename: (p: unknown, ext?: string) => {
      const b = String(p).split('/').pop() ?? '';
      return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b;
    },
    dirname: (p: unknown) => { const s = String(p); const i = s.lastIndexOf('/'); return i <= 0 ? (i === 0 ? '/' : '.') : s.slice(0, i); },
    extname: (p: unknown) => { const b = String(p).split('/').pop() ?? ''; const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; },
  };
  const EMBUTIDOS: Record<string, unknown> = {
    fs, 'fs/promises': fsPromessas, path: caminho,
  };

  /* ── Os módulos ── */
  /* Cada arquivo de módulo ES ganha uma linha a mais antes do corpo — a das
     importações —, e o número de linha do rastro precisa descontá-la. */
  const linhasAMais: Record<string, number> = {};
  const cache = new Map<string, { exports: unknown }>();
  const requerer = (deQuem: string) => (pedido: unknown) => {
    const nome = String(pedido);
    const semPrefixo = nome.replace(/^node:/, '');
    if (semPrefixo in EMBUTIDOS) return EMBUTIDOS[semPrefixo];
    if (nome.startsWith('./') || nome.startsWith('../') || nome.startsWith('/')) {
      const base = nomeNaPasta(nome);
      const candidatos = [base, `${base}.js`, `${base}.json`, `${base}.cjs`];
      const achado = candidatos.find(c => c in pasta);
      if (achado) {
        if (achado.endsWith('.js') && formatoDe(pasta[achado]) === 'esm') {
          const e = new Error(`require() of ES Module ${RAIZ}/${achado} from ${RAIZ}/${deQuem} not supported. Use import instead.`) as Error & { code: string };
          e.code = 'ERR_REQUIRE_ESM';
          throw e;
        }
        return carregar(achado);
      }
    }
    const e = new Error(`Cannot find module '${nome}'\nRequire stack:\n- ${RAIZ}/${deQuem}`) as Error & { code: string };
    e.code = 'MODULE_NOT_FOUND';
    throw e;
  };

  const agendamentos = [
    (f: unknown, ms: unknown, ...a: unknown[]) => agendar(f, ms, a, false), cancelar,
    (f: unknown, ms: unknown, ...a: unknown[]) => agendar(f, ms, a, true), cancelar,
    (f: unknown, ...a: unknown[]) => agendar(f, 0, a, false),
  ];

  const carregar = (nome: string): unknown => {
    const ja = cache.get(nome);
    if (ja) return ja.exports;
    const modulo = { exports: {} as unknown, id: nome, filename: `${RAIZ}/${nome}`, loaded: false };
    cache.set(nome, modulo);
    if (nome.endsWith('.json')) {
      try { modulo.exports = JSON.parse(pasta[nome]); } catch (e) {
        (e as Error).message = `${RAIZ}/${nome}: ${(e as Error).message}`;
        throw e;
      }
      return modulo.exports;
    }
    const fonte = pasta[nome].replace(/^#!.*/, '');
    let fn: (...a: unknown[]) => unknown;
    try {
        fn = new Function(...PARAMETROS, `${fonte}\n//# sourceURL=${nome}`) as typeof fn;
    } catch (e) {
      throw new ErroComLugar(e, nome, 'cjs');
    }
    fn.call(modulo.exports, modulo.exports, requerer(nome), modulo, `${RAIZ}/${nome}`, RAIZ,
      consoleDoNode, processo, ...agendamentos, BufferSimulado, DataDoPrograma);
    modulo.loaded = true;
    return modulo.exports;
  };

  /* O que um `import` recebe de um módulo CommonJS ou embutido: o
     `module.exports` inteiro como `default`, e cada propriedade pelo nome. */
  const espacoDeCjs = (exportado: unknown) => {
    const ns: Record<string, unknown> = Object.create(null);
    if (exportado && (typeof exportado === 'object' || typeof exportado === 'function')) {
      for (const k of Object.keys(exportado)) ns[k] = (exportado as Record<string, unknown>)[k];
    }
    ns.default = exportado;
    return ns;
  };

  const cacheEsm = new Map<string, Promise<Record<string, unknown>>>();
  const importar = async (pedido: string, deQuem: string): Promise<Record<string, unknown>> => {
    const semPrefixo = pedido.replace(/^node:/, '');
    if (semPrefixo in EMBUTIDOS) return espacoDeCjs(EMBUTIDOS[semPrefixo]);
    const relativo = pedido.startsWith('./') || pedido.startsWith('../') || pedido.startsWith('/');
    const nome = nomeNaPasta(pedido);
    if (!relativo || !(nome in pasta)) {
      /* O `import` não completa a extensão — o `require` completava —, e é o
         engano de quem vem dele. O Node sugere o nome certo, e aqui também. */
      const sugestao = relativo && `${nome}.js` in pasta ? `\nDid you mean to import "${pedido}.js"?` : '';
      const e = new Error(relativo
        ? `Cannot find module '${RAIZ}/${nome}' imported from ${RAIZ}/${deQuem}${sugestao}`
        : `Cannot find package '${pedido}' imported from ${RAIZ}/${deQuem}`) as Error & { code: string };
      e.name = 'Error [ERR_MODULE_NOT_FOUND]';
      e.code = 'ERR_MODULE_NOT_FOUND';
      throw e;
    }
    if (nome.endsWith('.json')) {
      const e = new TypeError(`Module "file://${RAIZ}/${nome}" needs an import attribute of "type: json"`) as TypeError & { code: string };
      e.name = 'TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]';
      e.code = 'ERR_IMPORT_ATTRIBUTE_MISSING';
      throw e;
    }
    if (formatoDe(pasta[nome]) === 'cjs') return espacoDeCjs(carregar(nome));
    return carregarEsm(nome);
  };

  const carregarEsm = (nome: string): Promise<Record<string, unknown>> => {
    const ja = cacheEsm.get(nome);
    if (ja) return ja;
    const exportado = espacoDeModulo();
    const promessa = (async () => {
      const modulo = traduzirModulo(pasta[nome]);
      /* `require` e `await` no topo, sem `import` nenhum: o Node não tem como
         saber o que a pessoa quis, e diz isso em vez de escolher. */
      if (!modulo.temSintaxeDeModulo && modulo.awaitNoTopo && modulo.primeiroRequire) {
        const e = new ReferenceError('Cannot determine intended module format because both require() and top-level await are present. If the code is intended to be CommonJS, wrap await in an async function. If the code is intended to be an ES module, replace require() with import.');
        throw new ErroComLugar(e, nome, 'esm', modulo.primeiroRequire);
      }
      const espacos: Record<string, unknown>[] = [];
      for (const p of modulo.pedidos) espacos.push(await importar(p, nome));
      linhasAMais[nome] = 1;
      let fn: (...a: unknown[]) => Promise<unknown>;
      try {
            fn = new Function('__ns', '__exp', '__def', '__reexp', '__meta', '__dimp', ...PARAMETROS_ESM,
          `"use strict"; return (async () => { ${modulo.cabecalho}\n${modulo.corpo}\n})();\n//# sourceURL=${nome}`) as typeof fn;
      } catch (e) {
        throw new ErroComLugar(e, nome, 'esm');
      }
      const definir = (alvo: object, k: string, ler: () => unknown) =>
        Object.defineProperty(alvo, k, { get: ler, enumerable: true, configurable: true });
      const reexportar = (alvo: Record<string, unknown>, de: Record<string, unknown>) => {
        for (const k of Object.keys(de)) if (k !== 'default' && !(k in alvo)) definir(alvo, k, () => de[k]);
      };
      const meta = { url: `file://${RAIZ}/${nome}`, filename: `${RAIZ}/${nome}`, dirname: RAIZ };
      await fn(espacos, exportado, definir, reexportar, meta,
        (p: unknown) => importar(String(p), nome),
        consoleDoNode, processo, ...agendamentos, BufferSimulado, DataDoPrograma);
      return exportado;
    })();
    cacheEsm.set(nome, promessa);
    return promessa;
  };

  /* ── O erro, do jeito que o terminal o mostra ── */
  /* `lancado` separa o erro que subiu de um `throw` do que chegou por uma
     promessa rejeitada: o Node aponta a seta para o `throw` no primeiro caso
     e para onde o erro foi criado no segundo — e um módulo ES é uma promessa,
     então o erro do corpo dele é do segundo tipo. */
  const relatar = (e: unknown, lancado: boolean) => {
    if (e instanceof Saida || e instanceof Transbordou) return;
    if (encerrado) return;
    erro = mensagemDoErro(e, pasta, linhasAMais, lancado);
    encerrado = true;
  };
  const aoFalhar = (lancado: boolean) => (e: unknown) => {
    if (e instanceof Saida) encerrado = true;
    else relatar(e, lancado);
  };

  const pararDeOuvir = opcoes.ouvirRejeicoes?.(motivo => { if (!encerrado) relatar(motivo, false); }) ?? (() => {});

  try {
    if (!(principal in pasta)) {
      erro = `Error: Cannot find module '${RAIZ}/${principal}'`;
      return { saida, erro, semFim, pasta };
    }
    /* O módulo ES roda como promessa, e não se espera por ela aqui: um
       `await` no topo que aguarda um `setTimeout` só termina se o laço de
       eventos andar, e é logo abaixo que ele anda. */
    if (formatoDe(pasta[principal]) === 'esm') carregarEsm(principal).catch(aoFalhar(false));
    else {
      try { carregar(principal); } catch (e) { aoFalhar(true)(e); }
    }

    /* ── O laço de eventos ── */
    let atendidos = 0;
    while (!encerrado) {
      await assentar();
      if (encerrado || fila.length === 0) break;
      if (++atendidos > MAX_TEMPORIZADORES) { semFim = true; break; }
      fila.sort((a, b) => a.quando - b.quando || a.id - b.id);
      const t = fila.shift()!;
      agora = t.quando;
      if (t.intervalo !== null) fila.push({ ...t, quando: agora + t.intervalo });
      try {
        t.fn(...t.args);
      } catch (e) {
        aoFalhar(true)(e);
      }
    }
    /* Uma última volta: a rejeição que nasceu no último temporizador só é
       avisada depois que as promessas assentam. */
    if (!encerrado) await assentar();
  } finally {
    pararDeOuvir();
  }

  return { saida, erro, semFim, pasta };
}

/* No módulo ES não há `exports`, `module`, `__filename` nem `__dirname`, e o
   `require` é o que avisa que não existe ali. */
const PARAMETROS_ESM = PARAMETROS.filter(p => !['exports', 'require', 'module', '__filename', '__dirname'].includes(p));

/* O que o Node acrescenta à mensagem quando o nome que falta é de CommonJS:
   quem vem do `require` precisa saber que ele não sumiu por acaso. */
const SO_NO_COMMONJS: Record<string, string> = {
  'require is not defined': 'require is not defined in ES module scope, you can use import instead',
  '__dirname is not defined': '__dirname is not defined in ES module scope',
  '__filename is not defined': '__filename is not defined in ES module scope',
  'module is not defined': 'module is not defined in ES module scope',
  'exports is not defined': 'exports is not defined in ES module scope',
};

/**
 * O objeto que um `import * as` recebe.
 *
 * No Node ele é um objeto especial: as chaves saem em ordem alfabética, cada
 * uma lida na hora (um `export let` que muda continua mudando lá fora), e o
 * `console.log` o chama de `[Module: null prototype]`. Um `Proxy` dá as três
 * coisas sem mudar o que o tradutor escreve.
 */
function espacoDeModulo(): Record<string, unknown> {
  const alvo: Record<string, unknown> = Object.create(null);
  const espaco = new Proxy(alvo, {
    ownKeys: t => Reflect.ownKeys(t).sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0)),
    getOwnPropertyDescriptor: (t, k) => {
      const d = Reflect.getOwnPropertyDescriptor(t, k);
      if (!d) return d;
      return { value: Reflect.get(t, k), writable: true, enumerable: true, configurable: true };
    },
  });
  marcarComoModulo(espaco);
  return espaco;
}

/** O erro de sintaxe, que nasce antes de o programa existir e precisa dizer de que arquivo. */
class ErroComLugar {
  constructor(
    public original: unknown,
    public arquivo: string,
    public formato: Formato,
    public lugar?: { linha: number; coluna: number },
  ) {}
}

/**
 * A mensagem como o Node a escreve: o arquivo e a linha, a linha de código, e
 * o erro embaixo.
 *
 * O rastro inteiro, com as quinze linhas de `node:internal`, fica de fora: ele
 * só diz onde o Node estava, e o que a pessoa precisa é saber onde **ela**
 * estava. A linha sai do rastro do próprio V8, pelo `sourceURL`; a de um erro
 * de sintaxe sai do `acorn`, porque o V8 não diz onde o arquivo parou de
 * fazer sentido.
 */
export function mensagemDoErro(e: unknown, pasta: Pasta, linhasAMais: Record<string, number> = {}, lancado = true): string {
  let arquivo: string | null = null;
  let linha: number | null = null;
  let coluna: number | null = null;
  let original = e;
  if (e instanceof ErroComLugar) {
    original = e.original;
    arquivo = e.arquivo;
    const l = e.lugar ?? linhaDoErroDeSintaxe(pasta[arquivo] ?? '', e.formato);
    if (l) { linha = l.linha; coluna = l.coluna; }
    /* Num módulo ES, o V8 compilou o texto traduzido, e a mensagem dele pode
       falar do que a tradução pôs ali. Compila-se o arquivo de novo, sem a
       sintaxe de módulo, só para ouvir o que ele diz do erro de verdade. */
    if ((e.formato === 'esm' || /^\s*(import|export)\s/m.test(pasta[arquivo] ?? '')) && !e.lugar) {
      original = mensagemDoV8(pasta[arquivo] ?? '') ?? original;
    }
  } else if (original instanceof Error && DESLOCAMENTO !== null) {
    const nomes = Object.keys(pasta).filter(n => /\.(c?js)$/.test(n)).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (nomes.length) {
      const m = new RegExp(`(${nomes.join('|')}):(\\d+):(\\d+)`).exec(String(original.stack));
      if (m) {
        arquivo = m[1].replace(/\\/g, '');
        linha = Number(m[2]) - DESLOCAMENTO - (linhasAMais[arquivo] ?? 0);
        coluna = Number(m[3]);
        /* O V8 marca onde o erro foi **criado**, e o Node mostra onde ele foi
           **lançado**: em `throw new Error(...)`, a seta vai no `throw`. */
        const antes = ((pasta[arquivo] ?? '').split('\n')[linha - 1] ?? '').slice(0, coluna - 1);
        const doThrow = lancado ? /throw\s+$/.exec(antes) : null;
        if (doThrow) coluna = doThrow.index + 1;
        if (linhasAMais[arquivo] && original instanceof ReferenceError && SO_NO_COMMONJS[original.message]) {
          original.message = SO_NO_COMMONJS[original.message];
        }
      }
    }
  }

  /* Um erro que não é Error — `throw 'deu ruim'` — o Node escreve como valor. */
  /* Os erros do próprio Node trazem o código entre colchetes, ao lado do
     nome — `TypeError [ERR_INVALID_ARG_TYPE]` —, e é por ele que se acha a
     explicação na documentação. */
  const codigoDoErro = original instanceof Error ? (original as Error & { code?: unknown }).code : undefined;
  const nome = original instanceof Error && typeof codigoDoErro === 'string' && codigoDoErro.startsWith('ERR_') && !original.name.includes('[')
    ? `${original.name} [${codigoDoErro}]` : original instanceof Error ? original.name : '';
  const corpo = original instanceof Error
    ? `${nome}: ${original.message}`
    : formatarLinha([original]);

  if (arquivo && linha && linha > 0) {
    const codigo = (pasta[arquivo] ?? '').split('\n')[linha - 1] ?? '';
    const seta = coluna ? `${' '.repeat(Math.max(0, coluna - 1))}^` : '';
    return `${arquivo}:${linha}\n${codigo}\n${seta}\n\n${corpo}`;
  }
  return corpo;
}

function mensagemDoV8(fonte: string): Error | null {
  try {
    new Function(`"use strict"; return (async () => {\n${corpoParaMensagem(fonte)}\n})();`);
    return null;
  } catch (e) {
    return e as Error;
  }
}

function linhaDoErroDeSintaxe(fonte: string, formato: Formato): { linha: number; coluna: number } | null {
  /* Um arquivo que não é módulo de jeito nenhum pode ter o erro em qualquer
     dos dois sentidos: lido como script ele acusa o `import`; como módulo, o
     erro de verdade. Se ele tem `import` ou `export` no começo de uma linha,
     a leitura que interessa é a de módulo. */
  const comoModulo = formato === 'esm' || /^\s*(import|export)\s/m.test(fonte);
  try {
    parse(fonte, { ecmaVersion: 'latest', sourceType: comoModulo ? 'module' : 'script', allowHashBang: true });
    return null;
  } catch (e) {
    const loc = (e as { loc?: { line: number; column: number } }).loc;
    return loc ? { linha: loc.line, coluna: loc.column + 1 } : null;
  }
}
