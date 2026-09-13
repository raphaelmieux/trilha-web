/*
  A ofensiva do ranking passa a sair do registro de atividade, em Brasília.

  O que havia: `coalesce((select max(e.streak_days) from enrollments e ...), 0)`.
  Três coisas erradas de uma vez, e nenhuma delas estoura.

  1. `enrollments` tem uma linha por **trilha** (`UNIQUE(user_id, specialty_id)`),
     então `streak_days` é a sequência dentro de uma trilha só. Quem estudou
     AP034 na segunda e AP042 na terça tem duas matrículas com sequência 1, e o
     ranking mostrava 1 — dois dias seguidos contados como um.

  2. `max(streak_days)` não é a **maior de sempre**: é a corrente da trilha
     mais adiantada. Quem fez sete dias seguidos alternando duas trilhas nunca
     chegou a sete em nenhuma das duas, e a insígnia de sete dias não vinha.

  3. A coluna era escrita com o dia em **UTC**, que vira às 21h de Brasília.
     Quem estuda à noite — que é quando o clube se reúne — ganhava um dia de
     graça por estudar às 20h e voltar às 22h da mesma noite.

  Aqui a conta é de ilhas: dias distintos em Brasília, e a maior corrida de
  dias consecutivos entre eles. `at time zone` usa a base de fusos do próprio
  Postgres, que sabe do fim do horário de verão em 2019 e saberá se ele
  voltar — escrever `- interval '3 hours'` à mão erraria calado no dia em que
  isso mudasse.

  A vereda entra de graça: ela não tem linha em `specialties`, logo nunca teve
  matrícula onde marcar dia, e era por isso que vencer a teoria de uma vereda
  não mexia na ofensiva de ninguém. Os eventos dela estão na mesma tabela.
*/

-- ─── A lista de eventos que contam ─────────────────────────────────────────
/*
  Ela é irmã de `EVENTOS_DA_OFENSIVA`, em `src/lib/ofensiva.ts`, e duas cópias
  divergem no primeiro ajuste — um laboratório novo entraria na lista do
  frontend e não nesta, e o clube veria dois números diferentes para a mesma
  pessoa na mesma tarde. `src/lib/ofensiva.test.ts` lê este arquivo e compara
  as duas listas, nome por nome.

  Fora daqui ficam os passos do meio do caminho — `text_saved`, `mail_sent`,
  `threat_sim_run`, `redacao_montada` —, que dizem que alguém abriu o
  laboratório e não que venceu o módulo.
*/
create or replace function public.eventos_da_ofensiva()
returns text[]
language sql
immutable
as $fn$
  select array[
    'lesson_completed',
    'final_exam_completed',
    'agenda_concluida',
    'ai_lab_completed',
    'apresentacao_concluida',
    'area_de_trabalho_concluida',
    'code_lab_completed',
    'configuracoes_concluidas',
    'correio_concluido',
    'cuidados_concluido',
    'estilos_concluidos',
    'file_manager_completed',
    'filipenses_completed',
    'formatacao_concluida',
    'image_compress_completed',
    'image_create_completed',
    'insercao_concluida',
    'mail_lab_completed',
    'operacoes_concluidas',
    'pact_completed',
    'planilha_avancada_concluida',
    'planilha_concluida',
    'site_lab_completed',
    'text_submitted',
    'threat_lab_completed',
    'web_lab_completed',
    'vereda_teoria',
    'vereda_laboratorio'
  ]::text[];
$fn$;

-- ─── A maior ofensiva de alguém ────────────────────────────────────────────
/*
  security definer porque `activity_events` restringe cada pessoa às próprias
  linhas, e o ranking precisa ler a de todo mundo — como a `leaderboard`, que
  é quem chama isto, já fazia. Devolve um número e nada mais: nenhuma linha de
  atividade de ninguém atravessa esta função.
*/
create or replace function public.melhor_ofensiva(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $fn$
  with dias as (
    select distinct (a.created_at at time zone 'America/Sao_Paulo')::date as dia
    from activity_events a
    where a.user_id = p_user
      and a.event_type = any(public.eventos_da_ofensiva())
  ),
  /*
    O truque das ilhas: numa corrida de dias consecutivos, "o dia menos a
    posição dele na ordem" é constante — então dias que compartilham essa
    constante são uma corrida só. Vale para virada de mês e ano bissexto sem
    caso especial nenhum, porque quem soma e subtrai é o tipo `date`.
  */
  ilhas as (
    select dia - (row_number() over (order by dia))::integer as grupo
    from dias
  )
  select coalesce(max(tamanho), 0)::integer
  from (select count(*) as tamanho from ilhas group by grupo) t;
$fn$;

revoke all on function public.melhor_ofensiva(uuid) from public;
grant execute on function public.melhor_ofensiva(uuid) to anon, authenticated;

-- ─── E o ranking passa a usá-la ────────────────────────────────────────────
/*
  Só a coluna `best_streak` muda; o resto é o que já estava publicado, repetido
  aqui porque `create or replace function` reescreve o corpo inteiro e não
  aceita remendo.
*/
create or replace function public.leaderboard(p_periodo text default 'tudo')
returns table (
  id               uuid,
  display_name     text,
  public_name_form text,
  avatar_url       text,
  club             text,
  club_city        text,
  total_xp         integer,
  best_streak      integer,
  badge_count      integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $fn$
  with janela as (
    select case lower(coalesce(p_periodo, 'tudo'))
             when 'dia'    then now() - interval '1 day'
             when 'semana' then now() - interval '7 days'
             when 'mes'    then now() - interval '30 days'
             else null                       -- 'tudo'
           end as desde
  )
  select
    p.id,
    p.display_name,
    p.public_name_form,
    p.avatar_url,
    case when pp.show_club_publicly then p.club end,
    case when pp.show_club_publicly then p.club_city end,
    case
      when (select desde from janela) is null
        then coalesce((select sum(e.xp) from enrollments e where e.user_id = p.id), 0)
      else coalesce((select sum(x.amount) from xp_events x
                     where x.user_id = p.id
                       and x.created_at >= (select desde from janela)), 0)
    end::integer,
    public.melhor_ofensiva(p.id),
    (select count(*) from user_badges ub where ub.user_id = p.id)::integer
  from user_profiles p
  join privacy_preferences pp
    on pp.user_id = p.id and pp.show_on_leaderboard
  where (select desde from janela) is null
     or exists (select 1 from xp_events x
                where x.user_id = p.id
                  and x.created_at >= (select desde from janela))
  order by 7 desc, p.display_name;
$fn$;

revoke all on function public.leaderboard(text) from public;
grant execute on function public.leaderboard(text) to anon, authenticated;
