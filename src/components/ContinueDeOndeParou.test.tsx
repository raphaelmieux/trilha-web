// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas, licoesDaVereda } from '../curriculum/veredas';
import { percursoVazio, type PercursoDeVereda } from '../lib/veredas';
import type { ProgressMap } from '../lib/progress';

/*
  A seção do topo do painel, desenhada.

  A regra mora em `lib/continuar.ts` e tem as travas dela. Aqui fica o que só a
  tela pode errar: aparecer vazia para quem nunca começou, aparecer antes de os
  dados chegarem (com a ordem errada por um instante), e o cartão levar a
  outro lugar que não a próxima lição.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const estado = vi.hoisted(() => ({
  percurso: {} as Record<string, PercursoDeVereda>,
  carregandoVeredas: false,
}));

vi.mock('../hooks/useVeredas', () => ({
  useVeredas: () => ({
    percursoDe: (id: string) => estado.percurso[id],
    concluida: () => true,
    carregando: estado.carregandoVeredas,
  }),
}));
vi.mock('../hooks/useLicoesConcluidas', () => ({
  useLicoesConcluidas: () => ({ licoesFeitas: new Set<string>(), loading: false }),
}));

const { default: ContinueDeOndeParou } = await import('./ContinueDeOndeParou');

const trilha = getOpenSpecialties()[0];
const vereda = veredasAbertas().find(v => licoesDaVereda(v).length > 1)!;
const [primeira, segunda] = licoesDaVereda(vereda);

let container: HTMLDivElement;
let root: Root;

const desenhar = (props: { ultimaAtividade?: Record<string, string>; carregando?: boolean; progress?: ProgressMap } = {}) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <ContinueDeOndeParou userId="u1" progress={props.progress ?? {}}
          ultimaAtividade={props.ultimaAtividade ?? {}} liberada={() => true}
          carregando={props.carregando ?? false} />
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  estado.percurso = {};
  estado.carregandoVeredas = false;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const links = () => [...container.querySelectorAll('a')].map(a => a.getAttribute('href'));

describe('Continue de onde parou', () => {
  it('não aparece para quem não começou nada', () => {
    desenhar();
    expect(container.textContent).toBe('');
  });

  it('não aparece enquanto o painel carrega, mesmo com algo pela metade', () => {
    estado.percurso = { [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]) } };
    desenhar({ carregando: true });
    expect(container.textContent).toBe('');
  });

  it('leva a vereda direto à próxima lição', () => {
    estado.percurso = { [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]) } };
    desenhar();
    expect(container.textContent).toContain('Continue de onde parou');
    expect(container.textContent).toContain(segunda.titulo);
    expect(links()).toEqual([`/vereda/${vereda.code}?licao=${encodeURIComponent(segunda.id)}`]);
  });

  it('põe a mais recente primeiro, trilha e vereda misturadas', () => {
    estado.percurso = {
      [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]), ultimaVez: '2026-10-20T10:00:00+00:00' },
    };
    desenhar({ ultimaAtividade: { [trilha.code]: '2026-10-26T10:00:00+00:00' } });
    const [a, b] = links();
    expect(a).toMatch(new RegExp(`^/licao/${trilha.code}/`));
    expect(b).toMatch(new RegExp(`^/vereda/${vereda.code}\\?licao=`));
  });
});
