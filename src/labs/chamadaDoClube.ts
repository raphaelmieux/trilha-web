/**
 * A base da CC-ES013: a chamada do primeiro semestre, cruzada com o
 * questionário de transporte.
 *
 * ── A mesma gente da CC-ES009 ────────────────────────────────────────────
 * O clube tem sessenta e um membros, e são os mesmos de lá: os quarenta e oito
 * que se inscreveram no acampamento, com o nome, a unidade e a idade que eles
 * escreveram, e os treze que ficaram de fora — três do Falcão e dois de cada
 * outra unidade, que é a conta de `ELENCO`. Uma base nova com gente inventada
 * ensinaria que cada vereda acontece num clube de mentira.
 *
 * ── Sessenta e um, e é de propósito ──────────────────────────────────────
 * O requisito 3 pede sessenta registros, e a base de inscrições da CC-ES009,
 * com quarenta e oito, não chega lá: é por isso que ela aparece entre as
 * candidatas do módulo 2. Esta chega com folga de **um**, e a folga curta é a
 * lição do requisito 4 encostando no 3: excluir a linha inteira de quem não
 * respondeu ao questionário — quatro pessoas — derruba a base para cinquenta e
 * sete, e a análise passa a ser sobre uma base que o requisito não aceita. A
 * presença dessas quatro está na chamada e vale; a ausência é de duas colunas,
 * e não da pessoa.
 *
 * ── O certo e os defeitos são escritos separados ─────────────────────────
 * `MEMBROS` é a base como ela devia ser; `DEFEITOS` é o que a exportação fez
 * com ela; a bruta sai dos dois. Escrever a bruta à mão e o tratado à mão
 * seriam duas cópias da mesma gente, e a primeira correção de um nome numa
 * delas faria a trava cobrar de quem limpou um conserto que não existe. E é
 * `DEFEITOS` que diz à trava o que cada conserto devia produzir — inclusive
 * quando o conserto certo é **apagar**.
 */

import { type Planilha, planilhaDe } from './planilha';
import { UNIDADES_DO_CLUBE } from './baseDoAcampamento';

/* ── As colunas ───────────────────────────────────────────────────────────── */

export type Coluna = 'nome' | 'unidade' | 'idade' | 'modo' | 'distancia' | 'presencas';

export const COLUNAS: Coluna[] = ['nome', 'unidade', 'idade', 'modo', 'distancia', 'presencas'];

/**
 * O cabeçalho como a exportação o escreve.
 *
 * A distância e a presença ficam lado a lado, no fim, e não é estética: a
 * dispersão do requisito 5.3 lê duas colunas vizinhas, e com outra no meio o
 * gráfico teria de ser montado à mão, coluna por coluna, num exercício cujo
 * assunto é a relação e não a seleção.
 */
export const CABECALHO: Record<Coluna, string> = {
  nome: 'Nome',
  unidade: 'Unidade',
  idade: 'Idade',
  modo: 'Como chega',
  distancia: 'Distância (km)',
  presencas: 'Presenças (de 20)',
};

export const INDICE: Record<Coluna, number> = {
  nome: 0, unidade: 1, idade: 2, modo: 3, distancia: 4, presencas: 5,
};

/** Quantas reuniões o semestre teve. A presença é contada sobre elas. */
export const REUNIOES_DO_SEMESTRE = 20;

export type Modo = 'A pé' | 'Bicicleta' | 'Carona' | 'Ônibus';

/** Como o questionário oferece, e na ordem dele. */
export const MODOS: Modo[] = ['A pé', 'Bicicleta', 'Carona', 'Ônibus'];

export { UNIDADES_DO_CLUBE };

/* ── O clube como ele é ───────────────────────────────────────────────────── */

export interface Membro {
  nome: string;
  unidade: string;
  /** `null` quando o valor certo não se sabe — e não se inventa. */
  idade: number | null;
  /** `null` para quem não respondeu ao questionário de transporte. */
  modo: Modo | null;
  distancia: number | null;
  presencas: number;
}

/**
 * Os sessenta e um, como a base tratada deve ficar.
 *
 * Quatro famílias não responderam ao questionário de transporte — Bruno,
 * Eduarda, Enzo e Pedro Henrique —, e por isso as duas colunas dele faltam
 * **juntas** para as quatro. Não é acaso de redação: é o que torna a média por
 * grupo de `SOMASE ÷ CONT.SE` correta sem `MÉDIASE`, que esta planilha não tem
 * (a CC-ES009 ensina isso). Quem não tem grupo não entra na soma nem na
 * contagem de grupo nenhum.
 *
 * E a idade da Ana Clara do Tucano é `null`: a chamada a traz como 41, que é
 * impossível para um desbravador, e o certo pode ser 11 ou 14 — as duas teclas
 * moram uma ao lado da outra. Sem evidência de qual, o valor vira ausência.
 */
export const MEMBROS: Membro[] = [
  { nome: 'Ana Beatriz Lima', unidade: 'Falcão', idade: 13, modo: 'Bicicleta', distancia: 3, presencas: 17 },
  { nome: 'Bruno Costa', unidade: 'Falcão', idade: 12, modo: null, distancia: null, presencas: 13 },
  { nome: 'Carla Menezes', unidade: 'Águia', idade: 14, modo: 'Ônibus', distancia: 8, presencas: 12 },
  { nome: 'Daniel Rocha', unidade: 'Falcão', idade: 11, modo: 'Ônibus', distancia: 14.5, presencas: 8 },
  { nome: 'Eduarda Pires', unidade: 'Tucano', idade: 13, modo: null, distancia: null, presencas: 12 },
  { nome: 'Felipe Andrade', unidade: 'Arara', idade: 15, modo: 'Carona', distancia: 13, presencas: 16 },
  { nome: 'Gabriela Souza', unidade: 'Águia', idade: 12, modo: 'Ônibus', distancia: 4, presencas: 12 },
  { nome: 'Henrique Dias', unidade: 'Jaguar', idade: 14, modo: 'A pé', distancia: 1, presencas: 20 },
  { nome: 'Isabela Moreira', unidade: 'Onça', idade: 10, modo: 'A pé', distancia: 1.25, presencas: 19 },
  { nome: 'João Pedro Alves', unidade: 'Falcão', idade: 13, modo: 'A pé', distancia: 0.75, presencas: 20 },
  { nome: 'Larissa Campos', unidade: 'Tucano', idade: 11, modo: 'Ônibus', distancia: 7, presencas: 14 },
  { nome: 'Matheus Ferraz', unidade: 'Arara', idade: 15, modo: 'Ônibus', distancia: 14, presencas: 8 },
  { nome: 'Natália Brito', unidade: 'Jaguar', idade: 12, modo: 'Carona', distancia: 4.5, presencas: 18 },
  { nome: 'Otávio Lins', unidade: 'Onça', idade: 14, modo: 'Carona', distancia: 8, presencas: 17 },
  { nome: 'Paula Nogueira', unidade: 'Águia', idade: 10, modo: 'Bicicleta', distancia: 2.75, presencas: 17 },
  { nome: 'Rafael Tavares', unidade: 'Tucano', idade: 13, modo: 'A pé', distancia: 1.25, presencas: 18 },
  { nome: 'Sofia Nunes', unidade: 'Falcão', idade: 12, modo: 'Carona', distancia: 14, presencas: 15 },
  { nome: 'Laura Pontes', unidade: 'Tucano', idade: 12, modo: 'Carona', distancia: 7, presencas: 16 },
  { nome: 'Enzo Vilela', unidade: 'Águia', idade: 14, modo: null, distancia: null, presencas: 15 },
  { nome: 'Thiago Ramalho', unidade: 'Falcão', idade: 14, modo: 'Ônibus', distancia: 8.5, presencas: 12 },
  { nome: 'Vitória Sampaio', unidade: 'Falcão', idade: 11, modo: 'Carona', distancia: 13.5, presencas: 16 },
  { nome: 'Júlia Monteiro', unidade: 'Arara', idade: 13, modo: 'Carona', distancia: 12, presencas: 15 },
  { nome: 'Murilo Sá', unidade: 'Tucano', idade: 13, modo: 'Carona', distancia: 5.5, presencas: 20 },
  { nome: 'Bernardo Quintela', unidade: 'Jaguar', idade: 15, modo: 'Ônibus', distancia: 8, presencas: 13 },
  { nome: 'Nicolas Paiva', unidade: 'Onça', idade: 14, modo: 'Bicicleta', distancia: 1.75, presencas: 16 },
  { nome: 'Alice Rangel', unidade: 'Águia', idade: 10, modo: 'Carona', distancia: 14, presencas: 16 },
  { nome: 'Arthur Bezerra', unidade: 'Falcão', idade: 10, modo: 'Ônibus', distancia: 12.5, presencas: 10 },
  { nome: 'Caio Bastos', unidade: 'Arara', idade: 12, modo: 'A pé', distancia: 0.75, presencas: 19 },
  { nome: 'Antônia Freire', unidade: 'Tucano', idade: 10, modo: 'Ônibus', distancia: 4.5, presencas: 14 },
  { nome: 'Melissa Duarte', unidade: 'Jaguar', idade: 12, modo: 'Carona', distancia: 9.5, presencas: 17 },
  { nome: 'Rebeca Fialho', unidade: 'Onça', idade: 10, modo: 'A pé', distancia: 1, presencas: 20 },
  { nome: 'Marina Sobral', unidade: 'Tucano', idade: 15, modo: 'Ônibus', distancia: 8.5, presencas: 13 },
  { nome: 'Pedro Henrique Galvão', unidade: 'Águia', idade: 13, modo: null, distancia: null, presencas: 11 },
  { nome: 'Manuela Fontes', unidade: 'Falcão', idade: 13, modo: 'Bicicleta', distancia: 3.75, presencas: 16 },
  { nome: 'Yasmin Loureiro', unidade: 'Arara', idade: 14, modo: 'Carona', distancia: 5, presencas: 19 },
  { nome: 'Théo Vasques', unidade: 'Jaguar', idade: 12, modo: 'A pé', distancia: 1.75, presencas: 20 },
  { nome: 'Lucas Peixoto', unidade: 'Falcão', idade: 15, modo: 'A pé', distancia: 0.75, presencas: 19 },
  { nome: 'Helena Braga', unidade: 'Falcão', idade: 12, modo: 'Ônibus', distancia: 14.5, presencas: 10 },
  { nome: 'Beatriz Carvalho', unidade: 'Águia', idade: 15, modo: 'Carona', distancia: 5, presencas: 20 },
  { nome: 'Davi Queiroz', unidade: 'Falcão', idade: 11, modo: 'A pé', distancia: 1.25, presencas: 17 },
  { nome: 'Leonardo Cruz', unidade: 'Onça', idade: 13, modo: 'Carona', distancia: 7.5, presencas: 17 },
  { nome: 'Cecília Maia', unidade: 'Falcão', idade: 12, modo: 'A pé', distancia: 2, presencas: 18 },
  { nome: 'Igor Rezende', unidade: 'Tucano', idade: 11, modo: 'A pé', distancia: 0.75, presencas: 18 },
  { nome: 'Renato Villela', unidade: 'Arara', idade: 10, modo: 'Carona', distancia: 12, presencas: 15 },
  { nome: 'Gustavo Assis', unidade: 'Águia', idade: 11, modo: 'Ônibus', distancia: 10.5, presencas: 10 },
  { nome: 'Lívia Amorim', unidade: 'Jaguar', idade: 11, modo: 'A pé', distancia: 1.5, presencas: 19 },
  { nome: 'Clara Sarmento', unidade: 'Arara', idade: 11, modo: 'Ônibus', distancia: 4.5, presencas: 14 },
  { nome: 'Sophia Bandeira', unidade: 'Onça', idade: 12, modo: 'Ônibus', distancia: 13.5, presencas: 10 },
  /* Os treze que não foram ao acampamento. */
  { nome: 'Pedro Aguiar', unidade: 'Falcão', idade: 12, modo: 'Ônibus', distancia: 10.5, presencas: 10 },
  { nome: 'Miguel Torres', unidade: 'Falcão', idade: 14, modo: 'Carona', distancia: 5, presencas: 20 },
  { nome: 'Rodrigo Lemos', unidade: 'Falcão', idade: 10, modo: 'Ônibus', distancia: 3.5, presencas: 14 },
  { nome: 'Lara Cunha', unidade: 'Águia', idade: 13, modo: 'A pé', distancia: 0.5, presencas: 20 },
  { nome: 'Samuel Prado', unidade: 'Águia', idade: 11, modo: 'A pé', distancia: 0.5, presencas: 18 },
  { nome: 'Ana Clara Ribeiro', unidade: 'Tucano', idade: null, modo: 'Ônibus', distancia: 5, presencas: 15 },
  { nome: 'Vinícius Mota', unidade: 'Tucano', idade: 14, modo: 'Carona', distancia: 7, presencas: 20 },
  /* A homônima. Mesmo nome, outra unidade, outra idade, outra pessoa: remover
     duplicata olhando só o nome apaga uma desbravadora do clube. */
  { nome: 'Ana Clara Ribeiro', unidade: 'Arara', idade: 10, modo: 'Ônibus', distancia: 11, presencas: 7 },
  { nome: 'Fernanda Leal', unidade: 'Arara', idade: 13, modo: 'Carona', distancia: 10.5, presencas: 16 },
  { nome: 'Gael Martins', unidade: 'Jaguar', idade: 11, modo: 'Ônibus', distancia: 4, presencas: 14 },
  { nome: 'Luana Teles', unidade: 'Jaguar', idade: 13, modo: 'Carona', distancia: 3, presencas: 20 },
  { nome: 'Benício Rios', unidade: 'Onça', idade: 12, modo: 'Ônibus', distancia: 14.5, presencas: 7 },
  { nome: 'Valentina Couto', unidade: 'Onça', idade: 15, modo: 'Carona', distancia: 3, presencas: 17 },
];

/**
 * Quem é quem.
 *
 * Nome **e** unidade, porque o nome sozinho não identifica: há duas Ana Clara
 * Ribeiro. A unidade da chave é a da lista, e quem lê uma linha da bruta passa
 * a grafia escrita por `unidadeCanonica` antes de montar a chave.
 */
export const chaveDe = (nome: string, unidade: string) => `${nome}|${unidade}`;

export const chaveDoMembro = (m: Membro) => chaveDe(m.nome, m.unidade);

/* ── O que a exportação fez ───────────────────────────────────────────────── */

/**
 * As famílias de problema que a limpeza encontra.
 *
 * São as do requisito 4 com o nome que a planilha mostra: inconsistência é a
 * grafia diferente e o valor impossível, formato é o número guardado como
 * texto, ausência é ausência. A duplicata é inconsistência também, mas é a
 * única que se resolve apagando uma linha inteira, e misturá-la com as outras
 * esconderia justamente essa diferença.
 */
export type TipoDeProblema =
  | 'grafia' | 'numero-como-texto' | 'valor-impossivel' | 'duplicata' | 'ausencia';

export const NOME_DO_PROBLEMA: Record<TipoDeProblema, string> = {
  grafia: 'A mesma coisa escrita de jeitos diferentes',
  'numero-como-texto': 'Número guardado como texto',
  'valor-impossivel': 'Valor impossível',
  duplicata: 'Registro repetido',
  ausencia: 'Valor que falta',
};

export interface Defeito {
  /** De quem, pela chave do membro. */
  chave: string;
  coluna: Coluna;
  /** O que a exportação escreveu. */
  bruto: string;
  tipo: TipoDeProblema;
}

/**
 * Cada defeito da bruta, e de quem.
 *
 * O valor certo não está aqui: é o de `MEMBROS`. Inclusive quando ele é
 * `null` — a idade 41 tem como conserto certo a célula vazia, e é isso que
 * separa os dois valores impossíveis da base. O 1.250 da Isabela tem
 * evidência: a planilha lê como mil duzentos e cinquenta quilômetros, ela vem
 * a pé, e a mesma secretaria escreveu 13.5 e 9.5 com ponto no lugar da
 * vírgula na mesma coluna. O 41 não tem — pode ser 11, pode ser 14.
 *
 * O 1.250 é, de todos, o que mais engana: é o único que a planilha aceita como
 * número. Os outros encostam à esquerda e se denunciam; ele vai para a direita
 * com todos os vizinhos, e puxa a média da distância de seis para trinta
 * quilômetros sem nenhuma célula com cara de errada.
 */
export const DEFEITOS: Defeito[] = [
  /* A grafia da unidade. */
  { chave: chaveDe('Gabriela Souza', 'Águia'), coluna: 'unidade', bruto: 'aguia', tipo: 'grafia' },
  { chave: chaveDe('Alice Rangel', 'Águia'), coluna: 'unidade', bruto: 'AGUIA', tipo: 'grafia' },
  { chave: chaveDe('Gustavo Assis', 'Águia'), coluna: 'unidade', bruto: 'Aguia', tipo: 'grafia' },
  { chave: chaveDe('Rebeca Fialho', 'Onça'), coluna: 'unidade', bruto: 'onça', tipo: 'grafia' },
  { chave: chaveDe('Benício Rios', 'Onça'), coluna: 'unidade', bruto: 'Onca', tipo: 'grafia' },
  { chave: chaveDe('Antônia Freire', 'Tucano'), coluna: 'unidade', bruto: 'tucano', tipo: 'grafia' },
  /* A grafia do transporte. */
  { chave: chaveDe('Daniel Rocha', 'Falcão'), coluna: 'modo', bruto: 'onibus', tipo: 'grafia' },
  { chave: chaveDe('Matheus Ferraz', 'Arara'), coluna: 'modo', bruto: 'Onibus', tipo: 'grafia' },
  { chave: chaveDe('Arthur Bezerra', 'Falcão'), coluna: 'modo', bruto: 'ônibus', tipo: 'grafia' },
  { chave: chaveDe('João Pedro Alves', 'Falcão'), coluna: 'modo', bruto: 'a pé', tipo: 'grafia' },
  { chave: chaveDe('Lucas Peixoto', 'Falcão'), coluna: 'modo', bruto: 'A pe', tipo: 'grafia' },
  { chave: chaveDe('Sofia Nunes', 'Falcão'), coluna: 'modo', bruto: 'carona', tipo: 'grafia' },
  { chave: chaveDe('Leonardo Cruz', 'Onça'), coluna: 'modo', bruto: 'CARONA', tipo: 'grafia' },
  /* O número guardado como texto. O ponto é decimal americano, que em
     português só vale como separador de milhar com três dígitos atrás. */
  { chave: chaveDe('Vitória Sampaio', 'Falcão'), coluna: 'distancia', bruto: '13.5', tipo: 'numero-como-texto' },
  { chave: chaveDe('Melissa Duarte', 'Jaguar'), coluna: 'distancia', bruto: '9.5', tipo: 'numero-como-texto' },
  { chave: chaveDe('Manuela Fontes', 'Falcão'), coluna: 'distancia', bruto: '3,75 km', tipo: 'numero-como-texto' },
  { chave: chaveDe('Clara Sarmento', 'Arara'), coluna: 'distancia', bruto: '4,5km', tipo: 'numero-como-texto' },
  { chave: chaveDe('Gael Martins', 'Jaguar'), coluna: 'distancia', bruto: '4 km', tipo: 'numero-como-texto' },
  { chave: chaveDe('Murilo Sá', 'Tucano'), coluna: 'idade', bruto: '13 anos', tipo: 'numero-como-texto' },
  { chave: chaveDe('Rodrigo Lemos', 'Falcão'), coluna: 'idade', bruto: '10 anos', tipo: 'numero-como-texto' },
  /* Os dois impossíveis, um com evidência e outro sem. */
  { chave: chaveDe('Isabela Moreira', 'Onça'), coluna: 'distancia', bruto: '1.250', tipo: 'valor-impossivel' },
  { chave: chaveDe('Ana Clara Ribeiro', 'Tucano'), coluna: 'idade', bruto: '41', tipo: 'valor-impossivel' },
];

/**
 * A linha repetida.
 *
 * A exportação trouxe a Carla duas vezes, e a segunda difere da primeira só
 * na grafia: "aguia" e "onibus". É de propósito, e é a ordem que a lição
 * ensina: Remover Duplicatas compara o que está escrito, então rodado **antes**
 * de padronizar ele não acha nada — e responde que não há duplicata nenhuma,
 * que é a resposta que ninguém confere duas vezes.
 */
export const DUPLICATA: { chave: string; depoisDe: string; diferencas: Partial<Record<Coluna, string>> } = {
  chave: chaveDe('Carla Menezes', 'Águia'),
  depoisDe: chaveDe('Leonardo Cruz', 'Onça'),
  diferencas: { unidade: 'aguia', modo: 'onibus' },
};

/* ── A escrita ────────────────────────────────────────────────────────────── */

/** Como o número sai escrito numa célula em português: vírgula, sem zero sobrando. */
export const numeroEscrito = (n: number): string => String(n).replace('.', ',');

/** A linha da base como ela devia estar. */
export function linhaCerta(m: Membro): string[] {
  return [
    m.nome,
    m.unidade,
    m.idade === null ? '' : String(m.idade),
    m.modo ?? '',
    m.distancia === null ? '' : numeroEscrito(m.distancia),
    String(m.presencas),
  ];
}

/** A linha como a exportação a escreveu: a certa, com os defeitos dela. */
function linhaBruta(m: Membro): string[] {
  const linha = linhaCerta(m);
  for (const d of DEFEITOS) {
    if (d.chave === chaveDoMembro(m)) linha[INDICE[d.coluna]] = d.bruto;
  }
  return linha;
}

/** As linhas da bruta, sem o cabeçalho, na ordem em que a exportação as deixou. */
export function linhasBrutas(): string[][] {
  const linhas: string[][] = [];
  for (const m of MEMBROS) {
    linhas.push(linhaBruta(m));
    if (chaveDoMembro(m) === DUPLICATA.depoisDe) {
      const original = MEMBROS.find(x => chaveDoMembro(x) === DUPLICATA.chave)!;
      const repetida = linhaBruta(original);
      for (const [coluna, texto] of Object.entries(DUPLICATA.diferencas)) {
        repetida[INDICE[coluna as Coluna]] = texto as string;
      }
      linhas.push(repetida);
    }
  }
  return linhas;
}

export const NOME_DA_BRUTA = 'Bruta';
export const NOME_DA_TRATADA = 'Tratada';

/** O conteúdo da bruta, com o cabeçalho. */
export const conteudoDaBruta = (): string[][] =>
  [COLUNAS.map(c => CABECALHO[c]), ...linhasBrutas()];

/*
  O nome é a coluna mais larga da base; as outras cabem no cabeçalho delas.
  Declarada acima de `abaBruta` porque um estado de partida a chama quando o
  módulo carrega, e abaixo dela cairia na zona morta do `const`.
*/
const LARGURAS = [168, 84, 56, 92, 104, 116];

/**
 * A aba da bruta, com a tabela declarada.
 *
 * Declarada, e não adivinhada, pela razão escrita em `Planilha.tabela`: é ela
 * que Remover Duplicatas, Classificar e o Filtro reconhecem, e um bloco
 * adivinhado pegaria o que alguém escrevesse ao lado.
 */
export function abaBruta(): Planilha {
  const conteudo = conteudoDaBruta();
  const p = planilhaDe(NOME_DA_BRUTA, conteudo, {
    tabela: { l1: 0, c1: 0, l2: conteudo.length - 1, c2: COLUNAS.length - 1 },
    congeladas: 1,
  });
  return { ...p, larguras: p.larguras.map((l, i) => LARGURAS[i] ?? l) };
}

