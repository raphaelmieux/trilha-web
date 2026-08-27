import { useEffect, useState } from 'react';
import { MINI_TRILHAS, topicosDaMiniTrilha } from '../curriculum/miniTrilhas';
import { buscarLeitura, progressoDasMiniTrilhas, miniTrilhasConcluidas } from '../lib/miniTrilhas';

export interface AndamentoDeMiniTrilha {
  id: string;
  lidos: number;
  total: number;
  concluida: boolean;
}

/**
 * Quanto de cada mini-trilha já foi lido.
 *
 * Uma consulta só, filtrada pelos dois tipos de evento — o painel não precisa
 * do histórico inteiro para desenhar duas barrinhas.
 */
export function useMiniTrilhas(userId: string | undefined) {
  const [andamento, setAndamento] = useState<AndamentoDeMiniTrilha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!userId) { setCarregando(false); return; }
    let cancelado = false;
    (async () => {
      const eventos = await buscarLeitura(userId);
      if (cancelado) return;
      const lidos = progressoDasMiniTrilhas(eventos);
      const prontas = new Set(miniTrilhasConcluidas(eventos));
      setAndamento(MINI_TRILHAS.map(t => ({
        id: t.id,
        lidos: lidos[t.id] ?? 0,
        total: topicosDaMiniTrilha(t).length,
        concluida: prontas.has(t.id),
      })));
      setCarregando(false);
    })();
    return () => { cancelado = true; };
  }, [userId]);

  return { andamento, carregando };
}
