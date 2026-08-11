import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { Sparkles, FileText, Image as ImageIcon, Palette, CheckCircle2, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const sampleTexts: Record<string, string> = {
  default: `A inteligência artificial é um campo da computação que busca criar sistemas capazes de aprender, raciocinar e executar tarefas que normalmente requerem inteligência humana. Existem diferentes tipos de IA: a IA estreita, especializada em uma tarefa específica, e a IA generativa, que cria novo conteúdo a partir de instruções.`,
  education: `A IA na educação pode personalizar o aprendizado, adaptando o conteúdo ao ritmo de cada aluno. No entanto, é importante lembrar que a IA é uma ferramenta, não um substituto para o pensamento crítico humano.`,
  internet: `A Internet conectou bilhões de dispositivos globalmente, transformando a comunicação, o aprendizado e o trabalho. A IA agora está moldando a próxima fase dessa evolução, com assistentes que podem gerar texto, imagens e código.`,
};

const sampleImages: Record<string, { description: string; color: string }[]> = {
  default: [
    { description: 'Montanha ao pôr do sol com tons de laranja e roxo', color: '#F5A623' },
    { description: 'Floresta tropical com cachoeira', color: '#22c55e' },
  ],
  logo: [
    { description: 'Logo circular com bandeira e estrelas', color: '#1B2E8C' },
    { description: 'Logo triangular com fogo e bússola', color: '#C13516' },
  ],
};

export default function AILab({ specialtyCode, requirementCodes, userId }: Props) {
  const [textPrompt, setTextPrompt] = useState('');
  const [textResult, setTextResult] = useState('');
  const [textTopic, setTextTopic] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState<{ description: string; color: string } | null>(null);
  const [logoClubName, setLogoClubName] = useState('');
  const [logoResult, setLogoResult] = useState<{ description: string; color: string } | null>(null);
  const [evaluation, setEvaluation] = useState<{ positives: string; improvements: string; rating: 'good' | 'bad' | null }>({ positives: '', improvements: '', rating: null });
  const [completed, setCompleted] = useState(false);

  const tasks = [
    { id: 'text', label: 'Gerar texto com IA e avaliar qualidade', done: !!textResult && !!textTopic },
    { id: 'image', label: 'Gerar imagem com IA', done: !!imageResult },
    { id: 'logo', label: 'Gerar logo para o clube', done: !!logoResult },
    { id: 'evaluate', label: 'Avaliar criticamente os resultados', done: !!evaluation.positives.trim() && !!evaluation.improvements.trim() && evaluation.rating !== null },
  ];
  const allDone = tasks.every(t => t.done);

  const generateText = () => {
    const topic = textPrompt.toLowerCase();
    let result = sampleTexts.default;
    if (topic.includes('educa')) result = sampleTexts.education;
    else if (topic.includes('internet')) result = sampleTexts.internet;
    setTextResult(result);
    setTextTopic(textPrompt);
    logActivity(userId, 'ai_text_generated', { prompt: textPrompt });
  };

  const generateImage = () => {
    const key = imagePrompt.toLowerCase().includes('logo') ? 'logo' : 'default';
    const options = sampleImages[key];
    setImageResult(options[Math.floor(Math.random() * options.length)]);
    logActivity(userId, 'ai_image_generated', { prompt: imagePrompt });
  };

  const generateLogo = () => {
    const options = sampleImages.logo;
    setLogoResult(options[Math.floor(Math.random() * options.length)]);
    logActivity(userId, 'ai_logo_generated', { clubName: logoClubName });
  };

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: tasks.filter(t => t.done).length, total_questions: tasks.length,
      });
    }
    await logActivity(userId, 'ai_lab_completed', {});
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
          <h1 className="text-2xl font-bold mb-2">AI Lab Concluído!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Você usou IA para gerar texto, imagem e logo, e avaliou criticamente os resultados.
          </p>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
        </div>
      </div>
    );
  }

  const resultBox = { backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} /> AI Lab — Produção com IA
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Use IA para gerar texto, imagem e logo para o seu clube. Depois, avalie criticamente os resultados —
          lembre-se: a IA é uma ferramenta, não um substituto para o pensamento crítico.
        </p>
      </div>

      {/* Text generation */}
      <div className="card p-6">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> 1. Gerar Texto
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-dim)' }}>
          Digite um prompt (ex: "O que é IA?", "IA na educação", "IA e Internet") e veja o texto gerado.
        </p>
        <div className="flex gap-2">
          <input value={textPrompt} onChange={e => setTextPrompt(e.target.value)} className="input-field" placeholder="Digite seu prompt..." />
          <button onClick={generateText} disabled={!textPrompt.trim()} className="btn-primary">Gerar</button>
        </div>
        {textResult && (
          <div className="mt-3 p-4 rounded-lg" style={resultBox}>
            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-secondary)' }}>Texto gerado para: "{textTopic}"</p>
            <p className="text-sm">{textResult}</p>
            <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-dim)' }}>
              <strong>Avalie:</strong> O texto é factualmente correto? Há informações que precisariam de verificação?
              A IA pode ter "alucinado" (criado informações incorretas)?
            </div>
          </div>
        )}
      </div>

      {/* Image generation */}
      <div className="card p-6">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> 2. Gerar Imagem
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-dim)' }}>
          Descreva uma imagem (ex: "montanha ao pôr do sol", "logo do clube").
        </p>
        <div className="flex gap-2">
          <input value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} className="input-field" placeholder="Descreva a imagem..." />
          <button onClick={generateImage} disabled={!imagePrompt.trim()} className="btn-primary">Gerar</button>
        </div>
        {imageResult && (
          <div className="mt-3 p-4 rounded-lg" style={resultBox}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: imageResult.color }}>
                <ImageIcon className="w-8 h-8 text-white opacity-50" />
              </div>
              <div>
                <p className="text-xs mb-1 font-medium" style={{ color: 'var(--color-secondary)' }}>Imagem gerada (demonstração)</p>
                <p className="text-sm">{imageResult.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo generation */}
      <div className="card p-6">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> 3. Gerar Logo do Clube
        </h2>
        <input value={logoClubName} onChange={e => setLogoClubName(e.target.value)} className="input-field mb-2" placeholder="Nome do clube (ex: Clube de Desbravadores)" />
        <button onClick={generateLogo} disabled={!logoClubName.trim()} className="btn-primary">Gerar Logo</button>
        {logoResult && (
          <div className="mt-3 p-4 rounded-lg" style={resultBox}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: logoResult.color }}>
                <Palette className="w-8 h-8 text-white opacity-50" />
              </div>
              <div>
                <p className="text-xs mb-1 font-medium" style={{ color: 'var(--color-secondary)' }}>Logo para: {logoClubName}</p>
                <p className="text-sm">{logoResult.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Critical evaluation */}
      <div className="card p-6">
        <h2 className="font-bold mb-2">4. Avaliação Crítica dos Resultados</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-dim)' }}>
          Avalie os resultados gerados pela IA. Seja honesto — a IA nem sempre produz resultados perfeitos.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Pontos positivos — o que a IA fez bem?</label>
            <textarea value={evaluation.positives} onChange={e => setEvaluation(prev => ({ ...prev, positives: e.target.value }))} rows={2} className="input-field" placeholder="Ex: O texto foi gerado rapidamente e tem boa estrutura..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Melhorias necessárias — o que poderia ser melhor?</label>
            <textarea value={evaluation.improvements} onChange={e => setEvaluation(prev => ({ ...prev, improvements: e.target.value }))} rows={2} className="input-field" placeholder="Ex: O texto precisa de verificação factual, a imagem poderia ter mais detalhes..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-soft)' }}>Avaliação geral: os resultados da IA são confiáveis sem revisão humana?</label>
            <div className="flex gap-2">
              <button onClick={() => setEvaluation(prev => ({ ...prev, rating: 'good' }))}
                className="btn-secondary text-sm flex items-center gap-1"
                style={evaluation.rating === 'good' ? { backgroundColor: 'var(--color-success-a10)', color: 'var(--color-success)', borderColor: 'var(--color-success)' } : {}}>
                <ThumbsUp className="w-4 h-4" /> Sim, com revisão
              </button>
              <button onClick={() => setEvaluation(prev => ({ ...prev, rating: 'bad' }))}
                className="btn-secondary text-sm flex items-center gap-1"
                style={evaluation.rating === 'bad' ? { backgroundColor: 'var(--color-error-a10)', color: 'var(--color-error)', borderColor: 'var(--color-error)' } : {}}>
                <ThumbsDown className="w-4 h-4" /> Não, precisa revisão
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">Tarefas ({tasks.filter(t => t.done).length}/{tasks.length})</h2>
        <ul className="space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              {t.done ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />}
              <span style={{ color: t.done ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleComplete} disabled={!allDone} className="btn-primary w-full">
        {allDone ? 'Concluir AI Lab' : 'Complete todas as tarefas'}
      </button>
    </div>
  );
}
