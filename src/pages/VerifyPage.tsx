import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicName, type Certification, type UserProfile } from '../types';
import { Trophy, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ cert: Certification; profile: UserProfile } | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setError('');
    setResult(null);
    setSearched(false);
    if (!code.trim()) return;

    const { data: cert, error: certError } = await supabase
      .from('certifications')
      .select('*')
      .eq('code', code.trim())
      .eq('status', 'active')
      .maybeSingle();

    if (certError || !cert) {
      setError('Token não encontrado ou inválido.');
      setSearched(true);
      return;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', cert.user_id)
      .maybeSingle();

    if (profile) {
      setResult({ cert: cert as Certification, profile: profile as UserProfile });
    } else {
      setError('Perfil não encontrado.');
    }
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} /> Verificar Token.Web()
        </h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Digite o código do Token.Web() para verificar sua autenticidade.</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="input-field"
            placeholder="TW-AP034-..."
          />
          <button onClick={handleSearch} className="btn-primary">
            <Search className="w-4 h-4 mr-1" /> Verificar
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-primary)' }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="card p-8" style={{ borderColor: 'var(--color-secondary-a30)', backgroundColor: 'var(--color-secondary-a03)' }}>
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
            <h2 className="text-2xl font-bold">Token.Web() Válido</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ['Titular:', getPublicName(result.profile)],
              ['Especialidade:', result.cert.level === 'fundamental' ? 'AP034 — Internet' : 'AP035 — Internet, Avançado'],
              ['Nível:', result.cert.level === 'fundamental' ? 'Fundamental' : 'Avançado'],
              ['Currículo:', `${result.cert.curriculum_code} v${result.cert.curriculum_version}`],
              ['Emitido em:', new Date(result.cert.issued_at).toLocaleDateString('pt-BR')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between pb-2" style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>
                <span style={{ color: 'var(--color-text-dim)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-dim)' }}>Status:</span>
              <span className="font-medium flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                <CheckCircle2 className="w-4 h-4" /> Ativo
              </span>
            </div>
          </div>
        </div>
      )}

      {searched && !result && !error && (
        <div className="card p-6 text-center" style={{ color: 'var(--color-text-dim)' }}>Token não encontrado.</div>
      )}
    </div>
  );
}
