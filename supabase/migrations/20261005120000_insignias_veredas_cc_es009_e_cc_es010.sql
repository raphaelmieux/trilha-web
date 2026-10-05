/*
  As insígnias das veredas CC-ES009 Análise de Dados e CC-ES010 Análise
  Estatística.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: é o id da vereda com
  o prefixo, e **sem o hífen** — o código de uma insígnia é `[a-z0-9_]`, então
  `cc-es009` vira `cces009`. A linha na tabela, não — ela continua sendo à mão,
  e sem ela a insígnia é ignorada em silêncio: sem erro, sem prêmio, e de fora
  parece que a pessoa não conquistou nada.

  ── Por que as duas saem na mesma migration ──────────────────────────────
  Porque as duas abrem no mesmo push, e não por economia. A CC-ES010 exige a
  CC-ES009, e `veredas.test.ts` reprova vereda aberta cuja chave está numa que
  ainda não abriu — com razão, porque a pessoa encontraria o cartão cinza
  dizendo "conclua" uma coisa que não existe. Abrir só a primeira deixaria a
  segunda pronta e trancada; abrir só a segunda não compila.

  ── Por que elas saem no mesmo push que abre as veredas ──────────────────
  O normal é `supabase/` antes e a tela depois. Aqui não dá, e o motivo está
  escrito desde a migration da CC-ES003: `estante.test.ts` cobra que toda
  insígnia semeada no banco tenha lugar na estante, e o lugar da vereda sai de
  `veredasAbertas()` — semear a linha com a vereda ainda `emConstrucao`
  reprova ali, e com razão.

  O que sobra de risco é a janela de alguns minutos em que o `deploy.yml`
  termina antes do `supabase.yml`, e ela não alcança ninguém: a mais curta das
  duas leva vinte lições para ser concluída, e `evaluateBadges` roda de novo na
  atividade seguinte de quem quer que seja.

  ── A classe sai do tamanho, e não de uma escolha ────────────────────────
  Vereda não tem nível — ela grava `'basico'` justamente para não reivindicar
  grau nenhum —, então o que decide é o tamanho, que é a única medida honesta
  dela. A CC-ES009 tem vinte e duas lições (onze de teoria e onze de fazer) e a
  CC-ES010 tem vinte (dez e dez); as duas caem na faixa que vai até vinte e
  cinco, por `TAMANHO_DA_VEREDA` em `src/lib/insignias.ts`: Guia. A vigésima
  sexta cairia em Líder.

  Escrever outra classe aqui não estoura nada: a tela lê a do banco. Quem
  compara as duas é `insignias.test.ts`, a partir da estante — e ele passou a
  comparar a de vereda depois de uma mutação ter trocado `excursionista` por
  `pioneiro` numa migration sem derrubar teste nenhum.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cces009', 'Vereda CC-ES009 Análise de Dados',
   'Percorreu a vereda CC-ES009 Análise de Dados até o fim.',
   'route', 'guia', 145),
  ('vereda_cces010', 'Vereda CC-ES010 Análise Estatística',
   'Percorreu a vereda CC-ES010 Análise Estatística até o fim.',
   'route', 'guia', 146)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
