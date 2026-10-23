// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { parse } from 'opentype.js';
import LaboratorioVetorial from './LaboratorioVetorial';
import { DIFERENCA_ESCRITA, PORQUE_ESCRITO, USOS, metasDa, type LicaoDaCcDg002 } from '../labs/metasDaCcDg002';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As nove lições da CC-DG002, levadas até o fim pelos mesmos cliques que o
  desbravador daria — a caneta posta nó a nó, o nó trocado de tipo, a lua
  subtraída, o SVG aberto no editor de texto, mudado e reaberto.

  `metasDaCcDg002.test.ts` prova que cada meta pode ficar verde chamando o
  motor; esta prova que a tela chama. "Trava de motor não é trava de tela."
*/

/* A fonte vem do disco, a mesma que a tela baixaria: o jsdom não tem rede. */
vi.mock('../labs/textoEmCurvas', async original => {
  const real = await original<typeof import('../labs/textoEmCurvas')>();
  const b = readFileSync(`public/${real.ARQUIVO_DA_FONTE}`);
  const fonte = parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
  return { ...real, carregarFonte: async () => fonte };
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-DG002' } as Vereda;

function montar(qual: LicaoDaCcDg002) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'vetorial', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'vetorial' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioVetorial vereda={VEREDA} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '', shiftKey = false) => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey })); });
};

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement | HTMLTextAreaElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const tecla = (alvo: Element | null | undefined, key: string, extra: KeyboardEventInit = {}) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

const ponteiro = (alvo: Element | null | undefined, tipo: string, x = 0, y = 0) => {
  expect(alvo, `não achei onde fazer ${tipo}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y })); });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);

const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  if (!casa) return -1;
  return Number(casa[2]) - Number(casa[1]);
};

/* ── O editor ─────────────────────────────────────────────────────────────── */

const itemDaLista = (nome: string) => [...container.querySelectorAll('.dz-esquerda .dz-lista-item')]
  .find(b => b.textContent?.trim() === nome);
const camada = (nome: string, somar = false) => clicar(itemDaLista(nome), `a camada ${nome}`, somar);
const camadas = (...nomes: string[]) => nomes.forEach((n, i) => camada(n, i > 0));
const prancha = (nome: string) => clicar(itemDaLista(nome), `a prancha ${nome}`);

const campo = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};

const menu = (qual: string, comeco: string) => {
  clicar(porTexto('.dz-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dz-menu-item', comeco), `o item ${comeco}`);
};

const caixa = (rotulo: string) =>
  clicar([...container.querySelectorAll('label')].find(l => l.textContent?.trim() === rotulo)?.querySelector('input'), rotulo);

const extremidade = (valor: string) => act(() => {
  const el = porRotulo('Extremidade do traço') as HTMLSelectElement;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, valor);
  el.dispatchEvent(new Event('change', { bubbles: true }));
});

/** Uma forma nova com a ferramenta, já no lugar e no tamanho pedidos. */
const forma = (ferramenta: string, x: number, y: number, l: number, a: number) => {
  clicar(porRotulo(ferramenta), ferramenta);
  ponteiro(container.querySelector('.dz-prancha'), 'pointerdown', x, y);
  campo('L', l); campo('A', a); campo('X', x); campo('Y', y);
};

const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as nove lições da CC-DG002, pela tela', () => {
  it('módulo 1: ampliar a 800% e classificar os usos', () => {
    montar('vetor-e-pontos');
    menu('Exibir', '800%');
    expect(faltam()).toBe(2);
    abrirOCaderno();
    for (const u of USOS) {
      const grupo = [...container.querySelectorAll('fieldset')].find(f => f.textContent?.includes(u.texto))!;
      clicar([...grupo.querySelectorAll('label')].find(l => l.textContent?.trim() === (u.certo === 'vetor' ? 'Vetor' : 'Imagem de pontos'))?.querySelector('input'), u.id);
    }
    escrever(container.querySelector('#diferenca'), DIFERENCA_ESCRITA, 'a diferença');
    expect(faltam()).toBe(0);
  });

  it('módulo 2: subtrair, intersectar e unir as formas soltas', () => {
    montar('booleanas');
    camadas('Lona da barraca', 'Porta da barraca');
    clicar(porRotulo('Subtrair'), 'subtrair');
    camadas('Lua', 'Lua — o que sai');
    clicar(porRotulo('Subtrair'), 'subtrair');
    camadas('Folha', 'Folha — a outra metade');
    clicar(porRotulo('Intersectar'), 'intersectar');
    camadas('Nuvem 1', 'Nuvem 2', 'Nuvem 3');
    clicar(porRotulo('Unir'), 'unir');
    expect(faltam()).toBe(0);
  });

  it('módulo 3: ondular a bandeira pelos nós, e desenhar a folha com a caneta', () => {
    montar('curvas');
    clicar(porRotulo('Editar nós (A)'), 'editar nós');
    camada('Bandeira');
    for (const [no, y] of [['Nó 2', 30], ['Nó 5', 130]] as const) {
      ponteiro(porRotulo(no), 'pointerdown');
      ponteiro(porRotulo('Nós do caminho'), 'pointerup');
      clicar([...container.querySelectorAll('button')].find(b => b.textContent === 'Suave'), 'suave');
      campo('Y do nó', y);
    }
    expect(faltam()).toBe(1);

    clicar(porRotulo('Caneta (P)'), 'a caneta');
    const area = () => porRotulo('Área da caneta');
    ponteiro(area(), 'pointerdown', 113, 290); ponteiro(area(), 'pointerup', 113, 290);
    ponteiro(area(), 'pointerdown', 200, 240); ponteiro(area(), 'pointermove', 255, 240); ponteiro(area(), 'pointerup', 255, 240);
    ponteiro(area(), 'pointerdown', 287, 290); ponteiro(area(), 'pointerup', 287, 290);
    ponteiro(area(), 'pointerdown', 200, 340); ponteiro(area(), 'pointermove', 145, 340); ponteiro(area(), 'pointerup', 145, 340);
    ponteiro(area(), 'pointerdown', 113, 290);
    expect(faltam()).toBe(0);
  });

  it('módulo 4: traço grosso e redondo, seta sem preenchimento, placa com contorno', () => {
    montar('traco');
    camada('Trilha');
    campo('Espessura do traço', 12); extremidade('redonda');
    camada('Seta');
    caixa('Sem preenchimento');
    campo('Espessura do traço', 12); extremidade('redonda');
    camada('Placa');
    caixa('Traço');
    campo('Espessura do traço', 8);
    expect(faltam()).toBe(0);
  });

  it('módulo 5: agrupar, nomear, alinhar pela base e distribuir', () => {
    montar('camadas');
    for (const [nome, pecas] of [['Barraca', ['Lona', 'Porta']], ['Fogueira', ['Lenha 1', 'Lenha 2', 'Chama']], ['Árvore', ['Tronco', 'Copa']]] as const) {
      camadas(...pecas);
      clicar(porRotulo('Agrupar (Ctrl+G)'), 'agrupar');
      campo('Nome da camada', nome);
    }
    expect(faltam()).toBe(2);
    camadas('Barraca', 'Fogueira', 'Árvore');
    clicar(porRotulo('Alinhar à base'), 'alinhar à base');
    clicar(porRotulo('Distribuir horizontalmente'), 'distribuir');
    expect(faltam()).toBe(0);
  });

  it('módulo 6: guardar o editável, converter em curvas e explicar', async () => {
    montar('texto-em-curvas');
    clicar(botao('Duplicar prancha'), 'duplicar');
    expect(faltam()).toBe(2);
    prancha('Assinatura do clube');
    camada('Nome do clube');
    clicar(porTexto('.dz-menu-botao', 'Objeto'), 'objeto');
    const converter = porTexto('.dz-menu-item', 'Converter em curvas');
    await act(async () => {
      converter!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 0));
    });
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#porque-converter'), PORQUE_ESCRITO, 'o porquê');
    expect(faltam()).toBe(0);
  });

  it('módulo 7: reproduzir o logotipo a 80%, com o anel subtraído', () => {
    montar('logotipo');
    forma('Elipse (E)', 236, 216, 128, 128);
    forma('Elipse (E)', 256, 236, 88, 88);
    const elipses = [...container.querySelectorAll('.dz-esquerda .dz-lista-item')].filter(b => b.textContent?.trim() === 'Elipse');
    clicar(elipses[0], 'a primeira elipse');
    clicar(elipses[1], 'a segunda elipse', true);
    clicar(porRotulo('Subtrair'), 'subtrair');
    forma('Triângulo', 264, 248, 72, 64);
    forma('Retângulo (R)', 228, 332, 144, 14.4);
    expect(faltam()).toBe(0);
  });

  it('módulo 8: um ícone legível em 16, visto nos três tamanhos', () => {
    montar('icone');
    forma('Elipse (E)', 24, 24, 208, 208);
    forma('Triângulo', 60, 64, 136, 116);
    forma('Retângulo (R)', 48, 180, 160, 20);
    expect(faltam()).toBe(1);
    menu('Exibir', 'Ver em 64, 32 e 16 px');
    expect(faltam()).toBe(0);
  });

  it('módulo 9: exportar, mudar uma coordenada no editor de texto, e reabrir', () => {
    montar('svg');
    menu('Arquivo', 'Exportar como SVG');
    menu('Arquivo', 'Exportar como PNG');
    expect(faltam()).toBe(2);
    clicar(porTexto('.bn-tarefa', 'Editor de texto'), 'o editor de texto');
    clicar(porTexto('.bn-menu', 'Arquivo'), 'o menu do editor de texto');
    clicar(porTexto('.bn-item', 'Abrir'), 'abrir');
    clicar(porTexto('.bn-item', 'meu-icone.svg'), 'o arquivo');
    const texto = porRotulo('Conteúdo de meu-icone.svg') as HTMLTextAreaElement;
    expect(texto.value).toContain('data-nome="Chão" x="48" y="180"');
    escrever(texto, texto.value.replace('data-nome="Chão" x="48" y="180"', 'data-nome="Chão" x="48" y="200"'), 'o SVG');
    expect(container.textContent).toContain('Não salvo');
    tecla(texto, 's', { ctrlKey: true });
    expect(faltam()).toBe(1);
    clicar(porTexto('.bn-tarefa', 'Editor de design'), 'o editor de design');
    menu('Arquivo', 'meu-icone.svg');
    expect(faltam()).toBe(0);
  });
});

describe('o que a tela não pode deixar fácil', () => {
  it('no módulo 6, converter a cópia em vez da original não fecha', async () => {
    montar('texto-em-curvas');
    clicar(botao('Duplicar prancha'), 'duplicar');
    camada('Nome do clube');
    clicar(porTexto('.dz-menu-botao', 'Objeto'), 'objeto');
    const converter = porTexto('.dz-menu-item', 'Converter em curvas');
    await act(async () => {
      converter!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 0));
    });
    expect(faltam()).toBe(3);
  });

  it('no módulo 9, salvar sem mexer não conta, e o editor de texto diz que está salvo', () => {
    montar('svg');
    menu('Arquivo', 'Exportar como SVG');
    clicar(porTexto('.bn-tarefa', 'Editor de texto'), 'o editor de texto');
    clicar(porTexto('.bn-menu', 'Arquivo'), 'o menu');
    clicar(porTexto('.bn-item', 'Abrir'), 'abrir');
    clicar(porTexto('.bn-item', 'meu-icone.svg'), 'o arquivo');
    expect(container.textContent).toContain('Salvo');
    tecla(porRotulo('Conteúdo de meu-icone.svg'), 's', { ctrlKey: true });
    // O PNG não foi exportado, e o SVG salvo sem mudança não é coordenada mexida.
    expect(faltam()).toBe(3);
  });

  it('no módulo 2, subtrair na ordem da seleção não troca quem perde o pedaço', () => {
    montar('booleanas');
    camadas('Porta da barraca', 'Lona da barraca');
    clicar(porRotulo('Subtrair'), 'subtrair');
    expect(faltam()).toBe(3);
  });
});
