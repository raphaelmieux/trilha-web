import { useState } from 'react';
import BrandMark from '../components/ui/BrandMark';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { traduzirErroDeAuth } from '../lib/authErrors';
import { ShieldCheck } from 'lucide-react';

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

        {/*
          Conferir um certificado nunca exigiu conta — mas o único caminho até a
          página era a barra de navegação, que não existe antes de entrar. Quem
          recebe um Token.Web() para conferir é justamente quem não tem conta:
          o diretor do clube, a secretaria da associação, quem vê o certificado
          impresso. Fazer essa pessoa se cadastrar para verificar o documento de
          outra é o oposto do que a verificação serve para fazer.
        */}
        <div className="card mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-soft)' }}>Recebeu um Token.Web()?</p>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Confira a autenticidade sem precisar de conta.</p>
          </div>
          <Link to="/verificar" className="btn-secondary whitespace-nowrap flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Verificar
          </Link>
        </div>
      </div>
    </div>
  );
}
