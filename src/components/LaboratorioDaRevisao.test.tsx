// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaRevisao from './LaboratorioDaRevisao';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { PALAVRA_ESTRAGADA, TROCAS_ESPERADAS } from '../labs/diaDoDesbravador';
import { COR_DO_AUTOR } from '../labs/documento';

/*
  O relato revisado do módulo 5, percorrido clicando.

  `diaDoDesbravador.test.ts` prova que as cinco metas podem ficar verdes. Isto
  pergunta a outra metade — **a janela chama alguma delas?** — e quatro coisas
  que só esta lição faz:

  - **a marca aparece riscada e sublinhada, com a cor do autor?** É o único
    sinal de que o documento voltou mexido, e sem ele a primeira tarefa não
    tem o que resolver.
  - **Aceitar e Rejeitar agem na marca escolhida?** Agir na primeira pendente
    pareceria funcionar e resolveria a marca errada — o defeito que nenhum
    teste de motor sente.
  - **o Substituir Tudo estraga de verdade na tela?** A teoria promete o
    estrago; um laboratório que o evitasse mostraria referência divergente do
    que ele próprio faz.
  - **e o Desfazer devolve o documento?** A teoria diz que o Ctrl+Z desfaz a
    troca inteira e é a primeira coisa a apertar. Sem ele, quem estragasse o
    texto só teria Recomeçar, que joga fora tudo o mais que já foi feito.
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
        <LaboratorioDaRevisao
          vereda={VEREDA} licao={licaoDeWord('m5-lab')}
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

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('.wd-guia')].find(b => b.textContent?.trim() === nome);

const trecho = (id: string) => container.querySelector(`[data-trecho="${id}"]`);

const marcaComTexto = (texto: string) =>
  [...container.querySelectorAll('[data-revisao]')].find(e => e.textContent === texto);

const textoDaFolha = () =>
  [...container.querySelectorAll('.wd-pagina [data-bloco]')]
    .map(b => [...b.querySelectorAll('[data-trecho]')]
      .filter(x => x.getAttribute('data-revisao') !== 'excluido')
      .map(x => x.textContent).join(''))
    .join('\n');

const balao = (id: string) => container.querySelector(`[data-comentario="${id}"]`);

const escreverNo = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei ${nome}`).toBeTruthy();
  const el = campo as HTMLTextAreaElement | HTMLInputElement;
  const proto = el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const estado = () =>
  [...container.querySelectorAll('.wd-status span')].map(s => s.textContent?.trim()).join(' | ');

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const podeConcluir = () => !(botaoDeConcluir() as HTMLButtonElement).disabled;

/** Abrir Substituir, preencher e mandar trocar. */
const substituir = (de: string, para: string, inteiras = false) => {
  if (!comando('Substituir (Ctrl+H)')) clicar(guia('Início'), 'a guia Início');
  if (!container.querySelector('.wd-dialogo')) {
    clicar(comando('Substituir (Ctrl+H)'), 'Substituir');
  }
  escreverNo(container.querySelector('input[aria-label="Localizar"]'), de, 'o campo Localizar');
  escreverNo(container.querySelector('input[aria-label="Substituir por"]'), para, 'o campo Substituir por');
  const caixa = container.querySelector('#wd-op-inteiras') as HTMLInputElement;
  if (caixa.checked !== inteiras) clicar(caixa, 'a caixa de palavras inteiras');
  clicar([...container.querySelectorAll('.wd-dialogo-acoes button')]
    .find(b => b.textContent === 'Substituir Tudo'), 'Substituir Tudo');
};

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relato volta revisado', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abre já vencida').toBe(false);
  });

  it('as marcas da liderança aparecem riscadas e sublinhadas, com a cor do autor', () => {
    montar();
    const saiu = marcaComTexto('Pioneros');
    const entrou = marcaComTexto('Pioneiros');
    expect(saiu?.getAttribute('data-revisao'), 'o que a liderança riscou não está marcado')
      .toBe('excluido');
    expect(entrou?.getAttribute('data-revisao')).toBe('inserido');
    expect(saiu?.className, 'a marca não diz de quem é').toContain('wd-autor-lideranca');
    /* Riscado e sublinhado, e não só cor: quem não distingue as duas cores
       continua vendo o traço. É a mesma razão de a insígnia ter forma e cor. */
    expect(saiu?.className).toContain('wd-rev-excluido');
    expect(entrou?.className).toContain('wd-rev-inserido');
  });

  it('a cor do autor vai no estilo do elemento, e não só numa classe', () => {
    /*
      `aparenciaDoTrecho` devolve `style` inline, e estilo inline vence classe.
      A regra de folha existia, media 7,3:1 sobre o papel, e **nunca chegava à
      tela**: as duas marcas saíam na cor do corpo do documento, com o traço e
      o sublinhado certos e a autoria dizendo nada. Quem viu foi o Chromium; no
      jsdom não há cascata para atropelar, então o que se testa aqui é a
      promessa — a cor está no elemento, e não à espera de uma regra.
    */
    montar();
    /* O navegador normaliza o hexadecimal para `rgb()` ao gravar no estilo, e
       o jsdom faz o mesmo: a comparação é entre as duas formas da mesma cor, e
       não entre os dois textos. */
    const comoOEstiloGrava = (hex: string) => {
      const caixa = document.createElement('div');
      caixa.style.color = hex;
      return caixa.style.color;
    };

    const saiu = marcaComTexto('Pioneros') as HTMLElement;
    expect(saiu.style.color, 'a marca ficou com a cor do corpo do documento')
      .toBe(comoOEstiloGrava(COR_DO_AUTOR.lideranca));

    const semMarca = trecho('entrega-a') as HTMLElement;
    expect(semMarca.style.color, 'o texto comum ganhou cor de revisor')
      .not.toBe(comoOEstiloGrava(COR_DO_AUTOR.lideranca));
  });

  it('o comentário da liderança chega na margem, e o texto dele fica realçado', () => {
    montar();
    expect(container.querySelector('.wd-margem'), 'a margem de revisão não existe').toBeTruthy();
    expect(balao('c-lideranca')?.textContent).toContain('nove nomes');
    expect(trecho('qf-1-a')?.className, 'o trecho comentado não se distingue do resto')
      .toContain('wd-comentado');
  });

  it('o controle de alterações chega desligado e o status diz isso', () => {
    montar();
    expect(estado()).toContain('Controle desligado');
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Controlar Alterações'), 'Controlar Alterações');
    expect(estado()).toContain('Alterações controladas');
  });
});

describe('a lição pode ser vencida clicando', () => {
  it('ligar, resolver as duas marcas, responder, comentar e substituir', () => {
    montar();
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Controlar Alterações'), 'Controlar Alterações');

    /* A marca certa: aceitar. */
    clicar(marcaComTexto('Pioneros'), 'a marca do nome do clube');
    clicar(comando('Aceitar'), 'Aceitar');
    clicar(marcaComTexto('Pioneiros'), 'o texto inserido pela liderança');
    clicar(comando('Aceitar'), 'Aceitar');

    /* A errada: rejeitar. */
    clicar(marcaComTexto('sábado'), 'a marca da data');
    clicar(comando('Rejeitar'), 'Rejeitar');
    clicar(marcaComTexto('domingo'), 'a data riscada');
    clicar(comando('Rejeitar'), 'Rejeitar');
    expect(estado()).toContain('Sem marcas pendentes');
    expect(textoDaFolha()).toContain('Tudo aconteceu no domingo');

    /* A pergunta da margem: responder e só então resolver. */
    escreverNo(balao('c-lideranca')?.querySelector('textarea'),
      'A lista está certa: foram nove.', 'o campo de resposta');
    clicar([...balao('c-lideranca')!.querySelectorAll('button')]
      .find(b => b.textContent === 'Responder'), 'Responder');
    clicar([...balao('c-lideranca')!.querySelectorAll('button')]
      .find(b => b.textContent === 'Resolver'), 'Resolver');

    /* O comentário próprio, no parágrafo da data. */
    clicar(trecho('pr3-a'), 'o parágrafo da data');
    clicar(comando('Novo Comentário'), 'Novo Comentário');
    const meu = container.querySelector('[data-comentario^="meu-"]');
    escreverNo(meu?.querySelector('textarea'), 'Foi domingo mesmo — o título diz o mesmo.',
      'o campo do comentário novo');
    clicar([...meu!.querySelectorAll('button')].find(b => b.textContent === 'Responder'),
      'Comentar');

    /* E a troca, pelo caminho seguro. */
    substituir('crianças', 'desbravadores', true);
    substituir('criança', 'desbravador', true);

    const t = textoDaFolha();
    for (const frase of TROCAS_ESPERADAS) expect(t, `"${frase}" não saiu na folha`).toContain(frase);
    expect(t).not.toContain(PALAVRA_ESTRAGADA);

    expect(podeConcluir(), 'fiz tudo o que a lista pede e o botão continuou desabilitado')
      .toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu).toBe(true);
  });
});

describe('os dois botões grossos não fecham a tarefa', () => {
  it('Aceitar Todas resolve as marcas e deixa a data errada na folha', () => {
    montar();
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Aceitar Todas as Alterações'), 'Aceitar Todas');
    expect(estado()).toContain('Sem marcas pendentes');
    expect(textoDaFolha(), 'aceitar tudo não trocou a data — a armadilha sumiu')
      .toContain('Tudo aconteceu no sábado');
    expect(podeConcluir()).toBe(false);
  });

  it('Rejeitar Todas devolve o nome do clube escrito errado', () => {
    montar();
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Rejeitar Todas as Alterações'), 'Rejeitar Todas');
    expect(textoDaFolha()).toContain('Pioneros');
    expect(podeConcluir()).toBe(false);
  });

  it('Aceitar sem marca escolhida não resolve a primeira pendente', () => {
    /*
      Agir na primeira pendente pareceria funcionar, e resolveria a marca
      errada — a pessoa clicaria em Aceitar pensando no nome do clube e
      aceitaria a data. O motor continua correto, e nenhum teste dele sente.
    */
    montar();
    clicar(guia('Revisão'), 'a guia Revisão');
    const antes = estado();
    clicar(comando('Aceitar'), 'Aceitar');
    expect(estado(), 'Aceitar agiu sem ninguém ter escolhido a marca').toBe(antes);
    expect(marcaComTexto('Pioneros'), 'a marca sumiu sem ninguém a ter escolhido').toBeTruthy();
  });
});

describe('a substituição estraga de verdade, e o Desfazer devolve', () => {
  it('as duas caixas abrem desmarcadas, como no Word', () => {
    /* Abrir com elas marcadas tornaria a armadilha inalcançável, e a tarefa
       passaria a medir ter clicado em Substituir Tudo. */
    montar();
    clicar(guia('Início'), 'a guia Início');
    clicar(comando('Substituir (Ctrl+H)'), 'Substituir');
    expect((container.querySelector('#wd-op-inteiras') as HTMLInputElement).checked).toBe(false);
    expect((container.querySelector('#wd-op-maiusculas') as HTMLInputElement).checked).toBe(false);
  });

  it('o Substituir Tudo desatento põe "desbravadors" na folha', () => {
    montar();
    substituir('criança', 'desbravador');
    expect(textoDaFolha(), 'o estrago que a lição existe para mostrar não chegou à tela')
      .toContain(PALAVRA_ESTRAGADA);
    expect(podeConcluir()).toBe(false);
  });

  it('e o Desfazer devolve o documento inteiro', () => {
    montar();
    const antes = textoDaFolha();
    substituir('criança', 'desbravador');
    expect(textoDaFolha()).not.toBe(antes);

    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Desfazer (Ctrl+Z)'), 'Desfazer');
    expect(textoDaFolha(), 'o Desfazer não devolveu o texto que o Substituir Tudo trocou')
      .toBe(antes);
  });

  it('a caixa de busca conta as ocorrências antes de trocar qualquer coisa', () => {
    /* É o que deixa ver o tamanho do estrago antes dele acontecer: "criança"
       sem palavras inteiras acha mais lugares do que com ela. */
    montar();
    clicar(guia('Início'), 'a guia Início');
    clicar(comando('Substituir (Ctrl+H)'), 'Substituir');
    escreverNo(container.querySelector('input[aria-label="Localizar"]'), 'criança', 'Localizar');
    const solto = Number(container.querySelector('[data-achados]')!.getAttribute('data-achados'));

    clicar(container.querySelector('#wd-op-inteiras'), 'palavras inteiras');
    const inteiras = Number(container.querySelector('[data-achados]')!.getAttribute('data-achados'));

    expect(solto, 'a busca solta não acha mais do que a de palavras inteiras')
      .toBeGreaterThan(inteiras);
    expect(inteiras).toBeGreaterThan(0);
  });
});

describe('a conversa da margem, na tela', () => {
  it('resolver sem responder não fecha a tarefa', () => {
    montar();
    clicar([...balao('c-lideranca')!.querySelectorAll('button')]
      .find(b => b.textContent === 'Resolver'), 'Resolver');
    expect(balao('c-lideranca')?.getAttribute('data-resolvido')).toBe('true');
    expect(podeConcluir()).toBe(false);
  });

  it('Novo Comentário sem parágrafo escolhido não cria comentário nenhum', () => {
    /* Criar no primeiro parágrafo pareceria funcionar e poria o comentário no
       lugar errado, que é onde a tarefa não o procura. */
    montar();
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Novo Comentário'), 'Novo Comentário');
    expect(container.querySelector('[data-comentario^="meu-"]'),
      'um comentário nasceu sem ninguém escolher onde').toBeNull();
  });

  it('o comentário novo nasce vazio e só conta depois de escrito', () => {
    montar();
    clicar(trecho('pr3-a'), 'o parágrafo da data');
    clicar(guia('Revisão'), 'a guia Revisão');
    clicar(comando('Novo Comentário'), 'Novo Comentário');
    const meu = container.querySelector('[data-comentario^="meu-"]');
    expect(meu, 'o comentário não apareceu na margem').toBeTruthy();
    expect(podeConcluir(), 'um comentário em branco já contou').toBe(false);
  });
});
