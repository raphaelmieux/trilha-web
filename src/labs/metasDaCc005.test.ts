import { describe, it, expect, beforeAll } from 'vitest';
import { carregarPyodide, type PyodideDeTeste } from './pyodideDeTeste';
import { programaDoSql, tabelaDe, registros, type ExecucaoDeSql } from './sqlite';
import { REFERENCIAS_DA_CC005 as REFERENCIAS, JOIN } from './referenciasDaCc005';
import {
  LICOES_DA_CC005, ANIVERSARIANTE, DATA_DA_AP043, QUEM_FEZ_A_AP043, metasDa,
  type ContextoDoBanco, type LicaoDaCc005,
} from './metasDaCc005';
import {
  CONQUISTAS_DE_PARTIDA, INSCRICOES, MEMBROS_NO_BANCO, QUEM_SAIU, RECEM_CHEGADO, TABELAS_DAS_ESPECIALIDADES,
  TELEFONE_ANTIGO_DA_AGUIA, UNIDADES, membro, unidadePeloNome,
} from './bancoDoClube';
import {
  diagramaDaSecretaria, mudarColuna, mudarTabela, novaColuna, novaLigacao, novaTabela, removerLigacao,
  tabelaChamada, type Diagrama, type TabelaDoDiagrama,
} from './diagramaDeTabelas';

/*
  As metas da CC005, conferidas rodando o SQL de verdade.

  As três perguntas de toda vereda daqui: o modelo abre sem nada verde, a
  solução de referência fecha a lista inteira, e o caminho rápido e errado
  fica vermelho na meta certa. Aqui elas só se respondem executando — a meta
  lê o que a consulta devolveu —, e por isso a trava sobe o mesmo SQLite que a
  tela usa.
*/

let py: PyodideDeTeste;
beforeAll(async () => { py = await carregarPyodide(); }, 120000);

const SQL: LicaoDaCc005[] = ['tabelas', 'consultas', 'juncao', 'agregacao', 'normalizacao', 'criar', 'alterar'];

function rodar(licao: LicaoDaCc005, script: string): ExecucaoDeSql {
  return JSON.parse(py.runPython(programaDoSql(LICOES_DA_CC005[licao].semente, script)) as string) as ExecucaoDeSql;
}

const contexto = (licao: LicaoDaCc005, script: string): ContextoDoBanco =>
  ({ execucao: rodar(licao, script), diagrama: LICOES_DA_CC005[licao].diagrama() });

const verdes = (licao: LicaoDaCc005, c: ContextoDoBanco) => metasDa(licao).filter(m => m.feita(c)).map(m => m.id);
const vermelhas = (licao: LicaoDaCc005, c: ContextoDoBanco) => metasDa(licao).filter(m => !m.feita(c)).map(m => m.id);

const AGUIA = unidadePeloNome('Águia').id;
const id = (nome: string, unidade?: string) => membro(nome, unidade).id;

/** O diagrama do módulo 6 como a referência o deixa. */
function diagramaDeReferencia(): Diagrama {
  let d = diagramaDaSecretaria();
  const membros = tabelaChamada(d, 'membros')!.id;
  d = mudarColuna(d, membros, 'm-nome', c => ({ ...c, chave: false }));
  d = novaColuna(d, membros);
  const idDeMembro = ultimaColuna(d, membros);
  d = mudarColuna(d, membros, idDeMembro, c => ({ ...c, nome: 'id', tipo: 'INTEGER', chave: true }));

  d = novaTabela(d, 'especialidades');
  const esp = ultimaTabela(d).id;
  for (const nome of ['codigo', 'nome']) {
    d = novaColuna(d, esp);
    d = mudarColuna(d, esp, ultimaColuna(d, esp), c => ({ ...c, nome }));
  }

  d = novaTabela(d, 'conquistas');
  const meio = ultimaTabela(d).id;
  const colunas: [string, Partial<TabelaDoDiagrama['colunas'][number]>][] = [
    ['membro_id', { tipo: 'INTEGER', referencia: membros }],
    ['especialidade_id', { tipo: 'INTEGER', referencia: esp }],
    ['data', { tipo: 'DATE' }],
  ];
  for (const [nome, resto] of colunas) {
    d = novaColuna(d, meio);
    d = mudarColuna(d, meio, ultimaColuna(d, meio), c => ({ ...c, nome, ...resto }));
  }
  d = novaLigacao(d, membros, meio, '1:N');
  d = novaLigacao(d, esp, meio, '1:N');
  return d;
}
const ultimaTabela = (d: Diagrama) => d.tabelas[d.tabelas.length - 1];
const ultimaColuna = (d: Diagrama, t: string) => d.tabelas.find(x => x.id === t)!.colunas.slice(-1)[0].id;

/* ── As premissas do banco de partida ─────────────────────────────────────── */

describe('o banco de partida da CC005', () => {
  it('tem as duas Ana Clara Ribeiro, e a do Tucano sem idade', () => {
    const anas = MEMBROS_NO_BANCO.filter(m => m.nome === 'Ana Clara Ribeiro');
    expect(anas).toHaveLength(2);
    expect(anas.filter(m => m.idade === null)).toHaveLength(1);
    expect(ANIVERSARIANTE.idade).not.toBeNull();
  });

  it('tem quem não tem unidade, e só um', () => {
    expect(MEMBROS_NO_BANCO.filter(m => m.unidade_id === null).map(m => m.nome)).toEqual([RECEM_CHEGADO]);
  });

  it('as unidades acima de nove não são todas, nem nenhuma', () => {
    const contas = UNIDADES.map(u => MEMBROS_NO_BANCO.filter(m => m.unidade_id === u.id).length);
    const grandes = contas.filter(n => n > 9).length;
    expect(grandes).toBeGreaterThan(0);
    expect(grandes).toBeLessThan(UNIDADES.length);
  });

  it('o telefone repetido envelheceu na Águia, e só lá', () => {
    for (const i of INSCRICOES) {
      const u = UNIDADES.find(x => x.nome === i.unidade)!;
      expect(i.telefone_do_conselheiro === u.telefone).toBe(u.nome !== 'Águia');
    }
    expect(INSCRICOES.some(i => i.telefone_do_conselheiro === TELEFONE_ANTIGO_DA_AGUIA)).toBe(true);
  });

  it('quem saiu tem conquista registrada, que é o que faz o DELETE pedir ordem', () => {
    expect(CONQUISTAS_DE_PARTIDA.some(([, m]) => m === id(QUEM_SAIU))).toBe(true);
  });

  it('a semente executa sem erro em todas as lições', () => {
    for (const licao of SQL) expect(rodar(licao, '').erro, licao).toBeNull();
  });
});

/* ── As três perguntas ────────────────────────────────────────────────────── */

describe('as metas da CC005', () => {
  it.each(SQL)('%s: nada abre verde, nem antes nem depois de executar o modelo', licao => {
    expect(verdes(licao, { execucao: null, diagrama: LICOES_DA_CC005[licao].diagrama() })).toEqual([]);
    expect(verdes(licao, contexto(licao, LICOES_DA_CC005[licao].modelo))).toEqual([]);
  });

  it.each(SQL)('%s: a solução de referência fecha a lista', licao => {
    const c = contexto(licao, REFERENCIAS[licao as Exclude<LicaoDaCc005, 'diagrama'>]);
    expect(c.execucao!.erro, JSON.stringify(c.execucao!.erro)).toBe(licao === 'criar' ? c.execucao!.erro : null);
    expect(vermelhas(licao, c)).toEqual([]);
  });

  it('o diagrama da secretaria abre sem nada verde', () => {
    expect(verdes('diagrama', { execucao: null, diagrama: diagramaDaSecretaria() })).toEqual([]);
  });

  it('o diagrama de referência fecha a lista', () => {
    expect(vermelhas('diagrama', { execucao: null, diagrama: diagramaDeReferencia() })).toEqual([]);
  });
});

/* ── Os caminhos errados ──────────────────────────────────────────────────── */

describe('o caminho rápido e errado fica vermelho onde devia', () => {
  const falha = (licao: LicaoDaCc005, script: string, meta: string) => {
    const c = contexto(licao, script);
    expect(metasDa(licao).find(m => m.id === meta)!.feita(c), script).toBe(false);
  };

  it('SELECT * não é o nome e a idade', () => falha('tabelas', 'SELECT * FROM membros;', 'nome-e-idade'));
  it('o cabeçalho com a minúscula não é o do relatório', () =>
    falha('tabelas', 'SELECT nome AS unidade, conselheiro AS conselheiro FROM unidades;', 'cabecalho-do-relatorio'));

  it('sem ORDER BY a lista está certa e a ordem não', () => {
    const c = contexto('consultas', `SELECT nome, idade FROM membros WHERE unidade_id = ${AGUIA};`);
    const m = (x: string) => metasDa('consultas').find(y => y.id === x)!.feita(c);
    expect(m('os-da-aguia')).toBe(true);
    /* O banco devolve na ordem em que gravou, que por acaso não é a pedida:
       se fosse, esta trava não diria nada. */
    expect(m('do-mais-velho')).toBe(false);
  });
  it('ORDER BY sem DESC sai do mais novo ao mais velho', () =>
    falha('consultas', `SELECT nome, idade FROM membros WHERE unidade_id = ${AGUIA} ORDER BY idade;`, 'do-mais-velho'));
  it('= NULL não acha ninguém, sem erro', () => {
    const e = rodar('consultas', 'SELECT nome FROM membros WHERE idade = NULL;');
    expect(e.erro).toBeNull();
    expect(e.comandos[0].linhas).toEqual([]);
    falha('consultas', 'SELECT nome FROM membros WHERE idade = NULL;', 'sem-idade');
  });

  it('o produto cartesiano devolve trezentas e tantas linhas, e não passa', () => {
    const e = rodar('juncao', 'SELECT membros.nome, unidades.nome FROM membros, unidades;');
    expect(e.comandos[0].linhas).toHaveLength(MEMBROS_NO_BANCO.length * UNIDADES.length);
    falha('juncao', 'SELECT membros.nome, unidades.nome FROM membros, unidades;', 'membro-com-unidade');
  });
  it('a junção pela coluna errada devolve seis linhas plausíveis', () =>
    falha('juncao', 'SELECT membros.nome, unidades.nome FROM membros JOIN unidades ON membros.id = unidades.id;', 'membro-com-unidade'));
  it('a junção comum deixa o recém-chegado de fora', () =>
    falha('juncao', `SELECT membros.nome, unidades.nome ${JOIN};`, 'ninguem-de-fora'));

  it('a contagem com LEFT JOIN inventa uma unidade vazia', () =>
    falha('agregacao', 'SELECT unidades.nome, COUNT(*) FROM membros LEFT JOIN unidades ON membros.unidade_id = unidades.id GROUP BY unidades.nome;', 'quantos-por-unidade'));
  it('soma dividida pelo total conta o vazio, e divide em inteiro', () => {
    const e = rodar('agregacao', `SELECT unidades.nome, SUM(membros.idade) / COUNT(*) ${JOIN} GROUP BY unidades.nome;`);
    const tucano = e.comandos[0].linhas.find(l => l[0] === 'Tucano')!;
    expect(tucano[1]).toBe(11);
    falha('agregacao', `SELECT unidades.nome, SUM(membros.idade) / COUNT(*) ${JOIN} GROUP BY unidades.nome;`, 'media-de-idade');
  });
  it('WHERE sobre a contagem é recusado', () => {
    const e = rodar('agregacao', `SELECT unidades.nome ${JOIN} WHERE COUNT(*) > 9 GROUP BY unidades.nome;`);
    expect(e.erro?.mensagem).toMatch(/misuse of aggregate/);
  });

  it('consertar as cópias não tira a repetição', () =>
    falha('normalizacao', `UPDATE inscricoes SET telefone_do_conselheiro = (SELECT telefone FROM unidades WHERE nome = 'Águia') WHERE unidade = 'Águia';`, 'tirou-a-repeticao'));
  it('tirar o telefone e deixar a unidade continua repetindo', () =>
    falha('normalizacao', `ALTER TABLE inscricoes DROP COLUMN conselheiro;
ALTER TABLE inscricoes DROP COLUMN telefone_do_conselheiro;`, 'tirou-a-repeticao'));
  it('apagar as diárias junto não é normalizar', () =>
    falha('normalizacao', `ALTER TABLE inscricoes DROP COLUMN unidade;
ALTER TABLE inscricoes DROP COLUMN conselheiro;
ALTER TABLE inscricoes DROP COLUMN telefone_do_conselheiro;
ALTER TABLE inscricoes DROP COLUMN diarias;`, 'tirou-a-repeticao'));
  it('a lista lida da cópia traz o número antigo', () =>
    falha('normalizacao', 'SELECT membros.nome, inscricoes.telefone_do_conselheiro FROM inscricoes JOIN membros ON inscricoes.membro_id = membros.id;', 'telefone-pela-juncao'));

  it('o código como número não é o tipo certo', () =>
    falha('criar', TABELAS_DAS_ESPECIALIDADES.replace('codigo TEXT', 'codigo INTEGER'), 'tipos-certos'));
  it('a data como número não é o tipo certo', () =>
    falha('criar', TABELAS_DAS_ESPECIALIDADES.replace('data TEXT', 'data INTEGER'), 'tipos-certos'));
  it('sem REFERENCES, o banco aceita a conquista de ninguém', () => {
    const sem = TABELAS_DAS_ESPECIALIDADES.replace(/ REFERENCES \w+\(id\)/g, '')
      + "INSERT INTO conquistas (membro_id, especialidade_id, data) VALUES (999, 1, '2026-03-14');";
    falha('criar', sem, 'criou-conquistas');
    falha('criar', sem, 'recusou-o-orfao');
  });
  it('a recusa com um comentário antes do INSERT continua sendo a recusa', () => {
    const c = contexto('criar', REFERENCIAS.criar.replace('INSERT INTO conquistas', '-- o membro 999 não existe\nINSERT INTO conquistas'));
    expect(metasDa('criar').find(m => m.id === 'recusou-o-orfao')!.feita(c)).toBe(true);
  });
  it('desligar a chave estrangeira não vale pela recusa', () =>
    falha('criar', `PRAGMA foreign_keys = OFF;\n${REFERENCIAS.criar}`, 'recusou-o-orfao'));

  const SECRETARIA = REFERENCIAS.alterar;
  it('o UPDATE pelo nome muda as duas Anas', () => {
    const errado = SECRETARIA.replace(`WHERE id = ${ANIVERSARIANTE.id}`, "WHERE nome = 'Ana Clara Ribeiro'");
    const e = rodar('alterar', errado);
    expect(e.comandos.find(c => c.sql.startsWith('UPDATE'))!.alteradas).toBe(2);
    falha('alterar', errado, 'aniversario-da-certa');
  });
  it('o UPDATE sem WHERE muda o clube inteiro', () =>
    falha('alterar', SECRETARIA.replace(` WHERE id = ${ANIVERSARIANTE.id}`, ''), 'aniversario-da-certa'));
  it('a data escrita como na conversa não registra a conquista', () =>
    falha('alterar', SECRETARIA.split(DATA_DA_AP043).join('14/03/2026'), 'registrou-as-conquistas'));
  it('apagar o membro antes da conquista é recusado, e o resto do arquivo não roda', () => {
    const errado = SECRETARIA.replace(`DELETE FROM conquistas WHERE membro_id = ${id(QUEM_SAIU)};\n`, '');
    const e = rodar('alterar', errado);
    expect(e.erro?.mensagem).toBe('FOREIGN KEY constraint failed');
    falha('alterar', errado, 'saiu-do-clube');
  });
  it('apagar todas as conquistas para conseguir apagar o membro leva as dos outros', () =>
    falha('alterar', SECRETARIA.replace(` WHERE membro_id = ${id(QUEM_SAIU)}`, ''), 'saiu-do-clube'));
  it('apagar o membro certo levando outro junto não é tirar quem saiu', () =>
    falha('alterar', `${SECRETARIA}\nDELETE FROM membros WHERE id = ${id('Kauã Medeiros')};`, 'saiu-do-clube'));
  it('mexer na tabela de unidades derruba tudo o que vem junto', () => {
    const c = contexto('alterar', `${SECRETARIA}\nUPDATE unidades SET conselheiro = 'Tia Rute' WHERE nome = 'Falcão';`);
    expect(verdes('alterar', c)).toEqual([]);
  });

  it('o nome sem NOT NULL aceita especialidade sem nome', () =>
    falha('criar', TABELAS_DAS_ESPECIALIDADES.replace('nome TEXT NOT NULL\n);\nCREATE TABLE conquistas', 'nome TEXT\n);\nCREATE TABLE conquistas'), 'criou-especialidades'));
  it('a conquista que aponta só para o membro não está ligada à especialidade', () =>
    falha('criar', TABELAS_DAS_ESPECIALIDADES.replace('especialidade_id INTEGER NOT NULL REFERENCES especialidades(id)', 'especialidade_id INTEGER NOT NULL'), 'criou-conquistas'));
  it('a recusa por outra regra não é a da chave estrangeira', () =>
    falha('criar', `${TABELAS_DAS_ESPECIALIDADES}\nINSERT INTO conquistas (membro_id, especialidade_id) VALUES (999, 1);`, 'recusou-o-orfao'));
  it('mexer numa especialidade que já estava derruba o cadastro das novas', () =>
    falha('alterar', `${SECRETARIA}\nUPDATE especialidades SET nome = 'Internet 1' WHERE codigo = 'AP034';`, 'inseriu-especialidades'));
  it('a conquista registrada na especialidade errada não é a da AP043', () =>
    falha('alterar', SECRETARIA.replace(/, 5, '/g, ", 4, '"), 'registrou-as-conquistas'));
  it('a conquista registrada duas vezes não é uma conquista', () =>
    falha('alterar', `${SECRETARIA}\nINSERT INTO conquistas (membro_id, especialidade_id, data) VALUES (${id(QUEM_FEZ_A_AP043[0])}, 5, '${DATA_DA_AP043}');`, 'registrou-as-conquistas'));
  it('normalizar mexendo na tabela de unidades não é normalizar', () =>
    falha('normalizacao', `${REFERENCIAS.normalizacao}\nUPDATE unidades SET telefone = '(61) 90000-0000' WHERE nome = 'Águia';`, 'tirou-a-repeticao'));

  it('a referência deixou as outras conquistas onde estavam', () => {
    const e = rodar('alterar', SECRETARIA);
    expect(registros(tabelaDe(e.banco, 'conquistas'))).toHaveLength(CONQUISTAS_DE_PARTIDA.length - 1 + 2);
  });
});

describe('o diagrama errado fica vermelho onde devia', () => {
  const metaDo = (d: Diagrama, meta: string) =>
    metasDa('diagrama').find(m => m.id === meta)!.feita({ execucao: null, diagrama: d });

  it('a ligação muitos-para-muitos direta, com a data no membro', () => {
    let d = diagramaDeReferencia();
    const meio = tabelaChamada(d, 'conquistas')!.id;
    d = { ...d, tabelas: d.tabelas.filter(t => t.id !== meio), ligacoes: d.ligacoes.filter(l => l.para !== meio) };
    const membros = tabelaChamada(d, 'membros')!.id;
    d = novaColuna(d, membros);
    d = mudarColuna(d, membros, ultimaColuna(d, membros), c => ({ ...c, nome: 'data', tipo: 'DATE' }));
    d = novaLigacao(d, membros, tabelaChamada(d, 'especialidades')!.id, 'N:N');
    expect(metaDo(d, 'tabela-do-meio')).toBe(false);
    expect(metaDo(d, 'cardinalidades')).toBe(false);
    expect(metaDo(d, 'tres-relacionadas')).toBe(false);
  });

  it('a ligação ao contrário não concorda com a coluna', () => {
    let d = diagramaDeReferencia();
    const [l] = d.ligacoes.filter(x => x.para === tabelaChamada(d, 'conquistas')!.id);
    d = { ...d, ligacoes: d.ligacoes.map(x => (x.id === l.id ? { ...x, de: x.para, para: x.de } : x)) };
    expect(metaDo(d, 'cardinalidades')).toBe(false);
  });

  it('coluna estrangeira sem ligação nenhuma não diz a cardinalidade', () => {
    let d = diagramaDeReferencia();
    d = removerLigacao(d, d.ligacoes.slice(-1)[0].id);
    expect(metaDo(d, 'cardinalidades')).toBe(false);
  });

  it('a especialidade guardando o membro é a coluna no lado errado', () => {
    let d = diagramaDeReferencia();
    const esp = tabelaChamada(d, 'especialidades')!.id;
    d = novaColuna(d, esp);
    d = mudarColuna(d, esp, ultimaColuna(d, esp), c => ({ ...c, nome: 'membro_id', tipo: 'INTEGER', referencia: tabelaChamada(d, 'membros')!.id }));
    expect(metaDo(d, 'especialidades')).toBe(false);
  });

  it('acrescentar o id sem tirar a chave do nome não identifica', () => {
    let d = diagramaDeReferencia();
    d = mudarColuna(d, tabelaChamada(d, 'membros')!.id, 'm-nome', c => ({ ...c, chave: true }));
    expect(metaDo(d, 'chave-que-identifica')).toBe(false);
  });

  it('a chave composta de id e nome ainda depende do nome', () => {
    let d = diagramaDeReferencia();
    const m = tabelaChamada(d, 'membros')!;
    const ordenada = [...m.colunas.filter(c => c.nome === 'id'), ...m.colunas.filter(c => c.nome !== 'id')]
      .map(c => (c.nome === 'nome' ? { ...c, chave: true } : c));
    d = mudarTabela(d, m.id, t => ({ ...t, colunas: ordenada }));
    expect(metaDo(d, 'chave-que-identifica')).toBe(false);
  });

  it('o nome virado em número continua sendo o nome', () => {
    let d = diagramaDaSecretaria();
    d = mudarColuna(d, 'membros', 'm-nome', c => ({ ...c, tipo: 'INTEGER' }));
    expect(metaDo(d, 'chave-que-identifica')).toBe(false);
  });

  it('a data no membro também, além da do meio, é a data no lugar errado', () => {
    let d = diagramaDeReferencia();
    const membros = tabelaChamada(d, 'membros')!.id;
    d = novaColuna(d, membros);
    d = mudarColuna(d, membros, ultimaColuna(d, membros), c => ({ ...c, nome: 'data', tipo: 'DATE' }));
    expect(metaDo(d, 'tabela-do-meio')).toBe(false);
  });

  it('uma tabela solta deixa o requisito 5 de fora', () => {
    const d = mudarTabela(novaTabela(diagramaDeReferencia(), 'avulsa'), 'x', t => t);
    expect(metaDo(d, 'tres-relacionadas')).toBe(false);
  });
});
