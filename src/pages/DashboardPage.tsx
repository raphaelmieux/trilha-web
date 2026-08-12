import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getSpecialty } from '../curriculum';
import { getProgressPercent } from '../lib/progress';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { useBadges } from '../hooks/useBadges';
import { getPublicName } from '../types';
import { franchiseConfig } from '../config/franchise';
import ProgressBar from '../components/ui/ProgressBar';
import { LoadingState, EmptyState } from '../components/ui/PageState';
import { Lock, Trophy, Flame, Star, CheckCircle2, Circle, Clock, Award, FileText, ArrowRight, Medal } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { progress } = useRequirementProgress(profile?.id);
  const { certifications } = useCertifications(profile?.id);
  const { badges } = useBadges(profile?.id);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: enrolls } = await supabase.from('enrollments').select('*, specialties(*)').eq('user_id', profile.id);
      setEnrollments(enrolls || []);
      const { data: events } = await supabase.from('activity_events').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10);
      setRecentEvents(events || []);
      setLoading(false);
    })();
  }, [profile]);

  if (!profile) return null;

  const ap034 = getSpecialty('AP034')!;
  const ap035 = getSpecialty('AP035')!;

  const ap034ReqCodes = ap034.requirements.map(r => r.code);
  const ap035ReqCodes = ap035.requirements.map(r => r.code);
  const ap034Percent = getProgressPercent(ap034ReqCodes, progress);
  const ap035Percent = getProgressPercent(ap035ReqCodes, progress);

  const ap034Cert = certifications.find(c => c.level === 'fundamental');
  const ap035Cert = certifications.find(c => c.level === 'advanced');
  const ap034Completed = ap034Percent === 100;

  const xp = enrollments.reduce((sum, e) => sum + (e.xp || 0), 0);
  const streak = enrollments.reduce((max, e) => Math.max(max, e.streak_days || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {getPublicName(profile)}!</h1>
          <p style={{ color: 'var(--color-text-dim)' }}>Bem-vindo(a) de volta à sua trilha de aprendizagem</p>
        </div>
        <div className="flex gap-4">
          <div className="card px-4 py-2 flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            <div><span className="font-bold">{xp}</span> <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>XP</span></div>
          </div>
          <div className="card px-4 py-2 flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <div><span className="font-bold">{streak}</span> <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>dias</span></div>
          </div>
          <Link to="/perfil" className="card px-4 py-2 flex items-center gap-2 transition hover:opacity-80">
            <Medal className="w-5 h-5" style={{ color: 'var(--color-tertiary-light)' }} />
            <div><span className="font-bold">{badges.length}</span> <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>badges</span></div>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AP034 */}
        <Link to="/especialidade/AP034" className="card p-6 block transition"
          style={{ borderColor: ap034Completed ? 'var(--color-primary-a40)' : 'var(--color-border)', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary-a50)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = ap034Completed ? 'var(--color-primary-a40)' : 'var(--color-border)')}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <img src="/assets/specialties/AP034.svg" alt="AP034" className="w-8 h-8" />
                AP034 — Internet
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Nível Fundamental</p>
            </div>
            {ap034Cert ? <Trophy className="w-8 h-8" style={{ color: 'var(--color-secondary)' }} /> :
              ap034Completed ? <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-success)' }} /> :
              <Circle className="w-8 h-8" style={{ color: 'var(--color-border-hover)' }} />}
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
              <span className="font-semibold" style={{ color: ap034Completed ? 'var(--color-success)' : 'var(--color-primary)' }}>{ap034Percent}%</span>
            </div>
            <ProgressBar percent={ap034Percent} color="linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))" />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {ap034.requirements.filter(r => progress[r.code]?.status === 'completed').length} de {ap034.requirements.length} requisitos concluídos
          </p>
          {ap034Cert && (
            <div className="mt-3 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}>
              <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido!</span><br />
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{ap034Cert.code.substring(0, 16)}...</span>
            </div>
          )}
        </Link>

        {/* AP035 */}
        {ap034Completed ? (
          <Link to="/especialidade/AP035" className="card p-6 block transition"
            style={{ borderColor: ap035Percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-tertiary-a50)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = ap035Percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <img src="/assets/specialties/AP035.svg" alt="AP035" className="w-8 h-8" />
                  AP035 — Internet, Avançado
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Nível Avançado</p>
              </div>
              {ap035Cert ? <Trophy className="w-8 h-8" style={{ color: 'var(--color-secondary)' }} /> :
                ap035Percent === 100 ? <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-success)' }} /> :
                <Circle className="w-8 h-8" style={{ color: 'var(--color-border-hover)' }} />}
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
                <span className="font-semibold" style={{ color: ap035Percent === 100 ? 'var(--color-success)' : 'var(--color-tertiary-light)' }}>{ap035Percent}%</span>
              </div>
              <ProgressBar percent={ap035Percent} color="linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary-light))" />
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {ap035.requirements.filter(r => progress[r.code]?.status === 'completed').length} de {ap035.requirements.length} requisitos concluídos
            </p>
            {ap035Cert && (
              <div className="mt-3 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Token.Web() Avançado emitido!</span><br />
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{ap035Cert.code.substring(0, 16)}...</span>
              </div>
            )}
          </Link>
        ) : (
          <div className="card p-6 opacity-50" style={{ border: '2px dashed var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5" style={{ color: 'var(--color-border-hover)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-dim)' }}>AP035 — Internet, Avançado</h2>
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-faint)' }}>Bloqueado</p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Conclua a AP034 — Internet para desbloquear automaticamente a trilha avançada.</p>
          </div>
        )}
      </div>

      {certifications.length > 0 && (
        <div className="card p-6" style={{ borderColor: 'var(--color-secondary-a20)' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} /> Suas Certificações
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {certifications.map(cert => (
              <Link key={cert.id} to={`/certificado/${cert.code}`}
                className="block p-4 rounded-lg transition group"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a40)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 group-hover:scale-110 transition" style={{ color: 'var(--color-secondary)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{cert.level === 'fundamental' ? 'AP034 — Internet' : 'AP035 — Internet, Avançado'}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{cert.code}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:transition" style={{ color: 'var(--color-text-faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: 'var(--color-success)' }} /> Atividade Recente
        </h2>
        {loading ? (
          <LoadingState />
        ) : recentEvents.length === 0 ? (
          <EmptyState title="Nenhuma atividade ainda" description="Comece a estudar para ver seu progresso aqui!" />
        ) : (
          <ul className="space-y-2">
            {recentEvents.map(event => (
              <li key={event.id} className="flex items-center gap-3 text-sm pb-2" style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                <span className="font-medium" style={{ color: 'var(--color-text-soft)' }}>{event.event_type.replace(/_/g, ' ')}</span>
                <span className="ml-auto text-xs" style={{ color: 'var(--color-text-faint)' }}>{new Date(event.created_at).toLocaleString('pt-BR')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/relatorio" className="btn-secondary"><FileText className="w-4 h-4 mr-1" /> Ver Relatório de Aprendizagem</Link>
        <Link to="/verificar" className="btn-secondary"><Trophy className="w-4 h-4 mr-1" /> Verificar Token.Web()</Link>
      </div>

      <div className="card p-4" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-tertiary-a20)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{franchiseConfig.institutionalTexts.tokenDisclaimer}</p>
      </div>
    </div>
  );
}
