// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import EstanteDeInsignias from './EstanteDeInsignias';
import { ESCADAS } from '../../lib/escadasDeInsignia';
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
  id, code: id, name, description: `Descrição de ${name}`, icon: 'star', tier: 'companheiro',
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
  it('mostra uma por insígnia avulsa, e diz o nome ao passar o mouse', () => {
    desenhar({ badges: [insignia('a', 'Primeiro Passo'), insignia('b', 'Coruja')], total: 132, posicoes: [] });

    /*
      Um `title` só por insígnia.

      Havia dois, aninhados: o do link, com nome e descrição, e o do ícone, com
      o nome. O navegador mostra o mais interno, então a descrição prometida
      pelo de fora nunca aparecia. Hoje o `title` é elemento do SVG, e não
      atributo — é o que dá dica de ferramenta em imagem, e é o único.
    */
    const titulos = [...container.querySelectorAll('svg > title')].map(e => e.textContent);
    expect(titulos).toEqual(['Primeiro Passo', 'Coruja']);

    /* A descrição não se perde: vai no nome acessível do link, que é onde ela
       serve a quem navega por leitor de tela. */
    const rotulos = [...container.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label'));
    expect(rotulos).toContain('Primeiro Passo. Descrição de Primeiro Passo');

    expect(container.textContent).toContain('Suas insígnias (2)');
    expect(container.textContent).toContain('faltam 130');
  });

  /*
    A estante mostra o topo de cada família, e não uma por conquista.

    Com treze escadas de sete degraus, quem está adiantado tem dezenas de
    insígnias: despejar todas daria noventa e uma numa tela só, que é o muro
    que os trinta e dois cartões de vereda já foram uma vez.
  */
  it('resume a escada num ícone só, o mais alto alcançado', () => {
    const requisitos = ESCADAS.find(e => e.chave === 'requisitos')!;
    const tres = requisitos.degraus.slice(0, 3)
      .map(d => ({ ...insignia(d.code, d.nome), tier: d.classe }));
    desenhar({ badges: tres, total: 132, posicoes: [] });

    const titulos = [...container.querySelectorAll('svg > title')].map(e => e.textContent);
    expect(titulos, 'três degraus da mesma escada deveriam render um ícone só')
      .toEqual([requisitos.degraus[2].nome]);
  });

  /* E a escada inteira abre no clique, com o que falta em contorno — ali o
     apagado vale a pena, porque são sete de uma família e o que falta é o
     próximo passo, e não a lista do que ainda não foi feito. */
  it('abre a escada no clique, com os sete degraus', () => {
    const requisitos = ESCADAS.find(e => e.chave === 'requisitos')!;
    const um = [{ ...insignia(requisitos.degraus[0].code, requisitos.degraus[0].nome), tier: requisitos.degraus[0].classe }];
    desenhar({ badges: um, total: 132, posicoes: [] });

    expect(container.textContent).not.toContain('Requisitos —');
    const botao = container.querySelector('button[aria-expanded]') as HTMLButtonElement;
    act(() => botao.click());

    expect(container.textContent).toContain('Requisitos');
    expect(container.querySelectorAll('ol li')).toHaveLength(7);
    expect(container.textContent).toContain('Você está em');
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
