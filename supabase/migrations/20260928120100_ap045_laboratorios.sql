/*
  As três lições de laboratório que a AP045 ganhou nos requisitos 5 e 6.

  ── Por que elas existem ─────────────────────────────────────────────────
  O requisito 5 termina em "montar um diagrama", e o 6 começa em "pesquisar em
  sites especializados". A trilha abriu com os dois como lição de teoria: a
  plataforma ensinava o que pôr no diagrama e o que foi o bug do milênio, e o
  diagrama e a pesquisa ficavam para fora daqui. Só que as duas coisas são
  gestos que se fazem numa tela — ligar peças com setas, abrir um resultado de
  busca e decidir se ele serve —, e medir o gesto é o que um laboratório faz.

  - `AP045.4-L2`: o diagrama do caminho da informação, com o código binário
    escrito nas setas e uma simulação que mostra os bits andando.
  - `AP045.5-L3`: a pesquisa, num buscador com páginas especializadas,
    incompletas e não confiáveis misturadas, e fichas com a fonte presa a cada
    fato.
  - `AP045.5-L4`: o relatório, escrito a partir das fichas da lição anterior.

  ── Por que este arquivo sai antes da tela ───────────────────────────────
  A lição de laboratório grava `lesson_attempts` pela linha dela em `lessons`.
  Sem a linha, `getLessonId` devolve nulo, a conclusão não é gravada, e o
  laboratório comemora sem ter guardado nada. As linhas entram aqui, um push
  antes de o currículo em TypeScript citá-las — enquanto isso elas existem no
  banco e nenhuma tela as mostra, que é inofensivo.

  O seed da AP045 (20260924120000) já foi aplicado e não se edita: este é
  outro arquivo, idempotente como aquele.

  ── A ordem dentro do módulo 5 ───────────────────────────────────────────
  Pesquisa e relatório vêm logo depois da teoria do bug do milênio, e o
  upgrade/update passa para o fim: as três lições do requisito 6 são uma
  sequência, e intercalar um assunto no meio dela quebraria a pesquisa ao meio.
  Quem identifica a lição é o `code`, e ele não muda; só `sort_order` anda.
*/

DO $$
DECLARE
  v_ap045 uuid;
  v_mod uuid;
BEGIN
  SELECT id INTO v_ap045 FROM specialties WHERE code = 'AP045';
  IF v_ap045 IS NULL THEN
    RAISE EXCEPTION 'AP045 não está em specialties: o seed 20260924120000 precisa ter rodado antes.';
  END IF;

  -- ── Módulo 4: o diagrama ──────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.4-L2', 'Montando o diagrama do caminho da informação', 'lab',
   '{"requirementCodes":["AP045-5.1"],"labType":"diagrama_binario"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content, sort_order = EXCLUDED.sort_order;

  -- ── Módulo 5: a pesquisa e o relatório ────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap045 AND code = 'AP045.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP045.5-L3', 'Pesquisando o bug do milênio em sites especializados', 'lab',
   '{"requirementCodes":["AP045-6.1"],"labType":"pesquisa_web"}', 2),
  (v_mod, 'AP045.5-L4', 'Escrevendo o relatório sobre o bug do milênio', 'lab',
   '{"requirementCodes":["AP045-6.1"],"labType":"relatorio_de_pesquisa"}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content, sort_order = EXCLUDED.sort_order;

  UPDATE lessons SET sort_order = 4 WHERE module_id = v_mod AND code = 'AP045.5-L2';
END $$;
