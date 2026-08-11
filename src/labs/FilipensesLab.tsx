import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { BookOpen, Shuffle } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const verse = 'Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se alguma virtude há, se algum louvor existe, nisso pensai.';
const words = verse.split(' ');

export default function FilipensesLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const shuffle = () => { setShuffledWords([...words].sort(() => Math.random() - 0.5)); setSelectedWords([]); };
  if (shuffledWords.length === 0) shuffle();

  const selectWord = (word: string, idx: number) => { setSelectedWords(prev => [...prev, word]); setShuffledWords(prev => prev.filter((_, i) => i !== idx)); };
  const removeWord = (idx: number) => { setShuffledWords(prev => [...prev, selectedWords[idx]]); setSelectedWords(prev => prev.filter((_, i) => i !== idx)); };

  const checkOrder = async () => {
    setAttempts(a => a + 1);
    if (selectedWords.join(' ') === verse) {
      const specId = await getSpecialtyId(specialtyCode);
      if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
      for (const reqCode of requirementCodes) { const reqId = await getRequirementId(reqCode); if (reqId) await upsertRequirementProgress(userId, reqId, { status: 'completed', mastery_score: 100, checkpoint_passed: true, retention_passed: true, attempts: attempts + 1, correct_count: 1, total_questions: 1 }); }
      await logActivity(userId, 'filipenses_completed', { attempts: attempts + 1 });
      setCompleted(true);
    } else { alert('A ordem não está correta. Tente novamente!'); }
  };

  if (completed) {
    return (<div className="space-y-4"><div className="card p-8 text-center"><BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} /><h1 className="text-2xl font-bold mb-2">Filipenses 4:8 Concluído!</h1><div className="rounded-lg p-4 mb-4 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--color-tertiary-a08)', border: '1px solid var(--color-tertiary-a20)' }}><p className="italic">"{verse}"</p><p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Filipenses 4:8</p></div><Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link></div></div>);
  }

  return (
    <div className="space-y-4">
      <div className="card p-6"><h1 className="text-xl font-bold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Filipenses 4:8</h1><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Reorganize as palavras para formar o versículo correto. Clique nas palavras na ordem certa.</p></div>
      <div className="card p-6"><h2 className="font-bold mb-3">Sua resposta:</h2><div className="min-h-[100px] p-4 rounded-lg border-2 border-dashed" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-border)' }}>{selectedWords.length === 0 ? <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Clique nas palavras abaixo para montar o versículo...</p> : <div className="flex flex-wrap gap-2">{selectedWords.map((word, idx) => (<button key={idx} onClick={() => removeWord(idx)} className="px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-primary-a15)', color: 'var(--color-primary)' }}>{word}</button>))}</div>}</div></div>
      <div className="card p-6"><h2 className="font-bold mb-3 flex items-center gap-2">Palavras disponíveis<button onClick={shuffle} className="btn-secondary text-xs ml-auto"><Shuffle className="w-3 h-3" /> Embaralhar</button></h2><div className="flex flex-wrap gap-2">{shuffledWords.map((word, idx) => (<button key={idx} onClick={() => selectWord(word, idx)} className="px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>{word}</button>))}</div></div>
      <button onClick={checkOrder} disabled={selectedWords.length === 0} className="btn-primary w-full">{selectedWords.length === 0 ? 'Selecione palavras' : 'Verificar Versículo'}</button>
    </div>
  );
}
