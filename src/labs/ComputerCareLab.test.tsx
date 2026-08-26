// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ComputerCareLab from './ComputerCareLab';

/*
  Os passos de desligar o computador, postos em ordem.

  Esta etapa tinha a própria implementação de ordenar, escrita à mão e só com as
  setinhas — enquanto as questões de ordenar do currículo já se arrastavam. Quem
  arrastava numa e não conseguia na outra concluía, com razão, que a segunda
  estava quebrada.

  As duas passam a usar ListaOrdenavel. O teste existe porque a diferença era
  invisível de fora: as duas telas mostram uma lista numerada com setas, e só
  tentando arrastar se descobre que uma delas não responde.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <ComputerCareLab
          specialtyCode="AP041" lessonCode="AP041.4-L2" lessonTitle="Cuidando do computador"
          requirementCodes={['AP041-3.3']} userId="u1"
        />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const passos = () => [...container.querySelectorAll<HTMLElement>('[draggable]')];
const textos = () => passos().map(l => l.querySelector('span.flex-1')?.textContent);

/*
  A etapa de ordenar só aparece depois das duas de classificar, então o teste
  precisa resolvê-las antes de chegar nela.

  Por tentativa: classificar errado devolve a correção e deixa tentar de novo, e
  o item só sai da lista de pendentes quando acerta. Escolher a resposta certa
  aqui exigiria copiar o gabarito para dentro do teste, que passaria a repetir
  o conteúdo em vez de exercitar a tela.
*/
function resolverClassificacoes() {
  const rotulos = ['Protege', 'Põe em risco', 'Preventiva', 'Corretiva'];
  const pendentes = () => [...container.querySelectorAll('button')]
    .filter(b => rotulos.includes(b.textContent?.trim() ?? ''));

  for (let volta = 0; volta < 80; volta++) {
    const abertos = pendentes();
    if (abertos.length === 0) break;
    /* As duas opções da mesma linha, em sequência: reclicar a mesma só repete a
       correção, e o item nunca sairia de pendente. */
    const antes = abertos.length;
    act(() => { abertos[0].click(); });
    if (pendentes().length === antes) act(() => { pendentes()[1]?.click(); });
  }
}

beforeEach(() => resolverClassificacoes());

describe('a etapa de pôr os passos em ordem', () => {
  it('deixa cada passo ser arrastado', () => {
    expect(passos().length).toBeGreaterThan(1);
    for (const p of passos()) expect(p.getAttribute('draggable')).toBe('true');
  });

  it('avisa que dá para arrastar', () => {
    expect(container.textContent).toContain('Arraste para trocar de lugar');
  });

  it('leva o passo para o lugar de quem recebeu', () => {
    const antes = textos();
    const origem = passos()[antes.length - 1];
    const alvo = passos()[0];
    act(() => { origem.dispatchEvent(new MouseEvent('dragstart', { bubbles: true })); });
    act(() => { alvo.dispatchEvent(new MouseEvent('dragover', { bubbles: true, cancelable: true })); });
    act(() => { alvo.dispatchEvent(new MouseEvent('drop', { bubbles: true, cancelable: true })); });
    expect(textos()[0]).toBe(antes[antes.length - 1]);
  });

  /* As setas ficam porque arrastar não existe em tela de toque, e o requisito
     não pode depender de um dos dois caminhos. */
  it('mantém as setas para quem está no celular', () => {
    const antes = textos();
    const subir = passos()[1].querySelector<HTMLButtonElement>('button[aria-label="Subir um lugar"]')!;
    act(() => { subir.click(); });
    expect(textos()[0]).toBe(antes[1]);
  });
});
