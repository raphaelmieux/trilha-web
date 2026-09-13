/*
  As duas insígnias duplicadas saem — depois de quem as tem receber a de hoje.

  `mini_html` é a vereda de HTML com o nome de quando ela se chamava
  mini-trilha; `vereda_html` é a mesma vereda com o nome de agora.
  `lab_image_lab` é o laboratório de imagens de antes de ele virar dois —
  espremer foto e desenhar são assuntos diferentes, e na vida são dois
  programas.

  Nenhuma das duas está no catálogo desde as sete classes: elas não são
  concedidas a mais ninguém. O que sobrou foram as linhas, e as conquistas
  penduradas nelas.

  ── Por que apagar direto seria tirar da estante de alguém ───────────────
  `user_badges.badge_id` é `REFERENCES badges(id) ON DELETE CASCADE`. Um
  DELETE na linha de `badges` leva junto, **em silêncio**, toda conquista que
  aponta para ela — quem percorreu a vereda de HTML quando ela se chamava
  mini-trilha abriria o perfil e teria uma insígnia a menos, sem nada na tela
  dizendo por quê. A regra da casa é a oposta: insígnia não se perde, e uma
  decisão nossa não se cobra de quem já andou.

  Então a ordem é: dar a de hoje a quem tem a de ontem, e só então apagar a de
  ontem. Quem já tiver as duas não ganha nada — `ON CONFLICT DO NOTHING`
  cuida disso, porque `user_badges` tem `UNIQUE(user_id, badge_id)`.

  ── O destino de cada uma é o que a plataforma já lia ────────────────────
  Não é escolha nova. `veredasConcluidas` já lê os eventos de quando a vereda
  se chamava mini-trilha, e `codigoDaInsigniaDaVereda('html')` já devolve
  `vereda_html`. E `LABORATORIO_DO_EVENTO` já traduz `image_lab_completed`
  para `image_compress`, com o motivo escrito ao lado: "quem concluiu o
  laboratório de antes não perde o que fez". Esta migration só alcança quem
  não voltou à plataforma desde então — `evaluateBadges` roda quando a pessoa
  faz alguma coisa, e quem parou antes da mudança nunca foi reavaliado.

  A data da conquista vai junto. `awarded_at` é quando aquela pessoa venceu
  aquilo, e reescrevê-lo com a data desta migration faria o perfil dela dizer
  que ela conquistou hoje o que conquistou no ano passado.
*/

-- ─── 1. Quem tem a de ontem passa a ter a de hoje ─────────────────────────
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT ub.user_id, novo.id, ub.awarded_at, ub.context
FROM user_badges ub
JOIN badges velho ON velho.id = ub.badge_id
JOIN badges novo ON novo.code = CASE velho.code
  WHEN 'mini_html'     THEN 'vereda_html'
  WHEN 'lab_image_lab' THEN 'lab_image_compress'
END
WHERE velho.code IN ('mini_html', 'lab_image_lab')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- ─── 2. E aí as duas linhas saem ──────────────────────────────────────────
/*
  O CASCADE leva as conquistas antigas junto, que é o que se quer agora: elas
  já estão representadas pelas novas, com a data original. O que restaria sem
  o passo 1 é que este DELETE fosse a perda inteira.
*/
DELETE FROM badges WHERE code IN ('mini_html', 'lab_image_lab');
