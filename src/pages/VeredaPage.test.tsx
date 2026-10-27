// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { veredasAbertas, licoesDaVereda } from '../curriculum/veredas';

/*
  A lição da vereda abre pelo endereço — `?licao=<id>`.

  É a porta do "Continue de onde parou": o cartão do painel diz qual é a
  próxima lição e leva até ela. Se a página parar de ler o parâmetro, nada
  estoura — o cartão leva à lista de lições, que é uma tela certa, e a pessoa
  procura de novo a lição que acabou de ler no cartão. É esse o defeito que
  esta trava existe para pegar.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ profile: { id: 'u1', display_name: 'Ana' } }),
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}));
vi.mock('../hooks/useVeredas', () => ({
  useVeredas: () => ({
    percursoDe: () => undefined, concluida: () => true,
    recarregar: async () => {}, carregando: false, andamento: [],
  }),
}));
vi.mock('../hooks/useCertifications', () => ({
  useCertifications: () => ({
    certifications: [], getByCurriculum: () => undefined, loading: false, refresh: async () => {},
  }),
}));
/* A teoria de verdade sorteia questões e fala com o banco; aqui só importa
   qual lição chegou aberta e o caminho de saída. */
vi.mock('../components/TeoriaDaVereda', () => ({
  default: ({ licao, aoSair }: { licao: { id: string }; aoSair: () => void }) => (
    <div data-teoria={licao.id}><button onClick={aoSair}>Sair da lição</button></div>
  ),
}));

const { default: VeredaPage } = await import('./VeredaPage');

/* Uma vereda que dependa de outra também serviria — `concluida` responde sim —,
   mas a primeira aberta com teoria basta. */
const vereda = veredasAbertas().find(v => licoesDaVereda(v).some(l => l.tipo === 'teoria'))!;
const teoria = licoesDaVereda(vereda).find(l => l.tipo === 'teoria')!;

let container: HTMLDivElement;
let root: Root;
let endereco = '';

function Endereco() {
  const l = useLocation();
  endereco = l.pathname + l.search;
  return null;
}

const abrir = (url: string) => {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[url]}>
        <Routes><Route path="/vereda/:code" element={<><VeredaPage /><Endereco /></>} /></Routes>
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('a lição da vereda pelo endereço', () => {
  it('existe uma vereda aberta com teoria para conferir', () => {
    expect(vereda).toBeDefined();
    expect(teoria).toBeDefined();
  });

  it('abre a lição nomeada em ?licao=', () => {
    abrir(`/vereda/${vereda.code}?licao=${teoria.id}`);
    expect(container.querySelector(`[data-teoria="${teoria.id}"]`)).not.toBeNull();
  });

  it('sem o parâmetro, abre a lista de lições', () => {
    abrir(`/vereda/${vereda.code}`);
    expect(container.querySelector('[data-teoria]')).toBeNull();
    expect(container.textContent).toContain(teoria.titulo);
  });

  /* Senão recarregar a página reabriria a lição de que a pessoa acabou de
     sair, e ela não teria como ficar na lista. */
  it('ao sair, tira a lição do endereço e mostra a lista', async () => {
    abrir(`/vereda/${vereda.code}?licao=${teoria.id}`);
    const sair = [...container.querySelectorAll('button')].find(b => b.textContent === 'Sair da lição')!;
    await act(async () => { sair.click(); });
    expect(container.querySelector('[data-teoria]')).toBeNull();
    expect(endereco).toBe(`/vereda/${vereda.code}`);
  });

  it('id desconhecido não abre nada, e a lista aparece', () => {
    abrir(`/vereda/${vereda.code}?licao=nao-existe`);
    expect(container.querySelector('[data-teoria]')).toBeNull();
    expect(container.textContent).toContain(teoria.titulo);
  });
});
