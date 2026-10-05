// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CampoLongo, Cartao, Escolha, EscolhaMultipla } from './caderno';

/*
  As peças do caderno da análise.

  Elas saíram de `LaboratorioDaAnalise.tsx` quando a CC-ES010 precisou das
  mesmas — antes de a cópia existir —, e o que esta trava guarda é o que cada
  uma **promete**: o campo longo relata o que falta, a escolha diz qual está
  marcada para quem não vê a borda, e a escolha múltipla se distingue da única
  antes do primeiro clique.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const montar = (no: React.ReactNode) => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(no); });
};

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (alvo: Element | null | undefined) => {
  act(() => { alvo?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

/*
  `campo.value = x` não chega ao React: ele guarda o último valor que ele mesmo
  pôs e descarta o evento quando os dois batem. Quem desfaz isso é o setter
  nativo do protótipo.
*/
const escreverEm = (campo: HTMLTextAreaElement, texto: string) => {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value',
    )!.set!;
    setter.call(campo, texto);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const botoes = () => [...container.querySelectorAll('button')];
const porTexto = (t: string) => botoes().find(b => (b.textContent ?? '').includes(t));
const contador = () => [...container.querySelectorAll('span')]
  .find(s => /letras no (mínimo|máximo)/.test(s.textContent ?? ''))!;

describe('o cartão', () => {
  it('desenha o título como cabeçalho, e a linha de contexto quando há', () => {
    montar(<Cartao titulo="O par escolhido" abaixo="Duas colunas da base."><p>miolo</p></Cartao>);
    expect(container.querySelector('h2')!.textContent).toBe('O par escolhido');
    expect(container.textContent).toContain('Duas colunas da base.');
    expect(container.textContent).toContain('miolo');
  });

  it('sem linha de contexto, não desenha parágrafo nenhum', () => {
    montar(<Cartao titulo="Só o título"><p>miolo</p></Cartao>);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });
});

describe('o campo longo', () => {
  /*
    O contador é o que separa "tarefa vermelha" de "tarefa vermelha que diz por
    quê". Sem ele, quem escreveu trinta letras numa meta que pede sessenta olha
    uma lista vermelha sem nada na tela explicando — e o que a tarefa mede
    passa a ser paciência.
  */
  it('relata o mínimo quando não há máximo, e o máximo quando há', () => {
    montar(<CampoLongo rotulo="Por quê" valor="curto" minimo={60} aoEscrever={() => {}} />);
    expect(contador().textContent).toContain('de 60 letras no mínimo');
    act(() => root.unmount());
    container.remove();

    montar(
      <CampoLongo rotulo="Conclusão" valor="curto" minimo={60} maximo={1800} aoEscrever={() => {}} />,
    );
    expect(contador().textContent).toContain('de 1800 letras no máximo');
  });

  it('conta o que foi escrito sem contar o espaço das pontas', () => {
    montar(<CampoLongo rotulo="Por quê" valor="   abc   " minimo={60} aoEscrever={() => {}} />);
    expect(contador().textContent!.startsWith('3 de 60')).toBe(true);
  });

  /*
    E o contador avisa **enquanto falta**, e não depois. A cor é a promessa: no
    jsdom não há contraste a medir, então o que se testa é que o token de aviso
    chega ao elemento — e que ele **sai** quando o texto fica do tamanho, senão
    o aviso é permanente e deixa de avisar.
  */
  it('veste o aviso enquanto está curto, e o tira quando basta', () => {
    montar(<CampoLongo rotulo="Por quê" valor="curto" minimo={60} aoEscrever={() => {}} />);
    expect(contador().getAttribute('style')).toContain('--color-warning');
    act(() => root.unmount());
    container.remove();

    montar(
      <CampoLongo rotulo="Por quê" valor={'x'.repeat(60)} minimo={60} aoEscrever={() => {}} />,
    );
    expect(contador().getAttribute('style')).not.toContain('--color-warning');
  });

  it('e avisa de novo quando passa do máximo', () => {
    montar(
      <CampoLongo
        rotulo="Conclusão" valor={'x'.repeat(40)} minimo={10} maximo={30} aoEscrever={() => {}}
      />,
    );
    expect(contador().getAttribute('style')).toContain('--color-warning');
  });

  it('entrega o que foi digitado a quem o chamou', () => {
    const escrito: string[] = [];
    montar(<CampoLongo rotulo="Por quê" valor="" minimo={10} aoEscrever={t => escrito.push(t)} />);
    escreverEm(container.querySelector('textarea')!, 'uma frase');
    expect(escrito).toEqual(['uma frase']);
  });
});

const OPCOES = [
  { id: 'a' as const, rotulo: 'A primeira', abaixo: 'com uma linha abaixo' },
  { id: 'b' as const, rotulo: 'A segunda' },
  { id: 'c' as const, rotulo: 'A terceira' },
];

const marcados = () => botoes().filter(b => b.getAttribute('aria-pressed') === 'true');

describe('a escolha única', () => {
  /*
    `aria-pressed` não é detalhe: a marcação é desenhada com borda e fundo, e
    cor sozinha não se lê — é a razão de a insígnia ter forma **e** cor. Sem
    ele, quem usa leitor de tela não tem como saber o que já escolheu.
  */
  it('diz qual está marcada, e só uma', () => {
    montar(<Escolha opcoes={OPCOES} escolhida="b" aoEscolher={() => {}} />);
    expect(marcados()).toHaveLength(1);
    expect(marcados()[0].textContent).toContain('A segunda');
  });

  it('sem nada escolhido, nenhuma aparece marcada', () => {
    montar(<Escolha opcoes={OPCOES} escolhida={undefined} aoEscolher={() => {}} />);
    expect(marcados()).toHaveLength(0);
    for (const b of botoes()) expect(b.getAttribute('aria-pressed')).toBe('false');
  });

  it('o clique entrega o id, e a linha de contexto aparece', () => {
    const escolhido: string[] = [];
    montar(<Escolha opcoes={OPCOES} escolhida={undefined} aoEscolher={id => escolhido.push(id)} />);
    expect(container.textContent).toContain('com uma linha abaixo');
    clicar(porTexto('A terceira'));
    expect(escolhido).toEqual(['c']);
  });

  it('o porquê só aparece quando há porquê', () => {
    montar(<Escolha opcoes={OPCOES} escolhida="a" aoEscolher={() => {}} porque={null} />);
    expect(container.textContent).not.toContain('não é isso');
    act(() => root.unmount());
    container.remove();

    montar(<Escolha opcoes={OPCOES} escolhida="a" aoEscolher={() => {}} porque="não é isso" />);
    expect(container.textContent).toContain('não é isso');
  });
});

describe('a escolha múltipla', () => {
  it('deixa mais de uma marcada ao mesmo tempo', () => {
    montar(<EscolhaMultipla opcoes={OPCOES} marcadas={['a', 'c']} aoAlternar={() => {}} />);
    expect(marcados()).toHaveLength(2);
  });

  /*
    O clique **alterna**. Sem isso, desmarcar o que se marcou por engano
    exigiria recomeçar a lista — e numa pergunta cuja resposta é um conjunto de
    três entre sete, isso é a diferença entre corrigir e desistir.
  */
  it('o clique no que já está marcado também entrega o id, para alternar', () => {
    const alternados: string[] = [];
    montar(
      <EscolhaMultipla opcoes={OPCOES} marcadas={['a']} aoAlternar={id => alternados.push(id)} />,
    );
    clicar(porTexto('A primeira'));
    expect(alternados).toEqual(['a']);
  });

  /*
    E ela **se distingue** da escolha única antes do primeiro clique. Desenhada
    igual, quem a olha supõe que o segundo clique desfaz o primeiro: marca uma,
    lê a lista e vai embora com uma só — numa pergunta que pede três.
  */
  it('traz a caixa de marcar, que a escolha única não tem', () => {
    montar(<EscolhaMultipla opcoes={OPCOES} marcadas={['a']} aoAlternar={() => {}} />);
    const comCaixa = botoes().map(b => b.querySelectorAll('[aria-hidden="true"]').length);
    expect(comCaixa.every(n => n === 1), 'alguma opção ficou sem a caixa de marcar').toBe(true);
    act(() => root.unmount());
    container.remove();

    montar(<Escolha opcoes={OPCOES} escolhida="a" aoEscolher={() => {}} />);
    const semCaixa = botoes().map(b => b.querySelectorAll('[aria-hidden="true"]').length);
    expect(semCaixa.every(n => n === 0), 'a escolha única ganhou caixa de marcar').toBe(true);
  });

  it('a caixa marcada mostra o sinal, e a desmarcada não mostra nada', () => {
    montar(<EscolhaMultipla opcoes={OPCOES} marcadas={['b']} aoAlternar={() => {}} />);
    const marcada = botoes().find(b => b.getAttribute('aria-pressed') === 'true')!;
    const solta = botoes().find(b => b.getAttribute('aria-pressed') === 'false')!;
    expect(marcada.querySelector('[aria-hidden="true"]')!.textContent).toBe('✓');
    expect(solta.querySelector('[aria-hidden="true"]')!.textContent).toBe('');
  });
});
