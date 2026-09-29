// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import PesquisaWebLab from './PesquisaWebLab';
import { PAGINAS, VERIFICACOES } from './pesquisaDoMilenio';
import { CSS_NAVEGADOR } from './navegador';

/*
  A pesquisa da AP045, feita pelos mesmos cliques que o desbravador daria.

  `pesquisaDoMilenio.test.ts` prova que cada verificação **pode** ficar verde
  chamando o modelo, e que os fatos das páginas são os mesmos que o relatório
  confere. Isso não prova que a janela chama alguma delas: um resultado de busca
  sem `onClick`, uma frase que não vira ficha, uma barra de pesquisa que não
  pesquisa — o motor continua correto e a lição fica impossível de vencer.

  Está escrito em `exploradorValidator.test.ts`: trava de motor não é trava de
  tela.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <PesquisaWebLab
          specialtyCode="AP045" lessonCode="AP045.5-L3"
          lessonTitle="Pesquisando o bug do milênio em sites especializados"
          requirementCodes={['AP045-6.1']} userId="olhar"
        />
      </MemoryRouter>,
    );
  });
}

afterEach(() => { act(() => root.unmount()); container.remove(); });

const texto = () => container.textContent ?? '';

const clicar = (el: Element | undefined | null, oQue: string) => {
  expect(el, `não achei na tela: ${oQue}`).toBeTruthy();
  act(() => { el!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

function escrever(el: HTMLInputElement, valor: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(el, valor);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const buscarNaTela = (termo: string) =>
  escrever(container.querySelector('[aria-label="Pesquisar na web"]') as HTMLInputElement, termo);

const resultado = (titulo: string) =>
  [...container.querySelectorAll('.nv-resultado-titulo')].find(b => b.textContent === titulo);

const frases = () => [...container.querySelectorAll('.nv-frase')];

/** Abre uma página do buscador e guarda todas as frases dela. */
function colherTudoDe(id: string) {
  const pagina = PAGINAS.find(p => p.id === id)!;
  buscarNaTela('bug do milênio ano 2000 y2k virada verdade');
  clicar(resultado(pagina.titulo), pagina.titulo);
  for (const f of frases()) clicar(f, 'frase');
  clicar(container.querySelector('[aria-label="Voltar"]'), 'voltar');
}

const entregar = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Entregar a pesquisa/.test(b.textContent ?? '')) as HTMLButtonElement;

describe('a pesquisa se faz clicando', () => {
  it('abre sem resultado nenhum e com o botão desligado', () => {
    montar();
    expect(texto()).toContain('Escreva o que você quer descobrir');
    expect(entregar().disabled).toBe(true);
  });

  it('a busca traz páginas, e clicar numa abre a página', () => {
    montar();
    buscarNaTela('bug do milênio');
    expect(texto()).toMatch(/resultados/);
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    expect(texto()).toContain(museu.autor);
    expect(frases().length).toBe(museu.frases.length);
  });

  it('e a lição fecha com fichas de quatro páginas especializadas', () => {
    montar();
    for (const id of ['museu', 'revista', 'enciclopedia', 'governo']) colherTudoDe(id);
    expect(entregar().disabled).toBe(false);
  });
});

describe('a ficha nasce da página', () => {
  it('não há campo nenhum para digitar um fato', () => {
    /* Um campo de texto livre com um campo de fonte ao lado teria a forma certa
       e mediria a coisa errada: o fato digitado de cabeça e qualquer coisa na
       fonte. É a família do "Figura 1" digitado da CC-ES002. */
    montar();
    buscarNaTela('bug do milênio');
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    const campos = [...container.querySelectorAll('input, textarea')]
      .filter(e => !(e as HTMLInputElement).readOnly)
      .map(e => e.getAttribute('aria-label'));
    /* Nenhum. A barra de endereço é de leitura, e a caixa de busca é do
       buscador — ela não existe numa página aberta, como não existe no site que
       você abriu a partir do Google. */
    expect(campos).toEqual([]);
  });

  it('e a fonte aparece junto da ficha, sempre', () => {
    montar();
    buscarNaTela('bug do milênio');
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    clicar(frases()[0], 'primeira frase');
    expect(texto()).toContain(museu.url);
  });

  it('clicar de novo na frase descarta a ficha', () => {
    montar();
    buscarNaTela('bug do milênio');
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    clicar(frases()[0], 'guardar');
    expect(texto()).toMatch(/Fichas \(1\)/);
    clicar(frases()[0], 'descartar');
    expect(texto()).toMatch(/Fichas \(0\)/);
  });
});

describe('a página mostra o que decide, e não o veredito', () => {
  it('a ficha técnica diz o que a página não tem, em vez de esconder a linha', () => {
    /* Uma página que não diz o autor precisa **mostrar** que não diz; esconder
       a linha faria a falta desaparecer, e não haveria o que comparar entre uma
       página e outra. */
    montar();
    buscarNaTela('verdade y2k');
    const forum = PAGINAS.find(p => p.id === 'forum')!;
    clicar(resultado(forum.titulo), forum.titulo);
    expect(texto()).toContain('a página não diz');
    expect(texto()).toContain('a página não tem data');
  });

  it('e não escreve em lugar nenhum que a página é confiável ou não', () => {
    /* Um selo resolveria o requisito num olhar, e resolveria só aqui dentro. */
    montar();
    buscarNaTela('verdade y2k bug milênio ano 2000');
    expect(texto()).not.toMatch(/confiável|duvidosa|não confie/i);
  });

  it('guardar uma ficha do fórum não fecha a lição', () => {
    montar();
    for (const id of ['museu', 'revista', 'enciclopedia', 'governo']) colherTudoDe(id);
    expect(entregar().disabled).toBe(false);
    colherTudoDe('forum');
    expect(entregar().disabled).toBe(true);
  });
});

describe('a folha do navegador', () => {
  it('o título da página diz a própria cor', () => {
    /* A plataforma pinta h1..h4 de quase branco — certo num aplicativo escuro,
       e invisível sobre a página branca de um navegador. O título saiu cinza
       claríssimo sobre branco até o Chromium mostrar; aqui o que se testa é a
       promessa, porque o jsdom não calcula contraste nenhum. É a mesma regra
       que `painelDoLaboratorio.test.ts` guarda do outro lado. */
    const regra = CSS_NAVEGADOR.match(/\.nv-titulo-pagina\s*\{[^}]*\}/)?.[0] ?? '';
    expect(regra, '.nv-titulo-pagina sumiu da folha').not.toBe('');
    expect(regra, '.nv-titulo-pagina herda a cor de h1 da plataforma').toMatch(/color:/);
  });

  it('e a ficha técnica marca a linha que falta', () => {
    /* A falta precisa ter cor própria: em cinza de texto comum, "a página não
       diz" some no meio das outras duas linhas, e é justamente ela que decide. */
    expect(CSS_NAVEGADOR).toMatch(/\.nv-ficha-falta\s*\{[^}]*color:/);
  });
});

describe('a casca do navegador', () => {
  it('a barra de endereço mostra o endereço da página aberta, e não se digita', () => {
    montar();
    buscarNaTela('bug do milênio');
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    const barra = container.querySelector('[aria-label="Barra de endereço"]') as HTMLInputElement;
    expect(barra.value).toBe(museu.url);
    /* Navegar aqui é clicar num resultado. Um campo editável prometeria um
       gesto que não leva a lugar nenhum. */
    expect(barra.readOnly).toBe(true);
  });

  it('voltar leva à lista de resultados, e só existe com página aberta', () => {
    montar();
    expect((container.querySelector('[aria-label="Voltar"]') as HTMLButtonElement).disabled).toBe(true);
    buscarNaTela('bug do milênio');
    const museu = PAGINAS.find(p => p.id === 'museu')!;
    clicar(resultado(museu.titulo), museu.titulo);
    clicar(container.querySelector('[aria-label="Voltar"]'), 'voltar');
    expect(texto()).toMatch(/resultados/);
  });

  it('e a lista de tarefas traz todas as verificações', () => {
    montar();
    for (const v of VERIFICACOES) expect(texto()).toContain(v.rotulo);
  });
});
