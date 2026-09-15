// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeWord from './LaboratorioDeWord';
import EstilosTextoLab from '../labs/EstilosTextoLab';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, percorrido clicando.

  ── A pergunta que só esta trava faz ────────────────────────────────────
  `oficioDoClube.test.ts` prova que as cinco metas podem ficar verdes,
  chamando as funções puras. Isso não prova que a janela chama alguma delas:
  um botão sem `onClick`, um menu de contexto que não abre, uma caixa de
  diálogo cujo OK não grava — as metas continuam corretas e o laboratório
  fica impossível de vencer.

  É a mesma divisão de `exploradorValidator.test.ts` e
  `LaboratorioDeExplorador.test.tsx`, e a razão está escrita lá:
  "laboratório impossível de vencer é pior do que um que abre resolvido".

  ── E os dois laboratórios de Word ──────────────────────────────────────
  Este é o segundo. O primeiro é o da AP044, e as peças da janela saíram para
  `word.tsx` justamente para não haver dois "Word" diferentes. Aqui os dois
  são montados e comparados, como `PlanilhaAvancadaLab.test.tsx` faz com os
  dois Excel.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VEREDA = VEREDAS.find(v => v.code === 'CC-ES002')!;
const LICAO = (() => {
  const l = licoesDaVereda(VEREDA).find(x => x.id === 'm1-lab');
  if (!l || l.tipo !== 'word') throw new Error('m1-lab não é uma lição de Word');
  return l;
})();

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
        <LaboratorioDeWord
          vereda={VEREDA} licao={LICAO}
          aoVencer={() => { venceu = true; }}
          aoSair={() => {}}
        />
      </MemoryRouter>,
    );
  });
};

/* ── Ajudas de clique ──────────────────────────────────────────────────────
 * Falham dizendo o que não acharam: o que quebra uma trava destas é uma peça
 * que sumiu, e a mensagem precisa dizer qual.
 */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

/** Um parágrafo do documento, pelo id do bloco. */
const paragrafo = (id: string) => container.querySelector(`[data-bloco="${id}"]`);

const estiloDe = (id: string) => paragrafo(id)?.getAttribute('data-estilo');

/**
 * O `span` que **carrega a aparência** do trecho.
 *
 * Por `data-trecho`, e não pelo primeiro `span` que aparecer: a folha aninha
 * cada trecho num invólucro que segura a marca de quebra de linha, e "o
 * primeiro span" passou a ser o invólucro no dia da extração — o teste
 * reprovou dizendo que o título não estava em negrito quando ele estava.
 */
const pintado = (bloco: string) =>
  paragrafo(bloco)?.querySelector('[data-trecho]') as HTMLElement | null;

/** Um botão da galeria de Estilos, pelo nome. */
const naGaleria = (nome: string) =>
  [...container.querySelectorAll('.wr-estilo')].find(b => b.textContent?.trim() === nome);

const escolher = (bloco: string) => clicar(paragrafo(bloco), `parágrafo ${bloco}`);

const aplicar = (bloco: string, estilo: string) => {
  escolher(bloco);
  clicar(naGaleria(estilo), `${estilo} na galeria`);
};

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica
    || b.getAttribute('aria-label') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === nome
    && b.className.includes('wd-guia'));

const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.wd-item')].find(b => b.textContent?.trim().startsWith(texto));

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

/** Aplica os cinco estilos, que é o primeiro trecho do caminho. */
const aplicarOsEstilos = () => {
  aplicar('titulo', 'Título 1');
  for (const id of ['h-abertura', 'h-atividades', 'h-numeros', 'h-fecho']) {
    aplicar(id, 'Título 2');
  }
  aplicar('versiculo', 'Citação');
  aplicar('legenda-foto', 'Legenda');
};

/** Abre a caixa Modificar de um estilo pelo botão direito na galeria. */
const modificar = (estilo: string, tamanho: string) => {
  const botao = naGaleria(estilo);
  expect(botao, `não achei ${estilo} na galeria para o botão direito`).toBeTruthy();
  act(() => { botao!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true })); });
  clicar(itemDeMenu('Modificar'), 'Modificar…');

  const campo = container.querySelector('#wr-tamanho') as HTMLSelectElement | null;
  expect(campo, 'a caixa Modificar Estilo não abriu com o campo de tamanho').toBeTruthy();
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!
      .set!.call(campo, tamanho);
    campo!.dispatchEvent(new Event('change', { bubbles: true }));
  });
  clicar([...container.querySelectorAll('button')].find(b => b.textContent?.trim() === 'OK'), 'OK');
};

const gerarSumario = () => {
  clicar(guia('Referências'), 'a guia Referências');
  clicar(comando('Sumário'), 'o botão Sumário');
  clicar(itemDeMenu('Sumário Automático 1'), 'Sumário Automático 1');
};

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório abre por consertar', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abriu resolvida').toBe(false);
  });

  it('os títulos chegam como parágrafo comum, e mesmo assim parecem títulos', () => {
    montar();
    expect(estiloDe('titulo')).toBe('Normal');
    expect(estiloDe('h-abertura')).toBe('Normal');

    // O que os faz parecer títulos é a formatação direta desenhada no `span`.
    const escrito = pintado('titulo')!;
    expect(escrito.style.fontWeight, 'o título não chega em negrito — ele não engana ninguém')
      .toBe('700');
    expect(escrito.style.fontSize).toBe('16px');
  });

  it('gerar o sumário antes dos estilos devolve a caixa vazia do Word', () => {
    /*
      É o único sinal de que o documento bonito está quebrado, e ele precisa
      chegar pela tela — não por um aviso da plataforma escrito por cima.
    */
    montar();
    gerarSumario();
    expect(container.textContent).toContain('Nenhuma entrada de sumário foi encontrada');
  });
});

describe('o relatório pode ser vencido clicando', () => {
  it('estilos, limpar, modificar e sumário — na ordem em que se faz', () => {
    montar();
    aplicarOsEstilos();
    expect(estiloDe('titulo')).toBe('Título 1');
    expect(estiloDe('h-fecho')).toBe('Título 2');
    expect(estiloDe('versiculo')).toBe('Citação');

    /*
      Antes de limpar, o trecho está em 700 — o negrito que alguém pôs à mão.
      Depois, ele fica em 400, que é o que Título 1 diz. Não é "some": é a
      direta saindo **e** o estilo assumindo, que são as duas metades do
      requisito 6. Medir por `fontSize` não serviria aqui: o negrito à mão
      estava em 16, e Título 1 também é 16 — o título fica igualzinho, e é
      justamente isso que a lição diz ("a aparência mudou pouco").
    */
    expect(pintado('titulo')!.style.fontWeight, 'o título não estava em negrito à mão').toBe('700');

    clicar(comando('Limpar Toda a Formatação'), 'Limpar Toda a Formatação');
    const doEstilo = pintado('titulo')!;
    expect(doEstilo.style.fontWeight,
      'a formatação direta continuou vencendo o estilo depois de limpar').toBe('400');

    modificar('Título 2', '20');
    gerarSumario();

    expect(podeConcluir(), oQueFalta()).toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu, 'o botão de concluir não registrou a lição').toBe(true);
  });

  it('modificar Título 2 alcança as quatro seções de uma vez', () => {
    // O requisito 8, medido na tela: uma mexida, quatro parágrafos.
    montar();
    aplicarOsEstilos();
    clicar(comando('Limpar Toda a Formatação'), 'Limpar Toda a Formatação');
    modificar('Título 2', '24');

    const medidas = ['h-abertura', 'h-atividades', 'h-numeros', 'h-fecho']
      .map(id => (paragrafo(id) as HTMLElement).style.fontSize);
    expect(medidas).toEqual(['24px', '24px', '24px', '24px']);
  });

  it('aplicar estilo sem parágrafo escolhido avisa, em vez de aplicar no nada', () => {
    montar();
    clicar(naGaleria('Título 1'), 'Título 1 na galeria');
    expect(container.textContent).toContain('Clique primeiro num parágrafo');
    expect(estiloDe('titulo'), 'o estilo foi aplicado sem ninguém escolher onde').toBe('Normal');
  });

  it('o Cancelar da caixa Modificar não muda nada', () => {
    /*
      A caixa do Word tem Cancelar, e Cancelar que aplica é pior do que
      Cancelar nenhum: a pessoa desiste da mudança e ela acontece.
    */
    montar();
    aplicarOsEstilos();
    const antes = (paragrafo('h-abertura') as HTMLElement).style.fontSize;

    const botao = naGaleria('Título 2')!;
    act(() => { botao.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true })); });
    clicar(itemDeMenu('Modificar'), 'Modificar…');
    const campo = container.querySelector('#wr-tamanho') as HTMLSelectElement;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(campo, '24');
      campo.dispatchEvent(new Event('change', { bubbles: true }));
    });
    clicar([...container.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Cancelar'),
      'Cancelar');

    expect((paragrafo('h-abertura') as HTMLElement).style.fontSize).toBe(antes);
  });
});

describe('os dois laboratórios de Word mostram a mesma janela', () => {
  /*
    Foi por causa deste par que `word.tsx` existe, e é este par que o mantém
    honesto: ajustar a janela de um lado e não do outro daria dois "Word" para
    o mesmo programa — que é o defeito que a plataforma já teve uma vez.
  */
  const janela = () => ({
    barraDeTitulo: !!container.querySelector('.wd-titulo'),
    guias: [...container.querySelectorAll('.wd-guia')].map(b => b.textContent?.trim()),
    regua: !!container.querySelector('.wd-regua'),
    pagina: !!container.querySelector('.wd-pagina'),
    status: !!container.querySelector('.wd-status'),
    galeria: [...container.querySelectorAll('.wr-estilo, .es-estilo')].length > 0,
  });

  it('a mesma barra de título, as mesmas guias, a mesma régua e a mesma folha', () => {
    montar();
    const daVereda = janela();

    act(() => root.unmount());
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter>
          <EstilosTextoLab
            specialtyCode="AP044" lessonCode="AP044.7-L1"
            lessonTitle="Deixando o manual pronto para imprimir"
            requirementCodes={['AP044-7']}
            userId="00000000-0000-0000-0000-000000000000" />
        </MemoryRouter>,
      );
    });
    const daTrilha = janela();

    expect(daVereda.barraDeTitulo).toBe(daTrilha.barraDeTitulo);
    expect(daVereda.regua).toBe(daTrilha.regua);
    expect(daVereda.pagina).toBe(daTrilha.pagina);
    expect(daVereda.status).toBe(daTrilha.status);
    expect(daVereda.galeria).toBe(daTrilha.galeria);
    /* As guias usáveis são da lição, e não da janela — a AP044 usa Layout, esta
       não —, mas a fileira inteira é a mesma, e é ela que se compara. */
    expect(daVereda.guias).toEqual(daTrilha.guias);

    /* A guarda contra o vazio: duas janelas ausentes também são iguais. */
    expect(daVereda.barraDeTitulo).toBe(true);
    expect(daVereda.guias.length).toBeGreaterThanOrEqual(5);
  });
});
