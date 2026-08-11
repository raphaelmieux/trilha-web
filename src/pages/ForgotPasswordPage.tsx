import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Copy } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNewPassword('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password-direct`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao recuperar senha.');
        setLoading(false);
        return;
      }

      setNewPassword(data.password);
      setLoading(false);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Trilha.Web()</h1>
          </div>
          <p style={{ color: 'var(--color-text-dim)' }}>Recuperação de senha</p>
        </div>

        <div className="card">
          {newPassword ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
              <h2 className="text-xl font-bold mb-2">Senha redefinida!</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Sua nova senha foi gerada para <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
                Anote-a e use para entrar. Você poderá alterá-la depois se quiser.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <KeyRound className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                <code className="text-lg font-mono font-bold flex-1 text-left" style={{ color: 'var(--color-text)' }}>{newPassword}</code>
                <button onClick={copyPassword} className="btn-secondary text-xs px-2 py-1">
                  <Copy className="w-3 h-3" /> {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <Link to="/login" className="btn-primary">Ir para o login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Esqueceu sua senha?</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Digite seu e-mail e geraremos uma nova senha para você imediatamente.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3.5" style={{ color: 'var(--color-text-faint)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="input-field pl-10" placeholder="seu@email.com" />
                  </div>
                </div>
                {error && (
                  <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                    <AlertCircle className="w-4 h-4" /> {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Gerando nova senha...' : 'Gerar nova senha'}
                </button>
              </form>
              <Link to="/login" className="text-sm mt-4 flex items-center gap-1 justify-center" style={{ color: 'var(--color-text-dim)' }}>
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
