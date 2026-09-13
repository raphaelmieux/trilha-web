import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  O catálogo de insígnias como o banco fica depois de rodar todas as migrations.

  ── Por que ler as migrations, e não o banco ──────────────────────────────
  O `ci.yml` não fala com Postgres nenhum. O que dá para conferir sem subir
  banco é o texto das migrations, e o que ele precisa reproduzir é a ordem em
  que o Postgres as aplica: **por nome de arquivo, e o último a falar vence**.

  ── Por que ele mora aqui, e num arquivo só ───────────────────────────────
  Duas telas precisam desta leitura — `insignias.test.ts`, que compara o
  catálogo em TypeScript com o que o banco guarda, e `estante.test.ts`, que
  confere se toda insígnia semeada tem prateleira. Eram duas cópias do mesmo
  regex, e a segunda nasceu já diferente da primeira: **nenhuma das duas
  enxergava o `DELETE`**.

  Isso não reprovava nada enquanto as travas eram de mão única (o catálogo em
  código existe no banco?), porque as linhas apagadas simplesmente não eram
  procuradas. A estante inverteu a pergunta — toda linha do banco tem lugar? —
  e as duas insígnias aposentadas apareceram, pedindo prateleira para uma coisa
  que ninguém mais recebe.

  Mora em `supabase/migrations/` de propósito: é daqui que ele lê, e um leitor
  de migrations guardado em `src/lib` convidaria alguém a importá-lo da tela,
  onde `node:fs` não existe.
*/

const DIR = 'supabase/migrations';

export interface LinhaSemeada {
  name: string;
  description: string;
  icon: string;
  tier: string;
}

/*
  A tupla ocupa uma ou três linhas conforme o arquivo, então a captura
  atravessa quebra de linha; as aspas dobradas do SQL viram uma só.
*/
const TUPLA = /\( *'([a-z0-9_]+)' *,\s*'((?:[^']|'')*)' *,\s*'((?:[^']|'')*)' *,\s*'([a-z_]+)' *,\s*'([a-z_]+)'/g;

/* `DELETE FROM badges WHERE code IN ('a', 'b');` — a única forma que as
   migrations usam. Uma forma diferente passaria batida, e é por isso que
   `migrations.test.ts` cobra que todo DELETE em badges seja reconhecido aqui. */
const DELETE_POR_CODIGO = /DELETE\s+FROM\s+badges\s+WHERE\s+code\s+IN\s*\(([^)]*)\)/gi;

const semAspas = (s: string) => s.replace(/''/g, "'");

/**
 * As insígnias que existem no banco depois de todas as migrations.
 *
 * Aplica os `INSERT ... ON CONFLICT DO UPDATE` em ordem de arquivo, e então os
 * `DELETE` do mesmo arquivo — que é a ordem em que eles aparecem no SQL: a
 * migration que aposentou as duplicadas primeiro reconcede a insígnia de hoje
 * a quem tinha a de ontem, e só depois apaga a linha velha.
 */
export function catalogoSemeado(): Map<string, LinhaSemeada> {
  const linhas = new Map<string, LinhaSemeada>();
  for (const arquivo of readdirSync(DIR).filter(f => f.endsWith('.sql')).sort()) {
    const sql = readFileSync(join(DIR, arquivo), 'utf8');

    for (const bloco of sql.split(/INSERT INTO badges/i).slice(1)) {
      const valores = bloco.split(';')[0];
      for (const m of valores.matchAll(TUPLA)) {
        linhas.set(m[1], {
          name: semAspas(m[2]), description: semAspas(m[3]), icon: m[4], tier: m[5],
        });
      }
    }

    for (const m of sql.matchAll(DELETE_POR_CODIGO)) {
      for (const codigo of m[1].matchAll(/'([a-z0-9_]+)'/g)) linhas.delete(codigo[1]);
    }
  }
  return linhas;
}

/** Quantos `DELETE FROM badges` existem, e quantos esta leitura entendeu. */
export function deletesDeInsignia(): { total: number; entendidos: number } {
  let total = 0;
  let entendidos = 0;
  for (const arquivo of readdirSync(DIR).filter(f => f.endsWith('.sql'))) {
    const sql = readFileSync(join(DIR, arquivo), 'utf8');
    total += (sql.match(/DELETE\s+FROM\s+badges/gi) ?? []).length;
    entendidos += [...sql.matchAll(DELETE_POR_CODIGO)].length;
  }
  return { total, entendidos };
}
