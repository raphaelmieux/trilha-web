/*
  Os Mestrados de quem já tinha concluído as trilhas antes de eles existirem.

  Os Mestrados chegaram em `20261113130000_curiosidades_e_mestrados`, e quem
  os concede é `evaluateBadges` — que só roda quando a pessoa faz alguma
  coisa. Quem fechou as sete trilhas de Internet e de Computação antes do dia
  13 e não voltou a estudar desde então abria a Faixa e via os dois Mestrados
  e o ME006 a giz, apagados, com todas as trilhas deles concluídas e os sete
  Token.Web() emitidos. Nada estourava: a Faixa mostrava exatamente o que o
  banco dizia, e o banco não sabia.

  É o caso que `20261027160000` resolveu para os laboratórios de vereda, e a
  resposta é a mesma: concede-se aqui, a partir do que já está gravado, e com
  a data em que o Mestrado foi alcançado — e não a de hoje, que faria a Faixa
  dizer que a pessoa fechou em novembro o que fechou em agosto. Esperar a
  próxima atividade daria a data errada, e quem não volta nunca receberia.

  ── O critério é o de `evaluateBadges` ────────────────────────────────────
  Trilha concluída é trilha com **todos** os requisitos em `completed` em
  `requirement_progress` — a mesma conta que o aplicativo faz. A data dela é
  a do Token.Web() que a conclusão emitiu, quando há um; senão, a do último
  requisito vencido. A do Mestrado é a da trilha que o fechou: a última da
  família, ou a sétima do ME006.

  ── Só as famílias que alguém pode fechar ─────────────────────────────────
  Internet e Computação têm todas as trilhas abertas; Programação, Web Design
  e Artes e Habilidades Manuais ainda estão anunciadas, e nenhuma trilha
  anunciada tem requisito vencido. Os Mestrados de vereda saem de eventos, e
  não de requisitos — ficam para `evaluateBadges`, que já os lê. As listas
  abaixo são as de `mestrados.ts`, e `mestrados.test.ts` compara as duas.

  Idempotente: quem já tem o Mestrado fica com o que tem, pelo
  `UNIQUE(user_id, badge_id)`.
*/

WITH mestrado (code, trilhas, minimo) AS (VALUES
  ('mestrado_internet', ARRAY['AP034', 'AP035'], 2),
  ('mestrado_computacao', ARRAY['AP041', 'AP042', 'AP043', 'AP044', 'AP045'], 5),
  ('mestrado_me006', ARRAY['AP041', 'AP042', 'AP043', 'AP044', 'AP045', 'AP049', 'AP052', 'AP034', 'AP035', 'AP063', 'AP064'], 7)
),
concluida AS (
  SELECT rp.user_id, s.code,
         coalesce(
           (SELECT min(c.issued_at) FROM certifications c
             WHERE c.user_id = rp.user_id AND c.curriculum_code = s.code),
           max(rp.updated_at)
         ) AS em
  FROM specialties s
  JOIN requirements r ON r.specialty_id = s.id
  JOIN requirement_progress rp ON rp.requirement_id = r.id AND rp.status = 'completed'
  GROUP BY rp.user_id, s.id, s.code
  HAVING count(DISTINCT r.id) = (SELECT count(*) FROM requirements r2 WHERE r2.specialty_id = s.id)
),
ordenada AS (
  SELECT m.code AS badge, m.minimo, c.user_id, c.code AS percurso, c.em,
         row_number() OVER (PARTITION BY m.code, c.user_id ORDER BY c.em, c.code) AS n
  FROM mestrado m
  JOIN concluida c ON c.code = ANY (m.trilhas)
)
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT o.user_id, b.id, o.em, jsonb_build_object('percurso', o.percurso)
FROM ordenada o
JOIN badges b ON b.code = o.badge
WHERE o.n = o.minimo
ON CONFLICT (user_id, badge_id) DO NOTHING;
