import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { Code2, Play, RotateCcw, CheckCircle2, AlertCircle, FileCode, Eye } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const starterCode = `<!DOCTYPE html>
<html>
<head>
  <title>Minha Página</title>
</head>
<body>
  <!-- Escreva seu HTML aqui -->
</body>
</html>`;

interface RequiredElement {
  tag: string;
  label: string;
  hint: string;
}

const requiredElements: RequiredElement[] = [
  { tag: '<html', label: '<html>', hint: 'Elemento raiz da página' },
  { tag: '<head', label: '<head>', hint: 'Cabeçalho com metadados' },
  { tag: '<body', label: '<body>', hint: 'Corpo visível da página' },
  { tag: '<b>', label: '<b>', hint: 'Texto em negrito' },
  { tag: '<i>', label: '<i>', hint: 'Texto em itálico' },
  { tag: '<li>', label: '<li>', hint: 'Item de lista' },
  { tag: '<a href', label: '<a href>', hint: 'Link com atributo href' },
  { tag: '<p>', label: '<p>', hint: 'Parágrafo de texto' },
  { tag: '<br', label: '<br>', hint: 'Quebra de linha' },
  { tag: '<img', label: '<img>', hint: 'Imagem com src e alt' },
  { tag: '<hr', label: '<hr>', hint: 'Linha horizontal' },
  { tag: '<table', label: '<table>', hint: 'Tabela' },
  { tag: '<tr', label: '<tr>', hint: 'Linha de tabela' },
  { tag: '<td', label: '<td>', hint: 'Célula de tabela' },
];

export default function CodeLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [code, setCode] = useState(starterCode);
  const [testResults, setTestResults] = useState<{ tag: string; label: string; hint: string; passed: boolean }[]>([]);
  const [tested, setTested] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [completed, setCompleted] = useState(false);

  const previewSrcDoc = useMemo(() => code, [code]);

  const runTests = () => {
    const lower = code.toLowerCase();
    setTestResults(requiredElements.map(el => ({ ...el, passed: lower.includes(el.tag.toLowerCase()) })));
    setTested(true);
  };

  const allPassed = testResults.length > 0 && testResults.every(t => t.passed);
  const passedCount = testResults.filter(t => t.passed).length;

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: requiredElements.length,
      });
    }
    await logActivity(userId, 'code_lab_completed', { elementsFound: passedCount });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">CodeLab Concluído!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Você incluiu todos os {requiredElements.length} elementos HTML exigidos no seu código.
          </p>
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Code2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> CodeLab — Editor HTML
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Escreva código HTML que contenha todos os {requiredElements.length} elementos exigidos à direita.
          Use o editor abaixo — comece com o esqueleto básico e adicione cada elemento.
          Clique em "Executar Testes" para validar, e alterne com "Preview" para ver o resultado.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Editor + Preview */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold flex items-center gap-2">
              <FileCode className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Código HTML
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary text-xs">
                <Eye className="w-3 h-3" /> {showPreview ? 'Editor' : 'Preview'}
              </button>
              <button onClick={() => { setCode(starterCode); setTested(false); setTestResults([]); }} className="btn-secondary text-xs">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
          {showPreview ? (
            <iframe srcDoc={previewSrcDoc} className="w-full rounded-lg border" style={{ height: '400px', backgroundColor: 'var(--color-text)', borderColor: 'var(--color-border)' }} title="Preview" />
          ) : (
            <textarea value={code} onChange={e => { setCode(e.target.value); setTested(false); }} rows={20} className="input-field font-mono text-xs" spellCheck={false} style={{ height: '400px' }} />
          )}
          <button onClick={runTests} className="btn-primary mt-2 w-full">
            <Play className="w-4 h-4 mr-1" /> Executar Testes
          </button>
        </div>

        {/* Test Results */}
        <div className="card p-4">
          <h2 className="font-bold mb-3">Elementos Exigidos ({passedCount}/{requiredElements.length})</h2>
          {!tested ? (
            <div className="space-y-2">
              {requiredElements.map(el => (
                <div key={el.tag} className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-secondary)', minWidth: '80px' }}>{el.label}</span>
                  <span style={{ color: 'var(--color-text-dim)' }}>{el.hint}</span>
                </div>
              ))}
              <p className="text-sm mt-3" style={{ color: 'var(--color-text-dim)' }}>
                Clique em "Executar Testes" para verificar seu código.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {testResults.map((t) => (
                  <li key={t.tag} className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: t.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                    {t.passed ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-error)' }} />}
                    <span className="font-mono font-bold" style={{ color: t.passed ? 'var(--color-success)' : 'var(--color-text-muted)', minWidth: '80px' }}>{t.label}</span>
                    <span style={{ color: t.passed ? 'var(--color-text-muted)' : 'var(--color-text-dim)' }}>{t.hint}</span>
                  </li>
                ))}
              </ul>
              {allPassed ? (
                <button onClick={handleComplete} className="btn-primary mt-4 w-full">Concluir CodeLab</button>
              ) : (
                <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-error)' }}>
                  Faltam {requiredElements.length - passedCount} elemento(s). Continue editando seu código.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
