/*
  O pin do laboratório de trilha para quem o concluiu e ficou sem ele.

  A insígnia `lab_<tipo>` sai do evento que conclui o laboratório, e os
  laboratórios gravam o requisito antes de gravar o evento. A avaliação que o
  requisito dispara rodava com o evento ainda fora do banco: o laboratório
  ficava concluído, o requisito verde, e o pin a giz na Faixa até a pessoa
  fazer outra coisa — o que, para quem tinha acabado de fechar a trilha, era
  nunca. Foi a pesquisa da AP045 que mostrou.

  Daqui em diante `logActivity` avalia depois de gravar o evento. Esta
  migration alcança quem concluiu antes, a partir dos eventos já gravados e
  com a data da primeira conclusão — pela decisão dos laboratórios de vereda,
  escrita em `20261027160000`: esperar a próxima atividade daria a data de
  hoje, e quem não volta nunca receberia.

  ── Só pelo código da lição ───────────────────────────────────────────────
  O evento que conclui grava `lessonCode`, e é por ele que se acha o
  laboratório: a lição sabe a própria mecânica. A tabela abaixo é a de
  `getOpenSpecialties()`, laboratório por laboratório, e a lista de eventos é a
  de `EVENTOS_DA_OFENSIVA` sem a lição de teoria, a prova e os da vereda —
  `logActivity.test.ts` compara as duas com o código. Evento antigo sem a
  lição não entra: esses já passaram por muitas avaliações desde então.

  Idempotente: quem já tem a insígnia fica com a que tem.
*/

WITH laboratorio (licao, insignia) AS (VALUES
  ('AP034.3-L2', 'lab_redacao_guiada'),
  ('AP034.4-L2', 'lab_threat_lab'),
  ('AP034.5-L1', 'lab_pact_builder'),
  ('AP034.6-L1', 'lab_web_lab'),
  ('AP034.7-L1', 'lab_mail_lab'),
  ('AP034.8-L1', 'lab_filipenses'),
  ('AP035.2-L1', 'lab_code_lab'),
  ('AP035.3-L1', 'lab_table_challenge'),
  ('AP035.4-L1', 'lab_image_compress'),
  ('AP035.4-L2', 'lab_image_create'),
  ('AP035.5-L1', 'lab_site_lab'),
  ('AP035.7-L1', 'lab_ai_lab'),
  ('AP041.1-L2', 'lab_redacao_historia_dos_computadores'),
  ('AP041.4-L2', 'lab_computer_care'),
  ('AP041.5-L1', 'lab_file_manager'),
  ('AP042.2-L2', 'lab_formatacao_texto'),
  ('AP042.5-L1', 'lab_operacoes_arquivo'),
  ('AP043.3-L2', 'lab_insercao_texto'),
  ('AP043.4-L2', 'lab_planilha'),
  ('AP043.6-L2', 'lab_area_de_trabalho'),
  ('AP044.2-L3', 'lab_sites_educativos'),
  ('AP044.3-L2', 'lab_banco_de_dados'),
  ('AP044.4-L2', 'lab_estilos_texto'),
  ('AP044.5-L2', 'lab_planilha_avancada'),
  ('AP044.6-L2', 'lab_apresentacao'),
  ('AP044.7-L2', 'lab_correio_completo'),
  ('AP044.8-L2', 'lab_configuracoes_sistema'),
  ('AP045.1-L2', 'lab_redacao_evolucao_da_computacao'),
  ('AP045.4-L2', 'lab_diagrama_binario'),
  ('AP045.5-L3', 'lab_pesquisa_web'),
  ('AP045.5-L4', 'lab_relatorio_de_pesquisa')
),
conclusao AS (
  SELECT e.user_id, l.insignia, e.metadata->>'lessonCode' AS licao,
         e.metadata->>'specialtyCode' AS percurso, e.event_type, e.created_at,
         row_number() OVER (PARTITION BY e.user_id, l.insignia ORDER BY e.created_at) AS n
  FROM activity_events e
  JOIN laboratorio l ON l.licao = e.metadata->>'lessonCode'
  WHERE e.event_type IN (
    'agenda_concluida', 'ai_lab_completed', 'apresentacao_concluida', 'area_de_trabalho_concluida',
    'code_lab_completed', 'configuracoes_concluidas', 'correio_concluido', 'cuidados_concluido',
    'diagrama_concluido', 'estilos_concluidos', 'file_manager_completed', 'filipenses_completed',
    'formatacao_concluida', 'image_compress_completed', 'image_create_completed', 'insercao_concluida',
    'mail_lab_completed', 'operacoes_concluidas', 'pact_completed', 'pesquisa_concluida',
    'planilha_avancada_concluida', 'planilha_concluida', 'site_lab_completed', 'text_submitted',
    'threat_lab_completed', 'web_lab_completed'
  )
)
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT c.user_id, b.id, c.created_at,
       jsonb_strip_nulls(jsonb_build_object('evento', c.event_type, 'percurso', c.percurso, 'licao', c.licao))
FROM conclusao c
JOIN badges b ON b.code = c.insignia
WHERE c.n = 1
ON CONFLICT (user_id, badge_id) DO NOTHING;
