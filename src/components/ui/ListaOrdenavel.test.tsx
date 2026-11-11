// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ListaOrdenavel from './ListaOrdenavel';
import { arrastarLinha, comAlturas } from './arrastoNaLista';

/*
  O gesto de pôr em ordem, em todo navegador.

  A lista usava o arrastar nativo do HTML, sem gravar nada em `dataTransfer` no
  `dragstart`. No Chrome isso funciona; no Firefox o gesto nem começa, e em tela
  de toque o evento não existe. A lista continuava desenhando a alça, o cursor
  de mão e o "arraste para trocar de lugar" — e não respondia, sem erro nenhum.
  Todas as questões de ordenar das trilhas, das veredas e das provas passam por
  aqui, então a falha era de todas ao mesmo tempo.

  Os testes antigos disparavam `dragstart` e `dragover` à mão, que é justamente
  o que o Firefox não faz: passavam com a lista quebrada. Aqui o gesto vai pelos
  eventos de ponteiro, que são os mesmos em todo navegador e todo dispositivo.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ITENS = ['a', 'b', 'c', 'd'].map(id => ({ id, conteudo: `item ${id}` }));

let container: HTMLDivElement;
let root: Root;
let semAlturas: () => void;
let reordenacoes = 0;

function Lista({ travada = false }: { travada?: boolean }) {
  const [ordem, setOrdem] = useState(['a', 'b', 'c', 'd']);
  return (
    <ListaOrdenavel itens={ITENS} ordem={ordem} travada={travada}
      aoReordenar={n => { reordenacoes++; setOrdem(n); }} />
  );
}

function montar(travada = false) {
  act(() => { root.render(<Lista travada={travada} />); });
}

beforeEach(() => {
  reordenacoes = 0;
  semAlturas = comAlturas();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  semAlturas();
});

const linhas = () => [...container.querySelectorAll<HTMLElement>('li')];
const ordem = () => linhas().map(l => l.querySelector('span.flex-1')?.textContent);
const base = { pointerId: 9, clientX: 100, bubbles: true, cancelable: true };

describe('arrastar com o mouse', () => {
  it('não usa o arrastar nativo do HTML, que o Firefox não começa sem dataTransfer', () => {
    montar();
    for (const l of linhas()) expect(l.hasAttribute('draggable')).toBe(false);
  });

  it('leva a linha para baixo e para cima, apertando em qualquer parte dela', () => {
    montar();
    arrastarLinha(linhas()[0], linhas()[2]);
    expect(ordem()).toEqual(['item b', 'item c', 'item a', 'item d']);
    arrastarLinha(linhas()[3], linhas()[0], { onde: linhas()[3].querySelector('span.w-6')! });
    expect(ordem()).toEqual(['item d', 'item b', 'item c', 'item a']);
  });

  it('um clique sem andar não troca nada de lugar', () => {
    montar();
    const texto = linhas()[1].querySelector('span.flex-1')!;
    act(() => { texto.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerType: 'mouse', button: 0, clientY: 70 })); });
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, pointerType: 'mouse', clientY: 72 })); });
    act(() => { window.dispatchEvent(new PointerEvent('pointerup', { ...base, pointerType: 'mouse', clientY: 72 })); });
    expect(reordenacoes).toBe(0);
  });

  it('apertar numa seta não começa arrasto', () => {
    montar();
    const descer = linhas()[0].querySelector('button[aria-label="Descer um lugar"]')!;
    arrastarLinha(linhas()[0], linhas()[3], { onde: descer });
    expect(reordenacoes).toBe(0);
  });

  it('o botão direito não arrasta', () => {
    montar();
    const texto = linhas()[0].querySelector('span.flex-1')!;
    act(() => { texto.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerType: 'mouse', button: 2, clientY: 20 })); });
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, pointerType: 'mouse', clientY: 180 })); });
    expect(reordenacoes).toBe(0);
  });

  it('soltou, acabou: andar depois não mexe mais', () => {
    montar();
    arrastarLinha(linhas()[0], linhas()[1]);
    const depois = ordem();
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, pointerType: 'mouse', clientY: 190 })); });
    expect(ordem()).toEqual(depois);
  });

  it('travada, não arrasta', () => {
    montar(true);
    arrastarLinha(linhas()[0], linhas()[3]);
    expect(reordenacoes).toBe(0);
  });
});

describe('arrastar com o dedo', () => {
  it('arrasta pela alça', () => {
    montar();
    const alca = linhas()[0].querySelector('[data-alca]')!;
    arrastarLinha(linhas()[0], linhas()[2], { pointerType: 'touch', onde: alca });
    expect(ordem()).toEqual(['item b', 'item c', 'item a', 'item d']);
  });

  /* Encostar no texto precisa rolar a página: uma lista que prendesse o dedo
     em qualquer lugar prenderia a tela inteira do celular. */
  it('no resto da linha não arrasta, e a alça é a única sem rolagem', () => {
    montar();
    arrastarLinha(linhas()[0], linhas()[2], { pointerType: 'touch' });
    expect(reordenacoes).toBe(0);
    const alca = linhas()[0].querySelector<HTMLElement>('[data-alca]')!;
    expect(alca.style.touchAction).toBe('none');
    expect(linhas()[0].style.touchAction).toBe('');
  });
});

it('desmontar no meio do gesto não deixa ouvinte na janela', () => {
  montar();
  const texto = linhas()[0].querySelector('span.flex-1')!;
  act(() => { texto.dispatchEvent(new PointerEvent('pointerdown', { ...base, pointerType: 'mouse', button: 0, clientY: 20 })); });
  act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, pointerType: 'mouse', clientY: 30 })); });
  act(() => root.unmount());
  const antes = reordenacoes;
  expect(() => window.dispatchEvent(new PointerEvent('pointermove', { ...base, pointerType: 'mouse', clientY: 180 }))).not.toThrow();
  expect(reordenacoes).toBe(antes);
  root = createRoot(container);
});
