import { useCallback, useEffect, useState } from 'react';
import { fetchLicoesConcluidas } from '../lib/progress';

/**
 * As lições que a pessoa concluiu de fato, pelo código.
 *
 * Separado do progresso por requisito porque responde a outra pergunta: aquele
 * diz o quanto da trilha está cumprido, este diz por onde a pessoa passou. Eram
 * a mesma coisa enquanto cada requisito pertencia a uma lição só — e deixaram de
 * ser no dia em que uma lição teórica e um laboratório passaram a cobrir o mesmo
 * requisito. Ver statusDasLicoes, em progress.ts.
 */
export function useLicoesConcluidas(userId: string | undefined) {
  const [licoesFeitas, setLicoesFeitas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLicoesFeitas(await fetchLicoesConcluidas(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  return { licoesFeitas, loading, refresh };
}
