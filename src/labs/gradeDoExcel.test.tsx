// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import PlanilhaLab from './PlanilhaLab';
import LaboratorioDePlanilha from '../components/LaboratorioDePlanilha';
import LaboratorioDeDados from '../components/LaboratorioDeDados';
import LaboratorioDaAnalise from '../components/LaboratorioDaAnalise';
import { CADERNOS_DA_CC_ES003 } from './cadernosDaCcEs003';
import { LICOES_DA_CC_ES008 } from './metasDaCcEs008';
import { LICOES_DA_CC_ES009 } from './metasDaCcEs009';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  Os laboratórios de planilha teclam igual, e é isto que se confere aqui.

  ── O defeito que fez esta trava existir ─────────────────────────────────
  A seleção, a edição e o teclado estavam escritos duas vezes — uma em
  `PlanilhaLab`, outra em `LaboratorioDePlanilha` —, e as duas cópias já tinham
  divergido: a da AP043 tinha Ctrl+C, Ctrl+X e Ctrl+V, e a da CC-ES003 não
  tinha nenhum dos três. Quem aprendeu a copiar e colar na trilha chegava na
  vereda, apertava Ctrl+C, e nada acontecia — sem erro, sem aviso, e sem nada
  na tela dizendo que ali aquilo não existe. A plataforma passou a mostrar dois
  Excel, que é o defeito que `excel.tsx` existe para impedir um andar acima.

  `excel.tsx` guarda as peças **sem estado**; `useGradeDoExcel` passou a
  guardar o **gesto**. Só que gancho compartilhado não prova tela igual: cada
  laboratório ainda escolhe o que passa para a grade, e é fácil um deles
  esquecer o `aoTeclar` ou embrulhar um gesto de um jeito que o engula. Por
  isso a conferência é de fora, pelos mesmos cliques e pelas mesmas teclas.

  ── E a lista de laboratórios não é escrita à mão ────────────────────────
  Trava com lista escrita à mão para de conferir sozinha: o laboratório novo
  entra, ninguém o acrescenta, e a build segue verde conferindo os velhos —
  que é indistinguível de estar tudo certo. A lista sai do repositório: todo
  módulo de tela que importa `useGradeDoExcel` tem de estar na mesa abaixo.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* ── A mesa: montar cada laboratório e falar com ele pelas mesmas peças ───── */

let container: HTMLDivElement;
let root: Root;

function abrir(desenhar: () => React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => { root.render(<MemoryRouter>{desenhar()}</MemoryRouter>); });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const VEREDA = { code: 'CC-ES003' } as Vereda;

/**
 * Os laboratórios que usam o gancho, e como cada um se abre.
 *
 * A chave é o caminho do módulo a partir de `src/`, e é por ela que a
 * conferência de baixo cobra que nenhum tenha ficado de fora.
 */
const LABORATORIOS: Record<string, () => React.ReactElement> = {
  'labs/PlanilhaLab.tsx': () => (
    <PlanilhaLab
      specialtyCode="AP043" lessonCode="AP043.5-L2"
      lessonTitle="Montando o orçamento do acampamento"
      requirementCodes={['AP043-5.1']}
      userId="00000000-0000-0000-0000-000000000000" />
  ),
  'components/LaboratorioDePlanilha.tsx': () => (
    <LaboratorioDePlanilha
      vereda={VEREDA}
      licao={{
        id: 'lab-arrumar',
        tipo: 'planilha',
        titulo: 'Lição de teste',
        resumo: '',
        caderno: 'arrumar',
        verificacoes: CADERNOS_DA_CC_ES003.arrumar.metas.map(m => m.id),
      } as Extract<LicaoDeVereda, { tipo: 'planilha' }>}
      aoVencer={async () => {}} aoSair={() => {}} />
  ),
  'components/LaboratorioDeDados.tsx': () => (
    <LaboratorioDeDados
      vereda={{ code: 'CC-ES008' } as Vereda}
      licao={{
        id: 'lab-conserto',
        tipo: 'dados',
        titulo: 'Lição de teste',
        resumo: '',
        licao: 'conserto',
        verificacoes: LICOES_DA_CC_ES008.conserto.metas.map(m => m.id),
      } as Extract<LicaoDeVereda, { tipo: 'dados' }>}
      aoVencer={async () => {}} aoSair={() => {}} />
  ),
  'components/LaboratorioDaAnalise.tsx': () => (
    <LaboratorioDaAnalise
      vereda={{ code: 'CC-ES009' } as Vereda}
      licao={{
        id: 'lab-centro',
        tipo: 'analise',
        titulo: 'Lição de teste',
        resumo: '',
        licao: 'centro',
        verificacoes: LICOES_DA_CC_ES009.centro.metas.map(m => m.id),
      } as Extract<LicaoDeVereda, { tipo: 'analise' }>}
      aoVencer={async () => {}} aoSair={() => {}} />
  ),
};

/* ── Os gestos, escritos uma vez e rodados em todos ────────────────────────── */

const grade = () => container.querySelector('.pl-grade-caixa')!;
const linha = (l: number) => container.querySelectorAll('.pl-grade tbody tr')[l];
const celula = (l: number, c: number) => linha(l).querySelectorAll('td')[c];
const nomeDaCaixa = () => container.querySelector('.pl-nome')!.textContent!.trim();
const campoDaCelula = () => container.querySelector<HTMLInputElement>('.pl-celula-entrada');

const apontar = (alvo: Element) => {
  act(() => {
    alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
  });
};

const teclar = (alvo: Element, key: string, extra: KeyboardEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

/*
  Escrever tecla a tecla, e em quem está com o foco agora.

  `input.value = x` não chega ao React: ele guarda o último valor que ele mesmo
  pôs e descarta o evento quando os dois batem. Quem desfaz isso é o setter
  nativo do protótipo. E o campo em foco pode ter mudado no meio da digitação,
  que é um defeito que esta casa já teve — escreve-se em quem está com o foco,
  como o teclado faria.
*/
const digitar = (texto: string) => {
  for (const letra of texto) {
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value')!.set!;
      const campo = document.activeElement as HTMLInputElement;
      setter.call(campo, campo.value + letra);
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
};

/** Escreve na célula pelo gesto mais usado do Excel: digitar por cima dela. */
const escreverNaCelula = (l: number, c: number, texto: string) => {
  apontar(celula(l, c));
  teclar(grade(), texto[0]);
  digitar(texto.slice(1));
  teclar(campoDaCelula()!, 'Enter');
};

const lido = (l: number, c: number) => celula(l, c).textContent?.trim() ?? '';

/*
  Onde os gestos acontecem.

  A linha 8 fica abaixo do que os cadernos da AP043 e da CC-ES003 trazem
  escrito; na aba de respostas da CC-ES009 ela é um registro, e escrever ali
  mexe na base daquela lição. Nenhum dos dois casos muda o que se confere:
  cada gesto lê o que a célula trazia antes e compara com o que ela trouxe
  depois, então o que está na mesa é a **tecla**, e nunca a planilha aberta.

  Comparar com vazio funcionaria só no laboratório cuja célula nasce vazia —
  que é a trava passando por acaso, indistinguível de estar certa.
*/
const L = 8;

type Gesto = () => void;

const GESTOS: Record<string, Gesto> = {
  'a seleção segue o clique, e a caixa de nome diz onde ela está': () => {
    apontar(celula(L, 1));
    expect(nomeDaCaixa()).toBe(`B${L + 1}`);
    apontar(celula(L + 1, 2));
    expect(nomeDaCaixa()).toBe(`C${L + 2}`);
  },

  'digitar por cima da célula selecionada abre a edição com a tecla': () => {
    apontar(celula(L, 0));
    teclar(grade(), 'T');
    const campo = campoDaCelula();
    expect(campo, 'digitar sobre a célula não abriu a edição').not.toBeNull();
    expect(campo!.value, 'a primeira tecla não entrou no campo').toBe('T');
    digitar('ucano');
    expect(campoDaCelula()!.value, 'o campo perdeu teclas no meio da palavra').toBe('Tucano');
    teclar(campoDaCelula()!, 'Enter');
    expect(lido(L, 0)).toBe('Tucano');
  },

  'Esc desiste, e o blur que vem atrás não grava por baixo dele': () => {
    const antes = lido(L, 0);
    apontar(celula(L, 0));
    teclar(grade(), 'X');
    digitar('yz');
    teclar(campoDaCelula()!, 'Escape');
    act(() => { campoDaCelula()?.blur(); });
    expect(lido(L, 0), 'Esc não desfez a escrita').toBe(antes);
  },

  'as setas andam, Enter desce e Tab anda de lado': () => {
    apontar(celula(L, 1));
    teclar(grade(), 'ArrowDown');
    expect(nomeDaCaixa(), 'a seta para baixo não andou').toBe(`B${L + 2}`);
    teclar(grade(), 'ArrowRight');
    expect(nomeDaCaixa(), 'a seta para a direita não andou').toBe(`C${L + 2}`);
    teclar(grade(), 'Enter');
    expect(nomeDaCaixa(), 'o Enter não desceu').toBe(`C${L + 3}`);
    teclar(grade(), 'Tab');
    expect(nomeDaCaixa(), 'o Tab não andou de lado').toBe(`D${L + 3}`);
  },

  /*
    Este é o gesto que estava num laboratório e não no outro, e é por ele que
    esta trava existe.
  */
  'Ctrl+C e Ctrl+V levam o conteúdo de uma célula para outra': () => {
    escreverNaCelula(L, 0, 'Falcão');
    apontar(celula(L, 0));
    teclar(grade(), 'c', { ctrlKey: true });
    apontar(celula(L + 2, 0));
    teclar(grade(), 'v', { ctrlKey: true });
    expect(lido(L + 2, 0), 'o Ctrl+V não colou nada').toBe('Falcão');
    expect(lido(L, 0), 'o Ctrl+C levou o original junto').toBe('Falcão');
  },

  'Ctrl+X tira do lugar de origem, e o Ctrl+V põe no destino': () => {
    escreverNaCelula(L, 0, 'Águia');
    apontar(celula(L, 0));
    teclar(grade(), 'x', { ctrlKey: true });
    expect(lido(L, 0), 'o Ctrl+X não esvaziou a origem').toBe('');
    apontar(celula(L + 2, 0));
    teclar(grade(), 'v', { ctrlKey: true });
    expect(lido(L + 2, 0), 'o Ctrl+V não colou o que foi recortado').toBe('Águia');
  },

  'Ctrl+Z desfaz o que acabou de ser escrito, e Ctrl+Y traz de volta': () => {
    const antes = lido(L, 0);
    escreverNaCelula(L, 0, 'Tucano');
    expect(lido(L, 0)).toBe('Tucano');
    teclar(grade(), 'z', { ctrlKey: true });
    expect(lido(L, 0), 'o Ctrl+Z não desfez a escrita').toBe(antes);
    teclar(grade(), 'y', { ctrlKey: true });
    expect(lido(L, 0), 'o Ctrl+Y não refez a escrita').toBe('Tucano');
  },

  'Delete limpa a célula selecionada': () => {
    escreverNaCelula(L, 0, 'Pioneiros');
    apontar(celula(L, 0));
    teclar(grade(), 'Delete');
    expect(lido(L, 0), 'o Delete não limpou a célula').toBe('');
  },

  'a barra de fórmulas grava no Enter, e nunca ao perder o foco': () => {
    /* O que a célula trazia escrito é de cada caderno; o que se confere é que
       ela continua com isso depois do blur. Comparar com vazio funcionaria só
       no laboratório cuja célula nasce vazia — que é a trava passando por
       acaso, indistinguível de estar certa. */
    const antes = lido(L, 0);
    apontar(celula(L, 0));
    const campo = container.querySelector<HTMLInputElement>('.pl-entrada')!;
    act(() => {
      campo.focus();
      campo.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    });
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(campo, 'Semeadores');
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
    /* Sair da barra é desistir: um onBlur que grava transforma um clique
       acidental numa alteração que ninguém pediu. */
    act(() => { campo.blur(); });
    expect(lido(L, 0), 'sair da barra gravou sem ninguém mandar').toBe(antes);

    act(() => {
      campo.focus();
      campo.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(campo, 'Semeadores');
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
    teclar(campo, 'Enter');
    expect(lido(L, 0), 'o Enter da barra não gravou').toBe('Semeadores');
  },
};

/* ── A conferência ─────────────────────────────────────────────────────────── */

describe.each(Object.keys(LABORATORIOS))('%s tecla como os outros', caminho => {
  for (const [nome, gesto] of Object.entries(GESTOS)) {
    it(nome, () => {
      abrir(LABORATORIOS[caminho]);
      gesto();
    });
  }
});

describe('a lista de laboratórios sai do repositório', () => {
  /** Todo módulo de tela que importa o gancho, varrendo `src/`. */
  const quemUsaOGancho = () => {
    const achados: string[] = [];
    const varrer = (pasta: string, prefixo: string) => {
      for (const item of readdirSync(join('src', pasta), { withFileTypes: true })) {
        const relativo = prefixo ? `${prefixo}/${item.name}` : item.name;
        if (item.isDirectory()) { varrer(join(pasta, item.name), relativo); continue; }
        if (!item.name.endsWith('.tsx') && !item.name.endsWith('.ts')) continue;
        if (item.name.includes('.test.')) continue;
        if (item.name === 'gradeDoExcel.ts') continue;
        const fonte = readFileSync(join('src', pasta, item.name), 'utf8');
        if (/from '[^']*gradeDoExcel'/.test(fonte)) achados.push(relativo);
      }
    };
    varrer('.', '');
    return achados.sort();
  };

  it('nenhum laboratório de planilha fica de fora da mesa', () => {
    const usam = quemUsaOGancho();
    /* A guarda contra o vazio de sempre: uma varredura que não achasse nada
       deixaria a trava verde por não ter conferido laboratório nenhum. */
    expect(usam.length, 'a varredura não achou quem usa o gancho').toBeGreaterThanOrEqual(3);
    expect(usam).toEqual(Object.keys(LABORATORIOS).sort());
  });

  it('e cada um da mesa passa por todos os gestos', () => {
    expect(Object.keys(GESTOS).length).toBeGreaterThanOrEqual(8);
  });
});
