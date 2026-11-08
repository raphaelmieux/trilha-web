// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { mestreDoModelo, slideNovo, type Apresentacao } from './apresentacao';
import { useDesfazerDaApresentacao, useTeclasDeDesfazer, type DesfazerDaApresentacao } from './desfazerDaApresentacao';

/*
  O Ctrl+Z dos laboratórios de PowerPoint.

  Não existia: excluir o slide errado só tinha Recomeçar como volta. As três
  decisões que erram calado estão aqui — o PDF exportado não se desfaz, as
  letras de um título se juntam num passo e dois comandos seguidos não, e o
  Ctrl+Z dentro de um campo de texto é do campo.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let ap: Apresentacao;
let mudar: (f: (a: Apresentacao) => Apresentacao) => void = () => {};
let h: DesfazerDaApresentacao;

const inicial = (): Apresentacao => ({
  modelo: 'branco', mestre: mestreDoModelo('branco'), pdf: null,
  slides: [slideNovo('s1', 'titulo'), slideNovo('s2', 'titulo-conteudo')],
});

function Lab() {
  const [a, setA] = useState<Apresentacao>(inicial);
  ap = a;
  mudar = f => setA(f);
  h = useDesfazerDaApresentacao(a, setA);
  useTeclasDeDesfazer(h);
  return <input aria-label="campo" />;
}

const fazer = (f: (a: Apresentacao) => Apresentacao) => act(() => { mudar(f); });
const tecla = (key: string, alvo: EventTarget = window, shift = false) =>
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey: true, shiftKey: shift, bubbles: true, cancelable: true })); });
const titulo = (i: number) => ap.slides[i]?.titulo;
const escrever = (texto: string) =>
  fazer(a => ({ ...a, slides: a.slides.map((s, i) => (i === 0 ? { ...s, titulo: texto } : s)) }));

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<Lab />); });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe('Ctrl+Z nos laboratórios de PowerPoint', () => {
  it('excluir um slide e desfazer o devolve; Ctrl+Y exclui de novo', () => {
    expect(h.podeDesfazer).toBe(false);
    fazer(a => ({ ...a, slides: a.slides.slice(1) }));
    expect(ap.slides).toHaveLength(1);
    tecla('z');
    expect(ap.slides.map(s => s.id)).toEqual(['s1', 's2']);
    expect(h.podeRefazer).toBe(true);
    tecla('y');
    expect(ap.slides).toHaveLength(1);
    tecla('z');
    tecla('z', window, true);
    expect(ap.slides, 'Ctrl+Shift+Z também refaz').toHaveLength(1);
  });

  it('as letras de um título são um passo; o comando seguinte é outro', () => {
    escrever('A');
    vi.advanceTimersByTime(200);
    escrever('Ac');
    vi.advanceTimersByTime(200);
    escrever('Aca');
    fazer(a => ({ ...a, modelo: 'berlim', mestre: mestreDoModelo('berlim') }));
    tecla('z');
    expect(ap.modelo).toBe('branco');
    expect(titulo(0)).toBe('Aca');
    tecla('z');
    expect(titulo(0), 'um Ctrl+Z por letra apagaria o título de trás para a frente').toBe('');
  });

  it('digitar de novo depois de uma pausa é outro passo', () => {
    escrever('Acampamento');
    vi.advanceTimersByTime(3000);
    escrever('Acampamento 2026');
    tecla('z');
    expect(titulo(0)).toBe('Acampamento');
  });

  it('o PDF que já saiu não volta com o Ctrl+Z', () => {
    escrever('Acampamento');
    vi.advanceTimersByTime(3000);
    fazer(a => ({ ...a, pdf: a.slides.map(s => s.id) }));
    expect(h.podeDesfazer).toBe(true);
    tecla('z');
    expect(titulo(0)).toBe('');
    expect(ap.pdf, 'desfazer apagou o arquivo exportado').toEqual(['s1', 's2']);
  });

  it('dentro de um campo de texto o Ctrl+Z é do campo', () => {
    fazer(a => ({ ...a, slides: a.slides.slice(1) }));
    tecla('z', container.querySelector('input')!);
    expect(ap.slides).toHaveLength(1);
  });

  it('uma mudança nova depois de desfazer apaga o refazer', () => {
    fazer(a => ({ ...a, slides: a.slides.slice(1) }));
    tecla('z');
    fazer(a => ({ ...a, modelo: 'madison', mestre: mestreDoModelo('madison') }));
    expect(h.podeRefazer).toBe(false);
  });
});
