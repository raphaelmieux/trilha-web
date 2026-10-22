// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { parse } from 'opentype.js';
import { EditorDeDesign, type ArquivoExportado } from './editorDeDesign';
import { achatarObjetos, umObjeto, umaPrancha, type Arte, type Caminho, type Prancha } from './design';
import { ARQUIVO_DA_FONTE } from './textoEmCurvas';
import { areaPintada } from './vetor';

/*
  As ferramentas vetoriais da janela, pelos gestos de quem desenha.

  A família de Design inteira vai abrir esta janela, e as lições de cada
  vereda têm a trava de clique delas. Esta confere o que é do **programa**: a
  caneta põe nós e curva ao arrastar, a ferramenta de nós troca o tipo e move,
  as booleanas e o agrupar agem na seleção, o texto vira curva com a fonte de
  verdade, e o arquivo exportado volta pelo menu Arquivo.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const bytes = readFileSync(`public/${ARQUIVO_DA_FONTE}`);
const FONTE = parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);

const PRANCHA: Prancha = {
  id: 'p', nome: 'Ícone', largura: 256, altura: 256, fundo: '#FFFFFF',
  objetos: [
    { id: 'a', nome: 'Quadrado A', tipo: 'retangulo', x: 20, y: 20, largura: 100, altura: 100, preenchimento: '#C13516' },
    { id: 'b', nome: 'Quadrado B', tipo: 'retangulo', x: 70, y: 20, largura: 100, altura: 100, preenchimento: '#1B4D3E' },
    { id: 't', nome: 'Nome', tipo: 'texto', texto: 'OI', x: 20, y: 160, largura: 200,
      familia: 'Space Mono', peso: 700, corpo: 40, entrelinha: 1.2, cor: '#1F2A24', alinhamento: 'esquerda' },
    { id: 'u', nome: 'Legenda', tipo: 'texto', texto: 'Clube', x: 20, y: 220, largura: 200,
      familia: 'Arial', peso: 400, corpo: 16, entrelinha: 1.4, cor: '#1F2A24', alinhamento: 'esquerda' },
  ],
};

const ARTE: Arte = { pranchas: [PRANCHA], paleta: { fundo: null, texto: null, destaque: null, apoio: null, neutro: null } };

let container: HTMLDivElement;
let root: Root;
let atual: Arte;
let exportados: ArquivoExportado[];
let vistos: string[];
let recados: string[];

function Banco({ svgs }: { svgs?: { nome: string; conteudo: string }[] }) {
  const [arte, setArte] = useState(ARTE);
  atual = arte;
  return (
    <EditorDeDesign arte={arte} mudar={setArte} pranchaInicial="p"
      aoVer={c => vistos.push(c)} aoAvisar={r => recados.push(r)}
      aoExportar={a => exportados.push(a)} svgsParaReabrir={svgs}
      carregarFonte={async () => FONTE} />
  );
}

function montar(svgs?: { nome: string; conteudo: string }[]) {
  exportados = []; vistos = []; recados = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<Banco svgs={svgs} />); });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const clicar = (alvo: Element | null | undefined, nome = '', shiftKey = false) => {
  expect(alvo, `não achei ${nome}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey })); });
};
const ponteiro = (alvo: Element | null | undefined, tipo: string, x = 0, y = 0) => {
  expect(alvo, `não achei onde ${tipo}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y })); });
};
const camada = (nome: string, somar = false) =>
  clicar([...container.querySelectorAll('.dz-lista-item')].find(b => b.textContent?.trim() === nome), `a camada ${nome}`, somar);
const menu = (qual: string, comeco: string) => {
  clicar([...container.querySelectorAll('.dz-menu-botao')].find(b => b.textContent === qual), qual);
  clicar([...container.querySelectorAll('.dz-menu-item')].find(b => b.textContent?.startsWith(comeco)), comeco);
};
const campo = (rotulo: string, valor: string) => {
  const el = porRotulo(rotulo) as HTMLInputElement;
  expect(el, `não achei ${rotulo}`).toBeTruthy();
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, valor);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => { el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
};
const tecla = (key: string, extra: KeyboardEventInit = {}) =>
  act(() => { porRotulo('Mesa de trabalho')!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });

const prancha = () => umaPrancha(atual, 'p')!;
const caminhos = () => achatarObjetos(prancha().objetos).filter((o): o is Caminho => o.tipo === 'caminho');

describe('a caneta', () => {
  it('clique põe nó de canto, arrastar põe nó suave, e clicar no primeiro fecha', () => {
    montar();
    clicar(porRotulo('Caneta (P)'), 'a caneta');
    const area = porRotulo('Área da caneta');
    ponteiro(area, 'pointerdown', 40, 200); ponteiro(area, 'pointerup', 40, 200);
    ponteiro(area, 'pointerdown', 120, 140); ponteiro(area, 'pointermove', 150, 140); ponteiro(area, 'pointerup', 150, 140);
    ponteiro(area, 'pointerdown', 200, 200); ponteiro(area, 'pointerup', 200, 200);
    ponteiro(area, 'pointerdown', 41, 201);
    const [c] = caminhos();
    expect(c).toBeDefined();
    expect(c.contornos[0].fechado).toBe(true);
    expect(c.contornos[0].nos.map(n => n.tipo)).toEqual(['canto', 'suave', 'canto']);
    expect(c.contornos[0].nos[1].saida).toEqual({ x: 150, y: 140 });
    expect(c.contornos[0].nos[1].entrada).toEqual({ x: 90, y: 140 });
    expect(c.preenchimento).not.toBeNull();
  });

  it('Enter termina aberto, e aberto nasce sem preenchimento', () => {
    montar();
    clicar(porRotulo('Caneta (P)'), 'a caneta');
    const area = porRotulo('Área da caneta');
    ponteiro(area, 'pointerdown', 40, 40); ponteiro(area, 'pointerup', 40, 40);
    ponteiro(area, 'pointerdown', 200, 40); ponteiro(area, 'pointerup', 200, 40);
    tecla('Enter');
    const [c] = caminhos();
    expect(c.contornos[0].fechado).toBe(false);
    expect(c.preenchimento).toBeNull();
    expect(c.traco).not.toBeNull();
  });
});

describe('os nós', () => {
  it('a ferramenta de nós mostra os nós, troca o tipo e move pelo campo', () => {
    montar();
    camada('Quadrado A');
    menu('Objeto', 'Converter em curvas');
    clicar(porRotulo('Editar nós (A)'), 'editar nós');
    camada('Quadrado A');
    ponteiro(porRotulo('Nó 2'), 'pointerdown', 120, 20); ponteiro(porRotulo('Nó 2'), 'pointerup', 120, 20);
    clicar([...container.querySelectorAll('button')].find(b => b.textContent === 'Suave'), 'suave');
    const no = () => (umObjeto(prancha(), 'a') as Caminho).contornos[0].nos[1];
    expect(no().tipo).toBe('suave');
    expect(no().saida).not.toBeNull();
    campo('Y do nó', '0');
    expect(no().y).toBe(0);
    /* A caixa acompanha a curva, e não só os nós: o nó suave puxa a linha
       para fora do quadrado, e a caixa sobe junto. */
    expect(umObjeto(prancha(), 'a')!.y).toBeLessThanOrEqual(0);
  });

  it('arrastar o nó o move, e o arraste é um passo só no desfazer', () => {
    montar();
    camada('Quadrado A');
    menu('Objeto', 'Converter em curvas');
    clicar(porRotulo('Editar nós (A)'), 'editar nós');
    camada('Quadrado A');
    const guias = porRotulo('Nós do caminho');
    ponteiro(porRotulo('Nó 3'), 'pointerdown', 120, 120);
    ponteiro(guias, 'pointermove', 130, 125);
    ponteiro(guias, 'pointermove', 140, 130);
    ponteiro(guias, 'pointerup', 140, 130);
    expect((umObjeto(prancha(), 'a') as Caminho).contornos[0].nos[2]).toMatchObject({ x: 140, y: 130 });
    clicar(porRotulo('Desfazer (Ctrl+Z)'), 'desfazer');
    expect((umObjeto(prancha(), 'a') as Caminho).contornos[0].nos[2]).toMatchObject({ x: 120, y: 120 });
  });
});

describe('combinar, agrupar e converter', () => {
  it('subtrair pela barra deixa o de baixo menos o de cima', () => {
    montar();
    camada('Quadrado A'); camada('Quadrado B', true);
    clicar(porRotulo('Subtrair'), 'subtrair');
    const [c] = caminhos();
    expect(c.id).toBe('a');
    expect(Math.round(areaPintada(c.contornos))).toBe(5000);
  });

  it('texto não entra em booleana, e o programa diz por quê', () => {
    montar();
    camada('Quadrado A'); camada('Nome', true);
    clicar(porRotulo('Unir'), 'unir');
    expect(recados[recados.length - 1]).toMatch(/mesmo nível/);
    expect(caminhos()).toEqual([]);
  });

  it('agrupar e desagrupar pela barra', () => {
    montar();
    camada('Quadrado A'); camada('Quadrado B', true);
    clicar(porRotulo('Agrupar (Ctrl+G)'), 'agrupar');
    const g = prancha().objetos.find(o => o.tipo === 'grupo');
    expect(g).toBeDefined();
    campo('Nome da camada', 'Os quadrados');
    expect(prancha().objetos.find(o => o.tipo === 'grupo')!.nome).toBe('Os quadrados');
    clicar(porRotulo('Desagrupar (Ctrl+Shift+G)'), 'desagrupar');
    expect(prancha().objetos.some(o => o.tipo === 'grupo')).toBe(false);
  });

  it('o texto em Space Mono vira curvas com a fonte de verdade', async () => {
    montar();
    camada('Nome');
    clicar([...container.querySelectorAll('.dz-menu-botao')].find(b => b.textContent === 'Objeto'), 'objeto');
    const item = [...container.querySelectorAll('.dz-menu-item')].find(b => b.textContent === 'Converter em curvas');
    expect(item).toBeTruthy();
    /* A conversão espera a fonte chegar: o clique e a espera vão no mesmo
       act, para o React gravar o que vem depois do await. */
    await act(async () => {
      item!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise(r => setTimeout(r, 0));
    });
    const t = umObjeto(prancha(), 't')!;
    expect(t.tipo).toBe('caminho');
    expect((t as Caminho).contornos.length).toBeGreaterThanOrEqual(3);
  });

  it('o texto em Arial não converte, e o programa diz que falta o arquivo', () => {
    montar();
    camada('Legenda');
    menu('Objeto', 'Converter em curvas');
    expect(recados[recados.length - 1]).toMatch(/arquivo da fonte Arial/);
    expect(umObjeto(prancha(), 'u')!.tipo).toBe('texto');
  });
});

describe('traço e preenchimento', () => {
  it('ligar o traço, a espessura e a extremidade', () => {
    montar();
    camada('Quadrado A');
    const caixa = [...container.querySelectorAll('label')].find(l => l.textContent?.trim() === 'Traço')!.querySelector('input');
    clicar(caixa, 'traço');
    campo('Espessura do traço', '12');
    const sel = porRotulo('Extremidade do traço') as HTMLSelectElement;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(sel, 'redonda');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const a = umObjeto(prancha(), 'a')!;
    expect(a.tipo === 'retangulo' && a.traco).toEqual({ cor: '#1F2A24', espessura: 12, extremidade: 'redonda' });
  });
});

describe('exibir', () => {
  it('o zoom e os três tamanhos avisam o que a pessoa viu', () => {
    montar();
    menu('Exibir', '800%');
    expect(vistos).toContain('zoom:8:p');
    expect(container.textContent).toContain('Zoom 800%');
    menu('Exibir', 'Ver em 64, 32 e 16 px');
    expect(vistos).toContain('tamanhos:p');
    expect(porRotulo('Ícone em 16 pixels')).toBeTruthy();
  });
});

describe('o arquivo', () => {
  it('exportar SVG entrega o texto, e PNG entrega a medida', () => {
    montar();
    menu('Arquivo', 'Exportar como SVG');
    menu('Arquivo', 'Exportar como PNG');
    expect(exportados.map(a => [a.nome, a.tipo])).toEqual([['icone.svg', 'svg'], ['icone.png', 'png']]);
    expect(exportados[0].conteudo).toContain('<rect id="a"');
    expect(exportados[1]).toMatchObject({ largura: 256, altura: 256 });
  });

  it('reabrir um SVG mexido à mão traz a mudança', () => {
    let svg = '';
    montar();
    menu('Arquivo', 'Exportar como SVG');
    svg = exportados[0].conteudo.replace('<rect id="a" data-nome="Quadrado A" x="20"', '<rect id="a" data-nome="Quadrado A" x="60"');
    act(() => root.unmount());
    container.remove();
    montar([{ nome: 'icone.svg', conteudo: svg }]);
    menu('Arquivo', 'icone.svg');
    expect(umObjeto(prancha(), 'a')!.x).toBe(60);
    expect(vistos).toContain('reabriu:icone.svg:p');
  });

  it('reabrir um SVG quebrado avisa e não mexe no desenho', () => {
    montar([{ nome: 'icone.svg', conteudo: '<svg><rect' }]);
    menu('Arquivo', 'icone.svg');
    expect(recados[recados.length - 1]).toMatch(/erro de escrita/);
    expect(prancha().objetos).toHaveLength(4);
  });

  it('sem aoExportar não há menu Arquivo', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => { root.render(<EditorDeDesign arte={ARTE} mudar={vi.fn()} pranchaInicial="p" />); });
    expect([...container.querySelectorAll('.dz-menu-botao')].map(b => b.textContent)).not.toContain('Arquivo');
  });
});
