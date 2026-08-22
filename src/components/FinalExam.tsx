import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFinalExamQuestions } from '../curriculum/finalExams';
import { getSpecialty } from '../curriculum';
import { logActivity, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, LIMIAR_DOMINIO } from '../lib/progress';
import { checkAnswer } from '../lib/checkAnswer';
import { porqueDaEscolha } from '../lib/porque';
import { supabase } from '../lib/supabase';
import { useCertifications } from '../hooks/useCertifications';
import type { Question } from '../types';
import QuestionRenderer from './questions/QuestionRenderer';
import { CheckCircle2, CircleX, Award, AlertCircle } from 'lucide-react';

interface Props {
  specialtyCode: string;
  specialtyName: string;
  userId: string;
}

export default function FinalExam({ specialtyCode, specialtyName, userId: _userId }: Props) {
  void _userId;
  const { profile } = useAuth();
  const { getByCurriculum, refresh: refreshCertifications } = useCertifications(profile?.id);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro');
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [certifyError, setCertifyError] = useState('');

  const certified = getByCurriculum(specialtyCode)?.code || null;

  /* Contado do currículo, e não do estado: as questões só são sorteadas quando a
     prova começa, então na tela de abertura a lista ainda está vazia — e
     prometer "0 questões" é pior do que o número fixo que havia antes. */
  const totalDeQuestoes = useMemo(() => getFinalExamQuestions(specialtyCode).length, [specialtyCode]);

  const startExam = () => {
    setQuestions(getFinalExamQuestions(specialtyCode));
    setAnswers({});
    setShowFeedback({});
    setPhase('exam');
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setShowFeedback(prev => ({ ...prev, [questionId]: true }));
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  const finishExam = async () => {
    if (!profile) return;
    const total = questions.length;
    const correct = questions.filter(q => checkAnswer(q, answers[q.id])).length;
    setScore({ correct, total });
    setPhase('result');

    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(profile.id, specId);
      await updateEnrollmentActivity(profile.id, specId);
    }
    await logActivity(profile.id, 'final_exam_completed', { specialty: specialtyCode, score: correct, total }, undefined, 'exam');

    if ((correct / total) * 100 >= LIMIAR_DOMINIO) {
      setCertifyError('');
      const result = await requestCertification(profile.id, specialtyCode);
      if (result.code) await refreshCertifications();
      else setCertifyError(result.error || 'Não foi possível emitir o certificado agora. Tente novamente na página da especialidade.');
    }
  };

  if (certified && phase === 'intro') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to={`/especialidade/${specialtyCode}`} style={{ color: 'var(--color-text-dim)' }} className="hover:underline">{specialtyName}</Link>
        </div>
        <div className="card p-8 text-center">
          <Award className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
          <h1 className="text-2xl font-bold mb-2">Token.Web() Emitido!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Você já concluiu esta avaliação e recebeu seu Token.Web().</p>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
          {certified && <Link to={`/certificado/${certified}`} className="btn-secondary ml-2">Ver Certificado</Link>}
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to={`/especialidade/${specialtyCode}`} style={{ color: 'var(--color-text-dim)' }} className="hover:underline">{specialtyName}</Link>
        </div>
        <div className="card p-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
          <h1 className="text-2xl font-bold mb-2">Avaliação Final — {specialtyName}</h1>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {/* Contado da própria prova: era um ternário com 22 dos dois lados,
                escrito quando só havia duas trilhas com o mesmo tamanho. A prova
                da AP041 tem 19, e a tela prometia 22. */}
            Esta avaliação contém {totalDeQuestoes} questões de diversos tipos:
            múltipla escolha, verdadeiro/falso, ordenação, associação, lacunas e cenários.
            Você precisa acertar pelo menos {LIMIAR_DOMINIO}% para ser aprovado e receber seu Token.Web().
          </p>
          <div className="rounded-lg p-4 mb-6 text-sm text-left" style={{ backgroundColor: 'var(--color-primary-a08)', border: '1px solid var(--color-primary-a20)' }}>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span>Ao iniciar, leia cada questão com atenção. As alternativas estão embaralhadas — não há padrão de resposta correta.</span>
            </p>
          </div>
          <button onClick={startExam} className="btn-accent">Iniciar Avaliação</button>
        </div>
      </div>
    );
  }

  if (phase === 'result' && score) {
    const passed = (score.correct / score.total) * 100 >= LIMIAR_DOMINIO;
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          {passed ? <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-success)' }} /> : <CircleX className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />}
          <h1 className="text-2xl font-bold mb-2">{passed ? 'Parabéns! Você foi aprovado!' : 'Não foi dessa vez'}</h1>
          <p className="mb-2" style={{ color: 'var(--color-text-muted)' }}>Você acertou {score.correct} de {score.total} questões ({Math.round((score.correct / score.total) * 100)}%)</p>
          {passed && certified && <p className="font-medium mb-4" style={{ color: 'var(--color-secondary)' }}>Seu Token.Web() foi emitido!</p>}
          {passed && !certified && certifyError && (
            <p className="mb-4 text-sm" style={{ color: 'var(--color-error)' }}>{certifyError}</p>
          )}
          {!passed && <p className="mb-4" style={{ color: 'var(--color-text-dim)' }}>Revise o conteúdo e tente novamente.</p>}
          <div className="flex gap-3 justify-center">
            {!passed && <button onClick={() => { setPhase('intro'); setScore(null); }} className="btn-primary">Tentar Novamente</button>}
            {passed && certified && <Link to={`/certificado/${certified}`} className="btn-accent">Ver Certificado</Link>}
            <Link to={`/especialidade/${specialtyCode}`} className="btn-secondary">Voltar para a Trilha</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link to={`/especialidade/${specialtyCode}`} style={{ color: 'var(--color-text-dim)' }} className="hover:underline">{specialtyName}</Link>
        <span style={{ color: 'var(--color-text-faint)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>Avaliação Final</span>
      </div>

      <div className="card p-6" style={{ backgroundColor: 'var(--color-primary-a05)', borderColor: 'var(--color-primary-a20)' }}>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
          Avaliação Final — {specialtyName}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Responda todas as questões e clique em "Finalizar" para concluir.</p>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-a20)', color: 'var(--color-primary)' }}>{idx + 1}</span>
            <div className="flex-1">
              <p className="font-medium pt-0.5" style={{ color: 'var(--color-text)' }}>{q.prompt}</p>
              <span className="text-xs mt-1 block" style={{ color: 'var(--color-text-dim)' }}>
                {q.type === 'multiple_choice' ? 'Múltipla escolha' :
                 q.type === 'true_false' ? 'Verdadeiro/Falso' :
                 q.type === 'ordering' ? 'Ordenação' :
                 q.type === 'matching' ? 'Associação' :
                 q.type === 'fill_blank' ? 'Lacunas' :
                 q.type === 'scenario' ? 'Cenário' : q.type}
              </span>
            </div>
          </div>
          <QuestionRenderer
            question={q}
            answer={answers[q.id]}
            showFeedback={showFeedback[q.id]}
            onAnswer={(answer) => handleAnswer(q.id, answer)}
          />
          {showFeedback[q.id] && q.explanation && (
            <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: checkAnswer(q, answers[q.id]) ? 'var(--color-success-a10)' : 'var(--color-error-a10)', color: checkAnswer(q, answers[q.id]) ? 'var(--color-success)' : 'var(--color-error)' }}>
              <div className="flex items-start gap-2">
                {checkAnswer(q, answers[q.id]) ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <CircleX className="w-5 h-5 flex-shrink-0" />}
                <div>
                  {/* Primeiro o que houve com a escolha de quem responde, depois
                      a explicação da questão: quem errou precisa saber o que
                      confundiu antes de ler a definição correta. */}
                  {porqueDaEscolha(q, answers[q.id]) && (
                    <p className="mb-1.5 font-medium">{porqueDaEscolha(q, answers[q.id])}</p>
                  )}
                  <p>{q.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={finishExam} disabled={!allAnswered} className="btn-accent w-full">
        {allAnswered ? 'Finalizar Avaliação' : 'Responda todas as questões'}
      </button>
    </div>
  );
}

async function requestCertification(userId: string, specialtyCode: string): Promise<{ code?: string; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Sessão expirada.' };

  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/issue-certification`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        specialtyCode,
        /* O grau vem do currículo, e não de um ternário que só conhecia duas
           trilhas — com a terceira, "tudo que não for AP034 é avançado" passa a
           mentir sobre a especialidade. */
        level: getSpecialty(specialtyCode)?.level ?? 'basico',
      }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.error };

    await logActivity(userId, 'certification_issued', { certCode: data.code, specialtyCode }, undefined, 'certification');
    return { code: data.code };
  } catch {
    return { error: 'Erro de conexão ao emitir certificado.' };
  }
}
