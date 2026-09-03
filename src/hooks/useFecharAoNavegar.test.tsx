// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { useFecharAoNavegar } from './useFecharAoNavegar';

/*
  O teste existe porque o sintoma é invisível de fora.

  Clicar em "Vereda Atual" dentro de uma lição não dava erro nenhum: a rota era
  a mesma, o React Router não tinha o que trocar, e a lição seguia aberta. Da
  tela, parecia um botão morto; do código, parecia um botão certo apontando para
  o lugar certo. O que estava faltando não era o destino — era alguém reparar
  que a pessoa navegou.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let raiz: Root | null = null;
let no: HTMLDivElement | null = null;

afterEach(() => {
  act(() => raiz?.unmount());
  no?.remove();
  raiz = null;
  no = null;
});

/* Uma página com conteúdo aberto por estado, como a da vereda: o endereço não
   muda quando a lição abre. */
function PaginaComLicao({ aoFechar }: { aoFechar?: () => void }) {
  const [aberta, setAberta] = useState<string | null>(null);
  useFecharAoNavegar(() => {
    if (aberta === null) return;
    setAberta(null);
    aoFechar?.();
  });

  if (aberta) {
    return (
      <div>
        <p>lição aberta: {aberta}</p>
        <Link to="/vereda/CC001">Vereda Atual</Link>
      </div>
    );
  }
  return (
    <div>
      <p>índice da vereda</p>
      <button onClick={() => setAberta('m2-lab')}>abrir lição</button>
      <Link to="/vereda/CC001">Vereda Atual</Link>
    </div>
  );
}

function montar(inicial = '/vereda/CC001', aoFechar?: () => void) {
  no = document.createElement('div');
  document.body.appendChild(no);
  raiz = createRoot(no);
  act(() => {
    raiz!.render(
      <MemoryRouter initialEntries={[inicial]}>
        <Routes>
          <Route path="/vereda/:code" element={<PaginaComLicao aoFechar={aoFechar} />} />
          <Route path="/" element={<p>início</p>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return no!;
}

const clicar = (alvo: HTMLElement) => act(() => {
  alvo.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
});

const porTexto = (raizDoDom: HTMLElement, texto: string) =>
  [...raizDoDom.querySelectorAll('button, a')].find(e => e.textContent === texto) as HTMLElement;

describe('navegar para a própria página fecha o que está aberto', () => {
  it('a lição fecha ao clicar no item do menu que aponta para cá', () => {
    const dom = montar();
    clicar(porTexto(dom, 'abrir lição'));
    expect(dom.textContent).toContain('lição aberta');

    clicar(porTexto(dom, 'Vereda Atual'));
    expect(dom.textContent).toContain('índice da vereda');
    expect(dom.textContent).not.toContain('lição aberta');
  });

  /* A montagem não conta como navegação: uma página que já abrisse algo de
     saída o veria fechar sozinho antes de aparecer. */
  it('não fecha nada na primeira renderização', () => {
    const aoFechar = vi.fn();
    const dom = montar('/vereda/CC001', aoFechar);
    expect(aoFechar).not.toHaveBeenCalled();
    expect(dom.textContent).toContain('índice da vereda');
  });

  /* Com nada aberto, navegar para a mesma página não pode custar um recarregar
     de progresso — é o que o `if` na chamada evita, e é o que se cobra aqui. */
  it('sem lição aberta, o clique não chama o fechar', () => {
    const aoFechar = vi.fn();
    const dom = montar('/vereda/CC001', aoFechar);
    clicar(porTexto(dom, 'Vereda Atual'));
    expect(aoFechar).not.toHaveBeenCalled();
  });

  /*
    A garantia de que o conserto se apoia em algo real: o React Router muda a
    chave do histórico mesmo quando o destino é idêntico à origem. Se isso
    deixasse de valer, o botão voltaria a não fazer nada — e este teste é o que
    avisaria.
  */
  it('duas idas seguidas ao mesmo endereço são duas navegações', () => {
    const aoFechar = vi.fn();
    const dom = montar('/vereda/CC001', aoFechar);
    clicar(porTexto(dom, 'abrir lição'));
    clicar(porTexto(dom, 'Vereda Atual'));
    clicar(porTexto(dom, 'abrir lição'));
    clicar(porTexto(dom, 'Vereda Atual'));
    expect(aoFechar).toHaveBeenCalledTimes(2);
  });
});
