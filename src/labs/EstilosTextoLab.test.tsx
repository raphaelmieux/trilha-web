// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import EstilosTextoLab from './EstilosTextoLab';
import { METAS_DOS_ESTILOS, TEXTO_DO_SITE } from './metasDaAp044';

/*
  O laboratório de estilos, percorrido por inteiro.

  `metasDaAp044.test.ts` já prova que o documento abre com tudo por fazer e que
  existe um estado que fecha as nove tarefas. O que ele não alcança é a metade
  que costuma quebrar: a **ligação** entre o botão e o modelo. Um menu que não
  abre, um botão que aplica ao parágrafo quando deveria aplicar ao trecho, uma
  colagem que entra na seção errada — nada disso aparece num teste de modelo, e
  tudo isso deixa o desbravador olhando uma lista vermelha depois de ter feito
  o que a tarefa pediu.

  "Laboratório que ninguém consegue vencer é pior do que um que abre resolvido":
  um dá tarefa verde de graça, o outro deixa quem fez tudo certo sem nada na
  tela que explique. Este arquivo clica no que o painel manda clicar e cobra que
  as nove fiquem verdes.
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
        <EstilosTextoLab
          specialtyCode="AP044" lessonCode="AP044.4-L2"
          lessonTitle="Formatando o boletim do clube"
          requirementCodes={['AP044-7.1']}
          userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Como se clica ─────────────────────────────────────────────────────────
   Tudo por texto visível ou por rótulo de acessibilidade, que é o que o
   desbravador enxerga. Procurar por classe deixaria o teste passar depois de
   um botão perder o nome. */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim() === texto);

const porRotulo = (rotulo: string) =>
  container.querySelector(`[aria-label="${rotulo}"]`);

const guia = (nome: string) => porTexto('.wd-guia', nome);
const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.wd-menu-item')].find(e => e.textContent?.includes(texto));

/** Clica no trecho do documento cujo texto começa assim. */
const trecho = (comeco: string) => {
  const e = [...container.querySelectorAll('.wd-par span')]
    .find(x => (x.textContent ?? '').startsWith(comeco));
  clicar(e, `trecho "${comeco}"`);
};

/** Clica no parágrafo inteiro escolhendo o primeiro trecho dele. */
const paragrafo = (comeco: string) => {
  const p = [...container.querySelectorAll('.wd-par')]
    .find(x => (x.textContent ?? '').startsWith(comeco));
  expect(p, `não achei o parágrafo "${comeco}"`).toBeTruthy();
  clicar(p!.querySelector('span'), `parágrafo "${comeco}"`);
};

/**
 * Quais tarefas o painel mostra como concluídas, lidas da tela.
 *
 * A moldura desenha cada tarefa como um disco seguido do título: disco com
 * "✓" é feita, disco vazio é por fazer. Ler daqui, e não do modelo, é o ponto
 * do arquivo — o que se quer saber é se o clique chegou ao modelo e voltou.
 */
const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DOS_ESTILOS) {
    const titulo = [...container.querySelectorAll('p')]
      .find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

/* A conta que a moldura escreve em cima da lista, que é a leitura de relance.
   Serve de segunda opinião sobre `feitas()`: um seletor que deixasse de achar
   as linhas devolveria lista vazia e passaria por "nada feito ainda". */
const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);

describe('o laboratório de estilos se vence clicando', () => {
  it('abre com as nove tarefas por fazer', () => {
    expect(placar(), 'a moldura não escreveu o placar — o seletor deixou de achar o painel')
      .toEqual(['0', '9']);
    expect(feitas()).toEqual([]);
  });

  it('o sumário gerado sem estilo nenhum sai vazio, e diz isso', () => {
    clicar(guia('Referências'), 'guia Referências');
    clicar(porRotulo('Sumário'), 'botão Sumário');
    clicar(itemDeMenu('Sumário Automático 1'), 'Sumário Automático 1');
    expect(container.textContent).toContain('Nenhuma entrada de sumário foi encontrada.');
    expect(feitas()).not.toContain('sumario');
  });

  it('fecha as nove seguindo o que o painel manda', () => {
    // 1 — Estilos, e a diferença entre parágrafo e caractere
    clicar(guia('Início'), 'guia Início');
    paragrafo('MANUAL DO ACAMPAMENTO');
    clicar(porTexto('.es-estilo', 'Título 1'), 'Título 1');
    for (const h of ['O que levar', 'A programação', 'O culto da noite']) {
      paragrafo(h);
      clicar(porTexto('.es-estilo', 'Título 2'), 'Título 2');
    }
    paragrafo('Bem-aventurados');
    clicar(porTexto('.es-estilo', 'Citação'), 'Citação');
    trecho('até 20 de junho');
    clicar(porTexto('.es-estilo', 'Ênfase'), 'Ênfase');
    expect(feitas()).toContain('estilos');

    // 5 — Realce, no mesmo trecho que já está selecionado
    clicar(porRotulo('Cor do Realce do Texto'), 'realce');
    clicar(itemDeMenu('Amarelo'), 'Amarelo');
    expect(feitas()).toContain('realce');

    // 4 — Sobrescrito e subscrito
    trecho('2');
    // O primeiro "2" solto é o do H₂O; o do m² vem depois.
    clicar(porRotulo('Subscrito (Ctrl+=)'), 'subscrito');
    const doisSoltos = [...container.querySelectorAll('.wd-par span')]
      .filter(x => x.textContent === '2');
    const doisDoMetro = doisSoltos[doisSoltos.length - 1];
    clicar(doisDoMetro, 'o 2 de m²');
    clicar(porRotulo('Sobrescrito (Ctrl+Shift++)'), 'sobrescrito');
    expect(feitas()).toContain('sobre-sub');

    // 2 e 3 — as duas colagens
    clicar(porTexto('button', 'Copiar'), 'Copiar do site');
    paragrafo('A chegada é na sexta');
    clicar(porRotulo('Colar (Ctrl+V)'), 'Colar');
    clicar(itemDeMenu('Manter Formatação Original'), 'Manter Formatação Original');
    paragrafo('Dúvidas: fale com a liderança');
    clicar(porRotulo('Colar (Ctrl+V)'), 'Colar');
    clicar(itemDeMenu('Manter Somente Texto'), 'Manter Somente Texto');
    expect(feitas()).toContain('colar-original');
    expect(feitas()).toContain('colar-destino');
    expect(container.textContent).toContain(TEXTO_DO_SITE);

    // 6 — o Caps Lock, pelo botão Aa
    paragrafo('MANUAL DO ACAMPAMENTO');
    clicar(porRotulo('Alterar Maiúsculas e Minúsculas'), 'Aa');
    clicar(itemDeMenu('Primeira letra da frase'), 'Primeira letra da frase');
    expect(feitas()).toContain('caixa');

    // 7 — colunas, na guia Layout
    paragrafo('Saco de dormir');
    clicar(guia('Layout'), 'guia Layout');
    clicar(porRotulo('Colunas'), 'Colunas');
    clicar(itemDeMenu('Duas'), 'Duas');
    expect(feitas()).toContain('colunas');

    // 8 — nota de rodapé, na guia Referências
    clicar(guia('Início'), 'guia Início');
    paragrafo('Saco de dormir');
    clicar(guia('Referências'), 'guia Referências');
    clicar(porRotulo('Inserir Nota de Rodapé (Alt+Ctrl+F)'), 'Nota de Rodapé');
    const campo = porRotulo('Nota de rodapé 1') as HTMLInputElement;
    expect(campo, 'a nota não abriu campo para escrever').toBeTruthy();
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(campo, 'Espuma fina que fica entre o saco de dormir e o chão.');
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(feitas()).toContain('nota');

    // 9 — e só então o sumário, que agora tem o que ler
    clicar(porRotulo('Sumário'), 'botão Sumário');
    clicar(itemDeMenu('Sumário Automático 1'), 'Sumário Automático 1');

    const abertas = METAS_DOS_ESTILOS.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['9', '9']);
  });

  /*
    O sumário envelhece, e é a metade da lição que ninguém conta.

    Gerar antes de consertar o título deixa o sumário mostrando MANUAL DO
    ACAMPAMENTO DE INVERNO em caixa alta. Nada na tela avisa — e se a tarefa
    apenas conferisse "existe sumário", a plataforma daria o manual por bom.
  */
  it('o sumário gerado antes do conserto do título não conta', () => {
    clicar(guia('Início'), 'guia Início');
    paragrafo('MANUAL DO ACAMPAMENTO');
    clicar(porTexto('.es-estilo', 'Título 1'), 'Título 1');
    for (const h of ['O que levar', 'A programação', 'O culto da noite']) {
      paragrafo(h);
      clicar(porTexto('.es-estilo', 'Título 2'), 'Título 2');
    }

    clicar(guia('Referências'), 'guia Referências');
    clicar(porRotulo('Sumário'), 'botão Sumário');
    clicar(itemDeMenu('Sumário Automático 1'), 'Sumário Automático 1');
    expect(feitas()).toContain('sumario');

    clicar(guia('Início'), 'guia Início');
    paragrafo('MANUAL DO ACAMPAMENTO');
    clicar(porRotulo('Alterar Maiúsculas e Minúsculas'), 'Aa');
    clicar(itemDeMenu('Primeira letra da frase'), 'Primeira letra da frase');
    expect(feitas(), 'o sumário velho continuou valendo depois de o título mudar')
      .not.toContain('sumario');

    clicar(guia('Referências'), 'guia Referências');
    clicar(porRotulo('Sumário'), 'botão Sumário');
    clicar(itemDeMenu('Atualizar Sumário'), 'Atualizar Sumário');
    expect(feitas()).toContain('sumario');
  });

  /*
    Estilo de caractere e estilo de parágrafo não são a mesma coisa, e é o que
    decide quem entra no sumário. Aplicar Ênfase a um trecho não pode marcar o
    parágrafo como título — nem o contrário.
  */
  it('Ênfase vale para o trecho, e Título 2 para o parágrafo inteiro', () => {
    clicar(guia('Início'), 'guia Início');
    trecho('até 20 de junho');
    clicar(porTexto('.es-estilo', 'Ênfase'), 'Ênfase');

    const paragrafoDoPrazo = [...container.querySelectorAll('.wd-par')]
      .find(p => (p.textContent ?? '').includes('A ficha assinada'))!;
    const trechos = [...paragrafoDoPrazo.querySelectorAll('span')];
    const emItalico = trechos.filter(s => (s as HTMLElement).style.fontStyle === 'italic');
    expect(emItalico, 'Ênfase pegou mais de um trecho').toHaveLength(1);
    expect(emItalico[0].textContent).toBe('até 20 de junho');
  });

  /* Nenhum botão faz nada sem seleção, e o programa diz isso em vez de ficar
     mudo — é o engano número um de quem começa. */
  it('sem seleção, a galeria de estilos explica em vez de não fazer nada', () => {
    clicar(guia('Início'), 'guia Início');
    clicar(porTexto('.es-estilo', 'Título 1'), 'Título 1');
    expect(container.textContent).toContain('Clique antes num trecho do documento');
    expect(feitas()).toEqual([]);
  });
});
