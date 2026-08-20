import { useState } from 'react';
import BrandMark from '../components/ui/BrandMark';
import { useNavigate, Link } from 'react-router-dom';
import ClubPicker, { type ClubeEscolhido } from '../components/ui/ClubPicker';
import { supabase } from '../lib/supabase';
import { SECURITY_QUESTIONS, hashSecurityAnswer } from '../lib/securityQuestions';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [clube, setClube] = useState<ClubeEscolhido>({ nome: '', codigo: null, cidade: null, associacao: null });
  const [unit, setUnit] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0].code);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message || 'Erro ao cadastrar');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      email,
      display_name: displayName,
      club: clube.nome || null,
      club_code: clube.codigo,
      club_city: clube.cidade,
      club_association: clube.associacao,
      unit: unit || null,
      public_name_form: 'full',
      terms_version: '1.0',
      terms_accepted_at: new Date().toISOString(),
      security_question_code: securityQuestion,
      security_answer_hash: await hashSecurityAnswer(securityAnswer),
    });

    if (profileError) {
      setError('Conta criada, mas erro ao salvar perfil: ' + profileError.message);
      setLoading(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Mesma abertura da tela de entrada: só a marca. O que a tela faz
            está dito no cartão logo abaixo, então repeti-lo aqui era eco. */}
        <div className="text-center mb-8">
          <h1 style={{ color: 'var(--color-text)' }}><BrandMark tamanho="entrada" /></h1>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Cadastro</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Nome completo</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Clube (opcional)</label>
              <ClubPicker valor={clube} onChange={setClube} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Unidade (opcional)</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} className="input-field" />
            </div>
            <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-dim)' }}>
                Usado para redefinir sua senha sozinho(a), caso esqueça — guarde a resposta em local seguro.
              </p>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Pergunta de segurança</label>
              <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="input-field mb-3">
                {SECURITY_QUESTIONS.map(q => <option key={q.code} value={q.code}>{q.label}</option>)}
              </select>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Sua resposta</label>
              <input value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} required minLength={2} className="input-field" />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-text-dim)' }}>
            Já tem conta? <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
