import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { umDe, NIVEIS_DA_INSIGNIA } from '../types';
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
        tier: umDe(NIVEIS_DA_INSIGNIA, row.badges.tier, 'bronze'),
      })));
      setLoading(false);
    })();
  }, [userId]);

  return { badges, loading };
}
