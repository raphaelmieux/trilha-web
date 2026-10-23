/*
  A insígnia da vereda CC-DG003 Imagem Digital, a terceira da família de
  Design.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: `cc-dg003` vira
  `ccdg003`. A linha na tabela continua sendo à mão, e sem ela a insígnia é
  ignorada em silêncio — sem erro, sem prêmio.

  Sai no mesmo push que abre a vereda, pela exceção escrita desde a migration
  da CC-ES003: `estante.test.ts` cobra que toda insígnia semeada tenha lugar na
  estante, e o lugar da vereda sai de `veredasAbertas()`. A janela em que o
  `deploy.yml` termina antes do `supabase.yml` não alcança ninguém: a vereda
  leva vinte lições para ser concluída.

  A classe sai do tamanho: dez módulos, cada um com teoria e laboratório, são
  vinte lições — a faixa de `TAMANHO_DA_VEREDA` que vai até vinte e cinco, e
  que é Guia. Quem compara esta linha com a estante é `insignias.test.ts`.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_ccdg003', 'Vereda CC-DG003 Imagem Digital',
   'Percorreu a vereda CC-DG003 Imagem Digital até o fim.',
   'route', 'guia', 152)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
