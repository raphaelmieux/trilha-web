// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeJavascript from './LaboratorioDeJavascript';
import { VEREDAS, licoesDaVereda, type LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de JavaScript, clicado.

  O motor é conferido rodando em `nodeSimulado.test.ts` e as soluções em
  `laboratoriosDeJavascript.test.ts`. O que só a tela pode errar é o que se
  mede aqui: o terminal mostrar o comando e a saída, a pasta depois da
  execução aparecer na lateral — o JSON gravado, o arquivo criado —, e a lista
  envelhecer quando o código muda.

  O worker não existe no jsdom, e não precisa: o runtime de mentira chama o
  mesmo `executarNode` que o worker chama, então o que roda aqui é o motor de
  verdade, só que na mesma thread.
*/
vi.mock('../labs/javascriptRuntime', async () => {
  const { executarNode } = await import('../labs/nodeSimulado');
  return {
    PRAZO_DO_NODE_MS: 5000,
    NodeNoNavegador: class {
      rodar = (pasta: Record<string, string>, principal: string) => executarNode(pasta, principal);
      encerrar = () => {};
    },
  };
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Lab = Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe003')!;
const lab = (id: string) => licoesDaVereda(vereda).find(l => l.id === id) as Lab;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Lab, aoVencer = vi.fn()) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeJavascript vereda={vereda} licao={l} userId="teste" aoVencer={aoVencer} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
  return aoVencer;
};

const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const arquivos = () => [...container.querySelectorAll('.ide-arquivo')].map(b => b.textContent?.trim());
const abrir = (nome: string) => act(() => {
  ([...container.querySelectorAll('.ide-arquivo')].find(b => b.textContent?.trim() === nome) as HTMLButtonElement).click();
});
const escrever = (texto: string) => act(() => {
  const campo = editor();
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const executar = async () => {
  await act(async () => { (container.querySelector('.js-barra button') as HTMLButtonElement).click(); });
  /* O motor espera o laço de eventos andar: dá-se a ele algumas voltas. */
  for (let i = 0; i < 20 && container.querySelector('.js-barra button')?.textContent?.includes('Rodando'); i++) {
    await act(async () => { await new Promise(r => setTimeout(r, 20)); });
  }
};
const terminal = () => container.querySelector('.js-terminal')?.textContent ?? '';
const botaoDeEntregar = () => [...document.body.querySelectorAll('button')]
  .find(b => /Entregar|Execute de novo|Faltam/.test(b.textContent ?? '')) as HTMLButtonElement | undefined;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('o laboratório de JavaScript', () => {
  it('o terminal mostra o comando e o que o programa escreveu', async () => {
    desenhar(lab('m2-lab'));
    await executar();
    expect(terminal()).toContain('node programa.js');
    expect(terminal()).toContain('Parabéns, unidade undefined');
  });

  it('mostra o erro com o arquivo e a linha', async () => {
    desenhar(lab('m1-lab'));
    escrever("const total = 1;\nconsole.log(totl);\n");
    await executar();
    expect(terminal()).toContain('programa.js:2');
    expect(terminal()).toContain('ReferenceError: totl is not defined');
  });

  it('o JSON gravado aparece na lateral como o programa o deixou', async () => {
    desenhar(lab('m8-lab'));
    expect(arquivos()).toEqual(['programa.js', 'inscritos.json']);
    abrir('inscritos.json');
    expect(editor().readOnly).toBe(true);
    expect(editor().value).not.toContain('\n');

    abrir('programa.js');
    escrever(`import { readFileSync, writeFileSync } from 'node:fs';
const l = JSON.parse(readFileSync('inscritos.json', 'utf8'));
writeFileSync('inscritos.json', JSON.stringify(l, null, 2));
writeFileSync('resumo.txt', 'feito');
`);
    await executar();
    expect(arquivos()).toEqual(['programa.js', 'inscritos.json', 'resumo.txt']);
    abrir('inscritos.json');
    expect(editor().value).toContain('\n  {');
    expect(container.textContent).toContain('está como o programa o deixou');
  });

  it('a solução certa acende tudo, e mexer depois envelhece a lista', async () => {
    const aoVencer = desenhar(lab('m4-lab'));
    escrever(`function precoDoPedido(lanches, sucos) {
  return lanches * 6 + sucos * 4;
}
const troco = (pago, total) => pago - total;
const pedidos = [['Ana', 1, 2, 20], ['Bruno', 3, 1, 50], ['Carla', 0, 1, 5]];
for (const [nome, l, s, pago] of pedidos) {
  const total = precoDoPedido(l, s);
  console.log(\`\${nome}: R$ \${total}, troco de R$ \${troco(pago, total)}\`);
}
`);
    await executar();
    expect(botaoDeEntregar()?.textContent).toContain('Entregar');

    escrever(`${editor().value}// mexi\n`);
    expect(botaoDeEntregar()?.textContent).toContain('Execute de novo');

    await executar();
    await act(async () => { botaoDeEntregar()!.click(); });
    expect(aoVencer).toHaveBeenCalled();
  });

  it('o servidor da lição chega só de leitura', () => {
    desenhar(lab('m7-lab'));
    abrir('servidor.js');
    expect(editor().readOnly).toBe(true);
    expect(editor().value).toContain('buscarInscricoes');
  });
});
