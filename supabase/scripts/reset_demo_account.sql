/*
  Restores the demonstration account (demo.completo@trilhaweb.test) to 100% on
  both trilhas.

  Run it with:
    supabase db query --linked --file supabase/scripts/reset_demo_account.sql

  Not a migration: it touches one test login's own rows and is meant to be re-run
  by hand whenever the curriculum gains requirements, which is exactly when the
  demo account stops being a useful demonstration.

  The requirement realignment split AP034's items 6 and 7 into seven separate
  requirements and renumbered AP035 to match its sheet, adding twelve items that
  had never been assessed. Progress carried over correctly for everything that
  already existed — requirement_progress references requirements(id), not the
  code — but the twelve new ones are genuinely unfinished, which is why the demo
  account came back at 29/35 and 25/31.

  This is reference data for a test login, not a student record: nothing here
  invents evidence for a real person.
*/

DO $$
DECLARE
  v_user uuid;
  v_lesson uuid;
BEGIN
  SELECT id INTO v_user FROM user_profiles WHERE email = 'demo.completo@trilhaweb.test';
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Conta de demonstração não encontrada.';
  END IF;

  -- ── Every requirement of both specialties, completed ────────────────────
  INSERT INTO requirement_progress (
    user_id, requirement_id, status, mastery_score, attempts,
    correct_count, total_questions, retention_passed, checkpoint_passed, updated_at
  )
  SELECT v_user, r.id, 'completed', 100, 1, 1, 1, true, true, now()
  FROM requirements r
  JOIN specialties s ON s.id = r.specialty_id
  WHERE s.code IN ('AP034', 'AP035')
  ON CONFLICT (user_id, requirement_id) DO UPDATE SET
    status = 'completed',
    mastery_score = 100,
    checkpoint_passed = true,
    retention_passed = true,
    updated_at = now();

  -- ── Enrolments, so the dashboard shows a finished trilha ────────────────
  INSERT INTO enrollments (user_id, specialty_id, xp, streak_days)
  SELECT v_user, s.id, 1000, 30
  FROM specialties s WHERE s.code IN ('AP034', 'AP035')
  ON CONFLICT (user_id, specialty_id) DO UPDATE SET
    xp = GREATEST(enrollments.xp, 1000),
    streak_days = GREATEST(enrollments.streak_days, 30);

  /*
    A few graded attempts.

    The report states "foram registradas N atividades avaliadas, com
    aproveitamento médio de X%", and with no attempts at all that sentence is
    omitted — so the demo account could not be used to check it. Scores are
    varied rather than all-perfect so the average is a real number.
  */
  DELETE FROM lesson_attempts WHERE user_id = v_user;
  FOR v_lesson IN
    SELECT l.id FROM lessons l
    JOIN modules m ON m.id = l.module_id
    JOIN specialties s ON s.id = m.specialty_id
    WHERE s.code IN ('AP034', 'AP035') AND l.lesson_type = 'theory'
    ORDER BY l.id
    LIMIT 12
  LOOP
    INSERT INTO lesson_attempts (user_id, lesson_id, score, total, passed, completed_at)
    VALUES (
      v_user, v_lesson,
      CASE WHEN random() < 0.6 THEN 3 ELSE 2 END, 3, true, now() - (random() * interval '20 days')
    );
  END LOOP;

  /*
    The WebLab evidence.

    Requirements 6.1 and 6.2 are demonstrations, and the report now quotes what
    the student registered for them. Without this event the demo account falls
    back to the generic wording and those sentences cannot be reviewed.
  */
  DELETE FROM activity_events
  WHERE user_id = v_user AND event_type = 'web_lab_completed';

  INSERT INTO activity_events (user_id, event_type, metadata, created_at)
  VALUES (
    v_user, 'web_lab_completed',
    jsonb_build_object(
      'checksPassed', 21, 'total', 21,
      'enderecosDePrimeira', 6, 'arquivosDePrimeira', 5,
      'visits', jsonb_build_array(
        jsonb_build_object('url', 'https://www.adventistas.org/pt/',
          'note', 'Notícias da Igreja Adventista e um menu com as áreas do site.'),
        jsonb_build_object('url', 'https://www.bibliaonline.com.br/',
          'note', 'Campo de busca de versículos e a lista dos livros da Bíblia.'),
        jsonb_build_object('url', 'https://pt.wikipedia.org/wiki/Internet',
          'note', 'Verbete sobre a Internet, com índice e histórico da rede.')
      ),
      'bibleSite', 'https://www.bibliaonline.com.br',
      'passages', jsonb_build_array(
        jsonb_build_object('reference', 'Filipenses 4:8', 'version', 'NVI',
          'text', 'Finalmente, irmãos, tudo o que for verdadeiro, tudo o que for nobre.'),
        jsonb_build_object('reference', 'João 3:16', 'version', 'NTLH',
          'text', 'Porque Deus amou o mundo tanto, que deu o seu único Filho.'),
        jsonb_build_object('reference', 'Salmos 23:1', 'version', 'ACF',
          'text', 'O Senhor é o meu pastor, nada me faltará.')
      )
    ),
    now() - interval '2 days'
  );

  -- ── Certificates, one per trilha, only if missing ───────────────────────
  INSERT INTO certifications (user_id, code, hash, signature, level, curriculum_code, curriculum_version, status)
  SELECT
    v_user,
    'TW-DEMO-' || upper(substr(md5(s.code || v_user::text), 1, 4)),
    encode(digest(s.code || v_user::text, 'sha256'), 'hex'),
    encode(digest('demo' || s.code, 'sha256'), 'hex'),
    CASE WHEN s.code = 'AP034' THEN 'fundamental' ELSE 'advanced' END,
    s.code, '1.0', 'active'
  FROM specialties s
  WHERE s.code IN ('AP034', 'AP035')
    AND NOT EXISTS (
      SELECT 1 FROM certifications c
      WHERE c.user_id = v_user AND c.curriculum_code = s.code AND c.status = 'active'
    );

  -- ── Every badge ─────────────────────────────────────────────────────────
  INSERT INTO user_badges (user_id, badge_id, awarded_at)
  SELECT v_user, b.id, now() - (random() * interval '25 days')
  FROM badges b
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END $$;
