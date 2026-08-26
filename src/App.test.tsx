// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/*
  A guarda das telas de entrar.

  /login, /cadastro e /recuperar-senha eram rotas abertas, sem guarda nenhuma.
  Para quem chega de fora isso está certo; para quem já entrou, não: a pessoa
  com sessão aberta que caísse numa delas — atalho antigo, botão voltar do
  navegador, endereço digitado — via o formulário de login com a barra de menu
  do aplicativo em cima, e um "Sair" logo acima do campo que pedia a senha dela.

  O teste existe porque o sintoma some quando se olha deslogado, que é como se
  abre o aplicativo para conferir. Sem sessão a barra já não aparecia, e a tela
  parecia certa.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ session: null as unknown, loading: false }));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => auth,
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));

const { RotaDeVisitante } = await import('./App');

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  auth.session = null;
  auth.loading = false;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function abrirLogin() {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<RotaDeVisitante><p>formulário de login</p></RotaDeVisitante>} />
          <Route path="/" element={<p>painel</p>} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

describe('a tela de login', () => {
  it('aparece para quem ainda não entrou', () => {
    abrirLogin();
    expect(container.textContent).toContain('formulário de login');
  });

  /* O sintoma relatado: barra de menu junto do formulário. Com sessão a pessoa
     não chega mais ao formulário — vai para o painel, que é onde ela já estava
     autorizada a estar. */
  it('não aparece para quem já está com a sessão aberta', () => {
    auth.session = { user: { id: 'alguem' } };
    abrirLogin();
    expect(container.textContent).toContain('painel');
    expect(container.textContent).not.toContain('formulário de login');
  });

  /* Sem esta espera o formulário pisca antes de a sessão guardada ser lida, e
     some sozinho em seguida — o que parece defeito para quem vê. */
  it('espera a sessão ser lida antes de decidir', () => {
    auth.loading = true;
    abrirLogin();
    expect(container.textContent).toContain('Carregando');
    expect(container.textContent).not.toContain('formulário de login');
  });
});
