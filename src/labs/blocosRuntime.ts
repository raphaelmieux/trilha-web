import {
  PALCO, ehChapeu, type Bloco, type Condicao, type Personagem, type Projeto, type Tecla,
} from './blocos';

/**
 * O interpretador dos blocos: o que faz o palco andar.
 *
 * ── Uma pilha é uma corrotina ────────────────────────────────────────────
 * Cada script roda um pouco a cada quadro e para onde estava, exatamente como
 * no Scratch — é o que permite dois personagens se moverem ao mesmo tempo sem
 * um esperar o outro terminar. Em JavaScript isso é um gerador: `yield` marca
 * "acabou o meu tempo neste quadro", e a próxima chamada continua da linha
 * seguinte. Sem gerador seria preciso guardar à mão uma pilha de posições
 * dentro de cada laço aninhado, que é a mesma coisa escrita de um jeito que
 * ninguém depois consegue ler.
 *
 * ── O orçamento existe porque `sempre` existe ────────────────────────────
 * Um `sempre` com o corpo vazio, ou um `repita 100000` sem nada dentro, giram
 * para sempre. O `yield` no fim de cada volta segura os dois — e ainda assim há
 * um teto de passos por quadro, porque o desbravador vai montar coisas que não
 * previmos e travar a aba dele seria o pior resultado possível.
 *
 * ── Sem aleatório, sem relógio de parede ─────────────────────────────────
 * Tudo o que o palco faz é função do estado e do número do quadro. Isso é o que
 * torna o motor testável sem tela: rodar 60 quadros dá sempre o mesmo palco.
 */

/** Quantos passos de bloco um quadro executa, no máximo, por pilha. */
const PASSOS_POR_QUADRO = 200;

/** Quadros por segundo do palco. `espere 1 segundos` são 30 quadros. */
export const QUADROS_POR_SEGUNDO = 30;

export interface EstadoDoPersonagem {
  id: string;
  nome: string;
  x: number;
  y: number;
  traje: number;
  trajes: string[];
  /** O balão de fala, enquanto houver. */
  fala: string;
}

export interface EstadoDoPalco {
  personagens: EstadoDoPersonagem[];
  variaveis: Record<string, number>;
  /** Quantas vezes um som foi tocado — o palco não emite áudio, ele conta. */
  sons: number;
  quadro: number;
  rodando: boolean;
}

/** O que o motor precisa saber do mundo de fora. */
export interface Entrada {
  /** As teclas seguradas agora. */
  teclas: Set<Tecla>;
  /** O personagem clicado neste quadro, se houve um. */
  clicado?: string;
}

/* ────────────────────────────────────────────────────────────────────────
   O estado inicial
   ──────────────────────────────────────────────────────────────────────── */

export function estadoInicial(projeto: Projeto): EstadoDoPalco {
  return {
    personagens: projeto.personagens.map(p => ({
      id: p.id, nome: p.nome, x: p.x, y: p.y, traje: 0, trajes: p.trajes, fala: '',
    })),
    variaveis: Object.fromEntries(projeto.variaveis.map(v => [v.nome, v.valor])),
    sons: 0,
    quadro: 0,
    rodando: false,
  };
}

/* ────────────────────────────────────────────────────────────────────────
   A execução
   ──────────────────────────────────────────────────────────────────────── */

/** O que uma pilha em andamento precisa carregar. */
interface Tarefa {
  personagem: string;
  pilha: string;
  passo: Generator<void, void, void>;
  pronta: boolean;
}

interface Contexto {
  estado: EstadoDoPalco;
  entrada: Entrada;
  eu: string;
  /** Ligado por `pare tudo`, encerra todas as pilhas no fim do quadro. */
  parar: () => void;
}

const acho = (e: EstadoDoPalco, id: string) => e.personagens.find(p => p.id === id);

/** Encosta um personagem no outro? Caixas de 40×40, que é o tamanho do desenho. */
function tocando(e: EstadoDoPalco, meuId: string, quem: string): boolean {
  const eu = acho(e, meuId);
  if (!eu) return false;

  if (quem === 'borda') {
    return Math.abs(eu.x) >= PALCO.largura / 2 - 20 || Math.abs(eu.y) >= PALCO.altura / 2 - 20;
  }
  const outro = acho(e, quem);
  if (!outro) return false;
  return Math.abs(eu.x - outro.x) < 40 && Math.abs(eu.y - outro.y) < 40;
}

function avalia(c: Condicao, ctx: Contexto): boolean {
  switch (c.tipo) {
    case 'tocando': return tocando(ctx.estado, ctx.eu, c.quem);
    case 'teclaPressionada': return ctx.entrada.teclas.has(c.tecla);
    case 'variavelMaiorQue': return (ctx.estado.variaveis[c.nome] ?? 0) > c.valor;
  }
}

/** Mantém o personagem dentro do palco, como o Scratch faz. */
const dentro = (v: number, limite: number) => Math.max(-limite / 2, Math.min(limite / 2, v));

/**
 * Executa uma lista de blocos, um `yield` por passo.
 *
 * O `yield` de cada bloco é o que dá o ritmo do palco: um `mova 10 passos`
 * dentro de um `sempre` anda dez pixels por quadro, e não some da tela num
 * instante.
 */
function* executar(blocos: Bloco[], ctx: Contexto): Generator<void, void, void> {
  for (const b of blocos) {
    const eu = acho(ctx.estado, ctx.eu);
    if (!eu) return;

    switch (b.tipo) {
      /* Os chapéus já foram lidos por quem montou a tarefa. */
      case 'quandoBandeira': case 'quandoTecla': case 'quandoClicado':
        break;

      case 'mover':
        eu.x = dentro(eu.x + b.passos, PALCO.largura);
        yield; break;

      case 'subir':
        /* Sem direção no modelo: este bloco move na vertical, que é o que o
           desbravador precisa para um jogo de subir e descer. Guardar ângulo
           pediria seno e cosseno numa vereda que ainda não viu conta. */
        eu.y = dentro(eu.y + b.passos, PALCO.altura);
        yield; break;

      case 'irPara':
        eu.x = dentro(b.x, PALCO.largura);
        eu.y = dentro(b.y, PALCO.altura);
        yield; break;

      case 'proximoTraje':
        eu.traje = eu.trajes.length ? (eu.traje + 1) % eu.trajes.length : 0;
        yield; break;

      case 'diga':
        eu.fala = b.texto;
        yield; break;

      case 'toqueSom':
        ctx.estado.sons += 1;
        yield; break;

      case 'espere':
        for (let i = 0; i < Math.max(1, Math.round(b.segundos * QUADROS_POR_SEGUNDO)); i++) yield;
        break;

      case 'repita':
        for (let i = 0; i < Math.max(0, b.vezes); i++) {
          yield* executar(b.corpo, ctx);
          yield;
        }
        break;

      case 'sempre':
        /* Sem saída: quem para é `pare tudo`, a bandeira vermelha, ou o fim do
           laboratório. É o comportamento do Scratch, e o `yield` no fim da
           volta é o que impede a aba de travar com o corpo vazio. */
        for (;;) {
          yield* executar(b.corpo, ctx);
          yield;
        }

      case 'se':
        if (avalia(b.condicao, ctx)) yield* executar(b.corpo, ctx);
        yield; break;

      case 'definaVariavel':
        ctx.estado.variaveis[b.nome] = b.valor;
        yield; break;

      case 'mudeVariavel':
        ctx.estado.variaveis[b.nome] = (ctx.estado.variaveis[b.nome] ?? 0) + b.por;
        yield; break;

      case 'pareTudo':
        ctx.parar();
        return;
    }
  }
}

/**
 * O palco: cria as tarefas quando um evento acontece e avança um quadro por vez.
 *
 * É uma classe porque há estado que precisa sobreviver entre quadros — as
 * tarefas em andamento —, e escondê-lo atrás de um objeto é mais honesto do que
 * devolvê-lo ao chamador para ele guardar sem saber o que é.
 */
export class Palco {
  estado: EstadoDoPalco;
  private tarefas: Tarefa[] = [];
  private pedidoDeParar = false;

  constructor(private projeto: Projeto) {
    this.estado = estadoInicial(projeto);
  }

  /** Volta ao começo: posições, variáveis e nenhuma pilha em andamento. */
  reiniciar() {
    this.estado = estadoInicial(this.projeto);
    this.tarefas = [];
    this.pedidoDeParar = false;
  }

  parar() {
    this.tarefas = [];
    this.estado.rodando = false;
  }

  /** A bandeira verde: reinicia e dispara todas as pilhas de bandeira. */
  bandeira(entrada: Entrada = { teclas: new Set() }) {
    this.reiniciar();
    this.estado.rodando = true;
    this.dispararSe(b => b.tipo === 'quandoBandeira', entrada);
  }

  /** Um evento de tecla ou de clique, enquanto o palco roda. */
  private dispararSe(quando: (b: Bloco) => boolean, entrada: Entrada) {
    for (const p of this.projeto.personagens) {
      for (const pilha of p.pilhas) {
        const chapeu = pilha.blocos[0];
        if (!chapeu || !ehChapeu(chapeu) || !quando(chapeu)) continue;
        /* Uma pilha não roda duas vezes ao mesmo tempo: o Scratch reinicia a
           que já estava rodando, e é o que se espera de segurar a seta. */
        this.tarefas = this.tarefas.filter(t => t.pilha !== pilha.id);
        this.tarefas.push({
          personagem: p.id,
          pilha: pilha.id,
          passo: executar(pilha.blocos, this.contexto(p, entrada)),
          pronta: false,
        });
      }
    }
  }

  private contexto(p: Personagem, entrada: Entrada): Contexto {
    return {
      estado: this.estado,
      entrada,
      eu: p.id,
      parar: () => { this.pedidoDeParar = true; },
    };
  }

  /**
   * Avança um quadro.
   *
   * Os eventos de tecla e de clique são lidos aqui, e não fora, porque uma
   * pilha disparada no meio do quadro precisa entrar na mesma lista que as
   * outras — senão ela só começaria no quadro seguinte, e segurar a seta
   * ficaria com um atraso perceptível.
   */
  quadro(entrada: Entrada = { teclas: new Set() }) {
    if (!this.estado.rodando) return;

    for (const t of this.tarefas) t.pronta = false;

    if (entrada.teclas.size > 0) {
      this.dispararSe(b => b.tipo === 'quandoTecla' && entrada.teclas.has(b.tecla), entrada);
    }
    if (entrada.clicado) {
      const quem = entrada.clicado;
      for (const p of this.projeto.personagens) {
        if (p.id !== quem) continue;
        for (const pilha of p.pilhas) {
          const chapeu = pilha.blocos[0];
          if (chapeu?.tipo !== 'quandoClicado') continue;
          this.tarefas = this.tarefas.filter(t => t.pilha !== pilha.id);
          this.tarefas.push({
            personagem: p.id, pilha: pilha.id,
            passo: executar(pilha.blocos, this.contexto(p, entrada)), pronta: false,
          });
        }
      }
    }

    /* Cada tarefa anda até dizer "acabou meu tempo" ou gastar o orçamento. */
    for (const t of this.tarefas) {
      for (let i = 0; i < PASSOS_POR_QUADRO; i++) {
        const r = t.passo.next();
        if (r.done) { t.pronta = true; break; }
        break; // um `yield` é um passo de quadro
      }
      if (this.pedidoDeParar) break;
    }

    this.tarefas = this.tarefas.filter(t => !t.pronta);
    this.estado.quadro += 1;

    if (this.pedidoDeParar) {
      this.pedidoDeParar = false;
      this.parar();
    }
  }

  /** Roda `n` quadros de uma vez. É como o teste observa o palco. */
  rodar(n: number, entrada: Entrada = { teclas: new Set() }) {
    for (let i = 0; i < n && this.estado.rodando; i++) this.quadro(entrada);
  }
}
