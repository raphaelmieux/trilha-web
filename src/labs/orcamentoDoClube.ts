/**
 * Módulo 6 da CC-ES003 — o orçamento e o gráfico.
 *
 * Cobre os requisitos 5 (gráfico com título e eixos identificados, tipo
 * adequado ao dado, justificando a escolha) e 6 (orçamento de no mínimo três
 * meses, em que nenhum total seja digitado manualmente).
 *
 * ── A pergunta do gráfico é outra, e por isso a resposta é outra ─────────
 * A AP044 já ensina que o tipo sai da pergunta, e lá a pergunta é de
 * **evolução** — como a inscrição cresceu mês a mês —, que só a linha responde.
 * Repetir a mesma pergunta aqui mediria de novo o que já foi medido. A daqui é
 * de **composição**: para onde vai o dinheiro do acampamento. Composição é o
 * que a pizza responde, e a linha não: ligar Alimentação a Transporte com um
 * traço afirma que uma virou a outra.
 *
 * ── Nenhum total digitado, e a trava que de fato mede isso ───────────────
 * Conferir que o número está certo não mede nada: o número certo digitado está
 * certo. Conferir que a célula começa por `=` quase não mede: `=820+910+1180`
 * começa por igual, dá o número certo, e é o mesmo problema com um sinal na
 * frente — muda um gasto e o total não acompanha.
 *
 * O que mede é **mexer num gasto e olhar se o total andou**. A conferência faz
 * isso dentro dela e descarta a planilha alterada, pela mesma razão do módulo
 * 2: pedir que a mudança aconteça de verdade deixaria a tarefa verde num
 * orçamento alterado.
 */

import {
  type MetaDaPlanilha, abaDe, cadernoDoClube, CATEGORIAS, escritoEm, GASTOS,
  indiceDaAba, MESES, mostradoEm,
} from './cadernoDoClube';
import { type Caderno, type TipoDeGrafico } from './planilha';
import { ehFormula } from './formulas';

export const ABA = 'Orçamento';

export const LINHA_DO_CABECALHO = 1;
export const PRIMEIRA_LINHA = LINHA_DO_CABECALHO + 1;
export const ULTIMA_LINHA = PRIMEIRA_LINHA + CATEGORIAS.length - 1;
export const LINHA_DO_TOTAL = ULTIMA_LINHA + 1;
export const PRIMEIRA_COLUNA_DE_MES = 1;
export const COLUNA_DO_TOTAL = PRIMEIRA_COLUNA_DE_MES + MESES.length;

export const TOTAL_POR_CATEGORIA = GASTOS.map(g => g.reduce((s, n) => s + n, 0));
export const TOTAL_POR_MES = MESES.map((_, m) => GASTOS.reduce((s, g) => s + g[m], 0));
export const TOTAL_GERAL = TOTAL_POR_CATEGORIA.reduce((s, n) => s + n, 0);

/**
 * O tipo que a pergunta pede.
 *
 * A pergunta está escrita na lição — "para onde vai o dinheiro do
 * acampamento?" —, e é de composição. A pizza responde composição; a linha
 * afirmaria que Alimentação virou Transporte, e as colunas comparariam
 * grandezas que não competem entre si.
 */
export const TIPO_QUE_RESPONDE: TipoDeGrafico = 'pizza';

export const cadernoDoOrcamento = (): Caderno => cadernoDoClube(indiceDaAba(ABA));

/** Toda célula que é um total: as quatro da direita, as três de baixo e a do canto. */
const celulasDeTotal = () => [
  ...CATEGORIAS.map((_, i) => ({ l: PRIMEIRA_LINHA + i, c: COLUNA_DO_TOTAL, esperado: TOTAL_POR_CATEGORIA[i] })),
  ...MESES.map((_, m) => ({ l: LINHA_DO_TOTAL, c: PRIMEIRA_COLUNA_DE_MES + m, esperado: TOTAL_POR_MES[m] })),
  { l: LINHA_DO_TOTAL, c: COLUNA_DO_TOTAL, esperado: TOTAL_GERAL },
];

const certa = (cad: Caderno, l: number, c: number, esperado: number) => {
  const p = abaDe(cad, ABA);
  return ehFormula(escritoEm(p, l, c)) && mostradoEm(p, l, c) === String(esperado);
};

export const METAS_DO_ORCAMENTO: MetaDaPlanilha[] = [
  {
    id: 'porCategoria',
    titulo: 'Somar cada categoria nos três meses',
    detalhe: 'Na coluna Total, à direita, some os três meses de cada categoria. Quatro fórmulas — ou uma só, arrastada para baixo.',
    onde: `Na coluna ${'ABCDE'[COLUNA_DO_TOTAL]}, na primeira linha de categoria`,
    passos: [
      'Clique na célula de Total da primeira categoria.',
      'Escreva =SOMA( e selecione as três células de mês daquela linha.',
      'Feche o parêntese e aperte Enter.',
      'Arraste a alça do canto da célula até a última categoria: a fórmula anda com a linha.',
    ],
    feita: cad => CATEGORIAS.every((_, i) => certa(cad, PRIMEIRA_LINHA + i, COLUNA_DO_TOTAL, TOTAL_POR_CATEGORIA[i])),
  },
  {
    id: 'porMes',
    titulo: 'Somar cada mês',
    detalhe: 'Na linha Total, embaixo, some as categorias de cada mês. Três fórmulas — ou uma só, arrastada para o lado.',
    onde: 'Na linha Total, embaixo da primeira coluna de mês',
    passos: [
      'Clique na célula de Total embaixo do primeiro mês.',
      'Escreva =SOMA( e selecione as quatro células de categoria daquela coluna.',
      'Feche o parêntese e aperte Enter.',
      'Arraste a alça para a direita: agora quem anda é a coluna.',
    ],
    feita: cad => MESES.every((_, m) => certa(cad, LINHA_DO_TOTAL, PRIMEIRA_COLUNA_DE_MES + m, TOTAL_POR_MES[m])),
  },
  {
    id: 'geral',
    titulo: 'Fechar o total geral',
    detalhe: 'No canto, onde a linha de totais encontra a coluna de totais, escreva o total do acampamento inteiro. Some uma das duas faixas de totais, e não os doze gastos de novo.',
    onde: 'Na célula do canto inferior direito da tabela',
    passos: [
      'Clique na célula do canto — a última da linha Total.',
      'Escreva =SOMA( e selecione a coluna de totais por categoria.',
      'Feche o parêntese e aperte Enter.',
      'Confira somando a linha de totais por mês: os dois caminhos têm de dar o mesmo número. Se não derem, um dos dois pegou uma célula a mais ou a menos.',
    ],
    feita: cad => certa(cad, LINHA_DO_TOTAL, COLUNA_DO_TOTAL, TOTAL_GERAL),
  },
  {
    id: 'seguem',
    titulo: 'Nenhum total digitado à mão',
    detalhe: 'Mude qualquer gasto e repare que os totais daquela linha, daquela coluna e o geral mudam sozinhos. Esta tarefa fica verde quando os oito totais acompanham — e reprova um total escrito como =820+910+1180, que começa por igual e mesmo assim é um número parado.',
    onde: 'Em qualquer célula de gasto',
    passos: [
      'Clique numa célula de gasto e escreva outro número.',
      'Olhe para o total daquela categoria, para o daquele mês e para o geral: os três mudaram.',
      'Se algum não mudou, os números daquele total foram escritos dentro da fórmula em vez de virem das células.',
      'Devolva o gasto ao valor que era.',
    ],
    /*
      É esta que mede o requisito 6. As três acima passam com o número certo
      digitado dentro de uma soma — `=820+910+1180` começa por `=`, devolve o
      número certo, e não acompanha nada.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const antes = celulasDeTotal().map(t => mostradoEm(p, t.l, t.c));
      if (celulasDeTotal().some((t, i) => antes[i] !== String(t.esperado))) return false;

      const mexida = {
        ...p,
        celulas: p.celulas.map((linha, l) => linha.map((cel, c) => (
          l === PRIMEIRA_LINHA && c === PRIMEIRA_COLUNA_DE_MES
            ? { ...cel, texto: String(GASTOS[0][0] + 1000) }
            : cel))),
      };
      const afetados = celulasDeTotal().map((t, i) => ({ ...t, antes: antes[i] }))
        .filter(t => t.l === PRIMEIRA_LINHA || t.c === PRIMEIRA_COLUNA_DE_MES || (t.l === LINHA_DO_TOTAL && t.c === COLUNA_DO_TOTAL));
      return afetados.every(t => mostradoEm(mexida, t.l, t.c) !== t.antes);
    },
  },
  {
    id: 'grafico',
    titulo: 'Desenhar o gráfico que responde à pergunta',
    detalhe: 'A pergunta da liderança é: para onde vai o dinheiro do acampamento? Faça o gráfico que responde a ela, sobre a coluna de totais por categoria, com título e com os dois eixos identificados.',
    onde: 'Inserir › Gráficos',
    passos: [
      'Selecione a coluna das categorias e a coluna de totais, juntas.',
      'Na guia Inserir, escolha o tipo. A pergunta é de repartição: quanto cada categoria pesa no todo.',
      'Escreva um título que diga o que o gráfico mostra — e não "Gráfico 1".',
      'Identifique os dois eixos. Gráfico sem eixo identificado não afirma nada: os números podem ser reais, pessoas, ou qualquer coisa.',
      'Experimente o de linhas: ligar Alimentação a Transporte com um traço afirma que uma virou a outra, o que não quer dizer nada.',
    ],
    feita: cad => {
      const g = abaDe(cad, ABA).grafico;
      if (!g || g.tipo !== TIPO_QUE_RESPONDE) return false;
      const cobre = Math.min(g.faixa.l1, g.faixa.l2) <= PRIMEIRA_LINHA
        && Math.max(g.faixa.l1, g.faixa.l2) >= ULTIMA_LINHA;
      return cobre && g.titulo.trim() !== '' && g.eixoX.trim() !== '' && g.eixoY.trim() !== '';
    },
  },
];
