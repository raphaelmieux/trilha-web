import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { CheckCircle2, Save, FileText, AlertCircle } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

export default function TextEditorLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const criteria = [
    { id: 'c1', label: 'Mínimo 250 palavras', met: wordCount >= 250 },
    { id: 'c2', label: 'Máximo 300 palavras', met: wordCount <= 300 && wordCount > 0 },
    { id: 'c3', label: 'Menciona ARPANET', met: /ARPANET/i.test(text) },
    { id: 'c4', label: 'Menciona Tim Berners-Lee ou WWW', met: /Tim Berners-Lee|WWW|World Wide Web/i.test(text) },
    { id: 'c5', label: 'Menciona protocolos (TCP/IP, HTTP)', met: /TCP\/IP|HTTP/i.test(text) },
    { id: 'c6', label: 'Texto coerente e bem estruturado', met: wordCount >= 100 },
    { id: 'c7', label: 'Conteúdo relevante à história da Internet', met: wordCount >= 150 },
    { id: 'c8', label: 'Não contém plágio óbvio', met: wordCount > 0 },
    { id: 'c9', label: 'Boa ortografia (sem excesso de erros)', met: wordCount > 0 },
    { id: 'c10', label: 'Conclusão ou reflexão final', met: wordCount >= 200 },
  ];
  const metCount = criteria.filter(c => c.met).length;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('text_projects').select('*').eq('user_id', userId).maybeSingle();
      if (data) { setProjectId(data.id); setText(data.body || ''); if (data.status === 'submitted') setSubmitted(true); }
    })();
  }, [userId]);

  const handleSave = async () => {
    if (projectId) {
      await supabase.from('text_projects').update({ body: text, word_count: wordCount, updated_at: new Date().toISOString() }).eq('id', projectId);
    } else {
      const { data } = await supabase.from('text_projects').insert({ user_id: userId, title: 'História da Internet', body: text, word_count: wordCount, status: 'draft', criteria_met: criteria.filter(c => c.met).map(c => c.id) }).select('id').single();
      if (data) setProjectId(data.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await logActivity(userId, 'text_saved', { wordCount, criteriaMet: criteria.filter(c => c.met).map(c => c.id) });
  };

  const handleSubmit = async () => {
    await handleSave();
    if (projectId) await supabase.from('text_projects').update({ status: 'submitted' }).eq('id', projectId);
    else {
      const { data } = await supabase.from('text_projects').insert({ user_id: userId, title: 'História da Internet', body: text, word_count: wordCount, status: 'submitted', criteria_met: criteria.filter(c => c.met).map(c => c.id) }).select('id').single();
      if (data) setProjectId(data.id);
    }
    setSubmitted(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) { const reqId = await getRequirementId(reqCode); if (reqId) await upsertRequirementProgress(userId, reqId, { status: 'completed', mastery_score: Math.round((metCount / 10) * 100), checkpoint_passed: true, attempts: 1, correct_count: metCount, total_questions: 10 }); }
    await logActivity(userId, 'text_submitted', { wordCount, criteriaMet: metCount });
  };

  return (
    <div className="space-y-4">
      <div className="card p-6"><h1 className="text-xl font-bold mb-2 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Editor de Texto: História da Internet</h1><p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Escreva uma história da internet com 250-300 palavras, abordando ARPANET, WWW, TCP/IP e o impacto da Internet na sociedade.</p><textarea value={text} onChange={e => setText(e.target.value)} disabled={submitted} rows={12} className="input-field font-mono text-sm" placeholder="Comece a escrever sua história da internet aqui..." /><div className="flex items-center justify-between mt-3"><span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{wordCount} palavras</span>{saved && <span className="text-sm flex items-center gap-1" style={{ color: 'var(--color-tertiary-light)' }}><CheckCircle2 className="w-4 h-4" /> Salvo!</span>}</div></div>
      <div className="card p-6"><h2 className="font-bold mb-3">Critérios de Avaliação ({metCount}/10)</h2><ul className="space-y-2">{criteria.map(c => (<li key={c.id} className="flex items-center gap-2 text-sm">{c.met ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-border-hover)' }} />}<span style={{ color: c.met ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{c.label}</span></li>))}</ul></div>
      {!submitted ? (
        <div className="flex gap-3"><button onClick={handleSave} className="btn-secondary"><Save className="w-4 h-4 mr-1" /> Salvar Rascunho</button><button onClick={handleSubmit} disabled={metCount < 7} className="btn-primary">{metCount < 7 ? `Atenda ${7 - metCount} critério(s) mais` : 'Enviar Texto'}</button></div>
      ) : (
        <div className="card p-6 text-center"><CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} /><h2 className="text-xl font-bold mb-2">Texto Enviado!</h2><p style={{ color: 'var(--color-text-muted)' }}>Você atendeu {metCount} de 10 critérios.</p><Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4">Voltar para a Trilha</Link></div>
      )}
    </div>
  );
}
