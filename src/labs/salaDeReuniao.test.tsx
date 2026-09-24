// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  BarraDaSala, CSS_DA_SALA, CaixaDeApresentar, FaixaDaSala, PalcoDaSala, PedidoDeEntrar,
  type AbaDeApresentar,
} from './salaDeReuniao';
import {
  CONVERSA, NOME_DO_COMPARTILHAMENTO, OQUE_A_ESCOLHA_LEVA_JUNTO, PLANILHA, VIDEO,
} from './reuniaoRemota';

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
const acharBotao = (r: RegExp) =>
  botoes().find(b => r.test(b.getAttribute('aria-label') ?? b.textContent ?? ''));
const clicar = (b: Element | undefined) => act(() => { (b as HTMLButtonElement).click(); });

const LADRILHOS = [
  { id: 'voce', nome: 'Você', microfone: false, voce: true },
  { id: 'ricardo', nome: 'Tio Ricardo', microfone: true },
];

const ABAS: AbaDeApresentar[] = (['tela-inteira', 'janela', 'guia'] as const).map(id => ({
  id,
  nome: NOME_DO_COMPARTILHAMENTO[id],
  leva: OQUE_A_ESCOLHA_LEVA_JUNTO[id],
  alvos: id === 'tela-inteira' ? [] : id === 'janela' ? [PLANILHA, CONVERSA] : [VIDEO],
}));

/* ── O palco desenha o que a sala vê ───────────────────────────────────────── */

describe('o palco desenha o que a sala vê, e não o que você está olhando', () => {
  it('ninguém apresentando é a tela vazia dizendo isso', () => {
    montar(<PalcoDaSala ladrilhos={LADRILHOS} />);
    expect(texto()).toContain('Ninguém está apresentando');
    expect(container.querySelector('.re-tela[data-vazia="sim"]')).toBeTruthy();
  });

  it('e apresentando, ele nomeia o que a sala está vendo', () => {
    /*
      Metade do requisito 6 é a diferença entre o que você olha e o que a sala
      vê. Um palco que desenhasse a sua janela em foco esconderia a janela
      parada que todo mundo está vendo — que é o defeito que a lição existe
      para mostrar.
    */
    montar(<PalcoDaSala ladrilhos={LADRILHOS} mostrando={PLANILHA} />);
    expect(texto()).toContain(PLANILHA);
    expect(container.querySelector('.re-tela[data-vazia="sim"]')).toBeNull();
  });

  it('o microfone fechado de cada um aparece no ladrilho dele', () => {
    /* É o aviso que o programa dá e que ninguém lê, e ele precisa estar aqui
       para a lição poder mostrar que estar escrito não impede nada. */
    montar(<PalcoDaSala ladrilhos={LADRILHOS} />);
    expect(container.querySelectorAll('.re-ladrilho')).toHaveLength(2);
    expect(container.querySelector('.re-ladrilho[data-voce="sim"]')?.textContent)
      .toContain('Você');
  });
});

/* ── A barra tem todos os comandos ─────────────────────────────────────────── */

describe('a barra tem todos os comandos, e desliga o que a lição não usa', () => {
  it('microfone, câmera, apresentar, pessoas e sair aparecem sempre', () => {
    /* Esconder o de apresentar durante a lição que não apresenta ensinaria a
       procurar o botão que a tarefa quer, e não a procurar no programa. */
    montar(<BarraDaSala microfone={false} camera={false} />);
    expect(acharBotao(/abrir o microfone/i)).toBeTruthy();
    expect(acharBotao(/ligar a câmera/i)).toBeTruthy();
    expect(acharBotao(/apresentar agora/i)).toBeTruthy();
    expect(acharBotao(/^Pessoas$/i)).toBeTruthy();
    expect(acharBotao(/sair da reunião/i)).toBeTruthy();
    expect((acharBotao(/apresentar agora/i) as HTMLButtonElement).disabled).toBe(true);
  });

  it('o rótulo do microfone diz o que o clique vai fazer', () => {
    let aberto = false;
    montar(<BarraDaSala microfone={aberto} camera={false}
      aoTrocarMicrofone={v => { aberto = v; }} />);
    clicar(acharBotao(/abrir o microfone/i));
    expect(aberto).toBe(true);

    act(() => root.render(<BarraDaSala microfone camera={false}
      aoTrocarMicrofone={v => { aberto = v; }} />));
    expect(acharBotao(/fechar o microfone/i)).toBeTruthy();
  });

  it('apresentando, o botão vira Parar de apresentar', () => {
    montar(<BarraDaSala microfone camera={false} apresentando
      aoPararDeApresentar={() => {}} />);
    expect(acharBotao(/parar de apresentar/i)).toBeTruthy();
    expect(acharBotao(/apresentar agora/i)).toBeUndefined();
  });
});

/* ── A caixa de apresentar ─────────────────────────────────────────────────── */

describe('a caixa de apresentar', () => {
  it('as três abas vêm com o mesmo peso, cada uma dizendo o que leva junto', () => {
    /*
      Nenhuma é destacada, e **é** assim no programa de verdade. Destacar a
      certa aqui seria a plataforma escolhendo pela pessoa, e o requisito 6
      pede que ela escolha. O que cada aba traz é o que ela leva junto — o dado
      que a escolha precisa, e que o sistema de verdade não escreve.
    */
    montar(<CaixaDeApresentar abas={ABAS} aba="tela-inteira" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoCancelar={() => {}} />);
    for (const a of ABAS) expect(texto(), a.nome).toContain(a.nome);
    expect(texto()).toContain(OQUE_A_ESCOLHA_LEVA_JUNTO['tela-inteira']);
    expect(container.querySelectorAll('.re-aba[aria-pressed="true"]')).toHaveLength(1);
  });

  it('a tela inteira não oferece alvo nenhum, porque não há o que escolher', () => {
    montar(<CaixaDeApresentar abas={ABAS} aba="tela-inteira" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoCancelar={() => {}} />);
    expect(container.querySelectorAll('.re-alvo')).toHaveLength(0);

    act(() => root.render(<CaixaDeApresentar abas={ABAS} aba="janela" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoCancelar={() => {}} />));
    expect(container.querySelectorAll('.re-alvo')).toHaveLength(2);
  });

  it('a caixa do som só aparece quando alguém a atende', () => {
    /* Oferecer a caixa sem quem a responda prometeria um gesto sem efeito, que
       é o que ensina a desconfiar do programa. */
    montar(<CaixaDeApresentar abas={ABAS} aba="guia" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoCancelar={() => {}} />);
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();

    act(() => root.render(<CaixaDeApresentar abas={ABAS} aba="guia" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoTrocarSom={() => {}} aoCancelar={() => {}} />));
    expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
    expect(texto()).toContain('Compartilhar também o áudio');
  });

  it('Compartilhar fica desligado enquanto ninguém o atende', () => {
    montar(<CaixaDeApresentar abas={ABAS} aba="janela" aoTrocarAba={() => {}}
      aoEscolherAlvo={() => {}} comSom={false} aoCancelar={() => {}} />);
    expect((acharBotao(/^Compartilhar$/) as HTMLButtonElement).disabled).toBe(true);
  });

  it('escolher um alvo devolve o nome dele, e não o índice', () => {
    let escolhido = '';
    montar(<CaixaDeApresentar abas={ABAS} aba="janela" aoTrocarAba={() => {}}
      aoEscolherAlvo={a => { escolhido = a; }} comSom={false} aoCancelar={() => {}} />);
    clicar([...container.querySelectorAll('.re-alvo')][1]);
    expect(escolhido).toBe(CONVERSA);
  });
});

/* ── A sala de espera ──────────────────────────────────────────────────────── */

describe('a sala de espera', () => {
  it('o pedido nomeia quem está esperando', () => {
    montar(<PedidoDeEntrar quem="Tia Joana (Tucano)" aoAdmitir={() => {}} />);
    expect(texto()).toContain('Tia Joana (Tucano)');
    expect(acharBotao(/^Admitir$/)).toBeTruthy();
    expect((acharBotao(/^Recusar$/) as HTMLButtonElement).disabled).toBe(true);
  });
});

/* ── A faixa e a folha ─────────────────────────────────────────────────────── */

describe('a faixa e a folha', () => {
  it('a faixa diz o que o programa sabe, e quem escreve o texto é o laboratório', () => {
    /* "Você está apresentando a tela inteira" é do programa; "sua lição está
       errada" seria nosso. É a regra da régua de status do Word. */
    montar(<FaixaDaSala tom="apresentando">Você está apresentando a tela inteira</FaixaDaSala>);
    expect(container.querySelector('.re-faixa[data-tom="apresentando"]')).toBeTruthy();
  });

  it('a regra do desligado vem depois das outras, e troca o fundo', () => {
    /*
      Mesma especificidade: escrita antes, ela perde, e um botão desligado sai
      azul ou vermelho, com cara de clicável. Nada estoura quando a ordem está
      errada, e o jsdom não resolve cascata nenhuma — o que se lê é a folha.
    */
    const principal = CSS_DA_SALA.indexOf('.re-bt[data-principal="sim"] {');
    const sair = CSS_DA_SALA.indexOf('.re-bt[data-sair="sim"] {');
    const desligado = CSS_DA_SALA.indexOf('.re-bt:disabled,');
    expect(principal).toBeGreaterThan(-1);
    expect(desligado, 'o desligado está antes do principal, e perde')
      .toBeGreaterThan(principal);
    expect(desligado, 'o desligado está antes do sair, e perde').toBeGreaterThan(sair);

    const regra = CSS_DA_SALA.slice(desligado);
    expect(regra.slice(0, regra.indexOf('}')), 'o desligado só troca a cor da letra')
      .toContain('background');
  });

  it('e no celular o diálogo sobe, com a regra depois da que o centra', () => {
    const centra = CSS_DA_SALA.indexOf('.re-fundo {');
    const sobe = CSS_DA_SALA.indexOf('.re-fundo { align-items: flex-start');
    expect(centra).toBeGreaterThan(-1);
    expect(sobe, 'a regra que sobe o diálogo no celular sumiu').toBeGreaterThan(centra);
  });

  it('a caixa clara diz a própria cor de título', () => {
    /* A plataforma pinta h1..h4 de quase branco, o que está certo num
       aplicativo escuro e some em cima de um diálogo branco. */
    expect(CSS_DA_SALA).toContain('.re-dialogo h3, .re-dialogo h4 { color: #202124; }');
  });
});
