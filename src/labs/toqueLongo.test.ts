// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { instalarToqueLongo, ESPERA_DO_TOQUE_LONGO } from './toqueLongo';

/*
  Segurar o dedo é o botão direito da tela de toque.

  No celular nenhum menu de contexto abria: o Safari nunca dispara
  `contextmenu` num toque longo, e o Chrome do Android dispara só às vezes.
  O detector dispara o evento ele mesmo, e esta trava confere as três
  decisões que erram calado: o texto editável fica com o sistema, o clique de
  soltar o dedo é engolido, e o evento do próprio navegador não abre o menu
  duas vezes.
*/

let raiz: HTMLDivElement;
let alvo: HTMLDivElement;
let desinstalar: () => void;
let menus: number;

const apertar = (el: Element, tipo = 'touch', x = 10, y = 10) =>
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: tipo, clientX: x, clientY: y }));
const mover = (el: Element, x: number, y: number) =>
  el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', clientX: x, clientY: y }));
const soltar = (el: Element) =>
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
const clicar = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

beforeEach(() => {
  vi.useFakeTimers();
  menus = 0;
  raiz = document.createElement('div');
  alvo = document.createElement('div');
  raiz.appendChild(alvo);
  document.body.appendChild(raiz);
  alvo.addEventListener('contextmenu', e => { e.preventDefault(); menus++; });
  desinstalar = instalarToqueLongo(raiz);
});
afterEach(() => {
  desinstalar();
  raiz.remove();
  vi.useRealTimers();
});

describe('o toque longo abre o menu do botão direito', () => {
  it('dedo parado pelo tempo do Android dispara o contextmenu no ponto do dedo', () => {
    let ponto: [number, number] = [0, 0];
    alvo.addEventListener('contextmenu', e => { ponto = [e.clientX, e.clientY]; });
    apertar(alvo, 'touch', 40, 70);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO - 1);
    expect(menus, 'abriu antes do tempo, e todo toque viraria menu').toBe(0);
    vi.advanceTimersByTime(1);
    expect(menus).toBe(1);
    expect(ponto).toEqual([40, 70]);
  });

  it('toque curto continua sendo toque', () => {
    apertar(alvo);
    vi.advanceTimersByTime(200);
    soltar(alvo);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    expect(menus).toBe(0);
  });

  it('dedo que anda é rolagem, e não menu', () => {
    apertar(alvo, 'touch', 10, 10);
    mover(alvo, 10, 40);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    expect(menus).toBe(0);
  });

  it('o mouse tem botão direito de verdade e não passa por aqui', () => {
    apertar(alvo, 'mouse');
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    expect(menus).toBe(0);
  });

  it('no texto editável o toque longo é do sistema, que seleciona a palavra', () => {
    const folha = document.createElement('div');
    folha.setAttribute('contenteditable', 'true');
    const palavra = document.createElement('span');
    folha.appendChild(palavra);
    raiz.appendChild(folha);
    folha.addEventListener('contextmenu', () => { menus++; });
    apertar(palavra);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    expect(menus).toBe(0);
  });
});

describe('o que vem depois do toque longo', () => {
  it('o clique de soltar o dedo é engolido, inclusive num menu fora da moldura', () => {
    const noBody = document.createElement('button');
    document.body.appendChild(noBody);
    let cliques = 0;
    noBody.addEventListener('click', () => { cliques++; });
    apertar(alvo);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    soltar(alvo);
    clicar(noBody);
    expect(cliques, 'o clique caiu no item do menu que acabou de abrir').toBe(0);
    clicar(noBody);
    expect(cliques, 'o toque seguinte também foi engolido').toBe(1);
    noBody.remove();
  });

  it('a trava do clique não fica armada se o clique não vier', () => {
    let cliques = 0;
    alvo.addEventListener('click', () => { cliques++; });
    apertar(alvo);
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    soltar(alvo);
    vi.advanceTimersByTime(1000);
    clicar(alvo);
    expect(cliques).toBe(1);
  });

  it('se o navegador disparou o contextmenu primeiro, o nosso não abre outro', () => {
    apertar(alvo);
    vi.advanceTimersByTime(300);
    alvo.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    vi.advanceTimersByTime(ESPERA_DO_TOQUE_LONGO);
    expect(menus, 'o menu abriu duas vezes').toBe(1);
  });
});
