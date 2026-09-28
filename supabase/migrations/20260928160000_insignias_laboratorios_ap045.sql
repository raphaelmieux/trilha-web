/*
  As insígnias dos três laboratórios novos da AP045.

  O critério mora em src/lib/insignias.ts (`LABORATORIOS`): quem venceu o
  laboratório tem a insígnia. Sem a linha aqui, ela é ignorada sem erro e sem
  prêmio. Entram no mesmo push que põe os três no currículo, porque a estante
  só reserva lugar para laboratório que existe numa trilha — a mesma exceção
  de sempre.

  `tier` é `pioneiro`: laboratório de trilha avançada, um degrau abaixo da
  insígnia da trilha, que é `lider`. `insignias.test.ts` confere contra
  `classeDoLaboratorio`, e não à mão.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_diagrama_binario', 'Caminho dos bits', 'Montou o diagrama do teclado à tela, com o código binário nas setas.', 'lab', 'pioneiro', 142),
  ('lab_pesquisa_web', 'Fonte conferida', 'Pesquisou em sites especializados e fez fichas com a fonte presa.', 'lab', 'pioneiro', 143),
  ('lab_relatorio_de_pesquisa', 'Relatório com referências', 'Escreveu um relatório a partir das próprias fichas de pesquisa.', 'lab', 'pioneiro', 144)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
