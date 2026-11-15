/*
  A edição antiga se aposenta, e as conquistas dela vão junto.

  Quando o sétimo degrau das escadas de conteúdo virou "tudo"
  (`20261113150000_escadas_ate_o_fim`), os sete topos com número no nome
  saíram das escadas e ficaram no catálogo só para quem os tinha. Ninguém mais
  os ganha, e eles não acrescentavam nada à Faixa: um cacho no fim, visível só
  para alguns, de metas que a plataforma já não propõe.

  ── É a exceção à regra de apagar insígnia ────────────────────────────────
  A regra desta casa é não apagar linha de `badges` sem antes dar a de hoje a
  quem tem a de ontem, porque o ON DELETE CASCADE leva a conquista junto, sem
  aviso. Aqui não há a de hoje: cada um destes topos virou o sexto degrau da
  mesma escada, que quem o tinha já tem. O dono da plataforma decidiu apagar
  também os registros de quem os conquistou, e a linha abaixo declara isso para
  `migrations.test.ts`, que confere que ela nomeia exatamente o que se apaga.

  aposentadas sem herdeira: requisitos_192, licoes_110, modulos_45, laboratorios_28, semerro_90, tokens_40, xp_12000

  O DELETE em `user_badges` vem primeiro só para ser explícito: o CASCADE
  faria o mesmo. Idempotente — rodar de novo não acha nada.
*/

DELETE FROM user_badges
WHERE badge_id IN (
  SELECT id FROM badges
  WHERE code IN ('requisitos_192', 'licoes_110', 'modulos_45', 'laboratorios_28', 'semerro_90', 'tokens_40', 'xp_12000')
);

DELETE FROM badges WHERE code IN ('requisitos_192', 'licoes_110', 'modulos_45', 'laboratorios_28', 'semerro_90', 'tokens_40', 'xp_12000');
