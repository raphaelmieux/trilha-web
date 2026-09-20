// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDePlanilha from './LaboratorioDePlanilha';
import { CADERNOS_DA_CC_ES003, type CadernoDaLicao } from '../labs/cadernosDaCcEs003';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As sete lições da CC-ES003, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado das de motor ───────────────────────
  `cadernoDoClube.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a janela chama alguma delas: um botão sem
  `onClick`, um diálogo que não aplica, uma alça que não preenche — o motor
  continua correto e o laboratório fica impossível de vencer, que é pior do que
  um que abre resolvido, porque quem fez tudo certo fica olhando uma lista
  vermelha sem nada na tela que explique.

  É a mesma razão de `LaboratorioDeExplorador.test.tsx`, e está escrita lá:
  "trava de motor não é trava de tela".
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES003' } as Vereda;

function montar(caderno: CadernoDaLicao) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${caderno}`,
    tipo: 'planilha',
    titulo: 'Lição de teste',
    resumo: '',
    caderno,
    verificacoes: CADERNOS_DA_CC_ES003[caderno].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'planilha' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDePlanilha vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ─────────────────────────────────────────────────────────────── */

const celula = (l: number, c: number) =>
  container.querySelectorAll('.pl-grade tbody tr')[l].querySelectorAll('td')[c];

const cabecalhoDaLinha = (l: number) =>
  container.querySelectorAll('.pl-grade tbody tr')[l].querySelector('th')!;

const barra = () => container.querySelector<HTMLInputElement>('.pl-entrada')!;

const apontar = (alvo: Element, extra: PointerEventInit = {}) => {
  act(() => {
    alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, ...extra }));
  });
};

/*
  Passar o ponteiro por cima de uma célula.

  É `pointerover`, e não `pointerenter`: o React não escuta `pointerenter` — ele
  não borbulha —, e implementa `onPointerEnter` a partir de `pointerover` na
  raiz. Um teste que despachasse `pointerenter` veria a janela não reagir e
  acusaria o componente de um defeito que é do teste. Foi assim que esta trava
  nasceu vermelha com o navegador verde.
*/
const passarPor = (alvo: Element) => {
  act(() => { alvo.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })); });
};

const soltar = () => {
  act(() => {
    container.querySelector('.pl-grade-caixa')!
      .dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
};

const clicar = (alvo: Element | null) => {
  act(() => { alvo?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const botao = (dica: string) =>
  container.querySelector<HTMLButtonElement>(`button[title="${dica}"]`);

const guia = (nome: string) => {
  const alvo = [...container.querySelectorAll('.pl-guia')].find(g => g.textContent?.trim() === nome);
  clicar(alvo!);
};

const escreverValor = (campo: HTMLInputElement, texto: string) => {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(campo, texto);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const teclar = (alvo: Element, key: string, extra: KeyboardEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

/** Clica na célula e escreve pela barra de fórmulas, como quem monta a planilha. */
const escrever = (l: number, c: number, texto: string) => {
  apontar(celula(l, c));
  const campo = barra();
  act(() => { campo.focus(); campo.dispatchEvent(new FocusEvent('focus', { bubbles: true })); });
  escreverValor(barra(), texto);
  teclar(barra(), 'Enter');
};

/** Arrasta a faixa de uma célula até outra, como o ponteiro faria. */
const arrastarFaixa = (l1: number, c1: number, l2: number, c2: number) => {
  apontar(celula(l1, c1));
  passarPor(celula(l2, c2));
  soltar();
};

/**
 * Arrasta a alça de preenchimento, que é o gesto do requisito 4.3.
 *
 * Ela não tem coordenada nenhuma nas mãos: o que ela lê é de que célula o
 * arrasto começou e sobre qual ele passou. É por isso que este gesto se escreve
 * aqui sem layout — o jsdom não calcula nenhum.
 */
const arrastarAlca = (l: number, c: number, ateL: number, ateC: number) => {
  apontar(celula(l, c));
  apontar(container.querySelector('.pl-alca-preencher')!);
  passarPor(celula(ateL, ateC));
  soltar();
};

/** Quantas tarefas continuam abertas, lido do painel da plataforma. */
const abertas = () => {
  const texto = container.textContent ?? '';
  const m = /(\d+) de (\d+) conclu/.exec(texto);
  if (!m) throw new Error('o painel de tarefas não está na tela');
  return Number(m[2]) - Number(m[1]);
};

/* ── As sete lições ────────────────────────────────────────────────────────── */

describe('as lições da CC-ES003 se vencem clicando', () => {
  it('módulo 1 — arrumar: tamanho, título, cabeçalho e limpeza', () => {
    montar('arrumar');
    expect(abertas()).toBe(4);

    /* Alargar a coluna e a linha: o arrasto da borda do cabeçalho não tem
       layout no jsdom, então ele é dado pelos mesmos eventos que a mão dá. */
    const alcaCol = container.querySelector('.pl-alca-col')!;
    act(() => { alcaCol.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 10 })); });
    act(() => {
      container.querySelector('.pl-grade-caixa')!
        .dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 260, clientY: 10 }));
    });
    const alcaLin = container.querySelector('.pl-alca-lin')!;
    act(() => { alcaLin.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 30 })); });
    act(() => {
      container.querySelector('.pl-grade-caixa')!
        .dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 10, clientY: 70 }));
    });
    soltar();

    arrastarFaixa(0, 0, 0, 3);
    clicar(botao('Mesclar e Centralizar'));
    clicar(botao('Alinhar no Meio'));

    arrastarFaixa(1, 0, 1, 3);
    clicar(botao('Negrito'));
    clicar(botao('Centralizar'));

    apontar(cabecalhoDaLinha(14));
    teclar(container.querySelector('.pl-grade-caixa')!, 'Delete');

    expect(abertas(), 'a lição de arrumar não fecha clicando').toBe(0);
  });

  it('módulo 2 — contas: as cinco funções pela barra de fórmulas', () => {
    montar('contas');
    expect(abertas()).toBe(5);
    escrever(1, 6, '=SOMA(D3:D14)');
    escrever(2, 6, '=MÉDIA(C3:C14)');
    escrever(3, 6, '=MÁXIMO(C3:C14)');
    escrever(4, 6, '=MÍNIMO(C3:C14)');
    escrever(5, 6, '=CONT.NÚM(C3:C14)');
    expect(abertas(), 'a lição das contas não fecha clicando').toBe(0);
  });

  it('módulo 3 — custos: escrever uma fórmula e arrastar a alça', () => {
    montar('custos');
    expect(abertas()).toBe(3);
    escrever(3, 2, '=B4*B$1');
    arrastarAlca(3, 2, 14, 2);
    expect(abertas(), 'a alça de preenchimento não chega às doze linhas').toBe(0);
  });

  it('módulo 4 — unidades: PROCV e SE, arrastados para baixo', () => {
    montar('unidades');
    expect(abertas()).toBe(3);
    escrever(1, 3, '=PROCV(B2;$G$2:$H$7;2;FALSO)');
    arrastarAlca(1, 3, 12, 3);
    escrever(1, 4, '=SE(C2>=3;"Sim";"Não")');
    arrastarAlca(1, 4, 12, 4);
    expect(abertas(), 'a lição de decidir e procurar não fecha clicando').toBe(0);
  });

  it('módulo 5 — destaque: regra, congelar, classificar e filtrar', () => {
    montar('destaque');
    expect(abertas()).toBe(4);

    /* A regra vem antes do filtro: com linha escondida não há como arrastar a
       seleção até o fim dos dados — nem aqui nem no Excel. */
    arrastarFaixa(2, 2, 13, 2);
    clicar(botao('Formatação Condicional › Realçar Regras das Células'));
    const caixa = container.querySelector('.pl-dialogo')!;
    const quando = caixa.querySelector<HTMLSelectElement>('select')!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype, 'value')!.set!;
      setter.call(quando, 'menorQue');
      quando.dispatchEvent(new Event('change', { bubbles: true }));
    });
    escreverValor(caixa.querySelector<HTMLInputElement>('input')!, '3');
    clicar(container.querySelector('.pl-dialogo-bt-ok'));

    apontar(celula(2, 0));
    guia('Exibir');
    clicar(botao('Congelar Painéis'));

    guia('Dados');
    apontar(celula(3, 1));
    clicar(botao('Classificar de A a Z'));
    clicar(botao('Filtro'));
    clicar(container.querySelectorAll('.pl-cab-bt')[1]);
    clicar(container.querySelectorAll('.pl-filtro-lista .pl-filtro-item')[1]);

    expect(abertas(), 'a lição de destacar não fecha clicando').toBe(0);
  });

  it('módulo 6 — orçamento: totais dos dois lados e o gráfico', () => {
    montar('orcamento');
    expect(abertas()).toBe(5);
    escrever(2, 4, '=SOMA(B3:D3)');
    arrastarAlca(2, 4, 5, 4);
    escrever(6, 1, '=SOMA(B3:B6)');
    arrastarAlca(6, 1, 6, 3);
    escrever(6, 4, '=SOMA(E3:E6)');

    arrastarFaixa(2, 0, 5, 4);
    guia('Inserir');
    clicar(botao('Inserir Gráfico'));
    const caixa = container.querySelector('.pl-dialogo')!;
    const tipo = caixa.querySelector<HTMLSelectElement>('select')!;
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype, 'value')!.set!;
      setter.call(tipo, 'pizza');
      tipo.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const campos = caixa.querySelectorAll<HTMLInputElement>('input');
    escreverValor(campos[0], 'Para onde foi o dinheiro');
    escreverValor(container.querySelectorAll<HTMLInputElement>('.pl-dialogo input')[1], 'Categoria');
    escreverValor(container.querySelectorAll<HTMLInputElement>('.pl-dialogo input')[2], 'Reais');
    clicar(container.querySelector('.pl-dialogo-bt-ok'));

    expect(abertas(), 'a lição do orçamento não fecha clicando').toBe(0);
  });

  it('módulo 7 — conferência: os três defeitos consertados', () => {
    montar('conferencia');
    expect(abertas()).toBe(3);
    escrever(15, 3, '=SOMA(D3:D14)');
    escrever(5, 3, '135');
    escrever(16, 2, '=SOMA(C3:C14)');
    expect(abertas(), 'a lição de conferência não fecha clicando').toBe(0);
  });
});

/* ── O que a janela promete e o que ela não promete ────────────────────────── */

describe('a janela é a mesma das outras lições de planilha', () => {
  it('as cinco abas da pasta estão no pé, e a da lição está à frente', () => {
    montar('custos');
    const abas = [...container.querySelectorAll('.pl-aba')].map(a => a.textContent?.trim());
    expect(abas).toEqual(['Inscrições', 'Custos', 'Unidades', 'Orçamento', 'Conferir']);
    expect(container.querySelector('.pl-aba[aria-current="true"]')?.textContent?.trim()).toBe('Custos');
  });

  /*
    Trocar de aba não perde o trabalho. Sem isso, quem clicasse em Inscrições
    para conferir um número voltaria a Custos com a coluna vazia — e não teria
    como saber que foi o clique.
  */
  it('trocar de aba e voltar não perde o que foi escrito', () => {
    montar('custos');
    escrever(3, 2, '=B4*B$1');
    clicar([...container.querySelectorAll('.pl-aba')].find(a => a.textContent?.trim() === 'Inscrições')!);
    clicar([...container.querySelectorAll('.pl-aba')].find(a => a.textContent?.trim() === 'Custos')!);
    expect(celula(3, 2).textContent?.trim()).toBe('135');
  });

  /*
    O roteiro da apresentação só existe na última lição. Nas outras ele
    descreveria uma planilha pela metade, e a pessoa ensaiaria em cima de nada.
  */
  it('o roteiro da apresentação só aparece na lição que o requisito 8 pede', () => {
    montar('conferencia');
    expect(container.textContent).toContain('Ensaiar a apresentação');
    act(() => root.unmount());
    container.remove();
    montar('contas');
    expect(container.textContent).not.toContain('Ensaiar a apresentação');
  });

  /*
    A faixa tem todos os comandos o tempo todo, porque é assim que um programa
    é. Um Excel que só mostrasse Formatação Condicional na lição dela ensinaria
    a procurar o botão que a tarefa quer, e não a procurar no programa.
  */
  it('a faixa não muda conforme o exercício', () => {
    montar('contas');
    expect(botao('Formatação Condicional › Realçar Regras das Células')).not.toBeNull();
    expect(botao('Mesclar e Centralizar')).not.toBeNull();
    guia('Dados');
    expect(botao('Filtro')).not.toBeNull();
    guia('Exibir');
    expect(botao('Congelar Painéis')).not.toBeNull();
  });
});
