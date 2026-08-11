import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { Image as ImageIcon, CheckCircle2, MousePointerClick, Layout } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

interface ImageTask {
  id: string;
  title: string;
  description: string;
  icon: typeof ImageIcon;
  question: string;
  correctFormat: 'jpeg' | 'png' | 'gif';
  options: { value: 'jpeg' | 'png' | 'gif'; label: string; desc: string }[];
  hint: string;
}

const tasks: ImageTask[] = [
  {
    id: 'photo',
    title: 'Imagem JPEG (Fotografia)',
    description: 'Você precisa salvar uma fotografia com milhões de cores e gradientes suaves para um site.',
    icon: ImageIcon,
    question: 'Qual formato de imagem é mais adequado para esta fotografia?',
    correctFormat: 'jpeg',
    options: [
      { value: 'jpeg', label: 'JPEG', desc: 'Compressão com perda, ideal para fotos com milhões de cores' },
      { value: 'png', label: 'PNG', desc: 'Sem perda, suporta transparência, mas arquivo maior para fotos' },
      { value: 'gif', label: 'GIF', desc: 'Apenas 256 cores — não adequado para fotos' },
    ],
    hint: 'Fotografias têm milhões de cores e gradientes. Qual formato comprime melhor esse tipo de imagem?',
  },
  {
    id: 'logo',
    title: 'Imagem PNG (Logo com transparência)',
    description: 'Você precisa criar um logo com fundo transparente para usar sobre diferentes cores de fundo.',
    icon: Layout,
    question: 'Qual formato preserva a transparência e a qualidade do logo?',
    correctFormat: 'png',
    options: [
      { value: 'jpeg', label: 'JPEG', desc: 'Não suporta transparência — o fundo ficaria branco' },
      { value: 'png', label: 'PNG', desc: 'Suporta transparência com canal alpha e compressão sem perda' },
      { value: 'gif', label: 'GIF', desc: 'Suporta transparência, mas apenas 256 cores' },
    ],
    hint: 'Logos precisam de transparência e qualidade sem perda. GIF tem poucas cores, JPEG não tem transparência.',
  },
  {
    id: 'button',
    title: 'Botão Web Animado',
    description: 'Você quer criar um botão animado curto para o site — uma pequena animação de clique.',
    icon: MousePointerClick,
    question: 'Qual formato suporta animação para um botão web?',
    correctFormat: 'gif',
    options: [
      { value: 'jpeg', label: 'JPEG', desc: 'Não suporta animação' },
      { value: 'png', label: 'PNG', desc: 'Não suporta animação (APNG existe mas não é padrão)' },
      { value: 'gif', label: 'GIF', desc: 'Suporta animação com múltiplos frames' },
    ],
    hint: 'Apenas um destes formatos suporta animação de frames múltiplos.',
  },
  {
    id: 'header',
    title: 'Header do Site',
    description: 'Você precisa criar um cabeçalho (header) para o site com texto nítido e cores sólidas — sem necessidade de transparência.',
    icon: Layout,
    question: 'Qual formato mantém o texto nítido e o arquivo pequeno para um header com cores sólidas?',
    correctFormat: 'png',
    options: [
      { value: 'jpeg', label: 'JPEG', desc: 'Cria artefatos ao redor de texto nítido e bordas sólidas' },
      { value: 'png', label: 'PNG', desc: 'Mantém bordas nítidas e texto claro, ideal para gráficos com cores sólidas' },
      { value: 'gif', label: 'GIF', desc: 'Funciona, mas limita a 256 cores' },
    ],
    hint: 'Texto e bordas nítidas ficam ruins com compressão JPEG. PNG preserva a nitidez sem perda.',
  },
];

export default function ImageLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [answers, setAnswers] = useState<Record<string, 'jpeg' | 'png' | 'gif'>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const allCorrect = tasks.every(t => answers[t.id] === t.correctFormat);
  const correctCount = tasks.filter(t => answers[t.id] === t.correctFormat).length;

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: Math.round((correctCount / tasks.length) * 100),
        checkpoint_passed: true, attempts: 1, correct_count: correctCount, total_questions: tasks.length,
      });
    }
    await logActivity(userId, 'image_lab_completed', { correctCount });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">ImageLab Concluído!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Você acertou {correctCount} de {tasks.length} desafios de formato de imagem.
          </p>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> ImageLab — Formatos de Imagem
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Para cada cenário abaixo, escolha o formato de imagem mais adequado (JPEG, PNG ou GIF).
          Pense nas características de cada formato antes de responder.
        </p>
      </div>

      {tasks.map((task, idx) => {
        const Icon = task.icon;
        const answered = answers[task.id];
        const isCorrect = answered === task.correctFormat;
        return (
          <div key={task.id} className="card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-a10)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold mb-1">Desafio {idx + 1}: {task.title}</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{task.description}</p>
              </div>
            </div>
            <p className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>{task.question}</p>
            <div className="space-y-2">
              {task.options.map(opt => {
                const selected = answered === opt.value;
                const showCorrect = answered && opt.value === task.correctFormat;
                const showWrong = selected && !isCorrect;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers(prev => ({ ...prev, [task.id]: opt.value }))}
                    disabled={!!answered}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      showCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' :
                      showWrong ? 'border-[var(--color-error)] bg-[var(--color-error-a10)]' :
                      selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' :
                      'border-[var(--color-border)] hover:border-[var(--color-primary-a40)]'
                    } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="font-bold" style={{ color: showCorrect ? 'var(--color-success)' : showWrong ? 'var(--color-error)' : 'var(--color-text)' }}>{opt.label}</span>
                    <span className="text-sm block mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            {answered && !isCorrect && (
              <div className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error-a10)', color: 'var(--color-error)' }}>
                Resposta incorreta. {task.hint}
              </div>
            )}
            {answered && isCorrect && (
              <div className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-success-a10)', color: 'var(--color-success)' }}>
                Correto! {task.hint}
              </div>
            )}
            {!answered && (
              <button onClick={() => setShowHints(prev => ({ ...prev, [task.id]: !prev[task.id] }))} className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
                {showHints[task.id] ? 'Ocultar dica' : 'Ver dica'}
              </button>
            )}
            {showHints[task.id] && !answered && (
              <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-dim)' }}>{task.hint}</p>
            )}
          </div>
        );
      })}

      <div className="card p-4">
        <h2 className="font-bold mb-3">Progresso ({correctCount}/{tasks.length} corretas)</h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {allCorrect ? 'Todos os desafios foram respondidos corretamente!' : 'Responda todos os desafios corretamente para concluir.'}
        </p>
        <button onClick={handleComplete} disabled={!allCorrect} className="btn-primary w-full">
          {allCorrect ? 'Concluir ImageLab' : 'Complete todos os desafios corretamente'}
        </button>
      </div>
    </div>
  );
}
