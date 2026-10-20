// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoProjeto from './LaboratorioDoProjeto';
import {
  LICOES_DA_CC_ES012, metasDa, type LicaoDaCcEs012,
} from '../labs/metasDaCcEs012';
import { NOME_DA_PECA } from '../labs/projetoDocumental';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As dez lições da CC-ES012, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  `metasDaCcEs012.test.ts` prova que cada meta **pode** ficar verde: ele monta o
  conjunto que uma pessoa aplicada deixaria e chama `feita`. Isso não prova que
  a tela produz aquele conjunto. Um botão sem `onClick`, um menu que não abre,
  um campo que não existe — o motor continua correto e a lição fica impossível
  de vencer, que é pior do que uma que abre resolvida: uma deixa uma tarefa
  verde de graça, a outra deixa quem fez tudo certo olhando uma lista vermelha
  sem nada na tela que explique. "Trava de motor não é trava de tela."

  Aqui ela carrega mais do que nas outras veredas: esta é a única que abre seis
  programas, e cada superfície é um arquivo. Um despacho errado abriria a lição
  certa na janela errada — e o `Record` do componente impede o tipo novo de
  compilar sem tela, mas não impede uma entrada apontar para a superfície do
  vizinho.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES012' } as Vereda;

function montar(qual: LicaoDaCcEs012) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'projeto',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'projeto' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoProjeto vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

/*
  `campo.value = x` não chega ao React: ele guarda o último valor que ele mesmo
  pôs e descarta o evento quando os dois batem. Quem desfaz isso é o setter
  nativo do protótipo — e é por protótipo, porque `input` e `textarea` são dois.
*/
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement | HTMLTextAreaElement;
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

/*
  A grade do Excel seleciona no **pointerdown**, e não no clique.

  Despachar `click` numa célula não move a seleção: ela fica onde estava, e o
  que se escreve na barra de fórmulas vai para a célula de antes. A trava
  acusaria o componente de um defeito que é do teste — é a irmã do
  `pointerenter` que o React não escuta, anotada em `gradeDoExcel.test.tsx`.
*/
const apontar = (alvo: Element | null | undefined, nome: string) => {
  expect(alvo, `não achei ${nome} na tela`).toBeTruthy();
  act(() => {
    alvo!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
  });
};

/** Escolher num `<select>`, pelo setter nativo do protótipo. */
const escolher = (campo: Element | null | undefined, valor: string, nome: string) => {
  expect(campo, `não achei a lista "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLSelectElement;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, valor);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const campoPorRotulo = (rotulo: string) =>
  [...container.querySelectorAll('label')]
    .find(l => l.textContent?.includes(rotulo))
    ?.querySelector('textarea, input');

/** As tarefas que continuam vermelhas, pelo placar que a moldura escreve. */
const faltam = (): number => {
  const texto = container.textContent ?? '';
  const casa = texto.match(/(\d+) de (\d+) concluídas/);
  if (!casa) return -1;
  return Number(casa[2]) - Number(casa[1]);
};

const quantas = (licao: LicaoDaCcEs012) => metasDa(licao).length;

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

describe('o módulo 1: a proposta', () => {
  it('fecha as três escrevendo e enviando', () => {
    montar('proposta');
    expect(faltam(), 'a lição não abriu com todas por fazer').toBe(quantas('proposta'));

    escrever(campoPorRotulo('Qual necessidade'),
      'A feira recomeça do zero todo ano e ninguém sabe quantas unidades vêm antes da semana da feira.',
      'necessidade');
    escrever(campoPorRotulo('Para quem o conjunto é'),
      'A secretaria, a tesouraria e os conselheiros das unidades.', 'para quem');
    escrever(campoPorRotulo('O que vai contar como pronto'),
      'Quando uma inscrição nova aparecer sozinha nas outras peças.', 'pronto');

    for (const peca of ['documento', 'planilha', 'formulario', 'apresentacao', 'dossie'] as const) {
      clicar(botao(NOME_DA_PECA[peca]), `peça ${peca}`);
    }

    clicar(botao('Enviar para aprovação'), 'enviar para aprovação');
    expect(faltam(), 'a proposta escrita e aprovada não fechou a lição').toBe(0);
  });

  /*
    O caminho errado, pela tela: construir antes e pedir aprovação depois. A
    meta não fecha, e é o requisito 2 com todas as letras.
  */
  it('quem começa a montar antes da aprovação não fecha', () => {
    montar('proposta');
    clicar(botao('Começar a montar o conjunto'), 'começar a montar');

    escrever(campoPorRotulo('Qual necessidade'),
      'A feira recomeça do zero todo ano e ninguém sabe quantas unidades vêm antes da semana.',
      'necessidade');
    escrever(campoPorRotulo('Para quem o conjunto é'), 'A secretaria e a tesouraria.', 'para quem');
    escrever(campoPorRotulo('O que vai contar como pronto'),
      'Quando uma inscrição nova aparecer sozinha nas outras peças.', 'pronto');
    for (const peca of ['documento', 'planilha', 'formulario', 'apresentacao', 'dossie'] as const) {
      clicar(botao(NOME_DA_PECA[peca]), `peça ${peca}`);
    }
    clicar(botao('Enviar para aprovação'), 'enviar para aprovação');

    expect(faltam(), 'começar antes da aprovação devia deixar uma tarefa vermelha').toBe(1);
  });
});

/* ── Módulo 2: o regulamento ──────────────────────────────────────────────── */

describe('o módulo 2: o regulamento', () => {
  it('fecha as duas pela faixa do Word', () => {
    montar('documento');
    expect(faltam()).toBe(quantas('documento'));

    clicar(porTexto('.wd-guia', 'Início'), 'guia Início');
    clicar(porRotulo('Modificar Título 1: fonte'), 'modificar Título 1');

    clicar(porTexto('.wd-guia', 'Inserir'), 'guia Inserir');
    clicar(porRotulo('Escrever a seção Onde está cada peça'), 'seção nova');

    clicar(porTexto('.wd-guia', 'Referências'), 'guia Referências');
    clicar(porRotulo('Atualizar Sumário'), 'atualizar sumário');

    expect(faltam(), 'a identidade e a seção não fecharam a lição').toBe(0);
  });

  /* A seção nova sem atualizar o sumário deixa a tarefa vermelha. */
  it('a seção sem atualizar o sumário não fecha', () => {
    montar('documento');
    clicar(porTexto('.wd-guia', 'Início'), 'guia Início');
    clicar(porRotulo('Modificar Título 1: fonte'), 'modificar Título 1');
    clicar(porTexto('.wd-guia', 'Inserir'), 'guia Inserir');
    clicar(porRotulo('Escrever a seção Onde está cada peça'), 'seção nova');
    expect(faltam(), 'o sumário velho devia deixar a tarefa vermelha').toBe(1);
  });
});

/* ── Módulo 3: a planilha ─────────────────────────────────────────────────── */

describe('o módulo 3: a planilha de controle', () => {
  it('fecha as duas escrevendo a fórmula e pintando o título', () => {
    montar('planilha');
    expect(faltam()).toBe(quantas('planilha'));

    /* A fórmula do total, pela barra de fórmulas — que é onde se escreve numa
       planilha, e não só dentro da célula. */
    const celulaDoTotal = container.querySelectorAll('.pl-grade tbody tr')[5]
      ?.querySelectorAll('td')[1];
    apontar(celulaDoTotal, 'célula do total');
    escrever(porRotulo('Barra de fórmulas'), '=B3*B5', 'barra de fórmulas');
    act(() => {
      porRotulo('Barra de fórmulas')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    /* E a cor do conjunto na célula do título. */
    const titulo = container.querySelectorAll('.pl-grade tbody tr')[0]
      ?.querySelectorAll('td')[0];
    apontar(titulo, 'célula do título');
    clicar(porRotulo('Cor da fonte: a cor do conjunto'), 'cor da fonte');

    expect(faltam(), 'a fórmula e a cor não fecharam a lição').toBe(0);
  });
});

/* ── Módulo 4: o formulário ───────────────────────────────────────────────── */

describe('o módulo 4: o formulário', () => {
  it('fecha as três pelo construtor', () => {
    montar('formulario');
    expect(faltam()).toBe(quantas('formulario'));
    clicar(botao('Separar unidade e especialidade'), 'separar os campos');
    expect(faltam(), 'arrumar o formulário não fechou as três').toBe(0);
  });
});

/* ── Módulo 5: a importação ───────────────────────────────────────────────── */

describe('o módulo 5: do formulário para a planilha', () => {
  /** Escreve na célula pela barra de fórmulas, que é onde se escreve. */
  const escreverNaCelula = (linha: number, formula: string) => {
    const celula = container.querySelectorAll('.pl-grade tbody tr')[linha]
      ?.querySelectorAll('td')[1];
    apontar(celula, `célula da linha ${linha + 1}`);
    escrever(porRotulo('Barra de fórmulas'), formula, 'barra de fórmulas');
    act(() => {
      porRotulo('Barra de fórmulas')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
  };

  it('importa e escreve as duas fórmulas sobre a aba de respostas', () => {
    montar('importar');
    expect(faltam()).toBe(quantas('importar'));

    clicar(botao('Importar para a planilha'), 'importar');

    /* E atravessa para a planilha pela barra de tarefas, porque é lá que as
       fórmulas moram. Com uma tela só, esta lição era impossível de vencer. */
    clicar(porTexto('.bn-tarefa', 'Excel'), 'barra de tarefas: Excel');
    escreverNaCelula(2, '=CONT.VALORES(Respostas!B2:B20)');
    escreverNaCelula(3, '=SOMA(Respostas!D2:D20)');

    expect(faltam(), 'importar e as duas fórmulas não fecharam a lição').toBe(0);
  });

  /* A contagem escrita sobre a própria aba de controle é fórmula, devolve o
     número certo de hoje, e não cresce com a aba de respostas. */
  it('a contagem que não cita a aba de respostas não fecha', () => {
    montar('importar');
    clicar(botao('Importar para a planilha'), 'importar');
    clicar(porTexto('.bn-tarefa', 'Excel'), 'barra de tarefas: Excel');
    escreverNaCelula(2, '=6');
    escreverNaCelula(3, '=SOMA(Respostas!D2:D20)');
    expect(faltam(), 'a contagem local devia deixar a tarefa vermelha').toBeGreaterThan(0);
  });
});

/* ── Módulo 6: a apresentação ─────────────────────────────────────────────── */

describe('o módulo 6: a apresentação', () => {
  it('fecha as duas pelo mestre e pelo gráfico', () => {
    montar('apresentacao');
    expect(faltam()).toBe(quantas('apresentacao'));

    clicar(porTexto('.pp-guia', 'Exibir'), 'guia Exibir');
    clicar(porRotulo('Slide Mestre'), 'slide mestre');
    clicar(porRotulo('Fontes e cor do conjunto'), 'identidade no mestre');

    clicar(porTexto('.pp-guia', 'Inserir'), 'guia Inserir');
    clicar(porRotulo('Gráfico com vínculo para a planilha de controle'), 'gráfico com vínculo');

    expect(faltam(), 'o mestre e o gráfico não fecharam a lição').toBe(0);
  });
});

/* ── Módulo 7: o dossiê ───────────────────────────────────────────────────── */

describe('o módulo 7: o dossiê', () => {
  it('fecha as duas combinando as peças de distribuição', () => {
    montar('dossie');
    expect(faltam()).toBe(quantas('dossie'));
    for (const peca of ['Documento', 'Apresentação']) {
      const linha = [...container.querySelectorAll('.pdf-linha')]
        .find(l => l.textContent?.includes(peca));
      clicar(linha?.querySelector('input'), `caixa de ${peca}`);
    }
    clicar(porTexto('.pdf-bt', 'Combinar'), 'combinar');
    expect(faltam(), 'combinar as duas de distribuição não fechou a lição').toBe(0);
  });

  /* O caminho errado, pela tela: juntar a planilha de controle também. */
  it('juntar a planilha de controle não fecha', () => {
    montar('dossie');
    for (const peca of ['Documento', 'Apresentação', 'Planilha de controle']) {
      const linha = [...container.querySelectorAll('.pdf-linha')]
        .find(l => l.textContent?.includes(peca));
      clicar(linha?.querySelector('input'), `caixa de ${peca}`);
    }
    clicar(porTexto('.pdf-bt', 'Combinar'), 'combinar');
    expect(faltam(), 'o dossiê com a planilha dentro devia deixar a tarefa vermelha')
      .toBeGreaterThan(0);
  });
});

/* ── Módulo 8: o repositório ──────────────────────────────────────────────── */

describe('o módulo 8: o repositório', () => {
  it('fecha as três pelos três gestos da nuvem', () => {
    montar('repositorio');
    expect(faltam()).toBe(quantas('repositorio'));

    clicar(botao('Renomear no padrão da CC-ES001'), 'renomear no padrão');
    clicar(botao('Acerto do acesso por função'), 'acerto do acesso');
    clicar(botao('Convidar quem escreve com você'), 'convidar');

    expect(faltam(), 'os três gestos não fecharam a lição').toBe(0);
  });
});

/* ── Módulo 9: as instruções e a entrega ──────────────────────────────────── */

describe('o módulo 9: as instruções', () => {
  it('fecha as duas escrevendo a descrição e transferindo a propriedade', () => {
    montar('instrucoes');
    expect(faltam()).toBe(quantas('instrucoes'));

    for (const rotulo of [
      'Por onde a próxima diretoria começa',
      'O que se troca a cada ano',
      'O que não se mexe, e por quê',
      'Como o acesso se transfere',
    ]) {
      escrever(campoPorRotulo(rotulo),
        'Abra o regulamento primeiro, e não apague as células de fórmula da aba Controle.',
        rotulo);
    }

    /*
      E as três peças passam para a conta da diretoria, uma a uma.

      Só se transfere para quem **já tem acesso**, que é a ordem do Drive: dar
      o acesso primeiro, transferir depois. E é por peça, porque é por peça que
      a nuvem transfere — três arquivos, três transferências.
    */
    const entrarNa = (nome: string) => {
      const linha = [...container.querySelectorAll('.nv-linha')]
        .find(l => l.textContent?.includes(nome));
      expect(linha, `não achei "${nome}" na lista`).toBeTruthy();
      act(() => { linha!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); });
    };
    /* A caixa de compartilhar fecha pelo fundo, como todo diálogo da nuvem. */
    const fecharCaixa = () => clicar(container.querySelector('.nv-fundo'), 'fundo da caixa');
    /* E a volta é pela migalha da pasta do projeto — a última não tem clique,
       porque é onde se está. */
    const voltarAoProjeto = () =>
      clicar(porTexto('.nv-migalha', 'feira-de-especialidades'), 'migalha do projeto');

    for (const [pasta, peca] of [
      ['secretaria', 'regulamento'],
      ['tesouraria', 'controle-da-feira'],
      ['divulgacao', 'feira-divulgacao'],
    ] as const) {
      entrarNa(pasta);
      entrarNa(peca);

      escolher(porRotulo('Pessoa a adicionar'), 'lideranca', 'pessoa a adicionar');
      clicar(porTexto('button', 'Dar acesso de editor'), 'dar acesso de editor');

      /* A transferência é uma **opção** do seletor de permissão de quem recebe,
         e não um botão: é onde a nuvem de verdade a esconde. */
      const seletor = [...container.querySelectorAll('select.nv-papel')]
        .find(sel => [...sel.querySelectorAll('option')]
          .some(o => (o as HTMLOptionElement).value === 'transferir'));
      escolher(seletor, 'transferir', `permissão em ${peca}`);
      fecharCaixa();
      voltarAoProjeto();
    }

    expect(faltam(), 'a descrição e as três transferências não fecharam a lição').toBe(0);
  });
});

/* ── Módulo 10: os quinze minutos ─────────────────────────────────────────── */

describe('o módulo 10: os quinze minutos', () => {
  it('vincula, propaga, refaz o dossiê e cabe no tempo', () => {
    montar('quinze-minutos');
    expect(faltam()).toBe(quantas('quinze-minutos'));

    for (const bt of [...container.querySelectorAll('button')]
      .filter(b => b.textContent?.includes('Colar vínculo'))) {
      clicar(bt, 'colar vínculo');
    }

    clicar(botao('Chegou uma inscrição nova'), 'inscrição nova');
    clicar(botao('Exportar o dossiê de novo'), 'exportar o dossiê');
    escrever(porRotulo('Minutos da demonstração'), '12', 'minutos');

    expect(faltam(), 'a demonstração completa não fechou a lição').toBe(0);
  });

  /* E o dossiê de antes da mudança não vale: o PDF congela. */
  it('não exportar o dossiê de novo deixa a tarefa vermelha', () => {
    montar('quinze-minutos');
    for (const bt of [...container.querySelectorAll('button')]
      .filter(b => b.textContent?.includes('Colar vínculo'))) {
      clicar(bt, 'colar vínculo');
    }
    clicar(botao('Chegou uma inscrição nova'), 'inscrição nova');
    escrever(porRotulo('Minutos da demonstração'), '12', 'minutos');
    expect(faltam(), 'o dossiê velho devia deixar a tarefa vermelha').toBeGreaterThan(0);
  });
});

/* ── O despacho ───────────────────────────────────────────────────────────── */

describe('cada lição abre na superfície dela', () => {
  const MARCA: Record<LicaoDaCcEs012, string> = {
    proposta: '.card',
    documento: '.wd-janela',
    planilha: '.pl-janela',
    formulario: '.fb-janela',
    importar: '.fb-janela',
    apresentacao: '.pp-janela',
    dossie: '.pdf-janela',
    repositorio: '.nv-janela',
    instrucoes: '.nv-janela',
    'quinze-minutos': '.card',
  };

  it.each(Object.keys(LICOES_DA_CC_ES012) as LicaoDaCcEs012[])('%s', licao => {
    montar(licao);
    expect(container.querySelector(MARCA[licao]), `${licao} não abriu na janela dela`)
      .toBeTruthy();
  });

  /* A guarda contra o vazio: um registro que esvaziasse deixaria a trava
     verde por não ter conferido lição nenhuma. */
  it('as dez lições estão no registro', () => {
    expect(Object.keys(LICOES_DA_CC_ES012)).toHaveLength(10);
  });
});
