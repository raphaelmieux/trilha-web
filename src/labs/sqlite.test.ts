import { describe, it, expect, beforeAll } from 'vitest';
import { carregarPyodide, type PyodideDeTeste } from './pyodideDeTeste';
import {
  programaDoSql, programaQueCriaOArquivo, programaQueLeOArquivo, resultadoBate, emOrdem,
  escreverResultado, lerResultado, chavePrimaria, tabelaDe,
  type EstadoDoBanco, type ExecucaoDeSql,
} from './sqlite';

/*
  O motor do editor de SQL, rodando no Python de verdade.

  O que erra calado aqui é o corte dos comandos: um ponto e vírgula dentro de
  um texto partiria uma inserção em duas, e a segunda metade sairia como erro de
  sintaxe numa linha que a pessoa escreveu certa.
*/

let py: PyodideDeTeste;
beforeAll(async () => { py = await carregarPyodide(); }, 120000);

const SEMENTE = `
CREATE TABLE unidades (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE);
CREATE TABLE membros (id INTEGER PRIMARY KEY, nome TEXT NOT NULL,
  unidade_id INTEGER REFERENCES unidades(id));
INSERT INTO unidades VALUES (1, 'Falcão'), (2, 'Águia');
INSERT INTO membros VALUES (1, 'Ana', 1), (2, 'Bruno', 2), (3, 'Caio', 1);
`;

const rodar = (script: string) => JSON.parse(py.runPython(programaDoSql(SEMENTE, script)) as string) as ExecucaoDeSql;

describe('o motor de SQL', () => {
  it('corta os comandos onde o SQLite diz, e não em todo ponto e vírgula', () => {
    const e = rodar(`-- um comentário; com ponto e vírgula
SELECT 'a;b' AS t;
/* outro; */ SELECT nome FROM membros WHERE nome = 'Ana'
`);
    expect(e.erro).toBeNull();
    expect(e.comandos.map(c => c.linha)).toEqual([2, 3]);
    expect(e.comandos[0].linhas).toEqual([['a;b']]);
    expect(e.comandos[1].linhas).toEqual([['Ana']]);
  });

  it('o texto do comando começa no código, sem o comentário de antes', () => {
    const e = rodar('-- o enunciado\n-- em duas linhas\nSELECT 1 AS um;');
    expect(e.comandos[0].sql).toBe('SELECT 1 AS um;');
    expect(e.comandos[0].linha).toBe(3);
  });

  it('conta o que cada alteração mudou, e para no primeiro erro', () => {
    const e = rodar(`UPDATE membros SET unidade_id = 2;
SELECT nme FROM membros;
DELETE FROM membros;`);
    expect(e.comandos[0].alteradas).toBe(3);
    expect(e.erro).toEqual({ linha: 2, mensagem: 'no such column: nme' });
    expect(e.comandos).toHaveLength(2);
    expect(tabelaDe(e.banco, 'membros')!.linhas).toHaveLength(3);
  });

  it('liga a chave estrangeira, que o SQLite deixa desligada por padrão', () => {
    const e = rodar('INSERT INTO membros VALUES (4, \'Dora\', 9);');
    expect(e.erro?.mensagem).toBe('FOREIGN KEY constraint failed');
  });

  it('desfaz a transação que o arquivo deixou aberta', () => {
    const e = rodar('BEGIN; DELETE FROM membros;');
    expect(e.transacaoDesfeita).toBe(true);
    expect(tabelaDe(e.banco, 'membros')!.linhas).toHaveLength(3);
  });

  it('descreve as tabelas: chave, estrangeira e únicos', () => {
    const e = rodar('');
    const m = tabelaDe(e.banco, 'MEMBROS')!;
    expect(chavePrimaria(m)).toEqual(['id']);
    expect(m.estrangeiras).toEqual([{ coluna: 'unidade_id', tabela: 'unidades', para: 'id' }]);
    expect(tabelaDe(e.banco, 'unidades')!.unicos).toEqual([['id'], ['nome']]);
  });

  it('o arquivo só guarda o que teve commit', () => {
    py.runPython("import os\nos.makedirs('/banco-teste', exist_ok=True)");
    py.runPython(programaQueCriaOArquivo('/banco-teste/clube.db', SEMENTE));
    py.runPython(`
import sqlite3
_c = sqlite3.connect('/banco-teste/clube.db')
_c.execute("INSERT INTO unidades VALUES (3, 'Tucano')")
`);
    const antes = JSON.parse(py.runPython(programaQueLeOArquivo('/banco-teste/clube.db')) as string) as EstadoDoBanco;
    expect(tabelaDe(antes, 'unidades')!.linhas).toHaveLength(2);
    py.runPython('_c.commit()\n_c.close()\ndel _c');
    const depois = JSON.parse(py.runPython(programaQueLeOArquivo('/banco-teste/clube.db')) as string) as EstadoDoBanco;
    expect(tabelaDe(depois, 'unidades')!.linhas).toHaveLength(3);
  });

  it('não deixa nada no espaço de nomes', () => {
    rodar('SELECT 1;');
    const sobras = py.runPython("str([n for n in globals() if n.startswith('_trilha')])");
    expect(sobras).toBe('[]');
  });
});

describe('a comparação de resultados', () => {
  const cmd = (colunas: string[], linhas: (string | number | null)[][]) => ({
    linha: 1, sql: '', tipo: 'consulta' as const, colunas, linhas, cortado: false, alteradas: 0, erro: null,
  });

  it('não liga para a ordem nem para o nome das colunas', () => {
    expect(resultadoBate(cmd(['idade', 'Nome'], [[12, 'Ana'], [10, 'Bia']]),
      { linhas: [['Bia', 10], ['Ana', 12]] })).toBe(true);
  });

  it('coluna a mais não passa', () => {
    expect(resultadoBate(cmd(['id', 'nome', 'idade'], [[1, 'Ana', 12]]), { linhas: [['Ana', 12]] })).toBe(false);
  });

  it('a ordem pedida é conferida pela função', () => {
    const desce = (l: (string | number | null)[][]) => emOrdem(l, 1, -1);
    expect(resultadoBate(cmd(['n', 'i'], [['Ana', 12], ['Bia', 10]]), { linhas: [['Bia', 10], ['Ana', 12]], ordem: desce })).toBe(true);
    expect(resultadoBate(cmd(['n', 'i'], [['Bia', 10], ['Ana', 12]]), { linhas: [['Bia', 10], ['Ana', 12]], ordem: desce })).toBe(false);
  });

  it('a média arredondada vale pela média', () => {
    expect(resultadoBate(cmd(['m'], [[12.33]]), { linhas: [[37 / 3]] })).toBe(true);
    expect(resultadoBate(cmd(['m'], [[12.3]]), { linhas: [[37 / 3]] })).toBe(false);
  });

  it('o resultado escrito volta a ser lido', () => {
    const t = escreverResultado(['nome', 'media'], [['Falcão', 12.5], ['Águia', null]]);
    expect(t).toBe('nome | media\nFalcão | 12,5\nÁguia | NULL');
    expect(lerResultado(t).linhas).toEqual([['Falcão', '12,5'], ['Águia', 'NULL']]);
  });
});
