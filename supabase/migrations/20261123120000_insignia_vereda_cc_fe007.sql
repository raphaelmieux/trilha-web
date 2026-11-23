/*
  A insígnia da vereda CC-FE007 Projeto de Interface.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-fe007` vira
  `vereda_ccfe007`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezoito lições para ser concluída.

  A classe sai do tamanho: nove módulos, cada um com teoria e laboratório, são
  dezoito lições — a mesma faixa da CC-FE006. Os nove laboratórios rendem a
  sua cada um, um patamar abaixo, com o título do laboratório como nome. A
  vereda abre agora, então não há evento gravado de ninguém para conceder com
  data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccfe007', 'Vereda CC-FE007 Projeto de Interface',
   'Percorreu a vereda CC-FE007 Projeto de Interface até o fim.',
   'route', 'excursionista', 162),
  ('lab_vereda_ccfe007_m1lab', 'Escrevendo a proposta da agenda',
   'Concluiu o laboratório “Escrevendo a proposta da agenda” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1263),
  ('lab_vereda_ccfe007_m2lab', 'As três telas da agenda',
   'Concluiu o laboratório “As três telas da agenda” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1264),
  ('lab_vereda_ccfe007_m3lab', 'Os componentes da agenda',
   'Concluiu o laboratório “Os componentes da agenda” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1265),
  ('lab_vereda_ccfe007_m4lab', 'Os feriados, com o erro à vista',
   'Concluiu o laboratório “Os feriados, com o erro à vista” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1266),
  ('lab_vereda_ccfe007_m5lab', 'A agenda no celular',
   'Concluiu o laboratório “A agenda no celular” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1267),
  ('lab_vereda_ccfe007_m6lab', 'Publicando a agenda',
   'Concluiu o laboratório “Publicando a agenda” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1268),
  ('lab_vereda_ccfe007_m7lab', 'Guardando a última noite',
   'Concluiu o laboratório “Guardando a última noite” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1269),
  ('lab_vereda_ccfe007_m8lab', 'O README e as decisões da agenda',
   'Concluiu o laboratório “O README e as decisões da agenda” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1270),
  ('lab_vereda_ccfe007_m9lab', 'Preparando os quinze minutos',
   'Concluiu o laboratório “Preparando os quinze minutos” da vereda CC-FE007 Projeto de Interface.',
   'lab', 'pioneiro', 1271)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
