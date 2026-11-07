/**
 * O projeto de dados que a teoria da CC-ES013 fotografa: o tempo de tela e o
 * sono do clube.
 *
 * ── Por que outra base ───────────────────────────────────────────────────
 * O laboratório responde se quem mora mais longe falta mais às reuniões, sobre
 * a chamada do semestre, e cada número dela é a resposta de uma lição: a média
 * da presença, a mediana da distância, a Carla repetida, o 1.250 da Isabela, a
 * correlação de -0,70. A teoria citava todos eles, e quem lia a teoria chegava
 * ao laboratório com o gabarito decorado.
 *
 * Esta é outra pergunta do mesmo clube — **quem passa mais tempo no celular
 * dorme menos?** —, sobre um questionário respondido pelas famílias, com os
 * mesmos tipos de defeito em outros lugares: a grafia da unidade e do grupo,
 * uma linha repetida, dois homônimos, número guardado como texto, um
 * impossível com evidência e outro sem, e três famílias que não responderam.
 * `exemplosDoProjetoDeDados.test.ts` confere cada número das telas por esta
 * base, e reprova se ela passar a dividir uma pessoa com a chamada do
 * laboratório.
 */

import type { Nuvem, ArquivoDaNuvem } from '../labs/arquivoCompartilhado';
import { planilhaDe, type Caderno, type Planilha } from '../labs/planilha';

export type Celular = 'No quarto' | 'Fora do quarto' | 'Não tem';
export const GRUPOS: Celular[] = ['No quarto', 'Fora do quarto', 'Não tem'];

export interface Respondente {
  nome: string;
  unidade: string;
  /** `null` quando o certo não se sabe. */
  idade: number | null;
  /** As três ficam `null` juntas para quem não respondeu ao questionário. */
  celular: Celular | null;
  tela: number | null;
  sono: number | null;
}

export const CABECALHO_DO_SONO = [
  'Nome', 'Unidade', 'Idade', 'Celular à noite', 'Tela (h por dia)', 'Sono (h por noite)',
];

/**
 * Os sessenta e dois, como a tratada deve ficar.
 *
 * Os dois João Victor Alves são duas pessoas — um no Jaguar, outro no Falcão —,
 * e é por eles que Remover Duplicatas só com o nome marcado apaga gente.
 */
const RESPONDENTES_BASE: Respondente[] = [
  { nome: 'Amanda Dantas', unidade: 'Tucano', idade: 11, celular: 'No quarto', tela: 3, sono: 8.5 },
  { nome: 'Breno Kehl', unidade: 'Águia', idade: 12, celular: 'Fora do quarto', tela: 4.5, sono: 9 },
  { nome: 'Camila Rosário', unidade: 'Falcão', idade: 10, celular: 'No quarto', tela: 4, sono: 8 },
  { nome: 'Diego Esteves', unidade: 'Onça', idade: 15, celular: 'No quarto', tela: 4, sono: 8 },
  { nome: 'Elisa Leite', unidade: 'Jaguar', idade: 13, celular: 'Fora do quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Fábio Siqueira', unidade: 'Arara', idade: 13, celular: 'No quarto', tela: 2, sono: 8.5 },
  { nome: 'Giovana Farias', unidade: 'Tucano', idade: 11, celular: 'Fora do quarto', tela: 4.5, sono: 8.5 },
  { nome: 'Hugo Macedo', unidade: 'Águia', idade: 10, celular: 'Não tem', tela: 1, sono: 9.5 },
  { nome: 'Iara Tavares', unidade: 'Falcão', idade: 10, celular: 'Fora do quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Jonas Gusmão', unidade: 'Onça', idade: 10, celular: 'No quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Kauã Neves', unidade: 'Jaguar', idade: 13, celular: 'Fora do quarto', tela: 5, sono: 8.5 },
  { nome: 'Letícia Aragão', unidade: 'Arara', idade: 14, celular: null, tela: null, sono: null },
  { nome: 'Marcelo Holanda', unidade: 'Tucano', idade: 12, celular: 'No quarto', tela: 10.5, sono: 6 },
  { nome: 'Nina Oliveira', unidade: 'Águia', idade: 10, celular: 'Fora do quarto', tela: 4, sono: 8.5 },
  { nome: 'Otávio Barreto', unidade: 'Falcão', idade: 11, celular: 'No quarto', tela: 3, sono: 7.5 },
  { nome: 'Pietra Izidoro', unidade: 'Onça', idade: 14, celular: 'Fora do quarto', tela: 3, sono: 8.5 },
  { nome: 'Raul Prates', unidade: 'Jaguar', idade: 14, celular: 'No quarto', tela: 4, sono: 8 },
  { nome: 'Sara Cordeiro', unidade: 'Arara', idade: 12, celular: 'Fora do quarto', tela: 4, sono: 9.5 },
  { nome: 'Tomás Jardim', unidade: 'Tucano', idade: 12, celular: 'No quarto', tela: 4, sono: 8 },
  { nome: 'Úrsula Quaresma', unidade: 'Águia', idade: 11, celular: 'Fora do quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Vicente Dantas', unidade: 'Falcão', idade: 10, celular: 'No quarto', tela: 4, sono: 8 },
  { nome: 'Wesley Kehl', unidade: 'Onça', idade: 12, celular: 'No quarto', tela: 2.5, sono: 8.5 },
  { nome: 'Yara Rosário', unidade: 'Jaguar', idade: 11, celular: 'Fora do quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Zeca Esteves', unidade: 'Arara', idade: 10, celular: 'Não tem', tela: 0.5, sono: 10 },
  { nome: 'Bianca Leite', unidade: 'Tucano', idade: 15, celular: 'Fora do quarto', tela: 4.5, sono: 9 },
  { nome: 'Caetano Siqueira', unidade: 'Águia', idade: 12, celular: 'No quarto', tela: 3.5, sono: 8 },
  { nome: 'Débora Farias', unidade: 'Falcão', idade: 12, celular: 'Fora do quarto', tela: 4.5, sono: 9 },
  { nome: 'Emanuel Macedo', unidade: 'Onça', idade: 11, celular: 'No quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Flávia Tavares', unidade: 'Jaguar', idade: 11, celular: 'Fora do quarto', tela: 4.5, sono: 9 },
  { nome: 'Gaspar Gusmão', unidade: 'Arara', idade: 12, celular: 'No quarto', tela: 4, sono: 8.5 },
  { nome: 'Heloísa Neves', unidade: 'Tucano', idade: 12, celular: null, tela: null, sono: null },
  { nome: 'Ítalo Aragão', unidade: 'Águia', idade: 15, celular: 'Fora do quarto', tela: 3, sono: 9 },
  { nome: 'Amanda Holanda', unidade: 'Falcão', idade: 15, celular: 'No quarto', tela: 10.5, sono: 6 },
  { nome: 'Breno Oliveira', unidade: 'Onça', idade: 12, celular: 'Fora do quarto', tela: 2.5, sono: 9.5 },
  { nome: 'Camila Barreto', unidade: 'Jaguar', idade: 10, celular: 'No quarto', tela: 2.5, sono: 8.5 },
  { nome: 'Diego Izidoro', unidade: 'Arara', idade: 14, celular: 'Fora do quarto', tela: 4, sono: 8.5 },
  { nome: 'Elisa Prates', unidade: 'Tucano', idade: 12, celular: 'No quarto', tela: 3, sono: 8 },
  { nome: 'Fábio Cordeiro', unidade: 'Águia', idade: 15, celular: 'Fora do quarto', tela: 4, sono: 9 },
  { nome: 'Giovana Jardim', unidade: 'Falcão', idade: 13, celular: 'No quarto', tela: 3.5, sono: 8 },
  { nome: 'Hugo Quaresma', unidade: 'Onça', idade: 14, celular: 'No quarto', tela: 3, sono: 7.5 },
  { nome: 'Iara Dantas', unidade: 'Jaguar', idade: 11, celular: 'Fora do quarto', tela: 3.5, sono: 8.5 },
  { nome: 'Jonas Kehl', unidade: 'Arara', idade: 11, celular: 'Não tem', tela: 1, sono: 10 },
  { nome: 'Kauã Rosário', unidade: 'Tucano', idade: 11, celular: 'Fora do quarto', tela: 4, sono: 9 },
  { nome: 'Letícia Esteves', unidade: 'Águia', idade: 13, celular: 'No quarto', tela: 9, sono: 6 },
  { nome: 'Marcelo Leite', unidade: 'Falcão', idade: 12, celular: 'Fora do quarto', tela: 3.5, sono: 9.5 },
  { nome: 'Nina Siqueira', unidade: 'Onça', idade: 10, celular: 'No quarto', tela: 3, sono: 7.5 },
  { nome: 'Otávio Farias', unidade: 'Jaguar', idade: 14, celular: 'Fora do quarto', tela: 4, sono: 9.5 },
  { nome: 'Pietra Macedo', unidade: 'Arara', idade: 12, celular: null, tela: null, sono: null },
  { nome: 'Raul Tavares', unidade: 'Tucano', idade: 10, celular: 'No quarto', tela: 9, sono: 6 },
  { nome: 'Sara Gusmão', unidade: 'Águia', idade: 12, celular: 'Fora do quarto', tela: 3.5, sono: 9 },
  { nome: 'Tomás Neves', unidade: 'Falcão', idade: 14, celular: 'No quarto', tela: 4, sono: 7.5 },
  { nome: 'Úrsula Aragão', unidade: 'Onça', idade: 15, celular: 'Fora do quarto', tela: 5, sono: 9.5 },
  { nome: 'Vicente Holanda', unidade: 'Jaguar', idade: 12, celular: 'Não tem', tela: 1.5, sono: 9 },
  { nome: 'Wesley Oliveira', unidade: 'Arara', idade: 14, celular: 'Fora do quarto', tela: 4, sono: 8.5 },
  { nome: 'Yara Barreto', unidade: 'Tucano', idade: 11, celular: 'No quarto', tela: 3, sono: 8 },
  { nome: 'Zeca Izidoro', unidade: 'Águia', idade: 13, celular: 'Fora do quarto', tela: 2.5, sono: 9.5 },
  { nome: 'Bianca Prates', unidade: 'Falcão', idade: 13, celular: 'No quarto', tela: 3, sono: 8 },
  { nome: 'Caetano Cordeiro', unidade: 'Onça', idade: 14, celular: 'No quarto', tela: 3.5, sono: 7.5 },
  { nome: 'Débora Jardim', unidade: 'Jaguar', idade: 12, celular: 'Fora do quarto', tela: 4, sono: 9 },
  { nome: 'Emanuel Quaresma', unidade: 'Arara', idade: 13, celular: 'No quarto', tela: 3, sono: 8.5 },
  { nome: 'João Victor Alves', unidade: 'Jaguar', idade: 12, celular: 'No quarto', tela: 4.5, sono: 7.5 },
  { nome: 'João Victor Alves', unidade: 'Falcão', idade: 14, celular: 'Fora do quarto', tela: 4.5, sono: 9 },
];

/**
 * A idade da Elisa Prates chega como 21, e pode ser 11 ou 12 — as teclas são
 * vizinhas e a ordem pode ter se trocado. Sem evidência, a célula fica vazia.
 */
export const RESPONDENTES: Respondente[] = RESPONDENTES_BASE.map(r =>
  (r.nome === 'Elisa Prates' ? { ...r, idade: null } : r));

export const numeroEscrito = (n: number): string => String(n).replace('.', ',');

/**
 * O que o questionário fez com cada linha, pelo nome.
 *
 * Cada entrada troca o texto de uma coluna da bruta. A coluna é o índice do
 * cabeçalho, e o texto é o que a exportação escreveu.
 */
export const DEFEITOS_DO_SONO: { nome: string; coluna: number; escrito: string; certo: string }[] = [
  { nome: 'Elisa Leite', coluna: 1, escrito: 'jaguar', certo: 'Jaguar' },
  { nome: 'Yara Rosário', coluna: 1, escrito: 'JAGUAR', certo: 'Jaguar' },
  { nome: 'Iara Tavares', coluna: 1, escrito: 'falcao', certo: 'Falcão' },
  { nome: 'Débora Farias', coluna: 1, escrito: 'Falcao', certo: 'Falcão' },
  { nome: 'Ítalo Aragão', coluna: 1, escrito: 'aguia', certo: 'Águia' },
  { nome: 'Pietra Izidoro', coluna: 3, escrito: 'no quarto', certo: 'No quarto' },
  { nome: 'Sara Cordeiro', coluna: 3, escrito: 'fora do quarto', certo: 'Fora do quarto' },
  { nome: 'Hugo Quaresma', coluna: 3, escrito: 'NO QUARTO', certo: 'No quarto' },
  { nome: 'Camila Rosário', coluna: 4, escrito: '4 h', certo: '4' },
  { nome: 'Jonas Gusmão', coluna: 4, escrito: '3.5', certo: '3,5' },
  { nome: 'Vicente Dantas', coluna: 4, escrito: '4h', certo: '4' },
  { nome: 'Breno Oliveira', coluna: 4, escrito: '2.5', certo: '2,5' },
  /* O impossível com evidência: ninguém passa 35 horas por dia na tela, e o
     questionário de papel da família diz "três e meia". */
  { nome: 'Emanuel Macedo', coluna: 4, escrito: '35', certo: '3,5' },
  /* O impossível sem evidência. */
  { nome: 'Elisa Prates', coluna: 2, escrito: '21', certo: '' },
];

/** A linha repetida: a Nina Oliveira, a segunda vez com outra grafia. */
export const REPETIDA = { nome: 'Nina Oliveira', diferencas: { 1: 'aguia', 3: 'fora do quarto' } as Record<number, string> };

const celulas = (r: Respondente): string[] => [
  r.nome, r.unidade, r.idade === null ? '' : String(r.idade), r.celular ?? '',
  r.tela === null ? '' : numeroEscrito(r.tela), r.sono === null ? '' : numeroEscrito(r.sono),
];

/** A tratada como deve ficar: uma linha por pessoa, tudo número. */
export const linhasTratadas = (): string[][] => RESPONDENTES.map(celulas);

/** A bruta como a exportação a escreveu. */
export function linhasBrutasDoSono(): string[][] {
  const linhas: string[][] = [];
  for (const r of RESPONDENTES_BASE) {
    const l = celulas(r);
    for (const d of DEFEITOS_DO_SONO) if (d.nome === r.nome) l[d.coluna] = d.escrito;
    linhas.push(l);
    if (r.nome === REPETIDA.nome) {
      const rep = [...l];
      for (const [c, t] of Object.entries(REPETIDA.diferencas)) rep[Number(c)] = t;
      linhas.push(rep);
    }
  }
  return linhas;
}

const LARGURAS = [150, 80, 50, 112, 112, 124];

function aba(nome: string, linhas: string[][]): Planilha {
  const conteudo = [CABECALHO_DO_SONO, ...linhas];
  const p = planilhaDe(nome, conteudo, {
    tabela: { l1: 0, c1: 0, l2: conteudo.length - 1, c2: CABECALHO_DO_SONO.length - 1 },
    congeladas: 1,
  });
  return { ...p, larguras: p.larguras.map((l, i) => LARGURAS[i] ?? l) };
}

export const abaBrutaDoSono = () => aba('Bruta', linhasBrutasDoSono());

/**
 * A tratada depois da grafia: a cópia da bruta com a unidade e o grupo
 * escritos de um jeito só. A linha repetida continua lá — e agora idêntica à
 * primeira, que é o que deixa Remover Duplicatas achá-la.
 */
export function abaComGrafiaArrumada(): Planilha {
  const certo = new Map<string, string>([
    ...DEFEITOS_DO_SONO.filter(d => d.coluna === 1 || d.coluna === 3)
      .map(d => [d.escrito, d.certo] as [string, string]),
    ['aguia', 'Águia'], ['fora do quarto', 'Fora do quarto'],
  ]);
  const linhas = linhasBrutasDoSono().map(l =>
    l.map((t, c) => ((c === 1 || c === 3) && certo.has(t) ? certo.get(t)! : t)));
  return aba('Tratada', linhas);
}

export const abaTratadaDoSono = () => aba('Tratada', linhasTratadas());

/**
 * A tratada com a grafia, a repetida e o texto consertados, e os dois
 * impossíveis ainda lá: o 35 da tela e o 21 da idade. É onde classificar
 * mostra as pontas.
 */
export function abaComImpossiveis(): Planilha {
  const impossiveis = DEFEITOS_DO_SONO.filter(d => d.escrito === '35' || d.escrito === '21');
  const linhas = RESPONDENTES_BASE.map(r => {
    const l = celulas(r);
    for (const d of impossiveis) if (d.nome === r.nome) l[d.coluna] = d.escrito;
    return l;
  });
  return aba('Tratada', linhas);
}

/** A última linha da tratada na planilha, contando o cabeçalho: 63. */
export const ULTIMA_LINHA_DO_SONO = RESPONDENTES.length + 1;

const rotulos = (nome: string, cabecalho: string[], linhas: string[][], larguras: number[]): Planilha => {
  const p = planilhaDe(nome, [cabecalho, ...linhas], {
    tabela: { l1: 0, c1: 0, l2: linhas.length, c2: cabecalho.length - 1 },
  });
  return { ...p, larguras: p.larguras.map((l, i) => larguras[i] ?? l) };
};

export const abaDeCalculosDoSono = () => rotulos('Cálculos', ['Medida', 'Valor'], [
  ['Tela — média'], ['Tela — mediana'], ['Tela — desvio padrão'],
  ['Sono — média'], ['Sono — mediana'], ['Sono — desvio padrão'],
], [220, 110]);

export const abaDeGruposDoSono = () => rotulos('Grupos',
  ['Celular à noite', 'Quantos', 'Média de tela', 'Média de sono'],
  GRUPOS.map(g => [g]), [130, 80, 120, 120]);

export type EstadoDoSono = 'bruta' | 'com-copia' | 'grafia' | 'impossiveis' | 'tratada' | 'calculos' | 'grupos';

/** De que pasta de trabalho cada cena parte. */
export function cadernoDoSono(estado: EstadoDoSono): Caderno {
  const bruta = abaBrutaDoSono();
  switch (estado) {
    case 'bruta': return { planilhas: [bruta], ativa: 0 };
    case 'com-copia': return { planilhas: [bruta, { ...bruta, nome: 'Tratada' }], ativa: 1 };
    case 'grafia': return { planilhas: [bruta, abaComGrafiaArrumada()], ativa: 1 };
    case 'impossiveis': return { planilhas: [bruta, abaComImpossiveis()], ativa: 1 };
    case 'tratada': return { planilhas: [bruta, abaTratadaDoSono()], ativa: 1 };
    case 'calculos': return { planilhas: [bruta, abaTratadaDoSono(), abaDeCalculosDoSono()], ativa: 2 };
    case 'grupos': return { planilhas: [bruta, abaTratadaDoSono(), abaDeCalculosDoSono(), abaDeGruposDoSono()], ativa: 3 };
  }
}

/* ── A nuvem da entrega ───────────────────────────────────────────────────── */

const arquivo = (id: string, nome: string, tipo: ArquivoDaNuvem['tipo'], extra: Partial<ArquivoDaNuvem> = {}): ArquivoDaNuvem =>
  ({ id, nome, tipo, dono: 'voce', acessos: [], versoes: [{ id: 'v1', quando: '2026-09-02', porQuem: ['voce'] }], ...extra });

export const PASTA_DO_SONO = 'pasta-sono';

/**
 * A nuvem do projeto do sono, como a entrega a recebe: tudo na raiz e duas
 * cópias do questionário com o mesmo nome visto de longe, uma delas editada.
 */
export const NUVEM_DO_SONO: Nuvem = {
  arquivos: [
    arquivo(PASTA_DO_SONO, 'Projeto de dados — tela e sono', 'pasta', { versoes: [] }),
    arquivo('s-bruta', 'questionario_sono_2026', 'planilha', {
      versoes: [{ id: 'v1', quando: '2026-09-02', porQuem: ['marta'] }],
    }),
    arquivo('s-bruta-mexida', 'questionario_sono_2026 (1)', 'planilha', {
      versoes: [
        { id: 'v1', quando: '2026-09-02', porQuem: ['marta'] },
        { id: 'v2', quando: '2026-09-04', porQuem: ['voce'] },
      ],
    }),
    arquivo('s-analise', 'Análise do sono — bruta, tratada e contas', 'planilha', {
      versoes: [{ id: 'v1', quando: '2026-09-15', porQuem: ['voce'] }],
    }),
    arquivo('s-relatorio', 'Relatório final — tela e sono', 'pdf', {
      versoes: [{ id: 'v1', quando: '2026-09-18', porQuem: ['voce'] }],
    }),
    arquivo('s-rascunho', 'Rascunho dos gráficos', 'documento', {
      versoes: [{ id: 'v1', quando: '2026-09-16', porQuem: ['voce'] }],
    }),
  ],
};

export const ARQUIVO_DA_ANALISE_DO_SONO = 'Análise do sono — bruta, tratada e contas';
