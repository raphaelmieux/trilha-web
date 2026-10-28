import { describe, it, expect, beforeAll } from 'vitest';
import { carregarPyodide, type PyodideDeTeste } from '../labs/pyodideDeTeste';
import { programaDoSql, escreverResultado, type ExecucaoDeSql } from '../labs/sqlite';
import { SEMENTE_DO_ACAMPAMENTO, SEMENTE_DAS_ESPECIALIDADES, SEMENTE_DO_CLUBE } from '../labs/bancoDoClube';
import { MODULOS_DE_SQL } from './sqlDoClube';
import { realcarLinhasSql } from '../labs/realce';
import type { TopicoDeVereda } from './veredas';

/*
  O resultado que a teoria da CC005 promete é o que o SQLite devolve.

  É a trava de `exemplosDePython.test.ts`, pelo motivo escrito lá: escrever de
  cabeça o resultado de uma consulta erra por pouco e com frequência — a ordem
  em que o Tucano e a Águia saem, a média com duas casas, o NULL de quem chegou
  ontem —, nada estoura, e quem confere a própria consulta contra um exemplo
  errado conclui que a dele é que está errada.

  O banco de cada exemplo é o da lição que ele ensina: os do módulo 5 rodam
  na lista do acampamento, e os do módulo 8 no banco que já tem as
  especialidades. Declarar aqui é a decisão de `exemplosDePlanilha`: o
  contexto se declara na trava, e a afirmação se lê da lição.
*/

const SEMENTE_DO_TOPICO: Record<string, string> = {
  anomalia: SEMENTE_DO_ACAMPAMENTO,
  'tirar-a-copia': SEMENTE_DO_ACAMPAMENTO,
  inserir: SEMENTE_DAS_ESPECIALIDADES,
  atualizar: SEMENTE_DAS_ESPECIALIDADES,
  remover: SEMENTE_DAS_ESPECIALIDADES,
  transacao: SEMENTE_DAS_ESPECIALIDADES,
};

let py: PyodideDeTeste;
beforeAll(async () => { py = await carregarPyodide(); }, 120000);

const topicos = (): TopicoDeVereda[] => MODULOS_DE_SQL
  .flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])))
  .filter(t => t.exemploComo === 'sql');

function oQueOBancoDiz(t: TopicoDeVereda): string {
  const e = JSON.parse(py.runPython(programaDoSql(SEMENTE_DO_TOPICO[t.id] ?? SEMENTE_DO_CLUBE, (t.exemplo ?? ''))) as string) as ExecucaoDeSql;
  if (e.erro) return `Erro na linha ${e.erro.linha}: ${e.erro.mensagem}`;
  const ultima = [...e.comandos].reverse().find(c => c.tipo === 'consulta');
  return ultima ? escreverResultado(ultima.colunas, ultima.linhas) : '';
}

describe('os exemplos de SQL da CC005', () => {
  it('há exemplos para conferir, e todos declaram o resultado', () => {
    expect(topicos().length).toBeGreaterThanOrEqual(18);
    expect(topicos().filter(t => t.exemploSaida === undefined).map(t => t.id)).toEqual([]);
  });

  it.each(topicos().map(t => [t.id, t] as const))('%s devolve o que a lição diz', (_id, t) => {
    expect(oQueOBancoDiz(t)).toBe(t.exemploSaida);
  });

  it('as sementes declaradas aqui são de tópicos que existem', () => {
    const ids = topicos().map(t => t.id);
    expect(Object.keys(SEMENTE_DO_TOPICO).filter(id => !ids.includes(id))).toEqual([]);
  });

  /* O realce sai do mesmo realce.ts do editor, e o que ele devolve vai para a
     tela como HTML: o texto do exemplo tem de chegar escapado. */
  it('o realce de SQL escapa o que pinta', () => {
    const linhas = realcarLinhasSql("SELECT '<b>' AS x; -- <script>");
    expect(linhas.join('')).not.toMatch(/<b>|<script>/);
    expect(linhas.join('')).toContain('&lt;b&gt;');
  });
});
