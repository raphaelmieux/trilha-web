/*
  O terceiro passo: a chave por trilha sai, e `projeto` fecha.

  `20260928120000_text_projects_por_projeto` acrescentou a coluna e a chave
  nova ao lado da antiga, e o frontend publicado depois dela já grava e lê só
  por `projeto`. O que sobrou da chave antiga é o que impede a AP045 de ter
  dois textos: com `(user_id, specialty_code)` único, o relatório do bug do
  milênio seria recusado por ter a mesma trilha do relatório da evolução — e
  recusado depois de escrito, na hora de entregar.

  O preenchimento se repete antes do `not null` porque o gatilho só cobria
  quem inseria sem `projeto`; uma linha que chegasse nula por outro caminho
  derrubaria o `alter` e, com ele, a fila do `db push`.

  E o gatilho sai junto. Ele existia para a janela em que o pacote antigo ainda
  gravava pela chave velha; sem a chave velha, o upsert daquele pacote já não
  tem com o que casar, e um gatilho preenchendo em silêncio o que o frontend
  esqueceu de mandar só esconderia um defeito do frontend.
*/

update public.text_projects set projeto = specialty_code where projeto is null;

alter table public.text_projects
  alter column projeto set not null;

drop index if exists public.text_projects_user_specialty_idx;

drop trigger if exists text_projects_projeto_padrao on public.text_projects;
drop function if exists public.text_projects_projeto_padrao();
