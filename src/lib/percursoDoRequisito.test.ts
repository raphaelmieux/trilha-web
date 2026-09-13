import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

/*
  Toda chamada de `upsertRequirementProgress` diz em que percurso foi.

  ── Por que uma trava que lê o repositório ────────────────────────────────
  O parâmetro é opcional no tipo — precisa ser, para a assinatura não quebrar
  quem chamar de fora — e obrigatório na prática. Sem esta trava, o TypeScript
  aprova a chamada sem percurso e o resultado é exatamente a falha silenciosa
  que este parâmetro existe para acabar: a insígnia cai, a data é gravada, e o
  cartão dela diz "o percurso desta não ficou registrado" para sempre. Nada
  estoura. A pessoa só nota se olhar duas insígnias lado a lado e reparar que
  uma sabe de onde veio e a outra não.

  Vinte e sete chamadas espalhadas por vinte e cinco laboratórios e duas
  páginas: a vigésima oitava é escrita copiando uma das outras, e quem copia
  não lê a assinatura.

  É a mesma trava que `ofensiva.test.ts` já faz com `logActivity`, e pelo mesmo
  motivo: o que precisa valer em todo lugar se confere lendo todo lugar.
*/

function arquivosDeFonte(dir: string): string[] {
  return readdirSync(dir).flatMap(nome => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivosDeFonte(caminho);
    return /\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome) ? [caminho] : [];
  });
}

const RAIZ = resolve(__dirname, '..');
const CHAMADA = 'upsertRequirementProgress(';

/** Onde a chamada aberta em `inicio` fecha. */
function fimDaChamada(texto: string, inicio: number): number {
  let nivel = 0;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (c === '(' || c === '[' || c === '{') nivel++;
    else if (c === ')' || c === ']' || c === '}') {
      nivel--;
      if (nivel === 0) return i;
    }
  }
  return -1;
}

/** Toda chamada do repositório, com o arquivo, a linha e os argumentos. */
function chamadas(): { onde: string; argumentos: string }[] {
  const achadas: { onde: string; argumentos: string }[] = [];
  for (const arquivo of arquivosDeFonte(RAIZ)) {
    const fonte = readFileSync(arquivo, 'utf8');
    let pos = 0;
    for (;;) {
      const achou = fonte.indexOf(CHAMADA, pos);
      if (achou === -1) break;
      pos = achou + CHAMADA.length;
      /* A definição não é chamada: ela abre com `export async function`. */
      const antes = fonte.slice(Math.max(0, achou - 40), achou);
      if (/function\s+$/.test(antes)) continue;

      const abre = achou + CHAMADA.length - 1;
      const fecha = fimDaChamada(fonte, abre);
      if (fecha === -1) continue;
      const linha = fonte.slice(0, achou).split('\n').length;
      achadas.push({
        onde: `${relative(RAIZ, arquivo)}:${linha}`,
        argumentos: fonte.slice(abre + 1, fecha),
      });
    }
  }
  return achadas;
}

/** Os argumentos do topo, separados por vírgula fora de qualquer aninhamento. */
function argumentosDoTopo(texto: string): string[] {
  const partes: string[] = [];
  let nivel = 0;
  let atual = '';
  for (const c of texto) {
    if (c === '(' || c === '[' || c === '{') nivel++;
    if (c === ')' || c === ']' || c === '}') nivel--;
    if (c === ',' && nivel === 0) { partes.push(atual); atual = ''; continue; }
    atual += c;
  }
  if (atual.trim()) partes.push(atual);
  return partes.map(p => p.trim());
}

describe('o percurso do requisito', () => {
  /* Guarda contra o vazio: uma busca que não achasse nada deixaria a trava
     verde por não ter conferido nada — a armadilha do "zero link não é zero
     link quebrado" aplicada à própria trava. */
  it('acha as chamadas para conferir', () => {
    expect(chamadas().length).toBeGreaterThanOrEqual(25);
  });

  it('toda chamada passa o percurso', () => {
    const sem = chamadas()
      .filter(c => argumentosDoTopo(c.argumentos).length < 4)
      .map(c => c.onde);
    expect(sem,
      'estas chamadas não dizem em que trilha o requisito foi cumprido. A '
      + 'insígnia que cair nelas fica sem percurso para sempre, e o cartão '
      + 'dela vai dizer "não ficou registrado" sem que nada tenha falhado.',
    ).toEqual([]);
  });

  /*
    E o percurso é o código da trilha, não o do requisito nem o da lição.

    `getRequirementId` recebe o código do requisito — 'AP044-6.1' —, e ele fica
    na linha logo acima em toda chamada. Passar ele por engano daria um
    percurso que `getSpecialty` não acha, e o cartão calaria do mesmo jeito,
    só que sem ninguém desconfiar do porquê.
  */
  it('o percurso é a trilha, e não o requisito', () => {
    const suspeitas = chamadas()
      .map(c => ({ onde: c.onde, quarto: argumentosDoTopo(c.argumentos)[3] ?? '' }))
      .filter(c => !/^(specialtyCode|specialty\.code|especialidade\.code)$/.test(c.quarto));
    expect(suspeitas).toEqual([]);
  });
});
