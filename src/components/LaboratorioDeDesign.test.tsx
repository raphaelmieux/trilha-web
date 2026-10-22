// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeDesign from './LaboratorioDeDesign';
import {
  COR_SOZINHA_EXPLICADA, JUSTIFICATIVAS, LICOES_DA_CC_DG001, PALETA_COMPOSTA, PAR_EXPLICADO,
  analiseDeReferencia, metasDa, NOME_DO_PRINCIPIO, PRINCIPIOS, type LicaoDaCcDg001,
} from '../labs/metasDaCcDg001';
import { ESCALA_DA_CANTINA, NOME_DA_CLASSE, PECAS_DA_ANALISE } from '../labs/arteDoClube';
import { NOME_DO_PAPEL, PAPEIS, umaPrancha } from '../labs/design';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As oito lições da CC-DG001, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  `metasDaCcDg001.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que o editor chama alguma delas: um campo que não
  grava, um botão de alinhar sem `onClick`, um menu que não abre — o motor
  continua correto e a lição fica impossível de vencer. "Trava de motor não é
  trava de tela."
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root | undefined;

const VEREDA = { code: 'CC-DG001' } as Vereda;

function montar(qual: LicaoDaCcDg001) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'design', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'design' }>;
  act(() => {
    root!.render(
      <MemoryRouter>
        <LaboratorioDeDesign vereda={VEREDA} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  /* A primeira trava não monta nada: ela lê o registro. */
  if (!root) return;
  act(() => root!.unmount());
  root = undefined;
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '', shiftKey = false) => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey })); });
};

/* O setter nativo do protótipo: escrever direto em `value` não chega ao React. */
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement | HTMLTextAreaElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const tecla = (alvo: Element | null | undefined, key: string, extra: KeyboardEventInit = {}) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

const sair = (campo: Element | null | undefined) => {
  act(() => { campo!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); });
};

const escolher = (campo: Element | null | undefined, valor: string, nome: string) => {
  expect(campo, `não achei a lista "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLSelectElement;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, valor);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

/* O editor seleciona no pointerdown, como todo editor de design. */
const apertar = (alvo: Element | null | undefined, nome: string) => {
  expect(alvo, `não achei ${nome} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })); });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);

const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  if (!casa) return -1;
  return Number(casa[2]) - Number(casa[1]);
};

/* ── O editor ─────────────────────────────────────────────────────────────── */

/** Escolher um objeto pela lista de camadas; com Shift, somar à seleção. */
const camada = (nome: string, somar = false) =>
  clicar([...container.querySelectorAll('.dz-esquerda .dz-lista-item')]
    .find(b => b.closest('.dz-secao')?.textContent?.startsWith('Camadas') && b.textContent?.trim() === nome),
  `a camada ${nome}`, somar);

const camadas = (...nomes: string[]) => nomes.forEach((n, i) => camada(n, i > 0));

const prancha = (nome: string) =>
  clicar([...container.querySelectorAll('.dz-esquerda .dz-lista-item')].find(b => b.textContent?.trim() === nome), `a prancha ${nome}`);

/** Um campo numérico do painel: escrever e confirmar com Enter. */
const campo = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};

const mudarTexto = (opcoes: {
  familia?: string; peso?: '400' | '700'; corpo?: number; entrelinha?: number; cor?: string;
  x?: number; y?: number; l?: number; alinhamento?: 'esquerda' | 'centro';
}) => {
  if (opcoes.familia) escolher(porRotulo('Família'), opcoes.familia, 'família');
  if (opcoes.peso) escolher(porRotulo('Peso'), opcoes.peso, 'peso');
  if (opcoes.corpo !== undefined) campo('Corpo', opcoes.corpo);
  if (opcoes.entrelinha !== undefined) campo('Entrelinha', opcoes.entrelinha);
  if (opcoes.cor) campo('Cor do texto', opcoes.cor);
  if (opcoes.alinhamento) clicar(porRotulo(opcoes.alinhamento === 'esquerda' ? 'Texto à esquerda' : 'Texto centrado'), 'alinhamento');
  if (opcoes.l !== undefined) campo('L', opcoes.l);
  if (opcoes.x !== undefined) campo('X', opcoes.x);
  if (opcoes.y !== undefined) campo('Y', opcoes.y);
};

const menu = (qual: string, itemComeco: string) => {
  clicar(porTexto('.dz-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dz-menu-item', itemComeco), `o item ${itemComeco}`);
};

const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as oito lições da CC-DG001, pela tela', () => {
  it('toda lição da plataforma abre a tela dela', () => {
    const daPlataforma = (Object.keys(LICOES_DA_CC_DG001) as LicaoDaCcDg001[])
      .filter(l => LICOES_DA_CC_DG001[l].programa === 'plataforma');
    expect(daPlataforma.length).toBeGreaterThan(0);
    for (const l of daPlataforma) {
      montar(l);
      expect(faltam(), l).toBe(metasDa(l).length);
      act(() => root!.unmount());
      root = undefined;
      container.remove();
    }
  });

  it('módulo 1: o cartaz ganha hierarquia', () => {
    montar('hierarquia');
    expect(faltam()).toBe(metasDa('hierarquia').length);
    camada('Título');
    mudarTexto({ corpo: 40, peso: '700', entrelinha: 1.15, y: 40 });
    camada('Data');
    mudarTexto({ corpo: 24, peso: '700', y: 150 });
    camada('Local'); mudarTexto({ y: 190 });
    camada('Descrição'); mudarTexto({ y: 236 });
    camada('Inscrições'); mudarTexto({ y: 326 });
    camada('Clube'); mudarTexto({ corpo: 14, y: 390 });
    camada('Foto das barracas'); campo('Y', 430); campo('A', 200);
    expect(faltam()).toBe(0);
  });

  it('módulo 2: o aviso numa borda só, com os grupos separados', () => {
    montar('alinhamento');
    tecla(porRotulo('Mesa de trabalho'), 'a', { ctrlKey: true });
    clicar(porRotulo('Alinhar à esquerda'), 'alinhar à esquerda');
    expect(faltam()).toBe(1);
    const ys: [string, number][] = [
      ['Título', 48], ['Dia', 126], ['Hora', 154], ['Local', 182],
      ['Traga', 240], ['Ficha de saúde', 268], ['Autorização', 296], ['Assinatura', 354],
    ];
    for (const [nome, y] of ys) { camada(nome); campo('Y', y); }
    expect(faltam()).toBe(0);
  });

  it('módulo 3: os cartões repetem, e tudo respira', () => {
    montar('repeticao');
    camadas('Cartão 1', 'Cartão 2', 'Cartão 3');
    campo('L', 128); campo('A', 150); campo('Y', 100);
    campo('Preenchimento', '#E8F0E8');
    for (const [i, x] of [32, 176, 320].entries()) { camada(`Cartão ${i + 1}`); campo('X', x); }

    camada('Cartão 1 · atividade');
    clicar(porRotulo('Copiar estilo'), 'copiar estilo');
    camadas('Cartão 2 · atividade', 'Cartão 3 · atividade');
    clicar(porRotulo('Colar estilo'), 'colar estilo');
    camadas('Cartão 1 · atividade', 'Cartão 2 · atividade', 'Cartão 3 · atividade');
    campo('L', 108); campo('Y', 112);

    camada('Cartão 1 · horário');
    clicar(porRotulo('Copiar estilo'), 'copiar estilo');
    camadas('Cartão 2 · horário', 'Cartão 3 · horário');
    clicar(porRotulo('Colar estilo'), 'colar estilo');
    camadas('Cartão 1 · horário', 'Cartão 2 · horário', 'Cartão 3 · horário');
    campo('L', 108); campo('Y', 200);

    for (const [i, x] of [42, 186, 330].entries()) {
      camada(`Cartão ${i + 1} · atividade`); campo('X', x);
      camada(`Cartão ${i + 1} · horário`); campo('X', x);
    }
    camada('Título'); mudarTexto({ x: 32, y: 40, l: 416 });
    camada('Rodapé'); mudarTexto({ x: 32, y: 630, l: 416 });
    expect(faltam()).toBe(0);
  });

  it('módulo 4: a paleta, a prova de impressão e o porquê de cada cor', () => {
    montar('cor');
    clicar(porTexto('.dz-aba', 'Cores'), 'a aba Cores');
    for (const papel of PAPEIS) {
      campo(`${NOME_DO_PAPEL[papel]} (hexadecimal)`, PALETA_COMPOSTA[papel]!);
    }
    expect(faltam()).toBe(2);
    menu('Exibir', 'Prova de impressão');
    expect(faltam()).toBe(1);
    abrirOCaderno();
    for (const papel of PAPEIS) {
      escrever(container.querySelector(`#cor-${papel}`), JUSTIFICATIVAS[papel], `justificativa de ${papel}`);
    }
    expect(faltam()).toBe(0);
  });

  it('módulo 4: os campos H, S e L mexem na cor', () => {
    montar('cor');
    clicar(porTexto('.dz-aba', 'Cores'), 'a aba Cores');
    campo('Neutro — S', 0);
    const hex = (porRotulo('Neutro (hexadecimal)') as HTMLInputElement).value;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it('módulo 5: duas famílias que contrastam, e o porquê', () => {
    montar('tipografia');
    camada('Título'); mudarTexto({ familia: 'Georgia' });
    camada('Subtítulo'); mudarTexto({ familia: 'Arial', peso: '700', y: 104 });
    camada('Parágrafo 1'); mudarTexto({ familia: 'Arial', corpo: 15, entrelinha: 1.5, y: 150 });
    camada('Parágrafo 2'); mudarTexto({ familia: 'Arial', corpo: 15, entrelinha: 1.5, y: 256 });
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#par-tipografico'), PAR_EXPLICADO, 'o par tipográfico');
    expect(faltam()).toBe(0);
  });

  it('módulo 6: as três peças, classificadas e analisadas apontando na peça', () => {
    montar('analise');
    const ref = analiseDeReferencia(LICOES_DA_CC_DG001.analise.contexto.arte);
    for (const peca of PECAS_DA_ANALISE) {
      const nome = umaPrancha(LICOES_DA_CC_DG001.analise.contexto.arte, peca)!.nome;
      clicar(porTexto('[role="tab"]', nome), `a aba ${nome}`);
      const radio = [...container.querySelectorAll('label')]
        .find(l => l.textContent?.trim() === NOME_DA_CLASSE[ref[peca].classe!])?.querySelector('input');
      clicar(radio, 'a classificação');
      for (const pr of PRINCIPIOS) {
        const n = ref[peca].notas[pr];
        const caixa = porRotulo(NOME_DO_PRINCIPIO[pr])!;
        clicar([...caixa.querySelectorAll('button')].find(b => b.textContent === (n.veredito === 'funciona' ? 'Funciona' : 'Falha')), 'o veredito');
        clicar([...caixa.querySelectorAll('button')].find(b => b.textContent?.includes('Apontar')), 'apontar');
        apertar(container.querySelector(`[data-objeto="${n.elemento}"]`), `o elemento ${n.elemento}`);
        expect(caixa.textContent).toContain('Apontado:');
        escrever(container.querySelector(`#nota-${peca}-${pr}`), n.texto, 'a nota');
      }
    }
    expect(faltam()).toBe(0);
  });

  it('módulo 6: sem apontar, o elemento não se escolhe sozinho', () => {
    montar('analise');
    apertar(container.querySelector('[data-objeto="titulo"]'), 'o título');
    expect(container.textContent).not.toContain('Apontado:');
  });

  it('módulo 7: duplicar e refazer a cópia, com a de antes intacta', () => {
    montar('refazer');
    clicar(botao('Duplicar prancha'), 'duplicar prancha');
    expect(container.querySelector('.dz-lista-item[aria-current="true"]')?.textContent).toContain('(cópia)');
    camadas('Clube', 'Título', 'Data', 'Hora', 'Local', 'Convite');
    mudarTexto({ familia: 'Arial', alinhamento: 'esquerda', cor: '#333333', l: 400, x: 40 });
    camada('Título'); mudarTexto({ familia: 'Georgia', corpo: 40, peso: '700', entrelinha: 1.15, cor: '#1F2A24', y: 48 });
    camada('Data'); mudarTexto({ corpo: 22, peso: '700', cor: '#1F2A24', y: 160 });
    camada('Hora'); mudarTexto({ corpo: 18, y: 198 });
    camada('Local'); mudarTexto({ corpo: 18, y: 226 });
    camada('Convite'); mudarTexto({ corpo: 18, y: 276 });
    camada('Clube'); mudarTexto({ corpo: 14, cor: '#555555', y: 616 });
    camada('Foto da piscina'); campo('X', 40); campo('Y', 350); campo('L', 400); campo('A', 230);
    expect(faltam()).toBe(0);
  });

  it('módulo 8: medir a própria peça, ver sem cor, e escrever a situação', () => {
    montar('contraste');
    prancha('Convite do batismo (cópia)');
    menu('Plugins', 'Medidor de contraste');
    for (const nome of ['Clube', 'Título', 'Data', 'Hora', 'Local', 'Convite']) camada(nome);
    expect(container.textContent).toContain('Acima do mínimo');
    expect(faltam()).toBe(3);

    prancha('Escala da cantina');
    menu('Exibir', 'Tons de cinza');
    expect(faltam()).toBe(3);
    menu('Exibir', 'Deuteranopia');
    expect(faltam()).toBe(2);

    clicar(porTexto('.dz-aba', 'Propriedades'), 'a aba Propriedades');
    for (const [i, { nome, situacao }] of ESCALA_DA_CANTINA.entries()) {
      camada(`Nome ${i + 1}`);
      const conteudo = porRotulo('Conteúdo do texto');
      escrever(conteudo, `${nome} — ${situacao}`, 'o conteúdo');
      sair(conteudo);
    }
    expect(faltam()).toBe(1);
    abrirOCaderno();
    escrever(container.querySelector('#cor-sozinha'), COR_SOZINHA_EXPLICADA, 'a cor sozinha');
    expect(faltam()).toBe(0);
  });
});

describe('o editor como programa', () => {
  it('Ctrl+Z desfaz o último passo, e Refazer o devolve', () => {
    montar('hierarquia');
    camada('Título');
    campo('Corpo', 40);
    expect((porRotulo('Corpo') as HTMLInputElement).value).toBe('40');
    clicar(porRotulo('Desfazer (Ctrl+Z)'), 'desfazer');
    expect((porRotulo('Corpo') as HTMLInputElement).value).toBe('18');
    clicar(porRotulo('Refazer (Ctrl+Y)'), 'refazer');
    expect((porRotulo('Corpo') as HTMLInputElement).value).toBe('40');
  });

  it('Del apaga o selecionado, e as setas o empurram', () => {
    montar('hierarquia');
    camada('Clube');
    tecla(porRotulo('Mesa de trabalho'), 'ArrowRight', { shiftKey: true });
    expect((porRotulo('X') as HTMLInputElement).value).toBe('50');
    tecla(porRotulo('Mesa de trabalho'), 'Delete');
    expect(container.querySelector('[data-objeto="clube"]')).toBeNull();
  });

  it('a ferramenta Texto cria um texto onde se clica', () => {
    montar('hierarquia');
    clicar(porRotulo('Texto (T)'), 'a ferramenta Texto');
    act(() => {
      porRotulo('Prancha Cartaz do acampamento')!.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 640 }));
    });
    expect([...container.querySelectorAll('.dz-esquerda .dz-lista-item')].some(b => b.textContent?.trim() === 'Texto')).toBe(true);
  });

  it('a lista de famílias diz a classificação de cada uma', () => {
    montar('tipografia');
    camada('Título');
    const opcoes = [...(porRotulo('Família') as HTMLSelectElement).options].map(o => o.textContent);
    expect(opcoes).toContain('Georgia — serifada');
    expect(opcoes).toContain('Courier New — monoespaçada');
  });

  it('o medidor relata a medida e nunca a tarefa', () => {
    montar('refazer');
    menu('Plugins', 'Medidor de contraste');
    camada('Título');
    const painel = porTexto('.dz-secao', 'Medidor de contraste')!.textContent!;
    expect(painel).toMatch(/\d+,\d{2}:1/);
    expect(painel).toContain('Abaixo do mínimo');
    expect(painel).not.toMatch(/tarefa|lição|cumprid/i);
  });
});
