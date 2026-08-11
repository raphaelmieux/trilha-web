import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFinalExamQuestions } from '../curriculum/finalExams';
import { fetchRequirementProgress, logActivity, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, type ProgressMap } from '../lib/progress';
import { supabase } from '../lib/supabase';
import type { Question } from '../types';
import { checkAnswer } from '../pages/LessonPage';
import { CheckCircle2, XCircle, Trophy, AlertCircle } from 'lucide-react';

interface Props {
  specialtyCode: string;
  specialtyName: string;
  userId: string;
}

export default function FinalExam({ specialtyCode, specialtyName, userId: _userId }: Props) {
  void _userId;
  const { profile } = useAuth();
  const [, setProgress] = useState<ProgressMap>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro');
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [certified, setCertified] = useState<string | null>(null);
  const [certifyError, setCertifyError] = useState('');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const prog = await fetchRequirementProgress(profile.id);
      setProgress(prog);
      const { data: cert } = await supabase
        .from('certifications').select('code')
        .eq('user_id', profile.id).eq('level', specialtyCode === 'AP034' ? 'fundamental' : 'advanced').eq('status', 'active').maybeSingle();
      setCertified(cert?.code || null);
    })();
  }, [profile, specialtyCode]);

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

    if (correct / total >= 0.8) {
      setCertifyError('');
      const result = await requestCertification(profile.id, specialtyCode);
      if (result.code) setCertified(result.code);
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
          <Trophy className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
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
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
          <h1 className="text-2xl font-bold mb-2">Avaliação Final — {specialtyName}</h1>
          <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Esta avaliação contém {specialtyCode === 'AP034' ? 22 : 22} questões de diversos tipos:
            múltipla escolha, verdadeiro/falso, ordenação, associação, lacunas e cenários.
            Você precisa acertar pelo menos 80% para ser aprovado e receber seu Token.Web().
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
    const passed = score.correct / score.total >= 0.8;
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          {passed ? <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-success)' }} /> : <XCircle className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />}
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
          <Trophy className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
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
          <ExamQuestionRenderer
            question={q}
            answer={answers[q.id]}
            showFeedback={showFeedback[q.id]}
            onAnswer={(answer) => handleAnswer(q.id, answer)}
          />
          {showFeedback[q.id] && q.explanation && (
            <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: checkAnswer(q, answers[q.id]) ? 'var(--color-success-a10)' : 'var(--color-error-a10)', color: checkAnswer(q, answers[q.id]) ? 'var(--color-success)' : 'var(--color-error)' }}>
              <div className="flex items-start gap-2">
                {checkAnswer(q, answers[q.id]) ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                <p>{q.explanation}</p>
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

function ExamQuestionRenderer({ question, answer, showFeedback, onAnswer }: {
  question: Question;
  answer: any;
  showFeedback: boolean;
  onAnswer: (answer: any) => void;
}) {
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
    case 'scenario':
      return <OptionsQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'ordering':
      return <OrderingQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'fill_blank':
      return <FillBlankQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'matching':
      return <MatchingQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    default:
      return null;
  }
}

function OptionsQuestion({ question, answer, showFeedback, onAnswer }: {
  question: Question; answer: any; showFeedback: boolean; onAnswer: (a: any) => void;
}) {
  const opts = question.data.options || question.data.scenarios || [];
  return (
    <div>
      {opts.map((opt: { id: string; text: string; correct?: boolean }) => {
        const selected = answer === opt.id;
        const isCorrect = opt.correct;
        const showCorrect = showFeedback && isCorrect;
        const showWrong = showFeedback && selected && !isCorrect;
        return (
          <button
            key={opt.id}
            onClick={() => !showFeedback && onAnswer(opt.id)}
            disabled={showFeedback}
            className={`w-full text-left p-3 rounded-lg border-2 transition mb-2 ${
              showCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' :
              showWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' :
              selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' :
              'border-[var(--color-border)] hover:border-[var(--color-primary-a40)]'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

function ConfirmButton({ onConfirm, disabled, showFeedback }: { onConfirm: () => void; disabled: boolean; showFeedback: boolean }) {
  if (showFeedback) return null;
  return (
    <button onClick={onConfirm} disabled={disabled} className="btn-primary mt-4 text-sm">
      {disabled ? 'Preencha todos os campos' : 'Confirmar Resposta'}
    </button>
  );
}

function OrderingQuestion({ question, answer, showFeedback, onAnswer }: {
  question: Question; answer: any; showFeedback: boolean; onAnswer: (a: any) => void;
}) {
  const items = question.data.items || [];
  const [ordered, setOrdered] = useState<string[]>(() => Array.isArray(answer) && answer.length === items.length ? answer : items.map(i => i.id));
  const [confirmed, setConfirmed] = useState(false);

  const move = (id: string, dir: 'up' | 'down') => {
    if (showFeedback) return;
    const arr = [...ordered];
    const idx = arr.indexOf(id);
    if (dir === 'up' && idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; }
    if (dir === 'down' && idx < arr.length - 1) { [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]; }
    setOrdered(arr);
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(ordered);
    setConfirmed(true);
  };

  const isLocked = showFeedback || confirmed;

  return (
    <div>
      <div className="space-y-2">
        {ordered.map((id, idx) => {
          const item = items.find(i => i.id === id)!;
          const correctIdx = items.findIndex(i => i.id === id) === idx;
          return (
            <div key={id} className={`flex items-center gap-2 p-3 border-2 rounded-lg transition ${
              showFeedback ? (correctIdx ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]') : 'border-[var(--color-border)]'
            }`}>
              <span className="font-bold" style={{ color: 'var(--color-text-muted)' }}>{idx + 1}.</span>
              <span className="flex-1">{item.text}</span>
              <button onClick={() => move(id, 'up')} disabled={idx === 0 || isLocked} className="btn-secondary px-2 py-1 text-sm">↑</button>
              <button onClick={() => move(id, 'down')} disabled={idx === ordered.length - 1 || isLocked} className="btn-secondary px-2 py-1 text-sm">↓</button>
            </div>
          );
        })}
      </div>
      <ConfirmButton onConfirm={confirm} disabled={false} showFeedback={isLocked} />
    </div>
  );
}

function FillBlankQuestion({ question, answer, showFeedback, onAnswer }: {
  question: Question; answer: any; showFeedback: boolean; onAnswer: (a: any) => void;
}) {
  const blanks = question.data.blanks || [];
  const [values, setValues] = useState<string[]>(answer || blanks.map(() => ''));
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (idx: number, val: string) => {
    const newVals = [...values];
    newVals[idx] = val;
    setValues(newVals);
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(values);
    setConfirmed(true);
  };

  const isLocked = showFeedback || confirmed;
  const allFilled = values.every(v => v.trim() !== '');

  return (
    <div>
      <div className="space-y-3">
        {blanks.map((blank: any, idx: number) => {
          const isCorrect = showFeedback && (values[idx] || '').trim().toLowerCase() === blank.answer.trim().toLowerCase();
          const isWrong = showFeedback && !isCorrect;
          return (
            <div key={blank.id}>
              <label className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Lacuna {idx + 1}: <span className="italic" style={{ color: 'var(--color-text-dim)' }}>{blank.hint}</span>
              </label>
              <input
                type="text"
                value={values[idx] || ''}
                onChange={e => handleChange(idx, e.target.value)}
                disabled={isLocked}
                className={`input-field ${isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : isWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' : ''}`}
              />
              {showFeedback && isWrong && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>Resposta correta: {blank.answer}</p>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmButton onConfirm={confirm} disabled={!allFilled} showFeedback={isLocked} />
    </div>
  );
}

function MatchingQuestion({ question, answer, showFeedback, onAnswer }: {
  question: Question; answer: any; showFeedback: boolean; onAnswer: (a: any) => void;
}) {
  const pairs = question.data.pairs || [];
  const [shuffledRights] = useState(() => [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5));
  const [matches, setMatches] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (Array.isArray(answer)) answer.forEach((a: any) => { if (a.right) init[a.left] = a.right; });
    return init;
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (left: string, right: string) => {
    const newMatches = { ...matches, [left]: right };
    setMatches(newMatches);
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(pairs.map(p => ({ left: p.left, right: matches[p.left] || '' })));
    setConfirmed(true);
  };

  const isLocked = showFeedback || confirmed;
  const allSelected = pairs.every(p => matches[p.left]);

  return (
    <div>
      <div className="space-y-3">
        {pairs.map((pair: any) => {
          const correctRight = pair.right;
          const selectedRight = matches[pair.left];
          const isCorrect = showFeedback && selectedRight === correctRight;
          const isWrong = showFeedback && selectedRight !== correctRight;
          return (
            <div key={pair.left} className="flex items-center gap-2">
              <span className="flex-1 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>{pair.left}</span>
              <span style={{ color: 'var(--color-text-dim)' }}>→</span>
              <select
                value={selectedRight || ''}
                onChange={e => handleChange(pair.left, e.target.value)}
                disabled={isLocked}
                className={`input-field flex-1 ${isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : isWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' : ''}`}
              >
                <option value="">Selecione...</option>
                {shuffledRights.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {showFeedback && isWrong && (
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-success)' }}>→ {correctRight}</span>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmButton onConfirm={confirm} disabled={!allSelected} showFeedback={isLocked} />
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
        level: specialtyCode === 'AP034' ? 'fundamental' : 'advanced',
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
