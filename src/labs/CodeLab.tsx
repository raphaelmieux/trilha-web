import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { validateHtml, type CheckResult } from '../lib/htmlValidator';
import { Code2, RotateCcw, CheckCircle2, AlertCircle, FileCode, Eye, PanelsTopLeft } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const STARTER = `<!DOCTYPE html>
<html>
<head>
  <title>Meu Clube de Desbravadores</title>
</head>
<body>

  <!-- Escreva seu HTML aqui. A prévia ao lado atualiza sozinha. -->

</body>
</html>`;

// Mirrors requirements AP035-3.1 … 3.13.
const CHECK_IDS = [
  'html', 'head', 'body', 'title', 'heading', 'paragraph', 'bold', 'italic',
  'listItem', 'link', 'lineBreak', 'image', 'horizontalRule',
  'table', 'tableRow', 'tableCell',
];

export default function CodeLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [code, setCode] = useState(STARTER);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<'code' | 'preview'>('code');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live validation: the student sees a requirement tick the moment the markup
  // becomes correct, which is the feedback loop that teaches the element. The
  // previous version only told them anything after pressing "Executar Testes".
  const results: CheckResult[] = useMemo(() => validateHtml(code, CHECK_IDS), [code]);
  const passedCount = results.filter(r => r.passed).length;
  const allPassed = passedCount === results.length;

  // Debounced so the iframe is not rebuilt on every keystroke.
  const [previewCode, setPreviewCode] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCode(code), 400);
    return () => clearTimeout(t);
  }, [code]);

  const lineCount = useMemo(() => code.split('\n').length, [code]);

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: results.length,
      });
    }
    await logActivity(userId, 'code_lab_completed', { checksPassed: passedCount, total: results.length });
    setCompleted(true);
  };

  /** Inserts a snippet at the caret so beginners are not stuck on syntax. */
  const insert = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = code.slice(0, start) + snippet + code.slice(end);
    setCode(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">CodeLab concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Sua página passou nas {results.length} verificações de estrutura HTML.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
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
          Escreva uma página HTML completa. A prévia ao lado mostra o resultado real,
          e a lista de requisitos é conferida enquanto você digita — cada item só é
          marcado quando o elemento existe de verdade na página, com o conteúdo e os
          atributos que o requisito pede.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {results.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>requisitos atendidos</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir CodeLab'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(passedCount / results.length) * 100}%`,
              background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      {/* Mobile switch — on small screens editor and preview cannot sit side by side */}
      <div className="flex gap-2 lg:hidden">
        <button
          onClick={() => setMobileView('code')}
          className={mobileView === 'code' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
        >
          <FileCode className="w-4 h-4 mr-1" /> Código
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={mobileView === 'preview' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
        >
          <Eye className="w-4 h-4 mr-1" /> Prévia
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`card p-4 ${mobileView === 'code' ? '' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <FileCode className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> index.html
              <span className="text-xs font-normal" style={{ color: 'var(--color-text-dim)' }}>{lineCount} linhas</span>
            </h2>
            <button onClick={() => setCode(STARTER)} className="btn-secondary text-xs">
              <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {[
              { label: '<p>', snip: '<p>Texto do parágrafo</p>\n' },
              { label: '<h1>', snip: '<h1>Título</h1>\n' },
              { label: 'lista', snip: '<ul>\n  <li>Primeiro item</li>\n  <li>Segundo item</li>\n</ul>\n' },
              { label: 'link', snip: '<a href="https://adventistas.org">Site oficial</a>\n' },
              { label: 'imagem', snip: '<img src="foto.jpg" alt="Descrição da foto">\n' },
              { label: 'tabela', snip: '<table>\n  <tr>\n    <td>Nome</td>\n    <td>Unidade</td>\n  </tr>\n  <tr>\n    <td>Ana</td>\n    <td>Falcão</td>\n  </tr>\n</table>\n' },
            ].map(b => (
              <button
                key={b.label}
                onClick={() => insert(b.snip)}
                className="text-xs px-2 py-1 rounded font-mono transition"
                style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
                title="Inserir no cursor"
              >
                + {b.label}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="input-field font-mono text-xs leading-relaxed"
            style={{ height: '440px', resize: 'vertical', tabSize: 2 }}
            aria-label="Editor de código HTML"
          />
        </div>

        <div className={`card p-4 ${mobileView === 'preview' ? '' : 'hidden lg:block'}`}>
          <h2 className="font-bold mb-2 flex items-center gap-2 text-sm">
            <PanelsTopLeft className="w-4 h-4" style={{ color: 'var(--color-tertiary-light)' }} /> Prévia ao vivo
          </h2>
          {/* sandbox with no allow-scripts: student markup renders, but cannot run
              JavaScript or navigate the parent page. */}
          <iframe
            srcDoc={previewCode}
            sandbox=""
            title="Prévia da página"
            className="w-full rounded-lg"
            style={{ height: '440px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}
          />
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-bold mb-3 text-sm">Requisitos verificados</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {results.map(r => (
            <li
              key={r.id}
              className="flex items-start gap-2 text-sm p-2 rounded-lg"
              style={{ backgroundColor: r.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}
            >
              {r.passed
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
              <div className="min-w-0">
                <span className="font-mono font-bold" style={{ color: r.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>
                  {r.label}
                </span>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  {r.passed ? r.hint : (r.detail || r.hint)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
