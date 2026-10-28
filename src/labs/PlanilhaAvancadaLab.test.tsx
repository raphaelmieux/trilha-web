// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import PlanilhaAvancadaLab from './PlanilhaAvancadaLab';
import PlanilhaLab from './PlanilhaLab';
import { GUIAS_DO_EXCEL } from './excel';
import { METAS_DO_ACAMPAMENTO, FORMULA_INICIAL, FORMULA_QUE_RESPEITA, INSCRITOS } from './planilhaDoAcampamento';

/*
  A planilha do acampamento, percorrida clicando.

  E, junto, a trava que a extração de `excel.tsx` cobra: os **dois**
  laboratórios de planilha da plataforma têm de mostrar a mesma janela. Foi o
  defeito que o Word já teve — dois "Word" na mesma trilha, um com onze guias e
  outro com três —, e ele voltaria aqui na primeira vez que alguém ajustasse a
  faixa de um só.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const montar = (elemento: React.ReactElement) => {
  act(() => { root.render(<MemoryRouter>{elemento}</MemoryRouter>); });
};

const AVANCADA = (
  <PlanilhaAvancadaLab
    specialtyCode="AP044" lessonCode="AP044.5-L2"
    lessonTitle="Filtrando e desenhando as inscrições"
    requirementCodes={['AP044-8.1']}
    userId="00000000-0000-0000-0000-000000000000" />
);

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim() === texto);
const guia = (nome: string) => porTexto('.pl-guia', nome);
const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.pl-menu-item')].find(e => e.textContent?.trim() === texto);

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DO_ACAMPAMENTO) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);

/* ── Os gestos da grade, os mesmos da trava da CC-ES003 ────────────────────── */

const celula = (l: number, c: number) =>
  container.querySelectorAll('.pl-grade tbody tr')[l].querySelectorAll('td')[c];
const linhasNaTela = () =>
  [...container.querySelectorAll('.pl-grade tbody tr')].slice(1, INSCRITOS.length + 1)
    .filter(tr => !tr.classList.contains('pl-escondida')).length;
const apontar = (alvo: Element, extra: PointerEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, ...extra })); });
};
const soltar = () => {
  act(() => { container.querySelector('.pl-grade-caixa')!.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
};
const barra = () => container.querySelector<HTMLInputElement>('.pl-entrada')!;
const teclar = (alvo: Element, key: string) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
};
/** Clica na célula e escreve pela barra de fórmulas. */
const escreverNaCelula = (l: number, c: number, texto: string) => {
  apontar(celula(l, c));
  soltar();
  const campo = barra();
  act(() => { campo.focus(); campo.dispatchEvent(new FocusEvent('focus', { bubbles: true })); });
  escrever(barra(), texto, 'barra de fórmulas');
  teclar(barra(), 'Enter');
};
const botao = (dica: string) => container.querySelector(`button[title="${dica}"]`);
const filtrar = (unidade: string) => {
  clicar(guia('Dados'), 'guia Dados');
  if (!container.querySelector('[aria-label="Filtrar a coluna B"]')) clicar(botao('Filtro'), 'Filtro');
  clicar(porRotulo('Filtrar a coluna B'), 'setinha da Unidade');
  clicar(porTexto('.pl-filtro-item', unidade), unidade);
};
const D123 = { l: 122, c: 3 };

describe('a planilha do acampamento se resolve clicando', () => {
  beforeEach(() => montar(AVANCADA));

  it('abre com as cinco por fazer e as cento e vinte linhas à vista', () => {
    expect(placar()).toEqual(['0', '5']);
    expect(feitas()).toEqual([]);
    expect(linhasNaTela()).toBe(INSCRITOS.length);
  });

  it('é a grade do Excel: o total mora em D123, escrito como fórmula', () => {
    apontar(celula(D123.l, D123.c));
    soltar();
    expect(barra().value).toBe(FORMULA_INICIAL);
    expect(container.querySelector('.pl-nome')?.textContent?.trim()).toBe('D123');
  });

  it('fecha as cinco seguindo o que o painel manda', () => {
    // 1 — ligar o filtro e escolher uma unidade
    filtrar('Falcão');
    expect(feitas()).toContain('filtro');
    expect(linhasNaTela()).toBeLessThan(INSCRITOS.length);

    // 2 — o total passa a respeitar o filtro
    escreverNaCelula(D123.l, D123.c, FORMULA_QUE_RESPEITA);
    expect(feitas()).toContain('soma');

    // 3 — congelar o cabeçalho, na guia Exibir
    clicar(guia('Exibir'), 'guia Exibir');
    clicar(botao('Congelar Painéis'), 'Congelar Painéis');
    clicar(itemDeMenu('Congelar Linha Superior'), 'Congelar Linha Superior');
    expect(feitas()).toContain('congelar');

    // 4 — o gráfico do tipo certo, a partir dos meses na outra aba
    clicar(porTexto('.pl-aba', 'Por mês'), 'aba Por mês');
    apontar(celula(1, 0));
    soltar();
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(botao('Inserir Gráfico de Linhas'), 'Gráfico de Linhas');
    expect(feitas()).toContain('grafico');

    // 5 — título no próprio gráfico, e os eixos pela guia contextual
    escrever(porRotulo('Título do Gráfico'), 'Inscrições de janeiro a junho', 'título');
    clicar(guia('Design do Gráfico'), 'guia Design do Gráfico');
    clicar(botao('Adicionar Elemento Gráfico'), 'Adicionar Elemento Gráfico');
    clicar(itemDeMenu('Títulos dos Eixos'), 'Títulos dos Eixos');
    escrever(porRotulo('Título do Eixo Horizontal'), 'Mês', 'eixo horizontal');
    escrever(porRotulo('Título do Eixo Vertical'), 'Inscritos', 'eixo vertical');

    const abertas = METAS_DO_ACAMPAMENTO.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['5', '5']);
  });

  /*
    Os dois números, que é a lição inteira da tarefa da soma.

    Com filtro aplicado, a célula D123 e a Soma da barra de status — com a
    coluna selecionada — mostram coisas diferentes. O programa não avisa: é a
    régua que relata, e quem compara é o desbravador.
  */
  it('com filtro aplicado, D123 e a Soma da barra de status divergem', () => {
    filtrar('Águia');
    apontar(celula(1, 3));
    apontar(celula(120, 3), { shiftKey: true });
    soltar();
    const soma = [...container.querySelectorAll('.pl-status span')].find(e => e.textContent?.startsWith('Soma:'))?.textContent ?? '';
    const naCelula = celula(D123.l, D123.c).textContent ?? '';
    expect(soma, 'a barra de status não somou a seleção').toMatch(/Soma: \d/);
    expect(naCelula).toMatch(/\d/);
    const numero = (t: string) => Number(t.replace(/[^\d,]/g, '').replace(',', '.'));
    expect(numero(naCelula)).toBeGreaterThan(numero(soma));
    expect(container.textContent).toMatch(/\d+ de 120 registros encontrados/);
  });

  /*
    O tipo do gráfico sai da pergunta, e a pergunta é de evolução.

    Pizza e colunas desenham sem erro nenhum e não respondem — e o programa diz
    por quê, em vez de só deixar a tarefa vermelha.
  */
  it('pizza desenha, explica e não fecha a tarefa', () => {
    clicar(porTexto('.pl-aba', 'Por mês'), 'aba Por mês');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(botao('Inserir Gráfico de Pizza'), 'Gráfico de Pizza');
    expect(container.textContent).toContain('Pizza responde composição');
    expect(feitas()).not.toContain('grafico');

    clicar(botao('Alterar Tipo de Gráfico'), 'Alterar Tipo de Gráfico');
    clicar(itemDeMenu('Linhas'), 'Linhas');
    expect(feitas()).toContain('grafico');
  });

  /* Clicar fora do gráfico tira a guia contextual, como no Excel. */
  it('Design do Gráfico só existe com o gráfico escolhido', () => {
    clicar(porTexto('.pl-aba', 'Por mês'), 'aba Por mês');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(botao('Inserir Gráfico de Linhas'), 'Gráfico de Linhas');
    expect(guia('Design do Gráfico')).toBeTruthy();
    apontar(celula(3, 3));
    expect(guia('Design do Gráfico')).toBeFalsy();
  });

  /* Filtro esconde e não apaga: desligá-lo devolve as cento e vinte. */
  it('desligar o filtro traz as linhas de volta', () => {
    filtrar('Tucano');
    expect(linhasNaTela()).toBeLessThan(INSCRITOS.length);

    clicar(botao('Filtro'), 'Filtro');
    expect(linhasNaTela()).toBe(INSCRITOS.length);
  });
});

/*
  Os dois laboratórios de planilha mostram a mesma janela.

  É a trava que a extração de `excel.tsx` existe para sustentar. Sem ela, o
  primeiro ajuste na faixa de um dos dois faria a plataforma passar a mostrar
  dois "Excel" diferentes — que é exatamente o que aconteceu com o Word.
*/
describe('a janela do Excel é uma só', () => {
  const LABORATORIOS = [
    { nome: 'planilha (AP043)', elemento: (
      <PlanilhaLab
        specialtyCode="AP043" lessonCode="AP043.5-L2"
        lessonTitle="Montando o orçamento do acampamento"
        requirementCodes={['AP043-5.1']}
        userId="00000000-0000-0000-0000-000000000000" />
    ) },
    { nome: 'planilha avançada (AP044)', elemento: AVANCADA },
  ];

  for (const { nome, elemento } of LABORATORIOS) {
    it(`o laboratório de ${nome} mostra a fileira inteira de guias`, () => {
      montar(elemento);
      const escritas = [...container.querySelectorAll('.pl-guia')].map(g => g.textContent?.trim());
      expect(escritas, 'a guia Arquivo sumiu da fileira').toContain('Arquivo');
      for (const g of GUIAS_DO_EXCEL) {
        expect(escritas, `a guia ${g} sumiu da fileira`).toContain(g);
      }
    });

    it(`o laboratório de ${nome} tem barra de título, abas e barra de status`, () => {
      montar(elemento);
      expect(container.querySelector('.pl-titulo'), 'janela sem barra de título').not.toBeNull();
      expect(container.querySelector('.pl-abas'), 'planilha sem a fileira de abas do pé').not.toBeNull();
      expect(container.querySelector('.pl-status'), 'janela sem barra de status').not.toBeNull();
    });
  }
});
