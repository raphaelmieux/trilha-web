/*
  Guarda as respostas etapa por etapa da redação guiada.

  A redação da AP041 deixou de ser uma caixa de texto e passou a ser oito
  perguntas conferidas uma a uma. `body` continua guardando o texto final — é
  ele que vale como relatório —, mas o caminho até lá precisa sobreviver a
  fechar o navegador: um desbravador de dez anos não escreve 250 palavras numa
  sentada, e perder as seis respostas já conferidas ao voltar no dia seguinte
  seria perder o trabalho todo.

  Cada chave é o id da etapa, e o valor traz o texto, o veredito da conferência
  e o texto exato que foi conferido. Esse último campo é o que permite saber que
  uma resposta mudou depois de aprovada — nesse caso ela volta a valer como não
  conferida, e o texto final não a inclui até passar de novo.

  Fica em jsonb, e não numa tabela própria, porque nada aqui é consultado por
  fora: é o estado de um rascunho, lido e escrito inteiro, sempre pelo dono.
  As políticas de RLS de text_projects já restringem a linha a ele.
*/

alter table public.text_projects
  add column if not exists etapas jsonb not null default '{}'::jsonb;

comment on column public.text_projects.etapas is
  'Respostas por etapa da redação guiada: { "<etapaId>": { texto, conferencia, conferidoEm } }.';
