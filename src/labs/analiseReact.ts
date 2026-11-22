import type * as TS from 'typescript';
import type { ModuloTs } from './compiladorTs';

/**
 * O que um arquivo de React declara, lido pela árvore do próprio compilador.
 *
 * As tarefas da CC-FE006 se conferem rodando a página, porque há muitos
 * componentes certos para a mesma tela. Mas três perguntas a página não
 * responde sozinha. "Descreveu a tela, ou foi mexer no DOM?" — a lista
 * aparece igual pelos dois caminhos, e o requisito 3 é a diferença entre
 * eles. "O componente recebe o que desenha, ou vai buscar sozinho?" — o
 * cartão que importa os dados por conta própria desenha certo e não recebe
 * propriedade nenhuma. "O efeito depende de quê?" — o título certo sai de um
 * efeito e sai também de uma atribuição no meio do corpo, que roda a cada
 * desenho.
 *
 * É só a árvore, como em `analiseTs.ts`: nada aqui diz se um tipo está
 * certo, que isso é do compilador.
 */

export interface ComponenteDeReact {
  nome: string;
  /** O primeiro parâmetro tem tipo escrito — ou o componente é tipado por fora, como `FC<Props>`. */
  propriedadesTipadas: boolean;
  /** Quantos parâmetros o componente declara. */
  parametros: number;
  /** Usa `children` em algum lugar do corpo. */
  usaChildren: boolean;
}

export interface EfeitoDeReact {
  /** Os nomes da lista de dependências, ou `null` quando não há lista. */
  dependencias: string[] | null;
  /** O corpo atribui `document.title`. */
  mudaOTitulo: boolean;
  /** O corpo devolve uma função de limpeza. */
  limpa: boolean;
}

export interface AnaliseDeReact {
  /** Os módulos que o arquivo importa, como escritos: `react`, `./dados`. */
  importa: string[];
  /** Quantas vezes o arquivo fala com o `document` — o caminho da CC-FE004. */
  usosDoDocumento: number;
  /** As atribuições a `document.title` fora de um efeito — no corpo, que roda a cada desenho. */
  tituloForaDeEfeito: number;
  componentes: ComponenteDeReact[];
  /** Quantas vezes cada componente aparece no JSX, pelo nome: `{ Botao: 3 }`. */
  usosDeComponente: Record<string, number>;
  /** Quantas vezes cada elemento do HTML aparece no JSX: `{ button: 1 }`. */
  usosDeElemento: Record<string, number>;
  /** Os ganchos chamados, com quantas vezes: `{ useState: 2 }`. */
  ganchos: Record<string, number>;
  efeitos: EfeitoDeReact[];
  /** Algum `key` no JSX que é o índice do `map` — a chave que muda quando a lista muda. */
  chaveDeIndice: boolean;
}

const ehComponente = (nome: string) => /^[A-Z]/.test(nome);

export function analisarReact(ts: ModuloTs, texto: string, nome = 'App.tsx'): AnaliseDeReact {
  const fonte = ts.createSourceFile(nome, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const a: AnaliseDeReact = {
    importa: [], usosDoDocumento: 0, tituloForaDeEfeito: 0, componentes: [], usosDeComponente: {},
    usosDeElemento: {}, ganchos: {}, efeitos: [], chaveDeIndice: false,
  };

  const temJsx = (n: TS.Node): boolean => {
    let achou = false;
    const andar = (x: TS.Node) => {
      if (achou) return;
      if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x) || ts.isJsxFragment(x)) { achou = true; return; }
      ts.forEachChild(x, andar);
    };
    andar(n);
    return achou;
  };

  const usaNome = (n: TS.Node, alvo: string): boolean => {
    let achou = false;
    const andar = (x: TS.Node) => {
      if (achou) return;
      if (ts.isIdentifier(x) && x.text === alvo) { achou = true; return; }
      ts.forEachChild(x, andar);
    };
    andar(n);
    return achou;
  };

  const registrarComponente = (nomeDoComponente: string, f: TS.SignatureDeclaration & { body?: TS.Node }, tipadoPorFora: boolean) => {
    if (!ehComponente(nomeDoComponente) || !f.body || !temJsx(f.body)) return;
    const p = f.parameters[0];
    a.componentes.push({
      nome: nomeDoComponente,
      propriedadesTipadas: tipadoPorFora || (!!p && !!p.type),
      parametros: f.parameters.length,
      usaChildren: usaNome(f, 'children'),
    });
  };

  /* O efeito em que um nó está, se estiver: o primeiro argumento de um `useEffect`. */
  const dentroDeEfeito = (n: TS.Node): boolean => {
    for (let x: TS.Node | undefined = n.parent; x; x = x.parent) {
      if (ts.isCallExpression(x) && ts.isIdentifier(x.expression) && /^use(Layout)?Effect$/.test(x.expression.text)
        && x.arguments[0] && n.pos >= x.arguments[0].pos && n.end <= x.arguments[0].end) return true;
    }
    return false;
  };

  const andar = (n: TS.Node) => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) a.importa.push(n.moduleSpecifier.text);

    if (ts.isFunctionDeclaration(n) && n.name) registrarComponente(n.name.text, n, false);
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer
      && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) {
      registrarComponente(n.name.text, n.initializer, !!n.type);
    }

    if (ts.isIdentifier(n) && n.text === 'document' && !(ts.isPropertyAccessExpression(n.parent) && n.parent.name === n)) {
      a.usosDoDocumento++;
    }
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && ts.isPropertyAccessExpression(n.left) && n.left.name.text === 'title'
      && ts.isIdentifier(n.left.expression) && n.left.expression.text === 'document' && !dentroDeEfeito(n)) {
      a.tituloForaDeEfeito++;
    }

    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText(fonte);
      const alvo = ehComponente(tag) || tag.includes('.') ? a.usosDeComponente : a.usosDeElemento;
      alvo[tag] = (alvo[tag] ?? 0) + 1;
      for (const at of n.attributes.properties) {
        if (!ts.isJsxAttribute(at) || at.name.getText(fonte) !== 'key' || !at.initializer || !ts.isJsxExpression(at.initializer) || !at.initializer.expression) continue;
        const e = at.initializer.expression;
        /* A chave é o segundo parâmetro do `map` que envolve o elemento? */
        for (let x: TS.Node | undefined = n.parent; x; x = x.parent) {
          if ((ts.isArrowFunction(x) || ts.isFunctionExpression(x)) && ts.isCallExpression(x.parent)
            && ts.isPropertyAccessExpression(x.parent.expression) && x.parent.expression.name.text === 'map') {
            const indice = x.parameters[1];
            if (indice && ts.isIdentifier(indice.name) && usaNome(e, indice.name.text)) a.chaveDeIndice = true;
            break;
          }
        }
      }
    }

    if (ts.isCallExpression(n)) {
      const nomeDaChamada = ts.isIdentifier(n.expression) ? n.expression.text
        : ts.isPropertyAccessExpression(n.expression) ? n.expression.name.text : '';
      if (/^use[A-Z]/.test(nomeDaChamada)) a.ganchos[nomeDaChamada] = (a.ganchos[nomeDaChamada] ?? 0) + 1;
      if (/^use(Layout)?Effect$/.test(nomeDaChamada) && n.arguments[0]) {
        const corpo = n.arguments[0];
        const deps = n.arguments[1];
        let mudaOTitulo = false;
        const procurar = (x: TS.Node) => {
          if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken
            && ts.isPropertyAccessExpression(x.left) && x.left.name.text === 'title') mudaOTitulo = true;
          ts.forEachChild(x, procurar);
        };
        procurar(corpo);
        let limpa = false;
        if ((ts.isArrowFunction(corpo) || ts.isFunctionExpression(corpo)) && ts.isBlock(corpo.body)) {
          for (const s of corpo.body.statements) {
            if (ts.isReturnStatement(s) && s.expression && (ts.isArrowFunction(s.expression) || ts.isFunctionExpression(s.expression) || ts.isIdentifier(s.expression))) limpa = true;
          }
        }
        a.efeitos.push({
          dependencias: deps && ts.isArrayLiteralExpression(deps) ? deps.elements.map(e => e.getText(fonte)) : null,
          mudaOTitulo,
          limpa,
        });
      }
    }
    ts.forEachChild(n, andar);
  };
  andar(fonte);
  return a;
}
