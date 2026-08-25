// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import EstanteDeInsignias from './EstanteDeInsignias';
import type { Badge } from '../../types';
import type { PosicaoNoRanking } from '../../hooks/useMinhasPosicoes';

/*
  A estante na home.

  O que ela mostra depende de duas coisas que não se veem olhando a tela de uma
  conta só: quem ainda não conquistou nada, e quem não entrou no ranking. As
  duas passavam despercebidas — a primeira porque a conta de quem desenvolve já
  tem insígnias, a segunda porque o ranking é opt-in e quem testa costuma ter
  optado.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const insignia = (id: string, name: string): Badge => ({
  id, code: id, name, description: `Descrição de ${name}`, icon: 'star', tier: 'bronze',
});

let container: HTMLDivElement;
let root: Root;

const desenhar = (props: Parameters<typeof EstanteDeInsignias>[0]) => {
  act(() => {
    root.render(<MemoryRouter><EstanteDeInsignias {...props} /></MemoryRouter>);
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('as insígnias', () => {
  it('mostra uma por insígnia conquistada, e diz o nome ao passar o mouse', () => {
    desenhar({ badges: [insignia('a', 'Primeiro Passo'), insignia('b', 'Coruja')], total: 57, posicoes: [] });

    /*
      Um `title` só por insígnia.

      Havia dois, aninhados: o do link, com nome e descrição, e o do ícone, com
      o nome. O navegador mostra o mais interno, então a descrição prometida
      pelo de fora nunca aparecia — e este teste passava assim, porque olhava o
      atributo no DOM em vez de olhar qual deles chega à pessoa.
    */
    const titulos = [...container.querySelectorAll('[title]')].map(e => e.getAttribute('title'));
    expect(titulos).toEqual(['Primeiro Passo', 'Coruja']);

    /* A descrição não se perde: vai no nome acessível do link, que é onde ela
       serve a quem navega por leitor de tela. */
    const rotulos = [...container.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label'));
    expect(rotulos).toContain('Primeiro Passo. Descrição de Primeiro Passo');

    expect(container.textContent).toContain('Suas insígnias (2)');
    expect(container.textContent).toContain('faltam 55');
  });

  /* Quem ainda não tem nenhuma é justamente quem a estante deveria alcançar —
     um espaço em branco não convida ninguém. */
  it('convida quem ainda não tem nenhuma, em vez de mostrar vazio', () => {
    desenhar({ badges: [], total: 57, posicoes: [] });

    expect(container.textContent).toContain('primeira lição');
    expect(container.textContent).toContain('57');
    expect(container.textContent).not.toContain('faltam');
  });
});

describe('o ranking', () => {
  const posicoes: PosicaoNoRanking[] = [
    { periodo: 'dia', rotulo: 'Diário', posicao: 3, total: 12 },
    { periodo: 'semana', rotulo: 'Semanal', posicao: null, total: 30 },
  ];

  it('mostra a colocação em cada janela', () => {
    desenhar({ badges: [], total: 57, posicoes });

    expect(container.textContent).toContain('Diário');
    expect(container.textContent).toContain('3º de 12');
  });

  /* Sem pontos na janela a pessoa não entra na listagem. Dizer "30º de 30"
     seria inventar uma colocação que o ranking não deu a ela. */
  it('não inventa colocação para quem não pontuou na janela', () => {
    desenhar({ badges: [], total: 57, posicoes });

    expect(container.textContent).toContain('sem pontos ainda');
    expect(container.textContent).not.toContain('30º');
  });

  /* Quem não optou pelo ranking não recebe lista nenhuma — e então a tela não
     pode mostrar um bloco vazio no lugar. */
  it('some inteiro para quem não entrou no ranking', () => {
    desenhar({ badges: [insignia('a', 'Primeiro Passo')], total: 57, posicoes: [] });

    expect(container.textContent).not.toContain('Diário');
    expect(container.textContent).not.toContain('de 12');
  });
});
