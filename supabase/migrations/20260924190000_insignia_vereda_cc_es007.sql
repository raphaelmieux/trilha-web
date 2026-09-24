/*
  A insígnia da vereda CC-ES007 Comunicação e Agenda.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: é o id da vereda com
  o prefixo, e **sem o hífen** — o código de uma insígnia é `[a-z0-9_]`, então
  `cc-es007` vira `cces007`. A linha na tabela, não — ela continua sendo à mão,
  e sem ela a insígnia é ignorada em silêncio: sem erro, sem prêmio, e de fora
  parece que a pessoa não conquistou nada.

  ── Por que ela sai no mesmo push que abre a vereda ──────────────────────
  O normal é `supabase/` antes e a tela depois. Aqui não dá, e o motivo está
  escrito desde a migration da CC-ES003: `estante.test.ts` cobra que toda
  insígnia semeada no banco tenha lugar na estante, e o lugar da vereda sai de
  `veredasAbertas()` — semear a linha com a vereda ainda `emConstrucao`
  reprova ali, e com razão.

  O que sobra de risco é a janela de alguns minutos em que o `deploy.yml`
  termina antes do `supabase.yml`, e ela não alcança ninguém: a vereda leva
  vinte e quatro lições para ser concluída, e `evaluateBadges` roda de novo na
  atividade seguinte de quem quer que seja.

  ── A classe sai do tamanho, e não de uma escolha ────────────────────────
  Vereda não tem nível — ela grava `'basico'` justamente para não reivindicar
  grau nenhum —, então o que decide é o tamanho, que é a única medida honesta
  dela. São vinte e quatro lições (doze de teoria e doze de fazer), e vinte e
  quatro cai na faixa que vai até vinte e cinco, por `TAMANHO_DA_VEREDA` em
  `src/lib/insignias.ts`: Guia. A vigésima sexta cairia em Líder.

  Escrever outra classe aqui não estoura nada: a tela lê a do banco. Quem
  compara as duas é `insignias.test.ts`, a partir da **estante** — a trava
  antiga filtrava por `INSIGNIAS`, onde a insígnia de vereda não está, e por
  isso qualquer classe escrita numa migration de vereda passou por meses sem
  nada reprovar.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cces007', 'Vereda CC-ES007 Comunicação e Agenda',
   'Percorreu a vereda CC-ES007 Comunicação e Agenda até o fim.',
   'route', 'guia', 140)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
