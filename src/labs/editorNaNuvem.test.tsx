// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Bold, Italic } from 'lucide-react';
import {
  CSS_DO_EDITOR_NA_NUVEM, TopoDoEditor, MenuDoEditor, ItemDaGaveta,
  PresencaNoEditor, BotaoCompartilharNoEditor, BarraDoEditor, FerramentaDoEditor,
  SeletorDeModo, PalcoDoEditor, CursorDeOutro, PainelDeHistorico, AvisoDoEditor,
} from './editorNaNuvem';
import { MODOS_DE_TRABALHO, type Versao } from './arquivoCompartilhado';

/*
  A casca do editor de navegador, e as duas coisas que ela tem de dizer.

  ── O que esta trava existe para pegar ───────────────────────────────────
  Como as outras travas de janela, ela pega a peça que sumiu no recorte. O
  que é próprio daqui são duas frases que a janela precisa **escrever**, e
  cuja falta não estoura nada:

  — que restaurar uma versão **não apaga** as mais novas. É metade do
    requisito 4.5: quem acha que restaurar destrói o que veio depois nunca
    restaura, e prefere refazer o trabalho à mão. Um painel sem essa linha
    funciona perfeitamente e ensina o medo;
  — quem escreveu cada versão. Sem os nomes, o histórico vira uma lista de
    datas, e o requisito 8 — comprovar a participação de cada pessoa — passa
    a não ter onde ser comprovado.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(no: React.ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(no));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const texto = () => container.textContent ?? '';
const botoes = () => [...container.querySelectorAll('button')];
const opcoes = () => [...container.querySelectorAll('option')].map(o => o.textContent ?? '');

const VERSOES: Versao[] = [
  { id: 'v1', quando: '2 de julho, 14:10', porQuem: ['marta'] },
  { id: 'v2', quando: '3 de julho, 09:40', porQuem: ['marta', 'ronaldo'] },
  { id: 'v3', quando: '5 de julho, 20:15', porQuem: ['voce'] },
];

/* ── As peças estão lá ─────────────────────────────────────────────────────── */

describe('o editor de navegador tem as peças que um editor de navegador tem', () => {
  it('o nome do arquivo fica no alto, com o menu de palavras embaixo', () => {
    montar(
      <TopoDoEditor nome="Combinado do acampamento"
        menus={<MenuDoEditor nome="Arquivo" aberto={false} aoAbrir={() => {}} />}
        direita={<BotaoCompartilharNoEditor aoClicar={() => {}} />} />,
    );
    const campo = container.querySelector('input')!;
    expect(campo.value).toBe('Combinado do acampamento');
    expect(texto()).toContain('Arquivo');
    expect(texto()).toContain('Compartilhar');
  });

  it('as bolhas dizem quem está no documento agora', () => {
    /* É o requisito 2.1 desenhado, sem uma palavra escrita: duas pessoas
       dentro do mesmo arquivo, e nenhuma esperando a outra sair. */
    montar(<PresencaNoEditor quem={['voce', 'marta']} />);
    const rotulo = container.querySelector('[aria-label]')!.getAttribute('aria-label');
    expect(rotulo).toContain('Marta');
    expect(rotulo).toContain('Você');
  });

  it('a barra fina tem as ferramentas que o laboratório entrega', () => {
    montar(
      <BarraDoEditor>
        <FerramentaDoEditor icone={Bold} dica="Negrito" aoClicar={() => {}} />
        <FerramentaDoEditor icone={Italic} dica="Itálico" desligada />
      </BarraDoEditor>,
    );
    expect(botoes()).toHaveLength(2);
    expect(botoes()[1].disabled, 'a ferramenta desligada some em vez de ficar desligada')
      .toBe(true);
  });

  it('e a gaveta de um menu só aparece quando ele está aberto', () => {
    montar(
      <MenuDoEditor nome="Arquivo" aberto={false} aoAbrir={() => {}}>
        <ItemDaGaveta>Fazer uma cópia</ItemDaGaveta>
      </MenuDoEditor>,
    );
    expect(texto()).not.toContain('Fazer uma cópia');

    act(() => root.render(
      <MenuDoEditor nome="Arquivo" aberto aoAbrir={() => {}}>
        <ItemDaGaveta>Fazer uma cópia</ItemDaGaveta>
      </MenuDoEditor>,
    ));
    expect(texto()).toContain('Fazer uma cópia');
  });

  it('o aviso preto é do programa, e não escreve veredito sobre a tarefa', () => {
    /*
      É a regra da régua de status do Word, do painel de Problemas do Python e
      do aviso do digitalizador: o programa relata o que fez, e nunca se a
      lição está cumprida.
    */
    montar(<AvisoDoEditor acao="Desfazer" aoAgir={() => {}}>Sugestão aceita</AvisoDoEditor>);
    for (const palavra of ['tarefa', 'lição', 'cumprid', 'parabéns']) {
      expect(texto().toLowerCase(), `o aviso julgou o exercício: "${palavra}"`)
        .not.toContain(palavra);
    }
  });
});

/* ── A peça aparece pela presença do setter ────────────────────────────────── */

describe('a peça aparece pela presença do setter, e não sempre', () => {
  it('sem `aoMudarNome` o nome do arquivo não se digita', () => {
    /*
      É a decisão do `aoMudarNome` dos bastidores do Word: na lição em que
      renomear é o requisito, o campo travado tiraria o único caminho até a
      tarefa; nas outras, um campo editável prometeria um gesto que não muda
      nada.
    */
    montar(<TopoDoEditor nome="Ata" menus={null} direita={null} />);
    expect(container.querySelector('input')!.readOnly).toBe(true);

    act(() => root.render(
      <TopoDoEditor nome="Ata" aoMudarNome={() => {}} menus={null} direita={null} />));
    expect(container.querySelector('input')!.readOnly).toBe(false);
  });

  it('sem `aoRestaurar` o histórico é só de leitura', () => {
    montar(<PainelDeHistorico versoes={VERSOES} escolhida="v1"
      aoEscolher={() => {}} aoFechar={() => {}} />);
    expect(texto()).not.toContain('Restaurar esta versão');

    act(() => root.render(<PainelDeHistorico versoes={VERSOES} escolhida="v1"
      aoEscolher={() => {}} aoRestaurar={() => {}} aoFechar={() => {}} />));
    expect(texto()).toContain('Restaurar esta versão');
  });
});

/* ── Os três modos: o requisito 4.4 ────────────────────────────────────────── */

describe('o seletor de modo traz os três, sempre', () => {
  it('os três estão lá mesmo na lição que só pede um', () => {
    /*
      Um programa tem todos os comandos o tempo todo. Um editor que só
      mostrasse "Sugestão" na lição de sugerir ensinaria a procurar o botão
      que a tarefa quer, e não a procurar no programa.
    */
    montar(<SeletorDeModo modo="edicao" aoTrocar={() => {}} />);
    expect(opcoes()).toEqual(['Edição', 'Sugestão', 'Visualização']);
  });

  it('e o modo desenhado é o que lhe disseram, e não um guardado', () => {
    montar(<SeletorDeModo modo="sugestao" aoTrocar={() => {}} />);
    expect(container.querySelector('select')!.value).toBe('sugestao');

    act(() => root.render(<SeletorDeModo modo="visualizacao" aoTrocar={() => {}} />));
    expect(container.querySelector('select')!.value).toBe('visualizacao');
  });

  it('o que o modo de sugestão faz está escrito, e é que o texto não muda', () => {
    /* Sem essa frase os três modos são três palavras, e quem escolhe
       "Sugestão" acha que editou. */
    expect(MODOS_DE_TRABALHO.sugestao.diz).toMatch(/sugest/i);
    expect(MODOS_DE_TRABALHO.sugestao.diz).toMatch(/aceit/i);
  });
});

/* ── O histórico: o requisito 4.5 e o 8 ────────────────────────────────────── */

describe('o histórico diz quem escreveu, e que restaurar não apaga nada', () => {
  it('cada versão traz os nomes de quem escreveu nela', () => {
    /* Sem os nomes o histórico é uma lista de datas, e o requisito 8 — provar
       a participação de cada pessoa — não tem onde ser comprovado. */
    montar(<PainelDeHistorico versoes={VERSOES} escolhida={null}
      aoEscolher={() => {}} aoFechar={() => {}} />);
    expect(texto()).toContain('Marta');
    expect(texto()).toContain('Ronaldo');
    expect(texto()).toContain('Você');
  });

  it('e o painel escreve que a versão de agora continua no histórico', () => {
    /*
      É metade do requisito 4.5, e a metade que decide se alguém usa o
      recurso: quem acha que restaurar destrói o que veio depois nunca
      restaura. Um painel sem esta linha funciona perfeitamente e ensina o
      medo — nada estoura, e o desbravador simplesmente não clica.
    */
    montar(<PainelDeHistorico versoes={VERSOES} escolhida="v1"
      aoEscolher={() => {}} aoRestaurar={() => {}} aoFechar={() => {}} />);
    expect(texto()).toMatch(/continua no histórico/i);
  });

  it('a versão de agora vem primeiro, e está marcada como a atual', () => {
    /* Na estante a pergunta é "o que eu ganhei agora?"; aqui é "o que mudou
       desde ontem?". As duas se leem de cima para baixo, e a de agora é a
       primeira — mas ela precisa dizer que é ela, senão restaurar a primeira
       da lista parece não fazer nada. */
    montar(<PainelDeHistorico versoes={VERSOES} escolhida={null}
      aoEscolher={() => {}} aoFechar={() => {}} />);
    const linhas = [...container.querySelectorAll('.ed-versao')];
    expect(linhas[0].textContent).toContain('5 de julho');
    expect(linhas[0].textContent).toContain('versão atual');
  });

  it('restaurar a versão que já está aberta não é um botão que não faz nada', () => {
    /* Clicar e nada acontecer é o que ensina a desconfiar do programa. Ele
       fica desligado, e a dica diz por quê. */
    montar(<PainelDeHistorico versoes={VERSOES} escolhida="v3"
      aoEscolher={() => {}} aoRestaurar={() => {}} aoFechar={() => {}} />);
    const botao = botoes().find(b => b.textContent?.includes('Restaurar'))!;
    expect(botao.disabled).toBe(true);
    expect(botao.getAttribute('title')).toBeTruthy();
  });

  it('e com uma versão anterior escolhida ele liga', () => {
    montar(<PainelDeHistorico versoes={VERSOES} escolhida="v1"
      aoEscolher={() => {}} aoRestaurar={() => {}} aoFechar={() => {}} />);
    expect(botoes().find(b => b.textContent?.includes('Restaurar'))!.disabled).toBe(false);
  });
});

/* ── O cursor de quem está junto ───────────────────────────────────────────── */

describe('o cursor do outro aponta para um parágrafo que existe, ou não aparece', () => {
  it('sem o parágrafo na tela ele não se desenha em canto nenhum', () => {
    /*
      Um cursor pendurado em coordenada velha apontaria para o parágrafo
      errado — e dizer que a Marta está escrevendo onde ela não está é pior do
      que não mostrar cursor nenhum.
    */
    montar(<PalcoDoEditor><CursorDeOutro quem="marta" blocoId="nao-existe" /></PalcoDoEditor>);
    const cursor = container.querySelector<HTMLElement>('[data-cursor-de="marta"]')!;
    expect(cursor.style.display).toBe('none');
  });

  it('com o parágrafo na tela ele se desenha, com o nome de quem é', () => {
    montar(
      <PalcoDoEditor>
        <div data-bloco="p3">Um parágrafo</div>
        <CursorDeOutro quem="marta" blocoId="p3" />
      </PalcoDoEditor>,
    );
    const cursor = container.querySelector<HTMLElement>('[data-cursor-de="marta"]')!;
    expect(cursor.style.display).not.toBe('none');
    expect(cursor.textContent).toContain('Marta');
  });

  it('e ele fica fora do papel, sem empurrar o texto', () => {
    /* No editor de verdade o cursor do outro não muda o que está escrito.
       Desenhá-lo no fluxo faria o parágrafo andar sempre que alguém digitasse
       do outro lado. */
    const regra = CSS_DO_EDITOR_NA_NUVEM.slice(
      CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-cursor {'),
      CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-cursor > span'),
    );
    expect(regra).toContain('position: absolute');
    expect(regra).toContain('pointer-events: none');
  });
});

/* ── A folha ───────────────────────────────────────────────────────────────── */

describe('a folha do editor não deixa botão desligado com cara de clicável', () => {
  it('a regra do desligado vem depois da do principal, e não antes', () => {
    const principal = CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-btn[data-principal="sim"] {');
    const desligado = CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-btn:disabled {');
    expect(principal, 'a regra do principal sumiu').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu').toBeGreaterThan(-1);
    expect(desligado, 'o desligado está escrito antes do principal, e perde')
      .toBeGreaterThan(principal);
  });

  it('e o desligado troca o fundo, e não só a letra', () => {
    const regra = CSS_DO_EDITOR_NA_NUVEM.slice(
      CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-btn:disabled {'),
      CSS_DO_EDITOR_NA_NUVEM.indexOf('.ed-btn:disabled:hover'),
    );
    expect(regra).toContain('background');
  });
});

describe('no celular o histórico desce, e não some', () => {
  it('a regra existe e deita o palco', () => {
    const celular = CSS_DO_EDITOR_NA_NUVEM.slice(
      CSS_DO_EDITOR_NA_NUVEM.indexOf('@media (max-width: 760px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.ed-palco');
    expect(celular).toContain('.ed-historico');
  });

  it('e ela não esconde o painel de versões', () => {
    /*
      Esconder o histórico no celular tiraria o único caminho até o requisito
      4.5 — e reduzir a tela nunca reduz o que dá para fazer nela.
    */
    const celular = CSS_DO_EDITOR_NA_NUVEM.slice(
      CSS_DO_EDITOR_NA_NUVEM.indexOf('@media (max-width: 760px)'));
    expect(/\.ed-historico[^{]*\{[^}]*display:\s*none/.test(celular),
      'a regra do celular esconde o histórico').toBe(false);
  });
});
