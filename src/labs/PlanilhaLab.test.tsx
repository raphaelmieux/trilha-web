// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import PlanilhaLab from './PlanilhaLab';

/*
  Escrever numa planilha, conferido escrevendo.

  Esta trava existe por um defeito que chegou ao ar e que a suíte inteira não
  via: escrever na barra de fórmulas aceitava **um caractere**. O onChange
  ligava o modo de edição, a célula passava a desenhar um campo com autoFocus,
  esse campo roubava o foco no meio da digitação, e o onBlur da barra gravava a
  letra sozinha. Cada tecla virava uma gravação.

  Mil e trezentos testes passavam, porque nenhum deles digitava mais de uma
  tecla. Os daqui digitam — e conferem quem está com o foco depois, que é o que
  o defeito de fato quebrava.
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
        <PlanilhaLab
          specialtyCode="AP043" lessonCode="AP043.5-L2"
          lessonTitle="Montando o orçamento do acampamento"
          requirementCodes={['AP043-5.1']}
          userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** Escreve tecla a tecla, como um teclado escreve — e não de uma vez só. */
const digitar = (campo: HTMLInputElement, texto: string) => {
  for (const letra of texto) {
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value')!.set!;
      /* O campo em foco pode ter mudado no meio da digitação — que é
         exatamente o defeito. Escreve-se em quem está com o foco agora, como o
         teclado faria, e não no elemento capturado antes de começar. */
      const atual = (document.activeElement as HTMLInputElement) ?? campo;
      setter.call(atual, atual.value + letra);
      atual.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
};

const barra = () => container.querySelector<HTMLInputElement>('.pl-entrada')!;

/** Apaga o que está no campo antes de escrever, como quem seleciona e digita. */
const esvaziar = (campo: HTMLInputElement) => {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(campo, '');
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
};
const celulas = (linha: number) =>
  [...container.querySelectorAll('.pl-grade tbody tr')[linha].querySelectorAll('td')];

const teclar = (alvo: Element, key: string, extra: KeyboardEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

describe('escrever na barra de fórmulas', () => {
  it('aceita a palavra inteira, e não uma letra', () => {
    const campo = barra();
    act(() => { campo.focus(); });
    esvaziar(campo);
    digitar(barra(), 'Arara');
    expect(barra().value, 'a barra perdeu tudo menos a primeira tecla').toBe('Arara');
  });

  it('o foco continua na barra depois de várias teclas', () => {
    /* O defeito era este: a célula ganhava autoFocus e puxava o foco para si
       no meio da palavra. Conferir o texto sozinho não bastaria — o texto
       poderia estar certo com o foco no lugar errado, e a tecla seguinte
       cairia noutro campo. */
    const campo = barra();
    act(() => { campo.focus(); });
    esvaziar(campo);
    digitar(barra(), 'Ara');
    expect(document.activeElement?.className, 'o foco pulou para outro campo')
      .toContain('pl-entrada');
  });

  it('Enter grava o que foi escrito na célula', () => {
    const campo = barra();
    act(() => { campo.focus(); });
    esvaziar(campo);
    digitar(barra(), 'Arara');
    teclar(barra(), 'Enter');
    expect(celulas(0)[0].textContent).toContain('Arara');
  });
});

describe('escrever na célula', () => {
  it('digitar sobre a célula selecionada começa a edição e mantém as teclas', () => {
    /* O gesto mais usado do Excel, e não existia: a única forma de escrever
       era dar dois cliques, que quase ninguém tenta primeiro. */
    const grade = container.querySelector('.pl-grade-caixa')!;
    teclar(grade, 'T');
    const campo = container.querySelector<HTMLInputElement>('.pl-celula-entrada');
    expect(campo, 'digitar sobre a célula não abriu a edição').not.toBeNull();
    digitar(campo!, 'ucano');
    expect(container.querySelector<HTMLInputElement>('.pl-celula-entrada')!.value).toBe('Tucano');
  });

  it('Esc desiste, e o onBlur não grava por baixo dele', () => {
    /* Esc tira o foco do campo, e o onBlur disparava logo depois gravando
       exatamente o que Esc tinha acabado de descartar. */
    const grade = container.querySelector('.pl-grade-caixa')!;
    const antes = celulas(0)[0].textContent;
    teclar(grade, 'X');
    const campo = container.querySelector<HTMLInputElement>('.pl-celula-entrada')!;
    digitar(campo, 'yz');
    teclar(container.querySelector('.pl-celula-entrada')!, 'Escape');
    act(() => { container.querySelector<HTMLInputElement>('.pl-celula-entrada')?.blur(); });
    expect(celulas(0)[0].textContent, 'Esc não desfez a escrita').toBe(antes);
  });
});

describe('a janela é a do Excel', () => {
  it('traz as guias do Excel em português', () => {
    const guias = [...container.querySelectorAll('.pl-guia')].map(g => g.textContent?.trim());
    for (const g of ['Arquivo', 'Página Inicial', 'Inserir', 'Layout da Página',
      'Fórmulas', 'Dados', 'Revisão', 'Exibir', 'Ajuda']) {
      expect(guias, `a guia ${g} sumiu da fileira`).toContain(g);
    }
  });

  it('Inserir, Excluir e Formatar são menus, e não botões soltos', () => {
    /* O Excel põe os três num menu suspenso. Eram seis botões de mais e menos
       linha e coluna, que é onde ninguém procura. */
    for (const rotulo of ['Inserir', 'Excluir', 'Formatar']) {
      const bt = [...container.querySelectorAll('.pl-faixa .pl-bt')]
        .find(b => b.getAttribute('title') === rotulo);
      expect(bt, `o botão ${rotulo} não está na faixa`).toBeTruthy();
      expect(bt!.getAttribute('aria-haspopup'), `${rotulo} não abre menu`).toBe('menu');
    }
  });

  it('o botão direito abre o menu de contexto da célula', () => {
    const alvo = celulas(2)[0];
    act(() => {
      alvo.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 100, clientY: 100 }));
    });
    const menu = container.querySelector('.pl-contexto');
    expect(menu, 'o botão direito não abriu menu nenhum').not.toBeNull();
    const itens = [...menu!.querySelectorAll('.pl-menu-item')].map(i => i.textContent);
    for (const esperado of ['Recortar', 'Copiar', 'Colar', 'Excluir linha', 'Limpar conteúdo']) {
      expect(itens.some(t => t?.includes(esperado)), `falta ${esperado} no menu`).toBe(true);
    }
  });
});
