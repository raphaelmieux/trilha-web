// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DO_COFRE, TopoDoCofre, ListaDoCofre, LinhaDoCofre, CampoDoCofre,
  MedidorDeForca, CaixaDeGerar, AcessoDaEntrada, PainelDeSeguranca, PainelSemEntrada,
} from './gerenciadorDeSenhas';
import { type EntradaDoCofre, COMO_GERAR_PADRAO, cofreDoClube } from './cofreDeSenhas';

/*
  A janela do gerenciador de senhas.

  ── O que esta trava existe para pegar ───────────────────────────────────
  O motor tem trava própria em `cofreDeSenhas.test.ts`, e ela prova que as
  contas estão certas. Isso não prova que a janela **mostra** alguma delas: um
  medidor que perdesse a palavra e ficasse só com a cor, um campo de senha que
  abrisse à mostra, um botão sem `onClick` — o motor continua correto e o
  laboratório fica impossível de fazer, ou pior, fácil de fazer errado.

  É a diferença que `exploradorValidator.test.ts` já documentou: trava de motor
  não é trava de tela.
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
const porRotulo = (r: string) =>
  botoes().find(b => (b.getAttribute('aria-label') ?? '') === r);
const clicar = (b?: Element | null) =>
  act(() => { b?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

const ENTRADA: EntradaDoCofre = {
  id: 'email', servico: 'E-mail do clube', usuario: 'clubepioneiros@gmail.com',
  senha: 'Pioneiros2026', dono: 'clube', acesso: ['Marta'],
};

/* ── As peças estão todas lá ───────────────────────────────────────────────── */

describe('a janela tem as peças que um gerenciador de senhas tem', () => {
  it('o topo traz a marca e o nome do cofre aberto', () => {
    montar(<TopoDoCofre cofre="Cofre do Clube Pioneiros" />);
    expect(texto()).toContain('Cofre de Senhas');
    expect(texto()).toContain('Cofre do Clube Pioneiros');
  });

  it('a lista diz quantos itens tem, e a linha mostra serviço e usuário', () => {
    montar(
      <ListaDoCofre quantas={6}>
        <LinhaDoCofre entrada={ENTRADA} />
      </ListaDoCofre>,
    );
    expect(texto()).toContain('6 itens');
    expect(texto()).toContain('E-mail do clube');
    expect(texto()).toContain('clubepioneiros@gmail.com');
  });

  it('e o painel sem entrada escolhida diz o que fazer, em vez de ficar em branco', () => {
    montar(<PainelSemEntrada />);
    expect(texto()).toMatch(/escolha/i);
  });
});

/* ── A peça aparece pela presença do setter ────────────────────────────────── */

describe('a peça só aparece quando o laboratório a entrega', () => {
  /* É a regra do `aoBuscar` do Explorador: gesto sem efeito é o que ensina a
     desconfiar do programa. */

  it('sem aoBuscar não há caixa de pesquisa', () => {
    montar(<TopoDoCofre />);
    expect(container.querySelector('input[aria-label="Pesquisar no cofre"]')).toBeNull();
  });

  it('com aoBuscar, há', () => {
    montar(<TopoDoCofre aoBuscar={() => {}} termo="" />);
    expect(container.querySelector('input[aria-label="Pesquisar no cofre"]')).not.toBeNull();
  });

  it('sem aoAdicionar não há botão de item novo', () => {
    montar(<ListaDoCofre quantas={0} />);
    expect(porRotulo('Novo item')).toBeUndefined();
  });

  it('com aoAdicionar, há', () => {
    montar(<ListaDoCofre quantas={0} aoAdicionar={() => {}} />);
    expect(porRotulo('Novo item')).toBeDefined();
  });

  it('e sem aoTirarAcesso a pessoa não ganha um × que não faz nada', () => {
    montar(<AcessoDaEntrada entrada={ENTRADA} />);
    expect(porRotulo('Tirar o acesso de Marta')).toBeUndefined();

    montar(<AcessoDaEntrada entrada={ENTRADA} aoTirarAcesso={() => {}} />);
    expect(porRotulo('Tirar o acesso de Marta')).toBeDefined();
  });
});

/* ── O medidor ─────────────────────────────────────────────────────────────── */

describe('o medidor diz a força em largura e em palavra', () => {
  it('a palavra aparece escrita, e não só a cor da barra', () => {
    /*
      Cor sozinha não se lê. Quem não distingue vermelho de verde veria quatro
      medidores idênticos, e numa tela em preto e branco ninguém veria nenhum —
      é a mesma razão de a insígnia ter forma **e** cor, e de `MarcaDaLicao`
      ter ícone e disco.
    */
    montar(<MedidorDeForca senha="Senha@123" />);
    expect(texto()).toContain('frágil');

    montar(<MedidorDeForca senha="cavalo bateria grampo correto" />);
    expect(texto()).toContain('forte');
  });

  it('e a barra cresce com a força, que é a segunda leitura', () => {
    montar(<MedidorDeForca senha="Senha@123" />);
    const fraca = container.querySelector<HTMLElement>('.cf-barra span')!.style.width;

    montar(<MedidorDeForca senha="cavalo bateria grampo correto" />);
    const forte = container.querySelector<HTMLElement>('.cf-barra span')!.style.width;

    expect(parseInt(forte, 10)).toBeGreaterThan(parseInt(fraca, 10));
  });
});

/* ── O campo de senha ──────────────────────────────────────────────────────── */

describe('a senha chega escondida, e o olho a mostra', () => {
  it('sem aoAbrir ela fica escondida, e não há olho prometendo nada', () => {
    montar(<CampoDoCofre rotulo="Senha" valor="Pioneiros2026" segredo />);
    const campo = container.querySelector<HTMLInputElement>('input[aria-label="Senha"]')!;
    expect(campo.type).toBe('password');
    expect(porRotulo('Mostrar a senha')).toBeUndefined();
  });

  it('com aoAbrir, o olho existe e o rótulo dele diz o que vai acontecer', () => {
    /*
      Um cofre que abrisse com todas as senhas à mostra não é um cofre — e o
      gesto de revelar é parte de usar um. O rótulo muda com o estado porque
      quem navega por leitor de tela precisa saber qual dos dois vai acontecer.
    */
    const abrir = vi.fn();
    montar(<CampoDoCofre rotulo="Senha" valor="x" segredo aoAbrir={abrir} />);
    clicar(porRotulo('Mostrar a senha'));
    expect(abrir).toHaveBeenCalledOnce();

    montar(<CampoDoCofre rotulo="Senha" valor="x" segredo aberto aoAbrir={() => {}} />);
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Senha"]')!.type).toBe('text');
    expect(porRotulo('Esconder a senha')).toBeDefined();
  });

  it('e o campo só de leitura não aceita digitação', () => {
    montar(<CampoDoCofre rotulo="Serviço" valor="E-mail do clube" />);
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Serviço"]')!.readOnly).toBe(true);
  });
});

/* ── O gerador ─────────────────────────────────────────────────────────────── */

describe('o gerador oferece o que um gerador oferece', () => {
  it('tamanho, as três classes, sortear de novo, e o medidor junto', () => {
    montar(
      <CaixaDeGerar
        como={COMO_GERAR_PADRAO} aoMudar={() => {}}
        senha="dGh7x-Wq2Ktm9bVs" aoSortear={() => {}} aoUsar={() => {}}
      />,
    );
    expect(container.querySelector('input[aria-label="Tamanho da senha"]')).not.toBeNull();
    expect(texto()).toContain('Maiúsculas');
    expect(texto()).toContain('Números');
    expect(texto()).toContain('Símbolos');
    expect(porRotulo('Sortear outra')).toBeDefined();
    /* O medidor tem de estar aqui: gerar sem ver a força ensinaria que o que
       sai do gerador é bom por sair do gerador. */
    expect(container.querySelector('.cf-medidor')).not.toBeNull();
  });

  it('o tamanho vai a menos do que o padrão, porque a escolha é da pessoa', () => {
    /* Um gerador travado no tamanho bom não deixaria a pessoa ver a conta
       acontecer — e é vendo o medidor cair que se aprende o requisito 2.1. */
    montar(
      <CaixaDeGerar como={COMO_GERAR_PADRAO} aoMudar={() => {}} senha="abc" aoSortear={() => {}} />,
    );
    const r = container.querySelector<HTMLInputElement>('input[aria-label="Tamanho da senha"]')!;
    expect(Number(r.min)).toBeLessThan(COMO_GERAR_PADRAO.tamanho);
  });

  it('e sem aoUsar não há botão de usar a senha que ninguém vai receber', () => {
    montar(
      <CaixaDeGerar como={COMO_GERAR_PADRAO} aoMudar={() => {}} senha="abc" aoSortear={() => {}} />,
    );
    expect(texto()).not.toContain('Usar esta senha');
  });
});

/* ── De quem é a conta ─────────────────────────────────────────────────────── */

describe('a janela mostra de quem é a conta e quem entra nela', () => {
  it('a conta no nome de uma pessoa se lê na tela', () => {
    const dela = cofreDoClube().entradas.find(e => e.id === 'formulario')!;
    montar(<AcessoDaEntrada entrada={dela} />);
    expect(texto()).toContain('de uma pessoa');
  });

  it('e a do clube também, que é o outro lado da mesma leitura', () => {
    montar(<AcessoDaEntrada entrada={ENTRADA} />);
    expect(texto()).toContain('do clube');
  });

  it('o botão de passar para o clube só existe onde ele faz alguma coisa', () => {
    /* Numa conta que já é do clube, ele seria um botão que não muda nada — e
       gesto sem efeito é o que ensina a desconfiar do programa. */
    montar(<AcessoDaEntrada entrada={ENTRADA} aoPassarParaOClube={() => {}} />);
    expect(texto()).not.toContain('Passar para a conta do clube');

    const dela = cofreDoClube().entradas.find(e => e.id === 'formulario')!;
    montar(<AcessoDaEntrada entrada={dela} aoPassarParaOClube={() => {}} />);
    expect(texto()).toContain('Passar para a conta do clube');
  });

  it('e conta sem ninguém dentro diz "ninguém", em vez de ficar em branco', () => {
    montar(<AcessoDaEntrada entrada={{ ...ENTRADA, acesso: [] }} />);
    expect(texto()).toContain('ninguém');
  });
});

/* ── O relatório relata ────────────────────────────────────────────────────── */

describe('o relatório do cofre relata, e não julga a tarefa', () => {
  it('ele nomeia o problema e o detalhe dele', () => {
    montar(
      <PainelDeSeguranca problemas={[{
        id: 'reuso', titulo: 'A mesma senha em 4 contas',
        detalhe: 'Se qualquer uma delas vazar, as outras três caem junto.',
      }]} />,
    );
    expect(texto()).toContain('A mesma senha em 4 contas');
    expect(texto()).toContain('as outras três caem junto');
  });

  it('e o relatório limpo diz isso, em vez de ficar vazio', () => {
    montar(<PainelDeSeguranca problemas={[]} />);
    expect(texto().trim().length).toBeGreaterThan(10);
  });

  it('nada no programa fala de tarefa, lição ou exercício', () => {
    /*
      É a regra da régua de status do Word, do painel de Problemas do Python e
      do aviso do digitalizador: o programa imitado relata o que mediu, e
      nenhum gerenciador de senhas do mundo escreve "seu exercício está
      incompleto".

      A trava procura o vocabulário do **exercício**, e não palavras de juízo —
      a do digitalizador nasceu proibindo "errado" e reprovou uma frase
      verdadeira do aplicativo relatando o que mediu.
    */
    montar(
      <>
        <TopoDoCofre cofre="Cofre do Clube" aoBuscar={() => {}} termo="" />
        <ListaDoCofre quantas={1} aoAdicionar={() => {}}>
          <LinhaDoCofre entrada={ENTRADA} alerta="Esta senha está em mais 3 contas" />
        </ListaDoCofre>
        <CampoDoCofre rotulo="Senha" valor="x" segredo aoAbrir={() => {}} aoCopiar={() => {}} />
        <MedidorDeForca senha="Senha@123" />
        <CaixaDeGerar como={COMO_GERAR_PADRAO} aoMudar={() => {}} senha="abc" aoSortear={() => {}} aoUsar={() => {}} />
        <AcessoDaEntrada entrada={ENTRADA} aoDarAcesso={() => {}} aoTirarAcesso={() => {}} />
        <PainelDeSeguranca problemas={[]} />
      </>,
    );
    for (const p of ['tarefa', 'lição', 'exercício', 'cumprid', 'concluíd']) {
      expect(texto().toLowerCase(), `o programa escreveu "${p}"`).not.toContain(p);
    }
  });
});

/* ── Nenhuma peça guarda estado ────────────────────────────────────────────── */

describe('a janela não guarda estado nenhum', () => {
  it('a entrada aberta é a que o chamador diz, e clicar não a muda sozinha', () => {
    /* Uma lista com entrada aberta própria obrigaria os dois lados a concordar
       sobre a mesma entrada, que é a forma mais rápida de mostrarem coisas
       diferentes. Quem guarda é o laboratório, que responde à verificação. */
    const outra: EntradaDoCofre = { ...ENTRADA, id: 'drive', servico: 'Nuvem de arquivos' };
    montar(
      <ListaDoCofre quantas={2}>
        <LinhaDoCofre entrada={ENTRADA} aberta aoAbrir={() => {}} />
        <LinhaDoCofre entrada={outra} aoAbrir={() => {}} />
      </ListaDoCofre>,
    );
    clicar(botoes().find(b => b.textContent?.includes('Nuvem de arquivos')));
    const aberta = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(aberta?.textContent, 'a lista trocou de entrada por conta própria').toContain('E-mail do clube');
  });
});

/* ── A tela estreita ───────────────────────────────────────────────────────── */

describe('no celular a lista deita, e continua existindo', () => {
  it('a regra existe, e ela não esconde a lista', () => {
    /*
      Reduzir a tela nunca reduz o que dá para fazer nela. Escondida a lista,
      não haveria caminho até escolher a entrada — que é o primeiro gesto do
      requisito 4.1. O jsdom não resolve media query nenhuma, então o que se lê
      é a folha.
    */
    const celular = CSS_DO_COFRE.slice(CSS_DO_COFRE.indexOf('@media (max-width: 860px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.cf-corpo');
    expect(celular).toContain('flex-direction: column');
    expect(celular).not.toMatch(/\.cf-lista[^{]*\{[^}]*display:\s*none/);
    expect(celular).not.toMatch(/\.cf-linha[^{]*\{[^}]*display:\s*none/);
  });
});

/* ── O botão desligado tem de parecer desligado ────────────────────────────── */

describe('a regra do desligado vem depois da do principal, e não antes', () => {
  it('o botão principal desligado não fica com a cor de clicável', () => {
    /*
      Escrita **antes**, a regra do desligado tem a mesma especificidade da do
      principal e perde: o botão sai azul e branco, com cara de clicável, e
      clicar nele não faz nada — que é exatamente o que ensina a desconfiar do
      programa, e o contrário do que a moldura existe para fazer.

      Nada estoura quando a ordem está errada. É o mesmo conserto que o diálogo
      do celular precisou na CC-ES001 e na CC-ES004, e por isso a trava lê a
      **ordem** na folha, e não só a existência da regra.

      O jsdom não resolve cascata nenhuma — quem viu foi o Chromium —, então o
      que se lê aqui é a folha.
    */
    const principal = CSS_DO_COFRE.indexOf('[data-principal="sim"] {');
    const desligado = CSS_DO_COFRE.indexOf(':disabled,');
    expect(principal, 'a regra do principal sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'o desligado está escrito antes do principal, e perde')
      .toBeGreaterThan(principal);
  });

  it('e o desligado troca o fundo, e não só a cor da letra', () => {
    /* Só a letra deixaria o fundo azul de pé, e um retângulo azul continua
       parecendo botão por mais clara que fique a palavra dentro dele. */
    const regra = CSS_DO_COFRE.slice(CSS_DO_COFRE.indexOf(':disabled,'));
    expect(regra.slice(0, regra.indexOf('}'))).toContain('background');
  });
});
