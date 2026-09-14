// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDePython from './LaboratorioDePython';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  O laboratório de Python com mais de um arquivo na pasta.

  ── O que muda quando o programa deixa de ser um arquivo ─────────────────
  Até a CC002 o laboratório era um editor e um botão. A CC004 põe outros
  arquivos ao lado: o dado que a lição entrega para ser lido, e — no programa
  em partes do requisito 8 — o segundo arquivo-fonte, que a pessoa escreve.

  Três coisas passam a poder errar, e as três erram calado.

  1. O dado da lição chegar editável. A pessoa conserta o espaço sobrando no
     arquivo que a secretaria exportou, o programa passa, e o que foi medido
     foi um exercício que ela reescreveu.

  2. O arquivo aberto não ser o arquivo editado. Com dois no mesmo editor, é o
     erro que não tem sintoma: escreve-se no lugar certo da tela e no arquivo
     errado do disco.

  3. E o principal: editar o segundo arquivo-fonte **não** envelhecer a lista.
     `velha` existe para impedir que alguém acerte, mexa numa linha e entregue
     o que não rodou. Com dois arquivos, olhar só o principal devolve esse
     buraco inteiro — conserta-se o `chamada.py`, a lista continua verde do que
     rodou antes, e o botão Entregar continua aceso.

  O 3 ainda não tem laboratório que o use: o programa em partes vem depois. É
  justamente por isso que ele é testado agora — trava escrita junto do código
  pega o defeito; escrita junto do primeiro uso, chega depois dele.
*/

/*
  O Python de mentira.

  O de verdade abre um Worker, que o jsdom não tem — e o que se quer medir aqui
  não é o Pyodide, que `projetoDePython.test.ts` já confere rodando. É o que a
  tela faz com o resultado.
*/
vi.mock('../labs/pythonRuntime', () => ({
  PRAZO_MS: 8000,
  PRAZO_DE_CARGA_MS: 30000,
  Python: class {
    analisar = async () => ({ achados: {}, erro: null, esboco: [], chamadas: [] });
    rodar = async () => ({ saida: 'rodou', erro: null, semFim: false });
    encerrar = () => {};
  },
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const vereda = { id: 'cc004', code: 'CC004', name: 'Python, Avançado' } as Vereda;

const licao = (extras: { nome: string; modelo: string; editavel?: boolean }[]) => ({
  id: 'teste-lab',
  tipo: 'laboratorio',
  linguagem: 'python',
  titulo: 'O programa em partes',
  resumo: 'Dois arquivos.',
  arquivo: 'programa.py',
  projeto: 'clube',
  modelo: '# escreva aqui\n',
  arquivosDoProjeto: extras,
  /* Uma verificação que a árvore responde: com o Python de mentira ela nunca
     passa, e o botão fica desabilitado — o que se mede aqui é o texto dele. */
  verificacoes: ['abreParaLer'],
}) as Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;

let container: HTMLDivElement;
let root: Root;

const desenhar = (l: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>) => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDePython vereda={vereda} licao={l} userId="teste"
          aoVencer={() => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
};

const editor = () => container.querySelector('textarea') as HTMLTextAreaElement;
const arquivos = () => [...container.querySelectorAll('.ide-arquivo')].map(b => b.textContent?.trim());
const abrir = (nome: string) => act(() => {
  const alvo = [...container.querySelectorAll('.ide-arquivo')]
    .find(b => b.textContent?.trim() === nome) as HTMLButtonElement;
  alvo.click();
});
const escrever = (texto: string) => act(() => {
  const campo = editor();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
  setter.call(campo, texto);
  campo.dispatchEvent(new Event('input', { bubbles: true }));
});
const executar = async () => {
  await act(async () => {
    (container.querySelector('.py-barra button') as HTMLButtonElement).click();
  });
};
/* O botão de entregar é o primeiro das ações, e o texto dele é o estado. */
const entregar = () => [...document.body.querySelectorAll('button')]
  .find(b => /Entregar|Execute de novo|Faltam/.test(b.textContent ?? ''))?.textContent?.trim();

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

describe('o laboratório de Python com vários arquivos', () => {
  it('lista na lateral o principal e os da lição, nessa ordem', () => {
    desenhar(licao([
      { nome: 'unidades.txt', modelo: 'Falcão\n' },
      { nome: 'chamada.py', modelo: 'def contar():\n    pass\n', editavel: true },
    ]));
    expect(arquivos()).toEqual(['programa.py', 'unidades.txt', 'chamada.py']);
  });

  /* Com um arquivo só a lateral não aparece: um item nela não informa nada, e
     ocupa espaço de editor — que no celular é o que falta. */
  it('não desenha lateral nenhuma quando o programa é um arquivo só', () => {
    desenhar(licao([]));
    expect(arquivos()).toEqual([]);
    expect(editor().readOnly).toBe(false);
  });

  it('entrega o dado da lição só de leitura, e o código editável', () => {
    desenhar(licao([
      { nome: 'unidades.txt', modelo: 'Falcão\n' },
      { nome: 'chamada.py', modelo: 'def contar():\n    pass\n', editavel: true },
    ]));

    abrir('unidades.txt');
    expect(editor().readOnly, 'o dado que a lição entregou aceitou escrita').toBe(true);
    expect(editor().value).toBe('Falcão\n');

    abrir('chamada.py');
    expect(editor().readOnly).toBe(false);
  });

  /* O que se escreve vai para o arquivo que está aberto, e não para o
     principal — e trocar de arquivo e voltar devolve o que foi escrito. */
  it('escreve no arquivo que está aberto, e guarda cada um', () => {
    desenhar(licao([{ nome: 'chamada.py', modelo: 'inicial\n', editavel: true }]));

    abrir('chamada.py');
    escrever('def contar():\n    return 3\n');

    abrir('programa.py');
    expect(editor().value, 'o texto caiu no arquivo principal').toBe('# escreva aqui\n');

    abrir('chamada.py');
    expect(editor().value).toBe('def contar():\n    return 3\n');
  });

  /*
    E o de número 3, que é o que não tem sintoma.
  */
  it('envelhece a lista quando o segundo arquivo-fonte muda depois de rodar', async () => {
    desenhar(licao([{ nome: 'chamada.py', modelo: 'def contar():\n    return 1\n', editavel: true }]));

    await executar();
    expect(entregar(), 'antes de mexer em nada a lista já estava velha').not.toBe('Execute de novo');

    abrir('chamada.py');
    escrever('def contar():\n    return 99\n');

    expect(
      entregar(),
      'editar o arquivo importado não envelheceu o resultado: a lista mostra o que rodou antes',
    ).toBe('Execute de novo');
  });

  /* E voltar ao texto que foi rodado desfaz o aviso: dizer "execute de novo"
     para um código idêntico ao que rodou é mandar refazer o que está feito. */
  it('para de avisar quando o texto volta a ser o que rodou', async () => {
    desenhar(licao([{ nome: 'chamada.py', modelo: 'def contar():\n    return 1\n', editavel: true }]));

    await executar();
    abrir('chamada.py');
    escrever('mexido\n');
    expect(entregar()).toBe('Execute de novo');

    escrever('def contar():\n    return 1\n');
    expect(entregar()).not.toBe('Execute de novo');
  });
});
