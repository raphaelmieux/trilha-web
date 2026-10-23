/*
  A insígnia da vereda CC-DG005 Diagramação e Impressão, a quinta da família
  de Design.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-dg005` vira
  `ccdg005`. A linha na tabela continua sendo à mão, e sem ela a insígnia é
  ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva catorze lições para ser concluída.

  A classe sai do tamanho: sete módulos, cada um com teoria e laboratório, são
  catorze lições — a primeira da faixa de `TAMANHO_DA_VEREDA` que é
  Excursionista. Quem compara esta linha com a estante é `insignias.test.ts`.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccdg005', 'Vereda CC-DG005 Diagramação e Impressão',
   'Percorreu a vereda CC-DG005 Diagramação e Impressão até o fim.',
   'route', 'excursionista', 154)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
