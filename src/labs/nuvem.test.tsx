// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DA_NUVEM, TopoDaNuvem, LateralDaNuvem, CaminhoDaNuvem, CabecalhoDaLista,
  LinhaDaNuvem, SeletorDePapel, AcessoPelaPasta, OQuePapelDeixa,
  CaixaDeCompartilhar, PessoaDaCaixa, SecaoDaCaixa, BotaoDaNuvem,
} from './nuvem';
import { nuvemDoClube, arquivoDe, compartilhar, type Nuvem } from './arquivoCompartilhado';

/*
  A janela da nuvem, e o que ela não pode contar.

  ── O que esta trava existe para pegar ───────────────────────────────────
  As outras travas de janela — `explorer.test.tsx`, `correio.test.tsx`,
  `excel.test.tsx` — pegam a peça que sumiu no recorte. Esta pega isso e mais
  uma coisa, que é própria desta vereda: **a janela sabe a resposta**.

  O requisito 5 manda descobrir que a permissão da pasta alcança o que está
  dentro. Quem calcula isso é `papelDe`, e a janela tem a nuvem inteira na
  mão — desenhar o papel efetivo na linha da lista, ou abrir a lista de quem
  herda já expandida, poria na nossa tela a resposta que o desbravador vai
  buscar. Seria a mesma falta do aviso do digitalizador que julga a tarefa, e
  do painel de Problemas que diria qual é a família certa.

  Nada disso estoura. A lista fica mais informativa, a caixa fica mais
  explicada, e o requisito 5 deixa de ter o que demonstrar.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(no: React.ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(no));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const texto = () => container.textContent ?? '';
const botoes = () => [...container.querySelectorAll('button')];
const opcoes = () => [...container.querySelectorAll('option')].map(o => o.textContent ?? '');

const n = nuvemDoClube();
const acharArq = (id: string) => n.arquivos.find(a => a.id === id)!;

/* ── As peças estão lá ─────────────────────────────────────────────────────── */

describe('a janela da nuvem tem as peças que uma nuvem tem', () => {
  it('o alto traz o nome do programa e quem está entrando', () => {
    montar(<TopoDaNuvem quem="voce" />);
    expect(texto()).toContain('Nuvem do Clube');
  });

  it('a lateral traz os três lugares, e não só o da lição', () => {
    /*
      Um programa tem todos os comandos o tempo todo. Uma nuvem que só
      mostrasse "Compartilhados comigo" na lição de compartilhar ensinaria a
      procurar o botão que a tarefa quer, e não a procurar no programa.
    */
    montar(<LateralDaNuvem lugar="meu" aoIr={() => {}} usado={0.4} />);
    for (const nome of ['Meu Drive', 'Compartilhados comigo', 'Lixeira']) {
      expect(texto(), nome).toContain(nome);
    }
  });

  it('e a lateral não guarda o lugar aberto: ela desenha o que lhe disseram', () => {
    /* Peça com estado próprio obrigaria os dois lados a concordar sobre o
       mesmo lugar, que é a forma mais rápida de mostrarem coisas diferentes. */
    montar(<LateralDaNuvem lugar="lixeira" aoIr={() => {}} usado={0.4} />);
    const atual = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(atual?.textContent).toContain('Lixeira');

    act(() => root.render(<LateralDaNuvem lugar="comigo" aoIr={() => {}} usado={0.4} />));
    const depois = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(depois?.textContent).toContain('Compartilhados comigo');
  });

  it('a lista tem cabeçalho com nome, dono e data', () => {
    montar(<CabecalhoDaLista />);
    for (const c of ['Nome', 'Proprietário', 'Última alteração']) {
      expect(texto(), c).toContain(c);
    }
  });

  it('o caminho vai da raiz até onde se está, e o último não clica', () => {
    montar(<CaminhoDaNuvem aoIr={() => {}} trilha={[
      { id: null, nome: 'Meu Drive' },
      { id: 'pasta-clube', nome: 'Clube Pioneiros' },
    ]} />);
    const ultimo = botoes()[botoes().length - 1];
    expect(ultimo.textContent).toBe('Clube Pioneiros');
    expect(ultimo.getAttribute('aria-current')).toBe('page');
  });
});

/* ── A peça aparece pela presença do setter ────────────────────────────────── */

describe('a peça aparece pela presença do setter, e não sempre', () => {
  it('sem `aoBuscar` não há caixa de pesquisa', () => {
    /* É a regra do Explorador: prometer um gesto que a lição não faz é o que
       ensina a desconfiar do programa. */
    montar(<TopoDaNuvem quem="voce" />);
    expect(container.querySelector('input')).toBeNull();

    act(() => root.render(<TopoDaNuvem quem="voce" busca="" aoBuscar={() => {}} />));
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('sem `aoTransferir` não há "Transferir propriedade" no seletor de papel', () => {
    /*
      O requisito 4.6 manda demonstrar a transferência, e ela mora **dentro**
      do seletor de papel porque é onde a nuvem de verdade a esconde. Nas
      lições que não a pedem ela não aparece: opção que não faz nada é gesto
      sem efeito.
    */
    montar(<SeletorDePapel papel="leitor" aoMudar={() => {}} />);
    expect(opcoes()).not.toContain('Transferir propriedade');

    act(() => root.render(
      <SeletorDePapel papel="leitor" aoMudar={() => {}} aoTransferir={() => {}} />));
    expect(opcoes()).toContain('Transferir propriedade');
  });

  it('e sem `aoTirar` não há "Remover acesso"', () => {
    montar(<SeletorDePapel papel="editor" aoMudar={() => {}} />);
    expect(opcoes()).not.toContain('Remover acesso');

    act(() => root.render(<SeletorDePapel papel="editor" aoTirar={() => {}} />));
    expect(opcoes()).toContain('Remover acesso');
  });

  it('o dono não tem seletor nenhum: propriedade não é papel', () => {
    /* É o requisito 2.5 desenhado. Um seletor com "Proprietário" entre os
       papéis diria que dar a conta é escolher uma linha do mesmo menu. */
    montar(<SeletorDePapel papel="dono" dono />);
    expect(container.querySelector('select')).toBeNull();
    expect(texto()).toContain('Proprietário');
  });

  it('sem `aoMenu` a linha não mostra os três pontos', () => {
    montar(<LinhaDaNuvem arquivo={acharArq('ata')} escolhido={false}
      aoEscolher={() => {}} aoAbrir={() => {}} />);
    expect(botoes()).toHaveLength(0);
  });
});

/* ── A janela não conta a resposta do requisito 5 ──────────────────────────── */

describe('a lista não diz quem alcança o arquivo pela pasta', () => {
  it('a linha não escreve o papel de ninguém, em texto nenhum', () => {
    /*
      A ficha médica é alcançada por três pessoas pela pasta, e a lista da
      nuvem de verdade não diz isso em lugar nenhum — é justamente por isso
      que o arquivo fica aberto sem ninguém saber. Escrever o papel aqui,
      inclusive como texto para leitor de tela, resolveria o requisito 5
      antes de ele começar, e resolveria só para uma parte das pessoas.
    */
    montar(<LinhaDaNuvem arquivo={acharArq('fichas')} escolhido={false}
      aoEscolher={() => {}} aoAbrir={() => {}} />);
    for (const palavra of ['Leitor', 'Comentarista', 'Editor']) {
      expect(texto(), `a linha entregou "${palavra}"`).not.toContain(palavra);
    }
  });

  it('o selo de compartilhado sai do acesso próprio, e não do herdado', () => {
    /*
      A ficha médica não tem acesso próprio nenhum e mesmo assim três pessoas
      a abrem. Um selo que lesse o acesso efetivo marcaria a ficha como
      "Compartilhado" e diria em uma palavra o que a lição manda descobrir.
    */
    montar(<LinhaDaNuvem arquivo={acharArq('fichas')} escolhido={false}
      aoEscolher={() => {}} aoAbrir={() => {}} />);
    expect(texto()).not.toContain('Compartilhado');

    act(() => root.render(<LinhaDaNuvem arquivo={acharArq('escala')} escolhido={false}
      aoEscolher={() => {}} aoAbrir={() => {}} />));
    expect(texto(), 'a escala tem acesso próprio e não se disse compartilhada')
      .toContain('Compartilhado');
  });
});

describe('quem herda pela pasta aparece recolhido, e é a nuvem que faz assim', () => {
  it('a linha diz quantos são, e não quem são', () => {
    /*
      Desenhá-la já expandida poria na nossa tela a resposta que o requisito 5
      manda ir buscar; escondê-la de todo faria o programa mentir. A nuvem de
      verdade mostra a contagem com uma seta, e ninguém abre.
    */
    montar(<AcessoPelaPasta nuvem={n} arquivo={acharArq('fichas')}
      aberto={false} aoAbrir={() => {}} />);
    expect(texto()).toContain('pela pasta');
    expect(texto()).not.toContain('Ronaldo');

    const revelar = botoes()[0];
    expect(revelar.getAttribute('aria-expanded')).toBe('false');
  });

  it('e aberta ela nomeia cada um com o papel que a pasta dá', () => {
    montar(<AcessoPelaPasta nuvem={n} arquivo={acharArq('fichas')}
      aberto aoAbrir={() => {}} />);
    expect(texto()).toContain('Ronaldo');
    expect(texto()).toContain('pela pasta');
  });

  it('ninguém herdando não vira uma linha dizendo "0 pessoas"', () => {
    /*
      É a guarda contra o vazio, na forma que mais engana: uma revelação que
      abrisse vazia prometeria uma informação que não existe, e quem a abrisse
      concluiria que o arquivo está restrito por ter lido uma lista vazia.
    */
    const solto: Nuvem = { arquivos: [arquivoDe('x', 'Solto', 'documento', 'marta')] };
    montar(<AcessoPelaPasta nuvem={solto} arquivo={solto.arquivos[0]}
      aberto aoAbrir={() => {}} />);
    expect(texto()).toBe('');
  });

  it('e quem já está na lista própria do arquivo não se repete na herdada', () => {
    /* Aparecer duas vezes faria a contagem mentir para mais, e a caixa
       diria que há gente entrando pela pasta que já está escrita ali em cima. */
    const d = compartilhar(n, 'fichas', 'ronaldo', 'leitor');
    montar(<AcessoPelaPasta nuvem={d} arquivo={d.arquivos.find(a => a.id === 'fichas')!}
      aberto={false} aoAbrir={() => {}} />);
    expect(texto()).not.toContain('3 pessoas');
  });
});

/* ── A caixa de compartilhar ───────────────────────────────────────────────── */

describe('a caixa de compartilhar diz o que cada papel deixa fazer', () => {
  it('e diz também o que ele não deixa, que é o que separa os três', () => {
    /*
      Sem o `naoPode` os três níveis são três palavras. Quem tem permissão de
      comentar e digita no documento não muda o texto: ele propõe — e é o caso
      que o requisito 4.4 existe para mostrar.
    */
    montar(<OQuePapelDeixa papel="comentarista" />);
    expect(texto()).toContain('Não pode');
    expect(texto()).toMatch(/sugest/i);
  });

  it('a caixa nomeia o arquivo no título, e não só "Compartilhar"', () => {
    montar(
      <CaixaDeCompartilhar arquivo={acharArq('fichas')} aoFechar={() => {}}>
        <SecaoDaCaixa titulo="Pessoas com acesso">
          <PessoaDaCaixa quem="marta" dono />
        </SecaoDaCaixa>
      </CaixaDeCompartilhar>,
    );
    expect(texto()).toContain('Fichas médicas 2026');
    expect(texto()).toContain('Marta');
    expect(texto()).toContain('Proprietário');
  });

  it('e a caixa mostra o endereço de cada um, e não só o nome', () => {
    /* Compartilhar é escolher uma conta, e conta se distingue pelo endereço.
       Duas Martas com o mesmo primeiro nome são a coisa mais comum que há. */
    montar(<PessoaDaCaixa quem="cleide"><span /></PessoaDaCaixa>);
    expect(texto()).toContain('@');
  });
});

/* ── A folha ───────────────────────────────────────────────────────────────── */

describe('a folha da nuvem não deixa botão desligado com cara de clicável', () => {
  it('a regra do desligado vem depois da do principal, e não antes', () => {
    /*
      As duas têm a mesma especificidade, então escrita antes ela perde: o
      botão sai azul e branco, com cara de clicável, e clicar não faz nada.
      É a quarta vez — CC-ES001, CC-ES004, CC-ES005 e aqui —, e errar isso não
      estoura coisa nenhuma. Por isso a trava lê a **ordem**, e não só a
      existência da regra.
    */
    const principal = CSS_DA_NUVEM.indexOf('.nv-btn[data-principal="sim"] {');
    const desligado = CSS_DA_NUVEM.indexOf('.nv-btn:disabled {');
    expect(principal, 'a regra do principal sumiu').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu').toBeGreaterThan(-1);
    expect(desligado, 'o desligado está escrito antes do principal, e perde')
      .toBeGreaterThan(principal);
  });

  it('e o desligado troca o fundo, e não só a letra', () => {
    /* Um retângulo azul continua parecendo botão por mais clara que fique a
       palavra dentro dele. */
    const regra = CSS_DA_NUVEM.slice(
      CSS_DA_NUVEM.indexOf('.nv-btn:disabled {'),
      CSS_DA_NUVEM.indexOf('.nv-btn:disabled:hover'),
    );
    expect(regra).toContain('background');
  });

  it('o botão desligado de fato chega desligado à tela', () => {
    montar(<BotaoDaNuvem principal desligado>Concluído</BotaoDaNuvem>);
    expect(botoes()[0].disabled).toBe(true);
  });
});

describe('no celular a janela deita, e nenhum lugar some', () => {
  it('a regra existe e mexe no corpo e na lateral', () => {
    const celular = CSS_DA_NUVEM.slice(CSS_DA_NUVEM.indexOf('@media (max-width: 760px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.nv-corpo');
    expect(celular).toContain('.nv-lado');
  });

  it('e ela não esconde lugar nenhum da lateral', () => {
    /*
      Reduzir a tela nunca reduz o que dá para fazer nela. Esconder
      "Compartilhados comigo" no celular tiraria o único caminho até metade
      dos arquivos desta vereda, que são de outras pessoas.
    */
    const celular = CSS_DA_NUVEM.slice(CSS_DA_NUVEM.indexOf('@media (max-width: 760px)'));
    const escondeLugar = /\.nv-lugar[^{]*\{[^}]*display:\s*none/.test(celular);
    expect(escondeLugar, 'a regra do celular esconde um lugar da lateral').toBe(false);
  });

  it('o que ela esconde são as duas colunas de texto, e não a de ações', () => {
    /* Dono e data cabem na caixa; o menu de três pontos é o único caminho até
       Compartilhar, e sumir com ele trancaria a lição. */
    const celular = CSS_DA_NUVEM.slice(CSS_DA_NUVEM.indexOf('@media (max-width: 760px)'));
    expect(celular).toContain('[data-coluna="dono"]');
    expect(celular).toContain('[data-coluna="quando"]');
    expect(celular).not.toContain('.nv-pontos');
  });
});
