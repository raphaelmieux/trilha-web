import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPublicName, type Certification, type PublicProfile } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { LoadingState, ErrorState } from '../components/ui/PageState';
import CertificateCanvas from '../components/CertificateCanvas';

export default function CertificatePage() {
  const { code } = useParams();
  const [cert, setCert] = useState<Certification | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lets the print stylesheet strip the app shell's padding/max-width for this
  // route only, so the certificate prints as a single full-bleed sheet instead of
  // being boxed inside the normal centered column (which adds white margins and
  // can spill onto a second blank page).
  useEffect(() => {
    document.body.classList.add('printing-certificate');
    return () => document.body.classList.remove('printing-certificate');
  }, []);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data: certData, error: certError } = await supabase
        .from('certifications')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (certError || !certData) {
        setError('Certificado não encontrado.');
        setLoading(false);
        return;
      }

      setCert(certData as Certification);

      const { data: profileData } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', certData.user_id)
        .maybeSingle();

      setProfile(profileData as PublicProfile);
      setLoading(false);
    })();
  }, [code]);

  if (loading) return <LoadingState label="Carregando certificado..." />;
  if (error) return (
    <div className="text-center py-8">
      <ErrorState message={error} />
      <Link to="/" className="btn-primary mt-4 inline-flex">Voltar ao Início</Link>
    </div>
  );
  if (!cert || !profile) return null;

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => history.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4 mr-1" /> Imprimir / Salvar PDF
        </button>
      </div>

      <div className="cert-page">
        <CertificateCanvas cert={cert} studentName={getPublicName(profile)} />
      </div>

      <div className="card p-4 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{cert.code}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              Emitido em {issuedDate} — verifique em{' '}
              <span style={{ color: 'var(--color-primary)' }}>/verificar</span>
            </p>
          </div>
          <StatusBadge tone={cert.status === 'active' ? 'success' : 'error'}>
            {cert.status === 'active' ? 'Ativo' : 'Revogado'}
          </StatusBadge>
        </div>
        <p className="text-xs mt-3 pt-3" style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)' }}>
          Ao imprimir, escolha <strong style={{ color: 'var(--color-text-soft)' }}>A4 paisagem</strong>,
          margens <strong style={{ color: 'var(--color-text-soft)' }}>nenhuma</strong> e marque
          <strong style={{ color: 'var(--color-text-soft)' }}> gráficos de fundo</strong> para o certificado
          sair sem bordas brancas.
        </p>
      </div>
    </div>
  );
}
