// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeExplorador from './LaboratorioDeExplorador';
import FileManagerLab from '../labs/FileManagerLab';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { DEZ_MAL_NOMEADOS, RELATORIO, SUMIU } from '../labs/discoDoClube';

/*
  Os sete laboratórios da CC-ES001, percorridos clicando.

  ── A pergunta que só esta trava faz ────────────────────────────────────
  `exploradorValidator.test.ts` prova que cada verificação **pode** ficar
  verde, chamando as funções do motor. Isso não prova que a janela chama
  alguma delas: um botão sem `onClick`, um menu que não abre, uma caixa de
  pesquisa que não pesquisa — o motor continua correto e o laboratório fica
  impossível de vencer.

  "Laboratório impossível de vencer é pior do que um que abre resolvido": um
  dá tarefa de graça, o outro deixa quem fez tudo certo olhando uma lista
  vermelha sem nada na tela que explique. Por isso cada lição daqui é levada
  até o fim **pelos mesmos cliques** que o desbravador daria, e o que se
  confere no fim é o botão de concluir deixando de estar desabilitado.

  ── E, de lambuja, a trava dos dois Exploradores ────────────────────────
  A CC-ES001 é o segundo laboratório de Explorador da plataforma, e foi dele
  que veio a razão de extrair `explorer.tsx`. Aqui os dois são montados e
  comparados — como `PlanilhaAvancadaLab.test.tsx` faz com os dois Excel,
  pelo motivo escrito lá.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VEREDA = VEREDAS.find(v => v.code === 'CC-ES001')!;
const licao = (id: string) => {
  const l = licoesDaVereda(VEREDA).find(x => x.id === id);
  if (!l || l.tipo !== 'explorador') throw new Error(`${id} não é uma lição de Explorador`);
  return l;
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const montar = (id: string) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeExplorador
          vereda={VEREDA}
          licao={licao(id)}
          aoVencer={() => {}}
          aoSair={() => {}}
        />
      </MemoryRouter>,
    );
  });
};

/* ── Ajudas de clique ──────────────────────────────────────────────────────
 *
 * Elas falham dizendo o que não acharam, e não com "null não tem click": o
 * que quebra uma trava destas é uma peça que sumiu, e a mensagem precisa
 * dizer qual.
 */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);

const comando = (rotulo: string) => porRotulo(rotulo);

/*
  O Explorador abre com as extensões escondidas, que é o padrão do Windows e a
  razão de o requisito 4.4 existir. Procurar por "cantina.pdf" não acha nada
  enquanto a extensão estiver fora da tela — então se procura pelo nome como
  ele **aparece**, que é também o que o desbravador veria.
*/
const semExtensao = (nome: string) => {
  const ponto = nome.lastIndexOf('.');
  return ponto > 0 ? nome.slice(0, ponto) : nome;
};

/*
  Comparação exata, e não "contém": a ordenação do Explorador usa a collation
  do português, que ignora espaço e pontuação — "ata nova FINAL" sai **antes**
  de "ata" na lista, e um `includes('ata')` renomearia a linha errada e depois
  reclamaria de não achar a certa. A trava passaria a medir a ordem alfabética
  em vez do laboratório.
*/
const linhaDe = (nome: string) =>
  [...container.querySelectorAll('.win-linha')].find(l => {
    const escrito = l.querySelector('.win-c-nome span')?.textContent?.trim();
    /* Os dois: a lição do módulo 4 liga as extensões no meio do caminho, e a
       partir dali a mesma linha passa a se chamar de outro jeito na tela. */
    return escrito === nome || escrito === semExtensao(nome);
  });

const escolher = (nome: string) => clicar(linhaDe(nome), nome);

const botaoDeMenu = (texto: string) =>
  [...container.querySelectorAll('.win-menu button')]
    .find(b => b.textContent?.trim().startsWith(texto));

const abrirMenuDe = (nome: string) => {
  const l = linhaDe(nome);
  expect(l, `não achei "${nome}" para abrir o menu`).toBeTruthy();
  act(() => { l!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true })); });
};

const noMenuDe = (nome: string, opcao: string) => {
  abrirMenuDe(nome);
  clicar(botaoDeMenu(opcao), opcao);
};

const irPara = (raiz: string) => {
  const galho = [...container.querySelectorAll('.win-painel span')]
    .find(e => e.textContent?.trim() === raiz);
  expect(galho, `não achei "${raiz}" no painel de navegação`).toBeTruthy();
  clicar(galho!.parentElement, raiz);
};

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype
      : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
};

/**
 * Escreve no campo de renomear que já está aberto e confirma com Enter.
 *
 * Enter, e não sair do campo: o `onBlur` do React ouve `focusout`, e um
 * `blur` sintético disparado no jsdom não chega nele — o nome ficava no campo
 * e a pasta continuava sem nome, calada. Enter é também o que a pessoa aperta.
 */
const batizar = (nome: string) => {
  const campo = container.querySelector('[aria-label="Novo nome"]');
  escrever(campo, nome, 'Novo nome');
  act(() => {
    (campo as HTMLInputElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  expect(container.querySelector('[aria-label="Novo nome"]'),
    `o campo de renomear não fechou depois de "${nome}"`).toBeNull();
};

const renomear = (de: string, para: string) => {
  escolher(de);
  clicar(comando('Renomear (F2)'), 'Renomear');
  batizar(para);
};

/** Cria uma pasta e a batiza — ela nasce com o nome já selecionado para trocar. */
const novaPasta = (nome: string) => {
  clicar(comando('Nova pasta'), 'Novo');
  batizar(nome);
};

const entrarEm = (nome: string) => {
  const l = linhaDe(nome);
  expect(l, `não achei "${nome}" para entrar`).toBeTruthy();
  act(() => { l!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); });
};

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const venceu = () => {
  const b = botaoDeConcluir();
  expect(b, 'o botão de concluir sumiu da cápsula').toBeTruthy();
  return !(b as HTMLButtonElement).disabled;
};

const oQueFalta = () =>
  [...container.querySelectorAll('aside p')].map(p => p.textContent?.trim()).join(' | ');

/* ── As sete lições ───────────────────────────────────────────────────────── */

describe('cada lição da CC-ES001 pode ser vencida clicando', () => {
  it('nenhuma abre com o botão de concluir já liberado', () => {
    for (const id of ['m1-lab', 'm2-lab', 'm3-lab', 'm4-lab', 'm5-lab', 'm6-lab', 'm7-lab']) {
      montar(id);
      expect(venceu(), `${id} abriu resolvido`).toBe(false);
      act(() => root.unmount());
      root = createRoot(container);
    }
  });

  it('m1 — monta a hierarquia de três níveis e guarda o projeto nela', () => {
    montar('m1-lab');
    irPara('Documentos');

    /* Acampamento 2026 › Secretaria › Autorizações, com Registros ao lado:
       três níveis na corrente mais funda, e duas pastas para espalhar o
       material. */
    novaPasta('Acampamento 2026');
    entrarEm('Acampamento 2026');
    novaPasta('Secretaria');
    novaPasta('Registros');
    entrarEm('Secretaria');
    novaPasta('Autorizações');

    const guardar = (nome: string, destino: string) => {
      irPara('Área de Trabalho');
      escolher(nome);
      clicar(comando('Recortar (Ctrl+X)'), 'Recortar');
      irPara('Documentos');
      entrarEm('Acampamento 2026');
      entrarEm(destino);
      clicar(comando('Colar (Ctrl+V)'), 'Colar');
    };
    guardar(DEZ_MAL_NOMEADOS[3], 'Secretaria');
    guardar(DEZ_MAL_NOMEADOS[4], 'Secretaria');
    guardar(DEZ_MAL_NOMEADOS[0], 'Registros');
    guardar(DEZ_MAL_NOMEADOS[1], 'Registros');

    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m1 — e o ensaio da apresentação aparece com a estrutura pronta', () => {
    montar('m1-lab');
    expect(container.textContent).not.toContain('Ensaio da apresentação');

    irPara('Documentos');
    novaPasta('Projeto');
    entrarEm('Projeto');
    novaPasta('Meio');
    entrarEm('Meio');
    novaPasta('Fundo');

    expect(container.textContent).toContain('Ensaio da apresentação');
    expect(container.textContent).toContain('Documentos › Projeto');
  });

  it('m2 — compacta a pasta de fotos e extrai o pacote', () => {
    montar('m2-lab');
    irPara('Documentos');
    escolher('Fotos do Acampamento');
    clicar(comando('Compactar'), 'Compactar');
    /* O original continua lá — é a armadilha que a teoria nomeia. */
    expect(linhaDe('Fotos do Acampamento')).toBeTruthy();
    clicar(comando('Extrair tudo'), 'Extrair');
    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m3 — salva por cima, salva como, e leva um arquivo à Lixeira e de volta', () => {
    montar('m3-lab');

    /* Salvar: abre o .txt, muda o texto, Salvar. */
    entrarEm('o que levar.txt');
    escrever(container.querySelector('[aria-label="Conteúdo do arquivo"]'),
      'saco de dormir, lanterna, caneca', 'Conteúdo');
    clicar(porRotulo('Salvar'), 'Salvar');

    /* Salvar como: muda de novo e grava com outro nome. */
    escrever(container.querySelector('[aria-label="Conteúdo do arquivo"]'),
      'saco de dormir, lanterna, caneca, repelente', 'Conteúdo');
    clicar(porRotulo('Salvar como'), 'Salvar como');
    escrever(container.querySelector('#salvar-como-nome'), 'o que levar - revisado', 'Nome do arquivo');
    clicar([...container.querySelectorAll('.win-modal-pe button')]
      .find(b => b.textContent?.trim() === 'Salvar'), 'Salvar do diálogo');

    /* Fecha o editor para voltar ao Explorador. */
    clicar(porRotulo('Fechar'), 'Fechar o Bloco de Notas');

    /* Excluir, restaurar, excluir de novo e esvaziar. */
    escolher(DEZ_MAL_NOMEADOS[8]);
    clicar(comando('Excluir (Del)'), 'Excluir');
    irPara('Lixeira');
    escolher(DEZ_MAL_NOMEADOS[8]);
    clicar(comando('Restaurar'), 'Restaurar');

    irPara('Área de Trabalho');
    escolher(DEZ_MAL_NOMEADOS[9]);
    clicar(comando('Excluir (Del)'), 'Excluir');
    irPara('Lixeira');
    clicar(comando('Esvaziar a Lixeira'), 'Esvaziar Lixeira');

    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m4 — ordena, pesquisa com dois filtros e liga cada extensão ao programa', () => {
    montar('m4-lab');

    const cabecalho = (nome: string) => [...container.querySelectorAll('.win-cabecalhos button')]
      .find(b => b.textContent?.trim() === nome);
    clicar(cabecalho('Nome'), 'Nome');
    clicar(cabecalho('Data de modificação'), 'Data de modificação');
    clicar(cabecalho('Tamanho'), 'Tamanho');

    /* A pesquisa: tipo e período juntos, e com resultado. */
    /* `.ativa` é o que a mantém na tela estreita: procurá-la por essa classe
       é o que faz esta trava reprovar se alguém a devolver ao enfeite. */
    clicar(container.querySelector('.win-busca.ativa'), 'Pesquisar');
    escrever(container.querySelector('#busca-tipo'), 'imagem', 'Tipo');
    escrever(container.querySelector('#busca-periodo'), 'trimestre', 'Data de modificação');
    clicar([...container.querySelectorAll('.win-modal-pe button')]
      .find(b => b.textContent?.trim() === 'Pesquisar'), 'Pesquisar');
    expect(container.querySelectorAll('.win-linha').length).toBeGreaterThan(0);

    /* A extensão, no menu Exibir. */
    clicar(comando('Exibir'), 'Exibir');
    clicar([...container.querySelectorAll('.win-menu button')]
      .find(b => b.textContent?.includes('Extensões')), 'Extensões de nomes de arquivos');
    expect(container.textContent).toContain('.jpg');

    /* E quatro extensões diferentes por "Abrir com". */
    irPara('Área de Trabalho');
    const associar = (nome: string, programa: string) => {
      noMenuDe(nome, 'Abrir com');
      clicar([...container.querySelectorAll('.win-modal-corpo button')]
        .find(b => b.textContent?.trim() === programa), programa);
      clicar(porRotulo('Fechar'), 'Fechar a janela do programa');
    };
    associar(DEZ_MAL_NOMEADOS[0], 'Fotos');
    associar(DEZ_MAL_NOMEADOS[3], 'Editor de Texto');
    associar(DEZ_MAL_NOMEADOS[8], 'Leitor de PDF');
    associar(DEZ_MAL_NOMEADOS[6], 'Bloco de Notas');

    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m4 — e escolher o programa errado não conta, e mostra o lixo', () => {
    montar('m4-lab');
    noMenuDe(DEZ_MAL_NOMEADOS[0], 'Abrir com');
    clicar([...container.querySelectorAll('.win-modal-corpo button')]
      .find(b => b.textContent?.trim() === 'Leitor de PDF'), 'Leitor de PDF');
    expect(container.textContent).toContain('não é o conteúdo');
    expect(oQueFalta()).toContain('0 de 4');
  });

  it('m5 — renomeia os dez no mesmo padrão', () => {
    montar('m5-lab');
    DEZ_MAL_NOMEADOS.forEach((nome, i) => {
      renomear(nome, `clube-2026-03-${String(i + 10).padStart(2, '0')}-v01`);
    });
    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m5 — e renomear com a extensão escondida não apaga a extensão', () => {
    /* É o defeito silencioso que o requisito 4.4 existe para nomear: com a
       extensão fora da tela, o campo mostra só o nome, e gravar o que está no
       campo tiraria o `.jpg` de dez arquivos sem ninguém ver. */
    montar('m5-lab');
    renomear(DEZ_MAL_NOMEADOS[0], 'clube-2026-03-10-v01');
    clicar(comando('Exibir'), 'Exibir');
    clicar([...container.querySelectorAll('.win-menu button')]
      .find(b => b.textContent?.includes('Extensões')), 'Extensões');
    /* A conferência é do texto escrito, e não por `linhaDe`: aquele ajudante
       aceita o nome com e sem extensão de propósito, e aqui é justamente a
       extensão que está em jogo — ele aprovaria o defeito. */
    const escrito = [...container.querySelectorAll('.win-c-nome span')]
      .map(e => e.textContent?.trim())
      .find(t => t?.startsWith('clube-2026-03-10-v01'));
    expect(escrito, 'a extensão sumiu ao renomear com ela escondida').toBe('clube-2026-03-10-v01.jpg');
  });

  it('m6 — copia para o pen drive e o ejeta com segurança', () => {
    montar('m6-lab');
    clicar(porRotulo('Pen drive'), 'Pen drive');

    irPara('Documentos');
    for (const nome of ['hino do clube.mp3', 'estatuto.pdf', RELATORIO]) {
      irPara('Documentos');
      escolher(nome);
      clicar(comando('Copiar (Ctrl+C)'), 'Copiar');
      irPara('Pen drive (E:)');
      clicar(comando('Colar (Ctrl+V)'), 'Colar');
    }
    clicar(comando('Ejetar o pen drive'), 'Ejetar');
    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m6 — e puxar sem ejetar deixa os arquivos pela metade', () => {
    montar('m6-lab');
    clicar(porRotulo('Pen drive'), 'Pen drive');
    irPara('Documentos');
    escolher('hino do clube.mp3');
    clicar(comando('Copiar (Ctrl+C)'), 'Copiar');
    irPara('Pen drive (E:)');
    clicar(comando('Colar (Ctrl+V)'), 'Colar');

    clicar(porRotulo('Pen drive'), 'Pen drive');
    clicar(botaoDeMenu('Puxar'), 'Puxar o pen drive');
    expect(container.textContent).toContain('pela metade');
    expect(venceu()).toBe(false);
  });

  it('m7 — restaura da cópia de segurança e volta o relatório à versão boa', () => {
    montar('m7-lab');
    irPara('Cópia de Segurança (D:)');
    escolher(SUMIU);
    clicar(comando('Copiar (Ctrl+C)'), 'Copiar');
    irPara('Documentos');
    clicar(comando('Colar (Ctrl+V)'), 'Colar');

    noMenuDe(RELATORIO, 'Versões anteriores');
    clicar([...container.querySelectorAll('.win-modal-corpo button')]
      .find(b => b.textContent?.includes('relatório inteiro')), 'a versão boa');

    expect(venceu(), oQueFalta()).toBe(true);
  });

  it('m7 — e mover a cópia de segurança em vez de copiar não vale', () => {
    montar('m7-lab');
    irPara('Cópia de Segurança (D:)');
    escolher(SUMIU);
    clicar(comando('Recortar (Ctrl+X)'), 'Recortar');
    irPara('Documentos');
    clicar(comando('Colar (Ctrl+V)'), 'Colar');
    expect(oQueFalta()).toContain('moveu em vez de copiar');
  });
});

describe('os dois Exploradores da plataforma mostram a mesma janela', () => {
  /*
    A AP043 e a CC-ES001 desenham o Explorador a partir de `explorer.tsx`.
    Foi por causa deste par que a extração aconteceu, e é este par que a
    mantém honesta: ajustar a janela de um lado e não do outro daria dois
    "Explorador" para o mesmo programa, que é o defeito que o Word já teve.
  */
  const chrome = () => ({
    navegacao: ['Voltar', 'Avançar', 'Acima', 'Atualizar']
      .map(r => !!container.querySelector(`[aria-label="${r}"]`)),
    colunas: [...container.querySelectorAll('.win-cabecalhos button')]
      .map(b => b.textContent?.trim()),
    /* As três raízes de todo Windows. A CC-ES001 tem uma quarta — o disco de
       cópia de segurança —, e isso é o **disco** de cada laboratório, e não a
       janela: comparar o conteúdo aqui cobraria dos dois o mesmo computador. */
    raizes: ['Área de Trabalho', 'Documentos', 'Lixeira'].map(nome =>
      [...container.querySelectorAll('.win-painel span')]
        .some(e => e.textContent?.trim() === nome)),
    barraDeTarefas: !!container.querySelector('[aria-label="Iniciar"]')
      && !!container.querySelector('[aria-label="Explorador de Arquivos"]'),
    pesquisa: !!container.querySelector('.win-busca'),
  });

  it('a mesma barra de endereço, as mesmas colunas e a mesma barra de tarefas', () => {
    montar('m1-lab');
    const daVereda = chrome();
    act(() => root.unmount());
    root = createRoot(container);

    act(() => {
      root.render(
        <MemoryRouter>
          <FileManagerLab
            specialtyCode="AP041" lessonCode="AP041.5-L1"
            lessonTitle="Organizando as pastas do clube"
            requirementCodes={['AP041-5']}
            userId="00000000-0000-0000-0000-000000000000" />
        </MemoryRouter>,
      );
    });
    const daTrilha = chrome();

    expect(daVereda).toEqual(daTrilha);
    /* A guarda contra o vazio: dois nadas também são iguais. */
    expect(daVereda.colunas).toHaveLength(4);
    expect(daVereda.raizes).toEqual([true, true, true]);
  });
});
