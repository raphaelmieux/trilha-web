// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import FileManagerLab from './FileManagerLab';

/*
  As seis operações do requisito 5, exercitadas pela própria tela.

  A lógica da árvore tem os seus testes em arquivos.test.ts. O que se vigia aqui
  é a fiação: se o botão da barra chama a operação certa, se a lista de tarefas
  marca o que foi feito, e se o laboratório só libera a conclusão depois das seis
  — que é a promessa que ele faz ao desbravador e ao examinador.

  Nada aqui toca o servidor: só o botão "Concluir" grava, e ele não é clicado.
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
        <FileManagerLab specialtyCode="AP041" lessonCode="AP041.5-L1" requirementCodes={['AP041-5.1']} userId="u1" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Auxiliares de tela ───────────────────────────────────────────────────── */

const todos = (sel: string) => [...container.querySelectorAll<HTMLElement>(sel)];
const botao = (texto: string) => todos('button').find(b => b.textContent?.trim() === texto);

/*
  Na barra de comandos do Windows 11 quase nada tem texto: o desbravador
  reconhece a tesoura, não a palavra "Recortar". Quem carrega o nome é o
  aria-label, e é por ele que o teste aperta — assim o teste clica no mesmo
  botão que um leitor de tela anunciaria.
*/
const comando = (rotulo: string) =>
  todos('.win-barra button').find(b => (b.getAttribute('aria-label') ?? '').startsWith(rotulo));

/** Uma linha da lista de arquivos. */
const linha = (nome: string) => todos('.win-linha').find(d => d.textContent?.includes(nome));

/** Uma pasta na árvore da esquerda. */
const naArvore = (nome: string) => todos('.win-painel div.cursor-pointer').find(d => d.textContent?.trim() === nome);

const clicar = (el: Element | undefined, rotulo: string) => {
  if (!el) throw new Error(`não achei na tela: ${rotulo}`);
  act(() => { (el as HTMLElement).click(); });
};

const duploClique = (el: Element | undefined, rotulo: string) => {
  if (!el) throw new Error(`não achei na tela: ${rotulo}`);
  act(() => { el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); });
};

/** Digita no campo de renomear e confirma com Enter. */
const renomearPara = (nome: string) => {
  const campo = container.querySelector<HTMLInputElement>('input[aria-label="Novo nome"]');
  if (!campo) throw new Error('o campo de renomear não apareceu');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo, nome);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => {
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
};

const textoDoBotaoFinal = () =>
  todos('button').find(b => /Concluir o laborat|Faltam/.test(b.textContent ?? ''))!;

const nomesVisiveis = () => todos('.win-linha').map(d => d.textContent?.split(/\d{2}\//)[0].trim());

/* ── A tela ───────────────────────────────────────────────────────────────── */

describe('a janela', () => {
  it('abre na Área de Trabalho, com o caminho na barra de endereço', () => {
    expect(container.textContent).toContain('Área de Trabalho');
  });

  it('traz as quatro colunas do modo de detalhes', () => {
    for (const c of ['Nome', 'Data de modificação', 'Tipo', 'Tamanho']) {
      expect(botao(c), c).toBeTruthy();
    }
  });

  it('mostra a árvore com as três raízes', () => {
    for (const r of ['Área de Trabalho', 'Documentos', 'Lixeira']) {
      expect(naArvore(r), r).toBeTruthy();
    }
  });

  it('entra na pasta com dois cliques', () => {
    duploClique(linha('Acampamento 2026'), 'pasta Acampamento');
    expect(nomesVisiveis().join(' ')).toContain('fogueira.jpg');
  });

  it('começa exigindo as seis operações', () => {
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 6/);
    expect((textoDoBotaoFinal() as HTMLButtonElement).disabled).toBe(true);
  });
});

/* ── As seis operações ────────────────────────────────────────────────────── */

describe('as seis operações do requisito', () => {
  it('cumpre as seis e só então libera a conclusão', () => {
    // ── 5.1 criar uma pasta e renomeá-la ──
    clicar(comando('Nova pasta'), 'Nova pasta');
    renomearPara('Fotos do clube');
    expect(nomesVisiveis().join(' '), 'a pasta renomeada aparece').toContain('Fotos do clube');
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 5/);

    // ── 5.2 copiar uma pasta para outro lugar ──
    clicar(linha('Fotos do clube'), 'linha da pasta nova');
    clicar(comando('Copiar'), 'Copiar');
    clicar(naArvore('Documentos'), 'Documentos na árvore');
    clicar(comando('Colar'), 'Colar');
    expect(nomesVisiveis().join(' '), 'a cópia chegou em Documentos').toContain('Fotos do clube');
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 4/);

    // ── 5.3 mover uma pasta para outro lugar ──
    clicar(naArvore('Área de Trabalho'), 'Área de Trabalho na árvore');
    clicar(linha('Acampamento 2026'), 'linha da pasta Acampamento');
    clicar(comando('Recortar'), 'Recortar');
    clicar(naArvore('Documentos'), 'Documentos na árvore');
    clicar(comando('Colar'), 'Colar');
    expect(nomesVisiveis().join(' '), 'a pasta movida chegou').toContain('Acampamento 2026');
    clicar(naArvore('Área de Trabalho'), 'volta à Área de Trabalho');
    expect(nomesVisiveis().join(' '), 'e saiu da origem').not.toContain('Acampamento 2026');
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 3/);

    // ── 5.4 criar um atalho ──
    clicar(linha('hino.mp3'), 'linha do hino');
    clicar(comando('Criar atalho'), 'Criar atalho');
    expect(nomesVisiveis().join(' ')).toContain('Atalho');
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 2/);

    // ── 5.5 excluir um arquivo e esvaziar a lixeira ──
    clicar(linha('hino.mp3'), 'linha do hino de novo');
    clicar(comando('Excluir'), 'Excluir');
    clicar(naArvore('Lixeira'), 'Lixeira na árvore');
    expect(nomesVisiveis().join(' '), 'o arquivo está na lixeira').toContain('hino.mp3');
    clicar(comando('Esvaziar a Lixeira'), 'Esvaziar Lixeira');
    expect(nomesVisiveis().length, 'a lixeira ficou vazia').toBe(0);
    expect(textoDoBotaoFinal().textContent).toMatch(/Faltam 1/);

    // ── 5.6 organizar por nome, data e tamanho ──
    clicar(naArvore('Documentos'), 'Documentos');
    clicar(botao('Data de modificação'), 'coluna Data');
    clicar(botao('Tamanho'), 'coluna Tamanho');

    const final = textoDoBotaoFinal() as HTMLButtonElement;
    expect(final.textContent, 'as seis foram feitas').toContain('Concluir o laboratório');
    expect(final.disabled, 'e o botão liberou').toBe(false);
  });
});

/* ── As regras que o Explorer tem ─────────────────────────────────────────── */

describe('o que a janela recusa', () => {
  /* Copiar uma pasta leva o conteúdo junto — a cópia rasa faria o desbravador
     concluir que copiar perde os arquivos de dentro. */
  it('copia a pasta com o que está dentro dela', () => {
    clicar(linha('Acampamento 2026'), 'pasta com conteúdo');
    clicar(comando('Copiar'), 'Copiar');
    clicar(naArvore('Documentos'), 'Documentos');
    clicar(comando('Colar'), 'Colar');
    duploClique(linha('Acampamento 2026'), 'a cópia');
    expect(nomesVisiveis().join(' ')).toContain('fogueira.jpg');
  });

  /*
    Arrastar é o gesto do Explorer, e foi por ele que a janela foi refeita. O
    resto do laboratório não depende dele — no celular valem a barra e o menu —,
    mas no computador ele precisa funcionar de verdade.
  */
  it('move ao arrastar um arquivo até uma pasta', () => {
    const arrastar = (de: Element, para: Element, comCtrl = false) => {
      act(() => { de.dispatchEvent(new MouseEvent('dragstart', { bubbles: true })); });
      act(() => { para.dispatchEvent(new MouseEvent('dragover', { bubbles: true, cancelable: true })); });
      act(() => { para.dispatchEvent(new MouseEvent('drop', { bubbles: true, cancelable: true, ctrlKey: comCtrl })); });
    };

    arrastar(linha('hino.mp3')!, naArvore('Documentos')!);
    expect(nomesVisiveis().join(' '), 'saiu da Área de Trabalho').not.toContain('hino.mp3');
    clicar(naArvore('Documentos'), 'Documentos');
    expect(nomesVisiveis().join(' '), 'chegou em Documentos').toContain('hino.mp3');
  });

  it('copia, em vez de mover, quando se arrasta com Ctrl', () => {
    const arrastar = (de: Element, para: Element) => {
      act(() => { de.dispatchEvent(new MouseEvent('dragstart', { bubbles: true })); });
      act(() => { para.dispatchEvent(new MouseEvent('dragover', { bubbles: true, cancelable: true })); });
      act(() => { para.dispatchEvent(new MouseEvent('drop', { bubbles: true, cancelable: true, ctrlKey: true })); });
    };

    arrastar(linha('hino.mp3')!, naArvore('Documentos')!);
    expect(nomesVisiveis().join(' '), 'o original ficou').toContain('hino.mp3');
    clicar(naArvore('Documentos'), 'Documentos');
    expect(nomesVisiveis().join(' '), 'e a cópia chegou').toContain('hino.mp3');
  });

  /*
    O menu Classificar é o único caminho para ordenar no celular: lá as colunas
    do meio somem por CSS, e clicar no cabeçalho de Data deixa de ser possível.
    Ele já nasceu quebrado uma vez no laboratório do Word — o clique que abre
    subia até o window e caía no ouvinte que fecha. Daí o teste.
  */
  it('abre o menu Classificar e ordena por ele', () => {
    clicar(comando('Classificar'), 'Classificar');
    const menu = container.querySelector('.win-menu');
    expect(menu, 'o menu não pode fechar no mesmo clique que o abre').toBeTruthy();
    expect(menu!.textContent).toContain('Data de modificação');

    const porData = [...menu!.querySelectorAll('button')]
      .find(b => b.textContent?.includes('Data de modificação'));
    clicar(porData, 'Data de modificação no menu');
    expect(container.querySelector('.win-menu'), 'e fecha ao escolher').toBeFalsy();

    /* A ordenação em si é de arquivos.test.ts. O que se confere aqui é que o
       menu chega até ela: a tarefa 6 conta as três ordens usadas, e ela subiu. */
    expect(container.textContent).toContain('2 de 3 até agora');
  });

  it('não deixa renomear com nome vazio', () => {
    clicar(comando('Nova pasta'), 'Nova pasta');
    renomearPara('   ');
    expect(container.textContent).toContain('não pode ficar vazio');
  });

  /* Duas pastas irmãs com o mesmo nome deixariam a lista ambígua. */
  it('numera o nome repetido, como o Windows', () => {
    clicar(comando('Nova pasta'), 'primeira');
    renomearPara('Trabalhos');
    clicar(comando('Nova pasta'), 'segunda');
    renomearPara('Trabalhos');
    expect(nomesVisiveis().join(' ')).toContain('Trabalhos (2)');
  });
});
