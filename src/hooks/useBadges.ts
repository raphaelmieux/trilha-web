import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { classeCanonica, NIVEIS_DA_INSIGNIA } from '../lib/nivelDaInsignia';
import { umDe } from '../types';
import type { Badge } from '../types';

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('awarded_at, badges(id, code, name, description, icon, tier)')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });
      /* `badge_id` é NOT NULL, então a junção sempre traz a insígnia — o
         `.filter(Boolean)` que havia aqui defendia de um caso que o schema já
         impede. O que o banco realmente não garante no tipo é o `tier`. */
      setBadges((data ?? []).map(row => ({
        ...row.badges,
        /* `classeCanonica` traduz o vocabulário antigo antes de `umDe` olhar:
           o banco ainda pode responder 'bronze' durante a janela em que o
           `supabase.yml` e o frontend correm em paralelo, e sem isso toda
           insígnia de todo mundo viraria Amigo por alguns minutos. O padrão
           continua caindo para a classe que reivindica menos. */
        tier: umDe(NIVEIS_DA_INSIGNIA, classeCanonica(row.badges.tier) ?? '', 'amigo'),
      })));
      setLoading(false);
    })();
  }, [userId]);

  return { badges, loading };
}
