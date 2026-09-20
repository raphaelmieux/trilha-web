/**
 * Módulo 4 da CC-ES003 — a planilha que decide e a que procura.
 *
 * Cobre os requisitos 4.4 (função condicional) e 4.5 (buscar informação em
 * outra tabela por meio de função de procura).
 *
 * ── A tabela de procura não está em ordem, e é o ponto ───────────────────
 * Ela está na ordem em que o clube escreve as unidades, que é a ordem em que
 * elas foram fundadas — e é assim que toda tabela digitada à mão fica. O
 * `PROCV` sem o quarto argumento procura **aproximado**: lê a coluna como se
 * estivesse ordenada e para na linha errada.
 *
 * Nesta tabela ele erra de dois jeitos diferentes, e essa é a parte que
 * ensina. Procurando "Águia" ele para na primeira linha e devolve `#N/D`, que
 * pelo menos se vê. Procurando "Onça" ele devolve **Tia Rute**, que é a
 * conselheira da Águia — um nome plausível, numa célula sem erro nenhum, ao
 * lado do nome de um desbravador que não é da unidade dela.
 *
 * ── Por que "exata" é uma tarefa separada ────────────────────────────────
 * A tarefa do resultado já reprova quem esqueceu o `FALSO`: com a tabela fora
 * de ordem, pelo menos um dos doze sai errado. Mas ela reprova sem dizer o
 * quê, e "está errado" numa coluna de doze nomes manda conferir doze fórmulas.
 * A tarefa separada nomeia a causa.
 */

import {
  type MetaDaPlanilha, abaDe, cadernoDoClube, CONSELHEIROS, escritoEm,
  indiceDaAba, INSCRITOS, mostradoEm, usaFuncao,
} from './cadernoDoClube';
import type { Caderno } from './planilha';

export const ABA = 'Unidades';

export const LINHA_DO_CABECALHO = 0;
export const PRIMEIRA_LINHA = 1;
export const ULTIMA_LINHA = PRIMEIRA_LINHA + INSCRITOS.length - 1;
export const COLUNA_DO_CONSELHEIRO = 3;
export const COLUNA_DO_ALMOCO = 4;

/** A tabela de procura: da linha 2 à 7, nas colunas G e H. */
export const FAIXA_DE_PROCURA = '$G$2:$H$7';

/**
 * Quantas diárias quer dizer ficar até o domingo.
 *
 * Três noites é o acampamento inteiro; duas é sair no sábado. A pergunta da
 * coluna é essa, e não "tem mais de duas diárias": uma condição escrita sobre
 * o que o número **significa** é a que continua certa quando o acampamento
 * mudar de tamanho.
 */
export const DIARIAS_ATE_DOMINGO = 3;

export const cadernoDasUnidades = (): Caderno => cadernoDoClube(indiceDaAba(ABA));

const conselheiroDe = (unidade: string) =>
  CONSELHEIROS.find(([u]) => u === unidade)?.[1] ?? '';

const linhas = () => INSCRITOS.map((i, n) => ({
  linha: PRIMEIRA_LINHA + n,
  conselheiro: conselheiroDe(i.unidade),
  almoca: i.diarias >= DIARIAS_ATE_DOMINGO ? 'Sim' : 'Não',
}));

export const METAS_DAS_UNIDADES: MetaDaPlanilha[] = [
  {
    id: 'procura',
    titulo: 'Trazer o conselheiro de cada unidade',
    detalhe: 'A tabela de unidades e conselheiros está à direita, nas colunas G e H. Na coluna "Conselheiro", traga o nome que corresponde à unidade de cada inscrito — sem digitar nenhum deles.',
    onde: `Digitando =PROCV( na primeira célula da coluna Conselheiro, e arrastando para baixo`,
    passos: [
      'Clique na primeira célula vazia da coluna "Conselheiro".',
      'Escreva =PROCV( e clique na célula da unidade daquela linha.',
      `Ponto e vírgula, e então selecione a tabela de procura inteira: ${FAIXA_DE_PROCURA}. Trave-a com os cifrões, senão ela anda quando você arrastar.`,
      'Ponto e vírgula, e 2 — que é a segunda coluna da tabela de procura, a do conselheiro.',
      'Ponto e vírgula, e FALSO. Feche o parêntese e aperte Enter.',
      'Arraste a alça do canto da célula até a última linha.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      return linhas().every(({ linha, conselheiro }) =>
        usaFuncao(escritoEm(p, linha, COLUNA_DO_CONSELHEIRO), 'PROCV')
        && mostradoEm(p, linha, COLUNA_DO_CONSELHEIRO) === conselheiro);
    },
  },
  {
    id: 'exata',
    titulo: 'Pedir a procura exata',
    detalhe: 'O quarto argumento do PROCV vale VERDADEIRO quando não se escreve nada, e VERDADEIRO quer dizer "procura aproximada": ele lê a coluna como se estivesse ordenada. A tabela do clube não está. Escreva FALSO nas doze.',
    onde: 'No fim de cada PROCV, antes de fechar o parêntese',
    passos: [
      'Clique numa célula da coluna "Conselheiro" e olhe a fórmula na barra.',
      'Conte os argumentos: o valor procurado, a tabela, o número da coluna, e o quarto.',
      'Se o quarto não estiver lá, escreva ; FALSO antes do parêntese que fecha.',
      'Experimente tirá-lo de uma linha só, para ver: em algumas o resultado vira #N/D, e em outras vem o nome do conselheiro de outra unidade — sem erro nenhum na tela.',
    ],
    /*
      Cobra o quarto argumento **escrito**, e não o resultado certo.

      O resultado já é cobrado pela tarefa acima; o que esta nomeia é a causa.
      E ela aceita `FALSO` e `0`, que é o que a planilha aceita: reprovar o `0`
      ensinaria uma regra que o Excel não tem.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      return linhas().every(({ linha }) => {
        const f = escritoEm(p, linha, COLUNA_DO_CONSELHEIRO).toUpperCase().replace(/\s/g, '');
        return usaFuncao(f, 'PROCV') && /;(FALSO|0)\)$/.test(f);
      });
    },
  },
  {
    id: 'condicao',
    titulo: 'Deixar a planilha responder sozinha',
    detalhe: `Na coluna "Almoça no domingo?", responda Sim para quem tem ${DIARIAS_ATE_DOMINGO} diárias e Não para quem tem menos — com uma função condicional, e não olhando linha por linha.`,
    onde: 'Digitando =SE( na primeira célula da coluna, e arrastando para baixo',
    passos: [
      'Clique na primeira célula vazia da coluna "Almoça no domingo?".',
      `Escreva =SE( e clique na célula de diárias daquela linha, depois >=${DIARIAS_ATE_DOMINGO}`,
      'Ponto e vírgula, "Sim" entre aspas, ponto e vírgula, "Não" entre aspas.',
      'Feche o parêntese, aperte Enter e arraste a alça até a última linha.',
      'As aspas são o que diz à planilha que Sim é uma palavra, e não o nome de uma célula.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      return linhas().every(({ linha, almoca }) =>
        usaFuncao(escritoEm(p, linha, COLUNA_DO_ALMOCO), 'SE')
        && mostradoEm(p, linha, COLUNA_DO_ALMOCO) === almoca);
    },
  },
];
