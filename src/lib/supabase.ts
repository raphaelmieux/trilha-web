import { createClient } from '@supabase/supabase-js';

/*
  Sem configuração, o cliente nasce apontando para lugar nenhum — e não estoura.

  O padrão era `|| ''`, e string vazia é justamente o que `createClient`
  recusa: ele lança "supabaseUrl is required" no carregamento do módulo. Como
  este arquivo é importado por progress.ts, que é importado por meio currículo,
  quem clonasse o repositório sem `.env` via oito arquivos de teste falharem
  antes de rodar uma linha — 136 testes, incluindo as travas de qualidade das
  questões, que são as que mais importam para quem só mexe em conteúdo.

  O contorno existia dentro do CI, em variáveis de placeholder. Só que ele
  protegia o CI, e não quem clona: outra máquina, uma sessão na nuvem ou um
  voluntário novo batiam na mesma parede sem nada explicando o porquê.

  Aqui o endereço inválido é honesto: qualquer chamada de rede falha, o que é
  correto quando não há projeto configurado. O que ele não faz é derrubar quem
  nunca vai chamar a rede.
*/
const SEM_CONFIGURACAO = 'https://sem-configuracao.invalid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SEM_CONFIGURACAO;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sem-configuracao';

/** Há projeto configurado? A tela usa isto para explicar em vez de só falhar. */
export const supabaseConfigurado = supabaseUrl !== SEM_CONFIGURACAO;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl + flowType 'implicit' put the session token in a URL hash
    // fragment (#access_token=...), which would collide with HashRouter's own
    // #/route-based routing. PKCE carries it in a ?code= query param instead, so
    // the two don't fight over window.location.hash. This app doesn't currently
    // use any redirect-based auth flow (OAuth, magic link), but this keeps the
    // client correct if one is added later.
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
