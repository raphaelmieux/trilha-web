import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { classeCanonica, NIVEIS_DA_INSIGNIA } from '../lib/nivelDaInsignia';
import { umDe } from '../types';
import type { ContextoDaConquista, InsigniaConquistada } from '../lib/conquista';

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<InsigniaConquistada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    /* A consulta pode voltar depois de a tela sair. Escrever estado em
       componente desmontado é desperdício no navegador e erro num ambiente já
       desmontado — ver `useMontado`, que conta a história inteira. */
    let vivo = true;
    (async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('awarded_at, context, badges(id, code, name, description, icon, tier)')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });
      if (!vivo) return;
      /* `badge_id` é NOT NULL, então a junção sempre traz a insígnia — o
         `.filter(Boolean)` que havia aqui defendia de um caso que o schema já
         impede. O que o banco realmente não garante no tipo é o `tier`. */
      setBadges((data ?? []).map(row => ({
        ...row.badges,
        /*
          A data já vinha, e era jogada fora.

          `awarded_at` era selecionado desde sempre e descartado no `map` —
          a tela tinha a data da conquista em mãos e não a mostrava em lugar
          nenhum. O `context` é a outra metade: `jsonb` com o que estava
          acontecendo na hora, gravado por `evaluateBadges`. Quem conquistou
          antes disto existir tem `{}`, e a tela cala sobre o que não sabe em
          vez de inventar.
        */
        conquistadaEm: row.awarded_at,
        contexto: (row.context ?? {}) as ContextoDaConquista,
        /* `classeCanonica` traduz o vocabulário antigo antes de `umDe` olhar:
           o banco ainda pode responder 'bronze' durante a janela em que o
           `supabase.yml` e o frontend correm em paralelo, e sem isso toda
           insígnia de todo mundo viraria Amigo por alguns minutos. O padrão
           continua caindo para a classe que reivindica menos. */
        tier: umDe(NIVEIS_DA_INSIGNIA, classeCanonica(row.badges.tier) ?? '', 'amigo'),
      })));
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [userId]);

  return { badges, loading };
}
