/*
  A insígnia da vereda CC-ES003 Planilhas.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: é o id da vereda com
  o prefixo, e **sem o hífen** — o código de uma insígnia é `[a-z0-9_]`, então
  `cc-es003` vira `cces003`. A linha na tabela, não — ela continua sendo à mão,
  e sem ela a insígnia é ignorada em silêncio: sem erro, sem prêmio, e de fora
  parece que a pessoa não conquistou nada.

  ── Por que ela sai no mesmo push que abre a vereda ──────────────────────
  O normal é `supabase/` antes e a tela depois. Aqui não dá: `estante.test.ts`
  cobra que toda insígnia semeada no banco tenha lugar na estante, e o lugar da
  vereda sai de `veredasAbertas()` — semear a linha com a vereda ainda
  `emConstrucao` reprova ali, e com razão.

  O que sobra de risco é a janela de alguns minutos em que o `deploy.yml`
  termina antes do `supabase.yml`, e ela não alcança ninguém: a vereda leva
  catorze lições para ser concluída, e `evaluateBadges` roda de novo na
  atividade seguinte de quem quer que seja.

  ── A classe sai do tamanho, e não de uma escolha ────────────────────────
  Vereda não tem nível — ela grava `'basico'` justamente para não reivindicar
  grau nenhum —, então o que decide é o tamanho, que é a única medida honesta
  dela. São catorze lições (sete de teoria e sete de fazer), e a faixa que vai
  até dezoito é Excursionista, por `TAMANHO_DA_VEREDA` em
  `src/lib/insignias.ts` — uma acima da CC-ES002, que tem doze. Escrever outra
  classe aqui não estoura nada: a tela lê a do banco, e `insignias.test.ts`
  compara as duas justamente porque elas já divergiram em silêncio por meses.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cces003', 'Vereda CC-ES003 Planilhas',
   'Percorreu a vereda CC-ES003 Planilhas até o fim.',
   'route', 'excursionista', 136)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
