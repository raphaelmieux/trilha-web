import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ClubPicker, { type ClubeEscolhido } from '../components/ui/ClubPicker';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useBadges } from '../hooks/useBadges';
import { SECURITY_QUESTIONS, hashSecurityAnswer } from '../lib/securityQuestions';
import { User, Lock, Eye, EyeOff, Camera, Shield, Save, CheckCircle2, AlertCircle, Medal, KeyRound } from 'lucide-react';
import { mensagemDoErro } from '../lib/authErrors';
import AdminPage from './AdminPage';
import type { FormaDeNome } from '../types';

/* A união mora em types/index.ts, ao lado do CHECK que a sustenta. */
type PrivacyForm = FormaDeNome;

/*
  As guias da página, e por que a administração virou uma delas.

  A barra de menu tem largura, e cada item novo tira espaço de outro. Perfil e
  Admin eram dois itens da barra para duas telas que a mesma pessoa abre pelo
  mesmo motivo — cuidar da própria conta —, e a de Admin só existia para uma
  pessoa no clube inteiro. Juntando as duas numa página com guias, a barra
  ficou com espaço para o que é de todo mundo.

  A guia mora no **endereço**, e não só no estado: `/perfil` e `/perfil/admin`
  são dois endereços, então o botão voltar do navegador funciona, o link se
  compartilha, e quem tinha `/admin` nos favoritos continua chegando (a rota
  antiga redireciona). Guia guardada só em `useState` perde tudo isso sem
  avisar.
*/
const GUIA_DA_ADMINISTRACAO = 'admin';

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { badges, loading: badgesLoading } = useBadges(profile?.id);

  const [displayName, setDisplayName] = useState('');
  const [clube, setClube] = useState<ClubeEscolhido>({ nome: '', codigo: null, cidade: null, associacao: null });
  const [unit, setUnit] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyForm>('full');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [showClub, setShowClub] = useState(false);
  const [savingLeaderboard, setSavingLeaderboard] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0].code);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securitySaved, setSecuritySaved] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setClube({ nome: profile.club || '', codigo: profile.club_code ?? null, cidade: profile.club_city ?? null, associacao: profile.club_association ?? null });
      setUnit(profile.unit || '');
      setPrivacy(profile.public_name_form || 'full');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    /* A consulta pode voltar depois de a página sair — trocar de guia ou de
       tela desmonta com ela no ar, e escrever estado em componente morto é
       desperdício no navegador e erro onde o ambiente já foi desmontado. É a
       mesma guarda do painel de administração, que vive na guia ao lado. */
    let vivo = true;
    (async () => {
      const { data } = await supabase
        .from('privacy_preferences')
        .select('show_on_leaderboard, show_club_publicly')
        .eq('user_id', profile.id)
        .maybeSingle();
      if (!vivo) return;
      setShowOnLeaderboard(data?.show_on_leaderboard || false);
      setShowClub(data?.show_club_publicly || false);
    })();
    return () => { vivo = false; };
  }, [profile]);

  if (!profile) return null;

  const handleToggleClub = async (value: boolean) => {
    setSavingLeaderboard(true);
    setShowClub(value);
    await supabase
      .from('privacy_preferences')
      .upsert({ user_id: profile.id, show_club_publicly: value }, { onConflict: 'user_id' });
    setSavingLeaderboard(false);
  };

  const handleToggleLeaderboard = async (value: boolean) => {
    setSavingLeaderboard(true);
    setShowOnLeaderboard(value);
    await supabase
      .from('privacy_preferences')
      .upsert({ user_id: profile.id, show_on_leaderboard: value }, { onConflict: 'user_id' });
    setSavingLeaderboard(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('A imagem deve ter no máximo 5MB.'); return; }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError('');
    setProfileSaved(false);

    try {
      let finalAvatarUrl = profile.avatar_url || null;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${profile.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
          club: clube.nome || null,
          club_code: clube.codigo,
          club_city: clube.cidade,
          club_association: clube.associacao,
          unit: unit || null,
          public_name_form: privacy,
          avatar_url: finalAvatarUrl,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setError(mensagemDoErro(err) || 'Erro ao salvar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSavingPassword(true);
    setError('');
    setPasswordSaved(false);

    if (newPassword.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setSavingPassword(false); return; }
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); setSavingPassword(false); return; }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setError(mensagemDoErro(err) || 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveSecurityQuestion = async () => {
    setSavingSecurity(true);
    setError('');
    setSecuritySaved(false);

    if (securityAnswer.trim().length < 2) {
      setError('Digite uma resposta para a pergunta de segurança.');
      setSavingSecurity(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          security_question_code: securityQuestion,
          security_answer_hash: await hashSecurityAnswer(securityAnswer),
        })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setSecurityAnswer('');
      setSecuritySaved(true);
      setTimeout(() => setSecuritySaved(false), 3000);
    } catch (err) {
      setError(mensagemDoErro(err) || 'Erro ao salvar pergunta de segurança.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const privacyOptions: { value: PrivacyForm; label: string; desc: string }[] = [
    { value: 'full', label: 'Nome completo', desc: 'Mostra seu nome inteiro no certificado e relatório' },
    { value: 'first', label: 'Apenas primeiro nome', desc: 'Mostra apenas o primeiro nome' },
    { value: 'initials', label: 'Iniciais', desc: 'Mostra apenas as iniciais (ex: JP)' },
    { value: 'anonymous', label: 'Anônimo', desc: 'Não mostra o nome — apenas "Anônimo"' },
  ];

  const naAdministracao = location.pathname.endsWith(`/${GUIA_DA_ADMINISTRACAO}`);
  /* A guia só existe para quem é administrador. Quem não é e digitar o
     endereço continua caindo no aviso de acesso restrito do próprio painel —
     a guia sumir da tela não é o que protege nada; quem protege é a RLS. */
  const guias = [
    { para: '/perfil', rotulo: 'Perfil', icone: User, ativa: !naAdministracao },
    ...(profile?.is_admin
      ? [{ para: `/perfil/${GUIA_DA_ADMINISTRACAO}`, rotulo: 'Administração', icone: Shield, ativa: naAdministracao }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Meu Perfil
        </h1>
      </div>

      {/* Uma guia só não é guia: com uma opção, a fileira vira enfeite que
          ocupa altura e não decide nada. Ela aparece quando há para onde ir. */}
      {guias.length > 1 && (
        <div className="flex gap-1 flex-wrap" role="tablist" aria-label="Seções do perfil"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          {guias.map(({ para, rotulo, icone: Icone, ativa }) => (
            <Link
              key={para}
              to={para}
              role="tab"
              aria-selected={ativa}
              className="text-sm font-medium flex items-center gap-1.5 px-3 py-2 transition-colors"
              style={{
                color: ativa ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: `2px solid ${ativa ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              <Icone className="w-4 h-4" /> {rotulo}
            </Link>
          ))}
        </div>
      )}

      {naAdministracao ? <AdminPage /> : <>

      {error && (
        <div className="card p-4 flex items-center gap-2" style={{ borderColor: 'var(--color-error-a20)', backgroundColor: 'var(--color-error-a10)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
          <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {/* Avatar + personal info */}
      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Dados Pessoais
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid var(--color-border)' }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                <User className="w-10 h-10" style={{ color: 'var(--color-text-faint)' }} />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)' }}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Foto de perfil</p>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Clique na câmera para enviar. JPG ou PNG, até 5MB.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Nome completo</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>E-mail</label>
            <input value={profile.email || ''} disabled className="input-field opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Clube (opcional)</label>
            <ClubPicker valor={clube} onChange={setClube} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Unidade (opcional)</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} className="input-field" placeholder="Nome da unidade" />
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary mt-4">
          <Save className="w-4 h-4 mr-1" /> {savingProfile ? 'Salvando...' : 'Salvar Dados'}
        </button>
        {profileSaved && (
          <span className="ml-3 text-sm inline-flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
            <CheckCircle2 className="w-4 h-4" /> Perfil atualizado!
          </span>
        )}
      </div>

      {/* Password change */}
      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Alterar Senha
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Nova senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5" style={{ color: 'var(--color-text-faint)' }} />
              <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                className="input-field pl-10 pr-10" placeholder="Mínimo 6 caracteres" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5" style={{ color: 'var(--color-text-faint)' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Confirmar senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5" style={{ color: 'var(--color-text-faint)' }} />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6}
                className="input-field pl-10" placeholder="Repita a nova senha" />
            </div>
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={savingPassword} className="btn-primary mt-4">
          <Lock className="w-4 h-4 mr-1" /> {savingPassword ? 'Alterando...' : 'Alterar Senha'}
        </button>
        {passwordSaved && (
          <span className="ml-3 text-sm inline-flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
            <CheckCircle2 className="w-4 h-4" /> Senha alterada com sucesso!
          </span>
        )}
      </div>

      {/* Security question */}
      <div className="card p-6">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Pergunta de Segurança
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Usada para redefinir sua senha sozinho(a) em <strong style={{ color: 'var(--color-text)' }}>Esqueci minha senha</strong>,
          sem depender de um administrador. Preencher de novo substitui a pergunta/resposta atual.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Pergunta</label>
            <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="input-field">
              {SECURITY_QUESTIONS.map(q => <option key={q.code} value={q.code}>{q.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Resposta</label>
            <input value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="input-field" placeholder="Digite para definir ou atualizar" />
          </div>
        </div>
        <button onClick={handleSaveSecurityQuestion} disabled={savingSecurity} className="btn-primary mt-4">
          <Save className="w-4 h-4 mr-1" /> {savingSecurity ? 'Salvando...' : 'Salvar Pergunta de Segurança'}
        </button>
        {securitySaved && (
          <span className="ml-3 text-sm inline-flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
            <CheckCircle2 className="w-4 h-4" /> Pergunta de segurança salva!
          </span>
        )}
      </div>

      {/* Privacy */}
      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Privacidade
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Como o seu nome deve aparecer em certificados e relatórios visíveis publicamente?
        </p>
        <div className="space-y-2">
          {privacyOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPrivacy(opt.value)}
              className="w-full text-left p-3 rounded-lg border-2 transition"
              style={{
                borderColor: privacy === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: privacy === opt.value ? 'var(--color-primary-a10)' : 'var(--color-bg-input)',
              }}
            >
              <p className="font-medium text-sm" style={{ color: privacy === opt.value ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{opt.desc}</p>
            </button>
          ))}
        </div>
        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary mt-4">
          <Save className="w-4 h-4 mr-1" /> Salvar Preferências
        </button>

        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Aparecer no ranking</p>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                Mostra seu nome (respeitando a opção acima), XP e conquistas na página de Ranking. Desativado por padrão.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showOnLeaderboard}
              disabled={savingLeaderboard}
              onChange={e => handleToggleLeaderboard(e.target.checked)}
              className="w-5 h-5 flex-shrink-0"
              style={{ accentColor: 'var(--color-primary)' }}
            />
          </label>

          {/* Recuado e só habilitado com o ranking ligado: fora dele a opção não
              tem efeito nenhum, e um controle que não faz nada confunde. */}
          <label
            className="flex items-center justify-between gap-4 mt-4 pl-4 cursor-pointer"
            style={{ borderLeft: '2px solid var(--color-border)', opacity: showOnLeaderboard ? 1 : 0.5 }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Mostrar meu clube no ranking</p>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                Exibe o nome do clube e a cidade ao lado do seu nome na lista.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showClub}
              disabled={savingLeaderboard || !showOnLeaderboard}
              onChange={e => handleToggleClub(e.target.checked)}
              className="w-5 h-5 flex-shrink-0"
              style={{ accentColor: 'var(--color-primary)' }}
            />
          </label>
        </div>
      </div>

      {/*
        As conquistas ficam na Estante, e aqui só o caminho até ela.

        Esta seção listava as insígnias em tamanho grande, e virou a terceira
        cópia da mesma coisa no dia em que a Estante nasceu — painel, perfil e
        estante desenhando as mesmas medalhas. Três cópias divergem no primeiro
        ajuste, e ninguém procura troféu dentro de um formulário de conta: o
        perfil é onde se troca a senha e se escolhe como o nome sai no
        certificado.

        O que fica é o número e a porta. Some o número de quem ainda não tem
        nenhuma seria esconder justamente de quem a estante deveria alcançar.
      */}
      <Link
        to="/estante"
        className="card p-6 flex items-center justify-between gap-3 transition hover:opacity-80"
      >
        <span className="font-bold flex items-center gap-2">
          <Medal className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} /> Minhas Conquistas
        </span>
        <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          {badgesLoading
            ? 'contando...'
            : badges.length === 0
              ? 'ver a estante'
              : `${badges.length} na estante`}
        </span>
      </Link>

      {/* Session info */}
      <div className="card p-4" style={{ backgroundColor: 'var(--color-bg-input)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          Sessão ativa
        </p>
        <button
          onClick={async () => { await signOut(); navigate('/login'); }}
          className="text-sm mt-2 transition-colors"
          style={{ color: 'var(--color-error)' }}
        >
          Encerrar sessão e sair
        </button>
      </div>

      </>}
    </div>
  );
}
