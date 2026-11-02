/**
 * A ponte entre o cursor do navegador e a posição no documento.
 *
 * ── Por que o cursor é o do navegador ────────────────────────────────────
 * A folha é `contenteditable`, e o cursor que pisca nela é o do próprio
 * navegador. Desenhar um cursor nosso daria controle total e jogaria fora tudo
 * o que o navegador já faz igual ao Word e que nenhuma reimplementação acerta
 * inteiro: setas que sobem e descem pela linha visual, Home e End da linha,
 * Shift+seta, clique duplo na palavra, clique triplo no parágrafo, arrastar
 * para selecionar — e, no celular, a lupa e as alças de seleção do sistema.
 *
 * O que o navegador **não** faz é escrever no documento: toda tecla que
 * mudaria o texto é interceptada antes, vira um comando do motor de
 * `edicao.ts`, e a folha é redesenhada a partir do modelo. Assim o DOM nunca
 * é a fonte da verdade — se fosse, o negrito do Chrome viraria `<b>` dentro de
 * um trecho, e as metas leriam um documento que a tela não mostra.
 *
 * ── As folhas da árvore ──────────────────────────────────────────────────
 * Dentro de um parágrafo, cada coisa que ocupa unidade é uma "folha" do
 * percurso: o nó de texto de um trecho (tantas unidades quantas letras), o
 * campo (uma), o `<br>` de quebra de linha (uma). O ¶ e o ↵ das marcas são
 * desenho e valem zero. Ler e escrever a posição é andar por essas folhas na
 * ordem do documento, somando.
 */

import type { Ponto, Selecao } from './edicao';

interface FolhaDoPercurso {
  no: Node;
  tamanho: number;
  texto: boolean;
}

const ehElemento = (n: Node): n is HTMLElement => n.nodeType === 1;

/** As folhas de um parágrafo, na ordem. */
function folhas(p: HTMLElement): FolhaDoPercurso[] {
  const r: FolhaDoPercurso[] = [];
  const andar = (n: Node) => {
    if (ehElemento(n)) {
      if (n.dataset.campo !== undefined && n.dataset.trecho !== undefined) {
        r.push({ no: n, tamanho: 1, texto: false });
        return;
      }
      if (n.tagName === 'BR') {
        r.push({ no: n, tamanho: n.dataset.quebra !== undefined ? 1 : 0, texto: false });
        return;
      }
      if (n.classList.contains('wd-marca')) {
        r.push({ no: n, tamanho: 0, texto: false });
        return;
      }
      n.childNodes.forEach(andar);
      return;
    }
    if (n.nodeType === 3) {
      const dono = n.parentElement?.closest('[data-trecho]');
      r.push({ no: n, tamanho: dono ? (n.textContent ?? '').length : 0, texto: !!dono });
    }
  };
  p.childNodes.forEach(andar);
  return r;
}

/** `a` vem antes de `b` no documento (e não está dentro dele)? */
const antes = (a: Node, b: Node) =>
  !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
  && !(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_CONTAINED_BY);

const paragrafosDa = (raiz: HTMLElement) =>
  [...raiz.querySelectorAll<HTMLElement>('p[data-bloco][data-editavel]')];

/** A posição no modelo de um ponto do DOM. `null` fora de qualquer parágrafo editável. */
export function pontoDoDom(raiz: HTMLElement, no: Node, offset: number): Ponto | null {
  if (!raiz.contains(no)) return null;
  const el = ehElemento(no) ? no : no.parentElement;
  const p = el?.closest<HTMLElement>('p[data-bloco][data-editavel]');
  if (!p || !raiz.contains(p)) {
    /* Entre parágrafos — o clique na margem da folha, ou o Ctrl+A do
       navegador, que pega a raiz inteira. Vale o parágrafo mais próximo
       depois do ponto; não havendo, o fim do último. */
    const todos = paragrafosDa(raiz);
    const alvo = ehElemento(no) ? (no.childNodes[offset] ?? null) : no;
    for (const q of todos) {
      if (alvo === null ? false : (alvo === q || alvo.contains(q) || antes(alvo, q))) {
        return { bloco: q.dataset.bloco!, offset: 0 };
      }
    }
    const ultimo = todos[todos.length - 1];
    if (!ultimo) return null;
    return { bloco: ultimo.dataset.bloco!, offset: folhas(ultimo).reduce((n, f) => n + f.tamanho, 0) };
  }
  const bloco = p.dataset.bloco!;
  let total = 0;
  /* Um ponto dentro de um campo cai antes dele, ou logo depois quando está no
     fim do texto do campo: o campo é uma unidade só, e o cursor não mora no
     meio da "Figura 1". */
  const campo = el!.closest<HTMLElement>('[data-campo][data-trecho]');
  if (campo) {
    const noFim = offset > 0 && offset >= (no.nodeType === 3 ? (no.textContent ?? '').length : no.childNodes.length);
    for (const f of folhas(p)) {
      if (f.no === campo) return { bloco, offset: total + (noFim ? 1 : 0) };
      total += f.tamanho;
    }
    return { bloco, offset: total };
  }
  if (no.nodeType === 3) {
    for (const f of folhas(p)) {
      if (f.no === no) return { bloco, offset: total + (f.texto ? Math.min(offset, f.tamanho) : 0) };
      total += f.tamanho;
    }
    return { bloco, offset: total };
  }
  /* Ponto num elemento: é "antes do filho `offset`". Conta-se tudo o que vem
     antes desse filho; sem filho, tudo o que está dentro do elemento. */
  const referencia = no.childNodes[offset] ?? null;
  for (const f of folhas(p)) {
    if (referencia) {
      if (f.no === referencia || referencia.contains(f.no) || antes(referencia, f.no)) break;
    } else if (!(no.contains(f.no) || antes(f.no, no))) {
      break;
    }
    total += f.tamanho;
  }
  return { bloco, offset: total };
}

/** O ponto do DOM onde o cursor do modelo deve aparecer. */
export function domDoPonto(raiz: HTMLElement, ponto: Ponto): { no: Node; offset: number } | null {
  const p = raiz.querySelector<HTMLElement>(`p[data-bloco="${CSS.escape(ponto.bloco)}"][data-editavel]`);
  if (!p) return null;
  const lista = folhas(p);
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    const f = lista[i];
    if (f.texto && ponto.offset >= total && ponto.offset <= total + f.tamanho) {
      return { no: f.no, offset: ponto.offset - total };
    }
    if (!f.texto && f.tamanho > 0) {
      const pai = f.no.parentNode!;
      const indice = [...pai.childNodes].indexOf(f.no as ChildNode);
      if (ponto.offset === total) return { no: pai, offset: indice };
      if (ponto.offset === total + f.tamanho) {
        /* Logo depois de uma quebra ou de um campo: se o que vem em seguida é
           texto, o cursor mora no começo dele; senão, logo depois da peça. */
        const seguinte = lista.slice(i + 1).find(x => x.tamanho > 0 || x.texto);
        if (seguinte?.texto) return { no: seguinte.no, offset: 0 };
        return { no: pai, offset: indice + 1 };
      }
    }
    total += f.tamanho;
  }
  /* Parágrafo vazio, ou o fim depois de peças sem texto: antes do ¶ e do
     `<br>` que segura a altura da linha. */
  const marca = [...p.childNodes].findIndex(n => ehElemento(n)
    && (n.classList.contains('wd-marca') || n.dataset.vazio !== undefined));
  return { no: p, offset: marca >= 0 ? marca : p.childNodes.length };
}

/** A seleção do navegador, lida como seleção do modelo. */
export function lerSelecao(raiz: HTMLElement): Selecao | null {
  const s = raiz.ownerDocument.getSelection();
  if (!s || s.rangeCount === 0 || !s.anchorNode || !s.focusNode) return null;
  if (!raiz.contains(s.anchorNode) || !raiz.contains(s.focusNode)) return null;
  /* Dentro de uma ilha que não se edita — o campo do cabeçalho, o balão de
     comentário — a seleção é daquele campo, e não do documento. */
  const ilha = (n: Node) => (ehElemento(n) ? n : n.parentElement)?.closest('[contenteditable="false"]');
  const ancoraIlha = ilha(s.anchorNode);
  if (ancoraIlha && !ancoraIlha.closest('[data-campo]') && raiz.contains(ancoraIlha)) return null;
  const ancora = pontoDoDom(raiz, s.anchorNode, s.anchorOffset);
  const foco = pontoDoDom(raiz, s.focusNode, s.focusOffset);
  return ancora && foco ? { ancora, foco } : null;
}

/** Põe a seleção do modelo no navegador, com a direção dela. */
export function escreverSelecao(raiz: HTMLElement, sel: Selecao) {
  const s = raiz.ownerDocument.getSelection();
  if (!s) return;
  const a = domDoPonto(raiz, sel.ancora);
  const f = domDoPonto(raiz, sel.foco);
  if (!a || !f) return;
  if (s.anchorNode === a.no && s.anchorOffset === a.offset && s.focusNode === f.no && s.focusOffset === f.offset) return;
  try {
    s.setBaseAndExtent(a.no, a.offset, f.no, f.offset);
  } catch {
    /* Um nó que o React acabou de trocar ainda não está no documento. A
       próxima pintura acerta. */
  }
}
