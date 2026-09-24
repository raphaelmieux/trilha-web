/*
  Registra a especialidade AP045 — Computação 5 no banco.

  O currículo em TypeScript descreve a trilha para a tela; o banco guarda o
  progresso, e ele referencia requirements(id) e lessons(id). Sem estas
  linhas, getRequirementId devolve nulo para todo código AP045, o upsert de
  progresso não acontece, e a redação guiada comemora sem ter gravado nada.

  São 18 requisitos, os do documento oficial
  (`public/curriculum files/AP045 Computação 5.pdf`), na ordem dele.

  O requisito 1 — ter a especialidade de Computação 4 — entra na tabela como
  todos os outros, porque é oficial e o relatório entregue ao clube cita a
  lista inteira. O que ele não tem é lição: quem o cumpre é o bloqueio da
  trilha, e isso mora no currículo (`peloPreRequisito`), não aqui.

  Tudo por ON CONFLICT, re-executável quantas vezes for preciso.
*/

DO $$
DECLARE
  v_versao uuid;
  v_ap045 uuid;
  v_mod uuid;
BEGIN
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('computacao-5', 'Trilha.Web() — Computação 5', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version
  RETURNING id INTO v_versao;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_versao, 'AP045', 'Computação 5', 'avancado',
          'A que fecha a família Computação: quem trabalha com o computador, como a informação viaja por dentro dele, e o que ensinar para o próximo grupo.', 7)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, level = EXCLUDED.level
  RETURNING id INTO v_ap045;

  -- ── Requisitos ────────────────────────────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap045, 'AP045-1.1', 'Computação 4', 'Ter a especialidade de Computação 4.', 'mixed', 1),

  (v_ap045, 'AP045-2.1', 'A evolução da computação', 'Apresentar um relatório sobre a evolução da computação nas áreas de inteligência artificial, mundo virtual, internet e intranets de, no mínimo, 350 palavras.', 'practice', 2),

  (v_ap045, 'AP045-3.1', 'Usuário', 'Definir usuário.', 'theory', 3),
  (v_ap045, 'AP045-3.2', 'Programador', 'Definir programador.', 'theory', 4),
  (v_ap045, 'AP045-3.3', 'Analista de sistemas', 'Definir analista de sistemas.', 'theory', 5),
  (v_ap045, 'AP045-3.4', 'Help Desk', 'Definir Help Desk.', 'theory', 6),
  (v_ap045, 'AP045-3.5', 'Hacker', 'Definir Hacker.', 'theory', 7),
  (v_ap045, 'AP045-3.6', 'Hiperlink', 'Definir Hiperlink.', 'theory', 8),
  (v_ap045, 'AP045-3.7', 'World Wide Web (W3)', 'Definir World Wide Web (W3).', 'theory', 9),

  (v_ap045, 'AP045-4.1', 'Impressora matricial', 'Saber a diferença e aplicação da impressora matricial.', 'theory', 10),
  (v_ap045, 'AP045-4.2', 'Impressora laser', 'Saber a diferença e aplicação da impressora laser.', 'theory', 11),
  (v_ap045, 'AP045-4.3', 'Impressora plotter', 'Saber a diferença e aplicação da impressora plotter.', 'theory', 12),
  (v_ap045, 'AP045-4.4', 'Impressora jato de tinta', 'Saber a diferença e aplicação da impressora jato de tinta.', 'theory', 13),

  (v_ap045, 'AP045-5.1', 'Periféricos, CPU e código binário', 'Saber explicar o funcionamento de informações entre periféricos e a CPU, usando o código binário 1 e 0. Montar um diagrama.', 'mixed', 14),

  (v_ap045, 'AP045-6.1', 'O bug do milênio', 'Pesquisar em sites especializados e apresentar um relatório a respeito do que foi o bug do milênio.', 'mixed', 15),

  (v_ap045, 'AP045-7.1', 'Upgrade e update', 'O que significa upgrade e update?', 'theory', 16),

  (v_ap045, 'AP045-8.1', 'Três sistemas operacionais', 'Citar três sistemas operacionais e suas semelhanças e diferenças.', 'theory', 17),

  (v_ap045, 'AP045-9.1', 'Catfishing', 'O que é catfishing e como se proteger dele?', 'theory', 18),

  (v_ap045, 'AP045-10.1', 'Ensinar Computação 1 ou 2', 'Ensinar a especialidade de Computação 1 ou Computação 2 a um grupo de desbravadores.', 'mixed', 19)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- ── Módulos ───────────────────────────────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap045, 'AP045.1', 'Quatro décadas em quatro áreas', 'Como a inteligência artificial, o mundo virtual, a internet e a intranet mudaram — e o relatório que reúne as quatro.', 1),
  (v_ap045, 'AP045.2', 'Sete palavras que todo mundo usa errado', 'Usuário, programador, analista de sistemas, help desk, hacker, hiperlink e World Wide Web.', 2),
  (v_ap045, 'AP045.3', 'A impressora certa para cada trabalho', 'Matricial, jato de tinta, laser e plotter: o que cada uma faz bem, e onde ela é a escolha certa.', 3),
  (v_ap045, 'AP045.4', 'Como a informação circula, em 1 e 0', 'O caminho binário entre um periférico e a CPU — e o diagrama que mostra esse caminho.', 4),
  (v_ap045, 'AP045.5', 'O bug do milênio, upgrade e update', 'O problema que o mundo gastou bilhões para evitar, e as duas palavras que a maioria das pessoas troca uma pela outra.', 5),
  (v_ap045, 'AP045.6', 'O sistema que você escolhe, e o perfil que engana', 'Windows, macOS e Linux lado a lado — e os sinais que denunciam um perfil falso.', 6),
  (v_ap045, 'AP045.7', 'Ensinar o que você sabe', 'Cinco ideias simples para uma aula que gruda, na hora de ensinar Computação 1 ou 2.', 7),
  (v_ap045, 'AP045.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões de todos os requisitos.', 8)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- ── Módulo 1: o relatório sobre a evolução da computação ──────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.1-L1', 'A evolução da computação, em quatro frentes', 'theory',
   '{"requirementCodes":["AP045-2.1"]}', 1),
  (v_mod, 'AP045.1-L2', 'Escrevendo o relatório sobre a evolução da computação', 'lab',
   '{"requirementCodes":["AP045-2.1"],"labType":"redacao_guiada"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 2: os sete termos ────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.2-L1', 'Quem faz o quê, em volta de um sistema', 'theory',
   '{"requirementCodes":["AP045-3.1","AP045-3.2","AP045-3.3","AP045-3.4"]}', 1),
  (v_mod, 'AP045.2-L2', 'A rede: quem se aproveita dela, e como ela se costura', 'theory',
   '{"requirementCodes":["AP045-3.5","AP045-3.6","AP045-3.7"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 3: as quatro impressoras ─────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.3-L1', 'Quatro impressoras, quatro trabalhos diferentes', 'theory',
   '{"requirementCodes":["AP045-4.1","AP045-4.2","AP045-4.3","AP045-4.4"]}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 4: periféricos, CPU e binário ────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.4-L1', 'Do teclado à tela, em código binário', 'theory',
   '{"requirementCodes":["AP045-5.1"]}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 5: bug do milênio, upgrade e update ──────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.5-L1', 'O bug do milênio', 'theory',
   '{"requirementCodes":["AP045-6.1"]}', 1),
  (v_mod, 'AP045.5-L2', 'Upgrade e update', 'theory',
   '{"requirementCodes":["AP045-7.1"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 6: sistemas operacionais e catfishing ────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.6';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.6-L1', 'Três sistemas operacionais, o mesmo trabalho, jeitos diferentes', 'theory',
   '{"requirementCodes":["AP045-8.1"]}', 1),
  (v_mod, 'AP045.6-L2', 'Catfishing: quando o perfil não é quem diz ser', 'theory',
   '{"requirementCodes":["AP045-9.1"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 7: ensinar o que você sabe ───────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.7';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.7-L1', 'Saber a matéria e saber ensiná-la são coisas diferentes', 'theory',
   '{"requirementCodes":["AP045-10.1"]}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── A avaliação final ─────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.F-L1', 'Avaliação Final de Computação 5', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
