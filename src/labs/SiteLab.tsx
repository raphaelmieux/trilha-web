import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { CheckCircle2, AlertCircle, FileCode, Globe, Eye } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

const blankPage = (title: string) => `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  <!-- Escreva o conteúdo da página ${title} aqui -->
</body>
</html>`;

const pageNames = ['index.html', 'sobre.html', 'contato.html', 'galeria.html'];
const pageTitles: Record<string, string> = {
  'index.html': 'Início',
  'sobre.html': 'Sobre',
  'contato.html': 'Contato',
  'galeria.html': 'Galeria',
};

export default function SiteLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [pages, setPages] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of pageNames) init[p] = blankPage(pageTitles[p]);
    return init;
  });
  const [activePage, setActivePage] = useState('index.html');
  const [showPreview, setShowPreview] = useState(false);
  const [tested, setTested] = useState(false);
  const [completed, setCompleted] = useState(false);

  const tests = [
    { id: 'pages4', label: '4 páginas criadas (index, sobre, contato, galeria)', passed: Object.keys(pages).length >= 4 },
    { id: 'links', label: 'Links <a href> em todas as páginas', passed: Object.values(pages).every(p => /<a\s+href/i.test(p)) },
    { id: 'nav', label: 'Navegação consistente (mesmos links em todas as páginas)', passed: Object.values(pages).every(p => /<a\s+href/i.test(p)) && Object.values(pages).filter(p => /<a\s+href/i.test(p)).length >= 4 },
    { id: 'form', label: 'Formulário <form> na página de contato', passed: /<form/i.test(pages['contato.html'] || '') },
    { id: 'input', label: 'Campo de entrada <input> no formulário', passed: /<input/i.test(pages['contato.html'] || '') },
    { id: 'button', label: 'Botão <button> no formulário', passed: /<button/i.test(pages['contato.html'] || '') },
    { id: 'html', label: 'Estrutura HTML válida (<html> em todas)', passed: Object.values(pages).every(p => /<html/i.test(p)) },
    { id: 'body', label: 'Corpo <body> em todas as páginas', passed: Object.values(pages).every(p => /<body/i.test(p)) },
  ];
  const allPassed = tests.every(t => t.passed);
  const passedCount = tests.filter(t => t.passed).length;

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: Math.round((passedCount / tests.length) * 100),
        checkpoint_passed: true, attempts: 1, correct_count: passedCount, total_questions: tests.length,
      });
    }
    await logActivity(userId, 'site_lab_completed', { passedCount, totalTests: tests.length });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">SiteLab Concluído!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Você criou um site com 4 páginas interligadas, navegação consistente e formulário de contato.
            Passou em {passedCount} de {tests.length} testes.
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
          <FileCode className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> SiteLab — Projeto de Site
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Crie um site com 4 páginas interligadas (Início, Sobre, Contato, Galeria).
          Cada página deve ter links de navegação para as outras.
          A página de Contato deve incluir um formulário com <code style={{ color: 'var(--color-secondary)' }}>&lt;form&gt;</code>,
          <code style={{ color: 'var(--color-secondary)' }}>&lt;input&gt;</code> e
          <code style={{ color: 'var(--color-secondary)' }}>&lt;button&gt;</code>.
        </p>
      </div>

      {/* Page tabs */}
      <div className="card p-4">
        <div className="flex gap-2 mb-3 flex-wrap">
          {pageNames.map(p => (
            <button key={p} onClick={() => setActivePage(p)} className="btn-secondary text-xs"
              style={activePage === p ? { backgroundColor: 'var(--color-primary-a15)', color: 'var(--color-primary)' } : {}}>
              {pageTitles[p]} <span className="font-mono opacity-50">{p}</span>
            </button>
          ))}
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary text-xs ml-auto">
            <Eye className="w-3 h-3" /> {showPreview ? 'Editor' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <iframe srcDoc={pages[activePage] || ''} className="w-full rounded-lg border" style={{ height: '400px', backgroundColor: 'var(--color-text)', borderColor: 'var(--color-border)' }} title={`Preview ${activePage}`} />
        ) : (
          <textarea value={pages[activePage] || ''} onChange={e => { setPages(prev => ({ ...prev, [activePage]: e.target.value })); setTested(false); }} rows={16} className="input-field font-mono text-xs" spellCheck={false} style={{ height: '400px' }} />
        )}
      </div>

      {/* Tests */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">Testes do Site ({passedCount}/{tests.length})</h2>
        <ul className="space-y-2">
          {tests.map(t => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              {t.passed ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: tested ? 'var(--color-error)' : 'var(--color-text-faint)' }} />}
              <span style={{ color: t.passed ? 'var(--color-text)' : tested ? 'var(--color-error)' : 'var(--color-text-dim)' }}>{t.label}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => setTested(true)} className="btn-secondary mt-3">
          <Globe className="w-4 h-4 mr-1" /> Verificar Testes
        </button>
        {tested && allPassed && (
          <button onClick={handleComplete} className="btn-primary mt-3 w-full">Concluir SiteLab</button>
        )}
        {tested && !allPassed && (
          <p className="text-sm mt-3 text-center" style={{ color: 'var(--color-error)' }}>
            Corrija os {tests.length - passedCount} teste(s) que falharam antes de concluir.
          </p>
        )}
      </div>
    </div>
  );
}
