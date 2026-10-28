// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { GUIAS_DO_WORD } from './word';
import FormatacaoTextoLab from './FormatacaoTextoLab';
import { colarDaArea, copiar, porCursor, tecla } from './tecladoDaFolha';
import { NOME_DO_LIVRO } from './metasDaAp042';

/*
  O que a imitação do Word não pode perder ao ser mexida.

  1. Margem, orientação e tamanho do papel moram na guia Layout, e não em
     Início. Metade do requisito 3 é *onde fica*: um painel próprio, fora da
     faixa, ensinaria a procurar no lugar errado.

  2. O documento se edita com cursor: os botões valem para a seleção, e os
     atalhos são os do Word em português. A trava que clica leva as sete
     tarefas até o fim pelos mesmos gestos que o desbravador faria — trava de
     motor não é trava de tela.
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
  lessonTitle: 'Formatando um documento inteiro',
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
const clicar = (el: Element | null) => {
  if (!el) throw new Error('não achei o que clicar');
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const clicarGuia = (nome: string) =>
  clicar([...container.querySelectorAll('[role="tab"]')].find(x => x.textContent === nome)!);
const opcao = (texto: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="option"], [role="menuitemradio"]')]
    .find(o => o.textContent?.trim().startsWith(texto)) ?? null;
const paragrafo = (id: string) => container.querySelector<HTMLElement>(`p[data-bloco="${id}"]`)!;
const tarefaFeita = (titulo: string) => {
  const t = [...container.querySelectorAll<HTMLElement>('[data-tarefa]')]
    .find(x => x.textContent?.includes(titulo));
  return t?.dataset.feita === 'sim';
};

describe('a faixa de opções', () => {
  it('traz todas as guias, e Início e Layout com a faixa do laboratório', () => {
    const guias = [...container.querySelectorAll('[role="tab"]')].map(g => g.textContent);
    expect(guias).toEqual([...GUIAS_DO_WORD]);
    clicarGuia('Design');
    expect(container.querySelector('.of-faixa-padrao'), 'Design não abriu a faixa do Word').not.toBeNull();
    clicarGuia('Layout');
    expect(container.querySelector('.of-faixa-padrao'), 'Layout ficou com a faixa padrão por cima da do laboratório').toBeNull();
  });

  it('deixa margem, orientação e tamanho do papel só na guia Layout', () => {
    expect(porTitulo('Margens'), 'Margens não deve estar em Início').toBeNull();
    clicarGuia('Layout');
    for (const botao of ['Margens', 'Orientação', 'Tamanho']) {
      expect(porTitulo(botao), botao).not.toBeNull();
    }
  });

  /* Um menu que se fechava no próprio clique que o abria — o clique subia
     até a janela, que fechava menus. */
  it('abre o menu de Margens e o deixa aberto', () => {
    clicarGuia('Layout');
    clicar(porTitulo('Margens'));
    expect(document.querySelector('.wd-lista-suspensa'), 'o menu deveria estar aberto').not.toBeNull();
    expect(document.body.textContent).toContain('2,5 cm em todos os lados');
  });

  it('vira a folha de verdade ao trocar a orientação', () => {
    const pagina = () => container.querySelector<HTMLElement>('.wd-pagina')!;
    expect(pagina().style.getPropertyValue('--largura-cm')).toBe('27.94');
    clicarGuia('Layout');
    clicar(porTitulo('Orientação'));
    clicar(opcao('Retrato'));
    expect(pagina().style.getPropertyValue('--largura-cm')).toBe('21.59');
  });
});

describe('a folha se edita com cursor', () => {
  it('não há parágrafo escolhido: o negrito vale para a seleção', () => {
    porCursor(container, 'p2', 0, { bloco: 'p2', offset: 'fim' });
    tecla(container, 'n', { ctrl: true });
    const pedacos = [...paragrafo('p2').querySelectorAll<HTMLElement>('[data-trecho]')];
    expect(pedacos.every(x => x.style.fontWeight === '700' || x.textContent === '')).toBe(true);
    expect(paragrafo('titulo').querySelector<HTMLElement>('[data-trecho]')!.style.fontWeight).not.toBe('700');
  });

  it('centraliza o parágrafo do cursor com Ctrl+E', () => {
    porCursor(container, 'titulo', 4);
    tecla(container, 'e', { ctrl: true });
    expect(paragrafo('titulo').style.textAlign).toBe('center');
  });
});

describe('as sete tarefas, pelos gestos de verdade', () => {
  it('fecham todas, e o documento pode ser entregue', () => {
    /* A folha. */
    clicarGuia('Layout');
    clicar(porTitulo('Tamanho')); clicar(opcao('A4'));
    clicar(porTitulo('Orientação')); clicar(opcao('Retrato'));
    clicar(porTitulo('Margens')); clicar(opcao('Normal'));
    expect(tarefaFeita('Acertar a folha')).toBe(true);
    clicarGuia('Início');

    /* Copiar a primeira linha e colar depois da data. */
    porCursor(container, 'clube', 0, { bloco: 'clube', offset: 'fim' });
    copiar(container);
    porCursor(container, 'ass', 'fim');
    tecla(container, 'Enter');
    colarDaArea(container);
    expect(tarefaFeita('Copiar e colar')).toBe(true);

    /* Fonte, tamanho e negrito do título. */
    porCursor(container, 'titulo', 0, { bloco: 'titulo', offset: 'fim' });
    clicar(container.querySelector('[aria-label="Fonte"]'));
    clicar(opcao('Georgia'));
    clicar(container.querySelector('[aria-label="Tamanhos"]'));
    clicar(opcao('20'));
    expect(tarefaFeita('Trocar a fonte e o tamanho')).toBe(true);
    tecla(container, 'n', { ctrl: true });

    /* Só o nome do livro em itálico; a data sublinhada. */
    const p2 = paragrafo('p2').textContent!;
    const k = p2.indexOf(NOME_DO_LIVRO);
    porCursor(container, 'p2', k, { bloco: 'p2', offset: k + NOME_DO_LIVRO.length });
    tecla(container, 'i', { ctrl: true });
    porCursor(container, 'ass', 0, { bloco: 'ass', offset: 'fim' });
    tecla(container, 's', { ctrl: true });
    expect(tarefaFeita('Usar negrito, itálico e sublinhado')).toBe(true);

    /* Alinhar e espaçar. */
    porCursor(container, 'titulo', 3);
    tecla(container, 'e', { ctrl: true });
    porCursor(container, 'p1', 0, { bloco: 'p2', offset: 'fim' });
    tecla(container, 'j', { ctrl: true });
    clicar(porTitulo('Espaçamento de Linha e Parágrafo'));
    clicar(opcao('1,5'));
    porCursor(container, 'ass', 2);
    tecla(container, 'g', { ctrl: true });
    expect(tarefaFeita('Alinhar cada parte')).toBe(true);
    expect(tarefaFeita('Ajustar o espaçamento')).toBe(true);

    /* As listas. */
    porCursor(container, 'm1', 0, { bloco: 'm3', offset: 'fim' });
    clicar(porTitulo('Marcadores'));
    porCursor(container, 's1', 0, { bloco: 's3', offset: 'fim' });
    clicar(porTitulo('Numeração'));
    expect(paragrafo('s3').dataset.marcador).toBe('3.');
    expect(tarefaFeita('Usar marcadores e numeração')).toBe(true);

    const entregar = [...container.querySelectorAll('button')].find(b => b.textContent === 'Entregar o documento');
    expect(entregar, 'o documento devia poder ser entregue').toBeTruthy();
  });
});
