// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  AcessoAoCalendario, CSS_DO_CALENDARIO, DialogoDoCalendario, GradeDeDisponibilidade,
  GradeDoMes, LateralDoCalendario, SeletorDeFuso, TopoDoCalendario,
} from './calendario';
import {
  CONVIDADOS_DA_REUNIAO, DIA_DA_REUNIAO, FUSO_DE_BRASILIA, FUSO_DO_ACRE,
  NIVEIS, NOMES_DOS_DIAS, NOME_DO_NIVEL, OQUE_O_NIVEL_NAO_DEIXA, diasDoMes, estadoEm,
} from './agenda';

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

const NIVEIS_DA_TELA = NIVEIS.map(n => ({
  id: n, nome: NOME_DO_NIVEL[n], naoDeixa: OQUE_O_NIVEL_NAO_DEIXA[n],
}));
const ITENS = [{ id: 'clube', nome: 'Clube Pioneiros', cor: '#1A73E8', ligado: true }];

/* ── As peças estão lá ─────────────────────────────────────────────────────── */

describe('a janela do calendário tem as peças que um calendário tem', () => {
  it('o alto traz o mês, as setas e o Hoje', () => {
    montar(<TopoDoCalendario titulo="junho de 2026" />);
    expect(texto()).toContain('junho de 2026');
    expect(acharBotao(/^Hoje$/)).toBeTruthy();
    expect(acharBotao(/mês anterior/i)).toBeTruthy();
    expect(acharBotao(/próximo mês/i)).toBeTruthy();
  });

  it('as setas e o Hoje ficam desligados em vez de sumir', () => {
    /*
      Um programa tem todos os comandos o tempo todo. Escondê-los ensinaria que
      o programa muda de tamanho conforme a tarefa, que é o contrário do que a
      moldura existe para fazer.
    */
    montar(<TopoDoCalendario titulo="junho de 2026" />);
    expect((acharBotao(/^Hoje$/) as HTMLButtonElement).disabled).toBe(true);
    expect((acharBotao(/mês anterior/i) as HTMLButtonElement).disabled).toBe(true);
  });

  it('a lateral não guarda estado: ela desenha o que lhe disseram', () => {
    montar(<LateralDoCalendario itens={ITENS} aoLigar={() => {}} />);
    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked)
      .toBe(true);
    act(() => root.render(<LateralDoCalendario
      itens={[{ ...ITENS[0], ligado: false }]} aoLigar={() => {}} />));
    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked)
      .toBe(false);
  });
});

/* ── A peça aparece pela presença do setter ────────────────────────────────── */

describe('a peça aparece pela presença do setter, e não sempre', () => {
  it('sem aoCriar não há Criar, e sem aoCompartilhar não há o menu do calendário', () => {
    /*
      É a regra do `aoBuscar` do Explorador: prometer um gesto que a lição não
      faz é o que ensina a desconfiar do programa. E o compartilhamento mora no
      menu de cada calendário, que é onde o programa de verdade o esconde —
      promovê-lo a um botão na superfície passaria por cima do gesto que o
      requisito 5.4 existe para fazer alguém encontrar.
    */
    montar(<LateralDoCalendario itens={ITENS} />);
    expect(acharBotao(/criar/i)).toBeUndefined();
    expect(acharBotao(/opções de/i)).toBeUndefined();

    act(() => root.render(
      <LateralDoCalendario itens={ITENS} aoCriar={() => {}} aoCompartilhar={() => {}} />));
    expect(acharBotao(/criar/i)).toBeTruthy();
    expect(acharBotao(/opções de Clube Pioneiros/i)).toBeTruthy();
  });

  it('o seletor de fuso é só de leitura sem aoMudar', () => {
    const opcoes = [
      { id: FUSO_DE_BRASILIA, nome: 'Brasília' }, { id: FUSO_DO_ACRE, nome: 'Rio Branco' },
    ];
    montar(<SeletorDeFuso valor={FUSO_DE_BRASILIA} opcoes={opcoes} />);
    expect((container.querySelector('select') as HTMLSelectElement).disabled).toBe(true);
    act(() => root.render(
      <SeletorDeFuso valor={FUSO_DE_BRASILIA} opcoes={opcoes} aoMudar={() => {}} />));
    expect((container.querySelector('select') as HTMLSelectElement).disabled).toBe(false);
  });
});

/* ── A grade do mês ────────────────────────────────────────────────────────── */

describe('a grade do mês', () => {
  it('desenha seis semanas sempre, e diz quais dias não são do mês', () => {
    /* Uma grade que mudasse de altura conforme o mês pularia debaixo do
       ponteiro na troca de mês. */
    const celulas = diasDoMes(2026, 5, '2026-06-24');
    expect(celulas).toHaveLength(42);
    expect(celulas.filter(c => c.doMes)).toHaveLength(30);
    expect(celulas.find(c => c.hoje)?.dia).toBe('2026-06-24');

    montar(<GradeDoMes celulas={celulas} chipsDoDia={() => null} />);
    expect(container.querySelectorAll('.ca-dia')).toHaveLength(42);
    expect(container.querySelectorAll('.ca-dia[data-fora="sim"]')).toHaveLength(12);
    expect(container.querySelectorAll('.ca-dia[data-hoje="sim"]')).toHaveLength(1);
  });

  it('e ela começa no domingo da semana do dia 1º, senão os nomes das colunas mentem', () => {
    /*
      Sem isso nada estoura: a grade continua com quarenta e dois dias, trinta
      deles de junho e doze de fora, e o mês parece perfeito. O que ela passa a
      fazer é desenhar quarta-feira debaixo de "dom" — e um calendário em que o
      dia cai na coluna errada é pior do que um calendário que não abre, porque
      ele se lê.

      A trava confere as duas pontas: a primeira célula é domingo, e um dia
      conhecido cai na coluna do dia da semana dele. Só a primeira deixaria
      passar uma grade certa no começo e torta no meio.
    */
    const celulas = diasDoMes(2026, 5, '2026-06-24');
    const diaDaSemana = (d: string) => new Date(`${d}T00:00:00Z`).getUTCDay();
    expect(diaDaSemana(celulas[0].dia), 'a grade não começa no domingo').toBe(0);
    for (const [i, c] of celulas.entries()) {
      expect(i % 7, `${c.dia} caiu na coluna de ${NOMES_DOS_DIAS[i % 7]}`)
        .toBe(diaDaSemana(c.dia));
    }
    /* 24 de junho de 2026 é uma quarta: a quarta coluna, contando do domingo. */
    expect(celulas.findIndex(c => c.hoje) % 7).toBe(3);
  });

  it('e fevereiro de um ano bissexto continua cabendo em seis semanas', () => {
    const fev = diasDoMes(2028, 1, '2028-02-01');
    expect(fev).toHaveLength(42);
    expect(fev.filter(c => c.doMes)).toHaveLength(29);
  });

  it('clicar num dia leva o dia daquela célula, e não o índice dela', () => {
    /* Levar o índice poria o evento no dia errado sempre que o mês não
       começasse no domingo — o que é onze meses em doze. */
    let escolhido = '';
    montar(<GradeDoMes celulas={diasDoMes(2026, 6, '2026-06-24')}
      aoClicarNoDia={d => { escolhido = d; }} chipsDoDia={() => null} />);
    clicar(acharBotao(/Criar evento em 2026-07-04/));
    expect(escolhido).toBe('2026-07-04');
  });
});

/* ── O acesso ao calendário ────────────────────────────────────────────────── */

describe('o acesso ao calendário', () => {
  it('cada nível traz escrito o que ele não deixa fazer', () => {
    /*
      Sem esse lado a fileira seria quatro palavras parecidas, e a escolha do
      requisito 5.4 viraria "clicar na primeira". É a decisão dos métodos de
      duas etapas da CC-ES005.
    */
    montar(<AcessoAoCalendario
      linhas={[{ quem: 'aguia', nome: 'Tia Rute (Águia)', nivel: 'ver-detalhes' }]}
      niveis={NIVEIS_DA_TELA} />);
    expect(texto()).toContain(OQUE_O_NIVEL_NAO_DEIXA['ver-detalhes']);
  });

  it('e sem ninguém dentro ele diz isso, em vez de abrir vazio', () => {
    /* Uma caixa que abrisse em branco faria a pessoa concluir que o programa
       não carregou. É a guarda do "zero link não é zero link quebrado". */
    montar(<AcessoAoCalendario linhas={[]} niveis={NIVEIS_DA_TELA} />);
    expect(texto()).toMatch(/ninguém além de você/i);
  });

  it('tirar o acesso fica desligado quando ninguém o atende', () => {
    montar(<AcessoAoCalendario
      linhas={[{ quem: 'aguia', nome: 'Tia Rute (Águia)', nivel: 'alterar' }]}
      niveis={NIVEIS_DA_TELA} />);
    expect((acharBotao(/tirar o acesso de Tia Rute/i) as HTMLButtonElement).disabled).toBe(true);
  });
});

/* ── A grade de disponibilidade ────────────────────────────────────────────── */

describe('a grade de disponibilidade', () => {
  const colunas = [
    { de: '12:00', ate: '13:30' }, { de: '14:00', ate: '15:30' }, { de: '18:00', ate: '19:30' },
  ];
  const pessoas = CONVIDADOS_DA_REUNIAO.map(p => ({ id: p.endereco, nome: p.nome }));
  const estadoDe = (id: string, c: { de: string; ate: string }) => {
    const p = CONVIDADOS_DA_REUNIAO.find(x => x.endereco === id);
    return p ? estadoEm(p, DIA_DA_REUNIAO, c.de, c.ate) : 'sem-acesso';
  };

  it('quem não compartilhou aparece hachurado, e nunca como livre', () => {
    /*
      Pintar de branco diria que a pessoa está livre — que é justamente a
      afirmação que ninguém tem como fazer. Livre e desconhecido cabem no mesmo
      espaço em branco, e é aí que o requisito 5.5 acontece.
    */
    montar(<GradeDeDisponibilidade pessoas={pessoas} colunas={colunas} estadoDe={estadoDe} />);
    expect(container.querySelectorAll('[data-estado="sem-acesso"]')).toHaveLength(colunas.length);
    expect(container.querySelectorAll('[data-estado="ocupado"]').length).toBeGreaterThan(0);

    const regra = CSS_DO_CALENDARIO.slice(
      CSS_DO_CALENDARIO.indexOf('.ca-celula[data-estado="sem-acesso"]'));
    expect(regra.slice(0, regra.indexOf('}')), 'sem acesso saiu pintado como livre')
      .toContain('repeating-linear-gradient');
  });

  it('e o rótulo lido em voz alta também diz sem acesso', () => {
    /*
      Quem navega por leitor de tela lê o rótulo, e não a hachura: um rótulo
      que dissesse "livre" resolveria o requisito 5.5 numa palavra, e
      resolveria errado — e só para uma parte das pessoas. É a decisão da
      linha da nuvem que não escreve o papel de ninguém.
    */
    montar(<GradeDeDisponibilidade pessoas={pessoas} colunas={colunas} estadoDe={estadoDe} />);
    const celulas = [...container.querySelectorAll('.ca-celula')]
      .map(c => c.getAttribute('aria-label') ?? '');
    expect(celulas.some(l => l.startsWith('Tio Márcio (Arara), 12:00: sem-acesso'))).toBe(true);
    expect(celulas.some(l => l.startsWith('Tio Márcio (Arara)') && l.endsWith('livre')))
      .toBe(false);
  });
});

/* ── A folha ───────────────────────────────────────────────────────────────── */

describe('a folha', () => {
  it('a regra do desligado vem depois da do principal, e não antes', () => {
    /*
      Mesma especificidade: escrita antes, ela perde, e o botão principal
      desligado sai azul e branco, com cara de clicável, e clicar não faz nada
      — que é o que ensina a desconfiar do programa. Nada estoura quando a
      ordem está errada. É a quarta vez na plataforma — CC-ES001, CC-ES004,
      CC-ES005 e aqui —, e por isso a trava lê a **ordem** na folha e não só a
      existência da regra. O jsdom não resolve cascata nenhuma.
    */
    const principal = CSS_DO_CALENDARIO.indexOf('.ca-bt[data-principal="sim"] {');
    const desligado = CSS_DO_CALENDARIO.indexOf('.ca-bt:disabled');
    expect(principal, 'a regra do principal sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'o desligado está escrito antes do principal, e perde')
      .toBeGreaterThan(principal);

    const regra = CSS_DO_CALENDARIO.slice(desligado);
    expect(regra.slice(0, regra.indexOf('}')), 'o desligado só troca a cor da letra')
      .toContain('background');
  });

  it('no celular o diálogo sobe, e a regra vem depois da que o centra', () => {
    /*
      A cápsula de tarefas da plataforma mora no canto de baixo: centrado, o
      diálogo põe Cancelar e Confirmar debaixo dela. As duas regras têm a mesma
      especificidade, e escrita antes a que sobe não valeria nada, sem nada
      estourar. É o conserto que a CC-ES001, a CC-ES004 e a CC-ES005 já
      fizeram.
    */
    const centra = CSS_DO_CALENDARIO.indexOf('.ca-fundo {');
    const sobe = CSS_DO_CALENDARIO.indexOf('.ca-fundo { align-items: flex-start');
    expect(centra, 'a regra que centra o diálogo sumiu').toBeGreaterThan(-1);
    expect(sobe, 'a regra que sobe o diálogo no celular sumiu').toBeGreaterThan(centra);
  });

  it('e a lateral deita no celular sem esconder calendário nenhum', () => {
    /* Reduzir a tela nunca reduz o que dá para fazer nela. */
    const celular = CSS_DO_CALENDARIO.slice(
      CSS_DO_CALENDARIO.indexOf('@media (max-width: 760px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.ca-corpo');
    expect(celular).toContain('flex-direction: column');
    expect(celular).not.toMatch(/\.ca-item[^{]*\{[^}]*display:\s*none/);
    expect(celular).not.toMatch(/\.ca-mes-grade[^{]*\{[^}]*display:\s*none/);
  });
});

/* ── O diálogo ─────────────────────────────────────────────────────────────── */

describe('o diálogo', () => {
  it('é um role=dialog, e o Fechar só aparece quando alguém o atende', () => {
    montar(<DialogoDoCalendario titulo="Editar evento recorrente"><p>três opções</p></DialogoDoCalendario>);
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    expect(acharBotao(/^Fechar$/)).toBeUndefined();

    act(() => root.render(
      <DialogoDoCalendario titulo="Editar evento recorrente" aoFechar={() => {}}>
        <p>três opções</p>
      </DialogoDoCalendario>));
    expect(acharBotao(/^Fechar$/)).toBeTruthy();
  });
});
