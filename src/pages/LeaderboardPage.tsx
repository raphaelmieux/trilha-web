import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getPublicName, type LeaderboardEntry } from '../types';
import { LoadingState, EmptyState } from '../components/ui/PageState';
import { Trophy, Flame, Award, Medal } from 'lucide-react';

const RANK_COLORS = ['var(--color-secondary)', '#b0b0b4', '#c17f45'];

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('public_leaderboard')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);
      setEntries((data as LeaderboardEntry[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} /> Ranking
        </h1>
        <p style={{ color: 'var(--color-text-dim)' }}>
          Desbravadores que optaram por aparecer publicamente, ordenados por XP.
        </p>
      </div>

      <div className="card p-4 text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--color-tertiary-a05)', borderColor: 'var(--color-tertiary-a20)' }}>
        <Award className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-tertiary-light)' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>
          O ranking é opcional. Ative "Aparecer no ranking" em{' '}
          <span style={{ color: 'var(--color-text)' }}>Perfil → Privacidade</span> para participar.
          {profile && <> Você está {entries.some(e => e.id === profile.id) ? 'participando' : 'fora do ranking'}.</>}
        </p>
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingState />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-border-hover)' }} />}
            title="Ninguém no ranking ainda"
            description="Seja o primeiro a ativar o ranking no seu perfil!"
          />
        ) : (
          <ol className="space-y-2">
            {entries.map((entry, idx) => {
              const isMe = profile?.id === entry.id;
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: isMe ? 'var(--color-primary-a08)' : 'var(--color-bg-input)',
                    border: `1px solid ${isMe ? 'var(--color-primary-a30)' : 'var(--color-border)'}`,
                  }}
                >
                  <div className="w-8 text-center font-bold flex-shrink-0" style={{ color: RANK_COLORS[idx] || 'var(--color-text-faint)' }}>
                    {idx < 3 ? <Medal className="w-5 h-5 mx-auto" /> : idx + 1}
                  </div>
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-hover)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {getPublicName(entry)}{isMe && ' (você)'}
                    </p>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {entry.best_streak}d</span>
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {entry.badge_count} conquistas</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>{entry.total_xp}</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--color-text-dim)' }}>XP</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
