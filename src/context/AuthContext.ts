import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

/*
  O contexto e o gancho, separados do componente que os preenche.

  Estavam os três no mesmo arquivo, e o Fast Refresh do Vite reclamava: ele só
  troca um módulo a quente quando tudo o que ele exporta é componente. Com
  `useAuth` exportado ao lado do `AuthProvider`, qualquer edição neste arquivo
  virava recarregamento de página inteira em vez de atualização da tela.

  A sessão sobrevive a isso — `persistSession` guarda no navegador. O que não
  sobrevive é o estado em memória: a questão respondida pela metade, o
  laboratório aberto, o passo do formulário. Quem mexe no currículo edita e olha
  a tela dezenas de vezes por hora, e refazer o caminho até a lição a cada
  edição é o custo real do aviso.

  O nome do arquivo é o mesmo de antes, sem o `x`. As onze telas que importam
  `useAuth` de `context/AuthContext` continuam valendo sem tocar em nada: quem
  precisou mudar foi só o App, que é quem monta o provider.
*/

interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
