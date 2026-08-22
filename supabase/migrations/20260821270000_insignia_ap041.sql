/*
  A insígnia de quem concluir Computação 1.

  A avaliação de insígnias percorria uma lista escrita à mão — AP034 e AP035 — e
  por isso terminar a AP041 inteira não dava nada: nem a insígnia da trilha, nem
  a de módulo concluído. O código agora sai do código da trilha
  (`ap041_complete`), e a próxima especialidade entra sozinha; o que ainda
  precisa ser feito a cada trilha nova é semear a linha aqui, porque insígnia que
  não existe na tabela é simplesmente ignorada — sem erro e sem prêmio.

  `gold`, como a da AP035: são as duas trilhas que fecham um percurso próprio. A
  ordem 9 vem depois de `perfect_exam`, que hoje é a última.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('ap041_complete', 'Trilha AP041 Completa', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'gold', 9)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
