/**
 * Módulo 7 da CC-ES003 — a planilha defeituosa, e a apresentação.
 *
 * Cobre os requisitos 7 (identificar, numa planilha defeituosa, três erros:
 * uma fórmula quebrada, um número armazenado como texto e um total digitado à
 * mão) e 8 (apresentar a planilha explicando a função de cada fórmula).
 *
 * ── Os três defeitos são de três naturezas diferentes ────────────────────
 * E é por isso que o requisito pede exatamente estes três, e não três
 * quaisquer.
 *
 * A **fórmula quebrada** grita. `#REF!` aparece na célula, em letras que não
 * são número nenhum, e é o único dos três que se acha olhando a tela. Alguém
 * excluiu uma coluna e a planilha escreveu `#REF!` dentro da própria fórmula,
 * que é o que ela faz de verdade.
 *
 * O **número guardado como texto** não grita: na célula aparece 135, igual aos
 * outros onze. O que o denuncia são duas coisas independentes — ele encosta à
 * esquerda, porque texto encosta à esquerda, e a `CONT.NÚM` conta onze onde a
 * `CONT.VALORES` conta doze. É forma e cor outra vez: uma pista sozinha
 * escaparia de quem não repara em alinhamento.
 *
 * O **total digitado à mão** não tem pista nenhuma. Ele está certo hoje, e
 * continua mostrando o número de hoje amanhã — é a família do "número guardado
 * não responde por hoje", a mesma da ofensiva que ficou meses em dois dias. A
 * única maneira de achá-lo é clicar na célula e olhar a barra de fórmulas.
 *
 * ── E por que consertar não basta ────────────────────────────────────────
 * O requisito diz **identificar**. Quem conserta os três sem saber quais eram
 * aprendeu a mexer na planilha, e não a conferir uma. Por isso cada tarefa
 * nomeia o defeito no enunciado e cobra o conserto que corresponde a ele.
 */

import {
  type MetaDaPlanilha, abaDe, cadernoDoClube, escritoEm, indiceDaAba, INSCRITOS,
  LINHA_DO_TEXTO_DISFARCADO, LINHA_DO_TOTAL_CONFERIR, mostradoEm,
  PRIMEIRA_LINHA_DE_DADO, TOTAL_ARRECADADO, TOTAL_DE_DIARIAS,
  ULTIMA_LINHA_DE_DADO, usaFuncao, valorEm,
} from './cadernoDoClube';
import type { Caderno } from './planilha';
import { ehFormula } from './formulas';

export const ABA = 'Conferir';
export const COLUNA_DAS_DIARIAS = 2;
export const COLUNA_DO_VALOR = 3;
export const LINHA_DO_TOTAL_DE_DIARIAS = LINHA_DO_TOTAL_CONFERIR + 1;

export const cadernoDaConferencia = (): Caderno => cadernoDoClube(indiceDaAba(ABA));

/** Simula a mudança de uma diária e devolve o que a célula passa a mostrar. */
function comUmaDiariaAMais(cad: Caderno, l: number, c: number): string {
  const p = abaDe(cad, ABA);
  const diarias = escritoEm(p, PRIMEIRA_LINHA_DE_DADO, COLUNA_DAS_DIARIAS);
  const mexida = {
    ...p,
    celulas: p.celulas.map((linha, li) => linha.map((cel, ci) => (
      li === PRIMEIRA_LINHA_DE_DADO && ci === COLUNA_DAS_DIARIAS
        ? { ...cel, texto: String(Number(diarias) + 5) }
        : cel))),
  };
  return mostradoEm(mexida, l, c);
}

export const METAS_DA_CONFERENCIA: MetaDaPlanilha[] = [
  {
    id: 'quebrada',
    titulo: 'Consertar a fórmula quebrada',
    detalhe: `A célula do total arrecadado mostra #REF!. Alguém excluiu uma coluna e a planilha escreveu isso dentro da própria fórmula. Refaça a soma sobre a coluna Valor: o total é ${TOTAL_ARRECADADO}.`,
    onde: 'Na célula ao lado de "Total arrecadado"',
    passos: [
      'Clique na célula que mostra #REF! e olhe a barra de fórmulas.',
      'Repare que o erro está escrito dentro da fórmula, no lugar onde deveria haver um intervalo.',
      `Apague e escreva =SOMA( , selecione de D${PRIMEIRA_LINHA_DE_DADO + 1} até D${ULTIMA_LINHA_DE_DADO + 1} e feche o parêntese.`,
      'Este é o único dos três defeitos que aparece na tela. Os outros dois não.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      return usaFuncao(escritoEm(p, LINHA_DO_TOTAL_CONFERIR, COLUNA_DO_VALOR), 'SOMA')
        && mostradoEm(p, LINHA_DO_TOTAL_CONFERIR, COLUNA_DO_VALOR) === String(TOTAL_ARRECADADO);
    },
  },
  {
    id: 'texto',
    titulo: 'Achar o número que está guardado como texto',
    detalhe: 'Um dos valores da coluna Valor não é número: é texto que parece número. Ele não entra na soma, e na tela ele é igual aos outros onze. Ache e conserte.',
    onde: 'Na coluna Valor — e a pista está no alinhamento e na CONT.NÚM',
    passos: [
      'Olhe a coluna Valor de cima a baixo: um dos números está encostado à esquerda, e número encosta à direita.',
      'Se não enxergar, escreva numa célula vazia =CONT.NÚM da coluna Valor e, ao lado, =CONT.VALORES da mesma coluna.',
      'Uma conta doze e a outra conta onze. A diferença é a célula que você procura.',
      'Clique nela e olhe a barra de fórmulas: há um apóstrofo na frente do número, e ele não aparece na célula.',
      'Apague o conteúdo e escreva o número de novo, sem o apóstrofo.',
    ],
    /*
      A conferência olha o **tipo** do valor, e não o texto da célula.

      Conferir que o apóstrofo saiu deixaria passar a célula apagada — o
      apóstrofo some junto, e a coluna fica com onze valores e um buraco.
      Exigir que a `CONT.NÚM` da coluna chegue a doze é o que pede as duas
      coisas: sem apóstrofo, e com o número lá.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const numeros = INSCRITOS.filter((_, n) =>
        valorEm(p, PRIMEIRA_LINHA_DE_DADO + n, COLUNA_DO_VALOR).tipo === 'numero').length;
      const esperado = INSCRITOS[LINHA_DO_TEXTO_DISFARCADO - PRIMEIRA_LINHA_DE_DADO].diarias
        * (TOTAL_ARRECADADO / TOTAL_DE_DIARIAS);
      return numeros === INSCRITOS.length
        && mostradoEm(p, LINHA_DO_TEXTO_DISFARCADO, COLUNA_DO_VALOR) === String(esperado);
    },
  },
  {
    id: 'digitado',
    titulo: 'Trocar o total digitado por uma conta',
    detalhe: `O total de diárias mostra ${TOTAL_DE_DIARIAS}, que é o número certo — digitado. Ele não tem pista nenhuma na tela: está certo hoje e vai continuar mostrando ${TOTAL_DE_DIARIAS} depois que alguém mudar uma diária. Troque por uma soma.`,
    onde: 'Na célula ao lado de "Total de diárias"',
    passos: [
      'Clique na célula do total de diárias e olhe a barra de fórmulas.',
      'Não há fórmula nenhuma: é um número escrito.',
      `Apague e escreva =SOMA( , selecione de C${PRIMEIRA_LINHA_DE_DADO + 1} até C${ULTIMA_LINHA_DE_DADO + 1} e feche o parêntese.`,
      'O número na tela continua o mesmo. O que mudou é que agora ele se refaz — e era só isso que estava errado.',
    ],
    /*
      Simula uma mudança de diária, pela mesma razão do módulo 2: um número
      digitado passa por qualquer conferência que olhe só o valor, porque o
      valor está certo. O que ele não faz é acompanhar.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const celula = escritoEm(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS);
      if (!ehFormula(celula)) return false;
      if (mostradoEm(p, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS) !== String(TOTAL_DE_DIARIAS)) return false;
      return comUmaDiariaAMais(cad, LINHA_DO_TOTAL_DE_DIARIAS, COLUNA_DAS_DIARIAS) !== String(TOTAL_DE_DIARIAS);
    },
  },
];
