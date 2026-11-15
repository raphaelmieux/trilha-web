import { describe, it, expect, vi, beforeEach } from 'vitest';

/*
  O lote de insígnias novas mistura duas formas de linha: a curiosidade leva
  `awarded_at` (a data em que foi alcançada), o resto não. Num lote, o
  supabase-js manda a união das chaves em `columns`, e a chave que falta numa
  linha vira `NULL` explícito — a menos que se peça `missing=default`.
  `awarded_at` é NOT NULL, então o lote inteiro era recusado: uma curiosidade
  pendente bastava para nenhuma insígnia entrar, e o pin do laboratório
  "Relatório com referências" ficou a giz depois da entrega, sem erro na tela.

  O banco de mentira daqui faz o que o PostgREST faz com essa união, e recusa
  como o Postgres recusa. Conferir só o texto da chamada deixaria passar a
  próxima forma de mandar a mesma coisa.
*/

type Linha = Record<string, unknown>;
type Opcoes = { onConflict?: string; ignoreDuplicates?: boolean; defaultToNull?: boolean };

const banco = vi.hoisted(() => ({
  gravadas: [] as Record<string, unknown>[],
}));

const CATALOGO = [
  { id: 'b-lab', code: 'lab_relatorio_de_pesquisa', name: 'Relatório com referências', description: '', icon: 'lab', tier: 'pioneiro' },
  { id: 'b-cur', code: 'conferido', name: 'Conferido', description: '', icon: 'theory', tier: 'companheiro' },
];

const EVENTOS = [
  { event_type: 'text_submitted', created_at: '2026-11-15T23:19:19Z', curriculum_version: null,
    metadata: { specialtyCode: 'AP045', lessonCode: 'AP045.5-L4' } },
  { event_type: 'token_verificado', created_at: '2026-11-15T23:23:12Z', curriculum_version: null, metadata: {} },
];

function consulta(data: unknown) {
  const q: Record<string, unknown> = {};
  for (const k of ['select', 'eq', 'order', 'limit', 'in']) q[k] = () => q;
  q.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data, error: null }).then(ok);
  return q;
}

/* O que o PostgREST faz com um lote: a união das chaves vira as colunas, e a
   que falta numa linha é NULL — ou o DEFAULT, com `missing=default`. */
function upsert(linhas: Linha[], opcoes: Opcoes) {
  const colunas = [...new Set(linhas.flatMap(l => Object.keys(l)))];
  const resolvidas = linhas.map(l => {
    const r: Record<string, unknown> = {};
    for (const c of colunas) {
      if (c in l) r[c] = l[c];
      else if (opcoes.defaultToNull === false) continue;
      else r[c] = null;
    }
    return r;
  });
  const nula = resolvidas.find(r => 'awarded_at' in r && r.awarded_at === null);
  const resultado = nula
    ? { data: null, error: { code: '23502', message: 'null value in column "awarded_at" violates not-null constraint' } }
    : (banco.gravadas.push(...resolvidas), { data: resolvidas.map(r => ({ badge_id: r.badge_id })), error: null });
  return { select: async () => resultado };
}

vi.mock('./supabase', () => ({
  supabase: {
    from: (tabela: string) => {
      if (tabela === 'badges') return consulta(CATALOGO);
      if (tabela === 'user_badges') return { ...consulta([]), upsert };
      if (tabela === 'activity_events') return consulta(EVENTOS);
      return consulta([]);
    },
  },
}));

const { evaluateBadges } = await import('./gamification');

describe('a gravação de um lote misto de insígnias', () => {
  beforeEach(() => { banco.gravadas = []; });

  it('grava o laboratório junto com a curiosidade, em vez de recusar os dois', async () => {
    const novas = await evaluateBadges('u1');
    const codigos = novas.map(n => n.code).sort();
    expect(codigos).toEqual(['conferido', 'lab_relatorio_de_pesquisa']);
    expect(banco.gravadas).toHaveLength(2);
  });

  it('dá à curiosidade a data em que foi alcançada, e deixa o resto para o banco', async () => {
    await evaluateBadges('u1');
    const porId = new Map(banco.gravadas.map(g => [g.badge_id, g]));
    expect(porId.get('b-cur')?.awarded_at).toBe('2026-11-15T23:23:12Z');
    expect('awarded_at' in (porId.get('b-lab') ?? {})).toBe(false);
  });
});
