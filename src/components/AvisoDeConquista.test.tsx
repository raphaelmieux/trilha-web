// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import AvisoDeConquista from './AvisoDeConquista';
import { anunciarConquistas, ouvirConquistas, type InsigniaConquistada } from '../lib/conquista';

/*
  O aviso no momento da conquista.

  A insígnia era gravada e o assunto morria ali: `evaluateBadges` devolvia
  `void`, e quem ganhava só descobria navegando até a estante, dias depois.
  Recompensa desligada do feito não recompensa o feito.

  O que pode dar errado aqui é calado dos dois lados. Um aviso que não aparece
  deixa tudo exatamente como estava — ninguém reclama de uma notificação que
  nunca existiu. E um que aparece e não sai fica por cima da tela de quem
  voltou a estudar, que é pior do que não ter.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const insignia = (code: string, name: string, extra: Partial<InsigniaConquistada> = {}): InsigniaConquistada => ({
  id: code, code, name, description: `O feito de ${name}.`,
  icon: 'star', tier: 'pesquisador', ...extra,
});

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<AvisoDeConquista />); });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

const anunciar = (...is: InsigniaConquistada[]) => act(() => { anunciarConquistas(is); });
const avancar = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const naTela = () => container.textContent ?? '';

describe('o aviso aparece e sai sozinho', () => {
  it('não desenha nada enquanto ninguém conquista', () => {
    expect(naTela()).toBe('');
  });

  it('aparece no instante do anúncio, com os três elementos e nada mais', () => {
    anunciar(insignia('a', 'Primeiro Passo'));

    expect(naTela()).toContain('Primeiro Passo');
    expect(naTela()).toContain('O feito de Primeiro Passo.');
    /* O desenho da insígnia é o terceiro elemento. */
    expect(container.querySelector('svg[role="img"]')).toBeTruthy();
    /* E nada mais: sem botão, sem link. Aviso que pede uma ação vira tarefa,
       e uma tarefa em cima de quem acabou de concluir outra não comemora. */
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('sai sozinho depois de alguns segundos', () => {
    anunciar(insignia('a', 'Primeiro Passo'));
    expect(naTela()).toContain('Primeiro Passo');

    avancar(6000);
    expect(naTela(), 'o aviso ficou preso na tela').toBe('');
  });

  /* `status`/`polite`, e não `alert`: a conquista é boa notícia, não urgência,
     e `alert` interrompe o leitor de tela no meio da frase de quem está
     lendo a questão seguinte. */
  it('anuncia com educação a quem usa leitor de tela', () => {
    anunciar(insignia('a', 'Primeiro Passo'));
    const palco = container.querySelector('[role="status"]');
    expect(palco).toBeTruthy();
    expect(palco?.getAttribute('aria-live')).toBe('polite');
  });
});

describe('quando caem várias de uma vez', () => {
  /*
    Fechar um módulo pode fechar o degrau de requisitos, o de lições e o de
    ofensiva no mesmo instante. Três avisos empilhados viram um bloco de texto
    que ninguém lê; três em sequência são três comemorações.
  */
  it('mostra uma de cada vez, em fila', () => {
    anunciar(insignia('a', 'Primeira'), insignia('b', 'Segunda'), insignia('c', 'Terceira'));

    expect(naTela()).toContain('Primeira');
    expect(naTela(), 'duas ao mesmo tempo na tela').not.toContain('Segunda');

    avancar(6000);
    expect(naTela()).toContain('Segunda');
    expect(naTela()).not.toContain('Primeira');

    avancar(6000);
    expect(naTela()).toContain('Terceira');

    avancar(6000);
    expect(naTela(), 'a fila não esvaziou').toBe('');
  });

  /*
    `evaluateBadges` é chamada de dois lugares por ação, e as duas podem
    conceder no mesmo instante. O banco tem UNIQUE para isso; a tela não tem,
    e o aviso repetido seria a única marca visível da corrida.
  */
  it('não enfileira a mesma insígnia duas vezes', () => {
    anunciar(insignia('a', 'Primeira'));
    anunciar(insignia('a', 'Primeira'));

    avancar(6000);
    expect(naTela(), 'a mesma insígnia avisou duas vezes').toBe('');
  });
});

describe('o canal entre a lib e a tela', () => {
  /* Anunciar sem ninguém ouvindo não pode estourar: `evaluateBadges` roda em
     `.catch(() => {})` dentro da lib, e pode conceder antes de qualquer tela
     ter montado. */
  it('aguenta anúncio sem assinante', () => {
    expect(() => anunciarConquistas([insignia('z', 'Sozinha')])).not.toThrow();
  });

  it('lista vazia não acorda ninguém', () => {
    const ouviu = vi.fn();
    const parar = ouvirConquistas(ouviu);
    anunciarConquistas([]);
    expect(ouviu).not.toHaveBeenCalled();
    parar();
  });

  /*
    Um assinante que estoure não pode derrubar quem gravou a conquista: a
    insígnia já está no banco, e falhar ao desenhar o aviso não é motivo para
    a chamada que a concedeu falhar.
  */
  it('um assinante quebrado não derruba o anúncio', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
    const bom = vi.fn();
    const pararRuim = ouvirConquistas(() => { throw new Error('quebrei'); });
    const pararBom = ouvirConquistas(bom);

    expect(() => anunciarConquistas([insignia('q', 'Qualquer')])).not.toThrow();
    expect(bom, 'o assinante seguinte não foi avisado').toHaveBeenCalled();

    pararRuim(); pararBom(); erro.mockRestore();
  });

  it('parar de ouvir para de verdade', () => {
    const ouviu = vi.fn();
    ouvirConquistas(ouviu)();
    anunciarConquistas([insignia('q', 'Qualquer')]);
    expect(ouviu).not.toHaveBeenCalled();
  });
});
