import { useCallback, useEffect, useState } from 'react';
import { fetchRequirementProgress, progressoEmCache, type ProgressMap } from '../lib/progress';

/*
  Wraps the repeated "fetch this user's requirement progress on mount / when the
  user changes" pattern shared by Dashboard, Specialty, Lesson, Report and the
  final exam — was previously copy-pasted useEffect blocks in each of those pages.

  Começa pelo que já se sabe e confere depois. Antes cada tela partia de um mapa
  vazio: voltar de uma lição para a trilha desenhava a barra em 0% até a resposta
  do servidor chegar, o que, logo depois de concluir uma lição, é exatamente o que
  parece progresso perdido. A busca continua acontecendo — o que mudou é que ela
  deixou de ser a única fonte do primeiro quadro.
*/
export function useRequirementProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<ProgressMap>(() => progressoEmCache(userId) ?? {});
  /* Só há espera de verdade quando não se sabe nada ainda. */
  const [loading, setLoading] = useState(() => progressoEmCache(userId) === undefined);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const prog = await fetchRequirementProgress(userId);
    setProgress(prog);
    return prog;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const emCache = progressoEmCache(userId);
    if (emCache) setProgress(emCache);   // troca de conta na mesma aba
    setLoading(emCache === undefined);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  return { progress, loading, refresh };
}
