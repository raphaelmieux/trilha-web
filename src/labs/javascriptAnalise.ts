import { parse } from 'acorn';
import { visitar } from './esm';

/**
 * O que um programa de JavaScript tem, lido pela árvore.
 *
 * Pela razão escrita no validador de Python: procurar a palavra `let` acha o
 * `let` dentro de um comentário, de um texto e de uma variável chamada
 * `letreiro`, e nada disso é uma declaração. Quem sabe o que o código tem é o
 * analisador da linguagem — aqui, o `acorn`, que é o mesmo leitor que o
 * ESLint usa por baixo.
 *
 * ── Escrever a palavra é a parte fácil ───────────────────────────────────
 * Toda conta pede uso, e não presença. Função que ninguém chama não conta
 * como função: ela não roda, e o examinador não a verá acontecer. `let` que
 * nunca muda não mostra a diferença para `const`, que é o que o requisito 4.1
 * pede explicar. Método que não usa `this` é uma função pendurada num objeto,
 * e não o que o 4.5 descreve.
 */

type No = Record<string, unknown> & { type: string; start: number; end: number };

/** Os ids que esta análise responde. */
export const IDS_DA_ANALISE = [
  'semVar', 'letEConst', 'igualdadeEstrita', 'seSenao', 'laco',
  'funcaoNomeada', 'funcaoDeSeta', 'usaMap', 'usaFilter', 'usaReduce',
  'objetoComMetodo', 'promessaPropria', 'asyncAwait', 'trataErroDaPromessa',
  'leArquivo', 'gravaArquivo', 'jsonParse', 'jsonStringify', 'tresFuncoes',
] as const;
export type IdDaAnalise = typeof IDS_DA_ANALISE[number];

export interface AnaliseDeJavascript {
  achados: Record<IdDaAnalise, boolean>;
  /** Os arquivos que o leitor não conseguiu ler — o erro em si aparece ao executar. */
  ilegiveis: string[];
}

function ler(fonte: string): No | null {
  for (const sourceType of ['script', 'module'] as const) {
    try {
      return parse(fonte, { ecmaVersion: 'latest', sourceType, allowHashBang: true }) as unknown as No;
    } catch { /* tenta o outro */ }
  }
  return null;
}

const ehFuncao = (n: No) => n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression'
  || n.type === 'ArrowFunctionExpression';

/** Corpo que faz alguma coisa: bloco com pelo menos uma instrução, ou expressão. */
const corpoCheio = (corpo: unknown): boolean => {
  const c = corpo as No | null;
  if (!c) return false;
  if (c.type === 'BlockStatement') return (c.body as No[]).some(s => s.type !== 'EmptyStatement');
  return c.type !== 'EmptyStatement';
};

const nomeDoMembro = (m: No): string | null => {
  if (m.type !== 'MemberExpression') return null;
  const p = m.property as No;
  if (!m.computed && p.type === 'Identifier') return String(p.name);
  if (m.computed && p.type === 'Literal' && typeof p.value === 'string') return p.value;
  return null;
};

const ehAnaliseVazia = (): Record<IdDaAnalise, boolean> =>
  Object.fromEntries(IDS_DA_ANALISE.map(id => [id, false])) as Record<IdDaAnalise, boolean>;

/**
 * Lê os arquivos que a pessoa escreveu e diz o que há neles.
 *
 * As contas são sobre o conjunto: o requisito 7 aceita as três funções
 * espalhadas por dois arquivos, e a função definida num e chamada no outro
 * precisa contar como chamada.
 */
export function analisarJavascript(fontes: Record<string, string>): AnaliseDeJavascript {
  const achados = ehAnaliseVazia();
  const ilegiveis: string[] = [];
  const arvores: No[] = [];
  for (const [nome, fonte] of Object.entries(fontes)) {
    const a = ler(fonte);
    if (a) arvores.push(a); else ilegiveis.push(nome);
  }
  if (arvores.length === 0) return { achados, ilegiveis };

  /* Uma passada que junta o que as contas precisam. */
  const declaradas: { tipo: 'var' | 'let' | 'const'; nomes: string[] }[] = [];
  const reatribuidas = new Set<string>();
  const chamadas = new Set<string>();
  const chamadasDeMembro = new Set<string>();
  const funcoesProprias: { nome: string; cheia: boolean }[] = [];
  let igualdadeFrouxa = false;
  let igualdadeEstrita = false;

  const nomesDoPadrao = (p: unknown, nomes: string[]) => {
    const n = p as No | null;
    if (!n) return;
    if (n.type === 'Identifier') nomes.push(String(n.name));
    else if (n.type === 'ObjectPattern') for (const pr of n.properties as No[]) nomesDoPadrao(pr.type === 'RestElement' ? pr.argument : pr.value, nomes);
    else if (n.type === 'ArrayPattern') for (const el of n.elements as No[]) nomesDoPadrao(el, nomes);
    else if (n.type === 'RestElement') nomesDoPadrao(n.argument, nomes);
    else if (n.type === 'AssignmentPattern') nomesDoPadrao(n.left, nomes);
  };

  for (const arvore of arvores) {
    visitar(arvore, raw => {
      const n = raw as unknown as No;
      switch (n.type) {
        case 'VariableDeclaration': {
          const nomes: string[] = [];
          for (const d of n.declarations as No[]) {
            nomesDoPadrao(d.id, nomes);
            const init = d.init as No | null;
            if ((d.id as No).type === 'Identifier' && init
              && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
              funcoesProprias.push({ nome: String((d.id as No).name), cheia: corpoCheio(init.body) });
            }
          }
          declaradas.push({ tipo: n.kind as 'var' | 'let' | 'const', nomes });
          break;
        }
        case 'FunctionDeclaration':
          if (n.id) funcoesProprias.push({ nome: String((n.id as No).name), cheia: corpoCheio(n.body) });
          break;
        case 'AssignmentExpression': {
          const nomes: string[] = [];
          nomesDoPadrao(n.left, nomes);
          for (const x of nomes) reatribuidas.add(x);
          break;
        }
        case 'UpdateExpression':
          if ((n.argument as No).type === 'Identifier') reatribuidas.add(String((n.argument as No).name));
          break;
        case 'BinaryExpression':
          if (n.operator === '==' || n.operator === '!=') igualdadeFrouxa = true;
          if (n.operator === '===' || n.operator === '!==') igualdadeEstrita = true;
          break;
        case 'CallExpression': {
          const c = n.callee as No;
          if (c.type === 'Identifier') chamadas.add(String(c.name));
          const m = nomeDoMembro(c);
          if (m) chamadasDeMembro.add(m);
          break;
        }
        default: break;
      }
    });
  }

  const doTipo = (t: 'var' | 'let' | 'const') => declaradas.filter(d => d.tipo === t).flatMap(d => d.nomes);
  const lets = doTipo('let');
  const consts = doTipo('const');
  achados.semVar = doTipo('var').length === 0 && lets.length + consts.length > 0;
  achados.letEConst = lets.some(n => reatribuidas.has(n)) && consts.some(n => !reatribuidas.has(n));
  achados.igualdadeEstrita = igualdadeEstrita && !igualdadeFrouxa;

  const chamada = (nome: string) => chamadas.has(nome);
  const proprias = funcoesProprias.filter(f => f.cheia && chamada(f.nome));
  achados.tresFuncoes = new Set(proprias.map(f => f.nome)).size >= 3;

  for (const arvore of arvores) {
    visitar(arvore, raw => {
      const n = raw as unknown as No;
      switch (n.type) {
        case 'IfStatement':
          if (corpoCheio(n.consequent) && corpoCheio(n.alternate)) achados.seSenao = true;
          break;
        case 'ForStatement': case 'ForOfStatement': case 'ForInStatement':
        case 'WhileStatement': case 'DoWhileStatement':
          if (corpoCheio(n.body)) achados.laco = true;
          break;
        case 'FunctionDeclaration':
          if (n.id && !n.async && corpoCheio(n.body) && chamada(String((n.id as No).name))) achados.funcaoNomeada = true;
          break;
        case 'VariableDeclarator': {
          const init = n.init as No | null;
          if ((n.id as No).type === 'Identifier' && init?.type === 'ArrowFunctionExpression'
            && corpoCheio(init.body) && chamada(String((n.id as No).name))) achados.funcaoDeSeta = true;
          break;
        }
        case 'CallExpression': {
          const m = nomeDoMembro(n.callee as No);
          const args = n.arguments as No[];
          const funcaoNoPrimeiro = args[0] && (ehFuncao(args[0]) || args[0].type === 'Identifier');
          if (m === 'map' && funcaoNoPrimeiro) achados.usaMap = true;
          if (m === 'filter' && funcaoNoPrimeiro) achados.usaFilter = true;
          /* Sem o valor inicial, o `reduce` de um arranjo vazio estoura — e é
             exatamente o arranjo que a lista filtrada vira no dia em que
             ninguém pagou. */
          if (m === 'reduce' && funcaoNoPrimeiro && args.length >= 2) achados.usaReduce = true;
          /* O fs se chama dos dois jeitos: fs.readFileSync, ou readFileSync
             sozinho depois de import { readFileSync } — que é o que a lição
             ensina. */
          const solto = (n.callee as No).type === 'Identifier' ? String((n.callee as No).name) : null;
          const doFs = m ?? solto;
          if ((doFs === 'readFileSync' || doFs === 'readFile') && args.length) achados.leArquivo = true;
          if ((doFs === 'writeFileSync' || doFs === 'writeFile') && args.length >= 2) achados.gravaArquivo = true;
          const objeto = (n.callee as No).type === 'MemberExpression' ? ((n.callee as No).object as No) : null;
          if (objeto?.type === 'Identifier' && objeto.name === 'JSON') {
            if (m === 'parse') achados.jsonParse = true;
            if (m === 'stringify') achados.jsonStringify = true;
          }
          if (m === 'catch' && args.length && ehFuncao(args[0]) && corpoCheio((args[0]).body)) achados.trataErroDaPromessa = true;
          break;
        }
        case 'NewExpression': {
          const c = n.callee as No;
          const exec = (n.arguments as No[])[0];
          if (c.type === 'Identifier' && c.name === 'Promise' && exec && ehFuncao(exec)
            && (exec.params as No[]).length >= 1 && corpoCheio(exec.body)) achados.promessaPropria = true;
          break;
        }
        case 'AwaitExpression':
          achados.asyncAwait = true;
          break;
        case 'TryStatement': {
          let temAwait = false;
          visitar(n.block, x => { if ((x as unknown as No).type === 'AwaitExpression') temAwait = true; });
          const tratador = n.handler as No | null;
          if (temAwait && tratador && corpoCheio(tratador.body)) achados.trataErroDaPromessa = true;
          break;
        }
        case 'ObjectExpression': {
          const props = (n.properties as No[]).filter(p => p.type === 'Property');
          const valor = (p: No) => p.value as No;
          const dados = props.filter(p => !ehFuncao(valor(p)));
          const metodos = props.filter(p => {
            const v = valor(p);
            /* Seta não tem `this` próprio: um "método" de seta lê o `this` de
               fora, e é o engano que a lição de objetos existe para mostrar. */
            if (v.type !== 'FunctionExpression') return false;
            let usaThis = false;
            visitar(v.body, x => { if ((x as unknown as No).type === 'ThisExpression') usaThis = true; },
              x => { const y = x as unknown as No; return y !== v.body && (y.type === 'FunctionExpression' || y.type === 'FunctionDeclaration'); });
            const nome = (p.key as No).type === 'Identifier' ? String((p.key as No).name) : String((p.key as No).value);
            return usaThis && chamadasDeMembro.has(nome);
          });
          if (dados.length >= 2 && metodos.length >= 1) achados.objetoComMetodo = true;
          break;
        }
        default: break;
      }
    });
  }

  return { achados, ilegiveis };
}
