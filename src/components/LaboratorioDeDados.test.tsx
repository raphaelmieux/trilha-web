// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeDados from './LaboratorioDeDados';
import {
  LICOES_DA_CC_ES008, NOME_DO_CSV, UNIDADE_DA_EDUARDA, type LicaoDaCcEs008,
} from '../labs/metasDaCcEs008';
import { NOME_DO_TIPO, UNIDADES } from '../labs/formulario';
import { ROTULO_VAZIO } from '../labs/planilha';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As oito lições da CC-ES008, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs008.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a tela chama alguma delas: um botão sem `onClick`,
  um diálogo que não aplica, uma aba que não troca — o motor continua correto e
  o laboratório fica impossível de vencer, que é pior do que um que abre
  resolvido, porque quem fez tudo certo fica olhando uma lista vermelha sem
  nada na tela que explique.

  É a mesma razão de `LaboratorioDePlanilha.test.tsx` e de
  `LaboratorioDeExplorador.test.tsx`, e está escrita lá: "trava de motor não é
  trava de tela".

  ── E ela é de quatro telas ──────────────────────────────────────────────
  Construtor de formulários, planilha, editor de texto e a tela da plataforma.
  Duas lições começam numa e terminam noutra, e é justamente a travessia que
  nenhum teste de motor sente: o CSV sai da planilha e é lido no editor.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES008' } as Vereda;

function montar(qual: LicaoDaCcEs008) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'dados',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: LICOES_DA_CC_ES008[qual].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'dados' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeDados vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ─────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined) => {
  act(() => { alvo?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const apontar = (alvo: Element) => {
  act(() => {
    alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
  });
};

/*
  Passar o ponteiro por cima: é `pointerover`, e não `pointerenter`. O React não
  escuta `pointerenter` — ele não borbulha —, e implementa `onPointerEnter` a
  partir de `pointerover` na raiz. Está escrito em `LaboratorioDePlanilha.test`,
  e foi assim que aquela trava nasceu vermelha com o navegador verde.
*/
const passarPor = (alvo: Element) => {
  act(() => { alvo.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })); });
};

const soltar = () => {
  act(() => {
    container.querySelector('.pl-grade-caixa')!
      .dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
};

const teclar = (alvo: Element, key: string, extra: KeyboardEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

/** Escreve num campo pelo setter nativo, que é o que chega ao React. */
const escreverEm = (campo: HTMLInputElement | HTMLSelectElement, valor: string) => {
  act(() => {
    const proto = campo instanceof HTMLSelectElement
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(campo, valor);
    campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};

const porTexto = <T extends Element>(seletor: string, texto: string): T | undefined =>
  [...container.querySelectorAll<T>(seletor)].find(x => x.textContent?.trim() === texto);

const botao = (dica: string) =>
  container.querySelector<HTMLButtonElement>(`button[title="${dica}"]`);

/** Quantas tarefas continuam abertas, lido do painel da plataforma. */
const abertas = () => {
  const texto = container.textContent ?? '';
  const m = /(\d+) de (\d+) conclu/.exec(texto);
  if (!m) throw new Error('o painel de tarefas não está na tela');
  return Number(m[2]) - Number(m[1]);
};

/* ── A planilha ────────────────────────────────────────────────────────────── */

const grade = () => container.querySelector('.pl-grade-caixa')!;
const linhaDaGrade = (l: number) => container.querySelectorAll('.pl-grade tbody tr')[l];
const celula = (l: number, c: number) => linhaDaGrade(l).querySelectorAll('td')[c];
const cabecalhoDaLinha = (l: number) => linhaDaGrade(l).querySelector('th')!;
const lido = (l: number, c: number) => celula(l, c).textContent?.trim() ?? '';
const barra = () => container.querySelector<HTMLInputElement>('.pl-entrada')!;

const guia = (nome: string) => clicar(porTexto('.pl-guia', nome));
const aba = (nome: string) => clicar(porTexto('.pl-aba', nome));

/** Escreve numa célula pela barra de fórmulas, que é como se monta uma planilha. */
const escrever = (l: number, c: number, texto: string) => {
  apontar(celula(l, c));
  const campo = barra();
  act(() => { campo.focus(); campo.dispatchEvent(new FocusEvent('focus', { bubbles: true })); });
  escreverEm(barra(), texto);
  teclar(barra(), 'Enter');
};

const arrastarFaixa = (l1: number, c1: number, l2: number, c2: number) => {
  apontar(celula(l1, c1));
  passarPor(celula(l2, c2));
  soltar();
};

/** Quantas linhas a grade tem, para achar o fim da tabela sem contar na mão. */
const linhasDaGrade = () => container.querySelectorAll('.pl-grade tbody tr').length;

/** A última linha com alguma coisa escrita na coluna dada. */
const ultimaEscrita = (coluna: number) => {
  let fim = -1;
  for (let l = 0; l < linhasDaGrade(); l++) if (lido(l, coluna)) fim = l;
  return fim;
};

/* ── Módulo 1 e 2: o construtor ────────────────────────────────────────────── */

/** O cartão de uma pergunta, achado pelo rótulo dela — como quem procura na tela. */
const cartaoDe = (rotulo: string): HTMLElement => {
  const alvo = [...container.querySelectorAll<HTMLElement>('.fb-cartao')]
    .find(x => x.querySelector('.fb-rotulo')?.textContent?.trim() === rotulo);
  if (!alvo) throw new Error(`não há cartão para a pergunta "${rotulo}"`);
  return alvo;
};

const trocarTipo = (rotulo: string, tipo: keyof typeof NOME_DO_TIPO) => {
  const cartao = cartaoDe(rotulo);
  clicar(cartao.querySelector('.fb-tipo'));
  const item = [...cartaoDe(rotulo).querySelectorAll('.fb-item')]
    .find(x => x.textContent?.trim() === NOME_DO_TIPO[tipo]);
  clicar(item);
};

describe('as lições da CC-ES008 se vencem clicando', () => {
  it('módulo 1 — campos: o tipo de cada pergunta, e a lista das unidades', () => {
    montar('campos');
    expect(abertas()).toBe(3);

    trocarTipo('Quantas diárias', 'numero');
    trocarTipo('Unidade', 'lista');

    /* As seis unidades, escritas uma a uma: a opção nova nasce "Opção N", e é
       quem monta o formulário que diz o nome de cada unidade. */
    UNIDADES.forEach((unidade, i) => {
      if (i > 0) {
        const mais = [...cartaoDe('Unidade').querySelectorAll('.fb-item')]
          .find(x => x.textContent?.trim() === 'Adicionar opção');
        clicar(mais);
      }
      const campo = cartaoDe('Unidade')
        .querySelector<HTMLInputElement>(`input[aria-label="Opção ${i + 1}"]`)!;
      escreverEm(campo, unidade);
    });

    expect(abertas(), 'a lição dos tipos não fecha clicando').toBe(0);
  });

  it('módulo 2 — validação: obrigatório, regra, a recusa e a resposta que passa', () => {
    montar('validacao');
    expect(abertas()).toBe(4);

    const email = cartaoDe('E-mail do responsável');
    clicar(email.querySelector('button[aria-label="Obrigatório"]'));
    clicar(cartaoDe('E-mail do responsável').querySelector('button[aria-label="Mais opções"]'));
    clicar([...cartaoDe('E-mail do responsável').querySelectorAll('.fb-item')]
      .find(x => x.textContent?.trim() === 'Validação de resposta'));
    clicar(porTexto('.fb-bt', 'Salvar'));

    /* Visualizar, e enviar com o obrigatório em branco: é a recusa que o
       requisito manda ver acontecer. */
    clicar(botao('Visualizar'));
    clicar(porTexto('.fb-bt', 'Enviar'));
    expect(container.querySelector('.fb-recusa'), 'o formulário não recusou nada').not.toBeNull();

    /* E agora uma resposta boa, pela porta da frente. */
    /* Campo que não se acha **estoura**, e não é pulado em silêncio: um rótulo
       renomeado deixaria a prévia sem preencher e o teste seguiria adiante
       olhando a tarefa errada. */
    const responder = (rotulo: string, valor: string) => {
      const campo = container.querySelector<HTMLElement>(`[aria-label="${rotulo}"]`);
      if (!campo) throw new Error(`a prévia não tem campo para "${rotulo}"`);
      escreverEm(campo as HTMLInputElement, valor);
    };
    responder('Nome do desbravador', 'Rafael Nunes');
    responder('E-mail do responsável', 'rafael@exemplo.com');
    responder('Quantas diárias', '3');
    responder('Unidade', UNIDADES[0]);
    clicar(porTexto('.fb-bt', 'Enviar'));

    expect(abertas(), 'a lição da validação não fecha clicando').toBe(0);
  });

  /* ── Módulo 3 a 7: a planilha ──────────────────────────────────────────── */

  it('módulo 3 — base: tirar o título, tirar o total, declarar a faixa e somar no relatório', () => {
    montar('base');
    expect(abertas()).toBe(4);

    guia('Página Inicial');
    /* O título solto na primeira linha, e o TOTAL lá embaixo: os dois são
       linhas inteiras, e é a linha que sai. */
    apontar(cabecalhoDaLinha(0));
    clicar(botao('Excluir Linhas da Planilha'));
    apontar(cabecalhoDaLinha(ultimaEscrita(0)));
    clicar(botao('Excluir Linhas da Planilha'));

    const ultima = ultimaEscrita(0);
    arrastarFaixa(0, 0, ultima, 5);
    guia('Inserir');
    clicar(botao('Formatar como Tabela'));

    aba('Relatório');
    escrever(0, 0, 'Diárias somadas');
    escrever(0, 1, `=SOMA(Respostas!E2:E${ultima + 1})`);

    expect(abertas(), 'a lição da base não fecha clicando').toBe(0);
  });

  it('módulo 4 — resumo: a tabela dinâmica, e as duas linhas que ela denuncia', () => {
    montar('resumo');
    expect(abertas()).toBe(3);

    guia('Inserir');
    clicar(botao('Tabela dinâmica'));
    const dialogo = container.querySelector('.pl-dialogo')!;
    const campos = dialogo.querySelectorAll<HTMLSelectElement>('select');
    escreverEm(campos[0], '2');
    escreverEm(campos[1], '4');
    clicar(porTexto('.pl-dialogo-bt', 'Criar'));

    /* O resumo abre na aba onde nasceu. Clicar numa grafia que não é do clube
       é ver que ela virou grupo próprio; clicar no "(vazio)" é achar o grupo
       sem nome. São dois cliques, em duas linhas diferentes. */
    /* Só a coluna dos rótulos: a de números também é do resumo, e um "4" lido
       de lá viraria uma grafia que não existe em célula nenhuma da esquerda. */
    const rotulos = [...container.querySelectorAll('.pl-grade tbody tr')]
      .map(tr => tr.querySelectorAll('td')[0])
      .filter(td => td?.classList.contains('pl-resumo'))
      .map(td => td.textContent?.trim() ?? '');
    expect(rotulos.length, 'o resumo não foi desenhado na grade').toBeGreaterThan(2);

    const clicarNoRotulo = (texto: string) => {
      for (let l = 0; l < linhasDaGrade(); l++) {
        if (lido(l, 0) === texto) { apontar(celula(l, 0)); return true; }
      }
      return false;
    };
    const estranha = rotulos.find(x => x && x !== ROTULO_VAZIO && !UNIDADES.includes(x)
      && x !== 'Rótulos de Linha');
    expect(estranha, 'o resumo não relatou nenhuma grafia fora da lista do clube').toBeTruthy();
    expect(clicarNoRotulo(estranha!), 'a grafia estranha não está numa célula clicável').toBe(true);
    expect(clicarNoRotulo(ROTULO_VAZIO), 'o grupo sem nome não apareceu no resumo').toBe(true);

    expect(abertas(), 'a lição do resumo não fecha clicando').toBe(0);
  });

  it('o relatório de tabela dinâmica recusa a digitação em vez de engoli-la', () => {
    /*
      O resumo é desenhado por cima das células, e não gravado dentro delas.
      Sem a guarda, digitar ali grava por baixo: o texto entra na célula, o
      resumo continua desenhado em cima, e o que foi escrito não aparece em
      lugar nenhum — a planilha pareceria ter engolido a digitação.

      Ela **avisa em vez de agir**, que é a decisão do "selecione primeiro" do
      laboratório de Word e do Aceitar sem marca escolhida do de revisão.
    */
    montar('conserto');
    aba('Relatório');
    const noResumo = [...container.querySelectorAll('.pl-grade tbody tr')]
      .findIndex(tr => tr.querySelectorAll('td')[0]?.classList.contains('pl-resumo'));
    expect(noResumo, 'o resumo não foi desenhado na aba Relatório').toBeGreaterThan(-1);

    const antes = lido(noResumo + 1, 0);
    escrever(noResumo + 1, 0, 'Arara');
    expect(lido(noResumo + 1, 0), 'a digitação entrou por baixo do resumo').toBe(antes);
    expect(container.textContent, 'a planilha engoliu a digitação sem dizer nada')
      .toContain('relatório de tabela dinâmica');
  });

  it('módulo 5 — conserto: uma grafia por unidade, ninguém sem unidade, e Atualizar', () => {
    montar('conserto');
    expect(abertas()).toBe(4);

    /* Cada registro é lido da tela e corrigido, como quem passa os olhos pela
       coluna. Nada aqui sabe de antemão qual linha está errada. */
    const certa = (v: string) => UNIDADES.find(u =>
      u.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      === v.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));

    const ultima = ultimaEscrita(1);
    for (let l = 1; l <= ultima; l++) {
      const unidade = lido(l, 2);
      if (!unidade) escrever(l, 2, UNIDADE_DA_EDUARDA);
      else if (!UNIDADES.includes(unidade)) escrever(l, 2, certa(unidade) ?? unidade);
      const diarias = lido(l, 4);
      if (diarias.includes('.')) escrever(l, 4, diarias.replace('.', ','));
    }

    guia('Dados');
    clicar(botao('Atualizar Tudo'));

    expect(abertas(), 'a lição do conserto não fecha clicando').toBe(0);
  });

  it('módulo 6 — csv: exportar, abrir no editor, e provocar a aspa', () => {
    montar('csv');
    expect(abertas()).toBe(3);

    const exportar = () => {
      guia('Arquivo');
      clicar(porTexto('.pl-dialogo-bt', 'Salvar'));
    };
    const abrirNoEditor = () => {
      clicar(porTexto('.bn-tarefa', 'Bloco de Notas'));
      clicar(porTexto('.bn-menu', 'Arquivo'));
      clicar(porTexto('.bn-item', 'Abrir…'));
      clicar(porTexto('.bn-item', NOME_DO_CSV));
    };

    exportar();
    abrirNoEditor();
    expect(container.querySelector('.bn-texto')?.textContent, 'o editor abriu vazio')
      .toContain('Enviado em');

    /* Uma observação com ponto e vírgula dentro, e o arquivo põe aspas em volta
       dela — senão a linha inteira desandaria. */
    clicar(porTexto('.bn-tarefa', 'Excel'));
    escrever(1, 5, 'Vegetariana; chega no sábado');
    exportar();
    abrirNoEditor();
    expect(container.querySelector('.bn-texto')?.textContent, 'a aspa não apareceu no arquivo')
      .toContain('"');

    expect(abertas(), 'a lição do CSV não fecha clicando').toBe(0);
  });

  it('módulo 7 — agenda: copiar para a outra aba, declarar a tabela e classificar', () => {
    montar('agenda');
    expect(abertas()).toBe(2);

    const ultima = ultimaEscrita(0);
    arrastarFaixa(0, 0, ultima, 3);
    teclar(grade(), 'c', { ctrlKey: true });

    aba('Agenda em ordem');
    apontar(celula(0, 0));
    teclar(grade(), 'v', { ctrlKey: true });

    arrastarFaixa(0, 0, ultima, 3);
    guia('Inserir');
    clicar(botao('Formatar como Tabela'));

    apontar(celula(0, 0));
    guia('Dados');
    clicar(botao('Classificar de A a Z'));

    expect(abertas(), 'a lição da agenda não fecha clicando').toBe(0);
  });

  /* ── Módulo 8: a tela da plataforma ────────────────────────────────────── */

  it('módulo 8 — entrega: classificar, escolher três cuidados e apagar a cópia', () => {
    montar('entrega');
    expect(abertas()).toBe(3);

    const marcar = (rotulo: string) => {
      const alvo = [...container.querySelectorAll('label')]
        .find(x => x.textContent?.includes(rotulo));
      const caixa = alvo?.querySelector('input[type="checkbox"]');
      if (!caixa) throw new Error(`não há caixa para marcar "${rotulo}"`);
      clicar(caixa);
    };

    marcar('Nome do desbravador');
    marcar('E-mail do responsável');
    marcar('Alguma observação');

    marcar('Só quem precisa dos dados');
    marcar('Quando o trabalho acaba');
    marcar('A base tem prazo');

    const apagar = [...container.querySelectorAll('button')]
      .find(x => x.textContent?.includes('Apagar, e apagar da lixeira'));
    if (!apagar) throw new Error('a pasta de downloads não oferece como apagar a cópia');
    clicar(apagar);

    expect(abertas(), 'a lição da entrega não fecha clicando').toBe(0);
  });
});

/*
  E a lista de lições sai do registro, e não de uma lista escrita à mão.

  Trava com lista escrita à mão para de conferir sozinha: a nona lição entra,
  ninguém a acrescenta aqui, e a build segue verde levando as oito velhas até o
  fim — que é indistinguível de estar tudo certo.
*/
describe('todas as lições do registro são levadas até o fim', () => {
  it('não há lição da CC-ES008 fora desta trava', () => {
    const cobertas: LicaoDaCcEs008[] = [
      'campos', 'validacao', 'base', 'resumo', 'conserto', 'csv', 'agenda', 'entrega',
    ];
    expect([...cobertas].sort()).toEqual(Object.keys(LICOES_DA_CC_ES008).sort());
  });
});
