// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import type { Certification } from '../types';

/*
  O Token.Web() da vereda sai sozinho — e o que a decisão antiga temia continua
  coberto.

  Era um botão, e o botão fazia uma coisa que ninguém via: a vereda ficava
  concluída, o prêmio parado atrás de um clique, e quem terminou não tinha razão
  para saber que ele existia. A razão de o botão existir era boa — o pedido
  atravessa a rede, e falhar em silêncio na hora da vitória é a pior hora —, e é
  ela que estes testes guardam agora que não há mais clique: a falha aparece
  escrita e se tenta de novo.

  E duas coisas que só a emissão automática pode estragar: pedir duas vezes ao
  mesmo tempo, que daria dois certificados ativos do mesmo percurso, e devolver
  sozinha um documento que a liderança revogou.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const sessao = vi.hoisted(() => ({
  atual: { access_token: 'token-de-teste' } as unknown,
}));

vi.mock('../lib/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: sessao.atual } }) } },
}));

const { default: TokenDaVereda } = await import('./TokenDaVereda');
const { veredasAbertas } = await import('../curriculum/veredas');

const vereda = veredasAbertas()[0];

const token = (status: 'active' | 'revoked'): Certification => ({
  id: 'id-do-certificado',
  code: 'TW-AAAA-BBBB-CCCC-DDDD',
  hash: 'hash',
  level: 'basico',
  curriculum_code: vereda.code,
  curriculum_version: '1.0',
  status,
  issued_at: '2026-01-01T00:00:00Z',
  user_id: 'quem-estuda',
});

let container: HTMLDivElement;
let root: Root;
let pedidos: RequestInit[];

/** Uma resposta do servidor de emissão, do jeito que a Edge Function devolve. */
const respondendo = (resposta: { ok: boolean; corpo: unknown }) =>
  vi.fn(async (_url: string, init: RequestInit) => {
    pedidos.push(init);
    return { ok: resposta.ok, json: async () => resposta.corpo } as Response;
  });

/* Dentro do `StrictMode`, como o aplicativo roda: ele monta, desmonta e remonta
   cada componente de propósito, e é justamente essa remontagem que faria a
   emissão automática pedir duas vezes. */
const montar = async (tokens: Certification[] = []) => {
  await act(async () => {
    root.render(
      <StrictMode>
        <MemoryRouter>
          <TokenDaVereda vereda={vereda} userId="quem-estuda" tokens={tokens} aoEmitir={() => {}} />
        </MemoryRouter>
      </StrictMode>,
    );
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  pedidos = [];
  sessao.atual = { access_token: 'token-de-teste' };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe('o Token.Web() da vereda sai sem ninguém pedir', () => {
  it('emite ao aparecer, e não espera clique nenhum', async () => {
    vi.stubGlobal('fetch', respondendo({ ok: true, corpo: { success: true, code: 'TW-1' } }));
    await montar();

    expect(pedidos).toHaveLength(1);
    const corpo = JSON.parse(String(pedidos[0].body));
    expect(corpo).toMatchObject({
      userId: 'quem-estuda',
      specialtyCode: vereda.code,
      tipo: 'vereda',
      veredaId: vereda.id,
      /* Vereda não tem grau: grava o lado que reivindica menos. */
      level: 'basico',
    });
    expect(container.textContent).not.toContain('Emitir');
  });

  /* Duas emissões ao mesmo tempo passariam as duas pela conferência de "já
     existe?" do servidor, que é uma leitura seguida de uma escrita. O
     `StrictMode` monta cada componente duas vezes de propósito. */
  it('não pede duas vezes quando a tela repinta', async () => {
    vi.stubGlobal('fetch', respondendo({ ok: true, corpo: { success: true, code: 'TW-1' } }));
    await montar();
    await montar();
    await montar();

    expect(pedidos).toHaveLength(1);
  });

  it('não pede nada quando o certificado já existe', async () => {
    vi.stubGlobal('fetch', respondendo({ ok: true, corpo: { success: true, code: 'TW-1' } }));
    await montar([token('active')]);

    expect(pedidos).toHaveLength(0);
    expect(container.textContent).toContain('TW-AAAA-BBBB-CCCC-DDDD');
  });

  /* Revogar é decisão de gente. Emitir sozinho olhando só para o ativo devolvia
     um certificado novo a cada visita — abrir a vereda desfazia a revogação. */
  it('não devolve sozinho um Token.Web() que foi revogado', async () => {
    vi.stubGlobal('fetch', respondendo({ ok: true, corpo: { success: true, code: 'TW-1' } }));
    await montar([token('revoked')]);

    expect(pedidos).toHaveLength(0);
    expect(container.textContent).toContain('revogado');
  });
});

describe('a falha aparece escrita, e se tenta de novo', () => {
  const clicarEmTentarDeNovo = async () => {
    const botao = [...container.querySelectorAll('button')]
      .find(b => b.textContent?.includes('Tentar de novo'));
    expect(botao).toBeTruthy();
    await act(async () => { botao!.click(); });
  };

  it('mostra o recado do servidor quando ele recusa', async () => {
    vi.stubGlobal('fetch', respondendo({ ok: false, corpo: { error: 'Vereda ainda não concluída.' } }));
    await montar();

    expect(container.textContent).toContain('Vereda ainda não concluída.');
    await clicarEmTentarDeNovo();
    expect(pedidos).toHaveLength(2);
  });

  it('mostra a queda da rede em vez de sumir', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await montar();

    expect(container.textContent).toContain('Erro de conexão');
    expect(container.textContent).toContain('está guardado');
  });

  it('diz que a sessão caiu, em vez de pedir sem credencial', async () => {
    sessao.atual = null;
    const chamadas = respondendo({ ok: true, corpo: { success: true, code: 'TW-1' } });
    vi.stubGlobal('fetch', chamadas);
    await montar();

    expect(pedidos).toHaveLength(0);
    expect(container.textContent).toContain('Sessão expirada');
  });
});
