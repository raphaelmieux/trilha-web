import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type Alinhamento, type Direta, type Doc, type Estilo, type ModoDeCaixa, type Paragrafo, type Realce,
  type TipoDeLista, type Trecho,
  aplicarCaixa, ehParagrafo,
} from './documento';
import {
  type Edicao, type Marca, type QuemEdita, type Selecao,
  alternarMarca, alternarPosicao, aplicarEstilo, transformarSelecao, definirCor, definirFonte, definirRealce, definirTamanho,
  limparFormatacao, limparTudo, mudarTamanhoEmDegrau, apagar, apagarSelecao, formatoDaSelecao, inserirTexto, mesmaSelecao,
  palavraEmVolta, quebraDeLinha, quebraDePagina, quebrarParagrafo, recolhida, selecaoValida,
  selecionarTudo, tamanhoDoParagrafo, unidadesDoTrecho,
  alinhar, alternarLista, colarFragmento, definirEntrelinha, formatoDoParagrafoDaSelecao,
  fragmentoDaSelecao, mudarRecuo, tabular, textoDaSelecao,
} from './edicao';

/**
 * O que a folha manda quando alguém mexe nela com o teclado.
 *
 * `alvo` é a seleção que o próprio navegador diz que a tecla vai alcançar —
 * a da composição de um teclado de celular, ou a da correção automática. Sem
 * ela, vale a seleção de agora.
 */
export type ComandoDeTexto =
  | { tipo: 'inserir'; texto: string; alvo?: Selecao }
  | { tipo: 'apagar'; direcao: 'tras' | 'frente'; palavra?: boolean; alvo?: Selecao }
  | { tipo: 'paragrafo' }
  | { tipo: 'quebra-de-linha' }
  | { tipo: 'quebra-de-pagina' }
  | { tipo: 'marca'; marca: Marca }
  | { tipo: 'formatar'; formatacao: Formatacao }
  | { tipo: 'paragrafar'; formatacao: FormatacaoDeParagrafo }
  | { tipo: 'tab'; voltar: boolean }
  | { tipo: 'copiar' }
  | { tipo: 'recortar' }
  | { tipo: 'colar'; texto?: string }
  | { tipo: 'desfazer' }
  | { tipo: 'refazer' }
  | { tipo: 'selecionar-tudo' };

/** O que os botões do grupo Parágrafo fazem. */
export type FormatacaoDeParagrafo =
  | { tipo: 'alinhar'; alinhamento: Alinhamento }
  | { tipo: 'entrelinha'; valor: number }
  | { tipo: 'lista'; lista: TipoDeLista }
  | { tipo: 'recuo'; delta: 1 | -1 };

/** O que os outros botões do grupo Fonte fazem. */
export type Formatacao =
  | { tipo: 'fonte'; nome: string }
  | { tipo: 'tamanho'; pt: number }
  | { tipo: 'cor'; cor: string }
  | { tipo: 'crescer' }
  | { tipo: 'encolher' }
  | { tipo: 'limpar' }
  | { tipo: 'limpar-caractere' }
  | { tipo: 'realce'; realce: Realce }
  | { tipo: 'subscrito' }
  | { tipo: 'sobrescrito' }
  | { tipo: 'caixa'; modo: ModoDeCaixa }
  | { tipo: 'enfase' };

/** O que a folha precisa receber para ser editável. */
export interface EdicaoDaFolha {
  selecao: Selecao | null;
  aoSelecionar: (s: Selecao | null) => void;
  aoComando: (c: ComandoDeTexto) => void;
  /** A folha avisa onde está a raiz editável, para o gancho devolver o foco. */
  raiz: React.MutableRefObject<HTMLElement | null>;
  /**
   * De que programa são os atalhos. O Word em português usa Ctrl+N, Ctrl+I e
   * Ctrl+S; o editor de navegador não traduz nada e usa Ctrl+B, Ctrl+I e
   * Ctrl+U em qualquer língua. Ensinar o atalho de um no outro seria ensinar
   * um gesto que não funciona lá fora.
   */
  atalhos: 'word' | 'navegador';
}

interface Passo<S extends string> {
  doc: Doc<S>;
  selecao: Selecao | null;
}

/**
 * A edição de um documento de Word, do jeito que o Word edita.
 *
 * ── O que mora aqui e o que mora no laboratório ──────────────────────────
 * Aqui mora o que é do **programa**: onde está o cursor, o que cada tecla faz,
 * o negrito apertado com o cursor parado, e o Ctrl+Z. O laboratório continua
 * dono do documento — ele o guarda, porque é ele que confere as metas — e
 * recebe cada mudança por `aoMudar`. Os comandos da faixa que são do exercício
 * (aceitar uma marca, gerar o sumário) passam por `mudar`, e com isso entram
 * no Ctrl+Z junto com o que foi digitado: no Word desfazer não distingue
 * botão de tecla.
 *
 * ── Digitar é um passo só de desfazer ────────────────────────────────────
 * Cada letra é um comando, e um Ctrl+Z por letra faria desfazer uma palavra
 * custar dez toques. Letras seguidas no mesmo lugar se juntam num passo, como
 * no Word; qualquer outro comando, ou o cursor mudado de lugar, fecha o passo.
 */
export function useEdicaoDoWord<S extends string>(
  doc: Doc<S>,
  aoMudar: (d: Doc<S>) => void,
  opcoes: {
    quem?: QuemEdita;
    /** Para cada comando de teclado. Devolver `false` o recusa. */
    permitir?: (c: ComandoDeTexto, d: Doc<S>, s: Selecao | null) => boolean;
    atalhos?: 'word' | 'navegador';
  } = {},
) {
  const raiz = useRef<HTMLElement | null>(null);
  const [selecaoCrua, setSelecaoCrua] = useState<Selecao | null>(null);
  const [pendente, setPendente] = useState<Partial<Direta> | undefined>(undefined);
  /* As pilhas do Ctrl+Z moram em ref, e não em estado: desfazer mexe nas duas
     e no documento do laboratório de uma vez, e fazer isso dentro do
     atualizador de um `setState` é efeito colateral que o React pode rodar
     duas vezes. `contagem` só existe para a faixa redesenhar o botão. */
  const passado = useRef<Passo<S>[]>([]);
  const futuro = useRef<Passo<S>[]>([]);
  const [, setContagem] = useState(0);
  const digitando = useRef(false);
  /* A área de transferência do programa: o texto, para reconhecer o que volta
     no Ctrl+V, e os pedaços com a formatação, que é o que o Colar do Word
     cola. O texto que chega de fora — de outra janela — entra puro. */
  const transferencia = useRef<{ texto: string; fragmento: Trecho[][] } | null>(null);
  const [temTransferencia, setTemTransferencia] = useState(false);

  /* O documento pode mudar por baixo do cursor — um comando do laboratório
     que apaga o parágrafo em que ele estava. A seleção é sempre a de agora,
     trazida para dentro do documento como ele está. */
  const selecao = useMemo(() => selecaoValida(doc, selecaoCrua), [doc, selecaoCrua]);

  /* Os callbacks leem o estado mais novo por ref: a folha os chama de
     ouvintes nativos registrados uma vez só. */
  const atual = useRef({ doc, selecao, pendente, opcoes, aoMudar });
  atual.current = { doc, selecao, pendente, opcoes, aoMudar };

  const focar = useCallback(() => {
    const r = raiz.current;
    if (r && r.ownerDocument.activeElement !== r) r.focus({ preventScroll: true });
  }, []);

  /** Grava um documento novo e a seleção que vem com ele, guardando o passo. */
  const gravar = useCallback((novo: Doc<S>, novaSelecao: Selecao | null, juntarComODeAntes = false) => {
    const { doc: velho, selecao: selVelha, aoMudar: mudarNoLab } = atual.current;
    if (novo !== velho) {
      if (!juntarComODeAntes) passado.current = [...passado.current.slice(-99), { doc: velho, selecao: selVelha }];
      futuro.current = [];
      setContagem(n => n + 1);
      atual.current = { ...atual.current, doc: novo, selecao: novaSelecao };
      mudarNoLab(novo);
    }
    setSelecaoCrua(novaSelecao);
  }, []);

  const aoSelecionar = useCallback((s: Selecao | null) => {
    if (mesmaSelecao(atual.current.selecao, s)) return;
    digitando.current = false;
    setPendente(undefined);
    atual.current = { ...atual.current, selecao: s, pendente: undefined };
    setSelecaoCrua(s);
  }, []);

  const andarNaHistoria = useCallback((de: React.MutableRefObject<Passo<S>[]>, para: React.MutableRefObject<Passo<S>[]>) => {
    const ultimo = de.current[de.current.length - 1];
    if (!ultimo) return;
    const { doc: agora, selecao: selAgora, aoMudar: mudarNoLab } = atual.current;
    de.current = de.current.slice(0, -1);
    para.current = [...para.current, { doc: agora, selecao: selAgora }];
    digitando.current = false;
    setContagem(n => n + 1);
    atual.current = { ...atual.current, doc: ultimo.doc, selecao: ultimo.selecao };
    mudarNoLab(ultimo.doc);
    setSelecaoCrua(ultimo.selecao);
  }, []);

  const desfazer = useCallback(() => andarNaHistoria(passado, futuro), [andarNaHistoria]);
  const refazer = useCallback(() => andarNaHistoria(futuro, passado), [andarNaHistoria]);

  /**
   * Negrito, Itálico, Sublinhado — da faixa ou do teclado.
   *
   * Sem seleção, dentro de uma palavra, vale para a palavra inteira; num
   * espaço, vale para o que for digitado em seguida, e a tela não muda. É o
   * que o Word faz, e a segunda metade é a que ninguém conta: o botão acende
   * sem nada ficar em negrito.
   */
  const marcar = useCallback((m: Marca) => {
    const { doc: d, selecao: s, pendente: p } = atual.current;
    if (!s) return;
    digitando.current = false;
    if (recolhida(s)) {
      const palavra = palavraEmVolta(d, s.foco);
      if (palavra) {
        const r = alternarMarca(d, palavra, m);
        gravar(r.doc, s);
        return;
      }
      const agora = formatoDaSelecao(d, s, p)[m];
      setPendente({ ...(p ?? {}), [m]: !agora });
      return;
    }
    const r = alternarMarca(d, s, m);
    gravar(r.doc, r.selecao);
  }, [gravar]);

  /**
   * Os outros botões do grupo Fonte. Valem para a seleção; sem seleção, para
   * a palavra em volta do cursor; num espaço, ficam pendentes para o que for
   * digitado — os que o Word deixa pendentes, que são os de caractere.
   */
  const formatar = useCallback((f: Formatacao) => {
    const { doc: d, selecao: s, pendente: p } = atual.current;
    if (!s) return;
    digitando.current = false;
    let alvo: Selecao = s;
    if (recolhida(s)) {
      const palavra = palavraEmVolta(d, s.foco);
      if (f.tipo === 'limpar' || f.tipo === 'limpar-caractere') {
        /* Limpar com o cursor parado vale para o parágrafo inteiro. */
        const b = d.blocos.find(x => x.id === s.foco.bloco);
        if (!b || !ehParagrafo(b)) return;
        alvo = { ancora: { bloco: b.id, offset: 0 }, foco: { bloco: b.id, offset: tamanhoDoParagrafo(b) } };
      } else if (!palavra) {
        if (f.tipo === 'fonte') setPendente({ ...(p ?? {}), fonte: f.nome });
        if (f.tipo === 'tamanho') setPendente({ ...(p ?? {}), tamanho: f.pt });
        if (f.tipo === 'cor') setPendente({ ...(p ?? {}), cor: f.cor });
        return;
      } else {
        alvo = palavra;
      }
    }
    let r: Edicao<S>;
    switch (f.tipo) {
      case 'fonte': r = definirFonte(d, alvo, f.nome); break;
      case 'tamanho': r = definirTamanho(d, alvo, f.pt); break;
      case 'cor': r = definirCor(d, alvo, f.cor); break;
      case 'crescer': r = mudarTamanhoEmDegrau(d, alvo, true); break;
      case 'encolher': r = mudarTamanhoEmDegrau(d, alvo, false); break;
      case 'limpar': r = limparTudo(d, alvo); break;
      case 'limpar-caractere': r = limparFormatacao(d, alvo); break;
      case 'realce': r = definirRealce(d, alvo, f.realce); break;
      case 'subscrito': r = alternarPosicao(d, alvo, 'subscrito'); break;
      case 'sobrescrito': r = alternarPosicao(d, alvo, 'sobrescrito'); break;
      /* Maiúsculas e Minúsculas troca as letras de verdade, como no Word: o
         texto guardado muda, e não só a aparência. */
      case 'caixa': {
        const modo = f.modo;
        r = transformarSelecao(d, alvo, x => (x.campo ? x : { ...x, texto: aplicarCaixa(x.texto, modo) }));
        break;
      }
      /* Ênfase é estilo de caractere: liga se algum pedaço não tem. */
      case 'enfase': {
        const todos = paragrafosComTrechos(d, alvo).every(x => x.enfase);
        r = transformarSelecao(d, alvo, x => ({ ...x, enfase: !todos }));
        break;
      }
      default: {
        const naoTratado: never = f;
        throw new Error(`formatação não tratada: ${JSON.stringify(naoTratado)}`);
      }
    }
    gravar(r.doc, s);
  }, [gravar]);

  /** Um estilo da galeria: vale para todo parágrafo que a seleção toca. */
  const estilo = useCallback((e: Estilo) => {
    const { doc: d, selecao: s } = atual.current;
    if (!s) return false;
    digitando.current = false;
    gravar(aplicarEstilo(d, s, e).doc, s);
    return true;
  }, [gravar]);

  /**
   * Alinhamento, entrelinha, lista e recuo: valem para todo parágrafo que a
   * seleção toca, inteiro, e com o cursor parado valem para o parágrafo dele.
   * Não há pendente, porque não há o que esperar: o parágrafo já existe.
   */
  const paragrafar = useCallback((f: FormatacaoDeParagrafo) => {
    const { doc: d, selecao: s } = atual.current;
    if (!s) return;
    digitando.current = false;
    let r: Edicao<S>;
    switch (f.tipo) {
      case 'alinhar': r = alinhar(d, s, f.alinhamento); break;
      case 'entrelinha': r = definirEntrelinha(d, s, f.valor); break;
      case 'lista': r = alternarLista(d, s, f.lista); break;
      case 'recuo': r = mudarRecuo(d, s, f.delta); break;
      default: {
        const naoTratado: never = f;
        throw new Error(`formatação de parágrafo não tratada: ${JSON.stringify(naoTratado)}`);
      }
    }
    gravar(r.doc, s);
  }, [gravar]);

  /** Copiar: devolve o texto, para quem precisar pô-lo na área do sistema. */
  const copiar = useCallback((): string | null => {
    const { doc: d, selecao: s } = atual.current;
    if (!s || recolhida(s)) return null;
    const texto = textoDaSelecao(d, s);
    transferencia.current = { texto, fragmento: fragmentoDaSelecao(d, s) };
    setTemTransferencia(true);
    return texto;
  }, []);

  const executar = useCallback((c: ComandoDeTexto) => {
    const { doc: d, selecao: s, pendente: p, opcoes: o } = atual.current;
    if (o.permitir && !o.permitir(c, d, s)) return;
    if (c.tipo === 'desfazer') { desfazer(); return; }
    if (c.tipo === 'refazer') { refazer(); return; }
    if (c.tipo === 'selecionar-tudo') { setSelecaoCrua(selecionarTudo(d)); return; }
    if (c.tipo === 'marca') { marcar(c.marca); return; }
    if (c.tipo === 'formatar') { formatar(c.formatacao); return; }
    if (c.tipo === 'paragrafar') { paragrafar(c.formatacao); return; }
    if (c.tipo === 'copiar') { copiar(); return; }
    const alvo = ('alvo' in c && c.alvo) ? selecaoValida(d, c.alvo) : s;
    if (!alvo) return;
    const q = o.quem;
    let r: Edicao<S>;
    let juntar = false;
    switch (c.tipo) {
      case 'inserir':
        r = inserirTexto(d, alvo, c.texto, q, p);
        /* Continua o passo de desfazer se o cursor não pulou desde a última
           letra e se nada além de uma linha entrou. */
        juntar = digitando.current && recolhida(alvo) && !c.texto.includes('\n');
        digitando.current = !c.texto.includes('\n');
        break;
      case 'apagar':
        r = c.alvo && !recolhida(alvo) ? apagarSelecao(d, alvo, q) : apagar(d, alvo, c.direcao, q, c.palavra);
        digitando.current = false;
        break;
      case 'paragrafo': r = quebrarParagrafo(d, alvo, q); digitando.current = false; break;
      case 'quebra-de-linha': r = quebraDeLinha(d, alvo, q); digitando.current = false; break;
      case 'quebra-de-pagina': r = quebraDePagina(d, alvo, q); digitando.current = false; break;
      case 'tab': r = tabular(d, alvo, c.voltar, q); digitando.current = false; break;
      /* Recortar é copiar e apagar, no mesmo passo de desfazer. */
      case 'recortar': {
        if (recolhida(alvo)) return;
        copiar();
        r = apagarSelecao(d, alvo, q);
        digitando.current = false;
        break;
      }
      /* O que voltou é o que saiu daqui: cola com a formatação. O que veio de
         outra janela entra puro, herdando a de onde o cursor está. */
      case 'colar': {
        const t = transferencia.current;
        if (t && (c.texto === undefined || c.texto.replace(/\r\n?/g, '\n') === t.texto)) {
          r = colarFragmento(d, alvo, t.fragmento, q);
        } else if (c.texto) {
          r = inserirTexto(d, alvo, c.texto, q, p);
        } else return;
        digitando.current = false;
        break;
      }
      default: {
        const naoTratado: never = c;
        throw new Error(`comando não tratado: ${JSON.stringify(naoTratado)}`);
      }
    }
    gravar(r.doc, r.selecao, juntar);
    /* O pendente vale até o cursor andar; digitar o carrega junto. */
    if (c.tipo !== 'inserir') setPendente(undefined);
  }, [desfazer, refazer, marcar, formatar, paragrafar, copiar, gravar]);

  /**
   * Um comando do laboratório, que entra no Ctrl+Z como qualquer tecla.
   *
   * Recebe a seleção de agora — `null` quando ninguém pôs o cursor no
   * documento ainda — e devolve o documento novo, ou documento e seleção.
   */
  const mudar = useCallback((f: (d: Doc<S>, s: Selecao | null) => Doc<S> | Edicao<S>) => {
    const { doc: d, selecao: s } = atual.current;
    const r = f(d, s);
    digitando.current = false;
    if ('blocos' in r) gravar(r, s);
    else gravar(r.doc, r.selecao);
    focar();
  }, [gravar, focar]);

  /**
   * Outro documento abriu na mesma janela: as pilhas do Ctrl+Z e o cursor são
   * do anterior, e desfazer agora gravaria o texto de um arquivo no outro.
   */
  const esquecer = useCallback(() => {
    passado.current = [];
    futuro.current = [];
    setContagem(n => n + 1);
    setSelecaoCrua(null);
    setPendente(undefined);
    digitando.current = false;
  }, []);

  /** Recomeçar: o documento volta, e o Ctrl+Z não alcança o que veio antes. */
  const reiniciar = useCallback((d: Doc<S>) => {
    passado.current = [];
    futuro.current = [];
    setContagem(n => n + 1);
    setSelecaoCrua(null);
    setPendente(undefined);
    digitando.current = false;
    atual.current.aoMudar(d);
  }, []);

  const atalhos = opcoes.atalhos ?? 'word';
  const folha: EdicaoDaFolha = useMemo(() => ({
    selecao, aoSelecionar, aoComando: executar, raiz, atalhos,
  }), [selecao, aoSelecionar, executar, atalhos]);

  /* O parágrafo e o trecho em que o cursor está — "a marca escolhida" do
     painel de revisão é a que está debaixo do cursor, como no Word. */
  const paragrafo: Paragrafo<S> | null = useMemo(() => {
    if (!selecao) return null;
    const b = doc.blocos.find(x => x.id === selecao.foco.bloco);
    return b && ehParagrafo(b) ? b : null;
  }, [doc, selecao]);

  const trecho: Trecho | null = useMemo(() => {
    if (!selecao || !paragrafo) return null;
    const k = Math.min(selecao.ancora.offset, selecao.foco.offset);
    let pos = 0;
    for (const x of paragrafo.trechos) {
      const n = unidadesDoTrecho(x);
      if (k < pos + n || (k === pos + n && x === paragrafo.trechos[paragrafo.trechos.length - 1])) return x;
      pos += n;
    }
    return paragrafo.trechos[0] ?? null;
  }, [selecao, paragrafo]);

  return {
    selecao,
    folha,
    formato: formatoDaSelecao(doc, selecao, pendente),
    formatoDoParagrafo: formatoDoParagrafoDaSelecao(doc, selecao),
    paragrafar,
    copiar,
    /** Há o que colar? O botão Colar do Word fica apagado enquanto não há. */
    temTransferencia,
    pendente,
    paragrafo,
    trecho,
    executar,
    marcar,
    formatar,
    estilo,
    mudar,
    reiniciar,
    esquecer,
    desfazer,
    refazer,
    podeDesfazer: passado.current.length > 0,
    podeRefazer: futuro.current.length > 0,
    focar,
    /** Põe o cursor em algum lugar — o fim do parágrafo indicado. */
    porCursor: (bloco: string) => {
      const b = doc.blocos.find(x => x.id === bloco);
      if (b && ehParagrafo(b)) aoSelecionar({ ancora: { bloco, offset: tamanhoDoParagrafo(b) }, foco: { bloco, offset: tamanhoDoParagrafo(b) } });
    },
  };
}

export type EdicaoDoWord<S extends string = string> = ReturnType<typeof useEdicaoDoWord<S>>;

/** Os trechos com texto dentro de uma seleção, para saber se todos têm uma coisa. */
function paragrafosComTrechos(d: Doc<string>, s: Selecao): Trecho[] {
  const vistos: Trecho[] = [];
  transformarSelecao(d, s, x => { if (x.texto || x.campo) vistos.push(x); return x; });
  return vistos;
}
