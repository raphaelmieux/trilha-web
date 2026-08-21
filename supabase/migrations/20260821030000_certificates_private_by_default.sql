/*
  Certificado passa a ser privado; a verificação continua, mas só por código.

  A policy public_read_certs tinha `using (true)` para anon e authenticated —
  qualquer pessoa, sem sequer entrar no app, podia ler a tabela inteira de
  certificações: user_id, hash e signature de todo mundo. Isso não era
  necessário nem para a verificação pública, que sempre consulta um código
  específico.

  Em lugar dela, uma função que recebe um código e devolve um certificado. Não
  há como listar, varrer ou correlacionar; ou se sabe o código, ou não se
  obtém nada. O código real tem 16 caracteres num alfabeto de 36 (~8e24
  combinações), então adivinhar não é caminho.
*/

drop policy if exists public_read_certs on public.certifications;

create or replace function public.verify_certificate(p_code text)
returns table (
  code               text,
  hash               text,
  level              text,
  curriculum_code    text,
  curriculum_version text,
  status             text,
  issued_at          timestamptz,
  full_name          text,
  club               text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    c.code, c.hash, c.level, c.curriculum_code, c.curriculum_version,
    c.status, c.issued_at,
    /* Sempre o nome completo, e não a forma pública escolhida em Perfil.
       Um Token.Web() é documento de identificação: se dissesse "Anônimo" ou
       apenas as iniciais, não serviria para a liderança conferir de quem é.
       A preferência de exibição continua valendo onde faz sentido — ranking e
       perfil público. */
    p.display_name,
    p.club
  from public.certifications c
  join public.user_profiles p on p.id = c.user_id
  /* Sem distinção de maiúsculas: quem digita um código de um papel não deve
     falhar por causa disso. */
  where upper(c.code) = upper(btrim(p_code))
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

/*
  Revogação sem listagem.

  A policy de UPDATE dava ao admin poder sobre qualquer linha, e a tela de
  administração listava todos os certificados emitidos, com nome e e-mail de
  cada pessoa. A revogação precisa continuar existindo — um certificado emitido
  por engano tem de poder ser invalidado —, mas ela não exige navegar pelos
  documentos alheios: exige saber de qual código se trata.
*/
drop policy if exists admin_update_certs on public.certifications;

create or replace function public.admin_revoke_certificate(p_code text, p_reason text)
returns table (code text, status text, curriculum_code text, issued_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- A condição de admin é lida do banco, nunca de algo que o cliente afirme.
  if not exists (
    select 1 from public.user_profiles
    where id = auth.uid() and is_admin
  ) then
    raise exception 'Apenas administradores podem revogar certificados.'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'Informe o motivo da revogação.' using errcode = '22023';
  end if;

  /* Motivo e data ficam gravados: revogar é ato administrativo sobre o
     documento de outra pessoa, e precisa deixar rastro de quem e por quê. */
  return query
  update public.certifications c
     set status = 'revoked',
         revoked_at = now(),
         revocation_reason = btrim(p_reason)
   where upper(c.code) = upper(btrim(p_code))
     and c.status = 'active'
  returning c.code, c.status, c.curriculum_code, c.issued_at;
end;
$$;

drop function if exists public.admin_revoke_certificate(text);
revoke all on function public.admin_revoke_certificate(text, text) from public, anon;
grant execute on function public.admin_revoke_certificate(text, text) to authenticated;
