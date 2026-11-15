// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import MeuDicionario from './MeuDicionario';
import { acrescentarAoDicionario, palavrasDoDicionario, recarregarDicionario } from '../lib/dicionarioPessoal';

/*
  A lista do dicionário pessoal lê o mesmo módulo que o corretor: o que se tira
  aqui some do corretor, e o que outra tela acrescenta aparece aqui sem
  recarregar. Uma lista copiada para dentro do componente mostraria palavras
  que o corretor já esqueceu.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  recarregarDicionario();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<MeuDicionario />); });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  recarregarDicionario();
});

const lista = () => [...container.querySelectorAll('li')].map(li => li.textContent);
const campo = () => container.querySelector<HTMLInputElement>('input[aria-label="Palavra a acrescentar"]')!;
const escrever = (texto: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo(), texto);
    campo().dispatchEvent(new Event('input', { bubbles: true }));
  });
};
const acrescentar = () => act(() => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });

describe('o dicionário pessoal no perfil', () => {
  it('vazio, explica como as palavras chegam lá', () => {
    expect(lista()).toEqual([]);
    expect(container.textContent).toContain('Adicionar ao Dicionário');
  });

  it('a palavra acrescentada noutra tela aparece sem recarregar, em ordem de dicionário', () => {
    act(() => { acrescentarAoDicionario('Taguatinga'); acrescentarAoDicionario('Águas'); });
    expect(lista()).toEqual(['Águas', 'Taguatinga']);
  });

  it('tirar daqui tira do corretor', () => {
    act(() => { acrescentarAoDicionario('acampamneto'); });
    act(() => { container.querySelector<HTMLButtonElement>('button[aria-label^="Tirar"]')!.click(); });
    expect(lista()).toEqual([]);
    expect(palavrasDoDicionario().has('acampamneto')).toBe(false);
  });

  it('acrescenta pelo campo, e recusa o que o banco recusaria', () => {
    escrever('Sobradinho');
    acrescentar();
    expect(palavrasDoDicionario().has('Sobradinho')).toBe(true);
    expect(campo().value).toBe('');
    escrever('duas palavras');
    acrescentar();
    expect(palavrasDoDicionario().has('duas palavras')).toBe(false);
    expect(container.querySelector('[role="status"]')?.textContent).toContain('sem espaço');
  });
});
