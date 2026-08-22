import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getProgressPercent, getProgressDetail } from '../lib/progress';
import { getSpecialty, getAllSpecialties, getOpenSpecialties } from '../curriculum';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { useBadges } from '../hooks/useBadges';
import { getPublicName } from '../types';
import { franchiseConfig } from '../config/franchise';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import ProgressBar from '../components/ui/ProgressBar';
import SpecialtyEmblem from '../components/ui/SpecialtyEmblem';
import { LoadingState, EmptyState } from '../components/ui/PageState';
import { Lock, Award, Flame, Star, Clock, FileText, ArrowRight, Medal, HardHat } from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { progress } = useRequirementProgress(profile?.id);
  const { certifications, getByCurriculum } = useCertifications(profile?.id);
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
  const ap034Detail = getProgressDetail(ap034ReqCodes, progress);

  /* Vem do currículo: uma trilha nova aparece aqui sozinha, sem esta tela
     precisar saber dela. */
  /* Pelo andamento, e não pela trilha: três barras lado a lado dizendo a mesma
     coisa em três cores davam a entender que a cor significava algo. */
  const coresAp034 = coresDoProgresso(ap034Percent);
  const coresAp035 = coresDoProgresso(ap035Percent);

  const emConstrucao = getAllSpecialties().filter(e => e.emConstrucao);

  /*
    As demais trilhas abertas.

    AP034 e AP035 têm card próprio porque uma destrava a outra, e essa relação
    não generaliza. Toda outra trilha aberta é independente e entra por aqui.
    Sem isto, a AP041 sumiria da tela no dia em que ficasse pronta: ela não
    está no par acima, e ao deixar de ser "em construção" saiu da lista de
    anunciadas — aberta e invisível ao mesmo tempo.
  */
  const outrasAbertas = getOpenSpecialties()
    .filter(e => e.code !== 'AP034' && e.code !== 'AP035');
  const ap035Detail = getProgressDetail(ap035ReqCodes, progress);

  /* Pelo código da trilha: a AP041 também é "fundamental", e procurar pelo
     grau devolveria o certificado de uma trilha no card de outra. */
  const ap034Cert = getByCurriculum('AP034');
  const ap035Cert = getByCurriculum('AP035');
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
          onMouseEnter={e => (e.currentTarget.style.borderColor = coresAp034.bordaAoPassar)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = ap034Completed ? 'var(--color-primary-a40)' : 'var(--color-border)')}>
          <div className="flex items-center gap-4 mb-4">
            <SpecialtyEmblem
              code="AP034"
              status={ap034Cert ? 'certificado' : ap034Completed ? 'concluido' : 'em-andamento'}
            />
            <div className="min-w-0">
              <h2 className="text-xl font-bold">AP034 — Internet</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Nível Fundamental</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Insígnia para a faixa do desbravador
              </p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
              <span className="font-semibold" style={{ color: corDoPercentual(ap034Percent) }}>{ap034Percent}%</span>
            </div>
            <ProgressBar percent={ap034Percent} partial={ap034Detail.parcial} color={coresAp034.gradiente} />
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
            onMouseEnter={e => (e.currentTarget.style.borderColor = coresAp035.bordaAoPassar)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = ap035Percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
            <div className="flex items-center gap-4 mb-4">
              <SpecialtyEmblem
                code="AP035"
                status={ap035Cert ? 'certificado' : ap035Percent === 100 ? 'concluido' : 'em-andamento'}
              />
              <div className="min-w-0">
                <h2 className="text-xl font-bold">AP035 — Internet, Avançado</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>Nível Avançado</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Insígnia para a faixa do desbravador
                </p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
                <span className="font-semibold" style={{ color: corDoPercentual(ap035Percent) }}>{ap035Percent}%</span>
              </div>
              <ProgressBar percent={ap035Percent} partial={ap035Detail.parcial} color={coresAp035.gradiente} />
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

        {outrasAbertas.map(e => {
          const codes = e.requirements.map(r => r.code);
          const percent = getProgressPercent(codes, progress);
          const detail = getProgressDetail(codes, progress);
          const feitos = e.requirements.filter(r => progress[r.code]?.status === 'completed').length;
          const cores = coresDoProgresso(percent);
          return (
            <Link key={e.code} to={`/especialidade/${e.code}`} className="card p-6 block transition"
              style={{ borderColor: percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)', transition: 'border-color 0.2s' }}
              onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
              onMouseLeave={ev => (ev.currentTarget.style.borderColor = percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
              <div className="flex items-center gap-4 mb-4">
                <SpecialtyEmblem
                  code={e.code}
                  status={getByCurriculum(e.code) ? 'certificado' : percent === 100 ? 'concluido' : 'em-andamento'}
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{e.code} — {e.name}</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
                    Nível {e.level === 'fundamental' ? 'Fundamental' : 'Avançado'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Insígnia para a faixa do desbravador
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
                  <span className="font-semibold" style={{ color: corDoPercentual(percent) }}>{percent}%</span>
                </div>
                <ProgressBar percent={percent} partial={detail.parcial} color={cores.gradiente} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                {feitos} de {e.requirements.length} requisitos concluídos
              </p>
            </Link>
          );
        })}

        {/*
          As trilhas anunciadas e ainda não abertas. Ficam ao lado das outras
          para o clube saber o que vem — apareceriam do nada, prontas, se só
          entrassem no dia em que ficassem prontas.
        */}
        {emConstrucao.map(e => (
          <div key={e.code} className="card p-6 opacity-60" style={{ border: '2px dashed var(--color-border)' }}>
            <div className="flex items-center gap-3 mb-2">
              {/* O emblema real, dessaturado: mostra o que vem sem prometer que
                  já dá para começar. */}
              <img
                src={`${import.meta.env.BASE_URL}assets/specialties/${e.code}.svg`}
                alt=""
                className="w-14 h-14 flex-shrink-0 object-contain"
                style={{ filter: 'grayscale(1)', opacity: 0.7 }}
                onError={ev => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="min-w-0">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-dim)' }}>
                  <HardHat className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                  {e.code} — {e.name}
                </h2>
              </div>
            </div>
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full mb-3"
              style={{ backgroundColor: 'var(--color-secondary-a08)', color: 'var(--color-secondary)', border: '1px solid var(--color-secondary-a20)' }}
            >
              Em construção
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>{e.description}</p>
            <p className="text-xs mt-3" style={{ color: 'var(--color-text-faint)' }}>
              {e.requirements.length} requisitos, em {e.modules.length} módulos. Avisaremos quando abrir.
            </p>
          </div>
        ))}
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
                  <Award className="w-8 h-8 group-hover:scale-110 transition" style={{ color: 'var(--color-secondary)' }} />
                  <div className="flex-1 min-w-0">
                    {/* Pelo código da trilha: com três especialidades, "fundamental"
                        deixou de identificar uma delas, e um certificado da AP041
                        apareceria escrito "AP034 — Internet". */}
                    <p className="font-semibold">
                      {(() => {
                        const e = getSpecialty(cert.curriculum_code);
                        return e ? `${e.code} — ${e.name}` : cert.curriculum_code;
                      })()}
                    </p>
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
        <Link to="/verificar" className="btn-secondary"><Award className="w-4 h-4 mr-1" /> Verificar Token.Web()</Link>
      </div>

      <div className="card p-4" style={{ backgroundColor: 'var(--color-bg-input)', borderColor: 'var(--color-tertiary-a20)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{franchiseConfig.institutionalTexts.tokenDisclaimer}</p>
      </div>
    </div>
  );
}
