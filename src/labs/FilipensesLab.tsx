import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  BookOpen, Lightbulb, RotateCcw, CheckCircle2, AlertCircle, Filter, PenLine,
} from 'lucide-react';

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

/**
 * Filipenses 4:8 — requirement AP034-8.1: learn *and apply* the principle.
 *
 * The bug this rewrite fixes was severe enough to make the lab impossible to
 * finish. `shuffle()` was called straight from the render body, guarded by
 * `if (shuffledWords.length === 0)`. Placing the last word emptied the bank,
 * which satisfied that condition on the next render, which called `shuffle()`,
 * which cleared the answer. The verse erased itself at the exact moment it was
 * completed, and the only feedback was an `alert` saying the order was wrong.
 *
 * Beyond the fix: the lab now corrects as the student builds, word by word,
 * offers a hint that places the next correct word, and then asks for the half of
 * the requirement that was missing entirely — applying the verse as a filter to
 * things that actually happen online.
 */

/* João Ferreira de Almeida (domínio público). */
const VERSE = 'Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se alguma virtude há, se algum louvor existe, nisso pensai.';
const WORDS = VERSE.split(' ');

interface BankWord { key: number; word: string }

/** Seeded shuffle, so the bank is stable across renders and reproducible. */
function shuffled(words: string[], seed: number): BankWord[] {
  const items = words.map((word, key) => ({ key, word }));
  let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/* ── Aplicar o versículo ─────────────────────────────────────────────────── */

const CRITERIA = [
  { id: 'verdadeiro', label: 'verdadeiro' },
  { id: 'honesto', label: 'honesto' },
  { id: 'justo', label: 'justo' },
  { id: 'puro', label: 'puro' },
  { id: 'amavel', label: 'amável' },
  { id: 'boafama', label: 'de boa fama' },
  { id: 'virtude', label: 'virtude' },
  { id: 'louvor', label: 'louvor' },
  { id: 'nenhum', label: 'não quebra nenhum' },
] as const;

type CriterionId = typeof CRITERIA[number]['id'];

interface Situation { id: string; text: string; answer: CriterionId; why: string }

const SITUATIONS: Situation[] = [
  {
    id: 's1', answer: 'verdadeiro',
    text: 'Um vídeo afirma que um remédio comum causa uma doença grave. Não cita fonte nenhuma, e já tem 2 milhões de compartilhamentos.',
    why: 'O primeiro filtro do versículo é o mais simples e o mais esquecido: isto é verdade? Número de compartilhamentos não é prova de nada.',
  },
  {
    id: 's2', answer: 'honesto',
    text: 'Um site oferece o trabalho escolar já pronto, para você entregar com o seu nome.',
    why: 'Entregar como seu o que outra pessoa escreveu não é atalho, é mentira sobre a autoria.',
  },
  {
    id: 's3', answer: 'puro',
    text: 'Entre um vídeo e outro aparece um anúncio com imagens que você não gostaria que sua mãe visse por cima do seu ombro.',
    why: 'O teste do ombro funciona bem: se a presença de alguém que você respeita mudaria o que você está vendo, o filtro já respondeu.',
  },
  {
    id: 's4', answer: 'amavel',
    text: 'Circula um meme engraçado que ridiculariza a aparência de um colega da escola.',
    why: 'Pode ser engraçado e mesmo assim não ser amável. O riso de muitos não compensa o constrangimento de um.',
  },
  {
    id: 's5', answer: 'justo',
    text: 'Numa discussão em grupo, todos condenam uma pessoa a partir de um print, sem que ninguém tenha ouvido o outro lado.',
    why: 'Julgar por um recorte, sem ouvir quem está sendo acusado, é o oposto de justo — e um print mostra só o que quem o tirou quis mostrar.',
  },
  {
    id: 's6', answer: 'boafama',
    text: 'Alguém começa a contar, no grupo da unidade, um problema de família de um colega que não está no grupo.',
    why: 'Falar do ausente destrói a boa fama dele, e ele não tem como se defender. O versículo pede que se pense no que é de boa fama, não no que rende conversa.',
  },
  {
    id: 's7', answer: 'nenhum',
    text: 'Um canal ensina, com muito cuidado e sem cobrar nada, como consertar bicicletas — e você aprende a arrumar a sua.',
    why: 'Nem tudo precisa ser filtrado para fora. É verdadeiro, é honesto, é útil e é bem feito: exatamente o tipo de coisa em que o versículo manda pensar.',
  },
];

const SITUATION_PASS = 5;

interface Check { id: string; label: string; passed: boolean; hint: string }

export default function FilipensesLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── Etapa 1 — montar o versículo ──────────────────────────────────────── */
  const [seed, setSeed] = useState(7);
  /**
   * The placed words and the hint count live in one state object on purpose.
   *
   * Every action here has to derive its result from the *previous* state, not
   * from the render's closure: React batches, so two fast clicks on the hint
   * button both read the same `placed` and both append word number one. That was
   * observed, not theorised — forty-five rapid clicks produced forty-five copies
   * of "Finalmente,". Keeping the two values together lets a single functional
   * updater do the whole job, which is the only form that is safe under batching.
   *
   * The state is also initialised lazily rather than by calling shuffle() from
   * the render body, which is what made the original lab erase the answer at the
   * exact moment it was completed.
   */
  const [board, setBoard] = useState<{ placed: BankWord[]; hints: number }>({ placed: [], hints: 0 });
  const { placed, hints: hintsUsed } = board;

  const bank = useMemo(() => {
    const takenKeys = new Set(placed.map(p => p.key));
    return shuffled(WORDS, seed).filter(item => !takenKeys.has(item.key));
  }, [placed, seed]);

  const firstWrongIndex = placed.findIndex((item, i) => item.word !== WORDS[i]);
  const assembled = placed.length === WORDS.length && firstWrongIndex === -1;

  const place = (item: BankWord) => setBoard(b =>
    b.placed.some(p => p.key === item.key) ? b : { ...b, placed: [...b.placed, item] });

  const takeBack = (index: number) => setBoard(b =>
    ({ ...b, placed: b.placed.filter((_, i) => i !== index) }));

  /**
   * One button, two jobs: while there is a mistake it clears from the mistake
   * onward, and once the sequence is clean it places the next correct word.
   * Correcting is free; only placing counts as a hint.
   */
  const useHint = () => setBoard(b => {
    const wrongAt = b.placed.findIndex((item, i) => item.word !== WORDS[i]);
    if (wrongAt !== -1) return { ...b, placed: b.placed.slice(0, wrongAt) };

    const nextWord = WORDS[b.placed.length];
    if (nextWord === undefined) return b;
    const taken = new Set(b.placed.map(p => p.key));
    const candidate = shuffled(WORDS, seed).find(w => !taken.has(w.key) && w.word === nextWord);
    if (!candidate) return b;
    return { placed: [...b.placed, candidate], hints: b.hints + 1 };
  });

  const restart = () => { setBoard({ placed: [], hints: 0 }); setSeed(s => s + 1); };

  const verseChecks: Check[] = [
    {
      id: 'montado', label: 'Montou o versículo inteiro na ordem certa',
      passed: assembled,
      hint: firstWrongIndex !== -1
        ? `A ${firstWrongIndex + 1}ª palavra não confere. Clique nela para devolvê-la ao banco.`
        : `${placed.length} de ${WORDS.length} palavras colocadas.`,
    },
  ];

  /* ── Etapa 2 — aplicar ─────────────────────────────────────────────────── */
  const [answers, setAnswers] = useState<Record<string, CriterionId>>({});
  const [firstAnswers, setFirstAnswers] = useState<Record<string, CriterionId>>({});

  const answer = (id: string, choice: CriterionId) => {
    setAnswers(p => ({ ...p, [id]: choice }));
    setFirstAnswers(p => (id in p ? p : { ...p, [id]: choice }));
  };

  const firstCorrect = SITUATIONS.filter(s => firstAnswers[s.id] === s.answer).length;

  const applyChecks: Check[] = [
    {
      id: 'apl-todas', label: `As ${SITUATIONS.length} situações foram filtradas`,
      passed: SITUATIONS.every(s => answers[s.id] !== undefined),
      hint: 'Para cada uma, escolha o primeiro critério do versículo que ela deixa de cumprir.',
    },
    {
      id: 'apl-acertos', label: `Acertou ao menos ${SITUATION_PASS} de ${SITUATIONS.length} de primeira`,
      passed: firstCorrect >= SITUATION_PASS,
      hint: `${firstCorrect} de ${SITUATIONS.length} na primeira resposta. Leia as explicações e use "Recomeçar esta etapa".`,
    },
  ];

  /* ── Etapa 3 — compromisso ─────────────────────────────────────────────── */
  const [commitment, setCommitment] = useState('');
  const commitmentChecks: Check[] = [
    {
      id: 'compromisso', label: 'Escreveu onde vai aplicar o versículo esta semana',
      passed: commitment.trim().length >= 50,
      hint: `${commitment.trim().length} de 50 caracteres. Seja concreto: um lugar, um momento, uma decisão.`,
    },
  ];

  const allChecks = [...verseChecks, ...applyChecks, ...commitmentChecks];
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed',
        mastery_score: Math.round((firstCorrect / SITUATIONS.length) * 100),
        checkpoint_passed: true, retention_passed: true,
        attempts: 1, correct_count: firstCorrect, total_questions: SITUATIONS.length,
      });
    }
    await logActivity(userId, 'filipenses_completed', { specialtyCode, lessonCode,
      dicasUsadas: hintsUsed, situacoesDePrimeira: firstCorrect,
    });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">Filipenses 4:8 concluído!</h1>
        <div
          className="rounded-lg p-4 mb-4 max-w-2xl mx-auto text-left"
          style={{ backgroundColor: 'var(--color-tertiary-a10)', border: '1px solid var(--color-tertiary-a20)' }}
        >
          <p className="italic" style={{ color: 'var(--color-text)' }}>"{VERSE}"</p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Filipenses 4:8</p>
        </div>
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {hintsUsed === 0
            ? 'Você montou o versículo sem usar nenhuma dica.'
            : `Você montou o versículo usando ${hintsUsed} ${hintsUsed === 1 ? 'dica' : 'dicas'}.`}{' '}
          E acertou {firstCorrect} de {SITUATIONS.length} situações na primeira resposta.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Filipenses 4:8
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Duas metades: aprender o versículo e usá-lo. A segunda é a que muda alguma
          coisa — os oito critérios funcionam como um filtro para o que você lê,
          compartilha e comenta. Ninguém fica travado aqui: a montagem corrige palavra por
          palavra e há dica sempre que precisar.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {allChecks.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>verificações atendidas</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir laboratório'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(passedCount / allChecks.length) * 100}%`,
              background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      {/* ── Etapa 1 ── */}
      <StageCard title="1. Montar o versículo" icon={BookOpen} checks={verseChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Clique nas palavras na ordem certa. Cada palavra é conferida na hora: verde está
          no lugar, vermelha não está. Clique numa palavra já colocada para devolvê-la.
        </p>

        <div
          className="min-h-[110px] p-3 rounded-lg mb-2"
          style={{ backgroundColor: 'var(--color-bg-input)', border: '1px dashed var(--color-border)' }}
        >
          {placed.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
              A primeira palavra é "Finalmente,".
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {placed.map((item, i) => {
                const right = item.word === WORDS[i];
                return (
                  <button
                    key={`${item.key}-${i}`}
                    onClick={() => takeBack(i)}
                    className="px-2.5 py-1 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: right ? 'var(--color-success-a10)' : 'var(--color-error-a20)',
                      color: right ? 'var(--color-text)' : 'var(--color-error)',
                      border: `1px solid ${right ? 'var(--color-success-a20)' : 'var(--color-error)'}`,
                    }}
                    title="Clique para devolver ao banco"
                  >
                    {item.word}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <button onClick={useHint} disabled={assembled} className="btn-secondary text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            {firstWrongIndex !== -1 ? 'Corrigir a partir do erro' : 'Dica: colocar a próxima palavra'}
          </button>
          <button onClick={restart} className="btn-secondary text-xs">
            <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar
          </button>
          <span className="text-xs self-center" style={{ color: 'var(--color-text-dim)' }}>
            {placed.length}/{WORDS.length} palavras
            {hintsUsed > 0 && ` · ${hintsUsed} ${hintsUsed === 1 ? 'dica' : 'dicas'}`}
          </span>
        </div>

        {!assembled && (
          <div className="flex flex-wrap gap-1.5">
            {bank.map(item => (
              <button
                key={item.key}
                onClick={() => place(item)}
                className="px-2.5 py-1 rounded-lg text-sm transition"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {item.word}
              </button>
            ))}
          </div>
        )}

        {assembled && (
          <p className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-a10)', color: 'var(--color-success)' }}>
            Versículo completo e na ordem certa.
          </p>
        )}
      </StageCard>

      {/* ── Etapa 2 ── */}
      <StageCard title="2. Usar o versículo como filtro" icon={Filter} checks={applyChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Cada situação abaixo acontece de verdade na internet. Escolha o{' '}
          <strong style={{ color: 'var(--color-text)' }}>primeiro</strong> critério do
          versículo que ela deixa de cumprir — e note que uma delas não deixa de cumprir
          nenhum.
        </p>

        {Object.keys(firstAnswers).length > 0 && firstCorrect < SITUATION_PASS && (
          <button
            onClick={() => { setAnswers({}); setFirstAnswers({}); }}
            className="btn-secondary text-xs mb-3"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar esta etapa
          </button>
        )}

        <ul className="space-y-3">
          {SITUATIONS.map(s => {
            const given = answers[s.id];
            const answered = given !== undefined;
            const right = answered && given === s.answer;
            const correctLabel = CRITERIA.find(c => c.id === s.answer)?.label ?? '';
            return (
              <li
                key={s.id}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: !answered ? 'var(--color-bg-input)'
                    : right ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
                  border: `1px solid ${!answered ? 'var(--color-border)' : right ? 'var(--color-success-a20)' : 'var(--color-error-a20)'}`,
                }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>{s.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {CRITERIA.map(c => (
                    <button
                      key={c.id}
                      onClick={() => answer(s.id, c.id)}
                      className="px-2.5 py-1 rounded-full text-xs transition"
                      style={{
                        backgroundColor: given === c.id ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                        color: given === c.id ? '#ffffff' : 'var(--color-text-soft)',
                        border: `1px solid ${given === c.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {answered && (
                  <div className="mt-2 text-xs">
                    <p className="font-bold" style={{ color: right ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {right ? 'Correto.' : `Não é isso — o critério é "${correctLabel}".`}
                    </p>
                    <p style={{ color: 'var(--color-text-soft)' }}>{s.why}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </StageCard>

      {/* ── Etapa 3 ── */}
      <StageCard title="3. Onde isso muda a sua semana" icon={PenLine} checks={commitmentChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Decorar o versículo não muda nada sozinho. Escreva um lugar concreto onde você
          vai usar esse filtro nos próximos dias — um grupo, um aplicativo, um hábito.
        </p>
        <textarea
          value={commitment}
          onChange={e => setCommitment(e.target.value)}
          rows={3}
          className="input-field"
          placeholder="Ex: Antes de encaminhar qualquer coisa no grupo da unidade, vou conferir se é verdade e se não fala mal de alguém que não está lá."
          aria-label="Onde vou aplicar o versículo"
        />
      </StageCard>
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

function StageCard({ title, icon: Icon, checks, children }: {
  title: string; icon: typeof BookOpen; checks: Check[]; children: ReactNode;
}) {
  const done = checks.filter(c => c.passed).length;
  const complete = done === checks.length;
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-bold flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-primary-a10)' }}
          >
            <Icon className="w-5 h-5" style={{ color: complete ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </span>
          {title}
        </h2>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-bg-hover)',
            color: complete ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        >
          {done}/{checks.length}
        </span>
      </div>

      {children}

      <ul className="mt-4 space-y-2">
        {checks.map(c => (
          <li
            key={c.id}
            className="flex items-start gap-2 text-sm p-2 rounded-lg"
            style={{ backgroundColor: c.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}
          >
            {c.passed
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
            <div className="min-w-0">
              <span className="font-medium" style={{ color: c.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>
                {c.label}
              </span>
              {!c.passed && <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{c.hint}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
