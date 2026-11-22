// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeDom from './LaboratorioDeDom';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { LICOES_DA_CC_FE004, type LicaoDaCcFe004 } from '../labs/metasDaCcFe004';
import { OLHOU, SOLUCOES } from '../labs/referenciasDaCcFe004';
import { rodarPaginaNoJsdom } from '../labs/paginaNoJsdom';
import { FONTE_DA_PAGINA } from '../labs/paginaViva';

/*
  O laboratório de DOM, clicado.

  O motor é conferido em `metasDaCcFe004.test.ts`, que roda os cenários de
  cada lição no jsdom. O que só a tela pode errar é o caminho até lá: o
  editor escrever no arquivo que está aberto, o Conferir rodar os cenários
  sobre o que está escrito agora, a lista envelhecer quando o código muda, e
  a lição de ferramentas fechar pelo que a página contou — a inspeção e a
  passagem pela parada.

  O jsdom não roda o `srcdoc` de um `iframe` com sandbox, e por isso a
  conferência recebe aqui o executor do jsdom, com a mesma página montada
  dentro. Na lição de ferramentas, o que a prévia contaria chega como a
  mensagem que ela mandaria.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Lab = Extract<ReturnType<typeof licoesDaVereda>[number], { tipo: 'dom' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe004')!;
const labs = licoesDaVereda(vereda).filter((l): l is Lab => l.tipo === 'dom');
const lab = (licao: LicaoDaCcFe004) => labs.find(l => l.licao === licao)!;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeDom vereda={vereda} licao={l} userId="teste" aoVencer={aoVencer} aoSair={() => {}}
          rodarCenario={rodarPaginaNoJsdom} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const abrir = (nome: string) => act(() => {
  ([...container.querySelectorAll('.ide-arquivo')].find(b => b.textContent?.trim() === nome) as HTMLButtonElement).click();
});
const escrever = (texto: string) => act(() => {
  const campo = editor();
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const botao = (padrao: RegExp) => [...document.body.querySelectorAll('button')]
  .find(b => padrao.test(b.textContent ?? '')) as HTMLButtonElement | undefined;
const conferir = async () => {
  await act(async () => { botao(/^\s*Conferir$/)!.click(); });
  for (let i = 0; i < 200 && botao(/Conferindo/); i++) {
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  }
};
const entregar = () => botao(/Concluir a lição|Faltam/);

/** Escreve a solução em cada arquivo que a lição deixa editar. */
const escreverSolucao = (licao: LicaoDaCcFe004) => {
  const def = LICOES_DA_CC_FE004[licao];
  for (const nome of def.editaveis) {
    if (SOLUCOES[licao][nome] === def.arquivos[nome]) continue;
    abrir(nome);
    escrever(SOLUCOES[licao][nome]);
  }
};

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

describe('o laboratório de DOM', () => {
  it('são nove laboratórios na vereda, um por lição do motor', () => {
    expect(labs.map(l => l.licao).sort()).toEqual(Object.keys(LICOES_DA_CC_FE004).sort());
  });

  it('abre com a lista inteira por fazer, mesmo depois de conferir o modelo', async () => {
    desenhar(lab('mudar'));
    expect(entregar()?.textContent).toMatch(/Faltam 4/);
    await conferir();
    expect(entregar()?.textContent).toMatch(/Faltam 4/);
    expect(entregar()?.disabled).toBe(true);
  }, 30000);

  const sem = (Object.keys(LICOES_DA_CC_FE004) as LicaoDaCcFe004[]).filter(l => l !== 'ferramentas');
  it.each(sem)('%s se vence escrevendo no editor e conferindo', async licao => {
    const aoVencer = desenhar(lab(licao));
    escreverSolucao(licao);
    await conferir();
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
    await act(async () => { entregar()!.click(); });
    expect(aoVencer).toHaveBeenCalledTimes(1);
  }, 60000);

  it('o arquivo só de leitura não aceita o que se escreve', () => {
    desenhar(lab('juntos'));
    const def = LICOES_DA_CC_FE004.juntos;
    const fixo = Object.keys(def.arquivos).find(n => !def.editaveis.includes(n));
    if (!fixo) return;
    abrir(fixo);
    expect(editor().readOnly).toBe(true);
  });

  it('mexer no código depois de conferir envelhece a lista', async () => {
    desenhar(lab('achar'));
    escreverSolucao('achar');
    await conferir();
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
    abrir('script.js');
    escrever(`${SOLUCOES.achar['script.js']}\n// mais uma linha\n`);
    expect(entregar()?.textContent).toMatch(/Faltam/);
    expect(document.body.textContent).toContain('O código mudou depois da última conferência');
  }, 60000);

  it('a lição de ferramentas fecha pelo que a página contou, e não só pelo conserto', async () => {
    desenhar(lab('ferramentas'));
    escreverSolucao('ferramentas');
    await conferir();
    /* O conserto está feito; faltam as duas coisas que só olhando se fazem. */
    expect(entregar()?.textContent).toMatch(/Faltam 2/);

    const previa = container.querySelector('iframe[title="A página"]') as HTMLIFrameElement;
    const contar = (dado: Record<string, unknown>) => act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { fonte: FONTE_DA_PAGINA, ...dado }, source: previa.contentWindow,
      }));
    });
    contar({ tipo: 'escolhido', id: 1, arvore: null, detalhes: OLHOU.inspecionados[0] });
    expect(entregar()?.textContent).toMatch(/Faltam 1/);
    contar({ tipo: 'parada', parada: OLHOU.paradas[0] });
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
  }, 60000);

  it('o que chega de outra janela não conta como descoberta', async () => {
    desenhar(lab('ferramentas'));
    escreverSolucao('ferramentas');
    await conferir();
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { fonte: FONTE_DA_PAGINA, tipo: 'parada', parada: OLHOU.paradas[0] },
      }));
    });
    expect(entregar()?.textContent).toMatch(/Faltam 2/);
  }, 60000);
});
