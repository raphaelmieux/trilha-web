/*
  As sete insígnias que a AP044 traz.

  Seis de laboratório — estilos, planilha avançada, banco de dados,
  apresentação, correio e configurações — e a da trilha concluída. O critério de
  cada uma mora em src/lib/insignias.ts; sem a linha aqui, a insígnia é
  simplesmente ignorada: sem erro, sem prêmio, e de fora parece que a pessoa não
  conquistou nada. src/lib/insignias.test.ts é quem cobra os dois lados.

  ── A ordem na estante ───────────────────────────────────────────────────
  `sort_order` decide a ordem da estante no perfil, e o catálogo agrupa por
  família, deixando as trilhas por último. Os laboratórios da AP043 terminaram
  em 59 e as cinco trilhas ocupam 60 a 64.

  Pôr os seis laboratórios novos no fim da fila os jogaria para depois dos
  troféus, e a estante mostraria laboratórios soltos embaixo das trilhas — a
  única costura visível numa lista que a pessoa lê de cima a baixo. Então eles
  entram em 60 a 65, e as cinco trilhas que já existiam descem seis casas. São
  UPDATEs pelo mesmo ON CONFLICT, idempotentes, e não tocam em conquista de
  ninguém: `sort_order` é ordem de exibição, e nada em user_badges aponta para
  ele.

  `ap044_complete` fica `silver`, como as três anteriores da família: são
  degraus de Computação, e o ouro está reservado para quem fecha um percurso —
  hoje a AP035, amanhã a AP045.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('lab_estilos_texto', 'Documento que se monta sozinho', 'Aplicou estilos e deixou o sumário se montar a partir deles.', 'lab', 'bronze', 60),
  ('lab_planilha_avancada', 'Planilha que responde', 'Filtrou, congelou o cabeçalho e desenhou o gráfico certo.', 'lab', 'bronze', 61),
  ('lab_banco_de_dados', 'Agenda com estrutura', 'Montou um banco de dados com vinte e cinco fichas.', 'lab', 'bronze', 62),
  ('lab_apresentacao', 'Apresentação pronta', 'Montou uma apresentação com modelo, mídia e PDF.', 'lab', 'bronze', 63),
  ('lab_correio_completo', 'Correio do clube', 'Escreveu, anexou, arquivou, respondeu e encaminhou.', 'lab', 'bronze', 64),
  ('lab_configuracoes_sistema', 'Máquina ajustada', 'Limpou o disco, escolheu os programas padrão e criou um usuário.', 'lab', 'bronze', 65),
  ('ap034_complete', 'Trilha AP034 Internet', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 66),
  ('ap035_complete', 'Trilha AP035 Internet, Avançado', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 67),
  ('ap041_complete', 'Trilha AP041 Computação 1', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'silver', 68),
  ('ap042_complete', 'Trilha AP042 Computação 2', 'Concluiu 100% da especialidade Computação 2.', 'trophy', 'silver', 69),
  ('ap043_complete', 'Trilha AP043 Computação 3', 'Concluiu 100% da especialidade Computação 3.', 'trophy', 'silver', 70),
  ('ap044_complete', 'Trilha AP044 Computação 4', 'Concluiu 100% da especialidade Computação 4.', 'trophy', 'silver', 71)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
