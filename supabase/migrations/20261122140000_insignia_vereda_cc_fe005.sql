/*
  A insígnia da vereda CC-FE005 TypeScript.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-fe005` vira
  `vereda_ccfe005`. A linha na tabela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezesseis lições para ser concluída.

  A classe sai do tamanho: oito módulos, cada um com teoria e laboratório, são
  dezesseis lições — a mesma faixa da CC-FE003 e da CC-FE004. Os oito
  laboratórios rendem a sua cada um, um patamar abaixo, com o título do
  laboratório como nome. A vereda abre agora, então não há evento gravado de
  ninguém para conceder com data antiga.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccfe005', 'Vereda CC-FE005 TypeScript',
   'Percorreu a vereda CC-FE005 TypeScript até o fim.',
   'route', 'excursionista', 160),
  ('lab_vereda_ccfe005_m1lab', 'A inscrição que estourava',
   'Concluiu o laboratório “A inscrição que estourava” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1246),
  ('lab_vereda_ccfe005_m2lab', 'A taxa do acampamento, com tipos',
   'Concluiu o laboratório “A taxa do acampamento, com tipos” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1247),
  ('lab_vereda_ccfe005_m3lab', 'A média sem tipo repetido',
   'Concluiu o laboratório “A média sem tipo repetido” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1248),
  ('lab_vereda_ccfe005_m4lab', 'A apresentação dos membros',
   'Concluiu o laboratório “A apresentação dos membros” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1249),
  ('lab_vereda_ccfe005_m5lab', 'Os contatos da equipe',
   'Concluiu o laboratório “Os contatos da equipe” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1250),
  ('lab_vereda_ccfe005_m6lab', 'O primeiro da fila',
   'Concluiu o laboratório “O primeiro da fila” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1251),
  ('lab_vereda_ccfe005_m7lab', 'As vagas do campori',
   'Concluiu o laboratório “As vagas do campori” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1252),
  ('lab_vereda_ccfe005_m8lab', 'O ranking da gincana, em TypeScript',
   'Concluiu o laboratório “O ranking da gincana, em TypeScript” da vereda CC-FE005 TypeScript.',
   'lab', 'pioneiro', 1253)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
