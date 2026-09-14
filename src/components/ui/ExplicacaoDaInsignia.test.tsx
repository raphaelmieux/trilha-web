// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import ExplicacaoDaInsignia from './ExplicacaoDaInsignia';
import type { InsigniaConquistada } from '../../lib/conquista';

/*
  O cartão que diz o que a insígnia rendeu.

  ── Por que uma trava para o portal ───────────────────────────────────────
  `position: fixed` só mede a janela enquanto nenhum ancestral tiver
  `transform`, `filter` ou `backdrop-filter`. Qualquer um dos três vira bloco
  de contenção, e o `inset: 0` passa a ser o retângulo daquele ancestral.

  O `.card` da plataforma tem `backdrop-filter` — é o vidro fosco dele. Quando
  o cartão de explicação passou a abrir também do painel inicial, ele foi
  chamado de dentro de um `.card`, e o resultado foi escurecer só a área
  daquele cartão e se centrar dentro dela: metade do cabeçalho ficava fora da
  tela, levando junto o nome da insígnia e o botão de fechar.

  O jsdom não calcula bloco de contenção nenhum, então o sintoma não se
  reproduz aqui — quem o viu foi um navegador de verdade. O que **é**
  verificável, e é o que garante o sintoma, é a promessa: o cartão não se
  desenha onde foi chamado. Sem isso, a próxima tela que o chamar de dentro de
  um cartão recebe o mesmo defeito, e de novo em silêncio.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const insignia: InsigniaConquistada = {
  id: 'i1',
  code: 'coruja',
  name: 'Coruja',
  description: 'Estudou entre a meia-noite e as cinco da manhã',
  icon: 'moon',
  tier: 'amigo',
  conquistadaEm: '2026-02-01T06:00:00Z',
  contexto: {},
};

let container: HTMLDivElement;
let root: Root;
let fechou: () => void;

const desenhar = (extra: Partial<InsigniaConquistada> = {}) => {
  act(() => {
    root.render(
      /* Dentro de um `.card`, que é de onde o painel inicial o chama. */
      <div className="card">
        <ExplicacaoDaInsignia insignia={{ ...insignia, ...extra }} aoFechar={fechou} />
      </div>,
    );
  });
};

const cartao = () => document.body.querySelector('[role="dialog"]');

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  fechou = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('o cartão de explicação', () => {
  it('se desenha no body, e não dentro do cartão que o chamou', () => {
    desenhar();

    expect(cartao(), 'o cartão não apareceu').not.toBeNull();
    expect(
      container.querySelector('[role="dialog"]'),
      'o cartão ficou dentro do .card que o chamou, onde o backdrop-filter prende o fixed',
    ).toBeNull();
  });

  it('conta o feito e a data, e cala sobre a trilha ou vereda que não foi gravada', () => {
    desenhar();

    expect(cartao()!.textContent).toContain('Estudou entre a meia-noite');
    expect(cartao()!.textContent).toContain('de fevereiro de 2026');
    /* Não se inventa trilha: dizer "na AP034" sem saber é afirmar o que não
       foi conferido, que é a mesma assimetria do `umDe`. */
    expect(cartao()!.textContent).toContain('Não ficou registrado onde esta foi conquistada');
  });

  /* Três saídas, porque a pessoa veio ver uma medalha e não abrir um
     formulário — e porque o Esc é a única que existe para quem navega por
     teclado. */
  it('fecha no Esc', () => {
    desenhar();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(fechou).toHaveBeenCalled();
  });

  it('fecha no botão de fechar', () => {
    desenhar();
    act(() => (document.body.querySelector('[aria-label="Fechar"]') as HTMLButtonElement).click());
    expect(fechou).toHaveBeenCalled();
  });
});
