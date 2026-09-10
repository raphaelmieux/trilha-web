/*
  ATENÇÃO: esta migration foi editada depois de ter ido para `main`, o que este
  repositório proíbe. A exceção está explicada aqui para não virar precedente.

  Ela nunca chegou a aplicar coisa nenhuma. O `ON CONFLICT` dos requisitos
  citava `(specialty_id, code)`, e `requirements` tem UNIQUE só em `code` — o
  Postgres recusa com "there is no unique or exclusion constraint matching the
  ON CONFLICT specification". O corpo inteiro é um bloco DO, que é uma
  instrução só: ou tudo entra, ou nada entra. Nada entrou, e o `db push` parou
  aqui.

  É o mesmo caso da 20260821230000: arquivo que não executa não tem conserto
  adiante. Escrever outra migration por cima resolveria o banco de produção e
  deixaria todo banco novo — restauração, staging — parando neste arquivo, com
  as migrations seguintes nem sendo lidas.

  Corrigir a cláusula não muda estado de banco nenhum: onde ela não consta
  aplicada, roda agora do jeito certo; onde constasse, não rodaria de qualquer
  forma. `migrations.test.ts` passou a conferir toda cláusula `ON CONFLICT`
  contra as restrições UNIQUE do schema, que é o que teria pego isto antes do
  deploy.

  ── O que ela faz ───────────────────────────────────────────────────────
  Registra a especialidade AP044 — Computação 4 no banco.

  O currículo em TypeScript descreve a trilha para a tela; o banco guarda o
  progresso, e ele referencia requirements(id) e lessons(id). Sem estas linhas,
  getRequirementId devolve nulo para todo código AP044, o upsert de progresso
  não acontece, e os seis laboratórios novos comemoram sem ter gravado nada.

  São 50 requisitos, os do documento oficial
  (`public/curriculum files/AP044 Computação 4.pdf`), na ordem dele. O documento
  troca uma letra no item 11 — as alíneas saem a), b), e), d), e), f), g), h),
  i), sem nenhuma c) —, como a AP041 faz no item 5, a AP042 no 6 e a AP043 no 2;
  a numeração aqui segue a ordem em que os itens aparecem.

  O requisito 1 — ter a especialidade de Computação 3 — entra na tabela como
  todos os outros, porque é oficial e o relatório entregue ao clube cita a lista
  inteira. O que ele não tem é lição: quem o cumpre é o bloqueio da trilha, e
  isso mora no currículo (`peloPreRequisito`), não aqui.

  Tudo por ON CONFLICT, re-executável quantas vezes for preciso.
*/

DO $$
DECLARE
  v_versao uuid;
  v_ap044 uuid;
  v_mod uuid;
BEGIN
  INSERT INTO curriculum_versions (code, name, version, is_published)
  VALUES ('computacao-4', 'Trilha.Web() — Computação 4', '1.0', true)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, version = EXCLUDED.version
  RETURNING id INTO v_versao;

  INSERT INTO specialties (curriculum_version_id, code, name, level, description, sort_order)
  VALUES (v_versao, 'AP044', 'Computação 4', 'intermediario',
          'Parar de fazer à mão o que o programa faz sozinho: estilo, sumário, filtro, gráfico, slide mestre e banco de dados.', 6)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, level = EXCLUDED.level
  RETURNING id INTO v_ap044;

  -- ── Requisitos ────────────────────────────────────────────────────────
  INSERT INTO requirements (specialty_id, code, title, description, type, sort_order) VALUES
  (v_ap044, 'AP044-1.1', 'Computação 3', 'Ter a especialidade de Computação 3.', 'mixed', 1),

  (v_ap044, 'AP044-2.1', 'Bit', 'Definir bit.', 'theory', 2),
  (v_ap044, 'AP044-2.2', 'Kilobyte', 'Definir kilobyte.', 'theory', 3),
  (v_ap044, 'AP044-2.3', 'Megabyte', 'Definir megabyte.', 'theory', 4),
  (v_ap044, 'AP044-2.4', 'Gigabyte', 'Definir gigabyte.', 'theory', 5),
  (v_ap044, 'AP044-2.5', 'Terabyte', 'Definir terabyte.', 'theory', 6),

  (v_ap044, 'AP044-3.1', 'Vírus e proteção', 'O que são vírus e como podemos nos proteger deles?', 'theory', 7),

  (v_ap044, 'AP044-4.1', 'A internet e a vida moderna', 'O que é a internet e como ela influencia a vida moderna?', 'theory', 8),

  (v_ap044, 'AP044-5.1', 'Cinco sites educativos', 'Acessar e descrever o conteúdo de cinco sites da internet com conteúdo educativo.', 'practice', 9),

  (v_ap044, 'AP044-6.1', 'Agenda em banco de dados', 'Montar um banco de dados para cadastrar, em forma de uma agenda, o nome de, no mínimo, 25 pessoas, contendo nome, endereço, telefone e e-mail de cada uma delas.', 'practice', 10),

  (v_ap044, 'AP044-7.1', 'Estilos de título, ênfase e citação', 'Utilizar e formatar estilos para títulos, ênfase e citação.', 'practice', 11),
  (v_ap044, 'AP044-7.2', 'Colar mantendo a formatação', 'Colar um texto mantendo a formatação original.', 'practice', 12),
  (v_ap044, 'AP044-7.3', 'Colar com a formatação do destino', 'Colar um texto usando a formatação do destino.', 'practice', 13),
  (v_ap044, 'AP044-7.4', 'Sobrescrito e subscrito', 'Utilizar sobrescrito e subscrito.', 'practice', 14),
  (v_ap044, 'AP044-7.5', 'Destacar com cores', 'Destacar textos com cores.', 'practice', 15),
  (v_ap044, 'AP044-7.6', 'Alternar maiúsculas e minúsculas', 'Alternar maiúsculas e minúsculas.', 'practice', 16),
  (v_ap044, 'AP044-7.7', 'Colunas', 'Fazer colunas.', 'practice', 17),
  (v_ap044, 'AP044-7.8', 'Nota de rodapé', 'Inserir uma nota de rodapé.', 'practice', 18),
  (v_ap044, 'AP044-7.9', 'Sumário', 'Criar um sumário.', 'practice', 19),

  (v_ap044, 'AP044-8.1', 'Filtros', 'Criar e usar filtros.', 'practice', 20),
  (v_ap044, 'AP044-8.2', 'Congelar linhas e colunas', 'Congelar linhas/colunas.', 'practice', 21),
  (v_ap044, 'AP044-8.3', 'Gráfico', 'Criar um gráfico.', 'practice', 22),

  (v_ap044, 'AP044-9.1', 'Apresentação a partir de um modelo', 'Criar uma apresentação com base em um modelo (template).', 'practice', 23),
  (v_ap044, 'AP044-9.2', 'Layout do slide', 'Alterar o layout do slide.', 'practice', 24),
  (v_ap044, 'AP044-9.3', 'Criar, duplicar, reorganizar e excluir slides', 'Criar, duplicar, reorganizar e excluir slides.', 'practice', 25),
  (v_ap044, 'AP044-9.4', 'Imagens no slide', 'Inserir imagens e organizá-las adequadamente no slide.', 'practice', 26),
  (v_ap044, 'AP044-9.5', 'Vídeo', 'Inserir um vídeo.', 'practice', 27),
  (v_ap044, 'AP044-9.6', 'Áudio', 'Inserir um áudio.', 'practice', 28),
  (v_ap044, 'AP044-9.7', 'Salvar em PDF', 'Salvar a apresentação em formato pdf.', 'practice', 29),

  (v_ap044, 'AP044-10.1', 'Editores de texto', 'Citar uma ou duas opções de softwares atuais para editores de texto.', 'theory', 30),
  (v_ap044, 'AP044-10.2', 'Planilhas eletrônicas', 'Citar uma ou duas opções de softwares atuais para planilhas eletrônicas.', 'theory', 31),
  (v_ap044, 'AP044-10.3', 'Banco de dados', 'Citar uma ou duas opções de softwares atuais para banco de dados.', 'theory', 32),
  (v_ap044, 'AP044-10.4', 'Linguagem de programação', 'Citar uma ou duas opções de softwares atuais para linguagem de programação.', 'theory', 33),
  (v_ap044, 'AP044-10.5', 'Editores de imagens', 'Citar uma ou duas opções de softwares atuais para editores de imagens.', 'theory', 34),
  (v_ap044, 'AP044-10.6', 'Editores de vídeo', 'Citar uma ou duas opções de softwares atuais para editores de vídeo.', 'theory', 35),

  (v_ap044, 'AP044-11.1', 'Destinatário', 'Adicionar um destinatário.', 'practice', 36),
  (v_ap044, 'AP044-11.2', 'Cópia', 'Adicionar destinatário em cópia.', 'practice', 37),
  (v_ap044, 'AP044-11.3', 'Cópia oculta', 'Adicionar destinatário em cópia oculta.', 'practice', 38),
  (v_ap044, 'AP044-11.4', 'Anexo', 'Inserir um arquivo.', 'practice', 39),
  (v_ap044, 'AP044-11.5', 'Assinatura', 'Personalizar uma assinatura.', 'practice', 40),
  (v_ap044, 'AP044-11.6', 'Enviar', 'Enviar o e-mail.', 'practice', 41),
  (v_ap044, 'AP044-11.7', 'Arquivar', 'Arquivar um e-mail.', 'practice', 42),
  (v_ap044, 'AP044-11.8', 'Responder', 'Responder um e-mail.', 'practice', 43),
  (v_ap044, 'AP044-11.9', 'Encaminhar', 'Encaminhar um e-mail.', 'practice', 44),

  (v_ap044, 'AP044-12.1', 'Segurança no e-mail', 'Que princípios de segurança devemos ter ao enviar e receber/abrir e-mails.', 'theory', 45),

  (v_ap044, 'AP044-13.1', 'Limpeza e desfragmentação do disco', 'Fazer uma limpeza de disco e desfragmentação do disco.', 'practice', 46),
  (v_ap044, 'AP044-13.2', 'Abrir com outro programa', 'Abrir um arquivo usando um software diferente do padrão.', 'practice', 47),
  (v_ap044, 'AP044-13.3', 'Programa padrão', 'Definir um software padrão para abrir tipos de arquivo.', 'practice', 48),
  (v_ap044, 'AP044-13.4', 'Impressora padrão', 'Definir uma impressora padrão.', 'practice', 49),
  (v_ap044, 'AP044-13.5', 'Criar um usuário', 'Criar um usuário.', 'practice', 50)
  /* `requirements` tem UNIQUE em `code`, e não em (specialty_id, code) — quem
     tem a composta é `modules`. Citar a coluna errada aqui derruba o arquivo
     inteiro, porque o corpo é um bloco DO só. */
  ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, type = EXCLUDED.type;

  -- ── Módulos ───────────────────────────────────────────────────────────
  INSERT INTO modules (specialty_id, code, title, description, sort_order) VALUES
  (v_ap044, 'AP044.1', 'Do bit ao terabyte', 'A escala das unidades, e a diferença entre megabit e megabyte.', 1),
  (v_ap044, 'AP044.2', 'A internet e o que vem com ela', 'A rede feita de cabo, o vírus que se copia, e cinco sites para visitar.', 2),
  (v_ap044, 'AP044.3', 'A agenda do clube', 'Campo, registro e tipo — e por que a mesma lista vira útil quando ganha estrutura.', 3),
  (v_ap044, 'AP044.4', 'O boletim do clube', 'Estilos, colar, sobrescrito, colunas, nota de rodapé e sumário.', 4),
  (v_ap044, 'AP044.5', 'A planilha que filtra e desenha', 'Filtro que esconde sem apagar, cabeçalho congelado, e o gráfico cujo tipo sai da pergunta.', 5),
  (v_ap044, 'AP044.6', 'A apresentação do clube', 'Modelo, layout, imagem pelo canto, vídeo que viaja junto — e o PDF, que é para entregar.', 6),
  (v_ap044, 'AP044.7', 'O correio do clube', 'Para, Cc e Cco, encaminhar sem vazar, arquivar sem perder — e a segurança do lado de quem envia.', 7),
  (v_ap044, 'AP044.8', 'A máquina e os programas', 'Que programa existe para cada tarefa, qual deles o sistema abre — e o que limpar e otimizar fazem.', 8),
  (v_ap044, 'AP044.F', 'Avaliação Final', 'A prova que fecha a trilha, com questões de todos os requisitos.', 9)
  ON CONFLICT (specialty_id, code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

  -- ── Módulo 1: a escala ────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.1';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.1-L1', 'A escala, do bit ao terabyte', 'theory',
   '{"requirementCodes":["AP044-2.1","AP044-2.2","AP044-2.3","AP044-2.4","AP044-2.5"]}', 1),
  (v_mod, 'AP044.1-L2', 'Megabit não é megabyte', 'theory',
   '{"requirementCodes":["AP044-2.1","AP044-2.3"]}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 2: internet, vírus e os cinco sites ────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.2';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.2-L1', 'A internet é feita de cabo', 'theory',
   '{"requirementCodes":["AP044-4.1"]}', 1),
  (v_mod, 'AP044.2-L2', 'O programa que se copia', 'theory',
   '{"requirementCodes":["AP044-3.1"]}', 2),
  (v_mod, 'AP044.2-L3', 'Visitando cinco sites educativos', 'lab',
   '{"requirementCodes":["AP044-5.1"],"labType":"web_lab"}', 3)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 3: o banco de dados ────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.3';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.3-L1', 'Campo, registro e tipo', 'theory',
   '{"requirementCodes":["AP044-6.1"]}', 1),
  (v_mod, 'AP044.3-L2', 'Montando a agenda do clube', 'lab',
   '{"requirementCodes":["AP044-6.1"],"labType":"banco_de_dados"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 4: os nove itens do editor de texto ────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.4';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.4-L1', 'Estilo em vez de negrito repetido', 'theory',
   '{"requirementCodes":["AP044-7.1","AP044-7.2","AP044-7.3","AP044-7.9"]}', 1),
  (v_mod, 'AP044.4-L2', 'Formatando o boletim do clube', 'lab',
   '{"requirementCodes":["AP044-7.1","AP044-7.2","AP044-7.3","AP044-7.4","AP044-7.5","AP044-7.6","AP044-7.7","AP044-7.8","AP044-7.9"],"labType":"estilos_texto"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 5: filtro, congelar e gráfico ──────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.5';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.5-L1', 'Filtro, congelar e o tipo de gráfico', 'theory',
   '{"requirementCodes":["AP044-8.1","AP044-8.2","AP044-8.3"]}', 1),
  (v_mod, 'AP044.5-L2', 'Filtrando e desenhando as inscrições', 'lab',
   '{"requirementCodes":["AP044-8.1","AP044-8.2","AP044-8.3"],"labType":"planilha_avancada"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 6: a apresentação ──────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.6';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.6-L1', 'Modelo, layout e o que viaja junto', 'theory',
   '{"requirementCodes":["AP044-9.1","AP044-9.2","AP044-9.4","AP044-9.5","AP044-9.6","AP044-9.7"]}', 1),
  (v_mod, 'AP044.6-L2', 'Montando a apresentação do clube', 'lab',
   '{"requirementCodes":["AP044-9.1","AP044-9.2","AP044-9.3","AP044-9.4","AP044-9.5","AP044-9.6","AP044-9.7"],"labType":"apresentacao"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 7: o correio ───────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.7';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.7-L1', 'Os três campos e os dois lados da segurança', 'theory',
   '{"requirementCodes":["AP044-12.1"]}', 1),
  (v_mod, 'AP044.7-L2', 'Escrevendo o aviso do acampamento', 'lab',
   '{"requirementCodes":["AP044-11.1","AP044-11.2","AP044-11.3","AP044-11.4","AP044-11.5","AP044-11.6","AP044-11.7","AP044-11.8","AP044-11.9"],"labType":"correio_completo"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── Módulo 8: o catálogo de programas e os ajustes do sistema ─────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.8';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.8-L1', 'O catálogo de programas e a escolha do sistema', 'theory',
   '{"requirementCodes":["AP044-10.1","AP044-10.2","AP044-10.3","AP044-10.4","AP044-10.5","AP044-10.6"]}', 1),
  (v_mod, 'AP044.8-L2', 'Ajustando o computador do clube', 'lab',
   '{"requirementCodes":["AP044-13.1","AP044-13.2","AP044-13.3","AP044-13.4","AP044-13.5"],"labType":"configuracoes_sistema"}', 2)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;

  -- ── A avaliação final ─────────────────────────────────────────────────
  SELECT id INTO v_mod FROM modules WHERE specialty_id = v_ap044 AND code = 'AP044.F';
  INSERT INTO lessons (module_id, code, title, lesson_type, content, sort_order) VALUES
  (v_mod, 'AP044.F-L1', 'Avaliação Final de Computação 4', 'final',
   '{"requirementCodes":[],"labType":"final_exam"}', 1)
  ON CONFLICT (module_id, code) DO UPDATE SET title = EXCLUDED.title, lesson_type = EXCLUDED.lesson_type, content = EXCLUDED.content;
END $$;
