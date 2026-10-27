// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { GUIAS_DO_WORD, GuiasDoWord, GrupoDaFaixa, BotaoDaFaixa } from './word';
import { GUIAS_DO_EXCEL, GuiasDoExcel } from './excel';
import { GUIAS_DO_POWERPOINT } from './powerpoint';
import { guiasComFaixaPadrao, comandosDaFaixaPadrao } from './faixasDoOffice';

/*
  A moldura do Microsoft 365, que os três programas dividem.

  ── O que só esta trava pergunta ────────────────────────────────────────
  As travas de cada laboratório conferem que a fileira de guias está inteira.
  Isso deixou de bastar no dia em que toda guia passou a **abrir**: uma guia
  sem faixa padrão desenhada abriria um cartão vazio — pior do que a guia
  cinza de antes, porque parece que o programa não tem nada ali.

  E o jeito de abrir depende de uma coisa que nenhum compilador vê: a faixa do
  laboratório tem de vir **logo depois** da fileira de guias, porque é a regra
  de irmão vizinho da folha que a esconde enquanto se espia outra guia. Um
  laboratório que pusesse qualquer coisa entre as duas mostraria duas faixas
  empilhadas, sem erro nenhum.
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

const clicar = (el: Element | null | undefined) => {
  expect(el, 'não achei o que clicar').toBeTruthy();
  act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const guia = (nome: string) =>
  [...container.querySelectorAll('[role="tab"]')].find(g => g.textContent?.trim() === nome);

describe('toda guia tem a faixa do programa de verdade', () => {
  const PROGRAMAS = [
    { app: 'word' as const, guias: GUIAS_DO_WORD as readonly string[] },
    { app: 'excel' as const, guias: GUIAS_DO_EXCEL as readonly string[] },
    { app: 'powerpoint' as const, guias: GUIAS_DO_POWERPOINT.filter(g => g !== 'Arquivo') as readonly string[] },
    { app: 'access' as const, guias: ['Página Inicial', 'Criar', 'Dados Externos', 'Ferramentas de Banco de Dados', 'Ajuda'] as readonly string[] },
  ];

  for (const { app, guias } of PROGRAMAS) {
    it(`${app}: nenhuma guia abre um cartão vazio`, () => {
      expect(guias.length, 'a lista de guias esvaziou').toBeGreaterThan(4);
      const desenhadas = guiasComFaixaPadrao(app);
      for (const g of guias) {
        expect(desenhadas, `a guia ${g} não tem faixa padrão`).toContain(g);
        expect(comandosDaFaixaPadrao(app, g).length, `a faixa de ${g} não tem comando nenhum`).toBeGreaterThan(2);
      }
    });
  }

  /* Na faixa em português, Negrito é N e Sublinhado é S. Um B de "bold"
     mandaria procurar uma letra que o computador do clube não mostra. */
  it('negrito, itálico e sublinhado têm os nomes e os atalhos do Office em português', () => {
    const fonte = comandosDaFaixaPadrao('word', 'Início');
    expect(fonte).toContain('Negrito (Ctrl+N)');
    expect(fonte).toContain('Itálico (Ctrl+I)');
    expect(fonte).toContain('Sublinhado (Ctrl+S)');
  });
});

describe('espiar uma guia que o laboratório não usa', () => {
  const desenhar = () => {
    act(() => root.render(
      <>
        <GuiasDoWord atual="Início" usaveis={['Início']} aoTrocar={() => undefined} aoAvisar={() => undefined} />
        <div className="wd-faixa">
          <GrupoDaFaixa nome="Fonte">
            <BotaoDaFaixa dica="Negrito do exercício" aoClicar={() => undefined}>N</BotaoDaFaixa>
          </GrupoDaFaixa>
        </div>
      </>,
    ));
  };

  it('abre a faixa padrão logo antes da faixa do laboratório, que a folha esconde', () => {
    desenhar();
    clicar(guia('Layout'));
    const padrao = container.querySelector('.of-faixa-padrao');
    expect(padrao, 'Layout não abriu faixa nenhuma').not.toBeNull();
    expect(padrao!.nextElementSibling?.classList.contains('wd-faixa'),
      'a faixa do laboratório não é a irmã seguinte da padrão, e a folha não a esconde').toBe(true);
    expect(guia('Layout')?.getAttribute('aria-selected')).toBe('true');
    expect(padrao!.textContent).toContain('Margens');
  });

  it('voltar à guia do laboratório devolve a faixa dele', () => {
    desenhar();
    clicar(guia('Layout'));
    clicar(guia('Início'));
    expect(container.querySelector('.of-faixa-padrao')).toBeNull();
    expect(guia('Início')?.getAttribute('aria-selected')).toBe('true');
  });

  it('o botão da faixa padrão avisa, e diz de que programa', () => {
    const recados: string[] = [];
    act(() => root.render(
      <>
        <GuiasDoExcel atual="Página Inicial" usaveis={['Página Inicial']} aoTrocar={() => undefined}
          aoAvisar={r => recados.push(r)} />
        <div className="pl-faixa" />
      </>,
    ));
    clicar(guia('Dados'));
    clicar(container.querySelector('.of-faixa-padrao [title="Remover Duplicatas"]'));
    expect(recados[recados.length - 1]).toMatch(/^Remover Duplicatas existe no Excel de verdade/);
  });
});

describe('a faixa do laboratório é completada com os grupos que faltam', () => {
  it('põe os grupos do programa que o exercício não desenhou, sem repetir os dele', () => {
    act(() => root.render(
      <>
        <GuiasDoWord atual="Início" usaveis={['Início']} aoTrocar={() => undefined} aoAvisar={() => undefined} />
        <div className="wd-faixa">
          <GrupoDaFaixa nome="Fonte">
            <BotaoDaFaixa dica="Negrito (Ctrl+N)" aoClicar={() => undefined}>N</BotaoDaFaixa>
          </GrupoDaFaixa>
          <GrupoDaFaixa nome="Editando">
            <BotaoDaFaixa dica="Localizar" aoClicar={() => undefined}>L</BotaoDaFaixa>
          </GrupoDaFaixa>
        </div>
      </>,
    ));
    const faixa = container.querySelector('.wd-faixa')!;
    const nomes = [...faixa.querySelectorAll('.wd-grupo-nome, .of-grupo-nome')].map(n => n.textContent?.trim());
    expect(nomes).toContain('Área de Transferência');
    expect(nomes).toContain('Estilos');
    /* "Editando" é o nome que o laboratório deu ao grupo Edição: completar
       com o do programa daria dois grupos para o mesmo lugar. */
    expect(nomes.filter(n => n === 'Edição' || n === 'Editando')).toHaveLength(1);
    expect(nomes.filter(n => n === 'Fonte')).toHaveLength(1);
    expect(faixa.querySelectorAll('[title="Negrito (Ctrl+N)"]')).toHaveLength(1);
  });
});

describe('a faixa do laboratório vem logo depois da fileira de guias', () => {
  /** Todo arquivo de tela que desenha uma das três fileiras de guias. */
  function fontes(): { caminho: string; texto: string }[] {
    const achados: { caminho: string; texto: string }[] = [];
    const varrer = (pasta: string) => {
      for (const item of readdirSync(pasta, { withFileTypes: true })) {
        const caminho = join(pasta, item.name);
        if (item.isDirectory()) { varrer(caminho); continue; }
        if (!item.name.endsWith('.tsx') || item.name.includes('.test.')) continue;
        const texto = readFileSync(caminho, 'utf8');
        if (/<Guias(DoWord|DoExcel|DoPowerPoint|DoOffice)\b/.test(texto) && !/(office|word|excel|powerpoint)\.tsx$/.test(caminho)) achados.push({ caminho, texto });
      }
    };
    varrer('src');
    return achados;
  }

  const ARQUIVOS = fontes();

  it('acha os laboratórios do Office', () => {
    /* A guarda contra o vazio de sempre: um varredor que não achasse nada
       deixaria a trava verde por não ter conferido coisa nenhuma. */
    expect(ARQUIVOS.length).toBeGreaterThan(15);
  });

  for (const { caminho, texto } of ARQUIVOS) {
    it(`${caminho}: a faixa é a irmã seguinte da fileira`, () => {
      for (const m of texto.matchAll(/<Guias(DoWord|DoExcel|DoPowerPoint|DoOffice)\b/g)) {
        const fim = texto.indexOf('/>', m.index!) + 2;
        const depois = texto.slice(fim).replace(/^\s*(\{\/\*[\s\S]*?\*\/\}\s*)*/, '');
        /* A faixa pode depender da guia — `{guia === 'Início' && (<div ...` —, e
           continua sendo a irmã seguinte quando aparece. */
        expect(depois, `o que vem depois de <Guias${m[1]}> não é a faixa`)
          .toMatch(/^(\{[^{}]*?(&&|\?)\s*\(\s*)?<div className="(wd|pl|pp|ac)-faixa"/);
      }
    });
  }
});
