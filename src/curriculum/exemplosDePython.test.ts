import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { VEREDAS } from './veredas';
import { mesmaSaida } from '../lib/pythonValidator';
import type { TopicoDeVereda } from './veredas';

/*
  A saída que a lição promete é a saída que o programa produz.

  ── Por que isto precisa rodar de verdade ────────────────────────────────
  Cada tópico de Python mostra, ao lado do código, o que ele escreve na tela —
  e é esse painel que a pessoa vai comparar com o próprio programa depois. Uma
  saída escrita à mão erra em silêncio: o exemplo continua bonito, o número está
  trocado, e quem confere o próprio trabalho contra ele conclui que **o seu**
  programa é que está errado.

  Escrever a saída de cabeça erra por pouco e com frequência. `10 / 3` não é
  3.33: é 3.3333333333333335. `print("a", 1)` põe um espaço, e `print("a" + "1")`
  não põe. `input()` escreve a pergunta na saída, e a resposta digitada não
  aparece. Nada disso se acerta de memória, e nada disso estoura.

  ── E roda no Python de verdade ──────────────────────────────────────────
  O mesmo CPython que o navegador carrega, pelo Pyodide, como já faz
  `pythonAnalise.test.ts`. Uma imitação em JavaScript acertaria os casos fáceis
  e erraria exatamente os que valem a pena conferir.
*/

interface Py {
  runPython: (c: string) => unknown;
  setStdin: (o: { stdin: () => string }) => void;
  setStdout: (o: { batched: (t: string) => void }) => void;
  setStderr: (o: { batched: (t: string) => void }) => void;
}

let py: Py;

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const dir = require.resolve('pyodide/package.json').replace(/package\.json$/, '');
  const { loadPyodide } = await import(`${dir}pyodide.mjs`);
  py = await loadPyodide({ indexURL: dir }) as Py;
}, 120000);

/** Roda o exemplo do jeito que o laboratório roda: entrada decidida antes. */
function rodar(codigo: string, entrada: string[]): { saida: string; erro: string | null } {
  let saida = '';
  let i = 0;
  py.setStdin({ stdin: () => (i < entrada.length ? entrada[i++] : '') });
  py.setStdout({ batched: t => { saida += `${t}\n`; } });
  py.setStderr({ batched: t => { saida += `${t}\n`; } });
  try {
    py.runPython(codigo);
    return { saida, erro: null };
  } catch (e) {
    return { saida, erro: String((e as Error)?.message ?? e) };
  }
}

const exemplosDePython = (): [string, TopicoDeVereda][] => VEREDAS
  .flatMap(v => v.modulos.flatMap(m => m.licoes).map(l => [v.code, l] as const))
  .flatMap(([code, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [code, t] as [string, TopicoDeVereda]) : []))
  .filter(([, t]) => t.exemploComo === 'python');

describe('os exemplos de Python das lições', () => {
  it('há exemplos para conferir', () => {
    expect(exemplosDePython().length).toBeGreaterThan(5);
  });

  /*
    Um exemplo que não compila desenha realce colorido e ensina uma sintaxe que
    o Python recusa. Vale mesmo para os tópicos que não declaram saída.
  */
  it('todo exemplo é Python que o interpretador aceita', () => {
    const quebrados: string[] = [];
    for (const [code, t] of exemplosDePython()) {
      const r = rodar(`compile(${JSON.stringify(t.exemplo)}, "licao", "exec")`, []);
      if (r.erro) quebrados.push(`${code}/${t.id}: ${r.erro.split('\n').pop()}`);
    }
    expect(quebrados).toEqual([]);
  });

  it('a saída declarada é a que o programa escreve', () => {
    const divergentes: string[] = [];
    for (const [code, t] of exemplosDePython()) {
      if (t.exemploSaida === undefined) continue;
      const r = rodar(t.exemplo, t.exemploEntrada ?? []);
      if (r.erro) {
        divergentes.push(`${code}/${t.id}: parou com erro — ${r.erro.split('\n').pop()}`);
        continue;
      }
      if (!mesmaSaida(r.saida, t.exemploSaida)) {
        divergentes.push(
          `${code}/${t.id}\n    prometido: ${JSON.stringify(t.exemploSaida)}\n    saiu:      ${JSON.stringify(r.saida.trimEnd())}`);
      }
    }
    expect(divergentes).toEqual([]);
  });

  /*
    Exemplo que lê e não recebe é exemplo que trava — ou, no Pyodide, que lê
    linha vazia e segue produzindo uma saída que não é a da lição. Declarar a
    entrada é o que torna a conferência acima honesta.
  */
  it('todo exemplo que pergunta declara o que foi digitado', () => {
    const sem = exemplosDePython()
      .filter(([, t]) => t.exemplo.includes('input(') && !(t.exemploEntrada ?? []).length)
      .map(([code, t]) => `${code}/${t.id}`);
    expect(sem).toEqual([]);
  });

  /* E o contrário: entrada declarada num exemplo que não pergunta nada é
     resquício de uma versão anterior, e ninguém repara nela. */
  it('nenhum exemplo declara entrada que não vai usar', () => {
    const sobrando = exemplosDePython()
      .filter(([, t]) => (t.exemploEntrada ?? []).length && !t.exemplo.includes('input('))
      .map(([code, t]) => `${code}/${t.id}`);
    expect(sobrando).toEqual([]);
  });
});
