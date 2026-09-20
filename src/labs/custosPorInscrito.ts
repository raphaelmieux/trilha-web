/**
 * Módulo 3 da CC-ES003 — a referência que anda e a que fica.
 *
 * Cobre os requisitos 2.3 (definir referência relativa e absoluta) e 4.3
 * (usar referência absoluta e explicar quando ela é necessária).
 *
 * ── O "quando" é a metade difícil do requisito ───────────────────────────
 * Travar uma referência é um cifrão; saber quando travar é a lição. E ela só
 * existe quando há uma célula que **todas** as linhas precisam ler: o valor da
 * diária, escrito uma vez. Sem ela, arrastar a fórmula funcionaria em todas as
 * linhas e o `$` seria decoração.
 *
 * ── E o erro se vê, o que é raro ─────────────────────────────────────────
 * Arrastar `=B4*B1` para baixo faz a segunda linha ler B2, que está vazia, e a
 * terceira ler B3, que é o rótulo "Nome". A coluna sai com um número certo no
 * topo e zeros embaixo. É um dos poucos erros de planilha que se denunciam
 * sozinhos — e é por isso que ele é o exemplo.
 *
 * ── Por que a trava aceita `B$1` e não exige `$B$1` ──────────────────────
 * Arrastando **para baixo**, quem precisa ficar parada é a linha. Exigir os
 * dois cifrões reprovaria uma fórmula que está certa para o que a lição pede,
 * e ensinaria a decorar a forma em vez de entender o que cada cifrão faz. A
 * lição explica os dois; a tarefa cobra o que a tarefa precisa.
 */

import {
  type MetaDaPlanilha, abaDe, cadernoDoClube, escritoEm, indiceDaAba,
  INSCRITOS, mostradoEm, VALOR_DA_DIARIA,
} from './cadernoDoClube';
import type { Caderno } from './planilha';
import { referenciasDe } from './formulas';

export const ABA = 'Custos';

export const LINHA_DA_DIARIA = 0;
export const COLUNA_DA_DIARIA = 1;
export const LINHA_DO_CABECALHO = 2;
export const PRIMEIRA_LINHA = LINHA_DO_CABECALHO + 1;
export const ULTIMA_LINHA = PRIMEIRA_LINHA + INSCRITOS.length - 1;
export const COLUNA_A_PAGAR = 2;

export const cadernoDosCustos = (): Caderno => cadernoDoClube(indiceDaAba(ABA));

/** As doze linhas de "A pagar", com o que cada uma tem de mostrar. */
const linhas = () => INSCRITOS.map((i, n) => ({
  linha: PRIMEIRA_LINHA + n,
  esperado: String(i.diarias * VALOR_DA_DIARIA),
}));

export const METAS_DOS_CUSTOS: MetaDaPlanilha[] = [
  {
    id: 'arrastada',
    titulo: 'Calcular o que cada um paga, e arrastar para baixo',
    detalhe: 'Na coluna "A pagar", escreva a conta da primeira linha — diárias vezes o valor da diária, que está em B1 — e arraste a alça do canto da célula até a última linha. As doze linhas ficam com a conta da própria linha.',
    onde: 'Digitando na primeira célula de "A pagar", e depois arrastando o quadradinho do canto inferior direito dela',
    passos: [
      'Clique na primeira célula vazia da coluna "A pagar".',
      'Escreva = , clique na célula de diárias da mesma linha, escreva * , e clique em B1.',
      'Antes de apertar Enter, ponha $ na frente do 1 de B1 — ou aperte F4, que faz isso por você.',
      'Aperte Enter, clique de novo na célula, e arraste o quadradinho do canto de baixo até a última linha.',
      'Se os valores saírem zerados da segunda linha para baixo, o $ ficou de fora: a referência andou junto e foi parar numa célula vazia.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      return linhas().every(({ linha, esperado }) => mostradoEm(p, linha, COLUNA_A_PAGAR) === esperado);
    },
  },
  {
    id: 'travada',
    titulo: 'Travar a referência do valor da diária',
    detalhe: 'A célula do valor da diária é a mesma para as doze linhas, então ela não pode andar quando a fórmula é arrastada. Trave a linha dela com o cifrão.',
    onde: 'Na barra de fórmulas, ou com F4 sobre a referência',
    passos: [
      'Clique numa das células de "A pagar" e olhe a fórmula na barra.',
      'A referência à célula de diárias muda de linha para linha — é ela que tem de andar.',
      'A referência ao valor da diária tem de apontar sempre para a mesma célula: B$1 ou $B$1.',
      'O cifrão antes do número trava a linha; antes da letra, trava a coluna. Arrastando para baixo, quem precisa ficar parada é a linha.',
    ],
    /*
      Cobra a linha travada, e não os dois cifrões.

      Arrastando para baixo, `B$1` está certo — e reprovar quem escreveu certo
      ensinaria a decorar a forma em vez de entender o que cada cifrão faz.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      return linhas().every(({ linha }) => referenciasDe(escritoEm(p, linha, COLUNA_A_PAGAR))
        .some(r => r.linha === LINHA_DA_DIARIA && r.coluna === COLUNA_DA_DIARIA && r.linhaFixa));
    },
  },
  {
    id: 'segue',
    titulo: 'Provar que a planilha lê a diária, e não o número 45',
    detalhe: 'Troque o valor da diária em B1 por outro número e repare que as doze linhas mudam juntas. Depois devolva o valor ao que era.',
    onde: 'Na célula B1',
    passos: [
      'Clique em B1 e escreva outro valor.',
      'As doze linhas de "A pagar" mudam sozinhas.',
      'Se alguma não mudar, é porque nela o 45 foi digitado dentro da fórmula em vez de vir da célula.',
      'Devolva B1 ao valor que era.',
    ],
    /*
      Simula a troca em vez de pedir que ela aconteça — mesma razão da tarefa
      "ver a conta se refazer" do módulo 2: pedir que aconteça deixaria a
      tarefa verde numa planilha alterada.

      Esta é a única que pega o 45 digitado dentro da fórmula. As outras duas
      passam com `=B4*45`: o valor sai certo e não há referência a B1 nenhuma
      para conferir — e a planilha do ano que vem, com a diária a 50, sairia
      inteira errada sem nada acusar.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const antes = linhas().map(({ linha }) => mostradoEm(p, linha, COLUNA_A_PAGAR));
      const mexida = {
        ...p,
        celulas: p.celulas.map((linha, l) => linha.map((cel, c) => (
          l === LINHA_DA_DIARIA && c === COLUNA_DA_DIARIA
            ? { ...cel, texto: String(VALOR_DA_DIARIA + 13) }
            : cel))),
      };
      return linhas().every(({ linha }, i) => {
        const depois = mostradoEm(mexida, linha, COLUNA_A_PAGAR);
        return depois !== '' && depois !== antes[i];
      });
    },
  },
];
