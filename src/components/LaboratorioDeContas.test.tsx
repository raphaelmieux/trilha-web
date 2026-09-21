// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeContas from './LaboratorioDeContas';
import { LICOES_DA_CC_ES005, type LicaoDaCcEs005 } from '../labs/metasDaCcEs005';
import { CAIXA_DO_CLUBE, INDICIOS, type Indicio } from '../labs/golpesDoClube';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As oito lições da CC-ES005, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs005.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a janela chama alguma delas: um botão sem
  `onClick`, um diálogo cujo OK não aplica, um painel que não marca o que se
  clicou — o motor continua correto e o laboratório fica impossível de vencer,
  que é pior do que um que abre resolvido, porque quem fez tudo certo fica
  olhando uma lista vermelha sem nada na tela que explique.

  É a razão escrita em `LaboratorioDeExplorador.test.tsx`, em
  `LaboratorioDePlanilha.test.tsx` e em `LaboratorioDePdf.test.tsx`: trava de
  motor não é trava de tela. Na CC-ES004 foi ela que achou a lição de assinar
  que ninguém conseguia fechar.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES005' } as Vereda;

function montar(licaoId: LicaoDaCcEs005) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${licaoId}`,
    tipo: 'contas',
    titulo: 'Lição de teste',
    resumo: '',
    licao: licaoId,
    verificacoes: LICOES_DA_CC_ES005[licaoId].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'contas' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeContas vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os cliques ────────────────────────────────────────────────────────────── */

const todos = <T extends Element>(s: string) => [...container.querySelectorAll<T>(s)];
const clicar = (e?: Element | null) => {
  expect(e, 'o alvo do clique não existe na tela').toBeTruthy();
  act(() => { e!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const porTexto = (t: string) =>
  todos<HTMLButtonElement>('button').find(b => (b.textContent ?? '').includes(t));
const porRotulo = (r: string) =>
  todos<HTMLButtonElement>('button').find(b => (b.getAttribute('aria-label') ?? '') === r);

/** `input.value = x` não chega ao React: ele descarta o evento quando o valor bate. */
function escrever(campo: HTMLInputElement | HTMLSelectElement, valor: string) {
  const proto = campo instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(campo, valor);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

const campo = (rotulo: string) =>
  container.querySelector<HTMLInputElement>(`input[aria-label="${rotulo}"]`);
const seletor = (rotulo: string) =>
  container.querySelector<HTMLSelectElement>(`select[aria-label="${rotulo}"]`);

/**
 * Quantas tarefas ainda faltam, lido da cápsula da moldura.
 *
 * É o número que o desbravador vê — e é ele que precisa chegar a zero, e não
 * uma conta refeita aqui. Refazê-la seria conferir o motor de novo, que já tem
 * trava própria.
 */
const faltam = () => {
  const bt = porTexto('Faltam') ?? porTexto('Concluir a lição');
  const m = /Faltam (\d+)/.exec(bt?.textContent ?? '');
  return m ? Number(m[1]) : 0;
};

const naSecao = (nome: string) => clicar(porTexto(nome));

/* ── Módulo 1: o cofre ─────────────────────────────────────────────────────── */

describe('módulo 1 — senha forte, e o cofre', () => {
  it('gerar uma senha para cada conta fecha a lição', () => {
    montar('senhas');
    expect(faltam()).toBeGreaterThan(0);

    for (const e of LICOES_DA_CC_ES005.senhas.programa === 'cofre'
      ? LICOES_DA_CC_ES005.senhas.inicial().entradas : []) {
      clicar(todos('button.cf-linha').find(b => b.textContent?.includes(e.servico)));
      clicar(porTexto('Usar esta senha'));
    }
    expect(faltam(), 'a lição do cofre não fecha clicando').toBe(0);
  });

  it('e usar a senha gerada duas vezes não põe a mesma senha em duas contas', () => {
    /*
      Sem sortear outra ao usar, o cofre da plataforma cometeria exatamente o
      erro que a lição existe para desfazer — e sem nada estourar: o medidor
      diria "forte" nas duas. Um gerenciador de verdade sorteia outra assim que
      a anterior é usada.
    */
    montar('senhas');
    const nomes = ['E-mail do clube', 'Nuvem de arquivos'];
    const guardadas: string[] = [];
    for (const n of nomes) {
      clicar(todos('button.cf-linha').find(b => b.textContent?.includes(n)));
      clicar(porTexto('Usar esta senha'));
      guardadas.push(campo('Senha')!.value);
    }
    expect(guardadas[0], 'o gerador entregou a mesma senha duas vezes')
      .not.toBe(guardadas[1]);
  });
});

/* ── Módulo 2: duas etapas ─────────────────────────────────────────────────── */

describe('módulo 2 — autenticação em duas etapas', () => {
  it('escolher o método, ativar, baixar os códigos e arrumar a recuperação', () => {
    montar('duas-etapas');
    expect(faltam()).toBe(3);

    clicar(todos('button.ct-metodo')[1]);
    clicar(porTexto('Ativar'));
    expect(faltam(), 'ativar não fechou nenhuma tarefa').toBe(2);

    clicar(porTexto('Baixar os códigos'));
    expect(faltam(), 'baixar os códigos não fechou a tarefa').toBe(1);

    clicar(porTexto('Alterar'));
    escrever(campo('Novo e-mail de recuperação')!, 'diretoria@clubepioneiros.org');
    clicar(porTexto('Salvar'));
    expect(faltam(), 'a lição das duas etapas não fecha clicando').toBe(0);
  });

  it('e fechar a caixa sem baixar deixa a tarefa dos códigos vermelha', () => {
    /* A armadilha do requisito 4.2, do lado da tela: a conta fica dizendo
       "ativada" e os códigos foram embora. */
    montar('duas-etapas');
    clicar(todos('button.ct-metodo')[1]);
    clicar(porTexto('Ativar'));
    clicar(porTexto('Fechar'));
    expect(container.querySelector('.ct-codigos'), 'a caixa não fechou').toBeNull();
    expect(container.textContent).toContain('ativada');
    expect(faltam(), 'fechar sem baixar fechou a tarefa dos códigos').toBe(2);
  });
});

/* ── Módulo 3: aplicativos ─────────────────────────────────────────────────── */

describe('módulo 3 — permissão de aplicativo', () => {
  it('remover os dois abandonados e deixar o que o clube usa', () => {
    montar('aplicativos');
    naSecao('Aplicativos conectados');
    expect(faltam()).toBe(2);

    clicar(porRotulo('Remover o acesso de FotoMágica Filtros'));
    clicar(porRotulo('Remover o acesso de Sorteador de Brindes'));
    expect(faltam(), 'a lição dos aplicativos não fecha clicando').toBe(0);
  });

  it('e remover os três deixa as duas tarefas vermelhas', () => {
    montar('aplicativos');
    naSecao('Aplicativos conectados');
    clicar(porRotulo('Remover o acesso de FotoMágica Filtros'));
    clicar(porRotulo('Remover o acesso de Sorteador de Brindes'));
    clicar(porRotulo('Remover o acesso de Formulários do Clube'));
    expect(faltam(), 'revogar todos fechou a lição').toBe(2);
  });
});

/* ── Módulo 4: vazamento ───────────────────────────────────────────────────── */

describe('módulo 4 — vazamento de dados', () => {
  it('consultar os dois endereços e trocar a senha que vazou', () => {
    montar('vazamento');
    expect(faltam()).toBe(3);

    clicar(porTexto('Consultar'));
    expect(container.textContent, 'a consulta não mostrou o vazamento')
      .toContain('Loja de Camisetas Online');
    expect(faltam()).toBe(2);

    escrever(campo('Endereço a consultar')!, 'marta.oliveira@gmail.com');
    clicar(porTexto('Consultar'));
    expect(faltam()).toBe(1);

    clicar(porTexto('Trocar a senha'));
    escrever(campo('Nova senha')!, 'frase longa e unica do clube');
    clicar(porTexto('Salvar'));
    expect(faltam(), 'a lição do vazamento não fecha clicando').toBe(0);
  });

  it('e a consulta de um endereço que não consta não diz que ele está seguro', () => {
    montar('vazamento');
    escrever(campo('Endereço a consultar')!, 'ninguem@exemplo.org');
    clicar(porTexto('Consultar'));
    expect(container.textContent).toContain('listas públicas consultadas');
    expect(container.textContent?.toLowerCase()).not.toContain('está seguro');
  });
});

/* ── Módulo 5: privacidade ─────────────────────────────────────────────────── */

describe('módulo 5 — configurações de privacidade', () => {
  it('fechar os três ajustes de gente fecha a lição', () => {
    montar('privacidade');
    naSecao('Privacidade');
    expect(faltam()).toBe(2);

    escrever(seletor('Quem pode ver a lista de membros')!, 'só a diretoria');
    escrever(seletor('Quem pode ver os telefones cadastrados')!, 'só a diretoria');
    escrever(seletor('Publicar o local junto das fotos')!, 'não');
    expect(faltam(), 'a lição da privacidade não fecha clicando').toBe(0);
  });

  it('e "deixar tudo privado" tira o clube da busca e não fecha nada', () => {
    montar('privacidade');
    naSecao('Privacidade');
    clicar(porTexto('Deixar tudo privado'));
    expect(seletor('A página do clube aparece em sites de busca')!.value).toBe('não');
    expect(faltam(), 'fechar tudo fechou a lição').toBe(2);
  });
});

/* ── Módulo 6: mensagens fraudulentas ──────────────────────────────────────── */

describe('módulo 6 — mensagem fraudulenta', () => {
  const analisar = (m: typeof CAIXA_DO_CLUBE[number]) => {
    clicar(todos('button.co-linha').find(b => b.textContent?.includes(m.deNome)));
    for (const i of m.indicios as Indicio[]) {
      clicar(todos('button.co-indicio').find(b => b.textContent?.includes(INDICIOS[i].nome)));
    }
    /* Toda mensagem pede um veredito: sem um gesto para "li e é verdadeira",
       não ter opinião seria indistinguível de nunca ter aberto a mensagem. */
    clicar(porTexto(m.indicios.length > 0 ? 'É golpe' : 'É verdadeira'));
    clicar(porTexto('Voltar à caixa de entrada'));
  };

  it('apontar os indícios de cada uma e denunciar só as três fecha a lição', () => {
    montar('golpes');
    expect(faltam()).toBe(2);
    for (const m of CAIXA_DO_CLUBE) analisar(m);
    expect(faltam(), 'a lição das mensagens não fecha clicando').toBe(0);
  });

  it('e denunciar a mensagem verdadeira deixa a segunda tarefa vermelha', () => {
    montar('golpes');
    for (const m of CAIXA_DO_CLUBE) analisar(m);
    clicar(todos('button.co-linha').find(b => b.textContent?.includes('Marta')));
    clicar(porTexto('É golpe'));
    expect(faltam(), 'acusar a mensagem verdadeira passou').toBe(1);
  });

  it('e o destino de verdade do link aparece ao apontá-lo', () => {
    /* É o único indício que não se vê sem parar o ponteiro em cima. Sem esta
       barra, o requisito 5 pediria para apontar o que não está à vista. */
    montar('golpes');
    clicar(todos('button.co-linha').find(b => b.textContent?.includes('Banco do Brasil')));
    const link = container.querySelector('a.co-link')!;
    act(() => { link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); });
    expect(container.querySelector('.co-destino')?.textContent)
      .toContain('bb-atendimento-cliente.com/verificar');
  });
});

/* ── Módulo 7: a conta invadida ────────────────────────────────────────────── */

describe('módulo 7 — quando a conta cai', () => {
  it('a ordem inteira, clicando, fecha a lição', () => {
    montar('invasao');
    expect(faltam()).toBe(6);
    expect(container.textContent, 'o serviço não avisou nada')
      .toContain('Atividade incomum');

    clicar(porTexto('Trocar a senha'));
    escrever(campo('Nova senha')!, 'frase longa e unica do clube');
    clicar(porTexto('Salvar'));

    clicar(porTexto('Alterar'));
    escrever(campo('Novo e-mail de recuperação')!, 'diretoria@clubepioneiros.org');
    clicar(porTexto('Salvar'));

    naSecao('Aplicativos conectados');
    clicar(porRotulo('Remover o acesso de Sincronizador de Contas'));

    naSecao('Atividade da conta');
    clicar(porRotulo('Apagar a regra que copia para recuperacao.seguranca2026@outlook.com'));

    naSecao('Segurança');
    clicar(todos('button.ct-metodo')[1]);
    clicar(porTexto('Ativar'));
    clicar(porTexto('Baixar os códigos'));

    expect(faltam(), 'a lição da invasão não fecha clicando').toBe(0);
    expect(container.textContent, 'o aviso do serviço ficou de pé sem porta aberta')
      .not.toContain('Atividade incomum');
  });

  it('encerrar a sessão antes de trocar a senha traz o intruso de volta', () => {
    /*
      É a lição do requisito 6 acontecendo na tela: a sessão da Marta sai e a
      do intruso volta, agora marcada "agora mesmo". Uma simulação que o
      mantivesse fora depois de um clique ensinaria que a ordem dá na mesma.
    */
    montar('invasao');
    naSecao('Atividade da conta');
    clicar(porRotulo('Encerrar a sessão em Celular Android'));
    expect(container.textContent).toContain('Windows — navegador desconhecido');
    expect(container.textContent, 'o intruso não voltou').toContain('agora mesmo');
    expect(container.textContent, 'a sessão da secretária continuou aberta')
      .not.toContain('Celular Android');
  });
});

/* ── Módulo 8: o plano de contas ───────────────────────────────────────────── */

describe('módulo 8 — o plano de contas do clube', () => {
  it('passar para o clube, trocar as senhas, dar acesso e tirar quem saiu', () => {
    montar('plano');
    expect(faltam()).toBe(4);

    const entradas = LICOES_DA_CC_ES005.plano.programa === 'cofre'
      ? LICOES_DA_CC_ES005.plano.inicial().entradas : [];

    for (const e of entradas) {
      clicar(todos('button.cf-linha').find(b => b.textContent?.includes(e.servico)));
      if (e.dono === 'pessoa') clicar(porTexto('Passar para a conta do clube'));
      /* Trocar a senha de toda conta que ela abria: tirar o nome da lista não
         faz ninguém esquecer o que digitou por três anos. */
      if (e.acesso.includes('Marta')) clicar(porTexto('Usar esta senha'));
      for (const quem of ['Ronaldo', 'Cleide']) {
        const bt = porTexto(`Dar acesso a ${quem}`);
        if (bt) clicar(bt);
      }
      const tirar = porRotulo('Tirar o acesso de Marta');
      if (tirar) clicar(tirar);
    }

    expect(faltam(), 'a lição do plano não fecha clicando').toBe(0);
  });

  it('e tirar o acesso dela sem trocar a senha deixa uma tarefa vermelha', () => {
    montar('plano');
    const entradas = LICOES_DA_CC_ES005.plano.programa === 'cofre'
      ? LICOES_DA_CC_ES005.plano.inicial().entradas : [];
    for (const e of entradas) {
      clicar(todos('button.cf-linha').find(b => b.textContent?.includes(e.servico)));
      if (e.dono === 'pessoa') clicar(porTexto('Passar para a conta do clube'));
      for (const quem of ['Ronaldo', 'Cleide']) {
        const bt = porTexto(`Dar acesso a ${quem}`);
        if (bt) clicar(bt);
      }
      const tirar = porRotulo('Tirar o acesso de Marta');
      if (tirar) clicar(tirar);
    }
    expect(faltam(), 'tirar o acesso sem trocar a senha fechou a lição').toBe(1);
  });
});

/* ── O Recomeçar volta ao começo ───────────────────────────────────────────── */

describe('o Recomeçar devolve a lição ao estado de partida', () => {
  it('nos três programas', () => {
    /* Recomeçar é a saída de quem estragou o exercício — e a caixa dos códigos
       de reserva é o caso em que ela é a **única** saída, porque eles não
       voltam. */
    for (const id of ['senhas', 'duas-etapas', 'golpes'] as LicaoDaCcEs005[]) {
      montar(id);
      const antes = faltam();
      if (id === 'senhas') {
        clicar(todos('button.cf-linha')[0]);
        clicar(porTexto('Usar esta senha'));
      } else if (id === 'duas-etapas') {
        clicar(todos('button.ct-metodo')[1]);
        clicar(porTexto('Ativar'));
      } else {
        clicar(todos('button.co-linha')[0]);
        clicar(todos('button.co-indicio')[0]);
        clicar(porTexto('Voltar à caixa de entrada'));
      }
      clicar(porTexto('Recomeçar'));
      expect(faltam(), `${id}: Recomeçar não voltou ao começo`).toBe(antes);
      act(() => root.unmount());
      container.remove();
      montar(id);
    }
  });
});
