import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/*
  O que o laboratório põe no painel de tarefas tem de ser legível ali.

  `acoes` é escrito pelo laboratório e desenhado pela moldura em **duas**
  superfícies: o painel lateral do computador, que é branco como o do Word, e a
  bolha do celular, que é escura. As classes de botão da plataforma foram
  medidas contra o aplicativo escuro — `--color-text-soft` é 8.9:1 lá e 1.7:1 no
  branco, e `--color-bg-hover` é branco a 9%, que sobre branco não é nada.

  O resultado era "Recomeçar" quase invisível em cinco laboratórios, sem erro
  nenhum em lugar nenhum — e "Recomeçar" é a saída de quem estragou o exercício.
  A moldura passou a dizer a cor da própria superfície, em `CSS_DA_MOLDURA`.

  Este teste refaz a conta sobre as folhas de verdade: para cada classe de botão
  que algum laboratório entrega em `acoes`, resolve o fundo e a letra — pelos
  tokens do `:root`, com o que a moldura sobrepõe — e exige 4.5:1 no papel
  branco do painel.
*/

const RAIZ = resolve(__dirname, '../..');
const CSS = readFileSync(resolve(RAIZ, 'src/index.css'), 'utf8');
const MOLDURA = readFileSync(resolve(RAIZ, 'src/components/LaboratorioEmTelaCheia.tsx'), 'utf8');

/** O papel do painel lateral, escrito na própria moldura. */
const PAPEL: [number, number, number] = [255, 255, 255];

type Cor = { rgb: [number, number, number]; a: number };

function lerCor(txt: string): Cor | null {
  const v = txt.trim();
  if (v === 'transparent') return { rgb: [0, 0, 0], a: 0 };
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) return {
    rgb: [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16)) as [number, number, number], a: 1,
  };
  const f = v.match(/^rgba?\(([^)]+)\)$/);
  if (f) {
    const n = f[1].split(',').map(x => Number(x.trim()));
    return { rgb: [n[0], n[1], n[2]], a: n.length > 3 ? n[3] : 1 };
  }
  return null;
}

/** Os tokens do `:root`, para resolver `var(--x)`. */
const TOKENS: Record<string, string> = Object.fromEntries(
  [...CSS.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]),
);

const resolver = (valor: string | undefined): Cor | null => {
  if (!valor) return null;
  const v = valor.match(/var\((--[\w-]+)\)/);
  return lerCor(v ? (TOKENS[v[1]] ?? '') : valor);
};

/** As declarações de uma regra, pelo seletor exato. */
function regra(css: string, seletor: string): Record<string, string> {
  const esc = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(^|[};])\\s*${esc}\\s*\\{([^}]*)\\}`, 'm'));
  if (!m) return {};
  return Object.fromEntries(
    [...m[2].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(d => [d[1], d[2].trim()]),
  );
}

const sobre = (f: Cor, fundo: [number, number, number]): [number, number, number] =>
  f.rgb.map((c, i) => c * f.a + fundo[i] * (1 - f.a)) as [number, number, number];

const canal = (c: number) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]: [number, number, number]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const razao = (a: [number, number, number], b: [number, number, number]) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/* A folha que a moldura injeta — é ela que veste o painel branco. */
const CSS_DA_MOLDURA = MOLDURA.match(/export const CSS_DA_MOLDURA = `([\s\S]*?)`;/)?.[1] ?? '';

/** As classes de botão que cada laboratório entrega em `acoes`. */
function classesEmAcoes(): Map<string, string[]> {
  const achado = new Map<string, string[]>();
  const pastas = ['src/labs', 'src/components'];
  for (const pasta of pastas) {
    for (const arq of readdirSync(resolve(RAIZ, pasta)).filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))) {
      const txt = readFileSync(resolve(RAIZ, pasta, arq), 'utf8');
      const i = txt.indexOf('const acoes = (');
      if (i < 0) continue;
      /* Até o fechamento no mesmo recuo — é como o arquivo escreve o bloco. */
      const fim = txt.indexOf('\n  );', i);
      const bloco = txt.slice(i, fim < 0 ? txt.length : fim);
      const classes = [...new Set([...bloco.matchAll(/\bbtn-[a-z]+/g)].map(m => m[0]))];
      if (classes.length) achado.set(`${pasta}/${arq}`, classes);
    }
  }
  return achado;
}

describe('o que o laboratório põe no painel de tarefas se lê no papel branco', () => {
  const emAcoes = classesEmAcoes();

  /* Comparação que o vazio satisfaz não é comparação: se o reconhecimento do
     bloco `acoes` quebrar, o teste passaria sem examinar nada. */
  it('acha os botões que os laboratórios entregam à moldura', () => {
    expect(emAcoes.size).toBeGreaterThanOrEqual(5);
    expect([...emAcoes.values()].flat()).toContain('btn-secondary');
  });

  it('toda classe de botão usada em `acoes` existe na folha', () => {
    for (const [arq, classes] of emAcoes) {
      for (const c of classes) {
        expect(Object.keys(regra(CSS, `.${c}`)).length,
          `${arq} usa .${c} em acoes, e essa classe não está definida em index.css — ` +
          'o botão sai como texto solto, sem área de clique').toBeGreaterThan(0);
      }
    }
  });

  it('todas passam de 4.5:1 sobre o papel do painel', () => {
    for (const [arq, classes] of emAcoes) {
      for (const c of classes) {
        const base = regra(CSS, `.${c}`);
        const claro = regra(CSS_DA_MOLDURA, `.lab-painel-claro .${c}`);

        const fundoCor = resolver(claro['background'] ?? claro['background-color'] ?? base['background-color']);
        const fundo = fundoCor ? sobre(fundoCor, PAPEL) : PAPEL;
        const letraCor = resolver(claro['color'] ?? base['color']);
        expect(letraCor, `${arq}: .${c} não declara cor de letra`).toBeTruthy();

        const r = razao(sobre(letraCor!, fundo), fundo);
        expect(r, `${arq}: .${c} sai a ${r.toFixed(2)}:1 no painel branco da moldura. `
          + 'As cores da plataforma foram medidas contra o aplicativo escuro; '
          + 'quem veste a superfície clara é `CSS_DA_MOLDURA`.').toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
