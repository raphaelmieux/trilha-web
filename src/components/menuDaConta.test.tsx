// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

/*
  Perfil e Administração saíram da barra de menu, e por isso são conferidos.

  A barra tem largura, e cada item novo tira espaço de outro. Os dois foram
  para trás do nome da pessoa — o gesto que ela já traz de qualquer aplicativo
  — e a administração virou guia dentro do perfil. O risco de mexer nisso é
  sempre o mesmo: **tirar da barra e não pôr em lugar nenhum**. A tela fica
  mais limpa, nada estoura, e a página some para quem precisava dela.

  Quem administra é uma pessoa no clube inteiro, então ninguém percebe por ela.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({
  session: { user: { id: 'u1' } } as unknown,
  profile: { display_name: 'Ana Rocha', is_admin: false } as unknown,
  loading: false,
  signOut: () => {},
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => auth,
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));

const { NavBar } = await import('../App');

let container: HTMLDivElement;
let root: Root;

const desenhar = (rota = '/') => {
  act(() => {
    root.render(<MemoryRouter initialEntries={[rota]}><NavBar /></MemoryRouter>);
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  auth.session = { user: { id: 'u1' } };
  auth.profile = { display_name: 'Ana Rocha', is_admin: false };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** Os destinos de todo link da barra, incluindo os que estão dentro do menu. */
const destinos = () => [...container.querySelectorAll('a[href]')]
  .map(a => a.getAttribute('href'));

const botaoDoNome = () =>
  container.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement | null;

describe('o menu atrás do nome', () => {
  it('mostra o primeiro nome, e não a barra cheia de itens de conta', () => {
    desenhar();
    expect(botaoDoNome()?.textContent, 'o nome não abre o menu da conta').toContain('Ana');
    /* Fechado, ele não despeja os destinos na barra — é isso que libera a
       largura que a estante de troféus vai ocupar. */
    expect(destinos()).not.toContain('/perfil');
  });

  it('leva ao perfil quando aberto', () => {
    desenhar();
    act(() => botaoDoNome()!.click());
    expect(destinos(), 'o perfil ficou inalcançável').toContain('/perfil');
  });

  /* Sem perfil carregado o menu ainda abre: é justamente a hora em que sair
     precisa funcionar. */
  it('abre mesmo se o perfil não carregou', () => {
    auth.profile = null;
    desenhar();
    expect(botaoDoNome()).toBeTruthy();
    act(() => botaoDoNome()!.click());
    expect(destinos()).toContain('/perfil');
  });
});

describe('a administração', () => {
  it('não aparece para quem não administra', () => {
    desenhar();
    act(() => botaoDoNome()!.click());
    expect(destinos()).not.toContain('/perfil/admin');
  });

  it('aparece no menu para quem administra', () => {
    auth.profile = { display_name: 'Raphael Mieux', is_admin: true };
    desenhar();
    act(() => botaoDoNome()!.click());
    expect(destinos(), 'quem administra perdeu o caminho do painel')
      .toContain('/perfil/admin');
  });

  /* Ela saiu da barra, e sair da barra não pode virar sair da plataforma. */
  it('continua fora da barra mesmo para quem administra', () => {
    auth.profile = { display_name: 'Raphael Mieux', is_admin: true };
    desenhar();
    expect(destinos()).not.toContain('/admin');
    expect(destinos()).not.toContain('/perfil/admin');
  });
});

describe('a barra', () => {
  /* O que continua nela é o que é de todo mundo — e é onde a estante de
     troféus vai entrar. Esta trava existe para a próxima mudança não levar
     junto um item que ninguém pediu para tirar. */
  it('mantém os caminhos comuns à vista', () => {
    desenhar();
    for (const rota of ['/', '/relatorio', '/ranking', '/verificar']) {
      expect(destinos(), `${rota} sumiu da barra`).toContain(rota);
    }
  });

  it('some inteira para quem não entrou', () => {
    auth.session = null;
    desenhar();
    expect(container.textContent).toBe('');
  });
});
