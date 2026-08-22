import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { Sparkles, Image as ImageIcon, Palette, CheckCircle2, AlertCircle, ThumbsUp, ThumbsDown, FileText, Loader2 } from 'lucide-react';

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

type Stage = 'text' | 'image' | 'logo' | 'review';

/**
 * Prompts are assembled from fixed options plus one short free field rather than
 * typed freely. Two reasons, in order of importance: the students are minors, and
 * a closed vocabulary means there is no open channel to a generative model; and
 * building a prompt from named parts (subject, audience, tone, length) is what
 * actually teaches prompt writing — a blank box teaches nothing.
 */
const TEXT_OPTIONS = {
  subject: [
    // First on the list because AP035-8.1 asks for this one by name; the others
    // are there so the student still chooses rather than obeys.
    { id: 'importancia', label: 'A importância do Clube de Desbravadores' },
    { id: 'historia', label: 'A história do nosso clube' },
    { id: 'acampamento', label: 'Um acampamento de fim de semana' },
    { id: 'especialidade', label: 'Por que estudar a especialidade de Internet' },
    { id: 'servico', label: 'Um projeto de serviço à comunidade' },
  ],
  audience: [
    { id: 'pais', label: 'para os pais dos desbravadores' },
    { id: 'novos', label: 'para quem quer entrar no clube' },
    { id: 'igreja', label: 'para ser lido na igreja' },
  ],
  tone: [
    { id: 'convite', label: 'em tom de convite' },
    { id: 'informativo', label: 'em tom informativo' },
    { id: 'entusiasmado', label: 'em tom entusiasmado' },
  ],
  length: [
    { id: 'curto', label: 'em 1 parágrafo curto' },
    { id: 'medio', label: 'em 2 parágrafos' },
  ],
};

const IMAGE_OPTIONS = {
  scene: [
    { id: 'barraca', label: 'barracas montadas em um acampamento' },
    { id: 'fogueira', label: 'uma roda de conversa ao redor da fogueira' },
    { id: 'trilha', label: 'um grupo caminhando por uma trilha na mata' },
    { id: 'bandeira', label: 'o mastro com a bandeira do clube' },
  ],
  time: [
    { id: 'manha', label: 'de manhã cedo' },
    { id: 'tarde', label: 'ao fim da tarde' },
    { id: 'noite', label: 'à noite' },
  ],
  style: [
    { id: 'ilustracao', label: 'em estilo de ilustração colorida' },
    { id: 'aquarela', label: 'em estilo aquarela' },
    { id: 'cartoon', label: 'em estilo cartoon' },
  ],
};

const LOGO_OPTIONS = {
  shape: [
    { id: 'escudo', label: 'em formato de escudo' },
    { id: 'circulo', label: 'em formato circular' },
    { id: 'triangulo', label: 'em formato triangular' },
  ],
  symbol: [
    { id: 'arvore', label: 'com uma árvore' },
    { id: 'montanha', label: 'com uma montanha' },
    { id: 'bussola', label: 'com uma bússola' },
    { id: 'chama', label: 'com uma chama' },
  ],
  colors: [
    { id: 'verde', label: 'nas cores verde e dourado' },
    { id: 'azul', label: 'nas cores azul e branco' },
    { id: 'vermelho', label: 'nas cores vermelho e preto' },
  ],
};

const MAX_FREE_TEXT = 60;

function Picker({ label, options, value, onChange }: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm">
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function AILab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const [stage, setStage] = useState<Stage>('text');
  const [completed, setCompleted] = useState(false);

  const [textSel, setTextSel] = useState({ subject: 'importancia', audience: 'pais', tone: 'convite', length: 'curto' });
  const [imageSel, setImageSel] = useState({ scene: 'barraca', time: 'tarde', style: 'ilustracao' });
  const [logoSel, setLogoSel] = useState({ shape: 'escudo', symbol: 'arvore', colors: 'verde' });
  const [clubName, setClubName] = useState('');
  const [extra, setExtra] = useState('');

  const [textOut, setTextOut] = useState('');
  const [imageOut, setImageOut] = useState('');
  const [logoOut, setLogoOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);

  const [critique, setCritique] = useState({ good: '', improve: '' });

  const pick = (opts: { id: string; label: string }[], id: string) =>
    opts.find(o => o.id === id)?.label ?? '';

  const textPrompt = useMemo(() => {
    const base = `Escreva um texto ${pick(TEXT_OPTIONS.tone, textSel.tone)} sobre ${pick(TEXT_OPTIONS.subject, textSel.subject).toLowerCase()}, ${pick(TEXT_OPTIONS.audience, textSel.audience)}, ${pick(TEXT_OPTIONS.length, textSel.length)}. Escreva em português do Brasil, com linguagem adequada a adolescentes.`;
    return extra.trim() ? `${base} Inclua também: ${extra.trim()}.` : base;
  }, [textSel, extra]);

  const imagePrompt = useMemo(
    () => `Uma imagem mostrando ${pick(IMAGE_OPTIONS.scene, imageSel.scene)}, ${pick(IMAGE_OPTIONS.time, imageSel.time)}, ${pick(IMAGE_OPTIONS.style, imageSel.style)}. Ambiente de acampamento juvenil, seguro e alegre, sem rostos reconhecíveis.`,
    [imageSel]
  );

  /**
   * The one free field that reaches an image model.
   *
   * Text goes to Gemini, whose safety filters are set to their strictest usable
   * level. Images go to Cloudflare's FLUX, which has no equivalent — so the
   * safety has to come from the input instead. Reducing the name to letters,
   * digits and spaces makes the set of prompts this lab can produce finite and
   * inspectable, rather than trusting a model to refuse something.
   */
  const safeClubName = useMemo(
    () => clubName.normalize('NFC').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40),
    [clubName]
  );

  const logoPrompt = useMemo(
    () => `Um logotipo simples e limpo para um clube de desbravadores${safeClubName ? ` chamado "${safeClubName}"` : ''}, ${pick(LOGO_OPTIONS.shape, logoSel.shape)}, ${pick(LOGO_OPTIONS.symbol, logoSel.symbol)}, ${pick(LOGO_OPTIONS.colors, logoSel.colors)}. Design vetorial, fundo liso, sem texto.`,
    [logoSel, safeClubName]
  );

  const callAI = async (type: 'text' | 'image', prompt: string): Promise<{ result?: string; error?: string }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'Sessão expirada. Entre novamente.' };
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, prompt, userId }),
    });
    const data = await res.json();
    if (data.notConfigured) { setNotConfigured(true); return { error: data.error }; }
    if (!res.ok || data.error) return { error: data.error || 'Erro ao gerar.' };
    return { result: data.result };
  };

  const generate = async (kind: Stage) => {
    setBusy(true); setError('');
    const spec = kind === 'text'
      ? { type: 'text' as const, prompt: textPrompt, set: setTextOut }
      : kind === 'image'
        ? { type: 'image' as const, prompt: imagePrompt, set: setImageOut }
        : { type: 'image' as const, prompt: logoPrompt, set: setLogoOut };

    const { result, error: err } = await callAI(spec.type, spec.prompt);
    if (err) setError(err); else if (result) spec.set(result);
    setBusy(false);
  };

  const canFinish = !!textOut && !!imageOut && !!logoOut
    && critique.good.trim().length >= 15 && critique.improve.trim().length >= 15;

  const handleComplete = async () => {
    setBusy(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: 3, total_questions: 3,
      });
    }
    await logActivity(userId, 'ai_lab_completed', {
      critiquePositive: critique.good.slice(0, 200),
      critiqueImprovement: critique.improve.slice(0, 200),
    });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">AI Lab concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você produziu texto, imagem e logotipo com inteligência artificial — e, mais
          importante, avaliou criticamente o que a ferramenta entregou.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  const stages: { id: Stage; label: string; icon: typeof Sparkles; done: boolean }[] = [
    { id: 'text', label: 'Texto', icon: FileText, done: !!textOut },
    { id: 'image', label: 'Imagem', icon: ImageIcon, done: !!imageOut },
    { id: 'logo', label: 'Logotipo', icon: Palette, done: !!logoOut },
    { id: 'review', label: 'Avaliação', icon: ThumbsUp, done: canFinish },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} /> AI Lab — Produção com IA
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Você vai montar pedidos (<em>prompts</em>) escolhendo cada parte: o assunto, para
          quem é, o tom e o tamanho. Depois compara o que pediu com o que a IA
          devolveu. Um bom pedido gera um bom resultado — é isso que este laboratório ensina.
        </p>
      </div>

      {notConfigured && (
        <div className="card p-4 flex items-start gap-2" style={{ borderColor: 'var(--color-warning-a10)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-warning)' }} />
          <div className="text-sm">
            <p style={{ color: 'var(--color-text)' }}>A integração com IA ainda não foi ativada.</p>
            <p style={{ color: 'var(--color-text-dim)' }}>
              O administrador precisa cadastrar a chave do Gemini no servidor. Enquanto isso,
              você pode montar os pedidos e ver como um prompt é construído.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {stages.map(s => {
          const Icon = s.icon;
          const active = stage === s.id;
          return (
            <button key={s.id} onClick={() => setStage(s.id)}
              className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition"
              style={{
                backgroundColor: active ? 'var(--color-primary-a15)' : 'var(--color-bg-input)',
                border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}>
              {s.done ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <Icon className="w-4 h-4" />}
              {s.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="card p-3 flex items-center gap-2 text-sm" style={{ borderColor: 'var(--color-error-a20)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
          <span style={{ color: 'var(--color-error)' }}>{error}</span>
        </div>
      )}

      {stage === 'text' && (
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-sm">1. Texto para divulgar o clube</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Picker label="Assunto" options={TEXT_OPTIONS.subject} value={textSel.subject} onChange={v => setTextSel({ ...textSel, subject: v })} />
            <Picker label="Para quem" options={TEXT_OPTIONS.audience} value={textSel.audience} onChange={v => setTextSel({ ...textSel, audience: v })} />
            <Picker label="Tom" options={TEXT_OPTIONS.tone} value={textSel.tone} onChange={v => setTextSel({ ...textSel, tone: v })} />
            <Picker label="Tamanho" options={TEXT_OPTIONS.length} value={textSel.length} onChange={v => setTextSel({ ...textSel, length: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>
              Detalhe extra (opcional, até {MAX_FREE_TEXT} caracteres)
            </label>
            <input value={extra} maxLength={MAX_FREE_TEXT} onChange={e => setExtra(e.target.value)}
              className="input-field text-sm" placeholder="ex.: citar a data do próximo encontro" />
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>Seu pedido ficou assim:</p>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-soft)' }}>{textPrompt}</p>
          </div>
          <button onClick={() => generate('text')} disabled={busy} className="btn-primary w-full">
            {busy ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4 mr-1" /> Gerar texto</>}
          </button>
          {textOut && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-a10)', border: '1px solid var(--color-success-a20)' }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{textOut}</p>
            </div>
          )}
        </div>
      )}

      {stage === 'image' && (
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-sm">2. Imagem de uma cena do clube</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Picker label="Cena" options={IMAGE_OPTIONS.scene} value={imageSel.scene} onChange={v => setImageSel({ ...imageSel, scene: v })} />
            <Picker label="Momento" options={IMAGE_OPTIONS.time} value={imageSel.time} onChange={v => setImageSel({ ...imageSel, time: v })} />
            <Picker label="Estilo" options={IMAGE_OPTIONS.style} value={imageSel.style} onChange={v => setImageSel({ ...imageSel, style: v })} />
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>Seu pedido ficou assim:</p>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-soft)' }}>{imagePrompt}</p>
          </div>
          <button onClick={() => generate('image')} disabled={busy} className="btn-primary w-full">
            {busy ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando...</> : <><ImageIcon className="w-4 h-4 mr-1" /> Gerar imagem</>}
          </button>
          {imageOut && <img src={imageOut} alt="Imagem gerada pela IA" className="w-full rounded-lg" style={{ border: '1px solid var(--color-border)' }} />}
        </div>
      )}

      {stage === 'logo' && (
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-sm">3. Logotipo do clube</h2>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Nome do clube (opcional)</label>
            <input value={clubName} maxLength={40} onChange={e => setClubName(e.target.value)} className="input-field text-sm" placeholder="ex.: Clube Pioneiros" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Picker label="Formato" options={LOGO_OPTIONS.shape} value={logoSel.shape} onChange={v => setLogoSel({ ...logoSel, shape: v })} />
            <Picker label="Símbolo" options={LOGO_OPTIONS.symbol} value={logoSel.symbol} onChange={v => setLogoSel({ ...logoSel, symbol: v })} />
            <Picker label="Cores" options={LOGO_OPTIONS.colors} value={logoSel.colors} onChange={v => setLogoSel({ ...logoSel, colors: v })} />
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>Seu pedido ficou assim:</p>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-soft)' }}>{logoPrompt}</p>
          </div>
          <button onClick={() => generate('logo')} disabled={busy} className="btn-primary w-full">
            {busy ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando...</> : <><Palette className="w-4 h-4 mr-1" /> Gerar logotipo</>}
          </button>
          {logoOut && <img src={logoOut} alt="Logotipo gerado pela IA" className="w-full max-w-xs mx-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }} />}
        </div>
      )}

      {stage === 'review' && (
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-sm">4. Avaliação crítica</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            A IA erra, inventa fatos e às vezes ignora parte do pedido. Saber revisar é
            tão importante quanto saber pedir. Olhe os três resultados e responda:
          </p>

          {!textOut || !imageOut || !logoOut ? (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)' }}>
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              <span style={{ color: 'var(--color-text-dim)' }}>Gere o texto, a imagem e o logotipo antes de avaliar.</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                  <ThumbsUp className="w-3 h-3" /> O que a IA fez bem? (mínimo 15 caracteres)
                </label>
                <textarea value={critique.good} onChange={e => setCritique({ ...critique, good: e.target.value })}
                  rows={3} className="input-field text-sm" placeholder="ex.: o texto usou o tom de convite que eu pedi..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                  <ThumbsDown className="w-3 h-3" /> O que precisaria ser corrigido por uma pessoa? (mínimo 15 caracteres)
                </label>
                <textarea value={critique.improve} onChange={e => setCritique({ ...critique, improve: e.target.value })}
                  rows={3} className="input-field text-sm" placeholder="ex.: inventou uma data que não existe..." />
              </div>
              <button onClick={handleComplete} disabled={!canFinish || busy} className="btn-primary w-full">
                {canFinish ? 'Concluir AI Lab' : 'Responda as duas perguntas para concluir'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
