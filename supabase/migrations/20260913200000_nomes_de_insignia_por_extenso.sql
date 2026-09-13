/*
  Quinze insígnias com o nome ou a descrição escritos errado.

  Nada aqui estoura, e é esse o problema de sempre: a estante abre, a insígnia
  aparece, o nome está escrito embaixo dela. Só quem lê os sete degraus de uma
  escada de uma vez percebe que um deles destoa — e ninguém lê os sete de uma
  vez, porque eles chegam com meses de diferença.

  ── 1. "avaliações finals" ────────────────────────────────────────────────
  O plural de "final" é **finais**. Onze descrições diziam "finals", nas
  escadas de Avaliações e de Nota máxima. Saiu de um gerador que montava o
  plural com `final + (v === 1 ? '' : 's')` — regra que acerta em
  "requisito/requisitos" e erra em toda palavra terminada em -al.

  ── 2. Algarismo entre irmãos por extenso ─────────────────────────────────
  `notamaxima_9` era "9 Notas Máximas" no meio de Três, Quatro, Seis e Treze;
  e quatro degraus de XP eram "300 de XP", "2500 de XP", "6000 de XP" e
  "12000 de XP" entre Cem, Quinhentos e Mil. A tabela de números por extenso
  do gerador não tinha esses valores, e ela **caía para o algarismo em
  silêncio** em vez de reclamar da falta.

  Por que por extenso, e não o contrário: o alvo já aparece em algarismo na
  escada da estante, logo abaixo do desenho — o nome é a frase que a pessoa
  lê, e "Doze Mil de XP" é como ela diria em voz alta. A escada de Ofensiva é
  a exceção que confirma: ali **todos** os sete usam algarismo ("Sequência de
  30 Dias"), então nenhum destoa.

  ── Por que o nome importa dos dois lados ─────────────────────────────────
  A estante lê o **banco** para o degrau já conquistado e o **catálogo em
  TypeScript** para o degrau que falta. Divergir aqui não é campo escrito e
  nunca lido: é a mesma insígnia se chamando uma coisa antes de ser
  conquistada e outra depois. Por isso a correção anda nos dois arquivos, e
  `insignias.test.ts` passou a comparar nome e descrição — antes ele conferia
  só o ícone e o tier, que é a razão de isto ter passado.

  ── Por que repetir o INSERT, e não um UPDATE ─────────────────────────────
  Um `UPDATE badges SET name = ...` faria a mesma coisa no banco em menos
  linhas. Só que a trava lê os blocos de `INSERT INTO badges` das migrations,
  em ordem de nome de arquivo, e o último a falar vence — que é exatamente o
  que o Postgres faz com o `ON CONFLICT` abaixo. Escrito como UPDATE, o
  conserto seria invisível para ela, e a trava passaria a comparar o
  catálogo de hoje com o texto de ontem.

  Idempotente: rodar de novo reescreve o mesmo texto. Ela não toca em
  `user_badges` — ninguém perde o que conquistou; muda o nome na linha do
  catálogo, que é de onde a estante o lê.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('avaliacoes_2', 'Duas Avaliações',
   'Concluiu duas avaliações finais.',
   'exam', 'companheiro', 51),
  ('avaliacoes_3', 'Três Avaliações',
   'Concluiu três avaliações finais.',
   'exam', 'pesquisador', 52),
  ('avaliacoes_5', 'Cinco Avaliações',
   'Concluiu cinco avaliações finais.',
   'exam', 'pioneiro', 53),
  ('avaliacoes_7', 'Sete Avaliações',
   'Concluiu sete avaliações finais.',
   'exam', 'excursionista', 54),
  ('avaliacoes_10', 'Dez Avaliações',
   'Concluiu dez avaliações finais.',
   'exam', 'guia', 55),
  ('avaliacoes_13', 'Treze Avaliações',
   'Concluiu treze avaliações finais.',
   'exam', 'lider', 56),
  ('notamaxima_3', 'Três Notas Máximas',
   'Acertou 100% em três avaliações finais.',
   'bullseye', 'pesquisador', 59),
  ('notamaxima_4', 'Quatro Notas Máximas',
   'Acertou 100% em quatro avaliações finais.',
   'bullseye', 'pioneiro', 60),
  ('notamaxima_6', 'Seis Notas Máximas',
   'Acertou 100% em seis avaliações finais.',
   'bullseye', 'excursionista', 61),
  ('notamaxima_9', 'Nove Notas Máximas',
   'Acertou 100% em nove avaliações finais.',
   'bullseye', 'guia', 62),
  ('notamaxima_13', 'Treze Notas Máximas',
   'Acertou 100% em treze avaliações finais.',
   'bullseye', 'lider', 63),
  ('xp_300', 'Trezentos de XP',
   'Somou trezentos pontos de experiência.',
   'zap', 'companheiro', 86),
  ('xp_2500', 'Dois Mil e Quinhentos de XP',
   'Somou dois mil e quinhentos pontos de experiência.',
   'zap', 'excursionista', 89),
  ('xp_6000', 'Seis Mil de XP',
   'Somou seis mil pontos de experiência.',
   'zap', 'guia', 90),
  ('xp_12000', 'Doze Mil de XP',
   'Somou doze mil pontos de experiência.',
   'zap', 'lider', 91)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  tier = EXCLUDED.tier,
  sort_order = EXCLUDED.sort_order;
