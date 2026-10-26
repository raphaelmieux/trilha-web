/**
 * Os laboratórios da CC005 SQL, e o que cada um cobra.
 *
 * ── A lista mostra a última execução ─────────────────────────────────────
 * É a regra do laboratório de Python, pelo motivo escrito lá: saber o que um
 * arquivo `.sql` faz exige rodá-lo, e uma lista verde ao lado de um arquivo
 * que ninguém executou é a mentira mais fácil de contar aqui. As metas leem a
 * `ExecucaoDeSql` — o que cada comando devolveu, e como o banco ficou no fim —,
 * e nunca o texto escrito.
 *
 * ── A meta confere o que a consulta respondeu, e não como ela foi escrita ─
 * Há muitas consultas certas para a mesma pergunta: `JOIN ... ON` e
 * `FROM a, b WHERE`, a coluna chamada `nome` ou `Nome`, o `IN` ou dois `OR`.
 * Cobrar uma delas mediria ter adivinhado a nossa, que é a decisão da
 * formatação condicional da CC-ES003. O que se compara é o resultado contra o
 * banco — e o resultado errado, aqui, é sempre plausível: sessenta e uma
 * linhas onde deviam ser sessenta e duas, trezentas e setenta e duas onde
 * deviam ser sessenta e uma, e um Tucano com média 11 em vez de 12,44.
 *
 * ── E o que se espera sai dos dados, e não de uma lista à parte ──────────
 * A resposta de cada meta é calculada de `bancoDoClube.ts`, que é de onde a
 * semente também sai. Escrever "os dez da Águia" à mão aqui seria uma segunda
 * cópia do clube, e a primeira correção de um nome faria a meta cobrar uma
 * resposta que o banco não tem.
 */

import {
  algumaConsultaBate, algumaConsultaTraz, colunaDe, chavePrimaria, emOrdem, registros, tabelaDe,
  type ExecucaoDeSql, type TabelaDoBanco, type Valor,
} from './sqlite';
import {
  CONQUISTAS_DE_PARTIDA, ESPECIALIDADES_DE_PARTIDA, ESPECIALIDADES_NOVAS, INSCRICOES, MEMBROS_NO_BANCO,
  QUEM_SAIU, SEMENTE_DAS_ESPECIALIDADES, SEMENTE_DO_ACAMPAMENTO, SEMENTE_DO_CLUBE, TELEFONE_ANTIGO_DA_AGUIA,
  UNIDADES, membro, nomeDaUnidade, unidadePeloNome,
} from './bancoDoClube';
import {
  cardinalidadesCoerentes, chaveDe, conectadas, diagramaDaSecretaria, estrangeirasDe, normal, tabelaChamada,
  type Diagrama, type TabelaDoDiagrama,
} from './diagramaDeTabelas';

export type LicaoDaCc005 =
  | 'tabelas' | 'consultas' | 'juncao' | 'agregacao' | 'normalizacao' | 'diagrama' | 'criar' | 'alterar';

/** O programa em que a lição abre: o editor de banco, ou o de diagrama. */
export type ProgramaDaCc005 = 'sql' | 'diagrama';

export interface ContextoDoBanco {
  /** A última execução do arquivo, ou nada, se ninguém executou ainda. */
  execucao: ExecucaoDeSql | null;
  diagrama: Diagrama;
}

export interface MetaDoBanco {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDoBanco) => boolean;
}

/** Um arquivo de apoio, só de leitura, na lateral do editor. */
export interface ArquivoDeApoio { nome: string; conteudo: string }

export interface LicaoDoBanco {
  programa: ProgramaDaCc005;
  /** O banco de que a lição parte, refeito a cada execução. */
  semente: string;
  /** O nome do arquivo .sql, e o que ele traz ao abrir. */
  arquivo: string;
  modelo: string;
  apoio: ArquivoDeApoio[];
  /** Só no diagrama: de onde se parte. */
  diagrama: () => Diagrama;
  metas: MetaDoBanco[];
}

/* ── O que se lê do clube ─────────────────────────────────────────────────── */

const final = (c: ContextoDoBanco) => c.execucao?.banco ?? null;
const consultas = (c: ContextoDoBanco) => c.execucao?.comandos.filter(x => x.tipo === 'consulta' && !x.erro) ?? [];

const naUnidade = (nome: string) => MEMBROS_NO_BANCO.filter(m => m.unidade_id === unidadePeloNome(nome).id);
const comUnidade = MEMBROS_NO_BANCO.filter(m => m.unidade_id !== null);
const contaDe = (u: (typeof UNIDADES)[number]) => MEMBROS_NO_BANCO.filter(m => m.unidade_id === u.id).length;
function mediaDe(u: (typeof UNIDADES)[number]): number {
  const idades = MEMBROS_NO_BANCO.filter(m => m.unidade_id === u.id && m.idade !== null).map(m => m.idade!);
  return idades.reduce((s, x) => s + x, 0) / idades.length;
}

/** As linhas de uma tabela, comparadas com o que a semente pôs lá. */
const mesmasLinhas = (t: TabelaDoBanco | undefined, linhas: Valor[][]) =>
  !!t && t.linhas.length === linhas.length && t.linhas.every((l, i) => l.length === linhas[i].length && l.every((v, j) => v === linhas[i][j]));

const unidadesIntactas = (c: ContextoDoBanco) =>
  mesmasLinhas(tabelaDe(final(c), 'unidades'), UNIDADES.map(u => [u.id, u.nome, u.conselheiro, u.telefone]));

const ehTexto = (tipo: string) => /CHAR|CLOB|TEXT/i.test(tipo);
const ehData = (tipo: string) => /DATE|TIME|TEXT|CHAR/i.test(tipo) && !/INT/i.test(tipo);
const ehInteiro = (tipo: string) => /INT/i.test(tipo);

/* ── Módulo 1: as tabelas do clube ────────────────────────────────────────── */

const METAS_DAS_TABELAS: MetaDoBanco[] = [
  {
    id: 'todas-as-unidades',
    titulo: 'Ver a tabela de unidades inteira',
    detalhe: 'Todas as linhas e todas as colunas. É o primeiro comando de quem abre um banco que não conhece.',
    onde: 'Editor de SQL → Executar',
    passos: [
      'Escreva SELECT * FROM unidades; numa linha do arquivo.',
      'O asterisco quer dizer "todas as colunas". Sem WHERE, vêm todas as linhas.',
      'Clique em Executar e confira o resultado embaixo: seis linhas, quatro colunas.',
    ],
    feita: c => algumaConsultaBate(c.execucao, { linhas: UNIDADES.map(u => [u.id, u.nome, u.conselheiro, u.telefone]) }),
  },
  {
    id: 'nome-e-idade',
    titulo: 'Só o nome e a idade de cada membro',
    detalhe: 'Duas colunas, e de todos os membros. Pedir as colunas pelo nome é o que separa uma consulta de um despejo da tabela.',
    onde: 'Editor de SQL',
    passos: [
      'Depois do SELECT, escreva os nomes das colunas separados por vírgula: SELECT nome, idade',
      'Termine com FROM membros; e execute.',
      'Repare no total embaixo do resultado: são todos os membros, e não só os que cabem na tela.',
    ],
    feita: c => algumaConsultaBate(c.execucao, { linhas: MEMBROS_NO_BANCO.map(m => [m.nome, m.idade]) }),
  },
  {
    id: 'cabecalho-do-relatorio',
    titulo: 'Cada unidade e o conselheiro dela, com o cabeçalho do relatório',
    detalhe: 'As colunas precisam se chamar Unidade e Conselheiro, com a maiúscula, porque é assim que o relatório do clube as escreve.',
    onde: 'Editor de SQL',
    passos: [
      'SELECT nome, conselheiro FROM unidades; devolve as duas colunas com o nome que elas têm no banco.',
      'Para dar outro nome a uma coluna no resultado, escreva AS depois dela: nome AS Unidade.',
      'O nome novo vale só no resultado. A tabela continua igual.',
    ],
    feita: c => consultas(c).some(x =>
      [...x.colunas].sort().join('|') === 'Conselheiro|Unidade'
      && algumaConsultaBate({ ...c.execucao!, comandos: [x] }, { linhas: UNIDADES.map(u => [u.nome, u.conselheiro]) })),
  },
];

/* ── Módulo 2: consultar com filtro e ordenação ───────────────────────────── */

const AGUIA = naUnidade('Águia');

const METAS_DAS_CONSULTAS: MetaDoBanco[] = [
  {
    id: 'os-da-aguia',
    titulo: 'A mesma lista que o procura.py imprime',
    detalhe: 'O nome e a idade de cada membro da Águia. O programa em Python diz como procurar, passo a passo; a consulta só diz o que quer.',
    onde: 'Editor de SQL',
    passos: [
      'Abra o procura.py na lateral e leia o que ele faz: percorre a lista, guarda quem é da Águia, e imprime.',
      'Na tabela de unidades, ache o id da Águia.',
      'Escreva SELECT nome, idade FROM membros WHERE unidade_id = ... com o id que você achou.',
    ],
    feita: c => algumaConsultaBate(c.execucao, { linhas: AGUIA.map(m => [m.nome, m.idade]) }),
  },
  {
    id: 'do-mais-velho',
    titulo: 'Do mais velho ao mais novo',
    detalhe: 'A mesma lista, na ordem que o procura.py usa. Sem ORDER BY, o banco não promete ordem nenhuma — a que aparece hoje pode mudar amanhã.',
    onde: 'Editor de SQL',
    passos: [
      'Acrescente ORDER BY idade no fim da consulta, antes do ponto e vírgula.',
      'A ordem vem do menor para o maior. Para inverter, escreva DESC depois da coluna.',
    ],
    feita: c => algumaConsultaBate(c.execucao, {
      linhas: AGUIA.map(m => [m.nome, m.idade]),
      ordem: l => emOrdem(l, 1, -1),
    }),
  },
  {
    id: 'sem-idade',
    titulo: 'Quem está sem idade registrada',
    detalhe: 'A idade em branco é NULL, que quer dizer "não se sabe". Nada é igual a NULL — nem o próprio NULL —, e a consulta que pergunta com = volta vazia sem erro nenhum.',
    onde: 'Editor de SQL',
    passos: [
      'Uma consulta com WHERE idade = NULL roda e não acha ninguém. Não é que não exista: é que a pergunta está errada.',
      'Para perguntar pelo vazio, escreva WHERE idade IS NULL.',
      'Mostre pelo menos o nome de quem aparecer.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, MEMBROS_NO_BANCO.filter(m => m.idade === null).map(m => [m.nome])),
  },
];

/** O mesmo pedido do módulo 2, escrito do jeito imperativo. */
const PROCURA_PY = `# O mesmo pedido, escrito do jeito imperativo.
#
# O programa diz COMO achar: percorre um por um, guarda quem
# serve, ordena, e só então imprime. A consulta em SQL vai dizer
# só O QUE quer, e o banco decide o caminho.

import sqlite3

conexao = sqlite3.connect("clube.db")
membros = conexao.execute("SELECT nome, idade, unidade_id FROM membros").fetchall()

aguia = []
for nome, idade, unidade_id in membros:
    if unidade_id == ${unidadePeloNome('Águia').id}:
        aguia.append((nome, idade))

aguia.sort(key=lambda par: par[1], reverse=True)

for nome, idade in aguia:
    print(nome, idade)
`;

/* ── Módulo 3: chaves e junção ────────────────────────────────────────────── */

const METAS_DA_JUNCAO: MetaDoBanco[] = [
  {
    id: 'membro-com-unidade',
    titulo: 'Cada membro com o nome da unidade dele',
    detalhe: 'O membro guarda o número da unidade, e não o nome. O nome mora na outra tabela, e é a junção que vai buscar.',
    onde: 'Editor de SQL',
    passos: [
      'Junte as duas tabelas: FROM membros JOIN unidades ON membros.unidade_id = unidades.id',
      'O ON diz qual coluna de um lado combina com qual do outro: a estrangeira com a primária.',
      'Peça as duas colunas: SELECT membros.nome, unidades.nome — o nome da tabela na frente desfaz a dúvida, porque as duas têm uma coluna chamada nome.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, comUnidade.map(m => [m.nome, nomeDaUnidade(m.unidade_id)])),
  },
  {
    id: 'conselheiro-dos-mais-novos',
    titulo: 'O conselheiro de cada um dos que têm dez anos',
    detalhe: 'O nome do membro e o do conselheiro dele, só para quem tem dez anos e já tem unidade. Junção e filtro na mesma consulta.',
    onde: 'Editor de SQL',
    passos: [
      'Parta da junção da tarefa anterior.',
      'Troque as colunas pedidas para o nome do membro e o conselheiro da unidade.',
      'Acrescente o filtro depois do ON: WHERE membros.idade = 10.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, comUnidade.filter(m => m.idade === 10)
      .map(m => [m.nome, UNIDADES.find(u => u.id === m.unidade_id)!.conselheiro])),
  },
  {
    id: 'ninguem-de-fora',
    titulo: 'A lista de todos, inclusive de quem ainda não tem unidade',
    detalhe: 'A junção comum só devolve quem tem par dos dois lados. Quem chegou ontem some da lista sem erro, e a lista parece completa.',
    onde: 'Editor de SQL',
    passos: [
      'Conte as linhas da primeira tarefa e compare com o total de membros: falta alguém.',
      'Troque JOIN por LEFT JOIN: todo membro aparece, e onde não há unidade a coluna vem vazia.',
      'Mostre o nome do membro e o da unidade.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, MEMBROS_NO_BANCO.map(m => [m.nome, nomeDaUnidade(m.unidade_id)])),
  },
];

/* ── Módulo 4: agregação com agrupamento ──────────────────────────────────── */

const METAS_DA_AGREGACAO: MetaDoBanco[] = [
  {
    id: 'quantos-por-unidade',
    titulo: 'Quantos membros cada unidade tem',
    detalhe: 'Uma linha por unidade, com o nome dela e a contagem. Quem não tem unidade não é uma unidade.',
    onde: 'Editor de SQL',
    passos: [
      'Junte membros e unidades, como no módulo 3.',
      'Peça unidades.nome e COUNT(*).',
      'Termine com GROUP BY unidades.nome: é o que faz a contagem sair uma por unidade, e não uma só para a tabela inteira.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, UNIDADES.map(u => [u.nome, contaDe(u)])),
  },
  {
    id: 'media-de-idade',
    titulo: 'A média de idade de cada unidade',
    detalhe: 'A média de quem tem idade registrada. Somar e dividir pelo total de membros conta o vazio como se fosse alguém, e o Tucano sai mais novo do que é.',
    onde: 'Editor de SQL',
    passos: [
      'A mesma junção e o mesmo GROUP BY da tarefa anterior.',
      'No lugar do COUNT(*), use AVG(membros.idade). O AVG deixa o NULL de fora sozinho.',
      'Se quiser arredondar, ROUND(AVG(membros.idade), 2) também vale.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, UNIDADES.map(u => [u.nome, mediaDe(u)])),
  },
  {
    id: 'unidades-grandes',
    titulo: 'As unidades com mais de nove membros',
    detalhe: 'Só as unidades, e só as grandes. O filtro aqui é sobre a contagem, que só existe depois de agrupar.',
    onde: 'Editor de SQL',
    passos: [
      'Parta da contagem por unidade.',
      'WHERE filtra as linhas antes de agrupar, e a contagem ainda não existe ali — o banco recusa.',
      'O filtro depois do agrupamento é o HAVING: HAVING COUNT(*) > 9.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, UNIDADES.filter(u => contaDe(u) > 9).map(u => [u.nome])),
  },
];

/* ── Módulo 5: o dado repetido ────────────────────────────────────────────── */

const DA_AGUIA = INSCRICOES.filter(i => i.unidade === 'Águia');
const nomeDoMembro = (id: number) => MEMBROS_NO_BANCO.find(m => m.id === id)!.nome;

/** Uma coluna do resultado identifica estas inscrições — pelo nome, pelo membro ou pela inscrição? */
const identificaAsInscricoes = (c: ContextoDoBanco, lista: typeof INSCRICOES) =>
  [lista.map(i => [nomeDoMembro(i.membro_id)]), lista.map(i => [i.membro_id]), lista.map(i => [i.id])]
    .some(linhas => algumaConsultaTraz(c.execucao, linhas));

const SO_O_QUE_E_DA_INSCRICAO = /telefone|conselheiro|unidade/;

/** A lista do acampamento sem cópia de nada que mora em outra tabela, e com cada inscrição no lugar. */
function inscricoesSemRepeticao(c: ContextoDoBanco): boolean {
  const t = tabelaDe(final(c), 'inscricoes');
  if (!t) return false;
  if (t.colunas.some(col => SO_O_QUE_E_DA_INSCRICAO.test(normal(col.nome)))) return false;
  const aponta = t.estrangeiras.some(e => normal(e.coluna) === 'membro_id' && normal(e.tabela) === 'membros');
  if (!aponta) return false;
  const pares = registros(t).map(r => `${r.membro_id}|${r.diarias}`).sort();
  return pares.join(',') === INSCRICOES.map(i => `${i.membro_id}|${i.diarias}`).sort().join(',');
}

const METAS_DA_NORMALIZACAO: MetaDoBanco[] = [
  {
    id: 'achou-o-desencontro',
    titulo: 'Achar as inscrições com o telefone desencontrado',
    detalhe: 'O telefone do conselheiro está guardado duas vezes: na tabela de unidades e em cada inscrição. Uma das cópias envelheceu.',
    onde: 'Editor de SQL',
    passos: [
      'Junte inscricoes e unidades pelo nome da unidade: ON inscricoes.unidade = unidades.nome.',
      'Filtre as linhas em que os dois telefones são diferentes: WHERE inscricoes.telefone_do_conselheiro <> unidades.telefone.',
      'Mostre quem são: o membro_id, ou o nome junto com a tabela de membros.',
    ],
    feita: c => identificaAsInscricoes(c, DA_AGUIA),
  },
  {
    id: 'tirou-a-repeticao',
    titulo: 'Tirar da inscrição o que mora em outra tabela',
    detalhe: 'A inscrição precisa guardar só o que é dela: quem se inscreveu e quantas diárias. A unidade, o conselheiro e o telefone já moram em outro lugar, e cópia é o que envelhece.',
    onde: 'Editor de SQL',
    passos: [
      'Cada coluna que se repete sai com ALTER TABLE inscricoes DROP COLUMN nome_da_coluna; — uma por comando.',
      'São três: unidade, conselheiro e telefone_do_conselheiro.',
      'O membro_id fica: é por ele que se chega à unidade, e da unidade ao telefone.',
    ],
    feita: c => inscricoesSemRepeticao(c) && unidadesIntactas(c),
  },
  {
    id: 'telefone-pela-juncao',
    titulo: 'A lista do acampamento com o telefone de hoje',
    detalhe: 'Cada inscrito e o telefone do conselheiro dele, lido de onde ele mora. Assim a próxima troca de celular se faz num lugar só.',
    onde: 'Editor de SQL',
    passos: [
      'Duas junções em fila: inscricoes com membros pelo membro_id, e membros com unidades pelo unidade_id.',
      'Mostre o nome do membro e unidades.telefone.',
      'Confira a Águia: o número tem de ser o novo.',
    ],
    feita: c => algumaConsultaTraz(c.execucao, INSCRICOES.map(i => {
      const m = MEMBROS_NO_BANCO.find(x => x.id === i.membro_id)!;
      return [m.nome, UNIDADES.find(u => u.id === m.unidade_id)!.telefone];
    })),
  },
];

/* ── Módulo 6: o diagrama ─────────────────────────────────────────────────── */

const ehAssociativa = (d: Diagrama, t: TabelaDoDiagrama) => {
  const m = tabelaChamada(d, 'membros');
  const e = especialidadesDo(d);
  return !!m && !!e && t !== m && t !== e
    && estrangeirasDe(t, m.id).length > 0 && estrangeirasDe(t, e.id).length > 0;
};

function especialidadesDo(d: Diagrama): TabelaDoDiagrama | undefined {
  return d.tabelas.find(t => normal(t.nome).startsWith('especialidade'));
}

const doMeio = (d: Diagrama) => d.tabelas.find(t => ehAssociativa(d, t));

const METAS_DO_DIAGRAMA: MetaDoBanco[] = [
  {
    id: 'chave-que-identifica',
    titulo: 'Trocar a chave dos membros por uma que identifique',
    detalhe: 'O clube tem duas Ana Clara Ribeiro. Um nome não diz de quem se está falando, e uma conquista que apontasse para ele não saberia de qual das duas é.',
    onde: 'Diagrama → membros',
    passos: [
      'Clique na tabela membros para abrir as propriedades.',
      'Acrescente uma coluna id, do tipo INTEGER, e marque-a como chave.',
      'Desmarque a chave do nome: ele continua na tabela, só deixa de identificar.',
    ],
    feita: c => {
      const ch = chaveDe(tabelaChamada(c.diagrama, 'membros'));
      return ch.length === 1 && ch[0].tipo === 'INTEGER' && normal(ch[0].nome) !== 'nome';
    },
  },
  {
    id: 'especialidades',
    titulo: 'Uma tabela de especialidades, com chave',
    detalhe: 'A especialidade é uma coisa do mundo do clube, com código e nome, e merece tabela própria — escrevê-la dentro do membro repetiria o nome dela em cada conquista.',
    onde: 'Diagrama → Nova tabela',
    passos: [
      'Clique em Nova tabela e chame-a de especialidades.',
      'Ela já nasce com um id de chave. Acrescente o código e o nome, os dois TEXT.',
    ],
    feita: c => {
      const e = especialidadesDo(c.diagrama);
      return !!e && chaveDe(e).length === 1 && e.colunas.length >= 3 && estrangeirasDe(e).length === 0;
    },
  },
  {
    id: 'tabela-do-meio',
    titulo: 'A conquista no meio, com a data dela',
    detalhe: 'Um membro conquista muitas especialidades, e uma especialidade é conquistada por muitos membros. A data não é de nenhum dos dois: é do encontro entre eles.',
    onde: 'Diagrama → Nova tabela',
    passos: [
      'Crie uma terceira tabela, por exemplo conquistas.',
      'Dê a ela uma coluna membro_id que aponte para membros, e uma especialidade_id que aponte para especialidades.',
      'E uma coluna data, do tipo DATE. É aqui, e não em outro lugar, que ela cabe.',
    ],
    feita: c => {
      const t = doMeio(c.diagrama);
      const fora = [tabelaChamada(c.diagrama, 'membros'), especialidadesDo(c.diagrama)];
      return !!t && t.colunas.some(col => col.tipo === 'DATE')
        && fora.every(f => !(f?.colunas ?? []).some(col => col.tipo === 'DATE'));
    },
  },
  {
    id: 'cardinalidades',
    titulo: 'Dizer quantos de cada lado, em toda ligação',
    detalhe: 'Toda coluna que aponta para outra tabela precisa de uma ligação dizendo a cardinalidade, e a ligação precisa concordar com a coluna: no um-para-muitos, quem aponta é o lado muitos.',
    onde: 'Diagrama → Nova ligação',
    passos: [
      'Crie uma ligação de membros para a tabela do meio, um-para-muitos: um membro, muitas conquistas.',
      'E outra de especialidades para a tabela do meio, também um-para-muitos.',
      'Uma ligação muitos-para-muitos direta entre membros e especialidades não tem coluna onde morar. Se você desenhou uma, apague.',
    ],
    feita: c => !!doMeio(c.diagrama) && cardinalidadesCoerentes(c.diagrama),
  },
  {
    id: 'tres-relacionadas',
    titulo: 'Três tabelas ou mais, todas com chave, todas ligadas',
    detalhe: 'É o requisito 5 inteiro: um diagrama em que dá para ir de qualquer tabela a qualquer outra pelas ligações, e em que toda tabela sabe quem identifica cada linha dela.',
    onde: 'Diagrama',
    passos: [
      'Confira que cada tabela tem uma chave marcada.',
      'Confira que nenhuma tabela ficou solta, sem ligação.',
    ],
    feita: c => c.diagrama.tabelas.length >= 3 && c.diagrama.tabelas.every(t => chaveDe(t).length > 0)
      && conectadas(c.diagrama) && cardinalidadesCoerentes(c.diagrama),
  },
];

/* ── Módulo 7: criar as tabelas ───────────────────────────────────────────── */

function tabelaComChaveInteira(t: TabelaDoBanco | undefined): boolean {
  const ch = chavePrimaria(t);
  return ch.length === 1 && ehInteiro(colunaDe(t, ch[0])!.tipo);
}

const aponta = (t: TabelaDoBanco | undefined, tabela: string) =>
  !!t?.estrangeiras.some(e => normal(e.tabela) === tabela && (e.para === '' || normal(e.para) === 'id'));

const METAS_DA_CRIACAO: MetaDoBanco[] = [
  {
    id: 'criou-especialidades',
    titulo: 'Criar a tabela de especialidades',
    detalhe: 'Com um id inteiro de chave primária, o código e um nome que não pode ficar em branco.',
    onde: 'Editor de SQL',
    passos: [
      'CREATE TABLE especialidades ( ... ); com as colunas entre os parênteses, separadas por vírgula.',
      'A primeira: id INTEGER PRIMARY KEY.',
      'Depois codigo TEXT e nome TEXT NOT NULL — o NOT NULL é o banco recusando especialidade sem nome.',
    ],
    feita: c => {
      const t = tabelaDe(final(c), 'especialidades');
      const nome = colunaDe(t, 'nome');
      return tabelaComChaveInteira(t) && !!colunaDe(t, 'codigo') && !!nome && nome.naoNulo && ehTexto(nome.tipo);
    },
  },
  {
    id: 'criou-conquistas',
    titulo: 'Criar a tabela das conquistas, apontando para as duas',
    detalhe: 'É a tabela do meio do diagrama do módulo 6: quem conquistou, o quê, e quando.',
    onde: 'Editor de SQL',
    passos: [
      'CREATE TABLE conquistas, com id INTEGER PRIMARY KEY.',
      'membro_id INTEGER REFERENCES membros(id) — o REFERENCES é a chave estrangeira.',
      'especialidade_id INTEGER REFERENCES especialidades(id), e uma coluna data.',
      'A tabela de especialidades precisa existir antes: crie as duas nessa ordem.',
    ],
    feita: c => {
      const t = tabelaDe(final(c), 'conquistas');
      return tabelaComChaveInteira(t) && aponta(t, 'membros') && aponta(t, 'especialidades') && !!colunaDe(t, 'data');
    },
  },
  {
    id: 'tipos-certos',
    titulo: 'Cada coluna com o tipo do que ela guarda',
    detalhe: 'O código AP034 é texto, por mais que tenha número. A data vai como texto no formato ano-mês-dia, que é o que se ordena certo. E os ids são inteiros.',
    onde: 'Editor de SQL',
    passos: [
      'codigo TEXT, e não INTEGER: um código com zero na frente perderia o zero.',
      'data TEXT ou data DATE. Número, não: 14032026 não se ordena como data.',
      'membro_id e especialidade_id INTEGER, como o id para onde apontam.',
    ],
    feita: c => {
      const e = tabelaDe(final(c), 'especialidades');
      const q = tabelaDe(final(c), 'conquistas');
      const codigo = colunaDe(e, 'codigo');
      const data = colunaDe(q, 'data');
      const ids = ['membro_id', 'especialidade_id'].map(n => colunaDe(q, n));
      return !!codigo && ehTexto(codigo.tipo) && !!data && ehData(data.tipo)
        && ids.every(col => !!col && ehInteiro(col.tipo));
    },
  },
  {
    id: 'recusou-o-orfao',
    titulo: 'Ver o banco recusar uma conquista de ninguém',
    detalhe: 'A chave estrangeira não é enfeite: com ela, o banco não aceita conquista de um membro que não existe. Termine o arquivo tentando, e leia a recusa.',
    onde: 'Editor de SQL → Mensagens',
    passos: [
      'Depois das duas tabelas, escreva uma inserção de conquista para um membro que não existe, como o 999.',
      'Execute. A execução para nessa linha, com FOREIGN KEY constraint failed na aba Mensagens.',
      'O que veio antes continua feito: as tabelas foram criadas.',
    ],
    feita: c => {
      const e = c.execucao;
      const falhou = e?.comandos.find(x => x.erro);
      return !!e && !!falhou && /^insert\s+into\s+"?conquistas/i.test(falhou.sql)
        && falhou.erro === 'FOREIGN KEY constraint failed'
        && !!tabelaDe(e.banco, 'conquistas') && !!tabelaDe(e.banco, 'especialidades');
    },
  },
];

/* ── Módulo 8: inserir, atualizar e remover ───────────────────────────────── */

export const DATA_DA_AP043 = '2026-03-14';
export const QUEM_FEZ_A_AP043 = ['Henrique Dias', 'Natália Brito'];
/** A Ana Clara da Arara, que fez onze anos — e não a do Tucano. */
export const ANIVERSARIANTE = membro('Ana Clara Ribeiro', 'Arara');

const idDaEspecialidade = (c: ContextoDoBanco, codigo: string) =>
  registros(tabelaDe(final(c), 'especialidades')).find(r => r.codigo === codigo)?.id;

const especialidadesDePartidaIntactas = (c: ContextoDoBanco) => {
  const t = registros(tabelaDe(final(c), 'especialidades'));
  return ESPECIALIDADES_DE_PARTIDA.every(([id, codigo, nome]) => t.some(r => r.id === id && r.codigo === codigo && r.nome === nome));
};

/**
 * Os outros membros como a semente os pôs, com ou sem o aniversário.
 *
 * Quem saiu fica fora da conta nos dois sentidos: estar lá ou não é a meta de
 * remover que confere, e as outras não dependem disso.
 */
function membrosComoDeviam(c: ContextoDoBanco, aniversario: boolean) {
  const t = registros(tabelaDe(final(c), 'membros'));
  const esperado = MEMBROS_NO_BANCO
    .filter(m => m.nome !== QUEM_SAIU)
    .map(m => (aniversario && m.id === ANIVERSARIANTE.id ? { ...m, idade: 11 } : m));
  const porId = new Map(t.map(r => [r.id, r]));
  return esperado.every(m => {
    const r = porId.get(m.id);
    return !!r && r.nome === m.nome && r.idade === m.idade && r.unidade_id === m.unidade_id;
  });
}

const METAS_DA_ALTERACAO: MetaDoBanco[] = ([
  {
    id: 'inseriu-especialidades',
    titulo: 'Cadastrar as três especialidades de Computação que faltam',
    detalhe: ESPECIALIDADES_NOVAS.map(([codigo, nome]) => `${codigo} ${nome}`).join(', ') + '. As que já estavam continuam lá.',
    onde: 'Editor de SQL',
    passos: [
      'INSERT INTO especialidades (codigo, nome) VALUES (...); — o id não precisa ser escrito: a chave inteira se numera sozinha.',
      'Vários registros cabem num INSERT só, separados por vírgula: VALUES (...), (...), (...).',
      'O texto vai entre aspas simples.',
    ],
    feita: c => especialidadesDePartidaIntactas(c)
      && ESPECIALIDADES_NOVAS.every(([codigo]) =>
        registros(tabelaDe(final(c), 'especialidades')).some(r => r.codigo === codigo && typeof r.nome === 'string' && r.nome.trim() !== '')),
  },
  {
    id: 'registrou-as-conquistas',
    titulo: 'Registrar quem concluiu a AP043 em março',
    detalhe: `${QUEM_FEZ_A_AP043.join(' e ')} concluíram a AP043 no dia 14 de março de 2026. A data vai no formato do banco, ano-mês-dia.`,
    onde: 'Editor de SQL',
    passos: [
      'Ache o id de cada um na tabela de membros, e o id da AP043 depois de cadastrá-la.',
      'INSERT INTO conquistas (membro_id, especialidade_id, data) VALUES (...), (...);',
      `A data se escreve '${DATA_DA_AP043}'. Escrita 14/03/2026, ela não se ordena e não se compara com as outras.`,
    ],
    feita: c => {
      const ap043 = idDaEspecialidade(c, 'AP043');
      const t = registros(tabelaDe(final(c), 'conquistas'));
      return ap043 !== undefined && QUEM_FEZ_A_AP043.every(n =>
        t.filter(r => r.membro_id === membro(n).id && r.especialidade_id === ap043 && r.data === DATA_DA_AP043).length === 1);
    },
  },
  {
    id: 'aniversario-da-certa',
    titulo: 'A Ana Clara da Arara fez onze anos',
    detalhe: 'Só ela. O clube tem duas Ana Clara Ribeiro, e um UPDATE que procura pelo nome muda as duas — inclusive a do Tucano, cuja idade ninguém sabe.',
    onde: 'Editor de SQL',
    passos: [
      'Procure as duas: SELECT * FROM membros WHERE nome = \'Ana Clara Ribeiro\'; e veja qual é da Arara.',
      'UPDATE membros SET idade = 11 WHERE id = ... com o id dela.',
      'Escreva o WHERE antes de escrever o SET. Um UPDATE sem WHERE muda a tabela inteira.',
    ],
    feita: c => membrosComoDeviam(c, true),
  },
  {
    id: 'saiu-do-clube',
    titulo: `Tirar ${QUEM_SAIU}, que saiu do clube`,
    detalhe: 'Ele tem uma conquista registrada, e o banco não deixa apagar um membro para quem outra tabela ainda aponta. A conquista sai primeiro.',
    onde: 'Editor de SQL',
    passos: [
      `Tente DELETE FROM membros WHERE id = ... com o id de ${QUEM_SAIU}, e leia a recusa.`,
      'Apague antes a conquista dele: DELETE FROM conquistas WHERE membro_id = ...',
      'Depois, o membro. As outras conquistas continuam lá.',
    ],
    feita: c => {
      const membros = registros(tabelaDe(final(c), 'membros'));
      const conquistas = registros(tabelaDe(final(c), 'conquistas'));
      const outras = CONQUISTAS_DE_PARTIDA.filter(([, m]) => m !== membro(QUEM_SAIU).id);
      return !membros.some(r => r.nome === QUEM_SAIU)
        && outras.every(([id, m, e, data]) => conquistas.some(r => r.id === id && r.membro_id === m && r.especialidade_id === e && r.data === data))
        && (membrosComoDeviam(c, true) || membrosComoDeviam(c, false));
    },
  },
] as MetaDoBanco[]).map(m => ({ ...m, feita: (c: ContextoDoBanco) => m.feita(c) && unidadesIntactas(c) }));

/* ── O registro ───────────────────────────────────────────────────────────── */

const enunciado = (titulo: string, linhas: string[]) =>
  [`-- ${titulo}`, '--', ...linhas.map(l => (l ? `-- ${l}` : '--')), '', ''].join('\n');

const semDiagrama = () => ({ tabelas: [], ligacoes: [] });

export const LICOES_DA_CC005: Record<LicaoDaCc005, LicaoDoBanco> = {
  tabelas: {
    programa: 'sql', semente: SEMENTE_DO_CLUBE, arquivo: 'primeiras.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DAS_TABELAS,
    modelo: enunciado('O banco do clube, pela primeira vez', [
      'As tabelas estão na lateral. Clique numa para ver as colunas.',
      '',
      '1. Mostre a tabela de unidades inteira.',
      '2. Mostre só o nome e a idade de cada membro.',
      '3. Mostre cada unidade e o conselheiro dela, com as colunas',
      '   chamadas Unidade e Conselheiro.',
      '',
      'Escreva os comandos abaixo e clique em Executar.',
    ]),
  },
  consultas: {
    programa: 'sql', semente: SEMENTE_DO_CLUBE, arquivo: 'consultas.sql', diagrama: semDiagrama,
    apoio: [{ nome: 'procura.py', conteudo: PROCURA_PY }],
    metas: METAS_DAS_CONSULTAS,
    modelo: enunciado('Filtrar e ordenar', [
      'O procura.py, na lateral, imprime o nome e a idade dos membros',
      'da Águia, do mais velho ao mais novo. Ele diz COMO procurar.',
      '',
      '1. Escreva a consulta que devolve a mesma lista.',
      '2. Na mesma ordem que ele usa.',
      '3. Ache quem está sem idade registrada.',
    ]),
  },
  juncao: {
    programa: 'sql', semente: SEMENTE_DO_CLUBE, arquivo: 'juncao.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DA_JUNCAO,
    modelo: enunciado('Juntar duas tabelas', [
      'O membro guarda o id da unidade, e não o nome dela.',
      '',
      '1. Mostre cada membro com o nome da unidade dele.',
      '2. Mostre o conselheiro de cada membro de dez anos.',
      '3. Mostre todos os membros com a unidade, sem deixar ninguém',
      '   de fora.',
    ]),
  },
  agregacao: {
    programa: 'sql', semente: SEMENTE_DO_CLUBE, arquivo: 'contas.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DA_AGREGACAO,
    modelo: enunciado('Contar por unidade', [
      '1. Quantos membros cada unidade tem?',
      '2. Qual é a média de idade de cada unidade?',
      '3. Quais unidades têm mais de nove membros?',
    ]),
  },
  normalizacao: {
    programa: 'sql', semente: SEMENTE_DO_ACAMPAMENTO, arquivo: 'acampamento.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DA_NORMALIZACAO,
    modelo: enunciado('A lista do acampamento', [
      'A Tia Rute trocou de celular em março, e a secretaria',
      'atualizou a tabela de unidades. A lista do acampamento foi',
      'montada em fevereiro, com o telefone copiado em cada inscrição.',
      '',
      '1. Ache as inscrições em que o telefone não bate.',
      '2. Tire da inscrição o que mora em outra tabela.',
      '3. Monte a lista com o telefone de hoje.',
    ]),
  },
  diagrama: {
    programa: 'diagrama', semente: SEMENTE_DO_CLUBE, arquivo: 'clube.diagrama', apoio: [], diagrama: diagramaDaSecretaria,
    metas: METAS_DO_DIAGRAMA, modelo: '',
  },
  criar: {
    programa: 'sql', semente: SEMENTE_DO_CLUBE, arquivo: 'especialidades.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DA_CRIACAO,
    modelo: enunciado('As tabelas das especialidades', [
      'O diagrama do módulo 6 vira banco agora.',
      '',
      '1. Crie a tabela de especialidades.',
      '2. Crie a das conquistas, apontando para membros e especialidades.',
      '3. Escolha o tipo de cada coluna pelo que ela guarda.',
      '4. Termine tentando uma conquista para um membro que não existe.',
    ]),
  },
  alterar: {
    programa: 'sql', semente: SEMENTE_DAS_ESPECIALIDADES, arquivo: 'secretaria.sql', apoio: [], diagrama: semDiagrama,
    metas: METAS_DA_ALTERACAO,
    modelo: enunciado('O trabalho da secretaria', [
      `1. Cadastre ${ESPECIALIDADES_NOVAS.map(([c]) => c).join(', ')}.`,
      `2. ${QUEM_FEZ_A_AP043.join(' e ')} concluíram a AP043 em 14/03/2026.`,
      '3. A Ana Clara Ribeiro da Arara fez onze anos.',
      `4. ${QUEM_SAIU} saiu do clube.`,
    ]),
  },
};

export const metasDa = (licao: LicaoDaCc005) => LICOES_DA_CC005[licao].metas;

/* Exportados para as travas, que conferem as premissas do banco de partida. */
export { TELEFONE_ANTIGO_DA_AGUIA, mediaDe, contaDe };
