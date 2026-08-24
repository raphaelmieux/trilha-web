/*
  ATENÇÃO: esta migration foi editada depois de constar como aplicada, o que
  este repositório proíbe. A exceção está explicada aqui para não virar
  precedente.

  O bloco abaixo abria `DO $$` e fechava com `END $;` — delimitador
  inválido. O Postgres recusa o arquivo inteiro com "unterminated dollar-quoted
  string", então nenhuma linha dele jamais rodou. Ele consta como aplicado no
  histórico remoto, e `supabase db push` seleciona por versão ausente da
  tabela de histórico: nunca vai repetir.

  Em produção isso não deixou buraco. A 20260821260000_ap041_licoes_completas
  foi escrita para consertar outro problema desta mesma migration, repete o
  conjunto inteiro por ON CONFLICT e cobre um superconjunto do que está aqui.
  O que faltou entrou por lá.

  O que a edição conserta é o banco *novo*: com o delimitador quebrado, um
  `db push` num projeto recém-criado — restauração, staging, reserva — para
  neste arquivo e deixa o banco pela metade. Não existe conserto adiante para
  arquivo que não analisa: as migrations posteriores nem chegam a ser lidas.

  Corrigir um caractere não muda o estado de banco nenhum: onde já consta
  aplicada, não roda; onde não consta, o resultado é o mesmo da 260000.
  migrations.test.ts passou a reprovar esta classe de erro antes do deploy.
*/

/*
  As lições da AP041 escritas até aqui.

  A tabela lessons existe para o progresso e o histórico referenciarem uma
  lição por id; o conteúdo em si vive no currículo em TypeScript. Por isso o
  campo content guarda só o essencial para o cruzamento — quais requisitos a
  lição cobre e, quando for laboratório, qual.

  Esta migration é re-executável: cada lição atualiza a si mesma se já existir.
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

  -- Módulo 1: a história, e a redação que o requisito 1 pede
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.1-L1', 'A história das máquinas de calcular', 'theory',
   '{"requirementCodes":["AP041-1.1"]}', 1),
  (v_mod, 'AP041.1-L2', 'Escrevendo sobre a história dos computadores', 'lab',
   '{"requirementCodes":["AP041-1.1"],"labType":"redacao_guiada"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- Módulo 2: as sete definições
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.2-L1', 'Hardware e Software', 'theory',
   '{"requirementCodes":["AP041-2.1","AP041-2.2"]}', 1),
  (v_mod, 'AP041.2-L2', 'Sistema operacional e drivers', 'theory',
   '{"requirementCodes":["AP041-2.3","AP041-2.4"]}', 2),
  (v_mod, 'AP041.2-L3', 'HD, SSD, RAM e ROM', 'theory',
   '{"requirementCodes":["AP041-2.5","AP041-2.6","AP041-2.7"]}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- Módulo 3: a função das nove peças
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

  -- Módulo 4: os cuidados com a máquina
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.4-L1', 'Cuidados que fazem o computador durar', 'theory',
   '{"requirementCodes":["AP041-3.1","AP041-3.2","AP041-3.3"]}', 1),
  (v_mod, 'AP041.4-L2', 'Cuidando do computador', 'lab',
   '{"requirementCodes":["AP041-3.1","AP041-3.2","AP041-3.3"],"labType":"computer_care"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  /*
    A avaliação final, e o módulo dela.

    O seed da AP041 criou só os cinco módulos de conteúdo: naquele momento a
    prova não existia, e um módulo vazio no banco não tem serventia. Ele nasce
    aqui, junto da lição que o ocupa.
  */
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap041, 'AP041.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões dos cinco requisitos.', 6)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap041 AND code = 'AP041.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP041.F-L1', 'Avaliação Final — Computação 1', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
