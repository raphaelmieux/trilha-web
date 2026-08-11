import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Certification } from '../types';

// A user has at most two active certifications (fundamental, advanced), so fetching
// all of them once and filtering client-side (via getByLevel) is simpler than a
// second "single cert by level" query — replaces that duplicated query in
// SpecialtyPage and FinalExam as well as the "all certs" query in Dashboard/Report.
export function useCertifications(userId: string | undefined) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('certifications').select('*').eq('user_id', userId);
    setCertifications((data as Certification[]) || []);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  const getByLevel = useCallback(
    (level: 'fundamental' | 'advanced') => certifications.find(c => c.level === level && c.status === 'active'),
    [certifications]
  );

  return { certifications, loading, refresh, getByLevel };
}
