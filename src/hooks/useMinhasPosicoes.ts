import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LEADERBOARD_PERIODS, type LeaderboardPeriod } from '../types';

export interface PosicaoNoRanking {
  periodo: LeaderboardPeriod;
  rotulo: string;
  /** A colocação, contada de 1. Nula quando não se pontuou na janela. */
  posicao: number | null;
  /** Quantas pessoas há na janela — "3º de 12" diz mais do que "3º". */
  total: number;
}

/**
 * Em que lugar a pessoa está em cada uma das quatro janelas do ranking.
 *
 * A função `leaderboard` já devolve tudo ordenado, e a posição é o lugar da
 * linha — contar aqui evita uma segunda regra de ordenação, que é como duas
 * telas passam a discordar sobre quem está em primeiro.
 *
 * Nada é buscado para quem não entrou no ranking: sem `show_on_leaderboard` a
 * pessoa não aparece na listagem, e quatro consultas devolveriam quatro vezes
 * "não está lá".
 */
export function useMinhasPosicoes(userId: string | undefined, participando: boolean) {
  const [posicoes, setPosicoes] = useState<PosicaoNoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !participando) { setPosicoes([]); setLoading(false); return; }
    let ativo = true;
    setLoading(true);

    (async () => {
      const resultados = await Promise.all(
        LEADERBOARD_PERIODS.map(async ({ value, label }): Promise<PosicaoNoRanking> => {
          const { data } = await supabase.rpc('leaderboard', { p_periodo: value });
          const linhas = (data as { id: string }[] | null) ?? [];
          const i = linhas.findIndex(l => l.id === userId);
          return { periodo: value, rotulo: label, posicao: i < 0 ? null : i + 1, total: linhas.length };
        }),
      );
      if (!ativo) return;
      setPosicoes(resultados);
      setLoading(false);
    })();

    return () => { ativo = false; };
  }, [userId, participando]);

  return { posicoes, loading };
}
