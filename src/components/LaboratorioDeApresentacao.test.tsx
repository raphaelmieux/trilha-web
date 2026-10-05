// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeApresentacao from './LaboratorioDeApresentacao';
import {
  ERROS_FREQUENTES, METAS_DA_LICAO, PARTIDA_DA_LICAO,
  type LicaoDaCcEs011,
} from '../labs/metasDaCcEs011';
import { IDEIAS_ESSENCIAIS, OURO_LEGIVEL, VERDE_LEGIVEL } from '../labs/apresentacaoDoAcampamento';
import { NOMES_DOS_LAYOUTS } from '../labs/apresentacao';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As dez lições da CC-ES011, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  `metasDaCcEs011.test.ts` prova que cada meta **pode** ficar verde: ele monta o
  contexto que uma pessoa aplicada deixaria e chama `feita`. Isso não prova que
  a tela produz aquele contexto. Um botão sem `onClick`, um menu que não abre,
  um campo que não existe — o motor continua correto e a lição fica impossível
  de vencer, que é pior do que uma que abre resolvida: uma deixa uma tarefa
  verde de graça, a outra deixa quem fez tudo certo olhando uma lista vermelha
  sem nada na tela que explique. "Trava de motor não é trava de tela."

  E ela já achou uma: o corpo do slide era um campo por tópico, e aí não havia
  gesto nenhum para **apagar** um — a meta de seis tópicos por slide era
  impossível de fechar com o motor inteiramente correto. Hoje o corpo é uma
  caixa de texto só, que é o que um espaço reservado de conteúdo é.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES011' } as Vereda;

function montar(qual: LicaoDaCcEs011) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'apresentacao',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: METAS_DA_LICAO[qual].map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'apresentacao' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeApresentacao vereda={VEREDA} licao={licao}
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

const teclar = (key: string) => {
  act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
};

/*
  Escrever num campo controlado.

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

const escolher = (campo: Element | null | undefined, valor: string, nome: string) => {
  expect(campo, `não achei a lista "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLSelectElement;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, valor);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim() === texto);
const guia = (nome: string) => porTexto('.pp-guia', nome);
const itemDeMenu = (comeco: string) =>
  [...container.querySelectorAll('.pp-menu-item')].find(e => e.textContent?.trim().startsWith(comeco));
const slidesDaTira = () => [...container.querySelectorAll('.pp-tira-item')];

const irParaSlide = (indice: number) => clicar(slidesDaTira()[indice], `slide ${indice + 1}`);

/**
 * A cor normalizada, para comparar hexadecimal com o que o jsdom devolve.
 *
 * Ele guarda `background: #8A6D0B` como `rgb(138, 109, 11)`, e comparar as
 * cadeias conferiria a notação em vez da cor.
 */
const emRgb = (alvo: Element | string | null | undefined): string => {
  if (alvo === null || alvo === undefined) return 'nenhuma';
  if (typeof alvo === 'string') {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(alvo.slice(i, i + 2), 16));
    return `rgb(${r}, ${g}, ${b})`;
  }
  const estilo = (alvo as HTMLElement).style;
  return estilo.backgroundColor || estilo.background || 'nenhuma';
};

/** As tarefas que continuam vermelhas, pelo placar que a moldura escreve. */
const faltam = (): number => {
  const texto = container.textContent ?? '';
  const casa = texto.match(/(\d+) de (\d+) concluídas/);
  if (!casa) return -1;
  return Number(casa[2]) - Number(casa[1]);
};

const feitas = (licao: LicaoDaCcEs011): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DA_LICAO[licao]) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

/* ── O mestre ─────────────────────────────────────────────────────────────── */

describe('o módulo 1: o slide mestre', () => {
  it('fecha as três pela faixa', () => {
    montar('mestre');
    expect(faltam(), 'a lição não abriu com as três por fazer').toBe(3);

    clicar(guia('Exibir'), 'guia Exibir');
    clicar(porRotulo('Slide Mestre'), 'Slide Mestre');
    expect(container.textContent).toContain('Você está no');

    escolher(porRotulo('Fonte do título'), 'Georgia', 'fonte do título');
    escolher(porRotulo('Fonte do corpo'), 'Calibri', 'fonte do corpo');
    const ouro = container.querySelector('[aria-label="Cor do título"]')!;
    clicar(ouro.querySelector('[aria-label="Ouro do clube"]'), 'ouro do clube');
    clicar(porRotulo('Logo do clube'), 'logo');
    clicar(porRotulo('Número do Slide'), 'número do slide');
    clicar(porRotulo('Fechar Modo de Exibição Mestre'), 'fechar o mestre');

    expect(feitas('mestre')).toContain('identidade-no-mestre');
    expect(feitas('mestre')).toContain('logo-e-numero');
    expect(feitas('mestre'), 'a formatação direta saiu sem ninguém limpar')
      .not.toContain('sem-direta');

    clicar(guia('Página Inicial'), 'guia Página Inicial');
    clicar(porRotulo('Limpar Formatação'), 'Limpar Formatação');
    expect(faltam(), 'as três não fecharam clicando').toBe(0);
  });
});

/* ── O layout ─────────────────────────────────────────────────────────────── */

describe('o módulo 2: layout e não caixa à mão', () => {
  it('fecha as três passando os slides e aplicando layout', () => {
    montar('layout');
    expect(faltam()).toBe(3);

    /* A descoberta sai de ver dois slides seguidos, e não de entrar. */
    clicar(guia('Apresentação de Slides'), 'guia Apresentação de Slides');
    clicar(porRotulo('Do Começo (F5)'), 'Do Começo');
    expect(feitas('layout'), 'entrar na apresentação já marcou a descoberta')
      .not.toContain('viu-o-pulo');
    for (let i = 0; i < 11; i++) clicar(porRotulo('Próximo slide'), 'próximo slide');
    teclar('Escape');
    expect(feitas('layout')).toContain('viu-o-pulo');

    /* E agora o layout de cada um dos que têm caixa solta. */
    const quantos = PARTIDA_DA_LICAO.layout().ap.slides.length;
    clicar(guia('Página Inicial'), 'guia Página Inicial');
    for (let i = 0; i < quantos; i++) {
      irParaSlide(i);
      const comCaixa = container.querySelector('.pp-caixa');
      if (!comCaixa) continue;
      clicar(porRotulo('Layout'), 'Layout');
      const qual = i === 0 ? NOMES_DOS_LAYOUTS['titulo'] : NOMES_DOS_LAYOUTS['titulo-conteudo'];
      clicar(itemDeMenu(qual), qual);
    }
    expect(faltam(), 'as três não fecharam clicando').toBe(0);
  });
});

/* ── A hierarquia ─────────────────────────────────────────────────────────── */

describe('o módulo 3: hierarquia visual', () => {
  it('fecha as três pelo mestre e pelo texto dos slides', () => {
    montar('hierarquia');
    expect(faltam()).toBe(3);

    clicar(guia('Exibir'), 'guia Exibir');
    clicar(porRotulo('Slide Mestre'), 'Slide Mestre');
    escrever(porRotulo('Tamanho do corpo'), '24', 'tamanho do corpo');
    clicar(porRotulo('Fechar Modo de Exibição Mestre'), 'fechar o mestre');
    expect(feitas('hierarquia')).toContain('titulo-maior');

    /*
      E o texto, slide por slide: o corpo é uma caixa só, então encurtar e
      apagar linha são o mesmo gesto — que é o que um espaço reservado é.
    */
    const partida = PARTIDA_DA_LICAO.hierarquia().ap;
    const enxuto = PARTIDA_DA_LICAO.contraste().ap;
    for (let i = 0; i < partida.slides.length; i++) {
      const alvo = enxuto.slides.find(s => s.id === partida.slides[i].id);
      if (!alvo || alvo.topicos.length === 0) continue;
      irParaSlide(i);
      const campo = porRotulo(`Tópicos do slide ${i + 1}`);
      if (!campo) continue;
      escrever(campo, alvo.topicos.join('\n'), `tópicos do slide ${i + 1}`);
    }
    expect(faltam(), 'as três não fecharam clicando e digitando').toBe(0);
  });
});

/* ── O contraste ──────────────────────────────────────────────────────────── */

describe('o módulo 4: contraste', () => {
  it('fecha as três pelo telão e pelo seletor de cor', () => {
    montar('contraste');
    expect(faltam()).toBe(3);

    clicar(porTexto('button', 'Ver no telão, com luz na sala'), 'ver no telão');
    expect(container.textContent).toContain('Luz da sala acesa');
    teclar('Escape');
    expect(feitas('contraste')).toContain('viu-na-sala-clara');

    clicar(guia('Exibir'), 'guia Exibir');
    clicar(porRotulo('Slide Mestre'), 'Slide Mestre');
    const doTitulo = container.querySelector('[aria-label="Cor do título"]')!;
    const ouroEscuro = doTitulo.querySelector('[aria-label="Ouro do clube, 50% mais escuro"]');
    const doCorpo = container.querySelector('[aria-label="Cor do corpo"]')!;
    const verdeEscuro = doCorpo.querySelector('[aria-label="Verde do clube, 50% mais escuro"]');
    /*
      O tom que o seletor oferece é o que o modelo chama de legível.

      A conta do contraste mora no modelo e a coluna de tons mora na tela, e
      elas divergiriam no primeiro ajuste: alguém clareia um tom "para ficar
      mais bonito", a meta deixa de fechar, e nada na tela explica por quê.
    */
    expect(emRgb(ouroEscuro), 'o tom escuro do ouro não é o que o modelo mede')
      .toBe(emRgb(OURO_LEGIVEL));
    expect(emRgb(verdeEscuro), 'o tom escuro do verde não é o que o modelo mede')
      .toBe(emRgb(VERDE_LEGIVEL));
    clicar(ouroEscuro, 'ouro escuro');
    clicar(verdeEscuro, 'verde escuro');
    clicar(porRotulo('Fechar Modo de Exibição Mestre'), 'fechar o mestre');

    expect(faltam(), 'as três não fecharam clicando').toBe(0);
  });

  /*
    E o painel do PowerPoint **relata** a medida, sem julgar a tarefa.

    É a regra da régua de status do Word e do aviso do digitalizador: ele diz
    "contraste insuficiente", que é o que o verificador de acessibilidade de
    verdade escreve, e não diz se a lição está cumprida.
  */
  it('o verificador de acessibilidade relata a medida', () => {
    montar('contraste');
    clicar(guia('Revisão'), 'guia Revisão');
    clicar(porRotulo('Verificar Acessibilidade'), 'Verificar Acessibilidade');
    const painel = container.querySelector('aside[aria-label="Acessibilidade"]')!;
    expect(painel.textContent).toContain('contraste insuficiente');
    expect(painel.textContent, 'o painel julgou a tarefa em vez de relatar')
      .not.toMatch(/tarefa|lição|cumprid/i);
  });
});

/* ── Os três erros ────────────────────────────────────────────────────────── */

describe('o módulo 5: os três erros', () => {
  it('fecha as três no caderno', () => {
    montar('erros');
    expect(faltam()).toBe(3);

    clicar(porTexto('button', 'Abrir o caderno'), 'abrir o caderno');

    /*
      A saída de cada erro só aparece depois de classificar.

      Antes, ela diria a resposta — é a mutação que a CC-ES010 achou em três
      lições, onde o `porque` do achado aparecia antes da escolha e
      transformava a tarefa em leitura.
    */
    expect(container.textContent, 'a saída apareceu antes de classificar')
      .not.toContain(ERROS_FREQUENTES[0].saida);

    /*
      O clique é **dentro do cartão**: os três desenham as mesmas cinco opções,
      e procurar no documento inteiro mandaria as três respostas para o
      primeiro. Foi o que esta trava achou na primeira execução.
    */
    const cartoes = [...container.querySelectorAll('.card')]
      .filter(c => c.textContent?.includes('como a sala o vê'));
    expect(cartoes.length, 'não há um cartão por erro no caderno').toBe(ERROS_FREQUENTES.length);
    ERROS_FREQUENTES.forEach((e, i) => {
      const dentro = (texto: string) => [...cartoes[i].querySelectorAll('span.font-semibold')]
        .find(x => x.textContent?.trim() === texto);
      clicar(dentro(e.erro), `o erro "${e.erro}"`);
      clicar(dentro(e.efeito), `o efeito "${e.efeito}"`);
    });
    expect(container.textContent).toContain(ERROS_FREQUENTES[0].saida);

    const campos = cartoes.map(c => c.querySelector('textarea')!);
    expect(campos.filter(Boolean).length, 'não há um campo de escrever por erro').toBe(3);
    for (const campo of campos) {
      escrever(campo, 'Eu deixaria no slide só o que a família precisa anotar, e falaria o resto.', 'o que fazer');
    }
    expect(faltam(), 'as três não fecharam no caderno').toBe(0);
  });
});

/* ── As imagens ───────────────────────────────────────────────────────────── */

describe('o módulo 6: a imagem que o projetor mostra', () => {
  it('fecha as três pelo painel, pela troca e pela compactação', () => {
    montar('imagens');
    expect(faltam()).toBe(3);

    clicar(porTexto('.pp-guia', 'Arquivo'), 'guia Arquivo');
    clicar(porTexto('button', 'Informações'), 'Informações');
    expect(container.textContent).toContain('MB');
    clicar(porTexto('.pp-bt-dialogo', 'Fechar'), 'fechar o diálogo');
    clicar(porRotulo('Voltar para a apresentação'), 'voltar');
    expect(feitas('imagens')).toContain('viu-o-peso');

    /* O logo esticado está no primeiro slide. */
    irParaSlide(0);
    clicar(guia('Design'), 'guia Design');
    clicar(porRotulo('Abrir o painel Formatar Imagem'), 'Formatar Imagem');
    const painel = container.querySelector('aside[aria-label="Formatar Imagem"]')!;
    expect(painel.textContent).toContain('logo-clube.png');
    clicar(porTexto('.pp-bt-dialogo', 'Alterar Imagem'), 'Alterar Imagem');
    clicar(itemDeMenu('logo-clube-grande.png')
      ?? [...container.querySelectorAll('.pp-bt-dialogo')]
        .find(b => b.textContent?.startsWith('logo-clube-grande.png')),
    'logo grande');
    expect(feitas('imagens')).toContain('nada-esticado');

    clicar(porRotulo('Compactar Imagens'), 'Compactar Imagens');
    clicar(porRotulo('150 ppi'), '150 ppi');
    clicar(porTexto('.pp-bt-dialogo', 'OK'), 'OK');
    expect(faltam(), 'as três não fecharam clicando').toBe(0);
  });

  /* E 96 ppi não resolve: é o que o programa chama de "e-mail". */
  it('compactar a 96 ppi deixa a imagem pequena demais', () => {
    montar('imagens');
    clicar(guia('Design'), 'guia Design');
    clicar(porRotulo('Compactar Imagens'), 'Compactar Imagens');
    clicar(porRotulo('96 ppi'), '96 ppi');
    clicar(porTexto('.pp-bt-dialogo', 'OK'), 'OK');
    expect(feitas('imagens'), '96 ppi passou pela meta da resolução')
      .not.toContain('nada-esticado');
  });
});

/* ── O gráfico ────────────────────────────────────────────────────────────── */

describe('o módulo 7: o gráfico vem da planilha', () => {
  it('fecha as três colando da planilha e mexendo nela', () => {
    montar('grafico');
    expect(faltam()).toBe(3);

    /* Dois programas abertos querem dizer barra de tarefas. */
    expect(porTexto('button', 'Custos do acampamento.xlsx'),
      'a barra de tarefas não oferece a planilha').toBeTruthy();

    /* O slide dos custos é o que tem as linhas digitadas. */
    const partida = PARTIDA_DA_LICAO.grafico().ap;
    const indice = partida.slides.findIndex(s => s.topicos.some(t => /R\$ ?\d/.test(t)));
    expect(indice, 'nenhum slide tem a tabela digitada').toBeGreaterThanOrEqual(0);
    irParaSlide(indice);

    /* Apagar as linhas digitadas é apagar o texto da caixa do corpo. */
    escrever(porRotulo(`Tópicos do slide ${indice + 1}`), '', 'tópicos dos custos');

    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Gráfico'), 'Gráfico');
    clicar(itemDeMenu('Colar Mantendo a Formatação'), 'colar incorporando');
    expect(feitas('grafico')).toContain('grafico-da-planilha');
    expect(feitas('grafico')).toContain('grafico-acompanha');
    expect(feitas('grafico'), 'colar já marcou a descoberta').not.toContain('viu-qual-acompanhou');

    clicar(porTexto('button', 'Custos do acampamento.xlsx'), 'a planilha na barra de tarefas');
    escrever(porRotulo('Valor de Alimentação'), '95', 'valor da alimentação');
    clicar(porTexto('button', 'Acampamento de Inverno 2026'), 'voltar ao PowerPoint');

    expect(faltam(), 'as três não fecharam clicando').toBe(0);
  });

  /* E colar como imagem não fecha a segunda: ela congela os números. */
  it('colar como imagem deixa a meta de acompanhar vermelha', () => {
    montar('grafico');
    const partida = PARTIDA_DA_LICAO.grafico().ap;
    const indice = partida.slides.findIndex(s => s.topicos.some(t => /R\$ ?\d/.test(t)));
    irParaSlide(indice);
    escrever(porRotulo(`Tópicos do slide ${indice + 1}`), '', 'tópicos dos custos');
    clicar(guia('Inserir'), 'guia Inserir');
    clicar(porRotulo('Gráfico'), 'Gráfico');
    clicar(itemDeMenu('Colar como Imagem'), 'colar como imagem');
    expect(feitas('grafico')).toContain('grafico-da-planilha');
    expect(feitas('grafico'), 'a imagem fechou a meta de acompanhar')
      .not.toContain('grafico-acompanha');
  });
});

/* ── As notas ─────────────────────────────────────────────────────────────── */

describe('o módulo 8: as notas do apresentador', () => {
  it('fecha as três pelo painel de notas e pelo modo do apresentador', () => {
    montar('notas');
    expect(faltam()).toBe(3);

    clicar(guia('Apresentação de Slides'), 'guia Apresentação de Slides');
    clicar(porRotulo('Modo de Exibição do Apresentador'), 'modo do apresentador');
    expect(container.textContent).toContain('Suas notas');
    teclar('Escape');
    expect(feitas('notas')).toContain('viu-o-modo-do-apresentador');

    /*
      A faixa de notas abre **uma vez**, e não por slide: ela é do programa, e
      no PowerPoint o painel de notas fica aberto enquanto se passa de slide em
      slide. Abrir de novo a cada um fecharia o painel — foi o que esta trava
      achou na primeira execução.
    */
    const quantos = PARTIDA_DA_LICAO.notas().ap.slides.length;
    clicar(porRotulo('Notas do apresentador'), 'a faixa de notas');
    for (let i = 0; i < Math.min(8, quantos); i++) {
      irParaSlide(i);
      escrever(porRotulo(`Notas do slide ${i + 1}`),
        'Contar aqui o caso do ano passado, que explica por que esta parte existe.',
        `notas do slide ${i + 1}`);
    }
    expect(faltam(), 'as três não fecharam escrevendo as notas').toBe(0);
  });
});

/* ── O corte ──────────────────────────────────────────────────────────────── */

describe('o módulo 9: cortar pela metade', () => {
  it('fecha as três juntando, excluindo e justificando', () => {
    montar('corte');
    expect(faltam()).toBe(3);

    const pares: [string, string][] = [
      ['s2', 's3'], ['s4', 's5'], ['s6', 's7'], ['s9', 's10'], ['s12', 's13'], ['s15', 's16'],
    ];
    const partida = PARTIDA_DA_LICAO.corte().ap;
    /*
      Juntar é reescrever o que fica e excluir o que sai, que é o gesto de
      verdade — e o título também, senão ele denuncia o empilhamento.
    */
    for (const [fica, sai] of pares) {
      const a = partida.slides.find(s => s.id === fica)!;
      const b = partida.slides.find(s => s.id === sai)!;
      const juntos = [...a.topicos, ...b.topicos].filter(t => t.trim() !== '').slice(0, 6);
      const i = slidesDaTira().findIndex(
        e => e.getAttribute('aria-label')?.includes(a.titulo.slice(0, 18)));
      irParaSlide(i);
      escrever(porRotulo(`Título do slide ${i + 1}`),
        a.titulo.replace(/ — parte \d/i, ''), 'título do que fica');
      if (porRotulo(`Tópicos do slide ${i + 1}`)) {
        escrever(porRotulo(`Tópicos do slide ${i + 1}`), juntos.join('\n'), 'tópicos juntos');
      }
      const j = slidesDaTira().findIndex(
        e => e.getAttribute('aria-label')?.includes(b.titulo.slice(0, 18)));
      irParaSlide(j);
      clicar(guia('Página Inicial'), 'guia Página Inicial');
      clicar(porRotulo('Excluir Slide'), 'Excluir Slide');
    }
    /* E os dois que sobram para fechar em oito. */
    for (const id of ['s8', 's14']) {
      const alvo = partida.slides.find(s => s.id === id)!;
      const i = slidesDaTira().findIndex(
        e => e.getAttribute('aria-label')?.includes(alvo.titulo.slice(0, 18)));
      if (i < 0) continue;
      irParaSlide(i);
      clicar(porRotulo('Excluir Slide'), 'Excluir Slide');
    }

    clicar(porTexto('button', 'Abrir o caderno'), 'abrir o caderno');
    const campos = [...container.querySelectorAll('textarea')];
    expect(campos.length, 'o caderno não pede justificativa de cada slide que saiu')
      .toBeGreaterThanOrEqual(pares.length);
    for (const campo of campos) {
      escrever(campo, 'O conteúdo dele foi para o slide anterior, que agora cobre os dois.', 'justificativa');
    }
    expect(faltam(), 'as três não fecharam clicando e escrevendo').toBe(0);
  });
});

/* ── Cinco minutos ────────────────────────────────────────────────────────── */

describe('o módulo 10: cinco minutos, dez slides, vinte palavras', () => {
  it('fecha as três encurtando, lendo o roteiro e exportando', () => {
    montar('cinco-minutos');
    expect(faltam()).toBe(3);

    /* O roteiro se lê no caderno, e a abertura se escreve lá. */
    clicar(porTexto('button', 'Abrir o caderno'), 'abrir o caderno');
    expect(container.textContent).toContain('Roteiro');
    escrever(container.querySelector('textarea'),
      'Boa noite, obrigado por vir — em cinco minutos vocês saem com tudo.', 'abertura');
    clicar(porTexto('button', 'Voltar à apresentação'), 'voltar');

    /* E o texto de cada slide até caber em vinte palavras, sem perder nada. */
    const enxutos: Record<string, { titulo: string; topicos: string[] }> = {
      's1': { titulo: 'Acampamento de Inverno 2026', topicos: ['Clube de Desbravadores Pioneiros'] },
      's2': { titulo: 'O clube e o acampamento', topicos: [
        'Desde 1998, seis unidades', 'A maior atividade do ano',
        'Dez anos ou mais, com autorização'] },
      's4': { titulo: 'Quando, onde e como chegar', topicos: [
        '13 a 15 de junho', 'Chácara Recanto Verde, km 12', 'Ônibus: sexta, dezenove horas'] },
      's6': { titulo: 'O que levar', topicos: [
        'Saco de dormir e isolante', 'Lanterna e pilha de reserva',
        'Agasalho, touca e luva', 'Remédio: na enfermaria'] },
      's9': { titulo: 'Programação', topicos: [
        'Sexta, 19h: saída', 'Sábado: culto, classes, campo', 'Domingo, 11h: volta'] },
      's12': { titulo: 'Custos e pagamento', topicos: [
        'À vista até 30 de maio', 'Ou duas parcelas',
        'Pix: tesouraria', 'Precisa de ajuda? Fale conosco'] },
      's14': { titulo: 'O ano passado', topicos: [] },
      's15': { titulo: 'Regras e dúvidas', topicos: [
        'Silêncio é para todos', 'Ninguém sai da área sozinho', 'Dúvidas: a sua liderança'] },
    };
    const partida = PARTIDA_DA_LICAO['cinco-minutos']().ap;
    partida.slides.forEach((s, i) => {
      const alvo = enxutos[s.id];
      if (!alvo) return;
      irParaSlide(i);
      escrever(porRotulo(`Título do slide ${i + 1}`), alvo.titulo, `título ${i + 1}`);
      const campo = porRotulo(`Tópicos do slide ${i + 1}`);
      if (campo) escrever(campo, alvo.topicos.join('\n'), `tópicos ${i + 1}`);
    });
    expect(feitas('cinco-minutos')).toContain('vinte-palavras');

    /* E o PDF por último. */
    clicar(porTexto('.pp-guia', 'Arquivo'), 'guia Arquivo');
    clicar(porTexto('.pp-bt-dialogo', 'Criar Documento PDF/XPS')
      ?? porTexto('button', 'Exportar'), 'criar o PDF');
    expect(faltam(), 'as três não fecharam clicando e escrevendo').toBe(0);

    /* E as dez informações continuam lá. */
    expect(IDEIAS_ESSENCIAIS.length).toBe(10);
  });
});

/* ── O que a janela promete ───────────────────────────────────────────────── */

describe('a janela do PowerPoint é a mesma em todas as lições', () => {
  it('a fileira de guias não muda conforme o exercício', () => {
    const fileiras: string[][] = [];
    for (const qual of ['mestre', 'imagens', 'cinco-minutos'] as LicaoDaCcEs011[]) {
      montar(qual);
      fileiras.push([...container.querySelectorAll('.pp-guia')].map(e => e.textContent!.trim()));
      act(() => root.unmount());
      container.remove();
    }
    montar('mestre');
    expect(new Set(fileiras.map(f => f.join('|'))).size,
      'a faixa muda conforme o exercício, e um programa tem todos os comandos').toBe(1);
    expect(fileiras[0]).toContain('Transições');
  });

  /*
    E o painel de notas só aparece onde o laboratório tem o que fazer com ele.

    É a regra do `aoBuscar` do Explorador: peça que existe sem quem a atenda
    promete um gesto que não muda nada.
  */
  it('o painel de notas existe porque o laboratório entrega o setter', () => {
    montar('notas');
    expect(porRotulo('Notas do apresentador'), 'a faixa de notas não existe').toBeTruthy();
  });

  /* A cor do revisor do contraste some: as cores vão no elemento, não na folha. */
  it('o mestre pinta o título com a cor que ele carrega', () => {
    montar('contraste');
    const titulo = container.querySelector('.pp-palco .pp-slide p') as HTMLElement;
    expect(titulo, 'o palco não desenhou o título').toBeTruthy();
    expect(titulo.style.color, 'a cor do mestre ficou à espera de uma regra de folha').not.toBe('');
  });
});
