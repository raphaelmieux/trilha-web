import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES010 Análise Estatística, na planilha do laboratório, com as inscrições
 * do Campori de Primavera — e não as do acampamento de inverno que as lições
 * analisam. O motivo está em `camporiDePrimavera.ts`.
 */

const V = 'CC-ES010';
const L = 1280;
const A = 800;

const r = (topico: string, cena: string, acoes: Acao[], altura = A): Roteiro =>
  ({ vereda: V, topico, cena: `estatistica-${cena}`, largura: L, altura, acoes });

const cel = (nome: string) => `[data-celula="${nome}"]`;
const guia = (nome: string) => `.pl-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pl-bt[title="${dica}"]`;
const aba = (nome: string) => `.pl-aba:text-is("${nome}")`;
const BARRA = '[aria-label="Barra de fórmulas"]';
const DIALOGO = '.pl-dialogo';
const OK = `${DIALOGO} .pl-dialogo-bt-ok`;
const campo = (rotulo: string, el: 'select' | 'input') => `${DIALOGO} .pl-campo:has(span:text-is("${rotulo}")) ${el}`;
const GRAFICO = '.pl-grafico';
const ELEMENTOS = '.pl-elementos';

/*
 * Dois cliques na borda da coluna A, para o rótulo caber — como no Excel. Sem
 * isto a coluna corta "Inclinação da reta" em "Inclinação da r", e a legenda
 * manda olhar uma linha que a foto não deixa ler.
 */
const ALARGAR_A: Acao = { clicar: 'th.pl-cab-col >> nth=0 >> .pl-alca-col', duplo: true };

const escrever = (onde: string, texto: string): Acao[] =>
  [{ clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' }];
const preencher = (rotulo: string, texto: string): Acao[] =>
  [{ clicar: campo(rotulo, 'input') }, { tecla: 'Control+a' }, { digitar: texto }];

/*
 * As quarenta e duas inscrições moram da linha 2 à 43 da aba Respostas: a
 * idade em F, a altura em G, as diárias em E e os acampamentos em J. A coluna
 * auxiliar, que a lição de exclusão monta, é a L.
 */
const R = (coluna: string) => `Respostas!${coluna}2:${coluna}43`;
const IDADE = R('F');
const ALTURA = R('G');
const ACAMPAMENTOS = R('J');
const DIARIAS = R('E');

/* A dispersão de idade × altura, como a lição do módulo 2 a pede. */
const inserirDispersao: Acao[] = [
  { clicar: cel('F1') },
  { clicar: cel('G43'), com: 'Shift' },
  { clicar: guia('Inserir') },
  { clicar: botao('Inserir Gráfico') },
  { escolher: campo('Tipo', 'select'), valor: 'dispersao' },
  ...preencher('Título', 'Quem é mais velho é mais alto?'),
  ...preencher('Eixo horizontal', 'Idade (anos)'),
  ...preencher('Eixo vertical', 'Altura (m)'),
];

export const ROTEIROS_DA_ESTATISTICA: Roteiro[] = [
  /* ── Módulo 2 — a correlação ── */
  r('a-dispersao', 'correlacao', [
    ...inserirDispersao,
    { foto: true, destaque: [DIALOGO] },
    { clicar: OK },
    { rolarAte: cel('A2') },
    { foto: true, destaque: [GRAFICO] },
  ]),
  r('o-coeficiente', 'correlacao', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=CORREL(${IDADE};${ALTURA})`),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A3'), cel('B3')], BARRA] },
  ]),

  /* ── Módulo 3 — não é causa ── */
  r('a-espuria-desta-base', 'pares', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=CORREL(${IDADE};${ALTURA})`),
    ...escrever('B4', `=CORREL(${IDADE};${ACAMPAMENTOS})`),
    ...escrever('B5', `=CORREL(${ALTURA};${ACAMPAMENTOS})`),
    { clicar: cel('B5') },
    { foto: true, destaque: [[cel('A3'), cel('B5')], BARRA] },
  ]),

  /* ── Módulo 4 — a reta ── */
  r('a-linha-de-tendencia', 'reta', [
    { clicar: '[aria-label="Linha de Tendência"]' },
    { foto: true, destaque: [ELEMENTOS] },
    { clicar: '[aria-label="Exibir Equação no gráfico"]' },
    { foto: true, destaque: [GRAFICO] },
  ]),
  r('a-equacao-e-a-ordem', 'reta', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=INCLINAÇÃO(${ALTURA};${IDADE})`),
    ...escrever('B4', `=INTERCEPÇÃO(${ALTURA};${IDADE})`),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A3'), cel('B4')], BARRA] },
  ]),

  /* ── Módulo 5 — prever ── */
  r('prever-com-a-equacao', 'prever', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=PREVISÃO(12;${ALTURA};${IDADE})`),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A3'), cel('B3')], BARRA] },
  ]),
  r('extrapolar', 'prever', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=PREVISÃO(12;${ALTURA};${IDADE})`),
    ...escrever('B4', `=PREVISÃO(22;${ALTURA};${IDADE})`),
    { clicar: cel('B4') },
    { foto: true, destaque: [[cel('A3'), cel('B4')], BARRA] },
  ]),

  /* ── Módulo 6 — o ajuste ── */
  r('o-r-quadrado', 'ajuste', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=RQUAD(${ALTURA};${IDADE})`),
    ...escrever('B4', `=RQUAD(${ACAMPAMENTOS};${IDADE})`),
    ...escrever('B5', `=RQUAD(${ACAMPAMENTOS};${ALTURA})`),
    { clicar: cel('B5') },
    { foto: true, destaque: [[cel('A3'), cel('B5')], BARRA] },
  ]),

  /* ── Módulo 7 — dado próprio ── */
  r('escolher-o-que-olhar', 'escolhido', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B3', `=CORREL(${IDADE};${DIARIAS})`),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A3'), cel('B3')], BARRA] },
  ]),

  /* ── Módulo 8 — sem os atípicos ── */
  r('excluir-sem-apagar', 'auxiliar', [
    { clicar: cel('F1') },
    { clicar: guia('Dados') },
    { clicar: botao('Filtro') },
    { clicar: `${cel('F1')} .pl-filtro-seta` },
    { clicar: '.pl-filtro-item:text-is("14")' },
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A3'), cel('B3')], BARRA] },
    { clicar: aba('Respostas') },
    { clicar: botao('Filtro') },
    { clicar: cel('L19') },
    { foto: true, destaque: [[cel('G18'), cel('L20')], BARRA] },
  ]),
  r('o-que-a-exclusao-faz', 'auxiliar', [
    { clicar: aba('Cálculos') },
    ALARGAR_A,
    ...escrever('B4', `=INCLINAÇÃO(${R('L')};${IDADE})`),
    ...escrever('B6', `=RQUAD(${R('L')};${IDADE})`),
    { clicar: cel('B6') },
    { foto: true, destaque: [[cel('A3'), cel('B6')], BARRA] },
  ]),

  /* ── Módulo 9 — o acaso ── */
  r('o-embaralho', 'acaso', [
    { clicar: 'button:has-text("Embaralhar 25 vezes")' },
    { clicar: 'button:has-text("Embaralhar 25 vezes")' },
    { foto: true, destaque: ['button:has-text("Embaralhar 25 vezes")'] },
  ], 250),
];
