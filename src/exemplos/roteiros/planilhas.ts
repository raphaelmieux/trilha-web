import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES003 Planilhas, no Excel do laboratório, com a pasta da excursão de
 * outubro — e não a do acampamento que as lições arrumam. O motivo está em
 * `excursaoDeOutubro.ts`.
 */

const V = 'CC-ES003';
const L = 1280;
const A = 800;

const cel = (nome: string) => `[data-celula="${nome}"]`;
const faixa = (de: string, ate: string) => [cel(de), cel(ate)];
const BARRA = '[aria-label="Barra de fórmulas"]';
const CAIXA_DE_NOME = '[aria-label="Caixa de nome"]';
const ALCA = '[aria-label="Alça de preenchimento"]';
const guia = (nome: string) => `.pl-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pl-bt[title="${dica}"]`;
const STATUS = '.pl-status';
/** O número de uma linha, no cabeçalho cinza da esquerda. */
const linhaDaGrade = (n: number) => `th.pl-cab-lin:text-is("${n}")`;

/** Escreve na célula e confirma, como quem digita direto nela. */
const escrever = (onde: string, texto: string): Acao[] => [
  { clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' },
];

/**
 * Arrasta a alça de preenchimento da célula ativa até `linhas` abaixo.
 *
 * O ponto se mede contra a **alça**, e não contra a célula: o canto da célula
 * fica por baixo dela, mas o navegador entrega o clique à célula, e aí o
 * arrasto vira seleção em vez de preenchimento. A alça tem 7 px e o centro
 * dela fica 23 px abaixo do topo da célula; a linha tem 24, e o fim do
 * arrasto cai no meio da célula de destino.
 */
const ALTURA_DA_LINHA = 24;
const arrastarAlca = (linhas: number): Acao =>
  ({ ponto: ALCA, em: [0.5, 0.5], ate: [0.5, 0.5 + (linhas * ALTURA_DA_LINHA - 11) / 7] });

const campoDoGrafico = (rotulo: string) => `.pl-dialogo .pl-campo:has-text("${rotulo}") input`;

/** Escolhe a tabela do "Para onde foi" e abre a caixa de Inserir Gráfico. */
const inserirGrafico = (tipo: string): Acao[] => [
  { clicar: cel('G2') },
  { clicar: cel('H6'), com: 'Shift' },
  { clicar: guia('Inserir') },
  { clicar: botao('Inserir Gráfico') },
  { escolher: '.pl-dialogo select', valor: tipo },
];

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena, largura: L, altura: A, acoes });

export const ROTEIROS_DE_PLANILHA: Roteiro[] = [
  r('celula-e-intervalo', 'excursao', [
    { clicar: cel('D3') },
    { clicar: cel('D12'), com: 'Shift' },
    { foto: true, destaque: [CAIXA_DE_NOME, faixa('D3', 'D12'), '[aria-label="Resumo da seleção"]'] },
  ]),
  r('tres-zonas', 'excursao', [
    { foto: true, destaque: [faixa('A2', 'D12'), faixa('F1', 'F6')] },
  ]),
  r('tamanho-e-alinhamento', 'excursao-nomes-cortados', [
    { foto: true, destaque: [faixa('A3', 'A12'), '.pl-cab-col:text-is("A") .pl-alca-col'] },
    { clicar: '.pl-cab-col:text-is("A") .pl-alca-col', duplo: true },
    { clicar: cel('C3') },
    { foto: true, destaque: [faixa('A3', 'A12'), faixa('C3', 'D12')] },
  ]),
  r('formula', 'excursao-lanche', [
    { clicar: cel('C4') },
    { foto: true, destaque: [BARRA, cel('C4')] },
    ...escrever('B1', '20'),
    { foto: true, destaque: [cel('B1'), faixa('C4', 'C13')] },
  ]),
  r('funcao', 'excursao', [
    ...escrever('G3', '=MÉDIA(C3:C12)'),
    ...escrever('G4', '=MÁXIMO(C3:C12)'),
    ...escrever('G5', '=MÍNIMO(C3:C12)'),
    { clicar: cel('G3') },
    { foto: true, destaque: [BARRA, faixa('G3', 'G5')] },
  ]),
  r('as-duas-contagens', 'excursao-conferir', [
    { clicar: cel('G1') },
    { foto: true, destaque: [BARRA, faixa('F1', 'G2'), cel('D4')] },
  ]),
  r('referencia-relativa', 'excursao-lanche-vazio', [
    ...escrever('C4', '=B4*B$1'),
    { clicar: cel('C4') },
    { foto: true, destaque: [BARRA, ALCA] },
    arrastarAlca(9),
    { clicar: cel('C9') },
    { foto: true, destaque: [BARRA, faixa('C4', 'C13')] },
  ]),
  r('referencia-absoluta', 'excursao-lanche-vazio', [
    ...escrever('C4', '=B4*B1'),
    { clicar: cel('C4') },
    arrastarAlca(9),
    { clicar: cel('C6') },
    { foto: true, destaque: [BARRA, faixa('C4', 'C13')] },
    { clicar: cel('C4') },
    { tecla: 'F2' },
    { tecla: 'F4' },
    { tecla: 'F4' },
    { foto: true, destaque: [BARRA] },
  ]),
  r('funcao-condicional', 'excursao-onibus', [
    { clicar: cel('E2') },
    { foto: true, destaque: [BARRA, faixa('E2', 'E11')] },
  ]),
  r('funcao-de-procura', 'excursao-onibus', [
    { clicar: cel('D2') },
    { foto: true, destaque: [BARRA, faixa('G2', 'H7'), cel('D2')] },
  ]),
  r('quarto-argumento', 'excursao-onibus-aproximado', [
    { clicar: cel('D2') },
    { foto: true, destaque: [BARRA, cel('D2'), cel('D3'), faixa('G2', 'H2')] },
  ]),
  r('formatacao-condicional', 'excursao', [
    { clicar: cel('C3') },
    { clicar: cel('C12'), com: 'Shift' },
    { clicar: botao('Formatação Condicional › Realçar Regras das Células') },
    { digitar: '3' },
    { foto: true, destaque: ['.pl-dialogo'] },
    { clicar: '.pl-dialogo-bt-ok' },
    { clicar: cel('A1') },
    { foto: true, destaque: [faixa('C3', 'C12')] },
  ]),
  r('filtro-e-ordenacao', 'excursao', [
    { clicar: cel('B3') },
    { clicar: guia('Dados') },
    { clicar: botao('Filtro') },
    { clicar: '[aria-label="Filtrar a coluna B"]' },
    { foto: true, destaque: [botao('Filtro'), '.pl-filtro-lista'] },
    { clicar: '.pl-filtro-item:text-is("Tucano")' },
    { foto: true, destaque: [[linhaDaGrade(3), linhaDaGrade(13)], `${STATUS} span:has-text("Filtro:")`] },
  ]),
  r('congelar', 'excursao-chamada', [
    { clicar: cel('A3') },
    { clicar: guia('Exibir') },
    { foto: true, destaque: [cel('A3'), botao('Congelar Painéis')] },
    { clicar: botao('Congelar Painéis') },
    { rolarAte: cel('A40') },
    { foto: true, destaque: [faixa('A1', 'C2')] },
  ]),
  r('orcamento', 'excursao-orcamento', [
    { clicar: cel('E7') },
    { foto: true, destaque: [BARRA, faixa('B7', 'E7'), faixa('E3', 'E6')] },
  ]),
  r('tipo-de-grafico', 'excursao-orcamento', [
    ...inserirGrafico('pizza'),
    { foto: true, destaque: ['.pl-dialogo select', '.pl-dialogo .pl-nota'] },
  ]),
  r('titulo-e-eixos', 'excursao-orcamento', [
    ...inserirGrafico('colunas'),
    { clicar: '.pl-dialogo-bt-ok' },
    { foto: true, destaque: ['.pl-grafico-titulo', '.pl-grafico-eixo'] },
    ...inserirGrafico('colunas'),
    { clicar: campoDoGrafico('Título do gráfico') }, { digitar: 'Quanto custou cada parte da excursão' },
    { clicar: campoDoGrafico('Nome do eixo horizontal') }, { digitar: 'Categoria' },
    { clicar: campoDoGrafico('Nome do eixo vertical') }, { digitar: 'Reais gastos' },
    { clicar: '.pl-dialogo-bt-ok' },
    { foto: true, destaque: ['.pl-grafico-titulo', '.pl-grafico-eixo'] },
  ]),
  r('tres-defeitos', 'excursao-conferir', [
    { clicar: cel('D4') },
    { foto: true, destaque: [BARRA, cel('D4')] },
    { clicar: cel('D14') },
    { foto: true, destaque: [BARRA, cel('D14')] },
    { clicar: cel('C15') },
    { foto: true, destaque: [BARRA, cel('C15')] },
  ]),
];
