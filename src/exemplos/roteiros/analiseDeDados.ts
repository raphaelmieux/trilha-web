import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES009 Análise de Dados, na planilha do laboratório, com as inscrições do
 * Campori de Primavera — e não as do acampamento de inverno que as lições
 * analisam. O motivo está em `camporiDePrimavera.ts`.
 */

const V = 'CC-ES009';
const L = 1280;
const A = 800;

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `campori-${cena}`, largura: L, altura: A, acoes });

const cel = (nome: string) => `[data-celula="${nome}"]`;
const guia = (nome: string) => `.pl-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pl-bt[title="${dica}"]`;
const aba = (nome: string) => `.pl-aba:text-is("${nome}")`;
const BARRA = '[aria-label="Barra de fórmulas"]';
const STATUS = '.pl-status';
const DIALOGO = '.pl-dialogo';
const OK = `${DIALOGO} .pl-dialogo-bt-ok`;
const campo = (rotulo: string, el: 'select' | 'input') => `${DIALOGO} .pl-campo:has(span:text-is("${rotulo}")) ${el}`;
const GRAFICO = '.pl-grafico';

const escrever = (onde: string, texto: string): Acao[] =>
  [{ clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' }];
const preencher = (rotulo: string, texto: string): Acao[] =>
  [{ clicar: campo(rotulo, 'input') }, { tecla: 'Control+a' }, { digitar: texto }];

/* As quarenta e duas inscrições moram da linha 2 à 43 da aba Respostas. */
const R = (coluna: string, absoluta = false) =>
  (absoluta ? `Respostas!$${coluna}$2:$${coluna}$43` : `Respostas!${coluna}2:${coluna}43`);
const LINHAS_DAS_UNIDADES = [3, 4, 5, 6, 7, 8];

const inserirGrafico = (de: string, ate: string, tipo: string, titulo: string, x: string, y: string): Acao[] => [
  { clicar: cel(de) },
  { clicar: cel(ate), com: 'Shift' },
  { clicar: guia('Inserir') },
  { clicar: botao('Inserir Gráfico') },
  { escolher: campo('Tipo', 'select'), valor: tipo },
  ...preencher('Título do gráfico', titulo),
  ...preencher('Nome do eixo horizontal', x),
  ...preencher('Nome do eixo vertical', y),
];

export const ROTEIROS_DA_ANALISE: Roteiro[] = [
  /* ── Módulo 2 — o centro ── */
  r('media-mediana-moda', 'centro', [
    { clicar: aba('Cálculos') },
    ...escrever('B3', `=MÉDIA(${R('F')})`),
    ...escrever('B4', `=MED(${R('F')})`),
    ...escrever('B5', `=MODO(${R('F')})`),
    { clicar: cel('B5') },
    { foto: true, destaque: [[cel('A3'), cel('B5')], BARRA] },
  ]),
  r('amplitude-e-desvio', 'medidas', [
    { clicar: aba('Cálculos') },
    { clicar: cel('D7') },
    { foto: true, destaque: [[cel('A2'), cel('D7')], BARRA] },
  ]),
  r('a-moda-nao-avisa', 'medidas', [
    { clicar: aba('Cálculos') },
    { clicar: cel('C5') },
    { foto: true, destaque: [[cel('B5'), cel('C5')], BARRA] },
    { clicar: aba('Respostas') },
    { clicar: cel('G1') },
    { clicar: guia('Dados') },
    { clicar: botao('Filtro') },
    { clicar: `${cel('G1')} .pl-filtro-seta` },
    { clicar: '.pl-filtro-item:text-is("1,45")' },
    { clicar: cel('G1') },
    { foto: true, destaque: [cel('G1'), STATUS] },
  ]),

  /* ── Módulo 3 — onde a média engana ── */
  r('a-media-e-a-ponta', 'centro', [
    { clicar: cel('J2') },
    { clicar: guia('Dados') },
    { clicar: botao('Classificar de Z a A') },
    { foto: true, destaque: [[cel('B2'), cel('B3')], [cel('J2'), cel('J3')]] },
  ]),
  r('a-razao-entre-as-duas', 'medidas', [
    { clicar: aba('Cálculos') },
    ...escrever('B11', '=B3/B4'),
    ...escrever('C11', '=C3/C4'),
    ...escrever('D11', '=D3/D4'),
    { clicar: cel('D11') },
    { foto: true, destaque: [[cel('A3'), cel('D4')], [cel('A11'), cel('D11')], BARRA] },
  ]),

  /* ── Módulo 4 — as frequências ── */
  r('frequencia-absoluta-relativa-acumulada', 'frequencias', [
    { clicar: aba('Cálculos') },
    ...LINHAS_DAS_UNIDADES.flatMap(l => [
      ...escrever(`B${l}`, `=CONT.SE(${R('C', true)};A${l})`),
      ...escrever(`C${l}`, `=B${l}/42`),
      ...escrever(`D${l}`, l === 3 ? '=B3' : `=D${l - 1}+B${l}`),
    ]),
    { clicar: cel('D8') },
    { foto: true, destaque: [[cel('A2'), cel('D8')], BARRA] },
  ]),

  /* ── Módulo 5 — os grupos ── */
  r('comparar-grupos', 'comparacao', [
    { clicar: aba('Cálculos') },
    ...LINHAS_DAS_UNIDADES.flatMap(l => [
      ...escrever(`B${l}`, `=CONT.SE(${R('C', true)};A${l})`),
      ...escrever(`C${l}`, `=SOMASE(${R('C', true)};A${l};${R('J', true)})/B${l}`),
    ]),
    { clicar: cel('C7') },
    { foto: true, destaque: [[cel('A2'), cel('C8')], BARRA] },
  ]),
  r('o-resumo-e-uma-segunda-leitura', 'comparacao', [
    { clicar: guia('Inserir') },
    { clicar: botao('Tabela dinâmica') },
    { escolher: campo('Linhas', 'select'), valor: '2' },
    { escolher: campo('Valores', 'select'), valor: '9' },
    { escolher: campo('Resumir por', 'select'), valor: 'media' },
    { foto: true, destaque: [DIALOGO] },
  ]),

  /* ── Módulo 6 — a adesão ── */
  r('taxa-e-uma-divisao', 'adesao', [
    { clicar: aba('Cálculos') },
    ...LINHAS_DAS_UNIDADES.flatMap(l => [
      ...escrever(`B${l}`, `=PROCV(A${l};Unidades!$A$2:$B$7;2;FALSO)`),
      ...escrever(`C${l}`, `=CONT.SE(${R('C', true)};A${l})`),
      ...escrever(`D${l}`, `=B${l}-C${l}`),
      ...escrever(`E${l}`, `=C${l}/B${l}`),
    ]),
    { clicar: cel('E3') },
    { foto: true, destaque: [[cel('A2'), cel('E8')], BARRA] },
  ]),

  /* ── Módulo 8 — os gráficos ── */
  r('tres-perguntas-tres-desenhos', 'graficos', [
    { clicar: aba('Composição') },
    ...inserirGrafico('A1', 'B7', 'pizza', 'De que unidades o campori é feito?', 'Unidade', 'Inscritos'),
    { foto: true, destaque: [DIALOGO] },
    { clicar: OK },
    { foto: true, destaque: [GRAFICO] },
  ]),
  r('o-eixo-tem-nome', 'graficos', [
    { clicar: aba('Comparação') },
    ...inserirGrafico('A1', 'B7', 'colunas', 'Qual unidade já foi a mais acampamentos?',
      'Unidade', 'Média de acampamentos por desbravador'),
    { clicar: OK },
    { foto: true, destaque: [GRAFICO] },
  ]),
];
