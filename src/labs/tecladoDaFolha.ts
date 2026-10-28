import { act } from 'react';
import { domDoPonto } from './cursorNaFolha';

/*
 * O teclado e o mouse das travas que digitam na folha do Word.
 *
 * O jsdom não tem layout: clique não põe cursor e tecla não escreve nada.
 * Estas ajudas fazem o que o navegador faria — põem a seleção onde a pessoa
 * clicaria e disparam os eventos que a tecla dispararia —, e deixam a folha
 * reagir pelo caminho de verdade, o mesmo `beforeinput` e o mesmo `keydown`
 * que o Chromium manda. Nada aqui chama o motor direto: a trava que clica
 * existe para provar que a **tela** chega até ele.
 */

/** A folha editável dentro do contêiner. */
export function folhaEditavel(c: HTMLElement): HTMLElement {
  const f = c.querySelector<HTMLElement>('.wd-canvas[contenteditable="true"]');
  if (!f) throw new Error('não há folha editável na tela');
  return f;
}

/**
 * Põe o cursor — ou a seleção, com `ate` — onde o modelo diz, como um clique
 * ou um arrasto do mouse poria.
 */
export function porCursor(
  c: HTMLElement, bloco: string, offset: number | 'fim', ate?: { bloco: string; offset: number | 'fim' },
) {
  const f = folhaEditavel(c);
  const fim = (b: string) => {
    const p = f.querySelector<HTMLElement>(`p[data-bloco="${b}"]`);
    if (!p) throw new Error(`não há parágrafo ${b} na folha`);
    const unidades = [...p.querySelectorAll<HTMLElement>('[data-trecho], br[data-quebra]')]
      .reduce((n, el) => n + (el.tagName === 'BR' || el.dataset.campo !== undefined ? 1 : (el.textContent ?? '').length), 0);
    return unidades;
  };
  const o1 = offset === 'fim' ? fim(bloco) : offset;
  const a = domDoPonto(f, { bloco, offset: o1 });
  const z = ate ? domDoPonto(f, { bloco: ate.bloco, offset: ate.offset === 'fim' ? fim(ate.bloco) : ate.offset }) : a;
  if (!a || !z) throw new Error(`não achei ${bloco}:${o1} na folha`);
  act(() => {
    f.focus();
    document.getSelection()!.setBaseAndExtent(a.no, a.offset, z.no, z.offset);
    document.dispatchEvent(new Event('selectionchange'));
  });
}

/** Uma tecla, com os modificadores que vierem. */
export function tecla(c: HTMLElement, key: string, mods: { ctrl?: boolean; shift?: boolean; code?: string } = {}) {
  const f = folhaEditavel(c);
  act(() => {
    f.dispatchEvent(new KeyboardEvent('keydown', {
      key, code: mods.code, bubbles: true, cancelable: true, ctrlKey: !!mods.ctrl, shiftKey: !!mods.shift,
    }));
  });
}

/** Um evento de área de transferência com uma área de mentira, que o jsdom não tem. */
function eventoDaArea(tipo: 'copy' | 'cut' | 'paste', area: Map<string, string>): Event {
  const ev = new Event(tipo, { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'clipboardData', {
    value: {
      getData: (t: string) => area.get(t) ?? '',
      setData: (t: string, v: string) => { area.set(t, v); },
    },
  });
  return ev;
}

/**
 * Ctrl+C, Ctrl+X e Ctrl+V pelo caminho do navegador: o evento de cópia, de
 * recorte ou de colagem na folha, com uma área de transferência compartilhada
 * entre as chamadas. Devolve o que ficou nela.
 */
const AREA = new Map<string, string>();
export function copiar(c: HTMLElement): string {
  const f = folhaEditavel(c);
  act(() => { f.dispatchEvent(eventoDaArea('copy', AREA)); });
  return AREA.get('text/plain') ?? '';
}
export function recortar(c: HTMLElement): string {
  const f = folhaEditavel(c);
  act(() => { f.dispatchEvent(eventoDaArea('cut', AREA)); });
  return AREA.get('text/plain') ?? '';
}
/** Ctrl+V com o que está na área — ou com um texto que veio de outra janela. */
export function colarDaArea(c: HTMLElement, deFora?: string) {
  const f = folhaEditavel(c);
  if (deFora !== undefined) AREA.set('text/plain', deFora);
  act(() => { f.dispatchEvent(eventoDaArea('paste', AREA)); });
}

/** Digita o texto, letra por letra, pelo `beforeinput` que o navegador mandaria. */
export function digitar(c: HTMLElement, texto: string) {
  const f = folhaEditavel(c);
  for (const letra of texto) {
    if (letra === '\n') { tecla(c, 'Enter'); continue; }
    act(() => {
      f.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertText', data: letra, bubbles: true, cancelable: true,
      }));
    });
  }
}

/**
 * Cola um texto de uma vez. O jsdom não tem área de transferência, e o que a
 * folha recebe de um Ctrl+V é o mesmo comando de inserir — então a trava manda
 * o texto inteiro num `beforeinput` só, como o navegador faz com o que o
 * corretor do celular completa.
 */
export function colar(c: HTMLElement, texto: string) {
  const f = folhaEditavel(c);
  act(() => {
    f.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText', data: texto, bubbles: true, cancelable: true,
    }));
  });
}
