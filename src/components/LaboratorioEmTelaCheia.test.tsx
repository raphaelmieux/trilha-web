// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';

/*
  O aviso de tela pequena promete duas coisas ao desbravador: que aparece, e
  que aparece uma vez só. A segunda é a frágil — um aviso que volta a cada
  lição vira estorvo, e o estorvo é o que faz a pessoa parar de ler avisos.

  A largura em si é do CSS (`md:hidden`), e o jsdom não aplica media query.
  O que se confere aqui é a memória.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const montar = () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioEmTelaCheia
          trilha="AP041"
          titulo="Mexendo em pastas e arquivos"
          tarefas={[{ id: 't1', titulo: 'Fazer alguma coisa', feita: false }]}
        >
          <p>o programa imitado</p>
        </LaboratorioEmTelaCheia>
      </MemoryRouter>,
    );
  });
};

const desmontar = () => {
  act(() => root.unmount());
  container.remove();
};

beforeEach(() => { localStorage.clear(); });
afterEach(() => { localStorage.clear(); });

const botao = (texto: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.includes(texto));

describe('o aviso de tela pequena', () => {
  it('aparece na primeira vez', () => {
    montar();
    expect(container.textContent).toContain('Melhor numa tela maior');
    desmontar();
  });

  it('some ao ser dispensado, e abre a lista de tarefas no lugar', () => {
    montar();
    act(() => { botao('Entendi')!.click(); });
    expect(container.textContent).not.toContain('Melhor numa tela maior');
    expect(container.textContent, 'a bolha abriu').toContain('Fazer alguma coisa');
    desmontar();
  });

  it('não volta na lição seguinte', () => {
    montar();
    act(() => { botao('Entendi')!.click(); });
    desmontar();

    montar();
    expect(container.textContent).not.toContain('Melhor numa tela maior');
    desmontar();
  });

  it('aparece de novo quando o navegador não deixa guardar nada', () => {
    const guardar = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('modo privado'); };
    try {
      montar();
      act(() => { botao('Entendi')!.click(); });
      desmontar();

      montar();
      expect(container.textContent, 'sem memória, o aviso volta — e não quebra').toContain('Melhor numa tela maior');
      desmontar();
    } finally {
      Storage.prototype.setItem = guardar;
    }
  });
});
