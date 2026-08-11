import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getSpecialty } from '../curriculum';
import { getProgressPercent } from '../lib/progress';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { getPublicName } from '../types';
import { franchiseConfig } from '../config/franchise';
import { Printer, ArrowLeft, Compass, CheckCircle2, Circle, Star } from 'lucide-react';

interface ModuleProficiency {
  moduleTitle: string;
  moduleDescription: string;
  totalRequirements: number;
  completedRequirements: number;
  percent: number;
  level: 'Nenhum' | 'Iniciante' | 'Em Desenvolvimento' | 'Proficiente' | 'Dominado';
  areas: string[];
}

interface SpecialtySummary {
  code: string;
  name: string;
  level: string;
  emblem: string;
  overallPercent: number;
  totalReqs: number;
  completedReqs: number;
  modules: ModuleProficiency[];
  certified: boolean;
  certCode: string | null;
}

export default function ReportPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useRequirementProgress(profile?.id);
  const { certifications, loading: certsLoading } = useCertifications(profile?.id);
  const [lessonAttempts, setLessonAttempts] = useState<any[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const loading = progressLoading || certsLoading || attemptsLoading;
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: attempts } = await supabase
        .from('lesson_attempts')
        .select('*, lessons(code, title)')
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: true });
      setLessonAttempts(attempts || []);
      setAttemptsLoading(false);
    })();
  }, [profile]);

  const studentName = profile ? getPublicName(profile) : '';

  const { ap034Summary, ap035Summary, overallScore, totalAttempts, bestAvgScore } = useMemo(() => {
    if (!profile || loading) {
      return { ap034Summary: null, ap035Summary: null, overallScore: 0, totalAttempts: 0, bestAvgScore: 0 };
    }

    const ap034 = getSpecialty('AP034')!;
    const ap035 = getSpecialty('AP035')!;

    const buildSummary = (specialty: typeof ap034): SpecialtySummary => {
      const cert = certifications.find(c =>
        c.level === (specialty.level === 'fundamental' ? 'fundamental' : 'advanced') && c.status === 'active'
      );

      const modules: ModuleProficiency[] = specialty.modules.map(module => {
        const reqCodes = module.lessons.flatMap(l => l.requirementCodes);
        const completedReqs = reqCodes.filter(c => progress[c]?.status === 'completed').length;
        const percent = getProgressPercent(reqCodes, progress);
        let level: ModuleProficiency['level'] = 'Nenhum';
        if (percent === 100) level = 'Dominado';
        else if (percent >= 75) level = 'Proficiente';
        else if (percent >= 40) level = 'Em Desenvolvimento';
        else if (percent > 0) level = 'Iniciante';

        const areas = module.lessons.map(l => l.title);
        return {
          moduleTitle: module.title,
          moduleDescription: module.description,
          totalRequirements: reqCodes.length,
          completedRequirements: completedReqs,
          percent,
          level,
          areas,
        };
      });

      const totalReqs = specialty.requirements.length;
      const completedReqs = specialty.requirements.filter(r => progress[r.code]?.status === 'completed').length;
      const overallPercent = getProgressPercent(specialty.requirements.map(r => r.code), progress);

      return {
        code: specialty.code,
        name: specialty.name,
        level: specialty.level === 'fundamental' ? 'Fundamental' : 'Avançado',
        emblem: `/assets/specialties/${specialty.code}.svg`,
        overallPercent,
        totalReqs,
        completedReqs,
        modules,
        certified: !!cert,
        certCode: cert?.code || null,
      };
    };

    const ap034Summary = buildSummary(ap034);
    const ap035Summary = buildSummary(ap035);
    const overallScore = Math.round((ap034Summary.overallPercent + ap035Summary.overallPercent) / 2);
    const totalAttempts = lessonAttempts.length;
    const bestAvgScore = totalAttempts > 0
      ? Math.round(lessonAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / totalAttempts)
      : 0;

    return { ap034Summary, ap035Summary, overallScore, totalAttempts, bestAvgScore };
  }, [profile, progress, certifications, loading, lessonAttempts]);

  if (!profile) return null;
  if (loading) return <div className="text-center py-8" style={{ color: 'var(--color-text-dim)' }}>Carregando relatório...</div>;

  const generateNarrative = (summary: SpecialtySummary): string => {
    if (!summary) return '';
    const { code, name, modules, completedReqs, totalReqs, overallPercent, certified } = summary;

    const mastered = modules.filter(m => m.level === 'Dominado');
    const proficient = modules.filter(m => m.level === 'Proficiente');
    const developing = modules.filter(m => m.level === 'Em Desenvolvimento');
    const beginner = modules.filter(m => m.level === 'Iniciante');

    let narrative = `No âmbito da especialidade ${code} — ${name}, o aluno demonstrou `;

    if (overallPercent === 100) {
      narrative += `domínio completo de todos os ${totalReqs} requisitos avaliados. `;
    } else if (overallPercent >= 75) {
      narrative += `proficiência sólida, tendo concluído ${completedReqs} de ${totalReqs} requisitos (${overallPercent}%). `;
    } else if (overallPercent >= 40) {
      narrative += `progresso satisfatório, com ${completedReqs} de ${totalReqs} requisitos concluídos (${overallPercent}%). `;
    } else if (overallPercent > 0) {
      narrative += `conhecimento inicial, com ${completedReqs} de ${totalReqs} requisitos concluídos (${overallPercent}%). `;
    } else {
      narrative += `que ainda não iniciou formalmente os estudos desta trilha. `;
    }

    if (mastered.length > 0) {
      narrative += `Alcançou domínio nos seguintes módulos: ${mastered.map(m => m.moduleTitle).join(', ')}. `;
    }
    if (proficient.length > 0) {
      narrative += `Demonstrou proficiência em: ${proficient.map(m => m.moduleTitle).join(', ')}. `;
    }
    if (developing.length > 0) {
      narrative += `Encontra-se em desenvolvimento nos módulos: ${developing.map(m => m.moduleTitle).join(', ')}. `;
    }
    if (beginner.length > 0) {
      narrative += `Iniciou o estudo de: ${beginner.map(m => m.moduleTitle).join(', ')}. `;
    }

    if (certified) {
      narrative += `Concluiu a avaliação final com aproveitamento e recebeu a certificação Token.Web() — ${summary.level}, atestando a competência na área. `;
    }

    return narrative;
  };

  const ap034Narrative = ap034Summary ? generateNarrative(ap034Summary) : '';
  const ap035Narrative = ap035Summary ? generateNarrative(ap035Summary) : '';

  const proficiencyColor = (level: ModuleProficiency['level']): string => {
    switch (level) {
      case 'Dominado': return 'var(--color-success)';
      case 'Proficiente': return 'var(--color-success)';
      case 'Em Desenvolvimento': return 'var(--color-warning)';
      case 'Iniciante': return 'var(--color-primary)';
      default: return 'var(--color-text-faint)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</button>
        <button onClick={() => window.print()} className="btn-primary"><Printer className="w-4 h-4 mr-1" /> Exportar PDF</button>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* Print-only header */}
        <div className="hidden print:block text-center pb-4" style={{ borderBottom: '2px solid #333' }}>
          <h1 className="text-2xl font-bold">Relatório de Competências — Trilha.Web()</h1>
          <p className="text-sm mt-1">{franchiseConfig.institutionName}</p>
        </div>

        {/* Document header */}
        <div className="card p-8 print-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl pathfinder-gradient flex items-center justify-center flex-shrink-0">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold print-text-dark">Relatório de Competências</h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="print-text-dark">
                Documento de Avaliação de Aprendizagem — Trilha.Web()
              </p>
            </div>
          </div>

          {/* Student info table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider print-text-dark" style={{ color: 'var(--color-text-dim)' }}>Aluno</p>
              <p className="font-semibold print-text-dark" style={{ color: 'var(--color-text)' }}>{studentName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider print-text-dark" style={{ color: 'var(--color-text-dim)' }}>E-mail</p>
              <p className="font-semibold print-text-dark text-sm" style={{ color: 'var(--color-text)' }}>{profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider print-text-dark" style={{ color: 'var(--color-text-dim)' }}>Clube / Unidade</p>
              <p className="font-semibold print-text-dark" style={{ color: 'var(--color-text)' }}>
                {profile.club || '—'}{profile.unit ? ` / ${profile.unit}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider print-text-dark" style={{ color: 'var(--color-text-dim)' }}>Data</p>
              <p className="font-semibold print-text-dark" style={{ color: 'var(--color-text)' }}>{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Overall stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { value: `${overallScore}%`, label: 'Proficiência Geral', color: overallScore >= 75 ? 'var(--color-success)' : overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-primary)' },
              { value: totalAttempts, label: 'Avaliações Realizadas', color: 'var(--color-secondary)' },
              { value: `${bestAvgScore}%`, label: 'Média de Aproveitamento', color: 'var(--color-secondary)' },
              { value: certifications.filter(c => c.status === 'active').length, label: 'Certificações Obtidas', color: 'var(--color-success)' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-lg print-bg-light" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                <p className="text-2xl font-bold print-text-dark" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AP034 Section */}
        {ap034Summary && (
          <div className="card p-8 print-card">
            <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <img src={ap034Summary.emblem} alt={`Emblema ${ap034Summary.code}`} className="w-16 h-16 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold print-text-dark">{ap034Summary.code} — {ap034Summary.name}</h2>
                <p className="text-sm print-text-dark" style={{ color: 'var(--color-text-dim)' }}>
                  Nível {ap034Summary.level} • {ap034Summary.completedReqs} de {ap034Summary.totalReqs} requisitos concluídos
                </p>
              </div>
              {ap034Summary.certified && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg print-bg-light"
                  style={{ backgroundColor: 'var(--color-success-a10)', border: '1px solid var(--color-success-a20)' }}>
                  <CheckCircle2 className="w-4 h-4 print-text-dark" style={{ color: 'var(--color-success)' }} />
                  <span className="text-sm font-semibold print-text-dark" style={{ color: 'var(--color-success)' }}>Certificado</span>
                </div>
              )}
            </div>

            {/* Narrative */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 print-text-dark" style={{ color: 'var(--color-text-muted)' }}>Avaliação de Proficiência</h3>
              <p className="text-sm leading-relaxed print-text-dark" style={{ color: 'var(--color-text-soft)' }}>
                {ap034Narrative}
              </p>
            </div>

            {/* Module proficiency table */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 print-text-dark" style={{ color: 'var(--color-text-muted)' }}>Módulos e Níveis de Proficiência</h3>
              <div className="space-y-3">
                {ap034Summary.modules.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg print-bg-light" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                    <div className="flex-shrink-0">
                      {m.level === 'Dominado' || m.level === 'Proficiente' ? (
                        <CheckCircle2 className="w-5 h-5 print-text-dark" style={{ color: proficiencyColor(m.level) }} />
                      ) : m.level === 'Nenhum' ? (
                        <Circle className="w-5 h-5 print-text-dark" style={{ color: 'var(--color-text-faint)' }} />
                      ) : (
                        <Circle className="w-5 h-5 print-text-dark" style={{ color: proficiencyColor(m.level) }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm print-text-dark" style={{ color: 'var(--color-text)' }}>{m.moduleTitle}</p>
                      <p className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>{m.moduleDescription}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold print-text-dark" style={{ color: proficiencyColor(m.level) }}>{m.level}</p>
                      <p className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>{m.completedRequirements}/{m.totalRequirements} requisitos • {m.percent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification token */}
            {ap034Summary.certified && ap034Summary.certCode && (
              <div className="mt-4 p-3 rounded-lg flex items-center gap-2 print-bg-light"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <Star className="w-4 h-4 print-text-dark" style={{ color: 'var(--color-secondary)' }} fill="var(--color-secondary)" />
                <span className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>Token.Web():</span>
                <code className="text-xs font-mono print-text-dark" style={{ color: 'var(--color-secondary)' }}>{ap034Summary.certCode}</code>
              </div>
            )}
          </div>
        )}

        {/* AP035 Section */}
        {ap035Summary && (ap034Summary?.overallPercent === 100 || ap035Summary.completedReqs > 0) && (
          <div className="card p-8 print-card">
            <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <img src={ap035Summary.emblem} alt={`Emblema ${ap035Summary.code}`} className="w-16 h-16 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold print-text-dark">{ap035Summary.code} — {ap035Summary.name}</h2>
                <p className="text-sm print-text-dark" style={{ color: 'var(--color-text-dim)' }}>
                  Nível {ap035Summary.level} • {ap035Summary.completedReqs} de {ap035Summary.totalReqs} requisitos concluídos
                </p>
              </div>
              {ap035Summary.certified && (
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg print-bg-light"
                  style={{ backgroundColor: 'var(--color-success-a10)', border: '1px solid var(--color-success-a20)' }}>
                  <CheckCircle2 className="w-4 h-4 print-text-dark" style={{ color: 'var(--color-success)' }} />
                  <span className="text-sm font-semibold print-text-dark" style={{ color: 'var(--color-success)' }}>Certificado</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 print-text-dark" style={{ color: 'var(--color-text-muted)' }}>Avaliação de Proficiência</h3>
              <p className="text-sm leading-relaxed print-text-dark" style={{ color: 'var(--color-text-soft)' }}>
                {ap035Narrative}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 print-text-dark" style={{ color: 'var(--color-text-muted)' }}>Módulos e Níveis de Proficiência</h3>
              <div className="space-y-3">
                {ap035Summary.modules.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg print-bg-light" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                    <div className="flex-shrink-0">
                      {m.level === 'Dominado' || m.level === 'Proficiente' ? (
                        <CheckCircle2 className="w-5 h-5 print-text-dark" style={{ color: proficiencyColor(m.level) }} />
                      ) : m.level === 'Nenhum' ? (
                        <Circle className="w-5 h-5 print-text-dark" style={{ color: 'var(--color-text-faint)' }} />
                      ) : (
                        <Circle className="w-5 h-5 print-text-dark" style={{ color: proficiencyColor(m.level) }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm print-text-dark" style={{ color: 'var(--color-text)' }}>{m.moduleTitle}</p>
                      <p className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>{m.moduleDescription}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold print-text-dark" style={{ color: proficiencyColor(m.level) }}>{m.level}</p>
                      <p className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>{m.completedRequirements}/{m.totalRequirements} requisitos • {m.percent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {ap035Summary.certified && ap035Summary.certCode && (
              <div className="mt-4 p-3 rounded-lg flex items-center gap-2 print-bg-light"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <Star className="w-4 h-4 print-text-dark" style={{ color: 'var(--color-secondary)' }} fill="var(--color-secondary)" />
                <span className="text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>Token.Web():</span>
                <code className="text-xs font-mono print-text-dark" style={{ color: 'var(--color-secondary)' }}>{ap035Summary.certCode}</code>
              </div>
            )}
          </div>
        )}

        {/* Methodology note */}
        <div className="card p-6 print-card">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 print-text-dark" style={{ color: 'var(--color-text-muted)' }}>Metodologia de Avaliação</h3>
          <p className="text-xs leading-relaxed print-text-dark" style={{ color: 'var(--color-text-dim)' }}>
            Este documento foi gerado automaticamente pela plataforma Trilha.Web() com base no desempenho do aluno
            em avaliações teóricas, laboratórios práticos e avaliações finais. Os níveis de proficiência são:
            <strong style={{ color: 'var(--color-success)' }}> Dominado</strong> (100% dos requisitos),
            <strong style={{ color: 'var(--color-success)' }}> Proficiente</strong> (75–99%),
            <strong style={{ color: 'var(--color-warning)' }}> Em Desenvolvimento</strong> (40–74%),
            <strong style={{ color: 'var(--color-primary)' }}> Iniciante</strong> (1–39%) e
            <strong> Nenhum</strong> (0%). As certificações Token.Web() são emitidas após aprovação na avaliação final
            com aproveitamento mínimo de 80%.
          </p>
        </div>

        {/* Signature footer */}
        <div className="card p-8 print-card">
          <div className="flex justify-between text-sm print-text-dark">
            <div>
              <div className="w-48 mt-12 pt-1 print-text-dark" style={{ borderTop: '1px solid #888', color: '#666' }}>Assinatura do Aluno</div>
            </div>
            <div>
              <div className="w-48 mt-12 pt-1 print-text-dark" style={{ borderTop: '1px solid #888', color: '#666' }}>Assinatura do Avaliador</div>
            </div>
          </div>
          <div className="mt-6 text-center text-xs print-text-dark" style={{ color: 'var(--color-text-dim)' }}>
            <p>{franchiseConfig.institutionalTexts.tokenDisclaimer}</p>
            <p className="mt-1">Documento gerado por Trilha.Web() em {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
