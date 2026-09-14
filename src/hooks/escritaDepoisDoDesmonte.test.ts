import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import ts from 'typescript';

/*
  Nada escreve estado numa tela que já saiu.

  ── O erro ────────────────────────────────────────────────────────────────
  Um efeito busca alguma coisa e escreve o resultado. A pessoa sai da tela
  antes da resposta. A resposta chega, e o `setX` cai num componente que não
  existe mais.

  No navegador isso é desperdício e nada mais — o React ignora e segue. Num
  ambiente já desmontado é **erro**: ele procura o `window` para decidir a
  prioridade da atualização e não acha. O `ci.yml` reprovou duas vezes assim,
  com todos os testes passando e nenhuma asserção quebrada — a execução saía
  vermelha por uma rejeição não tratada depois do fim de um arquivo de teste.
  É a pior forma de reprovar, porque tem cara de flake: ganha-se a corrida numa
  máquina e perde-se noutra, e ninguém desconfia do código.

  ── Por que ler a árvore, e não procurar texto ────────────────────────────
  O que se procura é uma relação entre três coisas em posições diferentes — um
  `await`, um `setX` depois dele, e uma guarda entre os dois. Busca de texto
  não enxerga posição relativa, e a alternativa seria uma expressão regular que
  aprova pela presença de um `if` qualquer em qualquer lugar do arquivo. Uma
  trava que aprova por engano é pior do que trava nenhuma: ela diz que
  conferiu. O compilador do TypeScript já está aqui como dependência de
  desenvolvimento, e responde isso sem chute.

  ── O que conta como trabalho que começa sozinho ──────────────────────────
  Só o que um `useEffect` alcança. Manipulador de clique também escreve estado
  depois de esperar, e ali a tela está na frente de quem clicou — cobrar guarda
  de todo `async` do repositório encheria a trava de ruído e ensinaria a
  contorná-la. Efeito é diferente: ele dispara ao montar, sem ninguém pedir, e
  continua correndo depois que a pessoa foi embora.

  Alcança também a função declarada no mesmo arquivo que o efeito chama — é
  onde o `refresh` destes ganchos mora, e ele é chamado do efeito **e** da
  tela.
*/

function arquivosDeFonte(dir: string): string[] {
  return readdirSync(dir).flatMap(nome => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeFonte(caminho);
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : [];
  });
}

const RAIZ = resolve(__dirname, '..');

/* `setInterval` e `setTimeout` casam com o padrão de setter e não são estado.
   Sem esta lista a trava acusaria todo efeito que agenda alguma coisa. */
const RELOGIOS = new Set(['setInterval', 'setTimeout', 'setImmediate']);
const ehSetter = (nome: string) => /^set[A-Z]/.test(nome) && !RELOGIOS.has(nome);

/** Percorre o nó e tudo abaixo dele. */
function cada(no: ts.Node, f: (n: ts.Node) => void): void {
  f(no);
  ts.forEachChild(no, filho => cada(filho, f));
}

const ehFuncao = (n: ts.Node): n is ts.ArrowFunction | ts.FunctionExpression =>
  ts.isArrowFunction(n) || ts.isFunctionExpression(n);

const chamadaDe = (n: ts.Node, nome: string): ts.CallExpression | undefined =>
  ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === nome ? n : undefined;

/**
 * Os nomes que, neste arquivo, sabem que a tela saiu.
 *
 * São dois jeitos de saber, e os dois valem: a variável que a limpeza de um
 * efeito apaga (`let vivo = true` … `return () => { vivo = false }`), e o ref
 * de `useMontado`, que é o mesmo em forma de ref para quando a função que
 * escreve o estado é devolvida ao chamador.
 */
function guardasDoArquivo(sf: ts.SourceFile): Set<string> {
  const guardas = new Set<string>();

  cada(sf, no => {
    const efeito = chamadaDe(no, 'useEffect');
    if (!efeito?.arguments[0] || !ehFuncao(efeito.arguments[0])) return;
    cada(efeito.arguments[0], n => {
      if (!ts.isReturnStatement(n) || !n.expression || !ehFuncao(n.expression)) return;
      cada(n.expression, atrib => {
        if (!ts.isBinaryExpression(atrib) || atrib.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return;
        if (ts.isIdentifier(atrib.left)) guardas.add(atrib.left.text);
        /* `montado.current = false` registra `montado`, que é como o nome
           aparece na conferência lá na frente. */
        if (ts.isPropertyAccessExpression(atrib.left) && ts.isIdentifier(atrib.left.expression)) {
          guardas.add(atrib.left.expression.text);
        }
      });
    });
  });

  cada(sf, no => {
    if (!ts.isVariableDeclaration(no) || !ts.isIdentifier(no.name) || !no.initializer) return;
    if (chamadaDe(no.initializer, 'useMontado')) guardas.add(no.name.text);
  });

  return guardas;
}

/** As funções do arquivo que um efeito pode chamar pelo nome. */
function corposPorNome(sf: ts.SourceFile): Map<string, ts.Node> {
  const corpos = new Map<string, ts.Node>();
  cada(sf, no => {
    if (!ts.isVariableDeclaration(no) || !ts.isIdentifier(no.name) || !no.initializer) return;
    let ini: ts.Node = no.initializer;
    const envolto = chamadaDe(ini, 'useCallback');
    if (envolto?.arguments[0]) ini = envolto.arguments[0];
    if (ehFuncao(ini)) corpos.set(no.name.text, ini);
  });
  return corpos;
}

interface Achado {
  onde: string;
  setters: string[];
  protegido: boolean;
}

function achados(): Achado[] {
  const todos: Achado[] = [];

  for (const arquivo of arquivosDeFonte(RAIZ)) {
    const fonte = readFileSync(arquivo, 'utf8');
    const sf = ts.createSourceFile(arquivo, fonte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const guardas = guardasDoArquivo(sf);
    const corpos = corposPorNome(sf);

    cada(sf, no => {
      const efeito = chamadaDe(no, 'useEffect');
      if (!efeito?.arguments[0]) return;

      /* O corpo do efeito, mais o que ele chama e que mora neste arquivo. */
      const alcancaveis = new Set<ts.Node>([efeito.arguments[0]]);
      cada(efeito.arguments[0], n => {
        if (!ts.isIdentifier(n)) return;
        const corpo = corpos.get(n.text);
        if (corpo && corpo !== efeito.arguments[0]) alcancaveis.add(corpo);
      });

      for (const corpo of alcancaveis) {
        let primeiroAwait = Infinity;
        const setters: ts.CallExpression[] = [];
        cada(corpo, n => {
          if (ts.isAwaitExpression(n)) primeiroAwait = Math.min(primeiroAwait, n.getStart(sf));
          if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && ehSetter(n.expression.text)) setters.push(n);
        });

        /* `setX(await f())` não tem onde receber guarda: a espera acontece
           dentro do próprio setter. Conserta-se partindo em duas linhas, e por
           isso ele conta como arriscado e nunca como protegido. */
        const esperaDentro = (s: ts.Node) => {
          let achou = false;
          cada(s, n => { if (ts.isAwaitExpression(n)) achou = true; });
          return achou;
        };

        const arriscados = setters.filter(s => s.getStart(sf) > primeiroAwait || esperaDentro(s));
        if (!arriscados.length) continue;

        const ultimo = Math.max(...arriscados.map(s => s.getStart(sf)));
        let protegido = false;
        cada(corpo, n => {
          if (!ts.isIdentifier(n) || !guardas.has(n.text)) return;
          const pos = n.getStart(sf);
          if (pos > primeiroAwait && pos < ultimo) protegido = true;
        });
        if (arriscados.some(esperaDentro)) protegido = false;

        const linha = sf.getLineAndCharacterOfPosition(corpo.getStart(sf)).line + 1;
        todos.push({
          onde: `${relative(RAIZ, arquivo)}:${linha}`,
          setters: [...new Set(arriscados.map(s => s.expression.getText(sf)))],
          protegido,
        });
      }
    });
  }

  return todos;
}

describe('ninguém escreve estado depois do desmonte', () => {
  const todos = achados();

  /*
    A guarda contra o vazio, que é a de sempre.

    Se a leitura parar de achar efeito nenhum — um caminho errado, um `useEffect`
    envolvido por outra coisa —, a trava fica verde por não ter conferido nada,
    que é indistinguível de estar tudo certo. É a mesma armadilha do "zero link
    não é zero link quebrado", aplicada à própria trava.
  */
  it('acha os efeitos que buscam e escrevem', () => {
    expect(todos.length, 'a leitura da árvore não achou efeito nenhum que escreva depois de esperar')
      .toBeGreaterThanOrEqual(15);
  });

  it('todo efeito que escreve depois de esperar sabe que a tela pode ter saído', () => {
    const sem = todos.filter(a => !a.protegido);
    expect(
      sem.map(a => `${a.onde} — escreve ${a.setters.join(', ')} depois de esperar, sem guarda`),
      'estado escrito depois do desmonte: ver useMontado',
    ).toEqual([]);
  });
});
