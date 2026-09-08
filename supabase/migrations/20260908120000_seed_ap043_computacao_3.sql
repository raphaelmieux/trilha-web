/*
  Registra a especialidade AP043 — Computação 3 no banco.

  O currículo em TypeScript descreve a trilha para a tela; o banco guarda o
  progresso, e ele referencia requirements(id) e lessons(id). Sem estas linhas,
  getRequirementId devolve nulo para todo código AP043, o upsert de progresso
  não acontece, e os três laboratórios novos comemoram sem ter gravado nada —
  foi exatamente o que apareceu no primeiro teste do gerenciador de arquivos,
  na AP041.

  São 26 requisitos, os do documento oficial
  (`public/curriculum files/AP043 Computação 3.pdf`), na ordem dele. O
  documento troca as letras no item 2 — as alíneas saem a), b), e), d), e), f),
  g), sem nenhuma c) —, como a AP041 faz no item 5 e a AP042 no item 6; a
  numeração aqui segue a ordem em que os itens aparecem.

  O requisito 1 — ter a especialidade de Computação 2 — entra na tabela como
  todos os outros, porque é oficial e o relatório entregue ao clube cita a
  lista inteira. O que ele não tem é lição: quem o cumpre é o bloqueio da
  trilha, e isso mora no currículo (`peloPreRequisito`), não aqui.

  Tudo por ON CONFLICT, re-executável quantas vezes for preciso.
*/

DO $$
DECLARE
  v_versao uuid;
  v_ap043 uuid;
  v_mod uuid;
BEGIN
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('computacao-3', 'Trilha.Web() — Computação 3', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version
  RETURNING id INTO v_versao;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_versao, 'AP043', 'Computação 3', 'intermediario',
          'Montar documentos e planilhas de verdade: tabela, imagem, cabeçalho, fórmula — e conhecer as peças, as redes e o backup por trás disso.', 5)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, level = EXCLUDED.level
  RETURNING id INTO v_ap043;

  -- ── Requisitos ────────────────────────────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap043, 'AP043-1.1', 'Computação 2', 'Ter a especialidade de Computação 2.', 'mixed', 1),

  (v_ap043, 'AP043-2.1', 'Placa mãe', 'Definir placa mãe.', 'theory', 2),
  (v_ap043, 'AP043-2.2', 'Placa de vídeo', 'Definir placa de vídeo.', 'theory', 3),
  (v_ap043, 'AP043-2.3', 'Placa de som', 'Definir placa de som.', 'theory', 4),
  (v_ap043, 'AP043-2.4', 'Porta VGA e HDMI', 'Definir porta VGA e HDMI.', 'theory', 5),
  (v_ap043, 'AP043-2.5', 'Porta USB', 'Definir porta USB.', 'theory', 6),
  (v_ap043, 'AP043-2.6', 'Fonte de alimentação', 'Definir fonte de alimentação.', 'theory', 7),
  (v_ap043, 'AP043-2.7', 'Banco de dados', 'Definir banco de dados.', 'theory', 8),

  (v_ap043, 'AP043-3.1', 'Backup', 'O que significa backup e por que é importante fazê-lo? Citar algumas formas de como se fazia backup no passado e atualmente.', 'theory', 9),

  (v_ap043, 'AP043-4.1', 'Inserir uma tabela', 'Inserir uma tabela e saber adicionar e excluir colunas e linhas, bem como formatá-las.', 'practice', 10),
  (v_ap043, 'AP043-4.2', 'Inserir uma imagem', 'Inserir uma imagem e saber ajustá-la ao texto.', 'practice', 11),
  (v_ap043, 'AP043-4.3', 'Inserir cabeçalho e rodapé', 'Inserir cabeçalho e rodapé e saber editá-los.', 'practice', 12),
  (v_ap043, 'AP043-4.4', 'Inserir numeração de páginas', 'Inserir numeração de páginas.', 'practice', 13),

  (v_ap043, 'AP043-5.1', 'Tamanho das linhas e colunas', 'Ajustar o tamanho das linhas e colunas.', 'practice', 14),
  (v_ap043, 'AP043-5.2', 'Alinhar o texto à célula', 'Alinhar o texto à célula (acima, meio, abaixo; esquerda, centralizar, direita).', 'practice', 15),
  (v_ap043, 'AP043-5.3', 'Mesclar células', 'Mesclar células e desfazer mesclagem de células.', 'practice', 16),
  (v_ap043, 'AP043-5.4', 'Inserir e excluir linhas e colunas', 'Inserir e excluir linhas e colunas.', 'practice', 17),
  (v_ap043, 'AP043-5.5', 'Layout da tabela', 'Formatar o layout da tabela (de forma automática e manual).', 'practice', 18),
  (v_ap043, 'AP043-5.6', 'Funções soma e média', 'Utilizar as funções soma e média.', 'practice', 19),

  (v_ap043, 'AP043-6.1', 'Compatibilidade de equipamentos e versões', 'O que significa compatibilidade de equipamentos e versões?', 'theory', 20),

  (v_ap043, 'AP043-7.1', 'Computadores conectados e tipos de redes', 'Como os computadores podem estar conectados num escritório ou empresa? Quais os tipos de redes existentes?', 'theory', 21),

  (v_ap043, 'AP043-8.1', 'Informações técnicas do computador', 'Consultar as informações técnicas do computador (memória, armazenamento, processador, sistema operacional, etc.).', 'practice', 22),
  (v_ap043, 'AP043-8.2', 'Detalhes de um arquivo', 'Consultar os detalhes de um arquivo.', 'practice', 23),
  (v_ap043, 'AP043-8.3', 'Itens na área de trabalho', 'Adicionar itens à área de trabalho.', 'practice', 24),
  (v_ap043, 'AP043-8.4', 'Print da tela', 'Fazer um print da tela.', 'practice', 25),
  (v_ap043, 'AP043-8.5', 'Data e hora do computador', 'Ajustar a data e a hora do computador.', 'practice', 26)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- ── Módulos ───────────────────────────────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap043, 'AP043.1', 'Por dentro da máquina', 'Placa mãe, placa de vídeo, placa de som, portas VGA, HDMI e USB, fonte de alimentação — e banco de dados, o estranho da lista.', 1),
  (v_ap043, 'AP043.2', 'A cópia que salva', 'O que é uma cópia de segurança de verdade, por que ela importa, e como se fazia antes e como se faz hoje.', 2),
  (v_ap043, 'AP043.3', 'Inserir num documento', 'Tabela, imagem, cabeçalho, rodapé e numeração de páginas num documento.', 3),
  (v_ap043, 'AP043.4', 'A planilha eletrônica', 'Endereço de célula, fórmula, intervalo, e o acabamento que vem depois: tamanho, alinhamento, mesclagem e layout.', 4),
  (v_ap043, 'AP043.5', 'Máquinas que precisam se entender', 'Compatibilidade de equipamentos e de versões, e como os computadores de um escritório se conectam.', 5),
  (v_ap043, 'AP043.6', 'Achando as respostas no sistema', 'Informações técnicas, detalhes de arquivo, atalhos na área de trabalho, print da tela e o relógio.', 6),
  (v_ap043, 'AP043.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões de todos os requisitos.', 7)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- ── Módulo 1: os sete termos ──────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.1-L1', 'As três placas', 'theory',
   '{"requirementCodes":["AP043-2.1","AP043-2.2","AP043-2.3"]}', 1),
  (v_mod, 'AP043.1-L2', 'As portas e a fonte', 'theory',
   '{"requirementCodes":["AP043-2.4","AP043-2.5","AP043-2.6"]}', 2),
  (v_mod, 'AP043.1-L3', 'Banco de dados', 'theory',
   '{"requirementCodes":["AP043-2.7"]}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 2: backup ──────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.2-L1', 'Cópia que morre junto não é backup', 'theory',
   '{"requirementCodes":["AP043-3.1"]}', 1),
  (v_mod, 'AP043.2-L2', 'Do disquete à nuvem', 'theory',
   '{"requirementCodes":["AP043-3.1"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 3: as inserções, com o laboratório que as demonstra ────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.3-L1', 'Onde ficam as coisas que se inserem', 'theory',
   '{"requirementCodes":["AP043-4.1","AP043-4.3","AP043-4.4"]}', 1),
  (v_mod, 'AP043.3-L2', 'Montando o relatório do acampamento', 'lab',
   '{"requirementCodes":["AP043-4.1","AP043-4.2","AP043-4.3","AP043-4.4"],"labType":"insercao_texto"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 4: a planilha ──────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.4-L1', 'A conta que se refaz sozinha', 'theory',
   '{"requirementCodes":["AP043-5.6"]}', 1),
  (v_mod, 'AP043.4-L2', 'Montando o orçamento do acampamento', 'lab',
   '{"requirementCodes":["AP043-5.1","AP043-5.2","AP043-5.3","AP043-5.4","AP043-5.5","AP043-5.6"],"labType":"planilha"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 5: compatibilidade e redes ─────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.5-L1', 'Compatibilidade', 'theory',
   '{"requirementCodes":["AP043-6.1"]}', 1),
  (v_mod, 'AP043.5-L2', 'Redes', 'theory',
   '{"requirementCodes":["AP043-7.1"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 6: as cinco demonstrações no sistema ───────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.6';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.6-L1', 'Onde o Windows guarda cada coisa', 'theory',
   '{"requirementCodes":["AP043-8.1","AP043-8.2","AP043-8.3"]}', 1),
  (v_mod, 'AP043.6-L2', 'Descobrindo o que a máquina do clube tem', 'lab',
   '{"requirementCodes":["AP043-8.1","AP043-8.2","AP043-8.3","AP043-8.4","AP043-8.5"],"labType":"area_de_trabalho"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── A avaliação final ─────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap043 AND code = 'AP043.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP043.F-L1', 'Avaliação Final de Computação 3', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
