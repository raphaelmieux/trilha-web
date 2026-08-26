import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicName } from '../types';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  parseAddress, assessAddress, analyzeQuery, buildSearchUrl, assessDownload,
  type RiskLevel,
} from '../lib/webSkills';
import {
  parseReference, countDistinctReferences, countDistinctVersions, BIBLE_VERSIONS,
} from '../lib/bibleStudy';
import { exportStudySheetPdf } from '../lib/pdf';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import LinkExterno from '../components/ui/LinkExterno';
import {
  Globe, Link2, ShieldCheck, Search, FileDown, CheckCircle2, AlertCircle,
  ExternalLink, Lock, Unlock, Download, RotateCcw, Compass, BookOpen,
} from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/**
 * WebLab — requirements AP034-6.1, 6.2 and 6.3: visit three sites, find three
 * Bible passages in three versions, download a file.
 *
 * Those were one collapsed requirement and the lab simulated all of it: five
 * buttons set a string, the search returned a hard-coded list keyed on the word
 * "bíblia", and the download appended a filename to an array. A student could
 * finish it without reading an address.
 *
 * Here the address bar runs the browser's own URL parser, the phishing verdicts
 * come from stated rules in src/lib/webSkills.ts, the query is tokenised the way
 * a search engine tokenises it and then opened for real, and the download is a
 * PDF of the student's own findings — generated, not pretended.
 */

interface Check { id: string; label: string; passed: boolean; hint: string }

const SUBJECT = 'Filipenses 4:8 — "tudo o que é verdadeiro"';

/** Addresses to judge. The verdicts are computed, never stored alongside them. */
const SUSPECTS = [
  'https://www.bibliaonline.com.br/acf/fp/4',
  'http://login.meuclube-desbravadores.com/entrar',
  'https://bancodobrasil.acesso-cliente.net/login',
  'https://pt.wikipedia.org/wiki/Bíblia',
  'https://192.168.0.15/webmail',
  'https://nubank-atualizacao.com/seguranca',
];

const FILES = [
  'estudo-filipenses-4.pdf',
  'foto-do-acampamento.jpg',
  'biblia-completa.pdf.exe',
  'hinario-adventista.zip',
  'leitor-de-biblia-gratis.exe',
];

const RISK_ANSWERS: { level: RiskLevel; label: string }[] = [
  { level: 'seguro', label: 'Baixo tranquilo' },
  { level: 'atencao', label: 'Baixo com cuidado' },
  { level: 'perigoso', label: 'Não baixo' },
];

/*
  Tudo o que o desbravador digita neste laboratório.

  O WebLab nunca leu nada do servidor: o estado morava só na tela, e qualquer
  recarga apagava horas de trabalho. No celular isso deixou de ser hipótese —
  abrir um dos sites do requisito 3 trocava a página, e voltar significava
  recomeçar do zero.
*/
interface RascunhoWebLab {
  typed: string;
  judged: Record<string, boolean>;
  firstJudged: Record<string, boolean>;
  visits: { url: string; note: string }[];
  opened: Record<number, boolean>;
  query: string;
  searchOpened: boolean;
  bibleSite: string;
  passages: { reference: string; version: string; text: string }[];
  fileJudged: Record<string, RiskLevel>;
  fileFirstJudged: Record<string, RiskLevel>;
  sheetSaved: boolean;
}

export default function WebLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  /* Lido uma vez, na montagem: cada useState abaixo começa do que estava
     guardado. Restaurar por efeito faria a tela piscar vazia antes, e o
     primeiro estado vazio sobrescreveria o rascunho bom. */
  const guardado = useRef(lerRascunho<RascunhoWebLab>(userId, lessonCode)?.conteudo).current;

  const { profile } = useAuth();
  const studentName = profile ? getPublicName(profile) : 'Desbravador(a)';

  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── 1. Anatomia do endereço ────────────────────────────────────────────── */
  const [typed, setTyped] = useState(guardado?.typed ?? '');
  const address = useMemo(() => parseAddress(typed), [typed]);

  // What the student typed as the host, before the parser touched it. A mismatch
  // means the name was rewritten — the tell for a lookalike written in another
  // alphabet, which the browser silently converts to punycode.
  const typedHost = useMemo(() => {
    const match = /^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i.exec(typed.trim());
    if (!match) return '';
    return (match[1].split('@').pop() ?? '').replace(/:\d+$/, '').replace(/\.$/, '').toLowerCase();
  }, [typed]);

  const addressChecks: Check[] = [
    {
      id: 'end-valido', label: 'O endereço é válido e começa pelo protocolo',
      passed: address.valid,
      hint: address.error ?? 'Um endereço completo começa por https:// — sem isso o navegador não sabe como falar com o site.',
    },
    {
      id: 'end-https', label: 'Usa https, a versão com cadeado',
      passed: address.valid && address.secure,
      hint: 'Troque http:// por https://. O "s" é de seguro: sem ele tudo trafega em texto aberto.',
    },
    {
      id: 'end-caminho', label: 'Aponta para uma página, não só para a porta de entrada',
      passed: address.valid && address.path.replace(/\/+$/, '').length > 0,
      hint: 'Acrescente um caminho depois do nome do site, por exemplo /acf/fp/4 — é ele que diz qual página abrir.',
    },
    {
      id: 'end-consulta', label: 'Leva uma consulta depois do ponto de interrogação',
      passed: address.valid && address.query.length > 0,
      hint: 'Acrescente algo como ?versiculo=8. Depois do "?" vêm os dados que a página recebe.',
    },
  ];

  /* ── 2. Cadeado e impostores ────────────────────────────────────────────── */
  /**
   * Two records on purpose. `judged` is what the student currently thinks, and
   * they may change it as often as they like — the explanation appears on every
   * answer, so changing it is how the learning happens. `firstJudged` keeps the
   * answer they gave *before* reading that explanation, and that is what counts.
   * Without it the check would only measure whether the student can read the
   * answer off the screen and click again.
   */
  const [judged, setJudged] = useState<Record<string, boolean>>(guardado?.judged ?? {});
  const [firstJudged, setFirstJudged] = useState<Record<string, boolean>>(guardado?.firstJudged ?? {});

  const judge = (url: string, answer: boolean) => {
    setJudged(p => ({ ...p, [url]: answer }));
    setFirstJudged(p => (url in p ? p : { ...p, [url]: answer }));
  };

  const suspectVerdicts = useMemo(
    () => Object.fromEntries(SUSPECTS.map(u => [u, assessAddress(u)])),
    [],
  );
  const suspectFirstCorrect = SUSPECTS.filter(
    u => firstJudged[u] !== undefined && firstJudged[u] === (suspectVerdicts[u].level === 'seguro'),
  ).length;
  const SUSPECT_PASS_MARK = 4;

  const safetyChecks: Check[] = [
    {
      id: 'seg-todos', label: `Os ${SUSPECTS.length} endereços foram classificados`,
      passed: SUSPECTS.every(u => judged[u] !== undefined),
      hint: 'Decida, para cada endereço, se você digitaria uma senha nele.',
    },
    {
      id: 'seg-acertos', label: `Acertou ao menos ${SUSPECT_PASS_MARK} de ${SUSPECTS.length} de primeira`,
      passed: suspectFirstCorrect >= SUSPECT_PASS_MARK,
      hint: `${suspectFirstCorrect} de ${SUSPECTS.length} na primeira resposta. Vale a primeira, não a corrigida — leia as explicações e use "Recomeçar esta etapa" para tentar de novo.`,
    },
  ];

  /* ── 3. Três sites visitados (AP034-6.1) ────────────────────────────────
     "Visitar três sites diferentes e mostrar a primeira página de cada site
     para o seu instrutor." A conferência é presencial no documento; aqui o
     desbravador registra a evidência e ela sai no relatório impresso, que é
     o que o instrutor lê. */
  const [visits, setVisits] = useState(guardado?.visits ?? [
    { url: '', note: '' }, { url: '', note: '' }, { url: '', note: '' },
  ]);
  const [opened, setOpened] = useState<Record<number, boolean>>(guardado?.opened ?? {});

  const setVisit = (index: number, patch: Partial<{ url: string; note: string }>) =>
    setVisits(prev => prev.map((v, i) => i === index ? { ...v, ...patch } : v));

  const visitAddresses = visits.map(v => parseAddress(v.url));
  const validVisits = visitAddresses.filter(a => a.valid).length;
  // Three pages of one site are not three sites: compare the registrable domain.
  const distinctSites = new Set(
    visitAddresses.filter(a => a.valid).map(a => `${a.domain}.${a.tld}`),
  ).size;
  const describedVisits = visits.filter(v => v.note.trim().length >= 30).length;
  const openedCount = Object.values(opened).filter(Boolean).length;

  const visitChecks: Check[] = [
    {
      id: 'sites-validos', label: 'Três endereços completos e válidos',
      passed: validVisits >= 3,
      hint: `${validVisits} de 3 válidos. Cole o endereço inteiro, começando por https://.`,
    },
    {
      id: 'sites-distintos', label: 'Três sites diferentes, não três páginas do mesmo',
      passed: distinctSites >= 3,
      hint: `${distinctSites} ${distinctSites === 1 ? 'site distinto' : 'sites distintos'}. O que conta é o nome antes do domínio de topo.`,
    },
    {
      id: 'sites-abertos', label: 'Os três foram abertos de verdade',
      passed: openedCount >= 3,
      hint: `${openedCount} de 3 abertos. Use o botão de cada linha.`,
    },
    {
      id: 'sites-descritos', label: 'A primeira página de cada um foi descrita',
      passed: describedVisits >= 3,
      hint: `${describedVisits} de 3 descritos. Escreva o que aparece na primeira página — é isso que o instrutor vai conferir.`,
    },
  ];

  /* ── 3. Pesquisa ────────────────────────────────────────────────────────── */
  const [query, setQuery] = useState(guardado?.query ?? '');
  const parsedQuery = useMemo(() => analyzeQuery(query), [query]);
  const [searchOpened, setSearchOpened] = useState(guardado?.searchOpened ?? false);
  const searchUrl = buildSearchUrl(query);

  const queryChecks: Check[] = [
    {
      id: 'q-frase', label: 'Tem uma expressão exata entre aspas',
      passed: parsedQuery.phrases.length > 0,
      hint: 'Ponha entre aspas as palavras que devem aparecer juntas e nessa ordem, por exemplo "tudo o que é verdadeiro".',
    },
    {
      id: 'q-site', label: 'Restringe a busca a um site com site:',
      passed: parsedQuery.sites.length > 0,
      hint: 'Acrescente site:bibliaonline.com.br para procurar só dentro daquele site.',
    },
    {
      id: 'q-excluir', label: 'Descarta um termo indesejado com o sinal de menos',
      passed: parsedQuery.exclusions.length > 0,
      hint: 'Acrescente -venda para tirar dos resultados as páginas que tentam vender alguma coisa.',
    },
    {
      id: 'q-abriu', label: 'A pesquisa foi aberta de verdade',
      passed: searchOpened,
      hint: 'Clique em "Pesquisar agora". A busca abre numa aba nova, com o filtro de conteúdo do buscador ligado.',
    },
  ];

  /* ── Pesquisa bíblica (AP034-6.2) ───────────────────────────────────────
     "Ir ao site, procurar pelo menos três diferentes textos da Bíblia em três
     versões diferentes." Três *diferentes* nos dois eixos, e nenhum dos dois
     pode ser conferido contando caixas: "Fp 4:8" e "Filipenses 4:8" são o mesmo
     versículo, e "NVI" e "nvi" são a mesma versão. Ambos são comparados depois
     de interpretados, em src/lib/bibleStudy.ts. */
  const [bibleSite, setBibleSite] = useState(guardado?.bibleSite ?? '');
  const [passages, setPassages] = useState(guardado?.passages ?? [
    { reference: '', version: '', text: '' },
    { reference: '', version: '', text: '' },
    { reference: '', version: '', text: '' },
  ]);

  const setPassage = (index: number, patch: Partial<{ reference: string; version: string; text: string }>) =>
    setPassages(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));

  const bibleSiteAddress = parseAddress(bibleSite);
  const distinctPassages = countDistinctReferences(passages.map(p => p.reference));
  const distinctVersions = countDistinctVersions(passages.map(p => p.version));
  const transcribed = passages.filter(p => p.text.trim().length >= 20).length;

  const bibleChecks: Check[] = [
    {
      id: 'biblia-site', label: 'O site de Bíblia encontrado foi registrado',
      passed: bibleSiteAddress.valid,
      hint: bibleSiteAddress.error ?? 'Cole o endereço do site de Bíblia que a busca encontrou.',
    },
    {
      id: 'biblia-tres', label: 'Três textos bíblicos diferentes',
      passed: distinctPassages >= 3,
      hint: `${distinctPassages} de 3 reconhecidos. Escreva a referência no formato Livro capítulo:versículo — e repare que "Fp 4:8" e "Filipenses 4:8" são o mesmo texto.`,
    },
    {
      id: 'biblia-versoes', label: 'Três versões diferentes',
      passed: distinctVersions >= 3,
      hint: `${distinctVersions} de 3 escolhidas. O requisito pede o mesmo trabalho em três traduções distintas.`,
    },
    {
      id: 'biblia-texto', label: 'O texto encontrado foi transcrito nos três',
      passed: transcribed >= 3,
      hint: `${transcribed} de 3 transcritos. Copie o versículo como ele aparece no site — é o que o instrutor confere.`,
    },
  ];

  /* ── 4. Downloads ───────────────────────────────────────────────────────── */
  /**
   * Three answers, not two. A .zip of hymns from the club's own site is neither
   * safe nor an attack — it is a package whose contents are unknown until it is
   * opened. Forcing that into "would download / would not" would teach a rule
   * that is wrong half the time.
   */
  const [fileJudged, setFileJudged] = useState<Record<string, RiskLevel>>(guardado?.fileJudged ?? {});
  const [fileFirstJudged, setFileFirstJudged] = useState<Record<string, RiskLevel>>(guardado?.fileFirstJudged ?? {});

  const judgeFile = (name: string, answer: RiskLevel) => {
    setFileJudged(p => ({ ...p, [name]: answer }));
    setFileFirstJudged(p => (name in p ? p : { ...p, [name]: answer }));
  };

  const fileVerdicts = useMemo(
    () => Object.fromEntries(FILES.map(f => [f, assessDownload(f)])),
    [],
  );
  const filesFirstCorrect = FILES.filter(
    f => fileFirstJudged[f] !== undefined && fileFirstJudged[f] === fileVerdicts[f].level,
  ).length;
  const FILE_PASS_MARK = 4;
  const [sheetSaved, setSheetSaved] = useState(guardado?.sheetSaved ?? false);

  const downloadChecks: Check[] = [
    {
      id: 'dl-todos', label: `Os ${FILES.length} arquivos foram avaliados`,
      passed: FILES.every(f => fileJudged[f] !== undefined),
      hint: 'Decida, para cada arquivo, se você o baixaria.',
    },
    {
      id: 'dl-acertos', label: `Acertou ao menos ${FILE_PASS_MARK} de ${FILES.length} de primeira`,
      passed: filesFirstCorrect >= FILE_PASS_MARK,
      hint: `${filesFirstCorrect} de ${FILES.length} na primeira resposta. Olhe sempre a última extensão do nome — é ela que manda.`,
    },
    {
      id: 'dl-ficha', label: 'Baixou a ficha de pesquisa em PDF',
      passed: sheetSaved,
      hint: 'A ficha reúne a consulta que você montou e a sua análise dos endereços e dos arquivos.',
    },
  ];

  const allChecks = [
    ...addressChecks, ...safetyChecks, ...visitChecks,
    ...queryChecks, ...bibleChecks, ...downloadChecks,
  ];
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  /* A rede embaixo do laboratório: grava no navegador a cada pausa, e some
     quando a lição é concluída — daí em diante quem guarda é o servidor. */
  useRascunhoLocal(
    userId, lessonCode,
    useMemo(() => ({
      typed, judged, firstJudged, visits, opened, query, searchOpened,
      bibleSite, passages, fileJudged, fileFirstJudged, sheetSaved,
    }), [typed, judged, firstJudged, visits, opened, query, searchOpened,
         bibleSite, passages, fileJudged, fileFirstJudged, sheetSaved]),
    !completed,
  );

  const downloadSheet = () => {
    exportStudySheetPdf({
      studentName,
      subject: SUBJECT,
      query,
      searchUrl,
      visits: visits.map(v => ({ url: v.url.trim(), note: v.note.trim() })),
      bibleSite: bibleSite.trim(),
      passages: passages.map(p => ({
        reference: p.reference.trim(), version: p.version, text: p.text.trim(),
      })),
      addresses: SUSPECTS.map(u => ({
        url: u,
        verdict: suspectVerdicts[u].findings.map(f => f.message).join(' '),
      })),
      downloads: FILES.map(f => ({ name: f, verdict: fileVerdicts[f].message })),
    });
    setSheetSaved(true);
  };

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1,
        correct_count: suspectFirstCorrect + filesFirstCorrect,
        total_questions: SUSPECTS.length + FILES.length,
      });
    }
    /* The evidence goes into the event, not just the tick.
       Requirements 6.1 and 6.2 are demonstrations the sheet asks the instructor
       to see; this club runs them by recorded evidence, so the report has to be
       able to state what was visited and what was found. */
    await logActivity(userId, 'web_lab_completed', { specialtyCode, lessonCode,
      checksPassed: passedCount, total: allChecks.length,
      enderecosDePrimeira: suspectFirstCorrect, arquivosDePrimeira: filesFirstCorrect,
      visits: visits.map(v => ({ url: v.url.trim(), note: v.note.trim() })),
      bibleSite: bibleSite.trim(),
      passages: passages.map(p => ({
        reference: p.reference.trim(), version: p.version, text: p.text.trim(),
      })),
    });
    setCompleted(true);
    descartarRascunho(userId, lessonCode);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você leu um endereço peça por peça, separou sites legítimos de imitações,
          montou uma consulta com operadores e a executou de verdade, e levou embora
          uma ficha em PDF com a sua própria análise.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {lessonTitle}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Quatro habilidades de quem usa a internet com autonomia: ler um endereço,
          reconhecer uma imitação, pesquisar com precisão e decidir o que vale a pena
          baixar. Os endereços são analisados pelo mesmo interpretador que o navegador
          usa — o que aparece aqui é o que acontece de verdade.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {allChecks.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>verificações atendidas</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir WebLab'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(passedCount / allChecks.length) * 100}%`,
              background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      {/* ── Etapa 1 ── */}
      <StageCard title="1. Anatomia de um endereço" icon={Link2} checks={addressChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Um endereço não é um nome só: tem protocolo, nome do site, caminho e consulta.
          Monte um endereço que use as quatro partes — por exemplo, a página do capítulo 4
          de Filipenses num site de Bíblia — e veja como o navegador o separa.
        </p>

        <div className="rounded-lg p-2 flex items-center gap-2 mb-3" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
          {address.valid && address.secure
            ? <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
            : <Unlock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-faint)' }} />}
          <input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="https://site.com.br/caminho?chave=valor"
            className="flex-1 bg-transparent text-sm font-mono outline-none"
            style={{ color: 'var(--color-text)' }}
            aria-label="Barra de endereço"
            spellCheck={false}
          />
        </div>

        {address.valid ? (
          <>
            <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <Part label="Protocolo" value={`${address.scheme}://`} note={address.secure ? 'criptografado' : 'sem criptografia'} />
              <Part label="Subdomínio" value={address.subdomain || '—'} note="a parte antes do nome do site" />
              <Part label="Nome do site" value={address.domain} note="é este que identifica quem é o dono" />
              <Part label="Domínio de topo" value={address.tld || '—'} note=".com.br, .org, .gov.br…" />
              <Part label="Caminho" value={address.path} note="qual página, dentro do site" />
              <Part
                label="Consulta"
                value={address.query.length ? address.query.map(([k, v]) => `${k} = ${v}`).join(' · ') : '—'}
                note="dados enviados para a página"
              />
            </dl>
            {typedHost !== '' && typedHost !== address.hostname && (
              <p className="text-xs mt-3 p-2 rounded" style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-warning)' }}>
                Atenção: o navegador entendeu o nome como <strong>{address.hostname}</strong>,
                diferente do que você digitou. É assim que endereços escritos com letras de
                outro alfabeto se disfarçam.
              </p>
            )}
          </>
        ) : (
          typed.trim() && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{address.error}</p>
          )
        )}
      </StageCard>

      {/* ── Etapa 2 ── */}
      <StageCard title="2. Onde você digitaria uma senha?" icon={ShieldCheck} checks={safetyChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Todos os endereços abaixo chegariam por e-mail sem levantar suspeita, e nem todos
          são o que parecem. Para cada um, decida: você digitaria a sua senha aí? A
          explicação aparece depois de responder — e o que conta para a verificação é a
          sua primeira resposta, antes de ler a explicação.
        </p>

        {Object.keys(firstJudged).length > 0 && suspectFirstCorrect < SUSPECT_PASS_MARK && (
          <button
            onClick={() => { setJudged({}); setFirstJudged({}); }}
            className="btn-secondary text-xs mb-3"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar esta etapa
          </button>
        )}

        <ul className="space-y-2">
          {SUSPECTS.map(url => {
            const verdict = suspectVerdicts[url];
            const answer = judged[url];
            const truth = verdict.level === 'seguro';
            const answered = answer !== undefined;
            const right = answered && answer === truth;
            return (
              <li
                key={url}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: !answered ? 'var(--color-bg-input)'
                    : right ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
                  border: `1px solid ${!answered ? 'var(--color-border)' : right ? 'var(--color-success-a20)' : 'var(--color-error-a20)'}`,
                }}
              >
                <p className="font-mono text-xs break-all mb-2" style={{ color: 'var(--color-text)' }}>{url}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => judge(url, true)}
                    className={answer === true ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
                  >
                    Digitaria a senha
                  </button>
                  <button
                    onClick={() => judge(url, false)}
                    className={answer === false ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
                  >
                    Não digitaria
                  </button>
                </div>
                {answered && (
                  <div className="mt-2 text-xs space-y-1">
                    <p className="font-bold" style={{ color: right ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {right ? 'Correto.' : 'Não é isso.'}
                    </p>
                    {verdict.findings.map(f => (
                      <p key={f.code} style={{ color: 'var(--color-text-soft)' }}>{f.message}</p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </StageCard>

      {/* ── Etapa 3 ── */}
      <StageCard title="3. Visitar três sites" icon={Compass} checks={visitChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          O requisito pede três sites diferentes e a primeira página de cada um mostrada ao
          instrutor. Abra cada um, olhe o que aparece e escreva aqui — o que você registrar
          entra no relatório impresso, e é por ele que a conferência acontece.
        </p>

        <ul className="space-y-3">
          {visits.map((visit, i) => {
            const parsed = visitAddresses[i];
            return (
              <li key={i} className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Site {i + 1}</p>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <input
                    value={visit.url}
                    onChange={e => setVisit(i, { url: e.target.value })}
                    placeholder="https://www.exemplo.com.br"
                    className="input-field font-mono text-sm flex-1"
                    aria-label={`Endereço do site ${i + 1}`}
                    spellCheck={false}
                  />
                  <LinkExterno
                    href={visit.url}
                    disabled={!parsed.valid}
                    onOpen={() => setOpened(p => ({ ...p, [i]: true }))}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {opened[i] ? 'Abrir de novo' : 'Abrir'}
                  </LinkExterno>
                </div>
                {parsed.valid ? (
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-dim)' }}>
                    Site: <strong style={{ color: 'var(--color-text-soft)' }}>{parsed.domain}.{parsed.tld}</strong>
                    {' · '}{parsed.secure ? 'https' : 'sem https'}
                  </p>
                ) : visit.url.trim() && (
                  <p className="text-xs mb-2" style={{ color: 'var(--color-error)' }}>{parsed.error}</p>
                )}
                <textarea
                  value={visit.note}
                  onChange={e => setVisit(i, { note: e.target.value })}
                  rows={2}
                  className="input-field text-sm"
                  placeholder="O que aparece na primeira página deste site?"
                  aria-label={`Primeira página do site ${i + 1}`}
                />
              </li>
            );
          })}
        </ul>
      </StageCard>

      {/* ── Etapa 4 ── */}
      <StageCard title="4. Pesquisar com precisão" icon={Search} checks={queryChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Tema da pesquisa: <strong style={{ color: 'var(--color-text)' }}>{SUBJECT}</strong>.
          Digitar as palavras soltas devolve milhares de páginas. Três operadores mudam isso:
          aspas prendem uma expressão, <code>site:</code> limita a um site e o sinal de menos
          descarta o que atrapalha.
        </p>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='"expressão exata" palavra site:dominio.com.br -indesejado'
          className="input-field font-mono text-sm mb-3"
          aria-label="Consulta de pesquisa"
          spellCheck={false}
        />

        <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
          <Token label="Expressão exata" items={parsedQuery.phrases} />
          <Token label="Restrito ao site" items={parsedQuery.sites} />
          <Token label="Descartado" items={parsedQuery.exclusions} />
          <Token label="Palavras soltas" items={parsedQuery.terms} />
        </div>

        <LinkExterno
          href={searchUrl}
          disabled={!query.trim()}
          onOpen={() => setSearchOpened(true)}
          className="btn-primary w-full"
        >
          <ExternalLink className="w-4 h-4 mr-1" /> Pesquisar agora
        </LinkExterno>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
          Abre em uma aba nova, num buscador que não guarda histórico e com o filtro de
          conteúdo adulto ligado.
        </p>
      </StageCard>

      {/* ── Etapa 5 ── */}
      <StageCard title="5. Três textos em três versões" icon={BookOpen} checks={bibleChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Use a busca da etapa anterior para chegar a uma Bíblia on-line. Lá, procure três
          textos <strong style={{ color: 'var(--color-text)' }}>diferentes</strong>, cada um
          em uma <strong style={{ color: 'var(--color-text)' }}>versão diferente</strong>, e
          transcreva o que encontrou.
        </p>

        <label className="block mb-4">
          <span className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Endereço do site de Bíblia que você encontrou
          </span>
          <input
            value={bibleSite}
            onChange={e => setBibleSite(e.target.value)}
            placeholder="https://www.bibliaonline.com.br"
            className="input-field font-mono text-sm"
            aria-label="Site de Bíblia"
            spellCheck={false}
          />
        </label>

        <ul className="space-y-3">
          {passages.map((passage, i) => {
            const reference = parseReference(passage.reference);
            return (
              <li key={i} className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Texto {i + 1}</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <input
                    value={passage.reference}
                    onChange={e => setPassage(i, { reference: e.target.value })}
                    placeholder="Ex.: Filipenses 4:8"
                    className="input-field text-sm"
                    aria-label={`Referência do texto ${i + 1}`}
                  />
                  <select
                    value={passage.version}
                    onChange={e => setPassage(i, { version: e.target.value })}
                    className="input-field text-sm"
                    aria-label={`Versão do texto ${i + 1}`}
                  >
                    <option value="">Escolha a versão…</option>
                    {BIBLE_VERSIONS.map(v => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
                {passage.reference.trim() && (
                  <p className="text-xs mb-2" style={{ color: reference ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {reference
                      ? `Reconhecido: ${reference.canonical} ${reference.chapter}:${reference.verse}`
                      : 'Não reconheci esta referência. Use o formato Livro capítulo:versículo.'}
                  </p>
                )}
                <textarea
                  value={passage.text}
                  onChange={e => setPassage(i, { text: e.target.value })}
                  rows={2}
                  className="input-field text-sm"
                  placeholder="Transcreva o texto como aparece no site."
                  aria-label={`Texto encontrado ${i + 1}`}
                />
              </li>
            );
          })}
        </ul>
      </StageCard>

      {/* ── Etapa 6 ── */}
      <StageCard title="6. O que vale a pena baixar" icon={FileDown} checks={downloadChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          A pesquisa levou a uma página com estes arquivos. Um arquivo de conteúdo abre num
          leitor; um programa roda no seu computador e pode fazer o que quiser lá dentro; e
          um pacote só revela o que tem depois de aberto. Classifique cada um nos três níveis.
        </p>

        {Object.keys(fileFirstJudged).length > 0 && filesFirstCorrect < FILE_PASS_MARK && (
          <button
            onClick={() => { setFileJudged({}); setFileFirstJudged({}); }}
            className="btn-secondary text-xs mb-3"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar esta etapa
          </button>
        )}

        <ul className="space-y-2 mb-4">
          {FILES.map(name => {
            const verdict = fileVerdicts[name];
            const answer = fileJudged[name];
            const answered = answer !== undefined;
            const right = answered && answer === verdict.level;
            return (
              <li
                key={name}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: !answered ? 'var(--color-bg-input)'
                    : right ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
                  border: `1px solid ${!answered ? 'var(--color-border)' : right ? 'var(--color-success-a20)' : 'var(--color-error-a20)'}`,
                }}
              >
                <p className="font-mono text-sm break-all mb-2" style={{ color: 'var(--color-text)' }}>{name}</p>
                <div className="flex gap-2 flex-wrap">
                  {RISK_ANSWERS.map(option => (
                    <button
                      key={option.level}
                      onClick={() => judgeFile(name, option.level)}
                      className={answer === option.level ? 'btn-primary text-xs' : 'btn-secondary text-xs'}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {answered && (
                  <div className="mt-2 text-xs">
                    <p className="font-bold" style={{ color: right ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {right ? 'Correto.' : 'Não é isso.'}
                    </p>
                    <p style={{ color: 'var(--color-text-soft)' }}>{verdict.message}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <button onClick={downloadSheet} className="btn-primary w-full">
          <Download className="w-4 h-4 mr-1" /> Baixar a ficha de pesquisa (PDF)
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
          Este é um download de verdade, gerado agora com a consulta que você montou e a sua
          análise dos endereços e dos arquivos. É o arquivo que o requisito 6.1 pede.
        </p>
      </StageCard>
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

function StageCard({ title, icon: Icon, checks, children }: {
  title: string; icon: typeof Globe; checks: Check[]; children: ReactNode;
}) {
  const done = checks.filter(c => c.passed).length;
  const complete = done === checks.length;
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-bold flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-primary-a10)' }}
          >
            <Icon className="w-5 h-5" style={{ color: complete ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </span>
          {title}
        </h2>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-bg-hover)',
            color: complete ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        >
          {done}/{checks.length}
        </span>
      </div>

      {children}

      <ul className="mt-4 space-y-2">
        {checks.map(c => (
          <li
            key={c.id}
            className="flex items-start gap-2 text-sm p-2 rounded-lg"
            style={{ backgroundColor: c.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}
          >
            {c.passed
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
            <div className="min-w-0">
              <span className="font-medium" style={{ color: c.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>
                {c.label}
              </span>
              {!c.passed && <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{c.hint}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Part({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex flex-col py-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</dt>
        <dd className="font-mono text-sm text-right break-all" style={{ color: 'var(--color-text)' }}>{value}</dd>
      </div>
      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{note}</span>
    </div>
  );
}

function Token({ label, items }: { label: string; items: string[] }) {
  const empty = items.length === 0;
  return (
    <div
      className="p-2 rounded-lg"
      style={{ backgroundColor: empty ? 'var(--color-bg-input)' : 'var(--color-success-a10)' }}
    >
      <p className="mb-0.5" style={{ color: empty ? 'var(--color-text-dim)' : 'var(--color-success)' }}>{label}</p>
      <p className="font-mono break-all" style={{ color: empty ? 'var(--color-text-faint)' : 'var(--color-text)' }}>
        {empty ? '—' : items.join(' · ')}
      </p>
    </div>
  );
}
