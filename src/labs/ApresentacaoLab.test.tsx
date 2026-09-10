// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ApresentacaoLab from './ApresentacaoLab';
import { METAS_DA_APRESENTACAO, APRESENTACAO_INICIAL } from './apresentacaoDoClube';

/*
  A apresentação do clube, montada clicando.

  `apresentacaoDoClube.test.ts` prova que nenhuma das sete nasce verde e que
  existe um estado que fecha todas. Aqui se confere a ligação entre o botão e a
  apresentação — e neste laboratório ela é escorregadia por um motivo próprio:
  quase toda operação depende de **qual slide está selecionado**. Duplicar,
  excluir, mover, trocar layout, inserir foto, vídeo e áudio, todos agem sobre o
  slide da vez, e um "atual" que não acompanhe deixa o desbravador mexendo no
  slide errado sem nada na tela explicando.
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
        <ApresentacaoLab
          specialtyCode="AP044" lessonCode="AP044.6-L2"
          lessonTitle="Montando a apresentação do clube"
          requirementCodes={['AP044-9.1']}
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

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim() === texto);
const guia = (nome: string) => porTexto('.pp-guia', nome);
const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.pp-menu-item')].find(e => e.textContent?.trim().startsWith(texto));

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

/** Seleciona um slide pela tira lateral, pelo título que ele mostra. */
const irParaSlide = (titulo: string) => {
  const alvo = [...container.querySelectorAll('.pp-tira-item')]
    .find(b => b.getAttribute('aria-label')?.endsWith(`: ${titulo}`) ?? false);
  clicar(alvo, `slide "${titulo}"`);
};

const irParaVazio = () => {
  const alvo = [...container.querySelectorAll('.pp-tira-item')]
    .find(b => b.getAttribute('aria-label')?.endsWith('(vazio)') ?? false);
  clicar(alvo, 'slide vazio');
};

const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DA_APRESENTACAO) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);
const quantosSlides = () => container.querySelectorAll('.pp-tira-item').length;

describe('a apresentação do clube se monta clicando', () => {
  it('abre com as sete tarefas por fazer', () => {
    expect(placar(), 'a moldura não escreveu o placar').toEqual(['0', '7']);
    expect(feitas()).toEqual([]);
    expect(quantosSlides()).toBe(APRESENTACAO_INICIAL.slides.length);
  });

  it('fecha as sete seguindo o que o painel manda', () => {
    // 1 — o modelo, que muda os seis de uma vez
    clicar(guia('Design'), 'guia Design');
    clicar(porRotulo('Tema Facetas'), 'tema Facetas');
    expect(feitas()).toContain('modelo');

    // 2 — o layout do slide de tópicos
    irParaSlide('O que levar');
    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Layout'), 'Layout');
    clicar(itemDeMenu('Título e Conteúdo'), 'Título e Conteúdo');
    expect(feitas()).toContain('layout');

    // 4 — as fotos, e o alinhamento pelo comando
    irParaSlide('O acampamento do ano passado');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Imagens'), 'Imagens');
    clicar(itemDeMenu('fogueira.jpg'), 'fogueira.jpg');
    clicar(porRotulo('Imagens'), 'Imagens');
    clicar(itemDeMenu('barracas.jpg'), 'barracas.jpg');
    expect(feitas(), 'duas fotos sem alinhar já fechou a tarefa').not.toContain('imagens');
    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Organizar'), 'Organizar');
    clicar(itemDeMenu('Alinhar'), 'Alinhar em Cima');
    expect(feitas()).toContain('imagens');

    // 5 — o vídeo, incorporado
    irParaSlide('A programação');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Vídeo'), 'Vídeo');
    clicar(itemDeMenu('Inserir'), 'Inserir (incorporar)');
    expect(feitas()).toContain('video');

    // 6 — o áudio, no slide de abertura
    irParaSlide('Acampamento de Inverno');
    clicar(porRotulo('Áudio'), 'Áudio');
    clicar(itemDeMenu('Inserir'), 'Inserir (incorporar)');
    expect(feitas()).toContain('audio');

    // 3 — os quatro gestos de slide
    clicar(guia('Página Inicial'), 'guia Página Inicial');
    irParaVazio();
    clicar(porRotulo('Excluir Slide'), 'Excluir Slide');

    irParaSlide('O acampamento do ano passado');
    clicar(porRotulo('Duplicar Slide'), 'Duplicar Slide');

    clicar(porRotulo('Novo Slide'), 'Novo Slide');
    clicar(itemDeMenu('Título e Conteúdo'), 'layout do slide novo');
    const campo = [...container.querySelectorAll('[aria-label^="Título do slide"]')].pop();
    escrever(campo, 'O versículo do acampamento', 'título do slide novo');

    irParaSlide('Até lá!');
    /* O encerramento precisa chegar ao fim, e ele está no meio. */
    for (let i = 0; i < 6; i++) clicar(porRotulo('Mover Slide para Baixo'), 'Mover para Baixo');
    expect(feitas()).toContain('slides');

    // 7 — e o PDF por último, porque ele congela o que existir na hora
    clicar(porTexto('.pp-guia', 'Arquivo'), 'guia Arquivo');
    clicar(porRotulo('Criar Documento PDF/XPS'), 'Criar PDF');

    const abertas = METAS_DA_APRESENTACAO.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['7', '7']);
  });

  /*
    Vincular não é incorporar, e os dois se chamam "inserir".

    A diferença só aparece longe de casa — no computador do clube, com o quadro
    preto. Aqui ela aparece antes: o caminho do arquivo fica escrito embaixo do
    quadro, que é o que o painel de informações do PowerPoint relata.
  */
  it('vincular o vídeo mostra o caminho e não fecha a tarefa', () => {
    irParaSlide('A programação');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Vídeo'), 'Vídeo');
    clicar(itemDeMenu('Vincular ao Arquivo'), 'Vincular ao Arquivo');
    expect(container.textContent).toContain('Vinculado a C:');
    expect(feitas()).not.toContain('video');

    clicar(porRotulo('Vídeo'), 'Vídeo');
    clicar(itemDeMenu('Inserir'), 'Inserir (incorporar)');
    expect(feitas()).toContain('video');
  });

  /*
    O PDF congela o que existir na hora — e o do PowerPoint é assim mesmo.

    Exportar cedo e continuar mexendo é o que se faz sem pensar, e o PDF
    entregue fica sem os slides que vieram depois, sem nada na tela dizendo.
  */
  it('exportar e depois criar um slide reabre a tarefa do PDF', () => {
    clicar(porTexto('.pp-guia', 'Arquivo'), 'guia Arquivo');
    clicar(porRotulo('Criar Documento PDF/XPS'), 'Criar PDF');
    clicar(porRotulo('Voltar para a apresentação'), 'Voltar ao PowerPoint');
    expect(feitas()).toContain('pdf');

    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Novo Slide'), 'Novo Slide');
    clicar(itemDeMenu('Somente Título'), 'Somente Título');
    expect(feitas(), 'o PDF velho continuou valendo depois de um slide novo').not.toContain('pdf');
  });

  /* Alinhar com uma imagem só não alinha coisa nenhuma, e o programa diz isso
     em vez de marcar a tarefa como feita. */
  it('alinhar com uma foto só explica em vez de fechar a tarefa', () => {
    irParaSlide('O acampamento do ano passado');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Imagens'), 'Imagens');
    clicar(itemDeMenu('fogueira.jpg'), 'fogueira.jpg');
    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Organizar'), 'Organizar');
    clicar(itemDeMenu('Alinhar'), 'Alinhar em Cima');
    expect(container.textContent).toContain('com uma só não há a que alinhar');
    expect(feitas()).not.toContain('imagens');
  });

  /* O modelo muda todos os slides de uma vez, e é o que a tarefa ensina: a
     tira lateral inteira acompanha, e não só o slide da vez. */
  it('o modelo pinta a tira lateral inteira, e não só o slide aberto', () => {
    clicar(guia('Design'), 'guia Design');
    clicar(porRotulo('Tema Berlim'), 'tema Berlim');
    const fundos = [...container.querySelectorAll('.pp-tira .pp-slide')]
      .map(e => (e as HTMLElement).style.background);
    expect(fundos.length).toBe(APRESENTACAO_INICIAL.slides.length);
    expect(new Set(fundos).size, 'algum slide ficou com o fundo antigo').toBe(1);
  });
});
