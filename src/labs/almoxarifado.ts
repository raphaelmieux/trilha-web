/**
 * O programa da CC006 Projeto de Programa: o almoxarifado do clube.
 *
 * ── Um programa, quatro lições ───────────────────────────────────────────
 * O requisito 3 pede um programa de linha de comando que guarde em banco,
 * crie, consulte, altere e remova, valide toda entrada, trate erro sem morrer
 * e esteja dividido em funções e arquivos. Os quatro laboratórios de Python
 * da vereda constroem esse programa por partes, e cada um parte do que o
 * anterior deixou — é o arranjo do boletim da CC-DG005 e da marca da CC-DG004:
 * mandar reescrever o esqueleto para poder fazer o menu ensinaria que o
 * trabalho de antes não conta.
 *
 * Por isso as versões do programa moram aqui, e não no teste: a versão de
 * referência de uma lição **é** o modelo da seguinte. A do último laboratório
 * fica no teste, como toda solução de referência.
 *
 * ── A entrada é decidida antes ───────────────────────────────────────────
 * O laboratório de Python não espera digitação: as linhas que o `input()` vai
 * ler são escritas antes de rodar, que é como se testa um programa de linha de
 * comando de verdade. Então o programa precisa fazer as perguntas na ordem que
 * o enunciado descreve — é o contrato do menu, e ele está escrito no modelo.
 *
 * ── O banco nasce vazio ──────────────────────────────────────────────────
 * O arquivo `almoxarifado.db` é refeito a cada execução sem tabela nenhuma: é
 * o programa que a cria, com `CREATE TABLE IF NOT EXISTS`, que é o que todo
 * programa que guarda em banco faz na primeira vez que roda no computador de
 * alguém.
 */

export const ARQUIVO_DO_BANCO = 'almoxarifado.db';

/** O banco de partida: um arquivo sem nada dentro. */
export const SEMENTE_VAZIA = '';

/** O menu, como o enunciado o promete. */
export const MENU = `1 - Cadastrar material
2 - Listar materiais
3 - Alterar quantidade
4 - Remover material
0 - Sair`;

export const DESPEDIDA = 'Até logo.';

/* ── Módulo 2: o esqueleto em dois arquivos ───────────────────────────────── */

export const BANCO_DO_ESQUELETO = `import sqlite3

ARQUIVO = "${ARQUIVO_DO_BANCO}"


def conectar():
    return sqlite3.connect(ARQUIVO)


def criar_tabela(conexao):
    conexao.execute(
        "CREATE TABLE IF NOT EXISTS materiais ("
        "id INTEGER PRIMARY KEY, "
        "nome TEXT NOT NULL UNIQUE, "
        "quantidade INTEGER NOT NULL)"
    )
    conexao.commit()
`;

export const PRINCIPAL_DO_ESQUELETO = `from banco import conectar, criar_tabela


def main():
    conexao = conectar()
    criar_tabela(conexao)
    print("Banco pronto.")
    conexao.close()


main()
`;

/* ── Módulo 3: criar, consultar, alterar e remover ────────────────────────── */

export const BANCO_DO_CRUD = `${BANCO_DO_ESQUELETO}

def cadastrar(conexao, nome, quantidade):
    conexao.execute("INSERT INTO materiais (nome, quantidade) VALUES (?, ?)", (nome, quantidade))
    conexao.commit()


def listar(conexao):
    return conexao.execute("SELECT id, nome, quantidade FROM materiais ORDER BY nome").fetchall()


def alterar(conexao, id_material, quantidade):
    cursor = conexao.execute("UPDATE materiais SET quantidade = ? WHERE id = ?", (quantidade, id_material))
    conexao.commit()
    return cursor.rowcount


def remover(conexao, id_material):
    cursor = conexao.execute("DELETE FROM materiais WHERE id = ?", (id_material,))
    conexao.commit()
    return cursor.rowcount
`;

export const PRINCIPAL_DO_CRUD = `from banco import conectar, criar_tabela, cadastrar, listar, alterar, remover

MENU = """${MENU}"""


def main():
    conexao = conectar()
    criar_tabela(conexao)
    while True:
        print(MENU)
        opcao = input("Escolha: ")
        if opcao == "1":
            nome = input("Nome: ")
            quantidade = int(input("Quantidade: "))
            cadastrar(conexao, nome, quantidade)
        elif opcao == "2":
            for id_material, nome, quantidade in listar(conexao):
                print(f"{id_material} - {nome}: {quantidade}")
        elif opcao == "3":
            id_material = int(input("Id: "))
            quantidade = int(input("Nova quantidade: "))
            alterar(conexao, id_material, quantidade)
        elif opcao == "4":
            id_material = int(input("Id: "))
            remover(conexao, id_material)
        elif opcao == "0":
            print("${DESPEDIDA}")
            break
    conexao.close()


main()
`;

/* ── Módulo 4: validar toda entrada ───────────────────────────────────────── */

export const ENTRADA_VALIDADA = `def ler_texto(pergunta):
    while True:
        texto = input(pergunta).strip()
        if texto:
            return texto
        print("Escreva alguma coisa.")


def ler_inteiro(pergunta, minimo=0):
    while True:
        try:
            numero = int(input(pergunta))
        except ValueError:
            print("Digite um número inteiro.")
            continue
        if numero < minimo:
            print("O número precisa ser", minimo, "ou mais.")
            continue
        return numero
`;

export const PRINCIPAL_VALIDADO = `from banco import conectar, criar_tabela, cadastrar, listar, alterar, remover
from entrada import ler_texto, ler_inteiro

MENU = """${MENU}"""


def main():
    conexao = conectar()
    criar_tabela(conexao)
    while True:
        print(MENU)
        opcao = input("Escolha: ").strip()
        if opcao == "1":
            nome = ler_texto("Nome: ")
            quantidade = ler_inteiro("Quantidade: ")
            cadastrar(conexao, nome, quantidade)
        elif opcao == "2":
            for id_material, nome, quantidade in listar(conexao):
                print(f"{id_material} - {nome}: {quantidade}")
        elif opcao == "3":
            id_material = ler_inteiro("Id: ", 1)
            quantidade = ler_inteiro("Nova quantidade: ")
            alterar(conexao, id_material, quantidade)
        elif opcao == "4":
            id_material = ler_inteiro("Id: ", 1)
            remover(conexao, id_material)
        elif opcao == "0":
            print("${DESPEDIDA}")
            break
        else:
            print("Opção inválida.")
    conexao.close()


main()
`;

/* ── As entradas de cada laboratório ──────────────────────────────────────── */

/**
 * O roteiro do módulo 3: cadastrar dois, listar, alterar um e remover o outro.
 *
 * O id da Barraca é 1 e o da Lanterna é 2 porque o banco nasce vazio e numera
 * na ordem do cadastro — e é por isso que o roteiro pode dizer "3, 2, 12".
 */
export const ROTEIRO_DO_CRUD = ['1', 'Barraca', '4', '1', 'Lanterna', '10', '2', '3', '2', '12', '4', '1', '2', '0'];

/**
 * O roteiro do módulo 4: cada pergunta recebe primeiro uma resposta errada.
 *
 * Nome em branco, quantidade escrita por extenso, quantidade negativa, id que
 * não é número e nova quantidade negativa — os cinco jeitos que um desbravador
 * de verdade tem de errar no teclado do clube. O programa que não valida grava
 * o nome vazio ou estoura no "dez".
 */
export const ROTEIRO_DA_VALIDACAO = ['1', '', 'Corda', 'dez', '-3', '5', '3', 'abc', '1', '-1', '8', '7', '2', '0'];

/**
 * O roteiro do módulo 5: o que dá errado sem ser culpa do teclado.
 *
 * Cadastrar a Corda duas vezes esbarra no UNIQUE do banco; remover o id 99 não
 * acha ninguém. Os dois são erros que o programa precisa dizer em vez de
 * morrer — e, no segundo, em vez de calar, que é como "remover" vira um botão
 * que às vezes não faz nada.
 */
export const ROTEIRO_DOS_ERROS = ['1', 'Corda', '5', '1', 'Corda', '3', '4', '99', '2', '0'];

/* ── Módulo 5: o erro tratado, e o programa inteiro ───────────────────────── */

/**
 * O programa como ele vai para o repositório.
 *
 * É a versão que o módulo 6 versiona e que o README do módulo 7 descreve —
 * por isso mora aqui, e não só no teste: o terminal parte de uma pasta com
 * ele dentro.
 */
export const PRINCIPAL_FINAL = `import sqlite3

from banco import conectar, criar_tabela, cadastrar, listar, alterar, remover
from entrada import ler_texto, ler_inteiro

MENU = """${MENU}"""


def main():
    conexao = conectar()
    criar_tabela(conexao)
    while True:
        print(MENU)
        opcao = input("Escolha: ").strip()
        if opcao == "1":
            nome = ler_texto("Nome: ")
            quantidade = ler_inteiro("Quantidade: ")
            try:
                cadastrar(conexao, nome, quantidade)
            except sqlite3.IntegrityError:
                print("Já existe um material com esse nome.")
        elif opcao == "2":
            for id_material, nome, quantidade in listar(conexao):
                print(f"{id_material} - {nome}: {quantidade}")
        elif opcao == "3":
            id_material = ler_inteiro("Id: ", 1)
            quantidade = ler_inteiro("Nova quantidade: ")
            if alterar(conexao, id_material, quantidade) == 0:
                print("Nenhum material com esse id.")
        elif opcao == "4":
            id_material = ler_inteiro("Id: ", 1)
            if remover(conexao, id_material) == 0:
                print("Nenhum material com esse id.")
        elif opcao == "0":
            print("${DESPEDIDA}")
            break
        else:
            print("Opção inválida.")
    conexao.close()


main()
`;
