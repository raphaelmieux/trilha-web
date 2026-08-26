// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
        <OperacoesArquivoLab specialtyCode="AP042" lessonCode="AP042.6-L1" lessonTitle="Compactar, exportar, instalar e imprimir" requirementCodes={['AP042-6.1']} userId="u1" />
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

/*
  Os bastidores do Word: a guia Arquivo abre a tela azul, e a faixa da
  esquerda leva a Salvar como, Exportar e Imprimir. Não é menu suspenso — é
  tela inteira, como no Word de verdade.
*/
const nosBastidores = (aba: string) => {
  const guia = todos('.wd-guias button').find(b => b.textContent?.trim() === 'Arquivo');
  if (guia) clicar(guia, 'a guia Arquivo');
  const item = todos('.wd-rail button').find(b => b.textContent?.trim() === aba);
  clicar(item, `${aba} na faixa dos bastidores`);
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
  for (const n of ['acampamento-01.jpg', 'acampamento-02.jpg', 'lista-de-presenca.docx', 'relatorio-da-unidade.docx']) {
    clicar(linha(n), n);
  }
};

/** Um botão do rodapé do assistente de instalação. */
const noAssistente = (texto: string) =>
  todos('.setup-pe button').find(b => b.textContent?.trim().startsWith(texto));

/** Marca uma caixa ou um botão de opção pelo texto do rótulo que o acompanha. */
const marcarRotulo = (texto: string, ligado = true) => {
  const rotulo = todos('label').find(l => l.textContent?.includes(texto));
  const campo = rotulo?.querySelector<HTMLInputElement>('input');
  if (!campo) throw new Error(`não achei a marcação: ${texto}`);
  if (campo.checked === ligado) return;
  act(() => { campo.click(); });
};

const botaoFinal = () =>
  todos('button').find(b => /Concluir o laborat|Faltam/.test(b.textContent ?? ''))! as HTMLButtonElement;

/*
  A instalação tem duas esperas de verdade — o download e a barra de progresso —
  e teste não espera de verdade. Relógio de mentira, e o tempo anda quando o
  teste manda. Vale para o arquivo todo: nenhum outro trecho depende de relógio.
*/
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

const correr = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

const contendo = (texto: string) => todos('button').find(b => b.textContent?.includes(texto));
const noDialogo = (texto: string) =>
  todos('.win-modal-pe button').find(b => b.textContent === texto);

/** Do menu Iniciar até o instalador baixado, na pasta Downloads. */
const baixar = () => {
  pelaIniciar('Navegador Web');
  clicar(contendo('Site oficial'), 'o site oficial');
  clicar(contendo('Baixar para Windows'), 'baixar');
  correr(3000);
};

/** O caminho inteiro: baixar, autorizar e percorrer o assistente. */
const instalar = ({ atalhoNaArea = true } = {}) => {
  baixar();
  clicar(contendo('Abrir arquivo'), 'abrir o instalador');
  clicar(noDialogo('Sim'), 'permitir no controle de conta');
  clicar(noDialogo('OK'), 'confirmar o idioma');
  clicar(noAssistente('Avançar'), 'sair das boas-vindas');
  marcarRotulo('Eu aceito');
  clicar(noAssistente('Avançar'), 'sair do contrato');
  clicar(noAssistente('Avançar'), 'sair do destino');
  marcarRotulo('Criar um ícone na Área de Trabalho', atalhoNaArea);
  clicar(noAssistente('Avançar'), 'sair dos atalhos');
  clicar(noAssistente('Instalar'), 'instalar');
  correr(3000);
  clicar(noAssistente('Concluir'), 'concluir');
};

/* No Word, agrupar é uma lista de duas opções, e não uma caixinha. */
const agrupar = () => escolher('Agrupamento', 'sim');

/* ── A área de trabalho ───────────────────────────────────────────────────── */

describe('a área de trabalho', () => {
  it('abre no Explorador, na pasta do clube, com os quatro arquivos', () => {
    expect(container.textContent).toContain('Clube');
    expect(nomesVisiveis()).toContain('relatorio-da-unidade.docx');
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
    for (const n of ['acampamento-01.jpg', 'acampamento-02.jpg', 'lista-de-presenca.docx', 'relatorio-da-unidade.docx']) {
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
    nosBastidores('Salvar');
    expect(container.textContent).toContain('Salvar apenas grava por cima do mesmo documento do Word');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('recusa o .txt, que perde a formatação', () => {
    abrirEditor();
    nosBastidores('Salvar como');
    escolher('Tipo', 'txt');
    clicar(todos('.wd-bast-corpo button').find(b => b.textContent?.includes('Salvar')), 'Salvar dos bastidores');
    expect(container.textContent).toContain('guarda só as letras');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('aceita o pdf, e o arquivo aparece na pasta', () => {
    abrirEditor();
    nosBastidores('Salvar como');
    escolher('Tipo', 'pdf');
    clicar(todos('.wd-bast-corpo button').find(b => b.textContent?.includes('Salvar')), 'Salvar dos bastidores');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
    expect(nomesVisiveis()).toContain('relatorio-da-unidade.pdf');
  });

  it('aceita também o Exportar, que é o outro caminho de verdade', () => {
    abrirEditor();
    nosBastidores('Exportar');
    clicar(contendo('Criar PDF/XPS'), 'Criar PDF/XPS');
    expect(botaoFinal().textContent).toMatch(/Faltam 3/);
  });
});

/* ── 3. Instalar e desinstalar ────────────────────────────────────────────── */

describe('instalar e desinstalar', () => {
  it('recusa o site que junta programas grátis', () => {
    pelaIniciar('Navegador Web');
    clicar(contendo('Baixaki'), 'o agregador');
    expect(container.textContent).toContain('empacotar o instalador com outras coisas junto');
  });

  it('recusa o link do grupo com a versão paga liberada', () => {
    pelaIniciar('Navegador Web');
    clicar(contendo('ATIVADO'), 'o link do grupo');
    expect(container.textContent).toContain('é isca');
  });

  /* Clicar no resultado de busca leva ao site; não baixa. Confundir os dois é
     o que faz alguém aceitar um download que começou sozinho. */
  it('leva ao site do fabricante em vez de baixar de cara', () => {
    pelaIniciar('Navegador Web');
    clicar(contendo('Site oficial'), 'o site oficial');
    expect(container.textContent).toContain('Baixar para Windows');
    expect(botaoFinal().textContent, 'e nada foi instalado').toMatch(/Faltam 4/);
  });

  it('baixa para a pasta Downloads, e baixar ainda não é instalar', () => {
    baixar();
    expect(container.textContent).toContain('baixar não é instalar');
    clicar(naArvore('Downloads'), 'Downloads');
    expect(nomesVisiveis()).toContain('desenhador-6.2-instalador.exe');
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  /* Sem a permissão do controle de conta nenhum instalador roda, e é essa
     tela que mostra quem assinou o arquivo. */
  it('não instala nada quando a permissão do sistema é negada', () => {
    baixar();
    clicar(contendo('Abrir arquivo'), 'abrir o instalador');
    expect(container.textContent).toContain('Editor verificado');
    clicar(noDialogo('Não'), 'recusar');
    expect(container.querySelector('.setup-pe'), 'o assistente não abriu').toBeFalsy();
    expect(botaoFinal().textContent).toMatch(/Faltam 4/);
  });

  it('não deixa avançar sem aceitar o contrato', () => {
    baixar();
    clicar(contendo('Abrir arquivo'), 'abrir o instalador');
    clicar(noDialogo('Sim'), 'permitir');
    clicar(noDialogo('OK'), 'idioma');
    clicar(noAssistente('Avançar'), 'boas-vindas');
    expect(container.textContent).toContain('CONTRATO DE LICENÇA');
    expect((noAssistente('Avançar') as HTMLButtonElement).disabled).toBe(true);
    marcarRotulo('Eu aceito');
    expect((noAssistente('Avançar') as HTMLButtonElement).disabled).toBe(false);
  });

  it('cancelar no meio não deixa nada instalado', () => {
    baixar();
    clicar(contendo('Abrir arquivo'), 'abrir o instalador');
    clicar(noDialogo('Sim'), 'permitir');
    clicar(noDialogo('OK'), 'idioma');
    clicar(noAssistente('Cancelar'), 'cancelar');
    expect(container.textContent).toContain('Nada foi instalado');
    clicar(naArvore('Arquivos de Programas'), 'Arquivos de Programas');
    expect(nomesVisiveis()).not.toContain('Desenhador');
  });

  it('instala, e o atalho aparece porque foi marcado', () => {
    instalar();
    clicar(naArvore('Arquivos de Programas'), 'Arquivos de Programas');
    expect(nomesVisiveis()).toContain('Desenhador');
    clicar(naArvore('Área de Trabalho'), 'Área de Trabalho');
    expect(nomesVisiveis()).toContain('Desenhador — Atalho');
  });

  /* A caixinha que quase ninguém lê tem efeito, e o efeito é visível. Um
     assistente onde marcar ou desmarcar dá no mesmo ensina a não ler. */
  it('não cria atalho na área de trabalho quando a caixa é desmarcada', () => {
    instalar({ atalhoNaArea: false });
    clicar(naArvore('Área de Trabalho'), 'Área de Trabalho');
    expect(nomesVisiveis()).not.toContain('Atalho');
    clicar(naArvore('Arquivos de Programas'), 'Arquivos de Programas');
    expect(nomesVisiveis(), 'e o programa está instalado do mesmo jeito').toContain('Desenhador');
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
    clicar(naArvore('Downloads'), 'Downloads');
    expect(nomesVisiveis(), 'e o instalador continua lá, que é o que acontece')
      .toContain('desenhador-6.2-instalador.exe');
  });
});

/* ── 4. Imprimir ──────────────────────────────────────────────────────────── */

describe('imprimir do jeito que foi pedido', () => {
  const abrirImpressao = () => {
    pelaIniciar('Editor de Texto');
    nosBastidores('Imprimir');
  };



  it('diz o que ainda falta acertar, em vez de só recusar', () => {
    abrirImpressao();
    clicar(todos('.wd-bast-corpo button').find(b => b.textContent?.trim() === 'Imprimir'), 'Imprimir dos bastidores');
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
    escolher('Qualidade de impressão', 'alta');
    agrupar();
    escolher('Tamanho', 'pagina');
    escolher('Páginas por folha', '2');
    clicar(todos('.wd-bast-corpo button').find(b => b.textContent?.trim() === 'Imprimir'), 'Imprimir dos bastidores');
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
    nosBastidores('Exportar');
    clicar(contendo('Criar PDF/XPS'), 'Criar PDF/XPS');

    // 4 — imprimir
    nosBastidores('Imprimir');
    escolher('Cópias', '3');
    escolher('Qualidade de impressão', 'alta');
    agrupar();
    escolher('Tamanho', 'pagina');
    escolher('Páginas por folha', '2');
    clicar(todos('.wd-bast-corpo button').find(b => b.textContent?.trim() === 'Imprimir'), 'Imprimir dos bastidores');
    expect(botaoFinal().textContent, 'ainda falta instalar e desinstalar').toMatch(/Faltam 1/);

    // 3 — instalar e desinstalar
    instalar();
    pelaIniciar('Configurações');
    clicar(todos('button').find(b => b.getAttribute('aria-label') === 'Mais opções de Desenhador'), 'as três bolinhas');
    clicar(todos('.win-menu button').find(b => b.textContent === 'Desinstalar'), 'Desinstalar');

    const final = botaoFinal();
    expect(final.textContent).toContain('Concluir o laboratório');
    expect(final.disabled).toBe(false);
  });
});
