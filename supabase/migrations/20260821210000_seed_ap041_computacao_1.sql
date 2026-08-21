/*
  Registra a especialidade AP041 — Computação 1 no banco.

  O currículo em TypeScript descreve a trilha para a tela; o banco é quem guarda
  o progresso, e ele referencia requirements(id). Sem estas linhas,
  getRequirementId devolve nulo para todo código AP041, o upsert de progresso
  não acontece e o laboratório comemora sem ter gravado nada — foi exatamente o
  que apareceu no primeiro teste do gerenciador de arquivos.

  Os 26 requisitos são os do documento oficial, na ordem dele. As lições entram
  conforme forem escritas; enquanto a trilha estiver em construção, nada disso
  é acessível pelo aplicativo.
*/

DO $$
DECLARE
  v_versao uuid;
  v_ap041 uuid;
  v_mod uuid;
BEGIN
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('computacao-1', 'Trilha.Web() — Computação 1', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version
  RETURNING id INTO v_versao;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_versao, 'AP041', 'Computação 1', 'fundamental',
          'Como o computador funciona por dentro, para que serve cada peça e como cuidar dele.', 3)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO v_ap041;

  -- ── Requisitos ────────────────────────────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap041, 'AP041-1.1', 'História dos computadores', 'Pesquisar a história dos computadores e escrever um relatório de, pelo menos, 250 palavras com os resultados da pesquisa.', 'practice', 1),

  (v_ap041, 'AP041-2.1', 'Hardware', 'Definir hardware.', 'theory', 2),
  (v_ap041, 'AP041-2.2', 'Software', 'Definir software.', 'theory', 3),
  (v_ap041, 'AP041-2.3', 'Sistema operacional', 'Definir sistema operacional.', 'theory', 4),
  (v_ap041, 'AP041-2.4', 'Driver', 'Definir driver.', 'theory', 5),
  (v_ap041, 'AP041-2.5', 'Disco rígido e SSD', 'Definir disco rígido (HD) e SSD.', 'theory', 6),
  (v_ap041, 'AP041-2.6', 'Memória RAM', 'Definir memória RAM.', 'theory', 7),
  (v_ap041, 'AP041-2.7', 'Memória ROM', 'Definir memória ROM.', 'theory', 8),

  (v_ap041, 'AP041-3.1', 'Proteger da sujeira', 'Apresentar ao examinador como proteger seu computador da sujeira.', 'mixed', 9),
  (v_ap041, 'AP041-3.2', 'Manutenção preventiva', 'Apresentar ao examinador o que é manutenção preventiva do computador.', 'mixed', 10),
  (v_ap041, 'AP041-3.3', 'Ligar e desligar', 'Apresentar ao examinador como ligar e desligar corretamente um computador.', 'mixed', 11),

  (v_ap041, 'AP041-4.1', 'Teclado', 'Descrever a função do teclado.', 'theory', 12),
  (v_ap041, 'AP041-4.2', 'Mouse', 'Descrever a função do mouse.', 'theory', 13),
  (v_ap041, 'AP041-4.3', 'Monitor', 'Descrever a função do monitor.', 'theory', 14),
  (v_ap041, 'AP041-4.4', 'Impressora', 'Descrever a função da impressora.', 'theory', 15),
  (v_ap041, 'AP041-4.5', 'Scanner', 'Descrever a função do scanner.', 'theory', 16),
  (v_ap041, 'AP041-4.6', 'CPU', 'Descrever a função da CPU.', 'theory', 17),
  (v_ap041, 'AP041-4.7', 'Cabos', 'Descrever a função dos cabos.', 'theory', 18),
  (v_ap041, 'AP041-4.8', 'Modem', 'Descrever a função do modem.', 'theory', 19),
  (v_ap041, 'AP041-4.9', 'Roteador', 'Descrever a função do roteador.', 'theory', 20),

  (v_ap041, 'AP041-5.1', 'Criar e renomear pasta', 'Criar uma pasta na área de trabalho e renomeá-la.', 'practice', 21),
  (v_ap041, 'AP041-5.2', 'Copiar pasta', 'Copiar uma pasta de um local para outro.', 'practice', 22),
  (v_ap041, 'AP041-5.3', 'Mover pasta', 'Mover uma pasta de um local para outro.', 'practice', 23),
  (v_ap041, 'AP041-5.4', 'Criar atalho', 'Criar um atalho de um arquivo ou pasta.', 'practice', 24),
  (v_ap041, 'AP041-5.5', 'Excluir e esvaziar a lixeira', 'Excluir um arquivo e esvaziar a lixeira.', 'practice', 25),
  (v_ap041, 'AP041-5.6', 'Organizar arquivos', 'Organizar os arquivos em uma pasta por nome, data de modificação e tamanho.', 'practice', 26)
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- ── Módulos ───────────────────────────────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap041, 'AP041.1', 'De onde vêm os computadores', 'A história das máquinas que calculam, do ábaco ao celular no seu bolso.', 1),
  (v_ap041, 'AP041.2', 'O que está por dentro', 'Hardware, software, sistema operacional, drivers e os tipos de memória.', 2),
  (v_ap041, 'AP041.3', 'As peças e o que cada uma faz', 'Teclado, mouse, monitor, impressora, scanner, CPU, cabos, modem e roteador.', 3),
  (v_ap041, 'AP041.4', 'Cuidar da máquina', 'Sujeira, manutenção preventiva e o jeito certo de ligar e desligar.', 4),
  (v_ap041, 'AP041.5', 'Achar as coisas depois', 'Criar, copiar, mover e organizar pastas e arquivos sem se perder.', 5)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- ── Lições já escritas ────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.5-L1', 'Mexendo em pastas e arquivos', 'lab',
   '{"requirementCodes":["AP041-5.1","AP041-5.2","AP041-5.3","AP041-5.4","AP041-5.5","AP041-5.6"],"labType":"file_manager"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
