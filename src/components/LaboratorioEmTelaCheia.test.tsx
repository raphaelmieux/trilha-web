// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

const PASSOS = ['Abra o menu Arquivo.', 'Escolha Salvar como.'];

const montar = (tarefas = [{ id: 't1', titulo: 'Fazer alguma coisa', feita: false }]) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioEmTelaCheia
          trilha="AP041"
          titulo="Mexendo em pastas e arquivos"
          tarefas={tarefas}
        >
          <p>o programa imitado</p>
        </LaboratorioEmTelaCheia>
      </MemoryRouter>,
    );
  });
};

const rerender = (tarefas: { id: string; titulo: string; feita: boolean; passos?: string[] }[]) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioEmTelaCheia
          trilha="AP041"
          titulo="Mexendo em pastas e arquivos"
          tarefas={tarefas}
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

/* ── O passo a passo ──────────────────────────────────────────────────────── */

describe('o passo a passo de quem travou', () => {
  const comPassos = (feita = false) => [
    { id: 't1', titulo: 'Salvar em pdf', feita, passos: PASSOS },
    { id: 't2', titulo: 'Imprimir', feita: false, passos: ['Menu Arquivo, Imprimir.'] },
  ];

  beforeEach(() => { vi.useFakeTimers(); localStorage.setItem('trilha:aviso-tela-pequena', '1'); });
  afterEach(() => { vi.useRealTimers(); });

  const correr = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

  /* Não aparecer de saída é metade do ponto: quem está achando sozinho tem o
     direito de achar sozinho. */
  it('não aparece nos primeiros segundos', () => {
    montar(comPassos());
    correr(30_000);
    expect(container.textContent).not.toContain('Travou?');
    desmontar();
  });

  it('é oferecido depois de um tempo sem ninguém concluir nada', () => {
    montar(comPassos());
    correr(95_000);
    expect(container.textContent).toContain('Travou?');
    expect(container.textContent, 'e é convite, não despejo').not.toContain(PASSOS[0]);
    desmontar();
  });

  it('mostra os passos da tarefa da vez quando aberto', () => {
    montar(comPassos());
    correr(95_000);
    act(() => { botao('Travou?')!.click(); });
    for (const passo of PASSOS) expect(container.textContent).toContain(passo);
    expect(container.textContent, 'e só os dela').not.toContain('Menu Arquivo, Imprimir.');
    desmontar();
  });

  /* Concluir a tarefa reinicia a contagem: a próxima começa do zero, e quem
     está indo bem não recebe ajuda que não pediu. */
  it('recolhe e recomeça a contagem quando a tarefa é concluída', () => {
    montar(comPassos());
    correr(95_000);
    act(() => { botao('Travou?')!.click(); });
    expect(container.textContent).toContain(PASSOS[0]);

    rerender(comPassos(true));
    expect(container.textContent, 'sumiu junto com a tarefa').not.toContain('Travou?');
    correr(95_000);
    expect(container.textContent, 'e volta a ser oferecido para a seguinte').toContain('Travou?');
    desmontar();
  });

  it('não oferece nada quando a tarefa não trouxe passos', () => {
    montar([{ id: 't1', titulo: 'Fazer alguma coisa', feita: false }]);
    correr(95_000);
    expect(container.textContent).not.toContain('Travou?');
    desmontar();
  });
});
