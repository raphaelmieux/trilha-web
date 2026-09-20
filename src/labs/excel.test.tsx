// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { GradeDoExcel, CSS_EXCEL } from './excel';
import {
  type Faixa, type Planilha, type RegraCondicional, escrever, vazia,
  LARGURA_PADRAO, ALTURA_PADRAO,
} from './planilha';

/*
  A grade compartilhada.

  Ela saiu de `PlanilhaLab.tsx` no dia em que a CC-ES003 precisou da mesma
  grade, e a trava é a mesma de `explorer.test.tsx`: peça que some no recorte
  não estoura nada — a janela continua desenhando, só que sem a alça, sem o
  cabeçalho, ou sem o que quer que tenha ficado para trás.

  E mais uma, que é da decisão desta grade: as peças novas aparecem **pela
  presença do setter**, como o `aoBuscar` do Explorador. Uma alça de
  preenchimento desenhada na AP043 prometeria um gesto que aquele laboratório
  não tem.
*/

const planilhaDeTeste = (conteudo: string[][], extras: Partial<Planilha> = {}): Planilha => ({
  celulas: Array.from({ length: 8 }, (_, l) =>
    Array.from({ length: 5 }, (_, c) => vazia(conteudo[l]?.[c] ?? ''))),
  larguras: new Array(5).fill(LARGURA_PADRAO),
  alturas: new Array(8).fill(ALTURA_PADRAO),
  layout: 'nenhum',
  nome: 'Planilha1',
  tabela: null,
  congeladas: 0,
  filtro: null,
  ordenacao: null,
  regras: [],
  grafico: null,
  ...extras,
});

const CLUBE = [
  ['Unidade', 'Inscritos'],
  ['Falcão', '12'],
  ['Águia', '9'],
  ['Tucano', '11'],
];

let caixa: HTMLDivElement | null = null;
let raiz: Root | null = null;

/** Monta e devolve o container, no estilo do resto da casa: sem biblioteca. */
function montar(no: ReactNode): HTMLDivElement {
  caixa = document.createElement('div');
  document.body.appendChild(caixa);
  raiz = createRoot(caixa);
  act(() => { raiz!.render(no); });
  return caixa;
}

function repintar(no: ReactNode) {
  act(() => { raiz!.render(no); });
}

afterEach(() => {
  act(() => { raiz?.unmount(); });
  caixa?.remove();
  raiz = null;
  caixa = null;
});

const textos = (c: HTMLElement, sel: string) =>
  [...c.querySelectorAll(sel)].map(e => e.textContent?.trim() ?? '');

function Grade({ planilha, ...extras }: { planilha: Planilha } & Partial<Parameters<typeof GradeDoExcel>[0]>) {
  const gradeRef = useRef<HTMLDivElement>(null);
  const [faixa, setFaixa] = useState<Faixa>({ l1: 0, c1: 0, l2: 0, c2: 0 });
  return (
    <>
      <style>{CSS_EXCEL}</style>
      <GradeDoExcel
        planilha={planilha}
        faixa={faixa}
        ativa={{ l: faixa.l1, c: faixa.c1 }}
        rascunho={null}
        gradeRef={gradeRef}
        aoTeclar={() => {}}
        aoApontarCelula={(l, c) => setFaixa({ l1: l, c1: c, l2: l, c2: c })}
        aoEntrarNaCelula={() => {}}
        aoApontarColuna={() => {}}
        aoApontarLinha={() => {}}
        aoMoverPonteiro={() => {}}
        aoSoltarPonteiro={() => {}}
        aoSairDaGrade={() => {}}
        aoAbrirEdicao={() => {}}
        aoEscrever={() => {}}
        aoConfirmar={() => {}}
        aoCancelar={() => {}}
        {...extras}
      />
    </>
  );
}

describe('as peças da grade continuam lá depois do recorte', () => {
  it('cabeçalho com letra, cabeçalho com número e o canto', () => {
    const container = montar(<Grade planilha={planilhaDeTeste(CLUBE)} />);
    const letras = [...container.querySelectorAll('.pl-cab-col')].map(t => t.textContent?.trim()[0]);
    expect(letras).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(container.querySelectorAll('.pl-cab-lin')).toHaveLength(8);
    expect(container.querySelector('.pl-canto')).not.toBeNull();
  });

  it('e o que está escrito aparece na célula', () => {
    const container = montar(<Grade planilha={planilhaDeTeste(CLUBE)} />);
    expect(textos(container, '.pl-valor')).toContain('Falcão');
    expect(textos(container, '.pl-valor')).toContain('12');
  });

  it('a fórmula aparece calculada, e não como texto', () => {
    const p = escrever(planilhaDeTeste(CLUBE), 5, 1, '=SOMA(B2:B4)');
    const container = montar(<Grade planilha={p} />);
    expect(textos(container, '.pl-valor')).toContain('32');
    expect(container.textContent).not.toContain('=SOMA');
  });
});

describe('as peças novas aparecem pela presença do setter', () => {
  /*
    É a regra do `aoBuscar` do Explorador. A AP043 não tem alça de
    preenchimento nem filtro, e desenhá-los lá prometeria gestos que aquele
    laboratório não faz — gesto sem efeito é o que ensina a desconfiar do
    programa.
  */
  it('sem aoComecarPreenchimento, não há alça de preenchimento', () => {
    const container = montar(<Grade planilha={planilhaDeTeste(CLUBE)} />);
    expect(container.querySelector('.pl-alca-preencher')).toBeNull();
  });

  it('com aoComecarPreenchimento, ela aparece na célula ativa', () => {
    const container = montar(<Grade planilha={planilhaDeTeste(CLUBE)} aoComecarPreenchimento={vi.fn()} />);
    expect(container.querySelector('.pl-alca-preencher')).not.toBeNull();
    /* E numa célula só: a alça é da ativa. */
    expect(container.querySelectorAll('.pl-alca-preencher')).toHaveLength(1);
  });

  it('sem aoAbrirFiltro, não há setinha de filtro', () => {
    const p = planilhaDeTeste(CLUBE, { tabela: { l1: 0, c1: 0, l2: 3, c2: 1 } });
    const container = montar(<Grade planilha={p} />);
    expect(container.querySelector('.pl-cab-bt')).toBeNull();
  });

  /*
    E a setinha só nasce onde há o que filtrar. Pô-la em toda coluna prometeria
    filtrar a coluna vazia da direita, que é um gesto sem efeito.
  */
  it('com aoAbrirFiltro, ela aparece só nas colunas da tabela declarada', () => {
    const p = planilhaDeTeste(CLUBE, { tabela: { l1: 0, c1: 0, l2: 3, c2: 1 } });
    const container = montar(<Grade planilha={p} aoAbrirFiltro={vi.fn()} />);
    expect(container.querySelectorAll('.pl-cab-bt')).toHaveLength(2);
  });

  it('sem aoArrastarBorda, não há alça de tamanho', () => {
    const container = montar(<Grade planilha={planilhaDeTeste(CLUBE)} />);
    expect(container.querySelector('.pl-alca-col')).toBeNull();
    repintar(<Grade planilha={planilhaDeTeste(CLUBE)} aoArrastarBorda={vi.fn()} />);
    expect(container.querySelector('.pl-alca-col')).not.toBeNull();
  });
});

describe('o que o modelo manda a grade desenhar', () => {
  const REGRA: RegraCondicional = {
    id: 'r1',
    faixa: { l1: 1, c1: 1, l2: 3, c2: 1 },
    quando: 'maiorQue',
    valor: '10',
    estilo: 'vermelho',
  };

  /*
    As três saem da planilha, e não do laboratório. Sem isso, cada laboratório
    teria de dizer à grade como pintar — e dois laboratórios pintariam
    diferente, que é a razão de a grade existir.
  */
  it('a formatação condicional pinta a célula que a regra alcança', () => {
    const p = planilhaDeTeste(CLUBE, { regras: [REGRA] });
    const container = montar(<Grade planilha={p} />);
    const acesas = [...container.querySelectorAll('.pl-cond-vermelho')].map(e => e.textContent?.trim());
    expect(acesas).toEqual(['12', '11']);
  });

  it('a linha escondida pelo filtro sai da tela e o cabeçalho fica', () => {
    const p = planilhaDeTeste(CLUBE, {
      tabela: { l1: 0, c1: 0, l2: 3, c2: 1 },
      filtro: { coluna: 0, valor: 'Falcão' },
    });
    const container = montar(<Grade planilha={p} />);
    const escondidas = container.querySelectorAll('tr.pl-escondida');
    expect(escondidas).toHaveLength(2);
    /* A linha 1, do cabeçalho, nunca some: sem ela não há onde clicar para
       tirar o filtro. */
    expect([...escondidas].some(tr => tr.textContent?.includes('Unidade'))).toBe(false);
  });

  it('e a linha congelada ganha a classe que a prende no alto', () => {
    const p = planilhaDeTeste(CLUBE, { congeladas: 2 });
    const container = montar(<Grade planilha={p} />);
    expect(container.querySelectorAll('tr.pl-congelada')).toHaveLength(2);
  });

  it('a setinha da ordenação aparece na coluna ordenada, e só nela', () => {
    const p = planilhaDeTeste(CLUBE, { ordenacao: { coluna: 1, crescente: true } });
    const container = montar(<Grade planilha={p} />);
    const marcas = container.querySelectorAll('.pl-cab-marca');
    expect(marcas).toHaveLength(1);
    expect(marcas[0].closest('.pl-cab-col')?.textContent?.trim()[0]).toBe('B');
  });
});

describe('a grade não guarda estado', () => {
  /*
    Nem um pedaço. Uma grade com seleção própria obrigaria os dois lados a
    concordar sobre a mesma célula ativa, que é a forma mais rápida de
    mostrarem coisas diferentes — a regra escrita em `explorer.tsx`.
  */
  it('a célula ativa é a que o chamador diz, e não a que foi clicada por último', () => {
    const gradeRef = { current: null };
    const container = montar(
      <GradeDoExcel
        planilha={planilhaDeTeste(CLUBE)}
        faixa={{ l1: 2, c1: 0, l2: 2, c2: 0 }}
        ativa={{ l: 2, c: 0 }}
        rascunho={null}
        gradeRef={gradeRef}
        aoTeclar={() => {}} aoApontarCelula={() => {}} aoEntrarNaCelula={() => {}}
        aoApontarColuna={() => {}} aoApontarLinha={() => {}} aoMoverPonteiro={() => {}}
        aoSoltarPonteiro={() => {}} aoSairDaGrade={() => {}} aoAbrirEdicao={() => {}}
        aoEscrever={() => {}} aoConfirmar={() => {}} aoCancelar={() => {}} />,
    );
    expect(container.querySelector('.pl-ativa')?.textContent?.trim()).toBe('Águia');

    repintar(
      <GradeDoExcel
        planilha={planilhaDeTeste(CLUBE)}
        faixa={{ l1: 3, c1: 1, l2: 3, c2: 1 }}
        ativa={{ l: 3, c: 1 }}
        rascunho={null}
        gradeRef={gradeRef}
        aoTeclar={() => {}} aoApontarCelula={() => {}} aoEntrarNaCelula={() => {}}
        aoApontarColuna={() => {}} aoApontarLinha={() => {}} aoMoverPonteiro={() => {}}
        aoSoltarPonteiro={() => {}} aoSairDaGrade={() => {}} aoAbrirEdicao={() => {}}
        aoEscrever={() => {}} aoConfirmar={() => {}} aoCancelar={() => {}} />,
    );
    expect(container.querySelector('.pl-ativa')?.textContent?.trim()).toBe('11');
  });
});
