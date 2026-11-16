// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

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

/*
  A Estante virou a Faixa, e o endereço antigo continua respondendo.

  O aviso de conquista, o favorito e o botão voltar do navegador apontam para
  `/estante` há meses. Endereço que some sem redirecionar cai no `*` e manda
  para o painel quem foi ver as próprias insígnias, sem dizer por quê. Já o
  link escrito numa tela é outra coisa: ele aponta para o endereço de hoje,
  senão cada clique passa pelo desvio e o antigo nunca pode ser aposentado.
*/
describe('a Faixa no lugar da Estante', () => {
  const fonteDoApp = readFileSync(resolve(__dirname, 'App.tsx'), 'utf8');

  it('/estante leva para /faixa', () => {
    expect(fonteDoApp).toMatch(/path="\/estante" element=\{<Navigate to="\/faixa" replace \/>\}/);
  });

  it('o menu leva à Faixa', () => {
    expect(fonteDoApp).toContain("{ to: '/faixa', label: 'Faixa'");
  });

  it('nenhuma tela escreve um link para /estante', () => {
    const arquivos: string[] = [];
    const varrer = (pasta: string) => {
      for (const nome of readdirSync(pasta)) {
        const caminho = join(pasta, nome);
        if (statSync(caminho).isDirectory()) varrer(caminho);
        else if (/\.tsx?$/.test(nome) && !/\.test\.tsx?$/.test(nome)) arquivos.push(caminho);
      }
    };
    varrer(__dirname);
    /* A guarda contra o vazio: uma varredura que não achasse arquivo nenhum
       aprovaria qualquer coisa. */
    expect(arquivos.length).toBeGreaterThan(100);
    const comLink = arquivos.filter(a => /to=["'{]+\/estante|navigate\(['"]\/estante/.test(readFileSync(a, 'utf8')));
    expect(comLink, 'estas telas ainda mandam para o endereço antigo').toEqual([]);
  });
});

/*
  A ordem do menu é decisão do dono da plataforma, e mudar um item de lugar
  não estoura nada — a barra continua funcionando, só que na ordem que ninguém
  escolheu. A Trilha Atual é contextual e mora colada no Início, fora da conta.
*/
describe('a ordem do menu', () => {
  it('é Início, Faixa, Relatório, Verificar e Ranking', () => {
    const fonte = readFileSync(resolve(__dirname, 'App.tsx'), 'utf8');
    const bloco = fonte.match(/const NAV_ITEMS = \[([\s\S]*?)\];/)?.[1] ?? '';
    const rotulos = [...bloco.matchAll(/label: '([^']+)'/g)].map(m => m[1]);
    expect(rotulos.filter(r => r !== 'Trilha Atual')).toEqual(['Início', 'Faixa', 'Relatório', 'Verificar', 'Ranking']);
    expect(rotulos.indexOf('Trilha Atual')).toBe(1);
  });
});
