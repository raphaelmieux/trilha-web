// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeHospedagem from './LaboratorioDeHospedagem';
import type { AmbienteDoReact } from './LaboratorioDeReact';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { ENDERECO_DO_SITE, VITE_CONFIG_COM_BASE } from '../labs/hospedagem';
import { compilarReactNoNode, ts } from '../labs/compiladorReactNoNode';
import { analisarReact } from '../labs/analiseReact';
import { bibliotecasNoNode } from '../labs/bibliotecasNoNode';

/*
  A publicação da agenda, clicada.

  O motor é conferido em `hospedagem.test.ts`. O que só a tela pode errar é
  o caminho até lá: a origem do Pages disparar a esteira, o editor do site
  escrever no arquivo aberto, confirmar rodar a esteira de novo, e a barra
  de endereço do site publicado registrar a visita. O `iframe` com sandbox
  não roda nada no jsdom, então as visitas entram pela barra, que é por onde
  o examinador também chega.
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
};

type Lab = Extract<ReturnType<typeof licoesDaVereda>[number], { tipo: 'hospedagem' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe007')!;
const lab = licoesDaVereda(vereda).find((l): l is Lab => l.tipo === 'hospedagem')!;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const desenhar = (aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeHospedagem vereda={vereda} licao={lab} aoVencer={aoVencer} aoSair={() => {}} ambiente={AMBIENTE} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const assentar = async (ms = 50) => {
  await act(async () => { await new Promise(r => setTimeout(r, ms)); });
};
const botao = (texto: RegExp) => [...document.body.querySelectorAll('button')]
  .find(b => texto.test(b.textContent ?? '')) as HTMLButtonElement | undefined;
const clicar = (b: HTMLElement | undefined | null) => act(() => { b!.click(); });
const guia = (nome: string) => clicar([...container.querySelectorAll('.hp-guia')].find(b => b.textContent?.trim() === nome) as HTMLElement);
const origem = (nome: RegExp) => clicar([...container.querySelectorAll('.hp-opcao')]
  .find(l => nome.test(l.textContent ?? ''))!.querySelector('input'));

/** Espera a esteira terminar: o botão de confirmar volta a valer quando ela para. */
async function esperarAEsteira() {
  for (let i = 0; i < 400; i++) {
    await assentar(25);
    if (!container.querySelector('.hp-vazio')?.textContent?.includes('rodando') && !document.body.textContent?.includes('A esteira está rodando')) {
      const radio = container.querySelector<HTMLInputElement>('.hp-opcao input');
      const confirmar = botao(/Confirmar alterações/);
      if ((radio && !radio.disabled) || (confirmar && !confirmar.disabled) || !radio) return;
    }
  }
}

const abrir = (nome: string) => clicar([...container.querySelectorAll('.hp-arquivo')].find(b => b.textContent?.replace(' •', '') === nome) as HTMLElement);
const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const escrever = (texto: string) => act(() => {
  const campo = editor();
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
async function confirmar() {
  await act(async () => { botao(/Confirmar alterações/)!.click(); });
  await esperarAEsteira();
}
const visitar = (endereco: string) => act(() => {
  const campo = container.querySelector<HTMLInputElement>('input[aria-label="Endereço do site"]')!;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(campo, endereco);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
  campo.closest('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
});
const registro = () => container.querySelector('pre[aria-label="Registro da execução"]')?.textContent ?? '';

describe('a publicação da agenda, clicada', () => {
  it('a lição existe na vereda, e a tela abre com as quatro tarefas por fazer', () => {
    expect(lab).toBeDefined();
    desenhar();
    expect(botao(/Faltam 4/)).toBeDefined();
    expect(container.textContent).toContain('Pages');
  });

  it('do Pages desligado ao link público, pelos gestos de quem publica', async () => {
    const aoVencer = desenhar();

    origem(/GitHub Actions/);
    await esperarAEsteira();
    guia('Ações');
    expect(registro()).toMatch(/CartaoDeEvento\.tsx:\d+:\d+ - error TS2339/);

    guia('Código');
    abrir('CartaoDeEvento.tsx');
    escrever(editor().value.replace('evento.lugar', 'evento.local'));
    await confirmar();
    guia('Ações');
    expect(registro()).not.toMatch(/error TS/);

    guia('Código');
    abrir('vite.config.ts');
    escrever(VITE_CONFIG_COM_BASE);
    await confirmar();
    expect(botao(/Faltam 1/)).toBeDefined();

    guia('Site publicado');
    expect(container.querySelector('iframe[title="O site publicado"]')).not.toBeNull();
    visitar(`${ENDERECO_DO_SITE}#/`);
    visitar(`${ENDERECO_DO_SITE}#/evento/campori`);
    visitar(`${ENDERECO_DO_SITE}#/feriados`);

    const concluir = botao(/Concluir a lição/)!;
    expect(concluir.disabled).toBe(false);
    await act(async () => { concluir.click(); });
    expect(aoVencer).toHaveBeenCalled();
  }, 120000);

  it('com a base de fábrica o site abre, e o link não conta', async () => {
    desenhar();
    origem(/GitHub Actions/);
    await esperarAEsteira();
    guia('Código');
    abrir('CartaoDeEvento.tsx');
    escrever(editor().value.replace('evento.lugar', 'evento.local'));
    await confirmar();
    guia('Site publicado');
    visitar(`${ENDERECO_DO_SITE}#/`);
    visitar(`${ENDERECO_DO_SITE}#/evento/campori`);
    visitar(`${ENDERECO_DO_SITE}#/feriados`);
    expect(botao(/Faltam 2/)).toBeDefined();
  }, 120000);

  it('calar o compilador com any deixa a esteira verde e a tarefa do build vermelha', async () => {
    desenhar();
    origem(/GitHub Actions/);
    await esperarAEsteira();
    guia('Código');
    abrir('CartaoDeEvento.tsx');
    escrever(editor().value.replace('evento: Evento;', 'evento: any;'));
    await confirmar();
    guia('Ações');
    expect(registro()).not.toMatch(/error TS/);
    expect(document.body.textContent).toContain('compilador foi calado');
  }, 120000);

  it('publicar a partir do ramo não constrói, e a tela diz o porquê', async () => {
    desenhar();
    origem(/a partir de um ramo/);
    await esperarAEsteira();
    expect(document.body.textContent).toContain('o site sai sem ser construído');
    guia('Site publicado');
    expect(container.querySelector('iframe[title="O site publicado"]')).not.toBeNull();
  }, 120000);
});
