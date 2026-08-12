import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSpecialty } from '../curriculum';
import { getPublicName, type Certification, type PublicProfile } from '../types';
import { Printer, ArrowLeft, Compass, Award } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { LoadingState, ErrorState } from '../components/ui/PageState';

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

  if (loading) return <LoadingState label="Carregando certificado..." />;
  if (error) return (
    <div className="text-center py-8">
      <ErrorState message={error} />
      <Link to="/" className="btn-primary mt-4 inline-flex">Voltar ao Início</Link>
    </div>
  );
  if (!cert || !profile) return null;

  const specialty = getSpecialty(cert.curriculum_code);
  const specialtyCode = cert.curriculum_code;
  const specialtyTitle = specialty?.name || cert.curriculum_code;
  const emblemSrc = `${import.meta.env.BASE_URL}assets/specialties/${specialtyCode}.svg`;
  const levelLabel = cert.level === 'advanced' ? 'Nível Avançado' : 'Nível Fundamental';

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

      {/* Certificate canvas — drawn entirely in HTML/CSS with the brand palette,
          so it never depends on an external background image. */}
      <div className="cert-container">
        <div
          className="cert-wrapper relative w-full select-none"
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            aspectRatio: '1.42 / 1',
            background: '#fbf9f5',
            border: '10px solid #C13516',
            boxShadow: 'inset 0 0 0 3px #F5A623, inset 0 0 0 6px #C13516',
            padding: '3.5% 6%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: '#C13516' }}>
            <Compass className="w-5 h-5" />
            <span style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontWeight: 700, fontSize: 'clamp(11px, 1.4vw, 15px)', letterSpacing: '0.08em' }}>
              TRILHA.WEB() — TOKEN.WEB()
            </span>
          </div>

          <img src={emblemSrc} alt={specialtyCode} style={{ width: 'clamp(48px, 9vw, 90px)', height: 'auto', margin: 'clamp(10px, 2vw, 20px) 0' }} />

          <p style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 'clamp(11px, 1.5vw, 18px)', color: '#3a3a3a', letterSpacing: '0.03em' }}>
            Este documento certifica que
          </p>

          <p style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(24px, 4.6vw, 52px)',
            fontWeight: 700,
            color: '#1a1006',
            lineHeight: 1.1,
            margin: 'clamp(6px, 1vw, 12px) 0',
          }}>
            {studentName}
          </p>

          <p style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 'clamp(11px, 1.5vw, 18px)', color: '#3a3a3a', letterSpacing: '0.02em', maxWidth: '80%' }}>
            concluiu com sucesso a trilha de aprendizagem da especialidade
          </p>

          <p style={{
            fontFamily: "'Arial', 'Helvetica', sans-serif",
            fontSize: 'clamp(17px, 3vw, 34px)',
            fontWeight: 800,
            color: '#C13516',
            margin: 'clamp(8px, 1.2vw, 14px) 0 2px',
          }}>
            {specialtyCode} — {specialtyTitle}
          </p>
          <p style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 'clamp(10px, 1.2vw, 14px)', color: '#8a6a2a', fontWeight: 600, letterSpacing: '0.05em' }}>
            {levelLabel}
          </p>

          <div className="flex items-center gap-3" style={{ margin: 'clamp(14px, 2vw, 22px) 0', width: '55%', maxWidth: '340px' }}>
            <span style={{ flex: 1, height: 1, background: '#C13516AA' }} />
            <Award className="w-5 h-5" style={{ color: '#F5A623' }} />
            <span style={{ flex: 1, height: 1, background: '#C13516AA' }} />
          </div>

          <div className="flex items-end justify-between w-full" style={{ marginTop: 'auto' }}>
            <div className="text-left">
              <p style={{ fontFamily: "'Courier New', 'Courier', monospace", fontSize: 'clamp(7px, 0.9vw, 10px)', color: '#555', lineHeight: 1.6, wordBreak: 'break-all' }}>
                {cert.code}
              </p>
              <p style={{ fontFamily: "'Courier New', 'Courier', monospace", fontSize: 'clamp(7px, 0.9vw, 10px)', color: '#555', lineHeight: 1.5 }}>
                verifique a validade em {verifyUrl}
              </p>
            </div>
            <p style={{ fontFamily: "'Arial', 'Helvetica', sans-serif", fontSize: 'clamp(9px, 1vw, 12px)', color: '#3a3a3a', fontWeight: 600 }}>
              Emitido em {issuedDate}
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
          <StatusBadge tone={cert.status === 'active' ? 'success' : 'error'}>
            {cert.status === 'active' ? 'Ativo' : 'Revogado'}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}
