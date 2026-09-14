import { useCallback, useEffect, useState } from 'react';
import { fetchLicoesConcluidas } from '../lib/progress';
import { useMontado } from './useMontado';

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

  const montado = useMontado();

  const refresh = useCallback(async () => {
    if (!userId) return;
    /* A busca em duas linhas, e não `setLicoesFeitas(await ...)`: escrever a
       espera dentro do setter não deixa onde conferir se a tela ainda existe. */
    const feitas = await fetchLicoesConcluidas(userId);
    if (!montado.current) return;
    setLicoesFeitas(feitas);
  }, [userId, montado]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    refresh().finally(() => { if (montado.current) setLoading(false); });
  }, [userId, refresh, montado]);

  return { licoesFeitas, loading, refresh };
}
