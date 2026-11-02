import { comCaixaRefeita, escalarPorIgual, recolorir, type Arte, type Caminho, type Forma, type Grupo, type Objeto, type Paleta, type Prancha, type Texto } from '../labs/design';
import { contornoDoPoligono } from '../labs/vetor';

/*
 * A marca das telas da CC-DG004: a da unidade Buriti.
 *
 * O laboratório constrói a da unidade Ipê, do conceito ao manual, e a teoria
 * que mostrasse a Ipê pronta — a paleta, o mínimo, as versões — estaria
 * escrevendo a resposta de cada lição. A Buriti percorre os mesmos passos com
 * outras formas, outras cores e outra letra: o gesto é o mesmo, a marca não.
 *
 * O leque é um polígono de pontas, e não uma elipse, para que o símbolo das
 * telas não se pareça com a copa da Ipê; o tronco continua sendo o detalhe
 * fino. Os números que a teoria cita saem daqui, e
 * `exemplosDaIdentidadeVisual.test.ts` os confere.
 */

export const NOME_DO_BURITI = 'Buriti';

export const VERDE_DO_LEQUE = '#3B6E2A';
export const TERRA = '#8C4A1E';
export const PAPEL = '#FBF6EC';
export const ESCURO = '#1E2622';
export const AREIA = '#C9B48A';
/** O laranja do fruto maduro: a cor mais lembrada do buriti, e a que não se lê no papel. */
export const LARANJA_DO_FRUTO = '#E8892B';
/** A camiseta da unidade, azul-marinho. */
export const MARINHO = '#1C2B4A';

export const PALETA_DO_BURITI: Paleta = { fundo: PAPEL, texto: ESCURO, destaque: VERDE_DO_LEQUE, apoio: TERRA, neutro: AREIA };
const SEM_PALETA: Paleta = { fundo: null, texto: null, destaque: null, apoio: null, neutro: null };

export const LEQUE = { largura: 130, altura: 64 };
export const TRONCO = { largura: 14, altura: 76 };
export const CORPO_DO_LOGOTIPO = 44;

/** As pontas do leque: um meio disco recortado em folhas, que é o desenho de uma palmeira de longe. */
function pontasDoLeque(x: number, y: number): { x: number; y: number }[] {
  const cx = x + LEQUE.largura / 2; const base = y + LEQUE.altura;
  const pts: { x: number; y: number }[] = [{ x, y: base }];
  const folhas = 8;
  for (let i = 0; i <= folhas * 2; i++) {
    const t = Math.PI - (i / (folhas * 2)) * Math.PI;
    const r = i % 2 === 0 ? 1 : 0.78;
    pts.push({
      x: Math.round((cx + Math.cos(t) * (LEQUE.largura / 2) * r) * 10) / 10,
      y: Math.round((base - Math.sin(t) * LEQUE.altura * r) * 10) / 10,
    });
  }
  pts.push({ x: x + LEQUE.largura, y: base });
  return pts;
}

const leque = (id: string, x: number, y: number, cor = VERDE_DO_LEQUE): Caminho =>
  comCaixaRefeita<Caminho>({
    id, nome: 'Leque', tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0,
    contornos: [contornoDoPoligono(pontasDoLeque(x, y))], preenchimento: cor, traco: null,
  });

const tronco = (id: string, x: number, y: number, cor = TERRA): Forma =>
  ({ id, nome: 'Tronco', tipo: 'retangulo', x, y, largura: TRONCO.largura, altura: TRONCO.altura, preenchimento: cor });

export const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura, familia: 'Arial', peso: 400, corpo: 16, entrelinha: 1.3,
  cor: ESCURO, alinhamento: 'esquerda', ...extra,
});

const logotipo = (id: string, x: number, y: number, extra: Partial<Texto> = {}): Texto =>
  texto(id, 'Logotipo', NOME_DO_BURITI, x, y, 170, { familia: 'Verdana', corpo: CORPO_DO_LOGOTIPO, peso: 700, cor: TERRA, entrelinha: 1.1, ...extra });

/** As três peças soltas, como saem do redesenho: ainda não são uma assinatura. */
export function pecasSoltas(x = 60, y = 120): Objeto[] {
  return [
    leque('buriti-leque', x, y),
    tronco('buriti-tronco', x + LEQUE.largura / 2 - TRONCO.largura / 2, y + LEQUE.altura - 4),
    logotipo('buriti-logotipo', x + LEQUE.largura + 16, y + 52),
  ];
}

/** A assinatura: símbolo à esquerda, logotipo à direita, num grupo só. */
export function assinaturaDoBuriti(prefixo = 'buriti', x = 60, y = 120): Grupo {
  return comCaixaRefeita<Grupo>({
    id: `${prefixo}-assinatura`, nome: 'Assinatura', tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0,
    filhos: [
      leque(`${prefixo}-leque`, x, y),
      tronco(`${prefixo}-tronco`, x + LEQUE.largura / 2 - TRONCO.largura / 2, y + LEQUE.altura - 4),
      logotipo(`${prefixo}-logotipo`, x + LEQUE.largura + 16, y + 52),
    ],
  });
}

/** A altura do símbolo, do topo do leque ao pé do tronco: é dela que sai a área de proteção. */
export const ALTURA_DO_SIMBOLO = LEQUE.altura - 4 + TRONCO.altura;
export const PROTECAO_DO_BURITI = 0.5;

const prancha = (id: string, nome: string, objetos: Objeto[], largura = 460, altura = 360, fundo = '#FFFFFF'): Prancha =>
  ({ id, nome, largura, altura, fundo, objetos });

const retangulo = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string, extra: Partial<Forma> = {}): Forma =>
  ({ id, nome, tipo: 'retangulo', x, y, largura: l, altura: a, preenchimento, ...extra });

/* ── Os arquivos das telas ──────────────────────────────────────────────── */

/** O símbolo redesenhado e o nome, ainda soltos. */
export const arteDasPecas = (): Arte => ({ pranchas: [prancha('pecas', 'Assinatura', pecasSoltas())], paleta: SEM_PALETA });

/** A assinatura pronta, colorida. */
export const arteDaAssinatura = (): Arte => ({ pranchas: [prancha('assinatura', 'Colorida', [assinaturaDoBuriti()])], paleta: SEM_PALETA });

/** A mesma, com a paleta escrita no documento e uma prancha de tipografia. */
export const arteDaPaletaDoBuriti = (): Arte => ({
  pranchas: [
    prancha('assinatura', 'Colorida', [assinaturaDoBuriti()]),
    prancha('tipografia', 'Tipografia', [
      texto('tipo-titulo', 'Exemplo de título', 'Acampamento de verão', 40, 70, 380, { familia: 'Verdana', peso: 700, corpo: 28, cor: TERRA }),
      texto('tipo-corpo', 'Exemplo de texto corrido',
        'A saída é às sete da manhã, em frente à igreja. Traga lanterna, cantil e o lenço da unidade.',
        40, 140, 380, { familia: 'Arial', corpo: 16, cor: ESCURO }),
    ]),
  ],
  paleta: PALETA_DO_BURITI,
});

/** A página do manual que desenha a área de proteção: a assinatura e um contorno em volta. */
export function arteDaProtecao(): Arte {
  const g = assinaturaDoBuriti('protecao', 120, 150);
  const m = ALTURA_DO_SIMBOLO * PROTECAO_DO_BURITI;
  const area = retangulo('protecao-area', 'Área de proteção', g.x - m, g.y - m, g.largura + 2 * m, g.altura + 2 * m, '#FFFFFF',
    { traco: { cor: '#C2410C', espessura: 2, extremidade: 'reta' } });
  return {
    pranchas: [prancha('protecao', 'Manual — 3', [
      texto('protecao-titulo', 'Título', 'Área de proteção', 40, 40, 400, { familia: 'Verdana', peso: 700, corpo: 22, cor: ESCURO }),
      area, g,
    ], 560, 460)],
    paleta: PALETA_DO_BURITI,
  };
}

/** As aplicações: a assinatura, e a camiseta azul-marinho ainda sem marca. */
export const arteDasAplicacoesDoBuriti = (): Arte => ({
  pranchas: [
    prancha('assinatura', 'Colorida', [assinaturaDoBuriti()]),
    prancha('camiseta', 'Camiseta', [
      texto('camiseta-legenda', 'Legenda', 'Estampa nas costas', 24, 640, 300, { cor: '#C9D3E6', corpo: 14 }),
    ], 600, 700, MARINHO),
  ],
  paleta: PALETA_DO_BURITI,
});

/** O manual de quatro páginas, já montado: é a tela que mostra o que ele tem. */
export function arteDoManualDoBuriti(): Arte {
  const pagina = (n: number, titulo: string, objetos: Objeto[], fundo = '#FFFFFF') =>
    prancha(`manual-${n}`, `Manual — ${n}`, [
      texto(`m${n}-titulo`, 'Título', titulo, 30, 30, 360, { familia: 'Verdana', peso: 700, corpo: 20, cor: ESCURO }),
      ...objetos,
    ], 420, 594, fundo);
  const versao = (prefixo: string, y: number, cor?: string) => {
    const g = escalarPorIgual(assinaturaDoBuriti(prefixo, 60, y), 0.8, { x: 60, y }) as Grupo;
    return cor ? recolorir(g, cor) : g;
  };
  return {
    pranchas: [
      pagina(1, 'As três versões', [
        texto('m1-r1', 'Rótulo', 'Colorida, sobre fundo claro', 30, 76, 360, { corpo: 13 }),
        versao('m1-colorida', 104),
        texto('m1-r2', 'Rótulo', 'Monocromática, numa cor só', 30, 236, 360, { corpo: 13 }),
        versao('m1-mono', 264, ESCURO),
        retangulo('m1-faixa', 'Fundo escuro', 0, 392, 420, 180, MARINHO),
        texto('m1-r3', 'Rótulo', 'Negativa, clara sobre o escuro', 30, 406, 360, { corpo: 13, cor: '#FFFFFF' }),
        versao('m1-negativa', 436, '#FFFFFF'),
      ]),
      pagina(2, 'Cores e letras', [
        ...[VERDE_DO_LEQUE, TERRA, PAPEL, ESCURO, AREIA].map((c, i) =>
          retangulo(`m2-cor-${i}`, `Cor ${c}`, 30 + i * 74, 90, 60, 60, c, { traco: { cor: '#999999', espessura: 1, extremidade: 'reta' } })),
        texto('m2-titulos', 'Títulos', 'Títulos: Verdana, negrito', 30, 190, 360, { corpo: 16, familia: 'Verdana', peso: 700 }),
        texto('m2-corpo', 'Texto corrido', 'Texto corrido: Arial, 12 a 16', 30, 220, 360, { corpo: 16 }),
      ]),
      pagina(3, 'Proteção e tamanho mínimo', [assinaturaDoBuriti('m3', 60, 120)]),
      pagina(4, 'Usos incorretos', [
        texto('m4-x1', 'Não', '✕ Não estique o símbolo', 30, 80, 360, { corpo: 14, cor: '#B91C1C', peso: 700 }),
        esticada(escalarPorIgual(assinaturaDoBuriti('m4-esticada', 0, 0), 0.8, { x: 0, y: 0 }) as Grupo, 60, 110),
        texto('m4-x2', 'Não', '✕ Não troque a cor', 30, 250, 360, { corpo: 14, cor: '#B91C1C', peso: 700 }),
        recolorir(escalarPorIgual(assinaturaDoBuriti('m4-cor', 60, 280), 0.8, { x: 60, y: 280 }), '#C2185B'),
        texto('m4-x3', 'Não', '✕ Não troque a letra', 30, 420, 360, { corpo: 14, cor: '#B91C1C', peso: 700 }),
        letraTrocada(escalarPorIgual(assinaturaDoBuriti('m4-letra', 60, 450), 0.8, { x: 60, y: 450 }) as Grupo),
      ]),
    ],
    paleta: PALETA_DO_BURITI,
  };
}

/* ── Os estragos do manual ──────────────────────────────────────────────── */

/** O símbolo puxado de lado: o leque e o tronco ficam mais largos, e o nome não. */
function esticada(g: Grupo, x: number, y: number): Grupo {
  const fator = 1.6;
  const filhos = g.filhos.map((o): Objeto => {
    if (o.tipo === 'caminho') {
      return comCaixaRefeita<Caminho>({ ...o, contornos: o.contornos.map(c => ({ ...c, nos: c.nos.map(n => ({ ...n, x: n.x * fator })) })) });
    }
    if (o.tipo === 'retangulo') return { ...o, x: o.x * fator, largura: o.largura * fator };
    if (o.tipo === 'texto') return { ...o, x: o.x + (fator - 1) * LEQUE.largura * 0.8 };
    return o;
  });
  const deslocado = filhos.map(o => ({ dx: x, dy: y, o }));
  return comCaixaRefeita<Grupo>({
    ...g,
    filhos: deslocado.map(({ dx, dy, o }) => (o.tipo === 'caminho'
      ? comCaixaRefeita<Caminho>({ ...o, contornos: o.contornos.map(c => ({ ...c, nos: c.nos.map(n => ({ ...n, x: n.x + dx, y: n.y + dy })) })) })
      : { ...o, x: o.x + dx, y: o.y + dy })),
  });
}

/** O logotipo noutra letra: o mesmo nome, e outra marca. */
const letraTrocada = (g: Grupo): Grupo =>
  comCaixaRefeita<Grupo>({ ...g, filhos: g.filhos.map(o => (o.tipo === 'texto' ? { ...o, familia: 'Times New Roman' as const, peso: 400 as const } : o)) });
