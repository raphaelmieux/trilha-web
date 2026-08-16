/*
  Align the requirement list with the official specialty documents.

  1. Why

  A line-by-line comparison against the Departamento de Ministério Jovem sheets
  (AP034 Internet, AP035 Internet Avançado) found the platform's requirement list
  had drifted from them in two ways:

  a) Sub-items were collapsed. The official AP034 numbers 6.1, 6.2 and 6.3 as
     separate demonstrations — visit three sites, find three Bible passages in
     three versions, download a file — and the platform carried one requirement
     covering all three. Same for 7.1 to 7.4. A collapsed requirement cannot be
     reported on individually, so a club leader reading the competency report had
     no way to confirm each item was met.

  b) AP035 was numbered differently from the document. The table exercise was
     AP035-3.14 where the sheet calls it item 4; images were 4.1 where the sheet
     says 5.2; and so on down the list. A leader holding the PDF could not match
     what the report cited against what the document required.

  This migration renumbers AP035 to match the document exactly and splits the
  collapsed AP034 items, so every code printed on a report can be looked up in
  the official sheet.

  2. Preserving progress

  requirement_progress references requirements(id), not the code, so renaming a
  code carries a student's completion with it. Requirements that are genuinely
  new — the ones that were never assessed — are inserted empty, which is correct:
  nobody has demonstrated them yet.

  The AP035 renames form a cycle (3.14 wants 4.1's code, 4.1 wants 5.2's, and so
  on), so they run in two phases through temporary codes. A single-pass UPDATE
  would collide with the UNIQUE constraint on code.
*/

DO $$
DECLARE
  v_ap034 uuid;
  v_ap035 uuid;
BEGIN
  SELECT id INTO v_ap034 FROM specialties WHERE code = 'AP034';
  SELECT id INTO v_ap035 FROM specialties WHERE code = 'AP035';

  IF v_ap034 IS NULL OR v_ap035 IS NULL THEN
    RAISE EXCEPTION 'Especialidades AP034/AP035 não encontradas; rode o seed antes desta migração.';
  END IF;

  -- ── AP034 ──────────────────────────────────────────────────────────────
  -- Requirement 5 opens by asking how content filters protect the family,
  -- before the nine pact clauses. It was never given a code, so it was never
  -- taught or assessed.
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
    (v_ap034, 'AP034-5.0', 'Filtros de conteúdo',
     'Explicar de que forma os filtros de conteúdo podem proteger a família.', 'theory', 17)
  ON CONFLICT (code) DO NOTHING;

  -- 6.1 kept its id and therefore any progress; it narrows to the first item.
  UPDATE requirements SET
    title = 'Visitar três sites',
    description = 'Visitar três sites diferentes e registrar a primeira página de cada um.',
    type = 'practice', sort_order = 27
  WHERE code = 'AP034-6.1';

  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
    (v_ap034, 'AP034-6.2', 'Pesquisa bíblica',
     'Usar um site de busca para encontrar uma Bíblia on-line e localizar três textos bíblicos em três versões diferentes.', 'practice', 28),
    (v_ap034, 'AP034-6.3', 'Download de arquivo',
     'Fazer o download de um arquivo.', 'practice', 29)
  ON CONFLICT (code) DO NOTHING;

  UPDATE requirements SET
    title = 'Escrever e enviar um e-mail',
    description = 'Redigir e enviar uma mensagem completa, com destinatário, assunto e corpo.',
    type = 'practice', sort_order = 30
  WHERE code = 'AP034-7.1';

  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
    (v_ap034, 'AP034-7.2', 'Receber e abrir um e-mail',
     'Receber mensagens e abri-las para leitura.', 'practice', 31),
    (v_ap034, 'AP034-7.3', 'Baixar e abrir um anexo',
     'Fazer o download de um anexo recebido por e-mail e abri-lo.', 'practice', 32),
    (v_ap034, 'AP034-7.4', 'Segurança no e-mail',
     'Conhecer e aplicar princípios de segurança ao enviar, receber e abrir e-mails.', 'practice', 33)
  ON CONFLICT (code) DO NOTHING;

  -- ── AP035, phase 1: park every moving code out of the way ──────────────
  UPDATE requirements SET code = 'TMP-AP035-3.14' WHERE code = 'AP035-3.14';
  UPDATE requirements SET code = 'TMP-AP035-4.1'  WHERE code = 'AP035-4.1';
  UPDATE requirements SET code = 'TMP-AP035-5.1'  WHERE code = 'AP035-5.1';
  UPDATE requirements SET code = 'TMP-AP035-6.1'  WHERE code = 'AP035-6.1';
  UPDATE requirements SET code = 'TMP-AP035-7.1'  WHERE code = 'AP035-7.1';

  -- ── AP035, phase 2: settle on the document's numbering ─────────────────
  UPDATE requirements SET
    code = 'AP035-4.1', title = 'Tabela simples completa',
    description = 'Fazer uma tabela contendo texto, um gráfico, uma regra horizontal e um link, colorindo o texto com códigos hexadecimais e usando um título maior que o corpo do documento.',
    type = 'practice', sort_order = 21
  WHERE code = 'TMP-AP035-3.14';

  UPDATE requirements SET
    code = 'AP035-5.2', title = 'Imagens leves, botões e header',
    description = 'Criar um JPG e um GIF/PNG ambos abaixo de 15 KB e ainda visíveis, além de pelo menos cinco botões de navegação e um header para o site.',
    type = 'practice', sort_order = 23
  WHERE code = 'TMP-AP035-4.1';

  UPDATE requirements SET
    code = 'AP035-6.1', title = 'Site interligado de quatro páginas',
    description = 'Desenvolver um site de pelo menos quatro páginas, todas alcançáveis a partir da página inicial, cuja página de boas-vindas indique a razão da criação do site e traga ao menos uma imagem.',
    type = 'practice', sort_order = 24
  WHERE code = 'TMP-AP035-5.1';

  UPDATE requirements SET
    code = 'AP035-7.1', title = 'Inteligência artificial',
    description = 'Explicar o que é inteligência artificial e quais são os benefícios e os problemas do seu uso.',
    type = 'theory', sort_order = 28
  WHERE code = 'TMP-AP035-6.1';

  UPDATE requirements SET
    code = 'AP035-8.1', title = 'Texto produzido com IA',
    description = 'Produzir, com inteligência artificial, um texto sobre a importância do Clube de Desbravadores.',
    type = 'practice', sort_order = 29
  WHERE code = 'TMP-AP035-7.1';

  -- ── AP035: the items that never existed ────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
    (v_ap035, 'AP035-1.1', 'Especialidade de Internet',
     'Ter concluído a especialidade AP034 — Internet.', 'practice', 0),
    (v_ap035, 'AP035-5.1', 'Gráficos para a web',
     'Explicar o processo utilizado para que os gráficos de um site sejam baixados rapidamente.', 'theory', 22),
    (v_ap035, 'AP035-6.2', 'Página de fotos',
     'Incluir no site uma página de fotos mostrando atividades e eventos vividos pelo desbravador, sua família ou seu grupo.', 'practice', 25),
    (v_ap035, 'AP035-6.3', 'Livro de visitas ou contato',
     'Incluir no site um livro de visitas ou página de contato, para que os visitantes deixem registro ou endereço de e-mail.', 'practice', 26),
    (v_ap035, 'AP035-8.2', 'Imagem produzida com IA',
     'Produzir, com inteligência artificial, uma imagem do Clube de Desbravadores acampando.', 'practice', 30),
    (v_ap035, 'AP035-8.3', 'Logo produzido com IA',
     'Produzir, com inteligência artificial, um logo usando o nome do Clube.', 'practice', 31)
  ON CONFLICT (code) DO NOTHING;

  -- Nothing should be left parked. If anything is, the rename above missed it
  -- and failing loudly beats leaving a requirement invisible to the app.
  IF EXISTS (SELECT 1 FROM requirements WHERE code LIKE 'TMP-%') THEN
    RAISE EXCEPTION 'Códigos temporários sobraram após a renumeração do AP035.';
  END IF;

  /*
    Display order, restated for every requirement rather than patched.

    The inserts above guessed at sort_order and some guesses collided with rows
    that were already there — 4.4 and the new 5.0 both landed on 17. Deriving the
    order from the code itself removes the guessing: split "AP034-6.2" into 6 and
    2, and sort by the pair. That is exactly the order the printed document uses,
    and it stays correct however many items are added later.
  */
  UPDATE requirements r SET sort_order = ordered.position
  FROM (
    SELECT id, row_number() OVER (
      PARTITION BY specialty_id
      ORDER BY
        split_part(split_part(code, '-', 2), '.', 1)::int,
        split_part(split_part(code, '-', 2), '.', 2)::int
    ) AS position
    FROM requirements
    WHERE specialty_id IN (v_ap034, v_ap035)
  ) AS ordered
  WHERE r.id = ordered.id;
END $$;
