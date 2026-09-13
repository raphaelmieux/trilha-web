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

/*
  A classificação age na coluna escolhida, e diz qual foi.

  Este bloco existe por um defeito que passou por toda a bateria acima. O teste
  do percurso feliz clica no cabeçalho do Nome antes de Crescente, então nunca
  viu o que acontecia sem esse clique — e sem ele a faixa ordenava pela linha
  que ficara selecionada **no modo de estrutura**, duas tarefas antes, ao
  escrever a regra de validação do E-mail.

  O resultado era a pior forma de falhar: a tabela reordenava, o cabeçalho
  ganhava a seta, a tela escrevia "Ordenado. Nada foi redigitado…" — e a tarefa
  de pôr a agenda em ordem alfabética continuava vermelha, sem nada na tela
  dizendo por quê. Laboratório que ninguém consegue vencer é pior do que um que
  abre resolvido.
*/
describe('classificar age na coluna escolhida', () => {
  /** Deixa a agenda importada e consertada, na guia Página Inicial. */
  const ateAFolhaDeDados = () => {
    declararOsCampos();
    escreverARegra();   // seleciona a linha do E-mail no modo de estrutura
    importarCerto();
    const recusada = LISTA_DO_CLUBE.find(l =>
      !temArroba(l[COLUNAS_DA_LISTA.findIndex(c => CAMPO_DA_COLUNA[c] === 'E-mail')]))!;
    escrever(porRotulo(`E-mail de ${recusada[0]}`), 'elisa.nogueira@exemplo.com', 'e-mail recusado');
    clicar(porTexto('button', 'Incluir'), 'Incluir');
    clicar(guia('Página Inicial'), 'guia Página Inicial');
  };

  /* A seleção do modo de estrutura não atravessa para a folha de dados: são
     duas escolhas diferentes no Access, e eram uma variável só aqui. */
  it('não herda a coluna da linha selecionada na estrutura', () => {
    ateAFolhaDeDados();
    clicar(porRotulo('Crescente'), 'Crescente');

    expect(container.textContent, 'ordenou sozinho por um campo que ninguém escolheu')
      .toContain('Escolha antes a coluna');
    expect(container.textContent).not.toContain('Ordenado por');
    /* E nada foi ordenado: sem seta em cabeçalho nenhum. */
    const cabecalhos = [...container.querySelectorAll('.ac-grade th')].map(e => e.textContent ?? '');
    expect(cabecalhos.some(t => t.includes('▲') || t.includes('▼'))).toBe(false);
  });

  it('escolhendo o Nome, ordena por Nome e fecha a tarefa', () => {
    ateAFolhaDeDados();
    clicar(porRotulo('Coluna Nome'), 'cabeçalho Nome');
    clicar(porRotulo('Crescente'), 'Crescente');

    expect(container.textContent).toContain('Ordenado por Nome, de A a Z');
    expect(feitas()).toContain('ordenar');
  });

  /*
    Ordenar por outra coluna é uma coisa que o Access faz, então acontece — o
    que não pode é acontecer calado. O aviso nomeia a coluna, e é por ele que
    quem esperava ordem alfabética de nomes descobre que ordenou por e-mail.
  */
  it('escolhendo outra coluna, ordena por ela e diz qual foi', () => {
    ateAFolhaDeDados();
    clicar(porRotulo('Coluna E-mail'), 'cabeçalho E-mail');
    clicar(porRotulo('Crescente'), 'Crescente');

    expect(container.textContent, 'a tela não disse por qual coluna ordenou')
      .toContain('Ordenado por E-mail');
    expect(feitas()).not.toContain('ordenar');
  });

  /* E a coluna escolhida se vê antes de clicar em Crescente — sem isso a
     escolha é invisível e o botão age sobre uma decisão que ninguém lembra. */
  it('mostra na tela qual coluna está escolhida', () => {
    ateAFolhaDeDados();
    const marcada = () => [...container.querySelectorAll('.ac-grade th[aria-pressed="true"]')]
      .map(e => e.getAttribute('aria-label'));

    expect(marcada(), 'a folha abriu com uma coluna já marcada').toEqual([]);
    clicar(porRotulo('Coluna Endereço'), 'cabeçalho Endereço');
    expect(marcada()).toEqual(['Coluna Endereço']);
    clicar(porRotulo('Coluna Nome'), 'cabeçalho Nome');
    expect(marcada(), 'duas colunas marcadas ao mesmo tempo').toEqual(['Coluna Nome']);
  });

  /*
    ── E há três caminhos até a coluna, porque o Access tem três ──────────

    A primeira versão disto exigia clicar no cabeçalho, e o alvo do clique era
    o **texto** do cabeçalho: quarenta por dezenove pixels, sem cursor de mão,
    sem realce ao passar o mouse, dentro de um cabeçalho cinza que parece um
    cabeçalho de tabela. O clique funcionava e ninguém conseguia dar: quem
    tentava recebia o aviso de "escolha antes a coluna" e não tinha como
    escolher. Pior do que a tarefa que abre resolvida é a que não fecha.

    Regra que o programa imitado não tem é muro: no Access o cursor entra na
    célula, e Classificar age sobre o campo do cursor. Os três caminhos abaixo
    são os três que ele oferece.
  */
  it('a célula também escolhe a coluna dela, como no Access', () => {
    ateAFolhaDeDados();
    const primeiraCelula = container.querySelector('.ac-grade tbody td');
    clicar(primeiraCelula, 'primeira célula');

    const marcada = [...container.querySelectorAll('.ac-grade th[aria-pressed="true"]')]
      .map(e => e.getAttribute('aria-label'));
    expect(marcada, 'clicar numa célula não escolheu a coluna dela').toEqual(['Coluna Nome']);

    clicar(porRotulo('Crescente'), 'Crescente');
    expect(feitas()).toContain('ordenar');
  });

  /* A seta do cabeçalho é onde o Access põe a classificação, e é para onde o
     passo a passo manda. Ela escolhe e classifica num gesto só. */
  it('a seta do cabeçalho classifica sem passar pela faixa', () => {
    ateAFolhaDeDados();
    clicar(porRotulo('Opções da coluna Nome'), 'seta do cabeçalho Nome');
    clicar(itemDeMenu('Classificar de A a Z'), 'Classificar de A a Z');

    expect(container.textContent).toContain('Ordenado por Nome, de A a Z');
    expect(feitas()).toContain('ordenar');
  });

  /* O cabeçalho inteiro é o alvo, e não o texto dentro dele: era esse o
     tamanho de quarenta pixels que ninguém acertava. */
  it('o alvo do clique é a célula do cabeçalho inteira', () => {
    ateAFolhaDeDados();
    const cabecalho = porRotulo('Coluna Nome');
    expect(cabecalho?.tagName, 'o cabeçalho voltou a ser um botão dentro do th')
      .toBe('TH');
    expect(cabecalho?.getAttribute('role')).toBe('button');
  });
});
