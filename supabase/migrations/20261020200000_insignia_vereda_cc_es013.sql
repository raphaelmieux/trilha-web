/*
  A insígnia da vereda CC-ES013 Projeto de Dados.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-es013` vira
  `cces013`. A linha na tabela continua sendo à mão, e sem ela a insígnia é
  ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva vinte e duas lições para ser concluída.

  A classe sai do tamanho, que é a única medida honesta de uma vereda: onze
  módulos, cada um com teoria e laboratório, são vinte e duas lições, que caem
  na faixa que vai até vinte e cinco em `TAMANHO_DA_VEREDA` — Guia. Quem
  compara esta linha com a estante é `insignias.test.ts`.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cces013', 'Vereda CC-ES013 Projeto de Dados',
   'Percorreu a vereda CC-ES013 Projeto de Dados até o fim.',
   'route', 'guia', 149)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
