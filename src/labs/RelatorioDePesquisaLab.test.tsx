// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ROTEIROS } from './redacaoGuiada';
import { ETAPAS, PAGINAS, type Ficha } from './pesquisaDoMilenio';

/*
  O relatório do bug do milênio — requisito 6 da AP045, segunda metade.

  Três coisas se conferem aqui, e as três erram calado.

  A chave é o **projeto**, e não a trilha. Com a chave antiga, entregar este
  relatório sobrescreveria o da evolução da computação — o outro texto da mesma
  trilha —, e o desbravador descobriria ao abrir o primeiro e encontrar o
  segundo dentro.

  As fichas vêm da lição anterior. Sem elas, a tela não pode abrir um campo em
  branco fingindo que está tudo certo: seria pedir um relatório sobre fichas que
  não existem.

  E o material mostrado é o da pergunta da vez. Despejar as quinze em toda etapa
  faria a pessoa procurar, a cada pergunta, as três que importam no meio das
  outras doze.
*/

const FICHAS: Ficha[] = [
  { fato: PAGINAS[0].frases[0].texto, etapa: 'causa', pagina: 'museu' },
  { fato: PAGINAS[0].frases[1].texto, etapa: 'causa', pagina: 'museu' },
  { fato: PAGINAS[1].frases[0].texto, etapa: 'temor', pagina: 'revista' },
  { fato: PAGINAS[1].frases[1].texto, etapa: 'resultado', pagina: 'revista' },
];

/* O supabase é dublê: esta trava mede a tela, e não a rede. O que interessa é
   o que ela faz com o que volta — inclusive quando volta vazio. */
let eventos: { metadata: unknown }[] = [];

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (tabela: string) => {
      const encadeado = {
        select: () => encadeado,
        eq: () => encadeado,
        order: () => encadeado,
        limit: () => Promise.resolve({ data: tabela === 'activity_events' ? eventos : [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
      };
      return encadeado;
    },
  },
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* Indefinidos até a primeira montagem: há testes aqui que só leem o roteiro
   e não põem tela nenhuma de pé. */
let container: HTMLDivElement | undefined;
let root: Root | undefined;

async function montar() {
  const { default: RelatorioDePesquisaLab } = await import('./RelatorioDePesquisaLab');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <RelatorioDePesquisaLab
          specialtyCode="AP045" lessonCode="AP045.5-L4"
          lessonTitle="Escrevendo o relatório sobre o bug do milênio"
          requirementCodes={['AP045-6.1']} userId="olhar"
        />
      </MemoryRouter>,
    );
  });
  /* A consulta das fichas resolve numa microtarefa depois da montagem. */
  await act(async () => { await Promise.resolve(); });
}

beforeEach(() => { eventos = []; });
afterEach(() => {
  if (!root) return;
  act(() => root!.unmount());
  container?.remove();
  root = undefined; container = undefined;
});

const texto = () => container?.textContent ?? '';

describe('o roteiro é o do projeto, e não o da trilha', () => {
  it('existe um roteiro com a chave do projeto', () => {
    /* Sem ele o laboratório abriria vazio: nem perguntas, nem etapas, nem como
       concluir — e o requisito ficaria impossível de cumprir sem que nada na
       tela dissesse por quê. */
    expect(ROTEIROS['AP045-bug-do-milenio']).toBeTruthy();
  });

  it('e ele é diferente do relatório da evolução da computação', () => {
    /* Os dois são da AP045, e um sobrescreveria o outro se a chave fosse a
       trilha. Que eles tenham perguntas diferentes é o que torna a distinção
       visível — e é por isso que a coluna `projeto` existe. */
    const bug = ROTEIROS['AP045-bug-do-milenio'];
    const evolucao = ROTEIROS.AP045;
    expect(evolucao).toBeTruthy();
    expect(bug.titulo).not.toBe(evolucao.titulo);
    const ids = new Set(evolucao.etapas.map(e => e.id));
    expect(bug.etapas.some(e => ids.has(e.id))).toBe(false);
  });

  it('as etapas de fato são as mesmas quatro da pesquisa', () => {
    /* Se as gavetas não coincidirem, o painel oferece na pergunta do que
       aconteceu as fichas de por que o problema existia. */
    const doRoteiro = ROTEIROS['AP045-bug-do-milenio'].etapas.filter(e => !e.opiniao).map(e => e.id);
    expect(doRoteiro).toEqual(ETAPAS.map(e => e.id));
  });
});

describe('sem pesquisa, a lição diz isso em vez de abrir em branco', () => {
  it('avisa e dá o caminho de volta', async () => {
    await montar();
    expect(texto()).toContain('A pesquisa ainda não foi feita');
    expect(texto()).toContain('Pesquisando o bug do milênio em sites especializados');
    /* E não abre o formulário: um campo em branco aqui seria pedir um relatório
       sobre fichas que não existem. */
    expect(container!.querySelector('textarea')).toBeNull();
  });

  it('e o título vem do currículo, como em todo laboratório', async () => {
    await montar();
    expect(container!.querySelector('h1')?.textContent)
      .toBe('Escrevendo o relatório sobre o bug do milênio');
  });
});

describe('com pesquisa, as fichas aparecem ao lado da pergunta', () => {
  it('só as da etapa da vez', async () => {
    eventos = [{ metadata: { fichas: FICHAS } }];
    await montar();
    /* A primeira etapa é `causa`: as duas fichas dela aparecem, e a de `temor`
       não. */
    expect(texto()).toContain(FICHAS[0].fato);
    expect(texto()).toContain(FICHAS[1].fato);
    expect(texto()).not.toContain(FICHAS[2].fato);
  });

  it('e o painel acompanha quando se passa para a pergunta seguinte', async () => {
    /* A mutação que fixava o painel na primeira etapa sobreviveu à conferência
       de cima, porque ela só olhava a primeira. Quem anda para a segunda
       pergunta tem de ver as fichas dela — senão o painel é um enfeite que
       mostra sempre a mesma coisa. */
    eventos = [{ metadata: { fichas: FICHAS } }];
    await montar();
    const avancar = [...container!.querySelectorAll('button.btn-secondary')]
      .filter(b => !(b as HTMLButtonElement).disabled)
      .at(-1);
    expect(avancar, 'não achei o botão de avançar etapa').toBeTruthy();
    await act(async () => {
      avancar!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(texto()).toContain(FICHAS[2].fato);
    expect(texto()).not.toContain(FICHAS[0].fato);
  });

  it('e cada uma traz a página de onde saiu', async () => {
    eventos = [{ metadata: { fichas: FICHAS } }];
    await montar();
    /* Uma ficha sem a página de onde saiu é um fato sem onde voltar — é o
       hábito que a lição anterior existe para instalar, e ele não pode se
       perder no caminho entre as duas. */
    expect(texto()).toContain(PAGINAS[0].url);
  });

  it('e o campo de escrever está lá', async () => {
    eventos = [{ metadata: { fichas: FICHAS } }];
    await montar();
    expect(container!.querySelector('textarea')).not.toBeNull();
  });
});

describe('metadata torta não derruba a tela', () => {
  it('evento sem fichas conta como pesquisa não feita', async () => {
    /* Um evento antigo, de antes de as fichas viajarem nele, tem metadata sem
       o campo. Estourar aqui deixaria a lição inacessível para quem fez a
       pesquisa antes desta mudança. */
    eventos = [{ metadata: { specialtyCode: 'AP045' } }];
    await montar();
    expect(texto()).toContain('A pesquisa ainda não foi feita');
  });

  it('e fichas que não são lista, também', async () => {
    eventos = [{ metadata: { fichas: 'nada disso' } }];
    await montar();
    expect(texto()).toContain('A pesquisa ainda não foi feita');
  });
});
