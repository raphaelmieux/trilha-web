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
  dados chegarem (com a ordem errada por um instante), o cartão levar a outro
  lugar que não a próxima lição, e o grupo com algo pela metade ganhar também
  um cartão de começar.
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
    andamento: [],
    percursoDe: (id: string) => estado.percurso[id],
    concluida: () => true,
    carregando: estado.carregandoVeredas,
  }),
}));
vi.mock('../hooks/useLicoesConcluidas', () => ({
  useLicoesConcluidas: () => ({ licoesFeitas: new Set<string>(), loading: false }),
}));

const { default: ContinueAprendendo } = await import('./ContinueAprendendo');

const trilha = getOpenSpecialties()[0];
const vereda = veredasAbertas().find(v => licoesDaVereda(v).length > 1)!;
const [primeira, segunda] = licoesDaVereda(vereda);

let container: HTMLDivElement;
let root: Root;

const desenhar = (props: { ultimaAtividade?: Record<string, string>; carregando?: boolean; progress?: ProgressMap } = {}) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <ContinueAprendendo userId="u1" progress={props.progress ?? {}}
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

const titulos = () => [...container.querySelectorAll('h3')].map(h => h.textContent);
const cartaoDe = (code: string) =>
  [...container.querySelectorAll('a')].find(a => a.textContent?.includes(code));

describe('Continue aprendendo', () => {
  /* Quem nunca começou nada é quem mais precisa de por onde começar: a seção
     não some, oferece a primeira de cada grupo. */
  it('a quem não começou nada, oferece um começo por grupo e nada em andamento', () => {
    desenhar();
    expect(container.textContent).toContain('Continue aprendendo');
    expect(titulos()).toContain('Próximo passo em cada grupo');
    expect(titulos()).not.toContain('Em andamento');
    expect(cartaoDe(trilha.code)?.getAttribute('href')).toMatch(new RegExp(`^/licao/${trilha.code}/`));
    expect(cartaoDe(vereda.code)?.getAttribute('href'))
      .toBe(`/vereda/${vereda.code}?licao=${encodeURIComponent(primeira.id)}`);
    expect(container.textContent).toContain('Começar');
  });

  it('não aparece enquanto o painel carrega, mesmo com algo pela metade', () => {
    estado.percurso = { [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]) } };
    desenhar({ carregando: true });
    expect(container.textContent).toBe('');
  });

  it('leva a vereda pela metade direto à próxima lição', () => {
    estado.percurso = { [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]) } };
    desenhar();
    expect(titulos()).toContain('Em andamento');
    expect(container.textContent).toContain(segunda.titulo);
    expect(links()[0]).toBe(`/vereda/${vereda.code}?licao=${encodeURIComponent(segunda.id)}`);
  });

  /* O grupo da vereda pela metade já tem o próximo passo no cartão dela; um
     segundo cartão de "Começar" no mesmo grupo dividiria a pessoa. */
  it('não oferece começar no grupo que já tem algo pela metade', () => {
    estado.percurso = { [vereda.id]: { ...percursoVazio(), licoes: new Set([primeira.id]) } };
    desenhar();
    const doGrupo = [...container.querySelectorAll('a')]
      .filter(a => a.textContent?.includes(`Vereda de ${vereda.familia}`));
    expect(doGrupo).toHaveLength(1);
    expect(doGrupo[0].textContent).toContain('Continuar');
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
