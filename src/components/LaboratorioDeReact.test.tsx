// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeReact, { type AmbienteDoReact } from './LaboratorioDeReact';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { LICOES_DA_CC_FE006, type LicaoDaCcFe006 } from '../labs/metasDaCcFe006';
import { REFERENCIAS_DA_CC_FE006 } from '../labs/referenciasDaCcFe006';
import { compilarReactNoNode, ts } from '../labs/compiladorReactNoNode';
import { analisarReact } from '../labs/analiseReact';
import { bibliotecasNoNode } from '../labs/bibliotecasNoNode';
import { rodarPaginaNoJsdom } from '../labs/paginaNoJsdom';

/*
  O laboratório de React, clicado.

  O motor é conferido em `metasDaCcFe006.test.ts`. O que só a tela pode
  errar é o caminho até lá: o editor escrever no arquivo aberto, o painel de
  Problemas acompanhar a digitação, a conferência compilar cada variante e
  rodar os cenários, e a lista fechar com o mesmo código que fecha a trava.

  O worker e o `iframe` com sandbox não existem no jsdom: a tela recebe o
  mesmo compilador e a mesma página, na mesma thread.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const AMBIENTE: AmbienteDoReact = {
  compilar: async pasta => ({
    react: await compilarReactNoNode(pasta),
    analise: Object.fromEntries(Object.entries(pasta)
      .filter(([n]) => /\.tsx?$/.test(n))
      .map(([n, t]) => [n, analisarReact(ts, t, n)])),
  }),
  bibliotecas: bibliotecasNoNode(),
  rodarCenario: (html, passos) => rodarPaginaNoJsdom(html, passos, 'about:srcdoc'),
};

type Lab = Extract<ReturnType<typeof licoesDaVereda>[number], { tipo: 'react' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe006')!;
const labs = licoesDaVereda(vereda).filter((l): l is Lab => l.tipo === 'react');
const lab = (licao: LicaoDaCcFe006) => labs.find(l => l.licao === licao)!;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeReact vereda={vereda} licao={l} userId="teste" aoVencer={aoVencer} aoSair={() => {}} ambiente={AMBIENTE} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const assentar = async (ms = 900) => {
  await act(async () => { await new Promise(r => setTimeout(r, ms)); });
};
const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const abrir = (nome: string) => act(() => {
  ([...container.querySelectorAll('.ide-arquivo')].find(b => b.querySelector('.truncate')?.textContent === nome) as HTMLButtonElement).click();
});
const escrever = (texto: string) => act(() => {
  const campo = editor();
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const botao = (texto: RegExp) => [...document.body.querySelectorAll('button')]
  .find(b => texto.test(b.textContent ?? '')) as HTMLButtonElement | undefined;
const problemas = () => container.querySelector('[aria-label="Problemas"]')?.textContent ?? '';

async function conferir() {
  await act(async () => { botao(/^\s*Conferir$/)!.click(); });
  for (let i = 0; i < 200 && botao(/Conferindo/); i++) await assentar(50);
}

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

describe('o laboratório de React', () => {
  it('são nove laboratórios na vereda, um por lição do motor', () => {
    expect(labs.map(l => l.licao).sort()).toEqual(Object.keys(LICOES_DA_CC_FE006).sort());
  });

  it('o painel de Problemas mostra o class do mural antes de qualquer conferência', async () => {
    desenhar(lab('declarar'));
    expect(problemas()).toContain('lendo o projeto');
    await assentar(1500);
    expect(problemas()).toMatch(/className/);
    expect(problemas()).toContain('App.tsx [');
    expect(botao(/Faltam/)?.textContent).toMatch(/Faltam 3/);
  }, 30000);

  it('o main.tsx e o index.html abrem só de leitura, e a barra de endereço aceita digitar', async () => {
    desenhar(lab('navegacao'));
    abrir('main.tsx');
    expect(editor().readOnly).toBe(true);
    expect(container.textContent).toContain('chega pronto');
    abrir('index.html');
    expect(editor().readOnly).toBe(true);
    expect(container.querySelector('input[aria-label="Endereço da página"]')).not.toBeNull();
  });

  it.each(Object.keys(LICOES_DA_CC_FE006) as LicaoDaCcFe006[])('%s se vence escrevendo e conferindo', async licao => {
    const aoVencer = desenhar(lab(licao));
    for (const [nome, texto] of Object.entries(REFERENCIAS_DA_CC_FE006[licao].arquivos)) {
      abrir(nome);
      escrever(texto);
    }
    await assentar(1500);
    await conferir();
    const entregar = botao(/Concluir a lição|Faltam/);
    expect(entregar?.textContent).toMatch(/Concluir a lição/);
    await act(async () => { entregar!.click(); });
    expect(aoVencer).toHaveBeenCalledTimes(1);
  }, 90000);

  it('mexer no código depois de conferir pede outra conferência', async () => {
    desenhar(lab('estado'));
    abrir('App.tsx');
    escrever(REFERENCIAS_DA_CC_FE006.estado.arquivos['App.tsx']);
    await assentar(1500);
    await conferir();
    expect(botao(/Concluir a lição/)).toBeDefined();
    escrever(`${REFERENCIAS_DA_CC_FE006.estado.arquivos['App.tsx']}// uma linha a mais\n`);
    await assentar(1500);
    expect(botao(/Faltam 3/)).toBeDefined();
    expect(document.body.textContent).toContain('Clique em Conferir de novo');
  }, 60000);
});
