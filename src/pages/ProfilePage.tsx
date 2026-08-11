import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Lock, Eye, EyeOff, Camera, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';

type PrivacyForm = 'full' | 'first' | 'initials' | 'anonymous';

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [club, setClub] = useState('');
  const [unit, setUnit] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyForm>('full');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setClub(profile.club || '');
      setUnit(profile.unit || '');
      setPrivacy(profile.public_name_form || 'full');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  if (!profile) return null;

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
          club: club || null,
          unit: unit || null,
          public_name_form: privacy,
          avatar_url: finalAvatarUrl,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil.');
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
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  const privacyOptions: { value: PrivacyForm; label: string; desc: string }[] = [
    { value: 'full', label: 'Nome completo', desc: 'Mostra seu nome inteiro no certificado e relatório' },
    { value: 'first', label: 'Apenas primeiro nome', desc: 'Mostra apenas o primeiro nome' },
    { value: 'initials', label: 'Iniciais', desc: 'Mostra apenas as iniciais (ex: JP)' },
    { value: 'anonymous', label: 'Anônimo', desc: 'Não mostra o nome — apenas "Anônimo"' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Meu Perfil
        </h1>
        <p style={{ color: 'var(--color-text-dim)' }}>Gerencie seus dados, senha, foto e privacidade</p>
      </div>

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
            <input value={club} onChange={e => setClub(e.target.value)} className="input-field" placeholder="Nome do clube" />
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
      </div>

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
    </div>
  );
}
