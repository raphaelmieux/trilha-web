import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { FileSignature, Shield } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const clauses = [
  { id: 'AP034-5.1', label: 'Não revelar informações pessoais desnecessárias', placeholder: 'Ex: Nunca compartilhar meu endereço, telefone ou senha online' },
  { id: 'AP034-5.2', label: 'Pessoas online podem não ser quem afirmam ser', placeholder: 'Ex: Nem todos na internet são confiáveis' },
  { id: 'AP034-5.3', label: 'Nunca encontrar amigo virtual sem responsável', placeholder: 'Ex: Se encontrar, sempre com um responsável presente' },
  { id: 'AP034-5.4', label: 'Não responder a contatos suspeitos', placeholder: 'Ex: Ignorar mensagens de desconhecidos' },
  { id: 'AP034-5.5', label: 'Pedir ajuda ao perceber algo anormal', placeholder: 'Ex: Avisar um adulto se algo parecer estranho' },
  { id: 'AP034-5.6', label: 'Tempo semanal de uso', placeholder: 'Ex: No máximo 10 horas por semana' },
  { id: 'AP034-5.7', label: 'Sites aceitáveis e inaceitáveis', placeholder: 'Ex: Sites educativos sim, sites violentos não' },
  { id: 'AP034-5.8', label: 'Redes sociais (máximo 2)', placeholder: 'Ex: Instagram e WhatsApp' },
  { id: 'AP034-5.9', label: 'Limite diário para redes sociais', placeholder: 'Ex: 30 minutos por dia' },
];

const scenarios = [
  { id: 's1', text: 'Um estranho pede sua foto pelo chat. O que fazer?', options: ['Enviar a foto', 'Não enviar e avisar um responsável', 'Ignorar apenas'], correct: 1 },
  { id: 's2', text: 'Um site pede seu nome completo e endereço. O que fazer?', options: ['Fornecer tudo', 'Não fornecer e sair do site', 'Fornecer só o nome'], correct: 1 },
  { id: 's3', text: 'Você está navegando e vê conteúdo inadequado. O que fazer?', options: ['Continuar vendo', 'Fechar e avisar um responsável', 'Compartilhar com amigos'], correct: 1 },
];

export default function PactBuilderLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [clauseTexts, setClauseTexts] = useState<Record<string, string>>({});
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, number>>({});
  const [studentSignature, setStudentSignature] = useState('');
  const [completed, setCompleted] = useState(false);

  const allClausesFilled = clauses.every(c => clauseTexts[c.id]?.trim());
  const allScenariosCorrect = scenarios.every(s => scenarioAnswers[s.id] === s.correct);
  const canSubmit = allClausesFilled && allScenariosCorrect && studentSignature.trim();

  const handleSubmit = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) { const reqId = await getRequirementId(reqCode); if (reqId) await upsertRequirementProgress(userId, reqId, { status: 'completed', mastery_score: 100, checkpoint_passed: true, attempts: 1, correct_count: 1, total_questions: 1 }); }
    await logActivity(userId, 'pact_completed', { allClausesFilled, allScenariosCorrect });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">Pacto Assinado!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Seu Pacto de Uso Consciente da Internet foi concluído com sucesso.</p>
          <div className="rounded-lg p-4 mb-4 text-left max-w-md mx-auto" style={{ backgroundColor: 'var(--color-tertiary-a08)', border: '1px solid var(--color-tertiary-a20)' }}>
            <p className="font-medium mb-2" style={{ color: 'var(--color-tertiary-light)' }}>Cláusulas firmadas:</p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text)' }}>{clauses.map(c => <li key={c.id}>✓ {c.label}</li>)}</ul>
            <p className="mt-3 text-sm italic" style={{ color: 'var(--color-text-muted)' }}>Assinado por: {studentSignature}</p>
          </div>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6"><h1 className="text-xl font-bold mb-2 flex items-center gap-2"><FileSignature className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Pacto de Uso Consciente da Internet</h1><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Preencha cada cláusula com seu compromisso pessoal e responda os cenários.</p></div>
      <div className="card p-6 space-y-4"><h2 className="font-bold">Cláusulas do Pacto</h2>{clauses.map(c => (<div key={c.id}><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>{c.label}</label><textarea value={clauseTexts[c.id] || ''} onChange={e => setClauseTexts(prev => ({ ...prev, [c.id]: e.target.value }))} rows={2} className="input-field" placeholder={c.placeholder} /></div>))}</div>
      <div className="card p-6 space-y-4"><h2 className="font-bold">Cenários de Segurança</h2>{scenarios.map(s => (<div key={s.id}><p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>{s.text}</p><div className="space-y-2">{s.options.map((opt, idx) => (<button key={idx} onClick={() => setScenarioAnswers(prev => ({ ...prev, [s.id]: idx }))} className="w-full text-left p-3 rounded-lg border-2 transition" style={{ borderColor: scenarioAnswers[s.id] === idx ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: scenarioAnswers[s.id] === idx ? 'var(--color-primary-a08)' : 'var(--color-bg-input)', color: 'var(--color-text)' }}>{opt}</button>))}</div></div>))}</div>
      <div className="card p-6"><label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>Assinatura do aluno (digite seu nome completo)</label><input value={studentSignature} onChange={e => setStudentSignature(e.target.value)} className="input-field" placeholder="Seu nome completo" /></div>
      <button onClick={handleSubmit} disabled={!canSubmit} className="btn-primary w-full">{!canSubmit ? 'Complete todas as cláusulas, cenários e assine' : 'Assinar e Concluir Pacto'}</button>
    </div>
  );
}
