import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSpecialty, preRequisitoCumprido } from '../curriculum';
import { recomendacoesDaTrilha, veredasQueFaltam } from '../lib/recomendacoes';
import { useVeredas } from '../hooks/useVeredas';
import { nomeCompleto, NOME_DO_TIPO } from '../types';
import {
  getProgressPercent, getProgressDetail, getModuleStatus, statusDasLicoes,
  getRequirementId, upsertRequirementProgress,
} from '../lib/progress';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useLicoesConcluidas } from '../hooks/useLicoesConcluidas';
import { useCertifications } from '../hooks/useCertifications';
import { coresDoProgresso } from '../lib/coresDoProgresso';
import ProgressBar from '../components/ui/ProgressBar';
import MarcaDaLicao from '../components/ui/MarcaDaLicao';
import Emblema from '../components/ui/Emblema';
import BotaoDeRequisitos from '../components/ui/BotaoDeRequisitos';
import { CheckCircle2, Award, HardHat, Signpost } from 'lucide-react';

export default function SpecialtyPage() {
  const { code } = useParams<{ code: string }>();
  const { profile } = useAuth();
  const specialty = code ? getSpecialty(code) : undefined;
  const { progress } = useRequirementProgress(profile?.id);
  const { licoesFeitas: feitas } = useLicoesConcluidas(profile?.id);
  const { getByCurriculum } = useCertifications(profile?.id);
  const cert = specialty ? getByCurriculum(specialty.code) : undefined;

  /*
    A trilha exigida antes desta já foi concluída?

    A pergunta era um `if` para a AP035 escrito nesta tela; agora sai do
    currículo, e a próxima trilha com pré-requisito não precisa de código novo.
    Conclusão aqui é ter todos os requisitos cumpridos, e não o certificado
    emitido: quem terminou a trilha anterior já pode começar a seguinte, mesmo
    que ainda não tenha clicado em emitir.
  */
  const concluiu = (codigo: string) => {
    const t = getSpecialty(codigo);
    return !!t && t.requirements.length > 0
      && getProgressPercent(t.requirements.map(r => r.code), progress) === 100;
  };
  const liberada = !specialty || preRequisitoCumprido(specialty, concluiu);

  /*
    As veredas que esta trilha recomenda, e as que a seguram.

    Recomendar é quase sempre certo: a vereda existe porque alguém precisava
    daquilo. Travar é a plataforma criando um pré-requisito que a ficha oficial
    não tem — só vale onde o requisito supõe um conhecimento que a trilha não
    ensina em lugar nenhum. Ver `curriculum/recomendacoes.ts`.
  */
  const { andamento } = useVeredas(profile?.id);
  const veredasFeitas = andamento.filter(a => a.concluida).map(a => a.id);
  const recomendadas = specialty ? recomendacoesDaTrilha(specialty.code) : [];
  const faltando = specialty ? veredasQueFaltam(specialty.code, veredasFeitas) : [];

  /*
    O requisito que o próprio portão cumpre.

    "Ter concluído a especialidade anterior" é requisito oficial, e precisa
    constar no progresso para o relatório e para a emissão do certificado. Ele
    era marcado por um laboratório que pedia um clique para conferir o que a
    plataforma já sabia; agora é registrado no instante em que a trilha abre.

    O upsert é idempotente, então repetir a visita não faz nada de novo.
  */
  useEffect(() => {
    if (!profile || !specialty || !liberada) return;
    const pendentes = specialty.requirements.filter(
      r => r.peloPreRequisito && progress[r.code]?.status !== 'completed',
    );
    if (pendentes.length === 0) return;

    (async () => {
      for (const r of pendentes) {
        const reqId = await getRequirementId(r.code);
        if (!reqId) continue;
        await upsertRequirementProgress(profile.id, reqId, {
          status: 'completed', mastery_score: 100, checkpoint_passed: true,
          attempts: 1, correct_count: 1, total_questions: 1,
        });
      }
    })();
  }, [profile, specialty, liberada, progress]);

  if (!specialty) return <div style={{ color: 'var(--color-text-muted)' }}>Especialidade não encontrada</div>;
  /* O card do painel não leva aqui, mas o endereço é adivinhável — sem esta
     guarda, bastaria digitá-lo para entrar numa trilha inacabada. */
  if (specialty.emConstrucao) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <HardHat className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
      <h1 className="text-xl font-bold mb-2">Esta trilha ainda está em construção</h1>
      <p style={{ color: 'var(--color-text-dim)' }}>
        Estamos preparando as lições. Ela aparece no painel assim que abrir.
      </p>
      <div className="flex justify-center mt-4">
        <BotaoDeRequisitos percurso={specialty} />
      </div>
      <Link to="/" className="btn-primary mt-6 inline-flex">Voltar ao Início</Link>
    </div>
  );
  if (!profile) return null;

  /*
    A trava por vereda usa a mesma tela do pré-requisito de trilha, e não uma
    nova: para quem está do lado de fora as duas são a mesma coisa — falta uma
    coisa antes. O que muda é o texto, que precisa dizer qual e por quê, senão o
    cadeado informa o estado e esconde o motivo.
  */
  if (faltando.length > 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <Emblema code={specialty.code} status="bloqueado" size={96} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{nomeCompleto(specialty)} está bloqueada</h1>
        <p className="mb-2" style={{ color: 'var(--color-text-dim)' }}>
          {faltando.length === 1
            ? 'Esta trilha parte de um conhecimento que ela não ensina, e que uma vereda ensina inteiro.'
            : 'Esta trilha parte de conhecimentos que ela não ensina, e que estas veredas ensinam inteiros.'}
        </p>
        <div className="flex flex-col gap-3 mt-6">
          {faltando.map(r => (
            <div key={r.vereda} className="card p-4 text-left">
              <p className="font-semibold mb-1">{nomeCompleto(r.aberta)}</p>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{r.porque}</p>
              <Link to={`/vereda/${r.aberta.code}`} className="btn-primary inline-flex">
                Percorrer {nomeCompleto(r.aberta)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!liberada) {
    const anterior = getSpecialty(specialty.preRequisito!);
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        {/* A arte da trilha, apagada e com o cadeado no aro: o prêmio continua
            à vista, que é a razão de destravá-la. Era um cadeado solto, que
            dizia o estado e não dizia de quê. */}
        <div className="flex justify-center mb-4">
          <Emblema code={specialty.code} status="bloqueado" size={96} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{nomeCompleto(specialty)} está bloqueada</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-dim)' }}>
          Conclua {anterior ? nomeCompleto(anterior) : specialty.preRequisito} para abrir esta trilha.
        </p>
        {anterior && (
          <Link to={`/especialidade/${anterior.code}`} className="btn-primary">
            Ir para {nomeCompleto(anterior)}
          </Link>
        )}
      </div>
    );
  }

  const overallPercent = getProgressPercent(specialty.requirements.map(r => r.code), progress);
  const overallDetail = getProgressDetail(specialty.requirements.map(r => r.code), progress);

  /*
    Uma segunda medida, em lições, ao lado do percentual.

    Numa trilha de 35 requisitos, terminar uma lição move o percentual uns
    poucos pontos — a barra mal se mexe e a impressão é de que nada aconteceu.
    A contagem de lições anda de um em um, que é o tamanho do passo que a pessoa
    acabou de dar. A prova final fica de fora: ela não é uma lição do percurso.
  */
  /* O mapa é montado sobre TODAS as lições da trilha, inclusive a prova: é ele
     que descobre quais requisitos são reivindicados por mais de uma lição. */
  const statusPorLicao = statusDasLicoes(specialty.modules.flatMap(m => m.lessons), progress, feitas);
  const licoes = specialty.modules.flatMap(m => m.lessons).filter(l => l.type !== 'final');
  const licoesFeitas = licoes.filter(l => statusPorLicao[l.code] === 'completed').length;
  /*
    Pelo andamento, e não pela trilha.

    Passou por duas versões erradas: primeiro `code === 'AP034' ? … : …`, que
    fazia a AP041 ser vermelha no painel e azul aqui; depois pelo grau, que
    deixava o painel com uma barra verde, uma azul e uma vermelha lado a lado,
    todas medindo a mesma coisa. A cor agora responde só a "em que ponto isto
    está", e quem troca para o verde ao completar é a própria ProgressBar.
  */
  const cores = coresDoProgresso(overallPercent);
  const accentColor = cores.destaque;
  const accentGrad = cores.gradiente;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/*
            O `Emblema`, e não um <img> solto.

            Aqui era `className="w-14 h-14"` — 56×56, um quadrado —, e a arte da
            especialidade é o patch oval de 710×558: o emblema chegava espremido
            num círculo achatado, com o texto dele estreitado junto. É o mesmo
            defeito que o cartão do painel já teve, e ele voltou por este lado
            porque esta tela desenhava a imagem por conta própria em vez de usar
            a peça que sabe a forma da arte.

            88 é a caixa, não a largura: o oval sai 88 × 69, e o disco da vereda
            sai 88 × 88 — o mesmo tamanho do cartão do painel, de propósito.
            Quem chega aqui clicando num cartão reencontra a mesma medalha, no
            mesmo tamanho, e não uma miniatura dela.
          */}
          <Emblema
            code={specialty.code}
            status={cert ? 'certificado' : overallPercent === 100 ? 'concluido' : 'em-andamento'}
            size={88}
          />
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold">{nomeCompleto(specialty)}</h1>
              <p style={{ color: 'var(--color-text-dim)' }}>{specialty.description}</p>
            </div>
            {/* O documento pelo qual a pessoa será avaliada, à mão desde a
                primeira lição: estudar sem saber o que a folha oficial pede é
                descobrir o requisito que faltou depois de terminar. */}
            <BotaoDeRequisitos percurso={specialty} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
        {cert && (
          <Link to={`/certificado/${cert.code}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition group"
            style={{ backgroundColor: 'var(--color-secondary-a08)', border: '1px solid var(--color-secondary-a20)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a40)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a20)')}>
            <Award className="w-5 h-5 group-hover:scale-110 transition" style={{ color: 'var(--color-secondary)' }} />
            <span className="font-semibold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido — Ver Certificado</span>
          </Link>
        )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>
            Progresso geral
            <span className="ml-2" style={{ color: 'var(--color-text-dim)' }}>
              · {licoesFeitas} de {licoes.length} {licoes.length === 1 ? 'lição' : 'lições'}
            </span>
          </span>
          <span className="font-semibold" style={{ color: overallPercent === 100 ? 'var(--color-success)' : accentColor }}>
            {overallPercent}%
            {/* Sem isto o cabeçalho dizia 0% enquanto a barra trazia um fiapo
                âmbar de poucos por cento — e a conclusão natural de quem acabou
                de terminar uma lição é que nada foi registrado. O módulo já
                trazia este aviso; o topo da trilha tinha ficado sem. */}
            {overallDetail.parcial > 0 && (
              <span className="font-normal ml-2" style={{ color: 'var(--color-secondary)' }}>
                +{overallDetail.parcial}% a recuperar
              </span>
            )}
          </span>
        </div>
        <ProgressBar percent={overallPercent} partial={overallDetail.parcial} color={accentGrad} height="lg" />
      </div>

      {/*
        As veredas que ajudam nesta trilha, em destaque e antes dos módulos.

        Antes dos módulos porque o proveito é começar por elas: dito depois da
        lista, o conselho chega a quem já escolheu por onde começar. E são
        convite, não porta — quem quiser ir direto vai, e a ficha oficial não
        cobra nenhuma delas.
      */}
      {recomendadas.length > 0 && (
        <div className="card p-5 mb-4"
          style={{ borderLeft: '3px solid var(--color-secondary)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Signpost className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
            <h2 className="font-bold">
              {recomendadas.length === 1 ? 'Uma vereda ajuda nesta trilha' : 'Veredas que ajudam nesta trilha'}
            </h2>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            São percursos curtos e de bônus: rendem insígnia e Token.Web(), e não
            entram no percentual desta trilha nem são cobrados na avaliação.
          </p>
          <div className="space-y-3">
            {recomendadas.map(r => {
              const feita = veredasFeitas.includes(r.vereda);
              return (
                <div key={r.vereda} className="flex items-start gap-3">
                  <span className="mt-0.5">
                    <Emblema code={r.aberta.code} size={34}
                      status={feita ? 'concluido' : 'em-andamento'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/vereda/${r.aberta.code}`} className="font-semibold hover:underline">
                      {nomeCompleto(r.aberta)}
                    </Link>
                    {feita && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-success)' }}>
                        concluída
                      </span>
                    )}
                    <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{r.porque}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {specialty.modules.map((module, idx) => {
          const moduleReqCodes = module.lessons.flatMap(l => l.requirementCodes);
          const moduleStatus = getModuleStatus(moduleReqCodes, progress);
          const modulePercent = getProgressPercent(moduleReqCodes, progress);
          const moduleDetail = getProgressDetail(moduleReqCodes, progress);
          return (
            <div key={module.code} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  /* O módulo em andamento usa a cor da própria trilha: estava
                     fixo no vermelho, e numa trilha azul o número destoava do
                     resto da página. */
                  style={{
                    backgroundColor: moduleStatus === 'completed' ? 'var(--color-success-a20)' : moduleStatus === 'not_started' ? 'var(--color-bg-hover)' : cores.fundoSuave,
                    color: moduleStatus === 'completed' ? 'var(--color-success)' : moduleStatus === 'not_started' ? 'var(--color-text-faint)' : accentColor,
                  }}>
                  {moduleStatus === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{module.title}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{module.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>{modulePercent}%</span>
                  {moduleDetail.parcial > 0 && (
                    /* O módulo não tem barra, só o número — então o trecho a
                       recuperar precisa vir escrito, ou some da leitura. */
                    <span className="block text-xs" style={{ color: 'var(--color-secondary)' }}>
                      +{moduleDetail.parcial}% a recuperar
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-13 space-y-2">
                {module.lessons.map(lesson => {
                  const lessonStatus = statusPorLicao[lesson.code];
                  const lessonPercent = getProgressPercent(lesson.requirementCodes, progress);
                  const lessonDetail = getProgressDetail(lesson.requirementCodes, progress);
                  /*
                    O rótulo mostra a NOTA, não o quanto a lição contribui para a
                    barra. São números diferentes quando parte dos requisitos já
                    passou: a barra fala do avanço da lição, e quem errou uma
                    questão quer saber que tirou 75%, não que somou 38%.
                  */
                  const pendentes = lesson.requirementCodes
                    .map(c => progress[c])
                    .filter(r => r && r.status !== 'completed' && r.mastery_score > 0);
                  const melhorNota = pendentes.length
                    ? Math.max(...pendentes.map(r => r!.mastery_score))
                    : 0;
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
                      {/* O ícone diz o tipo, o disco diz o estado — a mesma
                          leitura da vereda. Eram quatro ícones soltos que só
                          diziam feito/não feito: play não é teoria, e estrela
                          não é laboratório. */}
                      <MarcaDaLicao tipo={lesson.type} feita={lessonStatus === 'completed'} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 max-w-32">
                            <ProgressBar percent={lessonPercent} partial={lessonDetail.parcial} color={accentGrad} height="sm" />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                            {NOME_DO_TIPO[lesson.type]}
                          </span>
                          {melhorNota > 0 && (
                            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-secondary)' }}>
                              · a recuperar ({melhorNota}%)
                            </span>
                          )}
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
