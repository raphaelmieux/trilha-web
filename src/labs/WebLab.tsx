import { useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import { Globe, RotateCw, Search, Download, CheckCircle2, AlertCircle, Home, Lock, ShieldCheck, FileText } from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

interface SimSite {
  url: string;
  title: string;
  secure: boolean;
  content: string;
}

const sites: SimSite[] = [
  { url: 'https://www.google.com', title: 'Google', secure: true, content: 'Motor de busca — digite sua consulta na barra de pesquisa abaixo.' },
  { url: 'https://www.youtube.com', title: 'YouTube', secure: true, content: 'Plataforma de vídeos — streaming de mídia.' },
  { url: 'https://www.bibliaonline.com.br', title: 'Bíblia Online', secure: true, content: 'Bíblia completa online — pesquise versículos.' },
  { url: 'https://pt.wikipedia.org', title: 'Wikipédia', secure: true, content: 'Enciclopédia livre — pesquise qualquer tema.' },
  { url: 'http://site-inseguro.exemplo.com', title: 'Site Inseguro (HTTP)', secure: false, content: 'Este site usa HTTP sem criptografia. Os dados não estão protegidos!' },
];

const searchResults: Record<string, { title: string; url: string; snippet: string }[]> = {
  'bíblia': [
    { title: 'Bíblia Online — Versículos e Pesquisa', url: 'https://www.bibliaonline.com.br', snippet: 'A Bíblia completa online com pesquisa por versículos...' },
    { title: 'Filipenses 4:8 — Bíblia', url: 'https://www.bibliaonline.com.br/filipenses/4/8', snippet: 'Tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo...' },
    { title: 'Estudos Bíblicos', url: 'https://pt.wikipedia.org/wiki/Bíblia', snippet: 'A Bíblia é uma coleção de textos sagrados do cristianismo...' },
  ],
  'internet': [
    { title: 'Internet — Wikipédia', url: 'https://pt.wikipedia.org/wiki/Internet', snippet: 'A Internet é uma rede global de computadores interconectados...' },
    { title: 'História da Internet', url: 'https://pt.wikipedia.org/wiki/História_da_Internet', snippet: 'A ARPANET foi a precursora da Internet moderna...' },
  ],
};

export default function WebLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentSite, setCurrentSite] = useState<SimSite | null>(null);
  const [visitedSites, setVisitedSites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRes, setSearchSearchRes] = useState<typeof searchResults[string] | null>(null);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [securityAnswer, setSecurityAnswer] = useState<boolean | null>(null);
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const visit = (site: SimSite) => {
    setCurrentUrl(site.url);
    setCurrentSite(site);
    setVisitedSites(prev => new Set([...prev, site.url]));
    if (!site.secure) {
      setSecurityQuestion(site.url);
      setSecurityAnswer(null);
    } else {
      setSecurityQuestion(null);
    }
  };

  const search = () => {
    if (!searchQuery.trim()) return;
    const key = searchQuery.toLowerCase().trim();
    const results = searchResults[key] || [
      { title: `${searchQuery} — Resultado`, url: `https://exemplo.com/${key}`, snippet: `Informações sobre ${searchQuery}...` },
      { title: `${searchQuery} — Guia`, url: `https://guia.com/${key}`, snippet: `Guia completo sobre ${searchQuery}...` },
    ];
    setSearchSearchRes(results);
  };

  const download = (filename: string) => {
    if (!downloadedFiles.includes(filename)) {
      setDownloadedFiles(prev => [...prev, filename]);
    }
  };

  const tasks = [
    { id: 'visit', label: 'Visitar pelo menos 3 sites', done: visitedSites.size >= 3 },
    { id: 'search', label: 'Fazer uma busca (ex: "Bíblia")', done: searchRes !== null },
    { id: 'download', label: 'Fazer um download', done: downloadedFiles.length > 0 },
    { id: 'security', label: 'Identificar site inseguro corretamente', done: securityAnswer === false },
  ];
  const allDone = tasks.every(t => t.done);

  const handleComplete = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: tasks.filter(t => t.done).length, total_questions: tasks.length,
      });
    }
    await logActivity(userId, 'web_lab_completed', { sitesVisited: visitedSites.size });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">WebLab Concluído!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Você visitou {visitedSites.size} sites, fez uma busca, realizou um download e identificou um site inseguro.
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
          <Globe className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> WebLab — Navegação e Pesquisa
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Simule a navegação web: visite sites, faça buscas, realize downloads e identifique conexões seguras.
        </p>
      </div>

      {/* Browser chrome */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
          <div className="flex-1 px-3 py-2 rounded-lg text-sm font-mono flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}>
            {currentUrl ? (
              <>
                {currentSite?.secure ? <Lock className="w-3 h-3" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-3 h-3" style={{ color: 'var(--color-error)' }} />}
                {currentUrl}
              </>
            ) : (
              <span style={{ color: 'var(--color-text-dim)' }}>Início — clique em um site abaixo para visitar</span>
            )}
          </div>
          <RotateCw className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
        </div>

        {/* Security question for insecure sites */}
        {securityQuestion && securityAnswer === null && (
          <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: 'var(--color-error-a10)', border: '1px solid var(--color-error-a20)' }}>
            <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
              <AlertCircle className="w-4 h-4" /> Este site é seguro para digitar senhas?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setSecurityAnswer(true)} className="btn-secondary text-xs">Sim, é seguro</button>
              <button onClick={() => setSecurityAnswer(false)} className="btn-primary text-xs">Não, não é seguro</button>
            </div>
          </div>
        )}
        {securityAnswer === true && (
          <div className="rounded-lg p-3 mb-3 text-sm" style={{ backgroundColor: 'var(--color-error-a10)', color: 'var(--color-error)' }}>
            Incorreto! Este site usa HTTP (não HTTPS) — não tem cadeado nem criptografia. Nunca digite senhas em sites sem HTTPS.
          </div>
        )}
        {securityAnswer === false && (
          <div className="rounded-lg p-3 mb-3 text-sm" style={{ backgroundColor: 'var(--color-success-a10)', color: 'var(--color-success)' }}>
            Correto! Este site usa HTTP sem criptografia — não é seguro para dados pessoais. Sempre verifique o cadeado e o https://.
          </div>
        )}

        {/* Site content or search */}
        {currentSite && !securityQuestion && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)' }}>
            <h2 className="font-bold mb-2">{currentSite.title}</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{currentSite.content}</p>
            {currentSite.secure && (
              <button onClick={() => download(`arquivo_${currentSite.title.toLowerCase().replace(/\s/g, '_')}.pdf`)} className="btn-secondary text-xs">
                <Download className="w-3 h-3" /> Baixar arquivo desta página
              </button>
            )}
          </div>
        )}

        {/* Site buttons */}
        <div className="flex gap-2 flex-wrap mt-3">
          {sites.map(s => (
            <button key={s.url} onClick={() => visit(s)} className="btn-secondary text-xs flex items-center gap-1">
              {s.secure ? <ShieldCheck className="w-3 h-3" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-3 h-3" style={{ color: 'var(--color-error)' }} />}
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Busca
        </h2>
        <div className="flex gap-2">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} className="input-field" placeholder="Digite sua busca (ex: Bíblia, Internet)" />
          <button onClick={search} className="btn-primary">Buscar</button>
        </div>
        {searchRes && (
          <ul className="mt-3 space-y-2">
            {searchRes.map((r, i) => (
              <li key={i} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>{r.title}</p>
                <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{r.url}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{r.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Downloads */}
      {downloadedFiles.length > 0 && (
        <div className="card p-4">
          <h2 className="font-bold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--color-primary)' }} /> Downloads
          </h2>
          <ul className="space-y-1">
            {downloadedFiles.map(f => (
              <li key={f} className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Download className="w-3 h-3" style={{ color: 'var(--color-success)' }} /> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tasks */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">Tarefas ({tasks.filter(t => t.done).length}/{tasks.length})</h2>
        <ul className="space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              {t.done ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />}
              <span style={{ color: t.done ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleComplete} disabled={!allDone} className="btn-primary w-full">
        {allDone ? 'Concluir WebLab' : 'Complete todas as tarefas'}
      </button>
    </div>
  );
}
