import { lerPecas, ErroDeLeitura, ehChaveReservada, type Peca } from './dartLexico';

/**
 * A árvore do Dart da plataforma, e o leitor que a monta.
 *
 * Cobre o pedaço da linguagem que a CC-MB001 ensina e o que um programa de
 * linha de comando do tamanho dela usa: variáveis com e sem tipo, funções
 * com parâmetros posicionais, opcionais e nomeados, classes com campos,
 * construtores, métodos, getters e herança, enums simples, coleções com
 * espalhar e `if` dentro, os operadores do nulo seguro, `try`/`catch`, e a
 * importação de outro arquivo e de `dart:math` e `dart:io`.
 *
 * O que fica de fora não é ignorado em silêncio: o leitor recusa com uma
 * frase que diz que aquilo não cabe no simulador (`NaoSuportado`). Ignorar
 * faria o programa rodar diferente do que rodaria no computador do clube,
 * e quem escreveu não teria como saber.
 */

export interface No { ini: number; fim: number }

export interface TipoEscrito extends No {
  nome: string;
  args: TipoEscrito[];
  anulavel: boolean;
  /** Só em `int Function(String)`: o retorno e os parâmetros. */
  funcao?: { retorno: TipoEscrito; params: TipoEscrito[] };
}

export type Expr = No & (
  | { k: 'int'; v: bigint; texto: string }
  | { k: 'double'; v: number }
  | { k: 'texto'; partes: (string | Expr)[] }
  | { k: 'bool'; v: boolean }
  | { k: 'null' }
  | { k: 'lista'; tipo?: TipoEscrito; itens: Item[] }
  | { k: 'chaves'; tipos?: TipoEscrito[]; itens: Item[] }
  | { k: 'nome'; nome: string }
  | { k: 'this' }
  | { k: 'super' }
  | { k: 'alvoDaCascata' }
  | { k: 'membro'; alvo: Expr; nome: string; opcional: boolean; posNome: number }
  | { k: 'indice'; alvo: Expr; indice: Expr }
  | { k: 'chamada'; alvo: Expr; args: Arg[]; tipoArgs?: TipoEscrito[]; posAbre: number }
  | { k: 'unario'; op: '-' | '!' | '~'; e: Expr }
  | { k: 'prefixo'; op: '++' | '--'; e: Expr }
  | { k: 'posfixo'; op: '++' | '--' | '!'; e: Expr }
  | { k: 'binario'; op: string; a: Expr; b: Expr; posOp: number }
  | { k: 'logico'; op: '&&' | '||' | '??'; a: Expr; b: Expr; posOp: number }
  | { k: 'condicional'; c: Expr; s: Expr; n: Expr }
  | { k: 'atribuicao'; op: string; alvo: Expr; valor: Expr; posOp: number }
  | { k: 'eh'; e: Expr; tipo: TipoEscrito; negado: boolean }
  | { k: 'como'; e: Expr; tipo: TipoEscrito }
  | { k: 'funcao'; params: Param[]; corpo: Corpo }
  | { k: 'cascata'; alvo: Expr; secoes: Expr[] }
  | { k: 'lance'; e: Expr }
);

export type Item = No & (
  | { k: 'item'; e: Expr }
  | { k: 'par'; chave: Expr; valor: Expr }
  | { k: 'espalhar'; e: Expr; opcional: boolean }
  | { k: 'se'; c: Expr; entao: Item; senao?: Item }
  | { k: 'para'; mod: 'var' | 'final' | null; tipo?: TipoEscrito; nome: string; iteravel: Expr; corpo: Item }
);

export interface Arg extends No { nome?: string; e: Expr }

export interface Param extends No {
  nome: string;
  tipo?: TipoEscrito;
  /** `this.nome`: o parâmetro grava direto no campo. */
  campo: boolean;
  /** `super.nome`: o parâmetro passa direto para o construtor da mãe. */
  daMae: boolean;
  modo: 'pos' | 'opcional' | 'nomeado';
  /** `required` num nomeado, ou um posicional sem colchete. */
  obrigatorio: boolean;
  padrao?: Expr;
  final: boolean;
}

export type Corpo = No & ({ k: 'bloco'; corpo: Instr[] } | { k: 'seta'; e: Expr });

export interface DeclDeVariavel extends No { nome: string; init?: Expr }

export type Instr = No & (
  | { k: 'bloco'; corpo: Instr[] }
  | { k: 'var'; mod: 'var' | 'final' | 'const' | null; late: boolean; tipo?: TipoEscrito; decls: DeclDeVariavel[] }
  | { k: 'expr'; e: Expr }
  | { k: 'se'; c: Expr; entao: Instr; senao?: Instr }
  | { k: 'para'; init?: Instr; cond?: Expr; passos: Expr[]; corpo: Instr }
  | { k: 'paraEm'; mod: 'var' | 'final' | null; tipo?: TipoEscrito; nome: string; posNome: number; iteravel: Expr; corpo: Instr }
  | { k: 'enquanto'; c: Expr; corpo: Instr }
  | { k: 'faca'; corpo: Instr; c: Expr }
  | { k: 'pare' }
  | { k: 'continue' }
  | { k: 'retorne'; e?: Expr }
  | { k: 'tente'; corpo: Instr; capturas: Captura[]; finalmente?: Instr }
  | { k: 'escolha'; e: Expr; casos: { valores: Expr[]; corpo: Instr[] }[] }
  | { k: 'funcaoLocal'; decl: DeclDeFuncao }
  | { k: 'relance' }
  | { k: 'vazia' }
);

export interface Captura extends No { tipo?: TipoEscrito; erro?: string; pilha?: string; corpo: Instr }

export interface DeclDeFuncao extends No {
  nome: string;
  posNome: number;
  retorno?: TipoEscrito;
  params: Param[];
  /** `null` no método abstrato. */
  corpo: Corpo | null;
  getter: boolean;
  setter: boolean;
  estatico: boolean;
  sobrescreve: boolean;
}

export interface DeclDeCampo extends No {
  nome: string;
  posNome: number;
  tipo?: TipoEscrito;
  mod: 'var' | 'final' | 'const' | null;
  late: boolean;
  estatico: boolean;
  init?: Expr;
}

export type Inicializador = No & (
  | { k: 'campo'; nome: string; e: Expr }
  | { k: 'super'; nome: string | null; args: Arg[] }
  | { k: 'redireciona'; nome: string | null; args: Arg[] }
  | { k: 'afirme'; e: Expr }
);

export interface DeclDeConstrutor extends No {
  /** A parte depois do ponto em `Classe.vazia()`; `null` no construtor sem nome. */
  nome: string | null;
  posNome: number;
  params: Param[];
  inicializadores: Inicializador[];
  corpo: Corpo | null;
  constante: boolean;
}

export interface DeclDeClasse extends No {
  nome: string;
  posNome: number;
  abstrata: boolean;
  mae?: TipoEscrito;
  campos: DeclDeCampo[];
  construtores: DeclDeConstrutor[];
  metodos: DeclDeFuncao[];
}

export interface DeclDeEnum extends No { nome: string; posNome: number; valores: { nome: string; ini: number; fim: number }[] }

export interface Importacao extends No { uri: string; prefixo?: string }

export interface ArquivoDart {
  arquivo: string;
  fonte: string;
  importacoes: Importacao[];
  classes: DeclDeClasse[];
  enums: DeclDeEnum[];
  funcoes: DeclDeFuncao[];
  variaveis: Extract<Instr, { k: 'var' }>[];
}

/** Erro de leitura, com a mensagem do `dart`. */
export class ErroDeSintaxe extends Error {
  constructor(public ini: number, public fim: number, mensagem: string) { super(mensagem); }
}

/** O que a linguagem tem e o simulador não. */
export class NaoSuportado extends Error {
  constructor(public ini: number, public fim: number, oQue: string) {
    super(`O simulador de Dart da plataforma não tem ${oQue}. Ele cobre o que a vereda ensina — escreva sem isso, ou confira no computador do clube.`);
  }
}

const OPS_DE_ATRIBUICAO = new Set(['=', '+=', '-=', '*=', '/=', '%=', '~/=', '??=', '&=', '|=', '^=']);

export function lerArquivoDart(arquivo: string, fonte: string): ArquivoDart {
  let pecas: Peca[];
  try {
    pecas = lerPecas(fonte);
  } catch (e) {
    if (e instanceof ErroDeLeitura) throw new ErroDeSintaxe(e.ini, e.fim, e.message);
    throw e;
  }
  return new Leitor(pecas, arquivo, fonte).arquivo();
}

class Leitor {
  private p = 0;
  constructor(private pecas: Peca[], private nomeDoArquivo: string, private fonte: string) {}

  private get atual(): Peca { return this.pecas[this.p]; }
  private olhar(n = 0): Peca { return this.pecas[Math.min(this.p + n, this.pecas.length - 1)]; }
  private anterior(): Peca { return this.pecas[Math.max(0, this.p - 1)]; }
  private avancar(): Peca { const x = this.pecas[this.p]; if (this.p < this.pecas.length - 1) this.p++; return x; }
  private eh(v: string, n = 0): boolean { const x = this.olhar(n); return (x.t === 'sinal' || x.t === 'chave' || x.t === 'id') && x.v === v; }
  private ehSinal(v: string, n = 0): boolean { const x = this.olhar(n); return x.t === 'sinal' && x.v === v; }
  private aceitar(v: string): boolean { if (this.eh(v)) { this.avancar(); return true; } return false; }

  private descrever(x: Peca): string {
    if (x.t === 'fim') return 'end of file';
    if (x.t === 'texto') return this.fonte.slice(x.ini, x.fim);
    return x.v;
  }

  /*
    O ponto e vírgula esquecido é o erro de sintaxe mais comum que existe, e
    o `dart` o aponta na peça de **antes**: "Expected ';' after this." com a
    seta no fim da linha que ficou sem ele. Apontar a peça seguinte mandaria
    a pessoa procurar na linha de baixo.
  */
  private esperar(v: string): Peca {
    if (this.eh(v)) return this.avancar();
    if (v === ';' || v === ')' || v === ']') {
      const ant = this.anterior();
      throw new ErroDeSintaxe(ant.ini, ant.fim, `Expected '${v}' after this.`);
    }
    throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, `Expected '${v}' before this.`);
  }

  private nome(): Peca {
    const x = this.atual;
    if (x.t === 'id' || (x.t === 'chave' && !ehChaveReservada(x.v))) return this.avancar();
    throw new ErroDeSintaxe(x.ini, x.fim, `Expected an identifier, but got '${this.descrever(x)}'.`);
  }

  private ehNome(n = 0): boolean {
    const x = this.olhar(n);
    return x.t === 'id' || (x.t === 'chave' && !ehChaveReservada(x.v));
  }

  arquivo(): ArquivoDart {
    const r: ArquivoDart = { arquivo: this.nomeDoArquivo, fonte: this.fonte, importacoes: [], classes: [], enums: [], funcoes: [], variaveis: [] };
    while (this.atual.t !== 'fim') {
      this.anotacoes();
      const ini = this.atual.ini;
      if (this.eh('import')) {
        this.avancar();
        const uri = this.atual;
        if (uri.t !== 'texto' || uri.partes) throw new ErroDeSintaxe(uri.ini, uri.fim, 'Expected a string literal.');
        this.avancar();
        let prefixo: string | undefined;
        if (this.aceitar('as')) prefixo = this.nome().v;
        if (this.eh('show') || this.eh('hide') || this.eh('deferred')) throw new NaoSuportado(this.atual.ini, this.atual.fim, `o "${this.atual.v}" na importação`);
        this.esperar(';');
        r.importacoes.push({ uri: uri.v, prefixo, ini, fim: this.anterior().fim });
        continue;
      }
      if (this.eh('class') || (this.eh('abstract') && this.eh('class', 1))) { r.classes.push(this.classe()); continue; }
      if (this.eh('enum')) { r.enums.push(this.enumeracao()); continue; }
      for (const nao of ['mixin', 'extension', 'typedef', 'library', 'part', 'export', 'sealed', 'base', 'interface', 'final class']) {
        if (this.eh(nao) && !(nao === 'final class') && (this.ehNome(1) || this.eh('class', 1) || this.eh('on', 1))) {
          throw new NaoSuportado(this.atual.ini, this.atual.fim, `"${nao}"`);
        }
      }
      if (this.eh('var') || this.eh('final') || this.eh('const') || this.eh('late')) {
        r.variaveis.push(this.declaracaoDeVariavel(true));
        continue;
      }
      const fimDoTipo = this.tentarTipo(this.p);
      const depoisDoNome = fimDoTipo >= 0 && this.ehNomeEm(fimDoTipo) ? fimDoTipo + 1 : -1;
      if (depoisDoNome >= 0 && this.pecas[depoisDoNome].t === 'sinal' && ['=', ';', ','].includes(this.pecas[depoisDoNome].v)) {
        r.variaveis.push(this.declaracaoDeVariavel(true));
        continue;
      }
      if ((depoisDoNome >= 0 && this.pecas[depoisDoNome].v === '(') || (this.ehNome() && this.ehSinal('(', 1))) {
        r.funcoes.push(this.funcao(false, false));
        continue;
      }
      if (this.eh('get') || (fimDoTipo >= 0 && this.pecas[fimDoTipo].v === 'get')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'getter fora de uma classe');
      throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, `Expected a declaration, but got '${this.descrever(this.atual)}'.`);
    }
    return r;
  }

  private ehNomeEm(i: number): boolean {
    const x = this.pecas[i];
    return x.t === 'id' || (x.t === 'chave' && !ehChaveReservada(x.v));
  }

  /** `@override` e as outras anotações; devolve se uma delas é `@override`. */
  private anotacoes(): boolean {
    let sobrescreve = false;
    while (this.ehSinal('@')) {
      this.avancar();
      const n = this.nome();
      if (n.v === 'override') sobrescreve = true;
      if (this.ehSinal('(')) this.argumentos();
    }
    return sobrescreve;
  }

  /* ── Tipos ─────────────────────────────────────────────────────────── */

  /**
   * Onde acaba o tipo que começa em `i`, ou -1 se ali não há tipo. Não
   * consome nada: é a espiada que decide se `Desbravador d = ...` é uma
   * declaração ou se `a < b` é uma comparação.
   */
  private tentarTipo(i: number): number {
    const x = this.pecas[i];
    if (!x) return -1;
    if (x.t === 'chave' && x.v === 'void') return this.depoisDeFuncao(i + 1);
    if (!(x.t === 'id' || (x.t === 'chave' && (x.v === 'dynamic' || !ehChaveReservada(x.v))))) return -1;
    if (x.t === 'chave' && ['get', 'set', 'required', 'late', 'static', 'abstract', 'factory', 'operator', 'covariant', 'external'].includes(x.v)) return -1;
    let j = i + 1;
    if (this.pecas[j]?.t === 'sinal' && this.pecas[j].v === '.' && this.pecas[j + 1]?.t === 'id') j += 2;
    if (this.pecas[j]?.t === 'sinal' && this.pecas[j].v === '<') {
      let nivel = 0;
      while (j < this.pecas.length) {
        const y = this.pecas[j];
        if (y.t === 'sinal' && y.v === '<') nivel++;
        else if (y.t === 'sinal' && y.v === '>') { nivel--; if (nivel === 0) { j++; break; } }
        else if (y.t === 'sinal' && y.v === '>>') { nivel -= 2; if (nivel <= 0) { j++; break; } }
        else if (!(y.t === 'id' || y.t === 'chave' || (y.t === 'sinal' && [',', '?', '.', '(', ')'].includes(y.v)))) return -1;
        j++;
      }
      if (nivel > 0) return -1;
    }
    if (this.pecas[j]?.t === 'sinal' && this.pecas[j].v === '?') j++;
    return this.depoisDeFuncao(j);
  }

  /* `int Function(String)` — o tipo de função, depois do retorno. */
  private depoisDeFuncao(j: number): number {
    if (this.pecas[j]?.t === 'id' && this.pecas[j].v === 'Function' && this.pecas[j + 1]?.v === '(') {
      let nivel = 0;
      let k = j + 1;
      for (; k < this.pecas.length; k++) {
        if (this.pecas[k].v === '(') nivel++;
        if (this.pecas[k].v === ')') { nivel--; if (nivel === 0) break; }
      }
      k++;
      if (this.pecas[k]?.v === '?') k++;
      return k;
    }
    return j;
  }

  private tipo(): TipoEscrito {
    const ini = this.atual.ini;
    let base: TipoEscrito;
    if (this.eh('void')) {
      this.avancar();
      base = { nome: 'void', args: [], anulavel: false, ini, fim: this.anterior().fim };
    } else {
      let nome = this.nome().v;
      if (this.ehSinal('.') && this.ehNome(1)) { this.avancar(); nome += '.' + this.nome().v; }
      const args: TipoEscrito[] = [];
      if (this.ehSinal('<')) {
        this.avancar();
        args.push(this.tipo());
        while (this.aceitar(',')) args.push(this.tipo());
        this.fecharAngulo();
      }
      const anulavel = this.aceitar('?');
      base = { nome, args, anulavel, ini, fim: this.anterior().fim };
    }
    if (this.eh('Function') && this.ehSinal('(', 1)) {
      this.avancar();
      this.avancar();
      const params: TipoEscrito[] = [];
      while (!this.ehSinal(')')) {
        if (this.ehSinal('[') || this.ehSinal('{')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'parâmetro opcional dentro de um tipo de função');
        params.push(this.tipo());
        if (this.ehNome()) this.avancar();
        if (!this.aceitar(',')) break;
      }
      this.esperar(')');
      const anulavel = this.aceitar('?');
      return { nome: 'Function', args: [], anulavel, funcao: { retorno: base, params }, ini, fim: this.anterior().fim };
    }
    return base;
  }

  /* `List<List<int>>`: o léxico entrega `>>` junto, e aqui ele se parte. */
  private fecharAngulo() {
    if (this.ehSinal('>')) { this.avancar(); return; }
    if (this.ehSinal('>>')) {
      const x = this.atual;
      this.pecas.splice(this.p, 1, { t: 'sinal', v: '>', ini: x.ini, fim: x.ini + 1 }, { t: 'sinal', v: '>', ini: x.ini + 1, fim: x.fim });
      this.avancar();
      return;
    }
    this.esperar('>');
  }

  /* ── Declarações ───────────────────────────────────────────────────── */

  private enumeracao(): DeclDeEnum {
    const ini = this.avancar().ini;
    const n = this.nome();
    this.esperar('{');
    const valores: DeclDeEnum['valores'] = [];
    while (!this.ehSinal('}')) {
      const v = this.nome();
      if (this.ehSinal('(')) throw new NaoSuportado(v.ini, v.fim, 'enum com construtor');
      valores.push({ nome: v.v, ini: v.ini, fim: v.fim });
      if (!this.aceitar(',')) break;
      if (this.ehSinal(';')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'enum com membros');
    }
    this.esperar('}');
    return { nome: n.v, posNome: n.ini, valores, ini, fim: this.anterior().fim };
  }

  private classe(): DeclDeClasse {
    const ini = this.atual.ini;
    const abstrata = this.aceitar('abstract');
    this.esperar('class');
    const n = this.nome();
    if (this.ehSinal('<')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'classe genérica (com <T>)');
    let mae: TipoEscrito | undefined;
    if (this.aceitar('extends')) mae = this.tipo();
    if (this.eh('with')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'mixin (with)');
    if (this.eh('implements')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'implements');
    this.esperar('{');
    const c: DeclDeClasse = { nome: n.v, posNome: n.ini, abstrata, mae, campos: [], construtores: [], metodos: [], ini, fim: 0 };
    while (!this.ehSinal('}')) {
      if (this.atual.t === 'fim') {
        const abre = this.pecas.find(x => x.ini >= n.fim && x.v === '{');
        throw new ErroDeSintaxe(abre?.ini ?? ini, (abre?.ini ?? ini) + 1, 'Can\'t find \'}\' to match \'{\'.');
      }
      this.membro(c);
    }
    this.avancar();
    c.fim = this.anterior().fim;
    return c;
  }

  private membro(c: DeclDeClasse) {
    const sobrescreve = this.anotacoes();
    const ini = this.atual.ini;
    if (this.eh('factory')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'construtor factory');
    if (this.eh('operator') || (this.ehNome() && this.eh('operator', 1))) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'redefinição de operador');
    const constante = this.eh('const') && this.eh(c.nome, 1);
    if (constante) this.avancar();
    /* Construtor: o nome da classe seguido de `(` ou de `.nome(`. */
    if (this.eh(c.nome) && (this.ehSinal('(', 1) || (this.ehSinal('.', 1) && this.ehNome(2) && this.ehSinal('(', 3)))) {
      const posNome = this.avancar().ini;
      let nome: string | null = null;
      if (this.aceitar('.')) nome = this.nome().v;
      const params = this.parametros();
      const inicializadores: Inicializador[] = [];
      if (this.aceitar(':')) {
        do {
          const ii = this.atual.ini;
          if (this.eh('super')) {
            this.avancar();
            let nomeDaMae: string | null = null;
            if (this.aceitar('.')) nomeDaMae = this.nome().v;
            const args = this.argumentos();
            inicializadores.push({ k: 'super', nome: nomeDaMae, args, ini: ii, fim: this.anterior().fim });
          } else if (this.eh('this') && (this.ehSinal('(', 1) || (this.ehSinal('.', 1) && this.ehSinal('(', 3)))) {
            this.avancar();
            let alvo: string | null = null;
            if (this.aceitar('.')) alvo = this.nome().v;
            const args = this.argumentos();
            inicializadores.push({ k: 'redireciona', nome: alvo, args, ini: ii, fim: this.anterior().fim });
          } else if (this.eh('assert')) {
            this.avancar();
            this.esperar('(');
            const e = this.expressao();
            if (this.aceitar(',')) this.expressao();
            this.esperar(')');
            inicializadores.push({ k: 'afirme', e, ini: ii, fim: this.anterior().fim });
          } else {
            if (this.eh('this')) { this.avancar(); this.esperar('.'); }
            const campo = this.nome().v;
            this.esperar('=');
            const e = this.semCascata();
            inicializadores.push({ k: 'campo', nome: campo, e, ini: ii, fim: this.anterior().fim });
          }
        } while (this.aceitar(','));
      }
      let corpo: Corpo | null = null;
      if (this.ehSinal('{') || this.ehSinal('=>')) corpo = this.corpo();
      else this.esperar(';');
      c.construtores.push({ nome, posNome, params, inicializadores, corpo, constante, ini, fim: this.anterior().fim });
      return;
    }
    const estatico = this.aceitar('static');
    if (this.eh('var') || this.eh('final') || this.eh('const') || this.eh('late')) {
      const d = this.declaracaoDeVariavel(true);
      for (const x of d.decls) {
        c.campos.push({ nome: x.nome, posNome: x.ini, tipo: d.tipo, mod: d.mod, late: d.late, estatico, init: x.init, ini, fim: d.fim });
      }
      return;
    }
    /* getter / setter / método / campo com tipo */
    const fimDoTipo = this.tentarTipo(this.p);
    const temTipo = fimDoTipo >= 0 && (this.ehNomeEm(fimDoTipo) || this.pecas[fimDoTipo].v === 'get' || this.pecas[fimDoTipo].v === 'set');
    if (this.eh('get') && this.ehNome(1)) { c.metodos.push(this.funcao(estatico, sobrescreve, ini)); return; }
    if (this.eh('set') && this.ehNome(1)) { c.metodos.push(this.funcao(estatico, sobrescreve, ini)); return; }
    if (temTipo) {
      const depois = this.pecas[fimDoTipo + 1];
      if (this.pecas[fimDoTipo].v === 'get' || this.pecas[fimDoTipo].v === 'set' || depois?.v === '(') {
        c.metodos.push(this.funcao(estatico, sobrescreve, ini));
        return;
      }
      const d = this.declaracaoDeVariavel(true);
      for (const x of d.decls) {
        c.campos.push({ nome: x.nome, posNome: x.ini, tipo: d.tipo, mod: d.mod, late: d.late, estatico, init: x.init, ini, fim: d.fim });
      }
      return;
    }
    if (this.ehNome() && this.ehSinal('(', 1)) { c.metodos.push(this.funcao(estatico, sobrescreve, ini)); return; }
    throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, `Expected a class member, but got '${this.descrever(this.atual)}'.`);
  }

  private funcao(estatico: boolean, sobrescreve: boolean, ini = this.atual.ini): DeclDeFuncao {
    let retorno: TipoEscrito | undefined;
    if (!(this.eh('get') && this.ehNome(1)) && !(this.eh('set') && this.ehNome(1)) && !(this.ehNome() && this.ehSinal('(', 1))) {
      retorno = this.tipo();
    }
    let getter = false;
    let setter = false;
    if (this.eh('get') && this.ehNome(1)) { this.avancar(); getter = true; }
    else if (this.eh('set') && this.ehNome(1)) { this.avancar(); setter = true; }
    const n = this.nome();
    if (this.ehSinal('<')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'função genérica (com <T>)');
    const params = getter ? [] : this.parametros();
    let corpo: Corpo | null = null;
    if (this.eh('async') || this.eh('sync')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'função assíncrona (async)');
    if (this.ehSinal('{') || this.ehSinal('=>')) corpo = this.corpo();
    else this.esperar(';');
    return { nome: n.v, posNome: n.ini, retorno, params, corpo, getter, setter, estatico, sobrescreve, ini, fim: this.anterior().fim };
  }

  private corpo(): Corpo {
    const ini = this.atual.ini;
    if (this.aceitar('=>')) {
      const e = this.expressao();
      this.esperar(';');
      return { k: 'seta', e, ini, fim: this.anterior().fim };
    }
    const b = this.bloco();
    return { k: 'bloco', corpo: b.corpo, ini, fim: b.fim };
  }

  private parametros(): Param[] {
    this.esperar('(');
    const lista: Param[] = [];
    let modo: Param['modo'] = 'pos';
    let fechar: string | null = null;
    while (!this.ehSinal(')')) {
      if (this.ehSinal('[')) { this.avancar(); modo = 'opcional'; fechar = ']'; continue; }
      if (this.ehSinal('{')) { this.avancar(); modo = 'nomeado'; fechar = '}'; continue; }
      if (fechar && this.ehSinal(fechar)) { this.avancar(); continue; }
      this.anotacoes();
      const ini = this.atual.ini;
      const obrigatorioNomeado = this.aceitar('required');
      const final = this.aceitar('final');
      if (this.eh('covariant')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'covariant');
      let tipo: TipoEscrito | undefined;
      let campo = false;
      let daMae = false;
      if (!(this.eh('this') || this.eh('super')) && !(this.ehNome() && (this.ehSinal(',', 1) || this.ehSinal(')', 1) || this.ehSinal('=', 1) || this.ehSinal(']', 1) || this.ehSinal('}', 1)))) {
        tipo = this.tipo();
      }
      if (this.eh('this')) { this.avancar(); this.esperar('.'); campo = true; }
      else if (this.eh('super')) { this.avancar(); this.esperar('.'); daMae = true; }
      const n = this.nome();
      if (this.ehSinal('(')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'parâmetro escrito como função');
      let padrao: Expr | undefined;
      if (this.aceitar('=')) padrao = this.semCascata();
      lista.push({
        nome: n.v, tipo, campo, daMae, modo, final,
        obrigatorio: modo === 'pos' || obrigatorioNomeado,
        padrao, ini, fim: this.anterior().fim,
      });
      if (!this.aceitar(',')) {
        if (fechar && this.ehSinal(fechar)) { this.avancar(); fechar = null; }
        break;
      }
    }
    this.esperar(')');
    return lista;
  }

  private declaracaoDeVariavel(comPontoEVirgula: boolean): Extract<Instr, { k: 'var' }> {
    const ini = this.atual.ini;
    const late = this.aceitar('late');
    let mod: 'var' | 'final' | 'const' | null = null;
    if (this.eh('var') || this.eh('final') || this.eh('const')) mod = this.avancar().v as 'var' | 'final' | 'const';
    let tipo: TipoEscrito | undefined;
    if (mod !== 'var') {
      const fimDoTipo = this.tentarTipo(this.p);
      if (fimDoTipo >= 0 && this.ehNomeEm(fimDoTipo)) tipo = this.tipo();
    }
    const decls: DeclDeVariavel[] = [];
    do {
      const n = this.nome();
      let init: Expr | undefined;
      if (this.aceitar('=')) init = this.expressao();
      decls.push({ nome: n.v, ini: n.ini, fim: n.fim, init });
    } while (this.aceitar(','));
    if (comPontoEVirgula) this.esperar(';');
    return { k: 'var', mod, late, tipo, decls, ini, fim: this.anterior().fim };
  }

  /* ── Instruções ────────────────────────────────────────────────────── */

  private bloco(): { corpo: Instr[]; fim: number } {
    const abre = this.esperar('{');
    const corpo: Instr[] = [];
    while (!this.ehSinal('}')) {
      if (this.atual.t === 'fim') throw new ErroDeSintaxe(abre.ini, abre.fim, 'Can\'t find \'}\' to match \'{\'.');
      corpo.push(this.instrucao());
    }
    this.avancar();
    return { corpo, fim: this.anterior().fim };
  }

  private ehDeclaracaoLocal(): boolean {
    if (this.eh('var') || this.eh('final') || this.eh('const') || this.eh('late')) return true;
    const fimDoTipo = this.tentarTipo(this.p);
    if (fimDoTipo < 0 || !this.ehNomeEm(fimDoTipo)) return false;
    const depois = this.pecas[fimDoTipo + 1];
    return depois.t === 'sinal' && ['=', ';', ','].includes(depois.v)
      || (depois.t === 'chave' && depois.v === 'in');
  }

  private instrucao(): Instr {
    const ini = this.atual.ini;
    const x = this.atual;
    if (x.t === 'sinal' && x.v === '{') {
      const b = this.bloco();
      return { k: 'bloco', corpo: b.corpo, ini, fim: b.fim };
    }
    if (x.t === 'sinal' && x.v === ';') { this.avancar(); return { k: 'vazia', ini, fim: this.anterior().fim }; }
    if (this.eh('if')) {
      this.avancar();
      this.esperar('(');
      const c = this.expressao();
      this.esperar(')');
      const entao = this.instrucao();
      let senao: Instr | undefined;
      if (this.aceitar('else')) senao = this.instrucao();
      return { k: 'se', c, entao, senao, ini, fim: this.anterior().fim };
    }
    if (this.eh('while')) {
      this.avancar();
      this.esperar('(');
      const c = this.expressao();
      this.esperar(')');
      const corpo = this.instrucao();
      return { k: 'enquanto', c, corpo, ini, fim: this.anterior().fim };
    }
    if (this.eh('do')) {
      this.avancar();
      const corpo = this.instrucao();
      this.esperar('while');
      this.esperar('(');
      const c = this.expressao();
      this.esperar(')');
      this.esperar(';');
      return { k: 'faca', corpo, c, ini, fim: this.anterior().fim };
    }
    if (this.eh('for')) return this.para();
    if (this.eh('break')) {
      this.avancar();
      if (this.ehNome()) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'break com rótulo');
      this.esperar(';');
      return { k: 'pare', ini, fim: this.anterior().fim };
    }
    if (this.eh('continue')) { this.avancar(); this.esperar(';'); return { k: 'continue', ini, fim: this.anterior().fim }; }
    if (this.eh('return')) {
      this.avancar();
      let e: Expr | undefined;
      if (!this.ehSinal(';')) e = this.expressao();
      this.esperar(';');
      return { k: 'retorne', e, ini, fim: this.anterior().fim };
    }
    if (this.eh('rethrow')) { this.avancar(); this.esperar(';'); return { k: 'relance', ini, fim: this.anterior().fim }; }
    if (this.eh('try')) return this.tente();
    if (this.eh('switch')) return this.escolha();
    if (this.eh('assert')) throw new NaoSuportado(x.ini, x.fim, 'assert');
    if (this.ehDeclaracaoLocal()) return this.declaracaoDeVariavel(true);
    /* função local: `int dobro(int x) { ... }` ou `void f() => ...;` */
    const fimDoTipo = this.tentarTipo(this.p);
    if (fimDoTipo >= 0 && this.ehNomeEm(fimDoTipo) && this.pecas[fimDoTipo + 1]?.v === '(' && this.pareceFuncao(fimDoTipo + 1)) {
      const decl = this.funcao(false, false);
      return { k: 'funcaoLocal', decl, ini, fim: decl.fim };
    }
    if (this.ehNome() && this.ehSinal('(', 1) && this.pareceFuncao(this.p + 1)) {
      const decl = this.funcao(false, false);
      return { k: 'funcaoLocal', decl, ini, fim: decl.fim };
    }
    const e = this.expressao();
    this.esperar(';');
    return { k: 'expr', e, ini, fim: this.anterior().fim };
  }

  /* Depois do `)` correspondente vem `{` ou `=>`? Então é declaração. */
  private pareceFuncao(abre: number): boolean {
    let nivel = 0;
    for (let k = abre; k < this.pecas.length; k++) {
      const y = this.pecas[k];
      if (y.t === 'sinal' && y.v === '(') nivel++;
      if (y.t === 'sinal' && y.v === ')') {
        nivel--;
        if (nivel === 0) {
          const d = this.pecas[k + 1];
          return d?.t === 'sinal' && (d.v === '{' || d.v === '=>');
        }
      }
    }
    return false;
  }

  private para(): Instr {
    const ini = this.avancar().ini;
    if (this.eh('await')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'await for');
    this.esperar('(');
    /* for-in: `for (var x in lista)`, `for (final x in ...)`, `for (String x in ...)` */
    let k = this.p;
    if (this.pecas[k].v === 'var' || this.pecas[k].v === 'final') k++;
    const fimDoTipo = this.tentarTipo(k);
    const comTipo = fimDoTipo >= 0 && this.ehNomeEm(fimDoTipo) && this.pecas[fimDoTipo + 1]?.v === 'in';
    const semTipo = this.ehNomeEm(k) && this.pecas[k + 1]?.v === 'in';
    if (comTipo || semTipo) {
      let mod: 'var' | 'final' | null = null;
      if (this.eh('var') || this.eh('final')) mod = this.avancar().v as 'var' | 'final';
      let tipo: TipoEscrito | undefined;
      if (comTipo) tipo = this.tipo();
      const n = this.nome();
      this.esperar('in');
      const iteravel = this.expressao();
      this.esperar(')');
      const corpo = this.instrucao();
      return { k: 'paraEm', mod, tipo, nome: n.v, posNome: n.ini, iteravel, corpo, ini, fim: this.anterior().fim };
    }
    let init: Instr | undefined;
    if (!this.ehSinal(';')) {
      if (this.ehDeclaracaoLocal()) init = this.declaracaoDeVariavel(false);
      else {
        const i0 = this.atual.ini;
        const e = this.expressao();
        init = { k: 'expr', e, ini: i0, fim: this.anterior().fim };
      }
    }
    this.esperar(';');
    let cond: Expr | undefined;
    if (!this.ehSinal(';')) cond = this.expressao();
    this.esperar(';');
    const passos: Expr[] = [];
    if (!this.ehSinal(')')) {
      do passos.push(this.expressao()); while (this.aceitar(','));
    }
    this.esperar(')');
    const corpo = this.instrucao();
    return { k: 'para', init, cond, passos, corpo, ini, fim: this.anterior().fim };
  }

  private tente(): Instr {
    const ini = this.avancar().ini;
    const b = this.bloco();
    const corpo: Instr = { k: 'bloco', corpo: b.corpo, ini: ini + 3, fim: b.fim };
    const capturas: Captura[] = [];
    while (this.eh('on') || this.eh('catch')) {
      const ci = this.atual.ini;
      let tipo: TipoEscrito | undefined;
      if (this.aceitar('on')) tipo = this.tipo();
      let erro: string | undefined;
      let pilha: string | undefined;
      if (this.aceitar('catch')) {
        this.esperar('(');
        erro = this.nome().v;
        if (this.aceitar(',')) pilha = this.nome().v;
        this.esperar(')');
      }
      const cb = this.bloco();
      capturas.push({ tipo, erro, pilha, corpo: { k: 'bloco', corpo: cb.corpo, ini: ci, fim: cb.fim }, ini: ci, fim: cb.fim });
    }
    let finalmente: Instr | undefined;
    if (this.aceitar('finally')) {
      const fi = this.anterior().ini;
      const fb = this.bloco();
      finalmente = { k: 'bloco', corpo: fb.corpo, ini: fi, fim: fb.fim };
    }
    if (!capturas.length && !finalmente) throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, 'A try block must be followed by an \'on\', \'catch\', or \'finally\' clause.');
    return { k: 'tente', corpo, capturas, finalmente, ini, fim: this.anterior().fim };
  }

  private escolha(): Instr {
    const ini = this.avancar().ini;
    this.esperar('(');
    const e = this.expressao();
    this.esperar(')');
    this.esperar('{');
    const casos: { valores: Expr[]; corpo: Instr[] }[] = [];
    while (!this.ehSinal('}')) {
      const valores: Expr[] = [];
      let padrao = false;
      while (this.eh('case') || this.eh('default')) {
        if (this.aceitar('default')) { padrao = true; this.esperar(':'); continue; }
        this.avancar();
        valores.push(this.expressao());
        if (this.eh('when') || this.ehSinal('||')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'padrão (pattern) no case');
        this.esperar(':');
      }
      if (!valores.length && !padrao) throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, `Expected 'case' before this.`);
      const corpo: Instr[] = [];
      while (!this.eh('case') && !this.eh('default') && !this.ehSinal('}')) corpo.push(this.instrucao());
      casos.push({ valores: padrao ? [] : valores, corpo });
    }
    this.avancar();
    return { k: 'escolha', e, casos, ini, fim: this.anterior().fim };
  }

  /* ── Expressões ────────────────────────────────────────────────────── */

  expressao(): Expr {
    const e = this.semCascata();
    if (this.ehSinal('..') || this.ehSinal('?..')) {
      if (this.ehSinal('?..')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'cascata com ?..');
      const secoes: Expr[] = [];
      while (this.ehSinal('..')) {
        this.avancar();
        const si = this.atual.ini;
        let s: Expr;
        if (this.ehSinal('[')) {
          this.avancar();
          const indice = this.expressao();
          this.esperar(']');
          s = { k: 'indice', alvo: { k: 'alvoDaCascata', ini: si, fim: si }, indice, ini: si, fim: this.anterior().fim };
        } else {
          const n = this.nome();
          s = { k: 'membro', alvo: { k: 'alvoDaCascata', ini: si, fim: si }, nome: n.v, opcional: false, posNome: n.ini, ini: si, fim: n.fim };
        }
        s = this.seletores(s);
        if (this.atual.t === 'sinal' && OPS_DE_ATRIBUICAO.has(this.atual.v)) {
          const op = this.avancar();
          const valor = this.semCascata();
          s = { k: 'atribuicao', op: op.v, alvo: s, valor, posOp: op.ini, ini: si, fim: valor.fim };
        }
        secoes.push(s);
      }
      return { k: 'cascata', alvo: e, secoes, ini: e.ini, fim: this.anterior().fim };
    }
    return e;
  }

  private semCascata(): Expr {
    if (this.eh('throw')) {
      const ini = this.avancar().ini;
      const e = this.semCascata();
      return { k: 'lance', e, ini, fim: e.fim };
    }
    const alvo = this.condicional();
    if (this.atual.t === 'sinal' && OPS_DE_ATRIBUICAO.has(this.atual.v)) {
      if (!['nome', 'membro', 'indice'].includes(alvo.k)) {
        throw new ErroDeSintaxe(alvo.ini, alvo.fim, 'Can\'t assign to this.');
      }
      const op = this.avancar();
      const valor = this.semCascata();
      return { k: 'atribuicao', op: op.v, alvo, valor, posOp: op.ini, ini: alvo.ini, fim: valor.fim };
    }
    return alvo;
  }

  private condicional(): Expr {
    const c = this.seNulo();
    if (this.ehSinal('?')) {
      this.avancar();
      const s = this.semCascata();
      this.esperar(':');
      const n = this.semCascata();
      return { k: 'condicional', c, s, n, ini: c.ini, fim: n.fim };
    }
    return c;
  }

  private seNulo(): Expr {
    let a = this.ou();
    while (this.ehSinal('??')) {
      const op = this.avancar();
      const b = this.ou();
      a = { k: 'logico', op: '??', a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    return a;
  }

  private ou(): Expr {
    let a = this.e();
    while (this.ehSinal('||')) {
      const op = this.avancar();
      const b = this.e();
      a = { k: 'logico', op: '||', a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    return a;
  }

  private e(): Expr {
    let a = this.igualdade();
    while (this.ehSinal('&&')) {
      const op = this.avancar();
      const b = this.igualdade();
      a = { k: 'logico', op: '&&', a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    return a;
  }

  private igualdade(): Expr {
    const a = this.relacional();
    if (this.ehSinal('==') || this.ehSinal('!=')) {
      const op = this.avancar();
      const b = this.relacional();
      return { k: 'binario', op: op.v, a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    return a;
  }

  private relacional(): Expr {
    const a = this.bitOu();
    if (this.ehSinal('<') || this.ehSinal('>') || this.ehSinal('<=') || this.ehSinal('>=')) {
      const op = this.avancar();
      const b = this.bitOu();
      return { k: 'binario', op: op.v, a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    if (this.eh('is')) {
      this.avancar();
      const negado = this.aceitar('!');
      const tipo = this.tipo();
      return { k: 'eh', e: a, tipo, negado, ini: a.ini, fim: tipo.fim };
    }
    if (this.eh('as')) {
      this.avancar();
      const tipo = this.tipo();
      return { k: 'como', e: a, tipo, ini: a.ini, fim: tipo.fim };
    }
    return a;
  }

  private bitOu(): Expr { return this.binarioEsq(['|'], () => this.bitXou()); }
  private bitXou(): Expr { return this.binarioEsq(['^'], () => this.bitE()); }
  private bitE(): Expr { return this.binarioEsq(['&'], () => this.deslocamento()); }

  private deslocamento(): Expr {
    let a = this.aditivo();
    for (;;) {
      if (this.ehSinal('<<')) {
        const op = this.avancar();
        const b = this.aditivo();
        a = { k: 'binario', op: '<<', a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
        continue;
      }
      /* `>>` chega como `>` `>` colados, por causa dos tipos genéricos. */
      if ((this.ehSinal('>') && this.ehSinal('>', 1) && this.olhar(1).ini === this.atual.fim) || this.ehSinal('>>')) {
        const op = this.avancar();
        if (op.v === '>') this.avancar();
        const b = this.aditivo();
        a = { k: 'binario', op: '>>', a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
        continue;
      }
      return a;
    }
  }

  private aditivo(): Expr { return this.binarioEsq(['+', '-'], () => this.multiplicativo()); }
  private multiplicativo(): Expr { return this.binarioEsq(['*', '/', '%', '~/'], () => this.unario()); }

  private binarioEsq(ops: string[], proximo: () => Expr): Expr {
    let a = proximo();
    while (this.atual.t === 'sinal' && ops.includes(this.atual.v)) {
      const op = this.avancar();
      const b = proximo();
      a = { k: 'binario', op: op.v, a, b, posOp: op.ini, ini: a.ini, fim: b.fim };
    }
    return a;
  }

  private unario(): Expr {
    const ini = this.atual.ini;
    if (this.ehSinal('-') || this.ehSinal('!') || this.ehSinal('~')) {
      const op = this.avancar().v as '-' | '!' | '~';
      const e = this.unario();
      /* `-5` é um número negativo, e não o 5 com um menos na frente: é o que
         deixa `-9223372036854775808` caber num int. */
      if (op === '-' && e.k === 'int' && e.ini === this.pecas[this.p - 1].ini) {
        return { k: 'int', v: -e.v, texto: '-' + e.texto, ini, fim: e.fim };
      }
      return { k: 'unario', op, e, ini, fim: e.fim };
    }
    if (this.ehSinal('++') || this.ehSinal('--')) {
      const op = this.avancar().v as '++' | '--';
      const e = this.unario();
      return { k: 'prefixo', op, e, ini, fim: e.fim };
    }
    if (this.eh('await')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'await');
    return this.seletores(this.primario());
  }

  private seletores(e: Expr): Expr {
    for (;;) {
      if (this.ehSinal('.') || this.ehSinal('?.')) {
        const op = this.avancar();
        const n = this.nome();
        e = { k: 'membro', alvo: e, nome: n.v, opcional: op.v === '?.', posNome: n.ini, ini: e.ini, fim: n.fim };
        continue;
      }
      if (this.ehSinal('(')) {
        const posAbre = this.atual.ini;
        const args = this.argumentos();
        e = { k: 'chamada', alvo: e, args, posAbre, ini: e.ini, fim: this.anterior().fim };
        continue;
      }
      if (this.ehSinal('[')) {
        this.avancar();
        const indice = this.expressao();
        this.esperar(']');
        e = { k: 'indice', alvo: e, indice, ini: e.ini, fim: this.anterior().fim };
        continue;
      }
      if (this.ehSinal('!')) {
        this.avancar();
        e = { k: 'posfixo', op: '!', e, ini: e.ini, fim: this.anterior().fim };
        continue;
      }
      if (this.ehSinal('++') || this.ehSinal('--')) {
        const op = this.avancar().v as '++' | '--';
        e = { k: 'posfixo', op, e, ini: e.ini, fim: this.anterior().fim };
        continue;
      }
      if (this.ehSinal('<') && e.k === 'nome') {
        /* `List<int>.filled(...)` ou `Mapa<String, int>()` */
        const fimDoTipo = this.tentarTipo(this.p - 1);
        if (fimDoTipo > this.p && (this.pecas[fimDoTipo]?.v === '(' || this.pecas[fimDoTipo]?.v === '.')) {
          this.avancar();
          const tipoArgs = [this.tipo()];
          while (this.aceitar(',')) tipoArgs.push(this.tipo());
          this.fecharAngulo();
          if (this.ehSinal('.')) {
            this.avancar();
            const n = this.nome();
            const membro: Expr = { k: 'membro', alvo: e, nome: n.v, opcional: false, posNome: n.ini, ini: e.ini, fim: n.fim };
            const posAbre = this.atual.ini;
            const args = this.argumentos();
            e = { k: 'chamada', alvo: membro, args, tipoArgs, posAbre, ini: e.ini, fim: this.anterior().fim };
          } else {
            const posAbre = this.atual.ini;
            const args = this.argumentos();
            e = { k: 'chamada', alvo: e, args, tipoArgs, posAbre, ini: e.ini, fim: this.anterior().fim };
          }
          continue;
        }
      }
      return e;
    }
  }

  private argumentos(): Arg[] {
    this.esperar('(');
    const args: Arg[] = [];
    while (!this.ehSinal(')')) {
      const ini = this.atual.ini;
      if (this.ehNome() && this.ehSinal(':', 1)) {
        const nome = this.avancar().v;
        this.avancar();
        const e = this.expressao();
        args.push({ nome, e, ini, fim: e.fim });
      } else {
        const e = this.expressao();
        args.push({ e, ini, fim: e.fim });
      }
      if (!this.aceitar(',')) break;
    }
    this.esperar(')');
    return args;
  }

  private primario(): Expr {
    const x = this.atual;
    const ini = x.ini;
    if (x.t === 'int') {
      this.avancar();
      const limpo = x.v.replace(/_/g, '');
      return { k: 'int', v: BigInt(limpo), texto: x.v, ini, fim: x.fim };
    }
    if (x.t === 'double') { this.avancar(); return { k: 'double', v: Number(x.v.replace(/_/g, '')), ini, fim: x.fim }; }
    if (x.t === 'texto') return this.textos();
    if (x.t === 'chave') {
      if (x.v === 'true' || x.v === 'false') { this.avancar(); return { k: 'bool', v: x.v === 'true', ini, fim: x.fim }; }
      if (x.v === 'null') { this.avancar(); return { k: 'null', ini, fim: x.fim }; }
      if (x.v === 'this') { this.avancar(); return { k: 'this', ini, fim: x.fim }; }
      if (x.v === 'super') { this.avancar(); return { k: 'super', ini, fim: x.fim }; }
      if (x.v === 'new') { this.avancar(); return this.primario(); }
      if (x.v === 'const') {
        this.avancar();
        return this.primario();
      }
    }
    if (x.t === 'sinal') {
      if (x.v === '(') {
        if (this.pareceFuncao(this.p)) {
          const params = this.parametros();
          const corpo = this.ehSinal('=>') ? this.corpoDeSeta() : this.corpo();
          return { k: 'funcao', params, corpo, ini, fim: corpo.fim };
        }
        if (this.pareceSeta(this.p)) {
          const params = this.parametros();
          const corpo = this.corpoDeSeta();
          return { k: 'funcao', params, corpo, ini, fim: corpo.fim };
        }
        this.avancar();
        const e = this.expressao();
        this.esperar(')');
        return { ...e, ini, fim: this.anterior().fim };
      }
      if (x.v === '[') return this.lista(undefined, ini);
      if (x.v === '{') return this.chaves(undefined, ini);
      if (x.v === '<') {
        this.avancar();
        const tipos = [this.tipo()];
        while (this.aceitar(',')) tipos.push(this.tipo());
        this.fecharAngulo();
        if (this.ehSinal('[')) {
          if (tipos.length !== 1) throw new ErroDeSintaxe(ini, this.atual.fim, 'List literal requires exactly one type argument.');
          return this.lista(tipos[0], ini);
        }
        if (this.ehSinal('{')) return this.chaves(tipos, ini);
        throw new ErroDeSintaxe(this.atual.ini, this.atual.fim, `Expected '[' before this.`);
      }
    }
    if (this.ehNome()) {
      this.avancar();
      return { k: 'nome', nome: x.v, ini, fim: x.fim };
    }
    if (x.t === 'fim') throw new ErroDeSintaxe(x.ini, x.fim, 'Unexpected end of file.');
    throw new ErroDeSintaxe(x.ini, x.fim, `Expected an identifier, but got '${this.descrever(x)}'.`);
  }

  /*
    Uma função anônima de seta: `(n) => n * 2`. O `pareceFuncao` só reconhece
    o `(params) {` e o `(params) =>` olhando o que vem depois do `)`; este é
    o mesmo caso, separado só para ler o corpo de seta sem exigir `;`.
  */
  private pareceSeta(abre: number): boolean {
    let nivel = 0;
    for (let k = abre; k < this.pecas.length; k++) {
      const y = this.pecas[k];
      if (y.t === 'sinal' && y.v === '(') nivel++;
      if (y.t === 'sinal' && y.v === ')') {
        nivel--;
        if (nivel === 0) return this.pecas[k + 1]?.t === 'sinal' && this.pecas[k + 1].v === '=>';
      }
    }
    return false;
  }

  private corpoDeSeta(): Corpo {
    const ini = this.esperar('=>').ini;
    const e = this.semCascata();
    return { k: 'seta', e, ini, fim: e.fim };
  }

  private textos(): Expr {
    const ini = this.atual.ini;
    const partes: (string | Expr)[] = [];
    while (this.atual.t === 'texto') {
      const x = this.avancar();
      if (!x.partes) { partes.push(x.v); continue; }
      for (const parte of x.partes) {
        if (typeof parte === 'string') partes.push(parte);
        else {
          const sub = new Leitor(parte, this.nomeDoArquivo, this.fonte);
          const e = sub.expressao();
          if (sub.atual.t !== 'fim') throw new ErroDeSintaxe(sub.atual.ini, sub.atual.fim, `Expected '}' before this.`);
          partes.push(e);
        }
      }
    }
    return { k: 'texto', partes, ini, fim: this.anterior().fim };
  }

  private lista(tipo: TipoEscrito | undefined, ini: number): Expr {
    this.esperar('[');
    const itens: Item[] = [];
    while (!this.ehSinal(']')) {
      itens.push(this.item(false));
      if (!this.aceitar(',')) break;
    }
    this.esperar(']');
    return { k: 'lista', tipo, itens, ini, fim: this.anterior().fim };
  }

  private chaves(tipos: TipoEscrito[] | undefined, ini: number): Expr {
    this.esperar('{');
    const itens: Item[] = [];
    while (!this.ehSinal('}')) {
      itens.push(this.item(true));
      if (!this.aceitar(',')) break;
    }
    this.esperar('}');
    return { k: 'chaves', tipos, itens, ini, fim: this.anterior().fim };
  }

  private item(podePar: boolean): Item {
    const ini = this.atual.ini;
    if (this.ehSinal('...') || this.ehSinal('...?')) {
      const opcional = this.avancar().v === '...?';
      const e = this.semCascata();
      return { k: 'espalhar', e, opcional, ini, fim: e.fim };
    }
    if (this.eh('if')) {
      this.avancar();
      this.esperar('(');
      const c = this.expressao();
      this.esperar(')');
      const entao = this.item(podePar);
      let senao: Item | undefined;
      if (this.aceitar('else')) senao = this.item(podePar);
      return { k: 'se', c, entao, senao, ini, fim: this.anterior().fim };
    }
    if (this.eh('for')) {
      this.avancar();
      this.esperar('(');
      let mod: 'var' | 'final' | null = null;
      if (this.eh('var') || this.eh('final')) mod = this.avancar().v as 'var' | 'final';
      let tipo: TipoEscrito | undefined;
      if (!(this.ehNome() && this.eh('in', 1))) tipo = this.tipo();
      const nome = this.nome().v;
      if (!this.eh('in')) throw new NaoSuportado(this.atual.ini, this.atual.fim, 'for clássico dentro de uma coleção');
      this.avancar();
      const iteravel = this.expressao();
      this.esperar(')');
      const corpo = this.item(podePar);
      return { k: 'para', mod, tipo, nome, iteravel, corpo, ini, fim: this.anterior().fim };
    }
    const e = this.expressao();
    if (podePar && this.aceitar(':')) {
      const valor = this.expressao();
      return { k: 'par', chave: e, valor, ini, fim: valor.fim };
    }
    return { k: 'item', e, ini, fim: e.fim };
  }
}
