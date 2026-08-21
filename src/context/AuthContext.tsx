import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ session: null, profile: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (uid: string) => {
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle();
      if (!mounted) return;
      /*
        Uma falha na requisição não é a mesma coisa que "esta conta não tem
        perfil". Zerar nos dois casos era o que apagava a barra: bastava um 403
        momentâneo, durante a renovação do token, para o perfil sumir e não
        voltar mais — e com ele ia embora o botão de sair, deixando a pessoa
        presa numa sessão meio viva.
      */
      if (error) return;
      setProfile(data as UserProfile | null);
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        loadProfile(s.user.id).finally(() => { if (mounted) setLoading(false); });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        (async () => { await loadProfile(s.user.id); })().finally(() => { if (mounted) setLoading(false); });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    /*
      O servidor recusa o logout quando a sessão já morreu do lado dele, e o
      supabase-js mantém o token guardado nesse caso — o clique não produzia
      efeito nenhum. Sair é uma ação que nunca pode falhar: se a chamada remota
      não der certo, encerra localmente e limpa o estado de qualquer forma.
    */
    try {
      const { error } = await supabase.auth.signOut();
      if (error) await supabase.auth.signOut({ scope: 'local' });
    } catch {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    }
    setSession(null);
    setProfile(null);
  };

  return <AuthContext.Provider value={{ session, profile, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
