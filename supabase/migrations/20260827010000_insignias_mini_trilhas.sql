/*
  A insígnia das mini-trilhas.

  Mini-trilha é o material curto que nasce de uma trilha completa e passa a
  valer sozinho: a sintaxe do HTML saiu da AP035 porque quem escreve HTML
  precisa dela, tenha ou não feito a especialidade de Internet. Ela não tem
  requisito oficial, não emite nota e não entra no percentual da trilha —
  entra como bônus, que é o que ela é.

  ── Por que a família começa no 70 ────────────────────────────────────────
  `sort_order` decide a ordem da estante no perfil, e o catálogo agrupa por
  família: laboratórios até 58, trilhas de 59 a 62. As mini-trilhas são uma
  família nova e vêm depois das trilhas, mas não em 63: a próxima trilha
  completa precisaria empurrar todas elas para baixo, e já houve duas
  migrations fazendo exatamente esse remendo. De 63 a 69 fica reservado para
  as trilhas que vierem, e as mini-trilhas começam em 70.

  O critério mora em src/lib/insignias.ts; sem a linha aqui, a insígnia é
  ignorada sem erro e sem prêmio.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('mini_html', 'Sintaxe do HTML', 'Percorreu a mini-trilha de sintaxe do HTML, do que é uma tag até um site de quatro páginas.', 'book', 'bronze', 70)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
