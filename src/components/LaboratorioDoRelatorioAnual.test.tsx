// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoRelatorioAnual from './LaboratorioDoRelatorioAnual';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { TEXTO_DO_CABECALHO, SECAO_QUE_FALTA } from '../labs/relatorioAnual';

/*
  O relatório anual do módulo 4, percorrido clicando.

  `relatorioAnual.test.ts` prova que as cinco metas podem ficar verdes. Isto
  pergunta a outra metade — **a janela chama alguma delas?** — e três coisas
  que só esta lição faz:

  - **a folha reparte de verdade?** Cabeçalho que se repete numa folha só não
    se repete, e número de página que nunca muda não mostra a diferença entre
    o campo e o número digitado. Sem mais de uma folha na tela, as duas
    tarefas ficariam sem o que ensinar e ainda assim dariam verde.
  - **o número muda de folha para folha na tela?** É a lição, e ela é visual.
  - **o campo é mesmo intocável?** Deixar digitar por cima dele ensinaria que
    dá para consertar o número errado escrevendo o certo — o gesto que a lição
    existe para desfazer.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VEREDA = VEREDAS.find(v => v.code === 'CC-ES002')!;
const licaoDeWord = (id: string) => {
  const l = licoesDaVereda(VEREDA).find(x => x.id === id);
  if (!l || l.tipo !== 'word') throw new Error(`${id} não é uma lição de Word`);
  return l;
};

let container: HTMLDivElement;
let root: Root;
let venceu = false;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  venceu = false;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const montar = () => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoRelatorioAnual
          vereda={VEREDA} licao={licaoDeWord('m4-lab')}
          aoVencer={() => { venceu = true; }}
          aoSair={() => {}}
        />
      </MemoryRouter>,
    );
  });
};

/* ── Ajudas de clique ──────────────────────────────────────────────────────── */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('.wd-guia')].find(b => b.textContent?.trim() === nome);

const folhas = () => [...container.querySelectorAll('.wd-pagina')];
const bloco = (id: string) => container.querySelector(`[data-bloco="${id}"]`);

const faixas = (onde: 'cabecalho' | 'rodape') =>
  [...container.querySelectorAll(`[data-faixa="${onde}"]`)];

/** O que cada folha mostra na faixa pedida, na ordem das folhas. */
const oQueAsFaixasDizem = (onde: 'cabecalho' | 'rodape') =>
  faixas(onde).map((f) => {
    const campo = f.querySelector('[data-campo="pagina"]')?.textContent ?? '';
    const escrito = [...f.querySelectorAll('input')].map(i => (i as HTMLInputElement).value).join('');
    const solto = [...f.querySelectorAll('span > span')]
      .filter(s => !s.hasAttribute('data-campo')).map(s => s.textContent).join('');
    return `${escrito}${solto}${campo}`.trim();
  });

const escrever = (campo: HTMLInputElement | undefined, texto: string) => {
  expect(campo, 'não achei o campo de escrita').toBeTruthy();
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo, texto);
    campo!.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const linhasDoSumario = () =>
  [...container.querySelectorAll('.wd-sumario-linha')].map(l => l.textContent?.trim() ?? '');

const paginasDoSumario = () =>
  [...container.querySelectorAll('[data-sumario-pagina]')]
    .map(e => Number(e.getAttribute('data-sumario-pagina')));

const estado = () =>
  [...container.querySelectorAll('.wd-status span')].map(s => s.textContent?.trim()).join(' | ');

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const podeConcluir = () => {
  const b = botaoDeConcluir();
  expect(b, 'o botão de concluir sumiu da cápsula').toBeTruthy();
  return !(b as HTMLButtonElement).disabled;
};

const oQueFalta = () =>
  [...container.querySelectorAll('aside p')].map(p => p.textContent?.trim()).join(' | ');

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório anual abre por arrumar', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abriu resolvida').toBe(false);
  });

  it('a folha reparte de verdade, e há mais de uma na tela', () => {
    /*
      A pergunta que só esta lição faz. Com uma folha só, "o cabeçalho se
      repete" e "o número muda" não teriam onde acontecer — e as duas tarefas
      ainda assim poderiam ficar verdes, medindo o estado e não o efeito.
    */
    montar();
    expect(folhas().length,
      'a folha voltou a ser uma só: não há como ver o que se repete')
      .toBeGreaterThanOrEqual(3);
    expect(container.textContent).toContain('Folha 1 de');
  });

  it('o rodapé chega digitado, dizendo o mesmo em todas as folhas', () => {
    montar();
    const lidos = oQueAsFaixasDizem('rodape');
    expect(lidos.length).toBe(folhas().length);
    expect(new Set(lidos).size,
      'o rodapé já muda de folha para folha — o defeito não chegou').toBe(1);
    expect(lidos[0]).toContain('2');
    expect(container.querySelectorAll('[data-campo="pagina"]').length,
      'já há campo de página: não haveria o que trocar').toBe(0);
  });

  it('não chega com cabeçalho nem com sumário', () => {
    montar();
    expect(faixas('cabecalho')).toHaveLength(0);
    expect(linhasDoSumario()).toHaveLength(0);
    expect(estado()).toContain('Sem sumário');
  });
});

describe('o relatório anual pode ser vencido clicando', () => {
  it('cabeçalho, numeração, primeira folha, seção e sumário', () => {
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');

    /* 1. Cabeçalho, aberto e escrito. */
    clicar(comando('Cabeçalho'), 'Cabeçalho');
    expect(faixas('cabecalho').length,
      'o cabeçalho não apareceu em todas as folhas').toBe(folhas().length);
    escrever(faixas('cabecalho')[0].querySelector('input') as HTMLInputElement, TEXTO_DO_CABECALHO);
    expect(oQueAsFaixasDizem('cabecalho').every(t => t === TEXTO_DO_CABECALHO),
      'o que se escreveu numa folha não apareceu nas outras').toBe(true);

    /* 2. O número de página, que troca o digitado. */
    clicar(comando('Número de Página'), 'Número de Página');
    const numeros = oQueAsFaixasDizem('rodape');
    expect(new Set(numeros).size,
      'o rodapé continuou dizendo a mesma coisa em todas as folhas').toBe(numeros.length);
    /*
      Igualdade exata, e não "contém 1": o campo posto **ao lado** do número
      digitado daria "Página 21" e "Página 22", que passariam por "contém" e
      deixariam o documento pior do que antes com a tarefa verde.
    */
    expect(numeros[0]).toBe('Página 1');
    expect(numeros[1]).toBe('Página 2');

    /* 3. A primeira folha sem faixa. */
    clicar(comando('Primeira Página Diferente'), 'Primeira Página Diferente');
    expect(faixas('cabecalho').length,
      'a folha 1 continuou com cabeçalho').toBe(folhas().length - 1);

    /* 4. O sumário, gerado antes da seção — que é a ordem que ensina. */
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Sumário'), 'Sumário');
    const antes = linhasDoSumario();
    expect(antes.length, 'o sumário saiu vazio').toBeGreaterThan(3);
    expect(estado()).toContain('Sumário em dia');

    /* 5. A seção que faltava — e o sumário envelhece na tela. */
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Acrescentar a seção de encerramento'), 'Seção de encerramento');
    expect(bloco(SECAO_QUE_FALTA.tituloId), 'a seção não entrou').toBeTruthy();
    expect(linhasDoSumario(), 'o sumário se atualizou sozinho').toEqual(antes);
    expect(estado(), 'a régua de status não acusou o sumário velho')
      .toContain('Sumário desatualizado');
    expect(podeConcluir(), 'a lição fechou com o sumário velho').toBe(false);

    /* 6. Atualizar alcança. */
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Atualizar Sumário'), 'Atualizar Sumário');
    expect(linhasDoSumario().some(l => l.includes(SECAO_QUE_FALTA.titulo)),
      'a seção nova não entrou no sumário atualizado').toBe(true);

    expect(podeConcluir(), oQueFalta()).toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu, 'o botão de concluir não registrou a lição').toBe(true);
  });

  it('o cabeçalho aberto e nunca escrito não fecha a tarefa', () => {
    /* Abrir é um clique; a tarefa pede o nome do clube em toda folha. */
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Cabeçalho'), 'Cabeçalho');
    expect(faixas('cabecalho').length).toBeGreaterThan(0);
    expect(podeConcluir(), 'um cabeçalho vazio contou').toBe(false);
  });

  it('o número de página não se digita por cima', () => {
    /*
      Se o campo fosse editável, o caminho mais curto seria escrever o número
      certo em cada folha — que é o gesto que a lição existe para desfazer, e
      que não funciona: a faixa é uma só, e o que se escreve nela vale para
      todas.
    */
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Número de Página'), 'Número de Página');

    const campos = container.querySelectorAll('[data-campo="pagina"]');
    expect(campos.length, 'o campo de página não foi desenhado').toBe(folhas().length);
    for (const c of campos) {
      /* Nem o próprio elemento é um campo de digitar, nem há um dentro dele:
         a primeira forma é a que escapa de procurar só por dentro. */
      expect(c.tagName, 'o número de página virou um campo de digitar').not.toBe('INPUT');
      expect(c.querySelector('input'),
        'há um campo de digitar dentro do número de página').toBeNull();
    }
    /* E o que o rodapé aceita escrever é só o texto ao lado do número. */
    const escreviveis = container.querySelectorAll('[data-faixa="rodape"] input');
    expect(escreviveis.length,
      'o rodapé ficou com mais campos de digitar do que o texto dele')
      .toBe(folhas().length);
  });
});

describe('o sumário guarda a folha, e ela anda', () => {
  it('cada entrada mostra a folha em que o título está', () => {
    montar();
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Sumário'), 'Sumário');

    const paginas = paginasDoSumario();
    expect(paginas.length).toBeGreaterThan(3);
    expect(new Set(paginas).size,
      'todas as entradas apontaram para a mesma folha — o número é o índice, e não a folha')
      .toBeGreaterThan(1);
    expect(paginas, 'as folhas saíram fora de ordem')
      .toEqual([...paginas].sort((a, b) => a - b));
  });

  it('gerar o sumário de novo depois da seção o põe em dia', () => {
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Acrescentar a seção de encerramento'), 'Seção de encerramento');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Sumário'), 'Sumário');
    expect(estado()).toContain('Sumário em dia');
    expect(linhasDoSumario().some(l => l.includes(SECAO_QUE_FALTA.titulo))).toBe(true);
  });
});
