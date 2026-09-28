/*
  Um texto por projeto, e não um por trilha.

  ── O que estava certo até aqui ──────────────────────────────────────────
  `text_projects` guarda um texto por pessoa em cada trilha —
  `text_projects_user_specialty_idx`, em (user_id, specialty_code) —, e o
  upsert dos dois laboratórios de escrita depende dessa chave. Bastava porque
  toda trilha que pedia redação pedia uma só.

  A AP045 pede duas. O requisito 2 é o relatório sobre a evolução da computação,
  e o requisito 6 é o relatório sobre o bug do milênio, escrito a partir de uma
  pesquisa em sites especializados. Com a chave por trilha, entregar o segundo
  **sobrescreveria o primeiro**, calado: o upsert acha a linha da AP045 e troca
  o corpo dela, e o relatório entregue à liderança passa a ter um texto a menos
  sem nada dizendo por quê.

  ── A chave nova ─────────────────────────────────────────────────────────
  `projeto` diz qual texto é. Nas linhas que já existem ele é o próprio código
  da trilha — eram todas o único texto daquela trilha —, e é por isso que o
  relatório da evolução continua achando o que foi escrito nele. O texto novo
  da AP045 terá um projeto próprio.

  ── Por que em três passos, e este é o primeiro ──────────────────────────
  O frontend e o banco saem do mesmo push e correm em paralelo, e as abas já
  abertas continuam rodando o pacote antigo. Trocar a chave de uma vez deixaria
  alguém gravando pela chave que acabou de sumir. Então:

    1. este arquivo acrescenta a coluna, preenche as linhas que existem e cria a
       chave nova **sem derrubar a antiga** — o pacote de hoje continua gravando
       como sempre;
    2. o frontend passa a gravar e ler por `projeto`;
    3. uma migration seguinte derruba a chave antiga e fecha a coluna em
       `not null`.

  ── E o gatilho cobre a janela ───────────────────────────────────────────
  Entre o passo 1 e o 2, o pacote antigo insere linhas sem `projeto`. Nulo não
  colide em índice único — dois nulos são diferentes para o Postgres —, então a
  linha nova escaparia da chave e, no passo 2, o upsert por `projeto` não a
  acharia: criaria outra, e a chave antiga recusaria a segunda. O gatilho dá a
  essas linhas o mesmo valor que o preenchimento abaixo deu às antigas.

  Função de gatilho não entra em `database.ts`: o gerador não lista o que
  devolve `trigger`, e é por isso que este arquivo não faz o `supabase.yml`
  divergir — a coluna nova, sim, e ela está escrita à mão lá, igual ao que o
  gerador escreveria.
*/

alter table public.text_projects
  add column if not exists projeto text;

update public.text_projects set projeto = specialty_code where projeto is null;

create or replace function public.text_projects_projeto_padrao()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $fn$
begin
  if new.projeto is null then
    new.projeto := new.specialty_code;
  end if;
  return new;
end;
$fn$;

drop trigger if exists text_projects_projeto_padrao on public.text_projects;
create trigger text_projects_projeto_padrao
  before insert or update on public.text_projects
  for each row execute function public.text_projects_projeto_padrao();

-- A chave nova convive com a antiga até o passo 3.
create unique index if not exists text_projects_user_projeto_idx
  on public.text_projects (user_id, projeto);

comment on column public.text_projects.projeto is
  'Qual texto é este. O código da trilha quando ela pede um texto só; um nome próprio quando pede mais de um.';
