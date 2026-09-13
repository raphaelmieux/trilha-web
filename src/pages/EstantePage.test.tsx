// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { fileirasDaEstante } from '../lib/estante';
import type { Badge } from '../types';

/*
  A estante desenha o que falta, e é aí que ela se distingue de tudo o que
  veio antes.

  Toda tela anterior desenhava só o conquistado, e o conquistado chega do banco
  pronto. Aqui o lugar vazio é desenhado a partir do catálogo em código, e as
  duas formas de errar são caladas: o vazio sumir (a página fica bonita,
  completa, com um buraco que não se vê) e o vazio aparecer no lugar de uma
  insígnia que a pessoa tem (ela abre a estante e não encontra o que ganhou).
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const estado = vi.hoisted(() => ({
  badges: [] as Badge[],
  carregandoBadges: false,
  certs: [] as { id: string; code: string; curriculum_code: string; status: string }[],
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ profile: { id: 'u1', display_name: 'Ana' } }),
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));
vi.mock('../hooks/useBadges', () => ({
  useBadges: () => ({ badges: estado.badges, loading: estado.carregandoBadges }),
}));
vi.mock('../hooks/useCertifications', () => ({
  useCertifications: () => ({ certifications: estado.certs, loading: false }),
}));

const { default: EstantePage } = await import('./EstantePage');

let container: HTMLDivElement;
let root: Root;

const desenhar = () => {
  act(() => { root.render(<MemoryRouter><EstantePage /></MemoryRouter>); });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  estado.badges = [];
  estado.carregandoBadges = false;
  estado.certs = [];
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const TODOS = fileirasDaEstante().flatMap(f => f.lugares);
const TOTAL = TODOS.length;

/** Os desenhos da tela, pelo nome acessível que cada um carrega. */
const rotulos = () => [...container.querySelectorAll('svg[role="img"]')]
  .map(e => e.getAttribute('aria-label') ?? '');
const vazios = () => rotulos().filter(r => r.includes('ainda não conquistada'));
const cheios = () => rotulos().filter(r => r.includes('— conquistada'));

const insignia = (lugar: typeof TODOS[number]): Badge => ({
  id: lugar.code, code: lugar.code, name: lugar.nome,
  description: lugar.descricao, icon: lugar.icone, tier: lugar.classe,
});

describe('a estante mostra o catálogo inteiro', () => {
  it('desenha um lugar para cada insígnia, vazios inclusive', () => {
    desenhar();
    expect(vazios(), 'a estante encolheu para o tamanho do que foi conquistado')
      .toHaveLength(TOTAL);
    expect(container.textContent).toContain(`0 de ${TOTAL} insígnias`);
  });

  /* O lugar preenchido some do vazio e aparece no cheio — e não some dos dois,
     que é o que um filtro a mais faria sem nada reprovar. */
  it('acende o lugar de quem já foi conquistada, sem perder os outros', () => {
    const tres = TODOS.slice(0, 3);
    estado.badges = tres.map(insignia);
    desenhar();

    expect(cheios()).toHaveLength(3);
    expect(vazios()).toHaveLength(TOTAL - 3);
    expect(container.textContent).toContain(`3 de ${TOTAL} insígnias`);
    for (const l of tres) {
      expect(rotulos()).toContain(`${l.nome} — conquistada`);
    }
  });

  /* Cada fileira diz quantos dos seus já vieram. Um contador que somasse a
     estante inteira em toda fileira pareceria certo e não diria nada. */
  it('conta por fileira, e não a estante toda em cada uma', () => {
    const requisitos = fileirasDaEstante().find(f => f.chave === 'requisitos')!;
    estado.badges = requisitos.lugares.slice(0, 2).map(insignia);
    desenhar();

    const contadores = [...container.querySelectorAll('section span.tabular-nums')]
      .map(e => e.textContent?.trim());
    expect(contadores[0]).toBe(`2/${requisitos.lugares.length}`);
    expect(contadores.filter(c => c?.startsWith('0/')).length).toBeGreaterThan(5);
  });

  it('mostra o nome de cada fileira', () => {
    desenhar();
    for (const f of fileirasDaEstante()) {
      expect(container.textContent, `a fileira "${f.titulo}" sumiu`).toContain(f.titulo);
    }
  });
});

describe('os Token.Web()', () => {
  it('convida quem não tem nenhum, em vez de mostrar vazio', () => {
    desenhar();
    expect(container.textContent).toContain('O primeiro sai sozinho');
  });

  it('mostra o ativo, com link para o documento', () => {
    estado.certs = [{ id: 'c1', code: 'TW-ABC123', curriculum_code: 'AP034', status: 'active' }];
    desenhar();
    const links = [...container.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    expect(links, 'o cartão do certificado não leva ao documento')
      .toContain('/certificado/TW-ABC123');
  });

  /*
    Revogado não entra.

    A conferência do servidor só enxerga os ativos, e mostrar um revogado como
    conquista desfaria na tela a decisão que a liderança tomou — sem que
    ninguém na liderança visse.
  */
  it('não exibe certificado revogado', () => {
    estado.certs = [{ id: 'c1', code: 'TW-REVOGADO', curriculum_code: 'AP034', status: 'revoked' }];
    desenhar();
    const links = [...container.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    expect(links).not.toContain('/certificado/TW-REVOGADO');
    expect(container.textContent).toContain('O primeiro sai sozinho');
  });
});

describe('enquanto carrega', () => {
  /* Estante vazia e estante carregando não podem ter a mesma cara: uma diz
     "você não tem nada", a outra diz "ainda não sei". */
  it('diz que está abrindo, em vez de mostrar 0 de 132', () => {
    estado.carregandoBadges = true;
    desenhar();
    expect(container.textContent).toContain('Abrindo a estante');
    expect(container.textContent).not.toContain(`0 de ${TOTAL}`);
  });
});
