// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeIdentidade from './LaboratorioDeIdentidade';
import {
  CONCEITO_ESCRITO, DEFESA_ESCRITA, DESCARTE_CONTADO, MINIMO_DECLARADO, POR_QUE_UMA_COR, RASCUNHOS_FEITOS,
  metasDa, type LicaoDaCcDg004,
} from '../labs/metasDaCcDg004';
import { CREME, MARROM, NOME_DA_MARCA, ROXO, TINTA, VERDE } from '../labs/identidadeDoClube';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As nove lições da CC-DG004, levadas até o fim pelos cliques que o
  desbravador daria — o símbolo desenhado forma a forma, a assinatura
  copiada de uma prancha e colada nas peças, a versão negativa recolorida, o
  manual montado página por página e estragado de propósito na última.

  `metasDaCcDg004.test.ts` prova que cada meta pode ficar verde chamando o
  motor; esta prova que a tela chama. "Trava de motor não é trava de tela."
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(qual: LicaoDaCcDg004) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'identidade', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'identidade' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeIdentidade vereda={{ code: 'CC-DG004' } as Vereda} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
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
    const el = campo as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};
const tecla = (alvo: Element | null | undefined, key: string, extra: KeyboardEventInit = {}) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};
const sair = (alvo: Element | null | undefined) => act(() => { alvo!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); });
const ponteiro = (alvo: Element | null | undefined, tipo: string, x = 0, y = 0) => {
  expect(alvo, `não achei onde fazer ${tipo}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y })); });
};

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porTexto = (seletor: string, comeco: string, raiz: ParentNode = container) =>
  [...raiz.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  return casa ? Number(casa[2]) - Number(casa[1]) : -1;
};

/* ── O editor ─────────────────────────────────────────────────────────────── */

const secoes = () => container.querySelectorAll('.dz-esquerda .dz-secao');
const prancha = (nome: string) => clicar(
  [...secoes()[0].querySelectorAll('.dz-lista-item')].find(b => b.textContent?.trim() === nome), `a prancha ${nome}`);
/** A camada mais de cima com esse nome — a lista mostra a pilha de cima para baixo. */
const camada = (nome: string, somar = false) => clicar(
  [...secoes()[1].querySelectorAll('.dz-lista-item')].find(b => b.textContent?.trim() === nome), `a camada ${nome}`, somar);
const campo = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};
const menu = (qual: string, comeco: string) => {
  clicar(porTexto('.dz-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dz-menu-item', comeco), `o item ${comeco}`);
};
const forma = (ferramenta: string, x: number, y: number, l: number, a: number, cor: string) => {
  clicar(porRotulo(ferramenta), ferramenta);
  ponteiro(container.querySelector('.dz-prancha'), 'pointerdown', x, y);
  campo('L', l); campo('A', a); campo('X', x); campo('Y', y);
  campo('Preenchimento', cor);
};
const texto = (x: number, y: number, conteudo: string) => {
  clicar(porRotulo('Texto (T)'), 'texto');
  ponteiro(container.querySelector('.dz-prancha'), 'pointerdown', x, y);
  escrever(porRotulo('Conteúdo do texto'), conteudo, 'conteúdo');
  sair(porRotulo('Conteúdo do texto'));
};
const copiarAssinatura = () => {
  prancha('Assinatura');
  camada('Assinatura');
  menu('Editar', 'Copiar');
};
/** Colar a assinatura copiada, na largura e no canto pedidos — e numa cor, se for o caso. */
const colar = (l: number, x: number, y: number, cor?: string) => {
  menu('Editar', 'Colar');
  campo('L', l); campo('X', x); campo('Y', y);
  if (cor) campo('Recolorir tudo', cor);
};
const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');
const voltarAoEditor = () => clicar(botao('Voltar ao editor'), 'voltar ao editor');

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as nove lições da CC-DG004, pela tela', () => {
  it('módulo 1: o conceito', () => {
    montar('conceito');
    escrever(container.querySelector('#o-que-comunica'), CONCEITO_ESCRITO.oQueComunica, 'o que comunica');
    escrever(container.querySelector('#a-quem'), CONCEITO_ESCRITO.aQuem, 'a quem');
    CONCEITO_ESCRITO.palavras.forEach((p, i) => escrever(porRotulo(`Palavra ${i + 1}`), p, `palavra ${i + 1}`));
    expect(faltam()).toBe(0);
  });

  it('módulo 2: os dez rascunhos', () => {
    montar('rascunhos');
    RASCUNHOS_FEITOS.forEach((r, i) => escrever(container.querySelector(`#ideia-${i}`), r.ideia, `ideia ${i}`));
    clicar(container.querySelectorAll('input[name="escolhido"]')[0], 'seguir com o primeiro');
    RASCUNHOS_FEITOS.forEach((r, i) => { if (i > 0) escrever(container.querySelector(`#porque-nao-${i}`), r.porQueNao, `motivo ${i}`); });
    expect(faltam()).toBe(0);
  });

  it('módulo 3: o símbolo e a assinatura', () => {
    montar('simbolo');
    forma('Elipse (E)', 40, 130, 120, 100, ROXO);
    forma('Retângulo (R)', 92, 220, 16, 50, MARROM);
    expect(faltam()).toBe(2);
    texto(180, 160, NOME_DA_MARCA);
    camada('Elipse'); camada('Retângulo', true); camada('Texto', true);
    clicar(porRotulo('Agrupar (Ctrl+G)'), 'agrupar');
    menu('Exibir', 'Ver em 64, 32 e 16 px');
    expect(faltam()).toBe(0);
  });

  it('módulo 4: as versões em pranchas próprias', () => {
    montar('versoes');
    clicar(botao('Duplicar prancha'), 'duplicar');
    camada('Assinatura');
    campo('Recolorir tudo', '#000000');
    expect(faltam()).toBe(2);
    prancha('Assinatura');
    clicar(botao('Duplicar prancha'), 'duplicar de novo');
    campo('Fundo da prancha', VERDE);
    camada('Assinatura');
    campo('Recolorir tudo', '#FFFFFF');
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#porque-uma-cor'), POR_QUE_UMA_COR, 'por que uma cor');
    expect(faltam()).toBe(0);
  });

  it('módulo 5: paleta e tipografia', () => {
    montar('paleta');
    clicar(porTexto('.dz-aba', 'Cores'), 'a aba de cores');
    campo('Fundo (hexadecimal)', CREME);
    campo('Texto (hexadecimal)', TINTA);
    campo('Destaque (hexadecimal)', ROXO);
    campo('Apoio (hexadecimal)', VERDE);
    campo('Neutro (hexadecimal)', MARROM);
    expect(faltam()).toBe(1);
    clicar(porTexto('.dz-aba', 'Propriedades'), 'a aba de propriedades');
    prancha('Tipografia');
    texto(40, 40, 'Unidade Ipê');
    escrever(porRotulo('Família'), 'Trebuchet MS', 'família');
    campo('Corpo', 32);
    texto(40, 120, 'O texto corrido do manual e dos avisos da unidade sai nesta letra, boa de ler pequena.');
    escrever(porRotulo('Família'), 'Georgia', 'família');
    campo('Corpo', 14);
    expect(faltam()).toBe(0);
  });

  it('módulo 6: proteção e tamanho mínimo', () => {
    montar('protecao');
    abrirOCaderno();
    escrever(container.querySelector('#protecao'), '0,5', 'proteção');
    escrever(container.querySelector('#minimo'), String(MINIMO_DECLARADO), 'mínimo');
    expect(faltam()).toBe(1);
    voltarAoEditor();
    copiarAssinatura();
    prancha('Tamanho mínimo');
    colar(MINIMO_DECLARADO, 180, 180);
    expect(faltam()).toBe(0);
  });

  it('módulo 7: camiseta, crachá e post', () => {
    montar('aplicacoes');
    copiarAssinatura();
    prancha('Camiseta');
    colar(150, 80, 120, '#FFFFFF');
    prancha('Crachá');
    colar(105, 67, 26);
    prancha('Post');
    colar(180, 60, 60, '#FFFFFF');
    expect(faltam()).toBe(0);
  });

  it('módulo 8: o manual de quatro páginas, com três usos incorretos', () => {
    montar('manual');
    copiarAssinatura();

    prancha('Manual — 1');
    colar(150, 40, 60);
    colar(150, 230, 60, '#000000');
    forma('Retângulo (R)', 0, 240, 420, 160, VERDE);
    colar(150, 135, 280, '#FFFFFF');

    const pagina = (nome: string) => {
      clicar(botao('Nova prancha'), 'nova prancha');
      campo('Nome da prancha', nome);
    };
    pagina('Manual — Cores');
    [CREME, TINTA, ROXO, VERDE, MARROM].forEach((cor, i) => forma('Retângulo (R)', 20 + i * 78, 420, 64, 64, cor));
    pagina('Manual — Proteção');
    colar(200, 110, 200);
    // Três páginas, e nenhum uso incorreto: faltam a quarta e os três.
    expect(faltam()).toBe(2);

    pagina('Manual — Incorretos');
    colar(120, 40, 60, '#B03A2E');
    forma('Retângulo (R)', 0, 200, 420, 160, '#2B2B2B');
    colar(120, 150, 250);
    colar(120, 40, 420);
    camada('Logotipo');
    escrever(porRotulo('Família'), 'Comic Sans MS', 'família');
    expect(faltam()).toBe(0);
  });

  it('módulo 9: a defesa', () => {
    montar('defesa');
    escrever(container.querySelector('#defesa'), DEFESA_ESCRITA, 'defesa');
    escrever(container.querySelector('#descarte'), String(DESCARTE_CONTADO.indice), 'descarte');
    escrever(porRotulo('O que o descarte ensinou'), DESCARTE_CONTADO.texto, 'o que ensinou');
    expect(faltam()).toBe(0);
  });
});

describe('o que o editor ganhou para esta vereda', () => {
  it('colar sem ter copiado avisa, e não cola nada', () => {
    montar('aplicacoes');
    prancha('Camiseta');
    menu('Editar', 'Colar');
    expect(container.textContent).toContain('Nada copiado ainda.');
    expect([...secoes()[1].querySelectorAll('.dz-lista-item')].some(b => b.textContent?.trim() === 'Assinatura')).toBe(false);
  });

  it('a largura do grupo leva a altura junto', () => {
    montar('aplicacoes');
    prancha('Assinatura');
    camada('Assinatura');
    const antes = Number((porRotulo('A') as HTMLInputElement).value);
    campo('L', 150);
    expect(Number((porRotulo('A') as HTMLInputElement).value)).toBeCloseTo(antes / 2, 1);
  });

  it('colar na mesma prancha desloca a cópia, para ela não sumir em cima da original', () => {
    montar('aplicacoes');
    prancha('Assinatura');
    camada('Assinatura');
    const x = Number((porRotulo('X') as HTMLInputElement).value);
    tecla(container.querySelector('.dz-janela'), 'd', { ctrlKey: true });
    expect(Number((porRotulo('X') as HTMLInputElement).value)).toBe(x + 12);
  });

  it('o caderno e a defesa são tela da plataforma: nenhum programa à vista', () => {
    montar('defesa');
    expect(container.querySelector('.dz-janela')).toBeNull();
    expect(botao('Abrir o caderno')).toBeUndefined();
  });
});
