import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSpecialty } from '../curriculum';
import { shuffleQuestionOptions } from '../curriculum/ap034';

import {
  fetchRequirementProgress, upsertRequirementProgress, logActivity, calculateMastery,
  ensureEnrollment, updateEnrollmentActivity, getRequirementId, getLessonId, getSpecialtyId,
  type ProgressMap
} from '../lib/progress';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';
import FinalExam from '../components/FinalExam';
import TextEditorLab from '../labs/TextEditorLab';
import PactBuilderLab from '../labs/PactBuilderLab';
import WebLab from '../labs/WebLab';
import MailLab from '../labs/MailLab';
import FilipensesLab from '../labs/FilipensesLab';
import CodeLab from '../labs/CodeLab';
import ImageLab from '../labs/ImageLab';
import SiteLab from '../labs/SiteLab';
import AILab from '../labs/AILab';
import { CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';

export function checkAnswer(question: Question, answer: any): boolean {
  if (!answer) return false;
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false': {
      const correctOption = question.data.options?.find(o => o.correct);
      return answer === correctOption?.id;
    }
    case 'scenario': {
      const correctScenario = question.data.scenarios?.find(s => s.correct);
      return answer === correctScenario?.id;
    }
    case 'matching': {
      const pairs = question.data.pairs || [];
      if (!Array.isArray(answer) || answer.length !== pairs.length) return false;
      return answer.every((a: any, i: number) => a.left === pairs[i].left && a.right === pairs[i].right);
    }
    case 'ordering': {
      const items = question.data.items || [];
      if (!Array.isArray(answer) || answer.length !== items.length) return false;
      return answer.every((id: string, i: number) => items[i].id === id);
    }
    case 'fill_blank': {
      const blanks = question.data.blanks || [];
      if (!Array.isArray(answer) || answer.length !== blanks.length) return false;
      return answer.every((a: string, i: number) =>
        (a || '').trim().toLowerCase() === blanks[i].answer.trim().toLowerCase()
      );
    }
    default:
      return false;
  }
}

export default function LessonPage() {
  const { specialtyCode, moduleCode, lessonCode } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const specialty = specialtyCode ? getSpecialty(specialtyCode) : undefined;
  const moduleData = specialty?.modules.find(m => m.code === moduleCode);
  const lesson = moduleData?.lessons.find(l => l.code === lessonCode);

  useEffect(() => {
    if (!profile) return;
    fetchRequirementProgress(profile.id).then(setProgress);
    setAnswers({});
    setShowFeedback({});
    setCompleted(false);
    setScore(null);
  }, [profile, lessonCode]);

  if (!specialty || !moduleData || !lesson || !profile) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Lição não encontrada. <Link to="/" style={{ color: 'var(--color-primary)' }}>Voltar</Link></div>;
  }

  const questions = useMemo(() => (lesson.questions || []).map(shuffleQuestionOptions), [lesson]);

  if (lesson.labType === 'final_exam') {
    return <FinalExam specialtyCode={specialty.code} specialtyName={specialty.name} userId={profile.id} />;
  }

  if (lesson.labType) {
    const labProps = {
      specialtyCode: specialty.code,
      requirementCodes: lesson.requirementCodes,
      userId: profile.id,
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to={`/especialidade/${specialty.code}`} style={{ color: 'var(--color-text-dim)' }} className="hover:underline">{specialty.name}</Link>
          <span style={{ color: 'var(--color-text-faint)' }}>/</span>
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>{lesson.title}</span>
        </div>
        {lesson.labType === 'text_editor' && <TextEditorLab {...labProps} />}
        {lesson.labType === 'pact_builder' && <PactBuilderLab {...labProps} />}
        {lesson.labType === 'web_lab' && <WebLab {...labProps} />}
        {lesson.labType === 'mail_lab' && <MailLab {...labProps} />}
        {lesson.labType === 'filipenses' && <FilipensesLab {...labProps} />}
        {lesson.labType === 'code_lab' && <CodeLab {...labProps} />}
        {lesson.labType === 'image_lab' && <ImageLab {...labProps} />}
        {lesson.labType === 'site_lab' && <SiteLab {...labProps} />}
        {lesson.labType === 'ai_lab' && <AILab {...labProps} />}
      </div>
    );
  }

  const handleAnswer = (questionId: string, answer: any, _isCorrect: boolean) => {
    void _isCorrect;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setShowFeedback(prev => ({ ...prev, [questionId]: true }));
  };

  const handleComplete = async () => {
    const total = questions.length;
    const correct = questions.filter(q => checkAnswer(q, answers[q.id])).length;

    setScore({ correct, total });
    setCompleted(true);

    const [lessonId, specId] = await Promise.all([
      getLessonId(lesson.code),
      getSpecialtyId(specialty.code),
    ]);

    if (specId) {
      await ensureEnrollment(profile.id, specId);
      await updateEnrollmentActivity(profile.id, specId);
    }

    if (lessonId) {
      await supabase.from('lesson_attempts').insert({
        user_id: profile.id,
        lesson_id: lessonId,
        score: correct,
        total,
        passed: total > 0 && correct / total >= 0.8,
        answers,
        completed_at: new Date().toISOString(),
      });
    }

    for (const reqCode of lesson.requirementCodes) {
      const reqProgress = progress[reqCode];
      const existingCorrect = reqProgress?.correct_count || 0;
      const existingTotal = reqProgress?.total_questions || 0;
      const newCorrect = total > 0 ? correct : existingCorrect;
      const newTotal = total > 0 ? total : existingTotal;
      const { score: masteryScore, status } = calculateMastery(
        newCorrect, newTotal,
        reqProgress?.retention_passed || false,
        reqProgress?.checkpoint_passed || false,
      );
      const reqId = await getRequirementId(reqCode);
      if (reqId) {
        await upsertRequirementProgress(profile.id, reqId, {
          status, mastery_score: masteryScore,
          attempts: (reqProgress?.attempts || 0) + 1,
          correct_count: newCorrect, total_questions: newTotal,
        });
      }
      await logActivity(profile.id, 'lesson_completed', {
        lessonCode: lesson.code, score: correct, total, requirementCode: reqCode,
      }, reqId || undefined, 'lesson', lessonId || undefined, specialty.code);
    }

    if (lesson.requirementCodes.length === 0) {
      await logActivity(profile.id, 'lesson_completed', {
        lessonCode: lesson.code, score: correct, total,
      }, undefined, 'lesson', lessonId || undefined, specialty.code);
    }

    const newProg = await fetchRequirementProgress(profile.id);
    setProgress(newProg);
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link to={`/especialidade/${specialty.code}`} style={{ color: 'var(--color-text-dim)' }} className="hover:underline">{specialty.name}</Link>
        <span style={{ color: 'var(--color-text-faint)' }}>/</span>
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{lesson.title}</span>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Esta lição aborda: {lesson.requirementCodes.map(code => {
            const req = specialty.requirements.find(r => r.code === code);
            return req?.title;
          }).join(', ')}
        </p>
      </div>

      {lesson.content && (
        <div className="card p-6 space-y-3" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-a20)', color: 'var(--color-primary)' }}>{idx + 1}</span>
            <p className="font-medium pt-0.5" style={{ color: 'var(--color-text)' }}>{q.prompt}</p>
          </div>
          <QuestionRenderer
            question={q}
            answer={answers[q.id]}
            showFeedback={showFeedback[q.id]}
            onAnswer={(answer) => handleAnswer(q.id, answer, checkAnswer(q, answer))}
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

      {!completed && questions.length > 0 && (
        <button onClick={handleComplete} disabled={!allAnswered} className="btn-primary w-full">
          {allAnswered ? 'Concluir Lição' : 'Responda todas as questões'}
        </button>
      )}

      {completed && score && (
        <div className="card p-6 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <h2 className="text-xl font-bold mb-2">Lição Concluída!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Você acertou {score.correct} de {score.total} questões ({Math.round((score.correct / score.total) * 100)}%)</p>
          <button onClick={() => navigate(`/especialidade/${specialty.code}`)} className="btn-primary mt-4">
            Voltar para a Trilha <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionRenderer({ question, answer, showFeedback, onAnswer }: {
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
