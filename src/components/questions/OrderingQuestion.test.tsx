// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import QuestionRenderer from './QuestionRenderer';
import { checkAnswer } from '../../lib/checkAnswer';
import type { Question } from '../../types';

/*
  A questão de ordenar, mexida do jeito que se mexe em qualquer lista.

  Ela já chegava embaralhada — o que faltava era poder arrastar o item até o
  lugar, em vez de subir de um em um pelas setas. As setas continuam, porque
  arrastar não existe em tela de toque e boa parte dos desbravadores abre a
  trilha pelo celular: nenhuma questão pode depender de um dos dois caminhos.
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

beforeEach(() => {
  ultimaResposta = null;
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
});

const linhas = () => [...container.querySelectorAll<HTMLElement>('[draggable]')];
const textos = () => linhas().map(l => l.querySelector('span.flex-1')?.textContent);
const linhaDe = (texto: string) => linhas().find(l => l.textContent?.includes(texto))!;

const arrastar = (de: string, para: string) => {
  const origem = linhaDe(de);
  const alvo = linhaDe(para);
  act(() => { origem.dispatchEvent(new MouseEvent('dragstart', { bubbles: true })); });
  act(() => { alvo.dispatchEvent(new MouseEvent('dragover', { bubbles: true, cancelable: true })); });
  act(() => { alvo.dispatchEvent(new MouseEvent('drop', { bubbles: true, cancelable: true })); });
};

describe('mexer nos itens', () => {
  it('deixa cada item ser arrastado', () => {
    expect(linhas()).toHaveLength(4);
    for (const l of linhas()) expect(l.getAttribute('draggable')).toBe('true');
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
    const alvo = linhaDe(antes[0]!);
    act(() => { origem.dispatchEvent(new MouseEvent('dragstart', { bubbles: true })); });
    act(() => { alvo.dispatchEvent(new MouseEvent('dragover', { bubbles: true, cancelable: true })); });
    expect(textos()[0]).toBe(antes[2]);
  });

  it('as setas continuam funcionando, para quem está no celular', () => {
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
