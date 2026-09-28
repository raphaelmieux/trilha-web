// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }) }),
    }),
  },
}));

import DiagramaBinarioLab from './DiagramaBinarioLab';
import PesquisaWebLab from './PesquisaWebLab';
import RelatorioDePesquisaLab from './RelatorioDePesquisaLab';

/*
  Os três laboratórios da AP045, montados.

  Trava de motor não é trava de tela: `diagramaDoComputador.test.ts` prova que
  as seis metas do diagrama têm um estado que as fecha, e isto prova que os
  cliques chegam lá — a seta invertida pelo painel, a seta nova pela
  ferramenta Conectar, o rótulo pelo campo, as chaves, a simulação e a
  exportação pelo menu Arquivo.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const props = {
  specialtyCode: 'AP045', requirementCodes: ['AP045-5.1'],
  userId: '00000000-0000-0000-0000-000000000000',
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
});

const achar = (seletor: string) => {
  const e = container.querySelector(seletor);
  expect(e, `não achei ${seletor}`).toBeTruthy();
  return e as Element;
};
const porTexto = (seletor: string, texto: string) => {
  const e = [...container.querySelectorAll(seletor)].find(x => x.textContent?.trim() === texto);
  expect(e, `não achei "${texto}"`).toBeTruthy();
  return e as Element;
};
const clicar = (e: Element) => act(() => { e.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
const apertar = (e: Element) => act(() => { e.dispatchEvent(new Event('pointerdown', { bubbles: true })); });
const escrever = (campo: Element, valor: string) => act(() => {
  /* O React guarda o último valor que pôs e descarta o evento quando os dois
     batem: quem escreve é o setter do protótipo. */
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(campo, valor);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});

describe('o diagrama do caminho da informação', () => {
  beforeEach(() => {
    act(() => {
      root.render(
        <MemoryRouter>
          <DiagramaBinarioLab {...props} lessonCode="AP045.4-L2" lessonTitle="Montando o diagrama do caminho da informação" />
        </MemoryRouter>,
      );
    });
  });

  it('abre sem o botão de entregar', () => {
    expect(container.textContent).not.toContain('Entregar o diagrama');
  });

  it('se vence clicando', () => {
    clicar(achar('[title="Pôr Memória RAM na prancheta"]'));

    clicar(achar('[aria-label="Seta de Monitor para CPU, sem rótulo"]'));
    clicar(porTexto('button', 'Inverter sentido'));
    escrever(achar('input[placeholder="O que passa por esta seta"]'), 'os pixels da letra C');

    clicar(achar('[aria-label="Conectar"]'));
    apertar(achar('g[aria-label="CPU"]'));
    apertar(achar('g[aria-label="Memória RAM"]'));
    escrever(achar('input[placeholder="O que passa por esta seta"]'), 'a letra C, para guardar');

    clicar(achar('[aria-label="Selecionar"]'));
    clicar(achar('[aria-label="Seta de Teclado para CPU, sem rótulo"]'));
    escrever(achar('input[placeholder="O que passa por esta seta"]'), '01000011');

    for (const v of [64, 2, 1]) clicar(achar(`[aria-label="Chave de valor ${v}: 0"]`));
    expect(container.textContent).toContain('01000011 = 64 + 2 + 1 = 67');

    clicar(achar('[aria-label="Simular"]'));
    expect(container.textContent).toContain('O monitor acendeu a letra C');

    clicar(porTexto('button', 'Arquivo'));
    clicar(porTexto('[role="menuitem"]', 'Exportar como imagem'));
    expect(container.textContent).toContain('Eu aperto a tecla C');
    expect(container.textContent).toContain('Entregar o diagrama');
  });

  it('a seta ao contrário faz a simulação parar, e não acende letra', () => {
    clicar(achar('[aria-label="Simular"]'));
    expect(container.textContent).toContain('Os bits chegaram à CPU e pararam');
    expect(container.textContent).not.toContain('O monitor acendeu');
  });
});

describe('a pesquisa', () => {
  beforeEach(() => {
    act(() => {
      root.render(
        <MemoryRouter>
          <PesquisaWebLab {...props} lessonCode="AP045.5-L3" lessonTitle="Pesquisando o bug do milênio em sites especializados" />
        </MemoryRouter>,
      );
    });
  });

  it('busca, abre uma página e guarda uma ficha com a fonte', () => {
    clicar(achar('input[type="checkbox"]'));
    escrever(achar('input[aria-label="Pesquisar"]'), 'bug do milênio');
    act(() => { achar('form[role="search"]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    clicar(porTexto('.pw-link', 'O bug do milênio: o problema do ano 2000'));
    expect(container.textContent).toContain('Profa. Helena Martins');

    clicar(container.querySelectorAll('.pw-fichar')[0]);
    act(() => {
      const select = achar('.pw-ficha-nova select') as HTMLSelectElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!;
      setter.call(select, 'causa');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    act(() => {
      const area = achar('.pw-ficha-nova textarea');
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(area, 'Para gastar menos memória, que custava caro, os programas escreviam só o fim do ano.');
      area.dispatchEvent(new Event('input', { bubbles: true }));
    });
    clicar(porTexto('button', 'Guardar ficha'));
    expect(container.textContent).toContain('Fichas (1)');
    expect(container.textContent).toContain('Fonte: Acervo Histórico da Computação');
  });

  /* Dito na hora de avaliar, a avaliação vira duas tentativas. */
  it('não diz se a página é confiável', () => {
    escrever(achar('input[aria-label="Pesquisar"]'), 'bug do milênio');
    act(() => { achar('form[role="search"]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    clicar(achar('.pw-link'));
    clicar(porTexto('button', 'Confiável'));
    expect(container.textContent).not.toMatch(/errad|acertou|correto/i);
  });
});

describe('o relatório', () => {
  it('sem pesquisa entregue, manda para a pesquisa', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <RelatorioDePesquisaLab {...props} lessonCode="AP045.5-L4" lessonTitle="Escrevendo o relatório sobre o bug do milênio" />
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain('Primeiro, a pesquisa');
    expect(achar('a').getAttribute('href')).toBe('/licao/AP045/AP045.5/AP045.5-L3');
  });
});
