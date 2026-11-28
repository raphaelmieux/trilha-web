import type {
  ArquivoDart, Arg, Corpo, DeclDeClasse, DeclDeConstrutor, DeclDeFuncao, Expr, Instr, Item, Param, TipoEscrito,
} from './dartSintaxe';
import { linhaEColuna } from './dartLexico';

/**
 * O executor: roda o programa que o analisador aprovou.
 *
 * Os valores são os do JavaScript sempre que dá para ser fiel — `String` é
 * texto, `bool` é booleano, `null` é nulo —, com uma troca que importa: o
 * `int` do Dart é **`bigint`**, e o `double` é `number`. No JavaScript
 * `5 / 2` e `5.0 / 2` são a mesma conta; no Dart o primeiro é `int` dividido
 * por `int` dando `2.5` e `5 ~/ 2` dá `2`, e um `print(2.0)` escreve `2.0`
 * onde o JavaScript escreveria `2`. Guardar o `int` como `bigint` é o que
 * deixa o tipo de cada número viver junto com o número.
 *
 * O laço sem fim não trava a página: cada passo conta, e passado o limite o
 * programa para com `semFim`.
 */

export type Valor =
  | null | boolean | bigint | number | string
  | ListaDart | MapaDart | ConjuntoDart | IteravelDart | ObjetoDart | FuncaoDart | ValorDeEnum
  | EntradaDart | ErroDoNucleo | TipoDart;

export class ListaDart { constructor(public itens: Valor[], public elem: string) {} }
export class MapaDart {
  m = new Map<unknown, [Valor, Valor]>();
  constructor(public tipos: string) {}
}
export class ConjuntoDart {
  m = new Map<unknown, Valor>();
  constructor(public elem: string) {}
}
/* Preguiçoso como o do Dart: `map` e `where` só rodam quando alguém percorre. */
export class IteravelDart { constructor(public produzir: () => Valor[]) {} }
export class EntradaDart { constructor(public chave: Valor, public valor: Valor) {} }
export class ObjetoDart {
  campos = new Map<string, Valor>();
  constructor(public classe: ClasseRt) {}
}
export class ValorDeEnum { constructor(public enumeracao: string, public nome: string, public indice: number) {} }
export class TipoDart { constructor(public nome: string) {} }
export class ErroDoNucleo {
  constructor(public classe: string, public texto: string, public mensagem: Valor = null) {}
}
export class FuncaoDart {
  constructor(
    public params: Param[],
    public corpo: Corpo | ((args: Valor[], nomeados: Map<string, Valor>) => Valor),
    public amb: Amb | null,
    public eu: ObjetoDart | null,
    public classe: ClasseRt | null,
    public nome: string,
  ) {}
}

interface ClasseRt {
  nome: string;
  decl: DeclDeClasse;
  mae: ClasseRt | null;
  metodos: Map<string, DeclDeFuncao>;
  getters: Map<string, DeclDeFuncao>;
  setters: Map<string, DeclDeFuncao>;
  estaticos: Map<string, { v: Valor; iniciado: boolean; decl: { init?: Expr } }>;
}

interface Celula { v: Valor; final: boolean; late: boolean; iniciada: boolean }

class Amb {
  vars = new Map<string, Celula>();
  constructor(public pai: Amb | null) {}
  achar(nome: string): Celula | undefined {
    return this.vars.get(nome) ?? this.pai?.achar(nome);
  }
}

class Retorno { constructor(public v: Valor) {} }
class Pare {}
class Continue {}
export class Lancado { constructor(public v: Valor, public onde: string) {} }
class SemFim {}
class Transbordou {}

export interface ResultadoDaExecucao {
  saida: string;
  /** O que o `dart` escreveria no terminal ao parar com exceção. */
  erro: string | null;
  semFim: boolean;
}

export interface OpcoesDaExecucao {
  entrada?: string[];
  comoDouble: WeakSet<Expr>;
  /** Os `{}` que o analisador decidiu serem conjuntos, pelo tipo pedido. */
  conjuntosVazios: WeakSet<Expr>;
  importados: Set<string>;
  prefixos: Map<string, string>;
}

const LIMITE_DE_PASSOS = 4_000_000;
const LIMITE_DE_PILHA = 1200;
const MAX_SAIDA = 20000;

export function executarDart(
  arquivos: ArquivoDart[],
  opcoes: OpcoesDaExecucao,
): ResultadoDaExecucao {
  const ex = new Executor(arquivos, opcoes);
  return ex.rodar();
}

/* ── Números e textos como o Dart os escreve ───────────────────────────── */

const int64 = (x: bigint) => BigInt.asIntN(64, x);

/** O `double.toString()` do Dart: o do JavaScript, mais o `.0` dos inteiros. */
export function textoDoDouble(x: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (x === Infinity) return 'Infinity';
  if (x === -Infinity) return '-Infinity';
  if (Object.is(x, -0)) return '-0.0';
  const s = String(x);
  if (/[.eE]/.test(s)) {
    /* `1e21` no JavaScript é `1e+21`, igual ao Dart; `1.5e-7` também. */
    return s;
  }
  return `${s}.0`;
}

function ehInt(v: Valor): v is bigint { return typeof v === 'bigint'; }
function ehNum(v: Valor): v is bigint | number { return typeof v === 'bigint' || typeof v === 'number'; }
const comoNumber = (v: bigint | number) => (typeof v === 'bigint' ? Number(v) : v);

/* O arredondamento do Dart afasta do zero no meio: 2.5 vira 3 e -2.5 vira -3. */
function arredondar(x: number): bigint {
  if (!Number.isFinite(x)) throw new Lancado(new ErroDoNucleo('UnsupportedError', `Unsupported operation: ${textoDoDouble(x)}`), '');
  const r = x < 0 ? -Math.round(-x) : Math.round(x);
  return BigInt(r);
}

function paraInt(x: number): bigint {
  if (!Number.isFinite(x)) throw new Lancado(new ErroDoNucleo('UnsupportedError', `Unsupported operation: ${textoDoDouble(x)}`), '');
  return BigInt(Math.trunc(x));
}

/** Como a `Iterable.toString` do Dart encurta: no máximo uns 80 caracteres e cem elementos. */
function partesCurtas(textos: string[]): string[] {
  const limite = 80; const cabeca = 3; const cauda = 2; const maximo = 100; const extra = 2; const reticencias = 3;
  const partes: string[] = [];
  let tamanho = 0;
  let conta = 0;
  let i = 0;
  while (tamanho < limite || conta < cabeca) {
    if (i >= textos.length) return partes;
    const prox = textos[i++];
    partes.push(prox);
    tamanho += prox.length + extra;
    conta++;
  }
  let penultimo: string;
  let ultimo: string;
  if (i >= textos.length) {
    if (conta <= cabeca + cauda) return partes;
    ultimo = partes.pop()!;
    penultimo = partes.pop()!;
  } else {
    let pen = textos[i++];
    conta++;
    if (i >= textos.length) {
      if (conta <= cabeca + 1) { partes.push(pen); return partes; }
      ultimo = pen;
      penultimo = partes.pop()!;
      tamanho += ultimo.length + extra;
    } else {
      let ult = textos[i++];
      conta++;
      while (i < textos.length) {
        pen = ult;
        ult = textos[i++];
        conta++;
        if (conta > maximo) {
          while (tamanho > limite - reticencias - extra && conta > cabeca) {
            tamanho -= partes.pop()!.length + extra;
            conta--;
          }
          partes.push('...');
          return partes;
        }
      }
      penultimo = pen;
      ultimo = ult;
      tamanho += ultimo.length + penultimo.length + 2 * extra;
    }
  }
  let elisao: string | null = null;
  if (conta > partes.length + cauda) { elisao = '...'; tamanho += reticencias + extra; }
  while (tamanho > limite && partes.length > cabeca) {
    tamanho -= partes.pop()!.length + extra;
    if (elisao === null) { elisao = '...'; tamanho += reticencias + extra; }
  }
  if (elisao !== null) partes.push(elisao);
  partes.push(penultimo, ultimo);
  return partes;
}

function chave(v: Valor): unknown {
  if (typeof v === 'number' && Number.isInteger(v)) return BigInt(v);
  return v;
}

function formatException(mensagem: string, fonte: string | null, posicao: number | null): string {
  let r = 'FormatException';
  if (mensagem) r += `: ${mensagem}`;
  if (fonte === null) return r;
  if (posicao === null) return `${r}\n${fonte.length > 78 ? fonte.slice(0, 75) + '...' : fonte}`;
  r += ` (at character ${posicao + 1})\n`;
  return `${r}${fonte}\n${' '.repeat(posicao)}^\n`;
}

class Executor {
  private saida = '';
  private passos = 0;
  private pilha = 0;
  private global = new Amb(null);
  private classes = new Map<string, ClasseRt>();
  private enums = new Map<string, ValorDeEnum[]>();
  private funcoesGlobais = new Map<string, FuncaoDart>();
  private entrada: string[];
  private arquivoAtual = '';
  private fontes = new Map<string, string>();
  private ultimaPos = { arquivo: '', pos: 0, funcao: 'main' };

  constructor(private arquivos: ArquivoDart[], private opcoes: OpcoesDaExecucao) {
    this.entrada = [...(opcoes.entrada ?? [])];
  }

  private escrever(texto: string) {
    if (this.saida.length + texto.length > MAX_SAIDA) {
      this.saida += texto.slice(0, Math.max(0, MAX_SAIDA - this.saida.length));
      throw new Transbordou();
    }
    this.saida += texto;
  }

  private passo() {
    if (++this.passos > LIMITE_DE_PASSOS) throw new SemFim();
  }

  rodar(): ResultadoDaExecucao {
    try {
      for (const a of this.arquivos) {
        this.fontes.set(a.arquivo, a.fonte);
        for (const e of a.enums) this.enums.set(e.nome, e.valores.map((v, i) => new ValorDeEnum(e.nome, v.nome, i)));
        for (const c of a.classes) this.registrarClasse(c);
      }
      for (const a of this.arquivos) {
        for (const c of a.classes) {
          const rt = this.classes.get(c.nome)!;
          rt.mae = c.mae ? this.classes.get(c.mae.nome) ?? null : null;
        }
        for (const fn of a.funcoes) {
          this.funcoesGlobais.set(fn.nome, new FuncaoDart(fn.params, fn.corpo!, this.global, null, null, fn.nome));
        }
      }
      /* As variáveis de cima do arquivo são preguiçosas no Dart: o valor
         inicial só é calculado no primeiro uso. */
      for (const a of this.arquivos) {
        this.arquivoAtual = a.arquivo;
        for (const v of a.variaveis) {
          for (const d of v.decls) {
            const init = d.init;
            const arquivo = a.arquivo;
            const celula: Celula = { v: null, final: v.mod !== null && v.mod !== 'var', late: !!init, iniciada: !init };
            this.global.vars.set(d.nome, celula);
            if (init) this.preguicosas.set(celula, () => { this.arquivoAtual = arquivo; return this.exp(init, this.global, null); });
          }
        }
      }
      const principal = this.arquivos[0];
      this.arquivoAtual = principal.arquivo;
      const main = this.funcoesGlobais.get('main');
      if (!main) {
        return { saida: '', erro: `${principal.arquivo}: Error: Undefined name 'main'.`, semFim: false };
      }
      const args = main.params.length ? [new ListaDart([], 'String')] : [];
      this.chamar(main, args, new Map(), 0);
      return { saida: this.saida, erro: null, semFim: false };
    } catch (e) {
      if (e instanceof SemFim) return { saida: this.saida, erro: null, semFim: true };
      if (e instanceof Transbordou) {
        return { saida: this.saida, erro: '\n[a saída foi cortada aqui: o programa escreveu demais — quase sempre é um laço sem fim com um print dentro]', semFim: true };
      }
      if (e instanceof Lancado) return { saida: this.saida, erro: this.textoDoErro(e), semFim: false };
      if (e instanceof RangeError && /call stack/i.test(e.message)) {
        return { saida: this.saida, erro: 'Unhandled exception:\nStack Overflow', semFim: false };
      }
      throw e;
    }
  }

  private preguicosas = new WeakMap<Celula, () => Valor>();

  private textoDoErro(e: Lancado): string {
    const fonte = this.fontes.get(this.ultimaPos.arquivo) ?? '';
    const { linha, coluna } = linhaEColuna(fonte, this.ultimaPos.pos);
    return `Unhandled exception:\n${this.texto(e.v)}\n#0      ${this.ultimaPos.funcao} (${this.ultimaPos.arquivo}:${linha}:${coluna})`;
  }

  private registrarClasse(c: DeclDeClasse) {
    const rt: ClasseRt = { nome: c.nome, decl: c, mae: null, metodos: new Map(), getters: new Map(), setters: new Map(), estaticos: new Map() };
    for (const m of c.metodos) {
      if (m.estatico) continue;
      if (m.getter) rt.getters.set(m.nome, m);
      else if (m.setter) rt.setters.set(m.nome, m);
      else rt.metodos.set(m.nome, m);
    }
    for (const f of c.campos) if (f.estatico) rt.estaticos.set(f.nome, { v: null, iniciado: !f.init, decl: f });
    this.classes.set(c.nome, rt);
  }

  /* ── Texto de um valor: `print` e a interpolação ───────────────────────── */

  texto(v: Valor): string {
    if (v === null) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'bigint') return v.toString();
    if (typeof v === 'number') return textoDoDouble(v);
    if (typeof v === 'string') return v;
    if (v instanceof ListaDart) return `[${v.itens.map(x => this.texto(x)).join(', ')}]`;
    if (v instanceof MapaDart) return `{${[...v.m.values()].map(([k, x]) => `${this.texto(k)}: ${this.texto(x)}`).join(', ')}}`;
    if (v instanceof ConjuntoDart) return `{${[...v.m.values()].map(x => this.texto(x)).join(', ')}}`;
    if (v instanceof IteravelDart) return `(${partesCurtas(v.produzir().map(x => this.texto(x))).join(', ')})`;
    if (v instanceof EntradaDart) return `MapEntry(${this.texto(v.chave)}: ${this.texto(v.valor)})`;
    if (v instanceof ValorDeEnum) return `${v.enumeracao}.${v.nome}`;
    if (v instanceof TipoDart) return v.nome;
    if (v instanceof ErroDoNucleo) return v.texto;
    if (v instanceof FuncaoDart) return 'Closure';
    if (v instanceof ObjetoDart) {
      const m = this.acharMetodo(v.classe, 'toString');
      if (m) {
        const r = this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, v, m.classe, 'toString'), [], new Map(), 0);
        return typeof r === 'string' ? r : this.texto(r);
      }
      return `Instance of '${v.classe.nome}'`;
    }
    return String(v);
  }

  private nomeDoTipoDe(v: Valor): string {
    if (v === null) return 'Null';
    if (typeof v === 'boolean') return 'bool';
    if (typeof v === 'bigint') return 'int';
    if (typeof v === 'number') return 'double';
    if (typeof v === 'string') return 'String';
    if (v instanceof ListaDart) return `List<${v.elem}>`;
    if (v instanceof MapaDart) return `_Map<${v.tipos}>`;
    if (v instanceof ConjuntoDart) return `_Set<${v.elem}>`;
    if (v instanceof ObjetoDart) return v.classe.nome;
    if (v instanceof ValorDeEnum) return v.enumeracao;
    if (v instanceof ErroDoNucleo) return v.classe === 'Exception' ? '_Exception' : v.classe;
    if (v instanceof EntradaDart) return 'MapEntry';
    if (v instanceof IteravelDart) return 'Iterable';
    if (v instanceof TipoDart) return 'Type';
    return 'Function';
  }

  /** `valor is Tipo`, para o `is`, o `as` e o `on` do `catch`. */
  private eh(v: Valor, t: TipoEscrito): boolean {
    const nome = t.nome;
    if (v === null) return t.anulavel || nome === 'Null' || nome === 'dynamic' || nome === 'Object?';
    switch (nome) {
      case 'dynamic': case 'Object': return true;
      case 'int': return ehInt(v);
      case 'double': return typeof v === 'number';
      case 'num': return ehNum(v);
      case 'String': return typeof v === 'string';
      case 'bool': return typeof v === 'boolean';
      case 'List': return v instanceof ListaDart;
      case 'Map': return v instanceof MapaDart;
      case 'Set': return v instanceof ConjuntoDart;
      case 'Iterable': return v instanceof ListaDart || v instanceof ConjuntoDart || v instanceof IteravelDart;
      case 'Function': return v instanceof FuncaoDart;
      case 'Exception': return v instanceof ErroDoNucleo && (v.classe === 'Exception' || v.classe === 'FormatException');
      case 'Error': return v instanceof ErroDoNucleo && !['Exception', 'FormatException'].includes(v.classe);
      case 'Enum': return v instanceof ValorDeEnum;
      default:
        if (v instanceof ErroDoNucleo) {
          if (v.classe === nome) return true;
          if (nome === 'ArgumentError' && v.classe === 'RangeError') return true;
          return false;
        }
        if (v instanceof ValorDeEnum) return v.enumeracao === nome;
        if (v instanceof ObjetoDart) {
          let c: ClasseRt | null = v.classe;
          while (c) { if (c.nome === nome) return true; c = c.mae; }
        }
        return false;
    }
  }

  private igual(a: Valor, b: Valor): boolean {
    if (ehNum(a) && ehNum(b)) {
      if (ehInt(a) && ehInt(b)) return a === b;
      return comoNumber(a) === comoNumber(b);
    }
    if (a instanceof ObjetoDart) {
      const m = this.acharMetodo(a.classe, '==');
      if (m) return this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, a, m.classe, '=='), [b], new Map(), 0) === true;
    }
    return a === b;
  }

  /* ── Lançar os erros do núcleo ─────────────────────────────────────────── */

  private lancar(classe: string, texto: string, mensagem: Valor = null): never {
    throw new Lancado(new ErroDoNucleo(classe, texto, mensagem), '');
  }

  private faixa(i: bigint, tamanho: number): never {
    if (tamanho === 0) this.lancar('RangeError', `RangeError (index): Invalid value: Valid value range is empty: ${i}`);
    this.lancar('RangeError', `RangeError (index): Invalid value: Not in inclusive range 0..${tamanho - 1}: ${i}`);
  }

  private semElemento(): never { this.lancar('StateError', 'Bad state: No element', 'No element'); }

  private nulo(oQue: string, nome: string): never {
    this.lancar('NoSuchMethodError', `NoSuchMethodError: The ${oQue} '${nome}' was called on null.\nReceiver: null\nTried calling: ${nome}`);
  }

  /* ── Chamar ────────────────────────────────────────────────────────────── */

  chamar(f: FuncaoDart, args: Valor[], nomeados: Map<string, Valor>, pos: number): Valor {
    this.passo();
    if (typeof f.corpo === 'function') return f.corpo(args, nomeados);
    if (++this.pilha > LIMITE_DE_PILHA) {
      this.pilha = 0;
      throw new Lancado(new ErroDoNucleo('StackOverflowError', 'Stack Overflow'), '');
    }
    const antes = this.ultimaPos.funcao;
    try {
      const amb = new Amb(f.amb);
      this.ligarParams(f.params, args, nomeados, amb, f.eu);
      this.ultimaPos.funcao = f.classe ? `${f.classe.nome}.${f.nome}` : f.nome;
      const corpo = f.corpo;
      if (corpo.k === 'seta') return this.exp(corpo.e, amb, f.eu, f.classe);
      try {
        for (const i of corpo.corpo) this.instr(i, amb, f.eu, f.classe);
      } catch (e) {
        if (e instanceof Retorno) return e.v;
        throw e;
      }
      return null;
    } finally {
      this.pilha--;
      this.ultimaPos.funcao = antes;
      void pos;
    }
  }

  private ligarParams(params: Param[], args: Valor[], nomeados: Map<string, Valor>, amb: Amb, eu: ObjetoDart | null) {
    let k = 0;
    for (const p of params) {
      let v: Valor;
      if (p.modo === 'nomeado') {
        v = nomeados.has(p.nome) ? nomeados.get(p.nome)! : p.padrao ? this.exp(p.padrao, amb, eu) : null;
      } else {
        v = k < args.length ? args[k] : p.padrao ? this.exp(p.padrao, amb, eu) : null;
        k++;
      }
      if (p.campo && eu) eu.campos.set(p.nome, v);
      amb.vars.set(p.nome, { v, final: p.final || p.campo, late: false, iniciada: true });
    }
  }

  private acharMetodo(c: ClasseRt, nome: string): { metodo: DeclDeFuncao; classe: ClasseRt } | null {
    let x: ClasseRt | null = c;
    while (x) {
      const m = x.metodos.get(nome);
      if (m && m.corpo) return { metodo: m, classe: x };
      if (m && !m.corpo) { x = x.mae; continue; }
      x = x.mae;
    }
    return null;
  }

  private acharGetter(c: ClasseRt, nome: string): { metodo: DeclDeFuncao; classe: ClasseRt } | null {
    let x: ClasseRt | null = c;
    while (x) {
      const m = x.getters.get(nome);
      if (m && m.corpo) return { metodo: m, classe: x };
      x = x.mae;
    }
    return null;
  }

  private acharSetter(c: ClasseRt, nome: string): { metodo: DeclDeFuncao; classe: ClasseRt } | null {
    let x: ClasseRt | null = c;
    while (x) {
      const m = x.setters.get(nome);
      if (m && m.corpo) return { metodo: m, classe: x };
      x = x.mae;
    }
    return null;
  }

  /* ── Construir um objeto ───────────────────────────────────────────────── */

  private instanciar(c: ClasseRt, nomeDoConstrutor: string | null, args: Valor[], nomeados: Map<string, Valor>): ObjetoDart {
    const obj = new ObjetoDart(c);
    this.construir(obj, c, nomeDoConstrutor, args, nomeados);
    return obj;
  }

  private construir(obj: ObjetoDart, c: ClasseRt, nomeDoConstrutor: string | null, args: Valor[], nomeados: Map<string, Valor>) {
    this.passo();
    /* 1. Os campos com valor inicial, e os anuláveis sem valor, que começam nulos. */
    for (const f of c.decl.campos) {
      if (f.estatico) continue;
      if (f.init) obj.campos.set(f.nome, this.exp(f.init, this.global, obj, c));
      else if (!f.late) obj.campos.set(f.nome, null);
    }
    const k = c.decl.construtores.find(x => x.nome === nomeDoConstrutor) as DeclDeConstrutor | undefined;
    const amb = new Amb(this.global);
    if (!k) {
      if (c.mae) this.construir(obj, c.mae, null, [], new Map());
      return;
    }
    /* 2. Os parâmetros, com `this.x` gravando no campo. */
    this.ligarParams(k.params, args, nomeados, amb, obj);
    /* 3. A lista de inicialização, e a mãe. */
    let chamouMae = false;
    for (const ini of k.inicializadores) {
      if (ini.k === 'campo') obj.campos.set(ini.nome, this.exp(ini.e, amb, null, c));
      else if (ini.k === 'super' && c.mae) {
        const [a, n] = this.avaliarArgs(ini.args, amb, null, c);
        this.construir(obj, c.mae, ini.nome, a, n);
        chamouMae = true;
      } else if (ini.k === 'redireciona') {
        const [a, n] = this.avaliarArgs(ini.args, amb, null, c);
        this.construir(obj, c, ini.nome, a, n);
        return;
      } else if (ini.k === 'afirme') this.exp(ini.e, amb, null, c);
    }
    if (!chamouMae && c.mae) {
      const daMae = k.params.filter(p => p.daMae);
      const pos = daMae.filter(p => p.modo !== 'nomeado').map(p => amb.achar(p.nome)!.v);
      const nom = new Map(daMae.filter(p => p.modo === 'nomeado').map(p => [p.nome, amb.achar(p.nome)!.v] as [string, Valor]));
      this.construir(obj, c.mae, null, pos, nom);
    }
    /* 4. O corpo, depois do da mãe. */
    if (k.corpo) {
      if (k.corpo.k === 'seta') this.exp(k.corpo.e, amb, obj, c);
      else {
        try {
          for (const i of k.corpo.corpo) this.instr(i, amb, obj, c);
        } catch (e) {
          if (!(e instanceof Retorno)) throw e;
        }
      }
    }
  }

  private avaliarArgs(args: Arg[], amb: Amb, eu: ObjetoDart | null, classe?: ClasseRt | null): [Valor[], Map<string, Valor>] {
    const pos: Valor[] = [];
    const nom = new Map<string, Valor>();
    for (const a of args) {
      const v = this.exp(a.e, amb, eu, classe);
      if (a.nome) nom.set(a.nome, v); else pos.push(v);
    }
    return [pos, nom];
  }

  /* ── Instruções ────────────────────────────────────────────────────────── */

  private instr(i: Instr, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null = null): void {
    this.passo();
    switch (i.k) {
      case 'bloco': {
        const a = new Amb(amb);
        for (const x of i.corpo) this.instr(x, a, eu, classe);
        return;
      }
      case 'var':
        for (const d of i.decls) {
          const v = d.init ? this.exp(d.init, amb, eu, classe) : null;
          amb.vars.set(d.nome, { v, final: i.mod === 'final' || i.mod === 'const', late: i.late, iniciada: !!d.init || !i.late });
        }
        return;
      case 'expr': this.exp(i.e, amb, eu, classe); return;
      case 'se':
        if (this.exp(i.c, amb, eu, classe) === true) this.instr(i.entao, new Amb(amb), eu, classe);
        else if (i.senao) this.instr(i.senao, new Amb(amb), eu, classe);
        return;
      case 'enquanto':
        while (this.exp(i.c, amb, eu, classe) === true) {
          try { this.instr(i.corpo, new Amb(amb), eu, classe); } catch (e) {
            if (e instanceof Pare) break;
            if (e instanceof Continue) continue;
            throw e;
          }
        }
        return;
      case 'faca':
        do {
          try { this.instr(i.corpo, new Amb(amb), eu, classe); } catch (e) {
            if (e instanceof Pare) break;
            if (e instanceof Continue) continue;
            throw e;
          }
        } while (this.exp(i.c, amb, eu, classe) === true);
        return;
      case 'para': {
        const a = new Amb(amb);
        if (i.init) this.instr(i.init, a, eu, classe);
        /* No Dart cada volta do `for` tem a sua variável: a função anônima
           criada na volta 2 lembra o `i` da volta 2, como o `let` do JS. */
        for (;;) {
          if (i.cond && this.exp(i.cond, a, eu, classe) !== true) break;
          const volta = new Amb(a.pai);
          for (const [n, c] of a.vars) volta.vars.set(n, { ...c });
          try { this.instr(i.corpo, new Amb(volta), eu, classe); } catch (e) {
            if (e instanceof Pare) { this.copiarVoltas(volta, a); break; }
            if (!(e instanceof Continue)) throw e;
          }
          this.copiarVoltas(volta, a);
          for (const p of i.passos) this.exp(p, a, eu, classe);
        }
        return;
      }
      case 'paraEm': {
        const fonte = this.exp(i.iteravel, amb, eu, classe);
        const itens = this.itensDe(fonte, 'iterator');
        for (const v of itens) {
          const a = new Amb(amb);
          a.vars.set(i.nome, { v, final: i.mod === 'final', late: false, iniciada: true });
          try { this.instr(i.corpo, a, eu, classe); } catch (e) {
            if (e instanceof Pare) break;
            if (e instanceof Continue) continue;
            throw e;
          }
        }
        return;
      }
      case 'pare': throw new Pare();
      case 'continue': throw new Continue();
      case 'retorne': throw new Retorno(i.e ? this.exp(i.e, amb, eu, classe) : null);
      case 'relance': throw this.relancando ?? new Lancado(null, '');
      case 'tente': this.tente(i, amb, eu, classe); return;
      case 'escolha': {
        const v = this.exp(i.e, amb, eu, classe);
        let casou = false;
        try {
          for (const caso of i.casos) {
            if (!casou) casou = !caso.valores.length || caso.valores.some(x => this.igual(this.exp(x, amb, eu, classe), v));
            if (casou && caso.corpo.length) {
              const a = new Amb(amb);
              for (const x of caso.corpo) this.instr(x, a, eu, classe);
              break;
            }
          }
        } catch (e) {
          if (!(e instanceof Pare)) throw e;
        }
        return;
      }
      case 'funcaoLocal': {
        const fn = i.decl;
        const celula: Celula = { v: null, final: true, late: false, iniciada: true };
        amb.vars.set(fn.nome, celula);
        celula.v = new FuncaoDart(fn.params, fn.corpo!, amb, eu, classe, fn.nome);
        return;
      }
      case 'vazia': return;
    }
  }

  private copiarVoltas(de: Amb, para: Amb) {
    for (const [n, c] of de.vars) {
      const alvo = para.vars.get(n);
      if (alvo) alvo.v = c.v;
    }
  }

  private relancando: Lancado | null = null;

  private tente(i: Extract<Instr, { k: 'tente' }>, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null) {
    try {
      this.instr(i.corpo, amb, eu, classe);
    } catch (e) {
      if (!(e instanceof Lancado)) {
        if (i.finalmente) this.instr(i.finalmente, amb, eu, classe);
        throw e;
      }
      const captura = i.capturas.find(c => !c.tipo || this.eh(e.v, c.tipo));
      if (!captura) {
        if (i.finalmente) this.instr(i.finalmente, amb, eu, classe);
        throw e;
      }
      const a = new Amb(amb);
      if (captura.erro) a.vars.set(captura.erro, { v: e.v, final: true, late: false, iniciada: true });
      if (captura.pilha) a.vars.set(captura.pilha, { v: new TipoDart(''), final: true, late: false, iniciada: true });
      const antes = this.relancando;
      this.relancando = e;
      try {
        this.instr(captura.corpo, a, eu, classe);
      } finally {
        this.relancando = antes;
        if (i.finalmente) this.instr(i.finalmente, amb, eu, classe);
      }
      return;
    }
    if (i.finalmente) this.instr(i.finalmente, amb, eu, classe);
  }

  /* ── Expressões ────────────────────────────────────────────────────────── */

  private marcar(e: Expr) {
    this.ultimaPos = { ...this.ultimaPos, arquivo: this.arquivoAtual, pos: e.ini };
  }

  private exp(e: Expr, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null = null): Valor {
    this.passo();
    switch (e.k) {
      case 'int': return this.opcoes.comoDouble.has(e) ? Number(e.v) : int64(e.v);
      case 'double': return e.v;
      case 'bool': return e.v;
      case 'null': return null;
      case 'texto': {
        let s = '';
        for (const p of e.partes) s += typeof p === 'string' ? p : this.texto(this.exp(p, amb, eu, classe));
        return s;
      }
      case 'lista': {
        const itens: Valor[] = [];
        for (const it of e.itens) this.itemDeLista(it, itens, amb, eu, classe);
        return new ListaDart(itens, e.tipo ? this.nomeEscrito(e.tipo) : this.elementoInferido(itens));
      }
      case 'chaves': return this.chaves(e, amb, eu, classe);
      case 'this': return eu;
      case 'super': return eu;
      case 'alvoDaCascata': return this.cascatas[this.cascatas.length - 1];
      case 'nome': return this.ler(e.nome, amb, eu, classe, e);
      case 'membro': return this.membro(e, amb, eu, classe);
      case 'chamada': return this.chamada(e, amb, eu, classe);
      case 'indice': {
        const alvo = this.exp(e.alvo, amb, eu, classe);
        const i = this.exp(e.indice, amb, eu, classe);
        this.marcar(e);
        return this.indexar(alvo, i);
      }
      case 'unario': {
        const v = this.exp(e.e, amb, eu, classe);
        if (e.op === '!') return !v;
        if (e.op === '-') {
          if (ehInt(v)) return int64(-v);
          if (typeof v === 'number') return -v;
          if (v === null) this.nulo('method', 'unary-');
        }
        if (e.op === '~' && ehInt(v)) return int64(~v);
        return null;
      }
      case 'prefixo': case 'posfixo': {
        if (e.op === '!') {
          const v = this.exp(e.e, amb, eu, classe);
          if (v === null) {
            this.marcar(e);
            this.lancar('TypeError', 'Null check operator used on a null value');
          }
          return v;
        }
        const antes = this.exp(e.e, amb, eu, classe);
        const um: Valor = ehInt(antes) ? 1n : 1;
        const depois = this.aritmetica(e.op === '++' ? '+' : '-', antes, um, e);
        this.atribuir(e.e, depois, amb, eu, classe);
        return e.k === 'prefixo' ? depois : antes;
      }
      case 'binario': {
        const a = this.exp(e.a, amb, eu, classe);
        const b = this.exp(e.b, amb, eu, classe);
        return this.binario(e.op, a, b, e);
      }
      case 'logico': {
        const a = this.exp(e.a, amb, eu, classe);
        if (e.op === '&&') return a === true ? this.exp(e.b, amb, eu, classe) === true : false;
        if (e.op === '||') return a === true ? true : this.exp(e.b, amb, eu, classe) === true;
        return a !== null ? a : this.exp(e.b, amb, eu, classe);
      }
      case 'condicional':
        return this.exp(e.c, amb, eu, classe) === true ? this.exp(e.s, amb, eu, classe) : this.exp(e.n, amb, eu, classe);
      case 'atribuicao': {
        if (e.op === '=') {
          const v = this.exp(e.valor, amb, eu, classe);
          this.atribuir(e.alvo, v, amb, eu, classe);
          return v;
        }
        if (e.op === '??=') {
          const atual = this.exp(e.alvo, amb, eu, classe);
          if (atual !== null) return atual;
          const v = this.exp(e.valor, amb, eu, classe);
          this.atribuir(e.alvo, v, amb, eu, classe);
          return v;
        }
        const atual = this.exp(e.alvo, amb, eu, classe);
        const b = this.exp(e.valor, amb, eu, classe);
        const v = this.binario(e.op.slice(0, -1), atual, b, e);
        this.atribuir(e.alvo, v, amb, eu, classe);
        return v;
      }
      case 'eh': {
        const v = this.exp(e.e, amb, eu, classe);
        const r = this.eh(v, e.tipo);
        return e.negado ? !r : r;
      }
      case 'como': {
        const v = this.exp(e.e, amb, eu, classe);
        if (!this.eh(v, e.tipo)) {
          this.marcar(e);
          this.lancar('TypeError', `type '${this.nomeDoTipoDe(v)}' is not a subtype of type '${this.nomeEscrito(e.tipo)}' in type cast`);
        }
        return v;
      }
      case 'funcao': return new FuncaoDart(e.params, e.corpo, amb, eu, classe, '<anônima>');
      case 'cascata': {
        const alvo = this.exp(e.alvo, amb, eu, classe);
        this.cascatas.push(alvo);
        try {
          for (const s of e.secoes) this.exp(s, amb, eu, classe);
        } finally { this.cascatas.pop(); }
        return alvo;
      }
      case 'lance': {
        const v = this.exp(e.e, amb, eu, classe);
        this.marcar(e);
        throw new Lancado(v, '');
      }
    }
  }

  private cascatas: Valor[] = [];

  private nomeEscrito(t: TipoEscrito): string {
    const base = t.args.length ? `${t.nome}<${t.args.map(a => this.nomeEscrito(a)).join(', ')}>` : t.nome;
    return t.anulavel ? `${base}?` : base;
  }

  /* O tipo dos elementos de uma lista sem tipo escrito, para o `runtimeType`. */
  private elementoInferido(itens: Valor[]): string {
    if (!itens.length) return 'dynamic';
    const nomes = new Set(itens.map(v => this.nomeDoTipoDe(v)));
    if (nomes.size === 1) return [...nomes][0];
    if ([...nomes].every(n => n === 'int' || n === 'double')) return 'num';
    if ([...nomes].every(n => n !== 'Null')) return 'Object';
    const semNulo = [...nomes].filter(n => n !== 'Null');
    return semNulo.length === 1 ? `${semNulo[0]}?` : 'Object?';
  }

  private itemDeLista(it: Item, itens: Valor[], amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null) {
    switch (it.k) {
      case 'item': itens.push(this.exp(it.e, amb, eu, classe)); return;
      case 'espalhar': {
        const v = this.exp(it.e, amb, eu, classe);
        if (v === null && it.opcional) return;
        itens.push(...this.itensDe(v, 'iterator'));
        return;
      }
      case 'se':
        if (this.exp(it.c, amb, eu, classe) === true) this.itemDeLista(it.entao, itens, amb, eu, classe);
        else if (it.senao) this.itemDeLista(it.senao, itens, amb, eu, classe);
        return;
      case 'para':
        for (const v of this.itensDe(this.exp(it.iteravel, amb, eu, classe), 'iterator')) {
          const a = new Amb(amb);
          a.vars.set(it.nome, { v, final: false, late: false, iniciada: true });
          this.itemDeLista(it.corpo, itens, a, eu, classe);
        }
        return;
      case 'par': return;
    }
  }

  private chaves(e: Extract<Expr, { k: 'chaves' }>, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null): Valor {
    const temPar = (i: Item): boolean => i.k === 'par' || (i.k === 'se' && temPar(i.entao)) || (i.k === 'para' && temPar(i.corpo));
    let ehMapa: boolean;
    if (e.tipos) ehMapa = e.tipos.length === 2;
    else if (e.itens.length) ehMapa = e.itens.some(temPar);
    else ehMapa = !this.opcoes.conjuntosVazios.has(e);
    if (e.itens.length && !e.itens.some(temPar) && e.itens.every(i => i.k === 'espalhar')) {
      const primeiro = this.exp((e.itens[0] as Extract<Item, { k: 'espalhar' }>).e, amb, eu, classe);
      ehMapa = primeiro instanceof MapaDart;
    }
    if (ehMapa) {
      const m = new MapaDart(e.tipos ? e.tipos.map(t => this.nomeEscrito(t)).join(', ') : 'dynamic, dynamic');
      const pares = (i: Item, a: Amb) => {
        if (i.k === 'par') {
          const k = this.exp(i.chave, a, eu, classe);
          m.m.set(chave(k), [k, this.exp(i.valor, a, eu, classe)]);
        } else if (i.k === 'espalhar') {
          const v = this.exp(i.e, a, eu, classe);
          if (v instanceof MapaDart) for (const [ch, par] of v.m) m.m.set(ch, par);
        } else if (i.k === 'se') {
          if (this.exp(i.c, a, eu, classe) === true) pares(i.entao, a);
          else if (i.senao) pares(i.senao, a);
        } else if (i.k === 'para') {
          for (const v of this.itensDe(this.exp(i.iteravel, a, eu, classe), 'iterator')) {
            const b = new Amb(a);
            b.vars.set(i.nome, { v, final: false, late: false, iniciada: true });
            pares(i.corpo, b);
          }
        }
      };
      for (const i of e.itens) pares(i, amb);
      if (!e.tipos && m.m.size) {
        const ks = new Set([...m.m.values()].map(([k]) => this.nomeDoTipoDe(k)));
        const vs = new Set([...m.m.values()].map(([, v]) => this.nomeDoTipoDe(v)));
        m.tipos = `${ks.size === 1 ? [...ks][0] : 'Object'}, ${vs.size === 1 ? [...vs][0] : 'Object'}`;
      }
      return m;
    }
    const itens: Valor[] = [];
    for (const it of e.itens) this.itemDeLista(it, itens, amb, eu, classe);
    const c = new ConjuntoDart(e.tipos ? this.nomeEscrito(e.tipos[0]) : this.elementoInferido(itens));
    for (const v of itens) if (!c.m.has(chave(v))) c.m.set(chave(v), v);
    return c;
  }

  private ler(nome: string, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null, e: Expr): Valor {
    const c = amb.achar(nome);
    if (c) {
      if (!c.iniciada) {
        const preguicosa = this.preguicosas.get(c);
        if (preguicosa) {
          c.v = preguicosa();
          c.iniciada = true;
          return c.v;
        }
        this.marcar(e);
        this.lancar('LateInitializationError', `LateInitializationError: Local '${nome}' has not been initialized.`);
      }
      return c.v;
    }
    if (eu) {
      const r = this.lerMembro(eu, nome, e, true);
      if (r.achou) return r.v;
    }
    if (classe) {
      const est = this.estatico(classe, nome);
      if (est) return est.v;
    }
    const fn = this.funcoesGlobais.get(nome);
    if (fn) return fn;
    if (nome === 'pi') return Math.PI;
    if (nome === 'e' && this.opcoes.importados.has('dart:math')) return Math.E;
    if (['max', 'min', 'sqrt', 'pow'].includes(nome) && this.opcoes.importados.has('dart:math')) {
      return new FuncaoDart([], (a, n) => this.embutida(nome, a, n, e), null, null, null, nome);
    }
    if (this.classes.has(nome)) return new TipoDart(nome);
    if (['int', 'double', 'String', 'bool', 'num', 'Object'].includes(nome)) return new TipoDart(nome);
    if (nome === 'stdin' || nome === 'stdout') return new TipoDart(nome);
    return null;
  }

  private estatico(c: ClasseRt, nome: string): { v: Valor } | null {
    const s = c.estaticos.get(nome);
    if (s) {
      if (!s.iniciado) {
        s.iniciado = true;
        s.v = s.decl.init ? this.exp(s.decl.init, this.global, null, c) : null;
      }
      return { v: s.v };
    }
    const m = c.decl.metodos.find(x => x.estatico && x.nome === nome && !x.getter && !x.setter);
    if (m) return { v: new FuncaoDart(m.params, m.corpo!, this.global, null, c, m.nome) };
    const g = c.decl.metodos.find(x => x.estatico && x.nome === nome && x.getter);
    if (g) return { v: this.chamar(new FuncaoDart([], g.corpo!, this.global, null, c, g.nome), [], new Map(), 0) };
    return null;
  }

  private lerMembro(obj: ObjetoDart, nome: string, e: Expr, deThis = false): { achou: boolean; v: Valor } {
    const g = this.acharGetter(obj.classe, nome);
    if (g) return { achou: true, v: this.chamar(new FuncaoDart([], g.metodo.corpo!, this.global, obj, g.classe, nome), [], new Map(), e.ini) };
    if (obj.campos.has(nome)) return { achou: true, v: obj.campos.get(nome)! };
    if (this.campoLateDe(obj.classe, nome)) {
      this.marcar(e);
      this.lancar('LateInitializationError', `LateInitializationError: Field '${nome}' has not been initialized.`);
    }
    const m = this.acharMetodo(obj.classe, nome);
    if (m) return { achou: true, v: new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, obj, m.classe, nome) };
    if (!deThis) {
      if (nome === 'runtimeType') return { achou: true, v: new TipoDart(obj.classe.nome) };
      if (nome === 'hashCode') return { achou: true, v: 0n };
    }
    return { achou: false, v: null };
  }

  private campoLateDe(c: ClasseRt, nome: string): boolean {
    let x: ClasseRt | null = c;
    while (x) {
      if (x.decl.campos.some(f => f.nome === nome && f.late && !f.estatico)) return true;
      x = x.mae;
    }
    return false;
  }

  private membro(e: Extract<Expr, { k: 'membro' }>, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null): Valor {
    if (e.alvo.k === 'nome' && !amb.achar(e.alvo.nome) && this.opcoes.prefixos.has(e.alvo.nome)) {
      if (e.nome === 'pi') return Math.PI;
      if (e.nome === 'e') return Math.E;
      return new TipoDart(e.nome);
    }
    if (e.alvo.k === 'nome' && !amb.achar(e.alvo.nome) && !(eu && this.temMembro(eu.classe, e.alvo.nome))) {
      const vs = this.enums.get(e.alvo.nome);
      if (vs) {
        if (e.nome === 'values') return new ListaDart([...vs], e.alvo.nome);
        const achado = vs.find(v => v.nome === e.nome);
        if (achado) return achado;
      }
      const c = this.classes.get(e.alvo.nome);
      if (c) {
        const s = this.estatico(c, e.nome);
        if (s) return s.v;
      }
    }
    if (e.alvo.k === 'super' && eu && classe?.mae) {
      const g = this.acharGetter(classe.mae, e.nome);
      if (g) return this.chamar(new FuncaoDart([], g.metodo.corpo!, this.global, eu, g.classe, e.nome), [], new Map(), e.ini);
      const m = this.acharMetodo(classe.mae, e.nome);
      if (m) return new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, eu, m.classe, e.nome);
      return eu.campos.get(e.nome) ?? null;
    }
    const alvo = this.exp(e.alvo, amb, eu, classe);
    if (alvo === null && e.opcional) return null;
    this.marcar(e);
    return this.propriedade(alvo, e.nome, e);
  }

  private temMembro(c: ClasseRt, nome: string): boolean {
    let x: ClasseRt | null = c;
    while (x) {
      if (x.decl.campos.some(f => f.nome === nome) || x.decl.metodos.some(m => m.nome === nome)) return true;
      x = x.mae;
    }
    return false;
  }

  /* As propriedades — getters, sem parênteses — dos valores. */
  private propriedade(v: Valor, nome: string, e: Expr): Valor {
    if (nome === 'runtimeType') return new TipoDart(this.nomeDoTipoDe(v));
    if (nome === 'hashCode') return 0n;
    if (v === null) this.nulo('getter', nome);
    if (v instanceof ObjetoDart) {
      const r = this.lerMembro(v, nome, e);
      if (r.achou) return r.v;
      this.nulo('getter', nome);
    }
    if (typeof v === 'string') {
      if (nome === 'length') return BigInt(v.length);
      if (nome === 'isEmpty') return v.length === 0;
      if (nome === 'isNotEmpty') return v.length > 0;
    }
    if (ehNum(v)) {
      if (nome === 'isEven' && ehInt(v)) return v % 2n === 0n;
      if (nome === 'isOdd' && ehInt(v)) return v % 2n !== 0n;
      if (nome === 'isNegative') return comoNumber(v) < 0 || Object.is(v, -0);
      if (nome === 'isNaN') return Number.isNaN(comoNumber(v));
      if (nome === 'isFinite') return Number.isFinite(comoNumber(v));
      if (nome === 'isInfinite') return !Number.isFinite(comoNumber(v)) && !Number.isNaN(comoNumber(v));
      if (nome === 'sign') return ehInt(v) ? (v > 0n ? 1n : v < 0n ? -1n : 0n) : Math.sign(v);
    }
    if (v instanceof ValorDeEnum) {
      if (nome === 'name') return v.nome;
      if (nome === 'index') return BigInt(v.indice);
    }
    if (v instanceof EntradaDart) {
      if (nome === 'key') return v.chave;
      if (nome === 'value') return v.valor;
    }
    if (v instanceof ErroDoNucleo && nome === 'message') return v.mensagem;
    if (v instanceof MapaDart) {
      if (nome === 'length') return BigInt(v.m.size);
      if (nome === 'isEmpty') return v.m.size === 0;
      if (nome === 'isNotEmpty') return v.m.size > 0;
      if (nome === 'keys') return new IteravelDart(() => [...v.m.values()].map(([k]) => k));
      if (nome === 'values') return new IteravelDart(() => [...v.m.values()].map(([, x]) => x));
      if (nome === 'entries') return new IteravelDart(() => [...v.m.values()].map(([k, x]) => new EntradaDart(k, x)));
    }
    if (v instanceof ListaDart && nome === 'reversed') return new IteravelDart(() => [...v.itens].reverse());
    if (v instanceof ListaDart || v instanceof ConjuntoDart || v instanceof IteravelDart) {
      const itens = this.itensDe(v, nome);
      if (nome === 'length') return BigInt(itens.length);
      if (nome === 'isEmpty') return itens.length === 0;
      if (nome === 'isNotEmpty') return itens.length > 0;
      if (nome === 'first') return itens.length ? itens[0] : this.semElemento();
      if (nome === 'last') return itens.length ? itens[itens.length - 1] : this.semElemento();
      if (nome === 'single') {
        if (itens.length === 1) return itens[0];
        if (!itens.length) this.semElemento();
        this.lancar('StateError', 'Bad state: Too many elements', 'Too many elements');
      }
    }
    if (v instanceof FuncaoDart) return this.metodoComoValor(v, nome, e);
    return this.metodoComoValor(v, nome, e);
  }

  /* `lista.add` sem parênteses: o método solto, para passar adiante. */
  private metodoComoValor(v: Valor, nome: string, e: Expr): Valor {
    return new FuncaoDart([], (args, nom) => this.metodo(v, nome, args, nom, e), null, null, null, nome);
  }

  private chamada(e: Extract<Expr, { k: 'chamada' }>, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null): Valor {
    const alvo = e.alvo;
    if (alvo.k === 'nome') {
      const c = amb.achar(alvo.nome);
      if (!c) {
        if (eu) {
          const m = this.acharMetodo(eu.classe, alvo.nome);
          if (m) {
            const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
            return this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, eu, m.classe, alvo.nome), a, n, e.ini);
          }
        }
        if (classe) {
          const s = classe.decl.metodos.find(x => x.estatico && x.nome === alvo.nome && !x.getter);
          if (s) {
            const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
            return this.chamar(new FuncaoDart(s.params, s.corpo!, this.global, null, classe, s.nome), a, n, e.ini);
          }
        }
        const fn = this.funcoesGlobais.get(alvo.nome);
        if (fn) {
          const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
          return this.chamar(fn, a, n, e.ini);
        }
        const cl = this.classes.get(alvo.nome);
        if (cl) {
          const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
          return this.instanciar(cl, null, a, n);
        }
        const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
        this.marcar(e);
        return this.embutida(alvo.nome, a, n, e);
      }
    }
    if (alvo.k === 'membro') {
      if (alvo.alvo.k === 'nome' && !amb.achar(alvo.alvo.nome) && this.opcoes.prefixos.has(alvo.alvo.nome)) {
        const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
        this.marcar(e);
        return this.embutida(alvo.nome, a, n, e);
      }
      if (alvo.alvo.k === 'nome' && !amb.achar(alvo.alvo.nome) && !(eu && this.temMembro(eu.classe, alvo.alvo.nome))) {
        const nomeDaClasse = alvo.alvo.nome;
        const cl = this.classes.get(nomeDaClasse);
        if (cl) {
          const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
          if (cl.decl.construtores.some(k => k.nome === alvo.nome)) return this.instanciar(cl, alvo.nome, a, n);
          const s = cl.decl.metodos.find(x => x.estatico && x.nome === alvo.nome);
          if (s) return this.chamar(new FuncaoDart(s.params, s.corpo!, this.global, null, cl, s.nome), a, n, e.ini);
        }
        if (['int', 'double', 'num', 'List', 'String'].includes(nomeDaClasse) && !this.classes.has(nomeDaClasse)) {
          const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
          this.marcar(e);
          return this.estaticoDoNucleo(nomeDaClasse, alvo.nome, a, n, e);
        }
      }
      if (alvo.alvo.k === 'super' && eu && classe?.mae) {
        const m = this.acharMetodo(classe.mae, alvo.nome);
        const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
        if (m) return this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, eu, m.classe, alvo.nome), a, n, e.ini);
        if (alvo.nome === 'toString') return `Instance of '${eu.classe.nome}'`;
        return null;
      }
      const recebedor = this.exp(alvo.alvo, amb, eu, classe);
      if (recebedor === null && alvo.opcional) return null;
      const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
      this.marcar(alvo);
      return this.metodo(recebedor, alvo.nome, a, n, alvo);
    }
    const f = this.exp(alvo, amb, eu, classe);
    const [a, n] = this.avaliarArgs(e.args, amb, eu, classe);
    if (f instanceof FuncaoDart) return this.chamar(f, a, n, e.ini);
    this.marcar(e);
    if (f === null) this.nulo('method', 'call');
    return null;
  }

  private chamarValor(f: Valor, args: Valor[]): Valor {
    if (f instanceof FuncaoDart) return this.chamar(f, args, new Map(), 0);
    return null;
  }

  private embutida(nome: string, a: Valor[], n: Map<string, Valor>, e: Expr): Valor {
    switch (nome) {
      case 'print': this.escrever(`${this.texto(a[0] ?? null)}\n`); return null;
      case 'max': case 'min': {
        const [x, y] = a as (bigint | number)[];
        if (ehInt(x) && ehInt(y)) return nome === 'max' ? (x > y ? x : y) : (x < y ? x : y);
        const fx = comoNumber(x);
        const fy = comoNumber(y);
        if (Number.isNaN(fx) || Number.isNaN(fy)) return NaN;
        const r = nome === 'max' ? (fx >= fy ? x : y) : (fx <= fy ? x : y);
        return r;
      }
      case 'sqrt': return Math.sqrt(comoNumber(a[0] as bigint | number));
      case 'pow': {
        const [x, y] = a as (bigint | number)[];
        if (ehInt(x) && ehInt(y) && y >= 0n) return int64(x ** y);
        return Math.pow(comoNumber(x), comoNumber(y));
      }
      case 'identical': return a[0] === a[1];
      case 'Exception': return new ErroDoNucleo('Exception', a.length && a[0] !== null ? `Exception: ${this.texto(a[0])}` : 'Exception', a[0] ?? null);
      case 'FormatException': {
        const msg = a[0] === undefined || a[0] === null ? '' : this.texto(a[0]);
        return new ErroDoNucleo('FormatException', formatException(msg, null, null), msg);
      }
      case 'StateError': return new ErroDoNucleo('StateError', `Bad state: ${this.texto(a[0] ?? null)}`, a[0] ?? null);
      case 'ArgumentError': return new ErroDoNucleo('ArgumentError', a.length ? `Invalid argument(s): ${this.texto(a[0])}` : 'Invalid argument(s)', a[0] ?? null);
      case 'RangeError': return new ErroDoNucleo('RangeError', `RangeError: ${this.texto(a[0] ?? null)}`, a[0] ?? null);
      case 'UnsupportedError': return new ErroDoNucleo('UnsupportedError', `Unsupported operation: ${this.texto(a[0] ?? null)}`, a[0] ?? null);
      case 'Object': return new ObjetoDart({ nome: 'Object', decl: { nome: 'Object', posNome: 0, abstrata: false, campos: [], construtores: [], metodos: [], ini: 0, fim: 0 }, mae: null, metodos: new Map(), getters: new Map(), setters: new Map(), estaticos: new Map() });
      default:
        void n;
        void e;
        return null;
    }
  }

  private estaticoDoNucleo(classe: string, nome: string, a: Valor[], _n: Map<string, Valor>, e: Expr): Valor {
    void e;
    if ((classe === 'int' || classe === 'num') && (nome === 'parse' || nome === 'tryParse')) {
      const s = a[0] as string;
      const limpo = s.trim();
      const ok = /^[+-]?(\d+|0[xX][0-9a-fA-F]+)$/.test(limpo);
      if (ok) {
        const neg = limpo.startsWith('-');
        const corpo = limpo.replace(/^[+-]/, '');
        const v = BigInt(corpo);
        return int64(neg ? -v : v);
      }
      if (classe === 'num') {
        const d = this.lerDouble(limpo);
        if (d !== null) return d;
      }
      if (nome === 'tryParse') return null;
      this.lancar('FormatException', formatException(classe === 'num' ? 'Invalid number' : 'Invalid radix-10 number', s, 0), 'Invalid radix-10 number');
    }
    if (classe === 'double' && (nome === 'parse' || nome === 'tryParse')) {
      const d = this.lerDouble((a[0] as string).trim());
      if (d !== null) return d;
      if (nome === 'tryParse') return null;
      this.lancar('FormatException', formatException('Invalid double', a[0] as string, null), 'Invalid double');
    }
    if (classe === 'String' && nome === 'fromCharCode') return String.fromCharCode(Number(a[0] as bigint));
    if (classe === 'List') {
      if (nome === 'filled') return new ListaDart(Array.from({ length: Number(a[0] as bigint) }, () => a[1] ?? null), this.elementoInferido(a[1] === undefined ? [] : [a[1]]));
      if (nome === 'generate') {
        const itens: Valor[] = [];
        for (let i = 0; i < Number(a[0] as bigint); i++) itens.push(this.chamarValor(a[1], [BigInt(i)]));
        return new ListaDart(itens, this.elementoInferido(itens));
      }
      if (nome === 'empty') return new ListaDart([], 'dynamic');
      if (nome === 'from' || nome === 'of') {
        const itens = [...this.itensDe(a[0], 'iterator')];
        return new ListaDart(itens, this.elementoInferido(itens));
      }
    }
    return null;
  }

  private lerDouble(s: string): number | null {
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return Number(s);
    if (s === 'NaN') return NaN;
    if (s === 'Infinity' || s === '+Infinity') return Infinity;
    if (s === '-Infinity') return -Infinity;
    return null;
  }

  /** Os elementos de um iterável, na ordem. */
  private itensDe(v: Valor, oQue: string): Valor[] {
    if (v instanceof ListaDart) return v.itens;
    if (v instanceof ConjuntoDart) return [...v.m.values()];
    if (v instanceof IteravelDart) return v.produzir();
    if (v === null) this.nulo('getter', oQue);
    return [];
  }

  private indexar(alvo: Valor, i: Valor): Valor {
    if (alvo instanceof ListaDart) {
      const n = i as bigint;
      if (n < 0n || n >= BigInt(alvo.itens.length)) this.faixa(n, alvo.itens.length);
      return alvo.itens[Number(n)];
    }
    if (alvo instanceof MapaDart) {
      const par = alvo.m.get(chave(i));
      return par ? par[1] : null;
    }
    if (typeof alvo === 'string') {
      const n = i as bigint;
      if (n < 0n || n >= BigInt(alvo.length)) this.faixa(n, alvo.length);
      return alvo[Number(n)];
    }
    if (alvo === null) this.nulo('method', '[]');
    return null;
  }

  private atribuir(alvo: Expr, v: Valor, amb: Amb, eu: ObjetoDart | null, classe: ClasseRt | null) {
    if (alvo.k === 'nome') {
      const c = amb.achar(alvo.nome);
      if (c) { c.v = v; c.iniciada = true; return; }
      if (eu) {
        const s = this.acharSetter(eu.classe, alvo.nome);
        if (s) { this.chamar(new FuncaoDart(s.metodo.params, s.metodo.corpo!, this.global, eu, s.classe, alvo.nome), [v], new Map(), 0); return; }
        if (this.temCampo(eu.classe, alvo.nome)) { eu.campos.set(alvo.nome, v); return; }
      }
      if (classe) {
        const s = classe.estaticos.get(alvo.nome);
        if (s) { s.v = v; s.iniciado = true; return; }
      }
      return;
    }
    if (alvo.k === 'membro') {
      if (alvo.alvo.k === 'nome' && !amb.achar(alvo.alvo.nome) && this.classes.has(alvo.alvo.nome)) {
        const s = this.classes.get(alvo.alvo.nome)!.estaticos.get(alvo.nome);
        if (s) { s.v = v; s.iniciado = true; return; }
      }
      const obj = this.exp(alvo.alvo, amb, eu, classe);
      if (obj === null && alvo.opcional) return;
      if (obj instanceof ObjetoDart) {
        const s = this.acharSetter(obj.classe, alvo.nome);
        if (s) { this.chamar(new FuncaoDart(s.metodo.params, s.metodo.corpo!, this.global, obj, s.classe, alvo.nome), [v], new Map(), 0); return; }
        obj.campos.set(alvo.nome, v);
        return;
      }
      this.marcar(alvo);
      if (obj === null) this.nulo('setter', `${alvo.nome}=`);
      return;
    }
    if (alvo.k === 'indice') {
      const obj = this.exp(alvo.alvo, amb, eu, classe);
      const i = this.exp(alvo.indice, amb, eu, classe);
      this.marcar(alvo);
      if (obj instanceof ListaDart) {
        const n = i as bigint;
        if (n < 0n || n >= BigInt(obj.itens.length)) this.faixa(n, obj.itens.length);
        obj.itens[Number(n)] = v;
      } else if (obj instanceof MapaDart) {
        const k = chave(i);
        const antigo = obj.m.get(k);
        obj.m.set(k, [antigo ? antigo[0] : i, v]);
      } else if (obj === null) this.nulo('method', '[]=');
    }
  }

  private temCampo(c: ClasseRt, nome: string): boolean {
    let x: ClasseRt | null = c;
    while (x) {
      if (x.decl.campos.some(f => f.nome === nome && !f.estatico)) return true;
      x = x.mae;
    }
    return false;
  }

  /* ── Operadores ────────────────────────────────────────────────────────── */

  private aritmetica(op: string, a: Valor, b: Valor, e: Expr): Valor {
    if (ehInt(a) && ehInt(b)) {
      switch (op) {
        case '+': return int64(a + b);
        case '-': return int64(a - b);
        case '*': return int64(a * b);
        case '/': return Number(a) / Number(b);
        case '~/':
          if (b === 0n) { this.marcar(e); this.lancar('IntegerDivisionByZeroException', 'IntegerDivisionByZeroException'); }
          return int64(a / b);
        case '%': {
          if (b === 0n) { this.marcar(e); this.lancar('IntegerDivisionByZeroException', 'IntegerDivisionByZeroException'); }
          const r = a % b;
          return r < 0n ? r + (b < 0n ? -b : b) : r;
        }
        case '&': return a & b;
        case '|': return a | b;
        case '^': return a ^ b;
        case '<<': return int64(a << b);
        case '>>': return a >> b;
      }
    }
    if (ehNum(a) && ehNum(b)) {
      const x = comoNumber(a);
      const y = comoNumber(b);
      switch (op) {
        case '+': return x + y;
        case '-': return x - y;
        case '*': return x * y;
        case '/': return x / y;
        case '~/': return paraInt(x / y);
        case '%': {
          const r = x % y;
          return r < 0 ? r + Math.abs(y) : r;
        }
      }
    }
    if (typeof a === 'string') {
      if (op === '+') return a + (b as string);
      if (op === '*') return a.repeat(Math.max(0, Number(b as bigint)));
    }
    if (a instanceof ListaDart && op === '+' && b instanceof ListaDart) return new ListaDart([...a.itens, ...b.itens], a.elem);
    this.marcar(e);
    if (a === null) this.nulo('method', op);
    return null;
  }

  private binario(op: string, a: Valor, b: Valor, e: Expr): Valor {
    switch (op) {
      case '==': return this.igual(a, b);
      case '!=': return !this.igual(a, b);
      case '<': case '>': case '<=': case '>=': {
        if (ehNum(a) && ehNum(b)) {
          if (ehInt(a) && ehInt(b)) return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
          const x = comoNumber(a);
          const y = comoNumber(b);
          return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
        }
        this.marcar(e);
        if (a === null) this.nulo('method', op);
        return false;
      }
      default: return this.aritmetica(op, a, b, e);
    }
  }

  private comparar(a: Valor, b: Valor): number {
    if (ehNum(a) && ehNum(b)) {
      if (ehInt(a) && ehInt(b)) return a < b ? -1 : a > b ? 1 : 0;
      const x = comoNumber(a);
      const y = comoNumber(b);
      return x < y ? -1 : x > y ? 1 : 0;
    }
    if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
    if (a instanceof ObjetoDart) {
      const m = this.acharMetodo(a.classe, 'compareTo');
      if (m) return Number(this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, a, m.classe, 'compareTo'), [b], new Map(), 0) as bigint);
      this.lancar('TypeError', `type '${a.classe.nome}' is not a subtype of type 'Comparable<dynamic>' in type cast`);
    }
    return 0;
  }

  /* ── Métodos dos valores da linguagem ──────────────────────────────────── */

  private metodo(v: Valor, nome: string, a: Valor[], n: Map<string, Valor>, e: Expr): Valor {
    if (v instanceof ObjetoDart) {
      const m = this.acharMetodo(v.classe, nome);
      if (m) return this.chamar(new FuncaoDart(m.metodo.params, m.metodo.corpo!, this.global, v, m.classe, nome), a, n, e.ini);
      const campo = this.lerMembro(v, nome, e);
      if (campo.achou && campo.v instanceof FuncaoDart) return this.chamar(campo.v, a, n, e.ini);
      if (nome === 'toString') return `Instance of '${v.classe.nome}'`;
      this.nulo('method', nome);
    }
    if (nome === 'toString') return this.texto(v);
    if (v === null) this.nulo('method', nome);
    if (v instanceof FuncaoDart && nome === 'call') return this.chamar(v, a, n, e.ini);
    if (typeof v === 'string') return this.metodoDeTexto(v, nome, a);
    if (ehNum(v)) return this.metodoDeNumero(v, nome, a);
    if (v instanceof MapaDart) return this.metodoDeMapa(v, nome, a);
    if (v instanceof ListaDart && ['add', 'addAll', 'insert', 'remove', 'removeAt', 'removeLast', 'clear', 'indexOf', 'sort', 'sublist', 'removeWhere', 'indexWhere'].includes(nome)) {
      return this.metodoDeLista(v, nome, a);
    }
    if (v instanceof ConjuntoDart && ['add', 'addAll', 'remove', 'clear', 'union', 'intersection', 'difference', 'contains', 'toSet'].includes(nome)) {
      return this.metodoDeConjunto(v, nome, a);
    }
    if (v instanceof ListaDart || v instanceof ConjuntoDart || v instanceof IteravelDart) return this.metodoDeIteravel(v, nome, a, n);
    if (v instanceof TipoDart && v.nome === 'stdin' && nome === 'readLineSync') {
      return this.entrada.length ? this.entrada.shift()! : null;
    }
    if (v instanceof TipoDart && v.nome === 'stdout') {
      if (nome === 'write') { this.escrever(this.texto(a[0] ?? null)); return null; }
      if (nome === 'writeln') { this.escrever(`${a.length ? this.texto(a[0]) : ''}\n`); return null; }
    }
    return null;
  }

  private metodoDeTexto(s: string, nome: string, a: Valor[]): Valor {
    const num = (i: number) => Number(a[i] as bigint);
    switch (nome) {
      case 'toUpperCase': return s.toUpperCase();
      case 'toLowerCase': return s.toLowerCase();
      case 'trim': return s.trim();
      case 'trimLeft': return s.trimStart();
      case 'trimRight': return s.trimEnd();
      case 'contains': return s.includes(a[0] as string);
      case 'startsWith': return s.startsWith(a[0] as string);
      case 'endsWith': return s.endsWith(a[0] as string);
      case 'indexOf': return BigInt(s.indexOf(a[0] as string));
      case 'lastIndexOf': return BigInt(s.lastIndexOf(a[0] as string));
      case 'substring': {
        const ini = num(0);
        const fim = a.length > 1 && a[1] !== null ? num(1) : s.length;
        if (ini < 0 || ini > s.length) this.lancar('RangeError', `RangeError (start): Invalid value: Not in inclusive range 0..${s.length}: ${ini}`);
        if (fim < ini || fim > s.length) this.lancar('RangeError', `RangeError (end): Invalid value: Not in inclusive range ${ini}..${s.length}: ${fim}`);
        return s.substring(ini, fim);
      }
      case 'split': return new ListaDart(s.split(a[0] as string), 'String');
      case 'replaceAll': return s.split(a[0] as string).join(a[1] as string);
      case 'replaceFirst': return s.replace(a[0] as string, () => a[1] as string);
      case 'padLeft': {
        const w = num(0);
        const pad = (a[1] as string | undefined) ?? ' ';
        return s.length >= w ? s : pad.repeat(w - s.length) + s;
      }
      case 'padRight': {
        const w = num(0);
        const pad = (a[1] as string | undefined) ?? ' ';
        return s.length >= w ? s : s + pad.repeat(w - s.length);
      }
      case 'codeUnitAt': return BigInt(s.charCodeAt(num(0)));
      case 'compareTo': return BigInt(this.comparar(s, a[0]));
      default: return null;
    }
  }

  private metodoDeNumero(v: bigint | number, nome: string, a: Valor[]): Valor {
    const x = comoNumber(v);
    switch (nome) {
      case 'abs': return ehInt(v) ? (v < 0n ? -v : v) : Math.abs(v);
      case 'round': return ehInt(v) ? v : arredondar(x);
      case 'floor': return ehInt(v) ? v : paraInt(Math.floor(x));
      case 'ceil': return ehInt(v) ? v : paraInt(Math.ceil(x));
      case 'truncate': case 'toInt': return ehInt(v) ? v : paraInt(x);
      case 'toDouble': return x;
      case 'roundToDouble': return ehInt(v) ? x : Number(arredondar(x));
      case 'floorToDouble': return Math.floor(x);
      case 'ceilToDouble': return Math.ceil(x);
      case 'toStringAsFixed': return x.toFixed(Number(a[0] as bigint));
      case 'compareTo': return BigInt(this.comparar(v, a[0]));
      case 'remainder': {
        const b = a[0] as bigint | number;
        if (ehInt(v) && ehInt(b)) return v % b;
        return x % comoNumber(b);
      }
      case 'clamp': {
        const lo = a[0] as bigint | number;
        const hi = a[1] as bigint | number;
        if (this.comparar(v, lo) < 0) return lo;
        if (this.comparar(v, hi) > 0) return hi;
        return v;
      }
      default: return null;
    }
  }

  private metodoDeMapa(m: MapaDart, nome: string, a: Valor[]): Valor {
    switch (nome) {
      case 'containsKey': return m.m.has(chave(a[0]));
      case 'containsValue': return [...m.m.values()].some(([, v]) => this.igual(v, a[0]));
      case 'remove': {
        const k = chave(a[0]);
        const par = m.m.get(k);
        m.m.delete(k);
        return par ? par[1] : null;
      }
      case 'clear': m.m.clear(); return null;
      case 'forEach':
        for (const [k, v] of [...m.m.values()]) this.chamarValor(a[0], [k, v]);
        return null;
      case 'putIfAbsent': {
        const k = chave(a[0]);
        const par = m.m.get(k);
        if (par) return par[1];
        const v = this.chamarValor(a[1], []);
        m.m.set(k, [a[0], v]);
        return v;
      }
      case 'addAll':
        if (a[0] instanceof MapaDart) for (const [k, par] of a[0].m) m.m.set(k, par);
        return null;
      default: return null;
    }
  }

  private metodoDeLista(l: ListaDart, nome: string, a: Valor[]): Valor {
    switch (nome) {
      case 'add': l.itens.push(a[0]); return null;
      case 'addAll': l.itens.push(...this.itensDe(a[0], 'iterator')); return null;
      case 'insert': {
        const i = Number(a[0] as bigint);
        if (i < 0 || i > l.itens.length) this.lancar('RangeError', `RangeError (index): Invalid value: Not in inclusive range 0..${l.itens.length}: ${i}`);
        l.itens.splice(i, 0, a[1]);
        return null;
      }
      case 'remove': {
        const i = l.itens.findIndex(x => this.igual(x, a[0]));
        if (i < 0) return false;
        l.itens.splice(i, 1);
        return true;
      }
      case 'removeAt': {
        const i = a[0] as bigint;
        if (i < 0n || i >= BigInt(l.itens.length)) this.faixa(i, l.itens.length);
        return l.itens.splice(Number(i), 1)[0];
      }
      case 'removeLast':
        if (!l.itens.length) this.lancar('RangeError', 'RangeError (index): Invalid value: Valid value range is empty: -1');
        return l.itens.pop()!;
      case 'clear': l.itens.length = 0; return null;
      case 'indexOf': return BigInt(l.itens.findIndex(x => this.igual(x, a[0])));
      case 'indexWhere': return BigInt(l.itens.findIndex(x => this.chamarValor(a[0], [x]) === true));
      case 'removeWhere': {
        const fica = l.itens.filter(x => this.chamarValor(a[0], [x]) !== true);
        l.itens.splice(0, l.itens.length, ...fica);
        return null;
      }
      case 'sort': {
        /* Para as listas desta vereda, o sort do Dart é o de inserção — estável, como o do JS. */
        const cmp = a[0] instanceof FuncaoDart
          ? (x: Valor, y: Valor) => Number(this.chamarValor(a[0], [x, y]) as bigint)
          : (x: Valor, y: Valor) => this.comparar(x, y);
        const copia = [...l.itens];
        copia.sort(cmp);
        l.itens.splice(0, l.itens.length, ...copia);
        return null;
      }
      case 'sublist': {
        const ini = Number(a[0] as bigint);
        const fim = a.length > 1 && a[1] !== null ? Number(a[1] as bigint) : l.itens.length;
        if (ini < 0 || ini > l.itens.length) this.lancar('RangeError', `RangeError (start): Invalid value: Not in inclusive range 0..${l.itens.length}: ${ini}`);
        if (fim < ini || fim > l.itens.length) this.lancar('RangeError', `RangeError (end): Invalid value: Not in inclusive range ${ini}..${l.itens.length}: ${fim}`);
        return new ListaDart(l.itens.slice(ini, fim), l.elem);
      }
      default: return null;
    }
  }

  private metodoDeConjunto(c: ConjuntoDart, nome: string, a: Valor[]): Valor {
    switch (nome) {
      case 'add': {
        const k = chave(a[0]);
        if (c.m.has(k)) return false;
        c.m.set(k, a[0]);
        return true;
      }
      case 'addAll':
        for (const v of this.itensDe(a[0], 'iterator')) if (!c.m.has(chave(v))) c.m.set(chave(v), v);
        return null;
      case 'remove': return c.m.delete(chave(a[0]));
      case 'clear': c.m.clear(); return null;
      case 'contains': return c.m.has(chave(a[0]));
      case 'toSet': {
        const r = new ConjuntoDart(c.elem);
        for (const [k, v] of c.m) r.m.set(k, v);
        return r;
      }
      case 'union': {
        const r = new ConjuntoDart(c.elem);
        for (const [k, v] of c.m) r.m.set(k, v);
        for (const v of this.itensDe(a[0], 'iterator')) if (!r.m.has(chave(v))) r.m.set(chave(v), v);
        return r;
      }
      case 'intersection': case 'difference': {
        const outro = a[0] instanceof ConjuntoDart ? a[0] : new ConjuntoDart('dynamic');
        const r = new ConjuntoDart(c.elem);
        for (const [k, v] of c.m) if (outro.m.has(k) === (nome === 'intersection')) r.m.set(k, v);
        return r;
      }
      default: return null;
    }
  }

  private metodoDeIteravel(v: ListaDart | ConjuntoDart | IteravelDart, nome: string, a: Valor[], n: Map<string, Valor>): Valor {
    const itens = () => this.itensDe(v, nome);
    const f = a[0];
    switch (nome) {
      case 'contains': return itens().some(x => this.igual(x, a[0]));
      case 'elementAt': {
        const i = a[0] as bigint;
        const xs = itens();
        if (i < 0n || i >= BigInt(xs.length)) this.faixa(i, xs.length);
        return xs[Number(i)];
      }
      case 'join': return itens().map(x => this.texto(x)).join((a[0] as string | undefined) ?? '');
      case 'toList': return new ListaDart([...itens()], v instanceof ListaDart || v instanceof ConjuntoDart ? v.elem : this.elementoInferido(itens()));
      case 'toSet': {
        const c = new ConjuntoDart(v instanceof ListaDart ? v.elem : 'dynamic');
        for (const x of itens()) if (!c.m.has(chave(x))) c.m.set(chave(x), x);
        return c;
      }
      case 'where': return new IteravelDart(() => itens().filter(x => this.chamarValor(f, [x]) === true));
      case 'map': return new IteravelDart(() => itens().map(x => this.chamarValor(f, [x])));
      case 'expand': return new IteravelDart(() => itens().flatMap(x => this.itensDe(this.chamarValor(f, [x]), 'iterator')));
      case 'take': return new IteravelDart(() => itens().slice(0, Number(a[0] as bigint)));
      case 'skip': return new IteravelDart(() => itens().slice(Number(a[0] as bigint)));
      case 'forEach': for (const x of [...itens()]) this.chamarValor(f, [x]); return null;
      case 'any': return itens().some(x => this.chamarValor(f, [x]) === true);
      case 'every': return itens().every(x => this.chamarValor(f, [x]) === true);
      case 'reduce': {
        const xs = itens();
        if (!xs.length) this.semElemento();
        let acc = xs[0];
        for (const x of xs.slice(1)) acc = this.chamarValor(f, [acc, x]);
        return acc;
      }
      case 'fold': {
        let acc = a[0];
        for (const x of itens()) acc = this.chamarValor(a[1], [acc, x]);
        return acc;
      }
      case 'firstWhere': case 'lastWhere': {
        const xs = nome === 'firstWhere' ? itens() : [...itens()].reverse();
        for (const x of xs) if (this.chamarValor(f, [x]) === true) return x;
        if (n.has('orElse')) return this.chamarValor(n.get('orElse')!, []);
        return this.semElemento();
      }
      default: return null;
    }
  }
}
