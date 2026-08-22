/*
  Renomeia os módulos da AP034 e da AP035 na voz da AP041.

  Os títulos antigos nomeavam a matéria — "Conceitos Fundamentais",
  "HTML — CodeLab", "Produção com IA". São rótulos de catálogo: dizem o assunto
  a quem já sabe qual é. Os da AP041 falam do ponto de vista de quem chega, e
  passar as três trilhas para a mesma voz é o que faz o conjunto parecer uma
  plataforma só, e não três coisas escritas em épocas diferentes.

  O aplicativo lê os títulos do currículo em TypeScript; estas linhas existem
  para que o banco não fique contando outra história para quem consultar
  `modules` direto — o relatório e a auditoria do clube passam por lá.

  Re-executável: são UPDATEs por código, e nenhum deles depende de rodar uma vez só.
*/

DO $$
DECLARE
  v_ap034 uuid;
  v_ap035 uuid;
BEGIN
  SELECT id INTO v_ap034 FROM specialties WHERE code = 'AP034';
  SELECT id INTO v_ap035 FROM specialties WHERE code = 'AP035';

  -- ── AP034 — Internet ──────────────────────────────────────────────────
  UPDATE modules SET title = 'O que é a internet, afinal',
    description = 'As palavras que todo mundo usa e quase ninguém sabe explicar.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.1';

  UPDATE modules SET title = 'As ferramentas do dia a dia',
    description = 'Correio, navegador, buscador e streaming — quem faz o quê.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.2';

  UPDATE modules SET title = 'De onde veio a internet',
    description = 'A linha do tempo da rede, e o seu texto contando essa história.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.3';

  UPDATE modules SET title = 'O que pode dar errado',
    description = 'Vírus, golpes, o estrago que fazem e como não cair neles.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.4';

  UPDATE modules SET title = 'Combinar as regras de casa',
    description = 'O acordo de uso da internet, escrito por você, cláusula por cláusula.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.5';

  UPDATE modules SET title = 'Achar o que se procura',
    description = 'Navegar, pesquisar e desconfiar do que aparece na frente.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.6';

  UPDATE modules SET title = 'Escrever e receber e-mail',
    description = 'Mandar mensagem, reconhecer golpe e responder com cuidado.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.7';

  UPDATE modules SET title = 'O filtro de Filipenses 4:8',
    description = 'Um critério bíblico para decidir o que ver e o que fechar.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.8';

  UPDATE modules SET description = 'A prova que fecha a trilha, com questões de todos os requisitos.'
    WHERE specialty_id = v_ap034 AND code = 'AP034.F';

  -- ── AP035 — Internet, Avançado ────────────────────────────────────────
  UPDATE modules SET title = 'Antes de começar',
    description = 'A trilha de Internet concluída é a porta de entrada desta.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.0';

  UPDATE modules SET title = 'Como a página chega até você',
    description = 'Endereços, protocolos e o que acontece entre o clique e a tela.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.1';

  UPDATE modules SET title = 'Escrever a própria página',
    description = 'As etiquetas do HTML, escritas à mão e conferidas na hora.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.2';

  UPDATE modules SET title = 'Organizar em tabela',
    description = 'Pôr informação em linhas e colunas, e deixar a página apresentável.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.3';

  UPDATE modules SET title = 'Imagens que carregam rápido',
    description = 'Escolher o formato certo e o tamanho que não faz ninguém esperar.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.4';

  UPDATE modules SET title = 'Um site de verdade',
    description = 'Quatro páginas ligadas entre si, do começo ao fim.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.5';

  UPDATE modules SET title = 'O que a IA faz, e o que não faz',
    description = 'Como essas ferramentas funcionam por dentro, e onde elas erram.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.6';

  UPDATE modules SET title = 'Pedir bem, e conferir',
    description = 'Montar um pedido peça por peça, e julgar o que voltou.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.7';

  UPDATE modules SET description = 'A prova que fecha a trilha, com questões de todos os requisitos.'
    WHERE specialty_id = v_ap035 AND code = 'AP035.F';
END $$;
