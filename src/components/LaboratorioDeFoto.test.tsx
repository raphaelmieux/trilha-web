// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeFoto from './LaboratorioDeFoto';
import {
  IMAGENS_DO_REQUISITO_6, PORQUE_ESCRITO, TELA_E_PAPEL_ESCRITO, USOS_DE_FORMATO, fotoAjustada, fotoLimpa,
  metasDa, toquesNaGarrafa, type LicaoDaCcDg003,
} from '../labs/metasDaCcDg003';
import { caixaNaImagem, imagemDo } from '../labs/raster';
import { BARRACA } from '../labs/fotosDoClube';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As dez lições da CC-DG003, levadas até o fim pelos cliques que o
  desbravador daria. `metasDaCcDg003.test.ts` prova que cada meta pode ficar
  verde chamando o motor; esta prova que a janela chama.

  O jsdom não tem canvas: o desenho é desligado aqui, e quem confere o que se
  vê é o Chromium. A caixa da imagem mede zero, e o ponteiro chega em
  coordenada de imagem direta.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];
});

let container: HTMLDivElement;
let root: Root;

function montar(qual: LicaoDaCcDg003) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'foto', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'foto' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeFoto vereda={{ code: 'CC-DG003' } as Vereda} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
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
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};
const ponteiro = (tipo: string, x: number, y: number, shiftKey = false) => {
  const area = container.querySelector('[aria-label="Área da imagem"]');
  expect(area, 'não achei a área da imagem').toBeTruthy();
  act(() => { area!.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y, shiftKey })); });
};
const tocar = (x: number, y: number, shiftKey = false) => { ponteiro('pointerdown', x, y, shiftKey); ponteiro('pointerup', x, y); };

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const campo = (rotulo: string, valor: string | number) => escrever(porRotulo(rotulo), String(valor), rotulo);
const menu = (qual: string, comeco: string) => {
  clicar(porTexto('.ft-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.ft-menu-item', comeco), `o item ${comeco}`);
};
const ferramenta = (rotulo: string) => clicar(porRotulo(rotulo), rotulo);
const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');

const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  return casa ? Number(casa[2]) - Number(casa[1]) : -1;
};

const tamanho = (largura: number | null, ppi?: number, semReamostrar = false) => {
  menu('Imagem', 'Tamanho da imagem');
  if (semReamostrar) clicar(porRotulo('Reamostrar'), 'reamostrar');
  if (largura !== null) campo('Largura (px)', largura);
  if (ppi !== undefined) campo('Resolução (ppi)', ppi);
  clicar(botao('OK'), 'OK');
};
const exportarComo = (nome: string, formato?: string, qualidade?: number) => {
  menu('Arquivo', 'Exportar como');
  campo('Nome do arquivo', nome);
  if (formato) campo('Formato', formato);
  if (qualidade !== undefined) campo('Qualidade', qualidade);
  clicar([...container.querySelectorAll('[role="dialog"] button')].find(b => /^(Exportar|Substituir)$/.test(b.textContent ?? '')), 'exportar');
};

const nivelarERecortar = () => {
  ferramenta('Recortar (C)');
  campo('Endireitar (graus)', -3.5);
  campo('X do recorte', 80); campo('Y do recorte', 60);
  campo('Largura do recorte', 1640); campo('Altura do recorte', 1080);
  clicar(botao('Aplicar recorte'), 'aplicar recorte');
};
const ajustar = (e: number, c: number, t: number) => {
  campo('Exposição', e); campo('Contraste', c); campo('Temperatura', t);
  clicar(botao('Aplicar ajustes'), 'aplicar ajustes');
};
const tirarAGarrafa = () => {
  const toques = toquesNaGarrafa(imagemDo(fotoAjustada()));
  ferramenta('Carimbo (S)');
  campo('Raio do pincel', 26);
  clicar(botao('Definir origem'), 'definir origem');
  tocar(Math.round(toques[0].x) + 70, Math.round(toques[0].y));
  for (const p of toques) tocar(Math.round(p.x), Math.round(p.y));
};

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as dez lições da CC-DG003, pela tela', () => {
  it('módulo 1: ver o pixel, ler a cor, ampliar e explicar', () => {
    montar('pixels');
    menu('Exibir', '1600%');
    ferramenta('Conta-gotas (I)');
    tocar(50, 50);
    expect(container.textContent).toMatch(/R \d+ {2}G \d+ {2}B \d+/);
    tamanho(600);
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#por-que-borra'), PORQUE_ESCRITO, 'o porquê');
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 2: endireitar e recortar', () => {
    montar('recortar');
    nivelarERecortar();
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 3: exposição, contraste e temperatura', () => {
    montar('ajustes');
    ajustar(0.7, 30, 40);
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 4: o carimbo tira a garrafa', () => {
    montar('remover');
    tirarAGarrafa();
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 5: camada, ajuste e máscara pela seleção', () => {
    montar('camadas');
    menu('Camada', 'Duplicar camada');
    ajustar(0.8, 0, 0);
    expect(faltam()).toBe(1);
    const b = caixaNaImagem(imagemDo(fotoLimpa()), BARRACA);
    ferramenta('Varinha (W)');
    campo('Tolerância', 40);
    tocar(Math.round(b.x + b.l * 0.35), Math.round(b.y + b.a * 0.75));
    menu('Camada', 'Adicionar máscara');
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 6: varinha, excluir e exportar em PNG', () => {
    montar('transparencia');
    ferramenta('Varinha (W)');
    campo('Tolerância', 36);
    tocar(20, 20);
    for (const [x, y] of [[980, 20], [20, 780], [980, 780], [500, 760]]) tocar(x, y, true);
    menu('Editar', 'Excluir');
    expect(faltam()).toBe(1);
    exportarComo('escudo-recortado', 'png');
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 7: um arquivo de tela e um de papel', () => {
    montar('tamanhos');
    tamanho(1080);
    exportarComo('acampamento-tela');
    clicar(porRotulo('Desfazer (Ctrl+Z)'), 'desfazer');
    tamanho(null, 300, true);
    exportarComo('acampamento-impressao', 'tiff');
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#tela-e-papel'), TELA_E_PAPEL_ESCRITO, 'tela e papel');
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 8: comprimir sem perda que se veja, e o formato de cada uso', () => {
    montar('formatos');
    tamanho(1200);
    exportarComo('acampamento-web', undefined, 75);
    expect(faltam()).toBe(1);
    abrirOCaderno();
    const escolha: Record<string, string> = { site: 'jpg', emblema: 'png', grafica: 'tiff', captura: 'png' };
    for (const u of USOS_DE_FORMATO) escrever(container.querySelector(`#formato-${u.id}`), escolha[u.id], u.id);
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 9: de quem é cada imagem', () => {
    montar('direitos');
    for (const i of IMAGENS_DO_REQUISITO_6) {
      const rotulo = { propria: 'Sua', livre: 'Licença livre', protegida: 'Protegida' }[i.certa];
      const grupo = [...container.querySelectorAll('fieldset')].find(f => f.textContent?.includes(i.texto))!;
      clicar([...grupo.querySelectorAll('label')].find(l => l.textContent?.trim() === rotulo)?.querySelector('input'), i.id);
    }
    for (const f of ['Wikimedia Commons', 'Openverse']) {
      clicar([...container.querySelectorAll('label')].find(l => l.textContent?.trim() === f)?.querySelector('input'), f);
    }
    escrever(container.querySelector('#credito'), 'Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons', 'o crédito');
    expect(faltam()).toBe(0);
  }, 60000);

  it('módulo 10: a edição completa, com o antes e o depois', () => {
    montar('completa');
    nivelarERecortar();
    ajustar(0.7, 30, 40);
    tirarAGarrafa();
    expect(faltam()).toBe(2);
    menu('Exibir', 'Antes e depois');
    expect(porRotulo('Antes')).toBeTruthy();
    expect(faltam()).toBe(1);
    exportarComo('acampamento-editada');
    expect(faltam()).toBe(0);
  }, 90000);
});

describe('o que a janela não pode deixar fácil', () => {
  it('exportar com o nome da original avisa, e escreve por cima', () => {
    montar('formatos');
    tamanho(1200);
    menu('Arquivo', 'Exportar como');
    campo('Nome do arquivo', 'acampamento.jpg');
    expect(container.textContent).toContain('Exportar vai substituí-lo');
    clicar(botao('Substituir'), 'substituir');
    /* A compressão em si está certa; o que se perdeu é o original, e sem ele
       não há o antes para o examinador. Sobram essa e a do caderno. */
    expect(faltam()).toBe(2);
  }, 60000);

  it('Antes e depois só existe na lição da edição completa', () => {
    montar('ajustes');
    clicar(porTexto('.ft-menu-botao', 'Exibir'), 'exibir');
    expect(porTexto('.ft-menu-item', 'Antes e depois')).toBeUndefined();
  }, 60000);

  it('a varinha sem Shift troca a seleção em vez de somar', () => {
    montar('transparencia');
    ferramenta('Varinha (W)');
    campo('Tolerância', 36);
    tocar(20, 20);
    tocar(980, 20);
    menu('Editar', 'Excluir');
    expect(faltam()).toBe(3);
  }, 60000);

  it('o ajuste sem Aplicar só aparece, e não muda a foto', () => {
    montar('ajustes');
    campo('Exposição', 0.7); campo('Contraste', 30); campo('Temperatura', 40);
    expect(faltam()).toBe(3);
  }, 60000);
});
