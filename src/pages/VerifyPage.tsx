import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ROTULO_DO_NIVEL, type CertificadoVerificado } from '../types';
import { getSpecialty } from '../curriculum';
import { Award, Search, CheckCircle2 } from 'lucide-react';
import { ErrorState } from '../components/ui/PageState';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CertificadoVerificado | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setError('');
    setResult(null);
    setSearched(false);
    if (!code.trim()) return;

    /*
      Uma função, e não a tabela. A tabela deixou de ser legível publicamente:
      antes qualquer visitante podia listar todas as certificações emitidas.
      Aqui se informa um código e se recebe um certificado — não há como varrer.
    */
    const { data, error: rpcError } = await supabase.rpc('verify_certificate', { p_code: code.trim() });
    const cert = (data as CertificadoVerificado[] | null)?.[0];

    if (rpcError || !cert) {
      setError('Token não encontrado ou inválido.');
      setSearched(true);
      return;
    }

    /* Revogado não é o mesmo que inexistente, e dizer isso importa: um
       certificado revogado existiu e foi invalidado, e quem confere precisa
       saber a diferença. */
    if (cert.status !== 'active') {
      setError('Este Token.Web() foi revogado e não é mais válido.');
      setSearched(true);
      return;
    }

    setResult(cert);
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Award className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} /> Verificar Token.Web()
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

      {error && <ErrorState message={error} />}

      {result && (
        <div className="card p-8" style={{ borderColor: 'var(--color-secondary-a30)', backgroundColor: 'var(--color-secondary-a03)' }}>
          <div className="text-center mb-6">
            <Award className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
            <h2 className="text-2xl font-bold">Token.Web() Válido</h2>
          </div>
          <div className="space-y-3 text-sm">
            {[
              /* Nome completo, sempre: é o que permite conferir que o documento
                 em mãos é daquela pessoa. */
              ['Titular:', result.full_name],
              ...(result.club ? [['Clube:', result.club]] : []),
              /*
                A trilha vem do código dela, não do grau.

                Era `level === 'fundamental' ? 'AP034' : 'AP035'`, e a AP041
                também é fundamental: o certificado dela seria verificado, em
                público, como se fosse o de Internet. Esta é a página que dá
                validade ao Token.Web() fora do aplicativo — errar o nome da
                especialidade aqui é errar no único lugar que não perdoa.
              */
              ['Especialidade:', (() => {
                const e = getSpecialty(result.curriculum_code);
                return e ? `${e.code} — ${e.name}` : result.curriculum_code;
              })()],
              ['Nível:', ROTULO_DO_NIVEL[result.level] ?? result.level],
              ['Currículo:', `${result.curriculum_code} v${result.curriculum_version}`],
              ['Emitido em:', new Date(result.issued_at).toLocaleDateString('pt-BR')],
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
