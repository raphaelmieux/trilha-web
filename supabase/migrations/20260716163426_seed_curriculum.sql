/*
# Seed Curriculum Data for AP034 and AP035

1. Purpose
- Populates curriculum_versions, specialties, requirements, modules, and lessons tables with the full AP034 and AP035 curriculum structure.
- This is reference data (read-only for students), not student data.

2. Data
- 2 curriculum versions (web-foundation, web-advanced)
- 2 specialties (AP034, AP035)
- All requirements from the prompt (AP034-1.1 through AP034-8.1, AP035-2.1 through AP035-7.1)
- All modules and lessons with content as JSONB

3. Security
- Uses ON CONFLICT to be idempotent.
- No security changes — tables already have public read policies.
*/

DO $$
DECLARE
  v_foundation uuid;
  v_advanced uuid;
  v_ap034 uuid;
  v_ap035 uuid;
  v_mod uuid;
BEGIN
  -- Curriculum versions
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('web-foundation', 'Trilha.Web() — Internet (Fundamental)', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version, is_published = EXCLUDED.is_published
  RETURNING id INTO v_foundation;

  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('web-advanced', 'Trilha.Web() — Internet, Avançado', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version, is_published = EXCLUDED.is_published
  RETURNING id INTO v_advanced;

  -- Specialties
  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_foundation, 'AP034', 'Internet', 'fundamental', 'Especialidade fundamental sobre internet.', 1)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO v_ap034;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_advanced, 'AP035', 'Internet, Avançado', 'advanced', 'Especialidade avançada sobre internet.', 2)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO v_ap035;

  -- AP034 Requirements
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap034, 'AP034-1.1', 'Internet', 'Definir internet e diferenciá-la de website e WWW.', 'theory', 1),
  (v_ap034, 'AP034-1.2', 'World Wide Web ou W3', 'Explicar a WWW como serviço da internet.', 'theory', 2),
  (v_ap034, 'AP034-1.3', 'Download', 'Definir download.', 'theory', 3),
  (v_ap034, 'AP034-1.4', 'Upload', 'Definir upload.', 'theory', 4),
  (v_ap034, 'AP034-1.5', 'Website ou site', 'Definir website.', 'theory', 5),
  (v_ap034, 'AP034-1.6', 'E-mail', 'Definir e-mail.', 'theory', 6),
  (v_ap034, 'AP034-1.7', 'Vírus', 'Definir vírus e diferenciar de malware.', 'theory', 7),
  (v_ap034, 'AP034-2.1', 'Webmail, POP3 e IMAP', 'Comparar webmail, POP3 e IMAP.', 'theory', 8),
  (v_ap034, 'AP034-2.2', 'Navegador web', 'Explicar o que é um navegador.', 'theory', 9),
  (v_ap034, 'AP034-2.3', 'Streaming de mídia', 'Explicar streaming.', 'theory', 10),
  (v_ap034, 'AP034-2.4', 'Site de busca', 'Explicar site de busca.', 'theory', 11),
  (v_ap034, 'AP034-2.5', 'Antivírus', 'Explicar antivírus.', 'theory', 12),
  (v_ap034, 'AP034-3.1', 'História da Internet', 'Escrever história da internet (250-300 palavras).', 'mixed', 13),
  (v_ap034, 'AP034-4.1', 'Formas de receber ameaças', 'Identificar formas de receber ameaças.', 'theory', 14),
  (v_ap034, 'AP034-4.2', 'Atualização do antivírus', 'Explicar a importância de atualizar o antivírus.', 'theory', 15),
  (v_ap034, 'AP034-4.3', 'Compartilhamento por computador desprotegido', 'Explicar propagação.', 'theory', 16),
  (v_ap034, 'AP034-4.4', 'Prejuízos', 'Listar prejuízos causados por vírus.', 'theory', 17),
  (v_ap034, 'AP034-5.1', 'Pacto - Não revelar informações', 'Nunca revelar informações pessoais desnecessárias.', 'practice', 18),
  (v_ap034, 'AP034-5.2', 'Pacto - Pessoas online', 'Pessoas online podem não ser quem afirmam ser.', 'practice', 19),
  (v_ap034, 'AP034-5.3', 'Pacto - Encontro presencial', 'Nunca encontrar amigo virtual sem responsável.', 'practice', 20),
  (v_ap034, 'AP034-5.4', 'Pacto - Contatos suspeitos', 'Não responder a contatos suspeitos.', 'practice', 21),
  (v_ap034, 'AP034-5.5', 'Pacto - Pedir ajuda', 'Interromper e procurar ajuda ao perceber algo anormal.', 'practice', 22),
  (v_ap034, 'AP034-5.6', 'Pacto - Tempo semanal', 'Estabelecer tempo semanal de uso.', 'practice', 23),
  (v_ap034, 'AP034-5.7', 'Pacto - Sites aceitáveis', 'Definir sites aceitáveis e inaceitáveis.', 'practice', 24),
  (v_ap034, 'AP034-5.8', 'Pacto - Redes sociais', 'Selecionar no máximo duas redes sociais.', 'practice', 25),
  (v_ap034, 'AP034-5.9', 'Pacto - Limite diário', 'Definir limite diário para redes sociais.', 'practice', 26),
  (v_ap034, 'AP034-6.1', 'Navegação e pesquisa', 'Visitar sites, buscar Bíblia, download.', 'practice', 27),
  (v_ap034, 'AP034-7.1', 'E-mail', 'Enviar, receber, anexo, segurança.', 'practice', 28),
  (v_ap034, 'AP034-8.1', 'Filipenses 4:8', 'Aprender e aplicar Filipenses 4:8.', 'mixed', 29)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- AP035 Requirements
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap035, 'AP035-2.1', 'HTTP', 'Explicar HTTP e HTTPS.', 'theory', 1),
  (v_ap035, 'AP035-2.2', 'Hyperlink', 'Explicar hyperlink.', 'theory', 2),
  (v_ap035, 'AP035-2.3', 'HTML e PHP', 'Diferenciar HTML e PHP.', 'theory', 3),
  (v_ap035, 'AP035-2.4', 'Navegadores seguros e cores hexadecimais', 'HTTPS, certificados e cores hex.', 'theory', 4),
  (v_ap035, 'AP035-2.5', 'URL', 'Estrutura de URL.', 'theory', 5),
  (v_ap035, 'AP035-2.6', 'GIF e PNG', 'Diferenciar GIF e PNG.', 'theory', 6),
  (v_ap035, 'AP035-2.7', 'JPEG', 'Explicar JPEG.', 'theory', 7),
  (v_ap035, 'AP035-3.1', '<html>', 'Elemento html.', 'practice', 8),
  (v_ap035, 'AP035-3.2', '<head>', 'Elemento head.', 'practice', 9),
  (v_ap035, 'AP035-3.3', '<body>', 'Elemento body.', 'practice', 10),
  (v_ap035, 'AP035-3.4', '<b>', 'Elemento b.', 'practice', 11),
  (v_ap035, 'AP035-3.5', '<i> e <li>', 'Elementos i e li.', 'practice', 12),
  (v_ap035, 'AP035-3.6', '<a href>', 'Elemento a com href.', 'practice', 13),
  (v_ap035, 'AP035-3.7', '<p>', 'Elemento p.', 'practice', 14),
  (v_ap035, 'AP035-3.8', '<br>', 'Elemento br.', 'practice', 15),
  (v_ap035, 'AP035-3.9', '<img>', 'Elemento img com src e alt.', 'practice', 16),
  (v_ap035, 'AP035-3.10', '<hr>', 'Elemento hr.', 'practice', 17),
  (v_ap035, 'AP035-3.11', '<table>', 'Elemento table.', 'practice', 18),
  (v_ap035, 'AP035-3.12', '<tr>', 'Elemento tr.', 'practice', 19),
  (v_ap035, 'AP035-3.13', '<td>', 'Elemento td.', 'practice', 20),
  (v_ap035, 'AP035-3.14', 'Página com tabela', 'Criar página completa.', 'practice', 21),
  (v_ap035, 'AP035-4.1', 'Imagens para Web', 'JPEG, PNG, botões e header.', 'practice', 22),
  (v_ap035, 'AP035-5.1', 'Site com quatro páginas', 'Site interligado e formulário.', 'practice', 23),
  (v_ap035, 'AP035-6.1', 'Inteligência Artificial', 'Conceitos de IA.', 'theory', 24),
  (v_ap035, 'AP035-7.1', 'Produção com IA', 'Texto, imagem e logo.', 'practice', 25)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- AP034 Modules
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap034, 'AP034.1', 'Conceitos Fundamentais', 'Internet, WWW, download, upload, website, e-mail e vírus.', 1),
  (v_ap034, 'AP034.2', 'Serviços e Ferramentas', 'Webmail, POP3, IMAP, navegador, streaming, busca e antivírus.', 2),
  (v_ap034, 'AP034.3', 'História da Internet', 'Linha do tempo e produção de texto.', 3),
  (v_ap034, 'AP034.4', 'Antivírus e Ameaças', 'Formas de ameaças, atualização, propagação e prejuízos.', 4),
  (v_ap034, 'AP034.5', 'Filtros e Pacto de Uso', 'Pacto de Uso Consciente da Internet.', 5),
  (v_ap034, 'AP034.6', 'Navegação e Pesquisa', 'WebLab: simulação de navegador.', 6),
  (v_ap034, 'AP034.7', 'E-mail', 'MailLab: simulação de e-mail.', 7),
  (v_ap034, 'AP034.8', 'Filipenses 4:8', 'Aprendizado e aplicação do princípio.', 8),
  (v_ap034, 'AP034.F', 'Avaliação Final', 'Avaliação adaptativa.', 9)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- AP035 Modules
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap035, 'AP035.1', 'Conceitos Avançados', 'HTTP, hyperlinks, HTML, PHP, URLs, imagens e cores.', 1),
  (v_ap035, 'AP035.2', 'HTML — CodeLab', 'Editor de código com testes.', 2),
  (v_ap035, 'AP035.3', 'Tabela e Página Visual', 'Página com tabela e elementos.', 3),
  (v_ap035, 'AP035.4', 'Imagens para Web', 'ImageLab: otimização de imagens.', 4),
  (v_ap035, 'AP035.5', 'Site com Quatro Páginas', 'SiteLab: projeto de site.', 5),
  (v_ap035, 'AP035.6', 'Inteligência Artificial', 'Conceitos de IA.', 6),
  (v_ap035, 'AP035.7', 'Produção com IA', 'AI Lab: texto, imagem e logo.', 7),
  (v_ap035, 'AP035.F', 'Avaliação Final', 'Avaliação adaptativa avançada.', 8)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- AP034 Lessons (simplified - content stored as JSONB)
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.1-L1', 'O que é a Internet', 'theory', '{"requirementCodes":["AP034-1.1","AP034-1.2"]}', 1),
  (v_mod, 'AP034.1-L2', 'Download e Upload', 'theory', '{"requirementCodes":["AP034-1.3","AP034-1.4"]}', 2),
  (v_mod, 'AP034.1-L3', 'Website, E-mail e Vírus', 'theory', '{"requirementCodes":["AP034-1.5","AP034-1.6","AP034-1.7"]}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.2-L1', 'Webmail, POP3 e IMAP', 'theory', '{"requirementCodes":["AP034-2.1"]}', 1),
  (v_mod, 'AP034.2-L2', 'Navegador, Streaming, Busca e Antivírus', 'theory', '{"requirementCodes":["AP034-2.2","AP034-2.3","AP034-2.4","AP034-2.5"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.3-L1', 'Linha do Tempo da Internet', 'theory', '{"requirementCodes":["AP034-3.1"]}', 1),
  (v_mod, 'AP034.3-L2', 'Editor de Texto: História da Internet', 'lab', '{"requirementCodes":["AP034-3.1"],"labType":"text_editor"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.4-L1', 'Ameaças e Proteção', 'theory', '{"requirementCodes":["AP034-4.1","AP034-4.2","AP034-4.3","AP034-4.4"]}', 1),
  (v_mod, 'AP034.4-L2', 'Laboratório de Cenários de Segurança', 'lab', '{"requirementCodes":["AP034-4.1"],"labType":"pact_builder"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.5-L1', 'Construtor do Pacto', 'lab', '{"requirementCodes":["AP034-5.1","AP034-5.2","AP034-5.3","AP034-5.4","AP034-5.5","AP034-5.6","AP034-5.7","AP034-5.8","AP034-5.9"],"labType":"pact_builder"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.6';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.6-L1', 'WebLab - Navegação e Pesquisa', 'lab', '{"requirementCodes":["AP034-6.1"],"labType":"web_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.7';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.7-L1', 'MailLab - E-mail e Segurança', 'lab', '{"requirementCodes":["AP034-7.1"],"labType":"mail_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.8';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.8-L1', 'Filipenses 4:8', 'lab', '{"requirementCodes":["AP034-8.1"],"labType":"filipenses"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap034 AND code = 'AP034.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP034.F-L1', 'Avaliação Final — Internet', 'final', '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- AP035 Lessons
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.1-L1', 'HTTP, HTTPS e Hyperlinks', 'theory', '{"requirementCodes":["AP035-2.1","AP035-2.2"]}', 1),
  (v_mod, 'AP035.1-L2', 'HTML, PHP, Cliente e Servidor', 'theory', '{"requirementCodes":["AP035-2.3"]}', 2),
  (v_mod, 'AP035.1-L3', 'Navegadores Seguros e Cores Hexadecimais', 'theory', '{"requirementCodes":["AP035-2.4"]}', 3),
  (v_mod, 'AP035.1-L4', 'URL e Estrutura de Endereços', 'theory', '{"requirementCodes":["AP035-2.5"]}', 4),
  (v_mod, 'AP035.1-L5', 'Formatos de Imagem: GIF, PNG e JPEG', 'theory', '{"requirementCodes":["AP035-2.6","AP035-2.7"]}', 5)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.2-L1', 'CodeLab — Editor HTML', 'lab', '{"requirementCodes":["AP035-3.1","AP035-3.2","AP035-3.3","AP035-3.4","AP035-3.5","AP035-3.6","AP035-3.7","AP035-3.8","AP035-3.9","AP035-3.10","AP035-3.11","AP035-3.12","AP035-3.13"],"labType":"code_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.3-L1', 'Desafio: Página com Tabela', 'lab', '{"requirementCodes":["AP035-3.14"],"labType":"code_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.4-L1', 'ImageLab — Otimização de Imagens', 'lab', '{"requirementCodes":["AP035-4.1"],"labType":"image_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.5-L1', 'SiteLab — Projeto de Site', 'lab', '{"requirementCodes":["AP035-5.1"],"labType":"site_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.6';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.6-L1', 'Inteligência Artificial — Conceitos', 'theory', '{"requirementCodes":["AP035-6.1"]}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.7';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.7-L1', 'AI Lab — Produção com IA', 'lab', '{"requirementCodes":["AP035-7.1"],"labType":"ai_lab"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap035 AND code = 'AP035.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP035.F-L1', 'Avaliação Final — Internet, Avançado', 'final', '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- Default app settings
  INSERT INTO app_settings (key, value) VALUES
  ('general', '{"appName":"Trilha.Web()","certificationName":"Token.Web()"}'),
  ('ai_mode', '{"mode":"demo","note":"Modo demonstração - não produz evidência final"}')
  ON CONFLICT (key) DO NOTHING;

END $$;
