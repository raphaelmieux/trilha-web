// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaEntrega from './LaboratorioDaEntrega';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { NOME_INICIAL } from '../labs/entregaDoRelatorio';

/*
  A entrega do módulo 6, percorrida clicando.

  `entregaDoRelatorio.test.ts` prova que as cinco metas podem ficar verdes.
  Isto pergunta a outra metade — **a janela chama alguma delas?** — e três
  coisas que só esta lição faz:

  - **o PDF congela na tela?** Exportar, mexer no documento e ver a tarefa
    voltar ao vermelho é a lição inteira do requisito 4.6, e ela só existe se
    o arquivo gravado guardar o retrato de verdade.
  - **o nome se digita?** Na AP042 ele é enfeite e o campo é de leitura; aqui
    ele é o requisito, e um campo travado tiraria o único caminho até a tarefa.
  - **a prévia mostra este relatório?** Ela era o texto do documento da AP042,
    escrito dentro da janela compartilhada: prévia que mostra o documento de
    outro exercício é pior do que prévia nenhuma.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VEREDA = VEREDAS.find(v => v.code === 'CC-ES002')!;
const licaoDeWord = (id: string) => {
  const l = licoesDaVereda(VEREDA).find(x => x.id === id);
  if (!l || l.tipo !== 'word') throw new Error(`${id} não é uma lição de Word`);
  return l;
};

let container: HTMLDivElement;
let root: Root;
let venceu = false;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  venceu = false;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const montar = () => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDaEntrega
          vereda={VEREDA} licao={licaoDeWord('m6-lab')}
          aoVencer={() => { venceu = true; }}
          aoSair={() => {}}
        />
      </MemoryRouter>,
    );
  });
};

/* ── Ajudas de clique ──────────────────────────────────────────────────────── */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('.wd-guia')].find(b => b.textContent?.trim() === nome);

const porTexto = (texto: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === texto);

const marcaComTexto = (texto: string) =>
  [...container.querySelectorAll('[data-revisao]')].find(e => e.textContent === texto);

const estado = () =>
  [...container.querySelectorAll('.wd-status span')].map(s => s.textContent?.trim()).join(' | ');

const campoDoNome = () =>
  container.querySelector('input[aria-label="Nome do arquivo"]') as HTMLInputElement | null;

const escreverNo = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei ${nome}`).toBeTruthy();
  const el = campo as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const escolherTipo = (valor: string) => {
  const sel = container.querySelector('select[aria-label="Tipo"]') as HTMLSelectElement;
  expect(sel, 'não achei a lista de tipo').toBeTruthy();
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(sel, valor);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const podeConcluir = () => !(botaoDeConcluir() as HTMLButtonElement).disabled;

const NOME_BOM = 'relatorio-atividades-2026-03-14-v01';

const abrirArquivo = () => clicar(guia('Arquivo'), 'a guia Arquivo');

const irPara = (painel: string) => clicar(porTexto(painel), painel);

/** Salvar como, com o nome e o tipo escolhidos. */
const salvarComo = (nome: string | null, tipo: string) => {
  abrirArquivo();
  irPara('Salvar como');
  if (nome !== null) escreverNo(campoDoNome(), nome, 'o campo do nome');
  escolherTipo(tipo);
  /* O botão do painel, e não o "Salvar" da faixa azul à esquerda: os dois se
     chamam igual, como no Word, e o da faixa grava sem olhar o tipo. */
  clicar(container.querySelector('.wd-bast-corpo button.wd-imprimir-bt'),
    'Salvar, no painel');
};

const exportar = () => {
  abrirArquivo();
  irPara('Exportar');
  clicar(porTexto('Criar PDF/XPS'), 'Criar PDF/XPS');
};

const terminarODocumento = () => {
  clicar(guia('Revisão'), 'a guia Revisão');
  clicar(marcaComTexto('última revisão'), 'a marca da liderança');
  clicar(comando('Aceitar'), 'Aceitar');
  clicar(marcaComTexto('revisão de dezembro'), 'o texto inserido');
  clicar(comando('Aceitar'), 'Aceitar');
  clicar(guia('Referências'), 'a guia Referências');
  clicar(comando('Atualizar Sumário'), 'Atualizar Sumário');
};

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório chega pronto e a entrega não', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abre já vencida').toBe(false);
  });

  it('a régua de status diz o que ficou para trás, e não julga o arquivo', () => {
    montar();
    expect(estado()).toContain('marcas pendentes');
    expect(estado()).toContain('Sumário desatualizado');
    expect(estado()).toContain('Nada gravado ainda');
    /* Ela não escreve "PDF desatualizado": o Word não sabe disso, e escrever
       poria na nossa tela a resposta que a lição existe para o desbravador
       descobrir sozinho, olhando a ordem. */
    expect(estado()).not.toContain('desatualizado · ');
  });

  it('o relatório tem quatro folhas na tela', () => {
    montar();
    expect(container.querySelectorAll('.wd-pagina').length).toBeGreaterThanOrEqual(4);
  });
});

describe('a entrega pode ser feita clicando', () => {
  it('terminar, nomear, exportar e guardar o editável junto', () => {
    montar();
    terminarODocumento();
    expect(estado()).toContain('Sem marcas pendentes');
    expect(estado()).toContain('Sumário em dia');

    salvarComo(NOME_BOM, 'docx');
    exportar();

    expect(podeConcluir(), 'fiz tudo o que a lista pede e o botão continuou desabilitado')
      .toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu).toBe(true);
  });

  it('e Salvar como em PDF chega no mesmo lugar que Exportar', () => {
    /* A teoria diz que os dois caminhos chegam no mesmo lugar. Se só um deles
       gravasse, a lição mostraria uma referência que o laboratório desmente. */
    montar();
    terminarODocumento();
    salvarComo(NOME_BOM, 'pdf');
    expect(estado(), 'Salvar como em PDF não gravou PDF nenhum').toContain('.pdf');
    salvarComo(null, 'docx');
    expect(podeConcluir()).toBe(true);
  });
});

describe('o PDF congela o que existir na hora', () => {
  it('exportar antes de terminar deixa a tarefa vermelha depois', () => {
    montar();
    salvarComo(NOME_BOM, 'docx');
    exportar();
    expect(estado(), 'nada foi gravado').toContain('.pdf');
    expect(podeConcluir(), 'a entrega fechou com o documento por terminar').toBe(false);

    terminarODocumento();
    expect(podeConcluir(), 'o PDF exportado antes de terminar passou por atual').toBe(false);

    exportar();
    salvarComo(null, 'docx');
    expect(podeConcluir(), 'exportar de novo não consertou').toBe(true);
  });

  it('mexer no documento depois de entregar reabre a tarefa', () => {
    /* É a lição inteira, vista de dentro: nada na tela muda de aparência, e a
       única coisa que percebe é a lista de tarefas. */
    montar();
    terminarODocumento();
    salvarComo(NOME_BOM, 'docx');
    exportar();
    expect(podeConcluir()).toBe(true);

    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Atualizar Sumário'), 'Atualizar Sumário');
    /* O sumário não mudou de conteúdo, então o retrato continua o mesmo: o que
       reabre a tarefa é mudança de verdade, e não qualquer clique. */
    expect(podeConcluir(), 'um clique que não mudou nada reabriu a tarefa').toBe(true);

    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Próxima'), 'Próxima');
    expect(estado()).toContain('Sem marcas pendentes');
  });
});

describe('o nome do arquivo e a prévia', () => {
  it('o campo do nome se digita, e chega com o nome de verdade da pasta do clube', () => {
    montar();
    abrirArquivo();
    irPara('Salvar como');
    const campo = campoDoNome();
    expect(campo?.value, 'o nome de partida não é o que a lição diz').toBe(NOME_INICIAL);
    expect(campo?.readOnly, 'o campo do nome chegou travado, e a tarefa fica sem caminho')
      .toBe(false);

    escreverNo(campo, NOME_BOM, 'o campo do nome');
    expect(campoDoNome()?.value).toBe(NOME_BOM);
  });

  it('o nome de partida não fecha a tarefa, mesmo entregando os dois arquivos', () => {
    montar();
    terminarODocumento();
    salvarComo(null, 'docx');
    exportar();
    expect(podeConcluir(), 'a entrega fechou com o nome "final FINAL (2)"').toBe(false);
  });

  it('a prévia de impressão mostra este relatório, e não o de outro exercício', () => {
    montar();
    abrirArquivo();
    irPara('Imprimir');
    const previa = container.querySelector('.wd-previa');
    expect(previa?.textContent, 'a prévia mostra o documento de outro laboratório')
      .toContain('Relatório de Atividades do Clube');
    expect(previa?.textContent).not.toContain('Unidade Falcão');
  });
});
