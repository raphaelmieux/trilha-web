// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import InsercaoTextoLab from './InsercaoTextoLab';
import { porCursor } from './tecladoDaFolha';

/*
  A trava que clica do laboratório de inserção da AP043.

  As quatro tarefas são levadas até o fim pelos gestos que o desbravador
  faria — a grade de tamanho da tabela, as guias contextuais que só aparecem
  com o cursor dentro dela, o menu de quebra de texto, o modo de cabeçalho e
  rodapé. Trava de motor não é trava de tela: um botão sem `onClick` deixaria
  `metasDaAp043.test.ts` verde e o laboratório impossível de vencer.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <InsercaoTextoLab specialtyCode="AP043" lessonCode="AP043.4-L1" lessonTitle="Inserindo no documento"
          requirementCodes={['AP043-4']} userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (el: Element | null | undefined) => {
  if (!el) throw new Error('não achei o que clicar');
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const porTitulo = (t: string) => container.querySelector<HTMLElement>(`[title="${t}"]`);
const guia = (nome: string) => [...container.querySelectorAll('[role="tab"]')].find(g => g.textContent === nome);
const item = (texto: string) => [...container.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')]
  .find(b => b.textContent?.startsWith(texto));
const tarefaFeita = (id: string) => container.querySelector<HTMLElement>(`[data-tarefa="${id}"]`)?.dataset.feita === 'sim';

/** Escreve num campo controlado pelo React, pelo setter nativo — `value =` não chega a ele. */
function escrever(campo: HTMLInputElement | null, valor: string) {
  if (!campo) throw new Error('não achei o campo');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo, valor);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('as guias contextuais', () => {
  it('Layout da Tabela só existe com a tabela escolhida, e some ao voltar ao texto', () => {
    expect(guia('Layout da Tabela')).toBeUndefined();
    porCursor(container, 'p2', 'fim');
    clicar(porTitulo('Tabela'));
    clicar(container.querySelector('[aria-label="Tabela de 3 colunas por 3 linhas"]'));
    expect(guia('Layout da Tabela')).toBeDefined();
    clicar(container.querySelector('p[data-bloco="p1"]'));
    expect(guia('Layout da Tabela'), 'o cursor saiu da tabela e a guia ficou').toBeUndefined();
  });
});

describe('o cabeçalho tem modo próprio', () => {
  it('fechado é de leitura e apagado; aberto se escreve e apaga o texto', () => {
    clicar(porTitulo('Cabeçalho'));
    expect(container.querySelector('.wd-faixas-abertas')).not.toBeNull();
    expect(container.querySelector('input[aria-label="Cabeçalho"]')).not.toBeNull();
    clicar(porTitulo('Fechar Cabeçalho e Rodapé'));
    expect(container.querySelector('.wd-faixas-abertas')).toBeNull();
    expect(container.querySelector('input[aria-label="Cabeçalho"]'), 'cabeçalho fechado não se escreve').toBeNull();
    expect(container.querySelector('.wd-faixa-fechada')).not.toBeNull();
  });
});

describe('as quatro tarefas, pelos gestos de verdade', () => {
  it('fecham todas', () => {
    /* A tabela: 3 por 3 depois da frase que anuncia as unidades. */
    porCursor(container, 'p2', 'fim');
    clicar(porTitulo('Tabela'));
    clicar(container.querySelector('[aria-label="Tabela de 3 colunas por 3 linhas"]'));
    clicar(container.querySelector('td[data-celula="2-0"]'));
    clicar(porTitulo('Inserir Abaixo'));
    escrever(container.querySelector('input[aria-label="Linha 4, coluna 1"]'), 'Tucano');
    escrever(container.querySelector('input[aria-label="Linha 4, coluna 2"]'), '11');
    clicar(container.querySelector('td[data-celula="0-2"]'));
    clicar(porTitulo('Excluir'));
    clicar(item('Excluir Colunas'));
    clicar(guia('Design da Tabela'));
    clicar(container.querySelector('[aria-label="Tabela de Lista 3"]'));
    expect(tarefaFeita('tabela')).toBe(true);

    /* A foto, ajustada ao texto. */
    porCursor(container, 'p1', 'fim');
    clicar(container.querySelector('p[data-bloco="p1"]'));
    clicar(guia('Inserir'));
    clicar(porTitulo('Imagens'));
    clicar(item('Este Dispositivo'));
    expect(tarefaFeita('imagem')).toBe(false);
    clicar(porTitulo('Quebra de Texto Automática'));
    clicar(item('Quadrada'));
    expect(tarefaFeita('imagem')).toBe(true);

    /* Cabeçalho, rodapé e número de página. */
    clicar(container.querySelector('p[data-bloco="p1"]'));
    clicar(guia('Inserir'));
    clicar(porTitulo('Cabeçalho'));
    escrever(container.querySelector('input[aria-label="Cabeçalho"]'), 'Clube Falcão Peregrino');
    clicar(porTitulo('Rodapé'));
    escrever(container.querySelector('input[aria-label="Rodapé"]'), 'Unidade Falcão');
    expect(tarefaFeita('cabecalho')).toBe(true);
    clicar(porTitulo('Número de Página'));
    expect(tarefaFeita('numeracao')).toBe(true);
    clicar(porTitulo('Fechar Cabeçalho e Rodapé'));

    const numeros = [...container.querySelectorAll('.wd-campo[data-campo="pagina"]')].map(n => n.textContent);
    expect(numeros, 'o número de página não muda sozinho de folha para folha').toEqual(['1', '2']);
    expect([...container.querySelectorAll('button')].some(b => b.textContent === 'Entregar o documento')).toBe(true);
  });
});
