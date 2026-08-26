// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import FormatacaoTextoLab from './FormatacaoTextoLab';

/*
  O que a imitação do Word não pode perder ao ser mexida.

  A faixa de opções tem dezenas de botões, e a maioria está ali só para a tela
  ser reconhecível. Isso torna fácil mexer no arquivo e desfazer sem perceber as
  duas coisas que ele existe para ensinar — nenhuma delas quebra a compilação,
  e as duas são invisíveis num teste de tipo.

  1. Formatação sem seleção não faz nada, e o programa diz isso. É o engano
     número um de quem começa: aperta negrito sem ter marcado nada, não vê
     mudança e conclui que o computador quebrou.

  2. Margem, orientação e tamanho do papel moram na guia Layout, e não em
     Início. Metade do requisito 3 é *onde fica*: um painel próprio, fora da
     faixa, ensinaria a procurar no lugar errado — e o desbravador vai abrir o
     Word de verdade na escola.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const props = {
  specialtyCode: 'AP042',
  lessonCode: 'AP042.2-L2',
  requirementCodes: ['AP042-3.1'],
  userId: '00000000-0000-0000-0000-000000000000',
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <FormatacaoTextoLab {...props} />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const porTitulo = (titulo: string) =>
  container.querySelector<HTMLElement>(`[title="${titulo}"]`);

const paragrafo = (trecho: string) =>
  [...container.querySelectorAll<HTMLElement>('.wd-par')]
    .find(p => p.textContent?.includes(trecho));

describe('a faixa de opções', () => {
  it('traz as guias Início e Layout funcionando', () => {
    const guias = [...container.querySelectorAll('[role="tab"]')].map(g => g.textContent);
    expect(guias).toEqual(['Início', 'Layout']);
  });

  /* Se Margens voltar para a guia Início, ou para um painel fora da faixa, o
     laboratório passa a ensinar um caminho que não existe no Word. */
  it('deixa margem, orientação e tamanho do papel só na guia Layout', () => {
    expect(porTitulo('Margens'), 'Margens não deve estar em Início').toBeNull();

    const layout = [...container.querySelectorAll('[role="tab"]')]
      .find(g => g.textContent === 'Layout')!;
    act(() => { layout.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    for (const botao of ['Margens', 'Orientação', 'Tamanho']) {
      expect(porTitulo(botao), botao).not.toBeNull();
    }
  });
});

describe('os menus da faixa', () => {
  /*
    Um menu que se fecha sozinho no clique que o abre.

    Ao pôr o laboratório em tela cheia, o `fecharMenu` — que existe para o menu
    sumir quando se clica fora dele — foi parar na janela inteira. O clique no
    botão Margens abria o menu e subia até a janela, que o fechava no mesmo
    gesto. Nada quebrou: nem tipo, nem lint, nem teste. Só clicando é que se
    via, e o menu de Margens é o caminho do requisito 3.1.
  */
  it('abrem e continuam abertos', () => {
    const layout = [...container.querySelectorAll('[role="tab"]')]
      .find(g => g.textContent === 'Layout')!;
    act(() => { layout.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    const margens = porTitulo('Margens')!;
    act(() => { margens.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    expect(container.querySelector('[role="menu"]'), 'o menu deveria estar aberto').not.toBeNull();
    expect(container.textContent).toContain('2,5 cm em todos os lados');
  });
});

describe('formatar sem ter selecionado nada', () => {
  it('não muda o documento, e explica por quê', () => {
    const antes = paragrafo('Relatório do acampamento da')!.style.fontWeight;

    const negrito = porTitulo('Negrito (Ctrl+N)')!;
    act(() => { negrito.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    expect(paragrafo('Relatório do acampamento da')!.style.fontWeight).toBe(antes);
    expect(container.textContent).toContain('Botão de formatação sem seleção não faz nada');
  });

  it('funciona depois de clicar num parágrafo', () => {
    const titulo = paragrafo('Relatório do acampamento da')!;
    act(() => { titulo.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    const negrito = porTitulo('Negrito (Ctrl+N)')!;
    act(() => { negrito.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

    expect(paragrafo('Relatório do acampamento da')!.style.fontWeight).toBe('700');
  });
});
