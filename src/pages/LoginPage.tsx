import { useState } from 'react';
import BrandMark from '../components/ui/BrandMark';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { traduzirErroDeAuth } from '../lib/authErrors';

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
      setError(traduzirErroDeAuth(signInError.message));
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/*
          Só a marca. O subtítulo dizia "Plataforma de aprendizado de Internet",
          o que deixa de ser verdade assim que outras especialidades entrarem na
          plataforma — e a bússola competia com um logotipo que já se explica.
        */}
        <div className="text-center mb-8">
          <h1 style={{ color: 'var(--color-text)' }}><BrandMark tamanho="entrada" /></h1>
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
