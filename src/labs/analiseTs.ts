import type * as TS from 'typescript';
import type { ModuloTs } from './compiladorTs';

/**
 * O que um arquivo de TypeScript declara, lido pela árvore do próprio
 * compilador.
 *
 * As tarefas da CC-FE005 perguntam coisas que a compilação sozinha não
 * responde: "o parâmetro tem tipo?" passa limpo num arquivo sem função
 * nenhuma, e "não há erro" passa num arquivo cheio de `any`. A análise conta
 * o que foi escrito, e a compilação diz se o escrito fecha — as duas juntas.
 *
 * É só a árvore, sem o verificador de tipos: rápida, e roda no mesmo worker
 * que compila. Nada aqui diz se um tipo está certo; isso é do compilador.
 */

export interface MembroDeInterface { nome: string; tipo: string; opcional: boolean }

export interface AnaliseDeTs {
  /** Parâmetros sem tipo escrito, fora das funções passadas como argumento — essas recebem o tipo de quem chama. */
  parametrosSemTipo: string[];
  /** Funções declaradas, e se cada uma diz o que devolve. */
  funcoes: { nome: string; temRetorno: boolean; parametrosDeTipo: string[]; tiposDosParametros: string[] }[];
  interfaces: { nome: string; membros: MembroDeInterface[] }[];
  /** `type X = 'a' | 'b'`, com os membros como escritos. */
  unioes: { nome: string; membros: string[] }[];
  /** Quantas vezes `any` aparece escrito num tipo, inclusive em `as any`. */
  anyEscrito: number;
  /** Comentários que mandam o compilador calar. */
  silenciadores: number;
  /** `x!` — a promessa de que não é nulo, que o compilador aceita sem conferir. */
  naoNulos: number;
  /** `x as T` — idem, para o tipo. */
  afirmacoes: number;
  /** Variáveis com tipo escrito e com valor que já diz o tipo. */
  anotacoesRedundantes: string[];
  /** Variáveis que começam com `[]` sem tipo escrito — o compilador não tem de onde tirar. */
  listasVaziasSemTipo: string[];
  /** As variáveis com tipo escrito, e o tipo. */
  variaveisAnotadas: { nome: string; tipo: string }[];
  /** As chamadas a cada nome, com o texto do primeiro argumento. */
  chamadas: { nome: string; primeiroArgumento: string | null }[];
}

/** O valor que diz o tipo sozinho: literal, conta, chamada. `[]`, `{}` e `null` não dizem. */
function inicialDizOTipo(ts: ModuloTs, e: TS.Expression): boolean {
  if (ts.isArrayLiteralExpression(e)) return e.elements.length > 0;
  if (ts.isObjectLiteralExpression(e)) return e.properties.length > 0;
  if (e.kind === ts.SyntaxKind.NullKeyword) return false;
  if (ts.isIdentifier(e) && e.text === 'undefined') return false;
  return true;
}

export function analisarTs(ts: ModuloTs, texto: string, nome = 'programa.ts'): AnaliseDeTs {
  const fonte = ts.createSourceFile(nome, texto, ts.ScriptTarget.Latest, true);
  const a: AnaliseDeTs = {
    parametrosSemTipo: [], funcoes: [], interfaces: [], unioes: [], anyEscrito: 0, silenciadores: 0,
    naoNulos: 0, afirmacoes: 0, anotacoesRedundantes: [], listasVaziasSemTipo: [], variaveisAnotadas: [], chamadas: [],
  };
  a.silenciadores = (texto.match(/\/\/\s*@ts-(ignore|expect-error|nocheck)/g) ?? []).length;

  const nomeDaFuncao = (n: TS.FunctionLikeDeclaration): string => {
    if (n.name && ts.isIdentifier(n.name)) return n.name.text;
    if (ts.isVariableDeclaration(n.parent) && ts.isIdentifier(n.parent.name)) return n.parent.name.text;
    return '(anônima)';
  };
  const ehArgumento = (n: TS.Node) => ts.isCallExpression(n.parent) && n.parent.arguments.some(x => x === n);

  const visitar = (n: TS.Node): void => {
    if (n.kind === ts.SyntaxKind.AnyKeyword) a.anyEscrito++;
    if (ts.isNonNullExpression(n)) a.naoNulos++;
    if (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) {
      if (!(ts.isAsExpression(n) && ts.isTypeReferenceNode(n.type) && n.type.typeName.getText() === 'const')) a.afirmacoes++;
    }

    if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n)) {
      const nomeF = nomeDaFuncao(n);
      if (!ehArgumento(n)) {
        for (const p of n.parameters) if (!p.type) a.parametrosSemTipo.push(`${nomeF}: ${p.name.getText()}`);
        a.funcoes.push({
          nome: nomeF,
          temRetorno: !!n.type,
          parametrosDeTipo: (n.typeParameters ?? []).map(t => t.name.text),
          tiposDosParametros: n.parameters.map(p => p.type?.getText() ?? ''),
        });
      }
    }

    if (ts.isInterfaceDeclaration(n)) {
      a.interfaces.push({
        nome: n.name.text,
        membros: n.members.filter(ts.isPropertySignature).map(m => ({
          nome: m.name.getText(), tipo: m.type?.getText() ?? '', opcional: !!m.questionToken,
        })),
      });
    }

    if (ts.isTypeAliasDeclaration(n) && ts.isUnionTypeNode(n.type)) {
      a.unioes.push({ nome: n.name.text, membros: n.type.types.map(t => t.getText()) });
    }

    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      const nomeV = n.name.text;
      if (n.type) {
        a.variaveisAnotadas.push({ nome: nomeV, tipo: n.type.getText() });
        if (n.initializer && inicialDizOTipo(ts, n.initializer)
          && !ts.isArrowFunction(n.initializer) && !ts.isFunctionExpression(n.initializer)) {
          a.anotacoesRedundantes.push(nomeV);
        }
      } else if (n.initializer && ts.isArrayLiteralExpression(n.initializer) && n.initializer.elements.length === 0) {
        a.listasVaziasSemTipo.push(nomeV);
      }
    }

    if (ts.isCallExpression(n)) {
      const alvo = n.expression;
      const nomeC = ts.isIdentifier(alvo) ? alvo.text : ts.isPropertyAccessExpression(alvo) ? alvo.name.text : null;
      if (nomeC) a.chamadas.push({ nome: nomeC, primeiroArgumento: n.arguments[0]?.getText() ?? null });
    }
    ts.forEachChild(n, visitar);
  };
  visitar(fonte);
  return a;
}
