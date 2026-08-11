import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSpecialty } from '../curriculum';
import { fetchRequirementProgress, getProgressPercent, getModuleStatus, getLessonStatus, type ProgressMap } from '../lib/progress';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle2, Play, Star, Trophy } from 'lucide-react';

export default function SpecialtyPage() {
  const { code } = useParams<{ code: string }>();
  const { profile } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [certified, setCertified] = useState(false);
  const [certCode, setCertCode] = useState('');
  const specialty = code ? getSpecialty(code) : undefined;

  useEffect(() => {
    if (!profile || !specialty) return;
    (async () => {
      const prog = await fetchRequirementProgress(profile.id);
      setProgress(prog);
      const { data: cert } = await supabase
        .from('certifications').select('*')
        .eq('user_id', profile.id).eq('level', specialty.level).eq('status', 'active').maybeSingle();
      if (cert) {
        setCertified(true);
        setCertCode(cert.code);
      }
    })();
  }, [profile, specialty]);

  if (!specialty) return <div style={{ color: 'var(--color-text-muted)' }}>Especialidade não encontrada</div>;
  if (!profile) return null;

  if (specialty.code === 'AP035') {
    const ap034 = getSpecialty('AP034')!;
    const ap034Percent = getProgressPercent(ap034.requirements.map(r => r.code), progress);
    if (ap034Percent < 100) {
      return (
        <div className="max-w-2xl mx-auto text-center py-12">
          <Lock className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border-hover)' }} />
          <h1 className="text-2xl font-bold mb-2">AP035 Bloqueada</h1>
          <p className="mb-6" style={{ color: 'var(--color-text-dim)' }}>Conclua a AP034 — Internet para desbloquear automaticamente.</p>
          <Link to="/especialidade/AP034" className="btn-primary">Ir para AP034</Link>
        </div>
      );
    }
  }

  const overallPercent = getProgressPercent(specialty.requirements.map(r => r.code), progress);
  const isAP034 = specialty.code === 'AP034';
  const accentColor = isAP034 ? 'var(--color-primary)' : 'var(--color-tertiary-light)';
  const accentGrad = isAP034 ? 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))' : 'linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary-light))';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img src={`/assets/specialties/${specialty.code}.svg`} alt={specialty.code} className="w-14 h-14" />
          <div>
            <h1 className="text-2xl font-bold">{specialty.name}</h1>
            <p style={{ color: 'var(--color-text-dim)' }}>{specialty.description}</p>
          </div>
        </div>
        {certified && (
          <Link to={`/certificado/${certCode}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition group"
            style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a40)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a20)')}>
            <Trophy className="w-5 h-5 group-hover:scale-110 transition" style={{ color: 'var(--color-secondary)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido — Ver Certificado</span>
          </Link>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>Progresso geral</span>
          <span className="font-semibold" style={{ color: overallPercent === 100 ? 'var(--color-success)' : accentColor }}>{overallPercent}%</span>
        </div>
        <div className="w-full rounded-full h-4" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div className="h-4 rounded-full transition-all" style={{ width: `${overallPercent}%`, background: overallPercent === 100 ? 'var(--color-success)' : accentGrad }} />
        </div>
      </div>

      <div className="space-y-3">
        {specialty.modules.map((module, idx) => {
          const moduleReqCodes = module.lessons.flatMap(l => l.requirementCodes);
          const moduleStatus = getModuleStatus(moduleReqCodes, progress);
          const modulePercent = getProgressPercent(moduleReqCodes, progress);
          return (
            <div key={module.code} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: moduleStatus === 'completed' ? 'var(--color-success-a20)' : moduleStatus === 'not_started' ? 'var(--color-bg-hover)' : 'var(--color-primary-a20)',
                    color: moduleStatus === 'completed' ? 'var(--color-success)' : moduleStatus === 'not_started' ? 'var(--color-text-faint)' : 'var(--color-primary)',
                  }}>
                  {moduleStatus === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{module.title}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{module.description}</p>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>{modulePercent}%</span>
              </div>
              <div className="ml-13 space-y-2">
                {module.lessons.map(lesson => {
                  const lessonStatus = getLessonStatus(lesson, progress);
                  const lessonPercent = getProgressPercent(lesson.requirementCodes, progress);
                  return (
                    <Link
                      key={lesson.code}
                      to={`/licao/${specialty.code}/${module.code}/${lesson.code}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition"
                      style={{
                        border: `1px solid ${lessonStatus === 'completed' ? 'var(--color-success-a20)' : 'var(--color-border)'}`,
                        backgroundColor: lessonStatus === 'completed' ? 'var(--color-success-a10)' : 'var(--color-bg-input)',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary-a40)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = lessonStatus === 'completed' ? 'var(--color-success-a20)' : 'var(--color-border)')}>
                      {lessonStatus === 'completed' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-success)' }} /> :
                       lesson.type === 'final' ? <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} /> :
                       lesson.type === 'lab' ? <Star className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-success)' }} /> :
                       <Play className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-faint)' }} />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 rounded-full h-1.5 max-w-32" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${lessonPercent}%`, background: lessonPercent === 100 ? 'var(--color-success)' : accentGrad }} />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                            {lesson.type === 'theory' ? 'Teoria' : lesson.type === 'lab' ? 'Laboratório' : lesson.type === 'final' ? 'Avaliação Final' : 'Quiz'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
