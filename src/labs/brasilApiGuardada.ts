/**
 * A BrasilAPI que o laboratório de DOM consulta, guardada.
 *
 * O requisito 5 da CC-FE004 manda consumir uma API pública, e a lição usa uma
 * de verdade — a BrasilAPI, com o endereço de verdade escrito no `fetch`. O
 * que a prévia devolve, porém, não vem da rede: vem daqui. Três razões, e
 * nenhuma é economia.
 *
 * A verificação compara o que a página mostra com o que a API respondeu, e uma
 * resposta que mudasse entre hoje e amanhã deixaria a lista vermelha para quem
 * fez tudo certo. A rede do computador do clube cai, e a lição de consumir API
 * não pode depender de ela estar de pé — falhar é assunto da lição, e falha
 * quando a pessoa desliga a rede no painel, e não quando o roteador quer. E a
 * trava que confere os laboratórios roda sem rede nenhuma.
 *
 * As respostas são as que a API dava em novembro de 2026, conferidas contra
 * ela: os feriados não se copiam ano a ano — calculam-se, como a própria API
 * calcula, e `brasilApiGuardada.test.ts` confere o cálculo contra as respostas
 * gravadas de 2025, 2026 e 2027. Endereço que não está aqui segue para a rede
 * de verdade, que é o que a prévia faria fora da plataforma.
 */

export interface Feriado {
  date: string;
  name: string;
  type: 'national';
  weekday: string;
}

export interface Uf {
  id: number;
  sigla: string;
  nome: string;
  regiao: { id: number; sigla: string; nome: string };
  capital: string;
}

/** A resposta que a página recebe: o código e o corpo, como a API os manda. */
export interface RespostaGuardada {
  status: number;
  corpo: unknown;
}

/* Na ordem em que a API devolve, que é a do código do IBGE — e não a
   alfabética. Ordenar é a lição do módulo 8, e uma lista já ordenada a
   apagaria. */
export const UFS: Uf[] = [
  { id: 11, sigla: 'RO', nome: 'Rondônia', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Porto Velho' },
  { id: 12, sigla: 'AC', nome: 'Acre', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Rio Branco' },
  { id: 13, sigla: 'AM', nome: 'Amazonas', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Manaus' },
  { id: 14, sigla: 'RR', nome: 'Roraima', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Boa Vista' },
  { id: 15, sigla: 'PA', nome: 'Pará', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Belém' },
  { id: 16, sigla: 'AP', nome: 'Amapá', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Macapá' },
  { id: 17, sigla: 'TO', nome: 'Tocantins', regiao: { id: 1, sigla: 'N', nome: 'Norte' }, capital: 'Palmas' },
  { id: 21, sigla: 'MA', nome: 'Maranhão', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'São Luís' },
  { id: 22, sigla: 'PI', nome: 'Piauí', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Teresina' },
  { id: 23, sigla: 'CE', nome: 'Ceará', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Fortaleza' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Natal' },
  { id: 25, sigla: 'PB', nome: 'Paraíba', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'João Pessoa' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Recife' },
  { id: 27, sigla: 'AL', nome: 'Alagoas', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Maceió' },
  { id: 28, sigla: 'SE', nome: 'Sergipe', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Aracaju' },
  { id: 29, sigla: 'BA', nome: 'Bahia', regiao: { id: 2, sigla: 'NE', nome: 'Nordeste' }, capital: 'Salvador' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' }, capital: 'Belo Horizonte' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' }, capital: 'Vitória' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' }, capital: 'Rio de Janeiro' },
  { id: 35, sigla: 'SP', nome: 'São Paulo', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' }, capital: 'São Paulo' },
  { id: 41, sigla: 'PR', nome: 'Paraná', regiao: { id: 4, sigla: 'S', nome: 'Sul' }, capital: 'Curitiba' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina', regiao: { id: 4, sigla: 'S', nome: 'Sul' }, capital: 'Florianópolis' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul', regiao: { id: 4, sigla: 'S', nome: 'Sul' }, capital: 'Porto Alegre' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: { id: 5, sigla: 'CO', nome: 'Centro-Oeste' }, capital: 'Campo Grande' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso', regiao: { id: 5, sigla: 'CO', nome: 'Centro-Oeste' }, capital: 'Cuiabá' },
  { id: 52, sigla: 'GO', nome: 'Goiás', regiao: { id: 5, sigla: 'CO', nome: 'Centro-Oeste' }, capital: 'Goiânia' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal', regiao: { id: 5, sigla: 'CO', nome: 'Centro-Oeste' }, capital: 'Brasília' },
];

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

/* A Páscoa pelo algoritmo anônimo do calendário gregoriano. Ela decide quatro
   dos feriados — os dois de Carnaval, a Sexta-feira Santa e o Corpus Christi —,
   e é por isso que eles mudam de dia todo ano. */
function pascoa(ano: number): number {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(ano, mes - 1, dia);
}

const DIA_MS = 86_400_000;

function feriado(instante: number, name: string): Feriado {
  const d = new Date(instante);
  const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  return { date, name, type: 'national', weekday: DIAS[d.getUTCDay()] };
}

/** Os feriados nacionais de um ano, como a BrasilAPI os devolve. */
export function feriadosDoAno(ano: number): Feriado[] {
  const p = pascoa(ano);
  const fixo = (mes: number, dia: number, nome: string) => feriado(Date.UTC(ano, mes - 1, dia), nome);
  const lista = [
    fixo(1, 1, 'Confraternização mundial'),
    feriado(p - 48 * DIA_MS, 'Carnaval'),
    feriado(p - 47 * DIA_MS, 'Carnaval'),
    feriado(p - 2 * DIA_MS, 'Sexta-feira Santa'),
    feriado(p, 'Páscoa'),
    fixo(4, 21, 'Tiradentes'),
    fixo(5, 1, 'Dia do trabalho'),
    feriado(p + 60 * DIA_MS, 'Corpus Christi'),
    fixo(9, 7, 'Independência do Brasil'),
    fixo(10, 12, 'Nossa Senhora Aparecida'),
    fixo(11, 2, 'Finados'),
    fixo(11, 15, 'Proclamação da República'),
    /* Feriado nacional desde 2024, pela Lei 14.759/2023 — e a API só o
       devolve dali em diante. */
    ...(ano >= 2024 ? [fixo(11, 20, 'Dia da consciência negra')] : []),
    fixo(12, 25, 'Natal'),
  ];
  return lista.sort((x, y) => x.date.localeCompare(y.date));
}

/**
 * O que a BrasilAPI responderia a este endereço, ou `null` quando ele não está
 * guardado aqui — e então a prévia segue para a rede.
 */
export function respostaDaBrasilApi(endereco: string): RespostaGuardada | null {
  let url: URL;
  try { url = new URL(endereco); } catch { return null; }
  if (url.hostname !== 'brasilapi.com.br') return null;
  const caminho = url.pathname.replace(/\/+$/, '');

  if (caminho === '/api/ibge/uf/v1') return { status: 200, corpo: UFS };

  const f = /^\/api\/feriados\/v1\/(\d+)$/.exec(caminho);
  if (f) {
    const ano = Number(f[1]);
    if (ano < 1900 || ano > 2199) {
      return {
        status: 404,
        corpo: { message: 'Ano fora do intervalo suportado entre 1900 e 2199.', type: 'feriados_range_error', name: 'NotFoundError' },
      };
    }
    return { status: 200, corpo: feriadosDoAno(ano) };
  }
  return null;
}
