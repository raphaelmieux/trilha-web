// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import PlanilhaAvancadaLab from './PlanilhaAvancadaLab';
import PlanilhaLab from './PlanilhaLab';
import { GUIAS_DO_EXCEL } from './excel';
import { METAS_DO_ACAMPAMENTO, FORMULA_QUE_RESPEITA, INSCRITOS } from './planilhaDoAcampamento';

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
const linhasNaTela = () => container.querySelectorAll('.pa-tabela tbody tr').length;

describe('a planilha do acampamento se resolve clicando', () => {
  beforeEach(() => montar(AVANCADA));

  it('abre com as cinco por fazer e as cento e vinte linhas à vista', () => {
    expect(placar()).toEqual(['0', '5']);
    expect(feitas()).toEqual([]);
    expect(linhasNaTela()).toBe(INSCRITOS.length);
  });

  it('fecha as cinco seguindo o que o painel manda', () => {
    // 1 — ligar o filtro e escolher uma unidade
    clicar(porRotulo('Filtro'), 'Filtro');
    clicar(porRotulo('Filtrar por Unidade'), 'setinha da Unidade');
    clicar(itemDeMenu('Falcão'), 'Falcão');
    expect(feitas()).toContain('filtro');
    expect(linhasNaTela()).toBeLessThan(INSCRITOS.length);

    // 2 — os dois números não batem, e a fórmula é o que resolve
    expect(container.textContent).toContain('a SOMA continua');
    clicar(porRotulo('Fórmula da célula do total'), 'fórmula do total');
    escrever(porRotulo('Fórmula da célula do total'), FORMULA_QUE_RESPEITA, 'fórmula');
    act(() => { (porRotulo('Fórmula da célula do total') as HTMLInputElement).blur(); });
    expect(feitas()).toContain('soma');

    // 3 — congelar o cabeçalho, na guia Exibir
    clicar(guia('Exibir'), 'guia Exibir');
    clicar(porRotulo('Congelar Painéis'), 'Congelar Painéis');
    clicar(itemDeMenu('Congelar Linha Superior'), 'Congelar Linha Superior');
    expect(feitas()).toContain('congelar');

    // 4 e 5 — o gráfico do tipo certo, com título e eixos
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Gráfico de Linhas'), 'Gráfico de Linhas');
    expect(feitas()).toContain('grafico');

    escrever(porRotulo('Título do gráfico'), 'Inscrições de janeiro a junho', 'título');
    clicar(porRotulo('Títulos dos Eixos'), 'Títulos dos Eixos');

    const abertas = METAS_DO_ACAMPAMENTO.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['5', '5']);
  });

  /*
    Os dois números, que é a lição inteira da tarefa da soma.

    Com filtro aplicado, a célula do total e o rodapé mostram coisas
    diferentes — e é isso que se manda por engano para a liderança.
  */
  it('com filtro aplicado, a célula do total e o rodapé divergem na tela', () => {
    clicar(porRotulo('Filtro'), 'Filtro');
    clicar(porRotulo('Filtrar por Unidade'), 'setinha da Unidade');
    clicar(itemDeMenu('Águia'), 'Águia');

    const celula = container.querySelector('.pa-total p:nth-of-type(2)')?.textContent ?? '';
    const rodape = container.querySelector('.pl-status span:last-child')?.textContent ?? '';
    expect(celula.length, 'a célula do total não desenhou número nenhum').toBeGreaterThan(3);
    expect(rodape).toContain('à vista');
    expect(rodape).not.toContain(celula.replace('R$ ', '').trim());
  });

  /*
    O tipo do gráfico sai da pergunta, e a pergunta é de evolução.

    Pizza e colunas desenham sem erro nenhum e não respondem — e o programa diz
    por quê, em vez de só deixar a tarefa vermelha.
  */
  it('pizza desenha, explica e não fecha a tarefa', () => {
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Gráfico de Pizza'), 'Gráfico de Pizza');
    expect(container.textContent).toContain('Pizza responde composição');
    expect(feitas()).not.toContain('grafico');

    clicar(porRotulo('Gráfico de Linhas'), 'Gráfico de Linhas');
    expect(feitas()).toContain('grafico');
  });

  /* Filtro esconde e não apaga: desligá-lo devolve as cento e vinte. */
  it('desligar o filtro traz as linhas de volta', () => {
    clicar(porRotulo('Filtro'), 'Filtro');
    clicar(porRotulo('Filtrar por Unidade'), 'setinha da Unidade');
    clicar(itemDeMenu('Tucano'), 'Tucano');
    expect(linhasNaTela()).toBeLessThan(INSCRITOS.length);

    clicar(porRotulo('Filtro'), 'Filtro');
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
