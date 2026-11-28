import type { ArquivoDart, DeclDeClasse, Expr, TipoEscrito } from './dartSintaxe';

/**
 * O que um programa de Dart tem, lido da árvore — para as tarefas da CC-MB001.
 *
 * A regra de `javascriptAnalise.ts` vale aqui: **pedir uso, e não a palavra**.
 * Uma classe que ninguém instancia não demonstra o requisito 4.2; um `String?`
 * declarado e nunca tratado não demonstra o 4.5; e "sem `!`" num programa sem
 * nulo nenhum é verdade de graça, então ela exige que algum nulo tenha sido
 * tratado de verdade — a armadilha do "zero link não é zero link quebrado".
 */

export const IDS_DA_ANALISE_DART = [
  'tipoExplicito', 'tipoInferido', 'interpolacao', 'tipoAnulavel', 'usoSeguroDoNulo', 'semExclamacao',
  'usaLista', 'usaMapa', 'usaConjunto', 'iteraColecao', 'funcaoPropria', 'classeCompleta', 'doisObjetos',
  'heranca', 'sobrescreve', 'chamaMae', 'importaArquivo', 'usaBiblioteca', 'duasClassesRelacionadas',
  'leEntrada',
] as const;

export type IdDaAnaliseDart = (typeof IDS_DA_ANALISE_DART)[number];

export type AchadosDart = Record<IdDaAnaliseDart, boolean>;

/* Percorre qualquer pedaço da árvore e entrega cada nó com `k`. */
function visitar(x: unknown, f: (no: { k: string } & Record<string, unknown>) => void) {
  if (!x || typeof x !== 'object') return;
  if (Array.isArray(x)) { x.forEach(y => visitar(y, f)); return; }
  const no = x as { k?: string } & Record<string, unknown>;
  if (typeof no.k === 'string') f(no as { k: string } & Record<string, unknown>);
  for (const [chave, v] of Object.entries(no)) {
    if (chave === 'fonte') continue;
    if (v && typeof v === 'object') visitar(v, f);
  }
}

function nomesNoTipo(t: TipoEscrito | undefined, nomes: Set<string>) {
  if (!t) return;
  nomes.add(t.nome);
  t.args.forEach(a => nomesNoTipo(a, nomes));
  if (t.funcao) { nomesNoTipo(t.funcao.retorno, nomes); t.funcao.params.forEach(p => nomesNoTipo(p, nomes)); }
}

function tiposAnulaveis(x: unknown): boolean {
  let achou = false;
  const ver = (y: unknown) => {
    if (!y || typeof y !== 'object' || achou) return;
    if (Array.isArray(y)) { y.forEach(ver); return; }
    const o = y as Record<string, unknown>;
    if (typeof o.nome === 'string' && Array.isArray(o.args) && o.anulavel === true) { achou = true; return; }
    for (const [k, v] of Object.entries(o)) if (k !== 'fonte' && v && typeof v === 'object') ver(v);
  };
  ver(x);
  return achou;
}

export function analisarProgramaDart(arquivos: ArquivoDart[]): AchadosDart {
  const classes = arquivos.flatMap(a => a.classes);
  const nomesDeClasse = new Set(classes.map(c => c.nome));
  let explicitos = 0;
  let inferidos = 0;
  let interpolacao = false;
  let seguro = false;
  let exclamacao = false;
  let usaLista = false;
  let usaMapa = false;
  let usaConjunto = false;
  let itera = false;
  let leEntrada = false;
  const chamadas = new Map<string, number>();
  const usadosDeBiblioteca = new Set<string>();

  for (const a of arquivos) {
    visitar(a, no => {
      if (no.k === 'var') {
        const v = no as unknown as { tipo?: TipoEscrito; decls: { init?: Expr }[] };
        if (v.tipo && v.tipo.nome !== 'dynamic') explicitos += v.decls.length;
        else if (!v.tipo) inferidos += v.decls.filter(d => d.init).length;
        if (v.tipo?.nome === 'List') usaLista = true;
        if (v.tipo?.nome === 'Map') usaMapa = true;
        if (v.tipo?.nome === 'Set') usaConjunto = true;
      }
      if (no.k === 'texto' && (no.partes as unknown[]).some(p => typeof p !== 'string')) interpolacao = true;
      if (no.k === 'logico' && no.op === '??') seguro = true;
      if (no.k === 'atribuicao' && no.op === '??=') seguro = true;
      if (no.k === 'membro' && no.opcional === true) seguro = true;
      if (no.k === 'binario' && (no.op === '==' || no.op === '!=')
        && ((no.a as Expr).k === 'null' || (no.b as Expr).k === 'null')) seguro = true;
      if (no.k === 'posfixo' && no.op === '!') exclamacao = true;
      if (no.k === 'lista') usaLista = true;
      if (no.k === 'chaves') {
        const c = no as unknown as { tipos?: unknown[]; itens: { k: string }[] };
        if (c.tipos?.length === 1 || (c.itens.length && c.itens.every(i => i.k !== 'par'))) usaConjunto = true;
        else usaMapa = true;
      }
      if (no.k === 'paraEm') itera = true;
      if (no.k === 'chamada') {
        const alvo = no.alvo as Expr;
        if (alvo.k === 'membro' && ['forEach', 'map', 'where', 'any', 'every', 'fold', 'reduce'].includes(alvo.nome)) itera = true;
        if (alvo.k === 'membro' && alvo.nome === 'readLineSync') leEntrada = true;
        const nome = alvo.k === 'nome' ? alvo.nome : alvo.k === 'membro' && alvo.alvo.k === 'nome' && nomesDeClasse.has(alvo.alvo.nome) ? alvo.alvo.nome : null;
        if (nome) chamadas.set(nome, (chamadas.get(nome) ?? 0) + 1);
        if (alvo.k === 'nome' && ['max', 'min', 'sqrt', 'pow'].includes(alvo.nome)) usadosDeBiblioteca.add(alvo.nome);
        if (alvo.k === 'membro' && alvo.alvo.k === 'nome' && ['stdin', 'stdout'].includes(alvo.alvo.nome)) usadosDeBiblioteca.add(alvo.alvo.nome);
      }
      if (no.k === 'nome' && ['pi', 'stdin', 'stdout', 'max', 'min', 'sqrt', 'pow'].includes(no.nome as string)) usadosDeBiblioteca.add(no.nome as string);
      if (no.k === 'membro' && (no.alvo as Expr).k === 'nome' && ['math'].includes(((no.alvo as Expr) as { nome: string }).nome)) usadosDeBiblioteca.add('prefixo');
    });
    for (const c of a.classes) {
      for (const f of c.campos) {
        if (f.tipo?.nome === 'List') usaLista = true;
        if (f.tipo?.nome === 'Map') usaMapa = true;
        if (f.tipo?.nome === 'Set') usaConjunto = true;
      }
    }
  }

  const chamada = (nome: string) => chamadas.get(nome) ?? 0;

  const funcaoPropria = arquivos.some(a => a.funcoes.some(f => f.nome !== 'main' && chamada(f.nome) > 0));

  const instanciada = (c: DeclDeClasse) => chamada(c.nome) > 0;
  const classeCompleta = classes.some(c => !c.abstrata
    && c.campos.some(f => !f.estatico)
    && c.construtores.length > 0
    && c.metodos.some(m => !m.getter && !m.setter && !m.estatico && m.corpo && m.nome !== 'toString')
    && instanciada(c));
  const doisObjetos = classes.some(c => chamada(c.nome) >= 2);

  const filhas = classes.filter(c => c.mae && nomesDeClasse.has(c.mae.nome));
  const heranca = filhas.some(c => instanciada(c));
  const maeDe = (c: DeclDeClasse) => classes.find(x => x.nome === c.mae?.nome);
  const ancestraisDe = (c: DeclDeClasse) => {
    const r: DeclDeClasse[] = [];
    let m = maeDe(c);
    let guarda = 0;
    while (m && guarda++ < 20) { r.push(m); m = maeDe(m); }
    return r;
  };
  const sobrescreve = filhas.some(c => c.metodos.some(m => m.sobrescreve && m.corpo
    && ancestraisDe(c).some(x => x.metodos.some(y => y.nome === m.nome))));
  const chamaMae = filhas.some(c => c.construtores.some(k => k.params.some(p => p.daMae) || k.inicializadores.some(i => i.k === 'super')));

  const principal = arquivos[0];
  const importaArquivo = !!principal && principal.importacoes.some(im => {
    if (im.uri.startsWith('dart:') || im.uri.startsWith('package:')) return false;
    const outro = arquivos.find(a => a.arquivo === im.uri);
    if (!outro) return false;
    const nomes = [...outro.classes.map(c => c.nome), ...outro.funcoes.map(f => f.nome), ...outro.enums.map(e => e.nome)];
    return nomes.some(n => chamada(n) > 0);
  });
  const temImportDeDart = arquivos.some(a => a.importacoes.some(im => im.uri === 'dart:math' || im.uri === 'dart:io'));
  const usaBiblioteca = temImportDeDart && usadosDeBiblioteca.size > 0;

  /* Duas classes se relacionam quando uma guarda a outra num campo — ou herda dela. */
  const duasClassesRelacionadas = classes.length >= 2 && classes.some(c => {
    if (c.mae && nomesDeClasse.has(c.mae.nome)) return true;
    return c.campos.some(f => {
      const nomes = new Set<string>();
      nomesNoTipo(f.tipo, nomes);
      return [...nomes].some(n => n !== c.nome && nomesDeClasse.has(n));
    });
  });

  const tipoAnulavel = tiposAnulaveis(arquivos.map(a => ({ classes: a.classes, funcoes: a.funcoes, variaveis: a.variaveis })));

  return {
    tipoExplicito: explicitos >= 2,
    tipoInferido: inferidos >= 2,
    interpolacao,
    tipoAnulavel,
    usoSeguroDoNulo: seguro,
    semExclamacao: seguro && !exclamacao,
    usaLista,
    usaMapa,
    usaConjunto,
    iteraColecao: itera,
    funcaoPropria,
    classeCompleta,
    doisObjetos,
    heranca,
    sobrescreve,
    chamaMae,
    importaArquivo,
    usaBiblioteca,
    duasClassesRelacionadas,
    leEntrada,
  };
}
