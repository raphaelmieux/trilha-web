// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeDiagramacao from './LaboratorioDeDiagramacao';
import {
  DESCRICAO_DO_ARQUIVO, EXIGENCIAS, POR_QUE_RGB, RELATO_DA_PROVA, metasDa, type LicaoDaCcDg005,
} from '../labs/metasDaCcDg005';
import { HISTORIA_COMO_CHEGOU, MALHA_FEITA, CORES_DO_BOLETIM } from '../labs/boletimDoClube';
import { foraDaGama } from '../labs/design';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As sete lições da CC-DG005, levadas até o fim pelos cliques que o
  desbravador daria — a malha no diálogo, a matéria limpa parágrafo por
  parágrafo, as fotos levadas às guias, o quadro novo que recebe o texto
  excedente, a página-mestre, o PDF da gráfica e a prova de cores.

  `metasDaCcDg005.test.ts` prova que cada meta pode ficar verde chamando o
  motor; esta prova que a janela chama.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(qual: LicaoDaCcDg005) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'diagramacao', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'diagramacao' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeDiagramacao vereda={{ code: 'CC-DG005' } as Vereda} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};
const tecla = (alvo: Element | null | undefined, key: string) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
};
const ponteiro = (alvo: Element | null | undefined, x = 0, y = 0) => {
  expect(alvo, 'não achei onde apertar').toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: x, clientY: y })); });
};

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  return casa ? Number(casa[2]) - Number(casa[1]) : -1;
};

const campo = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};
const menu = (qual: string, comeco: string) => {
  clicar(porTexto('.dg-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dg-menu-item', comeco), `o item ${comeco}`);
};
const ok = (rotulo = 'OK') => clicar([...container.querySelectorAll('[role="dialog"] button')].find(b => b.textContent?.trim() === rotulo), rotulo);
const pagina = (n: number) => clicar(porTexto('.dg-pagina-botao', `Página ${n}`), `a página ${n}`);
const posicionar = (x: number, y: number, largura: number, altura: number) => {
  campo('X (mm)', x); campo('Y (mm)', y); campo('Largura (mm)', largura); campo('Altura (mm)', altura);
};
const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as sete lições da CC-DG005, pela tela', () => {
  it('módulo 1: margens, colunas e sangria', () => {
    montar('malha');
    menu('Layout', 'Margens e colunas');
    const m = MALHA_FEITA.margens;
    campo('Margem de cima (mm)', m.topo); campo('Margem de baixo (mm)', m.base);
    campo('Margem interna (mm)', m.interna); campo('Margem externa (mm)', m.externa);
    campo('Colunas', MALHA_FEITA.colunas); campo('Medianiz (mm)', MALHA_FEITA.medianiz);
    ok();
    expect(faltam()).toBe(1);
    menu('Arquivo', 'Configurar documento');
    campo('Sangria (mm)', 3);
    ok();
    expect(faltam()).toBe(0);
  });

  it('módulo 2: a matéria limpa, um estilo por papel', () => {
    montar('estilos');
    menu('Texto', 'Editar matéria');
    HISTORIA_COMO_CHEGOU.forEach((p, i) => {
      if (p.direta) clicar(porRotulo(`Limpar formatação do parágrafo ${i + 1}`), `limpar ${i + 1}`);
    });
    expect(faltam()).toBe(1);
    HISTORIA_COMO_CHEGOU.forEach((p, i) => {
      if (p.papel === 'titulo' && p.estilo !== 'titulo') escrever(porRotulo(`Estilo do parágrafo ${i + 1}`), 'titulo', `estilo ${i + 1}`);
    });
    expect(faltam()).toBe(0);
  });

  it('módulo 3: as fotos na malha, a capa sangrando, e o quadro que recebe o excedente', () => {
    montar('imagens');
    ponteiro(porRotulo('Imagem capa-cachoeira.jpg'));
    posicionar(-3, -3, 154, 216);
    expect(faltam()).toBe(3);
    pagina(2);
    ponteiro(porRotulo('Imagem fogueira.jpg'));
    posicionar(13, 23, 119, 79.3);
    pagina(3);
    ponteiro(porRotulo('Imagem unidade-ipe-whatsapp.jpg'));
    posicionar(16, 23, 57, 42.75);
    expect(container.textContent).toMatch(/Texto excedente: \d+ linhas/);
    expect(faltam()).toBe(1);
    pagina(4);
    clicar(porRotulo('Quadro de texto (T)'), 'quadro de texto');
    ponteiro(porRotulo('Página 4'), 75, 23);
    posicionar(75, 23, 57, 169);
    expect(container.textContent).toContain('Sem texto excedente');
    expect(faltam()).toBe(0);
  });

  it('módulo 4: número e cabeçalho pela página-mestre, e a capa sem ela', () => {
    montar('paginas');
    menu('Páginas', 'Página-mestre A');
    clicar(porRotulo('Número de página automático'), 'número automático');
    escrever(porRotulo('Cabeçalho corrente'), 'Boletim de Inverno', 'cabeçalho');
    ok();
    expect(faltam()).toBe(2);
    for (const n of [2, 3, 4]) {
      pagina(n);
      ponteiro([...container.querySelectorAll('.dg-solto')].find(s => s.textContent?.trim() === String(n)));
      menu('Editar', 'Excluir');
    }
    expect(faltam()).toBe(1);
    escrever(porRotulo('Mestre da página 1'), 'nenhuma', 'mestre da capa');
    expect(faltam()).toBe(0);
  });

  it('módulo 5: o PDF da gráfica', () => {
    montar('exportar');
    menu('Arquivo', 'Exportar PDF');
    campo('Sangria no PDF (mm)', 3);
    clicar(porRotulo('Marcas de corte'), 'marcas de corte');
    escrever(porRotulo('Cor'), 'cmyk', 'cor');
    ok('Exportar');
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#porque-rgb'), POR_QUE_RGB, 'por que RGB');
    expect(faltam()).toBe(0);
  });

  it('módulo 6: a tabela da gráfica', () => {
    montar('grafica');
    for (const e of EXIGENCIAS.filter(x => x.pede)) {
      clicar([...container.querySelectorAll('label')].find(l => l.textContent?.trim() === e.texto)?.querySelector('input'), e.id);
    }
    escrever(porRotulo('Papel da capa'), '250', 'capa');
    escrever(porRotulo('Papel do miolo'), '90', 'miolo');
    escrever(container.querySelector('#descricao'), DESCRICAO_DO_ARQUIVO, 'descrição');
    expect(faltam()).toBe(0);
  });

  it('módulo 7: a prova de cores', () => {
    montar('prova');
    menu('Exibir', 'Prova de cores');
    expect(faltam()).toBe(2);
    abrirOCaderno();
    for (const cor of CORES_DO_BOLETIM.filter(foraDaGama)) {
      clicar([...container.querySelectorAll('label')].find(l => l.textContent?.trim().endsWith(cor))?.querySelector('input'), cor);
    }
    escrever(container.querySelector('#relato'), RELATO_DA_PROVA, 'relato');
    expect(faltam()).toBe(0);
  });
});

describe('o que a janela não pode deixar fácil', () => {
  it('Exportar PDF só existe na lição que exporta', () => {
    montar('paginas');
    clicar(porTexto('.dg-menu-botao', 'Arquivo'), 'arquivo');
    expect(porTexto('.dg-menu-item', 'Exportar PDF')).toBeUndefined();
  });

  it('a foto grande demais mostra o ppi em vermelho', () => {
    montar('imagens');
    pagina(3);
    expect(container.querySelector('.dg-imagem-ppi[data-baixo="true"]')).toBeTruthy();
  });

  it('o PDF com as opções padrão não serve à gráfica', () => {
    montar('exportar');
    menu('Arquivo', 'Exportar PDF');
    ok('Exportar');
    expect(faltam()).toBe(4);
  });

  it('o "+" do estilo aparece no parágrafo mexido à mão', () => {
    montar('estilos');
    menu('Texto', 'Editar matéria');
    expect(container.textContent).toContain('Corpo+');
  });
});
