import { act } from 'react';

/*
 * Arrastar uma linha do `ListaOrdenavel` num teste, pelos mesmos eventos de
 * ponteiro que o navegador dispara.
 *
 * O jsdom não tem layout: toda caixa mede zero, e a lista não teria como saber
 * para onde a peça foi. `comAlturas` dá a cada linha uma caixa de 40 px a cada
 * 50, calculada pela posição dela no DOM **na hora da leitura** — a lista se
 * reordena no meio do gesto, e uma caixa fixa por linha mentiria depois da
 * primeira troca.
 */

export const ALTURA = 40;
export const PASSO = 50;

export function comAlturas(): () => void {
  const original = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.tagName !== 'LI' || !this.parentElement) return original.call(this);
    const i = [...this.parentElement.children].indexOf(this);
    const top = i * PASSO;
    return { top, bottom: top + ALTURA, left: 0, right: 600, width: 600, height: ALTURA, x: 0, y: top, toJSON() {} } as DOMRect;
  };
  return () => { HTMLElement.prototype.getBoundingClientRect = original; };
}

const centro = (linha: HTMLElement) => {
  const r = linha.getBoundingClientRect();
  return r.top + r.height / 2;
};

/**
 * Aperta em `origem`, anda até um pixel além do meio de `alvo` e solta.
 * `onde` escolhe o ponto do aperto dentro da linha; por padrão, o texto.
 */
export function arrastarLinha(
  origem: HTMLElement,
  alvo: HTMLElement,
  { pointerType = 'mouse', onde }: { pointerType?: string; onde?: Element } = {},
) {
  const y0 = centro(origem);
  const yAlvo = centro(alvo);
  const y1 = yAlvo + (yAlvo >= y0 ? 1 : -1);
  const ponto = onde ?? origem.querySelector('span.flex-1') ?? origem;
  const base = { pointerId: 7, pointerType, clientX: 100, bubbles: true, cancelable: true };
  act(() => { ponto.dispatchEvent(new PointerEvent('pointerdown', { ...base, button: 0, clientY: y0 })); });
  /* Dois passos: o primeiro só vence a folga do clique, o segundo chega. */
  act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientY: y0 + Math.sign(y1 - y0) * 6 })); });
  act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientY: y1 })); });
  act(() => { window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientY: y1 })); });
}
