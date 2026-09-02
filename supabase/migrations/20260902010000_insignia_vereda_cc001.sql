/*
  A insígnia da vereda CC001 Lógica com Scratch, e a estante numerada por família.

  ── A linha ──────────────────────────────────────────────────────────────
  A vereda abre no próximo push. Sem esta linha ela seria percorrida inteira e
  não renderia nada: insígnia com critério no código e sem linha na tabela é
  ignorada sem erro e sem prêmio, que é exatamente o que ninguém percebe
  olhando a tela.

  O código sai de `codigoDaInsigniaDaVereda(id)`, e o id é `cc001` — o id
  interno, e não o código da tela, porque `code` pode ser renomeado sem que
  ninguém perca o que percorreu.

  `icon: 'lab'` é o mesmo ícone que marca o módulo de laboratório na trilha e na
  vereda, de um mapa só. Vale o nome do tipo de lição, e não o do desenho:
  escolhe-se "o ícone do laboratório", e o desenho vem atrás.

  ── Por que a numeração muda ─────────────────────────────────────────────
  `sort_order` era atribuído na ordem em que cada vereda ficava pronta: 71 para
  a de HTML, 72 para a de CSS. Só que a estante é lida como percurso, e a CC001
  é a primeira vereda de todas — quem a conquista primeiro a veria depois de
  duas que ainda não fez.

  Corrigir uma vez, agora, é barato; corrigir a cada vereda inserida no meio das
  trinta e duas seria uma migration de renumeração por vereda. Então cada
  família ganha uma faixa própria, com folga para as que faltam:

    Base .......  71-79    (CC001 a CC006)
    Front-end ..  81-89    (CC-FE001 a CC-FE007)
    Back-end ...  91-99    (CC-BE001 a CC-BE006)
    Sistemas ... 101-109   (CC-SI001 a CC-SI005)
    Mobile ..... 111-119   (CC-MB001 a CC-MB005)
    Infra ...... 121-129   (CC-IE001 a CC-IE003)

  `sort_order` é ordem de exibição, e não identidade — quem identifica é `code`.
  Mexer nele não desfaz insígnia conquistada por ninguém.

  70 continua com `mini_html`, o registro de quando a vereda se chamava
  mini-trilha. Ele não se renumera: nada novo entra por ali, e quem o conquistou
  não perde o que fez.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cc001', 'Lógica com Scratch',
   'Percorreu a vereda de lógica com blocos: do que é um algoritmo até um jogo com placar, dois personagens que se encontram e uma condição de vitória.',
   'lab', 'bronze', 71)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;

/* As duas já publicadas passam para a faixa do Front-end. */
UPDATE badges SET sort_order = 81 WHERE code = 'vereda_html';
UPDATE badges SET sort_order = 82 WHERE code = 'vereda_css';
