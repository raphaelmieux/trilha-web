// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeDart from './LaboratorioDeDart';
import { VEREDAS, licoesDaVereda, type LicaoDeVereda } from '../curriculum/veredas';
import { SOLUCOES_DE_DART } from '../labs/referenciasDaCcMb001';

/*
  O laboratório de Dart, clicado.

  O motor é conferido em `dartSimulado.test.ts` e as soluções em
  `laboratoriosDeDart.test.ts`. O que só a tela pode errar é o que se mede
  aqui: o terminal mostrar o `dart run` e, com erro de compilação, nenhuma
  linha de saída; a entrada chegar ao `readLineSync`; o segundo arquivo da
  pasta ser editável e entrar na execução; e a lista envelhecer quando o
  código muda.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Lab = Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-mb001')!;
const lab = (id: string) => licoesDaVereda(vereda).find(l => l.id === id) as Lab;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeDart vereda={vereda} licao={l} userId="teste" aoVencer={aoVencer} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const editor = () => container.querySelector('.ide textarea:not(.dt-entrada)') as HTMLTextAreaElement;
const abrir = (nome: string) => act(() => {
  ([...container.querySelectorAll('.ide-arquivo')].find(b => b.textContent?.trim() === nome) as HTMLButtonElement).click();
});
const escreverEm = (campo: HTMLTextAreaElement, texto: string) => act(() => {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const executar = async () => {
  await act(async () => { (container.querySelector('.dt-barra button') as HTMLButtonElement).click(); });
  for (let i = 0; i < 20 && container.querySelector('.dt-barra button')?.textContent?.includes('Rodando'); i++) {
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  }
};
const terminal = () => container.querySelector('.dt-terminal')?.textContent ?? '';
const botaoDeEntregar = () => [...document.body.querySelectorAll('button')]
  .find(b => /Entregar|Execute de novo|Faltam/.test(b.textContent ?? '')) as HTMLButtonElement | undefined;

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

describe('o laboratório de Dart', () => {
  it('com erro de compilação, o terminal mostra o erro e nenhuma linha de saída', async () => {
    desenhar(lab('m1-lab'));
    await executar();
    expect(terminal()).toContain('dart run clube.dart');
    expect(terminal()).toContain("clube.dart:14:15: Error: A value of type 'String' can't be assigned to a variable of type 'int'.");
    expect(terminal()).not.toContain('Acampamento de Inverno');
  });

  it('a entrada chega ao readLineSync, e a solução se entrega', async () => {
    const aoVencer = desenhar(lab('m3-lab'));
    expect(container.querySelector('.dt-entrada')).not.toBeNull();
    escreverEm(editor(), SOLUCOES_DE_DART['m3-lab']['clube.dart']);
    await executar();
    expect(terminal()).toContain('Olá, VISITANTE!');
    expect(botaoDeEntregar()?.textContent).toContain('Entregar');
    await act(async () => { botaoDeEntregar()!.click(); });
    expect(aoVencer).toHaveBeenCalled();
  });

  it('mudar a entrada envelhece a lista', async () => {
    desenhar(lab('m3-lab'));
    escreverEm(editor(), SOLUCOES_DE_DART['m3-lab']['clube.dart']);
    await executar();
    escreverEm(container.querySelector('.dt-entrada') as HTMLTextAreaElement, 'Tigrão');
    expect(botaoDeEntregar()?.textContent).toContain('Execute de novo');
  });

  it('o segundo arquivo se escreve e entra na execução', async () => {
    desenhar(lab('m7-lab'));
    escreverEm(editor(), SOLUCOES_DE_DART['m7-lab']['clube.dart']);
    abrir('unidade.dart');
    escreverEm(editor(), SOLUCOES_DE_DART['m7-lab']['unidade.dart']);
    await executar();
    expect(terminal()).toContain('Mais velho: 14 anos');
    expect(botaoDeEntregar()?.textContent).toContain('Entregar');
  });
});
