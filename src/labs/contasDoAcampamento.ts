/**
 * Módulo 2 da CC-ES003 — fórmula e função.
 *
 * Cobre os requisitos 2.2 (definir fórmula e função) e 4.2 (soma, média,
 * máximo, mínimo e contagem).
 *
 * ── A zona de cálculos volta a ter o total ───────────────────────────────
 * O módulo 1 tirou do bloco de dados um total digitado à mão. Aqui ele volta
 * onde é o lugar dele, e volta calculado: é a diferença que o requisito 2.2
 * nomeia. Um número digitado está certo hoje e some no dia em que alguém
 * mudar uma diária; uma fórmula guarda a **conta**, e a conta se refaz.
 *
 * ── Por que nenhuma tarefa confere o texto da fórmula ────────────────────
 * Elas conferem duas coisas juntas: que a função certa foi usada, e que o
 * resultado na tela é o certo. Conferir só o texto deixaria passar
 * `=SOMA(D3:D13)`, que esquece o último inscrito — a fórmula certa sobre o
 * intervalo errado, que é o erro de planilha mais comum que existe e o que o
 * requisito 2.1 existe para evitar. Conferir só o número deixaria passar o
 * número digitado.
 *
 * ── E por que máximo e mínimo estão na mesma tarefa ──────────────────────
 * São a mesma ideia lida dos dois lados, e separá-las daria duas linhas
 * idênticas na lista de tarefas. Quem entendeu uma escreve a outra sem pensar.
 */

import {
  type MetaDaPlanilha, abaDe, abaDeInscricoesArrumada, cadernoDoClube, comAba,
  COLUNA_DOS_CALCULOS, escritoEm, indiceDaAba, INSCRITOS, mostradoEm,
  PRIMEIRA_LINHA_DE_CALCULO, PRIMEIRA_LINHA_DE_DADO, TOTAL_ARRECADADO,
  TOTAL_DE_DIARIAS, ULTIMA_LINHA_DE_DADO, usaFuncao,
} from './cadernoDoClube';
import type { Caderno } from './planilha';
import { mostrarNumero } from './formulas';

export const ABA = 'Inscrições';

/** A coluna onde o resultado de cada cálculo é escrito, ao lado do rótulo. */
export const COLUNA_DO_RESULTADO = COLUNA_DOS_CALCULOS + 1;

const LINHA = {
  total: PRIMEIRA_LINHA_DE_CALCULO,
  media: PRIMEIRA_LINHA_DE_CALCULO + 1,
  maior: PRIMEIRA_LINHA_DE_CALCULO + 2,
  menor: PRIMEIRA_LINHA_DE_CALCULO + 3,
  quantos: PRIMEIRA_LINHA_DE_CALCULO + 4,
};

/** O que cada cálculo tem de mostrar, calculado dos dados e não escrito à mão. */
export const MEDIA_DE_DIARIAS = TOTAL_DE_DIARIAS / INSCRITOS.length;
export const MAIOR_DE_DIARIAS = Math.max(...INSCRITOS.map(i => i.diarias));
export const MENOR_DE_DIARIAS = Math.min(...INSCRITOS.map(i => i.diarias));

export function cadernoDasContas(): Caderno {
  return comAba(cadernoDoClube(indiceDaAba(ABA)), abaDeInscricoesArrumada());
}

const conta = (cad: Caderno, linha: number, funcao: string, esperado: string) => {
  const p = abaDe(cad, ABA);
  return usaFuncao(escritoEm(p, linha, COLUNA_DO_RESULTADO), funcao)
    && mostradoEm(p, linha, COLUNA_DO_RESULTADO) === esperado;
};

const FAIXA_DAS_DIARIAS = `C${PRIMEIRA_LINHA_DE_DADO + 1}:C${ULTIMA_LINHA_DE_DADO + 1}`;
const FAIXA_DOS_VALORES = `D${PRIMEIRA_LINHA_DE_DADO + 1}:D${ULTIMA_LINHA_DE_DADO + 1}`;

export const METAS_DAS_CONTAS: MetaDaPlanilha[] = [
  {
    id: 'soma',
    titulo: 'Somar a coluna de valores',
    detalhe: `Na zona de Cálculos, ao lado de "Total arrecadado", escreva a soma da coluna Valor. O resultado tem de ser ${TOTAL_ARRECADADO}.`,
    onde: 'Digitando na célula, ou em Página Inicial › Soma',
    passos: [
      'Clique na célula ao lado de "Total arrecadado".',
      `Escreva =SOMA( e então selecione de D${PRIMEIRA_LINHA_DE_DADO + 1} até D${ULTIMA_LINHA_DE_DADO + 1} com o ponteiro: a planilha escreve o intervalo sozinha.`,
      'Feche o parêntese e aperte Enter.',
      'Confira que o intervalo pega os doze inscritos, e não onze: o erro mais comum não é a função, é o intervalo.',
    ],
    feita: cad => conta(cad, LINHA.total, 'SOMA', String(TOTAL_ARRECADADO)),
  },
  {
    id: 'media',
    titulo: 'Tirar a média das diárias',
    detalhe: `Ao lado de "Média de diárias", escreva a média da coluna Diárias. Repare que o resultado não é um número redondo: são ${mostrarNumero(MEDIA_DE_DIARIAS)}.`,
    onde: `Digitando =MÉDIA(${FAIXA_DAS_DIARIAS}) na célula`,
    passos: [
      'Clique na célula ao lado de "Média de diárias".',
      `Escreva =MÉDIA(${FAIXA_DAS_DIARIAS}) e aperte Enter.`,
      'A média divide pela quantidade de números, e não pela de células: célula vazia não entra na conta nem como zero.',
    ],
    feita: cad => conta(cad, LINHA.media, 'MÉDIA', mostrarNumero(MEDIA_DE_DIARIAS)),
  },
  {
    id: 'extremos',
    titulo: 'Achar o maior e o menor',
    detalhe: 'Ao lado de "Maior número de diárias" e de "Menor número de diárias", use as funções de máximo e de mínimo sobre a coluna Diárias.',
    onde: `Digitando =MÁXIMO(${FAIXA_DAS_DIARIAS}) e =MÍNIMO(${FAIXA_DAS_DIARIAS})`,
    passos: [
      'Clique na célula ao lado de "Maior número de diárias".',
      `Escreva =MÁXIMO(${FAIXA_DAS_DIARIAS}) e aperte Enter.`,
      'Na célula de baixo, escreva a mesma coisa trocando MÁXIMO por MÍNIMO.',
      'Se os dois derem o mesmo número, o intervalo está errado — nem todo mundo se inscreveu para as três diárias.',
    ],
    feita: cad => conta(cad, LINHA.maior, 'MÁXIMO', String(MAIOR_DE_DIARIAS))
      && conta(cad, LINHA.menor, 'MÍNIMO', String(MENOR_DE_DIARIAS)),
  },
  {
    id: 'contagem',
    titulo: 'Contar quantos se inscreveram',
    detalhe: `Ao lado de "Quantos inscritos", conte os números da coluna Diárias. São ${INSCRITOS.length}.`,
    onde: `Digitando =CONT.NÚM(${FAIXA_DAS_DIARIAS}) na célula`,
    passos: [
      'Clique na célula ao lado de "Quantos inscritos".',
      `Escreva =CONT.NÚM(${FAIXA_DAS_DIARIAS}) e aperte Enter.`,
      'CONT.NÚM conta o que a planilha entende como número. Existe também CONT.VALORES, que conta tudo o que está preenchido — e a diferença entre as duas é como se acha um número guardado como texto.',
    ],
    feita: cad => conta(cad, LINHA.quantos, 'CONT.NÚM', String(INSCRITOS.length)),
  },
  {
    id: 'viva',
    titulo: 'Ver a conta se refazer',
    detalhe: 'Mude o número de diárias de qualquer inscrito e repare no que acontece com os cálculos ao lado. Depois devolva o número ao que era: esta tarefa fica verde quando os cálculos acompanham a mudança.',
    onde: 'Na coluna Diárias, em qualquer linha',
    passos: [
      'Clique na célula de diárias de um inscrito e escreva outro número.',
      'Olhe para a zona de Cálculos: o total e a média mudaram sozinhos.',
      'É isso que uma fórmula é — ela guarda a conta, e não o resultado.',
      'Devolva o número ao que era antes.',
    ],
    /*
      A conferência **simula** a mudança em vez de pedir que ela aconteça.

      Pedir que aconteça obrigaria a lembrar de desfazer, e deixaria a tarefa
      verde numa planilha alterada — a lição seguinte partiria de dados
      errados. Simulando, a tarefa mede o que interessa: que o total é uma
      conta e não um número parado. Um `1485` digitado não muda quando a
      diária muda, e é exatamente isso que aqui reprova.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const antes = mostradoEm(p, LINHA.total, COLUNA_DO_RESULTADO);
      const diarias = escritoEm(p, PRIMEIRA_LINHA_DE_DADO, 2);
      if (antes !== String(TOTAL_ARRECADADO) || diarias === '') return false;
      const mexida = {
        ...p,
        celulas: p.celulas.map((linha, l) => linha.map((cel, c) => (
          l === PRIMEIRA_LINHA_DE_DADO && c === 2 ? { ...cel, texto: String(Number(diarias) + 7) } : cel))),
      };
      return mostradoEm(mexida, LINHA.total, COLUNA_DO_RESULTADO) !== antes;
    },
  },
];

export const FAIXAS_DA_LICAO = { diarias: FAIXA_DAS_DIARIAS, valores: FAIXA_DOS_VALORES };
