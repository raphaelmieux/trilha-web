/*
  A insígnia da vereda CC003 Terminal e Git.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: é o id da vereda com
  o prefixo. A linha na tabela, não — ela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio: sem erro, sem prêmio, e de fora parece que a
  pessoa não conquistou nada. `src/lib/insignias.test.ts` cobra os dois lados, e
  só passa a cobrar quando a vereda deixa de ser `emConstrucao` — semear prêmio
  por percurso que ninguém pode percorrer é prometer o que não existe.

  Fica `silver` como as outras da família Base: são degraus de um percurso, e o
  ouro está reservado para quem o fecha.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cc003', 'Vereda CC003 Terminal e Git',
   'Percorreu a vereda de Terminal e Git: andar no disco por escrito, e guardar o histórico do que se muda.',
   'trophy', 'silver', 68)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
