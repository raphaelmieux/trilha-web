import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCertifications } from '../hooks/useCertifications';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { LoadingState } from '../components/ui/PageState';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

/**
 * AP035 requirement 1: "Ter a especialidade de Internet".
 *
 * The official sheet opens the advanced specialty with this, and the platform
 * had no equivalent — a student could finish AP035 without ever holding AP034,
 * which would make the advanced certificate indefensible in front of a club
 * leader holding the document.
 *
 * It is not a lesson so much as a gate, and it is checked rather than declared:
 * the requirement is marked only when the AP034 Token.Web() actually exists for
 * this student, which is the same record the report and the verification page
 * read.
 */
export default function PrerequisiteLab({ specialtyCode, requirementCodes, userId }: Props) {
  const { certifications, loading } = useCertifications(userId);
  const [recorded, setRecorded] = useState(false);

  const held = certifications.find(c => c.curriculum_code === 'AP034' && c.status === 'active');

  useEffect(() => {
    if (loading || !held || recorded) return;
    (async () => {
      const specId = await getSpecialtyId(specialtyCode);
      if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
      for (const reqCode of requirementCodes) {
        const reqId = await getRequirementId(reqCode);
        if (reqId) await upsertRequirementProgress(userId, reqId, {
          status: 'completed', mastery_score: 100, checkpoint_passed: true,
          attempts: 1, correct_count: 1, total_questions: 1,
        });
      }
      await logActivity(userId, 'prerequisite_verified', { certificado: held.code });
      setRecorded(true);
    })();
  }, [loading, held, recorded, specialtyCode, requirementCodes, userId]);

  if (loading) return <LoadingState label="Conferindo o pré-requisito..." />;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Pré-requisito da especialidade
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          O documento oficial da AP035 começa exigindo a especialidade de Internet concluída.
          Não é burocracia: a trilha avançada supõe que você já saiba o que é um site, um
          download e um vírus, e parte daí para HTML, imagens e inteligência artificial.
        </p>
      </div>

      <div
        className="card p-6"
        style={{ borderColor: held ? 'var(--color-success-a20)' : 'var(--color-warning-a10)' }}
      >
        {held ? (
          <>
            <p className="flex items-center gap-2 font-bold mb-2" style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 className="w-5 h-5" /> Pré-requisito cumprido
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>
              Sua certificação da AP034 — Internet está ativa, com o código{' '}
              <span className="font-mono" style={{ color: 'var(--color-text)' }}>{held.code}</span>,
              emitida em {new Date(held.issued_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
            </p>
            <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
              Seguir para a trilha <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 font-bold mb-2" style={{ color: 'var(--color-warning)' }}>
              <AlertCircle className="w-5 h-5" /> Ainda falta a AP034
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-soft)' }}>
              Este requisito não é marcado por declaração: ele confere se o seu Token.Web() da
              especialidade de Internet existe e está ativo. Conclua a AP034 e ele fecha sozinho,
              sem você precisar voltar aqui.
            </p>
            <Link to="/especialidade/AP034" className="btn-primary inline-flex">
              Ir para a trilha AP034 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
