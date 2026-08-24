import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  Trava contra migration que o Postgres recusa antes de executar.

  A 20260821230000 abria `DO $$` e fechava com `END $;`. Postgres devolve
  "unterminated dollar-quoted string" e recusa o arquivo inteiro — nenhuma linha
  dele rodou. O erro passou porque nada entre escrever e publicar chega a ler o
  SQL: os testes olham o currículo em TypeScript, e `db push` só descobre no
  momento de aplicar.

  E descobrir na hora de aplicar é tarde. `supabase db push` seleciona pelas
  versões ausentes da tabela de histórico, aplicando uma por uma: um arquivo que
  não analisa interrompe a fila e deixa o banco pela metade, com as migrations
  seguintes sem chegar a ser lidas. Em banco novo — restauração, staging,
  projeto de reserva — é o que separa um deploy de um banco quebrado.

  Não é um analisador de SQL. É a pergunta que aquele erro responderia: todo
  delimitador que abre, fecha.
*/

const DIR = join(import.meta.dirname, '.');

const migrations = readdirSync(DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

/**
 * Onde as aspas em cifrão abrem e fecham, ignorando o que não é código.
 *
 * Precisa pular comentário e literal porque `$$` dentro deles não delimita
 * nada — e esta migration tem, no comentário que explica o próprio conserto.
 * Sem isso o teste acusaria justamente o arquivo já corrigido.
 */
function marcadoresEmAberto(sql: string): string[] {
  const pilha: string[] = [];
  let i = 0;

  while (i < sql.length) {
    const resto = sql.slice(i);

    // Dentro de um bloco aberto, só o mesmo marcador o encerra.
    if (pilha.length > 0) {
      const atual = pilha[pilha.length - 1];
      const fim = sql.indexOf(atual, i);
      if (fim === -1) return pilha;          // abriu e nunca fechou
      pilha.pop();
      i = fim + atual.length;
      continue;
    }

    if (resto.startsWith('--')) {
      const nl = sql.indexOf('\n', i);
      i = nl === -1 ? sql.length : nl + 1;
      continue;
    }
    if (resto.startsWith('/*')) {
      const fim = sql.indexOf('*/', i + 2);
      i = fim === -1 ? sql.length : fim + 2;
      continue;
    }
    if (resto.startsWith("'")) {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") { j += 2; continue; }   // '' é aspa escapada
          break;
        }
        j++;
      }
      i = j + 1;
      continue;
    }
    if (resto.startsWith('"')) {
      const fim = sql.indexOf('"', i + 1);
      i = fim === -1 ? sql.length : fim + 1;
      continue;
    }

    /* Marcador válido é `$$` ou `$nome$`. `$;` — o erro que motivou o arquivo —
       não casa, então o `$$` que abriu fica na pilha e o teste reprova. */
    const marcador = resto.match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
    if (marcador) {
      pilha.push(marcador[0]);
      i += marcador[0].length;
      continue;
    }

    i++;
  }

  return pilha;
}

describe('migrations', () => {
  it('existe pelo menos uma para conferir', () => {
    expect(migrations.length).toBeGreaterThan(0);
  });

  it.each(migrations)('%s fecha todos os blocos que abre', arquivo => {
    const abertos = marcadoresEmAberto(readFileSync(join(DIR, arquivo), 'utf8'));
    expect(
      abertos,
      `${arquivo} abre ${abertos.join(', ')} e não fecha. `
        + 'O Postgres recusa o arquivo inteiro, e o db push para aqui.',
    ).toEqual([]);
  });

  /*
    O nome ordena a fila de aplicação, então um timestamp repetido torna a
    ordem entre os dois indefinida — e migration é justamente o que não pode
    depender de ordem indefinida.
  */
  it('nenhuma versão repetida', () => {
    const versoes = migrations.map(f => f.split('_')[0]);
    const repetidas = versoes.filter((v, i) => versoes.indexOf(v) !== i);
    expect(repetidas, 'duas migrations com o mesmo timestamp').toEqual([]);
  });
});
