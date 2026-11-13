import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { XP_POR_VITORIA, EVENTOS_COM_XP, xpDasVitorias, xpMaximo, vitoriaDoEvento } from './xp';
import { LIMIAR_DOMINIO } from './limiarDeDominio';
import { getAllSpecialties } from '../curriculum';
import { VEREDAS } from '../curriculum/veredas';
import type { EventoDeAtividade } from './atividade';
import type { Json } from '../types/database';

const ev = (event_type: string, created_at: string, metadata: Json = {}): EventoDeAtividade => ({ event_type, created_at, metadata });

describe('o XP por vitória', () => {
  it('cada vitória conta uma vez, e refazer não rende', () => {
    const licao = (d: string) => ev('lesson_completed', d, { lessonCode: 'AP034.1-L1', score: 9, total: 10 });
    expect(xpDasVitorias([licao('2026-11-01T15:00:00Z'), licao('2026-11-02T15:00:00Z'), licao('2026-11-03T15:00:00Z')]))
      .toBe(XP_POR_VITORIA.licaoDeTrilha);
  });

  it('reprovar não rende, e a vitória depois rende uma vez', () => {
    expect(xpDasVitorias([
      ev('lesson_completed', '2026-11-01T15:00:00Z', { lessonCode: 'x', score: 2, total: 10 }),
      ev('lesson_completed', '2026-11-02T15:00:00Z', { lessonCode: 'x', score: 10, total: 10 }),
    ])).toBe(XP_POR_VITORIA.licaoDeTrilha);
  });

  /* A janela do ranking ("esta semana") conta a vitória na data da primeira
     vez: refazer hoje uma lição vencida no mês passado não a traz para a
     semana. */
  it('a vitória conta na data da primeira vez', () => {
    const eventos = [
      ev('lesson_completed', '2026-10-01T15:00:00Z', { lessonCode: 'x' }),
      ev('lesson_completed', '2026-11-10T15:00:00Z', { lessonCode: 'x' }),
    ];
    expect(xpDasVitorias(eventos, Date.parse('2026-11-05T00:00:00Z'))).toBe(0);
    expect(xpDasVitorias(eventos)).toBe(XP_POR_VITORIA.licaoDeTrilha);
  });

  it('distingue trilha, vereda e Mestrado pelo certificado', () => {
    expect(vitoriaDoEvento(ev('certification_issued', '2026-11-01T15:00:00Z', { specialtyCode: 'AP034' }))?.tipo).toBe('trilhaConcluida');
    expect(vitoriaDoEvento(ev('certification_issued', '2026-11-01T15:00:00Z', { specialtyCode: 'CC-ES001' }))?.tipo).toBe('veredaConcluida');
    expect(vitoriaDoEvento(ev('certification_issued', '2026-11-01T15:00:00Z', { specialtyCode: 'ME006' }))).toBeUndefined();
  });

  /* O certificado diz trilha ou vereda pelo prefixo do código — no TypeScript
     e no SQL. Uma vereda sem CC na frente renderia XP de especialidade. */
  it('toda vereda tem código CC, e nenhuma trilha tem', () => {
    for (const v of VEREDAS) expect(v.code.startsWith('CC'), v.code).toBe(true);
    for (const t of getAllSpecialties()) expect(t.code.startsWith('CC'), t.code).toBe(false);
  });

  it('o passo do meio do caminho não é vitória', () => {
    expect(vitoriaDoEvento(ev('mail_sent', '2026-11-01T15:00:00Z'))).toBeUndefined();
    expect(vitoriaDoEvento(ev('redacao_montada', '2026-11-01T15:00:00Z'))).toBeUndefined();
  });
});

/*
  As trilhas ficam com pelo menos três quartos do XP: a vereda é bônus.

  A soma das trilhas ainda não inclui as lições de teoria das trilhas
  anunciadas, que não foram escritas: quando forem, a parte delas só sobe. Por
  isso a conta de hoje é um piso.
*/
describe('o XP máximo', () => {
  it('as trilhas ficam com pelo menos 75% do total', () => {
    const { trilhas, total } = xpMaximo();
    expect(total, 'nada somado: a trava não conferiria nada').toBeGreaterThan(1000);
    expect(trilhas / total).toBeGreaterThanOrEqual(0.75);
  });
});

/*
  A conta existe duas vezes — aqui e no `leaderboard`, que roda no Postgres —
  e duas cópias divergem no primeiro ajuste: o clube veria um XP no ranking e
  outro no painel, para a mesma pessoa na mesma tarde.
*/
describe('o XP do ranking é a mesma conta', () => {
  const DIR = 'supabase/migrations';
  const ultima = readdirSync(DIR).filter(f => f.endsWith('.sql')).sort()
    .filter(f => /create or replace function public\.leaderboard/i.test(readFileSync(join(DIR, f), 'utf8'))).pop()!;
  const sql = readFileSync(join(DIR, ultima), 'utf8').replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const lateral = sql.slice(sql.indexOf('cross join lateral'), sql.indexOf(') xp'));

  it('lê a migration que redefine o leaderboard por último, e ela tem a conta', () => {
    expect(lateral.length, `${ultima} não tem a conta do XP`).toBeGreaterThan(200);
  });

  it('com os mesmos valores', () => {
    const v = XP_POR_VITORIA;
    expect(lateral).toContain(`when a.event_type = 'vereda_teoria' then ${v.teoriaDeVereda}`);
    expect(lateral).toContain(`when a.event_type = 'vereda_laboratorio' then ${v.laboratorioDeVereda}`);
    expect(lateral).toMatch(new RegExp(`like 'CC%' then ${v.veredaConcluida} else ${v.trilhaConcluida} end`));
    expect(lateral).toContain(`when a.event_type = 'final_exam_completed' then ${v.provaFinal}`);
    expect(lateral).toContain(`when a.event_type = 'lesson_completed' then ${v.licaoDeTrilha}`);
    expect(lateral).toMatch(new RegExp(`else ${v.laboratorioDeTrilha}\\s+end as valor`));
  });

  it('com o mesmo limiar de domínio', () => {
    expect(lateral).toContain(`* 100 >= ${LIMIAR_DOMINIO} * (a.metadata->>'total')::numeric`);
  });

  it('com a mesma lista de eventos', () => {
    const lista = lateral.slice(lateral.indexOf('and a.event_type in ('));
    const nomes = new Set([...lista.slice(0, lista.indexOf(')')).matchAll(/'([a-z_]+)'/g)].map(m => m[1]));
    expect([...nomes].sort()).toEqual([...EVENTOS_COM_XP].sort());
  });

  it('e o Mestrado oficial fica de fora nos dois', () => {
    expect(lateral).toContain("in ('', 'ME006') then null");
  });
});
