import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getOpenSpecialties } from '../curriculum';
import { nomeCompleto, type Tabela } from '../types';
import { useRequirementProgress } from '../hooks/useRequirementProgress';
import { useCertifications } from '../hooks/useCertifications';
import { useBadges } from '../hooks/useBadges';
import { useVeredas } from '../hooks/useVeredas';
import { veredasAbertas } from '../curriculum/veredas';
import { buildSpecialtyNarrative, buildClosingParagraph, buildBadgeParagraph, type LabEvidence } from '../lib/reportNarrative';
import { LoadingState } from '../components/ui/PageState';
import CertificateCanvas from '../components/CertificateCanvas';
import BadgeIcon from '../components/ui/BadgeIcon';
import { exportReportPdf, type ReportSection } from '../lib/pdf';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';

export default function ReportPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useRequirementProgress(profile?.id);
  const { certifications, loading: certsLoading } = useCertifications(profile?.id);
  const { badges, loading: badgesLoading } = useBadges(profile?.id);
  const { andamento } = useVeredas(profile?.id);
  const [lessonAttempts, setLessonAttempts] = useState<Pick<Tabela<'lesson_attempts'>, 'score' | 'total'>[]>([]);
  const [evidence, setEvidence] = useState<LabEvidence>({});
  /* Os relatórios escritos nos laboratórios de redação, por código de trilha.
     São a prova do cumprimento do requisito, e por isso vão impressos. */
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const loading = progressLoading || certsLoading || attemptsLoading || badgesLoading;

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: attempts } = await supabase
        .from('lesson_attempts')
        .select('score, total')
        .eq('user_id', profile.id);
      setLessonAttempts(attempts || []);

      /* The most recent WebLab completion carries what the student registered
         for requirements 6.1 and 6.2. Read here rather than stored on the
         requirement row because activity_events is already the audit trail. */
      const { data: events } = await supabase
        .from('activity_events')
        .select('metadata')
        .eq('user_id', profile.id)
        .eq('event_type', 'web_lab_completed')
        .order('created_at', { ascending: false })
        .limit(1);
      const latest = events?.[0]?.metadata as LabEvidence | undefined;
      if (latest) setEvidence(latest);

      /*
        Os textos entregues, de qualquer um dos dois laboratórios de escrita.

        Os dois gravam na mesma tabela, com a mesma chave, então quem escreveu
        na caixa de texto antiga e quem montou o relatório por etapas aparecem
        aqui do mesmo jeito. Só entram os que foram entregues: rascunho não é
        prova de cumprimento.
      */
      const { data: projetos } = await supabase
        .from('text_projects')
        .select('specialty_code, body, status')
        .eq('user_id', profile.id)
        .eq('status', 'submitted');
      setTextos(Object.fromEntries(
        (projetos ?? [])
          .filter(p => p.specialty_code && (p.body ?? '').trim())
          .map(p => [p.specialty_code as string, (p.body as string).trim()]),
      ));

      setAttemptsLoading(false);
    })();
  }, [profile]);

  /*
    Nome completo, não a forma pública escolhida em Perfil.

    O relatório é entregue à liderança do clube e traz os certificados anexos,
    que a partir de agora saem sempre com o nome inteiro. Manter o corpo do
    documento com "RCM" enquanto o anexo diz "Raphael de Castro Miranda" seria
    incoerente dentro de uma mesma peça. A forma pública segue valendo onde ela
    existe para valer: ranking e perfil público.
  */
  const studentName = profile?.display_name ?? '';

  /*
    Todas as especialidades do currículo, não uma lista fixa: quando uma trilha
    nova entrar em `src/curriculum`, ela aparece aqui sozinha.
  */
  const todas = useMemo(() => {
    if (!profile || loading) return [];
    /* Só as trilhas abertas: uma especialidade anunciada e ainda não
       iniciável não tem o que relatar, e apareceria como caixa cinza
       inexplicável no seletor. */
    return getOpenSpecialties().map(s =>
      buildSpecialtyNarrative(s, progress, certifications, studentName, evidence)
    );
  }, [profile, progress, certifications, loading, studentName, evidence]);

  const iniciadas = useMemo(() => todas.filter(n => n.started).map(n => n.code), [todas]);

  /*
    `null` enquanto o progresso ainda não chegou — sem isso a seleção nasceria
    vazia e sobrescreveria o padrão assim que os dados carregassem.
  */
  const [escolhidas, setEscolhidas] = useState<string[] | null>(null);
  useEffect(() => {
    if (escolhidas === null && iniciadas.length > 0) setEscolhidas(iniciadas);
  }, [iniciadas, escolhidas]);

  const selecao = escolhidas ?? iniciadas;
  const narratives = useMemo(() => todas.filter(n => selecao.includes(n.code)), [todas, selecao]);

  const { attemptsCount, averageScore } = useMemo(() => {
    const n = lessonAttempts.length;
    return {
      attemptsCount: n,
      averageScore: n === 0 ? 0 : Math.round(
        lessonAttempts.reduce((sum, a) => sum + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / n
      ),
    };
  }, [lessonAttempts]);

  const closing = useMemo(
    () => (narratives.length === 0 ? '' : buildClosingParagraph(narratives, studentName, attemptsCount, averageScore)),
    [narratives, studentName, attemptsCount, averageScore]);

  const alternar = (code: string) =>
    setEscolhidas(atual => {
      const base = atual ?? iniciadas;
      return base.includes(code) ? base.filter(c => c !== code) : [...base, code];
    });

  if (!profile) return null;
  if (loading) return <LoadingState label="Montando relatório..." />;

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const attachedCerts = narratives.map(n => n.certificate).filter(c => !!c);

  /* "A", "A e B", "A, B e C" — o relatório cobre um conjunto escolhido, e a
     enumeração precisa crescer sem virar uma lista com vírgula solta no fim. */
  const enumerar = (itens: string[]) =>
    itens.length <= 1 ? (itens[0] ?? '')
      : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;

  const nomeExtenso = enumerar(narratives.map(n => nomeCompleto(n)));
  const subtitle = `Trilha.Web() — ${narratives.length === 1 ? 'Especialidade' : 'Especialidades'} ${nomeExtenso}`;

  const intro = `Este documento descreve, em linguagem corrente, as competências efetivamente demonstradas por ${studentName} ao longo da Trilha.Web(), plataforma de estudo autônomo de especialidades do Clube de Desbravadores. Abrange ${narratives.length === 1 ? 'a especialidade' : 'as especialidades'} ${nomeExtenso}. Destina-se à apresentação à liderança do Clube, para subsidiar o reconhecimento e o registro ${narratives.length === 1 ? 'da especialidade' : 'das especialidades'} pelos canais oficiais do clube.`;

  const badgeIntro = buildBadgeParagraph(badges, studentName);

  /* Bônus, e por isso fora de toda a contabilidade acima: nada aqui entra em
     percentual de trilha, em requisito nem em nota. */
  const veredasFeitas = veredasAbertas()
    .filter(v => andamento.find(a => a.id === v.id)?.concluida);

  const annexNote = attachedCerts.length === 0 ? undefined
    : attachedCerts.length === 1
      ? 'Segue anexo o certificado Token.Web() referente à trilha concluída.'
      : `Seguem anexos os ${attachedCerts.length} certificados Token.Web() referentes às trilhas concluídas.`;

  const handleDownload = async () => {
    setExporting(true);
    setExportError('');
    try {
      const sections: ReportSection[] = [
        ...narratives.map(n => ({
          heading: nomeCompleto(n),
          paragraphs: [
            n.opening,
            ...n.modules.flatMap(m => [m.paragraph, ...m.requirements]),
            ...(n.pending ? [n.pending] : []),
            ...(n.certification ? [n.certification] : []),
            /* O texto vai inteiro, e no PDF também: um relatório que prova o
               cumprimento na tela e não prova no papel não serve ao clube, que
               é quem recebe o papel. */
            ...(textos[n.code] ? ['Relatório escrito pelo desbravador:', textos[n.code]] : []),
          ],
        })),
        { heading: 'Considerações finais', paragraphs: [closing] },
      ];

      await exportReportPdf({
        studentName,
        club: profile.club || '',
        unit: profile.unit || '',
        issuedOn: today,
        subtitle,
        intro,
        sections,
        badgeIntro,
        badges,
        annexNote,
        certificates: attachedCerts as NonNullable<typeof attachedCerts[number]>[],
      });
    } catch (err) {
      setExportError((err as Error).message || 'Não foi possível gerar o PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button onClick={handleDownload} disabled={exporting || narratives.length === 0} className="btn-primary">
          {exporting
            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Gerando PDF...</>
            : <><Download className="w-4 h-4 mr-1" /> Baixar PDF</>}
        </button>
      </div>

      {exportError && (
        <div className="card p-3 text-sm" style={{ color: 'var(--color-error)' }}>{exportError}</div>
      )}

      {/* A escolha do que entra no documento. A lista vem do currículo, então
          uma trilha nova aparece aqui sem que esta tela precise saber dela. */}
      <div className="card p-4 no-print">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
          Especialidades neste relatório
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-dim)' }}>
          Marque as trilhas que devem ser descritas. O documento se ajusta ao que você escolher.
        </p>
        <div className="flex flex-wrap gap-2">
          {todas.map(n => {
            const marcada = selecao.includes(n.code);
            return (
              <label
                key={n.code}
                title={n.started ? undefined : 'Você ainda não iniciou esta trilha'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${n.started ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{
                  backgroundColor: marcada ? 'var(--color-primary-a08)' : 'var(--color-bg-input)',
                  border: `1px solid ${marcada ? 'var(--color-primary-a30)' : 'var(--color-border)'}`,
                  opacity: n.started ? 1 : 0.45,
                }}
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  disabled={!n.started}
                  onChange={() => alternar(n.code)}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text)' }}>{n.code}</span>
                <span style={{ color: 'var(--color-text-dim)' }}>{n.name}</span>
                {!n.started && (
                  <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>· não iniciada</span>
                )}
              </label>
            );
          })}
        </div>
        {narratives.length === 0 && (
          <p className="text-xs mt-3" style={{ color: 'var(--color-secondary)' }}>
            {iniciadas.length === 0
              ? 'Conclua ao menos uma atividade para que haja o que relatar.'
              : 'Marque ao menos uma especialidade para montar o relatório.'}
          </p>
        )}
      </div>

      {narratives.length > 0 && (
      <article className="report-doc card">
        <header className="report-head">
          <h1>Relatório de Competências</h1>
          <p className="report-sub">
            {subtitle}
          </p>
        </header>

        <section className="report-id">
          <p><strong>Desbravador(a):</strong> {studentName}</p>
          <p><strong>Clube:</strong> {profile.club || '—'}</p>
          <p><strong>Unidade:</strong> {profile.unit || '—'}</p>
          <p><strong>Emitido em:</strong> {today}</p>
        </section>

        <section className="report-body">
          <p>{intro}</p>

          {narratives.map(n => (
            <div key={n.code} className="report-section">
              <h2>{nomeCompleto(n)}</h2>
              <p>{n.opening}</p>
              {n.modules.map(m => (
                <div key={m.title}>
                  <p>{m.paragraph}</p>
                  {m.requirements.map((sentence, i) => (
                    <p key={i} className="report-req">{sentence}</p>
                  ))}
                </div>
              ))}
              {n.pending && <p>{n.pending}</p>}
              {n.certification && <p>{n.certification}</p>}
              {textos[n.code] && (
                <div className="report-texto">
                  <h3>Relatório escrito pelo desbravador</h3>
                  <p className="report-texto-corpo">{textos[n.code]}</p>
                </div>
              )}
            </div>
          ))}

          {/*
            As veredas entram antes das Conquistas e depois das trilhas, porque
            é isso que elas são na ordem das coisas: não é requisito cumprido, e
            não é insígnia — é um percurso a mais que o desbravador fez por
            conta, e o relatório de aprendizagem existe para dizer o que a
            pessoa fez.
          */}
          {veredasFeitas.length > 0 && (
            <div className="report-section">
              <h2>Veredas concluídas</h2>
              <p>
                {veredasFeitas.length === 1
                  ? 'Além do currículo das especialidades, percorreu por conta própria uma vereda — percurso curto, com teoria e laboratório, sem requisito oficial e sem nota, que existe para dar conta de um assunto que aparece na prática.'
                  : `Além do currículo das especialidades, percorreu por conta própria ${veredasFeitas.length} veredas — percursos curtos, com teoria e laboratório, sem requisito oficial e sem nota, que existem para dar conta de assuntos que aparecem na prática.`}
              </p>
              {veredasFeitas.map(v => (
                <p key={v.id} className="report-req">
                  <strong>{v.name}</strong> ({v.code}) — {v.description}
                  {v.origem && ` Nasceu da trilha ${v.origem}.`}
                </p>
              ))}
            </div>
          )}

          {badges.length > 0 && (
            <div className="report-section">
              <h2>Conquistas</h2>
              <p>{badgeIntro}</p>
              <ul className="report-badges">
                {badges.map(b => (
                  <li key={b.id}>
                    <BadgeIcon badge={b} size="sm" />
                    <div>
                      <strong>{b.name}</strong>
                      <span> — {b.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="report-section">
            <h2>Considerações finais</h2>
            <p>{closing}</p>
          </div>
        </section>

        {attachedCerts.length > 0 && (
          <p className="report-annex-note">
            {attachedCerts.length === 1
              ? 'Segue anexo o certificado Token.Web() referente à trilha concluída.'
              : `Seguem anexos os ${attachedCerts.length} certificados Token.Web() referentes às trilhas concluídas.`}
          </p>
        )}
      </article>
      )}

      {attachedCerts.map(cert => (
        <div key={cert!.id} className="cert-page">
          <CertificateCanvas cert={cert!} studentName={studentName} />
        </div>
      ))}
    </div>
  );
}
