/*
  A insígnia da AP045.

  Uma linha só: a trilha não traz laboratório novo — ela reusa o
  `redacao_guiada` que a AP034 e a AP041 já semeiam, cuja insígnia
  (`lab_redacao_guiada`) já existe no catálogo. O critério da conquista mora
  em src/lib/insignias.ts (o `codigoDaInsigniaDaTrilha` nasce sozinho do
  código da trilha); sem a linha aqui, a insígnia é simplesmente ignorada: sem
  erro, sem prêmio.

  Ela entra no mesmo push que tira `emConstrucao` de `ap045.ts` — não antes: a
  migration do seed já aplicou (`supabase.yml` confirmou em `main`), e
  `fileiraDasTrilhas()`, em `lib/estante.ts`, só reserva lugar na estante para
  trilha aberta. Semear a linha um push antes reprovaria `estante.test.ts` com
  a insígnia no banco e nenhum lugar para ela — a mesma exceção que as veredas
  já documentam.

  `tier` é `lider`, porque a trilha é `avancado` — é ela que fecha a família
  Computação, e o topo da escala fica para quem fecha um percurso: como a
  AP035 e, agora, esta. `src/lib/insignias.test.ts` confere isso contra
  `classeDaTrilha('AP045')`, e não à mão.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('ap045_complete', 'Trilha AP045 Computação 5', 'Concluiu 100% da especialidade Computação 5.', 'trophy', 'lider', 141)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
