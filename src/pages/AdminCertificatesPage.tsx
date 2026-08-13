import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toCsv, downloadCsv } from '../lib/csv';
import { LoadingState, EmptyState } from '../components/ui/PageState';
import StatusBadge from '../components/ui/StatusBadge';
import { Download, ArrowLeft, Search, Award, ShieldCheck } from 'lucide-react';

interface CertRow {
  code: string;
  level: 'fundamental' | 'advanced';
  status: 'active' | 'revoked';
  issued_at: string;
  curriculum_code: string;
  display_name: string;
  club: string | null;
  unit: string | null;
}

const TRACKS = [
  { value: 'all', label: 'Todas as trilhas' },
  { value: 'AP034', label: 'AP034 — Internet' },
  { value: 'AP035', label: 'AP035 — Internet, Avançado' },
];

function trackOf(row: CertRow): string {
  // curriculum_code is the source of truth, but older rows stored the curriculum
  // version code ("web-foundation") instead of the specialty code, so level is
  // used as the fallback.
  if (row.curriculum_code === 'AP034' || row.curriculum_code === 'AP035') return row.curriculum_code;
  return row.level === 'advanced' ? 'AP035' : 'AP034';
}

export default function AdminCertificatesPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('all');
  const [club, setClub] = useState('all');
  const [search, setSearch] = useState('');
  const [includeRevoked, setIncludeRevoked] = useState(false);

  useEffect(() => {
    if (!profile?.is_admin) return;
    (async () => {
      const { data } = await supabase
        .from('certifications')
        .select('code, level, status, issued_at, curriculum_code, user_profiles(display_name, club, unit)')
        .order('issued_at', { ascending: false });

      setRows((data || []).map((r: any) => ({
        code: r.code,
        level: r.level,
        status: r.status,
        issued_at: r.issued_at,
        curriculum_code: r.curriculum_code,
        display_name: r.user_profiles?.display_name || '—',
        club: r.user_profiles?.club || null,
        unit: r.user_profiles?.unit || null,
      })));
      setLoading(false);
    })();
  }, [profile]);

  const clubs = useMemo(() => {
    const set = new Set(rows.map(r => r.club).filter((c): c is string => !!c));
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => {
      if (!includeRevoked && r.status !== 'active') return false;
      if (track !== 'all' && trackOf(r) !== track) return false;
      if (club !== 'all' && (r.club || '') !== club) return false;
      if (term && !r.display_name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, track, club, search, includeRevoked]);

  if (!profile?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-border-hover)' }} />
        <h1 className="text-xl font-bold mb-2">Acesso Restrito</h1>
        <p style={{ color: 'var(--color-text-dim)' }}>Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  const handleExport = () => {
    const csv = toCsv(
      ['Nome', 'Clube', 'Unidade', 'Trilha', 'Nível', 'Código do Token', 'Emitido em', 'Situação'],
      filtered.map(r => [
        r.display_name,
        r.club || '',
        r.unit || '',
        trackOf(r),
        r.level === 'advanced' ? 'Avançado' : 'Fundamental',
        r.code,
        new Date(r.issued_at).toLocaleDateString('pt-BR'),
        r.status === 'active' ? 'Ativo' : 'Revogado',
      ]),
    );
    const scope = track === 'all' ? 'todas' : track;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`certificados-${scope}-${stamp}.csv`, csv);
  };

  const byTrack = (code: string) => rows.filter(r => r.status === 'active' && trackOf(r) === code).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} /> Certificados Emitidos
          </h1>
          <p style={{ color: 'var(--color-text-dim)' }}>
            Consulta e exportação para registro nos canais oficiais do clube.
          </p>
        </div>
        <Link to="/admin" className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Painel
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold">{rows.filter(r => r.status === 'active').length}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Certificados ativos</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{byTrack('AP034')}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>AP034 — Internet</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold">{byTrack('AP035')}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>AP035 — Avançado</p>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Trilha</label>
            <select value={track} onChange={e => setTrack(e.target.value)} className="input-field">
              {TRACKS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Clube</label>
            <select value={club} onChange={e => setClub(e.target.value)} className="input-field">
              <option value="all">Todos os clubes</option>
              {clubs.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Buscar por nome</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5" style={{ color: 'var(--color-text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Nome do desbravador" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
            <input
              type="checkbox"
              checked={includeRevoked}
              onChange={e => setIncludeRevoked(e.target.checked)}
              className="w-4 h-4"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            Incluir certificados revogados
          </label>
          <button onClick={handleExport} disabled={filtered.length === 0} className="btn-primary">
            <Download className="w-4 h-4 mr-1" />
            Exportar {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} (CSV)
          </button>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Award className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-border-hover)' }} />}
            title="Nenhum certificado encontrado"
            description="Ajuste os filtros ou aguarde a conclusão das trilhas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Nome', 'Clube', 'Unidade', 'Trilha', 'Emitido em', 'Situação'].map(h => (
                    <th key={h} className="text-left py-2 pr-4 whitespace-nowrap" style={{ color: 'var(--color-text-dim)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.code} style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--color-text)' }}>{r.display_name}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--color-text-muted)' }}>{r.club || '—'}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--color-text-muted)' }}>{r.unit || '—'}</td>
                    <td className="py-2 pr-4 whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{trackOf(r)}</td>
                    <td className="py-2 pr-4 text-xs whitespace-nowrap" style={{ color: 'var(--color-text-faint)' }}>
                      {new Date(r.issued_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge tone={r.status === 'active' ? 'success' : 'error'}>
                        {r.status === 'active' ? 'Ativo' : 'Revogado'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
