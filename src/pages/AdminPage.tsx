import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Award, Settings, AlertCircle, KeyRound, Copy, X } from 'lucide-react';

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, certifications: 0, events: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [resetTarget, setResetTarget] = useState<{ email: string; password?: string; error?: string; loading?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.is_admin) return;
    (async () => {
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: certCount } = await supabase.from('certifications').select('*', { count: 'exact', head: true });
      const { count: eventCount } = await supabase.from('activity_events').select('*', { count: 'exact', head: true });
      setStats({ users: userCount || 0, certifications: certCount || 0, events: eventCount || 0 });

      const { data: usersData } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).limit(50);
      setUsers(usersData || []);

      const { data: certsData } = await supabase.from('certifications').select('*, user_profiles(display_name, email)').order('issued_at', { ascending: false }).limit(20);
      setCerts(certsData || []);
    })();
  }, [profile]);

  if (!profile?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-border-hover)' }} />
        <h1 className="text-xl font-bold mb-2">Acesso Restrito</h1>
        <p style={{ color: 'var(--color-text-dim)' }}>Esta área é exclusiva para administradores.</p>
        <div className="mt-6 card p-4 text-left text-sm" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-tertiary-a20)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-tertiary-light)' }}>Como definir o primeiro administrador:</p>
          <p style={{ color: 'var(--color-text-muted)' }}>Após criar sua conta, execute no console SQL do Supabase:</p>
          <code className="block p-2 rounded mt-1 text-xs" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-secondary)' }}>SELECT promote_first_admin('seu@email.com');</code>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (email: string) => {
    setResetTarget({ email, loading: true });
    setCopied(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetTarget({ email, error: data.error || 'Erro ao redefinir senha.' });
        return;
      }
      setResetTarget({ email, password: data.password });
    } catch {
      setResetTarget({ email, error: 'Erro de conexão. Tente novamente.' });
    }
  };

  const copyPassword = () => {
    if (!resetTarget?.password) return;
    navigator.clipboard.writeText(resetTarget.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (certId: string) => {
    const reason = prompt('Motivo da revogação (apenas por fraude técnica comprovada ou erro sistêmico):');
    if (!reason) return;
    await supabase.from('certifications').update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revocation_reason: reason,
    }).eq('id', certId);
    const { data } = await supabase.from('certifications').select('*, user_profiles(display_name, email)').order('issued_at', { ascending: false }).limit(20);
    setCerts(data || []);
  };

  const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="text-left py-2" style={{ color: 'var(--color-text-dim)' }}>{children}</th>
  );
  const Tr = ({ children }: { children: React.ReactNode }) => (
    <tr style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>{children}</tr>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Painel Administrativo
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <Users className="w-6 h-6 mb-2" style={{ color: 'var(--color-primary)' }} />
          <p className="text-2xl font-bold">{stats.users}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Usuários</p>
        </div>
        <div className="card p-4">
          <Award className="w-6 h-6 mb-2" style={{ color: 'var(--color-secondary)' }} />
          <p className="text-2xl font-bold">{stats.certifications}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Certificações</p>
        </div>
        <div className="card p-4">
          <Settings className="w-6 h-6 mb-2" style={{ color: 'var(--color-success)' }} />
          <p className="text-2xl font-bold">{stats.events}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Eventos</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-3">Usuários</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Th>Nome</Th><Th>E-mail</Th><Th>Clube</Th><Th>Admin</Th><Th>Criado em</Th><Th>Ação</Th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <td className="py-2" style={{ color: 'var(--color-text)' }}>{u.display_name}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.club || '-'}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.is_admin ? 'Sim' : 'Não'}</td>
                  <td className="py-2 text-xs" style={{ color: 'var(--color-text-faint)' }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2">
                    <button onClick={() => handleResetPassword(u.email)} className="text-xs hover:underline flex items-center gap-1" style={{ color: 'var(--color-tertiary-light)' }}>
                      <KeyRound className="w-3 h-3" /> Redefinir senha
                    </button>
                  </td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-3">Certificações</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Th>Titular</Th><Th>Nível</Th><Th>Código</Th><Th>Status</Th><Th>Data</Th><Th>Ação</Th>
            </tr></thead>
            <tbody>
              {certs.map((c) => (
                <Tr key={c.id}>
                  <td className="py-2" style={{ color: 'var(--color-text)' }}>{c.user_profiles?.display_name || '-'}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{c.level}</td>
                  <td className="py-2 font-mono text-xs" style={{ color: 'var(--color-secondary)' }}>{c.code.substring(0, 16)}...</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: c.status === 'active' ? 'var(--color-success-a20)' : 'var(--color-error-a20)',
                        color: c.status === 'active' ? 'var(--color-success)' : 'var(--color-error)',
                      }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 text-xs" style={{ color: 'var(--color-text-faint)' }}>{new Date(c.issued_at).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2">
                    {c.status === 'active' && (
                      <button onClick={() => handleRevoke(c.id)} className="text-xs hover:underline" style={{ color: 'var(--color-primary)' }}>Revogar</button>
                    )}
                  </td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 max-w-sm w-full relative">
            <button onClick={() => setResetTarget(null)} className="absolute top-3 right-3" style={{ color: 'var(--color-text-faint)' }}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold mb-1">Redefinir senha</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{resetTarget.email}</p>
            {resetTarget.loading && <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Gerando nova senha...</p>}
            {resetTarget.error && (
              <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                <AlertCircle className="w-4 h-4" /> {resetTarget.error}
              </p>
            )}
            {resetTarget.password && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                  <KeyRound className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                  <code className="text-base font-mono font-bold flex-1" style={{ color: 'var(--color-text)' }}>{resetTarget.password}</code>
                  <button onClick={copyPassword} className="btn-secondary text-xs px-2 py-1">
                    <Copy className="w-3 h-3" /> {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  Repasse esta senha ao usuário por um canal confiável (pessoalmente, por exemplo).
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
