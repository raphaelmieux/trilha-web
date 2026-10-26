import type { ModuloDeVereda, TopicoDeVereda } from './veredas';
import { QUESTOES_DE_SQL as Q } from './questoesDeSql';
import { MEMBROS_NO_BANCO, SEMENTE_DO_CLUBE, NOVO_MEMBRO, membro, unidadePeloNome } from '../labs/bancoDoClube';

/*
 * A vereda CC005 SQL.
 *
 * ── De onde ela vem ──────────────────────────────────────────────────────
 * Da CC004. Lá o programa aprende a guardar em arquivo — um texto, um CSV, um
 * JSON —, e isso basta enquanto quem lê o arquivo é o próprio programa que o
 * escreveu. Para de bastar quando são sessenta e dois membros, seis unidades,
 * as especialidades de cada um e duas pessoas mexendo ao mesmo tempo: é aí
 * que entra o banco de dados.
 *
 * ── O banco é o do clube ─────────────────────────────────────────────────
 * Os mesmos sessenta e um membros das veredas de escritório, com as mesmas
 * unidades e os mesmos conselheiros, e um a mais que chegou ontem. Todo
 * exemplo da teoria roda nele, e a trava `exemplosDeSql.test.ts` confere que o
 * resultado escrito ao lado é o que o SQLite devolve.
 *
 * ── A ordem ──────────────────────────────────────────────────────────────
 * Não é a do documento, e é de propósito: o documento lista o que se cobra, e
 * não a ordem em que se aprende. Consultar vem antes de criar — quem nunca leu
 * uma tabela não sabe que tipo dar a uma coluna —, e o diagrama vem antes do
 * CREATE TABLE, porque é assim que se faz na vida: desenha-se e só então se
 * escreve. Os requisitos estão todos aqui, cada um no módulo que o ensina.
 */

/** Um tópico com o exemplo desenhado como texto: um diagrama, uma comparação. */
const t = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'texto' as const, atencao, marcas,
});

/** Um tópico com SQL de verdade, e o resultado que o banco devolve. */
const sql = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, exemploSaida: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'sql' as const, exemploSaida, atencao, marcas,
});

/** Um tópico com Python, e o que o programa escreve. */
const py = (
  id: string, titulo: string, resumo: string,
  explicacao: string[], exemplo: string, exemploSaida: string, atencao: string, marcas: string[],
): TopicoDeVereda => ({
  id, titulo, resumo, explicacao, exemplo, exemploComo: 'python' as const, exemploSaida, atencao, marcas,
});

const AGUIA = unidadePeloNome('Águia').id;
const JAGUAR = unidadePeloNome('Jaguar').id;
const ONCA = unidadePeloNome('Onça').id;

/* ── Módulo 1: o banco de dados ───────────────────────────────────────────── */

const O_BANCO: TopicoDeVereda[] = [
  t(
    'banco-de-dados',
    'Banco de dados e quem cuida dele',
    'Um lugar organizado para guardar informação, e o programa que o mantém.',
    [
      'Um **banco de dados** é informação guardada de um jeito organizado, para que se possa procurar, juntar e mudar sem bagunçar o resto. A lista de membros do clube, as unidades, as especialidades que cada um conquistou: tudo isso cabe num banco.',
      'Ninguém mexe no banco direto no disco. Quem cuida dele é um programa chamado **sistema gerenciador de banco de dados**, o SGBD. É ele que recebe os pedidos, confere se fazem sentido, guarda e devolve. SQLite, PostgreSQL e MySQL são SGBDs.',
      'Nesta vereda o SGBD é o **SQLite**. Ele guarda o banco inteiro num arquivo só — o `clube.db` — e vem dentro do Python, então o mesmo banco que você consulta no editor é o que o seu programa vai abrir no módulo 9.',
    ],
    `O banco do clube, no arquivo clube.db

  unidades   as seis unidades, com conselheiro e telefone
  membros    os sessenta e dois membros, com idade e unidade

Quem abre, procura e grava: o SQLite, que é o SGBD.`,
    'Planilha e banco se parecem, e não são a mesma coisa. Na planilha qualquer célula aceita qualquer coisa; no banco cada coluna tem regra, e o SGBD recusa o que não cumpre.',
    ['banco de dados', 'SGBD', 'SQLite'],
  ),
  sql(
    'tabela-linha-coluna',
    'Tabela, linha e coluna',
    'O banco guarda tabelas; cada linha é uma coisa, cada coluna é um dado dela.',
    [
      'O banco guarda **tabelas**, e cada tabela é sobre um assunto só: a de unidades fala de unidades, a de membros fala de membros.',
      'Cada **linha** é uma coisa daquele assunto — uma unidade, um membro. Cada **coluna** é um dado que toda linha tem: o nome, a idade, o telefone. A tabela de unidades tem seis linhas e quatro colunas.',
      'Para ver uma tabela inteira, pede-se `SELECT * FROM unidades;`. O asterisco quer dizer "todas as colunas", e sem filtro vêm todas as linhas.',
    ],
    'SELECT * FROM unidades;',
    `id | nome | conselheiro | telefone
1 | Falcão | Tio Samuel | (61) 99812-4410
2 | Águia | Tia Rute | (61) 99654-2087
3 | Tucano | Tia Joana | (61) 98433-1902
4 | Arara | Tio Márcio | (61) 99271-5536
5 | Jaguar | Tia Priscila | (61) 98815-6724
6 | Onça | Tio Edson | (61) 99540-3318`,
    'Toda linha de uma tabela tem as mesmas colunas. Quando um dado não existe, a coluna fica vazia — e o vazio no banco tem nome, NULL, que é assunto do módulo 2.',
    ['tabela', 'linha', 'coluna', 'SELECT *'],
  ),
  sql(
    'primeira-consulta',
    'A consulta',
    'Um pedido ao banco, que devolve uma tabela como resposta.',
    [
      'Uma **consulta** é um pedido feito ao banco, e a resposta dela é sempre uma tabela. `SELECT` diz quais colunas você quer, e `FROM` diz de qual tabela.',
      'Pedir só as colunas de que se precisa é o hábito certo: `SELECT nome, conselheiro FROM unidades;` devolve duas colunas, e não as quatro.',
      'O `AS` dá outro nome a uma coluna **só no resultado**. A tabela continua igual; é o cabeçalho da resposta que muda — útil quando o resultado vai para um relatório.',
    ],
    'SELECT nome AS Unidade, conselheiro AS Conselheiro FROM unidades;',
    `Unidade | Conselheiro
Falcão | Tio Samuel
Águia | Tia Rute
Tucano | Tia Joana
Arara | Tio Márcio
Jaguar | Tia Priscila
Onça | Tio Edson`,
    'Consultar não muda nada no banco. Pode consultar à vontade: SELECT só lê.',
    ['consulta', 'SELECT', 'FROM', 'AS'],
  ),
];

/* ── Módulo 2: filtrar e ordenar ──────────────────────────────────────────── */

const PERGUNTAR: TopicoDeVereda[] = [
  sql(
    'filtro',
    'O filtro: WHERE',
    'Só as linhas que cumprem uma condição.',
    [
      'O `WHERE` vem depois do `FROM` e diz que linhas entram na resposta. `WHERE idade >= 14` deixa passar só quem tem catorze anos ou mais.',
      'Duas condições juntas usam `AND` (as duas precisam valer) ou `OR` (basta uma). Texto vai entre **aspas simples**: `WHERE nome = \'Lara Cunha\'`.',
      'A unidade de cada membro está guardada pelo número dela, e não pelo nome — o porquê é o módulo 3. Por enquanto, olhe a tabela de unidades para saber que a Onça é a de número ' + ONCA + '.',
    ],
    `SELECT nome, idade FROM membros WHERE unidade_id = ${ONCA} AND idade >= 14;`,
    `nome | idade
Otávio Lins | 14
Nicolas Paiva | 14
Valentina Couto | 15`,
    'Aspas duplas, no SQLite, são para nome de coluna. Escrever WHERE nome = "Lara Cunha" funciona por acaso e erra no dia em que existir uma coluna com aquele nome.',
    ['WHERE', 'AND', 'OR'],
  ),
  sql(
    'ordem',
    'A ordem: ORDER BY',
    'Sem pedir, o banco não promete ordem nenhuma.',
    [
      'O `ORDER BY` diz em que ordem as linhas voltam. `ORDER BY idade` vai do menor para o maior; `ORDER BY idade DESC` vai do maior para o menor.',
      'Dá para desempatar: `ORDER BY idade DESC, nome` ordena pela idade e, entre os de mesma idade, pelo nome.',
      'Sem `ORDER BY`, a ordem que aparece é a que o banco achou mais fácil — hoje pode ser a da inscrição, amanhã outra. Quem precisa de ordem pede.',
    ],
    `SELECT nome, idade FROM membros WHERE unidade_id = ${JAGUAR} ORDER BY idade DESC, nome;`,
    `nome | idade
Bernardo Quintela | 15
Henrique Dias | 14
Luana Teles | 13
Melissa Duarte | 12
Natália Brito | 12
Théo Vasques | 12
Gael Martins | 11
Lívia Amorim | 11`,
    'O ORDER BY vem no fim, depois do WHERE. Escrito antes, o banco recusa com erro de sintaxe.',
    ['ORDER BY', 'DESC'],
  ),
  sql(
    'nulo',
    'O vazio: NULL',
    'O dado que não se sabe, e a pergunta certa para achá-lo.',
    [
      'Quando um dado não existe, a coluna guarda **NULL**, que quer dizer "não se sabe". Uma das duas Ana Clara Ribeiro do clube está sem idade registrada.',
      'Nada é igual a NULL — nem o próprio NULL. Por isso `WHERE idade = NULL` roda sem erro e **não acha ninguém**: a pergunta está errada, e o banco responde com zero linhas.',
      'Para perguntar pelo vazio, escreve-se `IS NULL`. E `IS NOT NULL` para quem tem o dado.',
    ],
    'SELECT nome, unidade_id FROM membros WHERE idade IS NULL;',
    `nome | unidade_id
Ana Clara Ribeiro | 3`,
    'Zero linhas não é zero erro. Uma consulta que não devolve nada pode estar perguntando do jeito errado.',
    ['NULL', 'IS NULL'],
  ),
  t(
    'imperativa-declarativa',
    'Dizer como, ou dizer o quê',
    'Python diz o caminho passo a passo; SQL diz o que quer e deixa o banco achar.',
    [
      'Em Python você escreve **como** achar: percorrer a lista, testar cada um, guardar quem serve, ordenar, imprimir. Isso é uma linguagem **imperativa** — o programa é uma sequência de ordens.',
      'Em SQL você escreve **o que** quer: o nome e a idade de quem é da Águia, do mais velho ao mais novo. Como achar é problema do SGBD. Isso é uma linguagem **declarativa**.',
      'As duas chegam na mesma resposta. A diferença aparece quando a tabela cresce: o banco escolhe sozinho o caminho mais rápido, e o laço em Python continua percorrendo um por um.',
    ],
    `Em Python, o caminho:

  aguia = []
  for nome, idade, unidade_id in membros:
      if unidade_id == ${AGUIA}:
          aguia.append((nome, idade))
  aguia.sort(key=lambda par: par[1], reverse=True)

Em SQL, o pedido:

  SELECT nome, idade FROM membros
  WHERE unidade_id = ${AGUIA}
  ORDER BY idade DESC;`,
    'Declarativo não quer dizer mágico: o banco só acha o que você pediu. Pedido errado, resposta certa para a pergunta errada.',
    ['imperativa', 'declarativa'],
  ),
];

/* ── Módulo 3: chaves e junção ────────────────────────────────────────────── */

const CHAVES: TopicoDeVereda[] = [
  sql(
    'chave-primaria',
    'A chave primária',
    'A coluna que diz, sem dúvida, de quem é cada linha.',
    [
      'A **chave primária** é a coluna que identifica cada linha sem confusão possível. Duas linhas nunca têm a mesma chave, e nenhuma fica sem.',
      'O nome não serve para isso: o clube tem duas Ana Clara Ribeiro, uma no Tucano e outra na Arara. Quem diz de qual se está falando é o `id`, um número que o banco dá a cada membro.',
      'No SQLite, uma coluna `id INTEGER PRIMARY KEY` se numera sozinha: quem insere um membro novo não precisa escolher o número.',
    ],
    "SELECT id, nome, unidade_id FROM membros WHERE nome = 'Ana Clara Ribeiro';",
    `id | nome | unidade_id
54 | Ana Clara Ribeiro | 3
56 | Ana Clara Ribeiro | 4`,
    'Chave não é o dado mais importante: é o que não muda e não se repete. Nome muda (casou, corrigiu a grafia) e se repete.',
    ['chave primária', 'PRIMARY KEY', 'id'],
  ),
  sql(
    'chave-estrangeira',
    'A chave estrangeira',
    'A coluna que aponta para a chave de outra tabela.',
    [
      'O membro não guarda o nome da unidade: guarda o **número** dela, na coluna `unidade_id`. Essa coluna é uma **chave estrangeira** — ela aponta para a chave primária da tabela de unidades.',
      'Assim o nome da unidade e o telefone do conselheiro moram num lugar só. Quando o telefone muda, muda numa linha, e todo membro passa a "ver" o novo.',
      'A chave estrangeira também é uma regra: o banco recusa um membro numa unidade que não existe. A recusa é o banco protegendo o que está guardado.',
    ],
    "INSERT INTO membros (nome, idade, unidade_id) VALUES ('Teste', 12, 9);",
    'Erro na linha 1: FOREIGN KEY constraint failed',
    'No SQLite essa regra vem desligada, e se liga com PRAGMA foreign_keys = ON. O editor desta vereda a liga sozinho, como fazem os programas de banco.',
    ['chave estrangeira', 'REFERENCES', 'FOREIGN KEY'],
  ),
  sql(
    'juncao',
    'Juntar duas tabelas: JOIN',
    'Buscar na outra tabela o que a chave estrangeira aponta.',
    [
      'Para mostrar o membro com o **nome** da unidade, junta-se as duas tabelas: `FROM membros JOIN unidades ON membros.unidade_id = unidades.id`.',
      'O `ON` diz qual coluna de um lado combina com qual do outro: a estrangeira com a primária. Como as duas tabelas têm uma coluna `nome`, escreve-se o nome da tabela na frente — `membros.nome`, `unidades.nome`.',
      'Esquecer o `ON` não dá erro: `FROM membros, unidades` junta cada membro com **cada** unidade, e sai uma tabela seis vezes maior, com cada pessoa em todas as unidades.',
    ],
    `SELECT membros.nome AS membro, unidades.nome AS unidade FROM membros
JOIN unidades ON membros.unidade_id = unidades.id
WHERE membros.idade = 15;`,
    `membro | unidade
Felipe Andrade | Arara
Matheus Ferraz | Arara
Bernardo Quintela | Jaguar
Marina Sobral | Tucano
Lucas Peixoto | Falcão
Beatriz Carvalho | Águia
Valentina Couto | Onça`,
    'Junção pela coluna errada também não dá erro. ON membros.id = unidades.id junta o membro 1 com a unidade 1, e devolve seis linhas com cara de certas.',
    ['JOIN', 'ON'],
  ),
  sql(
    'juncao-esquerda',
    'Quem não tem par: LEFT JOIN',
    'A junção comum só devolve quem tem par dos dois lados.',
    [
      'O Kauã Medeiros entrou ontem e ainda não tem unidade: a coluna dele é NULL. Numa junção comum ele **some** — não há unidade para combinar com ele.',
      'O `LEFT JOIN` guarda todo mundo da tabela da esquerda, tenha par ou não. Onde não há par, as colunas da outra tabela vêm vazias.',
      'Contar as linhas é o jeito de perceber: são sessenta e dois membros, e a junção comum devolve sessenta e um.',
    ],
    `SELECT membros.nome AS membro, unidades.nome AS unidade FROM membros
LEFT JOIN unidades ON membros.unidade_id = unidades.id
WHERE membros.idade = 10;`,
    `membro | unidade
Isabela Moreira | Onça
Paula Nogueira | Águia
Alice Rangel | Águia
Arthur Bezerra | Falcão
Antônia Freire | Tucano
Rebeca Fialho | Onça
Renato Villela | Arara
Rodrigo Lemos | Falcão
Ana Clara Ribeiro | Arara
Kauã Medeiros | NULL`,
    'A lista sem o Kauã parece completa. Ninguém estranha sessenta e uma linhas — é por isso que se confere.',
    ['LEFT JOIN'],
  ),
];

/* ── Módulo 4: contar e agrupar ───────────────────────────────────────────── */

const AGRUPAR: TopicoDeVereda[] = [
  sql(
    'agregacao',
    'As funções de agregação',
    'Muitas linhas viram um número: quantos, a soma, a média, o menor, o maior.',
    [
      '`COUNT`, `SUM`, `AVG`, `MIN` e `MAX` são **funções de agregação**: recebem uma coluna inteira e devolvem um número só.',
      '`COUNT(*)` conta linhas; `COUNT(idade)` conta só as que têm idade. A diferença entre as duas é quem está sem o dado.',
      'O `AVG` deixa o NULL de fora sozinho: a média de idade é a de quem tem idade registrada. Somar e dividir pelo total de linhas contaria o vazio como alguém.',
    ],
    'SELECT COUNT(*), COUNT(idade), MIN(idade), MAX(idade) FROM membros;',
    `COUNT(*) | COUNT(idade) | MIN(idade) | MAX(idade)
62 | 61 | 10 | 15`,
    'No SQLite, inteiro dividido por inteiro dá inteiro: SUM(idade) / COUNT(*) corta as casas decimais sem avisar. O AVG não tem esse problema.',
    ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
  ),
  sql(
    'agrupamento',
    'Uma conta por grupo: GROUP BY',
    'A mesma função, feita separada para cada unidade.',
    [
      'Sem `GROUP BY`, `COUNT(*)` conta a tabela inteira. Com `GROUP BY unidades.nome`, conta **uma vez para cada unidade**, e a resposta tem uma linha por unidade.',
      'Toda coluna do `SELECT` que não está dentro de uma função precisa estar no `GROUP BY` — é ela que dá nome a cada grupo.',
      'Juntar e agrupar andam juntos: a junção traz o nome da unidade, e o agrupamento conta por ele.',
      'Repare na ordem do exemplo: o Tucano vem antes da Águia. O SQLite ordena texto pelo código de cada letra, e o Á, com acento, vem depois do Z.',
    ],
    `SELECT unidades.nome, COUNT(*) AS membros FROM membros
JOIN unidades ON membros.unidade_id = unidades.id
GROUP BY unidades.nome
ORDER BY membros DESC, unidades.nome;`,
    `nome | membros
Falcão | 16
Tucano | 10
Águia | 10
Arara | 9
Jaguar | 8
Onça | 8`,
    'O SQLite aceita uma coluna solta fora do GROUP BY e põe nela o valor de uma linha qualquer do grupo. Não dá erro, e o número ao lado é de outra pessoa.',
    ['GROUP BY'],
  ),
  sql(
    'having',
    'Filtrar o grupo: HAVING',
    'O WHERE filtra linhas antes; o HAVING filtra grupos depois.',
    [
      'O `WHERE` decide que linhas entram **antes** de agrupar. Nessa hora a contagem ainda não existe, e por isso `WHERE COUNT(*) > 9` é recusado.',
      'O `HAVING` vem depois do `GROUP BY` e filtra os grupos já contados: `HAVING COUNT(*) > 9` deixa só as unidades grandes.',
      'Os dois podem estar na mesma consulta: o `WHERE` escolhe as pessoas, o `GROUP BY` agrupa, e o `HAVING` escolhe os grupos.',
    ],
    `SELECT unidades.nome, ROUND(AVG(membros.idade), 2) AS media FROM membros
JOIN unidades ON membros.unidade_id = unidades.id
GROUP BY unidades.nome
HAVING AVG(membros.idade) > 12.5;`,
    `nome | media
Arara | 12,56`,
    'A ordem das partes é fixa: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY. Fora dela, o banco recusa.',
    ['HAVING'],
  ),
];

/* ── Módulo 5: o dado repetido ────────────────────────────────────────────── */

const REPETIDO: TopicoDeVereda[] = [
  t(
    'normalizacao',
    'Normalização: cada dado num lugar',
    'Guardar cada informação uma vez só, e apontar para ela.',
    [
      '**Normalizar** é organizar as tabelas para que cada informação seja guardada uma vez só. O telefone do conselheiro mora na tabela de unidades; quem precisa dele aponta para a unidade.',
      'A lista do acampamento foi montada em fevereiro copiando o nome da unidade, o conselheiro e o telefone em cada inscrição. Ficou fácil de ler — e passou a existir o mesmo telefone em dois lugares.',
      'Dado repetido em tabelas distintas é dado que **envelhece separado**: muda-se num lugar, o outro fica como estava, e o banco passa a ter duas respostas para a mesma pergunta.',
    ],
    `Antes: o telefone copiado em cada inscrição

  inscricoes: id | membro_id | unidade | conselheiro | telefone_do_conselheiro | diarias

Depois: a inscrição guarda só o que é dela

  inscricoes: id | membro_id | diarias
  membros:    id | nome | idade | unidade_id
  unidades:   id | nome | conselheiro | telefone`,
    'Repetir parece economizar uma junção. O que se economiza na consulta se paga na primeira mudança.',
    ['normalização', 'redundância'],
  ),
  sql(
      'anomalia',
      'O problema real: o telefone que envelheceu',
      'A Tia Rute trocou de celular, e oito inscrições ficaram com o número velho.',
      [
        'Em março a Tia Rute, conselheira da Águia, trocou de celular. A secretaria atualizou a tabela de unidades. A lista do acampamento, com o telefone copiado em cada inscrição, ficou com o número antigo.',
        'Nada estoura: as duas tabelas têm um telefone bem escrito em cada linha. Na noite do acampamento, a ligação de emergência de oito desbravadores vai para um número que ninguém atende.',
        'O desencontro se acha juntando as duas tabelas e comparando: as linhas em que os dois telefones são diferentes são as que envelheceram.',
      ],
      `SELECT inscricoes.unidade, inscricoes.telefone_do_conselheiro, unidades.telefone
FROM inscricoes JOIN unidades ON inscricoes.unidade = unidades.nome
WHERE inscricoes.telefone_do_conselheiro <> unidades.telefone
LIMIT 3;`,
      `unidade | telefone_do_conselheiro | telefone
Águia | (61) 99317-7764 | (61) 99654-2087
Águia | (61) 99317-7764 | (61) 99654-2087
Águia | (61) 99317-7764 | (61) 99654-2087`,
      'Consertar as oito cópias resolve hoje e deixa o problema para a próxima troca de celular. O conserto de verdade é deixar de ter cópia.',
      ['anomalia de atualização'],
  ),
  sql(
    'tirar-a-copia',
    'Tirar a cópia: ALTER TABLE',
    'A coluna que repete o que mora em outro lugar sai da tabela.',
    [
      '`ALTER TABLE inscricoes DROP COLUMN telefone_do_conselheiro;` tira a coluna da tabela, com os dados dela. Uma coluna por comando.',
      'Saem as três que repetem: a unidade, o conselheiro e o telefone. Fica o `membro_id`, que é por onde se chega ao membro, e do membro à unidade.',
      'Depois disso, o telefone de cada inscrito se lê pela junção: inscrição com membro, membro com unidade. A próxima troca de celular se faz numa linha só.',
    ],
    `ALTER TABLE inscricoes DROP COLUMN unidade;
ALTER TABLE inscricoes DROP COLUMN conselheiro;
ALTER TABLE inscricoes DROP COLUMN telefone_do_conselheiro;
SELECT * FROM inscricoes LIMIT 3;`,
    `id | membro_id | diarias
1 | 1 | 3
2 | 2 | 2
3 | 3 | 2`,
    'DROP COLUMN não tem desfazer: os dados da coluna vão junto. Antes de tirar, confira que eles moram mesmo em outro lugar.',
    ['ALTER TABLE', 'DROP COLUMN'],
  ),
];

/* ── Módulo 6: o diagrama ─────────────────────────────────────────────────── */

const DIAGRAMA: TopicoDeVereda[] = [
  t(
    'diagrama',
    'O diagrama antes do banco',
    'Desenhar as tabelas, as chaves e as ligações antes de escrever um comando.',
    [
      'Antes de criar tabelas, desenha-se o **diagrama**: uma caixa por tabela, com as colunas dentro, a chave primária marcada, e linhas ligando as tabelas que se apontam.',
      'Mudar um desenho custa um clique; mudar uma tabela cheia de dados custa uma tarde. É no diagrama que se descobre que falta uma tabela, ou que uma coluna está no lugar errado.',
      'O diagrama também é o que se mostra ao examinador e a quem vai mexer no banco depois: lê-se num minuto o que levaria uma hora para descobrir abrindo tabela por tabela.',
    ],
    `┌────────────────┐        ┌──────────────────┐
│ unidades       │        │ membros          │
├────────────────┤        ├──────────────────┤
│ 🔑 id           │1 ─────<│ 🔑 id             │
│    nome        │        │    nome          │
│    conselheiro │        │    idade         │
└────────────────┘        │ ↗  unidade_id    │
                          └──────────────────┘`,
    'O diagrama é do banco que vai existir, e não do que existe hoje. Desenhe o que a demanda pede.',
    ['diagrama', 'modelagem'],
  ),
  t(
    'cardinalidade',
    'Cardinalidade: quantos de cada lado',
    'Um para um, um para muitos, muitos para muitos.',
    [
      'A **cardinalidade** diz quantos de um lado combinam com quantos do outro. Uma unidade tem muitos membros; cada membro é de uma unidade só: é **um para muitos**, escrito 1:N.',
      'No diagrama, o lado "um" leva um traço, e o lado "muitos" leva o **pé de galinha**, três traços abertos. É a notação que todo modelador usa.',
      'A cardinalidade decide onde mora a chave estrangeira: no um-para-muitos ela fica do lado **muitos**. Cada membro aponta para a sua unidade; a unidade não teria como guardar a lista dos seus membros numa coluna.',
    ],
    `unidades 1 ──────< N membros

  um      →  o traço, do lado da unidade
  muitos  →  o pé de galinha, do lado dos membros
  a chave estrangeira (unidade_id) mora no lado muitos`,
    'Diagrama com a seta ao contrário — a unidade guardando o membro — não estoura em lugar nenhum. Só não dá para criar as tabelas assim.',
    ['cardinalidade', '1:N', 'pé de galinha'],
  ),
  t(
    'muitos-para-muitos',
    'Muitos para muitos, e a tabela do meio',
    'Quando os dois lados são muitos, nasce uma terceira tabela.',
    [
      'Um membro conquista muitas especialidades, e uma especialidade é conquistada por muitos membros. Isso é **muitos para muitos**, N:N.',
      'Nenhuma das duas tabelas consegue guardar a ligação: o membro teria de guardar uma lista de especialidades, e a especialidade, uma lista de membros. Coluna não guarda lista.',
      'A saída é uma **tabela do meio** — `conquistas` —, com uma linha para cada vez que alguém conquistou alguma coisa. Ela aponta para os dois lados, e a data da conquista mora nela, porque a data não é nem do membro nem da especialidade: é do encontro dos dois.',
    ],
    `membros 1 ──< N conquistas N >── 1 especialidades

  conquistas: id | membro_id | especialidade_id | data

  A ligação N:N vira duas ligações 1:N, e a tabela do meio
  guarda o que é da ligação: aqui, a data.`,
    'Todo modelador oferece a ligação N:N no menu. Ela se desenha, e não se cria: no banco ela sempre vira a tabela do meio.',
    ['muitos para muitos', 'N:N', 'tabela associativa'],
  ),
];

/* ── Módulo 7: criar as tabelas ───────────────────────────────────────────── */

const CRIAR: TopicoDeVereda[] = [
  sql(
    'criar-tabela',
    'Criar a tabela: CREATE TABLE',
    'O nome da tabela, e cada coluna com o seu tipo e as suas regras.',
    [
      '`CREATE TABLE especialidades ( ... );` cria a tabela. Entre os parênteses vêm as colunas, separadas por vírgula, cada uma com nome e tipo.',
      'A primeira costuma ser a chave: `id INTEGER PRIMARY KEY`. As outras dizem o que a especialidade tem — código e nome.',
      'Uma tabela que aponta para outra só pode ser criada depois dela: a de conquistas aponta para especialidades, então especialidades vem antes no arquivo.',
    ],
    `CREATE TABLE especialidades (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL
);
INSERT INTO especialidades (codigo, nome) VALUES ('AP034', 'Internet');
SELECT * FROM especialidades;`,
    `id | codigo | nome
1 | AP034 | Internet`,
    'O id não foi escrito no INSERT, e mesmo assim saiu 1: a chave inteira se numera sozinha.',
    ['CREATE TABLE'],
  ),
  sql(
    'tipos',
    'O tipo de cada coluna',
    'Número para contar, texto para o resto — inclusive o que parece número.',
    [
      'Os tipos que se usam aqui são `INTEGER` (número inteiro), `REAL` (número com casas decimais) e `TEXT` (texto). Data se guarda como texto no formato **ano-mês-dia**, `2026-03-14`, que é o que se ordena certo.',
      'Telefone e código parecem número e são **texto**. Ninguém faz conta com telefone, e o número joga fora o zero da frente: `061999990000` numa coluna INTEGER vira `61999990000`.',
      'O SQLite é tolerante com tipo: ele tenta converter o que chega e guarda do jeito que der. Por isso o tipo certo importa tanto aqui — é ele que decide o que a conversão faz.',
    ],
    `CREATE TABLE teste (telefone INTEGER, codigo TEXT);
INSERT INTO teste VALUES ('061999990000', '034');
SELECT telefone, codigo FROM teste;`,
    `telefone | codigo
61999990000 | 034`,
    'Data escrita como 14/03/2026 se ordena pelo dia: 01/04 vem antes de 14/03. No formato ano-mês-dia a ordem do texto é a ordem do calendário.',
    ['INTEGER', 'TEXT', 'REAL', 'tipo de dado'],
  ),
  sql(
    'restricoes',
    'As regras da coluna',
    'NOT NULL, UNIQUE e REFERENCES: o banco recusando o que não cabe.',
    [
      '`NOT NULL` não aceita coluna vazia: uma especialidade sem nome é recusada. `UNIQUE` não aceita repetição: dois cadastros da AP034 também.',
      '`REFERENCES membros(id)` faz da coluna uma chave estrangeira: só aceita o id de um membro que existe.',
      'Recusa não é defeito: é o banco fazendo o trabalho dele. Uma regra posta na tabela vale para todo mundo que escrever nela — inclusive o programa de outra pessoa, que você nunca vai ver.',
    ],
    "INSERT INTO unidades (nome, conselheiro, telefone) VALUES ('Lobo', NULL, '(61) 99000-0000');",
    'Erro na linha 1: NOT NULL constraint failed: unidades.conselheiro',
    'Uma execução para no primeiro erro. O que veio antes valeu; o que vem depois não rodou.',
    ['NOT NULL', 'UNIQUE', 'REFERENCES'],
  ),
];

/* ── Módulo 8: mudar os dados ─────────────────────────────────────────────── */

const MUDAR: TopicoDeVereda[] = [
  sql(
    'inserir',
    'Inserir: INSERT',
    'Uma linha nova, ou várias de uma vez.',
    [
      '`INSERT INTO especialidades (codigo, nome) VALUES (\'AP045\', \'Computação 5\');` acrescenta uma linha. Os nomes entre os primeiros parênteses dizem que colunas vão ser preenchidas, na ordem dos valores.',
      'Várias linhas cabem num INSERT só, separadas por vírgula: `VALUES (...), (...), (...)`.',
      'O texto vai entre aspas simples, e a aspa de dentro se escreve dobrada: o sobrenome D\'Ávila vira `\'D\'\'Ávila\'`.',
    ],
    `INSERT INTO especialidades (codigo, nome) VALUES ('AP045', 'Computação 5');
SELECT * FROM especialidades;`,
    `id | codigo | nome
1 | AP034 | Internet
2 | AP035 | Internet, Avançado
3 | AP041 | Computação 1
4 | AP045 | Computação 5`,
    'Pular a lista de colunas — INSERT INTO especialidades VALUES (...) — obriga a escrever todas, na ordem da tabela. Uma coluna acrescentada amanhã quebra o comando.',
    ['INSERT'],
  ),
  sql(
    'atualizar',
    'Atualizar: UPDATE',
    'Mudar o que já está gravado — e só onde se quer.',
    [
      '`UPDATE membros SET idade = 13 WHERE id = 1;` muda a idade de um membro só. O `SET` diz o que muda; o `WHERE` diz em quem.',
      'Um UPDATE **sem WHERE** muda a tabela inteira. Os sessenta e dois membros passam a ter treze anos, sem erro nenhum.',
      'E o `WHERE` pelo nome muda todo mundo com aquele nome. As duas Ana Clara Ribeiro mudariam juntas. É pelo id que se escolhe uma pessoa.',
    ],
    `UPDATE membros SET idade = 13 WHERE id = 1;
SELECT nome, idade FROM membros WHERE id = 1;`,
    `nome | idade
Ana Beatriz Lima | 13`,
    'Escreva o WHERE antes do SET. Um UPDATE que roda pela metade do caminho, sem o WHERE, já mudou tudo.',
    ['UPDATE', 'SET'],
  ),
  sql(
    'remover',
    'Remover: DELETE',
    'Apagar linhas — na ordem que as chaves deixam.',
    [
      '`DELETE FROM membros WHERE id = 8;` apaga uma linha. Sem WHERE, apaga a tabela inteira, como no UPDATE.',
      'Se outra tabela aponta para a linha, o banco recusa: o Henrique Dias tem conquistas registradas, e apagá-lo deixaria conquistas de ninguém.',
      'A ordem é tirar primeiro o que aponta — as conquistas dele — e só depois a linha apontada.',
    ],
    `DELETE FROM membros WHERE id = ${membro('Henrique Dias').id};`,
    'Erro na linha 1: FOREIGN KEY constraint failed',
    'Apagar todas as conquistas para conseguir apagar um membro leva as dos outros junto. O WHERE vale para o DELETE das conquistas também.',
    ['DELETE'],
  ),
  sql(
    'transacao',
    'A rede de segurança: a transação',
    'No banco de verdade não há Ctrl+Z, a não ser que se peça antes.',
    [
      'Aqui o banco volta ao estado da lição a cada execução. No banco do clube, não: um DELETE errado apaga de verdade, e não existe desfazer.',
      'A rede é a **transação**. `BEGIN;` abre; os comandos de dentro valem só para quem está nela; `COMMIT;` grava tudo de uma vez, e `ROLLBACK;` desfaz tudo de uma vez.',
      'Quem vai mexer em muitas linhas abre uma transação, confere o resultado com um SELECT, e só então grava.',
    ],
    `BEGIN;
DELETE FROM conquistas;
ROLLBACK;
SELECT COUNT(*) FROM conquistas;`,
    `COUNT(*)
5`,
    'Transação aberta e nunca fechada se desfaz quando o banco fecha. Esquecer o COMMIT é perder o que estava dentro.',
    ['BEGIN', 'COMMIT', 'ROLLBACK', 'transação'],
  ),
];

/* ── Módulo 9: o banco no programa ────────────────────────────────────────── */

const NO_PROGRAMA: TopicoDeVereda[] = [
  py(
    'conectar',
    'Abrir o banco pelo Python',
    'O módulo sqlite3, a conexão, e o primeiro comando.',
    [
      'O Python traz o SQLite dentro, no módulo `sqlite3`. `sqlite3.connect("clube.db")` abre o arquivo do banco e devolve a **conexão**, que é por onde todo comando passa.',
      '`conexao.execute(...)` manda um comando, igual ao que se escreve no editor. O que volta é um **cursor**, de onde se tiram as linhas: `fetchone()` traz uma, `fetchall()` traz todas.',
      'Cada linha chega como uma **tupla**, na ordem das colunas do SELECT.',
    ],
    `import sqlite3

conexao = sqlite3.connect("clube.db")
linha = conexao.execute("SELECT COUNT(*) FROM membros").fetchone()
print("Membros:", linha[0])
conexao.close()`,
    'Membros: 62',
    'Nome de arquivo errado não dá erro na hora: o connect cria um banco novo e vazio, e o erro só aparece na consulta, como no such table.',
    ['sqlite3', 'connect', 'cursor'],
  ),
  py(
    'consultar',
    'Consultar e percorrer',
    'O fetchall devolve uma lista, e o for faz o resto.',
    [
      '`fetchall()` devolve uma **lista de tuplas**, uma por linha do resultado. Percorrê-la com `for` é o jeito de mostrar cada uma.',
      'Desempacotar a tupla deixa o programa legível: `for nome, idade in linhas:` dá nome a cada coluna.',
      'A consulta faz o trabalho de filtrar e ordenar; o Python só mostra. Filtrar no banco é mais rápido do que trazer tudo e filtrar no laço.',
    ],
    `import sqlite3

conexao = sqlite3.connect("clube.db")
linhas = conexao.execute(
    "SELECT nome, idade FROM membros WHERE unidade_id = ${ONCA} AND idade >= 14 ORDER BY nome"
).fetchall()
for nome, idade in linhas:
    print(nome, idade)
conexao.close()`,
    `Nicolas Paiva 14
Otávio Lins 14
Valentina Couto 15`,
    'Uma consulta que filtra uma coluna só devolve tuplas de um elemento: for (nome,) in linhas, com a vírgula.',
    ['fetchall', 'for'],
  ),
  py(
    'parametros',
    'O valor separado do comando',
    'O ponto de interrogação guarda o lugar; o valor vai na tupla.',
    [
      'Para inserir um membro novo, o comando leva valores que vêm do programa. O jeito certo é escrever `?` no lugar de cada um e passar os valores numa tupla: `execute("INSERT ... VALUES (?, ?, ?)", (nome, idade, unidade))`.',
      'Colar o valor no texto — com f-string ou com `+` — parece mais fácil e quebra no primeiro apóstrofo: o nome D\'Ávila fecha a aspa no meio do comando, e o SQLite responde erro de sintaxe.',
      'É o mesmo defeito que, com um nome escrito de propósito, deixa alguém mandar o banco apagar uma tabela. Com o `?`, o valor nunca vira comando, seja o que for que estiver escrito nele.',
    ],
    `import sqlite3

conexao = sqlite3.connect("clube.db")
nome = "${NOVO_MEMBRO.nome}"
conexao.execute("INSERT INTO membros (nome, idade, unidade_id) VALUES (?, ?, ?)", (nome, ${NOVO_MEMBRO.idade}, ${ONCA}))
print(conexao.execute("SELECT nome FROM membros WHERE nome = ?", (nome,)).fetchone()[0])
conexao.close()`,
    NOVO_MEMBRO.nome,
    'Mesmo um valor só vai numa tupla, com a vírgula: (nome,). Sem a vírgula, os parênteses não fazem tupla nenhuma.',
    ['parâmetro', '?', 'injeção de SQL'],
  ),
  py(
    'commit',
    'Gravar de verdade: commit',
    'A inserção feita pelo Python só fica no arquivo depois do commit.',
    [
      'O `sqlite3` do Python abre uma transação sozinho antes de cada INSERT, UPDATE ou DELETE. O que se muda fica pendente até `conexao.commit()`.',
      'Sem o commit, o próprio programa até vê o registro novo numa consulta — ele está dentro da transação. O arquivo, não: fechar a conexão desfaz tudo.',
      'O jeito de conferir é o do exemplo: gravar, fechar, abrir de novo e contar. O que aparece depois de reabrir é o que ficou.',
    ],
    `import sqlite3

conexao = sqlite3.connect("clube.db")
conexao.execute("INSERT INTO membros (nome, idade, unidade_id) VALUES (?, ?, ?)", ("Iara Souto", 12, ${AGUIA}))
conexao.commit()
conexao.close()

conexao = sqlite3.connect("clube.db")
print("Membros:", conexao.execute("SELECT COUNT(*) FROM membros").fetchone()[0])
conexao.close()`,
    'Membros: 63',
    'O commit vem depois das mudanças e antes do close. Commit antes do INSERT não grava o INSERT.',
    ['commit', 'transação'],
  ),
];

/* ── O laboratório do módulo 9 ────────────────────────────────────────────── */

const FALCAO = unidadePeloNome('Falcão').id;

/** Os nomes que a consulta do Falcão precisa mostrar, da semente e não de uma lista à parte. */
const NOMES_DO_FALCAO = MEMBROS_NO_BANCO.filter(m => m.unidade_id === FALCAO).map(m => m.nome);

/* ── Os módulos ───────────────────────────────────────────────────────────── */

export const MODULOS_DE_SQL: ModuloDeVereda[] = [
  {
    id: 'm1', titulo: 'O banco de dados',
    resumo: 'Banco, SGBD, tabela, linha, coluna e a primeira consulta.',
    licoes: [
      { id: 'm1-teoria', tipo: 'teoria', questoes: Q['m1-teoria'], perguntas: 4, titulo: 'O banco do clube', resumo: 'O que é um banco, quem cuida dele, e como se pede alguma coisa.', topicos: O_BANCO },
      { id: 'm1-lab', tipo: 'banco', licao: 'tabelas', titulo: 'Abrindo o banco do clube', resumo: 'A tabela inteira, só as colunas pedidas, e o cabeçalho do relatório.', verificacoes: ['todas-as-unidades', 'nome-e-idade', 'cabecalho-do-relatorio'] },
    ],
  },
  {
    id: 'm2', titulo: 'Filtrar e ordenar',
    resumo: 'WHERE, ORDER BY, o vazio, e a diferença entre dizer como e dizer o quê.',
    licoes: [
      { id: 'm2-teoria', tipo: 'teoria', questoes: Q['m2-teoria'], perguntas: 4, titulo: 'Perguntar ao banco', resumo: 'O filtro, a ordem, o NULL, e o Python ao lado do SQL.', topicos: PERGUNTAR },
      { id: 'm2-lab', tipo: 'banco', licao: 'consultas', titulo: 'O procura.py em uma consulta', resumo: 'A mesma lista do programa, na mesma ordem, e quem está sem idade.', verificacoes: ['os-da-aguia', 'do-mais-velho', 'sem-idade'] },
    ],
  },
  {
    id: 'm3', titulo: 'Chaves e junção',
    resumo: 'O que identifica cada linha, o que aponta para ela, e como juntar.',
    licoes: [
      { id: 'm3-teoria', tipo: 'teoria', questoes: Q['m3-teoria'], perguntas: 4, titulo: 'Chave primária, chave estrangeira e JOIN', resumo: 'O id que não se repete, a coluna que aponta, e quem some da junção.', topicos: CHAVES },
      { id: 'm3-lab', tipo: 'banco', licao: 'juncao', titulo: 'Cada membro com a unidade dele', resumo: 'A junção certa, junção com filtro, e ninguém de fora.', verificacoes: ['membro-com-unidade', 'conselheiro-dos-mais-novos', 'ninguem-de-fora'] },
    ],
  },
  {
    id: 'm4', titulo: 'Contar e agrupar',
    resumo: 'As funções de agregação, o GROUP BY e o HAVING.',
    licoes: [
      { id: 'm4-teoria', tipo: 'teoria', questoes: Q['m4-teoria'], perguntas: 4, titulo: 'Uma conta por unidade', resumo: 'Contar, somar, tirar a média — da tabela inteira ou de cada grupo.', topicos: AGRUPAR },
      { id: 'm4-lab', tipo: 'banco', licao: 'agregacao', titulo: 'Os números de cada unidade', resumo: 'Quantos, a média de idade, e as unidades grandes.', verificacoes: ['quantos-por-unidade', 'media-de-idade', 'unidades-grandes'] },
    ],
  },
  {
    id: 'm5', titulo: 'O dado repetido',
    resumo: 'Normalização, e o problema que o dado copiado causa.',
    licoes: [
      { id: 'm5-teoria', tipo: 'teoria', questoes: Q['m5-teoria'], perguntas: 4, titulo: 'Cada dado num lugar só', resumo: 'O telefone copiado, a cópia que envelheceu, e como tirá-la.', topicos: REPETIDO },
      { id: 'm5-lab', tipo: 'banco', licao: 'normalizacao', titulo: 'A lista do acampamento', resumo: 'Achar o desencontro, tirar a repetição, e ler o telefone de onde ele mora.', verificacoes: ['achou-o-desencontro', 'tirou-a-repeticao', 'telefone-pela-juncao'] },
    ],
  },
  {
    id: 'm6', titulo: 'O diagrama',
    resumo: 'Modelar as tabelas, as chaves e a cardinalidade antes de criar.',
    licoes: [
      { id: 'm6-teoria', tipo: 'teoria', questoes: Q['m6-teoria'], perguntas: 4, titulo: 'Desenhar antes de criar', resumo: 'O diagrama, a cardinalidade, e a tabela do meio.', topicos: DIAGRAMA },
      { id: 'm6-lab', tipo: 'banco', licao: 'diagrama', titulo: 'O diagrama das especialidades', resumo: 'A chave certa nos membros, as especialidades, e as conquistas no meio.', verificacoes: ['chave-que-identifica', 'especialidades', 'tabela-do-meio', 'cardinalidades', 'tres-relacionadas'] },
    ],
  },
  {
    id: 'm7', titulo: 'Criar as tabelas',
    resumo: 'CREATE TABLE, o tipo de cada coluna e as regras dela.',
    licoes: [
      { id: 'm7-teoria', tipo: 'teoria', questoes: Q['m7-teoria'], perguntas: 4, titulo: 'Do diagrama ao banco', resumo: 'Criar a tabela, escolher o tipo, e pôr as regras.', topicos: CRIAR },
      { id: 'm7-lab', tipo: 'banco', licao: 'criar', titulo: 'As tabelas das especialidades', resumo: 'Especialidades e conquistas, com os tipos certos e a chave que recusa.', verificacoes: ['criou-especialidades', 'criou-conquistas', 'tipos-certos', 'recusou-o-orfao'] },
    ],
  },
  {
    id: 'm8', titulo: 'Inserir, atualizar e remover',
    resumo: 'INSERT, UPDATE e DELETE — e o WHERE que separa um de todos.',
    licoes: [
      { id: 'm8-teoria', tipo: 'teoria', questoes: Q['m8-teoria'], perguntas: 4, titulo: 'Mudar o que está gravado', resumo: 'Inserir, atualizar, remover, e a transação que desfaz.', topicos: MUDAR },
      { id: 'm8-lab', tipo: 'banco', licao: 'alterar', titulo: 'O trabalho da secretaria', resumo: 'Especialidades novas, conquistas de março, um aniversário e uma saída.', verificacoes: ['inseriu-especialidades', 'registrou-as-conquistas', 'aniversario-da-certa', 'saiu-do-clube'] },
    ],
  },
  {
    id: 'm9', titulo: 'O banco no programa',
    resumo: 'Um programa Python que consulta e insere no banco do clube.',
    licoes: [
      { id: 'm9-teoria', tipo: 'teoria', questoes: Q['m9-teoria'], perguntas: 4, titulo: 'Python e SQLite', resumo: 'Conectar, consultar, passar parâmetro e gravar com commit.', topicos: NO_PROGRAMA },
      {
        id: 'm9-lab', tipo: 'laboratorio', linguagem: 'python',
        titulo: 'O cadastro do Pedro',
        resumo: 'Listar a unidade Falcão e cadastrar um membro novo, gravado de verdade.',
        arquivo: 'cadastro.py',
        projeto: 'secretaria-do-clube',
        /* O requisito 7 inteiro: conectar, consultar e inserir. O apóstrofo do
           nome é o que separa o comando montado com ? do comando colado — e a
           gravação se confere no arquivo, depois de o programa terminar, que é
           o que separa quem fez commit de quem não fez. Sem 'roda': um arquivo
           só de comentários roda até o fim. */
        verificacoes: ['conectaAoBanco', 'mostraDoBanco', 'usaParametros', 'gravouNoBanco'],
        banco: { arquivo: 'clube.db', semente: SEMENTE_DO_CLUBE },
        saidaContem: NOMES_DO_FALCAO,
        registroEsperado: {
          tabela: 'membros',
          valores: { nome: NOVO_MEMBRO.nome, idade: NOVO_MEMBRO.idade, unidade_id: unidadePeloNome(NOVO_MEMBRO.unidade).id },
        },
        modelo: `# O cadastro do Pedro
#
# O banco do clube está na pasta, no arquivo clube.db.
#
# 1. Conecte-se a ele e mostre o nome de cada membro da unidade
#    Falcão, um por linha. O Falcão é a unidade de id ${FALCAO}.
#
# 2. Cadastre o membro novo, com os valores passados separados
#    do comando:
#
#      nome:    ${NOVO_MEMBRO.nome}
#      idade:   ${NOVO_MEMBRO.idade}
#      unidade: ${NOVO_MEMBRO.unidade} (id ${unidadePeloNome(NOVO_MEMBRO.unidade).id})
#
# 3. Faça o cadastro ficar gravado no arquivo.

`,
      },
    ],
  },
];
