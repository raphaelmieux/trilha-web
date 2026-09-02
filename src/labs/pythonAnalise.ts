/**
 * As duas peças do Python que se testam sem navegador.
 *
 * Elas moram fora de `pythonWorker.ts` porque aquele arquivo mexe em `self` ao
 * ser carregado: importá-lo num teste de node explodiria antes da primeira
 * asserção. O que se ganha é o que importa — o analisador é o coração do
 * validador, e aqui ele roda contra o Python de verdade.
 */

/*
  O que o desbravador vê do erro é só o que é dele.

  O traceback do Pyodide começa dentro do próprio Pyodide — `_pyodide/_base.py`,
  `eval(self.code...)` — e nada disso é do programa de quem escreveu. Mostrar
  aquilo a alguém de doze anos ensina que mensagem de erro é ruído a ignorar,
  que é o oposto do requisito 6. Ficam as linhas do arquivo do usuário e a
  última, que é a que nomeia o erro.
*/
export function apararTraceback(bruto: string): string {
  const linhas = bruto.replace(/\r/g, '').split('\n').filter(l => l.trim().length > 0);
  const daPessoa: string[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (/^\s*File "<exec>"/.test(l)) {
      daPessoa.push(l.replace('<exec>', 'programa.py'));
      /* A linha do código e o acento circunflexo vêm logo abaixo, e são
         justamente o que aponta o lugar do erro. */
      for (let j = i + 1; j < linhas.length && !/^\s*File "/.test(linhas[j]); j++) {
        if (/^[A-Za-z_]*(Error|Exception|Warning|KeyboardInterrupt)\b/.test(linhas[j].trim())) break;
        daPessoa.push(linhas[j]);
      }
    }
  }
  const ultima = linhas[linhas.length - 1] ?? '';
  const corpo = daPessoa.length > 0 ? [...daPessoa, ultima] : [ultima];
  return corpo.join('\n');
}

/*
  A análise usa o `ast` do próprio Python, e não busca de texto.

  É a mesma lição do validador de CSS: quem sabe o que o código tem é o
  analisador da linguagem. Procurar a palavra "while" acha o `while` que está
  dentro de um comentário, dentro de uma string, e dentro da palavra "enquanto"
  escrita em inglês — e não acha nada disso o programa faz.

  E toda estrutura precisa ter corpo de verdade: um `while` cujo corpo é só
  `pass` não repete coisa nenhuma, do mesmo modo que o laço vazio dos blocos.
*/
export const ANALISADOR = `
import ast, json

def _corpo_util(corpo):
    return any(not isinstance(no, ast.Pass) for no in corpo)

def _erro_de_sintaxe(e):
    # A linha, a coluna e o trecho são os do programa da pessoa. O traceback
    # que o Python monta aqui é do NOSSO script, e apontá-lo diria "linha 73"
    # num programa de duas linhas — o que é pior do que não dizer nada.
    return {
        'linha': e.lineno or 0,
        'coluna': e.offset or 0,
        # rstrip() sem argumento de propósito: este texto vive dentro de um
        # template literal do TypeScript, e ali uma barra-n vira quebra de
        # linha de verdade antes de chegar ao Python — quebra dentro de aspas
        # simples é erro de sintaxe no nosso próprio analisador.
        'trecho': (e.text or '').rstrip(),
        'msg': e.msg or 'erro de sintaxe',
    }

def analisar(fonte):
    achados = {
        'tipoInteiro': False, 'tipoDecimal': False, 'tipoTexto': False,
        'tipoBooleano': False, 'operadorAritmetico': False,
        'operadorComparacao': False, 'condicionalCompleto': False,
        'lacoFor': False, 'lacoWhile': False, 'leEExibe': False,
    }
    arvore = ast.parse(fonte)

    leu = escreveu = False
    for no in ast.walk(arvore):
        if isinstance(no, ast.Assign) or isinstance(no, ast.AnnAssign):
            valor = no.value
            if isinstance(valor, ast.Constant):
                v = valor.value
                if isinstance(v, bool):
                    achados['tipoBooleano'] = True
                elif isinstance(v, int):
                    achados['tipoInteiro'] = True
                elif isinstance(v, float):
                    achados['tipoDecimal'] = True
                elif isinstance(v, str):
                    achados['tipoTexto'] = True
            # int(input(...)) e float(input(...)) também declaram o tipo
            if isinstance(valor, ast.Call) and isinstance(valor.func, ast.Name):
                if valor.func.id == 'int':
                    achados['tipoInteiro'] = True
                elif valor.func.id == 'float':
                    achados['tipoDecimal'] = True
                elif valor.func.id == 'str':
                    achados['tipoTexto'] = True
                elif valor.func.id == 'bool':
                    achados['tipoBooleano'] = True
                elif valor.func.id == 'input':
                    # input() devolve texto, sempre. É o jeito mais comum de
                    # uma variável de texto nascer num programa desta vereda.
                    achados['tipoTexto'] = True

        if isinstance(no, ast.BinOp) and isinstance(
            no.op, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow)
        ):
            achados['operadorAritmetico'] = True

        if isinstance(no, ast.Compare):
            achados['operadorComparacao'] = True

        if isinstance(no, ast.For) and _corpo_util(no.body):
            achados['lacoFor'] = True

        if isinstance(no, ast.While) and _corpo_util(no.body):
            achados['lacoWhile'] = True

        # if ... elif ... else: o elif é um If dentro do orelse do primeiro,
        # e o else é o orelse desse segundo. Os tres precisam existir e fazer algo.
        if isinstance(no, ast.If) and _corpo_util(no.body):
            senao = no.orelse
            if len(senao) == 1 and isinstance(senao[0], ast.If):
                elif_ = senao[0]
                if _corpo_util(elif_.body) and elif_.orelse and _corpo_util(elif_.orelse):
                    achados['condicionalCompleto'] = True

        if isinstance(no, ast.Call) and isinstance(no.func, ast.Name):
            if no.func.id == 'input':
                leu = True
            elif no.func.id == 'print':
                escreveu = True

    achados['leEExibe'] = leu and escreveu
    return achados

def _tudo(fonte):
    try:
        return {'ok': True, 'achados': analisar(fonte)}
    except SyntaxError as e:
        return {'ok': False, 'erro': _erro_de_sintaxe(e)}

json.dumps(_tudo(_fonte))
`;

/** O que o analisador devolve: ou a árvore lida, ou o erro de sintaxe da pessoa. */
export type SaidaDaAnalise =
  | { ok: true; achados: Record<string, boolean> }
  | { ok: false; erro: { linha: number; coluna: number; trecho: string; msg: string } };

/**
 * Escreve o erro de sintaxe como o Python o escreveria, com a linha certa.
 *
 * A primeira versão deixava o traceback do próprio analisador chegar à tela, e
 * ele dizia `line 73` num programa de duas linhas — 73 é uma linha do nosso
 * script, não do dela. Errar a linha é pior do que não dizer nada: manda
 * procurar onde não há nada para achar, e o requisito 6 é justamente ler essa
 * mensagem.
 */
export function erroDeSintaxeEmTexto(
  e: { linha: number; coluna: number; trecho: string; msg: string },
): string {
  const linhas = [`  File "programa.py", line ${e.linha}`];
  if (e.trecho) {
    linhas.push(`    ${e.trecho.trim()}`);
    /* O circunflexo aponta a coluna, contada a partir de 1 pelo Python. O
       recuo do trecho foi tirado acima, então a coluna anda junto. */
    const recuoOriginal = e.trecho.length - e.trecho.trimStart().length;
    const coluna = Math.max(0, (e.coluna || 1) - 1 - recuoOriginal);
    linhas.push(`    ${' '.repeat(coluna)}^`);
  }
  linhas.push(`SyntaxError: ${e.msg}`);
  return linhas.join('\n');
}
