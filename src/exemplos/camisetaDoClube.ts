import {
  type Formulario, type Resposta, cabecalhoDe, linhasDe, respostasReais,
} from '../labs/formulario';
import {
  type Caderno, type TabelaDinamica, planilhaDe, resumir, atualizarResumo,
} from '../labs/planilha';
import { abaDe, comAba } from '../labs/cadernoDoClube';
import {
  type ContextoDeDados, ABA_AGENDA, ABA_AGENDA_ORDENADA, ABA_RELATORIO, ABA_RESPOSTAS,
  CABECALHO_DA_AGENDA, csvDaBase,
} from '../labs/metasDaCcEs008';
import type { OutrosDados } from '../components/LaboratorioDeDados';

/*
 * A encomenda da camiseta do clube: o que as telas da CC-ES008 fotografam.
 *
 * ── Por que outro formulário ─────────────────────────────────────────────
 * O laboratório abre a inscrição do acampamento de inverno (`formulario.ts`),
 * e quase tudo nela é resposta de alguma lição: o Falcão escrito de quatro
 * jeitos, a família sem unidade que é do Tucano, as diárias com ponto, o
 * envio repetido da Paula, a agenda das vinte e cinco famílias. Os quadros de
 * texto da teoria desenhavam essas mesmas tabelas, que é pôr o gabarito na
 * teoria — e, desenhadas com traços, não mostravam programa nenhum.
 *
 * Aqui é o mesmo clube, com as mesmas unidades, pedindo outra coisa: a
 * camiseta. Os defeitos são da mesma família e de outra gente — o Tucano
 * escrito de três jeitos, a Onça sem cedilha, um valor com ponto, um envio
 * repetido, uma resposta sem unidade. `exemplosDosDados.test.ts` confere as
 * legendas contra este formulário e reprova se ele passar a dividir uma
 * pessoa, um endereço ou um telefone com o do acampamento.
 */

export const CAMISETA_NOME = 'nome';
export const CAMISETA_UNIDADE = 'unidade';
export const CAMISETA_TELEFONE = 'telefone';
export const CAMISETA_VALOR = 'valor';
export const CAMISETA_TAMANHO = 'tamanho';

/* A coluna de cada campo na planilha: a primeira é "Enviado em". */
const COLUNA_DA_UNIDADE = 2;
const COLUNA_DO_VALOR = 4;

const resposta = (
  id: string, em: string, nome: string, unidade: string, telefone: string, valor: string, tamanho: string,
): Resposta => ({
  id, em,
  valores: {
    [CAMISETA_NOME]: nome, [CAMISETA_UNIDADE]: unidade, [CAMISETA_TELEFONE]: telefone,
    [CAMISETA_VALOR]: valor, [CAMISETA_TAMANHO]: tamanho,
  },
});

/**
 * As catorze encomendas, com os defeitos plantados:
 *
 *   - o Tucano escrito de três jeitos, e a Onça sem cedilha;
 *   - uma encomenda sem unidade;
 *   - o Jaguar com um espaço atrás, que não se vê;
 *   - um valor escrito com ponto, que numa planilha pt-BR é texto;
 *   - duas Kátia Nunes, de unidades diferentes, que só o instante separa;
 *   - um telefone em branco;
 *   - e um tamanho com ponto e vírgula dentro, que o CSV põe entre aspas.
 */
export const ENCOMENDAS: Resposta[] = [
  resposta('c01', '2026-08-03T18:05', 'Alice Fontes', 'Tucano', '(61) 98123-4501', '37,5', 'M'),
  resposta('c02', '2026-08-03T18:31', 'Bernardo Sales', 'tucano', '(61) 98123-4502', '75', 'P e G'),
  resposta('c03', '2026-08-03T19:10', 'Cecília Ramos', 'Águia', '(61) 98123-4503', '37,5', 'PP'),
  resposta('c04', '2026-08-04T07:48', 'Davi Moura', 'Onca', '(61) 98123-4504', '37,5', 'G'),
  resposta('c05', '2026-08-04T12:02', 'Elisa Prado', 'Onça', '(61) 98123-4505', '37,5', 'M'),
  resposta('c06', '2026-08-04T20:15', 'Fábio Teles', 'TUCANO', '(61) 98123-4506', '37.5', 'G'),
  resposta('c07', '2026-08-05T09:40', 'Giovana Reis', 'Arara', '(61) 98123-4507', '37,5', 'P'),
  resposta('c08', '2026-08-05T13:22', 'Heitor Vaz', '', '(61) 98123-4508', '37,5', 'M'),
  resposta('c09', '2026-08-05T19:57', 'Íris Campelo', 'Jaguar', '(61) 98123-4509', '75', 'M; manga longa, se tiver'),
  resposta('c10', '2026-08-06T08:30', 'Júlio Bastos', 'Falcão', '(61) 98123-4510', '37,5', 'GG'),
  resposta('c11', '2026-08-06T17:14', 'Kátia Nunes', 'Águia', '(61) 98123-4511', '37,5', 'P'),
  /* Outra Kátia Nunes, de outra unidade: o nome não serve de chave. */
  resposta('c12', '2026-08-06T19:52', 'Kátia Nunes', 'Falcão', '(61) 98123-4512', '37,5', 'G'),
  /* O espaço atrás do Jaguar, e o telefone que ninguém pediu como obrigatório. */
  resposta('c13', '2026-08-07T10:06', 'Lucas Brandão', 'Jaguar ', '', '37,5', 'G'),
  resposta('c14', '2026-08-07T21:45', 'Manuela Rocha', 'Falcão', '(61) 98123-4514', '37,5', 'M'),
];

/** A encomenda como ela chega: tudo em resposta curta, nada obrigatório. */
export function encomendaComoChega(): Formulario {
  return {
    titulo: 'Encomenda — Camiseta do clube 2026',
    descricao: 'Uma encomenda por desbravador. O pedido fecha no dia 14 de agosto.',
    aceitandoRespostas: true,
    campos: [
      { id: CAMISETA_NOME, rotulo: 'Nome do desbravador', tipo: 'texto-curto', obrigatorio: false, pessoal: true },
      { id: CAMISETA_UNIDADE, rotulo: 'Unidade', tipo: 'texto-curto', obrigatorio: false, pessoal: false },
      { id: CAMISETA_TELEFONE, rotulo: 'Telefone do responsável', tipo: 'texto-curto', obrigatorio: false, pessoal: true },
      { id: CAMISETA_VALOR, rotulo: 'Valor pago (R$)', tipo: 'texto-curto', obrigatorio: false, pessoal: false },
      { id: CAMISETA_TAMANHO, rotulo: 'Tamanho', tipo: 'paragrafo', obrigatorio: false, pessoal: false },
    ],
    respostas: ENCOMENDAS,
  };
}

export const UNIDADES_DA_LISTA = ['Águia', 'Arara', 'Falcão', 'Jaguar', 'Onça', 'Tucano'];

/** Depois do primeiro ajuste: a unidade sai de uma lista e o valor é número. */
export function encomendaArrumada(): Formulario {
  const f = encomendaComoChega();
  return {
    ...f,
    campos: f.campos.map((c) => {
      if (c.id === CAMISETA_UNIDADE) return { ...c, tipo: 'lista' as const, opcoes: UNIDADES_DA_LISTA };
      if (c.id === CAMISETA_VALOR) return { ...c, tipo: 'numero' as const };
      return c;
    }),
  };
}

/* As colunas do tamanho do que cabe nelas, para a tela ler sem cortar. */
const LARGURAS = [128, 132, 86, 160, 104, 170];
const comLarguras = <T extends { larguras: number[] }>(p: T): T =>
  ({ ...p, larguras: p.larguras.map((l, i) => LARGURAS[i] ?? l) });

const contexto = (formulario: Formulario, caderno: Caderno): ContextoDeDados => ({
  formulario, formularioAntes: formulario, caderno, cadernoAntes: caderno,
  descobertas: [], csv: null, pessoaisMarcados: [], cuidadosEscolhidos: [],
});

const vazio = (): Caderno => ({ planilhas: [planilhaDe(ABA_RESPOSTAS, []), planilhaDe(ABA_RELATORIO, [])], ativa: 0 });

/** A pasta como ela chega do "Criar planilha": título em cima e total embaixo. */
export function pastaMisturada(f = encomendaArrumada()): Caderno {
  const cabecalho = cabecalhoDe(f);
  const linhas = linhasDe(f);
  return {
    planilhas: [
      comLarguras(planilhaDe(ABA_RESPOSTAS, [
        ['Encomendas da camiseta 2026'],
        cabecalho,
        ...linhas,
        [],
        ['TOTAL', '', '', '', `=SOMA(E3:E${2 + linhas.length})`],
      ], { tabela: { l1: 0, c1: 0, l2: 2 + linhas.length, c2: cabecalho.length - 1 } })),
      planilhaDe(ABA_RELATORIO, []),
    ],
    ativa: 0,
  };
}

/** A base limpa: o cabeçalho na primeira linha, só registros, e a soma na outra aba. */
export function pastaLimpa(f = encomendaArrumada()): Caderno {
  const cabecalho = cabecalhoDe(f);
  const linhas = linhasDe(f);
  return {
    planilhas: [
      comLarguras(planilhaDe(ABA_RESPOSTAS, [cabecalho, ...linhas], {
        tabela: { l1: 0, c1: 0, l2: linhas.length, c2: cabecalho.length - 1 },
      })),
      planilhaDe(ABA_RELATORIO, [['Valor recebido', `=SOMA(${ABA_RESPOSTAS}!E2:E${linhas.length + 1})`]], {
        larguras: [150, 100, ...new Array(10).fill(92)],
      }),
    ],
    ativa: 0,
  };
}

/** A base limpa com o resumo "quantos por unidade" já montado, na aba Relatório. */
export function pastaComResumo(f = encomendaArrumada()): Caderno {
  const limpa = pastaLimpa(f);
  const t: TabelaDinamica = {
    em: { l: 3, c: 0 },
    origem: {
      planilha: ABA_RESPOSTAS,
      faixa: { l1: 0, c1: 0, l2: respostasReais(f).length, c2: cabecalhoDe(f).length - 1 },
    },
    linha: COLUNA_DA_UNIDADE,
    valor: { coluna: COLUNA_DO_VALOR, como: 'contagem' },
    retrato: [],
  };
  return comAba(limpa, {
    ...abaDe(limpa, ABA_RELATORIO),
    resumo: { ...t, retrato: resumir(abaDe(limpa, ABA_RESPOSTAS), t) },
  });
}

/** De que unidade é quem deixou em branco: o clube sabe, e é o Heitor, da Arara. */
export const UNIDADE_DO_HEITOR = 'Arara';

/** A base consertada: uma grafia por unidade, ninguém sem unidade, o valor lido como número. */
export function pastaConsertada(f = encomendaArrumada()): Caderno {
  const cad = pastaComResumo(f);
  const base = abaDe(cad, ABA_RESPOSTAS);
  const certa = (v: string) =>
    UNIDADES_DA_LISTA.find(u => u.localeCompare(v.trim(), 'pt-BR', { sensitivity: 'base' }) === 0) ?? v;
  const n = respostasReais(f).length;
  const arrumada = planilhaDe(ABA_RESPOSTAS, base.celulas.map((linha, l) => linha.map((cel, col) => {
    if (l === 0 || l > n) return cel.texto;
    if (col === COLUNA_DA_UNIDADE) return cel.texto.trim() ? certa(cel.texto) : UNIDADE_DO_HEITOR;
    if (col === COLUNA_DO_VALOR) return cel.texto.replace('.', ',');
    return cel.texto;
  })), { tabela: base.tabela, larguras: base.larguras });
  const comBase = comAba(cad, arrumada);
  const relatorio = abaDe(comBase, ABA_RELATORIO);
  return comAba(comBase, { ...relatorio, resumo: atualizarResumo(comBase, relatorio.resumo!) });
}

/**
 * A agenda dos instrutores de especialidade, na ordem em que foram convidados.
 *
 * Não é a agenda das famílias do laboratório: outra gente, outros endereços,
 * e oito linhas, que bastam para ver a ordem de chegada virar ordem de nome.
 */
export const INSTRUTORES: string[][] = [
  ['Rogério Paiva', '(61) 99410-2201', 'Quadra 12, casa 4', 'rogerio.paiva@exemplo.com'],
  ['Dona Zélia Pinto', '(61) 99410-2202', 'Rua das Acácias, 80', 'zelia.pinto@exemplo.com'],
  ['Caio Medeiros', '(61) 99410-2203', 'Quadra 3, casa 17', 'caio.medeiros@exemplo.com'],
  ['Tânia Freitas', '(61) 99410-2204', 'Rua do Ipê, 210', 'tania.freitas@exemplo.com'],
  ['Augusto Leme', '(61) 99410-2205', 'Quadra 7, casa 2', 'augusto.leme@exemplo.com'],
  ['Mirela Duarte', '(61) 99410-2206', 'Rua das Palmeiras, 15', 'mirela.duarte@exemplo.com'],
  ['Benedito Sá', '(61) 99410-2207', 'Quadra 9, casa 11', 'benedito.sa@exemplo.com'],
  ['Helena Brito', '(61) 99410-2208', 'Rua do Cerrado, 44', 'helena.brito@exemplo.com'],
];

export function pastaComAgenda(): Caderno {
  const limpa = pastaConsertada();
  return {
    planilhas: [
      ...limpa.planilhas,
      planilhaDe(ABA_AGENDA_ORDENADA, [], { larguras: [140, 120, 170, 200, ...new Array(8).fill(92)] }),
      planilhaDe(ABA_AGENDA, [[...CABECALHO_DA_AGENDA], ...INSTRUTORES], {
        tabela: { l1: 0, c1: 0, l2: INSTRUTORES.length, c2: CABECALHO_DA_AGENDA.length - 1 },
        larguras: [140, 120, 170, 200, ...new Array(8).fill(92)],
      }),
    ],
    ativa: 3,
  };
}

export type EstadoDaCamiseta = 'campos' | 'validacao' | 'base' | 'resumo' | 'conserto' | 'csv' | 'agenda';

const CONTEXTOS: Record<EstadoDaCamiseta, () => ContextoDeDados> = {
  campos: () => contexto(encomendaComoChega(), vazio()),
  validacao: () => contexto(encomendaArrumada(), vazio()),
  base: () => contexto(encomendaArrumada(), pastaMisturada()),
  resumo: () => contexto(encomendaArrumada(), pastaLimpa()),
  conserto: () => contexto(encomendaArrumada(), pastaComResumo()),
  csv: () => contexto(encomendaArrumada(), pastaConsertada()),
  agenda: () => contexto(encomendaArrumada(), pastaComAgenda()),
};

export const NOME_DO_CSV_DA_CAMISETA = 'camisetas-2026-08-14-v01.csv';

/** O formulário da camiseta, partindo do estado que o tópico mostra. */
export const naCamiseta = (estado: EstadoDaCamiseta): OutrosDados => ({
  inicial: CONTEXTOS[estado],
  programa: estado === 'campos' || estado === 'validacao' ? 'formulario' : 'planilha',
  arquivo: 'Camisetas 2026',
  csv: NOME_DO_CSV_DA_CAMISETA,
});

/** O CSV que a base consertada exporta: é o que o bloco de notas mostra. */
export const csvDaCamiseta = (): string => csvDaBase(CONTEXTOS.csv());
