/**
 * Módulo 5 da CC-ES003 — ver o que importa numa tabela que não cabe na tela.
 *
 * Cobre os requisitos 2.4 (definir formatação condicional), 2.5 (definir filtro
 * e ordenação), 4.6 (aplicar formatação condicional) e 4.7 (congelar
 * cabeçalho, ordenar e filtrar).
 *
 * ── O que não se repete da AP044 ─────────────────────────────────────────
 * A AP044 já ensina filtro e congelamento, e ensina a consequência séria
 * deles: com filtro aplicado, a `SOMA` continua somando o que está escondido.
 * Repetir isso aqui mediria de novo o que já foi medido. O peso desta lição
 * está na formatação condicional, que a AP044 não tem, e no que as três
 * ferramentas têm de diferente entre si — **ordenar mexe nos dados; filtrar e
 * congelar são de tela**. Só uma das três muda o arquivo, e é a que não tem
 * volta.
 *
 * ── A faixa da regra para onde os dados param ────────────────────────────
 * É o detalhe que a lição existe para ensinar, e ele não é capricho nosso: no
 * Excel a célula vazia vale **zero** numa comparação numérica, então uma regra
 * "menor que 3" pintada sobre a coluna inteira acende a metade em branco dela.
 * Uma planilha toda colorida não destaca coisa nenhuma — que é o contrário do
 * que a formatação condicional faz.
 *
 * Por isso a tarefa não confere a regra que foi escrita: confere **o que ficou
 * pintado**. Exatamente as três linhas de quem não fica até domingo, e nenhuma
 * célula vazia junto.
 */

import {
  type MetaDaPlanilha, abaDe, abaDeInscricoesArrumada, cadernoDoClube, comAba,
  escritoEm, indiceDaAba, INSCRITOS, LINHA_DO_CABECALHO,
  PRIMEIRA_LINHA_DE_DADO, ULTIMA_LINHA_DE_DADO,
} from './cadernoDoClube';
import { type Caderno, estiloCondicional, linhaEscondida } from './planilha';

export const ABA = 'Inscrições';
export const COLUNA_DA_UNIDADE = 1;
export const COLUNA_DAS_DIARIAS = 2;

/** Quantas diárias são o acampamento inteiro. Quem tem menos sai no sábado. */
export const DIARIAS_COMPLETAS = 3;

/** As linhas que a regra tem de acender: quem não fica até domingo. */
export const LINHAS_A_DESTACAR = INSCRITOS
  .map((i, n) => ({ linha: PRIMEIRA_LINHA_DE_DADO + n, curto: i.diarias < DIARIAS_COMPLETAS }))
  .filter(l => l.curto)
  .map(l => l.linha);

export function cadernoDoDestaque(): Caderno {
  return comAba(cadernoDoClube(indiceDaAba(ABA)), abaDeInscricoesArrumada());
}

export const METAS_DO_DESTAQUE: MetaDaPlanilha[] = [
  {
    id: 'congelar',
    titulo: 'Congelar o título e o cabeçalho',
    detalhe: 'Numa lista que não cabe na tela, rolar até o fim faz o cabeçalho sumir e as colunas viram "aquela dos números". Congele as duas primeiras linhas: elas ficam paradas enquanto o resto rola.',
    onde: 'Exibir › Congelar Painéis',
    passos: [
      'Clique numa célula da terceira linha — congelar prende tudo o que está acima dela.',
      'Na guia Exibir, clique em Congelar Painéis.',
      'Role a lista para baixo: o título e o cabeçalho ficam.',
      'Congelar é de tela: não muda um dado sequer, não trava célula contra edição e não vai para o papel.',
    ],
    feita: cad => abaDe(cad, ABA).congeladas > LINHA_DO_CABECALHO,
  },
  {
    id: 'ordenar',
    titulo: 'Ordenar a lista por unidade',
    detalhe: 'Ordene a tabela pela coluna Unidade. Repare que a linha inteira viaja junto — é isso que separa ordenar de tudo o mais nesta lição: ordenar mexe nos dados de verdade.',
    onde: 'Dados › Classificar, ou pela setinha do cabeçalho da coluna',
    passos: [
      'Clique numa célula da coluna Unidade.',
      'Na guia Dados, clique em Classificar de A a Z.',
      'Repare que o nome de cada desbravador continua ao lado da unidade dele.',
      'Se você tivesse selecionado só a coluna Unidade antes de ordenar, os nomes teriam ficado parados e a lista inteira estaria trocada — sem erro nenhum, e sem volta.',
    ],
    /*
      Confere que a linha continua inteira, e não só que houve ordenação.

      Uma planilha com as unidades ordenadas e os nomes parados é o estrago
      mais caro que uma tabela sofre, e ele não estoura: a lista continua com
      doze linhas, doze nomes e doze unidades, todos plausíveis.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      if (!p.ordenacao || p.ordenacao.coluna !== COLUNA_DA_UNIDADE) return false;
      const linhas = INSCRITOS.map((_, n) => {
        const l = PRIMEIRA_LINHA_DE_DADO + n;
        return `${escritoEm(p, l, 0)}|${escritoEm(p, l, 1)}|${escritoEm(p, l, 2)}`;
      });
      const esperadas = INSCRITOS.map(i => `${i.nome}|${i.unidade}|${i.diarias}`);
      if ([...linhas].sort().join('\n') !== [...esperadas].sort().join('\n')) return false;
      const unidades = linhas.map(l => l.split('|')[1]);
      return unidades.every((u, i) => i === 0 || unidades[i - 1].localeCompare(u, 'pt-BR') <= 0);
    },
  },
  {
    id: 'filtrar',
    titulo: 'Filtrar por uma unidade',
    detalhe: 'Ligue o filtro e escolha uma unidade. As outras linhas somem da tela — e continuam na planilha, o que é a coisa mais importante a saber sobre filtro.',
    onde: 'Dados › Filtro, e então a setinha no cabeçalho da coluna Unidade',
    passos: [
      'Clique numa célula da tabela e, na guia Dados, clique em Filtro.',
      'Aparecem setinhas nos cabeçalhos. Clique na da coluna Unidade.',
      'Escolha uma unidade.',
      'Repare nos números das linhas à esquerda: eles pulam. As linhas escondidas continuam lá.',
    ],
    feita: cad => {
      const p = abaDe(cad, ABA);
      if (!p.filtro || p.filtro.coluna !== COLUNA_DA_UNIDADE || p.filtro.valor.trim() === '') return false;
      let escondidas = 0;
      let visiveis = 0;
      for (let l = PRIMEIRA_LINHA_DE_DADO; l <= ULTIMA_LINHA_DE_DADO; l++) {
        if (linhaEscondida(p, l)) escondidas++;
        else visiveis++;
      }
      /* Um filtro que não esconde ninguém, ou que esconde todo mundo, não
         mostra o que um filtro faz. */
      return escondidas > 0 && visiveis > 0;
    },
  },
  {
    id: 'condicional',
    titulo: 'Acender quem não fica até domingo',
    detalhe: `Crie uma regra de formatação condicional que pinte, na coluna Diárias, quem tem menos de ${DIARIAS_COMPLETAS} diárias. Cuidado com a faixa: ela vai até a última linha com dado, e não até o fim da coluna.`,
    onde: 'Página Inicial › Formatação Condicional › Realçar Regras das Células',
    passos: [
      `Selecione da primeira à última célula com dado na coluna Diárias — e não a coluna inteira.`,
      'Em Formatação Condicional, escolha Realçar Regras das Células › É Menor do Que.',
      `Escreva ${DIARIAS_COMPLETAS} e escolha uma cor.`,
      'Se metade da coluna acender, a faixa passou do fim dos dados: para a planilha, célula vazia vale zero, e zero é menor que três.',
    ],
    /*
      Confere **o que ficou pintado**, e não a regra que foi escrita.

      Há mais de uma regra certa — "menor que 3" e "igual a 2" acendem as
      mesmas três linhas —, e cobrar uma delas mediria ter adivinhado a nossa.
      O que a lição cobra é o resultado: exatamente as três, e nenhuma célula
      vazia junto.
    */
    feita: cad => {
      const p = abaDe(cad, ABA);
      if (p.regras.length === 0) return false;
      const acesas: number[] = [];
      for (let l = 0; l < p.celulas.length; l++) {
        if (estiloCondicional(p, l, COLUNA_DAS_DIARIAS) !== null) acesas.push(l);
      }
      const esperadas = INSCRITOS
        .map((i, n) => ({ l: PRIMEIRA_LINHA_DE_DADO + n, curto: i.diarias < DIARIAS_COMPLETAS }))
        .filter(x => x.curto).map(x => x.l);
      /* Ordenar a tabela move as linhas, então a comparação é por conjunto de
         valores acesos, e não por número de linha. */
      const diariasAcesas = acesas.map(l => escritoEm(p, l, COLUNA_DAS_DIARIAS)).sort();
      const diariasEsperadas = esperadas.map(() => String(DIARIAS_COMPLETAS - 1)).sort();
      return acesas.length === esperadas.length
        && diariasAcesas.join(',') === diariasEsperadas.join(',');
    },
  },
];
