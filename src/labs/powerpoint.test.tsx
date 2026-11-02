// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FolhaDoSlide } from './powerpoint';
import { mestreDoModelo, slideNovo, type Slide } from './apresentacao';

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
