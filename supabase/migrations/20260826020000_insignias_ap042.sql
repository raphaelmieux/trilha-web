/*
  As três insígnias que a AP042 traz.

  Duas de laboratório — a formatação de documento e as quatro tarefas do
  requisito 6 — e a da trilha concluída. O critério de cada uma mora em
  src/lib/insignias.ts; sem a linha aqui, a insígnia é simplesmente ignorada:
  sem erro, sem prêmio, e de fora parece que a pessoa não conquistou nada.
  src/lib/insignias.test.ts é quem cobra os dois lados.

  ── Por que os números de ordem dos outros mudam junto ────────────────────
  `sort_order` decide a ordem da estante no perfil, e o catálogo agrupa por
  família: primeiros passos, lições, requisitos, módulos, sequência, constância,
  acertos, XP, horários, laboratórios e, por último, as trilhas. Os laboratórios
  terminavam em 54 e as trilhas ocupavam 55 a 57.

  Acrescentar os dois laboratórios novos no fim da fila os jogaria para depois
  das trilhas, e a estante mostraria dois laboratórios soltos embaixo dos
  troféus — a única costura visível numa lista que a pessoa lê de cima a baixo.
  Então os dois entram em 55 e 56, e as três trilhas que já existiam descem três
  casas. São UPDATEs pelo mesmo ON CONFLICT, idempotentes, e não tocam em
  conquista de ninguém: `sort_order` é ordem de exibição, e nada em user_badges
  aponta para ele.

  `ap042_complete` fica `silver`, como a `ap041_complete`: as duas são degraus da
  família Computação, e o ouro está reservado para quem fecha um percurso —
  hoje a AP035, amanhã a AP045.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_formatacao_texto', 'Documento apresentável', 'Formatou um documento inteiro, da folha às listas.', 'beaker', 'bronze', 55),
  ('lab_operacoes_arquivo', 'Tarefas do dia', 'Compactou, exportou em pdf, instalou e imprimiu.', 'beaker', 'bronze', 56),
  ('ap034_complete', 'Trilha AP034 Internet', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 57),
  ('ap035_complete', 'Trilha AP035 Internet, Avançado', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 58),
  ('ap041_complete', 'Trilha AP041 Computação 1', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'silver', 59),
  ('ap042_complete', 'Trilha AP042 Computação 2', 'Concluiu 100% da especialidade Computação 2.', 'trophy', 'silver', 60)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
