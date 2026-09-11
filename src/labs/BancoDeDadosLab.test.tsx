// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import BancoDeDadosLab from './BancoDeDadosLab';
import {
  METAS_DA_AGENDA, LISTA_DO_CLUBE, CAMPOS_PEDIDOS, COLUNAS_DA_LISTA,
  CAMPO_DA_COLUNA, REGRA_DE_EMAIL, temArroba,
} from './metasDaAp044';

/*
  A agenda do clube, montada clicando.

  `metasDaAp044.test.ts` prova que nenhuma das sete nasce verde e que existe um
  estado que fecha todas. O que ele não alcança é a ligação entre o botão e o
  banco — e é ali que este laboratório tem mais o que dar errado do que os
  outros, porque quase tudo acontece em duas telas que não são a principal: o
  modo de estrutura e o assistente de importação.

  "Laboratório que ninguém consegue vencer é pior do que um que abre resolvido."
  Este arquivo faz o percurso inteiro e cobra as sete verdes no fim.
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
        <BancoDeDadosLab
          specialtyCode="AP044" lessonCode="AP044.3-L2"
          lessonTitle="Montando a agenda do clube"
          requirementCodes={['AP044-6.1']}
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
const guia = (nome: string) => porTexto('.ac-guia', nome);
const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.ac-menu-item')].find(e => e.textContent?.trim() === texto);

/** Escreve num campo controlado, como o navegador escreveria. */
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
};

/** Quais tarefas o painel da moldura mostra como concluídas. */
const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DA_AGENDA) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);

/** Cria a tabela e escreve os quatro campos, que é a porta de tudo o mais. */
const declararOsCampos = (tipoDoTelefone = 'Texto Curto') => {
  clicar(guia('Criar'), 'guia Criar');
  clicar(porRotulo('Tabela'), 'Tabela');
  CAMPOS_PEDIDOS.forEach((p, i) => {
    escrever(porRotulo(`Nome do campo ${i + 1}`), p.nome, p.nome);
  });
  /* O tipo só é escolhido no telefone: os outros já nascem em Texto Curto, que
     é o padrão do Access e o certo para eles. */
  clicar(porRotulo('Tipo do campo Telefone'), 'tipo do Telefone');
  clicar(itemDeMenu(tipoDoTelefone), tipoDoTelefone);
};

const escreverARegra = () => {
  const linha = [...container.querySelectorAll('.ac-grade tbody tr')]
    .find(tr => (tr.querySelector('input') as HTMLInputElement)?.value === 'E-mail');
  clicar(linha, 'linha do campo E-mail');
  clicar(porRotulo('Regra de Validação'), 'Regra de Validação');
  clicar(itemDeMenu(REGRA_DE_EMAIL), REGRA_DE_EMAIL);
};

const importarCerto = () => {
  clicar(guia('Dados Externos'), 'guia Dados Externos');
  clicar(porRotulo('Importar Lista'), 'Importar Lista');
  for (const coluna of COLUNAS_DA_LISTA) {
    escrever(porRotulo(`Campo de destino da coluna ${coluna}`), CAMPO_DA_COLUNA[coluna], coluna);
  }
  clicar(porTexto('button', 'Concluir'), 'Concluir');
};

describe('a agenda do clube se monta clicando', () => {
  it('abre com as sete tarefas por fazer e sem tabela nenhuma', () => {
    expect(placar(), 'a moldura não escreveu o placar').toEqual(['0', '7']);
    expect(feitas()).toEqual([]);
    expect(container.textContent).toContain('O banco está criado e vazio');
  });

  it('não deixa importar antes de existir para onde', () => {
    clicar(guia('Dados Externos'), 'guia Dados Externos');
    clicar(porRotulo('Importar Lista'), 'Importar Lista');
    expect(container.textContent).toContain('Não há para onde importar ainda');
    expect(container.querySelector('.win-modal')).toBeNull();
  });

  it('fecha as sete seguindo o que o painel manda', () => {
    declararOsCampos();
    expect(feitas()).toContain('campos');

    escreverARegra();
    expect(feitas()).toContain('regra');

    importarCerto();
    expect(feitas()).toContain('importar');

    /* Vinte e quatro entraram; a ficha sem arroba ficou de fora, que é a regra
       de validação trabalhando. */
    expect(container.textContent).toContain('Uma ficha foi recusada');

    const recusada = LISTA_DO_CLUBE.find(l =>
      !temArroba(l[COLUNAS_DA_LISTA.findIndex(c => CAMPO_DA_COLUNA[c] === 'E-mail')]))!;
    escrever(porRotulo(`E-mail de ${recusada[0]}`), 'elisa.nogueira@exemplo.com', 'e-mail recusado');
    clicar(porTexto('button', 'Incluir'), 'Incluir');
    expect(feitas()).toContain('recusada');

    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Coluna Nome'), 'cabeçalho Nome');
    clicar(porRotulo('Crescente'), 'Crescente');
    expect(feitas()).toContain('ordenar');

    clicar(porRotulo('Filtro'), 'Filtro');
    clicar(itemDeMenu('Centro'), 'bairro Centro');
    expect(feitas()).toContain('filtrar');

    clicar(guia('Criar'), 'guia Criar');
    clicar(porRotulo('Relatório'), 'Relatório');
    clicar(porTexto('button', 'Concluir'), 'Concluir do relatório');

    const abertas = METAS_DA_AGENDA.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['7', '7']);
  });

  /*
    O assistente chega com o palpite errado, e é a tarefa.

    Se ele acertasse sozinho, "mapear as colunas" seria confirmar um acerto — o
    mesmo que abrir resolvida. Aceitar o palpite põe o endereço no telefone e o
    telefone no endereço, e nada estoura: o programa guarda o que foi escrito
    onde foi mandado, que é exatamente o que a lição de teoria diz.
  */
  it('aceitar o palpite do assistente troca dois campos, e nada estoura', () => {
    declararOsCampos();
    escreverARegra();
    clicar(guia('Dados Externos'), 'guia Dados Externos');
    clicar(porRotulo('Importar Lista'), 'Importar Lista');
    clicar(porTexto('button', 'Concluir'), 'Concluir');

    expect(container.textContent).toContain('foi para o campo errado');

    /* A prova do estrago: a coluna Telefone da tabela mostra endereço. */
    const linhas = [...container.querySelectorAll('.ac-grade tbody tr')];
    const primeira = linhas[0];
    const colunas = [...container.querySelectorAll('.ac-grade thead th')]
      .map(th => th.textContent?.trim());
    const iTelefone = colunas.indexOf('Telefone');
    expect(iTelefone).toBeGreaterThanOrEqual(0);
    expect(primeira.children[iTelefone].textContent).toContain('Rua');
  });

  /* Telefone como Número aceita e destrói a informação. O programa diz isso em
     vez de deixar acontecer calado, e a tarefa não fecha. */
  it('telefone declarado como número avisa e não fecha a tarefa', () => {
    declararOsCampos('Número');
    expect(container.textContent).toContain('perde os parênteses');
    expect(feitas()).not.toContain('campos');
  });

  /* Relatório de uma coluna só sai sem erro nenhum e não serve para nada. */
  it('relatório com um campo só não fecha a tarefa', () => {
    declararOsCampos();
    escreverARegra();
    importarCerto();
    const recusada = LISTA_DO_CLUBE.find(l =>
      !temArroba(l[COLUNAS_DA_LISTA.findIndex(c => CAMPO_DA_COLUNA[c] === 'E-mail')]))!;
    escrever(porRotulo(`E-mail de ${recusada[0]}`), 'elisa.nogueira@exemplo.com', 'e-mail recusado');
    clicar(porTexto('button', 'Incluir'), 'Incluir');

    clicar(guia('Criar'), 'guia Criar');
    clicar(porRotulo('Relatório'), 'Relatório');
    for (const nome of ['Endereço', 'Telefone', 'E-mail']) {
      const caixa = [...container.querySelectorAll('.win-modal label')]
        .find(l => l.textContent?.trim() === nome)?.querySelector('input');
      clicar(caixa, `caixa ${nome}`);
    }
    clicar(porTexto('button', 'Concluir'), 'Concluir do relatório');

    expect(container.textContent).toContain('menos campos do que a agenda pede');
    expect(feitas()).not.toContain('relatorio');
  });
});
