/*
  A insígnia da vereda CC-FE003 JavaScript, a primeira da família Front-end
  depois das duas de marcação.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-fe003` vira
  `vereda_ccfe003`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezoito lições para ser concluída.

  A classe sai do tamanho: nove módulos, cada um com teoria e laboratório, são
  dezoito lições — Excursionista, como a CC005 e a CC006. Os nove
  laboratórios rendem a sua cada um, um patamar abaixo — Pioneiro —, com o
  título do laboratório como nome. A vereda abre agora, então não há evento
  gravado de ninguém para conceder com data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccfe003', 'Vereda CC-FE003 JavaScript',
   'Percorreu a vereda CC-FE003 JavaScript até o fim.',
   'route', 'excursionista', 158),
  ('lab_vereda_ccfe003_m1lab', 'A taxa do acampamento, em JavaScript',
   'Concluiu o laboratório “A taxa do acampamento, em JavaScript” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1228),
  ('lab_vereda_ccfe003_m2lab', 'O placar que vazava',
   'Concluiu o laboratório “O placar que vazava” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1229),
  ('lab_vereda_ccfe003_m3lab', 'A classe de cada um',
   'Concluiu o laboratório “A classe de cada um” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1230),
  ('lab_vereda_ccfe003_m4lab', 'A conta da cantina',
   'Concluiu o laboratório “A conta da cantina” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1231),
  ('lab_vereda_ccfe003_m5lab', 'O caixa da gincana',
   'Concluiu o laboratório “O caixa da gincana” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1232),
  ('lab_vereda_ccfe003_m6lab', 'A unidade que se apresenta',
   'Concluiu o laboratório “A unidade que se apresenta” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1233),
  ('lab_vereda_ccfe003_m7lab', 'As inscrições chegando',
   'Concluiu o laboratório “As inscrições chegando” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1234),
  ('lab_vereda_ccfe003_m8lab', 'A lista de inscritos, no disco',
   'Concluiu o laboratório “A lista de inscritos, no disco” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1235),
  ('lab_vereda_ccfe003_m9lab', 'O ranking da gincana',
   'Concluiu o laboratório “O ranking da gincana” da vereda CC-FE003 JavaScript.',
   'lab', 'pioneiro', 1236)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
