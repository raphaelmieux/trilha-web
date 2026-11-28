/*
  A insígnia da vereda CC-MB001 Dart.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-mb001` vira
  `vereda_ccmb001`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezesseis lições para ser concluída.

  A classe sai do tamanho: oito módulos, cada um com teoria e laboratório,
  são dezesseis lições — a faixa que vai até dezoito, Excursionista. Os oito
  laboratórios rendem a sua cada um, um patamar abaixo, com o título do
  laboratório como nome. A vereda abre agora, então não há evento gravado de
  ninguém para conceder com data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccmb001', 'Vereda CC-MB001 Dart',
   'Percorreu a vereda CC-MB001 Dart até o fim.',
   'route', 'excursionista', 163),
  ('lab_vereda_ccmb001_m1lab', 'O programa que não compila',
   'Concluiu o laboratório “O programa que não compila” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1272),
  ('lab_vereda_ccmb001_m2lab', 'A ficha de inscrição',
   'Concluiu o laboratório “A ficha de inscrição” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1273),
  ('lab_vereda_ccmb001_m3lab', 'Os apelidos do terminal',
   'Concluiu o laboratório “Os apelidos do terminal” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1274),
  ('lab_vereda_ccmb001_m4lab', 'A chamada da reunião',
   'Concluiu o laboratório “A chamada da reunião” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1275),
  ('lab_vereda_ccmb001_m5lab', 'A ficha do desbravador',
   'Concluiu o laboratório “A ficha do desbravador” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1276),
  ('lab_vereda_ccmb001_m6lab', 'Os membros do clube',
   'Concluiu o laboratório “Os membros do clube” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1277),
  ('lab_vereda_ccmb001_m7lab', 'Dividir em arquivos',
   'Concluiu o laboratório “Dividir em arquivos” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1278),
  ('lab_vereda_ccmb001_m8lab', 'O controle de especialidades',
   'Concluiu o laboratório “O controle de especialidades” da vereda CC-MB001 Dart.',
   'lab', 'pioneiro', 1279)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
