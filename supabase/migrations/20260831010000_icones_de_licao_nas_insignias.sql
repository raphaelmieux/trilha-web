/*
  O ícone da insígnia passa a ser o mesmo que marca a lição que a rendeu.

  A plataforma tem uma marca para cada tipo de lição — `MarcaDaLicao`, um disco
  com o ícone do tipo — e ela é a mesma na trilha e na vereda: erlenmeyer para
  laboratório, livro aberto para teoria. A estante de insígnias não seguia isso.
  A insígnia de laboratório vinha com `beaker`, a proveta reta, que é outro
  desenho; e as de lição vinham com `layers`, a pilha que marca os módulos.

  O efeito não era um erro visível — era pior: quem concluía o laboratório via
  um desenho no módulo e ganhava um segundo desenho na estante, sem nada ligando
  os dois. A insígnia deixa de dizer *o que* foi feito e passa a dizer só que
  algo foi feito, que é o contrário do trabalho dela.

  O critério de cada insígnia continua em src/lib/insignias.ts; aqui só muda o
  desenho. `iconeCanonico` em src/lib/badgeIcons.ts traduz os nomes antigos
  enquanto este UPDATE não corre — o frontend e o Supabase saem do mesmo push e
  correm em paralelo, então existe uma janela em que a tela nova lê o banco
  velho, e ela não pode cair na medalha genérica.

  Idempotente: um UPDATE por nome, que não encontra nada na segunda vez.
*/

-- Laboratório: o erlenmeyer do módulo de laboratório.
UPDATE badges SET icon = 'lab' WHERE icon = 'beaker';

-- Lição: o livro aberto da lição de teoria.
-- Só as que contam lições concluídas. As de acerto sem erro continuam com a
-- estrela, porque o que elas marcam é a precisão, e não a leitura; e as de
-- módulo continuam com a pilha, porque módulo não é lição.
UPDATE badges SET icon = 'theory'
WHERE code IN ('primeira_licao', 'licoes_5', 'licoes_10', 'licoes_25', 'licoes_50');
