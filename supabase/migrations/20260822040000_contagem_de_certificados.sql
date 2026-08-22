/*
  Quantos certificados cada trilha já emitiu — em número, e só em número.

  A tela de administração não tem como contar isso sozinha: desde
  20260821030000 a tabela de certificações não é mais legível pelo cliente, nem
  para admin. Foi uma decisão deliberada — a tela antiga listava todos os
  certificados com nome e e-mail, e revogar não exige navegar pelos documentos
  alheios.

  O controle contábil que o clube precisa é outro: quantos saíram por
  especialidade. Isso é agregado, e agregado não identifica ninguém. Esta função
  devolve a contagem, e nada além dela — sem código, sem user_id, sem nome. A
  privacidade continua onde estava; o que muda é que passa a existir uma
  resposta para "quantos" sem precisar abrir "quais".

  Trilha sem nenhum certificado não aparece aqui: quem sabe quais trilhas
  existem é o currículo, e a tela completa a lista com zero.
*/

create or replace function public.admin_certificate_counts()
returns table (
  curriculum_code text,
  emitidos        integer,
  ativos          integer,
  revogados       integer,
  primeiro        timestamptz,
  ultimo          timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  -- A condição de admin é lida do banco, nunca de algo que o cliente afirme.
  if not exists (
    select 1 from public.user_profiles
    where id = auth.uid() and is_admin
  ) then
    raise exception 'Apenas administradores podem ver a contagem de certificados.'
      using errcode = '42501';
  end if;

  return query
  select
    c.curriculum_code,
    count(*)::integer,
    count(*) filter (where c.status = 'active')::integer,
    count(*) filter (where c.status = 'revoked')::integer,
    min(c.issued_at),
    max(c.issued_at)
  from public.certifications c
  group by c.curriculum_code
  order by c.curriculum_code;
end;
$$;

revoke all on function public.admin_certificate_counts() from public;
grant execute on function public.admin_certificate_counts() to authenticated;
