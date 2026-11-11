// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import QuestionRenderer from './QuestionRenderer';
import { checkAnswer } from '../../lib/checkAnswer';
import { arrastarLinha, comAlturas } from '../ui/arrastoNaLista';
import type { Question } from '../../types';

/*
  A questão de ordenar, mexida do jeito que se mexe em qualquer lista.

  Ela já chegava embaralhada — o que faltava era poder arrastar o item até o
  lugar, em vez de subir de um em um pelas setas. As setas continuam, porque
  são o caminho de quem usa teclado e de quem não acerta o gesto: nenhuma
  questão pode depender de um dos dois caminhos.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const questao: Question = {
  id: 'Q', type: 'ordering', prompt: 'Ordene',
  data: {
    items: [
      /* Escrita fora de ordem de propósito: quem manda é `order`. */
      { id: 'c', text: 'terceiro', order: 3 },
      { id: 'a', text: 'primeiro', order: 1 },
      { id: 'd', text: 'quarto', order: 4 },
      { id: 'b', text: 'segundo', order: 2 },
    ],
  },
};

let container: HTMLDivElement;
let root: Root;
let ultimaResposta: string[] | null = null;
let semAlturas: () => void;

beforeEach(() => {
  ultimaResposta = null;
  semAlturas = comAlturas();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <QuestionRenderer
        question={questao}
        answer={undefined}
        showFeedback={false}
        onAnswer={r => { ultimaResposta = r as string[]; }}
      />,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  semAlturas();
});

const linhas = () => [...container.querySelectorAll<HTMLElement>('li[data-ordenavel]')];
const textos = () => linhas().map(l => l.querySelector('span.flex-1')?.textContent);
const linhaDe = (texto: string) => linhas().find(l => l.textContent?.includes(texto))!;

const arrastar = (de: string, para: string) => arrastarLinha(linhaDe(de), linhaDe(para));

describe('mexer nos itens', () => {
  it('deixa cada item ser arrastado', () => {
    expect(linhas()).toHaveLength(4);
    for (const l of linhas()) expect(l.querySelector('[data-alca]')).not.toBeNull();
  });

  it('avisa que dá para arrastar', () => {
    expect(container.textContent).toContain('Arraste para trocar de lugar');
  });

  it('leva o item para o lugar de quem recebeu', () => {
    const antes = textos();
    arrastar(antes[3]!, antes[0]!);
    expect(textos()[0]).toBe(antes[3]);
  });

  /* A lista acompanha o gesto: sem isso, só se descobre onde a peça caiu depois
     de largá-la. */
  it('reordena já ao passar por cima, antes de soltar', () => {
    const antes = textos();
    const origem = linhaDe(antes[2]!);
    const base = { pointerId: 3, pointerType: 'mouse', clientX: 100, bubbles: true };
    act(() => { origem.querySelector('span.flex-1')!.dispatchEvent(new PointerEvent('pointerdown', { ...base, button: 0, clientY: 120 })); });
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientY: 110 })); });
    act(() => { window.dispatchEvent(new PointerEvent('pointermove', { ...base, clientY: 5 })); });
    expect(textos()[0]).toBe(antes[2]);
    act(() => { window.dispatchEvent(new PointerEvent('pointerup', { ...base, clientY: 5 })); });
  });

  it('as setas continuam funcionando, para quem não arrasta', () => {
    const antes = textos();
    const subir = linhaDe(antes[1]!).querySelector<HTMLButtonElement>('button[aria-label="Subir um lugar"]')!;
    act(() => { subir.click(); });
    expect(textos()[0]).toBe(antes[1]);
  });

  it('não deixa o primeiro subir nem o último descer', () => {
    expect(linhas()[0].querySelector<HTMLButtonElement>('button[aria-label="Subir um lugar"]')!.disabled).toBe(true);
    expect(linhas()[3].querySelector<HTMLButtonElement>('button[aria-label="Descer um lugar"]')!.disabled).toBe(true);
  });
});

describe('a resposta que sai daqui', () => {
  it('é aceita quando a ordem montada é a certa', () => {
    /* Monta a sequência certa arrastando, e confirma. */
    for (const alvo of ['primeiro', 'segundo', 'terceiro', 'quarto']) {
      const atual = textos();
      const destino = atual[['primeiro', 'segundo', 'terceiro', 'quarto'].indexOf(alvo)];
      if (destino !== alvo) arrastar(alvo, destino!);
    }
    const confirmar = [...container.querySelectorAll('button')]
      .find(b => /confirmar/i.test(b.textContent ?? ''))!;
    act(() => { confirmar.click(); });

    expect(ultimaResposta).toEqual(['a', 'b', 'c', 'd']);
    expect(checkAnswer(questao, ultimaResposta)).toBe(true);
  });
});
