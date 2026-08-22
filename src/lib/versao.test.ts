// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { haVersaoNova } from './versao';

/*
  Uma aba aberta rodava para sempre o pacote que baixou.

  Um deploy comum muda o código, não o service worker, e o worker era a única
  coisa que disparava recarga. O resultado apareceu do pior jeito possível:
  correções publicadas e conferidas em produção continuaram invisíveis para quem
  estava com o aplicativo aberto, e de dentro parecia que nada tinha sido feito.
*/

const paginaCom = (src: string) => {
  document.head.innerHTML = `<script type="module" crossorigin src="${src}"></script>`;
};

const servidorEntrega = (html: string, ok = true) => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, text: async () => html })));
};

beforeEach(() => {
  document.head.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a conferência de versão', () => {
  it('vê versão nova quando o pacote publicado tem outro nome', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<script type="module" crossorigin src="/trilha-web/assets/index-BBBB2222.js"></script>');

    expect(await haVersaoNova('/trilha-web/')).toBe(true);
  });

  it('não vê nada quando é o mesmo pacote', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<script type="module" crossorigin src="/trilha-web/assets/index-AAAA1111.js"></script>');

    expect(await haVersaoNova('/trilha-web/')).toBe(false);
  });

  /* Um aviso que aparece sem haver atualização ensina a ignorá-lo. Diante de
     qualquer dúvida, a resposta é não. */
  it('não avisa quando a rede falha', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('sem rede'); }));

    expect(await haVersaoNova('/trilha-web/')).toBe(false);
  });

  it('não avisa quando o servidor responde erro', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<html>404</html>', false);

    expect(await haVersaoNova('/trilha-web/')).toBe(false);
  });

  it('não avisa quando o HTML não traz pacote reconhecível', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<html><body>manutenção</body></html>');

    expect(await haVersaoNova('/trilha-web/')).toBe(false);
  });

  it('não avisa quando a própria página não declara pacote', async () => {
    servidorEntrega('<script type="module" src="/trilha-web/assets/index-BBBB2222.js"></script>');

    expect(await haVersaoNova('/trilha-web/')).toBe(false);
  });

  /* O Vite escreve os atributos em ordens diferentes conforme a configuração. */
  it('reconhece o pacote com src antes do type', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<script src="/trilha-web/assets/index-CCCC3333.js" type="module"></script>');

    expect(await haVersaoNova('/trilha-web/')).toBe(true);
  });

  /* Perguntar ao cache é perguntar a quem já está desatualizado. */
  it('pergunta ao servidor sem passar pelo cache', async () => {
    paginaCom('/trilha-web/assets/index-AAAA1111.js');
    servidorEntrega('<script type="module" src="/trilha-web/assets/index-AAAA1111.js"></script>');

    await haVersaoNova('/trilha-web/');

    const [, opcoes] = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(opcoes).toMatchObject({ cache: 'no-store' });
  });
});
