// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useRascunhoLocal } from './useRascunhoLocal';
import { lerRascunho } from '../lib/rascunho';

/*
  O rascunho tem de estar gravado antes de a página sumir.

  O laboratório de navegação pede que a pessoa abra a pesquisa de verdade, num
  link para outra aba. Quem faz isso pelo celular voltava e encontrava "0 de 4":
  o clique liga o estado e o navegador troca de página no mesmo instante, sem
  dar os meio segundo que a gravação esperava. No computador a aba de origem
  continua viva, grava, e o defeito não aparece — que é por que ele durou.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const USUARIO = 'u1';
const LICAO = 'AP034-L1';

function Lab({ conteudo, ativo = true }: { conteudo: unknown; ativo?: boolean }) {
  useRascunhoLocal(USUARIO, LICAO, conteudo, ativo);
  return null;
}

let container: HTMLDivElement;
let root: Root;

const desenhar = (conteudo: unknown, ativo = true) => {
  act(() => { root.render(<Lab conteudo={conteudo} ativo={ativo} />); });
};

/** Esconde a aba, como faz o navegador quando outra assume. */
const esconder = () => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  act(() => { document.dispatchEvent(new Event('visibilitychange')); });
};

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('a gravação do rascunho', () => {
  it('grava na hora quando a aba é escondida, sem esperar a pausa', () => {
    desenhar({ searchOpened: true });
    /* Nada de avançar o relógio: é justamente o meio segundo que não existe. */
    expect(lerRascunho(USUARIO, LICAO)).toBeUndefined();

    esconder();

    expect(lerRascunho<{ searchOpened: boolean }>(USUARIO, LICAO)?.conteudo).toEqual({ searchOpened: true });
  });

  it('grava ao sair da página de vez', () => {
    desenhar({ query: 'texto a meio caminho' });
    act(() => { window.dispatchEvent(new Event('pagehide')); });

    expect(lerRascunho<{ query: string }>(USUARIO, LICAO)?.conteudo).toEqual({ query: 'texto a meio caminho' });
  });

  /* Trocar de tela dentro do aplicativo não passa por nenhum dos dois eventos. */
  it('grava ao desmontar a tela', () => {
    desenhar({ typed: 'meio parágrafo' });
    act(() => root.unmount());

    expect(lerRascunho<{ typed: string }>(USUARIO, LICAO)?.conteudo).toEqual({ typed: 'meio parágrafo' });

    /* Para o afterEach não desmontar duas vezes. */
    root = createRoot(container);
  });

  /* `ativo` é o que protege um rascunho bom de ser apagado pelo estado vazio
     do primeiro instante, e a gravação de emergência tem de respeitá-lo. */
  it('não grava nada quando está desligada', () => {
    desenhar({ typed: 'não deveria ir para o disco' }, false);
    esconder();

    expect(lerRascunho(USUARIO, LICAO)).toBeUndefined();
  });

  it('guarda o conteúdo mais recente, e não o do primeiro render', () => {
    desenhar({ passo: 1 });
    desenhar({ passo: 2 });
    esconder();

    expect(lerRascunho<{ passo: number }>(USUARIO, LICAO)?.conteudo).toEqual({ passo: 2 });
  });
});
