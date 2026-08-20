/*
 * Traduz os erros do Supabase Auth, que chegam em inglês e escritos para quem
 * desenvolve, não para quem se cadastra.
 *
 * O caso que motivou o arquivo: um cadastro falhou com "email rate limit
 * exceeded" na tela. A pessoa não tinha como saber que aquilo não era culpa
 * dela, que não adiantava tentar de novo, nem quanto tempo esperar.
 */

/** Devolve o texto em português, ou uma mensagem genérica se não reconhecer. */
export function traduzirErroDeAuth(mensagem: string | undefined | null): string {
  const m = (mensagem ?? '').toLowerCase();

  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'O sistema atingiu o limite de cadastros por hora e recusou este. '
      + 'Não é erro seu: espere alguns minutos e tente de novo. Se continuar, '
      + 'avise a liderança do clube.';
  }
  if (m.includes('already registered') || m.includes('already been registered')
      || m.includes('user already exists')) {
    return 'Já existe uma conta com este e-mail. Tente entrar, ou use '
      + '"Esqueceu a senha?" para recuperar o acesso.';
  }
  if (m.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Esta conta ainda não foi confirmada. Procure o e-mail de '
      + 'confirmação, inclusive na caixa de spam.';
  }
  if (m.includes('password should be at least')) {
    const n = m.match(/at least (\d+)/)?.[1];
    return `A senha precisa ter pelo menos ${n ?? 6} caracteres.`;
  }
  if (m.includes('weak password') || m.includes('password is too weak')) {
    return 'Esta senha é fraca demais. Misture letras, números e símbolos.';
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')
      || m.includes('email address') && m.includes('invalid')) {
    return 'Este e-mail não parece válido. Confira se não faltou uma letra.';
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'Os cadastros estão temporariamente fechados. Avise a liderança do clube.';
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed')) {
    return 'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.';
  }

  /* Sem tradução conhecida: mostra o original, porque um texto em inglês ainda
     ajuda mais quem for pedir suporte do que um "erro inesperado" mudo. */
  return mensagem ? `Não foi possível concluir: ${mensagem}` : 'Não foi possível concluir o cadastro.';
}
