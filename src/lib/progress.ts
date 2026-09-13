import { supabase } from './supabase';
import { evaluateBadges } from './gamification';
import { diaEmBrasilia, diaAnterior } from './ofensiva';
import { LIMIAR_DOMINIO } from './limiarDeDominio';
import { umDe, STATUS_DO_REQUISITO } from '../types';
import type { Json, RequirementStatus } from '../types';

export interface RequirementProgress {
  requirement_id: string;
  status: RequirementStatus;
  mastery_score: number;
  attempts: number;
  correct_count: number;
  total_questions: number;
  retention_passed: boolean;
  checkpoint_passed: boolean;
}

export type ProgressMap = Record<string, RequirementProgress>;

/*
  O limiar mora em `limiarDeDominio.ts` e é reexportado daqui, que é de onde
  todo mundo sempre o importou. Ele saiu porque a ofensiva passou a precisar
  dele e este arquivo importa a conta de dia dela — os dois se importariam em
  círculo. O motivo inteiro está escrito lá.
*/
export { LIMIAR_DOMINIO } from './limiarDeDominio';

export function calculateMastery(
  correct: number,
  total: number,
  retentionPassed: boolean,
  checkpointPassed: boolean
): { score: number; status: RequirementStatus } {
  if (total === 0) return { score: 0, status: 'not_started' };
  const score = Math.round((correct / total) * 100);
  if (score >= LIMIAR_DOMINIO) {
    if (retentionPassed && checkpointPassed) {
      return { score, status: 'completed' };
    }
    return { score, status: 'completed' };
  }
  if (correct > 0) {
    return { score, status: 'needs_review' };
  }
  return { score, status: 'learning' };
}

/**
 * Entre o que já estava gravado e o que a pessoa acabou de fazer, fica o melhor.
 *
 * O registro era substituído pelo resultado mais recente. Quem já tinha
 * concluído um requisito e revisitava a lição, indo pior na segunda vez, era
 * rebaixado — progresso conquistado sumia. Refazer uma lição só pode ajudar.
 *
 * Uma lição sem questões (`total` zero) não diz nada sobre domínio e por isso
 * não desloca o que já havia.
 */
export function melhorResultado(
  anterior: { correct: number; total: number },
  novo: { correct: number; total: number },
): { correct: number; total: number } {
  const taxa = (r: { correct: number; total: number }) => (r.total > 0 ? r.correct / r.total : -1);
  if (novo.total === 0) return anterior;
  if (anterior.total === 0) return novo;
  return taxa(novo) >= taxa(anterior) ? novo : anterior;
}

export function getModuleStatus(reqCodes: string[], progress: ProgressMap): RequirementStatus {
  if (reqCodes.length === 0) return 'not_started';
  const statuses = reqCodes.map(c => progress[c]?.status || 'not_started');
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'needs_review')) return 'needs_review';
  if (statuses.some(s => s === 'learning' || s === 'practicing' || s === 'demonstrated')) {
    return 'learning';
  }
  return 'not_started';
}

/* ── Quais lições a pessoa realmente fez ──────────────────────────────────── */

type LicaoParaStatus = { code: string; type: string; requirementCodes: string[] };

/**
 * O estado de cada lição da trilha, pelo código dela.
 *
 * Antes isto era `getLessonStatus`, e olhava só para os requisitos da lição. O
 * problema é que duas lições podem cobrir o mesmo requisito — na AP041, a lição
 * teórica sobre a história dos computadores e o laboratório onde a redação é
 * escrita cobrem ambas o requisito 1.1, e na AP034 acontece o mesmo em cinco
 * requisitos. Deduzir o estado da lição a partir do requisito tornava as duas
 * indistinguíveis: concluir a teoria marcava o laboratório como feito, e a
 * contagem de lições saltava de duas em duas.
 *
 * A evidência de que *esta* lição foi feita está em `lesson_attempts`. Quando
 * ela existe, manda. Quando não existe:
 *
 * - se nenhuma outra lição divide os requisitos desta, o progresso do requisito
 *   só pode ter vindo daqui, e continua valendo como prova — é o que preserva o
 *   histórico de quem concluiu trilhas antes de os laboratórios registrarem a
 *   própria conclusão;
 * - se há divisão, a prova é ambígua, e a lição para em "em andamento" em vez de
 *   afirmar uma conclusão que ninguém pode confirmar.
 */
export function statusDasLicoes(
  licoes: LicaoParaStatus[],
  progress: ProgressMap,
  feitas: Set<string>,
): Record<string, RequirementStatus> {
  const reivindicacoes = new Map<string, number>();
  for (const l of licoes) {
    for (const rc of l.requirementCodes ?? []) {
      reivindicacoes.set(rc, (reivindicacoes.get(rc) ?? 0) + 1);
    }
  }

  const saida: Record<string, RequirementStatus> = {};
  for (const l of licoes) {
    if (l.type === 'final') { saida[l.code] = 'not_started'; continue; }
    if (feitas.has(l.code)) { saida[l.code] = 'completed'; continue; }

    const derivado = getModuleStatus(l.requirementCodes, progress);
    const ambigua = (l.requirementCodes ?? []).some(rc => (reivindicacoes.get(rc) ?? 0) > 1);
    saida[l.code] = ambigua && derivado === 'completed' ? 'learning' : derivado;
  }
  return saida;
}

/**
 * Registra que esta lição foi feita.
 *
 * A página de lição já gravava isto ao fim do questionário; os laboratórios não
 * gravavam nada além do progresso do requisito, e por isso não havia como saber
 * se um laboratório tinha sido feito ou se o requisito dele tinha vindo da lição
 * teórica ao lado.
 *
 * `passed` é verdadeiro porque chegar até aqui, num laboratório, é tê-lo
 * concluído — não há nota abaixo da qual ele não conte.
 */
export async function registrarConclusaoDeLicao(
  userId: string,
  lessonCode: string,
  resultado?: { correct: number; total: number },
): Promise<void> {
  const lessonId = await getLessonId(lessonCode);
  if (!lessonId) return;
  await supabase.from('lesson_attempts').insert({
    user_id: userId,
    lesson_id: lessonId,
    score: resultado?.correct ?? 0,
    total: resultado?.total ?? 0,
    passed: true,
    answers: [],
    completed_at: new Date().toISOString(),
  });
  /*
    Daqui sai o gatilho mais rico que a plataforma tem: o código da lição diz
    a lição **e** o percurso, porque o código é `AP044.3-L2` — o percurso é o
    que vem antes do ponto. Sem isto a insígnia saberia o dia e não saberia o
    lugar, que é metade do que a pessoa quer ler depois.
  */
  evaluateBadges(userId, {
    evento: 'lesson_completed',
    licao: lessonCode,
    percurso: percursoDoCodigoDaLicao(lessonCode),
  }).catch(() => {});
}

/*
  O percurso que um código de lição nomeia.

  Os códigos são `AP044.3-L2` nas trilhas e `CC002-M1-L1` nas veredas — o
  percurso é o primeiro pedaço nos dois, separado por ponto ou por traço. Não
  há tabela a consultar para isto, e inventar uma consulta para reler o que o
  próprio código já diz seria ida à rede por nada.
*/
export function percursoDoCodigoDaLicao(lessonCode: string): string | undefined {
  const primeiro = lessonCode.split(/[.-]/)[0]?.trim();
  return primeiro || undefined;
}

/** Os códigos das lições que a pessoa concluiu de fato. */
export async function fetchLicoesConcluidas(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('lesson_attempts')
    .select('passed, lessons(code)')
    .eq('user_id', userId)
    .eq('passed', true);

  const codigos = (data ?? [])
    .map((linha: { lessons?: { code?: string } | { code?: string }[] }) => {
      /* O embed vem como objeto ou lista, conforme o PostgREST resolva a relação. */
      const rel = Array.isArray(linha.lessons) ? linha.lessons[0] : linha.lessons;
      return rel?.code;
    })
    .filter((c): c is string => !!c);

  return new Set(codigos);
}

export function getProgressPercent(reqCodes: string[], progress: ProgressMap): number {
  if (reqCodes.length === 0) return 0;
  const completed = reqCodes.filter(c => progress[c]?.status === 'completed').length;
  return Math.round((completed / reqCodes.length) * 100);
}

/** O que a barra mostra: a parte cumprida e a parte em recuperação. */
export interface ProgressoDetalhado {
  /** % de requisitos concluídos — é este número que o relatório atesta. */
  concluido: number;
  /** % adicional de quem ficou abaixo do limiar, proporcional ao acerto. */
  parcial: number;
}

/**
 * Progresso em duas partes, para uma barra que não seja só 0% ou 100%.
 *
 * getProgressPercent conta apenas requisitos concluídos, e continua sendo o
 * número oficial. Só que uma lição inteira responde pelo mesmo questionário:
 * ou todos os seus requisitos passam do limiar, ou nenhum passa. A barra ficava
 * binária e não distinguia quem errou uma questão de quem não começou.
 *
 * Quem ficou abaixo do corte entra proporcionalmente ao que acertou na melhor
 * tentativa — 6 de 8 vale 0,75 de um requisito. Fica separado do cumprido, e
 * não somado a ele, porque são coisas diferentes: uma está certificada, a outra
 * é caminho andado.
 */
export function getProgressDetail(reqCodes: string[], progress: ProgressMap): ProgressoDetalhado {
  if (reqCodes.length === 0) return { concluido: 0, parcial: 0 };

  let cumpridos = 0;
  let emRecuperacao = 0;

  for (const code of reqCodes) {
    const r = progress[code];
    if (r?.status === 'completed') {
      cumpridos += 1;
    } else if (r && r.mastery_score > 0) {
      emRecuperacao += Math.min(100, r.mastery_score) / 100;
    }
  }

  const concluido = (cumpridos / reqCodes.length) * 100;
  /* Os dois trechos são desenhados um ao lado do outro, então a soma não pode
     ultrapassar a largura da barra. */
  const parcial = Math.min(100 - concluido, (emRecuperacao / reqCodes.length) * 100);

  return { concluido: Math.round(concluido), parcial: Math.round(parcial) };
}

/*
  Último progresso conhecido de cada pessoa, guardado em memória.

  As quatro telas que mostram progresso buscavam cada uma por conta própria,
  partindo de um mapa vazio. Ao voltar de uma lição para a trilha, a barra
  nascia em 0% e só pulava para o valor real depois da ida e volta ao servidor —
  e logo depois de concluir uma lição é justamente isso que parece "não gravou".

  Com o cache, a tela seguinte desenha na hora o que a anterior já sabia, e a
  busca continua acontecendo por baixo para corrigir qualquer diferença.

  Vive só na memória da aba: recarregar a página busca de novo, e é o que se
  quer — o cache serve para a navegação, não para substituir o banco.
*/
const cacheProgresso = new Map<string, ProgressMap>();

/** O que já se sabe sobre esta pessoa, sem esperar rede. */
export function progressoEmCache(userId: string | undefined): ProgressMap | undefined {
  return userId ? cacheProgresso.get(userId) : undefined;
}

/**
 * Esquece tudo que está em memória.
 *
 * Chamado ao sair: sem isto, a próxima pessoa a entrar no mesmo navegador veria,
 * por um instante, as barras de progresso de quem saiu.
 */
export function limparCacheDeProgresso(): void {
  cacheProgresso.clear();
}

export async function fetchRequirementProgress(userId: string): Promise<ProgressMap> {
  const { data, error } = await supabase
    .from('requirement_progress')
    .select(`
      requirement_id,
      status,
      mastery_score,
      attempts,
      correct_count,
      total_questions,
      retention_passed,
      checkpoint_passed,
      requirements!inner(code)
    `)
    .eq('user_id', userId);

  /* Falha de rede devolve o que já havia, e não um mapa vazio: zerar a barra
     por causa de uma requisição perdida é pior do que mostrar o valor anterior. */
  if (error || !data) return cacheProgresso.get(userId) ?? {};

  const map: ProgressMap = {};
  for (const row of data) {
    const code = row.requirements?.code;
    if (code) {
      map[code] = {
        requirement_id: row.requirement_id,
        status: umDe(STATUS_DO_REQUISITO, row.status, 'not_started'),
        mastery_score: row.mastery_score,
        attempts: row.attempts,
        correct_count: row.correct_count,
        total_questions: row.total_questions,
        retention_passed: row.retention_passed,
        checkpoint_passed: row.checkpoint_passed,
      };
    }
  }
  cacheProgresso.set(userId, map);
  return map;
}

export async function upsertRequirementProgress(
  userId: string,
  requirementId: string,
  data: Partial<RequirementProgress>,
  /*
    O percurso em que este requisito foi cumprido.

    Ele existe para a insígnia que cair aqui saber **onde** caiu. Esta função
    recebe o id do requisito, que é um uuid do banco e não diz nada sobre a
    trilha; resolver a trilha a partir dele custaria uma ida à rede a cada
    requisito cumprido, e a trilha está bem ali, em quem chama — todo
    laboratório tem `specialtyCode`, e as duas páginas têm a especialidade
    aberta na tela.

    É opcional no tipo e obrigatório na prática: `percursoDoRequisito.test.ts`
    lê toda chamada do repositório e reprova a que não passa. Opcional para a
    assinatura não quebrar quem chamar de fora; travado para a lacuna não
    reabrir em silêncio, que é como ela existiu até agora.
  */
  percurso?: string,
): Promise<void> {
  const { error } = await supabase
    .from('requirement_progress')
    .upsert({
      user_id: userId,
      requirement_id: requirementId,
      status: data.status || 'learning',
      mastery_score: data.mastery_score || 0,
      attempts: data.attempts || 0,
      correct_count: data.correct_count || 0,
      total_questions: data.total_questions || 0,
      retention_passed: data.retention_passed || false,
      checkpoint_passed: data.checkpoint_passed || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,requirement_id' });

  if (error) console.error('upsertRequirementProgress error:', error);
  else evaluateBadges(userId, { evento: 'requirement_progress', percurso }).catch(() => {});
}

export async function logActivity(
  userId: string,
  eventType: string,
  metadata: Json = {},
  requirementId?: string,
  entityType?: string,
  entityId?: string,
  curriculumVersion?: string
): Promise<void> {
  await supabase.from('activity_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata,
    requirement_id: requirementId,
    entity_type: entityType,
    entity_id: entityId,
    curriculum_version: curriculumVersion,
  });
}

export async function ensureEnrollment(userId: string, specialtyId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('specialty_id', specialtyId)
    .maybeSingle();
  if (!existing) {
    await supabase.from('enrollments').insert({
      user_id: userId,
      specialty_id: specialtyId,
      status: 'active',
      last_activity_date: diaEmBrasilia(),
    });
  }
}

/* Uma atividade concluída vale isto, no total corrente e no evento datado. */
const XP_POR_ATIVIDADE = 10;

/*
  A ofensiva que a tela mostra **não** sai mais daqui — ver `lib/ofensiva.ts`.

  Esta coluna é a sequência dentro de **uma trilha**, porque `enrollments` tem
  uma linha por trilha, e era ela que a tela lia como se fosse da pessoa: quem
  estudasse AP034 na segunda e AP042 na terça tinha duas matrículas com
  sequência 1, e via 1. Continua sendo escrita porque o ranking do clube ainda
  a lê, e porque a data da última atividade da trilha diz coisa que a soma de
  todas não diz.

  O que mudou aqui é o dia: era o dia em **UTC**, que vira às 21h de Brasília.
*/
export async function updateEnrollmentActivity(userId: string, specialtyId: string): Promise<void> {
  const today = diaEmBrasilia();
  const { data: existing } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('specialty_id', specialtyId)
    .maybeSingle();
  if (existing) {
    const lastDate = existing.last_activity_date;
    let streak = existing.streak_days || 0;
    if (lastDate !== today) {
      /* "Ontem" é o dia civil anterior, e não "agora menos 24 horas": as duas
         contas dão o mesmo resultado quase sempre, e discordam justamente na
         virada — quem venceu algo às 23h de ontem e volta às 10h de hoje está
         a 11 horas de distância, não a 24. */
      if (lastDate === diaAnterior(today)) streak += 1;
      else streak = 1;
    }
    await supabase
      .from('enrollments')
      .update({ xp: (existing.xp || 0) + XP_POR_ATIVIDADE, streak_days: streak, last_activity_date: today })
      .eq('id', existing.id);

    /*
      O mesmo XP, agora também como fato datado.
      enrollments.xp é um total corrente e não sabe dizer quando cada ponto foi
      ganho, então o ranking não conseguia responder "quanto esta semana?".
      Falhar aqui não pode desfazer a atividade da pessoa: o total acima já foi
      gravado, e o evento é material do ranking, não do progresso.
    */
    supabase
      .from('xp_events')
      .insert({ user_id: userId, specialty_id: specialtyId, amount: XP_POR_ATIVIDADE })
      .then(undefined, () => {});

    evaluateBadges(userId).catch(() => {});
  }
}

export async function getRequirementId(code: string): Promise<string | null> {
  const { data } = await supabase.from('requirements').select('id').eq('code', code).maybeSingle();
  return data?.id || null;
}

export async function getLessonId(lessonCode: string): Promise<string | null> {
  const { data } = await supabase.from('lessons').select('id').eq('code', lessonCode).maybeSingle();
  return data?.id || null;
}

export async function getSpecialtyId(code: string): Promise<string | null> {
  const { data } = await supabase.from('specialties').select('id').eq('code', code).maybeSingle();
  return data?.id || null;
}

export async function getSpecialtyIdForRequirement(reqCode: string): Promise<string | null> {
  const { data } = await supabase
    .from('requirements')
    .select('specialty_id')
    .eq('code', reqCode)
    .maybeSingle();
  return data?.specialty_id || null;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
