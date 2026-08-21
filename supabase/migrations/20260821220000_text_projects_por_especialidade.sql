/*
  Uma redação por trilha, e não uma por pessoa.

  text_projects não guardava a qual especialidade o texto pertencia, e o
  laboratório buscava com .maybeSingle() filtrando só por user_id. Enquanto
  havia uma única trilha pedindo redação isso passava; a AP041 também pede um
  relatório de 250 palavras, e a segunda redação faria a consulta encontrar
  duas linhas — que é justamente o caso em que .maybeSingle() falha.

  A coluna nasce com AP034 nas linhas existentes: eram todas da história da
  Internet, a única redação que havia até aqui.
*/

alter table public.text_projects
  add column if not exists specialty_code text;

update public.text_projects set specialty_code = 'AP034' where specialty_code is null;

alter table public.text_projects
  alter column specialty_code set not null;

-- Uma redação por pessoa em cada trilha; o upsert do laboratório depende disto.
create unique index if not exists text_projects_user_specialty_idx
  on public.text_projects (user_id, specialty_code);
