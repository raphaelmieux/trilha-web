/*
  As curiosidades passam de quatro a cinquenta e oito, chegam os Mestrados, e
  a Coruja se aposenta.

  ── As curiosidades ───────────────────────────────────────────────────────
  Eram quatro, e as quatro mediam só o horário. A lista fechada no
  planejamento (`docs/faixa-planejamento.md`, seção 7) tem cinco temas:
  calendário da computação, ritmo, jeito de estudar, explorador e segredos.
  O catálogo mora em `catalogoDeCuriosidades.ts` e as regras em
  `curiosidades.ts`; as linhas abaixo foram geradas do catálogo, e
  `insignias.test.ts` compara tupla a tupla.

  O Madrugador mantém o código e muda de janela: era das 5h às 7h, é das 0h
  às 6h. Fim de Semana e Semana Inteira passam ao glifo do tema Ritmo. Quem
  já tinha qualquer uma das três continua com ela.

  ── Quem já tinha alcançado não recebe por aqui ───────────────────────────
  Diferente das migrations de laboratório, esta não concede nada a partir dos
  eventos. As regras das curiosidades são cinquenta e oito, várias dependem
  do fuso de Brasília e de semanas que caem em dias móveis, e escrevê-las
  também em SQL seria ter duas cópias da mesma regra. Quem as concede é
  `evaluateBadges`, na próxima atividade de cada um — com a **data em que
  foi alcançada**, e não a de hoje, e sem anunciar as antigas: entram na
  Faixa em silêncio.

  ── Os Mestrados ──────────────────────────────────────────────────────────
  Treze da plataforma — um por família de trilha e de vereda — e o ME006, o
  Mestrado oficial em Ciência e Tecnologia (`mestrados.ts`). A descrição de
  cada um diz se é da plataforma ou oficial: o relatório entregue ao clube não
  pode apresentar o nosso como se fosse da Divisão.

  ── A Coruja ──────────────────────────────────────────────────────────────
  Premiava uma criança de dez anos por estudar entre a meia-noite e as cinco.
  Todo horário dela cabe no Madrugador novo, então quem a tem recebe o
  Madrugador com o `awarded_at` original, e só depois a linha sai —
  `user_badges.badge_id` é `ON DELETE CASCADE`, e apagar antes levaria a
  conquista junto, calada.
*/

-- ─── 1. As curiosidades ────────────────────────────────────────────────────
INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('virada_sem_bug', 'Virada sem Bug',
   'Estudou na semana de 1º de janeiro, a virada que o bug do milênio ameaçou em 2000.',
   'calendar', 'companheiro', 1500),
  ('internet_segura', 'Internet Segura',
   'Estudou na segunda semana de fevereiro, a do Dia da Internet Segura.',
   'calendar', 'companheiro', 1501),
  ('mulheres_na_ciencia', 'Mulheres na Ciência',
   'Estudou na semana de 11 de fevereiro, o dia das mulheres e meninas na ciência.',
   'calendar', 'companheiro', 1502),
  ('dia_que_quase_nao_existe', 'O Dia que Quase Não Existe',
   'Estudou num 29 de fevereiro, o dia que só existe nos anos bissextos.',
   'calendar', 'companheiro', 1503),
  ('nascimento_da_web', 'Nascimento da Web',
   'Estudou na semana de 12 de março, quando a Web foi proposta, em 1989.',
   'calendar', 'companheiro', 1504),
  ('dia_do_pi', 'Dia do π',
   'Estudou na semana de 14 de março, o 3/14 dos primeiros algarismos de π.',
   'calendar', 'companheiro', 1505),
  ('copia_de_seguranca', 'Cópia de Segurança',
   'Estudou na semana de 31 de março, o Dia Mundial do Backup.',
   'calendar', 'companheiro', 1506),
  ('meninas_nas_tic', 'Meninas nas TIC',
   'Estudou na semana da quarta quinta-feira de abril, o dia das meninas na tecnologia.',
   'calendar', 'companheiro', 1507),
  ('senha_forte', 'Senha Forte',
   'Estudou na semana da primeira quinta-feira de maio, o Dia Mundial da Senha.',
   'calendar', 'companheiro', 1508),
  ('homem_que_calculava', 'O Homem que Calculava',
   'Estudou na semana de 6 de maio, o Dia Nacional da Matemática.',
   'calendar', 'companheiro', 1509),
  ('sociedade_da_informacao', 'Sociedade da Informação',
   'Estudou na semana de 17 de maio, o dia mundial das telecomunicações.',
   'calendar', 'companheiro', 1510),
  ('alan_turing', 'Alan Turing',
   'Estudou na semana de 23 de junho, quando nasceu Alan Turing.',
   'calendar', 'companheiro', 1511),
  ('dia_do_emoji', 'Dia do Emoji',
   'Estudou na semana de 17 de julho, o Dia do Emoji.',
   'calendar', 'companheiro', 1512),
  ('primeiro_site', 'Primeiro Site',
   'Estudou na semana de 6 de agosto, quando o primeiro site foi ao ar, em 1991.',
   'calendar', 'companheiro', 1513),
  ('dia_da_fotografia', 'Dia da Fotografia',
   'Estudou na semana de 19 de agosto, o Dia Mundial da Fotografia.',
   'calendar', 'companheiro', 1514),
  ('pinguim', 'Pinguim',
   'Estudou na semana de 25 de agosto, quando o Linux foi anunciado, em 1991.',
   'calendar', 'companheiro', 1515),
  ('byte_do_ano', 'Byte do Ano',
   'Estudou na semana do 256º dia do ano, o Dia do Programador.',
   'calendar', 'companheiro', 1516),
  ('codigo_aberto', 'Código Aberto',
   'Estudou na semana do terceiro sábado de setembro, o Dia do Software Livre.',
   'calendar', 'companheiro', 1517),
  ('ada_lovelace', 'Ada Lovelace',
   'Estudou na semana da segunda terça-feira de outubro, o dia de Ada Lovelace.',
   'calendar', 'companheiro', 1518),
  ('quadro_a_quadro', 'Quadro a Quadro',
   'Estudou na semana de 28 de outubro, o Dia Internacional da Animação.',
   'calendar', 'companheiro', 1519),
  ('dia_do_designer', 'Dia do Designer',
   'Estudou na semana de 5 de novembro, o Dia do Designer.',
   'calendar', 'companheiro', 1520),
  ('seguranca_da_informacao', 'Segurança da Informação',
   'Estudou na semana de 30 de novembro, o dia da segurança de computadores.',
   'calendar', 'companheiro', 1521),
  ('grace_hopper', 'Grace Hopper',
   'Estudou na semana de 9 de dezembro, quando nasceu Grace Hopper.',
   'calendar', 'companheiro', 1522),
  ('madrugador', 'Madrugador',
   'Estudou entre a meia-noite e as seis da manhã.',
   'clock', 'companheiro', 1523),
  ('pessoa_da_manha', 'Pessoa da Manhã',
   'Estudou entre as seis da manhã e o meio-dia.',
   'clock', 'companheiro', 1524),
  ('pessoa_da_tarde', 'Pessoa da Tarde',
   'Estudou entre o meio-dia e as seis da tarde.',
   'clock', 'companheiro', 1525),
  ('noturno', 'Noturno',
   'Estudou entre as seis da tarde e a meia-noite.',
   'clock', 'companheiro', 1526),
  ('fim_de_semana', 'Fim de Semana',
   'Estudou num sábado ou domingo.',
   'clock', 'companheiro', 1527),
  ('semana_inteira', 'Semana Inteira',
   'Estudou em todos os sete dias da semana, em algum momento.',
   'clock', 'companheiro', 1528),
  ('pausa_boa', 'Pausa Boa',
   'Estudou duas vezes no mesmo dia, com duas horas ou mais de pausa entre uma e outra.',
   'clock', 'companheiro', 1529),
  ('doze_meses', 'Doze Meses',
   'Estudou em cada um dos doze meses do ano.',
   'clock', 'companheiro', 1530),
  ('um_ano_de_faixa', 'Um Ano de Faixa',
   'Estudou na semana em que fez um ano da primeira atividade.',
   'clock', 'companheiro', 1531),
  ('revisao', 'Revisão',
   'Refez uma lição já vencida e venceu de novo.',
   'theory', 'companheiro', 1532),
  ('de_primeira', 'De Primeira',
   'Venceu uma avaliação final na primeira tentativa.',
   'theory', 'companheiro', 1533),
  ('modulo_de_uma_vez', 'Módulo de uma Vez',
   'Venceu a teoria e o laboratório do mesmo módulo de vereda no mesmo dia.',
   'theory', 'companheiro', 1534),
  ('consulta', 'Consulta',
   'Abriu a referência da vereda durante um laboratório e o venceu depois.',
   'theory', 'companheiro', 1535),
  ('palavra_propria', 'Palavra Própria',
   'Acrescentou a primeira palavra ao dicionário pessoal.',
   'theory', 'companheiro', 1536),
  ('mao_no_teclado', 'Mão no Teclado',
   'Usou cinco atalhos de teclado diferentes nas simulações.',
   'theory', 'companheiro', 1537),
  ('botao_direito', 'Botão Direito',
   'Abriu um menu de contexto, com o botão direito ou segurando o dedo.',
   'theory', 'companheiro', 1538),
  ('na_parede', 'Na Parede',
   'Baixou ou imprimiu um Token.Web().',
   'theory', 'companheiro', 1539),
  ('relatorio_entregue', 'Relatório Entregue',
   'Gerou o relatório para o clube.',
   'theory', 'companheiro', 1540),
  ('conferido', 'Conferido',
   'Verificou um Token.Web() na página pública de verificação.',
   'theory', 'companheiro', 1541),
  ('rosa_dos_ventos', 'Rosa dos Ventos',
   'Venceu ao menos uma lição em cada família de vereda.',
   'route', 'companheiro', 1542),
  ('tres_frentes', 'Três Frentes',
   'Avançou em três trilhas diferentes na mesma semana.',
   'route', 'companheiro', 1543),
  ('ponte', 'Ponte',
   'Concluiu uma vereda e a trilha ou vereda de onde ela saiu.',
   'route', 'companheiro', 1544),
  ('todas_as_janelas', 'Todas as Janelas',
   'Venceu um laboratório em cada programa que a plataforma imita.',
   'route', 'companheiro', 1545),
  ('poliglota', 'Poliglota',
   'Venceu laboratórios em cinco linguagens diferentes.',
   'route', 'companheiro', 1546),
  ('arquivo_escondido', 'Arquivo Escondido',
   'Mostrou os itens ocultos no Explorador e abriu o arquivo que estava lá.',
   'star', 'companheiro', 1547),
  ('extensoes_a_mostra', 'Extensões à Mostra',
   'Ligou as extensões de nome de arquivo no Explorador.',
   'star', 'companheiro', 1548),
  ('lixeira_arqueologica', 'Lixeira Arqueológica',
   'Restaurou o item mais antigo da Lixeira.',
   'star', 'companheiro', 1549),
  ('leitor_de_manual', 'Leitor de Manual',
   'Pediu --help a um comando no terminal.',
   'star', 'companheiro', 1550),
  ('quem_sou_eu', 'Quem Sou Eu',
   'Perguntou whoami ao terminal.',
   'star', 'companheiro', 1551),
  ('viajante_no_tempo', 'Viajante no Tempo',
   'Voltou um repositório a um commit antigo.',
   'star', 'companheiro', 1552),
  ('zen_do_python', 'Zen do Python',
   'Escreveu import this no editor de Python.',
   'star', 'companheiro', 1553),
  ('mapa_do_banco', 'Mapa do Banco',
   'Consultou sqlite_master no editor de SQL.',
   'star', 'companheiro', 1554),
  ('fim_da_planilha', 'Fim da Planilha',
   'Foi com Ctrl+↓ até a última linha de uma planilha.',
   'star', 'companheiro', 1555),
  ('texto_de_enchimento', 'Texto de Enchimento',
   'Escreveu =rand() no Word e viu o texto aparecer.',
   'star', 'companheiro', 1556),
  ('gato_pintado', 'Gato Pintado',
   'Trocou a cor do ator no Scratch.',
   'star', 'companheiro', 1557)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;

-- ─── 2. Os Mestrados ───────────────────────────────────────────────────────
INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
  ('mestrado_internet', 'Mestrado Internet',
   'Mestrado da plataforma: concluiu todas as trilhas da família Internet.',
   'award', 'companheiro', 1600),
  ('mestrado_computacao', 'Mestrado Computação',
   'Mestrado da plataforma: concluiu todas as trilhas da família Computação.',
   'award', 'companheiro', 1601),
  ('mestrado_programacao', 'Mestrado Programação',
   'Mestrado da plataforma: concluiu todas as trilhas da família Programação.',
   'award', 'companheiro', 1602),
  ('mestrado_web_design', 'Mestrado Web Design',
   'Mestrado da plataforma: concluiu todas as trilhas da família Web Design.',
   'award', 'companheiro', 1603),
  ('mestrado_artes_e_habilidades_manuais', 'Mestrado Artes e Habilidades Manuais',
   'Mestrado da plataforma: concluiu todas as trilhas da família Artes e Habilidades Manuais.',
   'award', 'companheiro', 1604),
  ('mestrado_base', 'Mestrado Base',
   'Mestrado da plataforma: concluiu todas as veredas da família Base.',
   'award', 'companheiro', 1605),
  ('mestrado_escritorio', 'Mestrado Escritório',
   'Mestrado da plataforma: concluiu todas as veredas da família Escritório.',
   'award', 'companheiro', 1606),
  ('mestrado_design', 'Mestrado Design',
   'Mestrado da plataforma: concluiu todas as veredas da família Design.',
   'award', 'companheiro', 1607),
  ('mestrado_front_end', 'Mestrado Front-end',
   'Mestrado da plataforma: concluiu todas as veredas da família Front-end.',
   'award', 'companheiro', 1608),
  ('mestrado_mobile', 'Mestrado Mobile',
   'Mestrado da plataforma: concluiu todas as veredas da família Mobile.',
   'award', 'companheiro', 1609),
  ('mestrado_back_end', 'Mestrado Back-end',
   'Mestrado da plataforma: concluiu todas as veredas da família Back-end.',
   'award', 'companheiro', 1610),
  ('mestrado_sistemas', 'Mestrado Sistemas',
   'Mestrado da plataforma: concluiu todas as veredas da família Sistemas.',
   'award', 'companheiro', 1611),
  ('mestrado_infraestrutura', 'Mestrado Infraestrutura',
   'Mestrado da plataforma: concluiu todas as veredas da família Infraestrutura.',
   'award', 'companheiro', 1612),
  ('mestrado_me006', 'ME006 Mestrado em Ciência e Tecnologia',
   'Mestrado oficial: concluiu nesta plataforma sete trilhas da lista do ME006.',
   'award', 'companheiro', 1613)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      tier = EXCLUDED.tier,
      sort_order = EXCLUDED.sort_order;

-- ─── 3. A Coruja vira Madrugador, e então sai ─────────────────────────────
INSERT INTO user_badges (user_id, badge_id, awarded_at, context)
SELECT ub.user_id, novo.id, ub.awarded_at, ub.context
FROM user_badges ub
JOIN badges velho ON velho.id = ub.badge_id
JOIN badges novo ON novo.code = 'madrugador'
WHERE velho.code IN ('coruja')
ON CONFLICT (user_id, badge_id) DO NOTHING;

DELETE FROM badges WHERE code IN ('coruja');
