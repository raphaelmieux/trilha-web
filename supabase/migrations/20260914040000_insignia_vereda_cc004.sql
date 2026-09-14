/*
  A insígnia da vereda CC004 Python, Avançado.

  O critério nasce sozinho, de `codigoDaInsigniaDaVereda`: é o id da vereda com
  o prefixo. A linha na tabela, não — ela continua sendo à mão, e sem ela a
  insígnia é ignorada em silêncio: sem erro, sem prêmio, e de fora parece que a
  pessoa não conquistou nada.

  ── Por que ela entra antes de a vereda abrir ────────────────────────────
  O frontend e o Supabase saem do mesmo push e correm ao mesmo tempo — não em
  ordem. Quando a mudança precisa do schema primeiro, separam-se os dois
  pushes, e este é o caso: a linha vem agora, com a vereda ainda
  `emConstrucao`, e o push que a abre vem depois. O contrário abriria a vereda
  com a insígnia faltando pela janela em que o `supabase.yml` ainda não tivesse
  terminado — e quem terminasse nela não ganharia nada, sem nada explicando.

  Enquanto a vereda está em construção a linha não premia ninguém: ninguém
  percorre o que não está aberto. `insignias.test.ts` só passa a cobrá-la
  quando o `emConstrucao` sai.

  ── A classe sai do tamanho, e não de uma escolha ────────────────────────
  Vereda não tem nível — ela grava `'basico'` justamente para não reivindicar
  grau nenhum —, então o que decide é o tamanho, que é a única medida honesta
  dela. São catorze lições (sete de teoria e sete de fazer), e a faixa de
  catorze a dezoito é Excursionista, por `TAMANHO_DA_VEREDA` em
  `src/lib/insignias.ts`. Escrever outra classe aqui não estoura nada: a tela
  lê a do banco, e `insignias.test.ts` compara as duas justamente porque elas
  já divergiram em silêncio por meses.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cc004', 'Vereda CC004 Python, Avançado',
   'Percorreu a vereda CC004 Python, Avançado até o fim.',
   'route', 'excursionista', 133)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
