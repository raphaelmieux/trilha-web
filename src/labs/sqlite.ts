/**
 * O banco de dados da CC005, e por que ele é o SQLite do próprio Python.
 *
 * ── Um motor só ──────────────────────────────────────────────────────────
 * O requisito 7 pede um programa Python conectado a um banco, e o Python que a
 * plataforma já roda no navegador traz o `sqlite3` embutido — com o SQLite de
 * verdade dentro, e não uma imitação. O editor de SQL dos outros oito
 * laboratórios usa o mesmo: a consulta que a pessoa escreve no editor é lida
 * pelo mesmo motor que o `cursor.execute` dela vai usar no módulo 9. Dois
 * motores discordariam no primeiro detalhe — o `= NULL`, a afinidade de tipo,
 * a mensagem de erro —, e a pessoa aprenderia um SQL que o programa dela não
 * fala.
 *
 * ── O banco volta ao que era a cada execução ─────────────────────────────
 * É a pasta do Python da CC004 outra vez, pelo motivo escrito em
 * `projetoDePython.ts`: o arquivo `.sql` é a receita inteira, e cada
 * execução parte do banco como a lição o entregou. Sem isso, rodar duas vezes
 * um arquivo de inserções inseriria tudo em dobro, e a verificação mediria a
 * sobra da execução de antes. No banco de verdade não há volta — e a lição do
 * módulo 8 diz isso com todas as letras, porque é por isso que se escreve o
 * `WHERE` antes do resto.
 *
 * ── O código Python é montado aqui, e roda em dois lugares ──────────────
 * O worker do navegador e as travas do repositório executam o **mesmo** texto,
 * montado pelas funções abaixo. Escrito duas vezes, o teste conferiria um
 * motor que a tela não usa.
 */

export type Valor = number | string | null;

export interface ColunaDoBanco {
  nome: string;
  /** O tipo como foi declarado — `INTEGER`, `TEXT`, `DATE` —, ou vazio. */
  tipo: string;
  naoNulo: boolean;
  /** A posição na chave primária, a partir de 1; zero quando não faz parte. */
  chave: number;
}

export interface EstrangeiraDoBanco {
  coluna: string;
  /** A tabela para onde aponta. */
  tabela: string;
  /** A coluna de lá. Vazia quando a declaração não diz, e então é a chave primária. */
  para: string;
}

export interface TabelaDoBanco {
  nome: string;
  sql: string;
  colunas: ColunaDoBanco[];
  estrangeiras: EstrangeiraDoBanco[];
  /** Cada conjunto de colunas declarado único, inclusive o da chave primária. */
  unicos: string[][];
  linhas: Valor[][];
}

export interface EstadoDoBanco {
  tabelas: TabelaDoBanco[];
}

export type TipoDeComando = 'consulta' | 'alteracao' | 'definicao' | 'outro';

export interface ResultadoDoComando {
  /** A linha do arquivo em que o comando começa. */
  linha: number;
  sql: string;
  tipo: TipoDeComando;
  colunas: string[];
  linhas: Valor[][];
  /** Ligado quando a consulta devolveu mais do que se mostra. */
  cortado: boolean;
  /** Quantas linhas o comando inseriu, mudou ou apagou. */
  alteradas: number;
  erro: string | null;
}

export interface ExecucaoDeSql {
  comandos: ResultadoDoComando[];
  /** O primeiro erro, que é onde a execução para — como para em todo editor de banco. */
  erro: { linha: number; mensagem: string } | null;
  /** Ligado quando o arquivo deixou uma transação aberta, que se desfaz ao fechar. */
  transacaoDesfeita: boolean;
  banco: EstadoDoBanco;
}

/** Quantas linhas uma consulta mostra. Acima disso ela é cortada, e diz que foi. */
export const LIMITE_DE_LINHAS = 500;

/**
 * As funções do lado do Python, numa função só.
 *
 * Elas são definidas dentro de `_trilha_motor` para não ficarem soltas no
 * espaço de nomes que o programa da pessoa usa no módulo 9 — é a decisão do
 * preâmbulo de `projetoDePython.ts`, pelo motivo escrito lá: um `import json`
 * deixado aqui em cima faria funcionar no laboratório o programa que esqueceu
 * de importar.
 */
const MOTOR = `
def _trilha_motor():
    import sqlite3, json

    def sem_comentarios(texto):
        # Devolve o texto com os comentários trocados por espaço, e a posição
        # do primeiro caractere que é código. Aspas são respeitadas: um -- dentro
        # de um texto não é comentário.
        saida = []
        i = 0
        primeiro = -1
        n = len(texto)
        while i < n:
            c = texto[i]
            if c == '-' and texto[i:i + 2] == '--':
                fim = texto.find('\\n', i)
                fim = n if fim == -1 else fim
                saida.append(' ' * (fim - i))
                i = fim
                continue
            if c == '/' and texto[i:i + 2] == '/*':
                fim = texto.find('*/', i + 2)
                fim = n if fim == -1 else fim + 2
                saida.append(''.join('\\n' if x == '\\n' else ' ' for x in texto[i:fim]))
                i = fim
                continue
            if c in ("'", '"'):
                j = i + 1
                while j < n:
                    if texto[j] == c:
                        if texto[j + 1:j + 2] == c:
                            j += 2
                            continue
                        break
                    j += 1
                if primeiro < 0:
                    primeiro = i
                saida.append(texto[i:j + 1])
                i = j + 1
                continue
            if primeiro < 0 and not c.isspace() and c != ';':
                primeiro = i
            saida.append(c)
            i += 1
        return ''.join(saida), primeiro

    def comandos(script):
        # Corta o arquivo em comandos onde o próprio SQLite diz que um termina.
        # Um ponto e vírgula dentro de texto ou de comentário não termina nada,
        # e é o complete_statement que sabe disso.
        inicio = 0
        for i, c in enumerate(script):
            if c == ';' and sqlite3.complete_statement(script[inicio:i + 1]):
                trecho = script[inicio:i + 1]
                limpo, primeiro = sem_comentarios(trecho)
                # O comando começa no primeiro caractere que é código: os
                # comentários de antes dele são do arquivo, e não do comando.
                # Levá-los junto poria o enunciado inteiro na aba Mensagens.
                if primeiro >= 0:
                    yield inicio + primeiro, trecho[primeiro:]
                inicio = i + 1
        resto = script[inicio:]
        limpo, primeiro = sem_comentarios(resto)
        if primeiro >= 0:
            # O último comando sem ponto e vírgula também roda, como em todo
            # editor de banco.
            yield inicio + primeiro, resto[primeiro:]

    def tipo_do(sql):
        limpo, primeiro = sem_comentarios(sql)
        palavra = limpo[primeiro:].split(None, 1)[0].upper() if primeiro >= 0 else ''
        palavra = palavra.split('(')[0]
        if palavra in ('SELECT', 'WITH', 'PRAGMA', 'VALUES', 'EXPLAIN'):
            return 'consulta'
        if palavra in ('INSERT', 'UPDATE', 'DELETE', 'REPLACE'):
            return 'alteracao'
        if palavra in ('CREATE', 'DROP', 'ALTER'):
            return 'definicao'
        return 'outro'

    def valor(v):
        if isinstance(v, bytes):
            return 'x' + v.hex()
        return v

    def aspas(nome):
        return '"' + nome.replace('"', '""') + '"'

    def estado(con):
        tabelas = []
        for nome, sql in con.execute(
                "SELECT name, sql FROM sqlite_master WHERE type = 'table' "
                "AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall():
            colunas = [{'nome': r[1], 'tipo': r[2] or '', 'naoNulo': bool(r[3]), 'chave': r[5]}
                       for r in con.execute('PRAGMA table_info(' + aspas(nome) + ')')]
            estrangeiras = [{'coluna': r[3], 'tabela': r[2], 'para': r[4] or ''}
                            for r in con.execute('PRAGMA foreign_key_list(' + aspas(nome) + ')')]
            unicos = []
            chave = [c['nome'] for c in sorted(colunas, key=lambda c: c['chave']) if c['chave']]
            if chave:
                unicos.append(chave)
            for r in con.execute('PRAGMA index_list(' + aspas(nome) + ')').fetchall():
                if r[2]:
                    cols = [x[2] for x in con.execute('PRAGMA index_info(' + aspas(r[1]) + ')')]
                    if cols not in unicos:
                        unicos.append(cols)
            try:
                linhas = con.execute('SELECT * FROM ' + aspas(nome) + ' ORDER BY rowid').fetchall()
            except sqlite3.Error:
                linhas = con.execute('SELECT * FROM ' + aspas(nome)).fetchall()
            tabelas.append({
                'nome': nome, 'sql': sql or '', 'colunas': colunas, 'estrangeiras': estrangeiras,
                'unicos': unicos, 'linhas': [[valor(v) for v in l] for l in linhas],
            })
        return {'tabelas': tabelas}

    def executar(semente, script, limite):
        # isolation_level=None é o modo em que cada comando vale assim que
        # roda, que é o que um editor de banco faz. O Python, sem isso, abriria
        # uma transação escondida antes de cada INSERT — e é justamente essa
        # transação que o módulo 9 ensina a fechar com commit.
        con = sqlite3.connect(':memory:', isolation_level=None)
        con.execute('PRAGMA foreign_keys = ON')
        con.executescript(semente)
        lista = []
        erro = None
        for pos, sql in comandos(script):
            linha = script.count('\\n', 0, pos) + 1
            texto = sql.strip()
            tipo = tipo_do(sql)
            antes = con.total_changes
            try:
                cur = con.execute(sql)
                colunas = [d[0] for d in cur.description] if cur.description else []
                linhas = cur.fetchmany(limite + 1) if cur.description else []
                lista.append({
                    'linha': linha, 'sql': texto, 'tipo': tipo, 'colunas': colunas,
                    'linhas': [[valor(v) for v in l] for l in linhas[:limite]],
                    'cortado': len(linhas) > limite,
                    'alteradas': con.total_changes - antes if tipo == 'alteracao' else 0,
                    'erro': None,
                })
            except (sqlite3.Error, sqlite3.Warning, ValueError) as e:
                erro = {'linha': linha, 'mensagem': str(e)}
                lista.append({
                    'linha': linha, 'sql': texto, 'tipo': tipo, 'colunas': [], 'linhas': [],
                    'cortado': False, 'alteradas': 0, 'erro': str(e),
                })
                break
        # Transação aberta e nunca fechada se desfaz quando a conexão fecha, e
        # é isso que o SQLite faz. Mostrar o banco com ela aplicada seria
        # mostrar um banco que ninguém vai reencontrar.
        desfeita = con.in_transaction
        if desfeita:
            con.rollback()
        return json.dumps({'comandos': lista, 'erro': erro, 'transacaoDesfeita': desfeita,
                           'banco': estado(con)}, ensure_ascii=False)

    def criar_arquivo(caminho, semente):
        import os
        if os.path.exists(caminho):
            os.remove(caminho)
        con = sqlite3.connect(caminho)
        con.execute('PRAGMA foreign_keys = ON')
        con.executescript(semente)
        con.commit()
        con.close()

    def ler_arquivo(caminho):
        # Uma conexão nova, e não a do programa: o que ela vê é o que ficou
        # gravado no arquivo. Uma inserção sem commit não está lá, e é por esta
        # leitura que o módulo 9 sabe disso.
        import os
        if not os.path.exists(caminho):
            return json.dumps(None)
        con = sqlite3.connect(caminho)
        try:
            return json.dumps(estado(con), ensure_ascii=False)
        finally:
            con.close()

    return {'executar': executar, 'criar_arquivo': criar_arquivo, 'ler_arquivo': ler_arquivo}
`;

const comoTexto = (x: unknown) => JSON.stringify(JSON.stringify(x));

/**
 * O programa que executa um arquivo `.sql` sobre o banco da lição.
 *
 * A última expressão é o resultado em JSON. `globals().pop` tira a função do
 * espaço de nomes no mesmo gesto em que a chama — nada fica para trás.
 */
export function programaDoSql(semente: string, script: string, limite = LIMITE_DE_LINHAS): string {
  return `${MOTOR}
import json as _trilha_json
_trilha_args = _trilha_json.loads(${comoTexto({ semente, script, limite })})
del _trilha_json
globals().pop('_trilha_motor')()['executar'](
    globals()['_trilha_args']['semente'], globals()['_trilha_args']['script'],
    globals().pop('_trilha_args')['limite'])
`;
}

/** Grava o banco da lição em arquivo, antes de o programa da pessoa rodar. */
export function programaQueCriaOArquivo(caminho: string, semente: string): string {
  return `${MOTOR}
import json as _trilha_json
_trilha_args = _trilha_json.loads(${comoTexto({ caminho, semente })})
del _trilha_json
globals().pop('_trilha_motor')()['criar_arquivo'](
    globals()['_trilha_args']['caminho'], globals().pop('_trilha_args')['semente'])
`;
}

/** Lê o arquivo depois de o programa terminar, por uma conexão nova. */
export function programaQueLeOArquivo(caminho: string): string {
  return `${MOTOR}
globals().pop('_trilha_motor')()['ler_arquivo'](${JSON.stringify(caminho)})
`;
}

/* ── O que se lê do resultado ─────────────────────────────────────────────── */

const minusculo = (s: string) => s.toLocaleLowerCase('pt-BR');

export function tabelaDe(banco: EstadoDoBanco | null | undefined, nome: string): TabelaDoBanco | undefined {
  return banco?.tabelas.find(t => minusculo(t.nome) === minusculo(nome));
}

export function colunaDe(tabela: TabelaDoBanco | undefined, nome: string): ColunaDoBanco | undefined {
  return tabela?.colunas.find(c => minusculo(c.nome) === minusculo(nome));
}

/** As linhas de uma tabela como objetos, pelo nome da coluna em minúsculas. */
export function registros(tabela: TabelaDoBanco | undefined): Record<string, Valor>[] {
  if (!tabela) return [];
  const nomes = tabela.colunas.map(c => minusculo(c.nome));
  return tabela.linhas.map(l => Object.fromEntries(nomes.map((n, i) => [n, l[i]])));
}

/** A chave primária de uma tabela, na ordem em que foi declarada. */
export const chavePrimaria = (t: TabelaDoBanco | undefined) =>
  (t?.colunas ?? []).filter(c => c.chave > 0).sort((a, b) => a.chave - b.chave).map(c => c.nome);

const chaveDoValor = (v: Valor) => (v === null ? 'N' : typeof v === 'number' ? `n${v}` : `s${v}`);

/**
 * Dois valores são o mesmo?
 *
 * Número com número se compara com folga de meio centésimo: quem arredonda a
 * média com `ROUND(AVG(idade), 2)` escreveu a média certa, e cobrar a dízima
 * inteira reprovaria a forma que um relatório de verdade usa.
 */
export function mesmoValor(a: Valor, b: Valor): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.0051;
  return a === b;
}

/** As permutações de 0..n-1. Só se usa com poucas colunas. */
function permutacoes(n: number): number[][] {
  if (n <= 1) return [[...Array(n).keys()]];
  return permutacoes(n - 1).flatMap(p =>
    [...Array(n).keys()].map(i => [...p.slice(0, i), n - 1, ...p.slice(i)]));
}

export interface Esperado {
  linhas: Valor[][];
  /**
   * Como a ordem das linhas conta.
   *
   * `livre`: a consulta pode devolver em qualquer ordem — sem ORDER BY, o banco
   * não promete nenhuma. `exata`: na ordem dada. Uma função recebe as linhas já
   * alinhadas às colunas esperadas e diz se a ordem está certa — é o caso de
   * "do mais velho ao mais novo", em que dois de treze anos podem vir em
   * qualquer ordem entre eles.
   */
  ordem?: 'livre' | 'exata' | ((linhas: Valor[][]) => boolean);
}

/**
 * O resultado de um comando é o esperado?
 *
 * As colunas se comparam pelo conteúdo, e não pelo nome nem pela posição: quem
 * escreveu `SELECT idade, nome` respondeu a mesma coisa que quem escreveu
 * `SELECT nome, idade`, e quem chamou a coluna de `Nome` também. Coluna a mais
 * não passa — `SELECT *` não é "o nome e a idade", e a diferença entre as duas
 * é metade do requisito 6.3.
 */
export function resultadoBate(cmd: ResultadoDoComando, esperado: Esperado): boolean {
  if (cmd.erro || cmd.cortado) return false;
  const largura = esperado.linhas[0]?.length ?? cmd.colunas.length;
  if (cmd.colunas.length !== largura || cmd.linhas.length !== esperado.linhas.length) return false;
  if (largura > 6) return false;
  const ordem = esperado.ordem ?? 'livre';
  const assinatura = (l: Valor[]) => l.map(chaveDoValor).join('|');
  for (const p of permutacoes(largura)) {
    const alinhadas = cmd.linhas.map(l => p.map(i => l[i]));
    if (ordem === 'exata') {
      if (alinhadas.every((l, i) => l.every((v, j) => mesmoValor(v, esperado.linhas[i][j])))) return true;
      continue;
    }
    if (!mesmoMulticonjunto(alinhadas, esperado.linhas, assinatura)) continue;
    if (ordem === 'livre' || ordem(alinhadas)) return true;
  }
  return false;
}

function mesmoMulticonjunto(a: Valor[][], b: Valor[][], assinatura: (l: Valor[]) => string): boolean {
  /* Números com casas decimais não se comparam por texto: arredonda-se antes
     de montar a assinatura, na mesma folga de `mesmoValor`. */
  const arredonda = (l: Valor[]) => l.map(v => (typeof v === 'number' ? Math.round(v * 100) / 100 : v));
  const conta = new Map<string, number>();
  for (const l of a) { const k = assinatura(arredonda(l)); conta.set(k, (conta.get(k) ?? 0) + 1); }
  for (const l of b) {
    const k = assinatura(arredonda(l));
    const n = conta.get(k) ?? 0;
    if (n === 0) return false;
    conta.set(k, n - 1);
  }
  return true;
}

/** Algum comando da execução devolveu o esperado? */
export const algumaConsultaBate = (e: ExecucaoDeSql | null, esperado: Esperado) =>
  !!e?.comandos.some(c => c.tipo === 'consulta' && resultadoBate(c, esperado));

/** As linhas estão em ordem por uma coluna? `passo` 1 sobe, -1 desce; nulos no fim. */
export function emOrdem(linhas: Valor[][], coluna: number, passo: 1 | -1): boolean {
  for (let i = 1; i < linhas.length; i++) {
    const a = linhas[i - 1][coluna];
    const b = linhas[i][coluna];
    if (a === null || b === null) {
      if (a === null && b !== null) return false;
      continue;
    }
    const c = typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'pt-BR');
    if (c * passo > 0) return false;
  }
  return true;
}

/* ── O resultado escrito, para a teoria ───────────────────────────────────── */

export function mostrarValor(v: Valor): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100).replace('.', ',');
  return v;
}

/**
 * O resultado como a teoria o escreve: o cabeçalho na primeira linha e uma
 * linha por registro, as células separadas por barra.
 *
 * É a forma de `exemploSaida` dos tópicos de SQL, e é esta função que a trava
 * dos exemplos usa para comparar — a lição e o motor escrevem a mesma coisa.
 */
export function escreverResultado(colunas: string[], linhas: Valor[][]): string {
  return [colunas.join(' | '), ...linhas.map(l => l.map(mostrarValor).join(' | '))].join('\n');
}

/** O caminho de volta: o texto do exemplo em cabeçalho e linhas, para desenhar a tabela. */
export function lerResultado(texto: string): { colunas: string[]; linhas: string[][] } {
  const [topo = '', ...resto] = texto.split('\n');
  const partir = (l: string) => l.split('|').map(c => c.trim());
  return { colunas: partir(topo), linhas: resto.filter(l => l.trim() !== '').map(partir) };
}

/** As escolhas ordenadas de `k` entre `n`: cada coluna esperada numa coluna diferente. */
function arranjos(n: number, k: number): number[][] {
  if (k === 0) return [[]];
  return arranjos(n, k - 1).flatMap(a => [...Array(n).keys()].filter(i => !a.includes(i)).map(i => [...a, i]));
}

/**
 * O resultado traz estas colunas, linha por linha — e pode trazer outras.
 *
 * É a conferência de quando a tarefa diz **o que** precisa aparecer e não
 * proíbe o resto: a lista dos inscritos com o telefone pode vir com o id ao
 * lado, porque o id não muda o que a lista responde. Onde coluna a mais muda a
 * resposta — o "só o nome e a idade" do módulo 1 —, a conferência é
 * `resultadoBate`.
 */
export function temAsColunas(cmd: ResultadoDoComando, linhas: Valor[][]): boolean {
  if (cmd.erro || cmd.cortado || cmd.linhas.length !== linhas.length) return false;
  const k = linhas[0]?.length ?? 0;
  if (k === 0 || k > cmd.colunas.length) return linhas.length === 0;
  const assinatura = (l: Valor[]) => l.map(chaveDoValor).join('|');
  return arranjos(cmd.colunas.length, k).some(a =>
    mesmoMulticonjunto(cmd.linhas.map(l => a.map(i => l[i])), linhas, assinatura));
}

/** Alguma consulta da execução traz estas colunas? */
export const algumaConsultaTraz = (e: ExecucaoDeSql | null, linhas: Valor[][]) =>
  !!e?.comandos.some(c => c.tipo === 'consulta' && temAsColunas(c, linhas));
