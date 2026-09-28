/*
  A ofensiva do ranking passa a contar os dois laboratórios novos da AP045.

  O diagrama do caminho da informação grava `diagrama_concluido`, e a pesquisa
  do bug do milênio grava `pesquisa_concluida`. Os dois só são gravados depois
  de todas as tarefas do laboratório ficarem verdes — são módulo vencido, e não
  passo do meio do caminho —, e por isso entram na lista.

  O relatório da pesquisa não trouxe nome novo: ele entrega um texto, e entrega
  de texto é `text_submitted`, que já estava aqui.

  ── Por que o `leaderboard` inteiro, e não só a lista ────────────────────
  A lista mora dentro da função, na junção com `privacy_preferences`, e é de
  propósito — `20260913140000_ofensiva_so_dentro_do_ranking` conta por que ela
  saiu de uma função à parte. Então acrescentar um nome é reescrever a função,
  com a mesma assinatura: `database.ts` não muda.

  E a lista continua sendo a irmã de `EVENTOS_DA_OFENSIVA`, em
  `src/lib/ofensiva.ts`. `ofensiva.test.ts` lê a migration mais recente que
  define o `leaderboard` — esta, a partir de agora — e compara nome por nome.
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
                'diagrama_concluido',
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
                'pesquisa_concluida',
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
