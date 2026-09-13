/*
  A ofensiva do ranking volta para dentro do `leaderboard`, e as duas funções
  soltas saem.

  ── O que estava errado ──────────────────────────────────────────────────
  A migration anterior partiu a conta em `melhor_ofensiva(uuid)`, `security
  definer`, com `grant execute ... to anon, authenticated`. Ela lê
  `activity_events` de **um id qualquer** e devolve o número, e não pergunta
  nada a `privacy_preferences`.

  O `leaderboard` pergunta: ele só lista quem marcou `show_on_leaderboard`, e é
  essa junção que faz o consentimento valer. Uma função à parte com os mesmos
  dados e sem a junção desfaz isso — quem desmarcou a caixa some da lista e
  continua respondendo por RPC direta, para `anon` inclusive. Consentimento que
  vale numa porta e não na outra não é consentimento.

  Nada na plataforma chamava as duas: elas nasceram como ajudantes de leitura,
  e o preço delas era exatamente a porta a mais. A conta é a mesma, agora onde
  a junção já a protege.

  ── E o tipo gerado volta a bater ────────────────────────────────────────
  `src/types/database.ts` espelha o schema, e o gerador lista **toda** função
  de `public` — as duas novas o fizeram divergir, e o `supabase.yml` reprovou
  por isso, como ele existe para fazer. Sem elas, a assinatura de `leaderboard`
  é a que o arquivo já descreve, e nada precisa ser regerado.

  ── A ordem importa ──────────────────────────────────────────────────────
  Primeiro se reescreve quem usa, e só depois se derruba quem é usado. Ao
  contrário, o `drop` esbarraria na dependência ou deixaria o `leaderboard`
  apontando para o que não existe mais — e o `db push` para no arquivo que não
  analisa, levando a fila inteira junto.
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
    /*
      A maior ofensiva: dias distintos em Brasília, e a maior corrida de dias
      consecutivos entre eles.

      `at time zone` usa a base de fusos do próprio Postgres, que sabe do fim
      do horário de verão em 2019 e saberá se ele voltar — `- interval '3
      hours'` escrito à mão erraria calado no dia em que isso mudasse. A
      virada do dia é meia-noite daqui, e não meia-noite UTC, que são 21h e
      davam um dia de graça a quem estuda à noite.

      No `where` de dentro, a lista é a irmã de `EVENTOS_DA_OFENSIVA`, em
      `src/lib/ofensiva.ts` — o painel conta no navegador e o ranking conta
      aqui, e duas cópias divergem no primeiro ajuste: o clube veria duas
      ofensivas para a mesma pessoa na mesma tarde. `ofensiva.test.ts` lê este
      arquivo e compara nome por nome. Fora dela ficam os passos do meio do
      caminho — `text_saved`, `mail_sent`, `threat_sim_run`, `redacao_montada`
      —, que dizem que alguém abriu o laboratório e não que venceu o módulo.

      A vereda entra porque os eventos dela estão na mesma tabela: ela não tem
      linha em `specialties`, logo nunca teve matrícula onde marcar dia, e era
      por isso que vencer a teoria de uma vereda não mexia na ofensiva.

      O truque das ilhas: numa corrida de dias consecutivos, "o dia menos a
      posição dele na ordem" é constante, então dias que compartilham essa
      constante são uma corrida só. Virada de mês e ano bissexto saem de
      graça, porque quem soma e subtrai é o tipo `date`.
    */
    coalesce((
      select max(t.tamanho)
      from (
        select count(*) as tamanho
        from (
          select dia - (row_number() over (order by dia))::integer as grupo
          from (
            select distinct (a.created_at at time zone 'America/Sao_Paulo')::date as dia
            from activity_events a
            where a.user_id = p.id
              and a.event_type in (
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
              )
          ) dias
        ) ilhas
        group by grupo
      ) t
    ), 0)::integer,
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

-- E as duas portas a mais deixam de existir.
drop function if exists public.melhor_ofensiva(uuid);
drop function if exists public.eventos_da_ofensiva();
