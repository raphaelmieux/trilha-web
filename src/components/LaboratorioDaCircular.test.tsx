// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaCircular from './LaboratorioDaCircular';
import LaboratorioDeWord from './LaboratorioDeWord';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';

/*
  A circular do módulo 2, percorrida clicando.

  `circularDoClube.test.ts` prova que as cinco metas podem ficar verdes. Isto
  pergunta outra coisa: **a janela chama alguma delas?** Um botão ¶ que não
  liga nada, um comando de juntar que não junta, um Excluir que apaga
  parágrafo com texto — as metas continuam certas e o laboratório fica
  impossível de vencer, que é pior do que um que abre resolvido.

  E há uma pergunta que só este módulo faz: **dá para ver o que está errado?**
  A teoria escreve que, com as marcas desligadas, o Enter e a quebra de linha
  são invisíveis. Se o ¶ não aparecesse na tela, o laboratório cometeria na
  própria interface o defeito que a lição existe para nomear — e as cinco
  tarefas continuariam podendo ficar verdes, porque nenhuma delas mede o que
  se vê.
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
        <LaboratorioDaCircular
          vereda={VEREDA} licao={licaoDeWord('m2-lab')}
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

const paragrafo = (id: string) => container.querySelector(`[data-bloco="${id}"]`);
const paragrafos = () => [...container.querySelectorAll('[data-bloco]')];

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.trim() === nome
    && b.className.includes('wd-guia'));

const escolher = (id: string) => clicar(paragrafo(id), `parágrafo ${id}`);

const marcasNaTela = () => container.querySelectorAll('[data-marca="paragrafo"]').length;
const quebrasNaTela = () => container.querySelectorAll('[data-marca="quebra"]').length;

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const podeConcluir = () => {
  const b = botaoDeConcluir();
  expect(b, 'o botão de concluir sumiu da cápsula').toBeTruthy();
  return !(b as HTMLButtonElement).disabled;
};

const oQueFalta = () =>
  [...container.querySelectorAll('aside p')].map(p => p.textContent?.trim()).join(' | ');

/** Os cinco parágrafos vazios, na ordem da tela. */
const vazios = () => paragrafos().filter(p => (p.textContent ?? '').replace('¶', '').trim() === '');

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('a circular abre por consertar', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abriu resolvida').toBe(false);
  });

  it('as marcas de parágrafo começam desligadas, e é assim que o erro se esconde', () => {
    montar();
    expect(marcasNaTela(),
      'as marcas já vinham ligadas — a primeira tarefa abriria feita, e o documento '
      + 'não enganaria ninguém').toBe(0);
  });

  it('os cinco Enters vazios estão na folha, mesmo invisíveis', () => {
    montar();
    expect(vazios()).toHaveLength(5);
  });
});

describe('o botão ¶ mostra o que estava escondido', () => {
  it('ligar as marcas desenha um ¶ por parágrafo', () => {
    /*
      A pergunta que só este módulo faz. Sem isto, a tarefa "ligar as marcas"
      ficaria verde com o estado ligado e a tela sem nada — e o laboratório
      cometeria o defeito que a lição denuncia.
    */
    montar();
    clicar(comando('Mostrar Tudo (Ctrl+*)'), 'Mostrar Tudo');
    expect(marcasNaTela(), 'nenhum ¶ apareceu depois de ligar as marcas')
      .toBe(paragrafos().length);
  });

  it('depois de juntar o endereço, aparece o ↵ no lugar de dois ¶', () => {
    // É a diferença inteira do requisito 2.3, e ela precisa ser visível.
    montar();
    clicar(comando('Mostrar Tudo (Ctrl+*)'), 'Mostrar Tudo');
    const antes = marcasNaTela();

    escolher('end-1');
    clicar(comando('Juntar com Quebra de Linha (Shift+Enter)'), 'Juntar');

    expect(quebrasNaTela(), 'as duas quebras de linha não apareceram').toBe(2);
    expect(marcasNaTela(), 'os três ¶ do endereço deviam ter virado um').toBe(antes - 2);
  });
});

describe('a circular pode ser vencida clicando', () => {
  it('marcas, endereço, o parágrafo que chega, a quebra de página e a fonte', () => {
    montar();
    clicar(comando('Mostrar Tudo (Ctrl+*)'), 'Mostrar Tudo');

    escolher('end-1');
    clicar(comando('Juntar com Quebra de Linha (Shift+Enter)'), 'Juntar');

    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Acrescentar o parágrafo da revisão'), 'Parágrafo da revisão');
    expect(paragrafo('ab-4'), 'o parágrafo da revisão não entrou no documento').toBeTruthy();

    /* Apaga os cinco vazios, um a um, como quem apaga cinco Enters. */
    clicar(guia('Início'), 'a guia Início');
    for (let i = 0; i < 5; i += 1) {
      const vazio = vazios()[0];
      expect(vazio, `sumiu um vazio antes da hora (${i} apagados)`).toBeTruthy();
      clicar(vazio, 'um parágrafo vazio');
      clicar(comando('Excluir Parágrafo Vazio'), 'Excluir Parágrafo Vazio');
    }
    expect(vazios(), 'sobrou parágrafo vazio').toHaveLength(0);

    escolher('assina');
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Quebra de Página (Ctrl+Enter)'), 'Quebra de Página');

    clicar(guia('Início'), 'a guia Início');
    clicar([...container.querySelectorAll('.wc-fonte')].find(b => b.textContent?.trim() === 'Georgia'),
      'a fonte Georgia');

    expect(podeConcluir(), oQueFalta()).toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu, 'o botão de concluir não registrou a lição').toBe(true);
  });

  it('Excluir Parágrafo Vazio recusa parágrafo com texto', () => {
    /*
      Sem a recusa, o caminho mais curto para a tarefa seria apagar a
      assinatura — e o documento entregue ficaria sem ela, com a lista verde.
    */
    montar();
    escolher('ab-1');
    clicar(comando('Excluir Parágrafo Vazio'), 'Excluir Parágrafo Vazio');

    expect(paragrafo('ab-1'), 'um parágrafo com texto foi apagado').toBeTruthy();
    expect(container.textContent).toContain('Este parágrafo tem texto');
  });

  it('juntar sem escolher uma linha do endereço não junta nada', () => {
    montar();
    escolher('ab-1');
    clicar(comando('Juntar com Quebra de Linha (Shift+Enter)'), 'Juntar');

    expect(paragrafo('end-2'), 'o endereço foi juntado a partir de um parágrafo de fora').toBeTruthy();
    expect(container.textContent).toContain('Escolha uma das linhas do endereço');
  });

  it('a fonte escolhida veste a folha inteira', () => {
    // O requisito 2.4 é uma decisão do documento, e não de um parágrafo.
    montar();
    clicar([...container.querySelectorAll('.wc-fonte')].find(b => b.textContent?.trim() === 'Georgia'),
      'a fonte Georgia');
    const janela = container.querySelector('.wd-janela') as HTMLElement;
    expect(janela.style.fontFamily).toContain('Georgia');
  });
});

describe('os dois laboratórios de Word da vereda mostram a mesma janela', () => {
  /*
    Foi por este par que a folha desceu para `word.tsx`. Ajustar um lado e não
    o outro daria dois Word para o mesmo programa — o defeito que a plataforma
    já teve uma vez, e que `PlanilhaAvancadaLab.test.tsx` vigia nos dois Excel.
  */
  const janela = () => ({
    barraDeTitulo: !!container.querySelector('.wd-titulo'),
    guias: [...container.querySelectorAll('.wd-guia')].map(b => b.textContent?.trim()),
    regua: !!container.querySelector('.wd-regua'),
    folha: !!container.querySelector('.wd-pagina'),
    status: !!container.querySelector('.wd-status'),
    /* A mesma classe de parágrafo nos dois: é ela que `CSS_FOLHA` pinta, e um
       laboratório que a escrevesse por conta própria voltaria a divergir. */
    blocos: paragrafos().every(p => p.className.includes('wd-bloco')),
  });

  it('a mesma barra de título, as mesmas guias, a mesma régua e a mesma folha', () => {
    montar();
    const daCircular = janela();

    act(() => root.unmount());
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter>
          <LaboratorioDeWord
            vereda={VEREDA} licao={licaoDeWord('m1-lab')}
            aoVencer={() => {}} aoSair={() => {}} />
        </MemoryRouter>,
      );
    });
    const doOficio = janela();

    expect(daCircular.barraDeTitulo).toBe(doOficio.barraDeTitulo);
    expect(daCircular.regua).toBe(doOficio.regua);
    expect(daCircular.folha).toBe(doOficio.folha);
    expect(daCircular.status).toBe(doOficio.status);
    expect(daCircular.blocos).toBe(doOficio.blocos);
    expect(daCircular.guias).toEqual(doOficio.guias);

    /* A guarda contra o vazio: duas janelas ausentes também são iguais. */
    expect(daCircular.barraDeTitulo).toBe(true);
    expect(daCircular.blocos).toBe(true);
    expect(daCircular.guias.length).toBeGreaterThanOrEqual(5);
  });

  it('os dois partem de documentos diferentes', () => {
    /*
      A outra metade: janela igual, documento diferente. Se os dois abrissem o
      mesmo, o campo `documento` do currículo não estaria fazendo nada e o m2
      seria o m1 com outro nome.
    */
    montar();
    const daCircular = container.textContent ?? '';
    expect(daCircular).toContain('Circular às famílias');
    expect(daCircular).not.toContain('Relatório de Atividades — Primeiro Semestre');
  });
});
