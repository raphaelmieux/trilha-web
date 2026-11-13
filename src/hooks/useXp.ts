import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EVENTOS_COM_XP, xpDasVitorias } from '../lib/xp';

/*
  O XP de alguém, derivado das vitórias — a mesma conta do ranking.

  Era a soma de `enrollments.xp`, que crescia 10 a cada atividade, refeita ou
  não. Agora o número sai dos eventos que já estão gravados (`lib/xp.ts`), e
  o painel e o ranking mostram o mesmo número para a mesma pessoa.

  Sem janela de tempo, ao contrário da ofensiva: o XP é de sempre. Só os
  eventos que podem ser vitória, e só as colunas que a conta lê.
*/
export function useXp(userId: string | undefined) {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    /* A resposta pode chegar depois de a tela sair — ver `useMontado`. */
    let vivo = true;
    (async () => {
      const { data } = await supabase
        .from('activity_events')
        .select('event_type, created_at, metadata, curriculum_version')
        .eq('user_id', userId)
        .in('event_type', [...EVENTOS_COM_XP]);
      if (!vivo) return;
      setXp(xpDasVitorias(data ?? []));
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [userId]);

  return { xp, loading };
}
