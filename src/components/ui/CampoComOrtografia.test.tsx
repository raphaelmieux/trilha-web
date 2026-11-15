// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import CampoComOrtografia from './CampoComOrtografia';
import { instalarCorretor } from '../../labs/ortografia';
import { palavrasDoDicionario, recarregarDicionario, tirarDoDicionario, acrescentarAoDicionario } from '../../lib/dicionarioPessoal';

/*
  O campo que substitui o textarea onde se escreve texto corrido.

  Por fora ele precisa se comportar como o textarea — o valor que entra é o que
  se vê, o que se digita volta como texto puro, e uma mudança de fora ("Montar
  de novo") reescreve —, e por dentro ele passa pelo corretor da plataforma, que
  é a razão de existir. No jsdom não há API de destaque nem
  `caretRangeFromPoint`: as duas entram de mentira, e o que se confere é o que
  o campo faz com elas.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let gravado = '';
let trocarDeFora: (t: string) => void = () => {};
const pintadas = new Set<AbstractRange>();

function Formulario({ inicial }: { inicial: string }) {
  const [texto, setTexto] = useState(inicial);
  trocarDeFora = setTexto;
  return <CampoComOrtografia value={texto} onChange={t => { gravado = t; setTexto(t); }} placeholder="Escreva aqui" rotulo="Resposta" />;
}

const campo = () => container.querySelector<HTMLElement>('[role="textbox"]')!;
const montar = (inicial: string) => act(() => { root.render(<Formulario inicial={inicial} />); });
const palavrasPintadas = () => [...pintadas].map(r => r.toString()).filter(Boolean).sort();

beforeEach(() => {
  gravado = '';
  pintadas.clear();
  vi.stubGlobal('CSS', { highlights: new Map() });
  vi.stubGlobal('Highlight', class extends Set<AbstractRange> {
    add(r: AbstractRange) { pintadas.add(r); return super.add(r); }
    delete(r: AbstractRange) { pintadas.delete(r); return super.delete(r); }
  });
  recarregarDicionario();
  instalarCorretor({
    confere: p => ['Levar', 'lanterna', 'e', 'no', 'acampamento'].includes(p) || palavrasDoDicionario().has(p),
    sugere: p => (p === 'acampamneto' ? ['acampamento'] : []),
    acrescentar: acrescentarAoDicionario,
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  instalarCorretor(null);
  vi.unstubAllGlobals();
  tirarDoDicionario('Sobradinho');
  Reflect.deleteProperty(document, 'caretRangeFromPoint');
});

describe('o campo de texto com a ortografia da plataforma', () => {
  it('é um campo de texto para quem lê a tela, sem o corretor do navegador', () => {
    montar('');
    expect(campo().getAttribute('aria-label')).toBe('Resposta');
    expect(campo().getAttribute('aria-multiline')).toBe('true');
    expect(campo().getAttribute('spellcheck')).toBe('false');
    expect(campo().dataset.vazio, 'vazio, o convite cinza não aparece').toBe('sim');
  });

  it('o que se digita volta como texto, com as quebras de linha', () => {
    montar('');
    act(() => {
      campo().textContent = 'Levar lanterna\nno acampamento';
      campo().dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(gravado).toBe('Levar lanterna\nno acampamento');
    expect(campo().dataset.vazio).toBeUndefined();
  });

  it('uma mudança vinda de fora reescreve o campo', () => {
    montar('Levar lanterna');
    act(() => { trocarDeFora('Um texto montado de novo'); });
    expect(campo().textContent).toBe('Um texto montado de novo');
  });

  it('sublinha com o corretor da plataforma, e a sugestão volta pelo onChange', async () => {
    montar('Levar lanterna no acampamneto');
    expect(palavrasPintadas()).toEqual(['acampamneto']);
    const no = campo().firstChild as Text;
    Object.defineProperty(document, 'caretRangeFromPoint', {
      configurable: true,
      value: () => { const r = document.createRange(); r.setStart(no, no.data.indexOf('acampamneto') + 2); return r; },
    });
    act(() => { campo().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 })); });
    const sugestao = [...document.querySelectorAll<HTMLButtonElement>('.ort-menu button')].find(b => b.textContent === 'acampamento');
    expect(sugestao, 'o botão direito na palavra sublinhada não sugeriu nada').toBeTruthy();
    await act(async () => { sugestao!.click(); });
    expect(gravado).toBe('Levar lanterna no acampamento');
    expect(palavrasPintadas()).toEqual([]);
  });

  it('a palavra do dicionário pessoal não é sublinhada, e tirá-la de lá devolve o vermelho', () => {
    montar('Levar lanterna Sobradinho');
    expect(palavrasPintadas()).toEqual(['Sobradinho']);
    act(() => { acrescentarAoDicionario('Sobradinho'); });
    expect(palavrasPintadas()).toEqual([]);
    act(() => { tirarDoDicionario('Sobradinho'); });
    expect(palavrasPintadas()).toEqual(['Sobradinho']);
  });
});
