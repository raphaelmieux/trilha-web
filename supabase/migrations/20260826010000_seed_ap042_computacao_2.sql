/*
  Registra a especialidade AP042 — Computação 2 no banco.

  O currículo em TypeScript descreve a trilha para a tela; o banco guarda o
  progresso, e ele referencia requirements(id) e lessons(id). Sem estas linhas,
  getRequirementId devolve nulo para todo código AP042, o upsert de progresso
  não acontece e os dois laboratórios novos comemoram sem ter gravado nada — foi
  exatamente o que apareceu no primeiro teste do gerenciador de arquivos, na
  AP041.

  São 24 requisitos, os do documento oficial, na ordem dele. O documento troca as
  letras no item 6 (duas alíneas "e)", nenhuma "c)"), como a AP041 fazia no item
  5; a numeração aqui segue a ordem em que os itens aparecem.

  O requisito 1 — ter a especialidade de Computação 1 — entra na tabela como
  todos os outros, porque é oficial e o relatório entregue ao clube cita a lista
  inteira. O que ele não tem é lição: quem o cumpre é o bloqueio da trilha, e
  isso mora no currículo (`peloPreRequisito`), não aqui.

  Tudo por ON CONFLICT, re-executável quantas vezes for preciso.
*/

DO $$
DECLARE
  v_versao uuid;
  v_ap042 uuid;
  v_mod uuid;
BEGIN
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('computacao-2', 'Trilha.Web() — Computação 2', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version
  RETURNING id INTO v_versao;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_versao, 'AP042', 'Computação 2', 'basico',
          'Usar o computador para fazer as coisas: formatar um texto, escolher uma máquina, proteger da energia e resolver as tarefas do dia.', 4)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, level = EXCLUDED.level
  RETURNING id INTO v_ap042;

  -- ── Requisitos ────────────────────────────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap042, 'AP042-1.1', 'Computação 1', 'Ter a especialidade de Computação 1.', 'mixed', 1),

  (v_ap042, 'AP042-2.1', 'Netbook', 'Definir netbook.', 'theory', 2),
  (v_ap042, 'AP042-2.2', 'Notebook', 'Definir notebook.', 'theory', 3),
  (v_ap042, 'AP042-2.3', 'Microcomputador', 'Definir microcomputador.', 'theory', 4),
  (v_ap042, 'AP042-2.4', 'Tablet', 'Definir tablet.', 'theory', 5),
  (v_ap042, 'AP042-2.5', 'Smartphone', 'Definir smartphone.', 'theory', 6),
  (v_ap042, 'AP042-2.6', 'Servidor', 'Definir servidor.', 'theory', 7),

  (v_ap042, 'AP042-3.1', 'Margens, tamanho e orientação do papel', 'Ajustar as margens, o tamanho e a orientação do papel.', 'practice', 8),
  (v_ap042, 'AP042-3.2', 'Copiar e colar textos', 'Copiar e colar textos.', 'practice', 9),
  (v_ap042, 'AP042-3.3', 'Fonte e tamanho da fonte', 'Alterar a fonte e o tamanho da fonte.', 'practice', 10),
  (v_ap042, 'AP042-3.4', 'Negrito, itálico e sublinhado', 'Usar negrito, itálico e sublinhado.', 'practice', 11),
  (v_ap042, 'AP042-3.5', 'Alinhamento do texto', 'Alinhar o texto (esquerda, centralizado, direita e justificado).', 'practice', 12),
  (v_ap042, 'AP042-3.6', 'Espaçamento do parágrafo', 'Ajustar o espaçamento do parágrafo.', 'practice', 13),
  (v_ap042, 'AP042-3.7', 'Marcadores e numeração', 'Utilizar marcadores e numeração.', 'practice', 14),

  (v_ap042, 'AP042-4.1', 'Quantidade de memória', 'Saber como avaliar a quantidade de memória.', 'theory', 15),
  (v_ap042, 'AP042-4.2', 'HD ou SSD', 'Saber como avaliar o armazenamento: HD ou SSD.', 'theory', 16),
  (v_ap042, 'AP042-4.3', 'Tipo de processador', 'Saber como avaliar o tipo de processador.', 'theory', 17),
  (v_ap042, 'AP042-4.4', 'Velocidade do processador', 'Saber como avaliar a velocidade do processador.', 'theory', 18),
  (v_ap042, 'AP042-4.5', 'Tipo de monitor', 'Saber como avaliar o tipo de monitor.', 'theory', 19),

  (v_ap042, 'AP042-5.1', 'Oscilações de energia', 'Saber como proteger o computador de oscilações de energia.', 'mixed', 20),

  (v_ap042, 'AP042-6.1', 'Comprimir e descomprimir arquivos', 'Comprimir e descomprimir arquivos.', 'practice', 21),
  (v_ap042, 'AP042-6.2', 'Salvar em pdf', 'Salvar um arquivo de texto, planilha ou apresentação em pdf.', 'practice', 22),
  (v_ap042, 'AP042-6.3', 'Instalar e desinstalar um software', 'Instalar e desinstalar um software.', 'practice', 23),
  (v_ap042, 'AP042-6.4', 'Imprimir um documento', 'Imprimir um documento, sabendo utilizar corretamente a quantidade de cópias, agrupamento, qualidade da impressão, ajustar o tamanho e modo múltiplo.', 'practice', 24)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- ── Módulos ───────────────────────────────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap042, 'AP042.1', 'Cada computador tem um corpo', 'Netbook, notebook, microcomputador, tablet, smartphone e servidor — e o que muda de um para o outro.', 1),
  (v_ap042, 'AP042.2', 'Escrever é só o começo', 'As ferramentas que transformam um texto solto em documento pronto para entregar.', 2),
  (v_ap042, 'AP042.3', 'Antes de gastar o dinheiro', 'Como ler a ficha técnica de um computador e saber o que aquilo significa na prática.', 3),
  (v_ap042, 'AP042.4', 'A energia que chega pela tomada', 'Por que luz oscilando estraga computador, e o que fica entre a tomada e a máquina.', 4),
  (v_ap042, 'AP042.5', 'O que se faz com um arquivo pronto', 'Compactar, exportar em pdf, instalar um programa e imprimir do jeito certo.', 5),
  (v_ap042, 'AP042.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões de todos os requisitos.', 6)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- ── Módulo 1: os seis termos ──────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.1-L1', 'Os computadores que você carrega', 'theory',
   '{"requirementCodes":["AP042-2.1","AP042-2.2","AP042-2.4","AP042-2.5"]}', 1),
  (v_mod, 'AP042.1-L2', 'Os que ficam parados no lugar', 'theory',
   '{"requirementCodes":["AP042-2.3","AP042-2.6"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 2: a formatação, com o laboratório que a demonstra ─────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.2-L1', 'O que cada botão da barra faz', 'theory',
   '{"requirementCodes":["AP042-3.1","AP042-3.3","AP042-3.5","AP042-3.7"]}', 1),
  (v_mod, 'AP042.2-L2', 'Formatando um documento inteiro', 'lab',
   '{"requirementCodes":["AP042-3.1","AP042-3.2","AP042-3.3","AP042-3.4","AP042-3.5","AP042-3.6","AP042-3.7"],"labType":"formatacao_texto"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 3: avaliar antes de comprar ────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.3-L1', 'Memória e espaço não são a mesma coisa', 'theory',
   '{"requirementCodes":["AP042-4.1","AP042-4.2"]}', 1),
  (v_mod, 'AP042.3-L2', 'O processador e a tela', 'theory',
   '{"requirementCodes":["AP042-4.3","AP042-4.4","AP042-4.5"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 4: energia ─────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.4-L1', 'Quando a luz pisca e o computador sente', 'theory',
   '{"requirementCodes":["AP042-5.1"]}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 5: as quatro tarefas ───────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.5-L1', 'Comprimindo, exportando e imprimindo', 'lab',
   '{"requirementCodes":["AP042-6.1","AP042-6.2","AP042-6.3","AP042-6.4"],"labType":"operacoes_arquivo"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── A avaliação final ─────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap042 AND code = 'AP042.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP042.F-L1', 'Avaliação Final de Computação 2', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
