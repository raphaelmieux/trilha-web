/*
  As insígnias, todas.

  Eram oito, e dava para percorrer uma trilha inteira quase sem receber nada: o
  primeiro requisito, um módulo, três marcas de sequência, a nota máxima e uma
  por trilha concluída. Entre a primeira lição e o fim da especialidade não
  acontecia mais nada — o que é o contrário do que uma insígnia serve para fazer.

  Agora são 57, e cada uma marca algo que a plataforma já registrava e ninguém
  via: lições, requisitos, módulos, dias de estudo, acertos sem erro, XP, cada
  laboratório concluído, e até a hora em que se estudou.

  O critério de cada uma mora em src/lib/insignias.ts — aqui só ficam o nome, a
  descrição e o desenho. Os dois lados são conferidos por teste
  (src/lib/insignias.test.ts): insígnia no catálogo sem linha aqui é ignorada
  sem erro e sem prêmio, que é justamente o que não se percebe olhando a tela.

  `sort_order` segue a ordem do catálogo, que agrupa por família — primeiros
  passos, lições, requisitos, módulos, sequência, constância, acertos, trilhas,
  certificados, XP, horários e os laboratórios. É nessa ordem que a estante
  aparece no perfil.

  DO UPDATE, e não DO NOTHING: o texto das oito antigas mudou junto, e um
  ON CONFLICT DO NOTHING deixaria o banco com a redação velha para sempre.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('first_step', 'Primeiro Passo', 'Cumpriu o primeiro requisito de uma trilha.', 'footprints', 'bronze', 1),
  ('primeira_licao', 'Primeira Lição', 'Concluiu a primeira lição.', 'footprints', 'bronze', 2),
  ('primeiro_laboratorio', 'Primeiro Laboratório', 'Concluiu o primeiro laboratório.', 'beaker', 'bronze', 3),
  ('primeira_prova', 'Primeira Avaliação', 'Concluiu a primeira avaliação final.', 'star', 'bronze', 4),
  ('licoes_5', 'Cinco Lições', 'Concluiu cinco lições.', 'layers', 'bronze', 5),
  ('licoes_10', 'Dez Lições', 'Concluiu dez lições.', 'layers', 'bronze', 6),
  ('licoes_25', 'Vinte e Cinco Lições', 'Concluiu vinte e cinco lições.', 'layers', 'silver', 7),
  ('licoes_50', 'Cinquenta Lições', 'Concluiu cinquenta lições.', 'layers', 'gold', 8),
  ('requisitos_10', 'Dez Requisitos', 'Cumpriu dez requisitos oficiais.', 'footprints', 'bronze', 9),
  ('requisitos_25', 'Vinte e Cinco Requisitos', 'Cumpriu vinte e cinco requisitos oficiais.', 'footprints', 'silver', 10),
  ('requisitos_50', 'Cinquenta Requisitos', 'Cumpriu cinquenta requisitos oficiais.', 'footprints', 'silver', 11),
  ('requisitos_100', 'Cem Requisitos', 'Cumpriu cem requisitos oficiais.', 'footprints', 'gold', 12),
  ('module_complete', 'Módulo Concluído', 'Concluiu todos os requisitos de um módulo.', 'layers', 'bronze', 13),
  ('modulos_5', 'Cinco Módulos', 'Concluiu cinco módulos.', 'layers', 'silver', 14),
  ('modulos_15', 'Quinze Módulos', 'Concluiu quinze módulos.', 'layers', 'gold', 15),
  ('streak_3', 'Sequência de 3 Dias', 'Praticou a trilha 3 dias seguidos.', 'flame', 'bronze', 16),
  ('streak_7', 'Sequência de 7 Dias', 'Praticou a trilha 7 dias seguidos.', 'flame', 'silver', 17),
  ('streak_14', 'Sequência de 14 Dias', 'Praticou a trilha 14 dias seguidos.', 'flame', 'silver', 18),
  ('streak_30', 'Sequência de 30 Dias', 'Praticou a trilha 30 dias seguidos.', 'flame', 'gold', 19),
  ('dias_5', 'Cinco Dias de Estudo', 'Estudou em cinco dias diferentes.', 'calendar', 'bronze', 20),
  ('dias_15', 'Quinze Dias de Estudo', 'Estudou em quinze dias diferentes.', 'calendar', 'silver', 21),
  ('dias_30', 'Trinta Dias de Estudo', 'Estudou em trinta dias diferentes.', 'calendar', 'gold', 22),
  ('licao_perfeita', 'Lição sem Erro', 'Acertou todas as questões de uma lição.', 'star', 'bronze', 23),
  ('licoes_perfeitas_10', 'Dez Lições sem Erro', 'Acertou tudo em dez lições.', 'star', 'silver', 24),
  ('licoes_perfeitas_25', 'Vinte e Cinco Lições sem Erro', 'Acertou tudo em vinte e cinco lições.', 'star', 'gold', 25),
  ('perfect_exam', 'Nota Máxima', 'Acertou 100% em uma avaliação final.', 'star', 'gold', 26),
  ('provas_perfeitas_2', 'Duas Notas Máximas', 'Acertou 100% em duas avaliações finais.', 'star', 'gold', 27),
  ('duas_trilhas', 'Duas Trilhas', 'Concluiu duas especialidades.', 'trophy', 'silver', 28),
  ('tres_trilhas', 'Três Trilhas', 'Concluiu três especialidades.', 'trophy', 'gold', 29),
  ('cinco_trilhas', 'Cinco Trilhas', 'Concluiu cinco especialidades.', 'trophy', 'gold', 30),
  ('primeiro_token', 'Primeiro Token.Web()', 'Recebeu o primeiro certificado.', 'award', 'silver', 31),
  ('tokens_2', 'Dois Token.Web()', 'Recebeu dois certificados.', 'award', 'gold', 32),
  ('tokens_3', 'Três Token.Web()', 'Recebeu três certificados.', 'award', 'gold', 33),
  ('xp_100', 'Cem de XP', 'Somou cem pontos de experiência.', 'zap', 'bronze', 34),
  ('xp_500', 'Quinhentos de XP', 'Somou quinhentos pontos de experiência.', 'zap', 'silver', 35),
  ('xp_1000', 'Mil de XP', 'Somou mil pontos de experiência.', 'zap', 'gold', 36),
  ('coruja', 'Coruja', 'Estudou entre a meia-noite e as cinco da manhã.', 'clock', 'bronze', 37),
  ('madrugador', 'Madrugador', 'Estudou antes das sete da manhã.', 'clock', 'bronze', 38),
  ('fim_de_semana', 'Fim de Semana', 'Estudou num sábado ou domingo.', 'calendar', 'bronze', 39),
  ('semana_inteira', 'Semana Inteira', 'Estudou em todos os sete dias da semana, em algum momento.', 'calendar', 'gold', 40),
  ('lab_web_lab', 'Navegação com cuidado', 'Concluiu o laboratório de navegar e pesquisar.', 'beaker', 'bronze', 41),
  ('lab_mail_lab', 'Correio em ordem', 'Concluiu o laboratório de e-mail e golpes.', 'beaker', 'bronze', 42),
  ('lab_threat_lab', 'Caça-ameaças', 'Concluiu o laboratório de ameaças e proteção.', 'beaker', 'bronze', 43),
  ('lab_pact_builder', 'Compromisso assinado', 'Escreveu o próprio compromisso de uso da internet.', 'beaker', 'bronze', 44),
  ('lab_filipenses', 'Filtro de Filipenses', 'Concluiu o estudo de Filipenses 4:8.', 'beaker', 'bronze', 45),
  ('lab_text_editor', 'Primeiro relatório', 'Escreveu e entregou um texto de trilha.', 'beaker', 'bronze', 46),
  ('lab_redacao_guiada', 'Relatório construído', 'Montou um relatório pesquisando etapa por etapa.', 'beaker', 'bronze', 47),
  ('lab_code_lab', 'Página escrita à mão', 'Concluiu o laboratório de HTML.', 'beaker', 'bronze', 48),
  ('lab_table_challenge', 'Dados em linhas e colunas', 'Montou uma página com tabela.', 'beaker', 'bronze', 49),
  ('lab_image_lab', 'Imagens leves', 'Concluiu o laboratório de otimização de imagens.', 'beaker', 'bronze', 50),
  ('lab_site_lab', 'Site de quatro páginas', 'Montou um site completo e navegável.', 'beaker', 'bronze', 51),
  ('lab_ai_lab', 'Pedido bem feito', 'Concluiu o laboratório de produção com IA.', 'beaker', 'bronze', 52),
  ('lab_computer_care', 'Máquina cuidada', 'Concluiu o laboratório de cuidados com o computador.', 'beaker', 'bronze', 53),
  ('lab_file_manager', 'Pastas em ordem', 'Concluiu o laboratório de pastas e arquivos.', 'beaker', 'bronze', 54),
  ('ap034_complete', 'Trilha AP034 Internet', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 55),
  ('ap035_complete', 'Trilha AP035 Internet, Avançado', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 56),
  ('ap041_complete', 'Trilha AP041 Computação 1', 'Concluiu 100% da especialidade Computação 1.', 'trophy', 'silver', 57)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
