import { getAllSpecialties } from '../curriculum';
import { VEREDAS } from '../curriculum/veredas';
import { LABORATORIOS_PREVISTOS, laboratoriosDaVereda } from '../curriculum/laboratoriosPrevistos';
import { objeto, type EventoDeAtividade } from './atividade';
import { EVENTOS_DA_OFENSIVA } from './ofensiva';
import { LIMIAR_DOMINIO } from './limiarDeDominio';

/*
  O XP: pontos por vitória, cada vitória uma vez.

  ── O que estava errado ───────────────────────────────────────────────────
  Era 10 por atividade de trilha, somado na matrícula a cada lição feita — e
  refeita. Refazer a mesma lição dez vezes valia cem pontos, então o XP media
  repetição, e não percurso; o topo da escada de XP se alcançava sem ter feito
  tudo, e o máximo não era número nenhum. E a vereda não rendia nada.

  ── O que é agora ─────────────────────────────────────────────────────────
  Cada vitória rende uma vez, na primeira data em que aconteceu: a lição de
  trilha, o laboratório, a prova final, a trilha concluída, e a teoria, o
  laboratório e a conclusão da vereda. O máximo é um número conhecido — a
  soma de tudo —, e é ele o topo da escada.

  As trilhas ficam com pelo menos três quartos do XP total: a vereda é bônus,
  e um percurso curto não pode valer o que vale uma especialidade inteira.
  `xp.test.ts` confere a proporção sobre o registro.

  ── Derivado na leitura, e não guardado ───────────────────────────────────
  É a decisão da ofensiva, pelo mesmo motivo: número guardado só muda quando
  alguém o muda. O XP sai dos eventos que já estão gravados, então a regra
  nova vale para o histórico inteiro sem conversão nenhuma — quem refez muitas
  lições vê o número cair, e é o número certo.

  A conta existe duas vezes, e é conferida: aqui, para o painel, e em
  `public.xp_das_vitorias`, para o ranking, que cruza dados de todo mundo e
  roda no Postgres. `xp.test.ts` lê o SQL publicado e compara valor por valor.
*/

/** Quanto vale cada tipo de vitória. */
export const XP_POR_VITORIA = {
  licaoDeTrilha: 15,
  laboratorioDeTrilha: 30,
  provaFinal: 60,
  trilhaConcluida: 150,
  teoriaDeVereda: 1,
  laboratorioDeVereda: 2,
  veredaConcluida: 4,
} as const;

export type TipoDeVitoria = keyof typeof XP_POR_VITORIA;

/** O certificado da vereda tem código CC; o do ME006 não rende XP. */
const ehCodigoDeVereda = (codigo: string) => codigo.startsWith('CC');
const CODIGOS_SEM_XP = new Set(['ME006']);

/** Eventos que podem ser vitória: os módulos vencidos e a emissão do certificado. */
export const EVENTOS_COM_XP: readonly string[] = [...EVENTOS_DA_OFENSIVA, 'certification_issued'];

const texto = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

/** Passou? Eventos sem nota só existem vencidos; os com nota, a partir do limiar. */
function passou(m: Record<string, unknown>): boolean {
  const { score, total } = m;
  if (typeof score !== 'number' || typeof total !== 'number') return true;
  return total > 0 && score * 100 >= LIMIAR_DOMINIO * total;
}

/**
 * A vitória que o evento representa — a chave que a torna única, e o tipo —
 * ou nada, se ele não é vitória.
 *
 * A chave é o que impede refazer de render de novo: a mesma lição, o mesmo
 * laboratório, a mesma prova, o mesmo certificado.
 */
export function vitoriaDoEvento(e: EventoDeAtividade & { curriculum_version?: string | null }): { chave: string; tipo: TipoDeVitoria } | undefined {
  if (!EVENTOS_COM_XP.includes(e.event_type)) return undefined;
  const m = objeto(e.metadata);
  if (!passou(m)) return undefined;
  const trilha = texto(m.specialtyCode) ?? texto(e.curriculum_version) ?? '';
  switch (e.event_type) {
    case 'vereda_teoria':
    case 'vereda_laboratorio': {
      const vereda = texto(m.vereda) ?? texto(m.trilha), licao = texto(m.licao);
      if (!vereda || !licao) return undefined;
      return e.event_type === 'vereda_teoria'
        ? { chave: `vt:${vereda}/${licao}`, tipo: 'teoriaDeVereda' }
        : { chave: `vl:${vereda}/${licao}`, tipo: 'laboratorioDeVereda' };
    }
    case 'certification_issued': {
      const codigo = texto(m.specialtyCode);
      if (!codigo || CODIGOS_SEM_XP.has(codigo)) return undefined;
      return { chave: `c:${codigo}`, tipo: ehCodigoDeVereda(codigo) ? 'veredaConcluida' : 'trilhaConcluida' };
    }
    case 'final_exam_completed':
      return { chave: `p:${trilha}`, tipo: 'provaFinal' };
    case 'lesson_completed': {
      const licao = texto(m.lessonCode);
      return licao ? { chave: `l:${licao}`, tipo: 'licaoDeTrilha' } : undefined;
    }
    default:
      return { chave: `lab:${texto(m.lessonCode) ?? `${e.event_type}:${trilha}`}`, tipo: 'laboratorioDeTrilha' };
  }
}

/**
 * O XP de alguém, a partir dos eventos — o total, e o de uma janela.
 *
 * Cada vitória conta na data da primeira vez: refazer na semana que vem não
 * põe a lição de novo na conta da semana.
 */
export function xpDasVitorias(
  eventos: readonly (EventoDeAtividade & { curriculum_version?: string | null })[],
  desde?: number,
): number {
  const primeira = new Map<string, { tipo: TipoDeVitoria; t: number }>();
  for (const e of eventos) {
    const v = vitoriaDoEvento(e);
    if (!v || !e.created_at) continue;
    const t = Date.parse(e.created_at);
    const ja = primeira.get(v.chave);
    if (!ja || t < ja.t) primeira.set(v.chave, { tipo: v.tipo, t });
  }
  let total = 0;
  for (const { tipo, t } of primeira.values()) if (desde === undefined || t >= desde) total += XP_POR_VITORIA[tipo];
  return total;
}

/*
  O XP máximo da plataforma escrita, somado sobre o registro.

  Das trilhas anunciadas só se conhece, por enquanto, o número de
  laboratórios (`laboratoriosPrevistos`); as lições de teoria delas ainda não
  existem e ficam fora da soma até serem escritas. Isso só pode subir a parte
  das trilhas, nunca baixar — e por isso a proporção conferida em `xp.test.ts`
  é um piso honesto.
*/

export function xpMaximo(): { trilhas: number; veredas: number; total: number } {
  let trilhas = 0;
  for (const t of getAllSpecialties()) {
    trilhas += XP_POR_VITORIA.trilhaConcluida + XP_POR_VITORIA.provaFinal;
    if (t.emConstrucao) {
      trilhas += (LABORATORIOS_PREVISTOS[t.code] ?? 0) * XP_POR_VITORIA.laboratorioDeTrilha;
      continue;
    }
    for (const l of t.modules.flatMap(m => m.lessons)) {
      if (l.labType === 'final_exam') continue;
      trilhas += l.labType ? XP_POR_VITORIA.laboratorioDeTrilha : XP_POR_VITORIA.licaoDeTrilha;
    }
  }
  let veredas = 0;
  for (const v of VEREDAS) {
    const labs = laboratoriosDaVereda(v);
    /* Um módulo de vereda é uma teoria e um laboratório. */
    veredas += labs * (XP_POR_VITORIA.teoriaDeVereda + XP_POR_VITORIA.laboratorioDeVereda) + XP_POR_VITORIA.veredaConcluida;
  }
  return { trilhas, veredas, total: trilhas + veredas };
}
