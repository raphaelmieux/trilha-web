/**
 * Módulo 1 da CC-ES003 — a aba de inscrições, e as três zonas.
 *
 * Cobre os requisitos 2.1 (célula e intervalo), 3 (por que a planilha separa
 * dado bruto, cálculo e apresentação) e 4.1 (tamanho de linha e coluna, e
 * alinhamento).
 *
 * ── O defeito que a lição mostra ─────────────────────────────────────────
 * A planilha chega do jeito que a secretaria do clube deixou: a coluna dos
 * nomes estreita demais para caber qualquer nome, o título espremido numa
 * linha de altura padrão, o cabeçalho sem nada que o distinga dos dados, um
 * recado de trabalho escrito ao lado do título, e — o defeito que importa —
 * **um total digitado à mão logo abaixo da última linha de dados**.
 *
 * Esse último é o que o requisito 3 existe para nomear. Ele não estoura, não
 * está errado hoje, e some no dia em que alguém inscrever o décimo terceiro
 * desbravador: a linha nova entra no lugar do total, ou o total fica onde
 * está e passa a somar uma tabela que cresceu sem ele. Ordenar a tabela, então,
 * leva o total para o meio dos nomes.
 *
 * ── Por que a estrutura vem rotulada, e a arrumação não ──────────────────
 * "Organize como achar melhor" mediria gosto; uma planilha que chegasse já
 * separada não mediria nada. Então a zona de cálculos chega escrita, com os
 * rótulos do que se quer, e o que se cobra é pôr cada coisa na zona dela.
 *
 * ── E por que apagar o total é o certo aqui ──────────────────────────────
 * Um total digitado à mão não é um cálculo: é um número copiado. Ele não
 * pertence ao bloco de dados nem à zona de cálculos — onde, no módulo 2, ele
 * volta como fórmula. A lição diz isso com todas as letras, senão apagar
 * pareceria perder trabalho.
 */

import {
  type MetaDaPlanilha, abaDe, abaDeInscricoes, cadernoDoClube,
  escritoEm, INSCRITOS, LINHA_DO_TITULO, PRIMEIRA_LINHA_DE_DADO,
  ULTIMA_LINHA_DE_DADO, TOTAL_ARRECADADO, comAba, comCelulas, indiceDaAba,
} from './cadernoDoClube';
import { type Caderno, ALTURA_PADRAO } from './planilha';

export const ABA = 'Inscrições';

/** O recado de trabalho que alguém deixou na linha do título. */
export const RECADO_DA_TESOURARIA = 'confirmar com a tesouraria';
export const COLUNA_DO_RECADO = 2;

/*
  A coluna A precisa caber o nome mais comprido da lista, e o número sai
  **daí** e não de um palpite: nome novo mais comprido muda a conta sozinho.
  Sete pixels por caractere é a medida da fonte da grade, e as duas margens de
  cinco são o `padding` da célula.
*/
const MAIOR_NOME = INSCRITOS.reduce((a, i) => Math.max(a, i.nome.length), 0);
export const LARGURA_QUE_CABE = MAIOR_NOME * 7 + 10;

/** A pasta como a secretaria deixou. */
export function cadernoDeArrumar(): Caderno {
  const base = cadernoDoClube(indiceDaAba(ABA));
  const bagunçada = comCelulas(abaDeInscricoes(), (cel, l, c) => {
    if (l === LINHA_DO_TITULO && c === COLUNA_DO_RECADO) return { ...cel, texto: RECADO_DA_TESOURARIA };
    if (l === ULTIMA_LINHA_DE_DADO + 1 && c === 0) return { ...cel, texto: 'Total' };
    if (l === ULTIMA_LINHA_DE_DADO + 1 && c === 3) return { ...cel, texto: String(TOTAL_ARRECADADO) };
    return cel;
  });
  return comAba(base, bagunçada);
}

export const METAS_DE_ARRUMAR: MetaDaPlanilha[] = [
  {
    id: 'tamanho',
    titulo: 'Dar tamanho à coluna e à linha',
    detalhe: 'Nenhum nome cabe na coluna A, e o título está espremido. Alargue a coluna A até o nome mais comprido caber inteiro, e aumente a altura da linha 1.',
    onde: 'Arrastando a borda do cabeçalho da coluna A, entre A e B — ou dois cliques nela, que ajusta sozinho',
    passos: [
      'Leve o ponteiro até a borda direita do cabeçalho "A". Ele vira uma seta dupla.',
      'Arraste para a direita até "Ana Beatriz Rocha" aparecer inteiro.',
      'Dois cliques nessa mesma borda também servem: a coluna se ajusta ao conteúdo sozinha.',
      'Faça o mesmo na borda de baixo do cabeçalho da linha 1, arrastando para baixo.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      return p.larguras[0] >= LARGURA_QUE_CABE && p.alturas[0] >= ALTURA_PADRAO + 10;
    },
  },
  {
    id: 'titulo',
    titulo: 'Deixar o título como título',
    detalhe: 'O título ocupa uma célula só e fica encostado à esquerda, como se fosse mais um dado. Mescle a linha 1 por cima da largura da tabela e centralize-o na horizontal e no meio na vertical.',
    onde: 'Página Inicial › Mesclar e Centralizar, e os botões de alinhamento ao lado',
    passos: [
      'Clique em A1 e arraste até D1: a caixa de nome, à esquerda da barra de fórmulas, mostra A1:D1.',
      'Clique em Mesclar e Centralizar. A planilha avisa que só o valor da célula da esquerda fica — é isso mesmo.',
      'Com a célula mesclada selecionada, escolha Alinhar no Meio, na vertical.',
      'Se o alinhamento vertical não parecer mudar nada, é porque a linha ainda está baixa: aumente a altura dela.',
    ],
    feita: cad => {
      const a1 = abaDe(cad, ABA).celulas[LINHA_DO_TITULO][0];
      return a1.span >= 4 && a1.h === 'centro' && a1.v === 'meio';
    },
  },
  {
    id: 'cabecalho',
    titulo: 'Separar o cabeçalho dos dados',
    detalhe: 'A linha 2 tem os nomes das colunas, e está escrita igual ao resto. Deixe-a em negrito e centralizada: é isso que faz a planilha e quem a lê saberem onde a tabela começa.',
    onde: 'Página Inicial › Fonte, e Página Inicial › Alinhamento',
    passos: [
      'Selecione de A2 até D2.',
      'Clique no N de negrito.',
      'Clique em Centralizar.',
    ],
    feita: cad => {
      const linha = abaDe(cad, ABA).celulas[1];
      return [0, 1, 2, 3].every(c => linha[c].negrito && linha[c].h === 'centro');
    },
  },
  {
    id: 'separar',
    titulo: 'Deixar no bloco de dados só o que é dado',
    detalhe: 'Duas coisas que não são dado estão dentro do bloco: o recado da tesouraria, na linha do título, e um total digitado à mão logo abaixo do último inscrito. Tire as duas. O total volta no módulo 2, como fórmula, na zona de Cálculos ao lado.',
    onde: 'Selecionando a célula e apertando Del',
    passos: [
      'Clique na célula do recado, ao lado do título, e aperte Del.',
      'Selecione a linha inteira logo abaixo do último inscrito e aperte Del.',
      'Repare no que o total fazia ali: inscrever mais um desbravador empurraria a linha dele para cima do total, ou deixaria o total somando uma tabela que cresceu sem ele.',
      'Os doze inscritos continuam onde estão — o que sai é só o que não é dado.',
    ],
    /*
      A conferência exige que os doze continuem lá.

      Sem isso, apagar a tabela inteira deixaria a tarefa verde: o bloco ficaria
      "só com dado" por não ter dado nenhum. É a armadilha do "zero link não é
      zero link quebrado" aplicada a uma limpeza.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      const dadosIntactos = INSCRITOS.every((i, n) => {
        const l = PRIMEIRA_LINHA_DE_DADO + n;
        return escritoEm(p, l, 0) === i.nome
          && escritoEm(p, l, 1) === i.unidade
          && escritoEm(p, l, 2) === String(i.diarias)
          && escritoEm(p, l, 3) !== '';
      });
      const abaixoLimpo = [0, 1, 2, 3].every(c => escritoEm(p, ULTIMA_LINHA_DE_DADO + 1, c) === '');
      const tituloLimpo = [1, 2, 3].every(c => escritoEm(p, LINHA_DO_TITULO, c) === '');
      return dadosIntactos && abaixoLimpo && tituloLimpo;
    },
  },
];
