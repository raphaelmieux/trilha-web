import { useState } from 'react';
import BrandMark from '../components/ui/BrandMark';
import { Link, useNavigate } from 'react-router-dom';
import { SECURITY_QUESTIONS, hashSecurityAnswer } from '../lib/securityQuestions';
import { Compass, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, MessageCircleQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [questionCode, setQuestionCode] = useState(SECURITY_QUESTIONS[0].code);
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      const answerHash = await hashSecurityAnswer(answer);
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/self-reset-password`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, questionCode, answerHash, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível redefinir a senha.');
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <h1 style={{ color: 'var(--color-primary)' }}><BrandMark tamanho="hero" /></h1>
          </div>
          <p style={{ color: 'var(--color-text-dim)' }}>Recuperação de senha</p>
        </div>

        <div className="card">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
              <h2 className="text-xl font-bold mb-2">Senha redefinida!</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Sua nova senha já está ativa. Você pode entrar agora.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary">Ir para o login</button>
            </div>
          ) : (
            <>
              <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
              <h2 className="text-xl font-bold mb-1 text-center">Esqueceu sua senha?</h2>
              <p className="text-sm mb-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                Responda sua pergunta de segurança para definir uma nova senha.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Pergunta de segurança</label>
                  <select value={questionCode} onChange={e => setQuestionCode(e.target.value)} className="input-field">
                    {SECURITY_QUESTIONS.map(q => <option key={q.code} value={q.code}>{q.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Sua resposta</label>
                  <input value={answer} onChange={e => setAnswer(e.target.value)} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Nova senha</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="input-field" placeholder="Mínimo 6 caracteres" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Confirmar nova senha</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="input-field" />
                </div>
                {error && (
                  <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                    <AlertCircle className="w-4 h-4" /> {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </form>

              <div className="flex items-start gap-2 p-3 rounded-lg mt-4 text-sm" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <MessageCircleQuestion className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Não configurou uma pergunta de segurança ou não lembra a resposta? Peça para o
                  administrador do seu clube redefinir sua senha (aba <strong style={{ color: 'var(--color-text)' }}>Admin</strong>).
                </p>
              </div>

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
