/*
  As insígnias dos dois laboratórios de imagem.

  O laboratório 'Deixando as imagens leves' se dividiu em dois: comprimir uma
  foto e desenhar as peças do site são assuntos diferentes, e na vida são dois
  programas — ninguém faz banner no mesmo lugar em que espreme foto. Cada
  metade ganhou a própria insígnia.

  ── O que acontece com a antiga ───────────────────────────────────────────
  `lab_image_lab` fica onde está, com o `sort_order` que sempre teve. Quem a
  conquistou continua com ela, e o mapa de eventos em src/lib/atividade.ts
  manda o evento antigo — `image_lab_completed` — para a metade que herdou o
  assunto, a de comprimir. Apagar a linha tiraria de alguém uma coisa que essa
  pessoa fez, e não devolveria nada em troca.

  ── Por que os números das trilhas descem de novo ─────────────────────────
  `sort_order` decide a ordem da estante no perfil, e o catálogo agrupa por
  família: os laboratórios terminavam em 56 e as trilhas ocupavam 57 a 60.
  Pôr os dois novos no fim da fila os deixaria embaixo dos troféus, que é a
  única costura visível numa lista lida de cima a baixo. Então eles entram em
  57 e 58, e as quatro trilhas descem duas casas.

  São UPDATEs pelo mesmo ON CONFLICT, idempotentes, e não tocam em conquista de
  ninguém: `sort_order` é ordem de exibição, e nada em user_badges aponta para
  ele. O critério de cada insígnia mora em src/lib/insignias.ts; sem a linha
  aqui, a insígnia é ignorada sem erro e sem prêmio.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_image_compress', 'Imagens leves', 'Espremeu uma foto até caber em 15 KB sem deixar de ser vista.', 'beaker', 'bronze', 57),
  ('lab_image_create', 'Estúdio do clube', 'Desenhou o logo, os botões e o header do site.', 'beaker', 'bronze', 58),
  ('ap034_complete', 'Trilha AP034 Internet', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 59),
  ('ap035_complete', 'Trilha AP035 Internet, Avançado', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 60),
  ('ap041_complete', 'Trilha AP041 Computação 1', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'silver', 61),
  ('ap042_complete', 'Trilha AP042 Computação 2', 'Concluiu 100% da especialidade Computação 2.', 'trophy', 'silver', 62)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
