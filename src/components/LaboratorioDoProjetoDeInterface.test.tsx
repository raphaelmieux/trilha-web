// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoProjetoDeInterface from './LaboratorioDoProjetoDeInterface';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';

/*
  O caderno da CC-FE007, clicado: a proposta com o mapa de telas e o
  rascunho, e o roteiro da apresentação. O motor é conferido em
  `projetoDeInterface.test.ts`; aqui o que se confere é que cada campo e cada
  botão chega a ele.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Lab = Extract<ReturnType<typeof licoesDaVereda>[number], { tipo: 'projeto-de-interface' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe007')!;
const labs = licoesDaVereda(vereda).filter((l): l is Lab => l.tipo === 'projeto-de-interface');
const lab = (licao: Lab['licao']) => labs.find(l => l.licao === licao)!;

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
  document.body.innerHTML = '';
});

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoProjetoDeInterface vereda={vereda} licao={l} aoVencer={aoVencer} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const botao = (texto: RegExp, dentro: ParentNode = document.body) => [...dentro.querySelectorAll('button')]
  .find(b => texto.test(b.textContent ?? '') || texto.test(b.getAttribute('aria-label') ?? '')) as HTMLButtonElement | undefined;
const clicar = (b: HTMLElement | undefined | null) => act(() => { b!.click(); });
function escrever(campo: HTMLInputElement | HTMLTextAreaElement, texto: string) {
  act(() => {
    const proto = campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(campo, texto);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const campo = (rotulo: string) => container.querySelector<HTMLInputElement>(`[aria-label="${rotulo}"]`)!;
const tela = (nome: string) => container.querySelector<HTMLElement>(`[aria-label="Tela ${nome}"]`)!;
const marcar = (dentro: HTMLElement, texto: string) => {
  const caixa = [...dentro.querySelectorAll('label')].find(l => l.textContent?.trim() === texto)!.querySelector('input')!;
  clicar(caixa);
};

function acrescentarTela(nome: string, mostra: string, blocos: string[]) {
  escrever(campo('Nome da nova tela'), nome);
  clicar(botao(/^Acrescentar tela$/));
  escrever(campo(`O que a tela ${nome} mostra`), mostra);
  const paleta = container.querySelector<HTMLElement>(`[aria-label="Blocos para a tela ${nome}"]`)!;
  for (const b of blocos) clicar(botao(new RegExp(b), paleta));
}

describe('o caderno da proposta, clicado', () => {
  it('são dois laboratórios no caderno da vereda', () => {
    expect(labs.map(l => l.licao).sort()).toEqual(['apresentacao', 'proposta']);
  });

  it('do caderno em branco à proposta aprovada, e só então programar', () => {
    const aoVencer = desenhar(lab('proposta'));
    expect(botao(/Faltam 4/)).toBeDefined();

    escrever(container.querySelector<HTMLTextAreaElement>('#objetivo')!,
      'Os avisos dos eventos do clube se perdem no grupo de mensagens, e a agenda junta tudo num endereço só.');
    escrever(campo('O público-alvo'), 'Os desbravadores e as famílias do clube');

    acrescentarTela('Eventos', 'A lista dos próximos eventos do clube', ['Cabeçalho', 'Menu', 'Lista de cartões']);
    acrescentarTela('Evento', 'A data, o local e a descrição de um evento', ['Cabeçalho', 'Menu', 'Texto']);
    acrescentarTela('Feriados', 'Os feriados nacionais do ano, da BrasilAPI', ['Menu', 'carregando', 'Mensagem de erro']);
    marcar(tela('Eventos'), 'Evento');
    marcar(tela('Eventos'), 'Feriados');
    marcar(tela('Evento'), 'Eventos');
    marcar(tela('Feriados'), 'Eventos');
    expect(container.textContent).toContain('Entrada · Eventos');

    clicar(botao(/^Enviar para aprovação$/));
    expect(container.textContent).toContain('Proposta aprovada em 01/11/2026');
    clicar(botao(/^Começar a programar$/));
    expect(container.textContent).toContain('Programação liberada');

    const concluir = botao(/Concluir a lição/)!;
    expect(concluir.disabled).toBe(false);
    clicar(concluir);
    expect(aoVencer).toHaveBeenCalled();
  });

  it('a proposta incompleta volta com o que falta, e programar antes fica registrado', () => {
    desenhar(lab('proposta'));
    clicar(botao(/^Enviar para aprovação$/));
    expect(container.textContent).toContain('O examinador devolveu a proposta');
    expect(container.textContent).toContain('pelo menos 3 telas');
    clicar(botao(/^Começar a programar$/));
    expect(container.textContent).toContain('começou antes da aprovação');
  });

  it('o rascunho sobe, desce e perde blocos, e tirar uma tela tira as setas para ela', () => {
    desenhar(lab('proposta'));
    acrescentarTela('Eventos', 'A lista dos próximos eventos do clube', ['Cabeçalho', 'Menu']);
    acrescentarTela('Feriados', 'Os feriados nacionais do ano todo', ['Texto']);
    const lista = () => [...container.querySelectorAll('[aria-label="Rascunho da tela Eventos"] li')].map(li => li.textContent?.trim());
    expect(lista()).toEqual(['Cabeçalho com o nome', 'Menu com links']);
    clicar(botao(/^Subir Menu com links$/));
    expect(lista()).toEqual(['Menu com links', 'Cabeçalho com o nome']);
    clicar(botao(/^Tirar Cabeçalho com o nome$/));
    expect(lista()).toEqual(['Menu com links']);
    marcar(tela('Eventos'), 'Feriados');
    clicar(botao(/^Tirar a tela Feriados$/));
    expect(tela('Eventos').textContent).not.toContain('Leva a');
  });
});

describe('o roteiro da apresentação, clicado', () => {
  it('os minutos, o que mostrar, o aparelho e o plano B fecham a lição', () => {
    const aoVencer = desenhar(lab('apresentacao'));
    expect(botao(/Faltam 4/)).toBeDefined();
    escrever(campo('Minutos: O objetivo e quem usa'), '2');
    escrever(campo('Minutos: A agenda funcionando no celular'), '7');
    escrever(campo('Minutos: As decisões de interface'), '3');
    expect(container.textContent).toContain('Total: 12 de 15 minutos.');
    for (const x of ['Abrir pelo link público', 'Andar pelas três telas', 'Mostrar a lista em uma coluna', 'Ligar o modo avião']) {
      const caixa = [...container.querySelectorAll('label')].find(l => l.textContent?.startsWith(x))!.querySelector('input')!;
      clicar(caixa);
    }
    const real = [...container.querySelectorAll('label')].find(l => l.textContent?.startsWith('Um celular de verdade'))!.querySelector('input')!;
    clicar(real);
    escrever(container.querySelector<HTMLTextAreaElement>('#plano-b')!, 'Uso os dados móveis do meu celular, testados antes na sala.');
    const concluir = botao(/Concluir a lição/)!;
    expect(concluir.disabled).toBe(false);
    clicar(concluir);
    expect(aoVencer).toHaveBeenCalled();
  });
});
