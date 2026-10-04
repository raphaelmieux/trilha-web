// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AoTopoAoNavegar from './AoTopoAoNavegar';

/*
  Toda tela abre no começo dela.

  ── O defeito que fez esta trava existir ─────────────────────────────────
  Num aplicativo de uma página só, trocar de rota não mexe na rolagem: o
  navegador guarda o ponto em que a pessoa estava e a tela nova nasce ali. Quem
  rolasse o painel até as certificações e abrisse uma trilha chegava na trilha
  já rolada, com o emblema e o nome dela acima da dobra.

  Nada estoura, e é por isso que durou meses: a tela abre inteira, certa, e no
  lugar errado. O sintoma também **some de quem vai conferir** — abre-se a
  página, ela está no topo, e nada parece errado; ele só aparece para quem
  chegou rolado, que é quem estava usando a plataforma.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let rolagens: { top?: number; behavior?: string }[];

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  rolagens = [];
  /* O jsdom não rola nada — `window.scrollTo` não é implementado lá. O que se
     confere é a promessa: o pedido que o componente faz, e com que argumentos. */
  vi.stubGlobal('scrollTo', vi.fn((o: { top?: number; behavior?: string }) => { rolagens.push(o); }));
  /* O jsdom não traz `history.scrollRestoration`; todo navegador traz. O
     componente só a escreve quando ela existe — sem declará-la aqui, a guarda
     dele pula certo e a trava não teria o que observar, aprovando por não ter
     conferido nada. */
  Object.defineProperty(window.history, 'scrollRestoration', {
    value: 'auto', writable: true, configurable: true,
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

/* Uma tela com um botão que navega, que é o gesto de quem usa a plataforma. */
function Tela({ para, texto }: { para: string; texto: string }) {
  const navegar = useNavigate();
  return <button onClick={() => navegar(para)}>{texto}</button>;
}

function montar(inicial = '/') {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[inicial]}>
        <AoTopoAoNavegar />
        <Routes>
          <Route path="/" element={<Tela para="/especialidade/AP034" texto="abrir a trilha" />} />
          {/* O mesmo caminho com outra busca, que é o caso que importa:
              trocar de aba dentro da trilha não é trocar de página. */}
          <Route path="/especialidade/:code" element={<Tela para="/especialidade/AP034?aba=provas" texto="trocar de aba" />} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

const clicar = (texto: string) => act(() => {
  container.querySelectorAll('button').forEach(b => {
    if (b.textContent === texto) b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
});

describe('a troca de página', () => {
  it('leva ao topo', () => {
    montar();
    rolagens = [];
    clicar('abrir a trilha');
    expect(rolagens).toEqual([{ top: 0, left: 0, behavior: 'instant' }]);
  });

  /*
    Instantâneo, e escrito. Omitido, o `behavior` obedece ao `scroll-behavior`
    da folha, e o dia em que alguém escrever `smooth` ali a troca de página
    passa a **deslizar** dois mil pixels por um conteúdo que já não é o da tela
    em que se está — e passa a desobedecer a quem pediu menos movimento. A
    trava pede o valor, e não só a chamada.
  */
  it('não desliza: pede instantâneo em vez de deixar a folha decidir', () => {
    montar();
    clicar('abrir a trilha');
    for (const r of rolagens) expect(r.behavior).toBe('instant');
  });

  /*
    Só o caminho, e não a busca. Trocar um filtro ou uma aba pela query não é
    trocar de página, e jogar a pessoa ao topo a cada ajuste faria ela perder o
    lugar em que estava lendo. É o conserto virando o defeito do outro lado.
  */
  it('não leva ao topo quando só a busca muda', () => {
    montar('/especialidade/AP034');
    rolagens = [];
    clicar('trocar de aba');
    expect(rolagens).toEqual([]);
  });

  it('abre no topo já na primeira tela, sem precisar de uma troca', () => {
    montar('/especialidade/AP034');
    expect(rolagens).toEqual([{ top: 0, left: 0, behavior: 'instant' }]);
  });

  /*
    Sem isto o navegador devolve a rolagem antiga **depois** do nosso efeito, e
    o conserto funciona para a frente e falha no botão voltar — de maneira
    intermitente, que é a pior forma de falhar, porque tem cara de acaso.
  */
  it('tira do navegador a restauração do voltar', () => {
    montar();
    expect(window.history.scrollRestoration).toBe('manual');
  });
});

/*
  ── E ele continua montado no `App` ──────────────────────────────────────

  É a decisão do `CodigoFonte`, pelo mesmo motivo: uma página que fosse
  consertar isso por conta própria consertaria **uma** página, e as outras doze
  continuariam abrindo no meio sem nada acusar. A trava olha para onde o
  componente está montado, e não para o que cada página faz — proibir
  `window.scrollTo` nas páginas reprovaria o "refazer" da lição, que é gesto da
  pessoa dentro da mesma página e está certo.

  E ele tem de estar **dentro** do `HashRouter`: fora dele o `useLocation`
  estoura, o que ao menos aparece — mas fora do `App` e dentro de uma página é
  que ele falha calado.
*/
describe('onde ele mora', () => {
  it('está montado no App, e dentro do roteador', () => {
    const app = readFileSync('src/App.tsx', 'utf-8');
    expect(app).toContain('<AoTopoAoNavegar />');
    const noRoteador = app.indexOf('<HashRouter>');
    const oComponente = app.indexOf('<AoTopoAoNavegar />');
    const fimDoRoteador = app.indexOf('</HashRouter>');
    expect(noRoteador).toBeGreaterThanOrEqual(0);
    expect(oComponente).toBeGreaterThan(noRoteador);
    expect(oComponente).toBeLessThan(fimDoRoteador);
  });
});
