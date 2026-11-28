import type {
  ArquivoDart, Arg, Corpo, DeclDeClasse, DeclDeConstrutor, DeclDeFuncao, Expr, Instr, Item, Param, TipoEscrito,
} from './dartSintaxe';
import {
  BOOL, DOUBLE, DYN, INT, MEMBROS_REAIS, NULO, NUM, NUNCA, OBJECT, STRING, VOID, anulavel, ancestrais, atribuivel,
  cls, conjunto, elementoDe, ehAnulavel, ehNumerico, iteravel, lista, mapa, menorComum, mesmoTipo, nomeDoTipo,
  semNulo, subtipo, type Hierarquia, type Tipo,
} from './dartTipos';

/**
 * O analisador: confere os tipos antes de rodar, como o compilador do Dart.
 *
 * As mensagens são as do `dart run` — o compilador de verdade —, em inglês,
 * com a dica na linha de baixo quando ele dá uma. Traduzir seria ensinar a
 * reconhecer frases que a pessoa nunca vai ver no computador do clube; a
 * lição explica o que cada uma quer dizer.
 *
 * Duas regras atravessam o arquivo. **Errar só quando sabe**: o que ele não
 * consegue tipar vira `dynamic`, e `dynamic` não gera erro. E **a promoção é
 * a do Dart**: depois de `if (apelido != null)` a variável local é `String`
 * dentro do bloco, mas o campo público de uma classe não é — o Dart não
 * promove campo que outra classe poderia sobrescrever, e é justamente o erro
 * que a lição de nulo seguro mostra.
 */

export interface Problema {
  arquivo: string;
  ini: number;
  fim: number;
  mensagem: string;
  /** A linha que o `dart` escreve embaixo da mensagem, quando escreve. */
  dica?: string;
  /** Recurso fora do simulador, e não erro do programa. */
  foraDoSimulador?: boolean;
}

export interface Assinatura {
  params: { nome: string; tipo: Tipo; modo: Param['modo']; obrigatorio: boolean; temPadrao: boolean }[];
  ret: Tipo;
}

interface InfoDeCampo { nome: string; tipo: Tipo; final: boolean; estatico: boolean; late: boolean; temInit: boolean; pos: number }
interface InfoDeMetodo { decl: DeclDeFuncao; sig: Assinatura; estatico: boolean; abstrato: boolean }

export interface InfoDeClasse {
  nome: string;
  decl?: DeclDeClasse;
  mae: string | null;
  abstrata: boolean;
  enumeracao?: string[];
  campos: Map<string, InfoDeCampo>;
  metodos: Map<string, InfoDeMetodo>;
  getters: Map<string, InfoDeMetodo>;
  setters: Map<string, InfoDeMetodo>;
  construtores: Map<string, { decl: DeclDeConstrutor | null; sig: Assinatura }>;
}

interface Variavel {
  nome: string;
  tipo: Tipo;
  final: boolean;
  constante: boolean;
  late: boolean;
  /** Local ou parâmetro: só esses o Dart promove. */
  promovivel: boolean;
  /** Reatribuída depois de declarada — então a promoção não entra em funções de dentro. */
  reatribuida: boolean;
}

interface Fluxo { promo: Map<Variavel, Tipo>; atrib: Set<Variavel>; morto: boolean }

class Escopo {
  vars = new Map<string, Variavel>();
  constructor(public pai: Escopo | null) {}
  achar(nome: string): Variavel | undefined {
    return this.vars.get(nome) ?? this.pai?.achar(nome);
  }
}

interface Contexto {
  ret: Tipo | null;
  retornos: Tipo[];
  classe: InfoDeClasse | null;
  estatico: boolean;
  /** Dentro de uma função anônima: as promoções de fora só valem para quem nunca é reatribuído. */
  aninhado: boolean;
}

export interface ResultadoDaAnalise {
  problemas: Problema[];
  /** Os literais inteiros escritos onde o tipo pedido é `double` — `double preco = 10;`. */
  comoDouble: WeakSet<Expr>;
  /** Os `{}` escritos onde o tipo pedido é `Set` — `Set<String> vistos = {};`. */
  conjuntosVazios: WeakSet<Expr>;
  classes: Map<string, InfoDeClasse>;
  importados: Set<string>;
  prefixos: Map<string, string>;
}

const BIBLIOTECAS = new Set(['dart:core', 'dart:math', 'dart:io']);

type Membro =
  | { k: 'campo'; tipo: Tipo; final: boolean; dono: InfoDeClasse | null; nome: string; privadoFinal: boolean }
  | { k: 'getter'; tipo: Tipo }
  | { k: 'metodo'; sig: Assinatura; especial?: string };

export function analisarDart(arquivos: ArquivoDart[]): ResultadoDaAnalise {
  return new Analisador(arquivos).rodar();
}

class Analisador implements Hierarquia {
  private problemas: Problema[] = [];
  private comoDouble = new WeakSet<Expr>();
  private conjuntosVazios = new WeakSet<Expr>();
  private classes = new Map<string, InfoDeClasse>();
  private funcoes = new Map<string, Assinatura>();
  private globais = new Escopo(null);
  private prefixos = new Map<string, string>();
  private importados = new Set<string>(['dart:core']);
  private arquivo!: ArquivoDart;
  private f: Fluxo = { promo: new Map(), atrib: new Set(), morto: false };
  private ctx: Contexto = { ret: null, retornos: [], classe: null, estatico: false, aninhado: false };
  private escopo: Escopo = this.globais;
  private alvoDaCascata: Tipo[] = [];

  constructor(private arquivos: ArquivoDart[]) {}

  maeDe(nome: string): string | null {
    const c = this.classes.get(nome);
    if (!c) return null;
    if (c.enumeracao) return 'Enum';
    return c.mae ?? 'Object';
  }

  existe(nome: string): boolean { return this.classes.has(nome); }

  private erro(ini: number, fim: number, mensagem: string, dica?: string) {
    this.problemas.push({ arquivo: this.arquivo.arquivo, ini, fim, mensagem, dica });
  }

  private fora(ini: number, fim: number, oQue: string) {
    this.problemas.push({
      arquivo: this.arquivo.arquivo, ini, fim, foraDoSimulador: true,
      mensagem: `O simulador de Dart da plataforma não tem ${oQue}. Ele cobre o que a vereda ensina — escreva sem isso, ou confira no computador do clube.`,
    });
  }

  rodar(): ResultadoDaAnalise {
    for (const a of this.arquivos) {
      this.arquivo = a;
      for (const im of a.importacoes) {
        if (im.uri.startsWith('dart:')) {
          if (!BIBLIOTECAS.has(im.uri)) { this.fora(im.ini, im.fim, `a biblioteca ${im.uri}`); continue; }
          if (im.prefixo) this.prefixos.set(im.prefixo, im.uri);
          else this.importados.add(im.uri);
        } else if (im.uri.startsWith('package:')) {
          this.fora(im.ini, im.fim, 'pacotes de fora (package:) — eles exigem baixar pelo pub');
        }
      }
    }
    /* Primeiro os nomes de tudo, depois as assinaturas, depois os corpos:
       uma classe pode usar outra que vem mais abaixo no arquivo. */
    for (const a of this.arquivos) {
      this.arquivo = a;
      for (const e of a.enums) {
        this.classes.set(e.nome, {
          nome: e.nome, mae: null, abstrata: false, enumeracao: e.valores.map(v => v.nome),
          campos: new Map(), metodos: new Map(), getters: new Map(), setters: new Map(), construtores: new Map(),
        });
      }
      for (const c of a.classes) {
        this.classes.set(c.nome, {
          nome: c.nome, decl: c, mae: c.mae?.nome ?? null, abstrata: c.abstrata,
          campos: new Map(), metodos: new Map(), getters: new Map(), setters: new Map(), construtores: new Map(),
        });
      }
    }
    for (const a of this.arquivos) {
      this.arquivo = a;
      for (const c of a.classes) this.assinaturasDaClasse(c);
      for (const fn of a.funcoes) this.funcoes.set(fn.nome, this.assinatura(fn.params, fn.retorno, fn.getter));
    }
    /* Os construtores depois dos campos, e as mães antes das filhas: `super.nome`
       toma o tipo do parâmetro do construtor da mãe. */
    const feitas = new Set<string>();
    const fazer = (c: DeclDeClasse) => {
      if (feitas.has(c.nome)) return;
      feitas.add(c.nome);
      const mae = c.mae ? this.arquivos.flatMap(a => a.classes).find(x => x.nome === c.mae!.nome) : undefined;
      if (mae) fazer(mae);
      this.construtoresDaClasse(c);
    };
    for (const a of this.arquivos) for (const c of a.classes) fazer(c);
    for (const a of this.arquivos) {
      this.arquivo = a;
      for (const v of a.variaveis) this.instrucao(v);
    }
    for (const a of this.arquivos) {
      this.arquivo = a;
      for (const c of a.classes) this.corposDaClasse(c);
      for (const fn of a.funcoes) this.funcao(fn, null, false);
    }
    return {
      problemas: this.problemas, comoDouble: this.comoDouble, conjuntosVazios: this.conjuntosVazios,
      classes: this.classes, importados: this.importados, prefixos: this.prefixos,
    };
  }

  /* ── Tipos escritos ─────────────────────────────────────────────────── */

  private resolver(t: TipoEscrito | undefined): Tipo {
    if (!t) return DYN;
    if (t.funcao) {
      const r: Tipo = { k: 'fn', ret: this.resolver(t.funcao.retorno), params: t.funcao.params.map(p => this.resolver(p)), q: t.anulavel };
      return r;
    }
    const base = this.resolverNome(t);
    return t.anulavel ? anulavel(base) : base;
  }

  private resolverNome(t: TipoEscrito): Tipo {
    const args = t.args.map(a => this.resolver(a));
    switch (t.nome) {
      case 'dynamic': return DYN;
      case 'void': return VOID;
      case 'Null': return NULO;
      case 'Never': return NUNCA;
      case 'int': case 'double': case 'num': case 'String': case 'bool': case 'Object': case 'Function':
      case 'Type': case 'Exception': case 'FormatException': case 'Error': case 'StateError': case 'RangeError':
      case 'ArgumentError': case 'UnsupportedError': case 'StackTrace': case 'Enum': case 'TypeError':
        return cls(t.nome);
      case 'List': case 'Set': case 'Iterable': return cls(t.nome, [args[0] ?? DYN]);
      case 'Map': case 'MapEntry': return cls(t.nome, [args[0] ?? DYN, args[1] ?? DYN]);
      case 'Comparable': return cls('Comparable', [args[0] ?? DYN]);
      case 'Stdin': case 'Stdout':
        return this.importados.has('dart:io') ? cls(t.nome) : this.naoAchado(t);
      case 'Random': case 'DateTime': case 'Duration': case 'Future': case 'Stream':
        this.fora(t.ini, t.fim, `o tipo ${t.nome}`);
        return DYN;
      default:
        if (this.classes.has(t.nome)) return cls(t.nome);
        return this.naoAchado(t);
    }
  }

  private naoAchado(t: TipoEscrito): Tipo {
    this.erro(t.ini, t.ini + t.nome.length, `Type '${t.nome}' not found.`);
    return DYN;
  }

  private assinatura(params: Param[], retorno: TipoEscrito | undefined, getter: boolean, classe?: InfoDeClasse): Assinatura {
    return {
      params: params.map(p => ({
        nome: p.nome,
        tipo: p.tipo ? this.resolver(p.tipo)
          : p.campo && classe ? (this.campoDaClasse(classe, p.nome)?.tipo ?? DYN)
            : p.daMae && classe ? this.tipoDoParamDaMae(classe, p) : DYN,
        modo: p.modo,
        obrigatorio: p.obrigatorio,
        temPadrao: !!p.padrao,
      })),
      ret: retorno ? this.resolver(retorno) : getter ? DYN : DYN,
    };
  }

  private campoDaClasse(c: InfoDeClasse, nome: string): InfoDeCampo | undefined {
    return c.campos.get(nome);
  }

  private tipoDoParamDaMae(c: InfoDeClasse, p: Param): Tipo {
    const m = c.mae ? this.classes.get(c.mae) : undefined;
    if (!m) return DYN;
    const ctor = m.construtores.get('') ?? [...m.construtores.values()][0];
    const achado = ctor?.sig.params.find(x => x.nome === p.nome);
    if (achado) return achado.tipo;
    const campo = this.acharCampo(m, p.nome);
    return campo?.tipo ?? DYN;
  }

  private assinaturasDaClasse(c: DeclDeClasse) {
    const info = this.classes.get(c.nome)!;
    if (c.mae) {
      const t = this.resolver(c.mae);
      if (t.k === 'cls' && !this.classes.has(t.nome) && t.nome !== 'Object') {
        this.fora(c.mae.ini, c.mae.fim, `herança de uma classe da linguagem (${t.nome})`);
        info.mae = null;
      }
    }
    for (const f of c.campos) {
      info.campos.set(f.nome, {
        nome: f.nome,
        tipo: f.tipo ? this.resolver(f.tipo) : f.init ? DYN : DYN,
        final: f.mod === 'final' || f.mod === 'const',
        estatico: f.estatico,
        late: f.late,
        temInit: !!f.init,
        pos: f.posNome,
      });
    }
    for (const m of c.metodos) {
      const sig = this.assinatura(m.params, m.retorno, m.getter, info);
      const im: InfoDeMetodo = { decl: m, sig, estatico: m.estatico, abstrato: !m.corpo };
      if (m.getter) info.getters.set(m.nome, im);
      else if (m.setter) info.setters.set(m.nome, im);
      else info.metodos.set(m.nome, im);
    }
  }

  /* Os construtores esperam os campos de todas as classes: `this.nome` toma o tipo do campo. */
  private construtoresDaClasse(c: DeclDeClasse) {
    const info = this.classes.get(c.nome)!;
    if (!c.construtores.length) {
      info.construtores.set('', { decl: null, sig: { params: [], ret: cls(c.nome) } });
    }
    for (const k of c.construtores) {
      const sig = this.assinatura(k.params, undefined, false, info);
      sig.ret = cls(c.nome);
      info.construtores.set(k.nome ?? '', { decl: k, sig });
    }
  }

  private corposDaClasse(c: DeclDeClasse) {
    const info = this.classes.get(c.nome)!;
    /* Campos: o valor inicial confere com o tipo; sem valor, alguém tem de iniciar. */
    for (const f of c.campos) {
      const campo = info.campos.get(f.nome)!;
      if (f.init) {
        this.comNovoContexto({ ret: null, retornos: [], classe: info, estatico: f.estatico, aninhado: false }, () => {
          const t = this.exp(f.init!, f.tipo ? campo.tipo : undefined);
          if (f.tipo) this.conferirAtribuicao(t, campo.tipo, f.init!, 'var');
          else campo.tipo = t.k === 'nulo' ? DYN : t;
        });
      }
    }
    const precisaIniciar = c.campos.filter(f => !f.init && !f.late && !f.estatico && (f.mod === 'final'
      || (f.tipo && !ehAnulavel(info.campos.get(f.nome)!.tipo) && info.campos.get(f.nome)!.tipo.k !== 'dyn')));
    if (!c.construtores.length) {
      for (const f of precisaIniciar) {
        const t = info.campos.get(f.nome)!.tipo;
        if (f.mod === 'final') this.erro(f.posNome, f.posNome + f.nome.length, `Final field '${f.nome}' is not initialized.`, 'Try to initialize the field in the declaration or in every constructor.');
        else this.erro(f.posNome, f.posNome + f.nome.length, `Field '${f.nome}' should be initialized because its type '${nomeDoTipo(t)}' doesn't allow null.`);
      }
      this.conferirConstrutorDaMae(info, null, c.posNome, c.nome.length);
    }
    for (const k of c.construtores) {
      const redireciona = k.inicializadores.some(i => i.k === 'redireciona');
      if (!redireciona) {
        const iniciados = new Set([...k.params.filter(p => p.campo).map(p => p.nome),
          ...k.inicializadores.flatMap(i => (i.k === 'campo' ? [i.nome] : []))]);
        const tamanho = k.nome ? c.nome.length + 1 + k.nome.length : c.nome.length;
        for (const f of precisaIniciar) {
          if (iniciados.has(f.nome)) continue;
          const t = info.campos.get(f.nome)!.tipo;
          if (f.mod === 'final') this.erro(k.posNome, k.posNome + tamanho, `Final field '${f.nome}' is not initialized by this constructor.`, 'Try to initialize the field using an initializing formal or a field initializer.');
          else this.erro(k.posNome, k.posNome + tamanho, `This constructor should initialize field '${f.nome}' because its type '${nomeDoTipo(t)}' doesn't allow null.`);
        }
      }
      this.construtor(info, k);
    }
    if (!c.abstrata) {
      const faltam: string[] = [];
      const visto = new Set<string>();
      for (const anc of this.cadeia(info)) {
        for (const [nome, m] of [...anc.metodos, ...anc.getters]) {
          if (visto.has(nome)) continue;
          visto.add(nome);
          if (m.abstrato && !m.estatico) faltam.push(`${anc.nome}.${nome}`);
        }
      }
      if (faltam.length) {
        this.erro(c.posNome, c.posNome + c.nome.length,
          `The non-abstract class '${c.nome}' is missing implementations for these members:\n${faltam.map(x => ` - ${x}`).join('\n')}`,
          `Try to either\n - provide an implementation,\n - inherit an implementation,\n - add a noSuchMethod implementation, or\n - make class '${c.nome}' abstract.`);
      }
    }
    for (const m of c.metodos) this.funcao(m, info, m.estatico);
  }

  /** A classe e as mães dela, da mais nova para a mais antiga. */
  private cadeia(c: InfoDeClasse): InfoDeClasse[] {
    const r: InfoDeClasse[] = [];
    let atual: InfoDeClasse | undefined = c;
    let guarda = 0;
    while (atual && guarda++ < 50) {
      r.push(atual);
      atual = atual.mae ? this.classes.get(atual.mae) : undefined;
    }
    return r;
  }

  private conferirConstrutorDaMae(info: InfoDeClasse, k: DeclDeConstrutor | null, pos: number, tamanho: number) {
    if (!info.mae) return;
    const mae = this.classes.get(info.mae);
    if (!mae) return;
    const explicito = k?.inicializadores.find(i => i.k === 'super');
    if (explicito && explicito.k === 'super') return;
    const daMae = k?.params.filter(p => p.daMae) ?? [];
    const sem = mae.construtores.get('');
    const posicionaisPassados = daMae.filter(p => p.modo !== 'nomeado').length;
    const nomeadosPassados = new Set(daMae.filter(p => p.modo === 'nomeado').map(p => p.nome));
    const ok = sem && sem.sig.params.every(p => {
      if (p.modo === 'nomeado') return !p.obrigatorio || nomeadosPassados.has(p.nome);
      return true;
    }) && sem.sig.params.filter(p => p.modo === 'pos').length <= posicionaisPassados;
    if (!ok) {
      this.erro(pos, pos + tamanho, `The superclass, '${mae.nome}', has no unnamed constructor that takes no arguments.`);
    }
  }

  private construtor(info: InfoDeClasse, k: DeclDeConstrutor) {
    const sig = info.construtores.get(k.nome ?? '')!.sig;
    this.comNovoContexto({ ret: VOID, retornos: [], classe: info, estatico: false, aninhado: false }, () => {
      const escopo = new Escopo(this.escopo);
      this.escopo = escopo;
      k.params.forEach((p, i) => this.declararParam(p, sig.params[i].tipo));
      const tamanho = k.nome ? info.nome.length + 1 + k.nome.length : info.nome.length;
      for (const ini of k.inicializadores) {
        if (ini.k === 'campo') {
          const campo = info.campos.get(ini.nome);
          const t = this.exp(ini.e, campo?.tipo);
          if (campo) this.conferirAtribuicao(t, campo.tipo, ini.e, 'var');
        } else if (ini.k === 'super') {
          const mae = info.mae ? this.classes.get(info.mae) : undefined;
          const ctor = mae?.construtores.get(ini.nome ?? '');
          if (ctor) this.conferirArgs(ctor.sig, ini.args, ini.ini + 5);
          else ini.args.forEach(a => this.exp(a.e));
        } else if (ini.k === 'redireciona') {
          const ctor = info.construtores.get(ini.nome ?? '');
          if (ctor) this.conferirArgs(ctor.sig, ini.args, ini.ini + 4);
        } else this.exp(ini.e, BOOL);
      }
      this.conferirConstrutorDaMae(info, k, k.posNome, tamanho);
      if (k.corpo) this.corpo(k.corpo, VOID);
    });
  }

  private comNovoContexto(ctx: Contexto, fazer: () => void) {
    const antes = { ctx: this.ctx, escopo: this.escopo, f: this.f };
    this.ctx = ctx;
    this.f = { promo: new Map(), atrib: new Set(), morto: false };
    try { fazer(); } finally {
      this.ctx = antes.ctx;
      this.escopo = antes.escopo;
      this.f = antes.f;
    }
  }

  private declararParam(p: Param, tipo: Tipo) {
    const v: Variavel = { nome: p.nome, tipo, final: p.final, constante: false, late: false, promovivel: true, reatribuida: false };
    this.escopo.vars.set(p.nome, v);
    this.f.atrib.add(v);
    if (p.padrao) {
      const t = this.exp(p.padrao, tipo);
      this.conferirAtribuicao(t, tipo, p.padrao, 'var');
    } else if (p.modo !== 'pos' && !p.obrigatorio && !ehAnulavel(tipo) && tipo.k !== 'dyn' && tipo.k !== 'void' && !p.campo && !p.daMae) {
      this.erro(p.fim - p.nome.length, p.fim,
        `The parameter '${p.nome}' can't have a value of 'null' because of its type '${nomeDoTipo(tipo)}', but the implicit default value is 'null'.`,
        'Try adding either an explicit non-\'null\' default value or the \'required\' modifier.');
    } else if (p.modo !== 'pos' && !p.obrigatorio && (p.campo || p.daMae) && !ehAnulavel(tipo) && tipo.k !== 'dyn') {
      this.erro(p.fim - p.nome.length, p.fim,
        `The parameter '${p.nome}' can't have a value of 'null' because of its type '${nomeDoTipo(tipo)}', but the implicit default value is 'null'.`,
        'Try adding either an explicit non-\'null\' default value or the \'required\' modifier.');
    }
  }

  private funcao(fn: DeclDeFuncao, classe: InfoDeClasse | null, estatico: boolean) {
    const sig = classe
      ? (fn.getter ? classe.getters : fn.setter ? classe.setters : classe.metodos).get(fn.nome)!.sig
      : this.funcoes.get(fn.nome)!;
    if (!fn.corpo) return;
    const ret = fn.retorno ? sig.ret : fn.setter ? VOID : DYN;
    this.comNovoContexto({ ret, retornos: [], classe, estatico, aninhado: false }, () => {
      this.escopo = new Escopo(this.escopo);
      this.marcarReatribuidas(fn.corpo!);
      fn.params.forEach((p, i) => this.declararParam(p, sig.params[i].tipo));
      this.corpo(fn.corpo!, ret);
      if (fn.corpo!.k === 'bloco' && !this.f.morto && fn.retorno && !ehAnulavel(ret) && ret.k === 'cls') {
        this.erro(fn.posNome, fn.posNome + fn.nome.length,
          `A non-null value must be returned since the return type '${nomeDoTipo(ret)}' doesn't allow null.`);
      }
    });
  }

  private corpo(c: Corpo, ret: Tipo | null): Tipo {
    if (c.k === 'seta') {
      const t = this.exp(c.e, ret && ret.k !== 'void' ? ret : undefined);
      if (ret && ret.k !== 'void' && ret.k !== 'dyn') this.conferirAtribuicao(t, ret, c.e, 'ret');
      return t;
    }
    for (const i of c.corpo) this.instrucao(i);
    return VOID;
  }

  /* As variáveis escritas depois de declaradas, para a promoção dentro de função anônima. */
  private reatribuidas = new Set<string>();
  private marcarReatribuidas(c: Corpo | Instr) {
    const ver = (x: unknown) => {
      if (!x || typeof x !== 'object') return;
      const n = x as { k?: string; alvo?: { k: string; nome?: string }; e?: { k: string; nome?: string }; op?: string };
      if (n.k === 'atribuicao' && n.alvo?.k === 'nome') this.reatribuidas.add(n.alvo.nome!);
      if ((n.k === 'prefixo' || (n.k === 'posfixo' && n.op !== '!')) && n.e?.k === 'nome') this.reatribuidas.add(n.e.nome!);
      for (const v of Object.values(x)) {
        if (Array.isArray(v)) v.forEach(ver);
        else if (v && typeof v === 'object') ver(v);
      }
    };
    ver(c);
  }

  /* ── Fluxo ──────────────────────────────────────────────────────────── */

  private copia(f: Fluxo): Fluxo {
    return { promo: new Map(f.promo), atrib: new Set(f.atrib), morto: f.morto };
  }

  private juntar(a: Fluxo, b: Fluxo): Fluxo {
    if (a.morto) return this.copia(b);
    if (b.morto) return this.copia(a);
    const promo = new Map<Variavel, Tipo>();
    for (const [v, t] of a.promo) {
      const u = b.promo.get(v);
      if (u && mesmoTipo(t, u)) promo.set(v, t);
    }
    const atrib = new Set([...a.atrib].filter(v => b.atrib.has(v)));
    return { promo, atrib, morto: false };
  }

  /* Antes de um laço, quem é escrito lá dentro perde a promoção — a volta seguinte não sabe. */
  private rebaixarNoLaco(corpo: unknown) {
    const nomes = new Set<string>();
    const ver = (x: unknown) => {
      if (!x || typeof x !== 'object') return;
      const n = x as { k?: string; alvo?: { k: string; nome?: string }; e?: { k: string; nome?: string }; op?: string };
      if (n.k === 'atribuicao' && n.alvo?.k === 'nome') nomes.add(n.alvo.nome!);
      if ((n.k === 'prefixo' || (n.k === 'posfixo' && n.op !== '!')) && n.e?.k === 'nome') nomes.add(n.e.nome!);
      for (const v of Object.values(x)) {
        if (Array.isArray(v)) v.forEach(ver);
        else if (v && typeof v === 'object') ver(v);
      }
    };
    ver(corpo);
    for (const nome of nomes) {
      const v = this.escopo.achar(nome);
      if (v) this.f.promo.delete(v);
    }
  }

  private tipoAtual(v: Variavel): Tipo {
    const p = this.f.promo.get(v);
    if (p && (!this.ctx.aninhado || !v.reatribuida)) return p;
    return v.tipo;
  }

  private condicao(e: Expr): [Fluxo, Fluxo] {
    if (e.k === 'logico' && e.op === '&&') {
      const [va, fa] = this.condicao(e.a);
      this.f = va;
      const [vb, fb] = this.condicao(e.b);
      return [vb, this.juntar(fa, fb)];
    }
    if (e.k === 'logico' && e.op === '||') {
      const [va, fa] = this.condicao(e.a);
      this.f = fa;
      const [vb, fb] = this.condicao(e.b);
      return [this.juntar(va, vb), fb];
    }
    if (e.k === 'unario' && e.op === '!') {
      const [v, f] = this.condicao(e.e);
      return [f, v];
    }
    if (e.k === 'binario' && (e.op === '==' || e.op === '!=')) {
      const variavel = e.b.k === 'null' ? this.variavelDe(e.a) : e.a.k === 'null' ? this.variavelDe(e.b) : null;
      if (variavel) {
        this.exp(e.a);
        this.exp(e.b);
        const naoNulo = this.copia(this.f);
        const nulo = this.copia(this.f);
        const atual = this.tipoAtual(variavel);
        if (ehAnulavel(atual)) naoNulo.promo.set(variavel, semNulo(atual));
        return e.op === '!=' ? [naoNulo, nulo] : [nulo, naoNulo];
      }
      this.exp(e.a);
      this.exp(e.b);
      return [this.copia(this.f), this.copia(this.f)];
    }
    if (e.k === 'eh') {
      const variavel = this.variavelDe(e.e);
      this.exp(e.e);
      const alvo = this.resolver(e.tipo);
      const sim = this.copia(this.f);
      const nao = this.copia(this.f);
      if (variavel) {
        const atual = this.tipoAtual(variavel);
        if (subtipo(alvo, atual, this) || atual.k === 'dyn') sim.promo.set(variavel, alvo);
        else if (ehAnulavel(atual) && subtipo(alvo, semNulo(atual), this)) sim.promo.set(variavel, alvo);
      }
      return e.negado ? [nao, sim] : [sim, nao];
    }
    if (e.k === 'bool') {
      const t = this.copia(this.f);
      const f = this.copia(this.f);
      if (e.v) f.morto = true; else t.morto = true;
      return [t, f];
    }
    const t = this.exp(e, BOOL);
    if (!atribuivel(t, BOOL, this)) this.conferirAtribuicao(t, BOOL, e, 'var');
    return [this.copia(this.f), this.copia(this.f)];
  }

  /** A variável que uma expressão nomeia, se for uma que o Dart promove. */
  private variavelDe(e: Expr): Variavel | null {
    if (e.k !== 'nome') return null;
    const v = this.escopo.achar(e.nome);
    return v && v.promovivel ? v : null;
  }

  /* ── Instruções ─────────────────────────────────────────────────────── */

  private instrucao(i: Instr) {
    switch (i.k) {
      case 'bloco': {
        const antes = this.escopo;
        this.escopo = new Escopo(antes);
        for (const x of i.corpo) this.instrucao(x);
        this.escopo = antes;
        return;
      }
      case 'var': {
        const declarado = i.tipo ? this.resolver(i.tipo) : null;
        for (const d of i.decls) {
          let tipo: Tipo = declarado ?? DYN;
          if (d.init) {
            const t = this.exp(d.init, declarado ?? undefined);
            if (declarado) this.conferirAtribuicao(t, declarado, d.init, 'var');
            else tipo = t.k === 'nulo' ? DYN : t.k === 'void' ? VOID : t;
          }
          const v: Variavel = {
            nome: d.nome, tipo, final: i.mod === 'final' || i.mod === 'const', constante: i.mod === 'const',
            late: i.late, promovivel: this.escopo !== this.globais, reatribuida: this.reatribuidas.has(d.nome),
          };
          this.escopo.vars.set(d.nome, v);
          if (d.init || ehAnulavel(tipo) || tipo.k === 'dyn' || this.escopo === this.globais) this.f.atrib.add(v);
          if (d.init && declarado && ehAnulavel(declarado)) {
            const t = this.tipoDoInicial.get(d.init);
            if (t && t.k !== 'nulo' && t.k !== 'dyn' && subtipo(t, semNulo(declarado), this)) this.f.promo.set(v, semNulo(declarado));
          }
        }
        return;
      }
      case 'expr': this.exp(i.e); return;
      case 'se': {
        const [v, f] = this.condicao(i.c);
        this.f = v;
        this.instrucaoEmEscopo(i.entao);
        const depoisDoEntao = this.f;
        this.f = f;
        if (i.senao) this.instrucaoEmEscopo(i.senao);
        this.f = this.juntar(depoisDoEntao, this.f);
        return;
      }
      case 'enquanto': {
        this.rebaixarNoLaco(i);
        const antes = this.copia(this.f);
        const [v, f] = this.condicao(i.c);
        this.f = v;
        this.instrucaoEmEscopo(i.corpo);
        this.f = f;
        this.f.atrib = new Set([...this.f.atrib].filter(x => antes.atrib.has(x)));
        this.f.morto = false;
        return;
      }
      case 'faca': {
        this.rebaixarNoLaco(i);
        this.instrucaoEmEscopo(i.corpo);
        this.f.morto = false;
        const [, f] = this.condicao(i.c);
        this.f = f;
        return;
      }
      case 'para': {
        const antesEscopo = this.escopo;
        this.escopo = new Escopo(antesEscopo);
        if (i.init) this.instrucao(i.init);
        this.rebaixarNoLaco(i);
        const antes = this.copia(this.f);
        let fora = this.copia(this.f);
        if (i.cond) {
          const [v, f] = this.condicao(i.cond);
          this.f = v;
          fora = f;
        }
        this.instrucaoEmEscopo(i.corpo);
        this.f.morto = false;
        for (const p of i.passos) this.exp(p);
        this.f = fora;
        this.f.atrib = new Set([...this.f.atrib].filter(x => antes.atrib.has(x)));
        this.f.morto = false;
        this.escopo = antesEscopo;
        return;
      }
      case 'paraEm': {
        const t = this.exp(i.iteravel);
        let elem: Tipo = DYN;
        if (t.k === 'cls' && !this.ehIteravel(semNulo(t))) {
          this.erro(i.iteravel.ini, i.iteravel.fim, `The type '${nomeDoTipo(t)}' used in the 'for' loop must implement 'Iterable<dynamic>'.`);
        } else if (t.k === 'cls' && t.q) {
          this.erro(i.iteravel.ini, i.iteravel.fim, `The type '${nomeDoTipo(t)}' used in the 'for' loop must implement 'Iterable<dynamic>' because '${nomeDoTipo(t)}' is nullable and 'Iterable<dynamic>' isn't.`);
        } else elem = elementoDe(t, this);
        const antesEscopo = this.escopo;
        this.escopo = new Escopo(antesEscopo);
        const declarado = i.tipo ? this.resolver(i.tipo) : elem;
        if (i.tipo && !atribuivel(elem, declarado, this)) {
          this.erro(i.iteravel.ini, i.iteravel.fim, `A value of type '${nomeDoTipo(elem)}' can't be assigned to a variable of type '${nomeDoTipo(declarado)}'.`);
        }
        const v: Variavel = { nome: i.nome, tipo: declarado, final: i.mod === 'final', constante: false, late: false, promovivel: true, reatribuida: this.reatribuidas.has(i.nome) };
        this.escopo.vars.set(i.nome, v);
        this.rebaixarNoLaco(i.corpo);
        const antes = this.copia(this.f);
        this.f.atrib.add(v);
        this.instrucaoEmEscopo(i.corpo);
        this.f = antes;
        this.escopo = antesEscopo;
        return;
      }
      case 'pare': case 'continue': case 'relance':
        this.f.morto = true;
        return;
      case 'retorne': {
        if (i.e) {
          const ret = this.ctx.ret;
          const t = this.exp(i.e, ret && ret.k !== 'void' && ret.k !== 'dyn' ? ret : undefined);
          if (ret && ret.k !== 'void' && ret.k !== 'dyn') this.conferirAtribuicao(t, ret, i.e, 'ret');
          this.ctx.retornos.push(t);
        } else {
          this.ctx.retornos.push(VOID);
        }
        this.f.morto = true;
        return;
      }
      case 'tente': {
        this.rebaixarNoLaco(i.corpo);
        const antes = this.copia(this.f);
        this.instrucaoEmEscopo(i.corpo);
        let depois = this.f;
        for (const c of i.capturas) {
          this.f = this.copia(antes);
          const antesEscopo = this.escopo;
          this.escopo = new Escopo(antesEscopo);
          if (c.erro) {
            const t = c.tipo ? this.resolver(c.tipo) : OBJECT;
            const v: Variavel = { nome: c.erro, tipo: t, final: true, constante: false, late: false, promovivel: true, reatribuida: false };
            this.escopo.vars.set(c.erro, v);
            this.f.atrib.add(v);
          } else if (c.tipo) this.resolver(c.tipo);
          if (c.pilha) {
            const v: Variavel = { nome: c.pilha, tipo: cls('StackTrace'), final: true, constante: false, late: false, promovivel: false, reatribuida: false };
            this.escopo.vars.set(c.pilha, v);
            this.f.atrib.add(v);
          }
          this.instrucao(c.corpo);
          this.escopo = antesEscopo;
          depois = this.juntar(depois, this.f);
        }
        this.f = depois;
        if (i.finalmente) {
          const morto = this.f.morto;
          this.f.morto = false;
          this.instrucaoEmEscopo(i.finalmente);
          this.f.morto = this.f.morto || morto;
        }
        return;
      }
      case 'escolha': {
        this.exp(i.e);
        const antes = this.copia(this.f);
        let depois: Fluxo | null = null;
        let temPadrao = false;
        for (const caso of i.casos) {
          this.f = this.copia(antes);
          if (!caso.valores.length) temPadrao = true;
          for (const v of caso.valores) this.exp(v);
          const antesEscopo = this.escopo;
          this.escopo = new Escopo(antesEscopo);
          for (const x of caso.corpo) this.instrucao(x);
          this.escopo = antesEscopo;
          if (!caso.corpo.length) continue;
          const fim = this.copia(this.f);
          if (caso.corpo.some(x => x.k === 'pare')) fim.morto = false;
          depois = depois ? this.juntar(depois, fim) : fim;
        }
        this.f = temPadrao && depois ? depois : depois ? this.juntar(depois, antes) : antes;
        return;
      }
      case 'funcaoLocal': {
        const fn = i.decl;
        const sig = this.assinatura(fn.params, fn.retorno, false);
        const tipo: Tipo = { k: 'fn', ret: sig.ret, params: sig.params.map(p => p.tipo), q: false };
        const v: Variavel = { nome: fn.nome, tipo, final: true, constante: false, late: false, promovivel: false, reatribuida: false };
        this.escopo.vars.set(fn.nome, v);
        this.f.atrib.add(v);
        this.funcaoAnonimaOuLocal(fn.params, sig, fn.corpo!, fn.retorno ? sig.ret : null);
        return;
      }
      case 'vazia': return;
    }
  }

  private instrucaoEmEscopo(i: Instr) {
    const antes = this.escopo;
    this.escopo = new Escopo(antes);
    this.instrucao(i);
    this.escopo = antes;
  }

  private ehIteravel(t: Tipo): boolean {
    return t.k === 'cls' && ancestrais(t, this).some(x => x.nome === 'Iterable');
  }

  /* ── Atribuição e argumentos ────────────────────────────────────────── */

  private tipoDoInicial = new WeakMap<Expr, Tipo>();

  private conferirAtribuicao(de: Tipo, para: Tipo, e: Expr, onde: 'var' | 'arg' | 'ret'): boolean {
    if (atribuivel(de, para, this)) return true;
    if (de.k === 'void') return true;
    const D = nomeDoTipo(de);
    const P = nomeDoTipo(para);
    const literalNulo = e.k === 'null';
    const soNulo = ehAnulavel(de) && atribuivel(semNulo(de), para, this);
    let msg: string;
    if (onde === 'var') {
      msg = literalNulo ? `The value 'null' can't be assigned to a variable of type '${P}' because '${P}' is not nullable.`
        : soNulo ? `A value of type '${D}' can't be assigned to a variable of type '${P}' because '${D}' is nullable and '${P}' isn't.`
          : `A value of type '${D}' can't be assigned to a variable of type '${P}'.`;
    } else if (onde === 'arg') {
      msg = literalNulo ? `The value 'null' can't be assigned to the parameter type '${P}' because '${P}' is not nullable.`
        : soNulo ? `The argument type '${D}' can't be assigned to the parameter type '${P}' because '${D}' is nullable and '${P}' isn't.`
          : `The argument type '${D}' can't be assigned to the parameter type '${P}'.`;
    } else {
      msg = literalNulo ? `The value 'null' can't be returned from a function with return type '${P}' because '${P}' is not nullable.`
        : soNulo ? `A value of type '${D}' can't be returned from a function with return type '${P}' because '${D}' is nullable and '${P}' isn't.`
          : `A value of type '${D}' can't be returned from a function with return type '${P}'.`;
    }
    this.erro(e.ini, e.fim, msg);
    return false;
  }

  private conferirArgs(sig: Assinatura, args: Arg[], posAbre: number) {
    const posicionais = args.filter(a => !a.nome);
    const params = sig.params.filter(p => p.modo !== 'nomeado');
    const obrigatorios = params.filter(p => p.modo === 'pos').length;
    posicionais.forEach((a, i) => {
      const p = params[i];
      const t = this.exp(a.e, p?.tipo.k === 'dyn' ? undefined : p?.tipo);
      if (p) this.conferirAtribuicao(t, p.tipo, a.e, 'arg');
    });
    for (const a of args.filter(x => x.nome)) {
      const p = sig.params.find(x => x.modo === 'nomeado' && x.nome === a.nome);
      const t = this.exp(a.e, p?.tipo.k === 'dyn' ? undefined : p?.tipo);
      if (!p) { this.erro(a.ini, a.ini + a.nome!.length, `No named parameter with the name '${a.nome}'.`); continue; }
      this.conferirAtribuicao(t, p.tipo, a.e, 'arg');
    }
    if (posicionais.length < obrigatorios) {
      this.erro(posAbre, posAbre + 1, `Too few positional arguments: ${obrigatorios} required, ${posicionais.length} given.`);
    } else if (posicionais.length > params.length) {
      this.erro(posAbre, posAbre + 1, `Too many positional arguments: ${params.length} allowed, but ${posicionais.length} found.`, 'Try removing the extra positional arguments.');
    }
    for (const p of sig.params.filter(x => x.modo === 'nomeado' && x.obrigatorio)) {
      if (!args.some(a => a.nome === p.nome)) {
        this.erro(posAbre, posAbre + 1, `Required named parameter '${p.nome}' must be provided.`);
      }
    }
  }

  /* ── Membros ────────────────────────────────────────────────────────── */

  private acharCampo(c: InfoDeClasse, nome: string): InfoDeCampo | undefined {
    for (const x of this.cadeia(c)) {
      const f = x.campos.get(nome);
      if (f) return f;
    }
    return undefined;
  }

  private membroDaClasse(c: InfoDeClasse, nome: string, estatico: boolean): Membro | undefined | 'naoImplementado' {
    if (c.enumeracao && !estatico) {
      if (nome === 'name') return { k: 'getter', tipo: STRING };
      if (nome === 'index') return { k: 'getter', tipo: INT };
    }
    for (const x of this.cadeia(c)) {
      const f = x.campos.get(nome);
      if (f && f.estatico === estatico) {
        return { k: 'campo', tipo: f.tipo, final: f.final, dono: x, nome, privadoFinal: nome.startsWith('_') && f.final };
      }
      const g = x.getters.get(nome);
      if (g && g.estatico === estatico) return { k: 'getter', tipo: g.sig.ret };
      const m = x.metodos.get(nome);
      if (m && m.estatico === estatico) return { k: 'metodo', sig: m.sig };
      if (estatico) break;
    }
    if (!estatico) return this.membroDoNucleo(OBJECT as Extract<Tipo, { k: 'cls' }>, nome);
    return undefined;
  }

  private membro(t: Tipo, nome: string): Membro | undefined | 'naoImplementado' {
    if (t.k !== 'cls') return undefined;
    const c = this.classes.get(t.nome);
    if (c) return this.membroDaClasse(c, nome, false);
    return this.membroDoNucleo(t, nome);
  }

  /*
    Os membros das classes da linguagem que a vereda usa, com os tipos. O que
    existe de verdade e não está aqui volta `naoImplementado`, e quem chamou
    recusa dizendo que o simulador não tem — e não que o Dart não tem.
  */
  private membroDoNucleo(t: Extract<Tipo, { k: 'cls' }>, nome: string): Membro | undefined | 'naoImplementado' {
    const E = t.args[0] ?? DYN;
    const V = t.args[1] ?? DYN;
    const g = (tipo: Tipo): Membro => ({ k: 'getter', tipo });
    const m = (ret: Tipo, params: [string, Tipo, Param['modo']?, boolean?][] = [], especial?: string): Membro => ({
      k: 'metodo',
      especial,
      sig: {
        ret,
        params: params.map(([n, tp, modo = 'pos', obrig]) => ({ nome: n, tipo: tp, modo, obrigatorio: obrig ?? modo === 'pos', temPadrao: false })),
      },
    });
    const fn = (ret: Tipo, ...params: Tipo[]): Tipo => ({ k: 'fn', ret, params, q: false });
    const comum = (): Membro | undefined => {
      if (nome === 'toString') return m(STRING);
      if (nome === 'hashCode') return g(INT);
      if (nome === 'runtimeType') return g(cls('Type'));
      return undefined;
    };
    const ITER: Record<string, () => Membro> = {
      length: () => g(INT),
      isEmpty: () => g(BOOL),
      isNotEmpty: () => g(BOOL),
      first: () => g(E),
      last: () => g(E),
      single: () => g(E),
      contains: () => m(BOOL, [['element', anulavel(OBJECT)]]),
      elementAt: () => m(E, [['index', INT]]),
      join: () => m(STRING, [['separator', STRING, 'opcional']]),
      toList: () => m(lista(E)),
      toSet: () => m(conjunto(E)),
      where: () => m(iteravel(E), [['test', fn(BOOL, E)]]),
      map: () => m(iteravel(DYN), [['toElement', fn(DYN, E)]], 'map'),
      forEach: () => m(VOID, [['action', fn(VOID, E)]]),
      any: () => m(BOOL, [['test', fn(BOOL, E)]]),
      every: () => m(BOOL, [['test', fn(BOOL, E)]]),
      reduce: () => m(E, [['combine', fn(E, E, E)]]),
      fold: () => m(DYN, [['initialValue', DYN], ['combine', fn(DYN, DYN, E)]], 'fold'),
      firstWhere: () => m(E, [['test', fn(BOOL, E)], ['orElse', fn(E), 'nomeado', false]]),
      lastWhere: () => m(E, [['test', fn(BOOL, E)], ['orElse', fn(E), 'nomeado', false]]),
      take: () => m(iteravel(E), [['count', INT]]),
      skip: () => m(iteravel(E), [['count', INT]]),
      expand: () => m(iteravel(DYN), [['toElements', fn(DYN, E)]], 'expand'),
    };
    switch (t.nome) {
      case 'int': case 'double': case 'num': {
        const eh = t.nome;
        const arred = INT;
        const tab: Record<string, () => Membro> = {
          abs: () => m(t), round: () => m(arred), floor: () => m(arred), ceil: () => m(arred), truncate: () => m(arred),
          toInt: () => m(INT), toDouble: () => m(DOUBLE), toStringAsFixed: () => m(STRING, [['fractionDigits', INT]]),
          isEven: () => g(BOOL), isOdd: () => g(BOOL), isNegative: () => g(BOOL), isNaN: () => g(BOOL),
          isFinite: () => g(BOOL), isInfinite: () => g(BOOL), sign: () => g(t),
          compareTo: () => m(INT, [['other', NUM]]), remainder: () => m(eh === 'int' ? NUM : t, [['other', NUM]]),
          clamp: () => m(NUM, [['lowerLimit', NUM], ['upperLimit', NUM]]),
          roundToDouble: () => m(DOUBLE), floorToDouble: () => m(DOUBLE), ceilToDouble: () => m(DOUBLE),
        };
        if (eh !== 'int' && (nome === 'isEven' || nome === 'isOdd')) return undefined;
        return tab[nome]?.() ?? comum() ?? this.real(t.nome, nome);
      }
      case 'String': {
        const tab: Record<string, () => Membro> = {
          length: () => g(INT), isEmpty: () => g(BOOL), isNotEmpty: () => g(BOOL),
          toUpperCase: () => m(STRING), toLowerCase: () => m(STRING), trim: () => m(STRING),
          trimLeft: () => m(STRING), trimRight: () => m(STRING),
          contains: () => m(BOOL, [['other', STRING]]), startsWith: () => m(BOOL, [['pattern', STRING]]),
          endsWith: () => m(BOOL, [['other', STRING]]), indexOf: () => m(INT, [['pattern', STRING]]),
          lastIndexOf: () => m(INT, [['pattern', STRING]]),
          substring: () => m(STRING, [['start', INT], ['end', INT, 'opcional']]),
          split: () => m(lista(STRING), [['pattern', STRING]]),
          replaceAll: () => m(STRING, [['from', STRING], ['replace', STRING]]),
          replaceFirst: () => m(STRING, [['from', STRING], ['to', STRING]]),
          padLeft: () => m(STRING, [['width', INT], ['padding', STRING, 'opcional']]),
          padRight: () => m(STRING, [['width', INT], ['padding', STRING, 'opcional']]),
          codeUnitAt: () => m(INT, [['index', INT]]), compareTo: () => m(INT, [['other', STRING]]),
        };
        return tab[nome]?.() ?? comum() ?? this.real('String', nome);
      }
      case 'bool': return comum() ?? this.real('bool', nome);
      case 'List': {
        const tab: Record<string, () => Membro> = {
          ...ITER,
          add: () => m(VOID, [['value', E]]), addAll: () => m(VOID, [['iterable', iteravel(E)]]),
          insert: () => m(VOID, [['index', INT], ['element', E]]), remove: () => m(BOOL, [['value', anulavel(OBJECT)]]),
          removeAt: () => m(E, [['index', INT]]), removeLast: () => m(E), clear: () => m(VOID),
          indexOf: () => m(INT, [['element', E]]), reversed: () => g(iteravel(E)),
          sort: () => m(VOID, [['compare', fn(INT, E, E), 'opcional']]),
          sublist: () => m(lista(E), [['start', INT], ['end', INT, 'opcional']]),
          removeWhere: () => m(VOID, [['test', fn(BOOL, E)]]), indexWhere: () => m(INT, [['test', fn(BOOL, E)]]),
        };
        return tab[nome]?.() ?? comum() ?? this.real('List', nome);
      }
      case 'Set': {
        const tab: Record<string, () => Membro> = {
          ...ITER,
          add: () => m(BOOL, [['value', E]]), addAll: () => m(VOID, [['elements', iteravel(E)]]),
          remove: () => m(BOOL, [['value', anulavel(OBJECT)]]), clear: () => m(VOID),
          union: () => m(conjunto(E), [['other', conjunto(E)]]),
          intersection: () => m(conjunto(E), [['other', conjunto(anulavel(OBJECT))]]),
          difference: () => m(conjunto(E), [['other', conjunto(anulavel(OBJECT))]]),
        };
        return tab[nome]?.() ?? comum() ?? this.real('Set', nome);
      }
      case 'Iterable': return ITER[nome]?.() ?? comum() ?? this.real('Iterable', nome);
      case 'Map': {
        const tab: Record<string, () => Membro> = {
          length: () => g(INT), isEmpty: () => g(BOOL), isNotEmpty: () => g(BOOL),
          keys: () => g(iteravel(E)), values: () => g(iteravel(V)), entries: () => g(iteravel(cls('MapEntry', [E, V]))),
          containsKey: () => m(BOOL, [['key', anulavel(OBJECT)]]), containsValue: () => m(BOOL, [['value', anulavel(OBJECT)]]),
          remove: () => m(anulavel(V), [['key', anulavel(OBJECT)]]), clear: () => m(VOID),
          forEach: () => m(VOID, [['action', fn(VOID, E, V)]]),
          putIfAbsent: () => m(V, [['key', E], ['ifAbsent', fn(V)]]),
          addAll: () => m(VOID, [['other', mapa(E, V)]]),
        };
        return tab[nome]?.() ?? comum() ?? this.real('Map', nome);
      }
      case 'MapEntry':
        if (nome === 'key') return g(E);
        if (nome === 'value') return g(V);
        return comum() ?? this.real('MapEntry', nome);
      case 'Stdin':
        if (nome === 'readLineSync') return m(anulavel(STRING));
        return comum() ?? 'naoImplementado';
      case 'Stdout':
        if (nome === 'write') return m(VOID, [['object', anulavel(OBJECT)]]);
        if (nome === 'writeln') return m(VOID, [['object', anulavel(OBJECT), 'opcional']]);
        return comum() ?? 'naoImplementado';
      case 'FormatException':
        if (nome === 'message') return g(STRING);
        return comum() ?? undefined;
      case 'StateError': case 'ArgumentError': case 'RangeError':
        if (nome === 'message') return g(DYN);
        return comum() ?? undefined;
      case 'Type': case 'Object': case 'Exception': case 'Error': case 'Enum': case 'StackTrace':
        if (t.nome === 'Enum' && nome === 'name') return g(STRING);
        if (t.nome === 'Enum' && nome === 'index') return g(INT);
        return comum() ?? this.real('Object', nome);
      default:
        return comum() ?? undefined;
    }
  }

  private real(classe: string, nome: string): 'naoImplementado' | undefined {
    return MEMBROS_REAIS[classe]?.includes(nome) ? 'naoImplementado' : undefined;
  }

  /* ── Expressões ─────────────────────────────────────────────────────── */

  private exp(e: Expr, ctx?: Tipo): Tipo {
    const t = this.exp0(e, ctx);
    this.tipoDoInicial.set(e, t);
    return t;
  }

  private ehDouble(ctx?: Tipo) {
    return !!ctx && ctx.k === 'cls' && ctx.nome === 'double';
  }

  private exp0(e: Expr, ctx?: Tipo): Tipo {
    switch (e.k) {
      case 'int':
        if (this.ehDouble(ctx)) { this.comoDouble.add(e); return DOUBLE; }
        return INT;
      case 'double': return DOUBLE;
      case 'bool': return BOOL;
      case 'null': return NULO;
      case 'texto':
        for (const p of e.partes) if (typeof p !== 'string') this.exp(p);
        return STRING;
      case 'lista': return this.literalDeLista(e, ctx);
      case 'chaves': return this.literalDeChaves(e, ctx);
      case 'this':
        if (!this.ctx.classe || this.ctx.estatico) {
          this.erro(e.ini, e.fim, 'Expected identifier, but got \'this\'.');
          return DYN;
        }
        return cls(this.ctx.classe.nome);
      case 'super': return this.ctx.classe?.mae ? cls(this.ctx.classe.mae) : DYN;
      case 'alvoDaCascata': return this.alvoDaCascata[this.alvoDaCascata.length - 1] ?? DYN;
      case 'nome': return this.nome(e);
      case 'membro': return this.acessar(e);
      case 'chamada': return this.chamada(e);
      case 'indice': {
        const t = this.exp(e.alvo);
        if (t.k === 'cls' && t.q) {
          this.erro(e.indice.ini - 1, e.indice.ini, `Operator '[]' cannot be called on '${nomeDoTipo(t)}' because it is potentially null.`);
        }
        const s = semNulo(t);
        if (s.k === 'cls' && s.nome === 'List') {
          const it = this.exp(e.indice, INT);
          this.conferirAtribuicao(it, INT, e.indice, 'arg');
          return s.args[0];
        }
        if (s.k === 'cls' && s.nome === 'Map') {
          const it = this.exp(e.indice, s.args[0]);
          this.conferirAtribuicao(it, anulavel(OBJECT), e.indice, 'arg');
          return anulavel(s.args[1]);
        }
        if (s.k === 'cls' && s.nome === 'String') {
          const it = this.exp(e.indice, INT);
          this.conferirAtribuicao(it, INT, e.indice, 'arg');
          return STRING;
        }
        this.exp(e.indice);
        if (s.k === 'cls' && (this.classes.has(s.nome) || ['int', 'double', 'bool', 'Set', 'Iterable'].includes(s.nome))) {
          this.erro(e.indice.ini - 1, e.indice.ini, `The operator '[]' isn't defined for the class '${nomeDoTipo(s)}'.`, 'Try correcting the operator to an existing operator, or defining a \'[]\' operator.');
        }
        return DYN;
      }
      case 'unario': {
        if (e.op === '!') {
          const [v, f] = this.condicao(e.e);
          this.f = this.juntar(v, f);
          return BOOL;
        }
        const t = this.exp(e.e);
        if (t.k === 'cls' && t.q) {
          this.erro(e.ini, e.ini + 1, `Operator 'unary${e.op}' cannot be called on '${nomeDoTipo(t)}' because it is potentially null.`);
          return semNulo(t);
        }
        if (e.op === '-' && t.k === 'cls' && !ehNumerico(t)) {
          this.erro(e.ini, e.ini + 1, `The operator 'unary-' isn't defined for the class '${nomeDoTipo(t)}'.`, 'Try correcting the operator to an existing operator, or defining a \'unary-\' operator.');
          return DYN;
        }
        return t;
      }
      case 'prefixo': case 'posfixo': {
        if (e.op === '!') {
          const t = this.exp(e.e);
          return semNulo(t);
        }
        const t = this.exp(e.e);
        this.escrever(e.e, t, e.e);
        if (t.k === 'cls' && t.q) {
          this.erro(e.k === 'prefixo' ? e.ini : e.fim - 2, e.k === 'prefixo' ? e.ini + 2 : e.fim, `Operator '${e.op === '++' ? '+' : '-'}' cannot be called on '${nomeDoTipo(t)}' because it is potentially null.`);
        }
        return t;
      }
      case 'binario': return this.binario(e);
      case 'logico': {
        if (e.op === '??') {
          const a = this.exp(e.a, ctx ? anulavel(ctx) : undefined);
          const antes = this.copia(this.f);
          const b = this.exp(e.b, ctx);
          this.f = this.juntar(antes, this.f);
          return menorComum(semNulo(a), b, this);
        }
        const [v, f] = this.condicao(e);
        this.f = this.juntar(v, f);
        return BOOL;
      }
      case 'condicional': {
        const [v, f] = this.condicao(e.c);
        this.f = v;
        const s = this.exp(e.s, ctx);
        const depois = this.f;
        this.f = f;
        const n = this.exp(e.n, ctx);
        this.f = this.juntar(depois, this.f);
        return menorComum(s, n, this);
      }
      case 'atribuicao': return this.atribuicao(e);
      case 'eh': {
        const [v, f] = this.condicao(e);
        this.f = this.juntar(v, f);
        return BOOL;
      }
      case 'como': {
        this.exp(e.e);
        return this.resolver(e.tipo);
      }
      case 'funcao': return this.funcaoAnonima(e, ctx);
      case 'cascata': {
        const t = this.exp(e.alvo);
        this.alvoDaCascata.push(semNulo(t));
        for (const s of e.secoes) this.exp(s);
        this.alvoDaCascata.pop();
        return t;
      }
      case 'lance':
        this.exp(e.e);
        this.f.morto = true;
        return NUNCA;
    }
  }

  private literalDeLista(e: Extract<Expr, { k: 'lista' }>, ctx?: Tipo): Tipo {
    let elem: Tipo | null = e.tipo ? this.resolver(e.tipo) : null;
    if (!elem && ctx && ctx.k === 'cls' && (ctx.nome === 'List' || ctx.nome === 'Iterable') && ctx.args[0] && ctx.args[0].k !== 'dyn') {
      elem = ctx.args[0];
    }
    if (elem) {
      for (const it of e.itens) this.item(it, elem, null);
      return lista(elem);
    }
    let inferido: Tipo | null = null;
    for (const it of e.itens) {
      const t = this.item(it, null, null);
      inferido = inferido ? menorComum(inferido, t, this) : t;
    }
    return lista(!inferido || inferido.k === 'nulo' ? DYN : inferido);
  }

  /* `{}` é mapa, a menos que o tipo pedido seja conjunto; `{1, 2}` é conjunto. */
  private literalDeChaves(e: Extract<Expr, { k: 'chaves' }>, ctx?: Tipo): Tipo {
    const temPar = e.itens.some(i => this.ehPar(i));
    let ehMapa: boolean;
    if (e.tipos) ehMapa = e.tipos.length === 2;
    else if (e.itens.length) ehMapa = temPar;
    else {
      ehMapa = !(ctx && ctx.k === 'cls' && ctx.nome === 'Set');
      if (!ehMapa) this.conjuntosVazios.add(e);
    }
    if (ehMapa) {
      let k: Tipo | null = e.tipos ? this.resolver(e.tipos[0]) : null;
      let v: Tipo | null = e.tipos ? this.resolver(e.tipos[1]) : null;
      if (!k && ctx && ctx.k === 'cls' && ctx.nome === 'Map' && ctx.args.length === 2) {
        k = ctx.args[0].k === 'dyn' ? null : ctx.args[0];
        v = ctx.args[1].k === 'dyn' ? null : ctx.args[1];
      }
      if (k && v) {
        for (const it of e.itens) this.item(it, k, v);
        return mapa(k, v);
      }
      let ik: Tipo | null = null;
      let iv: Tipo | null = null;
      for (const it of e.itens) {
        const par = this.itemDeMapa(it);
        if (!par) continue;
        ik = ik ? menorComum(ik, par[0], this) : par[0];
        iv = iv ? menorComum(iv, par[1], this) : par[1];
      }
      return mapa(!ik || ik.k === 'nulo' ? DYN : ik, !iv || iv.k === 'nulo' ? DYN : iv);
    }
    let elem: Tipo | null = e.tipos ? this.resolver(e.tipos[0]) : null;
    if (!elem && ctx && ctx.k === 'cls' && (ctx.nome === 'Set' || ctx.nome === 'Iterable') && ctx.args[0]?.k !== 'dyn') elem = ctx.args[0] ?? null;
    if (elem) {
      for (const it of e.itens) this.item(it, elem, null);
      return conjunto(elem);
    }
    let inferido: Tipo | null = null;
    for (const it of e.itens) {
      const t = this.item(it, null, null);
      inferido = inferido ? menorComum(inferido, t, this) : t;
    }
    return conjunto(!inferido || inferido.k === 'nulo' ? DYN : inferido);
  }

  private ehPar(i: Item): boolean {
    if (i.k === 'par') return true;
    if (i.k === 'se') return this.ehPar(i.entao);
    if (i.k === 'para') return this.ehPar(i.corpo);
    return false;
  }

  private itemDeMapa(i: Item): [Tipo, Tipo] | null {
    if (i.k === 'par') return [this.exp(i.chave), this.exp(i.valor)];
    if (i.k === 'espalhar') {
      const t = semNulo(this.exp(i.e));
      return t.k === 'cls' && t.nome === 'Map' ? [t.args[0], t.args[1]] : [DYN, DYN];
    }
    if (i.k === 'se') {
      this.condicao(i.c);
      const a = this.itemDeMapa(i.entao);
      const b = i.senao ? this.itemDeMapa(i.senao) : null;
      if (a && b) return [menorComum(a[0], b[0], this), menorComum(a[1], b[1], this)];
      return a ?? b;
    }
    if (i.k === 'para') return this.comVariavelDoPara(i, () => this.itemDeMapa(i.corpo));
    return null;
  }

  private comVariavelDoPara<T>(i: Extract<Item, { k: 'para' }>, fazer: () => T): T {
    const t = this.exp(i.iteravel);
    const antes = this.escopo;
    this.escopo = new Escopo(antes);
    const v: Variavel = { nome: i.nome, tipo: i.tipo ? this.resolver(i.tipo) : elementoDe(t, this), final: i.mod === 'final', constante: false, late: false, promovivel: true, reatribuida: false };
    this.escopo.vars.set(i.nome, v);
    this.f.atrib.add(v);
    const r = fazer();
    this.escopo = antes;
    return r;
  }

  /** O tipo de um item de coleção; com `esperado`, confere contra ele. */
  private item(i: Item, esperado: Tipo | null, valor: Tipo | null): Tipo {
    switch (i.k) {
      case 'item': {
        const t = this.exp(i.e, esperado ?? undefined);
        if (esperado) this.conferirAtribuicao(t, esperado, i.e, 'var');
        return t;
      }
      case 'par': {
        const k = this.exp(i.chave, esperado ?? undefined);
        const v = this.exp(i.valor, valor ?? undefined);
        if (esperado) this.conferirAtribuicao(k, esperado, i.chave, 'var');
        if (valor) this.conferirAtribuicao(v, valor, i.valor, 'var');
        return k;
      }
      case 'espalhar': {
        const t = this.exp(i.e);
        if (t.k === 'cls' && t.q && !i.opcional) {
          this.erro(i.e.ini, i.e.fim, `An expression whose value can be 'null' must be null-checked before it can be dereferenced.`);
        }
        return elementoDe(semNulo(t), this);
      }
      case 'se': {
        const [v, f] = this.condicao(i.c);
        this.f = v;
        const a = this.item(i.entao, esperado, valor);
        const depois = this.f;
        this.f = f;
        const b = i.senao ? this.item(i.senao, esperado, valor) : NUNCA;
        this.f = this.juntar(depois, this.f);
        return menorComum(a, b, this);
      }
      case 'para': return this.comVariavelDoPara(i, () => this.item(i.corpo, esperado, valor));
    }
  }

  private nome(e: Extract<Expr, { k: 'nome' }>): Tipo {
    const v = this.escopo.achar(e.nome);
    if (v) {
      if (!this.f.atrib.has(v) && !v.late && !ehAnulavel(v.tipo) && v.tipo.k !== 'dyn' && this.escopo !== this.globais && v.promovivel) {
        this.erro(e.ini, e.fim, `Non-nullable variable '${e.nome}' must be assigned before it can be used.`);
        this.f.atrib.add(v);
      }
      return this.tipoAtual(v);
    }
    const doThis = this.membroDeThis(e.nome);
    if (doThis) return doThis;
    const fn = this.funcoes.get(e.nome);
    if (fn) return { k: 'fn', ret: fn.ret, params: fn.params.map(p => p.tipo), q: false };
    if (this.classes.has(e.nome)) return cls('Type');
    const embutido = this.embutido(e.nome);
    if (embutido) return embutido;
    if (this.prefixos.has(e.nome)) {
      this.erro(e.ini, e.fim, `A prefix can't be used as an expression.`);
      return DYN;
    }
    if (['int', 'double', 'String', 'bool', 'num', 'List', 'Map', 'Set', 'Object'].includes(e.nome)) return cls('Type');
    this.erro(e.ini, e.fim, `Undefined name '${e.nome}'.`);
    return DYN;
  }

  private membroDeThis(nome: string): Tipo | null {
    const c = this.ctx.classe;
    if (!c) return null;
    for (const estatico of this.ctx.estatico ? [true] : [false, true]) {
      const m = this.membroDaClasse(c, nome, estatico);
      if (m && m !== 'naoImplementado') {
        if (m.k === 'metodo') return { k: 'fn', ret: m.sig.ret, params: m.sig.params.map(p => p.tipo), q: false };
        return m.tipo;
      }
    }
    if (this.ctx.estatico) {
      const m = this.membroDaClasse(c, nome, false);
      if (m) return null;
    }
    return null;
  }

  private embutido(nome: string): Tipo | null {
    const math = this.importados.has('dart:math');
    const io = this.importados.has('dart:io');
    if (math && (nome === 'pi' || nome === 'e')) return DOUBLE;
    /* `lista.reduce(max)`: a função solta, passada adiante sem parênteses. */
    if (math && (nome === 'max' || nome === 'min')) return DYN;
    if (math && nome === 'sqrt') return { k: 'fn', ret: DOUBLE, params: [NUM], q: false };
    if (io && nome === 'stdin') return cls('Stdin');
    if (io && nome === 'stdout') return cls('Stdout');
    return null;
  }

  private acessar(e: Extract<Expr, { k: 'membro' }>): Tipo {
    /* Prefixo de importação: `math.pi`. */
    if (e.alvo.k === 'nome' && !this.escopo.achar(e.alvo.nome) && this.prefixos.has(e.alvo.nome)) {
      const lib = this.prefixos.get(e.alvo.nome)!;
      if (lib === 'dart:math' && (e.nome === 'pi' || e.nome === 'e')) return DOUBLE;
      if (lib === 'dart:io' && e.nome === 'stdin') return cls('Stdin');
      if (lib === 'dart:io' && e.nome === 'stdout') return cls('Stdout');
      this.erro(e.posNome, e.fim, `Undefined name '${e.nome}'.`);
      return DYN;
    }
    /* Membro estático ou valor de enum: `Classe.amigo`, `Classe.values`. */
    if (e.alvo.k === 'nome' && !this.escopo.achar(e.alvo.nome) && !this.membroDeThis(e.alvo.nome) && this.classes.has(e.alvo.nome)) {
      const c = this.classes.get(e.alvo.nome)!;
      if (c.enumeracao) {
        if (e.nome === 'values') return lista(cls(c.nome));
        if (c.enumeracao.includes(e.nome)) return cls(c.nome);
      }
      const m = this.membroDaClasse(c, e.nome, true);
      if (m && m !== 'naoImplementado') {
        if (m.k === 'metodo') return { k: 'fn', ret: m.sig.ret, params: m.sig.params.map(p => p.tipo), q: false };
        return m.tipo;
      }
      this.erro(e.posNome, e.fim, `Member not found: '${e.nome}'.`);
      return DYN;
    }
    if (e.alvo.k === 'super') {
      const mae = this.ctx.classe?.mae ? this.classes.get(this.ctx.classe.mae) : undefined;
      if (!mae) return DYN;
      const m = this.membroDaClasse(mae, e.nome, false);
      if (!m || m === 'naoImplementado') {
        this.erro(e.posNome, e.fim, `Superclass has no getter named '${e.nome}'.`);
        return DYN;
      }
      return m.k === 'metodo' ? { k: 'fn', ret: m.sig.ret, params: m.sig.params.map(p => p.tipo), q: false } : m.tipo;
    }
    const t = this.exp(e.alvo);
    return this.tipoDoMembro(t, e.nome, e.posNome, e.fim, e.opcional, e.alvo);
  }

  private tipoDoMembro(t: Tipo, nome: string, pos: number, fim: number, opcional: boolean, alvo: Expr): Tipo {
    if (t.k === 'dyn' || t.k === 'nunca') return DYN;
    if (t.k === 'nulo') {
      if (opcional) return NULO;
      const m = this.membroDoNucleo(OBJECT as Extract<Tipo, { k: 'cls' }>, nome);
      if (m && m !== 'naoImplementado') return m.k === 'metodo' ? DYN : m.tipo;
      this.erro(pos, fim, `The getter '${nome}' isn't defined for the class 'Null'.`, `Try correcting the name to the name of an existing getter, or defining a getter or field named '${nome}'.`);
      return DYN;
    }
    if (t.k === 'fn') return DYN;
    if (t.k !== 'cls') return DYN;
    const s = semNulo(t) as Extract<Tipo, { k: 'cls' }>;
    const m = this.membro(s, nome);
    if (m === 'naoImplementado') {
      this.fora(pos, fim, `o membro "${nome}" de ${nomeDoTipo(s)}`);
      return DYN;
    }
    if (!m) {
      this.erro(pos, fim, `The getter '${nome}' isn't defined for the class '${nomeDoTipo(s)}'.`, `Try correcting the name to the name of an existing getter, or defining a getter or field named '${nome}'.`);
      return DYN;
    }
    const ehDoObject = ['toString', 'hashCode', 'runtimeType'].includes(nome);
    if (t.q && !opcional && !ehDoObject) {
      this.erro(pos, fim, `Property '${nome}' cannot be accessed on '${nomeDoTipo(t)}' because it is potentially null.`, 'Try accessing using ?. instead.');
    }
    let r: Tipo = m.k === 'metodo' ? { k: 'fn', ret: m.sig.ret, params: m.sig.params.map(p => p.tipo), q: false } : m.tipo;
    /* O campo privado e final de `this` se promove (Dart 3.2); o público, não. */
    if (m.k === 'campo' && m.privadoFinal && alvo.k === 'this') {
      const v = this.variavelDoCampo(m.nome);
      if (v) r = this.tipoAtual(v);
    }
    return opcional ? anulavel(r) : r;
  }

  private camposPromoviveis = new Map<string, Variavel>();
  private variavelDoCampo(nome: string): Variavel | null {
    const c = this.ctx.classe;
    if (!c) return null;
    const chave = `${c.nome}.${nome}`;
    let v = this.camposPromoviveis.get(chave);
    if (!v) {
      const f = this.acharCampo(c, nome);
      if (!f) return null;
      v = { nome, tipo: f.tipo, final: true, constante: false, late: false, promovivel: true, reatribuida: false };
      this.camposPromoviveis.set(chave, v);
    }
    return v;
  }

  private chamada(e: Extract<Expr, { k: 'chamada' }>): Tipo {
    const alvo = e.alvo;
    if (alvo.k === 'nome') {
      const v = this.escopo.achar(alvo.nome);
      if (v) {
        const t = this.tipoAtual(v);
        return this.chamarValor(t, e, alvo);
      }
      const doThis = this.ctx.classe ? this.metodoDeThis(alvo.nome) : null;
      if (doThis) {
        this.conferirArgs(doThis, e.args, e.posAbre);
        return doThis.ret;
      }
      const fn = this.funcoes.get(alvo.nome);
      if (fn) {
        this.conferirArgs(fn, e.args, e.posAbre);
        return fn.ret;
      }
      if (this.classes.has(alvo.nome)) return this.instanciar(alvo.nome, '', e, alvo.ini, alvo.fim);
      const embutida = this.funcaoEmbutida(alvo.nome, e);
      if (embutida) return embutida;
      if (alvo.nome === 'List' || alvo.nome === 'Map' || alvo.nome === 'Set') {
        e.args.forEach(a => this.exp(a.e));
        const args = (e.tipoArgs ?? []).map(t => this.resolver(t));
        if (alvo.nome === 'Map') return mapa(args[0] ?? DYN, args[1] ?? DYN);
        return cls(alvo.nome, [args[0] ?? DYN]);
      }
      if (this.campoOuGetterDeThis(alvo.nome)) {
        e.args.forEach(a => this.exp(a.e));
        return DYN;
      }
      e.args.forEach(a => this.exp(a.e));
      this.erro(alvo.ini, alvo.fim, `Method not found: '${alvo.nome}'.`);
      return DYN;
    }
    if (alvo.k === 'membro') {
      /* Prefixo: `math.max(a, b)`. */
      if (alvo.alvo.k === 'nome' && !this.escopo.achar(alvo.alvo.nome) && this.prefixos.has(alvo.alvo.nome)) {
        const r = this.funcaoEmbutida(alvo.nome, e, this.prefixos.get(alvo.alvo.nome));
        if (r) return r;
        e.args.forEach(a => this.exp(a.e));
        this.erro(alvo.posNome, alvo.fim, `Method not found: '${alvo.nome}'.`);
        return DYN;
      }
      /* Construtor com nome, método estático, ou `int.parse`. */
      if (alvo.alvo.k === 'nome' && !this.escopo.achar(alvo.alvo.nome)) {
        const nomeDaClasse = alvo.alvo.nome;
        const estatico = this.estaticoDoNucleo(nomeDaClasse, alvo.nome, e);
        if (estatico) return estatico;
        const c = this.classes.get(nomeDaClasse);
        if (c && !this.membroDeThis(nomeDaClasse)) {
          if (c.construtores.has(alvo.nome)) return this.instanciar(nomeDaClasse, alvo.nome, e, alvo.alvo.ini, alvo.fim);
          const m = this.membroDaClasse(c, alvo.nome, true);
          if (m && m !== 'naoImplementado' && m.k === 'metodo') {
            this.conferirArgs(m.sig, e.args, e.posAbre);
            return m.sig.ret;
          }
          e.args.forEach(a => this.exp(a.e));
          this.erro(alvo.posNome, alvo.fim, `Member not found: '${alvo.nome}'.`);
          return DYN;
        }
      }
      if (alvo.alvo.k === 'super') {
        const mae = this.ctx.classe?.mae ? this.classes.get(this.ctx.classe.mae) : undefined;
        const m = mae ? this.membroDaClasse(mae, alvo.nome, false) : undefined;
        if (m && m !== 'naoImplementado' && m.k === 'metodo') {
          this.conferirArgs(m.sig, e.args, e.posAbre);
          return m.sig.ret;
        }
        e.args.forEach(a => this.exp(a.e));
        if (mae) this.erro(alvo.posNome, alvo.fim, `Superclass has no method named '${alvo.nome}'.`);
        return DYN;
      }
      const t = this.exp(alvo.alvo);
      return this.chamarMetodo(t, alvo, e);
    }
    const t = this.exp(alvo);
    return this.chamarValor(t, e, alvo);
  }

  private metodoDeThis(nome: string): Assinatura | null {
    const c = this.ctx.classe!;
    for (const estatico of this.ctx.estatico ? [true] : [false, true]) {
      const m = this.membroDaClasse(c, nome, estatico);
      if (m && m !== 'naoImplementado' && m.k === 'metodo' && !['toString', 'hashCode', 'runtimeType'].includes(nome)) return m.sig;
      if (m && m !== 'naoImplementado' && m.k === 'metodo' && nome === 'toString') return m.sig;
    }
    return null;
  }

  private campoOuGetterDeThis(nome: string): boolean {
    const c = this.ctx.classe;
    if (!c) return false;
    const m = this.membroDaClasse(c, nome, this.ctx.estatico);
    return !!m && m !== 'naoImplementado' && m.k !== 'metodo';
  }

  private chamarValor(t: Tipo, e: Extract<Expr, { k: 'chamada' }>, alvo: Expr): Tipo {
    if (t.k === 'fn') {
      if (t.q) this.erro(alvo.ini, alvo.fim, `Can't use an expression of type '${nomeDoTipo(t)}' as a function because it's potentially null.`, 'Try checking that the value isn\'t \'null\' before calling it.');
      e.args.forEach((a, i) => {
        const p = t.params[i];
        const ta = this.exp(a.e, p);
        if (p && !a.nome) this.conferirAtribuicao(ta, p, a.e, 'arg');
      });
      return t.ret;
    }
    e.args.forEach(a => this.exp(a.e));
    if (t.k === 'cls' && t.nome === 'Function') return DYN;
    if (t.k === 'cls' && !t.q && alvo.k === 'nome') {
      this.erro(alvo.ini, alvo.fim, `The method 'call' isn't defined for the class '${nomeDoTipo(t)}'.`, 'Try correcting the name to the name of an existing method, or defining a method named \'call\'.');
    }
    return DYN;
  }

  private chamarMetodo(t: Tipo, alvo: Extract<Expr, { k: 'membro' }>, e: Extract<Expr, { k: 'chamada' }>): Tipo {
    const nome = alvo.nome;
    if (t.k === 'dyn' || t.k === 'nunca' || t.k === 'void') {
      e.args.forEach(a => this.exp(a.e));
      return DYN;
    }
    if (t.k === 'nulo') {
      e.args.forEach(a => this.exp(a.e));
      if (alvo.opcional) return NULO;
      if (nome === 'toString') return STRING;
      this.erro(alvo.posNome, alvo.fim, `The method '${nome}' isn't defined for the class 'Null'.`, `Try correcting the name to the name of an existing method, or defining a method named '${nome}'.`);
      return DYN;
    }
    if (t.k === 'fn') {
      e.args.forEach(a => this.exp(a.e));
      return nome === 'call' ? t.ret : nome === 'toString' ? STRING : DYN;
    }
    const s = semNulo(t) as Extract<Tipo, { k: 'cls' }>;
    const m = this.membro(s, nome);
    if (m === 'naoImplementado') {
      e.args.forEach(a => this.exp(a.e));
      this.fora(alvo.posNome, alvo.fim, `o método "${nome}" de ${nomeDoTipo(s)}`);
      return DYN;
    }
    if (!m) {
      e.args.forEach(a => this.exp(a.e));
      this.erro(alvo.posNome, alvo.fim, `The method '${nome}' isn't defined for the class '${nomeDoTipo(s)}'.`, `Try correcting the name to the name of an existing method, or defining a method named '${nome}'.`);
      return DYN;
    }
    const ehDoObject = nome === 'toString';
    if (t.k === 'cls' && t.q && !alvo.opcional && !ehDoObject) {
      this.erro(alvo.posNome, alvo.fim, `Method '${nome}' cannot be called on '${nomeDoTipo(t)}' because it is potentially null.`, 'Try calling using ?. instead.');
    }
    let ret: Tipo;
    if (m.k !== 'metodo') {
      const tm = m.tipo;
      ret = this.chamarValor(tm, e, alvo);
    } else if (m.especial) {
      ret = this.especial(m.especial, s, e);
    } else {
      this.conferirArgs(m.sig, e.args, e.posAbre);
      ret = m.sig.ret;
    }
    return alvo.opcional ? anulavel(ret) : ret;
  }

  /* `map`, `fold` e `expand` têm o tipo de saída que a função de dentro der. */
  private especial(qual: string, s: Extract<Tipo, { k: 'cls' }>, e: Extract<Expr, { k: 'chamada' }>): Tipo {
    const E = elementoDe(s, this);
    const fn = (ret: Tipo, ...params: Tipo[]): Tipo => ({ k: 'fn', ret, params, q: false });
    if (qual === 'map' || qual === 'expand') {
      const a = e.args[0];
      if (!a) return iteravel(DYN);
      const t = this.exp(a.e, fn(DYN, E));
      const r = t.k === 'fn' ? t.ret : DYN;
      if (qual === 'expand') return iteravel(elementoDe(r, this));
      return iteravel(r.k === 'void' ? DYN : r);
    }
    if (qual === 'fold') {
      const [ini, comb] = e.args;
      if (!ini || !comb) { e.args.forEach(a => this.exp(a.e)); return DYN; }
      const ti = this.exp(ini.e);
      const acc = ti.k === 'nulo' ? DYN : ti;
      this.exp(comb.e, fn(acc, acc, E));
      return acc;
    }
    return DYN;
  }

  private funcaoEmbutida(nome: string, e: Extract<Expr, { k: 'chamada' }>, lib?: string): Tipo | null {
    const args = e.args;
    const daMath = lib ? lib === 'dart:math' : this.importados.has('dart:math');
    if (!lib && nome === 'print') {
      if (args.length !== 1) {
        args.forEach(a => this.exp(a.e));
        if (args.length > 1) this.erro(e.posAbre, e.posAbre + 1, `Too many positional arguments: 1 allowed, but ${args.length} found.`, 'Try removing the extra positional arguments.');
        else this.erro(e.posAbre, e.posAbre + 1, 'Too few positional arguments: 1 required, 0 given.');
        return VOID;
      }
      const t = this.exp(args[0].e);
      if (t.k === 'void') this.erro(args[0].e.ini, args[0].e.fim, 'This expression has type \'void\' and can\'t be used.', 'Try checking to see if you\'re using the correct API; there might be a function or call that returns void you didn\'t expect. Also check type parameters and variables which might also be void.');
      return VOID;
    }
    if (daMath && (nome === 'max' || nome === 'min')) {
      const ts = args.map(a => this.exp(a.e));
      ts.forEach((t, i) => this.conferirAtribuicao(t, NUM, args[i].e, 'arg'));
      if (args.length !== 2) this.erro(e.posAbre, e.posAbre + 1, `Too few positional arguments: 2 required, ${args.length} given.`);
      return ts.length === 2 && ts.every(t => mesmoTipo(t, INT)) ? INT : ts.length === 2 && ts.every(t => mesmoTipo(t, DOUBLE)) ? DOUBLE : NUM;
    }
    if (daMath && nome === 'sqrt') {
      args.forEach(a => this.conferirAtribuicao(this.exp(a.e), NUM, a.e, 'arg'));
      return DOUBLE;
    }
    if (daMath && nome === 'pow') {
      args.forEach(a => this.conferirAtribuicao(this.exp(a.e), NUM, a.e, 'arg'));
      return NUM;
    }
    if (daMath && nome === 'Random') {
      this.fora(e.alvo.ini, e.alvo.fim, 'números sorteados (Random) — o sorteio daria um resultado diferente do computador do clube a cada execução');
      return DYN;
    }
    if (lib) return null;
    const excecao = ['Exception', 'FormatException', 'StateError', 'ArgumentError', 'RangeError', 'UnsupportedError'];
    if (excecao.includes(nome)) {
      args.forEach(a => this.exp(a.e));
      return cls(nome);
    }
    if (nome === 'Object') return OBJECT;
    if (nome === 'identical') { args.forEach(a => this.exp(a.e)); return BOOL; }
    if (nome === 'DateTime' || nome === 'Duration' || nome === 'Future' || nome === 'Stopwatch') {
      args.forEach(a => this.exp(a.e));
      this.fora(e.alvo.ini, e.alvo.fim, nome);
      return DYN;
    }
    return null;
  }

  private estaticoDoNucleo(classe: string, nome: string, e: Extract<Expr, { k: 'chamada' }>): Tipo | null {
    const args = e.args;
    const confere = (tipos: Tipo[]) => args.forEach((a, i) => {
      const t = this.exp(a.e, tipos[i]);
      if (tipos[i]) this.conferirAtribuicao(t, tipos[i], a.e, 'arg');
    });
    if (this.escopo.achar(classe) || this.classes.has(classe)) return null;
    if ((classe === 'int' || classe === 'double' || classe === 'num') && (nome === 'parse' || nome === 'tryParse')) {
      confere([STRING]);
      const t = cls(classe);
      return nome === 'tryParse' ? anulavel(t) : t;
    }
    if (classe === 'String' && nome === 'fromCharCode') { confere([INT]); return STRING; }
    if (classe === 'List') {
      const tipoArg = e.tipoArgs?.[0] ? this.resolver(e.tipoArgs[0]) : null;
      if (nome === 'filled') {
        const [n, v] = args;
        if (n) this.conferirAtribuicao(this.exp(n.e, INT), INT, n.e, 'arg');
        const tv = v ? this.exp(v.e, tipoArg ?? undefined) : DYN;
        return lista(tipoArg ?? (tv.k === 'nulo' ? DYN : tv));
      }
      if (nome === 'generate') {
        const [n, f] = args;
        if (n) this.conferirAtribuicao(this.exp(n.e, INT), INT, n.e, 'arg');
        const tf = f ? this.exp(f.e, { k: 'fn', ret: tipoArg ?? DYN, params: [INT], q: false }) : DYN;
        return lista(tipoArg ?? (tf.k === 'fn' ? tf.ret : DYN));
      }
      if (nome === 'empty') { args.forEach(a => this.exp(a.e)); return lista(tipoArg ?? DYN); }
      if (nome === 'from' || nome === 'of') {
        const t = args[0] ? this.exp(args[0].e) : DYN;
        return lista(tipoArg ?? elementoDe(t, this));
      }
      return null;
    }
    return null;
  }

  private instanciar(nome: string, construtor: string, e: Extract<Expr, { k: 'chamada' }>, ini: number, fim: number): Tipo {
    const c = this.classes.get(nome)!;
    if (c.enumeracao) {
      e.args.forEach(a => this.exp(a.e));
      this.erro(ini, fim, `Enums can't be instantiated.`);
      return DYN;
    }
    if (c.abstrata) {
      e.args.forEach(a => this.exp(a.e));
      this.erro(ini, ini + nome.length, `The class '${nome}' is abstract and can't be instantiated.`);
      return cls(nome);
    }
    const ctor = c.construtores.get(construtor);
    if (!ctor) {
      e.args.forEach(a => this.exp(a.e));
      if (construtor) this.erro(ini, fim, `Member not found: '${nome}.${construtor}'.`);
      else this.erro(ini, fim, `Couldn't find constructor '${nome}'.`);
      return cls(nome);
    }
    this.conferirArgs(ctor.sig, e.args, e.posAbre);
    return cls(nome);
  }

  private binario(e: Extract<Expr, { k: 'binario' }>): Tipo {
    const op = e.op;
    if (op === '==' || op === '!=') {
      /* A comparação com null promove; a condição cuida disso. As outras só
         precisam dos dois lados analisados. */
      if (e.a.k === 'null' || e.b.k === 'null') {
        const [v, f] = this.condicao(e);
        this.f = this.juntar(v, f);
        return BOOL;
      }
      this.exp(e.a);
      this.exp(e.b);
      return BOOL;
    }
    const a = this.exp(e.a);
    if (a.k === 'dyn') { this.exp(e.b); return op === '<' || op === '>' || op === '<=' || op === '>=' ? BOOL : DYN; }
    if (a.k === 'cls' && a.q) {
      this.erro(e.posOp, e.posOp + op.length, `Operator '${op}' cannot be called on '${nomeDoTipo(a)}' because it is potentially null.`);
      this.exp(e.b);
      return op === '<' || op === '>' || op === '<=' || op === '>=' ? BOOL : semNulo(a);
    }
    const comparacao = op === '<' || op === '>' || op === '<=' || op === '>=';
    if (ehNumerico(a)) {
      const b = this.exp(e.b, op === '/' ? undefined : a.k === 'cls' && a.nome === 'double' ? DOUBLE : undefined);
      if (!['+', '-', '*', '/', '%', '~/', '<', '>', '<=', '>=', '&', '|', '^', '<<', '>>'].includes(op)) return DYN;
      if (['&', '|', '^', '<<', '>>'].includes(op)) {
        if (a.k === 'cls' && a.nome !== 'int') {
          this.erro(e.posOp, e.posOp + op.length, `The operator '${op}' isn't defined for the class '${nomeDoTipo(a)}'.`, `Try correcting the operator to an existing operator, or defining a '${op}' operator.`);
          return DYN;
        }
        this.conferirAtribuicao(b, INT, e.b, 'arg');
        return INT;
      }
      if (!this.conferirAtribuicao(b, NUM, e.b, 'arg')) return comparacao ? BOOL : DYN;
      if (comparacao) return BOOL;
      if (op === '/') return DOUBLE;
      if (op === '~/') return INT;
      const nomeA = (a as Extract<Tipo, { k: 'cls' }>).nome;
      const nomeB = b.k === 'cls' ? b.nome : 'num';
      if (nomeA === 'double' || nomeB === 'double') return nomeA === 'num' && nomeB === 'double' ? NUM : DOUBLE;
      if (nomeA === 'int' && nomeB === 'int') return INT;
      return NUM;
    }
    if (a.k === 'cls' && a.nome === 'String') {
      const b = this.exp(e.b);
      if (op === '+') { this.conferirAtribuicao(b, STRING, e.b, 'arg'); return STRING; }
      if (op === '*') { this.conferirAtribuicao(b, INT, e.b, 'arg'); return STRING; }
      this.erro(e.posOp, e.posOp + op.length, `The operator '${op}' isn't defined for the class 'String'.`, `Try correcting the operator to an existing operator, or defining a '${op}' operator.`);
      return DYN;
    }
    if (a.k === 'cls' && a.nome === 'List' && op === '+') {
      const b = this.exp(e.b, a);
      this.conferirAtribuicao(b, a, e.b, 'arg');
      return a;
    }
    this.exp(e.b);
    if (a.k === 'cls') {
      this.erro(e.posOp, e.posOp + op.length, `The operator '${op}' isn't defined for the class '${nomeDoTipo(a)}'.`, `Try correcting the operator to an existing operator, or defining a '${op}' operator.`);
    }
    return DYN;
  }

  /* Escrever numa variável: final, const, o tipo e a promoção. */
  private escrever(alvo: Expr, valor: Tipo, expValor: Expr | null): void {
    if (alvo.k === 'nome') {
      const v = this.escopo.achar(alvo.nome);
      if (v) {
        if (v.constante) this.erro(alvo.ini, alvo.fim, `Can't assign to the const variable '${alvo.nome}'.`);
        else if (v.final && !(v.late && !this.f.atrib.has(v)) && (this.f.atrib.has(v) || !v.promovivel)) {
          this.erro(alvo.ini, alvo.fim, `Can't assign to the final variable '${alvo.nome}'.`);
        }
        if (expValor) this.conferirAtribuicao(valor, v.tipo, expValor, 'var');
        this.f.atrib.add(v);
        if (v.promovivel) {
          const declarado = v.tipo;
          if (ehAnulavel(declarado) && valor.k !== 'nulo' && valor.k !== 'dyn' && !ehAnulavel(valor) && subtipo(valor, semNulo(declarado), this)) {
            this.f.promo.set(v, semNulo(declarado));
          } else this.f.promo.delete(v);
        }
        return;
      }
      const c = this.ctx.classe;
      if (c) {
        const m = this.membroDaClasse(c, alvo.nome, this.ctx.estatico);
        if (m && m !== 'naoImplementado' && m.k === 'campo') {
          if (m.final) this.erro(alvo.ini, alvo.fim, `The setter '${alvo.nome}' isn't defined for the class '${c.nome}'.`, `Try correcting the name to the name of an existing setter, or defining a setter or field named '${alvo.nome}'.`);
          else if (expValor) this.conferirAtribuicao(valor, m.tipo, expValor, 'var');
          return;
        }
      }
      if (this.funcoes.has(alvo.nome)) return;
      this.erro(alvo.ini, alvo.fim, `Setter not found: '${alvo.nome}'.`);
      return;
    }
    if (alvo.k === 'membro') {
      const t = alvo.alvo.k === 'alvoDaCascata' ? this.alvoDaCascata[this.alvoDaCascata.length - 1] ?? DYN : this.exp(alvo.alvo);
      if (t.k !== 'cls') return;
      const s = semNulo(t) as Extract<Tipo, { k: 'cls' }>;
      const c = this.classes.get(s.nome);
      if (t.q && !alvo.opcional) {
        this.erro(alvo.posNome, alvo.fim, `Property '${alvo.nome}' cannot be accessed on '${nomeDoTipo(t)}' because it is potentially null.`, 'Try accessing using ?. instead.');
      }
      if (!c) {
        this.erro(alvo.posNome, alvo.fim, `The setter '${alvo.nome}' isn't defined for the class '${nomeDoTipo(s)}'.`, `Try correcting the name to the name of an existing setter, or defining a setter or field named '${alvo.nome}'.`);
        return;
      }
      for (const x of this.cadeia(c)) {
        const f = x.campos.get(alvo.nome);
        if (f && !f.estatico) {
          if (f.final) this.erro(alvo.posNome, alvo.fim, `The setter '${alvo.nome}' isn't defined for the class '${c.nome}'.`, `Try correcting the name to the name of an existing setter, or defining a setter or field named '${alvo.nome}'.`);
          else if (expValor) this.conferirAtribuicao(valor, f.tipo, expValor, 'var');
          return;
        }
        const st = x.setters.get(alvo.nome);
        if (st) {
          if (expValor && st.sig.params[0]) this.conferirAtribuicao(valor, st.sig.params[0].tipo, expValor, 'var');
          return;
        }
      }
      this.erro(alvo.posNome, alvo.fim, `The setter '${alvo.nome}' isn't defined for the class '${c.nome}'.`, `Try correcting the name to the name of an existing setter, or defining a setter or field named '${alvo.nome}'.`);
      return;
    }
    if (alvo.k === 'indice') {
      const t = alvo.alvo.k === 'alvoDaCascata' ? this.alvoDaCascata[this.alvoDaCascata.length - 1] ?? DYN : this.exp(alvo.alvo);
      const s = semNulo(t);
      if (t.k === 'cls' && t.q) this.erro(alvo.indice.ini - 1, alvo.indice.ini, `Operator '[]=' cannot be called on '${nomeDoTipo(t)}' because it is potentially null.`);
      if (s.k === 'cls' && s.nome === 'List') {
        this.conferirAtribuicao(this.exp(alvo.indice, INT), INT, alvo.indice, 'arg');
        if (expValor) this.conferirAtribuicao(valor, s.args[0], expValor, 'arg');
      } else if (s.k === 'cls' && s.nome === 'Map') {
        this.conferirAtribuicao(this.exp(alvo.indice, s.args[0]), s.args[0], alvo.indice, 'arg');
        if (expValor) this.conferirAtribuicao(valor, s.args[1], expValor, 'arg');
      } else this.exp(alvo.indice);
    }
  }

  private atribuicao(e: Extract<Expr, { k: 'atribuicao' }>): Tipo {
    const declaradoDoAlvo = (): Tipo | undefined => {
      if (e.alvo.k === 'nome') {
        const v = this.escopo.achar(e.alvo.nome);
        if (v) return v.tipo;
        const c = this.ctx.classe;
        if (c) {
          const m = this.membroDaClasse(c, e.alvo.nome, this.ctx.estatico);
          if (m && m !== 'naoImplementado' && m.k === 'campo') return m.tipo;
        }
      }
      return undefined;
    };
    if (e.op === '=') {
      const ctx = declaradoDoAlvo();
      const t = this.exp(e.valor, ctx);
      this.escrever(e.alvo, t, e.valor);
      return t;
    }
    if (e.op === '??=') {
      const atual = this.exp(e.alvo);
      const ctx = declaradoDoAlvo();
      const t = this.exp(e.valor, ctx);
      const r = menorComum(semNulo(atual), t, this);
      this.escrever(e.alvo, r, null);
      if (ctx) this.conferirAtribuicao(t, ctx, e.valor, 'var');
      return r;
    }
    /* `+=` e os outros: a conta e depois a escrita. */
    const op = e.op.slice(0, -1);
    const conta: Expr = { k: 'binario', op, a: e.alvo, b: e.valor, posOp: e.posOp, ini: e.ini, fim: e.fim };
    const t = this.binario(conta as Extract<Expr, { k: 'binario' }>);
    const declarado = declaradoDoAlvo();
    if (declarado && t.k !== 'dyn' && !atribuivel(t, declarado, this)) {
      this.erro(e.ini, e.fim, `A value of type '${nomeDoTipo(t)}' can't be assigned to a variable of type '${nomeDoTipo(declarado)}'.`);
    }
    this.escrever(e.alvo, t, null);
    return t;
  }

  private funcaoAnonima(e: Extract<Expr, { k: 'funcao' }>, ctx?: Tipo): Tipo {
    const doContexto = ctx && ctx.k === 'fn' ? ctx : null;
    const params = e.params.map((p, i) => (p.tipo ? this.resolver(p.tipo) : doContexto?.params[i] ?? DYN));
    const sig: Assinatura = {
      params: e.params.map((p, i) => ({ nome: p.nome, tipo: params[i], modo: p.modo, obrigatorio: p.obrigatorio, temPadrao: !!p.padrao })),
      ret: DYN,
    };
    const ret = this.funcaoAnonimaOuLocal(e.params, sig, e.corpo, null);
    return { k: 'fn', ret, params, q: false };
  }

  private funcaoAnonimaOuLocal(params: Param[], sig: Assinatura, corpo: Corpo, retDeclarado: Tipo | null): Tipo {
    const antes = { ctx: this.ctx, escopo: this.escopo, f: this.f };
    this.ctx = { ret: retDeclarado, retornos: [], classe: antes.ctx.classe, estatico: antes.ctx.estatico, aninhado: true };
    this.f = this.copia(antes.f);
    this.f.morto = false;
    this.escopo = new Escopo(antes.escopo);
    try {
      params.forEach((p, i) => this.declararParam(p, sig.params[i].tipo));
      const t = this.corpo(corpo, retDeclarado);
      if (retDeclarado) return retDeclarado;
      if (corpo.k === 'seta') return t;
      const rs = this.ctx.retornos;
      if (!rs.length) return VOID;
      let r = rs[0];
      for (const x of rs.slice(1)) r = menorComum(r, x, this);
      if (!this.f.morto && r.k !== 'void') r = anulavel(r);
      return r;
    } finally {
      this.ctx = antes.ctx;
      this.escopo = antes.escopo;
      this.f = antes.f;
    }
  }
}
