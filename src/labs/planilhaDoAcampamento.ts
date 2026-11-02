/**
 * O que o laboratório de planilha avançada da AP044 cobra, e de onde parte.
 *
 * Mesma razão de `metasDaAp043.ts`: modelo e critério fora do componente, para
 * que a trava os alcance sem montar tela.
 *
 * ── O requisito 8, e o que ele tem de diferente do da AP043 ──────────────
 * A AP043 monta a planilha: escrever, alargar coluna, mesclar, somar. Aqui a
 * planilha já existe, com cento e vinte inscritos — e o que se aprende é a
 * **parar de olhar linha por linha**. Filtro em vez do olho, cabeçalho preso
 * em vez de rolar de volta, gráfico em vez de ler números.
 *
 * ── É uma pasta de trabalho de verdade ───────────────────────────────────
 * Ela era um objeto próprio — lista de inscritos, um campo com a fórmula do
 * total, um booleano de filtro —, desenhado numa tabela que não era a grade
 * do Excel. A célula do total ficava num painel ao lado, e "escrever a
 * fórmula" era clicar num botão com o texto dela. O desbravador saía da AP043
 * sabendo andar com as setas, F2 e Enter, e chegava aqui numa planilha em que
 * nada disso existia.
 *
 * Hoje é a `Planilha` de `planilha.ts`, na grade de `excel.tsx`: o total mora
 * em D123, embaixo da coluna que ele soma, e se escreve como toda fórmula se
 * escreve. O `SUBTOTAL` é do motor de `formulas.ts`, e respeita o filtro
 * porque pergunta a `linhaEscondida` — a mesma pergunta que a grade faz para
 * esconder a linha. Duas respostas para "esta linha está à vista?" seriam o
 * total e a tela discordando no primeiro ajuste.
 *
 * ── Filtro esconde, e não apaga ──────────────────────────────────────────
 * É o mal-entendido que custa caro, e ele tem uma consequência que ninguém
 * conta: com filtro aplicado, `SOMA` continua somando tudo, inclusive o que
 * está escondido. Quem não sabe disso lê um total que não corresponde ao que
 * vê na tela — e manda esse total para a liderança.
 *
 * A planilha mostra os dois números ao mesmo tempo, como o Excel de verdade
 * mostra: a célula do total, que é a `SOMA`, e a barra de status, que soma a
 * seleção pulando as linhas escondidas. Quando eles não batem, é porque há
 * linha escondida. `SUBTOTAL` é a fórmula que respeita o filtro.
 *
 * ── Os meses moram em outra aba ──────────────────────────────────────────
 * O filtro esconde a **linha inteira**, e não só a célula da tabela: uma
 * tabela de meses posta ao lado dos inscritos sumiria junto quando alguém
 * filtrasse, e o gráfico perderia os pontos sem explicação. É o que o Excel
 * faz, e é por isso que se separa resumo de lista em abas.
 *
 * ── Congelar é de tela, e não de dado ────────────────────────────────────
 * Não muda a planilha, não trava célula contra edição e não vai para o PDF.
 *
 * ── E o gráfico é uma leitura ────────────────────────────────────────────
 * O tipo sai da pergunta. A pergunta aqui é de **evolução** — como a inscrição
 * cresceu mês a mês —, e ela só tem uma resposta certa.
 */

import {
  type Caderno, type Celula, type Planilha,
  planilhaDe, valorCalculado, linhaEscondida, pontosDoGrafico,
} from './planilha';

export interface Inscrito {
  nome: string;
  unidade: string;
  diarias: number;
  valor: number;
}

export const UNIDADES = ['Falcão', 'Águia', 'Tucano', 'Arara', 'Jaguar', 'Onça'];

/** As inscrições mês a mês, que é o que o gráfico tem de mostrar. */
export const INSCRICOES_POR_MES: { mes: string; total: number }[] = [
  { mes: 'Janeiro', total: 8 },
  { mes: 'Fevereiro', total: 17 },
  { mes: 'Março', total: 29 },
  { mes: 'Abril', total: 44 },
  { mes: 'Maio', total: 78 },
  { mes: 'Junho', total: 120 },
];

/*
  Cento e vinte inscritos, gerados por regra e não escritos à mão.

  O número importa: a lição de teoria fala em cento e vinte, e uma planilha de
  doze linhas não faz ninguém sentir falta do filtro — rolar com o olho ainda
  daria. E é o que faz o cabeçalho sair da tela, que é a razão de congelar.
*/
export const INSCRITOS: Inscrito[] = Array.from({ length: 120 }, (_, i) => {
  const unidade = UNIDADES[i % UNIDADES.length];
  const diarias = 2 + (i % 3);
  return {
    nome: `Inscrito ${String(i + 1).padStart(3, '0')}`,
    unidade,
    diarias,
    valor: diarias * 45,
  };
});

/** A fórmula que a planilha traz, e que não sabe do filtro. */
export const FORMULA_INICIAL = '=SOMA(D2:D121)';
/** A que respeita o filtro. 109 é o código da soma que ignora o escondido. */
export const FORMULA_QUE_RESPEITA = '=SUBTOTAL(109;D2:D121)';

/** Onde as coisas moram na aba Inscritos. */
export const COLUNA_DA_UNIDADE = 1;
export const COLUNA_DO_VALOR = 3;
/** D123: a linha 123 da tela, depois de uma linha em branco embaixo da tabela. */
export const CELULA_DO_TOTAL = { l: 122, c: COLUNA_DO_VALOR };
export const ABA_DOS_INSCRITOS = 0;
export const ABA_DOS_MESES = 1;

const emReais = (c: Celula): Celula => ({ ...c, formato: 'moeda' });
const negrito = (c: Celula): Celula => ({ ...c, negrito: true });

function abaDosInscritos(): Planilha {
  const conteudo: string[][] = [
    ['Nome', 'Unidade', 'Diárias', 'Valor'],
    ...INSCRITOS.map(i => [i.nome, i.unidade, String(i.diarias), String(i.valor)]),
    [],
    ['', '', 'Total', FORMULA_INICIAL],
  ];
  const p = planilhaDe('Inscritos', conteudo, {
    tabela: { l1: 0, c1: 0, l2: INSCRITOS.length, c2: 3 },
  });
  return {
    ...p,
    larguras: p.larguras.map((w, c) => (c === 0 ? 110 : w)),
    celulas: p.celulas.map((linha, l) => linha.map((cel, c) => {
      if (l === 0 && c <= 3) return negrito(cel);
      if (c === COLUNA_DO_VALOR && l >= 1 && l <= CELULA_DO_TOTAL.l) return emReais(l === CELULA_DO_TOTAL.l ? negrito(cel) : cel);
      if (l === CELULA_DO_TOTAL.l && c === 2) return negrito(cel);
      return cel;
    })),
  };
}

function abaDosMeses(): Planilha {
  const p = planilhaDe('Por mês', [
    ['Mês', 'Inscrições'],
    ...INSCRICOES_POR_MES.map(m => [m.mes, String(m.total)]),
  ]);
  return { ...p, celulas: p.celulas.map((linha, l) => linha.map(cel => (l === 0 ? negrito(cel) : cel))) };
}

/** A pasta de partida. Função, e não constante: cada lição parte de uma cópia limpa. */
export const acampamentoInicial = (): Caderno => ({
  planilhas: [abaDosInscritos(), abaDosMeses()],
  ativa: ABA_DOS_INSCRITOS,
});

/* ── As contas ─────────────────────────────────────────────────────────────── */

const inscritos = (cad: Caderno) => cad.planilhas[ABA_DOS_INSCRITOS];
const meses = (cad: Caderno) => cad.planilhas[ABA_DOS_MESES];

const numero = (p: Planilha, l: number, c: number): number | null => {
  const v = valorCalculado(p, l, c);
  return v.tipo === 'numero' ? v.n : null;
};

/** O que a célula do total mostra agora. */
export const totalDaCelula = (cad: Caderno): number | null =>
  numero(inscritos(cad), CELULA_DO_TOTAL.l, CELULA_DO_TOTAL.c);

/** A soma do que está à vista — o que a barra de status mostra com a coluna selecionada. */
export function totalNaTela(cad: Caderno): number {
  const p = inscritos(cad);
  let soma = 0;
  for (let l = 1; l <= INSCRITOS.length; l++) {
    if (linhaEscondida(p, l)) continue;
    soma += numero(p, l, COLUNA_DO_VALOR) ?? 0;
  }
  return soma;
}

/** Quantos inscritos aparecem na tela. */
export function inscritosVisiveis(cad: Caderno): number {
  const p = inscritos(cad);
  let n = 0;
  for (let l = 1; l <= INSCRITOS.length; l++) if (!linhaEscondida(p, l)) n++;
  return n;
}

const TOTAL_DE_TODOS = INSCRITOS.reduce((s, i) => s + i.valor, 0);

export interface MetaDoAcampamento {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (cad: Caderno) => boolean;
}

export const METAS_DO_ACAMPAMENTO: MetaDoAcampamento[] = [
  {
    id: 'filtro',
    titulo: 'Filtrar por uma unidade',
    detalhe: 'São cento e vinte linhas e você precisa ver só as de uma unidade. Ligue o filtro e escolha uma — e repare que as outras continuam lá, escondidas.',
    onde: 'Dados › Classificar e Filtrar › Filtro',
    passos: [
      'Clique em qualquer célula da tabela.',
      'Na guia Dados, clique em Filtro: aparecem setinhas no cabeçalho.',
      'Clique na setinha da coluna Unidade e escolha uma.',
      'Repare nos números das linhas à esquerda: eles pulam, porque as outras linhas continuam lá.',
    ],
    feita: cad => {
      const f = inscritos(cad).filtro;
      return !!f && f.coluna === COLUNA_DA_UNIDADE && f.valor !== '' && inscritosVisiveis(cad) > 0;
    },
  },
  {
    id: 'soma',
    titulo: 'Fazer o total respeitar o filtro',
    detalhe: 'Com o filtro aplicado, a célula D123 continua somando as cento e vinte — inclusive as escondidas. Selecione a coluna Valor e compare com a Soma do rodapé: elas não batem. Troque a fórmula por uma que respeite o filtro.',
    onde: 'Na célula D123, ou na barra de fórmulas',
    passos: [
      'Selecione D2 até D121 e leia a Soma na barra de status, embaixo à direita.',
      'Compare com o número da célula D123: ele é maior.',
      `Clique em D123 e escreva ${FORMULA_QUE_RESPEITA} — o 109 é a soma que ignora o que está escondido.`,
      'Agora os dois números batem, e continuam batendo quando você troca a unidade do filtro.',
    ],
    /*
      Três condições, e nenhuma é redundante.

      A fórmula sozinha deixaria passar quem a escreveu sem nunca ter filtrado
      nada — e a lição inteira é a diferença entre os dois números, que só
      existe com filtro aplicado. O número batendo com a tela deixaria passar
      `=SUBTOTAL(109;D2:D40)` numa unidade cujas linhas visíveis por acaso
      somam o mesmo; tirar o filtro **dentro da conferência** é o que mostra
      que a faixa alcança os cento e vinte.
    */
    feita: cad => {
      const p = inscritos(cad);
      const texto = p.celulas[CELULA_DO_TOTAL.l]?.[CELULA_DO_TOTAL.c]?.texto ?? '';
      if (!/^\s*=\s*SUBTOTAL\s*\(/i.test(texto)) return false;
      if (!p.filtro?.valor) return false;
      if (totalDaCelula(cad) !== totalNaTela(cad)) return false;
      const semFiltro = { ...cad, planilhas: cad.planilhas.map((q, i) => (i === ABA_DOS_INSCRITOS ? { ...q, filtro: null } : q)) };
      return totalDaCelula(semFiltro) === TOTAL_DE_TODOS;
    },
  },
  {
    id: 'congelar',
    titulo: 'Congelar a linha do cabeçalho',
    detalhe: 'Ao rolar para a linha 80, o cabeçalho já saiu da tela e as colunas viram letras sem nome. Prenda a primeira linha no alto.',
    onde: 'Exibir › Janela › Congelar Painéis',
    passos: [
      'Vá na guia Exibir.',
      'Clique em Congelar Painéis e escolha Congelar Linha Superior.',
      'Role a tabela: o cabeçalho fica, o resto passa por baixo dele.',
      'Congelar é coisa de tela — não muda dado nenhum e não aparece na impressão.',
    ],
    feita: cad => inscritos(cad).congeladas >= 1,
  },
  {
    id: 'grafico',
    titulo: 'Desenhar como a inscrição cresceu',
    detalhe: 'A pergunta é de evolução: como a inscrição cresceu de janeiro a junho. Escolha o tipo de gráfico que responde isso — pizza responde composição, colunas respondem comparação, e nenhuma das duas mostra que março veio depois de fevereiro.',
    onde: 'Aba Por mês › Inserir › Gráficos',
    passos: [
      'Abra a aba Por mês, no pé da janela.',
      'Selecione A1 até B7, os meses com os números.',
      'Em Inserir, clique em Gráfico de Linhas.',
    ],
    /* Os seis meses dentro da faixa: um gráfico de linhas sobre três deles
       desenha uma subida, e não a de janeiro a junho. */
    feita: cad => {
      const q = meses(cad);
      return q.grafico?.tipo === 'linha' && pontosDoGrafico(q).length === INSCRICOES_POR_MES.length;
    },
  },
  {
    id: 'rotulos',
    titulo: 'Dar título ao gráfico e nomear os eixos',
    detalhe: 'Sem eles, o gráfico é um desenho bonito que não afirma nada — e quem lê precisa adivinhar o que está medido.',
    onde: 'Design do Gráfico › Adicionar Elemento Gráfico',
    passos: [
      'Clique no gráfico para que a guia Design do Gráfico apareça.',
      'Em Adicionar Elemento Gráfico, escreva o título.',
      'Ainda ali, escreva o título de cada eixo.',
    ],
    feita: cad => {
      const g = meses(cad).grafico;
      return !!g && g.titulo.trim().length >= 4 && g.eixoX.trim() !== '' && g.eixoY.trim() !== '';
    },
  },
];
