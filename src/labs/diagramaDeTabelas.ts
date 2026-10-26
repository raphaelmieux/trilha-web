/**
 * O diagrama de tabelas do módulo 6 da CC005.
 *
 * ── A ligação é um gesto, e a coluna é outro ─────────────────────────────
 * O requisito 5 pede o diagrama "indicando chaves e cardinalidade". Num
 * programa que tirasse a cardinalidade da coluna estrangeira sozinho, ela
 * nunca seria indicada por ninguém — seria calculada, e a metade do requisito
 * que fala dela viraria enfeite. Aqui são duas coisas: a coluna diz para onde
 * aponta, e a ligação diz quantos de cada lado. Quando as duas discordam, o
 * diagrama está errado, e é a conferência das duas que a lição ensina a fazer.
 *
 * ── Muitos-para-muitos existe no menu ────────────────────────────────────
 * Todo programa de diagrama oferece a ligação N:N, e por isso ela existe
 * aqui. O que ela não tem é onde morar: nenhuma tabela consegue guardar a
 * coluna estrangeira dela, e a data em que alguém conquistou uma especialidade
 * não cabe nem no membro nem na especialidade. É desfazê-la em duas ligações
 * de um-para-muitos, com uma tabela no meio, que o módulo cobra — escondê-la
 * do menu tiraria a pergunta junto com a resposta errada.
 */

export type TipoDeColuna = 'INTEGER' | 'TEXT' | 'REAL' | 'DATE';
export const TIPOS_DE_COLUNA: TipoDeColuna[] = ['INTEGER', 'TEXT', 'REAL', 'DATE'];

export interface ColunaDoDiagrama {
  id: string;
  nome: string;
  tipo: TipoDeColuna;
  /** Faz parte da chave primária. */
  chave: boolean;
  /** O id da tabela para cuja chave primária esta coluna aponta. */
  referencia?: string;
}

export interface TabelaDoDiagrama {
  id: string;
  nome: string;
  colunas: ColunaDoDiagrama[];
}

/**
 * Quantos de cada lado.
 *
 * Sempre lida de `de` para `para`: `1:N` de unidades para membros é "uma
 * unidade, muitos membros".
 */
export type Cardinalidade = '1:1' | '1:N' | 'N:N';
export const CARDINALIDADES: Cardinalidade[] = ['1:N', '1:1', 'N:N'];

export interface LigacaoDoDiagrama {
  id: string;
  de: string;
  para: string;
  cardinalidade: Cardinalidade;
}

export interface Diagrama {
  tabelas: TabelaDoDiagrama[];
  ligacoes: LigacaoDoDiagrama[];
}

/* ── As operações ─────────────────────────────────────────────────────────── */

/** Um id que ainda não existe no diagrama. */
export function novoId(d: Diagrama, prefixo: string): string {
  const usados = new Set([
    ...d.tabelas.map(t => t.id), ...d.tabelas.flatMap(t => t.colunas.map(c => c.id)), ...d.ligacoes.map(l => l.id),
  ]);
  for (let i = 1; ; i++) if (!usados.has(`${prefixo}${i}`)) return `${prefixo}${i}`;
}

export function novaTabela(d: Diagrama, nome = 'nova_tabela'): Diagrama {
  const id = novoId(d, 't');
  const coluna = novoId({ ...d, tabelas: [...d.tabelas, { id, nome, colunas: [] }] }, 'c');
  return { ...d, tabelas: [...d.tabelas, { id, nome, colunas: [{ id: coluna, nome: 'id', tipo: 'INTEGER', chave: true }] }] };
}

/**
 * Tira a tabela, e com ela o que dependia dela.
 *
 * Uma coluna estrangeira apontando para uma tabela que não existe mais é o
 * diagrama mentindo, e uma ligação sem uma das pontas não tem onde ser
 * desenhada. As duas saem junto — a coluna fica, sem a referência, porque o
 * dado que ela guarda continua sendo um dado.
 */
export function removerTabela(d: Diagrama, id: string): Diagrama {
  return {
    tabelas: d.tabelas.filter(t => t.id !== id).map(t => ({
      ...t, colunas: t.colunas.map(c => (c.referencia === id ? { ...c, referencia: undefined } : c)),
    })),
    ligacoes: d.ligacoes.filter(l => l.de !== id && l.para !== id),
  };
}

export const mudarTabela = (d: Diagrama, id: string, f: (t: TabelaDoDiagrama) => TabelaDoDiagrama): Diagrama =>
  ({ ...d, tabelas: d.tabelas.map(t => (t.id === id ? f(t) : t)) });

export function novaColuna(d: Diagrama, tabela: string): Diagrama {
  const id = novoId(d, 'c');
  return mudarTabela(d, tabela, t => ({ ...t, colunas: [...t.colunas, { id, nome: 'nova_coluna', tipo: 'TEXT', chave: false }] }));
}

export const mudarColuna = (d: Diagrama, tabela: string, coluna: string, f: (c: ColunaDoDiagrama) => ColunaDoDiagrama) =>
  mudarTabela(d, tabela, t => ({ ...t, colunas: t.colunas.map(c => (c.id === coluna ? f(c) : c)) }));

export const removerColuna = (d: Diagrama, tabela: string, coluna: string) =>
  mudarTabela(d, tabela, t => ({ ...t, colunas: t.colunas.filter(c => c.id !== coluna) }));

export function novaLigacao(d: Diagrama, de: string, para: string, cardinalidade: Cardinalidade = '1:N'): Diagrama {
  return { ...d, ligacoes: [...d.ligacoes, { id: novoId(d, 'l'), de, para, cardinalidade }] };
}

export const mudarLigacao = (d: Diagrama, id: string, f: (l: LigacaoDoDiagrama) => LigacaoDoDiagrama): Diagrama =>
  ({ ...d, ligacoes: d.ligacoes.map(l => (l.id === id ? f(l) : l)) });

export const removerLigacao = (d: Diagrama, id: string): Diagrama =>
  ({ ...d, ligacoes: d.ligacoes.filter(l => l.id !== id) });

/* ── O que se lê do diagrama ──────────────────────────────────────────────── */

/** O nome como se compara: sem acento, sem maiúscula, sem espaço nas pontas. */
export const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

export const tabelaChamada = (d: Diagrama, nome: string) => d.tabelas.find(t => normal(t.nome) === normal(nome));
export const tabelaPorId = (d: Diagrama, id: string) => d.tabelas.find(t => t.id === id);
export const chaveDe = (t: TabelaDoDiagrama | undefined) => (t?.colunas ?? []).filter(c => c.chave);
/** As colunas desta tabela que apontam para outra. */
export const estrangeirasDe = (t: TabelaDoDiagrama | undefined, para?: string) =>
  (t?.colunas ?? []).filter(c => c.referencia && (para === undefined || c.referencia === para));

/**
 * A ligação concorda com as colunas?
 *
 * Um-para-muitos guarda a coluna estrangeira do lado **muitos**: cada membro
 * aponta para a unidade dele, e não o contrário — a unidade teria de guardar
 * uma lista, e coluna não guarda lista. Um-para-um pode guardar de qualquer
 * lado. Muitos-para-muitos não cabe em lado nenhum, e por isso nunca
 * concorda.
 */
export function ligacaoCoerente(d: Diagrama, l: LigacaoDoDiagrama): boolean {
  if (l.de === l.para || !tabelaPorId(d, l.de) || !tabelaPorId(d, l.para)) return false;
  if (l.cardinalidade === 'N:N') return false;
  const ladoMuitos = estrangeirasDe(tabelaPorId(d, l.para), l.de).length > 0;
  if (l.cardinalidade === '1:N') return ladoMuitos;
  return ladoMuitos || estrangeirasDe(tabelaPorId(d, l.de), l.para).length > 0;
}

/** Toda coluna estrangeira tem uma ligação que a diga, e toda ligação concorda com elas. */
export function cardinalidadesCoerentes(d: Diagrama): boolean {
  if (!d.ligacoes.every(l => ligacaoCoerente(d, l))) return false;
  return d.tabelas.every(t => estrangeirasDe(t).every(c =>
    d.ligacoes.some(l => (l.para === t.id && l.de === c.referencia) || (l.cardinalidade === '1:1' && l.de === t.id && l.para === c.referencia))));
}

/** As tabelas formam um conjunto só, pelas ligações? */
export function conectadas(d: Diagrama): boolean {
  if (d.tabelas.length === 0) return false;
  const vistas = new Set([d.tabelas[0].id]);
  let cresceu = true;
  while (cresceu) {
    cresceu = false;
    for (const l of d.ligacoes) {
      if (vistas.has(l.de) !== vistas.has(l.para)) { vistas.add(l.de); vistas.add(l.para); cresceu = true; }
    }
  }
  return d.tabelas.every(t => vistas.has(t.id));
}

/* ── O diagrama de partida ────────────────────────────────────────────────── */

/**
 * O começo que a secretaria desenhou, com a chave errada.
 *
 * Os membros chegam identificados pelo **nome**, que é como se identifica gente
 * numa conversa e não serve num banco: o clube tem duas Ana Clara Ribeiro. É a
 * chave primária do requisito 2.3 aparecendo pelo avesso, e a primeira coisa a
 * consertar antes de qualquer tabela nova apontar para cá — uma conquista que
 * apontasse para o nome não saberia de qual das duas é.
 */
export function diagramaDaSecretaria(): Diagrama {
  return {
    tabelas: [
      {
        id: 'unidades', nome: 'unidades', colunas: [
          { id: 'u-id', nome: 'id', tipo: 'INTEGER', chave: true },
          { id: 'u-nome', nome: 'nome', tipo: 'TEXT', chave: false },
          { id: 'u-conselheiro', nome: 'conselheiro', tipo: 'TEXT', chave: false },
        ],
      },
      {
        id: 'membros', nome: 'membros', colunas: [
          { id: 'm-nome', nome: 'nome', tipo: 'TEXT', chave: true },
          { id: 'm-idade', nome: 'idade', tipo: 'INTEGER', chave: false },
          { id: 'm-unidade', nome: 'unidade_id', tipo: 'INTEGER', chave: false, referencia: 'unidades' },
        ],
      },
    ],
    ligacoes: [{ id: 'unidades-membros', de: 'unidades', para: 'membros', cardinalidade: '1:N' }],
  };
}
