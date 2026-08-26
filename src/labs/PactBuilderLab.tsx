import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicName } from '../types';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  checkStatement, checkWeeklyBudget, checkDailyLimit, checkBudgetsAgree,
  checkSocialNetworks, checkSignature, MAX_SOCIAL_NETWORKS,
  type ClauseVerdict,
} from '../lib/pact';
import { exportPactPdf } from '../lib/pdf';
import { FileSignature, Shield, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/**
 * Meu Compromisso Digital — requirements AP034-5.1 … 5.9.
 *
 * Renamed from "Construtor do Pacto": the module 4 lesson used to render this
 * very component, so the student met the same nine boxes twice under two
 * different titles. Module 4 now has its own lab and this one is only the
 * commitment.
 *
 * The old version accepted any non-empty string, so nine requirements could be
 * completed with nine single characters, and the two numeric clauses were never
 * compared — ten hours a week alongside three hours a day passed happily. Every
 * clause is now validated by src/lib/pact.ts, including that arithmetic, and the
 * lab ends by producing the sheet the requirement is actually about: a printable
 * commitment with a line for the student and one for a guardian.
 */

interface Clause {
  id: string;
  requirement: string;
  title: string;
  placeholder: string;
}

const CLAUSES: Clause[] = [
  { id: 'c1', requirement: 'AP034-5.1', title: 'Informações que eu não revelo', placeholder: 'Ex: Nunca compartilhar meu endereço, telefone ou senha online' },
  { id: 'c2', requirement: 'AP034-5.2', title: 'Nem todo mundo é quem diz ser', placeholder: 'Ex: Vou lembrar que quem está do outro lado pode estar mentindo sobre a idade e o nome' },
  { id: 'c3', requirement: 'AP034-5.3', title: 'Encontrar alguém que conheci na internet', placeholder: 'Ex: Só encontro pessoalmente com um responsável junto e em lugar público' },
  { id: 'c4', requirement: 'AP034-5.4', title: 'Contatos suspeitos', placeholder: 'Ex: Não respondo mensagem de desconhecido e mostro para um adulto' },
  { id: 'c5', requirement: 'AP034-5.5', title: 'Quando algo parecer errado', placeholder: 'Ex: Paro na hora, não apago nada e chamo meu pai ou minha mãe' },
  { id: 'c7', requirement: 'AP034-5.7', title: 'Sites que eu aceito e sites que eu não aceito', placeholder: 'Ex: Uso sites de estudo, da igreja e de notícias; não entro em sites de violência nem de apostas' },
];

const WEEKLY: Clause = { id: 'c6', requirement: 'AP034-5.6', title: 'Meu tempo de internet por semana', placeholder: 'Ex: 10 horas por semana' };
const DAILY: Clause = { id: 'c9', requirement: 'AP034-5.9', title: 'Meu limite diário de redes sociais', placeholder: 'Ex: 30 minutos por dia' };

const NETWORKS = ['WhatsApp', 'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Discord', 'Telegram', 'Pinterest'];

export default function PactBuilderLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const { profile } = useAuth();
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [networks, setNetworks] = useState<string[]>([]);
  const [signature, setSignature] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const value = (id: string) => texts[id] ?? '';
  const set = (id: string, v: string) => setTexts(p => ({ ...p, [id]: v }));

  const statementVerdicts: Record<string, ClauseVerdict> = Object.fromEntries(
    CLAUSES.map(c => [c.id, checkStatement(value(c.id), c.placeholder)]),
  );
  const weeklyVerdict = checkWeeklyBudget(value(WEEKLY.id));
  const dailyVerdict = checkDailyLimit(value(DAILY.id));
  const agreeVerdict = checkBudgetsAgree(value(WEEKLY.id), value(DAILY.id));
  const networksVerdict = checkSocialNetworks(networks);
  const signatureVerdict = checkSignature(signature);

  const clauseVerdicts = [
    ...CLAUSES.map(c => statementVerdicts[c.id]),
    weeklyVerdict, dailyVerdict, networksVerdict,
  ];
  const clausesDone = clauseVerdicts.filter(v => v.ok).length;
  const ready = clauseVerdicts.every(v => v.ok) && agreeVerdict.ok && signatureVerdict.ok;

  const studentName = signature.trim() || (profile ? getPublicName(profile) : '');

  const pactClauses = () => [
    ...CLAUSES.map(c => ({ title: c.title, text: value(c.id).trim() })),
    { title: WEEKLY.title, text: value(WEEKLY.id).trim() },
    {
      title: 'Redes sociais que eu uso',
      text: networks.length === 0 ? 'Nenhuma rede social por enquanto.' : networks.join(' e '),
    },
    { title: DAILY.title, text: value(DAILY.id).trim() },
  ];

  const handleDownload = () => {
    exportPactPdf({ studentName, club: profile?.club ?? '', clauses: pactClauses() });
    setDownloaded(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: clausesDone, total_questions: clauseVerdicts.length,
      });
    }
    await logActivity(userId, 'pact_completed', { specialtyCode, lessonCode, redes: networks.length, baixouPdf: downloaded });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">Compromisso assinado!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          As nove cláusulas foram escritas por você e conferidas uma a uma. Imprima a
          folha, assine junto com um responsável e deixe onde vocês dois consigam ver.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={handleDownload} className="btn-secondary">
            <Download className="w-4 h-4 mr-1" /> Baixar de novo
          </button>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileSignature className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {lessonTitle}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Nove compromissos, escritos por você. Não copie os exemplos: eles estão aí só
          para mostrar o tamanho e o tom. No fim, a folha sai em PDF com espaço para a sua
          assinatura e a de um responsável.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: ready ? 'var(--color-success)' : 'var(--color-text)' }}>
              {clausesDone} de {clauseVerdicts.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>cláusulas prontas</span>
          </h2>
          {ready && (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Assinar e concluir'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(clausesDone / clauseVerdicts.length) * 100}%`,
              background: ready ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-bold">O que eu me comprometo a fazer</h2>
        {CLAUSES.slice(0, 5).map(c => (
          <ClauseField key={c.id} clause={c} value={value(c.id)} onChange={v => set(c.id, v)} verdict={statementVerdicts[c.id]} />
        ))}
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="font-bold">Onde eu entro e por quanto tempo</h2>

        <ClauseField
          clause={CLAUSES[5]}
          value={value(CLAUSES[5].id)}
          onChange={v => set(CLAUSES[5].id, v)}
          verdict={statementVerdicts[CLAUSES[5].id]}
        />

        <ClauseField clause={WEEKLY} value={value(WEEKLY.id)} onChange={v => set(WEEKLY.id, v)} verdict={weeklyVerdict} single />

        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>
            Redes sociais que eu uso — no máximo {MAX_SOCIAL_NETWORKS}
          </p>
          <div className="flex flex-wrap gap-2 mb-1">
            {NETWORKS.map(n => {
              const on = networks.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => setNetworks(prev => on ? prev.filter(x => x !== n) : [...prev, n])}
                  className={on ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <Verdict verdict={networksVerdict} okMessage={
            networks.length === 0
              ? 'Nenhuma rede social — é uma escolha válida, e o compromisso vale igual.'
              : `${networks.length} de ${MAX_SOCIAL_NETWORKS} escolhidas.`
          } />
        </div>

        <ClauseField clause={DAILY} value={value(DAILY.id)} onChange={v => set(DAILY.id, v)} verdict={dailyVerdict} single />

        {!agreeVerdict.ok && (
          <p className="text-sm p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-warning)' }}>
            {agreeVerdict.message}
          </p>
        )}
      </div>

      <div className="card p-6">
        <label className="block mb-3">
          <span className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-soft)' }}>
            Assinatura — escreva o seu nome completo
          </span>
          <input
            value={signature}
            onChange={e => setSignature(e.target.value)}
            className="input-field"
            placeholder="Nome e sobrenome"
            aria-label="Assinatura"
          />
        </label>
        <Verdict verdict={signatureVerdict} okMessage="Assinado." />

        <button
          onClick={handleDownload}
          disabled={!ready}
          className="btn-secondary w-full mt-4"
        >
          <Download className="w-4 h-4 mr-1" />
          {ready ? 'Baixar a folha em PDF' : 'Complete as cláusulas para baixar a folha'}
        </button>
      </div>
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

function ClauseField({ clause, value, onChange, verdict, single }: {
  clause: Clause; value: string; onChange: (v: string) => void; verdict: ClauseVerdict; single?: boolean;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-soft)' }}>
          {clause.title}
        </span>
        {single ? (
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="input-field"
            placeholder={clause.placeholder}
            aria-label={clause.title}
          />
        ) : (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={2}
            className="input-field"
            placeholder={clause.placeholder}
            aria-label={clause.title}
          />
        )}
      </label>
      <Verdict verdict={verdict} okMessage="Pronto." />
    </div>
  );
}

function Verdict({ verdict, okMessage }: { verdict: ClauseVerdict; okMessage: string }) {
  return (
    <p
      className="text-xs mt-1 flex items-start gap-1.5"
      style={{ color: verdict.ok ? 'var(--color-success)' : 'var(--color-text-dim)' }}
    >
      {verdict.ok
        ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
        : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-px" style={{ color: 'var(--color-text-faint)' }} />}
      {verdict.ok ? okMessage : verdict.message}
    </p>
  );
}
