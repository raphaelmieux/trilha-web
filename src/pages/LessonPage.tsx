import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSpecialty } from '../curriculum';
import { shuffleQuestionOptions } from '../curriculum/ap034';

import type { RequirementStatus } from '../types';
import {
  upsertRequirementProgress, logActivity, calculateMastery, melhorResultado, LIMIAR_DOMINIO,
  ensureEnrollment, updateEnrollmentActivity, getRequirementId, getLessonId, getSpecialtyId,
} from '../lib/progress';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { checkAnswer } from '../lib/checkAnswer';
import { porqueDaEscolha } from '../lib/porque';
import { supabase } from '../lib/supabase';
import FinalExam from '../components/FinalExam';
import QuestionRenderer from '../components/questions/QuestionRenderer';
import TextEditorLab from '../labs/TextEditorLab';
import PactBuilderLab from '../labs/PactBuilderLab';
import ThreatLab from '../labs/ThreatLab';
import PrerequisiteLab from '../labs/PrerequisiteLab';
import WebLab from '../labs/WebLab';
import MailLab from '../labs/MailLab';
import FilipensesLab from '../labs/FilipensesLab';
import CodeLab from '../labs/CodeLab';
import ImageLab from '../labs/ImageLab';
import SiteLab from '../labs/SiteLab';
import FileManagerLab from '../labs/FileManagerLab';
import PresentationLab from '../labs/PresentationLab';
import AILab from '../labs/AILab';
import { CheckCircle2, CircleX, ArrowRight, BookOpen, RefreshCw, Loader2, HardHat } from 'lucide-react';

export default function LessonPage() {
  const { specialtyCode, moduleCode, lessonCode } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { progress, refresh: refreshProgress } = useRequirementProgress(profile?.id);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  /* Quantos requisitos da lição ficaram marcados como concluídos. `null`
     enquanto a gravação não terminou — a tela não pode afirmar nada antes. */
  const [resultado, setResultado] = useState<{ concluidos: number; total: number } | null>(null);

  const specialty = specialtyCode ? getSpecialty(specialtyCode) : undefined;
  const moduleData = specialty?.modules.find(m => m.code === moduleCode);
  const lesson = moduleData?.lessons.find(l => l.code === lessonCode);

  /* Uma função só para limpar, usada ao trocar de lição e ao refazer — dois
     lugares que precisam zerar exatamente o mesmo conjunto de estados. */
  const limpar = useCallback(() => {
    setAnswers({});
    setShowFeedback({});
    setCompleted(false);
    setScore(null);
    setResultado(null);
  }, []);

  useEffect(() => { limpar(); }, [lessonCode, limpar]);

  const refazer = () => {
    limpar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hooks must run unconditionally on every render, so this stays above the
  // "not found" early return below (it previously ran after it).
  const questions = useMemo(() => (lesson?.questions || []).map(shuffleQuestionOptions), [lesson]);

  if (specialty?.emConstrucao) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <HardHat className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
      <h1 className="text-xl font-bold mb-2">Esta trilha ainda está em construção</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>
        Estamos preparando as lições. Ela aparece no painel assim que abrir.
      </p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Voltar ao Início</Link>
    </div>
  );

  if (!specialty || !moduleData || !lesson || !profile) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Lição não encontrada. <Link to="/" style={{ color: 'var(--color-primary)' }}>Voltar</Link></div>;
  }

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
        {lesson.labType === 'threat_lab' && <ThreatLab {...labProps} />}
        {lesson.labType === 'prerequisite' && <PrerequisiteLab {...labProps} />}
        {lesson.labType === 'web_lab' && <WebLab {...labProps} />}
        {lesson.labType === 'mail_lab' && <MailLab {...labProps} />}
        {lesson.labType === 'filipenses' && <FilipensesLab {...labProps} />}
        {lesson.labType === 'code_lab' && <CodeLab {...labProps} variant="elementos" />}
        {lesson.labType === 'table_challenge' && <CodeLab {...labProps} variant="tabela" />}
        {lesson.labType === 'image_lab' && <ImageLab {...labProps} />}
        {lesson.labType === 'site_lab' && <SiteLab {...labProps} />}
        {lesson.labType === 'file_manager' && <FileManagerLab {...labProps} />}
        {lesson.labType === 'presentation' && <PresentationLab {...labProps} />}
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
    setResultado(null);
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
        passed: total > 0 && (correct / total) * 100 >= LIMIAR_DOMINIO,
        answers,
        completed_at: new Date().toISOString(),
      });
    }

    const statusPorRequisito: RequirementStatus[] = [];

    for (const reqCode of lesson.requirementCodes) {
      const reqProgress = progress[reqCode];
      const existingCorrect = reqProgress?.correct_count || 0;
      const existingTotal = reqProgress?.total_questions || 0;

      /*
        Fica o melhor resultado, nunca o mais recente.

        O upsert sobrescrevia sem comparar: quem já tinha concluído um requisito
        e revisitava a lição por curiosidade, indo pior na segunda vez, era
        rebaixado para "a revisar" — progresso conquistado desaparecia. Refazer
        uma lição só pode ajudar.
      */
      const melhor = melhorResultado(
        { correct: existingCorrect, total: existingTotal },
        { correct, total },
      );

      const { score: masteryScore, status } = calculateMastery(
        melhor.correct, melhor.total,
        reqProgress?.retention_passed || false,
        reqProgress?.checkpoint_passed || false,
      );
      statusPorRequisito.push(status);

      const reqId = await getRequirementId(reqCode);
      if (reqId) {
        await upsertRequirementProgress(profile.id, reqId, {
          status, mastery_score: masteryScore,
          attempts: (reqProgress?.attempts || 0) + 1,
          correct_count: melhor.correct, total_questions: melhor.total,
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

    setResultado({
      concluidos: statusPorRequisito.filter(st => st === 'completed').length,
      total: statusPorRequisito.length,
    });

    await refreshProgress();
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

      {!completed && questions.length > 0 && (
        <button onClick={handleComplete} disabled={!allAnswered} className="btn-primary w-full">
          {allAnswered ? 'Concluir Lição' : 'Responda todas as questões'}
        </button>
      )}

      {completed && score && (() => {
        /*
          A tela dizia "Lição Concluída!" com um visto verde qualquer que fosse a
          nota. Quem acertava 6 de 8 lia que tinha concluído, voltava para a
          trilha e não via nada mudar — e concluía, com razão, que o progresso
          não fora registrado. O que ela mostra agora é o que de fato ficou
          gravado nos requisitos.
        */
        const tudo = resultado !== null && resultado.concluidos === resultado.total;
        const nada = resultado !== null && resultado.concluidos === 0 && resultado.total > 0;
        const percentual = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        return (
          <div className="card p-6 text-center">
            {resultado === null ? (
              <Loader2 className="w-16 h-16 mx-auto mb-3 animate-spin" style={{ color: 'var(--color-text-dim)' }} />
            ) : tudo ? (
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
            ) : (
              <RefreshCw className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
            )}

            <h2 className="text-xl font-bold mb-2">
              {resultado === null ? 'Registrando...'
                : tudo ? 'Requisitos concluídos!'
                : nada ? 'Ainda falta pouco'
                : 'Parcialmente concluída'}
            </h2>

            <p style={{ color: 'var(--color-text-muted)' }}>
              Você acertou {score.correct} de {score.total} {score.total === 1 ? 'questão' : 'questões'} ({percentual}%).
            </p>

            {resultado !== null && resultado.total > 0 && (
              <p className="mt-2 text-sm" style={{ color: tudo ? 'var(--color-success)' : 'var(--color-secondary)' }}>
                {tudo
                  ? `${resultado.total === 1 ? 'O requisito desta lição foi marcado' : `Os ${resultado.total} requisitos desta lição foram marcados`} como concluído${resultado.total === 1 ? '' : 's'}.`
                  : `${resultado.concluidos} de ${resultado.total} ${resultado.total === 1 ? 'requisito' : 'requisitos'} ${resultado.total === 1 ? 'ficou marcado' : 'ficaram marcados'} como concluído${resultado.concluidos === 1 ? '' : 's'}. São necessários ${LIMIAR_DOMINIO}% de acerto — refaça a lição para completar o restante. Seu melhor resultado é o que vale.`}
              </p>
            )}

            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              {resultado !== null && !tudo && (
                <button onClick={refazer} className="btn-primary">
                  <RefreshCw className="w-4 h-4 mr-1" /> Refazer a lição
                </button>
              )}
              <button onClick={() => navigate(`/especialidade/${specialty.code}`)} className={resultado !== null && !tudo ? 'btn-secondary' : 'btn-primary'}>
                Voltar para a Trilha <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
