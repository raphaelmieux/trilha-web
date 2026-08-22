import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { validateHtml, type CheckResult } from '../lib/htmlValidator';
import { Code2, RotateCcw, CheckCircle2, AlertCircle, FileCode, Eye, PanelsTopLeft } from 'lucide-react';

/**
 * Two variants, one editor.
 *
 * `elementos` is the guided run through requirements AP035-3.1 … 3.13: sixteen
 * checks, one per element. `tabela` is requirement AP035-3.14, "criar página
 * completa" — and it exists as a separate variant because the curriculum used to
 * point that lesson at this very component with the very same sixteen checks, so
 * the student met the identical screen twice and the second visit proved
 * nothing. The table challenge judges a finished artefact instead: a header row,
 * a shape worth tabulating, no empty cells, and data that is the student's own.
 */
export type CodeLabVariant = 'elementos' | 'tabela';

interface Props {
  specialtyCode: string;
  lessonCode: string;
  requirementCodes: string[];
  userId: string;
  variant?: CodeLabVariant;
}

const STARTERS: Record<CodeLabVariant, string> = {
  elementos: `<!DOCTYPE html>
<html>
<head>
  <title>Meu Clube de Desbravadores</title>
</head>
<body>

  <!-- Escreva seu HTML aqui. A prévia ao lado atualiza sozinha. -->

</body>
</html>`,
  tabela: `<!DOCTYPE html>
<html>
<head>
  <title>Escala da Unidade</title>
</head>
<body>

  <h1>Escala da Unidade Falcão</h1>

  <p>Escreva aqui o texto do documento, explicando do que trata esta tabela.</p>

  <hr>

  <table>
    <caption>Trocar por uma descrição da sua tabela</caption>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
      <th>Coluna 3</th>
    </tr>
    <tr>
      <td>Dado 1</td>
      <td>Dado 2</td>
      <td>Dado 3</td>
    </tr>
  </table>

  <p><a href="https://adventistas.org">Site oficial</a></p>

</body>
</html>`,
};

const CHECK_IDS: Record<CodeLabVariant, string[]> = {
  // Mirrors requirements AP035-3.1 … 3.13.
  elementos: [
    'html', 'head', 'body', 'title', 'heading', 'paragraph', 'bold', 'italic',
    'listItem', 'link', 'lineBreak', 'image', 'horizontalRule',
    'table', 'tableRow', 'tableCell',
  ],
  // Requirement AP035-4.1, which names every one of these.
  tabela: [
    'pageComplete', 'tableHeadingSize', 'tableStructure', 'tableHeader', 'tableSize',
    'tableFilled', 'tableGraphic', 'tableRule', 'tableLink', 'tableHexColour',
    'tableCaption', 'tableOwnContent',
  ],
};

const TITLES: Record<CodeLabVariant, string> = {
  elementos: 'CodeLab — Editor HTML',
  tabela: 'Desafio: Página com Tabela',
};

const INTROS: Record<CodeLabVariant, string> = {
  elementos: 'Escreva uma página HTML completa. A prévia ao lado mostra o resultado real, e a lista de requisitos é conferida enquanto você digita — cada item só é marcado quando o elemento existe de verdade na página, com o conteúdo e os atributos que o requisito pede.',
  tabela: 'O requisito 4 pede uma página inteira: uma tabela com texto, um gráfico, uma regra horizontal e um link, com algum texto colorido por código hexadecimal e um título maior que o corpo. Escolha algo do seu clube para tabelar — a escala da unidade, os hinos do trimestre — e troque o exemplo que já está no editor, que não conta.',
};

export default function CodeLab({ specialtyCode, lessonCode, requirementCodes, userId, variant = 'elementos' }: Props) {
  const starter = STARTERS[variant];
  const [code, setCode] = useState(starter);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<'code' | 'preview'>('code');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live validation: the student sees a requirement tick the moment the markup
  // becomes correct, which is the feedback loop that teaches the element. The
  // previous version only told them anything after pressing "Executar Testes".
  const results: CheckResult[] = useMemo(() => validateHtml(code, CHECK_IDS[variant]), [code, variant]);
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
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: results.length,
      });
    }
    await logActivity(userId, 'code_lab_completed', { specialtyCode, lessonCode, variant, checksPassed: passedCount, total: results.length });
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
        <h1 className="text-2xl font-bold mb-2">{TITLES[variant]} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Sua página passou nas {results.length} verificações.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Code2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {TITLES[variant]}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {INTROS[variant]}
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
              {saving ? 'Salvando...' : 'Concluir'}
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
            <button onClick={() => setCode(starter)} className="btn-secondary text-xs">
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
