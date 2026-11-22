/*
  A insígnia da vereda CC-FE004 DOM, a primeira de Front-end em que o
  JavaScript volta para a página.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-fe004` vira
  `vereda_ccfe004`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezoito lições para ser concluída.

  A classe sai do tamanho: nove módulos, cada um com teoria e laboratório, são
  dezoito lições — Excursionista, como a CC-FE003. Os nove laboratórios rendem
  a sua cada um, um patamar abaixo — Pioneiro —, com o título do laboratório
  como nome. A vereda abre agora, então não há evento gravado de ninguém para
  conceder com data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccfe004', 'Vereda CC-FE004 DOM',
   'Percorreu a vereda CC-FE004 DOM até o fim.',
   'route', 'excursionista', 159),
  ('lab_vereda_ccfe004_m1lab', 'Ligando os três arquivos do mural',
   'Concluiu o laboratório “Ligando os três arquivos do mural” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1237),
  ('lab_vereda_ccfe004_m2lab', 'Quem é quem na Unidade Ipê',
   'Concluiu o laboratório “Quem é quem na Unidade Ipê” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1238),
  ('lab_vereda_ccfe004_m3lab', 'A ficha da unidade',
   'Concluiu o laboratório “A ficha da unidade” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1239),
  ('lab_vereda_ccfe004_m4lab', 'As tarefas do acampamento',
   'Concluiu o laboratório “As tarefas do acampamento” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1240),
  ('lab_vereda_ccfe004_m5lab', 'A chamada da reunião',
   'Concluiu o laboratório “A chamada da reunião” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1241),
  ('lab_vereda_ccfe004_m6lab', 'A inscrição no campori',
   'Concluiu o laboratório “A inscrição no campori” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1242),
  ('lab_vereda_ccfe004_m7lab', 'Os feriados do ano',
   'Concluiu o laboratório “Os feriados do ano” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1243),
  ('lab_vereda_ccfe004_m8lab', 'O placar que soma errado',
   'Concluiu o laboratório “O placar que soma errado” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1244),
  ('lab_vereda_ccfe004_m9lab', 'Os estados do Brasil',
   'Concluiu o laboratório “Os estados do Brasil” da vereda CC-FE004 DOM.',
   'lab', 'pioneiro', 1245)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
