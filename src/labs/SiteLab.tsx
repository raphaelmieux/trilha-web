import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { validateHtml, validateSiteLinks, type CheckResult } from '../lib/htmlValidator';
import { CheckCircle2, AlertCircle, FileCode, Globe, Eye, PanelsTopLeft } from 'lucide-react';

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

const PAGES = [
  { file: 'index.html', title: 'Início' },
  { file: 'sobre.html', title: 'Sobre o Clube' },
  { file: 'galeria.html', title: 'Galeria' },
  { file: 'contato.html', title: 'Contato' },
];

const NAV = PAGES.map(p => `    <a href="${p.file}">${p.title}</a>`).join('\n');

const starter = (title: string, body: string) => `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
</head>
<body>
  <nav>
${NAV}
  </nav>
  <h1>${title}</h1>
${body}
</body>
</html>`;

const STARTERS: Record<string, string> = {
  'index.html': starter('Início', '  <p>Bem-vindo ao site do nosso clube!</p>'),
  'sobre.html': starter('Sobre o Clube', '  <p>Conte aqui a história do clube.</p>'),
  'galeria.html': starter('Galeria', '  <!-- Adicione imagens com <img src="..." alt="..."> -->'),
  'contato.html': starter('Contato', '  <!-- Crie um formulário com um campo e um botão -->'),
};

/** Per-page requirements. Every page must stand on its own as valid HTML. */
const PAGE_CHECKS = ['html', 'head', 'body', 'title', 'heading'];

export default function SiteLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const [pages, setPages] = useState<Record<string, string>>(() => ({ ...STARTERS }));
  const [active, setActive] = useState('index.html');
  const [mobileView, setMobileView] = useState<'code' | 'preview'>('code');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [previewCode, setPreviewCode] = useState(pages[active]);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCode(pages[active]), 400);
    return () => clearTimeout(t);
  }, [pages, active]);

  /** Structural problems, page by page. */
  const perPage = useMemo(() => {
    const out: Record<string, CheckResult[]> = {};
    for (const { file } of PAGES) out[file] = validateHtml(pages[file], PAGE_CHECKS);
    return out;
  }, [pages]);

  /** Whole-site requirements: interlinking, gallery images, contact form. */
  const siteChecks = useMemo(() => {
    const list = PAGES.map(p => ({ filename: p.file, content: pages[p.file] }));
    const linkChecks = validateSiteLinks(list);
    // AP035-6.1 describes the welcome page in more detail than any other, and it
    // was the one page nothing looked at.
    const welcome = validateHtml(pages['index.html'], ['welcomeReason', 'welcomeImage']);
    const gallery = validateHtml(pages['galeria.html'], ['image'])[0];
    const contact = validateHtml(pages['contato.html'], ['form'])[0];
    return [
      ...linkChecks,
      ...welcome,
      { ...gallery, label: 'Imagem na Galeria', hint: 'A galeria precisa de ao menos uma imagem com src e alt' },
      { ...contact, label: 'Formulário no Contato', hint: 'A página de contato precisa de um formulário com campo e botão' },
    ];
  }, [pages]);

  const allChecks = useMemo(
    () => [...Object.values(perPage).flat(), ...siteChecks],
    [perPage, siteChecks]
  );
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: allChecks.length,
      });
    }
    await logActivity(userId, 'site_lab_completed', { checksPassed: passedCount, total: allChecks.length });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">SiteLab concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Seu site de quatro páginas está estruturado, interligado e com formulário funcionando.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  const pageErrors = (file: string) => perPage[file].filter(c => !c.passed).length;

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" style={{ color: 'var(--color-tertiary-light)' }} /> SiteLab — Site com quatro páginas
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Construa um site completo com quatro páginas ligadas entre si. Os links são
          conferidos de verdade: uma página que ninguém aponta, ou um link para um
          arquivo que não existe, aparecem como erro — é assim que se testa um site real.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {allChecks.length}
            </span>
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>verificações</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir SiteLab'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div className="h-2 rounded-full transition-all duration-300" style={{
            width: `${(passedCount / allChecks.length) * 100}%`,
            background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary-light))',
          }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PAGES.map(p => {
          const errors = pageErrors(p.file);
          const isActive = active === p.file;
          return (
            <button
              key={p.file}
              onClick={() => setActive(p.file)}
              className="px-3 py-2 rounded-lg text-sm font-mono transition flex items-center gap-2"
              style={{
                backgroundColor: isActive ? 'var(--color-primary-a15)' : 'var(--color-bg-input)',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <FileCode className="w-3.5 h-3.5" />
              {p.file}
              {errors > 0 && (
                <span className="text-xs px-1.5 rounded-full" style={{ backgroundColor: 'var(--color-error-a20)', color: 'var(--color-error)' }}>
                  {errors}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 lg:hidden">
        <button onClick={() => setMobileView('code')} className={mobileView === 'code' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}>
          <FileCode className="w-4 h-4 mr-1" /> Código
        </button>
        <button onClick={() => setMobileView('preview')} className={mobileView === 'preview' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}>
          <Eye className="w-4 h-4 mr-1" /> Prévia
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`card p-4 ${mobileView === 'code' ? '' : 'hidden lg:block'}`}>
          <h2 className="font-bold mb-2 text-sm font-mono" style={{ color: 'var(--color-primary)' }}>{active}</h2>
          <textarea
            value={pages[active]}
            onChange={e => setPages({ ...pages, [active]: e.target.value })}
            spellCheck={false}
            className="input-field font-mono text-xs leading-relaxed"
            style={{ height: '420px', resize: 'vertical', tabSize: 2 }}
            aria-label={`Editor de ${active}`}
          />
        </div>

        <div className={`card p-4 ${mobileView === 'preview' ? '' : 'hidden lg:block'}`}>
          <h2 className="font-bold mb-2 flex items-center gap-2 text-sm">
            <PanelsTopLeft className="w-4 h-4" style={{ color: 'var(--color-tertiary-light)' }} /> Prévia de {active}
          </h2>
          <iframe
            srcDoc={previewCode}
            sandbox=""
            title={`Prévia de ${active}`}
            className="w-full rounded-lg"
            style={{ height: '420px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}
          />
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
            Os links não navegam aqui dentro — eles são conferidos pela lista de verificações abaixo.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-bold mb-3 text-sm">Estrutura de {active}</h2>
          <ul className="space-y-2">
            {perPage[active].map(r => (
              <li key={r.id} className="flex items-start gap-2 text-sm p-2 rounded-lg"
                style={{ backgroundColor: r.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                {r.passed
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
                <div>
                  <span className="font-mono font-bold" style={{ color: r.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>{r.label}</span>
                  <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{r.passed ? r.hint : (r.detail || r.hint)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <h2 className="font-bold mb-3 text-sm">Site completo</h2>
          <ul className="space-y-2">
            {siteChecks.map(r => (
              <li key={r.id} className="flex items-start gap-2 text-sm p-2 rounded-lg"
                style={{ backgroundColor: r.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                {r.passed
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
                <div>
                  <span className="font-bold" style={{ color: r.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>{r.label}</span>
                  <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{r.passed ? r.hint : (r.detail || r.hint)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
