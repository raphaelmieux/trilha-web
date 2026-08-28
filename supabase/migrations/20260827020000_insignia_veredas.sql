/*
  As insígnias das veredas.

  "Mini-trilha" era descrição, não nome: dizia o tamanho e não dizia o que a
  coisa é. Vereda é o caminho estreito que sai da trilha principal — que é
  literalmente como estas nascem, e é palavra de quem anda no mato, que é o
  vocabulário do desbravador. O código da insígnia acompanha: `vereda_<id>`.

  ── A linha antiga fica ───────────────────────────────────────────────────
  `mini_html` não é apagada. A regra da casa é que insígnia não se perde, e
  apagar a linha tiraria de alguém uma coisa que essa pessoa fez sem devolver
  nada em troca. Ela deixa de ser concedida — nenhum código aponta mais para
  ela — e some da estante de quem nunca a teve, que é todo mundo menos quem
  leu a vereda na primeira hora em que ela existiu.

  ── Por que 71, e não 70 ──────────────────────────────────────────────────
  70 é da linha antiga, e `sort_order` é ordem de exibição: reaproveitá-lo
  poria as duas no mesmo lugar da estante de quem tem as duas.

  O critério mora em src/curriculum/veredas.ts; sem a linha aqui, a insígnia é
  ignorada sem erro e sem prêmio.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_html', 'Sintaxe do HTML', 'Percorreu a vereda de sintaxe do HTML: sete módulos de teoria e sete laboratórios, do que é uma tag até o menu de um site.', 'book', 'bronze', 71)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
