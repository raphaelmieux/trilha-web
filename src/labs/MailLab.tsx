import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { Mail, Send, Inbox, AlertCircle, CheckCircle2, ShieldAlert, Paperclip } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const inboxMessages = [
  { id: 'm1', from: 'biblia@exemplo.com', subject: 'Versículo do Dia', body: 'Filipenses 4:8 — Finalmente, irmãos, tudo o que é verdadeiro...', isPhishing: false, hasAttachment: false },
  { id: 'm2', from: 'urgente@banco-falso.com', subject: 'URGENTE: Sua conta será bloqueada!', body: 'Clique aqui para verificar sua conta agora. Seu acesso será suspenso em 24 horas.', isPhishing: true, hasAttachment: false, phishingSignals: ['urgência', 'remetente suspeito', 'link para clicar'] },
  { id: 'm3', from: 'amigo@exemplo.com', subject: 'Olá! Como vai?', body: 'Oi! Tudo bem com você? Espero que sim. Vamos conversar!', isPhishing: false, hasAttachment: true, attachmentName: 'foto.jpg' },
];

export default function MailLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<typeof inboxMessages[0] | null>(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [phishingCorrect, setPhishingCorrect] = useState<boolean | null>(null);
  const [phishingAnswered, setPhishingAnswered] = useState(false);
  const [attachmentOpened, setAttachmentOpened] = useState(false);
  const [completed, setCompleted] = useState(false);

  const tasks = [
    { id: 'read', label: 'Ler pelo menos 2 mensagens', done: selectedMessage !== null },
    { id: 'send', label: 'Enviar uma mensagem', done: sentCount > 0 },
    { id: 'phishing', label: 'Identificar phishing corretamente', done: phishingCorrect === true },
    { id: 'attachment', label: 'Abrir um anexo', done: attachmentOpened },
  ];
  const allDone = tasks.every(t => t.done);

  const handleSend = () => { if (!composeSubject.trim() && !composeBody.trim()) return; setSentCount(c => c + 1); setComposeSubject(''); setComposeBody(''); logActivity(userId, 'mail_sent', { subject: composeSubject }); };
  const handlePhishingAnswer = (isPhishing: boolean) => { setPhishingAnswered(true); setPhishingCorrect(selectedMessage?.isPhishing === isPhishing); logActivity(userId, 'phishing_identified', { correct: selectedMessage?.isPhishing === isPhishing }); };

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) { const reqId = await getRequirementId(reqCode); if (reqId) await upsertRequirementProgress(userId, reqId, { status: 'completed', mastery_score: 100, checkpoint_passed: true, attempts: 1, correct_count: tasks.filter(t => t.done).length, total_questions: tasks.length }); }
    await logActivity(userId, 'mail_lab_completed', {});
    setCompleted(true);
  };

  if (completed) {
    return (<div className="space-y-4"><div className="card p-8 text-center"><CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} /><h1 className="text-2xl font-bold mb-2">MailLab Concluído!</h1><Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link></div></div>);
  }

  return (
    <div className="space-y-4">
      <div className="card p-6"><h1 className="text-xl font-bold mb-2 flex items-center gap-2"><Mail className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> MailLab — E-mail e Segurança</h1><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Pratique envio, recebimento, anexos e identificação de phishing.</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setFolder('inbox')} className="btn-secondary text-xs" style={folder === 'inbox' ? { backgroundColor: 'var(--color-primary-a15)', color: 'var(--color-primary)' } : {}}><Inbox className="w-3 h-3" /> Caixa</button>
            <button onClick={() => setFolder('sent')} className="btn-secondary text-xs" style={folder === 'sent' ? { backgroundColor: 'var(--color-primary-a15)', color: 'var(--color-primary)' } : {}}><Send className="w-3 h-3" /> Enviados</button>
          </div>
          <div className="space-y-2">
            {folder === 'inbox' && inboxMessages.map(msg => (
              <button key={msg.id} onClick={() => { setSelectedMessage(msg); setPhishingAnswered(false); setPhishingCorrect(null); setAttachmentOpened(false); }} className="w-full text-left p-3 rounded-lg border transition" style={{ border: `1px solid ${selectedMessage?.id === msg.id ? 'var(--color-primary)' : 'var(--color-border)'}`, backgroundColor: selectedMessage?.id === msg.id ? 'var(--color-primary-a08)' : 'var(--color-bg-input)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{msg.from}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{msg.subject}</p>
                {msg.isPhishing && <ShieldAlert className="w-3 h-3 inline ml-1" style={{ color: 'var(--color-primary)' }} />}
                {msg.hasAttachment && <Paperclip className="w-3 h-3 inline ml-1" style={{ color: 'var(--color-text-dim)' }} />}
              </button>
            ))}
            {folder === 'sent' && <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{sentCount} mensagem(ns) enviada(s)</p>}
          </div>
        </div>
        <div className="md:col-span-2 card p-4">
          {selectedMessage ? (
            <div>
              <div className="pb-2 mb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <p className="font-bold" style={{ color: 'var(--color-text)' }}>{selectedMessage.subject}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>De: {selectedMessage.from}</p>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text)' }}>{selectedMessage.body}</p>
              {selectedMessage.hasAttachment && (
                <button onClick={() => setAttachmentOpened(true)} className="btn-secondary text-xs mb-4">
                  <Paperclip className="w-3 h-3" /> {attachmentOpened ? 'Anexo aberto: ' + selectedMessage.attachmentName : 'Abrir anexo'}
                </button>
              )}
              {selectedMessage.isPhishing && !phishingAnswered && (
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-secondary)' }}>Esta mensagem é phishing?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handlePhishingAnswer(true)} className="btn-primary text-xs">Sim, é phishing</button>
                    <button onClick={() => handlePhishingAnswer(false)} className="btn-secondary text-xs">Não, é legítima</button>
                  </div>
                </div>
              )}
              {phishingAnswered && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: phishingCorrect ? 'var(--color-tertiary-a10)' : 'var(--color-primary-a10)', color: phishingCorrect ? 'var(--color-tertiary-light)' : 'var(--color-primary)' }}>
                  {phishingCorrect ? 'Correto! Esta mensagem é phishing.' : 'Incorreto. Esta mensagem é phishing — veja os sinais: urgência, remetente suspeito, link para clicar.'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8"><Mail className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--color-border-hover)' }} /><p style={{ color: 'var(--color-text-dim)' }}>Selecione uma mensagem</p></div>
          )}
        </div>
      </div>
      <div className="card p-4"><h2 className="font-bold mb-2 flex items-center gap-2"><Send className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Compor E-mail</h2><input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="input-field mb-2" placeholder="Assunto" /><textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={3} className="input-field mb-2" placeholder="Corpo da mensagem" /><button onClick={handleSend} className="btn-primary">Enviar</button></div>
      <div className="card p-4"><h2 className="font-bold mb-3">Tarefas ({tasks.filter(t => t.done).length}/{tasks.length})</h2><ul className="space-y-2">{tasks.map(t => (<li key={t.id} className="flex items-center gap-2 text-sm">{t.done ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-border-hover)' }} />}<span style={{ color: t.done ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{t.label}</span></li>))}</ul></div>
      <button onClick={handleComplete} disabled={!allDone} className="btn-primary w-full">{allDone ? 'Concluir MailLab' : 'Complete todas as tarefas'}</button>
    </div>
  );
}
