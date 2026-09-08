/*
  As quatro insígnias que a AP043 traz.

  Três de laboratório — as inserções num documento, a planilha e as cinco
  demonstrações no sistema — e a da trilha concluída. O critério de cada uma
  mora em src/lib/insignias.ts; sem a linha aqui, a insígnia é simplesmente
  ignorada: sem erro, sem prêmio, e de fora parece que a pessoa não conquistou
  nada. src/lib/insignias.test.ts é quem cobra os dois lados.

  ── A ordem na estante ───────────────────────────────────────────────────
  `sort_order` decide a ordem da estante no perfil, e o catálogo agrupa por
  família, deixando as trilhas por último. Os laboratórios da AP042 terminaram
  em 56 e as quatro trilhas ocupam 57 a 60.

  Pôr os três laboratórios novos no fim da fila os jogaria para depois dos
  troféus, e a estante mostraria laboratórios soltos embaixo das trilhas — a
  única costura visível numa lista que a pessoa lê de cima a baixo. Então eles
  entram em 57, 58 e 59, e as quatro trilhas que já existiam descem três casas.
  São UPDATEs pelo mesmo ON CONFLICT, idempotentes, e não tocam em conquista de
  ninguém: `sort_order` é ordem de exibição, e nada em user_badges aponta para
  ele.

  `ap043_complete` fica `silver`, como as duas anteriores da família: são
  degraus de Computação, e o ouro está reservado para quem fecha um percurso —
  hoje a AP035, amanhã a AP045.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_insercao_texto', 'Documento montado', 'Inseriu tabela, imagem, cabeçalho e numeração num documento.', 'lab', 'bronze', 57),
  ('lab_planilha', 'Planilha que calcula', 'Montou uma planilha com alinhamento, mesclagem e fórmulas.', 'lab', 'bronze', 58),
  ('lab_area_de_trabalho', 'Dono da máquina', 'Consultou, ajustou e capturou o que o sistema mostra.', 'lab', 'bronze', 59),
  ('ap034_complete', 'Trilha AP034 Internet', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 60),
  ('ap035_complete', 'Trilha AP035 Internet, Avançado', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 61),
  ('ap041_complete', 'Trilha AP041 Computação 1', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'silver', 62),
  ('ap042_complete', 'Trilha AP042 Computação 2', 'Concluiu 100% da especialidade Computação 2.', 'trophy', 'silver', 63),
  ('ap043_complete', 'Trilha AP043 Computação 3', 'Concluiu 100% da especialidade Computação 3.', 'trophy', 'silver', 64)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
