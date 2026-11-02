/*
  A insígnia da vereda CC006 Projeto de Programa, a sexta e última da família
  Base.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc006` vira
  `vereda_cc006`. A linha na tabela continua sendo à mão, e sem ela a insígnia
  é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezoito lições para ser concluída.

  A classe sai do tamanho: nove módulos, cada um com teoria e laboratório, são
  dezoito lições — Excursionista, como a CC005. Quem compara esta linha com a
  estante é `insignias.test.ts`.

  E os nove laboratórios rendem a sua cada um, pela regra de
  `20261027160000_insignias_dos_laboratorios_de_vereda`: o nome é o título do
  laboratório, e a classe fica um patamar abaixo da vereda — Pioneiro. A
  vereda abre agora, então não há evento gravado de ninguém para conceder com
  data antiga: `evaluateBadges` concede na hora em que cada um for vencido.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cc006', 'Vereda CC006 Projeto de Programa',
   'Percorreu a vereda CC006 Projeto de Programa até o fim.',
   'route', 'excursionista', 157),
  ('lab_vereda_cc006_m1lab', 'Escrevendo a proposta do almoxarifado',
   'Concluiu o laboratório “Escrevendo a proposta do almoxarifado” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1219),
  ('lab_vereda_cc006_m2lab', 'O banco do almoxarifado',
   'Concluiu o laboratório “O banco do almoxarifado” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1220),
  ('lab_vereda_cc006_m3lab', 'O menu do almoxarifado',
   'Concluiu o laboratório “O menu do almoxarifado” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1221),
  ('lab_vereda_cc006_m4lab', 'O almoxarifado que pergunta de novo',
   'Concluiu o laboratório “O almoxarifado que pergunta de novo” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1222),
  ('lab_vereda_cc006_m5lab', 'O almoxarifado que avisa',
   'Concluiu o laboratório “O almoxarifado que avisa” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1223),
  ('lab_vereda_cc006_m6lab', 'Guardando a noite de trabalho',
   'Concluiu o laboratório “Guardando a noite de trabalho” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1224),
  ('lab_vereda_cc006_m7lab', 'Escrevendo o README do almoxarifado',
   'Concluiu o laboratório “Escrevendo o README do almoxarifado” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1225),
  ('lab_vereda_cc006_m8lab', 'Escrevendo o diário do almoxarifado',
   'Concluiu o laboratório “Escrevendo o diário do almoxarifado” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1226),
  ('lab_vereda_cc006_m9lab', 'Preparando os quinze minutos',
   'Concluiu o laboratório “Preparando os quinze minutos” da vereda CC006 Projeto de Programa.',
   'lab', 'pioneiro', 1227)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
