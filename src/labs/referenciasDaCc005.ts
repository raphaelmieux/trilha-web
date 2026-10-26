/**
 * As soluções de referência dos laboratórios de SQL da CC005.
 *
 * Só as travas importam isto: a de motor, que confere que cada uma fecha a
 * lista, e a que clica, que as digita no editor. Ficam num arquivo próprio
 * para as duas digitarem o mesmo texto — duas cópias da resposta divergiriam,
 * e a trava que clica passaria a conferir uma solução que a de motor não
 * confere. Nenhuma tela importa daqui.
 */

import { ANIVERSARIANTE, DATA_DA_AP043, QUEM_FEZ_A_AP043, type LicaoDaCc005 } from './metasDaCc005';
import { QUEM_SAIU, TABELAS_DAS_ESPECIALIDADES, membro, unidadePeloNome } from './bancoDoClube';

const AGUIA = unidadePeloNome('Águia').id;
const id = (nome: string) => membro(nome).id;
export const JOIN = 'FROM membros JOIN unidades ON membros.unidade_id = unidades.id';

export const REFERENCIAS_DA_CC005: Record<Exclude<LicaoDaCc005, 'diagrama'>, string> = {
  tabelas: `SELECT * FROM unidades;
SELECT nome, idade FROM membros;
SELECT nome AS Unidade, conselheiro AS Conselheiro FROM unidades;`,
  consultas: `SELECT nome, idade FROM membros WHERE unidade_id = ${AGUIA} ORDER BY idade DESC;
SELECT nome FROM membros WHERE idade IS NULL;`,
  juncao: `SELECT membros.nome, unidades.nome ${JOIN};
SELECT membros.nome, unidades.conselheiro ${JOIN} WHERE membros.idade = 10;
SELECT membros.nome, unidades.nome FROM membros LEFT JOIN unidades ON membros.unidade_id = unidades.id;`,
  agregacao: `SELECT unidades.nome, COUNT(*) ${JOIN} GROUP BY unidades.nome;
SELECT unidades.nome, ROUND(AVG(membros.idade), 2) ${JOIN} GROUP BY unidades.nome;
SELECT unidades.nome ${JOIN} GROUP BY unidades.nome HAVING COUNT(*) > 9;`,
  normalizacao: `SELECT inscricoes.membro_id FROM inscricoes JOIN unidades ON inscricoes.unidade = unidades.nome
  WHERE inscricoes.telefone_do_conselheiro <> unidades.telefone;
ALTER TABLE inscricoes DROP COLUMN unidade;
ALTER TABLE inscricoes DROP COLUMN conselheiro;
ALTER TABLE inscricoes DROP COLUMN telefone_do_conselheiro;
SELECT membros.nome, unidades.telefone FROM inscricoes
  JOIN membros ON inscricoes.membro_id = membros.id
  JOIN unidades ON membros.unidade_id = unidades.id;`,
  criar: `${TABELAS_DAS_ESPECIALIDADES}
INSERT INTO conquistas (membro_id, especialidade_id, data) VALUES (999, 1, '2026-03-14');`,
  alterar: `INSERT INTO especialidades (codigo, nome) VALUES ('AP042', 'Computação 2'), ('AP043', 'Computação 3'), ('AP044', 'Computação 4');
INSERT INTO conquistas (membro_id, especialidade_id, data) VALUES
  (${id(QUEM_FEZ_A_AP043[0])}, 5, '${DATA_DA_AP043}'), (${id(QUEM_FEZ_A_AP043[1])}, 5, '${DATA_DA_AP043}');
UPDATE membros SET idade = 11 WHERE id = ${ANIVERSARIANTE.id};
DELETE FROM conquistas WHERE membro_id = ${id(QUEM_SAIU)};
DELETE FROM membros WHERE id = ${id(QUEM_SAIU)};`,
};

