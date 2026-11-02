import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DO_PROJETO_DE_PROGRAMA as Q } from './questoesDoProjetoDePrograma';
import {
  ARQUIVO_DO_BANCO, BANCO_DO_CRUD, BANCO_DO_ESQUELETO, DESPEDIDA, ENTRADA_VALIDADA, MENU, PRINCIPAL_DO_CRUD,
  PRINCIPAL_DO_ESQUELETO, PRINCIPAL_VALIDADO, ROTEIRO_DA_VALIDACAO, ROTEIRO_DO_CRUD, ROTEIRO_DOS_ERROS,
  SEMENTE_VAZIA,
} from '../labs/almoxarifado';

/*
 * A vereda CC006 Projeto de Programa.
 *
 * ── Ela não ensina ferramenta nova ───────────────────────────────────────
 * O Python é o da CC004, o banco é o da CC005, o Git e o terminal são os da
 * CC003. O que ela ensina é o que nenhuma das três podia ensinar sozinha: um
 * programa que alguém usa, feito do começo ao fim — proposto antes, escrito em
 * partes, versionado ao longo de dias, explicado num README e defendido diante
 * de quem examina.
 *
 * ── Um programa só ───────────────────────────────────────────────────────
 * O almoxarifado do clube, do esqueleto ao programa que não cai. Cada
 * laboratório de Python parte do que o anterior deixou — as versões moram em
 * `almoxarifado.ts` —, e o repositório das lições de Git guarda essas mesmas
 * versões, com as datas em que foram escritas. É o arranjo do boletim da
 * CC-DG005 e da marca da CC-DG004: a lição seguinte começa onde a anterior
 * chegou.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * É a do documento, e aqui ela é a ordem do trabalho: a proposta vem antes de
 * qualquer linha, o programa vem antes do histórico que o guarda, e o diário
 * e a apresentação contam o que já aconteceu.
 */

const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

const py = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, exemploSaida: string, atencao: string, marcas: string[],
  exemploEntrada?: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'python' as const, exemploSaida, atencao, marcas,
  ...(exemploEntrada ? { exemploEntrada } : {}),
});

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const A_PROPOSTA: TopicoDeVereda[] = [
  t(
    'problema-e-usuario',
    'O problema e quem vai usar',
    'Antes do programa, a coisa que está dando errado — e a pessoa para quem ela dá errado.',
    [
      'Todo programa que alguém usa começou num **problema**: uma coisa que dá errado hoje, sem programa nenhum. A lista do material do clube mora num caderno no armário, ninguém sabe quantas lanternas funcionam, e no dia do acampamento falta corda. Isso é um problema.',
      'O problema se escreve como quem conta o que acontece, e não como quem já tem a solução. "Fazer um programa de estoque" é solução; "ninguém sabe o que o clube tem antes de sair para o acampamento" é problema — e é ele que vai dizer se o programa deu certo.',
      'Junto vem o **usuário-alvo**: quem vai abrir o programa. Não é "todo mundo". É a secretaria do clube, o conselheiro responsável pelo almoxarifado. Saber quem usa decide o resto — quem usa uma vez por mês precisa de um menu que explique cada opção.',
    ],
    `Problema
  A lista do material fica num caderno no armário. Ninguém sabe
  quanto há de cada coisa, e no dia do acampamento sempre falta
  alguma.

Quem vai usar
  O conselheiro responsável pelo almoxarifado, no computador
  da secretaria.`,
    'Uma proposta sem usuário-alvo parece pronta e não é: o examinador não tem como dizer se o programa serve, porque não sabe para quem ele seria.',
    ['problema', 'usuário-alvo', 'proposta'],
  ),
  t(
    'funcionalidades',
    'A lista de funcionalidades',
    'O que o programa vai fazer, uma coisa por linha — e o que ele não vai.',
    [
      'Uma **funcionalidade** é uma coisa que o programa faz, escrita do ponto de vista de quem usa: um verbo e o que ele mexe. "Cadastrar um material com o nome e a quantidade" é funcionalidade; "usar SQLite" não é — é como o programa vai ser feito, e quem usa não vê isso.',
      'O requisito pede um programa que **crie, consulte, altere e remova** registros. São as quatro operações de quase todo programa que guarda dados, e a proposta tem de dizer as quatro, cada uma com o que ela faz no almoxarifado.',
      'A lista também serve para dizer **não**. Tudo o que não está nela fica para depois. É ela que impede o projeto de crescer até não terminar nunca — e é contra ela que o examinador confere, no fim, o que foi entregue.',
    ],
    `Funcionalidades previstas
  1. Cadastrar um material com o nome e a quantidade
  2. Listar os materiais em ordem de nome
  3. Alterar a quantidade de um material
  4. Remover um material que o clube não tem mais

Fica para depois
  - avisar quando um material está acabando`,
    'Funcionalidade boa se confere: dá para olhar o programa e dizer sim ou não. "Ser fácil de usar" não se confere, e por isso não entra na lista.',
    ['funcionalidade', 'criar', 'consultar', 'alterar', 'remover'],
  ),
  t(
    'aprovar-antes',
    'Por que a aprovação vem antes',
    'Mudar uma proposta custa uma frase; mudar um programa pronto custa o programa.',
    [
      'O requisito diz que a execução **não pode começar antes da aprovação**. Não é burocracia: é o momento mais barato de mudar de ideia. Se o examinador ler a proposta e disser que remover não faz sentido para o clube, risca-se uma linha. Se ele disser isso depois, o código já escrito vai fora.',
      'A proposta aprovada vira um acordo: o que está nela é o que vai ser cobrado. Quem começa a programar antes troca esse acordo por uma aposta — a de que o examinador vai aprovar exatamente o que já foi feito.',
      'A data da aprovação fica registrada. No repositório de Git, o primeiro commit vem **depois** dela, e qualquer pessoa pode conferir as duas datas.',
    ],
    `16/10  proposta aprovada pelo examinador
17/10  primeiro commit: cria a tabela de materiais
18/10  cadastrar, listar, alterar, remover
21/10  validação e tratamento de erro`,
    'Aprovação pedida para o que já está pronto não deixa o examinador mudar nada — e é por isso que ela não vale.',
    ['aprovação', 'escopo', 'antes da execução'],
  ),
];

/* ── Módulo 2: o esqueleto ────────────────────────────────────────────────── */

const O_ESQUELETO: TopicoDeVereda[] = [
  t(
    'cada-arquivo-um-assunto',
    'Cada arquivo, um assunto',
    'O que fala com o banco num arquivo, o que conversa com quem usa em outro.',
    [
      'O requisito pede o programa **dividido em funções e distribuído em mais de um arquivo-fonte**. Não é para ficar bonito: é para que, quando o banco mudar, se saiba em que arquivo mexer — e só nele.',
      'No almoxarifado, `banco.py` guarda tudo o que fala com o banco: conectar, criar a tabela, cadastrar, listar. `principal.py` é o que se executa, e guarda o menu. Na CC004 você já fez isso com o caixa do acampamento: o nome do módulo é o do arquivo sem o `.py`.',
      'O `principal.py` importa o que precisa com `from banco import conectar, criar_tabela`. Se o import falha, o Python diz `ModuleNotFoundError` — quase sempre o nome escrito diferente do nome do arquivo, ou o arquivo em outra pasta.',
    ],
    `almoxarifado/
  principal.py     o menu, e o que se executa
  banco.py         conectar, criar a tabela, e as operações
  almoxarifado.db  o banco, criado na primeira vez

principal.py:
  from banco import conectar, criar_tabela`,
    'Arquivo que ninguém importa não divide o programa: é um arquivo ao lado. O que conta é o principal chamar o que mora no outro.',
    ['arquivo-fonte', 'módulo', 'import'],
  ),
  py(
    'criar-se-nao-existir',
    'A tabela que se cria sozinha',
    'O programa cria o que precisa na primeira vez, e não estraga nada nas outras.',
    [
      'Quem baixa o almoxarifado não tem banco nenhum. O programa precisa criar a tabela na primeira vez que roda — e não pode tentar criá-la de novo na segunda, porque `CREATE TABLE` de uma tabela que já existe é erro.',
      '`CREATE TABLE IF NOT EXISTS` resolve as duas coisas: cria se não existe, e não faz nada se existe. Por isso ele pode rodar toda vez que o programa abre.',
      'É aqui que as regras da CC005 entram: `nome TEXT NOT NULL UNIQUE` diz que todo material tem nome, e que não há dois com o mesmo. O banco passa a recusar o que o programa esquecer de recusar.',
    ],
    `import sqlite3

conexao = sqlite3.connect(":memory:")
for vez in range(2):
    conexao.execute(
        "CREATE TABLE IF NOT EXISTS materiais ("
        "id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE, quantidade INTEGER NOT NULL)"
    )
    print("Rodada", vez + 1, "- tabela pronta")

colunas = conexao.execute("PRAGMA table_info(materiais)").fetchall()
print([coluna[1] for coluna in colunas])`,
    `Rodada 1 - tabela pronta
Rodada 2 - tabela pronta
['id', 'nome', 'quantidade']`,
    'O arquivo do banco não vai para o repositório: cada computador cria o seu. Por isso ele entra no .gitignore, que é assunto do módulo 6.',
    ['CREATE TABLE IF NOT EXISTS', 'NOT NULL', 'UNIQUE'],
  ),
  py(
    'main',
    'A função principal',
    'Tudo dentro de funções, e uma chamada só no fim do arquivo.',
    [
      'O requisito pede o programa **dividido em funções**. No principal, isso se faz com uma função `main` que guarda o que o programa faz do começo ao fim, e uma chamada `main()` sozinha na última linha.',
      'Definir uma função não a executa. O Python lê o `def` e guarda a função para depois; só a chamada a faz rodar. É por isso que, no exemplo, a primeira coisa que aparece é o que está fora das funções.',
      'Abrir o banco numa função, e não solto no topo do arquivo, tem outra vantagem: importar o `banco.py` não abre banco nenhum. Ele só é aberto quando alguém chama `conectar()`.',
    ],
    `def conectar():
    print("Abrindo o banco")
    return "conexão"


def main():
    conexao = conectar()
    print("Usando a", conexao)


print("Antes de chamar")
main()`,
    `Antes de chamar
Abrindo o banco
Usando a conexão`,
    'Esquecer a chamada main() no fim é o erro mais silencioso que existe: o programa roda, termina, e não faz nada.',
    ['função', 'main', 'def'],
  ),
];

/* ── Módulo 3: o menu e as quatro operações ───────────────────────────────── */

const O_MENU: TopicoDeVereda[] = [
  py(
    'menu-em-laco',
    'O menu que volta',
    'Um laço que mostra as opções, pergunta, faz, e mostra de novo — até a pessoa sair.',
    [
      'Um programa de linha de comando que se usa por mais de um minuto tem um **menu**: as opções numeradas, a pergunta, e a volta ao começo depois de cada uma. É um `while True` com um `break` na opção de sair.',
      'A resposta do `input` é sempre texto. Por isso a comparação é com `"1"`, entre aspas — `opcao == 1` nunca é verdade, e o menu parece ignorar quem digita.',
      'A opção que não existe também precisa de resposta. No exemplo, o 9 cai no fim do laço e o programa diz o que recebeu; no almoxarifado, ele vai dizer que a opção é inválida.',
    ],
    `while True:
    print("1 - Cadastrar   2 - Listar   0 - Sair")
    opcao = input("Escolha: ")
    if opcao == "0":
        print("Até logo.")
        break
    print("Você escolheu", opcao)`,
    `1 - Cadastrar   2 - Listar   0 - Sair
Escolha: Você escolheu 2
1 - Cadastrar   2 - Listar   0 - Sair
Escolha: Você escolheu 9
1 - Cadastrar   2 - Listar   0 - Sair
Escolha: Até logo.`,
    'O que se digita não aparece na saída: o input escreve a pergunta e lê a resposta, mas não a repete. É por isso que "Você escolheu" vem colado na pergunta.',
    ['menu', 'while True', 'break'],
    ['2', '9', '0'],
  ),
  py(
    'crud-em-sql',
    'Criar, consultar, alterar, remover',
    'As quatro operações, cada uma um comando da CC005 com os valores separados.',
    [
      'Cada operação do menu é uma função no `banco.py`, e cada função é um comando que você já escreveu na CC005: `INSERT` para cadastrar, `SELECT` para listar, `UPDATE` para alterar e `DELETE` para remover.',
      'Os valores vão sempre separados do comando, com `?`: `conexao.execute("UPDATE materiais SET quantidade = ? WHERE id = ?", (12, 2))`. O nome de um material pode ter apóstrofo, e o comando colado quebra nele.',
      'Quem muda o banco precisa do `commit()` depois, senão a mudança some quando o programa fecha. O exemplo não precisa — o banco dele vive na memória e acaba com o programa.',
    ],
    `import sqlite3

conexao = sqlite3.connect(":memory:")
conexao.execute("CREATE TABLE materiais (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")

conexao.execute("INSERT INTO materiais (nome, quantidade) VALUES (?, ?)", ("Barraca", 4))
conexao.execute("INSERT INTO materiais (nome, quantidade) VALUES (?, ?)", ("Lanterna", 10))
conexao.execute("UPDATE materiais SET quantidade = ? WHERE id = ?", (12, 2))
conexao.execute("DELETE FROM materiais WHERE id = ?", (1,))

for id_material, nome, quantidade in conexao.execute("SELECT id, nome, quantidade FROM materiais"):
    print(f"{id_material} - {nome}: {quantidade}")`,
    '2 - Lanterna: 12',
    'Alterar e remover pelo id, e não pelo nome: é a lição das duas Anas da CC005. O nome é o que a pessoa lê; o id é o que o programa usa.',
    ['INSERT', 'SELECT', 'UPDATE', 'DELETE', 'commit'],
  ),
  py(
    'rowcount',
    'Quantas linhas a mudança mexeu',
    'O comando que não acha ninguém não dá erro — ele só não muda nada.',
    [
      'Um `DELETE` com um id que não existe **não é erro** para o banco: ele procurou, não achou, e removeu zero linhas. O programa segue como se tivesse removido.',
      'O cursor que o `execute` devolve sabe quantas linhas a mudança mexeu, em `cursor.rowcount`. Zero quer dizer que nada aconteceu, e é por ele que o programa pode avisar.',
      'Por isso as funções `alterar` e `remover` do almoxarifado devolvem o `rowcount`: quem chama decide o que dizer a quem está usando.',
    ],
    `import sqlite3

conexao = sqlite3.connect(":memory:")
conexao.execute("CREATE TABLE materiais (id INTEGER PRIMARY KEY, nome TEXT)")
conexao.execute("INSERT INTO materiais (nome) VALUES (?)", ("Corda",))

for id_material in [1, 99]:
    cursor = conexao.execute("DELETE FROM materiais WHERE id = ?", (id_material,))
    print("Remover o", id_material, "mexeu em", cursor.rowcount, "linha(s)")`,
    `Remover o 1 mexeu em 1 linha(s)
Remover o 99 mexeu em 0 linha(s)`,
    'Remover que não remove e não diz nada é o pior dos dois mundos: a pessoa sai achando que o material saiu da lista.',
    ['rowcount', 'cursor'],
  ),
];

/* ── Módulo 4: validar toda entrada ───────────────────────────────────────── */

const VALIDAR: TopicoDeVereda[] = [
  py(
    'o-que-pode-chegar',
    'O que pode chegar do teclado',
    'Tudo o que alguém consegue digitar, e não só o que o programa espera.',
    [
      'O requisito pede que o programa **valide toda entrada do usuário**. Toda: não só a quantidade, mas o nome, o id e a opção do menu. Quem está no computador do clube aperta Enter sem querer, escreve "dez" por extenso e digita o id que leu errado.',
      '`int()` aceita espaço em volta e o sinal de menos, e recusa todo o resto com `ValueError` — inclusive o texto vazio. Se ninguém apanhar o erro, o programa fecha.',
      'E o que o `int()` aceita nem sempre serve: -3 é um número inteiro perfeito, e não é quantidade de barraca nenhuma. Validar é conferir o tipo **e** o que faz sentido.',
    ],
    `for digitado in ["12", " 12 ", "dez", "", "-3"]:
    try:
        print(repr(digitado), "vira", int(digitado))
    except ValueError:
        print(repr(digitado), "não é número inteiro")`,
    `'12' vira 12
' 12 ' vira 12
'dez' não é número inteiro
'' não é número inteiro
'-3' vira -3`,
    'O nome também se valida. Um nome só de espaços passa por qualquer conferência de "não está vazio" que não use strip().',
    ['validação', 'ValueError', 'int'],
  ),
  py(
    'perguntar-de-novo',
    'Perguntar de novo',
    'Uma função que só devolve quando a resposta serve.',
    [
      'Validar não é recusar e seguir em frente: é **perguntar de novo**, dizendo o que estava errado. Quem digitou "dez" precisa saber que o programa quer um número, e ter outra chance.',
      'A forma é uma função com um laço: tenta converter, e se falhar avisa e volta ao começo com `continue`; se o número estiver fora do que vale, avisa e volta também; só quando os dois servem a função devolve.',
      'Escrita uma vez, no `entrada.py`, ela serve à quantidade, ao id e à nova quantidade. É o terceiro arquivo do almoxarifado, e é por isso que ele existe.',
    ],
    `def ler_inteiro(pergunta, minimo=0):
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


quantidade = ler_inteiro("Quantidade: ")
print("Guardado:", quantidade)`,
    `Quantidade: Digite um número inteiro.
Quantidade: O número precisa ser 0 ou mais.
Quantidade: Guardado: 5`,
    'O id não pode ser zero nem negativo, e a quantidade pode ser zero — o clube pode ter ficado sem corda. É o mínimo que muda, e por isso ele é parâmetro.',
    ['laço de validação', 'continue', 'entrada.py'],
    ['dez', '-3', '5'],
  ),
  py(
    'validar-antes-de-gravar',
    'O programa valida, e o banco confere',
    'Duas barreiras, e nenhuma faz o trabalho da outra.',
    [
      'A regra `NOT NULL` do banco recusa o vazio do banco, que é o `NULL`. O texto vazio, `""`, **não é NULL**: é um texto com zero letras, e o banco o aceita sem reclamar.',
      'Por isso a validação do nome é do programa: `ler_texto` tira os espaços com `strip()` e pergunta de novo enquanto não sobrar nada. O banco não teria como saber que um nome vazio é um erro.',
      'As duas barreiras convivem. O programa valida o que a pessoa digita, e o banco recusa o que escapar — o nome repetido, por exemplo, que o programa só descobre tentando gravar.',
    ],
    `import sqlite3

conexao = sqlite3.connect(":memory:")
conexao.execute("CREATE TABLE materiais (nome TEXT NOT NULL)")
conexao.execute("INSERT INTO materiais VALUES (?)", ("",))
print("Linhas:", conexao.execute("SELECT COUNT(*) FROM materiais").fetchone()[0])

try:
    conexao.execute("INSERT INTO materiais VALUES (?)", (None,))
except sqlite3.IntegrityError as erro:
    print("Recusado:", erro)`,
    `Linhas: 1
Recusado: NOT NULL constraint failed: materiais.nome`,
    'Confiar só no banco deixa passar o material de nome vazio; confiar só no programa deixa passar o que outro programa gravar no mesmo arquivo.',
    ['NOT NULL', 'texto vazio', 'strip'],
  ),
];

/* ── Módulo 5: erros sem fechar o programa ────────────────────────────────── */

const ERROS: TopicoDeVereda[] = [
  py(
    'encerramento-abrupto',
    'O programa que não cai',
    'O erro que ninguém apanha fecha o programa no meio do que a pessoa estava fazendo.',
    [
      'Quando um erro acontece e ninguém o apanha, o Python escreve o **traceback** e o programa termina ali — é o encerramento abrupto que o requisito proíbe. Quem estava cadastrando o material do acampamento perde o caminho e tem de abrir tudo de novo.',
      'Nem todo erro vem do teclado. Cadastrar a Corda pela segunda vez é uma resposta perfeitamente válida, e o banco a recusa por causa do `UNIQUE`, com `sqlite3.IntegrityError`.',
      'O `try` em volta do cadastro apanha esse erro pelo nome, diz o que aconteceu, e deixa o laço do menu seguir. O programa continua de pé, e a lista continua sem repetição.',
    ],
    `import sqlite3

conexao = sqlite3.connect(":memory:")
conexao.execute("CREATE TABLE materiais (nome TEXT NOT NULL UNIQUE)")

for nome in ["Corda", "Corda", "Lona"]:
    try:
        conexao.execute("INSERT INTO materiais VALUES (?)", (nome,))
        print("Cadastrado:", nome)
    except sqlite3.IntegrityError as erro:
        print("Recusado:", nome, "-", erro)`,
    `Cadastrado: Corda
Recusado: Corda - UNIQUE constraint failed: materiais.nome
Cadastrado: Lona`,
    'A mensagem do banco está em inglês e fala de constraint. Para quem usa, o programa escreve a frase dele: "Já existe um material com esse nome."',
    ['traceback', 'IntegrityError', 'try'],
  ),
  t(
    'except-com-nome',
    'O except diz qual erro',
    'Apanhar tudo esconde justamente o erro que precisava aparecer.',
    [
      'Um `except:` sem nome apanha **qualquer** erro. Parece mais seguro, e é o contrário: se alguém escrever `quantidad` no lugar de `quantidade`, o `NameError` também é apanhado, e o programa diz "Já existe um material com esse nome." para um erro de digitação no código.',
      'Por isso cada `except` diz de que erro trata: `except ValueError:` na conversão, `except sqlite3.IntegrityError:` no cadastro. O erro que ninguém previu continua aparecendo, com o traceback, para quem está escrevendo o programa consertar.',
      'O `try` também fica pequeno: em volta da linha que pode dar aquele erro, e não do menu inteiro.',
    ],
    `Apanha só o que previu:
    try:
        cadastrar(conexao, nome, quantidade)
    except sqlite3.IntegrityError:
        print("Já existe um material com esse nome.")

Apanha tudo, inclusive o erro de digitação no código:
    try:
        cadastrar(conexao, nome, quantidad)
    except:
        print("Já existe um material com esse nome.")`,
    'O segundo jeito nunca fecha o programa e nunca funciona: ele cadastra nada e diz que o material já existe, para sempre.',
    ['except', 'NameError', 'erro previsto'],
  ),
  t(
    'silencio-tambem-e-erro',
    'O silêncio também é erro',
    'O programa que não cai e não avisa deixa a pessoa enganada.',
    [
      'Tratar erro tem duas metades. A primeira é **não cair**; a segunda é **dizer**. Um programa que apanha o erro e segue calado também não encerra de forma abrupta — e quem tentou remover o id 99 vai embora achando que removeu.',
      'Para o erro que derruba, o aviso vem no `except`. Para o que não derruba, como o id que não existe, o aviso vem do `rowcount`: se ele é zero, o programa diz "Nenhum material com esse id.".',
      'E as frases são combinadas antes, como o menu. É o que permite a quem testa o programa — e ao laboratório desta vereda — saber que o aviso apareceu.',
    ],
    `Escolha: 4
Id: 99
Nenhum material com esse id.
1 - Cadastrar material
...`,
    'Avisar não é pedir desculpas nem explicar o código: é dizer, numa frase, o que não aconteceu e por quê.',
    ['aviso', 'rowcount', 'mensagem de erro'],
  ),
];

/* ── Módulo 6: versionar ──────────────────────────────────────────────────── */

const VERSIONAR: TopicoDeVereda[] = [
  t(
    'commit-pequeno',
    'Um assunto por commit',
    'Cada mudança no seu commit, para que cada uma possa ser lida e desfeita sozinha.',
    [
      'O requisito pede **quinze commits**. Não é número para encher: é o que um projeto de verdade acumula quando cada mudança é guardada no seu próprio commit.',
      'O `git add .` prepara tudo o que mudou de uma vez, e o commit seguinte junta assuntos que não têm nada a ver um com o outro. Se uma das mudanças estiver errada, não dá para desfazer só ela.',
      'O jeito é olhar o `git status`, escolher um arquivo, ver o que mudou nele com `git diff`, e então `git add` só dele e `git commit`. O diff marca com menos a linha que saiu e com mais a que entrou.',
    ],
    `$ git status
Mudanças não preparadas / arquivos não rastreados:
	banco.py
	entrada.py

$ git diff banco.py
-    return conexao.execute("... ORDER BY nome").fetchall()
+    return conexao.execute("... ORDER BY nome COLLATE NOCASE").fetchall()

$ git add banco.py
$ git commit -m "Ordena a lista sem separar maiúsculas de minúsculas"`,
    'Um commit por arquivo é um bom começo, e não uma regra: duas mudanças no mesmo arquivo podem ser dois assuntos, e a mesma mudança pode tocar dois arquivos.',
    ['commit', 'git add', 'git diff'],
  ),
  t(
    'mensagem',
    'A mensagem diz o que mudou',
    'Quem lê o histórico daqui a um mês não sabe o que "ajustes" ajustou.',
    [
      'A mensagem do commit é para quem vai ler o histórico depois — inclusive você. Ela diz **o que** o commit fez, numa frase: "Avisa quando não há material cadastrado".',
      '"Ajustes", "update", "mudanças" e "teste" não dizem nada. Um histórico feito delas é um histórico em que, para achar a mudança que quebrou o cadastro, é preciso abrir commit por commit.',
      'O verbo no presente, como quem completa a frase "este commit...", é o costume da maioria dos projetos — e deixa o `git log --oneline` se lendo como uma lista do que o programa ganhou.',
    ],
    `$ git log --oneline
c15 Tira o cache do Python do controle de versão
c14 Ordena a lista sem separar maiúsculas de minúsculas
c13 Avisa quando não há material cadastrado
c12 Dá um exemplo de número na mensagem de entrada inválida

e não:
c15 ajustes
c14 update`,
    'Se a mensagem precisa de "e" para caber, o commit tem dois assuntos.',
    ['mensagem de commit', 'git log --oneline'],
  ),
  t(
    'dias-distintos',
    'O histórico tem calendário',
    'Quinze commits em quatro dias mostram um projeto feito ao longo do tempo.',
    [
      'O requisito pede os quinze commits em **pelo menos quatro dias distintos**. Um projeto feito numa tarde e commitado de uma vez não é o mesmo projeto: ninguém o testou de um dia para o outro, ninguém voltou a ele com a cabeça fresca.',
      'O `git log` mostra a data de cada commit na linha `Date`. É por ela que o examinador vê o projeto crescer — a tabela num dia, o menu no outro, a validação dias depois.',
      'O arquivo do banco fica fora do histórico, pelo `.gitignore`: ele é dado, e não código, e cada computador tem o seu. O cache do Python, a pasta `__pycache__`, fica de fora pelo mesmo motivo.',
    ],
    `$ git log
commit c12
Date:   2026-10-24

    Dá um exemplo de número na mensagem de entrada inválida

commit c11
Date:   2026-10-21

    Avisa quando o id não existe ao alterar ou remover`,
    'Fazer quinze commits no último dia com mensagens diferentes não muda a data de nenhum deles — e a data é o que o requisito lê.',
    ['git log', 'data do commit', '.gitignore'],
  ),
];

/* ── Módulo 7: o README ───────────────────────────────────────────────────── */

const O_README: TopicoDeVereda[] = [
  t(
    'quatro-partes',
    'As quatro partes do README',
    'O que é, como instalar, como usar e um exemplo — nessa ordem.',
    [
      'O **README** é o primeiro arquivo que alguém abre num projeto, e ele responde às perguntas na ordem em que elas aparecem: o que é isto, como ponho para funcionar, como uso, e como fica quando uso.',
      'A **descrição** diz o que o programa faz e para quem, em duas ou três frases. A **instalação** diz o que é preciso ter — o Python 3 — e como pegar o projeto. O **uso** diz o comando que abre o programa e o que o menu oferece.',
      'O **exemplo de execução** mostra uma sessão de verdade: o menu, uma escolha e a resposta. É ele que deixa alguém saber, antes de rodar, se o programa é o que procurava.',
    ],
    `# Almoxarifado do clube

## Descrição
## Instalação
## Uso
## Exemplo de execução`,
    'O README é escrito para quem nunca viu o projeto. "Rode o programa" não serve: qual programa, de que pasta, com que comando?',
    ['README', 'descrição', 'instalação', 'uso'],
  ),
  t(
    'markdown',
    'Título, seção e bloco de código',
    'O README se escreve em Markdown, que é texto com três marcas.',
    [
      'O README termina em `.md` porque é escrito em **Markdown**: texto comum, com marcas que os sites de repositório desenham. Uma linha que começa com `#` vira título; com `##`, título de seção.',
      'O que é para copiar e colar — um comando, uma sessão do programa — vai num **bloco de código**: uma linha só com três crases antes, e outra depois. Dentro dele o texto aparece exatamente como foi escrito, em letra de máquina de escrever.',
      'O resto é parágrafo comum. Uma linha em branco separa um parágrafo do outro.',
    ],
    `## Uso

Na pasta do projeto, digite:

\`\`\`
python principal.py
\`\`\``,
    'Sem o bloco, o site junta as linhas do menu numa frase só, e o exemplo deixa de parecer com a tela.',
    ['Markdown', '#', 'bloco de código'],
  ),
  t(
    'exemplo-de-verdade',
    'Um exemplo que aconteceu',
    'Rodar o programa, e colar o que ele escreveu.',
    [
      'O exemplo de execução não se escreve de cabeça. Roda-se o programa, faz-se o que se quer mostrar, e cola-se o que apareceu na tela — com o menu inteiro, a escolha e a resposta.',
      'Exemplo inventado erra em detalhe: uma opção com outro número, uma frase que o programa não escreve. Quem chega compara o exemplo com a tela, acha a diferença, e conclui que instalou errado.',
      'E o README entra no repositório como todo o resto: `git add README.md` e um commit. Mexeu depois? Outro commit — o README que está no disco precisa ser o do último commit.',
    ],
    `${MENU}
Escolha: 2
1 - Barraca: 4
2 - Lanterna: 10`,
    'O que se digita não aparece na saída do programa. No README, escreva a escolha depois da pergunta, como ela aparece na tela de quem digitou.',
    ['exemplo de execução', 'git add README.md'],
  ),
];

/* ── Módulo 8: o diário de bordo ──────────────────────────────────────────── */

const O_DIARIO: TopicoDeVereda[] = [
  t(
    'para-que-serve',
    'Para que serve um diário de bordo',
    'O registro do que deu errado é o que faz o próximo projeto dar menos errado.',
    [
      'O **diário de bordo** é onde se anota o que aconteceu no caminho: o problema que travou o projeto, o que apareceu na tela, e o que foi feito. Navegador anota o tempo e o vento; programador anota o erro e a solução.',
      'Ele serve a duas pessoas. A você, no próximo projeto, quando o mesmo `ValueError` aparecer e você lembrar que já resolveu isso uma vez. E a quem examina, que vê no diário o que o código não mostra: o caminho até ele.',
      'O requisito pede os **três maiores** problemas. Escolher é parte do trabalho — quem registra tudo não disse qual pesou.',
    ],
    `Problema 2
  O que deu errado: cadastrar o mesmo material duas vezes
  fechava o programa no meio do menu.
  Como apareceu: sqlite3.IntegrityError, UNIQUE constraint
  failed: materiais.nome
  Solução: pus o cadastrar num try com except
  sqlite3.IntegrityError, que avisa e volta ao menu.`,
    'O diário se escreve perto de quando aconteceu. Uma semana depois, o que sobra é "deu um erro no banco", que não ajuda ninguém.',
    ['diário de bordo', 'registro'],
  ),
  t(
    'problema-sintoma-solucao',
    'Problema, sintoma e solução',
    'Três coisas diferentes, e cada uma tem o seu lugar no registro.',
    [
      'O **sintoma** é o que apareceu na tela: a mensagem de erro, o resultado estranho, o silêncio. O **problema** é a causa: o que estava errado no programa. A **solução** é o que se mudou, e por que isso resolveu.',
      '"O programa fechou" é sintoma. "O int() recebia o texto que a pessoa digitou sem conferir, e dez por extenso não é número" é problema. "Pus a conversão num laço com except ValueError, que pergunta de novo" é solução.',
      'Os três juntos são o que torna o registro útil: o sintoma faz alguém **reconhecer** o problema, e a solução diz o que fazer.',
    ],
    `Sintoma:   Remover o id 99 não dizia nada.
Problema:  O DELETE que não acha ninguém não é erro, e o
           programa não olhava quantas linhas tinha mexido.
Solução:   O remover devolve o rowcount, e o menu avisa
           quando ele é zero.`,
    'A solução que só repete o problema — "o programa fechava, aí eu arrumei" — preenche o campo e não ensina nada a quem ler.',
    ['sintoma', 'causa', 'solução'],
  ),
  t(
    'escolher-os-tres',
    'Escolher os três maiores',
    'Maior é o que mais custou, ou o que mais ensinou — e não o primeiro que veio à cabeça.',
    [
      'Um problema é grande quando **custou**: tempo para achar, trabalho perdido, uma tarde inteira. Ou quando **ensinou**: depois dele você passou a fazer diferente em todo o programa.',
      'Os três maiores costumam ser de naturezas diferentes. Um de entrada do usuário, um de banco, um de organização — o commit que juntou tudo, o arquivo que ninguém importava.',
      'Problemas que se repetem contam uma vez. Três registros sobre o mesmo `ValueError` em três perguntas diferentes são um problema só, resolvido por uma função só.',
    ],
    `Candidatos
  - "dez" na quantidade fechava o programa       (entrada)
  - o nome repetido fechava o programa           (banco)
  - o remover não dizia nada                     (banco)
  - o git add . juntava quatro assuntos          (organização)

Escolhidos: o primeiro, o segundo e o quarto.`,
    'O diário não é lugar de esconder o erro bobo. O commit esquecido que apagou uma hora de trabalho é grande, por mais simples que tenha sido a solução.',
    ['escolha', 'prioridade'],
  ),
];

/* ── Módulo 9: a apresentação ─────────────────────────────────────────────── */

const A_APRESENTACAO: TopicoDeVereda[] = [
  t(
    'quinze-minutos',
    'O roteiro de quinze minutos',
    'Pouco sobre o problema, muito sobre o programa, e o porquê de uma decisão.',
    [
      'O requisito pede a apresentação **em até quinze minutos**. Quinze minutos acabam depressa: quem gasta oito explicando o problema mostra o programa correndo e não tem tempo de justificar nada.',
      'O roteiro tem três partes obrigatórias: o **problema e quem usa**, em uma ou duas frases; o **programa funcionando**, que leva a maior fatia; e a **decisão técnica**, com o porquê. O que sobrar fica para as perguntas.',
      'Ensaiar com relógio é o único jeito de saber se cabe. Na primeira vez, quase nunca cabe.',
    ],
    `Problema e quem usa ............ 2 min
O programa funcionando .......... 7 min
A decisão técnica ............... 3 min
Perguntas ....................... 3 min
                                 ------
                                 15 min`,
    'A proposta aprovada é o ponto de partida da fala: o examinador vai comparar o que você mostra com o que você prometeu.',
    ['roteiro', 'quinze minutos'],
  ),
  t(
    'demonstrar',
    'Demonstrar o programa',
    'Mostrar rodando, com um roteiro do que digitar — inclusive o erro.',
    [
      '**Demonstrar** é rodar o programa na frente do examinador e fazer as quatro operações: cadastrar, listar, alterar e remover. Explicar o código não é demonstrar; o requisito pede o programa **funcionando**.',
      'Um roteiro do que digitar evita o branco na hora: que materiais cadastrar, que id alterar. E ele deve incluir **um erro de propósito** — digitar "dez" na quantidade, cadastrar um nome repetido. É o erro que mostra a validação e o tratamento, que são metade do requisito 3.',
      'Comece com o banco vazio, ou com poucos materiais. Uma lista de trinta itens na tela esconde o que acabou de mudar.',
    ],
    `Roteiro da demonstração
  1  cadastrar Barraca, 4
  1  cadastrar Lanterna, 10
  1  cadastrar Barraca de novo   ← o erro de propósito
  2  listar
  3  alterar o 2 para 12
  4  remover o 1
  2  listar de novo`,
    'Programa que trava na demonstração acontece. Quem ensaiou sabe onde travou e diz o que aconteceu — que é o requisito 3.4 acontecendo ao vivo.',
    ['demonstração', 'roteiro', 'erro de propósito'],
  ),
  t(
    'decisao-tecnica',
    'Justificar uma decisão técnica',
    'Uma escolha que o projeto fez, a outra que ele poderia ter feito, e por que esta.',
    [
      'Uma **decisão técnica** é uma escolha sobre como o programa foi feito: guardar num banco e não num CSV, separar o código em três arquivos, deixar o banco recusar o nome repetido. O requisito pede para justificar **uma**.',
      'Justificar é comparar. "Usei o SQLite porque é melhor" não justifica nada. "Usei o SQLite e não um CSV porque o CSV teria de ser lido e reescrito inteiro para mudar a quantidade de uma lanterna, e o UPDATE muda só aquela linha" justifica.',
      'A justificativa traz um exemplo do próprio programa, e diz o que se perde. Toda decisão tem custo: o banco é um arquivo que não se abre num editor de texto, e quem escolheu precisa saber disso.',
    ],
    `Decisão:     deixar o banco recusar o nome repetido (UNIQUE)
Alternativa: conferir com um SELECT antes de cada INSERT
Por quê:     se outro programa gravar no mesmo arquivo, a
             conferência do meu programa não o alcança; o
             UNIQUE vale para todos, e o meu programa só
             precisa apanhar o IntegrityError e avisar.`,
    'Escolha a decisão que você sabe defender com as suas palavras. O examinador vai perguntar "e se fosse do outro jeito?" — e a resposta tem de estar na justificativa.',
    ['decisão técnica', 'alternativa', 'justificativa'],
  ),
];

/* ── Os laboratórios de Python ────────────────────────────────────────────── */

const BANCO_NA_PASTA = { arquivo: ARQUIVO_DO_BANCO, semente: SEMENTE_VAZIA };

/** O cabeçalho dos modelos: o enunciado mora no modelo, onde fica à vista enquanto se escreve. */
const ENUNCIADO_DO_MENU = `# O menu combinado, que é o contrato do programa:
#
${MENU.split('\n').map(l => `#   ${l}`).join('\n')}
#
# Perguntas, nesta ordem e com estas palavras:
#   Escolha:            (sempre, depois do menu)
#   Nome:  Quantidade:  (para cadastrar)
#   Id:  Nova quantidade:  (para alterar)
#   Id:                 (para remover)
#
# Cada material sai listado como "1 - Barraca: 4", em ordem de nome.
# A opção 0 escreve "${DESPEDIDA}" e termina.`;

const sobre = (cabecalho: string, codigo: string) => `${cabecalho}\n\n${codigo}`;

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DO_PROJETO_DE_PROGRAMA: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'A proposta',
    resumo: 'O problema, quem usa, as funcionalidades — e a aprovação antes de tudo.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4, titulo: 'Antes de escrever uma linha', resumo: 'O problema, o usuário-alvo, a lista do que o programa faz, e por que se aprova antes.', topicos: A_PROPOSTA },
      { id: 'm1-lab', tipo: 'projeto-de-programa', licao: 'proposta', titulo: 'Escrevendo a proposta do almoxarifado', resumo: 'O problema do armário, quem usa, as quatro operações e a aprovação.', verificacoes: ['problema-e-usuario', 'quatro-operacoes', 'aprovada-antes'] },
    ],
  },
  {
    id: 'm2', titulo: 'O esqueleto',
    resumo: 'Dois arquivos, a conexão, a tabela que se cria sozinha e a função principal.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4, titulo: 'Um programa em mais de um arquivo', resumo: 'Cada arquivo com um assunto, o CREATE TABLE IF NOT EXISTS e o main.', topicos: O_ESQUELETO },
      {
        id: 'm2-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O banco do almoxarifado',
        resumo: 'O banco.py que conecta e cria a tabela, e o principal que o chama.',
        arquivo: 'principal.py',
        projeto: 'almoxarifado',
        /* O banco nasce vazio, sem tabela nenhuma: é o programa que a cria. Sem
           'roda': um arquivo só de comentários roda até o fim. Quem garante que
           o programa rodou é a tabela estar no arquivo depois. */
        banco: BANCO_NA_PASTA,
        bancoEsperado: [{ tabela: 'materiais', colunas: ['id', 'nome', 'quantidade'] }],
        verificacoes: ['conectaAoBanco', 'tresFuncoes', 'importaDoProjeto', 'bancoComoEsperado'],
        arquivosDoProjeto: [
          {
            nome: 'banco.py',
            editavel: true,
            modelo: `# Tudo o que fala com o banco mora aqui.
#
# Escreva duas funções:
#   conectar()            abre o ${ARQUIVO_DO_BANCO} e devolve a conexão;
#   criar_tabela(conexao) cria a tabela materiais, se ela não existir.
`,
          },
        ],
        modelo: `# O banco do almoxarifado
#
# O programa tem dois arquivos. Este, o principal.py, é o que se executa;
# o banco.py, ao lado, é seu para escrever.
#
# A tabela se chama materiais e tem três colunas:
#   id          número inteiro, a chave primária;
#   nome        texto, obrigatório e sem repetição;
#   quantidade  número inteiro, obrigatório.
#
# Aqui no principal.py, escreva uma função main que conecta, cria a tabela
# e escreve "Banco pronto." — e chame a main no fim do arquivo.

`,
      },
    ],
  },
  {
    id: 'm3', titulo: 'O menu e as quatro operações',
    resumo: 'Cadastrar, listar, alterar e remover, num menu que volta.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4, titulo: 'Criar, consultar, alterar, remover', resumo: 'O menu em laço, os quatro comandos com ?, e o rowcount.', topicos: O_MENU },
      {
        id: 'm3-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O menu do almoxarifado',
        resumo: 'Duas barracas viram uma lanterna: as quatro operações, com a entrada do enunciado.',
        arquivo: 'principal.py',
        projeto: 'almoxarifado',
        /* O roteiro cadastra dois, lista, altera um e remove o outro. O banco no
           fim é o que prova que as quatro aconteceram; a listagem prova que o
           consultar mostra. Os ids saem da ordem do cadastro, porque o banco
           nasce vazio. */
        banco: BANCO_NA_PASTA,
        entradaPadrao: ROTEIRO_DO_CRUD,
        saidaContem: ['1 - Barraca: 4', '2 - Lanterna: 10'],
        bancoEsperado: [{
          tabela: 'materiais',
          presentes: [{ nome: 'Lanterna', quantidade: 12 }],
          ausentes: [{ nome: 'Barraca' }],
        }],
        verificacoes: ['usaParametros', 'mostraDoBanco', 'bancoComoEsperado'],
        arquivosDoProjeto: [{ nome: 'banco.py', editavel: true, modelo: BANCO_DO_ESQUELETO }],
        modelo: sobre(`# O menu do almoxarifado
#
# O banco.py ao lado já conecta e cria a tabela. Escreva nele as funções
# cadastrar, listar, alterar e remover — com os valores separados do
# comando, por ? — e faça o principal.py chamar cada uma pelo menu.
#
${ENUNCIADO_DO_MENU}
#
# A entrada que o programa vai receber está no painel de entrada:
#   cadastra Barraca (4) e Lanterna (10), lista, muda a Lanterna (id 2)
#   para 12, remove a Barraca (id 1), lista de novo e sai.`, PRINCIPAL_DO_ESQUELETO),
      },
    ],
  },
  {
    id: 'm4', titulo: 'Validar a entrada',
    resumo: 'Nome vazio, número escrito por extenso, quantidade negativa: perguntar de novo.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4, titulo: 'O teclado não é confiável', resumo: 'O que pode chegar, a função que pergunta de novo, e o que o banco não confere.', topicos: VALIDAR },
      {
        id: 'm4-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O almoxarifado que pergunta de novo',
        resumo: 'Cada pergunta recebe primeiro uma resposta errada, e o programa não pode cair nem gravar errado.',
        arquivo: 'principal.py',
        projeto: 'almoxarifado',
        /* O modelo é o programa do módulo 3, que estoura no "Corda" lido como
           quantidade. Com ele o banco fica vazio e nada abre verde. */
        banco: BANCO_NA_PASTA,
        entradaPadrao: ROTEIRO_DA_VALIDACAO,
        bancoEsperado: [{
          tabela: 'materiais',
          presentes: [{ nome: 'Corda', quantidade: 8 }],
          ausentes: [{ nome: '' }],
        }],
        verificacoes: ['roda', 'tratouOErroCerto', 'bancoComoEsperado'],
        arquivosDoProjeto: [
          { nome: 'banco.py', editavel: true, modelo: BANCO_DO_CRUD },
          {
            nome: 'entrada.py',
            editavel: true,
            modelo: `# As funções que leem do teclado moram aqui.
#
#   ler_texto(pergunta)            pergunta até vir um texto que não seja vazio;
#   ler_inteiro(pergunta, minimo)  pergunta até vir um inteiro de minimo para cima.
`,
          },
        ],
        modelo: sobre(`# O almoxarifado que pergunta de novo
#
# Toda entrada precisa ser validada. Quando a resposta não serve, o
# programa diz o que estava errado e pergunta outra vez:
#
#   o nome não pode ser vazio;
#   a quantidade é um número inteiro, de 0 para cima;
#   o id é um número inteiro, de 1 para cima;
#   a opção do menu que não existe responde "Opção inválida.".
#
# Escreva as funções de leitura no entrada.py e use-as aqui.
#
# A entrada do painel erra de propósito em cada pergunta: nome vazio,
# quantidade "dez" e -3, id "abc" e -1. No fim, a Corda tem 8.`, PRINCIPAL_DO_CRUD),
      },
    ],
  },
  {
    id: 'm5', titulo: 'Erros sem fechar o programa',
    resumo: 'O nome repetido que derrubava, o id que não existe e não dizia nada.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4, titulo: 'O programa que não cai', resumo: 'O traceback, o except com nome, e o silêncio que também é erro.', topicos: ERROS },
      {
        id: 'm5-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O almoxarifado que avisa',
        resumo: 'A Corda cadastrada duas vezes e o id 99, com o programa de pé e dizendo o que houve.',
        arquivo: 'principal.py',
        projeto: 'almoxarifado',
        /* O modelo é o do módulo 4: valida o teclado, e cai no nome repetido.
           O banco no fim é o mesmo antes e depois do conserto — a primeira
           Corda entra nos dois —, e por isso não é verificação aqui: abriria
           verde. Quem separa é rodar até o fim e dizer as duas frases. */
        banco: BANCO_NA_PASTA,
        entradaPadrao: ROTEIRO_DOS_ERROS,
        saidaContem: ['Já existe um material com esse nome.', 'Nenhum material com esse id.', DESPEDIDA],
        verificacoes: ['roda', 'avisaOsErros'],
        arquivosDoProjeto: [
          { nome: 'banco.py', editavel: true, modelo: BANCO_DO_CRUD },
          { nome: 'entrada.py', editavel: true, modelo: ENTRADA_VALIDADA },
        ],
        modelo: sobre(`# O almoxarifado que avisa
#
# Dois erros que não são culpa do teclado:
#
#   cadastrar um nome que já existe — o banco recusa, e o programa
#   precisa dizer "Já existe um material com esse nome." e seguir;
#
#   alterar ou remover um id que não existe — o banco não reclama,
#   e o programa precisa dizer "Nenhum material com esse id.".
#
# Nos dois casos o programa volta ao menu. Nada de except sem nome.
#
# A entrada do painel cadastra a Corda duas vezes, tenta remover o
# id 99, lista e sai.`, PRINCIPAL_VALIDADO),
      },
    ],
  },
  {
    id: 'm6', titulo: 'Versionar',
    resumo: 'Um assunto por commit, mensagens que dizem, e o quarto dia do histórico.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4, titulo: 'Quinze commits em quatro dias', resumo: 'O commit pequeno, a mensagem, e o calendário do histórico.', topicos: VERSIONAR },
      { id: 'm6-lab', tipo: 'terminal', computador: 'almoxarifado-versionamento', titulo: 'Guardando a noite de trabalho', resumo: 'Quatro mudanças sem commit, e cada uma no seu.', verificacoes: ['quinzeCommits', 'quatroDias', 'umAssuntoPorCommit', 'mensagensQueDizem', 'arvoreLimpa'] },
    ],
  },
  {
    id: 'm7', titulo: 'O README',
    resumo: 'Descrição, instalação, uso e um exemplo de verdade.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4, titulo: 'A porta de entrada do projeto', resumo: 'As quatro partes, o Markdown e o exemplo colado da tela.', topicos: O_README },
      { id: 'm7-lab', tipo: 'terminal', computador: 'almoxarifado-readme', titulo: 'Escrevendo o README do almoxarifado', resumo: 'As quatro partes no editor, e o README no histórico.', verificacoes: ['leiameDescreve', 'leiameInstala', 'leiameUsa', 'leiameExemplo', 'leiameVersionado'] },
    ],
  },
  {
    id: 'm8', titulo: 'O diário de bordo',
    resumo: 'Os três maiores problemas, como apareceram e o que se fez.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4, titulo: 'O que deu errado, e o que se fez', resumo: 'Para que serve, sintoma e causa, e como escolher os três.', topicos: O_DIARIO },
      { id: 'm8-lab', tipo: 'projeto-de-programa', licao: 'diario', titulo: 'Escrevendo o diário do almoxarifado', resumo: 'Três problemas do caminho, com o sintoma e a solução de cada um.', verificacoes: ['tres-problemas', 'como-apareceu', 'solucao-de-cada'] },
    ],
  },
  {
    id: 'm9', titulo: 'A apresentação',
    resumo: 'Quinze minutos: o programa funcionando e uma decisão justificada.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4, titulo: 'Quinze minutos com o examinador', resumo: 'O roteiro, a demonstração com o erro de propósito, e a decisão técnica.', topicos: A_APRESENTACAO },
      { id: 'm9-lab', tipo: 'projeto-de-programa', licao: 'apresentacao', titulo: 'Preparando os quinze minutos', resumo: 'O roteiro com a demonstração no centro, o que mostrar rodando e a decisão justificada.', verificacoes: ['cabe-em-quinze', 'demonstracao-no-centro', 'mostra-funcionando', 'decisao-justificada'] },
    ],
  },
];
