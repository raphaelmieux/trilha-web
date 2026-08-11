import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Award, Settings, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, certifications: 0, events: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);

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
              <Th>Nome</Th><Th>E-mail</Th><Th>Clube</Th><Th>Admin</Th><Th>Criado em</Th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <td className="py-2" style={{ color: 'var(--color-text)' }}>{u.display_name}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.club || '-'}</td>
                  <td className="py-2" style={{ color: 'var(--color-text-muted)' }}>{u.is_admin ? 'Sim' : 'Não'}</td>
                  <td className="py-2 text-xs" style={{ color: 'var(--color-text-faint)' }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
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
    </div>
  );
}
