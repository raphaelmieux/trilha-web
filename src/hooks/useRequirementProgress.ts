import { useCallback, useEffect, useState } from 'react';
import { fetchRequirementProgress, type ProgressMap } from '../lib/progress';

// Wraps the repeated "fetch this user's requirement progress on mount / when the
// user changes" pattern shared by Dashboard, Specialty, Lesson, Report and the
// final exam — was previously copy-pasted useEffect blocks in each of those pages.
export function useRequirementProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const prog = await fetchRequirementProgress(userId);
    setProgress(prog);
    return prog;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  return { progress, loading, refresh };
}
