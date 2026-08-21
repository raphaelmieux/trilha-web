/*
  Ranking por período, clube na listagem, e preferência escolhida no cadastro.

  O ranking somava enrollments.xp, que é um total corrente sem histórico: não
  havia como saber quanto XP alguém ganhou "esta semana", porque a única coisa
  gravada era o acumulado. Daí a tabela de eventos abaixo.
*/

-- ─── 1. XP com data ────────────────────────────────────────────────────────
create table if not exists public.xp_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.user_profiles(id) on delete cascade,
  specialty_id uuid references public.specialties(id) on delete set null,
  amount       integer not null check (amount > 0 and amount <= 1000),
  created_at   timestamptz not null default now()
);

-- O ranking sempre filtra por janela de tempo e agrupa por pessoa.
create index if not exists xp_events_user_created_idx
  on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_created_idx
  on public.xp_events (created_at desc);

alter table public.xp_events enable row level security;

drop policy if exists insert_own_xp_event on public.xp_events;
create policy insert_own_xp_event on public.xp_events
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists select_own_xp_event on public.xp_events;
create policy select_own_xp_event on public.xp_events
  for select to authenticated using (auth.uid() = user_id);

/*
  Sem UPDATE nem DELETE de propósito: um registro de XP é um fato datado. Poder
  reescrevê-lo pelo cliente permitiria inflar o ranking retroativamente.
*/

-- ─── 2. O ranking, por janela de tempo ─────────────────────────────────────
/*
  security definer porque a listagem cruza dados de todo mundo, e as policies de
  xp_events e privacy_preferences restringem cada pessoa às próprias linhas.
  A função só devolve quem marcou show_on_leaderboard.

  'tudo' soma enrollments.xp, e não os eventos: o total corrente já existia
  antes desta tabela, e recontá-lo pelos eventos zeraria o histórico de quem
  já vinha jogando. As janelas curtas somam eventos, e portanto só enxergam o
  que aconteceu a partir de agora — não dá para inventar um passado que nunca
  foi gravado.
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
as $$
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
    /* O clube só aparece para quem consentiu; caso contrário some da linha, em
       vez de a linha inteira sumir. */
    case when pp.show_club_publicly then p.club end,
    case when pp.show_club_publicly then p.club_city end,
    case
      when (select desde from janela) is null
        then coalesce((select sum(e.xp) from enrollments e where e.user_id = p.id), 0)
      else coalesce((select sum(x.amount) from xp_events x
                     where x.user_id = p.id
                       and x.created_at >= (select desde from janela)), 0)
    end::integer,
    coalesce((select max(e.streak_days) from enrollments e where e.user_id = p.id), 0)::integer,
    (select count(*) from user_badges ub where ub.user_id = p.id)::integer
  from user_profiles p
  join privacy_preferences pp
    on pp.user_id = p.id and pp.show_on_leaderboard
  /* Numa janela curta, quem não pontuou fica de fora: um ranking "de hoje"
     cheio de zeros esconde quem de fato estudou hoje. Em 'tudo' todo mundo que
     optou aparece, inclusive quem ainda não começou. */
  where (select desde from janela) is null
     or exists (select 1 from xp_events x
                where x.user_id = p.id
                  and x.created_at >= (select desde from janela))
  order by 7 desc, p.display_name;
$$;

revoke all on function public.leaderboard(text) from public;
grant execute on function public.leaderboard(text) to anon, authenticated;

-- ─── 3. Preferências nascem com a conta ────────────────────────────────────
/*
  Havia gente sem linha nenhuma em privacy_preferences — a linha só surgia se a
  pessoa mexesse na tela de Perfil. Com a preferência sendo escolhida já no
  cadastro, ela precisa nascer junto, como o perfil.
*/
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.user_profiles (
    id, email, display_name,
    club, club_code, club_city, club_association, unit,
    public_name_form, terms_version, terms_accepted_at,
    security_question_code, security_answer_hash
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'club', ''),
    nullif(new.raw_user_meta_data->>'club_code', ''),
    nullif(new.raw_user_meta_data->>'club_city', ''),
    nullif(new.raw_user_meta_data->>'club_association', ''),
    nullif(new.raw_user_meta_data->>'unit', ''),
    'full',
    coalesce(nullif(new.raw_user_meta_data->>'terms_version', ''), '1.0'),
    now(),
    nullif(new.raw_user_meta_data->>'security_question_code', ''),
    nullif(new.raw_user_meta_data->>'security_answer_hash', '')
  )
  on conflict (id) do nothing;

  /* Ausente ou lixo no metadado vira `false`: aparecer publicamente é escolha
     explícita, nunca o que sobra de um campo mal preenchido. */
  insert into public.privacy_preferences (user_id, show_on_leaderboard, show_club_publicly)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'show_on_leaderboard')::boolean, false),
    coalesce((new.raw_user_meta_data->>'show_club_publicly')::boolean, false)
  )
  on conflict (user_id) do nothing;

  return new;
exception
  when invalid_text_representation then
    -- metadado com texto onde devia haver booleano: cria no padrão fechado
    insert into public.privacy_preferences (user_id, show_on_leaderboard, show_club_publicly)
    values (new.id, false, false)
    on conflict (user_id) do nothing;
    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Quem se cadastrou antes desta migration também passa a ter a linha.
insert into public.privacy_preferences (user_id, show_on_leaderboard, show_club_publicly)
select p.id, false, false from public.user_profiles p
on conflict (user_id) do nothing;
