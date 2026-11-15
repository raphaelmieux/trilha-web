// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Faixa from './Faixa';
import CertificadoNaParede from './CertificadoNaParede';
import { gruposDaFaixa } from '../../lib/faixa/catalogoDaFaixa';
import { empacotarFaixa, type PecaPosta } from '../../lib/faixa/empacotarFaixa';
import { estadoDaPeca } from '../../lib/faixa/estadoDaFaixa';
import type { Certification } from '../../types';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* O jsdom não mede SVG; o certificado encolhe o nome pela medida, e aqui
   qualquer nome cabe. */
if (!('getBBox' in SVGElement.prototype)) {
  Object.defineProperty(SVGElement.prototype, 'getBBox', { value: () => ({ x: 0, y: 0, width: 100, height: 20 }) });
}

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
  document.documentElement.classList.remove('imprimindo-token');
});

const faixa = empacotarFaixa(gruposDaFaixa());
const tem = new Set(['ap034_complete', 'lab_web_lab', 'licoes_5']);

describe('a Faixa na tela', () => {
  /* Setecentas paradas de Tab fariam a Faixa impossível de atravessar pelo
     teclado: só a peça acesa é botão. O lugar vazio é imagem com nome, para o
     leitor de tela dizer o que falta ali. */
  it('só a peça conquistada é botão, e toda peça tem nome', () => {
    act(() => root.render(<Faixa faixa={faixa} estado={p => estadoDaPeca(p, tem, [])} aoAbrir={() => {}} />));
    const botoes = container.querySelectorAll('button.fx-peca');
    expect(botoes.length).toBe(3);
    const vazias = container.querySelectorAll('span.fx-peca[role="img"]');
    expect(vazias.length).toBe(faixa.pecas.length - 3);
    for (const el of container.querySelectorAll('.fx-peca')) expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  it('o clique na peça acesa abre o que ela rendeu', () => {
    const aoAbrir = vi.fn();
    act(() => root.render(<Faixa faixa={faixa} estado={p => estadoDaPeca(p, tem, [])} aoAbrir={aoAbrir} />));
    const patch = container.querySelector<HTMLButtonElement>('button[aria-label^="AP034 Internet"]')!;
    act(() => patch.click());
    expect((aoAbrir.mock.calls[0][0] as PecaPosta).token).toBe('AP034');
  });

  /* O segredo vazio não mostra a forma da peça que ele vai virar — o ME006 é
     um patch, e a forma dele seria metade da resposta. */
  it('o segredo vazio mostra só a dica', () => {
    act(() => root.render(<Faixa faixa={faixa} estado={p => estadoDaPeca(p, tem, [])} aoAbrir={() => {}} />));
    const me006 = container.querySelector<HTMLElement>('[aria-label="Segredo ainda não achado. Dica: Sete especialidades dizem mais juntas."]')!;
    expect(me006).toBeTruthy();
    expect(me006.style.width).toBe('58px');
  });

  it('a régua nomeia as quatro zonas na ordem da Faixa', () => {
    act(() => root.render(<Faixa faixa={faixa} estado={() => 'vazia'} aoAbrir={() => {}} />));
    const zonas = [...container.querySelectorAll('.fx-zona')].map(z => z.textContent);
    expect(zonas).toEqual(['Trilhas', 'Escadas', 'Curiosidades', 'Veredas']);
  });
});

describe('o Token.Web() na parede', () => {
  const cert = {
    id: 'c1', user_id: 'u', specialty_id: null, code: 'TW-AAAA-BBBB-CCCC-DDDD', curriculum_code: 'AP034',
    status: 'active', issued_at: '2026-10-02T12:00:00Z', level: 'basico',
  } as unknown as Certification;

  /* Imprimir manda só o certificado para o papel: a classe que a folha de
     impressão lê precisa estar no documento na hora do print, e sair depois,
     senão a próxima impressão da plataforma sairia em branco. */
  it('imprime só o certificado, e devolve a página depois', () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {
      expect(document.documentElement.classList.contains('imprimindo-token')).toBe(true);
    });
    act(() => root.render(<CertificadoNaParede cert={cert} nome="Ana" titulo="AP034 Internet" legenda="Trilha concluída" aoFechar={() => {}} />));
    const botao = [...document.body.querySelectorAll('button')].find(b => b.textContent?.includes('Imprimir'))!;
    act(() => botao.click());
    expect(imprimir).toHaveBeenCalledTimes(1);
    act(() => { window.dispatchEvent(new Event('afterprint')); });
    expect(document.documentElement.classList.contains('imprimindo-token')).toBe(false);
    expect(document.body.querySelector('.fx-para-imprimir svg')).toBeTruthy();
    imprimir.mockRestore();
  });

  /* Revogado não se baixa nem se imprime: a moldura mostra o documento
     apagado, e diz por quê. */
  it('o revogado aparece apagado e sem Baixar nem Imprimir', () => {
    act(() => root.render(<CertificadoNaParede cert={{ ...cert, status: 'revoked' }} nome="Ana" titulo="AP034 Internet" legenda="Trilha concluída" aoFechar={() => {}} />));
    expect(document.body.textContent).toContain('foi revogado');
    expect([...document.body.querySelectorAll('button')].some(b => /Baixar|Imprimir/.test(b.textContent ?? ''))).toBe(false);
  });
});
