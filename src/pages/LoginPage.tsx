import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Compass } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Trilha.Web()</h1>
          </div>
          <p style={{ color: 'var(--color-text-dim)' }}>Plataforma de aprendizado de Internet</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span style={{ color: 'var(--color-text-dim)' }}>Não tem conta?</span>
            <Link to="/cadastro" className="font-medium" style={{ color: 'var(--color-primary)' }}>Cadastre-se</Link>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span style={{ color: 'var(--color-text-dim)' }}>Esqueceu a senha?</span>
            <Link to="/recuperar-senha" className="font-medium" style={{ color: 'var(--color-primary)' }}>Recuperar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
