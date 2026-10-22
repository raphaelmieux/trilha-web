/*
  A insígnia da vereda CC-DG001 Fundamentos Visuais, a primeira da família de
  Design.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-dg001` vira
  `ccdg001`. A linha na tabela continua sendo à mão, e sem ela a insígnia é
  ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva dezesseis lições para ser concluída.

  A classe sai do tamanho, que é a única medida honesta de uma vereda: oito
  módulos, cada um com teoria e laboratório, são dezesseis lições, que caem na
  faixa que vai até dezoito em `TAMANHO_DA_VEREDA` — Excursionista. Quem
  compara esta linha com a estante é `insignias.test.ts`.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccdg001', 'Vereda CC-DG001 Fundamentos Visuais',
   'Percorreu a vereda CC-DG001 Fundamentos Visuais até o fim.',
   'route', 'excursionista', 150)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
