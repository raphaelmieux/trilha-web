// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { DesenhoDoGrafico } from './excel';
import { type Bruto, mostrar, valorDaFormula } from './formulas';
import {
  pontosDaDispersao, pontosDoGrafico, vazia,
  type PontoDoGrafico, type PontoDeDispersao, type Planilha, type TipoDeGrafico,
} from './planilha';

/*
  O gráfico é um só, e é o que se confere aqui.

  ── O defeito que fez esta trava existir ─────────────────────────────────
  O desenho estava escrito **duas** vezes, e as duas cópias já tinham
  divergido — não era uma cópia a caminho, eram duas no repositório havia
  meses.

  A da CC-ES003 lia a faixa da planilha, mas só a pizza tinha ramo próprio:
  `linha` e `dispersão` caíam no ramo das colunas. Escolher "linha" desenhava
  barras. A da AP044 era pior de um jeito mais silencioso: a pizza era um
  `conic-gradient` de porcentagens fixas, escrito na folha, que desenhava a
  mesma figura para qualquer planilha — um gráfico que não vinha de dado
  nenhum e parecia um gráfico.

  Nada disso estoura. Um gráfico errado continua sendo um gráfico, e é essa a
  família inteira de defeitos que esta plataforma existe para nomear.

  O preço aparece na CC-ES009, cujo requisito 6 é exatamente "a pizza responde
  composição, as colunas respondem comparação e a linha responde evolução":
  com o desenho de antes, escolher a linha desenhava colunas, e a lição toda
  passava a medir ter clicado em Inserir.

  ── E a lista de laboratórios não é escrita à mão ────────────────────────
  Trava com lista escrita à mão para de conferir sozinha: o laboratório novo
  entra, ninguém o acrescenta, e a build segue verde conferindo os velhos —
  que é indistinguível de estar tudo certo. A lista sai do repositório.
*/

const PASTAS = ['src/labs', 'src/components'];

/*
 * O código, sem os comentários.
 *
 * A primeira versão desta trava leu a fonte crua e acusou
 * `PlanilhaAvancadaLab.tsx` de desenhar uma pizza por conta própria — porque o
 * comentário que **explica a remoção** do `conic-gradient` cita a palavra. É a
 * mesma família da trava do roteiro que acusou a plataforma de uma palavra que
 * quem a leu tinha escrito numa variável: o que se mede é o que o programa
 * faz, e não o que o arquivo diz sobre o que ele já fez.
 *
 * `vocabulario.test.ts` resolve isso lendo a árvore do TypeScript, onde
 * comentário não é nó e cai fora sozinho. Aqui basta menos, e o preço de
 * "basta menos" é a guarda logo abaixo.
 */
function semComentarios(fonte: string): string {
  let fora = '';
  let i = 0;
  let aspas: string | null = null;
  while (i < fonte.length) {
    const c = fonte[i];
    if (aspas) {
      fora += c;
      if (c === '\\') { fora += fonte[i + 1] ?? ''; i += 2; continue; }
      if (c === aspas) aspas = null;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { aspas = c; fora += c; i += 1; continue; }
    if (c === '/' && fonte[i + 1] === '*') {
      const fim = fonte.indexOf('*/', i + 2);
      i = fim === -1 ? fonte.length : fim + 2;
      continue;
    }
    if (c === '/' && fonte[i + 1] === '/') {
      const fim = fonte.indexOf('\n', i);
      i = fim === -1 ? fonte.length : fim;
      continue;
    }
    fora += c;
    i += 1;
  }
  return fora;
}

/** Todo módulo de tela que desenha gráfico, lido do repositório. */
function quemDesenhaGrafico(): string[] {
  const achados: string[] = [];
  for (const pasta of PASTAS) {
    for (const nome of readdirSync(pasta)) {
      if (!nome.endsWith('.tsx') || nome.includes('.test.')) continue;
      const fonte = readFileSync(join(pasta, nome), 'utf8');
      if (/\bDesenhoDoGrafico\b/.test(fonte) && nome !== 'excel.tsx') achados.push(join(pasta, nome));
    }
  }
  return achados.sort();
}

const PONTOS: PontoDoGrafico[] = [
  { rotulo: 'Falcão', valor: 12 },
  { rotulo: 'Águia', valor: 7 },
  { rotulo: 'Tucano', valor: 0 },
];

const desenhar = (tipo: TipoDeGrafico, pontos = PONTOS, eixo?: { minimo?: number; maximo?: number }) =>
  renderToStaticMarkup(<DesenhoDoGrafico tipo={tipo} pontos={pontos} eixo={eixo} />);

/* A nuvem da dispersão: y = 2x + 1, que dá reta exata e números redondos. */
const NUVEM: PontoDeDispersao[] = [
  { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }, { x: 4, y: 9 },
];

const dispersar = (pares = NUVEM, extra: { tendencia?: boolean; equacao?: boolean } = {}) =>
  renderToStaticMarkup(
    <DesenhoDoGrafico tipo="dispersao" pontos={[]} pares={pares} {...extra} />,
  );

/* Os círculos que o desenho pôs, na ordem em que saíram. */
const circulos = (svg: string) =>
  [...svg.matchAll(/<circle[^>]*cx="([-\d.]+)"[^>]*cy="([-\d.]+)"/g)]
    .map(m => `${Number(m[1]).toFixed(2)},${Number(m[2]).toFixed(2)}`);

describe('o desenho do gráfico mora num lugar só', () => {
  it('nenhuma tela desenha gráfico por conta própria', () => {
    const telas = quemDesenhaGrafico();
    /* A guarda contra o vazio de sempre: uma varredura que não achasse nada
       deixaria esta trava verde por não ter conferido nada, que é a armadilha
       do "zero link não é zero link quebrado" aplicada à própria trava. */
    expect(telas.length).toBeGreaterThanOrEqual(2);

    for (const tela of telas) {
      const codigo = semComentarios(readFileSync(tela, 'utf8'));
      /* A guarda do apagador: se ele engolisse o arquivo, esta trava aprovaria
         qualquer coisa calada. O nome que sobra é uma chamada de JSX, e não
         prosa — some junto com o código se o corte sair errado. É a mesma
         guarda que `marca.test.tsx` tem, pelo mesmo motivo. */
      expect(codigo, `${tela} — o apagador de comentários comeu o arquivo`)
        .toMatch(/<DesenhoDoGrafico/);

      /* Desenhar é chamar o componente de `excel.tsx`. Quem escrever de novo o
         `<polyline>`, o `<path>` de fatia ou o `conic-gradient` está abrindo a
         terceira cópia — e as duas anteriores levaram meses para aparecer. */
      expect(codigo, `${tela} desenha linha por conta própria`).not.toMatch(/<polyline/);
      expect(codigo, `${tela} desenha pizza por conta própria`).not.toMatch(/conic-gradient/);
      expect(codigo, `${tela} importa o desenho`).toMatch(/from '\.{1,2}\/(labs\/)?excel'/);
    }
  });
});

describe('cada tipo desenha a forma dele', () => {
  /* O defeito que esta trava pega é o ramo que falta: um `if` de pizza seguido
     de um `else` que desenha colunas aprova três dos quatro tipos, e o único
     sintoma é a linha saindo como barra — que continua parecendo um gráfico. */
  it('a linha liga os pontos e a coluna não', () => {
    expect(desenhar('linha')).toContain('<polyline');
    expect(desenhar('colunas')).not.toContain('<polyline');
    expect(desenhar('colunas')).toContain('<rect');
  });

  it('a dispersão marca os pontos sem ligá-los', () => {
    const d = dispersar();
    expect(circulos(d)).toHaveLength(NUVEM.length);
    /* Ligar a dispersão afirmaria uma sequência que ela não tem: é a diferença
       entre as duas, e desenhá-las igual apagaria a pergunta que separa uma da
       outra. */
    expect(d).not.toContain('<polyline');
  });

  /*
    ── O defeito que esta trava pega ──────────────────────────────────────

    A dispersão desenhava os pontos em posições **igualmente espaçadas pela
    ordem da linha**, com o rótulo da linha embaixo — um gráfico plausível que
    nunca lia a segunda variável. O sintoma é que ele **muda de forma quando
    alguém ordena a tabela**, e a dispersão de verdade é imune a isso: é a
    mesma nuvem em qualquer ordem, porque a posição de cada ponto sai do dado
    e não da linha em que ele está.

    Sem isto, o requisito 5.1 da CC-ES010 — "dispersão entre duas variáveis" —
    seria um tipo de gráfico que nunca lê a segunda.
  */
  it('põe o x de cada par no eixo horizontal, e não a posição da linha', () => {
    /* Espaçamento desigual: com o índice no lugar do x, os quatro pontos
       sairiam igualmente espaçados e este caso seria indistinguível do de
       cima. */
    const torta = [{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 10, y: 21 }, { x: 11, y: 23 }];
    const xs = circulos(dispersar(torta)).map(c => Number(c.split(',')[0]));
    const vaos = xs.slice(1).map((v, i) => v - xs[i]);
    /* O vão do meio é o maior de longe: de 2 a 10 são oito unidades, contra
       uma de cada lado. Com o índice, os três vãos seriam iguais. */
    expect(vaos[1]).toBeGreaterThan(vaos[0] * 5);
    expect(vaos[1]).toBeGreaterThan(vaos[2] * 5);
  });

  it('desenha a mesma nuvem em qualquer ordem das linhas', () => {
    const invertida = [...NUVEM].reverse();
    expect([...circulos(dispersar(invertida))].sort())
      .toEqual([...circulos(dispersar())].sort());
  });

  /*
    A linha de tendência é elemento do gráfico, e não um gráfico diferente:
    sem a caixa marcada ela não aparece, do mesmo jeito que no Excel. Uma
    dispersão que já viesse com a reta apagaria o gesto do requisito 5.3.
  */
  it('só traça a tendência quando pedem, e a equação é outra caixa', () => {
    /* O tracejado é o que marca a tendência: as duas linhas cheias são os
       eixos, e elas estão sempre lá. */
    expect(dispersar()).not.toContain('stroke-dasharray');
    const comReta = dispersar(NUVEM, { tendencia: true });
    expect(comReta).toContain('stroke-dasharray');
    /* Ver a reta e ler a equação dela são duas caixas no Excel, e quase todo
       mundo marca só a primeira. */
    expect(comReta).not.toContain('y = ');
    expect(dispersar(NUVEM, { tendencia: true, equacao: true })).toContain('y = 2x + 1');
  });

  /*
    A reta que a janela desenha e a que `formulas.ts` calcula são duas contas
    parecidas em arquivos diferentes — a janela não importa o motor do
    exercício. Duas contas parecidas discordam um dia, e aqui a divergência
    apareceria como uma reta desenhada por cima de uma equação que não é a
    dela. Então elas se conferem uma contra a outra.
  */
  it('a reta desenhada é a que a INCLINAÇÃO e a INTERCEPÇÃO devolvem', () => {
    /* Nuvem torta de propósito: com a reta exata os dois números são inteiros,
       e inteiro não distingue as duas contas de jeito nenhum. Aqui a
       inclinação é 2,2 e a intercepção é −0,5 — que de lambuja é o único caso
       em que o sinal do termo constante é o outro. */
    const torta: PontoDeDispersao[] = [
      { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 7 }, { x: 4, y: 8 },
    ];
    const linhas = [['x', 'y'], ...torta.map(p => [String(p.x), String(p.y)])];
    const grade: Bruto = (l, c) => linhas[l]?.[c] ?? '';
    const doMotor = (f: string) => Number(mostrar(valorDaFormula(grade, f)).replace(',', '.'));

    const svg = dispersar(torta, { tendencia: true, equacao: true });
    const m = /y = (-?[\d,]+)x ([+−]) ([\d,]+)/.exec(svg);
    expect(m).not.toBeNull();
    const desenhada = Number(m![1].replace(',', '.'));
    const constante = Number(m![3].replace(',', '.')) * (m![2] === '−' ? -1 : 1);

    /* Os dois lados se comparam como **número**, e não como texto: os dois
       formatadores são outros — o do eixo dá uma casa e o da célula dá duas —,
       e comparar as duas cadeias conferiria a formatação em vez da conta. A
       margem é a da casa decimal que o desenho mostra, e ela é muito mais
       estreita do que qualquer divergência de verdade entre as duas contas. */
    expect(desenhada).toBeCloseTo(doMotor('=INCLINAÇÃO(B2:B5;A2:A5)'), 1);
    expect(constante).toBeCloseTo(doMotor('=INTERCEPÇÃO(B2:B5;A2:A5)'), 1);
    /* E o sinal saiu negativo, que é o ramo que `textoDaEquacao` tem: escrever
       sempre `+` daria `y = 2,2x + -0,5`, que ninguém lê. */
    expect(m![2]).toBe('−');
  });

  /* Uma coluna x toda igual não tem reta: dividir por faixa zero desenharia
     uma reta vertical que não é o ajuste de nada. */
  it('não traça reta quando o x não varia', () => {
    const parada = [{ x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }];
    expect(dispersar(parada, { tendencia: true })).not.toContain('stroke-dasharray');
  });

  it('a pizza é fatia, e é uma por valor que ela mostra', () => {
    const d = desenhar('pizza');
    /* Uma fatia por ponto positivo — o Tucano, que é zero, não ocupa parte
       nenhuma do todo. Contar em vez de só procurar `<path>` é o que separa a
       pizza de verdade da que a AP044 desenhava: aquela tinha porcentagens
       fixas, então o desenho não mudava com o dado e um teste de presença a
       aprovaria. */
    expect([...d.matchAll(/<path /g)]).toHaveLength(2);
    expect([...desenhar('pizza', [...PONTOS, { rotulo: 'Arara', valor: 5 }]).matchAll(/<path /g)])
      .toHaveLength(3);
    expect(d).not.toContain('<polyline');
  });

  it('a categoria zerada continua na legenda da pizza', () => {
    /* Ela não tem fatia, e tem linha: a composição dela é de 0%, e sumir da
       tela afirmaria que a unidade não existe. É a mesma decisão da coluna de
       altura zero, um nível abaixo. */
    /* Procurar o nome no SVG inteiro passaria por acaso: ele também está na
       descrição, que lista todos os pontos. O que se mede é o `<text>` da
       legenda — foi a mutação que mostrou isso, sobrevivendo a esta linha. */
    const legenda = [...desenhar('pizza').matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map(m => m[1]);
    expect(legenda).toContain('Tucano');
  });

  it('a cor da legenda é a cor da fatia, com categoria zerada no meio', () => {
    /* Filtrar os zeros antes de indexar a cor faria a legenda e as fatias
       discordarem a partir da primeira categoria vazia — cada uma contando a
       partir de uma lista diferente. */
    const d = desenhar('pizza', [
      { rotulo: 'A', valor: 10 }, { rotulo: 'B', valor: 0 }, { rotulo: 'C', valor: 5 },
    ]);
    const corDaFatiaDeC = [...d.matchAll(/<path [^>]*fill="(#[0-9A-F]{6})"/g)].map(m => m[1])[1];
    const corNaLegendaDeC = [...d.matchAll(/<rect [^>]*fill="(#[0-9A-F]{6})"/g)].map(m => m[1])[2];
    expect(corDaFatiaDeC).toBe(corNaLegendaDeC);
  });
});

describe('a legenda da pizza', () => {
  it('nomeia todas as fatias, e não as cinco primeiras', () => {
    /* Ela era `slice(0, 5)`, e isso nunca apareceu enquanto a CC-ES003
       desenhava quatro categorias. Com os seis meses da AP044, a fatia maior
       — quase metade da pizza — ficava sem nome, e o gráfico continuava
       parecendo um gráfico. Foi o navegador que mostrou. */
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];
    const d = desenhar('pizza', meses.map((m, i) => ({ rotulo: m, valor: (i + 1) * 8 })));
    const legenda = [...d.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map(m => m[1]);
    for (const mes of meses) expect(legenda, `${mes} ficou sem nome`).toContain(mes);
  });

  it('cabe na caixa por mais categorias que tenha', () => {
    /* Encolher em vez de cortar tem o outro lado: a linha que desce sem piso
       sairia por baixo do desenho, e a legenda ficaria fora do quadro. */
    const muitos = Array.from({ length: 9 }, (_, i) => ({ rotulo: `U${i}`, valor: i + 1 }));
    const d = desenhar('pizza', muitos);
    const ys = [...d.matchAll(/<text [^>]*y="([\d.]+)"/g)].map(m => Number(m[1]));
    expect(Math.max(...ys)).toBeLessThanOrEqual(74);
  });
});

describe('o eixo', () => {
  it('começa em zero quando ninguém diz outra coisa', () => {
    expect(desenhar('colunas')).toContain('>0<');
  });

  /* O requisito 7 da CC-ES009. O eixo truncado não é um gráfico quebrado: é
     este gráfico desenhando certo um dado certo a partir de um começo que
     alguém escolheu, e a coluna de 7 encolhendo a quase nada ao lado da de 12
     é justamente o efeito que se aprende a apontar. */
  it('truncado, encurta as colunas sem mudar um número', () => {
    const inteiro = desenhar('colunas', [{ rotulo: 'A', valor: 12 }, { rotulo: 'B', valor: 11 }]);
    const cortado = desenhar('colunas', [{ rotulo: 'A', valor: 12 }, { rotulo: 'B', valor: 11 }], { minimo: 10 });
    const alturas = (svg: string) => [...svg.matchAll(/height="([\d.]+)"/g)].map(m => Number(m[1]));
    const [a1, b1] = alturas(inteiro);
    const [a2, b2] = alturas(cortado);
    /* Inteiro, as duas colunas são quase iguais — 11 e 12. Cortado em 10, a de
       11 vira metade da de 12, e o dado não mudou. */
    expect(b1 / a1).toBeGreaterThan(0.9);
    expect(b2 / a2).toBeLessThan(0.6);
  });

  it('diz onde começa a quem não vê o desenho', () => {
    /* Dizer só os valores esconderia de quem usa leitor de tela justamente o
       recurso que o requisito 7 manda apontar. O rótulo do eixo está na calha
       da esquerda para quem vê, e na descrição para quem não vê. */
    const d = desenhar('colunas', [{ rotulo: 'A', valor: 12 }], { minimo: 10 });
    expect(d).toMatch(/aria-label="[^"]*de 10 a /);
  });
});

describe('de onde saem os pontos', () => {
  const comFaixa = (linhas: (string | number)[][], ate = 1): Planilha => ({
    celulas: linhas.map(l => l.map(v => vazia(String(v)))),
    larguras: [], alturas: [], layout: 'nenhum',
    nome: 'Base', tabela: null, congeladas: 0, filtro: null, ordenacao: null,
    regras: [], resumo: null,
    grafico: {
      tipo: 'colunas', titulo: 'Inscritos por unidade', eixoX: 'Unidade', eixoY: 'Inscritos',
      faixa: { l1: 0, c1: 0, l2: linhas.length - 1, c2: ate },
    },
  });

  it('a linha com zero entra, e a sem rótulo não', () => {
    /* O código anterior exigia `valor > 0`, e com isso a unidade sem inscrito
       nenhum sumia do gráfico: um desenho em que a categoria vazia não aparece
       afirma que ela não existe. Linha sem rótulo continua fora, porque ela
       não tem o que dizer. */
    const p = comFaixa([['Falcão', 12], ['Tucano', 0], ['', 9]]);
    expect(pontosDoGrafico(p)).toEqual([
      { rotulo: 'Falcão', valor: 12 },
      { rotulo: 'Tucano', valor: 0 },
    ]);
  });

  it('o valor é o número mais à direita da faixa', () => {
    /* É como o Excel lê uma faixa cuja coluna do meio é texto — e é o que a
       CC-ES009 precisa, onde entre o rótulo e o número há a coluna da taxa. */
    const p = comFaixa([['Falcão', 'a pé', 12]], 2);
    expect(pontosDoGrafico(p)).toEqual([{ rotulo: 'Falcão', valor: 12 }]);
  });

  /*
    A dispersão lê as duas colunas como **medidas**, e é o que a separa das
    outras três: nelas a primeira coluna nomeia a categoria, nela a primeira
    coluna é o eixo horizontal. Sem isto, o requisito 5.1 da CC-ES010 —
    "dispersão entre duas variáveis" — seria um gráfico que nunca lê a segunda.
  */
  it('a dispersão lê as duas colunas como número, e não rótulo e valor', () => {
    /* A altura vai com vírgula, que é como esta planilha guarda decimal: com
       ponto ela é texto, e o par cairia inteiro — que é a regra logo abaixo
       funcionando, e não a leitura falhando. */
    const p = comFaixa([[13, '1,58'], [12, '1,51'], [14, '1,62']]);
    expect(pontosDaDispersao(p)).toEqual([
      { x: 13, y: 1.58 }, { x: 12, y: 1.51 }, { x: 14, y: 1.62 },
    ]);
    /* E a linha de cabeçalho, que é texto dos dois lados, não vira ponto. */
    expect(pontosDaDispersao(comFaixa([['Idade', 'Altura'], [13, '1,58']])))
      .toEqual([{ x: 13, y: 1.58 }]);
  });

  /*
    O par cai **inteiro** quando qualquer um dos dois lados não é número, que é
    a regra de `paresDe` em `formulas.ts` e pelo mesmo motivo: meio par
    guardado inventa um ponto. Substituir o lado que falta por zero é a forma
    que mais engana — ela não desalinha nada e planta um ponto em cima do eixo,
    que puxa a reta de tendência para baixo sem nada na tela explicando.
  */
  it('descarta o par inteiro, e não planta um zero no lugar que falta', () => {
    const p = comFaixa([[13, '1,58'], [12, ''], [14, '1,62']]);
    expect(pontosDaDispersao(p)).toEqual([{ x: 13, y: 1.58 }, { x: 14, y: 1.62 }]);
    expect(pontosDaDispersao(p).some(par => par.y === 0)).toBe(false);
  });
});

describe('o que não se desenha', () => {
  it('rótulo com zero continua no gráfico', () => {
    /* Descartar o zero faria a unidade sem inscrito nenhum sumir, e um gráfico
       em que a categoria vazia não aparece afirma que ela não existe. */
    expect(desenhar('colunas')).toContain('Tucano');
  });

  it('série vazia não desenha nada, em vez de desenhar uma caixa vazia', () => {
    expect(desenhar('colunas', [])).toBe('');
    expect(desenhar('pizza', [])).toBe('');
  });

  it('pizza de tudo zero não desenha fatia nenhuma', () => {
    /* Zero sobre zero seria divisão por zero, e o caminho SVG sairia com NaN —
       que o navegador ignora calado, deixando o quadro do gráfico em branco
       com cara de gráfico que ainda está carregando. */
    expect(desenhar('pizza', [{ rotulo: 'A', valor: 0 }])).toBe('');
  });
});
