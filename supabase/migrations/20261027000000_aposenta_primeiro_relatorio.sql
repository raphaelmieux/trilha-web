/*
  "Primeiro relatório" sai do catálogo — depois de quem a tem receber a de hoje.

  `lab_text_editor` era a insígnia do editor de texto livre, e a única lição
  que o usava era a AP034.3-L2, a história da Internet. Essa lição passou a
  ser montada pela redação guiada, e desde então nenhuma lição do currículo
  usa o editor de texto: a insígnia ficou na estante de todo mundo como um
  lugar vazio que ninguém consegue preencher. Quem entregava o relatório
  ganhava "Relatório construído" e continuava vendo "Primeiro relatório" por
  conquistar, sem nada na tela explicando por quê.

  ── O destino é o que a plataforma já lia ────────────────────────────────
  `laboratorioDoEvento` já atribui à redação guiada toda entrega de texto da
  AP034, inclusive as antigas, sem código de lição. Quem tem a de ontem
  ganharia `lab_redacao_guiada` na próxima vez que fizesse qualquer coisa;
  esta migration só alcança quem não voltou.

  ── A ordem é a da 20260913180000 ────────────────────────────────────────
  `user_badges.badge_id` é `ON DELETE CASCADE`: apagar direto levaria junto,
  em silêncio, a conquista de quem a tinha. Então primeiro a de hoje, com o
  `awarded_at` original, e só depois o DELETE. Quem já tiver as duas não
  ganha nada — `UNIQUE(user_id, badge_id)` e o `ON CONFLICT` cuidam disso.
*/

-- ─── 1. Quem tem a de ontem passa a ter a de hoje ─────────────────────────
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT ub.user_id, novo.id, ub.awarded_at, ub.context
FROM user_badges ub
JOIN badges velho ON velho.id = ub.badge_id
JOIN badges novo ON novo.code = 'lab_redacao_guiada'
WHERE velho.code IN ('lab_text_editor')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ─── 2. E aí a linha sai ──────────────────────────────────────────────────
DELETE FROM badges WHERE code IN ('lab_text_editor');
