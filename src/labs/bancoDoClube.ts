/**
 * O banco do clube, de que partem os laboratórios da CC005.
 *
 * ── A mesma gente das outras veredas ─────────────────────────────────────
 * Os sessenta e um membros são os de `chamadaDoClube.ts` — o nome, a unidade
 * e a idade de lá —, e as seis unidades são as de `baseDoAcampamento.ts`, com
 * os mesmos conselheiros. Um banco com gente inventada ensinaria que cada
 * vereda acontece num clube de mentira.
 *
 * A idade em branco da Ana Clara Ribeiro do Tucano também é a de lá, e aqui ela
 * vira `NULL`, que é o assunto do módulo 2: `WHERE idade = NULL` não acha
 * ninguém, e a média do Tucano não conta quem não tem idade. E as duas Ana
 * Clara Ribeiro continuam sendo duas — é por elas que o nome não serve de
 * chave, e o `UPDATE ... WHERE nome = ...` do módulo 8 muda as duas.
 *
 * ── E um a mais, que chegou ontem ────────────────────────────────────────
 * O Kauã Medeiros se inscreveu no clube e ainda não tem unidade. Ele é a
 * razão de o `JOIN` do módulo 3 precisar de um segundo jeito: a junção comum
 * só devolve quem tem par dos dois lados, e ele some da lista sem erro
 * nenhum — sessenta e uma linhas, número plausível, um desbravador a menos.
 *
 * ── O banco se escreve em SQL, e não em objeto ───────────────────────────
 * A semente é o texto que o motor executa antes do arquivo da pessoa. Ela é
 * montada daqui, das listas, e nunca digitada à parte: duas cópias da mesma
 * gente divergem na primeira correção de um nome.
 */

import { MEMBROS } from './chamadaDoClube';
import { ELENCO } from './baseDoAcampamento';

/** Um texto como literal SQL: aspas simples, e a aspa de dentro dobrada. */
export const literal = (t: string) => `'${t.replace(/'/g, "''")}'`;
const sqlDe = (v: string | number | null) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : literal(v));

/* ── As unidades ──────────────────────────────────────────────────────────── */

/** O telefone de cada conselheiro, na ordem de `ELENCO`. */
const TELEFONES = [
  '(61) 99812-4410', '(61) 99654-2087', '(61) 98433-1902',
  '(61) 99271-5536', '(61) 98815-6724', '(61) 99540-3318',
];

export interface UnidadeNoBanco { id: number; nome: string; conselheiro: string; telefone: string }

export const UNIDADES: UnidadeNoBanco[] = ELENCO.map((u, i) => ({
  id: i + 1, nome: u.nome, conselheiro: u.conselheiro, telefone: TELEFONES[i],
}));

export const unidadePeloNome = (nome: string) => UNIDADES.find(u => u.nome === nome)!;

/* ── Os membros ───────────────────────────────────────────────────────────── */

export interface MembroNoBanco { id: number; nome: string; idade: number | null; unidade_id: number | null }

/** O que chegou ontem, sem unidade. */
export const RECEM_CHEGADO = 'Kauã Medeiros';

export const MEMBROS_NO_BANCO: MembroNoBanco[] = [
  ...MEMBROS.map((m, i) => ({
    id: i + 1, nome: m.nome, idade: m.idade, unidade_id: unidadePeloNome(m.unidade).id,
  })),
  { id: MEMBROS.length + 1, nome: RECEM_CHEGADO, idade: 10, unidade_id: null },
];

/** O membro pelo nome — e pela unidade, quando o nome não basta. */
export function membro(nome: string, unidade?: string): MembroNoBanco {
  const achados = MEMBROS_NO_BANCO.filter(m => m.nome === nome
    && (unidade === undefined || m.unidade_id === unidadePeloNome(unidade).id));
  if (achados.length !== 1) throw new Error(`${nome} (${unidade ?? 'sem unidade'}) não identifica um membro só.`);
  return achados[0];
}

export const nomeDaUnidade = (id: number | null) => UNIDADES.find(u => u.id === id)?.nome ?? null;

/* ── A semente ────────────────────────────────────────────────────────────── */

const insercoes = (tabela: string, linhas: (string | number | null)[][]) =>
  linhas.length === 0 ? '' : `INSERT INTO ${tabela} VALUES\n${linhas.map(l => `  (${l.map(sqlDe).join(', ')})`).join(',\n')};\n`;

const TABELAS_DO_CLUBE = `CREATE TABLE unidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  conselheiro TEXT NOT NULL,
  telefone TEXT NOT NULL
);
CREATE TABLE membros (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER,
  unidade_id INTEGER REFERENCES unidades(id)
);
`;

/** O banco como a secretaria o mantém: as unidades e os membros. */
export const SEMENTE_DO_CLUBE = TABELAS_DO_CLUBE
  + insercoes('unidades', UNIDADES.map(u => [u.id, u.nome, u.conselheiro, u.telefone]))
  + insercoes('membros', MEMBROS_NO_BANCO.map(m => [m.id, m.nome, m.idade, m.unidade_id]));

/* ── O módulo 5: a lista do acampamento, com o telefone repetido ──────────── */

/**
 * O número que a Tia Rute usava até março.
 *
 * Ela trocou de celular, a secretaria atualizou a tabela de unidades, e a
 * lista do acampamento — montada em fevereiro, com o telefone copiado para
 * cada inscrito — continuou com o antigo. Na noite do acampamento, a ligação
 * de emergência de oito desbravadores da Águia vai para um número que ninguém
 * atende. Nada estoura: as duas tabelas têm um telefone bem escrito em cada
 * linha, e é isso que torna o dado repetido o defeito mais caro desta vereda.
 */
export const TELEFONE_ANTIGO_DA_AGUIA = '(61) 99317-7764';

/** Os quarenta e oito do acampamento, que são os primeiros da lista. */
const INSCRITOS = MEMBROS_NO_BANCO.slice(0, 48);

/** As diárias de cada inscrito: duas, e três para um em cada três. */
export const diariasDe = (i: number) => (i % 3 === 0 ? 3 : 2);

export interface InscricaoNoBanco {
  id: number;
  membro_id: number;
  unidade: string;
  conselheiro: string;
  telefone_do_conselheiro: string;
  diarias: number;
}

export const INSCRICOES: InscricaoNoBanco[] = INSCRITOS.map((m, i) => {
  const u = UNIDADES.find(x => x.id === m.unidade_id)!;
  return {
    id: i + 1,
    membro_id: m.id,
    unidade: u.nome,
    conselheiro: u.conselheiro,
    telefone_do_conselheiro: u.nome === 'Águia' ? TELEFONE_ANTIGO_DA_AGUIA : u.telefone,
    diarias: diariasDe(i),
  };
});

export const SEMENTE_DO_ACAMPAMENTO = SEMENTE_DO_CLUBE
  + `CREATE TABLE inscricoes (
  id INTEGER PRIMARY KEY,
  membro_id INTEGER NOT NULL REFERENCES membros(id),
  unidade TEXT NOT NULL,
  conselheiro TEXT NOT NULL,
  telefone_do_conselheiro TEXT NOT NULL,
  diarias INTEGER NOT NULL
);
`
  + insercoes('inscricoes', INSCRICOES.map(i =>
    [i.id, i.membro_id, i.unidade, i.conselheiro, i.telefone_do_conselheiro, i.diarias]));

/* ── Os módulos 7 e 8: as especialidades ──────────────────────────────────── */

/**
 * As duas tabelas que o módulo 7 cria, como a referência as escreve.
 *
 * O módulo 8 parte delas, e é a regra de toda vereda daqui: mandar recriar as
 * tabelas para poder inserir nelas ensinaria que o trabalho de antes não conta.
 */
export const TABELAS_DAS_ESPECIALIDADES = `CREATE TABLE especialidades (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL
);
CREATE TABLE conquistas (
  id INTEGER PRIMARY KEY,
  membro_id INTEGER NOT NULL REFERENCES membros(id),
  especialidade_id INTEGER NOT NULL REFERENCES especialidades(id),
  data TEXT NOT NULL
);
`;

/** As que o clube já registrava. As três de Computação que faltam, o módulo 8 insere. */
export const ESPECIALIDADES_DE_PARTIDA: [number, string, string][] = [
  [1, 'AP034', 'Internet'],
  [2, 'AP035', 'Internet, Avançado'],
  [3, 'AP041', 'Computação 1'],
];

/** As que o módulo 8 manda inserir. */
export const ESPECIALIDADES_NOVAS: [string, string][] = [
  ['AP042', 'Computação 2'],
  ['AP043', 'Computação 3'],
  ['AP044', 'Computação 4'],
];

/** Quem saiu do clube, e tem conquista registrada — é ela que faz o DELETE pedir ordem. */
export const QUEM_SAIU = 'Benício Rios';

export const CONQUISTAS_DE_PARTIDA: [number, number, number, string][] = [
  [1, membro('Henrique Dias').id, 1, '2025-11-08'],
  [2, membro('Henrique Dias').id, 3, '2026-02-21'],
  [3, membro('Natália Brito').id, 1, '2025-11-08'],
  [4, membro(QUEM_SAIU).id, 1, '2025-11-08'],
  [5, membro('Beatriz Carvalho').id, 2, '2026-03-07'],
];

export const SEMENTE_DAS_ESPECIALIDADES = SEMENTE_DO_CLUBE + TABELAS_DAS_ESPECIALIDADES
  + insercoes('especialidades', ESPECIALIDADES_DE_PARTIDA)
  + insercoes('conquistas', CONQUISTAS_DE_PARTIDA);

/* ── O módulo 9: o pedido que o programa Python atende ────────────────────── */

/**
 * O novo membro que o programa do módulo 9 cadastra.
 *
 * O apóstrofo é a lição inteira. Montar o comando colando o nome no meio do
 * texto — `f"INSERT ... VALUES ('{nome}', ...)"` — fecha a aspa no meio do
 * sobrenome, e o SQLite responde erro de sintaxe; com o `?`, o nome viaja
 * separado do comando e entra inteiro. É o mesmo defeito que, com um nome
 * escrito de propósito, deixa alguém apagar a tabela — e aqui ele aparece com
 * um nome de verdade, que é como ele aparece na vida.
 */
export const NOVO_MEMBRO = { nome: "Pedro D'Ávila", idade: 11, unidade: 'Onça' };
