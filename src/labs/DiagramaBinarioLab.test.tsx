// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import DiagramaBinarioLab from './DiagramaBinarioLab';
import { VERIFICACOES } from './diagramaBinario';

/*
  O diagrama da AP045, montado pelos mesmos cliques que o desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `diagramaBinario.test.ts` prova que cada verificação **pode** ficar verde
  chamando o modelo. Isso não prova que a tela chama alguma delas: um botão da
  paleta sem `onClick`, um formulário de ligação que não liga, um `select` que
  não lista as peças postas — o motor continua correto e o laboratório fica
  impossível de vencer, que é pior do que um que abre resolvido.

  Está escrito em `exploradorValidator.test.ts`: trava de motor não é trava de
  tela.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <DiagramaBinarioLab
          specialtyCode="AP045" lessonCode="AP045.4-L2"
          lessonTitle="Montando o diagrama do caminho da informação"
          requirementCodes={['AP045-5.1']} userId="olhar"
        />
      </MemoryRouter>,
    );
  });
}

afterEach(() => { act(() => root.unmount()); container.remove(); });

const botao = (nome: string | RegExp) =>
  [...container.querySelectorAll('button')].find(b => {
    const t = (b.textContent ?? '').trim();
    return typeof nome === 'string' ? t === nome : nome.test(t);
  });

const clicar = (el: Element | undefined) => {
  expect(el, 'o botão não existe na tela').toBeTruthy();
  act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const campo = <T extends HTMLElement>(rotulo: string): T =>
  container.querySelector(`[aria-label="${rotulo}"]`) as T;

/** Escreve num input do React: escrever `.value` direto não chega ao estado. */
function escrever(el: HTMLInputElement | HTMLSelectElement, valor: string) {
  const proto = el instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(el, valor);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/** Liga duas peças pelo formulário, como o desbravador faz. */
function ligarNaTela(de: string, para: string, codigo: string) {
  escrever(campo<HTMLSelectElement>('A informação sai de'), de);
  escrever(campo<HTMLSelectElement>('e vai para'), para);
  escrever(campo<HTMLInputElement>('Código binário que passa'), codigo);
  clicar(botao('Ligar'));
}

const concluir = () => botao(/Concluir a lição/) as HTMLButtonElement;
const listaFeita = () => (container.textContent ?? '').match(/(\d+) de (\d+)/)?.[1];

describe('a lição do diagrama se vence clicando', () => {
  it('abre com a lista inteira vermelha e o botão desligado', () => {
    montar();
    expect(listaFeita()).toBe('0');
    expect(concluir().disabled).toBe(true);
    expect(container.textContent).toContain('A tela está em branco');
  });

  it('e fecha depois de montar o caminho do teclado ao monitor', () => {
    montar();
    for (const peca of ['Teclado', 'CPU', 'Memória RAM', 'Placa de vídeo', 'Monitor']) {
      clicar(botao(peca));
    }
    ligarNaTela('teclado', 'cpu', '01000001');
    ligarNaTela('cpu', 'ram', '01000001');
    ligarNaTela('cpu', 'video', '11111010');
    ligarNaTela('video', 'monitor', '11111010');

    expect(listaFeita()).toBe(String(VERIFICACOES.length));
    expect(concluir().disabled).toBe(false);
  });
});

describe('a tela recusa o que o modelo recusa, e diz por quê', () => {
  it('a letra no lugar do código não liga nada, e o aviso nomeia o código', () => {
    montar();
    clicar(botao('Teclado'));
    clicar(botao('CPU'));
    ligarNaTela('teclado', 'cpu', 'A');
    /* Um aviso genérico de "valor inválido" deixaria quem escreveu `A`
       achando que errou de campo. Ele escreveu a informação que passa ali —
       a confusão que a lição desfaz —, e o aviso precisa dizer isso. */
    expect(container.textContent).toContain('01000001');
    expect(listaFeita()).toBe('2');
  });

  it('e a ligação sem as duas peças escolhidas avisa em vez de agir', () => {
    montar();
    clicar(botao('Teclado'));
    clicar(botao('CPU'));
    escrever(campo<HTMLInputElement>('Código binário que passa'), '01000001');
    clicar(botao('Ligar'));
    expect(container.textContent).toContain('Escolha de qual peça');
  });
});

describe('a simulação relata, e não julga', () => {
  it('diz onde os bits pararam quando a seta está ao contrário', () => {
    montar();
    for (const peca of ['Teclado', 'CPU', 'Memória RAM', 'Monitor']) clicar(botao(peca));
    ligarNaTela('teclado', 'cpu', '01000001');
    ligarNaTela('cpu', 'ram', '01000001');
    /* A seta desenhada ao contrário: o diagrama fica bonito e afirma que o
       monitor manda dados para a CPU. */
    ligarNaTela('monitor', 'cpu', '11111010');
    clicar(botao(/Simular/));

    expect(container.textContent).toMatch(/Os bits pararam em/);
    /* Ela conta o que mediu. Escrever "seu diagrama está errado" poria na nossa
       tela o veredito que a lista já dá, e que a lição quer que se descubra
       olhando a direção das setas. */
    expect(container.textContent).not.toMatch(/errad|incorret|sua tarefa/i);
  });

  it('e o botão de simular não existe para um diagrama sem ligação nenhuma', () => {
    /* Gesto sem efeito é o que ensina a desconfiar do programa: simular um
       diagrama vazio não mostraria nada. */
    montar();
    clicar(botao('Teclado'));
    expect((botao(/Simular/) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('a paleta', () => {
  it('tirar uma peça tira as ligações dela da lista', () => {
    montar();
    for (const peca of ['Teclado', 'CPU']) clicar(botao(peca));
    ligarNaTela('teclado', 'cpu', '01000001');
    expect(container.textContent).toContain('01000001');

    /* Clicar de novo na peça posta a remove — e as setas vão junto, senão a
       lista de ligações mostraria uma peça que não está mais no desenho. */
    clicar(botao(/Teclado/));
    expect(container.textContent).toContain('Nenhuma ligação ainda');
  });

  it('e o select das ligações só oferece as peças que estão no diagrama', () => {
    montar();
    clicar(botao('CPU'));
    const opcoes = [...campo<HTMLSelectElement>('A informação sai de').options].map(o => o.value);
    expect(opcoes).toEqual(['', 'cpu']);
  });
});
