/*
  Fecha o conjunto de lições da AP041 — e conserta um erro de processo.

  A migration 20260821230000 foi aplicada em produção quando trazia seis lições.
  Depois ela foi *editada* para incluir o módulo 3 inteiro, as duas lições
  teóricas que faltavam, o módulo da avaliação final e a troca do laboratório de
  redação. Migration aplicada não se edita: o Supabase a marca pelo nome, vê que
  já rodou e pula — as linhas acrescentadas nunca chegariam ao banco, e o
  aplicativo mostraria lições que `lessons` não conhece. Sem id de lição, o
  progresso por lição não é gravado, que é justamente o que faz a teoria e o
  laboratório deixarem de ser distinguíveis.

  Este arquivo repete o conjunto inteiro de propósito. Num banco novo ele roda
  depois da 230000 e não muda nada; no banco que já existia, é ele que traz o que
  faltou. Os dois chegam ao mesmo lugar, que é a única coisa que importa.

  Tudo por ON CONFLICT: re-executável quantas vezes for preciso.
*/

DO $$
DECLARE
  v_ap041 uuid;
  v_mod uuid;
BEGIN
  SELECT id INTO v_ap041 FROM specialties WHERE code = 'AP041';
  IF v_ap041 IS NULL THEN
    RAISE EXCEPTION 'AP041 nao encontrada — aplique antes a migration que a semeia.';
  END IF;

  -- ── Módulo 1: a história, e a redação que o requisito 1 pede ──────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.1-L1', 'A história das máquinas de calcular', 'theory',
   '{"requirementCodes":["AP041-1.1"]}', 1),
  (v_mod, 'AP041.1-L2', 'Escrevendo sobre a história dos computadores', 'lab',
   '{"requirementCodes":["AP041-1.1"],"labType":"redacao_guiada"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 2: as sete definições ──────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.2-L1', 'Hardware e Software', 'theory',
   '{"requirementCodes":["AP041-2.1","AP041-2.2"]}', 1),
  (v_mod, 'AP041.2-L2', 'Sistema operacional e drivers', 'theory',
   '{"requirementCodes":["AP041-2.3","AP041-2.4"]}', 2),
  (v_mod, 'AP041.2-L3', 'HD, SSD, RAM e ROM', 'theory',
   '{"requirementCodes":["AP041-2.5","AP041-2.6","AP041-2.7"]}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 3: a função das nove peças ─────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.3-L1', 'Levar para dentro: teclado, mouse e scanner', 'theory',
   '{"requirementCodes":["AP041-4.1","AP041-4.2","AP041-4.5"]}', 1),
  (v_mod, 'AP041.3-L2', 'Mostrar para fora: monitor e impressora', 'theory',
   '{"requirementCodes":["AP041-4.3","AP041-4.4"]}', 2),
  (v_mod, 'AP041.3-L3', 'O cérebro e as veias: CPU e cabos', 'theory',
   '{"requirementCodes":["AP041-4.6","AP041-4.7"]}', 3),
  (v_mod, 'AP041.3-L4', 'Chegar até a internet: modem e roteador', 'theory',
   '{"requirementCodes":["AP041-4.8","AP041-4.9"]}', 4)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 4: os cuidados com a máquina ───────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.4-L1', 'Cuidados que fazem o computador durar', 'theory',
   '{"requirementCodes":["AP041-3.1","AP041-3.2","AP041-3.3"]}', 1),
  (v_mod, 'AP041.4-L2', 'Cuidando do computador', 'lab',
   '{"requirementCodes":["AP041-3.1","AP041-3.2","AP041-3.3"],"labType":"computer_care"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 5: pastas e arquivos ───────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.5-L1', 'Mexendo em pastas e arquivos', 'lab',
   '{"requirementCodes":["AP041-5.1","AP041-5.2","AP041-5.3","AP041-5.4","AP041-5.5","AP041-5.6"],"labType":"file_manager"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── A avaliação final, e o módulo dela ────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap041, 'AP041.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões dos cinco requisitos.', 6)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.F-L1', 'Avaliação Final — Computação 1', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
