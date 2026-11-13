/*
  O XP do ranking passa a ser o das vitórias: cada uma uma vez, na data da
  primeira vez.

  Era a soma de `enrollments.xp` (o total) e de `xp_events` (a janela), e os
  dois cresciam 10 a cada atividade de trilha, inclusive a refeita: refazer a
  mesma lição dez vezes valia cem pontos, e a vereda não rendia nada. Agora o
  XP é derivado das vitórias que já estão em `activity_events` — a lição de
  trilha, o laboratório, a prova final, a trilha e a vereda concluídas, a
  teoria e o laboratório de vereda —, com o valor de cada tipo em
  `src/lib/xp.ts`. Nada é convertido: o histórico inteiro passa pela regra
  nova no dia em que esta migration roda, e quem refez muitas lições vê o
  número cair, que é o número certo.

  `xp_events` e `enrollments.xp` deixam de ser lidos aqui, e o aplicativo deixa
  de escrevê-los. As tabelas ficam: apagá-las não é decisão desta mudança.

  A lista de eventos da ofensiva, mais abaixo, continua idêntica à de
  `EVENTOS_DA_OFENSIVA` — `ofensiva.test.ts` lê a migration mais recente que
  define o `leaderboard`, e esta passa a ser ela. A assinatura não muda, e
  `database.ts` também não.
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
    /*
      O XP: cada vitória uma vez, na data da primeira vez — ver o lateral
      `xp`, logo abaixo, e `src/lib/xp.ts`, que é a mesma conta no navegador.
    */
    xp.total::integer,
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
  cross join lateral (
    /*
      As vitórias de cada um: uma linha por evento que vence alguma coisa, com
      a chave que a torna única e quanto ela vale. `distinct on (chave)` fica
      com a primeira de cada, e é isso que impede refazer de render de novo.

      É a irmã de `vitoriaDoEvento` e `XP_POR_VITORIA`, em `src/lib/xp.ts`:
      o painel conta no navegador, e o ranking conta aqui, porque cruza dados
      de todo mundo. `xp.test.ts` lê este arquivo e confere os valores, as
      chaves, o limiar e a lista de eventos.

      Mora aqui dentro, e não numa função à parte, pelo motivo de
      `20260913140000_ofensiva_so_dentro_do_ranking`: uma função solta com
      `security definer` responderia o XP de quem desmarcou o ranking.
    */
    select coalesce(sum(v.valor), 0) as total
    from (
      select distinct on (vit.chave) vit.chave, vit.valor, vit.quando
      from (
        select
          case
            when a.event_type in ('vereda_teoria', 'vereda_laboratorio') then
              case
                when coalesce(nullif(a.metadata->>'vereda', ''), nullif(a.metadata->>'trilha', '')) is null
                  or coalesce(a.metadata->>'licao', '') = '' then null
                else (case when a.event_type = 'vereda_teoria' then 'vt:' else 'vl:' end)
                  || coalesce(nullif(a.metadata->>'vereda', ''), nullif(a.metadata->>'trilha', ''))
                  || '/' || (a.metadata->>'licao')
              end
            when a.event_type = 'certification_issued' then
              case when coalesce(a.metadata->>'specialtyCode', '') in ('', 'ME006') then null
                   else 'c:' || (a.metadata->>'specialtyCode') end
            when a.event_type = 'final_exam_completed' then
              'p:' || coalesce(nullif(a.metadata->>'specialtyCode', ''), a.curriculum_version, '')
            when a.event_type = 'lesson_completed' then
              case when coalesce(a.metadata->>'lessonCode', '') = '' then null
                   else 'l:' || (a.metadata->>'lessonCode') end
            else
              'lab:' || coalesce(nullif(a.metadata->>'lessonCode', ''),
                                 a.event_type || ':' || coalesce(nullif(a.metadata->>'specialtyCode', ''), a.curriculum_version, ''))
          end as chave,
          case
            when a.event_type = 'vereda_teoria' then 1
            when a.event_type = 'vereda_laboratorio' then 2
            when a.event_type = 'certification_issued' then
              case when a.metadata->>'specialtyCode' like 'CC%' then 4 else 150 end
            when a.event_type = 'final_exam_completed' then 60
            when a.event_type = 'lesson_completed' then 15
            else 30
          end as valor,
          a.created_at as quando
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
                'vereda_laboratorio',
                'certification_issued'
              )
          /* Vencido: sem nota, ou com nota a partir do limiar de domínio (75%). */
          and (
            jsonb_typeof(a.metadata->'score') is distinct from 'number'
            or jsonb_typeof(a.metadata->'total') is distinct from 'number'
            or ((a.metadata->>'total')::numeric > 0
                and (a.metadata->>'score')::numeric * 100 >= 75 * (a.metadata->>'total')::numeric)
          )
      ) vit
      where vit.chave is not null
      order by vit.chave, vit.quando
    ) v
    where (select desde from janela) is null or v.quando >= (select desde from janela)
  ) xp
  where (select desde from janela) is null
     or xp.total > 0
  order by 7 desc, p.display_name;
$fn$;

revoke all on function public.leaderboard(text) from public;
grant execute on function public.leaderboard(text) to anon, authenticated;
