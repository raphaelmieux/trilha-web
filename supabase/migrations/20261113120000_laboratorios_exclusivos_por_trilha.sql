/*
  Cada laboratório de trilha passa a ter tipo próprio — três insígnias novas.

  A insígnia do laboratório de trilha é `lab_<tipo>`: do tipo, e não da lição.
  Dois tipos serviam a mais de uma trilha. A redação guiada montava o
  relatório da AP034, o da AP041 e o da AP045; o WebLab servia à AP034 e à
  AP044. Quem vencia o laboratório na AP041 ganhava a mesma insígnia que já
  tinha da AP034 — ou seja, nada —, e na Faixa o pin dele não teria como
  orbitar dois patches ao mesmo tempo.

  O motor continua o mesmo (`motorDoLaboratorio.ts`); o tipo da AP041, o da
  AP045 e o da AP044 é que passam a ser próprios. A AP034 fica com os dois
  tipos de antes, e com as duas insígnias de antes.

  ── De onde sai cada coluna ───────────────────────────────────────────────
  A classe é a de `classeDoLaboratorio`: um patamar abaixo da trilha.
  AP041 é básica (companheiro), AP044 é intermediária (pesquisador) e AP045 é
  avançada (pioneiro). `insignias.test.ts` compara tupla a tupla com o
  catálogo em TypeScript.

  ── Quem já venceu recebe agora, com a data de quando venceu ──────────────
  `evaluateBadges` concederia na próxima atividade de cada um, com a data de
  hoje. A segunda parte concede a partir dos eventos já gravados, com o
  primeiro de cada pessoa. A lição gravada manda; sem ela — eventos antigos —
  a trilha decide, porque cada uma dessas trilhas tem uma lição só com aquele
  motor. Na AP045 a outra entrega de texto é o relatório do bug do milênio,
  que é outro laboratório, e por isso o projeto também é conferido.

  Ninguém perde nada: quem ganhou `lab_redacao_guiada` ou `lab_web_lab`
  vencendo o laboratório na AP041, na AP044 ou na AP045 continua com ela.
  Insígnia não se tira.
*/

-- ─── 1. As linhas do catálogo ──────────────────────────────────────────────
INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_redacao_historia_dos_computadores', 'História dos computadores',
   'Escreveu sobre a história dos computadores, pesquisando etapa por etapa.',
   'lab', 'companheiro', 145),
  ('lab_redacao_evolucao_da_computacao', 'Evolução contada',
   'Montou o relatório sobre a evolução da computação, etapa por etapa.',
   'lab', 'pioneiro', 146),
  ('lab_sites_educativos', 'Cinco sites visitados',
   'Visitou cinco sites educativos e anotou o que encontrou em cada um.',
   'lab', 'pesquisador', 147)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;

-- ─── 2. Quem já venceu, recebe ─────────────────────────────────────────────
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT e.user_id, b.id, min(e.created_at),
       jsonb_build_object('evento', e.event_type, 'percurso', l.trilha, 'licao', l.licao)
FROM activity_events e
JOIN (VALUES
    ('lab_redacao_historia_dos_computadores', 'text_submitted',    'AP041', 'AP041.1-L2', NULL),
    ('lab_redacao_evolucao_da_computacao',    'text_submitted',    'AP045', 'AP045.1-L2', 'AP045'),
    ('lab_sites_educativos',                  'web_lab_completed', 'AP044', 'AP044.2-L3', NULL)
) AS l(code, evento, trilha, licao, projeto)
  ON e.event_type = l.evento
 AND (
       e.metadata->>'lessonCode' = l.licao
    OR (e.metadata->>'lessonCode' IS NULL
        AND e.metadata->>'specialtyCode' = l.trilha
        AND (l.projeto IS NULL OR COALESCE(e.metadata->>'projeto', l.projeto) = l.projeto))
     )
JOIN badges b ON b.code = l.code
GROUP BY e.user_id, b.id, e.event_type, l.trilha, l.licao
ON CONFLICT (user_id, badge_id) DO NOTHING;
