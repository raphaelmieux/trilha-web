/*
  A insígnia da vereda CC-FE006 React.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-fe006` vira
  `vereda_ccfe006`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezoito lições para ser concluída.

  A classe sai do tamanho: nove módulos, cada um com teoria e laboratório, são
  dezoito lições — a mesma faixa da CC-FE004. Os nove laboratórios rendem a
  sua cada um, um patamar abaixo, com o título do laboratório como nome. A
  vereda abre agora, então não há evento gravado de ninguém para conceder com
  data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccfe006', 'Vereda CC-FE006 React',
   'Percorreu a vereda CC-FE006 React até o fim.',
   'route', 'excursionista', 161),
  ('lab_vereda_ccfe006_m1lab', 'O mural, descrito',
   'Concluiu o laboratório “O mural, descrito” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1254),
  ('lab_vereda_ccfe006_m2lab', 'O cartão da unidade',
   'Concluiu o laboratório “O cartão da unidade” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1255),
  ('lab_vereda_ccfe006_m3lab', 'Os botões do placar',
   'Concluiu o laboratório “Os botões do placar” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1256),
  ('lab_vereda_ccfe006_m4lab', 'A chamada que conta',
   'Concluiu o laboratório “A chamada que conta” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1257),
  ('lab_vereda_ccfe006_m5lab', 'As tarefas do acampamento',
   'Concluiu o laboratório “As tarefas do acampamento” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1258),
  ('lab_vereda_ccfe006_m6lab', 'A inscrição no campori',
   'Concluiu o laboratório “A inscrição no campori” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1259),
  ('lab_vereda_ccfe006_m7lab', 'A chamada que se salva',
   'Concluiu o laboratório “A chamada que se salva” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1260),
  ('lab_vereda_ccfe006_m8lab', 'As telas das unidades',
   'Concluiu o laboratório “As telas das unidades” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1261),
  ('lab_vereda_ccfe006_m9lab', 'Os feriados do ano',
   'Concluiu o laboratório “Os feriados do ano” da vereda CC-FE006 React.',
   'lab', 'pioneiro', 1262)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
