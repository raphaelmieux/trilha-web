// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CSS_WORD, GUIAS_DO_WORD } from './word';
import InsercaoTextoLab from './InsercaoTextoLab';
import FormatacaoTextoLab from './FormatacaoTextoLab';
import EstilosTextoLab from './EstilosTextoLab';

/*
  O que a janela do Word não pode perder.

  Estas travas nasceram de um defeito que chegou ao ar: o laboratório de
  inserção da AP043 desenhou a própria moldura em vez de usar a do laboratório
  de formatação da AP042, e o resultado foram dois "Words" diferentes na mesma
  trilha — um com onze guias, régua e rodapé, outro com três guias, nenhuma
  régua e uma folha que não era uma folha.

  A folha era o pior, e é o exemplo perfeito da armadilha do CSS que este
  projeto já conhecia: o `.wd-pagina` calcula largura e margem a partir de
  `--largura-cm` e `--margem-cm`, e o laboratório nunca passou nenhuma das
  duas. Um calc() sobre variável vazia é inválido, e o navegador descarta a
  declaração inteira sem dizer nada — a largura caiu em `auto` e o padding em
  zero. Na tela: duas faixas brancas da largura da janela, sem margem e sem
  intervalo entre elas, e o texto do relatório colado na borda do papel.

  Nada disso quebra a compilação, nada disso aparece num teste de tipo, e o
  laboratório continuava passando em todas as suas metas — porque as metas
  medem o documento, e não a folha em que ele está desenhado.
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
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const desenhar = (elemento: React.ReactElement) => {
  act(() => { root.render(<MemoryRouter>{elemento}</MemoryRouter>); });
};

const LABORATORIOS = [
  {
    nome: 'inserção (AP043)',
    elemento: (
      <InsercaoTextoLab
        specialtyCode="AP043" lessonCode="AP043.4-L2"
        lessonTitle="Montando o relatório do acampamento"
        requirementCodes={['AP043-4.1']}
        userId="00000000-0000-0000-0000-000000000000" />
    ),
  },
  {
    nome: 'formatação (AP042)',
    elemento: (
      <FormatacaoTextoLab
        specialtyCode="AP042" lessonCode="AP042.2-L2"
        lessonTitle="Formatando um documento inteiro"
        requirementCodes={['AP042-3.1']}
        userId="00000000-0000-0000-0000-000000000000" />
    ),
  },
  {
    nome: 'estilos (AP044)',
    elemento: (
      <EstilosTextoLab
        specialtyCode="AP044" lessonCode="AP044.4-L2"
        lessonTitle="Formatando o boletim do clube"
        requirementCodes={['AP044-7.1']}
        userId="00000000-0000-0000-0000-000000000000" />
    ),
  },
];

describe('a folha tem medida', () => {
  /*
    Lê o `style` do elemento, e não o valor computado: o jsdom não resolve
    `calc()` sobre variável herdada, então perguntar a largura devolveria
    string vazia tanto na folha certa quanto na quebrada. O que se confere é
    que as medidas em centímetros *chegaram* — que é exatamente o que faltava.
  */
  for (const { nome, elemento } of LABORATORIOS) {
    it(`o laboratório de ${nome} passa as medidas da folha para o CSS`, () => {
      desenhar(elemento);
      const folha = container.querySelector('.wd-pagina');
      expect(folha, 'nenhuma folha desenhada').not.toBeNull();

      /* A medida pode vir na própria folha ou em qualquer ancestral, porque
         variável de CSS herda — é assim que o canvas as distribui às duas
         páginas de uma vez. */
      const temMedida = (prop: string) => {
        let e: HTMLElement | null = folha as HTMLElement;
        while (e) {
          if (e.style.getPropertyValue(prop).trim() !== '') return true;
          e = e.parentElement;
        }
        return false;
      };

      for (const prop of ['--largura-cm', '--altura-cm', '--margem-cm']) {
        expect(temMedida(prop), `a folha não recebeu ${prop}`).toBe(true);
      }
    });
  }

  it('o CSS da folha tem valor de reserva em toda medida', () => {
    /* A trava acima cobra o laboratório; esta cobra o CSS. Mesmo que alguém
       esqueça de passar a medida, a declaração não pode ser descartada em
       silêncio — o defeito precisa aparecer como folha do tamanho errado, e
       não como faixa branca sem margem. */
    const regra = CSS_WORD.slice(CSS_WORD.indexOf('.wd-pagina {'));
    const medidas = regra.slice(0, regra.indexOf('}'));
    for (const prop of ['--largura-cm', '--altura-cm', '--margem-cm']) {
      expect(medidas, `${prop} sem valor de reserva no .wd-pagina`)
        .toMatch(new RegExp(`var\\(${prop},\\s*[\\d.]+\\)`));
    }
  });

  it('a folha e a régua leem a mesma largura', () => {
    /* Régua e folha desalinhadas dizem que a margem está num lugar em que ela
       não está — e a régua existe justamente para mostrar onde ela está. */
    const pagina = CSS_WORD.slice(CSS_WORD.indexOf('.wd-pagina {'));
    const barra = CSS_WORD.slice(CSS_WORD.indexOf('.wd-regua-barra {'));
    const larguraDa = (t: string) => t.slice(0, t.indexOf('}')).match(/width:\s*([^;]+);/)?.[1];
    expect(larguraDa(barra)).toBe(larguraDa(pagina));
  });
});

describe('a moldura é uma só', () => {
  for (const { nome, elemento } of LABORATORIOS) {
    it(`o laboratório de ${nome} mostra a fileira inteira de guias`, () => {
      desenhar(elemento);
      const escritas = [...container.querySelectorAll('.wd-guia')].map(g => g.textContent?.trim());
      expect(escritas, 'a guia Arquivo sumiu da fileira').toContain('Arquivo');
      for (const guia of GUIAS_DO_WORD) {
        expect(escritas, `a guia ${guia} sumiu da fileira`).toContain(guia);
      }
    });

    it(`o laboratório de ${nome} tem régua e barra de status`, () => {
      desenhar(elemento);
      expect(container.querySelector('.wd-regua'), 'janela sem régua').not.toBeNull();
      expect(container.querySelector('.wd-status'), 'janela sem barra de status').not.toBeNull();
    });
  }
});
