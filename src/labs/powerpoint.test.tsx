// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FolhaDoSlide, TiraDeSlides } from './powerpoint';
import { mestreDoModelo, nivelDoTopico, slideNovo, type Slide } from './apresentacao';

/*
  O corpo do slide se escreve no próprio slide.

  Ele era um campo à parte embaixo do palco, e o PowerPoint não tem campo à
  parte: tem o espaço reservado, com o marcador na frente de cada linha. A
  lista editável erra calado de dois jeitos, e os dois estão aqui — reescrever
  o DOM a cada tecla (o cursor pula para o começo) e aparar a linha nova antes
  de ela receber texto (o Enter parece não funcionar).
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let gravados: string[][] = [];
let trocarDeFora: (t: string[]) => void = () => {};

function Palco({ inicial }: { inicial: string[] }) {
  const [slide, setSlide] = useState<Slide>({ ...slideNovo('s1', 'titulo-conteudo'), titulo: 'Programação', topicos: inicial });
  trocarDeFora = t => setSlide(s => ({ ...s, topicos: t }));
  return (
    <FolhaDoSlide slide={slide} mestre={mestreDoModelo('branco')}
      rotuloDoCorpo="Texto do slide 1"
      aoEscreverNoCorpo={t => { gravados.push(t); setSlide(s => ({ ...s, topicos: t })); }} />
  );
}

const montar = (inicial: string[]) => {
  act(() => { root.render(<Palco inicial={inicial} />); });
};
const corpo = () => container.querySelector<HTMLElement>('[aria-label="Texto do slide 1"]')!;
const itens = () => [...corpo().querySelectorAll('li')].map(li => li.textContent);
const digitar = () => act(() => { corpo().dispatchEvent(new Event('input', { bubbles: true })); });

beforeEach(() => {
  gravados = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('o corpo do slide é o espaço reservado, e não um campo à parte', () => {
  it('é uma lista editável dentro do slide, um item por tópico', () => {
    montar(['Saída às 19h', 'Chegada às 22h']);
    expect(corpo().closest('.pp-slide'), 'o corpo saiu do slide').not.toBeNull();
    expect(corpo().getAttribute('contenteditable')).toBe('true');
    expect(itens()).toEqual(['Saída às 19h', 'Chegada às 22h']);
  });

  it('o que se digita vira os tópicos', () => {
    montar(['Saída às 19h']);
    act(() => { corpo().querySelector('li')!.textContent = 'Saída às 18h'; });
    digitar();
    expect(gravados[gravados.length - 1]).toEqual(['Saída às 18h']);
  });

  it('o Enter no último tópico abre uma linha que fica, mesmo vazia', () => {
    montar(['Saída às 19h']);
    act(() => {
      const li = document.createElement('li');
      li.appendChild(document.createElement('br'));
      corpo().appendChild(li);
    });
    digitar();
    expect(gravados[gravados.length - 1], 'a linha vazia do fim não é tópico').toEqual(['Saída às 19h']);
    expect(itens(), 'a linha recém-aberta sumiu debaixo do cursor').toHaveLength(2);
  });

  it('apagar tudo e digitar devolve o marcador', () => {
    montar(['Saída às 19h']);
    act(() => { corpo().replaceChildren(document.createTextNode('Levar lanterna')); });
    digitar();
    expect(itens()).toEqual(['Levar lanterna']);
    expect(gravados[gravados.length - 1]).toEqual(['Levar lanterna']);
  });

  it('uma mudança vinda de fora (desfazer, outro comando) reescreve a lista', () => {
    montar(['Saída às 19h']);
    act(() => { trocarDeFora(['Um', 'Dois']); });
    expect(itens()).toEqual(['Um', 'Dois']);
  });

  it('vazio, mostra o convite do espaço reservado', () => {
    montar([]);
    expect(corpo().dataset.vazio).toBe('sim');
    expect(itens()).toHaveLength(1);
  });

  it('na miniatura da tira não se escreve nada', () => {
    act(() => {
      root.render(
        <FolhaDoSlide slide={{ ...slideNovo('s1', 'titulo-conteudo'), topicos: ['Um'] }} mestre={mestreDoModelo('branco')}
          mini aoEscreverNoCorpo={() => {}} rotuloDoCorpo="Texto do slide 1" />,
      );
    });
    expect(container.querySelector('[contenteditable]')).toBeNull();
  });
});

/* ── O nível do tópico ─────────────────────────────────────────────────────── */

describe('Tab rebaixa o tópico, como no PowerPoint', () => {
  /*
    O Tab tirava o cursor do slide e o levava para a faixa: não havia como
    escrever um tópico dentro de outro, que é o primeiro gesto de quem monta
    uma lista de verdade num slide.
  */
  const tabNoItem = (i: number, shift = false) => act(() => {
    const li = corpo().querySelectorAll('li')[i];
    const r = document.createRange();
    r.selectNodeContents(li);
    r.collapse(false);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(r);
    corpo().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true }));
  });

  it('o nível é guardado como tabulação no começo da linha', () => {
    montar(['Saída às 19h', 'Levar lanterna']);
    tabNoItem(1);
    expect(gravados[gravados.length - 1]).toEqual(['Saída às 19h', '\tLevar lanterna']);
    tabNoItem(1, true);
    expect(gravados[gravados.length - 1]).toEqual(['Saída às 19h', 'Levar lanterna']);
  });

  it('o nível não passa do terceiro, e a tabulação não entra no texto lido', () => {
    expect(nivelDoTopico('\t\t\t\tFundo')).toEqual({ nivel: 2, texto: 'Fundo' });
    expect(nivelDoTopico('Topo')).toEqual({ nivel: 0, texto: 'Topo' });
  });
});

/* ── A tira de miniaturas tem o teclado e o menu do PowerPoint ─────────────── */

describe('a tira de miniaturas responde como a do PowerPoint', () => {
  /*
    A tira estava escrita três vezes e as três só sabiam ser clicadas: Ctrl+M
    não criava slide, Delete não apagava a miniatura escolhida e o botão
    direito não tinha menu. O desbravador que sabe o atalho aperta, nada
    acontece, e conclui que errou.
  */
  let feito: string[] = [];
  function Tira({ comAcoes = true }: { comAcoes?: boolean }) {
    const [atual, setAtual] = useState(0);
    return (
      <div className="pp-janela">
        <TiraDeSlides total={3} atual={atual} aoIr={setAtual}
          rotuloDe={i => `Slide ${i + 1}`} desenhar={() => null}
          acoes={comAcoes ? {
            novo: () => feito.push('novo'), duplicar: () => feito.push('duplicar'),
            excluir: () => feito.push('excluir'), mover: d => feito.push(`mover ${d}`),
          } : undefined} />
        <input aria-label="fora da tira" />
      </div>
    );
  }
  const item = (i: number) => container.querySelector<HTMLElement>(`[data-slide="${i}"]`)!;
  const teclar = (alvo: HTMLElement, key: string, ctrl = false) => act(() => {
    alvo.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey: ctrl, bubbles: true, cancelable: true }));
  });
  beforeEach(() => { feito = []; });

  it('as setas andam, e só a miniatura atual fica na ordem do Tab', () => {
    act(() => root.render(<Tira />));
    teclar(item(0), 'ArrowDown');
    expect(item(1).getAttribute('aria-selected')).toBe('true');
    expect(item(1).tabIndex).toBe(0);
    expect(item(0).tabIndex).toBe(-1);
    teclar(item(1), 'End');
    expect(item(2).getAttribute('aria-selected')).toBe('true');
  });

  it('Enter, Delete, Ctrl+D e Ctrl+seta chegam às ações', () => {
    act(() => root.render(<Tira />));
    teclar(item(0), 'Enter');
    teclar(item(0), 'Delete');
    teclar(item(0), 'd', true);
    teclar(item(0), 'ArrowDown', true);
    expect(feito).toEqual(['novo', 'excluir', 'duplicar', 'mover 1']);
  });

  it('Ctrl+M cria slide com o cursor em qualquer lugar da janela', () => {
    act(() => root.render(<Tira />));
    teclar(container.querySelector<HTMLElement>('[aria-label="fora da tira"]')!, 'm', true);
    expect(feito).toEqual(['novo']);
  });

  it('o botão direito abre o menu do slide, e o item age', () => {
    act(() => root.render(<Tira />));
    act(() => { item(1).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 })); });
    expect(item(1).getAttribute('aria-selected'), 'o botão direito escolhe a miniatura').toBe('true');
    const menu = container.querySelector('[role="menu"]')!;
    expect([...menu.querySelectorAll('[role="menuitem"]')].map(b => b.textContent?.trim()))
      .toEqual(['Novo Slide Ctrl+M', 'Duplicar Slide Ctrl+D', 'Excluir Slide Delete']);
    act(() => (menu.querySelectorAll('[role="menuitem"]')[1] as HTMLElement).click());
    expect(feito).toEqual(['duplicar']);
    expect(container.querySelector('[role="menu"]'), 'o menu fecha depois de agir').toBeNull();
  });

  it('arrastar a miniatura para outra posição a leva até lá', () => {
    act(() => root.render(<Tira />));
    const arrastar = (tipo: string, el: HTMLElement) => act(() => {
      el.dispatchEvent(new Event(tipo, { bubbles: true, cancelable: true }));
    });
    arrastar('dragstart', item(0));
    arrastar('dragover', item(2));
    expect(item(2).dataset.caiAqui, 'nada mostra onde a miniatura vai cair').toBe('depois');
    arrastar('drop', item(2));
    expect(feito).toEqual(['mover 2']);
    expect(item(2).dataset.caiAqui).toBeUndefined();
  });

  it('sem ações, a tira só navega: nem menu nem Delete', () => {
    act(() => root.render(<Tira comAcoes={false} />));
    act(() => { item(0).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })); });
    expect(container.querySelector('[role="menu"]')).toBeNull();
    teclar(item(0), 'Delete');
    expect(feito).toEqual([]);
    expect(item(0).getAttribute('draggable'), 'a tira que só navega deixa arrastar').toBe('false');
  });
});
