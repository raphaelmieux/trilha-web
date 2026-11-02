// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoProjetoDePrograma from './LaboratorioDoProjetoDePrograma';
import LaboratorioDeTerminal from './LaboratorioDeTerminal';
import { metasDaCc006, type LicaoDaCc006 } from '../labs/metasDaCc006';
import { MODULOS_DO_PROJETO_DE_PROGRAMA } from '../curriculum/projetoDePrograma';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  A CC006 levada até o fim pelos cliques e pelas teclas que o desbravador
  daria: a proposta mandada ao examinador antes de programar, o diário com
  três problemas, o roteiro dos quinze minutos — e, no terminal, as quatro
  mudanças guardadas uma a uma e o README escrito no editor e versionado.

  `metasDaCc006.test.ts` e `repositorioDoAlmoxarifado.test.ts` provam que cada
  meta pode ficar verde chamando o motor; esta prova que as telas chamam — e
  que o terminal abre no computador do almoxarifado, e não no do clube.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* O jsdom não rola nada, e o terminal rola até a última linha a cada saída. */
Element.prototype.scrollIntoView ??= function scrollIntoView() {};

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC006' } as Vereda;

function montarPlataforma(qual: LicaoDaCc006) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'projeto-de-programa', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDaCc006(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'projeto-de-programa' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoProjetoDePrograma vereda={VEREDA} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

function montarTerminal(id: string) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = MODULOS_DO_PROJETO_DE_PROGRAMA.flatMap(m => m.licoes).find(l => l.id === id) as Extract<LicaoDeVereda, { tipo: 'terminal' }>;
  expect(licao.tipo).toBe('terminal');
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeTerminal vereda={VEREDA} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
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
const tecla = (alvo: Element | null | undefined, key: string) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
};
const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porId = (id: string) => container.querySelector(`#${id}`);
const botao = (comeco: string) => [...container.querySelectorAll('button')].find(b => b.textContent?.trim().startsWith(comeco));
const caixa = (texto: string) =>
  [...container.querySelectorAll('label')].find(l => l.textContent?.trim().startsWith(texto))?.querySelector('input');
const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  return casa ? Number(casa[2]) - Number(casa[1]) : -1;
};

describe('as lições da plataforma da CC006, pela tela', () => {
  it('a proposta: escrever, enviar, ser devolvida, completar e só então programar', () => {
    montarPlataforma('proposta');
    expect(faltam()).toBe(3);
    escrever(porId('problema'), 'A lista do material do clube fica num caderno no armário, ninguém sabe quanto há de cada coisa, e no acampamento sempre falta corda.', 'problema');
    escrever(porRotulo('Quem vai usar'), 'O conselheiro responsável pelo almoxarifado do clube', 'quem usa');
    for (const f of ['Cadastrar um material com o nome e a quantidade', 'Listar os materiais em ordem de nome', 'Alterar a quantidade de um material']) {
      escrever(porRotulo('Nova funcionalidade'), f, 'funcionalidade');
      clicar(botao('Acrescentar'), 'acrescentar');
    }
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(container.textContent).toContain('O examinador devolveu a proposta');
    expect(faltam()).toBe(2);

    escrever(porRotulo('Nova funcionalidade'), 'Remover um material que o clube não tem mais', 'funcionalidade');
    tecla(porRotulo('Nova funcionalidade'), 'Enter');
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(container.textContent).toContain('Proposta aprovada em 16/10/2026');
    clicar(botao('Começar a programar'), 'começar');
    expect(container.textContent).toContain('Programação liberada');
    expect(faltam()).toBe(0);
  });

  it('a proposta: começar antes de aprovar deixa a tarefa vermelha', () => {
    montarPlataforma('proposta');
    clicar(botao('Começar a programar'), 'começar');
    expect(container.textContent).toContain('A programação começou antes da aprovação');
  });

  it('o diário: três registros, cada um com sintoma e solução', () => {
    montarPlataforma('diario');
    expect(faltam()).toBe(3);
    const registros = [
      ['A quantidade digitada por extenso derrubava o programa inteiro no meio do cadastro.', 'ValueError: invalid literal for int()', 'Escrevi ler_inteiro no entrada.py, com except ValueError, que avisa e pergunta de novo.'],
      ['Cadastrar o mesmo material duas vezes fechava o programa e perdia o menu.', 'sqlite3.IntegrityError, UNIQUE constraint failed', 'Pus o cadastrar num try com except sqlite3.IntegrityError e uma frase que explica o motivo.'],
      ['Guardei quatro mudanças diferentes num commit só e não consegui desfazer uma delas.', 'O git log mostrava um commit chamado ajustes', 'Passei a usar git diff e git add arquivo por arquivo, com uma mensagem para cada assunto.'],
    ];
    registros.forEach(([p, a, s], i) => {
      escrever(porId(`problema-${i}`), p, `problema ${i}`);
      escrever(porId(`apareceu-${i}`), a, `sintoma ${i}`);
      escrever(porId(`solucao-${i}`), s, `solução ${i}`);
    });
    expect(faltam()).toBe(0);
  });

  it('a apresentação: minutos, o que mostrar e a decisão justificada', () => {
    montarPlataforma('apresentacao');
    expect(faltam()).toBe(4);
    escrever(porRotulo('Minutos: O problema e quem usa'), '2', 'problema');
    escrever(porRotulo('Minutos: O programa funcionando'), '7', 'demonstração');
    escrever(porRotulo('Minutos: A decisão técnica e o porquê'), '3', 'decisão');
    escrever(porRotulo('Minutos: Perguntas do examinador'), '3', 'perguntas');
    expect(container.textContent).toContain('Total: 15 de 15 minutos');
    for (const item of ['Cadastrar', 'Listar', 'Alterar', 'Remover', 'Digitar errado']) clicar(caixa(item), item);
    escrever(porRotulo('Decisão técnica'), 'unique', 'decisão');
    escrever(porId('alternativa'), 'Conferir com um SELECT antes de cada INSERT', 'alternativa');
    escrever(porId('porque'), 'Se outro programa gravar no mesmo arquivo, a conferência do meu não o alcança; o UNIQUE vale para todos, e eu só apanho o IntegrityError e aviso.', 'porquê');
    expect(faltam()).toBe(0);
  });
});

describe('as lições de terminal da CC006, pela tela', () => {
  const digitar = (linha: string) => {
    escrever(porRotulo('Linha de comando'), linha, 'linha de comando');
    tecla(porRotulo('Linha de comando'), 'Enter');
  };

  it('abre no computador do almoxarifado, com o histórico de três dias', () => {
    montarTerminal('m6-lab');
    digitar('pwd');
    expect(container.textContent).toContain('/home/desbravador/almoxarifado');
    digitar('git log');
    expect(container.textContent).toContain('Date:   2026-10-17');
  });

  it('versionar: cada mudança no seu commit', () => {
    montarTerminal('m6-lab');
    expect(faltam()).toBe(5);
    digitar('git diff banco.py');
    expect(container.textContent).toContain('COLLATE NOCASE');
    for (const [arquivo, mensagem] of [
      ['entrada.py', 'Dá um exemplo de número na mensagem de entrada inválida'],
      ['principal.py', 'Avisa quando não há material cadastrado'],
      ['banco.py', 'Ordena a lista sem separar maiúsculas de minúsculas'],
      ['.gitignore', 'Tira o cache do Python do controle de versão'],
    ]) {
      digitar(`git add ${arquivo}`);
      digitar(`git commit -m "${mensagem}"`);
    }
    expect(faltam()).toBe(0);
  });

  it('o README: escrito no editor ao lado, salvo e versionado', () => {
    montarTerminal('m7-lab');
    expect(faltam()).toBe(5);
    digitar('editar README.md');
    escrever(porRotulo('Conteúdo de /home/desbravador/almoxarifado/README.md'), `# Almoxarifado do clube

## Descrição

Programa de linha de comando que guarda o material do clube e quanto há de cada coisa, para a secretaria saber o que levar.

## Instalação

É preciso ter o Python 3. Baixe a pasta do projeto; o banco se cria sozinho na primeira vez.

## Uso

Na pasta do projeto, digite python principal.py e escolha uma opção do menu.

## Exemplo de execução

\`\`\`
1 - Cadastrar material
2 - Listar materiais
0 - Sair
Escolha: 2
1 - Barraca: 4
\`\`\`
`, 'README');
    clicar(botao('Salvar'), 'salvar');
    expect(faltam()).toBe(1);
    digitar('git add README.md');
    digitar('git commit -m "Escreve o README do almoxarifado"');
    expect(faltam()).toBe(0);
  });
});
