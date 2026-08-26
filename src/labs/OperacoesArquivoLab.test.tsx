// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import OperacoesArquivoLab from './OperacoesArquivoLab';

/*
  As quatro tarefas do requisito 6, exercitadas pela própria área de trabalho.

  O que se vigia aqui não é a aparência das janelas — é a lição de cada
  estação, que mora no caminho errado. Três das quatro têm um caminho que
  parece certo e não é, e é justamente esse que o desbravador vai encontrar na
  vida. Se um deles passar a funcionar por engano, a estação continua bonita e
  para de ensinar; daí um teste para cada.

  Nada aqui toca o servidor: só o botão "Concluir" grava, e ele não é clicado.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <OperacoesArquivoLab specialtyCode="AP042" lessonCode="AP042.6-L1" requirementCodes={['AP042-6.1']} userId="u1" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
});

/* ── Auxiliares de tela ───────────────────────────────────────────────────── */

const todos = (sel: string) => [...container.querySelectorAll<HTMLElement>(sel)];

const clicar = (el: Element | undefined, rotulo: string) => {
  if (!el) throw new Error(`não achei na tela: ${rotulo}`);
  act(() => { (el as HTMLElement).click(); });
};

/** Um botão qualquer, pelo texto. */
const botao = (texto: string) =>
  todos('button').find(b => b.textContent?.trim().startsWith(texto));

/** Um comando da barra do Explorador, pelo nome que o leitor de tela anuncia. */
const comando = (rotulo: string) =>
  todos('.win-barra button').find(b => (b.getAttribute('aria-label') ?? '').startsWith(rotulo));

const linha = (nome: string) => todos('.win-linha').find(d => d.textContent?.includes(nome));
const nomesVisiveis = () => todos('.win-linha').map(d => d.textContent ?? '').join(' | ');

/** Abre o menu ⋯ e clica numa das opções. */
const noMenuMais = (texto: string) => {
  clicar(comando('Ver mais'), 'Ver mais');
  const opcao = todos('.win-menu button').find(b => b.textContent?.includes(texto));
  clicar(opcao, `${texto} no menu ⋯`);
};

/** Abre um programa pelo menu Iniciar. */
const pelaIniciar = (nome: string) => {
  clicar(todos('.win-tarefas button').find(b => b.getAttribute('aria-label') === 'Iniciar'), 'Iniciar');
  const opcao = todos('.win-iniciar button').find(b => b.textContent?.includes(nome));
  clicar(opcao, `${nome} no menu Iniciar`);
};

/** Uma pasta na árvore de navegação. */
const naArvore = (nome: string) =>
  todos('.win-painel div.cursor-pointer').find(d => d.textContent?.trim() === nome);

const noMenuArquivo = (texto: string) => {
  clicar(todos('.win-menus button').find(b => b.textContent?.trim() === 'Arquivo'), 'menu Arquivo');
  const opcao = todos('.win-menu button').find(b => b.textContent?.includes(texto));
  clicar(opcao, `${texto} no menu Arquivo`);
};

const escolher = (rotulo: string, valor: string) => {
  const campo = container.querySelector<HTMLSelectElement>(`select[aria-label="${rotulo}"]`);
  if (!campo) throw new Error(`não achei a lista: ${rotulo}`);
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo, valor);
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const marcarCaixa = (indice = 0) => {
  const caixa = todos('.win-modal input[type="checkbox"]')[indice] as HTMLInputElement;
  if (!caixa) throw new Error('não achei a caixa de marcação');
  act(() => { caixa.click(); });
};

const marcarOsQuatro = () => {
  for (const n of ['acampamento-01.jpg', 'acampamento-02.jpg', 'lista-de-presenca.odt', 'relatorio-da-unidade.odt']) {
    clicar(linha(n), n);
  }
};

const botaoFinal = () =>
  todos('button').find(b => /Concluir o laborat|Faltam/.test(b.textContent ?? ''))! as HTMLButtonElement;

/* ── A área de trabalho ───────────────────────────────────────────────────── */

describe('a área de trabalho', () => {
  it('abre no Explorador, na pasta do clube, com os quatro arquivos', () => {
    expect(container.textContent).toContain('Clube');
    expect(nomesVisiveis()).toContain('relatorio-da-unidade.odt');
    expect(todos('.win-linha')).toHaveLength(4);
  });

  it('começa exigindo as quatro tarefas', () => {
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
    expect(botaoFinal().disabled).toBe(true);
  });
});

/* ── 1. Compactar ─────────────────────────────────────────────────────────── */

describe('compactar e extrair', () => {
  it('recusa compactar o que não foi marcado', () => {
    clicar(linha('acampamento-01.jpg'), 'só o primeiro');
    noMenuMais('Adicionar para o arquivo');
    expect(container.textContent).toContain('Marque os quatro arquivos');
    expect(container.querySelector('.win-modal'), 'e nem abre o diálogo').toBeFalsy();
  });

  /* A opção que apaga existe no WinRAR de verdade, e é a razão de tanta gente
     achar que "compactar apaga". Ela precisa continuar aqui, desmarcada, e
     precisa explicar quando marcada — é ela que ensina que apagar é escolha. */
  it('explica a opção de apagar em vez de apagar calado', () => {
    marcarOsQuatro();
    noMenuMais('Adicionar para o arquivo');
    marcarCaixa();
    clicar(botao('OK'), 'OK');
    expect(container.textContent).toContain('Compactar, sozinho, não apaga nada');
    expect(nomesVisiveis(), 'e nada foi criado nem apagado').not.toContain('acampamento.rar');
  });

  it('cria o arquivo e deixa os quatro originais onde estavam', () => {
    marcarOsQuatro();
    noMenuMais('Adicionar para o arquivo');
    clicar(botao('OK'), 'OK');

    const lista = nomesVisiveis();
    expect(lista).toContain('acampamento.rar');
    for (const n of ['acampamento-01.jpg', 'acampamento-02.jpg', 'lista-de-presenca.odt', 'relatorio-da-unidade.odt']) {
      expect(lista, `${n} continua na pasta`).toContain(n);
    }
    expect(container.textContent).toContain('Compactar copia, não move');
  });

  it('só dá a tarefa por feita depois de extrair de volta', () => {
    marcarOsQuatro();
    noMenuMais('Adicionar para o arquivo');
    clicar(botao('OK'), 'OK');
    expect(botaoFinal().textContent, 'compactar sozinho não fecha a tarefa').toMatch(/Faltam 4/);

    clicar(linha('acampamento.rar'), 'o arquivo compactado');
    noMenuMais('Extrair para');
    clicar(botao('OK'), 'OK da extração');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
    expect(nomesVisiveis()).toContain('acampamento');
  });
});

/* ── 2. Salvar em pdf ─────────────────────────────────────────────────────── */

describe('salvar o relatório em pdf', () => {
  const abrirEditor = () => pelaIniciar('Editor de Texto');

  it('não vira pdf ao apertar Salvar', () => {
    abrirEditor();
    noMenuArquivo('Salvar');
    expect(container.textContent).toContain('Salvar apenas grava por cima do mesmo .odt');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('recusa o .txt, que perde a formatação', () => {
    abrirEditor();
    noMenuArquivo('Salvar como');
    escolher('Tipo', 'txt');
    clicar(botao('Salvar'), 'Salvar do diálogo');
    expect(container.textContent).toContain('guarda só as letras');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('aceita o pdf, e o arquivo aparece na pasta', () => {
    abrirEditor();
    noMenuArquivo('Salvar como');
    escolher('Tipo', 'pdf');
    clicar(botao('Salvar'), 'Salvar do diálogo');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
    expect(nomesVisiveis()).toContain('relatorio-da-unidade.pdf');
  });

  it('aceita também o Exportar como PDF, que é o outro caminho de verdade', () => {
    abrirEditor();
    noMenuArquivo('Exportar como PDF');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
  });
});

/* ── 3. Instalar e desinstalar ────────────────────────────────────────────── */

describe('instalar e desinstalar', () => {
  const instalar = () => {
    pelaIniciar('Navegador Web');
    clicar(botao('Desenhador — Site oficial') ?? todos('button').find(b => b.textContent?.includes('Site oficial')),
      'o site oficial');
  };

  it('recusa o site que junta programas grátis', () => {
    pelaIniciar('Navegador Web');
    clicar(todos('button').find(b => b.textContent?.includes('Baixaki')), 'o agregador');
    expect(container.textContent).toContain('empacotar o instalador com outras coisas junto');
  });

  it('recusa o link do grupo com a versão paga liberada', () => {
    pelaIniciar('Navegador Web');
    clicar(todos('button').find(b => b.textContent?.includes('ATIVADO')), 'o link do grupo');
    expect(container.textContent).toContain('é isca');
  });

  /* Os dois enganos clássicos, cada um no lugar onde ele existe de verdade. */
  it('apagar o atalho não desinstala nada', () => {
    instalar();
    clicar(naArvore('Área de Trabalho'), 'Área de Trabalho');
    clicar(linha('Desenhador — Atalho'), 'o atalho');
    clicar(comando('Excluir'), 'Excluir');
    expect(container.textContent).toContain('O programa continua instalado');
    expect(botaoFinal().textContent, 'e a tarefa não fecha').toMatch(/Faltam 4/);
  });

  it('apagar a pasta do programa deixa sobra pelo sistema', () => {
    instalar();
    clicar(naArvore('Arquivos de Programas'), 'Arquivos de Programas');
    clicar(linha('Desenhador'), 'a pasta do programa');
    clicar(comando('Excluir'), 'Excluir');
    expect(container.textContent).toContain('deixa o resto');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('desinstala por Configurações, e o atalho some junto', () => {
    instalar();
    pelaIniciar('Configurações');
    clicar(todos('button').find(b => b.getAttribute('aria-label') === 'Mais opções de Desenhador'), 'as três bolinhas');
    clicar(todos('.win-menu button').find(b => b.textContent === 'Desinstalar'), 'Desinstalar');

    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
    clicar(naArvore('Área de Trabalho'), 'Área de Trabalho');
    expect(nomesVisiveis(), 'o atalho foi junto').not.toContain('Desenhador');
  });
});

/* ── 4. Imprimir ──────────────────────────────────────────────────────────── */

describe('imprimir do jeito que foi pedido', () => {
  const abrirImpressao = () => {
    pelaIniciar('Editor de Texto');
    noMenuArquivo('Imprimir');
  };

  it('diz o que ainda falta acertar, em vez de só recusar', () => {
    abrirImpressao();
    clicar(botao('Imprimir'), 'Imprimir do diálogo');
    const texto = container.textContent ?? '';
    expect(texto).toContain('Ainda falta acertar');
    expect(texto, 'e nomeia o agrupamento, que é a parte que ninguém enxerga').toContain('agrupamento');
  });

  it('mostra o gasto de papel antes de gastar', () => {
    abrirImpressao();
    escolher('Cópias', '3');
    escolher('Páginas por folha', '2');
    expect(container.textContent).toContain('6 folhas de papel');
  });

  it('imprime quando as cinco escolhas batem com o pedido', () => {
    abrirImpressao();
    escolher('Cópias', '3');
    escolher('Qualidade', 'alta');
    marcarCaixa();
    escolher('Tamanho', 'pagina');
    escolher('Páginas por folha', '2');
    clicar(botao('Imprimir'), 'Imprimir do diálogo');
    expect(container.textContent).toContain('Saíram 3 cópias completas');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
  });
});

/* ── As quatro juntas ─────────────────────────────────────────────────────── */

describe('as quatro tarefas', () => {
  it('só liberam a conclusão quando todas foram feitas', () => {
    // 1 — compactar e extrair
    marcarOsQuatro();
    noMenuMais('Adicionar para o arquivo');
    clicar(botao('OK'), 'OK');
    clicar(linha('acampamento.rar'), 'o arquivo compactado');
    noMenuMais('Extrair para');
    clicar(botao('OK'), 'OK da extração');

    // 2 — pdf
    pelaIniciar('Editor de Texto');
    noMenuArquivo('Exportar como PDF');

    // 4 — imprimir
    noMenuArquivo('Imprimir');
    escolher('Cópias', '3');
    escolher('Qualidade', 'alta');
    marcarCaixa();
    escolher('Tamanho', 'pagina');
    escolher('Páginas por folha', '2');
    clicar(botao('Imprimir'), 'Imprimir do diálogo');
    expect(botaoFinal().textContent, 'ainda falta instalar e desinstalar').toMatch(/Faltam 1/);

    // 3 — instalar e desinstalar
    pelaIniciar('Navegador Web');
    clicar(todos('button').find(b => b.textContent?.includes('Site oficial')), 'o site oficial');
    pelaIniciar('Configurações');
    clicar(todos('button').find(b => b.getAttribute('aria-label') === 'Mais opções de Desenhador'), 'as três bolinhas');
    clicar(todos('.win-menu button').find(b => b.textContent === 'Desinstalar'), 'Desinstalar');

    const final = botaoFinal();
    expect(final.textContent).toContain('Concluir o laboratório');
    expect(final.disabled).toBe(false);
  });
});
