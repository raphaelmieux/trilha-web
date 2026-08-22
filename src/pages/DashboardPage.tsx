import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getProgressPercent, getProgressDetail } from '../lib/progress';
import { getSpecialty, getFamilias, preRequisitoCumprido } from '../curriculum';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { useBadges } from '../hooks/useBadges';
import { useMinhasPosicoes } from '../hooks/useMinhasPosicoes';
import { getPublicName, nomeCompleto, ROTULO_DO_NIVEL, type Specialty, type Certification } from '../types';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import { descreverAtividade } from '../lib/atividade';
import ProgressBar from '../components/ui/ProgressBar';
import SpecialtyEmblem from '../components/ui/SpecialtyEmblem';
import { LoadingState, EmptyState } from '../components/ui/PageState';
import EstanteDeInsignias from '../components/ui/EstanteDeInsignias';
import { INSIGNIAS } from '../lib/insignias';
import type { ProgressMap } from '../lib/progress';
import { Lock, Award, Flame, Star, Clock, FileText, ArrowRight, Medal, HardHat } from 'lucide-react';

/**
 * O card de uma trilha, em qualquer um dos seus três estados.
 *
 * Anunciada, bloqueada por pré-requisito, ou aberta. Antes eram dois cards
 * escritos à mão mais uma lista para "as outras", e cada estado repetia a mesma
 * marcação com pequenas diferenças. Aqui há um lugar só, e a trilha nova entra
 * sem que esta tela precise saber o nome dela.
 *
 * O código e o nível ficam numa linha própria, abaixo do nome. Estavam colados
 * ao nome com travessão — "AP034 — Internet" —, o que não é como nenhum
 * material de desbravador escreve.
 */
function CardDaTrilha({ e, progress, cert, liberada }: {
  e: Specialty;
  progress: ProgressMap;
  cert: Certification | undefined;
  liberada: boolean;
}) {
  const codes = e.requirements.map(r => r.code);
  const percent = getProgressPercent(codes, progress);
  const detalhe = getProgressDetail(codes, progress);
  const feitos = e.requirements.filter(r => progress[r.code]?.status === 'completed').length;
  const cores = coresDoProgresso(percent);

  const identificacao = (
    <div className="min-w-0">
      <h3 className="text-xl font-bold">{nomeCompleto(e)}</h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
        Nível {ROTULO_DO_NIVEL[e.level]}
      </p>
    </div>
  );

  /* Anunciada: o clube vê o que vem, acinzentado e sem link. */
  if (e.emConstrucao) {
    return (
      <div className="card p-6 opacity-60" style={{ border: '2px dashed var(--color-border)' }}>
        <div className="flex items-center gap-4 mb-3">
          <SpecialtyEmblem code={e.code} status="bloqueado" />
          {identificacao}
        </div>
        <span className="text-xs px-2 py-1 rounded inline-flex items-center gap-1 mb-2"
          style={{ backgroundColor: 'var(--color-secondary-a08)', color: 'var(--color-secondary)' }}>
          <HardHat className="w-3.5 h-3.5" /> Em construção
        </span>
        <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>{e.description}</p>
      </div>
    );
  }

  /* Bloqueada: o pré-requisito é cumprido pelo próprio bloqueio, e não por um
     módulo dentro da trilha pedindo prova do que a plataforma já sabe. */
  if (!liberada) {
    const anterior = e.preRequisito;
    return (
      <div className="card p-6 opacity-70">
        <div className="flex items-center gap-4 mb-3">
          <SpecialtyEmblem code={e.code} status="bloqueado" />
          {identificacao}
        </div>
        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-faint)' }}>
          <Lock className="w-4 h-4" /> Conclua a {anterior} para abrir esta trilha.
        </p>
      </div>
    );
  }

  return (
    <Link to={`/especialidade/${e.code}`} className="card p-6 block transition"
      style={{ borderColor: percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)', transition: 'border-color 0.2s' }}
      onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
      onMouseLeave={ev => (ev.currentTarget.style.borderColor = percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
      <div className="flex items-center gap-4 mb-4">
        <SpecialtyEmblem
          code={e.code}
          status={cert ? 'certificado' : percent === 100 ? 'concluido' : 'em-andamento'}
        />
        {identificacao}
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
          <span className="font-semibold" style={{ color: corDoPercentual(percent) }}>{percent}%</span>
        </div>
        <ProgressBar percent={percent} partial={detalhe.parcial} color={cores.gradiente} />
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
        {feitos} de {e.requirements.length} requisitos concluídos
      </p>
      {cert && (
        <div className="mt-3 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}>
          <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido!</span><br />
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{cert.code.substring(0, 16)}...</span>
        </div>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { progress } = useRequirementProgress(profile?.id);
  const { certifications, getByCurriculum } = useCertifications(profile?.id);
  const { badges } = useBadges(profile?.id);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [noRanking, setNoRanking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { posicoes } = useMinhasPosicoes(profile?.id, noRanking);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: enrolls } = await supabase.from('enrollments').select('*, specialties(*)').eq('user_id', profile.id);
      setEnrollments(enrolls || []);
      const { data: events } = await supabase.from('activity_events').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10);
      setRecentEvents(events || []);
      /* A colocação só é buscada de quem optou por aparecer: para quem não
         optou, ela nem existe. */
      const { data: prefs } = await supabase
        .from('privacy_preferences').select('show_on_leaderboard').eq('user_id', profile.id).maybeSingle();
      setNoRanking(!!prefs?.show_on_leaderboard);
      setLoading(false);
    })();
  }, [profile]);

  if (!profile) return null;

  /*
    Tudo o que a tela precisa saber vem do currículo.

    Aqui havia seis constantes por trilha, escritas duas vezes — uma para a
    AP034 e outra para a AP035. Cada trilha nova pedia mais seis.
  */
  const familias = getFamilias();
  const concluiu = (code: string) => {
    const t = getFamilias().flatMap(f => f.trilhas).find(x => x.code === code);
    return !!t && t.requirements.length > 0
      && getProgressPercent(t.requirements.map(r => r.code), progress) === 100;
  };

  const xp = enrollments.reduce((sum, e) => sum + (e.xp || 0), 0);
  const streak = enrollments.reduce((max, e) => Math.max(max, e.streak_days || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {getPublicName(profile)}!</h1>
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

      {/* As insígnias logo abaixo do nome — ver EstanteDeInsignias. */}
      <EstanteDeInsignias
        badges={badges}
        total={INSIGNIAS.length + familias.flatMap(f => f.trilhas).filter(t => !t.emConstrucao).length}
        posicoes={posicoes}
      />

      {/*
        Uma seção por assunto, e dentro dela os níveis em ordem.

        Eram dois cards escritos à mão, AP034 e AP035, mais uma lista genérica
        para "as outras". Com sete trilhas e mais por vir, escrever cada uma é
        insustentável — e foi assim que a AP041 sumiu da tela no dia em que
        deixou de ser anunciada. Aqui não há trilha citada pelo nome: o que a
        tela sabe vem do currículo.
      */}
      {familias.map(({ nome, trilhas }) => (
        <section key={nome} className="space-y-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>{nome}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {trilhas.map(e => (
              <CardDaTrilha
                key={e.code}
                e={e}
                progress={progress}
                cert={getByCurriculum(e.code)}
                liberada={preRequisitoCumprido(e, concluiu)}
              />
            ))}
          </div>
        </section>
      ))}


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
                        apareceria escrito como se fosse de Internet. */}
                    <p className="font-semibold">
                      {(() => {
                        const e = getSpecialty(cert.curriculum_code);
                        return e ? nomeCompleto(e) : cert.curriculum_code;
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
            {recentEvents.map(event => {
              const a = descreverAtividade(event);
              return (
                <li key={event.id} className="flex items-start gap-3 text-sm pb-2" style={{ borderBottom: '1px solid var(--color-bg-hover)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--color-primary)' }}></span>
                  <span className="min-w-0">
                    {a.trilha && (
                      <span className="font-mono text-xs mr-1.5" style={{ color: 'var(--color-secondary)' }}>{a.trilha}</span>
                    )}
                    <span className="font-medium" style={{ color: 'var(--color-text-soft)' }}>{a.texto}</span>
                    {a.detalhe && (
                      <span className="text-xs ml-1.5" style={{ color: 'var(--color-text-muted)' }}>({a.detalhe})</span>
                    )}
                  </span>
                  <span className="ml-auto text-xs flex-shrink-0 whitespace-nowrap" style={{ color: 'var(--color-text-faint)' }}>
                    {new Date(event.created_at).toLocaleString('pt-BR')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/relatorio" className="btn-secondary"><FileText className="w-4 h-4 mr-1" /> Ver Relatório de Aprendizagem</Link>
        <Link to="/verificar" className="btn-secondary"><Award className="w-4 h-4 mr-1" /> Verificar Token.Web()</Link>
      </div>

    </div>
  );
}
