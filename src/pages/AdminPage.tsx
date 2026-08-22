import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Award, CalendarDays, AlertCircle, KeyRound, Copy, X } from 'lucide-react';
import { getOpenSpecialties } from '../curriculum';
import { nomeCompleto } from '../types';

/* O que a contagem por trilha devolve. Só números e datas — ver a migration
   20260822040000_contagem_de_certificados.sql. */
interface ContagemDeCertificados {
  curriculum_code: string;
  emitidos: number;
  ativos: number;
  revogados: number;
  primeiro: string | null;
  ultimo: string | null;
}

export default function AdminPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, events: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [revokeCode, setRevokeCode] = useState('');
  const [revokeMsg, setRevokeMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<{ email: string; password?: string; error?: string; loading?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [certificados, setCertificados] = useState<ContagemDeCertificados[]>([]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    (async () => {
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: eventCount } = await supabase.from('activity_events').select('*', { count: 'exact', head: true });
      setStats({ users: userCount || 0, events: eventCount || 0 });

      const { data: usersData } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).limit(50);
      setUsers(usersData || []);

      const { data: contagem } = await supabase.rpc('admin_certificate_counts');
      setCertificados((contagem as ContagemDeCertificados[] | null) || []);

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

  /*
    Revogar exige saber qual código. A administração não lista mais os
    certificados emitidos: um Token.Web() é documento pessoal, e poder consertar
    um erro não exige poder folhear os documentos de todo o clube.
  */
  const handleRevoke = async () => {
    setRevokeMsg(null);
    const code = revokeCode.trim();
    if (!code) return;
    const reason = prompt('Motivo da revogação (apenas por fraude técnica comprovada ou erro sistêmico):');
    if (!reason?.trim()) return;

    const { data, error } = await supabase.rpc('admin_revoke_certificate', {
      p_code: code, p_reason: reason.trim(),
    });
    if (error) {
      setRevokeMsg({ ok: false, texto: error.message });
      return;
    }
    const linha = (data as { code: string }[] | null)?.[0];
    setRevokeMsg(linha
      ? { ok: true, texto: `Token ${linha.code} revogado.` }
      /* Não diz se o código existe: um código inexistente e um já revogado
         devolvem a mesma frase, para a tela não virar um detector de códigos. */
      : { ok: false, texto: 'Nenhum Token.Web() ativo com esse código.' });
    if (linha) setRevokeCode('');
  };

  const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="text-left py-2" style={{ color: 'var(--color-text-dim)' }}>{children}</th>
  );
  const Tr = ({ children }: { children: React.ReactNode }) => (
    <tr style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>{children}</tr>
  );
  const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="py-2" style={{ color: 'var(--color-text)' }}>{children}</td>
  );

  /*
    Uma linha por trilha aberta, mais qualquer código que só exista no banco.

    A segunda parte cobre a trilha que saiu do ar depois de já ter certificado
    alguém: o documento continua valendo, e sumir da contagem seria perder o
    registro contábil justamente do que não pode mais ser reemitido.
  */
  const contagemPorCodigo = new Map(certificados.map(c => [c.curriculum_code, c]));
  const abertas = getOpenSpecialties();
  const porTrilha = [
    ...abertas.map(e => ({ code: e.code, nome: nomeCompleto(e), contagem: contagemPorCodigo.get(e.code) })),
    ...certificados
      .filter(c => !abertas.some(e => e.code === c.curriculum_code))
      .map(c => ({ code: c.curriculum_code, nome: c.curriculum_code, contagem: c })),
  ];
  const totalEmitidos = certificados.reduce((soma, c) => soma + c.emitidos, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Painel Administrativo
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <Users className="w-6 h-6 mb-2" style={{ color: 'var(--color-primary)' }} />
          <p className="text-2xl font-bold">{stats.users}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Usuários</p>
        </div>
        <div className="card p-4">
          <CalendarDays className="w-6 h-6 mb-2" style={{ color: 'var(--color-success)' }} />
          <p className="text-2xl font-bold">{stats.events}</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Eventos</p>
        </div>
      </div>

      {/*
        Certificados por trilha, para controle contábil.

        Só a contagem: a tabela de certificações deixou de ser legível pelo
        cliente de propósito, e listar quem recebeu o quê não é o que "quantos
        foram emitidos" pergunta. Revogar continua sendo pelo código, abaixo.

        As trilhas vêm do currículo, e não da resposta: uma trilha aberta que
        ainda não certificou ninguém precisa aparecer com zero — é justamente a
        linha que diz alguma coisa.
      */}
      <div className="card p-6">
        <h2 className="font-bold mb-1 flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} /> Certificados emitidos
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-dim)' }}>
          Total de {totalEmitidos} {totalEmitidos === 1 ? 'certificado' : 'certificados'} em todas as trilhas.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Th>Trilha</Th><Th>Emitidos</Th><Th>Ativos</Th><Th>Revogados</Th><Th>Último</Th>
            </tr></thead>
            <tbody>
              {porTrilha.map(({ code, nome, contagem }) => (
                <Tr key={code}>
                  <Td>{nome}</Td>
                  <Td>{contagem?.emitidos ?? 0}</Td>
                  <Td>{contagem?.ativos ?? 0}</Td>
                  <Td>
                    {contagem?.revogados
                      ? <span style={{ color: 'var(--color-error)' }}>{contagem.revogados}</span>
                      : 0}
                  </Td>
                  <Td>
                    {contagem?.ultimo
                      ? new Date(contagem.ultimo).toLocaleDateString('pt-BR')
                      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
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
        <h2 className="font-bold mb-1">Revogar um Token.Web()</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Os certificados emitidos não são listados aqui: cada Token.Web() é documento
          pessoal de quem o conquistou. Para invalidar um, informe o código —
          apenas em caso de fraude técnica comprovada ou erro sistêmico.
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={revokeCode}
            onChange={e => setRevokeCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRevoke()}
            className="input-field flex-1"
            style={{ minWidth: '16rem' }}
            placeholder="TW-XXXX-XXXX-XXXX-XXXX"
          />
          <button onClick={handleRevoke} disabled={!revokeCode.trim()} className="btn-primary">
            <Award className="w-4 h-4 mr-1" /> Revogar
          </button>
        </div>
        {revokeMsg && (
          <p className="text-sm mt-3" role="status"
             style={{ color: revokeMsg.ok ? 'var(--color-success)' : 'var(--color-primary)' }}>
            {revokeMsg.texto}
          </p>
        )}
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
