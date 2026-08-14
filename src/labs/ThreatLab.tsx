import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import {
  simulateOutbreak, detectionRate, type ClubSetup,
} from '../lib/infection';
import {
  ShieldAlert, Bug, Activity, ClipboardList, CheckCircle2, AlertCircle,
  RotateCcw, Play,
} from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

/**
 * ThreatLab — requirements AP034-4.1 to 4.4.
 *
 * This lesson used to render the PactBuilderLab: the same nine pact clauses and
 * the same three scenarios the student had already filled in one module earlier.
 * Two different requirements shared one screen, and neither was assessed.
 *
 * The middle stage is the reason this lab exists. "Keep the antivirus updated"
 * and "one unprotected computer infects everybody" are things a student can
 * repeat without believing, and no multiple-choice question can tell the
 * difference. Here they run the club's twelve machines for thirty days and watch
 * the same habits end at one infection or at twelve, depending only on how old
 * the signature file is.
 */

interface Check { id: string; label: string; passed: boolean; hint: string }

/* ── 1. Formas de receber ameaças (AP034-4.1) ────────────────────────────── */

interface Situation { id: string; text: string; risky: boolean; why: string }

const SITUATIONS: Situation[] = [
  {
    id: 'pendrive', risky: true,
    text: 'Você acha um pen drive no salão do clube e o espeta no computador para ver de quem é.',
    why: 'Mídia removível é a porta de entrada mais antiga que existe. O arquivo entra sem passar por rede nenhuma, e um pen drive perdido de propósito é uma tática conhecida.',
  },
  {
    id: 'anexo', risky: true,
    text: 'Chega um e-mail com "comprovante.pdf.exe" em anexo, de um endereço que você não conhece.',
    why: 'Anexo de remetente desconhecido, e o nome termina em .exe: é um programa disfarçado de documento.',
  },
  {
    id: 'loja', risky: false,
    text: 'Você instala um aplicativo de Bíblia pela loja oficial do seu celular.',
    why: 'A loja oficial revisa os aplicativos antes de publicá-los. Não é garantia absoluta, mas é o caminho seguro.',
  },
  {
    id: 'crack', risky: true,
    text: 'Você baixa um programa pago "ativado de graça" em um site de downloads.',
    why: 'Alguém precisou modificar o programa para tirar a trava. Quem faz isso de graça costuma cobrar de outro jeito — geralmente instalando algo junto.',
  },
  {
    id: 'link', risky: true,
    text: 'No grupo da unidade alguém manda "olha isso!" com um link encurtado e some.',
    why: 'O link encurtado esconde o destino, e a conta pode ter sido invadida. Mensagem estranha de amigo conhecido é justamente como o golpe se espalha.',
  },
  {
    id: 'atualizacao', risky: false,
    text: 'O próprio sistema avisa que há uma atualização de segurança e você instala.',
    why: 'Atualização vinda do próprio sistema fecha buracos já conhecidos. Adiar é que abre a porta.',
  },
];

/* ── 3. Prejuízos (AP034-4.4) ────────────────────────────────────────────── */

interface Damage { id: string; label: string; real: boolean; note: string }

const DAMAGES: Damage[] = [
  { id: 'arquivos', label: 'Perder fotos e trabalhos salvos no computador', real: true, note: 'É o prejuízo mais comum e o mais irreversível: sem cópia de segurança, não volta.' },
  { id: 'senhas', label: 'Ter senhas e contas roubadas', real: true, note: 'Um programa espião registra o que você digita, inclusive a senha do e-mail — que dá acesso a todo o resto.' },
  { id: 'resgate', label: 'Ter os arquivos travados com pedido de dinheiro para liberar', real: true, note: 'É o ransomware. Pagar não garante nada, e financia o próximo ataque.' },
  { id: 'spam', label: 'Enviar mensagens infectadas para os seus contatos sem saber', real: true, note: 'O prejuízo passa a ser dos outros, e a sua conta é quem leva a culpa.' },
  { id: 'lento', label: 'Computador lento, travando o tempo todo', real: true, note: 'O programa usa a máquina para o trabalho dele — minerar moeda, mandar spam — e sobra pouco para você.' },
  { id: 'conserto', label: 'Gastar com assistência técnica ou com um aparelho novo', real: true, note: 'O prejuízo em dinheiro é real, e recai sobre a família.' },
  { id: 'internet', label: 'A conta da internet fica mais cara por causa do vírus', real: false, note: 'A operadora cobra pelo plano, não pelo que trafega. Um vírus não muda a fatura.' },
  { id: 'tela', label: 'A tela do aparelho quebra', real: false, note: 'Software não quebra vidro. Vírus estragam dados e acessos, não o aparelho por fora.' },
];

const DEVICES = 12;

export default function ThreatLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── Etapa 1 ── */
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [firstAnswers, setFirstAnswers] = useState<Record<string, boolean>>({});

  const answer = (id: string, risky: boolean) => {
    setAnswers(p => ({ ...p, [id]: risky }));
    setFirstAnswers(p => (id in p ? p : { ...p, [id]: risky }));
  };

  const firstCorrect = SITUATIONS.filter(s => firstAnswers[s.id] === s.risky).length;
  const SITUATION_PASS = 5;

  const situationChecks: Check[] = [
    {
      id: 'sit-todas', label: `As ${SITUATIONS.length} situações foram avaliadas`,
      passed: SITUATIONS.every(s => answers[s.id] !== undefined),
      hint: 'Para cada situação, diga se ela é uma porta de entrada para uma ameaça.',
    },
    {
      id: 'sit-acertos', label: `Acertou ao menos ${SITUATION_PASS} de ${SITUATIONS.length} de primeira`,
      passed: firstCorrect >= SITUATION_PASS,
      hint: `${firstCorrect} de ${SITUATIONS.length} na primeira resposta. Leia as explicações e use "Recomeçar esta etapa" para tentar de novo.`,
    },
  ];

  /* ── Etapa 2 — simulador ── */
  const [setup, setSetup] = useState<ClubSetup>({
    devices: DEVICES,
    signatureAgeDays: 180,
    sharesRemovableMedia: true,
    opensUnknownAttachments: true,
    systemUpdated: false,
  });
  const [runs, setRuns] = useState<{ setup: ClubSetup; result: number }[]>([]);

  const history = useMemo(() => simulateOutbreak(setup, 30), [setup]);
  const outcome = history[history.length - 1];
  const detection = detectionRate(setup.signatureAgeDays);

  const runSimulation = () => {
    setRuns(prev => [...prev, { setup, result: outcome.infected }]);
    void logActivity(userId, 'threat_sim_run', {
      signatureAgeDays: setup.signatureAgeDays,
      infected: outcome.infected,
    });
  };

  const sawOutbreak = runs.some(r => r.result >= DEVICES - 2);
  const sawContained = runs.some(r => r.result <= 1);
  /** The comparison that isolates the antivirus: same habits, different age. */
  const sawUpdateMatter = runs.some(a => runs.some(b =>
    a.setup.sharesRemovableMedia === b.setup.sharesRemovableMedia
    && a.setup.opensUnknownAttachments === b.setup.opensUnknownAttachments
    && a.setup.systemUpdated === b.setup.systemUpdated
    && a.setup.signatureAgeDays !== b.setup.signatureAgeDays
    && Math.abs(a.result - b.result) >= 4,
  ));

  const simChecks: Check[] = [
    {
      id: 'sim-surto', label: 'Viu um surto tomar o clube inteiro',
      passed: sawOutbreak,
      hint: 'Deixe as assinaturas velhas e os hábitos ruins ligados, e rode a simulação.',
    },
    {
      id: 'sim-contido', label: 'Encontrou uma configuração que contém o surto em 1 aparelho',
      passed: sawContained,
      hint: 'Ajuste os controles até que, em 30 dias, o número de infectados não passe de 1.',
    },
    {
      id: 'sim-antivirus', label: 'Provou que só atualizar o antivírus já muda o resultado',
      passed: sawUpdateMatter,
      hint: 'Rode duas vezes com exatamente os mesmos hábitos, mudando apenas a idade das assinaturas. A diferença tem de passar de 4 aparelhos.',
    },
  ];

  /* ── Etapa 3 ── */
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [fear, setFear] = useState('');
  const realPicked = DAMAGES.filter(d => d.real && picked[d.id]).length;
  const falsePicked = DAMAGES.filter(d => !d.real && picked[d.id]).length;

  const damageChecks: Check[] = [
    {
      id: 'dano-reais', label: 'Listou ao menos 5 prejuízos que um vírus causa de verdade',
      passed: realPicked >= 5,
      hint: `${realPicked} marcados até agora.`,
    },
    {
      id: 'dano-falsos', label: 'Não marcou nenhum prejuízo que vírus não causam',
      passed: falsePicked === 0 && Object.keys(picked).length > 0,
      hint: falsePicked > 0
        ? 'Há item marcado que não é consequência de vírus. Desmarque e leia a explicação.'
        : 'Marque os prejuízos reais para conferir.',
    },
    {
      id: 'dano-texto', label: 'Escreveu, com as próprias palavras, qual prejuízo mais o preocupa',
      passed: fear.trim().length >= 40,
      hint: `${fear.trim().length} de 40 caracteres. Diga qual prejuízo pesaria mais para você e por quê.`,
    },
  ];

  const allChecks = [...situationChecks, ...simChecks, ...damageChecks];
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1,
        correct_count: firstCorrect + realPicked,
        total_questions: SITUATIONS.length + DAMAGES.filter(d => d.real).length,
      });
    }
    await logActivity(userId, 'threat_lab_completed', {
      situacoesDePrimeira: firstCorrect, simulacoes: runs.length,
    });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">Laboratório de Ameaças concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você identificou por onde as ameaças entram, mostrou na simulação o que a
          atualização do antivírus muda, e listou os prejuízos que um vírus causa de verdade.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Laboratório de Ameaças e Antivírus
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Três coisas para resolver: reconhecer por onde uma ameaça entra, entender o
          que a atualização do antivírus realmente muda, e saber o que se perde quando
          o clube é infectado. A parte do meio é um simulador — você comanda os doze
          aparelhos do clube por trinta dias.
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
      <StageCard title="1. Por onde a ameaça entra" icon={Bug} checks={situationChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Nem tudo que assusta é perigoso, e nem tudo que parece inofensivo é seguro.
          Marque cada situação. O que conta é a sua primeira resposta, antes da explicação.
        </p>

        {Object.keys(firstAnswers).length > 0 && firstCorrect < SITUATION_PASS && (
          <button
            onClick={() => { setAnswers({}); setFirstAnswers({}); }}
            className="btn-secondary text-xs mb-3"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar esta etapa
          </button>
        )}

        <ul className="space-y-2">
          {SITUATIONS.map(s => {
            const given = answers[s.id];
            const answered = given !== undefined;
            const right = answered && given === s.risky;
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
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => answer(s.id, true)}
                    className={given === true ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
                    É porta de entrada
                  </button>
                  <button onClick={() => answer(s.id, false)}
                    className={given === false ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
                    Não oferece risco
                  </button>
                </div>
                {answered && (
                  <div className="mt-2 text-xs">
                    <p className="font-bold" style={{ color: right ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {right ? 'Correto.' : 'Não é isso.'}
                    </p>
                    <p style={{ color: 'var(--color-text-soft)' }}>{s.why}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </StageCard>

      {/* ── Etapa 2 ── */}
      <StageCard title="2. Simulador de surto no clube" icon={Activity} checks={simChecks}>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          O clube tem {DEVICES} aparelhos que trocam arquivos entre si. Um deles pega uma
          infecção hoje. Ajuste as condições e veja os trinta dias seguintes. Não há sorte
          envolvida: as mesmas condições dão sempre o mesmo resultado.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Antivírus atualizado pela última vez há
              </label>
              <div className="flex gap-2 flex-wrap">
                {[0, 30, 180, 365].map(days => (
                  <button
                    key={days}
                    onClick={() => setSetup(s => ({ ...s, signatureAgeDays: days }))}
                    className={setup.signatureAgeDays === days ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
                  >
                    {days === 0 ? 'hoje' : days === 365 ? '1 ano' : `${days} dias`}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                Reconhece <strong style={{ color: detection > 0.6 ? 'var(--color-success)' : detection > 0.3 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                  {Math.round(detection * 100)}%
                </strong> das ameaças que circulam hoje.
              </p>
            </div>

            <Toggle
              label="O clube passa pen drives de mão em mão"
              on={setup.sharesRemovableMedia}
              onChange={v => setSetup(s => ({ ...s, sharesRemovableMedia: v }))}
            />
            <Toggle
              label="Anexos de desconhecidos são abertos"
              on={setup.opensUnknownAttachments}
              onChange={v => setSetup(s => ({ ...s, opensUnknownAttachments: v }))}
            />
            <Toggle
              label="Sistema e navegador em dia"
              on={setup.systemUpdated}
              onChange={v => setSetup(s => ({ ...s, systemUpdated: v }))}
            />

            <button onClick={runSimulation} className="btn-primary w-full">
              <Play className="w-4 h-4 mr-1" /> Registrar esta simulação
            </button>
          </div>

          <div>
            <OutbreakChart history={history} total={DEVICES} />
            <p className="text-sm mt-2" style={{ color: 'var(--color-text)' }}>
              Depois de 30 dias:{' '}
              <strong style={{ color: outcome.infected <= 1 ? 'var(--color-success)' : outcome.infected >= DEVICES - 2 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                {outcome.infected} de {DEVICES} aparelhos infectados
              </strong>
              {outcome.blocked > 0 && (
                <span style={{ color: 'var(--color-text-dim)' }}> · {outcome.blocked} tentativas barradas pelo antivírus</span>
              )}
            </p>
          </div>
        </div>

        {runs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-bold mb-2">Simulações registradas</h3>
            <ul className="space-y-1 text-xs">
              {runs.map((r, i) => (
                <li key={i} className="flex justify-between gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  <span style={{ color: 'var(--color-text-soft)' }}>
                    assinaturas de {r.setup.signatureAgeDays === 0 ? 'hoje' : `${r.setup.signatureAgeDays} dias`}
                    {r.setup.sharesRemovableMedia && ' · pen drive'}
                    {r.setup.opensUnknownAttachments && ' · anexos'}
                    {!r.setup.systemUpdated && ' · sistema desatualizado'}
                  </span>
                  <strong style={{ color: r.result <= 1 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {r.result}/{DEVICES}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </StageCard>

      {/* ── Etapa 3 ── */}
      <StageCard title="3. O que se perde" icon={ClipboardList} checks={damageChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Marque os prejuízos que um vírus causa de verdade. Dois itens da lista não são
          consequência de vírus nenhum — encontre-os.
        </p>

        <ul className="space-y-2 mb-4">
          {DAMAGES.map(d => {
            const on = !!picked[d.id];
            const wrong = on && !d.real;
            return (
              <li key={d.id}>
                <button
                  onClick={() => setPicked(p => ({ ...p, [d.id]: !p[d.id] }))}
                  className="w-full text-left p-3 rounded-lg transition"
                  style={{
                    backgroundColor: !on ? 'var(--color-bg-input)'
                      : wrong ? 'var(--color-error-a10)' : 'var(--color-success-a10)',
                    border: `1px solid ${!on ? 'var(--color-border)' : wrong ? 'var(--color-error-a20)' : 'var(--color-success-a20)'}`,
                    color: 'var(--color-text)',
                  }}
                >
                  <span className="text-sm">{d.label}</span>
                  {on && (
                    <span className="block text-xs mt-1" style={{ color: wrong ? 'var(--color-error)' : 'var(--color-text-soft)' }}>
                      {d.note}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <label className="block">
          <span className="text-sm block mb-1" style={{ color: 'var(--color-text-soft)' }}>
            Dos prejuízos acima, qual pesaria mais para você — e por quê?
          </span>
          <textarea
            value={fear}
            onChange={e => setFear(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Escreva com as suas palavras."
            aria-label="Prejuízo que mais preocupa"
          />
        </label>
      </StageCard>
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

/** Thirty days of the outbreak as a filled area — the shape is the argument. */
function OutbreakChart({ history, total }: { history: { day: number; infected: number }[]; total: number }) {
  const w = 320;
  const h = 150;
  const pad = { left: 26, right: 6, top: 8, bottom: 20 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const lastDay = history[history.length - 1].day;
  const x = (d: number) => pad.left + (d / lastDay) * plotW;
  const y = (n: number) => pad.top + plotH - (n / total) * plotH;

  const line = history.map(d => `${x(d.day).toFixed(1)},${y(d.infected).toFixed(1)}`).join(' ');
  const area = `${pad.left},${pad.top + plotH} ${line} ${x(lastDay)},${pad.top + plotH}`;
  const end = history[history.length - 1].infected;
  const colour = end <= 1 ? 'var(--color-success)' : end >= total - 2 ? 'var(--color-error)' : 'var(--color-warning)';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full rounded-lg"
      style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
      role="img"
      aria-label={`Curva de infecção: ${end} de ${total} aparelhos em ${lastDay} dias`}
    >
      {[0, total / 2, total].map(n => (
        <g key={n}>
          <line x1={pad.left} x2={w - pad.right} y1={y(n)} y2={y(n)} stroke="var(--color-border)" strokeWidth="1" />
          <text x={pad.left - 4} y={y(n) + 3} textAnchor="end" fontSize="8" fill="var(--color-text-dim)">{n}</text>
        </g>
      ))}
      <polygon points={area} fill={colour} opacity="0.18" />
      <polyline points={line} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" />
      <text x={pad.left} y={h - 5} fontSize="8" fill="var(--color-text-dim)">dia 0</text>
      <text x={w - pad.right} y={h - 5} textAnchor="end" fontSize="8" fill="var(--color-text-dim)">dia {lastDay}</text>
    </svg>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition"
      style={{
        backgroundColor: on ? 'var(--color-primary-a10)' : 'var(--color-bg-input)',
        border: `1px solid ${on ? 'var(--color-primary-a30)' : 'var(--color-border)'}`,
      }}
      aria-pressed={on}
    >
      <span
        className="w-9 h-5 rounded-full flex-shrink-0 flex items-center transition"
        style={{ backgroundColor: on ? 'var(--color-primary)' : 'var(--color-border-hover)', padding: '2px' }}
      >
        <span
          className="w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </span>
      <span className="text-sm" style={{ color: 'var(--color-text)' }}>{label}</span>
    </button>
  );
}

function StageCard({ title, icon: Icon, checks, children }: {
  title: string; icon: typeof Bug; checks: Check[]; children: ReactNode;
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
