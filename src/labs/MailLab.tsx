import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { assessDownload } from '../lib/webSkills';
import { exportAttachmentPdf } from '../lib/pdf';
import { useAuth } from '../context/AuthContext';
import { getPublicName } from '../types';
import {
  Mail, Send, Inbox, AlertCircle, CheckCircle2, ShieldAlert, Paperclip,
  Trash2, Reply, RotateCcw,
} from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/**
 * MailLab — requirement AP034-7.1: send, receive, attachments, safety.
 *
 * The bug this rewrite fixes: opening a message reset `phishingAnswered`,
 * `phishingCorrect` and `attachmentOpened`. Every finding the student made
 * disappeared the moment they clicked the next e-mail, so the task list could
 * never fill up — the lab had no memory. Progress is now keyed per message and
 * nothing is ever cleared by navigation.
 *
 * While the memory was being fixed the rest was rebuilt too. The old lab asked
 * "is this phishing?" only on the message that *was* phishing, so the question
 * itself gave the answer away; it offered to open every attachment with no
 * consequence; and it accepted an empty e-mail as "sent".
 */

interface Attachment { name: string }

interface Message {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  phishing: boolean;
  /** Why — shown after the student decides. Empty for legitimate mail. */
  signals: string[];
  attachment?: Attachment;
}

const INBOX: Message[] = [
  {
    id: 'm1', from: 'secretaria@clubeolhodetigre.org.br', fromName: 'Secretaria do Clube',
    subject: 'Programação do próximo sábado',
    body: 'Oi! Segue a escala das unidades para o sábado que vem. Quem não puder ir avisa o conselheiro até quinta. Um abraço, Secretaria.',
    phishing: false, signals: [],
    attachment: { name: 'escala-das-unidades.pdf' },
  },
  {
    id: 'm2', from: 'seguranca@bancodobrasil-verificacao.com', fromName: 'Banco do Brasil',
    subject: 'URGENTE: sua conta será bloqueada em 24 horas',
    body: 'Detectamos um acesso suspeito. Confirme seus dados agora clicando no link abaixo, ou sua conta será bloqueada definitivamente em 24 horas.',
    phishing: true,
    signals: [
      'O domínio de verdade é "bancodobrasil-verificacao.com", não o banco. O nome da marca aparece antes do ponto errado.',
      'Prazo curto e ameaça de bloqueio: pressa é a ferramenta principal do golpe, porque impede você de conferir.',
      'Banco não pede confirmação de dados por link em e-mail. Nenhum, nunca.',
    ],
  },
  {
    id: 'm3', from: 'joana.ferreira@gmail.com', fromName: 'Joana (unidade Falcão)',
    subject: 'Fotos do acampamento!',
    body: 'Gente, ficaram ótimas as fotos! Mandei as minhas em anexo. Alguém tem as da fogueira?',
    phishing: false, signals: [],
    attachment: { name: 'acampamento-2026.jpg' },
  },
  {
    id: 'm4', from: 'premios@sorteio-mundial.info', fromName: 'Central de Prêmios',
    subject: 'Você foi selecionado! Retire seu celular novo',
    body: 'Parabéns! Seu e-mail foi sorteado entre milhões. Para liberar o envio do aparelho, preencha o formulário e pague apenas a taxa de postagem de R$ 39,90.',
    phishing: true,
    signals: [
      'Você não participou de sorteio nenhum. Prêmio que chega sozinho não existe.',
      'A "pequena taxa" é o golpe inteiro: o prêmio nunca chega, o pagamento sim.',
      'O remetente não tem relação com nenhuma empresa conhecida.',
    ],
  },
  {
    id: 'm5', from: 'conselheiro@clubeolhodetigre.org.br', fromName: 'Conselheiro Marcos',
    subject: 'Material da especialidade',
    body: 'Segue o material que combinamos para a especialidade de Internet. Qualquer dúvida me chama.',
    phishing: false, signals: [],
    attachment: { name: 'especialidade-internet.pdf.exe' },
  },
];

/** Two of the five carry a dangerous attachment or a phishing payload. */
const PHISHING_COUNT = INBOX.filter(m => m.phishing).length;

interface Check { id: string; label: string; passed: boolean; hint: string }

export default function MailLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const { profile } = useAuth();
  const studentName = profile ? getPublicName(profile) : 'Desbravador(a)';
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* State keyed by message id. The previous version stored a single flag for the
     whole lab and reset it on every selection, which is what erased progress. */
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [verdicts, setVerdicts] = useState<Record<string, boolean>>({});
  const [firstVerdicts, setFirstVerdicts] = useState<Record<string, boolean>>({});
  const [attachmentActions, setAttachmentActions] = useState<Record<string, 'abriu' | 'recusou'>>({});

  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sent, setSent] = useState<{ to: string; subject: string; body: string }[]>([]);
  const [composeError, setComposeError] = useState('');

  const selected = INBOX.find(m => m.id === selectedId) ?? null;

  const open = (message: Message) => {
    setSelectedId(message.id);
    setRead(p => ({ ...p, [message.id]: true }));
  };

  const judge = (id: string, isPhishing: boolean) => {
    setVerdicts(p => ({ ...p, [id]: isPhishing }));
    setFirstVerdicts(p => (id in p ? p : { ...p, [id]: isPhishing }));
  };

  const readCount = Object.keys(read).length;
  const judgedCount = INBOX.filter(m => verdicts[m.id] !== undefined).length;
  const firstCorrect = INBOX.filter(m => firstVerdicts[m.id] === m.phishing).length;
  const phishingCaught = INBOX.filter(m => m.phishing && verdicts[m.id] === true).length;

  /** The .exe attachment is the trap: opening it is the wrong move. */
  const dangerousAttachments = INBOX.filter(
    m => m.attachment && assessDownload(m.attachment.name).level === 'perigoso',
  );
  const safeAttachments = INBOX.filter(
    m => m.attachment && assessDownload(m.attachment.name).level !== 'perigoso',
  );
  const openedSafe = safeAttachments.filter(m => attachmentActions[m.id] === 'abriu').length;
  const refusedDangerous = dangerousAttachments.filter(m => attachmentActions[m.id] === 'recusou').length;
  const openedDangerous = dangerousAttachments.filter(m => attachmentActions[m.id] === 'abriu').length;

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const handleSend = () => {
    if (!validEmail(composeTo)) { setComposeError('O destinatário precisa ser um endereço completo, com @ e domínio.'); return; }
    if (composeSubject.trim().length < 3) { setComposeError('Escreva um assunto — é por ele que a pessoa decide se abre.'); return; }
    if (composeBody.trim().length < 20) { setComposeError('A mensagem está curta demais. Escreva ao menos uma frase inteira.'); return; }
    setComposeError('');
    setSent(prev => [...prev, { to: composeTo.trim(), subject: composeSubject.trim(), body: composeBody.trim() }]);
    setComposeTo(''); setComposeSubject(''); setComposeBody('');
    void logActivity(userId, 'mail_sent', { specialtyCode, lessonCode, assunto: composeSubject.trim() });
  };

  const checks: Check[] = [
    {
      id: 'ler', label: `Leu as ${INBOX.length} mensagens da caixa de entrada`,
      passed: readCount >= INBOX.length,
      hint: `${readCount} de ${INBOX.length} abertas.`,
    },
    {
      id: 'classificar', label: `Classificou as ${INBOX.length} mensagens`,
      passed: judgedCount >= INBOX.length,
      hint: `${judgedCount} de ${INBOX.length} classificadas. Diga, em cada uma, se é golpe ou é legítima.`,
    },
    {
      id: 'phishing', label: `Identificou os ${PHISHING_COUNT} golpes`,
      passed: phishingCaught === PHISHING_COUNT,
      hint: `${phishingCaught} de ${PHISHING_COUNT} encontrados. Nem toda mensagem alarmante é golpe, e nem todo golpe é alarmante.`,
    },
    {
      id: 'acertos', label: `Acertou ao menos 4 de ${INBOX.length} de primeira`,
      passed: firstCorrect >= 4,
      hint: `${firstCorrect} de ${INBOX.length} na primeira resposta. Vale a primeira, antes de ler os sinais.`,
    },
    {
      id: 'anexo-bom', label: 'Abriu um anexo seguro',
      passed: openedSafe > 0,
      hint: 'Um PDF ou uma imagem de quem você conhece pode ser aberto.',
    },
    {
      id: 'anexo-ruim', label: 'Recusou o anexo que é um programa disfarçado',
      passed: refusedDangerous === dangerousAttachments.length && openedDangerous === 0,
      hint: openedDangerous > 0
        ? 'Você abriu um anexo executável. Repare na última extensão do nome e recomece essa mensagem.'
        : 'Uma das mensagens traz um anexo que só parece documento. Olhe o fim do nome do arquivo.',
    },
    {
      id: 'enviar', label: 'Escreveu e enviou uma mensagem completa',
      passed: sent.length > 0,
      hint: 'Destinatário válido, assunto e um corpo de pelo menos uma frase.',
    },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const allPassed = passedCount === checks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: firstCorrect, total_questions: INBOX.length,
      });
    }
    await logActivity(userId, 'mail_lab_completed', { specialtyCode, lessonCode,
      golpesDePrimeira: firstCorrect, enviadas: sent.length,
    });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você leu a caixa inteira, separou os golpes das mensagens verdadeiras, recusou o
          anexo que era um programa disfarçado e escreveu um e-mail completo.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {lessonTitle}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Cinco mensagens na caixa de entrada. Leia cada uma, decida se é golpe ou é
          legítima, resolva o que fazer com os anexos e escreva um e-mail seu. O progresso
          fica guardado por mensagem — você pode ir e voltar à vontade.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {checks.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>verificações atendidas</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir MailLab'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(passedCount / checks.length) * 100}%`,
              background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Caixa de entrada */}
        <div className="card p-4">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Inbox className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Caixa de entrada
          </h2>
          <ul className="space-y-2">
            {INBOX.map(m => {
              const isRead = !!read[m.id];
              const answered = verdicts[m.id] !== undefined;
              const right = answered && verdicts[m.id] === m.phishing;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => open(m)}
                    className="w-full text-left p-3 rounded-lg transition"
                    style={{
                      border: `1px solid ${selectedId === m.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: selectedId === m.id ? 'var(--color-primary-a10)' : 'var(--color-bg-input)',
                    }}
                  >
                    <p
                      className="text-sm truncate"
                      style={{ color: 'var(--color-text)', fontWeight: isRead ? 400 : 700 }}
                    >
                      {m.fromName}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{m.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {m.attachment && <Paperclip className="w-3 h-3" style={{ color: 'var(--color-text-dim)' }} />}
                      {answered && (
                        right
                          ? <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--color-success)' }} />
                          : <AlertCircle className="w-3 h-3" style={{ color: 'var(--color-error)' }} />
                      )}
                      {!isRead && (
                        <span className="text-xs px-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-a20)', color: 'var(--color-primary)' }}>
                          nova
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {sent.length > 0 && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <h3 className="font-bold text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <Send className="w-3 h-3" /> Enviados ({sent.length})
              </h3>
              <ul className="space-y-1">
                {sent.map((s, i) => (
                  <li key={i} className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>
                    {s.subject} → {s.to}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Leitura */}
        <div className="md:col-span-2 card p-4">
          {selected ? (
            <MessageView
              message={selected}
              verdict={verdicts[selected.id]}
              attachmentAction={attachmentActions[selected.id]}
              studentName={studentName}
              onJudge={v => judge(selected.id, v)}
              onAttachment={action => setAttachmentActions(p => ({ ...p, [selected.id]: action }))}
              onResetAttachment={() => setAttachmentActions(p => {
                const next = { ...p };
                delete next[selected.id];
                return next;
              })}
            />
          ) : (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-text-faint)' }} />
              <p style={{ color: 'var(--color-text-dim)' }}>Escolha uma mensagem para ler.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compor */}
      <div className="card p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Send className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Escrever uma mensagem
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Escreva para o seu conselheiro contando o que você aprendeu nesta caixa de
          entrada. Um e-mail sem assunto ou sem corpo não é enviado — nem aqui, nem na vida.
        </p>
        <div className="space-y-2">
          <input
            value={composeTo} onChange={e => setComposeTo(e.target.value)}
            className="input-field" placeholder="Para: alguem@exemplo.com.br" aria-label="Destinatário"
          />
          <input
            value={composeSubject} onChange={e => setComposeSubject(e.target.value)}
            className="input-field" placeholder="Assunto" aria-label="Assunto"
          />
          <textarea
            value={composeBody} onChange={e => setComposeBody(e.target.value)}
            rows={4} className="input-field" placeholder="Escreva a sua mensagem." aria-label="Corpo da mensagem"
          />
        </div>
        {composeError && (
          <p className="text-sm mt-2" style={{ color: 'var(--color-error)' }}>{composeError}</p>
        )}
        <button onClick={handleSend} className="btn-primary mt-3">
          <Send className="w-4 h-4 mr-1" /> Enviar
        </button>
      </div>

      {/* Verificações */}
      <div className="card p-4">
        <h2 className="font-bold mb-3 text-sm">Verificações</h2>
        <ul className="space-y-2">
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
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

function MessageView({ message, verdict, attachmentAction, studentName, onJudge, onAttachment, onResetAttachment }: {
  message: Message;
  verdict: boolean | undefined;
  attachmentAction: 'abriu' | 'recusou' | undefined;
  studentName: string;
  onJudge: (isPhishing: boolean) => void;
  onAttachment: (action: 'abriu' | 'recusou') => void;
  onResetAttachment: () => void;
}) {
  const answered = verdict !== undefined;
  const right = answered && verdict === message.phishing;
  const attachmentVerdict = useMemo(
    () => message.attachment ? assessDownload(message.attachment.name) : null,
    [message.attachment],
  );

  return (
    <div>
      <div className="pb-3 mb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{message.subject}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>{message.fromName}</p>
        <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>&lt;{message.from}&gt;</p>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text)' }}>{message.body}</p>

      {message.attachment && attachmentVerdict && (
        <div
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-sm flex items-center gap-2 mb-2" style={{ color: 'var(--color-text)' }}>
            <Paperclip className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
            <span className="font-mono break-all">{message.attachment.name}</span>
          </p>
          {attachmentAction === undefined ? (
            <div className="flex gap-2 flex-wrap">
              {/* The PDF is generated for real, so requirement 7.3 — "fazer o
                  download de um anexo e abri-lo" — is met by an actual file in
                  the student's downloads rather than by a flag. The .exe is
                  obviously not produced, and the .jpg would need a photo. */}
              <button
                onClick={() => {
                  if (message.attachment?.name.endsWith('.pdf')) exportAttachmentPdf(studentName);
                  onAttachment('abriu');
                }}
                className="btn-secondary text-xs"
              >
                <Paperclip className="w-3 h-3 mr-1" />
                {message.attachment?.name.endsWith('.pdf') ? 'Baixar e abrir' : 'Abrir anexo'}
              </button>
              <button onClick={() => onAttachment('recusou')} className="btn-secondary text-xs">
                <Trash2 className="w-3 h-3 mr-1" /> Não abrir
              </button>
            </div>
          ) : (
            <div className="text-xs space-y-1">
              <p
                className="font-bold"
                style={{
                  color: (attachmentAction === 'abriu') === (attachmentVerdict.level !== 'perigoso')
                    ? 'var(--color-success)' : 'var(--color-error)',
                }}
              >
                {attachmentAction === 'abriu' ? 'Você abriu.' : 'Você recusou.'}
              </p>
              <p style={{ color: 'var(--color-text-soft)' }}>{attachmentVerdict.message}</p>
              <button onClick={onResetAttachment} className="btn-secondary text-xs mt-1">
                <RotateCcw className="w-3 h-3 mr-1" /> Decidir de novo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Asked on every message, not only the fraudulent ones — asking only there
          would announce the answer before the student read a word. */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: !answered ? 'var(--color-secondary-a08)'
            : right ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
          border: `1px solid ${!answered ? 'var(--color-secondary-a20)' : right ? 'var(--color-success-a20)' : 'var(--color-error-a20)'}`,
        }}
      >
        <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
          Esta mensagem é um golpe?
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onJudge(true)} className={verdict === true ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
            É golpe
          </button>
          <button onClick={() => onJudge(false)} className={verdict === false ? 'btn-primary text-xs' : 'btn-secondary text-xs'}>
            É legítima
          </button>
        </div>

        {answered && (
          <div className="mt-3 text-xs space-y-1">
            <p className="font-bold" style={{ color: right ? 'var(--color-success)' : 'var(--color-error)' }}>
              {right ? 'Correto.' : 'Não é isso.'}
            </p>
            {message.phishing ? (
              message.signals.map((s, i) => (
                <p key={i} style={{ color: 'var(--color-text-soft)' }}>• {s}</p>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-soft)' }}>
                Remetente conhecido, assunto que faz sentido para você, nenhum pedido de
                dado nem de dinheiro, nenhuma pressa. É uma mensagem comum — e desconfiar
                de tudo também atrapalha.
              </p>
            )}
          </div>
        )}
      </div>

      {message.phishing && answered && verdict === true && (
        <p className="text-xs mt-3 flex items-start gap-1.5" style={{ color: 'var(--color-text-dim)' }}>
          <Reply className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          O que fazer agora: não responder, não clicar, e apagar. Responder confirma que o
          seu endereço existe e está sendo lido.
        </p>
      )}
    </div>
  );
}
