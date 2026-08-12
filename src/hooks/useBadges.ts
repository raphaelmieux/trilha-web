import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
      setBadges((data || []).map((row: any) => row.badges).filter(Boolean));
      setLoading(false);
    })();
  }, [userId]);

  return { badges, loading };
}
