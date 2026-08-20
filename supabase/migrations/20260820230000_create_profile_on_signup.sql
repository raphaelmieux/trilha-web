/*
  Cria o perfil junto com a conta, no banco, em vez de depois no navegador.

  O cadastro fazia supabase.auth.signUp() e, na linha seguinte, um INSERT em
  user_profiles a partir do cliente. Isso só funciona se o signUp já devolver
  sessão. Com "Confirm email" ligado ele não devolve: o usuário nasce sem
  confirmar, o cliente continua sendo `anon`, e a policy insert_own_profile
  (auth.uid() = id, para `authenticated`) barra o INSERT.

  O resultado é uma conta pela metade — existe em auth.users, não existe em
  user_profiles — e foi exatamente o que aconteceu com o cadastro de 20/08.
  A pessoa nem via o erro certo: tentava de novo, o e-mail de confirmação
  estourava a cota do SMTP compartilhado, e a tela dizia "email rate limit
  exceeded", que não tem relação nenhuma com a causa.

  Com o gatilho, o perfil nasce na mesma transação da conta. Não há janela
  entre os dois, não depende de sessão, e não depende de a confirmação de
  e-mail estar ligada ou desligada.

  SECURITY DEFINER porque o gatilho roda no INSERT de auth.users, quando ainda
  não existe auth.uid() — nenhuma policy de usuário poderia valer aqui.
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
    /* display_name é NOT NULL. Se o cadastro não mandou nome, a parte antes do
       @ é melhor do que abortar a criação da conta inteira. */
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data->>'club', ''),
    nullif(new.raw_user_meta_data->>'club_code', ''),
    nullif(new.raw_user_meta_data->>'club_city', ''),
    nullif(new.raw_user_meta_data->>'club_association', ''),
    nullif(new.raw_user_meta_data->>'unit', ''),
    /* Lista fixa de colunas de propósito: is_admin não sai daqui. O conteúdo de
       raw_user_meta_data é escrito pelo cliente, então nada que conceda
       privilégio pode ser copiado dele. */
    'full',
    coalesce(nullif(new.raw_user_meta_data->>'terms_version', ''), '1.0'),
    now(),
    nullif(new.raw_user_meta_data->>'security_question_code', ''),
    nullif(new.raw_user_meta_data->>'security_answer_hash', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
