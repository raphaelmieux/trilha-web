import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { type CertificadoVerificado } from '../types';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { LoadingState, ErrorState } from '../components/ui/PageState';
import CertificateCanvas from '../components/CertificateCanvas';
import { exportCertificatePdf } from '../lib/pdf';
import { comoCertificadoVerificado } from '../lib/certificados';

export default function CertificatePage() {
  const { code } = useParams();
  const [cert, setCert] = useState<CertificadoVerificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    if (!code) return;
    (async () => {
      /* Uma consulta só, por código, contra a função de verificação — a tabela
         de certificações não é mais legível publicamente. */
      const { data, error: rpcError } = await supabase.rpc('verify_certificate', { p_code: code });
      const linha = data?.[0];
      const encontrado = linha && comoCertificadoVerificado(linha);

      if (rpcError || !encontrado) {
        setError('Certificado não encontrado.');
        setLoading(false);
        return;
      }
      if (encontrado.status !== 'active') {
        setError('Este Token.Web() foi revogado e não é mais válido.');
        setLoading(false);
        return;
      }

      setCert(encontrado);
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
  if (!cert) return null;

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  /* Nome completo: um certificado que dissesse "Anônimo" não teria serventia
     nenhuma fora do aplicativo. */
  const studentName = cert.full_name;

  const handleDownload = async () => {
    setExporting(true);
    setExportError('');
    try {
      await exportCertificatePdf(cert, studentName);
    } catch (err) {
      setExportError((err as Error).message || 'Não foi possível gerar o PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => history.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button onClick={handleDownload} disabled={exporting} className="btn-primary">
          {exporting
            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando PDF...</>
            : <><Download className="w-4 h-4 mr-1" /> Baixar PDF</>}
        </button>
      </div>

      <div className="cert-page">
        <CertificateCanvas cert={cert} studentName={studentName} />
      </div>

      <div className="card p-4">
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
        {exportError && (
          <p className="text-xs mt-3" style={{ color: 'var(--color-error)' }}>{exportError}</p>
        )}
        <p className="text-xs mt-3 pt-3" style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)' }}>
          O PDF é gerado pelo próprio sistema em A4 paisagem, sem bordas — não depende
          das configurações de impressão do navegador.
        </p>
      </div>
    </div>
  );
}
