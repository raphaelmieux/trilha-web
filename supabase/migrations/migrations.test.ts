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

/*
  Toda cláusula ON CONFLICT cita colunas que têm restrição UNIQUE.

  ── O erro que trouxe esta trava ─────────────────────────────────────────
  A migration da AP044 escreveu `ON CONFLICT (specialty_id, code)` para
  `requirements`. Quem tem a restrição composta é `modules`; `requirements` tem
  UNIQUE só em `code`. O Postgres recusa com "there is no unique or exclusion
  constraint matching the ON CONFLICT specification", e o corpo era um bloco DO
  inteiro — uma instrução só —, então nenhuma linha entrou e o `db push` parou
  ali.

  É a mesma família do delimitador errado que a trava de cima pega: erro que
  não aparece em lugar nenhum antes de o deploy correr, porque o `ci.yml` não
  fala com banco nenhum. E é pior num banco novo — restauração, staging —, onde
  o push para no arquivo e as migrations seguintes nem são lidas.

  A conferência é textual de propósito: ela lê as restrições UNIQUE declaradas
  nas próprias migrations, sem subir Postgres. Um `ALTER TABLE ... ADD
  CONSTRAINT ... UNIQUE (...)` posterior também conta, que é como uma coluna
  ganha restrição depois de a tabela existir.
*/

/** As colunas de cada UNIQUE declarado no repositório, por tabela. */
function unicasPorTabela(): Map<string, Set<string>> {
  const mapa = new Map<string, Set<string>>();
  const guardar = (tabela: string, colunas: string) => {
    const chave = colunas.split(',').map(c => c.trim().replace(/"/g, '')).sort().join(',');
    const atual = mapa.get(tabela.toLowerCase()) ?? new Set<string>();
    atual.add(chave);
    mapa.set(tabela.toLowerCase(), atual);
  };

  for (const arquivo of migrations) {
    const texto = readFileSync(join(DIR, arquivo), 'utf8');

    /* CREATE TABLE: pega a coluna com UNIQUE inline, a chave primária de uma
       coluna, e a restrição UNIQUE(...) / PRIMARY KEY (...) do corpo. */
    for (const bloco of texto.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([A-Za-z_][\w.]*)\s*\(([\s\S]*?)\n\);/gi)) {
      const tabela = bloco[1].split('.').pop()!;
      for (const linha of bloco[2].split('\n')) {
        const composta = linha.match(/^\s*(?:UNIQUE|PRIMARY KEY)\s*\(([^)]+)\)/i);
        if (composta) { guardar(tabela, composta[1]); continue; }
        const inline = linha.match(/^\s*([A-Za-z_]\w*)\s+[^,]*\b(?:UNIQUE|PRIMARY KEY)\b/i);
        if (inline) guardar(tabela, inline[1]);
      }
    }

    /* E as que chegaram depois, por ALTER TABLE. */
    for (const alter of texto.matchAll(/ALTER TABLE\s+(?:IF EXISTS\s+)?([A-Za-z_][\w.]*)[\s\S]{0,200}?ADD CONSTRAINT\s+\w+\s+UNIQUE\s*\(([^)]+)\)/gi)) {
      guardar(alter[1].split('.').pop()!, alter[2]);
    }
    for (const idx of texto.matchAll(/CREATE UNIQUE INDEX(?:\s+CONCURRENTLY)?(?:\s+IF NOT EXISTS)?\s+\w+\s+ON\s+([A-Za-z_][\w.]*)\s*\(([^)]+)\)/gi)) {
      guardar(idx[1].split('.').pop()!, idx[2]);
    }
  }
  return mapa;
}

/** Cada `INSERT INTO <tabela> ... ON CONFLICT (<colunas>)` do repositório. */
function conflitos(texto: string): { tabela: string; colunas: string }[] {
  const achados: { tabela: string; colunas: string }[] = [];
  for (const m of texto.matchAll(/INSERT INTO\s+([A-Za-z_][\w.]*)([\s\S]*?);/gi)) {
    const alvo = m[2].match(/ON CONFLICT\s*\(([^)]+)\)/i);
    if (alvo) achados.push({ tabela: m[1].split('.').pop()!.toLowerCase(), colunas: alvo[1] });
  }
  return achados;
}

describe('ON CONFLICT cita restrição que existe', () => {
  const unicas = unicasPorTabela();

  it('o schema declara as restrições que a conferência precisa ler', () => {
    /* Sem isto, um leitor que deixasse de achar as tabelas devolveria mapa
       vazio e a trava aprovaria tudo — a armadilha do "zero link não é zero
       link quebrado" aplicada à própria trava. */
    expect(unicas.get('requirements'), 'não li as restrições de requirements').toContain('code');
    expect(unicas.get('modules'), 'não li a restrição composta de modules').toContain('code,specialty_id');
  });

  it.each(migrations)('%s só usa ON CONFLICT com coluna única', arquivo => {
    const problemas: string[] = [];
    for (const { tabela, colunas } of conflitos(readFileSync(join(DIR, arquivo), 'utf8'))) {
      const chave = colunas.split(',').map(c => c.trim().replace(/"/g, '')).sort().join(',');
      const declaradas = unicas.get(tabela);
      /* Tabela que este repositório não cria — extensão, schema do Supabase —
         não tem como ser conferida aqui, e não é o que a trava persegue. */
      if (!declaradas) continue;
      if (!declaradas.has(chave)) {
        problemas.push(`${tabela} (${chave}) — o que existe: ${[...declaradas].join(' | ')}`);
      }
    }
    expect(
      problemas,
      `${arquivo} cita ON CONFLICT sem restrição correspondente: ${problemas.join('; ')}. `
        + 'O Postgres recusa a instrução inteira, e o db push para aqui.',
    ).toEqual([]);
  });
});
