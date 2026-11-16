// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import FileManagerLab from './FileManagerLab';
import { CSS_WINDOWS } from './windows';

/*
  A janela do Explorador, depois de ela sair de dentro do laboratório.

  ── O que esta trava existe para pegar ──────────────────────────────────
  `explorer.tsx` nasceu de um recorte: a barra de endereço, o painel de
  navegação, os cabeçalhos, a linha, os dois menus e a barra de tarefas saíram
  de `FileManagerLab.tsx` sem mudar de comportamento. Recorte assim erra de um
  jeito só — uma peça deixa de ser desenhada, e a janela continua parecendo uma
  janela. Some a caixa de pesquisa, some o botão Acima, some a coluna Tipo, e o
  laboratório abre normalmente.

  Por isso o que se confere aqui é presença e função, peça por peça: os quatro
  botões de navegação, as quatro colunas que ordenam, as raízes na lateral, a
  linha com as quatro células, o menu do botão direito e a barra de tarefas.

  ── E ela vai ganhar um segundo lado ────────────────────────────────────
  A CC-ES001 traz o segundo laboratório de Explorador da plataforma, e é dele
  que veio a razão de extrair. Quando ele chegar, esta trava passa a montar os
  dois e comparar — como `PlanilhaAvancadaLab.test.tsx` faz com os dois Excel,
  pelo mesmo motivo escrito lá: duas cópias divergem no primeiro ajuste, e o
  clube passa a ver dois "Explorador" diferentes.
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
        <FileManagerLab
          specialtyCode="AP041" lessonCode="AP041.5-L1"
          lessonTitle="Organizando as pastas do clube"
          requirementCodes={['AP041-5']}
          userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const textos = (seletor: string) =>
  [...container.querySelectorAll(seletor)].map(e => e.textContent?.trim() ?? '');

/** Clica na raiz de mesmo nome, no painel de navegação. */
const irParaPasta = (nome: string) => {
  const galho = [...container.querySelectorAll('.win-painel span')]
    .find(e => e.textContent?.trim() === nome);
  expect(galho, `não achei "${nome}" no painel de navegação`).toBeTruthy();
  act(() => (galho!.parentElement as HTMLElement).click());
};

describe('a janela do Explorador', () => {
  it('desenha os quatro botões de navegação da barra de endereço', () => {
    for (const rotulo of ['Voltar', 'Avançar', 'Acima', 'Atualizar']) {
      expect(porRotulo(rotulo), `faltou o botão ${rotulo}`).toBeTruthy();
    }
  });

  it('abre na Área de Trabalho, com o caminho escrito na barra', () => {
    expect(textos('.win-caminho button')).toContain('Área de Trabalho');
  });

  it('mostra a caixa de pesquisa, e aqui ela é enfeite', () => {
    /* Na AP043 ela é enfeite — a janela sem ela não seria a janela. Na
       CC-ES001 ela é o exercício do módulo 4, e é a mesma peça. A diferença
       é `ativa`, e é ela que decide o que acontece na tela estreita. */
    expect(container.querySelector('.win-busca')).toBeTruthy();
    expect(container.querySelector('.win-busca.ativa'),
      'a pesquisa da AP043 não faz nada, e não devia se anunciar como botão').toBeNull();
  });

  it('a pesquisa que funciona continua na tela quando ela encolhe', () => {
    /*
      `.win-busca` some abaixo de 768 px, e é o certo para a da AP043. A da
      CC-ES001 é o requisito 4.3 inteiro: sumir junto tiraria o único caminho
      até a tarefa no celular, que é onde boa parte dos desbravadores estuda.

      A conferência é na folha publicada, e não no JSX, porque o defeito mora
      na folha: quem um dia mexer no bloco da tela estreita apagaria a regra
      sem que nenhum teste de componente percebesse — a busca continuaria
      montada, e invisível.
    */
    const some = CSS_WINDOWS.indexOf('.win-busca { display: none; }');
    expect(some, 'a regra que esconde a pesquisa saiu da folha').toBeGreaterThan(-1);

    /* Dentro do **mesmo** bloco de consulta de mídia: a regra que a devolve
       escrita num bloco de outra largura valeria numa faixa de tela e não na
       outra, e o buraco apareceria só no celular certo. */
    const fimDoBloco = CSS_WINDOWS.indexOf('\n  }', some);
    const bloco = CSS_WINDOWS.slice(some, fimDoBloco);
    expect(bloco, 'a busca ativa perdeu a regra que a mantém visível')
      .toContain('.win-busca.ativa { display: flex;');
  });

  it('o diálogo sobe no celular, e a regra que o sobe vem depois da que o centra', () => {
    /*
      A cápsula de tarefas da plataforma mora no canto de baixo do celular, e um
      diálogo centrado punha Cancelar e Confirmar justamente ali.

      As duas regras têm a mesma especificidade, então o que decide é a ordem no
      arquivo: escrita antes da base, a que sobe o diálogo não vale nada — e
      nada estoura. É esse silêncio que esta linha existe para quebrar.
    */
    const centra = CSS_WINDOWS.indexOf('.win-modal-fundo {');
    const sobe = CSS_WINDOWS.indexOf('.win-modal-fundo { place-items: start center;');
    expect(centra, 'a regra que centra o diálogo saiu da folha').toBeGreaterThan(-1);
    expect(sobe, 'a regra que sobe o diálogo no celular saiu da folha').toBeGreaterThan(-1);
    expect(sobe, 'a regra que sobe o diálogo foi escrita antes da que o centra, e perdeu')
      .toBeGreaterThan(centra);
  });

  it('lista as raízes no painel de navegação', () => {
    const lateral = container.querySelector('.win-painel');
    expect(lateral).toBeTruthy();
    const nomes = [...lateral!.querySelectorAll('span')].map(e => e.textContent?.trim());
    for (const raiz of ['Área de Trabalho', 'Documentos', 'Lixeira']) {
      expect(nomes, `faltou a raiz ${raiz}`).toContain(raiz);
    }
  });

  it('oferece as quatro colunas do Explorer, e todas ordenam', () => {
    /* Comparação exata, e não "começa com": a seta de ordenação é um `svg`,
       que não põe texto nenhum no cabeçalho. Com `startsWith`, uma coluna
       renomeada para "TipoX" passaria — que é justamente o tipo de troca
       silenciosa que esta trava existe para pegar. */
    const cabecalhos = textos('.win-cabecalhos button');
    for (const c of ['Nome', 'Data de modificação', 'Tipo', 'Tamanho']) {
      expect(cabecalhos, `faltou a coluna ${c}`).toContain(c);
    }

    /* E ordenar de verdade: um cabeçalho presente e sem `onClick` passaria
       pela conferência acima inteirinho.

       A conferência acontece em Documentos, e não na Área de Trabalho: lá há
       uma pasta e um arquivo, e pasta vem sempre antes de arquivo — inverter o
       sentido devolveria a mesma lista, e a trava passaria sem ter medido
       nada. */
    irParaPasta('Documentos');
    const nomes = () => [...container.querySelectorAll('.win-linha .win-c-nome')]
      .map(e => e.textContent?.trim() ?? '');
    const antes = nomes();
    expect(antes.length, 'Documentos não listou o bastante para ordenar').toBeGreaterThan(2);

    const porNome = [...container.querySelectorAll('.win-cabecalhos button')]
      .find(b => b.textContent?.trim() === 'Nome') as HTMLElement;
    act(() => porNome.click());

    const depois = nomes();
    expect(depois, 'clicar no cabeçalho não mudou a lista').not.toEqual(antes);
    /* Pasta continua no topo nos dois sentidos, como no Explorer; o que
       inverte é o resto. */
    expect(depois[0]).toBe(antes[0]);
    expect(depois.slice(1)).toEqual([...antes.slice(1)].reverse());
  });

  it('desenha cada item com nome, data, tipo e tamanho', () => {
    const linha = container.querySelector('.win-linha');
    expect(linha, 'a pasta inicial não listou nada').toBeTruthy();
    for (const celula of ['.win-c-nome', '.win-c-data', '.win-c-tipo', '.win-c-tam']) {
      expect(linha!.querySelector(celula), `faltou a célula ${celula}`).toBeTruthy();
    }
    /* A data e o tamanho escritos, e não vazios: coluna presente e sem
       conteúdo passaria pela conferência acima sem dizer nada a ninguém. */
    expect(linha!.querySelector('.win-c-data')!.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('abre o menu do botão direito sobre um item', () => {
    const linha = container.querySelector('.win-linha') as HTMLElement;
    act(() => {
      linha.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    });
    const menu = container.querySelector('.win-menu');
    expect(menu, 'o botão direito não abriu menu nenhum').toBeTruthy();
    const opcoes = [...menu!.querySelectorAll('button')].map(b => b.textContent?.trim());
    expect(opcoes).toContain('Abrir');
    expect(opcoes).toContain('Renomear');
  });

  it('tem a barra de tarefas, com Iniciar e o Explorador', () => {
    expect(porRotulo('Iniciar')).toBeTruthy();
    expect(porRotulo('Explorador de Arquivos')).toBeTruthy();
  });
});

/* O jsdom não mede nada: as linhas recebem uma altura de 30 px, uma embaixo
   da outra, e o resto continua medindo zero. */
function medirLinhas(onde: HTMLElement) {
  const linhas = [...onde.querySelectorAll<HTMLElement>('[data-no]')];
  for (const [i, l] of linhas.entries()) {
    l.getBoundingClientRect = () => ({
      left: 0, top: 30 * i, right: 600, bottom: 30 * i + 28, width: 600, height: 28, x: 0, y: 30 * i, toJSON: () => ({}),
    });
  }
  return linhas;
}
function lacar(area: Element, de: [number, number], ate: [number, number], opcoes: PointerEventInit = {}) {
  const ev = (tipo: string, [x, y]: [number, number]) => act(() => {
    area.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y, ...opcoes }));
  });
  ev('pointerdown', de);
  ev('pointermove', [(de[0] + ate[0]) / 2, (de[1] + ate[1]) / 2]);
  ev('pointermove', ate);
  ev('pointerup', ate);
  /* O clique que o navegador dispara ao soltar cai no vazio. */
  act(() => { area.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
}

describe('o laço de seleção', () => {
  /* Escolher vários arquivos pedia Ctrl ou Shift: arrastar no vazio abaixo
     das linhas, que é o retângulo azul do Windows, não fazia nada. */
  it('arrastar do vazio escolhe as linhas que a faixa cruza, e o clique de soltar não desfaz', () => {
    const area = container.querySelector('.win-area-da-lista')!;
    const linhas = medirLinhas(container);
    expect(linhas.length, 'a pasta inicial abriu com menos de duas linhas').toBeGreaterThan(1);
    lacar(area, [300, 30 * linhas.length + 40], [300, 35]);
    expect(container.querySelector('.win-laco'), 'o laço ficou desenhado depois de soltar').toBeNull();
    const escolhidas = linhas.map(l => l.classList.contains('escolhida'));
    expect(escolhidas).toEqual(linhas.map((_, i) => i >= 1));
  });

  it('no dedo, arrastar o vazio rola a lista e não escolhe nada', () => {
    const area = container.querySelector('.win-area-da-lista')!;
    const linhas = medirLinhas(container);
    lacar(area, [300, 30 * linhas.length + 40], [300, 0], { pointerType: 'touch' });
    expect(container.querySelectorAll('.win-linha.escolhida')).toHaveLength(0);
  });
});
