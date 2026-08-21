import { useState } from 'react';
import BrandMark from '../components/ui/BrandMark';
import { useNavigate, Link } from 'react-router-dom';
import ClubPicker, { type ClubeEscolhido } from '../components/ui/ClubPicker';
import { supabase } from '../lib/supabase';
import { SECURITY_QUESTIONS, hashSecurityAnswer } from '../lib/securityQuestions';
import { traduzirErroDeAuth } from '../lib/authErrors';
import CompletarPerfil from '../components/CompletarPerfil';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [clube, setClube] = useState<ClubeEscolhido>({ nome: '', codigo: null, cidade: null, associacao: null });
  const [unit, setUnit] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0].code);
  const [securityAnswer, setSecurityAnswer] = useState('');
  /* Desmarcado por padrão: aparecer publicamente é escolha ativa, não algo
     que se ganha por não ter reparado num campo. */
  const [noRanking, setNoRanking] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  /*
    A conta recém-criada, quando a primeira etapa termina. Enquanto for nula a
    tela mostra o formulário; preenchida, mostra a etapa do perfil. Guardar o
    id aqui evita depender do contexto de autenticação ter se atualizado.
  */
  const [contaCriada, setContaCriada] = useState<{ id: string; display_name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAviso('');
    setLoading(true);

    /*
      Os dados do perfil viajam junto com o cadastro, e quem os grava é o
      gatilho on_auth_user_created, no banco.

      Antes havia um INSERT em user_profiles logo abaixo desta chamada, feito
      pelo navegador. Só funcionava quando o signUp já devolvia sessão; com a
      confirmação de e-mail ligada ele não devolve, o cliente seguia como
      anônimo, e a policy insert_own_profile barrava a gravação — nascia uma
      conta sem perfil. Gravando no gatilho, o perfil nasce na mesma transação
      da conta, com ou sem confirmação de e-mail.
    */
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          club: clube.nome || null,
          club_code: clube.codigo,
          club_city: clube.cidade,
          club_association: clube.associacao,
          unit: unit || null,
          terms_version: '1.0',
          security_question_code: securityQuestion,
          security_answer_hash: await hashSecurityAnswer(securityAnswer),
          /* Lidos pelo gatilho on_auth_user_created, que cria a linha de
             privacidade junto com a conta. O clube acompanha a escolha do
             ranking: aparecer sem dizer de onde se é não ajuda ninguém a
             encontrar o próprio clube na lista. */
          show_on_leaderboard: noRanking,
          show_club_publicly: noRanking,
        },
      },
    });

    if (signUpError || !data.user) {
      setError(traduzirErroDeAuth(signUpError?.message));
      setLoading(false);
      return;
    }

    /*
      Sem sessão o cadastro exige confirmação por e-mail. A conta e o perfil já
      existem; o que falta é a pessoa clicar no link. Dizer isso é melhor do que
      mandá-la para uma tela protegida que vai devolvê-la para o login.
    */
    if (!data.session) {
      setAviso(
        'Conta criada. Falta confirmar o e-mail: procure a mensagem que '
        + 'enviamos para ' + email + ', inclusive na caixa de spam, e clique no '
        + 'link. Depois é só entrar.'
      );
      setLoading(false);
      return;
    }

    /*
      Segunda etapa, em vez de ir direto ao painel. Foto e forma de exibição do
      nome pedem uma sessão ativa — que só existe a partir daqui — e um
      formulário único com tudo faria muita gente desistir no meio.
    */
    setContaCriada({ id: data.user.id, display_name: displayName });
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
          {contaCriada ? (
            <CompletarPerfil perfil={contaCriada} aoConcluir={() => navigate('/')} />
          ) : (
          <>
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
            <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <label className="flex items-start justify-between gap-3 cursor-pointer">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-soft)' }}>
                    Aparecer no ranking
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                    Mostra seu nome, clube, XP e conquistas na página de Ranking.
                    Pode mudar quando quiser em Perfil → Privacidade.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={noRanking}
                  onChange={e => setNoRanking(e.target.checked)}
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
              </label>
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{error}</p>}
            {aviso && (
              /* Verde, não vermelho: a conta foi criada. Só falta um passo. */
              <p className="text-sm" style={{ color: 'var(--color-success)' }} role="status">{aviso}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          <p className="text-sm mt-4 text-center" style={{ color: 'var(--color-text-dim)' }}>
            Já tem conta? <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>Entrar</Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
