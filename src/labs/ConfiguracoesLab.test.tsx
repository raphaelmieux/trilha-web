// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ConfiguracoesLab from './ConfiguracoesLab';
import { METAS_DA_MAQUINA, MAQUINA_INICIAL } from './maquinaDoClube';

/*
  O computador do clube, ajustado clicando.

  O que este arquivo alcança e o modelo não: a navegação. Quatro dos cinco itens
  do requisito moram em páginas diferentes de Configurações — Armazenamento
  dentro de Sistema, Impressoras em Dispositivos, padrões em Aplicativos, contas
  em Contas —, e o quinto mora no Explorador, que é outra janela. Um caminho que
  não leve a lugar nenhum deixa a tarefa impossível de vencer sem nada na tela
  explicando.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <ConfiguracoesLab
          specialtyCode="AP044" lessonCode="AP044.8-L2"
          lessonTitle="Ajustando o computador do clube"
          requirementCodes={['AP044-13.1']}
          userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim() === texto);

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
};

const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DA_MAQUINA) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);
const irPara = (secao: string) => clicar(porTexto('.cf-nav', secao), `seção ${secao}`);

describe('o computador do clube se ajusta clicando', () => {
  it('abre com as seis por fazer, e com Configurações na tela', () => {
    expect(placar()).toEqual(['0', '6']);
    expect(feitas()).toEqual([]);
    expect(container.querySelector('.cf-janela.config')).not.toBeNull();
  });

  it('fecha as seis seguindo o que o painel manda', () => {
    // 1 — a limpeza, dentro de Sistema › Armazenamento
    irPara('Sistema');
    clicar(porRotulo('Armazenamento'), 'Armazenamento');
    clicar(porRotulo('Limpeza de Disco'), 'Limpeza de Disco');
    clicar(porTexto('button', 'OK'), 'OK da limpeza');
    expect(feitas()).toContain('limpeza');

    // 2 — otimizar os dois, e o botão muda de nome conforme o disco
    clicar(porRotulo('Otimizar Unidades'), 'Otimizar Unidades');
    expect(container.textContent).toContain('Unidade de estado sólido');
    expect(container.textContent).toContain('Unidade de disco rígido');
    clicar(porRotulo('Otimizar Windows (C:)'), 'Otimizar o SSD');
    clicar(porRotulo('Desfragmentar Arquivos do clube (D:)'), 'Desfragmentar o HD');
    clicar(porTexto('button', 'Fechar'), 'Fechar');
    expect(feitas()).toContain('otimizar');

    // 5 — a impressora, em Dispositivos
    irPara('Bluetooth e dispositivos');
    clicar(porRotulo('Definir HP LaserJet — Secretaria como padrão'), 'definir impressora');
    expect(feitas()).toContain('impressora');

    // 4 — o programa padrão do .txt, em Aplicativos
    irPara('Aplicativos');
    escrever(porRotulo('Programa padrão para .txt'), 'VS Code', 'padrão do txt');
    expect(feitas()).toContain('padrao');

    // 6 — a conta nova, em Contas
    irPara('Contas');
    clicar(porRotulo('Adicionar conta'), 'Adicionar conta');
    escrever(porRotulo('Nome da conta'), 'Ana', 'nome');
    clicar(porTexto('button', 'Criar conta'), 'Criar conta');
    expect(feitas()).toContain('usuario');

    // 3 — abrir com, no Explorador
    clicar(porRotulo('Explorador de Arquivos na barra de tarefas'), 'Explorador');
    clicar(porRotulo('Abrir com — foto-do-acampamento.jpg'), 'Abrir com');
    clicar(porRotulo('Abrir foto-do-acampamento.jpg com GIMP'), 'GIMP');
    expect(feitas()).toContain('abrir-com');

    const abertas = METAS_DA_MAQUINA.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['6', '6']);
  });

  /*
    O botão da janela de otimizar sai do disco, e não de uma escolha nossa.

    É o que o Windows escreve ali, e é a lição inteira do item a): a ferramenta
    é a mesma, e o disco responde por si.
  */
  it('o botão diz Otimizar no SSD e Desfragmentar no HD', () => {
    irPara('Sistema');
    clicar(porRotulo('Armazenamento'), 'Armazenamento');
    clicar(porRotulo('Otimizar Unidades'), 'Otimizar Unidades');
    expect(porRotulo('Otimizar Windows (C:)'), 'o SSD não recebeu Otimizar').toBeTruthy();
    expect(porRotulo('Desfragmentar Arquivos do clube (D:)'), 'o HD não recebeu Desfragmentar').toBeTruthy();
  });

  /*
    Abrir com o próprio padrão não demonstra nada, e o programa diz isso.

    Sem esse recado, quem clicasse no programa marcado "padrão" ficaria com a
    tarefa vermelha e nada na tela explicando.
  */
  it('abrir no próprio programa padrão explica e não fecha a tarefa', () => {
    clicar(porRotulo('Explorador de Arquivos na barra de tarefas'), 'Explorador');
    clicar(porRotulo('Abrir com — foto-do-acampamento.jpg'), 'Abrir com');
    clicar(porRotulo(`Abrir foto-do-acampamento.jpg com ${MAQUINA_INICIAL.padroes['jpg']}`), 'programa padrão');
    expect(container.textContent).toContain('já era o programa padrão');
    expect(feitas()).not.toContain('abrir-com');
  });

  /*
    Criar um segundo administrador é o contrário do que separar usuários serve
    para fazer, e o laboratório diz por quê em vez de só deixar a tarefa
    vermelha.
  */
  it('criar a conta como administrador explica e não fecha a tarefa', () => {
    irPara('Contas');
    clicar(porRotulo('Adicionar conta'), 'Adicionar conta');
    escrever(porRotulo('Nome da conta'), 'Ana', 'nome');
    clicar(porRotulo('Conta de administrador'), 'caixa de administrador');
    clicar(porTexto('button', 'Criar conta'), 'Criar conta');
    expect(container.textContent).toContain('Separar usuários serve justamente');
    expect(feitas()).not.toContain('usuario');
  });

  /* Duas janelas, e a barra de tarefas as alcança — que é a razão de haver área
     de trabalho em vez de uma sanfona de cartões. */
  it('a barra de tarefas abre e traz cada janela para a frente', () => {
    expect(container.querySelector('.cf-janela.explorador')).toBeNull();
    clicar(porRotulo('Explorador de Arquivos na barra de tarefas'), 'Explorador');
    expect(container.querySelector('.cf-janela.explorador')).not.toBeNull();
    clicar(porRotulo('Configurações na barra de tarefas'), 'Configurações');
    expect(container.querySelector('.cf-janela.config')).not.toBeNull();
  });
});
