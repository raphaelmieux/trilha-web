/*
  O sétimo degrau das escadas que contam conteúdo passa a ser "tudo".

  Eram números fixos — 110 lições, 45 módulos, 12 mil de XP —, e com a
  plataforma escrita as escadas fechavam em menos de um quinto do caminho:
  quem percorresse tudo passava a maior parte dele sem pin novo nessas
  famílias. Agora o topo é "todas as lições", "todos os módulos", "todo o XP",
  e só vale quando nada mais estiver anunciado (`totaisDaPlataforma.ts`):
  a Faixa fecha no fim da plataforma escrita.

  Os degraus 1 a 6 não mudam, nem de código nem de alvo.

  ── Os topos de antes ficam ───────────────────────────────────────────────
  `requisitos_192`, `licoes_110`, `modulos_45`, `laboratorios_28`,
  `semerro_90`, `tokens_40` e `xp_12000` saem das escadas e continuam no
  catálogo: quem os tem continua com eles, porque insígnia não se tira. Na
  estante e na Faixa eles aparecem como edição antiga, só para quem os tem.
  Nenhuma linha é apagada aqui.

  As linhas abaixo foram geradas do catálogo em TypeScript, e
  `insignias.test.ts` compara tupla a tupla. A concessão é a de sempre:
  `evaluateBadges`, na próxima atividade — e hoje ninguém alcança nenhuma,
  porque há trilha e vereda anunciadas.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('requisitos_todos', 'Todos os Requisitos',
   'Cumpriu todos os requisitos de todas as trilhas e veredas.',
   'footprints', 'lider', 1700),
  ('licoes_todas', 'Todas as Lições',
   'Venceu todas as lições de todas as trilhas e veredas.',
   'theory', 'lider', 1701),
  ('modulos_todos', 'Todos os Módulos',
   'Concluiu todos os módulos de todas as trilhas e veredas.',
   'layers', 'lider', 1702),
  ('laboratorios_todos', 'Todos os Laboratórios',
   'Venceu todos os laboratórios de todas as trilhas.',
   'lab', 'lider', 1703),
  ('semerro_todas', 'Todas sem Erro',
   'Acertou tudo em todas as lições que têm questão.',
   'star', 'lider', 1704),
  ('tokens_todos', 'Todos os Token.Web()',
   'Recebeu o Token.Web() de todas as trilhas, de todas as veredas e do ME006.',
   'award', 'lider', 1705),
  ('xp_todo', 'Todo o XP',
   'Somou todo o XP que a plataforma tem para dar.',
   'zap', 'lider', 1706)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
