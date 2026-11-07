import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES013 Projeto de Dados, no Excel e na nuvem do laboratório, com a base do
 * tempo de tela e do sono — e não a chamada do semestre que as lições limpam.
 * O motivo está em `telaESono.ts`.
 */

const V = 'CC-ES013';
const L = 1280;
const A = 800;

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `sono-${cena}`, largura: L, altura: A, acoes });

const cel = (nome: string) => `[data-celula="${nome}"]`;
const coluna = (letra: string) => `th.pl-cab-col:text-is("${letra}")`;
const guia = (nome: string) => `.pl-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pl-bt[title="${dica}"]`;
const ABAS = '.pl-abas';
const BARRA = '[aria-label="Barra de fórmulas"]';
const STATUS = '.pl-status';
const DIALOGO = '.pl-dialogo';
const OK = `${DIALOGO} .pl-dialogo-bt-ok`;
const marcar = (texto: string) => `${DIALOGO} .pl-marcar:has-text("${texto}") input`;
const campo = (rotulo: string) => `${DIALOGO} [aria-label="${rotulo}"]`;
const GRAFICO = '.pl-grafico';

const escrever = (onde: string, texto: string): Acao[] =>
  [{ clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' }];
const preencherCampo = (rotulo: string, texto: string): Acao[] =>
  [{ clicar: campo(rotulo) }, { tecla: 'Control+a' }, { digitar: texto }];
const substituir = (de: string, para: string, inteira: boolean): Acao[] => [
  { clicar: botao('Localizar e Selecionar: Substituir') },
  ...preencherCampo('Localizar', de),
  ...preencherCampo('Substituir por', para),
  ...(inteira ? [{ clicar: marcar('célula inteira') }] : []),
];
const SUBSTITUIR_TUDO = `${DIALOGO} button:has-text("Substituir tudo")`;
const FECHAR = `${DIALOGO} button:has-text("Fechar")`;

/* As faixas da tratada: 62 respondentes, da linha 2 à 63. */
const FAIXA = (c: string, absoluta = false) =>
  (absoluta ? `Tratada!$${c}$2:$${c}$63` : `Tratada!${c}2:${c}63`);

export const ROTEIROS_DO_PROJETO_DE_DADOS: Roteiro[] = [
  /* ── Módulo 3 — a grafia, numa cópia ── */
  r('a-bruta-continua-bruta', 'bruta', [
    { clicar: botao('Formatar: Mover ou Copiar Planilha') },
    { clicar: marcar('Criar uma cópia') },
    { foto: true, destaque: [DIALOGO] },
    { clicar: OK },
    { foto: true, destaque: [ABAS] },
    { clicar: botao('Formatar: Renomear Planilha') },
    ...preencherCampo('Nome da planilha', 'Tratada'),
    { clicar: OK },
    { foto: true, destaque: [ABAS] },
  ]),
  r('a-mesma-coisa-um-jeito-so', 'copia', [
    { clicar: coluna('B') },
    ...substituir('jaguar', 'Jaguar', true),
    { foto: true, destaque: [DIALOGO, [cel('B6'), cel('B25')]] },
    { clicar: SUBSTITUIR_TUDO },
    { clicar: FECHAR },
    { foto: true, destaque: [cel('B6')] },
  ]),
  r('a-linha-repetida', 'grafia', [
    { clicar: guia('Dados') },
    { clicar: botao('Remover Duplicatas') },
    { foto: true, destaque: [DIALOGO, [cel('A15'), cel('F16')]] },
    { clicar: OK },
    { foto: true, destaque: [[cel('A15'), cel('F16')]] },
  ]),

  /* ── Módulo 4 — os números ── */
  r('numero-guardado-como-texto', 'grafia', [
    /* Só os números, da E2 à última linha: com a coluna inteira, tirar o "h"
       tira também o do cabeçalho, "Tela (h por dia)". */
    { clicar: cel('E2') },
    { clicar: cel('E64'), com: 'Shift' },
    { rolarAte: cel('A2') },
    { foto: true, destaque: [[cel('E4'), cel('E11')], STATUS] },
    ...substituir(' h', '', false), { clicar: SUBSTITUIR_TUDO }, { clicar: FECHAR },
    ...substituir('h', '', false), { clicar: SUBSTITUIR_TUDO }, { clicar: FECHAR },
    ...substituir('.', ',', false), { clicar: SUBSTITUIR_TUDO }, { clicar: FECHAR },
    { rolarAte: cel('A2') },
    { foto: true, destaque: [[cel('E4'), cel('E11')], STATUS] },
  ]),
  r('valor-impossivel', 'impossiveis', [
    { clicar: cel('E2') },
    { clicar: guia('Dados') },
    { clicar: botao('Classificar de Z a A') },
    { foto: true, destaque: [[cel('A2'), cel('F2')]] },
    { clicar: cel('C2') },
    { clicar: botao('Classificar de Z a A') },
    { foto: true, destaque: [[cel('A2'), cel('F2')]] },
  ]),

  /* ── Módulo 5 — as medidas ── */
  r('medidas-sobre-a-tratada', 'calculos', [
    ...escrever('B2', `=MÉDIA(${FAIXA('E')})`),
    ...escrever('B3', `=MED(${FAIXA('E')})`),
    ...escrever('B4', `=DESVPADP(${FAIXA('E')})`),
    ...escrever('B5', `=MÉDIA(${FAIXA('F')})`),
    ...escrever('B6', `=MED(${FAIXA('F')})`),
    ...escrever('B7', `=DESVPADP(${FAIXA('F')})`),
    { clicar: cel('B5') },
    { foto: true, destaque: [[cel('A2'), cel('B7')], BARRA] },
  ]),
  r('media-ou-mediana', 'calculos', [
    ...escrever('B2', `=MÉDIA(${FAIXA('E')})`),
    ...escrever('B3', `=MED(${FAIXA('E')})`),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('A2'), cel('B3')], BARRA] },
  ]),
  r('a-media-de-cada-grupo', 'grupos', [
    ...[2, 3, 4].flatMap(l => [
      ...escrever(`B${l}`, `=CONT.SE(${FAIXA('D', true)};A${l})`),
      ...escrever(`C${l}`, `=SOMASE(${FAIXA('D', true)};A${l};${FAIXA('E', true)})/B${l}`),
      ...escrever(`D${l}`, `=SOMASE(${FAIXA('D', true)};A${l};${FAIXA('F', true)})/B${l}`),
    ]),
    { clicar: cel('D2') },
    { foto: true, destaque: [[cel('A1'), cel('D4')], BARRA] },
  ]),

  /* ── Módulo 6 — a relação ── */
  r('a-dispersao-da-base-inteira', 'tratada', [
    { clicar: cel('E1') },
    { clicar: cel('F63'), com: 'Shift' },
    { clicar: guia('Inserir') },
    { clicar: botao('Inserir Gráfico com os dados selecionados') },
    { escolher: campo('Tipo'), valor: 'dispersao' },
    ...preencherCampo('Título', 'Quem usa mais tela dorme menos?'),
    ...preencherCampo('Eixo horizontal', 'Tela por dia (h)'),
    ...preencherCampo('Eixo vertical', 'Sono por noite (h)'),
    { foto: true, destaque: [DIALOGO] },
    { clicar: OK },
    { clicar: '[aria-label="Linha de Tendência"]' },
    { clicar: '[aria-label="Exibir Equação no gráfico"]' },
    { foto: true, destaque: [GRAFICO] },
  ]),

  /* ── Módulo 11 — a entrega ── */
  r('tres-entregaveis', 'entrega', [
    { clicar: '[aria-label="Mais ações de questionario_sono_2026 (1)"]' },
    { clicar: '.nv-item:has-text("Histórico de versões")' },
    { foto: true, destaque: ['.nv-caixa'] },
  ]),
  r('compartilhar-para-conferir', 'entrega', [
    { clicar: '[aria-label="Mais ações de Projeto de dados — tela e sono"]' },
    { clicar: '.nv-item:has-text("Compartilhar")' },
    { clicar: '.nv-caixa .nv-btn:has-text("Adicionar")' },
    { foto: true, destaque: ['.nv-caixa'] },
  ]),
];
