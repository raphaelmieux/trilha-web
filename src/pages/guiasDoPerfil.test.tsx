// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/*
  A administração virou guia dentro de Meu Perfil, e isso é conferido.

  Ela saiu da barra de menu para liberar largura, e a troca tem um risco só,
  sempre o mesmo: a página deixar de existir para quem precisava dela. Quem
  administra é uma pessoa no clube inteiro — ninguém percebe por ela, e ela só
  percebe no dia em que precisa revogar um Token.Web().

  A guia acesa sai do **endereço**, e não de um `useState`: `/perfil` e
  `/perfil/admin` são dois endereços, então o botão voltar funciona e o link se
  compartilha. Guardar em estado perderia os dois sem avisar.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({
  profile: { id: 'u1', display_name: 'Ana Rocha', is_admin: false } as unknown,
  signOut: async () => {},
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => auth,
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));
vi.mock('../hooks/useBadges', () => ({ useBadges: () => ({ badges: [], loading: false }) }));

const { default: ProfilePage } = await import('./ProfilePage');

let container: HTMLDivElement;
let root: Root;

const desenhar = (rota: string) => {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/admin" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  auth.profile = { id: 'u1', display_name: 'Ana Rocha', is_admin: false };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const guias = () => [...container.querySelectorAll('[role="tab"]')]
  .map(e => e.textContent?.trim());
const guiaAcesa = () => [...container.querySelectorAll('[role="tab"][aria-selected="true"]')]
  .map(e => e.textContent?.trim());

describe('as guias do perfil', () => {
  /* Uma guia só não é guia: com uma opção, a fileira vira enfeite que ocupa
     altura e não decide nada. */
  it('não desenha fileira de guias para quem não administra', () => {
    desenhar('/perfil');
    expect(guias()).toEqual([]);
    expect(container.textContent).toContain('Dados Pessoais');
  });

  it('mostra as duas para quem administra, com a do perfil acesa', () => {
    auth.profile = { id: 'u1', display_name: 'Raphael Mieux', is_admin: true };
    desenhar('/perfil');
    expect(guias()).toEqual(['Perfil', 'Administração']);
    expect(guiaAcesa()).toEqual(['Perfil']);
    expect(container.textContent).toContain('Dados Pessoais');
  });

  it('abre a administração no endereço dela', () => {
    auth.profile = { id: 'u1', display_name: 'Raphael Mieux', is_admin: true };
    desenhar('/perfil/admin');
    expect(guiaAcesa()).toEqual(['Administração']);
    expect(container.textContent, 'o painel não apareceu na guia dele')
      .toContain('Certificados emitidos');
    /* E o formulário do perfil sai de cena: duas telas empilhadas não são
       guias, são uma página comprida com dois títulos. */
    expect(container.textContent).not.toContain('Dados Pessoais');
  });

  /* Um `h1` por página. Dois dizem ao leitor de tela que começou outra página,
     e repetem na tela o que a guia acesa já diz. */
  it('tem um título só, em qualquer das guias', () => {
    auth.profile = { id: 'u1', display_name: 'Raphael Mieux', is_admin: true };
    for (const rota of ['/perfil', '/perfil/admin']) {
      desenhar(rota);
      const titulos = [...container.querySelectorAll('h1')].map(e => e.textContent?.trim());
      expect(titulos, `${rota} tem mais de um h1`).toEqual(['Meu Perfil']);
    }
  });

  /*
    Quem não administra e digitar o endereço vê o aviso do próprio painel.

    A guia sumir da tela não protege nada — quem protege é a RLS. O que a tela
    deve é explicar, em vez de mostrar um painel vazio com zero em toda linha,
    que é indistinguível de um clube que ainda não certificou ninguém.
  */
  it('explica em vez de mostrar painel vazio a quem não administra', () => {
    desenhar('/perfil/admin');
    expect(container.textContent).toContain('Acesso Restrito');
    expect(container.textContent).not.toContain('Certificados emitidos');
  });
});
