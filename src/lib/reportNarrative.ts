import type { Specialty, Certification } from '../types';
import type { ProgressMap } from './progress';

// Turns curriculum data + a user's progress into plain Portuguese prose. This lives
// apart from the page component so the wording can be unit-tested and adjusted
// without touching layout — the text is the deliverable here, since a club leader
// reads it to decide on granting the offline certification.

export interface ModuleNarrative {
  title: string;
  paragraph: string;
}

export interface SpecialtyNarrative {
  code: string;
  name: string;
  levelLabel: string;
  completedCount: number;
  totalCount: number;
  percent: number;
  started: boolean;
  opening: string;
  modules: ModuleNarrative[];
  pending: string | null;
  certification: string | null;
  certificate: Certification | null;
}

/**
 * "Definir download." -> "definir download", so the text can be spliced into a
 * running sentence. Proper nouns and acronyms keep their capitals: lowercasing
 * "WebLab" into "webLab" or "JPEG" into "jPEG" would look like a typo in a
 * document meant to be handed to a club leader.
 */
function toClause(description: string): string {
  const text = description.trim().replace(/\.+$/, '');
  const firstWord = text.split(/[\s:,]/)[0] ?? '';
  const hasInnerCapital = /[A-ZÀ-Þ0-9]/.test(firstWord.slice(1));
  return hasInnerCapital ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Curriculum descriptions come in two shapes: actions ("Definir download") and
 * bare topics ("Elemento html", "JPEG, PNG, botões e header"). Only the former
 * reads correctly after "ser capaz de", so they are described separately.
 * Portuguese infinitives end in -ar/-er/-ir, and the verb may trail a negation
 * ("Nunca revelar...", "Não responder..."), so the first two words are checked.
 */
function isActionDescription(description: string): boolean {
  const words = description.trim().toLowerCase().split(/[\s:,]+/).slice(0, 2);
  return words.some(w => w.length >= 4 && /(ar|er|ir)$/.test(w));
}

/** ["a", "b", "c"] -> "a; b; e c" */
function joinClauses(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join('; ')}; e ${items[items.length - 1]}`;
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function buildSpecialtyNarrative(
  specialty: Specialty,
  progress: ProgressMap,
  certifications: Certification[],
  studentName: string,
): SpecialtyNarrative {
  const levelLabel = specialty.level === 'fundamental' ? 'Fundamental' : 'Avançado';
  const requirements = specialty.requirements;
  const isDone = (code: string) => progress[code]?.status === 'completed';

  const completed = requirements.filter(r => isDone(r.code));
  const pendingReqs = requirements.filter(r => !isDone(r.code));
  const percent = requirements.length === 0
    ? 0
    : Math.round((completed.length / requirements.length) * 100);
  const started = completed.length > 0;

  const certificate = certifications.find(c =>
    c.status === 'active' && c.level === specialty.level
  ) || null;

  let opening: string;
  if (!started) {
    opening = `${studentName} ainda não registrou conclusão de requisitos na especialidade ${specialty.code} — ${specialty.name} (nível ${levelLabel.toLowerCase()}). Esta seção permanece em aberto e será preenchida à medida que a trilha for percorrida.`;
  } else if (percent === 100) {
    opening = `Na especialidade ${specialty.code} — ${specialty.name}, de nível ${levelLabel.toLowerCase()}, ${studentName} concluiu a integralidade dos ${requirements.length} requisitos previstos no currículo oficial, percorrendo todos os módulos teóricos e práticos da trilha. O detalhamento a seguir descreve, módulo a módulo, as competências efetivamente demonstradas.`;
  } else {
    opening = `Na especialidade ${specialty.code} — ${specialty.name}, de nível ${levelLabel.toLowerCase()}, ${studentName} concluiu ${completed.length} ${plural(completed.length, 'requisito', 'requisitos')} de um total de ${requirements.length} previstos no currículo oficial, o que corresponde a ${percent}% da trilha. O detalhamento a seguir descreve as competências já demonstradas e os pontos que seguem em estudo.`;
  }

  const modules: ModuleNarrative[] = [];
  for (const module of specialty.modules) {
    const moduleCodes = [...new Set(module.lessons.flatMap(l => l.requirementCodes))];
    if (moduleCodes.length === 0) continue;

    const moduleReqs = moduleCodes
      .map(code => requirements.find(r => r.code === code))
      .filter((r): r is NonNullable<typeof r> => !!r);
    const doneReqs = moduleReqs.filter(r => isDone(r.code));
    if (doneReqs.length === 0) continue;

    const allDone = doneReqs.length === moduleReqs.length;

    const scope = module.description
      ? `, que trata de ${toClause(module.description)},`
      : '';

    const coverage = allDone
      ? `demonstrou domínio de ${plural(moduleReqs.length, 'seu único requisito', `todos os ${moduleReqs.length} requisitos`)}`
      : `demonstrou domínio de ${doneReqs.length} dos ${moduleReqs.length} requisitos`;

    const actions = doneReqs.filter(r => isActionDescription(r.description));
    const topics = doneReqs.filter(r => !isActionDescription(r.description));

    const parts: string[] = [];
    if (actions.length > 0) {
      parts.push(`evidenciando ser capaz de: ${joinClauses(actions.map(r => toClause(r.description)))}`);
    }
    if (topics.length > 0) {
      // Standalone, this clause continues "demonstrou domínio de...", so it has to
      // stay in the gerund to agree with that verb. Following an action clause it
      // starts a new sentence and becomes finite instead.
      const lead = actions.length > 0
        ? 'domina ainda os seguintes conteúdos'
        : 'abrangendo os seguintes conteúdos';
      parts.push(`${lead}: ${joinClauses(topics.map(r => toClause(r.description)))}`);
    }

    const detail = parts.length === 2
      ? `${parts[0]}. ${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`
      : parts[0] ?? '';

    modules.push({
      title: module.title,
      paragraph: `No módulo ${module.title}${scope} ${coverage}, ${detail}.`,
    });
  }

  const pending = pendingReqs.length > 0 && started
    ? `Seguem em estudo, ainda sem registro de conclusão, os seguintes pontos do currículo: ${joinClauses(pendingReqs.map(r => toClause(r.description)))}.`
    : null;

  let certification: string | null = null;
  if (certificate) {
    const issued = new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    certification = `A trilha foi encerrada com aprovação na avaliação final, o que resultou na emissão do Token.Web() de nível ${levelLabel.toLowerCase()}, registrado sob o código ${certificate.code} em ${issued}. O certificado correspondente segue anexo a este relatório e sua autenticidade pode ser conferida publicamente, a qualquer tempo, informando esse código na página de verificação da plataforma.`;
  } else if (percent === 100) {
    certification = `Embora todos os requisitos do currículo estejam concluídos, a avaliação final ainda não foi realizada ou não atingiu o aproveitamento mínimo exigido, de modo que o Token.Web() correspondente ainda não foi emitido.`;
  }

  return {
    code: specialty.code,
    name: specialty.name,
    levelLabel,
    completedCount: completed.length,
    totalCount: requirements.length,
    percent,
    started,
    opening,
    modules,
    pending,
    certification,
    certificate,
  };
}

/** Closing paragraph that ties both specialties together for the club authority. */
export function buildClosingParagraph(
  narratives: SpecialtyNarrative[],
  studentName: string,
  attemptsCount: number,
  averageScore: number,
): string {
  const certified = narratives.filter(n => n.certificate);
  const fullyDone = narratives.filter(n => n.percent === 100);

  let text = '';

  if (certified.length === narratives.length && narratives.length > 0) {
    text += `${studentName} concluiu integralmente as duas especialidades que compõem a Trilha.Web(), obtendo certificação em ambas. `;
  } else if (certified.length > 0) {
    text += `${studentName} obteve certificação em ${certified.length} ${plural(certified.length, 'especialidade', 'especialidades')} (${certified.map(n => n.code).join(' e ')}). `;
  } else if (fullyDone.length > 0) {
    text += `${studentName} completou os requisitos curriculares de ${fullyDone.map(n => n.code).join(' e ')}, restando a realização da avaliação final para a emissão da certificação. `;
  } else {
    text += `${studentName} encontra-se em percurso na Trilha.Web(). `;
  }

  if (attemptsCount > 0) {
    text += `Ao longo do percurso foram registradas ${attemptsCount} ${plural(attemptsCount, 'atividade avaliada', 'atividades avaliadas')}, com aproveitamento médio de ${averageScore}%. `;
  }

  text += `Todo o progresso descrito neste relatório foi registrado automaticamente pela plataforma no momento em que cada atividade foi realizada, não dependendo de autodeclaração. Este documento é apresentado à liderança do clube para subsidiar o reconhecimento das especialidades no registro oficial do Clube de Desbravadores.`;

  return text;
}
