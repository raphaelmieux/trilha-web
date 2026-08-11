import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSpecialty } from '../curriculum';
import { getPublicName, type Certification, type PublicProfile } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

export default function CertificatePage() {
  const { code } = useParams();
  const [cert, setCert] = useState<Certification | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="text-center py-8" style={{ color: 'var(--color-text-dim)' }}>Carregando certificado...</div>;
  if (error) return (
    <div className="text-center py-8">
      <p className="mb-4" style={{ color: 'var(--color-primary)' }}>{error}</p>
      <Link to="/" className="btn-primary">Voltar ao Início</Link>
    </div>
  );
  if (!cert || !profile) return null;

  const specialty = getSpecialty(cert.curriculum_code);
  const specialtyCode = cert.curriculum_code;
  const specialtyTitle = specialty?.name || cert.curriculum_code;
  const isAP035 = specialtyCode === 'AP035';

  // Background files maintain native 1263 × 893 ratio
  const bgImage = isAP035
    ? '/assets/certificates/Token.Web(AP035).png'
    : '/assets/certificates/Token.Web(AP034).png';

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const studentName = getPublicName(profile);
  const verifyUrl = `${window.location.origin}/verificar?code=${cert.code}`;

  return (
    <div className="space-y-4">
      {/* Action bar — hidden on print */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => history.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4 mr-1" /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Certificate canvas */}
      <div className="cert-container">
        {/*
          Aspect ratio locked to background image native resolution: 1263 × 893.
          All text positions use percentage units so they scale with the container.
          Background is set to 100%×100% cover to maintain pixel-perfect fidelity.
        */}
        <div
          className="cert-wrapper relative w-full select-none"
          style={{
            maxWidth: '1263px',
            margin: '0 auto',
            aspectRatio: '1263 / 893',
            backgroundImage: `url("${bgImage}")`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
          }}
        >
          {/* ── "Este documento certifica que" ── */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: '24.5%' }}
          >
            <p style={{
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              fontSize: 'clamp(11px, 1.65vw, 21px)',
              fontWeight: 400,
              color: '#111111',
              letterSpacing: '0.03em',
            }}>
              Este documento certifica que
            </p>
          </div>

          {/* ── Student name ── */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: '30%', padding: '0 7%' }}
          >
            <p style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(22px, 5.2vw, 66px)',
              fontWeight: 700,
              color: '#0a0a0a',
              lineHeight: 1.05,
              letterSpacing: '-0.015em',
            }}>
              {studentName}
            </p>
          </div>

          {/* ── "terminou com sucesso a Trilha.Web() da especialidade" ── */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: '49%' }}
          >
            <p style={{
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              fontSize: 'clamp(10px, 1.65vw, 21px)',
              fontWeight: 400,
              color: '#111111',
              letterSpacing: '0.02em',
            }}>
              terminou com sucesso a Trilha.Web() da especialidade
            </p>
          </div>

          {/* ── Specialty code (bold) + name (regular) ── */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: '55.5%', padding: '0 5%' }}
          >
            <p style={{
              fontFamily: "'Arial Black', 'Arial', 'Helvetica', sans-serif",
              fontSize: 'clamp(20px, 5.0vw, 63px)',
              lineHeight: 1.0,
              color: '#0a0a0a',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}>
              <strong style={{ fontWeight: 900 }}>{specialtyCode}</strong>
              {' '}
              <span style={{ fontWeight: 400, fontFamily: "'Arial', 'Helvetica', sans-serif" }}>{specialtyTitle}</span>
            </p>
          </div>

          {/* ── Bottom-left: cert code + verify URL ── */}
          <div
            className="absolute text-left"
            style={{ bottom: '3.5%', left: '2.5%', maxWidth: '50%' }}
          >
            <p style={{
              fontFamily: "'Courier New', 'Courier', monospace",
              fontSize: 'clamp(5.5px, 0.75vw, 9.5px)',
              color: '#1a1a1a',
              lineHeight: 1.6,
              wordBreak: 'break-all',
            }}>
              {cert.code}
            </p>
            <p style={{
              fontFamily: "'Courier New', 'Courier', monospace",
              fontSize: 'clamp(5.5px, 0.75vw, 9.5px)',
              color: '#1a1a1a',
              lineHeight: 1.5,
            }}>
              verifique a validade em {verifyUrl}
            </p>
          </div>

          {/* ── Bottom-right: issue date ── */}
          <div
            className="absolute text-right"
            style={{ bottom: '3.5%', right: '2.5%' }}
          >
            <p style={{
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              fontSize: 'clamp(6px, 0.85vw, 11px)',
              color: '#1a1a1a',
              fontWeight: 500,
            }}>
              {issuedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Status badge — screen only */}
      <div className="card p-4 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{cert.code}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              Emitido em {issuedDate} — verifique em{' '}
              <span style={{ color: 'var(--color-primary)' }}>/verificar</span>
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: cert.status === 'active' ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
              color: cert.status === 'active' ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {cert.status === 'active' ? 'Ativo' : 'Revogado'}
          </span>
        </div>
      </div>
    </div>
  );
}
