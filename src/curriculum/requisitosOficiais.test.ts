import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getAllSpecialties } from './index';

/*
  Os títulos dos requisitos são do documento oficial, e não texto de interface.

  Uma renomeação de módulos, feita por busca e substituição, acertou três linhas
  de requisito por engano: "E-mail" virou "Escrever e receber e-mail",
  "História da Internet" virou "De onde veio a internet", "Filipenses 4:8" virou
  "O filtro de Filipenses 4:8". Nada quebrou — nem o tipo, nem os testes, nem a
  tela. O que muda é o relatório entregue ao clube, que deixa de citar o
  requisito pelo nome que o documento usa, e é justamente ali que a coincidência
  entre os dois importa.

  O seed guarda os nomes como vieram do documento. A comparação abaixo é a
  memória disso.

  ── O que fica de fora, e por quê ────────────────────────────────────────
  A migration de 14/08 realinhou parte dos requisitos com os documentos e mudou
  títulos que o seed tinha errado. Ela usa UPDATE e tuplas em várias linhas, e um
  leitor improvisado para esse formato erraria — o que produziria falha falsa,
  pior do que não checar. Os códigos que ela toca ficam de fora, e o restante,
  que é a maioria, continua vigiado.
*/

const SEED = 'supabase/migrations/20260716163426_seed_curriculum.sql';
const REALINHAMENTO = 'supabase/migrations/20260814060000_align_requirements_with_official_documents.sql';

/** Só as tuplas de uma linha só: `(v_apXXX, 'CODE', 'TITULO', 'DESCRICAO', ...`. */
function requisitosDoSeed(): Map<string, string> {
  const sql = readFileSync(SEED, 'utf8');
  const achados = new Map<string, string>();
  for (const m of sql.matchAll(/\(v_ap\w+, '(AP\d{3}-[\d.]+)', '([^']+)', '([^']+)'/g)) {
    achados.set(m[1], m[2]);
  }
  return achados;
}

function codigosRealinhados(): Set<string> {
  const sql = readFileSync(REALINHAMENTO, 'utf8');
  return new Set([...sql.matchAll(/'(AP\d{3}-[\d.]+)'/g)].map(m => m[1]));
}

describe('os títulos dos requisitos não saem do documento oficial', () => {
  const doSeed = requisitosDoSeed();
  const realinhados = codigosRealinhados();
  const doCurriculo = new Map(
    getAllSpecialties().flatMap(s => s.requirements.map(r => [r.code, r.title] as const)),
  );

  it('o seed foi lido de verdade', () => {
    expect(doSeed.size).toBeGreaterThan(40);
  });

  it('cada requisito mantém o nome que o documento lhe deu', () => {
    const divergentes: string[] = [];
    for (const [code, tituloOficial] of doSeed) {
      if (realinhados.has(code)) continue;
      const noCurriculo = doCurriculo.get(code);
      if (noCurriculo === undefined) continue;   // requisito removido é outro assunto
      if (noCurriculo !== tituloOficial) {
        divergentes.push(`${code}: "${noCurriculo}" ≠ "${tituloOficial}"`);
      }
    }
    expect(divergentes, divergentes.join(' | ')).toEqual([]);
  });

  /* Um módulo e um requisito nomeiam coisas diferentes — o percurso e a
     exigência. Quando os dois textos coincidem, quase sempre é porque um deles
     foi escrito por cima do outro sem querer. */
  it('nenhum requisito repete o título de um módulo da mesma trilha', () => {
    const colisoes: string[] = [];
    for (const s of getAllSpecialties()) {
      const titulosDeModulo = new Set(s.modules.map(m => m.title));
      for (const r of s.requirements) {
        if (titulosDeModulo.has(r.title)) colisoes.push(`${s.code} ${r.code}: "${r.title}"`);
      }
    }
    expect(colisoes, colisoes.join(' | ')).toEqual([]);
  });
});
