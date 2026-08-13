import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getSpecialty } from '../curriculum';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { buildSpecialtyNarrative, buildClosingParagraph } from '../lib/reportNarrative';
import { getPublicName } from '../types';
import { LoadingState } from '../components/ui/PageState';
import CertificateCanvas from '../components/CertificateCanvas';
import { exportReportPdf, type ReportSection } from '../lib/pdf';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';

export default function ReportPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useRequirementProgress(profile?.id);
  const { certifications, loading: certsLoading } = useCertifications(profile?.id);
  const [lessonAttempts, setLessonAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const loading = progressLoading || certsLoading || attemptsLoading;

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: attempts } = await supabase
        .from('lesson_attempts')
        .select('score, total')
        .eq('user_id', profile.id);
      setLessonAttempts(attempts || []);
      setAttemptsLoading(false);
    })();
  }, [profile]);

  const studentName = profile ? getPublicName(profile) : '';

  const { narratives, closing } = useMemo(() => {
    if (!profile || loading) return { narratives: [], closing: '' };

    const specialties = [getSpecialty('AP034'), getSpecialty('AP035')].filter(s => !!s);
    const list = specialties.map(s =>
      buildSpecialtyNarrative(s!, progress, certifications, studentName)
    );

    const attemptsCount = lessonAttempts.length;
    const averageScore = attemptsCount > 0
      ? Math.round(
          lessonAttempts.reduce((sum, a) => sum + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) /
          attemptsCount
        )
      : 0;

    return {
      narratives: list,
      closing: buildClosingParagraph(list, studentName, attemptsCount, averageScore),
    };
  }, [profile, progress, certifications, lessonAttempts, loading, studentName]);

  if (!profile) return null;
  if (loading) return <LoadingState label="Montando relatório..." />;

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const attachedCerts = narratives.map(n => n.certificate).filter(c => !!c);

  const intro = `Este documento descreve, em linguagem corrente, as competências efetivamente demonstradas por ${studentName} ao longo da Trilha.Web(), plataforma de estudo autônomo das especialidades AP034 — Internet e AP035 — Internet, Avançado. Destina-se à apresentação à liderança do Clube de Desbravadores, para subsidiar o reconhecimento e o registro das especialidades pelos canais oficiais do clube.`;

  const annexNote = attachedCerts.length === 0 ? undefined
    : attachedCerts.length === 1
      ? 'Segue anexo o certificado Token.Web() referente à trilha concluída.'
      : `Seguem anexos os ${attachedCerts.length} certificados Token.Web() referentes às trilhas concluídas.`;

  const handleDownload = async () => {
    setExporting(true);
    setExportError('');
    try {
      const sections: ReportSection[] = [
        ...narratives.map(n => ({
          heading: `${n.code} — ${n.name}`,
          paragraphs: [
            n.opening,
            ...n.modules.map(m => m.paragraph),
            ...(n.pending ? [n.pending] : []),
            ...(n.certification ? [n.certification] : []),
          ],
        })),
        { heading: 'Considerações finais', paragraphs: [closing] },
      ];

      await exportReportPdf({
        studentName,
        club: profile.club || '',
        unit: profile.unit || '',
        issuedOn: today,
        intro,
        sections,
        annexNote,
        certificates: attachedCerts as NonNullable<typeof attachedCerts[number]>[],
      });
    } catch (err) {
      setExportError((err as Error).message || 'Não foi possível gerar o PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button onClick={handleDownload} disabled={exporting} className="btn-primary">
          {exporting
            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando PDF...</>
            : <><Download className="w-4 h-4 mr-1" /> Baixar PDF</>}
        </button>
      </div>

      {exportError && (
        <div className="card p-3 text-sm" style={{ color: 'var(--color-error)' }}>{exportError}</div>
      )}

      <article className="report-doc card">
        <header className="report-head">
          <h1>Relatório de Competências</h1>
          <p className="report-sub">
            Trilha.Web() — Especialidades AP034 (Internet) e AP035 (Internet, Avançado)
          </p>
        </header>

        <section className="report-id">
          <p><strong>Desbravador(a):</strong> {studentName}</p>
          <p><strong>Clube:</strong> {profile.club || '—'}</p>
          <p><strong>Unidade:</strong> {profile.unit || '—'}</p>
          <p><strong>Emitido em:</strong> {today}</p>
        </section>

        <section className="report-body">
          <p>
            Este documento descreve, em linguagem corrente, as competências efetivamente
            demonstradas por {studentName} ao longo da Trilha.Web(), plataforma de estudo
            autônomo das especialidades AP034 — Internet e AP035 — Internet, Avançado.
            Destina-se à apresentação à liderança do Clube de Desbravadores, para
            subsidiar o reconhecimento e o registro das especialidades pelos canais
            oficiais do clube.
          </p>

          {narratives.map(n => (
            <div key={n.code} className="report-section">
              <h2>{n.code} — {n.name}</h2>
              <p>{n.opening}</p>
              {n.modules.map(m => (
                <p key={m.title}>{m.paragraph}</p>
              ))}
              {n.pending && <p>{n.pending}</p>}
              {n.certification && <p>{n.certification}</p>}
            </div>
          ))}

          <div className="report-section">
            <h2>Considerações finais</h2>
            <p>{closing}</p>
          </div>
        </section>

        {attachedCerts.length > 0 && (
          <p className="report-annex-note">
            {attachedCerts.length === 1
              ? 'Segue anexo o certificado Token.Web() referente à trilha concluída.'
              : `Seguem anexos os ${attachedCerts.length} certificados Token.Web() referentes às trilhas concluídas.`}
          </p>
        )}
      </article>

      {attachedCerts.map(cert => (
        <div key={cert!.id} className="cert-page">
          <CertificateCanvas cert={cert!} studentName={studentName} />
        </div>
      ))}
    </div>
  );
}
