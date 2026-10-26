// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeBanco from './LaboratorioDeBanco';
import { LICOES_DA_CC005, metasDa, type LicaoDaCc005 } from '../labs/metasDaCc005';
import { REFERENCIAS_DA_CC005 } from '../labs/referenciasDaCc005';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As oito lições de banco da CC005, levadas até o fim pelos gestos que o
  desbravador faria: digitar o arquivo, apertar Executar, e no módulo 6
  montar o diagrama pelas caixas de propriedade.

  `metasDaCc005.test.ts` prova que cada meta fecha chamando o motor; esta
  prova que a janela chama o motor, e que o que ela mostra é o que ele
  devolveu.

  O Python daqui é o de verdade, e não um de mentira: o worker não existe no
  jsdom, então a classe é trocada por uma que roda o mesmo programa no Pyodide
  do Node. Um Python de mentira mediria a tela contra uma resposta que o
  SQLite nunca deu.
*/

vi.mock('../labs/pythonRuntime', async () => {
  const { carregarPyodide } = await import('../labs/pyodideDeTeste');
  const { programaDoSql } = await import('../labs/sqlite');
  const py = await carregarPyodide();
  return {
    PRAZO_MS: 8000,
    PRAZO_DE_CARGA_MS: 30000,
    Python: class {
      sql = async (semente: string, script: string) =>
        ({ ok: true, execucao: JSON.parse(py.runPython(programaDoSql(semente, script)) as string) });
      encerrar = () => {};
    },
  };
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function montar(qual: LicaoDaCc005) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'banco', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'banco' }>;
  await act(async () => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeBanco vereda={{ code: 'CC005' } as Vereda} licao={licao} userId={`teste-${qual}-${Math.random()}`}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = async (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  await act(async () => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};
const marcar = (caixa: Element | null | undefined, nome: string) => {
  expect(caixa, `não achei a caixa "${nome}"`).toBeTruthy();
  act(() => { (caixa as HTMLInputElement).click(); });
};
const botao = (texto: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.trim().startsWith(texto));
const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const concluir = () => [...container.querySelectorAll('button')].find(b => b.textContent?.includes('Concluir a lição'));

const SQL = (Object.keys(LICOES_DA_CC005) as LicaoDaCc005[]).filter(l => LICOES_DA_CC005[l].programa === 'sql');

describe('as lições de banco da CC005, clicando', () => {
  it.each(SQL)('%s: digitar a referência e executar fecha a lista', async qual => {
    await montar(qual);
    const campo = container.querySelector('.bd textarea');
    escrever(campo, REFERENCIAS_DA_CC005[qual as Exclude<LicaoDaCc005, 'diagrama'>], 'o arquivo .sql');
    expect(concluir()).toBeFalsy();
    await clicar(container.querySelector('.bd-executar'), 'Executar');
    expect(concluir(), container.querySelector('.bd-painel-corpo')?.textContent ?? '').toBeTruthy();
    expect((concluir() as HTMLButtonElement).disabled).toBe(false);
  }, 30000);

  it('mudar o arquivo depois de executar envelhece a lista', async () => {
    await montar('tabelas');
    const campo = container.querySelector('.bd textarea');
    escrever(campo, REFERENCIAS_DA_CC005.tabelas, 'o arquivo .sql');
    await clicar(container.querySelector('.bd-executar'), 'Executar');
    expect(concluir()).toBeTruthy();
    escrever(campo, `${REFERENCIAS_DA_CC005.tabelas}\n-- mais uma linha`, 'o arquivo .sql');
    expect(concluir()).toBeFalsy();
    expect(container.textContent).toContain('O arquivo mudou depois da última execução');
  }, 30000);

  it('o erro aparece com a linha e a mensagem do banco, e a execução para ali', async () => {
    await montar('tabelas');
    escrever(container.querySelector('.bd textarea'), 'SELECT * FROM unidades;\nSELECT nme FROM membros;\nSELECT 1;', 'o arquivo .sql');
    await clicar(container.querySelector('.bd-executar'), 'Executar');
    const msgs = container.querySelector('.bd-mensagens')!.textContent!;
    expect(msgs).toContain('Linha 2');
    expect(msgs).toContain('no such column: nme');
    expect(msgs).toContain('A execução parou na linha 2');
    expect(container.querySelectorAll('.bd-msg').length).toBe(3);
  }, 30000);

  it('a lateral mostra as tabelas com a chave e a estrangeira, antes de executar', async () => {
    await montar('juncao');
    await clicar(porRotulo('Mostrar as colunas de membros'), 'a seta de membros');
    const lateral = container.querySelector('.bd-lateral')!;
    expect(lateral.querySelector('[aria-label="chave primária"]')).toBeTruthy();
    expect(lateral.querySelector('[aria-label="chave estrangeira"]')).toBeTruthy();
    expect(lateral.textContent).toContain('→ unidades.id');
    await clicar(botao('unidades'), 'a tabela de unidades');
    expect(container.querySelectorAll('.bd-grade tbody tr').length).toBe(6);
  }, 30000);

  it('o apoio do módulo 2 abre só de leitura, e não se executa', async () => {
    await montar('consultas');
    await clicar([...container.querySelectorAll('.bd-guia')].find(b => b.textContent === 'procura.py'), 'a guia procura.py');
    expect((container.querySelector('.bd textarea') as HTMLTextAreaElement).readOnly).toBe(true);
    expect((container.querySelector('.bd-executar') as HTMLButtonElement).disabled).toBe(true);
  }, 30000);
});

describe('o diagrama do módulo 6, clicando', () => {
  const ultimoFieldset = () => [...container.querySelectorAll('.md-coluna-form')].slice(-1)[0];
  const coluna = (nome: string, tipo: string, aponta?: string) => {
    act(() => { botao('Coluna')!.click(); });
    const f = ultimoFieldset();
    escrever(f.querySelector('input[aria-label="Nome da coluna"]'), nome, 'nome da coluna');
    const [tipoSel, refSel] = [...f.querySelectorAll('select')];
    escrever(tipoSel, tipo, 'tipo');
    if (aponta) {
      const valor = [...refSel.querySelectorAll('option')].find(o => o.textContent === `aponta para ${aponta}`)!.value;
      escrever(refSel, valor, 'aponta para');
    }
  };
  const selecionarTabela = (nome: string) =>
    act(() => { [...container.querySelectorAll('.md-item')].find(b => b.textContent?.trim() === nome)!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

  it('montar o diagrama pelas propriedades fecha a lista', async () => {
    await montar('diagrama');
    expect(concluir()).toBeFalsy();

    selecionarTabela('membros');
    const doNome = [...container.querySelectorAll('.md-coluna-form')].find(f =>
      (f.querySelector('input[aria-label="Nome da coluna"]') as HTMLInputElement).value === 'nome')!;
    marcar(doNome.querySelector('input[type="checkbox"]'), 'chave do nome');
    coluna('id', 'INTEGER');
    marcar(ultimoFieldset().querySelector('input[type="checkbox"]'), 'chave do id');

    act(() => { botao('Nova tabela')!.click(); });
    escrever(container.querySelector('.md-campo input'), 'especialidades', 'nome da tabela');
    coluna('codigo', 'TEXT');
    coluna('nome', 'TEXT');

    act(() => { botao('Nova tabela')!.click(); });
    escrever(container.querySelector('.md-campo input'), 'conquistas', 'nome da tabela');
    coluna('membro_id', 'INTEGER', 'membros');
    coluna('especialidade_id', 'INTEGER', 'especialidades');
    coluna('data', 'DATE');

    for (const de of ['membros', 'especialidades']) {
      selecionarTabela(de);
      act(() => { botao('Nova ligação')!.click(); });
      const [, , para] = [...container.querySelectorAll('.md-campo select')];
      const valor = [...para.querySelectorAll('option')].find(o => o.textContent === 'conquistas')!.value;
      escrever(para, valor, 'para');
    }

    /* As caixas desenham a chave e o pé de galinha do que se montou. */
    expect(container.querySelectorAll('.md-caixa').length).toBe(4);
    expect(container.querySelectorAll('.md-linhas polyline').length).toBe(3);
    expect(concluir(), [...container.querySelectorAll('.md-item')].map(b => b.textContent).join(' / ')).toBeTruthy();
  }, 30000);

  it('a ligação muitos-para-muitos se desenha, e a lista não fecha', async () => {
    await montar('diagrama');
    selecionarTabela('membros');
    act(() => { botao('Nova ligação')!.click(); });
    const [, card] = [...container.querySelectorAll('.md-campo select')];
    escrever(card, 'N:N', 'cardinalidade');
    /* Muitos dos dois lados: dois pés de galinha, mais o da ligação que já estava. */
    expect(container.querySelectorAll('.md-linhas polyline').length).toBe(3);
    expect(concluir()).toBeFalsy();
  }, 30000);
});
