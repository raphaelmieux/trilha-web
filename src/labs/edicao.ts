/**
 * A edição de texto do Word: cursor, seleção, digitar, apagar, Enter e
 * formatar o que está selecionado.
 *
 * ── Por que ela existe ───────────────────────────────────────────────────
 * Os laboratórios de Word se pareciam com o Word e não funcionavam como ele.
 * Não havia cursor: clicava-se num parágrafo inteiro, ele ganhava um contorno,
 * e os botões agiam sobre o parágrafo escolhido. Juntar duas linhas com uma
 * quebra de linha era um botão da faixa, "Juntar com Quebra de Linha", porque
 * não havia onde apertar Shift+Enter; apagar um parágrafo vazio era outro
 * botão, porque não havia Backspace. O desbravador aprendia um programa que
 * não existe — e o gesto que a lição pedia, que é o gesto que ele vai fazer no
 * computador do clube, nunca acontecia.
 *
 * Aqui o documento se edita como no Word: o cursor fica entre dois caracteres,
 * a seleção vai de um caractere a outro, o negrito vale para o que está
 * selecionado, e o estilo de parágrafo vale para todo parágrafo que a seleção
 * toca. São funções puras sobre o `Doc` de `documento.ts`, para que as metas e
 * as travas as alcancem sem montar tela nenhuma.
 *
 * ── A posição conta unidades, e não caracteres ───────────────────────────
 * Dentro de um parágrafo a posição é um número, e cada coisa ocupa uma
 * unidade: a letra, a quebra de linha (o `quebra` do trecho, que mora **antes**
 * dele) e o campo inteiro. O campo é uma unidade só porque ele é um só no
 * Word: o cursor pula a "Figura 1" de uma vez, e não letra por letra — entrar
 * nele e digitar no meio do número apagaria a diferença entre o número
 * calculado e o digitado, que é a lição do requisito 4.3 da CC-ES002.
 *
 * ── O id é o que as metas seguem, e por isso ele fica onde está ──────────
 * Comentário se pendura em id de trecho, e as metas conferem parágrafo por id.
 * Então partir um trecho deixa o **pedaço de antes** com o id original, e o
 * Enter no começo de um parágrafo cria o vazio **antes** dele, em vez de
 * empurrar o texto para um parágrafo de id novo. Sem isso, apertar Enter para
 * abrir uma linha acima da assinatura faria a meta da assinatura deixar de
 * achá-la, sem nada na tela explicando.
 *
 * Trechos vizinhos com a mesma formatação não são fundidos, pelo mesmo motivo:
 * fundir mudaria ids que alguém pode estar seguindo.
 */

import {
  type Alinhamento, type Autor, type Bloco, type Direta, type Doc, type Estilo,
  type FormatoDoParagrafo, type Paragrafo, type Posicao, type Realce, type TipoDeLista, type Trecho,
  aparenciaDe, ehParagrafo, fonteDoCorpo, textoDoTrecho,
} from './documento';

/* ── Posição e seleção ────────────────────────────────────────────────────── */

/** Um lugar entre duas unidades de um parágrafo. */
export interface Ponto {
  bloco: string;
  offset: number;
}

/**
 * A seleção, com âncora e foco: a âncora é onde ela começou, o foco é onde
 * está o cursor. A ordem importa para o Shift+seta, que estende a partir da
 * âncora, e por isso ela não é guardada já ordenada.
 */
export interface Selecao {
  ancora: Ponto;
  foco: Ponto;
}

export const cursorEm = (bloco: string, offset: number): Selecao =>
  ({ ancora: { bloco, offset }, foco: { bloco, offset } });

export const recolhida = (s: Selecao) =>
  s.ancora.bloco === s.foco.bloco && s.ancora.offset === s.foco.offset;

export const mesmaSelecao = (a: Selecao | null, b: Selecao | null) =>
  a === b || (!!a && !!b
    && a.ancora.bloco === b.ancora.bloco && a.ancora.offset === b.ancora.offset
    && a.foco.bloco === b.foco.bloco && a.foco.offset === b.foco.offset);

/** Quantas unidades um trecho ocupa: a quebra antes dele, e o texto ou o campo. */
export const unidadesDoTrecho = (x: Trecho) =>
  (x.quebra ? 1 : 0) + (x.campo ? 1 : x.texto.length);

/** Quantas unidades o parágrafo tem — o offset do fim dele. */
export const tamanhoDoParagrafo = (b: Paragrafo<string>) =>
  b.trechos.reduce((n, x) => n + unidadesDoTrecho(x), 0);

/**
 * O parágrafo como uma cadeia de unidades: a quebra vira `\n` e o campo vira o
 * caractere de objeto. Serve para achar palavra e para ler o que está
 * selecionado — nunca para gravar.
 */
export const unidadesDoParagrafo = (b: Paragrafo<string>) =>
  b.trechos.map(x => (x.quebra ? '\n' : '') + (x.campo ? '￼' : x.texto)).join('');

const indiceDoBloco = (d: Doc<string>, id: string) => d.blocos.findIndex(b => b.id === id);

const paragrafoPorId = <S extends string>(d: Doc<S>, id: string): Paragrafo<S> | null => {
  const b = d.blocos.find(x => x.id === id);
  return b && ehParagrafo(b) ? b : null;
};

/** Negativo se `a` vem antes de `b` no documento. */
export function compararPontos(d: Doc<string>, a: Ponto, b: Ponto): number {
  const ia = indiceDoBloco(d, a.bloco);
  const ib = indiceDoBloco(d, b.bloco);
  return ia !== ib ? ia - ib : a.offset - b.offset;
}

/** O começo e o fim da seleção, na ordem do documento. */
export function ordenar(d: Doc<string>, s: Selecao): { inicio: Ponto; fim: Ponto } {
  return compararPontos(d, s.ancora, s.foco) <= 0
    ? { inicio: s.ancora, fim: s.foco }
    : { inicio: s.foco, fim: s.ancora };
}

/**
 * A seleção trazida para dentro do documento como ele está agora.
 *
 * Um comando do laboratório pode apagar o parágrafo em que o cursor estava, ou
 * encurtá-lo — aceitar uma exclusão marcada, por exemplo. O ponto que sobrou
 * apontaria para nada, e o próximo Enter partiria um parágrafo que não existe.
 * Bloco que sumiu devolve `null`, que é "sem cursor"; offset além do fim desce
 * para o fim.
 */
export function selecaoValida(d: Doc<string>, s: Selecao | null): Selecao | null {
  if (!s) return null;
  const ponto = (p: Ponto): Ponto | null => {
    const b = paragrafoPorId(d, p.bloco);
    if (!b) return null;
    return { bloco: p.bloco, offset: Math.max(0, Math.min(p.offset, tamanhoDoParagrafo(b))) };
  };
  const ancora = ponto(s.ancora);
  const foco = ponto(s.foco);
  if (!ancora || !foco) return null;
  return { ancora, foco };
}

/** Ctrl+A: do começo do primeiro parágrafo ao fim do último. */
export function selecionarTudo(d: Doc<string>): Selecao | null {
  const ps = d.blocos.filter(ehParagrafo);
  if (ps.length === 0) return null;
  const ultimo = ps[ps.length - 1];
  return { ancora: { bloco: ps[0].id, offset: 0 }, foco: { bloco: ultimo.id, offset: tamanhoDoParagrafo(ultimo) } };
}

/** Os parágrafos que a seleção toca, na ordem. */
export function paragrafosDaSelecao<S extends string>(d: Doc<S>, s: Selecao): Paragrafo<S>[] {
  const { inicio, fim } = ordenar(d, s);
  const de = indiceDoBloco(d, inicio.bloco);
  const ate = indiceDoBloco(d, fim.bloco);
  if (de < 0 || ate < 0) return [];
  return d.blocos.slice(de, ate + 1).filter(ehParagrafo);
}

/** O texto selecionado, com Enter entre parágrafos. */
export function textoDaSelecao(d: Doc<string>, s: Selecao): string {
  const { inicio, fim } = ordenar(d, s);
  return paragrafosDaSelecao(d, s).map(b => {
    const u = unidadesDoParagrafo(b);
    const de = b.id === inicio.bloco ? inicio.offset : 0;
    const ate = b.id === fim.bloco ? fim.offset : u.length;
    return u.slice(de, ate);
  }).join('\n');
}

/**
 * O que vai para a área de transferência: os pedaços selecionados com a
 * formatação deles, um parágrafo por linha.
 *
 * O texto riscado de uma revisão não vai — ele já saiu do documento —, e a
 * marca de quem inseriu também não: colado noutro lugar, o texto é de quem
 * colou. Campo vai como o texto que mostra, porque fora daqui ele não teria
 * de onde recalcular o número.
 */
export function fragmentoDaSelecao(d: Doc<string>, s: Selecao): Trecho[][] {
  const { inicio, fim } = ordenar(d, s);
  const ids = new Ids(d);
  return paragrafosDaSelecao(d, s).map(b => {
    const de = b.id === inicio.bloco ? inicio.offset : 0;
    const ate = b.id === fim.bloco ? fim.offset : tamanhoDoParagrafo(b);
    const { trechos, de: i, ate: j } = isolar(b.trechos, de, ate, ids);
    return trechos.slice(i, j)
      .filter(x => x.revisao?.tipo !== 'excluido')
      .map(x => {
        const t: Trecho = { ...x };
        delete t.revisao;
        if (t.campo) {
          t.texto = textoDoTrecho(d, x);
          delete t.campo;
        }
        return t;
      });
  });
}

/* ── Ids ──────────────────────────────────────────────────────────────────── */

/**
 * Quem dá id novo dentro de uma operação.
 *
 * O id novo deriva do de origem — `p3-a.1`, `p3-a.2` —, e não de um contador
 * global, para que o documento continue legível em quem o inspeciona: dá para
 * ver de qual trecho um pedaço saiu.
 */
class Ids {
  private usados = new Set<string>();
  constructor(d: Doc<string>) {
    for (const b of d.blocos) {
      this.usados.add(b.id);
      if (ehParagrafo(b)) for (const x of b.trechos) this.usados.add(x.id);
    }
    for (const f of [d.cabecalho, d.rodape]) for (const x of f?.trechos ?? []) this.usados.add(x.id);
  }
  novo(base: string): string {
    const raiz = base.replace(/\.\d+$/, '');
    let n = 1;
    while (this.usados.has(`${raiz}.${n}`)) n++;
    const id = `${raiz}.${n}`;
    this.usados.add(id);
    return id;
  }
}

/* ── Partir, que é a peça de baixo de tudo ────────────────────────────────── */

/** Um trecho de texto vazio com a formatação de `x`, sem quebra, campo nem marca. */
function vazioComo(x: Trecho, id: string): Trecho {
  const t: Trecho = { ...x, id, texto: '' };
  delete t.quebra;
  delete t.campo;
  delete t.revisao;
  return t;
}

/**
 * Garante uma fronteira de trecho em `k` e devolve os trechos e o índice do
 * primeiro que começa ali. O pedaço de antes fica com o id original.
 */
function partir(trechos: Trecho[], k: number, ids: Ids): { trechos: Trecho[]; i: number } {
  let inicio = 0;
  for (let i = 0; i < trechos.length; i++) {
    const x = trechos[i];
    const n = unidadesDoTrecho(x);
    if (k === inicio) return { trechos, i };
    if (k < inicio + n) {
      const q = x.quebra ? 1 : 0;
      const corte = k - inicio - q; // em caracteres do texto; 0 quando cai logo depois da quebra
      let antes: Trecho;
      let depois: Trecho;
      if (x.campo) {
        /* Só dá para cair dentro de um campo entre a quebra e ele. */
        antes = vazioComo(x, x.id);
        antes.quebra = true;
        depois = { ...x, id: ids.novo(x.id) };
        delete depois.quebra;
      } else {
        antes = { ...x, texto: x.texto.slice(0, corte) };
        depois = { ...x, id: ids.novo(x.id), texto: x.texto.slice(corte) };
        delete depois.quebra;
      }
      const novos = [...trechos.slice(0, i), antes, depois, ...trechos.slice(i + 1)];
      return { trechos: novos, i: i + 1 };
    }
    inicio += n;
  }
  return { trechos, i: trechos.length };
}

/** Os trechos com fronteira em `a` e em `b`, e o intervalo de índices entre elas. */
function isolar(trechos: Trecho[], a: number, b: number, ids: Ids) {
  const p1 = partir(trechos, a, ids);
  const p2 = partir(p1.trechos, b, ids);
  /* Partir em `b` pode ter inserido um trecho antes de `p1.i` só se `b < a`,
     o que não acontece: quem chama ordena. */
  return { trechos: p2.trechos, de: p1.i, ate: p2.i };
}

/** O parágrafo nunca fica sem trecho: um vazio precisa de onde guardar a formatação. */
function comAoMenosUm(trechos: Trecho[], modelo: Trecho, ids: Ids, idPreferido?: string): Trecho[] {
  if (trechos.length > 0) return trechos;
  return [vazioComo(modelo, idPreferido ?? ids.novo(modelo.id))];
}

/** Os trechos vazios que sobraram de um corte saem, menos o que segura uma quebra. */
function semVazios(trechos: Trecho[]): Trecho[] {
  const limpos = trechos.filter(x => x.campo || x.quebra || x.texto.length > 0);
  return limpos.length > 0 ? limpos : trechos.slice(0, 1);
}

const trocarBloco = <S extends string>(d: Doc<S>, id: string, novo: Bloco<S>[]): Doc<S> => {
  const i = indiceDoBloco(d, id);
  return { ...d, blocos: [...d.blocos.slice(0, i), ...novo, ...d.blocos.slice(i + 1)] };
};

/**
 * Comentário cujo trecho sumiu vai junto, como no Word: apagar todo o texto a
 * que ele estava preso apaga o balão. Deixá-lo pendurado em nada faria a margem
 * mostrar um comentário sem lugar, que nenhum clique alcança.
 */
function semComentariosOrfaos<S extends string>(d: Doc<S>): Doc<S> {
  if (!d.comentarios?.length) return d;
  const vivos = new Set(d.blocos.flatMap(b => (ehParagrafo(b) ? b.trechos.map(x => x.id) : [])));
  const ficam = d.comentarios.filter(c => vivos.has(c.trecho));
  return ficam.length === d.comentarios.length ? d : { ...d, comentarios: ficam };
}

/* ── O resultado de uma edição ────────────────────────────────────────────── */

export interface Edicao<S extends string = string> {
  doc: Doc<S>;
  selecao: Selecao;
}

/**
 * Quem está editando, e se o controle de alterações vale para esta edição.
 *
 * O controle vem do documento (`controlarAlteracoes`), e o autor vem do
 * laboratório — na CC-ES006 o modo Sugestão liga a marca sem o documento ter o
 * controle ligado, e é por isso que `marcar` existe separado.
 */
export interface QuemEdita {
  autor?: Autor;
  /** Força a marca de revisão mesmo com o controle do documento desligado. */
  marcar?: boolean;
}

const marcando = (d: Doc<string>, q?: QuemEdita) => !!(q?.marcar || d.controlarAlteracoes);
const autorDe = (q?: QuemEdita): Autor => q?.autor ?? 'voce';

/* ── Apagar ───────────────────────────────────────────────────────────────── */

/**
 * Apaga o intervalo `[a, b)` de um parágrafo.
 *
 * Com o controle de alterações ligado, o texto não sai: ganha a marca de
 * excluído e continua na tela, riscado. O que o próprio autor acabou de
 * inserir sai de verdade, como no Word — apagar a própria sugestão não deixa
 * rastro, porque ela nunca chegou a ser texto do documento.
 */
function apagarNoParagrafo<S extends string>(
  b: Paragrafo<S>, a: number, z: number, ids: Ids, marcar: boolean, autor: Autor,
): Paragrafo<S> {
  if (z <= a) return b;
  const { trechos, de, ate } = isolar(b.trechos, a, z, ids);
  const modelo = trechos[de] ?? trechos[trechos.length - 1];
  let meio: Trecho[];
  if (marcar) {
    meio = trechos.slice(de, ate).flatMap(x => {
      if (x.revisao?.tipo === 'inserido' && x.revisao.autor === autor) return [];
      if (x.revisao?.tipo === 'excluido') return [x];
      return [{ ...x, revisao: { autor, tipo: 'excluido' as const } }];
    });
  } else {
    meio = [];
  }
  const juntos = [...trechos.slice(0, de), ...meio, ...trechos.slice(ate)];
  /* O primeiro trecho do parágrafo guarda a formatação que o próximo caractere
     digitado herda; se ele sumiu inteiro, um vazio fica no lugar dele, com o
     mesmo id. */
  return { ...b, trechos: comAoMenosUm(semVazios(juntos), modelo, ids, b.trechos[0]?.id) };
}

/**
 * Junta o parágrafo `b` ao de cima, `a`.
 *
 * Quando `a` está vazio, quem sai é ele — e `b` continua com o id, o estilo e
 * os trechos dele. É o Backspace num parágrafo vazio de cima, e a meta que
 * acompanha o parágrafo de baixo pelo id continua achando-o.
 */
function juntar<S extends string>(d: Doc<S>, a: Paragrafo<S>, b: Paragrafo<S>): Edicao<S> {
  if (tamanhoDoParagrafo(a) === 0) {
    const semA = d.blocos.filter(x => x.id !== a.id);
    const novoB: Paragrafo<S> = a.quebraDePagina ? { ...b, quebraDePagina: true } : b;
    return {
      doc: { ...d, blocos: semA.map(x => (x.id === b.id ? novoB : x)) },
      selecao: cursorEm(b.id, 0),
    };
  }
  const fimDeA = tamanhoDoParagrafo(a);
  const trechosDeB = tamanhoDoParagrafo(b) === 0 ? [] : b.trechos;
  const junto: Paragrafo<S> = { ...a, trechos: semVazios([...a.trechos, ...trechosDeB]) };
  if (!junto.nota && b.nota) junto.nota = b.nota;
  const blocos = d.blocos.filter(x => x.id !== b.id).map(x => (x.id === a.id ? junto : x));
  return { doc: { ...d, blocos }, selecao: cursorEm(a.id, fimDeA) };
}

/**
 * Apaga o que está selecionado. Com a seleção recolhida, não faz nada.
 *
 * Uma seleção que atravessa parágrafos leva junto tudo o que está entre eles,
 * tabela e imagem inclusive, e costura o começo do primeiro com o fim do
 * último. Com o controle de alterações ligado, cada parágrafo ganha a marca de
 * excluído no pedaço dele e nada é costurado: a marca é sobre texto, e juntar
 * parágrafos mudaria o documento antes de alguém aceitar qualquer coisa.
 */
export function apagarSelecao<S extends string>(d: Doc<S>, s: Selecao, q?: QuemEdita): Edicao<S> {
  if (recolhida(s)) return { doc: d, selecao: s };
  const { inicio, fim } = ordenar(d, s);
  const ids = new Ids(d);
  const marcar = marcando(d, q);
  const autor = autorDe(q);
  const pa = paragrafoPorId(d, inicio.bloco);
  const pb = paragrafoPorId(d, fim.bloco);
  if (!pa || !pb) return { doc: d, selecao: s };

  if (pa.id === pb.id) {
    const novo = apagarNoParagrafo(pa, inicio.offset, fim.offset, ids, marcar, autor);
    const doc = semComentariosOrfaos(trocarBloco(d, pa.id, [novo]));
    return { doc, selecao: cursorEm(pa.id, marcar ? fim.offset : inicio.offset) };
  }

  if (marcar) {
    let doc = d;
    for (const b of paragrafosDaSelecao(d, s)) {
      const de = b.id === pa.id ? inicio.offset : 0;
      const ate = b.id === pb.id ? fim.offset : tamanhoDoParagrafo(b);
      doc = trocarBloco(doc, b.id, [apagarNoParagrafo(b, de, ate, ids, true, autor)]);
    }
    return { doc, selecao: cursorEm(pb.id, fim.offset) };
  }

  const novoA = apagarNoParagrafo(pa, inicio.offset, tamanhoDoParagrafo(pa), ids, false, autor);
  const novoB = apagarNoParagrafo(pb, 0, fim.offset, ids, false, autor);
  const ia = indiceDoBloco(d, pa.id);
  const ib = indiceDoBloco(d, pb.id);
  const blocos = [...d.blocos.slice(0, ia), novoA, novoB, ...d.blocos.slice(ib + 1)];
  const r = juntar({ ...d, blocos }, novoA, novoB);
  return { doc: semComentariosOrfaos(r.doc), selecao: r.selecao };
}

/**
 * Backspace e Delete.
 *
 * Com seleção, apagam a seleção. Recolhidos, apagam uma unidade para o lado
 * que a tecla diz — ou uma palavra, com Ctrl. Na borda do parágrafo eles
 * juntam com o vizinho, que é como se apaga um Enter; e no começo de um
 * parágrafo que abre folha nova, o Backspace tira a quebra de página antes de
 * juntar qualquer coisa, que é o que o Word faz com o "Quebra de Página" que
 * as marcas mostram.
 */
export function apagar<S extends string>(
  d: Doc<S>, s: Selecao, direcao: 'tras' | 'frente', q?: QuemEdita, palavra = false,
): Edicao<S> {
  if (!recolhida(s)) return apagarSelecao(d, s, q);
  const p = paragrafoPorId(d, s.foco.bloco);
  if (!p) return { doc: d, selecao: s };
  const k = s.foco.offset;
  const n = tamanhoDoParagrafo(p);
  const i = indiceDoBloco(d, p.id);

  if (direcao === 'tras' && k === 0) {
    /* No começo de um item, o Backspace tira o marcador antes de juntar
       qualquer coisa: é o que o Word faz, e é como se sai de uma lista sem
       apagar texto nenhum. */
    if (p.formato?.lista) {
      return { doc: trocarBloco(d, p.id, [comFormato(p, { ...p.formato, lista: undefined })]), selecao: s };
    }
    if (p.quebraDePagina) {
      const sem: Paragrafo<S> = { ...p };
      delete sem.quebraDePagina;
      return { doc: trocarBloco(d, p.id, [sem]), selecao: s };
    }
    const anterior = d.blocos[i - 1];
    if (!anterior) return { doc: d, selecao: s };
    if (!ehParagrafo(anterior)) {
      /* Em cima há tabela ou imagem. O Word seleciona o objeto; aqui, um
         parágrafo vazio sai e o texto não se junta a coisa nenhuma. */
      if (n === 0 && d.blocos[i + 1] && ehParagrafo(d.blocos[i + 1])) {
        return { doc: { ...d, blocos: d.blocos.filter(x => x.id !== p.id) }, selecao: cursorEm(d.blocos[i + 1].id, 0) };
      }
      return { doc: d, selecao: s };
    }
    if (marcando(d, q)) return { doc: d, selecao: cursorEm(anterior.id, tamanhoDoParagrafo(anterior)) };
    return juntar(d, anterior, p);
  }

  if (direcao === 'frente' && k === n) {
    const seguinte = d.blocos[i + 1];
    if (!seguinte || !ehParagrafo(seguinte)) return { doc: d, selecao: s };
    if (marcando(d, q)) return { doc: d, selecao: cursorEm(seguinte.id, 0) };
    return juntar(d, p, seguinte);
  }

  const u = unidadesDoParagrafo(p);
  let outra: number;
  if (palavra) {
    outra = direcao === 'tras' ? inicioDaPalavraAntes(u, k) : fimDaPalavraDepois(u, k);
  } else {
    outra = direcao === 'tras' ? k - 1 : k + 1;
  }
  const sel: Selecao = { ancora: { bloco: p.id, offset: outra }, foco: { bloco: p.id, offset: k } };
  const r = apagarSelecao(d, sel, q);
  /* Com marca, o cursor passa por cima do que foi riscado, para o lado da
     tecla: o Backspace anda para trás e o Delete para a frente. */
  if (marcando(d, q)) return { ...r, selecao: cursorEm(p.id, direcao === 'tras' ? Math.min(k, outra) : Math.max(k, outra)) };
  return r;
}

const ehLetra = (c: string | undefined) => !!c && /[\p{L}\p{N}_]/u.test(c);

function inicioDaPalavraAntes(u: string, k: number): number {
  let i = k;
  while (i > 0 && /\s/.test(u[i - 1])) i--;
  if (i > 0 && !ehLetra(u[i - 1])) return i - 1;
  while (i > 0 && ehLetra(u[i - 1])) i--;
  return i;
}

function fimDaPalavraDepois(u: string, k: number): number {
  let i = k;
  if (i < u.length && !ehLetra(u[i]) && !/\s/.test(u[i])) return i + 1;
  while (i < u.length && ehLetra(u[i])) i++;
  while (i < u.length && /[ \t]/.test(u[i])) i++;
  return i;
}

/**
 * A palavra em volta do cursor, quando ele está **dentro** de uma.
 *
 * É o que o Word formata quando se aperta Negrito sem selecionar nada: com o
 * cursor no meio de "acampamento", a palavra inteira fica em negrito. Com o
 * cursor num espaço, nada muda na tela — o negrito vale para o que for digitado
 * em seguida, que é a formatação pendente que o gancho guarda.
 */
export function palavraEmVolta(d: Doc<string>, p: Ponto): Selecao | null {
  const b = paragrafoPorId(d, p.bloco);
  if (!b) return null;
  const u = unidadesDoParagrafo(b);
  if (!ehLetra(u[p.offset - 1]) || !ehLetra(u[p.offset])) return null;
  let de = p.offset;
  while (de > 0 && ehLetra(u[de - 1])) de--;
  let ate = p.offset;
  while (ate < u.length && ehLetra(u[ate])) ate++;
  return { ancora: { bloco: b.id, offset: de }, foco: { bloco: b.id, offset: ate } };
}

/* ── Digitar ──────────────────────────────────────────────────────────────── */

/** O trecho cuja formatação o caractere digitado em `k` herda: o de antes dele. */
function trechoDeOrigem(trechos: Trecho[], k: number): { i: number; local: number } {
  let inicio = 0;
  for (let i = 0; i < trechos.length; i++) {
    const n = unidadesDoTrecho(trechos[i]);
    if (k > inicio && k <= inicio + n) return { i, local: k - inicio };
    inicio += n;
  }
  return { i: 0, local: 0 };
}

const mesmaDireta = (a?: Direta, b?: Direta) =>
  JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});

/** Uma linha só, sem Enter: o que entra no parágrafo onde o cursor está. */
function inserirNaLinha<S extends string>(
  d: Doc<S>, p: Paragrafo<S>, k: number, texto: string, ids: Ids,
  q: QuemEdita | undefined, pendente: Partial<Direta> | undefined,
): Paragrafo<S> {
  if (!texto) return p;
  const marcar = marcando(d, q);
  const autor = autorDe(q);
  const { i, local } = trechoDeOrigem(p.trechos, k);
  const origem = p.trechos[i];
  const direta = pendente && Object.keys(pendente).length > 0
    ? limparDireta({ ...(origem.direta ?? {}), ...pendente })
    : origem.direta;
  const revisaoQuer = marcar ? { autor, tipo: 'inserido' as const } : undefined;
  const q0 = origem.quebra ? 1 : 0;
  const cabeDentro = !origem.campo
    && !(k === 0 && origem.quebra)
    && local >= q0
    && JSON.stringify(origem.revisao ?? null) === JSON.stringify(revisaoQuer ?? null)
    && mesmaDireta(origem.direta, direta);

  if (cabeDentro) {
    const c = k === 0 ? 0 : local - q0;
    const novo = { ...origem, texto: origem.texto.slice(0, c) + texto + origem.texto.slice(c) };
    return { ...p, trechos: p.trechos.map((x, j) => (j === i ? novo : x)) };
  }

  const novo: Trecho = vazioComo(origem, ids.novo(origem.id));
  novo.texto = texto;
  if (direta) novo.direta = direta; else delete novo.direta;
  if (revisaoQuer) novo.revisao = revisaoQuer;
  const { trechos, i: onde } = partir(p.trechos, k, ids);
  const lista = [...trechos.slice(0, onde), novo, ...trechos.slice(onde)];
  return { ...p, trechos: semVazios(lista) };
}

/**
 * Digitar, colar texto puro, e trocar a seleção pelo que se digitou.
 *
 * O caractere herda a formatação do que vem antes dele, como no Word — quem
 * digita no fim de uma palavra em negrito continua em negrito. `pendente` é o
 * negrito apertado com o cursor parado, que vale para o que vier digitado.
 *
 * Texto com Enter dentro (colado) vira parágrafos, e cada um herda o estilo de
 * onde o cursor estava.
 */
export function inserirTexto<S extends string>(
  d: Doc<S>, s: Selecao, texto: string, q?: QuemEdita, pendente?: Partial<Direta>,
): Edicao<S> {
  const limpo = apagarSelecao(d, s, q);
  let doc = limpo.doc;
  let sel = limpo.selecao;
  /* Com marca, apagar deixa o cursor no fim do riscado; o texto novo entra
     depois dele, que é onde o Word o põe. */
  const linhas = texto.replace(/\r\n?/g, '\n').split('\n');
  linhas.forEach((linha, n) => {
    if (n > 0) {
      const r = quebrarParagrafo(doc, sel, q);
      doc = r.doc;
      sel = r.selecao;
    }
    const p = paragrafoPorId(doc, sel.foco.bloco);
    if (!p || !linha) return;
    const ids = new Ids(doc);
    const novo = inserirNaLinha(doc, p, sel.foco.offset, linha, ids, q, pendente);
    doc = trocarBloco(doc, p.id, [novo]);
    sel = cursorEm(p.id, sel.foco.offset + linha.length);
  });
  return { doc, selecao: sel };
}

/**
 * Colar o que saiu de `fragmentoDaSelecao`: a formatação de origem vai junto,
 * que é o que o Colar do Word faz sem ninguém escolher nada. Cada linha do
 * fragmento depois da primeira abre um parágrafo, como o Enter.
 */
export function colarFragmento<S extends string>(
  d: Doc<S>, s: Selecao, fragmento: Trecho[][], q?: QuemEdita,
): Edicao<S> {
  const limpo = apagarSelecao(d, s, q);
  let doc = limpo.doc;
  let sel = limpo.selecao;
  const marcar = marcando(d, q);
  const autor = autorDe(q);
  fragmento.forEach((linha, n) => {
    if (n > 0) {
      const r = quebrarParagrafo(doc, sel, q);
      doc = r.doc;
      sel = r.selecao;
    }
    const p = paragrafoPorId(doc, sel.foco.bloco);
    const pedacos = linha.filter(x => x.texto || x.quebra);
    if (!p || pedacos.length === 0) return;
    const ids = new Ids(doc);
    const { trechos, i } = partir(p.trechos, sel.foco.offset, ids);
    const novos = pedacos.map(x => {
      const t: Trecho = { ...x, id: ids.novo(p.trechos[0].id) };
      if (marcar) t.revisao = { autor, tipo: 'inserido' };
      return t;
    });
    const lista = [...trechos.slice(0, i), ...novos, ...trechos.slice(i)];
    doc = trocarBloco(doc, p.id, [{ ...p, trechos: semVazios(lista) }]);
    sel = cursorEm(p.id, sel.foco.offset + novos.reduce((t, x) => t + unidadesDoTrecho(x), 0));
  });
  return { doc, selecao: sel };
}

/**
 * Shift+Enter: desce uma linha sem fechar o parágrafo.
 *
 * É a diferença que o requisito 2.3 da CC-ES002 pede, e ela precisa de um
 * gesto: sem ele o endereço só poderia ser consertado por um botão que o Word
 * não tem.
 */
export function quebraDeLinha<S extends string>(d: Doc<S>, s: Selecao, q?: QuemEdita): Edicao<S> {
  const limpo = apagarSelecao(d, s, q);
  const p = paragrafoPorId(limpo.doc, limpo.selecao.foco.bloco);
  if (!p) return limpo;
  const k = limpo.selecao.foco.offset;
  const ids = new Ids(limpo.doc);
  const { trechos, i } = partir(p.trechos, k, ids);
  const lista = [...trechos];
  const seguinte = lista[i];
  if (seguinte && !seguinte.quebra) {
    lista[i] = { ...seguinte, quebra: true };
  } else {
    /* No fim do parágrafo, ou antes de outra quebra: um trecho vazio carrega
       a quebra, com a formatação de quem estava antes. */
    const modelo = lista[i - 1] ?? lista[0];
    const novo = vazioComo(modelo, ids.novo(modelo.id));
    novo.quebra = true;
    lista.splice(i, 0, novo);
  }
  return { doc: trocarBloco(limpo.doc, p.id, [{ ...p, trechos: lista }]), selecao: cursorEm(p.id, k + 1) };
}

/** O estilo do parágrafo que o Enter abre no fim de um parágrafo deste estilo. */
const ESTILO_SEGUINTE: Partial<Record<Estilo, Estilo>> = {
  'Título 1': 'Normal', 'Título 2': 'Normal', 'Título 3': 'Normal',
  'Subtítulo': 'Normal', 'Legenda': 'Normal', 'Citação': 'Normal',
};

/**
 * Enter: fecha o parágrafo e abre outro.
 *
 * No fim de um título, o seguinte nasce Normal — é o "estilo do parágrafo
 * seguinte" que todo título do Word carrega, e sem ele quem escreve um título
 * e aperta Enter continuaria escrevendo em azul, 16 pt. No meio, os dois
 * pedaços ficam com o estilo de antes. No começo, o parágrafo vazio nasce
 * **antes**, e o de texto continua com o id que tinha — pela razão escrita no
 * alto deste arquivo.
 */
export function quebrarParagrafo<S extends string>(d: Doc<S>, s: Selecao, q?: QuemEdita): Edicao<S> {
  const limpo = apagarSelecao(d, s, q);
  const doc0 = limpo.doc;
  const p = paragrafoPorId(doc0, limpo.selecao.foco.bloco);
  if (!p) return limpo;
  const k = limpo.selecao.foco.offset;
  const n = tamanhoDoParagrafo(p);
  const ids = new Ids(doc0);

  /* Enter num item de lista vazio fecha a lista, como no Word: sobe um
     nível se estiver recuado, e sai da lista se já estiver na margem. Sem
     isso, quem termina uma lista e aperta Enter duas vezes ganharia um item
     vazio atrás do outro, e nunca voltaria ao texto corrido. */
  if (n === 0 && p.formato?.lista) {
    const recuo = p.formato.recuo ?? 0;
    const formato: FormatoDoParagrafo = recuo > 0
      ? { ...p.formato, recuo: recuo - 1 }
      : { ...p.formato, lista: undefined, recuo: undefined };
    return { doc: trocarBloco(doc0, p.id, [comFormato(p, formato)]), selecao: limpo.selecao };
  }

  if (k === 0 && n > 0) {
    const vazio: Paragrafo<S> = {
      tipo: 'paragrafo', id: ids.novo(p.id), secao: p.secao, estilo: p.estilo,
      trechos: [vazioComo(p.trechos[0], ids.novo(p.trechos[0].id))],
      ...(p.formato ? { formato: p.formato } : {}),
    };
    let depois: Paragrafo<S> = p;
    if (p.quebraDePagina) {
      vazio.quebraDePagina = true;
      depois = { ...p };
      delete depois.quebraDePagina;
    }
    return { doc: trocarBloco(doc0, p.id, [vazio, depois]), selecao: cursorEm(p.id, 0) };
  }

  if (n === 0) {
    /* Enter num parágrafo vazio: outro vazio embaixo, e o cursor desce. */
    const estilo = ESTILO_SEGUINTE[p.estilo] ?? p.estilo;
    const novo: Paragrafo<S> = {
      tipo: 'paragrafo', id: ids.novo(p.id), secao: p.secao, estilo,
      trechos: [vazioComo(p.trechos[0], ids.novo(p.trechos[0].id))],
      ...(p.formato && estilo === p.estilo ? { formato: p.formato } : {}),
    };
    return { doc: trocarBloco(doc0, p.id, [p, novo]), selecao: cursorEm(novo.id, 0) };
  }

  const { trechos, i } = partir(p.trechos, k, ids);
  const esquerda = trechos.slice(0, i);
  const direita = trechos.slice(i);
  const modeloFim = esquerda[esquerda.length - 1] ?? trechos[0];
  const novo: Paragrafo<S> = {
    tipo: 'paragrafo', id: ids.novo(p.id), secao: p.secao,
    estilo: k === n ? (ESTILO_SEGUINTE[p.estilo] ?? p.estilo) : p.estilo,
    trechos: comAoMenosUm(direita, modeloFim, ids),
  };
  const antes: Paragrafo<S> = { ...p, trechos: comAoMenosUm(esquerda, trechos[0], ids, p.trechos[0].id) };
  /* O parágrafo novo que nasce no fim de um título vira Normal; a formatação
     direta do título não vai junto, senão o Normal sairia azul e grande. A de
     parágrafo vai junto quando o estilo continua: o item seguinte de uma
     lista é outro item, e a linha seguinte de um texto centralizado continua
     centralizada. */
  if (novo.estilo !== p.estilo) novo.trechos = novo.trechos.map(x => (x.texto || x.campo ? x : semDireta(x)));
  else if (p.formato) novo.formato = p.formato;
  return { doc: trocarBloco(doc0, p.id, [antes, novo]), selecao: cursorEm(novo.id, 0) };
}

function semDireta(x: Trecho): Trecho {
  const t = { ...x };
  delete t.direta;
  return t;
}

/**
 * Ctrl+Enter: o que vem depois do cursor começa na folha seguinte.
 *
 * No meio do parágrafo ele parte o parágrafo, como o Enter, e o pedaço de
 * baixo abre a folha. No começo, quem abre a folha é o próprio parágrafo — e
 * é o mesmo resultado que oito Enters dariam no dia em que foram apertados, só
 * que continua certo quando o texto de cima cresce.
 */
export function quebraDePagina<S extends string>(d: Doc<S>, s: Selecao, q?: QuemEdita): Edicao<S> {
  const limpo = apagarSelecao(d, s, q);
  const p = paragrafoPorId(limpo.doc, limpo.selecao.foco.bloco);
  if (!p) return limpo;
  if (limpo.selecao.foco.offset === 0) {
    return { doc: trocarBloco(limpo.doc, p.id, [{ ...p, quebraDePagina: true }]), selecao: limpo.selecao };
  }
  const r = quebrarParagrafo(limpo.doc, limpo.selecao, q);
  const novoId = r.selecao.foco.bloco;
  return {
    doc: { ...r.doc, blocos: r.doc.blocos.map(b => (b.id === novoId ? { ...b, quebraDePagina: true } : b)) },
    selecao: r.selecao,
  };
}

/* ── Formatar ─────────────────────────────────────────────────────────────── */

/** O que os botões de caractere da faixa ligam e desligam. */
export type Marca = 'negrito' | 'italico' | 'sublinhado';

function limparDireta(x: Direta): Direta | undefined {
  const limpa: Direta = {};
  for (const [k, v] of Object.entries(x) as [keyof Direta, Direta[keyof Direta]][]) {
    if (v !== undefined) (limpa as Record<string, unknown>)[k] = v;
  }
  return Object.keys(limpa).length > 0 ? limpa : undefined;
}

/** Aplica `f` a cada trecho do intervalo selecionado, partindo nas bordas. */
export function transformarSelecao<S extends string>(
  d: Doc<S>, s: Selecao, f: (x: Trecho, b: Paragrafo<S>) => Trecho,
): Edicao<S> {
  if (recolhida(s)) return { doc: d, selecao: s };
  const { inicio, fim } = ordenar(d, s);
  const ids = new Ids(d);
  let doc = d;
  for (const b of paragrafosDaSelecao(d, s)) {
    const de = b.id === inicio.bloco ? inicio.offset : 0;
    const ate = b.id === fim.bloco ? fim.offset : tamanhoDoParagrafo(b);
    if (ate <= de) continue;
    const { trechos, de: i, ate: j } = isolar(b.trechos, de, ate, ids);
    const novos = trechos.map((x, n) => (n >= i && n < j ? f(x, b) : x));
    doc = trocarBloco(doc, b.id, [{ ...b, trechos: semVazios(novos) }]);
  }
  return { doc, selecao: s };
}

/** O que o estilo do parágrafo já diz sobre a marca, sem formatação direta. */
function marcaDoEstilo(d: Doc<string>, estilo: Estilo, m: Marca): boolean {
  const a = aparenciaDe(d, estilo);
  if (m === 'negrito') return Number(a.fontWeight ?? 400) >= 600;
  if (m === 'italico') return a.fontStyle === 'italic';
  return false;
}

/** A marca como ela aparece no trecho: a direta vence o estilo. */
export function marcaEfetiva(d: Doc<string>, b: Paragrafo<string>, x: Trecho, m: Marca): boolean {
  return x.direta?.[m] ?? marcaDoEstilo(d, b.estilo, m);
}

/** Os trechos com conteúdo dentro da seleção — o vazio não conta para "tudo em negrito". */
function trechosDaSelecao<S extends string>(d: Doc<S>, s: Selecao): { b: Paragrafo<S>; x: Trecho }[] {
  const { inicio, fim } = ordenar(d, s);
  const r: { b: Paragrafo<S>; x: Trecho }[] = [];
  for (const b of paragrafosDaSelecao(d, s)) {
    const de = b.id === inicio.bloco ? inicio.offset : 0;
    const ate = b.id === fim.bloco ? fim.offset : tamanhoDoParagrafo(b);
    let pos = 0;
    for (const x of b.trechos) {
      const n = unidadesDoTrecho(x);
      const comeco = pos + (x.quebra ? 1 : 0);
      const final = pos + n;
      if (final > de && comeco < ate && final > comeco) r.push({ b, x });
      pos = final;
    }
  }
  return r;
}

/**
 * Pôr uma propriedade direta no trecho — e tirá-la quando ela só repete o
 * estilo.
 *
 * Tirar negrito de um parágrafo Normal não grava "negrito: falso": apaga o
 * negrito direto, como o Word faz. Gravar o falso deixaria o trecho com
 * formatação direta para sempre, e a meta da CC-ES002 que pede o documento sem
 * formatação direta nunca fecharia para quem desfez o negrito à mão.
 */
function comDireta<K extends keyof Direta>(x: Trecho, chave: K, valor: Direta[K], doEstilo: Direta[K]): Trecho {
  const direta: Direta = { ...(x.direta ?? {}) };
  if (valor === doEstilo) delete direta[chave]; else direta[chave] = valor;
  const t = { ...x };
  const limpa = limparDireta(direta);
  if (limpa) t.direta = limpa; else delete t.direta;
  return t;
}

/**
 * Negrito, Itálico, Sublinhado: liga se algum pedaço da seleção não tem, e
 * desliga se todos têm — a regra do Word para seleção mista.
 */
export function alternarMarca<S extends string>(d: Doc<S>, s: Selecao, m: Marca): Edicao<S> {
  const todos = trechosDaSelecao(d, s);
  if (todos.length === 0) return { doc: d, selecao: s };
  const ligar = !todos.every(({ b, x }) => marcaEfetiva(d, b, x, m));
  return transformarSelecao(d, s, (x, b) => comDireta(x, m, ligar, marcaDoEstilo(d, b.estilo, m)));
}

/** Tamanho da fonte, em pontos. */
export function definirTamanho<S extends string>(d: Doc<S>, s: Selecao, pt: number): Edicao<S> {
  return transformarSelecao(d, s, (x, b) => comDireta(x, 'tamanho', pt, Number(aparenciaDe(d, b.estilo).fontSize)));
}

/** Cor da fonte. */
export function definirCor<S extends string>(d: Doc<S>, s: Selecao, cor: string): Edicao<S> {
  return transformarSelecao(d, s, (x, b) => {
    const doEstilo = String(aparenciaDe(d, b.estilo).color ?? '').toUpperCase();
    return comDireta(x, 'cor', cor.toUpperCase() === doEstilo ? doEstilo : cor, doEstilo);
  });
}

/** A fonte, pelo nome que a caixa de fontes mostra. */
export function definirFonte<S extends string>(d: Doc<S>, s: Selecao, nome: string): Edicao<S> {
  return transformarSelecao(d, s, x => comDireta(x, 'fonte', nome, fonteDoCorpo(d)));
}

/** Os degraus de "Aumentar Tamanho da Fonte", os mesmos da caixa do Word. */
export const TAMANHOS_DO_WORD = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

/**
 * A↑ e A↓: cada trecho sobe ou desce um degrau a partir do tamanho **dele**.
 * Uma seleção com 11 e 16 vira 12 e 18 — e não tudo 12, que seria o tamanho
 * da caixa, que está em branco porque a seleção é mista.
 */
export function mudarTamanhoEmDegrau<S extends string>(d: Doc<S>, s: Selecao, sobe: boolean): Edicao<S> {
  return transformarSelecao(d, s, (x, b) => {
    const doEstilo = Number(aparenciaDe(d, b.estilo).fontSize);
    const agora = x.direta?.tamanho ?? doEstilo;
    const proximo = sobe
      ? TAMANHOS_DO_WORD.find(t => t > agora) ?? agora
      : [...TAMANHOS_DO_WORD].reverse().find(t => t < agora) ?? agora;
    return comDireta(x, 'tamanho', proximo, doEstilo);
  });
}

/** Subscrito e sobrescrito: apertar de novo volta ao normal. */
export function alternarPosicao<S extends string>(d: Doc<S>, s: Selecao, posicao: Exclude<Posicao, 'normal'>): Edicao<S> {
  const todos = trechosDaSelecao(d, s);
  const desligar = todos.length > 0 && todos.every(({ x }) => x.posicao === posicao);
  return transformarSelecao(d, s, x => ({ ...x, posicao: desligar ? 'normal' : posicao }));
}

/** O marca-texto. `nenhum` tira. */
export function definirRealce<S extends string>(d: Doc<S>, s: Selecao, realce: Realce): Edicao<S> {
  return transformarSelecao(d, s, x => ({ ...x, realce }));
}

/**
 * Limpar Formatação de caractere: a direta sai, e o estilo volta a mandar.
 *
 * É o Ctrl+Espaço do Word. Ele não mexe no estilo do parágrafo, e é por isso
 * que é o gesto certo da CC-ES002: tirar a formatação direta para que o estilo
 * apareça, e não trocar o estilo.
 */
export function limparFormatacao<S extends string>(d: Doc<S>, s: Selecao): Edicao<S> {
  return transformarSelecao(d, s, x => {
    const t = semDireta(x);
    delete t.deFora;
    return { ...t, realce: 'nenhum', posicao: 'normal' };
  });
}

/**
 * O botão "Limpar Toda a Formatação": a de caractere sai **e** os parágrafos
 * tocados voltam a Normal.
 *
 * É o que o Word faz, e é a diferença que a lição de estilos precisa mostrar:
 * o botão da borracha tira também o estilo, e quem aplicou Título 1 e depois
 * limpou tudo vê o título virar texto comum. O Ctrl+Espaço é o que tira só a
 * de caractere e deixa o estilo — `limparFormatacao`, logo acima.
 */
export function limparTudo<S extends string>(d: Doc<S>, s: Selecao): Edicao<S> {
  const r = limparFormatacao(d, s);
  const semFormato = formatarParagrafos(r.doc, s, () => ({}));
  return aplicarEstilo(semFormato.doc, s, 'Normal');
}

/**
 * Estilo de parágrafo: vale para **todo** parágrafo que a seleção toca, e
 * inteiro, mesmo que a seleção pegue só uma letra dele.
 *
 * É a diferença entre estilo de parágrafo e de caractere, e é por isso que o
 * cursor parado no meio de um título basta para aplicar Título 1 nele.
 */
export function aplicarEstilo<S extends string>(d: Doc<S>, s: Selecao, estilo: Estilo): Edicao<S> {
  const alvos = new Set(paragrafosAlcancados(d, s).map(b => b.id));
  return {
    doc: { ...d, blocos: d.blocos.map(b => (alvos.has(b.id) && ehParagrafo(b) ? { ...b, estilo } : b)) },
    selecao: s,
  };
}

/* ── Parágrafo ────────────────────────────────────────────────────────────── */

/**
 * Os parágrafos que um comando de parágrafo alcança.
 *
 * Uma seleção que termina no começo de um parágrafo não o alcança: é o que os
 * três cliques do navegador produzem — o parágrafo inteiro, com o fim já do
 * lado de lá —, e no Word três cliques num título e Ctrl+E centralizam o
 * título, e não a linha de baixo junto.
 */
export function paragrafosAlcancados<S extends string>(d: Doc<S>, s: Selecao): Paragrafo<S>[] {
  const lista = paragrafosDaSelecao(d, s);
  if (lista.length > 1 && ordenar(d, s).fim.offset === 0) return lista.slice(0, -1);
  return lista;
}

/** O parágrafo com outra formatação, sem chave vazia sobrando. */
function comFormato<S extends string>(p: Paragrafo<S>, f: FormatoDoParagrafo): Paragrafo<S> {
  const limpo: FormatoDoParagrafo = {};
  if (f.alinhamento && f.alinhamento !== 'esquerda') limpo.alinhamento = f.alinhamento;
  if (f.entrelinha && f.entrelinha !== 1) limpo.entrelinha = f.entrelinha;
  if (f.lista) limpo.lista = f.lista;
  if (f.recuo && f.recuo > 0) limpo.recuo = f.recuo;
  const novo: Paragrafo<S> = { ...p };
  if (Object.keys(limpo).length > 0) novo.formato = limpo;
  else delete novo.formato;
  return novo;
}

/**
 * A formatação de parágrafo vale para **todo** parágrafo que a seleção toca,
 * inteiro — como o estilo. O cursor parado no meio de uma frase basta para
 * centralizar o parágrafo dela.
 */
export function formatarParagrafos<S extends string>(
  d: Doc<S>, s: Selecao, f: (atual: FormatoDoParagrafo) => FormatoDoParagrafo,
): Edicao<S> {
  const alvos = new Set(paragrafosAlcancados(d, s).map(b => b.id));
  return {
    doc: { ...d, blocos: d.blocos.map(b => (alvos.has(b.id) && ehParagrafo(b) ? comFormato(b, f(b.formato ?? {})) : b)) },
    selecao: s,
  };
}

export const alinhar = <S extends string>(d: Doc<S>, s: Selecao, alinhamento: Alinhamento) =>
  formatarParagrafos(d, s, f => ({ ...f, alinhamento }));

export const definirEntrelinha = <S extends string>(d: Doc<S>, s: Selecao, entrelinha: number) =>
  formatarParagrafos(d, s, f => ({ ...f, entrelinha }));

/**
 * Marcadores e Numeração: ligam a lista em todos os parágrafos tocados, e
 * desligam quando todos já estão nela — o botão do Word, que é um interruptor.
 * Trocar de marcadores para numeração é apertar o outro botão: a lista muda
 * de tipo sem precisar ser desligada antes.
 */
export function alternarLista<S extends string>(d: Doc<S>, s: Selecao, tipo: TipoDeLista): Edicao<S> {
  const todos = paragrafosAlcancados(d, s).every(b => b.formato?.lista === tipo);
  return formatarParagrafos(d, s, f => ({ ...f, lista: todos ? undefined : tipo }));
}

/** Aumentar e Diminuir Recuo. Nunca passa da margem, nem de oito degraus. */
export const mudarRecuo = <S extends string>(d: Doc<S>, s: Selecao, delta: 1 | -1) =>
  formatarParagrafos(d, s, f => ({ ...f, recuo: Math.max(0, Math.min(8, (f.recuo ?? 0) + delta)) }));

/**
 * O Tab: no começo de um item de lista, ou com vários parágrafos selecionados,
 * ele recua — é como a lista ganha um subitem no Word. No meio do texto, é um
 * caractere de tabulação. Shift+Tab só desce de nível; fora disso não faz nada.
 */
export function tabular<S extends string>(d: Doc<S>, s: Selecao, voltar: boolean, q?: QuemEdita): Edicao<S> {
  const tocados = paragrafosAlcancados(d, s);
  const umSo = tocados.length === 1 ? tocados[0] : null;
  const noComecoDeItem = !!umSo?.formato?.lista && recolhida(s) && s.foco.offset === 0;
  if (tocados.length > 1 || noComecoDeItem || voltar) {
    if (voltar && !tocados.some(b => (b.formato?.recuo ?? 0) > 0)) return { doc: d, selecao: s };
    return mudarRecuo(d, s, voltar ? -1 : 1);
  }
  return inserirTexto(d, s, '\t', q);
}

/** O estado do grupo Parágrafo da faixa. `null` quando a seleção mistura dois. */
export interface FormatoDoParagrafoDaSelecao {
  alinhamento: Alinhamento | null;
  entrelinha: number | null;
  lista: TipoDeLista | 'nenhuma' | null;
}

export function formatoDoParagrafoDaSelecao(d: Doc<string>, s: Selecao | null): FormatoDoParagrafoDaSelecao {
  const tocados = s ? paragrafosAlcancados(d, s) : [];
  if (tocados.length === 0) return { alinhamento: null, entrelinha: null, lista: null };
  const unico = <T,>(f: (b: Paragrafo<string>) => T): T | null => {
    const v = f(tocados[0]);
    return tocados.every(b => f(b) === v) ? v : null;
  };
  return {
    alinhamento: unico(b => b.formato?.alinhamento ?? 'esquerda'),
    entrelinha: unico(b => b.formato?.entrelinha ?? 1),
    lista: unico(b => b.formato?.lista ?? 'nenhuma'),
  };
}

/* ── O que a faixa mostra ─────────────────────────────────────────────────── */

/**
 * O estado dos botões da faixa para a seleção de agora.
 *
 * Com o cursor parado, é a formatação do caractere de antes dele — a que o
 * próximo caractere digitado herdaria. Com seleção mista, o botão não acende,
 * e o tamanho fica em branco: é o que a caixa de tamanho do Word mostra quando
 * a seleção tem 11 e 16 pontos ao mesmo tempo.
 */
export interface FormatoDaSelecao {
  negrito: boolean;
  italico: boolean;
  sublinhado: boolean;
  tamanho: number | null;
  /** O nome da fonte, ou `null` quando a seleção mistura duas. */
  fonte: string | null;
  estilo: Estilo | null;
}

export function formatoDaSelecao(d: Doc<string>, s: Selecao | null, pendente?: Partial<Direta>): FormatoDaSelecao {
  const vazio: FormatoDaSelecao = { negrito: false, italico: false, sublinhado: false, tamanho: null, fonte: null, estilo: null };
  if (!s) return vazio;
  const ps = paragrafosDaSelecao(d, s);
  const estilos = new Set(ps.map(b => b.estilo));
  const estilo = estilos.size === 1 ? ps[0].estilo : null;
  let pares: { b: Paragrafo<string>; x: Trecho }[];
  if (recolhida(s)) {
    const b = paragrafoPorId(d, s.foco.bloco);
    if (!b) return vazio;
    const { i } = trechoDeOrigem(b.trechos, s.foco.offset);
    pares = [{ b, x: b.trechos[i] }];
  } else {
    pares = trechosDaSelecao(d, s);
    if (pares.length === 0) return { ...vazio, estilo };
  }
  const todos = (m: Marca) => pendente?.[m] ?? pares.every(({ b, x }) => marcaEfetiva(d, b, x, m));
  const tamanhos = new Set(pares.map(({ b, x }) => x.direta?.tamanho ?? Number(aparenciaDe(d, b.estilo).fontSize)));
  const fontes = new Set(pares.map(({ x }) => x.direta?.fonte ?? fonteDoCorpo(d)));
  return {
    fonte: pendente?.fonte ?? (fontes.size === 1 ? [...fontes][0] : null),
    negrito: todos('negrito'),
    italico: todos('italico'),
    sublinhado: todos('sublinhado'),
    tamanho: pendente?.tamanho ?? (tamanhos.size === 1 ? [...tamanhos][0] : null),
    estilo,
  };
}

/* ── Seleção como trecho ──────────────────────────────────────────────────── */

/**
 * Parte os trechos nas bordas da seleção e devolve o id do primeiro trecho
 * dentro dela — é onde um comentário novo se pendura.
 *
 * O comentário do modelo aponta para um trecho só. Quando a seleção pega mais
 * de um, os de formatação igual se fundem no primeiro, e o realce cobre a
 * seleção inteira; os de formatação diferente ficam, e o realce cobre o
 * primeiro, que é onde o balão aponta no Word.
 */
export function isolarSelecao<S extends string>(d: Doc<S>, s: Selecao): { doc: Doc<S>; trecho: string | null } {
  if (recolhida(s)) return { doc: d, trecho: null };
  const { inicio, fim } = ordenar(d, s);
  const b = paragrafoPorId(d, inicio.bloco);
  if (!b) return { doc: d, trecho: null };
  const ate = inicio.bloco === fim.bloco ? fim.offset : tamanhoDoParagrafo(b);
  const ids = new Ids(d);
  const { trechos, de, ate: j } = isolar(b.trechos, inicio.offset, ate, ids);
  const dentro = trechos.slice(de, j);
  if (dentro.length === 0) return { doc: d, trecho: null };
  const primeiro = dentro[0];
  const fundidos: Trecho[] = [primeiro];
  for (const x of dentro.slice(1)) {
    const ultimo = fundidos[fundidos.length - 1];
    const igual = !x.quebra && !x.campo && !ultimo.campo
      && mesmaDireta(x.direta, ultimo.direta)
      && JSON.stringify(x.revisao ?? null) === JSON.stringify(ultimo.revisao ?? null)
      && x.enfase === ultimo.enfase && x.realce === ultimo.realce && x.posicao === ultimo.posicao;
    if (igual) fundidos[fundidos.length - 1] = { ...ultimo, texto: ultimo.texto + x.texto };
    else fundidos.push(x);
  }
  const novo: Paragrafo<S> = { ...b, trechos: [...trechos.slice(0, de), ...fundidos, ...trechos.slice(j)] };
  return { doc: trocarBloco(d, b.id, [novo]), trecho: primeiro.id };
}

/** Onde, no parágrafo, um trecho começa e termina — para selecionar um trecho inteiro. */
export function selecaoDoTrecho(d: Doc<string>, trechoId: string): Selecao | null {
  for (const b of d.blocos) {
    if (!ehParagrafo(b)) continue;
    let pos = 0;
    for (const x of b.trechos) {
      const n = unidadesDoTrecho(x);
      if (x.id === trechoId) {
        const de = pos + (x.quebra ? 1 : 0);
        return { ancora: { bloco: b.id, offset: de }, foco: { bloco: b.id, offset: pos + n } };
      }
      pos += n;
    }
  }
  return null;
}

/**
 * Os trechos dos dois lados do cursor. Com o cursor colado no fim de uma
 * palavra riscada, "a marca em que estou" é a de antes; no começo, a de
 * depois — e o painel de revisão pergunta pelas duas.
 */
export function trechosEmVolta(d: Doc<string>, p: Ponto): { antes: Trecho | null; depois: Trecho | null } {
  const b = paragrafoPorId(d, p.bloco);
  if (!b) return { antes: null, depois: null };
  let pos = 0;
  let antes: Trecho | null = null;
  let depois: Trecho | null = null;
  for (const x of b.trechos) {
    const n = unidadesDoTrecho(x);
    if (n === 0) continue;
    if (pos < p.offset && p.offset <= pos + n) antes = x;
    if (pos <= p.offset && p.offset < pos + n && !depois) depois = x;
    pos += n;
  }
  return { antes, depois };
}

/**
 * A sugestão inteira a que um trecho marcado pertence: os trechos marcados
 * vizinhos, do mesmo autor, no mesmo parágrafo.
 *
 * Trocar uma palavra em modo de Sugestão produz duas marcas — a palavra velha
 * riscada e a nova sublinhada —, e o editor da nuvem as trata como uma
 * sugestão só: um Aceitar aceita as duas. Aceitar só uma deixaria a palavra
 * nova ao lado da velha ainda riscada, um meio-termo que ninguém propôs.
 */
export function sugestaoDoTrecho(d: Doc<string>, trechoId: string): string[] {
  for (const b of d.blocos) {
    if (!ehParagrafo(b)) continue;
    const i = b.trechos.findIndex(x => x.id === trechoId);
    if (i < 0) continue;
    const autor = b.trechos[i].revisao?.autor;
    if (!autor) return [];
    let de = i;
    while (de > 0 && b.trechos[de - 1].revisao?.autor === autor) de--;
    let ate = i;
    while (ate < b.trechos.length - 1 && b.trechos[ate + 1].revisao?.autor === autor) ate++;
    return b.trechos.slice(de, ate + 1).map(x => x.id);
  }
  return [];
}
