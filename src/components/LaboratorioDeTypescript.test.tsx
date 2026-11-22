// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeTypescript, { type AmbienteDoTs } from './LaboratorioDeTypescript';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { LICOES_DA_CC_FE005, type LicaoDaCcFe005 } from '../labs/metasDaCcFe005';
import { CORRECAO_DO_CAMPORI, REFERENCIAS_DA_CC_FE005, type Referencia } from '../labs/referenciasDaCcFe005';
import { compilarNoNode, ts } from '../labs/compiladorNoNode';
import { analisarTs } from '../labs/analiseTs';
import { executarNode } from '../labs/nodeSimulado';

/*
  O laboratório de TypeScript, clicado.

  O motor é conferido em `metasDaCcFe005.test.ts`, com o compilador de
  verdade. O que só a tela pode errar é o caminho até lá: o editor escrever
  no arquivo aberto, o terminal rodar o que se digita e pôr na pasta o que o
  tsc gerou, o painel de Problemas acompanhar a digitação, e o botão Executar
  digitar o comando em vez de esconder o que roda.

  O worker não existe no jsdom: a tela recebe um ambiente com o mesmo
  `compilarPasta` e o mesmo Node simulado, na mesma thread.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const AMBIENTE: AmbienteDoTs = {
  compilar: async pasta => ({
    compilacao: await compilarNoNode(pasta),
    analise: Object.fromEntries(Object.entries(pasta)
      .filter(([n]) => n.endsWith('.ts') && !n.endsWith('.d.ts'))
      .map(([n, t]) => [n, analisarTs(ts, t, n)])),
    versao: ts.version,
  }),
  rodar: (p, m) => executarNode(p, m),
};

type Lab = Extract<ReturnType<typeof licoesDaVereda>[number], { tipo: 'typescript' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe005')!;
const labs = licoesDaVereda(vereda).filter((l): l is Lab => l.tipo === 'typescript');
const lab = (licao: LicaoDaCcFe005) => labs.find(l => l.licao === licao)!;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeTypescript vereda={vereda} licao={l} userId="teste" aoVencer={aoVencer} aoSair={() => {}} ambiente={AMBIENTE} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const assentar = async (ms = 450) => {
  await act(async () => { await new Promise(r => setTimeout(r, ms)); });
};
const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const abrir = (nome: string) => act(() => {
  ([...container.querySelectorAll('.ide-arquivo')].find(b => b.querySelector('.truncate')?.textContent === nome) as HTMLButtonElement).click();
});
const escrever = (texto: string) => act(() => {
  const campo = editor();
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const digitar = async (comando: string) => {
  const campo = container.querySelector('input[aria-label="Comando do terminal"]') as HTMLInputElement;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(campo, comando);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => { campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  for (let i = 0; i < 100 && (container.querySelector('input[aria-label="Comando do terminal"]') as HTMLInputElement).disabled; i++) {
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  }
};
const terminal = () => container.querySelector('.ts-terminal')?.textContent ?? '';
const problemas = () => container.querySelector('[aria-label="Problemas"]')?.textContent ?? '';
const entregar = () => [...document.body.querySelectorAll('button')]
  .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? '')) as HTMLButtonElement | undefined;
const arquivos = () => [...container.querySelectorAll('.ide-arquivo .truncate')].map(b => b.textContent);

async function aplicar(licao: LicaoDaCcFe005, ref: Referencia) {
  for (const c of ref.antes) await digitar(c);
  const def = LICOES_DA_CC_FE005[licao];
  for (const [nome, texto] of Object.entries(ref.arquivos)) {
    if (def.arquivos[nome] === texto) continue;
    abrir(nome);
    escrever(texto);
  }
  await assentar();
  for (const c of ref.depois) await digitar(c);
  await assentar();
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

describe('o laboratório de TypeScript', () => {
  it('são oito laboratórios na vereda, um por lição do motor', () => {
    expect(labs.map(l => l.licao).sort()).toEqual(Object.keys(LICOES_DA_CC_FE005).sort());
  });

  it('o painel de Problemas mostra o que o compilador aponta, antes de qualquer comando', async () => {
    desenhar(lab('anotar'));
    expect(problemas()).toContain('lendo o projeto');
    await assentar();
    expect(problemas()).toContain("O parâmetro 'nome' implicitamente tem um tipo 'any'.");
    expect(problemas()).toContain('programa.ts [');
    expect(entregar()?.textContent).toMatch(/Faltam 4/);
  }, 30000);

  it('Executar digita o comando, e o .js gerado aparece na lateral só de leitura', async () => {
    desenhar(lab('anotar'));
    await act(async () => {
      ([...container.querySelectorAll('.ts-barra button')].find(b => /Executar/.test(b.textContent ?? '')) as HTMLButtonElement).click();
    });
    for (let i = 0; i < 100 && /Rodando/.test(container.querySelector('.ts-barra')?.textContent ?? ''); i++) await assentar(20);
    expect(terminal()).toContain('$ tsc && node programa.js');
    expect(terminal()).toContain('error TS7006');
    expect(arquivos()).toContain('programa.js');
    abrir('programa.js');
    expect(editor().readOnly).toBe(true);
    expect(container.textContent).toContain('Gerado pelo tsc');
  }, 30000);

  const comuns = (Object.keys(LICOES_DA_CC_FE005) as LicaoDaCcFe005[]).filter(l => l !== 'projeto');
  it.each(comuns)('%s se vence escrevendo e rodando no terminal', async licao => {
    const aoVencer = desenhar(lab(licao));
    await assentar();
    await aplicar(licao, REFERENCIAS_DA_CC_FE005[licao]);
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
    await act(async () => { entregar()!.click(); });
    expect(aoVencer).toHaveBeenCalledTimes(1);
  }, 60000);

  it('o campori se vence criando o projeto pelo terminal e vendo o erro segurar a saída', async () => {
    const aoVencer = desenhar(lab('projeto'));
    await assentar();
    expect(problemas()).toContain('não tem tsconfig.json');
    await digitar('tsc');
    expect(terminal()).toContain('tsc: o Compilador TypeScript');
    await aplicar('projeto', REFERENCIAS_DA_CC_FE005.projeto);
    expect(arquivos()).toContain('tsconfig.json');
    expect(arquivos()).not.toContain('dist/programa.js');
    expect(entregar()?.textContent).toMatch(/Faltam 1/);
    await aplicar('projeto', CORRECAO_DO_CAMPORI);
    expect(arquivos()).toContain('dist/programa.js');
    expect(terminal()).toContain('Vagas restantes: 9');
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
    await act(async () => { entregar()!.click(); });
    expect(aoVencer).toHaveBeenCalledTimes(1);
  }, 60000);

  it('mexer no .ts depois de rodar envelhece a saída', async () => {
    desenhar(lab('interface'));
    await assentar();
    await aplicar('interface', REFERENCIAS_DA_CC_FE005.interface);
    expect(entregar()?.textContent).toMatch(/Concluir a lição/);
    abrir('programa.ts');
    escrever(`${REFERENCIAS_DA_CC_FE005.interface.arquivos['programa.ts']}// uma linha a mais\n`);
    await assentar();
    expect(entregar()?.textContent).toMatch(/Faltam 1/);
  }, 60000);

  it('o tsconfig das lições configuradas abre só de leitura', async () => {
    desenhar(lab('generico'));
    abrir('tsconfig.json');
    expect(editor().readOnly).toBe(true);
  });
});
