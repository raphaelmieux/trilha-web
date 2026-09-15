import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss, { type Root, type AtRule } from 'postcss';
import tailwind from 'tailwindcss';

/*
  O fundo da plataforma é a única peça de tela que vive em dois arquivos.

  A marcação — cinco `div` vazias — está no `index.html`, porque o fundo é
  decoração do documento e não do aplicativo, e porque de lá ele é pintado no
  primeiro byte em vez de esperar o pacote de JavaScript. As regras estão no
  `src/index.css`, onde moram todas as regras. Nenhum dos dois arquivo sabe do
  outro, e é essa a fraqueza que este teste cobre: apagar a `div`, renomear uma
  classe ou tirar uma regra deixa a tela **preta**, que é uma cor que ninguém
  estranha. Não há erro, não há console, não há teste de componente que passe
  perto — o fundo não é um componente.

  O resto do arquivo cobre as quatro maneiras conhecidas de o fundo estragar
  outra coisa em silêncio:

  - subindo acima do `#root` e cobrindo o aplicativo inteiro;
  - saindo no papel, onde ele é um retângulo quase preto por cima da primeira
    página do que alguém quis imprimir;
  - clareando, e derrubando o texto abaixo de AA por trás do vidro do card;
  - deixando de parar para quem pediu menos movimento.

  A folha é lida **processada**, e não do arquivo de origem: quem decide o que
  o navegador faz é a folha publicada. É a mesma razão escrita em
  `seletorDeCores.test.ts`, e os dois testes olham para as duas pontas da mesma
  pilha de empilhamento.
*/

const RAIZ = resolve(__dirname, '../..');

/** Classes `moire*` que a marcação do `index.html` de fato usa. */
function classesDaMarcacao(): Set<string> {
  const html = readFileSync(resolve(RAIZ, 'index.html'), 'utf8');
  const classes = new Set<string>();
  for (const atributo of html.matchAll(/class="([^"]*)"/g)) {
    for (const nome of atributo[1].split(/\s+/)) {
      if (nome.startsWith('moire')) classes.add(nome);
    }
  }
  return classes;
}

/** Classes `moire*` que a folha publicada estiliza. */
function classesDaFolha(css: Root): Set<string> {
  const classes = new Set<string>();
  css.walkRules((regra) => {
    for (const achado of regra.selector.matchAll(/\.(moire[\w-]*)/g)) {
      classes.add(achado[1]);
    }
  });
  return classes;
}

/**
 * As at-rules que cercam uma regra, de dentro para fora, como `@media print`.
 *
 * O `parent` do postcss é tipado como o contêiner genérico, e não como a união
 * `Root | AtRule | Rule` — então a comparação com `'atrule'` não estreita
 * sozinha, e a subida precisa de um guarda escrito à mão.
 */
function ancestraisAtRule(regra: { parent?: unknown }): string[] {
  const ehAtRule = (no: unknown): no is AtRule =>
    !!no && (no as { type?: string }).type === 'atrule';

  const cercas: string[] = [];
  for (let no: unknown = regra.parent; ehAtRule(no); no = no.parent) {
    cercas.push(`@${no.name} ${no.params}`);
  }
  return cercas;
}

/**
 * As declarações que a folha dá a um seletor, juntando todas as regras que o
 * citam. `dentroDe` restringe às regras que estão sob uma `@media` cujos
 * parâmetros casem — é assim que se lê a regra de impressão sem confundi-la
 * com a de tela.
 *
 * Sem `dentroDe`, só valem as regras que não estão sob at-rule nenhuma. O `.card`
 * mostra por que: ele tem um segundo corpo dentro de um `@supports not
 * (backdrop-filter)`, opaco, para o navegador que não faz vidro. Juntar os dois
 * daria um card opaco com o alfa do translúcido — uma superfície que não existe
 * em navegador nenhum, e a conta de contraste descreveria uma tela imaginária.
 */
function declaracoes(css: Root, seletor: string, dentroDe?: RegExp): Record<string, string> {
  const saida: Record<string, string> = {};
  css.walkRules((regra) => {
    if (regra.selector.trim() !== seletor) return;

    const cercas = ancestraisAtRule(regra);

    const esperado = dentroDe
      ? cercas.length === 1 && /^@media /.test(cercas[0]) && dentroDe.test(cercas[0])
      : cercas.length === 0;
    if (!esperado) return;

    regra.walkDecls((d) => { saida[d.prop] = d.value; });
  });
  return saida;
}

/** O valor de uma custom property declarada no `:root`. */
function token(css: Root, nome: string): string {
  return declaracoes(css, ':root')[nome] ?? '';
}

type Cor = [number, number, number];

function corDe(valor: string): Cor {
  const hex = valor.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = valor.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!rgb) throw new Error(`cor que este teste não sabe ler: ${valor}`);
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
}

function alfaDe(valor: string): number {
  const rgba = valor.match(/rgba\(\s*[\d.]+[,\s]+[\d.]+[,\s]+[\d.]+[,\s/]+([\d.]+)\s*\)/i);
  return rgba ? Number(rgba[1]) : 1;
}

/** Luminância relativa, WCAG 2.1. */
function luminancia([r, g, b]: Cor): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function razao(a: Cor, b: Cor): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

/**
 * `frente` sobre `fundo`, alfa normal. Sem arredondar: o navegador compõe em
 * ponto flutuante e só quantiza no fim, e a superfície do card cai exatamente
 * em .5 — arredondar aqui escolheria um lado por conta própria e mudaria a
 * razão na segunda casa.
 */
function sobrepor(frente: Cor, alfa: number, fundo: Cor): Cor {
  return frente.map((c, i) => alfa * c + (1 - alfa) * fundo[i]) as Cor;
}

let css: Root;

beforeAll(async () => {
  const fonte = readFileSync(resolve(RAIZ, 'src/index.css'), 'utf8');
  const { css: saida } = await postcss([
    tailwind({ config: resolve(RAIZ, 'tailwind.config.js') }),
  ]).process(fonte, { from: resolve(RAIZ, 'src/index.css') });
  css = postcss.parse(saida);
});

describe('a marcação do fundo e a folha falam da mesma coisa', () => {
  it('toda camada escrita no index.html é estilizada, e toda regra tem camada', () => {
    const marcacao = classesDaMarcacao();
    const folha = classesDaFolha(css);

    // A guarda contra o vazio, que é a de sempre: dois conjuntos vazios são
    // iguais, e a build ficaria verde por não ter conferido nada — que é
    // exatamente o estado em que alguém apagou a `div` do `index.html`.
    expect(marcacao.size,
      'o `index.html` não tem camada `moire` nenhuma. Sem a marcação, as regras '
      + 'do `index.css` não vestem coisa alguma e toda tela da plataforma abre '
      + 'preta — sem erro em lugar nenhum.').toBeGreaterThan(0);
    expect(folha.size,
      'a folha publicada não tem regra `.moire` nenhuma.').toBeGreaterThan(0);

    expect([...marcacao].sort(),
      'marcação e folha divergiram: uma classe existe num lado e não no outro. '
      + 'A camada que sobrou some da tela sem reclamar.').toEqual([...folha].sort());
  });
});

describe('o fundo fica atrás do aplicativo', () => {
  it('`.moire` é fixo, cobre a tela e não recebe clique', () => {
    const moire = declaracoes(css, '.moire');
    expect(moire.position).toBe('fixed');
    expect(moire.inset).toBe('0');
    expect(moire['pointer-events'],
      'sem `pointer-events: none` o fundo engole o clique de toda a página.')
      .toBe('none');
  });

  it('o `multiply` das camadas fica isolado da página', () => {
    const moire = declaracoes(css, '.moire');
    const isolado = moire.isolation === 'isolate'
      || (moire.contain ?? '').split(/\s+/).some((v) => v === 'strict' || v === 'paint');

    expect(isolado,
      'sem isolamento, o `mix-blend-mode: multiply` das camadas multiplica '
      + 'contra o preto da página — e preto multiplica tudo em preto. O fundo '
      + 'inteiro apaga, e a tela volta a ser a preta de sempre.').toBe(true);
  });

  it('`.moire` fica abaixo do `#root`', () => {
    const fundo = Number(declaracoes(css, '.moire')['z-index']);
    const raiz = Number(declaracoes(css, '#root')['z-index']);

    expect(fundo).not.toBeNaN();
    expect(raiz).not.toBeNaN();
    expect(fundo,
      'o fundo subiu para cima do `#root` e cobre o aplicativo inteiro. Ele é '
      + '`pointer-events: none`, então a tela continua clicável às cegas: vê-se '
      + 'o moiré e clica-se no que está debaixo dele.').toBeLessThan(raiz);
  });
});

describe('o fundo é de tela, e não de papel', () => {
  it('a impressão esconde o fundo', () => {
    const naImpressao = declaracoes(css, '.moire', /\bprint\b/);

    expect(naImpressao.display,
      'o fundo não é escondido na impressão. Ele é `position: fixed` cobrindo o '
      + 'viewport, então sai no papel como um retângulo quase preto por cima da '
      + 'primeira página — gastando tinta para esconder o que se quis imprimir.')
      .toBe('none');
  });
});

describe('quem pediu menos movimento recebe o moiré parado', () => {
  it('a animação das camadas para, e o desenho fica', () => {
    const camada = declaracoes(css, '.moire__camada', /prefers-reduced-motion/);
    const segunda = declaracoes(css, '.moire__camada--b', /prefers-reduced-motion/);

    expect(camada.animation,
      'com `prefers-reduced-motion: reduce` as camadas continuam girando.')
      .toBe('none');
    expect(segunda.transform,
      'parada, a segunda camada precisa de uma defasagem escrita: sem ela as '
      + 'duas grades coincidem, o moiré some e o fundo vira um cinza liso.')
      .toMatch(/rotate\(/);
  });
});

describe('o texto sobrevive ao pixel mais claro que o fundo produz', () => {
  /*
    O card é translúcido, então a superfície em que o texto pousa é metade da
    cor dele mais metade do que passa por trás — e o que passa por trás é este
    fundo. O pixel mais claro que o fundo pode entregar decide a conta.

    Por cima da base só há camadas que escurecem: `multiply` nunca clareia, e a
    vinheta é um gradiente que vai de transparente a preto. A exceção é o
    granulado, que usa `screen` e clareia — hoje em opacidade zero, mas escrito
    para ser ligado um dia. A conta abaixo o inclui em vez de proibi-lo: ligar o
    granulado é legítimo, clareá-lo até o texto cair abaixo de AA não é.
  */
  const AA = 4.5;

  it('a base do moiré é opaca — é ela o piso da conta', () => {
    const base = declaracoes(css, '.moire__base');
    expect(alfaDe(base.background ?? base['background-color'] ?? ''),
      'a base do fundo ficou translúcida: o preto do `.moire` passa por baixo e '
      + 'a conta de contraste deste arquivo deixa de descrever a tela.').toBe(1);
  });

  it('nenhum nível de texto cai abaixo de AA sobre o card', () => {
    const base = corDe(declaracoes(css, '.moire__base').background);

    // O granulado usa `screen` contra ruído que chega ao branco: no limite ele
    // clareia a base em `opacidade × (255 − base)`.
    const grao = declaracoes(css, '.moire__grao');
    const opacidadeDoGrao = Number(grao.opacity ?? 0);
    const maisClaro = base.map((c) => c + opacidadeDoGrao * (255 - c)) as Cor;

    const card = declaracoes(css, '.card')['background-color'];
    const superficie = sobrepor(corDe(card), alfaDe(card), maisClaro);

    for (const nome of ['--color-text', '--color-text-soft', '--color-text-muted', '--color-text-dim']) {
      const medido = razao(corDe(token(css, nome)), superficie);
      expect(medido,
        `${nome} mede ${medido.toFixed(2)}:1 sobre `
        + `rgb(${superficie.map((c) => c.toFixed(1)).join(',')}), `
        + 'que é o card por cima do pixel mais claro do fundo. Abaixo de 4.5:1 a '
        + 'legenda some da tela de quem lê num monitor ruim — e nada nesta '
        + 'plataforma acusa isso, porque o texto continua lá.').toBeGreaterThanOrEqual(AA);
    }
  });

  it('os números escritos no comentário da escala são os números medidos', () => {
    /*
      A escala de texto declara a razão de cada nível ao lado da cor. Comentário
      que mente é pior do que comentário nenhum: quem for mexer numa cor lê o
      número, confia, e não refaz a conta. Aqui os dois lados são comparados.
    */
    const fonte = readFileSync(resolve(RAIZ, 'src/index.css'), 'utf8');
    const base = corDe(declaracoes(css, '.moire__base').background);
    const card = declaracoes(css, '.card')['background-color'];
    const superficie = sobrepor(corDe(card), alfaDe(card), base);

    const declarados = [...fonte.matchAll(
      /(--color-text[\w-]*)\s*:\s*(#[0-9a-fA-F]{6})\s*;\s*\/\*[^*]*?—\s*([\d.]+):1/g,
    )];

    expect(declarados.length,
      'nenhuma razão declarada foi encontrada na escala de texto — o formato do '
      + 'comentário mudou e esta trava parou de conferir qualquer coisa.')
      .toBeGreaterThanOrEqual(4);

    for (const [, nome, cor, escrito] of declarados) {
      const medido = razao(corDe(cor), superficie);
      expect(Math.abs(medido - Number(escrito)),
        `o comentário de ${nome} diz ${escrito}:1 e a medida dá `
        + `${medido.toFixed(2)}:1 sobre rgb(${superficie.map((c) => c.toFixed(1)).join(',')}).`)
        .toBeLessThan(0.1);
    }
  });
});
