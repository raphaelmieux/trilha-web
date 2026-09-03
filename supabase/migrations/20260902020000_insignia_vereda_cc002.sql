/*
  A insígnia da vereda CC002 Python.

  A vereda abre nos próximos pushes. Sem esta linha ela seria percorrida
  inteira e não renderia nada: insígnia com critério no código e sem linha na
  tabela é ignorada sem erro e sem prêmio — o que ninguém percebe olhando a
  tela, porque a tela não tem nada de errado.

  O código sai de `codigoDaInsigniaDaVereda(id)`, e o id é `cc002`. É o id
  interno que nomeia, e não o código da tela: `code` pode ser renomeado sem que
  ninguém perca o que percorreu.

  72 é a segunda vaga da faixa da família Base, aberta na migration da CC001:
  71-79 para CC001 a CC006. A estante se lê como percurso, e a de Python vem
  logo depois da de blocos.

  `icon: 'lab'` é o mesmo ícone que marca o módulo de laboratório na trilha e
  na vereda, de um mapa só. Vale o nome do tipo de lição, e não o do desenho.

  DO UPDATE porque o texto pode ser reescrito; DO NOTHING deixaria a redação
  velha no banco para sempre.
*/

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('vereda_cc002', 'Python',
   'Percorreu a vereda de Python: da primeira linha executada até um programa próprio, com variáveis, condição, laço e um programa quebrado consertado.',
   'lab', 'bronze', 72)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;
