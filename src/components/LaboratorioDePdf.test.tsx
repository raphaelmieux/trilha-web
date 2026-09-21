// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDePdf, { CSS_DO_LABORATORIO } from './LaboratorioDePdf';
import { PASTAS_DA_CC_ES004, type LicaoDaCcEs004 } from '../labs/metasDaCcEs004';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As sete lições da CC-ES004, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs004.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a janela chama alguma delas: um comando da faixa
  sem `onClick`, um diálogo cujo OK não aplica, uma caixa de procurar que não
  procura — o motor continua correto e o laboratório fica impossível de vencer,
  que é pior do que um que abre resolvido, porque quem fez tudo certo fica
  olhando uma lista vermelha sem nada na tela que explique.

  É a mesma razão de `LaboratorioDeExplorador.test.tsx` e de
  `LaboratorioDePlanilha.test.tsx`, e está escrita nos dois: "trava de motor
  não é trava de tela".
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES004' } as Vereda;

function montar(pasta: LicaoDaCcEs004) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${pasta}`,
    tipo: 'pdf',
    titulo: 'Lição de teste',
    resumo: '',
    pasta,
    verificacoes: PASTAS_DA_CC_ES004[pasta].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'pdf' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDePdf vereda={VEREDA} licao={licao}
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

const porTexto = (seletor: string, texto: string) =>
  [...container.querySelectorAll(seletor)]
    .find(e => e.textContent?.trim().includes(texto));

/** Um comando da faixa, pelo rótulo que a pessoa lê. */
const comando = (rotulo: string) => porTexto('.pdf-faixa .pdf-bt', rotulo);

/** O botão principal da caixa de diálogo aberta. */
const confirmar = () =>
  container.querySelector<HTMLButtonElement>('.pdf-dialogo-bt[data-tom="principal"]');

/*
  O React guarda o último valor que ele mesmo pôs num campo e **descarta** o
  evento quando os dois batem, então escrever em `input.value` direto não chega
  a ele: a trava veria a tela não reagir e acusaria o componente de um defeito
  que é do teste. Quem desfaz isso é o setter nativo do protótipo.
*/
const escreverEm = (campo: HTMLInputElement | HTMLTextAreaElement, texto: string) => {
  act(() => {
    const proto = campo instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(campo, texto);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const escolherNo = (campo: HTMLSelectElement, valor: string) => {
  act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!
      .set!.call(campo, valor);
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const campoDoDialogo = (i = 0) =>
  container.querySelectorAll<HTMLInputElement>('.pdf-dialogo input[type="text"]')[i];

/** Abre um PDF da pasta pelo nome que aparece na lista. */
const abrir = (nome: string) => clicar(porTexto('.pdf-inicial .pdf-linha', nome));

const voltarAPasta = () => clicar(porTexto('.pdf-bt, .pdf-linha-acao', 'Voltar à pasta'));

/**
 * Quantas tarefas continuam abertas, lidas do contador da cápsula.
 *
 * É o número que o desbravador lê, e não um estado interno: uma trava que
 * chamasse o motor por fora provaria de novo o que `metasDaCcEs004.test.ts` já
 * prova, e continuaria verde com a janela sem chegar a ele.
 */
const abertas = () => {
  const texto = container.textContent ?? '';
  const m = /(\d+) de (\d+) conclu/.exec(texto);
  if (!m) throw new Error('o painel de tarefas não está na tela');
  return Number(m[2]) - Number(m[1]);
};

/* ── As sete lições ────────────────────────────────────────────────────────── */

describe('as lições da CC-ES004 se vencem clicando', () => {
  it('módulo 1 — gerar: os três PDFs e o que fica para trás', () => {
    montar('gerar');

    /* Os três programas, pelo mesmo caminho: Imprimir › Salvar como PDF. */
    for (const arquivo of ['ata-2026-03-14-v01.docx', 'orcamento-2026-07-01-v02.xlsx',
      'acampamento-2026-07-10-v01.pptx']) {
      clicar(porTexto('.pdf-inicial .pdf-linha', arquivo));
      clicar(confirmar());
      voltarAPasta();
    }

    /* E então mexer na ata, que é o que mostra o PDF ficando para trás. */
    clicar(porTexto('.pdf-inicial .pdf-linha', 'ata-2026-03-14-v01.docx'));
    clicar(porTexto('.pdf-dialogo-bt', 'Editar o arquivo'));
    escreverEm(campoDoDialogo(), 'Retificação: a diária passou a R$ 48,00.');
    clicar(confirmar());

    expect(abertas()).toBe(0);
  });

  it('módulo 2 — juntar: combinar, extrair e dividir', () => {
    montar('juntar');

    clicar(comando('Combinar'));
    clicar(confirmar());

    /* Extrair usa a página marcada no painel da esquerda. */
    clicar(container.querySelectorAll('.pdf-mini')[1]);
    clicar(comando('Extrair páginas'));
    clicar(confirmar());

    clicar(comando('Dividir'));
    const em = container.querySelector<HTMLSelectElement>('.pdf-dialogo select')!;
    escolherNo(em, '2');
    clicar(confirmar());

    expect(abertas()).toBe(0);
  });

  it('módulo 3 — reduzir: reconhecer primeiro, reduzir depois, e achar', () => {
    montar('reduzir');
    abrir('fichas-2026-06-20-v01.pdf');

    clicar(comando('Reconhecer texto'));
    clicar(comando('Reduzir tamanho'));
    clicar(confirmar());

    const procura = container.querySelector<HTMLInputElement>('.pdf-procurar input')!;
    escreverEm(procura, 'Ficha');

    expect(abertas()).toBe(0);
  });

  it('módulo 4 — digitalizar: enquadrar, endireitar, filtro e prova', () => {
    montar('digitalizar');

    clicar(porTexto('.pdf-inicial .pdf-bt', 'Digitalizar'));
    clicar(porTexto('.scan-bt', 'Tirar a foto'));

    /* Os cantos são botões: apertar encaixa, que é o mesmo resultado do
       arrasto bem-feito — e é o caminho de quem navega por teclado. */
    const canto = () => container.querySelector('.scan-canto')!;
    for (let i = 0; i < 4; i++) clicar(canto());

    const girar = container.querySelector<HTMLInputElement>('#scan-girar')!;
    escreverEm(girar, '0');
    clicar(porTexto('.scan-bt', 'Confirmar o recorte'));

    clicar(porTexto('.scan-filtro', 'Preto e branco'));
    clicar(porTexto('.scan-bt', 'Salvar como PDF'));

    expect(abertas()).toBe(0);
  });

  it('módulo 5 — formulário: preencher, responder e destacar', () => {
    montar('formulario');
    abrir('autorizacao-2026-06-15-v01.pdf');

    for (const campo of container.querySelectorAll<HTMLInputElement>('.pdf-campo')) {
      escreverEm(campo, 'Ana Beatriz Rocha');
    }

    voltarAPasta();
    abrir('circular-2026-06-02-v01.pdf');

    clicar(comando('Comentário'));
    escreverEm(
      container.querySelector<HTMLTextAreaElement>('.pdf-dialogo textarea')!,
      'Confirmei com a secretaria: a data bate.',
    );
    clicar(confirmar());

    clicar(comando('Destacar'));
    clicar(confirmar());

    expect(abertas()).toBe(0);
  });

  it('módulo 6 — assinar: e as duas descobertas que não deixam marca', () => {
    montar('assinar');
    abrir('autorizacao-2026-06-15-v01.pdf');

    clicar(comando('Assinar'));
    clicar(confirmar());

    /* Mexer depois de assinar é o que faz o selo virar "não confere" — e é
       por isso que se assina **outra vez** em seguida: um documento entregue
       com assinatura que não confere é o contrário do que o requisito ensina.
       Foi esta sequência que mostrou que as duas metas se excluíam. */
    escreverEm(container.querySelector<HTMLInputElement>('.pdf-campo')!, 'Ana B. Rocha');
    clicar(comando('Assinar'));
    clicar(confirmar());

    clicar(comando('Proteger'));
    escreverEm(campoDoDialogo(), 'clube2026');
    clicar(confirmar());

    clicar(comando('Copiar texto'));
    clicar(confirmar());

    expect(abertas()).toBe(0);
  });

  it('módulo 7 — dossiê: reunir o quinto, reconhecer e renomear', () => {
    montar('dossie');

    /* O quinto documento é o recibo do módulo 4, digitalizado de novo. */
    clicar(porTexto('.pdf-inicial .pdf-bt', 'Digitalizar'));
    clicar(porTexto('.scan-bt', 'Tirar a foto'));
    for (let i = 0; i < 4; i++) clicar(container.querySelector('.scan-canto')!);
    escreverEm(container.querySelector<HTMLInputElement>('#scan-girar')!, '0');
    clicar(porTexto('.scan-bt', 'Confirmar o recorte'));
    clicar(porTexto('.scan-filtro', 'Preto e branco'));
    clicar(porTexto('.scan-bt', 'Salvar como PDF'));
    voltarAPasta();

    /* O que ainda é foto sem texto dentro: o leitor avisa em amarelo. */
    abrir('IMG_20260719_101204.pdf');
    clicar(comando('Reconhecer texto'));
    voltarAPasta();

    const nomes = [
      'ata-2026-03-14-v01.pdf', 'orcamento-2026-07-01-v02.pdf',
      'presenca-2026-07-19-v01.pdf', 'circular-2026-06-02-v01.pdf',
      'recibo-2026-07-02-v01.pdf',
    ];
    /* Pelo índice, e não sempre no primeiro: renomear preserva a ordem da
       lista, então `querySelector` devolveria a mesma linha cinco vezes. */
    nomes.forEach((novoNome, i) => {
      clicar(container.querySelectorAll('.pdf-linha-acao')[i]);
      escreverEm(campoDoDialogo(), novoNome);
      clicar(confirmar());
    });

    expect(abertas()).toBe(0);
  });
});

/* ── O programa é o mesmo nas sete ─────────────────────────────────────────── */

describe('a janela é a mesma nas sete lições', () => {
  /*
    A faixa não muda conforme o exercício: todos os comandos o tempo todo,
    porque é assim que um programa é. Um leitor que só mostrasse Combinar na
    lição de combinar ensinaria a procurar o botão que a tarefa quer, e não a
    procurar no programa.
  */
  it('a faixa traz os mesmos comandos em todas', () => {
    const rotulos = (p: LicaoDaCcEs004) => {
      montar(p);
      const lista = [...container.querySelectorAll('.pdf-faixa .pdf-bt')]
        .map(b => b.textContent?.trim());
      act(() => root.unmount());
      container.remove();
      montar(p); /* remontada, para o afterEach ter o que desmontar */
      return lista;
    };
    const daPrimeira = rotulos('gerar');
    expect(daPrimeira.length).toBeGreaterThan(8);
    for (const p of ['juntar', 'reduzir', 'digitalizar', 'formulario', 'assinar',
      'dossie'] as LicaoDaCcEs004[]) {
      expect(rotulos(p)).toEqual(daPrimeira);
    }
  });

  it('no celular o diálogo sobe, e a regra vem depois da que o centra', () => {
    /*
      A cápsula de tarefas mora no canto de baixo, e um diálogo centrado põe
      Cancelar e Confirmar debaixo dela — vê-se o formulário inteiro e não se
      vê como confirmar. É o conserto que a CC-ES001 já fez.

      O que se confere é a **ordem**, e não a existência: as duas regras têm a
      mesma especificidade, e escrita antes a que sobe não valeria nada. O
      jsdom não resolve cascata nenhuma, então é a folha que se lê.
    */
    const centra = CSS_DO_LABORATORIO.indexOf('align-items: center');
    const sobe = CSS_DO_LABORATORIO.indexOf('align-items: flex-start');
    expect(centra, 'a regra que centra o diálogo sumiu').toBeGreaterThan(-1);
    expect(sobe, 'a regra que sobe o diálogo no celular sumiu').toBeGreaterThan(-1);
    expect(sobe).toBeGreaterThan(centra);
  });

  it('comando sem documento aberto avisa, em vez de agir no primeiro', () => {
    /*
      É a decisão do "selecione primeiro" do laboratório de Word e do Aceitar
      sem marca escolhida do de revisão: agir pareceria funcionar e agiria no
      documento errado — a pessoa clicaria pensando num e assinaria outro.
    */
    montar('assinar');
    const antes = abertas();
    clicar(comando('Assinar'));
    expect(container.querySelector('.pdf-dialogo')).toBeNull();
    expect(abertas()).toBe(antes);
  });
});
