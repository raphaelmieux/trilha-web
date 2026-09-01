/*
  A insígnia da vereda CC-FE002 CSS.

  A vereda abre agora: sete módulos, cada um com uma lição de teoria e um
  laboratório, do que é uma regra de estilo até a página que continua legível no
  celular. Sem esta linha ela seria percorrida inteira e não renderia nada — a
  insígnia sem linha na tabela é ignorada sem erro e sem prêmio, que é
  exatamente o que ninguém percebe olhando a tela.

  O código sai de `codigoDaInsigniaDaVereda(id)`, e o id é `css`. É o id que
  nomeia, e não o código da tela: `code` pode ser renomeado sem que ninguém
  perca o que percorreu.

  `icon: 'lab'` é o mesmo ícone que marca o módulo de laboratório na trilha e na
  vereda — um mapa só para os dois, desde a migration de 31/08. Vale o nome do
  tipo de lição, e não o do desenho: escolhe-se "o ícone do laboratório", e o
  desenho vem atrás.

  72 vem depois do 71 da vereda de HTML, que é a anterior no percurso. A ordem
  da estante é a ordem em que se conquista.

  DO UPDATE porque o texto pode ser reescrito; DO NOTHING deixaria a redação
  velha no banco para sempre.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_css', 'Folha de Estilo',
   'Percorreu a vereda de CSS: sete módulos de teoria e sete laboratórios, da primeira regra de estilo até o mural que se lê em qualquer tela.',
   'lab', 'bronze', 72)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
