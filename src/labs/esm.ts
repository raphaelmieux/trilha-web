import { parse, type Node } from 'acorn';

/**
 * O `import` e o `export` de um arquivo, traduzidos para o motor.
 *
 * ── O Node de hoje aceita os dois jeitos num .js ─────────────────────────
 * Desde a versão 22, um `.js` sem configuração nenhuma roda como módulo ES
 * se tiver `import`, `export` ou `await` fora de função — e como CommonJS,
 * com `require`, se não tiver. A lição ensina `import`, que é a sintaxe que
 * o navegador também usa e a que as veredas seguintes vão encontrar; o
 * `require` continua funcionando porque é o que metade dos exemplos da
 * internet ainda escreve, e quem o encontrar precisa vê-lo rodar.
 *
 * `new Function` não entende `import`: ele compila um corpo de função, e
 * módulo não é corpo de função. Então o arquivo é lido pelo `acorn`, e cada
 * pedaço de sintaxe de módulo vira o equivalente em código comum, **no mesmo
 * lugar e com o mesmo número de linhas** — é isso que deixa o número da linha
 * do erro bater com o que a pessoa escreveu. As importações viram constantes
 * numa linha antes do corpo, e as exportações viram propriedades com leitura
 * tardia, para um `export let` que muda depois continuar mudando lá fora.
 */

export type Formato = 'cjs' | 'esm';

const OPCOES_SCRIPT = { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true } as const;
const OPCOES_MODULO = { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true } as const;

type No = Node & Record<string, unknown>;

/** Visita a árvore inteira. `parar` corta a descida num nó (o corpo de uma função, por exemplo). */
export function visitar(no: unknown, f: (n: No) => void, parar?: (n: No) => boolean) {
  if (!no || typeof no !== 'object') return;
  if (Array.isArray(no)) { for (const x of no) visitar(x, f, parar); return; }
  const n = no as No;
  if (typeof n.type !== 'string') return;
  f(n);
  if (parar?.(n)) return;
  for (const k of Object.keys(n)) {
    if (k === 'loc' || k === 'start' || k === 'end' || k === 'type') continue;
    visitar(n[k], f, parar);
  }
}

const ehFuncao = (n: No) => n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression'
  || n.type === 'ArrowFunctionExpression';

/** Se o arquivo tem `await` fora de qualquer função — o que só um módulo ES aceita. */
export function temAwaitNoTopo(arvore: unknown): boolean {
  let achou = false;
  visitar(arvore, n => {
    if (n.type === 'AwaitExpression' || (n.type === 'ForOfStatement' && n.await)) achou = true;
  }, ehFuncao);
  return achou;
}

/**
 * Como o Node 22 decide: tenta como CommonJS; se não der e der como módulo,
 * é módulo. Arquivo que não dá de jeito nenhum fica CommonJS — é por esse
 * caminho que o erro de sintaxe é relatado.
 */
export function formatoDe(fonte: string): Formato {
  try { parse(fonte, OPCOES_SCRIPT); return 'cjs'; } catch { /* segue */ }
  try { parse(fonte, OPCOES_MODULO); return 'esm'; } catch { return 'cjs'; }
}

/** O que a tradução devolve. */
export interface ModuloTraduzido {
  /** De onde importa, na ordem em que aparece, sem repetir. */
  pedidos: string[];
  /** Uma linha só: as constantes importadas e as exportações. */
  cabecalho: string;
  /** O corpo, sem a sintaxe de módulo, com as mesmas linhas. */
  corpo: string;
  /** Se há `await` fora de função. */
  awaitNoTopo: boolean;
  /** Se há `import` ou `export` — sem nenhum dos dois, o módulo é só pelo `await`. */
  temSintaxeDeModulo: boolean;
  /** Onde aparece o primeiro `require(...)`, se aparece. */
  primeiroRequire: { linha: number; coluna: number } | null;
}

const nomeDe = (n: unknown): string => {
  const x = n as No;
  return x.type === 'Identifier' ? String(x.name) : JSON.stringify(x.value);
};

function nomesDoPadrao(p: unknown, nomes: string[]) {
  const n = p as No;
  if (!n) return;
  switch (n.type) {
    case 'Identifier': nomes.push(String(n.name)); break;
    case 'ObjectPattern': for (const prop of n.properties as No[]) nomesDoPadrao(prop.type === 'RestElement' ? prop.argument : prop.value, nomes); break;
    case 'ArrayPattern': for (const el of n.elements as No[]) nomesDoPadrao(el, nomes); break;
    case 'RestElement': nomesDoPadrao(n.argument, nomes); break;
    case 'AssignmentPattern': nomesDoPadrao(n.left, nomes); break;
    default: break;
  }
}

/** Troca um trecho por espaço, guardando as quebras de linha. */
const apagar = (s: string) => s.replace(/[^\n]/g, ' ');

export function traduzirModulo(fonte: string): ModuloTraduzido {
  const arvore = parse(fonte, { ...OPCOES_MODULO, locations: true }) as unknown as No;
  const pedidos: string[] = [];
  const indice = (p: string) => {
    const i = pedidos.indexOf(p);
    if (i >= 0) return i;
    pedidos.push(p);
    return pedidos.length - 1;
  };
  const cabeca: string[] = [];
  const getters: string[] = [];
  const trocas: { de: number; ate: number; por: string }[] = [];
  const troca = (de: number, ate: number, por?: string) =>
    trocas.push({ de, ate, por: por ?? apagar(fonte.slice(de, ate)) });
  let temSintaxeDeModulo = false;

  for (const st of arvore.body as No[]) {
    if (st.type === 'ImportDeclaration') {
      temSintaxeDeModulo = true;
      const k = indice(String((st.source as No).value));
      const nomeados: string[] = [];
      for (const s of st.specifiers as No[]) {
        const local = String((s.local as No).name);
        if (s.type === 'ImportDefaultSpecifier') cabeca.push(`const ${local} = __ns[${k}].default;`);
        else if (s.type === 'ImportNamespaceSpecifier') cabeca.push(`const ${local} = __ns[${k}];`);
        else nomeados.push(`${nomeDe(s.imported)}: ${local}`);
      }
      if (nomeados.length) cabeca.push(`const { ${nomeados.join(', ')} } = __ns[${k}];`);
      troca(st.start, st.end);
    } else if (st.type === 'ExportNamedDeclaration') {
      temSintaxeDeModulo = true;
      const decl = st.declaration as No | null;
      if (decl) {
        troca(st.start, decl.start);
        const nomes: string[] = [];
        if (decl.type === 'VariableDeclaration') for (const d of decl.declarations as No[]) nomesDoPadrao(d.id, nomes);
        else nomes.push(String((decl.id as No).name));
        for (const n of nomes) getters.push(`__def(__exp, ${JSON.stringify(n)}, () => ${n});`);
      } else {
        const origem = st.source ? indice(String((st.source as No).value)) : null;
        for (const s of st.specifiers as No[]) {
          const fora = nomeDe(s.exported);
          const dentro = nomeDe(s.local);
          getters.push(origem === null
            ? `__def(__exp, ${JSON.stringify(fora)}, () => ${dentro});`
            : `__def(__exp, ${JSON.stringify(fora)}, () => __ns[${origem}][${JSON.stringify(dentro)}]);`);
        }
        troca(st.start, st.end);
      }
    } else if (st.type === 'ExportAllDeclaration') {
      temSintaxeDeModulo = true;
      const k = indice(String((st.source as No).value));
      getters.push(st.exported
        ? `__def(__exp, ${JSON.stringify(nomeDe(st.exported))}, () => __ns[${k}]);`
        : `__reexp(__exp, __ns[${k}]);`);
      troca(st.start, st.end);
    } else if (st.type === 'ExportDefaultDeclaration') {
      temSintaxeDeModulo = true;
      const decl = st.declaration as No;
      if ((decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') && decl.id) {
        troca(st.start, decl.start);
        getters.push(`__def(__exp, "default", () => ${String((decl.id as No).name)});`);
      } else {
        const prefixo = fonte.slice(st.start, decl.start);
        const por = '__exp.default =';
        troca(st.start, decl.start, por + ' '.repeat(Math.max(1, prefixo.length - por.length)));
      }
    }
  }

  /* `import.meta` e `import()` podem estar em qualquer lugar. O nome posto no
     lugar tem o mesmo tamanho, e espaço antes do ponto é JavaScript válido. */
  let primeiroRequire: ModuloTraduzido['primeiroRequire'] = null;
  visitar(arvore, n => {
    if (n.type === 'MetaProperty') troca(n.start, n.end, '__meta'.padEnd(n.end - n.start, ' '));
    if (n.type === 'ImportExpression') troca(n.start, n.start + 6, '__dimp');
    if (!primeiroRequire && n.type === 'CallExpression' && (n.callee as No).type === 'Identifier'
      && (n.callee as No).name === 'require') {
      const loc = (n.callee as No).loc as unknown as { start: { line: number; column: number } };
      primeiroRequire = { linha: loc.start.line, coluna: loc.start.column + 1 };
    }
  });

  trocas.sort((a, b) => b.de - a.de);
  let corpo = fonte.replace(/^#!.*/, m => ' '.repeat(m.length));
  for (const t of trocas) corpo = corpo.slice(0, t.de) + t.por + corpo.slice(t.ate);

  return {
    pedidos,
    cabecalho: [...cabeca, ...getters].join(' '),
    corpo,
    awaitNoTopo: temAwaitNoTopo(arvore),
    temSintaxeDeModulo,
    primeiroRequire,
  };
}

/**
 * Um corpo que o V8 consiga compilar, só para pegar a mensagem de um erro de
 * sintaxe de um arquivo que é módulo.
 *
 * Quando o `acorn` não consegue ler o arquivo nem como módulo, não há árvore
 * para traduzir — e a mensagem do V8 sobre o arquivo cru seria "Cannot use
 * import statement outside a module", que esconde o erro de verdade. Aqui as
 * linhas de `import` somem e o `export ` sai da frente, por texto mesmo: o
 * resultado só serve para o V8 dizer, com as palavras dele, o que está errado.
 */
export function corpoParaMensagem(fonte: string): string {
  return fonte.split('\n')
    .map(l => (/^\s*import\s[^(]/.test(l) ? '' : l.replace(/^(\s*)export\s+(default\s+)?/, '$1')))
    .join('\n');
}
