import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getOpenSpecialties } from '../curriculum';
import { LABORATORIO_DO_EVENTO } from './atividade';

/*
  O laboratório de trilha concluído acende o pin dele na hora.

  A insígnia `lab_<tipo>` sai do evento de conclusão, e os laboratórios gravam
  o requisito antes do evento: a avaliação que o requisito dispara rodava com
  o evento ainda fora do banco. A pesquisa da AP045 foi entregue, o requisito
  ficou verde, e o pin dela continuou a giz na Faixa — sem erro em lugar
  nenhum, até a pessoa fazer outra coisa, que para quem acabou a trilha era
  nunca.
*/

const chamadas = vi.hoisted(() => ({
  erroNoInsert: null as unknown,
  avaliacoes: [] as unknown[][],
}));

vi.mock('./supabase', () => ({
  supabase: { from: () => ({ insert: async () => ({ error: chamadas.erroNoInsert }) }) },
}));
vi.mock('./gamification', () => ({
  evaluateBadges: async (...args: unknown[]) => { chamadas.avaliacoes.push(args); return []; },
}));

const { logActivity } = await import('./progress');

beforeEach(() => {
  chamadas.erroNoInsert = null;
  chamadas.avaliacoes = [];
});

describe('gravar o evento que conclui um laboratório', () => {
  it('avalia as insígnias depois de gravar, dizendo onde', async () => {
    await logActivity('u1', 'pesquisa_concluida', { specialtyCode: 'AP045', lessonCode: 'AP045.5-L3' });
    expect(chamadas.avaliacoes).toEqual([[
      'u1', { evento: 'pesquisa_concluida', percurso: 'AP045', licao: 'AP045.5-L3' },
    ]]);
  });

  it('avalia a entrega da redação, que conclui pelo código da lição', async () => {
    await logActivity('u1', 'text_submitted', { specialtyCode: 'AP045', lessonCode: 'AP045.5-L4' });
    expect(chamadas.avaliacoes).toHaveLength(1);
  });

  it('não avalia passo do meio do caminho, nem lição de teoria', async () => {
    await logActivity('u1', 'mail_sent', { specialtyCode: 'AP034' });
    await logActivity('u1', 'redacao_montada', { specialtyCode: 'AP045' });
    await logActivity('u1', 'lesson_completed', { lessonCode: 'AP045.1-L1', score: 5, total: 5 });
    expect(chamadas.avaliacoes).toEqual([]);
  });

  it('não avalia quando o evento não entrou no banco', async () => {
    chamadas.erroNoInsert = { message: 'recusado' };
    await logActivity('u1', 'pesquisa_concluida', { specialtyCode: 'AP045', lessonCode: 'AP045.5-L3' });
    expect(chamadas.avaliacoes).toEqual([]);
  });

  /* Todo laboratório das trilhas abertas: o evento que o conclui, com o
     código da lição, dispara a avaliação. Trilha nova entra sozinha. */
  it('vale para todo laboratório das trilhas abertas', async () => {
    const eventoDoTipo = new Map(Object.entries(LABORATORIO_DO_EVENTO).map(([ev, tipo]) => [tipo, ev]));
    const labs = getOpenSpecialties().flatMap(t => t.modules.flatMap(m => m.lessons)
      .filter(l => l.type === 'lab' && l.labType && l.labType !== 'final_exam')
      .map(l => ({ trilha: t.code, l })));
    expect(labs.length, 'a trava não achou laboratório nenhum').toBeGreaterThan(20);
    const mudos: string[] = [];
    for (const { trilha, l } of labs) {
      chamadas.avaliacoes = [];
      const evento = eventoDoTipo.get(l.labType!) ?? 'text_submitted';
      await logActivity('u1', evento, { specialtyCode: trilha, lessonCode: l.code });
      if (chamadas.avaliacoes.length !== 1) mudos.push(`${l.code} (${l.labType})`);
    }
    expect(mudos).toEqual([]);
  });
});

/*
  Duas avaliações correm juntas — a do requisito e a do evento —, e as duas
  acham a mesma insígnia. Com `insert` puro a segunda batia no UNIQUE e o lote
  inteiro era recusado, levando junto a insígnia que só ela tinha achado.
*/
describe('a gravação das insígnias', () => {
  it('ignora a repetida em vez de recusar o lote', () => {
    const fonte = readFileSync(join(__dirname, 'gamification.ts'), 'utf8');
    expect(fonte).toMatch(/from\('user_badges'\)\.upsert\(/);
    expect(fonte).toMatch(/onConflict: 'user_id,badge_id', ignoreDuplicates: true/);
  });
});

/*
  A concessão retroativa de `20261115190000` leva uma tabela de lição para
  insígnia e uma lista de eventos, escritas no SQL. As duas copiam o código, e
  cópia diverge calada: uma linha trocada daria o pin de um laboratório a quem
  fez outro.
*/
/* A segunda refaz a conta para quem concluiu enquanto o lote era recusado, e é
   uma cópia da primeira: as duas passam pela mesma conferência. */
describe.each([
  '20261115190000_laboratorios_de_quem_ja_tinha.sql',
  '20261115230000_laboratorios_do_lote_recusado.sql',
])('a migration %s, que deu o pin a quem já tinha concluído', arquivo => {
  const sql = readFileSync(join(__dirname, '../../supabase/migrations', arquivo), 'utf8');

  it('liga cada lição de laboratório à insígnia do tipo dela', () => {
    const naMigration = new Map([...sql.matchAll(/\('(AP\d{3}\.\d+-L\d+)',\s*'(lab_[a-z0-9_]+)'\)/g)]
      .map(m => [m[1], m[2]]));
    const noCodigo = new Map(getOpenSpecialties().flatMap(t => t.modules.flatMap(m => m.lessons))
      .filter(l => l.type === 'lab' && l.labType && l.labType !== 'final_exam')
      .map(l => [l.code, `lab_${l.labType}`]));
    expect(noCodigo.size, 'a trava não achou laboratório nenhum').toBeGreaterThan(20);
    expect(naMigration).toEqual(noCodigo);
  });

  it('lê os eventos que concluem laboratório, e só eles', async () => {
    const { EVENTOS_DA_OFENSIVA } = await import('./ofensiva');
    const bloco = sql.match(/event_type IN \(([^)]*)\)/)?.[1] ?? '';
    const naMigration = [...bloco.matchAll(/'([a-z_]+)'/g)].map(m => m[1]).sort();
    const fora = new Set(['lesson_completed', 'final_exam_completed', 'vereda_teoria', 'vereda_laboratorio']);
    const noCodigo = EVENTOS_DA_OFENSIVA.filter(e => !fora.has(e)).sort();
    expect(naMigration.length).toBeGreaterThan(20);
    expect(naMigration).toEqual(noCodigo);
  });
});
